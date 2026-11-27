---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-1-do-tin-cay-dich-vu-claude
ngay_tai: 2026-11-27
tieu_de: Độ tin cậy cho dịch vụ Claude - retry, circuit breaker và fallback theo đúng loại lỗi
---

Domain 2: Production Integration, Reliability, and Knowledge Grounding · Task 2.1

# Độ tin cậy cho dịch vụ Claude - retry, circuit breaker và fallback theo đúng loại lỗi

Phân loại lỗi HTTP và stop_reason trước khi xử lý, rồi retry có backoff, circuit breaker, graceful degradation và fallback sang model, region hay nền tảng khác.

- 20 phút đọc
- Đối chiếu docs 21/11/2026
- 11 nguồn

## Đọc xong bạn nắm được

- Phân biệt lỗi HTTP với stop_reason, biết loại nào nên gửi lại, loại nào phải sửa rồi mới gửi
- Chỉ đặt retry ở một chỗ, chờ ít nhất số giây trong retry-after, và hiểu vì sao vẫn bị 429 khi chưa chạm giới hạn
- Dùng circuit breaker và các bậc dự phòng để dịch vụ vẫn trả lời được khi Claude gặp sự cố
- Chọn fallback qua model, region hay nền tảng cloud mà vẫn đúng tính năng và đúng quy định về dữ liệu
- Tách refusal ra một luồng xử lý riêng, dùng fallback có sẵn của API hoặc SDK, và đếm refusal riêng với lỗi

Khi một request tới Claude thất bại, phản xạ quen thuộc là gửi lại, gửi vài lần vẫn hỏng thì đổi sang model khác. Cách này vừa tốn tiền vừa che mất nguyên nhân. Một request không cho ra câu trả lời dùng được có thể vì API đang quá tải, vì bạn gửi vượt hạn mức của tài khoản, vì câu trả lời bị cắt khi chạm `max_tokens` (số token tối đa bạn cho model viết), hoặc vì model từ chối yêu cầu. Mỗi trường hợp cần một cách xử lý khác nhau.

Bài này giúp bạn trả lời: khi một request không cho ra câu trả lời dùng được, nên gửi lại, chuyển sang model hay nền tảng dự phòng, hay dừng hẳn? Và làm sao để dịch vụ vẫn trả lời được khi Claude gặp sự cố?

Tên task trong đề là **Reliability Engineering for Claude Services**. Nó gồm các mẫu thiết kế giúp tích hợp Claude chạy bền trên production (**resilience patterns**), như thiết kế retry và backoff (**retry and backoff design**), **circuit breaker**, **graceful degradation**, và fallback sang model, region hay nền tảng khác (**cross-model, cross-region, and cross-platform fallbacks**). Các cách đó phải phân biệt được giới hạn tốc độ (**rate limit**) với việc model từ chối vì bộ phân loại an toàn (**safety refusal**) và với câu trả lời dừng vì chạm giới hạn độ dài (**context-window stop**), và phải tính tới việc mỗi nền tảng có bộ tính năng khác nhau (**per-platform feature parity**). Phần nền về mã lỗi có ở bài 4.1 của CCDV-F.

**Sơ đồ: Đọc mã lỗi và stop_reason trước, rồi mới chọn retry, sửa request hay đưa sang luồng refusal**
_Bản đồ bài: phân loại tín hiệu rồi rẽ sang retry, circuit breaker, fallback, sửa request hoặc luồng xử lý refusal_

- **RELIABILITY ENGINEERING FOR CLAUDE SERVICES**: request không ra câu
- trả lời dùng được
- **Phân loại**: mã lỗi HTTP
- error_code
- stop_reason
- 1. **Lỗi tạm thời**: 429, 500, 529
- **Lỗi của request**: 400–403, max_tokens
- context window
- **Refusal**: stop_reason refusal
- **Retry and backoff**: retry ở một chỗ, có backoff
- 2. lỗi kéo dài
- **Circuit breaker**: mở thì graceful degradation
- 3. sang chỗ dự phòng
- **Fallbacks**: model, region, nền tảng khác
- 4. **Sửa rồi mới gửi**: tăng max_tokens hoặc
- rút ngắn prompt
- **Safety-handling path**: model dự phòng, đếm riêng
- 5.

