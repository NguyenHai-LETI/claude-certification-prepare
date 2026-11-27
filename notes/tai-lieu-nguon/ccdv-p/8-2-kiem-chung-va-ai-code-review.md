---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-2-kiem-chung-va-ai-code-review
ngay_tai: 2026-11-27
tieu_de: Kiểm chứng và vận hành AI code review - shadow mode, hiệu chỉnh với review của người, cổng merge và thiết kế giám sát
---

Domain 8: Agent Fleet Operations for Software Delivery · Task 8.2

# Kiểm chứng và vận hành AI code review - shadow mode, hiệu chỉnh với review của người, cổng merge và thiết kế giám sát

Khi agent sinh code nhanh hơn người review, bắt agent kiểm chứng trước khi mở PR, chạy AI review ở shadow mode, đo với người rồi mới cho chặn merge.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Nhận ra lúc review của người thành nút thắt, và chia việc kiểm thành nhiều lớp, giữ người cho những thay đổi có rủi ro
- Bắt agent đưa bằng chứng kiểm chứng trước khi mở pull request
- Đưa AI code review vào ở shadow mode và hiểu vì sao Code Review không tự duyệt hay chặn pull request
- Hiệu chỉnh AI reviewer với review của người và với các sự cố cũ trước khi cho nó chặn merge
- Thiết kế phần người duyệt theo mức rủi ro, có giới hạn số vòng review và approval gắn với từng commit

Tên task trong đề là **Verification and AI Code Review Operations**. Nó gồm việc phân tích cách vận hành khâu kiểm chứng trong pipeline phát hành (**delivery pipelines**) khi tốc độ sinh code vượt tốc độ review (**generation outpaces review**). Các ý bên trong là đưa AI code review vào ở shadow mode, hiệu chỉnh nó với review của người trước khi cho nó chặn merge, và thiết kế phần giám sát của con người. Mỗi ý có chữ tiếng Anh của đề ở mục tương ứng bên dưới.

Khi agent viết phần lớn code, số pull request (PR) tăng nhanh hơn hẳn số giờ mà người trong đội có thể bỏ ra để đọc. Nếu vẫn giữ quy tắc "PR nào cũng phải có một người đọc từng dòng", PR sẽ phải chờ lâu hơn, còn người duyệt vì quá tải sẽ lướt qua rồi bấm duyệt cho xong. Lúc này, kiểm chứng (**verification**) không còn là hỏi "đã có ai đọc code chưa". Câu hỏi đúng là thay đổi này có thể hỏng ở đâu, và check nào, do máy hay do người làm, bắt được đúng chỗ hỏng đó.

Bài này đi qua bốn câu hỏi. Agent phải chứng minh gì trước khi mở PR? Nên đưa AI reviewer, tức Claude đọc PR và để lại nhận xét, vào thế nào để nó không chặn nhầm PR tốt? Phải đo nó với review của người ra sao trước khi cho nó quyền chặn merge, tức chặn không cho PR được gộp vào nhánh chính? Và thay đổi nào vẫn cần người duyệt?

**Sơ đồ: Sinh code nhanh hơn review thì xếp lớp kiểm, và AI review chỉ được chặn merge sau khi đo**
_Bản đồ bài. Hàng trên là đường đi của mỗi pull request: agent kiểm chứng trước khi mở PR, đưa lệnh và output làm bằng chứng, rồi PR đi qua các lớp kiểm gồm CI, AI review và security review, rồi tới người duyệt chia theo tầng rủi ro thấp, vừa, cao. Hàng dưới là ba giai đoạn đưa AI review vào: một, shadow mode chỉ đăng comment, chưa chặn PR nào; hai, calibration đo với người duyệt, bộ sự cố cũ và PR sạch; ba, merge gating, job CI chặn khi còn finding Important. Lớp AI review chỉ được chặn merge khi đã đi hết ba giai đoạn._

