---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/1-3-mau-agent-va-framework
ngay_tai: 2026-11-27
tieu_de: Các mẫu agent và framework - vòng lặp tool, subagent, bộ nhớ, context
---

Domain 1: Agents and Workflows · Task 1.3

# Các mẫu agent và framework - vòng lặp tool, subagent, bộ nhớ, context

Năm mẫu workflow, ai chạy vòng lặp tool, subagent để giữ context gọn, bộ nhớ sống qua nhiều phiên, checkpoint cho việc dài, và khi nào dùng framework.

- 11 phút đọc
- Đối chiếu docs 02/11/2026
- 11 nguồn

## Đọc xong bạn nắm được

- Ghép một việc với mẫu phù hợp - nối chuỗi, định tuyến, song song, orchestrator-workers, evaluator-optimizer hay agent
- Biết ai chạy vòng lặp tool trong từng cách dựng - code của bạn, máy chủ Anthropic, Agent SDK hay framework
- Dùng subagent và bộ nhớ ngoài để context không phình, và lưu checkpoint để việc dài chạy tiếp được
- Biết framework giúp gì, giấu gì, và lời khuyên của Anthropic khi dùng chúng

Phần lớn hệ thống agent chạy tốt được ghép từ vài mẫu đơn giản, không phải từ một kiến trúc phức tạp. Biết tên và đúng chỗ dùng của từng mẫu giúp bạn chọn nhanh, và nhận ra đáp án nào trong đề đang dùng sai mẫu.

Bài này giúp bạn trả lời: việc nhiều bước này hợp với mẫu nào, làm sao để agent chạy lâu mà context không phình, và có nên dùng framework không?

## Ví dụ xuyên suốt: nhà xuất bản biên tập bản thảo

Một nhà xuất bản sách nhận khoảng 20 bản thảo mỗi tháng, mỗi bản 25–40 chương. Họ muốn Claude hỗ trợ biên tập viên:

- Soát lỗi chính tả và văn phong của từng chương theo sổ tay biên tập của nhà.
- Kiểm tính nhất quán giữa các chương: tên nhân vật, mốc thời gian, địa danh.
- Viết đoạn giới thiệu in ở bìa sau, đạt tiêu chí của phòng phát hành.

Một bản thảo xử lý mất vài giờ và thường bị ngắt giữa chừng khi biên tập viên hết giờ làm.

## Năm mẫu workflow, và khi nào thay bằng agent

Bài viết "Building effective agents" của Anthropic mô tả năm mẫu workflow thường gặp trong thực tế, xếp từ đơn giản tới linh hoạt:

| Mẫu | Cách làm | Trong ví dụ |
| --- | --- | --- |
| Nối chuỗi (**prompt chaining**) | Chia việc thành các bước cố định, đầu ra bước trước là đầu vào bước sau; có thể kiểm giữa chừng | Soát chính tả xong mới soát văn phong |
| Định tuyến (**routing**) | Phân loại đầu vào rồi gửi tới prompt chuyên biệt | Sách thiếu nhi và sách chuyên khảo dùng hai bộ tiêu chí văn phong khác nhau |
| Song song (**parallelization**) | Chia thành phần độc lập chạy cùng lúc (sectioning), hoặc chạy cùng một việc nhiều lần để lấy ý kiến đa số (voting) | Mỗi chương một lần gọi; đoạn nhạy cảm cho kiểm ba lần |
| **Orchestrator-workers** | Một LLM tự chia việc, giao cho LLM khác, rồi tổng hợp. Khác song song ở chỗ việc con không định trước | Bản thảo nào cần kiểm những mảng nhất quán nào thì do orchestrator quyết |
| **Evaluator-optimizer** | Một lần gọi viết, một lần gọi khác chấm và góp ý, lặp lại | Viết đoạn bìa sau, chấm theo tiêu chí phát hành, sửa tới khi đạt |

Mỗi mẫu có một hình dạng riêng, nhớ hình là dễ phân biệt.

**Nối chuỗi**: đi một đường thẳng, đầu ra bước trước là đầu vào bước sau.

