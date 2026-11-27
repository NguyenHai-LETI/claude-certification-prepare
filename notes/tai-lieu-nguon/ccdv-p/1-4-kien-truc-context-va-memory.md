---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-4-kien-truc-context-va-memory
ngay_tai: 2026-11-27
tieu_de: Kiến trúc context và memory cho agent chạy lâu - tool search, context editing, compaction, đổi chỉ dẫn giữa chừng
---

Domain 1: Advanced Agent Architecture and Orchestration · Task 1.4

# Kiến trúc context và memory cho agent chạy lâu - tool search, context editing, compaction, đổi chỉ dẫn giữa chừng

Agent chạy lâu chạm giới hạn context hay trần chi phí thì chọn cách nào - tool search, dọn kết quả tool, compaction, system message giữa chừng, memory.

- 18 phút đọc
- Đối chiếu docs 21/11/2026
- 16 nguồn

## Đọc xong bạn nắm được

- Tìm ra token đang tốn vào đâu (định nghĩa tool, kết quả tool, hội thoại dài, kiến thức lặp lại) rồi chọn đúng kỹ thuật cho nguồn đó
- Giữ catalog hàng trăm tool ngoài context bằng tool search, và gộp nhiều lần gọi tool nhỏ liên tiếp vào một đoạn code bằng programmatic tool calling
- Chọn giữa context editing, compaction on-demand và compaction theo ngưỡng, và viết instructions để bản tóm tắt không làm rơi điều quan trọng
- Đổi chỉ dẫn, bộ tool hay effort giữa hội thoại mà không làm invalidate prompt cache
- Đưa thứ cần nhớ qua nhiều session ra memory, và biết memory đi cùng context editing thế nào

Agent trả lời một câu hỏi rồi thôi thì context ít khi là vấn đề. Agent chạy cả một ca trực và gọi tool hàng trăm lần thì sớm muộn sẽ gặp một trong hai giới hạn. Hoặc context (toàn bộ thứ model đọc trong một request, gồm định nghĩa tool, chỉ dẫn và lịch sử hội thoại) gần đầy, hoặc chi phí mỗi lượt vượt ngân sách. Có nhiều kỹ thuật để giảm token, nhưng mỗi kỹ thuật chỉ xử lý được một nguyên nhân làm context phình to. Chọn sai kỹ thuật thì làm xong vẫn không đỡ.

Bài này giúp bạn trả lời: token của agent đang tốn vào đâu, với từng chỗ tốn thì dùng kỹ thuật nào, và muốn đổi chỉ dẫn giữa chừng thì làm sao để không phải trả tiền ghi cache lại từ đầu?

Tên task trong đề là **Context and Memory Architecture**. Nó gồm việc chọn cách xử lý context (**context-policy options**) cho agent chạy lâu (**long-running agents**) khi sắp chạm giới hạn context (**context limits**) hay trần chi phí (**cost ceilings**). Các cách đó là nén và chỉnh sửa context (**context compaction and editing**), memory bền qua nhiều session (**persistent memory**), đổi chỉ dẫn giữa hội thoại mà vẫn giữ cache (**cache-safe instruction changes mid-conversation**), và các kỹ thuật dùng tool giữ catalog tool lớn ngoài context window (**tool-use techniques that keep large tool catalogs out of the context window**).

Nếu bạn chưa nắm các khái niệm nền như context rot, dọn kết quả tool hay nén hội thoại, hãy đọc bài 6.1 của CCDV-F trước. Prompt caching có ở bài 5.4.

**Sơ đồ: Token tốn ở chỗ nào trong request thì dùng kỹ thuật dành cho chỗ đó**
_Bản đồ bài: các phần của request tốn token và kỹ thuật xử lý từng phần_

