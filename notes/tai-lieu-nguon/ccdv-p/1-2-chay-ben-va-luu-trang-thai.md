---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-2-chay-ben-va-luu-trang-thai
ngay_tai: 2026-11-27
tieu_de: Chạy bền cho agent dài hơi - lưu session, checkpoint, resume và đổi model giữa chừng
---

Domain 1: Advanced Agent Architecture and Orchestration · Task 1.2

# Chạy bền cho agent dài hơi - lưu session, checkpoint, resume và đổi model giữa chừng

Lưu trạng thái ở đâu, resume từ đâu và đổi model lúc nào để agent chạy nhiều giờ không mất việc đã làm khi bị ngắt hay khởi động lại.

- 18 phút đọc
- Đối chiếu docs 24/11/2026
- 17 nguồn

## Đọc xong bạn nắm được

- Biết mỗi loại trạng thái của agent nằm ở đâu và mất khi nào, để chọn chỗ lưu bền đúng cho từng loại
- Lưu và resume session trên nhiều host bằng SessionStore, hoặc dựa vào session phía server của Managed Agents
- Dựng checkpoint để agent ở session mới biết chính xác việc nào đã xong, việc nào còn dở, và không báo xong sớm
- Đổi version model cho agent đang chạy mà không mất quyết định đã chốt và không làm hỏng session đang dở

Với agent chỉ chạy vài giây, có lỗi thì chạy lại từ đầu cũng chẳng mất bao nhiêu. Agent chạy nhiều giờ, nhiều ngày thì khác. Nó làm việc qua nhiều context window (lượng chữ tối đa model đọc được trong một lần gọi), và trong chừng ấy thời gian gần như chắc chắn sẽ có lúc container khởi động lại, process chết, hoặc đội phải đổi sang model khác, chẳng hạn vì model cũ sắp ngừng chạy. Lần nào cũng làm lại từ đầu thì vừa tốn tiền vừa không bao giờ xong việc. Bài này trả lời ba câu: trạng thái của agent dài hơi nên lưu ở đâu, bị ngắt thì làm tiếp từ đâu, và đổi model giữa chừng thế nào cho an toàn.

Trong đề thi, nhóm kỹ năng này tên là **durable execution and state management**, tức làm cho agent chạy bền và quản lý trạng thái của nó. Bạn phải biết dùng bốn thứ: lưu session (**session persistence**), lưu điểm để làm tiếp (**checkpointing**), khả năng chạy tiếp sau khi dừng (**resumability**) và các mẫu kiến trúc memory (**memory architecture patterns**). Mục tiêu là để agent chạy dài (**long-running agents**) không mất việc đã làm trong ba tình huống: bị ngắt giữa chừng (**interruption**), bị khởi động lại (**restart**) và đổi version model (**model version change**). Nếu chưa quen checkpoint, `resume` hay memory tool, bạn nên đọc trước bài 1.3 của CCDV-F.

**Sơ đồ: Mỗi loại trạng thái cần một chỗ lưu bền ngoài container, để agent ở session mới làm tiếp đúng chỗ**
_Bản đồ bài: ba biến cố làm mất trạng thái, bốn loại trạng thái và chỗ lưu bền của từng loại, rồi resume từ các chỗ đó_

- **BA BIẾN CỐ LÀM MẤT PHẦN NẰM TRONG CONTAINER**
- **interruption**: process chết giữa việc
- **restart**: ổ đĩa container mất theo
- **model version change**: thinking cũ bị bỏ
- **MẶC ĐỊNH: DỄ MẤT**
- **Transcript**: ~/.claude/projects/
- **File làm việc**: file agent tạo ra, CLAUDE.md
- **Tiến độ công việc**: chỉ nằm trong context
- **Kiến thức dùng lại**: context của session, thinking
- **LƯU BỀN, NGOÀI CONTAINER**
- **SessionStore**: hoặc session phía server
- **Git, volume ngoài**: hoặc object store
- **Bảng tiến độ**: trạng thái của từng mục
- **Memory**: memory tool, memory store
- session persistence
- commit, push
- checkpointing
- ghi ra memory
- **Resumability: agent ở session mới đọc lại từ bốn chỗ lưu bền**: Đổi model cũng làm ở đây: tại ranh giới checkpoint, bằng một session mới

## Ví dụ xuyên suốt: agent chuyển 380 báo cáo của một công ty cấp nước

