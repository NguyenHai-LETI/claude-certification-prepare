---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/3-1-chon-tinh-nang-claude
ngay_tai: 2026-11-27
tieu_de: Chọn tính năng Claude cho từng việc
---

Domain 3 : Product and Model Selection·Task 3.1

# Chọn tính năng Claude cho từng việc

Khi nào dùng chat thường, Project, Research, web search, artifact, code execution, skill và connector, và các cách ghép tính năng đề thi hay hỏi.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Biết mỗi tính năng chính của Claude làm được gì và hợp với việc nào
- Chọn Project khi tài liệu và chỉ dẫn được dùng lại qua nhiều cuộc chat
- Chọn code execution cho phép tính chính xác, Research cho báo cáo nhiều nguồn
- Ghép hai tính năng khi một việc cần cả hai

Claude không chỉ là ô chat. Có những việc chat thường làm được nhưng làm kém, trong khi một tính năng khác sinh ra đúng cho việc đó. Đề thi hỏi nhiều câu dạng "việc này nên dùng tính năng nào".

Bài này giúp bạn trả lời: mỗi tính năng chính của Claude dùng cho việc gì, và khi nào phải ghép hai tính năng?

## Ví dụ xuyên suốt: nhóm marketing của thương hiệu mỹ phẩm

Nhóm marketing sáu người của một thương hiệu mỹ phẩm thuần chay dùng Claude cho nhiều việc trong tuần:

1. Viết lại một câu chú thích ảnh cho ngắn hơn.
2. Soạn nội dung theo bộ quy chuẩn thương hiệu và danh mục sản phẩm, ngày nào cũng cần, cả nhóm cùng dùng.
3. Làm bản tổng hợp các đối thủ đang khuyến mãi gì, cả nhóm sẽ sửa tiếp trong vài tuần.
4. Hỏi nhanh "hôm nay tỉ giá đô la bao nhiêu".
5. Tính doanh thu theo kênh từ file Excel bán hàng nhiều sheet, kèm biểu đồ.
6. Làm bản mẫu một trang đích (landing page) có nút bấm để cả nhóm góp ý.

## Mỗi tính năng làm gì

| Tính năng | Làm gì | Hợp với |
|---|---|---|
| Chat thường | Hỏi đáp, soạn thảo trong một cuộc chat | Việc nhanh, dùng một lần (việc 1) |
| **Project** | Không gian làm việc riêng, có tài liệu (knowledge) và chỉ dẫn dùng chung cho mọi cuộc chat trong đó | Tài liệu và quy tắc dùng lại qua nhiều cuộc chat, nhiều người (việc 2) |
| **Research** | Claude tìm nhiều lượt nối tiếp nhau trên web và các connector, viết báo cáo dài có trích dẫn | Báo cáo tổng hợp từ nhiều nguồn (việc 3) |
| **Web search** | Tìm thông tin mới, trả lời có trích dẫn | Câu hỏi sự thật đơn giản, cần thông tin hiện tại (việc 4) |
| **Code execution** và tạo file | Claude chạy code trong môi trường riêng để tính, phân tích file, vẽ biểu đồ, tạo Excel, Word, PowerPoint, PDF | Phép tính chính xác trên dữ liệu (việc 5) |
| **Artifact** | Nội dung lớn mở cạnh cuộc chat, sửa được, chia sẻ được: tài liệu, slide, bản thiết kế, công cụ tương tác | Thứ sẽ sửa tiếp và đưa người khác xem (việc 3, việc 6) |
| **Skill** | Gói chỉ dẫn và tài nguyên Claude tự nạp khi cần, để làm một loại việc theo cùng một cách | Quy trình lặp lại, như định dạng theo quy chuẩn thương hiệu |
| **Connector** | Cho Claude truy cập ứng dụng khác (Google Drive, Gmail, Slack…) với đúng quyền của bạn | Dữ liệu nằm ở công cụ khác và thay đổi thường xuyên |

Vài điều kiện đáng nhớ: Project có cho mọi người (gói Free tối đa năm Project); Research chỉ có trên gói trả phí và cần bật web search; artifact và skill đều cần bật code execution.

## Project cho thứ dùng lại nhiều lần

Việc 2 là kiểu việc đề thi hay hỏi nhất: một bộ tài liệu (quy chuẩn thương hiệu, danh mục sản phẩm) được **nhiều người dùng lại qua nhiều cuộc chat**. Project sinh ra cho đúng việc này: tải tài liệu vào phần knowledge một lần, viết chỉ dẫn một lần (giọng thương hiệu, từ cấm dùng), mọi cuộc chat trong Project đều có sẵn. Trên gói Team và Enterprise, Project chia sẻ được cho đồng nghiệp với quyền xem hoặc sửa.

