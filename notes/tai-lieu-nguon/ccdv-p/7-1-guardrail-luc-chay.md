---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/7-1-guardrail-luc-chay
ngay_tai: 2026-11-27
tieu_de: Guardrail lúc chạy - xếp lớp theo rủi ro, che PII, chặn hành động phá huỷ, sandbox, approval gate và tinh chỉnh bộ lọc
---

Domain 7: Runtime Guardrails and Production Security · Task 7.1

# Guardrail lúc chạy - xếp lớp theo rủi ro, che PII, chặn hành động phá huỷ, sandbox, approval gate và tinh chỉnh bộ lọc

Xếp guardrail theo hồ sơ rủi ro của agent, che PII đúng chỗ, chặn hành động không đảo ngược bằng cơ chế cố định, sandbox, approval gate, xử lý refusal.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 15 nguồn

## Đọc xong bạn nắm được

- Đánh giá một kiến trúc guardrail nhiều lớp theo hồ sơ rủi ro của agent, biết lớp nào cho kết quả cố định và lớp nào fail-open
- Đặt bộ lọc đầu vào, đầu ra và bộ che PII ở đúng chỗ trong vòng lặp agent
- Dùng hook và luật quyền để thực thi chính sách, và chặn hành động không đảo ngược bằng cơ chế không phụ thuộc vào việc model viết lệnh ra sao
- Cho agent dùng tool và web trong sandbox mà không chạm được production
- Thiết kế approval gate mà người duyệt hiểu được, xử lý refusal, và tinh chỉnh tỉ lệ chặn nhầm và lọt lưới

Guardrail lúc chạy (**runtime guardrail**) là những lớp kiểm soát chạy cùng agent trên production. Chúng lọc dữ liệu đi vào agent, che dữ liệu nhạy cảm đi ra, chặn hành động nguy hiểm trước khi nó chạy, và giới hạn những gì agent với tới được. Câu hỏi khó không nằm ở chỗ có nhiều lớp hay không, mà ở chỗ mỗi lớp chặn được loại rủi ro nào, và khi chính lớp đó bị lỗi thì chuyện gì xảy ra.

Tên task trong đề là **Runtime Guardrail Systems**. Nó gồm việc đánh giá kiến trúc guardrail nhiều lớp theo hồ sơ rủi ro của một agent trên production. Các ý bên trong là lọc đầu vào và đầu ra, che PII, thực thi chính sách bằng hook, ngăn hành động phá huỷ, sandbox, approval gate, xử lý refusal và dự phòng an toàn, chặn hành động không đảo ngược bằng cơ chế cố định, và tinh chỉnh tỉ lệ chặn nhầm và lọt lưới. Mỗi ý có chữ tiếng Anh của đề ở mục tương ứng bên dưới.

Kiến thức nền về guardrail nhiều lớp và hook nằm ở bài 7.2 và bài 7.3 của CCDV-F. Tấn công từ nội dung không tin cậy nằm ở bài 7.2 của CCDV-P.

**Sơ đồ: Bộ lọc chỉ là xác suất, hook có thể fail-open, còn tool tự viết và sandbox làm được fail-closed**
_Bản đồ bài. Tin nhắn của người dùng qua bộ lọc đầu vào rồi tới Claude, nơi chạy vòng lặp agent. Hai bộ lọc đầu vào và đầu ra dùng Haiku, cho kết quả xác suất và phải tinh chỉnh; bộ lọc nào chặn thì dừng và báo người dùng, Claude refusal cũng vậy. Mỗi lần gọi tool qua hook PreToolUse rồi luật deny, ask, allow; lớp này fail-open nếu chưa cấu hình. Deny thì lệnh bị chặn, báo lại Claude. Ask thì tới approval gate cho việc không đảo ngược; người duyệt đồng ý thì tool chạy, từ chối thì báo lại Claude. Allow thì tool chạy. Trong sandbox, tool tự viết với credential đúng quyền và proxy mạng có allowlist làm được fail-closed; request ra web bên ngoài đi qua proxy. Kết quả tool quay về Claude, câu trả lời qua bộ lọc đầu ra tới kênh chat. PII được che ở bốn chỗ: hook PreToolUse che tham số tool, code tool che ngay trong tool, hook PostToolUse che kết quả tool trước khi về Claude, hook MessageDisplay che chữ trên màn hình._

