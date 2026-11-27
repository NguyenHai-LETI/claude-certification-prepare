---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/4-1-phan-tich-yeu-cau
ngay_tai: 2026-11-27
tieu_de: Dùng Claude phân tích yêu cầu và use case
---

Domain 4 : Workflow Integration and Solution Design·Task 4.1

# Dùng Claude phân tích yêu cầu và use case

Dùng Claude tổng hợp yêu cầu từ nhiều nguồn có truy vết, xử lý yêu cầu mâu thuẫn, tách nhu cầu khỏi giải pháp, và chọn use case hợp với Claude.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Phân tích yêu cầu từ nhiều nguồn theo đúng thứ tự, có truy vết về nguồn
- Xử lý yêu cầu mâu thuẫn mà không tự quyết thay người nêu yêu cầu
- Nhờ Claude viết lại yêu cầu dạng giải pháp thành kết quả mong muốn
- Nhận ra bước nào trong công việc hợp để Claude hỗ trợ, bước nào không

Trước khi thiết kế bất cứ thứ gì, phải biết người ta thật sự cần gì. Phần này thường tốn nhiều công nhất: đọc biên bản phỏng vấn, tài liệu quy trình cũ, email góp ý, rồi gom lại thành một danh sách yêu cầu rõ ràng. Claude giúp rất nhiều ở đây, nếu bạn giao đúng phần việc.

Bài này giúp bạn trả lời: dùng Claude phân tích yêu cầu thế nào cho đúng, và việc nào trong công việc thì hợp để Claude hỗ trợ?

## Ví dụ xuyên suốt: đặt lịch khám ở bệnh viện tư

Anh Quân ở phòng hành chính của một bệnh viện tư được giao chuẩn bị yêu cầu cho hệ thống đặt lịch khám mới. Anh có:

- Ghi chép phỏng vấn 6 lễ tân, 4 bác sĩ trưởng khoa và trưởng phòng công nghệ thông tin.
- Tài liệu quy trình đặt lịch hiện tại (12 trang).
- 40 phiếu góp ý của bệnh nhân.

## Claude giúp ở đâu

Việc hợp nhất với Claude ở giai đoạn này là **tổng hợp các đầu vào thành một danh sách yêu cầu có cấu trúc, mỗi yêu cầu truy được về nguồn**. Truy vết (**traceability**) nghĩa là với mỗi yêu cầu, bạn biết nó đến từ ai, từ tài liệu nào. Khi có tranh luận, bạn mở lại được đúng chỗ.

Ba cách dùng Claude nghe hợp lý nhưng sai:

- Để Claude tự viết danh sách yêu cầu chỉ từ tên dự án và vài dòng mô tả, vì "dự án nào cũng na ná". Claude sẽ viết ra yêu cầu chung chung, không phải của bệnh viện này.
- Để Claude đi phỏng vấn thay người. Phỏng vấn cần người hỏi lại, đọc phản ứng, xây lòng tin.
- Chỉ dùng Claude để xếp ưu tiên những yêu cầu đã gom tay, bỏ phần gom. Đây lại chính là phần Claude giúp được nhiều nhất.

## Phân tích yêu cầu theo thứ tự

1. 
  - **Gom và gắn nhãn tài liệu nguồn**để mỗi yêu cầu truy được
2. rồi mới
  - **Đưa cho Claude kèm prompt trích yêu cầu có cấu trúc**
3. rồi
  - **Nhóm yêu cầu liên quan, đánh dấu chỗ mâu thuẫn hoặc mơ hồ**
4. rồi kiểm
  - **So kết quả với tài liệu gốc**đúng chưa, đủ chưa
5. cuối cùng
  - **Ghi bộ yêu cầu cuối, kèm nguồn và trạng thái từng yêu cầu**

Gắn nhãn nguồn phải làm **trước** khi đưa cho Claude, vì nếu không thì sau đó không còn cách nào biết yêu cầu nào từ đâu. Prompt trích yêu cầu nên tách rõ từng loại:

```
Từ các tài liệu đính kèm (mỗi tài liệu có nhãn [PV-LeTan-1], [QuyTrinh], [GopY-BN]...),
trích yêu cầu cho hệ thống đặt lịch, chia thành bốn mục:
1. Bắt buộc phải có (must-have)
2. Nên có (nice-to-have)
3. Câu hỏi còn mở
4. Mâu thuẫn: hai nguồn đòi hai điều trái nhau
Mỗi yêu cầu ghi nhãn nguồn. Không thêm yêu cầu nào không có trong tài liệu.
```

> Bẫy đề
>
> Câu luyện thi xếp năm bước phân tích yêu cầu. Đáp án sai hay gặp: nhóm yêu cầu trước khi đưa cho Claude trích, hoặc đưa cho Claude trước khi gom và gắn nhãn nguồn. Đáp án đúng: **gom và gắn nhãn nguồn → đưa cho Claude với prompt trích có cấu trúc → nhóm, đánh dấu mâu thuẫn → kiểm với nguồn gốc → ghi bộ yêu cầu cuối kèm nguồn và trạng thái**.

