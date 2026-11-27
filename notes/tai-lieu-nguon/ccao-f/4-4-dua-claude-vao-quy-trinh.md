---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/4-4-dua-claude-vao-quy-trinh
ngay_tai: 2026-11-27
tieu_de: Đưa Claude vào quy trình đang có
---

Domain 4 : Workflow Integration and Solution Design·Task 4.4

# Đưa Claude vào quy trình đang có

Quyết định bước nào giao cho Claude bằng tiêu chí Delegation, các bước tích hợp theo thứ tự, ba cách làm việc với AI, và bổ trợ hay thiết kế lại quy trình.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Dùng tiêu chí Delegation để quyết định bước nào giao cho Claude
- Đưa Claude vào quy trình theo đúng thứ tự, từ ghi hiện trạng tới triển khai
- Phân biệt Automation, Augmentation và Agency
- Biết khi nào chỉ bổ trợ một bước, khi nào nên thiết kế lại quy trình

Dùng Claude một mình thì dễ. Đưa Claude vào một quy trình có năm người, mỗi người một khâu, thì khác: phải biết khâu nào Claude làm, khâu nào người giữ, và ai nhận gì từ ai.

Bài này giúp bạn trả lời: chọn khâu nào để giao cho Claude, và đưa Claude vào quy trình theo các bước nào?

## Ví dụ xuyên suốt: báo cáo sự cố của đội IT nội bộ

Đội hỗ trợ IT của một công ty logistics có 5 người. Mỗi tuần họ làm báo cáo sự cố cho ban điều hành:

1. Mỗi người ghi sự cố mình xử lý vào bảng theo dõi.
2. Trưởng nhóm đọc hết, viết báo cáo tóm tắt: số sự cố, nguyên nhân chính, sự cố nghiêm trọng.
3. Trưởng nhóm đề xuất việc cần đầu tư (thay máy chủ, đào tạo lại).
4. Giám đốc vận hành duyệt và quyết ngân sách.

Bước 2 mất của trưởng nhóm gần nửa ngày mỗi tuần.

## Giao bước nào cho Claude: Delegation

Khoá AI Fluency gọi việc quyết định giao gì cho AI là **Delegation**, dựa trên ba sự hiểu biết:

| Phần | Câu hỏi | Trong ví dụ |
|---|---|---|
| **Problem Awareness** | Mình đang muốn đạt điều gì, công việc gồm những gì? | Báo cáo đúng, kịp, giúp giám đốc quyết đầu tư |
| **Platform Awareness** | AI làm được gì, không làm được gì? | Claude tóm tắt bảng theo dõi tốt; không biết bối cảnh ngân sách công ty |
| **Task Delegation** | Chia việc giữa người và AI thế nào? | Claude nháp bước 2; người giữ bước 3 và 4 |

Hai tiêu chí trực tiếp nhất khi xét từng bước:

- **Bước đó có cần sự sáng tạo, thấu cảm hay phán đoán của con người không?** Đề xuất đầu tư cần hiểu chính trị nội bộ và ngân sách: người giữ.
- **Bước đó đảo ngược được không, và sai thì hậu quả ra sao?** Bản nháp tóm tắt sai thì trưởng nhóm sửa được trước khi gửi; quyết định ngân sách sai thì khó rút lại.

> Bẫy đề
>
> Câu luyện thi hỏi hai tiêu chí trực tiếp nhất cho quyết định Delegation. Ba đáp án sai: chức vụ của người đang làm bước đó; độ phức tạp của sơ đồ quy trình; quy trình đã tồn tại bao lâu. Đáp án đúng: **bước đó có cần sáng tạo, thấu cảm, phán đoán của con người không**, và **có đảo ngược được không, sai thì hậu quả ra sao**.

Trong một đội làm việc với tài liệu, chỗ Claude tạo giá trị nhiều nhất thường là **soạn nháp và tổng hợp từ nhiều nguồn cho một người duyệt phía sau**, như bước 2. Duyệt bản cuối gửi ra ngoài không qua ai, đàm phán hợp đồng, hay quyết định nhân sự thì không nên giao.

## Ba cách làm việc với AI

Khoá AI Fluency phân biệt ba cách con người làm việc cùng AI:

