---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-8-nap-dan-hay-nap-het
ngay_tai: 2026-11-27
tieu_de: Nạp dần hay nạp hết context
---

Domain 3: Integration · Task 3.8

# Nạp dần hay nạp hết context

So sánh nạp hết định nghĩa tool và hướng dẫn từ đầu với nạp dần khi cần (tool search, Skills, truy xuất đúng lúc), và cách chọn theo số tool, tần suất dùng.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Ước lượng cái giá của việc nạp hết mọi định nghĩa tool vào context
- Hiểu tool search hoạt động thế nào, kể cả việc vẫn phải gửi đủ định nghĩa tool
- Biết khi nào nạp hết từ đầu vẫn là lựa chọn tốt hơn
- Nhận ra Skills và truy xuất đúng lúc cũng là các dạng nạp dần

Có hai cách đưa khả năng vào context của agent. **Nạp hết từ đầu** (**monolithic context**): mọi định nghĩa tool, mọi hướng dẫn đều có mặt ở mọi lượt. **Nạp dần** (**progressive discovery**): ban đầu chỉ có những thứ cốt lõi và cách để tìm thêm, phần còn lại được nạp khi việc cần tới. Không cách nào luôn đúng.

Bài này giúp bạn trả lời: khi nào nạp hết, khi nào nạp dần, và nạp dần bằng công cụ nào?

## Ví dụ xuyên suốt: trợ lý hỗ trợ IT nội bộ của một tập đoàn

Một tập đoàn 8.000 nhân viên làm trợ lý hỗ trợ IT. Trợ lý nối với 6 MCP server (hệ thống ticket, danh bạ nhân sự, giám sát máy chủ, email, kho tài liệu, quản lý thiết bị), tổng cộng 60 tool. Ngoài ra còn 40 quy trình xử lý sự cố viết sẵn (cấp lại mật khẩu, cấp quyền thư mục, xử lý máy in...). Mỗi yêu cầu thường chỉ cần 2 tới 4 tool và một quy trình.

Một nhóm nhỏ khác làm trợ lý tra cứu kho linh kiện với 7 tool, tổng định nghĩa khoảng 1.200 token, gần như yêu cầu nào cũng dùng đủ 7.

## Nạp hết tốn gì

Docs của Anthropic về tool search cho vài con số:

- Một cấu hình nhiều MCP server điển hình (năm server cho quản lý mã nguồn, chat, theo dõi lỗi, giám sát và log) có thể tốn khoảng **55.000 token** định nghĩa tool trước khi Claude làm bất cứ việc gì. Docs Agent SDK ghi khoảng 50 tool tốn 10.000 tới 20.000 token.
- Khả năng chọn đúng tool của Claude **giảm** khi vượt quá khoảng **30 tới 50** tool.

Thêm vào đó, docs về context window nói độ chính xác giảm khi số token tăng (context rot). Context window lớn hơn không sửa được việc chọn sai giữa quá nhiều tool.

Với trợ lý IT, hai cách khác nhau ở chỗ này:

**Sơ đồ**
1. **Nạp hết**: cả 60 định nghĩa có mặt ở mọi lượt **|** **Nạp dần**: chỉ tool cốt lõi và cách để tìm thêm
   ↓ _yêu cầu "cấp lại mật khẩu", chỉ cần 2 tới 4 tool_
2. **Claude chọn giữa 60 tool, context nền lớn ngay từ đầu** **|** **Claude tìm, chỉ nạp thêm đúng tool cần, thêm một lượt đi về**

> **Bẫy đề**
>
> Prompt caching làm phần định nghĩa tool lặp lại rẻ hơn, nhưng không làm nó chiếm ít context hơn và không giúp chọn tool đúng hơn. Cache giải quyết chi phí, nạp dần giải quyết chỗ chiếm và độ phân tán.

## Tool search: nạp tool khi cần

Với tool search tool của Claude API:

1. Đánh dấu `"defer_loading": true` trên các tool không cần nạp sẵn. Tool search tool tự nó không được defer.
2. Claude tìm tool bằng biểu thức regex hoặc bằng câu hỏi tự nhiên (biến thể BM25). Kết quả là các khối `tool_reference`, API tự mở rộng thành định nghĩa đầy đủ cho Claude dùng.
3. Muốn tìm theo nghĩa bằng embedding thì tự viết tool tìm kiếm của mình, trả về các khối `tool_reference`.

**Sơ đồ**
1. **Mảng tools**: gửi đủ mọi định nghĩa, phần lớn đánh dấu defer_loading
   ↓ _chỉ phần không defer vào context: tool search tool và vài tool hay dùng_
