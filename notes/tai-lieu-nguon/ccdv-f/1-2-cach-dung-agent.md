---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/1-2-cach-dung-agent
ngay_tai: 2026-11-27
tieu_de: Dựng agent với Claude - tự viết vòng lặp, Agent SDK hay Managed Agents
---

Domain 1: Agents and Workflows · Task 1.2

# Dựng agent với Claude - tự viết vòng lặp, Agent SDK hay Managed Agents

So sánh ba cách dựng agent với Claude (Client SDK, Agent SDK, Managed Agents), chọn nơi chạy agent, và dùng hook cho những việc phải xảy ra chắc chắn.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Chọn giữa Client SDK, Agent SDK và Managed Agents theo việc bạn muốn tự làm phần nào của agent
- Biết Agent SDK lo sẵn những gì, và khi nào giữ hay bỏ một tuỳ chỉnh của riêng đội
- Phân biệt agent chạy trong process của bạn, trong sandbox của Anthropic, và trong sandbox tự host
- Dùng hook để chặn hay ghi lại hành động một cách chắc chắn, không phụ thuộc vào prompt

Quyết định "làm agent" xong, câu hỏi tiếp theo là dựng nó bằng gì. Bạn có thể tự viết vòng lặp gọi API, dùng một thư viện lo sẵn vòng lặp, hoặc để Anthropic chạy luôn cả agent.

Bài này giúp bạn trả lời: mỗi cách dựng agent lo sẵn phần nào, agent chạy ở đâu, và việc gì phải giao cho hook thay vì prompt?

## Ví dụ xuyên suốt: agent điều tra sự cố của công ty hosting

Một công ty hosting nhỏ quản lý khoảng 400 máy chủ cho khách. Mỗi đêm có vài cảnh báo: ổ đĩa sắp đầy, dịch vụ web trả lỗi 502, chứng chỉ TLS sắp hết hạn. Đội vận hành muốn một agent tự điều tra trước: đọc log, chạy vài lệnh chẩn đoán chỉ đọc, rồi viết báo cáo kèm đề xuất cách sửa cho người trực sáng hôm sau.

Hai yêu cầu cứng: agent không bao giờ được khởi động lại dịch vụ hay xoá file trên máy của khách, và mỗi lần điều tra không được tốn quá một mức chi phí cố định.

## Ba cách dựng, khác nhau ở chỗ ai làm gì

Trang tổng quan Agent SDK so sánh các cách dựng agent với Claude theo ba điểm: ai chạy agent, cái gì có sẵn, và bạn gọi nó bằng cách nào.

| Cách dựng | Bạn tự làm | Có sẵn |
| --- | --- | --- |
| **Client SDK** (gọi thẳng Claude API) | Vòng lặp tool, chạy tool, lưu lịch sử. Hoặc dùng tool runner (đang beta) của SDK để nó chạy vòng lặp | Truy cập API trực tiếp, kiểm soát chi tiết từng lần gọi |
| **Agent SDK** (Python, TypeScript) | Vận hành process chạy agent | Vòng lặp agent, tool có sẵn (đọc, sửa file, chạy lệnh, tìm web), quyền, session, hook, subagent, MCP, tự nén context. Đây chính là phần lõi của Claude Code |
| **Claude Managed Agents** | Khai báo agent qua API, gửi sự kiện và đọc kết quả | Anthropic chạy cả vòng lặp agent lẫn sandbox để chạy tool, lưu session phía server |

Tự viết vòng lặp với Client SDK nghĩa là viết đúng cái khuôn docs mô tả: gửi yêu cầu kèm danh sách tool; khi `stop_reason` là `"tool_use"` thì chạy tool, gửi kết quả về trong khối `tool_result`, rồi gọi tiếp; dừng khi `stop_reason` là giá trị khác. Cách này hợp khi bạn cần kiểm soát từng bước, hoặc agent chỉ dùng tool của riêng bạn.

**Sơ đồ**
1. **Gửi yêu cầu**: kèm danh sách tool
2. **stop_reason là tool_use**: code của bạn chạy tool
3. **Gửi kết quả về**: trong khối tool_result, gọi tiếp
- ↻stop_reason là giá trị khác thì dừng

Docs Agent SDK cũng nhắc: muốn dùng cùng vòng lặp đó từ ngôn ngữ khác Python, TypeScript thì chạy Claude Code CLI như một process con với cờ `-p` và `--output-format json`.

Với agent điều tra sự cố, đội chọn Agent SDK: agent cần chạy lệnh shell và đọc file log, mà Agent SDK có sẵn các tool đó cùng cơ chế quyền và hook.

> **Trong đề chọn gì**
>
> Câu luyện thi: đội đã chọn Agent SDK thay vì tự viết vòng lặp, giờ cần khai báo tool và vòng lặp. Chọn **dùng giao diện tool của SDK và để SDK lo vòng lặp, việc gọi tool và lịch sử hội thoại**. Sai: tự viết lại vòng lặp hay lớp lịch sử bằng code của đội, hoặc lưu lịch sử ở một database riêng; gọi thẳng Messages API và để model ghi lời gọi tool bằng chữ thường.

