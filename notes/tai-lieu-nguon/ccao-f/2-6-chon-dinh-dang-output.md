---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/2-6-chon-dinh-dang-output
ngay_tai: 2026-11-27
tieu_de: Sắp xếp thông tin và chọn khuôn đầu ra
---

Domain 2 : Output Evaluation and Validation·Task 2.6

# Sắp xếp thông tin và chọn khuôn đầu ra

Gom và lọc thông tin trước khi trình bày, rồi chọn trả lời trong chat, artifact, file hay bảng dữ liệu theo cách người đọc sẽ dùng.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Gom và lọc thông tin trước khi nhờ Claude trình bày
- Chọn trả lời trong chat, artifact, file hay dữ liệu có cấu trúc theo cách kết quả được dùng
- Biết khi nào Claude tạo artifact và artifact làm được gì
- Dùng bảng cho dữ liệu nhiều bản ghi, và kiểm phép tính bằng code execution

Cùng một kết quả phân tích, người này cần một câu trả lời ngắn ngay trong chat, người khác cần một bảng để lọc, người nữa cần một trang tài liệu để sửa tiếp với cả nhóm. Chọn sai khuôn thì kết quả đúng vẫn khó dùng.

Bài này giúp bạn trả lời: sắp xếp thông tin thế nào trước khi trình bày, và chọn khuôn đầu ra nào cho từng cách dùng?

## Ví dụ xuyên suốt: góp ý sau khoá đào tạo lễ tân

Phòng đào tạo của một chuỗi khách sạn vừa xong khoá đào tạo lễ tân cho 12 khách sạn, thu về 300 phiếu góp ý (điểm 1–5 và một ô nhận xét). Chị Trâm, trưởng phòng, cần:

1. Trả lời nhanh câu sếp hỏi: "Điểm trung bình bao nhiêu?"
2. Một bảng điểm theo từng khách sạn, từng buổi học.
3. Một bản tổng hợp nhận xét để gửi các quản lý khách sạn, có thể sửa tiếp trong vài tuần.
4. Một file Excel cho phòng nhân sự lọc theo khách sạn.

## Sắp xếp thông tin trước khi trình bày

Đổ nguyên 300 nhận xét vào bản tổng hợp thì chẳng ai đọc. Trước khi chọn khuôn, cần **sắp xếp và chọn lọc** (*organize and curate*):

- **Gom và bỏ trùng.** Nhiều phiếu nói cùng một ý ("phòng học nóng") thì gộp thành một, kèm số lần được nhắc.
- **Nhóm theo chủ đề.** Nội dung bài, giảng viên, cơ sở vật chất, thời lượng.
- **Giữ bằng chứng.** Mỗi chủ đề giữ một hai câu nhận xét nguyên văn tiêu biểu và cho biết lấy từ phiếu nào, để người đọc kiểm lại được.
- **Chọn theo người đọc.** Quản lý khách sạn cần biết điều gì liên quan tới khách sạn của họ và cần làm gì; không cần mọi chi tiết.

```
Đây là 300 phiếu góp ý (file đính kèm).
1. Nhóm nhận xét theo chủ đề: nội dung, giảng viên, cơ sở vật chất, thời lượng.
2. Mỗi chủ đề: số phiếu nhắc tới, và hai câu trích nguyên văn kèm mã phiếu.
3. Bỏ trùng, không liệt kê từng phiếu.
4. Cuối cùng nêu ba việc nên sửa cho khoá sau, xếp theo số phiếu nhắc tới.
```

## Chọn khuôn đầu ra theo cách kết quả được dùng

| Khuôn | Hợp khi | Trong ví dụ |
|---|---|---|
| Trả lời ngay trong chat (**inline**) | Câu trả lời ngắn, dùng một lần | "Điểm trung bình 4,2/5" |
| Dữ liệu có cấu trúc: bảng, CSV, JSON (**structured data**) | Nhiều bản ghi cần so, lọc, hoặc đưa sang hệ thống khác | Bảng điểm theo khách sạn và buổi học |
| **Artifact** | Nội dung lớn, đứng riêng được, sẽ sửa, dùng lại hoặc chia sẻ | Bản tổng hợp gửi quản lý, sửa tiếp vài tuần |
| File tải về (Word, Excel, PowerPoint, PDF) | Người nhận làm việc trong phần mềm văn phòng | File Excel cho phòng nhân sự |

