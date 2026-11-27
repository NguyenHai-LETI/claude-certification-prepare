---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/4-3-thiet-ke-giai-phap
ngay_tai: 2026-11-27
tieu_de: Dùng Claude thiết kế giải pháp, làm bản mẫu và làm lặp
---

Domain 4 : Workflow Integration and Solution Design·Task 4.3

# Dùng Claude thiết kế giải pháp, làm bản mẫu và làm lặp

Nêu vấn đề và ràng buộc trước, đặt khung trước khi xin ý tưởng, chia việc lớn thành giai đoạn, làm bản mẫu bằng artifact và sửa theo góp ý cụ thể.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Bắt đầu thiết kế giải pháp bằng vấn đề và ràng buộc
- Đặt khung (mục tiêu, thước đo, người dùng) trước khi nhờ Claude lên ý tưởng
- Đi từ ý tưởng tới bản mẫu tới bản cuối theo đúng thứ tự
- Làm lặp theo góp ý mà không phá phần đã được duyệt

Nhờ Claude "nghĩ cho tôi một giải pháp" thì lúc nào cũng nhận được giải pháp. Vấn đề là giải pháp cho bài toán nào. Thiết kế giải pháp với Claude thành công hay không phụ thuộc nhiều vào những gì bạn làm **trước khi** xin ý tưởng.

Bài này giúp bạn trả lời: đi từ vấn đề tới giải pháp cùng Claude theo các bước nào, và làm lặp ra sao?

## Ví dụ xuyên suốt: thẻ hội viên của trung tâm thể thao

Anh Dũng quản lý một trung tâm thể thao có hồ bơi, phòng gym và sân cầu lông. Doanh thu bán lẻ từng buổi đang giảm, khách đến không đều. Ban giám đốc muốn thiết kế một chương trình thẻ hội viên mới và giao anh làm cùng Claude.

## Bước đầu tiên: vấn đề và ràng buộc

Bước **đầu tiên** khi thiết kế giải pháp không phải là xin ý tưởng, mà là **nêu rõ vấn đề giải pháp phải giải quyết và các ràng buộc**. Chưa có hai thứ này thì không có gì để so các ý tưởng.

Với anh Dũng:

- **Vấn đề**: doanh thu bán lẻ giảm, khách đến không đều, giờ thấp điểm (10 giờ sáng đến 3 giờ chiều) gần như trống.
- **Ràng buộc**: không tăng nhân sự; hồ bơi chỉ chứa 60 người cùng lúc; phải chạy được trên phần mềm bán vé hiện tại; ra mắt trong 2 tháng.

Thứ tự hợp lý của một vòng thiết kế:

1. 
  - **Nêu vấn đề và ràng buộc**
2. rồi mới
  - **Nhờ Claude đưa nhiều ý tưởng khác nhau**
3. so từng ý tưởng với ràng buộc
  - **Chọn một phương án**
4. rồi mới làm chi tiết
  - **Làm bản mẫu cho các bên góp ý**

↻Góp ý cụ thể thì sửa đúng chỗ, rồi đưa xem lại

> Bẫy đề
>
> Câu luyện thi hỏi bước làm **đầu tiên** khi dùng Claude thiết kế giải pháp. Ba đáp án sai là các bước đến sau: nhờ Claude đưa ý tưởng theo nhiều phong cách; so các ý tưởng với ràng buộc rồi chọn; làm bản thiết kế chi tiết cho các bên duyệt. Đáp án đúng: **nêu vấn đề giải pháp phải giải quyết và các ràng buộc**.

## Đặt khung trước khi xin ý tưởng

Với việc sáng tạo như chiến dịch hay chương trình mới, cần thêm một lớp khung nữa trước khi xin ý tưởng:

- **Mục tiêu và thước đo thành công**: tăng 300 thẻ hội viên trong 3 tháng; lấp 40% chỗ trống giờ thấp điểm.
- **Giọng thương hiệu và người dùng**: trung tâm gần gũi, cho gia đình; khách chính là phụ huynh có con 6–14 tuổi và người về hưu.

Khoá AI Fluency gọi việc hiểu rõ mình đang muốn đạt điều gì trước khi giao cho AI là **Problem Awareness**, một phần của Delegation.