- Người dùng
- Kênh chat
- MessageDisplay
- che chữ trên màn hình
- **Bộ lọc đầu vào**: Haiku, xác suất
- phải tinh chỉnh
- **Báo người dùng**: việc bị chặn, dừng
- **Bộ lọc đầu ra**: Haiku, xác suất
- phải tinh chỉnh
- **Web bên ngoài**
- **Claude**: vòng lặp
- agent
- **Hook PreToolUse**: rồi luật deny, ask, allow
- fail-open nếu chưa cấu hình
- che PII trong tham số
- **Approval gate**: việc không đảo ngược
- **SANDBOX**
- **Tool tự viết**: đúng quyền, fail-closed
- che PII trong tool
- **Proxy mạng**: allowlist, fail-closed
- chặn
- chặn
- refusal
- gọi tool
- deny
- ask
- allow
- từ chối
- duyệt
- PostToolUse
- che PII kết quả tool
- lệnh hay tin đi tiếp
- bị chặn

## Ví dụ xuyên suốt: trợ lý vận hành của một chuỗi nha khoa

Một chuỗi 46 phòng khám nha khoa làm trợ lý vận hành cho quản lý phòng khám. Trợ lý dùng Claude Agent SDK, chạy Claude Sonnet 5.5 trong container trên cluster của công ty. Agent làm được mấy việc sau.

- Tra lịch hẹn và hồ sơ bệnh nhân, gồm tên, số điện thoại và lịch sử điều trị.
- Chạy Python để phân tích tỉ lệ bệnh nhân bỏ hẹn.
- Đọc bảng giá trên trang của nhà cung cấp vật tư.
- Gửi SMS cho bệnh nhân qua cổng SMS, dời hoặc huỷ lịch hẹn.
- Cuối ngày gửi bản tóm tắt vào kênh chat nội bộ của phòng khám.

Người dùng là quản lý phòng khám, phần lớn không đọc được lệnh bash. Ở bản đầu tiên, agent có tool `Bash` và một tài khoản cơ sở dữ liệu có quyền ghi. Trước mỗi lệnh, agent hiện hộp thoại hỏi quản lý có cho chạy không. Đội phát triển của chuỗi nha khoa, gọi tắt là đội, lo phần kỹ thuật của trợ lý.

## Xếp lớp theo hồ sơ rủi ro

Sau ba tuần, quản lý đã bấm đồng ý 2.040 trên 2.100 lần được hỏi, vì hộp thoại hiện nguyên lệnh `psql` và `python` mà họ không đọc được. Với Claude Code, Anthropic cũng thấy người dùng bấm đồng ý khoảng 93% số lần được hỏi quyền, và càng bị hỏi nhiều thì càng ít đọc kỹ. Tức là hỏi người trước mọi lệnh không phải một lớp bảo vệ thật.

Muốn biết nên đặt lớp bảo vệ nào thay cho hộp thoại đó, đừng bắt đầu từ danh sách tính năng an toàn. Hãy bắt đầu từ hồ sơ rủi ro (**risk profile**) của agent, tức là trả lời ba câu hỏi sau. Đây cũng là cách đánh giá một kiến trúc guardrail nhiều lớp (**layered guardrail architecture**).

- **Agent chạm tới dữ liệu nhạy cảm nào?** Ở đây là dữ liệu sức khoẻ và số điện thoại của bệnh nhân.
- **Hành động nào không đảo ngược được?** SMS đã gửi thì không rút lại được. Lịch hẹn đã huỷ thì bệnh nhân đã nhận tin báo huỷ.
- **Người duyệt có hiểu việc mình duyệt không?** Ở đây là không, vì quản lý không đọc được lệnh bash. Anthropic cũng chọn mức cô lập agent theo việc người dùng có giám sát được hay không. Lập trình viên đọc được bash thì duyệt từng lệnh vẫn còn ý nghĩa. Người không đọc được thì cần một ranh giới luôn bật, như sandbox, để agent không vượt ra ngoài dù người dùng bấm đồng ý điều gì.

Với mỗi lớp, bạn ghi ra hai điều. Thứ nhất, lớp đó cho kết quả cố định (**deterministic**, cùng đầu vào thì lần nào cũng ra cùng kết quả) hay chỉ là xác suất. Thứ hai, khi chính lớp đó lỗi hay timeout thì nó fail-open (cho lệnh đi qua) hay fail-closed (chặn lại).