- **REQUEST GỬI LẠI MỖI LƯỢT**
- **KỸ THUẬT XỬ LÝ**
- **tools**
- **system**
- **messages**: session sau
- **định nghĩa tool**: gửi lại ở mọi request
- **Prompt caching · Tool search**: cache: rẻ hơn · defer_loading: ít hơn
- **chỉ dẫn cần đổi**: giữa hội thoại
- **Mid-conversation system message**: thêm vào messages, không sửa system
- **chuỗi gọi tool nhỏ**: và kết quả trung gian
- **Programmatic tool calling**: chỉ output cuối của code vào context
- **kết quả tool cũ**: đọc xong vẫn nằm lại
- **Context editing**: clear_tool_uses xoá kết quả tool cũ
- **hội thoại dài**: cả lịch sử phình to
- **Compaction**: block compaction thay các message cũ
- **điều cần nhớ**: học từ session trước
- **Memory tool**: ghi vào /memories, đọc lại khi cần

## Ví dụ xuyên suốt: agent trực đêm của một công ty vận hành điện mặt trời

Một công ty vận hành 40 trang trại điện mặt trời dùng agent để giúp kỹ sư trực đêm điều tra lỗi inverter, tức bộ biến tần đổi điện một chiều từ tấm pin sang điện xoay chiều. Đội tự viết harness, phần code chạy vòng lặp gọi model rồi gọi tool, trên Messages API, và dùng model Claude Opus 5.5. Mỗi session kéo dài cả một ca trực tám đến mười tiếng, với ngân sách 25 USD mỗi ca.

Tool của agent đến từ năm MCP server, mỗi server cung cấp một nhóm tool theo chuẩn MCP. Harness tự kết nối tới các server này rồi khai tool của chúng vào request như tool bình thường. Năm server gồm:

- SCADA, hệ thống giám sát vận hành, với 62 tool.
- CMMS, hệ thống quản lý bảo trì, với 41 tool.
- Vật tư, với 18 tool.
- Thời tiết, với 6 tool.
- Slack, với 11 tool.

## Token đang tốn vào đâu

Chọn model có context window lớn hơn không giải quyết được chuyện này. Opus 5.5 có context window 1 triệu token, nhưng context càng dài thì model càng khó nhớ đúng thông tin nằm trong đó, hiện tượng gọi là **context rot**. Lý do là model chỉ có một lượng chú ý hữu hạn (**attention budget**), nên mỗi token thêm vào context lấy bớt chú ý của các token khác. Toàn bộ lịch sử còn bị gửi lại ở mỗi lượt, nên lượt sau đắt hơn lượt trước. Vì vậy mục tiêu là chỉ để trong context những gì agent thật sự cần, càng ít token càng tốt.

Muốn vậy thì trước hết phải biết token đang tốn vào đâu. Bảng sau xếp các chỗ hay tốn token cạnh kỹ thuật xử lý chỗ đó, và từng kỹ thuật được giải thích ở các mục bên dưới.

| Token tốn vào | Kỹ thuật | Trong ví dụ |
| --- | --- | --- |
| Định nghĩa tool lặp lại y nguyên ở mọi request | Prompt caching | Đọc từ cache rẻ hơn nhiều so với input thường |
| Định nghĩa tool nạp sẵn trong mọi request | Tool search (`defer_loading`) | 138 tool, khoảng 96.000 token |
| Chuỗi lần gọi tool nhỏ và kết quả trung gian của chúng | Programmatic tool calling | Lấy số liệu của 24 inverter rồi so với nhau |
| Kết quả tool cũ nằm lại trong lịch sử | Context editing | Số liệu SCADA đã đọc xong |
| Cả hội thoại dài | Compaction | Ca trực mười tiếng |
| Điều phải học lại ở mỗi session | Memory | Lỗi báo giả của inverter số 7 |

Với một agent chạy nhiều, nên thêm các kỹ thuật theo thứ tự sau. Đầu tiên, bật prompt caching cho phần định nghĩa tool ngay từ request đầu. Lần ghi vào cache đắt hơn giá input thường 25%, nhưng request thứ hai đọc lại từ cache là đã hoà vốn. Caching không làm context ít token đi, nó chỉ làm số token đó rẻ hơn ở các request sau. Khi có từ 10 tool trở lên, hoặc định nghĩa tool đã chiếm một phần đáng kể của context, thì thêm tool search. Khi hội thoại kéo dài tới mức kết quả tool đầu tiên không còn dùng tới, thì thêm context editing. Còn nếu thấy agent cứ lặp lại một chuỗi lần gọi tool nhỏ, thì cân nhắc programmatic tool calling.

