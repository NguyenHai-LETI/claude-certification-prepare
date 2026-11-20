# Nhập artifact v0.39 — câu mới, bài học cấu trúc lại, port sửa đổi — 2026-11-20
Người làm: Claude Opus 5.5 (claude-opus-5-5) · Nguồn: https://claude.ai/artifact/3NhHr42CxTHGEs33N1ntFf bản v0.39 (2026-11-18) · Kết quả `npm run check`: xem commit.

## 1. Câu hỏi (`bank/packs/ccx.yaml`)
- Thêm **108 câu mới** (955 → 1.063): CCDV-F 54, CCAR-F 23, CCAR-P 19, CCAO-F 14 (một số câu gắn hai kỳ thi). Câu mới **chưa có `reviewed:`**, tức là chưa qua soát; nên chạy `/cert-review` cho nhóm này.
  - Id mới: A51–A57, B30–B36, C268–C274, D66–D75, DV23–DV28, E71–E75, F70–F75, G62–G65, H19–H25, K172–K177, L11–L13, N11–N13, P11–P13, T14–T17, X33–X34, Y36–Y41, Z15–Z17, PA43–PA48, PB30–PB32, PC45–PC49, PD32–PD36.
- 955 câu cũ: stem, phương án, đáp án, giải thích, `exams`, `status` (173 câu retired), `reviewed` **giữ nguyên** như sau các đợt soát 18–19/11. Upstream cũng không đổi nội dung các câu này (đã so từng trường với bản nhập 18/11).
- Chỉ đổi `ref`: artifact gộp 26 bài thành 23 bài + glossary, đổi tên file và anchor sang tiếng Anh, nên 955 ref chuyển sang ref của upstream.
- 5 ref đã được sửa tay ở đợt soát trước được ánh xạ lại theo đúng mục người soát chọn (không lấy ref upstream):
  - A25 → `07-agents.html#workflow-agent`
  - K101 → `15-ccao-f-work.html#configuration`
  - A46, A49 → `14-app-lifecycle.html#requirements-lifecycle`
  - PA39 → `21-evaluation-governance.html#optimization`

## 2. Pack AI (`ai-20261118-*.yaml`)
100 ref trỏ vào bài cũ được chuyển theo bảng ánh xạ mục cũ → mục mới (43 cặp). Mỗi cặp được đối chiếu với cách 955 câu ccx tự dời sang bài mới: 43/43 khớp. Mọi ref đều trỏ vào file và anchor có thật.

## 3. Bài học (`notes/lessons/`)
- Nhập lại 23 bài (01 nhập môn, 02–14 CCDV-F, 15–17 CCAO-F, 18 CCAR-F, 19–22 CCAR-P, 23 phụ lục Academy) và **trang mới `glossary.html`** (711 thuật ngữ, từ khoá đề thi). Xoá 26 file bài cũ.
- `notes/exams/*.md`: dòng "Bài học trong app" theo lộ trình học từng kỳ thi của artifact.

### Port sửa đổi của đợt soát 2026-11-19 (`2026-11-19-don-cuoi-mcp-allowed-tools.md`) sang bài mới
Bản v0.39 của artifact đã có một phần (SEP-2577, tên MCPServer, Sampling → gọi thẳng API) nhưng vẫn còn lỗi đợt soát đã sửa. Đã port:
- `06-mcp.html` (gộp bài 12 + phần MCP của bài 04 và 17 cũ):
  - Lead, bảng nhãn và xnote mục 4 ghi Sampling, Roots deprecated từ đặc tả 2026-07-28.
  - Ghi chú sau Hình 3: bản 2026-07-28 bỏ handshake `initialize`, có `server/discover`.
  - Ghi chú `MCPServer` sau ví dụ FastMCP đầu tiên; mục thuật ngữ FastMCP.
  - **Sửa lỗi**: hộp cảnh báo Sampling và chữ trong SVG nói "server mới dùng Elicitation thay thế" → đặc tả ghi đường chuyển đổi là gọi thẳng API nhà cung cấp LLM, Elicitation không phải bản thay thế.
  - Ghi chú Sampling, Roots, Streamable HTTP thay bằng bản theo đặc tả 2026-07-28 (bỏ session, `InputRequiredResult`, `subscriptions/listen`, bỏ `notifications/roots/list_changed`).
  - Cảnh báo "roots chỉ mang tính thông tin, không phải kiểm soát truy cập" ngay sau câu của khóa Academy; chú thích Hình 8; dòng Path traversal; insight CCAR-F D2; hộp Sai/Đúng.
  - Bảng từ khoá (cả trong `glossary.html`): Sampling, Elicitation, Roots, FastMCP.
- `07-agents.html`: câu "allowedTools phải có Task" thêm chú thích guide vs docs.
- `13-claude-code-config.html`: ô `allowed-tools` thêm chú thích docs hiện hành (`disallowed-tools`).
- `15-ccao-f-work.html`: **sửa lỗi** định nghĩa Product/Performance của khung 4D (người đọc, văn phong thuộc Product; Performance là cách AI cư xử khi cộng tác), ví dụ và hộp tóm tắt.
- `18-ccar-f-lab.html`: comment code Lab Ex4; bảng mục 6 thêm dòng `allowed-tools` và "MCP Roots, Sampling, Logging", bổ sung ô "Tool tạo subagent".
- `23-academy-courses.html`: dòng khóa MCP Advanced topics thêm lưu ý deprecate; ví dụ Description trong bảng 4D sửa theo định nghĩa đúng.

Lưu ý: `scripts/import-lessons.ts` ghi đè file bài học. Lần nhập sau phải port lại các sửa đổi ở trên (nếu upstream vẫn chưa có).
