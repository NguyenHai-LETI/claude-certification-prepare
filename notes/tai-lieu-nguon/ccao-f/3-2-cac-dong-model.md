---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/3-2-cac-dong-model
ngay_tai: 2026-11-27
tieu_de: Phân biệt các dòng model Claude
---

Domain 3 : Product and Model Selection·Task 3.2

# Phân biệt các dòng model Claude

Haiku, Sonnet, Opus và Fable khác nhau ra sao về năng lực, tốc độ và mức tốn hạn mức, cùng hai núm chỉnh effort và thinking trong app Claude.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Mô tả đúng vị trí của Haiku, Sonnet và Opus như đề thi hỏi
- Biết các model hiện có trong app Claude, kể cả Fable
- Hiểu đánh đổi giữa năng lực, tốc độ và mức tốn hạn mức sử dụng
- Biết effort và thinking là gì, và chúng khác đổi model ra sao

Bấm vào tên model cạnh nút gửi, bạn sẽ thấy vài lựa chọn. Chúng không khác nhau ở "giọng văn" mà ở độ sâu suy luận, tốc độ và mức tốn hạn mức sử dụng. Đề thi muốn bạn biết đặc điểm từng dòng để chọn đúng.

Bài này giúp bạn trả lời: các dòng model Claude khác nhau thế nào, và ngoài đổi model thì còn chỉnh được gì?

## Ví dụ xuyên suốt: văn phòng kế toán dịch vụ

Một văn phòng kế toán nhận làm sổ sách cho 80 doanh nghiệp nhỏ. Trong tuần, nhân viên dùng Claude cho ba loại việc:

1. Phân loại hàng trăm hoá đơn mỗi ngày vào đúng tài khoản chi phí, cần nhanh.
2. Soạn email trả lời khách hỏi về hạn nộp thuế, hồ sơ cần chuẩn bị.
3. Phân tích một hồ sơ doanh nghiệp đang bị kiểm tra thuế: đối chiếu nhiều năm sổ sách, tìm chỗ có thể bị truy thu, lập luận giải trình.

## Ba dòng model đề thi hỏi

Đề thi mô tả ba dòng model Claude như sau, và đây cũng là cách bạn nên nhớ:

| Dòng | Đặc điểm | Trong ví dụ |
|---|---|---|
| **Haiku** | Nhanh nhất, nhẹ nhất; hợp việc khối lượng lớn, suy luận nhẹ, cần phản hồi nhanh | Phân loại hoá đơn |
| **Sonnet** | Cân bằng giữa tốc độ và năng lực; lựa chọn mặc định cho phần lớn việc hằng ngày | Soạn email trả lời khách |
| **Opus** | Mạnh nhất trong ba dòng cho suy luận phức tạp; chậm hơn và tốn hạn mức hơn | Phân tích hồ sơ kiểm tra thuế |

Quy luật chung: **model càng mạnh càng chậm và càng tốn hạn mức sử dụng; model nhẹ nhanh hơn và tốn ít hơn**. Tài liệu model của Anthropic xếp độ trễ đúng theo thứ tự đó: Haiku nhanh nhất, Sonnet nhanh, Opus vừa phải.

> Bẫy đề
>
> Câu luyện thi về đánh đổi giữa các model có ba đáp án sai đảo quy luật: "tốc độ và hạn mức không liên quan tới năng lực, ba dòng chỉ khác độ sâu suy luận"; "model mạnh tốn ít hạn mức hơn vì suy luận hiệu quả hơn"; "model nhẹ tốn hạn mức hơn vì phải chạy nhiều lượt". Đáp án đúng: **model mạnh hơn thường tốn hạn mức hơn và chậm hơn**, model nhẹ nhanh hơn và tốn ít hơn.

## Các model hiện có trong app

Tới tháng 11/2026, các model mới nhất là Claude Haiku 5.5, Sonnet 5.5, Opus 5.5 và **Fable 5.1**. Fable là dòng mạnh hơn cả Opus: tài liệu model mô tả nó dành cho suy luận khó và việc agent chạy rất dài. Fable chỉ có trên gói trả phí. Trên gói Pro, Fable chạy bằng usage credits (trả thêm theo mức dùng); trên gói Max, Ultra, Fable nằm trong hạn mức nhưng dùng hết hạn mức nhanh hơn các model khác.

