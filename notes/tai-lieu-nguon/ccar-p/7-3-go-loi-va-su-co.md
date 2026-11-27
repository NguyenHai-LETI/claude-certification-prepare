---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/7-3-go-loi-va-su-co
ngay_tai: 2026-11-27
tieu_de: Gỡ lỗi và xử lý sự cố vận hành Claude Code
---

Domain 7: Developer Productivity & Operational Enablement · Task 7.3

# Gỡ lỗi và xử lý sự cố vận hành Claude Code

Gỡ lỗi Claude Code từ triệu chứng, kiểm cái gì đã nạp, xử lý ba trạng thái hỏng của MCP server, khoanh vùng bằng chế độ an toàn, và biết lỗi nào tự thử lại.

- 11 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Bắt đầu từ triệu chứng và kiểm cái gì thật sự đã nạp bằng các lệnh có sẵn
- Nhận ra các lỗi cấu hình hay gặp khiến hook, skill, luật quyền im lặng không chạy
- Xử lý MCP server không hiện, không khởi động hay không có tool, và ngữ cảnh bị định nghĩa tool chiếm
- Khoanh vùng nguyên nhân bằng ca tái hiện tối giản, chế độ an toàn và cấu hình sạch
- Biết lỗi nào Claude Code tự thử lại, lỗi nào cần người xử lý

"Claude không làm theo CLAUDE.md", "MCP server của tôi biến mất", "phiên mới mở đã hết một phần tư ngữ cảnh". Phần lớn những sự cố kiểu này không phải lỗi của Claude Code, mà là một file không được nạp, nạp từ chỗ khác, hoặc bị file khác ghi đè.

Bài này giúp bạn trả lời: khi Claude Code của đội chạy không như cấu hình, tìm nguyên nhân theo thứ tự nào, và xử lý những sự cố hay gặp ra sao?

## Ví dụ xuyên suốt: đội nền tảng của ứng dụng đặt sân thể thao

Bạn ở đội nền tảng, hỗ trợ 60 lập trình viên của một ứng dụng đặt sân bóng đá mini và cầu lông. Tuần này có năm phiếu hỗ trợ:

1. Hook chạy formatter sau mỗi lần sửa file không bao giờ chạy.
2. MCP server tra lịch sân vừa thêm vào repo không hiện trong phiên.
3. Mở phiên mới, chưa gõ gì đã thấy khoảng 50.000 token ngữ cảnh bị chiếm.
4. Một lập trình viên bị từ chối quyền khi chạy lệnh mà họ nghĩ được phép.
5. Job chạy Claude Code ban đêm thỉnh thoảng báo lỗi quá tải rồi dừng.

## Bắt đầu từ triệu chứng: kiểm cái gì đã nạp

Docs gỡ lỗi cấu hình của Claude Code nói khi một cấu hình không có tác dụng, nguyên nhân thường là file không được nạp, nạp từ chỗ khác chỗ bạn nghĩ, hoặc bị file khác ghi đè. Vì vậy, trước khi sửa gì, hãy xem Claude Code thật sự đã nạp gì:

| Lệnh | Cho biết |
| --- | --- |
| `/context` | Mọi thứ đang chiếm ngữ cảnh, chia theo loại: system prompt, tool, tool MCP, subagent, file memory, skill, hội thoại. Chạy lệnh này trước |
| `/memory` | Các file `CLAUDE.md` và memory đang dùng |
| `/skills`, `/hooks`, `/mcp` | Skill có sẵn, hook đang đăng ký, MCP server và trạng thái |
| `/permissions` | Các luật allow, deny đang có hiệu lực sau khi gộp |
| `/status` | Các nguồn cấu hình đang dùng, kể cả có managed settings hay không |
| `/doctor`, `claude doctor` | Kiểm tổng quát: file cấu hình lỗi, cài đặt, đề xuất sửa |
| `claude --debug` | Ghi log chi tiết, như hook nào được xét, thoát với mã gì |

Nếu `/context` cho thấy `CLAUDE.md` đã nạp mà Claude vẫn không làm theo, vấn đề thường nằm ở cách viết: câu mơ hồ, hai file mâu thuẫn, hoặc file quá dài. Docs cũng nhắc: thứ gì **nhất định không được xảy ra** thì dùng luật quyền hoặc hook, không dùng `CLAUDE.md`.

