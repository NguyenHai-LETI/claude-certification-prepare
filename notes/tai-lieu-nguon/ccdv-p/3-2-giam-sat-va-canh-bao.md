---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/3-2-giam-sat-va-canh-bao
ngay_tai: 2026-11-27
tieu_de: Giám sát và cảnh báo trên production - SLI, SLO, dashboard token và chi phí, phát hiện chất lượng giảm
---

Domain 3: Observability and Production Monitoring · Task 3.2

# Giám sát và cảnh báo trên production - SLI, SLO, dashboard token và chi phí, phát hiện chất lượng giảm

Chọn SLI và SLO cho dịch vụ dùng Claude, đặt cảnh báo, dựng dashboard token và chi phí, nhận ra chất lượng giảm sau khi đổi model và usage bất thường.

- 16 phút đọc
- Đối chiếu docs 21/11/2026
- 11 nguồn

## Đọc xong bạn nắm được

- Chọn SLI đo xem việc của người dùng có thật sự xong không, chứ không chỉ đếm response trả HTTP 200
- Đặt cảnh báo trên đúng tín hiệu của span và biết tín hiệu nào là bình thường
- Dựng dashboard token và chi phí, biết số nào gần thời gian thực, số nào dùng để đối soát
- Nhận ra khi đổi model làm câu trả lời kém đi, dù mọi chỉ số về lỗi và độ trễ vẫn xanh
- Nhận ra usage bất thường như API key bị lộ, hay chi phí tăng mà lượng việc không tăng

Một dịch vụ dùng Claude có thể trả HTTP 200 cho mọi request mà vẫn làm hỏng việc của người dùng. Bài này bàn ba chuyện. Nên đo những số nào để biết dịch vụ đang chạy tốt? Khi nào thì báo động? Và làm sao biết câu trả lời của Claude đang kém dần trong khi không có lỗi nào hiện ra?

Tên task trong đề là **Production Monitoring and Alerting**. Nó gồm việc đọc tín hiệu từ dịch vụ dùng LLM để định nghĩa SLI và SLO (**service level indicators**, **SLOs**), thiết kế cảnh báo và dashboard (**alerting and dashboards**), kể cả số liệu token và chi phí (**token and cost telemetry**). Nó cũng gồm việc phát hiện chất lượng giảm dần (**quality drift**), hành vi kém đi so với trước (**behavioral regressions**) và usage bất thường (**anomalous usage**), nhất là chất lượng giảm sau khi đổi model (**drift after model updates**). Cách gắn trace và đếm token đã nói ở bài 3.1, bài này dùng lại các số đó.

**Sơ đồ: Mỗi kiểu sự cố lộ ra ở một nguồn tín hiệu riêng, nên SLI và cảnh báo cần đủ các nguồn**
_Bản đồ bài. Bốn nguồn tín hiệu đi vào SLI, SLO và dashboard, rồi thành cảnh báo, kèm kiểu sự cố mỗi nguồn bắt được_

- **TELEMETRY**
- **SLI, SLO, DASHBOARD**
- **ALERTING**
- **Span và metric**: stop_reason, TTFT, token
- bắt ca cắt ở max_tokens
- **Mẫu người chấm lại**: so với điểm của model
- bắt chất lượng giảm
- **Phản hồi người dùng**: yêu cầu chấm lại, báo sai
- bắt hành vi kém đi
- **Usage and Cost API**: theo api_key_id, model
- bắt anomalous usage
- **SLI và SLO**: SLI đo việc đã xong chưa,
- không chỉ là HTTP 200
- SLO là mục tiêu cho SLI
- trong một cửa sổ
- Error budget
- Burn rate
- budget cạn càng nhanh
- thì báo càng gấp
- **Dashboard**: token, chi phí từ span
- đối soát bằng Analytics API
- **Báo trên span**: báo khi ERROR, max_tokens
- không báo khi stream unset
- **Burn rate cao**: gọi người trực ngay
- **Budget hao dần**: mở ticket
- **Tỉ lệ usage lệch**: theo API key, user.id
- so với lượng việc