**Sơ đồ**
1. **Chương gốc**
   ↓ _soát chính tả_
2. **Chương đã sửa chính tả**
   ↓ _soát văn phong_
3. **Chương đã soát xong**

**Định tuyến**: rẽ một trong các nhánh, mỗi đầu vào chỉ đi một nhánh.

**Sơ đồ**
1. **Bản thảo đến**
   ↓ _phân loại, chọn một nhánh_
2. **Sách thiếu nhi**: bộ tiêu chí văn phong riêng **|** **Sách chuyên khảo**: bộ tiêu chí văn phong riêng

**Song song, kiểu sectioning**: các phần độc lập chạy cùng lúc.

**Sơ đồ**
1. **Một bản thảo**
   ↓ _mỗi chương một lần gọi_
2. **Chương 1** **|** **Chương 2** **|** **Các chương còn lại**
   ↓ _gộp kết quả_
3. **Danh sách lỗi của cả bản thảo**

**Song song, kiểu voting**: cùng một việc chạy nhiều lần, lấy đa số.

**Sơ đồ**
1. **Một đoạn nhạy cảm**
   ↓ _cùng một việc, kiểm ba lần_
2. **Lần 1** **|** **Lần 2** **|** **Lần 3**
   ↓ _lấy ý kiến đa số_
3. **Kết luận về đoạn đó**

**Orchestrator-workers**: một LLM ở giữa, tuỳ đầu vào mà quyết định cần những việc con nào.

**Sơ đồ**
- Trung tâm: **Orchestrator**: xem bản thảo này cần kiểm những mảng nào, tổng hợp kết quả
- **Kiểm tên nhân vật**
- **Kiểm mốc thời gian**
- **Kiểm địa danh**

_Việc con không định trước, bản thảo khác có thể chia khác đi_

**Evaluator-optimizer**: một vòng khép kín giữa người viết và người chấm.

**Sơ đồ**
1. **Viết**: đoạn giới thiệu bìa sau
2. **Chấm**: theo tiêu chí của phòng phát hành
3. **Góp ý**: gửi lại cho lần viết sau
- ↻Đạt tiêu chí thì thoát vòng

Bài viết nói evaluator-optimizer hợp khi có tiêu chí đánh giá rõ và việc sửa nhiều vòng thật sự làm kết quả tốt lên. Agent tự chủ thì dành cho việc mở, không đoán trước được số bước.

Có những quy trình vừa có các bước tách biệt vừa phải quay lại bước trước tuỳ tình trạng hồ sơ. Đề thi gọi kiểu này là mẫu dựa trên đồ thị (**graph-based pattern**): mỗi bước là một nút có tiêu chí đạt riêng, và trạng thái của từng hồ sơ quyết định đi sang nút nào, kể cả quay lại.

**Sơ đồ**
1. **Trích dữ kiện**: tiêu chí đạt riêng
   ↓ _trạng thái hồ sơ quyết định đi sang nút nào_
2. **Xét điều kiện**: tiêu chí đạt riêng
   ↓ _đủ điều kiện để kết luận_
3. **Ra quyết định**: tiêu chí đạt riêng

> **Trong đề chọn gì**
>
> Câu luyện thi: xử lý hồ sơ bồi thường qua ba bước (trích dữ kiện, xét điều kiện, ra quyết định), mỗi bước có tiêu chí riêng, và có hồ sơ phải quay lại giữa trích dữ kiện và xét điều kiện. Chọn **mẫu dựa trên đồ thị, đi giữa các bước theo trạng thái từng hồ sơ, mỗi bước chấm theo tiêu chí riêng**. Sai: chuỗi tuyến tính không có đường quay lại; một vòng lặp tool có mọi tool; mẫu streaming trả quyết định từng phần.

## Ai chạy vòng lặp tool

Mẫu cơ bản nhất của agent là vòng lặp gọi tool (**tool-use loop**): model gọi tool, nhận kết quả, quyết định bước tiếp. Câu hỏi là ai chạy vòng lặp đó:

| Cách dựng | Ai chạy vòng lặp |
| --- | --- |
| Tool do bạn định nghĩa, gọi qua Client SDK | Code của bạn: lặp khi `stop_reason` là `"tool_use"` |
| Tool chạy ở máy chủ Anthropic (như `web_search`, `code_execution`) | Máy chủ Anthropic. Chạm giới hạn số vòng thì trả `stop_reason: "pause_turn"`, bạn gửi lại hội thoại để chạy tiếp |
| Agent SDK | SDK |
| Framework | Thư viện của framework |

## Subagent và bộ nhớ: giữ context gọn

Context window là "bộ nhớ làm việc" của model: mọi thứ model đọc được khi trả lời, kể cả câu trả lời. Một agent soát 40 chương mà nhét hết vào một hội thoại sẽ đầy context rất nhanh. Có hai cách giữ context gọn:

**Subagent.** Docs Agent SDK nói mỗi subagent chạy trong hội thoại riêng; các lần gọi tool trung gian nằm lại trong subagent, chỉ tin nhắn cuối được trả về agent chính. Trong ví dụ, mỗi chương giao cho một subagent soát; agent chính chỉ nhận danh sách lỗi và các tên riêng xuất hiện, không nhận cả chương. Subagent tuỳ chỉnh trả về một `agentId`; muốn hỏi tiếp subagent đó ở lần gọi `query()` sau thì chạy lại đúng session đó (`resume`) và nhắc agent ID trong prompt.

