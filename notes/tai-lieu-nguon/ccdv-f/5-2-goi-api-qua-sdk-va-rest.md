---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/5-2-goi-api-qua-sdk-va-rest
ngay_tai: 2026-11-27
tieu_de: Gọi Claude qua REST và SDK - endpoint, header, phản hồi, WebSocket
---

Domain 5: Model Selection and Optimization · Task 5.2

# Gọi Claude qua REST và SDK - endpoint, header, phản hồi, WebSocket

Các endpoint của Claude API, header một lời gọi HTTP thô phải có, SDK làm thêm gì trên REST, đọc phản hồi và lỗi, và khi nào dùng SSE hay WebSocket.

- 6 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Kể được các endpoint chính của Claude API và phương thức HTTP của từng cái
- Biết header nào một lời gọi HTTP thô phải gửi, và SDK gửi giúp những gì
- Ghép một hàm SDK với endpoint REST nó bọc, và dùng sẵn thử lại, phân trang, lỗi có kiểu của SDK
- Đọc chiều về - header request-id, dạng JSON của lỗi, giới hạn kích thước yêu cầu
- Chọn giữa hỏi định kỳ, SSE và WebSocket cho kết nối thời gian thực

SDK của Claude chỉ là một lớp bọc quanh một REST API. Hiểu lớp bên dưới giúp bạn đọc lỗi, gỡ rối khi SDK báo điều lạ, và gọi được Claude từ ngôn ngữ chưa có SDK. Đề thi gọi nhóm kiến thức này là nền tảng kỹ thuật (**technical fundamentals**): tích hợp với SDK bọc REST API, và WebSocket.

Bài này giúp bạn trả lời: một lời gọi Claude trông thế nào ở tầng HTTP, SDK làm thêm gì cho bạn, và khi nào cần WebSocket?

## Ví dụ xuyên suốt: hệ thống bãi đỗ xe của một toà văn phòng

Một công ty quản lý bãi đỗ xe 4 tầng hầm cho các toà văn phòng. Cảm biến ở mỗi chỗ đỗ đẩy trạng thái trống hay có xe về một service trung tâm theo thời gian thực. Công ty muốn thêm:

- Trợ lý trong ứng dụng cho tài xế hỏi "tầng B2 còn chỗ cho xe 7 chỗ không?".
- Một script Python hằng đêm gửi tóm tắt mức lấp đầy cho ban quản lý toà nhà.
- Một dịch vụ viết bằng ngôn ngữ chưa có SDK chính thức, phải gọi API trực tiếp.

## Các endpoint dưới một base URL

Claude API là REST API ở `https://api.anthropic.com`. Các API chính:

| API | Endpoint |
| --- | --- |
| Messages | `POST /v1/messages` |
| Message Batches | `POST /v1/messages/batches` |
| Token Counting | `POST /v1/messages/count_tokens` |
| Models | `GET /v1/models` |
| Files | `POST /v1/files`, `GET /v1/files` |
| Skills | `POST /v1/skills`, `GET /v1/skills` |
| Agents, Sessions, Environments (Managed Agents, beta) | `/v1/agents`, `/v1/sessions`, `/v1/environments` |

## Header mà một lời gọi HTTP thô phải có

Dịch vụ không có SDK phải tự gửi đủ header:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2026-10-21" \
  -H "content-type: application/json" \
  -d '{"model": "claude-haiku-5-5", "max_tokens": 300, "messages": [{"role": "user", "content": "..."}]}'
