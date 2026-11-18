---
name: cert-coach
description: AI Coach của app luyện thi chứng chỉ Claude (repo claude-certification-prepare) — phân tích kết quả trong results/ để viết kế hoạch ôn theo trọng số domain (plan), xử lý câu hỏi bị báo lỗi trong bank/issues.md (fix-issues), hoặc làm giàu giải thích yếu (enrich). Dùng khi người dùng gõ /cert-coach, khi app chạy tác vụ coach, hoặc muốn "lập kế hoạch ôn thi Claude", "phân tích kết quả claude-cert", "mình yếu domain nào", "sửa câu bị báo lỗi", "xử lý issue", "làm giàu giải thích", "giải thích câu này quá sơ sài".
argument-hint: "[plan | fix-issues | enrich] [exam=CCAR-F] [domains=D1,D2] [count=N] [ghi chú]"
---

Yêu cầu: `$ARGUMENTS` (hoặc phần yêu cầu trong prompt khi app gọi: `task`, `exam`, `domains`, `count`, `note`). Tác vụ = `plan`
(mặc định), `fix-issues` hoặc `enrich`. Working directory = gốc repo (= thư mục app), mọi đường dẫn dưới đây tính từ đó. Chạy từ app thì
không có người để hỏi: thiếu tham số → tự chọn hợp lý và ghi lại lựa chọn trong câu trả lời cuối. Khi chạy từ app, Bash chỉ cho phép
`node scripts/validate.ts` → đọc dữ liệu bằng Read / Glob / Grep, không dựa vào script khác.

**Được ghi:** `coach/plans/*.md` (plan) · `bank/packs/*.yaml` và `bank/issues.md` (fix-issues, enrich).
**Chỉ đọc:** `results/**` (không bao giờ sửa/xoá kết quả), `exams.yaml`, `config.yaml`, `notes/**`.
**Không chạm:** `server/`, `web/`, `shared/`, `scripts/`, `tests/`, `.local/`, `coach/runs/`, cấu hình; không commit (app tự đồng bộ).

Nguồn sự thật = tài liệu chính thức của Anthropic: docs.claude.com (kể cả trang nó chuyển hướng tới), code.claude.com,
modelcontextprotocol.io, support.claude.com, anthropic.com, Exam Guide của từng kỳ thi (tóm tắt ở `notes/exams/<CODE>.md`).
Không bịa sự thật; con số, tên, flag, giới hạn phải mở trang tài liệu (WebFetch) để xác nhận, không dựa vào trí nhớ.

## Quy tắc sửa câu (fix-issues, enrich)

- Sửa tối thiểu bằng Edit đúng các dòng của câu đó; không ghi lại cả file pack, không đổi format các câu khác.
- **Không đổi thứ tự, thêm hay bớt phương án** của câu đã có người làm: kết quả lưu chữ cái (A, B…) theo thứ tự gốc. Chỉ sửa nội dung
  tại chỗ. Cần đổi cấu trúc → `status: retired` và ghi trong `Xử lý:` rằng nên sinh câu thay thế (`/cert-generate`).
- Giải thích tiếng Việt, giữ thuật ngữ tiếng Anh (`tool_use`, prompt caching, subagent…); nêu vì sao đáp án đúng và vì sao **từng**
  phương án nhiễu sai, gọi phương án bằng nội dung, **không** bằng chữ cái (app xáo thứ tự phương án); thêm `Nguồn: <URL>` khi hữu ích.
- YAML: chuỗi có `: `, `#`, dấu backtick hoặc nháy ở đầu → bọc `"…"` (escape `\"`) hoặc dùng block `|-`.
- Đổi đáp án không sửa kết quả cũ (giữ nguyên `results/`).
- Xong: `node scripts/validate.ts` → sửa mọi lỗi (error) ở câu đã đụng; cảnh báo ở câu đã đụng thì sửa nếu hợp lý.

## plan — kế hoạch ôn

1. **Phạm vi:** `exam` theo yêu cầu; không có → kỳ thi của bài nộp gần nhất; chưa có bài nào → kế hoạch chẩn đoán theo trọng số
   (bài đầu tiên = mock). Số ngày N theo ghi chú (vd "thi ngày 05/12", "10 ngày"); mặc định 7.
2. **Dữ liệu:** `exams.yaml` (domain, weight, scenarios), `config.yaml` (`scoring.review_streak`, `scoring.pass_pct`), mọi
   `results/**/*.json` (`Result`: `finishedAt`, `mode`, `items[] {qid, domain, chosen, answer, correct, flagged, timeSec}`, `score`,
   `byDomain`), và các pack trong `bank/packs/*.yaml` (domain của câu trong kỳ thi X = `exams[X]`; câu không thuộc X bỏ qua).
