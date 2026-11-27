---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/3-1-telemetry-va-instrumentation
ngay_tai: 2026-11-27
tieu_de: Telemetry và instrumentation - trace agent, đếm token, chẩn đoán cache, ghi nội dung khi có ZDR
---

Domain 3: Observability and Production Monitoring · Task 3.1

# Telemetry và instrumentation - trace agent, đếm token, chẩn đoán cache, ghi nội dung khi có ZDR

Trace vòng lặp agent bằng OpenTelemetry, đếm token không trùng, tìm vì sao cache trượt, truy câu trả lời về nguồn, và chọn ghi nội dung hay chỉ metadata.

- 16 phút đọc
- Đối chiếu docs 21/11/2026
- 14 nguồn

## Đọc xong bạn nắm được

- Nối span của ứng dụng, SDK, Claude API và MCP server thành một trace cho mỗi lượt chạy agent
- Đếm token và chi phí từ span mà không cộng trùng, và biết khi nào phải lấy số từ Usage and Cost Analytics API
- Dùng cache diagnostics để biết request nào làm cache trượt và vì sao
- Ghi log có cấu trúc đủ để truy câu trả lời về tài liệu nguồn và phần lập luận
- Chọn content mode cho từng destination khi tổ chức có ZDR hay ràng buộc về dữ liệu

Khi agent trên production chạy chậm, tốn tiền hay trả lời sai, bạn cần biết nó đã làm gì ở từng bước. Muốn vậy thì phải gắn telemetry, tức là cho hệ thống tự ghi lại dữ liệu về từng bước nó chạy. Bài này chỉ cách gắn telemetry cho một hệ thống dùng Claude sao cho gỡ lỗi được, tính đúng chi phí, mà không làm lộ dữ liệu của khách.

Tên task trong đề là **Telemetry and Instrumentation**. Nó gồm trace cho vòng lặp agent và các lần gọi tool (**distributed traces for agent loops and tool calls**), số liệu token và chi phí (**token and cost metrics**), chẩn đoán hiệu quả cache (**cache-performance diagnostics**), truy câu trả lời về tài liệu nguồn và lập luận (**grounding and reasoning traceability**), log event có cấu trúc (**structured log events**), và cấu hình ghi nội dung khi có ràng buộc riêng tư như ZDR (**content-capture configuration under privacy constraints**). Phần giám sát Claude Code đã có ở bài 3.4 của CCAR-P. Bài này nói về Claude API, SDK và Managed Agents.

**Sơ đồ: Span từ ứng dụng và Claude API nối thành một trace, rồi đi hai đường tới nền tảng observability**
_Bản đồ bài. Trong ứng dụng, span của ứng dụng bao span CLIENT của mỗi request và span của tool, gồm tool runner và MCP helper. Ứng dụng ghi log event có cấu trúc với request-id và tài liệu được trích. Ở Claude API, span SERVER là con của span CLIENT nhờ header traceparent, nên cả hai nằm trong một trace; bên dưới span SERVER là span model_request cho mỗi lần model chạy. Response trả diagnostics cho biết vì sao cache trượt, còn Usage and Cost API của Admin API dùng để đối soát tiền. Span của ứng dụng đi qua exporter của SDK, span của API đi qua destination, mỗi đường có content mode riêng, và production để metadata only ở cả hai. input_tokens ghi lặp ở span CLIENT, SERVER và model_request, nên mỗi request chỉ lấy một nguồn._

- **ỨNG DỤNG CỦA BẠN**
- **Span của ứng dụng**: bao cả một lượt agent
- **Span CLIENT**: mỗi request tới API
- **Span tool**: tool runner, MCP helper
- **Log event có cấu trúc**: request-id, tài liệu trích
- **CLAUDE API**
- **diagnostics**: lý do cache trượt
- **Span SERVER**: con của span CLIENT
- **model_request**: mỗi lần model chạy
- **Usage and Cost API**: Admin API, đối soát tiền
- traceparent
- một trace
- exporter của SDK
- content mode của client
- destination của API
- content mode của destination
- **Nền tảng observability**: production: metadata only ở cả client và destination
- input_tokens ghi lặp ở span CLIENT, SERVER, model_request: mỗi request lấy một nguồn

