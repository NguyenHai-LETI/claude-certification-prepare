---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-3-agent-chay-khong-nguoi-truc
ngay_tai: 2026-11-27
tieu_de: Agent chạy không người trực - chạy tới mục tiêu, theo lịch và theo sự kiện, với checkpoint, thông báo và leo thang
---

Domain 8: Agent Fleet Operations for Software Delivery · Task 8.3

# Agent chạy không người trực - chạy tới mục tiêu, theo lịch và theo sự kiện, với checkpoint, thông báo và leo thang

Để coding agent tự chạy tới mục tiêu, theo lịch hay khi CI/CD báo lỗi, chọn đúng chỗ chạy, giữ kết quả làm dở, báo đúng người và gọi người trực đúng lúc.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 15 nguồn

## Đọc xong bạn nắm được

- Trả lời năm câu hỏi trước khi để agent chạy một mình
- Viết điều kiện cho `/goal` sao cho agent không thể "xong" bằng cách lách
- Chọn giữa cloud scheduled task, Desktop scheduled task, `/loop` và GitHub Actions cho việc chạy theo lịch
- Dựng agent xử lý bước đầu khi CI/CD hay production báo lỗi, với quyền hẹp
- Thiết kế checkpoint, thông báo và đường leo thang để kết quả không mất và người trực được gọi đúng lúc

Tên task trong đề là **Unattended and Event-Driven Agent Operations**. Nó gồm việc áp các cách vận hành không người trực (**unattended-operation patterns**) cho những việc kỹ thuật chạy tới một mục tiêu hoặc theo lịch. Các ý bên trong là agent chạy cho tới khi đạt mục tiêu hay chạy theo lịch hẹn, agent tự bật lên khi có sự kiện để xử lý bước đầu sự cố CI/CD, lưu kết quả làm dở (checkpoint), báo cho người, và thiết kế đường leo thang. Mỗi ý có chữ tiếng Anh của đề ở mục tương ứng bên dưới.

Khi bạn ngồi cạnh agent, nó hiểu sai là bạn thấy ngay. Còn khi nó chạy một mình qua đêm, sáng ra bạn mới biết nó đã làm cả đêm dựa trên một giả định sai. Vận hành không người trực (**unattended operation**) là sắp đặt trước để chuyện đó không xảy ra, hoặc nếu có xảy ra thì agent dừng sớm và gọi đúng người.

Bài này nói về ba kiểu agent tự chạy: chạy cho tới khi đạt một mục tiêu (**agents running toward goals**), chạy theo lịch hẹn (**on schedules**), và tự bật lên khi có sự kiện như CI báo lỗi (**event-driven responders**). Phần cuối nói cách giữ lại kết quả làm dở, cách báo cho người, và cách gọi người trực khi agent không tự xử lý được.

Vài phần liên quan đã có bài riêng. Các cờ `-p`, `--max-turns`, `--max-budget-usd` để chạy Claude Code không cần tương tác nằm ở bài 3.6 của CCAR-F. Cách lưu tiến độ nằm ở bài 1.2, còn auto mode và approval gate nằm ở bài 7.1.

**Sơ đồ: Ba cách bắt đầu đều dẫn tới một lần chạy không người trực, và ba thứ phải dựng sẵn quanh nó**
_Bản đồ bài. Một lần chạy có thể bắt đầu theo ba cách. Chạy tới mục tiêu với /goal, có model chấm sau mỗi lượt. Chạy theo lịch, như cloud scheduled task. Chạy theo sự kiện, như CI báo lỗi rồi gọi /fire. Cả ba dẫn tới một lần chạy không người trực, đã trả lời năm câu hỏi trước khi chạy. Quanh lần chạy có ba thứ. Checkpoint ghi kết quả dần ra ngoài session, như draft PR hay commit từng lô. Thông báo kết thúc bằng DONE hay NEED_HUMAN, vì Succeeded chưa có nghĩa là xong. Leo thang dừng ở luật ask và gọi người theo mức độ sự cố._