## Agent SDK lo sẵn những gì

Một lần gọi `query()` của Agent SDK chạy trọn vòng lặp: Claude nhận prompt, gọi tool, SDK chạy tool và gửi kết quả về, lặp lại cho tới khi Claude trả lời bằng chữ mà không gọi tool nữa. Cuối cùng SDK trả một `ResultMessage` có kết quả, số token, chi phí và session ID.

Agent SDK có sẵn các tool giống Claude Code: `Read`, `Edit`, `Write` đọc và sửa file; `Glob`, `Grep` tìm file theo mẫu và tìm nội dung bằng regex; `Bash` chạy lệnh shell, script và thao tác git; `WebSearch`, `WebFetch` tìm web và tải trang; `Agent`, `Skill`, `AskUserQuestion` để giao việc cho subagent, gọi skill và hỏi người dùng. Muốn agent chạy `git status`, stage rồi commit thì cần `Bash`: trong các tool trên chỉ nó chạy được lệnh. Bạn có thể giới hạn bằng luật như `"Bash(npm *)"` để chỉ cho một số lệnh.

Bạn điều khiển vòng lặp bằng các tuỳ chọn, ví dụ trong Python:

| Tuỳ chọn | Tác dụng |
| --- | --- |
| `allowed_tools` | Tool được tự duyệt không cần hỏi. Không giới hạn Claude chỉ dùng các tool này |
| `disallowed_tools` | Tool bị cấm; tên trần như `"Bash"` gỡ hẳn tool khỏi context |
| `max_turns` | Số lượt tối đa; chạm giới hạn thì kết quả có `subtype` là `error_max_turns` |
| `max_budget_usd` | Chi phí ước tính tối đa; chạm thì dừng với `error_max_budget_usd` |
| `hooks` | Hàm chạy ở các thời điểm cố định của vòng lặp |
| `resume` | Session ID để chạy tiếp một phiên cũ |

Yêu cầu "không tốn quá một mức chi phí" của ví dụ ứng với `max_budget_usd`. Docs lưu ý SDK so chi phí sau khi mỗi phản hồi về, nên tổng có thể vượt mức đặt một chút: hãy chừa khoảng trống. Luôn kiểm `subtype` của `ResultMessage` trước khi đọc kết quả, vì trường `result` chỉ có khi `subtype` là `success`.

Mỗi lần dùng SDK là tạo hoặc nối vào một **session** (lịch sử hội thoại), và SDK tự ghi nó xuống đĩa. Có ba cách quay lại: **continue** (`continue: true` trong TypeScript) tìm session gần nhất trong thư mục hiện tại, không cần ID; **resume** nhận một session ID cụ thể; **fork** tạo session mới bắt đầu bằng bản sao lịch sử, bản gốc giữ nguyên. Với việc chạy một lần, không cần hỏi tiếp, một lần `query()` là đủ. Nếu không muốn ghi gì xuống đĩa, đặt `persistSession: false` (chỉ có ở TypeScript): session chỉ nằm trong bộ nhớ suốt lần gọi. Python thì dùng biến môi trường `CLAUDE_CODE_SKIP_PROMPT_HISTORY` để tắt ghi transcript.

Đội cũ của công ty từng tự viết lớp thử lại và lưu lịch sử riêng trước khi chuyển sang Agent SDK. Không nên gỡ hết hay giữ hết. Xem từng tuỳ chỉnh: ngày trước thêm nó vì lý do gì, và SDK bây giờ đã làm được việc đó chưa.

> **Bẫy đề**
>
> Câu luyện thi: agent có nhiều tuỳ chỉnh vượt qua mặc định của SDK (quản lý lịch sử, thử lại, xử lý lỗi). Người mới muốn gỡ hết, trưởng nhóm muốn giữ hết. Đúng là **xét từng tuỳ chỉnh theo lý do ban đầu và khả năng hiện tại của SDK**. Sai: gỡ hết cho đồng bộ; giữ hết vì tin lý do cũ vẫn đúng; bỏ SDK để tự viết lại vòng lặp.

## Agent chạy ở đâu

Đề thi hỏi về mô hình triển khai agent tự host hay do Anthropic host (**self-hosted vs. Anthropic-hosted**). Có ba khả năng:

| Mô hình | Vòng lặp agent chạy ở | Tool chạy ở |
| --- | --- | --- |
| Agent SDK | Process của bạn | Máy của bạn |
| Managed Agents, sandbox trên cloud | Anthropic | Sandbox do Anthropic quản lý |
| Managed Agents, sandbox tự host (**self-hosted sandbox**) | Anthropic | Hạ tầng của bạn, qua một environment worker nhận việc từ hàng đợi |

Ghép hai bảng lại để thấy phần nào nằm ở đâu:

**Sơ đồ**
1. **Client SDK** **|** **Agent SDK** **|** **Managed Agents**
   ↓ _vòng lặp agent do ai chạy_
2. **Code bạn tự viết** **|** **SDK, trong process của bạn** **|** **Máy chủ Anthropic**
   ↓ _tool chạy ở đâu_
