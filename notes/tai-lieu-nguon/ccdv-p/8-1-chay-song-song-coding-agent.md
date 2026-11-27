---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-1-chay-song-song-coding-agent
ngay_tai: 2026-11-27
tieu_de: Chạy song song nhiều coding agent - chia việc, worktree riêng, chiến lược merge và telemetry của cả nhóm agent
---

Domain 8: Agent Fleet Operations for Software Delivery · Task 8.1

# Chạy song song nhiều coding agent - chia việc, worktree riêng, chiến lược merge và telemetry của cả nhóm agent

Chạy nhiều coding agent song song cho một việc lớn, chia việc độc lập, mỗi agent một worktree, merge không giẫm nhau, và đọc telemetry để thấy lỗi chung.

- 20 phút đọc
- Đối chiếu docs 24/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Chọn giữa subagent, agent view, agent team, dynamic workflow và `/batch` theo việc ai giữ kế hoạch và các agent có sửa chung file không
- Chia một việc lớn thành những phần độc lập, làm phần dùng chung trước, và nhận ra việc nào chưa chia được
- Cho mỗi agent làm trong một git worktree riêng, biết worktree tách gì, dùng chung gì và rẽ nhánh từ đâu
- Đặt thứ tự merge và cách xử lý xung đột để nhánh nào cũng được kiểm lại trên main mới nhất
- Đọc telemetry theo từng agent và từng lần chạy để thấy những lỗi mà nhìn một agent riêng lẻ không thấy

Tên task trong đề là **Parallel Agent Orchestration for Engineering Work**. Nó gồm việc đánh giá các cách chạy song song nhiều agent (**parallel fan-out patterns**) cho một việc kỹ thuật lớn. Các ý bên trong là cho mỗi agent làm trong một worktree riêng, chia việc, chọn cách merge và xử lý xung đột, và đọc telemetry của cả nhóm agent để tìm lỗi chung. Mỗi ý có chữ tiếng Anh của đề ở mục tương ứng bên dưới.

Một agent sửa 400 file thì chạy chậm và context đầy rất nhanh. Hai mươi agent cùng sửa thì xong sớm hơn, nhưng lại sinh ra những lỗi mà một agent không bao giờ gặp. Hai agent sửa cùng một file. Cả nhóm agent kẹt ở cùng một bug. Một nhánh merge xong thì làm vỡ nhánh khác. Vì vậy cái khó của chạy song song không nằm ở chỗ bật nhiều agent. Nó nằm ở bốn việc khác: chia việc để các agent không đụng nhau, cho mỗi agent làm trên một bản sao riêng của repo, gộp kết quả lại, và nhìn được cả nhóm agent đang chạy ra sao.

Bài này không nhắc lại giới hạn số subagent và cách viết prompt giao việc (xem bài 1.1), chế độ headless và permission mode của Claude Code (xem bài 3.1 của CCDV-F), hay cách phân tích nhiều trace cùng lúc (xem bài 3.3).

**Sơ đồ: Bật nhiều agent thì dễ, cái khó là bốn việc chia, tách, gộp và đọc telemetry**
_Bản đồ bài. Chọn cách chạy song song, rồi bốn việc khó là chia việc, worktree riêng, merge có thứ tự và đọc telemetry cả nhóm, mỗi việc kèm lỗi điển hình và cách sửa_

- **Chọn cách chạy**: subagent, agent view, agent team, dynamic workflow, /batch
- **LỖI ĐIỂN HÌNH**
- **CÁCH SỬA TRONG BÀI**
- 1. **Chia việc**: task decomposition
- **Agent sửa chung file**: mỗi agent một bản hàm
- **Làm phần chung trước**: mỗi agent một tập file
- 2. **Worktree riêng**: isolated worktrees
- **Agent không thấy hàm**: rẽ nhánh từ origin/main
- **Phần nền lên main**: trước khi tung agent ra
- 3. **Merge có thứ tự**: merge strategy
- **Gộp vào là vỡ main**: dù từng nhánh qua test
- **Merge phần nền trước**: kiểm lại trên main mới
- 4. **Đọc telemetry**: fleet telemetry
- **Cả nhóm kẹt một lỗi**: báo xong mà chưa commit
- **Gộp theo agent_id**: kiểm commit bằng script

