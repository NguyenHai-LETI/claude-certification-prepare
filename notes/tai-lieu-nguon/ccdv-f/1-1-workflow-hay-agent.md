---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/1-1-workflow-hay-agent
ngay_tai: 2026-11-27
tieu_de: Workflow hay agent, và khi nào chia cho subagent
---

Domain 1: Agents and Workflows · Task 1.1

# Workflow hay agent, và khi nào chia cho subagent

Chọn workflow hay agent theo việc ai quyết định bước tiếp theo, dựng orchestrator giao việc cho subagent, và biết khi nào chia nhiều agent thì đáng tiền.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Phân biệt workflow với agent bằng câu hỏi "ai quyết định bước tiếp theo"
- Chọn mức tự chủ thấp nhất đáp ứng được yêu cầu, và biết mức cao hơn tốn gì
- Mô tả cách một orchestrator giao việc cho subagent và nhận gì về
- Nhận ra ba tình huống subagent làm tốt hơn một agent, và cái giá về token, thời gian

Nhiều đội bắt đầu bằng câu "mình làm một agent cho việc này", trong khi việc đó chỉ cần vài bước viết sẵn trong code. Ngược lại, có việc mà quy trình cố định cứ gãy mãi vì không đoán trước được bước nào sẽ cần.

Bài này giúp bạn trả lời: khi nào dùng workflow, khi nào dùng agent, và khi nào nên chia một agent thành nhiều agent?

## Ví dụ xuyên suốt: trường dạy lái xe nhận hồ sơ đăng ký

Một trường dạy lái xe nhận khoảng 300 hồ sơ đăng ký học mỗi tháng qua biểu mẫu trên web. Đường đi thông thường của một hồ sơ:

1. Đọc biểu mẫu và ảnh giấy tờ đính kèm (căn cước, giấy khám sức khoẻ).
2. Kiểm hồ sơ đã đủ giấy tờ cho hạng bằng đăng ký chưa.
3. Xếp vào lớp còn chỗ theo hạng bằng và ca học.
4. Gửi email xác nhận kèm lịch học.

Khoảng một phần mười hồ sơ không đi theo đường này: ảnh giấy khám bị mờ, học viên đã có bằng B muốn học lên C1, hoặc ghi chú "tôi chỉ học được tối thứ Bảy". Những hồ sơ này cần ai đó đọc kỹ rồi quyết định: xin bổ sung giấy tờ, xếp lớp đặc biệt, hay chuyển cho giáo vụ.

## Ai quyết định bước tiếp theo

Bài viết "Building effective agents" của Anthropic chia hệ thống dùng LLM thành hai loại:

- **Workflow**: LLM và tool được điều phối theo đường đi viết sẵn trong code. Code của bạn quyết định bước tiếp theo.
- **Agent**: LLM tự điều khiển quá trình làm và tự chọn tool, quyết định cách hoàn thành việc. Model quyết định bước tiếp theo.

Lời khuyên của bài viết là tìm giải pháp đơn giản nhất có thể, chỉ thêm độ phức tạp khi cần, kể cả khi điều đó nghĩa là không làm agent. Hệ thống agent thường đổi độ trễ và chi phí lấy kết quả tốt hơn. Bạn có thể hình dung một cái thang:

| Bậc | Là gì | Hợp khi |
| --- | --- | --- |
| Một lần gọi model | Một model được bổ sung truy xuất, tool, bộ nhớ (**augmented LLM**) | Một câu hỏi, một câu trả lời |
| Workflow | Nhiều lần gọi theo thứ tự viết sẵn | Các bước biết trước, tách bạch được |
| Agent | Model gọi tool trong vòng lặp, tự quyết đến khi xong | Việc mở, không đoán trước được số bước, không viết cứng được đường đi |

Agent tự chủ nên tốn hơn, và lỗi có thể chồng lên nhau qua nhiều bước. Bài viết khuyên thử kỹ trong môi trường sandbox và có guardrail phù hợp trước khi giao việc cho agent.

Trong ví dụ, chín phần mười hồ sơ đi đúng bốn bước biết trước, nên làm workflow: dễ test, chạy giống nhau mỗi lần. Chỉ ở chỗ "hồ sơ lạ" mới cần một agent đọc hồ sơ và chọn giữa ba hướng xử lý.

**Sơ đồ**
1. **Đọc biểu mẫu và ảnh giấy tờ**
   ↓ _kiểm đủ giấy tờ cho hạng bằng_
2. **Hồ sơ bình thường**: chín phần mười **|** **Hồ sơ lạ**: ảnh mờ, học lên hạng, ghi chú riêng
   ↓ _xử lý_