Một công ty cấp nước chuyển data warehouse sang hệ thống mới. Họ giao việc chuyển 380 báo cáo SQL cũ cho một agent viết bằng Agent SDK, chạy trong container trên Kubernetes. Với mỗi báo cáo, agent viết câu SQL mới, chạy cả câu cũ lẫn câu mới trên số liệu ba tháng rồi so kết quả. Hai kết quả khớp nhau thì báo cáo được ghi là "đạt". Đội dự tính agent làm xong trong bốn ngày.

## Mỗi loại trạng thái nằm ở đâu và mất khi nào

Ngày thứ hai, lúc agent vừa xong 142 báo cáo, đội deploy bản mới và pod khởi động lại:

**Sơ đồ: Container mới chạy lại từ báo cáo 1: 30 giờ, 61 USD chỉ để làm lại 142 báo cáo đã xong**

Agent bắt đầu lúc 08:00 ngày thứ nhất. Tới 14:20 ngày thứ hai, nó đã xong 142 báo cáo. Một phút sau, lúc 14:21, đội deploy bản mới và pod khởi động lại. Lúc 14:25, container mới chạy lại với prompt ban đầu, nên agent làm lại từ báo cáo số 1. Tới 20:30 ngày thứ ba nó mới làm lại xong 142 báo cáo cũ, tức mất thêm 30 giờ và 61 USD chỉ để quay về chỗ cũ. Mọi thứ mất sạch vì cả transcript (toàn bộ lịch sử của session: các message, các lần gọi tool và kết quả trả về) lẫn file làm việc đều nằm trên ổ đĩa của container. Với Agent SDK tự host, đó là chỗ lưu mặc định, và container khởi động lại thì ổ đĩa đó mất theo. Muốn agent không mất việc khi container khởi động lại, việc đầu tiên là biết từng loại trạng thái đang nằm ở đâu rồi chuyển nó ra chỗ bền hơn. Trong bảng, `SessionStore` là chỗ cắm để Agent SDK chép transcript sang một store bên ngoài container, còn Managed Agents là dịch vụ Anthropic chạy agent giúp bạn trên server của họ:

| Trạng thái | Mặc định nằm ở | Lưu bền bằng |
| --- | --- | --- |
| Transcript của session | `~/.claude/projects/` trong container | `SessionStore` (Agent SDK); session phía server (Managed Agents) |
| File agent tạo ra, CLAUDE.md | Thư mục làm việc | Volume ngoài, object store, git push |
| Tiến độ công việc | Chỉ nằm trong context của agent | Bảng tiến độ của ứng dụng (file JSON, database) |
| Kiến thức cần dùng lại ở nhiều session | Context của session | Memory tool, memory store của Managed Agents |

Đội sửa hai chỗ. Transcript được chép sang một store bên ngoài bằng `SessionStore`, và mỗi báo cáo viết xong thì agent commit rồi push lên git. Nhưng `git log` chỉ cho biết file nào đã viết, không cho biết báo cáo đó đã qua bước so số liệu chưa. Vì vậy tiến độ công việc, tức báo cáo nào đã thật sự đạt, vẫn chưa được lưu ở đâu cả. Chuyện đó sẽ quay lại ở phần checkpoint.

## Lưu session và resume trên host khác

Muốn resume một session, tức mở lại và làm tiếp đúng chỗ cũ (**resumability**), bạn phải lưu session ra ngoài (**session persistence**). Cách làm khác nhau tuỳ bạn tự host agent bằng Agent SDK hay dùng Managed Agents.

**Với Agent SDK tự host**, có ba cách mở lại một session cũ. `continue` lấy session mới nhất trong thư mục làm việc. `resume` lấy đúng session theo ID. Fork (`forkSession`) chép lịch sử sang một session mới, để thử một hướng khác mà không đụng tới session gốc. Cả ba cách này mặc định đọc transcript trên ổ đĩa của chính host đó. Muốn resume trên một host khác, bạn gắn thêm `SessionStore`, một adapter (đoạn code nối SDK với storage của bạn) chép transcript sang S3, Redis hay Postgres. Có ba điều dễ hiểu sai về store này.

Thứ nhất, store chỉ là bản sao, và việc chép là best-effort (cố hết sức nhưng không bảo đảm). SDK luôn ghi transcript xuống ổ đĩa trước, rồi mới gửi từng batch sang store qua hàm `append()`. Nếu `append()` lỗi ba lần (tính cả lần đầu), SDK bỏ batch đó, phát message `mirror_error` và cứ thế chạy tiếp. Vì vậy bạn nên cảnh báo mỗi khi thấy `mirror_error`. Batch được gửi lại cũng có thể trùng với phần đã ghi, nên `append()` phải loại trùng theo `entry.uuid`.