Phiếu số 4 đi đúng đường này: chạy `/permissions` để xem luật nào đang từ chối lệnh, và `/status` để xem có managed settings không. Hoá ra công ty vừa thêm một luật deny ở managed. Lúc đó câu hỏi là luật đó nên sửa hay nên giữ, chứ không phải tìm cách vòng qua.

> **Bẫy đề**
>
> Câu luyện thi: lập trình viên bị từ chối quyền ngoài dự kiến. Đúng: **xem các luật đang có hiệu lực ở mọi scope (managed, dòng lệnh, local, project, user) để tìm luật nào đang từ chối, rồi xác định nên sửa hay giữ**. Sai: bảo họ thử lại y nguyên nhiều lần; tắt cả hệ thống quyền; cấp Bash không giới hạn cho người đó.

## Những lỗi cấu hình làm mọi thứ im lặng

Docs có một bảng các nguyên nhân hay gặp. Vài dòng đáng nhớ nhất:

| Triệu chứng | Nguyên nhân | Sửa |
| --- | --- | --- |
| Hook không bao giờ chạy | `matcher` viết thường, như `"edit"`. Tên tool phân biệt hoa thường | Viết `"Edit\|Write"`, `"Bash"` |
| Hook không bao giờ chạy | `matcher` là một mảng JSON thay vì một chuỗi | Dùng một chuỗi, nối tên tool bằng `\|` |
| Giá trị trong `settings.json` như bị bỏ qua | Cùng khoá đó có trong `settings.local.json` | File local ghi đè file project |
| MCP server khai trong `settings.json` không hiện | `settings.json` không đọc khoá `mcpServers` | Khai trong `.mcp.json` ở gốc repo |
| Skill không hiện trong `/skills` | File đặt thẳng `.claude/skills/ten.md` | Dùng thư mục: `.claude/skills/ten/SKILL.md` |
| Subagent Explore, Plan không theo `CLAUDE.md` | Hai subagent có sẵn này bỏ qua `CLAUDE.md` khi khởi động | Nhắc lại chỉ dẫn trong prompt giao việc |
| Deny `Bash(rm *)` không chặn `/bin/rm` | Luật Bash so chuỗi lệnh, không so chương trình thật | Dùng hook `PreToolUse` hoặc sandbox |

Phiếu số 1 là dòng đầu: hook viết `"matcher": "edit|write"`. Sửa thành `"Edit|Write"` là chạy. Docs giải thích vì sao lỗi này khó thấy: tên tool sai thì matcher không khớp gì, và hook lặng lẽ không chạy.

## Ba trạng thái hỏng của MCP server

Lệnh `/mcp` trong phiên, hay `claude mcp list` ngoài terminal, cho biết từng server và trạng thái của nó. Docs nêu ba trường hợp server khai đúng mà vẫn không có tool:

| Trạng thái | Nguyên nhân thường gặp | Sửa |
| --- | --- | --- |
| Bị tắt, chờ duyệt | Server project trong `.mcp.json` cần duyệt một lần; người dùng đã bỏ qua lời hỏi | Duyệt trong `/mcp` |
| Không khởi động được | `command` hoặc `args` dùng đường dẫn tương đối, bị hiểu theo thư mục mở Claude Code chứ không theo chỗ đặt `.mcp.json` | Dùng đường dẫn tuyệt đối |
| Đã kết nối nhưng 0 tool | Server chạy mà không trả danh sách tool | Chọn Reconnect trong `/mcp`; vẫn 0 thì chạy `claude --debug=mcp`, đọc stderr của server trong log |

Phiếu số 2 là trường hợp đầu: lập trình viên kéo code về, bấm bỏ qua lời hỏi duyệt server mới.

> **Trong đề chọn gì**
>
> Câu luyện thi: MCP server vừa thêm không hiện trong phiên. Bước đầu tiên là **kiểm server đã đăng ký chưa bằng lệnh liệt kê, rồi kết nối lại phiên nếu cần**. Sai: tắt mọi MCP server để khoanh vùng; chuyển sang sản phẩm khác; cài lại hệ điều hành.