## Ví dụ xuyên suốt: nền tảng luyện viết IELTS

Một nền tảng học tiếng Anh dùng Claude chấm bài luận IELTS Writing, khoảng 40.000 bài mỗi ngày, đông nhất từ 19:00 tới 23:00. Mỗi bài được gửi thành một request Messages API tới Claude Opus 5. Phần nhận xét được stream dần về cho học viên, và kết quả cuối là một JSON gồm band điểm và nhận xét cho bốn tiêu chí chấm IELTS (Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy).

Ứng dụng đã gắn OpenTelemetry ở cả hai đầu. SDK trong code của nền tảng ghi lại từng lần gọi, và Claude API cũng gửi về bản ghi của chính request đó. Mỗi bản ghi như vậy gọi là một span. Mỗi ngày giáo viên chấm lại 1% số bài, tức khoảng 400 bài lấy ngẫu nhiên, để so với điểm của Claude.

## Đo bài chấm xong, không đo HTTP 200

Một tối, nhóm đổi prompt chấm bài sang version 8, yêu cầu Claude nhận xét dài hơn. Nhưng nhóm quên nâng `max_tokens`, tức số token tối đa Claude được viết ra, vẫn để 2.000. Khoảng 960 trong 16.000 bài của buổi tối (6%) bị cắt giữa chừng, mất phần nhận xét ngữ pháp. Dashboard vẫn báo 99,9% request thành công, vì response bị cắt vẫn là HTTP 200, trong khi tỉ lệ bài chấm dùng được chỉ còn 94%.

SLI (**service level indicator**) là con số cho biết dịch vụ đang tốt tới đâu, ví dụ tỉ lệ bài chấm dùng được. SLO (**service level objective**) là mục tiêu bạn đặt cho con số đó trong một khoảng thời gian, ví dụ 99% bài dùng được trong 28 ngày. Với dịch vụ dùng Claude, "thành công" phải là việc của người dùng đã xong, chứ không phải server đã trả lời. Bảng sau là bộ SLI của nền tảng sau sự cố.

| SLI | Đo từ | SLO ví dụ |
| --- | --- | --- |
| Tỉ lệ request không lỗi | Span có status `ERROR`, tách theo `error.type` (`rate_limit_error`, `overloaded_error`, `api_error`) | 99,5% trong 28 ngày |
| Thời gian tới chữ đầu tiên (TTFT, time to first token) | `gen_ai.response.time_to_first_chunk` trên span của stream | p95 dưới 3 giây |
| Tổng thời gian chấm | Thời lượng span của cả lượt chấm | p95 dưới 25 giây |
| Tỉ lệ bài chấm dùng được | JSON hợp lệ đủ bốn tiêu chí, và `anthropic.message.stop_reason` không phải `max_tokens` hay `refusal` | 99% |
| Tỉ lệ khớp với giáo viên | Tỉ lệ số bài mà Claude chấm lệch không quá 0,5 band so với giáo viên, tính trên mẫu chấm lại. Ngày thường khoảng 92%, nhưng lúc này chỉ được xem trong báo cáo hằng tuần | 90% |
| Chi phí mỗi bài | Token của span nhân giá theo model | Dưới ngân sách đã đặt |

Hai SLI về thời gian đo hai thứ khác nhau. Thời gian tới chữ đầu tiên cho biết học viên có phải nhìn màn hình đứng im không. Tổng thời gian cho biết họ phải chờ bao lâu mới có điểm. Nếu bật thinking, tức Claude suy nghĩ trước khi viết câu trả lời, phần suy nghĩ có thể được stream về trước. TTFT đo tới `content_block_delta` đầu tiên của stream. Suy ra nếu delta đầu tiên thuộc phần thinking, kể cả khi phần này bị ẩn, thì nó chưa phải là chữ học viên nhìn thấy, và TTFT có thể trông tốt trong khi học viên vẫn đang chờ.