> **Trong đề chọn gì**
>
> Khi đề mô tả agent sắp đầy context hay vượt ngân sách, xem token đang tốn vào đâu (định nghĩa tool, kết quả tool cũ, hay hội thoại dài) rồi chọn đáp án xử lý đúng chỗ đó. Đáp án "đổi sang model có context window lớn hơn" không chữa được context rot, cũng không làm mỗi lượt rẻ đi.

## Giữ catalog tool lớn ngoài context

Riêng phần định nghĩa của 138 tool đã chiếm khoảng 96.000 token trong mỗi request, khi agent còn chưa làm gì. Agent còn chọn nhầm tool. Trong một ca ở những đêm đầu, nó gọi nhầm 11 trên 120 lần, phần lớn là nhầm giữa các tool SCADA có tên gần giống nhau, như gọi `scada_get_string_current` khi cần `scada_get_inverter_alarm`. Có hai kỹ thuật giảm token do tool gây ra. Tool search giữ định nghĩa của catalog tool lớn ngoài context, còn programmatic tool calling giữ kết quả trung gian của nhiều lần gọi tool ngoài context.

### Tool search

Với tool search, Claude không phải đọc hết 138 tool mà tự tìm tool mình cần. Bạn vẫn gửi đủ định nghĩa mọi tool trong request, nhưng đánh dấu `defer_loading: true` cho những tool không cần nạp sẵn, rồi thêm một tool chuyên để tìm tool. Có hai bản. Với `tool_search_tool_regex_20251119`, Claude tìm bằng biểu thức regex. Với `tool_search_tool_bm25_20251119`, Claude tìm bằng câu mô tả bình thường.

Lúc đầu Claude chỉ thấy tool tìm kiếm và các tool nạp sẵn. Khi cần một tool khác, Claude gọi tool tìm kiếm. API trả về các tham chiếu `tool_reference`, mặc định tối đa 5, rồi tự thay mỗi tham chiếu bằng định nghĩa đầy đủ của tool đó trước khi đưa cho Claude.

Ngoài tiết kiệm token, tool search còn giúp Claude chọn đúng hơn. Khi phải chọn giữa quá 30–50 tool cùng lúc, Claude dễ chọn nhầm, còn với tool search thì mỗi lần Claude chỉ thấy vài tool liên quan. Khi dùng tool search, nên giữ 3–5 tool hay dùng nhất ở dạng nạp sẵn. Đặt tên tool có tiền tố theo dịch vụ, như `scada_` hay `cmms_`, để một lần tìm là ra cả nhóm. Đặt `cache_control` trên tool nạp sẵn, không đặt trên tool có `defer_loading`.

Đội đặt `defer_loading` cho 133 tool và giữ 5 tool hay dùng ở dạng nạp sẵn. Phần định nghĩa nạp sẵn còn khoảng 4.000 token, và trong ca sau đó agent chỉ gọi nhầm 2 trên 120 lần.

### Programmatic tool calling

Bình thường, mỗi lần gọi tool tốn một lượt. Claude trả về một block `tool_use` (yêu cầu gọi tool), harness chạy tool rồi gửi lại block `tool_result` (kết quả), và kết quả đó nằm lại trong context. Với programmatic tool calling, Claude viết một đoạn Python gọi nhiều tool một lúc, và đoạn code đó chạy trong code execution tool, bản `code_execution_20260120` trở lên. Tool nào được phép gọi từ code thì bạn khai trong trường `allowed_callers` của định nghĩa tool đó. Kết quả trung gian chỉ nằm trong code, không vào context, và chỉ output cuối của đoạn code quay về cho Claude.

Giả sử agent cần so dòng điện của 24 inverter. Gọi tool 24 lần, mỗi lần nhận về khoảng 18.000 token, thì context nặng thêm khoảng 432.000 token. Khi Claude viết việc này thành code, nó chỉ nhận lại một bảng 5 dòng ghi những inverter bị lệch.

