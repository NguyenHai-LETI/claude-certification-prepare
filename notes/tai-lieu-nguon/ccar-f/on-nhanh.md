---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/on-nhanh
ngay_tai: 2026-11-27
tieu_de: Tổng quan CCAR-F
---

# Tổng quan CCAR-F

Cả chứng chỉ CCAR-F trên một trang, khái niệm nào cũng giải thích ngay, kèm sơ đồ, bẫy đề và bảng chọn nhanh. Chưa học bài nào vẫn đọc được.

- 38 phút đọc
- Đối chiếu docs 22/11/2026
- 6 nguồn

Hãy đọc trang này đầu tiên. Trang gom cả chứng chỉ vào một chỗ, giải thích mọi khái niệm bằng lời thường và vẽ sơ đồ ở chỗ cần hình dung luồng chạy, nên chưa học bài nào bạn vẫn hiểu được. Đề chia kiến thức thành năm domain (mảng kiến thức), và cuối mỗi domain có danh sách bài để học kỹ hơn. Trước giờ thi, hãy quay lại đây ôn các bảng **Trong đề chọn gì**.

Domain nào cũng đi theo cùng một thứ tự: domain đó hỏi gì, các khái niệm chính, bẫy đề hay gặp, rồi bảng **Trong đề chọn gì** để tra nhanh. Cuối trang có mẹo chọn đáp án khi phân vân, phần này nên đọc sau cùng.

## Đề thi gồm những gì

| Mục | Chi tiết |
| --- | --- |
| Số câu | 60, có câu một đáp án và câu nhiều đáp án (câu nào cũng ghi rõ chọn mấy) |
| Thời gian | 120 phút |
| Cấu trúc | 4 kịch bản, chọn ngẫu nhiên từ 6 kịch bản |
| Điểm đậu | 720 trên thang 100–1.000 |
| Lệ phí, hiệu lực | $125, chứng chỉ có hiệu lực 12 tháng |
| Kết quả | Đạt hay không, điểm quy đổi, và tỉ lệ đúng theo từng domain |

| Domain | Tỉ trọng | Hỏi về |
| --- | --- | --- |
| 1. Agentic Architecture & Orchestration | 27% | Vòng lặp agent, chia việc cho nhiều agent, chặn bằng code, session |
| 2. Tool Design & MCP Integration | 18% | Viết tool cho Claude chọn đúng, trả lỗi, phân tool, gắn MCP server |
| 3. Claude Code Configuration & Workflows | 20% | CLAUDE.md, rule, skill, plan mode, chạy trong CI |
| 4. Prompt Engineering & Structured Output | 20% | Tiêu chí rõ, ví dụ mẫu, JSON đúng schema, batch, review nhiều lần |
| 5. Context Management & Reliability | 15% | Giữ thông tin khi hội thoại dài, chuyển cho người, lỗi, người duyệt, nguồn |

Mỗi kịch bản là một bối cảnh sản phẩm, kèm một nhóm câu hỏi. Nhìn tên kịch bản, bạn đoán được câu hỏi đang nhắm vào domain nào.

| Kịch bản | Domain hay hỏi |
| --- | --- |
| Customer Support Resolution Agent | 1, 2, 5 |
| Code Generation with Claude Code | 3, 5 |
| Multi-Agent Research System | 1, 2, 5 |
| Developer Productivity with Claude | 2, 3, 1 |
| Claude Code for Continuous Integration | 3, 4 |
| Structured Data Extraction | 4, 5 |

**Sơ đồ: Năm domain gom vào ba việc, nặng nhất là dựng agent và tool**
_Năm domain của CCAR-F chia ba nhóm việc: dựng agent và tool gồm Domain 1 Agentic Architecture 27% và Domain 2 Tool Design và MCP 18%; viết chỉ dẫn cho Claude gồm Domain 3 Claude Code Configuration 20% và Domain 4 Prompt và Structured Output 20%; giữ kết quả đáng tin gồm Domain 5 Context Management và Reliability 15%. Thanh ngang dài theo tỉ trọng_

- **DỰNG AGENT VÀ TOOL**
- **1. Agentic Architecture**: vòng lặp, subagent, hook, session
- **27%**
- **2. Tool Design & MCP**: mô tả tool, isError, MCP server
- **18%**
- **VIẾT CHỈ DẪN CHO CLAUDE**
- **3. Claude Code Configuration**: CLAUDE.md, skill, plan mode, CI
- **20%**
- **4. Prompt & Structured Output**: few-shot, JSON schema, batch
- **20%**
- **GIỮ KẾT QUẢ ĐÁNG TIN**
- **5. Context Management & Reliability**: context dài, chuyển cho người, lỗi giữa agent, người duyệt, nguồn
- **15%**

## Domain 1: Agentic Architecture & Orchestration

Domain này hỏi về vòng lặp agent, cách chia việc cho nhiều agent, lúc nào phải chặn bằng code, và session.

### Vòng lặp agent

Claude không tự chạy tool, nó chỉ xin gọi tool kèm tham số. Code của bạn chạy tool, gửi kết quả về, rồi gọi Claude tiếp. Đoạn code lặp như vậy gọi là **vòng lặp agent** (**agentic loop**).

Code biết khi nào lặp tiếp, khi nào dừng nhờ field **`stop_reason`** trong phản hồi. Giá trị `tool_use` nghĩa là Claude đang chờ kết quả tool, còn `end_turn` nghĩa là Claude đã trả lời xong. Khi gửi kết quả về, code thêm nguyên phản hồi của Claude vào lịch sử, rồi thêm một message role `user` chứa khối `tool_result` có `tool_use_id` trùng với mã của lời gọi tool.

`stop_reason` còn vài giá trị khác. `max_tokens` nghĩa là câu trả lời bị cắt vì chạm giới hạn độ dài. `pause_turn` nghĩa là một server tool, tức tool do Anthropic chạy như web search, đã chạm giới hạn số vòng. Vòng lặp phải xử lý từng giá trị, vì chúng đều nằm trong phản hồi thành công.

**Sơ đồ: Chỉ end_turn thoát vòng lặp; ba giá trị còn lại đều quay lại gọi Claude lần nữa**
_Vòng lặp agent: code gọi Claude, đọc stop_reason; tool_use, max_tokens, pause_turn quay lại gọi tiếp, end_turn thoát_

- gọi Claude lần nữa
- **Code gọi Claude**: gửi đủ lịch sử
- **Claude trả lời**: kèm stop_reason
- **tool_use**
- **max_tokens**
- **pause_turn**
- **end_turn**
- **Code chạy tool**: thêm nguyên phản hồi vào lịch sử,
- rồi tool_result có tool_use_id khớp
- **Gọi tiếp để viết nốt**: hoặc tăng giới hạn độ dài
- **Gửi lại phản hồi**: để server tool làm tiếp
- **Dùng câu trả lời, thoát vòng lặp**

> **Bẫy đề**
>
> Đáp án sai hay gặp là dừng khi câu trả lời có cụm báo xong, dừng ngay khi phản hồi có khối chữ, hay dừng sau một số vòng cố định. Hãy chọn đáp án dựa vào `stop_reason`. Giới hạn số vòng chỉ là lưới an toàn phụ. Điểm tự tin hay số token cũng không phải tín hiệu dừng.

