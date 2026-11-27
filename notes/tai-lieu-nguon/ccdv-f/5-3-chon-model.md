---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/5-3-chon-model
ngay_tai: 2026-11-27
tieu_de: Chọn model Claude - năng lực, độ trễ, chi phí và thay đổi giữa các bản
---

Domain 5: Model Selection and Optimization · Task 5.3

# Chọn model Claude - năng lực, độ trễ, chi phí và thay đổi giữa các bản

Opus, Sonnet, Haiku và Fable hợp với việc gì, cân chất lượng với độ trễ và chi phí cùng lúc, và nâng cấp model an toàn khi bản mới đổi hành vi.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Ghép một việc với dòng model hợp nhất dựa trên năng lực, độ trễ và giá
- Chọn model đáp ứng cùng lúc mục tiêu chất lượng, độ trễ, chi phí - và hỏi lại khi chưa có mục tiêu
- Biết hai cách chọn model ban đầu và khi nào chỉnh effort thay vì đổi model
- Nhận ra các thay đổi phá vỡ khi lên model mới và nâng cấp theo từng luồng có đường lùi

"Dùng model nào cho kết quả tốt nhất?" là câu hỏi chưa trả lời được, vì "tốt nhất" chưa phải một mục tiêu. Model mạnh nhất chậm và đắt nhất; model rẻ nhất có thể đã đủ tốt cho việc đơn giản. Và khi một bản mới ra, đổi tên model trong cấu hình chưa bao giờ là toàn bộ công việc.

Bài này giúp bạn trả lời: chọn model nào cho việc nào, cân các đánh đổi ra sao, và nâng cấp model thế nào để không làm vỡ hệ thống?

## Ví dụ xuyên suốt: ba việc của một đài phát thanh tỉnh

Một đài phát thanh tỉnh dùng Claude cho ba việc:

1. Phân loại khoảng 20.000 tin nhắn thính giả mỗi ngày (góp ý, yêu cầu bài hát, báo tin giao thông). Cần nhanh và rẻ.
2. Viết bản tin tổng hợp lúc 6 giờ sáng từ các tin nhắn và nguồn tin đêm qua.
3. Trợ lý cho phóng viên làm phóng sự điều tra: đọc hàng trăm trang hồ sơ, lần ra mâu thuẫn, chạy hàng giờ.

Hệ thống đang chạy Claude Opus 5 cho việc số 3, và đội muốn lên Opus 5.5.

## Bốn dòng model và việc của chúng

Bảng so sánh model của Anthropic mô tả bốn model mới nhất:

| Model | Hợp với | Độ trễ | Giá vào / ra (mỗi triệu token) |
| --- | --- | --- | --- |
| Claude Fable 5.1 | Suy luận khó, việc agent rất dài | Chậm nhất | $10 / $50 |
| Claude Opus 5.5 | Lập trình agent chạy lâu, việc tri thức phức tạp | Vừa | $4 / $20 |
| Claude Sonnet 5.5 | Kết hợp tốt nhất giữa tốc độ và trí tuệ cho việc hằng ngày | Nhanh | $2 / $10 |
| Claude Haiku 5.5 | Việc khối lượng lớn, cần độ trễ thấp: phân loại, trích xuất, định tuyến | Nhanh nhất | Từ $0,10 / $0,50 |

Cả bốn đều có context window 1 triệu token, đầu ra tối đa 128 nghìn token và thinking ở chế độ adaptive. Trong ví dụ: việc 1 hợp Haiku, việc 2 hợp Sonnet, việc 3 hợp Opus hoặc Fable.

**Sơ đồ**
1. **Phân loại 20.000 tin nhắn**: cần nhanh và rẻ **|** **Bản tin 6 giờ sáng**: việc hằng ngày **|** **Trợ lý điều tra**: đọc hàng trăm trang, chạy hàng giờ
   ↓ _chọn_
2. **Haiku 5.5** **|** **Sonnet 5.5** **|** **Opus 5.5 hoặc Fable 5.1**

