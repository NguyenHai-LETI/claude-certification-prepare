# Soát câu hỏi — mẫu ngẫu nhiên pack `ccx` (CCAR-F, 20 câu) — 2026-11-18
Người soát: Claude Opus 5.5 (claude-opus-5-5) · Phạm vi: `bank/packs/ccx.yaml`, các id C201, C264, C265, E12, N07, F55, E11, C210, D01, C209, E03, C213, F44, E30, E06, D61, E70, D10, G08, Z04 · Số câu: 20

> Lượt soát này là **mẫu đo tỉ lệ lỗi**. Nhiều agent soát song song trên cùng file nên **không sửa `bank/packs/`**, không đặt `reviewed:` / `status:`. Mọi thay đổi đề xuất nằm ở mục *Đề xuất sửa* cuối báo cáo, để áp dụng sau.
> Cách làm: tự giải từng câu trước khi đọc `answer`, đối chiếu docs chính thức (WebFetch) và `notes/exams/CCAR-F.md` (diễn giải Exam Guide v1.0), Grep cả 4 pack để dò trùng.

## Tổng kết

| Kết luận | Số câu |
|---|---|
| PASS | 8 (C264, C265, D61, F44, F55, C209, N07, E70) |
| FIX | 5 (E06, E30, C210, C213, D10) |
| RETIRE | 7 (D01, E03, G08, E12, Z04, E11, C201) |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

**Đo lường:**
- **Số câu đáp án sai (tiêu chí a): 0 / 20.**
- **Số câu không có đúng một đáp án bảo vệ được (tiêu chí b): 0 / 20.**

Cả 7 câu RETIRE đều vì **trùng lặp (g)**, không vì sai đáp án. 3 câu (D01, E03, G08) gần như chép lại câu mẫu chính thức trong pack `official`.

## Lỗi theo tiêu chí

| Tiêu chí | Số câu trượt | Câu |
|---|---|---|
| a. Đáp án đúng | 0 | — |
| b. Đúng một đáp án | 0 | — |
| c. Phương án nhiễu | 1 | E06 |
| d. Stem / thuật ngữ | 1 | E30 (viết “sub-agent” trong phương án, docs viết “subagent”; lỗi nhỏ) |
| e. Giải thích | 9 | E06, E30, C210, C213, D10 (đã đề xuất sửa); E11, G08, E12, D01 (RETIRE nên không sửa) |
| f. Gắn kỳ thi / domain / scenario / ref | 0 | — (mọi `ref` đều có anchor thật trong `notes/lessons/`) |
| g. Trùng lặp | 7 | D01, E03, G08, E12, Z04, E11, C201 |

## Chi tiết

| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đề xuất sửa | Nguồn |
|---|---|---|---|---|---|
| C201 | CCAR-F D1 · S1 | RETIRE | g | Đáp án `stop_reason` đúng, nhưng trùng C01 (cùng quyết định “vòng lặp dừng theo gì”, cùng đáp án, cùng 3 phương án nhiễu: giới hạn số vòng, có text block, khớp cụm từ). Giữ C01 (cũ hơn, gắn cả CCDV-F). Nếu muốn giữ khung tình huống của C201 thì retire C01 thay thế. | https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons ; notes/exams/CCAR-F.md §1.1 |
| C264 | CCAR-F D1 · S4 | PASS | — | `resume` + `fork_session=True` tạo phiên mới với ID riêng từ bản sao lịch sử, phiên gốc giữ nguyên: đúng docs; nhiễu sai rõ. | https://code.claude.com/docs/en/agent-sdk/sessions |
| C265 | CCAR-F D1 · S4 | PASS | — | Docs ghi nguyên văn: “Forking branches the conversation history, not the filesystem… changes are real and visible to any session working in the same directory”. | https://code.claude.com/docs/en/agent-sdk/sessions |
| E12 | CCAR-F D3 · S2 | RETIRE | g, e | Trùng P05 (cùng triệu chứng, cùng đáp án `/memory`, P05 gắn cả CCDV-F và giải thích đủ từng phương án nhiễu). E12 bỏ sót `/clear` trong giải thích. Ghi chú: docs hiện tại khuyên `/context all` để xác nhận file đã nạp, còn `/memory` liệt kê và mở file memory. | https://code.claude.com/docs/en/memory |
| N07 | CCAR-F D3 · S5 | PASS | — | Đưa kết quả review trước vào context, chỉ báo lỗi mới / chưa sửa: đúng task statement 3.6; giải thích đủ từng nhiễu. Giữ câu này thay cho E11 (trùng). | notes/exams/CCAR-F.md §3.6 (Exam Guide v1.0 Domain 3) |
| F55 | CCAR-F D4 · S6 | PASS | — | Nullable + enum `unclear` chống bịa: đúng guide 4.3; hai nhiễu sai rõ. | notes/exams/CCAR-F.md §4.3 |
| E11 | CCAR-F D3 · S5 | RETIRE | g, e | Trùng N07 (cùng tình huống CI review lặp comment, cùng đáp án). N07 tốt hơn (giải thích từng nhiễu), E11 không giải thích nhiễu nào. | notes/exams/CCAR-F.md §3.6 |
| C210 | CCAR-F D1 · S1 | FIX | e | Đáp án đúng (gate `lookup_order` + giới hạn số tiền bằng code). Giải thích bỏ sót nhiễu “tải ảnh hoá đơn”. Đề xuất viết lại giải thích. | notes/exams/CCAR-F.md §1.4–1.5 |
| D01 | CCAR-F D2, CCDV-F D8 · S1 | RETIRE | g, e | Gần như chép OF-CCARF-02 (cùng `get_customer`/`lookup_order`, cùng đáp án viết lại mô tả, cùng 3 nhiễu: routing, gộp tool, few-shot). Giải thích còn sơ sài. | notes/exams/CCAR-F.md §2.1 |
| C209 | CCAR-F D1 · S1 | PASS | — | Xác minh danh tính trước hoàn tiền và hoàn tiền vượt hạn mức chuyển người: hai quy tắc phải chặn bằng code; giọng văn / hỏi lại là việc của prompt. | notes/exams/CCAR-F.md §1.4–1.5 |
| E03 | CCAR-F D3 · S2 | RETIRE | g | Gần như chép OF-CCARF-06 (test rải khắp codebase → `.claude/rules/` + `paths`; cùng 3 nhiễu). Ghi chú: docs 11/2026 cho skill có trường `paths` tự nạp theo file, nhưng phương án skill ở đây là “invoke by hand” nên vẫn sai. | https://code.claude.com/docs/en/memory ; https://code.claude.com/docs/en/skills |
| C213 | CCAR-F D1 · S2 | FIX | e | Đáp án đúng (prompt chaining cho bước cố định). Giải thích không nói vì sao hệ multi-agent tranh luận và một prompt khổng lồ sai. Gần C224 nhưng khác bối cảnh, C213 cũ hơn nên giữ. | https://www.anthropic.com/research/building-effective-agents ; notes/exams/CCAR-F.md §1.6 |
| F44 | CCAR-F D4 · S6 | PASS | — | Retry kèm lỗi validate sửa được lỗi định dạng / cấu trúc, không sửa được thông tin vắng hay không đọc được: đúng guide 4.4. | notes/exams/CCAR-F.md §4.4 |
| E30 | CCAR-F D3 · S2 | FIX | d, e | Đáp án `context: fork` đúng (skill chạy trong subagent, không thấy lịch sử hội thoại). Phương án viết “sub-agent”; giải thích bỏ sót nhiễu CLAUDE.md. | https://code.claude.com/docs/en/skills |
| E06 | CCAR-F D3 · S2 | FIX | c, e | Đáp án đúng (plan mode rồi thực thi). Hai nhiễu quá yếu / lạc đề (“migrate one random file and see”, “Use `claude -p` in CI.”); giải thích không nhắc chúng. Đề xuất viết lại 2 nhiễu + giải thích. (Cùng ý với OF-CCARF-05, E35 nhưng bối cảnh khác; E06 cũ hơn E35.) | notes/exams/CCAR-F.md §3.4 |
| D61 | CCAR-F D2 · S1 | PASS | — | Spec MCP ghi nguyên văn “Input validation errors (e.g., date in wrong format, value out of range)” là tool execution error, trả `isError: true`; lỗi giao thức dành cho tool không tồn tại / request sai schema. | https://modelcontextprotocol.io/specification/latest/server/tools |
| E70 | CCAR-F D3, CCDV-F D3 · S2 | PASS | — | Docs Skills: tải lên claude.ai / Skills API / `package_skill.py` chỉ nhận `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`; trường khác “fails with a hard error”. Claude Code bỏ qua trường lạ. Mapping hai kỳ thi hợp lệ. Nội dung dễ lỗi thời (xem Rủi ro). | https://code.claude.com/docs/en/skills |
| D10 | CCAR-F D2 · S4 | FIX | e | Đáp án đúng (`.mcp.json` project scope + `${GITHUB_TOKEN}`). Giải thích bỏ sót nhiễu `~/.claude.json` và CLAUDE.md. | https://code.claude.com/docs/en/mcp |
| G08 | CCAR-F D5 · S3 | RETIRE | g, e | Gần như chép OF-CCARF-08 (subagent web search timeout → lỗi có cấu trúc; cùng 3 nhiễu: rỗng-như-thành-công, dừng workflow, thông báo chung chung). Giải thích bỏ sót nhiễu thông báo chung chung. | notes/exams/CCAR-F.md §5.3 |
| Z04 | CCAR-F D3 · S2 | RETIRE | g | Trùng E01 (người mới clone repo, chỉ dẫn nằm trong `~/.claude/CLAUDE.md` của người khác → chuyển lên cấp project; cùng nhiễu `settings.local.json`, chép tay). Giữ E01 (cũ hơn, gắn cả CCDV-F). | https://code.claude.com/docs/en/memory |