| Lớp | Cố định? | Khi lớp lỗi | Chặn được rủi ro nào |
| --- | --- | --- | --- |
| System prompt, bộ phân loại bằng model | Không | Bộ phân loại lỗi thì tuỳ code của bạn xử lý | Giảm khả năng agent làm sai, nhưng không giới hạn điều agent làm được |
| Luật quyền (allow, deny, ask) | Có, nhưng chỉ so khớp trên chuỗi lệnh | Không khớp luật nào thì lệnh đi tiếp | Chỉ chặn những cách viết lệnh quen thuộc, viết kiểu khác là lọt |
| Hook `PreToolUse` | Có, theo code của bạn | Fail-open, nếu không cấu hình chặn khi lỗi | Chính sách riêng của bạn trên từng lệnh gọi tool |
| Tool tự viết, quyền của credential | Có | Fail-closed, nếu bạn viết tool từ chối khi không chắc | Hành động không đảo ngược, phạm vi dữ liệu |
| Sandbox, mạng đi qua proxy | Có, ở tầng hệ điều hành | Fail-closed khi đặt `sandbox.failIfUnavailable: true`. Mặc định, sandbox không khởi động được thì lệnh vẫn chạy không có sandbox | Giới hạn những gì agent với tới, kể cả khi mọi lớp trên đều để lọt |

Với hành động không đảo ngược được, phải có ít nhất một lớp vừa cố định vừa fail-closed đứng chặn. Nguyên tắc này là chặn hành động không đảo ngược bằng cơ chế cố định (**deterministic enforcement for irreversible actions**), chứ không trông vào việc model tự giác.

## Lọc đầu vào, đầu ra và che PII

Trong agent, lọc đầu vào và đầu ra (**input/output filtering**) không chỉ là kiểm tin nhắn của người dùng và câu trả lời cuối. Kết quả tool cũng là đầu vào, và tham số của tool gửi ra ngoài cũng là đầu ra. Cách hay dùng là gọi riêng Claude Haiku 5.5 làm bộ lọc. Bộ lọc đọc tin nhắn và kết quả tool trước khi model chính thấy, rồi trả kết luận cho qua hay chặn theo một schema cố định nhờ structured outputs. Bộ lọc đầu ra làm theo cùng cách. Có khi chính bộ lọc từ chối trả lời, tức là trả về `stop_reason: "refusal"`. Lúc đó không có kết luận nào để đọc, nên bạn coi nội dung đó như đã bị chặn.

Bộ che PII (**PII redactor**) che dữ liệu định danh cá nhân như tên hay số điện thoại. Trong vòng lặp agent có bốn chỗ đặt bộ che, mỗi chỗ giấu dữ liệu khỏi một đối tượng khác.

| Chỗ đặt | Giấu khỏi ai | Lưu ý |
| --- | --- | --- |
| Ngay trong code tool | Model, transcript, log | Chắc nhất, vì dữ liệu chưa từng ra khỏi tool |
| Hook `PostToolUse` với `updatedToolOutput` | Model | Không chạy khi tool báo lỗi, vì lúc đó hook `PostToolUseFailure` chạy thay, và hook này không viết lại được kết quả |
| Hook `PreToolUse` với `updatedInput` | Dịch vụ nhận tham số, như cổng SMS | Viết lại tham số trước khi tool chạy |
| Hook `MessageDisplay` | Màn hình người dùng | Chỉ đổi chữ hiện ra màn hình. Transcript vẫn giữ bản gốc, và nếu hook lỗi thì màn hình hiện bản gốc |

Ban đầu đội che số điện thoại bằng một hook `PostToolUse`. Rồi một câu truy vấn sai cú pháp khiến `psql` in nguyên dòng dữ liệu vào thông báo lỗi. Lần gọi lỗi này đi qua `PostToolUseFailure` chứ không qua `PostToolUse`, nên số điện thoại của một bệnh nhân lọt vào context, rồi lên cả bản tóm tắt agent gửi vào kênh chat nội bộ.

Sau sự cố, đội chuyển việc tra cứu sang tool `tra_lich_hen` tự viết. Tool này tự che số điện thoại, chỉ để lại bốn số cuối, và khi lỗi thì chỉ trả một thông báo chung. Hook `PostToolUse` vẫn được giữ làm lớp che thứ hai.

## Dùng hook và luật quyền để chặn hành động phá huỷ

Một quản lý nhờ agent "dọn các lịch hẹn bị trùng trong tháng 11". Đội đã có luật deny `Bash(psql *DELETE*)`, nhưng agent viết lệnh dạng `bash -c "psql -c 'DELETE …'"`. Lệnh này không khớp luật, thế là 312 lịch hẹn bị xoá và đội mất bốn giờ khôi phục từ backup.

