---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-3-chon-kien-truc-khi-mo-rong
ngay_tai: 2026-11-27
tieu_de: Chọn kiến trúc khi hệ thống lớn lên - workflow hay agent, harness nào, chuẩn dùng chung cho team
---

Domain 1: Advanced Agent Architecture and Orchestration · Task 1.3

# Chọn kiến trúc khi hệ thống lớn lên - workflow hay agent, harness nào, chuẩn dùng chung cho team

Đọc số liệu chi phí, độ tin cậy, chất lượng của hệ đang chạy để quyết định đổi giữa workflow và agent, chọn harness, và đặt chuẩn skill, plugin cho cả team.

- 21 phút đọc
- Đối chiếu docs 21/11/2026
- 13 nguồn

## Đọc xong bạn nắm được

- Dùng số liệu chi phí, tỉ lệ xử lý được và độ trễ của từng nhánh để quyết định nhánh nào nên lên agent, nhánh nào nên quay về workflow
- Chọn giữa Messages API, Agent SDK và Managed Agents theo việc ai chạy vòng lặp gọi model và tool, ai giữ session, và dữ liệu nằm ở đâu
- Biết những gì phải tự làm lại khi chuyển sang Managed Agents, và vì sao các bước harness thêm vào để bù chỗ yếu của một model cần kiểm lại mỗi lần đổi model
- Đặt chuẩn dùng chung cho nhiều team bằng skill và plugin có người duyệt, có eval trước khi phát hành, và pin version cho production

Ngày đầu dựng một hệ thống dùng Claude, chọn workflow hay agent phần lớn là đoán. Chạy được vài tháng thì đội đã có số liệu thật, như mỗi loại việc tốn bao nhiêu tiền, bao nhiêu phần trăm xử lý xong mà không cần tới người, và chậm ở bước nào. Lúc đó câu hỏi không còn là "workflow hay agent" chung chung nữa. Câu hỏi là phần nào của hệ nên đổi cách làm, đổi theo chiều nào, và nên chạy trên nền nào.

Bài này giúp bạn trả lời ba câu. Đọc số liệu nào thì biết một phần của hệ nên chuyển từ workflow sang agent, hay ngược lại? Khi hệ lớn lên thì chạy agent bằng harness nào, tức phần mềm chạy vòng lặp gọi model và gọi tool quanh Claude? Và khi nhiều team cùng làm, đặt chuẩn gì để mọi người dùng chung một cách làm thay vì mỗi team tự viết một kiểu?

Tên task trong đề là **Architecture Selection at Scale**. Nó gồm việc dùng số liệu chi phí, độ tin cậy và chất lượng của hệ đang chạy (**production cost, reliability, and quality data**) để quyết định có chuyển hệ giữa **workflow** và **agentic patterns** hay không (**evolve between**), rồi chọn **agent harness**, **framework** và chuẩn cho các mẫu dùng lại được (**reusable-pattern standards**) mà team nên theo.

Nhắc lại hai khái niệm từ CCDV-F. Workflow là chuỗi bước do code định sẵn, model chỉ làm phần việc trong từng bước. Agent là model tự quyết bước tiếp theo và tự chọn tool cho tới khi xong việc. Hai khái niệm này có ở bài 1.1 của CCDV-F, ba cách dựng agent ở bài 1.2, còn skill ở bài 8.3.

**Sơ đồ: Đọc số liệu từng nhánh để đổi giữa workflow và agent, rồi chọn harness và đặt chuẩn dùng chung**
_Bản đồ bài: production data quyết định đổi giữa workflow và agent, rồi chọn agent harness, rồi đặt reusable-pattern standards_

