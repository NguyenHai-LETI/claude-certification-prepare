---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-5-vong-doi-du-an
ngay_tai: 2026-11-27
tieu_de: Đồng hành qua các giai đoạn của vòng đời giải pháp
---

Domain 6: Stakeholder Communication & Lifecycle Management · Task 6.5

# Đồng hành qua các giai đoạn của vòng đời giải pháp

Các giai đoạn khảo sát, thiết kế, bàn giao, giám sát, cải tiến giao gì cho nhau, khi nào quay lại thiết kế, và làm gì khi model bị ngừng.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Biết mỗi giai đoạn của vòng đời phải giao gì cho giai đoạn sau
- Mang bộ đánh giá và bài học của từng giai đoạn đi tiếp thay vì làm lại
- Dùng số đo vận hành, mẫu đầu ra được chấm và phản hồi để chọn thay đổi cho vòng cải tiến
- Nhận ra khi nào phải quay lại thiết kế thay vì sửa tại chỗ
- Lên kế hoạch khi model đang dùng sắp bị ngừng

Một giải pháp dùng Claude không kết thúc ở ngày lên production. Sau đó còn giám sát, cải tiến, đổi model, và có khi phải thiết kế lại. Kiến trúc sư giỏi là người làm cho mỗi giai đoạn để lại thứ giai đoạn sau dùng được.

Bài này giúp bạn trả lời: một giải pháp đi qua những giai đoạn nào, mỗi giai đoạn giao gì cho giai đoạn sau, và khi nào thì quay lại từ đầu?

## Ví dụ xuyên suốt: công ty phân bón và trợ lý cho nông dân

Một công ty phân bón và giống cây trồng muốn có trợ lý nhắn tin cho nông dân và đại lý: hỏi liều bón theo giai đoạn cây, lịch bón cho từng vụ, mô tả triệu chứng sâu bệnh. Câu khó thì chuyển cho kỹ sư nông học của công ty. Dự án đi từ khảo sát tới vận hành trong một năm, qua hai vụ lúa.

## Mỗi giai đoạn giao một thứ cho giai đoạn sau

Năm giai đoạn đề thi nhắc tới là khảo sát (**discovery**), thiết kế (**design**), bàn giao (**handoff**), giám sát (**monitoring**) và cải tiến (**iteration**). Điều quan trọng không phải tên giai đoạn mà là thứ mỗi giai đoạn giao đi:

| Giai đoạn | Giao cho giai đoạn sau | Trong ví dụ |
| --- | --- | --- |
| Khảo sát | Định nghĩa "thành công": tiêu chí đo được, ngưỡng thất bại, bài kiểm nghiệm thu | Đúng liều bón theo bảng khuyến cáo của công ty ở ít nhất 98% trong 400 câu hỏi mẫu; không bao giờ khuyên thuốc ngoài danh mục được phép |
| Thiết kế | Kiến trúc, đường xây đã chọn, các ADR | Workflow tra bảng khuyến cáo rồi soạn trả lời; tự viết trên Messages API |
| Bàn giao | Gói bàn giao, bộ đánh giá kèm mẫu tham chiếu, runbook | Đội IT của công ty nhận bộ 400 câu và lệnh chạy lại |
| Giám sát | Số đo vận hành, mẫu đầu ra được chấm, phản hồi | Báo cáo tuần: tỉ lệ chuyển cho kỹ sư, 50 cuộc hội thoại kỹ sư chấm lại |
| Cải tiến | Thay đổi đã đo trước và sau, bài học | Thêm lịch bón cho giống lúa mới, đo lại trên bộ đánh giá |

Thứ được giao đi nằm trên các mũi tên:

**Sơ đồ**
1. **Khảo sát**
   ↓ _tiêu chí đo được, ngưỡng thất bại, bài kiểm nghiệm thu_
2. **Thiết kế**
   ↓ _kiến trúc, đường xây đã chọn, ADR_
3. **Bàn giao**
   ↓ _gói bàn giao, bộ đánh giá, runbook_
4. **Giám sát**
   ↓ _số đo vận hành, mẫu đầu ra được chấm, phản hồi_
5. **Cải tiến**

Khoá AI Fluency for Builders của Anthropic Academy nhắc rằng người xây phải chịu trách nhiệm cho **kết quả** chứ không chỉ cho đầu ra, và gợi ý tự hỏi trước khi đưa vào dùng: mình hiểu hệ thống làm gì chưa, đã kiểm chưa, nó được quyền chạm vào gì, ai chịu trách nhiệm khi nó sai, và có vòng phản hồi để biết khi nó sai chưa. Năm câu đó trải qua cả vòng đời, không dừng ở ngày bàn giao.

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi hai việc giữ được sự liền mạch qua cả vòng đời. Chọn **mang bộ đánh giá và mẫu tham chiếu đi tiếp qua các vòng cải tiến thay vì dựng lại**, và **ghi bài học cuối mỗi giai đoạn làm đầu vào cho giai đoạn sau**. Loại: báo cho danh sách các bên mỗi lần chuyển giai đoạn; lưu trữ mọi sản phẩm của từng giai đoạn; khoá các quyết định ban đầu để không ai xem lại.