- **MỖI PULL REQUEST ĐI QUA NHIỀU LỚP KIỂM**
- **Verification**: agent đưa lệnh, output
- trước khi mở PR
- **Các lớp kiểm**: CI, AI review,
- security review
- **Human oversight**: người duyệt theo tầng
- rủi ro thấp, vừa, cao
- Lớp AI review chỉ được chặn merge khi đã đi hết ba giai đoạn
- **ĐƯA AI REVIEW VÀO THEO BA GIAI ĐOẠN**
- **Shadow mode**: chỉ đăng comment,
- chưa chặn PR nào
- 1. **Calibration**: đo với người duyệt,
- sự cố cũ, PR sạch
- 2. **Merge gating**: job CI chặn khi còn
- finding Important
- 3.

Một số phần liên quan đã có bài riêng. Cách cho một session độc lập review code nằm ở bài 4.6 của CCAR-F. Cách chạy Claude Code trong CI nằm ở bài 3.6 của CCAR-F. Các chỉ số đo mức đồng thuận khi hiệu chỉnh một model chấm điểm (judge) nằm ở bài 5.2.

## Ví dụ xuyên suốt: phần mềm quản lý cho 600 khách sạn

Một công ty làm phần mềm quản lý khách sạn cho 600 khách sạn, gồm đặt phòng, nhận và trả phòng, tính tiền, và đồng bộ giá với các kênh bán phòng. Đội 35 kỹ sư của công ty, gọi là đội khách sạn, dùng Claude Code hằng ngày, phần lớn chạy nhiều agent song song. Code nằm trên GitHub. Đội đã có merge queue, tức hàng đợi chạy lại check trước khi gộp từng PR, và feature flag, tức công tắc bật tắt tính năng mới mà không cần deploy lại. Ngoài CI, mỗi PR còn qua một bước security review riêng, tức review chỉ tìm lỗ hổng bảo mật.

Công ty dùng gói Team, nên được dùng Code Review. Đây là dịch vụ của Anthropic tự review pull request trên GitHub, khác với lệnh `/code-review` chạy trong session mà bài nói ở phần sau. Hai repo rủi ro nhất là `billing` (tính tiền, hoàn tiền) và `booking` (giữ phòng, chống đặt trùng). Repo `booking` có thư mục `channel-sync/` chứa code client sinh tự động để đồng bộ với các kênh bán phòng. Ngoài ra còn một repo web cho giao diện khách sạn.

## Khi sinh code nhanh hơn người review

Trong sáu tháng, số PR mỗi tuần tăng từ 160 lên 540. Thời gian chờ review trung vị lên 31 giờ, và 38% PR được duyệt trong chưa tới hai phút sau khi người duyệt mở ra. Một PR do agent viết cũng được duyệt vội như thế. Sau khi lên production, code trong đó tính phí trả phòng muộn hai lần cho khách ở 14 khách sạn.

Anthropic gặp tình trạng này sớm. Khi phần lớn kỹ sư chạy nhiều agent cùng lúc, cả đội chỉ đi nhanh bằng tốc độ người review. Cách làm là xếp nhiều lớp kiểm tra nối tiếp nhau, mỗi lớp chuyên bắt một kiểu lỗi, và chỉ để người làm những việc mà máy chưa làm được.

Nếu một lỗi vẫn lọt qua mọi lớp, đội gỡ được nhanh. Code mới nằm sau feature flag nên tắt được mà không cần deploy lại, tính năng mới cho người trong công ty dùng trước rồi mới phát hành dần theo từng đợt, và rollback chỉ cần một bước.

Đội khách sạn đo hiệu quả bằng thời gian người phải bỏ ra, cụ thể là số approval trên mỗi PR và thời gian PR nằm chờ người duyệt. Song song, đội theo dõi tỉ lệ PR phải revert và số sự cố để làm ngưỡng an toàn. Nếu hai con số này tăng thì thời gian không hề được tiết kiệm, mà chỉ bị dời sang lúc sửa lỗi.