```

| Header | Ghi chú |
| --- | --- |
| `Authorization: Bearer <token>` | Khoá API hoặc token ngắn hạn. Header cũ `x-api-key` vẫn được nhận |
| `anthropic-version` | Bắt buộc; quyết định hành vi API (bài 2.2) |
| `content-type: application/json` | Bắt buộc |
| `anthropic-workspace-id` | Cần khi khoá API không gắn với một workspace |
| `anthropic-beta` | Khi dùng tính năng beta, ví dụ `managed-agents-2026-04-01` |

## SDK làm thêm gì trên REST

Anthropic có SDK chính thức cho Python, TypeScript, C#, Go, Java, PHP và Ruby. Trang tổng quan API liệt kê những gì SDK lo giúp:

- Gửi header xác thực, `anthropic-version`, `content-type`.
- Kiểu dữ liệu cho yêu cầu và phản hồi.
- Thử lại có sẵn (mặc định 2 lần, chờ tăng dần) và xử lý lỗi bằng exception có kiểu: `RateLimitError` cho 429, `APIConnectionError` khi không kết nối được, `APIStatusError` cho các mã lỗi khác.
- Hỗ trợ streaming, timeout, quản lý kết nối.
- Tự phân trang khi duyệt danh sách: `for batch in client.messages.batches.list(limit=20)` tự gọi tiếp các trang sau.

**Sơ đồ**
1. **Code của bạn**: client.messages.create()
2. **SDK**: header, thử lại, phân trang, exception có kiểu
   _(yêu cầu HTTPS gửi JSON, nhận JSON)_
3. **REST API**: POST /v1/messages ở api.anthropic.com

_Dịch vụ không có SDK thì bỏ lớp giữa, tự làm những việc đó_

Mỗi hàm SDK ứng với một endpoint:

| Hàm trong SDK Python | Endpoint |
| --- | --- |
| `client.messages.create()` | `POST /v1/messages` |
| `client.messages.count_tokens()` | `POST /v1/messages/count_tokens` |
| `client.messages.batches.create()` | `POST /v1/messages/batches` |
| `client.models.list()` | `GET /v1/models` |

Script Python hằng đêm nên dùng SDK, đừng tự viết lại thử lại, phân trang hay đọc lỗi.

> **Trong đề chọn gì**
>
> Câu luyện thi: tích hợp Claude vào ứng dụng Python, SDK có client Python bọc REST API. Chọn **dùng SDK Python của Claude và để nó lo xác thực, thử lại, đọc phản hồi theo cách docs hướng dẫn**. Sai: gọi REST thô để tránh lớp trừu tượng; dùng SDK của nhà cung cấp LLM khác rồi chuyển đổi; gọi Claude qua lệnh shell từ Python.

## Chiều về: request-id, lỗi và giới hạn kích thước

Mỗi phản hồi có header `request-id` (dạng `req_018E…`); SDK Python đưa nó ra thành `message._request_id`. Ghi giá trị này vào log, và gửi kèm khi liên hệ hỗ trợ về một yêu cầu cụ thể.

Lỗi luôn là JSON có `type: "error"`, một object `error` với `type` và `message`, và `request_id`. Docs nói các giá trị `type` có thể được thêm theo thời gian, nên code nên có nhánh mặc định cho loại lỗi lạ.

Giới hạn kích thước yêu cầu trên Claude API: 128 MB cho Messages và Token Counting, 256 MB cho Message Batches, 32 MB cho Sessions, Agents, Environments. Vượt quá thì nhận 413 (bài 4.1).

## SSE hay WebSocket

Streaming của Claude API dùng server-sent events (SSE): một kết nối HTTP, máy chủ đẩy sự kiện về một chiều cho tới khi xong câu trả lời (bài 2.3). Đó là đủ cho việc hiện câu trả lời dần dần.

Nhưng trạng thái chỗ đỗ là một luồng không bao giờ kết thúc, và đôi khi trợ lý còn cần gửi lệnh ngược lại (giữ chỗ). Đó là việc của **WebSocket**: một kết nối mở lâu dài, truyền hai chiều, có khung thông điệp chuẩn.

**Sơ đồ**
1. **Câu trả lời của Claude**: xong là dừng **|** **Trạng thái chỗ đỗ**: không bao giờ kết thúc, có lệnh giữ chỗ ngược lại
   ↓ _mỗi loại một đường_
2. **SSE**: máy chủ đẩy một chiều, trong một yêu cầu **|** **WebSocket**: kết nối mở lâu dài, hai chiều

| Cách | Hợp khi |
| --- | --- |
| Hỏi định kỳ (polling) bằng HTTP ngắn | Dữ liệu ít đổi, không cần tức thì |
| SSE | Máy chủ đẩy một chiều trong thời gian một yêu cầu, như streaming câu trả lời của Claude |
| WebSocket | Kết nối bền, hai chiều, thời gian thực |

Docs của Claude cũng nhắc WebSocket ở vài chỗ: khi host Agent SDK trong container, container mở một endpoint HTTP hoặc WebSocket và gắn mỗi phiên đang chạy với một tiến trình agent; trong Claude Code, tool `Monitor` có thể mở một WebSocket và coi mỗi thông điệp đến là một sự kiện để Claude phản ứng.

> **Bẫy đề**
>
> Câu luyện thi: ứng dụng cần giữ kết nối bền tới một dịch vụ đẩy cập nhật thời gian thực. Đúng là **WebSocket, vì được thiết kế cho giao tiếp hai chiều, bền, thời gian thực**. Sai: mở kết nối HTTP ngắn liên tục để hỏi; một yêu cầu HTTP dài giữ mở mãi không có khung chuẩn; ghi file rồi đọc file định kỳ.

> **Ý chính**
>
> Claude API là REST ở `api.anthropic.com`, cần header xác thực, `anthropic-version` và `content-type`. SDK chính thức lo header, thử lại, phân trang, lỗi có kiểu, nên dùng SDK khi có. Ghi `request-id` vào log. Streaming của Claude là SSE một chiều; kết nối bền hai chiều thì dùng WebSocket.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [API overview (Claude API Docs)](https://platform.claude.com/docs/en/api/overview)
3. [SDKs, CLI, and libraries (Claude API Docs)](https://platform.claude.com/docs/en/cli-sdks-libraries/overview)
4. [Python SDK (Claude API Docs)](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python)
5. [Claude API errors (Claude API Docs)](https://platform.claude.com/docs/en/api/errors)
6. [Streaming messages (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/streaming)
7. [Hosting the Agent SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/hosting)
8. [Tools reference (Claude Code Docs)](https://code.claude.com/docs/en/tools-reference)
