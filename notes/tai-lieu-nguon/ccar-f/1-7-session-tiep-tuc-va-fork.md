---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-7-session-tiep-tuc-va-fork
ngay_tai: 2026-11-27
tieu_de: Resume, fork hay mở session mới
---

Domain 1: Agentic Architecture & Orchestration · Task 1.7

# Resume, fork hay mở session mới

Quay lại session đã đặt tên bằng --resume, báo cho session biết file nào đã đổi, thử hai hướng bằng fork_session, và khi nào nên mở session mới kèm tóm tắt.

- 15 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Đặt tên session và quay lại đúng session đó bằng --resume
- Báo cho session vừa resume biết đúng những file đã đổi, thay vì bắt nó đọc lại từ đầu
- Dùng fork_session để thử hai hướng từ cùng một kết quả phân tích
- Chọn giữa resume session cũ và mở session mới kèm bản tóm tắt có cấu trúc

Một việc điều tra lớn với Claude Code hiếm khi xong trong một lần ngồi. Hôm sau bạn quay lại, code đã đổi một ít, và đôi khi bạn muốn thử hai hướng sửa từ cùng một chỗ. Lúc đó bạn nên làm tiếp buổi làm việc hôm trước, tách nó làm hai, hay bỏ đi và làm lại từ đầu?

Mỗi buổi làm việc như vậy với Claude Code, hay với Agent SDK (thư viện để tự viết agent bằng code), gọi là một session. Session lưu toàn bộ hội thoại: các prompt, các lần gọi tool và kết quả của chúng. Khi quay lại, bạn có ba lựa chọn. **Resume** là mở lại đúng session cũ và viết tiếp vào đó. Fork (option `fork_session` trong SDK) là tạo một session mới mang bản sao lịch sử của session cũ, rồi đi riêng. Cách thứ ba là mở session mới và đưa vào một bản tóm tắt có cấu trúc (**structured summary**) thay cho lịch sử cũ.

**Sơ đồ: Session lưu hội thoại. Có ba cách dùng lại nó, nhưng không cách nào đưa file trên ổ đĩa về bản cũ**
_Một session và ba cách dùng lại: resume, fork, session mới kèm structured summary_

- **Session**: lịch sử hội thoại
- prompt
- lần gọi tool
- kết quả tool
- đặt tên: -n, /rename
- hoặc dùng session ID
- **Resume: viết tiếp vào chính session đó**: claude --resume <tên> · SDK: resume = session_id
- --continue chỉ mở session gần nhất trong thư mục
- file đã đổi: báo đúng file nào (targeted re-analysis)
- **Fork: session mới, có session ID riêng**: --fork-session · /branch · SDK: fork_session=True
- mang bản sao lịch sử, session gốc giữ nguyên
- **Session mới + structured summary**: bỏ lịch sử cũ, đưa vào bản tóm tắt có cấu trúc
- khi kết quả tool đã cũ (stale tool results)
- **Session lưu hội thoại, không lưu file trên ổ đĩa**: Resume hay fork không đưa file về bản cũ. Việc đó cần file checkpointing

## Ví dụ xuyên suốt: lỗi trùng giờ ở ứng dụng đặt sân bóng

Một ứng dụng đặt sân bóng mini ở Đà Nẵng có khoảng 60 sân đối tác. Backend viết bằng Python, đội có 4 dev. Vy, một dev backend, dùng Claude Code để điều tra một lỗi: giờ cao điểm tối thứ Sáu, thỉnh thoảng hai khách cùng đặt được một sân trong cùng một khung giờ. Ứng dụng còn có một agent trả lời khách, do đội viết bằng Agent SDK, chuyên lo các yêu cầu đổi giờ và hoàn tiền.

## Đặt tên session rồi quay lại bằng --resume

Thứ Hai, Vy mở Claude Code bằng `claude -n trung-gio-san` và làm hai tiếng với lỗi trùng giờ. Claude đọc 18 file, lần theo luồng đặt sân từ API tới bảng `lich_dat` và ghi lại hai chỗ nghi ngờ. Thứ Ba, Vy mở thêm hai session ngắn trong cùng thư mục để sửa một lỗi giao diện. Sáng thứ Tư, Vy gõ `claude --continue` để làm tiếp lỗi trùng giờ, nhưng Claude lại mở ra session sửa giao diện hồi chiều thứ Ba.

