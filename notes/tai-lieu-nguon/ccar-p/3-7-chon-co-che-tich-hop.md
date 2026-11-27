---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-7-chon-co-che-tich-hop
ngay_tai: 2026-11-27
tieu_de: Chọn cơ chế tích hợp MCP, API/CLI hay agent-to-agent
---

Domain 3: Integration · Task 3.7

# Chọn cơ chế tích hợp MCP, API/CLI hay agent-to-agent

Khi nào gọi thẳng API, khi nào dựng MCP server, khi nào giao việc cho một agent khác, khi nào dùng Skill, và gắn MCP vào Claude Code, Messages API ra sao.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 9 nguồn

## Đọc xong bạn nắm được

- So sánh gọi API trực tiếp, MCP server và giao việc cho agent khác theo ai bảo trì và khi nào đáng
- Nắm MCP chuẩn hoá những gì, gồm vai trò, ba loại khả năng của server và hai kiểu truyền
- Biết giới hạn của MCP connector trên Messages API so với Claude Code
- Phân biệt khi nào dùng Skill, khi nào dùng MCP

Muốn Claude dùng được một hệ thống bên ngoài, có nhiều cách nối: viết một tool gọi thẳng API, dựng một MCP server, hay để một agent khác lo hệ thống đó rồi giao việc cho nó. Cách nào cũng chạy được. Cái khác nhau là ai phải bảo trì, dùng lại được ở đâu, và tốn thêm bao nhiêu độ trễ.

Bài này giúp bạn trả lời: với một hệ thống cụ thể, chọn cơ chế tích hợp nào?

## Ví dụ xuyên suốt: một hãng hàng không giá rẻ

Một hãng hàng không đang tích hợp Claude với bốn thứ:

1. **Dịch vụ báo giá vé** nội bộ: đã có HTTP API ổn định, mỗi lần gọi độc lập, cần trả về nhanh.
2. **Hệ thống đặt chỗ**: cần dùng từ nhiều nơi, gồm Claude Code của đội kỹ thuật, trợ lý chăm sóc khách hàng viết bằng Messages API, và ứng dụng nội bộ của đội vận hành.
3. **Hệ thống khách sạn của đối tác**: đối tác đã có agent riêng, tự quyết cách tìm và giữ phòng.
4. **Quy trình soạn thông báo chuyến bay bị huỷ**: các bước cố định, có mẫu câu và ví dụ, không cần gọi hệ thống nào.

## Ba cơ chế chính

| Cơ chế | Ai bảo trì | Hợp khi | Trong ví dụ |
| --- | --- | --- | --- |
| Gọi API trực tiếp (tool tự định nghĩa, hoặc lệnh CLI) | Ứng dụng của bạn | Một lời gọi độc lập, nhạy về độ trễ, API đã có sẵn | Báo giá vé |
| MCP server | Đội sở hữu hệ thống, viết một lần | Cần dùng lại ở nhiều client AI, cần chuẩn hoá cách truy cập | Hệ thống đặt chỗ |
| Giao việc cho agent khác (agent-to-agent) | Bên sở hữu agent đó | Việc cần phán đoán, tool và context riêng của một bên chuyên trách | Khách sạn của đối tác |

Docs của Anthropic nói các tool khác nhau chủ yếu ở chỗ code chạy ở đâu: tool bạn định nghĩa thì bạn viết schema và ứng dụng của bạn chạy từng lời gọi.

> **Trong đề chọn gì**
>
> Câu luyện thi: chọn cơ chế cho **một** lời gọi tool độc lập, độ trễ thấp, tới một dịch vụ báo giá nội bộ đã có HTTP API ổn định. Đáp án: gọi thẳng endpoint có sẵn với credential đúng phạm vi. Các đáp án sai thêm lớp không cần: giao thức phiên dài có trạng thái cho một lời gọi không trạng thái, giao thức streaming tự chế đặt trên một hàng đợi không liên quan, chèn một agent Claude khác đứng trước dịch vụ.

Câu luyện thi cũng chấm hai yếu tố **nên** quyết định lựa chọn: tích hợp có cần **dùng được trên nhiều client AI** không (giá trị chính của MCP là chuẩn hoá và dùng lại), và tương tác **không trạng thái, nhạy về độ trễ** hay **có trạng thái, chạy lâu**. Những yếu tố như nhà cung cấp có tài liệu chi tiết không, đội đã từng làm chưa, hay đường truyền có mã hoá không thì không phân biệt được các lựa chọn (mã hoá là bắt buộc với cả ba).

**Sơ đồ**
- Trung tâm: **MCP server đặt chỗ**: đội sở hữu hệ thống viết một lần
- **Claude Code**: của đội kỹ thuật
- **Trợ lý chăm sóc khách hàng**: viết bằng Messages API
- **Ứng dụng nội bộ**: của đội vận hành

_Viết một lần, nhiều client AI dùng lại. Chỉ một client gọi một API thì chưa cần tới lớp này_

## MCP chuẩn hoá những gì

Theo đặc tả MCP (**Model Context Protocol**):

- **Vai trò**: ứng dụng chủ (**host**, như Claude Code) tạo nhiều client, mỗi client nối 1-1 với một **server**. Host kiểm soát quyền và áp chính sách đồng ý. Server không đọc được toàn bộ hội thoại, và không nhìn được vào các server khác.

**Sơ đồ**
1. **Host**: như Claude Code, kiểm soát quyền và áp chính sách đồng ý
   ↓ _tạo nhiều client_
