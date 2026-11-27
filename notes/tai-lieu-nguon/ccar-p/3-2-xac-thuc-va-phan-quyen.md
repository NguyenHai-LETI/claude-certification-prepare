---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-2-xac-thuc-va-phan-quyen
ngay_tai: 2026-11-27
tieu_de: Phân tích xác thực và phân quyền để tìm lỗ hổng
---

Domain 3: Integration · Task 3.2

# Phân tích xác thực và phân quyền để tìm lỗ hổng

Tìm lỗ hổng xác thực và phân quyền khi dùng Claude, gồm danh tính từng người, kiểm quyền trước khi dữ liệu tới model, credential ngoài prompt, OAuth cho MCP.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Phân biệt xác thực (ai đang gọi) với phân quyền (được làm gì), và biết vì sao key dùng chung là lỗ hổng
- Đặt kiểm soát truy cập theo vai trò ở tầng truy xuất, trước khi dữ liệu tới model
- Giữ credential ngoài context của model và ghi lại ai đã khởi tạo mỗi lần gọi tool
- Nắm luồng uỷ quyền OAuth của MCP qua HTTP, gắn token với đúng server, và không chuyển tiếp token

Khi một agent đọc dữ liệu và gọi tool thay cho người dùng, câu hỏi bảo mật không còn đơn giản là "đăng nhập chưa". Phải hỏi: agent đang hành động thay cho ai, người đó được thấy gì, và token nào đang đi tới đâu. Phần lớn lỗ hổng nằm ở chỗ trả lời sai một trong ba câu đó.

Bài này giúp bạn trả lời: đọc một bản thiết kế, làm sao nhận ra lỗ hổng xác thực (**authentication**) và phân quyền (**authorization**), và sửa ở đâu?

## Ví dụ xuyên suốt: trợ lý nội bộ của một công ty bất động sản

Một công ty bất động sản làm trợ lý dùng Claude cho hai nhóm người:

- **Nhân viên kinh doanh** của công ty: xem giá sàn, hợp đồng, thông tin khách trong CRM.
- **Môi giới bên ngoài** (đối tác): chỉ xem bảng giá công khai và tình trạng căn hộ của dự án mình được phân phối.

Trợ lý truy xuất tài liệu từ kho hợp đồng, và gọi CRM qua một MCP server chạy trên HTTP. Bản thiết kế đầu tiên có những dòng sau:

1. Mọi người dùng chung một API key để gọi CRM.
2. Key CRM được đặt trong system prompt "để Claude tự gọi".
3. Trợ lý truy xuất mọi tài liệu khớp câu hỏi, rồi lọc bỏ nội dung môi giới không được xem ở bước hiển thị câu trả lời.
4. Log gọi tool ghi tên tool và tham số, không ghi ai yêu cầu.

## Hai câu hỏi: ai đang gọi, và được làm gì

Xác thực trả lời "ai". Phân quyền trả lời "được làm gì". Dòng 1 và dòng 4 làm hỏng câu "ai":

- Key dùng chung nghĩa là CRM chỉ thấy một danh tính duy nhất cho mọi người. Không phân quyền theo người được, không thu hồi quyền của một người được.
- Log không ghi người khởi tạo thì khi có sự cố, không truy được ai đã yêu cầu hành động đó.

> **Trong đề chọn gì**
>
> Câu luyện thi: kiểm toán phát hiện (1) mọi người dùng chung một API key, (2) lời gọi tool không ghi người khởi tạo. Hai biện pháp nhắm đúng: thay key dùng chung bằng **token OAuth theo từng người** có phạm vi quyền hẹp, và thêm **người khởi tạo** (actor attribution) vào log gọi tool. Các biện pháp tốt nhưng không nhắm đúng hai phát hiện này (kiểm schema đầu ra, kiểm quyền ở tầng truy xuất, chuyển credential ra kho bí mật) là đáp án sai cho câu đó.

## Kiểm quyền trước khi dữ liệu tới model

