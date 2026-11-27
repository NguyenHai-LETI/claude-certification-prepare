---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-4-quan-sat-o-quy-mo-lon
ngay_tai: 2026-11-27
tieu_de: Quan sát hệ thống agent ở quy mô lớn
---

Domain 3: Integration · Task 3.4

# Quan sát hệ thống agent ở quy mô lớn

Vì sao agent khó quan sát, cần metrics, log và trace nào, ghi gì để truy lỗi, và triển khai telemetry cho cả tổ chức mà không lộ dữ liệu hay tốn lưu trữ.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Giải thích vì sao log phẳng không đủ để gỡ lỗi agent, và trace dạng cây giúp gì
- Biết Claude Code, Agent SDK, Claude API và Managed Agents xuất được những gì
- Nhận ra lỗ hổng quan sát như thiếu phiên bản model hay thiếu mã liên kết xuyên suốt
- Triển khai telemetry tập trung, gắn nhãn theo nhóm và khách hàng, kiểm soát nội dung và số chuỗi metrics

Với một API thường, một yêu cầu là một dòng log. Với agent, một câu hỏi của người dùng có thể thành mười lần gọi model, hai chục lần gọi tool, ba subagent và một lần chờ người duyệt. Khi kết quả sai, log phẳng chỉ cho bạn một đống dòng rời rạc, không cho biết bước nào dẫn tới bước nào.

Bài này giúp bạn trả lời: quan sát hệ thống agent ở quy mô lớn khó ở đâu, cần thu thập gì, và triển khai cho cả tổ chức ra sao?

## Ví dụ xuyên suốt: công ty phần mềm kế toán

Một công ty phần mềm kế toán có hai nơi dùng Claude:

- **200 kỹ sư** dùng Claude Code hằng ngày.
- **Một agent hỗ trợ** viết bằng Agent SDK, phục vụ 1.500 doanh nghiệp khách hàng; agent gọi subagent tra sổ sách và tool xuất báo cáo.

Ban giám đốc hỏi: tháng này mỗi nhóm tốn bao nhiêu? Khách hàng X phàn nàn agent trả lời sai hôm thứ Ba, vì sao? Đội bảo mật hỏi: agent có từng chạy lệnh bị chặn nào không?

## Vì sao agent khó quan sát

- **Không xác định**: cùng một câu hỏi, mỗi lần chạy agent có thể đi một đường khác. Bài viết về hệ thống nghiên cứu nhiều agent của Anthropic nói họ phải ghi vết toàn bộ luồng quyết định để gỡ lỗi được.
- **Nhiều tầng lồng nhau**: một lượt gồm lời gọi model, lời gọi tool, subagent, có khi chờ người duyệt quyền. Log phẳng mất quan hệ cha con giữa các bước.
- **Dữ liệu nhạy cảm**: prompt và kết quả tool chứa dữ liệu khách hàng. Bài viết trên nói họ theo dõi mẫu quyết định và cấu trúc tương tác mà không theo dõi nội dung hội thoại, để giữ riêng tư.

Lời giải chung là **trace**: mỗi lượt là một cây span, mỗi span là một bước có thời gian bắt đầu, kết thúc và thuộc tính.

Ví dụ cây span của Claude Code ở bảng dưới:

**Sơ đồ**
1. **claude_code.interaction**: span gốc của một prompt
   ↓ _các span con_
2. **claude_code.llm_request**: mỗi lần gọi model **|** **claude_code.tool**: mỗi lần chạy tool
   ↓ _bên trong_
3. **Token, độ trễ của lần gọi** **|** **Span của subagent**: nằm dưới span tool của agent cha

## Mỗi nền tảng xuất được gì

| Nền tảng | Cách quan sát |
| --- | --- |
| Claude Code | OpenTelemetry: metrics, events (log) và trace (đang beta). Span gốc `claude_code.interaction` cho mỗi prompt, con là `claude_code.llm_request` (mỗi lần gọi model) và `claude_code.tool`; span của subagent nằm dưới span tool của agent cha |
| Agent SDK | Không tự xuất telemetry; Claude Code CLI chạy bên dưới xuất thẳng tới collector của bạn. Gọi `query()` bên trong một span của ứng dụng thì SDK truyền `TRACEPARENT`, nên trace của agent nối vào trace của ứng dụng |
| Claude API | Xuất span của Messages API và phiên Managed Agents tới đích OpenTelemetry khai báo trong Console (beta); API đọc header W3C `traceparent` để span của nó nằm dưới span của bạn |
| Claude Managed Agents | Trình xem phiên trong Console: dòng thời gian theo từng luồng, mọi sự kiện, số lần gọi và lỗi của từng tool, context và chi phí từng luồng |

Metrics của Claude Code gồm số phiên, token (`claude_code.token.usage`), chi phí (`claude_code.cost.usage`), số dòng code thay đổi, số commit và pull request. Docs nói metrics chi phí là **ước tính**; số liệu hoá đơn chính thức phải lấy từ nhà cung cấp API.

## Ghi gì để truy được lỗi

Để trả lời "vì sao agent trả lời sai hôm thứ Ba", mỗi bước phải ghi đủ:

- Model nào, **phiên bản nào** đã chạy lượt đó.
- **Mã liên kết** (correlation ID) theo từng yêu cầu, truyền xuyên qua agent, subagent và tool, để nối các bước thành một trace.
- Token và độ trễ của từng span.
- Kết quả gọi tool, đã che các trường nhạy cảm.