2. **Client 1** **|** **Client 2** **|** **Client 3**
   ↓ _mỗi client nối 1-1 với một server_
3. **Server đặt chỗ** **|** **Server B** **|** **Server C**

- **Ba loại khả năng của server**, khác nhau ở chỗ ai điều khiển:

| Loại | Ai điều khiển | Ví dụ |
| --- | --- | --- |
| Tools | Model tự quyết khi nào gọi | `tim_chuyen_bay`, `giu_cho` |
| Resources | Ứng dụng quyết định đưa gì vào context | Sơ đồ ghế của một chuyến bay |
| Prompts | Người dùng chọn dùng | Mẫu "đổi chuyến cho khách" |

- **Hai kiểu truyền chuẩn**: **stdio** (client khởi chạy server như một tiến trình con trên cùng máy) và **Streamable HTTP** (server chạy độc lập, có một endpoint HTTP). Kiểu HTTP+SSE cũ đã bị thay thế.

## Gắn MCP vào đâu

| Nơi dùng | Cách gắn | Giới hạn cần nhớ |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http <tên> <url>` cho server từ xa; server stdio thì đưa lệnh chạy sau `--` | Phạm vi `local` (mặc định), `project` (file `.mcp.json`, Claude Code hỏi duyệt trước khi dùng), `user` |
| Messages API | **MCP connector**: khai báo `mcp_servers` và một `mcp_toolset` trong `tools` (beta) | Chỉ server từ xa qua HTTPS, chỉ hỗ trợ tool (không có resources, prompts), không nối được server stdio chạy cục bộ; bạn tự lo OAuth rồi truyền token |
| Managed Agents | Khai báo MCP server trên agent, credential cấp qua vault |   |

> **Bẫy đề**
>
> Muốn Messages API gọi một MCP server đang chạy stdio trên máy của một kỹ sư: MCP connector không làm được, vì nó chỉ nối server từ xa qua HTTPS. Phải đưa server lên thành dịch vụ HTTP truy cập được. Và nếu cần resources hay prompts của server, connector không đủ; cần một MCP client đầy đủ phía ứng dụng.

## Khi nào giao cho agent khác

Giao cho agent khác hợp khi phần việc cần **phán đoán riêng**, **tool riêng** và **context riêng** của một bên chuyên trách: agent khách sạn của đối tác tự biết cách tìm phòng, giữ phòng theo chính sách của họ. Cái giá là thêm một lượt model (và độ trễ) cho mỗi lần giao, và thêm một chỗ có thể hiểu sai yêu cầu.

Docs của Anthropic không định nghĩa một giao thức agent-to-agent riêng; trong hệ sinh thái Claude, giao việc cho agent khác thường là subagent trong Agent SDK, hoặc tính năng nhiều agent của Managed Agents. Ở Managed Agents (beta), việc giao chỉ sâu một cấp: agent chính giao cho agent con, còn agent con không giao lại việc cho agent nào khác; các agent dùng chung sandbox và hệ thống file nhưng có lịch sử hội thoại riêng.

## Skill hay MCP

Quy trình soạn thông báo chuyến bay huỷ không cần gọi hệ thống nào: nó là **kiến thức thủ tục** (các bước, mẫu câu, ví dụ). Đóng gói thành Agent Skill hợp hơn MCP server. MCP sinh ra để **nối** với hệ thống bên ngoài đang chạy.

> **Bẫy đề**
>
> Câu luyện thi: khả năng soạn hồ sơ theo một quy trình cố định có ví dụ, không cần gọi hệ thống bên ngoài, phải dùng được trên claude.ai, một tích hợp API nội bộ và Claude Code. Yếu tố nghiêng mạnh nhất về Skill: đây là kiến thức thủ tục, không cần gọi hệ thống đang chạy. Các đáp án sai mô tả đúng những thứ cần MCP: truy vấn cơ sở dữ liệu trực tiếp, xác thực với hệ thống danh tính của công ty. Lưu ý thêm: docs nói Skill tự tạo không tự đồng bộ giữa các nền tảng, nên dùng trên ba nơi thì phải đưa lên từng nơi.

Bốn thứ của hãng hàng không đặt cạnh nhau:

**Sơ đồ**
1. **Báo giá vé**: một lời gọi độc lập, cần nhanh **|** **Đặt chỗ**: dùng từ nhiều client AI **|** **Khách sạn đối tác**: cần phán đoán riêng **|** **Thông báo chuyến huỷ**: quy trình cố định
   ↓ _chọn cơ chế_
2. **Gọi API trực tiếp** **|** **MCP server** **|** **Giao cho agent khác** **|** **Agent Skill**

> **Ý chính**
>
> Một lời gọi đơn giản tới API có sẵn thì gọi thẳng. Cần dùng lại ở nhiều client AI thì dựng MCP server. Việc cần phán đoán của một bên chuyên trách thì giao cho agent khác. Kiến thức thủ tục không cần hệ thống sống thì đóng gói thành Skill.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [MCP specification, Architecture (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/architecture)
3. [MCP specification, Server features (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/server)
4. [MCP specification, Transports (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
5. [MCP connector (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
6. [Connect Claude Code to tools via MCP (Claude Code Docs)](https://code.claude.com/docs/en/mcp)
7. [Tool use overview (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
8. [Multiagent orchestration (Claude Managed Agents)](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration)
9. [Agent Skills overview (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
