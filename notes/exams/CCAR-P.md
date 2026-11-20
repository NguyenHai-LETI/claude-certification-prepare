---
title: "CCAR-P · Claude Certified Architect – Professional"
exams: [CCAR-P]
---

# CCAR-P · Claude Certified Architect – Professional

Ghi chú theo **Exam Guide v1.0 (Effective July 2026)**. Mỗi domain trong guide là danh sách objective; câu hỏi được viết theo đúng các objective này.

## Thông tin đề

| Mục | Giá trị (guide v1.0) |
|---|---|
| Mã đề | CCAR-P |
| Số câu | 63 |
| Dạng câu | Multiple-choice và multiple-response; mỗi câu ghi rõ chọn mấy đáp án |
| Thời gian | 120 phút |
| Hình thức | Proctored online (OnVUE) hoặc test center Pearson VUE |
| Điểm đạt | Scaled **720** / 100–1.000 |
| Lệ phí | 175 USD (trước giảm giá partner tier) |
| Hiệu lực | 12 tháng |
| Báo kết quả | Pass/fail, scaled score, % đúng theo domain |

- Xác nhận khả năng **thiết kế, xây dựng, bàn giao** giải pháp AI production trên Claude: chọn model, kiến trúc, API pattern; prompt và context engineering; tích hợp hệ thống doanh nghiệp; đưa eval, bảo mật, compliance, governance vào thiết kế; làm việc với stakeholder liên chức năng.
- Đối tượng: mid/senior — solution architect, AI/ML engineer, tech lead, senior SWE; thường làm ở tài chính, y tế, bán lẻ, công nghệ, giáo dục, chính phủ. Không dành cho developer mới vào nghề, người dùng phổ thông, hay vai trò chỉ viết prompt.
- MQC: thiết kế hệ AI end-to-end (prompt/context engineering, **RAG**, tích hợp API, orchestration, framework eval), hiểu tradeoff chi phí / độ trễ / hiệu năng / an toàn / khả năng bảo trì.
- Khuyến nghị (không bắt buộc): nền tảng kỹ nghệ phần mềm (modular, separation of concerns, scalability); ≥ 3 năm kiến trúc hệ thống / platform engineering; ≥ 6 tháng dùng Claude hoặc LLM tương đương ở production; từng giao hệ thống từ discovery tới vận hành.
- FAQ: không bắt buộc có CCAR-F trước; Foundations không tự nâng lên Professional.
- Guide có 3 câu mẫu (pack `official`: OF-CCARP-01…03).