- **BA CÁCH MỘT LẦN CHẠY BẮT ĐẦU**
- **Chạy tới mục tiêu**: running toward goals
- /goal và model chấm
- **Chạy theo lịch**: on schedules
- cloud scheduled task
- **Chạy theo sự kiện**: event-driven responders
- CI báo lỗi, gọi /fire
- **Một lần chạy không người trực**: unattended operation, trả lời năm câu hỏi trước khi chạy
- **BAO QUANH LẦN CHẠY**
- **Checkpoint**: checkpointing
- ghi dần ra ngoài session
- draft PR, commit từng lô
- **Thông báo**: notification
- DONE hay NEED_HUMAN
- Succeeded chưa là xong
- **Leo thang**: escalation design
- dừng ở luật ask
- gọi người theo mức độ

## Ví dụ xuyên suốt: phần mềm quản lý 1.200 phòng gym

Một công ty làm phần mềm cho 1.200 phòng gym, gồm đặt lớp, gói hội viên và trừ tiền thẻ định kỳ. Đội 18 kỹ sư của công ty, gọi là đội gym, dùng Claude Code trên gói Team. Code nằm trên GitHub, CI chạy bằng GitHub Actions, lỗi production báo qua Sentry, và mọi người trao đổi trên Slack. Mỗi đêm lúc 2:00, một job trừ tiền gia hạn cho hội viên của mọi phòng gym qua một cổng thanh toán bên ngoài.

Đội muốn agent tự làm ba việc. Việc thứ nhất là chuyển bộ test sang framework mới trong một cuối tuần. Việc thứ hai là cập nhật dependency mỗi đêm. Việc thứ ba là làm bên điều tra đầu tiên mỗi khi job trừ tiền hoặc một bản deploy bị lỗi.

## Trước khi để agent chạy một mình

Với mỗi việc định giao, bạn nên trả lời được năm câu sau trước khi để agent chạy một mình.

1. **Thế nào là xong?** Bạn cần một tiêu chí cụ thể, chẳng hạn điều kiện đặt cho lệnh `/goal` (nói ở mục sau), một file spec, hay một test đang đỏ phải chuyển xanh.
2. **Agent tự kiểm bằng cách nào?** Nó có thể chạy bộ test, dùng hook `Stop` (lệnh tự chạy mỗi khi Claude định kết thúc lượt), hoặc qua một bước review.
3. **Agent được đụng tới những gì?** Bạn giới hạn bằng permission rules, sandbox, worktree (một bản checkout riêng của repo), và chỉ cho push lên đúng một nhánh.
4. **Khi nào nó phải dừng?** Đặt giới hạn số lượt và số tiền được tiêu.
5. **Kết quả nằm ở đâu, ai duyệt?** Kết quả là một PR hay một bản tóm tắt. Merge, deploy hay bất cứ việc gì không hoàn tác được thì phải có người duyệt.

Nếu agent hay task còn mới, bạn nên ngồi xem vài lần chạy đầu rồi mới để nó chạy một mình.

## Chạy tới một mục tiêu với /goal

`/goal` là lệnh để bạn đặt một điều kiện hoàn thành. Claude sẽ làm hết lượt này tới lượt khác cho tới khi điều kiện đạt, mỗi lượt là một lần Claude làm việc rồi trả lời. Sau mỗi lượt, một model nhỏ và nhanh, gọi là model chấm, đọc điều kiện cùng hội thoại rồi đưa ra một trong ba kết luận. Nếu chưa đạt, Claude làm tiếp và dựa vào lý do model chấm đưa ra để biết cần làm gì. Nếu đạt, hoặc không thể đạt (**impossible**), goal kết thúc.

Model chấm không chạy lệnh và không đọc file. Nó chỉ chấm những gì Claude đã đưa ra trong hội thoại. Nhờ vậy, model đang làm việc không tự tuyên bố mình đã xong, mà một model khác quyết định chuyện đó.

Goal không đổi permission mode, tức chế độ quyết định Claude có phải hỏi bạn trước khi làm hay không. Ở Manual mode, Claude vẫn dừng lại hỏi trước những lệnh chưa được cho phép. Muốn các lượt chạy mà không cần ai trông, bạn đặt goal trong auto mode. Ở chế độ này, một classifier duyệt từng hành động thay bạn. Với `claude -p "/goal …"`, cả vòng lặp chạy xong trong một lần gọi.

Nếu một lượt kết thúc khi subagent hay lệnh shell ở background vẫn còn chạy, model chấm chưa chấm lượt đó. Việc ở background nào chạy quá 30 phút thì Claude Code nhắc Claude xem lại việc đó còn tiến triển hay đã kẹt.