`--continue` (viết tắt `-c`) mở session gần nhất trong thư mục hiện tại, mà session đó chưa chắc là session bạn đang nghĩ tới. Muốn mở đúng một session cũ theo tên (**named session resumption**), bạn dùng **`--resume`** kèm tên của nó:

```bash
claude -n trung-gio-san          # đặt tên khi mở session
claude --resume trung-gio-san    # hôm sau, mở lại đúng session đó
```

Bạn đặt tên bằng `-n` (viết đầy đủ là `--name`) lúc mở session, hoặc gõ lệnh `/rename` khi đang làm. Nếu tên đó khớp với nhiều session, Claude Code mở danh sách để bạn chọn. Nếu session chưa có tên, bạn gõ `claude --resume` không kèm gì rồi chọn trong danh sách hiện ra, hoặc gõ `claude --resume` kèm session ID, tức mã riêng của mỗi session.

Vy thoát ra, gõ `claude --resume trung-gio-san`, và Claude có lại đủ hội thoại hôm thứ Hai: file đã đọc, các lần gọi tool, các nhận định. Vy làm tiếp từ hai chỗ nghi ngờ mà không phải giải thích lại gì.

Trong Agent SDK, bạn làm việc này bằng code. Đặt `continue_conversation=True` (bản Python) thì SDK mở session gần nhất trong thư mục, giống `--continue`. Muốn mở một session cụ thể, bạn lưu `session_id` từ message kết quả mà SDK trả về khi chạy xong lần trước, rồi truyền nó vào `resume`.

> **Bẫy đề**
>
> Thứ Hai Vy mở session bằng `claude -n trung-gio-san`. Thứ Ba Vy mở thêm hai session ngắn trong cùng thư mục, và sáng nay `claude --continue` mở nhầm một trong hai session đó. Lệnh nào mở lại session `trung-gio-san` với đủ lịch sử? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **`claude --continue --fork-session`** (_continue and fork_). Fork nghe như an toàn vì làm trên bản sao. Nhưng `--continue` vẫn chọn session gần nhất, nên bản sao đó là bản sao của session sửa giao diện.
> - **`--session-id` với một UUID** (_a new UUID, or one copied from the transcript file_). Option này chỉ đặt sẵn một UUID cho cuộc hội thoại. Lệnh để mở lại theo ID là `--resume <session-id>`, và với UUID mới thì Claude bắt đầu từ một session trống.
> - **`/clear` rồi nhờ Claude làm tiếp** (_clear the current session_). `/clear` bắt đầu lại với một context trống, còn session đang mở được cất đi. Lịch sử hôm thứ Hai không quay lại theo lệnh này.
>
> **Chọn:** `claude --resume trung-gio-san`, dùng đúng cái tên đã đặt lúc mở session.

## Báo cho session biết file nào đã đổi

Vy chưa để ý một chuyện. Tối thứ Ba, một đồng nghiệp đã merge PR #212, sửa 3 trong 18 file Claude từng đọc: `khoa_san.py`, `gia_gio_cao_diem.py` và `api/dat_san.py`. Vy resume mà không nhắc gì, và Claude đề xuất sửa hàm `giu_cho` trong `khoa_san.py` theo nội dung cũ, trong khi PR đã đổi tên hàm này.

Nội dung file mà session đang giữ chỉ là bản chụp lúc Claude đọc file đó. Resume chỉ nạp lại hội thoại, nên Claude không tự biết file trên ổ đĩa đã đổi. Có hai cách chữa nghe hợp lý nhưng tốn công. Cách thứ nhất là bắt Claude đọc lại cả 18 file, tốn context cho 15 file không đổi. Cách thứ hai là mở session mới và điều tra lại từ đầu, bỏ phí hai tiếng phân tích mà phần lớn vẫn còn đúng. Mở session mới rồi dán nguyên transcript cũ vào prompt cũng không hơn gì, vì Claude vẫn mang bản cũ của 3 file mà không ai báo. Còn checkout lại commit cũ cho khớp với bản chụp thì Claude sẽ làm việc trên code không còn là code cần sửa.

**Sơ đồ: PR đổi 3 trong 18 file. Báo đúng 3 file thì Claude chỉ đọc lại 3, vẫn nhớ những gì đã hiểu ở 15 file**
_Ba cách làm tiếp session trung-gio-san sau khi PR #212 sửa 3 trong 18 file Claude đã đọc_