## Ví dụ xuyên suốt: chuyển 380 route handler của phần mềm bán vé xe khách

Một công ty làm phần mềm bán vé cho 40 nhà xe khách liên tỉnh có một monorepo TypeScript với 380 route handler. Handler nào cũng gọi database qua một lớp truy cập cũ viết theo kiểu callback. Đội 6 kỹ sư của công ty, gọi tắt là đội, cần chuyển hết sang một lớp truy vấn mới có khai báo kiểu TypeScript đầy đủ (typed query layer) trước khi nâng Node lên version mới.

Đội dùng dynamic workflow của Claude Code, tức một script điều phối nhiều subagent. Script giao việc cho từng agent theo kiểu subagent có `isolation: worktree`, nên mỗi agent làm trong một git worktree riêng, là một thư mục làm việc tách biệt của cùng repo, rồi mở một pull request. Từ trước đó, Claude Code ở công ty đã được cấu hình gửi telemetry, tức dữ liệu theo dõi như chi phí, lệnh gọi tool và commit, theo chuẩn OpenTelemetry về collector của công ty. Collector là máy chủ gom dữ liệu này. Phần cuối bài sẽ dùng tới nó.

## Chọn cách chạy song song

Với một việc kỹ thuật lớn, Claude Code có năm cách chạy song song là subagent, agent view, agent team, dynamic workflow và `/batch`. (Còn một tính năng nữa là projects, nhưng nó dành cho chuỗi việc kéo dài nhiều ngày trên cloud nên bài này không xét.) Riêng `/batch` không phải một kiểu điều phối riêng mà là skill đóng gói sẵn subagent và worktree, nhưng vẫn nên đặt cạnh bốn cách kia để so sánh. Năm cách này khác nhau ở chỗ ai quyết bước tiếp theo, chạy được bao nhiêu agent, và file của các agent có được tách riêng không.

| Cách | Ai quyết bước tiếp theo | Quy mô phù hợp | Có tách file của từng agent không |
| --- | --- | --- | --- |
| Subagent | Claude tự quyết ở mỗi lượt | Vài việc phụ mỗi lượt | Có, nếu đặt `isolation: worktree` |
| Agent view (`claude agents`) | Bạn giao từng việc, quay lại xem khi có kết quả | Vài việc độc lập | Có, background session tự vào worktree trước khi sửa file |
| Agent team (thử nghiệm, mặc định tắt) | Một agent lead điều phối, các teammate nhắn tin cho nhau và dùng chung một danh sách task | Nên bắt đầu với 3–5 teammate | Không. Bạn phải chia sao cho mỗi teammate giữ một tập file riêng |
| Dynamic workflow | Một script JavaScript do Claude viết, bạn đọc được và chạy lại được | Hàng chục tới hàng trăm agent mỗi lần chạy | Chỉ khi prompt hoặc script yêu cầu mỗi agent làm trên bản sao riêng |
| `/batch` | Một skill có sẵn chia việc thành 5–30 phần rồi chờ bạn duyệt kế hoạch | 5–30 phần | Có, mỗi phần là một background subagent trong worktree riêng và mở một PR |

Việc của đội chia ra khoảng 24 phần, nên `/batch` cũng làm được. Đội vẫn chọn dynamic workflow vì ba lý do. Kế hoạch nằm trong code, nên handler nào cũng được xử lý theo đúng một cách. Bước kiểm lần nào cũng chạy, vì script gọi nó chứ không phụ thuộc vào việc Claude có nhớ hay không. Kết quả trung gian thì nằm trong biến của script, không chiếm context của Claude.

Mặc định, dynamic workflow cho tối đa 16 agent chạy cùng lúc (ít hơn nếu máy ít CPU) và tối đa 1.000 agent mỗi lần chạy. Khi một lần chạy dùng quá 25 agent hoặc dự kiến tốn quá 1,5 triệu token, Claude Code hiện cảnh báo `Large workflow`. Cảnh báo này không dừng lần chạy, nên muốn biết trước chi phí thì bạn nên chạy thử trên một thư mục.

## Chia việc thành những phần độc lập

