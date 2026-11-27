---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/on-nhanh
ngay_tai: 2026-11-27
tieu_de: Tổng quan CCAR-P
---

# Tổng quan CCAR-P

Cả chứng chỉ CCAR-P trên một trang, giải thích ngay tại chỗ, kèm sơ đồ luồng, bẫy đề và bảng chọn nhanh. Chưa học bài nào vẫn đọc được.

- 38 phút đọc
- Đối chiếu docs 04/11/2026
- 5 nguồn

Đọc trang này đầu tiên. Nó gói cả chứng chỉ vào một chỗ: mỗi khái niệm được giải thích ngay tại chỗ bằng lời thường, có sơ đồ ở những chỗ cần hình dung luồng, nên chưa học gì bạn vẫn đọc hiểu được. Cuối mỗi domain có danh sách bài để học kỹ hơn. Trước giờ thi, quay lại đây ôn các bảng **Trong đề chọn gì**.

Mỗi domain đi theo cùng một thứ tự: domain đó hỏi gì, các khái niệm chính, bẫy đề hay gặp, rồi bảng **Trong đề chọn gì** để tra nhanh. Cuối trang là mẹo chọn đáp án khi phân vân, đọc sau cùng sẽ dễ hiểu nhất.

## Đề thi gồm những gì

| Mục | Chi tiết |
| --- | --- |
| Số câu | 63, một đáp án hoặc nhiều đáp án (câu nào cũng ghi rõ chọn mấy) |
| Thời gian | 120 phút |
| Cấu trúc | Mỗi câu là một tình huống riêng, không chia theo kịch bản như CCAR-F |
| Điểm đậu | 720 trên thang 100–1.000 |
| Lệ phí, hiệu lực | $175; chứng chỉ có hiệu lực 12 tháng |
| Kết quả | Đạt hay không, điểm quy đổi, và tỉ lệ đúng theo từng domain |

| Domain | Tỉ trọng | Hỏi về |
| --- | --- | --- |
| 1. Solution Design & Architecture | 17% | Từ bài toán kinh doanh tới kiến trúc, chọn workflow hay agent |
| 2. Claude Models, Prompting & Context Engineering | 13% | Chọn model, viết prompt, quản lý context và cache |
| 3. Integration | 19% | Tool, phân quyền, RAG, MCP, độ trễ, quan sát hệ thống |
| 4. Evaluation, Testing & Optimization | 16% | Chỉ số, bộ đánh giá, A/B test, chẩn đoán, tối ưu chi phí |
| 5. Governance, Safety & Risk Management | 14% | Guardrail, kiểu hỏng của LLM, người duyệt, tuân thủ quy định |
| 6. Stakeholder Communication & Lifecycle Management | 14% | Khảo sát yêu cầu, trình bày quyết định, SLA, tài liệu, vòng đời |
| 7. Developer Productivity & Operational Enablement | 7% | Cấu hình Claude Code cho đội, đưa AI vào quy trình, gỡ lỗi |

Đề CCAR-P hỏi ở vai kiến trúc sư: ít hỏi cú pháp, nhiều hỏi **lý do chọn** và **thứ tự làm**. Rất nhiều câu có dạng "việc nào phải làm **trước khi** X".

## Domain 1: Solution Design & Architecture

Domain này hỏi cách biến một bài toán kinh doanh thành kiến trúc: chia việc, chọn mẫu kiến trúc, và chứng minh giải pháp đáng làm.

### Từ bài toán đến giải pháp

Đừng bắt đầu từ "dùng model nào". Bắt đầu từ vấn đề, viết thành con số (mỗi ngày 3.000 email khiếu nại, xử lý mất 2 ngày), rồi chia thành từng việc:

- **Việc cần hiểu ngôn ngữ** (đọc email, phân loại, tóm tắt, soạn trả lời) thì giao cho Claude.
- **Việc cần chắc chắn tuyệt đối** (tính tiền bồi thường, so hạn mức, kiểm ngày) thì để code làm.
- **Ràng buộc cứng xét trước**: yêu cầu bảo mật, pháp lý, cam kết SLA (cam kết chất lượng dịch vụ với khách). Phương án vi phạm ràng buộc cứng bị loại ngay, dù rẻ hay hay đến đâu.

> **Bẫy đề**
>
> Đề đưa một phương án rẻ hơn, bớt việc vận hành, kèm một yêu cầu của bộ phận bảo mật hay một SLA. Đáp án đúng là kiểm ràng buộc cứng trước. Chi phí token, độ quen thuộc của đội chỉ xét sau.

### Kiến trúc đầu cuối: đi theo đường dữ liệu

Một hệ thống dùng Claude đi theo chuỗi **đầu vào → xử lý → đầu ra → vòng phản hồi**. Phần xử lý chia làm ba lớp, đề hay bắt xếp từng thành phần vào đúng lớp:

**Sơ đồ**
1. **Tiền xử lý (Pre-Processing)**: nhận chữ trong ảnh, che dữ liệu cá nhân, kiểm quyền người gửi
   ↓ _chỉ dữ liệu đã chuẩn bị mới tới model_
2. **Tầng model (Model Stage)**: Claude phân loại, trích trường, tóm tắt
   ↓ _kết quả Claude trả về_
3. **Hậu xử lý (Post-Processing)**: kiểm đúng schema, đối chiếu số tiền bằng code, lưu vào hệ thống chính
   ↓ _chỗ người sửa được ghi lại_
4. **Vòng phản hồi (Feedback loop)**: bộ chấm kiểm kết quả, ca người sửa thành ca test

Mẹo xếp lớp: việc xảy ra trước khi gọi model là tiền xử lý, việc model làm là tầng model, việc dùng kết quả model là hậu xử lý. Che dữ liệu cá nhân phải làm **trước** khi gọi model.

Với hệ phục vụ hàng nghìn người cùng lúc: **kiểm quyền trước khi truy xuất** (người dùng chỉ lấy được tài liệu mình được xem), và dùng **hàng đợi bất đồng bộ** để đỡ lúc lưu lượng dồn.

### Chọn augmented LLM, workflow hay agent

- **Augmented LLM**: một lần gọi Claude, kèm truy xuất tài liệu, tool và ví dụ. Đơn giản, rẻ, dễ kiểm tra. Luôn thử mẫu này trước.
- **Workflow**: các bước biết trước, viết sẵn thứ tự trong code (phân loại → trích → kiểm → lưu). Chi phí mỗi yêu cầu dễ đoán.
- **Agent**: Claude tự quyết bước tiếp theo, gọi tool nhiều vòng. Chỉ dùng khi không đoán trước được cần những bước nào.

1. **Một lần gọi có truy xuất và tool đã giải được?** → Augmented LLM
2. **Các bước biết trước, cố định?** → Workflow viết sẵn trong code
3. **Việc rộng, nhiều hướng độc lập, vượt sức một context?** → Nhiều agent chạy song song
- **Còn lại** → Không đoán trước cần những bước nào: một agent