Đội làm ra Claude Code, gọi tắt là đội Claude Code, cũng đi theo hướng này. Từ tháng 6 đến tháng 9, số PR merge vào codebase của Claude Code tăng hơn gấp đôi, trong khi tỉ lệ phải revert giảm hơn 40%.

## Kiểm chứng trước khi mở pull request

Phần lớn việc kiểm tra nên làm xong trước khi mở PR, lúc sửa lỗi còn rẻ.

Trước hết, hãy đòi bằng chứng chứ đừng nhận lời hứa. Một câu "tất cả test đều qua" từ agent gần như không chứng minh được gì. Bắt agent đưa ra lệnh nó đã chạy kèm output, hoặc ảnh chụp màn hình. Với session chạy một mình không ai theo dõi, lệnh và output đó là bằng chứng duy nhất bạn có.

Thứ hai, dùng tính năng của Claude Code để ép, đừng chỉ dặn trong prompt. Nếu chỉ dặn "chạy test rồi mới xong", Claude vẫn tự quyết khi nào là đủ. Claude Code có hai cách ép. Lệnh `/goal` đặt một điều kiện hoàn thành, và sau mỗi lượt (một lần Claude làm việc rồi trả lời), một model riêng kiểm xem điều kiện đó đã đạt chưa. Hook `Stop` thì chạy script của bạn mỗi lần Claude định kết thúc lượt. Nếu script thoát với mã 2, Claude phải làm tiếp.

Thứ ba, cho một reviewer chưa biết gì về quá trình viết code đọc lại. Lệnh `/code-review` chạy ngay trong session của bạn và mở một subagent mới để đọc diff. Subagent này không thấy những lập luận Claude đã dùng khi viết code, nên không bị chúng dẫn dắt. Nên dặn reviewer bỏ qua chuyện style, vì một reviewer được giao đi tìm lỗi thì kiểu gì cũng cố tìm ra thứ gì đó để báo.

Thứ tư, chạy check rẻ trước. Agent chạy test, build và linter ngay trước khi mở PR, để những lỗi nó tự bắt được không chiếm thời gian CI và thời gian review của cả đội.

Cuối cùng, sửa mãi không qua thì agent phải gọi người. Đội Claude Code cho Claude tự sửa check đỏ, nhưng sau ba vòng vẫn đỏ thì Claude dừng lại và gọi người.

Đội Claude Code còn ghi vào mỗi commit cách commit đó đã được kiểm tra, kể cả ghi "none" khi chưa kiểm gì, để sau này tra ra được những commit chưa ai kiểm. Họ cũng đặt một cổng kiểm trước mỗi commit. Nếu session chưa chạy `/code-review` hay `/verify` thì cổng không cho commit. Cổng này có ba chế độ. Tắt là không làm gì. Quan sát là chỉ ghi lại những commit lẽ ra đã bị chặn. Ép là chặn thật. Cổng mới nào cũng bắt đầu ở chế độ quan sát, để đội rà xem nó chặn nhầm bao nhiêu rồi mới bật chặn thật. Mục sau áp đúng cách này cho AI review.

## Đưa AI review vào ở shadow mode

Trước khi bàn cách đưa Code Review vào, cần biết nó làm gì trên một PR. Code Review chạy trên hạ tầng của Anthropic thông qua Claude GitHub App. Nhiều agent đọc PR song song để tìm lỗi, và mỗi lỗi tìm ra gọi là một finding. Sau đó một bước kiểm chứng lọc bỏ các finding sai, gộp các finding trùng nhau, rồi đăng phần còn lại thành comment ngay trên dòng code liên quan. Mỗi finding được xếp vào một trong ba mức. Important là lỗi nên sửa trước khi merge. Nit là lỗi nhỏ. Pre-existing là lỗi đã có từ trước chứ không do PR này gây ra.

Code Review cũng tạo một check run tên **Claude Code Review**, tức một dòng trạng thái trong danh sách check của PR giống các check của CI. Check run này thường kết thúc ở trạng thái neutral (trung tính), có lúc là skipped khi lần push không đổi file nào, nhưng không bao giờ là failure. Một review không bao giờ duyệt hay chặn PR, nên quyết định merge vẫn nằm ở đội.

