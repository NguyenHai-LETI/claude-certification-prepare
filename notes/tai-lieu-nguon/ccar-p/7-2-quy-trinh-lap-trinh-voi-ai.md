---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/7-2-quy-trinh-lap-trinh-voi-ai
ngay_tai: 2026-11-27
tieu_de: Cải thiện quy trình lập trình bằng công cụ AI
---

Domain 7: Developer Productivity & Operational Enablement · Task 7.2

# Cải thiện quy trình lập trình bằng công cụ AI

Đặt Claude Code đúng chỗ trong quy trình của đội, làm theo vòng khám phá, lập kế hoạch, làm, kiểm, đóng gói việc lặp lại, giữ người duyệt khi vào CI.

- 11 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Xác định bước nào AI giúp được, bước nào người phải giữ quyền quyết định
- Làm một phiên Claude Code theo thứ tự khám phá, lập kế hoạch, làm, kiểm, với đúng chế độ quyền
- Biến việc lặp lại thành CLAUDE.md, skill, subagent hoặc hook cho cả đội
- Đưa Claude Code vào pull request và CI mà người vẫn giữ quyền duyệt
- Giới hạn những gì Claude Code chạm được khi làm với hệ thống thật

Cài Claude Code cho cả đội chưa phải là cải thiện quy trình. Nếu mỗi người vẫn gõ lại quy ước dự án đầu mỗi phiên, vẫn phải rời trình soạn code để hỏi một con bot, hay bỏ qua review vì "AI viết rồi", thì công cụ chỉ thêm việc hoặc thêm rủi ro.

Bài này giúp bạn trả lời: dùng Claude Code và các công cụ AI thế nào để quy trình lập trình của đội nhanh hơn mà vẫn chắc chắn?

## Ví dụ xuyên suốt: phần mềm quản lý xưởng nội thất

Một công ty nội thất xuất khẩu có đội 15 lập trình viên làm phần mềm quản lý xưởng: đơn hàng, tồn kho gỗ, lịch máy. Trưởng nhóm muốn dùng Claude Code để sửa lỗi, viết tính năng, sinh tài liệu API và hỗ trợ review pull request. Phần mềm chạy trên một cơ sở dữ liệu production mà kế toán và xưởng dùng hằng ngày.

## Đặt AI vào đúng chỗ trong quy trình

Trước khi chạy thử, vẽ quy trình hiện tại và đánh dấu từng bước: AI giúp được gì, bước nào người phải giữ quyền quyết định. Song song là chuẩn bị hạ tầng: MCP server, luật quyền, subagent và `CLAUDE.md` ở project scope (bài 7.1).

| Bước | AI làm gì | Người giữ gì |
| --- | --- | --- |
| Đọc lỗi, tìm nguyên nhân | Tìm trong code, đề xuất chỗ sửa | Xác nhận nguyên nhân |
| Viết code, viết test | Viết theo kế hoạch đã duyệt | Duyệt kế hoạch trước khi viết |
| Review pull request | Đăng nhận xét có cấu trúc | Quyết định approve và merge |
| Migration cơ sở dữ liệu | Soạn và kiểm migration | Chạy trên production |

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi hai việc phải xong **trước khi** chạy thử quy trình có Claude Code. Chọn **xác định bước nào AI có giá trị và bước nào người phải giữ quyền**, và **cấu hình MCP server, luật quyền, subagent và ngữ cảnh dự án ở project scope**. Loại: viết tài liệu kèm runbook ca trực, xin ký duyệt của từng quản lý, chỉnh theo kết quả chạy thử. Việc cuối cần kết quả chạy thử nên đến sau.

Hai nguyên tắc nữa đề hay hỏi:

- **Đưa AI tới chỗ người ta đang làm việc.** Claude Code chạy ngay trong terminal hay trình soạn code thì lập trình viên không phải chuyển qua lại giữa các công cụ. Một con bot riêng trong ứng dụng chat buộc họ rời chỗ làm việc, thêm ma sát.
- **Không bỏ review vì code do AI viết.** Khung AI Fluency của Anthropic gọi năng lực chịu trách nhiệm cho thứ mình làm ra và đưa vào dùng là **Diligence**. Review là cơ chế kiểm duy nhất cho đầu ra của AI trong quy trình; bỏ đi là mất nó. Số dòng thay đổi cũng không đo được rủi ro: năm dòng sửa phần tính giá thành có thể nguy hiểm hơn hai trăm dòng sửa chữ trên giao diện.

> **Bẫy đề**
>
> Hai câu luyện thi về chỗ này. So hai đề xuất (Claude Code trong trình soạn code và một bot chat dùng chung): đúng là **bot chat buộc rời trình soạn code, thêm ma sát** và **Claude Code trong trình soạn code giảm chuyển ngữ cảnh**; sai là "bot chat tốt hơn vì có nhật ký tập trung" hay "hai cách như nhau vì cùng một model". Đề xuất bỏ review cho PR do AI viết dưới 50 dòng: phản đối đúng là **bỏ review là bỏ cơ chế kiểm đầu ra của AI** và **số dòng không đo được rủi ro**; sai là nâng ngưỡng lên 200 dòng, hay từ chối mọi PR do AI viết.

