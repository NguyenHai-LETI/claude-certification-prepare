---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/3-1-van-hanh-claude-code
ngay_tai: 2026-11-27
tieu_de: Vận hành Claude Code - thành phần, phiên, headless, auto mode
---

Domain 3: Claude Code · Task 3.1

# Vận hành Claude Code - thành phần, phiên, headless, auto mode

Các thành phần của Claude Code (rule, skill, command, agent, memory), khởi tạo repo bằng /init, quản lý phiên, chạy headless trong CI và chọn chế độ quyền.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 11 nguồn

## Đọc xong bạn nắm được

- Biết mỗi thành phần của Claude Code (rule, skill, command, subagent, auto memory) dùng cho việc gì và nằm ở đâu
- Khởi tạo một repo cho Claude Code với /init, CLAUDE.md và .claude/settings.json cấp dự án
- Tiếp tục, chọn lại và dọn phiên làm việc bằng lệnh có sẵn
- Chạy Claude Code không tương tác trong CI, lấy đầu ra JSON hoặc stream, và cấp quyền đúng mức
- Chọn chế độ quyền phù hợp, kể cả auto mode

Claude Code có khá nhiều "ngăn kéo": `CLAUDE.md`, rule, skill, command, subagent, memory, hook, settings. Đề thi hỏi bạn có biết thứ nào để làm gì, và có chạy được Claude Code ngoài terminal tương tác, như trong pipeline CI, không.

Bài này giúp bạn trả lời: dựng một repo cho Claude Code thế nào, mỗi thành phần dùng khi nào, và chạy Claude Code tự động ra sao?

## Ví dụ xuyên suốt: studio thiết kế web nhận dự án mới

Một studio thiết kế web 12 người làm website cho khách, mỗi khách một repo. Tuần này studio nhận dự án mới và muốn:

1. Ai mở repo bằng Claude Code cũng có cùng quy ước: dùng pnpm, component đặt trong `src/components`, không sửa file trong `public/legacy`.
2. Có lệnh `/bao-cao-tuan` để Claude tóm tắt các thay đổi trong tuần gửi khách.
3. Mỗi đêm một job CI cho Claude Code cập nhật thư viện phụ thuộc, chạy test và ghi kết quả ra file JSON.

## Các thành phần và chỗ của chúng

Đề thi liệt kê các thành phần cốt lõi (**core components**) của Claude Code:

| Thành phần | Là gì | Nằm ở |
| --- | --- | --- |
| `CLAUDE.md` | Chỉ dẫn nạp vào mọi phiên | Gốc repo, `~/.claude/`, tầng managed (bài 2.6) |
| **Rules** | Chỉ dẫn chia theo chủ đề, có thể chỉ áp cho một số đường dẫn file | `.claude/rules/*.md`, giới hạn bằng `paths:` trong frontmatter |
| **Skills** | Hướng dẫn, kiến thức, quy trình mà Claude dùng khi phù hợp, hoặc bạn gọi bằng `/ten-skill` | `.claude/skills/<ten>/SKILL.md` |
| **Commands** | Lệnh do bạn tự tạo; nay đã gộp vào skill | `.claude/commands/<ten>.md` vẫn chạy, tạo ra `/ten` như skill |
| **Agents** (subagent) | Ngữ cảnh làm việc riêng, trả về bản tóm tắt | `.claude/agents/*.md` |
| **Agent memory** | Auto memory: Claude tự ghi những gì học được về dự án | `~/.claude/projects/<project>/memory/`, có file chỉ mục `MEMORY.md` |

Vài điểm đề hay hỏi:

- **Auto memory khác `CLAUDE.md`**: `CLAUDE.md` do bạn viết (chỉ dẫn, quy tắc); auto memory do Claude viết (điều học được, những lần bạn sửa nó). Phần đầu của `MEMORY.md` (200 dòng hoặc 25KB đầu) được nạp vào mọi phiên. Tắt bằng `autoMemoryEnabled: false` hoặc biến `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`. Subagent cũng có thể có bộ nhớ riêng qua trường `memory`.
- **Cả hai đều chỉ là ngữ cảnh**: docs nói Claude coi chúng là ngữ cảnh, không phải cấu hình bắt buộc. Việc nhất định phải chặn thì dùng hook `PreToolUse` hoặc luật quyền.
- **Chọn thành phần theo dấu hiệu**: docs gợi ý Claude làm sai một quy ước hai lần thì thêm vào `CLAUDE.md`; bạn gõ lại cùng một prompt nhiều lần thì lưu thành skill; một việc phụ làm ngập hội thoại bằng output không dùng lại thì chuyển cho subagent; muốn một việc xảy ra mọi lần mà không phải nhắc thì viết hook.