> **Trong đề chọn gì**
>
> Câu luyện thi: chọn model cho việc phân loại khối lượng lớn, mỗi lần phân loại đơn giản, yêu cầu độ trễ chặt và chi phí mỗi yêu cầu quan trọng. Chọn **model nhỏ, nhanh, vì việc đơn giản và ưu tiên độ trễ, chi phí ở quy mô lớn**. Sai: model tầm trung làm mặc định; model lớn nhất cho chất lượng tối đa; chạy nối tiếp nhiều model rồi gộp kết quả.

## Cân ba chiều cùng lúc

Chất lượng, độ trễ và chi phí kéo nhau: tăng một chiều thường làm hai chiều kia thay đổi. Model đúng là model đáp ứng cả ba yêu cầu cùng lúc, không phải model thắng ở một chiều rồi mới xét các chiều sau. Muốn vậy thì phải có mục tiêu cho cả ba trước.

> **Bẫy đề**
>
> Hai câu luyện thi cùng ý. Đội sản phẩm có yêu cầu chức năng nhưng chưa có mục tiêu hiệu năng, chi phí, chất lượng, và bảo "dùng model nào cho kết quả tốt nhất": đúng là **đề nghị đội sản phẩm nêu mục tiêu chất lượng, độ trễ, chi phí rồi chọn model có đánh đổi hợp nhất**, không phải chọn model lớn nhất, chọn tầm trung cho nhanh, hay chạy benchmark chung. Hỏi model đúng là model thế nào: **model đáp ứng cùng lúc yêu cầu chất lượng, độ trễ, chi phí, hiểu rằng cải thiện chiều này ảnh hưởng chiều kia**, không phải xếp ưu tiên tuần tự từng chiều.

## Bắt đầu từ đâu, và effort trước khi đổi model

Trang hướng dẫn chọn model nêu hai cách bắt đầu:

- **Ưu tiên hiệu quả**: bắt đầu với Haiku 5.5, test kỹ, chỉ lên model mạnh hơn khi có chỗ thiếu năng lực cụ thể. Hợp với nguyên mẫu, việc cần độ trễ thấp, nhạy cảm chi phí, khối lượng lớn mà đơn giản.
- **Ưu tiên năng lực**: bắt đầu với Opus 5.5, tối ưu prompt, rồi giảm effort hoặc chuyển xuống model rẻ hơn khi quy trình đã ổn. Nếu ở effort `xhigh` hay `max` vẫn chưa đủ thì lên Fable 5.1.

**Sơ đồ**
1. **Ưu tiên hiệu quả**: bắt đầu với Haiku 5.5 **|** **Ưu tiên năng lực**: bắt đầu với Opus 5.5
   ↓ _test trên việc thật_
2. **Thiếu năng lực cụ thể thì lên model mạnh hơn** **|** **Quy trình ổn rồi thì giảm effort hoặc xuống model rẻ hơn**

Docs nhấn mạnh: chỉnh effort thường là đòn bẩy tốt hơn đổi model. Effort (`low` tới `max`) đổi trí tuệ lấy độ trễ và chi phí ngay trong một model. Mặc định là `high`, riêng Opus 5.5 và Haiku 5.5 là `medium`. Trước khi chốt, dựng bộ test riêng cho việc của bạn, chạy với prompt và dữ liệu thật, rồi so độ chính xác, chất lượng, cách xử lý trường hợp khó, và chi phí.

Docs cũng nêu cách kết hợp model: một model rẻ làm phần lớn việc và hỏi một model mạnh ở các quyết định khó, hoặc một orchestrator mạnh giao phần việc khối lượng lớn cho các worker rẻ hơn.

## Thay đổi phá vỡ giữa các bản model

Đề thi nhắc các thay đổi hành vi phá vỡ giữa các bản phát hành (**breaking behavior changes across model releases**). Lên Opus 5.5 là một ví dụ rõ. Theo hướng dẫn chuyển đổi, một yêu cầu tới `claude-opus-5-5` sẽ bị lỗi 400 nếu:

| Thứ cũ còn trong code | Trên Opus 5.5 | Thay bằng |
| --- | --- | --- |
| `thinking: {"type": "disabled"}` hoặc ngân sách `budget_tokens` | Bị từ chối, thinking luôn bật | Chỉnh effort |
| `tool_choice` loại `any` hoặc `tool` | Bị từ chối | `auto` cùng strict tool use hoặc structured outputs |
| Kết thúc `messages` bằng lượt assistant điền sẵn (prefill) | Bị từ chối | Structured outputs hoặc chỉ dẫn trong system prompt |
| `temperature`, `top_p`, `top_k` | Bỏ | Dùng prompt để định hướng |

Ngoài lỗi 400 còn có thay đổi lặng lẽ hơn: effort mặc định của Opus 5.5 là `medium`, trong khi Opus 5 là `high`. Docs khuyên đặt effort rõ ràng và đo lại chi phí, độ trễ. Phần chữ giữa các lần gọi tool giờ trả về trong khối thinking, nên giao diện nào hiển thị phần đó phải đổi cách đọc.

Trong ví dụ, trợ lý điều tra đang dùng `tool_choice: {"type": "any"}` để ép gọi tool tìm hồ sơ và prefill `{` để ép JSON. Cả hai phải đổi trước khi lên Opus 5.5.

## Nâng cấp an toàn: sửa, đo lại, bật dần

Kể cả khi model mới tốt hơn trên eval, nó có thể viết định dạng khác, làm vỡ code phía sau. Cách an toàn:

1. Sửa prompt và cấu hình cho model mới (siết định dạng đầu ra, bỏ tham số bị từ chối).
2. Chạy lại eval, kiểm đầu ra theo đúng schema mà lớp đọc kết quả phía sau mong đợi.
3. Bật model mới qua feature flag, theo từng luồng, với khả năng lùi riêng từng luồng.

1. **Model mới bị lỗi 400 với yêu cầu hiện tại?** → Sửa theo hướng dẫn chuyển đổi trước
2. **Đầu ra đổi định dạng làm vỡ code phía sau?** → Siết định dạng trong prompt hoặc dùng structured outputs, chạy lại eval
3. **Eval đạt trên mọi luồng?** → Bật qua feature flag từng luồng, giữ đường lùi
- **Còn lại** → Đặt effort rõ ràng, đo lại chi phí và độ trễ

> **Bẫy đề**
>
> Hai câu luyện thi về nâng cấp. Model mới tốt hơn 8% trên việc chính nhưng đổi định dạng ở hai prompt trích xuất mà code phía sau đọc bằng regex: đúng là **siết định dạng trong prompt, chạy lại eval theo schema mà lớp đọc kết quả cần, rồi bật bằng feature flag có thể lùi theo từng luồng**; sai là đổi model rồi chờ lỗi, viết lại parser cho dễ dãi, hay giữ model cũ mãi. Model mới đổi định dạng với system prompt nhiều phần, gây 3% đầu ra hỏng: đúng là **chỉnh system prompt theo cách model mới cần, đánh giá lại, chỉ nâng cấp khi hết đầu ra hỏng mà vẫn giữ phần cải thiện**; sai là nâng cấp ngay vì lợi nhiều hơn hại, hay chỉ thêm bước kiểm phía sau.

> **Ý chính**
>
> Haiku cho việc nhiều và đơn giản, Sonnet cho việc hằng ngày, Opus và Fable cho việc khó và dài. Chọn theo cả ba chiều chất lượng, độ trễ, chi phí, và cần mục tiêu trước khi chọn. Thử chỉnh effort trước khi đổi model. Lên model mới thì đọc hướng dẫn chuyển đổi, chạy lại eval, bật dần có đường lùi.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Choosing the right model (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
3. [Models overview (Claude API Docs)](https://platform.claude.com/docs/en/models/overview)
4. [Effort (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/effort)
5. [Migrating to Claude Opus 5.5 (Claude API Docs)](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide)
6. [Thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
