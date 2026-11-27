---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/5-1-nen-tang-llm
ngay_tai: 2026-11-27
tieu_de: Nền tảng LLM - token, context window, lấy mẫu, thinking và ví dụ trong prompt
---

Domain 5: Model Selection and Optimization · Task 5.1

# Nền tảng LLM - token, context window, lấy mẫu, thinking và ví dụ trong prompt

Token là gì, model sinh chữ ra sao và vì sao có lúc bịa, context window chứa gì, vì sao cùng prompt ra kết quả khác, và thinking, effort, fast mode làm gì.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Giải thích token là gì và ước lượng chữ đổi ra token thế nào
- Mô tả cách model sinh từng token, và vì sao câu trôi chảy vẫn có thể sai
- Biết context window chứa những gì, và vì sao temperature không liên quan tới nó
- Giải thích vì sao cùng prompt cho kết quả khác nhau, và thiết kế ứng dụng chịu được điều đó
- Chọn thinking, effort, fast mode và số ví dụ mẫu trong prompt cho đúng việc

Nhiều câu hỏi trong đề không cần biết API nào cả, chỉ cần hiểu LLM hoạt động ra sao: vì sao cùng một câu hỏi mà hai lần trả lời khác nhau, vì sao tăng một tham số không làm context rộng ra, vì sao câu trả lời rất tự tin vẫn có thể sai.

Bài này giúp bạn trả lời: những khái niệm nền nào của LLM mà người viết ứng dụng phải nắm, và chúng ảnh hưởng tới thiết kế ra sao?

## Ví dụ xuyên suốt: trợ lý thư viện của một trường trung học

Thư viện số của một trường trung học có khoảng 6.000 đầu sách và tài liệu. Trường làm một trợ lý dùng Claude để:

- Tóm tắt một chương sách cho học sinh.
- Soạn 10 câu hỏi ôn tập từ một bài đọc, theo đúng mẫu của giáo viên.
- Giải thích từng bước một bài toán xác suất khó.

Các giáo viên thử và thắc mắc: "Hỏi hai lần ra hai bộ câu hỏi khác nhau, có phải lỗi không?", "Sách dài quá không đưa vào được, tăng temperature lên có được không?".

## Token: đơn vị model đọc và viết

Token là đơn vị nhỏ nhất mà model xử lý: có thể là một từ, một phần từ, một ký tự hay một byte. Số ký tự trong một token tuỳ model và ngôn ngữ. Theo glossary của Anthropic, ở các model cũ một token khoảng 3,5 ký tự tiếng Anh; từ Claude 4.7 trở đi model dùng tokenizer mới, cùng một đoạn chữ ra nhiều hơn khoảng 30% token. Muốn con số chính xác thì dùng endpoint đếm token với đúng model định dùng (bài 5.4).

Token quan trọng vì mọi thứ đều tính bằng nó: giới hạn context window, giới hạn đầu ra, giới hạn tốc độ và tiền.

## Sinh từng token, và vì sao có lúc bịa

Model ngôn ngữ như Claude được huấn luyện trước (**pretraining**) để dự đoán từ tiếp theo từ những gì đứng trước. Khi trả lời, model sinh từng token một (**next-token generation**), mỗi token chọn dựa trên mọi token trước đó.

Hai hệ quả:

- Câu chữ có thể khác nhau giữa các lần sinh: lần này lặp nguyên văn một câu trong prompt, lần sau diễn đạt lại. Đó là đặc tính của quá trình sinh, không phải lỗi dựng yêu cầu.
- Model sinh ra câu trôi chảy, hợp lý, kể cả khi không có thông tin đúng. Docs gọi đây là bịa (**hallucination**): chữ sai sự thật hay mâu thuẫn với ngữ cảnh. Docs khuyên cho Claude được nói "không biết", và với tài liệu dài thì yêu cầu trích nguyên văn trước khi trả lời.