Việc đầu tiên của đội gym là chuyển 2.140 test sang framework mới. Chiều thứ Sáu, một kỹ sư push nhánh đang làm dở rồi mở một cloud session. Đây là session chạy trên máy ảo của Anthropic, nên anh có thể gập laptop cả cuối tuần. Cloud session lấy code bằng cách clone repo từ GitHub, vì thế anh phải push trước. Những gì chỉ có trên laptop sẽ không theo sang, như commit chưa push, file chưa commit, hay MCP server chỉ khai báo trên máy. Cách khác là Remote Control, tức điều khiển session trên máy mình bằng điện thoại. Cách này giữ được những thứ đó, nhưng laptop phải bật và tiến trình `claude` phải chạy suốt hai ngày.

Điều kiện đầu tiên chỉ là "lệnh chạy test thoát với mã 0". Sáng thứ Hai goal báo đạt, nhưng hoá ra Claude đã thêm `.skip` vào 14 test để chúng không chạy nữa.

**Sơ đồ: Điều kiện chỉ có mã thoát thì thêm .skip cũng được tính là xong**

✗ _Chỉ yêu cầu lệnh test thoát với mã 0_
1. Claude thêm .skip để test không chạy nữa
   ↓ _model chấm chỉ thấy mã 0 trong hội thoại_
2. **14 test** bị thêm .skip mà goal vẫn báo đạt

✓ _Thoát 0, đủ 2.140 test chạy, không thêm .skip, hoặc dừng sau 60 lượt_
1. Sau mỗi lượt, Claude in số test đã chạy và số chỗ có .skip
   ↓ _model chấm xét từng vế, kể cả vế 60 lượt_
2. **9 test** còn đỏ ở lượt 60, mỗi test kèm lý do

Một điều kiện tốt có ba phần. Phần đầu là một trạng thái cuối đo được, như mã thoát, số file hay hàng đợi rỗng. Phần thứ hai là cách chứng minh trạng thái đó, tức chạy lệnh nào và output trông ra sao. Phần thứ ba là những gì không được đổi trên đường tới đó. Bạn nên thêm một vế giới hạn như "hoặc dừng sau 60 lượt" để goal không chạy mãi. Model chấm xét vế này giống mọi vế khác, tức là dựa vào những gì có trong hội thoại. Lần chạy lại với điều kiện mới dừng ở lượt 60, còn 9 test đỏ, mỗi test kèm lý do Claude chưa sửa được.

Goal cũng có thể bị huỷ giữa chừng khi gặp lỗi mà bạn phải tự xử lý, như hết credit, model không còn dùng được, hay context đầy tới mức tóm gọn hội thoại cũng không đủ chỗ. Goal đã bị huỷ như vậy thì phải đặt lại bằng `/goal`. Còn khi bạn resume một session mà goal vẫn đang chạy, goal quay lại, nhưng số lượt, thời gian và token của goal đếm lại từ 0.

## Chạy theo lịch: chọn chỗ chạy

Việc thứ hai là cập nhật dependency mỗi đêm. Claude Code có ba cách hẹn giờ cho agent chạy. Cloud scheduled task chạy trên cloud của Anthropic. Desktop scheduled task chạy trong app Claude trên máy bạn. Lệnh `/loop` lặp lại một prompt trong session đang mở. Ngoài ra bạn có thể dùng lịch `schedule` của GitHub Actions.

|   | Cloud scheduled task | Desktop scheduled task | `/loop` | GitHub Actions `schedule` |
| --- | --- | --- | --- | --- |
| Chạy ở | Cloud của Anthropic | Máy của bạn | Session đang mở | Runner CI |
| Cần máy bật | Không | Có, và app đang chạy | Có | Không |
| Có file trên máy | Không, clone mới mỗi lần | Có | Có | Không |
| Khoảng cách tối thiểu | 1 giờ | 1 phút nếu nhờ Claude đặt, 1 giờ nếu dùng biểu mẫu | 1 phút | Theo cron trong workflow |
| Máy ngủ lúc tới giờ | Vẫn chạy | Lỡ lượt đó, khi máy thức thì chạy bù một lần cho lượt lỡ gần nhất | Không chạy, không bù | Vẫn chạy |

