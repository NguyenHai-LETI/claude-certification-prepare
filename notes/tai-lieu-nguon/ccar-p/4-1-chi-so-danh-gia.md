---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-1-chi-so-danh-gia
ngay_tai: 2026-11-27
tieu_de: Định nghĩa chỉ số đánh giá
---

Domain 4: Evaluation, Testing & Optimization · Task 4.1

# Định nghĩa chỉ số đánh giá

Chọn chỉ số cho độ chính xác, độ trễ, chi phí, an toàn và bảo mật của hệ thống dùng Claude, mỗi chỉ số có ngưỡng riêng và gắn đúng với yêu cầu đã nêu.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Đánh giá hệ thống theo nhiều chiều, mỗi chiều một ngưỡng đạt
- Chọn chỉ số độ chính xác theo hình dạng đầu ra
- Viết chỉ tiêu độ trễ có tên đồng hồ đo và phân vị
- Biến an toàn và bảo mật thành tỉ lệ đo được, và nhận ra chỉ số trông đẹp nhưng không chứng minh gì

"Hệ thống chạy tốt chứ?" là câu không trả lời được nếu chưa nói tốt theo nghĩa nào. Một trợ lý có thể trả lời đúng 95% nhưng mỗi câu mất 9 giây, hay rẻ và nhanh nhưng thỉnh thoảng lộ dữ liệu của người khác. Một con số không chứng nhận được cả hệ thống.

Bài này giúp bạn trả lời: đo hệ thống dùng Claude bằng những chỉ số nào, và đặt ngưỡng thế nào?

## Ví dụ xuyên suốt: ứng dụng giao đồ ăn

Một ứng dụng giao đồ ăn dùng Claude cho ba việc:

1. **Phân loại khiếu nại** vào 12 loại (giao trễ, thiếu món, sai món, tài xế thái độ...) để chuyển đúng bộ phận.
2. **Tóm tắt** cuộc chat dài giữa khách và nhân viên để lưu hồ sơ.
3. **Trả lời khách** trong khung chat, đúng giọng thân thiện của thương hiệu.

Ràng buộc: mỗi lượt chat phải có phản hồi đủ nhanh, chi phí mỗi khiếu nại dưới một mức trần, và trợ lý không bao giờ được cho khách này thấy thông tin đơn hàng của khách khác.

## Nhiều chiều, mỗi chiều một ngưỡng

Docs của Anthropic về tiêu chí thành công nói hầu hết ứng dụng cần đánh giá theo **nhiều chiều**: độ chính xác của việc chính, độ nhất quán, mức liên quan, giọng văn, bảo vệ dữ liệu riêng tư, cách dùng context, độ trễ và chi phí. Tiêu chí tốt phải cụ thể và đo được, kể cả với thứ nghe mơ hồ. Docs lấy ví dụ: thay vì "an toàn", viết "dưới 0,1% đầu ra trong 10.000 lần chạy bị bộ lọc nội dung gắn cờ độc hại".

| Chiều | Câu hỏi | Trong ví dụ |
| --- | --- | --- |
| Độ chính xác | Làm đúng việc chưa | Phân loại đúng loại khiếu nại |
| Độ trễ | Nhanh đủ chưa, theo đồng hồ nào | Thời gian tới chữ đầu tiên trong chat |
| Chi phí | Mỗi việc xong tốn bao nhiêu | Chi phí mỗi khiếu nại so với mức trần |
| An toàn | Có sinh nội dung có hại không | Tỉ lệ câu trả lời bị bộ lọc gắn cờ |
| Bảo mật | Có bị lợi dụng hay lộ dữ liệu không | Tỉ lệ lộ đơn hàng người khác trên bộ tấn công thử |

> **Trong đề chọn gì**
>
> Câu luyện thi: pipeline tóm tắt hồ sơ y tế phải nằm dưới một mức trần chi phí mỗi truy vấn và không bao giờ để vai trò không được phép thấy dữ liệu bệnh nhân. Hai chỉ số nhắm đúng: **chi phí token mỗi truy vấn so với mức trần**, và **tỉ lệ kiểm soát truy cập theo vai trò được thực thi đúng, đo trên bộ dữ liệu red-team**. Các chỉ số khác (điểm BLEU so với bản tóm tắt mẫu, thông lượng mỗi phút, độ trễ phân vị 95) đều hợp lý nhưng không đo hai ràng buộc đã nêu.

## Độ chính xác: chọn chỉ số theo hình dạng đầu ra

Docs đưa ví dụ các cách đo cho từng loại việc:

| Đầu ra | Chỉ số | Trong ví dụ |
| --- | --- | --- |
| Nhãn trong một tập cố định | Khớp chính xác (exact match), độ chính xác, F1 | Phân loại 12 loại khiếu nại |
| Văn bản so với bản mẫu | ROUGE-L | Tóm tắt cuộc chat |
| Câu trả lời cho các câu hỏi diễn đạt khác nhau | Độ tương đồng cosine giữa các câu trả lời (đo độ **nhất quán**) | Cùng câu hỏi về phí giao hàng, hỏi theo 5 cách |
| Giọng văn, mức đồng cảm | LLM chấm theo thang 1–5 với rubric | Trả lời khách |
| Có lộ dữ liệu riêng tư không | LLM chấm có/không | Trả lời khách |

