---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/8-2-viet-mcp-server
ngay_tai: 2026-11-27
tieu_de: Viết MCP server - host, client, server, ba primitive và hai cách giao tiếp
---

Domain 8: Tools and MCPs · Task 8.2

# Viết MCP server - host, client, server, ba primitive và hai cách giao tiếp

Vai trò host, client, server trong MCP, ba thứ một server cung cấp (tool, resource, prompt), chọn stdio hay Streamable HTTP, và đưa server tới nhiều ứng dụng.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 9 nguồn

## Đọc xong bạn nắm được

- Mô tả vai trò của host, client và server, và cách server khai báo năng lực
- Định nghĩa tool, resource, prompt và biết ai điều khiển từng loại
- Phân biệt lỗi giao thức với lỗi khi chạy tool
- Chọn stdio hay Streamable HTTP, và giữ stdout của server stdio sạch
- Triển khai một server để Claude Code, Claude API và các ứng dụng khác cùng dùng

Một tool viết riêng cho một ứng dụng thì chỉ ứng dụng đó dùng được. Khi nhiều ứng dụng Claude cùng cần một năng lực, như tra danh mục sách hay tồn kho, cách chuẩn là đóng gói nó thành một MCP server: viết một lần, bảo trì một chỗ, ứng dụng nào nói được giao thức MCP cũng kết nối được.

Bài này giúp bạn trả lời: một MCP server gồm những gì, chạy theo cách nào, và đưa nó tới các ứng dụng Claude ra sao?

## Ví dụ xuyên suốt: MCP server của mạng lưới thư viện tỉnh

Mười thư viện công cộng của một tỉnh dùng chung một hệ thống quản lý sách có REST API nội bộ. Ba nơi muốn dùng dữ liệu này với Claude:

1. Chatbot trên website giúp bạn đọc tìm sách, chạy bằng Claude API.
2. Đội phát triển dùng Claude Code để viết báo cáo mượn trả.
3. Thủ thư dùng ứng dụng desktop của Claude để soạn danh sách sách gợi ý theo chủ đề.

Thay vì mỗi nơi tự viết tool gọi REST API, đội làm một MCP server `thu-vien`.

## Host, client và server

Đặc tả MCP mô tả ba vai trò:

| Vai trò | Là gì | Trong ví dụ |
| --- | --- | --- |
| **Host** | Ứng dụng chứa model: tạo và quản lý client, áp chính sách bảo mật, xin đồng ý của người dùng | Claude Code, ứng dụng desktop, ứng dụng chatbot |
| **Client** | Do host tạo, nói chuyện với đúng một server | Mỗi host có một client nối tới `thu-vien` |
| **Server** | Cung cấp tool, resource, prompt; có thể là tiến trình cục bộ hay dịch vụ từ xa | `thu-vien` |

MCP dùng JSON-RPC. Hai bên khai báo năng lực (**capabilities**) mình hỗ trợ: server cho biết có tool, resource, prompt nào, có gửi thông báo khi danh sách đổi không. Theo đặc tả phiên bản 2026-07-28, mỗi yêu cầu mang theo phiên bản giao thức và năng lực của client, và client có thể gọi `server/discover` trước để biết năng lực của server.

## Ba thứ một server cung cấp

| Primitive | Ai điều khiển | Dùng cho | Trong ví dụ |
| --- | --- | --- | --- |
| **Tools** | Model: Claude tự quyết khi nào gọi | Hành động, tra cứu có tham số | `tim_sach(tu_khoa, thu_vien)` |
| **Resources** | Ứng dụng: host quyết định nạp gì vào ngữ cảnh | Dữ liệu định danh bằng URI | Thông tin một cuốn sách ở `sach://{ma_sach}` |
| **Prompts** | Người dùng: thường hiện thành lệnh gạch chéo | Mẫu tin nhắn có tham số | `/goi-y-sach` với tham số độ tuổi và chủ đề |

Một tool khai báo `inputSchema` (JSON Schema của tham số) và có thể có `outputSchema`; kết quả có cấu trúc trả trong `structuredContent`.

```json
{
  "name": "tim_sach",
  "description": "Tìm sách theo từ khoá trong danh mục của một hoặc mọi thư viện. Trả tối đa 20 kết quả kèm số bản còn trên kệ.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tu_khoa": { "type": "string" },
      "thu_vien": { "type": "string", "description": "Mã thư viện, bỏ trống để tìm tất cả" }
    },
    "required": ["tu_khoa"]
  }
}
```

Resource có thể là tĩnh (một URI cụ thể) hoặc theo mẫu (**resource template**, URI có biến như `sach://{ma_sach}`), liệt kê qua `resources/list` và `resources/templates/list`, đọc qua `resources/read`. Prompt liệt kê qua `prompts/list`, lấy nội dung kèm tham số qua `prompts/get`.

Đặc tả chia lỗi của tool làm hai loại:

- **Lỗi giao thức**: tool không tồn tại, yêu cầu sai cấu trúc, lỗi server. Trả về như lỗi JSON-RPC chuẩn; model khó tự sửa.
- **Lỗi khi chạy tool**: API phía sau lỗi, tham số sai định dạng hay ngoài khoảng, lỗi nghiệp vụ. Trả trong kết quả tool với `isError: true`, để model đọc và thử cách khác.