Ngoài chuyện dừng, vòng lặp còn phải biết gọi tool nào tiếp theo. Các bước biết trước và cố định thì viết sẵn thứ tự trong code. Bước sau phụ thuộc vào điều vừa tìm ra thì để Claude tự quyết dựa trên context, tức mọi thứ nó thấy trong lần gọi (**model-driven decision-making**).

### Agent điều phối và subagent

Một **agent điều phối** (**coordinator**) nhận yêu cầu, chia thành việc nhỏ, giao cho các **subagent**, rồi gộp và kiểm kết quả. Mọi trao đổi đi qua agent điều phối, nên retry, ghi log và xử lý lỗi dồn về một chỗ. Agent điều phối tự phân tích từng câu hỏi lúc chạy để chọn gọi subagent nào, không dùng bảng gán sẵn, và kết quả đã có trong context thì tự trả lời. Khi giao việc, bạn cần nắm năm điều sau.

- **Subagent không thấy lịch sử của agent điều phối**, chỉ biết những gì ghi trong prompt giao việc. Kết quả subagent sau cần thì agent điều phối phải chép thẳng vào đó.
- **Prompt giao việc nêu mục tiêu và tiêu chí chất lượng** (nguồn ưu tiên, độ bao phủ, dạng kết quả), rồi để subagent tự quyết cách làm.
- **Muốn chạy song song**, agent điều phối gọi nhiều subagent trong **cùng một** phản hồi.
- **Tool để gọi subagent** (trong đề tên là `Task`) phải có trong danh sách tool được phép của agent điều phối. Thiếu tool này, agent điều phối chỉ viết ra là sẽ giao việc, nhưng không subagent nào thật sự chạy.
- **Kết quả cuối thiếu một mảng** trong khi subagent nào cũng làm đúng việc được giao thì lỗi nằm ở agent điều phối, vì nó chia việc quá hẹp. Nó nên đọc lại bản tổng hợp và giao thêm việc nhắm đúng chỗ còn thiếu.

**Sơ đồ: Mọi trao đổi đi qua agent điều phối; subagent chỉ biết những gì ghi trong prompt giao việc**
_Agent điều phối giao việc cho ba subagent trong cùng một phản hồi, kết quả quay về agent điều phối, các subagent không gọi thẳng nhau_

- Yêu cầu
- **Agent điều phối**: chia việc, giao việc,
- gộp và kiểm kết quả
- tool Task được phép
- **Lịch sử riêng**: subagent không thấy
- **CHẠY SONG SONG**: gọi trong cùng một phản hồi
- **Subagent**: chỉ biết prompt giao việc
- **Subagent**: chỉ biết prompt giao việc
- **Subagent**: chỉ biết prompt giao việc
- **không gọi thẳng nhau**: prompt giao việc
- kết quả

### Chặn bằng code hay dặn trong prompt

Có hai cách bắt agent làm đúng thứ tự, ví dụ phải xác minh khách trước khi hoàn tiền:

|   | Dặn trong prompt | Chặn bằng code |
| --- | --- | --- |
| Cách làm | Viết vào system prompt (lời dặn gửi kèm mọi lần gọi): "luôn xác minh trước" | Code kiểm tra, chưa xác minh thì tool hoàn tiền không chạy |
| Mức bảo đảm | Đúng phần lớn thời gian, vẫn có lúc bỏ qua | Lần nào cũng đúng |
| Tên trong đề | **prompt-based guidance** | **programmatic enforcement**, **prerequisite gate** |

**Agent SDK** là thư viện của Anthropic để viết agent bằng code (Python, TypeScript). Trong Agent SDK, chỗ chặn là **hook**, tức đoạn code của bạn chạy tự động ở một thời điểm cố định:

- **`PreToolUse`** chạy ngay **trước** khi tool chạy. Hook này chặn lời gọi vi phạm chính sách (hoàn tiền vượt hạn mức) và gửi lý do cho Claude đọc. Nó cũng thay được tham số bằng giá trị đã xác minh, bằng cách trả `allow` kèm `updatedInput`.
- **`PostToolUse`** chạy ngay **sau** khi tool trả kết quả, trước khi Claude đọc. Hook này chuẩn hoá dữ liệu (ngày, mã trạng thái), hay chạy formatter sau mỗi lần sửa file, khi matcher (mẫu tên tool mà hook bắt) là `Edit|Write`.

> **Bẫy đề**
>
> Agent thỉnh thoảng bỏ bước xác minh, và đề đưa các đáp án như "viết lại prompt nhấn mạnh hơn" hay "thêm ví dụ mẫu cho thấy agent luôn xác minh". Cả hai vẫn là lời dặn. Khi hậu quả dính tới tiền hay danh tính, hãy chọn chặn bằng code. Thao tác nguy hiểm có bước xem trước thì tách hai tool: tool xem trước trả mã xác nhận dùng một lần, tool thực hiện chỉ chạy khi có mã đó.

### Chia việc lớn thành việc nhỏ

Cách chia tuỳ vào việc bạn đã biết trước các bước hay chưa.

- **Khi các bước đã biết trước**, như review PR theo ba mặt bảo mật, hiệu năng và style, hãy chia thành chuỗi bước cố định, mỗi mặt một bước, rồi một bước gộp ở cuối. Cách này gọi là **prompt chaining**.
- **Việc mở, chưa biết sẽ gặp gì** (viết test cho một codebase cũ chưa ai nắm, tìm một lỗi chưa biết nằm đâu): để agent tự chia dần theo phát hiện (**adaptive decomposition**). Agent bắt đầu từ cấu trúc code, như dùng Glob (tìm file theo tên) và Grep (tìm chữ trong file) để tìm các module được nhiều nơi import, hoặc từ một trường hợp lỗi có thật.
- **Review PR nhiều file** thì xem riêng từng file trước, rồi thêm một bước xem dữ liệu chạy qua các file. Bước sau cần tool đọc file và tìm trong codebase, kèm giới hạn số lượt.
- **Tin nhắn có nhiều yêu cầu** ("đổi ghế, gửi lại vé, hỏi hoàn tiền"): tách thành từng mục, tra các mục song song trên cùng thông tin của khách, rồi gộp thành một câu trả lời đủ mọi mục.

### Bàn giao khi chuyển cho nhân viên

Khi chuyển ca cho nhân viên (**escalation**), người nhận thường không đọc được cuộc chat, nên agent gửi kèm **bản bàn giao có cấu trúc** (**structured handoff summary**): mã khách, nguyên nhân gốc, số tiền, những gì đã thử, hành động đề xuất. Đặt chúng thành field bắt buộc.

### Session: tiếp tục, tách nhánh hay bắt đầu lại

Mỗi session là một cuộc làm việc có lịch sử riêng. Khi quay lại việc cũ, cách chọn tuỳ vào lịch sử cũ còn đúng tới đâu.

