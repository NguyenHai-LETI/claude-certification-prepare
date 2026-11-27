---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/4-1-go-loi-va-xu-ly-loi
ngay_tai: 2026-11-27
tieu_de: Gỡ lỗi và xử lý lỗi - loại lỗi, cách phục hồi, đọc trace
---

Domain 4: Eval, Testing, and Debugging · Task 4.1

# Gỡ lỗi và xử lý lỗi - loại lỗi, cách phục hồi, đọc trace

Phân loại lỗi Claude API để biết sửa yêu cầu hay thử lại, chọn cách phục hồi, đọc trace tìm kiểu hỏng, và khoanh lỗi ở lớp tích hợp hay ở đầu ra của model.

- 11 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Đọc mã HTTP và loại lỗi để biết nên sửa yêu cầu, chờ thử lại, hay báo người xử lý
- Biết SDK tự thử lại lỗi nào, và phân biệt các loại 429 với lỗi 400 do hạn mức chi tiêu tự đặt
- Coi lỗi kiểm tra đầu ra là một nhánh lỗi có xử lý - thử lại, sửa, phương án dự phòng
- Đọc trace đầy đủ để gọi đúng tên kiểu hỏng trước khi sửa
- Khoanh lỗi ở lớp tích hợp hay ở đầu ra của model, và chia mức độ để quyết định gọi người trực hay chỉ ghi log

Khi một ứng dụng dùng Claude chạy sai, phản xạ thường gặp là đổ cho model: "nó lại bịa", "nó từ chối linh tinh". Nhưng rất nhiều lỗi nằm ở chỗ khác: yêu cầu gửi sai, vượt giới hạn, mất ngữ cảnh, hay dữ liệu của phiên này lọt sang phiên khác.

Bài này giúp bạn trả lời: gặp một lỗi thì xác định nó thuộc loại nào, xử lý thế nào, và làm sao biết lỗi nằm ở code của mình hay ở đầu ra của model?

## Ví dụ xuyên suốt: sàn đấu giá đồ cũ

Một sàn đấu giá đồ cũ dùng Claude đọc ảnh người bán tải lên, viết mô tả sản phẩm và trả về JSON (danh mục, tình trạng, giá gợi ý) để đăng tin. Tháng này đội nhận năm phiếu lỗi:

1. Đúng 20:00, giờ đóng phiên đấu giá, hàng loạt lời gọi bị lỗi 429.
2. Người bán tải lên 40 ảnh độ phân giải cao thì lời gọi bị lỗi 413.
3. Trong phần chat hỏi đáp với người bán, sau vài lượt JSON bắt đầu thiếu trường.
4. Thỉnh thoảng Claude từ chối mô tả một bộ dao làm bếp cổ, dù tuần trước vẫn làm được.
5. Một mô tả nhắc tới "vết xước ở góc trái" mà ảnh không hề có.

## Lỗi HTTP: sửa yêu cầu hay thử lại

API luôn trả lỗi dạng JSON có `error.type`, `error.message` và `request_id`. Mã HTTP cho biết nên làm gì:

| Mã | `error.type` | Nên làm |
| --- | --- | --- |
| 400 | `invalid_request_error` | Sửa yêu cầu: sai định dạng, tham số đã bị bỏ… Thử lại y nguyên không giúp gì |
| 401 | `authentication_error` | Kiểm khoá API: sai, bị thu hồi, hết hạn |
| 403 | `permission_error` | Khoá không có quyền với tài nguyên đó |
| 409 | `conflict_error` | Yêu cầu xung đột với trạng thái hiện tại của một tài nguyên, ví dụ tài nguyên vừa bị sửa đồng thời. Giải quyết xung đột rồi gửi lại |
| 413 | `request_too_large` | Giảm kích thước yêu cầu (Claude API tối đa 128 MB cho Messages) |
| 429 | `rate_limit_error` | Chờ rồi thử lại, theo header `retry-after` nếu có |
| 500 | `api_error` | Thử lại với thời gian chờ tăng dần; vẫn lỗi thì báo hỗ trợ kèm `request_id` |
| 504 | `timeout_error` | Yêu cầu dài: chuyển sang streaming hoặc Batch API |
| 529 | `overloaded_error` | API đang quá tải chung: chờ rồi thử lại |

