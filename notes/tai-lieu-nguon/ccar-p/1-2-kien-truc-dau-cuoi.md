---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-2-kien-truc-dau-cuoi
ngay_tai: 2026-11-27
tieu_de: Thiết kế kiến trúc đầu cuối
---

Domain 1: Solution Design & Architecture · Task 1.2

# Thiết kế kiến trúc đầu cuối

Một hệ thống dùng Claude gồm các tầng nhận đầu vào, xử lý, trả kết quả và vòng phản hồi. Bài nói mỗi tầng làm gì và việc nào phải đặt ở tầng nào.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Chia một hệ thống dùng Claude thành tầng tiền xử lý, tầng model, tầng hậu xử lý và vòng phản hồi
- Đặt đúng chỗ các bước như che dữ liệu cá nhân, kiểm schema, lưu kết quả
- Hiểu vòng lặp agent khi tầng model là một agent, và biết tool nào do ai chạy
- Thiết kế phản hồi ngay trong lượt chạy (hook, bộ chấm riêng) và sau khi chạy (người sửa thành ca test)

Claude chỉ là một khâu trong hệ thống. Trước nó có dữ liệu cần làm sạch, sau nó có kết quả cần kiểm và lưu, và quanh nó có người dùng góp ý. Kiến trúc tốt đặt từng việc vào đúng khâu.

Bài này giúp bạn trả lời: một hệ thống dùng Claude từ đầu tới cuối gồm những tầng nào, việc nào thuộc tầng nào, và phản hồi đi vào hệ thống bằng đường nào?

## Ví dụ xuyên suốt: xử lý hồ sơ bồi thường bảo hiểm sức khoẻ

Một công ty bảo hiểm sức khoẻ nhận hồ sơ bồi thường qua app: ảnh chụp hoá đơn viện phí, giấy ra viện, đơn thuốc. Họ muốn dùng Claude để đọc hồ sơ, xếp loại (ngoại trú, nội trú, nha khoa), lấy ra các trường như số tiền, ngày khám, chẩn đoán, đối chiếu với hợp đồng của khách, rồi đưa cho nhân viên thẩm định duyệt. Cuối tháng lượng hồ sơ tăng gấp ba ngày thường.

## Bốn tầng của hệ thống

Một kiến trúc đầu cuối (**end-to-end architecture**) đi theo chuỗi đầu vào → xử lý → đầu ra → vòng phản hồi (**input → processing → output → feedback loops**). Trong đề, phần xử lý thường được chia rõ hơn thành ba lớp: tiền xử lý (**Pre-Processing**), tầng model (**Model Stage**) và hậu xử lý (**Post-Processing**).

| Tầng | Câu hỏi để xếp | Trong ví dụ |
| --- | --- | --- |
| Pre-Processing | Có phải chuẩn bị dữ liệu trước khi model thấy không? | Nhận diện chữ trong ảnh (OCR), che số CCCD và số điện thoại, kiểm quyền người gửi |
| Model Stage | Có phải chính Claude xử lý không? | Claude xếp loại hồ sơ, Claude trích các trường có cấu trúc |
| Post-Processing | Có phải xử lý kết quả model trả về không? | Kiểm kết quả đúng schema, đối chiếu số tiền với hạn mức trong code, lưu bản ghi đã kiểm vào hệ thống chính |
| Feedback loop | Có giúp lượt này hoặc lần sau tốt hơn không? | Bộ chấm kiểm bản tóm tắt; ghi lại chỗ nhân viên thẩm định sửa, đưa vào bộ test |

Mẹo xếp tầng: đi theo đường dữ liệu chảy qua hệ thống. Việc nào xảy ra trước khi gọi model là tiền xử lý, việc nào do model làm là tầng model, việc nào dùng kết quả model là hậu xử lý.

Đường đi của một hồ sơ bồi thường:

**Sơ đồ**
1. **Hồ sơ từ app**: ảnh hoá đơn, giấy ra viện, đơn thuốc
   ↓ _tiền xử lý: OCR, che số CCCD và số điện thoại, kiểm quyền người gửi_
2. **Claude**: xếp loại hồ sơ, trích số tiền, ngày khám, chẩn đoán
   ↓ _hậu xử lý: kiểm đúng schema, đối chiếu hạn mức bằng code_
3. **Hệ thống chính**: lưu bản ghi đã kiểm
   ↓ _nhân viên thẩm định duyệt và sửa nếu cần_
4. **Bộ test**: chỗ người sửa thành ca test

> **Bẫy đề**
>
> Kiểm schema và lưu vào hệ thống chính nghe như "một phần của việc trích xuất", nên dễ xếp nhầm vào tầng model. Chúng đều dùng kết quả Claude đã trả về, nên thuộc hậu xử lý. Ngược lại, che dữ liệu cá nhân phải làm **trước** khi gọi model, không phải sau.

