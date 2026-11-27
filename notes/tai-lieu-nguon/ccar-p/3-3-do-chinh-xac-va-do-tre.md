---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-3-do-chinh-xac-va-do-tre
ngay_tai: 2026-11-27
tieu_de: Đánh đổi độ chính xác và độ trễ
---

Domain 3: Integration · Task 3.3

# Đánh đổi độ chính xác và độ trễ

Mỗi đòn bẩy giảm độ trễ như model, effort, streaming, fast mode, độ sâu truy xuất, caching tác động vào đâu, tốn gì, và chứng minh cấu hình bằng số liệu.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Phân biệt độ trễ tổng, thời gian tới chữ đầu tiên và tốc độ sinh chữ
- Biết mỗi đòn bẩy giảm loại độ trễ nào và đổi lại mất gì
- Dùng effort để chỉnh độ chính xác và tốc độ trong cùng một model
- Bảo vệ một cấu hình bằng phép đo trên bộ test của chính mình

"Nhanh hơn" và "đúng hơn" thường kéo về hai phía. Người kiến trúc sư phải chọn một điểm cân bằng cho từng khối việc, và quan trọng hơn, phải giải thích được vì sao chọn điểm đó bằng số liệu, không bằng cảm giác.

Bài này giúp bạn trả lời: có những đòn bẩy nào để đổi giữa độ chính xác và độ trễ, mỗi cái tác động vào đâu, và chứng minh cấu hình của mình ra sao?

## Ví dụ xuyên suốt: chuỗi nhà hàng với hai khối việc

Một chuỗi nhà hàng dùng Claude cho hai việc:

1. **Trợ lý đặt bàn qua giọng nói** ở tổng đài: khách nói, hệ thống chuyển thành chữ, Claude trả lời, hệ thống đọc lên. Khách im lặng chờ quá hai giây là thấy khó chịu.
2. **Báo cáo phản hồi khách hằng tuần**: đọc vài nghìn đánh giá, gom vấn đề theo chi nhánh. Chạy ban đêm, không ai chờ, nhưng sai thì quản lý ra quyết định sai.

Trợ lý giọng nói hiện truy xuất 20 đoạn thực đơn và chính sách mỗi lượt, và đang chạy ở mức effort cao.

## Đo loại độ trễ nào

Docs của Anthropic về giảm độ trễ phân biệt hai thước đo: độ trễ tổng (thời gian xử lý prompt và sinh xong câu trả lời) và thời gian tới chữ đầu tiên (**time to first token**, TTFT). Trang fast mode thêm thước đo thứ ba: tốc độ sinh chữ, tính bằng số token đầu ra mỗi giây.

Ba thước đo nằm trên cùng một đường đi của một yêu cầu:

**Sơ đồ**
1. **Yêu cầu gửi đi**
   ↓ _thời gian tới chữ đầu tiên (TTFT): khoảng lặng khách cảm nhận_
2. **Chữ đầu tiên**
   ↓ _tốc độ sinh chữ: số token đầu ra mỗi giây_
3. **Chữ cuối cùng**

Với trợ lý giọng nói, thứ khách cảm nhận là khoảng lặng trước khi nghe được câu đầu tiên, nên TTFT quan trọng nhất. Với báo cáo ban đêm, độ trễ gần như không quan trọng.

## Đòn bẩy và cái giá

| Đòn bẩy | Tác động | Đổi lại |
| --- | --- | --- |
| Model nhanh hơn (Haiku 5.5 nhanh nhất) | Giảm mọi loại độ trễ | Có thể kém hơn ở việc khó |
| Hạ **effort** | Ít token hơn cho cả suy nghĩ, gọi tool và câu trả lời | Giảm phần nào năng lực |
| Rút ngắn prompt và đầu ra | Ít token phải xử lý | Phải giữ đủ thông tin cần |
| Truy xuất ít đoạn hơn | Prompt ngắn hơn | Có thể thiếu đoạn chứa câu trả lời |
| Prompt caching phần ổn định | Giảm TTFT, giảm chi phí | Không mất gì nếu phần đó thật sự ổn định |
| Streaming | Người dùng thấy chữ sớm hơn | Tổng thời gian sinh không đổi |
| Ẩn phần thinking (`display: "omitted"`) | Chữ đầu tiên của câu trả lời tới sớm hơn khi streaming | Không giảm chi phí, thinking vẫn chạy đủ |
| **Fast mode** (Claude Opus 5.5) | Tốc độ sinh chữ tới 2,5 lần | Giá token gấp đôi; không cải thiện TTFT |

### Effort: chỉnh trong cùng một model

Docs nói effort ảnh hưởng **mọi** token đầu ra: câu trả lời, lời gọi tool và tham số, và thinking nếu đang bật; vì vậy nó có tác dụng cả khi không bật thinking. Effort thấp thì ít lời gọi tool hơn, ít giải thích hơn. Các mức: `low`, `medium`, `high`, `xhigh`, `max`. Phần lớn model mặc định `high`; Opus 5.5 và Haiku 5.5 mặc định `medium`.

