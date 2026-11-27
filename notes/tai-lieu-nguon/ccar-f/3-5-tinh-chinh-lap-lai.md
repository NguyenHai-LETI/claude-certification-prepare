---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-5-tinh-chinh-lap-lai
ngay_tai: 2026-11-27
tieu_de: Tinh chỉnh lặp lại cho tới khi đúng
---

Domain 3: Claude Code Configuration & Workflows · Task 3.5

# Tinh chỉnh lặp lại cho tới khi đúng

Năm cách để vòng sửa sau tốt hơn vòng trước. Đưa ví dụ đầu vào và đầu ra, viết test trước, đưa test case cho edge case, để Claude phỏng vấn, gom lỗi đúng lúc.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Đưa 2–3 ví dụ đầu vào và đầu ra khi mô tả bằng lời bị hiểu mỗi lần một kiểu
- Viết test trước rồi sửa dần bằng cách gửi Claude các test bị fail
- Để Claude phỏng vấn bạn trước khi làm việc ở lĩnh vực bạn chưa quen
- Gom các lỗi liên quan nhau vào một tin nhắn, sửa lần lượt các lỗi độc lập

Hiếm khi Claude làm đúng hết ngay từ lần đầu, nhất là với việc có nhiều chi tiết. Bạn sẽ phải sửa qua vài vòng. Vấn đề là vòng sau có tốt hơn vòng trước không, hay sửa chỗ này lại hỏng chỗ kia.

Bài này đi qua năm cách. Bạn đưa ví dụ đầu vào và đầu ra cụ thể, viết test trước rồi sửa theo test bị fail, đưa một test case cho từng edge case, để Claude phỏng vấn bạn trước khi làm, và biết khi nào gom nhiều lỗi vào một tin nhắn, khi nào sửa từng lỗi một.

**Sơ đồ: Vòng sửa sau tốt hơn vòng trước khi yêu cầu rõ, có test làm đích và lỗi được gửi đúng cách**
_Bản đồ bài: ba chỗ của một vòng sửa với Claude Code và các cách gắn vào từng chỗ. Nói rõ yêu cầu: interview pattern, ví dụ đầu vào và đầu ra, @ file mẫu. Có đích kiểm được: viết test trước, một test case cho edge case. Báo lỗi cho Claude: dán output test fail, gom lỗi tương tác vào một tin nhắn, sửa lần lượt lỗi độc lập. Từ phản hồi lỗi, Claude sửa rồi chạy lại test._

- Claude sửa, chạy lại test
- 1. **Nói rõ yêu cầu**: trước khi Claude viết
- **Claude phỏng vấn**: interview pattern
- lĩnh vực chưa quen
- **Ví dụ vào, ra**: input/output examples
- mô tả bị hiểu lệch
- **@ file mẫu**: đã có code mẫu,
- đưa thẳng vào prompt
- 2. **Có đích kiểm được**: test là đích mỗi vòng
- **Viết test trước**: test-driven iteration
- nhiều edge case, hiệu năng
- **Một test case**: cho edge case: vào mẫu,
- ra mong đợi
- 3. **Báo lỗi**: để vòng sau đúng hơn
- **Dán test fail**: tên test, mong đợi,
- giá trị thực tế
- **Gom một lần**: interacting problems
- một tin nhắn chi tiết
- **Sửa lần lượt**: independent problems
- mỗi lỗi một vòng

## Ví dụ xuyên suốt: hệ thống tính lương cho một nhà máy may

Một nhà máy may ở Long An có khoảng 3.000 công nhân, làm theo ba ca, có cả ca đêm. Đội phần mềm nội bộ có 4 dev, chị Uyên là trưởng nhóm. Đội đang viết lại hệ thống tính lương bằng Python. Hệ thống đọc dữ liệu chấm công từ máy quét vân tay, tính giờ làm, tăng ca và phụ cấp, rồi xuất phiếu lương PDF cho từng người và gửi email báo phiếu lương.

Hệ thống mới thay cho một hệ thống cũ, nên đội còn phải chuyển dữ liệu lương nhiều năm sang. Công nhân xem phiếu lương trên một trang tra cứu trong app nội bộ. Code đã có sẵn một số module dùng chung, như module ghi database, module xử lý lỗi, module ghi audit log và một file tiện ích gửi email.

