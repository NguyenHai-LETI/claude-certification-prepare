# Khử trùng ngân hàng câu hỏi — CCDV-F — 2026-11-18

Người soát: claude-opus-5-5 · Phạm vi: toàn bộ 303 câu active của CCDV-F (mọi pack, mọi domain D1–D8) · Tiêu chí: g trong `.claude/skills/cert-review/SKILL.md` ("cùng quyết định + cùng đáp án ở góc giống nhau = trùng").

Cách làm: so từng cặp stem và đáp án trong cùng domain và giữa các domain. Với mỗi cặp nghi trùng, đọc đủ phương án, đáp án và giải thích trong `bank/packs/*.yaml` rồi mới kết luận. Chỉ đề xuất retire câu thuộc pack `ccx`. Câu giữ được chọn theo thứ tự: official > ai > ccx đã `reviewed` > ccx viết tốt hơn (tình huống thực tế hơn, phương án nhiễu hợp lý hơn, giải thích đủ hơn).

Quy ước để giữ thận trọng:
- Câu chọn nhiều đáp án (multi-select) mà gộp đáp án của hai câu đơn thì **không** coi là trùng, trừ khi đáp án của câu đơn đã chứa đúng mọi khoá của câu kia (F64 ↔ F15).
- Hỏi "vì sao / chẩn đoán" và hỏi "làm gì / sửa thế nào" về cùng một sự kiện thì **không** coi là trùng (H04 ↔ H12, A14 ↔ A41, A18 ↔ A37). Cũng không coi là trùng khi một câu hỏi định nghĩa, câu kia hỏi áp dụng.
- Khác bối cảnh bề mặt (sản phẩm, loại dữ liệu) nhưng cùng quyết định và cùng đáp án thì vẫn là trùng (D20/X32 ↔ OF-CCDVF-03, D58 ↔ D21).

**Lượt này không sửa file nào trong `bank/packs/`.** Muốn áp dụng thì đặt `status: retired` và `reviewed: 2026-11-18` cho các câu trong `RETIRE_IDS`.

## Tổng kết

| Chỉ số | Giá trị |
|---|---|
| Số câu active trước khử trùng | 303 |
| Số nhóm trùng | 26 |
| Số câu đề xuất retire (đều thuộc `ccx`) | 29 |
| Số câu còn lại | 274 |
| Nhóm trùng có câu official làm đại diện | 3 (OF-CCDVF-01, OF-CCDVF-02, OF-CCDVF-03) |

### Số câu theo domain

| Domain | Trọng số đề | Trước | Retire | Còn lại | Tỉ lệ trong ngân hàng sau khử trùng |
|---|---|---|---|---|---|
| D1 Agents and Workflows | 14,7% | 40 | 2 | 38 | 13,9% |
| D2 Applications and Integration | 33,1% | 87 | 10 | 77 | 28,1% |
| D3 Claude Code | 3,1% | 28 | 2 | 26 | 9,5% |
| D4 Eval, Testing, and Debugging | 2,6% | 13 | 2 | 11 | 4,0% |
| D5 Model Selection and Optimization | 16,8% | 42 | 2 | 40 | 14,6% |
| D6 Prompt and Context Engineering | 11,0% | 30 | 2 | 28 | 10,2% |
| D7 Security and Safety | 8,1% | 30 | 4 | 26 | 9,5% |
| D8 Tools and MCPs | 10,6% | 33 | 5 | 28 | 10,2% |
| **Tổng** | 100% | **303** | **29** | **274** | |

Ghi chú về độ phủ sau khử trùng:
- Sau khử trùng, không domain nào thiếu câu tuyệt đối. Đề 53 câu cần khoảng 18 câu D2, 9 câu D5, 8 câu D1 và 1–2 câu cho D3/D4. Ngân hàng còn ít nhất gấp 4 lần số đó ở mọi domain.
- **D2 thấp hơn trọng số:** chiếm 28,1% ngân hàng, trong khi đề có 33,1%. D2 cũng mất nhiều câu nhất (10), vì nhiều câu `ccx` diễn đạt lại cùng một ý: lưu prompt trong version control, Batches cho việc không gấp, relay SSE. Nên sinh thêm câu D2 ở các góc ít câu: yêu cầu phi chức năng, Files API, data access pattern, citations.
- **D5 hơi thấp** (14,6% so với 16,8%). D3 và D7 đang nhiều câu hơn trọng số, không cần thêm.
- **D4 chỉ còn 11 câu**, đủ cho 1–2 câu mỗi đề nhưng ít biến thể. Nếu muốn giảm học thuộc thì nên bổ sung vài câu.

