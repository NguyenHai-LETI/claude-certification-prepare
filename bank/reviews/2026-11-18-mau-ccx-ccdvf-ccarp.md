# Soát câu hỏi — mẫu ngẫu nhiên pack `ccx` (CCDV-F 15 + CCAR-P 5) — 2026-11-18
Người soát: claude-opus-5-5 (người soát độc lập) · Phạm vi: `bank/packs/ccx.yaml` — CCDV-F: G55, X10, C251, H04, C256, B06, U05, L05, U09, F58, B28, E66, C255, W08, F59 · CCAR-P: PA28, PC43, PD25, PA29, PB08 · Số câu: 20

Cách làm: mẫu ngẫu nhiên để đo tỉ lệ lỗi của pack `ccx` (955 câu, nguồn ẩn danh, chưa soát). Mỗi câu được tự giải trước khi xem `answer`, rồi đối chiếu khoá và từng phương án nhiễu với trang tài liệu chính thức mở trong phiên (WebFetch). Mapping kiểm theo `exams.yaml` và `notes/exams/CCDV-F.md`, `CCAR-P.md`. `ref` kiểm bằng anchor `id="…"` trong `notes/lessons/` (cả 20 anchor đều có thật). Trùng lặp kiểm bằng Grep theo khái niệm trong `bank/packs/*.yaml`.
**Ngoại lệ so với skill:** nhiều agent soát song song trên cùng file nên phiên này **không sửa** `bank/packs/` và không thêm `reviewed:` / `status:`. Mọi chỉnh sửa nằm ở mục *Đề xuất sửa* để áp dụng sau. Không chạy validate, không commit.

## Tổng kết

| Kết luận | Số câu |
|---|---|
| PASS | 10 |
| FIX | 9 |
| RETIRE | 1 |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

- **Số câu đáp án sai (tiêu chí a): 0 / 20**
- **Số câu không có đúng một đáp án bảo vệ được (tiêu chí b): 0 / 20**

Tự giải khớp khoá ở cả 20 câu. 10/20 câu có ít nhất một lỗi chất lượng: phương án nhiễu lộ, giải thích sơ sài, stem chỉ hỏi nhớ, mapping, hoặc trùng.

## Lỗi theo tiêu chí

| Tiêu chí | Số câu trượt |
|---|---|
| a. Đáp án đúng | 0 |
| b. Đúng một đáp án | 0 |
| c. Phương án nhiễu / manh mối | 5 (H04, C255, F59, PB08, U09) |
| d. Stem / câu chữ | 3 (H04, B06, PA29) |
| e. Giải thích | 6 (H04, B06, L05, F58, B28, F59) |
| f. Gắn kỳ thi / domain / ref | 1 (F58) |
| g. Trùng lặp | 2 (U09 trùng C247; PC43 trùng PC32, giữ PC43) |

## Chi tiết

| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đề xuất sửa | Nguồn |
|---|---|---|---|---|---|
| G55 | CCDV-F D4 | PASS | — | Timeout do tool chậm và parse `tool_use` bằng khớp chuỗi là lỗi tầng tích hợp. Chọn sai tool và bịa giá trị là lỗi output, sửa bằng mô tả tool / schema. Khớp skill "cô lập nguồn lỗi" của D4. | notes/exams/CCDV-F.md (D4, theo Exam Guide v1.0) · https://code.claude.com/docs/en/agent-sdk/hooks |
| X10 | CCDV-F D2 | PASS | — | Header `anthropic-ratelimit-*-remaining` có thật. Giải thích "max_tokens không tính vào OTPM" đúng với tài liệu ("The `max_tokens` parameter does not factor into OTPM rate limit calculations"). Stem thiếu "(Choose two.)" nhưng đã ghi "Which TWO". | https://platform.claude.com/docs/en/api/rate-limits |
| C251 | CCDV-F D1 | PASS | — | Bảng hook của Agent SDK ghi PostToolUse: "Log file changes to an audit trail". PreToolUse chạy trước khi sửa. | https://code.claude.com/docs/en/agent-sdk/hooks |
| H04 | CCDV-F D7 | FIX | c, d, e | Khoá đúng (exit 2 + stderr, hoặc JSON deny). Nhưng stem chỉ hỏi nhớ, không có tình huống. Đáp án dài hơn hẳn vì phần ngoặc. Phương án "Delete the tool from settings…" quá lộ. Giải thích không nói vì sao exit 0 / exit 1 sai. Đề xuất thêm tình huống vào stem, bỏ phần ngoặc ở đáp án, viết lại phương án D (JSON `continue: true` + `systemMessage`), viết lại giải thích. | https://code.claude.com/docs/en/hooks |
| C256 | CCDV-F D1 | PASS | — | Điều tra sự cố mà bước sau phụ thuộc log là việc mở, hợp với agent. Ba việc cố định hợp với workflow. Gần giống C261 về khái niệm nhưng khác góc hỏi (chọn task cụ thể, C261 hỏi tiêu chí trừu tượng). | https://www.anthropic.com/research/building-effective-agents |
| B06 | CCDV-F D5 | FIX | d, e | Khoá đúng: "trade off between response thoroughness and token efficiency with a single model", ảnh hưởng mọi token. Stem chỉ hỏi nhớ. Giải thích không nói vì sao đổi model / context window / "only formatting" sai. Đề xuất thêm tình huống vào stem và viết lại giải thích. | https://platform.claude.com/docs/en/build-with-claude/effort |
| U05 | CCDV-F D4 | PASS | — | Khớp chính xác là việc của code-based grader ("exact match… perfect for tasks with clear-cut, categorical answers"). D4 tên "Eval, Testing, and Debugging" nên hợp. | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests |
| L05 | CCDV-F D1 | FIX | e | Khoá đúng: subagent "returns only a condensed, distilled summary of its work (often 1,000-2,000 tokens)". Giải thích bỏ sót phương án "gửi kết quả thô cho mọi subagent khác". Đề xuất viết lại giải thích. | https://www.anthropic.com/research/effective-context-engineering-for-ai-agents |
| U09 | CCDV-F D1 | RETIRE | c, g | Khoá đúng (routing). Nhưng câu gần trùng C247 (CCDV-F D1: phân loại ticket hỗ trợ rồi gửi tới prompt riêng → Routing): cùng quyết định, cùng đáp án, cùng góc. C247 có phương án nhiễu tốt hơn. Phương án nhiễu của U09 lộ ("pick the longest", "until it scores 10"). Giữ C247, retire U09. | https://www.anthropic.com/research/building-effective-agents |
| F58 | CCDV-F D2 | FIX | e, f | Khoá đúng (Be clear and direct: chỉ dẫn cụ thể về output). Câu về viết chỉ dẫn trong system prompt thuộc D6 Prompt Engineering ("chỉ dẫn rõ ràng… ràng buộc output"), không phải D2. Giải thích không phân tích từng phương án nhiễu. Đề xuất đổi mapping sang `CCDV-F: D6` và viết lại giải thích. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| B28 | CCDV-F D5 | FIX | e | Khoá B+C đúng: tool definitions sai thì "invalidates the entire cache"; timestamp đầu prefix làm hash khác. Giải thích không nói vì sao "gửi lại cùng request" không làm vỡ cache. Đề xuất viết lại giải thích. | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| E66 | CCDV-F D3 | PASS | — | "Create a skill when you keep pasting the same… checklist, or multi-step procedure… a skill's body loads only when it's used". Skill bundle được script. Liên quan D21 (CCDV-F D8) và E29 (CCAR-F) nhưng khác góc (chọn hai, đối chiếu CLAUDE.md). | https://code.claude.com/docs/en/skills |
| C255 | CCDV-F D1 | FIX | c | Khoá đúng (guide CCDV-F nêu Strands, LangGraph, PydanticAI). Cả ba phương án nhiễu đều dùng từ tuyệt đối ("removes", "removes", "only"), chỉ đáp án dùng "can be", nên đoán được không cần kiến thức. Đề xuất viết lại ba phương án nhiễu cho hết từ tuyệt đối và cập nhật giải thích. | notes/exams/CCDV-F.md (D1, Exam Guide v1.0) · https://www.anthropic.com/research/building-effective-agents |
| W08 | CCDV-F D5 | PASS | — | PTC: "rather than requiring round trips through the model… intermediate results are not loaded into Claude's context window". Feature đang stable. Gần giống PC16 (CCAR-P D4) nhưng khác kỳ thi. | https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling |
| F59 | CCDV-F D6 | FIX | c, e | Khoá đúng (long-form data ở đầu; câu hỏi ở cuối tốt hơn tới 30%). Phương án "documents inside the question sentence… on one line" quá vô lý. Giải thích một dòng, không phân tích phương án nhiễu, thiếu nguồn cho con số. Đề xuất thay phương án C bằng "chỉ dẫn → câu hỏi → tài liệu ở cuối" và viết lại giải thích. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| PA28 | CCAR-P D2 | PASS | — | XML tags tách loại nội dung "reduces misinterpretation". Dời xuống cuối ngược khuyến nghị long-form data ở đầu. Gần giống AI-CCAOF-004 nhưng khác kỳ thi. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| PC43 | CCAR-P D5 | PASS | g (cặp) | Test phản thực bằng cặp hồ sơ chỉ khác tên chỉ giới tính là cách đo trực tiếp (Anthropic "systematically vary the demographic information in each prompt"). Gần trùng PC32 (cùng CCAR-P D5, cùng đáp án). PC43 tốt hơn vì độ dài phương án cân, không có từ tuyệt đối, nên giữ PC43 và **đề nghị retire PC32** (ngoài phạm vi lượt này). | https://www.anthropic.com/research/evaluating-and-mitigating-discrimination-in-language-model-decisions |
| PD25 | CCAR-P D7 | PASS | — | Tôn trọng `retry-after`. Batches có rate limit riêng. Cache read không tính ITPM. Hạn mức đặt ở cấp tổ chức nên thêm key không giúp. D7 (hỗ trợ sự cố vận hành) hợp. | https://platform.claude.com/docs/en/api/rate-limits |
| PA29 | CCAR-P D2 | FIX | d | Kỹ thuật đúng (few-shot nhắm ca mơ hồ) nhưng đáp án ghi "Two to four" trong khi tài liệu ghi "Include 3–5 examples for best results", nên người học sẽ nhớ sai con số. Đề xuất sửa thành "Three to five" và bổ sung giải thích. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| PB08 | CCAR-P D3 | FIX | c | Khoá đúng: mục Confused Deputy Problem ("MCP proxy servers… static client IDs… obtain authorization codes without proper user consent"). Ba phương án nhiễu (rate-limit exhaustion, context drift, prompt caching poisoning) không liên quan tới bảo mật OAuth, loại được ngay. Đề xuất thay bằng các tấn công cùng trang (Token passthrough, SSRF, State handle hijacking) và viết lại giải thích. | https://modelcontextprotocol.io/specification/latest/basic/security_best_practices |

