---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/3-4-context-va-memory
ngay_tai: 2026-11-27
tieu_de: Giới hạn context và Memory, khi nào bắt đầu lại, tóm tắt hay lưu lâu dài
---

Domain 3 : Product and Model Selection·Task 3.4

# Giới hạn context và Memory, khi nào bắt đầu lại, tóm tắt hay lưu lâu dài

Context window gồm những gì, chat dài tự thu gọn ra sao, khi nào tóm tắt, khi nào mở chat mới, và lưu thông tin lâu dài bằng Project hay Memory.

- 9 phút đọc
- Đối chiếu docs 07/11/2026
- 9 nguồn

## Đọc xong bạn nắm được

- Hiểu đúng context window và phân biệt giới hạn độ dài với hạn mức sử dụng
- Xử lý chat dài bị trôi bằng cách tóm tắt trạng thái trước tiên
- Biết khi nào mở chat mới và chuyển sang chat mới theo đúng thứ tự
- Chọn giữa Project, Memory, tìm lại chat cũ và chat Incognito

Một cuộc chat lập kế hoạch kéo dài cả tuần thường bắt đầu rất tốt, rồi tới một lúc Claude quên ràng buộc đã chốt, lặp lại ý cũ, hay trả lời lệch yêu cầu. Đó không phải Claude "mệt", mà là chuyện context.

Bài này giúp bạn trả lời: context window gồm những gì, và khi nào nên tóm tắt, mở chat mới, hay lưu thông tin lâu dài?

## Ví dụ xuyên suốt: hội nghị khách hàng ba ngày

Chị Vy là điều phối viên ở một công ty tổ chức sự kiện, đang lên kế hoạch hội nghị khách hàng ba ngày cho 400 khách. Chị dùng một cuộc chat duy nhất suốt hai tuần: chốt ngân sách, chọn khách sạn, lên lịch từng phiên, soạn thư mời. Tới lượt thứ 70, Claude đề xuất một khách sạn đã bị loại từ tuần trước và quên rằng ngân sách tiệc tối đã giảm.

## Context window là gì

**Context window** là lượng chữ có giới hạn mà model xét cùng lúc khi trả lời. Nó gồm: lịch sử cuộc chat, tài liệu bạn đính kèm, tin nhắn hiện tại, và cả phần chỉ dẫn, tài liệu của Project hay công cụ đang bật. Nó không phải một nút chỉnh được, cũng không phải "trí nhớ" kéo dài qua mọi cuộc chat.

Trang hỗ trợ của Claude phân biệt hai loại giới hạn:

| Giới hạn | Là gì |
|---|---|
| Giới hạn độ dài (**length limits**) | Context window: một cuộc chat chứa được bao nhiêu. Các model mới trên gói trả phí có tới 1 triệu token; một phần luôn để dành cho câu trả lời |
| Hạn mức sử dụng (**usage limits**) | Bạn dùng được bao nhiêu trong một khoảng thời gian: hạn mức theo phiên năm giờ và theo tuần trên gói trả phí |

Context window có giới hạn, và đưa nhiều hơn chưa chắc đã tốt hơn. Docs của Anthropic nói số token càng nhiều thì độ chính xác và khả năng nhớ lại càng giảm, hiện tượng gọi là **context rot**. Vì vậy khi tài liệu dài chỉ có vài phần áp dụng cho việc của bạn, ví dụ hai bộ quy định mà bạn chỉ cần các điều về hoàn tiền, hãy trích đúng các mục liên quan rồi đưa vào, bỏ các chương không dùng tới. Context window còn chỗ cho phần việc phía sau, và Claude ít nội dung thừa để lẫn lộn hơn.

Khi đưa nhiều tài liệu cùng lúc, hãy đánh dấu rõ từng nguồn, ví dụ bọc mỗi tài liệu trong một thẻ riêng kèm tên file. Tài liệu prompt của Anthropic khuyên bọc như vậy cho rõ ràng. Nhờ có nhãn, Claude quy được mỗi ý về đúng tài liệu của nó, thay vì trộn mọi nguồn thành một khối. Tài liệu đó cũng khuyên đặt tài liệu dài ở đầu prompt, còn câu hỏi và chỉ dẫn đặt bên dưới.