Luật cho tool Bash so khớp trên chuỗi lệnh. Trước khi so, hệ thống chỉ tách lệnh ghép (như `a && b`) và bỏ một số lệnh bọc ngoài (wrapper) quen thuộc. Cùng một chương trình mà gọi theo cách khác, như `/bin/rm`, `sh -c '…'` hay `git -C . push`, thì luật không nhận ra. Vì vậy luật deny hay ask chỉ chặn được những cách viết lệnh Claude hay dùng. Nó **không phải ranh giới bảo mật**, nên muốn cấm hẳn một chương trình thì phải chặn ở tầng khác.

Muốn dùng hook để thực thi chính sách (**hook-based policy enforcement**), bạn cần biết Agent SDK kiểm một lệnh gọi tool theo thứ tự nào.

1. **Hook** chạy đầu tiên. Hook trả deny thì lệnh bị chặn ngay. Hook trả allow thì lệnh vẫn phải qua tiếp bước 2 và 3.
2. **Luật deny** khớp thì lệnh bị chặn, kể cả ở chế độ `bypassPermissions` và kể cả khi hook đã allow.
3. **Luật ask** khớp thì lệnh chuyển sang callback `canUseTool` để hỏi người.
4. **Permission mode**, tức mức quyền mặc định áp cho cả session (`default`, `acceptEdits`, `bypassPermissions`, `dontAsk`, `plan`, `auto`), có thể tự duyệt hoặc tự từ chối cả một nhóm lệnh.
5. **Luật allow** khớp thì lệnh được chạy.
6. **Callback `canUseTool`**, tức code của bạn và thường dùng để hỏi người, quyết các lệnh còn lại.

Thứ tự này có một hệ quả hay bị bỏ sót. Lệnh nào đã được permission mode hay luật allow duyệt sẵn thì **thường không tới `canUseTool`**, trừ vài ngoại lệ như sửa file ở chế độ `plan` hay xoá đường dẫn trọng yếu. Nếu bạn đặt bước kiểm tra trong callback này, nó sẽ lặng lẽ không chạy với mọi tool nằm trong `allowedTools` (danh sách luật allow). Kiểm tra nào phải áp cho mọi lệnh thì bạn đặt ở hook `PreToolUse`.

**Sơ đồ: Hook chạy đầu tiên, còn canUseTool chạy cuối nên không thấy lệnh đã được duyệt sẵn**
_Thứ tự Agent SDK kiểm một lệnh gọi tool qua sáu bước. Bước 1 là hook PreToolUse, deny thì chặn ngay, allow thì lệnh vẫn phải qua bước 2 và 3. Bước 2 là luật deny, khớp thì chặn, kể cả ở bypassPermissions. Bước 3 là luật ask, khớp thì lệnh đi thẳng tới canUseTool để hỏi người. Bước 4 là permission mode của cả session, tự duyệt thì lệnh chạy luôn. Bước 5 là luật allow cho các tool trong allowedTools, khớp thì lệnh chạy luôn. Bước 6 là callback canUseTool, quyết mọi lệnh còn lại. Vì lệnh đã chạy luôn ở bước 4 hoặc 5 thường không tới canUseTool, kiểm tra nào cần áp cho mọi lệnh thì đặt ở hook PreToolUse._

- **deny thì chặn ngay**
- **khớp thì chặn**
- 1. **Hook PreToolUse**: allow vẫn phải qua bước 2, 3
- 2. **Luật deny**: chặn cả ở bypassPermissions
- 3. **Luật ask**: đưa lệnh sang canUseTool
- khớp
- 4. **Permission mode**: mức quyền của cả session
- 5. **Luật allow**: các tool trong allowedTools
- 6. **canUseTool**: code của bạn, hay hỏi người
- **tự duyệt thì chạy luôn**
- **khớp thì chạy luôn**
- **quyết mọi lệnh còn lại**
- **Kiểm tra cho mọi lệnh thì đặt ở hook PreToolUse**: Lệnh đã chạy luôn ở bước 4 hoặc 5 thường không tới canUseTool.

Bản thân hook cũng có thể fail-open. Trong Agent SDK, nếu hàm hook ném lỗi hay trả về sai định dạng, lệnh gọi tool vẫn đi tiếp vào luồng kiểm quyền bình thường như thể không có hook. Vì vậy, với hook làm nhiệm vụ chặn, bạn đặt `onFailure: "block"` (Python là `on_failure="block"`) trong khai báo hook, và để lỗi lan ra ngoài chứ đừng tự bắt lỗi rồi trả `{}`. Riêng khi hook `PreToolUse` chạy quá timeout thì lệnh gọi bị chặn.