- **Tiếp tục session cũ** bằng `claude --resume <tên session>`, dùng đúng cái tên đã đặt lúc mở session. `--continue` chỉ mở session gần nhất, không mở theo tên.
- **Nếu code đã đổi từ lần trước**, hãy resume rồi báo đúng những file đã đổi, vì nội dung file trong lịch sử chỉ là bản chụp lúc đọc. Resume không đưa file về bản cũ, việc đó cần file checkpointing.
- **Nếu kết quả tool cũ không còn đúng**, hãy mở session mới, đưa vào bản tóm tắt có cấu trúc những gì vẫn đúng, rồi gọi tool lại khi cần.
- **Muốn thử hai hướng từ cùng một phân tích**: tách nhánh session (**fork**, trong Agent SDK là `fork_session`). Session gốc giữ nguyên.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Agent dừng sai lúc | Đọc `stop_reason`, không dựa vào chữ hay số vòng |
> | Cuộc trò chuyện phải kết thúc bằng xong việc hoặc chuyển người | Code tầng điều phối kiểm kết quả sau khi vòng lặp dừng |
> | Subagent làm sai vì thiếu thông tin | Chép đủ kết quả và tiêu chí vào prompt giao việc |
> | Muốn các subagent chạy cùng lúc | Gọi nhiều subagent trong cùng một phản hồi |
> | Báo cáo thiếu một mảng | Agent điều phối chia việc quá hẹp |
> | Thứ tự bắt buộc, sai là mất tiền | Hook `PreToolUse` hoặc điều kiện chặn trong code |
> | Agent bỏ bước xem trước của thao tác nguy hiểm | Hai tool, nối bằng mã xác nhận dùng một lần |
> | Kết quả tool nhiều định dạng lộn xộn | Hook `PostToolUse` chuẩn hoá trước khi Claude đọc |
> | Chuyển ca cho nhân viên | Bản bàn giao có cấu trúc, field bắt buộc |
> | Quay lại việc, chỉ vài file đổi | `--resume` và báo đúng file nào đã đổi |
> | Thử hai hướng từ cùng một phân tích | Fork session |

**Học kỹ domain này**

- [1.1 Vòng lặp agent và stop_reason](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-1-vong-lap-agent) (20 phút đọc)
- [1.2 Điều phối nhiều agent theo mô hình coordinator–subagent](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-2-dieu-phoi-nhieu-agent) (17 phút đọc)
- [1.3 Gọi subagent, truyền context và chạy song song](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-3-goi-subagent-va-truyen-context) (18 phút đọc)
- [1.4 Ép thứ tự các bước và bàn giao cho người](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-4-ep-quy-trinh-va-chuyen-giao) (14 phút đọc)
- [1.5 Hook trong Agent SDK - chặn lời gọi tool và chuẩn hoá kết quả](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-5-hook-agent-sdk) (14 phút đọc)
- [1.6 Chia nhỏ nhiệm vụ phức tạp](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-6-chia-nho-nhiem-vu) (16 phút đọc)
- [1.7 Resume, fork hay mở session mới](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-7-session-tiep-tuc-va-fork) (15 phút đọc)

## Domain 2: Tool Design & MCP Integration

Domain này hỏi cách viết tool cho Claude chọn đúng, cách báo lỗi, nên cho mỗi agent bao nhiêu tool, và cách gắn MCP server.

### Viết mô tả tool cho Claude chọn đúng

Claude chọn tool theo tên, mô tả, schema và system prompt. Nếu hai tool chỉ có mô tả một dòng na ná nhau, Claude dễ chọn nhầm. Mô tả tốt nói rõ ba điều.

- Tool làm gì, và **không** làm gì.
- Đầu vào dạng gì (kèm giá trị mẫu) và kết quả trông thế nào.
- Khi nào nên dùng tool này thay vì tool gần giống nó.

Tool đa năng làm cả chục việc thì tách theo mục đích, còn hai tool trùng việc hay luôn được gọi nối nhau thì gộp thành một tool có thêm tham số. Tham số và kết quả dùng mã định danh (ID) lấy từ một tool tra cứu, không dùng tên dễ trùng. System prompt có câu kiểu "thấy chữ X thì dùng tool Y" cũng phải sửa, vì nó kéo Claude chọn sai.

> **Bẫy đề**
>
> Claude chọn nhầm giữa hai tool, và đề đưa các đáp án như thêm ví dụ few-shot vào prompt, thêm một lớp định tuyến đoán ý định trước, hay gộp hai tool làm một. Hãy sửa đúng gốc trước, tức viết lại mô tả cho rõ.

### Bao nhiêu tool là vừa

Một agent có cả chục tool sẽ chọn kém hơn agent chỉ có vài tool đúng vai.

- Mỗi subagent chỉ có đúng bộ tool nó cần.
- Thay tool chung chung (gọi URL bất kỳ) bằng tool có giới hạn (chỉ tra trên vài nguồn được duyệt).
- Việc nhỏ mà subagent cần thường xuyên (kiểm một dữ kiện) thì cho nó một tool hẹp làm đúng việc đó, dù việc thuộc vai khác, còn việc phức tạp vẫn đi qua agent điều phối.
- Nếu bộ tool rất lớn, hãy đặt `defer_loading: true` và để Claude tìm tool khi cần bằng **tool search**, thay vì nạp hết từ đầu.

**`tool_choice`** quyết định Claude có bắt buộc phải gọi tool hay không:

| `tool_choice` | Nghĩa | Dùng khi |
| --- | --- | --- |
| `{"type": "auto"}` | Claude tự quyết, có thể trả lời bằng chữ | Mặc định |
| `{"type": "any"}` | Phải gọi một tool nào đó | Chưa biết tài liệu thuộc loại nào, nhưng phải trích bằng tool |
| `{"type": "tool", "name": "..."}` | Phải gọi đúng tool này | Một bước bắt buộc chạy trước, rồi chuyển về `auto` |

Trước khi ép tool, hãy kiểm tra model đang dùng có cho ép không.

### Trả lỗi để agent biết làm gì tiếp

Tool MCP (tool gắn từ bên ngoài, giải thích ở mục dưới) gặp lỗi khi chạy thì trả kết quả có **`isError: true`**, kèm loại lỗi (`errorCategory`), có nên retry không (`isRetryable`) và một câu giải thích chỉ bước tiếp theo. Nếu tool trả mỗi câu "Thao tác thất bại" cho mọi lỗi, agent không biết nên retry, đổi cách hay dừng.

| Loại lỗi | Ví dụ | Retry có ích không |
| --- | --- | --- |
| Tạm thời (**transient**) | Hết thời gian chờ, dịch vụ đang bận | Có, sau một lúc |
| Dữ liệu sai (**validation**) | Mã đơn sai định dạng | Không, trừ khi sửa đầu vào trước |
| Vi phạm quy định (**business**) | Hoàn tiền vượt hạn mức | Không, nói rõ cách khác để làm |
| Không có quyền (**permission**) | Không được xem đơn của người khác | Không, trừ khi được cấp quyền |

Gặp lỗi tạm thời, tool nên tự retry ngay tại chỗ với **exponential backoff** (mỗi lần chờ lâu hơn lần trước), và chỉ báo lên khi vẫn không được. Tool không biết lệnh đã chạy hay chưa, như gửi thông báo bị timeout, thì nói rõ là chưa biết và dặn agent đừng retry. Tra xong mà không có gì khớp là **kết quả rỗng hợp lệ**, không phải lỗi, nên tool phải trả nó khác với trường hợp chưa tra được.