Thứ hai, store tìm session theo một khoá (lookup key) tính từ thư mục làm việc. Host mới vì vậy phải resume từ đúng `cwd` như lúc tạo session, nếu không SDK sẽ không tìm thấy session.

Thứ ba, store chỉ chép transcript, tức phần hội thoại, nên những gì nằm ngoài hội thoại thì bạn phải tự mang sang host mới. File SQL agent viết ra vẫn nằm trên ổ đĩa của host cũ, nên phải lưu ở chỗ khác như git hay volume ngoài. Cấu hình của agent cũng vậy. Transcript chỉ ghi prompt, các lần gọi tool, kết quả tool và câu trả lời. MCP server, tức chương trình chạy riêng cung cấp thêm tool cho agent, thì được cấu hình trong option của `query()` hoặc trong file `.mcp.json` ở thư mục dự án, chứ không nằm trong transcript. Vì vậy khi resume trên host mới, bạn phải có lại đúng cấu hình MCP server đó. Nếu thiếu, những tool agent đã dùng ở các lượt trước sẽ không còn để gọi ở lượt tiếp theo.

Cần store hay không còn tuỳ cách bạn bố trí container cho agent, cụ thể là container sống bao lâu so với session. Có bốn kiểu hay gặp:

| Kiểu | Container sống bao lâu | Cần `SessionStore`? |
| --- | --- | --- |
| **Ephemeral** | Mỗi việc một container, xong việc thì xoá | Cần, nếu muốn resume sau khi container đã xoá |
| **Long-running** | Chạy lâu, giữ nhiều session; mỗi session được pin (gắn cố định) vào một container bằng consistent hashing trên `sessionId` | Cần, nếu muốn resume khi container khởi động lại |
| **Hybrid** | Tắt khi rảnh, bật lại khi người dùng quay lại rồi nạp session từ store | Bắt buộc, không có store thì tắt là mất transcript |
| **Multi-agent container** | Nhiều agent chạy chung một container | Cần, nếu muốn resume khi container tắt trước lúc xong việc |

Cũng có một cách thường chắc hơn là không dựa vào resume. Ứng dụng của bạn tự ghi kết quả, các quyết định và diff vào database hay file riêng, rồi khi mở session mới thì đưa những thứ đó vào prompt.

**Với Managed Agents**, Anthropic chạy agent và giữ session ở phía server; transcript tồn tại cho tới khi bạn xoá session, nên container của bạn tắt cũng không làm mất transcript. Mỗi session có một status: `idle` (đang chờ), `running` (đang chạy), `rescheduling` (server đang tự retry sau một lỗi tạm thời) hoặc `terminated` (đã kết thúc). Phía client chỉ phải lo một việc: khi rớt kết nối, nối lại event stream sao cho không sót event nào. Thứ tự đúng là mở stream mới trước, rồi lấy danh sách event đã có để biết những ID nào mình đã thấy, sau đó đọc tiếp stream và bỏ qua event trùng. Đừng xoá session khi chưa tải về những file cần giữ, vì xoá session là xoá luôn sandbox của nó.

> **Trong đề chọn gì**
>
> Nếu tình huống là agent chạy trên container tạm và cần resume session sau khi container tắt, đáp án đúng sẽ có **session store ngoài** (`SessionStore`) hoặc session phía server. Đáp án tăng timeout hay giữ container sống lâu hơn chỉ làm container ít bị tắt hơn, chứ không thay được store.

## Checkpoint để agent ở session mới biết việc đã tới đâu

Có transcript rồi, đội tưởng đã yên. Nhưng tiến độ vẫn chưa được ghi ở đâu. Một lần resume, sau nhiều lần compaction (tự tóm tắt phần hội thoại cũ khi context gần đầy), agent nhìn vào thư mục, thấy 291 file SQL mới, báo đã chuyển và so số liệu xong cả 291 báo cáo, rồi làm tiếp phần còn lại. Thực ra 37 trong số đó chưa qua bước so số liệu, và báo cáo 291, cái cuối cùng, mới viết được nửa file.