Phiếu số 2 là 413: thử lại bao nhiêu lần cũng vậy. Cách sửa là thu nhỏ ảnh trước khi gửi hoặc chia ra nhiều lần gọi.

Streaming và `max_tokens` không chữa được mọi lỗi. Streaming giúp tránh lỗi timeout (504) của yêu cầu dài, còn tăng `max_tokens` chỉ giúp khi đầu ra bị cắt với `stop_reason` là `max_tokens`. Lỗi do đầu vào (413), do trạng thái tài nguyên (409) hay do xác thực (401) thì hai cách đó không sửa được.

**Sơ đồ**
1. **400, 413**: yêu cầu có vấn đề **|** **429, 5xx, 529**: lỗi tạm thời **|** **504**: yêu cầu quá dài
   ↓ _nên làm_
2. **Sửa yêu cầu, gửi lại y nguyên không giúp gì** **|** **Chờ rồi thử lại, SDK tự thử 2 lần** **|** **Chuyển sang streaming hoặc Batch API**

SDK chính thức tự thử lại các lỗi tạm thời (lỗi kết nối, 408, 409, 429, 5xx) 2 lần theo mặc định, chờ tăng dần, và theo `retry-after` khi có. Bạn đổi được bằng `max_retries` cho cả client hay từng lời gọi, đặt về 0 để tắt.

> **Trong đề chọn gì**
>
> Câu luyện thi: đồng nghiệp hỏi SDK xử lý lỗi tạm thời (mạng chập chờn, 429 ngắn) thế nào. Chọn **SDK có sẵn cơ chế thử lại cho nhiều lỗi tạm thời, và code ứng dụng cấu hình hay mở rộng được**. Sai: có thử lại nhưng không cấu hình được; chỉ thử lại lỗi mạng, còn 429 phải tự xử lý; chỉ ghi log rồi chạy tiếp.

## Không phải 429 nào cũng giống nhau

Phiếu số 1 cần đọc kỹ hơn, vì có nhiều nguyên nhân khác nhau cho 429:

| Hiện tượng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| 429 có `retry-after` | Vượt giới hạn tốc độ (số yêu cầu, token mỗi phút). API dùng thuật toán token bucket: dung lượng được bù liên tục, và đợt dồn ngắn có thể vượt giới hạn dù trung bình vẫn dưới | Chờ và thử lại; dàn đều lưu lượng |
| 429 khi lưu lượng của tổ chức tăng vọt | Giới hạn tăng tốc (**acceleration limits**) | Tăng lưu lượng từ từ, giữ đều |
| 429 không có `retry-after`, thử lại mãi vẫn lỗi | Tổ chức đã chạm mức chi tiêu tháng của hạng sử dụng; dừng tới 00:00 UTC ngày đầu tháng sau | Thử lại vô ích; nâng hạn mức |
| 400, thông báo bắt đầu bằng "You have reached your specified API usage limits" | Chạm hạn mức chi tiêu do chính bạn đặt | Đổi hạn mức trong Console |

Lỗi 20:00 của sàn là loại đầu: hàng nghìn phiên đóng cùng lúc tạo đợt dồn. Đội vừa để SDK thử lại, vừa đưa việc viết mô tả không gấp vào hàng đợi chạy rải ra.

> **Trong đề chọn gì**
>
> Câu luyện thi: ứng dụng gọi API nhiều trong giờ hành chính, ít vào ban đêm, đội lo vượt giới hạn tốc độ giờ cao điểm. Chọn **xác định giới hạn tốc độ, thiết kế để nằm dưới chúng giờ cao điểm, và thử lại với thời gian chờ tăng dần khi chạm giới hạn**. Sai: chuyển sang streaming để tránh giới hạn; chỉ gộp yêu cầu; chỉ dàn đều lưu lượng mà không có cơ chế thử lại.

