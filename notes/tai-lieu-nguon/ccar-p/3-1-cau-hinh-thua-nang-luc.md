---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-1-cau-hinh-thua-nang-luc
ngay_tai: 2026-11-27
tieu_de: Đánh giá cấu hình tool bị thừa năng lực
---

Domain 3: Integration · Task 3.1

# Đánh giá cấu hình tool bị thừa năng lực

Agent có quá nhiều tool thì chọn sai tool, tốn context và mở rộng bề mặt tấn công. Cách kiểm kê, giữ tool nào, gộp hay tách, và chặn bằng cấu hình.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Nêu được cái giá của việc thừa tool về độ chính xác, token và an toàn
- Kiểm kê tool theo nhiệm vụ đã định nghĩa và áp quyền tối thiểu
- Chọn giữa gộp tool, đặt tên theo không gian, và tách agent theo miền
- Bỏ tool bằng cấu hình, phân biệt cấp sẵn quyền với chặn tool

Agent thường được thêm tool dần dần: mỗi nhóm sản phẩm thêm một ít, không ai bỏ bớt. Một năm sau, agent có ba chục tool, chọn sai nhiều hơn, trả lời chậm hơn, và có quyền làm những việc không ai giao cho nó. Đề thi gọi tình trạng này là thừa năng lực (**capability bloat**).

Bài này giúp bạn trả lời: thừa tool gây hại gì, giữ tool nào, và sửa bằng cách nào?

## Ví dụ xuyên suốt: agent chăm sóc khách hàng của một nhà mạng internet

Một nhà mạng internet gia đình có agent hỗ trợ khách qua chat. Nhiệm vụ đã định nghĩa: tra cứu hợp đồng và cước, tạo phiếu kỹ thuật khi mất mạng, soạn trả lời để nhân viên duyệt. Sau 18 tháng, agent có 32 tool, trong đó có:

- `hoan_tien`, `huy_hop_dong`, `xoa_tai_khoan` (do nhóm kế toán và nhóm pháp chế thêm vào "cho tiện");
- `tra_cuoc`, `xem_cuoc`, `lay_hoa_don` (ba tool gần như làm cùng một việc);
- `gui_sms_hang_loat` (dùng cho chiến dịch quảng cáo, không liên quan hỗ trợ).

Tỉ lệ agent chọn đúng tool giảm rõ, và mỗi lượt trả lời chậm thêm.

## Thừa tool tốn gì

| Cái giá | Docs của Anthropic nói |
| --- | --- |
| Chọn sai tool | Khả năng chọn đúng tool của Claude giảm khi vượt quá khoảng 30 tới 50 tool. Tool chồng chéo nhau còn làm agent đi sai hướng |
| Tốn context | Định nghĩa tool chiếm context ở mọi lượt; khoảng 50 tool có thể tốn 10.000 tới 20.000 token |
| Mở rộng bề mặt tấn công | Docs về chống prompt injection khuyên giới hạn quyền truy cập dữ liệu và hành động của Claude theo nguyên tắc quyền tối thiểu |

Bài viết của Anthropic về viết tool cho agent tóm gọn: nhiều tool hơn không có nghĩa là kết quả tốt hơn. Bài về context engineering đưa ra một phép thử dễ nhớ: nếu một kỹ sư không nói chắc được nên dùng tool nào trong một tình huống, thì agent cũng không làm tốt hơn.

## Kiểm kê: giữ tool nào

Đối chiếu từng tool với nhiệm vụ đã định nghĩa. Câu luyện thi chia tool thành bốn nhóm:

| Nhóm | Giữ? | Trong ví dụ |
| --- | --- | --- |
| Bắt buộc cho nhiệm vụ đã định nghĩa | Giữ | `tra_hop_dong`, `tao_phieu_ky_thuat`, `soan_tra_loi` |
| Dùng thường xuyên, giảm số lần chuyển cho người | Giữ | `tra_lich_ky_thuat_vien` |
| Thỉnh thoảng hữu ích cho việc không liên quan | Bỏ | `gui_sms_hang_loat` |
| "Biết đâu sau này cần" | Bỏ | `xoa_tai_khoan` |

Với tool vượt phạm vi, cách đúng là **bỏ hẳn** khỏi cấu hình, không phải giữ lại rồi canh chừng.

> **Trong đề chọn gì**
>
> Câu hỏi mẫu Anthropic công bố: agent hỗ trợ đọc ticket, soạn trả lời, hoàn tiền và xoá tài khoản, trong khi nhân viên chỉ cần đọc ticket và soạn trả lời. Đáp án: bỏ hẳn tool hoàn tiền và xoá tài khoản khỏi cấu hình. Các đáp án sai: thêm log để kiểm toán sau, giữ tool nhưng thêm bước xác nhận, đổi sang model lớn hơn. Log và xác nhận chỉ là biện pháp phát hiện hoặc bù trừ; quyền tối thiểu là bỏ khả năng không cần, và cỡ model không liên quan gì tới phạm vi quyền.