Kế hoạch đầu tiên chia theo số file: 24 agent, mỗi agent khoảng 16 handler. Vấn đề là lớp truy vấn mới chưa có hàm chạy transaction giữ ghế, tức giữ chỗ tạm 10 phút trong lúc khách thanh toán. Thêm nữa, mọi kiểu dữ liệu dùng chung đều nằm trong một file là `src/types/api.ts`. Agent nào gặp handler giữ ghế cũng tự viết thêm một hàm transaction vào lớp truy vấn và sửa `api.ts`. Một giờ sau, đến lúc merge thì 19 trên 24 nhánh bị xung đột ở đúng hai file đó, và có tới 7 bản khác nhau của cùng một hàm giữ ghế.

Muốn chia việc (**task decomposition**) cho nhiều agent, mỗi phần việc cần thoả ba điều kiện.

- **Giữ một tập file riêng.** Hai agent sửa cùng một file thì bên sau ghi đè bên trước, hoặc để lại xung đột. Những file mà phần nào cũng phải đụng tới, như file kiểu dùng chung, file đăng ký route hay lockfile, thì không giao cho agent nào sửa.
- **Kiểm được riêng.** Mỗi phần phải có test chạy riêng được. Nếu chỉ kiểm được khi đã gộp đủ mọi phần thì agent không có cách nào biết lúc nào mình làm xong.
- **Vừa cỡ.** Phần quá nhỏ thì công điều phối còn tốn hơn thời gian tiết kiệm được. Phần quá lớn thì agent chạy rất lâu mà giữa chừng không ai kiểm. Với agent team, nên giao mỗi teammate khoảng 5–6 task, để khi một teammate bị kẹt, agent lead còn chuyển bớt task cho teammate khác.

Ba điều kiện trên vẫn chưa đủ khi có phần việc mà agent nào cũng cần. Phần đó phải làm trước, và chỉ một agent làm. Đội tách việc thành hai pha. Ở pha 1, một agent viết hàm giữ ghế và các kiểu mới trong `api.ts`, chạy test, và thay đổi này phải lên main trước khi pha 2 bắt đầu. Ở pha 2, workflow mới tung ra 24 agent, mỗi agent nhận một nhóm handler theo module (đặt vé, hoàn vé, nhà xe, báo cáo). Không agent nào được sửa lớp truy vấn hay `api.ts`. Nếu agent thấy lớp chung còn thiếu gì, nó ghi vào một danh sách yêu cầu chung để kỹ sư xử lý sau, chứ không tự sửa.

**Sơ đồ: Chia theo số file thì 19 trên 24 nhánh xung đột, làm phần dùng chung trước thì còn 2**

✗ _Chia theo số file_
1. 24 agent, mỗi agent khoảng 16 handler
2. Agent gặp handler giữ ghế tự viết hàm transaction giữ ghế và sửa api.ts
   ↓ _merge sau một giờ_
3. **19/24 nhánh** xung đột ở lớp truy vấn và api.ts, có 7 bản của cùng một hàm

✓ _Làm phần dùng chung trước_
1. Pha 1, một agent viết hàm giữ ghế và kiểu mới, lên main trước
2. Pha 2, 24 agent theo module, cấm sửa lớp truy vấn và api.ts
   ↓ _merge lần lượt từng nhánh_
3. **2 nhánh** xung đột, đều ở file fixture mà nhiều module dùng chung

Có những việc nhìn thì không chia được, vì agent nào cũng vướng cùng một lỗi. Gặp loại việc này, bạn phải tìm cách tách lỗi ra trước khi giao cho nhiều agent. Anthropic từng gặp đúng chuyện này khi thử cho 16 agent cùng viết một trình biên dịch C. Lúc test suite còn nhiều test đỏ không liên quan nhau, mỗi agent nhận một test là chạy song song được ngay. Tới bước biên dịch Linux kernel thì chỉ còn một bài kiểm duy nhất là kernel có build được hay không. Agent nào cũng gặp cùng một bug, sửa nó, rồi ghi đè bản sửa của nhau, nên thêm agent cũng không giúp gì.

Cách gỡ là lấy GCC, một trình biên dịch C đã chạy đúng, làm mốc so sánh. Phần lớn kernel vẫn biên dịch bằng GCC, chỉ một nhóm file chọn ngẫu nhiên được biên dịch bằng trình biên dịch của Claude. Nếu kernel hỏng thì lỗi nằm trong nhóm file đó, nên mỗi agent nhận một nhóm khác nhau và đuổi một bug khác nhau.