**Sơ đồ**
1. **Yêu cầu của khách hàng X**: gắn mã liên kết
   ↓ _mã truyền theo_
2. **Agent hỗ trợ**: ghi model và phiên bản
   ↓ _mã truyền theo_
3. **Subagent tra sổ sách**: ghi token, độ trễ
   ↓ _mã truyền theo_
4. **Tool xuất báo cáo**: ghi kết quả đã che trường nhạy cảm

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi hai lỗ hổng quan sát thật trong một hệ nhiều agent. Chọn: **không ghi danh tính và phiên bản model** cùng dữ liệu của mỗi lượt; **mã liên kết theo yêu cầu không được truyền** qua các lời gọi agent và tool. Các câu kể việc đang làm tốt (xuất span lên hệ thống trace chung, đẩy token và độ trễ của mỗi span lên metrics, ghi kết quả tool có che dữ liệu nhạy cảm) không phải lỗ hổng.

## Triển khai cho cả tổ chức

**Cấu hình tập trung.** Docs của Claude Code nói quản trị viên đặt cấu hình OpenTelemetry cho mọi người qua file managed settings. Repository không tự bật telemetry hay chọn nơi gửi được. Lưu ý: khoá endpoint trong managed settings đổi **nơi** gửi, nhưng các biến chọn exporter (metrics, logs, traces) chỉ bị khoá nếu bạn cũng đặt chúng trong managed settings.

**Gắn nhãn theo nhóm và khách hàng.** Đặt `OTEL_RESOURCE_ATTRIBUTES`, ví dụ `department=finance,team.id=platform,cost_center=eng-123`; với agent phục vụ nhiều khách hàng, docs Agent SDK gợi ý gắn `tenant.id` và `enduser.id`. Mỗi khoá tự thêm thành một nhãn trên **mọi** chuỗi metrics, nên giá trị càng nhiều thì càng tốn lưu trữ.

**Kiểm soát số chuỗi metrics (cardinality).** Docs có các cờ bật tắt thuộc tính trên metrics. Mã phiên và mã tài khoản **bật mặc định**; phiên bản ứng dụng tắt mặc định. Với 200 kỹ sư, mỗi người nhiều phiên mỗi ngày, mã phiên làm số chuỗi tăng vọt; tắt nếu dashboard không dùng tới.

**Kiểm soát nội dung.** Docs nói telemetry mặc định chỉ có cấu trúc: span không chứa nội dung prompt, chi tiết đầu vào tool hay nội dung tool. Muốn có phải bật từng cờ: `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT`, `OTEL_LOG_RAW_API_BODIES`. Trên Claude API, đích telemetry có chế độ chỉ metadata (mặc định) hoặc đầy đủ nội dung; tổ chức có ràng buộc HIPAA chỉ xuất được metadata.

> **Bẫy đề**
>
> Bật ghi nội dung cho cả đội "để gỡ lỗi cho dễ" là mở rộng phạm vi lộ dữ liệu ra mọi nơi telemetry đi tới. Riêng cờ ghi nguyên văn yêu cầu và phản hồi API thì docs nói nó chứa **toàn bộ lịch sử hội thoại**, và bật nó coi như đồng ý với các cờ nội dung khác. Chọn cờ hẹp nhất đủ cho nhu cầu, và chỉ bật khi hệ thống lưu trữ đã được duyệt cho loại dữ liệu đó.

**Đội bảo mật.** Docs liệt kê các event hợp để đưa vào hệ thống SIEM: quyết định cấp quyền tool, kết quả tool, sự kiện an toàn, kết nối MCP server và đổi chế độ quyền. Trả lời được câu "agent có chạy lệnh bị chặn không".

**Độ tin cậy của dữ liệu.** Đích telemetry của Claude API giao **ít nhất một lần**, nên phải loại trùng theo mã trace và mã span; docs cũng nói span xuất ra không bảo đảm là bản ghi đầy đủ. Đối soát chi phí thì dùng số liệu sử dụng chính thức, không dùng trace.

Ghép lại, telemetry của công ty phần mềm kế toán đi như sau:

**Sơ đồ**
1. **Claude Code của 200 kỹ sư**: cấu hình qua managed settings **|** **Agent hỗ trợ**: gắn tenant.id, enduser.id
   ↓ _OpenTelemetry_
2. **Collector của công ty**
   ↓ _tách theo người dùng số liệu_
3. **Dashboard theo nhóm**: token, chi phí ước tính **|** **Hệ thống trace**: gỡ lỗi từng lượt **|** **SIEM**: lệnh bị chặn, đổi chế độ quyền

> **Ý chính**
>
> Agent cần trace dạng cây, không chỉ log phẳng. Ghi phiên bản model và mã liên kết ở mọi bước, cấu hình tập trung qua managed settings, gắn nhãn vừa đủ, và để nội dung tắt trừ khi thật sự cần.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Monitoring (Claude Code Docs)](https://code.claude.com/docs/en/monitoring-usage)
3. [Observability with OpenTelemetry (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/observability)
4. [OpenTelemetry for the Claude API (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api)
5. [Session observability (Claude Managed Agents)](https://platform.claude.com/docs/en/managed-agents/session-observability)
6. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