## Lỗi kiểm tra đầu ra là một nhánh có xử lý

Phiếu số 3 không có lỗi HTTP: API trả 200, nhưng JSON thiếu trường. Đầu tiên, gọi đúng tên kiểu hỏng: định dạng trôi dần qua nhiều lượt (**format drift**). Cùng prompt, cùng model, thứ duy nhất thay đổi là hội thoại ngày càng dài, nên nguyên nhân nằm ở ngữ cảnh. Cách xử lý là quản lý ngữ cảnh (cắt bớt lượt cũ, nhắc lại yêu cầu định dạng) hoặc kiểm đầu ra; với JSON thì structured outputs ép đúng schema ngay từ lúc sinh.

Khi đầu ra không qua được bước kiểm, đừng coi đó là lỗi chết làm hỏng cả yêu cầu của người dùng. Coi nó là một nhánh lỗi đã biết, theo thứ tự: thử lại (gọi lại thường ra đúng), sửa tại chỗ (thiếu một trường không bắt buộc thì điền giá trị mặc định), phương án dự phòng (chuyển cho người duyệt). Chỉ khi cả ba không được mới báo lỗi.

**Sơ đồ**
1. **Đầu ra không qua bước kiểm**
   ↓ _thử trước_
2. **Gọi lại**: thường ra đúng
   ↓ _vẫn hỏng_
3. **Sửa tại chỗ**: thiếu trường không bắt buộc thì điền mặc định
   ↓ _vẫn hỏng_
4. **Dự phòng**: chuyển cho người duyệt
   ↓ _không được nữa thì mới_
5. **Báo lỗi**

> **Bẫy đề**
>
> Câu luyện thi: ứng dụng coi lỗi kiểm tra đầu ra là lỗi chết, mỗi lần lỗi là cả yêu cầu thất bại. Đúng là **coi lỗi kiểm tra là nhánh lỗi có xử lý, kích hoạt thử lại, sửa hoặc dự phòng trước khi báo lỗi**. Sai: đẩy đầu ra hỏng xuống hệ thống sau; tắt kiểm tra; bảo người dùng tự kiểm.

## Đọc trace trước khi sửa

Đề thi nói tới phân tích trace để xác định kiểu hỏng (**trace analysis to identify failure modes**). Trace đầy đủ của một lời gọi gồm: system prompt, toàn bộ `messages` (kể cả kết quả tool), tham số, model, đầu ra, `stop_reason`, `usage` và `request_id`. Nhiều ca tưởng là "cùng prompt" hoá ra khác nhau ở phần ngữ cảnh tích tụ hay kết quả tool, và chỉ trace mới cho thấy.

Phiếu số 4 và 5 đều phải bắt đầu từ trace:

- **Từ chối**: phản hồi có `stop_reason: "refusal"` kèm `stop_details` cho biết nhóm chính sách nào kích hoạt. Trace của chính các yêu cầu bị từ chối cho thấy cái gì đi kèm câu hỏi: system prompt mới sửa, nội dung truy xuất, hay chữ trong ảnh.
- **Thông tin không có trong đầu vào**: có thể là model bịa thật, cũng có thể là mất ngữ cảnh (ảnh bị cắt bớt), prompt injection (chữ trong ảnh ra lệnh), hay dữ liệu phiên trước lọt sang. Trong ví dụ, trace cho thấy "vết xước ở góc trái" đến từ mô tả của món hàng trước, vì code dùng chung một danh sách `messages` giữa hai người bán. Đổi sang model lớn hơn sẽ không sửa được lỗi này.

**Sơ đồ**
1. **Món hàng trước**: mô tả có "vết xước ở góc trái" **|** **Món hàng của người bán này**: ảnh không có vết xước
   ↓ _code dùng chung một danh sách messages giữa hai người bán_
2. **Claude đọc cả hai trong cùng một hội thoại**
   ↓ _kết quả_
