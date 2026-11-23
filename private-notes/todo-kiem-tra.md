# Cần kiểm tra sau

## Claude Code: các kiểu agent ngoài "agent chính + subagent" (ghi 2026-11-23)

Tài liệu trong repo (notes/lessons/08-platform-subagents-skills.html §3) mới có agent chính, subagent (dựng sẵn, tự định nghĩa, plugin) và fork. Còn hai phần chưa có, cũng chưa đối chiếu với docs hiện hành:

- [ ] **Cờ `--agent`**: chạy agent chính theo một file định nghĩa agent (thay system prompt, tool, model của luồng chính). Kiểm tra: cú pháp, có setting tương đương trong settings.json không, VS Code extension có hỗ trợ không.
- [ ] **Agent teams** (thử nghiệm): nhiều session Claude Code phối hợp với nhau (một session điều phối, các teammate). Kiểm tra: cách bật (biến môi trường hay setting), khác subagent ở điểm nào (context, giao tiếp giữa teammate), còn thử nghiệm hay đã GA.

Nguồn cần đọc: https://code.claude.com/docs (mục Subagents, Agent teams, CLI reference).
Nếu xác nhận đúng và liên quan đề thi → cân nhắc bổ sung vào bài 08 §3 hoặc bài 13.