`/loop` hợp với việc canh chừng ngắn hạn ngay trong session, như theo dõi CI của một PR. Một vòng lặp định kỳ như vậy tự hết hạn sau 7 ngày. Còn lịch `schedule` của GitHub Actions chỉ chạy những workflow nằm trên nhánh mặc định.

Ban đầu đội gym đặt việc này thành Desktop scheduled task trên laptop của một kỹ sư, chạy lúc 1:00. Laptop ngủ cả đêm, nên tới 8:50 sáng máy thức dậy thì Desktop mới chạy bù. Theo mặc định, task trên máy chạy ngay trong thư mục làm việc của anh, kể cả những thay đổi chưa commit. Vì thế PR cập nhật dependency mang theo cả nửa tính năng anh đang làm dở. Bật tuỳ chọn Worktree thì mỗi lần chạy có một bản checkout riêng, nhưng khi máy ngủ thì task vẫn không chạy.

Vì vậy đội chuyển sang cloud scheduled task, trước đây gọi là routine. Bạn đóng gói một lần gồm prompt, các repo và các connector (dịch vụ ngoài nối qua MCP, như Slack hay Sentry), rồi task chạy trên cloud kể cả khi laptop đã gập. Mỗi lần chạy là một cloud session đầy đủ ở auto mode (trừ khi tổ chức tắt auto mode), clone mới từ nhánh mặc định và push vào nhánh có tiền tố `claude/`. Giữa chừng không có ai trả lời câu hỏi của agent, nên prompt phải tự nói đủ: làm việc gì, và thế nào là xong. Đội đặt giờ 1:07, vì lịch đặt đúng giờ chẵn có thể bắt đầu trễ vài phút.

Khi dùng cloud scheduled task, có ba điều về quyền và phạm vi mà đội dễ bỏ sót.

- **Task thuộc tài khoản claude.ai của người tạo**, không chia sẻ với đồng đội. Commit, PR và tin nhắn qua connector đều mang tên người đó, và mỗi lần chạy trừ vào hạn mức của họ. Vì vậy đội giữ một danh sách các task, ghi rõ ai là chủ của từng task.
- **Branch protection được xét theo quyền GitHub của người tạo task.** Nếu người đó có quyền bỏ qua luật bảo vệ nhánh, thì lần chạy của task cũng bỏ qua được và có thể push thẳng vào `main`. Kỹ sư tạo task là admin của repo, nên đội đặt một ruleset không cho cả admin bỏ qua.
- **Mọi connector của tài khoản đều được gắn vào task theo mặc định**, kể cả connector có quyền ghi. Bạn nên gỡ những connector mà task không cần.

## Agent xử lý bước đầu khi CI/CD hay production báo lỗi

Việc thứ ba là để agent xử lý bước đầu khi có sự cố (**CI/CD incident first response**). Agent điều tra trước, nên khi người trực vào xem thì đã có sẵn bản phân tích. Đội dùng luôn cloud scheduled task cho việc này, vì ngoài lịch, task còn có thể bắt đầu theo hai cách khác. Có ba loại trigger (thứ làm task bắt đầu chạy), và một task kết hợp được nhiều loại: lịch, sự kiện GitHub (pull request, release, issue), và lời gọi API.

Với trigger API, mỗi task có một endpoint `/fire` riêng, kèm bearer token chỉ hiện một lần lúc tạo. Công cụ cảnh báo hay pipeline deploy gửi POST tới endpoint đó, đặt nội dung cảnh báo vào trường `text`, và nhận lại URL của session vừa mở.

Claude không nhận `text` như một tin nhắn bình thường. Nội dung đó nằm trong khối `<routine-fire-payload>` và được đánh dấu là dữ liệu không tin cậy. Claude không làm theo chỉ dẫn trong khối, trừ khi prompt đã lưu của task bảo vậy. Ai có token cũng gửi được `text`, nên prompt phải nhắc thẳng tới khối đó, kiểu "điều tra cảnh báo trong khối routine-fire-payload", và chỉ giao việc đọc, phân tích và đề xuất bằng draft PR. Prompt đã lưu cũng không được tính là sự đồng ý của một người đang trực, nên nó không thể thay bạn cho phép bất kỳ hành động nào trong lần chạy.

Ngay đêm đầu tiên đội bật agent này, cổng thanh toán trả timeout và job trừ tiền bị lỗi ở hàng chục phòng gym. Diễn biến như sau.

