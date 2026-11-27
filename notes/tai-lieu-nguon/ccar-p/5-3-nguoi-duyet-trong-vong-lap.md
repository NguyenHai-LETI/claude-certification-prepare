---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-3-nguoi-duyet-trong-vong-lap
ngay_tai: 2026-11-27
tieu_de: Áp dụng người duyệt trong vòng lặp
---

Domain 5: Governance, Safety & Risk Management · Task 5.3

# Áp dụng người duyệt trong vòng lặp

Đặt người duyệt ở đâu, giao việc theo loại rủi ro, lấy mẫu khi không duyệt hết, viết tiêu chí chuyển người, và cấu hình điểm duyệt trong agent cho đúng chỗ.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Chọn điểm cần người duyệt theo mức ảnh hưởng và khả năng đảo ngược
- Quyết định phạm vi giao việc theo loại rủi ro, không chỉ theo giá trị giao dịch
- Lấy mẫu duyệt theo rủi ro khi khối lượng quá lớn để duyệt hết
- Viết tiêu chí chuyển người rõ ràng, và cấu hình điểm duyệt trong agent mà không gây mệt mỏi phê duyệt

Có hai cách đặt người duyệt sai. Một là không đặt ở đâu cả, chờ khách phàn nàn mới biết hệ thống sai. Hai là bắt người duyệt mọi thứ: người duyệt mệt, bấm "đồng ý" theo quán tính, và lớp kiểm tra chỉ còn trên giấy. Người duyệt trong vòng lặp (**human-in-the-loop**) chỉ có giá trị khi đặt đúng chỗ và có tiêu chí rõ.

Bài này giúp bạn trả lời: đặt người duyệt ở đâu, duyệt bao nhiêu, và khi nào chuyển việc cho người?

## Ví dụ xuyên suốt: công ty tài chính tiêu dùng

Một công ty cho vay tiêu dùng dùng Claude cho ba việc:

1. **Phân loại** 40.000 email khách mỗi ngày để chuyển đúng bộ phận.
2. **Đề xuất xử lý khiếu nại**, gồm hoàn phí. Nhóm vận hành đề xuất: hoàn dưới 1 triệu đồng thì cho tự động, không cần người duyệt, "vì số tiền nhỏ, rủi ro thấp".
3. **Sơ duyệt hồ sơ vay**: đề xuất duyệt hay từ chối cho chuyên viên thẩm định.

## Đặt người ở đâu

Hai câu hỏi cho mỗi điểm quyết định trong quy trình: **ảnh hưởng lớn tới đâu** nếu sai, và **đảo ngược được không**. Phân loại email sai thì chuyển lại được, ảnh hưởng nhỏ. Từ chối một hồ sơ vay ảnh hưởng tới tài chính của một người và khó đảo ngược.

Chính sách sử dụng của Anthropic (Usage Policy) có yêu cầu riêng cho **khuyến nghị AI rủi ro cao**: những gì ảnh hưởng tới sức khoẻ, quyền pháp lý, tài chính, sinh kế, nhà ở, giáo dục hay dịch vụ thiết yếu của một người, trong các lĩnh vực như pháp lý, y tế, tài chính, tín dụng, bảo hiểm, nhà ở, việc làm. Với loại này:

- Một **người có chuyên môn** phải xem xét thực chất khuyến nghị, và có quyền sửa hay thay đổi nó.
- Người nhận lời khuyên hay chịu quyết định phải được **báo rõ là AI đã được dùng**.
- Ngoại lệ: nơi luật cho phép, không bắt buộc người duyệt khi quyết định **hoàn toàn có lợi** cho người đó (như chi trả một yêu cầu bảo hiểm); duyệt một phần thì không tính là hoàn toàn có lợi.

Sơ duyệt hồ sơ vay rơi đúng vào nhóm này: chuyên viên phải xem xét thật và có quyền quyết định khác đề xuất.

