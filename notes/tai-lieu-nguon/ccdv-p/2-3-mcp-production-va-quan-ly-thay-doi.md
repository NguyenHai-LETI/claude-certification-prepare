---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-3-mcp-production-va-quan-ly-thay-doi
ngay_tai: 2026-11-27
tieu_de: MCP production và quản lý thay đổi - remote MCP, version tool, đổi model, prompt và rollout
---

Domain 2: Production Integration, Reliability, and Knowledge Grounding · Task 2.3

# MCP production và quản lý thay đổi - remote MCP, version tool, đổi model, prompt và rollout

Đưa MCP server lên mạng có xác thực, đổi tool mà không làm hỏng hội thoại đang mở, kiểm thử trước khi đổi model, rồi ra mắt từng phần và lùi lại nhanh.

- 21 phút đọc
- Đối chiếu docs 21/11/2026
- 17 nguồn

## Đọc xong bạn nắm được

- Chạy MCP server qua Streamable HTTP, làm xác thực OAuth đúng vai resource server và không chuyển tiếp token của người dùng
- Đổi tool và schema theo kiểu cộng thêm, biết khi nào phải tạo tool tên mới và vì sao hội thoại đang mở vẫn dùng danh sách tool cũ
- Kiểm thử trước khi đổi model để bắt cả request bị API từ chối lẫn hành vi đổi mà không báo lỗi
- Giữ cấu hình khớp giữa Claude API và Amazon Bedrock, dựng gateway không làm mất tính năng
- Quản lý version cho prompt, ra mắt từng phần có ngưỡng chặn, và rollback bằng cách đổi version đang pin

Một hệ thống Claude trên production thường thay đổi ở ba chỗ, gồm MCP server mà Claude gọi, model, và prompt. Bài này chỉ cách đổi từng thứ mà không làm hỏng hệ thống đang chạy, và nếu vẫn hỏng thì quay lại bản cũ thật nhanh.

Tên task trong đề là **Production MCP and Change Management**. Nó gồm việc đưa MCP server lên mạng và xác thực (**remote MCP deployment and authentication**), đánh version cho tool và schema (**tool and schema versioning**), kiểm thử khi đổi model để bắt các thay đổi phá vỡ (**migration testing against breaking behavior changes**), giữ cấu hình khớp giữa các nền tảng (**platform-specific configuration parity**) và kiến trúc gateway (**gateway/routing architectures**). Nó cũng gồm quản lý version cho prompt (**prompt versioning**) và ra mắt từng phần có rollback (**progressive rollout with rollback**). Nếu chưa quen MCP, bạn nên đọc trước bài 8.2 của CCDV-F. Cách pin model ID, tức ghi cố định một model cụ thể trong cấu hình, và cách quản lý prompt như code nằm ở bài 2.6 của CCDV-F.

**Sơ đồ: Ba thứ hay đổi, mỗi thứ có một cách đổi an toàn, rồi cùng đi qua một đường rollout có rollback**
_Bản đồ bài: MCP server, model và prompt là ba thứ hay đổi, mỗi thứ có cách đổi an toàn riêng, rồi cùng đi qua eval offline, gate, canary, tăng dần 10, 50, 100% và rollback bằng đổi version đang pin; bên dưới là đường chạy app, gateway, Claude API hoặc Bedrock_

- **BA THỨ HAY ĐỔI**
- **MCP server**: remote MCP: HTTP, OAuth
- đổi tool: chỉ cộng thêm
- hoặc tạo tool tên mới
- **Model**: migration testing:
- contract test, eval,
- shadow traffic
- **Prompt**: prompt versioning:
- mỗi version một số,
- production pin một bản
- cả ba đều pin theo version
- **PROGRESSIVE ROLLOUT, CHUNG CHO CẢ BA**
- 1. **Eval offline**: trên golden set
- 2. **Gate**: ngưỡng chặn
- 3. **Canary**: ít hội thoại mới
- 4. **10, 50, 100%**: tăng dần
- vượt ngưỡng
- **Rollback**: đổi version đang pin về bản cũ, không deploy lại
- **PLATFORM PARITY VÀ GATEWAY**
- **App**: Messages API
- **Gateway**: giữ nguyên header, body
- **Claude API, Bedrock**: model ID và tính năng khác