**Sơ đồ: Hai kỹ thuật cùng để phần nặng ở ngoài context, chỉ phần Claude cần mới đi vào**
- Context Claude đọc mỗi lượt
- Ngoài context
- tool search
- chỉ output cuối
- 133 toolđặt defer_loading
- Giả sử so 24 inverter:code gọi SCADA 24 lần,khoảng 432.000 token
- 5 tool nạp sẵn + tool vừa tìmkhoảng 4.000 token,thay vì 96.000
- Bảng 5 dòngghi inverter bị lệch

Có hai loại tool không gọi từ code được. Loại đầu là tool đến qua MCP connector, tức các MCP server do API kết nối giúp bạn thay vì harness tự kết nối. Đó cũng là lý do đội tự kết nối MCP server trong harness. Loại thứ hai là tool có `strict: true`, chế độ bắt tham số phải đúng schema. Ngoài ra, `allowed_callers` chỉ là hướng dẫn cho Claude, không phải ranh giới bảo mật, nên đừng dùng nó để chặn quyền gọi tool.

## Dọn kết quả tool và nén hội thoại

Mỗi lần agent lấy chuỗi số liệu từ SCADA, tool trả về khoảng 18.000 token, và mọi kết quả cũ vẫn nằm trong lịch sử. Tới 03:40, context lên 610.000 token và câu trả lời của agent bắt đầu lẫn lộn giữa các inverter. Đội gọi compaction, tức cho Claude tóm tắt phần hội thoại cũ để thay cho nguyên văn, với prompt tóm tắt mặc định. Bản tóm tắt bỏ mất chuyện sáu inverter đã được kiểm cáp DC từ đầu ca, nên agent đi kiểm lại cả sáu, mất hai giờ.

Lịch sử dài có hai kỹ thuật xử lý. Context editing (**context editing**) xoá bớt kết quả tool cũ theo luật bạn đặt. Compaction (**context compaction**) thay cả đoạn hội thoại cũ bằng một bản tóm tắt.

### Context editing

Context editing là việc API tự xoá bớt nội dung cũ khỏi prompt ngay trên server, trước khi prompt tới Claude. Tính năng này cần beta `context-management-2025-06-27`. Lịch sử phía client của bạn vẫn còn nguyên, chỉ bản Claude đọc là gọn đi.

Kiểu xoá hay dùng nhất là `clear_tool_uses_20250919`. Theo mặc định, khi input vượt 100.000 token, nó xoá kết quả tool từ cũ nhất trở đi, và giữ lại 3 lần gọi tool gần nhất cùng kết quả của chúng. Tool nào không bao giờ được xoá thì bạn liệt kê trong `exclude_tools`. Ở trang trại, kết quả của `cmms_get_work_order` (lệnh công việc lấy từ CMMS) còn cần tới cuối ca, nên đội đưa tool này vào `exclude_tools`. Còn `clear_thinking_20251015` thì cho bạn chọn giữ lại thinking (phần suy nghĩ Claude viết ra trước câu trả lời) của bao nhiêu lượt gần nhất.

Mỗi lần xoá kết quả tool là **prompt cache bị invalidate** từ chỗ bị xoá trở đi, và bạn phải trả tiền ghi cache lại cho phần sau. Vì vậy có tham số `clear_at_least`. Nếu lần xoá đó không bỏ được ít nhất chừng ấy token, API sẽ không xoá, để khỏi mất cache mà chẳng được bao nhiêu.

### Compaction

Compaction có hai cách gọi, khác nhau ở chỗ ai quyết định lúc nén:

|   | On demand | Theo ngưỡng |
| --- | --- | --- |
| Ai quyết lúc nén | Bạn, bằng một request riêng (beta `compact-2026-09-04`) | API tự nén khi input chạm ngưỡng, bật bằng edit `compact_20260112` trong context management (beta `compact-2026-01-12`) |
| Ngưỡng | Code của bạn tự tính | Mặc định 150.000 token |
| Agent làm tiếp được trong lúc bản tóm tắt đang viết | Có, với cách nén trong background | Không, nén chạy ngay trong request chạm ngưỡng |

Nên chọn on demand ở mọi nơi có hỗ trợ, vì bạn tự quyết lúc nào nén và agent không phải dừng chờ. API trả bản tóm tắt về trong một block `compaction`, kèm trường `signature`. Từ request sau, bạn đặt block này ở đầu `messages` thay cho các message cũ đã được tóm tắt, và gửi lại đúng y như lúc nhận, không thêm bớt field nào.

