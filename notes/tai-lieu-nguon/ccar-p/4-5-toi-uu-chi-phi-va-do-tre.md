---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-5-toi-uu-chi-phi-va-do-tre
ngay_tai: 2026-11-27
tieu_de: Tối ưu token, độ trễ và chi phí so với hiệu năng
---

Domain 4: Evaluation, Testing & Optimization · Task 4.5

# Tối ưu token, độ trễ và chi phí so với hiệu năng

Thứ tự tối ưu chi phí và độ trễ, gồm đo trước, lấy các khoản tiết kiệm không mất chất lượng, rồi mới đánh đổi effort và model, và đặt trần chi tiêu.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Đo chi phí trên mỗi việc xong từ các trường usage trước khi tối ưu
- Làm các khoản tiết kiệm không mất chất lượng trước, nhất là prompt caching
- Chọn thời gian sống của cache theo khoảng nghỉ giữa các yêu cầu
- Đánh đổi effort rồi model khi còn cần, và đặt trần chi tiêu cho agent

Tối ưu chi phí sai thứ tự là cách nhanh nhất để làm hỏng chất lượng: đổi sang model rẻ hơn khi chưa bật cache, cắt bớt tài liệu khi chưa biết tiền đang đi đâu. Docs của Anthropic có hẳn một thứ tự: đo, làm những gì không mất chất lượng, rồi mới đánh đổi.

Bài này giúp bạn trả lời: muốn giảm token, độ trễ và chi phí mà giữ chất lượng, làm gì trước, làm gì sau?

## Ví dụ xuyên suốt: trung tâm bảo hành điện thoại

Một chuỗi trung tâm bảo hành điện thoại có hai khối việc dùng Claude:

1. **Agent tiếp nhận bảo hành**: chat nhiều lượt với khách, tra lịch sử máy, đối chiếu điều kiện bảo hành (một bộ chính sách 9.000 token), tạo phiếu. Mỗi phiên trung bình 15 lượt, khách hay để đó vài phút đi tìm số IMEI rồi quay lại.
2. **Chấm lại phiếu mỗi đêm**: đọc 50.000 phiếu đã đóng trong ngày, gắn nhãn nguyên nhân hỏng để báo cáo cho nhà sản xuất.

Chi phí tháng vượt dự toán 35%, và chủ đầu tư yêu cầu chất lượng không được giảm.

Thứ tự làm của cả bài:

**Sơ đồ**
1. **Bước 1, đo**: chi phí trên mỗi việc xong, tỉ lệ đọc cache, phần đuôi khó nhất
   ↓ _biết tiền đang đi đâu_
2. **Bước 2, không mất chất lượng**: sửa thứ phá cache, bật cache, dọn token thừa, đưa vào batch
   ↓ _vẫn chưa đủ thì mới đánh đổi_
3. **Bước 3, đánh đổi**: hạ effort, rồi đổi model, chạy thấp làm lại phần hỏng, định tuyến
   ↓ _chốt chặn_
4. **Bước 4, đặt trần**: max_tokens, ngân sách cho phiên, hạn mức workspace

## Bước 1: đo trước khi sửa

- **Chi phí trên mỗi việc xong**, không phải trên mỗi token. Docs về tối ưu chi phí khuyên tính từng loại token trong trường `usage` theo đúng giá của nó (đầu vào thường, ghi cache 5 phút, ghi cache 1 giờ, đọc cache, đầu ra), cộng lại cho mọi lần gọi của cả việc.
- **Tỉ lệ đọc từ cache.** Docs nói trong các vòng lặp agent, phần lớn token đầu vào nên là token đọc từ cache: đo nội bộ của Anthropic cho thấy trung vị khoảng 84%; dưới khoảng 80% thì nên tìm xem cái gì đang làm hỏng cache.
- **Phần đuôi khó nhất.** Docs khuyên so trên khoảng một phần mười việc khó nhất, vì hoá đơn thường do những việc bị làm hỏng rồi làm lại quyết định.

Trong ví dụ, đo ra: agent tiếp nhận chỉ đọc được 30% đầu vào từ cache, vì system prompt có dòng "Thời gian hiện tại: ..." ở đầu, đổi theo từng giây.

**Sơ đồ**
1. **Dòng thời gian ở đầu system prompt** **|** **Dòng thời gian chuyển xuống cuối**
   ↓ _mỗi yêu cầu gửi đi_
2. **Phần đầu prompt đổi theo từng giây, cache không trúng** **|** **Phần đầu giống hệt, định nghĩa tool, system prompt và bộ chính sách đọc từ cache**

## Bước 2: các khoản không mất chất lượng

Docs chia đòn bẩy làm hai nhóm. Nhóm "miễn phí", không đụng tới chất lượng: **bật prompt caching trước mọi đòn bẩy khác**, dọn token thừa, rà lại prompt mỗi khi đổi model, đưa việc không ai chờ sang Batch API (giảm 50%), và đặt hạn mức chi tiêu làm chốt chặn cuối.