Như vậy, ngay khi mới bật, Code Review chỉ góp ý chứ chưa chặn được gì. Chạy ở shadow mode (**AI code review introduced in shadow mode**) nghĩa là cố ý giữ nguyên như thế. Đội chưa dựng cổng chặn merge nào dựa trên kết quả của nó, chỉ để reviewer đăng comment cho người xem, cho tới khi đo được là nó đáng tin. Đội bảo mật của Anthropic làm vậy với mọi AI reviewer mới, và còn cố tình cài thay đổi độc hại vào PR để xem reviewer có phát hiện ra không.

Đội khách sạn bắt đầu nhỏ, coi như một đợt thử để ước lượng chi phí trước khi mở rộng. Họ chỉ bật Code Review cho ba repo đại diện là `billing`, `booking` và repo web. Review chạy một lần khi PR vừa mở (**Once after PR creation**), chứ không chạy lại sau mỗi lần push. Chạy sau mỗi lần push là mặc định cho repo mới và cũng là cách tốn tiền nhất. Mức review để ở Standard, là mức mặc định, nằm giữa Quick và Deep. Đội cũng đặt một hạn mức chi tiêu hằng tháng cho Code Review.

Muốn reviewer báo đúng thứ đội quan tâm, bạn viết hướng dẫn cho nó trong hai file. `CLAUDE.md` chứa ngữ cảnh chung của project, mọi task đều đọc. `REVIEW.md` chỉ dùng cho review. Nó nói thế nào thì tính là Important, tối đa bao nhiêu Nit, đường dẫn nào được bỏ qua và cần kiểm thêm những gì.

Code Review đọc `REVIEW.md` ở nhánh base (nhánh mà PR sẽ được gộp vào) hoặc ở nhánh mặc định, không bao giờ đọc bản nằm trong chính PR. Nhờ vậy, một PR không thể tự sửa `REVIEW.md` để nới luật cho chính nó. Những chỉ dẫn có tác dụng nới luật, như hạ mức của finding, bỏ qua một số đường dẫn hay giới hạn số Nit, chỉ có hiệu lực khi nhánh mặc định được bảo vệ bằng branch protection hoặc ruleset (luật của GitHub hạn chế việc sửa thẳng vào nhánh). Nếu PR nhắm vào một nhánh khác được ruleset bảo vệ, review đọc `REVIEW.md` ở chính nhánh đó. Nếu nhánh không được bảo vệ, review chỉ đọc file `REVIEW.md` ở gốc repo. Vì thế, ngay từ đầu đội đã bật branch protection cho nhánh mặc định của cả ba repo.

## Hiệu chỉnh với review của người trước khi cho chặn merge

Chạy shadow mode là để thu dữ liệu cho bước tiếp theo, hiệu chỉnh với review của người (**calibration against human review before merge gating**). Nghĩa là trước khi giao quyền chặn merge, đội đo trên chính PR của mình xem reviewer báo đúng những lỗi mà người trong đội thật sự quan tâm tới mức nào. Có ba nguồn dữ liệu bổ sung cho nhau.

- **Người trên PR xử lý từng comment ra sao.** Người trên PR ghi cho mỗi comment của reviewer một trong bốn kết cục: đã sửa, reviewer sai, code cố ý làm vậy, hoặc không đáng sửa. Tỉ lệ comment bị ghi "reviewer sai" cho biết reviewer báo sai nhiều tới đâu.
- **Bộ sự cố cũ.** Đội gom các PR từng gây sự cố hay bị revert, nhờ người hiểu code đó xác nhận bug nằm ở đâu, rồi cho reviewer chạy lại trên repo ở đúng trạng thái lúc review. Chỉ những finding mô tả đúng bug mới được tính. Con số thu được gọi là recall, tức tỉ lệ bug thật sự gây hại mà reviewer bắt được.
- **PR sạch làm đối chứng.** Đội chạy reviewer trên các PR đã merge từ lâu và chạy ổn định, rồi đếm số lần nó báo những lỗi có thể khiến người ta "sửa" code đang đúng thành code hỏng.