## Ví dụ xuyên suốt: agent rà soát hợp đồng của một công ty luật

Một công ty luật có agent rà soát hợp đồng cho luật sư, khoảng 1.800 lượt rà soát mỗi ngày. Agent dùng Claude Opus 5.5, gọi qua Messages API bằng tool runner của SDK Python, tức helper tự chạy tool rồi gửi kết quả về cho Claude. Agent có hai tool tự viết là `tim_hop_dong` và `doc_dieu_khoan`. Tool thứ ba, `tra_van_ban_phap_luat`, nằm trên MCP server `van-ban-phap-luat`. Ứng dụng nối tới server này bằng MCP helper của SDK, nên tool runner chạy tool đó ngay trong ứng dụng. Công ty không dùng MCP connector, tức tính năng để Claude API tự gọi MCP server, vì MCP connector không nằm trong phạm vi ZDR ở đoạn sau.

Một lượt rà soát trung bình gồm 9 turn. Mỗi turn là một lần gửi request tới API và nhận response về. Hợp đồng của khách là bí mật, nên công ty có thoả thuận **ZDR** (zero data retention) với Anthropic, nghĩa là Anthropic không lưu prompt và response sau khi trả kết quả. Công ty gửi dữ liệu theo dõi về nền tảng observability của chính mình, tức hệ thống gom log, metric và trace để đội kỹ thuật tra cứu.

## Trace cho vòng lặp agent và tool

Thứ hai tuần 1, một lượt rà soát mất 4 phút thay vì 40 giây như thường lệ. Log ứng dụng chỉ có một dòng "hoàn thành sau 241 giây", không cho biết chậm ở turn nào trong 9 turn, hay ở tool nào. Phải có trace thì nhóm mới thấy lượt đó gọi `tra_van_ban_phap_luat` ba lần, mỗi lần 70 giây, tổng cộng 210 trên 241 giây, vì truy vấn trong MCP server quét cả bảng.

**OpenTelemetry** (OTel) là một chuẩn mở, không thuộc hãng nào, để ghi và gửi dữ liệu theo dõi, và đa số nền tảng observability đều đọc được. Trong OTel, một trace là toàn bộ đường đi của một việc. Mỗi span là một bước trong đó, như một request tới model hay một lần gọi tool. Span xếp thành cây, trong đó span cha bao các span con là những bước nhỏ hơn bên trong nó.

Với Claude, span có thể đến từ hai nơi, là SDK chạy trong ứng dụng của bạn và chính Claude API. Mỗi nơi bật riêng, và thường bạn bật cả hai để thấy trọn đường đi.

|   | SDK tracing | API tracing |
| --- | --- | --- |
| Ai phát span | SDK trong process của bạn | Claude API, phía Anthropic |
| Bật bằng | Đăng ký tracer provider của OTel (đối tượng tạo span và gửi chúng đi) trong code | Thêm một destination trong Claude Console (cần quyền admin). Destination là địa chỉ nền tảng observability sẽ nhận span từ API |
| Thấy được | Mỗi request mà SDK gửi, mỗi tool do tool runner chạy, kể cả tool từ MCP helper | Từng lần model chạy trong request, tool do Anthropic chạy phía server (như web search), tool gọi qua MCP connector, từng turn của Managed Agents |
| Loại span (span kind) của request | `CLIENT`, tức span của bên gửi request | `SERVER`, tức span của bên nhận và xử lý request |

Hai nguồn span nối với nhau nhờ header W3C `traceparent`. Header này mang trace ID, ID của span cha và cờ sampled, tức cờ cho biết trace này có được ghi lại không. SDK gắn header này vào mỗi request, nhờ đó API đặt span `SERVER` của mình làm con của span `CLIENT` bên SDK. Nếu bạn gọi SDK bên trong một span của ứng dụng, như `ra_soat_hop_dong`, thì cả cây span nằm chung một trace. Khi tool runner gọi một tool từ MCP helper, SDK phát span `anthropic.mcp_tool_use` cho lần gọi đó. Gói `mcp` của Python từ version 2.0 gửi trace context cho MCP server trong `_meta`, nên server đọc được thì tự gắn span của nó vào dưới span tool đó. Nếu dùng MCP connector, API cũng gửi `traceparent` cho MCP server trong `params._meta` của request `tools/call`.