Tài, một dev trong đội, dùng Claude Code cho phần lớn việc này. Mỗi phần việc của hệ thống dạy Tài thêm một cách để vòng sửa sau tốt hơn vòng trước.

## Đưa 2–3 ví dụ đầu vào và đầu ra khi lời mô tả bị hiểu mỗi lần một kiểu

Máy quét vân tay xuất mỗi lần quẹt thành một dòng CSV. Tài cần Claude viết hàm `gom_ca` để gom các dòng đó thành từng ca làm của mỗi công nhân. Tài mô tả bằng lời: "mỗi ca bắt đầu ở lần quẹt vào và kết thúc ở lần quẹt ra kế tiếp, ca đêm thì tính vào ngày bắt đầu ca".

Claude viết ba lần, lần nào cũng ra một kiểu khác. Lần đầu, ca đêm từ 22 giờ tới 6 giờ sáng bị tách làm hai ca ở hai ngày. Lần thứ hai, ca đêm đúng nhưng người quẹt vào hai lần liên tiếp bị tính thành hai ca. Lần thứ ba, ca thiếu lần quẹt ra bị bỏ mất. Lời mô tả của Tài nghe rõ, nhưng mỗi lần Claude hiểu một cách.

Lần này Tài không giải thích thêm bằng lời nữa, mà đưa ba ví dụ đầu vào và đầu ra cụ thể (**concrete input/output examples**). Mỗi ví dụ là một tình huống khó.

```
Vào:  CN0412, 2026-11-03 21:58, vào
      CN0412, 2026-11-04 06:03, ra
Ra:   {ma: "CN0412", ngay: "2026-11-03", vao: "21:58", ra: "06:03"}

Vào:  CN0815, 2026-11-04 05:57, vào
      CN0815, 2026-11-04 05:58, vào
      CN0815, 2026-11-04 14:01, ra
Ra:   {ma: "CN0815", ngay: "2026-11-04", vao: "05:57", ra: "14:01"}

Vào:  CN1093, 2026-11-04 13:55, vào
Ra:   {ma: "CN1093", ngay: "2026-11-04", vao: "13:55", ra: null, thieu_quet_ra: true}
```

Lần này Claude viết đúng cả ba tình huống, và đúng luôn với dữ liệu thật. Khi lời mô tả bị Claude hiểu mỗi lần một kiểu, ví dụ cụ thể là cách hiệu quả nhất để Claude thấy đầu vào phải biến thành đầu ra thế nào. Thường chỉ cần hai, ba ví dụ, miễn là chọn đúng những chỗ khó.

Cùng ý đó, khi bạn đã có sẵn code mẫu thì đưa thẳng code đó cho Claude thay vì tả lại bằng lời. Đến phần tính phụ cấp, code mới phải làm giống hệt ba module có sẵn: cùng cách mở transaction khi ghi database, cùng cách xử lý lỗi, cùng cách ghi audit log. Tài gõ `@` kèm đường dẫn ba file đó vào prompt, và Claude Code đưa nguyên nội dung ba file vào tin nhắn. Claude thấy code thật nên làm theo đúng mẫu.

> **Bẫy đề**
>
> Bạn nhờ Claude tạo mock data phức tạp cho integration test, nhưng mô tả bằng lời thì lần nào mock data cũng ra một cấu trúc khác. Kỹ thuật nào hiệu quả nhất để sửa chuyện này? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Yêu cầu Claude tự đánh giá output của nó trước khi trả về** (_self-evaluation_). Nghe như thêm được một lớp kiểm tra. Nhưng Claude vẫn tự đánh giá theo cách nó hiểu lời mô tả, nên vẫn không biết cấu trúc nào là đúng.
> - **Tăng `max_tokens` để Claude có thêm chỗ suy luận** (_increase max_tokens_). Nghe như cho Claude thêm tài nguyên. Có điều `max_tokens` chỉ là giới hạn độ dài câu trả lời, không làm yêu cầu rõ hơn.
> - **Chạy `/compact` trước khi yêu cầu tạo test** (_run /compact_). Nghe như dọn context cho sạch. Ngặt nỗi `/compact` chỉ nén lịch sử trò chuyện, không cho Claude thêm thông tin gì về cấu trúc mong muốn.
>
> **Chọn:** đưa 2–3 ví dụ đầu vào và đầu ra cụ thể cho thấy đúng cách đầu vào biến thành đầu ra.