## Ví dụ xuyên suốt: trợ lý hội viên của một công ty bảo hiểm sức khoẻ

Một công ty bảo hiểm sức khoẻ ở Mỹ có trợ lý trả lời hội viên về quyền lợi bảo hiểm. Trợ lý chạy Claude Sonnet 5.5 qua Claude API, tức API do Anthropic vận hành trực tiếp. Công ty có thêm tài khoản Amazon Bedrock, dịch vụ của AWS cho gọi Claude trên hạ tầng Amazon, để dự phòng. Quy định nội bộ yêu cầu dữ liệu hội viên chỉ được xử lý trên hạ tầng đặt ở Mỹ.

Đoạn code gọi Claude chỉ làm theo một quy tắc. Gặp lỗi gì cũng gọi lại, tổng cộng tối đa ba lần gọi, vẫn hỏng thì chuyển sang Claude Haiku 5.5. Khi Claude API quá tải kéo dài, đội vận hành còn chuyển tay trợ lý sang Bedrock. Trợ lý gửi kèm file điều khoản của từng gói bảo hiểm bằng `file_id` của Files API, tức mã của file đã upload sẵn lên Anthropic. Rồi công ty gửi email nhắc gia hạn cho 300.000 hội viên, câu hỏi đổ về dồn dập, và hệ thống hỏng ở bốn chỗ:

- Câu trả lời cho văn bản điều khoản dài bị cụt, gửi lại bao nhiêu lần cũng cụt.
- Hàng loạt request nhận lỗi 429 dù mức dùng còn xa giới hạn.
- Khi Claude API quá tải, chuyển sang Bedrock thì mọi request đều bị từ chối.
- Một phần câu hỏi nhận về câu trả lời rỗng mà không dashboard lỗi nào báo.

Bài đi qua từng chỗ hỏng, theo thứ tự đó.

## Phân loại trước khi xử lý

Khi một request không cho ra câu trả lời dùng được, Claude báo cho bạn theo một trong hai cách.

- **Lỗi HTTP** (4xx, 5xx) nghĩa là request thất bại và bạn không có câu trả lời nào. Body lỗi có `error.type`, đôi khi kèm `error.details.error_code` để nói cụ thể chuyện gì xảy ra, vì cùng một mã như 429 có thể do nhiều nguyên nhân. Nếu dùng streaming, tức nhận câu trả lời từng đoạn trong lúc model đang viết, thì lỗi còn có thể tới giữa chừng, sau khi đã nhận mã 200, dưới dạng một event lỗi trong stream.
- **`stop_reason`** là field trong response HTTP 200, cho biết vì sao model dừng viết. Lúc này request đã thành công về mặt HTTP, nhưng phải đọc field này mới biết câu trả lời dùng được hay không, có khi câu trả lời còn rỗng.

Ba trường hợp hay bị xử lý chung một kiểu là rate limit, safety refusal và context-window stop. Bảng dưới liệt kê các tín hiệu hay gặp, gồm cả ba trường hợp đó.

Trong bảng, RPM, ITPM và OTPM là ba giới hạn tính theo phút, lần lượt là số request, số token input và số token output. Backoff là chờ một lúc rồi mới gửi lại. Exponential backoff là mỗi lần thử sau chờ lâu hơn lần trước, thường gấp đôi. Nên nhìn cột "Gửi lại y nguyên?" trước tiên, vì nếu gửi lại mà không đổi gì vẫn ra kết quả cũ thì retry chỉ tốn thêm tiền.