**Sơ đồ: Trace của lượt 241 giây cho thấy ba lần gọi tra_van_ban_phap_luat chiếm 210 giây**
_Waterfall của lượt rà soát 241 giây: span ra_soat_hop_dong và span tool runner kéo dài cả 241 giây, log ứng dụng chỉ thấy con số này. Bên trong có 9 span CLIENT anthropic.messages.create rất ngắn, mỗi span có span SERVER con nối bằng traceparent. Ba span anthropic.mcp_tool_use tra_van_ban_phap_luat mỗi span 70 giây, bên dưới mỗi span là span của MCP server gắn vào nhờ _meta, cho thấy truy vấn quét cả bảng._

- 0 giây
- 241 giây
- **Span của ứng dụng**: ra_soat_hop_dong
- log ứng dụng chỉ thấy tổng 241 giây
- **Tool runner**: anthropic.messages.tool_runner
- bao cả vòng lặp 9 turn
- **9 span CLIENT**: anthropic.messages.create
- **9 span SERVER**: con của CLIENT qua traceparent
- **anthropic.mcp_tool_use**: tra_van_ban_phap_luat
- **70 giây**
- **70 giây**
- **70 giây**
- **Span của MCP server**: gắn vào nhờ _meta
- quét cả bảng
- quét cả bảng
- quét cả bảng
- Độ dài mỗi thanh theo đúng tỉ lệ thời gian. Chỗ đặt 9 request trên trục chỉ để minh hoạ.

Khi đọc trace, bạn cần biết thêm bốn điều.

- Span của một request mang tên method được gọi, như `anthropic.messages.create` hay `anthropic.sessions.events.send`. Span của tool mang tên loại tool rồi tới tên tool, như `anthropic.custom_tool_use doc_dieu_khoan`. Span `anthropic.messages.tool_runner` bao cả vòng lặp, nên thời gian của span này chính là tổng thời gian trả lời một câu hỏi.
- Khi một lượt gồm nhiều request, đặt `conversation_id` trên client để mọi span của lượt đó có chung thuộc tính `gen_ai.conversation.id`. Managed Agents là dịch vụ Anthropic chạy agent hộ bạn. Ở đó một session có thể chia thành nhiều thread (nhiều mạch chạy song song) và trải qua nhiều trace. Muốn đọc một thread thì bạn nhóm span theo `gen_ai.conversation.id`. Muốn xem cả session thì nhóm theo `anthropic.session.id`.
- Span của một stream chỉ kết thúc khi bạn đọc hết stream hoặc đóng nó. Vì vậy nếu dừng đọc giữa chừng, bạn phải đóng stream, không thì span không bao giờ kết thúc.
- Agent SDK và Claude Code có cách bật riêng. CLI của chúng tự phát các span `claude_code.interaction`, `claude_code.llm_request` và `claude_code.tool`. Muốn bật, bạn đặt `CLAUDE_CODE_ENABLE_TELEMETRY=1` và `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`, rồi chọn nơi xuất bằng `OTEL_TRACES_EXPORTER`. Phần trace này đang beta.

Cả SDK tracing lẫn API tracing cũng đang beta. Tên span và thuộc tính có thể đổi giữa các version SDK, nên hãy pin version SDK để dashboard không hỏng bất ngờ.

## Đếm token và chi phí cho đúng

Cuối tuần 2, dashboard chi phí do một kỹ sư dựng từ span báo số token đầu vào gấp gần bốn lần số trên trang Usage của Claude Console. Truy vấn của dashboard cộng `gen_ai.usage.input_tokens` của mọi span có thuộc tính này, rồi cộng thêm token đọc từ cache.

Lỗi nằm ở chỗ số token của một request được ghi lặp lại trên nhiều span. Đó là span `CLIENT` của SDK, span `SERVER` của API, và các span `anthropic.model_request` bên dưới. Một request có thể chạy model nhiều lần, ví dụ trước và sau một tool của MCP connector, nên có nhiều span `anthropic.model_request`. Muốn số liệu token và chi phí đúng, với mỗi request bạn chỉ lấy số từ một nguồn.

