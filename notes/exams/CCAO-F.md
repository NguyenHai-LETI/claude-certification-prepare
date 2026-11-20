---
title: "CCAO-F · Claude Certified Associate – Foundations"
exams: [CCAO-F]
---

# CCAO-F · Claude Certified Associate – Foundations

Ghi chú theo **Exam Guide v1.0 (Effective July 2026)**. Mỗi domain trong guide là danh sách các task ứng viên phải làm được; đề viết câu hỏi theo đúng các task này.

## Thông tin đề

| Mục | Giá trị (guide v1.0) |
|---|---|
| Mã đề | CCAO-F |
| Số câu | 60 |
| Dạng câu | Multiple-choice và multiple-response; mỗi câu ghi rõ chọn mấy đáp án |
| Thời gian | 120 phút |
| Hình thức | Proctored online (OnVUE) hoặc test center Pearson VUE |
| Điểm đạt | Scaled **720** / 100–1.000 |
| Lệ phí | 99 USD (trước giảm giá partner tier) |
| Hiệu lực | 12 tháng |
| Báo kết quả | Pass/fail, scaled score, % đúng theo domain |

- Xác nhận khả năng dùng Claude hoàn thành việc nghiệp vụ và năng suất **với ít hướng dẫn**: dùng tính năng có sẵn, tìm chỗ cải tiến quy trình, chọn cách làm cân bằng chất lượng / hiệu quả / chi phí, **nhận ra giới hạn và chuyển việc phức tạp, kỹ thuật cho Architect và Developer**.
- Đối tượng: người dùng Claude như công cụ năng suất và tự dựng Claude Projects: vận hành, marketing, quản lý dự án, giáo dục, truyền thông, knowledge worker; cả nhân sự nội bộ lẫn consultant bên ngoài. Trình độ kỹ thuật thấp đến trung bình. **Không** dành cho developer làm việc với API hay thiết kế hệ agentic.
- MQC (minimally qualified candidate): vượt mức hỏi–đáp đơn giản sang thiết kế lại quy trình, tự động hoá việc, phát triển dự án; quen Projects, Artifacts, tương tác theo workflow; hiểu bối cảnh tổ chức, rủi ro triển khai, responsible AI.
- Khuyến nghị (không bắt buộc): dùng Claude thường xuyên trong công việc; tư duy giải quyết vấn đề có cấu trúc, thiết kế workflow; hiểu giới hạn AI (hallucination, giới hạn context, dữ liệu nhạy cảm). **Không cần** kinh nghiệm lập trình hay API.
- Theo trang Partner Certifications, Associate – Foundations **không tính** vào điều kiện tier của Claude Partner Network.
- Guide có 3 câu mẫu (pack `official`: OF-CCAOF-01…03).