> **Bẫy đề**
>
> Câu luyện thi khác: MCP server hỏng ở lần chạy đầu, các lần sau chạy bình thường, và lần đầu có hộp thoại xin quyền của hệ điều hành. Đúng là **nhận ra việc cấp quyền lần đầu là nguyên nhân, ghi vào tài liệu hướng dẫn cho người mới, và xác nhận các lần sau chạy được**. Sai: cài lại hệ điều hành; tắt hẳn hộp thoại xin quyền; coi là hỏng vĩnh viễn rồi thay server.

Phiếu số 3 cũng liên quan tới MCP. Mỗi MCP server đóng góp định nghĩa tool vào ngữ cảnh. Claude Code hiện bật **tool search** mặc định: định nghĩa tool MCP không nạp hết từ đầu mà được tìm khi cần. Docs nêu các cấu hình không có tool search, trong đó có khi biến môi trường `ENABLE_TOOL_SEARCH=false`. Trong ví dụ, đội có 9 MCP server và một file cấu hình môi trường chung đặt biến đó thành `false` từ hồi thử nghiệm, nên mọi định nghĩa nạp ngay. `/context` cho thấy phần "MCP tools" chiếm phần lớn số token. Bỏ biến đó đi là xong.

> **Trong đề chọn gì**
>
> Hai câu luyện thi mô tả phiên Claude Code nạp 60 tool MCP trở lên, hoặc subagent chiếm 50.000 token trước khi gõ gì, và nói tool search chưa bật. Nguyên nhân: **nhiều MCP server, mỗi server đóng góp định nghĩa tool, tool search chưa bật nên nạp hết từ đầu**. Cách sửa giữ nguyên khả năng: **bật Tool Search để định nghĩa tool được nạp khi cần**. Sai: tắt hết MCP server, thêm server, viết prompt dài hơn, đổ cho bàn phím hay font chữ.

## Khoanh vùng: tái hiện tối giản, chế độ an toàn, cấu hình sạch

Khi chưa rõ nguyên nhân, đừng đổi nhiều thứ cùng lúc. Dựng một ca tái hiện nhỏ nhất, mỗi lần chỉ đổi một yếu tố. Docs Claude Code cho hai công cụ để loại trừ nhanh:

1. **`claude --safe-mode`**: mở phiên với các tuỳ biến bị tắt, gồm `CLAUDE.md`, skill, plugin, hook, MCP server, lệnh và agent tự tạo. Đăng nhập, model, tool có sẵn và luật quyền vẫn chạy bình thường. Managed settings của tổ chức vẫn áp dụng. Lỗi biến mất thì nguyên nhân nằm trong những thứ vừa tắt.
2. **Cấu hình sạch**: đặt `CLAUDE_CONFIG_DIR` trỏ tới một thư mục mới thay cho `~/.claude`, và chạy `claude --setting-sources user` để bỏ cấu hình project. Lỗi biến mất thì chép dần từng file cấu hình cũ vào cho tới khi lỗi quay lại.

```bash
claude --safe-mode
CLAUDE_CONFIG_DIR=~/claude-clean/config claude --setting-sources user
```

1. **Lỗi biến mất trong --safe-mode?** → Kiểm từng thứ đã tắt: CLAUDE.md, hook, MCP, skill
2. **Lỗi biến mất với cấu hình sạch?** → Chép dần cấu hình user, project vào cho tới khi lỗi quay lại
3. **Vẫn còn lỗi với cấu hình sạch?** → Xem /status (managed settings), biến môi trường, rồi trang Troubleshooting
- **Còn lại** → Ghi lại ca tái hiện tối giản trước khi báo lên hỗ trợ

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi hai việc nên có trong bộ công cụ chẩn đoán Claude Code. Chọn **tái hiện bằng ca tối giản, mỗi lần chỉ đổi một yếu tố**, và **liệt kê các MCP server đã cấu hình, xem trạng thái để tìm lỗi kết nối**. Loại: tăng temperature cho lỗi hiện ra nhiều hơn; gửi phiếu cho nhà cung cấp trước khi tự tái hiện; lập tức quay về phiên bản Claude Code cũ.

## Lỗi khi đang chạy: cái gì tự thử lại, cái gì không

Phiếu số 5 là lỗi lúc chạy, không phải lỗi cấu hình. Docs về lỗi của Claude Code nói nó tự thử lại các lỗi tạm thời tối đa 10 lần, khoảng cách tăng dần, trước khi báo lỗi: lỗi máy chủ, quá tải, hết thời gian chờ trước khi có nội dung trả về, và lỗi 429 do bị giới hạn tốc độ tạm thời. Số lần đổi được bằng `CLAUDE_CODE_MAX_RETRIES`.