**Sơ đồ: Số token của một request lặp ở mọi tầng span, cộng hết thì ra 156.000 thay vì 40.000**
_Cây span của một request trong lượt rà soát: span CLIENT ghi input_tokens 40.000, span SERVER con của nó cũng ghi 40.000, hai span model_request bên dưới ghi 18.000 và 22.000, cộng lại vẫn 40.000. Thuộc tính cache_read 36.000 đã nằm trong input_tokens. Dashboard cộng hết các số này cùng cache_read nên ra 156.000 token. Lấy số ở một tầng thì request có 40.000 token._

- **SPAN CỦA MỘT REQUEST**
- **Span CLIENT**: input_tokens 40.000
- **Span SERVER**: input_tokens 40.000
- **model_request**: input_tokens 18.000
- **model_request**: input_tokens 22.000
- hai lần model chạy, cộng lại vẫn là 40.000
- **cache_read 36.000**: token đọc từ cache, đã nằm trong input_tokens
- **Cộng mọi span**
- **Dashboard ra 156.000 token**: 40.000
- span CLIENT
- + 40.000
- span SERVER
- + 18.000
- model_request
- + 22.000
- model_request
- + 36.000
- cache_read
- **Một nguồn mỗi request**
- **Request có 40.000 token**: Tầng nào cũng đủ 40.000,
- nên chỉ lấy số ở một tầng
- và không cộng thêm cache_read.

Lấy một request trong lượt rà soát làm ví dụ. Span `CLIENT` ghi 40.000 token đầu vào, và span `SERVER` con của nó cũng ghi 40.000. Model chạy hai lần nên có hai span `anthropic.model_request`, một span ghi 18.000 và span kia ghi 22.000, cộng lại vẫn là 40.000. Trong 40.000 token đó có 36.000 token đọc từ cache. Dashboard cộng tất cả các số này nên ra 156.000 token, trong khi request thật chỉ có 40.000 token.

Khi đếm token từ span, bạn còn cần biết ba điều.

- `gen_ai.usage.input_tokens` đã gồm token đọc và ghi cache. Hai thuộc tính `gen_ai.usage.cache_read.input_tokens` và `gen_ai.usage.cache_write.input_tokens` chỉ dùng để xem tỉ lệ trúng cache, đừng cộng thêm vào tổng.
- Token dùng cho compaction, tức Claude tóm tắt phần hội thoại cũ cho vừa context, không nằm trong `gen_ai.usage.*`. Nếu đếm từ span SDK, bạn cộng thêm `anthropic.usage.compaction.*`. Nếu đếm từ span API, bạn cộng thêm các span `anthropic.compaction`.
- Span được gửi theo kiểu ít nhất một lần (**at least once**) và best-effort, nghĩa là một span có thể tới hai lần hoặc không tới. Ứng dụng gọi API còn có thể tắt cờ sampled trong `traceparent`, khi đó API không phát span cho request. Vì vậy bạn cần lọc bỏ span trùng theo cặp trace ID và span ID, và đừng dùng span để tính tiền.

Số dùng để đối soát tiền nên lấy từ Usage and Cost Analytics API, vì API này đếm cả những request không có span. Đây là một endpoint của Admin API, tức bộ API quản trị tổ chức. Nó báo usage và chi phí theo model, theo workspace (đơn vị chia tài nguyên trong tổ chức) và theo `api_key_id`.

> **Trong đề chọn gì**
>
> Span dùng để gỡ lỗi và theo dõi xu hướng gần như theo thời gian thực. Còn khi đối soát tiền, bạn dùng số từ Usage and Cost Analytics API.

## Chẩn đoán cache

Tuần 3, sau một lần deploy, số token đọc từ cache (`cache_read_input_tokens` trong `usage` của response) về 0 trên mọi request, và chi phí đầu vào tăng mạnh. Trace chỉ cho thấy cache trượt, không nói vì sao.

