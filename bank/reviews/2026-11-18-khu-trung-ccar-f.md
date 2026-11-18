# Khử trùng ngân hàng câu hỏi — CCAR-F — 2026-11-18
Người soát: claude-opus-5-5 · Phạm vi: 352 câu active của CCAR-F (official 12, ai 23, ccx 317) · Chỉ đề xuất, **chưa sửa** `bank/packs/`

## Tổng kết
| Chỉ số | Giá trị |
|---|---|
| Nhóm trùng | 69 |
| Câu đề xuất retire (đều thuộc `ccx`) | 89 (28% số câu ccx của CCAR-F) |
| Nhóm có câu giữ là `official` | 12 |
| Câu còn active sau khi retire | 263 |

Số câu theo domain:
| Domain | Trọng số | Trước | Retire | Sau | Tỉ lệ sau |
|---|---|---|---|---|---|
| D1 Agentic Architecture & Orchestration | 27% | 85 | 27 | 58 | 22,1% |
| D2 Tool Design & MCP Integration | 18% | 64 | 20 | 44 | 16,7% |
| D3 Claude Code Configuration & Workflows | 20% | 78 | 22 | 56 | 21,3% |
| D4 Prompt Engineering & Structured Output | 20% | 70 | 11 | 59 | 22,4% |
| D5 Context Management & Reliability | 15% | 55 | 9 | 46 | 17,5% |

**Domain bị thiếu so với trọng số:**
- **D1** còn 58 câu (22,1%, trọng số 27%). Muốn đúng tỉ lệ cần thêm khoảng 18 câu D1. Nên sinh bằng `/cert-generate` với góc mới, không lặp các mẫu vừa retire (cổng tiên quyết bằng code, chuẩn hoá bằng PostToolUse, gọi Task song song).
- **D2** còn 44 câu (16,7%, trọng số 18%), thiếu khoảng 5–7 câu.
- **Độ phủ tình huống** (chỉ tính ccx, sau retire): D1×S4 còn 6 (trước 15), D3×S4 còn 3 (trước 9), D1×S6 còn 2, D1×S5 còn 1, D2×S5 còn 1, D4×S2 còn 1. Đề thi thử bốc 4 tình huống nên S4 (Developer Productivity) và các ô trên cần thêm câu.

Cách làm: đọc hết 352 dòng (stem + đáp án đúng), gom ứng viên theo khái niệm, giữa mọi domain. Với từng ứng viên, đọc đủ phương án và giải thích trong `bank/packs/*.yaml`. Tiêu chí g của `cert-review`: **cùng quyết định + cùng đáp án + cùng loại vấn đề kích hoạt** thì tính là trùng, kể cả khi khác kịch bản bề mặt (tên tool, kịch bản S1–S6, loại dữ liệu). Nhiều nhóm còn dùng chung một bộ phương án nhiễu theo khuôn (lời dặn trong prompt / few-shot / kiểm tra sau sự việc), nên càng chắc là trùng.

Thứ tự chọn câu giữ: official > ai > ccx đã `reviewed` > ccx viết tốt hơn (phương án nhiễu hợp lý hơn, giải thích nêu lý do từng nhiễu). Khi hai câu ngang nhau thì giữ câu ở domain/tình huống đang thiếu (vd. giữ L09 ở D1·S4 thay E36 ở D3·S2; D09 ở S6; D51 ở S5).