| Tín hiệu | Nghĩa là gì | Gửi lại y nguyên? | Nên làm |
| --- | --- | --- | --- |
| `429` có header `retry-after` | Vượt giới hạn RPM, ITPM hoặc OTPM | Có, sau ít nhất số giây trong header | Backoff, giảm tải |
| `429` với `error_code` là `ramp_limit_exceeded` | Mức dùng tăng quá nhanh | Có, sau `retry-after` | Tăng tải dần từng nấc |
| `429` với `error_code` là `enforced_spend_limit_reached` | Đã tiêu hết hạn mức chi tiêu tháng theo tier (bậc tài khoản), không có `retry-after` | Không | Báo đội vận hành |
| `500`, `529` | Lỗi tạm thời phía Anthropic, API quá tải | Có, với exponential backoff | Nếu kéo dài thì chuyển sang chỗ dự phòng |
| `400`, `401`, `402`, `403` | Request sai cấu trúc hay prompt quá dài, chạm spend limit do bạn tự đặt, lỗi thanh toán (402), hoặc API key sai hay không đủ quyền | Không | Sửa rồi mới gửi |
| `stop_reason` là `max_tokens` | Câu trả lời chạm `max_tokens` bạn đặt | Không, sẽ cụt ở chỗ cũ | Tăng `max_tokens` hoặc cho viết tiếp |
| `stop_reason` là `model_context_window_exceeded` | Prompt cộng câu trả lời đã lấp đầy context window, tức tổng số token model xử lý được trong một lần gọi | Không | Coi như bị cắt, rút ngắn prompt hoặc tài liệu gửi kèm |
| `stop_reason` là `refusal` | Bộ phân loại an toàn từ chối | Không, trên cùng model | Đưa vào luồng xử lý an toàn |

Chỗ hỏng đầu tiên lộ ra khi hội viên dán cả văn bản điều khoản dài vào để hỏi. Câu trả lời bị cụt, và bản Haiku trả về sau ba lần gọi trên Sonnet cũng cụt y như vậy. Xem lại response thì lần gọi nào cũng có `stop_reason` là `max_tokens`.

> **Trong đề chọn gì**
>
> Một câu hỏi mẫu của kỳ thi kể về dịch vụ gặp lỗi gì cũng retry sang model thứ hai. Log từng lần gọi cho thấy rate limit, câu trả lời chạm độ dài tối đa và câu bị từ chối đều đi chung một đường retry. Đáp án đúng là **rẽ nhánh theo loại dừng** (**branch on the stop condition**), tức đọc mã lỗi và `stop_reason` trước rồi mới chọn cách xử lý như bảng ở đầu mục.

## Retry và backoff: SDK, ramp limit và stream bị ngắt

Khi thiết kế retry và backoff, có ba chuyện cần biết.

### SDK đã tự retry

SDK chính thức của Anthropic tự gửi lại các lỗi tạm thời như mất kết nối, 429 hay 5xx. Mặc định SDK thử lại hai lần, dùng exponential backoff, và nếu có `retry-after` thì chờ ít nhất số giây đó. Bạn đổi số lần bằng `max_retries`.

Đoạn code của công ty bảo hiểm lại bọc thêm một vòng gọi tối đa 3 lần. Mỗi lần app gọi, SDK lại tự thử thêm 2 lần, tức tối đa 3 request, nên một câu hỏi có thể thành 3 × 3 = 9 request, đúng vào lúc API đang quá tải. Vì vậy chỉ nên retry ở một chỗ. Hoặc để SDK lo, hoặc đặt `max_retries` bằng 0 rồi tự viết retry trong code của mình khi cần thêm logic như circuit breaker (mục sau). Khi tự viết, cách làm phổ biến là cộng thêm một khoảng chờ ngẫu nhiên (**jitter**), để hàng nghìn client không cùng thử lại vào một thời điểm.

### Vì sao có 429 khi chưa chạm giới hạn

