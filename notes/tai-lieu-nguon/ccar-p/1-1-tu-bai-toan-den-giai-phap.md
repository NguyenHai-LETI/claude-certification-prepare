---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-1-tu-bai-toan-den-giai-phap
ngay_tai: 2026-11-27
tieu_de: Từ bài toán kinh doanh đến giải pháp dùng Claude
---

Domain 1: Solution Design & Architecture · Task 1.1

# Từ bài toán kinh doanh đến giải pháp dùng Claude

Cách biến một vấn đề kinh doanh thành giải pháp dùng Claude, gồm chia thành từng việc, giao việc nào cho Claude, chọn cách xây và đo thành công.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Viết lại yêu cầu mơ hồ thành vấn đề có con số, rồi chia thành từng việc riêng
- Nhận ra việc nào Claude làm tốt, việc nào nên để code hay hệ thống khác làm, và giới hạn của LLM
- Chọn giữa Messages API, Agent SDK và Managed Agents theo việc ai chạy vòng lặp và hạ tầng
- Xét ràng buộc cứng trước khi so chi phí hay độ tiện
- Đặt tiêu chí thành công cụ thể, đo được

Sếp nói "dùng AI cho bộ phận chăm sóc khách hàng đi". Câu đó chưa phải là một bài toán. Người kiến trúc sư phải biến nó thành thứ xây được và đo được.

Bài này giúp bạn trả lời: bắt đầu từ đâu, phần nào của vấn đề giao cho Claude, xây bằng cách nào, và làm sao biết giải pháp đã thành công?

## Ví dụ xuyên suốt: công ty giao nhận và hộp thư khiếu nại

Một công ty giao nhận hàng nhận khoảng 3.000 email mỗi ngày: hỏi đơn hàng đang ở đâu, khiếu nại giao trễ, đòi bồi thường hàng vỡ. Email viết bằng tiếng Việt lẫn tiếng Anh, không theo mẫu nào. Hiện có 12 nhân viên đọc từng email rồi chuyển cho đúng bộ phận. Trung bình mất 9 tiếng khách mới nhận được phản hồi đầu tiên. Khoảng một phần tư email bị chuyển sai bộ phận và phải chuyển lại.

Giám đốc vận hành đưa ra ba mong muốn:

1. Rút ngắn thời gian phản hồi đầu tiên.
2. Tự tính tiền bồi thường cho hàng vỡ theo bảng phí trong hợp đồng.
3. "Cho AI dự đoán giờ giao hàng hiện ngay trên app khi khách mở ra."

Bộ phận an ninh thông tin thêm một điều kiện: dữ liệu khách hàng không được rời khỏi vùng mạng đã được duyệt.

## Bắt đầu từ vấn đề, không bắt đầu từ model

Trước khi nghĩ tới prompt hay chọn model, hãy viết lại yêu cầu thành ba phần:

| Phần | Trong ví dụ |
| --- | --- |
| Vấn đề kinh doanh, kèm con số hiện tại | Khách chờ trung bình 9 tiếng mới có phản hồi đầu tiên; một phần tư email bị chuyển sai |
| Kết quả mong muốn | Phản hồi đầu tiên dưới 1 tiếng, chuyển đúng bộ phận ngay lần đầu |
| Ràng buộc | Dữ liệu ở trong vùng mạng đã duyệt; người vẫn duyệt mọi khoản bồi thường |

Viết ra như vậy thì mới thấy chỗ đau nhất nằm ở đâu: email nằm chờ người đọc rồi bị chuyển qua chuyển lại. Một cách làm hợp lý là sửa chỗ đau nhất trước, giữ nguyên những phần đang chạy tốt (như quy trình xử lý bồi thường của bộ phận pháp chế), thay vì thay cả hệ thống một lúc.

## Chia thành từng việc

Hướng dẫn xây trợ lý chăm sóc khách hàng (**customer support agent**) trong docs của Anthropic nói một cuộc chat chăm sóc khách hàng thật ra là tập hợp nhiều việc khác nhau, và nên chia ra để viết prompt và đánh giá Claude cho **từng việc**. Ví dụ trong docs là một công ty bảo hiểm xe, chia thành bốn việc: chào hỏi, giải thích sản phẩm, giữ cuộc trò chuyện đúng chủ đề, và thu thông tin để báo giá qua API.

Áp vào hộp thư của công ty giao nhận:

| Việc | Cần gì |
| --- | --- |
| Phân loại email và chuyển đúng bộ phận | Đọc hiểu văn bản tự do, hai ngôn ngữ |
| Trả lời "đơn của tôi đang ở đâu" | Dữ liệu vận đơn đang thay đổi từng phút: gọi tool tra cứu hệ thống vận đơn, không dùng tài liệu tĩnh |
| Soạn trả lời khiếu nại giao trễ | Chính sách của công ty, giọng văn lịch sự, người duyệt trước khi gửi |
| Nhận yêu cầu bồi thường | Thu đủ thông tin (mã vận đơn, ảnh hàng vỡ), rồi chuyển sang quy trình tính tiền |

