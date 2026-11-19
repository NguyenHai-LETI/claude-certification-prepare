# Dọn cuối — bài học MCP và `allowed-tools` — 2026-11-19
Người sửa: Claude Opus 5.5 (claude-opus-5-5) · Phạm vi: `notes/lessons/` (03, 04, 05, 10, 12, 17, 21), `notes/exams/CCAR-F.md`, `bank/packs/ccx.yaml` (M06, PD22; đã kiểm C06, Z06, E27, E28, E53, C267, E05) · Kết quả `node scripts/validate.ts`: ĐẠT, 0 lỗi (2 cảnh báo cũ ở `official.yaml`, không liên quan).

## Nguồn đã xác minh (WebFetch ngày 2026-11-19)
- Đặc tả MCP hiện hành là bản **2026-07-28**: https://modelcontextprotocol.io/specification/latest
- Changelog 2026-07-28: https://modelcontextprotocol.io/specification/latest/changelog — mục *Deprecated*: Roots, Sampling, Logging (SEP-2577); Dynamic Client Registration (PR #2858, thay bằng Client ID Metadata Documents); HTTP+SSE và `includeContext: "thisServer"/"allServers"` được xếp lại thành Deprecated (SEP-2596). Bản này cũng bỏ `initialize`/`notifications/initialized`, session `Mcp-Session-Id`, `logging/setLevel`, `notifications/roots/list_changed`, và thay request do server khởi tạo bằng `InputRequiredResult` (MRTR, SEP-2322).
- Registry: https://modelcontextprotocol.io/specification/2026-07-28/deprecated — đường chuyển đổi: Roots → truyền thư mục/file qua tham số tool, URI resource hoặc cấu hình server; Sampling → gọi thẳng API nhà cung cấp LLM; Logging → `stderr` (stdio) hoặc OpenTelemetry; DCR → Client ID Metadata Documents. Sớm nhất bị gỡ ở bản phát hành từ 2027-07-28.
- Roots: https://modelcontextprotocol.io/specification/latest/client/roots — "informational guidance rather than an access-control mechanism. The protocol does not enforce that servers stay within roots."
- Sampling: https://modelcontextprotocol.io/specification/latest/client/sampling
- Logging: https://modelcontextprotocol.io/specification/latest/server/utilities/logging
- Streamable HTTP 2026-07-28: https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http
- Quickstart server Python: https://modelcontextprotocol.io/docs/develop/build-server — `from mcp.server import MCPServer`, `mcp = MCPServer("weather")`.
- Skills: https://code.claude.com/docs/en/skills — `allowed-tools` "does not restrict which tools are available"; `disallowed-tools` loại tool; trùng tên thì enterprise > personal > project.
- Agent SDK permissions: https://code.claude.com/docs/en/agent-sdk/permissions — `allowedTools` chỉ là allow rule (tự duyệt); tool không liệt kê vẫn có mặt; "tools like `Agent` that don't ask before running" chạy dù không liệt kê; ẩn hẳn tool bằng `disallowedTools`.

## Việc 1 — Bài học MCP
**`notes/lessons/12-mcp.html`** (v0.22 → v0.23):
- Lead, bảng nhãn, xnote mục 3: ghi Sampling và Roots deprecated từ đặc tả 2026-07-28; FastMCP kèm tên mới MCPServer.
- Mục 2 (sau code FastMCP): ghi chú "Thực tế 11/2026" về `MCPServer` trong quickstart hiện hành, không `print()` ra stdout ở server stdio. Nguồn build-server.
- 3.1 Sampling: **sửa lỗi** — hộp cảnh báo và SVG cũ nói "server mới dùng Elicitation thay thế"; đặc tả ghi đường chuyển đổi là gọi thẳng API nhà cung cấp LLM, Elicitation không phải bản thay thế. Viết lại ghi chú: liệt kê đủ 4 tính năng deprecated (Roots, Sampling, Logging, DCR), phiên bản, đường chuyển đổi, cửa sổ 12 tháng, `sampling/createMessage` nay đi trong `InputRequiredResult`. Nguồn chuyển từ 2025-11-25 sang `latest` + changelog + registry.
- 3.2 Roots: thêm cảnh báo ngay sau câu của khóa Academy ("cơ chế bảo vệ filesystem") — đặc tả hiện hành nói roots chỉ mang tính thông tin, không phải kiểm soát truy cập. Ghi chú cũ nhắc `notifications/roots/list_changed` (đã bị bỏ ở 2026-07-28) → sửa lại, thêm `roots/list` qua `InputRequiredResult`, đường chuyển đổi. Giữ nguyên kiến thức khóa Academy và lời khuyên khi làm đề.
- 3.3 Transport: cập nhật ghi chú theo 2026-07-28 (bỏ session, GET endpoint, `Last-Event-ID`; server không còn tự gửi request; `subscriptions/listen`; HTTP+SSE deprecated từ 2025-03-26).
- 3.4 và mục 4: bảng bảo mật, insight CCAR-F D2, hộp Sai/Đúng thêm ý Roots chỉ mang tính thông tin và deprecated.

