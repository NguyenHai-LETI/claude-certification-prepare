---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/3-3-chon-model-theo-viec
ngay_tai: 2026-11-27
tieu_de: Chọn model theo yêu cầu của việc
---

Domain 3 : Product and Model Selection·Task 3.3

# Chọn model theo yêu cầu của việc

Cân chi phí, tốc độ và chất lượng khi chọn model, các bước phải xong trước khi thử model, và vì sao khâu kiểm phía sau ảnh hưởng tới lựa chọn.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Ghép model với việc theo khối lượng, độ trễ và độ sâu suy luận cần có
- Làm đúng thứ tự, định yêu cầu trước rồi mới thử model
- Thử effort trước khi đổi model, và chỉ nâng khi thấy thiếu cụ thể
- Tính tới khâu người kiểm phía sau khi chọn model

"Dùng model mạnh nhất cho chắc" nghe an toàn, nhưng với việc khối lượng lớn thì vừa chậm vừa tốn. "Dùng model rẻ nhất cho tiết kiệm" thì hỏng ở những việc cần suy luận sâu. Chọn model là cân ba thứ: chi phí, tốc độ và chất lượng.

Bài này giúp bạn trả lời: chọn model cho một việc dựa vào đâu, và làm theo các bước nào?

## Ví dụ xuyên suốt: tổng đài của chuỗi cửa hàng điện máy

Một chuỗi điện máy có 50 cửa hàng. Ba nhóm cùng dùng Claude:

1. **Tổng đài**: mỗi ngày soạn khoảng 2.000 câu trả lời nháp ngắn cho tin nhắn của khách (hỏi giờ mở cửa, tình trạng đơn, chính sách đổi trả). Cần nhanh, rẻ.
2. **Phòng vận hành**: mỗi tuần tóm tắt 15 cuộc họp giao ban, không cần suy luận sâu.
3. **Phòng pháp chế**: phân tích một vụ tranh chấp hợp đồng với nhà cung cấp, nhiều điều khoản chồng chéo, có luật sư duyệt.

## Ghép model với việc

| Việc | Đặc điểm | Model hợp |
|---|---|---|
| Trả lời nháp cho tin nhắn khách | Khối lượng lớn, câu ngắn, cần nhanh, suy luận nhẹ | Dòng nhanh và rẻ nhất (Haiku) |
| Tóm tắt họp hằng tuần | Khối lượng vừa, không cần suy luận sâu, cần chất lượng ổn | Dòng cân bằng (Sonnet) |
| Tranh chấp hợp đồng | Suy luận pháp lý nhiều bước, ít việc nhưng rất khó | Dòng suy luận sâu nhất (Opus), chấp nhận tốn hạn mức hơn |

Đây cũng là câu hỏi mẫu thứ hai trong tài liệu chính thức của đề thi: tạo nhiều câu trả lời ngắn cho khách, tốc độ và chi phí quan trọng hơn suy luận sâu. Đáp án là **model nhanh hơn, rẻ hơn, hợp với việc đơn giản khối lượng lớn**; giữ model mạnh nhất cho việc suy luận phức tạp. Dùng model mạnh nhất cho mọi câu trả lời thì lãng phí chi phí và thời gian chờ.

> Bẫy đề
>
> Câu luyện thi có hai việc: phân loại khối lượng lớn tin nhắn ngắn mỗi ngày, và một phân tích sâu vụ tranh chấp hợp đồng. Ba đáp án sai đều dùng một model cho cả hai: dùng dòng đang mở sẵn vì "dòng nào trả lời cũng như nhau"; dùng dòng sâu nhất cho cả hai vì "mạnh nhất không bao giờ dở"; dùng dòng nhanh nhất cho cả hai vì "các dòng chủ yếu khác tốc độ". Đáp án đúng: **dòng nhanh và rẻ nhất cho việc phân loại khối lượng lớn**, **dòng suy luận sâu nhất cho vụ tranh chấp**.

Hai cách ghép sai khác cũng hay gặp: chọn model mạnh chỉ vì nó đắt nhất, và dùng model mạnh cho việc rút một từ khoá với khối lượng cực lớn. Ngược lại, dùng model nhẹ cho việc tổng hợp chiến lược từ nhiều tài liệu phức tạp cũng là ghép sai.