## Cho mỗi agent một worktree riêng

Git worktree là một thư mục làm việc riêng, có file và nhánh riêng, nhưng dùng chung lịch sử và remote với bản checkout chính. Khi mỗi agent làm trong một worktree riêng (**parallel agents on isolated worktrees**), các agent chạy song song không sửa vào file của nhau. Có ba cách bật. Với session bạn tự chạy, dùng `claude --worktree <tên>`. Với subagent, đặt `isolation: worktree` trong frontmatter. Còn background session tạo từ agent view thì tự vào worktree trước khi sửa file.

Khi chạy trong worktree, session và mọi subagent của nó không được sửa file hay chạy lệnh Bash nhắm vào bản checkout chính, và cũng không được trỏ git vào đó bằng `git -C` hay `GIT_DIR`. Có điều Claude Code chỉ chặn bằng cách xem đường dẫn và nội dung chữ của lệnh. Một lệnh `cp`, hay một lệnh chuyển hướng output (`>`) ghi vào bản checkout chính, vẫn có thể lọt qua. Muốn chặn chắc chắn, bạn phải dựa vào sandbox và cấu hình permission.

Worktree tách file và nhánh, nhưng vẫn dùng chung hai thứ với bản checkout chính.

- **Thư mục `.git`.** Commit trong worktree ghi vào repository chung.
- **Permission đã duyệt.** Khi bạn chọn "Yes, and don't ask again" cho một lệnh Bash trong worktree, rule đó được lưu vào `.claude/settings.local.json` của bản checkout chính. Vì vậy rule áp cho mọi worktree của repo và vẫn còn sau khi worktree bị xoá. Trên Windows và một vài trường hợp khác thì không như vậy.

Trước khi chạy đủ pha 2, đội chạy thử 3 agent trên module hoàn vé, và cả ba báo không tìm thấy hàm giữ ghế. Hoá ra đội quên đưa pha 1 lên main. Hàm đã được commit, nhưng chỉ nằm ở nhánh local của kỹ sư chạy workflow và chưa push lên. Khi chưa cấu hình gì (`worktree.baseRef` là `"fresh"`), worktree rẽ nhánh từ nhánh chính trên remote, chẳng hạn `origin/main`. Vì thế không agent nào thấy commit đó, và một agent bắt đầu tự viết lại hàm. Đội merge pha 1 lên main rồi chạy thử lại. Đặt `worktree.baseRef` là `"head"` để rẽ nhánh từ `HEAD` local cũng chữa được, nhưng khi đó nhánh của mọi agent sẽ mang theo một commit chưa ai review.

**Sơ đồ: Worktree tách file và nhánh, dùng chung .git và permission, mặc định rẽ từ origin/main**
_Ba agent chạy thử mỗi agent một worktree có file và nhánh riêng, cùng ghi commit vào .git chung và cùng dùng rule permission trong settings.local.json. baseRef fresh rẽ từ origin/main nên không thấy hàm giữ ghế chưa push, baseRef head thấy hàm nhưng mang commit chưa review_

- **TÁCH RIÊNG**: 3 agent chạy thử trên module hoàn vé
- **Agent hoàn vé 1**: file, nhánh riêng
- **Agent hoàn vé 2**: file, nhánh riêng
- **Agent hoàn vé 3**: file, nhánh riêng
- commit
- Yes, and don't ask again
- **DÙNG CHUNG**: với bản checkout chính
- **.git**: commit ghi vào repo chung
- **settings.local.json**: rule áp mọi worktree của repo
- **WORKTREE RẼ NHÁNH TỪ ĐÂU**: worktree.baseRef
- origin/main
- HEAD local
- hàm giữ ghế, chưa push
- **fresh (mặc định)**: không thấy hàm giữ ghế
- **head**: mang commit chưa review
- **Cách đội sửa**: merge pha 1
- lên main rồi
- chạy thử lại

Khi chạy nhiều worktree, còn ba chuyện cần để ý. Thứ nhất, worktree là một bản checkout mới, nên những file mà git bỏ qua (nằm trong `.gitignore`), như `.env.test` hay cấu hình local, sẽ không có sẵn. Bạn liệt kê các file đó trong `.worktreeinclude`, và Claude Code sẽ chép chúng vào mỗi worktree nó tạo. Các bước dựng môi trường, như cài thư viện, cũng phải chạy lại trong từng worktree.