Lưu được transcript mới giải quyết một nửa việc checkpoint (**checkpointing**), tức ghi lại việc đã tới đâu để làm tiếp. Nửa còn lại là ghi rõ việc nào đã xong, việc nào còn dở, để agent làm tiếp đúng chỗ qua nhiều context window (**across context windows**). Bản tóm tắt của compaction không đủ cho việc này, vì nó không phải lúc nào cũng giữ đủ chi tiết (bài 1.4). Anthropic từng gặp đúng chuyện này khi cho agent viết code qua nhiều session, và thấy hai kiểu hỏng. Một là agent ôm quá nhiều việc một lúc, rồi hết context giữa chừng. Hai là agent ở session mới (vẫn agent đó, nhưng bắt đầu với context trống) nhìn quanh, thấy đã có nhiều tiến triển, rồi tuyên bố xong việc, y như agent chuyển báo cáo ở đây. Cách sửa là chia việc cho hai vai:

- **Initializer agent** chỉ chạy ở session đầu, để dựng môi trường. Nó tạo danh sách việc dạng JSON với mọi mục ở trạng thái "chưa đạt", một file tiến độ, script khởi chạy và commit git đầu tiên. Danh sách dùng JSON vì model ít tự ý sửa file JSON hơn file Markdown.
- **Coding agent** chạy ở mỗi session sau. Nó đọc file tiến độ và `git log`, chạy một test end-to-end để bắt lỗi mà session trước có thể để lại, rồi chọn đúng **một** mục chưa đạt để làm. Agent chỉ được đổi mục đó sang "đạt" sau khi đã chạy kiểm tra và thấy đúng.

Đội cấp nước làm theo đúng cách này. Họ tạo file `tien-do.json` ghi trạng thái của từng báo cáo, và agent ở session mới phải đọc file đó thay vì nhìn thư mục:

**Sơ đồ: Nhìn thư mục thì 37 báo cáo chưa so bị tính là xong, còn đọc tien-do.json thì thấy 126 việc phải làm**
_Cùng 380 báo cáo: 254 đạt, 37 chưa so, 89 chưa làm. Nhìn thư mục thì gộp 291 file thành xong; đọc tien-do.json thì thấy còn 126 báo cáo phải làm_

- **CÙNG 380 BÁO CÁO, HAI CÁCH BIẾT VIỆC ĐÃ TỚI ĐÂU**
- **Agent ở session mới nhìn thư mục**
- **291 file SQL: báo đã so xong cả 291**: làm tiếp 89
- **254 đạt**
- **37**: 89 chưa làm
- 37 chưa so, gồm báo cáo 291 viết dở
- **37 báo cáo bị coi là xong nhầm**
- **Agent ở session mới đọc tien-do.json**: 254 đạt: bỏ qua
- **còn 126 báo cáo phải làm**
- **254 đạt**
- **37**: 89 chưa làm
- so lại 37, làm 89
- **Không báo cáo nào bị coi là xong khi chưa so**

Trong 291 file agent thấy, thật ra chỉ 254 báo cáo đã đạt, 37 báo cáo chưa so, và còn 89 báo cáo chưa làm. Nhìn thư mục, agent chỉ làm tiếp 89 báo cáo và bỏ sót 37 báo cáo chưa so. Đọc `tien-do.json` thì agent bỏ qua 254 báo cáo đạt và thấy còn 126 báo cáo phải làm, gồm so lại 37 báo cáo và làm mới 89 báo cáo.

Agent của công ty cấp nước không chỉ viết file mà còn chạy truy vấn và push code, tức là làm thay đổi thứ ở bên ngoài. Với loại agent này, checkpoint cần thêm bốn điều.

Checkpoint nên đặt ở ranh giới của một đơn vị việc. Ở đây một đơn vị là viết, so, commit và ghi tiến độ cho một báo cáo. Bị ngắt giữa chừng thì agent chỉ phải làm lại đúng đơn vị đó.

Tool có side effect (làm thay đổi thứ gì đó bên ngoài) nên idempotent, nghĩa là gọi hai lần cũng cho kết quả như gọi một lần; đây là cách làm phổ biến chứ không phải tính năng có sẵn. Lý do là khi bị ngắt, bạn không biết lần gọi cuối đã chạy xong chưa. Ví dụ, tool ghi báo cáo nên ghi đè theo mã báo cáo, thay vì chèn thêm một bản mới.