## Một phiên làm việc tốt: khám phá, lập kế hoạch, làm, kiểm

Docs Claude Code khuyên với việc không nhỏ thì đi theo thứ tự: **khám phá** (đọc code liên quan, chưa sửa gì), **lập kế hoạch**, **làm**, rồi **commit**. Chế độ lập kế hoạch (**plan mode**) cho Claude đọc và đề xuất mà không sửa file; bạn duyệt kế hoạch rồi mới cho làm. Phím Shift+Tab chuyển vòng giữa chế độ mặc định, accept edits và plan (cộng auto nếu tài khoản có):

| Chế độ | Claude làm gì không cần hỏi | Hợp với |
| --- | --- | --- |
| Mặc định (Manual) | Chỉ đọc; sửa file hay chạy lệnh đều hỏi | Việc lạ, khu vực nhạy cảm |
| Plan | Đọc và lập kế hoạch, chưa sửa file | Khám phá, thay đổi lớn cần duyệt trước |
| Accept edits | Đọc, sửa file, vài lệnh thao tác file thông dụng như `mkdir`, `mv` | Đã duyệt kế hoạch, đang làm |
| Auto | Mọi thứ, có bộ kiểm an toàn chạy nền chặn hành động rủi ro | Việc dài, bớt số lần phải bấm duyệt |

Trong phiên, ba thói quen giúp Claude làm đúng ngay:

- **Đưa đúng ngữ cảnh**: trỏ thẳng tới file bằng `@`, dán ảnh chụp lỗi, hoặc đưa log qua pipe thay vì mô tả lại.
- **Cho Claude cách tự kiểm**: docs nhấn mạnh hãy đưa Claude một thứ chạy được và trả về đạt hay không đạt (test, lệnh build, script so kết quả), và đòi bằng chứng là lệnh đã chạy cùng kết quả.
- **Đổi hướng sớm**: Esc để dừng, `/rewind` để quay về điểm trước khi sửa. Docs khuyên nếu đã sửa hướng hai lần mà vẫn sai thì `/clear` và viết lại prompt tốt hơn, thay vì kéo dài phiên. Việc tìm rộng trong codebase thì giao cho subagent Explore (chỉ đọc), để kết quả tìm không làm đầy ngữ cảnh chính.

Trong ví dụ, lỗi "tồn kho gỗ bị âm sau khi huỷ đơn" được xử lý thế này: plan mode để Claude đọc luồng huỷ đơn và đề xuất nguyên nhân; trưởng nhóm duyệt; Claude viết test tái hiện lỗi trước, chạy để thấy test đỏ, sửa, chạy lại để thấy xanh, rồi mới commit.

**Sơ đồ**
1. **Khám phá trong plan mode**: Claude đọc luồng huỷ đơn, đề xuất nguyên nhân
   ↓ _trưởng nhóm duyệt kế hoạch_
2. **Viết test tái hiện lỗi**: chạy lên, thấy đỏ
   ↓ _sửa code_
3. **Chạy lại test**: thấy xanh
   ↓ _có bằng chứng rồi mới_
4. **Commit**

## Biến việc lặp lại thành công cụ của đội

Khi cùng một việc lặp lại ở nhiều phiên và nhiều người, đóng gói nó một lần:

| Công cụ | Dùng khi | Trong ví dụ |
| --- | --- | --- |
| `CLAUDE.md` của repo | Quy ước, kiến trúc mà phiên nào cũng cần | Đơn vị đo gỗ là m³, mọi số tiền tính bằng đồng nguyên |
| Skill | Quy trình nhiều bước, chỉ nạp khi cần | Các bước phát hành bản mới |
| Subagent | Việc chuyên biệt lặp lại, cần prompt riêng, tool hẹp, model riêng | Review migration cơ sở dữ liệu |
| Hook | Việc **luôn** phải xảy ra, không trông vào việc Claude nhớ | Chạy formatter sau mỗi lần sửa file |

Subagent riêng chỉ đáng làm khi việc đó lặp lại qua nhiều phiên và cần một prompt tập trung, quyền tool hẹp, một model cụ thể. Docs Claude Code nói mỗi subagent chạy trong ngữ cảnh riêng, với system prompt, quyền tool riêng. File đặt ở `.claude/agents/` và commit để cả đội dùng:

```markdown
---
name: review-migration
description: Review migration cơ sở dữ liệu. Dùng khi có thay đổi trong db/migrations.
tools: Read, Grep, Glob
model: sonnet
---
Kiểm migration có khoá bảng lớn lâu không, có đường quay lại không,
có làm mất dữ liệu tồn kho không. Chỉ báo vấn đề, không sửa file.
```

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi tình huống nào đáng có một subagent riêng. Chọn **việc chuyên biệt lặp lại (như review schema cơ sở dữ liệu) cần system prompt tập trung, quyền tool hẹp và model riêng qua nhiều phiên**. Loại: câu hỏi một lần; đội không có việc chuyên biệt nào; muốn mọi tương tác dùng chung một prompt chung chung.