1. **Không kết nối được nguồn dữ liệu** → isError loại transient, tool tự retry trước
2. **Đầu vào sai định dạng** → isError loại validation, nói rõ cần sửa gì
3. **Vi phạm quy định hoặc thiếu quyền** → isError, không retry, gợi ý cách khác
4. **Tra xong mà không có gì khớp** → Trả danh sách rỗng, vì đây không phải lỗi
- **Còn lại** → Trả kết quả bình thường

### Gắn MCP server vào Claude Code

**MCP** (Model Context Protocol) là chuẩn chung để đưa tool và dữ liệu bên ngoài (GitHub, Jira, cơ sở dữ liệu) cho Claude dùng. Mỗi nguồn là một **MCP server**.

| Đặt ở đâu | Ai dùng | Ví dụ |
| --- | --- | --- |
| `.mcp.json` trong repo | Cả nhóm, đi theo repo | Server Jira của dự án |
| `~/.claude.json` trong thư mục home | Chỉ bạn | Server thử nghiệm của riêng bạn |

- **Hệ thống phổ biến** như GitHub, Jira đã có server làm sẵn, bạn chỉ tự viết server cho quy trình riêng.
- **Token truy cập** (như GitHub token) không ghi thẳng vào `.mcp.json`. Viết `${GITHUB_TOKEN}`, mỗi người tự đặt biến môi trường trên máy mình.
- **Agent không chịu dùng tool MCP** mà cứ dùng Grep thì hãy viết lại mô tả tool MCP, nói rõ nó làm gì, nhận gì, trả gì, và tốt hơn tool có sẵn ở chỗ nào.
- Dữ liệu có dạng danh mục, như danh sách issue hay schema database, nên đưa ra thành **MCP resource**, tức dữ liệu server bày sẵn cho agent đọc, để agent biết có những gì mà không phải gọi tool đi dò.

### Tool có sẵn của Claude Code

| Tool | Dùng để |
| --- | --- |
| Grep | Tìm **nội dung** trong file, như hàm này được gọi ở đâu |
| Glob | Tìm file theo **tên**, như mọi file `*.test.tsx` |
| Read / Write | Đọc cả file / ghi đè cả file |
| Edit | Sửa một đoạn, với điều kiện đoạn cần sửa chỉ khớp đúng một chỗ |
| Bash | Chạy lệnh như test, build, git, không dùng cho việc đã có Read, Grep, Glob |

- **Khi Edit báo không tìm được chỗ duy nhất** vì đoạn cần sửa lặp lại ở nhiều nơi, hãy Read cả file, sửa đúng chỗ, rồi Write lại.
- **Muốn tìm hiểu codebase**, hãy đi từ entry point rồi lần theo import. Hàm được export lại dưới tên khác thì Grep tiếp từng tên mới.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Claude chọn nhầm tool | Viết lại mô tả tool: làm gì, khi nào dùng, khi nào không |
> | Một tool làm quá nhiều việc | Tách thành các tool theo mục đích |
> | Agent có quá nhiều tool | Mỗi agent chỉ giữ tool đúng vai |
> | Subagent hay cần một việc nhỏ của vai khác | Một tool hẹp làm đúng việc đó |
> | Một tool phải chạy trước mọi việc | Ép đúng tool đó ở request đầu, rồi về `auto` |
> | Tool lỗi mà agent không biết làm gì | `isError: true`, kèm loại lỗi và `isRetryable` |
> | Timeout, không biết lệnh đã chạy chưa | Báo rõ là chưa biết, dặn agent đừng retry |
> | Không tìm thấy kết quả nào | Trả danh sách rỗng, không báo lỗi |
> | MCP server dùng chung cho nhóm | `.mcp.json` trong repo, token trong `${VAR}` |
> | Agent bỏ qua tool MCP | Viết lại mô tả tool MCP |

**Học kỹ domain này**

- [2.1 Thiết kế tool có mô tả rõ ràng và ranh giới tách bạch](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-1-thiet-ke-tool) (20 phút đọc)
- [2.2 Trả lỗi có cấu trúc từ tool MCP](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-2-loi-co-cau-truc-mcp) (19 phút đọc)
- [2.3 Phân tool cho từng agent và cấu hình tool_choice](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-3-phan-tool-va-tool-choice) (17 phút đọc)
- [2.4 Tích hợp MCP server vào Claude Code và agent](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-4-tich-hop-mcp-server) (16 phút đọc)
- [2.5 Dùng đúng tool có sẵn Read, Write, Edit, Bash, Grep, Glob](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-5-tool-co-san-claude-code) (15 phút đọc)

## Domain 3: Claude Code Configuration & Workflows

Domain này hỏi nên đặt hướng dẫn cho Claude Code ở đâu, khi nào lập kế hoạch trước, và cách chạy Claude Code trong CI.

### CLAUDE.md: hướng dẫn nạp từ đâu

**CLAUDE.md** là file hướng dẫn Claude Code đọc khi bắt đầu làm việc. File có nhiều cấp, được **nối lại** với nhau chứ không ghi đè nhau.

- `~/.claude/CLAUDE.md` là thói quen riêng, chỉ có trên máy bạn.
- `CLAUDE.md` ở gốc repo là quy ước chung, commit lên git nên cả nhóm cùng thấy.
- `CLAUDE.md` ở thư mục đang mở và thư mục cha nạp lúc mở session, còn ở thư mục con thì chỉ nạp khi Claude đụng tới file trong đó.

Ngoài các cấp CLAUDE.md, bạn cần biết thêm bốn chuyện.

- **`@duong/dan`** trong CLAUDE.md kéo thêm một file khác vào. Trong repo nhiều package, CLAUDE.md của mỗi package dùng cách này để chỉ kéo đúng file quy ước nó cần.
- **Rule theo đường dẫn**: file trong `.claude/rules/` có field `paths` với mẫu glob (như `**/*.test.tsx`) chỉ nạp khi Claude đụng tới file khớp mẫu, hợp với quy ước cho một loại file rải rác khắp repo.
- **Khi Claude lúc theo hướng dẫn lúc không**, việc đầu tiên là xem session đang nạp những file nào. Đề dùng lệnh `/memory`, bản hiện nay dùng `/context all`.
- **Yêu cầu không được phép sai**, như cấm sửa thư mục migration, đặt vào `permissions.deny`. Việc phải chạy sau mỗi lần sửa, như Prettier, đặt vào hook.

**Sơ đồ: Mọi cấp CLAUDE.md nối vào cùng context; thư mục con và rule chỉ nạp khi Claude đụng tới file**
_Năm nguồn hướng dẫn của Claude Code: ba nạp lúc mở session, hai nạp khi Claude đụng tới file, tất cả nối vào cùng một context_

- **NẠP LÚC MỞ SESSION**
- **~/.claude/CLAUDE.md**: chỉ máy bạn
- **CLAUDE.md gốc repo**: commit, cả nhóm thấy
- **CLAUDE.md thư mục đang mở**: và thư mục cha
- **NẠP KHI CLAUDE ĐỤNG TỚI FILE**
- **CLAUDE.md thư mục con**: file trong thư mục đó
- **.claude/rules/ có paths**: file khớp mẫu glob
- **Context**: riêng bạn
- quy ước nhóm
- thư mục đang mở
- nối lại với nhau,
- không ghi đè
- thư mục con
- rule khớp file

