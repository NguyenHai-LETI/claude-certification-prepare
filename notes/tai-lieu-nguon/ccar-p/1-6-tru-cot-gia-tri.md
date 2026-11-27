---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-6-tru-cot-gia-tri
ngay_tai: 2026-11-27
tieu_de: Gắn giải pháp với các trụ cột giá trị kinh doanh
---

Domain 1: Solution Design & Architecture · Task 1.6

# Gắn giải pháp với các trụ cột giá trị kinh doanh

Năm trụ cột giá trị efficiency, productivity, transformation, solution cost và performance SLA khác nhau ra sao, và cách dùng chúng khi so các phương án.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Phân biệt efficiency, productivity và transformation qua các quan sát cụ thể
- Xếp đúng một vấn đề vào solution cost hay performance SLA
- Tính lợi ích thực sau khi trừ phần phải làm lại, và tính chi phí trên mỗi việc hoàn thành
- Biết đòn bẩy nào giảm chi phí mà không mất chất lượng, đòn bẩy nào giảm độ trễ
- So hai phương án bằng cách loại phương án vi phạm SLA trước, rồi mới cân phần còn lại

Sau khi triển khai, ai cũng muốn biết "AI có đáng tiền không". Câu trả lời không nằm ở một con số mà ở vài loại giá trị khác nhau, và mỗi loại đo một kiểu. Đề thi gọi chúng là các trụ cột giá trị kinh doanh (**business value pillars**).

Bài này giúp bạn trả lời: mỗi trụ cột nghĩa là gì, xếp một quan sát vào trụ cột nào, và dùng chúng để chọn phương án ra sao?

## Ví dụ xuyên suốt: đối soát hoá đơn ở chuỗi khách sạn

Phòng kế toán của một chuỗi khách sạn dùng Claude để đọc hoá đơn nhà cung cấp (thực phẩm, đồ giặt là, bảo trì) và đối chiếu với đơn đặt hàng. Sau một quý, báo cáo ghi năm quan sát:

1. Thời gian đối soát một hoá đơn giảm từ 12 phút xuống 2 phút.
2. Kế toán viên làm nhanh hơn nhưng số việc phòng kế toán hoàn thành mỗi tháng gần như không đổi.
3. Vị trí nhập liệu hoá đơn đã bỏ hẳn; hai nhân viên chuyển sang đàm phán giá với nhà cung cấp.
4. Chi phí API vượt 30% so với dự toán vì cơ chế thử lại gọi trùng nhiều lần.
5. Lúc chốt sổ cuối tháng, mỗi hoá đơn mất 8 giây mới có kết quả, trong khi cam kết là dưới 3 giây.

Ngoài ra, khoảng một phần năm hoá đơn bị kế toán viên sửa lại, mỗi lần mất thêm 4 phút.

## Năm trụ cột

Docs của Anthropic không định nghĩa năm trụ cột này. Cách phân biệt dưới đây là cách đề thi dùng khi chấm.

| Trụ cột | Đo cái gì | Quan sát trong ví dụ |
| --- | --- | --- |
| **Efficiency** | Cùng một việc, tốn ít thời gian hay công sức hơn | 1 |
| **Productivity** | Thời gian tiết kiệm được có biến thành nhiều kết quả có giá trị hơn không | 2 (chưa đạt) |
| **Transformation** | Vai trò, quy trình hay cách làm việc thay đổi tận gốc | 3 |
| **Solution cost** | Chi phí xây và vận hành giải pháp so với ngân sách | 4 |
| **Performance SLA** | Cam kết về hiệu năng (độ trễ, thời gian hoạt động) có giữ được không | 5 |

## Efficiency, productivity và transformation dễ lẫn nhất

Ba trụ cột đầu đều nghe như "làm tốt hơn", nên phải nhìn kỹ quan sát nói gì:

- **Efficiency** đo trên từng việc: một hoá đơn từ 12 phút xuống 2 phút. Câu kiểu "mỗi người xử lý gấp ba số đơn mỗi ngày" cũng được đề xếp vào efficiency, vì vẫn là cùng một việc làm nhanh hơn.
- **Productivity** hỏi tiếp: thời gian tiết kiệm được đi đâu? Nếu tổng kết quả của cả phòng không đổi (quan sát 2), thì efficiency đã có nhưng productivity **chưa hiện thực hoá**.
- **Transformation** là khi công việc đổi hình dạng: bỏ hẳn một vị trí, chuyển người sang việc khác có giá trị hơn (quan sát 3). Không chỉ nhanh hơn, mà khác đi.

Ba trụ cột này là ba câu hỏi nối tiếp nhau:

**Sơ đồ**
1. **Efficiency**: một hoá đơn từ 12 phút xuống 2 phút
   ↓ _thời gian tiết kiệm được đi đâu?_
2. **Productivity**: tổng kết quả cả phòng có tăng không? Ở đây chưa, số việc mỗi tháng gần như không đổi
   ↓ _công việc có đổi hình dạng không?_
3. **Transformation**: bỏ vị trí nhập liệu, hai nhân viên chuyển sang đàm phán giá

> **Bẫy đề**
>
> Câu luyện thi có đáp án gộp "quan sát 1 và 2 đều là efficiency gain", hoặc xếp "người làm nhanh hơn nhưng tổng kết quả không đổi" vào transformation. Đáp án đúng tách ra: quan sát 1 là efficiency, quan sát 2 cho thấy productivity chưa đạt. Cũng đừng xếp chi phí vượt dự toán vào SLA, hay độ trễ vượt cam kết vào solution cost.

## Tính lợi ích thực, không lấy con số thô