## Danh sách trùng

| Giữ | Retire | Domain | Lý do trùng (1 dòng) |
|---|---|---|---|
| OF-CCDVF-01 (official) | A09 | D2 | Khối lượng lớn, không gấp, ưu tiên chi phí → Message Batches API. A09 là bản diễn đạt lại câu mẫu Exam Guide. |
| X03 | A29 | D2 | Backend chuyển tiếp sự kiện SSE của API xuống trình duyệt để hiện chữ dần. X03 có phương án nhiễu tốt hơn (lộ key, WebSocket thẳng tới API, polling). |
| X03 | A42 | D5 / D2 | Cùng quyết định relay SSE từ backend tới trình duyệt (SSE/WebSocket). A42 còn bị gắn sai D5. |
| DV02 | A13 | D2 | Hạ tầng chuẩn hoá AWS/IAM → gọi Claude qua Amazon Bedrock. DV02 có phương án nhiễu và giải thích đầy đủ hơn. |
| A47 | A26 | D2 | Model bị deprecate có ngày retire → chạy eval trên model thay thế rồi chuyển có kế hoạch. A47 giải thích rõ hơn. |
| X12 | B17 | D2 | Extended thinking với tool use → gửi lại nguyên thinking block (không sửa, không bỏ). X12 có tình huống và phương án nhiễu hợp lý hơn. |
| A48 | A15 | D2 | Không biết thay đổi prompt nào gây giảm chất lượng → prompt trong version control + review + eval mỗi lần đổi. Gần như nguyên văn. |
| A48 | A36 | D2 | Cùng đáp án "prompt production nằm trong version control, review qua PR"; chỉ bỏ phần tình huống. |
| A50 | X31 | D2 | Bước chặn trước merge dùng API đồng bộ, báo cáo/audit định kỳ dùng Batches. A50 phủ thêm live chat, phương án nhiễu tốt hơn. |
| DV03 | B13 | D5 / D2 | Model mới ra → chạy lại eval trên model mới trước khi chuyển production. DV03 có tình huống cụ thể, thêm ý rollout dần. |
| X18 | C17 | D1 / D6 | Nhớ thông tin qua nhiều phiên cách nhau nhiều ngày → lưu ra file/bộ nhớ bền mà agent đọc, ghi (memory tool). X18 cụ thể hơn, phương án nhiễu phân biệt compaction/context editing. |
| X16 | C254 | D1 / D6 | Tool result cũ chiếm context → context editing xoá kết quả cũ. X16 có ràng buộc "không cần tóm tắt" để phân biệt với compaction. |
| A38 | H11 | D7 / D2 | Nội dung ngoài chèn vào prompt → bọc bằng thẻ XML và nói rõ đó là dữ liệu, không phải lệnh. Phương án nhiễu của H11 lộ ("viết hoa"). |
| DV08 | E59 | D2 | Quyền Claude Code dùng chung cho cả đội → `.claude/settings.json` commit vào repo. DV08 có tình huống. |
| DV09 | N04 | D2 | Thay đổi lớn trên hàng trăm file bằng Claude Code → lập kế hoạch, làm theo lô nhỏ, chạy test/CI sau mỗi lô. |
| DV12 | E22 | D3 | Claude Code headless trong CI không ai duyệt → khai báo sẵn quyền tối thiểu, việc khác bị từ chối. DV12 nêu đúng chế độ `dontAsk`. |
| E64 | E19 | D3 | Repo chưa có CLAUDE.md → chạy `/init`. E64 có phương án nhiễu hợp lý hơn (E19 chỉ là bốn lệnh slash). |
| F15 | F64 | D6 | Xử lý JSON phòng thủ: validate theo schema và retry kèm lỗi. Đáp án của F15 chứa đúng hai khoá của F64. |
| F59 (reviewed) | F13 | D6 | Tài liệu dài đặt trước, câu hỏi đặt cuối prompt. F59 đã soát. |
| G51 | G16 | D4 | Lỗi 400 vì `tool_result` thiếu hoặc sai `tool_use_id` → lỗi tầng tích hợp, sửa code ghép `tool_result`. G51 có phương án nhiễu tốt hơn. |
| G17 (reviewed) | G53 | D4 | Bước chẩn đoán đầu tiên khi output agent sai → đọc trace từng bước tìm chỗ hỏng đầu tiên. G17 đã soát. |
| OF-CCDVF-02 (official) | H01 | D7 | Trang web có lệnh ẩn "ignore previous instructions…" → coi nội dung là dữ liệu không tin cậy, tách khỏi chỉ dẫn, guard hành động nhạy cảm. H01 là bản diễn đạt lại câu mẫu Exam Guide. |
| X26 | H06 | D7 | Key API cho dev/staging/prod → mỗi môi trường một key (workspace), lưu trong secrets manager, xoay vòng. X26 có tình huống và giải thích tốt hơn. |
| H17 | H09 | D7 | PII không cần cho bản tóm tắt → che hoặc tokenize trong code trước khi gửi API. H17 có phương án nhiễu hợp lý hơn (H09: "bỏ dự án", "gửi ngoài giờ"). |
| M10 | D19 | D8 | MCP server từ xa, nhiều client qua mạng → Streamable HTTP. M10 có phương án nhiễu hợp lý hơn (HTTP+SSE cũ). |
| OF-CCDVF-03 (official) | D20 | D8 | Dịch vụ nội bộ cần dùng lại cho nhiều ứng dụng Claude, bảo trì độc lập → MCP server. Gần nguyên văn câu mẫu Exam Guide. |
| OF-CCDVF-03 (official) | X32 | D8 | Cùng quyết định "một MCP server cho dịch vụ nội bộ dùng chung nhiều app" (giá thay cho kho hàng). |
| D21 | D58 | D8 | Hướng dẫn/quy trình dùng lại, chỉ nạp khi liên quan → Skill. D21 có phương án nhiễu "global CLAUDE.md" phân biệt đúng ý "chỉ nạp khi cần". |
| W10 | D54 | D8 | Tool chồng chéo làm chọn nhầm → gộp thành một tool mô tả rõ. W10 có phương án nhiễu hợp lý hơn (D54: "sắp xếp theo alphabet", "tăng temperature"). |