- 1. **PRODUCTION DATA, ĐỌC THEO TỪNG NHÁNH**
- **cost**
- **reliability**
- **quality**
- **trace**
- **Workflow**: bước cố định trong code
- **Agent**: model tự chọn bước tiếp
- đa dạng, xử lý kém
- trace lặp một đường
- Multi-agent chỉ khi có context pollution, việc song song hay cần chuyên môn hoá
- 2. **AGENT HARNESS, FRAMEWORK**: ai chạy vòng lặp, ai giữ session
- **Messages API**: code của bạn
- **Agent SDK**: trong process
- **Managed Agents**: Anthropic host
- **CLI với -p**: subprocess
- framework: bắt đầu bằng API trực tiếp
- 3. **REUSABLE-PATTERN STANDARDS**: một bản nguồn trong git, có review
- **Skill**: SKILL.md
- **Plugin**: marketplace
- **Review + eval**: trước phát hành
- **Pin version**: cho production
- nâng version coi như một lần deploy

## Ví dụ xuyên suốt: hệ thống khiếu nại của một công ty giao hàng chặng cuối

Giao hàng chặng cuối là đoạn đưa gói hàng từ kho hàng trong thành phố tới tay người nhận. Một công ty làm việc này nhận khoảng 12.000 khiếu nại mỗi tháng, và mọi khiếu nại đi qua một workflow. Bước đầu của workflow là một lần gọi model để xếp khiếu nại vào một trong năm nhánh là trễ hàng, hư hỏng, sai địa chỉ, hoàn tiền và "khác". Mỗi nhánh có prompt và bộ tool riêng. Tính cả bước phân loại, mỗi khiếu nại tốn khoảng 0,03 USD, tức 360 USD mỗi tháng.

Bên cạnh workflow đó, công ty có một agent riêng để khách đổi lịch giao qua tin nhắn, khoảng 2.400 yêu cầu mỗi tháng. Agent này dùng ba tool `tra_van_don`, `xem_lich_trong` và `doi_lich_giao`. Ngoài ra, ba team chăm sóc khách hàng, kho hàng và tài chính đều có agent riêng cần tra vận đơn.

Sau sáu tháng chạy, đội nền tảng (nhóm lo phần Claude cho cả công ty) có bốn việc phải quyết, và mỗi việc là một mục của bài:

- Nhánh "khác" xử lý kém thì có nên chuyển sang agent không.
- Agent đổi lịch vừa chậm vừa đắt thì có nên bỏ không.
- Agent của nhánh "khác" nên chạy trên harness nào.
- Ba team đang tự viết ba bản chỉ dẫn tra vận đơn khác nhau thì gom lại thế nào.

## Đọc số liệu trước khi đổi kiến trúc

Anthropic khuyên tìm giải pháp đơn giản nhất trước, và chỉ thêm độ phức tạp khi nó cải thiện kết quả một cách đo được (_demonstrably improves outcomes_). Agent phức tạp hơn workflow, tốn token hơn và khó đoán hơn, nên câu "có nên lên agent không" phải trả lời bằng số đo chứ không bằng cảm giác.

Số đo phải tách theo từng nhánh, vì con số trung bình của cả hệ che mất nhánh đang có vấn đề. Với mỗi nhánh, đội nhìn bốn thứ:

- Chi phí cho mỗi ca xử lý xong, cho biết phần cost.
- Tỉ lệ xử lý xong mà không phải chuyển cho nhân viên, cùng độ trễ p50 và p95 (mức mà một nửa và 95% số ca xong nhanh hơn), cho biết nhánh đó có đáng tin không (reliability).
- Điểm trên bộ eval, tức tập ca cũ có đáp án chuẩn dùng để chấm, cho biết chất lượng câu trả lời (quality).
- Trace, tức chuỗi tool mà từng ca đã gọi. Trace cho biết đường đi của nhánh đó cố định, hay mỗi ca một kiểu.

Hai mục tiếp theo đi theo hai chiều ngược nhau. Mục đầu chuyển một nhánh từ workflow sang agent, mục sau kéo một agent về lại workflow.

### Khi nào chuyển một nhánh từ workflow sang agent