Dòng 3 là lỗi thứ tự. Khi tài liệu môi giới không được xem đã được truy xuất, nó đã nằm trong context của Claude: có thể lộ qua câu trả lời, qua suy luận, hay bị một prompt injection moi ra. Lọc ở bước hiển thị là quá muộn.

Chỗ đúng để áp kiểm soát truy cập theo vai trò (**RBAC**) là **tầng truy xuất**: truy vấn chỉ trả về tài liệu mà vai trò của người hỏi được xem, trước khi bất cứ thứ gì được đưa vào prompt.

**Sơ đồ**
1. **Thiết kế đầu tiên**: truy xuất mọi tài liệu khớp câu hỏi **|** **Thiết kế đúng**: truy vấn chỉ trả về tài liệu vai trò người hỏi được xem
   ↓ _đưa vào prompt_
2. **Tài liệu môi giới không được xem đã nằm trong context** **|** **Context chỉ có tài liệu được phép**
   ↓ _kết quả_
3. **Lọc ở bước hiển thị là quá muộn, vẫn có thể lộ** **|** **Claude không đọc được thứ người hỏi không được xem**

> **Bẫy đề**
>
> Với trợ lý phục vụ hai nhóm có quyền khác nhau, câu luyện thi đưa các chỗ đặt RBAC sai: viết thành câu dặn trong system prompt để Claude bỏ qua tài liệu không được phép; lọc sau khi đã sinh câu trả lời; không đặt ở đâu, trông vào việc model tự từ chối. Chỉ có đặt ở tầng truy xuất, trước khi nội dung tới bước dựng prompt hay tới model, là đúng.

## Credential không được nằm trong prompt

Dòng 2 là lỗ hổng rõ nhất: credential trong context của model có thể lọt vào log, trace, hay bị lộ qua câu trả lời. Docs của Anthropic về chống prompt injection cũng khuyên giới hạn quyền truy cập dữ liệu và hành động của Claude.

Cách làm đúng: Claude chỉ đưa ra yêu cầu gọi tool; **code của bạn** chạy lời gọi đó ở phía server, lấy credential từ kho bí mật, dưới một danh tính có quyền tối thiểu cho đúng hành động, hoặc bằng token của chính người dùng. Với MCP connector của Messages API, bạn truyền `authorization_token` cho server; docs nói bạn phải tự xử lý luồng OAuth và lấy access token trước khi gọi API.

**Sơ đồ**
1. **Claude**: chỉ đưa ra yêu cầu gọi tool, không cầm credential
   ↓ _yêu cầu chuyển sang phía server_
2. **Code của bạn**: lấy credential từ kho bí mật, dùng danh tính quyền tối thiểu hoặc token của người dùng
   ↓ _gọi CRM_
3. **CRM**: thấy đúng danh tính, phân quyền và ghi log được theo từng người

| Trong bản thiết kế | Lỗ hổng hay thực hành tốt? |
| --- | --- |
| Credential dịch vụ nằm trong prompt | Lỗ hổng: lộ qua log và trace |
| RBAC chỉ áp ở tầng hiển thị câu trả lời | Lỗ hổng: model đã đọc dữ liệu bị hạn chế |
| Tool chạy phía server dưới danh tính có quyền tối thiểu cho đúng hành động | Thực hành tốt |
| Token OAuth theo từng người, phạm vi hẹp, làm mới trong phiên | Thực hành tốt |
| Mã hoá đầu vào và đầu ra tool khi truyền giữa các dịch vụ | Thực hành tốt |

## Uỷ quyền cho MCP server chạy trên HTTP

MCP server của CRM chạy qua HTTP, nên áp phần uỷ quyền của đặc tả MCP. Server chạy cục bộ qua STDIO thì không theo phần này; đặc tả nói chúng lấy credential từ môi trường.

Những điểm chính của đặc tả (bản 2026-07-28):

