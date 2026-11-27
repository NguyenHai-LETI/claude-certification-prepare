---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/5-1-cau-hinh-project
ngay_tai: 2026-11-27
tieu_de: Cấu hình Project với chỉ dẫn và tài liệu
---

Domain 5 : Configuration and Knowledge Management·Task 5.1

# Cấu hình Project với chỉ dẫn và tài liệu

Cấu hình một Project từ mục đích, chia đúng phần nào vào chỉ dẫn, phần nào vào knowledge, ghép với skill, và giữ hai Project không lẫn sang nhau.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Bắt đầu cấu hình Project bằng mục đích và các việc lặp lại nó phục vụ
- Đặt quy tắc vào chỉ dẫn, tài liệu tham chiếu vào knowledge
- Chọn đúng tài liệu nên có trong knowledge
- Ghép Project với skill, và tách hai Project cho hai khách hàng

Một Project cấu hình tốt giống một đồng nghiệp đã được hướng dẫn kỹ: mỗi lần mở cuộc chat mới, Claude đã biết vai trò, chuẩn mực và tài liệu cần dùng. Cấu hình kém thì ngược lại: tài liệu thừa, chỉ dẫn mơ hồ, và kết quả lúc thế này lúc thế khác.

Bài này giúp bạn trả lời: cấu hình một Project theo thứ tự nào, cái gì vào chỉ dẫn, cái gì vào knowledge?

## Ví dụ xuyên suốt: sách hướng dẫn sử dụng đồ gia dụng

Nhóm biên soạn tài liệu của một hãng đồ gia dụng có 4 người, mỗi tháng viết sách hướng dẫn sử dụng cho 3–4 sản phẩm mới (nồi chiên, máy lọc không khí…). Hãng có bộ quy chuẩn viết tài liệu, bảng thuật ngữ và một khuôn bố cục cố định cho mọi cuốn sách. Trưởng nhóm, chị Nhung, dựng một Project cho cả nhóm.

## Project gồm những gì

Trang hỗ trợ của Claude mô tả Project là không gian làm việc riêng, có lịch sử chat và kho tài liệu riêng. Hai phần bạn cấu hình:

- **Project knowledge**: tài liệu tải lên, dùng làm ngữ cảnh cho mọi cuộc chat trong Project.
- **Project instructions**: chỉ dẫn cách Claude cư xử và trả lời, áp dụng cho mọi cuộc chat trong Project.

Ba chi tiết hay bị hiểu nhầm:

- **Tên và mô tả Project Claude không đọc được.** Đừng viết chỉ dẫn vào đó.
- **Các cuộc chat trong cùng Project không thấy nhau.** Thông tin chỉ dùng chung khi nằm trong knowledge.
- Trên gói Team và Enterprise, chia sẻ Project là chia sẻ knowledge và chỉ dẫn; **cuộc chat của từng người vẫn riêng**, trừ khi họ tự chia sẻ.

## Thứ tự cấu hình

Việc **đầu tiên** là **định mục đích của Project và các việc lặp lại nó phục vụ**. Mời người cùng làm, thêm tài liệu và chỉ dẫn, rồi thử trên một yêu cầu thật đều đến sau, vì chưa biết mục đích thì không biết thêm tài liệu nào, viết chỉ dẫn gì.

1. 
  - **Định mục đích và các việc lặp lại Project phục vụ**
2. rồi
  - **Viết chỉ dẫn**vai trò, chuẩn mực, khuôn đầu ra
3. và
  - **Tải tài liệu tham chiếu hiện hành vào knowledge**
4. rồi
  - **Thử trên một yêu cầu thật của khối việc**
5. rồi mới
  - **Mời người cùng làm, đặt quyền xem hoặc sửa**

## Cái gì vào chỉ dẫn, cái gì vào knowledge

| Vào **chỉ dẫn** (instructions) | Vào **knowledge** |
|---|---|
| Vai trò của Claude ("bạn là người biên soạn sách hướng dẫn sử dụng") | Bộ quy chuẩn viết tài liệu đầy đủ |
| Yêu cầu tuân theo quy chuẩn của tổ chức | Bảng thuật ngữ |
| Khuôn đầu ra: các mục, độ dài, giọng | Một hai cuốn sách mẫu được duyệt |
| Quy tắc ngắn áp dụng cho mọi lần viết ("chỉ dùng thuật ngữ trong bảng") | Thông số kỹ thuật của sản phẩm đang viết |

Nguyên tắc: **quy tắc áp dụng cho mọi lần trả lời vào chỉ dẫn; tài liệu tham chiếu dài vào knowledge**. Một danh sách viết tắt hai trang là tài liệu, nên vào knowledge; quy tắc "không dùng viết tắt ngoài danh sách" là quy tắc, nên vào chỉ dẫn.