Dù gọi là hiệu chỉnh với review của người, bản thân review của người cũng không phải thước đo chuẩn. Bug bảo mật vẫn lọt qua người review, và ở đội khách sạn có tới 38% PR được duyệt trong chưa tới hai phút. Vì vậy, reviewer nói giống comment của người chỉ là một tín hiệu. Muốn biết reviewer có ích tới đâu, phải nhìn vào bộ sự cố cũ và kết cục thật của từng comment.

Sau bốn tuần chạy shadow mode trên ba repo, đội có kết quả như sau.

**Sơ đồ: REVIEW.md hạ finding sai từ 46/205 xuống 9/150, rồi reviewer mới được chặn merge**

✗ _Tuần 1–2, chưa có REVIEW.md_
1. 29 trong 46 finding sai nằm ở code sinh tự động của channel-sync/
   ↓ _người trên PR ghi kết cục của từng comment_
2. **46/205** finding Important bị ghi reviewer sai, khoảng 22%, chưa đủ tin để chặn merge

✓ _Tuần 3–4, REVIEW.md bỏ qua code sinh tự động, đòi file:line làm bằng chứng_
1. Important chỉ còn là tính sai tiền, đặt trùng phòng hay lộ dữ liệu khách
   ↓ _ghi kết cục như hai tuần đầu_
2. **còn 9/150** finding Important sai, bắt được 22 trong 31 sự cố cũ

Hai tuần đầu, 46 trong 205 finding Important bị ghi là reviewer sai. Phần lớn đến từ hai nguồn. Một là code client sinh tự động trong `channel-sync/`, riêng chỗ này chiếm 29 finding sai. Hai là những nhận định reviewer chỉ đoán theo tên hàm mà không đọc code bên trong. `REVIEW.md` của từng repo định nghĩa lại Important là tính sai tiền, đặt trùng phòng hay lộ dữ liệu khách, và đòi mỗi nhận định về hành vi của code phải kèm `file:line`. Bản của `booking` bỏ qua thêm thư mục `channel-sync/generated/`. Hai tuần sau, chỉ còn 9 trong 150 finding Important là sai, và trên bộ 31 sự cố cũ, reviewer bắt được 22. Mỗi khi một kiểu finding bị người bác nhiều lần, đội thêm một dòng vào `REVIEW.md` để reviewer không báo kiểu đó nữa.

Khi đo, có hai điều cần giữ. Thứ nhất, các ca dùng để chỉnh `REVIEW.md` phải khác các ca dùng để chấm. Nếu dùng chung, con số đẹp chỉ vì reviewer đã được chỉnh khớp đúng những ca đó. Thứ hai, đo recall riêng ở từng bước: ở các finding ban đầu mà các agent tìm ra, sau bước kiểm chứng lọc finding sai, và ở bản review cuối cùng đăng lên PR. Nhờ vậy bạn biết một bug đã được tìm thấy có bị bước lọc phía sau bỏ mất hay không.

## Cho AI review chặn merge

Sau bốn tuần, đội cho AI review chặn merge (**merge gating**) nhưng chỉ ở hai repo `billing` và `booking`. Hai repo này chuyển sang chạy review sau mỗi lần push và nâng lên mức Deep, vì một bug lọt vào đây gây thiệt hại lớn hơn nhiều so với tiền và thời gian bỏ ra để review kỹ hơn.

Vì check run của Code Review không bao giờ báo failure, đội phải tự viết một job CI đọc kết quả review rồi quyết định cho qua hay chặn. Dòng cuối của phần Details trên check run là một chú thích HTML chứa số finding theo mức, ví dụ `<!-- bughunter-severity: {"nit":1,"normal":2,"pre_existing":0} -->`, trong đó `normal` là số finding Important. Job xét các trường hợp theo thứ tự sau.

