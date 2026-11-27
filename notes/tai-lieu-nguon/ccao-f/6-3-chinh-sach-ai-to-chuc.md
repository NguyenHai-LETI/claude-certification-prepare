---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/6-3-chinh-sach-ai-to-chuc
ngay_tai: 2026-11-27
tieu_de: Làm theo chính sách AI và chuẩn quản trị của tổ chức
---

Domain 6 : Governance, Risk, and Responsible Use·Task 6.3

# Làm theo chính sách AI và chuẩn quản trị của tổ chức

Khung quản trị AI gồm những gì, làm gì khi chính sách cấm hoặc chưa rõ, xử lý khi lộ thông tin, và kiểm skill, connector trước khi bật.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Mô tả đúng một khung quản trị AI của tổ chức gồm những gì
- Biết làm gì khi chính sách cấm một việc hoặc khi không chắc chính sách đòi gì
- Xử lý đúng khi kết quả của Claude có thể đã lộ thông tin bị hạn chế
- Kiểm skill và connector của bên thứ ba trước khi bật
- Hiểu Diligence là thói quen hằng ngày, không phải một lần ký cam kết

Đề CCAO-F không hỏi bạn thuộc lòng luật của một nước nào. Nó hỏi bạn có làm đúng theo chính sách AI của chính tổ chức mình không: dùng công cụ nào, dữ liệu nào được đưa vào, khâu nào phải duyệt, có chuyện thì báo ai.

Bài này giúp bạn trả lời: khung quản trị AI của tổ chức gồm những gì, và hằng ngày làm theo nó ra sao?

## Ví dụ xuyên suốt: công ty tư vấn quản lý

Chị Thảo là tư vấn viên ở một công ty tư vấn quản lý 200 người. Công ty dùng Claude gói Enterprise và có bộ chính sách AI. Trong tháng, chị gặp bốn tình huống:

1. Chị sắp gửi khách một báo cáo soạn cùng Claude, nhưng không chắc chính sách yêu cầu gì với loại báo cáo này.
2. Một đồng nghiệp nhân sự muốn đưa thông tin về một vụ điều tra nội bộ đang diễn ra vào Claude để soạn biên bản.
3. Kết quả Claude trả về có vẻ lặp lại một con số tài chính lấy từ tài liệu nội bộ được dặn là hạn chế.
4. Chị thấy một skill do bên thứ ba lạ chia sẻ, hứa "tự động phân tích báo cáo tài chính".

## Khung quản trị AI gồm những gì

Một khung quản trị AI của tổ chức quy định bốn điều, để AI được dùng nhất quán và có người chịu trách nhiệm:

- **Công cụ được duyệt**: dùng Claude qua tài khoản công ty, không qua tài khoản cá nhân.
- **Dữ liệu được phép đưa vào**: loại nào được, loại nào phải che, loại nào cấm.
- **Khâu duyệt bắt buộc**: việc nào phải có người duyệt trước khi dùng.
- **Đường báo cáo**: có sự cố thì báo ai, qua kênh nào.

Nó không chỉ là danh sách khoá đào tạo, bảng giá công cụ, hay bộ văn bản pháp lý bắt buộc phải có.

Claude hỗ trợ việc này bằng các cài đặt ở cấp tổ chức trên gói Team và Enterprise. Ví dụ chủ tổ chức có thể đặt chỉ dẫn tổ chức áp dụng cho mọi cuộc chat, quyết định bật connector, skill, artifact nào cho thành viên, và tắt tính năng đánh giá câu trả lời. Trên gói doanh nghiệp, tổ chức quyết định bạn được dùng tính năng nào; Primary Owner quản lý tài khoản và dữ liệu của bạn.

## Khi chính sách cấm, hoặc khi không chắc

**Tình huống 2: chính sách cấm rõ ràng.** Chính sách ghi thông tin về các vụ điều tra đang diễn ra không được đưa vào công cụ AI. Cách đúng là **không đưa vào, và hỏi lãnh đạo nhân sự cách làm được duyệt**. Ba cách lách nghe hợp lý nhưng sai: đợi điều tra xong rồi đưa vào; dùng chat Incognito "vì không lưu nên ngoài phạm vi chính sách"; diễn đạt lại, bỏ chi tiết định danh "cho đúng tinh thần chính sách".

**Tình huống 1: không chắc chính sách đòi gì.** Trước khi gửi, **tìm hiểu chính sách yêu cầu gì với loại sản phẩm này**. Nhờ quản lý ký duyệt để chuyển trách nhiệm sang họ, hỏi khách có phản đối việc dùng AI không, hay thêm một dòng "soạn với sự hỗ trợ của AI" rồi gửi, đều là đoán thay vì biết.

> Bẫy đề
>
> Thêm một dòng ghi chú "có dùng AI" là việc hay bị chọn nhầm, vì nó nghe minh bạch. Nhưng nếu chính sách đòi thêm bước khác (người duyệt chuyên môn, kiểm số liệu), dòng ghi chú không thay được các bước đó. Minh bạch là một phần, không phải toàn bộ yêu cầu.

