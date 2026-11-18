# Soát câu hỏi — pack ai-20261118-ccaof-ccdvf — 2026-11-18
Người soát: claude-opus-5-5 (người soát độc lập, không phải phiên sinh câu) · Phạm vi: toàn bộ pack `ai-20261118-ccaof-ccdvf` (bỏ giới hạn 30 câu/lượt theo yêu cầu) · Số câu: 45 (30 CCAO-F, 15 CCDV-F)

Cách làm: tự giải từng câu trước khi đọc `answer` (đáp án tự giải khớp khoá ở cả 45 câu), rồi đối chiếu khoá và từng phương án nhiễu với trang tài liệu chính thức đã mở trong phiên (không dựa vào URL ghi trong giải thích). Kiểm `ref` bằng anchor `id="…"` trong `notes/lessons/`, mapping theo `exams.yaml` + `notes/exams/CCAO-F.md`, `CCDV-F.md`, `CCAR-F.md`, trùng lặp bằng tìm theo khái niệm trong `bank/packs/ccx.yaml`.

## Tổng kết

| Kết luận | Số câu |
|---|---|
| PASS | 41 |
| FIX | 4 |
| RETIRE | 0 |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

## Lỗi theo tiêu chí

| Tiêu chí | Số câu trượt |
|---|---|
| a. Đáp án đúng | 0 |
| b. Đúng một đáp án | 0 |
| c. Phương án nhiễu / manh mối | 2 (AI-CCAOF-002, AI-CCAOF-005) |
| d. Stem | 1 (AI-CCAOF-002, phương án lệch với stem) |
| e. Giải thích | 1 (AI-CCAOF-028) |
| f. Gắn kỳ thi / domain / scenario / ref | 1 (AI-CCDVF-008) |
| g. Trùng lặp | 0 (có 4 cặp gần giống, xem *Rủi ro còn lại*) |

## Chi tiết

| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đã sửa gì | Nguồn |
|---|---|---|---|---|---|
| AI-CCAOF-001 | CCAO-F D1 | PASS | — | Khớp ví dụ TTS “never use ellipses” trong mục Add context. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-002 | CCAO-F D1 | FIX | c, d | Phương án nhiễu “Add ‘Do not use markdown’ a second time” không khớp stem (prompt gốc ghi “Do not use bullet points”), nên đổi thành “Add ‘Do not use bullet points’ a second time…”. Khoá B+D đúng (tell what to do + match prompt style). | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-003 | CCAO-F D1 | PASS | — | Ví dụ relevant / diverse / trong thẻ `<example>`, 3–5 ví dụ. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-004 | CCAO-F D1 | PASS | — | Mục XML tags: bọc từng loại nội dung (`<instructions>`, `<input>`) để giảm hiểu nhầm. Không còn phương án nào bảo vệ được. Gần giống PA28 (CCAR-P) nhưng khác kỳ thi. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-005 | CCAO-F D1 | FIX | c | Đáp án lặp nguyên văn cụm từ của stem (“filters, charts by workstream and an overdue view”) nên lộ đáp án. Đã diễn đạt lại thành “Include a filter panel, a chart per workstream and a list of late tasks; go beyond the basics.” Khoá D giữ nguyên (ví dụ “Create an analytics dashboard … go beyond the basics”). | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-006 | CCAO-F D1 | PASS | — | “Sequential steps using numbered lists… when the order or completeness of steps matters”. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-007 | CCAO-F D1 | PASS | — | Mục Give Claude a role (“Even a single sentence makes a difference”). | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-008 | CCAO-F D1 | PASS | — | Help center: ghi “Use web search” trong prompt để chắc Claude tìm; mọi câu trả lời kèm citation. | https://support.claude.com/en/articles/10684626-enabling-and-using-web-search |
| AI-CCAOF-009 | CCAO-F D2 | PASS | — | Verify with citations, ví dụ press release từ product brief, rút lại claim không có quote. | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| AI-CCAOF-010 | CCAO-F D2 | PASS | — | Allow Claude to say “I don't know”, ví dụ báo cáo M&A. | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| AI-CCAOF-011 | CCAO-F D2 | PASS | — | Direct quotes for factual grounding, ví dụ privacy policy GDPR/CCPA. | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| AI-CCAOF-012 | CCAO-F D2 | PASS | — | Help center: phần Thinking mở rộng được, “Reviewing it can be valuable for verifying how Claude arrived at its conclusion”; trang hallucination: chain-of-thought verification. | https://support.claude.com/en/articles/10574485-using-extended-thinking · https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| AI-CCAOF-013 | CCAO-F D2 | PASS | — | Help center web search: “Use authoritative sources for critical decisions”, “Cross-reference cited sources”. | https://support.claude.com/en/articles/10684626-enabling-and-using-web-search |
| AI-CCAOF-014 | CCAO-F D2 | PASS | — | Chain complex prompts: self-correction draft → review theo tiêu chí → refine. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-015 | CCAO-F D2 | PASS | — | RAG tự bật khi gần/vượt context, dùng project knowledge search tool; mẹo “refer to specific documents by name”. Trang nói độ chính xác “remains consistent with in-context processing”, nhưng phương án nhiễu sai vì “guarantees” + chấp nhận câu trả lời chung chung không rõ nguồn; giải thích đã nêu đúng ý này. Có Team plan. | https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects |
| AI-CCAOF-016 | CCAO-F D2 | PASS | — | Research dùng connector tự động “without asking for approval each time”. Phương án “tắt web search” còn bất khả vì Research bắt buộc bật web search. | https://support.claude.com/en/articles/11088861-using-research-on-claude |
| AI-CCAOF-017 | CCAO-F D2 | PASS | — | Research and information gathering: verify across multiple sources, track confidence levels. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCAOF-018 | CCAO-F D2 | PASS | — | Note “don't eliminate them entirely… validate critical information”; best-of-N verification. | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| AI-CCAOF-019 | CCAO-F D3 | PASS | — | Web search “one or two tool calls”; Research “five or more tool calls over 1-3 minutes”, dùng giới hạn nhanh hơn. | https://support.claude.com/en/articles/11095361-when-should-i-use-web-search-extended-thinking-and-research · https://support.claude.com/en/articles/11088861-using-research-on-claude |
| AI-CCAOF-020 | CCAO-F D3 | PASS | — | Kết hợp extended thinking + Research, ví dụ emerging technologies cho business proposal. | https://support.claude.com/en/articles/11095361-when-should-i-use-web-search-extended-thinking-and-research |
| AI-CCAOF-021 | CCAO-F D3 | PASS | — | “The thinking toggle doesn't appear for models where thinking is always on”, chọn effort thấp hơn trong model menu; Low/Medium “stretch your usage further”. | https://support.claude.com/en/articles/10574485-using-extended-thinking |
| AI-CCAOF-022 | CCAO-F D4 | PASS | — | “No API keys are required”, “usage counts against each person's own plan limits”, Team/Enterprise dùng không cộng chi phí cho người tạo. | https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them |
| AI-CCAOF-023 | CCAO-F D4 | PASS | — | Personal storage chỉ người đó thấy, shared storage mọi người thấy; người dựng quyết định. | https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them |
| AI-CCAOF-024 | CCAO-F D4 | PASS | — | “MCP connections give Claude access to tools, while skills teach Claude how to use those tools effectively”. | https://support.claude.com/en/articles/12512176-what-are-skills |
| AI-CCAOF-025 | CCAO-F D5 | PASS | — | Mỗi Project có memory riêng; tắt “Use account memory” trên trang Project để tách hẳn; reset xoá cả memory Project. | https://support.claude.com/en/articles/11817273-using-claude-s-chat-search-and-memory-to-build-on-previous-context |
| AI-CCAOF-026 | CCAO-F D5 | PASS | — | Always allow / Needs approval / Blocked, “applies org-wide… individual users can't override it”; shared credential mở rộng truy cập. | https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities |
| AI-CCAOF-027 | CCAO-F D5 | PASS | — | Pause giữ memory, không dùng/không tạo mới; reset không hoàn tác; Owner không xem được memory cá nhân. | https://support.claude.com/en/articles/11817273-using-claude-s-chat-search-and-memory-to-build-on-previous-context |
| AI-CCAOF-028 | CCAO-F D7 | FIX | e | Khoá C đúng (mobile: Research chỉ tìm web, không báo lỗi; bắt đầu trên web/Desktop). Giải thích viết “uỷ quyền Drive không hết hạn… theo tài liệu” là điều tài liệu không nói; đã sửa thành “tài liệu không nói uỷ quyền hết hạn; nguyên nhân là Research trên mobile không dùng connector”. | https://support.claude.com/en/articles/11088861-using-research-on-claude |
| AI-CCAOF-029 | CCAO-F D7 | PASS | — | “Custom connectors connect to your MCP server from Anthropic's cloud, not from your local device”; cần reachable qua internet hoặc allowlist IP Anthropic. | https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities |
| AI-CCAOF-030 | CCAO-F D7 | PASS | — | Owner bật/tắt memory cho cả org tại Organization settings > Capabilities, “can't turn memory on for individual users”. | https://support.claude.com/en/articles/11817273-using-claude-s-chat-search-and-memory-to-build-on-previous-context |
| AI-CCDVF-001 | CCDV-F D1 · CCAR-F D1 | PASS | — | Parallelization/voting, ví dụ review code tìm lỗ hổng, gắn cờ nếu bất kỳ prompt nào thấy vấn đề. | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCDVF-002 | CCDV-F D1 · CCAR-F D1 | PASS | — | Prompt chaining + programmatic “gate”, ví dụ outline → kiểm tiêu chí → document. | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCDVF-003 | CCDV-F D1 · CCAR-F D5 | PASS | — | Multi-context-window: tests.json + “unacceptable to remove or edit tests”, init.sh. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-004 | CCDV-F D1 | PASS | — | Balancing autonomy and safety: git push --force, “commenting on PRs/issues” cần xác nhận; sửa file, chạy test là local/reversible. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-005 | CCDV-F D2 · CCAR-F D4 · S6 | PASS | — | Migrating away from prefill → structured outputs hoặc yêu cầu đúng cấu trúc + retry; prefill lượt cuối trả 400 từ Claude 4.6. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-006 | CCDV-F D2 | PASS | — | Continuations: chuyển yêu cầu viết tiếp vào user message, kèm đoạn cuối bị ngắt. Giới hạn prefill theo model nên Batches không là lối thoát. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-007 | CCDV-F D2 · CCAR-F D4 | PASS | — | “For classification tasks, use either tools with an enum field containing your valid labels or structured outputs.” | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-008 | CCDV-F D7 · CCAR-F D2 | FIX | f | Khoá D đúng nguyên văn (“The agent must never pay: Give it a tool that requests or queues a payment… and no tool that can move money”; “The block guides Claude and doesn't enforce anything”). Đổi CCDV-F D2 → D7: bản chất là least privilege / kiểm soát enforce được thay cho lời dặn trong prompt (task D7), không phải Applications & Integration. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-009 | CCDV-F D5 | PASS | — | Option 2 capability-first: complex reasoning, scientific/math, accuracy outweighs cost; sau đó giảm effort hoặc hạ model. | https://platform.claude.com/docs/en/about-claude/models/choosing-a-model |
| AI-CCDVF-010 | CCDV-F D5 | PASS | — | “Tuning effort is often a better lever than switching models”, điều chỉnh theo eval; fast mode “at premium pricing”. | https://platform.claude.com/docs/en/about-claude/models/choosing-a-model · https://platform.claude.com/docs/en/build-with-claude/fast-mode |
| AI-CCDVF-011 | CCDV-F D5 | PASS | — | Giới hạn theo câu/đoạn tốt hơn số từ; streaming cải thiện độ phản hồi cảm nhận. | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency |
| AI-CCDVF-012 | CCDV-F D5 | PASS | — | max_tokens cắt cứng “perhaps mid-sentence or mid-word”, hợp với multiple-choice/short-answer ở đầu. | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency |
| AI-CCDVF-013 | CCDV-F D6 | PASS | — | Eliminating preambles: chỉ dẫn trực tiếp trong system prompt; thêm assistant message cuối = prefill → 400. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-014 | CCDV-F D6 · CCAR-F D4 | PASS | — | Long context prompting: `<document>` + `<source>` + `<document_content>`, tài liệu ở đầu, câu hỏi cuối (tới 30%). | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCDVF-015 | CCDV-F D6 · CCAR-F D5 | PASS | — | Context awareness: harness có compaction / lưu file → nói rõ trong prompt để Claude không dừng sớm, lưu tiến độ trước khi refresh. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |

## Cần người xem

Không có.

## Rủi ro còn lại

- **Cặp gần giống với `ccx.yaml` (không coi là trùng, không retire):**
  - AI-CCAOF-010 ↔ K156 (CCAO-F D7): cùng ý “cho Claude nói khi tài liệu không có thông tin”. AI-010 bám ví dụ M&A chính thức, đối lập với “dùng kiến thức chung lấp chỗ trống”; K156 gộp restrict + cite + nói “không có”. Câu AI tốt hơn; nếu muốn bỏ một câu, cân nhắc K156 (pack khác, ngoài phạm vi).
  - AI-CCAOF-013 ↔ K05 (CCAO-F D2): cùng kết luận “đối chiếu nguồn gốc chính thức trước khi đưa cho compliance/legal”. AI-013 khác góc: citation web search trỏ tới nguồn thứ cấp (blog).
  - AI-CCAOF-016 ↔ K87 (CCAO-F D2): cùng kết luận “gỡ thông tin nội bộ trước khi gửi đối tác”. AI-016 kiểm thêm kiến thức Research dùng connector không hỏi duyệt.
  - AI-CCAOF-004 ↔ PA28 (CCAR-P D2): cùng quyết định “bọc hợp đồng trong thẻ XML”, nhưng khác kỳ thi.
- Bốn câu CCDV-F (005, 006, 007, 013) cùng xoáy vào mục “Migrating away from prefilled responses”, mỗi câu một tình huống. Ổn, nhưng nếu có thêm câu về prefill thì sẽ dồn một khái niệm.
- **Dễ lỗi thời:** danh sách model không tắt được thinking và vị trí chọn effort trong model menu (021), Research chạy trên model nào và hành vi trên mobile (028), giá/khả dụng của fast mode (CCDVF-010), danh sách model có context awareness (CCDVF-015), chuyện prefill trả 400 (từ Claude 4.6). Ngoài ra, đề CCAO-F có nội dung mới từ 07/12/2026, cần soát lại mapping khi có guide mới.
- **Mẫu lỗi của người sinh câu:** (1) phương án đúng chép lại cụm từ của stem (005); (2) một phương án nhiễu không khớp chi tiết stem (002); (3) giải thích viện “theo tài liệu” cho điều tài liệu không nói (028); (4) xếp câu bảo mật/least-privilege vào domain Integration (CCDVF-008). Không có lỗi đáp án.
- Tiêu đề pack vẫn ghi “CCDV-F (D1/D2/D5/D6)”, nhưng AI-CCDVF-008 giờ thuộc D7. Đây là metadata, không ảnh hưởng app.
- AI-CCAOF-021 khẳng định “incognito không giảm mức dùng” mà không có nguồn trực tiếp (suy luận hợp lý: incognito chỉ ảnh hưởng lịch sử/memory).

## Để lượt sau

Không có. Đã soát đủ 45/45 câu.