1. Nếu tiêu đề của check run bắt đầu bằng `Code review not repeated`, lần này review không chạy lại mà giữ kết quả cũ, trong khi vẫn còn finding Important chưa xử lý. Trường hợp này không có dòng số đếm. Job thất bại.
2. Nếu tiêu đề kết thúc bằng `no new changes`, tức lần push không đổi dòng code nào và lần review trước không còn finding Important nào mở, job cho qua.
3. Nếu `normal` lớn hơn 0, tức còn finding Important, job thất bại.

Bản đầu của job chỉ có ba trường hợp trên, và coi việc thiếu dòng số đếm là 0 finding. Ngay tuần đầu, 11 PR có review đã hết giờ mà chưa có kết luận vẫn qua job, rồi được merge chỉ dựa vào người duyệt. Đội thêm trường hợp thứ tư.

1. Nếu không có dòng số đếm, job coi review là chưa có kết luận, chứ không phải không có finding nào. Review bị lỗi, hết giờ, bị huỷ hay bị một review mới thay thế đều không có dòng này.

Sau khi sửa, hễ thiếu kết luận là job thất bại, và PR chưa merge được cho tới khi có review mới.

**Sơ đồ: Thiếu dòng số đếm là review chưa có kết luận, nên job chặn chứ không cho qua**
_Job CI đọc check run Claude Code Review theo thứ tự. Một, tiêu đề bắt đầu bằng Code review not repeated thì thất bại vì kết quả cũ còn finding mở. Hai, tiêu đề kết thúc bằng no new changes thì cho qua. Ba, normal lớn hơn 0 thì thất bại vì còn finding Important. Bốn, thiếu dòng số đếm thì thất bại vì chưa có kết luận. Bản đầu thiếu bước bốn, đi thẳng từ bước ba xuống cho qua, nên 11 PR lọt. Qua cả bốn bước thì cho qua._

- 1. **Code review not repeated**: ở đầu tiêu đề check run
- 2. **no new changes**: ở cuối tiêu đề check run
- 3. **normal > 0**: trong dòng số đếm ở Details
- **Thiếu dòng số đếm**
- 4. bản đầu thiếu bước này, 11 PR lọt
- **Cho qua**: có dòng số đếm, normal bằng 0
- **Thất bại**: kết quả cũ còn finding mở
- **Cho qua**: không đổi dòng code nào
- **Thất bại**: còn finding Important
- **Thất bại**: chưa có kết luận
- có
- có
- có
- có
- không
- không
- không
- không

Finding nào cũng nên được xử lý, bằng cách sửa code hoặc resolve thread kèm lý do. Nếu chỉ trả lời comment mà không resolve thì finding vẫn tính là còn mở. Dù vậy, job CI chỉ chặn ở finding Important. Đội không bật tuỳ chọn bắt resolve hết mọi conversation trong branch protection, vì bật lên thì cả Nit cũng chặn merge.

> **Bẫy đề**
>
> Sau hai tuần chạy shadow mode, trưởng nhóm muốn cho AI review chặn merge ngay để đỡ tải cho người duyệt. Có ba cách nghe hợp lý nhưng sai.
>
> - **Bật chặn merge cho mọi repo từ hôm nay** (_gate every repository immediately_). Reviewer đã chạy được nên trưởng nhóm muốn dùng ngay. Nhưng lúc này 22% finding Important vẫn sai. Bật chặn bây giờ thì mỗi tuần có thể chặn nhầm tới khoảng 20 PR, và người duyệt sẽ quen bỏ qua cảnh báo của reviewer.
> - **Thêm một AI reviewer thứ hai, đắt hơn, để lọc finding sai** (_stack a second reviewer_). Hai lớp reviewer có vẻ chắc hơn một. Thực tế finding sai của đội này đến từ code sinh tự động và từ việc đoán theo tên hàm, nên chỉnh reviewer chính bằng `REVIEW.md` thường hiệu quả hơn chồng thêm một reviewer đắt hơn.
> - **Bật tuỳ chọn bắt resolve hết mọi conversation trong branch protection** (_require all conversations resolved_). Cách này không cần viết job CI nào. Nhưng như vậy cả Nit cũng chặn merge, trong khi finding sai vẫn đến từ đúng hai nguồn cũ.
>
> **Chọn:** chỉnh `REVIEW.md` rồi đo lại bằng kết cục của từng comment, bộ sự cố cũ và PR sạch. Sau đó chỉ chặn merge khi có finding Important ở các repo rủi ro cao, và review nào chưa có kết luận thì tính là chưa qua.