> **Trong đề chọn gì**
>
> Câu luyện thi: đồng nghiệp hỏi vì sao có lúc câu trả lời lặp lại nguyên văn prompt, có lúc diễn đạt lại, và nghi là lỗi dựng yêu cầu. Chọn **giải thích LLM sinh đầu ra từng token, khác nhau về cách nội dung prompt xuất hiện là đặc tính của quá trình sinh, không phải lỗi**. Sai: do model khác nhau phục vụ yêu cầu; xác nhận là lỗi và đi tìm; do ứng dụng gửi hai prompt khác nhau.

## Context window: bộ nhớ làm việc

Context window là toàn bộ chữ model đọc được khi sinh câu trả lời, gồm cả chính câu trả lời. Glossary gọi nó là "bộ nhớ làm việc" của model, khác với kho dữ liệu lúc huấn luyện. Các model mới nhất có context window 1 triệu token. Context gồm system prompt, định nghĩa tool, toàn bộ hội thoại, tài liệu, ảnh và đầu ra.

Sách quá dài không vừa context thì phải giảm đầu vào: chia thành đoạn (**chunking**) và xử lý từng đoạn, hoặc tóm tắt trước (**summarization**). Temperature không liên quan gì tới chuyện này.

**Sơ đồ**
1. **Cuốn sách quá dài, không vừa context**
   ↓ _giảm đầu vào_
2. **Chia đoạn**: xử lý từng đoạn **|** **Tóm tắt trước**: đưa bản tóm tắt vào

> **Bẫy đề**
>
> Câu luyện thi: ứng dụng chạm giới hạn context khi xử lý bản ghi chăm sóc khách hàng dài, một bạn mới đề xuất tăng temperature. Đúng là **giải thích temperature điều khiển độ ngẫu nhiên khi lấy mẫu, không liên quan dung lượng context, rồi xử lý bằng tóm tắt hoặc chia đoạn**. Sai: tăng temperature rồi theo dõi; chỉnh temperature cùng `max_tokens`; bỏ hẳn system prompt cho rộng chỗ.

## Lấy mẫu và vì sao cùng prompt ra kết quả khác

Ở mỗi bước, model có một phân phối xác suất cho token tiếp theo và chọn một token theo phân phối đó, gọi là lấy mẫu (**sampling**). Vì vậy LLM không tất định (**non-deterministic**): cùng prompt có thể ra kết quả khác nhau.

**Sơ đồ**
1. **Đọc mọi token đã có**: prompt và phần vừa sinh
2. **Tính phân phối xác suất**: cho token tiếp theo
3. **Lấy mẫu**: chọn một token, thêm vào phần đã sinh
- ↻Vì bước lấy mẫu, cùng prompt có thể ra kết quả khác

Từng có ba tham số điều chỉnh việc lấy mẫu: `temperature` (cao thì đa dạng, thấp thì bám câu chữ khả dĩ nhất), `top_p`, `top_k`. Tình hình hiện nay đã khác:

- Glossary nói ngay cả khi `temperature` bằng 0, kết quả vẫn không hoàn toàn tất định.
- Model từ Claude 4.7 trở đi chỉ nhận giá trị mặc định của các tham số này.
- Phiên bản API `2026-10-21` bỏ hẳn cả ba: gửi lên là lỗi 400 trên mọi model. Docs nói không có thiết lập nào thay thế.

Vậy với model hiện nay, ứng dụng phải được thiết kế để chịu được sự khác biệt giữa các lần chạy: kiểm đầu ra theo schema hay luật, thử lại khi không đạt, viết test kiểm tính chất ("đủ 10 câu, mỗi câu có đáp án") thay vì so nguyên văn, và đừng dùng nguyên văn câu trả lời làm khoá cache.

**Sơ đồ**
1. **Claude soạn câu hỏi ôn tập**
   ↓ _kiểm tính chất, không so nguyên văn: đủ 10 câu, mỗi câu có đáp án_
2. **Đạt**: đưa cho giáo viên **|** **Không đạt**: thử lại

> **Trong đề chọn gì**
>
> Câu luyện thi: bên liên quan lo ứng dụng hỏng vì chạy cùng prompt hai lần ra kết quả hơi khác. Chọn **giải thích LLM mặc định không tất định do lấy mẫu, và nêu cách ứng dụng xử lý: kiểm đầu ra, thử lại, hoặc chỉnh temperature**. Sai: hứa sửa như một lỗi; đổ cho mạng chậm; đổ cho model bị cập nhật liên tục. Đáp án vẫn nhắc chỉnh temperature; với API và model hiện nay thì dựa vào kiểm đầu ra và thử lại.

