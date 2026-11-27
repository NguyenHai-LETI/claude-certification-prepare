---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/7-3-hook-chan-hanh-dong-nguy-hiem
ngay_tai: 2026-11-27
tieu_de: Hook của Claude - chặn hành động phá huỷ một cách tất định
---

Domain 7: Security and Safety · Task 7.3

# Hook của Claude - chặn hành động phá huỷ một cách tất định

Hook làm guardrail tất định - sự kiện nào chặn được hành động, nhắm hook bằng matcher và if, các loại handler, đặt cấu hình ở đâu, chỉ gắn cho việc rủi ro.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Biết hook chạy ở những thời điểm nào, và sự kiện nào chặn được hành động, sự kiện nào chỉ quan sát
- Nhắm hook đúng tool và đúng lệnh bằng matcher và điều kiện if
- Chọn loại handler và nơi đặt cấu hình cho một hook guardrail
- Chỉ gắn hook cho hành động rủi ro cao để giữ an toàn mà không làm chậm agent

"Cẩn thận với database" trong system prompt không ngăn được một câu `DROP TABLE`. Model làm theo phần lớn thời gian, nhưng "phần lớn" không đủ với hành động không lấy lại được. Hook là cách đặt một lớp kiểm bằng code chạy mọi lần, nằm ngoài model.

Bài này giúp bạn trả lời: hook chạy lúc nào, chặn được gì, nhắm vào đâu, và đặt cấu hình ở chỗ nào?

## Ví dụ xuyên suốt: agent bảo trì của phần mềm quản lý trường mầm non

Một công ty làm phần mềm quản lý cho khoảng 300 trường mầm non (điểm danh, học phí, sổ liên lạc). Đội vận hành dùng Claude Code làm agent bảo trì: đọc log, chạy truy vấn kiểm tra trên database qua `psql`, sửa script cấu hình.

Tháng trước agent chạy một câu `DELETE` thiếu điều kiện `WHERE` trên bảng điểm danh của production. Đội phản ứng bằng cách gắn hook kiểm tra cho mọi hành động, và agent chậm hẳn: mỗi lần đọc file cũng phải chờ hook chạy xong.

## Hook chạy ở đâu trong vòng lặp

Hook là lệnh, endpoint hay prompt của bạn, được Claude Code chạy ở những thời điểm cố định. Docs best practices nói: thứ gì phải xảy ra mọi lần thì đưa vào hook, luật deny hay managed setting, vì `CLAUDE.md` chỉ là hướng dẫn và Claude có thể quyết định nó không áp dụng.

Sự kiện nào chặn được hành động là điểm đề thi hay hỏi:

| Sự kiện | Khi nào | Chặn được? |
| --- | --- | --- |
| `PreToolUse` | Trước khi một tool chạy | Có: thoát mã 2, hoặc trả `permissionDecision: "deny"` |
| `PermissionRequest` | Khi tool cần quyết định cấp quyền | Có, qua object `decision` (mã 2 không có tác dụng ở đây) |
| `UserPromptSubmit` | Khi một prompt được gửi | Có: prompt không tới Claude |
| `Stop`, `SubagentStop` | Khi Claude hay subagent định dừng | Có: buộc làm tiếp |
| `PostToolUse` | Sau khi tool chạy thành công | Không: tool đã chạy rồi, chỉ báo lại cho Claude |
| `SessionStart`, `PreCompact`, `Notification` | Đầu phiên, trước khi nén, khi có thông báo | Dùng để nạp ngữ cảnh, lưu lại, gửi cảnh báo |

Muốn ngăn một câu lệnh phá huỷ thì phải dùng `PreToolUse`. `PostToolUse` hợp với việc ghi nhật ký hay chạy formatter sau khi sửa file, không cứu được dữ liệu đã xoá.

**Sơ đồ**
1. **Claude định chạy một câu lệnh**
   ↓ _PreToolUse: lúc này còn chặn được_
