---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-2-trinh-bay-quyet-dinh
ngay_tai: 2026-11-27
tieu_de: Trình bày quyết định kiến trúc và các đánh đổi
---

Domain 6: Stakeholder Communication & Lifecycle Management · Task 6.2

# Trình bày quyết định kiến trúc và các đánh đổi

Trình bày quyết định kiến trúc cho nhiều người nghe, gồm quyết định đặt trước, chi phí mỗi việc xong, phương án đã loại, rủi ro còn lại và lúc xem lại.

- 14 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Sắp bài trình bày cho người nghe hỗn hợp, quyết định trước, phần riêng cho từng người sau
- Giải thích chi phí bằng chi phí trên mỗi việc xong và cái giá của từng lớp phức tạp
- Chứng minh lựa chọn bằng các phương án đã cân nhắc, tiêu chí và số đo trên dữ liệu của mình
- Trình bày rủi ro còn lại cho người duyệt bảo mật, tuân thủ một cách rõ ràng và có giới hạn
- Ghi người phụ trách quyết định và những lúc phải xem lại

Một quyết định kiến trúc đúng vẫn có thể bị bác chỉ vì trình bày sai cách: giám đốc tài chính phải ngồi nghe hết sơ đồ thành phần mới biết dự án tốn bao nhiêu, còn người phụ trách bảo mật không thấy rủi ro nào đã được chặn.

Bài này giúp bạn trả lời: trình bày một quyết định kiến trúc và các đánh đổi (**trade-offs**) của nó thế nào để mỗi người nghe quyết được phần của mình?

## Ví dụ xuyên suốt: công ty xây dựng đọc hồ sơ mời thầu

Một công ty xây dựng nhận khoảng 60 bộ hồ sơ mời thầu mỗi tháng, mỗi bộ 300–800 trang. Kỹ sư dự toán mất trung bình hai ngày để đọc một bộ, và đã có lần bỏ sót một điều khoản phạt chậm tiến độ. Nhóm của bạn xây một trợ lý đọc hồ sơ: trích yêu cầu kỹ thuật, hạn nộp, điều khoản phạt, rồi đối chiếu với hồ sơ năng lực của công ty.

Nhóm đã thử ba phương án:

| Phương án | Cách chạy |
| --- | --- |
| A. Một lần gọi | Đưa cả bộ hồ sơ vào Claude Opus 5.5 trong một yêu cầu |
| B. Workflow cố định | Code tách hồ sơ theo chương; Claude Sonnet 5.5 trích yêu cầu từng chương, chạy song song; Opus 5.5 gộp kết quả, đối chiếu năng lực, liệt kê rủi ro |
| C. Hệ nhiều agent | Một agent điều phối tự chia việc cho các subagent |

Nhóm chọn B. Tuần sau phải trình bày quyết định này trước ban điều hành: tổng giám đốc (người tài trợ dự án), giám đốc tài chính, trưởng pháp chế, trưởng phòng an toàn thông tin, và hai trưởng nhóm kỹ thuật sẽ xây hệ thống.

Phương án B chạy như sau:

**Sơ đồ**
1. **Code**: tách bộ hồ sơ theo chương
   ↓ _chạy song song_
2. **Sonnet 5.5**: chương 1 **|** **Sonnet 5.5**: chương 2 **|** **Sonnet 5.5**: chương còn lại
   ↓ _gộp kết quả_
3. **Opus 5.5**: gộp, đối chiếu năng lực, liệt kê rủi ro
   ↓ _kỹ sư dự toán kiểm và ký_
4. **Bảng kết quả cho hồ sơ dự thầu**

## Quyết định trước, phần của từng người sau

Người nghe hỗn hợp không cần cùng một độ sâu. Cách sắp quen thuộc, cũng là cách câu luyện thi chấm đúng:

1. **Mở bằng quyết định**: chọn gì, phục vụ kết quả kinh doanh nào, chấp nhận đánh đổi gì.
2. **Sau đó đi vào mối quan tâm chính của từng người**, mỗi người một phần riêng để tìm đúng chỗ của mình mà không phải đọc hết phần còn lại.

Trong ví dụ, đoạn mở đầu có thể là: "Chúng tôi đề xuất workflow cố định ba bước. Thời gian đọc một bộ hồ sơ giảm từ hai ngày xuống dưới một giờ, kỹ sư chỉ còn kiểm và ký. Đánh đổi chúng tôi chấp nhận: chi phí mỗi lần chạy cao hơn phương án rẻ nhất một chút, và đội kỹ thuật phải viết thêm phần tách chương."

Sau đoạn mở đầu là các phần riêng:

| Người nghe | Họ cần thấy | Trong ví dụ |
| --- | --- | --- |
| Người tài trợ dự án (**executive sponsor**) | Quyết định, kết quả kinh doanh, đánh đổi đã chấp nhận, rủi ro ở mức tóm tắt | Thời gian đọc hồ sơ, số lần bỏ sót điều khoản phạt |
| Giám đốc tài chính | Chi phí trên mỗi việc xong, chi phí khi khối lượng tăng, trần chi tiêu | Chi phí mỗi bộ hồ sơ, ngân sách tháng cho 60 bộ |
| Pháp chế, bảo mật, tuân thủ | Mối đe doạ, kiểm soát cho từng rủi ro, rủi ro còn lại và ai chấp nhận nó, khả năng truy vết | Hồ sơ do bên ngoài soạn; agent chỉ được đọc; log gắn mã hồ sơ |
| Đội kỹ thuật | Lý do kỹ thuật, phương án đã cân nhắc, việc phải làm khi triển khai | Vì sao không dùng hệ nhiều agent; tách chương bằng code; thứ tự prompt để dùng cache |

Hình dạng của cả bản trình bày:

**Sơ đồ**
1. **Đoạn mở đầu**: quyết định, kết quả kinh doanh, đánh đổi đã chấp nhận
   ↓ _rồi mỗi người một phần riêng_
2. **Người tài trợ**: rủi ro ở mức tóm tắt **|** **Giám đốc tài chính**: chi phí trên mỗi việc xong **|** **Pháp chế, bảo mật**: kiểm soát, rủi ro còn lại **|** **Đội kỹ thuật**: lý do, phương án, việc phải làm

> **Trong đề chọn gì**
>
> Hai câu luyện thi cùng một ý. Trình bày cho người tài trợ và các trưởng nhóm kỹ thuật: chọn **mở bằng quyết định, kết quả kinh doanh và đánh đổi đã chấp nhận, rồi mới đến lý do kỹ thuật, phương án thay thế và tác động khi triển khai**. Trình bày cho hội đồng chỉ đạo (**steering committee**) gồm CFO, trưởng pháp chế và CIO: chọn **mở bằng quyết định kiến trúc, rồi giải quyết trực tiếp mối quan tâm chính của từng người**.

> **Bẫy đề**
>
> Các đáp án sai trong hai câu đó: mở bằng sơ đồ kiến trúc và danh sách thành phần; mở bằng dự toán chi phí nhiều năm; một bài dày đặc như nhau cho mọi người; chỉ công bố quyết định mà bỏ lý do, phương án thay thế và đánh đổi; đi sâu chi tiết cài đặt cho kỹ sư rồi dừng, không nói tới kết quả kinh doanh.

## Nói về chi phí: tính trên mỗi việc xong

Giám đốc tài chính thường hỏi "model nào rẻ nhất". Docs của Anthropic về tối ưu chi phí trả lời: so model bằng **chi phí trên mỗi việc hoàn thành**, không bằng giá mỗi token. Bài blog của Anthropic về chọn model nói thêm rằng model hạng cao có thể rẻ hơn tính trên mỗi việc dù giá token cao hơn, vì nó thường cần ít lượt và ít thời gian suy nghĩ hơn.

Trong ví dụ, phương án A rẻ nhất mỗi lần chạy nhưng bỏ sót điều khoản phạt ở 6 trên 40 bộ hồ sơ thử. Với tỉ lệ đó, kỹ sư vẫn phải đọc lại chương điều khoản của mọi bộ hồ sơ cho chắc, nên phần thời gian tiết kiệm được gần như mất hết. Tính cả công đọc lại, A đắt hơn B.

**Sơ đồ**
1. **A. Một lần gọi**: rẻ nhất mỗi lần chạy **|** **B. Workflow**: đắt hơn một chút mỗi lần chạy
   ↓ _bỏ sót điều khoản phạt khi thử trên 40 bộ_
2. **6 bộ**: kỹ sư phải đọc lại chương điều khoản của mọi bộ **|** **1 bộ**: kỹ sư chỉ kiểm danh mục rồi ký
   ↓ _tính cả công đọc lại_
3. **Chi phí trên mỗi việc xong**: B rẻ hơn A

Docs cũng chia các cách giảm chi phí thành hai nhóm. Người nghe nên biết bạn đã làm hết nhóm đầu trước khi đụng tới nhóm sau:

- **Tiết kiệm không mất chất lượng**: prompt caching cho phần lặp lại ở mọi lần gọi (chỉ dẫn và hồ sơ năng lực công ty), Batch API giảm 50% giá cho việc không cần kết quả ngay (hồ sơ nhận buổi chiều, sáng hôm sau kỹ sư mới đọc).
- **Đánh đổi**: hạ model, hạ effort, giới hạn độ dài đầu ra. Những thứ này có thể làm giảm chất lượng, nên phải đo lại.