## Thiết kế chọn đường xây, bàn giao trao cả bài kiểm

Ở giai đoạn thiết kế, ràng buộc từ khảo sát quyết định đường xây. Docs của Anthropic nêu ba đường: tự viết vòng lặp trên Messages API, dùng Agent SDK để chạy vòng lặp trong tiến trình của mình, hoặc để Anthropic chạy vòng lặp và môi trường với Managed Agents. Đường nào cũng có giới hạn riêng. Ví dụ docs ghi Managed Agents hiện không đủ điều kiện cho chế độ không lưu dữ liệu (**ZDR**) và không nằm trong thoả thuận HIPAA. Nếu khảo sát ghi ra một ràng buộc như vậy, thiết kế phải loại đường đó ngay.

Ở giai đoạn bàn giao, giao bản thiết kế thôi là chưa đủ. Đội nhận phải có **bài kiểm** để biết mình xây đúng. Bài viết của Anthropic về agent chạy dài cho một ví dụ: trước khi viết code, một agent lập danh sách tính năng dạng JSON, mọi mục đều đánh dấu chưa đạt; agent viết code chỉ được đổi trạng thái khi đã kiểm như người dùng thật, và không được xoá hay sửa bài kiểm. Cách đó chặn việc tuyên bố xong quá sớm, và áp được cho cả đội người: bài kiểm nghiệm thu viết từ lúc khảo sát đi cùng bản thiết kế sang đội triển khai.

Trong ví dụ, đội IT nhận bộ 400 câu hỏi có đáp án của kỹ sư, danh sách thuốc được phép, và lệnh chạy lại cả bộ. Họ biết đã xong khi bộ đó đạt ngưỡng, không phải khi trợ lý "trông có vẻ ổn".

## Giám sát: biến hành vi thật thành dữ liệu để quyết định

Bộ đánh giá trước khi lên production không bắt được mọi thứ. Bài viết về đánh giá agent của Anthropic so cách kết hợp nhiều lớp kiểm với các lát pho mát Thuỵ Sĩ: mỗi lát có lỗ, chồng nhiều lát thì ít lỗ lọt qua. Các lớp gồm đánh giá tự động, giám sát production, thử A/B, phản hồi người dùng, đọc lại hội thoại, và nghiên cứu có người tham gia.

Bài viết cũng phân biệt hai loại bộ đánh giá. Bộ đo năng lực (**capability eval**) bắt đầu với tỉ lệ đạt thấp, dùng để đẩy chất lượng lên. Bộ chống thụt lùi (**regression eval**) phải đạt gần 100%, dùng để chắc thay đổi mới không làm hỏng cái đã chạy. Khi một bộ năng lực đã đạt gần hết, nó chuyển thành bộ chống thụt lùi.

Trong ví dụ, giai đoạn giám sát có ba nguồn:

- **Số đo vận hành**: số tin mỗi ngày, độ trễ, tỉ lệ chuyển cho kỹ sư, chi phí.
- **Mẫu đầu ra được chấm**: mỗi tuần kỹ sư nông học chấm lại 50 cuộc hội thoại chọn ngẫu nhiên.
- **Phản hồi**: đại lý báo những câu trợ lý trả lời sai hay khó hiểu.

## Cải tiến: làm tiếp, sửa tại chỗ, hay quay lại thiết kế

Vòng cải tiến dựa trên bằng chứng: xem số đo vận hành, kết quả chấm mẫu và phản hồi của các bên, chọn thay đổi có tác động lớn nhất cho vòng tới, rồi lên kế hoạch đo thay đổi đó bằng chính bộ đánh giá đang có.

**Sơ đồ**
1. **Giám sát**: số đo, mẫu được chấm, phản hồi
2. **Chọn thay đổi**: tác động lớn nhất cho vòng tới
3. **Làm và đo**: chạy lại bộ đánh giá đang có
4. **Đưa lên**: thay đổi đã đo trước và sau
- ↻Phải đổi hợp đồng cốt lõi thì ra khỏi vòng, quay lại thiết kế

> **Bẫy đề**
>
> Câu luyện thi hỏi việc nào thuộc giai đoạn cải tiến. Đáp án đúng là **xem số đo vận hành, kết quả chấm mẫu và phản hồi để chọn thay đổi tác động lớn nhất, rồi lên kế hoạch theo bộ đánh giá**. Đáp án sai: dựng lại cả kiến trúc mỗi vòng bất kể dữ liệu nói gì; ngừng đo sau khi lên production vì coi đó là điểm kết thúc; bỏ bộ đánh giá khi đã chạy thật.