## Cần người xem

Không có câu nào phải chờ người xem. Một việc ngoài phạm vi cần quyết định: **PC32** (CCAR-P D5) gần trùng PC43. Đề nghị retire PC32 vì đáp án dài hơn hẳn và phương án nhiễu dùng từ tuyệt đối ("always", "every form").

## Rủi ro còn lại

- **Tỉ lệ lỗi đo được trên mẫu (n = 20):** sai đáp án 0/20 (0%), không đúng-một-đáp-án 0/20 (0%). Có lỗi chất lượng cần sửa hoặc retire ở 10/20 câu (50%). Nếu suy ra cho 955 câu thì khoá đáp án có vẻ đáng tin (khoảng tin cậy 95% cho tỉ lệ sai khoá khoảng 0–17% với n = 20), nhưng khoảng một nửa số câu cần chỉnh nhẹ.
- **Mẫu lỗi lặp lại của người soạn:**
  1. Giải thích quá ngắn (1–2 câu), chỉ nói vì sao đáp án đúng, bỏ qua một hoặc nhiều phương án nhiễu (H04, B06, L05, F58, B28, F59).
  2. Phương án nhiễu kiểu "cho có": vô lý, đùa, hoặc không cùng lĩnh vực (U09 "pick the longest", F59 "on one line", H04 "delete the tool… restart", PB08 "prompt caching poisoning").
  3. Từ tuyệt đối chỉ xuất hiện ở phương án nhiễu (C255; cũng thấy ở PC32).
  4. Stem chỉ hỏi định nghĩa, không có tình huống (B06, H04), lệch với phong cách câu mẫu chính thức.
  5. Gần trùng trong cùng pack giữa các dãy id khác nhau (U09 ~ C247, PC43 ~ PC32). Pack 955 câu nhiều khả năng còn nhiều cặp như vậy, nên chạy một lượt soát trùng riêng.
  6. Đưa con số không khớp tài liệu vào phương án (PA29 "Two to four" so với tài liệu "3–5").
  7. Ghi "(Choose two.)" không nhất quán: G55, E66, PD25 có, X10, B28 không. Không tính là lỗi vì stem đã ghi "Which TWO".