## Yêu cầu mâu thuẫn

Trong ví dụ, lễ tân muốn bệnh nhân **phải gọi điện xác nhận** trước giờ khám, còn trưởng phòng công nghệ thông tin muốn **xác nhận hoàn toàn tự động** qua tin nhắn. Hai yêu cầu loại trừ nhau.

Cách xử lý đúng: **đánh dấu mâu thuẫn trong tài liệu yêu cầu, ghi rõ nguồn của từng bên, và chuyển lại cho chính những người nêu yêu cầu để họ thống nhất**. Người phân tích không tự chọn bên thắng.

> Bẫy đề
>
> Câu luyện thi về ba yêu cầu mâu thuẫn có ba đáp án sai:
>
> - Chọn yêu cầu có lý do kinh doanh mạnh nhất, gác các yêu cầu kia lại. Người phân tích đang tự quyết thay người có quyền.
> - Đưa cả ba vào tài liệu như các phương án, để "quy trình ra quyết định sau này" lo. Mâu thuẫn bị đẩy đi mà không ai được báo.
> - Nhờ Claude viết câu thoả hiệp rồi đưa cho các bên như đề xuất giải quyết. Thoả hiệp do AI viết chưa chắc đáp ứng nhu cầu thật của bên nào.
>
> Đáp án đúng: **đánh dấu, ghi nguồn từng bên, trả về người nêu yêu cầu để họ quyết**.

## Nhu cầu hay giải pháp

Nhiều yêu cầu được viết thành giải pháp chứ không phải nhu cầu: "cần một màn hình dashboard", "cần thêm nút gọi điện". Nếu làm theo chữ, bạn có thể làm ra thứ người ta không cần.

Claude giúp tốt việc này: nhờ nó **viết lại mỗi mục thành kết quả mong muốn**, và **đánh dấu những mục chưa rõ kết quả mong muốn là gì**, để bạn hỏi lại người nêu.

```
Mỗi yêu cầu dưới đây, viết lại thành kết quả người nêu muốn đạt được
("bác sĩ biết trước số bệnh nhân buổi sáng", không phải "cần dashboard").
Mục nào không đoán được kết quả mong muốn thì đánh dấu [CẦN HỎI LẠI].
```

Đừng nhờ Claude thiết kế luôn cái dashboard được nhắc tới, cũng đừng loại các phiếu ghi tên công cụ rồi bắt nộp lại.

> Trong đề chọn gì
>
> Đề hỏi cách dùng Claude hỗ trợ phân tích yêu cầu: chọn **tổng hợp đầu vào của các bên và tài liệu quy trình thành danh sách yêu cầu có cấu trúc, truy vết về từng nguồn**. Gặp yêu cầu viết thành giải pháp: chọn **viết lại thành kết quả mong muốn và đánh dấu mục chưa rõ**.

## Chọn use case hợp với Claude

Phân tích use case là trả lời: trong chuỗi công việc này, bước nào nên có Claude? Trang hỗ trợ của Claude liệt kê nhiều việc nó làm tốt, như viết ở nhiều thể loại, tóm tắt tài liệu dài, làm bạn trao đổi ý tưởng và dịch. Trong công việc của một đội làm việc với tài liệu, chỗ Claude tạo giá trị nhiều nhất thường là **soạn nháp và tổng hợp từ nhiều nguồn, cho một người duyệt phía sau**.

| Hợp để Claude hỗ trợ | Không nên giao cho Claude |
|---|---|
| Soạn bản cập nhật tình hình từ ghi chép họp | Duyệt bản cuối gửi ra ngoài mà không ai xem lại |
| Tổng hợp tài liệu nghiên cứu từ nhiều file | Đàm phán điều khoản hợp đồng thay công ty |
| Trích yêu cầu từ biên bản phỏng vấn | Quyết định tuyển, thăng chức hay cho thôi việc |
| Soạn nháp email trả lời có người duyệt | Đưa ra cam kết ràng buộc pháp lý thay công ty |

Khoá AI Fluency gọi năng lực này là **Delegation**: quyết định phần nào giao cho AI, phần nào con người giữ. Bài 4.4 nói kỹ hơn về các tiêu chí.

1. Bước này cần gom, tóm tắt, soạn nháp từ nhiều nguồn?Hợp để Claude hỗ trợ, có người duyệt sau
2. Bước này là quyết định cuối về con người, tiền, pháp lý?Con người giữ
3. Bước này cần giao tiếp trực tiếp để xây lòng tin?Con người làm, Claude có thể chuẩn bị câu hỏi
4. Còn lạiChưa rõ: xét hậu quả khi sai và mức cần phán đoán của con người

> Ý chính
>
> Gắn nhãn nguồn trước, để Claude trích yêu cầu có cấu trúc, kiểm lại với nguồn, và trả mâu thuẫn về người nêu yêu cầu. Claude giỏi gom và soạn nháp; quyết định cuối vẫn thuộc về con người.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 4(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [What are some things I can use Claude for? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/7996845-what-are-some-things-i-can-use-claude-for)
3. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