Phần lớn thay đổi nằm gọn trong vòng cải tiến. Nhưng có lúc phải quay lại thiết kế, và ranh giới khá rõ: **kiến trúc hiện tại không đáp ứng được yêu cầu mới nếu không đổi trách nhiệm của các thành phần hoặc hợp đồng cốt lõi giữa chúng**. Trong ví dụ, sang vụ thứ hai, nông dân muốn gửi ảnh lá lúa bị bệnh. Hệ thống cần một thành phần mới đọc ảnh, hợp đồng đầu vào đổi từ chỉ có chữ sang có ảnh, và quy trình chuyển cho kỹ sư phải kèm ảnh. Đó là việc của một vòng thiết kế mới.

1. **Yêu cầu mới buộc đổi trách nhiệm thành phần hay hợp đồng cốt lõi?** → Quay lại thiết kế
2. **Hệ thống không còn mang lại giá trị đáng với chi phí?** → Lên kế hoạch dừng
3. **Có thay đổi trong một thành phần hay một cấu hình đáng làm?** → Sửa trong vòng cải tiến, đo bằng bộ đánh giá
- **Còn lại** → Giữ nguyên, tiếp tục giám sát

> **Trong đề chọn gì**
>
> Hai câu luyện thi gần như giống nhau, chỉ đảo thứ tự đáp án, hỏi dấu hiệu cần một vòng thiết kế mới. Chọn **kiến trúc hiện tại không đáp ứng yêu cầu mới nếu không đổi trách nhiệm thành phần hoặc hợp đồng cốt lõi**. Loại ba thay đổi nhỏ: sửa một dòng chữ trên giao diện, chỉnh ngưỡng báo động để bớt báo nhầm, làm rõ một bước trong runbook.

## Khi model bên dưới thay đổi

Ngay cả khi hệ thống của bạn không đổi gì, model nó dùng vẫn có vòng đời riêng. Docs về ngừng model khuyên kiểm ứng dụng với model mới từ sớm, trước ngày ngừng của model đang dùng, và đổi sang model thay thế được khuyến nghị càng sớm càng tốt. Để biết ứng dụng nào còn gọi model cũ, vào trang Usage trong Claude Console, xuất file CSV: số liệu được chia theo API key và theo model.

Ngày ngừng mà Anthropic công bố chỉ áp cho các nền tảng do Anthropic vận hành: Claude API, Claude Platform on AWS, Claude Models on Google Cloud (Anthropic managed) và Microsoft Foundry. Amazon Bedrock và Claude Models on Google Cloud (Google managed) tự đặt lịch ngừng riêng, nên trạng thái và ngày của cùng một model có thể khác. Vì vậy việc đầu tiên là xác định ứng dụng gọi model qua nền tảng nào, rồi đối chiếu bảng của đúng nền tảng đó. Trên nền tảng của Anthropic, sau ngày ngừng thì yêu cầu sẽ lỗi; Anthropic báo trước ít nhất 60 ngày với model đã phát hành công khai.

Với kiến trúc sư, việc model sắp bị ngừng là một vòng cải tiến có hạn chót:

1. Tìm mọi chỗ còn gọi model cũ qua file xuất từ trang Usage.
2. Chạy bộ đánh giá đã mang theo từ đầu dự án với model thay thế.
3. Sửa prompt hoặc cấu hình nếu kết quả lệch, đo lại.
4. Báo các bên theo kênh đã thống nhất, rồi chuyển trước ngày ngừng.

Trong ví dụ, nhờ bộ 400 câu hỏi được giữ từ lúc khảo sát, việc đổi model chỉ tốn một buổi chạy và đọc kết quả. Không có bộ đó, nhóm sẽ phải đoán.

> **Ý chính**
>
> Mỗi giai đoạn giao cho giai đoạn sau một thứ dùng được: tiêu chí thành công, thiết kế kèm ADR, gói bàn giao kèm bài kiểm, số đo vận hành. Mang bộ đánh giá và bài học đi suốt vòng đời, cải tiến dựa trên dữ liệu, và chỉ quay lại thiết kế khi phải đổi trách nhiệm thành phần hay hợp đồng cốt lõi.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [AI Fluency for Builders, Stand behind what you build (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-for-builders/stand-behind-what-you-build)
3. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
4. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
5. [Effective harnesses for long-running agents (Anthropic Engineering)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
6. [Use case guides, choosing a build path (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/overview)
7. [Claude Managed Agents overview (Claude Docs)](https://platform.claude.com/docs/en/managed-agents/overview)
8. [Model deprecations (Claude Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