- **Cặp gần giống khác kỳ thi (không tính trùng):** W08 ~ PC16, PD25 ~ X07, E66 ~ D21 / E29, H04 ~ H12, C256 ~ C261, L05 ~ câu CCAR-F dòng 2118, PA28 ~ AI-CCAOF-004.
- **Nội dung dễ lỗi thời:** đề CCDV-F đổi từ 07/12/2026. Hành vi hook (exit code, JSON) và tên mục trong MCP security best practices ("State handle hijacking" thay cho "Session hijacking" từ phiên bản 2026-07-28) có thể còn đổi.
- **Mapping:** câu prompt engineering bị gắn D2 thay vì D6 (F58) gợi ý người soạn có xu hướng dồn câu vào D2, domain nặng nhất. Nên kiểm thêm các câu D2 khác của `ccx`.

## Để lượt sau

- Áp dụng 9 khối FIX và retire U09 ở mục dưới (phiên này không được sửa file). Sau đó thêm `reviewed: 2026-11-18` cho 20 câu và chạy `node scripts/validate.ts`.
- Quyết định retire PC32.
- Soát trùng toàn pack `ccx` theo khái niệm (routing, workflow vs agent, caching, hook exit code, bias test).

## Đề xuất sửa

### H04

**OLD**
```yaml
    stem: How does a PreToolUse command hook block a tool call and tell Claude why?
    options:
      - Exit with code 2 and write the reason to stderr (or return a JSON deny).
      - Exit with code 0 and write the reason to stdout for Claude to read.
      - Print “BLOCKED” followed by the reason to stdout, then exit with code 1.
      - Delete the tool from settings at runtime and restart the session.
    answer:
      - A
    explanation: Exit code 2 chặn lời gọi và gửi stderr lại cho Claude; hoặc output JSON với quyết định `deny`.
```

**NEW**
```yaml
    stem: You are writing a Claude Code PreToolUse command hook that must stop dangerous Bash commands and tell Claude why each one was refused. How should the script signal the block?
    options:
      - Exit with code 2 and write the reason to stderr.
      - Exit with code 0 and write the reason to stdout for Claude to read.
      - Print “BLOCKED” followed by the reason to stdout, then exit with code 1.
      - "Exit with code 0 and print JSON with `continue: true` and the reason in `systemMessage`."
    answer:
      - A
    explanation: "Với PreToolUse, exit code 2 chặn lời gọi tool và Claude nhận nội dung stderr làm lý do. Cách tương đương là exit 0 kèm JSON `hookSpecificOutput` có `permissionDecision` = `deny` và `permissionDecisionReason`. Exit 0 với stdout thường không chặn gì, và stdout thường của PreToolUse không được đưa vào context của Claude. Exit 1 (kể cả khi in “BLOCKED”) chỉ là lỗi không chặn, tool vẫn chạy; tài liệu hooks nói muốn ép chính sách thì dùng exit 2. `continue: true` cho phiên chạy tiếp, còn `systemMessage` chỉ hiển thị cho người dùng, nên không chặn lời gọi và cũng không báo lý do cho Claude."
```