Hook khác `CLAUDE.md` ở chỗ nó chắc chắn chạy. Docs mô tả hook là lệnh shell Claude Code chạy ở những thời điểm cố định, để một việc luôn xảy ra thay vì trông vào việc model chọn làm. Ví dụ chạy Prettier sau mỗi lần Claude sửa file, đặt trong `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
      }
    ]
  }
}
```

Hook chạy **trước** khi tool chạy (`PreToolUse`) thì chặn được hành động: script thoát với mã 2 là Claude Code chặn lệnh đó.

## Đưa Claude Code vào pull request và CI

Claude Code GitHub Actions chạy Claude Code trong workflow của repo. Có hai cách dùng: nhắc `@claude` trong issue hay bình luận pull request để Claude làm theo yêu cầu, hoặc đưa sẵn một `prompt` để chạy tự động theo sự kiện, như mỗi khi có pull request mới. Lệnh `/install-github-app` trong Claude Code cài sẵn phần lớn các bước. Docs khuyên cấp cho workflow đúng những quyền nó cần, giới hạn số lượt bằng `--max-turns`, và **review thay đổi của Claude trước khi merge**.

Trong ví dụ, workflow review đăng nhận xét lên từng pull request; luật bảo vệ nhánh hiện có vẫn yêu cầu một người approve. Ngoài GitHub, script có thể gọi `claude -p` (chế độ không tương tác) để Claude làm một việc rồi in kết quả.

**Sơ đồ**
1. **Pull request mới**
   ↓ _Claude Code GitHub Actions chạy theo sự kiện_
2. **Claude đăng nhận xét có cấu trúc**
   ↓ _luật bảo vệ nhánh vẫn yêu cầu_
3. **Một người approve**
   ↓ _rồi mới_
4. **Merge**

> **Bẫy đề**
>
> Câu luyện thi: đội muốn AI hỗ trợ review mà không bỏ người duyệt. Đúng: **Claude Code review rồi đăng phân tích có cấu trúc thành bình luận, người review vẫn quyết định approve theo luật bảo vệ nhánh hiện có**. Sai: Claude tự merge sau khi phân tích; tắt luật bảo vệ nhánh cho nhanh; âm thầm xoá PR chất lượng thấp.

Sinh tài liệu cũng theo tinh thần đó. Câu luyện thi về tài liệu bám sát code chấm đúng cách: **subagent đọc file code liên quan bằng tool đọc file và tìm code, viết tài liệu, rồi đẩy thay đổi qua quy trình review bình thường của đội**. Sai là viết từ trí nhớ của model mà không đọc code, hay đăng thẳng lên trang công khai không qua duyệt.

## Khi Claude Code chạm hệ thống thật

Docs Claude Code nói Claude tạo điểm lưu (checkpoint) trước khi sửa file, nên sửa sai trong repo thì quay lại được. Nhưng hành động trên hệ thống bên ngoài, như ghi vào cơ sở dữ liệu, gửi tin hay deploy, thì checkpoint không lấy lại được. Vì vậy với cơ sở dữ liệu production, dùng nhiều lớp:

1. MCP server cơ sở dữ liệu dùng **tài khoản chỉ đọc** theo mặc định.
2. Subagent làm việc với dữ liệu chỉ có **tool đọc**.
3. Mọi thao tác sửa dữ liệu phải có **người xác nhận rõ ràng**.

**Sơ đồ**
1. **Subagent làm việc với dữ liệu**: chỉ có tool đọc
   ↓ _gọi qua_
2. **MCP server cơ sở dữ liệu**: tài khoản chỉ đọc theo mặc định
   ↓ _muốn sửa dữ liệu thì người phải xác nhận rõ ràng_
3. **Cơ sở dữ liệu production**

> **Bẫy đề**
>
> Câu luyện thi về Claude Code chạy với cơ sở dữ liệu production. Đúng là **ba lớp ở trên cùng lúc**. Sai: cho ghi thẳng không giới hạn; dùng tài khoản toàn quyền và không cần xác nhận; tắt log và kiểm toán để bớt báo động.

> **Ý chính**
>
> Vẽ rõ bước nào AI làm, bước nào người quyết trước khi chạy thử. Làm việc theo khám phá, lập kế hoạch, làm, kiểm, và cho Claude một cách tự kiểm. Việc lặp lại thì đóng gói thành `CLAUDE.md`, skill, subagent hay hook; vào CI thì người vẫn giữ quyền duyệt; chạm hệ thống thật thì chỉ đọc là mặc định.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 7](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Best practices for Claude Code (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
3. [How Claude Code works (Claude Code Docs)](https://code.claude.com/docs/en/how-claude-code-works)
4. [Choose a permission mode (Claude Code Docs)](https://code.claude.com/docs/en/permission-modes)
5. [Create custom subagents (Claude Code Docs)](https://code.claude.com/docs/en/sub-agents)
6. [Automate actions with hooks (Claude Code Docs)](https://code.claude.com/docs/en/hooks-guide)
7. [Claude Code GitHub Actions (Claude Code Docs)](https://code.claude.com/docs/en/github-actions)
8. [AI Fluency, Framework and Foundations (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