Đây là chỗ hỏng thứ hai. Email nhắc gia hạn vừa đi thì hàng loạt request nhận lỗi 429, dù mức dùng còn xa giới hạn ITPM và OTPM. Ngoài RPM, ITPM và OTPM, API còn giới hạn tốc độ tăng tải (**ramp limit**). Mỗi phút, bạn chỉ được dùng nhiều hơn mức cao nhất gần đây thêm một nấc nhất định. Nếu lưu lượng tăng vọt, dù chỉ dồn trong vài giây, các request vượt mức sẽ bị trả 429 với `error_code` là `ramp_limit_exceeded`.

Khi gặp lỗi này, chờ ít nhất số giây trong `retry-after`, giữ tải ở mức đang chạy ổn, rồi mỗi phút tăng thêm tối đa một nấc. Phần câu hỏi vượt mức trong lúc đó phải xếp hàng chờ.

**Sơ đồ: Tải tăng vọt thì bị 429 dù chưa chạm giới hạn, tăng từng nấc thì qua**

Email đi lúc 9:00:00. Chỉ năm giây sau, lúc 9:00:05, hàng loạt request đã nhận 429. Lúc 9:00:35, app chờ đủ số giây trong `retry-after` và giữ tải ở mức đang chạy ổn. Từ 9:01 tới 9:10, mỗi phút app tăng tải thêm một nấc, còn phần câu hỏi vượt mức thì xếp hàng chờ tới lượt.

Tốt hơn nữa, công ty nên rải đợt email ra nhiều giờ, hoặc cho câu hỏi đi qua một hàng đợi có tốc độ đều (bài 2.2). Riêng 429 do hết hạn mức chi tiêu theo tier thì không có `retry-after`, và mọi lần thử lại, kể cả retry của SDK, đều hỏng cho tới khi hạn mức được nâng.

### Stream bị ngắt giữa chừng

Chuyện thứ ba là khi stream bị ngắt giữa chừng, chẳng hạn vì mất kết nối. Lúc đó không cần chạy lại từ đầu. Hãy lưu phần đã nhận, rồi gửi một request mới có thêm một message `user` chứa phần đó và yêu cầu Claude viết tiếp. Cách này dùng cho model từ Claude 4.6 trở đi. Response của Claude chia thành nhiều block, và bạn chỉ nối tiếp được từ block text cuối cùng. Một block `tool_use` (yêu cầu gọi tool) hay block thinking (phần suy luận) đang viết dở thì phải bỏ.

> **Bẫy đề**
>
> Câu hỏi mẫu về dịch vụ retry mọi lỗi sang model thứ hai có một đáp án sai rất hấp dẫn:
>
> - **Tăng số lần retry và nới khoảng backoff** để nhiều request "rốt cuộc cũng thành công" (_retry more often, with a wider backoff, whatever the failure_). Nghe như làm hệ thống bền hơn. Nhưng câu trả lời đã cụt vì chạm giới hạn độ dài thì gửi lại vẫn cụt, request đã bị từ chối thì gửi lại vẫn bị từ chối, và lần nào cũng tốn token.
>
> **Chọn:** rẽ nhánh theo loại dừng, như bảng ở mục đầu.

## Circuit breaker và graceful degradation

Retry hợp với lỗi lẻ tẻ, chờ vài giây là qua. Khi một model hay một nền tảng hỏng kéo dài, retry chỉ làm người dùng chờ lâu hơn. Lúc đó cần **circuit breaker**, một cơ chế giống cầu dao điện. Khi thấy lỗi nhiều, nó ngắt hẳn đường gửi tới chỗ đang hỏng và đưa request sang chỗ dự phòng. Claude API không có sẵn circuit breaker, nên bạn tự viết. Đây là mẫu quen thuộc trong vận hành hệ thống, với ba trạng thái đặt tên theo cầu dao. Cầu dao đóng thì điện chạy qua, tức request đi bình thường, còn cầu dao mở là đã ngắt.