> Bẫy đề
>
> Câu luyện thi: sổ tay nhân viên, khung cấp bậc và FAQ chính sách được nhiều người dùng qua nhiều cuộc chat. Đáp án sai:
>
> - Làm một artifact chứa ba tài liệu. Artifact là nơi sửa một sản phẩm, không phải kho tài liệu cho mọi cuộc chat.
> - Đính kèm ba tài liệu vào từng cuộc chat. Làm được, nhưng lặp lại mãi và dễ sót bản mới.
> - Nối Google Drive. Connector hợp với tài liệu thay đổi liên tục, nhưng không cho chỉ dẫn dùng chung như Project.
>
> Đáp án đúng: **Project**, không gian làm việc có knowledge và chỉ dẫn dùng chung cho các cuộc chat và các thành viên.

## Code execution cho phép tính chính xác

Việc 5 cần con số chính xác trên một file nhiều sheet. Chat thường chỉ sinh chữ, không chạy phép tính, nên con số có thể sai. Với code execution, Claude viết và chạy code trên chính file bạn tải lên, kết quả kiểm lại được. Kể cả vậy, vẫn nên đối chiếu vài con số với dữ liệu gốc trước khi gửi báo cáo.

> Bẫy đề
>
> Câu luyện thi: phép tính chính xác trên bảng tính nhiều sheet. Đáp án sai: dùng Research (tìm và tổng hợp nguồn bên ngoài, không tính toán); dùng artifact (chỗ để trình bày kết quả, tự nó không tính); dùng chat thường (sinh chữ, không chạy code). Đáp án đúng: **code execution**.

## Ghép tính năng

Nhiều việc cần hai tính năng cùng lúc. Việc 3 (tổng hợp đối thủ từ nhiều nguồn công khai, cả nhóm sửa tiếp vài tuần) cần:

- **Research** để tìm nhiều lượt và có trích dẫn.
- **Artifact** để cả nhóm sửa tiếp và dùng lại ngoài cuộc chat.

Tương tự, việc 5 là code execution để tính và vẽ biểu đồ, rồi người làm tự kiểm kết quả với dữ liệu gốc.

> Trong đề chọn gì
>
> Đề hỏi ghép tính năng với việc:
>
> - Tổng hợp **từ nhiều nguồn dài** hợp với khả năng đọc ngữ cảnh dài (long context); trả lời một email ngắn thì không cần.
> - **Phép tính nhiều bước** hợp với công cụ tính toán; diễn đạt lại một mô tả sản phẩm thì không cần.
> - Tìm một **công thức đã quá quen** (như lãi kép) không cần web search.
> - Bản mẫu tương tác cả nhóm sửa và chia sẻ: **artifact**. Báo cáo đối thủ nhiều nguồn, sửa trong nhiều tuần: **Research + artifact**.

## Việc Claude làm tốt và việc không nên giao

Chọn tính năng cũng là biết Claude hợp với việc gì. Câu luyện thi chấm hai việc hợp nhất là **soạn email gửi khách đúng giọng, đúng người đọc, có người duyệt**, và **tổng hợp một bản tóm tắt từ nhiều tài liệu dài**. Ba việc không hợp: theo dõi dòng dữ liệu cảm biến theo thời gian thực, ra quyết định pháp lý ràng buộc chỉ dựa vào phân tích của Claude, và tính giá trị chính xác của hợp đồng tài chính phái sinh từ dữ liệu thị trường trực tiếp.

1. Tài liệu và quy tắc dùng lại qua nhiều cuộc chat, nhiều người?Project
2. Cần báo cáo tổng hợp từ nhiều nguồn, có trích dẫn?Research
3. Câu hỏi đơn giản cần thông tin mới?Web search
4. Cần phép tính chính xác, biểu đồ, file Excel?Code execution
5. Sẽ sửa tiếp hoặc chia sẻ sản phẩm?Artifact
6. Còn lạiViệc nhanh, dùng một lần: chat thường

> Ý chính
>
> Project cho thứ dùng lại, Research cho báo cáo nhiều nguồn, web search cho thông tin mới, code execution cho phép tính, artifact cho thứ sẽ sửa và chia sẻ. Việc phức tạp thường cần ghép hai tính năng.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 3(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [What are projects? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9517075-what-are-projects)
3. [When should I use web search, extended thinking, and research? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11095361-when-should-i-use-web-search-extended-thinking-and-research)
4. [What are artifacts and how do I use them? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)
5. [Create and edit files with Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)
6. [What are skills? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12512176-what-are-skills)
7. [Use connectors to extend Claude's capabilities (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
