---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-3-ab-test-va-cai-tien
ngay_tai: 2026-11-27
tieu_de: A/B test và cải tiến lặp
---

Domain 4: Evaluation, Testing & Optimization · Task 4.3

# A/B test và cải tiến lặp

So prompt hay model mới với bản đang chạy, từ giả thuyết, cỡ mẫu, so offline rồi thử thật, đọc kết quả theo nhóm, tới đưa lên và quay lui theo phiên bản.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Làm phần thiết kế thí nghiệm trước khi chạy, gồm giả thuyết, chỉ số chính, hiệu ứng tối thiểu và cỡ mẫu
- So hai phiên bản công bằng, giữ cố định mọi thứ trừ một biến, đo nhiều lần
- Biết khi nào so offline là đủ, khi nào cần thử với lưu lượng thật
- Đọc kết quả theo từng nhóm, và đưa lên hay quay lui bằng phiên bản đã ghim

"Prompt mới nghe hay hơn" không phải là bằng chứng. Một thay đổi chỉ được tính là cải tiến khi nó thắng bản đang chạy trên cùng một chỉ số đã chốt từ trước, với đủ dữ liệu để không phải là may mắn.

Bài này giúp bạn trả lời: thiết kế và chạy một phép so sánh A/B thế nào, đọc kết quả ra sao, và đưa thay đổi lên production an toàn?

## Ví dụ xuyên suốt: trợ lý đổi vé của một hãng xe khách

Một hãng xe khách liên tỉnh có trợ lý giúp khách đổi giờ, đổi chuyến. Đội sản phẩm viết prompt B: hỏi gọn hơn, gợi ý chuyến thay thế ngay từ câu đầu. Họ muốn biết B có làm nhiều khách đổi vé thành công mà không cần gọi tổng đài hơn prompt A đang chạy không.

## Thiết kế trước khi chạy

1. **Đã nói rõ đang kiểm định điều gì chưa?** → Viết giả thuyết và một chỉ số chính, ví dụ tỉ lệ đổi vé xong không cần tổng đài
2. **Đã biết cần phát hiện chênh lệch tối thiểu bao nhiêu và cần bao nhiêu mẫu chưa?** → Chốt hiệu ứng tối thiểu và tính cỡ mẫu đủ mạnh
3. **Đã có số liệu của bản đang chạy chưa?** → Đo baseline của A trên cùng chỉ số
- **Còn lại** → Rồi mới chia ngẫu nhiên và chạy

Bài viết về cách tiếp cận thống kê của Anthropic gọi bước tính cỡ mẫu là **phân tích công suất** (**power analysis**): liên hệ số quan sát, xác suất phát hiện, tỉ lệ dương tính giả và độ lớn hiệu ứng. Bài viết nói một bài đánh giá có quá ít câu hỏi có thể không đáng chạy để so hai model, vì nó không phân biệt nổi chúng.

> **Trong đề chọn gì**
>
> Đề hỏi hai bước phải xong **trước khi** chạy thí nghiệm có chia ngẫu nhiên: chọn **định nghĩa giả thuyết và chỉ số thành công chính**, và **xác định hiệu ứng tối thiểu cần phát hiện cùng cỡ mẫu**. Phân tích kết quả, quyết định đưa lên hay bỏ, viết khuyến nghị đều cần có kết quả nên đến sau.

## So công bằng

- **Đổi một biến mỗi lần.** Prompt B mà đổi luôn cả model thì không biết cải thiện đến từ đâu.
- **Ghim mọi thứ khác**: cùng bộ dữ liệu, cùng grader, cùng model, cùng mức effort, và phiên bản prompt ghi rõ.
- **Chạy nhiều lần.** Một lần chạy có tính ngẫu nhiên. Bài viết thống kê khuyên báo sai số chuẩn và khoảng tin cậy 95% (trung bình cộng trừ 1,96 lần sai số chuẩn) cùng mỗi điểm số.
- **So theo cặp.** Khi hai phiên bản chạy trên cùng một bộ câu hỏi, so chênh lệch **từng câu** (paired differences) thay vì so hai trung bình độc lập; bài viết gọi đây là cách giảm phương sai gần như miễn phí, vì loại được độ khó riêng của từng câu.

## Offline trước, thử thật sau

Docs của Anthropic về tiêu chí thành công gợi ý đặt mục tiêu so với baseline, ví dụ cải thiện 5% so với bản hiện tại trên một tập kiểm giữ riêng.

