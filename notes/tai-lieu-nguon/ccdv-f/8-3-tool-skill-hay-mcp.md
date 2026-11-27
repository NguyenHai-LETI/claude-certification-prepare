---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/8-3-tool-skill-hay-mcp
ngay_tai: 2026-11-27
tieu_de: Tool có sẵn, tool tự viết, skill hay MCP - chọn cách mở rộng Claude
---

Domain 8: Tools and MCPs · Task 8.3

# Tool có sẵn, tool tự viết, skill hay MCP - chọn cách mở rộng Claude

Phân biệt tool có sẵn, tool tự viết, skill và MCP server theo ai viết schema, code chạy ở đâu, tốn bao nhiêu context, và chọn theo phạm vi, nhu cầu dùng lại.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Phân biệt tool có sẵn của Anthropic, tool tự viết, skill và MCP server
- Quyết định khi nào tool có sẵn là đủ, khi nào đáng viết tool riêng
- Giải thích cách skill nạp dần để kiến thức chưa dùng không chiếm context
- Chọn MCP, skill, hay cả hai cho một nhu cầu, và biết cái giá về context của từng cách

Muốn Claude làm thêm một việc, bạn có ít nhất bốn cách: dùng tool Anthropic đã có, tự viết tool, đóng gói thành skill, hay dựng MCP server. Bốn cách này không thay thế nhau. Chọn sai thì hoặc tốn công viết lại thứ đã có, hoặc mỗi đội giữ một bản sao của cùng một năng lực.

Bài này giúp bạn trả lời: mỗi cách mở rộng hợp với việc gì, và chọn thế nào cho một nhu cầu cụ thể?

## Ví dụ xuyên suốt: agent của công ty tư vấn du học

Một công ty tư vấn du học dựng agent hỗ trợ tư vấn viên. Agent cần:

1. Đọc tin tức mới về chính sách visa trên web.
2. Tra hồ sơ học sinh trong phần mềm quản lý khách hàng (CRM) nội bộ. Đội marketing và đội kế toán cũng muốn agent của họ dùng dữ liệu này.
3. Làm theo quy trình chuẩn bị hồ sơ visa du học Úc của công ty: danh sách giấy tờ, cách viết thư giới thiệu, một script quy đổi điểm trung bình.
4. Tính học phí quy đổi sang đồng Việt Nam theo tỉ giá ngày.

## Bốn cách mở rộng

Đề thi gọi đây là tuỳ biến agent (**agentic customization**): cân nhắc giữa tool có sẵn (**built-in tools**), tool tự viết (**custom tools**), **Skills** và **MCP**.

| Cách | Ai viết schema | Code chạy ở đâu | Hợp với |
| --- | --- | --- | --- |
| Tool có sẵn chạy ở máy chủ (`web_search`, `web_fetch`, `code_execution`) | Anthropic | Máy chủ Anthropic | Năng lực chung: tìm web, chạy code |
| Tool có sẵn chạy ở phía bạn (Bash, sửa file, memory) | Anthropic, Claude đã học sẵn | Ứng dụng của bạn | Thao tác máy tính, file |
| Tool tự viết | Bạn | Ứng dụng của bạn | Nghiệp vụ riêng, API nội bộ, dữ liệu riêng |
| Skill | Bạn (thư mục có `SKILL.md`, script, tài liệu) | Môi trường có hệ thống file và bash | Kiến thức, quy trình, tài liệu tham khảo |
| MCP server | Bạn hoặc bên cung cấp dịch vụ | Một server riêng, qua giao thức chuẩn | Kết nối tới hệ thống ngoài, dùng chung nhiều ứng dụng |

## Có sẵn trước, tự viết sau

Việc 1 dùng `web_search` có sẵn, không cần viết gì. Việc 4 gần như được `code_execution` có sẵn làm hết, chỉ thiếu tỉ giá ngày. Lúc này câu hỏi là phần thiếu đó có bù được bằng cách kết hợp với tool có sẵn không (ví dụ cho `web_fetch` đọc trang tỉ giá của ngân hàng rồi để `code_execution` tính), hay đáng viết một tool riêng gọi thẳng API tỉ giá của công ty.