Model cũ hơn nằm trong mục "More models" của menu. Danh sách này thay đổi theo thời gian: ví dụ Haiku 4.5 bị bỏ khỏi menu của gói Free, Pro, Max từ 29/10/2026, các cuộc chat cũ dùng Haiku 4.5 nay tự chuyển sang Haiku 5.5.

Đề thi chỉ hỏi ba dòng Haiku, Sonnet, Opus. Gặp câu hỏi về "dòng mạnh nhất", hãy hiểu là Opus theo cách đề viết; trong thực tế, khi Opus vẫn chưa đủ thì có thêm Fable.

Vài điều giống nhau giữa các model mới nhất: đều có context window 1 triệu token khi chat trên gói trả phí, và đều được huấn luyện trên dữ liệu tới tháng 6/2026. Vì vậy chọn model không phải để có "nhiều chỗ hơn" hay "kiến thức mới hơn".

> Trong đề chọn gì
>
> Đề hỏi mô tả đúng ba dòng model: chọn **Haiku nhanh và nhẹ, Sonnet là mặc định cân bằng cho việc hằng ngày, Opus mạnh nhất cho suy luận phức tạp, chậm hơn và tốn hơn**. Đề hỏi hai câu đúng về các dòng trong việc hằng ngày: chọn **dòng giữa là mặc định nhanh và đủ mạnh cho phần lớn việc**, và **dòng sâu nhất hợp với việc thật sự khó và tốn hạn mức hơn đáng kể**.

## Effort và thinking: chỉnh trong cùng một model

Menu cạnh nút gửi có ba thứ: model, **effort** và **thinking**.

- **Effort** quyết định Claude bỏ bao nhiêu công cho mỗi câu trả lời: Low, Medium, High, Extra high, Max. Effort cao thì trả lời kỹ hơn nhưng lâu hơn và dùng hết hạn mức nhanh hơn. Mỗi model có một mức mặc định được đánh dấu "Default".
- **Thinking** cho Claude suy nghĩ trước khi trả lời, phần suy nghĩ hiện trong một mục mở ra xem được. Với các model 5.5 và Fable 5.1, thinking luôn bật; muốn Claude nghĩ ít hơn thì hạ effort.

Trang hỗ trợ khuyên: việc hằng ngày (câu hỏi đơn giản, viết thông thường) để mặc định là đủ; việc phức tạp như phân tích tài liệu chi tiết, lập kế hoạch toàn diện, bài toán nhiều bước thì nâng effort. Trong ví dụ, việc 3 có thể chạy Opus ở effort cao; việc 1 không cần.

Hạn mức sử dụng trên gói trả phí gồm hạn mức theo phiên năm giờ và hạn mức theo tuần, tính chung cho mọi nơi bạn dùng Claude. Model nào, effort mức nào và độ dài cuộc chat đều ảnh hưởng tới việc dùng hết hạn mức nhanh hay chậm.

> Bẫy đề
>
> Câu luyện thi: "lên một dòng model là cách sửa chuẩn mỗi khi câu trả lời mơ hồ, hời hợt". Sai: câu trả lời mơ hồ thường do prompt thiếu thông tin, sửa prompt trước (bài 1.1). Cũng sai: "các dòng chỉ khác giọng văn, dùng dòng nào cho việc nào cũng được", và "dòng nhẹ nhất cho câu trả lời sâu y hệt, chỉ chậm hơn".

1. 
  - **Haiku**nhanh nhất, tốn ít nhất
  - **Sonnet**cân bằng, mặc định hằng ngày
  - **Opus**mạnh nhất trong ba dòng đề hỏi
2. khi Opus ở effort cao vẫn chưa đủ
  - **Fable**suy luận khó, việc rất dài, tốn hạn mức nhất

> Ý chính
>
> Haiku nhanh và nhẹ, Sonnet cân bằng cho việc hằng ngày, Opus mạnh nhất trong ba dòng đề hỏi, Fable còn mạnh hơn. Model càng mạnh càng chậm và càng tốn hạn mức; trong cùng một model, effort là núm chỉnh độ kỹ.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 3 và câu hỏi mẫu 2(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Models overview (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/about-claude/models/overview)
3. [Change the model, effort, and thinking settings (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)
4. [How do usage and length limits work? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)
5. [Claude Fable models on your plan (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/15424964-claude-fable-models-on-your-plan)
6. [Claude Haiku 4.5 was removed from the model selector (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/17444146-claude-haiku-4-5-was-removed-from-the-model-selector)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
