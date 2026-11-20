---
title: "CCDV-F · Claude Certified Developer – Foundations"
exams: [CCDV-F]
---

# CCDV-F · Claude Certified Developer – Foundations

Ghi chú theo **Exam Guide v1.0 (Effective July 2026)**. Guide CCDV-F không viết task statement kiểu CCAR-F mà chia mỗi domain thành các **skill có trọng số riêng** ("skill weights show each skill's share of the overall exam"). Các mục `###` bên dưới là đúng các skill đó, kèm trọng số.

## Thông tin đề

| Mục | Giá trị (guide v1.0) |
|---|---|
| Mã đề | CCDV-F |
| Số câu | 53 |
| Dạng câu | Multiple-choice và multiple-response; mỗi câu ghi rõ chọn mấy đáp án |
| Thời gian | 120 phút |
| Hình thức | Proctored online (OnVUE) hoặc test center Pearson VUE |
| Điểm đạt | Scaled **720** / 100–1.000 |
| Lệ phí | 125 USD (trước giảm giá partner tier) |
| Hiệu lực | 12 tháng |
| Báo kết quả | Pass/fail, scaled score, % đúng theo domain |

- Mục tiêu: xây dựng, tích hợp, đưa lên production ứng dụng / agent / workflow trên nền tảng Claude ở mức nền tảng. Đối tượng: AI/ML engineer, tech lead, senior software engineer.
- Khuyến nghị (không bắt buộc): 1–5 năm làm phần mềm; ≥ 6 tháng thực hành Claude hoặc LLM tương đương; Python và/hoặc TypeScript; thạo REST API và CLI; hiểu LLM, agent, quản lý context, MCP. Không dành cho người dùng không kỹ thuật hay vai trò chỉ viết prompt.
- Năng lực được kiểm: agent/workflow (Agent SDK, framework, custom loop); tích hợp qua API, client SDK, bên thứ ba (streaming, xử lý lỗi, input đa định dạng); vận hành Claude Code, viết Skills, cấu hình CLAUDE.md, settings.json, plugin; prompt và context engineering chống context drift; eval, debug bằng trace, validate structured output; chọn model, quản lý token, caching, batch; secure-by-design, guardrail bằng hook chống prompt injection và thao tác phá huỷ; custom tool, function schema, MCP server, tradeoff giữa built-in tool / custom tool / Skills / MCP.
- **Phân bố rất lệch**: D2 chiếm 33,1% (~18 câu), D5 16,8% (~9), D1 14,7% (~8); D3 Claude Code chỉ 3,1% (~2) và D4 Eval chỉ 2,6% (~1–2).
- Guide có 3 câu mẫu (pack `official`: OF-CCDVF-01…03).