Docs còn khuyên so model trên khoảng 10% việc khó nhất, vì hoá đơn thường do những việc model rẻ làm hỏng quyết định. Trong ví dụ, đó là các bộ hồ sơ dài nhất, nhiều phụ lục nhất.

### Mỗi lớp phức tạp phải có giá

Bài "Building effective agents" của Anthropic nói hệ agent thường đổi độ trễ và chi phí lấy chất lượng, nên chỉ thêm độ phức tạp khi nó cải thiện kết quả rõ ràng, và bắt đầu từ cách đơn giản nhất. Bài blog về hệ nhiều agent cho biết hệ nhiều agent thường tốn gấp 3–10 lần token so với một agent làm cùng việc, và lợi ích chính của chạy song song là làm kỹ hơn chứ không phải nhanh hơn.

Vì vậy, khi trình bày, mỗi lớp thêm vào (thêm agent, thêm bước kiểm, thêm model) phải trả lời được ba câu: thêm được gì, tốn thêm bao nhiêu, đo bằng gì. Trong ví dụ, phương án C bỏ sót ít ngang B nhưng tốn gấp bốn lần và chậm hơn, nên lớp điều phối không mua thêm được gì.

1. **Lớp này không cải thiện chỉ số đã thống nhất?** → Bỏ
2. **Phần cải thiện không đáng chi phí và độ trễ tăng thêm?** → Bỏ
3. **Chưa đo trên bộ test của mình?** → Đo trước khi đưa vào bản trình bày
- **Còn lại** → Giữ, và ghi rõ giá của lớp đó

## Chứng minh bằng đánh giá trên dữ liệu của mình

Docs chọn model nói có một bộ đánh giá tốt là bước quan trọng nhất. Bài blog về chọn model nói thêm rằng các bộ benchmark công khai đã gần chạm trần với các model mạnh, chỉ nên xem như chỉ dẫn hướng; hãy thử trên khối việc thật với tiêu chí thành công của chính bạn.

Với người nghe, điều đó nghĩa là đừng nói "model này đứng đầu bảng xếp hạng". Hãy đưa các phương án đã cân nhắc (**alternatives considered**) và tiêu chí dùng để đánh giá chúng. Trong ví dụ, nhóm chạy cả ba phương án trên 40 bộ hồ sơ cũ mà kỹ sư đã đánh dấu đủ điều khoản phạt:

| Tiêu chí (thống nhất từ lúc khảo sát) | A. Một lần gọi | B. Workflow | C. Nhiều agent |
| --- | --- | --- | --- |
| Số bộ bỏ sót điều khoản phạt | 6/40 | 1/40 | 1/40 |
| Chi phí trung bình mỗi lần chạy | $2,6 | $2,9 | $12 |
| Thời gian xử lý mỗi bộ | 7 phút | 4 phút | 20 phút |
| Kỹ sư lần lại được ý lấy từ đâu | Khó | Được, mỗi ý gắn với chương | Được |

Số trong bảng là số đo của nhóm trong ví dụ, không phải số liệu chung về các model.

Bảng này phục vụ cả hai phía. Ban điều hành thấy vì sao chọn B. Đội kỹ thuật thấy A và C bị loại vì đâu, và hiểu cơ chế được chọn: B là workflow, tức đường đi viết sẵn trong code, vì các bước đọc hồ sơ đã biết trước, không cần để Claude tự quyết bước tiếp theo. Việc của họ khi triển khai cũng hiện ra từ đó: viết phần tách chương, chạy song song từng chương, đặt phần cố định ở đầu prompt để cache trúng.

## Rủi ro còn lại: nói rõ và có giới hạn

Bài blog của Phó CISO Anthropic về agent (07/2026) viết rằng việc của người phụ trách bảo mật không phải đưa rủi ro về 0, mà là làm cho rủi ro của agent **nhìn thấy được và có giới hạn**. Bài gợi ý bốn câu hỏi cho mỗi trường hợp dùng:

| Câu hỏi | Trong ví dụ |
| --- | --- |
| Nội dung nào kẻ xấu có thể viết hoặc sửa? | Hồ sơ mời thầu do bên ngoài soạn, có thể cài câu lệnh để lừa Claude (prompt injection) |
| Agent làm được gì, dưới danh tính của ai? | Chỉ đọc file hồ sơ và ghi bảng kết quả vào một thư mục; chạy bằng tài khoản dịch vụ riêng; không gửi email, không ra mạng ngoài |
| Nếu agent làm sai, ảnh hưởng tới đâu (**blast radius**)? | Tệ nhất là bảng tóm tắt sai hoặc thiếu; kỹ sư dự toán vẫn kiểm và ký trước khi nộp thầu |
| Phân biệt được việc agent làm với việc người làm không, log có về hệ thống giám sát bảo mật không? | Mỗi lần gọi ghi log kèm mã hồ sơ, đẩy về hệ thống giám sát của phòng an toàn thông tin |