## Khi kết quả có thể đã lộ thông tin

**Tình huống 3**: kết quả có thể đã lặp lại một con số bị hạn chế, dù chưa ai ngoài chị Thảo thấy. Cách đúng: **ngừng dùng kết quả đó, ghi lại sự việc (kèm prompt và nguồn), và báo qua kênh quản trị hoặc kênh sự cố mà tổ chức quy định**.

1. 
  - **Ngừng dùng kết quả**
2. rồi
  - **Ghi lại**prompt, nguồn, con số bị lặp lại
3. rồi
  - **Báo qua kênh quản trị hoặc kênh sự cố đã quy định**

> Bẫy đề
>
> Câu luyện thi về tình huống này có ba đáp án sai:
>
> - Ngừng dùng rồi mở chat mới với prompt cẩn thận hơn, coi như xong. Không ai biết chuyện đã xảy ra.
> - Cứ dùng cho việc nội bộ vì con số chưa ra ngoài.
> - Sửa bỏ con số, lưu bản đã sửa, ghi vào sổ tay cá nhân, không báo kênh quản trị.
>
> Đáp án đúng: **ngừng, ghi lại kèm prompt và nguồn, báo qua kênh quản trị hoặc sự cố**. Tổ chức cần biết để sửa gốc vấn đề, ví dụ tài liệu hạn chế đang nằm ở chỗ Claude truy cập được.

## Kiểm skill và connector trước khi bật

**Tình huống 4**: skill là gói chỉ dẫn, script và tài nguyên mà Claude nạp để làm một việc. Skill từ nguồn lạ có thể yêu cầu quyền nhiều hơn việc cần. Hai kiểm tra trước khi bật:

- **Đối chiếu nguồn của skill với danh sách skill được tổ chức duyệt.**
- **Xem skill yêu cầu những quyền và khả năng gì**, và quyền đó có hợp với việc skill định làm không.

Có mặt trong một danh sách công khai, hay được đánh giá tốt ở bên ngoài, không thay được hai kiểm tra trên. Trên gói Team và Enterprise, chủ tổ chức có thể cung cấp sẵn skill đã duyệt cho mọi thành viên, nên dùng skill đó trước. Trang hỗ trợ về artifact cũng nhắc tinh thần tương tự: chỉ dùng artifact người khác chia sẻ khi bạn tin người đó, và coi nó như file từ người lạ gửi.

Với connector cũng vậy: trước khi cho phép, kiểm connector có trong danh sách nhà cung cấp được duyệt, và kiểm phân loại dữ liệu của nguồn (bài 5.2).

## Diligence là thói quen

Khoá AI Fluency gọi việc chịu trách nhiệm khi dùng AI là **Diligence**. Trong quản trị, Diligence nghĩa là **áp dụng chính sách AI nhất quán như một thói quen nghề nghiệp, tự tìm chỗ việc dùng thực tế lệch khỏi chính sách, và sửa dần những chỗ lệch đó**. Chỉ làm đúng khi có người nhìn, chỉ đọc chính sách một lần lúc mới vào làm rồi coi chữ ký là bằng chứng tuân thủ mãi mãi, hay đẩy hết cho bộ phận tuân thủ, đều không phải Diligence.

> Trong đề chọn gì
>
> Câu về chính sách AI của tổ chức: chọn đáp án **làm theo chính sách và hỏi đúng người khi chưa rõ**. Loại mọi đáp án tìm cách lách (Incognito, diễn đạt lại, đợi thời điểm khác), đoán thay vì biết (thêm dòng ghi chú rồi gửi), hay tự xử lý một mình thay vì báo kênh đã quy định.

1. Chính sách cấm rõ việc này?Không làm, hỏi người phụ trách cách được duyệt
2. Không chắc chính sách đòi gì?Tìm hiểu trước khi gửi hay dùng
3. Kết quả có thể đã lộ thông tin bị hạn chế?Ngừng dùng, ghi lại, báo kênh quản trị
4. Skill hay connector mới, nguồn lạ?Kiểm danh sách được duyệt và quyền yêu cầu
5. Còn lạiCòn lại: làm theo chính sách như thói quen, tự tìm và sửa chỗ lệch

> Ý chính
>
> Chính sách AI của tổ chức trả lời bốn câu: công cụ nào, dữ liệu nào, duyệt ở đâu, báo ai. Gặp chỗ cấm thì không lách, chưa rõ thì hỏi, có sự cố thì báo đúng kênh.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 6(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Who owns and manages the data of my team? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9265372-who-owns-and-manages-the-data-of-my-team)
3. [Set organization instructions (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/14546867-set-organization-instructions)
4. [Manage user feedback settings on Team and Enterprise plans (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/10504844-manage-user-feedback-settings-on-team-and-enterprise-plans)
5. [Provision and manage skills for your organization (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)
6. [What are artifacts and how do I use them? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)
7. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