### Câu retire có gắn kỳ thi khác

| Câu | Gắn thêm | Ảnh hưởng |
|---|---|---|
| A09 | CCAR-F D4 (S6) | CCAR-F D4 vẫn có câu official OF-CCARF-11 về chọn Batches/đồng bộ, nên retire toàn cục vẫn ổn. Nếu muốn giữ A09 cho CCAR-F thì chỉ gỡ mapping `CCDV-F` thay vì retire. |
| H09 | CCAO-F D6 | CCAO-F D6 vẫn có OF-CCAOF-03 và K21 về che dữ liệu cá nhân trước khi đưa cho Claude, nên retire toàn cục vẫn ổn. |

Các câu retire còn lại chỉ gắn CCDV-F.

## Gần giống nhưng giữ cả hai

| Cặp / nhóm | Lý do không coi là trùng |
|---|---|
| C16 ~ C262 (~ C250, L06) | Cùng chủ đề Managed Agents và Agent SDK. C16 cho tình huống và hỏi chọn sản phẩm. C262 hỏi ngược lại, chọn hai lý do, với phương án nhiễu VPC/toàn quyền kiểm soát. C250 hỏi chiều SDK tự host, L06 hỏi đánh đổi. |
| A25 ~ C261 ~ C256 | Cùng tiêu chí agent hay workflow. A25 hỏi khâu phân tích yêu cầu (gồm cả lựa chọn một lời gọi), C261 chọn hai tình huống, C256 áp dụng vào một việc cụ thể (lượt soát trước cũng giữ C256 ~ C261). |
| A14 ~ A41 ~ A45 | Đều về ghim phiên bản model. A14 hỏi cách sửa một sự cố, A41 hỏi lý do (có nhiễu "bản ghim không bao giờ bị retire"), A45 gộp quản lý cấu hình. |
| A18 ~ A37 | A18 hỏi bề mặt nào không có system prompt của Anthropic. A37 hỏi nguyên nhân cùng chỉ dẫn mà khác hành vi giữa claude.ai và API. |
| A06 ~ F14 ~ A44 | A06 hỏi cơ chế API (tham số `system` cấp cao so với message role system). F14 hỏi cách chia nội dung system/user. A44 chọn hai sự kiện về Messages API. |
| DV05 ~ A48 | DV05 nhấn vào truy vết từng request (log phiên bản prompt + model ID), A48 nhấn vào version control + eval. **Cần người xem:** A48 coi "lưu bản sao prompt vào metadata mỗi request" là sai, trong khi DV05 coi log phiên bản theo request là đúng, nên người học dễ thấy mâu thuẫn. Nên làm rõ giải thích của A48. |
| A33 ~ A50 ~ A11 ~ OF-CCDVF-01 | A33 hỏi ngược lại (việc nào phải giữ realtime), A11 hỏi tìm lỗi khi đưa bước chặn sang Batches, A50 hỏi ánh xạ ba việc. Mỗi câu một góc. |
| B01 ~ B15 ~ B29 ~ B23 | Đều ra Haiku/mức nhẹ, nhưng B01 là phân loại khối lượng lớn đã đạt eval, B15 là nháp có người duyệt (gắn thêm CCAO-F D3), B29 chọn hai việc (có subagent tra cứu), B23 hỏi `effort` chứ không hỏi model. |
| B09 ~ B10 ~ B28 (reviewed) | B09 chẩn đoán `cache_read_input_tokens` = 0, B10 hỏi phạm vi cache bị mất khi đổi tool, B28 chọn hai thay đổi làm vỡ cache. Multi-select gộp hai câu đơn không tính trùng. |
| H04 (reviewed) ~ H12 ~ H13 | H04 hỏi cách chặn, H12 chẩn đoán vì sao exit 1 không chặn, H13 hỏi dạng JSON deny (lượt soát trước cũng giữ H04 ~ H12). |
| X26 ~ H16 ~ H07 | H16 chọn hai, có thêm ý thu hồi key khi lộ. H07 hỏi việc làm ngay khi lộ key. |
| A38 ~ H15 | H15 chọn hai, thêm ý escape markup giả thẻ hoặc role. |
| OF-CCDVF-02 ~ DV20 ~ DV21 ~ AI-CCARP-036 ~ DV22 | Cùng chủ đề prompt injection gián tiếp nhưng khác biện pháp: đặt dữ liệu trong `tool_result`, chỉ dẫn ở user turn, lớp classifier, bớt tool nguy hiểm. |
| C260 ~ B16 ~ AI-CCARF-009 | Đều cắt bớt output của tool, nhưng C260 vì context đầy (HTML thô), B16 vì chi phí, AI-CCARF-009 về thiết kế tool trả về (định danh có nghĩa, `response_format`). |
| C259 ~ L04 ~ L05 | C259 hỏi có nên giao việc cho subagent không, L04 hỏi vì sao subagent giúp, L05 hỏi subagent nên trả về gì. |
| C257 ~ AI-CCARF-001 | C257 hỏi lời giao việc thiếu ngữ cảnh. AI-CCARF-001 hỏi cơ chế SDK: subagent không nhận system prompt của cha. |
| C267 ~ AI-CCARF-004 | Đều dùng `disallowed_tools`, nhưng AI-CCARF-004 chẩn đoán `allowed_tools` không giới hạn được `bypassPermissions`. |
| U01 ~ U10 | U01 hỏi định nghĩa evaluator–optimizer, U10 áp dụng vào tình huống. |
| U02 ~ AI-CCDVF-001 | Parallelization dạng sectioning so với dạng voting: khác đáp án. |
| A01 ~ AI-CCDVF-012 ~ G48 | `max_tokens` cắt cụt, nhưng A01 hỏi cách sửa, AI-CCDVF-012 hỏi giải thích (hợp với câu trả lời ngắn ở đầu), G48 chẩn đoán JSON hỏng. |
| A02 ~ A04 ~ A43 ~ DV04 ~ X07 ~ X09 | Khác mã lỗi (429 có `retry-after`, 529), khác biện pháp thêm (queue/fallback, giới hạn concurrency) hoặc khác trường hợp (spend limit không retry được). |
| A16 ~ A35 | A16 hỏi một việc tương tác cụ thể. A35 chọn hai, có thêm retry 429/529. |
| A17 ~ X01 ~ U03 | A17 hỏi SDK retry mặc định thế nào, X01 hỏi quyết định chuyển sang SDK, U03 hỏi SDK thêm gì nói chung. |
| A34 ~ X02 | A34 hỏi đủ ba header bắt buộc. X02 chẩn đoán header còn thiếu khi đã có key và JSON. |
| X04 ~ X06 | X04 hỏi ước lượng token trước job (`count_tokens`). X06 hỏi chặn input vượt context. |
| A49 ~ N02 | A49 hỏi vận hành vòng đời nói chung. N02 hỏi riêng drift chất lượng (lấy mẫu output thật để chấm). |
| A39 ~ P03 ~ G18 | A39 là thiết kế ứng dụng chat, P03 là lệnh `/clear` trong Claude Code, G18 là nhầm phiên bản code (compact + CLAUDE.md). |
| DV06 ~ DV07 ~ E58 | DV06 hỏi cách khai báo dependency, DV07 hỏi đọc nghĩa `~2.1.0`, E58 hỏi quy trình phát hành phía chủ plugin. |
| DV15 ~ E65 ~ E23 | DV15: deny vẫn áp dụng trong `bypassPermissions`. E65: deny thắng allow giữa các cấp. E23: ask thắng allow (khác đáp án). |
| E01 ~ P04 | E01 hỏi CLAUDE.md cấp user so với cấp project, P04 hỏi nơi ghi lệnh test. |
| E66 (reviewed) ~ D21 | E66 hỏi Skill hay CLAUDE.md, chọn hai. D21 so Skill với MCP/tool/CLAUDE.md (lượt soát trước cũng giữ). |
| P08 ~ F03 ~ F16 | Đều dùng ví dụ nhưng khác vấn đề: chỉ dẫn mơ hồ (before/after), ca ranh giới (kèm lập luận), bộ ví dụ thiếu ca bẩn. |
| D22 ~ W06 ~ W05 | W06 có thêm ý vẫn trả hai kết quả thành công cùng lỗi. W05 hỏi gom `tool_result` vào một message. |
| D55 ~ AI-CCDVF-008 ~ C08 | D55 là ngưỡng duyệt trong handler, AI-CCDVF-008 là không cấp tool chuyển tiền, C08 là chặn khi chưa xác minh danh tính. Ba cách kiểm soát khác nhau. |
| D12 ~ D18 ~ M02 | D12 áp dụng resource làm catalog, D18 hỏi định nghĩa primitive, M02 chọn hai primitive. |
| W03 ~ W04 | W03 hỏi cách sửa lỗi kiểu dữ liệu, W04 hỏi yêu cầu schema của strict. |
| F56 ~ AI-CCDVF-005 ~ F15 | F56 chọn structured outputs, AI-CCDVF-005 thay prefill bị bỏ, F15 validate + retry: khác đáp án hoặc khác góc. |
| D59 ~ OF-CCDVF-03 | D59 so MCP với Skill (chọn hai), không hỏi lại quyết định dùng lại cho nhiều app một mình. |
| B11 ~ B27 | B11 hỏi nên log trường nào, B27 hỏi kiểm tra gì khi hoá đơn tăng. |
| DV18 ~ AI-CCARP-036 | DV18 sàng input người dùng (is_harmful), AI-CCARP-036 sàng output của tool để bắt injection. |
| H02 ~ DV22 | H02 hỏi một tool phá huỷ cụ thể, DV22 chọn hai biện pháp (bớt tool + chỉ dẫn coi tool content là dữ liệu). |

KEEP_IDS: OF-CCDVF-01,X03,DV02,A47,X12,A48,A50,DV03,X18,X16,A38,DV08,DV09,DV12,E64,F15,F59,G51,G17,OF-CCDVF-02,X26,H17,M10,OF-CCDVF-03,D21,W10
RETIRE_IDS: A09,A29,A42,A13,A26,B17,A15,A36,X31,B13,C17,C254,H11,E59,N04,E22,E19,F64,F13,G16,G53,H01,H06,H09,D19,D20,X32,D58,D54
