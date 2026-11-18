---
name: cert-run
description: Vận hành app luyện thi chứng chỉ Claude (repo claude-certification-prepare, http://127.0.0.1:3004) trên macOS và Windows — khởi động / khởi động lại / dừng / kiểm tra, chạy local hoặc công khai qua ngrok (https://surreal-magnesium-mug.ngrok-free.dev) kèm watchdog. Dùng khi người dùng gõ /cert-run, hoặc muốn "chạy claude-cert", "mở app chứng chỉ Claude", "chạy app thi Claude", "mở ngrok cho claude-cert", "cho điện thoại vào app", "tắt app", "restart app", "app có chạy không", "ngrok chết", "lấy mã truy cập".
argument-hint: "[start | public | restart [public] | stop | status]"
---

Lệnh: `$ARGUMENTS` (trống = `start`). Working directory = gốc repo (= thư mục app), cổng **3004** (`config.yaml → server.port`),
tên miền công khai `surreal-magnesium-mug.ngrok-free.dev` (`config.yaml → public.ngrok_domain`). Mọi request không phải GET tới API
cần header `X-Cert: 1`.

| Chế độ | Lệnh (ở gốc repo) | Wrapper bấm đúp | Tiến trình |
|--------|-----------------------------|-----------------|------------|
| local | `node scripts/run.ts` (= `npm start`) | `start.command` (macOS) / `start.bat` (Windows) | supervisor → `server/index.ts`; tự build `dist/` khi thiếu/cũ, tự chạy lại khi crash hoặc exit 75 |
| public | `node scripts/public.ts` (= `npm run public`) | `public.command` / `public.bat` | như trên + `ngrok http 3004 --url=https://surreal-magnesium-mug.ngrok-free.dev` + watchdog (ghi `.local/public.json`) |

Gọi thẳng `node`, **không qua `npm`**: dừng tiến trình npm (nhất là trên Windows) không dừng node con, cổng vẫn bị giữ.
Chỉ đụng tới: tiến trình do `run.ts` / `public.ts` sinh ra (pid trong `.local/*.pid`) và file log trong `.local/`.
**Không** sửa code, `config.yaml`, `exams.yaml`; không chạm `bank/`, `results/`, `coach/`; không commit; không kill tiến trình lạ
(kể cả ngrok / node của app khác như trainer AWS cổng 3003).

## Kiểm tra (dùng ở mọi lệnh)

macOS (zsh/bash):

```bash
a=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/api/meta); b=$(curl -s -o /dev/null -w "%{http_code}" -H "ngrok-skip-browser-warning: 1" https://surreal-magnesium-mug.ngrok-free.dev/api/meta); echo "a=$a b=$b t=$(date +%H:%M)"; cat .local/public.json 2>/dev/null; ls .local/*.pid 2>/dev/null
```

Windows (PowerShell — dùng `curl.exe`, không phải alias `curl`):

```powershell
$a = curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3004/api/meta; $b = curl.exe -s -o NUL -w "%{http_code}" -H "ngrok-skip-browser-warning: 1" https://surreal-magnesium-mug.ngrok-free.dev/api/meta; "a=$a b=$b t=$(Get-Date -Format HH:mm)"; Get-Content .local\public.json -ErrorAction SilentlyContinue; Get-ChildItem .local\*.pid -ErrorAction SilentlyContinue
```

- **a=200** → app local chạy. `/api/meta` cho biết `supervised` (có supervisor → nút khởi động lại dùng được).
- **b=200** → tunnel công khai OK (`/api/meta` không cần mã truy cập). `000`/502/504 hoặc trang lỗi `ERR_NGROK_*` → tunnel chưa lên
  hoặc app chưa trả lời. Chế độ local thì b khác 200 là bình thường.
- `.local/public.json` = `{url, ok, checkedAt, error}` của watchdog: `checkedAt` cũ hơn ~3 × `check_seconds` → watchdog không chạy.

## start (local) · public

1. Đã chạy chưa: **Kiểm tra**. `a=200` (và với `public`: `b=200`) → báo URL, dừng. `a=200` nhưng cần `public` mà app đang chạy
   local → `stop` rồi làm tiếp (public.ts tự chạy app).
2. Cổng 3004 bị chiếm mà `a≠200` → tìm tiến trình (mục **stop**, bước 3); không phải app claude-cert → báo người dùng, không kill.
3. `node --version` ≥ 22.18. Chưa có `node_modules` (lần đầu trên máy) → `npm install` ở gốc repo.
   `npm install` chỉ đổi `package-lock.json` vì khác phiên bản npm → báo người dùng, không commit.
4. `public` → ngrok phải có: `ngrok version`. Thiếu → báo người dùng cài (macOS `brew install ngrok`; Windows
   `winget install ngrok.ngrok` hoặc `npm i -g ngrok`) rồi tự chạy `ngrok config add-authtoken <token>`; dừng. Không hỏi token trong chat.
5. Khởi động **tách khỏi phiên** (app phải sống sau khi phiên Claude kết thúc), log vào `.local/`:
   - macOS: `mkdir -p .local && nohup node scripts/run.ts > .local/launch.log 2>&1 &`
     (`public` → `scripts/public.ts`).
   - Windows: `New-Item -ItemType Directory -Force .local | Out-Null; Start-Process -FilePath node -ArgumentList 'scripts/run.ts' -WorkingDirectory (Get-Location) -WindowStyle Hidden -RedirectStandardOutput .local\launch.log -RedirectStandardError .local\launch.err.log`
     (`public` → `scripts/public.ts`).
6. Đợi tới khi `a=200` (mỗi ~10 giây, tối đa ~3 phút — lần đầu phải build giao diện); `public` → thêm `b=200` và `public.json`
   `ok: true` (tối đa thêm ~2 phút). Không lên → in 20 dòng cuối `launch.log` / `launch.err.log`, chẩn đoán theo **Sự cố**.

## stop

1. Lượt AI đang chạy? `curl -s http://127.0.0.1:3004/api/coach` → có `running` → hỏi người dùng: đợi xong hay huỷ
   (`curl -s -X POST -H "X-Cert: 1" http://127.0.0.1:3004/api/ai/jobs/<id>/cancel`). Dừng giữa chừng có thể để Claude ghi dở file bank.
2. Đọc các pid trong `.local/*.pid`. Với từng pid, xác nhận command line thuộc claude-cert trước khi dừng
   (macOS `ps -o command= -p <pid>`; Windows `Get-CimInstance Win32_Process -Filter "ProcessId=<pid>" | Select CommandLine`):
   chứa `scripts/public.ts`, `scripts/run.ts`, `server/index.ts` (đường dẫn trong thư mục repo này), hoặc `ngrok` với
   `--url=https://surreal-magnesium-mug.ngrok-free.dev` và cổng 3004. Pid chết / không khớp → bỏ qua (file pid cũ).
3. Dừng theo thứ tự supervisor trước (để nó không chạy lại server): `public.ts` → `run.ts` → `server/index.ts` → `ngrok`.
   macOS: `kill <pid>` (đợi 5 giây, còn sống → `kill -9 <pid>`). Windows: `taskkill /PID <pid> /T /F` (giết cả cây tiến trình).
4. Không có pid file mà cổng vẫn bị giữ → tìm theo cổng: macOS `lsof -nP -iTCP:3004 -sTCP:LISTEN`; Windows
   `Get-NetTCPConnection -LocalPort 3004 -State Listen | Select -Expand OwningProcess -Unique` → kiểm command line như bước 2.
5. Xác nhận: `a` không còn 200, không còn tiến trình nghe cổng 3004, không còn ngrok mang domain trên (của máy này).

## restart [public]

- Không có `public` và `/api/meta` báo `supervised: true` → `curl -s -X POST -H "X-Cert: 1" http://127.0.0.1:3004/api/system/restart`
  (supervisor khởi động lại server, build lại `dist/` nếu code giao diện đổi), đợi `a=200`. Kiểm lượt AI như **stop** bước 1 trước.
- Ngược lại (không supervised, đổi local ↔ public, hoặc watchdog/ngrok hỏng) → `stop` rồi `start` / `public`.

## status

**Kiểm tra**, rồi (không khởi động hay dừng gì): chế độ đang chạy (pid nào sống), `GET /api/system` (`bank.problems` số lỗi/cảnh báo,
`publicOk`), `GET /api/sync` (`dirty`, `ahead`, `behind`, `lastResult`), `GET /api/coach` (Claude Code có sẵn, lượt đang chạy, issue mở),
5 dòng cuối `launch.log`. Trả lời bằng bảng ngắn ✅ / ⚠️ / ❌.

## Mã truy cập (thiết bị ngoài: điện thoại, máy khác qua ngrok / LAN)

Lưu ở `.local/access-code` (tạo ở lần chạy đầu; biến môi trường `CERT_ACCESS_CODE` ghi đè), hiển thị ở trang
⚙️ **Hệ thống** khi mở app trên chính máy chạy app. Báo người dùng chỗ lấy mã; chỉ in nội dung mã khi người dùng yêu cầu rõ.
Nhập đúng mã một lần → cookie 180 ngày, toàn quyền như máy local. Đổi mã = xoá file rồi khởi động lại (mọi thiết bị phải nhập lại).

## Sự cố

| Dấu hiệu | Xử lý |
|----------|-------|
| Log/public.json có `ERR_NGROK_334` / "endpoint … is already online" | Domain đang bị giữ: thường là watchdog của app AWS trainer cũ (cùng domain) trên máy Windows, hoặc claude-cert `public` trên máy khác. Chỉ **một máy** được chạy public mỗi lúc. Máy này là máy Windows đó và có tiến trình `public.ps1` / `ngrok.exe` của trainer → báo người dùng rồi chạy `trainer\.local\public-stop.cmd`; máy khác → bảo người dùng dừng ở đó (`trainer\.local\public-stop.cmd`, hoặc `/cert-run stop` trên máy đó). Đợi ~1 phút rồi `restart public`. |
| `ERR_NGROK_4018` / authtoken | Người dùng chạy `ngrok config add-authtoken <token>`. |
| Lỗi `ERR_NGROK_*` khác (giới hạn phiên, domain không thuộc tài khoản) | Báo nguyên dòng lỗi; người dùng tự xử lý tài khoản ngrok. |
| `a=200` nhưng `b` = 502/504 hoặc `000` | Đợi một chu kỳ watchdog (`check_seconds` = 60); vẫn hỏng → `restart public`. |
| `b=200` nhưng trả HTML "You are about to visit" | Thiếu header `ngrok-skip-browser-warning: 1` trong lệnh kiểm tra — không phải lỗi app. |
| Cổng 3004 bị tiến trình lạ giữ | Báo người dùng (pid + command line), không kill. |
| Build `dist/` lỗi trong `launch.log` | In lỗi; không tự sửa code. Gợi ý `npm run build` ở gốc repo để xem chi tiết. |
| macOS: bấm đúp `start.command` không chạy | Gợi ý người dùng `chmod +x *.command` (và cho phép trong Privacy & Security nếu bị Gatekeeper chặn). |
| Node < 22.18 | Báo người dùng nâng cấp Node; không tự cài. |

## Báo cáo

Ngắn gọn (tiếng Việt): chế độ (local / public), trạng thái app / ngrok / watchdog, đã làm gì, URL local `http://127.0.0.1:3004`
và URL công khai (nếu public), chỗ lấy mã truy cập. Có lỗi → kèm 5 dòng cuối log liên quan.