Prompt caching chỉ trúng khi phần đầu prompt giống từng byte với một request gần đây. Cache diagnostics chỉ ra chỗ hai request bắt đầu khác nhau. Để dùng, bạn gửi object `diagnostics` trong mọi turn. Ở turn đầu, bạn đặt `previous_message_id: null` để bật tính năng. Từ turn sau, bạn truyền `id` của response trước đó. API lưu một dấu vân tay của request, chỉ gồm hash và ước lượng số token chứ không có nội dung prompt. Nó so dấu vân tay đó với request mới rồi gắn kết quả vào response.

```json
"diagnostics": {
  "cache_miss_reason": {
    "type": "system_changed",
    "cache_missed_input_tokens": 35200
  }
}
```

Ở công ty luật, lần deploy đó đã chèn giờ hiện tại và mã vụ việc vào system prompt, nên mỗi request có một system prompt khác. Đội sửa bằng cách giữ system prompt cố định, còn giờ và mã vụ việc thì đưa vào message `user` mới nhất. Bảng sau gom các giá trị `type` hay gặp.

| `type` | Nghĩa | Cách sửa |
| --- | --- | --- |
| `model_changed` | Router, A/B test hay fallback đã chọn model khác, mà mỗi model có cache riêng | Giữ một model trong suốt một hội thoại |
| `system_changed` | System prompt khác, thường do chèn giờ hay ID request | Giữ system prompt cố định từng byte |
| `tools_changed` | Thêm, bớt, đổi thứ tự tool, hoặc schema khi chuyển thành JSON ra thứ tự key mỗi lần một khác | Giữ nguyên danh sách và thứ tự tool, sắp xếp key khi serialize |
| `messages_changed` | Lịch sử bị sửa, cắt hay đổi thứ tự thay vì chỉ nối thêm | Lịch sử chỉ nối thêm, gửi lại nội dung assistant nguyên văn |
| `previous_message_not_found`, `unavailable` | Không so được, vì turn trước không bật, khác workspace, đã quá lâu, hay một tham số ảnh hưởng tới prompt như `thinking` đã đổi | Bật trên mọi turn, giữ cố định các tham số ảnh hưởng tới prompt |

Response chỉ báo chỗ khác nhau đầu tiên, nên bạn sửa chỗ đó trước rồi xem lại. Nên đọc `diagnostics` cùng với `cache_read_input_tokens`. Nếu `diagnostics` là `null` mà số token đọc từ cache vẫn thấp, request không hề đổi. Khi đó nguyên nhân là cache đã hết hạn, hoặc prompt ngắn hơn độ dài tối thiểu để được cache. Cache diagnostics chưa có trên Managed Agents.

## Truy câu trả lời về nguồn và lập luận

Tuần 4, một luật sư hỏi vì sao agent kết luận điều 12 của một hợp đồng thuê nhà xưởng là vô hiệu. Trace có thời gian và token, nhưng không cho biết agent dựa vào văn bản nào.

Muốn truy được câu trả lời dựa vào tài liệu nào và đã lập luận ra sao, bạn cần ghi lại ba thứ ngay lúc response trả về.

- Thứ nhất là nguồn. Tool `doc_dieu_khoan` trả điều khoản kèm citations, tức tính năng để Claude gắn trích dẫn vào câu trả lời. Nhờ vậy, mỗi câu Claude khẳng định đều kèm một block citation chỉ về tài liệu nguồn và đoạn được trích (`cited_text`). Bạn ghi danh sách ID hợp đồng, điều khoản và vị trí trích dẫn, không cần ghi cả đoạn văn.
- Thứ hai là lập luận. Thinking là phần Claude suy nghĩ trước khi trả lời. Trên các model Claude 5, thinking được bật sẵn, nhưng `display` mặc định là `"omitted"`. Khi đó block thinking trả về có trường `thinking` rỗng, nên bạn không có gì để ghi lại. Muốn đọc lại lập luận thì đặt `display: "summarized"` để nhận bản tóm tắt. Không giá trị `display` nào trả về chuỗi suy nghĩ thô. Số token thinking vẫn có ở `gen_ai.usage.reasoning.output_tokens`.
- Thứ ba là model nào thật sự trả lời. `gen_ai.response.model` khác `gen_ai.request.model` khi bạn gọi bằng alias (tên ngắn trỏ tới version mới nhất), hoặc khi request được chuyển sang model dự phòng.