## Ví dụ xuyên suốt: trợ lý trong app của một ngân hàng bán lẻ

Trợ lý chat trong app của một ngân hàng có khoảng 60.000 hội thoại mỗi ngày, trung bình 2.500 hội thoại mỗi giờ. Trợ lý gọi Claude qua Messages API. Để tra cứu và thao tác trên thẻ, Claude dùng MCP server `the-giao-dich` do ngân hàng tự viết. Server này có bốn tool là `tra_giao_dich`, `khoa_the`, `mo_khoa_the` và `tao_khieu_nai`.

Trợ lý nối tới server qua MCP connector, tức tính năng cho Messages API tự kết nối tới một MCP server ở xa. Tính năng này còn ở dạng beta, nên request phải kèm beta header `mcp-client-2026-09-15` thì mới bật được. Mọi request đều đi qua một **gateway** nội bộ, tức lớp proxy đứng giữa ứng dụng và nơi chạy model. Nếu Claude API gặp sự cố, ngân hàng có đường dự phòng là chạy Claude trên Amazon Bedrock, dịch vụ của AWS. Trước mỗi câu trả lời, trợ lý có một bước phân loại ý định để đoán khách đang muốn gì, và hễ bước này lỗi thì app chuyển khách sang tổng đài.

Trong một quý, trợ lý gặp ba sự cố, mỗi lần do một thay đổi. Lần đầu là lên bản MCP server mới, lần hai là đổi model, lần ba là sửa prompt. Bài đi lần lượt qua từng sự cố, xem nó hỏng ở đâu và lẽ ra nên đổi thế nào.

## Đưa MCP server lên mạng và xác thực

Khi MCP server chạy trên máy chủ riêng để nhiều client gọi qua mạng (**remote MCP deployment**), hai bên trao đổi qua transport **Streamable HTTP**. Transport là cách client và server truyền message cho nhau. Với Streamable HTTP, server chỉ có một endpoint, và mỗi message JSON-RPC mà client gửi là một request POST tới endpoint đó.

Từ bản spec MCP 2026-07-28, giao thức bỏ hẳn session. Session ở đây là trạng thái server giữ cho từng client giữa các request, khác với session của Managed Agents ở cuối bài. Không còn bước bắt tay `initialize` lúc đầu, cũng không còn header `Mcp-Session-Id`, và mỗi request tự ghi protocol version của nó. Vì không còn session, ngân hàng chạy bao nhiêu bản sao (replica) của `the-giao-dich` cũng được, vì bản nào cũng xử lý được mọi request. Suy ra load balancer cũng không cần sticky session, tức không phải gửi mọi request của cùng một client về cùng một máy.

Nếu một tool cần nhớ trạng thái qua nhiều lần gọi, server tạo một handle, tức một mã trỏ tới trạng thái đó. Server trả handle cho client, và lần sau client truyền lại nó như một tham số của tool. Handle nên là chuỗi ngẫu nhiên và được server gắn với người dùng ghi trong token. Server không được coi việc cầm handle là đủ quyền, vì người cầm được handle chưa chắc đã là người dùng đó.

Xác thực (**authentication**) của MCP dựa trên OAuth 2.1. Luồng chi tiết có ở bài 3.2 của CCAR-P. Khi làm xác thực cho MCP server, người ta hay sai ở bốn chỗ.