| Hướng dẫn kiểu này | Đặt ở |
| --- | --- |
| Quy ước đúng mọi lúc, cho cả nhóm | CLAUDE.md ở gốc repo |
| Quy ước chỉ đúng trong một thư mục | CLAUDE.md trong thư mục đó |
| Quy ước cho một loại file rải rác | `.claude/rules/` có `paths` |
| Quy trình cho một loại việc, gọi khi cần | Skill hay slash command |
| Thói quen riêng của bạn | `~/.claude/CLAUDE.md` |

> **Bẫy đề**
>
> "Người mới vào nhóm, Claude Code không làm theo quy ước của nhóm" thường nghĩa là quy ước đang nằm ở `~/.claude/CLAUDE.md` trên máy một người. Hãy chuyển quy ước vào CLAUDE.md trong repo.

### Slash command và skill

- **Slash command** là lệnh tắt gõ `/ten-lenh`. Lệnh cho cả nhóm đặt trong `.claude/commands/` của repo, lệnh riêng đặt trong `~/.claude/commands/`.
- **Skill** là một quy trình đóng gói gồm file `SKILL.md` kèm tài liệu và script, Claude tự dùng khi gặp đúng loại việc. Skill cho cả nhóm đặt trong `.claude/skills/` của repo. Skill riêng nên đặt tên khác trong `~/.claude/skills/` để không đè lên skill cùng tên của nhóm. Phần frontmatter (khối khai báo ở đầu `SKILL.md`) có ba field cần nhớ.
  - **`context: fork`** cho skill chạy trong một subagent riêng, chỉ kết quả cuối quay về cuộc trò chuyện chính, nên output dài không làm đầy context.
  - **`allowed-tools`** cho các tool được liệt kê chạy mà không cần hỏi quyền. Muốn bỏ hẳn một tool lúc skill chạy thì dùng `disallowed-tools`.
  - **`argument-hint`** gợi ý tham số khi gõ lệnh.

### Lập kế hoạch trước hay làm ngay

**Plan mode** là chế độ Claude chỉ đọc và lập kế hoạch, chưa sửa file nào. Bạn duyệt kế hoạch rồi mới cho làm.

1. **Thay đổi lan ra nhiều file, nhiều module** → Plan mode
2. **Có nhiều cách làm, phải chọn trước** → Plan mode
3. **Có quyết định kiến trúc hay hạ tầng** → Plan mode
4. **Phải khảo sát nhiều, sợ đầy context của cuộc trò chuyện chính** → Giao cho subagent Explore khảo sát
- **Còn lại** → Việc nhỏ, rõ chỗ sửa thì làm ngay

Khi kết quả chưa đúng ý và phải sửa nhiều lần, cách sửa tuỳ vào vấn đề bạn đang gặp.

| Vấn đề | Cách làm |
| --- | --- |
| Mô tả bằng lời mà Claude hiểu mỗi lần một kiểu | Đưa 2–3 ví dụ đầu vào và đầu ra cụ thể (con số của câu đề này) |
| Hành vi và edge case đã rõ | Viết test trước, đưa test đang fail cho Claude sửa |
| Một edge case cụ thể bị sai | Đưa một test case có đầu vào mẫu và đầu ra mong đợi |
| Lĩnh vực bạn chưa quen | Để Claude phỏng vấn bạn trước khi làm |
| Nhiều lỗi ảnh hưởng qua lại | Gom vào một tin nhắn chi tiết |
| Nhiều lỗi độc lập | Sửa lần lượt từng lỗi |

### Claude Code trong pipeline CI

**CI** (Continuous Integration) là các bước tự động chạy mỗi khi có commit hay pull request. Ở đây Claude chạy trong CI để review code.

- **`-p`** chạy một lần rồi thoát, không chờ người gõ. Thiếu flag này thì pipeline treo.
- **`--output-format json`** kèm **`--json-schema`** cho kết quả đúng khuôn. Script của pipeline đọc field `structured_output` rồi đăng comment lên PR.
- **`--append-system-prompt`** nối chỉ dẫn vào prompt mặc định, còn `--system-prompt` thay hẳn prompt đó.
- **Context của dự án**, như tiêu chí test và fixture có sẵn, ghi vào CLAUDE.md, vì Claude Code trong CI cũng đọc file này.
- **`--max-turns`** và **`--max-budget-usd`** giới hạn số vòng và số tiền của một lần chạy.
- **Khi review lại sau commit mới**, hãy đưa kết quả lần trước vào và dặn chỉ báo lỗi mới hoặc lỗi chưa sửa. Khi sinh test, đưa các file test đang có vào để Claude khỏi viết trùng.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Quy ước cho cả nhóm | CLAUDE.md trong repo |
> | Quy ước cho một loại file rải rác | `.claude/rules/` có `paths` |
> | Lệnh dùng chung cho cả nhóm | `.claude/commands/` trong repo |
> | Skill có output khảo sát dài | `context: fork` |
> | Việc lớn, nhiều cách làm, có kiến trúc | Plan mode trước |
> | Lời mô tả bị hiểu mỗi lần một kiểu | 2–3 ví dụ đầu vào và đầu ra |
> | Pipeline CI bị treo | Thêm `-p` |
> | Cần kết quả script đọc được | `--output-format json` kèm `--json-schema` |
> | Review lại bị comment trùng | Đưa kết quả lần trước, chỉ báo lỗi mới hoặc chưa sửa |

**Học kỹ domain này**

- [3.1 Phân cấp CLAUDE.md, @import và .claude/rules](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-1-phan-cap-claude-md) (18 phút đọc)
- [3.2 Tạo slash command và skill cho Claude Code](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-2-slash-command-va-skill) (18 phút đọc)
- [3.3 Rule theo đường dẫn trong .claude/rules](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-3-rule-theo-duong-dan) (12 phút đọc)
- [3.4 Khi nào dùng plan mode, khi nào làm ngay](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-4-plan-mode-hay-lam-ngay) (17 phút đọc)
- [3.5 Tinh chỉnh lặp lại cho tới khi đúng](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-5-tinh-chinh-lap-lai) (20 phút đọc)
- [3.6 Đưa Claude Code vào pipeline CI/CD](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-6-claude-code-trong-ci) (18 phút đọc)

## Domain 4: Prompt Engineering & Structured Output

Domain này hỏi cách viết prompt cho kết quả ổn định, lấy JSON đúng khuôn, xử lý hàng nghìn tài liệu cho rẻ, và review nhiều lần.

### Tiêu chí cụ thể và ví dụ mẫu