1. **Claude làm sai một quy ước hai lần?** → Thêm vào CLAUDE.md
2. **Bạn gõ lại cùng một prompt nhiều lần?** → Lưu thành skill
3. **Việc phụ làm ngập hội thoại bằng output không dùng lại?** → Chuyển cho subagent
4. **Việc phải xảy ra mọi lần, không cần nhắc?** → Viết hook
- **Còn lại** → Việc nhất định phải chặn: hook PreToolUse hoặc luật quyền, đừng chỉ ghi trong CLAUDE.md

Trong ví dụ, `/bao-cao-tuan` là một skill ở `.claude/skills/bao-cao-tuan/SKILL.md`. Luật "không sửa `public/legacy`" thì không nên chỉ ghi trong `CLAUDE.md`: đặt luật deny trong settings hoặc hook để nó được thực thi chắc chắn.

## Khởi tạo repo: /init, CLAUDE.md và settings.json

Lệnh `/init` khởi tạo dự án với một file `CLAUDE.md` hướng dẫn (đặt `CLAUDE_CODE_NEW_INIT=1` để có quy trình hỏi đáp, đi qua cả skill, hook và memory cá nhân). Sau đó đội bổ sung quy ước riêng và commit file này để mọi người dùng chung.

Quyền, model mặc định, biến môi trường và hook cho cả đội đặt trong `.claude/settings.json` cấp dự án và commit vào repo; ngoại lệ riêng của từng người để trong `.claude/settings.local.json`.

```json
{
  "permissions": {
    "allow": ["Bash(pnpm test *)", "Bash(pnpm lint *)"],
    "deny": ["Edit(./public/legacy/**)"]
  }
}
```

> **Trong đề chọn gì**
>
> Hai câu luyện thi về khởi tạo. Chuẩn quy ước, thư viện ưa dùng và ngữ cảnh dự án cho mọi lập trình viên: chọn **khởi tạo Claude Code trong repo và ghi vào `CLAUDE.md` ở gốc repo**, không phải wiki riêng, biến môi trường từng máy hay README. Quyền, model mặc định, hành vi theo môi trường cho cả đội: chọn **`settings.json` cấp dự án**, không phải bảng tính chung, biến môi trường từng máy hay system prompt dán đầu mỗi phiên.

## Quản lý phiên

Claude Code lưu phiên liên tục vào file transcript, nên bạn quay lại được sau khi thoát hay sau `/clear`:

| Lệnh | Tác dụng |
| --- | --- |
| `claude --continue` | Mở lại phiên gần nhất trong thư mục hiện tại |
| `claude --resume` | Mở danh sách phiên để chọn; `--resume <tên>` vào thẳng phiên đó |
| `/resume` | Chuyển sang phiên khác ngay trong phiên đang mở |
| `/clear` | Bắt đầu hội thoại mới; phiên cũ vẫn được lưu |
| `/compact` | Tóm tắt hội thoại để giải phóng context |

Khi mở lại phiên (`--continue`, `--resume` hoặc `/resume`), phiên giữ **model** nó đang dùng lúc lưu transcript. Nếu model đó đã bị ngừng (retire) hoặc bị `availableModels` loại, Claude Code không báo lỗi mà quay về thứ tự chọn model thông thường (`--model`, biến `ANTHROPIC_MODEL`, setting `model`). Một model chọn bằng `--model` hay `ANTHROPIC_MODEL` ở lần mở mới vẫn được ưu tiên hơn model khôi phục. Trên Amazon Bedrock, Google Cloud và Microsoft Foundry thì model trong transcript không được khôi phục, phiên chọn model theo thứ tự thông thường.

Ngoài các lệnh có sẵn (**built-in slash commands**) như `/init`, `/clear`, `/compact`, `/context`, `/model`, `/permissions`, `/memory`, bạn tạo lệnh riêng (**custom slash commands**) bằng skill như `/bao-cao-tuan` ở trên.

## Chạy không tương tác: headless và streaming

Đề thi gọi đây là chế độ **headless** và **streaming mode**. Thêm `-p` (hay `--print`) để Claude Code chạy một lần không tương tác:

```bash
claude -p "Cập nhật thư viện phụ thuộc và chạy test" \
  --output-format json --allowedTools "Bash,Read,Edit" > ket-qua.json
```