> Bẫy đề
>
> Câu luyện thi hỏi câu mô tả đúng context window. Ba đáp án sai: "một cài đặt chỉnh được cho từng cuộc chat"; "toàn bộ lịch sử chat lưu qua mọi phiên, model dùng được ở mọi cuộc chat"; "phần cuộc chat mà model tự chọn là liên quan nhất". Đáp án đúng: **lượng chữ có giới hạn model xét cùng lúc, gồm lịch sử chat, tài liệu đính kèm và tin nhắn hiện tại**.

## Chat dài tự thu gọn

Trên gói trả phí, khi bật code execution, Claude tự quản lý context: khi cuộc chat gần chạm giới hạn, Claude tóm tắt các tin nhắn cũ để có chỗ cho nội dung mới, nên phần lớn cuộc chat tiếp tục được. Lịch sử đầy đủ vẫn được giữ để Claude tham chiếu. Đổi lại, cuộc chat dài kiểu này dùng hết hạn mức nhanh hơn.

Vì vậy, với một buổi brainstorm dùng một lần, không cần giữ gì về sau, khi gần chạm giới hạn thì **cứ để cuộc chat chạy tiếp và tự thu gọn**. Chia ra bốn cuộc chat, dừng lại mở chat mới, hay dựng hẳn một Project đều là thêm việc không cần.

## Chat dài bị trôi: tóm tắt trước

Tự thu gọn giúp cuộc chat không bị dừng, nhưng không bảo đảm Claude nhớ đúng từng quyết định. Khi kết quả bắt đầu lệch như cuộc chat của chị Vy, việc **thử đầu tiên** là tóm tắt trạng thái hiện tại rồi làm tiếp với một prompt tập trung:

```
Trước khi làm tiếp, đây là trạng thái đã chốt:
- Ngân sách tổng 1,2 tỉ; tiệc tối đã giảm còn 180 triệu.
- Khách sạn: chọn Sông Hàn; đã loại Bãi Biển Xanh và Hoa Sen.
- Lịch: ngày 1 hội thảo, ngày 2 tham quan, ngày 3 tổng kết.
Việc tiếp theo: soạn lịch chi tiết ngày 2, theo đúng các điểm trên.
```

> Bẫy đề
>
> Câu luyện thi: chat 60 lượt bắt đầu trôi khỏi yêu cầu đã thống nhất. Ba đáp án sai:
>
> - Chuyển sang model có context lớn hơn, không sắp xếp lại gì. Vấn đề không nằm ở kích thước.
> - Mở chat mới, chỉ dán bản nháp hiện tại. Mất hết yêu cầu và dữ liệu đã chốt.
> - Chuyển dữ liệu vào Project rồi mở chat mới. Làm được, nhưng nặng hơn cần thiết khi chỉ cần làm rõ lại trạng thái.
>
> Đáp án đúng: **tóm tắt yêu cầu đã chốt, phát hiện chính và trạng thái bản nháp, rồi làm tiếp trong chính cuộc chat đó** với bản tóm tắt làm ngữ cảnh. Trong cuộc chat dài, cứ khi chuyển sang chủ đề con mới thì nhắc lại ràng buộc và mục tiêu, và định kỳ tóm tắt các quyết định đã chốt.

## Khi nào mở chat mới

Mở chat mới khi:

- **Bắt đầu một việc không liên quan.** Nhồi nhiều việc vào một cuộc chat làm context đầy những thứ không cần, và trang hỗ trợ về hạn mức liệt kê độ dài cuộc chat là một trong những thứ làm tốn hạn mức.
- **Cuộc chat đã trôi tới mức tóm tắt không cứu được**, và công việc còn kéo dài.

Chuyển từ cuộc chat dài sang phiên mới theo thứ tự:

1. 
  - **Tóm tắt mục tiêu, quyết định đã chốt, câu hỏi còn mở**
2. rồi xét
  - **Chọn tài liệu nào cần dùng lâu dài**
3. chuyển chúng vào
  - **Project knowledge, hoặc đính kèm khi cần**
4. rồi mới
  - **Mở chat mới, dán bản tóm tắt làm ngữ cảnh đầu**
5. trước khi làm tiếp
  - **Kiểm chat mới đã đi đúng việc**