Mỗi việc có tiêu chí đạt riêng. Chấm chung "trợ lý trả lời tốt không" thì không biết việc nào đang kéo điểm xuống.

> **Bẫy đề**
>
> Nghĩ về trợ lý chăm sóc khách hàng như một việc duy nhất với một điểm số duy nhất. Khi đó bạn không thử được từng việc, và khi có lỗi cũng không biết sửa ở đâu.

## Việc nào hợp với Claude, việc nào không

Hướng dẫn phân loại ticket (**ticket routing**) trong docs của Anthropic liệt kê các dấu hiệu nên dùng một LLM như Claude thay cho machine learning truyền thống:

- có ít dữ liệu đã gắn nhãn;
- danh mục hay thay đổi;
- đầu vào là văn bản tự do;
- luật phân loại dựa vào ý nghĩa chứ không dựa vào từ khoá;
- cần giải thích vì sao chọn;
- có nhiều trường hợp mập mờ;
- cần nhiều ngôn ngữ mà không muốn duy trì nhiều model.

Áp vào ba mong muốn ban đầu:

| Việc | Claude là giải pháp chính? | Vì sao |
| --- | --- | --- |
| Đọc email, phân loại, soạn bản trả lời nháp | Có | Văn bản tự do, hai ngôn ngữ, cần giải thích vì sao chuyển cho bộ phận nào |
| Tính tiền bồi thường theo bảng phí | Không. Code tính, Claude chỉ trích ra số liệu đầu vào | Phép tính phải cho đúng một kết quả và kiểm lại được |
| Dự đoán giờ giao trên app ngay khi mở | Không | Cần trả kết quả trong vài chục mili giây, dựa trên dữ liệu số; đây là việc của model dự báo chuyên dụng |

Riêng khoản bồi thường, Claude và code nối với nhau như sau:

**Sơ đồ**
1. **Email đòi bồi thường**: viết tự do, kèm ảnh hàng vỡ
   ↓ _Claude đọc và trích ra số liệu đầu vào_
2. **Số liệu đầu vào**: mã vận đơn, mặt hàng bị vỡ
   ↓ _code tính theo bảng phí trong hợp đồng_
3. **Số tiền bồi thường**: cùng đầu vào luôn ra cùng một số, kiểm lại được
   ↓ _người duyệt trước khi trả_
4. **Khoản bồi thường được chốt**

Đề thi gọi câu hỏi này là Claude có hợp làm giải pháp chính (**primary solution**) ở tầng kiến trúc hay không. Những việc Claude hợp: soạn bản nháp từ log hay văn bản bán cấu trúc cho người duyệt, đọc hợp đồng dài và trích điều khoản, phân loại kèm lý do. Những việc không hợp: chấm điểm theo thời gian thực với độ trễ cực thấp, tính toán phải chính xác tuyệt đối, hay thay hẳn một hệ thống chuyên dụng như chỉ mục tìm kiếm vector cho hàng triệu tài liệu.

> **Bẫy đề**
>
> Câu luyện thi đưa ra phát biểu "tính thuế viết thẳng trong system prompt thay vì trong code" và chấm là sai. Logic tính toán cần cho đúng một kết quả thì đặt ở code, nơi kiểm thử và kiểm tra lại được. Claude có thể đọc hoá đơn và lấy ra các con số, nhưng phép tính thì để code làm.

### Giới hạn của LLM phải tính vào thiết kế

Khoá AI Capabilities and Limitations của Anthropic Academy nêu vài đặc điểm mà người thiết kế phải lường trước:

| Giới hạn | Trong ví dụ, thiết kế phải làm gì |
| --- | --- |
| Kiến thức dừng ở một thời điểm, và yếu với thông tin hiếm hay mới | Claude không biết bảng phí hay chính sách riêng của công ty: phải đưa vào qua tài liệu hoặc tool |
| Có thể bịa, kể cả bịa nguồn dẫn một cách tự tin | Trả lời về chính sách phải dẫn đúng đoạn tài liệu; người duyệt trước khi gửi khiếu nại |
| Context window là giới hạn cứng; phiên mới không nhớ phiên cũ | Lịch sử trao đổi với khách phải lưu ở hệ thống của bạn và nạp lại khi cần |
| Có thể làm đúng chữ mà sai ý, hay chiều theo người hỏi | Viết rõ mục đích của chỉ dẫn, và kiểm bằng bộ test có cả ca khó |