- **MCP server là resource server.** Resource server là nơi giữ dữ liệu và kiểm tra access token mà client gửi kèm. Việc cấp token thuộc về một authorization server riêng. Server công bố một tài liệu Protected Resource Metadata để client biết phải xin token ở đâu và cần scope nào. Request không có token thì server trả 401.
- **Kiểm tra audience.** Mỗi token ghi rõ nó được cấp cho dịch vụ nào, gọi là audience. Server chỉ nhận token cấp cho chính nó, để token xin cho một dịch vụ khác không dùng được ở đây.
- **Không chuyển tiếp token** (**token passthrough**). Khi gọi xuống hệ thống lõi của ngân hàng (core banking), `the-giao-dich` dùng credential của chính nó, chứ không chuyển tiếp token mà khách gửi lên. Nếu chuyển tiếp, hệ thống phía sau không biết ai thật sự đang gọi.
- **Mỗi quyền một scope.** Tool `khoa_the` cần scope `the:write`. Token không có scope này thì server trả 403 `insufficient_scope`, và client xin thêm quyền (step-up) rồi gọi lại. Còn token cấp cho server staging thì server production từ chối, vì audience của token không khớp.

**Sơ đồ: Replica nào cũng kiểm token, còn token của khách không đi xuống core banking**
_Kiến trúc remote MCP của ngân hàng: MCP client nhận token từ authorization server, gửi POST qua load balancer tới một trong ba replica của the-giao-dich; replica kiểm token rồi gọi core banking bằng credential riêng_

- **Authorization server**: cấp token ghi audience the-giao-dich
- và scope, như the:write
- **Streamable HTTP**: mỗi message là một POST tới một endpoint
- không initialize, không Mcp-Session-Id
- 1. nhận token
- **MCP client**: MCP connector
- 2. POST
- **Load balancer**: không cần sticky
- **THE-GIAO-DICH, RESOURCE SERVER**: replica
- replica
- replica
- bản nào cũng xử lý mọi request
- 3. **Replica nào cũng kiểm token**: Không có token thì trả 401
- Token staging sai audience, bị từ chối
- Gọi khoa_the thiếu the:write thì trả 403
- 4. credential riêng
- **Core banking**: không nhận token của khách

Các điểm này đúng với mọi MCP server. Riêng khi gọi server qua MCP connector như ngân hàng này, bạn khai báo server trong `mcp_servers` của request và thêm một `mcp_toolset` vào `tools`. Connector có ba giới hạn. Nó chỉ dùng được tool của server, không dùng được resource hay prompt của MCP. Server phải có URL truy cập được từ internet. Ứng dụng cũng phải tự xin, tự làm mới `authorization_token` rồi gửi kèm.

Để Claude chỉ dùng những tool được phép (allowlist), bạn tắt hết bằng `enabled: false` trong `default_config`, rồi bật từng tool trong `configs`. Trợ lý của ngân hàng không bật `mo_khoa_the`, nên Claude không tự mở khoá thẻ được. MCP connector cũng không nằm trong cam kết không lưu dữ liệu (**zero data retention**, ZDR). Tổ chức nào bắt buộc ZDR thì phải tự chạy MCP client trong ứng dụng thay vì dùng connector.

Nếu bạn chạy agent trên Managed Agents, tức dịch vụ Anthropic chạy sẵn agent và sandbox cho bạn, MCP server được khai báo ngay trong cấu hình agent. Credential được đăng ký sẵn trong vault, và mỗi session của agent trỏ tới vault đó để lấy credential.

> **Trong đề chọn gì**
>
> MCP server trên production đóng vai resource server. Nó kiểm tra audience của token và không chuyển tiếp token của người dùng xuống hệ thống phía sau. Giao thức không còn session, nên server dễ scale ngang bằng cách thêm replica. MCP connector chỉ dùng được tool, cần URL công khai, bắt ứng dụng tự lo token, và không thuộc ZDR.

## Version cho tool và schema

Sự cố đầu tiên xảy ra lúc 14:00 tuần 1, khi `the-giao-dich` lên bản 2.0. Bản này thay hai tham số `tu_ngay`, `den_ngay` của `tra_giao_dich` bằng một object `khoang_thoi_gian`, và bắt `khoa_the` phải có thêm tham số `ly_do`. Khoảng 380 hội thoại đang mở gọi tool bị lỗi, và 23 khách không khoá được thẻ.