3. **Mô tả nhắc tới vết xước không có trong ảnh**: lỗi ở code dựng messages, không phải model bịa

> **Bẫy đề**
>
> Hai câu luyện thi cùng một ý. Ứng dụng chạy tốt khi test, lên production thì thỉnh thoảng nhắc thông tin không có trong đầu vào, đội cho là model bịa: bước đầu là **xem trace production để xác định là bịa, mất ngữ cảnh, prompt injection hay kiểu hỏng khác**, không phải đổi model lớn hơn, thêm RAG hay thêm câu "đừng bịa" vào prompt. Ứng dụng thỉnh thoảng từ chối câu hỏi hợp lệ: bước đầu là **xem trace của chính các yêu cầu bị từ chối**, trước khi thử bỏ chỉ dẫn hay thống kê phân bố.

Câu luyện thi khác hỏi cách gỡ lỗi có hệ thống khi đầu ra không nhất quán cho đầu vào giống nhau. Đáp án là **thu trace đầy đủ (đầu vào, system prompt, tin nhắn, đầu ra, tham số) rồi so lần chạy nhất quán với lần không nhất quán**. Hạ temperature là đáp án sai, và với API phiên bản mới, tham số này còn không tồn tại nữa.

## Lỗi ở lớp tích hợp hay ở đầu ra của model

Đề thi gọi đây là khoanh vùng nguồn gốc lỗi giữa lớp tích hợp và đầu ra của model (**problem origin isolation**). Một cách hỏi nhanh:

1. **Có mã lỗi HTTP?** → Lớp tích hợp: yêu cầu, khoá, giới hạn, mạng, kích thước
2. **stop_reason là max_tokens?** → Lớp tích hợp: đặt max_tokens quá thấp, câu trả lời bị cắt
3. **stop_reason là refusal?** → Xem stop_details và trace: system prompt, nội dung đi kèm
4. **Đầu vào trong trace sai hoặc lẫn dữ liệu khác?** → Lớp tích hợp: code dựng messages
- **Còn lại** → Đầu vào đúng mà đầu ra sai: vấn đề ở prompt, ngữ cảnh hay schema

Cuối cùng, không phải lỗi nào cũng cần đánh thức người trực. Chia mức độ theo hai tiêu chí: ảnh hưởng (bao nhiêu người dùng, có mất dữ liệu không) và khả năng tự phục hồi (SDK thử lại có hết không). 429 tự hết sau khi thử lại thì chỉ ghi log; lỗi làm hỏng việc đăng tin hàng loạt thì gọi người trực.

**Sơ đồ**
1. **Một lỗi xảy ra**
   ↓ _xét ảnh hưởng và khả năng tự phục hồi_
2. **429 tự hết sau khi thử lại**: chỉ ghi log **|** **Hỏng việc đăng tin hàng loạt**: gọi người trực

> **Trong đề chọn gì**
>
> Câu luyện thi: mọi lỗi API đang được ghi log cùng một mức. Chọn **phân loại lỗi theo mức độ dựa trên ảnh hưởng và khả năng tự phục hồi, rồi định tuyến từng loại sang kênh gọi người trực hoặc ghi log**. Sai: gọi người trực cho mọi lỗi; tắt log cho lỗi không gọi người; giữ nguyên một mức cho đơn giản.

> **Ý chính**
>
> Mã HTTP cho biết sửa yêu cầu (400, 413), chờ thử lại (429, 5xx, 529) hay đổi cách gọi (504). Đầu ra sai mà API trả 200 thì đọc trace trước khi sửa, gọi đúng tên kiểu hỏng, rồi khoanh xem lỗi ở code dựng yêu cầu hay ở prompt và ngữ cảnh.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 4](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Claude API errors (Claude API Docs)](https://platform.claude.com/docs/en/api/errors)
3. [Rate limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
4. [Python SDK (Claude API Docs)](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python)
5. [Working with the Messages API (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
6. [Reduce hallucinations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