> **Trong đề chọn gì**
>
> Nếu gặp câu hỏi lúc nào cho AI reviewer chặn merge, hãy tìm đáp án có đủ ba ý. Reviewer đã chạy ở shadow mode trên PR của chính đội. Tỉ lệ finding sai đã giảm rõ so với lúc đầu và nó bắt được bug của các sự cố cũ. Nó chỉ chặn khi có finding Important, và người duyệt vẫn được giữ ở những repo rủi ro cao.

## Thiết kế giám sát của con người

Job CI chỉ quyết định một PR có bị chặn hay không. Câu hỏi còn lại là thay đổi nào cần người duyệt và cần mấy người. Đó là việc của thiết kế giám sát của con người (**human oversight design**). Đội khách sạn chia ba tầng theo rủi ro, dựa trên cách đội Claude Code làm.

| Tầng | Thay đổi | Người duyệt |
| --- | --- | --- |
| Thấp | Tài liệu, chữ trên giao diện, tính năng nội bộ, code mới thêm vào và đang nằm sau feature flag | Không cần, khi CI, job chặn của AI review và security review (review riêng về lỗ hổng bảo mật) đều qua |
| Vừa | Thay đổi sản phẩm thường | Một người |
| Cao | Repo `billing` và `booking` | Hai người |

Ba tầng này chỉ chạy được khi có thêm vài luật.

Tầng của một PR do nội dung thay đổi quyết định, không phải do ai viết. Các đường dẫn nhạy cảm như xác thực, tính tiền, workflow CI và phát hành, hay script cài đặt luôn cần ít nhất một người duyệt. Đội khai báo điều này trong CODEOWNERS (file của GitHub chỉ định ai phải duyệt đường dẫn nào) và trong branch protection. Tác giả chỉ là điều kiện phụ: chỉ tác giả nằm trong danh sách tin cậy mới được đi đường không cần người duyệt.

Approval của agent không thay được người. AI review có thể cho qua thay đổi ở tầng thấp, nhưng với PR cần một người duyệt thì approval của AI không được tính thay cho người đó. Trên PR do agent viết, người giao việc cho agent được tính là một trong số người duyệt bắt buộc, và chịu trách nhiệm như thể chính họ gõ ra code đó.

Approval chỉ có giá trị cho đúng commit mà người duyệt đã xem. Nếu sau đó có commit mới mà hệ thống không tự xác nhận được là an toàn, chẳng hạn agent push thêm code hay có người tự tay giải xung đột, thì PR phải được duyệt lại.

Người duyệt đọc bằng chứng chứ không chỉ đọc code. Bằng chứng gồm output test, lệnh đã chạy, ảnh chụp màn hình và finding của reviewer. Nếu đọc xong mà bạn không nói được các check đó có thể bỏ sót chỗ nào, hãy review kỹ thật sự chứ đừng bấm duyệt cho nhanh. Còn với những PR được tự duyệt mà không qua người, đội ghi lại những check nào đã qua và vì sao PR được xếp vào tầng thấp. Định kỳ, người xem lại một phần các PR đó, ưu tiên chọn những thay đổi rủi ro cao hơn.