> **Trong đề chọn gì**
>
> Đề có thể kể bạn làm một module mới theo mẫu của ba module có sẵn. Bạn đã biết đó là ba file nào, và việc này chỉ làm một lần. Khi đó, hãy chọn gõ `@` để đưa thẳng ba file vào prompt. Bảo Claude đi khảo sát codebase để tự tìm các mẫu là thừa, vì bạn đã biết chúng ở đâu. Còn thêm tài liệu về các mẫu vào CLAUDE.md thì thừa, vì CLAUDE.md được nạp ở mọi session, trong khi việc này chỉ làm một lần. Tả lại bằng lời cách ba module xử lý transaction, lỗi và log thì dễ sai hơn nhiều so với để Claude đọc thẳng code thật.

## Viết test trước, rồi sửa theo test bị fail

Phần khó nhất là hàm tính tăng ca: tăng ca ngày thường, tăng ca cuối tuần, ca đêm có phụ cấp riêng, và người làm qua nửa đêm sang ngày lễ. Hàm còn phải tính xong tăng ca cả tháng cho 3.000 công nhân trong chưa tới 2 giây.

Tài không bảo Claude viết hàm ngay. Tài bảo Claude viết bộ test trước (**test-driven iteration**, viết **test suites** trước khi implement). Bộ test phủ ba loại yêu cầu. Loại thứ nhất là hành vi mong đợi (**expected behavior**), như tăng ca ngày thường và tăng ca cuối tuần. Loại thứ hai là edge case (**edge cases**), tức những tình huống hiếm nằm ở rìa quy tắc, như ca đêm vắt qua ngày lễ hay ca thiếu lần quẹt ra. Loại thứ ba là yêu cầu hiệu năng (**performance requirements**), ở đây là 3.000 người trong chưa tới 2 giây. Tài đọc lại các test, sửa hai giá trị mong đợi cho đúng quy định của nhà máy, rồi mới bảo Claude viết hàm sao cho qua hết test.

Lần chạy đầu, 4 trên 23 test fail. Tài không mô tả lại lỗi bằng lời, mà dán nguyên output của các test bị fail vào tin nhắn tiếp theo, gồm tên test, giá trị mong đợi và giá trị thực tế. Claude biết chính xác chỗ nào sai và sửa đúng chỗ đó. Vòng thứ hai còn 1 test fail, vòng thứ ba qua hết.

**Sơ đồ: Test viết trước làm đích nên mỗi vòng sửa đúng chỗ: 4 test fail, rồi 1, rồi qua hết**
Bên tham gia: Bộ test, Claude Code, Tài

1. Viết test trước: tăng ca, edge case,
2. 3.000 người dưới 2 giây
3. Viết 23 test
4. Viết hàm tính tăng ca cho qua hết test
5. Chạy test lần đầu
6. 4 trên 23 test fail
7. Dán output: tên test, mong đợi, thực tế

Cách làm này theo kiểu TDD (test-driven development, viết test trước rồi mới viết code). Bạn viết test trước, lúc đó test còn fail. Sau đó viết code cho test qua, chạy test, rồi chỉnh code thêm mà vẫn giữ cho mọi test qua. Test viết trước là đích rõ ràng và kiểm được, nên mỗi vòng sửa nhắm đúng chỗ hỏng. Claude cũng tự chạy được test, đọc kết quả và sửa tiếp mà không cần bạn ngồi xem.

Để lần nào Claude cũng viết test theo cùng một chuẩn, chị Uyên ghi chuẩn test của đội vào `CLAUDE.md` của project: test thế nào là có giá trị, fixture có sẵn (dữ liệu mẫu dựng sẵn cho test) nằm ở đâu, lệnh chạy test là gì. Claude Code tự đọc file này ở đầu mọi session, nên không ai phải dặn lại.