> **Bẫy đề**
>
> Độ tương đồng cosine giữa các câu trả lời chỉ cho biết chúng **giống nhau**, không cho biết chúng **đúng**. Một trợ lý sai một cách nhất quán vẫn đạt điểm cao. Muốn đo đúng thì so với đáp án chuẩn.

## Độ trễ: nói rõ đồng hồ nào và phân vị nào

Docs về giảm độ trễ phân biệt độ trễ tổng (tới khi có đủ câu trả lời) và thời gian tới chữ đầu tiên (TTFT). Hai đồng hồ này đo hai thứ khác nhau: với chat có streaming, khách cảm nhận TTFT; với bước phân loại chạy ngầm không streaming, thứ hệ thống chờ là độ trễ tổng.

Chỉ tiêu nên viết theo **phân vị**, không theo trung bình. Ví dụ trong docs: 95% câu trả lời dưới 200 ms. Trung bình che mất những lượt rất chậm, trong khi phân vị nói rõ ngân sách và số trường hợp được phép vượt.

**Sơ đồ**
1. **Chat có streaming**: khách nhìn màn hình **|** **Phân loại chạy ngầm**: hệ thống chờ kết quả
   ↓ _đồng hồ cần đo_
2. **Thời gian tới chữ đầu tiên** **|** **Độ trễ tổng**
   ↓ _viết chỉ tiêu theo phân vị, không theo trung bình_
3. **Ví dụ trong docs**: 95% câu trả lời dưới 200 ms

## Chi phí: trên mỗi việc xong, giữ nguyên độ chính xác

Docs về tối ưu chi phí khuyên so bằng **chi phí trên mỗi việc hoàn thành**, không bằng giá mỗi token. Chỉ số chi phí chỉ có nghĩa khi độ chính xác giữ nguyên: một cấu hình rẻ hơn mà phân loại sai nhiều hơn thì việc chuyển nhầm bộ phận sẽ tốn ở chỗ khác.

## An toàn và bảo mật: thành tỉ lệ đo được

Một chỉ tiêu an toàn kiểm được bằng script cần ba thứ: **cái gì phát hiện** (bộ lọc nào, grader nào), **trên mẫu nào, bao nhiêu lần chạy**, và **ngưỡng tối đa**. Bài viết về đánh giá agent của Anthropic còn nhấn mạnh chấm theo **kết quả cuối** (trạng thái thật của hệ thống) chứ không chỉ theo lời agent nói. Ví dụ của bài viết: agent nói "đã đặt" nhưng cơ sở dữ liệu không có đơn nào. Với bảo mật cũng vậy: kiểm xem dữ liệu của khách khác có thật sự bị trả ra không, đừng chỉ đọc transcript.

Ba thứ đó ghép lại thành một chỉ tiêu:

**Sơ đồ**
1. **Cái gì phát hiện**: bộ lọc hay grader nào **|** **Trên mẫu nào**: bao nhiêu lần chạy **|** **Ngưỡng tối đa**
   ↓ _ghép lại_
2. **Chỉ tiêu kiểm được**: dưới 0,1% đầu ra trong 10.000 lần chạy bị bộ lọc nội dung gắn cờ

Còn chấm theo kết quả cuối thì khác chấm theo lời agent ở chỗ này:

**Sơ đồ**
1. **Chấm theo lời agent nói**: "đã đặt" **|** **Chấm theo kết quả cuối**: mở cơ sở dữ liệu ra xem
   ↓ _khi thật ra không có đơn nào_
2. **Chấm đạt, lỗi lọt qua** **|** **Chấm không đạt, bắt được lỗi**

## Chỉ số trông đẹp nhưng không chứng minh gì

Khung năng lực AI Fluency do Anthropic cùng hai tác giả xây dựng có một năng lực gọi là **Discernment**: đánh giá phê phán đầu ra, cách làm và hành vi của AI. Câu luyện thi dùng năng lực này cho tình huống chỉ số bề mặt.

> **Bẫy đề**
>
> Câu luyện thi: trợ lý mua hàng thử nghiệm có 89% gợi ý được chấp nhận ngay lần đầu, nhưng khảo sát cho thấy chuyên viên hay đổi gợi ý nhà cung cấp sau khi xét những tiêu chí trợ lý không đánh giá. Người phụ trách muốn phát hành nguyên trạng vì tỉ lệ chấp nhận cao. Hai nhận xét đúng: **tỉ lệ chấp nhận không chứng minh gợi ý vẫn đúng** sau khi chuyên viên xem xét lại; và **các tiêu chí bị bỏ sót là một khoảng trống phạm vi** trong đầu vào của trợ lý. Các đáp án sai: tỉ lệ chấp nhận đã đủ chứng minh sẵn sàng; tỉ lệ trả lời khảo sát có thể không đại diện; thời gian thử nghiệm có lẽ quá ngắn.

> **Ý chính**
>
> Mỗi ràng buộc đã nêu có một chỉ số đo thẳng nó và một ngưỡng. Độ chính xác đo theo hình dạng đầu ra, độ trễ nói rõ đồng hồ và phân vị, chi phí tính trên việc xong, an toàn và bảo mật thành tỉ lệ có bộ phát hiện, mẫu và mức trần.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 4](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [Demystifying evals for AI agents (Anthropic)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
4. [Reducing latency (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency)
5. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
6. [AI Fluency, Framework and Foundations (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
