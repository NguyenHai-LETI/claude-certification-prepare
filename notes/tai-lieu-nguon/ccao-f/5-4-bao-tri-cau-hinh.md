---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/5-4-bao-tri-cau-hinh
ngay_tai: 2026-11-27
tieu_de: Duy trì và cập nhật cấu hình, tài liệu và Memory
---

Domain 5 : Configuration and Knowledge Management·Task 5.4

# Duy trì và cập nhật cấu hình, tài liệu và Memory

Vì sao cấu hình Claude không làm một lần là xong, kết quả trôi thì kiểm gì trước, thay tài liệu trong Project dùng chung thì báo ai, và bảo trì Memory ra sao.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Biết khi nào cần xem lại cấu hình, không đợi kết quả hỏng mới sửa
- Xử lý kết quả của Project trôi khỏi kỳ vọng bằng cách kiểm chỉ dẫn và tài liệu trước
- Thông báo cho người dùng khi thay tài liệu trong Project dùng chung
- Bảo trì Memory, và hiểu giới hạn của việc nhập Memory từ dịch vụ AI khác

"Cấu hình chạy được một lần thì chạy được mãi" là một niềm tin nguy hiểm. Chính sách đổi, thuật ngữ đổi, tài liệu có bản mới; còn chỉ dẫn và knowledge của Project thì vẫn nằm yên ở bản cũ. Claude sẽ trả lời rất tự tin theo những gì đã cũ.

Bài này giúp bạn trả lời: bảo trì cấu hình Claude thế nào, khi nào, và báo cho ai biết?

## Ví dụ xuyên suốt: Project dùng chung của đội vận hành chuyển phát

Đội vận hành của một công ty chuyển phát có một Project dùng chung trên gói Team, 12 người dùng hằng ngày để tra quy trình xử lý đơn thất lạc. Knowledge có sổ tay quy trình và **ma trận báo cấp** (sự cố nào báo cho ai, trong bao lâu). Tuần này công ty thay ma trận báo cấp: đơn giá trị trên 5 triệu giờ phải báo trưởng vùng trong 2 giờ thay vì 24 giờ.

## Xem lại định kỳ, không đợi hỏng mới sửa

Cấu hình (chỉ dẫn, knowledge, memory) cần **được xem lại và cập nhật định kỳ**, vì chính sách, thuật ngữ và tài liệu nguồn thay đổi theo thời gian, **kể cả khi chất lượng kết quả chưa thấy giảm**. Đợi tới lúc thấy kết quả sai thì có thể đã có người làm theo hướng dẫn cũ.

Nhưng "định kỳ" không có nghĩa là sửa theo lịch cứng bất kể có gì thay đổi. Hai thời điểm cần xem lại: khi tới kỳ rà soát, và **ngay khi tài liệu nguồn thay đổi**.

> Bẫy đề
>
> Câu luyện thi: đồng nghiệp không bao giờ cập nhật cấu hình Project vì "chạy được một lần là chạy mãi". Ba nhận xét sai:
>
> - Chỉ cập nhật khi chất lượng kết quả giảm rõ, vì cập nhật sớm dễ gây lỗi.
> - Đội hài lòng thì để yên, cần gì thì sửa trong từng cuộc chat.
> - Cập nhật theo lịch cố định bất kể chính sách và tài liệu có đổi hay không.
>
> Đáp án đúng: **xem lại và cập nhật định kỳ, vì chính sách, thuật ngữ và tài liệu nguồn thay đổi, kể cả khi chất lượng chưa thấy giảm**.

## Kết quả trôi: kiểm chỉ dẫn và tài liệu trước

Khi kết quả của một Project dần lệch khỏi kỳ vọng hiện tại của đội, việc **thử đầu tiên** là **xem lại chỉ dẫn và tài liệu tham chiếu của Project so với chuẩn hiện hành**. Rất thường là chỉ dẫn còn nói theo quy trình cũ, hoặc knowledge có cả bản cũ lẫn bản mới của cùng một tài liệu.

Ba cách xử lý sai: chấp nhận độ lệch như mặc định mới; đổi model "hy vọng nó làm tốt hơn"; bỏ Project và dựng lại từ đầu.

Khi thay tài liệu, **xoá bản cũ khỏi knowledge**. Để cả hai bản thì Claude có thể trả lời theo bản cũ.

## Thay tài liệu trong Project dùng chung: báo cho người dùng

Sau khi chị trưởng ca thay ma trận báo cấp trong Project, còn một việc quan trọng: **báo cho những người dùng Project biết đã thay đổi gì**, để họ biết các câu trả lời trước đó có thể không còn đúng. Ai đó hôm qua đã hỏi Claude và ghi lại "báo trong 24 giờ" sẽ không tự biết quy định đã đổi.

```
Thông báo: ma trận báo cấp trong Project "Xử lý đơn thất lạc" vừa được thay bằng bản 11/2026.
Thay đổi chính: đơn giá trị trên 5 triệu, báo trưởng vùng trong 2 giờ (trước là 24 giờ).
Câu trả lời Claude đưa trước hôm nay về thời hạn báo cấp không còn đúng.
```