> **Bẫy đề**
>
> Bạn đang implement một thuật toán duyệt đồ thị có yêu cầu hiệu năng và nhiều edge case (nút không nối với nút nào, chu trình, cạnh có trọng số). Cách nào hiệu quả nhất để code tốt dần lên qua từng vòng? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Cho Claude dùng extended thinking để lập kế hoạch chi tiết, rồi implement trọn giải pháp theo kế hoạch** (_extended thinking then implement_). Cách này nghe kỹ lưỡng. Nhưng kế hoạch không cho bạn cách kiểm từng vòng xem code đã đúng chưa.
> - **Đưa một bản implement tham khảo rồi nhờ viết lại theo style của codebase** (_reference implementation_). Nghe như đã có sẵn đáp án. Có điều bản tham khảo không nói gì về các edge case và yêu cầu hiệu năng của riêng bạn, nên bạn không có gì để kiểm từng vòng.
> - **Đưa đặc tả chi tiết bằng lời, rồi tự review mỗi output và nhận xét bằng lời** (_prose spec and verbal feedback_). Nghe như kiểm soát chặt. Ngặt nỗi bạn phải tự đóng vai bộ test, mà nhận xét bằng lời thì dễ bị Claude hiểu mỗi lần một kiểu.
>
> **Chọn:** viết bộ test phủ hành vi mong đợi, edge case và yêu cầu hiệu năng trước khi viết code, nhờ Claude viết code qua được test, rồi đưa các test bị fail vào mỗi lần yêu cầu sửa.

> **Trong đề chọn gì**
>
> Nếu đề hỏi nên tinh chỉnh theo TDD thế nào, hãy chọn viết test đang fail, viết code để test qua, chạy test, rồi chỉnh code mà vẫn giữ mọi test qua. Viết code trước rồi viết test và bảo Claude "make it better" là làm ngược và mơ hồ. Còn dùng plan mode viết hết test rồi chạy một lượt thì chỉ là chạy một lần, không phải vòng lặp. Đáp án nhắc tới một slash command `/test` có sẵn tự suy ra test còn thiếu cho cả dự án cũng sai: bạn nhờ Claude tìm edge case còn thiếu bằng prompt thì được, chứ không có lệnh `/test` nào như vậy.
>
> Nếu đề hỏi nên bắt đầu viết một rate limiter thế nào để lặp theo test, hãy chọn viết test trước cho throttling, giới hạn burst và việc reset window (khung thời gian đếm request), rồi viết limiter và đưa từng test bị fail để sửa. Viết tài liệu thiết kế trước thì chưa có gì chạy được để kiểm. Tự chạy thử bằng tay trong terminal thì mỗi lần thử một kiểu, không lặp lại được. Còn viết limiter trước rồi mới viết test thì code định hình test, và vòng đầu không có đích nào để nhắm.
>
> Nếu đề hỏi hai chiến lược nên dùng khi đưa Claude vào quy trình sinh test, hãy chọn ghi chuẩn test, tiêu chí test có giá trị và fixture vào CLAUDE.md của project, và đưa cho Claude output lỗi cụ thể của test để sửa dần. Một đáp án sai là dùng hook `PreToolUse` để chặn lưu code khi test fail. Hook này chạy trước khi tool chạy, tức là trước khi code mới được lưu, nên nó chưa kiểm được code mới có làm hỏng test không. Mà chặn lưu thì vòng sửa cũng dừng luôn. Một đáp án sai khác là dựa vào chỉ số coverage. Coverage chỉ cho biết dòng nào được chạy qua, không cho biết test có kiểm đúng điều cần kiểm không.

## Đưa một test case cụ thể để sửa một edge case

Bộ test viết trước hợp với việc có nhiều yêu cầu. Còn khi chỉ một edge case làm hỏng việc, Tài dùng một test case duy nhất. Chuyện này xảy ra lúc chuyển dữ liệu lương cũ sang hệ thống mới. Claude viết script migration chạy đúng với hầu hết bản ghi, nhưng script dừng ngay ở bản ghi đầu tiên có `ngay_vao_lam` bị trống (null), dù đây là field bắt buộc. Tài kiểm lại dữ liệu cũ và thấy có 37 bản ghi như vậy.

Tài không tự sửa tay đoạn đó, cũng không bảo Claude viết lại cả script. Tài đưa một test case cụ thể, có đầu vào mẫu và đầu ra mong đợi (**specific test cases with example input and expected output**). Đầu vào là một bản ghi mẫu có `ngay_vao_lam` trống. Đầu ra mong đợi là bản ghi đó vẫn được chuyển sang, `ngay_vao_lam` lấy theo ngày ký hợp đồng đầu tiên, và file báo cáo có thêm một dòng để phòng nhân sự kiểm lại. Một test case như vậy biến "xử lý null cho đúng" từ một yêu cầu mơ hồ thành một mục tiêu kiểm được. Claude sửa đúng chỗ, và Tài chạy test là biết ngay đã đúng chưa.