### Hệ nhiều agent

Bắt đầu bằng **một** agent. Chỉ tách thành nhiều agent khi có lý do: context một agent bị nhiễu vì quá nhiều thứ, các phần việc chạy song song được, hoặc cần chuyên môn hoá. Khi tách thì **chia theo ranh giới context** (mỗi agent một mảng thông tin riêng), không chia theo vai trò kiểu "agent lập kế hoạch, agent làm, agent kiểm".

**Sơ đồ**
- Trung tâm: **Agent điều phối (orchestrator)**: chia việc theo từng mảng thông tin, gộp và kiểm tra
- **Worker thị trường A**: context riêng
- **Worker thị trường B**: context riêng
- **Worker thị trường C**: context riêng

_Lời giao việc ghi đủ mục tiêu, định dạng kết quả, tool được dùng và ranh giới; worker chỉ trả kết quả cuối_

Chạy thật thì nhớ hai điều: agent chậm nhất quyết định tốc độ cả hệ, và lỗi ở từng bước cộng dồn lên.

### Chia nhỏ bài toán phức tạp

1. Phần cần chắc chắn thì giao cho code, phần cần hiểu ngôn ngữ cho Claude.
2. Nối các bước thành chuỗi, đặt **bước kiểm** giữa các bước để lỗi không lan xuống.
3. Phần không phụ thuộc nhau thì chạy song song.
4. Việc cần chất lượng cao: viết, tự kiểm, sửa.
5. Vòng gọi tool dày đặc thì chuyển sang code; việc không gấp thì gom thành lô cho rẻ.

### Gắn giải pháp với giá trị kinh doanh

Đề dùng năm "trụ cột" để đánh giá giải pháp. Ba trụ cột đầu dễ lẫn nhất:

| Trụ cột | Nghĩa là | Ví dụ |
| --- | --- | --- |
| **Efficiency** | Từng việc nhanh hơn, cùng nguồn lực | Đối soát một hoá đơn từ 20 phút còn 3 phút |
| **Productivity** | Tổng kết quả nhiều hơn | Cùng đội ngũ, mỗi tháng xử lý gấp ba số hoá đơn |
| **Transformation** | Cách làm việc đổi hình dạng | Từ đối soát cuối tháng sang đối soát liên tục mỗi ngày |
| **Solution cost** | Tổng chi phí của giải pháp | Token, hạ tầng, người vận hành |
| **Performance SLA** | Cam kết hiệu năng có giữ được không | Ràng buộc cứng, xét trước khi cân chi phí |

Tính lợi ích thực, không lấy con số thô: giờ tiết kiệm được phải trừ đi thời gian người kiểm lại kết quả.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Phương án rẻ nhưng vướng bảo mật hay SLA | Loại phương án vi phạm ràng buộc cứng trước |
> | Xếp thành phần vào lớp | OCR, che dữ liệu: tiền xử lý. Claude phân loại: tầng model. Kiểm schema, lưu: hậu xử lý |
> | Hỏi đáp có trích dẫn, ưu tiên độ trễ và chi phí | Augmented LLM với RAG |
> | Các bước cố định, muốn chi phí dễ đoán | Workflow |
> | Việc rộng, nhiều hướng độc lập | Nhiều agent chạy song song |
> | Chia agent theo vai trò mà không có lý do về context | Đáp án yếu |
> | So hai kiến trúc có SLA | Loại phương án vi phạm SLA, rồi mới so chi phí |

**Học kỹ domain này**

- [1.1 Từ bài toán kinh doanh đến giải pháp dùng Claude](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-1-tu-bai-toan-den-giai-phap) (10 phút đọc)
- [1.2 Thiết kế kiến trúc đầu cuối](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-2-kien-truc-dau-cuoi) (10 phút đọc)
- [1.3 Chọn augmented LLM, workflow hay agent](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-3-chon-mau-kien-truc) (7 phút đọc)
- [1.4 Thiết kế hệ nhiều agent và cách điều phối](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-4-he-nhieu-agent) (10 phút đọc)
- [1.5 Chia nhỏ bài toán phức tạp](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-5-chia-nho-bai-toan) (8 phút đọc)
- [1.6 Gắn giải pháp với các trụ cột giá trị kinh doanh](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-6-tru-cot-gia-tri) (8 phút đọc)

## Domain 2: Claude Models, Prompting & Context Engineering

Domain này hỏi cách chọn model, viết prompt cho kết quả ổn định, và quản lý context cho rẻ, nhanh.

### Chọn model

| Model | Hợp với |
| --- | --- |
| Haiku 5.5 | Khối lượng lớn, cần nhanh: phân loại, trích xuất, định tuyến |
| Sonnet 5.5 | Cân bằng tốc độ và trí tuệ, việc hằng ngày có người chờ |
| Opus 5.5 | Điểm bắt đầu cho đa số việc, agent chạy dài, công việc tri thức |
| Fable 5.1 | Suy luận khó nhất, khi Opus 5.5 ở effort cao vẫn chưa đạt |

Thứ tự chọn đúng:

1. **Đặt mức cần đạt trước**: chất lượng tối thiểu, độ trễ chấp nhận được, khối lượng mỗi ngày.
2. **Thử trên mẫu dữ liệu thật**, không chọn theo bảng xếp hạng hay kinh nghiệm dự án cũ.
3. **So bằng chi phí trên mỗi việc xong**, không phải giá mỗi token. Model rẻ mà phải chạy lại nhiều lần có thể đắt hơn.
4. **Chỉnh effort** (mức Claude suy nghĩ) trước khi đổi model.
5. Có thể dùng nhiều model trong một hệ: model nhẹ cho lưu lượng thường, model nặng cho ca khó.

1. **Khối lượng lớn, nhãn rõ, cần trả lời ngay?** → Thử Haiku 5.5
2. **Việc hằng ngày cần cân tốc độ và chất lượng?** → Thử Sonnet 5.5
3. **Opus 5.5 ở effort cao nhất vẫn chưa đạt?** → Thử Fable 5.1
- **Còn lại** → Chưa chắc: Opus 5.5, có bộ test rồi mới hạ effort hoặc đổi model rẻ hơn

> **Bẫy đề**
>
> "Model mạnh nhất luôn đúng", "chọn bản mới công bố gần nhất", "prompt chạy tốt trên model cũ thì chạy tốt trên model mới": cả ba đều sai. Đổi model là phải đo lại.

### System prompt và guardrail

Mỗi loại nội dung có chỗ riêng trong prompt:

| Nội dung | Đặt ở |
| --- | --- |
| Vai trò, luật, phạm vi | **System prompt**: lời dặn gửi kèm mọi lượt |
| Dữ liệu của lần này (câu hỏi, hồ sơ) | Lượt của người dùng |
| Nội dung không tin cậy (trang web, email lạ) | Chỉ ở kết quả tool, không trộn vào chỉ dẫn |