## Nhóm trùng
| Giữ | Retire | Domain | Lý do trùng (1 dòng) |
|---|---|---|---|
| OF-CCARF-07 | C04 | D1 | Diễn đạt lại câu mẫu: báo cáo chỉ có nghệ thuật thị giác vì coordinator phân rã chủ đề quá hẹp |
| OF-CCARF-01 | C08, C226, C238, C243 | D1 | Prompt đôi khi bị bỏ qua → cổng tiên quyết bằng code chặn bước sau (refund / report / commit / ghi ERP); chung bộ nhiễu prompt, few-shot |
| Z01 | C10, C246 | D1 | Quy tắc nghiệp vụ bắt buộc (refund > $500, bản ghi bị gắn cờ) → hook chặn lời gọi tool và chuyển luồng escalation / hàng đợi duyệt |
| C236 | C241 | D1 | Lệnh tuyệt đối cấm (kubectl production / push lên `main`) → PreToolUse hook chặn; nhiễu: prompt, kiểm tra sau sự việc |
| C205 | C09, C227, C242 | D1 | Nhiều tool trả định dạng khác nhau (timestamp, ngày, số tiền, mã trạng thái) → PostToolUse hook chuẩn hoá trước khi model đọc |
| C206 | C11 | D1 | Escalation hỗ trợ, người nhận không xem transcript → tóm tắt có cấu trúc (ID, nguyên nhân, số tiền, việc đã làm, bước tiếp) |
| Z03 | C12 | D1 | Một tin nhắn ba vấn đề → tách từng mục, xử lý, trả lời một lần (cùng bộ nhiễu) |
| C13 | C231 | D1 | Việc mở trên codebase legacy → lập bản đồ cấu trúc, tập trung vùng quan trọng, điều chỉnh dần |
| C217 | C225 | D1 | Chưa biết nguyên nhân (test chập chờn / thị phần giảm) → phân rã động theo phát hiện; nhiễu: chuỗi cố định |
| C213 | C239, C224 | D1 | Nhiều mục, mỗi mục cùng các bước đã biết (endpoint / repo / công ty) → pipeline cố định áp cho từng mục |
| C14 | C212 | D1 | Kết quả tool cũ đã lỗi thời → phiên mới kèm tóm tắt có cấu trúc thay vì resume |
| C214 | C235 | D1 | Phiên có tên, phát hiện cũ còn đúng → resume phiên đó; nhiễu `/init`, fork, phiên mới |
| C215 | G28 (D5) | D1, D5 | Vài file đã đổi sau khi Claude đọc → báo đúng file nào đổi để đọc lại có chọn lọc |
| C264 | C15, C223 | D1 | Thử hai hướng từ cùng một phân tích gốc mà không ảnh hưởng nhau → `fork_session` (C264 reviewed, hỏi kỹ cấu hình) |
| Z10 | C07, C216, C233 | D1 | Chạy các subagent song song → phát nhiều lời gọi Task trong cùng một response |
| Z11 | C05 | D1 | Subagent tổng hợp không thừa hưởng kết quả của coordinator → đưa findings kèm nguồn vào prompt của nó |
| C219 | C234 | D1 | Yêu cầu đơn giản vẫn chạy đủ pipeline subagent → coordinator đánh giá độ phức tạp, chỉ gọi subagent cần thiết |
| L09 | E21, E36 (D3) | D3 | Khám phá codebase làm đầy context chính → Explore subagent chỉ trả tóm tắt |
| L10 | G31 (D5) | D5 | Bước sau có ngân sách context hạn chế → subagent trả dữ kiện có cấu trúc (ý chính, trích dẫn, nguồn) thay vì bản thô |
| C222 | G15 (D5) | D5 | Giữ được trích dẫn qua các bước → định dạng có cấu trúc tách nội dung nhận định khỏi metadata nguồn |
| C200 | C237 | D1 | Vì sao không hard-code trình tự gọi tool → tool tiếp theo phụ thuộc kết quả trước, trình tự cố định không thích ứng |
| OF-CCARF-02 | D52 | D2 | Diễn đạt lại câu mẫu: hai tool mô tả tối giản bị chọn nhầm → viết lại mô tả (phạm vi, cách phân biệt, ca biên); cùng nhiễu router |
| OF-CCARF-09 | D07 | D2 | Diễn đạt lại câu mẫu: 85% là tra cứu đơn giản → tool `verify_fact` hẹp, việc phức tạp vẫn qua coordinator |
| Z02 | D04, D45 | D2 | Vi phạm quy tắc nghiệp vụ (ngoài hạn trả hàng, hết quota) → lỗi business, `isRetryable: false`, kèm giải thích |
| D51 | D30, D06, D46 | D2 | Agent có tool ngoài vai trò và dùng sai / chọn kém → chỉ cấp tool cần cho vai trò (giữ D51 vì D2·S5 ít câu) |
| D09 | D28 | D2 | Bắt buộc một tool chạy trước tiên → `tool_choice` {type: tool, name}; nhiễu `any`, thứ tự mảng tools |
| D10 | D50 | D2 | MCP server dùng chung có token → `.mcp.json` cấp project với `${GITHUB_TOKEN}` (D10 reviewed) |
| M05 | D12, M01 | D2 | Agent tốn lời gọi để dò danh mục / schema → công bố nội dung đó dưới dạng MCP resource |
| M07 | D13 | D2 | Tích hợp Jira chuẩn → dùng MCP server có sẵn, chỉ tự viết cho workflow riêng của đội |
| D38 | D14 | D2 | Tìm file theo mẫu tên → Glob |
| D37 | D15 | D2 | Tìm nội dung (lời gọi hàm, chuỗi lỗi) trong repo → Grep |
| D32 | D29 | D2 | Tool đa năng bị dùng sai → tách thành các tool chuyên biệt có hợp đồng vào/ra riêng |
| M06 | D36, D43 | D2 | Agent ưu tiên tool chung (Grep / web fetch) thay vì tool MCP mạnh hơn → cải thiện mô tả tool MCP |
| G59 | D05 (D2) | D2 | Lỗi truy cập và kết quả rỗng hợp lệ trả giống nhau → agent báo nhầm "không có kết quả" |
| G58 | D34 (D2) | D2 | Timeout tạm thời ở subagent → thử lại tại chỗ có giới hạn, chỉ báo lên kèm kết quả một phần |
| D53 | D26 | D2 | Đầu vào sai → lỗi validation không retry, nêu rõ trường / định dạng để agent sửa hoặc hỏi lại; cùng bộ nhiễu |
| OF-CCARF-04 | E02 | D3 | Diễn đạt lại câu mẫu: `/review` dùng chung → `.claude/commands/` trong repo |
| OF-CCARF-05 | E46 | D3 | Việc kiến trúc lớn chưa muốn sửa gì (tái cấu trúc / hiện đại hoá) → plan mode |
| E06 | E35 | D3 | Migration hàng chục file → plan mode để điều tra, chốt cách làm rồi thực thi (E06 reviewed) |
| P07 | E07, E33 | D3 | Sửa nhỏ một hàm, phạm vi rõ (có stack trace) → direct execution |
| OF-CCARF-10 | E08 | D3 | Diễn đạt lại câu mẫu: `claude "…"` treo trong CI → thêm `-p` (cùng nhiễu `CLAUDE_HEADLESS`, `--batch`) |
| Z14 | E09 | D3 | CI cần output máy đọc để đăng comment inline → `--output-format json` kèm `--json-schema` |
| N06 | E10 | D3 | Phiên đã sinh code tự review kém → review bằng phiên độc lập không mang context lúc sinh |
| P06 | E13, E44 | D3 | CLAUDE.md gốc phình to, mỗi package chỉ cần một phần → tách file, `@import` theo package |
| P10 | E14 | D3 | Lỗi liên quan nhau gửi chung một tin, lỗi độc lập gửi riêng |
| P09 | E15 | D3 | Làm caching ở lĩnh vực lạ → để Claude phỏng vấn trước (invalidation, failure mode) |
| P08 | E16, F20 (D4) | D3, D4 | Mô tả / style guide bằng lời bị hiểu không nhất quán → 2–3 ví dụ vào/ra cụ thể |
| E30 | E04 | D3 | Skill làm bẩn context phiên chính → `context: fork` (E30 reviewed) |
| E26 | E48 | D3 | Chỉ dẫn chỉ áp cho một thư mục → CLAUDE.md đặt trong thư mục đó |
| OF-CCARF-06 | E47 | D3 | Diễn đạt lại câu mẫu: quy ước cho một loại file rải nhiều thư mục → một rule `.claude/rules/` có `paths` glob |
| E54 | E31 | D3 | Tiêu chí chỉ nạp khi đụng file khớp mẫu → rule `.claude/rules/` có `paths` (giữ E54 cho S5) |
| E53 | E28 | D3 | Skill không được chạy lệnh / sửa file → `allowed-tools` trong frontmatter |
| L02 | L03 | D3 | Scaffold theo template chung của đội → project skill gồm SKILL.md và file mẫu |
| L08 | E05 | D3 | Biến thể cá nhân của skill đội → skill tên khác trong `~/.claude/skills/` |
| OF-CCARF-11 | A21 | D4 | Diễn đạt lại câu mẫu: việc chịu được trễ dùng Batches, kiểm tra chặn merge giữ API đồng bộ |
| OF-CCARF-12 | F12 | D4 | Diễn đạt lại câu mẫu: PR 14 file → từng file một lượt + một lượt tích hợp chéo file |
| Z08 | F10 | D4 | SLA 30 giờ, batch tối đa 24 giờ → gửi mỗi 6 giờ (cùng phép tính, cùng phương án) |
| F69 | F11 | D4 | Một phần batch lỗi → ghép theo `custom_id`, chỉ gửi lại các mục lỗi sau khi sửa nguyên nhân |
| F67 | F04, F30 | D4 | Schema / strict chỉ bảo đảm cú pháp, không bảo đảm ngữ nghĩa → vẫn cần validate bằng code |
| Z07 | F08 | D4 | Retry không tạo ra thông tin không có trong tài liệu → dừng retry, để null hoặc chuyển người duyệt |
| F23 | F47 | D4 | Bắt lỗi tinh vi → phiên độc lập (không mang suy luận của người viết) kiểm lại theo nguồn; chung bộ nhiễu |
| G43 (D5) | F34 | D4 | Phân luồng người duyệt → độ tin cậy theo từng mục, ngưỡng hiệu chỉnh trên tập có nhãn |
| F01 | F24 | D4 | Review nhiều nhiễu → tiêu chí cụ thể báo gì / bỏ gì thay cho "thận trọng" hay lọc theo độ tự tin |
| OF-CCARF-03 | G07 | D5 | Diễn đạt lại câu mẫu: escalation lệch → tiêu chí escalation rõ kèm few-shot trong system prompt |
| G20 | G05 | D5 | Chính sách im lặng về trường hợp cụ thể → escalate tới người |
| G10 | Z13 | D5 | Phiên dài bắt đầu nói "typical patterns" → scratchpad + subagent (đề xuất từ `2026-11-18-gd0-canh-bao-trung.md`) |
| G40 | G11 | D5 | Crash giữa chừng → ghi trạng thái ra vị trí cố định, nạp lại khi chạy tiếp |
| Z09 | G12 | D5 | Độ chính xác tổng cao, muốn bỏ duyệt → đo theo loại tài liệu và trường, lấy mẫu phân tầng |
| OF-CCARF-08 | Z12 | D5 | Diễn đạt lại câu mẫu: subagent timeout → kết quả một phần + lỗi có cấu trúc (loại lỗi, truy vấn, phần thiếu) |