Chỉnh prompt nhiều vòng trên cùng một tập có thể cho ra bản thắng chỉ vừa với đúng những câu nó đã thấy. Trước khi chốt, đo lại trên tập giữ riêng (**held-out**) mà quá trình chỉnh chưa từng đọc. Docs của Anthropic về tối ưu chi phí nói cùng ý khi tìm cấu hình: giữ riêng một phần không cho vòng tìm đọc, vì bước xác nhận trên phần đó bắt được những thay đổi chỉ vừa với các task đã thấy.

| Cách | Mạnh ở | Yếu ở |
| --- | --- | --- |
| So offline trên tập có nhãn | Nhanh, rẻ, lặp lại được, chạy trước khi khách thấy | Chỉ đo được những gì tập nhãn có |
| A/B với lưu lượng thật | Đo kết quả thật của người dùng | Chậm; bài viết về đánh giá agent nói cần đủ lưu lượng, có khi mất nhiều ngày tới vài tuần mới kết luận được |
| Giám sát sau triển khai | Bắt lỗi trên toàn bộ lưu lượng | Phát hiện khi khách đã gặp lỗi |

Thứ tự hợp lý: so offline để loại sớm phiên bản kém, rồi mới A/B với một phần lưu lượng thật cho phiên bản đã qua vòng offline.

**Sơ đồ**
1. **Prompt B**: đổi một biến, ghim mọi thứ khác
   ↓ _so offline trên tập có nhãn, kém thì loại ngay_
2. **A/B với một phần lưu lượng thật**: đo tỉ lệ đổi vé xong không cần tổng đài
   ↓ _thắng trên chỉ số chính đã chốt_
3. **Đưa lên, giám sát trên toàn bộ lưu lượng**

## Đọc kết quả theo từng nhóm

Tỉ lệ chung tăng chưa chắc an toàn. Có thể prompt B tốt hơn với khách đổi giờ cùng ngày nhưng tệ hơn với khách đổi chuyến cho cả nhóm 5 người. Chia kết quả theo các nhóm quan trọng (loại yêu cầu, tuyến, kênh) trước khi quyết định.

**Sơ đồ**
1. **Tỉ lệ chung của prompt B tăng**
   ↓ _chia theo loại yêu cầu_
2. **Khách đổi giờ cùng ngày**: B tốt hơn **|** **Khách đổi chuyến cho cả nhóm 5 người**: B có thể tệ hơn

> **Bẫy đề**
>
> Tỉ lệ khách chấp nhận gợi ý cao không chứng minh gợi ý đúng. Câu luyện thi có tình huống tỉ lệ chấp nhận 89% nhưng chuyên viên vẫn phải sửa lại sau khi xét những tiêu chí trợ lý bỏ sót. Chỉ số chính của thí nghiệm phải đo kết quả thật (đổi vé xong, không phải gọi lại), không đo phản ứng bề mặt.

## Đưa lên và quay lui theo phiên bản

Cookbook của Anthropic về quản lý phiên bản prompt trên Claude Managed Agents mô tả một cách làm áp dụng được cho mọi hệ thống:

- Mỗi lần cập nhật agent tạo ra một **phiên bản bất biến** mới.
- Gọi agent bằng mã trần thì luôn nhận phiên bản mới nhất. Rủi ro: ai đó cập nhật là production đổi theo ngay ở phiên kế tiếp. Production nên **ghim** một phiên bản cụ thể.
- **Đưa lên** là đổi số phiên bản mà production truyền vào, qua quy trình duyệt như mọi thay đổi cấu hình. Có thể cho một phần nhỏ lưu lượng dùng phiên bản mới trước (canary).
- **Quay lui** không cần triển khai lại: chỉ việc truyền lại số phiên bản cũ.

Cookbook cũng lưu ý không có bước duyệt tích hợp sẵn khi cập nhật agent; số phiên bản được ghim chính là cửa kiểm soát.

**Sơ đồ**
1. **Production ghim phiên bản 7**
   ↓ _đổi số phiên bản truyền vào, qua quy trình duyệt_
2. **Một phần nhỏ lưu lượng dùng phiên bản 8**: canary
   ↓ _ổn thì mở rộng_
3. **Production ghim phiên bản 8**

> **Ý chính**
>
> Chốt giả thuyết, chỉ số chính, hiệu ứng tối thiểu và cỡ mẫu trước khi chạy. Đổi một biến, ghim mọi thứ khác, chạy nhiều lần, so offline trước rồi mới thử thật, đọc theo từng nhóm, và đưa lên hay quay lui bằng phiên bản đã ghim.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 4](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [A statistical approach to model evaluations (Anthropic)](https://www.anthropic.com/research/statistical-approach-to-model-evals)
4. [Demystifying evals for AI agents (Anthropic)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
5. [Prompt versioning and rollback (Claude Cookbook)](https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback)
6. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