Con số "12 phút xuống 2 phút" là con số thô. Phần phải làm lại ăn bớt vào đó: một phần năm hoá đơn bị sửa, mỗi lần thêm 4 phút, tức trung bình thêm khoảng 0,8 phút mỗi hoá đơn. Thời gian sửa này là một khoản **efficiency loss**, trừ bớt vào lợi ích của quan sát 1.

Cũng vậy, chi phí tăng vì thử lại trùng là vấn đề solution cost do lỗi kỹ thuật, sửa được bằng cách sửa cơ chế thử lại, không phải do bản thân giải pháp đắt.

Muốn đo được những thứ này thì phải có tiêu chí cụ thể và đo được từ trước, như docs của Anthropic về tiêu chí thành công khuyên (bài 1.1).

## Đòn bẩy cho chi phí và SLA

Biết vấn đề thuộc trụ cột nào rồi, câu hỏi tiếp theo là kéo nó bằng cách nào.

**Solution cost: tính trên mỗi việc làm xong, không tính trên mỗi token.** Docs của Anthropic về tối ưu chi phí khuyên so model theo **chi phí trên mỗi việc hoàn thành** (**cost per completed task**), vì bạn trả tiền cho việc xong chứ không cho token. Model rẻ hơn mỗi token nhưng làm sai nhiều hơn thì phải trả thêm cho lần làm lại và cho người sửa. Docs còn khuyên so trên phần khó nhất của khối việc (khoảng một phần mười việc khó nhất), vì hoá đơn thường do những việc model rẻ làm hỏng quyết định.

Docs chia đòn bẩy làm hai nhóm, và khuyên làm nhóm đầu trước:

| Nhóm | Gồm | Ảnh hưởng chất lượng |
| --- | --- | --- |
| Tiết kiệm không mất gì | Bật prompt caching trước tiên, bỏ token thừa, rà lại prompt khi đổi model, đưa việc không gấp vào Batch API (giảm 50%), đặt hạn mức chi tiêu | Không |
| Đánh đổi | Đổi model, hạ effort, giới hạn độ dài đầu ra, ngân sách cho phiên, kiến trúc nhiều model | Có thể giảm |

Trong ví dụ: chi phí vượt 30% vì cơ chế thử lại gọi trùng, nên việc đầu tiên là sửa cơ chế đó. Sau đó bật prompt caching cho phần hướng dẫn đối soát và bảng giá nhà cung cấp, vì hai phần này giống hệt nhau ở mọi lần gọi. Còn việc đối soát lại toàn bộ hoá đơn mỗi đêm thì không ai chờ, nên đưa vào Batch API.

**Performance SLA: độ trễ có đòn bẩy riêng.** Docs về giảm độ trễ đo hai thứ: độ trễ tổng và thời gian tới chữ đầu tiên (**time to first token**). Các cách giảm: chọn model nhanh hơn (Haiku 5.5 là model nhanh nhất hiện nay), hạ effort, rút ngắn prompt và đầu ra, và streaming để người dùng thấy chữ sớm hơn. **Fast mode** trên Claude Opus 5.5 tăng tốc độ sinh chữ tới 2,5 lần nhưng giá token gấp đôi, và chỉ tăng tốc phần sinh chữ, không rút ngắn thời gian tới chữ đầu tiên.

> **Bẫy đề**
>
> Batch không phải giảm giá miễn phí cho mọi việc: nó đổi độ trễ lấy giá rẻ, nên không dùng cho việc có người đang chờ hay có SLA tính bằng giây. Fast mode cũng không phải lời giải cho lưu lượng lớn và nhạy cảm về chi phí, vì nó đắt gấp đôi.

## Dùng trụ cột để chọn phương án

Giả sử phòng kế toán so hai phương án cho năm sau:

|   | Phương án X | Phương án Y |
| --- | --- | --- |
| Chất lượng | Cao hơn một chút | Thấp hơn một chút |
| Chi phí mỗi hoá đơn | Gấp đôi Y | Bằng một nửa X |
| Thời gian trả kết quả | 4 giây | 2 giây |
| Cam kết SLA | Dưới 3 giây | Dưới 3 giây |

SLA là ràng buộc cứng. X không đạt thì bị loại trước, dù chất lượng cao hơn. Sau đó mới đánh giá Y theo efficiency và solution cost: tính chênh lệch chi phí cả năm, và xem phần chất lượng thấp hơn có thật sự ảnh hưởng tới công việc không.

**Sơ đồ**
1. **Phương án X**: 4 giây, chất lượng cao hơn, chi phí gấp đôi **|** **Phương án Y**: 2 giây, chất lượng thấp hơn một chút
   ↓ _lọc SLA trước: dưới 3 giây_
2. **X**: bị loại, dù chất lượng cao hơn **|** **Y**: đạt, giờ mới cân chi phí cả năm và phần chất lượng thấp hơn

> **Trong đề chọn gì**
>
> Đề so hai kiến trúc có chất lượng, chi phí, độ trễ và một SLA. Chọn đáp án loại phương án vi phạm SLA trước, rồi phân tích phương án còn lại theo chi phí và hiệu quả. Loại các đáp án: chọn chỉ vì rẻ hơn; chọn vì chất lượng cao rồi "tối ưu hạ tầng sau"; đề xuất kết hợp hai phương án mà không phân tích gì thêm.

> **Ý chính**
>
> Efficiency là từng việc nhanh hơn, productivity là tổng kết quả nhiều hơn, transformation là công việc đổi hình dạng. SLA là ràng buộc cứng, xét trước khi cân chi phí.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
4. [Reducing latency (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency)
5. [Fast mode (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
6. [Batch processing (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