3. **Code của bạn** **|** **Máy của bạn** **|** **Sandbox của Anthropic, hoặc sandbox tự host**

Managed Agents xoay quanh bốn khái niệm:

- **Agent**: model, system prompt, tool, MCP server và skill. Tạo một lần, dùng lại bằng ID.
- **Environment**: nơi session chạy, sandbox trên cloud hoặc sandbox tự host.
- **Session**: một lần agent chạy trong một environment để làm một việc.
- **Events**: tin nhắn qua lại giữa ứng dụng và agent (lượt người dùng, kết quả tool, cập nhật trạng thái), trả về dạng server-sent events.

Docs nói Managed Agents hợp với việc chạy lâu (vài phút tới vài giờ), chạy bất đồng bộ, cần session có trạng thái, hoặc chạy theo lịch. Sandbox tự host dùng khi cần giữ việc chạy tool, file và lưu lượng mạng trong hạ tầng của mình, ví dụ vì yêu cầu tuân thủ hay nơi lưu dữ liệu. Vài điều cần biết: Managed Agents đang beta, mọi endpoint cần header `managed-agents-2026-04-01` (SDK tự gửi), và vì session lưu ở server nên không áp dụng được Zero Data Retention.

Nếu sau này công ty muốn agent điều tra chạy theo lịch mỗi đêm mà không phải nuôi máy chạy agent, Managed Agents với sandbox tự host là hướng hợp lý: Anthropic chạy vòng lặp, còn lệnh chẩn đoán vẫn chạy trong mạng nội bộ của công ty.

1. **Cần kiểm soát từng lần gọi, hoặc chỉ dùng tool của riêng mình?** → Client SDK, tự viết vòng lặp
2. **Muốn tool, quyền, hook có sẵn và tự vận hành process?** → Agent SDK
3. **Việc chạy lâu, bất đồng bộ, không muốn nuôi hạ tầng agent?** → Managed Agents
4. **Tool phải chạy trong mạng của mình?** → Managed Agents với sandbox tự host
- **Còn lại** → Bắt đầu từ cách ít hạ tầng nhất đáp ứng yêu cầu

## Hook cho những việc phải xảy ra chắc chắn

Prompt có thể dặn "đừng khởi động lại dịch vụ", nhưng đó chỉ là lời dặn; model có thể không làm theo. Đề thi gọi đây là dùng hook cho hành động tất định (**hooks for deterministic actions**). Hook là hàm của bạn, SDK gọi nó ở những thời điểm cố định, như ngay trước khi một tool chạy (`PreToolUse`) hay sau khi tool chạy xong (`PostToolUse`). Hook `PreToolUse` có thể trả quyết định `"deny"` để chặn lời gọi tool, bất kể model muốn gì.

Agent điều tra sự cố dùng một hook chặn lệnh nguy hiểm:

```python
async def chan_lenh_nguy_hiem(input_data, tool_use_id, context):
    lenh = input_data["tool_input"].get("command", "")
    if "systemctl restart" in lenh or "rm " in lenh:
        return {
            "hookSpecificOutput": {
                "hookEventName": input_data["hook_event_name"],
                "permissionDecision": "deny",
                "permissionDecisionReason": "Agent chỉ được chạy lệnh chẩn đoán",
            }
        }
    return {}

options = ClaudeAgentOptions(
    max_budget_usd=2.0,
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[chan_lenh_nguy_hiem])]},
)
```

`matcher` lọc theo tên tool, ở đây chỉ chạy hook với tool `Bash`. Docs nói khi nhiều hook `PreToolUse` trả quyết định khác nhau thì `deny` thắng. Hook so chuỗi đơn giản như trên chỉ là ví dụ; ở môi trường thật, nên kết hợp với danh sách lệnh được phép và chạy agent trong sandbox. Hook `PostToolUse` hợp với việc ghi lại mọi lệnh đã chạy vào nhật ký kiểm tra.

**Sơ đồ**
1. **Claude gọi tool Bash**: systemctl restart nginx
   ↓ _hook PreToolUse chạy trước khi tool chạy_
2. **chan_lenh_nguy_hiem**: kiểm chuỗi lệnh
   ↓ _rẽ theo lệnh_
3. **Lệnh chẩn đoán**: cho chạy **|** **Có systemctl restart hay rm**: deny, kèm lý do

> **Ý chính**
>
> Client SDK: bạn tự viết vòng lặp. Agent SDK: vòng lặp, tool, quyền, hook có sẵn, bạn vận hành process. Managed Agents: Anthropic chạy vòng lặp, tool chạy trong sandbox của Anthropic hoặc của bạn. Việc gì nhất định phải xảy ra hay không được xảy ra thì giao cho hook, đừng chỉ dặn trong prompt.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Agent SDK overview (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/overview)
3. [How the agent loop works (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/agent-loop)
4. [Intercept and control agent behavior with hooks (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/hooks)
5. [How tool use works (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
6. [Claude Managed Agents overview (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/overview)
7. [Self-hosted sandboxes (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes)
8. [Work with sessions (Claude Code Docs, Agent SDK)](https://code.claude.com/docs/en/agent-sdk/sessions)
