---
title: "CCAR-F · Claude Certified Architect – Foundations"
exams: [CCAR-F]
---

# CCAR-F · Claude Certified Architect – Foundations

Ghi chú theo **Exam Guide v1.0 (Effective July 2026)**. Guide là tài liệu "authoritative" về phạm vi đề; mọi mục dưới đây diễn giải lại guide, kèm vài chi tiết đối chiếu từ docs chính thức (có ghi rõ).

## Thông tin đề

| Mục | Giá trị (guide v1.0) |
|---|---|
| Mã đề | CCAR-F |
| Số câu | 60 |
| Dạng câu | Multiple-choice và multiple-response; **mỗi câu tự ghi phải chọn mấy đáp án** |
| Cấu trúc | **4 scenario rút ngẫu nhiên từ bộ 6** (xem mục Scenarios) |
| Thời gian | 120 phút (FAQ: tính cả check-in, hướng dẫn, khảo sát thì ~135 phút ngồi máy) |
| Hình thức | Proctored: online (OnVUE) hoặc test center Pearson VUE |
| Điểm đạt | Scaled score **720** trên thang 100–1.000 |
| Lệ phí | 125 USD (tăng từ 99 USD kể từ 30/06/2026 theo FAQ); partner tier có giảm giá |
| Hiệu lực | 12 tháng kể từ ngày cấp |
| Báo kết quả | Pass/fail + scaled score + % đúng theo từng domain (phần trăm domain không dùng để quyết định đỗ/trượt) |

- Đối tượng: solution architect thiết kế, triển khai ứng dụng production với Claude; khuyến nghị ≥ 6 tháng thực hành Claude API, Agent SDK, Claude Code, MCP. Không có điều kiện tiên quyết bắt buộc.
- Đề thi kiểm tra **phán đoán thực tế về tradeoff** (kiến trúc, cấu hình) chứ không chỉ định nghĩa. Bốn mảng công nghệ: Claude Code, Claude Agent SDK, Claude API, Model Context Protocol (MCP).
- Guide có 12 câu mẫu (mục 9), ghi là "drawn from the practice test"; đã chép nguyên văn vào pack `official` của app (OF-CCARF-01…12).