Hội thoại đang mở hỏng vì cách MCP connector giữ danh sách tool. Với beta `mcp-client-2026-09-15`, response đầu tiên của hội thoại mở đầu bằng block `mcp_tool_listing`, ghi lại danh sách tool và schema lúc đó. Các request sau của hội thoại dùng danh sách đã ghi này chứ không hỏi lại server, miễn là ứng dụng gửi lại nguyên vẹn assistant message chứa block đó, kèm beta header. Nếu muốn cố định hẳn, bạn có thể chép danh sách đó vào toolset. Thiết kế này có chủ ý, để tool không đổi giữa một hội thoại. Đổi lại, chừng nào còn hội thoại giữ schema cũ thì server vẫn phải nhận lời gọi theo schema cũ. Bản 2.0 không nhận, nên mọi hội thoại mở trước 14:00 đều gọi hỏng.

**Sơ đồ: Hội thoại mở trước 14:00 vẫn gọi tool theo danh sách đã ghi, nên bản 2.0 từ chối**
Bên tham gia: the-giao-dich, Claude API, (MCP connector), App ngân hàng

1. Request đầu, kèm beta header
2. Lấy danh sách tool
3. Block mcp_tool_listing
4. ghi tu_ngay, den_ngay
5. Request sau, gửi lại
6. nguyên block đó
7. tra_giao_dich(tu_ngay, den_ngay)
8. Bản 2.0 từ chối schema cũ

MCP có hai thứ mang version, là bản thân giao thức và các tool trên server. Version của giao thức thì MCP tự lo. Nếu request ghi một protocol version mà server không hỗ trợ, server trả `UnsupportedProtocolVersionError` kèm danh sách version nó hỗ trợ. Client cũng có thể hỏi trước bằng `server/discover`.

Chỗ hay hỏng là tool, như vụ bản 2.0. Spec MCP không có trường version cho từng tool, nên cách đánh version cho tool và schema là quy ước bạn tự đặt ra. Bảng sau là cách làm hay dùng.

| Thay đổi | Loại | Cách làm |
| --- | --- | --- |
| Thêm tool, thêm tham số không bắt buộc, thêm trường vào kết quả | Cộng thêm | Sửa luôn tool hiện có |
| Đổi tên hay bỏ tham số, thêm tham số bắt buộc, thu hẹp kiểu dữ liệu (ví dụ trước nhận chuỗi bất kỳ, nay chỉ nhận vài giá trị) | Phá vỡ | Tạo tool tên mới (`tra_giao_dich_v2`), tool cũ vẫn chạy song song |
| Gỡ tool cũ | Phá vỡ | Chỉ gỡ khi log cho thấy không còn ai gọi |

Khi tạo tool tên mới, còn hai chỗ dễ sập bẫy. Thứ nhất, allowlist tắt mọi tool theo mặc định, nên nếu bạn quên thêm `tra_giao_dich_v2` vào `configs` thì tool mới bị tắt mà không ai hay. Ngược lại, khi đã gỡ tool cũ mà allowlist vẫn ghi tên của nó, API không báo lỗi mà chỉ ghi cảnh báo phía backend. Thứ hai, mảng `tools` thay đổi có thể làm mất prompt cache, vì spec MCP khuyên giữ danh sách tool ổn định để cache trúng nhiều hơn. Prompt cache là phần đầu request đã được lưu lại để các lần sau đọc nhanh và rẻ hơn. Vì vậy đừng sửa vặt mô tả tool trên production.

Để không lặp lại vụ bản 2.0, ngân hàng thêm vào CI một bước so danh sách tool của bản đang chạy với bản sắp deploy. Bước này chặn merge nếu có thay đổi phá vỡ mà tên tool vẫn giữ nguyên.

## Đổi model: kiểm thử trước khi chuyển traffic

Sự cố thứ hai xảy ra lúc 09:00 tuần 3. Nhóm chuyển 100% traffic của trợ lý từ Opus 5 sang Opus 5.5, vì Opus 5.5 rẻ hơn 20% và unit test vẫn xanh. Sau khi đổi model, mọi request của bước phân loại ý định đều bị API trả lỗi 400, nên app chuyển khách sang tổng đài. Tới 09:35 nhóm mới đổi lại Opus 5, và lúc đó khoảng 1.400 khách đã bị đẩy sang tổng đài.