## Cần người xem

Không có câu nào nghi ngờ mà không kiểm được. Hai quyết định thuộc phạm vi biên tập, người duyệt có thể đảo:
- **C201 / C01:** chọn giữ câu nào trong cặp trùng. Báo cáo chọn giữ C01 (cũ hơn, hai kỳ thi); C201 có khung tình huống sát đề thật hơn.
- **E11 / N07:** báo cáo chọn giữ N07 (giải thích tốt hơn) dù E11 cũ hơn.

## Rủi ro còn lại

- **Mẫu lỗi lặp lại của người soạn:**
  1. **Trùng lặp nhiều:** 7/20 câu trong mẫu là bản gần trùng, cả trong nội bộ `ccx` (E11≈N07, E12≈P05, Z04≈E01, C201≈C01) lẫn với pack `official` (D01≈OF-02, E03≈OF-06, G08≈OF-08: diễn đạt lại câu mẫu Exam Guide, giữ nguyên bộ phương án). Nếu tỉ lệ này đại diện, có thể khoảng 30% pack là câu trùng. Nên chạy một lượt khử trùng có hệ thống trên toàn pack, không chỉ soát từng câu.
  2. **Giải thích sơ sài:** nhiều câu (đánh số thấp: D, E, G) chỉ có 1–2 câu giải thích, không nói vì sao từng phương án nhiễu sai. Câu đánh số cao (C26x, D6x, E70, N07) có giải thích đầy đủ hơn hẳn: dấu hiệu pack được soạn theo nhiều đợt, chất lượng khác nhau.
  3. **Phương án nhiễu “độn”:** vài câu có nhiễu ngắn, lạc đề (E06: “Use `claude -p` in CI.”), làm câu dễ hơn đề thật.