Vì cả luật lẫn hook đều có kẽ hở, cách chắc nhất để ngăn hành động phá huỷ (**destructive-action prevention**) là dùng cơ chế không phụ thuộc vào việc model viết lệnh ra sao.

**Sơ đồ: Luật so khớp chuỗi lệnh để lọt cách viết khác, còn tài khoản chỉ đọc chặn mọi lệnh DELETE**

✗ _Chặn bằng luật deny trên chuỗi lệnh_
1. Đội đặt luật deny Bash(psql *DELETE*)
   ↓ _agent viết bash -c "psql -c 'DELETE …'"_
2. Lệnh mở đầu bằng bash nên không khớp luật, và tài khoản của agent có quyền ghi
3. **312 lịch hẹn** bị xoá, đội mất 4 giờ khôi phục từ backup

✓ _Chặn bằng credential và tool có giới hạn_
1. Agent chỉ có tài khoản đọc trên bản sao, việc huỷ lịch chỉ đi qua tool huy_lich_hen
   ↓ _agent viết lệnh DELETE kiểu gì cũng vậy_
2. Cơ sở dữ liệu từ chối mọi lệnh DELETE
3. **Tối đa 20 lịch** mỗi lần huỷ qua huy_lich_hen, và phải có người duyệt

Có ba cách chặn cố định như vậy. Thứ nhất, credential của agent chỉ có đúng quyền cần cho việc của nó. Thứ hai, hành động không đảo ngược chỉ được chạy qua tool tự viết có kiểm tham số và giới hạn số lượng, như `huy_lich_hen` chỉ huỷ tối đa 20 lịch mỗi lần. Thứ ba, tool nào agent không cần thì gỡ hẳn bằng `disallowed_tools`. Ngoài ra, Claude Code có sẵn một chốt cố định cho đường dẫn trọng yếu (critical path). Lệnh `rm` hay `rmdir` nhắm vào những đường dẫn như thư mục home, ví dụ `rm -rf ~`, không được luật allow hay hook allow nào tự duyệt.

> **Bẫy đề**
>
> Agent xoá 312 lịch hẹn bằng một lệnh `bash -c` lọt qua luật deny. Có ba cách sửa nghe hợp lý nhưng sai.
>
> - **Thêm luật deny cho mọi cách viết lệnh**. Cách này nghe như vá đúng lỗ. Nhưng một lệnh có vô số cách viết, nên luật so khớp chuỗi lệnh không bao giờ chặn kín được một chương trình.
> - **Viết vào system prompt "không bao giờ xoá dữ liệu"**. Sửa ở prompt có vẻ là sửa tận gốc. Nhưng prompt chỉ khiến model ít muốn xoá hơn, còn tài khoản có quyền ghi thì vẫn xoá được.
> - **Giữ hộp thoại hỏi quản lý trước mỗi lệnh, thêm cảnh báo màu đỏ**. Cách này có vẻ an toàn nhất, nhưng quản lý không đọc được lệnh và đã bấm đồng ý 97% số lần.
>
> **Chọn:** bỏ quyền ghi khỏi môi trường của agent, và cho việc huỷ lịch đi qua một tool có giới hạn và cần người duyệt.

> **Trong đề chọn gì**
>
> Với hành động không đảo ngược như xoá dữ liệu, gửi tin hay chuyển tiền, hãy chọn cách kiểm soát nằm ngoài model và chặn được trước khi hành động xảy ra. Đó là quyền của credential, tool có giới hạn, sandbox, hoặc người duyệt hiểu việc mình duyệt. Viết prompt cấm gắt hơn, thêm luật so khớp chuỗi lệnh hay ghi log để xem lại sau đều không chặn được hành động đó.

## Sandbox cho agent dùng tool và web mà không chạm production

Agent nha khoa vẫn cần chạy Python để phân tích tỉ lệ bỏ hẹn và đọc bảng giá trên web. Sandbox (**sandboxing**) cho agent làm việc đó trong một vùng bị giới hạn. Dù định làm gì, agent cũng chỉ với tới được những thứ bên trong vùng đó. Muốn agent chạy Python và đọc web mà không chạm được production, bạn cần bốn thứ.