> **Bẫy đề**
>
> Claude viết một script migration dữ liệu, nhưng bản đầu không xử lý đúng các bản ghi có giá trị null ở field bắt buộc. Cách nào hiệu quả nhất để sửa qua vài vòng cho tới khi script chạy đúng? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tự sửa tay phần xử lý null, rồi làm tiếp với Claude ở phần khác** (_fix it manually_). Cách này có vẻ nhanh nhất, vì bạn đã biết phải sửa chỗ nào. Nhưng Claude không biết bạn muốn xử lý null thế nào, nên lần sau gặp tình huống tương tự vẫn sai.
> - **Mô tả chi tiết vấn đề null và nhờ Claude viết lại cả script** (_describe and regenerate_). Nghe như sửa tận gốc. Có điều viết lại cả script dễ làm hỏng phần đang chạy đúng, và lời mô tả vẫn có thể bị hiểu sai.
> - **Thêm "think harder about edge cases" vào prompt và viết lại toàn bộ logic** (_think harder_). Nghe như bảo Claude cẩn thận hơn. Ngặt nỗi câu đó không cho Claude biết đầu ra đúng trông thế nào.
>
> **Chọn:** đưa một test case có đầu vào mẫu chứa giá trị null và đầu ra mong đợi, rồi nhờ Claude sửa.

## Để Claude phỏng vấn bạn trước khi làm ở lĩnh vực chưa quen

Chị Uyên muốn trang tra cứu phiếu lương chạy nhanh hơn vào ngày phát lương, khi cả nghìn công nhân cùng mở app. Ý ban đầu của chị là dùng Redis để cache kết quả, mỗi mục hết hạn sau 5 phút. Nhưng đội chưa từng làm cache cho production, và chị không chắc còn phải cân nhắc những gì.

Thay vì viết ngay "thêm Redis cache 5 phút", Tài bảo Claude phỏng vấn mình trước khi làm.

```
Mình muốn thêm cache cho trang tra cứu phiếu lương nhưng chưa nghĩ kỹ.
Hãy hỏi mình cho tới khi đủ để viết spec, rồi ghi spec vào SPEC.md.
```

Đây là cách để Claude phỏng vấn bạn (**interview pattern**). Claude đưa ra các câu hỏi trắc nghiệm về những chỗ bạn chưa chốt, và hỏi tiếp cho tới khi các câu trả lời đủ thành một spec. Claude hỏi Tài những điều đội chưa nghĩ tới. Nếu phòng nhân sự sửa phiếu lương sau khi đã phát, cache được làm mới thế nào (**cache invalidation**)? Nên cache theo từng người hay theo cả phân xưởng? Nếu Redis chết thì trang báo lỗi hay đọc thẳng database (**failure modes**, các kiểu hỏng)? Tài trả lời xong thì Claude ghi spec vào `SPEC.md`. Tài mở một session mới để làm theo spec, vì session mới có context sạch, không còn lẫn cuộc hỏi đáp.

**Sơ đồ: Claude hỏi ra những điều đội chưa nghĩ tới, rồi mới có SPEC.md cho session mới**
- Tài: thêm cache cho trangtra cứu phiếu lương, hỏi mìnhcho tới khi đủ để viết spec
- Claude hỏi: nhân sự sửaphiếu đã phát thì sao?cache invalidation
- Claude hỏi: cache theotừng người haycả phân xưởng?
- Claude hỏi: Redis chết thìbáo lỗi hay đọc database?failure modes
- Tài trả lời,Claude ghi SPEC.md
- Tài mở session mới,làm theo spec

Cách này hợp nhất khi bạn làm ở một lĩnh vực chưa quen, lúc bạn không biết mình còn thiếu gì. Nhờ các câu hỏi của Claude, bạn thấy được những điều cần cân nhắc trước khi viết dòng code đầu tiên.