- **Độ chính xác đáp án tốt:** 0/20 sai đáp án, 0/20 mơ hồ hai đáp án. Người soạn bám sát task statement của Exam Guide v1.0.
- **Dễ lỗi thời:** E70 (tập trường frontmatter claude.ai chấp nhận), E03/E12 (docs đã thêm `paths` cho skill và khuyên `/context all` thay cho `/memory` để xác nhận file đã nạp), C264 (tên tuỳ chọn `fork_session` / `forkSession`). CCAR-F không đổi guide ngày 07/12/2026, nhưng docs vẫn thay đổi liên tục.

## Để lượt sau

Không còn câu nào trong phạm vi. Đề nghị lượt sau: dò trùng toàn bộ `ccx.yaml` với `official.yaml` và trong nội bộ `ccx` (theo khái niệm: `fork_session` C15/C223, plan mode E35, MCP scope Z05, decomposition C224).

## Đề xuất sửa

Không đổi đáp án ở câu nào. Không đổi thứ tự / thêm / bớt phương án. Áp dụng bằng Edit thay chuỗi chính xác; sau khi áp dụng, thêm `reviewed: 2026-11-18` theo quy trình.

### C210

**OLD**
```yaml
    explanation: "Điều kiện tiên quyết và kiểm tra số tiền nằm trong code: phải có dữ liệu đơn hàng, số tiền hoàn không vượt số đã thanh toán. Lời dặn hay model lớn hơn không bảo đảm."
```

**NEW**
```yaml
    explanation: "Quy tắc có hệ quả tài chính phải chặn bằng code: bắt buộc có kết quả `lookup_order` cho đúng đơn đó, và số tiền hoàn bị giới hạn ở số đã thanh toán, nên con số khách tự nêu không thể lọt qua. Dặn trong system prompt chỉ cho tuân thủ xác suất, tỉ lệ thất bại vẫn khác 0. Model lớn hơn cũng không bảo đảm tất định. Bắt khách tải ảnh hoá đơn cho mọi yêu cầu chỉ thêm ma sát mà không ngăn được agent dùng sai số tiền, trong khi số liệu chuẩn đã có sẵn trong hệ thống đơn hàng."
```

### C213

**OLD**
```yaml
    explanation: "Bước biết trước, lặp lại: chuỗi cố định (prompt chaining). Phân rã động dành cho việc mở, bước sau phụ thuộc phát hiện."
```

**NEW**
```yaml
    explanation: "Các bước đã biết trước và giống nhau cho mọi endpoint, nên hợp với chuỗi cố định (prompt chaining) áp lần lượt cho từng endpoint. Phân rã động dành cho việc mở, khi bước sau phụ thuộc điều vừa phát hiện; để agent tự nghĩ bước mới cho từng endpoint chỉ làm các lần chuyển đổi lệch nhau. Hệ multi-agent tranh luận là quá tay cho một quy trình đã rõ, tốn chi phí mà không thêm giá trị. Gộp cả 30 endpoint vào một câu trả lời khổng lồ dễ chạm giới hạn output và làm loãng sự chú ý, chất lượng không đều giữa các endpoint."
```

### E30

**OLD**
```yaml
      - "Add `context: fork` so the exploration runs in an isolated sub-agent, apart from the session."
    answer:
      - D
    explanation: "`context: fork` chạy skill trong context riêng, nên ý tưởng thăm dò không làm nhiễu phiên chính. `/clear` xoá luôn context cần giữ; ép chỉ một phương án làm mất mục đích brainstorm."
```

**NEW**
```yaml
      - "Add `context: fork` so the exploration runs in an isolated subagent, apart from the main session."
    answer:
      - D
    explanation: "`context: fork` chạy skill trong một subagent có context riêng (subagent không thấy lịch sử hội thoại, nội dung skill trở thành prompt của nó), nên các phương án thăm dò và bị loại nằm lại trong subagent, phiên chính chỉ nhận kết quả. Chạy `/clear` trước khi brainstorm không giải quyết gì vì phần gây nhiễu sinh ra sau đó, lại xoá luôn context cần giữ. Ép chỉ một phương án làm mất mục đích brainstorm. Đưa chỉ dẫn brainstorm vào CLAUDE.md khiến nó nạp ở mọi phiên, làm context chính nhiễu hơn chứ không cô lập phần thăm dò."
```
Nguồn: https://code.claude.com/docs/en/skills (mục Run skills in a subagent).