```
Bạn là người biên soạn sách hướng dẫn sử dụng cho đồ gia dụng của hãng.
Luôn theo Quy chuẩn viết tài liệu trong knowledge; chỉ dùng thuật ngữ trong Bảng thuật ngữ.
Mỗi cuốn gồm đúng các mục: An toàn, Bộ phận, Cách dùng, Vệ sinh, Xử lý lỗi, Bảo hành.
Câu ngắn, mỗi bước một dòng có đánh số. Thông số lấy từ file thông số của sản phẩm, không tự điền.
```

> Bẫy đề
>
> Câu luyện thi hỏi hai thứ nên có trong chỉ dẫn của một Project viết lách. Đáp án đúng: **khuôn và độ dài chuẩn của sản phẩm**, và **giọng thương hiệu**. Ba đáp án sai:
>
> - Một bài viết mẫu tiêu biểu. Bài mẫu là tài liệu tham chiếu, đặt trong knowledge.
> - Độ dài người viết prompt thích cho tin nhắn nội bộ, không liên quan sản phẩm.
> - Văn phong riêng của người duyệt.
>
> Câu khác về Project thiết kế khoá học: chọn chỉ dẫn **nêu đủ ba thứ, vai trò, chuẩn của tổ chức và khuôn đầu ra**; các đáp án thiếu một trong ba đều sai.

## Chọn tài liệu cho knowledge

Knowledge nên chứa **những tài liệu hiện hành, liên quan tới việc của Project, được dùng lại qua nhiều cuộc chat**. Không phải càng nhiều càng tốt:

- Đừng đưa các phiên bản cũ của cùng một tài liệu: Claude có thể dùng nhầm quy định đã hết hiệu lực.
- Đừng đưa mọi email từng gửi "cho đủ bối cảnh".
- Đừng đưa tài liệu của quy trình khác, nhóm khác (hồ sơ nhân viên mới, hồ sơ khách hàng của phòng pháp chế), chỉ vì cùng một nhóm quản lý.

Trên gói trả phí, khi knowledge gần chạm giới hạn context, Project tự chuyển sang chế độ tìm (RAG) và chứa được nhiều gấp tới 10 lần. Đặt tên file rõ ràng giúp Claude tìm đúng tài liệu.

> Trong đề chọn gì
>
> Đề hỏi tài liệu nào nên vào knowledge của Project hỏi đáp chính sách: chọn **các tài liệu hiện hành được dùng chung qua các cuộc chat** (sổ tay hiện hành, khung cấp bậc, FAQ chính sách). Loại phương án thêm mọi email một năm qua, thêm các phiên bản sổ tay năm năm trước, hay chỉ để sổ tay và đính kèm phần còn lại vào từng cuộc chat.

## Ghép với skill

Skill là gói chỉ dẫn và tài nguyên Claude tự nạp khi một việc cần tới, để làm việc đó theo cùng một cách mỗi lần. Skill được bật ở mục Customize > Skills (cần bật code execution). Với khối việc lặp lại như viết sách hướng dẫn, cách ghép tốt là: **bật skill liên quan, tải tài liệu tham chiếu vào knowledge, và viết chỉ dẫn nhắc tới cả skill lẫn tài liệu**. Bỏ một trong ba, hay viết chỉ dẫn trái với mục đích của skill, đều làm Claude không biết theo hướng nào.

## Hai Project, hai khách hàng

Nếu bạn làm cho hai khách hàng khác nhau, mỗi khách một Project, phải tránh để thông tin của khách này xuất hiện trong câu trả lời cho khách kia. Cách làm: **mỗi Project có memory, knowledge và chỉ dẫn riêng, và kiểm tra không có thông tin lẫn sang nhau**.

Theo trang hỗ trợ về memory, mỗi Project có memory riêng, nhưng khi làm trong Project, Claude vẫn dùng thêm memory chung từ các cuộc chat ngoài Project. Muốn Project tách hẳn, tắt "Use account memory" trong mục Memory ở trang của Project đó.

> Bẫy đề
>
> Câu luyện thi: hai Project cho hai khách hàng, cách nào tránh lẫn ngữ cảnh? Đáp án sai: không dùng Project, chat chung cho cả hai; cho hai Project dùng chung memory cho đỡ công; dùng một Project chung và tin Claude tự tách. Đáp án đúng: **mỗi Project có memory, knowledge và chỉ dẫn riêng, và kiểm tra không lẫn sang nhau**.

> Ý chính
>
> Mục đích trước; quy tắc vào chỉ dẫn, tài liệu tham chiếu hiện hành vào knowledge; thử trên việc thật rồi mới mời người dùng. Mỗi khách hàng một Project tách riêng.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 5(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [What are projects? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9517075-what-are-projects)
3. [How can I create and manage projects? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects)
4. [Manage project visibility and sharing (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9519189-manage-project-visibility-and-sharing)
5. [Use Claude's chat search and memory to build on previous context (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
6. [Use skills in Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12512180-use-skills-in-claude)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