3. **Xếp lớp, gửi email**: các bước viết trong code **|** **Agent đọc hồ sơ, chọn**: xin bổ sung, lớp đặc biệt, chuyển giáo vụ

1. **Các bước biết trước và không đổi?** → Workflow, các bước viết trong code
2. **Đường chính biết trước, chỉ vài chỗ cần phán đoán?** → Workflow cho đường chính, gọi agent ở điểm quyết định
3. **Không đoán được cần mấy bước, bước nào?** → Agent, có giới hạn số vòng và guardrail
- **Còn lại** → Một lần gọi model là đủ

> **Trong đề chọn gì**
>
> Câu luyện thi: xử lý hoá đơn nhà cung cấp, vài bước quen thuộc, thỉnh thoảng gặp định dạng lạ phải chọn giữa chuyển hướng, hỏi lại hay đưa người duyệt. Chọn **workflow cho đường chuẩn, gọi agent ở điểm quyết định khi gặp định dạng lạ**. Loại: agent tự chủ làm mọi hoá đơn; manager agent giao từng bước cho một subagent; một prompt lớn xử lý mọi thứ trong một lần gọi.

## Manager/supervisor: orchestrator giao việc cho subagent

Khi một agent phải lo nhiều mảng, cách phổ biến là dựng một tầng quản lý. Đề thi gọi đây là cấu trúc **manager/supervisor**; tài liệu Anthropic gọi là **orchestrator-workers** hay orchestrator và **subagent**. Một agent chính (orchestrator, lead agent) đọc yêu cầu, chia thành việc nhỏ, giao cho các subagent, rồi gộp kết quả.

Mùa cao điểm, trường lái xe muốn thêm trợ lý trả lời học viên. Câu hỏi của học viên thường dính ba mảng: học phí và trả góp, lịch học và sân tập, trạng thái hồ sơ thi sát hạch. Thiết kế:

- Orchestrator đọc câu hỏi, xác định mảng nào liên quan, giao cho subagent tương ứng, rồi gộp thành một câu trả lời.
- Mỗi subagent có system prompt riêng và chỉ có tool của mảng mình: subagent học phí có `tra_hoc_phi`, subagent lịch có `tra_lich_san`, subagent hồ sơ có `tra_ho_so`.
- Mỗi subagent chạy trong **context riêng** (**isolated context**): không thấy hội thoại của orchestrator hay của subagent khác. Docs Agent SDK nói các lần gọi tool trung gian nằm lại trong subagent, chỉ tin nhắn cuối cùng được trả về cho agent chính.

**Sơ đồ**
- Trung tâm: **Orchestrator**: đọc câu hỏi, chọn mảng liên quan, gộp câu trả lời
- **Subagent học phí**: chỉ có tool tra_hoc_phi
- **Subagent lịch**: chỉ có tool tra_lich_san
- **Subagent hồ sơ**: chỉ có tool tra_ho_so

_Mọi việc đi qua orchestrator. Các subagent không thấy hội thoại của nhau, chỉ gửi về tin nhắn cuối_

Vì subagent không thấy hội thoại gốc, thứ duy nhất nó nhận là lời giao việc. Bài viết về hệ thống nghiên cứu nhiều agent của Anthropic nói mỗi subagent cần: mục tiêu, định dạng kết quả, hướng dẫn dùng tool và nguồn nào, ranh giới việc rõ ràng. Thiếu những thứ đó, các subagent làm trùng việc của nhau, bỏ sót, hoặc không tìm ra thông tin cần.

> **Trong đề chọn gì**
>
> Câu luyện thi mô tả sơ đồ: một thành phần trên cùng định tuyến, sắp thứ tự và gộp kết quả; ba thành phần con mỗi cái có danh sách tool và lịch sử hội thoại riêng, không chia sẻ. Đây là **manager/supervisor với context tách riêng cho từng subagent**. Sai: manager/supervisor dùng chung một lịch sử hội thoại; pipeline chuyền nguyên lịch sử cho bước sau; mẫu truy xuất (RAG).

Tầng quản lý không chỉ giao việc. Nó còn phải kiểm những gì subagent trả về trước khi chuyển tiếp: giới hạn số lần gọi tool và token cho mỗi subagent, kiểm kết quả theo một schema định trước, và thống nhất "hợp đồng bàn giao" giữa các bước (bước trước trả gì, bước sau cần gì).

**Sơ đồ**
1. **Subagent trả kết quả**
   ↓ _orchestrator kiểm theo schema, ngân sách tool và token, hợp đồng bàn giao_
2. **Đạt**: chuyển cho bước sau **|** **Không đạt**: giữ lại, không chuyển tiếp lỗi