- Chỉ dẫn phải cụ thể, có lý do, không mâu thuẫn nhau.
- Luật bắt buộc (không được hoàn tiền quá hạn mức) chặn bằng quyền và code, không chỉ bằng câu chữ trong prompt.
- Câu hỏi dẫn dắt ("tour A tốt hơn tour B phải không?") làm Claude dễ chiều theo người hỏi: yêu cầu so sánh công bằng theo tiêu chí nêu rõ.

### Kỹ thuật prompt

- **Zero-shot**: chỉ dẫn rõ, không ví dụ. Luôn bắt đầu từ đây, nhất là phân loại vào một tập nhãn đã mô tả.
- **Few-shot**: thêm vài ví dụ đa dạng khi định dạng hay cách hiểu còn lệch. Ví dụ có đúng tên trường giúp neo định dạng khi trích xuất.
- **Chain-of-thought và thinking**: cho Claude suy luận từng bước, dùng cho việc nhiều bước. Không bật mặc định cho mọi việc, vì tốn token và chậm hơn.
- Tài liệu dài đặt ở đầu, câu hỏi đặt ở cuối.

### Context window và token

**Context window** là giới hạn những gì Claude thấy trong một lần gọi. Mọi thứ đều tính vào: system prompt, lịch sử, định nghĩa tool, tài liệu truy xuất, kể cả phần đã cache.

- Đếm token trước khi gửi (token counting), đọc trường `usage` sau khi nhận để biết thực tế tốn bao nhiêu.
- Cắt ở đầu vào: chỉ đưa đoạn tài liệu liên quan, bỏ trường thừa của kết quả tool.
- Đừng mặc định nhồi đầy context. Nhiều hơn không có nghĩa là tốt hơn.

### Dùng lại prompt: caching, module, Skills

**Prompt caching** lưu phần đầu prompt đã xử lý, lần sau gửi cùng phần đó thì rẻ và nhanh hơn nhiều. Cache chỉ trúng khi phần đầu giống hệt, nên xếp prompt **từ ổn định tới hay đổi**:

**Sơ đồ**
1. **System prompt**: vai trò, luật. Gần như không đổi
2. **Tài liệu chính sách 8.000 token**: đổi vài lần mỗi tháng
   _(điểm cache: mọi thứ phía trên được dùng lại)_
3. **Câu hỏi của khách**: đổi mỗi lần gọi

**Agent Skills** đóng gói một quy trình dùng chung (hướng dẫn, mẫu, script) thành một gói có người phụ trách, nhiều nơi cùng dùng. Đừng chép quy trình ra nhiều bản prompt.

> **Bẫy đề**
>
> Câu hỏi mẫu của Anthropic: mọi yêu cầu gửi cùng system prompt và tài liệu 8.000 token, cần giảm cả độ trễ lẫn chi phí. Đúng: xếp phần tĩnh lên đầu và bật prompt caching. Sai: cắt tài liệu còn 1.000 token (mất nội dung cần), đổi sang model nhỏ nhất (hại chất lượng).

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Việc phải làm trước khi thử model | Đặt mức chất lượng, độ trễ, khối lượng; chọn model ứng viên |
> | Căn cứ chốt model | Đánh giá trên mẫu đại diện của việc thật |
> | Chi phí cao, chất lượng phải giữ | Chỉnh effort trước khi đổi model |
> | Phân loại vào tập nhãn đã mô tả | Bắt đầu bằng zero-shot |
> | Định dạng trích xuất còn lệch | Vài ví dụ few-shot có đúng tên trường |
> | Phần tĩnh dài lặp lại ở mọi yêu cầu | Xếp lên đầu, bật prompt caching |
> | Quy trình dùng ở nhiều nơi | Đóng gói thành Skill có người phụ trách |

**Học kỹ domain này**

- [2.1 Chọn model Claude theo đánh đổi](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-1-chon-model) (8 phút đọc)
- [2.2 Thiết kế system prompt, template và guardrail](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-2-system-prompt-va-guardrail) (8 phút đọc)
- [2.3 Zero-shot, few-shot và chain-of-thought](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-3-ky-thuat-prompt) (8 phút đọc)
- [2.4 Tối ưu context window và quản lý token](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-4-context-window-va-token) (8 phút đọc)
- [2.5 Dùng lại prompt bằng caching, module và Skills](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-5-tai-su-dung-prompt) (9 phút đọc)

## Domain 3: Integration

Domain này hỏi cách nối Claude với hệ thống thật: tool, phân quyền, độ trễ, quan sát, RAG và chọn cơ chế tích hợp.

### Tool thừa năng lực: bỏ hẳn

Mỗi tool phải ứng với một nhiệm vụ đã định nghĩa. Agent hỗ trợ khách chỉ cần đọc ticket và soạn trả lời mà lại có tool hoàn tiền và xoá tài khoản: **bỏ hẳn** hai tool đó khỏi cấu hình. Đây là **nguyên tắc quyền tối thiểu** (least privilege).

- Tool trùng chức năng thì gộp; quá nhiều mảng nghiệp vụ trong một agent thì tách agent.
- Giới hạn bằng cấu hình, không bằng lời dặn "đừng dùng tool này".

> **Bẫy đề**
>
> Câu hỏi mẫu của Anthropic: thêm log để kiểm toán sau, giữ tool nhưng thêm bước xác nhận, đổi sang model lớn hơn. Cả ba đều sai. Log chỉ phát hiện sau khi đã lỡ, bước xác nhận chỉ là bù trừ. Bỏ khả năng không cần mới là quyền tối thiểu.

### Xác thực và phân quyền

Hai câu hỏi cho mọi lời gọi: **ai đang gọi**, và **người đó được làm gì**.

- Mỗi người một **token OAuth** có phạm vi quyền hẹp, không dùng chung một API key cho cả công ty.
- Ghi **người khởi tạo** (actor attribution) vào log của mỗi lần gọi tool, để truy được ai đã làm gì.
- **Kiểm quyền ở tầng truy xuất**, trước khi dữ liệu tới model. Đừng đưa hết dữ liệu cho Claude rồi dặn "đừng tiết lộ".
- Credential không bao giờ nằm trong prompt. Token gắn với đúng một server và không chuyển tiếp sang server khác.

### Độ chính xác và độ trễ

Trước hết xác định khách cảm nhận **loại độ trễ** nào:

| Loại | Nghĩa | Quan trọng khi |
| --- | --- | --- |
| Thời gian tới chữ đầu tiên (TTFT) | Bao lâu thì bắt đầu thấy câu trả lời | Trợ lý giọng nói, chat |
| Độ trễ tổng | Bao lâu thì xong cả câu trả lời | Bước nằm giữa một quy trình tự động |
| Tốc độ sinh chữ | Số token đầu ra mỗi giây | Câu trả lời dài |