Nhánh "khác" chiếm 27% khiếu nại, tức khoảng 3.240 ca mỗi tháng, nhưng chỉ xử lý xong được 41%. Số còn lại bị đẩy sang nhân viên. Có người đề xuất bỏ hẳn workflow, thay bằng một agent nhận mọi khiếu nại.

Nhánh "khác" đúng là loại việc hợp với agent, vì không ai viết trước được đường đi của nó. Ca này là shipper cư xử không đúng, ca kia là hàng giao nhầm sang nhà hàng xóm, ca khác nữa là gói hàng kẹt ở hải quan, và mỗi ca cần một chuỗi tra cứu khác nhau. Workflow chỉ có một đường cố định cho cả nhánh, nên bỏ dở phần lớn các ca này.

Nhưng một nhánh hợp với agent không có nghĩa cả hệ nên là agent. Đội chạy thử một agent trên bộ eval gồm 300 khiếu nại cũ của mỗi nhánh. Agent tốn khoảng 0,18 USD mỗi khiếu nại, gấp sáu lần workflow. Ở bốn nhánh cố định, nó còn xử lý xong ít hơn một chút, 87% so với 88% của workflow cũ. Chỉ ở nhánh "khác" là agent hơn hẳn, tỉ lệ xử lý xong tăng từ 41% lên 79%.

Vì vậy đội chỉ chuyển nhánh "khác" sang agent. Chi phí mỗi tháng thành 846 USD, gồm 3.240 ca của nhánh "khác" với 0,18 USD và 8.760 ca còn lại với 0,03 USD. Nếu để agent nhận cả 12.000 ca thì sẽ là 2.160 USD.

**Sơ đồ: Bước phân loại vẫn là workflow, chỉ nhánh "khác" đi tới agent: 846 USD thay vì 2.160 USD mỗi tháng**
- 8.760 ca
- 3.240 ca, 27%
- nếu cả 12.000 calên agent
- Bước phân loạigiữ workflow12.000 khiếu nại/tháng
- Bốn nhánh cố định0,03 USD/khiếu nạixử lý xong 88%
- Nhánh "khác" sang agent0,18 USD/khiếu nạixử lý xong 41% → 79%
- Cả hệ846 USD/tháng
- 2.160 USD/thángbốn nhánh cố địnhchỉ xử lý xong 87%

Bước phân loại của workflow vẫn giữ nguyên, và agent chỉ là đích đến của một nhánh. Cách này là mẫu **routing**, tức phân loại đầu vào rồi gửi mỗi loại tới prompt, tool và model hợp với nó. Workflow và agent không loại trừ nhau. Một hệ có thể vừa có các nhánh cố định, vừa có một nhánh là agent.

### Khi nào kéo một agent về lại workflow

Chiều ngược lại cũng xảy ra. Agent đổi lịch giao tốn 0,16 USD mỗi yêu cầu, p95 độ trễ là 52 giây, và khách than chậm. Đội đọc trace của 30 ngày và thấy 93% yêu cầu gọi đúng ba tool theo cùng một thứ tự, là `tra_van_don` để lấy thông tin đơn, `xem_lich_trong` để xem khung giờ còn trống, rồi `doi_lich_giao`. Vậy mà agent vẫn mất trung bình chín lượt gọi model cho mỗi yêu cầu, chỉ để lần nào cũng chọn lại đúng con đường đó.

Khi trace cho thấy đường đi cố định như vậy, để code đi đường đó thì rẻ và nhanh hơn để model tự tìm. Đội đổi sang **prompt chaining** có cổng kiểm (_gate_). Prompt chaining là chia việc thành các bước nối tiếp, mỗi bước là một lần gọi model hoặc một đoạn code, kết quả bước trước làm đầu vào cho bước sau. Cổng kiểm là đoạn code kiểm kết quả giữa hai bước trước khi cho đi tiếp.