File checkpointing của SDK, tính năng cho phép hoàn tác các thay đổi agent đã làm trên file, có giới hạn hẹp hơn nhiều người nghĩ. Nó chỉ quay lại được những thay đổi qua tool Write, Edit, NotebookEdit, chỉ tính từ lúc bật, và không theo dõi thay đổi do subagent làm. Nó cũng ghi bản backup thẳng xuống ổ đĩa, nên bật nó cùng `SessionStore` thì SDK báo lỗi ngay lúc khởi động. Đội gặp đúng lỗi này: agent đổi tên cột hàng loạt và làm sai 12 báo cáo, đội định bật file checkpointing để lần sau quay lại được thì SDK không chịu chạy. 12 báo cáo cuối cùng được cứu bằng git: mỗi báo cáo một commit, nên chỉ cần `git revert` đúng các commit hỏng.

Cuối cùng là đặt giới hạn. Session không tự hết giờ, nên bạn chặn bằng `maxTurns` (số lượt tối đa). Subprocess của SDK cũng nên được khởi động lại định kỳ, vì bộ nhớ của nó tăng dần trong session dài.

> **Bẫy đề**
>
> Agent báo đã so xong số liệu khi còn 37 báo cáo chưa so. Ba cách sửa sau nghe hợp lý nhưng không chạm vào gốc của lỗi:
>
> - **Để compaction tự mang trạng thái qua** (_rely on compaction to carry the state_). Nghe hợp lý vì bản tóm tắt có nhắc tới tiến độ. Nhưng bản tóm tắt có thể làm rơi đúng chi tiết báo cáo nào đã so, báo cáo nào chưa.
> - **Dặn trong prompt "kiểm thật kỹ trước khi báo xong"** (_a stronger instruction alone_). Cách này có vẻ sửa thẳng vào hành vi. Nhưng không có bảng ghi trạng thái từng báo cáo thì agent vẫn không biết mục nào đã kiểm.
> - **Chạy lại cả 380 báo cáo cho chắc** (_restart from scratch_). Nghe an toàn nhất. Nhưng với agent chạy nhiều ngày, làm lại từ đầu vừa tốn tiền vừa bắt người dùng chờ thêm mấy ngày nữa.
>
> **Chọn:** ghi tiến độ ở một chỗ duy nhất nằm ngoài context, có trạng thái của từng báo cáo, như file `tien-do.json`. Agent tin vào file này chứ không tin vào những gì nó nhớ.

## Memory: thứ agent cần nhớ qua nhiều session

Bảng tiến độ cho agent biết việc nào đã xong. Nhưng agent còn cần nhớ những cách làm đội đã chốt, và đó là việc của memory. Các cách tổ chức memory hay dùng (**memory architecture patterns**) nằm ở cuối mục này. Đội cấp nước ghi các quy ước đã chốt vào file `quy-uoc.md`, chẳng hạn mã khu vực giữ dạng chữ, cột "thất thoát" làm tròn hai chữ số. Session nào cũng đọc file này trước khi bắt đầu. Thay vì tự quản file như vậy, bạn có thể dùng một trong hai cơ chế memory Anthropic làm sẵn.

**Memory tool của Claude API** chạy phía client. Claude chỉ yêu cầu đọc hay ghi file trong thư mục `/memories`, còn ứng dụng của bạn tự thực hiện yêu cầu đó trên storage của mình. Vì vậy ứng dụng phải từ chối mọi đường dẫn trỏ ra ngoài `/memories`, để Claude không đụng được file khác.

**Memory store của Managed Agents** tồn tại độc lập và lâu hơn mọi session. Bạn gắn store vào session lúc tạo session, và nó hiện ra như một thư mục dưới `/mnt/memory/`; mỗi session gắn được tối đa 8 store. Mỗi lần sửa một memory tạo ra một version mới, và version đó không sửa được về sau. Khi cập nhật qua API, bạn gửi kèm precondition `content_sha256` (mã băm của nội dung bạn đã đọc). Nếu có ai ghi vào trước bạn, API từ chối thay vì ghi đè mất thay đổi của họ.

Vài cách chia memory store hay dùng:

- Quy ước và kiến thức nghiệp vụ để trong một store `read_only` (chỉ đọc), gắn vào nhiều session. Phải đặt `read_only` vì store mặc định là `read_write`, mà agent bị prompt injection thì có thể ghi nội dung độc vào đó (bài 7.2).
- Ghi chú riêng của từng session để trong một store `read_write` khác.
- Mỗi người dùng hay mỗi project dùng một store riêng.
- Trong store, chia thành nhiều file nhỏ, mỗi file một chủ đề. Mỗi memory tối đa 100 kB.

## Đổi version model mà không hỏng việc đang dở