| Trạng thái | Request đi đâu | Chuyển trạng thái khi |
| --- | --- | --- |
| Đóng | Tới model và nền tảng chính | Tỉ lệ lỗi vượt ngưỡng trong một khoảng thời gian thì sang Mở |
| Mở | Thẳng tới chỗ dự phòng, không thử chỗ đang hỏng | Hết thời gian chờ thì sang Nửa mở |
| Nửa mở | Vài request thăm dò tới chỗ chính | Thăm dò thành công thì về Đóng, hỏng thì quay lại Mở |

Khi dùng circuit breaker với Claude, điều cần cân nhắc nhất là breaker nên đếm những lỗi nào. Mỗi cặp model và nền tảng nên có breaker riêng, và breaker chỉ đếm những tín hiệu cho thấy dịch vụ có vấn đề, là `529`, `500`, timeout và mất kết nối. Không đếm refusal, `max_tokens` hay `400`, vì đó là vấn đề của chính request. Lỗi 429 cũng không nên đếm. Nó chỉ cho biết bạn đang gửi vượt hạn mức của tài khoản mình, nên cách xử lý là gửi chậm lại, chứ không phải chuyển cả hệ thống sang chỗ khác.

Khi breaker mở, dịch vụ xuống một bậc thấp hơn thay vì báo lỗi cho người dùng. Cách này gọi là **graceful degradation**, tức chất lượng giảm dần theo từng bậc chứ không sập hẳn. Công ty bảo hiểm chia thành bốn bậc như sau.

**Sơ đồ: Claude hỏng kéo dài thì xuống bậc, hội viên vẫn có câu trả lời**

Các bậc này chỉ cứu được dịch vụ nếu lo trước ba việc. Trước hết, bậc dự phòng phải gánh được tải. Request chạy trên model nào thì tính vào rate limit của model đó. Nếu Haiku 5.5 chỉ được cấp hạn mức đủ cho 10% lưu lượng, ngày bậc 1 và bậc 2 cùng sập thì bậc 3 sẽ ngập trong 429. Thứ hai, hãy báo cho hội viên biết khi dịch vụ đang ở bậc 3 hay bậc 4, để họ không tưởng chất lượng vẫn như thường. Cuối cùng, thử từng bậc định kỳ, đừng đợi tới lúc có sự cố mới biết bậc 2 không chạy.

> **Bẫy đề**
>
> Câu hỏi mẫu về dịch vụ retry mọi lỗi sang model thứ hai còn hai đáp án sai khác:
>
> - **Chuyển toàn bộ lưu lượng sang model dự phòng vĩnh viễn** (_send all traffic to the fallback model for good_). Nghe hợp lý vì model dự phòng đang trả lời được. Nhưng rate limit, câu trả lời bị cụt và câu bị từ chối vẫn bị xử lý chung một kiểu, chỉ là giờ xảy ra trên model dự phòng.
> - **Tắt hẳn fallback, trả ngay lỗi đầu tiên** (_remove the fallback and return the first error_). Nghe như giúp lỗi lộ ra để dễ sửa. Nhưng khi đó người dùng thấy báo lỗi ngay cả với những sự cố chỉ cần chờ vài giây là qua.
>
> **Chọn:** vẫn là phân loại lỗi trước, rồi mới quyết retry, fallback hay báo lỗi.

## Fallback sang model, region và nền tảng khác

Fallback là khi chỗ chính không phục vụ được thì gửi request sang một chỗ dự phòng. Có ba kiểu là sang model khác (**cross-model**), sang region khác (**cross-region**) và sang nền tảng khác (**cross-platform**). Kiểu nào cũng hỏng nếu request không còn hợp lệ ở nơi mới.

**Sang model khác.** Mỗi model nhận một bộ tham số khác nhau. Lấy một ví dụ chung, không phải tham số trợ lý đang dùng. Chỉ Claude Sonnet 5.5 nhận `thinking: {"type": "between_tools"}`, nên gửi nguyên request đó sang model khác sẽ lỗi 400. Mỗi model cũng trả lời theo cách hơi khác, nên trước khi cho model dự phòng nhận lưu lượng thật, hãy chạy nó qua cùng bộ eval (tập câu hỏi kiểm thử có đáp án chuẩn) mà bạn dùng cho model chính.