Với yêu cầu đổi lịch, code gọi `tra_van_don`, rồi một lần gọi model đọc tin nhắn của khách để chọn khung giờ. Code kiểm khung giờ đó có trong lịch trống không, có thì mới gọi `doi_lich_giao`. Yêu cầu nào không qua cổng kiểm, ví dụ khách hỏi chuyện khác chứ không phải đổi lịch, mới chuyển cho agent như trước.

Sau khi đổi, 2.232 yêu cầu (93%) đi đường cố định với khoảng 0,02 USD mỗi yêu cầu, và p95 của đường này chỉ còn khoảng 6 giây. 168 yêu cầu còn lại sang agent với 0,16 USD mỗi yêu cầu. Chi phí mỗi tháng giảm từ 384 USD xuống khoảng 71,5 USD.

**Sơ đồ: 93% yêu cầu đi cùng một đường thì giao đường đó cho code, agent chỉ nhận ca không qua cổng kiểm**
_Agent đổi lịch giao trước khi đổi, đặt trên prompt chaining bốn bước có cổng kiểm, ca không qua cổng mới sang agent_

- **TRƯỚC: AGENT TỰ CHỦ CHO MỌI YÊU CẦU**
- **2.400 yêu cầu mỗi tháng, trung bình 9 lượt gọi model mỗi yêu cầu**: trace 30 ngày: 93% đi đúng tra_van_don → xem_lich_trong → doi_lich_giao
- **0,16 USD mỗi yêu cầu · p95 52 giây · 384 USD/tháng**
- **SAU: PROMPT CHAINING CÓ CỔNG KIỂM (GATE)**
- 1. **Code gọi tool**: tra_van_don
- 2. **Model chọn giờ**: đọc tin nhắn khách
- **Cổng kiểm (code)**
- 3. có trong lịch trống?
- 4. **Code đổi lịch**: doi_lich_giao
- không qua
- **Qua cổng: 2.232 yêu cầu (93%)**: 0,02 USD/yêu cầu, p95 khoảng 6 giây
- **Agent như trước**: 168 yêu cầu × 0,16 USD
- **71,5 USD/tháng**: tổng khoảng
- trước là 384 USD

Giữ agent cho việc đã có đường đi rõ ràng là trả tiền cho sự linh hoạt mà không ai dùng tới. Agent còn có một rủi ro mà workflow không có. Mỗi bước nó tự quyết là một chỗ có thể sai, và sai ở bước đầu thì kéo theo các bước sau.

### Nhiều agent chỉ khi có lý do cụ thể

Khi hệ lớn lên, hay có thêm một đề xuất nữa là tách một agent thành nhiều agent chuyên trách. Hệ nhiều agent (**multi-agent**) thường tốn **3 đến 10 lần token** so với một agent làm cùng việc, vì context bị chép sang từng agent, các agent phải nhắn qua lại, và kết quả phải tóm tắt lại mỗi lần chuyển tay. Nó chỉ đáng khi rơi vào một trong ba trường hợp sau.

- Context bị nhiễu (**context pollution**), tức kết quả của một việc phụ, như hàng trăm dòng log tra cứu, làm loãng sự chú ý của agent cho việc chính. Giao việc phụ cho subagent thì agent chính chỉ nhận lại bản tóm tắt.
- Việc chia được thành nhiều phần độc lập, chạy song song cùng lúc.
- Chuyên môn hoá giúp chọn tool đúng hơn, vì mỗi agent chỉ cầm vài tool của một hệ thống.

Nếu vấn đề chỉ là agent có quá nhiều tool, khoảng từ 15–20 tool trở lên, thì thử tool search trước khi tách agent (bài 1.4). Chia việc cho nhiều agent thế nào là nội dung của bài 1.1. Bài này chỉ trả lời câu có nên chia hay không.