> **Trong đề chọn gì**
>
> Câu luyện thi: tool có sẵn gần như đáp ứng được, chỉ thiếu một tính năng; đội tranh luận nên viết tool riêng hay dùng tool có sẵn. Chọn **đánh giá tính năng thiếu có bù được bằng cách mở rộng tool có sẵn không, hay đáng viết tool riêng, rồi chọn theo đó**. Sai: theo tiền lệ của đội; chỉ ước công viết tool riêng; chỉ đọc tài liệu xem tool có sẵn đã đủ chưa mà không xét cách mở rộng.

Nếu dựng agent bằng Agent SDK, tool tự viết được khai bằng `@tool` (Python) hoặc `tool()` (TypeScript), rồi gói trong một MCP server chạy ngay trong process (`create_sdk_mcp_server`) và truyền vào tuỳ chọn `mcp_servers`.

## Skill: kiến thức nạp dần khi cần

Việc 3 không phải là kết nối tới hệ thống nào, mà là "cách làm" của công ty. Đó là việc của skill: một thư mục chứa hướng dẫn, metadata và tài nguyên tuỳ chọn (script, mẫu), Claude dùng khi phù hợp. Docs Agent Skills mô tả cơ chế nạp dần (**progressive disclosure**):

| Mức | Khi nào nạp | Tốn bao nhiêu |
| --- | --- | --- |
| Metadata (`name`, `description`) | Luôn có, từ đầu phiên | Khoảng 100 token mỗi skill |
| Thân `SKILL.md` | Khi việc khớp mô tả của skill | Dưới 5 nghìn token |
| File đi kèm, script | Khi được nhắc tới | Không tốn gì tới khi dùng; script chạy qua bash, chỉ kết quả vào context |

Vì Claude so yêu cầu với `description` để quyết định có dùng skill hay không, mô tả phải nói cả skill làm gì lẫn khi nào dùng. Trong Claude Code, đặt skill ở thư mục skill mà Claude Code nhận ra, như `.claude/skills/ho-so-visa-uc/SKILL.md` trong repo để cả đội dùng chung. Trên Claude API, skill chạy trong container của tool code execution (khai `skill_ids` trong `container`).

Với quy trình hồ sơ visa Úc:

**Sơ đồ**
1. **Metadata**: luôn có, khoảng 100 token
   ↓ _tư vấn viên hỏi đúng việc, khớp mô tả của skill_
2. **Thân SKILL.md**: danh sách giấy tờ, cách viết thư giới thiệu
   ↓ _khi được nhắc tới_
3. **Script quy đổi điểm**: chạy qua bash, chỉ kết quả vào context

> **Bẫy đề**
>
> Câu luyện thi: đồng đội hỏi đặt một skill gồm chỉ dẫn và vài script hỗ trợ ở đâu để cả đội gọi được trong Claude Code. Đúng là **đặt trong thư mục skill mà Claude Code nhận ra, để Claude tìm và nạp khi cần**. Sai: dán thành chỉ dẫn dài ở đầu mọi `CLAUDE.md` (tốn context mọi phiên); viết thành module trong code ứng dụng; để trong thư mục riêng của từng người rồi nạp tay.

## MCP cho kết nối, skill cho cách làm

Việc 2 là kết nối tới một hệ thống ngoài mà ba đội cùng dùng: đó là chỗ của MCP server. Trang tổng quan tính năng của Claude Code tóm tắt: MCP kết nối Claude với dịch vụ bên ngoài, cung cấp tool và quyền truy cập dữ liệu, server lo phần kết nối và xác thực; skill mở rộng những gì Claude biết, kể cả cách dùng các dịch vụ đó cho hiệu quả. Hai thứ thường đi cùng nhau: MCP nối tới CRM, còn skill ghi lại cấu trúc dữ liệu CRM và các truy vấn hay dùng.

**Sơ đồ**
- Trung tâm: **MCP server CRM**: lo kết nối và xác thực, bảo trì một chỗ
- **Agent tư vấn**
- **Agent marketing**
- **Agent kế toán**

_Ba đội dùng chung, không ai giữ bản sao riêng_

Hai thứ đi cùng nhau trên agent tư vấn:

**Sơ đồ**
1. **Agent tư vấn**
   ↓ _mỗi thứ lo một việc_