- **Viết tiêu chí cụ thể** thay cho lời khuyên chung. "Hãy thận trọng" không làm review chính xác hơn, còn "báo bug và lỗi bảo mật, bỏ qua style nhỏ" thì Claude làm theo được.
- **Khi một loại comment của bot review báo sai quá nhiều**, dev bỏ qua luôn cả bot. Tạm tắt riêng loại đó, sửa tiêu chí cho loại đó, rồi mới bật lại.
- **Mức nghiêm trọng** cần ví dụ code cho từng mức, để Claude so lỗi mới với ví dụ thay vì đoán theo tên mức.
- **System prompt đầy điều kiện "nếu… thì…"** thì thay bằng một nguyên tắc chung kèm lý do, chỉ giữ các điều kiện an toàn.
- **Hướng dẫn đã chi tiết mà kết quả vẫn không đều** thì thêm 2–4 ví dụ mẫu (**few-shot**), có ít nhất một ví dụ nhắm đúng ca mập mờ, mỗi ví dụ kèm lý do. Ví dụ còn giúp Claude giữ đúng định dạng và phân biệt code chấp nhận được với vấn đề thật.

### Lấy dữ liệu đúng khuôn JSON

**JSON schema** là bản mô tả khuôn dữ liệu, gồm các field, kiểu của từng field và field nào bắt buộc. Cách chắc nhất để lấy dữ liệu đúng khuôn là định nghĩa một **tool lấy schema đó làm tham số đầu vào**, rồi đọc dữ liệu từ lần Claude gọi tool. Thêm **`strict: true`** để bảo đảm kết quả đúng schema.

- **Schema chỉ bảo đảm đúng khuôn, không bảo đảm đúng nghĩa.** Tổng tiền điền sai vẫn qua schema. Thêm field `calculated_total` để Claude tự cộng các dòng hàng, đặt cạnh `stated_total` ghi trên tài liệu, rồi cho code gắn cờ khi hai giá trị lệch nhau.
- **Field có thể không có** trong tài liệu thì cho phép `null` hoặc để tuỳ chọn, vì nếu bắt buộc điền, Claude sẽ bịa. Nếu thông tin nằm ở tài liệu không được gửi kèm, retry cũng vô ích, hãy để `null` và chuyển cho người xử lý.
- **Nếu enum (danh sách giá trị cho phép) có thể thiếu trường hợp**, hãy thêm `other` kèm một field mô tả, và `unclear` cho ca mập mờ.

**Sơ đồ: Chỉ retry khi tài liệu đã gửi có thông tin; số tự cộng lệch số ghi thì gắn cờ cho người kiểm**
- Có
- Có, còn lượt retry
- kiểm lại
- Không, hoặcđã hết lượt retry
- Không
- Lệch
- Khớp
- Kết quả trượt kiểm tra(sai định dạng, lệch nghĩa)?
- Tài liệu đã gửicó thông tin đó?
- Retry kèm tài liệu,kết quả sai, lỗi cụ thể
- Chuyển cho người:để null
- So calculated_totalvới stated_total
- Chuyển cho người:gắn cờ để kiểm
- Đi tiếp, dùng kết quả

Field thêm vào schema cũng giúp đo chất lượng bot review. Muốn biết vì sao dev hay bỏ qua những gì bot báo, hãy thêm field `detected_pattern` vào từng phát hiện, rồi nhóm các lần bị bỏ qua theo field đó.

### Xử lý batch cho rẻ

**Message Batches API** cho bạn gửi nhiều request một lúc với giá chỉ bằng **một nửa**, đổi lại phải chờ, có khi tới 24 giờ. Ngược lại là gọi đồng bộ, tức gọi API như thường và nhận kết quả ngay.

1. **Có người hay quy trình đang chờ kết quả, như kiểm tra trước khi merge** → Gọi đồng bộ
2. **Agent cần gọi tool của bạn nhiều vòng** → Gọi đồng bộ, vì batch không chạy tool của bạn
3. **Có cam kết trả kết quả trong một số giờ** → Batch, nếu thời gian chờ tới lượt gửi batch cộng 24 giờ xử lý vẫn kịp hạn
- **Còn lại** → Không ai chờ thì dùng batch, rẻ một nửa

- **Thử prompt trên tập mẫu trước** bằng gọi đồng bộ, chỉnh xong mới chạy cả bộ bằng batch.
- Mỗi request trong batch mang một mã **`custom_id`** do bạn đặt. Kết quả về không theo thứ tự, nên ghép bằng mã này. Một phần batch bị lỗi thì sửa rồi chỉ gửi lại đúng các `custom_id` đó.

### Review nhiều lần

- **Session vừa viết code không nên tự review code đó**, vì Claude vẫn giữ lập luận lúc viết nên ít khi nghi ngờ quyết định của mình. Hãy dùng một session khác, chỉ đưa cho nó code và tiêu chí.
- **PR lớn**: review từng file một lần riêng, rồi thêm một lần tích hợp xem các file tác động lên nhau.
- **Tách bước tìm khỏi bước lọc.** Bước tìm báo mọi vấn đề để không sót, kèm độ tự tin và mức nghiêm trọng, rồi một bước khác lọc theo ngưỡng. Độ tự tin chỉ dùng sau khi tìm xong, để chuyển phát hiện tới đúng người xem. Đặt ngưỡng ngay lúc tìm thì Claude tự giấu bớt phát hiện.

> **Bẫy đề**
>
> Review bỏ sót lỗi trong PR lớn, và đề đưa các đáp án như "dùng model lớn hơn", "dùng context dài hơn", "bắt dev chia PR nhỏ lại". Hãy chọn chia lần review: từng file một, rồi một lần tích hợp.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Báo sai nhiều, dặn "cẩn thận" không ăn thua | Tiêu chí cụ thể: báo gì, bỏ qua gì |
> | Kết quả không đều ở ca mập mờ | 2–4 ví dụ few-shot kèm lý do |
> | Cần JSON đúng schema | Tool nhận JSON schema, `strict: true` |
> | Phải gọi tool trích xuất, chưa biết loại tài liệu | `tool_choice` `any` |
> | Tổng tiền sai mà vẫn qua schema | `calculated_total` cạnh `stated_total`, gắn cờ khi lệch |
> | Retry sau khi trượt kiểm tra | Gửi kèm tài liệu, kết quả sai và lỗi cụ thể |
> | Việc chạy qua đêm, không ai chờ | Message Batches API |
> | Bước review chặn merge | Gọi đồng bộ |
> | Một phần batch lỗi | Gửi lại đúng các `custom_id` lỗi |

**Học kỹ domain này**

- [4.1 Viết prompt có tiêu chí rõ ràng để bớt báo sai](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-1-tieu-chi-ro-rang) (17 phút đọc)
- [4.2 Dùng few-shot để kết quả nhất quán](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-2-few-shot) (18 phút đọc)
- [4.3 Ép đầu ra có cấu trúc bằng tool use và JSON schema](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-3-output-co-cau-truc) (18 phút đọc)
- [4.4 Kiểm tra, retry và vòng phản hồi cho dữ liệu trích xuất](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-4-kiem-tra-va-thu-lai) (13 phút đọc)
- [4.5 Thiết kế xử lý theo lô cho hiệu quả](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-5-xu-ly-theo-lo) (15 phút đọc)
- [4.6 Thiết kế review nhiều instance và nhiều lần](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-6-review-nhieu-luot) (14 phút đọc)

## Domain 5: Context Management & Reliability

Domain này hỏi cách giữ thông tin khi hội thoại dài, khi nào chuyển cho người, cách báo lỗi giữa các agent, người duyệt, và nguồn của thông tin.

### Giữ thông tin quan trọng khi hội thoại dài

