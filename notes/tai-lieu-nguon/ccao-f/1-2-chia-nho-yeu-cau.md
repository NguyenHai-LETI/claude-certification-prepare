---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/1-2-chia-nho-yeu-cau
ngay_tai: 2026-11-27
tieu_de: Chia nhỏ một yêu cầu phức tạp
---

Domain 1 : Prompting and Task Execution·Task 1.2

# Chia nhỏ một yêu cầu phức tạp

Dấu hiệu nào cho thấy nên chia một yêu cầu lớn thành nhiều bước, sắp các bước theo phụ thuộc ra sao, và vì sao phần tóm tắt luôn viết sau cùng.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Nhận ra khi nào một yêu cầu nên chia nhỏ, khi nào một prompt là đủ
- Sắp các bước theo phụ thuộc, việc nào cần kết quả của việc nào
- Kiểm kết quả giữa các bước trước khi làm bước sau
- Tránh các cách chia nghe hợp lý nhưng làm hỏng kết quả cuối

Có những việc bạn gõ một lần là Claude làm xong. Có những việc, gõ một lần thì nhận về một bản dài, trông đủ cả, nhưng phần nào cũng hời hợt và bạn không biết sai bắt đầu từ đâu. Chia nhỏ (**task decomposition**) là cách xử lý loại việc thứ hai.

Bài này giúp bạn trả lời: khi nào nên chia, chia theo thứ tự nào, và chia xong thì làm sao để các phần ghép lại khớp nhau?

## Ví dụ xuyên suốt: hội chợ việc làm của trường đại học

Anh Tuấn ở phòng Quan hệ doanh nghiệp của một trường đại học được giao chuẩn bị hội chợ việc làm cho 3.000 sinh viên. Trưởng phòng muốn có bốn thứ trong tuần này:

1. Danh sách 40 doanh nghiệp nên mời, xếp theo ngành học của sinh viên.
2. Thư mời gửi doanh nghiệp.
3. Kế hoạch truyền thông tới sinh viên.
4. Một bản tóm tắt một trang cho ban giám hiệu.

Anh Tuấn định dán hết dữ liệu vào và nhờ Claude "lên toàn bộ kế hoạch hội chợ".

## Khi nào nên chia

Trang hỗ trợ của Claude khuyên chia yêu cầu phức tạp thành các bước nhỏ. Nhưng không phải việc nào cũng cần chia. Hai dấu hiệu mạnh nhất:

- **Yêu cầu gói nhiều sản phẩm khác hẳn nhau, cho người đọc khác nhau.** Thư mời viết cho doanh nghiệp, kế hoạch truyền thông viết cho đội sinh viên tình nguyện, bản tóm tắt viết cho ban giám hiệu. Mỗi cái cần giọng, độ dài và tiêu chí riêng.
- **Phần sau chỉ có giá trị khi phần dữ kiện phía trước đúng.** Thư mời và kế hoạch đều dựa trên danh sách doanh nghiệp. Danh sách sai thì mọi thứ phía sau sai theo.

Ngược lại, một sản phẩm duy nhất, đầu vào rõ, khuôn quen thuộc thì một prompt viết tốt là đủ. Chia thêm chỉ tốn công.

> Bẫy đề
>
> Câu luyện thi hỏi hai dấu hiệu mạnh nhất cho thấy nên chia. Đáp án sai hay gặp: prompt dài vì dán nhiều bối cảnh; muốn kết quả trình bày dạng bảng; chủ đề mình đã lâu không làm. Dài, dạng bảng hay lạ tay đều không phải lý do để chia. Đáp án đúng: **nhiều sản phẩm cho người đọc và mục đích khác nhau**, và **phần sau phụ thuộc phần dữ kiện phía trước có đúng không**.

## Sắp các bước theo phụ thuộc

Chia xong, thứ tự các bước do phụ thuộc quyết định: bước nào cần kết quả của bước nào. Với một việc đánh giá, chọn lựa, thứ tự gần như luôn là:

1. 
  - **Định tiêu chí**thế nào là doanh nghiệp nên mời
2. tiêu chí quyết định cần thu thập gì
  - **Gom dữ liệu theo tiêu chí**ngành, số vị trí tuyển, từng tham gia chưa
3. có dữ liệu rồi mới chấm được
  - **Chấm và xếp hạng**chọn 40 doanh nghiệp

Làm ngược (chấm trước rồi mới định tiêu chí, hay xếp hạng khi chưa có dữ liệu) thì kết quả chỉ là cảm tính được trình bày cho có vẻ khoa học.

Với một báo cáo nhiều phần, mỗi phần có nguồn và người phụ trách riêng, thứ tự hợp lý là:

1. Chốt mục tiêu của cả báo cáo.
2. Gom đầu vào cho từng phần.
3. Soạn từng phần trong một prompt riêng.
4. Viết bản tóm tắt **sau cùng**, từ các phần đã soạn.

Áp vào hội chợ: danh sách doanh nghiệp làm trước, rồi thư mời và kế hoạch truyền thông, bản tóm tắt một trang cho ban giám hiệu làm cuối cùng.

> Bẫy đề
>
> Câu luyện thi về báo cáo cuối năm ba mảng (tài chính, vận hành, khách hàng) có ba đáp án sai nghe rất hợp lý:
>
> - Soạn bản tóm tắt trước "để định hướng câu chuyện", rồi viết các phần cho khớp. Sai vì tóm tắt phải phản ánh nội dung, không phải bắt nội dung chiều theo nó.
> - Soạn ba phần song song rồi ghép lại, sửa nhẹ. Sai vì thiếu bước tổng hợp, báo cáo thành ba mảnh rời.
> - Đưa hết tài liệu vào một prompt và xin cả báo cáo trong một lần. Sai vì đó chính là việc không chia.
>
> Đáp án đúng: **định mục tiêu, gom đầu vào từng phần, soạn từng phần riêng, rồi tổng hợp tóm tắt từ các phần đã soạn**.

## Kiểm giữa các bước

Lợi ích lớn nhất của việc chia không phải là prompt ngắn hơn, mà là bạn **xem được kết quả giữa chừng**. Tài liệu prompting của Anthropic nói chia một việc thành chuỗi bước vẫn có ích khi bạn cần xem lại kết quả trung gian, hoặc muốn ép một trình tự cố định.

Trong ví dụ, anh Tuấn nên dừng sau bước danh sách doanh nghiệp: đọc lại, gạch bớt hai công ty vừa giải thể, thêm một công ty đối tác lâu năm. Chỉ khi danh sách đã đúng mới nhờ Claude viết thư mời. Nếu gộp tất cả vào một lần, lỗi ở danh sách sẽ âm thầm lan sang thư mời và kế hoạch.

Một kiểu chuỗi bước rất hay dùng là **soạn → tự soát → sửa**: nhờ Claude viết bản nháp, rồi nhờ nó soát bản nháp theo tiêu chí bạn đưa, rồi sửa theo kết quả soát.

```
Đây là thư mời bạn vừa soạn. Hãy soát lại theo 3 tiêu chí:
1. Có nêu rõ ngày, giờ, địa điểm và hạn xác nhận không?
2. Có nói doanh nghiệp được gì khi tham gia không?
3. Có dưới 200 chữ không?
Liệt kê chỗ chưa đạt, rồi viết lại bản đã sửa.
```

> Trong đề chọn gì
>
> Đề hỏi thứ tự khi chia một việc có bước chọn lựa, đánh giá: chọn **tiêu chí trước, dữ liệu sau, chấm và xếp hạng cuối**. Đề hỏi thứ tự cho báo cáo nhiều phần: chọn đáp án có **tóm tắt viết cuối cùng**, từ các phần đã soạn.

## Chia trước khi viết chi tiết

Có những việc lớn tới mức chưa biết chia thế nào, như "thiết kế lại quy trình đón sinh viên năm nhất". Khi đó, bước đầu tiên không phải là nhờ Claude viết chi tiết bất kỳ phần nào, mà là **định mục tiêu chung và các giai đoạn lớn**. Có khung rồi mới chia được từng giai đoạn thành việc cụ thể.

Bạn có thể nhờ chính Claude giúp bước này:

```
Tôi cần chuẩn bị hội chợ việc làm cho 3.000 sinh viên trong 6 tuần.
Đừng soạn chi tiết vội. Hãy đề xuất các giai đoạn lớn,
mỗi giai đoạn cần đầu vào gì và làm ra cái gì,
và giai đoạn nào phụ thuộc giai đoạn nào.
```

1. Yêu cầu gồm nhiều sản phẩm cho người đọc khác nhau?Chia theo sản phẩm
2. Phần sau dựa trên dữ kiện của phần trước?Chia, và kiểm phần trước rồi mới làm tiếp
3. Việc quá lớn, chưa biết chia sao?Định mục tiêu và các giai đoạn lớn trước
4. Còn lạiMột sản phẩm, đầu vào rõ: viết một prompt tốt là đủ

> Ý chính
>
> Chia nhỏ khi có nhiều sản phẩm khác nhau hoặc phần sau phụ thuộc phần trước. Sắp bước theo phụ thuộc, kiểm kết quả giữa các bước, và luôn viết phần tóm tắt sau cùng.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 1(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
3. [My prompt isn't giving me a helpful answer (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