Giảm độ trễ mà giữ chất lượng: cache phần ổn định và cắt phần thừa (bớt số đoạn truy xuất xuống mức dữ liệu cũ cho thấy là đủ) **trước khi** hạ năng lực model. Chứng minh cấu hình bằng phép đo trên bộ test của mình.

### Quan sát hệ thống ở quy mô lớn

Agent khó quan sát vì một yêu cầu đi qua nhiều lần gọi model và tool lồng nhau. Cần **trace dạng cây** (mỗi bước là một nhánh), không chỉ log phẳng từng dòng.

- Ghi **phiên bản model** ở mỗi bước, để biết lỗi có trùng lúc đổi model không.
- Truyền **mã liên kết** (correlation ID) qua mọi lời gọi agent và tool, để ghép các bước của cùng một yêu cầu.
- Cấu hình tập trung qua managed settings; nội dung prompt mặc định không ghi, chỉ bật khi thật sự cần.

### RAG: chia chunk và đánh chỉ mục

**RAG** (Retrieval-Augmented Generation) là tìm đoạn tài liệu liên quan rồi đưa vào prompt để Claude trả lời dựa trên đó. Kho tài liệu nhỏ (vừa context) thì không cần RAG: đưa cả vào prompt có cache.

**Sơ đồ**
1. **Kho tài liệu**: hướng dẫn sử dụng, quy trình, FAQ
   ↓ _chia chunk theo hình dạng tài liệu: theo mục, theo điều khoản, theo câu hỏi_
2. **Từng chunk, thêm một câu ngữ cảnh**: chunk này thuộc tài liệu nào, phần nào
   ↓ _đánh chỉ mục hai kiểu_
3. **Chỉ mục embedding**: bắt ý diễn đạt khác đi **|** **Chỉ mục BM25**: bắt mã định danh, từ hiếm
   ↓ _khi có câu hỏi: tìm ở cả hai, xếp hạng lại_
4. **Claude trả lời, kèm trích dẫn chunk đã dùng**

- **Contextual retrieval**: chunk cắt ra hay mất ngữ cảnh ("giá trị này" là giá trị gì?). Thêm câu ngữ cảnh cho từng chunk trước khi đánh chỉ mục.
- **Embedding** biến đoạn văn thành vector, tìm theo ý nghĩa. **BM25** tìm theo từ khoá, mạnh với mã sản phẩm, số hiệu.

| Dữ liệu và câu hỏi | Cách truy xuất |
| --- | --- |
| Ý được diễn đạt khác nhau, văn bản tự do | Embedding |
| Mã định danh, từ hiếm | Từ khoá, BM25 |
| Lọc, tổng hợp trên bảng dữ liệu | Truy vấn có cấu trúc (SQL) |
| Trộn lẫn | Hybrid: kết hợp nhiều cách, rồi xếp hạng lại (rerank) |
| Dữ liệu đổi liên tục | Để agent tự tìm bằng tool |

> **Bẫy đề**
>
> Câu hỏi mẫu của Anthropic: RAG bỗng trả lời tự tin mà sai ngay sau một lần làm mới tài liệu, model và độ trễ không đổi. Xem **khâu truy xuất và đánh chỉ mục** trước. Sai: trọng số model tự đổi, temperature quá thấp, context window bị thu nhỏ. Không cái nào vừa thay đổi.

### Chọn cơ chế tích hợp

1. **Một lời gọi đơn giản tới API có sẵn?** → Gọi thẳng API với credential đúng phạm vi
2. **Cần dùng lại ở nhiều client AI khác nhau?** → Dựng MCP server
3. **Việc cần phán đoán của một bên chuyên trách?** → Giao cho agent khác
- **Còn lại** → Kiến thức thủ tục, không cần nối hệ thống sống: đóng gói thành Skill

**MCP** (Model Context Protocol) là chuẩn chung để đưa tool và dữ liệu cho Claude và các client AI khác. Dựng một lần, nhiều nơi dùng.

### Nạp dần hay nạp hết

- **Ít tool, tool nào cũng dùng**: nạp hết định nghĩa và cache.
- **Hàng chục tool, mỗi lần chỉ dùng vài cái**: nạp dần bằng **tool search**. Claude chỉ thấy vài tool hay dùng, các tool khác được tìm và nạp khi cần. Bớt token, phản hồi đầu nhanh hơn, không mất khả năng.
- **Hướng dẫn dài và nhiều**: đóng gói thành Skill, chỉ nạp khi cần.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Agent có tool vượt việc | Bỏ hẳn tool đó khỏi cấu hình |
> | Mọi người dùng chung một API key | Token OAuth theo từng người, phạm vi hẹp |
> | Log không biết ai gọi tool | Ghi người khởi tạo vào log |
> | Trợ lý chat cần nhanh hơn, chất lượng đã đạt | Bớt số đoạn truy xuất, cache phần ổn định |
> | Không truy được lỗi qua nhiều agent | Ghi phiên bản model, truyền mã liên kết |
> | RAG sai sau khi làm mới tài liệu | Xem khâu truy xuất và đánh chỉ mục |
> | Tìm mã sản phẩm chính xác | BM25 hoặc hybrid |
> | Một lời gọi tới HTTP API có sẵn | Gọi thẳng, không thêm lớp |
> | 60 tool, nạp hết làm chậm | Nạp dần bằng tool search |

**Học kỹ domain này**

- [3.1 Đánh giá cấu hình tool bị thừa năng lực](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-1-cau-hinh-thua-nang-luc) (7 phút đọc)
- [3.2 Phân tích xác thực và phân quyền để tìm lỗ hổng](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-2-xac-thuc-va-phan-quyen) (9 phút đọc)
- [3.3 Đánh đổi độ chính xác và độ trễ](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-3-do-chinh-xac-va-do-tre) (8 phút đọc)
- [3.4 Quan sát hệ thống agent ở quy mô lớn](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-4-quan-sat-o-quy-mo-lon) (7 phút đọc)
- [3.5 Thiết kế pipeline RAG, chia chunk và đánh chỉ mục](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-5-rag-chunking-va-index) (9 phút đọc)
- [3.6 Chọn chiến lược truy xuất theo dữ liệu và kiểu câu hỏi](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-6-chien-luoc-truy-xuat) (7 phút đọc)
- [3.7 Chọn cơ chế tích hợp MCP, API/CLI hay agent-to-agent](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-7-chon-co-che-tich-hop) (8 phút đọc)
- [3.8 Nạp dần hay nạp hết context](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-8-nap-dan-hay-nap-het) (7 phút đọc)

## Domain 4: Evaluation, Testing & Optimization

Domain này hỏi cách đo một hệ thống dùng Claude: đo cái gì, bằng bộ dữ liệu nào, so sánh hai phiên bản ra sao, tìm lỗi và tối ưu chi phí.

### Chỉ số: mỗi ràng buộc một chỉ số, một ngưỡng