## Khi tầng model là một agent

Nếu tầng model chỉ là một lần gọi Claude, mọi thứ đơn giản. Nhưng khi Claude cần tự tra hợp đồng, tra danh mục thuốc rồi mới kết luận, tầng model là một vòng lặp agent (**agent loop**). Docs của Agent SDK mô tả vòng lặp này: mỗi lượt, Claude trả về chữ và/hoặc các lời gọi tool; nếu có lời gọi tool thì tool được chạy và kết quả đưa lại cho Claude; vòng lặp dừng khi Claude trả lời mà không gọi tool nào nữa. Câu trả lời đó là đầu ra.

**Sơ đồ**
1. **Claude trả lời**: chữ và/hoặc các lời gọi tool
2. **Có lời gọi tool**: tool được chạy
3. **Kết quả tool**: đưa lại cho Claude
- ↻Không gọi tool nào nữa thì thoát vòng, câu trả lời đó là đầu ra

Vòng lặp không tự giới hạn. Agent SDK có `max_turns` và `max_budget_usd`, mặc định là không giới hạn, và kết quả cuối có loại (`subtype`) cho biết vòng lặp xong bình thường (`success`) hay dừng vì chạm giới hạn lượt, giới hạn chi phí hoặc lỗi. Chỉ loại `success` mới có câu trả lời, nên phải kiểm loại trước khi dùng kết quả.

### Tool nào do ai chạy

Docs về tool use nói rõ: model không bao giờ tự chạy gì cả. Nó chỉ gửi yêu cầu gọi tool, còn việc chạy thuộc về một trong hai bên:

| Loại tool | Ai chạy | Ví dụ |
| --- | --- | --- |
| Tool do bạn định nghĩa (client tool) | Code của bạn, rồi gửi `tool_result` về | `tra_han_muc_hop_dong`, `tra_danh_muc_thuoc` |
| Tool có schema do Anthropic định nghĩa | Vẫn là code của bạn | memory, bash, text_editor, computer |
| Server tool | Anthropic chạy, bạn không gửi `tool_result` | web_search, web_fetch, code_execution, tool_search |

Server tool chạy trong một vòng lặp phía Anthropic có giới hạn số lần lặp. Nếu chạm giới hạn khi chưa xong, phản hồi trả về `stop_reason` là `pause_turn`: việc chưa xong, bạn gửi lại hội thoại (kèm phản hồi đó) để Claude làm tiếp.

> **Bẫy đề**
>
> Tool có schema do Anthropic định nghĩa (như bash hay text_editor) không có nghĩa là Anthropic chạy nó. Ứng dụng của bạn chạy. Và `pause_turn` không phải lỗi hay câu trả lời cuối; bỏ qua nó là bỏ dở việc.

### Khi nào thật sự cần tool

Docs gợi ý dùng tool khi việc có tác dụng phụ (ghi, gửi, đổi trạng thái), cần dữ liệu mới hoặc bên ngoài, cần đầu ra đúng một hình dạng, hoặc phải gọi hệ thống có sẵn. Không cần tool cho việc model làm được từ chính nội dung đã có, như tóm tắt hay dịch, vì mỗi lần gọi tool tốn thêm ít nhất một lượt đi về. Docs còn đưa một dấu hiệu dễ nhớ: nếu bạn đang viết regex để móc một quyết định ra khỏi câu trả lời của model, thì quyết định đó lẽ ra phải là một lời gọi tool.

## Thứ tự an toàn và chịu tải

Nếu hệ thống có truy xuất tài liệu (RAG), bước xác thực và phân quyền phải chạy **trước** bước truy xuất. Như vậy truy xuất mới lọc được theo người hỏi: nhân viên chi nhánh Đà Nẵng chỉ thấy hồ sơ của chi nhánh mình. Nếu truy xuất trước rồi mới lọc trong câu trả lời, dữ liệu không được phép đã nằm trong context của model. Cũng vì an toàn, log hội thoại không được chứa nguyên số giấy tờ tuỳ thân, kể cả với lý do "để có thêm dữ liệu tinh chỉnh".

Cuối tháng hồ sơ tăng gấp ba. Nếu app gọi thẳng Claude cho từng hồ sơ, lúc cao điểm sẽ gặp giới hạn tốc độ và lỗi hàng loạt. Cách làm quen thuộc là đặt một hàng đợi bất đồng bộ (**asynchronous queue**) giữa bước nhận hồ sơ và bước gọi model: hồ sơ vào hàng đợi, các worker lấy ra xử lý với tốc độ hệ thống chịu được.

**Sơ đồ**
1. **App nhận hồ sơ**: cuối tháng tăng gấp ba
   ↓ _đẩy vào hàng đợi, không gọi thẳng Claude_