### B06

**OLD**
```yaml
    stem: What does raising the `effort` setting do?
    options:
      - Switches the request to a larger model in the same family automatically.
      - Trades speed and token spend for more thorough reasoning and work.
      - Increases the context window available for the conversation.
      - Only changes the formatting and length of the final output.
    answer:
      - B
    explanation: Effort là núm đánh đổi độ kỹ với tốc độ và token trong cùng một model. Effort thấp hợp với subagent, việc đơn giản.
```

**NEW**
```yaml
    stem: "A teammate proposes raising the `effort` setting on a production Messages API route. What does that change do?"
    options:
      - Switches the request to a larger model in the same family automatically.
      - Trades speed and token spend for more thorough reasoning and work.
      - Increases the context window available for the conversation.
      - Only changes the formatting and length of the final output.
    answer:
      - B
    explanation: "Theo tài liệu Effort, `effort` điều khiển lượng token Claude bỏ ra cho mỗi phản hồi, tức đánh đổi độ kỹ lấy tốc độ và chi phí ngay trong cùng một model. Nó ảnh hưởng mọi token output: text, tool call và thinking. Effort không tự đổi sang model lớn hơn và không tăng context window. Nó cũng không chỉ đổi định dạng hay độ dài; với một số model, tài liệu còn lưu ý effort không làm đổi độ dài câu trả lời một cách đáng tin cậy, muốn đổi độ dài thì dùng prompt. Effort thấp hợp với việc đơn giản cần nhanh và rẻ, như subagent."
```

### L05

**OLD**
```yaml
    explanation: Lợi ích của subagent là cô lập context, nên nó phải trả kết quả cô đọng (tóm tắt, nguồn). `max_tokens` giới hạn output chứ không mở rộng context; bỏ subagent thì context chính càng phình.
```

**NEW**
```yaml
    explanation: "Lợi ích của subagent là cô lập context. Subagent có thể dùng hàng chục nghìn token để tìm kiếm nhưng chỉ nên trả về bản tóm tắt cô đọng (thường 1.000–2.000 token) kèm nguồn (Anthropic, Effective context engineering). Tăng `max_tokens` chỉ nâng giới hạn output của coordinator, không làm context chứa được nhiều hơn. Bỏ subagent để coordinator tự tìm thì kết quả thô đổ thẳng vào context chính, càng phình. Gửi kết quả thô cho mọi subagent khác chỉ nhân bản vấn đề sang context của chúng mà không giảm tải cho coordinator."
```

### F58

**OLD**
```yaml
  - id: F58
    exams:
      CCDV-F: D2
    stem: Your API app's system prompt says “be concise”, but users want detailed answers to complex questions. What is a better instruction?
    options:
      - State when to be brief and when to go deep, with a target length for each case.
      - Remove every instruction about length from the system prompt and let the model decide each time.
      - Write “be concise” in capital letters to make it stronger.
      - Add “be detailed” right after “be concise” so both apply.
    answer:
      - A
    explanation: Chỉ dẫn mơ hồ hoặc mâu thuẫn cho kết quả thất thường. Nêu điều kiện cụ thể (khi nào ngắn, khi nào dài) và độ dài mục tiêu.
```