Cũng theo câu luyện thi, danh sách tool được phép nên khai báo **theo vai trò** và **áp ở tầng điều phối** (code của bạn), đúng những tool vai trò đó cần. Cấp hết tool rồi trông vào việc model tự biết từ chối là sai; tắt hết tool cho "an toàn tối đa" cũng sai, vì agent không làm được việc được giao nữa.

## Sửa: gộp, đặt tên theo không gian, hoặc tách agent

Sau khi bỏ tool thừa, phần còn lại có thể vẫn rối. Bài viết về viết tool cho agent gợi ý:

- **Gộp tool theo việc, không bọc từng endpoint.** Lỗi hay gặp là mỗi API endpoint thành một tool. Bài viết lấy ví dụ một tool `schedule_event` tự tìm giờ rảnh và đặt lịch, thay cho ba tool `list_users`, `list_events`, `create_event`. Trong ví dụ, `tra_cuoc`, `xem_cuoc`, `lay_hoa_don` gộp thành một tool `tra_cuoc_va_hoa_don`.
- **Đặt tên theo không gian (namespacing)** khi có nhiều dịch vụ: tiền tố theo dịch vụ hay theo loại tài nguyên giúp agent phân biệt. Bài viết nói chọn tiền tố hay hậu tố cũng ảnh hưởng đáng kể tới kết quả đánh giá.
- **Tách agent theo miền** khi tool phục vụ nhiều quy trình khác hẳn nhau. Blog về hệ nhiều agent nêu dấu hiệu: một agent có quá nhiều tool (thường từ khoảng 20 trở lên) khó chọn đúng tool.

Thứ tự sửa cho agent 32 tool:

**Sơ đồ**
1. **32 tool**: có tool vượt phạm vi, có tool trùng việc
   ↓ _bỏ hẳn khỏi cấu hình: hoan_tien, huy_hop_dong, xoa_tai_khoan, gui_sms_hang_loat_
2. **Chỉ còn tool phục vụ nhiệm vụ đã định nghĩa**
   ↓ _gộp tool trùng: tra_cuoc, xem_cuoc, lay_hoa_don thành tra_cuoc_va_hoa_don_
3. **Bộ tool gọn hơn**: đặt tên theo không gian nếu có nhiều dịch vụ
   ↓ _vẫn phục vụ nhiều quy trình khác hẳn nhau?_
4. **Tách agent theo miền**

> **Bẫy đề**
>
> Câu luyện thi: agent phân loại hồ sơ tăng từ 6 lên 34 tool, độ chính xác giảm, một kỹ sư đề xuất đặt thêm một agent định tuyến phía trước để lọc tool cho từng yêu cầu. Lý lẽ đúng để tách agent theo miền trước: 34 tool thực ra phục vụ bốn miền quy trình riêng (ranh giới tách tự nhiên), và agent định tuyến thêm một lần gọi model vào **mọi** yêu cầu. Các lý lẽ yếu: mô tả tool chồng nhau, vài tool lâu không dùng, mẫu định tuyến được nhiều tài liệu nhắc tới.

## Bỏ bằng cấu hình, không bằng lời dặn

Một dòng trong system prompt hay CLAUDE.md kiểu "đừng dùng tool xoá tài khoản" không bỏ được tool: định nghĩa vẫn nằm trong context và tool vẫn gọi được. Phải bỏ trong cấu hình. Với Agent SDK có ba chỗ hay nhầm:

| Cấu hình | Thật ra làm gì |
| --- | --- |
| `allowedTools` | **Cấp sẵn quyền** cho các tool liệt kê (không hỏi lại). Tool không liệt kê vẫn còn, lời gọi chúng rơi xuống chế độ quyền và callback `canUseTool` |
| `disallowedTools` | **Bỏ hẳn** định nghĩa tool khỏi yêu cầu; Claude không thấy tool đó. Chặn cả ở chế độ `bypassPermissions` |
| `tools` của subagent | Bỏ trống thì subagent **kế thừa mọi tool** dành cho subagent; phải liệt kê để giới hạn |

> **Bẫy đề**
>
> Tool search giảm phần context do định nghĩa tool chiếm, nhưng không sửa được tool chồng chéo: hai tool làm cùng việc thì agent vẫn phân vân. Và prompt caching chỉ làm phần định nghĩa lặp lại rẻ hơn, không làm nó chiếm ít context hơn. Tool thừa thì bỏ, tool trùng thì gộp.

> **Ý chính**
>
> Mỗi tool phải ánh xạ tới một nhiệm vụ đã định nghĩa. Tool vượt phạm vi thì bỏ hẳn khỏi cấu hình, tool trùng thì gộp, quá nhiều miền thì tách agent, và giới hạn bằng cấu hình chứ không bằng lời dặn.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/engineering/writing-tools-for-agents)
3. [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
4. [Tool search tool (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
5. [Configure permissions (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/permissions)
6. [Subagents in the SDK (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/subagents)
7. [Mitigate jailbreaks and prompt injections (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