Mỗi SLO kéo theo một **error budget**, tức số bài được phép hỏng mà vẫn đạt mục tiêu. Với SLO 99% và 40.000 bài mỗi ngày, budget tương đương 400 bài hỏng mỗi ngày, tức khoảng 11.200 bài cho cửa sổ 28 ngày. Cách hay dùng là báo động theo tốc độ tiêu budget (**burn rate**), budget bị tiêu càng nhanh thì báo càng gấp. Đây là cách làm quen thuộc của đội SRE, những người lo cho hệ thống chạy ổn định, chứ Claude không có sẵn tính năng này. Chỉ trong tối đổi sang prompt v8 đã có 960 bài hỏng, gấp hơn hai lần phần budget của cả ngày. Nếu cứ tiêu với tốc độ đó, budget 28 ngày sẽ cạn sau khoảng 12 ngày. Budget bị tiêu nhanh như vậy thì nên gọi ngay người trực. Nếu budget chỉ hao dần, mở một ticket để xử lý trong giờ làm là đủ.

**Sơ đồ: Đo theo bài chấm dùng được mới thấy budget 28 ngày sẽ cạn sau khoảng 12 ngày**
_Error budget 11.200 bài của 28 ngày. Tiêu 960 bài mỗi ngày thì cạn sau khoảng 12 ngày, tiêu 400 bài mỗi ngày thì vừa hết vào ngày 28_

- **Dashboard báo 99,9% thành công**: vì response bị cắt vẫn trả HTTP 200
- **Tỉ lệ bài chấm dùng được còn 94%**: 960 bài bị cắt, thấp hơn SLO 99%
- **ERROR BUDGET CỦA 28 NGÀY LÀ 11.200 BÀI HỎNG**: 11.200
- 0
- ngày 0
- ngày 12
- ngày 28
- đường càng dốc, burn rate càng cao
- **Tiêu 960 bài/ngày**: như tối prompt v8
- cạn sau khoảng 12 ngày
- gọi người trực ngay
- **Tiêu 400 bài/ngày**: vừa hết vào ngày 28
- chậm cỡ này thì mở ticket

## Đặt cảnh báo và dựng dashboard token, chi phí

Muốn bắt sớm sự cố như tối prompt v8, trước hết bạn cần biết trên span thì dấu hiệu nào là lỗi thật, dấu hiệu nào chỉ trông giống lỗi. Thiết kế cảnh báo nên dựa trên bốn điều.

- Mỗi span kết thúc với một trong ba status, gồm `OK`, `ERROR`, hoặc không đặt gì (unset). Nên báo động khi span có status `ERROR`, và cả khi thuộc tính `stop_reason` là `max_tokens`, tức response bị cắt.
- Với stream, span kết thúc ở unset là chuyện bình thường. Khi ứng dụng đóng stream sớm, ví dụ học viên rời trang, đó là huỷ chứ không phải lỗi. Đừng báo động khi gặp unset.
- Đặt cảnh báo riêng cho 429 và 529. Lỗi 429 (`rate_limit_error`) thường nghĩa là tổ chức của bạn đã chạm rate limit, nên cần xin thêm hạn mức hoặc dàn request ra cho đều. 429 cũng có thể do chạm trần chi tiêu của tier, hoặc do usage tăng quá nhanh (ramp limit), như ở bài 2.1. Lỗi 529 (`overloaded_error`) nghĩa là API đang quá tải chung, nên cần retry và fallback như bài 2.1.
- Hai header `anthropic-ratelimit-input-tokens-remaining` và `anthropic-ratelimit-output-tokens-remaining` trong mỗi response cho biết bạn còn dùng được bao nhiêu token trước khi chạm giới hạn. Đưa hai số này lên dashboard thì trước giờ cao điểm 19:00 bạn đã thấy mình có sắp gặp 429 không.

Số liệu cho dashboard token và chi phí có thể lấy từ ba nguồn, mỗi nguồn cập nhật nhanh chậm khác nhau.