> **Bẫy đề**
>
> Nhánh "khác" xử lý xong được 41%, bốn nhánh còn lại đang tốt. Ba hướng sửa nghe hợp lý nhưng sai:
>
> - **Thay cả workflow bằng một agent** (_replace the workflow with a single autonomous agent_). Nghe như nâng cấp cả hệ một lần. Nhưng chi phí tăng từ 360 lên 2.160 USD mỗi tháng, trong khi bốn nhánh cố định không xử lý tốt hơn.
> - **Tách thành nhiều agent chuyên trách** (_split into specialized agents_). Nghe chuyên nghiệp hơn. Nhưng hệ nhiều agent tốn gấp 3–10 lần token, và ở đây không có context bị nhiễu, việc song song hay nhu cầu chuyên môn hoá nào để bù lại.
> - **Nâng model cho mọi nhánh**. Nghe như cách nhanh nhất. Nhưng nhánh "khác" yếu vì workflow chỉ có một đường cố định, không tra cứu nhiều bước theo từng ca được, chứ không phải vì model kém.
>
> **Chọn:** chỉ đưa nhánh "khác" lên agent, các nhánh còn lại giữ workflow (846 USD mỗi tháng).

## Chọn harness khi hệ lớn lên

Agent của nhánh "khác" dần nhận việc nặng hơn. Nó phải xem ảnh gói hàng hư hỏng do khách gửi, gọi API của đối tác vận chuyển rồi chờ trả lời, và có ca kéo dài 40 phút. Vòng lặp mà đội tự viết trên Messages API (gửi request, đọc `tool_use`, chạy tool, gửi `tool_result`, rồi lặp lại) bắt đầu khó giữ. Đội phải tự lưu lịch sử, tự chạy tiếp khi tiến trình chết giữa một ca dài, và tự lo chỗ chạy code cho an toàn.

Đây là lúc chọn lại harness. **Agent harness** là phần mềm chạy vòng lặp quanh model. Nó gửi prompt, nhận yêu cầu gọi tool, chạy tool, đưa kết quả về cho model, và quyết khi nào dừng. Bốn lựa chọn dưới đây khác nhau ở chỗ ai chạy vòng lặp đó, và ai giữ session (lịch sử của một lần chạy) cùng sandbox (môi trường cô lập để chạy code và lệnh).

| Lựa chọn | Ai chạy vòng lặp | Ai giữ session và sandbox | Hợp khi |
| --- | --- | --- | --- |
| Messages API qua Client SDK | Code của bạn, hoặc tool runner (vòng lặp gọi tool dựng sẵn trong SDK, đang beta) | Bạn tự giữ | Cần kiểm soát từng bước |
| Agent SDK | Harness của Claude Code chạy ngay trong process của bạn | SDK có sẵn session, resume, fork, còn bạn lo chỗ chạy | Muốn dùng sẵn tool, permission, hook, subagent của Claude Code |
| Managed Agents | Anthropic host harness | Session nằm phía server, sandbox ở cloud của Anthropic hoặc self-hosted | Việc chạy nhiều phút tới nhiều giờ, không cần chờ trả lời ngay |
| Claude Code CLI với `-p` | Claude Code, chạy như một subprocess | Bạn lo, trên máy chạy CLI | Muốn lái Claude Code từ ngôn ngữ khác Python, TypeScript |

**Managed Agents** là harness do Anthropic host, xoay quanh bốn khái niệm:

- Agent là bộ cấu hình gồm model, system prompt, tool, MCP server và skill. Bạn tạo một lần rồi dùng lại theo ID, và mỗi lần sửa thì có version mới.
- Environment là nơi tool chạy, có thể là cloud sandbox do Anthropic vận hành hoặc sandbox self-hosted trên hạ tầng của bạn.
- Session là một lần chạy agent trong một environment.
- Event là các message mà ứng dụng và agent gửi cho nhau, như `user.message` từ phía bạn, hay `agent.message` và `agent.custom_tool_use` từ phía agent.

Dựng một agent trên Managed Agents đi qua bốn bước theo đúng thứ tự đó. Bạn tạo agent, tạo environment, mở session, rồi gửi event và đọc event stream trả về.