| Việc | Trong ví dụ |
| --- | --- |
| Sửa thứ phá cache, bật cache cho phần ổn định | Chuyển dòng thời gian xuống cuối; cache định nghĩa tool, system prompt và bộ chính sách 9.000 token |
| Dọn token thừa | Cắt kết quả tra lịch sử máy chỉ còn các trường cần; với nhiều tool thì dùng tool search |
| Việc không ai chờ đưa vào batch | 50.000 phiếu mỗi đêm vào Message Batches: nửa giá, đa số lô xong dưới 1 giờ, tối đa 24 giờ |

**Chọn thời gian sống của cache theo khoảng nghỉ.** Cache mặc định sống 5 phút, làm mới mỗi lần dùng; tuỳ chọn 1 giờ có giá ghi gấp đôi giá đầu vào (so với 1,25 lần của loại 5 phút). Docs đưa số đo: khi cứ 10 lượt có 1 lượt đến sau một khoảng nghỉ dài, giữ mặc định 5 phút tốn hơn 54%; khi 20 lượt mới có 1 lượt như vậy, hai lựa chọn tốn gần bằng nhau. Khách bảo hành hay nghỉ vài phút giữa chừng, nên cân nhắc cache 1 giờ; job chạy liên tục với khoảng cách vài giây thì giữ 5 phút.

**Dọn context với hội thoại dài** (context editing, compaction) giúp phiên dài không tràn context, nhưng docs lưu ý chúng không tự nhiên là "miễn phí": xoá bớt nội dung có thể làm hỏng cache. Đo chi phí trên mỗi việc khi bật và khi tắt rồi mới giữ.

> **Trong đề chọn gì**
>
> Câu luyện thi: trợ lý dự báo doanh thu vượt chi phí 38%, ba nguồn tốn là phần mở đầu chính sách 6.000 token lặp ở mọi lần gọi, các đoạn dữ liệu bán hàng truy xuất mỗi lần, và model đầu bảng; yêu cầu độ chính xác không đổi. Hai việc làm trước: **bật prompt caching cho phần mở đầu tĩnh**, và **cache những đoạn truy xuất được dùng lại nhiều lần trong ngày**. Các đáp án sai đều giảm nội dung hay năng lực: truy xuất ít đoạn hơn, cắt bớt phần mở đầu, đổi sang model nhỏ hơn.

## Bước 3: đánh đổi khi vẫn cần

Nhóm thứ hai có thể ảnh hưởng chất lượng: đổi model, hạ effort, giới hạn độ dài đầu ra, ngân sách cho phiên, kiến trúc nhiều model. Thứ tự hợp lý:

1. **Hạ effort trước.** Docs về effort nói mức `low` hợp cho việc đơn giản và subagent; effort ảnh hưởng mọi token đầu ra, kể cả số lời gọi tool.
2. **Rồi mới đổi model**, so bằng chi phí trên mỗi việc xong trên bộ test của mình.
3. **Chạy thấp, làm lại phần hỏng ở mức cao.** Docs mô tả cách chạy mọi việc ở effort thấp và chỉ chạy lại việc hỏng ở effort cao; trong thử nghiệm của Anthropic rẻ hơn khoảng 40% so với chạy tất cả ở mức cao mà tỉ lệ đạt như nhau. Điều kiện: phải có tín hiệu cho biết việc nào hỏng (như bộ test tự động), và việc hỏng mất gấp đôi thời gian.
4. **Định tuyến**: câu thường cho model nhẹ, câu khó cho model nặng, giảm cả chi phí lẫn độ trễ cho phần lớn lưu lượng.

> **Trong đề chọn gì**
>
> Câu luyện thi: cần giảm cả chi phí mỗi truy vấn lẫn độ trễ phân vị 95 của một pipeline khối lượng lớn mà không giảm chất lượng việc chính. Hai đòn bẩy đánh trúng cả hai: **prompt caching cho phần system prompt tĩnh**, và **định tuyến câu đơn giản sang model nhỏ, nhanh**, giữ model đầy đủ cho ca phức tạp. Các đáp án sai: tăng `max_tokens`, truy xuất cả kho vào context, thêm ví dụ few-shot vào mọi yêu cầu.

## Bước 4: đặt trần chi tiêu

- **`max_tokens` là trần cho một câu trả lời**, model không nhìn thấy nó. Docs nói hạ nó xuống không làm model tiết kiệm hơn, chỉ làm câu trả lời bị cắt giữa chừng; với việc agent docs gợi ý đặt khoảng 64.000. Đặt trần cao không làm mọi yêu cầu tốn hơn, vì đó chỉ là mức tối đa.
- **Ngân sách cho phiên** trên Claude Managed Agents là điểm dừng cứng: chạm mức thì phiên tạm dừng. Agent SDK có `max_budget_usd`.
- **Hạn mức chi tiêu của workspace** là chốt chặn cuối cùng.

> **Ý chính**
>
> Đo chi phí trên mỗi việc xong và tỉ lệ đọc cache trước. Sửa thứ phá cache, bật caching, dọn token thừa, đưa việc không ai chờ vào batch. Chỉ khi vẫn cần mới hạ effort rồi đổi model, và luôn có trần chi tiêu.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 4](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
3. [Prompt caching (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
4. [Batch processing (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
5. [Effort (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/effort)
6. [Manage tool context (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