- Thứ Hai: Claude đọc 18 file
- Tối thứ Ba: PR #212 sửa 3 file
- Sáng thứ Tư: resume
- 3 file đổi: khoa_san.py, gia_gio_cao_diem.py, api/dat_san.py
- **Resume, không nói gì**: Claude tin bản chụp lúc đọc
- 3 file vẫn là nội dung cũ
- **Sửa hàm đã đổi tên**: giu_cho trong khoa_san.py cũ
- **Đọc lại cả 18 file**: resume, bắt đọc lại từ đầu
- đọc lại cả 18 file
- **15 file đọc lại thừa**: tốn context và thời gian
- **Resume + báo 3 file**: nói rõ trong prompt đầu tiên
- chỉ đọc lại 3 file
- **Nhớ 15 file đã đọc**: 3 file đổi: đọc bản mới

Cách hợp lý là resume, rồi báo cho agent biết đúng những gì đã đổi (**informing the agent about changes**) ngay trong prompt đầu tiên:

```
Từ tối qua, PR #212 đã sửa 3 file: khoa_san.py (đổi tên giu_cho thành khoa_khung_gio),
gia_gio_cao_diem.py và api/dat_san.py. Các file khác không đổi. Đọc lại 3 file này,
rồi xem hai chỗ nghi ngờ hôm thứ Hai còn đúng không.
```

Lúc này Claude chỉ đọc lại 3 file, vẫn nhớ những gì đã hiểu về 15 file kia, và không còn dựa vào nội dung cũ của những file đã đổi. Cách chỉ phân tích lại đúng phần đã đổi như vậy gọi là **targeted re-analysis**. Bạn lấy danh sách file đã đổi từ git, chẳng hạn bằng `git diff --stat`, rồi ghi rõ từng file, đừng chỉ nói chung chung là "code có thay đổi".

> **Bẫy đề**
>
> Session điều tra hôm qua đã đọc 18 file. Trong đêm, đồng nghiệp merge PR sửa 3 trong số đó, các file khác giữ nguyên. Nên làm tiếp thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Resume và cho Claude đọc lại cả 18 file** (_resume and have the agent re-read all files_). Đọc lại hết thì chắc chắn không sót. Có điều 15 file không đổi, đọc lại chỉ làm đầy context và tốn thời gian.
> - **Mở session mới để không mang giả định cũ** (_start a new session with the current codebase_). Session mới đúng là không mang giả định cũ, nhưng hai tiếng phân tích còn đúng bị bỏ đi, và Claude phải lần lại từ đầu.
> - **Resume mà không nói gì** (_resume without informing the agent_). Phần lớn hiểu biết vẫn đúng, nên tưởng như không cần nhắc. Thực ra Claude sẽ dựa vào bản chụp cũ của đúng 3 file đã đổi, và có thể đề xuất sửa một hàm không còn tồn tại, như Vy đã gặp.
>
> **Chọn:** resume, và báo đúng những file nào đã đổi để Claude chỉ phân tích lại các file đó.

## Fork để thử hai hướng sửa

Tới trưa thứ Tư, Claude đã khoanh được nguyên nhân. Hai request đặt sân tới gần như cùng lúc, và cả hai đều thấy khung giờ còn trống, vì chưa request nào kịp ghi lịch đặt vào bảng. Có hai hướng sửa. Hướng thứ nhất là khoá dòng đó trong database ngay lúc kiểm tra, bằng `SELECT ... FOR UPDATE`, để request thứ hai phải chờ. Hướng thứ hai là thêm cột `phien_ban` vào bảng `lich_dat`. Lúc ghi, nếu `phien_ban` của dòng đã khác so với lúc đọc thì lần ghi đó bị từ chối. Vy muốn Claude viết đề xuất chi tiết cho từng hướng, rồi mới chọn.

Làm cả hai hướng trong cùng một session thì hướng sau bị lẫn với những gì đã bàn cho hướng trước. Mở hai session mới thì phải dựng lại toàn bộ phân tích. Fork tránh được cả hai chuyện, vì nó tạo hai nhánh khám phá song song (**parallel exploration branches**) từ cùng một điểm phân tích (**shared analysis baseline**). Session fork ra có session ID riêng và mở đầu bằng bản sao lịch sử của session gốc, còn session gốc thì không bị đụng tới. Vy fork hai lần, mỗi nhánh một hướng:

```bash
claude --resume trung-gio-san --fork-session   # nhánh 1: khoá dòng
claude --resume trung-gio-san --fork-session   # nhánh 2: cột phien_ban
```

Nếu đang ở trong session, bạn gõ lệnh `/branch`, có thể kèm tên cho nhánh mới. Trong Agent SDK, bạn gọi `query()` với `resume` là session ID cũ và `fork_session=True`, rồi lấy session ID mới của nhánh từ message kết quả. Hai nhánh đều có đủ phân tích của buổi sáng, và không nhánh nào thấy những gì nhánh kia viết sau đó. Một hướng thử có thể làm rối hội thoại cũng nên chạy trong nhánh fork, để context của session chính không lẫn những gì đã thử.

Fork chỉ tách lịch sử hội thoại, không tách file trên ổ đĩa. Nếu Claude ở nhánh 1 sửa `khoa_san.py`, file đó bị sửa thật, và nhánh 2, vốn làm trong cùng thư mục, cũng thấy thay đổi đó. Vì vậy Vy dặn cả hai nhánh chỉ viết đề xuất trong câu trả lời, chưa sửa file nào.

**Sơ đồ: Fork tách lịch sử thành hai nhánh, nhưng cả ba session cùng làm trên một thư mục file**
- fork
- sửa khoa_san.py
- đọc, ghi cùng file
- thấy luôn thay đổi đó
- trung-gio-san (gốc)khoanh xong nguyên nhânlịch sử giữ nguyên
- Nhánh 1, session ID riêngbản sao lịch sử gốckhoá dòngSELECT ... FOR UPDATE
- Nhánh 2, session ID riêngbản sao lịch sử gốcthêm cột phien_ban
- Thư mục dự ánchỉ một bảncả ba dùng chung

Resume cũng không đưa file về bản cũ. Resume nạp lại đủ hội thoại, kể cả kết quả tool cũ, nhưng đó chỉ là chữ trong lịch sử, còn file trên ổ đĩa vẫn là bản đã sửa. Fork cũng vậy, nên thêm `fork_session` không làm file quay về. Muốn đưa file về lúc trước khi agent sửa, bạn cần một tính năng riêng của Agent SDK là **file checkpointing**: SDK ghi lại bản file trước khi agent sửa. Bạn bật `enable_file_checkpointing=True`, rồi gọi `rewind_files()` để đưa những file agent đã sửa bằng tool Write hay Edit về một mốc trước đó. Tính năng này chỉ trả file, không trả hội thoại. Nó cũng không hoàn tác được những gì một lệnh Bash như `sed -i` đã làm với file.

> **Trong đề chọn gì**
>
> Nếu tình huống trong đề cần thử hai hướng (hai chiến lược test, hai cách refactor) từ cùng một phân tích mà vẫn giữ session gốc nguyên vẹn, hãy chọn resume session phân tích với `fork_session`, mỗi hướng một nhánh. Các đáp án sau đều kém hơn fork:
>
> - làm lần lượt cả hai hướng trong một session, hay yêu cầu cả hai đề xuất trong cùng một câu trả lời;
> - resume một lần cho mỗi hướng và dặn agent bỏ qua hướng kia, vì cả hai lần đều ghi thêm vào cùng một session;
> - resume cho hướng thứ nhất rồi mở session mới cho hướng thứ hai, hay mở hai session mới rồi dựng lại context;
> - ghi kết quả phân tích ra file rồi mở hai session mới đọc file đó;
> - `/compact` hay `/clear`, vì hai lệnh này chỉ nén hay xoá context của chính session đang làm, không tạo nhánh nào.
>
> Nếu đề hỏi vì sao resume xong mà file trên ổ đĩa vẫn là bản đã sửa, lý do là session chỉ lưu hội thoại. Muốn đưa file về bản cũ, bạn cần file checkpointing.

## Resume session cũ hay mở session mới kèm tóm tắt

Chọn giữa resume và session mới không chỉ là chuyện của Claude Code. Agent trả lời khách của ứng dụng gặp một ca khó. Lúc 14 giờ, anh Phúc nhắn xin hoàn 300.000 đồng vì sân bị ngập. Agent gọi tool tra trạng thái, nhận về "đang chờ duyệt hoàn tiền", rồi hẹn anh chờ. Session đó dài 30 lượt, đầy kết quả tra cứu. Lúc 19 giờ, anh Phúc quay lại hỏi tiền đã về chưa. Hệ thống của đội resume lại session cũ, và agent trả lời "đang chờ duyệt" theo kết quả tool lúc 14 giờ. Thực ra quản lý đã duyệt và tiền đã chuyển từ 16 giờ.