| Nguồn | Độ trễ của số | Dùng cho |
| --- | --- | --- |
| Span và metric của bạn | Gần như ngay. Span phía API được gửi theo kiểu best effort, nên có thể tới chậm hoặc mất | Cảnh báo, token mỗi bài, tỉ lệ token đọc từ cache, chi phí theo model và version prompt |
| Usage and Cost API (bản legacy, vẫn được hỗ trợ) | Thường trong 5 phút, gom số theo phút, giờ hoặc ngày (`1m`, `1h`, `1d`) | Theo dõi gần thời gian thực theo API key, workspace, model. Nên poll tối đa mỗi phút một lần |
| Usage and Cost Analytics API (khuyên dùng cho tích hợp mới) | Thường trong 4 giờ, có khi tới 24 giờ. Số của một tháng có thể còn thay đổi tới khoảng 7 ngày sau khi tháng kết thúc | Báo cáo tài chính, đối soát chi phí, group cùng lúc theo tối đa năm tiêu chí |

Span có thể bị thất lạc, cũng có thể bị gửi trùng hai lần, nên dashboard chi phí dựng từ span chỉ dùng để xem xu hướng. Con số gửi cho kế toán phải lấy từ Usage and Cost Analytics API.

> **Trong đề chọn gì**
>
> Cảnh báo trên status `ERROR` và trên `stop_reason` là `max_tokens`, không cảnh báo trên status unset của stream. Số gửi cho kế toán lấy từ Usage and Cost Analytics API, không lấy từ span.

## Nhận ra chất lượng giảm sau khi đổi model

Chuyện prompt v8 còn bắt được nhờ `stop_reason`. Sự cố tiếp theo khó thấy hơn nhiều. Tuần 6, nền tảng chuyển cùng một lúc toàn bộ bài sang Claude Opus 5.5, không qua canary, tức cho một phần nhỏ traffic dùng thử trước. Trước khi chuyển, nhóm chỉ kiểm hai thứ, là request không bị API từ chối với lỗi 400, và một eval gồm 300 bài mẫu kiểm JSON có đủ bốn tiêu chí. Eval là bộ bài thử chạy tự động rồi chấm điểm. Cách kiểm thử đầy đủ trước khi đổi model có ở bài 2.3.

Request không đặt `effort`, tức mức Claude suy nghĩ trước khi trả lời, nên đi theo mặc định mới là `medium` (Opus 5 mặc định là `high`). Các SLI về lỗi và thời gian đều xanh, độ trễ thậm chí còn giảm. Ngay ngày đầu, token đầu ra mỗi bài đã giảm từ 1.500 xuống khoảng 980, và tỉ lệ khớp với giáo viên tụt từ 92% xuống 83%. Tới ngày 3, tỉ lệ khớp còn 81%, band trung bình Claude cho cao hơn giáo viên 0,4, và số yêu cầu chấm lại tăng gấp đôi. Năm ngày sau, tới buổi rà soát hằng tuần, các giáo viên mới nhận ra Claude đang cho điểm cao hơn hẳn họ.

Kiểu sự cố này khó phát hiện vì không có lỗi nào hiện ra. Chính Anthropic cũng từng gặp chuyện này. Tháng 8 và tháng 9 năm 2025, ba lỗi hạ tầng làm chất lượng Claude giảm, mỗi lỗi chỉ ảnh hưởng một phần traffic. Nhìn tổng thể, chất lượng chỉ như dao động ngẫu nhiên, khó phân biệt với những phản hồi tiêu cực vẫn có hằng ngày. Eval cũng không bắt được, một phần vì Claude thường tự sửa lại được khi sai một chỗ nhỏ. Sau đó Anthropic làm eval nhạy hơn, cam kết chạy eval liên tục trên chính hệ thống production, và coi phản hồi của người dùng là tín hiệu cần theo dõi.

Tháng 4 năm 2026, ba thay đổi trong Claude Code lại làm chất lượng giảm, gồm đổi effort mặc định, đổi cách xoá thinking cũ, và sửa một dòng system prompt. Lần này Anthropic cam kết chạy eval riêng cho từng model mỗi khi sửa system prompt, thêm thời gian cho bản mới chạy thử trước khi mở rộng (soak), và rollout dần. Nền tảng IELTS có thể học đúng mấy cách này. Nhóm cần làm bốn việc để lần sau bắt được kiểu sự cố này sớm hơn.