2. **Tool chạy**
   ↓ _PostToolUse: tool đã chạy rồi, chỉ báo lại cho Claude_
3. **Claude nhận kết quả**

Mã thoát của hook command: `0` là thành công (đọc JSON in ra nếu có), `2` là lỗi chặn (stderr là lý do, gửi cho Claude), mã khác là lỗi không chặn: hành động vẫn chạy, trừ khi hook được cấu hình để lỗi của nó cũng chặn (`onFailure: "block"`). Vì vậy một hook guardrail viết sai, thoát mã 1, mặc định sẽ không chặn gì cả.

**Sơ đồ**
1. **Thoát mã 0** **|** **Thoát mã 2** **|** **Thoát mã khác**
   ↓ _hành động_
2. **Theo JSON hook in ra, nếu có** **|** **Bị chặn, stderr là lý do gửi cho Claude** **|** **Vẫn chạy, trừ khi đặt onFailure là block**

## Nhắm đúng chỗ: matcher và if

Gắn hook cho mọi hành động là lý do agent trong ví dụ chậm đi. Docs cho hai tầng lọc:

- **`matcher`** lọc theo tên tool. Chỉ có chữ, số, `_`, `-`, khoảng trắng, `,` và `|` thì so khớp chính xác (`Bash`, `Edit|Write`); có ký tự khác thì là biểu thức chính quy (`mcp__db__.*` khớp mọi tool của MCP server `db`). Tên tool phân biệt chữ hoa chữ thường. Bỏ trống matcher hoặc đặt `"*"` thì hook khớp mọi tool.
- **`if`** lọc sâu hơn theo cú pháp luật quyền, ví dụ `"Bash(psql *)"`: hook chỉ được khởi chạy khi lệnh khớp, đỡ tốn công chạy script cho mọi lệnh Bash.