Bản tóm tắt mặc định không biết điều gì quan trọng với việc của bạn. Nội dung bạn ghi vào trường `instructions` sẽ thay hẳn prompt tóm tắt mặc định. Vì vậy hãy viết rõ những gì phải giữ lại, và dặn Claude không gọi tool, vì nếu không dặn, Claude có thể gọi tool thay vì viết bản tóm tắt. Sơ đồ sau so hai cách đội đã làm.

**Sơ đồ: Compaction thay phần cũ bằng bản tóm tắt, nên điều instructions không dặn giữ có thể mất**
_Messages lúc 03:40 được thay bằng block compaction: bản mặc định mất việc đã làm, bản có instructions giữ lại_

- **MESSAGES LÚC 03:40 · 610.000 TOKEN**
- **6 inverter đã kiểm cáp DC**
- **các giả thuyết đã loại**: kết quả SCADA, 18.000 token
- kết quả SCADA, 18.000 token
- … hàng trăm lượt khác
- các lượt gần nhất
- **Compaction không instructions**
- **BLOCK COMPACTION THIẾU**: ✗ 6 inverter đã kiểm cáp DC
- ✗ các giả thuyết đã loại
- các lượt
- gần nhất
- **Agent kiểm lại cáp DC của 6 inverter**: mất 2 giờ cho việc đã làm từ đầu ca
- **Compaction on demand có instructions**
- **BLOCK COMPACTION GIỮ**: ✓ 6 inverter đã kiểm cáp DC
- ✓ các giả thuyết đã loại
- ✓ việc đang làm dở
- các lượt
- gần nhất
- **Agent không phải kiểm lại inverter nào**

Sau compaction, những gì nằm trong phần bị tóm tắt sẽ biến mất khỏi context, kể cả ảnh, tài liệu, URL agent đã fetch, cùng các chỉ dẫn và mức effort bạn đặt giữa hội thoại (mục sau nói về loại chỉ dẫn này). Thứ nào agent vẫn cần thì bạn phải gửi lại.

## Đổi chỉ dẫn giữa chừng mà không làm invalidate cache

Lúc 02:10, bên điều độ lưới điện yêu cầu trang trại giảm công suất phát. Để tránh agent tự ý thao tác trong lúc đó, đội quyết định từ giờ agent chỉ được đọc số liệu, không được gửi lệnh điều khiển inverter. Lúc này đội đã bật tool search, nên phần `tools` chỉ còn khoảng 4.000 token, còn hội thoại đã dài khoảng 540.000 token. Dev thêm chỉ dẫn này vào trường `system` của request, và lượt kế tiếp tốn khoảng 2,8 USD thay vì 0,23 USD như thường lệ. Một lượt đó đã ngốn khoảng một phần chín ngân sách 25 USD của cả ca.

Tình huống này là đổi chỉ dẫn giữa hội thoại mà vẫn giữ được cache (**cache-safe instruction changes mid-conversation**). Muốn làm đúng, trước hết cần hiểu vì sao sửa `system` làm mất cache. API ghép request theo thứ tự `tools`, rồi `system`, rồi `messages`, và prompt cache chỉ hit khi phần đầu (prefix) của request giống hệt bản đã cache tới từng byte. Sửa `system` là mất cache của system và toàn bộ hội thoại phía sau nó. Sửa `tools` còn tệ hơn, vì `tools` đứng đầu nên mất cache của cả request.

Cách làm đúng là dùng **mid-conversation system message**. Thay vì sửa trường `system`, bạn thêm một message có `"role": "system"` vào mảng `messages`, ngay chỗ chỉ dẫn bắt đầu áp dụng. Prefix cũ không đổi nên vẫn đọc được từ cache, và chỉ message mới bị tính như input mới. Số tiền trong sơ đồ tính theo giá Opus 5.5, ghi cache 5 USD và đọc cache 0,20 USD mỗi triệu token.