> **Trong đề chọn gì**
>
> Đề hỏi hai việc phải xong **trước khi** chạy thử quy trình có người duyệt. Chọn: **xác định các điểm quyết định cần người theo mức ảnh hưởng và khả năng đảo ngược**, và **định nghĩa chiến lược lấy mẫu cùng tiêu chí chuyển người ở mỗi điểm**. Đào tạo người duyệt, viết tài liệu quy trình và SLA, điều chỉnh theo kết quả chạy thử đều đến sau.

## Giao việc theo loại rủi ro, không theo số tiền

Khung AI Fluency do Anthropic cùng hai tác giả xây dựng gọi năng lực quyết định việc nào giao cho AI, việc nào tự làm là **Delegation**. Đề xuất "hoàn phí nhỏ thì tự động" dựa trên số tiền, nhưng rủi ro nằm ở **loại** quyết định: một khoản hoàn nhỏ vẫn có thể là gian lận lặp lại, hay một tiền lệ sai với hàng nghìn khách.

> **Bẫy đề**
>
> Câu luyện thi: đề xuất giao hẳn quyết định hoàn tiền dưới 50 USD cho Claude, không người duyệt. Nguyên tắc đúng: **phạm vi giao việc phải theo loại rủi ro, không chỉ theo giá trị giao dịch**. Các đáp án sai: mọi quyết định đều phải có người duyệt (cực đoan, mất hết lợi ích); đặt phạm vi chủ yếu để tối đa hiệu quả; tránh hẳn giao việc ở bất cứ đâu có giao dịch tài chính.

## Lấy mẫu khi không duyệt hết

40.000 email mỗi ngày thì không ai duyệt hết. Cách đúng là **lấy mẫu theo rủi ro**: duyệt **toàn bộ** các kết quả độ tin cậy thấp hoặc thuộc loại ảnh hưởng lớn, cộng một mẫu ngẫu nhiên nhỏ từ các kết quả độ tin cậy cao, thông thường, để phát hiện lỗi mà model tự tin. Hướng dẫn kiểm duyệt nội dung của Anthropic có cách tương tự: chấm theo mức rủi ro rồi đưa mức cao tới người duyệt.

**Sơ đồ**
1. **40.000 email mỗi ngày**
   ↓ _chia theo rủi ro_
2. **Độ tin cậy thấp hoặc ảnh hưởng lớn**: người duyệt toàn bộ **|** **Độ tin cậy cao, thông thường**: chỉ duyệt một mẫu ngẫu nhiên nhỏ

> **Bẫy đề**
>
> Câu luyện thi chấm sai ba cách lấy mẫu khác: không lấy mẫu, chờ khiếu nại; lấy mẫu ngược (chỉ duyệt kết quả tự tin, bỏ kết quả kém tự tin); và duyệt hết mọi kết quả bất kể độ tin cậy và khối lượng.

Người duyệt không chỉ chặn lỗi, quyết định của họ còn là dữ liệu. Ghi lại mỗi quyết định (đồng ý, sửa, bác) thành mẫu có nhãn rồi đưa vào bộ đánh giá. Bài viết của Anthropic về đánh giá agent nói bộ chấm bằng model cần được hiệu chỉnh theo đánh giá của chuyên gia là người, và chuyển lỗi thật thành test case giúp bộ test phản ánh đúng cách dùng thực tế.

## Tiêu chí chuyển người phải rõ

Chuyển cho người "khi thấy cần" thì mỗi lần mỗi khác. Tiêu chí tốt kiểm được, ví dụ:

- Điểm tin cậy dưới một ngưỡng đã định.
- Thuộc loại quyết định ảnh hưởng lớn (từ chối vay, hoàn phí trên một mức, khiếu nại có dấu hiệu pháp lý).
- Bộ phân loại nội dung gắn cờ mơ hồ hay nhạy cảm.
- Khách yêu cầu gặp người.