**Sang region khác.** Fallback không được phá quy định về nơi xử lý dữ liệu. Trên Claude API, field `inference_geo` quyết định request được xử lý ở đâu. Mặc định nó là `"global"`, tức chạy ở đâu cũng được, còn đặt `"us"` thì request chỉ chạy trên hạ tầng ở Mỹ. Bedrock làm theo cách khác. Endpoint global của Bedrock có thể đưa request tới bất kỳ region nào. Còn inference profile, tức cấu hình gom sẵn các region của một vùng (US, EU, JP hoặc AU), chỉ đưa request qua lại giữa các region trong vùng đó. Công ty bảo hiểm đặt `inference_geo: "us"` trên Claude API và dùng inference profile US trên Bedrock. Nếu fallback sang endpoint global "cho chắc ăn", dịch vụ vẫn chạy nhưng đã vi phạm quy định.

**Sang nền tảng cloud khác.** Đây là chỗ hỏng thứ ba. Trong một đợt Claude API quá tải, đội vận hành chuyển trợ lý sang Bedrock, và mọi request đều bị từ chối. Lý do là Claude trên các nền tảng cloud không có đủ mọi tính năng của Claude API. Vì vậy trước khi fallback, phải kiểm tra nền tảng đích có đủ những tính năng mà request đang dùng không. Chuyện này là **per-platform feature parity**, tức tính năng tương đương giữa các nền tảng. Bảng sau là vài khác biệt hay gặp.

| Tính năng | Claude API | Amazon Bedrock | Google Cloud (Google managed) | Microsoft Foundry |
| --- | --- | --- | --- | --- |
| Message Batches API | Có | Không | Không | Không |
| Files API | Có | Không | Không | Không khi host trên Azure |
| Server-side fallback cho refusal | Có (beta) | Không | Không | Không |
| MCP connector | Có (beta) | Không | Không | Có |
| Claude Managed Agents | Có (beta) | Không | Không | Không |

Trợ lý đính kèm file điều khoản bằng `file_id` của Files API. Bedrock không có Files API nên không hiểu mã này, và request bị từ chối. Cách sửa là cho request ở bậc dự phòng chỉ dùng tính năng nền tảng đó có, chẳng hạn gửi thẳng nội dung tài liệu trong request. Mỗi nền tảng còn đặt tên model theo cách riêng, nên request dự phòng phải dùng đúng model ID của Bedrock.

**Sơ đồ: Gửi nguyên request sang Bedrock thì bị từ chối vì file_id, nên request dự phòng phải đổi ba chỗ**
Bên tham gia: Bedrock, Claude API, Trợ lý

1. file_id, inference_geo "us"
2. 529 kéo dài
3. Cùng request, vẫn kèm file_id
4. ✗ Từ chối: không có Files API
5. Nội dung tài liệu, model ID
6. của Bedrock, profile US
7. ✓ Trả lời, dữ liệu xử lý ở Mỹ

> **Trong đề chọn gì**
>
> Câu hỏi về fallback sang region hay nền tảng khác thường xoay quanh hai điều. Request dự phòng chỉ được dùng tính năng nơi đó có, và không được phá quy định về nơi xử lý dữ liệu. Đáp án chuyển hướng mà bỏ qua một trong hai điều này thì cần nghi ngờ.

## Xử lý refusal

Chỗ hỏng cuối cùng khó thấy nhất. Một phần câu hỏi nhận về câu trả lời rỗng, HTTP 200 nhưng không có chữ nào, nên không dashboard lỗi nào báo. Đó là một refusal, tức model từ chối trả lời.