Nguồn: [CCAR-P Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §1–5; [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications)

## Thay đổi từ 07/12/2026

Pearson VUE thông báo đề **Architect – Professional có nội dung cập nhật từ 07/12/2026**, guide mới phát hành 17/11/2026. Chưa đọc được guide mới từ nguồn chính thức (trang Partner Certifications ngày 18/11/2026 vẫn trỏ tới v1.0), nên chưa rõ thay đổi. Thi trước 07/12/2026 thì dùng v1.0.

Nguồn: [Pearson VUE – Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html)

## D1 · Solution Design & Architecture (17%)

Objective theo guide:

- Chuyển bài toán nghiệp vụ thành giải pháp AI dựa trên Claude.
- Thiết kế kiến trúc end-to-end: **input → processing → output → feedback loop**.
- Chọn pattern kiến trúc: **workflow, agentic, augmented LLM**.
- Thiết kế hệ multi-agent và chiến lược orchestration.
- Áp dụng kỹ thuật phân rã cho bài toán phức tạp.
- Gắn giải pháp với các trụ giá trị nghiệp vụ: hiệu quả, chuyển đổi, năng suất, chi phí, **performance SLA**.

### Cần nắm chắc

- Augmented LLM (LLM + retrieval + tool + memory) là khối cơ bản; workflow (chaining, routing, parallelization, orchestrator–workers, evaluator–optimizer) khi đường đi đoán trước được; agent khi số bước không biết trước và chấp nhận chi phí, độ trễ, rủi ro cao hơn.
- Luôn có vòng feedback (đánh giá, giám sát, dữ liệu sửa lỗi) trong kiến trúc.
- Bắt đầu từ cách đơn giản nhất đạt mục tiêu; chỉ tăng độ phức tạp khi đo được lợi ích.

### Bẫy thường gặp

- Chọn multi-agent vì "hiện đại" cho bài toán tuyến tính.
- Thiết kế thiếu chỉ số giá trị nghiệp vụ / SLA để nghiệm thu.

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 1; [Building effective agents](https://www.anthropic.com/research/building-effective-agents)

## D2 · Claude Models, Prompting & Context Engineering (13%)

Objective theo guide:

- Chọn model Claude theo tradeoff.
- Thiết kế system prompt, template, guardrail.
- Kỹ thuật prompt: **zero-shot, few-shot, chain-of-thought**.
- Tối ưu context window, quản lý lượng token.
- Chiến lược tái dùng prompt: **caching, modular prompt, Skills**.

### Cần nắm chắc

- Prompt caching: nội dung tĩnh (system prompt, policy, tài liệu lớn, tool definitions) đặt **trước** nội dung động → tiền tố tái dùng, giảm time-to-first-token và chi phí mỗi request (câu mẫu 2). TTL mặc định 5 phút, có tuỳ chọn 1 giờ; đọc cache 0,1× giá input.
- Modular prompt: tách khối (vai trò, quy tắc, ví dụ, dữ liệu) để tái dùng và version; Skills đóng gói quy trình + tài nguyên, chỉ nạp khi liên quan (progressive disclosure).
- Chọn model: thử model nhỏ hơn bằng eval; lớn hơn khi suy luận phức tạp.

### Bẫy thường gặp

- Cắt bớt policy để tiết kiệm token (mất nội dung cần thiết); chuyển policy thành few-shot (không tạo tiền tố cache).
- Hạ model "bất chấp task fit".

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 2, §8; [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching); [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview); [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)

## D3 · Integration (19%)

Domain nặng nhất (~12 câu / 63). Objective theo guide:

- Đánh giá cấu hình tool/agent về **capability bloat** (thừa năng lực).
- Phân tích yêu cầu **authentication và authorization** để tìm lỗ hổng bảo mật.
- Đánh giá tradeoff **độ chính xác – độ trễ** và biện minh quyết định cấu hình.
- Phân tích thách thức **observability** và chọn chiến lược giám sát ở quy mô lớn.
- Thiết kế **RAG pipeline** với chiến lược chunking và indexing phù hợp.
- Chọn chiến lược retrieval khớp **hình dạng dữ liệu và kiểu truy vấn**.
- Đánh giá giao thức kết nối và chọn cơ chế tích hợp: **MCP, API/CLI, agent-to-agent**.
- Đánh giá **progressive discovery** so với chiến lược **monolithic context**.

### Cần nắm chắc

- **Least privilege**: bỏ hẳn tool/quyền mà vai trò không cần → xoá bề mặt tấn công; logging, confirmation chỉ là kiểm soát phát hiện/bù trừ (câu mẫu 1).
- AuthN/AuthZ: agent hành động thay người dùng → quyền theo người dùng thật, không dùng một service account toàn quyền; secret không lộ qua context.
- RAG: chunk theo cấu trúc tài liệu, có overlap/metadata; hybrid (keyword + semantic) cho truy vấn chứa mã, tên riêng; reranking; dữ liệu bảng/có cấu trúc → truy vấn trực tiếp thay vì embedding.
- Progressive discovery (chỉ nạp mô tả ngắn, tải chi tiết khi cần — như Skills, tool search) tiết kiệm context khi có nhiều tool/tài liệu; monolithic context hợp khi dữ liệu nhỏ, luôn cần.
- MCP khi chia sẻ năng lực cho nhiều client theo chuẩn; API/CLI trực tiếp khi tích hợp một chỗ, đơn giản; agent-to-agent khi các agent độc lập cần phối hợp.

### Bẫy thường gặp

- Giữ đủ tool rồi "thêm xác nhận" thay vì gỡ quyền thừa.
- Nhồi toàn bộ tài liệu/tool vào context "cho chắc".
- Chỉ giám sát độ trễ, bỏ qua chất lượng output khi lên quy mô.

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 3, §8; [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture); [Embeddings](https://platform.claude.com/docs/en/build-with-claude/embeddings); [Writing tools for agents](https://www.anthropic.com/research/writing-tools-for-agents)

## D4 · Evaluation, Testing & Optimization (16%)

Objective theo guide:

- Định nghĩa metric đánh giá: **accuracy, latency, cost, safety, security**.
- Thiết kế bộ dữ liệu eval và framework test với **phương pháp hỗn hợp**.
- A/B test và cải tiến lặp.
- Chẩn đoán sự cố: **lỗi prompt, hallucination, model không phù hợp**.
- Tối ưu token, độ trễ, tradeoff chi phí – hiệu năng.
- Giám sát hiệu năng bằng logging và công cụ observability.

### Cần nắm chắc

- Eval là **tiêu chí nghiệm thu** và cổng chặn trước mọi thay đổi model/prompt/kiến trúc.
- Phương pháp hỗn hợp: kiểm tra bằng code (khớp chính xác, schema), LLM-as-judge có rubric, chấm bởi người cho mẫu khó.
- Chẩn đoán theo triệu chứng: sai tự tin **sau khi làm mới tài liệu**, model và độ trễ không đổi → nghi retrieval/indexing trước (câu mẫu 3).

### Bẫy thường gặp

- Đổ cho "model weights tự thay đổi"; chỉnh temperature cho lỗi dữ liệu.
- Chỉ đo accuracy, bỏ cost/latency/safety.

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 4, §8; [Define success / develop tests](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests); [Introduction to evals](https://academy.claude.com/courses/introduction-to-evals)

## D5 · Governance, Safety & Risk Management (14%)

Objective theo guide:

- Triển khai guardrail và safety control.
- Nhận diện rủi ro, giới hạn, failure mode của hệ LLM.
- Áp dụng chiến lược **human-in-the-loop** để kiểm duyệt.
- Bảo đảm tuân thủ quy định (vd. **GDPR, HIPAA, FedRAMP**).
- Xử lý cân nhắc đạo đức: **bias, fairness, transparency**.

### Cần nắm chắc

- Safety stack nhiều lớp: lọc input, lọc output, **phân quyền tool call**; thiết kế **fail closed** (khi một lớp lỗi thì chặn, không thả).
- Định tuyến quyết định cho người theo **độ tự tin, khả năng đảo ngược, chi phí sai**.
- Mỗi nghĩa vụ compliance gắn với một control, người chịu trách nhiệm, và bằng chứng (evidence).

### Bẫy thường gặp

- Coi lời dặn trong system prompt là guardrail đủ cho hành động rủi ro cao.
- Human review cho mọi thứ (không mở rộng được) hoặc không cho thứ gì.

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 5; [CCAR-P Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional) (learning objectives); [Mitigate jailbreaks](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)

## D6 · Stakeholder Communication & Lifecycle Management (14%)

Objective theo guide:

- Discovery có cấu trúc và thu thập yêu cầu.
- Truyền đạt quyết định kiến trúc và tradeoff.
- Quản lý vòng phản hồi stakeholder và căn chỉnh kỳ vọng (gồm **SLA**).
- Viết tài liệu kiến trúc, hướng dẫn triển khai.
- Hỗ trợ các pha vòng đời: **discovery, design, handoff, monitoring, iteration**.

### Cần nắm chắc

- Trình bày tradeoff bằng ngôn ngữ người ra quyết định hành động được (chi phí, rủi ro, thời gian, SLA), có phương án thay thế.
- Handoff phải sống được khi kiến trúc sư rời đi: tài liệu, runbook, eval, ownership rõ.

### Bẫy thường gặp

- Hứa độ chính xác tuyệt đối; bỏ qua SLA trong thoả thuận.

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 6; [CCAR-P Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional)

## D7 · Developer Productivity & Operational Enablement (7%)

Objective theo guide:

- Cấu hình công cụ và môi trường Claude cho team (vd. **Claude Code**).
- Cải thiện workflow developer bằng công cụ có AI hỗ trợ.
- Hỗ trợ debug và xử lý sự cố vận hành.

### Cần nắm chắc

- Cấu hình chung cho team qua repo: `CLAUDE.md`, `.claude/settings.json` (permissions, hooks), `.mcp.json`, skills/commands; quản trị tập trung khi cần (managed settings).
- Claude Code trong CI (`claude -p`, GitHub Actions) cho review, sinh test.

### Bẫy thường gặp

- Mỗi dev tự cấu hình riêng, không chuẩn hoá → hành vi không nhất quán.

Nguồn: [CCAR-P Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) §6 Domain 7; [Claude Code settings](https://code.claude.com/docs/en/settings); [GitHub Actions](https://code.claude.com/docs/en/github-actions)

## Tài liệu chính thức nên học

- Exam guide: [CCAR-P Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf). Guide khuyên: đọc docs chính thức về Claude API, models, prompt engineering, MCP, Skills; tự xây và vận hành ít nhất một giải pháp end-to-end có **RAG, eval, observability**; luyện ra quyết định kiến trúc (chọn model, giao thức tích hợp, tradeoff bảo mật).
- Prep course trên Partner Academy: [Claude Certified Architect – Professional Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional) — 5 phần: Claude Platform & Solution Design; Enterprise Integration & Production; Responsible AI, Safety & Risk for Architects; Stakeholder Engagement, Lifecycle & GTM; Team Enablement & Operational Productivity. Khuyến nghị học trước: Claude 101, Claude Code in Action, AI Fluency, Building with the Claude API, Introduction to MCP, AI Capabilities and Limitations.
- Claude Academy (công khai): [Building with the Claude API](https://academy.claude.com/courses/building-with-the-claude-api), [Claude Code in action](https://academy.claude.com/courses/claude-code-in-action), [Introduction to MCP](https://academy.claude.com/courses/introduction-to-model-context-protocol), [Introduction to evals](https://academy.claude.com/courses/introduction-to-evals), [Introduction to agent skills](https://academy.claude.com/courses/introduction-to-agent-skills), [Deploying Claude Enterprise with confidence](https://academy.claude.com/courses/deploying-claude-enterprise-with-confidence), [AI capabilities and limitations](https://academy.claude.com/courses/ai-capabilities-and-limitations).
- Docs: [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview), [Prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview), [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows), [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [Embeddings](https://platform.claude.com/docs/en/build-with-claude/embeddings), [Develop tests](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [Mitigate jailbreaks](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture), [Claude Code settings](https://code.claude.com/docs/en/settings).
- Bài viết: [Building effective agents](https://www.anthropic.com/research/building-effective-agents), [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents), [Writing tools for agents](https://www.anthropic.com/research/writing-tools-for-agents), [Multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system).
- Bài học trong app (lộ trình CCAR-P của tài liệu nguồn): [Thiết kế giải pháp và model](../lessons/19-solution-design.html), [Tích hợp](../lessons/20-integration.html), [Đánh giá, tối ưu và governance](../lessons/21-evaluation-governance.html), [Bên liên quan, vòng đời, năng suất đội](../lessons/22-stakeholders-operations.html); bổ sung: [Bảo mật và dữ liệu](../lessons/11-security-data.html), [đội người–agent và Enterprise](../lessons/16-ccao-f-teams-enterprise.html). Tra từ khoá: [Thuật ngữ và từ khoá đề thi](../lessons/glossary.html).

Nguồn: [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [CCAR-P Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional); [Claude Academy](https://academy.claude.com/)