Đội chọn Managed Agents cho nhánh "khác" vì cần session sống lâu mà không muốn tự vận hành sandbox. Chuyển sang đây, đội không còn phải tự giữ lịch sử, tự chạy các tool có sẵn (bash, đọc ghi file…) hay tự dựng sandbox. Custom tool thì vẫn do client chạy, như đoạn về `hoan_tien` bên dưới. Managed Agents chạy cùng kiểu vòng lặp với Agent SDK, nhưng vài thứ Agent SDK làm sẵn thì ở đây không có. Nếu cần, đội phải tự làm ở phía client, tức phần code ứng dụng gửi và nhận event:

- Plan mode, chế độ agent chỉ lập kế hoạch mà chưa làm gì, không có sẵn. Cách thay là chạy một session chỉ để lập kế hoạch, rồi mở session thứ hai để làm theo kế hoạch đó.
- Hook `PreToolUse` và `PostToolUse`, tức đoạn code chạy trước và sau mỗi lần gọi tool, cũng không có. Với custom tool (tool do code của bạn chạy), client nhận event `agent.custom_tool_use` trước khi trả kết quả, nên đặt phần kiểm ở chỗ đó. Với tool có sẵn chạy trong sandbox, đặt `permission_policy` là `always_ask` để lần gọi nào cũng chờ client duyệt. Nếu đặt `auto` thì server tự đánh giá từng lần gọi, và lần nào server thấy an toàn sẽ chạy luôn mà không qua client.
- `max_turns`, giới hạn số lượt của agent, không có. Client tự đếm lượt và tự dừng.

Ở công ty giao hàng, tool `hoan_tien` được khai báo là custom tool. Mỗi lần agent muốn hoàn tiền, client nhận event, kiểm số tiền có nằm trong hạn mức không, rồi mới chạy và gửi kết quả về. Đây là chỗ thay cho hook `PreToolUse`.

Về environment, nên bắt đầu bằng cloud sandbox, và chỉ chọn self-hosted khi tool phải chạy trên hạ tầng do bạn kiểm soát. Self-hosted giữ file và process trên máy của bạn. Nhưng lịch sử hội thoại và kết quả tool vẫn **tới dịch vụ Managed Agents** do Anthropic vận hành, vì model chỉ nhận được kết quả tool theo đường đó. Chọn self-hosted, bạn còn nhận thêm việc harden image (gia cố image chạy sandbox cho an toàn), kiểm soát lưu lượng mạng từ sandbox đi ra, và mất một số tính năng chỉ cloud sandbox có.

Về dữ liệu, cần nhớ chuyện **zero data retention** (ZDR), tức thoả thuận Anthropic không lưu dữ liệu sau khi trả response. Managed Agents không thuộc diện ZDR, vì session là tài nguyên có trạng thái và transcript được giữ tới khi bạn xoá session. Ngoại lệ duy nhất là khi bạn tự chạy cả dịch vụ (self-hosted Managed Agents). Self-hosted sandbox thì không đổi được điều này, vì lịch sử vẫn nằm ở dịch vụ của Anthropic.

Còn **framework**, tức thư viện dựng agent bọc quanh API, thì nên bắt đầu bằng gọi API trực tiếp, vì nhiều mẫu chỉ cần vài dòng code. Framework giúp có bản chạy nhanh, nhưng thêm một lớp che mất prompt và response thật, nên khi agent sai rất khó biết model đã nhận gì. Nếu dùng framework thì phải hiểu code bên dưới nó, và khi lên production đừng ngại bỏ bớt lớp trừu tượng.

Harness tự viết hay framework đều chứa những mẹo bù cho điểm yếu của một model cụ thể, và mẹo có hạn dùng. Anthropic từng thấy Claude Sonnet 4.5 hay kết thúc việc sớm khi cảm thấy context sắp đầy, nên thêm bước reset context vào harness. Dùng đúng harness đó với Claude Opus 4.5 thì hành vi kia không còn, và bước reset thành gánh nặng thừa. Vì vậy mỗi lần đổi model, chạy lại eval với từng mẹo lần lượt tắt đi để biết mẹo nào còn cần.