Thứ hai, worktree chỉ tách những gì nằm trong thư mục. Các agent vẫn chạy chung một máy, nên database hay port mạng thì vẫn dùng chung. Nếu integration test bật database ở một port cố định, hai agent chạy test cùng lúc sẽ tranh nhau port đó. Muốn chạy test song song được, bạn cho mỗi worktree một port riêng, chẳng hạn đặt trong biến môi trường của từng worktree.

Thứ ba, khi chạy không tương tác bằng `claude -p --worktree`, Claude Code không tự dọn worktree. Session tương tác thì hỏi bạn giữ hay xoá worktree lúc thoát, còn chế độ `-p` không có bước đó, nên worktree nằm lại trên đĩa. Worktree đó còn bị khoá bằng `git worktree lock`, và khoá chỉ được gỡ khi một session sau chạy bước dọn khoá cũ. Vì vậy pipeline chạy hàng trăm agent theo cách này phải tự gọi `git worktree remove`, và gọi `git worktree unlock` trước nếu git từ chối vì worktree đang bị khoá.

## Merge và xử lý xung đột

Chiến lược merge (**merge and conflict strategy**) quyết định gộp các nhánh theo thứ tự nào và ai sửa xung đột. Có năm nguyên tắc.

- **Merge phần nền trước, phần lẻ sau.** Thay đổi mà nhánh khác dựa vào, như lớp chung hay kiểu dữ liệu, phải merge trước. Các nhánh nhỏ không ai phụ thuộc vào thì merge sau, theo thứ tự nào cũng được.
- **Kiểm lại trên main mới nhất.** Hai nhánh cùng qua test riêng vẫn có thể làm vỡ main khi gộp vào nhau. Merge queue là hàng đợi merge, nó áp thay đổi lên main mới nhất rồi chạy lại mọi check trước khi cho merge. Nếu repo không có merge queue, bạn rebase nhánh lên main mới rồi chạy lại test.
- **Coi bản giải xung đột là một thay đổi mới.** Code mà agent viết ra khi giải xung đột chưa ai review. Nhánh đó phải qua lại test và review, và approval cũ không còn giá trị cho commit mới.
- **Với file sinh tự động, chạy lại lệnh sinh thay vì gộp tay.** Đây là cách làm phổ biến chứ không phải tính năng của Claude Code. Với lockfile hay code sinh từ schema, bạn lấy bản trên main rồi chạy lại lệnh sinh.
- **Thiết kế để khỏi xung đột.** Nếu agent nào cũng phải thêm một dòng vào file đăng ký route, hãy để script tự sinh file đó bằng cách quét thư mục handler, hoặc giao cho một agent riêng sửa file này một lần ở bước cuối.

Thử nghiệm trình biên dịch C cũng cho thấy một cách chia việc mà không cần người điều phối. Mỗi agent nhận việc bằng cách ghi một file khoá vào `current_tasks/` rồi push lên. Nếu hai agent cùng khoá một việc, git từ chối lần push sau, nên agent đó phải chọn việc khác. Làm xong, agent pull, merge, push rồi gỡ khoá. Về cuối dự án, tính năng mới hay làm vỡ chức năng cũ, nên người chạy thử nghiệm thêm CI để chặn những commit làm hỏng phần đang chạy được.

Cách merge cũng phải đổi theo khối lượng. Khi monorepo của Anthropic lên tới hơn 30.000 thay đổi được merge mỗi ngày, các kỹ sư Anthropic không giữ được khoá chung cho cả repo mà merge queue cần. Họ chuyển sang chạy test sau khi merge và trước khi deploy. Cách này có lúc để lọt xung đột, nhưng Claude thường sửa xong trước khi người kịp nhận ra.