2. **Hàng đợi bất đồng bộ**: hấp thụ lưu lượng dồn
   ↓ _lấy ra với tốc độ hệ thống chịu được_
3. **Worker 1** **|** **Worker 2** **|** **Worker 3**
   ↓ _gọi model_
4. **Claude**: không còn bị dồn lúc cao điểm, tránh lỗi giới hạn tốc độ hàng loạt

Hướng dẫn ticket routing của Anthropic cũng nhắc một lựa chọn ở khâu nhận đầu vào: hệ thống nguồn tự đẩy sự kiện sang qua webhook (**push**), hoặc dịch vụ của bạn định kỳ kéo dữ liệu mới về (**pull**). Đẩy thì mở rộng tốt hơn nhưng phải mở một endpoint công khai. Kéo thì dễ làm hơn, nhưng kéo quá dày thì tốn lượt gọi thừa, kéo quá thưa thì chậm.

> **Trong đề chọn gì**
>
> Đề cho một bản thiết kế phục vụ hàng nghìn người dùng cùng lúc và hỏi phát biểu nào đúng. Chọn: kiểm quyền trước khi truy xuất để truy xuất lọc theo danh tính; hàng đợi bất đồng bộ để hấp thụ lưu lượng dồn. Loại: đưa logic tính toán vào system prompt; giữ nguyên dữ liệu định danh trong log.

## Vòng phản hồi: trong lượt chạy và sau khi chạy

Phản hồi đi vào hệ thống bằng hai đường.

**Trong lượt chạy**, để sửa ngay kết quả của lượt này:

- **Kết quả tool**: tra hạn mức thấy hồ sơ vượt mức, Claude nhận kết quả đó và điều chỉnh kết luận.
- **Hook**: đoạn code chạy ở những điểm cố định của vòng lặp, ví dụ `PreToolUse` chạy trước mỗi lần gọi tool. Hook chạy trong process ứng dụng, không tốn context, và có thể chặn một lời gọi tool; Claude nhận lý do bị chặn thay cho kết quả. Trong ví dụ, một hook chặn mọi lần ghi kết quả thẩm định có số tiền vượt hạn mức hợp đồng. Một dòng dặn trong system prompt không chắc được tuân thủ mọi lần; hook thì lần nào cũng chạy.
- **Bộ chấm riêng**: Claude Managed Agents có tính năng outcome (đang beta). Bạn mô tả kết quả mong muốn kèm một rubric, hệ thống tự dựng một grader chấm sản phẩm theo rubric và gửi nhận xét lại cho agent sửa, tối đa `max_iterations` vòng (mặc định 3, tối đa 20). Grader dùng một context window riêng để không bị ảnh hưởng bởi cách agent chính đã làm. Đây là lý do không nên để agent tự chấm bài của chính nó.

**Sau khi chạy**, để lần sau tốt hơn: mỗi lần nhân viên thẩm định sửa một trường Claude trích sai, hệ thống ghi lại hồ sơ gốc, kết quả của Claude và bản sửa. Những ca này:

1. Thêm vào bộ test (**evaluation set**) để lần sửa prompt sau chạy lại và so sánh.
2. Cho biết loại hồ sơ nào hay sai, để ưu tiên cải thiện.
3. Theo dõi theo thời gian: tỉ lệ phải sửa tăng lên là dấu hiệu dữ liệu đầu vào đã đổi.

Docs của Anthropic về đánh giá khuyên làm bộ test sát với việc thật và tự động hoá việc chấm khi có thể. Dữ liệu từ vòng phản hồi chính là nguồn ca test sát thực tế nhất.

Hai đường phản hồi đặt cạnh nhau:

**Sơ đồ**
1. **Trong lượt chạy**: sửa ngay kết quả của lượt này **|** **Sau khi chạy**: để lần sau tốt hơn
   ↓ _đi vào bằng_
2. **Kết quả tool, hook, bộ chấm riêng** **|** **Hồ sơ gốc, kết quả của Claude, bản người sửa**
   ↓ _tác dụng_
3. **Claude điều chỉnh, hoặc lời gọi tool bị chặn** **|** **Bộ test có thêm ca thật, biết loại hồ sơ nào hay sai**

> **Ý chính**
>
> Đi theo đường dữ liệu: chuẩn bị và kiểm quyền trước model, kiểm và lưu sau model. Luật bắt buộc đặt vào hook hay code, việc chấm giao cho một bộ chấm riêng, và chỗ người sửa trở thành ca test.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [How tool use works (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
3. [How the agent loop works (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/agent-loop)
4. [Define outcomes (Claude Managed Agents)](https://platform.claude.com/docs/en/managed-agents/define-outcomes)
5. [Ticket routing (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/ticket-routing)
6. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