- Mỗi span cần ghi đủ version. Tên model thật sự đã trả lời có sẵn ở `gen_ai.response.model`, còn version prompt thì bạn tự thêm một thuộc tính. `gen_ai.request.reasoning.level` chỉ xuất hiện khi request có đặt `effort`, nên đây thêm một lý do để luôn ghi rõ `effort` trong request. Thiếu các thuộc tính này thì bạn không so được số liệu trước và sau khi đổi model.
- Nên tính SLI chất lượng mỗi ngày và tách theo model. Mẫu 400 bài giáo viên chấm lại mỗi ngày đã đủ để thấy tỉ lệ khớp tụt từ mức thường ngày 92% xuống 83% ngay ngày đầu. Nếu đợi gom theo tuần như trước thì phải năm ngày sau mới biết.
- Có những số có ngay trên mọi bài mà không phải chờ giáo viên chấm lại, như token đầu ra mỗi bài, độ dài nhận xét và band trung bình. Các số này không cho biết điểm chấm đúng hay sai. Nhưng nếu chúng nhảy đột ngột ngay sau khi đổi model thì đó là lý do để vào xem ngay, trước khi có số của giáo viên.
- Theo dõi cả phản hồi của học viên, bằng cách đếm số yêu cầu chấm lại và số lần bấm nút "điểm không đúng", tách theo ngày và theo model.

**Sơ đồ: Lỗi và độ trễ vẫn xanh, chỉ tỉ lệ khớp với giáo viên và token đầu ra cho thấy chất lượng giảm**

> **Bẫy đề**
>
> Ngày 3 sau khi chuyển sang Opus 5.5, dashboard lỗi và độ trễ vẫn xanh, nhưng tỉ lệ khớp với giáo viên chỉ còn 81%. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Dashboard xanh nên model mới ổn** (_infrastructure SLOs are met, so quality is fine_). Nghe có số liệu chống lưng. Nhưng SLI về lỗi và độ trễ không đo điểm chấm đúng hay sai. Độ trễ giảm chính là vì model nghĩ ít hơn.
> - **Tin eval trước khi deploy** (_the offline eval passed_). Nghe như đã kiểm. Nhưng eval đó chỉ kiểm JSON đủ bốn tiêu chí, không đo độ khớp với giáo viên, và không thay được việc đo liên tục trên traffic thật.
> - **Tăng `max_tokens` để nhận xét dài lại** (_raise the output budget_). Nghe như sửa đúng triệu chứng token giảm. Nhưng bài không bị cắt, `stop_reason` vẫn là `end_turn`. Model chọn viết ngắn và nghĩ ít hơn vì effort mặc định đã đổi.
>
> **Chọn:** tách tỉ lệ khớp theo `gen_ai.response.model` để so trước và sau khi đổi, ghi rõ `effort` trong request, rồi rollout lại qua canary. Chỉ mở rộng canary khi SLI chất lượng tính hằng ngày vẫn trên ngưỡng đã đặt.

## Usage bất thường

Tháng kế tiếp, nền tảng gặp hai chuyện về usage. Lúc 02:00 một đêm, token đầu vào của cả tổ chức (tài khoản của nền tảng trên Claude API) tăng gấp 7 lần, trong khi số bài nộp vẫn chỉ khoảng 300 mỗi giờ. Một tuần sau, ngay sau một bản deploy, chi phí đầu vào mỗi bài tăng gần gấp đôi, dù số bài và số token mỗi bài không đổi.

Usage bất thường dễ thấy nhất khi nhìn tỉ lệ chứ không nhìn tổng, vì tổng tăng có thể chỉ do hôm đó đông học viên. Nên theo dõi các tỉ lệ như token trên mỗi bài, request trên mỗi học viên, và token của mỗi API key so với lượng việc mà key đó lẽ ra phải làm. Ba kiểu bất thường hay gặp là key bị lộ, một tài khoản dùng quá mức, và chi phí tăng mà token không tăng.