> Bẫy đề
>
> Câu luyện thi: vừa thay ma trận báo cấp trong một Project dùng chung. Ba đáp án sai: bảo mỗi người tự sao một bản Project riêng; ghi chú vào tên Project vì "mọi người đọc tên trước mỗi cuộc chat"; xoá lịch sử chat vì "chat cũ sẽ đè lên tài liệu mới". Lưu ý tên Project thì chính Claude cũng không đọc được, còn các cuộc chat trong Project không chia sẻ ngữ cảnh với nhau. Đáp án đúng: **báo cho người dùng biết đã đổi gì**.

Với chỉ dẫn tổ chức, nhớ thêm: thay đổi có thể mất tới một giờ mới có hiệu lực trên các sản phẩm Claude.

## Bảo trì Memory

Memory của Claude lưu những gì Claude ghi nhớ qua các cuộc chat. Bạn xem toàn bộ ở **Settings > Your Claude**, bấm "Manage" cạnh Your memory; ở đó bạn nhờ Claude sửa, xoá, hoặc tự thêm những gì muốn Claude nhớ. Trang hỗ trợ cũng cho phép xuất memory ra để sao lưu.

Một lượt bảo trì Memory tốt gồm:

- **Xuất memory hiện tại làm bản sao lưu** trước khi sửa, để khôi phục được nếu lỡ xoá thứ còn cần.
- **Tìm và sửa hoặc xoá mục đã cũ, sai hoặc không còn liên quan**, và **thêm những gì công việc cần mà Claude chưa tự ghi**.

Không nên: để nguyên mọi thứ vì "chưa thấy lỗi"; tắt hẳn Memory cho khỏi lo mục cũ; xoá sạch rồi để Claude tự học lại.

Trong ví dụ, nếu memory của một nhân viên còn ghi "đơn thất lạc báo trong 24 giờ", người đó nên sửa mục này ngay.

> Trong đề chọn gì
>
> Đề hỏi hai việc tốt nhất khi bảo trì Memory: chọn **xuất memory làm bản sao lưu trước khi sửa**, và **sửa, xoá mục cũ hoặc sai, thêm phần còn thiếu**. Loại các đáp án để nguyên, tắt hẳn, hoặc xoá sạch.

## Nhập Memory từ dịch vụ AI khác

Nếu bạn hay chuyển qua lại giữa Claude và một dịch vụ AI khác cho cùng một dự án, cách giảm việc phải giải thích lại bối cảnh là **bật Memory và dùng tính năng nhập (import)** để đưa bối cảnh từ dịch vụ kia vào Claude. Dùng Incognito cho mọi phiên, hay tắt Memory rồi dán lại cùng một đoạn bối cảnh mỗi lần, đều đi ngược mục đích.

Nhưng trang hỗ trợ nói rõ: **nhập Memory còn là tính năng thử nghiệm**, Claude có thể không đưa vào được hết nội dung nhập. Memory của Claude cũng tập trung vào chuyện công việc, nên có thể không giữ những chi tiết cá nhân không liên quan. Chi tiết nào bị thiếu thì **tự thêm bằng tay** trong phần quản lý memory. Đề thi ghi đường dẫn theo bố cục cũ là Settings > Capabilities; bố cục cài đặt mới là Settings > Your Claude.

> Bẫy đề
>
> Câu luyện thi: nhập Memory từ dịch vụ khác xong, vài chi tiết không thấy xuất hiện. Đáp án sai: memory nhập lưu riêng, không chat nào dùng được; nhập là chép mọi chi tiết thành quy tắc, thiếu là do Claude cố ý bỏ; nhập sẽ ghi đè toàn bộ memory cũ. Đáp án đúng: **nhập Memory còn thử nghiệm, Claude có thể không đưa vào được hết; phần thiếu thì thêm bằng tay**.

1. Tài liệu nguồn vừa đổi?Cập nhật knowledge, xoá bản cũ, báo cho người dùng
2. Kết quả Project trôi khỏi kỳ vọng?Xem lại chỉ dẫn và tài liệu so với chuẩn hiện hành
3. Tới kỳ rà soát?Xem lại chỉ dẫn, knowledge, memory dù chưa thấy lỗi
4. Memory có mục cũ hoặc thiếu?Xuất sao lưu, rồi sửa, xoá, thêm
5. Còn lạiKhông có gì đổi: ghi lại đã rà soát, hẹn kỳ sau

> Ý chính
>
> Cấu hình Claude cần bảo trì như tài liệu sống: xem lại khi nguồn đổi và theo kỳ, kiểm chỉ dẫn và tài liệu trước khi đổi thứ khác, báo người dùng khi thay tài liệu chung, và sao lưu trước khi sửa Memory.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 5(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [How can I create and manage projects? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects)
3. [Use Claude's chat search and memory to build on previous context (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
4. [Import and export your memory from Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12123587-import-and-export-your-memory-from-claude)
5. [Set organization instructions (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/14546867-set-organization-instructions)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