## Gần giống nhưng giữ cả hai
- **C203 ↔ OF-CCARF-01:** kiểm đơn hàng có thuộc khách đã xác minh không, khác với xác minh danh tính trước.
- **C209 ↔ OF-CCARF-01 / Z01:** dạng chọn hai, gộp hai quy tắc. **C204 ↔ Z01:** hỏi hook phản hồi thế nào (deny kèm lý do), không hỏi có dùng hook không.
- **AI-CCARF-005 ↔ Z01:** góc cơ chế SDK (`allowedTools` bỏ qua `canUseTool` → chuyển sang PreToolUse).
- **C208 ↔ C205:** che số thẻ vì tuân thủ, khác mục đích chuẩn hoá định dạng.
- **C230, C245 ↔ C206:** bàn giao cho biên tập viên / hàng đợi duyệt; nội dung đáp án riêng theo từng kịch bản.
- **C207 ↔ Z10:** nhiều lời gọi tool trong một lượt, không phải subagent Task.
- **C13 ↔ C217:** lập bản đồ việc mở và điều tra nguyên nhân chưa biết là hai dạng phân rã động khác nhau.
- **C240, C244 ↔ C213:** chuỗi theo khía cạnh trong một PR / phân loại rồi trích xuất theo loại, khác cấu trúc với "cùng bước cho nhiều mục".
- **C14 ↔ C215:** đáp án ngược nhau (đa số file đổi → phiên mới; vài file đổi → báo file). Cặp đối chiếu nên giữ.
- **C264 ↔ C265, C266:** cấu hình fork / hệ quả trên file / fork subagent là ba câu hỏi khác nhau.
- **C228 ↔ Z11; G37 ↔ C222:** dạng chọn hai, có thêm ý (metadata, ngày).
- **C267 ↔ AI-CCARF-004:** cùng `disallowed_tools`, nhưng AI-004 hỏi vì sao bypass mode vẫn chạy Bash.
- **C202 ↔ C01:** cap số vòng chỉ là lưới an toàn, khác câu hỏi điều kiện dừng.
- **C229, F46, F35 ↔ OF-CCARF-12:** tách theo tài liệu / section để bắt mâu thuẫn chéo hoặc thuật ngữ định nghĩa; F35 chỉ thiếu lượt tích hợp.
- **AI-CCARF-006 ↔ L10:** lưu ra hệ thống ngoài và truyền tham chiếu, đáp án khác.
- **G29 ↔ L09:** giao một câu hỏi tìm kiếm cụ thể cho subagent giữa lúc thảo luận thiết kế, không phải khám phá chung.
- **D02 ↔ OF-CCARF-02:** tool trùng nghĩa → đổi tên + tách chức năng, còn OF-02 chỉ mở rộng mô tả. **AI-CCARP-021 ↔ D02:** namespace tool cùng tên giữa nhiều server.
- **D61 ↔ D53:** góc đặc tả MCP (`isError` trong kết quả, không phải lỗi JSON-RPC).
- **D03 ↔ D31; D47 ↔ D38; D49 ↔ D37; Z05 ↔ D10 + D11:** dạng chọn hai, có thêm phương án / gộp hai scope.
- **D16 ↔ D64:** đáp án khác (Read rồi Write so với `old_string` dài hơn / `replace_all`).
- **F37 ↔ F39 ↔ D09:** F37 có ý riêng (cho phép mảng findings rỗng để tránh bịa lỗi); D08 (`any`) khác D09 (tool cụ thể).
- **G38 ↔ G59:** cách báo một kết quả rỗng hợp lệ, khác chẩn đoán lỗi bị nuốt. **G41 ↔ G58:** chọn hai anti-pattern. **G57 ↔ OF-CCARF-08:** quyết định phía coordinator.
- **E34, E43, P01 ↔ OF-CCARF-05:** chọn giữa hai hướng hạ tầng / chọn hai / quy trình explore-plan-code khi sửa nhầm module.
- **E57 ↔ Z14, OF-CCARF-10:** chọn hai cờ. **Z06 ↔ E30, E53:** kết hợp `context: fork` và `allowed-tools`.
- **E54 ↔ OF-CCARF-06:** file khớp một mẫu chuyên biệt, OF-06 nhấn mạnh file rải khắp codebase (glob so với CLAUDE.md thư mục).
- **E01 ↔ E52 ↔ E49 ↔ P04:** sửa (đưa lên project) / giải thích vì sao CI không thấy / nơi đặt ngữ cảnh CI / lệnh test.
- **E39 ↔ P08:** thêm test case. **E37 ↔ E55:** viết test trước, khác với đưa output test lỗi. **E42 ↔ E45:** đáp án khác.
- **F23 ↔ N06:** kiểm claim theo nguồn, khác review code tự sinh.
- **F03 ↔ F18 ↔ OF-CCARF-03:** ví dụ ca mơ hồ cho định dạng / cho quyết định escalate khi đã có tiêu chí viết.
- **F36 ↔ F01; F48 ↔ F52:** tiêu chí cụ thể cho loại khác nhau; F36 dạng chọn hai.
- **F06 ↔ F22 ↔ F49 ↔ F55:** `other` + chi tiết / enum mức hỗ trợ / `unclear` cho scan hỏng / chọn hai.
- **F45 ↔ F67:** thêm kiểm tra ngữ nghĩa cụ thể rồi retry. **F53 ↔ Z07:** thông tin có nhưng scan mờ.
- **A11, F54 ↔ OF-CCARF-11:** chỉ hỏi vấn đề chính / dạng chọn hai. **A10 ↔ F69:** chỉ hỏi cách ghép kết quả.
- **F51 ↔ G14:** xung đột trong trích xuất (`conflict_detected`) khác xung đột giữa nguồn nghiên cứu.
- **G46, G42, G23 ↔ Z09:** chọn hai / giám sát liên tục / đo tỉ lệ giải quyết đúng.
- **G13 ↔ G43; G26 ↔ G10; G01 ↔ G19; G02 ↔ G24 ↔ G44; G30 ↔ G03, G20; G27 ↔ Z11; D24 ↔ OF-CCARF-03:** cùng chủ đề nhưng khác trigger hoặc khác đáp án.
- **AI-CCDVF-002 ↔ OF-CCARF-01:** cổng kiểm chất lượng giữa các bước prompt chain, khác cổng tiên quyết trước một tool.