> **Bẫy đề**
>
> 19 trên 24 nhánh xung đột ở lớp truy vấn và `api.ts`, mỗi agent một bản hàm giữ ghế. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Tăng lên 48 agent cho xong sớm** (_add more parallel agents_). Xung đột đến từ cách chia việc chứ không đến từ số agent. Thêm agent chỉ sinh thêm nhiều bản của cùng một hàm.
> - **Để mỗi agent tự giải xung đột rồi merge luôn** (_let each agent resolve its own conflicts_). Cách này trông như tự động hoá trọn vẹn. Thực tế mỗi agent giải theo bản hàm giữ ghế của mình, nên main sẽ nhận lần lượt nhiều bản khác nhau, và code sau khi giải chưa ai kiểm.
> - **Chuyển sang agent team để các teammate nhắn nhau tránh đụng file** (_switch to an agent team with messaging_). Agent team không cho mỗi teammate một worktree riêng. Hai teammate sửa cùng file thì ghi đè nhau ngay, và tin nhắn không thay được việc chia file.
>
> **Chọn:** dừng chạy song song, làm hàm giữ ghế và kiểu mới thành một thay đổi riêng rồi merge trước, sau đó chạy lại 24 agent theo module và cấm sửa file dùng chung.

> **Trong đề chọn gì**
>
> Gặp tình huống nhiều agent song song bị xung đột hoặc cùng kẹt ở một chỗ, hãy nghi bước chia việc trước, đừng vội chọn đáp án thêm agent hay thêm cơ chế phối hợp. Cách sửa thường là làm phần dùng chung trước, giao mỗi agent một tập file riêng, và tách lỗi chung ra.

## Đọc telemetry của cả nhóm agent

Có những lỗi chỉ lộ ra khi nhìn cả nhóm agent (**fleet-level failure modes**), và bạn chỉ thấy chúng khi gộp telemetry của nhiều agent lại (**fleet telemetry**). Một agent tốn chi phí gấp năm lần mức trung vị của cả nhóm thì có thể chỉ vì nó gặp handler khó. Nhưng nếu năm agent cùng như vậy và cùng làm một module, gần như chắc chắn có một nguyên nhân chung.

Telemetry của Claude Code có hai loại. Event là bản ghi của từng việc riêng lẻ, còn metric là con số cộng dồn theo thời gian. Muốn gộp theo từng agent, bạn đọc event.

- **Event mang danh tính agent.** Event của subagent có `agent_id`. Nếu subagent đó do một subagent khác tạo ra chứ không phải session chính, event còn có `parent_agent_id` chỉ tới agent cha. Agent trong dynamic workflow có thêm `workflow.run_id`, nên khi lọc theo một `workflow.run_id`, bạn xem lại được mọi request API và kết quả tool của lần chạy đó.
- **Metric không có `agent_id`.** Mỗi giá trị `agent_id` sẽ tạo thêm một chuỗi số liệu riêng, nên với hàng trăm agent thì số chuỗi tăng không giới hạn. Metric như `claude_code.cost.usage` hay `claude_code.commit.count` dùng để xem tổng theo repository (bật `OTEL_METRICS_INCLUDE_REPOSITORY`) hoặc theo đội qua `OTEL_RESOURCE_ATTRIBUTES`.
- **Chi phí và commit theo agent.** Event `api_request` có `cost_usd` và `duration_ms`. Khi bật `OTEL_LOG_TOOL_DETAILS=1`, event `tool_result` của một lệnh `git commit` thành công có SHA và tên nhánh. Đường dẫn file mà tool Edit hay Write sửa thì không nằm ở event, mà ở span của tool trong phần trace (đang beta, phải bật thêm `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`). Lưu ý là cờ này cũng đưa nguyên văn lệnh và tham số tool vào event, nên bạn chỉ nên gửi dữ liệu này tới collector được phép lưu loại thông tin đó.
- **Subagent xong việc** thì phát event `subagent_completed`, có `duration_ms`, `total_tool_uses` và `model_swapped` (model bị đổi giữa chừng, chẳng hạn do fallback).

| Dấu hiệu khi gộp theo agent | Lỗi chung của cả nhóm | Cách sửa |
| --- | --- | --- |
| Nhiều agent sửa cùng một đường dẫn file (thấy qua span của tool hoặc diff của các nhánh) | Các phần việc chồng lên nhau | Chia lại theo tập file |
| Một nhóm agent có chi phí và số lệnh gọi tool gấp nhiều lần trung vị, cùng làm một module | Cùng kẹt ở một lỗi, hay một flaky test (test lúc qua lúc đỏ dù code không đổi) | Sửa hoặc cách ly lỗi chung, rồi chạy lại riêng nhóm đó |
| Agent báo xong nhưng không có commit nào | Tiêu chí xong chỉ là lời agent tự nói | Dùng script kiểm kết quả: có commit, có output test |