Bài blog cũng nhấn mạnh hai điều: chỉ cấp năng lực hẹp nhất mà vẫn làm xong việc, và chấp nhận một rủi ro là việc của người có thẩm quyền chấp nhận nó, không phải của nhóm kỹ thuật.

Phần dành cho người duyệt bảo mật và tuân thủ vì vậy gồm: mô hình mối đe doạ (**threat model**), mỗi rủi ro được kiểm soát nào xử lý (**control mappings**), tiêu chí chấp nhận rủi ro còn lại (**residual-risk acceptance criteria**), và khả năng truy vết khi kiểm toán (**audit traceability**). Trong ví dụ, rủi ro còn lại là B vẫn bỏ sót 1/40 bộ khi thử. Tiêu chí chấp nhận: kỹ sư kiểm danh mục điều khoản phạt theo mẫu trước khi ký; giám đốc dự toán là người ký chấp nhận rủi ro; nếu trong vận hành có hơn một bộ bỏ sót mỗi tháng thì dừng lại xem xét.

> **Bẫy đề**
>
> Câu luyện thi hỏi nội dung nào hợp nhất với người duyệt bảo mật và tuân thủ. Đúng: **threat model, control mappings, tiêu chí chấp nhận rủi ro còn lại, audit traceability**. Sai: lịch giao tính năng và phạm vi (dành cho quản lý sản phẩm); timeline, giao diện thành phần, thứ tự triển khai (dành cho đội kỹ thuật); lý do quyết định, kết quả kinh doanh, rủi ro tóm tắt (dành cho ban điều hành). Các đáp án sai đều là nội dung đúng, chỉ trao nhầm người.

## Ghi người phụ trách và lúc xem lại

Quyết định đúng hôm nay có thể sai sau ba tháng: có model mới, model đang dùng sắp bị ngừng, khối lượng tăng gấp ba. Một bản ghi quyết định tốt có hai thứ hay bị bỏ quên:

- **Các phương án đã cân nhắc kèm tiêu chí đánh giá**, như bảng ở mục trên. Người đọc sau này cần biết vì sao A và C bị loại, không chỉ biết B được chọn.
- **Người phụ trách và nhịp xem lại** (**ownership and review cadence**): ai chịu trách nhiệm, bao lâu xem lại một lần, và chuyện gì buộc phải xem lại sớm.

Trong ví dụ: trưởng nhóm kỹ thuật phụ trách; xem lại mỗi quý; xem lại ngay khi Anthropic báo ngừng model đang dùng (docs nói Anthropic báo trước ít nhất 60 ngày), khi chi phí mỗi bộ vượt $4, hoặc khi có bộ hồ sơ bỏ sót điều khoản phạt trong vận hành. Cách ghi quyết định thành tài liệu chuẩn có ở bài 6.4.

> **Trong đề chọn gì**
>
> Câu luyện thi chọn hai đặc điểm của cách truyền đạt quyết định kiến trúc tốt: **có người phụ trách và nhịp xem lại khi điều kiện hay giả định thay đổi**, và **ghi các phương án đã cân nhắc kèm tiêu chí đánh giá từng phương án**. Loại: bỏ phương án bị loại cho tài liệu gọn; gửi tới một hội đồng duyệt bắt buộc lãnh đạo dự; dùng một mẫu thống nhất cho đẹp. Ba cách này chỉ lo hình thức, không giúp ai hiểu hay xem lại quyết định.

> **Ý chính**
>
> Mở bằng quyết định, kết quả và đánh đổi, rồi trả lời đúng mối quan tâm của từng người nghe. Nói chi phí bằng chi phí trên mỗi việc xong, chứng minh bằng phương án và số đo trên dữ liệu của mình, nói rõ rủi ro còn lại và ai chấp nhận nó, và ghi người phụ trách cùng lúc xem lại.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Choosing the right model (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
3. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
4. [Claude models explained, choosing the best model for your use case (Claude Blog)](https://claude.com/blog/claude-models-explained-choosing-the-best-model-for-your-use-case)
5. [Building effective agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
6. [Building multi-agent systems, when and how to use them (Claude Blog)](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
7. [Zero risk isn't the job, a CISO's guide to agentic AI (Claude Blog)](https://claude.com/blog/ciso-guide-to-agentic-ai)
8. [Model deprecations (Claude Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