Nguồn: [CCDV-F Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §1–6, §8

## Thay đổi từ 07/12/2026

Pearson VUE thông báo đề **Developer – Foundations có nội dung cập nhật từ 07/12/2026**, guide mới phát hành 17/11/2026, và khuyên ai thi từ 07/12 trở đi dùng guide mới. Mình chưa đọc được guide mới từ nguồn chính thức (ngày 18/11/2026, trang Partner Certifications vẫn liên kết tới bản v1.0 tháng 7/2026), nên **chưa biết cụ thể thay đổi gì**. Thi **trước 07/12/2026** thì dùng v1.0 (ghi chú này).

Nguồn: [Pearson VUE – Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html); [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications)

## D1 · Agents and Workflows (14.7%)

### Agent Architecture (4.5%)

- Nguyên lý, pattern, tradeoff giữa **workflow** (luồng do code định sẵn: chaining, routing, parallelization) và **agent** (model tự quyết bước tiếp theo bằng tool). Tiêu chí: việc có thể đoán trước, cần tất định, chi phí/độ trễ thấp → workflow; việc mở, số bước không biết trước → agent.
- Cấu trúc manager/supervisor (orchestrator–worker); vai trò subagent: cô lập context, chạy song song, chuyên môn hoá.

### Agent Construction with Claude (5.3%)

- Claude Agent SDK; custom agent loop và harness tự viết; mô hình triển khai managed agent **self-hosted vs Anthropic-hosted**; **hooks cho hành động tất định**.
- Vòng lặp tool-use: đọc `stop_reason`, chạy tool khi `tool_use`, trả `tool_result`, lặp đến `end_turn`.

### Agent Patterns and Frameworks (4.9%)

- Pattern: tool-use loop, sub-agent, memory, quản lý context window.
- Framework trừu tượng hoá agent được guide nêu tên: **Strands, LangGraph, PydanticAI** — cần biết đây là framework agent bên thứ ba có thể dùng với Claude, chọn khi cần đồ thị trạng thái / abstraction sẵn.

### Cần nắm chắc

- Workflow trước, agent khi thật sự cần tự chủ (đơn giản nhất mà đạt yêu cầu).
- Hook = bảo đảm tất định (chặn/kiểm tra trước hoặc sau tool call); prompt = định hướng xác suất.
- Subagent không thừa hưởng context cha; phải truyền tường minh.

### Bẫy thường gặp

- Chọn kiến trúc multi-agent cho việc tuyến tính, đoán trước được.
- Dựa vào prompt cho quy tắc phải luôn đúng (thay vì hook / kiểm tra bằng code).
- Không có checkpoint người trước hành động không đảo ngược được.

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 1; [Building effective agents](https://www.anthropic.com/research/building-effective-agents); [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)

## D2 · Applications and Integration (33.1%)

Domain lớn nhất, ôn trước tiên.

### Understanding Requirements (3.4%)

- Suy ra yêu cầu chức năng và hạ tầng từ yêu cầu nghiệp vụ và kiến trúc giải pháp (độ trễ, khối lượng, dữ liệu nhạy cảm, nơi chạy).

### Systems Life Cycle (2.8%)

- Khái niệm và framework quản lý vòng đời hệ thống: phát triển, triển khai, vận hành, bảo trì.

### Claude API Mechanics (6.8%)

- Messages API: `messages`, `system`, `max_tokens`, `stop_reason`; API **không lưu trạng thái** → gửi lại lịch sử cần thiết mỗi lượt.
- Tools, streaming, vision, thinking, caching; gọi Claude qua **nhà cung cấp bên thứ ba** (Amazon Bedrock, Google Vertex AI, Microsoft Foundry); data access patterns của Messages API.
- **Batch API vs realtime**: Message Batches giảm 50% chi phí, xử lý tối đa 24 giờ, không SLA độ trễ, ghép kết quả bằng `custom_id`; realtime cho việc người dùng đang chờ.

### Software Engineering Foundations (7.4%)

- REST API, JSON, lập trình bất đồng bộ, version control, tích hợp SDLC, code review, refactor quy mô nhỏ và lớn.

### Claude Application Design (8.6%) — skill nặng nhất của đề

- Claude diễn giải chỉ dẫn khác nhau theo giao diện: Claude Code, Desktop, claude.ai, API, SDK (mỗi nơi có system prompt / tool / context mặc định khác).
- Content boundaries (tách nội dung tin cậy và không tin cậy), thiết kế schema, **session hygiene** (phiên sạch, không kéo context cũ không liên quan), quản lý plugin.

### Configuration Management (4.1%)

- CLAUDE.md, settings.json, **pin phiên bản model** (dùng model ID cụ thể thay vì alias tự trôi), **version prompt**, phụ thuộc plugin.

### Cần nắm chắc

- Chọn batch khi khối lớn, không gấp, ưu tiên chi phí (câu mẫu 1).
- Pin model + version prompt + eval trước khi đổi model.
- Khác biệt hành vi giữa các bề mặt (claude.ai vs API: API không có system prompt mặc định của app).

### Bẫy thường gặp

- Gửi đồng bộ song song để "nhanh hơn" khi tiêu chí là chi phí; giảm `max_tokens` hay đổi model nhỏ nhất bất chấp chất lượng để tiết kiệm.
- Tưởng API nhớ hội thoại; tưởng prompt caching là "bộ nhớ".
- Dùng alias model trôi phiên bản ở production rồi bất ngờ đổi hành vi.

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 2, §8; [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing); [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)

## D3 · Claude Code (3.1%)

### Claude Code Operation (3.1%)

- Thành phần lõi: **Rules, Skills, Commands, Agents (subagent), Agent Memory**.
- Tính năng: quản lý session (resume, continue), slash command có sẵn và tự tạo, **headless mode** (`-p`), **streaming mode** (`--output-format stream-json`), **auto-mode**; thứ bậc CLAUDE.md (user / project / thư mục; `CLAUDE.local.md` cá nhân không commit); khởi tạo repo (`/init`); cấu hình settings.json (permissions, hooks, env).

### Cần nắm chắc

- Chia sẻ qua repo: `CLAUDE.md`, `.claude/settings.json`, `.claude/commands/`, `.claude/skills/`, `.claude/rules/`, `.mcp.json`. Cá nhân: `~/.claude/…`, `.claude/settings.local.json`, `CLAUDE.local.md`.
- CI/script: `claude -p "…" --output-format json`.

### Bẫy thường gặp

- Đặt chỉ dẫn team ở `~/.claude/CLAUDE.md` (không ai khác nhận được).
- Nhầm Skill (gói quy trình gọi khi cần) với CLAUDE.md (luôn nạp).

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 3; [Claude Code – Memory](https://code.claude.com/docs/en/memory); [Settings](https://code.claude.com/docs/en/settings); [Headless](https://code.claude.com/docs/en/headless)

## D4 · Eval, Testing, and Debugging (2.6%)

### Debugging and Error Handling (2.6%)

- Nhận diện loại lỗi và chọn chiến lược phục hồi: 4xx do request sai (sửa request, không retry y nguyên), 429 rate limit / 529 overloaded / 5xx (retry có exponential backoff, tôn trọng `retry-after`).
- **Trace analysis** để tìm failure mode; **cô lập nguồn lỗi**: tầng tích hợp (request sai, parse sai, tool lỗi) hay output của model (prompt, context).

### Cần nắm chắc

- Đọc trace/log trước khi đổi prompt hay đổi model.
- Lỗi parse JSON thường ở tầng tích hợp → dùng structured output / validate phía client.

### Bẫy thường gặp

- Retry lỗi 400 vô hạn; sửa prompt khi lỗi thật ra nằm ở code gọi API.

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 4; [API errors](https://platform.claude.com/docs/en/api/errors)

## D5 · Model Selection and Optimization (16.8%)

### LLM Fundamentals (5.2%)

- Token, context window, sampling, **non-determinism**, sinh token kế tiếp.
- Tuỳ chọn model: **fast mode** (cùng model, tốc độ sinh output cao hơn, giá cao hơn; bật bằng `speed: "fast"` trên model hỗ trợ), **extended thinking**, **adaptive thinking** (model tự quyết có suy nghĩ và suy nghĩ bao nhiêu cho từng request), **effort levels** (`output_config.effort`: low / medium / high / xhigh / max; là tín hiệu hành vi, không phải ngân sách token cứng).
- Zero-shot, single-shot, multi-shot.

### Technical Fundamentals (6.1%)

- Thực hành kỹ thuật cơ bản: tích hợp qua SDK bọc REST API, websocket.

### Model Selection and Tradeoffs (2.7%)

- Opus vs Sonnet vs Haiku: năng lực cao nhất cho suy luận khó / Sonnet cân bằng / Haiku nhanh, rẻ cho việc khối lượng lớn, đơn giản, subagent.
- Hỗ trợ adaptive thinking theo model; tradeoff chất lượng / độ trễ / chi phí; **breaking behavior changes giữa các bản model** → eval lại trước khi nâng cấp.

### Cost and Token Management (2.8%)

- Ngân sách token, theo dõi usage, mô hình hoá chi phí.
- **Prompt caching**: đặt phần tĩnh (tools, system, tài liệu lớn) ở đầu, `cache_control`; TTL mặc định 5 phút (có tuỳ chọn 1 giờ); đọc cache 0,1× giá input, ghi cache 5 phút 1,25×, ghi 1 giờ 2×; tối đa 4 breakpoint; **cache checkpointing** = đặt breakpoint tại ranh giới các phần ổn định.

### Cần nắm chắc

- Chọn model nhỏ nhất đạt chất lượng qua eval; không "luôn dùng model lớn nhất".
- Effort là cần gạt chính cho độ sâu suy nghĩ / chi phí / độ trễ.
- Caching cần tiền tố **giống hệt**; thay đổi phía trước làm vỡ cache.

### Bẫy thường gặp

- Tin rằng temperature 0 làm output hoàn toàn tất định.
- Đặt phần động (thời gian, user id) trước phần tĩnh → cache không bao giờ trúng.
- Hạ model "bất chấp chất lượng" để giảm chi phí.

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 5; [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching); [Effort](https://platform.claude.com/docs/en/build-with-claude/effort); [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking); [Fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode); [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)

## D6 · Prompt and Context Engineering (11.0%)

### Context Engineering (3.8%)

- Quản lý context window; chống **context drift** và **bloat**: cắt bớt tool output, **compaction** (tóm tắt lịch sử).
- Cô lập context bằng subagent hoặc workflow agentic nhiều bước.

### Prompt Engineering (4.6%)

- Chỉ dẫn rõ ràng, few-shot, đặt nội dung ở **system vs user**, ràng buộc output, vị trí chỉ dẫn qua các thành phần, tinh chỉnh lặp, điều chỉnh prompt, **làm sạch input** (input sanitization).

### Output Handling (2.6%)

- Sinh, validate, tiêu thụ output: structured output, validate response, **defensive parsing**, **hoài nghi output nói rất tự tin**.

### Cần nắm chắc

- Vai trò, quy tắc toàn cục → `system`; dữ liệu, câu hỏi cụ thể → `user`; tách dữ liệu bằng thẻ XML.
- Structured outputs / tool use + schema cho JSON hợp lệ; vẫn validate ngữ nghĩa.
- Context dài → tóm tắt / compaction, subagent cho phần khám phá ồn ào.

### Bẫy thường gặp

- Tin output vì nó "chắc chắn"; parse JSON không có xử lý lỗi.
- Nhét toàn bộ tool output thô vào context qua nhiều lượt.

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 6; [Prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview); [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs); [Effective context engineering](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)

## D7 · Security and Safety (8.1%)

### AI Application Security (3.2%)

- Nhận biết và giảm thiểu **prompt injection**, phòng **jailbreak**, xử lý input không tin cậy, chống rò rỉ dữ liệu, xử lý PII; authentication, authorization, confidentiality, privacy, integrity.

### Guardrails and Safe Deployment (2.3%)

- Content policy, **guardrail nhiều lớp**; secure-by-design: privacy, IAM, **least privilege**.

### Claude Hooks (1.0%)

- Dùng hook làm guardrail / safety control để chặn hành động phá huỷ (vd. `PreToolUse` chặn lệnh nguy hiểm).

### Identity, Secrets, and Key Management (1.6%)

- Quản lý secret, credential, API key giữa dev và prod; xác thực danh tính; phê duyệt quyền truy cập và kiểm tra mức quyền; giám sát truy cập.

### Cần nắm chắc

- Nội dung lấy về (web, file, email) là **dữ liệu không tin cậy**: tách khỏi chỉ dẫn tin cậy, không để nó kích hoạt tool nhạy cảm (câu mẫu 2).
- Kiểm soát enforce được (hook, quyền tool, allowlist) thắng lời dặn trong prompt.
- Secret qua biến môi trường / secret manager, không trong code hay `.mcp.json` commit.

### Bẫy thường gặp

- Tăng temperature, đổi model lớn hơn, hay "xin" người dùng đừng chèn lệnh độc: đều không phải biện pháp chống injection. Model nghe lời hơn có thể **dễ bị injection hơn**.
- Cấp cho agent đủ mọi quyền "cho tiện".

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 7, §8; [Mitigate jailbreaks](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks); [Claude Code hooks](https://code.claude.com/docs/en/hooks); [Claude Code security](https://code.claude.com/docs/en/security)

## D8 · Tools and MCPs (10.6%)

### Tool Implementation (4.4%)

- Tool use / function calling; cấu hình để tương tác hệ thống ngoài; **viết mô tả tool**; xử lý lỗi (`is_error` trong `tool_result`).
- Pattern: dispatch trong agentic harness, **client-side tool** (code của mình chạy) vs **server-side tool** (Anthropic chạy, vd. web search), **approval pattern** (người duyệt trước khi chạy); xây bộ tool gọn, rõ.

### MCP Server Development (2.1%)

- Viết, triển khai, tích hợp MCP server với ứng dụng Claude; ba primitive **tools / resources / prompts**; kênh giao tiếp **stdio** (process cục bộ) vs socket / HTTP (từ xa); quan hệ client–server.

### Agentic Customization (4.1%)

- Tradeoff giữa **built-in tool**, **custom tool**, **Skills**, **MCP** cho từng use case: MCP khi cần năng lực tái dùng cho nhiều app và bảo trì độc lập; custom tool khi gắn chặt một app; Skill khi đóng gói quy trình/kiến thức gọi theo nhu cầu; built-in khi đã có sẵn.

### Cần nắm chắc

- MCP server = cách chia sẻ năng lực cho nhiều ứng dụng Claude (câu mẫu 3).
- Tool description quyết định việc chọn tool.
- Resource cho dữ liệu đọc, tool cho hành động, prompt cho mẫu tương tác.

### Bẫy thường gặp

- Tin built-in tool tự gọi được API nội bộ bất kỳ.
- Dán dữ liệu vào context mỗi request thay cho truy cập trực tiếp (không live, tốn context).
- Viết logic nghiệp vụ vào system prompt từng app.

Nguồn: [CCDV-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 8, §8; [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview); [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture); [MCP transports](https://modelcontextprotocol.io/specification/latest/basic/transports); [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

## Tài liệu chính thức nên học

- Exam guide: [CCDV-F Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf). Guide khuyên: đọc docs chính thức về Claude API, models, prompt engineering, Claude Code, Skills, MCP; tự xây và vận hành ít nhất một ứng dụng Claude (API + ≥ 1 tool + prompt/context engineering cơ bản + bảo mật và eval đơn giản).
- Prep course trên Partner Academy: [Claude Certified Developer – Foundations Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations) (5 phần: MSO Foundations; Production-Grade Prompting, Agents & Tool Use; Claude Code, MCP & Integration; Production Engineering, Evals & Security; Accelerators & IP Contribution). Khuyến nghị học trước: Claude 101, Claude Code 101, Claude Platform 101, Claude Code in Action, AI Fluency, Building with the Claude API, Introduction to MCP, MCP: Advanced Topics, AI Capabilities and Limitations.
- Claude Academy (công khai): [Building with the Claude API](https://academy.claude.com/courses/building-with-the-claude-api), [Claude Platform 101](https://academy.claude.com/courses/claude-platform-101), [Claude Code 101](https://academy.claude.com/courses/claude-code-101), [Claude Code in action](https://academy.claude.com/courses/claude-code-in-action), [Introduction to MCP](https://academy.claude.com/courses/introduction-to-model-context-protocol), [MCP: Advanced topics](https://academy.claude.com/courses/model-context-protocol-advanced-topics), [Tool use with the Messages API](https://academy.claude.com/courses/tool-use-with-the-messages-api), [Introduction to agent skills](https://academy.claude.com/courses/introduction-to-agent-skills), [Introduction to evals](https://academy.claude.com/courses/introduction-to-evals), [AI capabilities and limitations](https://academy.claude.com/courses/ai-capabilities-and-limitations).
- Docs API: [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview), [Choosing a model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model), [Prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview), [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), [Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), [Extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking), [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows), [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [Errors](https://platform.claude.com/docs/en/api/errors), [Define success / develop tests](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations).
- Claude Code: [Memory](https://code.claude.com/docs/en/memory), [Settings](https://code.claude.com/docs/en/settings), [Skills](https://code.claude.com/docs/en/skills), [Plugins](https://code.claude.com/docs/en/plugins), [Hooks](https://code.claude.com/docs/en/hooks), [Headless](https://code.claude.com/docs/en/headless), [IAM / permissions](https://code.claude.com/docs/en/iam); Agent SDK: [Overview](https://code.claude.com/docs/en/agent-sdk/overview).
- Bài học trong app (lộ trình CCDV-F của tài liệu nguồn, nền ở bài 01): [Claude và LLM nhập môn](../lessons/01-claude-llm-basics.html), [Messages API và tích hợp](../lessons/02-messages-api.html), [Model, thinking và chi phí](../lessons/03-models-cost.html), [Prompt và output có cấu trúc](../lessons/04-prompt-output.html), [Tool use](../lessons/05-tool-use.html), [Model Context Protocol (MCP)](../lessons/06-mcp.html), [Agent và điều phối](../lessons/07-agents.html), [Claude Platform, subagent và skill](../lessons/08-platform-subagents-skills.html), [Context và độ tin cậy](../lessons/09-context-reliability.html), [Eval, test và debug](../lessons/10-evals-debug.html), [Bảo mật và dữ liệu](../lessons/11-security-data.html), [Claude Code nhập môn](../lessons/12-claude-code-basics.html), [Claude Code: cấu hình, CI và quyền](../lessons/13-claude-code-config.html), [Vòng đời ứng dụng và tổng kiểm CCDV-F](../lessons/14-app-lifecycle.html). Tra từ khoá: [Thuật ngữ và từ khoá đề thi](../lessons/glossary.html).

Nguồn: [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [CCDV-F Prep Course](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations); [Claude Academy](https://academy.claude.com/)