Vì sao test xanh mà vẫn hỏng? Pin model ID chỉ bảo đảm `claude-opus-5` lúc nào cũng trỏ tới đúng một bản model cố định, gọi là snapshot. Nó không hứa model mới sẽ cư xử giống model cũ. Bạn cũng không cần đổi vội. Khi sắp gỡ một model, Anthropic báo trước ít nhất 60 ngày, đủ thời gian để kiểm thử kỹ.

Kiểm thử trước khi đổi model phải bắt được hai loại thay đổi phá vỡ. Bảng sau lấy ví dụ từ lần chuyển Opus 5 sang Opus 5.5.

| Loại | Ví dụ | Lộ ra khi nào |
| --- | --- | --- |
| Request bị API từ chối (lỗi 400) | `thinking: {"type": "disabled"}`, hoặc `tool_choice` loại `any` hay `tool` để ép model gọi tool | Ngay ở request đầu tiên, nhưng chỉ khi gọi API thật |
| Cùng request, hành vi khác | Response giờ mở đầu bằng block `thinking`, tức phần model suy nghĩ trước khi trả lời, nên code lấy `content[0].text` không còn ra câu trả lời. Chữ model viết giữa các lần gọi tool cũng chuyển vào block `thinking`. Mức effort, tức model nghĩ kỹ tới đâu, mặc định là `medium` thay vì `high` | Không có lỗi nào, chỉ thấy qua eval và số liệu theo dõi |

Eval ở đây là chạy model trên một bộ ca mẫu rồi chấm điểm. Ngân hàng dính cả hai loại. Bước phân loại ý định gửi request tắt thinking và ép `tool_choice`, nên bị trả lỗi 400. Khi chạy thử Opus 5.5 trên staging, nhóm còn thấy những lỗi không báo gì. Bong bóng chat trống trơn vì code đọc `content[0].text` giờ gặp block `thinking`. Dòng "Đang tra giao dịch…" biến mất vì chữ đó đã chuyển vào block `thinking`. Trên 300 hội thoại mẫu, tỉ lệ xử lý khiếu nại đúng quy trình giảm từ 91% xuống 84% ở effort mặc định, và lên 92% khi đặt `effort: "high"`.

Để bắt được cả hai loại thay đổi, nên kiểm thử theo năm lớp.

- **Contract test trên API thật.** Lấy từng kiểu request mà code của bạn gửi đi, gửi thật tới model mới trên từng nền tảng, để xem API còn chấp nhận chúng không. Unit test với response giả không bao giờ thấy được lỗi 400 của model mới.
- **Eval trên golden set.** Golden set là bộ hội thoại mẫu có sẵn đáp án chuẩn. Ghi rõ mức effort trong request và thử vài mức, đừng giữ nguyên mức đã chỉnh cho model cũ.
- **Shadow traffic.** Gửi bản sao của một phần request thật sang model mới, so kết quả mà không trả cho khách. Các tool ghi dữ liệu như `tao_khieu_nai` phải thay bằng mock. Nếu không, mỗi khiếu nại sẽ bị tạo hai lần, một lần từ model cũ và một lần từ model mới.
- **Đo lại chi phí.** Theo bảng giá, Opus 5.5 rẻ hơn 20%. Nhưng thinking giờ luôn chạy và được tính tiền như token output, nên tổng chi phí chưa chắc giảm đúng 20%.
- **Gán model theo hội thoại.** Hội thoại bắt đầu ở model nào thì đi hết bằng model đó. Trong lúc hội thoại đang chạy, cũng đừng sửa `system` hay `tools`. Khi hội thoại có thinking block, API chạy prefix check, tức kiểm tra phần đầu hội thoại còn giữ nguyên như trước. Sửa hai trường này thì bước kiểm tra không qua, và request có thể bị trả 400. Nếu cần đổi chỉ dẫn giữa chừng, bạn thêm một system message vào giữa hội thoại (bài 1.4).