Các model như Claude Fable 5.2, Opus 5.5, Sonnet 5.5 và Haiku 5.5 chạy kèm bộ phân loại an toàn, và bộ này có thể từ chối request. Khi đó bạn nhận HTTP 200 với `stop_reason: "refusal"`, và `stop_details.category` cho biết nhóm chính sách là `cyber`, `bio`, `frontier_llm`, `reasoning_extraction`, `general_harms`, hoặc `null`. Nếu model từ chối giữa chừng, phần đã viết là chưa hoàn chỉnh và phải bỏ đi.

Gửi lại request đó cho cùng model thì thường lại bị từ chối. Cách đúng là chạy lại trên một model dự phòng. Claude API có sẵn server-side fallback, hiện đang beta. Khi đặt `fallbacks: "default"`, API tự chạy lại request trên model mà Anthropic khuyến nghị cho nhóm từ chối đó, ngay trong cùng một lời gọi. Nhóm nào không có model khuyến nghị thì lời từ chối giữ nguyên.

```python
response = client.beta.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=2048,
    messages=messages,
    fallbacks="default",
    betas=["server-side-fallback-2026-07-01"],
)
```

Nếu nền tảng bạn dùng không có server-side fallback, hoặc model chính là Claude Haiku 5.5 (model này không có server-side fallback), thì dùng middleware fallback có sẵn trong SDK, hoặc tự viết retry.

Có ba chỗ hay hiểu nhầm về refusal và `fallbacks`.

- Chỉ refusal mới kích hoạt `fallbacks`. Với rate limit, quá tải hay lỗi server, API vẫn trả nguyên lỗi về cho bạn, nên vẫn cần retry và circuit breaker của riêng mình.
- Nhóm `reasoning_extraction` không có model dự phòng. Nhóm này thường xuất hiện khi prompt bắt model viết suy luận của mình vào câu trả lời, ví dụ một thẻ phải điền trước khi trả lời hay một field `reasoning` trong JSON. Câu trả lời rỗng của công ty bảo hiểm thuộc nhóm này, vì system prompt của trợ lý yêu cầu "phân tích trong thẻ `<phan_tich>` trước khi trả lời". Cách sửa là sửa prompt. Có thể chỉ xin một lời giải thích ngắn, hoặc bật thinking với `display: "summarized"` để đọc bản tóm tắt phần suy luận.
- Refusal không hiện trên dashboard lỗi, vì nó là HTTP 200. Nên ghi một event mỗi khi có refusal, và một event mỗi khi model dự phòng trả lời thay. Nếu số refusal cao hơn hẳn số câu được trả lời thay, nghĩa là nhiều hội viên đang bị từ chối mà không ai trả lời, và đó là lúc cần cảnh báo.

Vì vậy request bị từ chối nên đi sang một luồng xử lý an toàn riêng (**safety-handling path**), không đi chung đường với retry. Luồng này có thể gồm bước fallback sang model mà Anthropic khuyến nghị. Điều cần tránh là gửi lại mà không đọc `stop_details` xem bị từ chối vì nhóm nào.

> **Ý chính**
>
> Trước khi xử lý, đọc mã lỗi và `stop_reason` để biết mình đang gặp chuyện gì. Lỗi tạm thời thì retry có backoff, và chỉ retry ở một chỗ. Câu trả lời bị cắt thì tăng `max_tokens` hoặc rút ngắn prompt, đừng gửi lại y nguyên. Refusal đi luồng xử lý an toàn. Fallback sang model, region hay nền tảng khác chỉ an toàn khi request vẫn hợp lệ ở nơi mới, vẫn đúng quy định về dữ liệu, và đã được thử trước khi có sự cố.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Claude API errors (Claude API Docs)](https://platform.claude.com/docs/en/api/errors)
3. [Rate limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
4. [Stop reasons and fallback (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
5. [Refusals and fallback (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback)
6. [Context windows (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
7. [Streaming messages (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/streaming)
8. [Data residency (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/data-residency)
9. [Claude in Amazon Bedrock (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)
10. [Claude Models on Google Cloud, Google managed (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai)
11. [Claude in Microsoft Foundry (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry)