```
Bối cảnh: trung tâm thể thao gia đình, doanh thu bán lẻ giảm, giờ 10h–15h gần như trống.
Mục tiêu: +300 thẻ hội viên trong 3 tháng; lấp 40% chỗ trống giờ thấp điểm.
Người dùng chính: phụ huynh có con 6–14 tuổi, người về hưu. Giọng gần gũi.
Ràng buộc: không tăng nhân sự; hồ bơi tối đa 60 người; chạy trên phần mềm bán vé hiện có.
Đề xuất 5 mô hình thẻ khác hẳn nhau. Mỗi mô hình: cách tính phí, ai hợp nhất,
ràng buộc nào có nguy cơ vi phạm. Chưa cần chọn mô hình tốt nhất.
```

> Trong đề chọn gì
>
> Đề hỏi hai bước phải xong **trước khi** nhờ Claude lên ý tưởng chiến dịch: chọn **định mục tiêu và thước đo thành công** và **định giọng thương hiệu và người nghe**. Các việc như lên lịch ra mắt với đối tác, chọn ý tưởng vào vòng cuối, xem lại ý tưởng Claude đưa để chọn hai cái tốt nhất đều đến sau.

## Việc lớn: chia giai đoạn trước khi làm chi tiết

Nếu giải pháp là cả một trải nghiệm (thiết kế lại toàn bộ quy trình đón hội viên mới, từ lúc đăng ký tới buổi tập thứ mười), đừng nhờ Claude viết ngay tài liệu chi tiết cho từng bước. Hai việc phải xong trước: **định mục tiêu chung của cả trải nghiệm** và **xác định các giai đoạn lớn** (đăng ký, buổi đầu, tháng đầu, giữ chân). Có khung rồi mới làm chi tiết từng giai đoạn (bài 1.2). Thử với một nhóm nhỏ, đàm phán ngân sách hay triển khai toàn bộ là các bước rất sau.

## Bản mẫu và làm lặp

Khi đã chọn được phương án, một bản mẫu cụ thể giúp các bên góp ý tốt hơn nhiều so với một đoạn mô tả. Với anh Dũng, đó có thể là một trang giới thiệu thẻ hội viên có bảng so sánh các gói và một ô tính thử chi phí theo số buổi tập. Thứ mà cả nhóm sẽ sửa tiếp và chia sẻ cho ban giám đốc nên làm thành **artifact**: nó mở cạnh cuộc chat, sửa được, quay lại được và chia sẻ được.

Sau buổi góp ý, ban giám đốc nêu đúng hai điểm: giá gói gia đình quá cao, và thiếu gói cho người về hưu. Phần còn lại đã duyệt. Vòng lặp tốt là **sửa đúng hai điểm đó, giữ nguyên phần khác, và ghi lại đã đổi gì** cho lần xem sau (bài 2.5). Viết lại cả bản mẫu, hay tiện tay thêm cải tiến mình nghĩ ra, đều làm người duyệt phải xem lại từ đầu.

Nếu muốn thử một hướng khác mà không mất bản đang có, trang hỗ trợ về artifact gợi ý sửa lại một tin nhắn cũ để tạo nhánh mới của cuộc chat, nhánh đó có artifact riêng.

1. Đã nêu vấn đề và ràng buộc chưa?Nêu trước khi xin ý tưởng
2. Việc sáng tạo, đã có mục tiêu, thước đo, người dùng chưa?Đặt khung trước
3. Giải pháp lớn, nhiều giai đoạn?Định mục tiêu chung và các giai đoạn trước khi làm chi tiết
4. Đã chọn phương án?Làm bản mẫu bằng artifact cho các bên góp ý
5. Còn lạiCó góp ý cụ thể: sửa đúng chỗ, giữ phần đã duyệt, ghi lại thay đổi

> Ý chính
>
> Vấn đề và ràng buộc trước, khung trước ý tưởng, giai đoạn trước chi tiết. Làm bản mẫu để các bên góp ý, rồi sửa đúng những gì được góp ý.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 4(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [What are artifacts and how do I use them? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)
3. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