**Dữ liệu nhiều bản ghi thì dùng bảng**: mỗi bản ghi một dòng, mỗi chỉ số một cột, sắp theo cột người đọc hay tìm. Viết thành đoạn văn theo từng khách sạn đọc thì êm, nhưng không ai so được khách sạn này với khách sạn kia.

> Bẫy đề
>
> Câu luyện thi: tóm tắt 200 bản ghi số liệu hằng tuần của nhiều vùng, khuôn nào rõ nhất? Đáp án sai: bản tóm tắt văn xuôi theo vùng; một loạt bản tin ngắn cho từng vùng; danh sách gạch đầu dòng theo vùng mà các mục không cùng chỉ số. Đáp án đúng: **bảng, mỗi bản ghi một dòng, mỗi chỉ số một cột, sắp theo vùng**.

## Artifact là gì

Trang hỗ trợ của Claude định nghĩa artifact là thứ Claude làm cho bạn mà bạn sẽ đưa cho người khác xem: một tài liệu, một bộ slide, một bản thiết kế, một dashboard hay một công cụ tương tác nhỏ. Nó mở cạnh cuộc chat; bạn sửa được, quay lại được và chia sẻ được.

Claude tạo artifact khi nội dung:

- Lớn và đứng riêng được, thường dài hơn 15 dòng.
- Là thứ bạn có thể sẽ sửa, làm tiếp hoặc dùng lại ngoài cuộc chat.
- Hiểu được mà không cần đọc cuộc chat.
- Là thứ bạn sẽ mở lại hoặc dùng về sau.

Artifact có thể bắt đầu từ mẫu (Docs, Slides, Design…), xuất ra Word, PDF, PowerPoint, và được lưu trong mục Artifacts ở thanh bên để tìm lại. Muốn dùng artifact phải bật code execution và tạo file trong phần cài đặt Capabilities.

Bản tổng hợp gửi quản lý của chị Trâm đáp ứng cả bốn điều trên, nên làm thành artifact là hợp. Còn câu "điểm trung bình 4,2" thì trả lời ngay trong chat là đủ.

> Trong đề chọn gì
>
> Đề hỏi khuôn cho một sản phẩm mà nhóm sẽ **sửa tiếp, dùng lại hoặc chia sẻ** (bản mẫu trang web tương tác, bản tóm tắt đối thủ cả đội sửa trong nhiều tuần): chọn **artifact**. Câu trả lời ngắn dùng một lần thì trả lời ngay trong chat; nhiều bản ghi cần so thì bảng.

## File và phép tính

Claude có thể chạy code để tạo file Excel có công thức, PowerPoint, Word và PDF cho bạn tải về, và để phân tích dữ liệu bạn tải lên. Tính năng này có trên mọi gói (Free, Pro, Max, Ultra, Team, Enterprise). Muốn tải file XLSX lên cũng phải bật nó trước.

Với phép tính, trang hỗ trợ nói Claude tính được, nhưng phép tính phức tạp hay quan trọng nên được kiểm bằng phần mềm chuyên dụng hoặc tính tay. Khi Claude tính bằng code trên file của bạn, kết quả đáng tin hơn Claude nhẩm, nhưng vẫn nên đối chiếu vài con số với dữ liệu gốc: ví dụ chị Trâm tự đếm số phiếu của một khách sạn xem có khớp bảng không.

1. Chỉ cần một câu trả lời ngắn, dùng một lần?Trả lời ngay trong chat
2. Nhiều bản ghi cần so sánh, lọc, nhập vào hệ thống khác?Bảng, CSV hoặc JSON
3. Sẽ sửa tiếp, dùng lại hoặc chia sẻ cho người khác?Artifact
4. Người nhận làm việc trong Word, Excel, PowerPoint?Nhờ Claude tạo file tải về
5. Còn lạiChưa rõ: hỏi người nhận họ sẽ dùng kết quả thế nào

> Ý chính
>
> Sắp xếp và chọn lọc trước, trình bày sau. Chọn khuôn theo cách kết quả được dùng: chat cho câu trả lời nhanh, bảng cho nhiều bản ghi, artifact cho thứ sẽ sửa và chia sẻ, file cho người làm việc trong phần mềm văn phòng.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 2(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [What are artifacts and how do I use them? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)
3. [Create and edit files with Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)
4. [Upload files to Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8241126-upload-files-to-claude)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