2. **MCP server CRM**: nối tới dữ liệu, cung cấp tool **|** **Skill về CRM**: cấu trúc dữ liệu, truy vấn hay dùng

> **Trong đề chọn gì**
>
> Câu luyện thi: đồng đội hỏi khi nào chọn skill thay vì MCP server, vì cả hai đều dùng lại được giữa các đội. Chọn **skill gói prompt, script và dữ liệu thành một khối model nạp vào; MCP server phơi resource, tool và prompt qua giao diện client chuẩn**. Sai: hai thứ tương đương, dùng thay nhau; skill cũ hơn nên chọn MCP; skill nạp hiệu quả hơn nên luôn chọn skill.

Về chi phí context, theo bảng của Claude Code:

- `CLAUDE.md`: nạp toàn bộ, tốn ở mọi yêu cầu.
- Skill: mô tả có mặt ở mọi yêu cầu, toàn bộ nội dung chỉ khi dùng.
- MCP server: tên tool lúc đầu, schema đầy đủ khi cần (nhờ tool search).

Bài viết "Code execution with MCP" của Anthropic chỉ ra hai cái giá khi một agent kết nối nhiều MCP server: định nghĩa tool làm đầy context, và kết quả trung gian của tool đi qua context làm tốn thêm token. Một hướng giảm là để agent viết code gọi MCP server như gọi API, đọc định nghĩa tool từ hệ thống file khi cần thay vì nạp hết từ đầu.

## Chọn theo phạm vi, nhu cầu dùng lại, bối cảnh tích hợp

| Nhu cầu trong ví dụ | Chọn | Vì sao |
| --- | --- | --- |
| Tin tức visa trên web | `web_search` có sẵn | Năng lực chung, đã có |
| Tỉ giá ngày | Tool có sẵn kết hợp, hoặc một tool riêng nhỏ | Chỉ agent này cần |
| Dữ liệu CRM cho ba đội | MCP server | Hệ thống ngoài, nhiều ứng dụng dùng, bảo trì một chỗ |
| Quy trình hồ sơ visa Úc | Skill | Kiến thức và quy trình, nạp khi cần |

1. **Anthropic đã có tool làm được việc này?** → Dùng tool có sẵn, mở rộng nếu thiếu chút ít
2. **Cần kết nối hệ thống ngoài, nhiều ứng dụng hay nhiều đội cùng dùng?** → MCP server
3. **Là kiến thức, quy trình, tài liệu tham khảo?** → Skill, nạp khi cần
4. **Chỉ một ứng dụng cần, gắn với nghiệp vụ riêng?** → Tool tự viết
- **Còn lại** → Kết hợp: MCP để kết nối, skill để dạy cách dùng

> **Bẫy đề**
>
> Hai câu luyện thi về tiêu chí chọn. Chọn giữa tool có sẵn, tool tự viết, skill, MCP server: đúng là **cách khớp với phạm vi, nhu cầu dùng lại và bối cảnh tích hợp của việc**; sai là cách đội quen nhất, cách mới nhất, hay cách dễ làm nhất. Năng lực cần dùng lại ở nhiều đội, mỗi đội dùng độc lập: đúng là **làm thành skill hoặc MCP server**; sai là tool riêng của một đội cho đội khác chép, thư viện dùng chung mỗi đội tự cập nhật, hay bọc quanh một tool có sẵn.

> **Ý chính**
>
> Có sẵn thì dùng tool có sẵn; nghiệp vụ riêng một ứng dụng thì tool tự viết; kiến thức và quy trình thì skill, nạp dần nên rẻ context; kết nối hệ thống ngoài cho nhiều ứng dụng thì MCP server. MCP và skill thường đi cùng nhau: một bên kết nối, một bên dạy cách dùng.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 8](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [How tool use works (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
3. [Agent Skills overview (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
4. [Extend Claude Code - features overview (Claude Code Docs)](https://code.claude.com/docs/en/features-overview)
5. [Extend Claude with skills (Claude Code Docs)](https://code.claude.com/docs/en/skills)
6. [Custom tools in the Agent SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/custom-tools)
7. [Code execution with MCP (Anthropic Engineering)](https://www.anthropic.com/engineering/code-execution-with-mcp)