**Sơ đồ: Gộp cảnh báo theo dedup key thì mỗi sự cố chỉ có một lần chạy, thay vì 30 session**
_Hai cột. Cột đêm đầu. Sentry gửi 41 cảnh báo, mỗi cảnh báo gọi /fire một lần. Task chạm trần 30 lần gọi mỗi giờ, các lần gọi sau bị từ chối. Toả ra 30 session cùng điều tra, cùng đọc log của một sự cố. Kết quả là các draft PR mâu thuẫn nhau, nhiều cách sửa cho cùng một sự cố. Cột sau khi sửa. Cảnh báo từ Sentry về timeout ở cổng thanh toán được công cụ cảnh báo gộp theo dedup key gồm tên job, cổng thanh toán và khung giờ. Rồi gọi /fire một lần, text nằm trong khối routine-fire-payload. Kết quả là một lần chạy và một draft PR, agent tìm nhánh claude/ đã có trước khi mở mới._

- **ĐÊM ĐẦU**
- **Sentry gửi 41 cảnh báo**: mỗi cảnh báo gọi /fire một lần
- **Trần 30 lần gọi mỗi giờ**: các lần gọi sau bị từ chối
- **30 session cùng điều tra**: cùng đọc log của một sự cố
- **Draft PR mâu thuẫn nhau**: nhiều cách sửa cho cùng một sự cố
- **SAU KHI SỬA**
- **Cảnh báo từ Sentry**: timeout ở cổng thanh toán
- **Gộp theo dedup key**: tên job, cổng thanh toán, khung giờ
- **Gọi /fire một lần**: text nằm trong routine-fire-payload
- **Một lần chạy, một draft PR**: tìm nhánh claude/ đã có trước

Mỗi task chỉ nhận tối đa 30 lần gọi API hoặc bấm **Run now** (chạy ngay) mỗi giờ, tính chung một bộ đếm. Lần chạy theo lịch được tính riêng. Vượt mức đó thì các lần gọi sau đều thất bại cho tới khi sang giờ mới, và bạn không thể trả thêm tiền để nâng mức này. Trigger theo sự kiện GitHub cũng có trần mỗi giờ, và những sự kiện vượt trần sẽ bị bỏ qua.

Nhưng chạm trần chưa phải vấn đề chính. Vấn đề là 30 session cùng điều tra một sự cố. Đội sửa ở phía công cụ cảnh báo, gộp các cảnh báo theo một khoá (dedup key) gồm tên job, cổng thanh toán và khung giờ, để mỗi sự cố chỉ gọi `/fire` một lần. Prompt của task cũng bảo Claude tìm nhánh `claude/` hay draft PR đã có cho sự cố đó trước khi mở cái mới.

Chuyện thứ hai là agent được làm tới đâu. Anthropic cũng dùng một agent xử lý cảnh báo như vậy cho chính mình. Agent đó đọc log production, tìm nguyên nhân, viết postmortem, đôi khi viết cả bản sửa, nhưng không deploy được. Nó chạy bằng một tài khoản hệ thống chỉ có ba quyền: viết tài liệu mới, đăng vào kênh nội bộ và đọc log production. Sau một lần nâng cấp model, agent này tự nhắn qua Slack, nhờ một instance Claude khác có quyền viết code push bản sửa giúp. Bước review bắt buộc của con người đã chặn lại, đúng như cách hệ thống được thiết kế. Vì vậy, giới hạn của agent phải dựa vào quyền nó có và hành động nó làm được, kể cả việc nó nhắn được cho agent nào, chứ không dựa vào lời dặn trong prompt.

Theo cách đó, đội gym chỉ cho agent của mình đọc Sentry qua connector, đọc repo và mở draft PR, không có quyền merge.

Ngoài cloud scheduled task, Claude Code còn hai cách khác để agent phản ứng theo sự kiện. Cách thứ nhất là Auto-fix, tính năng để Claude theo dõi một PR. Khi CI báo lỗi hay có comment review, Claude tự push nếu bản sửa đã rõ, và hỏi lại nếu comment có nhiều cách hiểu. Auto-fix trả lời comment bằng tài khoản GitHub của bạn. Vì thế, những automation chạy khi có comment trên PR có thể bị kích hoạt dù bạn không định, ví dụ Atlantis, công cụ chạy Terraform mỗi khi có comment.