Ba thứ này đi vào log event có cấu trúc. Mỗi câu trả lời ghi thành một event JSON gồm các field `anthropic.request.id`, `gen_ai.conversation.id`, version prompt, `stop_reason`, `error.type` khi có lỗi (ví dụ `rate_limit_error`), và ID các tài liệu được trích. Riêng `anthropic.request.id` là ID lấy từ header `request-id`. Bạn dùng nó để nối event với span `SERVER`, và gửi cho support khi cần hỏi. Claude Code và Agent SDK có sẵn các event dạng này, như `api_request`, `api_error`, `api_refusal` và `tool_result`. Thuộc tính `prompt.id` nối `user_prompt`, `api_request` và `tool_result` của cùng một prompt.

> **Ý chính**
>
> Muốn truy một câu trả lời, hãy ghi ngay lúc nó trả về các thứ sau: ID tài liệu được trích, bản tóm tắt thinking nếu đã bật `display: "summarized"`, model thật sự trả lời, và `request-id` để nối với trace.

## Ghi nội dung hay chỉ metadata, khi có ZDR

Log đã cho biết điều khoản nào được trích, nhưng một kỹ sư muốn đọc lại cả hội thoại về điều 12. Anh đặt biến môi trường `ANTHROPIC_OPEN_TELEMETRY_TRACES_CONTENT_MODE=content` cho client SDK trên production rồi quên tắt. Ba tuần sau, nội dung của khoảng 38.000 lượt rà soát (1.800 lượt mỗi ngày trong 21 ngày) đã nằm trong nền tảng observability. Nền tảng này giữ dữ liệu 90 ngày, và ai trong đội kỹ thuật cũng đọc được.

Mỗi destination và mỗi client SDK đều có một content mode, quyết định span có chứa prompt và response hay không. Chọn content mode cho đúng khi tổ chức có yêu cầu riêng tư chính là cấu hình ghi nội dung.

|   | Metadata only (mặc định) | Full content |
| --- | --- | --- |
| Span chứa gì | ID, thời gian, trạng thái, token, tên agent, tên và mô tả tool, tên MCP server | Thêm system prompt, messages, response, tham số và kết quả tool |
| Gỡ lỗi được gì | Chậm ở đâu, tốn ở đâu, lỗi gì | Thêm vì sao trả lời sai, đọc lại cả hội thoại, dựng bộ eval (bộ ca kiểm tra chất lượng) từ trace thật |
| Dung lượng | Nhỏ | Mặc định mỗi span tối đa 0,75 MB. Span lớn hơn sẽ bị cắt bớt và được gắn `anthropic.content.truncated` |

ZDR chỉ nói về việc Anthropic lưu dữ liệu. Vì vậy, có ZDR bạn vẫn dùng được full content. Span của SDK đi thẳng từ ứng dụng tới exporter, không qua Anthropic. Còn với destination của Messages API, API chỉ giữ nội dung trong bộ nhớ cho tới khi giao xong. Giao xong, dữ liệu nằm ở nền tảng của bạn, theo quyền truy cập và thời hạn lưu của nền tảng đó. Ngoài ra còn bốn trường hợp cần biết.

- Nếu tổ chức có thoả thuận với Anthropic theo HIPAA (luật bảo mật dữ liệu y tế của Mỹ), FERPA hay K-12 (dữ liệu học sinh, sinh viên), destination chỉ xuất metadata, kể cả khi bạn đặt full content. Span của SDK không bị ảnh hưởng, vì chúng đi thẳng từ ứng dụng của bạn tới exporter.
- Managed Agents (trừ bản self-hosted) không được áp ZDR. Transcript của session vẫn được lưu cho tới khi bạn xoá, và bật OTel không thay đổi điều này.
- `conversation_id` được xuất ra ở cả hai chế độ, nên đừng đặt tên khách hay số hợp đồng vào đó.
- Muốn biết span thuộc người dùng nào, bạn gửi `user.id` qua baggage, tức giá trị OTel truyền kèm theo request. Hãy dùng một ID không lộ ai là ai, như khoá chính trong cơ sở dữ liệu. API sẽ bỏ mọi `user.id` có chứa email.