**Sơ đồ: Tổng tăng chưa nói lên gì, phải xem tỉ lệ nào lệch mới biết nguyên nhân**
- có
- không
- token theoapi_key_id
- request theouser.id
- cache_readmỗi bài
- Token, chi phítăng vọt
- Số bài nộptăng theo?
- Đông học viên,là bình thường
- Tỉ lệnào lệch?
- 85% token đến từkey staging bị lộ
- Một tài khoảndùng quá mức
- Cache không trúngvì system_changed

Với key bị lộ, traffic của người lạ không đi qua ứng dụng của bạn, nên span phía SDK không thấy. Span phía API cũng có thể không có, vì người gửi có thể tắt cờ sampled trong header `traceparent`, tức báo cho API không cần ghi trace. Vì vậy hãy group usage theo `api_key_id` bằng Usage and Cost API. Bản legacy có số sau khoảng 5 phút, còn Analytics API cũng group được nhưng ra số chậm hơn. Ở nền tảng này, 85% token lúc 02:00 đến từ key của môi trường staging mà một lập trình viên đã lỡ commit lên repo công khai. Việc cần làm là vô hiệu hoá key đó ngay và tạo key mới cho staging.

Khi một tài khoản dùng quá mức, cần biết người gửi là ai. Ứng dụng gửi kèm `user.id` qua baggage, tức cơ chế của OpenTelemetry để mang thông tin theo request, để span phía API ghi được request này của học viên nào. Nên dùng ID không lộ thông tin cá nhân, ví dụ khoá trong cơ sở dữ liệu, đừng dùng email. Sau đó đặt cảnh báo khi một học viên nộp hàng trăm bài mỗi giờ.

Còn khi chi phí tăng mà token và lượng việc không tăng, nguyên nhân thường là cache không còn trúng. `gen_ai.usage.input_tokens` đã tính cả token đọc từ cache, nên tổng token không đổi. Thứ thay đổi là phần đọc từ cache (`gen_ai.usage.cache_read.input_tokens`) tụt xuống, mà token không đọc từ cache thì tính giá cao hơn nhiều, nên chi phí tăng dù số token vẫn thế. Ở nền tảng IELTS, span cho thấy phần đọc từ cache tụt về gần 0 ngay sau bản deploy. Cache diagnostics, công cụ chẩn đoán cache ở bài 3.1, báo lý do là `system_changed`. Bản mới chèn tên học viên vào system prompt, nên system prompt của mỗi học viên một khác và không request nào dùng lại được cache của request trước. Sự cố Claude Code hồi tháng 4 năm 2026 cũng có một phần như vậy. Theo Anthropic, lỗi xoá thinking cũ ở mọi turn khiến request nào cũng không trúng cache, nên hạn mức của người dùng cạn nhanh hơn dự kiến.

> **Ý chính**
>
> Hãy theo dõi tỉ lệ chứ không chỉ tổng, như token và chi phí mỗi bài, hay token của mỗi API key so với lượng việc key đó phải làm. Usage theo từng API key thì lấy từ Usage and Cost API, vì traffic của người lạ có thể không để lại span nào.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [OpenTelemetry tracing for the Claude API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry)
3. [OpenTelemetry span reference (Claude API Docs)](https://platform.claude.com/docs/en/api/opentelemetry/spans)
4. [Trace Claude API requests and Managed Agents sessions with OpenTelemetry (Claude Cookbook)](https://platform.claude.com/cookbook/observability-opentelemetry-tracing)
5. [Usage and Cost API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
6. [Usage and Cost Analytics API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api)
7. [Rate limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
8. [Claude Opus 5.5 migration guide (Claude API Docs)](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide)
9. [A postmortem of three recent issues (Anthropic Engineering)](https://www.anthropic.com/research/a-postmortem-of-three-recent-issues)
10. [An update on recent Claude Code quality reports (Anthropic Engineering)](https://www.anthropic.com/research/april-23-postmortem)
11. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