Docs gợi ý `low` cho việc đơn giản cần tốc độ và chi phí thấp nhất, như subagent; còn `max` thì trên đa số khối việc tăng chi phí đáng kể mà chất lượng chỉ nhích lên chút ít. Effort đặt ở `output_config.effort`. Lưu ý đổi effort giữa các yêu cầu làm mất prompt cache.

> **Bẫy đề**
>
> Ba hiểu lầm hay gặp: effort là một tín hiệu về hành vi chứ không phải giới hạn cứng (giới hạn cứng là `max_tokens`), nên `max` không bảo đảm "kỹ nhất, đủ nhất"; muốn câu trả lời ngắn thì dặn độ dài trong prompt, vì docs nói trên Opus 5 đổi effort không chắc làm câu trả lời ngắn đi; streaming chỉ làm người dùng thấy chữ sớm hơn, không làm tổng thời gian ngắn lại.

## Bắt đầu từ đâu

Docs về giảm độ trễ khuyên **làm prompt chạy tốt trước**, khi chưa có ràng buộc về model hay độ dài, rồi mới áp các cách giảm độ trễ. Docs về chọn model khuyên chỉnh effort trước khi đổi model.

Áp vào trợ lý giọng nói:

1. Bật cache cho system prompt và chính sách nhà hàng (giống nhau mọi lượt).
2. Xem lại dữ liệu cũ: câu trả lời gần như luôn nằm trong vài đoạn đầu, nên giảm từ 20 đoạn xuống số đoạn thực tế đã đủ.
3. Hạ effort, rồi thử Haiku 5.5; bật streaming để phần đọc bắt đầu sớm.

Báo cáo ban đêm thì ngược lại: giữ effort cao, chọn model mạnh, và đưa vào Batch API vì không ai chờ.

**Sơ đồ**
1. **Trợ lý giọng nói**: khách đang chờ, TTFT quan trọng nhất **|** **Báo cáo ban đêm**: không ai chờ, sai thì quyết định sai
   ↓ _chọn đòn bẩy_
2. **Cache phần ổn định, bớt đoạn truy xuất, hạ effort, thử Haiku 5.5, streaming** **|** **Effort cao, model mạnh, đưa vào Batch API**

> **Trong đề chọn gì**
>
> Câu luyện thi: trợ lý tương tác có ràng buộc chính là độ trễ mỗi lượt, chất lượng hiện đã đạt. Chọn: giảm độ sâu truy xuất xuống số đoạn mà dữ liệu cũ cho thấy đã đủ chứa câu trả lời, **và** cache phần system prompt ổn định. Loại: tắt prompt caching "cho context luôn mới"; tăng độ sâu truy xuất tới tối đa; chuyển mọi lượt sang model nặng nhất.

## Chứng minh cấu hình bằng số

Một cấu hình "nghe hợp lý" chưa đủ; phải đo trên bộ test của chính bạn.

- **Quét effort**: docs khuyên chạy lại một lượt quét các mức effort trên bộ đánh giá của mình mỗi khi đổi model, thay vì mang cấu hình cũ sang.
- **So bằng chi phí trên mỗi việc xong**, không bằng giá mỗi token. Docs về tối ưu chi phí còn nêu một cách: chạy mọi việc ở effort thấp, chỉ chạy lại các việc hỏng ở effort cao. Trong thử nghiệm của Anthropic, cách này rẻ hơn khoảng 40% so với chạy tất cả ở mức cao mà tỉ lệ đạt như nhau, với điều kiện có tín hiệu cho biết việc nào hỏng, và chấp nhận việc hỏng mất gấp đôi thời gian.
- **Ghi lại lý do**: cấu hình nào, đo trên bộ test nào, đạt độ chính xác bao nhiêu, độ trễ phân vị nào. Đó là thứ bạn đem ra khi phải giải thích với các bên liên quan (bài 6.2).

Hãy chọn theo thứ tự ưu tiên mà dự án đã ghi. Docs về tiêu chí thành công nói tiêu chí phải đúng mục đích của ứng dụng: độ chính xác trích dẫn có thể sống còn với ứng dụng y tế nhưng ít quan trọng hơn với chatbot thông thường. Nên khi yêu cầu đã ghi "chính xác trước, độ trễ sau", một cấu hình đo được là tụt độ chính xác thì không thắng chỉ vì nhanh hơn, dù nhanh hơn nhiều. Không có quy tắc chung kiểu "độ trễ quan trọng hơn".

Cách chạy lại theo tầng ở ý thứ hai trông như sau:

**Sơ đồ**
1. **Mọi việc chạy ở effort thấp**
   ↓ _có tín hiệu cho biết việc nào hỏng_
2. **Việc đạt**: xong luôn **|** **Việc hỏng**: chạy lại ở effort cao, mất gấp đôi thời gian

> **Ý chính**
>
> Xác định khách cảm nhận loại độ trễ nào, dùng đòn bẩy nhắm đúng loại đó, giữ chất lượng bằng caching và cắt phần thừa trước khi hạ năng lực, và chứng minh lựa chọn bằng phép đo trên bộ test của mình.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Reducing latency (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency)
3. [Effort (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/effort)
4. [Fast mode (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
5. [Building with thinking (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
6. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
7. [Prompt caching (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
8. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/define-success)