**Sơ đồ**
1. **Yêu cầu bị lỗi**
   ↓ _lỗi có tạm thời không?_
2. **Tạm thời**: 529, 500, 429 do giới hạn tốc độ **|** **Không tạm thời**: chạm hạn mức chi tiêu, lỗi chứng chỉ TLS
   ↓ _Claude Code làm gì_
3. **Tự thử lại tối đa 10 lần, khoảng cách tăng dần** **|** **Thử lại không giúp gì**: đổi ngân sách hoặc gói, kiểm proxy và mạng

| Lỗi | Tự thử lại? | Bạn làm gì |
| --- | --- | --- |
| Quá tải (529), lỗi máy chủ (500) | Có | Chờ vài phút, xem `status.claude.com`; với 529 có thể đổi model bằng `/model` vì dung lượng tính theo từng model |
| 429 do giới hạn tốc độ tạm thời | Có | Thường không cần làm gì |
| 429 do chạm hạn mức chi tiêu | Không phải lỗi tạm | Đổi ngân sách hoặc gói, thử lại không giúp gì |
| Ngữ cảnh quá dài | Thử lại với đầu ra ngắn hơn | `/compact` để tóm tắt hoặc `/clear` để bắt đầu lại |
| Lỗi chứng chỉ TLS | Không | Báo ngay ở lần đầu; kiểm proxy, mạng |

Một thông báo khác hay gặp ở phiên dài là **Autocompact is thrashing**. Nó nghĩa là việc nén ngữ cảnh đã thành công nhưng một file hay đầu ra tool lại lấp đầy cửa sổ ngay, nhiều lần liền, nên Claude Code dừng thử lại để khỏi tốn lượt gọi API vô ích. Cách gỡ: bảo Claude đọc file lớn theo từng đoạn (một khoảng dòng, một hàm), hoặc chạy `/compact` kèm hướng dẫn bỏ phần đầu ra lớn, hoặc giao việc đó cho subagent để nó chạy trong cửa sổ ngữ cảnh riêng. Chỉ `/clear` khi không cần hội thoại cũ nữa.

Với job chạy ban đêm, docs có biến `CLAUDE_CODE_RETRY_WATCHDOG=1` cho các lần chạy không có người canh: lỗi 429 và 529 được thử lại không giới hạn. Trong ví dụ, đội nền tảng bật biến này cho job đêm và thêm cảnh báo khi một job chạy quá lâu, thay vì tăng số lần thử cho mọi người.

Bốn phiếu cấu hình và lệnh đã chỉ ra nguyên nhân:

**Sơ đồ**
1. **Phiếu 1**: hook không chạy **|** **Phiếu 2**: MCP server không hiện **|** **Phiếu 3**: 50.000 token đã bị chiếm **|** **Phiếu 4**: bị từ chối quyền
   ↓ _chạy lệnh tương ứng_
2. **/hooks, --debug**: matcher viết thường **|** **/mcp**: server đang chờ duyệt **|** **/context**: phần MCP tools chiếm nhiều **|** **/permissions, /status**: luật deny ở managed

> **Ý chính**
>
> Gỡ lỗi Claude Code bắt đầu bằng câu hỏi "cái gì đã nạp": `/context`, rồi `/permissions`, `/hooks`, `/mcp`, `/status`. Nhớ các lỗi cấu hình làm mọi thứ im lặng và ba trạng thái hỏng của MCP server. Chưa rõ thì tái hiện tối giản, dùng `--safe-mode` và cấu hình sạch, đổi mỗi lần một thứ.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 7](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Debug your configuration (Claude Code Docs)](https://code.claude.com/docs/en/debug-your-config)
3. [Connect Claude Code to tools via MCP (Claude Code Docs)](https://code.claude.com/docs/en/mcp)
4. [Error reference (Claude Code Docs)](https://code.claude.com/docs/en/errors)
5. [Configure permissions (Claude Code Docs)](https://code.claude.com/docs/en/permissions)
6. [Claude Code settings (Claude Code Docs)](https://code.claude.com/docs/en/settings)
7. [Troubleshooting (Claude Code Docs)](https://code.claude.com/docs/en/troubleshooting)