- **Container khoá chặt.** Chạy với `--cap-drop ALL` để bỏ hết các quyền đặc biệt của Linux (capability), để filesystem chỉ đọc, và chỉ mount những thư mục agent cần.
- **Dữ liệu.** Agent dùng tài khoản chỉ đọc trên bản sao cơ sở dữ liệu, không bao giờ chạm cơ sở dữ liệu chính.
- **Mạng.** Mọi kết nối ra ngoài đi qua proxy có allowlist domain, và kết nối nào tìm cách đi vòng proxy đều bị chặn.
- **Credential.** Credential để ngoài sandbox nên agent không cầm được. Proxy tự gắn credential vào request trên đường đi ra.

Bạn cần cô lập cả mạng lẫn filesystem. Nếu thiếu cô lập mạng, agent bị nội dung độc hại lừa vẫn gửi được file ra ngoài. Nếu thiếu cô lập filesystem, agent có thể sửa file cấu hình để thoát khỏi ranh giới mạng. Sandbox còn giải quyết luôn chuyện hỏi quyền quá nhiều. Trong đo đạc nội bộ của Anthropic, sandbox giảm 84% số lần Claude Code phải hỏi quyền.

Đội từng thêm `docs.google.com` vào allowlist, vì một nhà cung cấp để bảng giá trên Google Sheets. Nhưng allowlist không chỉ cho agent đọc từ domain đó. Nó mở mọi thứ domain đó cho phép làm, và với Google Docs thì gồm cả việc ghi vào tài liệu chia sẻ. Anthropic từng gặp đúng kiểu lỗ này. Vì `api.anthropic.com` nằm trong allowlist, file đã bị gửi lên tài khoản của kẻ tấn công qua Files API. Đội gỡ domain đó, thay bằng tool `doc_bang_gia`, chỉ tải bản export của đúng một bảng tính và không ghi được gì.

Anthropic có sẵn một sandbox nhẹ, không cần container, tên là sandbox runtime. Công cụ này có hai giới hạn. Thứ nhất, proxy mặc định không giải mã TLS, nên kẻ tấn công có thể dùng domain fronting (mượn tên một domain được phép để tới một host khác) để lọt qua allowlist. Thứ hai, tiến trình trong sandbox vẫn dùng chung kernel với máy host. Muốn tách khỏi kernel của host thì chạy trong gVisor (chặn system call của agent bằng một lớp riêng chạy ở user space) hoặc VM. Muốn chặn domain fronting thì dùng proxy giải mã và kiểm tra TLS.

## Approval gate mà người duyệt hiểu được

**Approval gate** là điểm dừng chờ người duyệt. Nó chỉ có tác dụng khi người duyệt hiểu việc mình duyệt và không bị hỏi quá nhiều. Đội bỏ hộp thoại hỏi từng lệnh, để lệnh chạy tự do trong sandbox, và chỉ bắt duyệt hai việc là gửi SMS cho nhiều hơn một bệnh nhân và huỷ lịch. Thẻ duyệt viết bằng ngôn ngữ quản lý hiểu được, ví dụ "Gửi SMS cho 38 bệnh nhân của phòng khám Quận 7, nội dung: …".

Mỗi nền tảng dựng approval gate theo cách riêng, và cả hai đều phải tính tới lúc người duyệt từ chối.

- **Agent SDK.** Bạn dùng luật ask hoặc callback `canUseTool`, và callback này chờ người trả lời bao lâu cũng được. Nếu người duyệt có thể vài giờ sau mới trả lời thì đừng giữ tiến trình chờ. Khi chạy không tương tác (chế độ `-p`), hãy cho hook `PreToolUse` trả `defer`. Lượt chạy, tức một vòng model trả lời, sẽ dừng với `stop_reason` là `tool_deferred`, và khi có câu trả lời thì bạn tiếp tục từ session đã lưu. Cách này chỉ dùng được khi trong lượt đó Claude gọi đúng một tool.
- **Managed Agents**, nơi Anthropic chạy vòng lặp agent và sandbox cho bạn. Bạn đặt `always_ask` cho tool cần duyệt. Đừng nhầm với chế độ `auto`, vì ở đó server tự đánh giá chứ không có người duyệt. Còn nếu client của bạn tự động đồng ý mọi yêu cầu duyệt thì cũng chẳng khác gì đặt `always_allow`.
- **Khi người duyệt từ chối**, lời từ chối quay về agent như một kết quả tool kèm lý do, để agent tìm cách khác. Auto mode của Claude Code, nơi một bộ phân loại bằng model duyệt thay người, có thêm một giới hạn. Khi bộ phân loại chặn 3 lần liên tiếp hoặc 20 lần trong cả session, auto mode dừng và chuyển quyết định cho người. Nếu Claude Code đang chạy headless, tức không có ai ngồi trước màn hình, thì tiến trình kết thúc luôn.