Câu luyện thi chấm sai các cách: không có tiêu chí, để model tự quyết từng lượt; chỉ chuyển sau khi khách đã khiếu nại; tuỳ ai đang rảnh.

## Điểm duyệt trong agent

Với agent gọi tool, người duyệt là các lời hỏi cấp quyền. Bài viết của Anthropic về auto mode của Claude Code cho một con số đáng suy nghĩ: người dùng **chấp nhận 93%** lời hỏi quyền. Hỏi quá nhiều thì người ta ngừng đọc kỹ. Vì vậy phải chọn đúng chỗ hỏi:

| Cơ chế | Tác dụng |
| --- | --- |
| Chế độ quyền | `default` hỏi cho gần như mọi thứ trừ đọc; `acceptEdits` tự duyệt sửa file; `plan` chỉ đọc và lập kế hoạch; `auto` dùng một model phân loại xét từng hành động; `dontAsk` **từ chối** mọi thứ lẽ ra phải hỏi (không xếp hàng chờ); `bypassPermissions` bỏ qua lời hỏi |
| Luật `deny` và `ask` | Luật deny chặn ở mọi chế độ; luật ask luôn hỏi người, kể cả ở auto mode |
| Callback `canUseTool` (Agent SDK) | Chuyển lời gọi tool cần duyệt tới người duyệt trong ứng dụng của bạn; trả về cho phép (có thể sửa đầu vào) hoặc từ chối kèm lý do Claude đọc được |
| Hook `PreToolUse` | Chạy ở mọi lời gọi tool, chặn hay yêu cầu hỏi người theo luật của bạn |
| Managed settings | Quản trị viên tắt được chế độ `bypassPermissions` và `auto` cho cả tổ chức |

Lưu ý trong docs Agent SDK: tool đã được tự duyệt (qua `allowedTools` hay chế độ quyền) sẽ **không bao giờ** tới `canUseTool`, nên việc kiểm bắt buộc ở mọi lời gọi thì đặt ở hook `PreToolUse`. Bài viết về auto mode cũng nói bộ phân loại không thay được người xem xét cẩn thận với hạ tầng quan trọng.

**Sơ đồ**
1. **Claude gọi tool**
   ↓ _hook PreToolUse chạy ở mọi lời gọi, chặn hay yêu cầu hỏi người được_
2. **Đã tự duyệt qua allowedTools hay chế độ quyền**: chạy luôn, không tới canUseTool **|** **Cần duyệt**: canUseTool chuyển tới người duyệt trong ứng dụng

Ba việc của công ty cho vay đặt cạnh nhau:

**Sơ đồ**
1. **Phân loại email**: sai thì chuyển lại được **|** **Đề xuất hoàn phí**: rủi ro nằm ở loại, không ở số tiền **|** **Sơ duyệt hồ sơ vay**: ảnh hưởng tài chính, khó đảo ngược
   ↓ _đặt người_
2. **Lấy mẫu theo rủi ro** **|** **Giao theo loại quyết định, không đặt ngưỡng tiền** **|** **Chuyên viên xem xét thực chất, có quyền quyết định khác**

> **Ý chính**
>
> Đặt người ở điểm ảnh hưởng lớn hoặc khó đảo ngược, giao việc theo loại rủi ro, duyệt hết phần rủi ro cao cộng một mẫu nhỏ phần còn lại, và viết tiêu chí chuyển người kiểm được. Trong agent, hỏi ít mà đúng chỗ.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Usage Policy (Anthropic)](https://www.anthropic.com/legal/aup)
3. [AI Fluency, Framework and Foundations (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
4. [Choose a permission mode (Claude Code Docs)](https://code.claude.com/docs/en/permission-modes)
5. [Configure permissions (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/permissions)
6. [Claude Code auto mode (Anthropic)](https://www.anthropic.com/engineering/claude-code-auto-mode)
7. [Content moderation (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/content-moderation)
8. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