## Ghi chú
- Không retire câu official hay ai nào. Không có câu ccx `reviewed` nào nằm trong danh sách retire.
- Nhiều câu ccx dùng cùng khuôn phương án nhiễu theo từng kịch bản. Khi sinh câu thay thế cho D1, D2 và tình huống S4, nên đổi góc hỏi (vd. hỏi hệ quả, hỏi cấu hình cụ thể, hỏi chọn giữa hai cơ chế đúng một phần), đừng chỉ đổi bối cảnh.

## Đã áp dụng (2026-11-18)

- Chỉ retire **48** câu trùng **cùng scenario** (hoặc không có scenario) với câu được giữ. **41** câu là biến thể cùng quyết định ở scenario khác được **giữ lại**: đề thật và chế độ thi thử bốc 4/6 scenario, bỏ biến thể sẽ làm mỏng ô scenario × domain. Có thể retire thêm sau khi soát nếu muốn khử chặt hơn.
- C08, D12, E08 chỉ trùng trong CCAR-F: gỡ mapping CCAR-F (và scenario), giữ cho CCDV-F thay vì retire.
- Cùng đợt, các báo cáo khác: A09 chỉ gỡ mapping CCDV-F (giữ CCAR-F D4); B15 chỉ gỡ mapping CCAO-F (giữ CCDV-F D5); H09 retire (trùng ở cả CCDV-F và CCAO-F).
- Câu đã retire: C04, C10, C09, C11, C12, C231, G28, C15, C07, C05, E21, G31, G15, D07, D04, D14, D15, D43, D05, D34, E02, E35, E07, E33, E09, E10, E13, E14, E15, E16, F20, E04, L03, A21, F12, F10, F11, F04, F08, F24, G07, G05, Z13, G12, Z12