**NEW**
```yaml
  - id: F58
    exams:
      CCDV-F: D6
    stem: Your API app's system prompt says “be concise”, but users want detailed answers to complex questions. What is a better instruction?
    options:
      - State when to be brief and when to go deep, with a target length for each case.
      - Remove every instruction about length from the system prompt and let the model decide each time.
      - Write “be concise” in capital letters to make it stronger.
      - Add “be detailed” right after “be concise” so both apply.
    answer:
      - A
    explanation: "Claude phản hồi tốt với chỉ dẫn rõ ràng, cụ thể về output (mục Be clear and direct trong Prompting best practices). Vì vậy nên nêu điều kiện: câu hỏi đơn giản thì trả lời ngắn, câu hỏi phức tạp thì đi sâu, kèm độ dài mục tiêu cho từng trường hợp. Bỏ hết chỉ dẫn về độ dài thì mất kiểm soát, độ dài phụ thuộc mặc định của model. Viết hoa “be concise” chỉ làm chỉ dẫn sai mạnh hơn, càng cắt cụt câu trả lời cần chi tiết; tài liệu còn khuyên tránh ngôn từ quá gắt. Thêm “be detailed” ngay sau “be concise” tạo hai chỉ dẫn mâu thuẫn nên kết quả khó đoán."
```

### B28

**OLD**
```yaml
    explanation: "Cache theo tiền tố: đổi bất kỳ phần nào phía trước (tools, đầu system prompt) làm mất cache cho mọi phần sau. Phần sau breakpoint thay đổi thì không sao."
```

**NEW**
```yaml
    explanation: "Cache theo tiền tố, thứ tự tools → system → messages; đổi bất kỳ phần nào ở hoặc trước breakpoint thì hash tiền tố khác. Timestamp ở đầu system prompt đổi theo mỗi request nên không bao giờ trúng cache. Sửa một tool definition làm mất toàn bộ cache (tools, system, messages). Gửi lại đúng request đó trong thời gian sống của cache (mặc định 5 phút) thì trúng cache. Chỉ đổi câu hỏi cuối nằm sau breakpoint thì tiền tố đã cache vẫn giữ nguyên."
```

### C255

**OLD**
```yaml
      - An agent framework removes the need to design tools, prompts and stopping rules.
      - Using a framework removes the API's rate limits and token costs for the team.
      - Claude can be the model inside agent frameworks such as LangGraph, Strands or PydanticAI.
      - Claude can only be used through the Claude Agent SDK, not through third-party frameworks.
    answer:
      - C
    explanation: Framework agent (Strands, LangGraph, PydanticAI…) là lớp trừu tượng gọi model qua API, nên dùng được Claude. Framework không thay được việc thiết kế tool, prompt, điều kiện dừng, và không đổi giới hạn hay chi phí API.
```

**NEW**
```yaml
      - The framework designs the tools, prompts and stopping rules itself, so the team can skip that work.
      - Claude calls made through a framework are billed and rate-limited separately from the team's API usage.
      - Claude can be the model inside agent frameworks such as LangGraph, Strands or PydanticAI.
      - The team must first rewrite its workflows with the Claude Agent SDK, because LangGraph cannot call Claude.
    answer:
      - C
    explanation: "Exam Guide CCDV-F nêu Strands, LangGraph, PydanticAI là framework agent bên thứ ba dùng được với Claude. Framework là lớp trừu tượng gọi model qua API, nên team giữ LangGraph và dùng Claude làm model. Framework không tự thiết kế tool, prompt và điều kiện dừng thay team; Anthropic còn lưu ý lớp trừu tượng có thể che prompt và response, làm khó debug. Lời gọi qua framework vẫn là lời gọi API bằng key của team, nên vẫn tính vào cùng hạn mức và chi phí. Không cần viết lại bằng Agent SDK; Agent SDK chỉ là một lựa chọn."
```

### F59

**OLD**
```yaml
      - Documents placed inside the question sentence itself, so that everything is on one line.
      - Instructions repeated after every paragraph of each document.
    answer:
      - A
    explanation: Tài liệu dài để đầu, chỉ dẫn và câu hỏi để cuối thường cho kết quả tốt hơn.
```