## Refusal và safety fallback trong agent

Có lúc chính Claude từ chối làm tiếp vì lý do an toàn. API báo việc này bằng `stop_reason: "refusal"`, và bạn có thể khai báo `fallbacks` để API tự chuyển sang model dự phòng. Cách đọc hai thứ này nằm ở bài 2.1. Khi xử lý refusal (**refusal handling**) và dự phòng an toàn (**safety fallback**) trong agent, bạn cần để ý thêm mấy điểm sau.

- Nếu Claude từ chối giữa chừng, hãy coi phần đã viết là chưa hoàn chỉnh và bỏ nó, kể cả lệnh gọi tool (`tool_use`) đang dở, và đừng chạy lệnh đó. Tương tự, khi API đã chuyển sang model dự phòng, nó chèn một block `fallback` vào chỗ chuyển. Lúc gửi lại lượt tiếp theo, bạn bỏ các block `tool_use` gọi tool phía client (tool do code của bạn chạy) nằm trước block `fallback` đó.
- Cấu hình `fallbacks` chỉ áp cho lời gọi API nơi bạn khai báo nó. Các lời gọi model phát sinh bên trong lúc chạy tool, như subagent, không được áp, nên mỗi đường gọi model cần khai báo fallback riêng.
- Trên **Managed Agents**, lượt bị từ chối sẽ kết thúc và session chuyển sang idle. Code điều phối phải nhận ra điều này để không chờ mãi.
- Refusal vẫn trả về HTTP 200 nên không hiện trên dashboard theo dõi lỗi, vì vậy bạn cần đếm nó như một tín hiệu riêng. Khi việc bị chặn, hãy báo cho người dùng biết thay vì để agent im lặng. Một cách hay dùng là cho họ một lối đi tiếp, như chuyển cho người trực.

## Tinh chỉnh chặn nhầm và lọt lưới

Quay lại agent nha khoa. Vì SMS gửi đi thì không rút lại được, đội thêm một bộ lọc bằng model đọc nội dung từng tin trước khi gửi. Bộ lọc nào cũng có hai tỉ lệ kéo ngược nhau. Một là chặn nhầm (**false positive**), khi việc hợp lệ bị chặn. Hai là lọt lưới (**false negative**), khi việc nguy hiểm được cho qua. Tinh chỉnh (**false-positive/false-negative tuning**) là chọn điểm cân bằng riêng cho từng loại hành động.

Anthropic đo bộ phân loại của auto mode trên 10.000 lệnh gọi tool thật để đo chặn nhầm, và trên 52 lần agent thật sự làm quá tay, tức làm vượt quá điều người dùng muốn, để đo lọt lưới. Bộ lọc nhanh một bước chặn nhầm 8,5% và để lọt 6,6%. Khi thêm bước hai suy luận kỹ hơn, chỉ chạy trên những lệnh bước một đã gắn cờ, tỉ lệ chặn nhầm giảm còn 0,4% nhưng tỉ lệ lọt tăng lên 17%. Vì con số 17% đó, auto mode không thay được người duyệt cẩn thận trên hạ tầng quan trọng.

Đội nha khoa đo bộ lọc của mình theo cùng cách đó. Họ chạy nó ở shadow mode, tức chỉ ghi lại tin nào sẽ bị chặn chứ không chặn thật. Đây là cách làm hay dùng mà đội tự dựng, Claude không có sẵn tính năng này. Đội chạy như vậy hai tuần trên 4.200 SMS thật, cộng thêm 60 SMS xấu, tức những tin lẽ ra không được gửi. Số SMS xấu này một phần do đội tự soạn, một phần gom từ các lần gửi sai trước đây.