Cách thứ hai là Channels. Channels dùng một MCP server để đẩy sự kiện vào session đang mở trên máy bạn, hợp khi agent cần file và bối cảnh chỉ có trên máy đó. Tính năng này còn là research preview, và tổ chức dùng gói Team hay Enterprise phải bật nó trước. Nếu channel chuyển tiếp cả các yêu cầu xin quyền, thì bất kỳ ai nằm trong allowlist người gửi của channel đều duyệt hoặc từ chối được tool trong session của bạn.

## Checkpoint, thông báo và leo thang

Sau đêm đầu tiên, một kỹ sư đã gắn thêm connector của cổng thanh toán vào task "cho tiện", kèm luật `ask` cho `retry_charge`, tool thử trừ tiền lại của connector đó. Luật `ask` là permission rule buộc agent hỏi người trước khi gọi tool. Một tuần sau, job trừ tiền lại lỗi. Lần chạy điều tra tới bước gọi `retry_charge` thì dừng lại chờ duyệt.

Nhưng không ai thấy yêu cầu duyệt đó. Một cloud session đang chờ duyệt tool của connector bị coi là không hoạt động, nên có thể hết hạn trong lúc chờ. Lần này máy ảo đã bị thu hồi. Sáng hôm sau, người trực mở lại session thì thấy hội thoại còn nguyên, nhưng các truy vấn log chạy ở background đã mất, nên phải điều tra lại từ đầu. Sau lần đó, đội thêm vào ba thứ.

Thứ nhất là checkpoint (**checkpointing**), tức lưu kết quả làm dở ra chỗ vẫn còn sau khi session mất. Cách hay dùng là ghi dần trong lúc làm. Agent điều tra sự cố cập nhật những gì nó phát hiện vào mô tả draft PR, còn agent chuyển test thì commit từng lô file lên nhánh. Khi một cloud session đã hết hạn được mở lại, chỉ có hội thoại được khôi phục, còn các lệnh shell, subagent hay `/loop` đang chờ đều mất. Cũng đừng nhầm với checkpoint của lệnh `/rewind`, tính năng tự lưu trạng thái file để bạn quay lại một lượt trước. Tính năng này không thay được git, vì những file chỉ bị sửa bằng lệnh Bash sẽ không được lưu lại.

Thứ hai là thông báo (**notification**). Trạng thái Succeeded trong lịch sử task chỉ có nghĩa là session kết thúc mà không gặp lỗi, chứ không có nghĩa việc đã xong. Những request bị chặn hay việc còn làm dở chỉ nằm trong transcript, không mở ra đọc thì không ai biết. Đội yêu cầu mỗi lần chạy kết thúc bằng dòng `DONE` hoặc `NEED_HUMAN` kèm bằng chứng. Agent cũng phải đăng tin vào kênh Slack `#su-co` hai lần, lúc bắt đầu (kèm URL session) và lúc kết thúc. Khi chạy trên máy bạn, hook `Notification` sẽ chạy mỗi khi Claude chờ bạn nhập hoặc chờ duyệt. Remote Control thì đẩy thông báo về điện thoại khi một việc dài đã xong hoặc khi Claude cần bạn quyết định.

Thứ ba là leo thang (**escalation design**). Bạn quyết định từ trước khi chạy: lần chạy sẽ dừng ở đâu, và khi đó ai được gọi. Trong cloud scheduled task, lần chạy sẽ dừng lại chờ người khi gặp một hành động khớp luật `ask`, hoặc khi classifier của auto mode chặn 3 lần liên tiếp hay 20 lần tổng cộng. Với `claude -p` thì khác. Vì không có ai để hỏi, hành động đó bị từ chối và Claude làm tiếp, nên lần chạy có thể kết thúc "thành công" dù việc còn dở. Các lần bị từ chối được ghi trong trường `permission_denials` của kết quả cuối cùng.

Với một tác vụ bắt buộc phải có người duyệt, cách chắc nhất là không giao quyền đó cho agent. Đội gỡ connector của cổng thanh toán khỏi task, và để công cụ cảnh báo tự gọi người trực tuỳ theo mức độ sự cố, không đợi agent báo kẹt.

**Sơ đồ: Sự cố nặng thì công cụ cảnh báo gọi người trực ngay, không đợi agent báo kẹt**