> **Bẫy đề**
>
> Bạn làm tầng cache cho endpoint `/products`, có ý sơ bộ là dùng Redis, mỗi mục cache hết hạn sau 5 phút (TTL 5 phút). Nhưng bạn mới làm cache cho production lần đầu và không chắc còn cần cân nhắc gì. Cách hiệu quả nhất để bắt đầu là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Bắt đầu bằng yêu cầu tối thiểu, rồi sửa qua các prompt sau khi vấn đề lộ ra lúc test** (_minimal request then fix_). Cách này có vẻ nhanh. Nhưng những vấn đề như làm mới cache thường lộ ra muộn, lúc test hay khi đã chạy thật, và lúc đó sửa đã tốn kém.
> - **Viết spec với các yêu cầu đã biết, đánh dấu "TBD" (chưa quyết) cho chỗ chưa chắc để Claude tự đề xuất khi implement** (_spec with TBDs_). Nghe như chừa chỗ cho Claude. Có điều bạn chỉ đánh dấu được những chỗ bạn biết là chưa chắc, còn những điều bạn chưa nghĩ tới thì không có dòng TBD nào.
> - **Dùng plan mode phân tích code hiện tại của `/products`, rồi đưa yêu cầu cache sau** (_plan mode on existing code_). Nghe như tìm hiểu kỹ trước. Ngặt nỗi hiểu code cũ không cho bạn biết một tầng cache cần cân nhắc những gì.
>
> **Chọn:** nhờ Claude phỏng vấn bạn về yêu cầu cache trước khi implement, để lộ ra những điều cần cân nhắc như chiến lược làm mới cache, các tầng cache, mức nhất quán và failure modes.

> **Trong đề chọn gì**
>
> Nếu đề kể một dev viết prompt "Ask me 3 questions to surface potential design flaws or failure modes before you start" và hỏi kỹ thuật này tên gì, hãy chọn Interview Pattern. Sequential Decomposition là chia việc thành các bước nối tiếp, Concrete Transformation là đưa ví dụ biến đổi cụ thể, còn Generator-Verifier là một bên sinh ra kết quả, một bên kiểm tra kết quả đó. Không cái nào là để Claude phỏng vấn bạn.
>
> Đề có thể kể một kiến trúc sư lần đầu làm trình soạn tài liệu cộng tác thời gian thực. Người này muốn biết trước những gì cần cân nhắc về làm mới cache, giải quyết xung đột và xử lý lỗi. Hãy chọn đưa cho Claude một đoạn mô tả ngắn, để Claude phỏng vấn bằng tool `AskUserQuestion` (tool đưa câu hỏi trắc nghiệm cho người dùng chọn), rồi viết spec từ câu trả lời. Tự soạn spec đầy đủ chỉ phủ được những gì kiến trúc sư đã nghĩ tới. Chép kiến trúc của một dự án mã nguồn mở là chọn theo nhu cầu của dự án khác. Còn làm bản tối thiểu rồi đợi test ra lỗi mới quyết thiết kế thì vấn đề lộ ra quá muộn.

## Gom lỗi vào một tin nhắn hay sửa từng lỗi

Phiếu lương PDF bản đầu lấy dữ liệu đúng, nhưng có ba lỗi trình bày: cột "Tăng ca" quá hẹp nên số bị cắt, ngày hiện theo kiểu Mỹ `11/03/2026` thay vì `03/11/2026`, và trang bị ngắt giữa bảng. Tài để ý ba lỗi này dính vào nhau. Nới cột "Tăng ca" thì cột ngày bị co lại và ngày xuống dòng, ngày xuống dòng làm bảng cao thêm, và bảng cao thêm thì chỗ ngắt trang đổi.

Với những lỗi tương tác nhau (**interacting problems**), sửa từng lỗi một sẽ thành vòng luẩn quẩn, vì sửa lỗi thứ hai lại làm hỏng lỗi thứ nhất. Tài gom cả ba vào một tin nhắn chi tiết (**single detailed message**), kèm thông số cụ thể cho từng lỗi và nói rõ chúng liên quan thế nào: cột "Tăng ca" rộng 28 mm, ngày theo dạng `dd/mm/yyyy` và không xuống dòng, không ngắt trang giữa một dòng của bảng. Claude thấy được cả ba ràng buộc nên chỉnh chúng khớp với nhau trong một lần.

Cùng lúc đó, Tài thấy một typo nhỏ trong file tiện ích gửi email: chữ "phiếu lương" bị viết thành "phiêu lương" trong tiêu đề email. Lỗi này không dính gì tới ba lỗi kia (**independent problems**). Với lỗi độc lập, sửa lần lượt từng lỗi (**sequential iteration**) là hợp. Tài để lỗi này cho một vòng riêng sau đó, cho mỗi thay đổi gọn và dễ kiểm.