Ngày thứ năm, lúc agent đang làm báo cáo 301, đội đổi sang một model khác ngay trong session đang chạy. Với sáu báo cáo tiếp theo, agent xử lý múi giờ khác hẳn trước nên số liệu bị lệch. Nguyên nhân là quyết định "chốt sổ theo giờ Việt Nam (UTC+7)" chưa từng được ghi vào `quy-uoc.md` hay file nào khác. Nó chỉ nằm trong phần thinking của model cũ, tức đoạn model tự suy luận trước khi trả lời.

Để hiểu vì sao quyết định đó mất, bạn cần nắm vài điều về model và version. Trên Claude API, mỗi model ID trỏ tới một bản model cố định (snapshot), kể cả những ID không kèm ngày, nên gọi cùng ID thì luôn là cùng một model. Alias trong Claude Code như `sonnet` thì khác: nó là tên gọi tắt chứ không phải ID cố định, nên bạn cần kiểm xem nó đang chạy model nào. Mỗi model đi qua bốn giai đoạn: active (đang dùng bình thường), legacy, deprecated (vẫn chạy nhưng đã có ngày ngừng) và retired (đã ngừng). Anthropic báo trước ít nhất 60 ngày trước khi ngừng một model công khai.

Khi đổi model giữa một hội thoại, cứ gửi nguyên cả hội thoại như cũ. Nếu model mới không đọc được thinking block của model cũ, API tự bỏ các block đó mà không báo lỗi, và model mới trả lời mà không biết model cũ đã suy luận gì. Đó chính là chuyện xảy ra với quyết định UTC+7. Dù vậy, đừng tự xoá thinking khỏi hội thoại, và cũng đừng tách hội thoại thành nhiều bản riêng cho từng model.

Managed Agents xử lý chuyện này ở cấp agent. Định nghĩa agent có version: mỗi lần sửa là một version mới. Khi tạo session, truyền agent ID dạng chuỗi thì session dùng version mới nhất lúc đó, còn muốn pin một version cụ thể thì truyền object có `version`. Sau khi session đã tạo, chỉ `tools` và `mcp_servers` đổi được; `model`, `system` và `skills` thì không. Muốn chạy model khác, bạn tạo session mới, có thể dùng `agent_with_overrides` để thay model mà không sửa định nghĩa agent.

Với công ty cấp nước, cách an toàn là đổi model ở ranh giới checkpoint. Trước hết đội ghi quy ước múi giờ vào `quy-uoc.md`, rồi thử model mới trên 20 báo cáo đã đạt và so kết quả với lần chạy cũ. Khớp rồi mới mở session mới trên model mới, nạp quy ước và tiến độ, làm tiếp từ báo cáo 302.

**Sơ đồ: UTC+7 chỉ nằm trong thinking thì mất khi đổi model, còn ghi vào quy-uoc.md trước thì giữ được**
- đổi ngay trong session
- API bỏ đi, không báo lỗi
- dừng ở ranh giới checkpoint
- khớp lần chạy cũ
- Đang làm báo cáo 301
- UTC+7 chỉ nằm trongthinking của model cũ
- 6 báo cáo tiếp theolệch múi giờ
- Ghi UTC+7vào quy-uoc.md
- Thử model mới trên20 báo cáo đã đạt
- Session mới, làm tiếptừ báo cáo 302

Khi đưa bản mới lên production, đừng cập nhật mọi agent đang chạy cùng một lúc. Cách an toàn là **rainbow deployment**: bản cũ và bản mới chạy song song, traffic chuyển dần sang bản mới, nên agent nào đang làm dở việc trên bản cũ vẫn làm xong được.

> **Ý chính**
>
> Mỗi loại trạng thái cần một chỗ lưu riêng nằm ngoài container. Quyết định quan trọng cũng phải được ghi ra file hay memory, đừng để nó chỉ nằm trong thinking của model.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Effective harnesses for long-running agents (Anthropic Engineering)](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
3. [How we built our multi-agent research system (Anthropic Engineering)](https://www.anthropic.com/research/multi-agent-research-system)
4. [Work with sessions (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/sessions)
5. [Persist sessions to external storage (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/session-storage)
6. [Rewind file changes with checkpointing (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/file-checkpointing)
7. [Hosting the Agent SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/hosting)
8. [Start a session (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/sessions)
9. [Session operations (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/session-operations)
10. [Session event stream (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/events-and-streaming)
11. [Define your agent (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/agent-setup)
12. [Using agent memory (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/memory)
13. [Memory tool (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
14. [Models overview (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/overview)
15. [Model deprecations (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
16. [Preserved thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/preserved-thinking)
17. [Agent SDK MCP (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/mcp)