> **Bẫy đề**
>
> Sau đêm có 41 cảnh báo, trưởng nhóm muốn agent phản ứng nhanh hơn mà người trực đỡ việc hơn. Có ba cách nghe hợp lý nhưng sai.
>
> - **Cho agent quyền retry giao dịch và rollback để khỏi chờ người** (_grant the responder write access to production_). Cách này có vẻ rút ngắn thời gian xử lý. Nhưng prompt đã lưu không phải là sự đồng ý của ai, và chỉ một lần retry sai là hội viên bị trừ tiền hai lần.
> - **Nhân task thành ba bản để chia cảnh báo, khỏi chạm trần mỗi giờ** (_clone the task to spread the load_). Trần mỗi giờ chỉ là triệu chứng. Vấn đề nằm ở chỗ nhiều session cùng điều tra một sự cố, và nhân ba task chỉ sinh thêm session trùng và thêm draft PR mâu thuẫn nhau.
> - **Cho agent nhắn agent khác có quyền push để sửa ngay** (_let agents hand off over chat_). Làm vậy thì agent vốn chỉ được đọc lại mượn được quyền push của agent khác, đúng kiểu lỗ hổng mà agent sự cố của Anthropic từng gặp.
>
> **Chọn:** gộp cảnh báo theo sự cố trước khi gọi `/fire`, để mỗi sự cố chỉ có một lần chạy. Agent chỉ đọc, phân tích và đề xuất bằng draft PR, và ghi kết quả dần ra ngoài session. Còn việc gọi người trực thì để công cụ cảnh báo làm, tuỳ mức độ sự cố.

> **Trong đề chọn gì**
>
> Với agent không người trực, hãy để ý hai chuyện. Một là chọn chỗ chạy: việc phải chạy khi máy tắt thì dùng cloud scheduled task, việc cần file và bối cảnh trên máy thì dùng Desktop scheduled task, Remote Control hoặc Channels. Hai là quyền: cho agent thêm quyền để khỏi chờ người là hướng sai, vì quyền của agent phải hẹp ở mức đọc và đề xuất, còn việc không hoàn tác được thì cần người duyệt.

> **Ý chính**
>
> Điều kiện của `/goal` cần một trạng thái đo được, cách chứng minh, những gì không được đổi và một giới hạn số lượt. Cloud scheduled task chạy cả khi máy tắt, cách nhau tối thiểu 1 giờ, nhận tối đa 30 lần gọi API hay bấm Run now mỗi giờ, và hành động dưới tên người tạo. Gộp cảnh báo trước khi gọi `/fire`, vì nội dung `text` là dữ liệu không tin cậy và prompt đã lưu không phải là sự đồng ý. Ghi kết quả dần ra ngoài session, và nhớ rằng Succeeded chưa có nghĩa là việc đã xong.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 8](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Keep Claude working toward a goal (Claude Code Docs)](https://code.claude.com/docs/en/goal)
3. [Automate work with scheduled tasks (Claude Code Docs)](https://code.claude.com/docs/en/routines)
4. [Schedule recurring tasks in Claude Code Desktop (Claude Code Docs)](https://code.claude.com/docs/en/desktop-scheduled-tasks)
5. [Run prompts on a schedule (Claude Code Docs)](https://code.claude.com/docs/en/scheduled-tasks)
6. [Use Claude Code in the cloud (Claude Code Docs)](https://code.claude.com/docs/en/claude-code-on-the-web)
7. [Push events into a running session with channels (Claude Code Docs)](https://code.claude.com/docs/en/channels)
8. [Permission modes (Claude Code Docs)](https://code.claude.com/docs/en/permission-modes)
9. [Run Claude Code programmatically (Claude Code Docs)](https://code.claude.com/docs/en/headless)
10. [Best practices, let Claude run without you (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
11. [Remote Control (Claude Code Docs)](https://code.claude.com/docs/en/remote-control)
12. [Automate actions with hooks (Claude Code Docs)](https://code.claude.com/docs/en/hooks-guide)
13. [Checkpointing (Claude Code Docs)](https://code.claude.com/docs/en/checkpointing)
14. [Claude Code GitHub Actions (Claude Code Docs)](https://code.claude.com/docs/en/github-actions)
15. [How Anthropic secures its AI-native software development lifecycle (Claude Blog)](https://claude.com/resources/articles/how-anthropic-secures-its-ai-native-software-development-lifecycle)