Nguồn: [CCAO-F Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §1–5; [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications)

## Thay đổi từ 07/12/2026

Pearson VUE thông báo đề **Associate – Foundations có nội dung cập nhật từ 07/12/2026**, guide mới phát hành 17/11/2026. Chưa đọc được guide mới từ nguồn chính thức (trang Partner Certifications ngày 18/11/2026 vẫn trỏ tới v1.0), nên chưa rõ khác biệt. FAQ chính thức hiện gọi đề này là "Claude Certified Associate" (không kèm "– Foundations"); Pearson gọi vai trò là "Practitioner". Thi trước 07/12/2026 thì dùng v1.0.

Nguồn: [Pearson VUE – Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html); [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications)

## D1 · Prompting and Task Execution (14%)

Task theo guide:

- Viết prompt hiệu quả cho việc nghiệp vụ và kỹ thuật.
- Phân rã task để cấu trúc yêu cầu phức tạp.
- Lặp lại prompt để nâng chất lượng output.
- Đổi chiến lược prompt theo loại việc: **phân tích, nghiên cứu, soạn thảo, brainstorm**.

### Cần nắm chắc

- Prompt tốt gồm: mục tiêu và bối cảnh (ai đọc, dùng làm gì), dữ liệu/tài liệu nguồn, ràng buộc (độ dài, giọng, định dạng), ví dụ mẫu, tiêu chí "thế nào là xong".
- Việc lớn → chia bước (dàn ý → bản nháp → rà soát), mỗi bước kiểm tra trước khi đi tiếp.
- Lặp có chẩn đoán: xác định output sai ở đâu (thiếu bối cảnh? mơ hồ? sai định dạng?) rồi sửa đúng phần đó, không viết lại ngẫu nhiên.
- Brainstorm: xin nhiều phương án đa dạng; phân tích/nghiên cứu: yêu cầu dẫn nguồn, nêu giả định; soạn thảo: chỉ rõ người đọc và giọng văn.

### Bẫy thường gặp

- Một prompt khổng lồ cho việc nhiều giai đoạn.
- Sửa prompt bằng cách thêm "hãy làm tốt hơn" thay vì bổ sung bối cảnh / ví dụ cụ thể.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 1; [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview); [AI Fluency: Framework and foundations](https://academy.claude.com/courses/ai-fluency-framework-foundations)

## D2 · Output Evaluation and Validation (21%)

Domain nặng nhất (~13 câu / 60). Task theo guide:

- Đánh giá output về **độ chính xác và đầy đủ**.
- Nhận diện **hallucination, mâu thuẫn, thiên lệch (bias)**.
- Áp dụng kỹ thuật fact-check và validate.
- Xác định khi nào **cần người review hoặc kiểm chứng thêm**.
- Sửa, điều chỉnh, tinh chỉnh, so sánh output cho đúng người đọc.
- Tổ chức thông tin và chọn định dạng output phù hợp (**artifact, inline, structured data**).

### Cần nắm chắc

- Chi tiết "trông rất cụ thể" (số điều luật, trích dẫn, số liệu, tên người) là nơi hallucination hay xuất hiện → đối chiếu **nguồn gốc có thẩm quyền** trước khi gửi đi, nhất là cho đối tượng compliance / pháp lý / khách hàng.
- **Độ tự tin của model không phải bằng chứng đúng**; tự chấm điểm confidence cũng không.
- Mức kiểm chứng tỉ lệ với rủi ro: nội dung đối ngoại, pháp lý, tài chính, y tế, quyết định khó đảo ngược → người có chuyên môn review.
- Chọn định dạng: artifact cho nội dung dài / tái sử dụng / chỉnh sửa (tài liệu, code, sơ đồ); inline cho câu trả lời ngắn; structured data (bảng, JSON) cho dữ liệu xử lý tiếp.

### Bẫy thường gặp

- "Gửi luôn vì Claude rất chắc chắn"; hỏi Claude tự đánh giá độ tự tin rồi gửi (câu mẫu 1).
- Sửa văn phong cho trang trọng nghĩ là đã kiểm tra nội dung.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 2, §8; [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations); [What are artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)

## D3 · Product and Model Selection (12%)

Task theo guide:

- Chọn đúng tính năng sản phẩm: **Projects, research mode, chat, artifacts**.
- Phân biệt các loại model: **Haiku, Sonnet, Opus**.
- Chọn model theo yêu cầu việc: **chi phí, tốc độ, chất lượng**.
- Hiểu và quản lý giới hạn context và bộ nhớ: **khi nào bắt đầu lại, tóm tắt, hay lưu lại (persist)**.

### Cần nắm chắc

- Projects: không gian có chỉ dẫn riêng + kho kiến thức, dùng cho công việc lặp lại / theo nhóm. Research: tìm kiếm nhiều bước, có trích dẫn, cho câu hỏi cần thông tin mới/rộng. Chat: việc nhanh, một lần. Artifacts: sản phẩm độc lập để xem, sửa, chia sẻ.
- Haiku: nhanh, rẻ, khối lượng lớn, việc đơn giản. Sonnet: cân bằng cho phần lớn công việc. Opus: suy luận phức tạp, nhiều bước, chất lượng cao nhất.
- Hội thoại quá dài, lạc đề, model bắt đầu "quên" → tóm tắt điểm chính rồi mở cuộc mới; thông tin dùng lại lâu dài → đưa vào Project knowledge / instructions hoặc memory.

### Bẫy thường gặp

- Luôn dùng model mạnh nhất cho mọi việc (lãng phí chi phí và thời gian) (câu mẫu 2).
- Kéo một cuộc chat rất dài thay vì tóm tắt và bắt đầu lại.
- Tắt hết tính năng để "tiết kiệm", đổi sang nền tảng khác: không giải quyết tradeoff.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 3, §8; [What are Projects](https://support.claude.com/en/articles/9517075-what-are-projects); [Use Research on Claude](https://support.claude.com/en/articles/11088861-use-research-on-claude); [Chat search and memory](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context); [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)

## D4 · Workflow Integration and Solution Design (16%)

Task theo guide:

- Dùng Claude phân tích yêu cầu và use case.
- Dùng Claude cho nghiên cứu, lập kế hoạch, tối ưu quy trình.
- Dùng Claude hỗ trợ thiết kế giải pháp, phát triển, lặp cải tiến.
- Tích hợp Claude vào workflow hiện có để **tăng cường hoặc thiết kế lại**.
- **Truyền đạt giá trị và giới hạn** của Claude cho các bên liên quan.

### Cần nắm chắc

- Quyết định bước nào giao cho Claude, bước nào giữ cho người (phán đoán, phê duyệt, trách nhiệm).
- Bắt đầu từ việc lặp lại nhiều, đo được kết quả; thử nghiệm nhỏ → đo → mở rộng.
- Nói với stakeholder trung thực: lợi ích cụ thể + giới hạn (hallucination, cần review, dữ liệu nhạy cảm), không hứa quá.
- Việc vượt phạm vi Associate (tích hợp API, hệ agentic, kiến trúc doanh nghiệp) → **escalate cho Architect/Developer**.

### Bẫy thường gặp

- Tự động hoá trọn quy trình nhạy cảm mà không có điểm kiểm duyệt của người.
- Trình bày Claude như thứ "luôn đúng" để thuyết phục stakeholder.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §1, §6 Domain 4; [Building effective human-agent teams](https://academy.claude.com/courses/building-effective-human-agent-teams)

## D5 · Configuration and Knowledge Management (12%)

Task theo guide:

- Cấu hình **Claude Projects** với chỉ dẫn và nguồn kiến thức.
- Quản lý kiến thức tải lên và **connectors** (vd. Google Drive, Gmail).
- Viết chỉ dẫn cấp hệ thống (system-level instructions) hiệu quả.
- Cập nhật, duy trì cấu hình, nguồn kiến thức, chỉ dẫn.

### Cần nắm chắc

- Project instructions = "system prompt" của Project: vai trò, đối tượng, giọng văn, định dạng, quy tắc luôn áp dụng.
- Knowledge: tài liệu tham chiếu ổn định; connector: dữ liệu sống từ hệ thống khác (Drive, Gmail…) thay vì tải bản sao lỗi thời.
- Cấu hình phải được bảo trì: tài liệu cũ, chỉ dẫn mâu thuẫn làm output sai → rà định kỳ, gỡ bản lỗi thời, ghi rõ phiên bản.
- Skills: gói chỉ dẫn/quy trình tái dùng mà Claude nạp khi liên quan.

### Bẫy thường gặp

- Dán lại cùng một bối cảnh vào mỗi cuộc chat thay vì cấu hình Project.
- Tải nhiều phiên bản tài liệu mâu thuẫn vào cùng Project.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 5; [What are Projects](https://support.claude.com/en/articles/9517075-what-are-projects); [What are Skills](https://support.claude.com/en/articles/12512176-what-are-skills)

## D6 · Governance, Risk, and Responsible Use (15%)

Task theo guide:

- Nhận diện use case phù hợp và không phù hợp.
- Áp dụng cân nhắc về **độ nhạy dữ liệu, quy định, quyền riêng tư**.
- Tuân theo chính sách AI và chuẩn governance của tổ chức.
- Hiểu hệ quả đạo đức của việc dùng AI.

### Cần nắm chắc

- Dữ liệu cá nhân / bị quản lý (tên khách + số tài khoản, hồ sơ sức khoẻ…) → **ẩn danh / loại bỏ định danh trước khi tải lên**, theo đúng chính sách; vẫn làm được phân tích.
- Chỉ dẫn "đừng lưu file này" cho model **không phải** là một biện pháp kiểm soát chính sách.
- Không dùng AI làm người quyết định cuối cho việc ảnh hưởng lớn đến con người; minh bạch khi nội dung do AI hỗ trợ khi chính sách yêu cầu.
- Tuân theo Usage Policy của Anthropic và chính sách nội bộ.

### Bẫy thường gặp

- "Phân tích nội bộ nên tải nguyên file" (câu mẫu 3); bỏ hẳn việc khi có thể ẩn danh hoá.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 6, §8; [Anthropic Usage Policy](https://www.anthropic.com/legal/aup)

## D7 · Troubleshooting and Optimization (10%)

Task theo guide:

- Nhận diện, chẩn đoán, khắc phục prompt kém hiệu quả hoặc output kém.
- Điều chỉnh cách làm theo phản hồi và kết quả.
- Tối ưu workflow về hiệu quả và hiệu suất.

### Cần nắm chắc

- Truy nguyên nhân gốc: thiếu bối cảnh, chỉ dẫn mơ hồ/mâu thuẫn, sai tính năng, sai model, context quá dài, knowledge lỗi thời.
- Sửa ở nơi bền vững (Project instructions, template) để lần sau không lặp lại.

### Bẫy thường gặp

- Chạy lại y nguyên và hy vọng kết quả khác; đổi model khi vấn đề là prompt thiếu bối cảnh.

Nguồn: [CCAO-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 7

## Tài liệu chính thức nên học

- Exam guide: [CCAO-F Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf). Guide khuyên đọc tài liệu và help article về **Projects, Artifacts, Memory, Skills, Code Execution**; luyện cấu trúc prompt, phân rã việc; dựng workflow thật (Project có chỉ dẫn + kiến thức, đánh giá độ chính xác và bias); luyện phán đoán responsible use.
- Prep course trên Partner Academy: [Claude Certified Associate – Foundations Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations) — 8 phần khớp 7 domain: Platform & Model Foundations; Prompting & Task Execution; Evaluating & Validating Claude's Output; Workflow Integration & Solution Design; Configuration & Knowledge Management; Governance, Risk & Responsible Use; Troubleshooting & Optimization; Course Summary. Khuyến nghị học trước: Claude 101, AI Fluency: Framework & Foundations, AI Capabilities and Limitations.
- Claude Academy (công khai): [Claude 101](https://academy.claude.com/courses/claude-101), [AI Fluency: Framework and foundations](https://academy.claude.com/courses/ai-fluency-framework-foundations), [AI capabilities and limitations](https://academy.claude.com/courses/ai-capabilities-and-limitations), [Building effective human-agent teams](https://academy.claude.com/courses/building-effective-human-agent-teams), [Introduction to Claude Cowork](https://academy.claude.com/courses/introduction-to-claude-cowork), [Introduction to agent skills](https://academy.claude.com/courses/introduction-to-agent-skills).
- Help center: [Projects](https://support.claude.com/en/articles/9517075-what-are-projects), [Artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them), [Chat search & memory](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context), [Skills](https://support.claude.com/en/articles/12512176-what-are-skills), [Research](https://support.claude.com/en/articles/11088861-use-research-on-claude).
- Bài học trong app (lộ trình CCAO-F của tài liệu nguồn): [Claude cho công việc](../lessons/15-ccao-f-work.html), [Đội người–agent và Enterprise](../lessons/16-ccao-f-teams-enterprise.html), [Sản phẩm, dữ liệu và chính sách](../lessons/17-ccao-f-products-policy.html); nền chung: [Claude và LLM nhập môn](../lessons/01-claude-llm-basics.html), [Model, thinking và chi phí](../lessons/03-models-cost.html), [Bảo mật và dữ liệu](../lessons/11-security-data.html). Tra từ khoá: [Thuật ngữ và từ khoá đề thi](../lessons/glossary.html).

Nguồn: [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [CCAO-F Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations); [Claude Academy](https://academy.claude.com/)