> **Bẫy đề**
>
> Kỹ sư công ty luật quên tắt full content trên production. Ba tuần sau, nội dung của khoảng 38.000 lượt rà soát nằm trong nền tảng observability. Có hai cách nghĩ nghe hợp lý nhưng sai.
>
> - **Có ZDR nên ghi nội dung vẫn an toàn** (_ZDR makes exported content safe_). Nghe đúng vì ZDR là một cam kết về dữ liệu. Nhưng ZDR chỉ ràng buộc Anthropic. Nội dung đã giao đi thì nằm trong nền tảng của công ty, được giữ 90 ngày và ai trong đội cũng đọc được.
> - **Tắt hẳn tracing để khỏi lộ.** Nghe chắc ăn. Nhưng tắt tracing thì đội mất luôn công cụ đã tìm ra truy vấn 70 giây của MCP server, trong khi metadata only vốn không chứa nội dung hợp đồng.
>
> **Chọn:** client SDK và destination của production đều để metadata only. Full content chỉ bật ở client chạy trong môi trường gỡ lỗi, và ở một destination riêng nhận span từ workspace gỡ lỗi. Nơi nhận nội dung chỉ cho ít người đọc và giữ dữ liệu trong thời gian ngắn.

**Sơ đồ: Content mode đặt riêng ở client SDK và ở destination, nên production phải để metadata only ở cả hai**
_Hai đường span của công ty luật. Span từ SDK: client production để metadata only gửi về nền tảng observability giữ 90 ngày, cả đội đọc. Client gỡ lỗi để full content gửi về nơi nhận nội dung ít người đọc, giữ ngắn. Span từ API: destination production nhận workspace production, để metadata only, gửi về nền tảng observability. Destination riêng nhận workspace gỡ lỗi, để full content, gửi về nơi nhận nội dung. Sự cố: client production đặt content rồi quên tắt, nên nội dung của 38.000 lượt nằm trong nền tảng observability._

- **SPAN TỪ SDK**: content mode đặt trên client
- **NƠI NHẬN SPAN**
- **SPAN TỪ API**: content mode đặt trên destination
- **Client production**: chạy trên production
- metadata only
- **Client gỡ lỗi**: chạy ở môi trường gỡ lỗi
- full content
- **Destination production**: nhận workspace production
- metadata only
- **Destination riêng**: nhận workspace gỡ lỗi
- full content
- **Observability**: giữ 90 ngày,
- cả đội kỹ thuật đọc
- **Nơi nhận nội dung**: ít người đọc,
- giữ trong thời gian ngắn
- **Sự cố ở client production**: Kỹ sư đặt content rồi quên tắt, nội dung của 38.000 lượt nằm trong nền tảng observability 90 ngày.

Mỗi destination chọn được nó nhận span từ những workspace nào (**All**, **Selected**, **All except**). Vì vậy, với span từ API, bạn chỉ cần tách workspace gỡ lỗi khỏi workspace production. Với span từ SDK, content mode đặt trên từng client, nên client của production giữ mặc định metadata only. Với Claude Code và Agent SDK, nội dung prompt, chi tiết tool và nội dung tool cũng tắt theo mặc định. Muốn ghi phần nào, bạn bật riêng phần đó bằng `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS` hoặc `OTEL_LOG_TOOL_CONTENT`.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [OpenTelemetry tracing for the Claude API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry)
3. [Set up OpenTelemetry with the Claude API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api)
4. [Set up OpenTelemetry with the Anthropic SDK (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk)
5. [OpenTelemetry span reference (Claude API Docs)](https://platform.claude.com/docs/en/api/opentelemetry/spans)
6. [Trace Claude API requests and Managed Agents sessions with OpenTelemetry (Claude Cookbook)](https://platform.claude.com/cookbook/observability-opentelemetry-tracing)
7. [Cache diagnostics (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics)
8. [Thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
9. [Citations (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/citations)
10. [API and data retention (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
11. [Usage and Cost Analytics API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api)
12. [Observability with OpenTelemetry (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/observability)
13. [Monitoring (Claude Code Docs)](https://code.claude.com/docs/en/monitoring-usage)
14. [Trace agents with OpenTelemetry on the Claude Platform (Claude)](https://claude.com/resources/articles/agent-observability-on-the-claude-platform)
