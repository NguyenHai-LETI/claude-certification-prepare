---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-3-chon-mau-kien-truc
ngay_tai: 2026-11-27
tieu_de: Chọn augmented LLM, workflow hay agent
---

Domain 1: Solution Design & Architecture · Task 1.3

# Chọn augmented LLM, workflow hay agent

Ba mẫu kiến trúc augmented LLM, workflow và agent khác nhau ở đâu, đánh đổi gì về độ trễ, chi phí, độ dễ đoán, và khi nào chọn mẫu nào.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 2 nguồn

## Đọc xong bạn nắm được

- Phân biệt augmented LLM, workflow và agent theo ai quyết định bước tiếp theo
- Kể được các mẫu workflow thường gặp và việc mỗi mẫu hợp
- Chọn mẫu đơn giản nhất đáp ứng được yêu cầu, và nêu đúng lý do
- Nhận ra lý do sai khi đề ghép một mẫu đúng với một giải thích sai

Agent đang là chữ được nhắc nhiều nhất, nên rất dễ muốn dùng agent cho mọi việc. Nhưng nhiều bài toán chỉ cần một lần gọi Claude có kèm tài liệu là đủ, rẻ hơn, nhanh hơn và dễ kiểm hơn.

Bài này giúp bạn trả lời: với một bài toán cụ thể, chọn augmented LLM, workflow hay agent, và vì sao?

## Ví dụ xuyên suốt: ba việc ở phòng đào tạo một trường đại học

Phòng đào tạo của một trường đại học muốn dùng Claude cho ba việc:

1. **Trả lời câu hỏi về quy chế học vụ**: "Em nợ 2 môn thì có được xét tốt nghiệp không?". Câu trả lời phải dẫn đúng điều khoản trong bộ quy chế chính thức của trường.
2. **Xử lý đơn xin bảo lưu**: lần nào cũng đúng bốn bước: đọc đơn, kiểm điều kiện, soạn quyết định, lưu vào hệ thống.
3. **Hỗ trợ bộ phận IT điều tra sự cố cổng đăng ký môn học**: mỗi lần lỗi một kiểu, phải xem log, đọc cấu hình, thử giả thuyết, không biết trước cần bao nhiêu bước.

## Ba mẫu kiến trúc

Bài viết Building effective agents của Anthropic dùng ba khái niệm:

| Mẫu | Ai quyết định bước tiếp theo | Trong ví dụ |
| --- | --- | --- |
| Augmented LLM | Không có chuỗi bước; một lần gọi model, model được bổ sung truy xuất tài liệu, tool và bộ nhớ | Trả lời quy chế: truy xuất điều khoản liên quan rồi trả lời kèm trích dẫn |
| Workflow | Code của bạn. Model và tool chạy theo các đường đi viết sẵn (**predefined code paths**) | Đơn bảo lưu: bốn bước cố định |
| Agent | Chính model. Nó tự quyết bước tiếp theo và tool cần dùng | Điều tra sự cố: không biết trước số bước |

**Augmented LLM** là viên gạch cơ bản: một LLM được bổ sung khả năng truy xuất (retrieval), tool và bộ nhớ. Workflow và agent đều xây từ viên gạch này. Bài viết nhấn mạnh rằng với nhiều ứng dụng, chỉ cần tối ưu một lần gọi model kèm truy xuất và vài ví dụ là đủ.

## Các mẫu workflow

Khi đã cần nhiều bước nhưng các bước biết trước, bài viết kể năm mẫu workflow:

| Mẫu | Hợp khi |
| --- | --- |
| **Prompt chaining** | Việc chia gọn được thành các bước cố định; có thể đặt bước kiểm (gate) bằng code giữa hai bước |
| **Routing** | Đầu vào chia thành các loại rõ ràng, mỗi loại xử lý riêng tốt hơn; ví dụ câu dễ cho model nhỏ, câu khó cho model lớn |
| **Parallelization** | Chia việc thành phần độc lập chạy song song (sectioning), hoặc chạy cùng một việc nhiều lần để lấy kết quả chắc hơn (voting) |
| **Orchestrator-workers** | Không đoán trước được cần những việc con nào; một model chia việc, giao cho các model khác, rồi gom kết quả |
| **Evaluator-optimizer** | Có tiêu chí đánh giá rõ và sửa nhiều vòng thật sự cho kết quả tốt hơn: một model viết, một model chấm và góp ý |

Mỗi mẫu có một hình dạng riêng, nhớ hình là dễ phân biệt.

**Prompt chaining**: đi một đường thẳng, giữa hai bước có thể đặt bước kiểm bằng code.

**Sơ đồ**
1. **Đọc đơn bảo lưu**
   ↓ _gate bằng code: đơn có đủ trường không?_
2. **Kiểm điều kiện**
   ↓ _kết quả bước trước là đầu vào bước sau_
3. **Soạn quyết định**
   ↓ _gate bằng code: đúng mẫu quyết định không?_
4. **Lưu vào hệ thống**

**Routing**: rẽ một trong các nhánh, mỗi đầu vào chỉ đi một nhánh.

**Sơ đồ**
1. **Câu hỏi đến**
   ↓ _phân loại, chọn một nhánh_
2. **Câu dễ**: model nhỏ **|** **Câu khó**: model lớn