Matcher dạng biểu thức chính quy không neo vào đầu hay cuối: nó khớp nếu mẫu xuất hiện ở bất kỳ đâu trong tên tool. Vì vậy `Edit.*` bắt cả `Edit` lẫn `NotebookEdit`, và `Bash|Edit.*` bắt Bash, Edit, NotebookEdit. Muốn khớp nguyên tên thì neo bằng `^Edit$`.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "if": "Bash(psql *)", "command": "./.claude/hooks/kiem-sql.sh" }
        ]
      }
    ]
  }
}
```

Script `kiem-sql.sh` đọc JSON đầu vào từ stdin, lấy câu lệnh, và thoát mã 2 kèm lý do nếu gặp `DROP`, `TRUNCATE` hay `DELETE` không có `WHERE`. Với thay đổi hợp lệ nhưng nhạy cảm, hook có thể trả quyết định `"ask"` để buộc người duyệt thay vì chặn hẳn.

Hai tầng lọc làm hook chỉ chạy đúng chỗ cần:

**Sơ đồ**
1. **Mọi lời gọi tool**: đọc file, sửa file, chạy lệnh
   ↓ _matcher: chỉ tool Bash_
2. **Mọi lệnh Bash**
   ↓ _if: chỉ lệnh khớp Bash(psql *)_
3. **kiem-sql.sh**: đọc câu lệnh từ stdin
   ↓ _rẽ theo câu lệnh_
4. **DROP, TRUNCATE, DELETE không có WHERE**: thoát mã 2 **|** **Truy vấn kiểm tra**: cho chạy

> **Trong đề chọn gì**
>
> Câu luyện thi: hook đang chạy cho mọi hành động, làm agent chậm đáng kể dù đa số hành động không có rủi ro. Chọn **chỉ gắn hook cho hành động rủi ro cao như thao tác phá huỷ hay truy cập dữ liệu nhạy cảm, gỡ khỏi hành động rủi ro thấp**. Sai: tắt hết hook trong lúc sắp xếp lại; tắt agent giờ cao điểm; thay hook bằng chỉ dẫn trong system prompt.

Nhiều hook có thể cùng chạy cho một lời gọi tool và trả quyết định khác nhau. Với `PreToolUse`, docs xếp thứ tự ưu tiên: `deny` thắng `defer`, `defer` thắng `ask`, `ask` thắng `allow`. Tức là chỉ cần một hook từ chối thì lời gọi bị chặn, dù hook khác cho phép. Hook chạy nền (`async: true`) không chặn hay sửa được kết quả vì không ai chờ nó, nên hook dùng để chặn hành động phải chạy đồng bộ. `PostToolUse` cũng không chặn được, vì tool đã chạy xong.

## Loại handler và nơi đặt cấu hình

Docs liệt kê năm loại handler:

| `type` | Làm gì |
| --- | --- |
| `command` | Chạy lệnh shell, nhận JSON qua stdin, trả kết quả bằng mã thoát và stdout |
| `http` | Gửi JSON tới một URL bằng POST, đọc kết quả từ body |
| `mcp_tool` | Gọi một tool trên MCP server đã cấu hình |
| `prompt` | Hỏi một model Claude một lượt, nhận quyết định dạng JSON |
| `agent` | Chạy một subagent dùng tool (Read, Grep…) để kiểm điều kiện; còn thử nghiệm |

Với guardrail chặn hành động phá huỷ, `command` là lựa chọn tất định nhất: cùng đầu vào luôn cùng kết quả. `prompt` và `agent` dùng model để phán đoán, hợp với điều kiện khó viết thành luật, nhưng không còn tất định.

Nơi đặt quyết định phạm vi:

| Nơi đặt | Phạm vi |
| --- | --- |
| `~/.claude/settings.json` | Mọi dự án của bạn |
| `.claude/settings.json` | Một dự án, commit chung cho cả đội |
| `.claude/settings.local.json` | Một dự án, riêng bạn |
| Managed settings | Cả tổ chức, do quản trị viên kiểm soát |
| Plugin, skill, subagent | Khi plugin bật, sau khi skill được gọi, trong lúc subagent chạy |

Hook ở các tầng cộng dồn chứ không thay nhau: hook của user hay project không gỡ được hook managed. Quản trị viên có thể bật `allowManagedHooksOnly` để chỉ hook managed được chạy. Hook trong settings và managed cũng chạy khi subagent gọi tool. Trong ví dụ, hook `kiem-sql.sh` đặt ở `.claude/settings.json` và commit để mọi người trong đội vận hành đều có.

Nếu bạn dựng agent bằng Agent SDK thay vì Claude Code, hook là các hàm callback truyền vào tuỳ chọn `hooks`, cùng tên sự kiện và cùng ý tưởng (bài 1.2).

> **Bẫy đề**
>
> Câu luyện thi: agent thao tác database đã chạy một truy vấn phá huỷ trên production, đội muốn thêm kiểm soát tất định. Đúng là **thêm hook chặn các thao tác database và áp kiểm tra tất định, như chặn truy vấn phá huỷ hay đòi duyệt, trước khi truy vấn chạy**. Sai: chỉ chạy agent giờ hành chính; đổi model mạnh hơn; thêm câu "hãy cẩn thận" vào system prompt. Chữ "tất định" loại mọi cách dựa vào việc model có làm đúng hay không.

> **Ý chính**
>
> Hook là code chạy mọi lần ở điểm cố định, ngoài model. Muốn chặn thì dùng `PreToolUse` (thoát mã 2 hoặc `deny`), vì `PostToolUse` tới khi tool đã chạy. Nhắm hẹp bằng `matcher` và `if`, chỉ cho hành động rủi ro, dùng handler `command` khi cần tất định, và đặt ở settings project hay managed để cả đội cùng chịu.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 7](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Hooks reference (Claude Code Docs)](https://code.claude.com/docs/en/hooks)
3. [Get started with hooks (Claude Code Docs)](https://code.claude.com/docs/en/hooks-guide)
4. [Intercept and control agent behavior with hooks (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/hooks)
5. [Best practices for Claude Code (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