1. **Dựa trên OAuth 2.1.** Client gọi server chưa có token thì nhận **401** kèm header `WWW-Authenticate` chỉ tới tài liệu metadata của server, từ đó tìm ra authorization server.
2. **PKCE bắt buộc**, dùng phương thức `S256`; authorization server không công bố hỗ trợ PKCE thì client phải dừng.
3. **Đăng ký client** theo thứ tự ưu tiên: thông tin đăng ký sẵn, rồi Client ID Metadata Document, rồi Dynamic Client Registration (đã bị đánh dấu lỗi thời), cuối cùng mới hỏi người dùng nhập.
4. **Token gắn với đúng một server.** Client gửi tham số `resource` là URI chuẩn của MCP server khi xin token; server phải kiểm token được cấp **cho chính nó**.
5. **Không chuyển tiếp token** (**token passthrough**). MCP server không được lấy token nhận từ client đem gọi API phía sau. Gọi API phía sau phải dùng một token riêng do authorization server của API đó cấp. Tài liệu bảo mật của MCP giải thích: chuyển tiếp token làm vô hiệu các kiểm soát an ninh, làm hỏng việc kiểm toán (không phân biệt được client nào gọi), và phá ranh giới tin cậy.
6. **401 khác 403.** 401 là chưa xác thực hoặc token hỏng, phải xác thực lại. 403 với `insufficient_scope` là token hợp lệ nhưng thiếu quyền; client xin thêm quyền (step-up) với tập scope gộp cả cũ và mới, có giới hạn số lần thử. Đăng nhập lại y như cũ sẽ chỉ nhận lại đúng tập quyền cũ.
7. **Scope tối thiểu.** Tài liệu bảo mật khuyên mô hình quyền tăng dần theo nhu cầu, tránh scope "bao trùm mọi thứ".

Ghép điểm 1, 2 và 4 lại, client lấy được token như sau:

**Sơ đồ**
1. **Client gọi MCP server, chưa có token**
   ↓ _401 kèm WWW-Authenticate chỉ tới tài liệu metadata_
2. **Tài liệu metadata của server**: cho biết authorization server nào
   ↓ _xin token, dùng PKCE S256, gửi resource là URI của MCP server_
3. **Authorization server**: cấp token gắn với đúng server đó
   ↓ _gọi lại kèm token_
4. **MCP server**: kiểm token được cấp cho chính nó

Điểm 5 nằm ở chặng sau đó, khi MCP server phải gọi tiếp xuống API:

**Sơ đồ**
1. **Client của trợ lý**
   ↓ _token A, cấp cho MCP server_
2. **MCP server CRM**: không đem token A đi gọi tiếp
   ↓ _token B, do authorization server của API phía sau cấp_
3. **API CRM phía sau**

Điểm 6 thì chỉ cần nhìn mã lỗi:

1. **Nhận 401?** → Chưa xác thực hoặc token hỏng: xác thực lại
2. **Nhận 403 với insufficient_scope?** → Token hợp lệ nhưng thiếu quyền: xin thêm quyền với tập scope gộp cả cũ và mới
- **Còn lại** → Đăng nhập lại y như cũ khi thiếu quyền thì chỉ nhận lại đúng tập quyền cũ

> **Bẫy đề**
>
> Token do cùng một authorization server cấp không có nghĩa là dùng được cho mọi MCP server. Mỗi token gắn với một server qua tham số `resource`, và server phải từ chối token không cấp cho nó.

Trong Claude Code, server từ xa cần đăng nhập thì xác thực qua lệnh `/mcp`; tổ chức có thể quản lý tập trung danh sách MCP server được phép bằng cấu hình managed.

> **Ý chính**
>
> Mỗi lời gọi phải mang danh tính của người khởi tạo và được ghi lại. Kiểm quyền ở tầng truy xuất, giữ credential ngoài prompt, gắn token với đúng một server và không bao giờ chuyển tiếp token.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [MCP specification, Authorization (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
3. [MCP specification, Security considerations (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)
4. [MCP security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)
5. [MCP connector (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
6. [Connect Claude Code to tools via MCP (Claude Code Docs)](https://code.claude.com/docs/en/mcp)
7. [Mitigate jailbreaks and prompt injections (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