KEEP_IDS: OF-CCARF-07,OF-CCARF-01,Z01,C236,C205,C206,Z03,C13,C217,C213,C14,C214,C215,C264,Z10,Z11,C219,L09,L10,C222,C200,OF-CCARF-02,OF-CCARF-09,Z02,D51,D09,D10,M05,M07,D38,D37,D32,M06,G59,G58,D53,OF-CCARF-04,OF-CCARF-05,E06,P07,OF-CCARF-10,Z14,N06,P06,P10,P09,P08,E30,E26,OF-CCARF-06,E54,E53,L02,L08,OF-CCARF-11,OF-CCARF-12,Z08,F69,F67,Z07,F23,G43,F01,OF-CCARF-03,G20,G10,G40,Z09,OF-CCARF-08
RETIRE_IDS: C04,C08,C226,C238,C243,C10,C246,C241,C09,C227,C242,C11,C12,C231,C225,C239,C224,C212,C235,G28,C15,C223,C07,C216,C233,C05,C234,E21,E36,G31,G15,C237,D52,D07,D04,D45,D30,D06,D46,D28,D50,D12,M01,D13,D14,D15,D29,D36,D43,D05,D34,D26,E02,E46,E35,E07,E33,E08,E09,E10,E13,E44,E14,E15,E16,F20,E04,E48,E47,E31,E28,L03,E05,A21,F12,F10,F11,F04,F30,F08,F47,F34,F24,G07,G05,Z13,G11,G12,Z12