## Chọn cách xây, và ràng buộc cứng xét trước

Docs của Anthropic nêu ba đường để xây (**build path**), khác nhau ở chỗ ai chạy vòng lặp agent và hạ tầng:

| Đường | Ai chạy gì | Hợp khi |
| --- | --- | --- |
| **Messages API** | Bạn viết vòng lặp, chạy tool, lo hạ tầng | Cần kiểm soát nhiều nhất, vòng lặp tự thiết kế |
| **Claude Agent SDK** | Thư viện cho sẵn vòng lặp agent và việc chạy tool (cùng bộ máy với Claude Code), chạy trong process do bạn vận hành | Muốn có sẵn vòng lặp và tool nhưng vẫn chạy trên hạ tầng của mình |
| **Claude Managed Agents** | Anthropic chạy vòng lặp agent, việc thực thi tool và runtime | Việc dài, chạy bất đồng bộ, muốn ít việc vận hành nhất |

Claude Code CLI là công cụ để làm việc tương tác hay chạy việc một lần ở terminal, không phải đường để xây sản phẩm cho khách hàng.

Trước khi so đường nào tiện hơn, xét ràng buộc cứng (**hard constraint**): điều kiện mà không đáp ứng thì phương án bị loại, dù lợi ích khác lớn đến đâu. "Dữ liệu không rời vùng mạng đã duyệt" là một ràng buộc như vậy. Với Managed Agents, docs ghi rõ vài điểm phải kiểm: sản phẩm đang ở giai đoạn beta; chưa đủ điều kiện cho chế độ không lưu dữ liệu (Zero Data Retention) và cho thoả thuận HIPAA; bản ghi phiên được lưu tới khi bạn xoá; và có lựa chọn sandbox tự host cho yêu cầu về nơi lưu dữ liệu. Chỉ những phương án qua được ràng buộc cứng mới đem ra so chi phí và công sức vận hành.

**Sơ đồ**
1. **Messages API** **|** **Claude Agent SDK** **|** **Claude Managed Agents**
   ↓ _lọc trước: dữ liệu có ở trong vùng mạng đã duyệt không?_
2. **Các phương án qua được ràng buộc cứng**
   ↓ _lúc này mới so_
3. **Chi phí và công sức vận hành**: chọn phương án hợp nhất

> **Trong đề chọn gì**
>
> Đề cho một lợi ích hấp dẫn (giảm chi phí, bớt việc vận hành) cùng một yêu cầu của bộ phận bảo mật, pháp chế hay một cam kết SLA. Hỏi yếu tố nào nên quyết định: chọn đáp án kiểm tra ràng buộc cứng. Các đáp án về chi phí token, độ khớp kỹ thuật hay độ quen thuộc chỉ xét sau.

## Tiêu chí thành công phải đo được

Docs của Anthropic về tiêu chí thành công (**success criteria**) nói tiêu chí tốt có bốn tính chất: cụ thể (specific), đo được (measurable), làm được (achievable, dựa vào số liệu hiện tại hay kinh nghiệm), và đúng mục đích (relevant). Docs cũng gợi ý các khía cạnh thường cần đo: độ chính xác của việc chính, độ nhất quán, giọng văn, bảo vệ dữ liệu riêng tư, độ trễ và chi phí.

Cho ví dụ công ty giao nhận:

| Viết mơ hồ | Viết đo được |
| --- | --- |
| "Phân loại tốt" | Chuyển đúng bộ phận ở lần đầu cho ít nhất 95% email trong bộ 500 email mẫu đã gắn nhãn |
| "Nhanh hơn" | Phản hồi đầu tiên dưới 1 tiếng cho 90% email trong giờ làm việc |
| "Không tốn kém" | Chi phí mỗi email thấp hơn chi phí xử lý thủ công hiện nay |

Con số cụ thể là của riêng ví dụ này. Điều cần nhớ là chỉ số của từng việc phải kéo theo chỉ số kinh doanh ban đầu (9 tiếng chờ, một phần tư email chuyển sai), và phải đặt **trước** khi xây, để sau này còn so được.

> **Ý chính**
>
> Viết vấn đề thành con số, chia thành từng việc, giao cho Claude phần cần hiểu ngôn ngữ, để code làm phần tính toán, loại ngay phương án vi phạm ràng buộc cứng, rồi mới chọn cách xây.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Use case guides (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/overview)
3. [Ticket routing (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/ticket-routing)
4. [Customer support agent (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat)
5. [AI Capabilities and Limitations (Anthropic Academy)](https://academy.claude.com/courses/ai-capabilities-and-limitations)
6. [Claude Managed Agents overview (Claude Docs)](https://platform.claude.com/docs/en/managed-agents/overview)
7. [Agent SDK overview (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/overview)
8. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
