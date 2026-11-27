---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-6-giam-sat-van-hanh
ngay_tai: 2026-11-27
tieu_de: Giám sát hiệu năng bằng log và công cụ quan sát
---

Domain 4: Evaluation, Testing & Optimization · Task 4.6

# Giám sát hiệu năng bằng log và công cụ quan sát

Đặc tả cần đo gì trước khi gắn đo, bật đúng tín hiệu OpenTelemetry, đọc trace tìm chỗ chậm, theo dõi chất lượng và chi phí, nhất là sau khi đổi model.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Làm phần đặc tả trước khi gắn đo, gồm chỉ số, lát cắt, mục tiêu dịch vụ và ngân sách lỗi
- Bật đúng các tín hiệu OpenTelemetry và kiểm dữ liệu đã tới collector
- Đọc trace để biết thời gian đang mất ở model, ở tool hay ở người duyệt
- Theo dõi trôi chất lượng sau khi đổi model bằng một bộ test cố định

Đánh giá trước khi phát hành cho biết hệ thống tốt tới đâu vào ngày phát hành. Giám sát cho biết nó còn tốt như vậy vào tuần sau, tháng sau, sau lần đổi model kế tiếp hay không. Bài 3.4 nói về kiến trúc quan sát ở quy mô lớn; bài này đi vào việc vận hành hằng ngày: đo gì, bật gì, đọc gì.

Bài này giúp bạn trả lời: giám sát hiệu năng của hệ thống dùng Claude bằng log và công cụ quan sát thế nào?

## Ví dụ xuyên suốt: đội nền tảng của một chuỗi siêu thị

Đội nền tảng của một chuỗi siêu thị vận hành trợ lý đặt hàng online (viết bằng Agent SDK) và hỗ trợ 60 lập trình viên dùng Claude Code. Họ cần biết: trợ lý có đang chậm đi không, chất lượng có tụt sau khi đổi model không, chi phí đi về đâu.

## Đặc tả trước khi gắn đo

Gắn đo trước rồi mới nghĩ xem đo gì thường cho ra một đống số không ai dùng. Thứ tự hợp lý:

1. **Đã chốt đo những chỉ số nào, trên lát cắt nào (lưu lượng thường và lưu lượng tấn công)?** → Định nghĩa chỉ số và lát cắt
2. **Đã chốt mục tiêu dịch vụ và ngân sách lỗi chưa?** → Định nghĩa SLO và error budget
3. **Hệ thống đã phát ra metrics và trace chưa?** → Gắn đo
- **Còn lại** → Rồi mới dựng dashboard, chỉnh ngưỡng cảnh báo theo phân bố bình thường đã quan sát, viết runbook cho người trực

Mục tiêu dịch vụ (**SLO**) là mức hệ thống cam kết, ví dụ 95% phản hồi đầu tiên dưới 2 giây. Ngân sách lỗi (**error budget**) là phần được phép vượt. Docs của Anthropic không định nghĩa hai khái niệm này; đây là cách làm quen thuộc trong vận hành hệ thống mà đề thi dùng.

> **Trong đề chọn gì**
>
> Đề hỏi hai bước phải xong **trước khi** gắn đo để hệ thống phát ra metrics và trace: chọn **định nghĩa chỉ số và lát cắt sẽ giám sát** (lưu lượng thường và lưu lượng tấn công), và **định nghĩa SLO cùng error budget**. Chỉnh ngưỡng cảnh báo theo phân bố quan sát được, dựng dashboard, viết tài liệu cho người trực đều cần dữ liệu đã có nên đến sau.

## Bật đúng tín hiệu

Claude Code và Agent SDK xuất telemetry qua OpenTelemetry với ba loại tín hiệu, mỗi loại trả lời một kiểu câu hỏi:

| Tín hiệu | Trả lời | Bật bằng |
| --- | --- | --- |
| Metrics | Bao nhiêu, xu hướng ra sao (token, chi phí, số phiên) | `OTEL_METRICS_EXPORTER` |
| Events (log) | Chuyện gì đã xảy ra (prompt, kết quả tool, quyết định cấp quyền) | `OTEL_LOGS_EXPORTER` |
| Traces (beta) | Thời gian đi đâu trong một lượt | `OTEL_TRACES_EXPORTER` cùng `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` |

Biến `CLAUDE_CODE_ENABLE_TELEMETRY=1` là bắt buộc, nhưng chưa đủ: mỗi tín hiệu cần exporter riêng, và docs nói Claude Code không có giao thức mặc định, phải đặt giao thức cho từng exporter OTLP. Cách kiểm: xem metric số phiên (`claude_code.session.count`) đã tới collector chưa.

Với Agent SDK có hai lưu ý từ docs: mặc định CLI **không báo** khi xuất telemetry lỗi (bật `CLAUDE_CODE_OTEL_DIAG_STDERR=1` để thấy); và với lần chạy ngắn, metrics mặc định 60 giây mới gửi một lần, nên tiến trình kết thúc sớm có thể mất dữ liệu chưa gửi; đặt khoảng gửi ngắn lại.

Trên Claude API, đích telemetry khai báo trong Console có nút gửi thử một span kiểm tra và cột tình trạng giao (tốt, lỗi, chưa có dữ liệu). Với Managed Agents, trình xem phiên trong Console cho thấy số lần gọi, số lỗi và thời gian trung vị của từng tool, cùng chi phí theo thời gian.