**Bài khác:**
- `04-tool-mcp.html`: ghi chú sau Hình 8 — bản 2026-07-28 bỏ handshake `initialize`, có `server/discover`; Roots/Sampling/Logging deprecated.
- `10-academy-courses.html`: dòng khóa *MCP Advanced topics* thêm lưu ý deprecate.
- `17-building-api.html`: thuật ngữ FastMCP thêm tên MCPServer; ghi chú quickstart hiện hành sau code.
- `21-lab-ccar-f.html` mục 6 (bảng guide vs docs): thêm dòng "MCP Roots, Sampling, Logging".

## Việc 2 — `allowed-tools` / `allowedTools` trong ghi chú
- `notes/exams/CCAR-F.md`: dòng 75 (mục 1.3) thêm "Đề v1.0 chấm theo guide; thực tế docs hiện hành…" về `allowedTools` + tool `Agent`; dòng 195 (mục 3.2) thêm ý con về `allowed-tools` vs `disallowed-tools`; dòng 196 thêm thứ tự ưu tiên khi trùng tên skill; bài thực hành 2 và 4 (cuối file) thêm chú thích ngắn trỏ về mục 3.2 / 1.3.
- `03-agent.html`: câu "allowedTools phải có Task…" thêm chú thích guide vs docs (ghi chú chi tiết đã có sẵn bên dưới).
- `05-claude-code.html`: ô bảng `allowed-tools` (cột "theo exam guide") thêm chú thích docs.
- `21-lab-ccar-f.html`: comment code Lab Ex4 thêm chú thích; bảng mục 6 thêm dòng `allowed-tools` và bổ sung ô "Tool tạo subagent".
- `11-platform-subagents-skills.html`: đã đúng theo docs, không sửa.

## Việc 3 — `bank/packs/ccx.yaml`
Quét mọi câu active có `allowed-tools`/`allowedTools`/`allowed_tools`: C06, Z06, M06, C267, E70, E27, E28, E53, PD22.
- **C06, Z06, E27, E28, E53, C267, E70**: giải thích đã ghi đúng guide vs docs từ các lượt trước → PASS, không sửa. (Các câu cũ quanh dòng ~1192/~4945 mà lượt trước thấy nay đã retired, ví dụ E04, hoặc đã được sửa.)
- **M06** (FIX giải thích): phương án nhiễu A "Remove Grep from the agent's allowed tools" giả định allowed tools giới hạn tool. Đáp án B đúng dưới cả guide lẫn docs; A sai dưới cả hai. Thêm vào giải thích: theo docs Agent SDK hiện hành, bỏ khỏi `allowedTools` chỉ thôi tự duyệt, không gỡ được tool; gỡ hẳn dùng `disallowedTools` + URL.
- **PD22** (FIX giải thích, nhỏ): "chỉ cấp đúng tool cần thiết qua --allowedTools" → "chỉ cấp sẵn quyền cho đúng tool cần thiết qua --allowedTools".
- **E05** (kiểm, PASS): không có lỗi như L08. Phương án hiện tại của E05 không có lựa chọn "skill cùng tên trong `~/.claude/skills/`" (C là `.claude/settings.json`), nên chỉ B bảo vệ được; giải thích đã nhắc skill cá nhân trùng tên sẽ che skill project. Không cần thêm ràng buộc vào stem.

Không đổi đáp án, không đổi thứ tự / thêm / bớt phương án. CRLF giữ nguyên ở mọi file đã sửa.