**NEW**
```yaml
      - Instructions first, then the question, with the documents placed at the very end.
      - Instructions repeated after every paragraph of each document.
    answer:
      - A
    explanation: "Theo mục Long context prompting: đặt tài liệu dài gần đầu prompt, phía trên câu hỏi, chỉ dẫn và ví dụ. Đặt câu hỏi ở cuối có thể cải thiện chất lượng tới 30% trong thử nghiệm, nhất là với nhiều tài liệu. Đặt câu hỏi lên đầu, hoặc đặt chỉ dẫn và câu hỏi trước rồi để tài liệu ở cuối, đều ngược khuyến nghị. Lặp chỉ dẫn sau mỗi đoạn làm prompt phình và chia cắt tài liệu mà không có lợi; nên tách tài liệu bằng thẻ XML như `<document>`."
```

### PA29

**OLD**
```yaml
      - Two to four few-shot examples covering ambiguous cases and the exact format
      - A longer paragraph repeating the format description in different words
      - Asking the model to “think carefully” before writing the output
      - Raising max_tokens so the model has more room to format output
    answer:
      - A
    explanation: Few-shot nhắm vào ca mơ hồ và cố định định dạng hiệu quả hơn mô tả dài. Nhắc "suy nghĩ kỹ" hay tăng max_tokens không cố định định dạng.
```

**NEW**
```yaml
      - Three to five few-shot examples covering ambiguous cases and the exact format
      - A longer paragraph repeating the format description in different words
      - Asking the model to “think carefully” before writing the output
      - Raising max_tokens so the model has more room to format output
    answer:
      - A
    explanation: "Prompting best practices coi ví dụ (few-shot) là một trong những cách đáng tin nhất để cố định định dạng; khuyên dùng 3–5 ví dụ liên quan, đa dạng, phủ edge case, bọc trong thẻ `<example>`. Ví dụ nhắm đúng ca mơ hồ hiệu quả hơn viết thêm một đoạn mô tả dài lặp lại ý cũ. Nhắc “suy nghĩ kỹ” có thể giúp lập luận nhưng không cố định định dạng. Tăng max_tokens chỉ nới giới hạn độ dài output."
```

### PB08

**OLD**
```yaml
      - Confused deputy
      - Rate-limit exhaustion
      - Context drift
      - Prompt caching poisoning
    answer:
      - A
    explanation: "Confused deputy: proxy bị lợi dụng để lấy quyền mà người dùng chưa đồng ý. Biện pháp: xin đồng ý theo từng client, kiểm tra redirect URI. Các phương án khác là khái niệm không liên quan."
```

**NEW**
```yaml
      - Confused deputy
      - Token passthrough
      - Server-side request forgery (SSRF)
      - State handle hijacking
    answer:
      - A
    explanation: "MCP Security Best Practices mô tả đúng tình huống này là Confused Deputy Problem: MCP proxy dùng một static client ID với authorization server bên thứ ba, kẻ tấn công lợi dụng consent cookie (cùng dynamic client registration và redirect URI độc) để lấy authorization code mà người dùng không thật sự đồng ý. Biện pháp: proxy xin đồng ý theo từng client, kiểm tra redirect URI khớp chính xác, kiểm tra tham số `state`. Token passthrough là server nhận rồi chuyển tiếp token không được cấp cho chính nó. SSRF là ép MCP client gửi request tới địa chỉ nội bộ qua các URL metadata OAuth. State handle hijacking là đoán hoặc lấy được handle trạng thái để thao tác trên dữ liệu của người khác. Ba kiểu này không phải là lấy authorization code qua consent đã cấp cho static client ID."
```

### U09 — RETIRE

Gần trùng **C247** (CCDV-F D1): cả hai là phân loại yêu cầu hỗ trợ theo loại rồi gửi tới prompt chuyên biệt, đáp án là Routing, cùng góc hỏi. C247 có phương án nhiễu hợp lý hơn. U09 có phương án nhiễu lộ ("pick the longest", "until it scores 10"). Giữ C247. Đặt `status: retired` cho U09. Nguồn: https://www.anthropic.com/research/building-effective-agents