> **Bẫy đề**
>
> Bật `CLAUDE_CODE_ENABLE_TELEMETRY` mà không chọn exporter thì không có gì tới collector. Tăng khoảng thời gian gửi metrics không giảm được số chuỗi metrics; thứ làm số chuỗi tăng vọt là các thuộc tính như mã phiên (bật mặc định). Và bật ghi prompt (`OTEL_LOG_USER_PROMPTS`) thì câu trả lời của trợ lý cũng bị ghi theo, trừ khi đặt `OTEL_LOG_ASSISTANT_RESPONSES=0`.

## Đọc trace để tìm chỗ chậm

Khách phàn nàn trợ lý đặt hàng chậm. Trace của một lượt có span gốc `claude_code.interaction`, bên dưới là các span gọi model (`claude_code.llm_request`) và span tool (`claude_code.tool`). Span gọi model có thời gian, số lần thử lại, lỗi, lý do dừng và số token đọc hay ghi cache. Span tool chia làm hai phần: **chờ người duyệt quyền** (`claude_code.tool.blocked_on_user`) và **chạy thật** (`claude_code.tool.execution`).

| Thấy trong trace | Nghĩa là |
| --- | --- |
| Span gọi model dài, token đọc cache thấp | Cache đang hỏng (bài 4.5) |
| Nhiều lần thử lại, lỗi quá tải | Vấn đề phía API hoặc giới hạn tốc độ |
| Span tool dài, phần lớn là chờ duyệt quyền | Chậm do người, không do tool; xem lại quy tắc cấp quyền |
| Span tool dài, phần lớn là chạy thật | Tool hay hệ thống phía sau chậm |

Riêng trường hợp span tool dài, tách hai phần ra là biết ngay:

**Sơ đồ**
1. **Span tool dài**: claude_code.tool
   ↓ _thời gian nằm ở phần nào_
2. **claude_code.tool.blocked_on_user**: chờ người duyệt **|** **claude_code.tool.execution**: chạy thật
   ↓ _nghĩa là_
3. **Chậm do người, xem lại quy tắc cấp quyền** **|** **Tool hay hệ thống phía sau chậm**

## Theo dõi chất lượng theo thời gian

Metrics kỹ thuật không cho biết câu trả lời có còn đúng. Bài viết về đánh giá agent của Anthropic so việc này với mô hình phô mai Thuỵ Sĩ (**Swiss cheese model**): chồng nhiều lớp kiểm, lỗ của lớp này được lớp khác che. Gồm đánh giá tự động, giám sát production, A/B test, phản hồi người dùng, đọc transcript thủ công và nghiên cứu có hệ thống với người dùng.

**Sơ đồ**
1. **Đánh giá tự động**
2. **Giám sát production**
3. **A/B test**
4. **Phản hồi người dùng**
5. **Đọc transcript thủ công**
6. **Nghiên cứu có hệ thống với người dùng**

_Mỗi lớp đều có lỗ, lỗi lọt lớp này còn lớp khác bắt_

Rủi ro lớn khi vận hành là **trôi chất lượng âm thầm** sau khi đổi phiên bản model: không có lỗi nào được báo, nhưng câu trả lời kém dần.

**Sơ đồ**
1. **Phiên bản model mới**
   ↓ _chấm trên cùng một bộ test tấn công cố định_
2. **Điểm gắn với phiên bản**: so được với phiên bản đang chạy
   ↓ _đạt thì mới đưa lên_
3. **Production**

> **Bẫy đề**
>
> Câu luyện thi: rủi ro chính là chất lượng âm thầm trôi ở các đầu ra liên quan an toàn sau khi nâng phiên bản model. Đáp án đúng: **duy trì một bộ test tấn công cố định, chấm điểm gắn với từng phiên bản**, để mỗi lần nâng cấp được đo trên cùng một bộ trước khi đưa lên. Các đáp án sai: xoay vòng ngẫu nhiên bộ test để không lần nâng cấp nào chấm trên cùng bộ; bỏ đánh giá khi nâng cấp và chờ khiếu nại của người dùng; tắt đánh giá tấn công để tiết kiệm.

## Chi phí và mức sử dụng

Metrics chi phí của Claude Code chia được theo model, theo agent chính hay subagent, theo MCP server. Docs nói đây là **ước tính**; số liệu hoá đơn chính thức lấy từ nhà cung cấp API (trên Claude API là trang Usage và Cost của Console). Với Managed Agents, mỗi phiên có số token, chi phí và thời gian hoạt động, cùng ngân sách nếu đã đặt.

Khi chi phí tăng nhanh hơn lưu lượng, hãy tra số liệu thay vì đoán. Usage and Cost API trong Admin API (dùng Admin API key) cho số token theo model, workspace, API key và service tier; báo cáo chi phí nhóm được theo workspace hoặc description, và description có kèm model. Nhờ vậy bạn thấy tổ hợp workspace và model nào đẩy chi phí lên, rồi đối chiếu với hoá đơn. Docs nay xếp API này là bản cũ (legacy); tích hợp mới nên dùng Usage and Cost Analytics API.

> **Ý chính**
>
> Chốt chỉ số, lát cắt, SLO và error budget trước, rồi mới gắn đo. Bật đủ exporter cho từng tín hiệu và kiểm dữ liệu đã tới, dùng trace để biết thời gian đi đâu, và đo lại chất lượng trên một bộ test cố định mỗi lần đổi model.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 4](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Monitoring (Claude Code Docs)](https://code.claude.com/docs/en/monitoring-usage)
3. [Observability with OpenTelemetry (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/observability)
4. [OpenTelemetry for the Claude API (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api)
5. [Session observability (Claude Managed Agents)](https://platform.claude.com/docs/en/managed-agents/session-observability)
6. [Demystifying evals for AI agents (Anthropic)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
7. [Usage and Cost API (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
8. [Usage and Cost Analytics API (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api)