**Sơ đồ: Resume lúc 19 giờ thì agent vẫn tin kết quả tool lúc 14 giờ, còn session mới kèm tóm tắt thì tra lại**

Kết quả tool lưu trong session chỉ đúng vào lúc tool được gọi. Khi những kết quả ấy đã cũ (**stale tool results**), resume chẳng khác gì đưa cho agent một lịch sử dài, và agent dễ coi những kết quả cũ trong đó là tình hình hiện tại. Lúc này, cách chắc hơn là mở session mới và đưa vào một bản tóm tắt có cấu trúc (**injected summary**), tức là chia sẵn thành vài mục cố định như sau:

```
Khách: Phúc, mã đặt sân DS-48127.
Vấn đề: xin hoàn 300.000 đồng vì sân ngập, khung 18–19 giờ thứ Năm.
Đã làm lúc 14 giờ: tra trạng thái hoàn tiền, kết quả khi đó là "đang chờ duyệt", đã hẹn khách chờ.
Việc cần làm: tra lại trạng thái hoàn tiền trước khi trả lời.
```

Bản tóm tắt giữ những gì vẫn đúng (khách là ai, vấn đề gì, đã làm gì), bỏ các kết quả tra cứu cũ, và dặn agent gọi tool lại để lấy trạng thái mới. Nhờ vậy, session mới gọn hơn hẳn, và trạng thái cũ chỉ còn là một dòng ghi rõ mốc 14 giờ, không bị agent coi là tình hình hiện tại.

Nên chọn cách nào là tuỳ lịch sử cũ còn đúng tới đâu:

| Tình huống | Cách làm |
| --- | --- |
| Phần lớn những gì session đã đọc vẫn đúng, chỉ vài file đổi | Resume, báo đúng các file đã đổi |
| Muốn thử hai hướng từ cùng một phân tích | Fork, mỗi hướng một nhánh |
| Kết quả tool trong session đã cũ, hoặc lịch sử dài mà phần lớn không còn dùng | Mở session mới, đưa vào bản tóm tắt có cấu trúc, rồi gọi tool lại |

> **Ý chính**
>
> Phần lớn những gì session đã biết vẫn đúng thì resume và báo rõ chỗ đã đổi. Muốn thử hai hướng thì fork. Kết quả tool cũ không còn đúng thì mở session mới với bản tóm tắt, đừng bắt agent tin vào lịch sử cũ.

> **Bẫy đề**
>
> Khách quay lại sau 5 tiếng để hỏi tiếp về cùng một yêu cầu hoàn tiền. Session trước dài 30 lượt, có kết quả tool "đang chờ duyệt hoàn tiền". Cách nào xử lý chắc nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Resume, rồi thêm vào system prompt một câu dặn agent ưu tiên khoản hoàn đang chờ** (_resume with full history and add a system prompt instruction_). Agent có đủ lịch sử lại còn được dặn kỹ. Nhưng lịch sử đó chứa trạng thái đã sai, và lời dặn không làm nó đúng lại.
> - **Resume rồi cho agent gọi lại mọi tool đã gọi trước đó** (_replay every previous tool call_). Gọi lại hết thì dữ liệu nào cũng mới. Có điều nhiều lần gọi trong 30 lượt không còn cần, và lịch sử cũ vẫn nằm đó làm context nặng thêm.
> - **Resume và nhờ khách kể lại từ đầu** (_ask the customer to repeat the issue_). Khách kể lại thì agent nắm được chuyện mới nhất, nhưng khách phải lặp lại điều hệ thống đã biết.
>
> **Chọn:** mở session mới với bản tóm tắt có cấu trúc (loại vấn đề, các bước đã làm, trạng thái lúc đó), rồi gọi tool lại khi cần.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.7](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Work with sessions (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/sessions)
3. [Manage sessions (Claude Code)](https://code.claude.com/docs/en/sessions)
4. [CLI reference (Claude Code)](https://code.claude.com/docs/en/cli-reference)
5. [Rewind file changes with checkpointing (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/file-checkpointing)