## Chuẩn dùng chung cho cả team: skill, plugin và cách duyệt

Ba team chăm sóc khách hàng, kho hàng và tài chính đều có agent cần tra vận đơn, và mỗi team tự viết một bản chỉ dẫn. Team kho hàng tính "giờ cam kết giao" từ lúc tạo đơn, hai team kia tính từ lúc shipper lấy hàng. Kết quả là cùng một đơn hàng mà khách nhận hai câu trả lời khác nhau về chuyện hàng có trễ hay không.

Đây là chỗ cần chuẩn cho các mẫu dùng lại được (**reusable-pattern standards**). Có hai cách đóng gói một cách làm để nhiều người dùng chung.

- **Skill** là một thư mục có file `SKILL.md` (mô tả ngắn và chỉ dẫn) cùng các file kèm như script hay tài liệu. Lúc đầu model chỉ đọc phần mô tả ngắn của từng skill. Khi việc đang làm khớp với mô tả, nó mới nạp phần chỉ dẫn, rồi tới file kèm nếu cần. Cách nạp dần như vậy gọi là **progressive disclosure**.
- **Plugin** của Claude Code gói nhiều thành phần (skill, subagent, hook, MCP server) để cài một lần như một khối. Plugin thường phát hành qua marketplace, tức một thư mục hay repository có file `marketplace.json` liệt kê các plugin, đẩy lên git host để máy khác đăng ký rồi cài.

Đội gom ba bản chỉ dẫn thành một skill `tra-cuu-van-don`, trong đó ghi rõ giờ cam kết tính từ lúc lấy hàng.

Viết xong skill thì còn chuyện phát hành. Skill tự viết **không tự đồng bộ giữa các surface**, tức các nơi dùng Claude. Skill upload qua Skills API dùng chung trong cả workspace. Claude Code đọc skill từ `~/.claude/skills/`, từ `.claude/skills/` trong repo, hoặc từ plugin. claude.ai có chỗ upload riêng, và skill upload ở đó không sang API. Vì vậy nên giữ một bản nguồn trong git, review qua pull request, rồi phát hành ra từng nơi. Với Claude Code, admin có thể bật sẵn plugin cho mọi máy trong công ty qua managed settings (cấu hình do tổ chức đặt, người dùng không tự sửa được), với hai key `extraKnownMarketplaces` và `enabledPlugins`.

### Duyệt skill trước khi chia sẻ

Một skill trước khi chia sẻ cần qua hai lớp duyệt.

Lớp đầu là review bảo mật, và người viết không được tự duyệt skill của mình. Skill gồm chỉ dẫn và code, nên một skill độc có thể bảo Claude chạy lệnh nguy hiểm hay gửi dữ liệu ra ngoài. Cài một skill cần nghiêm như cài phần mềm lên production.

Lớp thứ hai là eval. Một skill được đo theo năm chiều:

- Kích hoạt đúng lúc (_triggering accuracy_), tức bật khi nên bật và im khi câu hỏi không liên quan.
- Chạy đúng khi đứng một mình (_isolation_).
- Không làm hỏng các skill khác đang cài cùng (_coexistence_).
- Làm theo chỉ dẫn viết trong skill (_instruction following_).
- Chất lượng đầu ra (_output quality_).

Mỗi skill nên có 3–5 yêu cầu thử, gồm yêu cầu nên kích hoạt, yêu cầu không nên kích hoạt và yêu cầu mập mờ, và chạy trên mọi model đang dùng.