**Context** là toàn bộ những gì Claude thấy trong một lần gọi: system prompt, lịch sử chat, kết quả tool. API không giữ trạng thái, nên mỗi lần gọi bạn phải gửi lại đủ lịch sử và system prompt.

- **Hội thoại dài** thì tóm tắt các message cũ và giữ nguyên văn các message gần đây (**progressive summarization**), thay vì dùng sliding window cắt bỏ hẳn phần cũ. Ở điểm ngắt tự nhiên, chèn một message role `user` nhắc lại nguyên tắc nếu Claude bắt đầu lệch giọng.
- **Tóm tắt dần làm rơi chi tiết** như số tiền, ngày, mã đơn. Hãy tách chúng ra một khối riêng (**case facts**, các dữ kiện của vụ việc), luôn gửi ở đầu context và không đưa qua bước tóm tắt.
- **Kết quả tool có quá nhiều field** thì chỉ giữ các field liên quan trước khi đưa vào context.
- **Với đầu vào dài**, hãy đặt bản tóm tắt phát hiện chính ở đầu, chia mục có tiêu đề rõ. Thông tin nằm giữa một khối dài dễ bị bỏ sót.

> **Bẫy đề**
>
> Agent quên mã tài khoản và số tiền sau nhiều lần tóm tắt, và đề đưa các đáp án như tóm tắt thường hơn hay đổi sang model context lớn hơn. Tóm tắt thường hơn chỉ nén thêm một lần nữa, còn context càng dài thì Claude càng dễ sót chi tiết. Hãy chọn tách số liệu ra khối case facts.

### Khám phá codebase lớn

Khi session khám phá kéo dài, chất lượng câu trả lời giảm dần. Claude bắt đầu nói "mẫu thường gặp" thay vì tên class đã tìm ra, và quên những gì tìm được lúc đầu. Có bốn cách tránh chuyện này.

- **File ghi chú**: ghi những điều đã kiểm tra ra file, đọc lại file đó trước khi trả lời.
- **Subagent cho từng câu hỏi cụ thể**: subagent đọc nhiều rồi chỉ trả tóm tắt, cuộc trò chuyện chính giữ bức tranh tổng thể. Sang giai đoạn sau, hãy tóm tắt phát hiện của giai đoạn trước rồi đưa vào prompt giao việc cho subagent mới.
- Với hệ nhiều agent chạy lâu, mỗi agent ghi trạng thái ra một file cố định gọi là **manifest**. Sau sự cố, agent điều phối đọc manifest để chạy tiếp thay vì làm lại từ đầu.
- Khi context đầy output dài, hãy gõ **`/compact`** để thu gọn lịch sử thành bản tóm tắt, và dặn kèm phần nào cần giữ.

### Khi nào chuyển cho người

1. **Khách nói rõ muốn gặp nhân viên** → Chuyển ngay kèm lịch sử chat, không cố giải quyết trước
2. **Chính sách không quy định, hoặc cần ngoại lệ** → Chuyển, kèm bản bàn giao
3. **Đã thử mà không tiến triển được** → Chuyển, kèm những gì đã thử
4. **Khách chỉ đang bực, việc vẫn trong khả năng** → Ghi nhận và đề nghị giải quyết, khách vẫn đòi thì chuyển
- **Còn lại** → Còn lại thì agent tự giải quyết

| Đừng dùng để quyết định chuyển | Vì |
| --- | --- |
| Mức độ bực bội của khách | Không phản ánh độ khó của vụ việc |
| Điểm tự tin Claude tự chấm | Claude hay tự tin nhầm, mà lại nhầm đúng ở những ca khó |

Hãy viết rõ tiêu chí chuyển trong system prompt, kèm few-shot cho các ca sát ranh giới. Khi tra ra nhiều khách cùng khớp, agent hỏi thêm thông tin nhận dạng. Khi khách chưa nói rõ muốn gì, agent nêu giả định và gợi ý luôn, chỉ hỏi lại trước những bước khó đảo ngược.

### Lỗi trong hệ nhiều agent

Giấu lỗi bằng kết quả rỗng và để một lỗi nhỏ làm dừng cả quy trình đều sai. Cách đúng nằm ở giữa.

- **Subagent tự retry lỗi tạm thời.** Nếu retry thành công, nó báo kết quả như bình thường, không cần báo lỗi lên agent điều phối.
- **Lỗi không tự gỡ được thì báo lên có cấu trúc**: loại lỗi, việc đã thử, kết quả từng phần, cách khác có thể làm. Agent điều phối nhờ vậy chỉ làm lại phần lỗi.
- **Lỗi truy cập khác kết quả rỗng hợp lệ.** Không vào được nguồn thì phải báo lỗi, đừng trả danh sách rỗng.
- **Báo cáo cuối ghi rõ** phần nào còn thiếu vì lỗi.

### Người duyệt và độ tin cậy

Đúng 97% chưa chắc đã ổn, vì con số tổng có thể che một loại tài liệu chỉ đúng 70%.

- **Kiểm theo từng nhóm**: tính độ chính xác riêng cho từng loại tài liệu và từng field trước khi bớt người duyệt.
- Cho Claude chấm **điểm tin cậy từng field** (field-level confidence), rồi **hiệu chỉnh** điểm đó trên một tập tài liệu đã có người gắn nhãn đúng sai. Ngưỡng để chuyển cho người duyệt chọn theo tỉ lệ đúng thật đo trên tập đó, không theo cảm giác của Claude.
- **Kết quả cho bước sau** gồm field kèm điểm, cờ `requires_review` tính theo ngưỡng đã hiệu chỉnh, và mảng `review_reasons` nói field nào cần duyệt.
- **Lấy mẫu ngẫu nhiên phân tầng** (stratified random sampling): mỗi tuần người duyệt xem lại một tỉ lệ cố định trong số kết quả đã bỏ qua bước duyệt, chia theo nhóm, để vẫn đo được lỗi và bắt kiểu lỗi mới.
- **Dồn người duyệt vào ca khó**: field điểm thấp, tài liệu mơ hồ hoặc tự mâu thuẫn. Nếu tài liệu ghi hai giá trị khác nhau cho cùng một field, hãy đưa cho người duyệt, bất kể Claude tự tin tới đâu.

### Giữ nguồn của thông tin

Mỗi bước tóm tắt trong hệ nghiên cứu nhiều agent có thể làm rơi "câu này lấy từ đâu" mà không có lỗi nào báo ra.

- **Ánh xạ nhận định với nguồn**, tức bản ghi cho biết nhận định nào lấy từ nguồn nào: với từng nhận định, subagent ghi URL hay tên tài liệu, đoạn trích và ngày. Agent tổng hợp (subagent gộp kết quả) giữ và gộp các ánh xạ đó, và agent viết báo cáo nhận bản nháp kèm chỉ mục nguồn chứ không nhận toàn bộ nội dung thô.
- **Hai nguồn đáng tin đưa hai con số khác nhau**: giữ cả hai, ghi rõ mâu thuẫn kèm nguồn của từng giá trị, để agent điều phối hay người dùng tự đối chiếu. Không lấy trung bình, không chọn nguồn mới nhất.
- **Ngày công bố hay ngày thu thập** phải có trong output có cấu trúc, vì số liệu năm 2023 và năm 2025 khác nhau có thể chỉ là thay đổi theo thời gian, không phải mâu thuẫn.
- **Tài liệu có phụ lục sửa đổi** thì cho field bị sửa chứa nhiều giá trị, mỗi giá trị kèm vị trí và ngày có hiệu lực.
- **Báo cáo có phần riêng** cho phát hiện đã vững và phát hiện còn tranh cãi, ghi lại đúng cách nguồn diễn đạt và phương pháp nguồn đã dùng.
- **Mỗi loại nội dung một cách trình bày**: số liệu tài chính thành bảng, tin tức thành văn xuôi, kết quả kỹ thuật thành danh sách có cấu trúc.