Mỗi yêu cầu đề nêu (chính xác, nhanh, rẻ, an toàn) phải có một chỉ số đo **thẳng** nó và một ngưỡng đạt.

| Cần đo | Chỉ số |
| --- | --- |
| Phân loại vào nhãn cố định | Khớp chính xác, F1 |
| Tóm tắt so với bản mẫu | ROUGE-L |
| Giọng văn, mức đồng cảm | LLM chấm theo thang có rubric |
| Độ trễ | Nói rõ đồng hồ nào (TTFT hay tổng) và phân vị nào: **p50** (một nửa số yêu cầu nhanh hơn mức này), **p95** (95% số yêu cầu nhanh hơn) |
| Chi phí | Chi phí trên mỗi việc xong, so với mức trần |
| An toàn, bảo mật | Tỉ lệ, đo trên bộ dữ liệu tấn công (red-team) |

> **Bẫy đề**
>
> Độ tương đồng giữa các câu trả lời chỉ cho biết chúng **giống nhau**, không cho biết chúng **đúng**. Trợ lý sai một cách nhất quán vẫn được điểm cao. Muốn đo đúng thì so với đáp án chuẩn.

### Bộ dữ liệu đánh giá

Thứ tự: định nghĩa chỉ số và **lát cắt** sẽ báo cáo (ca đại diện, ca biên, ca tấn công) → chọn và gắn nhãn dữ liệu khớp các lát cắt → chạy → chấm.

| Chấm bằng | Khi nào |
| --- | --- |
| Code | Đáp án kiểm được bằng luật: nhanh, đáng tin nhất |
| LLM có rubric | Cần sắc thái; kiểm độ tin cậy của bộ chấm trước khi dùng rộng |
| Người | Để hiệu chỉnh bộ chấm LLM; chậm và đắt |

Ba loại kiểm thử phối hợp: **hồi quy** (bắt ca từng đạt nay hỏng sau khi sửa prompt), **tấn công** (prompt injection, đầu vào dị dạng), **tích hợp** (đúng khi đi qua nhiều thành phần). Chạy lặp lại nhiều lần vì kết quả model có dao động.

### A/B test

Chốt **trước khi chạy**: giả thuyết, chỉ số thành công chính, **hiệu ứng tối thiểu** muốn phát hiện, và **cỡ mẫu** cần có. Mỗi lần chỉ đổi một biến, giữ nguyên mọi thứ khác. So offline trên bộ đánh giá trước, rồi mới thử với người dùng thật. Đọc kết quả theo từng nhóm người dùng, không chỉ con số tổng. Đưa lên hay quay lui bằng phiên bản đã ghim.

### Chẩn đoán sự cố

Câu hỏi đầu tiên luôn là: **cái gì vừa thay đổi**? Tầng nào không đổi thì tạm loại.

**Sơ đồ**
1. **Triệu chứng**: trả lời sai, định dạng hỏng, gọi sai tool
   ↓ _cái gì đã đổi ngay trước khi lỗi xuất hiện?_
2. **Truy xuất**: tài liệu vừa làm mới **|** **Prompt**: template vừa sửa **|** **Tool**: định nghĩa vừa đổi **|** **Model**: vừa đổi model hay effort
   ↓ _khoanh lỗi vào một tầng_
3. **So với bản tốt gần nhất, chạy lại yêu cầu cũ, thử trên phiên bản model trước**

- JSON hỏng sau đợt bảo trì: so prompt và schema hiện tại với bản tốt gần nhất, chạy lại yêu cầu cũ, xem đầu ra thô trước khi parse.
- Trợ lý nói ngược tài liệu dù truy xuất không đổi: thử trên phiên bản model trước, xem lại chỉ dẫn bám tài liệu trong system prompt.
- Ước lượng quy mô lỗi bằng một mẫu trước khi kết luận.

### Tối ưu chi phí và độ trễ

1. **Chưa đo chi phí trên mỗi việc xong và tỉ lệ đọc cache?** → Đo trước
2. **Phần lặp lại chưa cache, có việc không ai chờ?** → Bật caching, đưa việc đó vào batch
3. **Vẫn vượt ngân sách?** → Hạ effort, rồi mới đổi model rẻ hơn, đo lại chất lượng
- **Còn lại** → Đặt trần chi tiêu và theo dõi

Câu đơn giản có thể định tuyến sang model nhỏ, nhanh; giữ model đầy đủ cho ca phức tạp. Cách này giảm được cả chi phí lẫn độ trễ p95.

### Giám sát khi chạy thật

Chốt trước khi gắn đo: chỉ số, lát cắt (lưu lượng thường và lưu lượng tấn công), **SLO** (mục tiêu nội bộ, ví dụ p95 dưới 2 giây) và **error budget** (mức vi phạm được phép trong một khoảng thời gian). Sau đó mới bật exporter, dựng dashboard, chỉnh ngưỡng cảnh báo. Dùng trace để biết thời gian đi đâu; mỗi lần đổi model, đo lại chất lượng trên một bộ test cố định.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Ràng buộc chi phí và quyền truy cập | Chi phí mỗi truy vấn so với trần; tỉ lệ kiểm quyền đúng trên dữ liệu red-team |
> | Việc trước khi chạy bộ đánh giá | Định nghĩa chỉ số và lát cắt; gắn nhãn dữ liệu khớp lát cắt |
> | Ca từng đạt nay hỏng sau khi sửa prompt | Kiểm thử hồi quy |
> | Việc trước khi chạy A/B test | Giả thuyết và chỉ số chính; hiệu ứng tối thiểu và cỡ mẫu |
> | JSON hỏng sau bảo trì | So với bản tốt gần nhất, chạy lại yêu cầu cũ |
> | Vượt chi phí, độ chính xác phải giữ | Cache phần tĩnh và đoạn truy xuất dùng lại |
> | Việc trước khi gắn đo | Chỉ số và lát cắt; SLO và error budget |

**Học kỹ domain này**

- [4.1 Định nghĩa chỉ số đánh giá](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-1-chi-so-danh-gia) (8 phút đọc)
- [4.2 Thiết kế bộ dữ liệu đánh giá và khung kiểm thử](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-2-bo-du-lieu-danh-gia) (8 phút đọc)
- [4.3 A/B test và cải tiến lặp](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-3-ab-test-va-cai-tien) (7 phút đọc)
- [4.4 Chẩn đoán sự cố của hệ thống dùng Claude](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-4-chan-doan-su-co) (9 phút đọc)
- [4.5 Tối ưu token, độ trễ và chi phí so với hiệu năng](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-5-toi-uu-chi-phi-va-do-tre) (7 phút đọc)
- [4.6 Giám sát hiệu năng bằng log và công cụ quan sát](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-6-giam-sat-van-hanh) (8 phút đọc)

## Domain 5: Governance, Safety & Risk Management

Domain này hỏi cách giữ hệ thống an toàn: chặn tấn công, nhận ra kiểu hỏng của LLM, đặt người duyệt đúng chỗ, và tuân thủ quy định.