| Tuỳ chọn | Tác dụng |
| --- | --- |
| `--output-format text` | Mặc định, chỉ chữ |
| `--output-format json` | Một khối JSON có kết quả, session ID, chi phí (`total_cost_usd`) |
| `--output-format stream-json` | Mỗi dòng một sự kiện JSON, theo thời gian thực (kèm `--verbose`) |
| `--json-schema` | Đi với `json` để đầu ra theo đúng schema |
| `--allowedTools` | Tool được dùng không cần hỏi |
| `--permission-mode` | Chế độ quyền cho cả phiên |
| `--continue`, `--resume` | Nối tiếp hội thoại giữa các lần chạy `-p` |
| `--bare` | Bỏ qua việc tự tìm hook, skill, plugin, MCP, auto memory, `CLAUDE.md`; docs khuyên dùng cho script và có thể thành mặc định của `-p` sau này |

Docs lưu ý: không có `--bare`, một lần chạy `-p` vẫn chạy hook trong `.claude/settings.json` và kết nối MCP server trong `.mcp.json` của repo, kể cả ở thư mục bạn chưa từng tin cậy, mà không hỏi gì.

> **Bẫy đề**
>
> Câu luyện thi: chạy Claude Code trong pipeline CI, làm các việc đã rõ mà không hỏi xác nhận, và lấy đầu ra cho bước sau. Đúng là **chạy headless, khai sẵn quyền cần thiết trong `settings.json`, và lấy đầu ra cho bước sau**. Sai: tắt mọi lời hỏi xác nhận ở mọi môi trường; chạy tương tác và để người duyệt từng bước; thay Claude Code bằng công cụ khác.

## Chế độ quyền, kể cả auto mode

Chế độ quyền quyết định Claude được làm gì mà không hỏi:

| Chế độ | Chạy không hỏi | Hợp với |
| --- | --- | --- |
| `default` (Manual) | Chỉ đọc | Việc nhạy cảm, code lạ |
| `acceptEdits` | Đọc, sửa file, lệnh file thông dụng (`mkdir`, `mv`, `cp`…) | Sửa code bạn đang xem lại |
| `plan` | Đọc và lập kế hoạch, chưa sửa | Tìm hiểu trước khi sửa |
| `auto` | Mọi thứ, có một model phân loại chạy nền kiểm từng hành động | Việc dài, đỡ phải duyệt liên tục |
| `dontAsk` | Chỉ những gì đã cho phép trước; còn lại bị từ chối | CI khoá chặt |
| `bypassPermissions` | Mọi thứ, không kiểm | Chỉ container hay máy ảo cô lập |

Với job đêm của studio, `dontAsk` cùng danh sách allow cụ thể là lựa chọn chặt nhất: lệnh nào chưa được phép thì bị từ chối thay vì treo chờ người duyệt. Nếu việc phức tạp hơn, `--permission-mode auto` để model phân loại kiểm từng hành động, kèm `--permission-prompts none` để không có gì chờ người trả lời.

**Sơ đồ**
1. **Job CI mỗi đêm**
   ↓ _claude -p, chế độ dontAsk, danh sách allow cụ thể_
2. **Claude Code**: cập nhật thư viện phụ thuộc, chạy test
   ↓ _--output-format json_
3. **ket-qua.json**: bước sau trong pipeline đọc

> **Ý chính**
>
> `CLAUDE.md` và rule cho chỉ dẫn, skill cho quy trình lặp lại (command đã gộp vào skill), subagent cho việc cần ngữ cảnh riêng, auto memory do Claude tự ghi. Khởi tạo repo bằng `/init` và commit `CLAUDE.md`, `.claude/settings.json`. Trong CI, chạy `claude -p` với quyền khai sẵn và đầu ra JSON.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Extend Claude Code - features overview (Claude Code Docs)](https://code.claude.com/docs/en/features-overview)
3. [How Claude remembers your project (Claude Code Docs)](https://code.claude.com/docs/en/memory)
4. [Extend Claude with skills (Claude Code Docs)](https://code.claude.com/docs/en/skills)
5. [Create custom subagents (Claude Code Docs)](https://code.claude.com/docs/en/sub-agents)
6. [Commands (Claude Code Docs)](https://code.claude.com/docs/en/commands)
7. [Manage sessions (Claude Code Docs)](https://code.claude.com/docs/en/sessions)
8. [Run Claude Code programmatically (Claude Code Docs)](https://code.claude.com/docs/en/headless)
9. [Permission modes (Claude Code Docs)](https://code.claude.com/docs/en/permission-modes)
10. [Settings files and precedence (Claude Code Docs)](https://code.claude.com/docs/en/settings)
11. [Model configuration (Claude Code Docs)](https://code.claude.com/docs/en/model-config)
