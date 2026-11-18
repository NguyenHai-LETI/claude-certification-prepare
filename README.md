# 🎓 Claude Cert Trainer: luyện thi chứng chỉ Claude

App chạy trên máy để luyện 4 kỳ thi chứng chỉ Claude của Anthropic, chọn kỳ thi ngay trong app:

| Mã | Tên | Số câu / thời gian |
|---|---|---|
| CCAR-F | Claude Certified Architect – Foundations | 60 câu / 120 phút |
| CCDV-F | Claude Certified Developer – Foundations | 53 câu / 120 phút |
| CCAO-F | Claude Certified Associate – Foundations | 60 câu / 120 phút |
| CCAR-P | Claude Certified Architect – Professional | 63 câu / 120 phút |

Nội dung bám **Exam Guide v1.0**, bản áp dụng tới khi đề đổi ngày 07/12/2026. Điểm đạt là 720/1000. Chi tiết từng kỳ thi xem ở 📖 Tài liệu → `notes/00-tong-quan.md`.

## Chạy app

Cần Node.js 22.18 trở lên. Lần đầu chạy, app tự gọi `npm install`.

| Việc | macOS | Windows |
|---|---|---|
| Chạy trên máy này (http://127.0.0.1:3004) | nháy đúp `start.command`, hoặc `npm start` | nháy đúp `start.bat`, hoặc `npm start` |
| Chạy kèm ngrok để mở từ điện thoại hay máy khác | nháy đúp `public.command`, hoặc `npm run public` | nháy đúp `public.bat`, hoặc `npm run public` |

- Trong Claude Code, gõ `/cert-run` (start, stop, restart, status). Skill này cũng có hướng dẫn xử lý sự cố.
- **ngrok** dùng domain cố định `surreal-magnesium-mug.ngrok-free.dev` (khai báo trong `config.yaml` → `public.ngrok_domain`), chính là domain trước đây của trainer AWS.
  - Mỗi lúc chỉ một máy được giữ domain này.
  - Nếu ngrok báo `ERR_NGROK_334`, nghĩa là watchdog cũ của trainer AWS hoặc máy khác vẫn đang giữ domain. Tắt nó trước, ví dụ trên Windows chạy `trainer\.local\public-stop.cmd`.
  - Máy chưa có ngrok thì cài trước:
    - macOS: `brew install ngrok`
    - Windows: `winget install ngrok.ngrok`

    Sau đó chạy `ngrok config add-authtoken <token>`.
- **Mã truy cập:** thiết bị ngoài máy chạy app (qua ngrok hoặc LAN) phải nhập mã. Mã hiện ở ⚙️ Hệ thống trên máy chạy app và lưu trong `.local/access-code`.
  - Nhập đúng mã thì có **toàn quyền** như máy local: làm bài, AI, ⇅ đồng bộ, khởi động lại.
  - Nhập sai 10 lần trong 15 phút thì bị khóa tạm thời.
  - Đổi mã: xoá file `.local/access-code` rồi khởi động lại app.

## Deploy online miễn phí (Render)

Dùng `Dockerfile` + `render.yaml`. Ổ đĩa trên Render free bị xoá mỗi lần khởi động lại, nên khi khởi động container sẽ clone repo này và app tự đẩy `results/` lên GitHub qua ⇅ đồng bộ.

1. Tạo GitHub fine-grained token: chỉ repo này, quyền **Contents: Read and write**.
2. Trên [render.com](https://render.com): **New → Blueprint**, chọn repo này. Render đọc `render.yaml` và hỏi 3 biến:
   - `CERT_ACCESS_CODE`: mã truy cập tự đặt (chữ + số, ≥ 6 ký tự).
   - `GITHUB_TOKEN`: token ở bước 1. Thiếu token thì app vẫn chạy nhưng kết quả mất khi restart.
   - `ANTHROPIC_API_KEY`: tuỳ chọn, để bật 🤖 AI (tính phí theo API). Bỏ trống thì phần AI không dùng được.
3. Mở `https://<tên-service>.onrender.com` rồi nhập mã truy cập.

- Gói free ngủ sau 15 phút không có ai truy cập. Lần mở đầu tiên sau đó mất khoảng 1 phút để khởi động.
- Commit đồng bộ kết quả không kích hoạt deploy lại (`buildFilter` trong `render.yaml`).
- Thử local: `docker build -t claude-cert . && docker run -p 10000:10000 -e CERT_ACCESS_CODE=TEST1234 claude-cert`.

## Tính năng

- **✍️ Tạo bài test** có các chế độ:
  - Thi thử: đúng số câu và thời gian của đề, chia câu theo trọng số domain. Riêng CCAR-F bốc 4 trong 6 tình huống như đề thật.
  - Theo domain.
  - ❌ Ôn câu sai.
  - Câu chưa làm.
  - Ngẫu nhiên.
- **Chế độ chấm:** *Thi* chỉ xem đáp án khi nộp bài. *Luyện* kiểm tra từng câu, có giải thích, link tài liệu, 🤖 Hỏi AI và 🐞 Báo lỗi.
- **Kết quả:** % đúng, điểm quy đổi *ước tính* (72% ≈ 720, chỉnh ở `config.yaml` → `scoring.pass_pct`), điểm theo domain, xem lại từng câu, làm lại các câu sai.
- **🏠 Tổng quan:** tỉ lệ đúng theo domain (tính trên 3 lần trả lời gần nhất của mỗi câu), điểm ước tính có trọng số, số câu cần ôn.
- **❌ Ôn câu sai:** câu đã sai nằm trong danh sách tới khi trả lời đúng 2 lần liên tiếp (`scoring.review_streak`).
- **🕘 Lịch sử**, **📖 Tài liệu** (có tìm kiếm cả ghi chú lẫn câu hỏi), **🗂️ Ngân hàng** (lọc theo kỳ thi, domain, pack, bài học).
- **🤖 AI, chạy bằng Claude Code CLI trên máy:**
  - Hỏi AI / gia sư trên từng câu. Tính năng này bị khoá khi đang thi ở chế độ Thi.
  - AI Coach: 📋 phân tích và lập kế hoạch, ✨ sinh câu, 🔍 kiểm định chất lượng câu, 🛠️ sửa câu bị báo lỗi.

  App tự tìm `claude` theo thứ tự: PATH, các vị trí cài đặt chuẩn, rồi bản đi kèm extension Claude Code của VS Code/Cursor. Có thể chỉ định đường dẫn ở `config.yaml` → `ai.claude_path`.
- **⇅ Đồng bộ git:** chỉ commit `results/`, `coach/` và `bank/` (`config.yaml` → `sync.data_paths`). App tự đồng bộ vài phút sau khi nộp bài, và đồng bộ trước và sau mỗi lượt AI Coach. App không bao giờ force-push, và không đẩy commit có thay đổi code.

## Ngân hàng câu hỏi (`bank/packs/`)

| Pack | Nguồn | Số câu |
|---|---|---|
| `ccx.yaml` | Câu tự soạn từ tài liệu ôn tập công khai [artifact 3NhHr42…](https://claude.ai/artifact/3NhHr42CxTHGEs33N1ntFf). Tác giả không nêu tên, không ghi giấy phép, không thuộc Anthropic. Nhập bằng `npm run import-ccx -- <thư mục assets>` | 955 |
| `official.yaml` | Câu mẫu trong 4 Exam Guide chính thức, chép nguyên văn; giải thích tự viết | 21 |
| `ai-20261118-*.yaml` | AI sinh từ tài liệu chính thức của Anthropic, có kiểm định độc lập (báo cáo trong `bank/reviews/`) | 100 |

- Định dạng pack và quy ước id: [SPEC.md](SPEC.md) §2.1.
- Mỗi câu gắn với một hoặc nhiều kỳ thi: `exams: {CCAR-F: D3, CCDV-F: D3}`.
- Kiểm tra ngân hàng bằng `npm run validate`.

## Tài liệu (`notes/`)

- `00-tong-quan.md`, `exams/<MÃ>.md`: tự viết từ Exam Guide v1.0, FAQ của Anthropic Partner Academy, Pearson VUE và docs chính thức. Cuối mỗi mục có ghi nguồn.
- `lessons/*.html`: 26 bài học chuyển từ artifact nói trên, có ghi nguồn ở đầu mỗi bài. Chuyển bằng `node scripts/import-lessons.ts <thư mục>`.

## Phát triển

```bash
npm run dev        # server + Vite middleware
npm run build      # UI → dist/
npm run check      # validate + typecheck + test
npm run test:ui    # Playwright smoke (cần server đang chạy, CERT_URL=…)
```

Thiết kế, API và các quy tắc tính điểm: [SPEC.md](SPEC.md).

Biến môi trường:
- `CERT_PORT`
- `CERT_ROOT` (thư mục dữ liệu)
- `CERT_SYNC=0` (tắt git sync)
- `CERT_ACCESS_CODE`
- `CERT_CLAUDE_BIN`
- `CERT_NGROK_BIN`
