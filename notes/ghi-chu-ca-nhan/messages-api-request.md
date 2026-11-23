---
title: "Cấu trúc đầy đủ của một request Messages API"
---

# Cấu trúc đầy đủ của một request Messages API

Ghi chú cá nhân, soạn ngày 23/11/2026, đối chiếu với tài liệu Claude API hiện hành (API version `2026-10-21`). Bài học liên quan: [02-messages-api](../lessons/02-messages-api.html), [05-tool-use](../lessons/05-tool-use.html), [04-prompt-output](../lessons/04-prompt-output.html).

## 1. Endpoint và header

```http
POST https://api.anthropic.com/v1/messages
content-type: application/json
x-api-key: <API key>
anthropic-version: 2026-10-21
anthropic-beta: <tên-beta-1>,<tên-beta-2>
```

- Header `anthropic-beta` chỉ cần khi dùng tính năng beta.
- Khi gọi qua SDK, bạn không tự viết các header này. SDK tự thêm chúng.

## 2. Body đầy đủ (có chú thích)

```jsonc
{
  // ── BẮT BUỘC ──────────────────────────────────────────
  "model": "claude-opus-5-5",
  "max_tokens": 16000,              // trần token đầu ra của lượt trả lời này
  "messages": [ /* xem mục 3 */ ],

  // ── HAY DÙNG ──────────────────────────────────────────
  "system": "Bạn là nhân viên hỗ trợ...",  // hoặc mảng text block (để gắn cache_control)
  "tools": [ /* xem mục 4 */ ],
  "tool_choice": { "type": "auto" },       // auto | any | tool | none (+ disable_parallel_tool_use)
  "thinking": { "type": "adaptive" },      // Claude tự quyết định nghĩ sâu bao nhiêu
  "output_config": {
    "effort": "high",                      // low | medium | high | xhigh | max
    "format": { "type": "json_schema", "schema": { /* ... */ } }  // structured output
  },
  "stream": true,                          // nhận kết quả từng phần qua SSE
  "stop_sequences": ["###"],
  "cache_control": { "type": "ephemeral" },// prompt caching tự động
  "metadata": { "user_id": "hash-cua-user" },

  // ── VẬN HÀNH ──────────────────────────────────────────
  "service_tier": "auto",
  "inference_geo": "us",                   // nơi chạy inference
  "speed": "fast",                         // fast mode, chỉ một số model hỗ trợ
  "container": { /* ... */ },              // Agent Skills / code execution

  // ── BETA (cần header anthropic-beta) ──────────────────
  "context_management": { "edits": [ /* ... */ ] },  // xoá tool result cũ / compaction
  "mcp_servers": [ /* ... */ ],                      // MCP connector
  "fallbacks": "default"                             // tự chuyển model khi bị từ chối
}
```

## 3. `messages`: vai trò và các loại content block

```jsonc
"messages": [
  { "role": "user", "content": "Câu hỏi dạng chuỗi ngắn gọn" },
  { "role": "user", "content": [ /* hoặc mảng content block */ ] },
  { "role": "assistant", "content": [ /* ... */ ] },
  { "role": "system", "content": "Chỉ dẫn chen giữa hội thoại" }  // chỉ model mới hỗ trợ, không được đứng đầu
]
```

| Block | Nằm ở | Dùng để |
|---|---|---|
| `text` | user, assistant | Văn bản |
| `image` | user | Ảnh, nguồn là `base64`, `url` hoặc `file` (Files API) |
| `document` | user | PDF hoặc văn bản, có thể bật `citations` |
| `search_result` | user | Kết quả tìm kiếm có nguồn, dùng cho RAG |
| `tool_result` | user | Kết quả chạy tool, gắn với `tool_use_id`, có thể kèm `is_error` |
| `tool_use` | assistant | Yêu cầu gọi tool do Claude sinh ra |
| `thinking` | assistant | Phần suy nghĩ. Phải gửi lại nguyên vẹn ở lượt sau |
| `server_tool_use` / `*_tool_result` | assistant | Tool do Anthropic chạy, ví dụ web search |

Các quy tắc chính:

- Message đầu tiên phải là `user`.
- API không lưu trạng thái, nên mỗi request phải gửi lại toàn bộ lịch sử hội thoại, kể cả `tools`.
- Khi Claude gọi nhiều tool song song, gửi **tất cả** `tool_result` trong **một** message `user`.

## 4. `tools`: bốn loại

Định nghĩa tool nằm **trong cùng request** với `messages`, không gửi riêng. Claude chỉ thấy `name`, `description` và `input_schema`, không thấy code. Code chạy trên server của bạn.

```jsonc
"tools": [
  // a) Custom tool: bạn tự định nghĩa và tự chạy
  { "name": "read_ticket", "description": "...",
    "input_schema": { "type": "object", "properties": { /* ... */ } },
    "strict": true },                                  // ép input khớp đúng schema

  // b) Tool do Anthropic định nghĩa, nhưng bạn chạy (không cần schema)
  { "type": "bash_20250124", "name": "bash" },

  // c) Server tool: Anthropic chạy luôn
  { "type": "web_search_20260209", "name": "web_search", "max_uses": 5 },

  // d) Lấy tool từ một MCP server (beta, đi kèm "mcp_servers")
  { "type": "mcp_toolset", "mcp_server_name": "jira" }
]
```

Vòng lặp tool: Claude trả về `tool_use` kèm `stop_reason: "tool_use"`. Server của bạn chạy hàm thật rồi gửi `tool_result` trong request tiếp theo. Claude đọc kết quả, rồi trả lời tiếp hoặc gọi tool khác.

## 5. Response trả về

```jsonc
{
  "id": "msg_...", "type": "message", "role": "assistant",
  "model": "claude-opus-5-5",
  "content": [ { "type": "text", "text": "..." }, { "type": "tool_use", "id": "toolu_...", "name": "...", "input": {} } ],
  "stop_reason": "end_turn",   // end_turn | max_tokens | stop_sequence | tool_use | pause_turn | refusal
  "stop_details": null,        // chỉ có giá trị khi stop_reason = refusal
  "usage": { "input_tokens": 0, "output_tokens": 0,
             "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0 }
}
```

## 6. Lưu ý khi ôn thi

- **`temperature`, `top_p`, `top_k`** đã bị bỏ ở API version `2026-10-21`. Gửi lên sẽ bị lỗi 400. Tuy vậy, bài 02 và đề thi vẫn có thể hỏi về `temperature` như một khái niệm.
- **`thinking.budget_tokens`** là cách cũ. Model hiện nay dùng `{"type": "adaptive"}` và điều chỉnh độ sâu bằng `output_config.effort`.
- **Assistant prefill**, tức điền sẵn phần đầu câu trả lời của assistant, bị chặn trên các model mới. Muốn ép định dạng thì dùng `output_config.format`.
- Thứ tự cache prefix là `tools`, rồi `system`, rồi `messages`. Thay đổi `tools` làm mất cache của toàn bộ phần phía sau.

Nguồn: [Messages API reference](https://platform.claude.com/docs/en/api/messages); [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview); [API versioning](https://platform.claude.com/docs/en/api/versioning)