Subagent cũng có thể tạo subagent con. Mặc định cây này sâu tới ba lớp dưới agent chính; ở lớp cuối, subagent không còn tool `Agent` nên tự làm việc được giao và trả một bản tóm tắt. Đổi độ sâu bằng biến môi trường `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (đặt `1` để tắt hẳn việc lồng nhau). Muốn riêng một subagent không tạo con, ví dụ subagent chỉ đọc bản thảo, thì bỏ `Agent` khỏi danh sách `tools` của nó hoặc thêm vào `disallowedTools`.

**Bộ nhớ ngoài context.** Context chỉ sống trong một phiên. Thứ cần nhớ qua nhiều phiên phải lưu ra ngoài. **Memory tool** của Claude API làm việc này: Claude yêu cầu đọc, ghi file trong thư mục `/memories`, còn ứng dụng của bạn thực hiện yêu cầu trên kho lưu trữ của mình (tool chạy phía client). Handler của bạn phải từ chối mọi đường dẫn ra ngoài `/memories`.

```json
{ "tools": [{ "type": "memory_20250818", "name": "memory" }] }
```

Trong ví dụ, Claude ghi vào bộ nhớ các quyết định biên tập đã chốt ("tên nhân vật viết là Hạnh, không phải Hạnh Nhi"), để phiên sau soát chương 30 vẫn theo đúng quyết định từ chương 3.

**Sơ đồ**
1. **Claude**: yêu cầu ghi "tên nhân vật viết là Hạnh"
   ↓ _tool chạy phía client_
2. **Ứng dụng của bạn**: ghi vào /memories trên kho của mình, từ chối đường dẫn ra ngoài
   ↓ _phiên sau đọc lại_
3. **Claude soát chương 30**: vẫn theo đúng quyết định từ chương 3

## Checkpoint cho việc dài

Bài viết về hệ thống nghiên cứu nhiều agent của Anthropic nói agent có trạng thái và lỗi chồng lên nhau qua nhiều bước; khi lỗi xảy ra thì không thể chạy lại từ đầu vì tốn kém và gây bực bội. Họ dựng hệ thống chạy tiếp được từ chỗ agent đang dừng, kết hợp thử lại và lưu checkpoint đều đặn.

Trong ví dụ, sau mỗi chương soát xong, hệ thống lưu ra database: chương đã soát, danh sách lỗi, các quyết định biên tập mới. Bị ngắt ở chương 17 thì lần sau nạp lại trạng thái và làm tiếp từ chương 18. Agent SDK cũng hỗ trợ việc này ở mức hội thoại: lấy session ID từ kết quả, lần sau truyền `resume` để khôi phục đầy đủ ngữ cảnh.

**Sơ đồ**
1. **Soát xong một chương**
   ↓ _lưu ra database: chương đã soát, danh sách lỗi, quyết định mới_
2. **Trạng thái trong database**
   ↓ _bị ngắt giữa chừng, lần sau nạp lại_
3. **Làm tiếp từ chương kế tiếp**: không chạy lại từ đầu

> **Bẫy đề**
>
> Câu luyện thi: việc chạy 30–60 phút, có các checkpoint rõ ràng, cần chạy tiếp từ checkpoint gần nhất khi bị ngắt. Đúng là **mẫu checkpoint: lưu bền trạng thái trung gian và nạp lại khi chạy tiếp**. Sai: tăng timeout lên vài giờ cho ít bị ngắt; chạy hai bản song song lấy bản xong trước; bị ngắt thì làm lại từ đầu. Ba cách sai chỉ cố giảm gián đoạn, không phục hồi được sau gián đoạn.

## Framework: giúp gì, giấu gì

Đề thi nhắc các framework trừu tượng hoá agent (**agentic abstraction frameworks**), ví dụ Strands, LangGraph, PydanticAI. Bài viết của Anthropic liệt kê vài framework, trong đó có Claude Agent SDK và Strands Agents SDK của AWS, và nhận xét:

- Framework giúp bắt đầu nhanh vì lo sẵn việc cấp thấp: gọi model, khai báo và đọc tool, nối các lần gọi.
- Nhưng chúng thêm lớp trừu tượng che mất prompt và phản hồi thật, nên khó gỡ lỗi hơn, và dễ khiến bạn thêm phức tạp khi cách đơn giản đã đủ.
- Lời khuyên: bắt đầu bằng gọi API trực tiếp, nhiều mẫu chỉ cần vài dòng code. Nếu dùng framework thì phải hiểu code bên dưới, vì hiểu sai cái framework làm ngầm là nguồn lỗi hay gặp.

Ba framework đề hay nhắc có điểm nhấn khác nhau. LangGraph mô hình workflow thành graph gồm state, node và edge, nên bạn tự khai báo nhánh và vòng lặp. Strands Agents SDK là mã nguồn mở của AWS, không gắn với một nhà cung cấp model và phát trace theo chuẩn OpenTelemetry. Pydantic AI cũng phát trace OpenTelemetry cho mỗi lần chạy; bạn gửi chúng tới Logfire hoặc tới backend, collector OpenTelemetry của riêng mình, và phải tự chỉ địa chỉ backend đó.

1. **Bước biết trước, không quay lại?** → Nối chuỗi, hoặc song song nếu các phần độc lập
2. **Có bước phải quay lại tuỳ trạng thái?** → Mẫu đồ thị, mỗi bước có tiêu chí riêng
3. **Không đoán được việc con?** → Orchestrator-workers
4. **Có tiêu chí chấm rõ và sửa nhiều vòng có ích?** → Evaluator-optimizer
- **Còn lại** → Một lần gọi model, hoặc agent nếu việc thật sự mở

> **Ý chính**
>
> Nhớ năm mẫu workflow và chỗ dùng của từng mẫu; quy trình có đường quay lại thì nghĩ tới mẫu đồ thị. Giữ context gọn bằng subagent và bộ nhớ ngoài, lưu checkpoint để việc dài chạy tiếp được. Framework giúp đi nhanh nhưng che mất prompt thật, nên phải hiểu nó làm gì bên dưới.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Building effective agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
3. [How tool use works (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
4. [Subagents in the SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/subagents)
5. [Memory tool (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
6. [Context windows (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
7. [How we built our multi-agent research system (Anthropic Engineering)](https://www.anthropic.com/engineering/multi-agent-research-system)
8. [Create custom subagents (Claude Code Docs)](https://code.claude.com/docs/en/sub-agents)
9. [Graph API overview (LangGraph Docs)](https://docs.langchain.com/oss/python/langgraph/graph-api)
10. [Debugging and monitoring with Pydantic Logfire (Pydantic AI Docs)](https://ai.pydantic.dev/logfire/)
11. [Introducing Strands Agents, an open source AI agents SDK (AWS Open Source Blog)](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/)