### Guardrail nhiều lớp

Bắt đầu bằng câu hỏi: ai là kẻ tấn công, họ muốn gì. Rồi xếp nhiều lớp, không dựa vào một lớp nào:

**Sơ đồ**
1. **Đầu vào của người dùng**
   ↓ _lớp 1: sàng lọc đầu vào, phát hiện lời vượt quyền_
2. **Claude với system prompt**: coi nội dung người dùng là dữ liệu, không phải lệnh
   ↓ _lớp 2: quyền tool giới hạn theo phạm vi, áp trước khi tool chạy_
3. **Tool và dữ liệu**
   ↓ _lớp 3: kiểm đầu ra, chặn nội dung cấm_
4. **Câu trả lời cho người dùng**

> **Bẫy đề**
>
> Người dùng tự xưng quyền quản trị và bảo model vượt giới hạn. Sai: tin model tự nhận ra mọi kiểu vượt rào; bỏ hết giới hạn; ghi log rồi xem lại sau. Đúng: phòng thủ nhiều lớp như sơ đồ trên.

### Kiểu hỏng riêng của LLM

Ngoài lỗi hạ tầng thường gặp (chứng chỉ hết hạn, mất kết nối), LLM có kiểu hỏng riêng:

- **Bịa** (hallucination): câu trả lời nghe hợp lý nhưng không tài liệu nào hỗ trợ.
- **Từ chối nhầm**: từ chối câu hỏi hợp lệ vì nó giống bề ngoài một mẫu không an toàn.
- **Làm theo nội dung đọc được** (prompt injection): email hay trang web chứa lệnh, model làm theo.
- **Trôi** trong hội thoại dài: quên luật đã đặt ở đầu.

Đánh giá rủi ro theo thứ tự: xác định **tài sản** hệ thống chạm tới và mức nhạy cảm → liệt kê **kẻ tấn công và đường tấn công** → đề xuất biện pháp → chấp nhận rủi ro còn lại. Thiết kế sao cho khi một lớp phòng thủ thất bại, thiệt hại vẫn nhỏ.

### Người duyệt trong vòng lặp

- Đặt người ở điểm **ảnh hưởng lớn** hoặc **khó đảo ngược** (từ chối khoản vay, gửi thông báo pháp lý).
- Giao việc theo **loại rủi ro**, không chỉ theo số tiền.
- Phần rủi ro cao duyệt hết; phần còn lại lấy mẫu một tỉ lệ nhỏ.
- Tiêu chí chuyển cho người phải kiểm được, không mơ hồ kiểu "khi thấy cần".

### Tuân thủ quy định

Trước khi đối chiếu: xác định quy định nào **áp dụng** (theo loại dữ liệu, khu vực, đối tượng), và kiểm kê công cụ tuân thủ nhà cung cấp có, cái nào **đã bật**.

| Quy định | Nhớ |
| --- | --- |
| **HIPAA** (dữ liệu sức khoẻ ở Mỹ) | Cần **BAA** (thoả thuận với nhà cung cấp) cộng cấu hình HIPAA cho organization; tính năng không đủ điều kiện bị chặn |
| **ZDR** (Zero Data Retention) | Không lưu prompt và câu trả lời sau khi xử lý; không chặn tính năng, chỉ không áp cho tính năng ngoài danh sách |
| **GDPR** (dữ liệu cá nhân ở EU) | Đủ cả bốn: DPA đã ký, cấu hình lưu giữ, che dữ liệu cá nhân không cần, quy trình xử lý quyền chủ thể dữ liệu |
| **FedRAMP** (cơ quan liên bang Mỹ) | Kiểm chứng nhận của nhà cung cấp cloud nơi chạy Claude |

Kiểm quyền và audit log luôn là việc của ứng dụng, nhà cung cấp không làm thay.

### Đạo đức AI

- Thiên lệch có thể đến từ model, prompt, tài liệu và cách đánh giá, nên phải **đo**: chênh lệch kết quả giữa các nhóm, chênh lệch tỉ lệ sai, kết quả có đổi khi đổi cách diễn đạt không.
- Con người chịu trách nhiệm với quyết định ảnh hưởng lớn.
- **Minh bạch**: cho người dùng biết AI đã được dùng, kèm đường liên hệ người thật.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Người dùng tự xưng quản trị để vượt rào | Phòng thủ nhiều lớp |
> | Không được đưa khuyến nghị đầu tư | Bộ phân loại ở đầu ra, phạm vi cấm rõ trong system prompt |
> | Kiểu hỏng riêng của LLM | Bịa, từ chối nhầm (không phải lỗi TLS hay mất kết nối) |
> | Việc trước khi đánh giá mối đe doạ | Xác định tài sản; liệt kê kẻ tấn công và đường tấn công |
> | Việc trước khi chạy thử quy trình có người duyệt | Điểm cần người theo ảnh hưởng và khả năng đảo ngược; cách lấy mẫu và tiêu chí chuyển |
> | Dữ liệu bệnh nhân theo HIPAA | Kiểm quyền theo vai trò; không gửi dữ liệu khi chưa có BAA |
> | Có nghĩa vụ GDPR | Đủ bốn: DPA, cấu hình lưu giữ, che dữ liệu, quy trình quyền chủ thể |
> | Minh bạch với khách | Công bố có dùng AI, kèm đường liên hệ người thật |

**Học kỹ domain này**

- [5.1 Triển khai guardrail và kiểm soát an toàn](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-1-guardrail-va-kiem-soat) (10 phút đọc)
- [5.2 Nhận diện rủi ro, giới hạn và kiểu hỏng của hệ thống LLM](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-2-rui-ro-va-cach-hong) (7 phút đọc)
- [5.3 Áp dụng người duyệt trong vòng lặp](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-3-nguoi-duyet-trong-vong-lap) (8 phút đọc)
- [5.4 Bảo đảm tuân thủ quy định như GDPR, HIPAA, FedRAMP](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-4-tuan-thu-quy-dinh) (9 phút đọc)
- [5.5 Đạo đức AI, gồm thiên lệch, công bằng và minh bạch](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-5-dao-duc-ai) (8 phút đọc)

## Domain 6: Stakeholder Communication & Lifecycle Management

Domain này hỏi phần "mềm" của kiến trúc sư: lấy yêu cầu, trình bày quyết định, thương lượng SLA, viết tài liệu, và theo dự án qua cả vòng đời.

### Vòng đời một giải pháp

Mỗi giai đoạn giao cho giai đoạn sau một thứ dùng được:

**Sơ đồ**
1. **Khảo sát**: tiêu chí thành công kèm ngưỡng thất bại
2. **Thiết kế**: kiến trúc kèm ADR ghi lý do từng quyết định
3. **Bàn giao**: gói tài liệu kèm bộ đánh giá để đội triển khai tự kiểm
4. **Giám sát**: số đo khi chạy thật
5. **Cải tiến**: sửa tại chỗ, hoặc quay lại thiết kế