> **Bẫy đề**
>
> Lúc 09:00 tuần 3, ngân hàng chuyển 100% traffic sang Opus 5.5. 35 phút sau, khoảng 1.400 khách đã bị đẩy sang tổng đài. Có bốn cách làm nghe hợp lý nhưng sai.
>
> - **Đổi hẳn vì model ID đã pin** (_switch all traffic because the model ID is pinned_). Nghe an toàn vì ID trỏ tới một snapshot cố định. Nhưng pin không làm Opus 5.5 cư xử giống Opus 5.
> - **Tin unit test đang xanh** (_rely on unit tests with mocked responses_). Nghe như đã có test. Nhưng response giả mang hình dạng của Opus 5, nên không bao giờ trả 400.
> - **Retry hoặc fallback cho mọi lỗi 400** (_retry or fail over on every error_). Nghe như làm hệ thống bền hơn. Nhưng 400 không phải lỗi tạm thời. Retry thì vẫn lỗi y như cũ, còn fallback sang model khác chỉ che đi lỗi cấu hình chứ không sửa nó.
> - **Bỏ `tool_choice` rồi deploy lại ngay** (_hotfix the rejected parameter_). Nghe như sửa đúng chỗ. Nhưng các thay đổi không báo lỗi vẫn còn, như tỉ lệ xử lý đúng quy trình tụt xuống 84%.
>
> **Chọn:** lùi về Opus 5 bằng cấu hình pin, chạy contract test, eval và shadow traffic, rồi mới ra mắt Opus 5.5 từng phần như mục cuối bài.

## Cấu hình khớp giữa Claude API và Bedrock, và gateway

Vụ đổi model còn đặt ra một câu hỏi. Nếu đúng hôm đó Claude API gặp sự cố, đường dự phòng Bedrock có chạy được không? Contract test phải chạy trên từng nền tảng vì cùng một thiết lập chạy khác nhau ở mỗi nơi. Giữ cấu hình khớp giữa các nền tảng nghĩa là biết trước những chỗ khác nhau đó. Bảng sau so ba chỗ khác nhau với trợ lý của ngân hàng.

| Mục | Claude API | Amazon Bedrock |
| --- | --- | --- |
| Model ID | `claude-opus-5-5` | `anthropic.claude-opus-5-5` |
| MCP connector | Có (beta), pin được danh sách tool | Không có, ứng dụng phải tự chạy MCP client |
| Fallback phía server (`fallbacks`), tức API tự chuyển sang model dự phòng | Có | Không có, ứng dụng tự lo fallback |

Vì vậy chuyển sang Bedrock không chỉ là đổi base URL. Bedrock không có MCP connector, nên code cần một nhánh riêng tự mở MCP client tới `the-giao-dich`, và contract test phải chạy cả nhánh này. Nên giữ trong version control một file cấu hình cho mỗi môi trường. File này ánh xạ cái tên bạn dùng trong code, ví dụ `model_chinh`, sang model ID và các tính năng có trên từng nền tảng.

Nếu đội bạn dùng Claude Code trên Bedrock, chỗ khác biệt này cũng gây bẫy. Khi chưa đặt `ANTHROPIC_DEFAULT_SONNET_MODEL`, alias `sonnet` trỏ tới Sonnet 4.5, nên bạn cần pin model bằng các biến `ANTHROPIC_DEFAULT_*_MODEL`.

Gateway mà ngân hàng đặt giữa ứng dụng và nơi chạy model là một phần của kiến trúc gateway và routing. Gateway giữ API key ở phía server, chia chi phí theo từng nhóm, ghi audit log, và cho phép đổi nơi chạy model mà không phải sửa ứng dụng. Cái giá phải trả là gateway dễ làm mất tính năng mà không báo lỗi, ví dụ khi nó bỏ bớt header hay sửa body của request. Claude Code đặt bốn yêu cầu cho gateway đứng trước nó, và chúng cũng đúng với gateway của ngân hàng.