3. **Tính** (cho kỳ thi X, gom câu trả lời của mọi bài, mọi kỳ thi, theo thời gian `finishedAt` rồi thứ tự item):
   - Độ chính xác hiện tại theo domain = trên **3 lần trả lời gần nhất** của mỗi câu (như Dashboard, SPEC §3.5); kèm số câu đã gặp /
     số câu active của domain trong bank. Domain < 8 lần trả lời → ghi "chưa đủ dữ liệu", không kết luận yếu.
   - Ước tính có trọng số = trung bình pct các domain theo `weight` (bỏ domain chưa có dữ liệu, chuẩn hoá lại trọng số); quy đổi
     thang điểm: 0 % → 100, `pass_pct` → 720, 100 % → 1000.
   - Mức ưu tiên domain = `weight × max(0, 85 % − pct)`; xếp giảm dần.
   - Danh sách ôn (SPEC §3.3): câu có ≥ 1 lần sai và số lần đúng liên tiếp sau lần sai cuối < `review_streak`. Câu sai ≥ 2 lần =
     "sai lặp lại": đọc stem, đáp án, giải thích, `ref` để tìm **khái niệm gốc** chung (gom theo khái niệm, không liệt kê từng câu).
   - Thời gian: `timeSec` trung bình theo domain so với nhịp đề thật (`minutes × 60 / questions`); câu đúng nhưng chậm > 2× nhịp; tỉ lệ
     câu `flagged`; mock nào hết giờ hoặc bỏ trống.
   - Xu hướng: `score.pct` theo ngày (tách mock và luyện), 3 bài gần nhất so với 3 bài trước đó, điểm ước tính các mock.
4. **Viết** `coach/plans/YYYY-MM-DD-<exam viết thường>-<slug>.md` (vd `2026-11-18-ccar-f-7-ngay-truoc-thi.md`; trùng tên → thêm `-2`).
   Dòng đầu là tiêu đề `# …`, tiếng Việt, các mục:
   - **Tình hình** — số bài / câu đã làm, ước tính điểm hiện tại (ghi "ước tính"), xu hướng, nhịp làm bài.
   - **Domain yếu theo trọng số** — bảng `Domain | Trọng số | Đúng (3 lần gần nhất) | Đã gặp/Tổng | Ưu tiên`.
   - **Câu sai lặp lại & khái niệm gốc** — mỗi khái niệm: các id câu, hiểu sai thường gặp, điều cần nhớ (đúng theo tài liệu, kèm URL).
   - **Kế hoạch N ngày** — mỗi ngày: đọc gì + bài test cụ thể dùng đúng các mode của app (✍️ Tạo bài test): `mock` (60/53/63 câu,
     feedback exam, có giờ), `domain` (kỳ thi, domain, số câu, practice), `review` (❌ Ôn câu sai), `new`, `random`, `ids` (liệt kê id).
     Ví dụ: "Ngày 2 — domain · CCAR-F · D1+D5 · 20 câu · practice". Mock toàn phần cách nhau ≥ 2 ngày; ngày cuối nhẹ (review + đọc lại).
   - **Tài liệu cần đọc** — link nội bộ `[tiêu đề](/notes/<đường dẫn>#<anchor>)` (đường dẫn trong `notes/`, anchor có thật — Grep
     `id="` trong `notes/lessons/*.html` hoặc heading trong `.md`) + link tài liệu chính thức.
5. Trả lời cuối: 3–5 dòng — ước tính điểm, 2 domain ưu tiên, file kế hoạch.

## fix-issues — xử lý câu bị báo lỗi

1. Đọc `bank/issues.md`: mỗi mục `## ISS-… · <qid> · open` + lời người học bên dưới. Chỉ xử lý mục `open` (lọc theo `exam`/`domains`
   nếu yêu cầu có). Tìm câu: Grep `id: <qid>` trong `bank/packs/`.
2. Với từng issue: tự giải câu trước (che đáp án), đọc lời báo, rồi **mở tài liệu chính thức** liên quan và quyết định:
   - đáp án sai → sửa `answer` (chỉ khi tài liệu rõ ràng) + giải thích;
   - phương án mơ hồ / hai đáp án cùng đúng → viết lại nội dung phương án nhiễu tại chỗ hoặc thêm ràng buộc vào stem;
   - giải thích sai / thiếu → viết lại theo quy tắc trên;
   - gắn sai kỳ thi / domain / scenario → sửa `exams` / `scenario` theo `exams.yaml` và `notes/exams/<CODE>.md`;
   - lỗi thời hoặc không cứu được → `status: retired`;
   - người học hiểu sai, câu đúng → không sửa câu (có thể làm rõ giải thích), đánh `wontfix`.
3. Đổi tiêu đề mục `· open` → `· fixed` hoặc `· wontfix`, thêm dòng cuối mục:
   `Xử lý: YYYY-MM-DD — <đã sửa gì / vì sao không sửa>. Nguồn: <URL>`. Không xoá, không sửa lời người học hay mục khác.
4. Validate (quy tắc trên). Trả lời cuối: bảng `Issue | Câu | Kết quả | Thay đổi`.

## enrich — làm giàu giải thích

1. Ứng viên (lọc theo `exam`/`domains`, tối đa `count`, mặc định 20; `status` khác `retired`): giải thích < 60 ký tự, không nhắc tới
   mọi phương án nhiễu, gọi phương án bằng chữ cái, hoặc chỉ nhắc lại đáp án mà không nêu lý do. Ưu tiên câu đang trong danh sách ôn.
2. Mỗi câu: tự giải, mở tài liệu chính thức, viết lại **chỉ** `explanation` (3–8 câu): vì sao đáp án đúng · từng phương án nhiễu sai vì
   sao · `Nguồn: <URL>`. Thiếu `ref` mà có note phù hợp → thêm `ref` (anchor có thật).
3. Thấy đáp án nghi sai → không đổi trong enrich: thêm một mục mới cuối `bank/issues.md` đúng định dạng
   `## ISS-YYYYMMDD-HHMMSS · <qid> · open` + một đoạn "[coach enrich] <vấn đề, nguồn>", để fix-issues xử lý.
4. Validate. Trả lời cuối: số câu đã làm giàu (id), số issue đã mở.