Với tài liệu đưa thẳng vào request, tính năng **citations** của Claude API gắn từng nhận định với đoạn trích và vị trí (số trang hay vị trí ký tự), nên người đọc mở được đúng đoạn nguồn. Citations chỉ trả đoạn trích và vị trí. Nó không xử lý chuyện hai nguồn vênh số và không ghi ngày công bố.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Claude quên chuyện khách vừa nói | Gửi lại đủ lịch sử ở mỗi lần gọi |
> | Hội thoại dài làm sai số tiền, mã đơn | Khối case facts riêng, không qua tóm tắt |
> | Khám phá dài, trả lời chung chung dần | File ghi chú, subagent cho câu hỏi cụ thể, `/compact` |
> | Khách đòi gặp người | Chuyển ngay |
> | Nhiều khách trùng tên | Hỏi thêm thông tin nhận dạng, không tự chọn |
> | Subagent gặp lỗi tạm thời | Tự retry, không báo lên |
> | Subagent gặp lỗi không tự gỡ được | Báo loại lỗi, đã thử gì, kết quả từng phần |
> | Muốn bớt người duyệt | Kiểm theo nhóm, hiệu chỉnh điểm, lấy mẫu phân tầng |
> | Báo cáo mất nguồn | Ánh xạ nhận định với nguồn, giữ qua mọi bước |
> | Hai nguồn đáng tin nói khác nhau | Giữ cả hai, kèm nguồn |
> | Số liệu khác năm bị báo là mâu thuẫn | Ghi ngày trong output có cấu trúc |

**Học kỹ domain này**

- [5.1 Giữ thông tin quan trọng trong cuộc trò chuyện dài](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-1-quan-ly-context) (31 phút đọc)
- [5.2 Khi nào chuyển cho người, và xử lý yêu cầu mơ hồ](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-2-chuyen-cho-nguoi-va-mo-ho) (22 phút đọc)
- [5.3 Truyền lỗi giữa các agent trong hệ thống nhiều agent](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-3-lan-truyen-loi) (15 phút đọc)
- [5.4 Quản lý context khi tìm hiểu codebase lớn](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-4-kham-pha-codebase-lon) (22 phút đọc)
- [5.5 Thiết kế quy trình người duyệt và hiệu chỉnh độ tin cậy](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-5-nguoi-duyet-va-do-tin-cay) (18 phút đọc)
- [5.6 Giữ nguồn gốc thông tin khi tổng hợp từ nhiều nguồn](https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-6-nguon-goc-thong-tin) (19 phút đọc)

## Mẹo chọn đáp án khi phân vân

Câu hỏi mẫu của Anthropic lặp lại vài quy tắc. Khi phân vân giữa hai đáp án, hãy thử lần lượt các quy tắc sau.

1. **Sửa đúng chỗ hỏng, bằng cách nhẹ nhất trước.** Claude chọn nhầm tool vì mô tả sơ sài thì viết lại mô tả, chưa cần thêm lớp định tuyến hay gộp tool.
2. **Việc bắt buộc tuyệt đối thì chặn bằng code**, như hook `PreToolUse` hay `permissions.deny`, không chỉ dặn trong prompt.
3. **Không dựa vào cảm xúc của khách hay điểm tự tin Claude tự chấm** để quyết định chuyển cho người. Hãy viết tiêu chí rõ ràng.
4. **Cẩn thận với đáp án "làm to"** như thêm model phân loại riêng, đổi sang model lớn hơn, dùng context dài hơn. Thường đó là làm quá tay khi chưa thử cách đơn giản.
5. **Không chọn đáp án giấu thông tin**: trả rỗng thay cho báo lỗi, chọn bừa một con số khi hai nguồn vênh nhau, bỏ phát hiện còn tranh cãi cho báo cáo trông tự tin.
6. **Không chọn đáp án đẩy việc sang người dùng hay dev**, như bắt dev tự chia nhỏ pull request.
7. **Không chọn tính năng không có thật**, như biến `CLAUDE_HEADLESS`, flag `--batch`, hay file `.claude/config.json` có mảng `commands`.

## Tên trong đề và tên hiện nay

Đề soạn từ tháng 07/2026, nên vài tên và hành vi đã khác bản hiện nay. Khi thi, hãy chọn theo đề.

| Trong đề | Hiện nay |
| --- | --- |
| Tool gọi subagent tên `Task`, phải có trong danh sách tool được phép | Agent SDK gọi là `Agent`, chạy được miễn không nằm trong `disallowed_tools` |
| `tool_choice` `any` hoặc ép một tool | Claude Opus 5.5, Sonnet 5.5, Fable 5.2, Mythos 5.2, Fable 5.1, Mythos 5.1 trả lỗi 400, nên dùng `auto` kèm `strict`. Haiku 5.5 vẫn ép được, và bật thinking thủ công thì model nào cũng báo lỗi |
| 2–4 ví dụ few-shot | Hướng dẫn prompt hiện khuyên 3–5 ví dụ |
| Lời dặn "hãy thận trọng" không tăng precision | Hướng dẫn prompt hiện nói precision có thể nhích lên nhưng recall tụt, nên vẫn không dùng làm cách lọc |
| Tool MCP nạp hết lúc kết nối | Claude Code chỉ nạp tên, mô tả đầy đủ nạp khi cần (tool search) |
| Glob và Grep là tool riêng | Chỉ có sẵn trên một số nền tảng, nơi khác Claude dùng `find` và `grep` qua Bash |
| `/memory` để xem file hướng dẫn đã nạp | `/memory` liệt kê và mở file, danh sách đã nạp thật nằm ở `/context all` |
| Slash command trong `.claude/commands/` | Lệnh tự tạo đã gộp vào skill, file cũ vẫn chạy |
| Batch không chạy được tool | Batch vẫn chạy server tool như web search, chỉ không chạy tool của bạn |
| Phải dùng subagent để giữ context | Claude Code có context window 1 triệu token trên phần lớn model và tự compact, nhưng context gọn vẫn cho câu trả lời tốt hơn |
| Chèn message role `user` nhắc lại nguyên tắc ở điểm ngắt | Claude API có thêm message role `system` chèn giữa cuộc trò chuyện trên các model mới |

## Nguồn

1. [Exam Guide CCAR-F v1.0](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [How the agent loop works (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/agent-loop)
3. [Define tools (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
4. [How Claude remembers your project (Claude Code)](https://code.claude.com/docs/en/memory)
5. [Batch processing (Claude API)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
6. [Citations (Claude API)](https://platform.claude.com/docs/en/build-with-claude/citations)