- **Chuyển tiếp nguyên `anthropic-version`, `anthropic-beta` và body.** Danh sách giá trị của các header này còn dài thêm theo thời gian. Nếu gateway chỉ cho qua những giá trị beta đang có hôm nay, các tính năng beta ra sau sẽ bị chặn.
- **Không viết lại body.** Nếu gateway bỏ mất `cache_control`, request vẫn chạy bình thường, nhưng mọi request đều bị tính tiền như input không dùng cache. Nếu gateway sửa `system` hay `tools`, thinking block sẽ không qua được prefix check.
- **Trả nguyên lỗi và header của upstream**, như `retry-after` và `x-should-retry`, để client tự xử lý đúng.
- **Tự chuyển đổi khi đưa request sang Bedrock.** Nếu gateway nhận request theo định dạng Anthropic rồi gửi sang Bedrock, nó phải tự chuyển đổi. Trường nào Bedrock không nhận, như `output_config`, mà vẫn để nguyên thì request bị trả 400.

Gateway cũng có thể đứng giữa client và MCP server. Với Streamable HTTP, tên method và tên tool trong body được chép ra hai header `Mcp-Method` và `Mcp-Name`, nên gateway chỉ cần đọc header là route được. Ví dụ, ngân hàng đưa các lời gọi `khoa_the` sang một nhóm replica có kiểm soát chặt hơn. Nếu header và body ghi khác nhau, server phải từ chối request với lỗi 400 `HeaderMismatch`. Nếu không, gateway sẽ route theo header còn server lại chạy theo body. Khi một gateway gộp nhiều MCP server lại, nó cần thêm tên server vào trước tên tool, vì hai server khác nhau có thể có tool trùng tên.

## Version prompt và ra mắt từng phần

Sự cố thứ ba xảy ra lúc 16:00 tuần 5. Phòng pháp chế thêm vào system prompt câu "luôn đề nghị tạo khiếu nại khi khách hỏi về phí". Họ sửa thẳng trong trang quản trị, và thay đổi áp ngay cho mọi hội thoại. Tỉ lệ hội thoại có tạo khiếu nại tăng từ 4% lên 13%. Tới 08:00 sáng hôm sau, qua một đêm vắng khách với khoảng 24.000 hội thoại, đã có khoảng 2.100 khiếu nại thừa. Không ai giữ bản prompt cũ, nên mất ba giờ mới khôi phục được.

Cách tránh sự cố này là quản lý version cho prompt. Mỗi version prompt có số riêng và không sửa được sau khi tạo. Production pin một version cụ thể. Ai cũng tạo được version mới, nhưng muốn đổi version đang pin thì phải qua review. Trace của mỗi request, tức bản ghi lại request đó đã đi qua những gì, nên lưu model ID, version prompt và version MCP server. Nhờ vậy khi có lỗi, bạn biết ngay thay đổi nào gây ra.

Managed Agents có sẵn cơ chế này, và session ở đây là một lần chạy agent. Mỗi lần update agent mà cấu hình thật sự đổi sẽ sinh ra một version mới. Khi tạo session, nếu bạn truyền `{"type": "agent", "id": ..., "version": 12}` thì session dùng đúng bản 12. Nếu chỉ truyền ID mà không kèm version, session lấy bản mới nhất. Bản thân lệnh update không có bước duyệt, nên chỗ cần review là version được pin trong cấu hình của nơi gọi agent. Ngoài ra, nếu bạn gửi update kèm một `version` đã cũ, API trả 409 chứ không ghi đè lên bản mới hơn.

Có version rồi thì mới ra mắt từng phần và rollback được. Quy trình này dùng chung cho prompt, model và MCP server, gồm bốn bước.