**Sơ đồ**
1. **Tool không tồn tại, yêu cầu sai cấu trúc** **|** **API phía sau lỗi, tham số sai định dạng, lỗi nghiệp vụ**
   ↓ _trả về_
2. **Lỗi JSON-RPC**: model khó tự sửa **|** **Kết quả tool với isError là true**: model đọc và thử cách khác

## Hai cách giao tiếp: stdio và Streamable HTTP

|   | stdio | Streamable HTTP |
| --- | --- | --- |
| Cách chạy | Client khởi động server thành tiến trình con, nói chuyện qua stdin và stdout | Server là một tiến trình độc lập, một endpoint HTTP, phục vụ nhiều client |
| Hợp với | Server chạy cục bộ trên cùng máy với host | Server dùng chung, chạy từ xa |
| Lưu ý | Mỗi dòng một thông điệp JSON-RPC; **stdout chỉ được chứa thông điệp MCP**, log ghi ra stderr | Server phải kiểm header `Origin`; chạy cục bộ thì chỉ lắng nghe ở localhost; cần xác thực |

Lỗi hay gặp với stdio: một câu `print` để gỡ lỗi ghi ra stdout và làm hỏng luồng thông điệp. Mọi log phải đi ra stderr.

**Sơ đồ**
1. **Server stdio**: tiến trình con của client
   ↓ _hai đường ra_
2. **stdout**: chỉ thông điệp JSON-RPC, client đọc **|** **stderr**: log và print gỡ lỗi

> **Trong đề chọn gì**
>
> Câu luyện thi: chọn giữa stdio và HTTP cho một MCP server được gọi bởi phiên Claude Code chạy cục bộ. Chọn **stdio, vì hợp với giao tiếp giữa các tiến trình cục bộ và không phải dựng mạng**. Sai: chạy cả hai cho dự phòng; HTTP vì "luôn tốt hơn"; hỏi định kỳ bằng HTTP thay cho giao thức chuẩn.

## Triển khai và tích hợp

Trong ví dụ, ba host cần ba cách kết nối:

- **Claude Code** (đội phát triển): lúc viết server, chạy cục bộ bằng stdio; sau đó kết nối bản đã triển khai bằng `claude mcp add --transport http thu-vien <url>`. Thêm `--scope project` để ghi vào `.mcp.json` ở gốc repo cho cả đội dùng; mặc định là phạm vi local, chỉ riêng bạn trong dự án đó. Docs Claude Code nói transport SSE đã bị bỏ dần, nên dùng HTTP.
- **Chatbot trên website** (Claude API): dùng MCP connector của Messages API, khai server trong `mcp_servers` và một `mcp_toolset` tương ứng trong `tools` (đang beta). Connector chỉ kết nối được server công khai qua HTTP, không kết nối thẳng server stdio cục bộ, và hiện chỉ hỗ trợ gọi tool.
- **Ứng dụng desktop**: kết nối tới cùng server HTTP.

Vậy để ba nơi dùng chung, server phải được triển khai lên một nơi cả ba truy cập được, bằng Streamable HTTP, có xác thực.

**Sơ đồ**
- Trung tâm: **Server thu-vien**: Streamable HTTP, có xác thực
- **Chatbot website**: Claude API, qua MCP connector
- **Claude Code**: của đội phát triển
- **Ứng dụng desktop**: của thủ thư

_Viết một lần, bảo trì một chỗ, cả ba cùng kết nối tới một server_

> **Bẫy đề**
>
> Câu luyện thi: xây MCP server phơi vài nguồn dữ liệu nội bộ dưới dạng resource, cần triển khai để nhiều ứng dụng Claude tích hợp. Đúng là **viết server với resource, tool, prompt định nghĩa rõ, chọn cách giao tiếp, và triển khai lên môi trường các ứng dụng truy cập được**. Sai: chỉ khai báo cho ứng dụng đầu tiên rồi mở rộng dần; chỉ chạy trên máy từng lập trình viên; bỏ MCP, nhúng nguồn dữ liệu vào từng ứng dụng. Câu hỏi mẫu chính thức của đề thi cùng hướng: dịch vụ tồn kho nội bộ cần dùng lại ở nhiều ứng dụng và bảo trì độc lập thì làm **MCP server phơi các thao tác thành tool**.

> **Ý chính**
>
> Host tạo client, mỗi client nối một server. Server cung cấp tool (model điều khiển), resource (ứng dụng điều khiển), prompt (người dùng điều khiển). Lỗi chạy tool trả `isError: true`, lỗi giao thức là lỗi JSON-RPC. Cục bộ thì stdio và giữ stdout sạch; dùng chung thì Streamable HTTP, triển khai ở nơi mọi ứng dụng truy cập được.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 8](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [MCP specification - Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
3. [MCP specification - Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
4. [MCP specification - Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)
5. [MCP specification - Prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts)
6. [MCP specification - stdio transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio)
7. [MCP specification - Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
8. [Connect Claude Code to tools via MCP (Claude Code Docs)](https://code.claude.com/docs/en/mcp)
9. [MCP connector (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