Trang "Usage limit best practices" khuyên lên kế hoạch trước khi chat, đưa sẵn bối cảnh ngay từ đầu, gom các câu hỏi liên quan vào một tin nhắn, và dùng Project cho tài liệu dùng nhiều lần (nội dung Project được lưu đệm nên dùng lại tốn ít hạn mức hơn). Ghép lại thành thói quen giúp làm được nhiều hơn trong hạn mức mà không giảm chất lượng: **quyết định mình cần gì trước khi bắt đầu → đưa yêu cầu và tài liệu liên quan vào ngay tin nhắn đầu → hỏi tiếp dựa trên tin nhắn đầu đó → việc mới không liên quan thì mở chat mới**.

Công cụ và connector cũng chiếm context. Trang hỗ trợ khuyên để ý số công cụ đang bật. Đang soạn thảo đơn giản mà vẫn bật nhiều connector không dùng tới thì tắt chúng đi, khi cần thì bật lại; không cần xoá hẳn khỏi tài khoản.

## Lưu lâu dài: Project, Memory hay không lưu gì

| Cách | Làm gì | Hợp khi |
|---|---|---|
| **Project** | Tài liệu và chỉ dẫn có sẵn cho mọi cuộc chat trong Project; mỗi Project có memory riêng | Việc kéo dài, nhiều cuộc chat dùng chung tài liệu (kế hoạch hội nghị) |
| **Memory** | Claude tự ghi nhớ theo từng chủ đề khi bạn chat (bạn cũng có thể bảo "nhớ điều này"); xem và sửa được ở Settings > Your Claude, mục Your memory | Thông tin về bạn và công việc dùng lại thường xuyên |
| **Tìm lại chat cũ** | Nhờ Claude tìm trong các cuộc chat trước (gói trả phí) | Cần lại một chi tiết đã bàn |
| **Chat Incognito** | Không lưu vào lịch sử, không dùng và không tạo memory | Việc không muốn để lại dấu, như bàn số liệu mật |

Memory bật sẵn trên gói Free, Pro, Max, Ultra; trên gói Team và Enterprise thì chủ tổ chức quyết định có cho dùng không. Khi làm trong một Project, Claude dùng memory của Project đó cùng memory chung của bạn, nhưng không dùng memory của Project khác. Muốn một cuộc chat không dùng memory mà vẫn lưu trong lịch sử, tắt Memory ở menu "+" **trước khi** gửi tin đầu tiên.

Trên gói trả phí, Project còn tự chuyển sang chế độ tìm trong tài liệu (RAG) khi tài liệu gần chạm giới hạn context, nên chứa được nhiều gấp tới 10 lần mà Claude chỉ nạp phần liên quan.

1. Việc mới không liên quan?Mở chat mới
2. Chat dài bắt đầu trôi khỏi yêu cầu?Tóm tắt trạng thái, làm tiếp với prompt tập trung
3. Brainstorm dùng một lần sắp chạm giới hạn?Cứ để chat tự thu gọn
4. Tài liệu cần dùng qua nhiều cuộc chat?Đưa vào Project
5. Còn lạiThông tin về bạn dùng lại thường xuyên: để Memory ghi nhớ

> Trong đề chọn gì
>
> Kết quả bắt đầu kém đi trong chat dài: việc **đầu tiên** là **tóm tắt trạng thái hiện tại rồi làm tiếp bằng prompt tập trung**. Loại các đáp án đổi model, đổi sang AI của hãng khác, bỏ hẳn cuộc chat làm lại từ đầu, hay "cứ tiếp tục, hy vọng nó tự ổn".

> Ý chính
>
> Context window là mọi thứ model xét cùng lúc, có giới hạn. Chat trôi thì tóm tắt trước; việc mới thì chat mới; thứ dùng lâu dài thì đưa vào Project hoặc để Memory ghi nhớ.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 3(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [How large is the context window on paid Claude plans? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8606394-how-large-is-the-context-window-on-paid-claude-plans)
3. [How do usage and length limits work? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)
4. [Usage limit best practices (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9797557-usage-limit-best-practices)
5. [Use Claude's chat search and memory to build on previous context (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
6. [Use incognito chats (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12260368-use-incognito-chats)
7. [What are projects? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9517075-what-are-projects)
8. [Context windows (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
9. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