> **Bẫy đề**
>
> Câu luyện thi: hệ có agent chính và ba subagent (lấy dữ liệu, phân tích, viết báo cáo). Subagent gọi tool trùng lặp, vượt ngân sách token, kết quả mâu thuẫn nhau, và agent chính chuyển tiếp mà không bắt lỗi. Đúng là **siết tầng quản lý của agent chính: ngân sách tool cho từng subagent, kiểm kết quả theo schema trước khi chuyển tiếp, hợp đồng bàn giao rõ ràng**. Sai: thêm thử lại và ghi log cho từng subagent (không chặn được lỗi); cho các subagent đọc kết quả của nhau (làm mất vai trò điều phối); gộp cả ba vào một lần gọi model lớn.

## Khi nào subagent giúp, và cái giá phải trả

Bài blog "When to use multi-agent systems" của Claude nêu ba tình huống mà nhiều agent làm tốt hơn một agent:

| Tình huống | Dấu hiệu | Trong ví dụ |
| --- | --- | --- |
| Bảo vệ context (**context protection**) | Việc phụ đổ vào context rất nhiều token mà phần lớn không liên quan việc chính | Tra lịch sân trả về cả bảng lịch tháng, trong khi chỉ cần ba ca còn trống |
| Chạy song song (**parallelization**) | Việc tách được thành các nhánh độc lập | Ba câu hỏi về học phí, lịch, hồ sơ tra cùng lúc |
| Chuyên môn hoá (**specialization**) | Quá nhiều tool (thường từ 20 trở lên), tool thuộc nhiều mảng khác nhau dễ nhầm, hoặc các mảng cần system prompt mâu thuẫn nhau | Mỗi subagent chỉ giữ tool của mảng mình |

Ngoài ba tình huống này, chi phí điều phối thường lớn hơn lợi ích. Cái giá cụ thể:

- **Token**: blog trên nói hệ nhiều agent thường tốn gấp 3–10 lần token so với một agent cho cùng một việc. Bài viết về hệ thống nghiên cứu đo được agent dùng khoảng 4 lần token so với chat thường, hệ nhiều agent khoảng 15 lần.
- **Thời gian**: chạy song song giúp phủ rộng hơn, không chắc nhanh hơn. Tổng thời gian của hệ nhiều agent thường còn dài hơn một agent vì khối lượng tính toán tăng.
- **Mất thông tin ở mỗi lần bàn giao**: nếu chia theo loại việc (một agent lập kế hoạch, một agent viết, một agent test cho cùng một tính năng), mỗi lần chuyển tay lại mất ngữ cảnh. Blog khuyên chia theo ranh giới ngữ cảnh: chỉ tách khi phần việc đó thật sự độc lập.

Nếu agent khó chọn tool chỉ vì có quá nhiều tool, blog gợi ý thử **Tool Search Tool** (Claude tìm tool khi cần thay vì nạp hết định nghĩa từ đầu) trước khi tách thành nhiều agent.

> **Bẫy đề**
>
> Câu luyện thi: agent hỗ trợ khách hay rối khi một ticket dính cả thanh toán, giao hàng và sản phẩm, quên vấn đề nào đã xử lý và quay lại làm lại. Đúng là **thêm orchestrator giao từng vấn đề con cho subagent chuyên trách**. Sai: chuyển sang workflow cố định theo thứ tự (ticket không đến theo thứ tự đó); tăng context window (không chữa chuyện lẫn lộn); thêm prompt bảo agent tự ghi nhớ vấn đề nào đã xong.

Câu luyện thi khác hỏi mẫu cho việc nghiên cứu nhiều bước: chia nhỏ, giao từng phần cho một subagent tập trung, rồi tổng hợp. Đáp án là **orchestrator và subagent chuyên trách cho từng phần**. Các lựa chọn còn lại (lưu trước toàn bộ lịch sử nghiên cứu, cắt bỏ nội dung mỗi phần sau khi xong, một vòng lặp tool có mọi tool) là kỹ thuật quản lý bộ nhớ và context, không trả lời câu hỏi về cách điều phối.

> **Ý chính**
>
> Hỏi "ai quyết định bước tiếp theo": code thì là workflow, model thì là agent. Chọn bậc thấp nhất đủ dùng. Chỉ chia nhiều agent khi cần bảo vệ context, chạy song song hay chuyên môn hoá, và nhớ rằng mỗi subagent tốn thêm token và mất ngữ cảnh khi bàn giao.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Building effective agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
3. [How we built our multi-agent research system (Anthropic Engineering)](https://www.anthropic.com/engineering/multi-agent-research-system)
4. [When to use multi-agent systems (Claude Blog)](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
5. [Subagents in the SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/subagents)