Quay lại với đội. Sau khi merge pha 1, đội chạy thử lại 3 agent trên module hoàn vé, và từ chi phí lần đó ước tính cả pha 2 sẽ tốn khoảng 90 USD. Khi chạy đủ 24 agent, workflow báo cả 24 đều xong. Nhưng cộng `cost_usd` của lần chạy thì được 310 USD, và chỉ 18 nhánh có commit. Gộp theo `agent_id`, đội thấy 5 agent chiếm tới 220 trong 310 USD.

**Sơ đồ: Ước 90 USD mà tốn 310, gộp theo agent_id mới thấy 5 agent chiếm 220 USD**

Năm agent tốn kém nhất đều làm module có test tích hợp với hàng đợi giữ ghế, tức hàng đợi xử lý các yêu cầu giữ chỗ tạm trong lúc khách thanh toán. Mỗi agent gọi tool hơn 400 lần, trong khi trung vị là 60. Nguyên nhân là test đó là flaky test. Agent chạy test, thấy đỏ, sửa code, chạy lại, rồi cứ lặp như vậy rất lâu. Cuối cùng chúng vẫn commit bản chuyển handler, nhưng tốn gấp nhiều lần bình thường.

Sáu agent không có commit lại là một nhóm khác. Chúng chạy trong worktree thiếu `.env.test`, nên test không kết nối được database. Dù vậy, agent vẫn kết thúc bằng câu tóm tắt "đã chuyển xong, test cần môi trường" mà chưa commit dòng nào.

Đội cách ly flaky test đó, thêm `.env.test` vào `.worktreeinclude`, rồi chạy lại 11 agent, gồm 5 agent tốn kém và 6 agent không có commit. Từ đó, tiêu chí xong của mỗi agent là có commit và có output test của module. Script của workflow kiểm tiêu chí này, chứ không dựa vào câu tóm tắt của agent. Đội cũng dựng một dashboard lọc theo `workflow.run_id`, hiện chi phí và số lệnh gọi tool của từng agent, và báo động khi agent nào vượt ba lần mức trung vị. Khi 11 agent chạy lại xong và các nhánh lần lượt được merge, chỉ còn 2 nhánh xung đột, đều ở file fixture (dữ liệu mẫu cho test) mà nhiều module dùng chung.

> **Ý chính**
>
> Chọn cách chạy song song theo việc ai giữ kế hoạch và các agent có sửa chung file không. Mọi lỗi xung đột đều quay về bước chia việc, nên phần dùng chung phải làm trước và merge trước. Cho mỗi agent một worktree riêng, và nhớ rằng nếu không cấu hình gì thì worktree rẽ nhánh từ nhánh chính trên remote. Nhánh nào cũng phải kiểm lại trên main mới nhất, và bản giải xung đột là một thay đổi mới cần review. Gộp event theo `agent_id` và `workflow.run_id` để thấy lỗi chung, vì metric không có `agent_id`.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 8](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Run agents in parallel (Claude Code Docs)](https://code.claude.com/docs/en/agents)
3. [Orchestrate subagents at scale with dynamic workflows (Claude Code Docs)](https://code.claude.com/docs/en/workflows)
4. [Run parallel sessions with worktrees (Claude Code Docs)](https://code.claude.com/docs/en/worktrees)
5. [Orchestrate teams of Claude Code sessions (Claude Code Docs)](https://code.claude.com/docs/en/agent-teams)
6. [Commands, /batch (Claude Code Docs)](https://code.claude.com/docs/en/commands)
7. [Monitoring (Claude Code Docs)](https://code.claude.com/docs/en/monitoring-usage)
8. [Building a C compiler with a team of parallel Claudes (Anthropic Engineering)](https://www.anthropic.com/research/building-c-compiler)
9. [Redesigning source control for agent scale (Anthropic Engineering)](https://www.anthropic.com/research/redesigning-source-control)
10. [How the Claude Code team does code review (claude.dev)](https://claude.dev/blog/solving-code-review-at-anthropic/)