Chỉ quay lại thiết kế khi yêu cầu mới buộc **đổi trách nhiệm của thành phần** hoặc **hợp đồng cốt lõi** giữa các thành phần. Sửa câu chữ, chỉnh ngưỡng báo động thì làm trong vòng cải tiến. Model bên dưới sắp ngừng: chạy bộ đánh giá với model thay thế, chuyển trước ngày ngừng.

### Khảo sát yêu cầu

- Yêu cầu mơ hồ thì **khảo sát trước**: workshop với các bên để làm rõ ràng buộc về độ trễ, độ chính xác, tuân thủ.
- Phân biệt yêu cầu **chức năng** (hệ thống làm gì: trích trường, phân loại ticket) và **phi chức năng** (làm tốt đến đâu: p95 dưới 800 ms, chịu được bao nhiêu yêu cầu).
- Viết tiêu chí thành công đo được kèm **ngưỡng thất bại**, làm điều kiện để đưa vào production.
- Chủ động tìm yêu cầu chưa ai nói ra; viết bài kiểm nghiệm thu trước khi có code.

### Trình bày quyết định cho người nghe hỗn hợp

Mở bằng **quyết định, kết quả kinh doanh và đánh đổi đã chấp nhận**, rồi mới tới phần riêng của từng người:

| Người nghe | Cần thấy |
| --- | --- |
| Người tài trợ dự án | Quyết định, kết quả kinh doanh, đánh đổi |
| Tài chính | Chi phí trên mỗi việc xong, trần chi tiêu |
| Bảo mật, tuân thủ | Mô hình đe doạ, kiểm soát ứng với từng yêu cầu, rủi ro còn lại và ai chấp nhận |
| Đội kỹ thuật | Lý do kỹ thuật, phương án thay thế, việc phải làm khi triển khai |

Ghi lại các **phương án đã cân nhắc** kèm tiêu chí đánh giá, **người phụ trách** quyết định và **lúc xem lại** khi giả định thay đổi. Chứng minh bằng số đo trên dữ liệu của mình.

### SLA và kỳ vọng của các bên

**SLA** có ý nghĩa phải đủ bốn phần: **chỉ số, ngưỡng, khoảng thời gian tính, việc phải làm khi vi phạm**. Ví dụ: "p95 độ trễ dưới 800 ms trong cửa sổ 28 ngày; vi phạm thì giảm phí".

- SLA bạn hứa không thể mạnh hơn cam kết bạn nhận từ Claude API, trừ khi có đường lùi. **Rate limit** là mức tối đa được gọi, không phải bảo đảm.
- Các bên lo lắng: đưa số đo p50, p95 thật, rồi cùng họ sửa mục tiêu.
- Yêu cầu phát sinh giữa chừng: ghi nhận, nói rõ tác động lên phạm vi và tiến độ, đưa lựa chọn (hoãn, bớt việc khác, giãn tiến độ) để họ quyết.
- Buổi phản hồi: có chương trình, gửi tài liệu trước, ghi quyết định, chốt người phụ trách và hạn.

### Tài liệu kiến trúc và bàn giao

Trước khi viết: xác định **người đọc** và câu hỏi họ cần trả lời, rồi lập khung các phần.

- **ADR** (Architecture Decision Record): mỗi quyết định một bản ghi gồm bối cảnh, các phương án, quyết định, hệ quả.
- **Runbook** cho người trực đủ bốn phần: báo động nào, kiểm tra gì, chuyển lên cho ai, quay lại (rollback) thế nào.
- **Gói bàn giao** để đội triển khai tự xây và tự trực: tổng quan kiến trúc, ADR, hợp đồng giữa các thành phần, bộ đánh giá kèm mẫu tham chiếu, runbook, giới hạn đã biết.

> **Bẫy đề**
>
> Đáp án sai hay là một bộ **thiếu một mảnh**: SLA không có khoảng thời gian, runbook không có cách quay lại, gói bàn giao không có hợp đồng thành phần. Đọc kỹ từng mảnh trước khi chọn.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Giai đoạn khảo sát | Workshop làm rõ ràng buộc; tiêu chí thành công kèm ngưỡng thất bại |
> | Yêu cầu phi chức năng | Cam kết về hiệu năng, như p95 dưới 800 ms |
> | Trình bày cho người tài trợ và đội kỹ thuật | Quyết định, kết quả, đánh đổi trước; lý do kỹ thuật sau |
> | Truyền đạt quyết định tốt | Ghi phương án đã cân nhắc kèm tiêu chí; người phụ trách và nhịp xem lại |
> | SLA có ý nghĩa | Chỉ số, ngưỡng, khoảng thời gian, việc khi vi phạm |
> | Yêu cầu phát sinh lớn | Nói rõ tác động, đưa lựa chọn để bên liên quan quyết |
> | Việc trước khi viết tài liệu | Xác định người đọc; lập khung các phần |
> | Khi nào thiết kế lại | Phải đổi trách nhiệm thành phần hay hợp đồng cốt lõi |

**Học kỹ domain này**

- [6.1 Khảo sát có cấu trúc và thu thập yêu cầu](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-1-khao-sat-yeu-cau) (7 phút đọc)
- [6.2 Trình bày quyết định kiến trúc và các đánh đổi](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-2-trinh-bay-quyet-dinh) (14 phút đọc)
- [6.3 Vòng phản hồi, kỳ vọng của các bên và SLA](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-3-ky-vong-va-sla) (12 phút đọc)
- [6.4 Viết tài liệu kiến trúc và hướng dẫn triển khai](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-4-tai-lieu-kien-truc) (12 phút đọc)
- [6.5 Đồng hành qua các giai đoạn của vòng đời giải pháp](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-5-vong-doi-du-an) (10 phút đọc)

## Domain 7: Developer Productivity & Operational Enablement

Domain này hỏi cách đưa Claude Code vào một đội: cấu hình chung, quy trình làm việc với AI, và gỡ lỗi khi Claude Code chạy không như ý.

### Năm nơi đặt cấu hình Claude Code

Cấu hình đặt ở năm nơi. Cùng một thiết lập mà hai nơi ghi khác nhau thì nơi có thứ hạng cao hơn thắng:

| Thứ hạng | Nơi đặt | Dùng cho |
| --- | --- | --- |
| 1 (cao nhất) | Managed settings | Thứ tổ chức áp xuống, không ai tắt được |
| 2 | Tham số dòng lệnh | Chỉ cho lần chạy này |
| 3 | `.claude/settings.local.json` | Riêng một người trong một repo, không commit |
| 4 | `.claude/settings.json` và `.mcp.json` | Chung cả nhóm, commit vào repo |
| 5 (thấp nhất) | `~/.claude/settings.json` | Sở thích cá nhân ở mọi repo |