**Sơ đồ: Sửa system làm vỡ cache từ system trở đi, còn thêm system message ở cuối thì prefix cũ vẫn khớp**
_Hai cách thêm chỉ dẫn chỉ đọc lúc 02:10 và phần prefix còn đọc được từ cache_

- **PREFIX GHÉP THEO THỨ TỰ TOOLS → SYSTEM → MESSAGES**
- **Sửa trường system lúc 02:10**
- **tools**: cache hit
- **system**: + “chỉ đọc”
- **messages**: 540.000 token, ghi cache lại
- **user**: lượt mới
- cache khớp tới đây
- **Lượt này tốn khoảng 2,8 USD, lượt thường chỉ khoảng 0,23 USD**: System và 540.000 token hội thoại phải ghi cache lại, giá 5 USD mỗi triệu token
- **Thêm system message ở cuối messages**
- **tools**: cache hit
- **system**: giữ nguyên
- **messages**: 540.000 token, đọc cache
- **user**: lượt mới
- **system**: “chỉ đọc”
- cache khớp tới đây
- **Lượt này tốn khoảng 0,24 USD**: Prefix cũ đọc từ cache, giá 0,20 USD mỗi triệu token, chỉ message mới là input mới

Nếu đội thêm chỉ dẫn "chỉ đọc" bằng system message ở cuối `messages`, lượt kế tiếp chỉ tốn khoảng 0,24 USD, gần bằng một lượt thường.

Khi dùng system message giữa hội thoại, bạn cần nắm mấy luật sau, nếu không thì request sẽ lỗi, hoặc vẫn mất cache.

- System message được coi là lời của operator, tức bạn, bên dựng ứng dụng. Khi mâu thuẫn, nó thắng message `user` của người dùng cuối. Giữa các chỉ dẫn của operator thì cái gửi sau thắng, nên system message mới thắng cả system message cũ lẫn trường `system` ở đầu request.
- System message phải đứng ngay sau một lượt `user`, kể cả lượt chỉ chứa `tool_result`. Nó không được là message đầu tiên, và không được chen giữa `tool_use` với `tool_result` trả lời nó. Đặt sai chỗ thì API trả lỗi 400.
- Đã gửi system message rồi thì đừng sửa hay xoá nó, vì làm vậy cũng mất cache. Trên các model giữ lại thinking giữa các lượt (**preserved thinking**), sửa hay xoá còn làm thinking của các lượt phía sau không dùng được nữa. Chỉ dẫn chỉ dùng cho một lượt thì đặt `clear_at: "next_user_message"` (beta) để nó tự hết hiệu lực. Message đó vẫn phải nằm y nguyên trong `messages` ở các request sau, chỉ là không còn tác dụng.
- Bộ tool và effort (mức Claude suy nghĩ kỹ tới đâu trước khi trả lời) cũng đổi được bằng cách này. Thêm tool bằng block `tool_addition`, bỏ tool bằng `tool_removal`, đổi effort bằng `output_config.effort` trong system message. Cả ba đều đang beta. Tool được thêm phải được khai sẵn trong `tools` từ đầu (có thể đặt `defer_loading: true` để giấu tới lúc thêm), nhờ vậy `tools` không đổi và cache không mất.
- Đừng đặt nội dung không tin cậy, như văn bản lấy từ email hay trang web, vào system message, vì nó sẽ có quyền của operator.
- Lần compaction lúc 03:40 tóm tắt luôn đoạn có chỉ dẫn "chỉ đọc" gửi lúc 02:10. Sau lần nén đó, đội phải gửi lại chỉ dẫn này bằng một system message mới, nếu không agent sẽ quên mất.

Tính năng này có trên Opus 5.5, Sonnet 5.5, Haiku 5.5 và vài model khác, nhưng không có trên Sonnet 5. Nếu agent chạy trên Managed Agents, dịch vụ Anthropic host agent giúp bạn (bài 1.3), thì gửi event `system.message` thay cho message trong request.

## Memory cho điều cần nhớ qua nhiều session

Đêm nào agent cũng mất nửa giờ học lại một điều đã biết từ trước. Inverter số 7 ở trang trại Ninh Thuận 3 chạy firmware 2.4, và hay báo lỗi cách điện giả. Mỗi ca là một session mới, nên điều đã học ở ca trước không còn trong context. Đây là việc của memory bền (**persistent memory**).