Nguồn: [CCAR-F Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §1–3, §9–10; [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications)

## Thay đổi từ 07/12/2026

Thông báo của Pearson VUE: từ **07/12/2026** đề **Associate – Foundations, Developer – Foundations và Architect – Professional** có nội dung cập nhật, guide mới phát hành 17/11/2026. **CCAR-F không nằm trong danh sách này**, nên guide v1.0 vẫn là căn cứ cho CCAR-F. Tại thời điểm kiểm tra (18/11/2026), trang Partner Certifications vẫn liên kết tới guide v1.0 (July 2026).

Nguồn: [Pearson VUE – Claude Certification Program](https://www.pearsonvue.com/us/en/anthropic.html); [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications)

## Scenarios (4 trong 6)

Mỗi scenario là một bối cảnh production dẫn ra một cụm câu hỏi. Khi thi, hệ thống chọn ngẫu nhiên 4 trong 6 scenario dưới đây, nên phải ôn đủ cả 6.

| # | Scenario | Bối cảnh tóm tắt | Domain chính |
|---|---|---|---|
| S1 | Customer Support Resolution Agent | Agent hỗ trợ khách (Agent SDK) xử lý yêu cầu mơ hồ: đổi trả, tranh chấp hoá đơn, tài khoản. Tool MCP tự viết: `get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`. Mục tiêu ≥ 80% first-contact resolution nhưng biết lúc nào phải escalate. | D1, D2, D5 |
| S2 | Code Generation with Claude Code | Dùng Claude Code để sinh code, refactor, debug, viết tài liệu; tích hợp vào quy trình bằng custom slash command, CLAUDE.md; biết khi nào dùng plan mode, khi nào làm trực tiếp. | D3, D5 |
| S3 | Multi-Agent Research System | Coordinator giao việc cho các subagent chuyên trách: tìm web, phân tích tài liệu, tổng hợp, viết báo cáo có trích dẫn. | D1, D2, D5 |
| S4 | Developer Productivity with Claude | Công cụ năng suất cho kỹ sư (Agent SDK): khám phá codebase lạ, hiểu hệ thống legacy, sinh boilerplate, tự động hoá việc lặp; dùng built-in tools (Read, Write, Bash, Grep, Glob) + MCP server. | D2, D3, D1 |
| S5 | Claude Code for Continuous Integration | Claude Code trong CI/CD: review code tự động, sinh test, feedback trên PR; prompt phải cho feedback actionable và ít false positive. | D3, D4 |
| S6 | Structured Data Extraction | Trích xuất thông tin từ tài liệu phi cấu trúc, validate bằng JSON schema, độ chính xác cao, xử lý edge case, tích hợp hệ thống downstream. | D4, D5 |

Mẹo: đọc scenario trước, xác định "pain point" (độ tin cậy, chi phí, độ trễ, an toàn tài chính, trải nghiệm dev), rồi chọn đáp án giải quyết **đúng nguyên nhân gốc với mức can thiệp tương xứng**.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §3, §5

## D1 · Agentic Architecture & Orchestration (27%)

Domain nặng nhất (~16 câu / 60).

### 1.1 Agentic loop

- Vòng lặp: gửi request → đọc `stop_reason` → nếu `"tool_use"` thì chạy tool, **append tool result vào lịch sử hội thoại**, gửi lại → nếu `"end_turn"` thì dừng.
- Phân biệt **model-driven decision** (Claude tự chọn tool kế tiếp theo context) với cây quyết định / chuỗi tool cố định.
- Anti-pattern bị hỏi: dừng vòng lặp bằng cách parse câu chữ tự nhiên ("I'm done"), dùng **iteration cap tuỳ ý làm cơ chế dừng chính**, coi việc assistant có trả text là dấu hiệu xong.
- Docs API còn các `stop_reason` khác (`max_tokens`, `stop_sequence`, `pause_turn`, `refusal`, `model_context_window_exceeded`) — biết để xử lý, nhưng guide chỉ xoáy vào `tool_use` / `end_turn`.

### 1.2 Multi-agent: coordinator–subagent

- Hub-and-spoke: coordinator quản lý **mọi** giao tiếp giữa các subagent, xử lý lỗi, định tuyến thông tin (để quan sát được, xử lý lỗi nhất quán).
- Subagent có **context cô lập**: không tự thừa hưởng lịch sử hội thoại của coordinator.
- Coordinator: phân rã việc, giao việc, gom kết quả, **chọn động** subagent cần gọi theo độ phức tạp, không phải lúc nào cũng chạy cả pipeline.
- Rủi ro: phân rã quá hẹp → thiếu độ phủ (câu mẫu: chủ đề "creative industries" bị chia chỉ thành mảng thị giác).
- Chia phạm vi nghiên cứu để tránh trùng (mỗi agent một subtopic / loại nguồn); vòng lặp tinh chỉnh: coordinator đánh giá bản tổng hợp, tìm lỗ hổng, giao lại truy vấn có mục tiêu, gọi lại synthesis đến khi đủ độ phủ.

### 1.3 Gọi subagent, truyền context

- Subagent được spawn qua **Task tool**; coordinator phải có `"Task"` trong `allowedTools`. (Docs Agent SDK hiện tại: tool này đã đổi tên thành **Agent**, bản cũ phát ra `"Task"`. Đề v1.0 dùng tên Task.) Đề v1.0 chấm theo guide; thực tế docs hiện hành: `allowedTools` chỉ **tự duyệt** (auto-approve) tool được liệt kê, tool không liệt kê vẫn có mặt, và tool `Agent` vốn không cần hỏi quyền nên chạy được dù không có trong `allowedTools`; muốn ẩn hẳn một tool thì dùng `disallowedTools` ([Agent SDK, Configure permissions](https://code.claude.com/docs/en/agent-sdk/permissions)).
- Context phải **đưa tường minh vào prompt** của subagent: dán đầy đủ kết quả của agent trước (vd. kết quả web search + phân tích tài liệu cho synthesis).
- `AgentDefinition`: description, system prompt, giới hạn tool cho từng loại subagent.
- Dùng định dạng có cấu trúc tách **nội dung** khỏi **metadata** (URL nguồn, tên tài liệu, số trang) để giữ attribution.
- Chạy song song: coordinator phát **nhiều Task tool call trong cùng một response**, không rải qua nhiều lượt.
- Prompt cho coordinator nêu **mục tiêu nghiên cứu và tiêu chí chất lượng**, không viết thủ tục từng bước, để subagent tự thích nghi.
- Fork-based session: rẽ nhánh từ một baseline phân tích chung để thử các hướng khác nhau.

### 1.4 Workflow nhiều bước: enforcement và handoff

- **Programmatic enforcement** (hook, prerequisite gate) ≠ hướng dẫn trong prompt. Khi cần tuân thủ tất định (vd. xác minh danh tính trước thao tác tài chính) thì prompt có **tỉ lệ thất bại khác 0** → phải chặn bằng code.
- Ví dụ chuẩn: chặn `process_refund` (và `lookup_order`) cho đến khi `get_customer` trả về customer ID đã xác minh.
- Yêu cầu nhiều vấn đề: tách thành từng mục, điều tra song song với context chung, rồi tổng hợp một phương án thống nhất.
- Handoff khi escalate giữa chừng: tóm tắt có cấu trúc (customer ID, root cause, số tiền hoàn, hành động đề xuất) vì nhân viên người **không xem được transcript**.

### 1.5 Hooks của Agent SDK

- `PostToolUse`: chặn kết quả tool để **chuẩn hoá** trước khi model đọc (Unix timestamp, ISO 8601, mã trạng thái số từ nhiều MCP tool khác nhau).
- Hook chặn **tool call đi ra** để ép quy tắc (vd. hoàn tiền > 500 USD bị chặn, chuyển sang escalate cho người).
- Hook = bảo đảm tất định; prompt = tuân thủ xác suất. Quy tắc nghiệp vụ "bắt buộc" → hook.

### 1.6 Chiến lược phân rã task

- **Prompt chaining** (pipeline tuần tự cố định) cho việc dự đoán được nhiều khía cạnh, vd. review từng file rồi một lượt tích hợp cross-file.
- **Dynamic adaptive decomposition** cho việc mở: lập bản đồ cấu trúc → xác định vùng tác động lớn → kế hoạch ưu tiên, điều chỉnh khi phát hiện phụ thuộc (vd. "add comprehensive tests to a legacy codebase").
- Review lớn: per-file local pass + cross-file integration pass để tránh **attention dilution**.

### 1.7 Session: resume và fork

- `--resume <session-name>`: tiếp tục đúng phiên trước đó. `fork_session`: tạo nhánh độc lập từ baseline phân tích chung (so sánh 2 chiến lược test / refactor).
- Khi resume sau khi code đã đổi: **báo cho agent file nào đã đổi** để phân tích lại có mục tiêu, không bắt khám phá lại toàn bộ.
- Kết quả tool cũ đã "stale" → mở phiên mới kèm **bản tóm tắt có cấu trúc** đáng tin hơn resume.

### Cần nắm chắc

- Vòng lặp theo `stop_reason`; tool result nằm trong lịch sử messages.
- Subagent không có bộ nhớ chung; mọi thứ subagent cần phải nằm trong prompt của nó.
- Song song = nhiều tool call trong một response.
- "Bắt buộc / tài chính / tuân thủ" → hook hoặc prerequisite gate; "định hướng / phong cách" → prompt.

### Bẫy thường gặp

- Chọn "thêm câu MUST vào system prompt" hoặc few-shot cho quy tắc **bắt buộc** (câu mẫu Q1: đáp án là chặn bằng code).
- Đổ lỗi cho subagent hạ nguồn khi log cho thấy coordinator phân rã sai (Q7).
- Dùng `max_iterations` làm điều kiện dừng chính; kiểm tra "có text" để kết thúc.
- Cho rằng subagent tự thấy lịch sử của coordinator.
- Routing classifier bật/tắt tool: giải quyết **tool nào có mặt**, không giải quyết **thứ tự gọi**.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 1, §9; [Agent SDK – Subagents](https://code.claude.com/docs/en/agent-sdk/subagents); [Handling stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)

## D2 · Tool Design & MCP Integration (18%)

### 2.1 Thiết kế tool interface

- **Tool description là cơ chế chính** để model chọn tool; mô tả sơ sài → chọn sai giữa các tool giống nhau.
- Mô tả tốt gồm: định dạng input, ví dụ truy vấn, edge case, ranh giới "dùng tool này khi nào, **không** dùng khi nào so với tool tương tự".
- Mô tả mơ hồ / chồng lấn gây misrouting (vd. `analyze_content` vs `analyze_document`) → đổi tên + đổi mô tả (vd. `extract_web_results`), hoặc tách tool chung thành tool chuyên biệt có hợp đồng input/output rõ (`extract_data_points`, `summarize_content`, `verify_claim_against_source`).
- System prompt có từ khoá dễ tạo liên tưởng sai, có thể lấn át mô tả tool tốt → rà lại system prompt.

### 2.2 Lỗi có cấu trúc cho MCP tool

- Cờ **`isError`** của MCP để báo tool thất bại cho agent.
- Bốn loại lỗi: **transient** (timeout, dịch vụ tạm sập), **validation** (input sai), **business** (vi phạm chính sách), **permission**.
- Lỗi chung chung ("Operation failed") khiến agent không biết phục hồi thế nào. Trả metadata: `errorCategory`, `isRetryable`, mô tả dễ hiểu; vi phạm nghiệp vụ: `retriable: false` + lời giải thích thân thiện cho khách.
- Subagent tự phục hồi lỗi transient cục bộ; chỉ đẩy lên coordinator lỗi không tự xử lý được, kèm kết quả một phần và những gì đã thử.
- Phân biệt **access failure** (cần quyết định retry) với **kết quả rỗng hợp lệ** (truy vấn thành công, không có bản ghi).

### 2.3 Phân bổ tool và `tool_choice`

- Quá nhiều tool (vd. 18 thay vì 4–5) làm giảm độ tin cậy khi chọn tool. Agent có tool ngoài chuyên môn dễ dùng sai (synthesis agent đi search web).
- Scoped tool access: mỗi agent chỉ có tool cho vai trò của nó; cho thêm **tool cross-role hẹp** cho nhu cầu tần suất cao (vd. `verify_fact` cho synthesis), ca phức tạp vẫn đi qua coordinator.
- Thay tool chung bằng tool ràng buộc (vd. `fetch_url` → `load_document` có kiểm tra URL).
- `tool_choice`: `"auto"` (có thể trả text), `"any"` (bắt buộc gọi một tool, model tự chọn), forced `{"type": "tool", "name": "..."}` (bắt buộc gọi đúng tool đó). Docs còn có `"none"` (cấm dùng tool).
- Forced tool để đảm bảo một bước chạy trước (vd. `extract_metadata` trước các tool enrichment), các bước sau xử lý ở lượt tiếp.

### 2.4 Tích hợp MCP server vào Claude Code / agent

- Phạm vi: **project** (`.mcp.json`, commit vào repo, dùng chung cho team) vs **user** (`~/.claude.json`, cá nhân / thử nghiệm). Docs Claude Code: còn scope **local** (mặc định của `claude mcp add`, cũng lưu trong `~/.claude.json` nhưng gắn với một project).
- Biến môi trường trong `.mcp.json` (vd. `${GITHUB_TOKEN}`) để không commit secret.
- Tool của **mọi** MCP server đã cấu hình được phát hiện khi kết nối và dùng **đồng thời**.
- **MCP resources** để phơi bày catalog nội dung (tóm tắt issue, cây tài liệu, database schema) → giảm tool call thăm dò.
- Mô tả MCP tool chi tiết để agent không ưu tiên built-in (như Grep) hơn MCP tool mạnh hơn.
- Tích hợp chuẩn (Jira…) → ưu tiên MCP server cộng đồng có sẵn; tự viết server cho workflow riêng của team.

### 2.5 Built-in tools

- **Grep** = tìm **nội dung** file (tên hàm, thông báo lỗi, import). **Glob** = tìm **đường dẫn** theo mẫu (`**/*.test.tsx`).
- Read/Write = thao tác cả file; **Edit** = sửa có mục tiêu bằng đoạn text **duy nhất**; Edit lỗi do không duy nhất → Read + Write.
- Hiểu codebase dần dần: Grep tìm entry point → Read lần theo import; không đọc hết từ đầu. Lần theo wrapper module: liệt kê tên export rồi Grep từng tên.

### Cần nắm chắc

- Sửa mô tả tool là "first step" rẻ nhất, đúng gốc khi chọn sai tool (Q2).
- `isError` + phân loại lỗi + `isRetryable`; access failure ≠ empty result.
- Ít tool, đúng vai; tool cross-role hẹp cho 85% ca đơn giản (Q9).
- `.mcp.json` (team) vs `~/.claude.json` (cá nhân); `${ENV}` cho credential.

### Bẫy thường gặp

- Routing layer / classifier trước LLM cho vấn đề do mô tả tool kém: over-engineering.
- Gộp hai tool thành `lookup_entity`: hợp lệ về kiến trúc nhưng quá tay cho "first step".
- Cho synthesis agent **toàn bộ** tool web search: vi phạm least privilege / separation of concerns.
- Nhầm Grep (nội dung) với Glob (tên file).
- Commit token thật vào `.mcp.json` thay vì `${VAR}`.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 2, §9; [Claude Code – MCP](https://code.claude.com/docs/en/mcp); [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools); [MCP spec – Tools](https://modelcontextprotocol.io/specification/latest/server/tools)

## D3 · Claude Code Configuration & Workflows (20%)

### 3.1 CLAUDE.md: thứ bậc và mô-đun

- Ba cấp: **user** (`~/.claude/CLAUDE.md`, chỉ áp dụng cho chính người đó, không chia sẻ qua git), **project** (`CLAUDE.md` ở gốc hoặc `.claude/CLAUDE.md`), **directory** (CLAUDE.md trong thư mục con).
- `@import` (cú pháp `@path`) để giữ CLAUDE.md gọn, mỗi package import đúng file chuẩn liên quan. (Docs: import giúp tổ chức nhưng **không giảm context** vì file import vẫn được nạp.)
- `.claude/rules/` chứa các file rule theo chủ đề (testing.md, api-conventions.md, deployment.md) thay cho một CLAUDE.md khổng lồ.
- Lệnh `/memory` để xem file memory nào đang được nạp, chẩn đoán hành vi không nhất quán.
- Ca chẩn đoán điển hình: thành viên mới không nhận chỉ dẫn vì chỉ dẫn nằm ở **user-level** của người khác.

### 3.2 Custom slash command và skill

- Command: **project** `.claude/commands/` (theo git, cả team có) vs **user** `~/.claude/commands/` (cá nhân).
- Skill: `.claude/skills/<tên>/SKILL.md` với frontmatter: `context: fork` (chạy trong context subagent cô lập, output dài không làm bẩn hội thoại chính), `allowed-tools` (giới hạn tool khi skill chạy), `argument-hint` (gợi ý tham số khi gọi thiếu đối số).
  - Đề v1.0 chấm theo guide (`allowed-tools` = giới hạn tool). Thực tế docs hiện hành: `allowed-tools` chỉ **cấp sẵn quyền** cho tool được liệt kê trong lượt gọi skill (không phải hỏi duyệt), "does not restrict which tools are available"; muốn loại tool khỏi skill thì dùng `disallowed-tools` ([Claude Code docs, Skills](https://code.claude.com/docs/en/skills)).
- Biến thể cá nhân: tạo trong `~/.claude/skills/` **với tên khác** để không ảnh hưởng đồng đội. (Docs hiện hành: nếu trùng tên thì skill cá nhân thắng skill project, nhưng chỉ trên máy bạn; đặt tên khác để vẫn gọi được bản của team ([Skills](https://code.claude.com/docs/en/skills)).)
- Skill (gọi theo yêu cầu, cho việc cụ thể) vs CLAUDE.md (luôn nạp, chuẩn chung).
- Docs: `context: fork` chạy skill trong subagent **mới**, không mang theo toàn bộ hội thoại hiện tại.

### 3.3 Rule theo đường dẫn

- File trong `.claude/rules/` có YAML frontmatter `paths:` chứa glob (vd. `paths: ["terraform/**/*"]`) → chỉ nạp khi Claude làm việc với file khớp mẫu → ít context thừa, ít token.
- Glob theo loại file bất kể thư mục (`**/*.test.tsx`) → tốt hơn CLAUDE.md theo thư mục khi quy ước trải khắp codebase.

### 3.4 Plan mode vs direct execution

- **Plan mode**: việc lớn, nhiều cách làm hợp lệ, quyết định kiến trúc, sửa nhiều file (tách microservice, migrate thư viện ảnh hưởng 45+ file, chọn giữa các cách tích hợp có hạ tầng khác nhau). Cho phép khám phá an toàn và thiết kế trước khi sửa.
- **Direct execution**: thay đổi đơn giản, phạm vi rõ (sửa bug một file có stack trace, thêm một điều kiện validate ngày).
- **Explore subagent**: cô lập output khám phá dài dòng, trả về tóm tắt → giữ context chính.
- Kết hợp: plan mode để điều tra/thiết kế → direct execution để thực thi theo kế hoạch.

### 3.5 Tinh chỉnh lặp

- Mô tả bằng lời cho kết quả không nhất quán → đưa **2–3 cặp ví dụ input/output cụ thể**.
- Test-driven iteration: viết test (hành vi mong đợi, edge case, hiệu năng) trước, rồi lặp bằng cách đưa lỗi test cho Claude.
- **Interview pattern**: để Claude hỏi lại nhằm lộ ra các cân nhắc (cache invalidation, failure mode) trước khi làm ở miền lạ.
- Nhiều vấn đề **tương tác nhau** → gom vào một message chi tiết; vấn đề **độc lập** → sửa tuần tự.

### 3.6 Claude Code trong CI/CD

- `-p` / `--print`: chế độ non-interactive, in kết quả ra stdout rồi thoát → không treo chờ input.
- `--output-format json` + `--json-schema`: output có cấu trúc để máy đọc, đăng thành inline PR comment.
- CLAUDE.md cung cấp context dự án cho Claude Code chạy trong CI (chuẩn test, fixture, tiêu chí review).
- Phiên đã sinh code kém hiệu quả khi tự review; dùng **instance review độc lập**.
- Chạy lại review sau commit mới: đưa kết quả review trước vào context, yêu cầu chỉ báo lỗi mới / chưa xử lý để tránh comment trùng. Sinh test: đưa test hiện có vào context để không đề xuất trùng.

### Cần nắm chắc

- Chia sẻ với team = nằm trong repo (`.claude/commands/`, `.claude/skills/`, `.claude/rules/`, `CLAUDE.md`, `.mcp.json`); cá nhân = `~/.claude/…`, `~/.claude.json`.
- Quy ước trải khắp nơi → `.claude/rules/` + `paths` glob.
- Độ phức tạp đã nêu sẵn trong yêu cầu → plan mode ngay từ đầu.
- CI: `claude -p "..." --output-format json --json-schema '<schema>'`.

### Bẫy thường gặp

- Các lựa chọn bịa: `.claude/config.json` có mảng `commands`, biến `CLAUDE_HEADLESS=true`, cờ `--batch` (Q4, Q10).
- Đặt command trong CLAUDE.md (CLAUDE.md là chỉ dẫn/context, không định nghĩa command).
- Dùng skill cho quy ước cần áp **tự động** theo file (skill phụ thuộc việc được gọi / được chọn nạp) (Q6).
- "Bắt đầu direct execution rồi đổi sang plan mode nếu gặp phức tạp" khi đề đã nói rõ là việc kiến trúc (Q5).
- Redirect `< /dev/null` thay cho `-p`.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 3, §9; [Claude Code – Memory](https://code.claude.com/docs/en/memory); [Skills](https://code.claude.com/docs/en/skills); [Headless / -p](https://code.claude.com/docs/en/headless); [Sub-agents](https://code.claude.com/docs/en/sub-agents)

## D4 · Prompt Engineering & Structured Output (20%)

### 4.1 Tiêu chí tường minh để tăng precision

- Tiêu chí cụ thể thay cho chỉ dẫn mơ hồ: "flag comment chỉ khi hành vi được mô tả mâu thuẫn với code thực" thay vì "kiểm tra comment có đúng không".
- "Be conservative", "chỉ báo khi chắc chắn" **không** cải thiện precision bằng tiêu chí phân loại cụ thể.
- Tỉ lệ false positive cao ở một nhóm làm mất niềm tin vào cả các nhóm chính xác → tạm tắt nhóm nhiễu cao trong lúc sửa prompt; định nghĩa mức severity kèm ví dụ code cho từng mức.

### 4.2 Few-shot

- Few-shot là kỹ thuật hiệu quả nhất để có output **nhất quán về định dạng** khi chỉ dẫn chi tiết vẫn không đều.
- Dùng 2–4 ví dụ nhắm vào ca mơ hồ, **có giải thích vì sao chọn A thay vì phương án hợp lý khác** → model khái quát hoá sang ca mới, không chỉ khớp mẫu.
- Ví dụ thể hiện định dạng (location, issue, severity, suggested fix); phân biệt pattern chấp nhận được với lỗi thật; xử lý tài liệu cấu trúc khác nhau (inline citation vs bibliography); giảm hallucination / giảm trường bắt buộc bị rỗng khi trích xuất.

### 4.3 Structured output bằng tool use + JSON schema

- `tool_use` với JSON schema là cách tin cậy nhất để có output đúng schema, **loại bỏ lỗi cú pháp JSON**; nhưng **không** chặn lỗi ngữ nghĩa (line item không cộng ra total, giá trị sai trường).
- `tool_choice: "any"` khi có nhiều schema trích xuất và chưa biết loại tài liệu; forced tool để một bước trích xuất chạy trước.
- Thiết kế schema: trường **optional / nullable** khi nguồn có thể không có thông tin (tránh model bịa để lấp trường required); enum có `"unclear"` cho ca mơ hồ, `"other"` + trường mô tả cho danh mục mở rộng; kèm quy tắc chuẩn hoá định dạng trong prompt.

### 4.4 Validate, retry, feedback loop

- **Retry-with-error-feedback**: gửi lại tài liệu gốc + bản trích xuất lỗi + **lỗi validation cụ thể**.
- Retry vô ích khi thông tin **không có trong nguồn** (vd. chỉ có ở tài liệu ngoài không được cung cấp); hữu ích với lỗi định dạng / cấu trúc.
- Trường `detected_pattern` trong finding để phân tích mẫu bị dev dismiss (false positive).
- Tự kiểm: trích `calculated_total` cạnh `stated_total` để bắt chênh lệch; cờ `conflict_detected` cho dữ liệu nguồn mâu thuẫn.

### 4.5 Batch processing

- Message Batches API: **tiết kiệm 50%**, xử lý tối đa **24 giờ**, **không có SLA độ trễ**; `custom_id` để ghép request/response. **Không hỗ trợ multi-turn tool calling** trong một request.
- Hợp: việc không chặn, chịu trễ (báo cáo đêm, audit tuần, sinh test hằng đêm). Không hợp: việc chặn (pre-merge check).
- Tính tần suất nộp theo SLA (vd. nộp mỗi 4 giờ để bảo đảm SLA 30 giờ với thời gian xử lý tối đa 24 giờ).
- Lỗi: chỉ nộp lại phần hỏng theo `custom_id`, có chỉnh sửa (vd. chia nhỏ tài liệu vượt context). Tinh chỉnh prompt trên mẫu nhỏ trước khi chạy khối lớn.
- Docs: kết quả batch tải được trong 29 ngày; giảm giá batch cộng dồn được với prompt caching.

### 4.6 Review nhiều instance, nhiều lượt

- Self-review yếu vì model giữ reasoning context của chính nó; **instance độc lập** (không có context sinh code) bắt lỗi tốt hơn cả chỉ dẫn self-review hay extended thinking.
- Multi-pass: per-file local pass + integration pass cho luồng dữ liệu cross-file.
- Verification pass có model tự báo confidence cho từng finding để định tuyến review.

### Cần nắm chắc

- Tool use + schema = đúng cú pháp; vẫn phải validate ngữ nghĩa.
- Nullable để chống bịa; `"other"` + detail; `"unclear"`.
- Batch: 50% / ≤ 24h / không SLA / `custom_id` / không multi-turn tool.
- Few-shot cho nhất quán định dạng và ca mơ hồ.

### Bẫy thường gặp

- Chuyển **cả** pre-merge check sang batch, kể cả "có polling" hay "timeout fallback" (Q11).
- "Batch không giữ thứ tự nên không dùng được" — sai, đã có `custom_id`.
- Đổi sang model lớn / context dài hơn để chữa attention dilution (Q12); chạy 3 lượt rồi lấy đồng thuận (giấu bug thật).
- Ép dev chia nhỏ PR thay vì sửa kiến trúc review.
- Retry mãi cho trường mà tài liệu không chứa.
- Đặt trường required cho thông tin có thể vắng → model bịa.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 4, §9; [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing); [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)

## D5 · Context Management & Reliability (15%)

### 5.1 Giữ thông tin quan trọng qua hội thoại dài

- Progressive summarization làm mờ số liệu, phần trăm, ngày, kỳ vọng khách đã nói → tách **"case facts" block** (số tiền, ngày, mã đơn, trạng thái) đặt trong mọi prompt, **ngoài** phần lịch sử đã tóm tắt; phiên nhiều vấn đề: lớp context riêng cho dữ liệu từng issue.
- **Lost in the middle**: model xử lý tốt phần đầu và cuối input dài, dễ bỏ sót phần giữa → đặt tóm tắt phát hiện chính ở **đầu**, chia phần chi tiết bằng header rõ.
- Tool result tích tụ, tốn token không tương xứng (40+ trường/đơn hàng khi chỉ cần 5) → cắt còn trường liên quan **trước khi** đưa vào context.
- Luôn gửi **đầy đủ lịch sử hội thoại** ở các request sau (API không lưu trạng thái).
- Subagent trả dữ liệu có cấu trúc (fact chính, trích dẫn, điểm liên quan, metadata ngày/nguồn) thay cho văn bản dài khi agent sau có ngân sách context hạn chế.

### 5.2 Escalation và xử lý mơ hồ

- Trigger đúng: khách **yêu cầu gặp người**, **ngoại lệ / khoảng trống chính sách** (không chỉ vì ca phức tạp), **không thể tiến triển**.
- Khách đòi gặp người → chuyển **ngay**, không điều tra trước. Khách bực nhưng việc trong khả năng → ghi nhận cảm xúc, đề nghị giải quyết; chỉ escalate nếu khách nhắc lại.
- Chính sách im lặng / mơ hồ với yêu cầu cụ thể (vd. đòi price-match đối thủ khi chính sách chỉ nói điều chỉnh giá trên site mình) → escalate.
- Sentiment và confidence tự báo **không** là thước đo tin cậy cho độ phức tạp.
- Nhiều khách trùng khớp → hỏi thêm định danh, không đoán bằng heuristic.
- Cách sửa chuẩn: tiêu chí escalate tường minh + few-shot trong system prompt.

### 5.3 Lan truyền lỗi trong hệ multi-agent

- Lỗi có cấu trúc: loại lỗi, truy vấn đã thử, kết quả một phần, phương án thay thế → coordinator quyết định phục hồi.
- Hai anti-pattern: **nuốt lỗi** (trả rỗng như thành công) và **dừng cả workflow** vì một lỗi.
- Trạng thái chung chung ("search unavailable") che mất thông tin.
- Báo cáo tổng hợp có **coverage annotation**: phần nào đủ căn cứ, phần nào thiếu do nguồn không truy cập được.

### 5.4 Context khi khám phá codebase lớn

- Phiên dài bị suy giảm: trả lời thiếu nhất quán, nói "typical patterns" thay vì class cụ thể đã thấy.
- **Scratchpad file** ghi phát hiện chính, tra lại cho câu hỏi sau.
- Giao subagent điều tra câu hỏi cụ thể ("find all test files", "trace refund flow dependencies"), agent chính giữ bức tranh tổng.
- Tóm tắt kết quả pha trước rồi mới spawn subagent pha sau, tiêm tóm tắt vào context đầu.
- Crash recovery: mỗi agent xuất state ra vị trí biết trước; coordinator nạp **manifest** khi resume.
- `/compact` khi context đầy output khám phá.

### 5.5 Human review và confidence calibration

- Độ chính xác tổng (vd. 97%) có thể che kết quả kém ở một loại tài liệu / trường → phân tích theo loại tài liệu và theo trường **trước khi** giảm review người.
- **Stratified random sampling** các bản trích xuất confidence cao để đo tỉ lệ lỗi và phát hiện mẫu lỗi mới.
- Confidence theo **từng trường**, hiệu chỉnh ngưỡng bằng **labeled validation set**; đưa ca confidence thấp hoặc nguồn mơ hồ/mâu thuẫn cho người, ưu tiên năng lực review có hạn.

### 5.6 Provenance và bất định khi tổng hợp nhiều nguồn

- Attribution mất khi tóm tắt nén mà không giữ ánh xạ claim–source → bắt subagent xuất **claim-source mapping** (URL, tên tài liệu, trích đoạn) và synthesis phải giữ/merge.
- Số liệu mâu thuẫn từ nguồn uy tín → **ghi cả hai kèm nguồn**, không tự chọn một; để coordinator quyết định trước khi synthesis.
- Yêu cầu ngày xuất bản / thu thập để không hiểu nhầm khác biệt thời gian là mâu thuẫn.
- Báo cáo tách phần đã xác lập và phần còn tranh cãi; trình bày theo loại nội dung (tài chính → bảng, tin tức → văn xuôi, kỹ thuật → danh sách).

### Cần nắm chắc

- Case facts block + cắt tool output + đặt tóm tắt ở đầu.
- Ba trigger escalate; khách đòi người → chuyển ngay.
- Lỗi có cấu trúc, phân biệt access failure / empty result, coverage annotation.
- Scratchpad, subagent cô lập, manifest, `/compact`.
- Stratified sampling + calibration theo trường.

### Bẫy thường gặp

- Escalate theo sentiment hoặc confidence 1–10 tự báo (Q3); classifier riêng khi chưa thử sửa prompt.
- Retry nội bộ rồi trả "search unavailable" chung chung (Q8).
- Tin con số accuracy tổng để bỏ review người.
- Chọn một con số khi hai nguồn mâu thuẫn; đánh đồng khác biệt thời gian với mâu thuẫn.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §6 Domain 5, §9

## Phạm vi: trong đề và ngoài đề

**Trong đề (guide liệt kê tường minh):** agentic loop theo `stop_reason`; orchestration coordinator–subagent, chạy song song, vòng tinh chỉnh; truyền context cho subagent, state persistence, crash recovery bằng manifest; thiết kế mô tả tool, tách/gộp tool, đặt tên; MCP tool vs resource; cấu hình MCP (project/user, env var, nhiều server); lỗi có cấu trúc; escalation; CLAUDE.md (hierarchy, `@import`, `.claude/rules/` glob); command/skill (scope, `context: fork`, `allowed-tools`, `argument-hint`); plan mode vs direct; tinh chỉnh lặp; structured output qua `tool_use`; few-shot; batch; tối ưu context; human review; provenance.

**Công nghệ có thể xuất hiện:** Agent SDK (AgentDefinition, hooks `PostToolUse`, Task tool, `allowedTools`), MCP (`isError`, `.mcp.json`), Claude Code (CLAUDE.md, rules, commands, skills, plan mode, `/memory`, `/compact`, `--resume`, `fork_session`, Explore subagent), CLI (`-p`, `--output-format json`, `--json-schema`), Claude API (`tool_use`, `tool_choice`, `stop_reason`, `max_tokens`, system prompt), Message Batches, JSON Schema, Pydantic, built-in tools, few-shot, prompt chaining, quản lý context, session, confidence scoring.

**Ngoài đề:** fine-tuning / huấn luyện model; authentication, billing, quản lý tài khoản API; chi tiết ngôn ngữ/framework cụ thể; deploy/host MCP server (hạ tầng, mạng, container); kiến trúc nội bộ Claude, training, weights; Constitutional AI, RLHF; embedding / vector DB; computer use; vision; streaming / SSE; rate limit, quota, tính giá; xoay API key, giao thức auth; cấu hình cloud cụ thể (AWS, GCP, Azure); benchmark so sánh model; chi tiết triển khai prompt caching (chỉ cần biết nó tồn tại); thuật toán đếm token.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §17 Appendix

## Bài tập chuẩn bị (theo guide)

1. **Agent nhiều tool có escalation** (D1, D2, D5): 3–4 MCP tool mô tả phân biệt rõ (có 2 tool dễ nhầm); vòng lặp theo `stop_reason`; lỗi có `errorCategory` + `isRetryable`; hook chặn thao tác vượt ngưỡng → escalate; thử yêu cầu nhiều vấn đề.
2. **Cấu hình Claude Code cho team** (D3, D2): CLAUDE.md cấp project; `.claude/rules/` với glob (`src/api/**/*`, `**/*.test.*`); skill project có `context: fork` + `allowed-tools` (docs hiện hành: chỉ cấp sẵn quyền; muốn chặn tool thì thêm `disallowed-tools`, xem mục 3.2); `.mcp.json` dùng env var + server cá nhân trong `~/.claude.json`; so plan mode và direct trên 3 loại việc.
3. **Pipeline trích xuất dữ liệu** (D4, D5): schema có required/optional, enum `"other"` + detail, nullable; vòng validate–retry (phân biệt lỗi sửa được và thông tin vắng); few-shot cho định dạng khác nhau; batch 100 tài liệu, xử lý lỗi theo `custom_id`; định tuyến review theo confidence từng trường.
4. **Pipeline research multi-agent** (D1, D2, D5): coordinator có `"Task"` trong `allowedTools` (theo guide; docs hiện hành: tool `Agent` chạy dù không liệt kê, xem mục 1.3); subagent song song; output tách claim / evidence / URL / ngày; giả lập timeout và kiểm tra lỗi có cấu trúc + coverage gap; nguồn mâu thuẫn phải giữ cả hai giá trị.

Nguồn: [CCAR-F Exam Guide v1.0](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) §7–8

## Tài liệu chính thức nên học

- Exam guide: [CCAR-F Exam Guide v1.0 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) — đọc kỹ 30 task statement và 12 câu mẫu.
- Lộ trình prep trên Partner Academy (cần tài khoản partner): [Claude Certified Architect – Foundations Prep Courses](https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses) — AI Fluency: Framework & Foundations, Building with the Claude API, Claude on Google Cloud, Claude Code in Action, Claude 101, Claude with Amazon Bedrock, Introduction to Model Context Protocol.
- Các khoá tương ứng công khai trên Claude Academy: [Building with the Claude API](https://academy.claude.com/courses/building-with-the-claude-api), [Claude Code in action](https://academy.claude.com/courses/claude-code-in-action), [Introduction to Model Context Protocol](https://academy.claude.com/courses/introduction-to-model-context-protocol), [MCP: Advanced topics](https://academy.claude.com/courses/model-context-protocol-advanced-topics), [Tool use with the Messages API](https://academy.claude.com/courses/tool-use-with-the-messages-api), [Introduction to agent skills](https://academy.claude.com/courses/introduction-to-agent-skills).
- Agent SDK: [Overview](https://code.claude.com/docs/en/agent-sdk/overview), [Subagents](https://code.claude.com/docs/en/agent-sdk/subagents), [Sessions](https://code.claude.com/docs/en/agent-sdk/sessions).
- Claude Code: [Memory / CLAUDE.md / rules](https://code.claude.com/docs/en/memory), [Skills](https://code.claude.com/docs/en/skills), [Slash commands](https://code.claude.com/docs/en/slash-commands), [Sub-agents](https://code.claude.com/docs/en/sub-agents), [Hooks](https://code.claude.com/docs/en/hooks), [MCP](https://code.claude.com/docs/en/mcp), [Headless (-p)](https://code.claude.com/docs/en/headless), [CLI reference](https://code.claude.com/docs/en/cli-reference), [Common workflows](https://code.claude.com/docs/en/common-workflows), [GitHub Actions](https://code.claude.com/docs/en/github-actions).
- Claude API: [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), [Define tools / tool_choice](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools), [Handling stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons), [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [Prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview).
- MCP: [Architecture](https://modelcontextprotocol.io/docs/learn/architecture), [Tools](https://modelcontextprotocol.io/specification/latest/server/tools), [Resources](https://modelcontextprotocol.io/specification/latest/server/resources).
- Bài viết kỹ thuật của Anthropic: [Building effective agents](https://www.anthropic.com/research/building-effective-agents), [Writing tools for agents](https://www.anthropic.com/research/writing-tools-for-agents), [How we built our multi-agent research system](https://www.anthropic.com/research/multi-agent-research-system), [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents).
- Bài học trong app: [Thực hành và tổng ôn CCAR-F](../lessons/18-ccar-f-lab.html) (lab Ex1–Ex4, phạm vi đề); ôn theo domain: D1 [Agent và điều phối](../lessons/07-agents.html), [Claude Platform, subagent và skill](../lessons/08-platform-subagents-skills.html) · D2 [Tool use](../lessons/05-tool-use.html), [Model Context Protocol (MCP)](../lessons/06-mcp.html) · D3 [Claude Code nhập môn](../lessons/12-claude-code-basics.html), [Claude Code: cấu hình, CI và quyền](../lessons/13-claude-code-config.html) · D4 [Prompt và output có cấu trúc](../lessons/04-prompt-output.html) · D5 [Context và độ tin cậy](../lessons/09-context-reliability.html). Tra từ khoá: [Thuật ngữ và từ khoá đề thi](../lessons/glossary.html).

Nguồn: [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [CCAR-F Prep Courses](https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses); [Claude Academy](https://academy.claude.com/)