### E06

**OLD**
```yaml
      - Ask Claude to migrate one random file and see what happens.
      - Use `claude -p` in CI.
    answer:
      - B
    explanation: "Thay đổi lớn, nhiều file, nhiều hướng hợp lệ: plan mode ngay. “Làm rồi tính” là bẫy khi đề đã nói rõ việc phức tạp."
```

**NEW**
```yaml
      - Write exhaustive conversion rules up front, then use direct execution without first exploring the codebase.
      - Ask Claude to convert one file directly, then copy that pattern to the remaining files without further planning.
    answer:
      - B
    explanation: "Việc lớn (45+ file) với nhiều hướng kiến trúc hợp lệ: dùng plan mode ngay từ đầu để khám phá codebase, hiểu phụ thuộc và chốt cách làm, rồi mới thực thi theo kế hoạch. Bắt đầu sửa ngay rồi chỉ đổi sang plan mode khi gặp vấn đề là bẫy, vì độ phức tạp đã nêu sẵn trong đề và phát hiện phụ thuộc muộn thì phải làm lại tốn kém. Viết sẵn quy tắc chuyển đổi rồi thực thi trực tiếp là giả định đã biết hướng đúng khi chưa khảo sát code. Chuyển thử một file rồi chép mẫu sang các file còn lại bỏ qua việc chọn giữa các hướng kiến trúc và các phụ thuộc giữa file mà một file mẫu không bộc lộ."
```

### D10

**OLD**
```yaml
    explanation: Cấu hình dùng chung ở project scope `.mcp.json` (commit vào repo); secret lấy từ biến môi trường. Gitignore file thì mất tính chia sẻ.
```

**NEW**
```yaml
    explanation: "Server dùng chung cho cả đội đặt ở project scope: `.mcp.json` ở gốc repo, commit vào git để mọi người có cùng cấu hình. Claude Code mở rộng biến môi trường trong `.mcp.json` (cú pháp `${VAR}`), nên token nằm trên máy từng người và không bao giờ vào repo. `~/.claude.json` là scope cá nhân, không chia sẻ qua git, mỗi người phải tự cấu hình và dễ lệch nhau, lại còn ghi token dạng rõ. CLAUDE.md chỉ là chỉ dẫn cho Claude, không cấu hình được kết nối MCP. Ghi token thẳng vào `.mcp.json` rồi gitignore file thì mất luôn tính chia sẻ của cấu hình dự án."
```
Nguồn: https://code.claude.com/docs/en/mcp (MCP installation scopes; Environment variable expansion in `.mcp.json`).

### RETIRE (chỉ đặt `status: retired` + `reviewed: 2026-11-18`)

- **D01**: gần trùng OF-CCARF-02 (cùng tình huống `get_customer`/`lookup_order`, cùng đáp án, cùng bộ nhiễu).
- **E03**: gần trùng OF-CCARF-06 (`.claude/rules/` + `paths` cho test rải khắp codebase, cùng bộ nhiễu).
- **G08**: gần trùng OF-CCARF-08 (timeout subagent → lỗi có cấu trúc, cùng bộ nhiễu).
- **E12**: trùng P05 (`/memory` để xem file chỉ dẫn đang nạp); giữ P05 vì giải thích đủ hơn và gắn hai kỳ thi.
- **Z04**: trùng E01 (chỉ dẫn ở `~/.claude/CLAUDE.md` của người khác → chuyển lên project); giữ E01 (cũ hơn).
- **E11**: trùng N07 (review CI lặp lại comment cũ); giữ N07 (giải thích từng nhiễu).
- **C201**: trùng C01 (vòng lặp dừng theo `stop_reason`, cùng 3 nhiễu); giữ C01 (cũ hơn, gắn hai kỳ thi). Có thể đảo lựa chọn, xem *Cần người xem*.