Với plugin, lệnh `claude plugin eval` chạy mỗi ca thử theo hai nhánh, một nhánh có plugin và một nhánh không, mặc định mỗi nhánh ba lần, rồi ra hai điểm `WITH` và `W/OUT`. Ca nào đạt cả khi không có plugin thì plugin không phải lý do khiến nó đạt. Khi chạy trong CI, đặt `--threshold` là điểm tối thiểu để một ca được tính là đạt. Pin cả model chạy lẫn model chấm để điểm của các lần chạy so được với nhau, và đặt `--max-cost-usd` để chặn chi phí.

### Pin version cho production

Ngoài `tra-cuu-van-don`, đội còn một skill `xu-ly-hoan-tien` cho khiếu nại hoàn tiền. Lúc 16:00 một hôm, một người ở team kho hàng upload bản 4 của `tra-cuu-van-don`, với phần mô tả viết rộng hơn. Claude dựa vào mô tả để chọn skill, nên bản 4 kích hoạt cả khi khách hỏi về tiền. Agent production không pin version, tức không cố định vào một version cụ thể, nên chạy bản 4 ngay lập tức. Trong hai ngày, khoảng 120 khiếu nại hoàn tiền bị trả lời bằng thông tin vận đơn. Nếu bản 4 phải qua eval coexistence trước, lỗi đã lộ ra ở đó, vì với các câu hỏi hoàn tiền `xu-ly-hoan-tien` chỉ còn kích hoạt 2/5 câu thay vì 5/5 như trước.

**Sơ đồ: Không pin thì bản 4 lên production ngay lúc upload, dù eval coexistence lẽ ra đã bắt được lỗi**

Nếu request bỏ trống `version` thì nó dùng bản mới nhất, nên ai trong workspace upload bản mới cũng làm đổi ngay thứ production đang chạy. Vì vậy production nên pin skill vào một version cụ thể. Mỗi lần nâng version coi như một lần deploy, cần review bảo mật và chạy đủ bộ eval.

Cũng nên giữ số skill vừa phải. Mô tả của các skill tranh nhau sự chú ý của model, và một request API nạp được tối đa **20 skill**. Nhóm skill theo vai trò, và ghi mỗi skill vào một registry nội bộ với mục đích, người chịu trách nhiệm, version và lần eval gần nhất.

> **Trong đề chọn gì**
>
> Câu về chia sẻ skill cho nhiều team thì đáp án đúng gồm nguồn trong git có review, eval trước khi phát hành (kể cả coexistence với skill đang có), và production pin version. Đáp án "để mọi agent dùng bản mới nhất cho luôn cập nhật" là sai.

> **Ý chính**
>
> Đọc số liệu theo từng nhánh. Nhánh đầu vào đa dạng mà xử lý kém thì chuyển lên agent, còn nhánh có trace lặp đúng một đường thì kéo về workflow. Chỉ chia nhiều agent khi có lý do cụ thể. Chọn harness theo việc ai chạy vòng lặp, ai giữ session và dữ liệu nằm ở đâu. Chia sẻ skill cho nhiều team thì giữ bản gốc trong git có review, eval trước khi phát hành, và pin version cho production.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Building effective agents (Anthropic Engineering)](https://www.anthropic.com/research/building-effective-agents)
3. [Building multi-agent systems: When and how to use them (Claude resources)](https://claude.com/resources/articles/building-multi-agent-systems-when-and-how-to-use-them)
4. [Scaling Managed Agents with stable interfaces (Anthropic Engineering)](https://www.anthropic.com/research/managed-agents)
5. [Claude Managed Agents overview (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/overview)
6. [Migration (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/migration)
7. [Choosing an environment (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/choosing-an-environment)
8. [Agent SDK overview (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/overview)
9. [Agent Skills overview (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
10. [Skills for enterprise (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise)
11. [Test plugins with evals (Claude Code Docs)](https://code.claude.com/docs/en/plugin-evals)
12. [Create a marketplace (Claude Code Docs)](https://code.claude.com/docs/en/plugin-marketplaces)
13. [Settings reference (Claude Code Docs)](https://code.claude.com/docs/en/settings-reference)