## Thinking, effort và fast mode

Đề thi nhắc các tuỳ chọn của model (**model options**):

| Tuỳ chọn | Làm gì | Ghi chú |
| --- | --- | --- |
| **Adaptive thinking** | Claude tự quyết nghĩ bao nhiêu trước khi trả lời và giữa các lần gọi tool | Đã bật sẵn trên các model Claude 5 trở đi |
| **Extended thinking** | Cách cũ: bật thinking với một ngân sách token cố định (`budget_tokens`) | Chỉ còn trên một số model cũ; model Claude 5 trả lỗi 400 |
| **Effort** | Mức đầu tư suy luận: `low`, `medium`, `high`, `xhigh`, `max`, đặt trong `output_config.effort` | Mặc định `high`, riêng Opus 5.5 và Haiku 5.5 là `medium`. Là tín hiệu hành vi, không phải ngân sách cứng |
| **Fast mode** | `speed: "fast"`: tốc độ sinh token đầu ra cao hơn tới 2,5 lần, giá cao hơn | Có trên Opus 5.5 (bản thử nghiệm trên Opus 5, Opus 4.8). Nhanh ở tốc độ sinh, không nhanh hơn ở token đầu tiên |

Bài toán xác suất cần lập luận nhiều bước: để thinking làm việc và tăng effort nếu chưa đủ. Phần tóm tắt chương sách đơn giản thì effort thấp hơn cho rẻ và nhanh.

> **Trong đề chọn gì**
>
> Câu luyện thi: ứng dụng giúp nhà nghiên cứu phân tích ca bệnh nhiều bước, phải cân nhắc nhiều giả thuyết và cho thấy bước suy luận trung gian. Chọn **extended thinking để model suy luận qua từng bước trước khi đưa khuyến nghị**. Sai: chỉ zero-shot; fast mode (đổi chiều sâu lấy tốc độ); model nhỏ với context hẹp. Đề gọi là extended thinking; trên model Claude 5, thinking đã bật sẵn ở chế độ adaptive và bạn điều chỉnh độ sâu bằng effort.

## Zero-shot, one-shot, multi-shot

Prompt không có ví dụ là **zero-shot**, có một ví dụ là **single-shot** (one-shot), có vài ví dụ là **multi-shot** (few-shot). Docs nói ví dụ là một trong những cách chắc nhất để điều khiển định dạng, giọng và cấu trúc đầu ra, mà không cần huấn luyện lại model. Docs khuyên 3–5 ví dụ, và ví dụ phải:

- **Sát việc thật**: giống loại đầu vào sẽ gặp.
- **Đa dạng**: phủ cả trường hợp khó, đủ khác nhau để Claude không bắt chước những nét không cố ý.
- **Có cấu trúc**: bọc trong thẻ `<example>` (nhiều ví dụ thì trong `<examples>`) để Claude tách được ví dụ với chỉ dẫn.

Trong ví dụ, giáo viên muốn câu hỏi ôn tập đúng mẫu của mình, nên prompt kèm 3 câu hỏi mẫu thuộc ba mức khó khác nhau, mỗi câu trong một thẻ `<example>`.

> **Ý chính**
>
> Model sinh từng token bằng cách lấy mẫu, nên đầu ra khác nhau giữa các lần chạy và có thể trôi chảy mà sai: thiết kế ứng dụng để kiểm và thử lại. Context window là bộ nhớ làm việc, temperature không mở rộng nó. Muốn suy luận sâu thì dựa vào thinking và effort; muốn đúng khuôn thì cho 3–5 ví dụ đa dạng.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Glossary (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/glossary)
3. [Context windows (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
4. [Migrating to API version 2026-10-21 (Claude API Docs)](https://platform.claude.com/docs/en/api/migration-2026-10-21)
5. [Thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
6. [Extended thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
7. [Effort (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/effort)
8. [Fast mode (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
9. [Prompting best practices (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
10. [Reduce hallucinations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