2. **Claude gặp việc cần thêm tool**
   ↓ _tìm bằng regex hoặc câu hỏi tự nhiên_
3. **Khối tool_reference**
   ↓ _API tự mở rộng thành định nghĩa đầy đủ_
4. **Claude gọi tool vừa tìm được**

Docs nói tool search thường giảm hơn 85% phần định nghĩa, chỉ nạp 3 tới 5 tool Claude cần. Docs khuyên giữ 3 tới 5 tool **hay dùng nhất** ở dạng không defer, để Claude gọi được ngay mà không phải tìm. Tool được tìm ra được thêm vào hội thoại, không đụng phần đầu prompt, nên prompt cache vẫn giữ.

> **Bẫy đề**
>
> `defer_loading` quyết định cái gì **vào context**, không quyết định cái gì **gửi lên** trong yêu cầu. Bạn vẫn phải gửi đầy đủ định nghĩa của mọi tool, kể cả tool đã defer, trong mảng `tools` ở mọi yêu cầu, vì API cần chúng để tìm và mở rộng `tool_reference`.

Trong Agent SDK, tool search bật mặc định trên các model hỗ trợ, điều khiển bằng biến `ENABLE_TOOL_SEARCH`: để trống hoặc `true` là bật; `auto` chỉ bật khi tổng định nghĩa có thể defer chiếm từ 10% context window (`auto:N` đổi ngưỡng thành N%); `false` là nạp hết. Claude Code cũng mặc định defer tool của MCP server và tìm khi cần.

## Khi nào nạp hết vẫn tốt hơn

Tool search có giá: mỗi lần tìm thêm **một lượt đi về**. Docs nói gọi tool theo cách thường tốt hơn khi có dưới khoảng 10 tool, khi mọi tool đều được dùng ở mọi yêu cầu, hoặc khi định nghĩa rất ngắn. Docs về quản lý context của tool gợi ý thêm tool search khi bộ tool vượt khoảng 20 hoặc khi phần context nền bắt đầu đáng kể.

Áp vào ví dụ:

1. **Dưới khoảng 10 tool, yêu cầu nào cũng dùng gần đủ?** → Nạp hết từ đầu, bật prompt caching (trợ lý kho linh kiện)
2. **Hàng chục tool qua nhiều server, mỗi yêu cầu dùng vài cái?** → Tool search, giữ 3–5 tool hay dùng không defer (trợ lý IT)
3. **Có vài tool gần như lúc nào cũng dùng?** → Để chúng nạp sẵn, defer phần còn lại
- **Còn lại** → Đo bằng bộ test: tỉ lệ chọn đúng tool, token đầu vào và độ trễ, trước và sau khi đổi

> **Trong đề chọn gì**
>
> Câu luyện thi: trợ lý có 60 tool nội bộ trên nhiều mảng nghiệp vụ, nạp mọi định nghĩa mỗi yêu cầu làm tăng token và thời gian tới phản hồi đầu tiên; cần giải quyết mà không mất khả năng. Đáp án: **nạp dần**, đưa ra một tập tool ban đầu đã chọn lọc, các tool khác nạp khi việc cần. Các đáp án sai: thêm một lần gọi model để tóm tắt cả 60 định nghĩa trước mỗi lượt; tăng context rồi vẫn nạp hết; cố định 5 tool cho mọi yêu cầu bất kể có liên quan hay không.

## Nạp dần không chỉ cho tool

- **Agent Skills** là nạp dần cho hướng dẫn: chỉ tên và mô tả (khoảng 100 token mỗi Skill) luôn nằm trong context, nội dung `SKILL.md` nạp khi Skill được kích hoạt, file phụ nạp khi cần. 40 quy trình IT đóng gói thành 40 Skill thì mỗi yêu cầu chỉ trả giá cho phần metadata cộng một quy trình đang dùng, thay vì cả 40.
- **Truy xuất đúng lúc** là nạp dần cho dữ liệu: agent giữ định danh nhẹ (đường dẫn, câu truy vấn) và nạp nội dung bằng tool khi cần (bài 3.6). Bài viết về context engineering của Anthropic nói cách này chậm hơn dữ liệu tính sẵn, và gợi ý kết hợp: nạp sẵn những gì gần như yêu cầu nào cũng cần, phần còn lại tìm khi cần.

> **Ý chính**
>
> Ít tool và tool nào cũng dùng thì nạp hết và cache. Nhiều tool, mỗi lần dùng vài cái thì nạp dần bằng tool search, giữ vài tool hay dùng luôn sẵn. Hướng dẫn dài và nhiều thì đóng gói thành Skill.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Tool search tool (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
3. [Tool search (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/tool-search)
4. [Manage tool context (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
5. [Agent Skills overview (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
6. [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