**Parallelization, kiểu sectioning**: các việc khác nhau chạy cùng lúc.

**Sơ đồ**
1. **Câu hỏi đến**
   ↓ _hai việc khác nhau_
2. **Viết câu trả lời** **|** **Kiểm nội dung cấm**
   ↓ _gộp lại_
3. **Câu trả lời đã qua kiểm**

**Parallelization, kiểu voting**: cùng một việc chạy nhiều lần rồi so.

**Sơ đồ**
1. **Một đoạn cần xét**
   ↓ _cùng một việc, chạy ba lần_
2. **Lần 1** **|** **Lần 2** **|** **Lần 3**
   ↓ _so kết quả_
3. **Kết luận chắc hơn**

**Orchestrator-workers**: một model ở giữa, tuỳ đầu vào mà quyết định cần những việc con nào.

**Sơ đồ**
- Trung tâm: **Model điều phối**: chia việc theo đầu vào, gom kết quả
- **Model A**: việc con 1
- **Model B**: việc con 2
- **Model C**: việc con 3

_Việc con không biết trước, mỗi đầu vào có thể chia khác đi_

**Evaluator-optimizer**: một vòng khép kín giữa người viết và người chấm.

**Sơ đồ**
1. **Model viết**: tạo bản nháp
2. **Model chấm**: chấm theo tiêu chí rõ
3. **Góp ý**: gửi lại cho model viết
- ↻Đạt tiêu chí thì thoát vòng

Còn agent thì hợp với việc mở, khó hoặc không thể đoán trước cần bao nhiêu bước.

> **Bẫy đề**
>
> Ba chỗ hay nhầm khi chọn mẫu workflow:
>
> - **Sectioning và voting**: các việc _khác nhau_ chạy cùng lúc (viết câu trả lời song song với kiểm nội dung cấm) là sectioning. Voting là _cùng một việc_ chạy nhiều lần rồi so kết quả.
> - **Nhiều việc con không có nghĩa là cần orchestrator-workers.** Nếu các việc con biết trước và cố định, chaining hay parallelization đơn giản hơn và rẻ hơn. Orchestrator chỉ cần khi việc con tuỳ vào đầu vào, không đoán trước được.
> - **Luật tất định thì kiểm bằng code.** Độ dài tối đa, định dạng ngày, trường bắt buộc nên kiểm ở bước gate bằng code, không cần dựng vòng evaluator-optimizer bằng LLM cho chúng.

## Đánh đổi khi chọn

Càng đi từ augmented LLM sang agent, hệ thống càng linh hoạt nhưng càng tốn:

- **Độ trễ và chi phí**: hệ thống nhiều bước gọi model nhiều lần. Bài viết nói hệ thống agentic thường đổi độ trễ và chi phí lấy chất lượng tốt hơn.
- **Độ dễ đoán**: workflow cho kết quả nhất quán, chi phí mỗi yêu cầu dễ ước lượng. Agent khó đoán hơn.
- **Lỗi cộng dồn**: agent chạy nhiều bước tự quyết thì một lỗi sớm có thể kéo theo lỗi ở các bước sau. Bài viết khuyên thử kỹ trong môi trường cách ly và có guardrail.

Lời khuyên chung: tìm lời giải đơn giản nhất có thể, chỉ thêm độ phức tạp khi nó thật sự làm kết quả tốt hơn.

> **Trong đề chọn gì**
>
> Trợ lý hỏi đáp phải trả lời kèm trích dẫn từ bộ tài liệu chính thức, ưu tiên độ trễ, chi phí và dễ kiểm tra: chọn augmented LLM với RAG trên bộ tài liệu đã đánh chỉ mục, hiển thị trích dẫn ở mỗi câu trả lời. Việc theo các bước cố định, muốn chi phí mỗi yêu cầu dễ đoán: chọn workflow.

## Đúng mẫu nhưng phải đúng cả lý do

Đề hay hỏi "mẫu nào hợp **và vì sao**". Có đáp án chọn đúng mẫu nhưng giải thích sai, nên phải đọc cả vế lý do.

> **Bẫy đề**
>
> Với việc phân loại tài liệu theo bốn bước cố định, câu luyện thi có đáp án "chọn workflow vì agent không gọi được tool nên không ghi kết quả xuống hệ thống được". Mẫu đúng nhưng lý do sai: agent gọi tool bình thường. Lý do đúng là các bước rõ ràng, dễ đoán và bài toán ưu tiên chi phí mỗi yêu cầu dễ đoán hơn tính linh hoạt. Cũng loại "agent luôn chính xác hơn workflow" vì đó là khẳng định tuyệt đối.

Với trợ lý quy chế, các đáp án sai thường phức tạp hoá hoặc phá yêu cầu: chạy nhiều agent (lập kế hoạch, tìm kiếm, viết) cho mỗi câu hỏi thì chậm và tốn; cho agent duyệt web tự do thì bỏ mất yêu cầu chỉ dùng tài liệu chính thức; nhét toàn bộ quy chế vào mọi yêu cầu thì tốn token và khó dẫn đúng nguồn.

> **Ý chính**
>
> Bắt đầu từ augmented LLM. Các bước biết trước thì dùng workflow. Chỉ dùng agent khi không đoán trước được cần những bước nào.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Building effective agents (Anthropic)](https://www.anthropic.com/engineering/building-effective-agents)