- **Luật quyền** có ba loại: `allow` (cho phép), `ask` (hỏi trước), `deny` (cấm). Mảng luật ở các nơi được **gộp lại**, và **deny luôn thắng**.
- Luật quyền viết hẹp đúng việc, kèm deny rõ cho thao tác nhạy cảm (đọc file `.env`, `git push --force`).
- Cờ bảo mật không ai được tắt: đưa vào **managed settings**. User scope, project scope, biến môi trường đều có đường vòng.
- **`CLAUDE.md`** là hướng dẫn (quy ước, kiến trúc), không phải cơ chế ép buộc. Thứ bắt buộc thì dùng luật quyền hoặc hook.

### Đưa AI vào quy trình lập trình

Trước khi chạy thử: vẽ rõ bước nào AI làm, bước nào người quyết, và chuẩn bị cấu hình project (MCP server, luật quyền, subagent).

- Một phiên làm việc tốt đi theo: **khám phá → lập kế hoạch → làm → kiểm**, và cho Claude một cách tự kiểm (test, lệnh build).
- Việc lặp lại thì đóng gói: quy ước vào `CLAUDE.md`, quy trình vào skill, **việc chuyên biệt lặp lại** (review schema cơ sở dữ liệu) vào subagent có prompt và quyền riêng, **việc luôn phải xảy ra** (chạy lint sau khi sửa) vào hook.
- Vào CI: Claude đăng nhận xét, **người vẫn approve**. Không bỏ review vì code do AI viết.
- Chạm hệ thống thật (cơ sở dữ liệu production): **chỉ đọc** là mặc định.

### Gỡ lỗi Claude Code

Bắt đầu bằng câu hỏi "cái gì đã được nạp": `/context`, rồi `/permissions`, `/hooks`, `/mcp`, `/status`.

MCP server hỏng có ba trạng thái: **chờ duyệt** (server mới trong `.mcp.json` chưa được người dùng chấp nhận), **không khởi động được**, và **kết nối mà 0 tool**.

1. **Lỗi biến mất khi chạy claude --safe-mode?** → Bật lại từng thứ đã tắt: CLAUDE.md, hook, MCP, skill
2. **Lỗi biến mất với cấu hình sạch?** → Chép dần cấu hình cũ vào cho tới khi lỗi quay lại
3. **Vẫn lỗi với cấu hình sạch?** → Xem /status, biến môi trường
- **Còn lại** → Ghi lại ca tái hiện tối giản rồi mới báo hỗ trợ

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Thứ tự ưu tiên cấu hình | Managed > dòng lệnh > local > project > user |
> | Cả nhóm dùng chung MCP server | `.claude/settings.json` và `.mcp.json` commit vào repo |
> | Cờ bảo mật không ai được tắt | Managed settings |
> | Việc trước khi chạy thử với nhóm nhỏ | Cấu hình nền ở project scope; ranh giới managed và project |
> | Việc chuyên biệt lặp lại | Subagent riêng: prompt tập trung, quyền hẹp |
> | MCP server mới không hiện | Kiểm đã đăng ký chưa, rồi kết nối lại phiên |
> | Phiên nạp 60 tool MCP, tốn token | Bật tool search |
> | Bộ công cụ chẩn đoán | Ca tái hiện tối giản, đổi mỗi lần một yếu tố; xem trạng thái MCP server |

**Học kỹ domain này**

- [7.1 Cấu hình Claude Code cho cả đội](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/7-1-cau-hinh-claude-code-cho-team) (10 phút đọc)
- [7.2 Cải thiện quy trình lập trình bằng công cụ AI](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/7-2-quy-trinh-lap-trinh-voi-ai) (11 phút đọc)
- [7.3 Gỡ lỗi và xử lý sự cố vận hành Claude Code](https://anthropic.cloudexam.pro/kien-thuc/ccar-p/7-3-go-loi-va-su-co) (11 phút đọc)

## Mẹo chọn đáp án khi phân vân

Học xong bảy domain, bạn sẽ thấy các câu hỏi lặp lại vài quy tắc. Phân vân giữa hai đáp án thì áp lần lượt:

1. **Ràng buộc cứng xét trước.** SLA, bảo mật, pháp lý loại phương án trước khi cân chi phí hay chất lượng.
2. **Câu hỏi "trước khi X" thì chọn bước chuẩn bị.** Loại những bước cần kết quả của X mới làm được: phân tích kết quả, dựng dashboard, chỉnh theo kết quả chạy thử.
3. **Bỏ khả năng không cần, đừng chỉ canh chừng nó.** Tool vượt việc thì bỏ hẳn; log và bước xác nhận chỉ là bù trừ.
4. **Giải đủ mọi mục tiêu đề nêu mà không hy sinh thứ phải giữ.** Cần giảm chi phí mà độ chính xác không đổi thì cache, không cắt nội dung hay hạ model.
5. **Tìm thứ vừa thay đổi.** Lỗi xuất hiện ngay sau một thay đổi thì xem chỗ đó trước.
6. **Số đo thắng cảm nhận.** Đánh giá trên dữ liệu thật, đưa p50 và p95; không chọn theo kinh nghiệm dự án cũ hay bảng xếp hạng.
7. **Chọn bộ đủ mảnh.** Đáp án sai thường thiếu đúng một mảnh.
8. **Loại đáp án cực đoan.** Tắt hết, dừng mọi việc, cấp quyền không giới hạn, cài lại hệ điều hành, đổi model mà không đánh giá.
9. **Người giữ quyết định ở chỗ rủi ro cao.** AI đăng nhận xét, người approve.

## Tên trong đề và tên hiện nay

Đề thi được soạn từ tháng 07/2026, nên vài chỗ đã khác docs hiện nay. Khi luyện và khi thi, chọn theo cách đề chấm; khi làm thật, theo docs.

| Trong đề | Hiện nay |
| --- | --- |
| Triển khai HIPAA đúng là Enterprise, BAA, ZDR và audit log | HIPAA readiness là BAA cộng cấu hình HIPAA cho organization; ZDR là thoả thuận riêng, không bắt buộc. Đề chấm phương án đầy đủ nhất |
| FedRAMP như một yêu cầu Claude đáp ứng | Trang chứng nhận của Anthropic không liệt kê FedRAMP; kiểm FedRAMP của nhà cung cấp cloud |
| Giao thức agent-to-agent | Docs Anthropic không định nghĩa giao thức riêng; giao việc cho agent khác thường là subagent hoặc Managed Agents |
| Claude Code chưa bật Tool Search nên nạp hết định nghĩa tool MCP | Claude Code bật tool search mặc định; tắt khi `ENABLE_TOOL_SEARCH=false` hay vài cấu hình khác |

## Nguồn

1. [Exam Guide CCAR-P v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Models overview (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/overview)
3. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
4. [API and data retention (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
5. [Claude Code settings (Claude Code Docs)](https://code.claude.com/docs/en/settings)