1. Chạy eval offline trên golden set.
2. Đặt sẵn ngưỡng chặn (gate) trên số liệu thật, như tỉ lệ tạo khiếu nại, tỉ lệ chuyển tổng đài và tỉ lệ lỗi tool.
3. Chạy canary, tức cho bản mới phục vụ một phần nhỏ hội thoại mới. Hội thoại đã gán bản nào thì đi hết với bản đó.
4. Nếu số liệu còn trong ngưỡng, tăng dần lên 10%, 50% rồi 100%. Nếu số liệu vượt ngưỡng, rollback bằng cách đổi version đang pin về bản cũ, không cần deploy lại.

Giả sử câu prompt lỗi đó đi qua quy trình này, bắt đầu lúc 10:00 một ngày thường.

**Sơ đồ: Cùng câu prompt lỗi, nếu qua canary 10% thì chỉ có 45 khiếu nại thừa thay vì khoảng 2.100**

Lúc 10:15, canary bắt đầu, 10% hội thoại mới được gán v13. Trợ lý có trung bình 2.500 hội thoại mỗi giờ, nên sau hai giờ, tới 12:15, nhóm v13 đã có 500 hội thoại. Nhóm này tạo 65 khiếu nại, tức 13%, trong khi nhóm v12 chỉ có 4%. Tỉ lệ này vượt ngưỡng đã đặt, nên lúc 12:16 nhóm đổi version đang pin về v12. Với tỉ lệ bình thường 4%, 500 hội thoại chỉ có khoảng 20 khiếu nại. Vậy số khiếu nại thừa dừng ở 45, thay vì khoảng 2.100 như lần sửa thẳng prompt.

Eval offline không bắt được lỗi này vì golden set chưa có ca nào khách hỏi về phí. Ngưỡng đặt trên số liệu thật thì bắt được. Rollback chỉ nhanh khi bản cũ còn chạy được, tức prompt cũ còn lưu và deployment cũ của MCP server chưa bị xoá, và đội đã tập rollback từ trước.

Nếu pipeline giao việc deploy và rollback cho một agent, hãy làm deploy và rollback thành các tool riêng cho từng môi trường, và agent chạy ở staging chỉ được cấp tool của staging. Hook là một đoạn script chạy trước mỗi thao tác của agent để kiểm tra. Hook dùng để chặn thao tác lên production phải fail closed, nghĩa là nếu chính hook bị lỗi thì thao tác vẫn bị chặn chứ không được cho qua.

> **Ý chính**
>
> Khi đổi tool, chỉ nên cộng thêm. Nếu buộc phải thay đổi phá vỡ thì tạo tool tên mới và để tool cũ chạy song song. Khi đổi model, kiểm thử cả lỗi 400 lẫn hành vi đổi mà không báo lỗi. Prompt, model và MCP server đều nên pin theo version, ra mắt qua canary có ngưỡng số liệu, và khi cần thì rollback bằng cách đổi version đang pin.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Streamable HTTP transport (MCP Specification 2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
3. [Authorization (MCP Specification)](https://modelcontextprotocol.io/specification/latest/basic/authorization)
4. [Security Best Practices (MCP)](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
5. [Versioning (MCP Specification)](https://modelcontextprotocol.io/specification/versioning)
6. [Tools (MCP Specification)](https://modelcontextprotocol.io/specification/latest/server/tools)
7. [Key Changes 2026-07-28 (MCP Specification)](https://modelcontextprotocol.io/specification/latest/changelog)
8. [MCP connector (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
9. [Claude Opus 5.5 migration guide (Claude API Docs)](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide)
10. [Model IDs and versioning (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)
11. [Model deprecations (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
12. [Claude in Amazon Bedrock (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)
13. [Agent setup (Claude Managed Agents Docs)](https://platform.claude.com/docs/en/managed-agents/agent-setup)
14. [Managed Agents tutorial - prompt versioning and rollback (Claude Cookbook)](https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback)
15. [Other LLM gateways (Claude Code Docs)](https://code.claude.com/docs/en/llm-gateway)
16. [Gateway compatibility guide (Claude Code Docs)](https://code.claude.com/docs/en/llm-gateway-protocol)
17. [Claude Code on Amazon Bedrock (Claude Code Docs)](https://code.claude.com/docs/en/amazon-bedrock)