**Sơ đồ: Nới cột Tăng ca kéo theo hai lỗi kia nên gom một tin nhắn; typo độc lập để vòng sau**
_Phiếu lương PDF có ba lỗi tương tác: cột Tăng ca hẹp, ngày kiểu Mỹ, ngắt trang giữa bảng. Nới cột Tăng ca làm cột ngày co lại và ngày xuống dòng, bảng cao thêm, chỗ ngắt trang đổi. Tài gom cả ba vào một tin nhắn với thông số cụ thể. Lỗi gõ phiêu lương trong tiêu đề email ở file tiện ích là lỗi độc lập, sửa ở vòng riêng._

- **PHIẾU LƯƠNG PDF: BA LỖI TƯƠNG TÁC (INTERACTING PROBLEMS)**
- 1. **Cột Tăng ca hẹp**: số bị cắt
- 2. **Ngày kiểu Mỹ**: 11/03/2026, cần 03/11/2026
- 3. **Ngắt trang sai**: ngắt giữa bảng
- Sửa riêng lỗi 1 thì lỗi 2 và 3 đổi theo:
- **Nới cột Tăng ca**: để sửa lỗi 1
- **Ngày xuống dòng**: cột ngày bị co lại
- **Bảng cao thêm**: vì ngày xuống dòng
- **Ngắt trang đổi**: lỗi 3 đổi theo
- **Gom cả ba vào một tin nhắn, nói rõ chúng liên quan**: cột Tăng ca 28 mm · ngày dd/mm/yyyy, không xuống dòng · không ngắt giữa một dòng
- **FILE TIỆN ÍCH GỬI EMAIL: LỖI ĐỘC LẬP (INDEPENDENT PROBLEMS)**
- **Tiêu đề email: "phiêu lương"**
- **Sửa ở một vòng riêng sau đó**

> **Bẫy đề**
>
> Bản đầu của tính năng báo cáo PDF lấy dữ liệu đúng nhưng có ba lỗi định dạng: cột bảng quá hẹp, ngày sai định dạng, ngắt trang sai. Ba lỗi ảnh hưởng lẫn nhau: đổi độ rộng cột làm đổi cách hiện ngày, còn ngắt trang phụ thuộc chiều cao nội dung. Cách hiệu quả nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Sửa độ rộng cột trước, kiểm xong mới sửa ngày, rồi mới chỉnh ngắt trang** (_fix sequentially_). Cách này nghe cẩn thận. Nhưng lỗi tương tác nhau thì sửa lỗi sau có thể làm hỏng lại lỗi trước.
> - **Cho Claude xem một báo cáo mẫu đúng định dạng và bảo làm giống vậy** (_show a sample report_). Nghe như đưa ví dụ cụ thể. Có điều một báo cáo mẫu không nói rõ thông số nào đang sai và chúng ràng buộc nhau thế nào.
> - **Làm lại từ đầu với một prompt nêu trước mọi yêu cầu định dạng** (_start over_). Bắt đầu lại có vẻ gọn. Ngặt nỗi bạn bỏ cả phần lấy dữ liệu đã đúng, mà cũng không chắc lần sau đúng hết.
>
> **Chọn:** đưa cả ba lỗi vào một tin nhắn chi tiết với thông số chính xác cho từng lỗi, để Claude xử lý chung trong một lần sửa.

> **Trong đề chọn gì**
>
> Đề có thể kể code Claude viết ra có hai bug dính chặt vào nhau vì cùng sửa một state object, và thêm một typo ở một file tiện ích không liên quan. Hãy chọn sửa hai bug trong một tin nhắn chi tiết, còn typo để vòng sau. Dùng hook `PostToolUse` để tách các bug ra là lạc đề, vì hook chỉ chạy sau mỗi lần gọi tool chứ không phân loại lỗi. Gửi cả ba lỗi một lần cho đỡ token thì sai, vì typo là lỗi độc lập, nên sửa riêng. Sửa typo trước rồi chạy `/compact` cũng không giúp gì, vì `/compact` chỉ nén lịch sử trò chuyện.

> **Ý chính**
>
> Lỗi tương tác nhau thì gom vào một tin nhắn chi tiết, lỗi độc lập thì sửa lần lượt.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 3.5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
3. [Common workflows (Claude Code Docs)](https://code.claude.com/docs/en/common-workflows)
4. [Memory (Claude Code Docs)](https://code.claude.com/docs/en/memory)