## Định yêu cầu trước khi thử model

Khi đưa một khối việc mới vào dùng thường xuyên, đừng mở model ra thử ngay. Tài liệu của Anthropic về chọn model nói hãy xác định tiêu chí trước: năng lực cần có, tốc độ phản hồi, chi phí, và mức effort. Thứ tự hợp lý:

1. 
  - **Định mức chất lượng, độ trễ chấp nhận được, khối lượng dự kiến**
2. rồi mới
  - **Chọn model ứng viên theo các yêu cầu đó và năng lực đã biết**
3. hai việc trên phải xong trước khi thử
  - **Chạy thử trên mẫu việc thật**
4. so với định nghĩa kết quả tốt
  - **Chọn model nhẹ nhất đạt chuẩn ổn định**

↻Có model mới thì thử lại

Với việc hằng tuần nhỏ hơn, như tóm tắt họp, cách làm gọn hơn nhưng cùng tinh thần: **viết ra thế nào là kết quả tốt, chạy một mẫu thật trên dòng mặc định, so với định nghĩa đó, chỉ đổi dòng ở chỗ còn thiếu**.

> Trong đề chọn gì
>
> Đề hỏi hai việc phải xong **trước khi** thử các model ứng viên: chọn **định mức chất lượng, độ trễ, khối lượng** và **chọn model ứng viên theo các yêu cầu đó**. Các việc như đưa model vào chạy thật, thử lại khi có phiên bản mới, ký duyệt kế hoạch triển khai đều đến sau. Đề hỏi thứ tự cho việc hằng tuần mới: chọn **định nghĩa kết quả tốt → chạy mẫu thật trên dòng mặc định → so → chỉ đổi dòng khi thiếu**. Loại các thứ tự chạy thử trước rồi mới định nghĩa kết quả tốt.

## Chỉnh effort trước khi đổi model

Tài liệu chọn model của Anthropic có một câu đáng nhớ: chỉnh effort thường là cách tốt hơn đổi model. Trong app, effort chỉnh ngay trong menu model: hạ xuống Low hoặc Medium cho việc thường để dùng hạn mức lâu hơn, nâng lên cho việc khó.

Với phòng vận hành, nếu bản tóm tắt họp bằng Sonnet đôi khi bỏ sót quyết định quan trọng, thử nâng effort hoặc sửa prompt (liệt kê các mục bắt buộc) trước khi chuyển sang Opus.

## Tính tới khâu kiểm phía sau

Hai khối việc giống hệt nhau về khối lượng và chủ đề vẫn có thể cần chọn khác nhau. Câu trả lời nháp của tổng đài được nhân viên đọc và sửa trước khi gửi; nếu một ngày nào đó chuỗi cho tự gửi thẳng không ai đọc, khối việc đó mất lưới an toàn và phải tự gánh chất lượng. Lúc đó cần chọn model và cách kiểm kỹ hơn. Cân nhắc quan trọng nhất là **khâu người kiểm phía sau bắt được bao nhiêu lỗi**, không phải chức vụ người phụ trách hay khối lượng giống nhau.

1. Khối lượng lớn, câu ngắn, cần nhanh, suy luận nhẹ?Dòng nhanh và rẻ nhất
2. Việc hằng ngày, cần cân tốc độ và chất lượng?Dòng cân bằng
3. Suy luận nhiều bước, ít việc nhưng khó?Dòng suy luận sâu nhất
4. Kết quả chưa đạt?Sửa prompt, nâng effort, rồi mới lên dòng cao hơn
5. Còn lạiChưa biết: định yêu cầu, thử mẫu thật trên dòng mặc định

> Ý chính
>
> Ghép model với việc theo khối lượng, độ trễ và độ sâu suy luận. Định yêu cầu trước khi thử, thử trên mẫu thật, chỉnh prompt và effort trước khi đổi model, và nhớ tính tới khâu người kiểm phía sau.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 3 và câu hỏi mẫu 2(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Choosing the right model (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
3. [Models overview (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/about-claude/models/overview)
4. [Change the model, effort, and thinking settings (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