Memory tool cho Claude đọc và ghi file trong thư mục `/memories`. Thật ra Claude chỉ ra lệnh, còn code của bạn mới là bên đọc ghi file, trên storage do bạn chọn (bài 1.2). Nếu bật memory tool cùng context editing, Claude sẽ nhận cảnh báo khi context gần tới ngưỡng xoá. Nhờ vậy Claude kịp ghi điều quan trọng vào memory trước khi kết quả tool bị xoá.

Agent ghi vào `/memories/ninh-thuan-3.md` một dòng: "Inverter 7, firmware 2.4: lỗi cách điện báo giả khi độ ẩm trên 90%, đo tay trước khi cử người". Sang ca sau, agent chỉ cần đọc file này lúc đầu ca là biết. Cách làm này gọi là truy xuất "just in time". Context chỉ giữ tham chiếu nhẹ như tên file hay đường dẫn, còn nội dung thì tới lúc cần agent mới nạp, nên không tốn token cho thứ chưa dùng.

Dùng lâu ngày, memory sẽ có ghi chú trùng nhau và ghi chú đã lỗi thời. Trên Managed Agents có tính năng **dreams** (đang research preview) để dọn việc này. Dreams đọc một memory store, tức nơi chứa các file memory, cùng tối đa 100 transcript (bản ghi các session cũ), rồi tạo một store mới đã gộp ghi chú trùng và cập nhật ghi chú cũ. Store cũ vẫn giữ nguyên, để bạn so trước khi chuyển sang store mới.

> **Bẫy đề**
>
> Context lên 610.000 token, agent trả lời lẫn lộn giữa các inverter, và lần đổi chỉ dẫn lúc 02:10 tốn 2,8 USD cho một lượt. Ba cách sửa nghe hợp lý nhưng sai:
>
> - **Đổi sang model có context window lớn hơn** (_move to a larger context window_). Nghe như cho agent thêm chỗ chứa. Nhưng context càng dài thì Claude càng nhớ kém (context rot), và cả lịch sử vẫn bị gửi lại ở mỗi lượt.
> - **Tắt prompt caching vì cache cứ bị mất** (_disable caching_). Nghe hợp lý khi thấy cache có vẻ vô dụng. Nhưng cache mất là do sửa trường `system` giữa chừng, còn thêm system message ở cuối hội thoại thì cache vẫn giữ.
> - **Để compaction chạy với prompt mặc định** (_rely on default compaction_). Nghe như giao cho API tự lo cho gọn. Nhưng bản tóm tắt mặc định bỏ mất các giả thuyết đã loại, và agent mất hai giờ kiểm lại sáu inverter.
>
> **Chọn:** xử lý đúng chỗ tốn token, tức dọn kết quả tool cũ, gọi compaction có `instructions`, và đổi chỉ dẫn bằng một system message thêm ở cuối hội thoại.

> **Ý chính**
>
> Trước hết tìm xem token đang tốn vào đâu, rồi dùng kỹ thuật hợp với chỗ đó. Catalog tool lớn thì dùng tool search. Kết quả tool cũ thì dọn bằng context editing. Hội thoại quá dài thì dùng compaction kèm `instructions`. Điều cần nhớ qua nhiều session thì ghi vào memory. Đổi chỉ dẫn giữa chừng bằng system message ở cuối hội thoại, không sửa `system` hay `tools`.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Effective context engineering for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
3. [Introducing advanced tool use (Anthropic Engineering)](https://www.anthropic.com/research/advanced-tool-use)
4. [Context windows (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
5. [Manage tool context (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
6. [Tool search tool (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
7. [Programmatic tool calling (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
8. [Context editing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-editing)
9. [Compaction overview (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/compaction)
10. [Compaction on demand (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/compaction-on-demand)
11. [Compaction at a token threshold (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/compaction-threshold)
12. [Mid-conversation system messages and tool changes (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages)
13. [Per-message effort (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/effort-per-message)
14. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
15. [Memory tool (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
16. [Dreams (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/dreams)