Còn một chuyện nữa khi để agent và AI reviewer làm việc với nhau: vòng sửa có thể kéo dài mãi. Mỗi vòng gồm reviewer báo lỗi, agent sửa rồi push lại, và reviewer đọc lại. Một PR ở repo `booking` bị agent viết code và AI reviewer đẩy qua lại 23 vòng chỉ trong một đêm, vòng nào reviewer cũng chỉ tìm thêm vài lỗi đã có sẵn từ trước. Đội Claude Code từng có PR kéo dài hơn năm mươi vòng, và họ sửa bằng bốn luật.

- Sau ba vòng, reviewer yêu cầu tác giả xem lại cả cách làm.
- Sau vài vòng đầu, reviewer chỉ đọc phần diff mới.
- Khi báo bug, reviewer nói rõ loại bug để tác giả sửa hết mọi chỗ giống vậy.
- Reviewer không nhắc lại finding đã đăng.

Sau các thay đổi này, số vòng review trên mỗi PR nội bộ của họ giảm rõ.

**Sơ đồ: Không giới hạn thì agent và reviewer đẩy nhau 23 vòng, bốn luật chặn vòng lặp ở từng chỗ**
_Hình trên là lúc không giới hạn số vòng. AI reviewer báo thêm vài lỗi có sẵn từ trước, agent sửa và push lại, reviewer đọc lại. Một PR ở repo booking bị đẩy qua lại 23 vòng trong một đêm. Hình dưới là bốn luật của đội Claude Code. Bốn, reviewer không nhắc lại finding đã đăng. Ba, nói rõ loại bug để tác giả sửa hết chỗ giống. Hai, sau vài vòng đầu reviewer chỉ đọc diff mới. Một, sau ba vòng reviewer yêu cầu tác giả xem lại cả cách làm._

- **KHÔNG GIỚI HẠN SỐ VÒNG**
- **Agent**: viết code, sửa lỗi
- **AI reviewer**: đọc lại sau mỗi push
- báo thêm vài lỗi có sẵn từ trước
- sửa, push lại
- **23 vòng trong một đêm**: một PR ở repo booking
- **BỐN LUẬT CỦA ĐỘI CLAUDE CODE**
- 4. không nhắc lại finding đã đăng
- 3. nói rõ loại bug để sửa hết chỗ giống
- **Agent**: viết code, sửa lỗi
- **AI reviewer**: đọc lại sau mỗi push
- báo finding
- sửa, push lại
- 2. sau vài vòng đầu, chỉ đọc diff mới
- 1. sau ba vòng, yêu cầu xem lại cả cách làm

> **Ý chính**
>
> Khi sinh code nhanh hơn review, xếp nhiều lớp kiểm và chỉ giữ người cho chỗ có rủi ro. Agent phải đưa bằng chứng trước khi mở PR. Code Review vốn chỉ góp ý, check run của nó không bao giờ là failure, nên shadow mode là giữ nguyên như vậy cho tới khi đo xong. Đo bằng kết cục của từng comment, bộ sự cố cũ và PR sạch, rồi mới tự viết job CI chặn ở finding Important, và thiếu kết luận thì tính là chưa qua. Tầng rủi ro do nội dung thay đổi quyết định, approval gắn với từng commit, và review phải có giới hạn số vòng.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 8](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Code Review (Claude Code Docs)](https://code.claude.com/docs/en/code-review)
3. [Set up Code Review (Claude Code Docs)](https://code.claude.com/docs/en/code-review-setup)
4. [Customize Code Review (Claude Code Docs)](https://code.claude.com/docs/en/code-review-customize)
5. [Read and request reviews on a pull request (Claude Code Docs)](https://code.claude.com/docs/en/code-review-pull-requests)
6. [Code Review costs and usage (Claude Code Docs)](https://code.claude.com/docs/en/code-review-costs)
7. [Best practices, give Claude a check to run (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
8. [How the Claude Code team does code review (claude.dev)](https://claude.dev/blog/solving-code-review-at-anthropic/)
9. [How the Claude Code team thinks about verification (claude.dev)](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/)
10. [How Anthropic secures its AI-native software development lifecycle (Claude Blog)](https://claude.com/resources/articles/how-anthropic-secures-its-ai-native-software-development-lifecycle)