**Sơ đồ: Bước hai giảm chặn nhầm từ 380 xuống 25 nhưng tăng lọt từ 2 lên 6, nên mỗi loại tin một mức lọc**
_Bộ lọc SMS của đội nha khoa chạy ở shadow mode trong hai tuần, trên 4.200 SMS hợp lệ và 60 SMS xấu, đặt trên hai trục chặn nhầm và tin xấu lọt. Bộ lọc một bước chặn nhầm 380 tin, tức 9%, và để lọt 2 tin. Thêm bước hai thì chặn nhầm còn 25 tin, tức 0,6%, nhưng để lọt 6 tin. Đội chọn theo loại tin. SMS cho một bệnh nhân qua bộ lọc hai bước, vì lỡ lọt một tin thì thiệt hại nhỏ. SMS cho nhiều bệnh nhân qua bộ lọc một bước và người duyệt, vì một tin sai tới hàng trăm người. Auto mode của Anthropic đi cùng hướng, bước hai giảm chặn nhầm từ 8,5% còn 0,4% nhưng tăng lọt từ 6,6% lên 17%._

- **SHADOW MODE TRONG HAI TUẦN**: 4.200 SMS hợp lệ và 60 SMS xấu
- Tin xấu lọt
- Chặn nhầm tin hợp lệ
- thêm bước hai
- **Hai bước**: chặn nhầm 25 (0,6%), lọt 6
- **Một bước**: chặn nhầm 380 (9%), lọt 2
- **CHỌN THEO LOẠI TIN**
- **SMS cho một bệnh nhân**: Tin qua bộ lọc hai bước
- Lỡ lọt một tin thì thiệt hại nhỏ
- **SMS cho nhiều bệnh nhân**: Tin qua bộ lọc một bước và người duyệt
- Một tin sai tới hàng trăm người
- **Auto mode của Anthropic đi cùng hướng**: Bước hai giảm chặn nhầm từ 8,5% còn 0,4%, nhưng tăng lọt từ 6,6% lên 17%.

Bộ lọc một bước chặn nhầm 380 trong 4.200 tin hợp lệ, tức 9%, và chỉ để lọt 2 trong 60 tin xấu. Thêm bước hai thì chặn nhầm chỉ còn 25 tin, tức 0,6%, nhưng số tin xấu lọt tăng lên 6.

Đội chọn mức lọc theo từng loại tin. SMS nhắc hẹn gửi cho một bệnh nhân chỉ cần qua bộ lọc hai bước, vì lỡ lọt một tin thì thiệt hại nhỏ. SMS gửi cho nhiều bệnh nhân thì qua bộ lọc một bước, loại nhạy hơn và ít để lọt hơn, rồi có người duyệt xử lý những tin bị chặn nhầm, vì một tin sai sẽ tới hàng trăm người. Đội cũng thêm những SMS xấu đã lọt vào bộ test để dùng cho lần tinh chỉnh sau.

> **Ý chính**
>
> Hãy xếp lớp guardrail theo hồ sơ rủi ro của agent, tức agent chạm dữ liệu gì, hành động nào không đảo ngược được, và người duyệt có hiểu việc mình duyệt không. Hook dùng để chặn phải đặt ở `PreToolUse` và phải fail-closed khi chính nó lỗi. PII nên được che ngay trong code tool, trước khi dữ liệu kịp ra ngoài. Mỗi domain thêm vào allowlist mạng là một quyền cấp cho agent, không chỉ là một chỗ được đọc. Chỉ hỏi người những việc họ hiểu, và tinh chỉnh bộ lọc riêng cho từng loại hành động.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 7](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Securely deploying AI agents (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/secure-deployment)
3. [Configure permissions (Claude Agent SDK)](https://code.claude.com/docs/en/agent-sdk/permissions)
4. [Intercept and control agent behavior with hooks (Claude Agent SDK)](https://code.claude.com/docs/en/agent-sdk/hooks)
5. [Hooks reference (Claude Code Docs)](https://code.claude.com/docs/en/hooks)
6. [Configure permissions (Claude Code Docs)](https://code.claude.com/docs/en/permissions)
7. [Handle approvals and user input (Claude Agent SDK)](https://code.claude.com/docs/en/agent-sdk/user-input)
8. [Configure the sandboxed Bash tool (Claude Code Docs)](https://code.claude.com/docs/en/sandboxing)
9. [Secure your Managed Agents deployment (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/secure-deployment)
10. [Refusals and fallback (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback)
11. [Streaming refusals (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals)
12. [Mitigate jailbreaks and prompt injections (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
13. [How we contain Claude across products (Anthropic Engineering)](https://www.anthropic.com/research/how-we-contain-claude)
14. [How we built Claude Code auto mode (Anthropic Engineering)](https://www.anthropic.com/research/claude-code-auto-mode)
15. [Making Claude Code more secure and autonomous with sandboxing (Anthropic Engineering)](https://www.anthropic.com/research/claude-code-sandboxing)