| Cách | Là gì | Trong ví dụ |
|---|---|---|
| **Automation** | AI làm một việc cụ thể theo chỉ dẫn của người | Claude đếm sự cố theo loại từ bảng theo dõi |
| **Augmentation** | Người và AI cùng làm, trao đổi qua lại như cộng sự | Trưởng nhóm cùng Claude phân tích nguyên nhân gốc của sự cố lặp lại |
| **Agency** | Người thiết lập để AI tự làm việc thay mình theo cách đã định | Thiết lập để Claude tự lấy bảng theo dõi mỗi sáng thứ Hai và nháp báo cáo |

Càng đi về phía Agency, khâu duyệt của con người càng quan trọng, vì AI làm nhiều bước mà không ai nhìn từng bước.

## Đưa Claude vào quy trình theo thứ tự

1. 
  - **Ghi lại quy trình hiện tại**các bước, người phụ trách, điểm ra quyết định
2. rồi mới chọn
  - **Chọn bước Claude bổ trợ được, và bước con người phải giữ**
3. với từng bước đó
  - **Định đầu vào Claude cần, đầu ra Claude trả, và chỗ bàn giao cho người**
4. rồi
  - **Thử với một nhóm nhỏ trên việc thật, thu góp ý**
5. rồi
  - **Cập nhật quy trình đã ghi, triển khai cho cả đội**

Trong ví dụ:

- **Đầu vào**: bảng theo dõi sự cố của tuần, danh sách hệ thống quan trọng, mẫu báo cáo.
- **Đầu ra**: bản nháp báo cáo theo đúng mẫu, sự cố nghiêm trọng xếp đầu, mỗi số liệu ghi lấy từ dòng nào.
- **Bàn giao**: trưởng nhóm kiểm số liệu, viết phần đề xuất đầu tư, rồi gửi giám đốc.

Để mọi người trong đội dùng cùng một cách, đưa mẫu báo cáo và danh sách hệ thống vào một **Project** có chỉ dẫn chung. Nếu cách làm báo cáo là một quy trình lặp lại cố định, có thể đóng gói thành một **skill**: gói chỉ dẫn mà Claude tự nạp khi cần, để mỗi lần làm theo cùng một cách.

> Trong đề chọn gì
>
> Đề hỏi bước **đầu tiên** khi tích hợp Claude vào quy trình nhiều người: chọn **xác định chỗ Claude tạo giá trị và từng điểm bàn giao cho người**. Đề hỏi thứ tự đầy đủ: **ghi quy trình hiện tại → chọn bước Claude bổ trợ, bước người giữ → định đầu vào, đầu ra, bàn giao → thử với nhóm nhỏ → cập nhật và triển khai**. Các bước thử, sửa theo kết quả thử, ghi tài liệu và hướng dẫn cả đội đều đến sau.

## Bổ trợ hay thiết kế lại

Đề thi nói đưa Claude vào quy trình "để bổ trợ hoặc thiết kế lại" (*augment or redesign*). Hai cách khác nhau ở phạm vi:

- **Bổ trợ**: giữ nguyên các bước, Claude giúp một bước làm nhanh hơn. Như ví dụ trên: bước 2 từ nửa ngày còn một giờ.
- **Thiết kế lại**: khi Claude làm được một phần việc, có thể sắp xếp lại cả quy trình. Ví dụ: nếu Claude nháp báo cáo mỗi ngày thay vì mỗi tuần, đội có thể phát hiện sự cố lặp lại sớm hơn, và cuộc họp tuần chỉ còn bàn quyết định.

Dù chọn cách nào, những chỗ con người duyệt phải được giữ có chủ đích, không phải bỏ đi vì "Claude đã làm rồi".

1. Bước cần sáng tạo, thấu cảm, phán đoán của con người?Người giữ, Claude có thể chuẩn bị tài liệu
2. Sai thì khó đảo ngược, hậu quả lớn?Người giữ quyết định cuối
3. Soạn nháp, tổng hợp, có người duyệt sau?Giao cho Claude
4. Còn lạiĐã chọn xong: định đầu vào, đầu ra, bàn giao, thử với nhóm nhỏ

> Ý chính
>
> Giao cho Claude những bước soạn nháp và tổng hợp có người duyệt sau; giữ cho người những bước cần phán đoán hoặc khó đảo ngược. Ghi hiện trạng trước, định rõ bàn giao, thử nhỏ rồi mới triển khai.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 4(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
3. [What are projects? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9517075-what-are-projects)
4. [What are skills? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12512176-what-are-skills)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
