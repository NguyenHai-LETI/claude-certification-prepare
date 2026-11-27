---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/4-2-xu-ly-su-co
ngay_tai: 2026-11-27
tieu_de: Xử lý sự cố và rút kinh nghiệm - triage, giảm thiệt hại, rollback, báo tin, postmortem
---

Domain 4: Advanced Debugging and Incident Response · Task 4.2

# Xử lý sự cố và rút kinh nghiệm - triage, giảm thiệt hại, rollback, báo tin, postmortem

Phân loại sự cố của hệ thống dùng Claude, chọn cách giảm thiệt hại và rollback, báo tin đúng người, rồi biến sự cố thành ca eval, cảnh báo và postmortem.

- 19 phút đọc
- Đối chiếu docs 21/11/2026
- 12 nguồn

## Đọc xong bạn nắm được

- Phân biệt ngừng dịch vụ với giảm chất lượng, và trả lời ba câu hỏi triage trước khi hành động
- Chọn giữa rollback, fallback, tắt bớt tính năng và chuyển cho người theo loại sự cố
- Để Claude Tag điều tra trước, còn quyết định vẫn do người đưa ra, và việc cấm làm thì chặn bằng phân quyền
- Báo tin cho đội trong công ty và cho khách, nêu số khách bị ảnh hưởng đếm từ dữ liệu thật
- Biến sự cố thành ca eval hồi quy, cảnh báo mới và postmortem có người nhận việc

Khi hệ thống dùng Claude gặp sự cố, nên làm gì trước, và làm gì để lần sau không lặp lại? Sự cố của hệ thống dùng LLM có hai dạng. Ngừng dịch vụ (**outage**) thì có lỗi, có timeout, dashboard đỏ. Giảm chất lượng (**quality regression**) thì mọi request vẫn trả HTTP 200, chỉ có câu trả lời tệ đi, và thường chính khách là người báo đầu tiên.

Tên task trong đề là **Incident Response and Learning Loops**. Nó gồm việc đánh giá các lựa chọn xử lý sự cố (**incident-response options**) khi hệ thống ngừng dịch vụ hay giảm chất lượng. Các lựa chọn đó là phân loại (**triage**), giảm thiệt hại (**mitigation**), quay về bản cũ (**rollback**) và báo tin (**communication**). Nó cũng gồm việc biến sự cố thành ca eval hồi quy (**regression evaluations**), thêm giám sát còn thiếu (**monitoring coverage**) và rút ra phát hiện cho postmortem (**postmortem findings**). Postmortem là bản phân tích viết sau sự cố, kể lại chuyện gì đã xảy ra, vì sao lỗi lọt qua, và đội sẽ làm gì tiếp.

Bài này không đi sâu vào mấy chủ đề liên quan. Cách tìm gốc lỗi nằm ở bài 4.1, retry, circuit breaker và fallback ở bài 2.1, SLO và cảnh báo ở bài 3.2, còn agent tự chạy khi CI/CD lỗi ở bài 8.3.

**Sơ đồ: Triage trước, chặn thiệt hại và báo tin, rồi biến sự cố thành eval, cảnh báo và postmortem**
_Bản đồ bài. Outage và quality regression cùng đi vào triage với ba câu hỏi, rồi tới mitigation và rollback. Communication, báo tin trong công ty và với khách, chạy suốt trong lúc xử lý. Rollback xong thì tới learning loops sau sự cố: regression eval, monitoring coverage và postmortem findings, dùng cho lần sau._

- **PHÁT HIỆN**
- **TRIAGE**
- **GIẢM THIỆT HẠI**
- **Outage**: ngừng dịch vụ, 529, 5xx
- cảnh báo tỉ lệ lỗi kêu
- **Quality regression**: HTTP 200, trả lời tệ đi
- khách thường báo trước
- **Ba câu hỏi triage**
- 1. Có thật không?
- 2. Cái gì vừa đổi?
- 3. Nặng tới đâu?
- Claude Tag tra, người quyết
- **Mitigation, rollback**: lỗi của mình thì rollback
- lỗi phía nhà cung cấp thì
- retry, fallback
- **Communication, trong lúc xử lý**: trong công ty một thread, với khách số đếm thật
- rollback xong
- **LEARNING LOOPS, SAU SỰ CỐ**: bước cuối, để lần sau chặn được sớm hơn
- **Regression eval**: eval có bắt được không
- **Monitoring coverage**: tín hiệu nào báo trước
- **Postmortem findings**: vì sao lọt, ai làm gì

## Ví dụ xuyên suốt: trợ lý đổi chuyến của hãng hàng không nội địa

Một hãng hàng không nội địa có trợ lý trong app giúp khách đổi chuyến, mua thêm hành lý và hỏi quy định, khoảng 30.000 hội thoại mỗi ngày. Trợ lý chạy trên Claude API, có tool báo giá và tool đổi chuyến. Tool đổi chuyến trừ phí đổi và tiền chênh lệch giá vé vào thẻ khách đã lưu, nên việc nó làm không hoàn tác được.

Model, system prompt và định nghĩa tool được gói chung thành một bản cấu hình có số version. Muốn đổi bản đang chạy, đội chỉ cần đổi một feature flag, tức một công tắc trong hệ thống cấu hình, không phải deploy lại code. Flag có thể bật bản mới cho một phần hội thoại trước rồi mở rộng dần (rollout dần), hoặc bật cho tất cả cùng lúc. Mỗi tool còn có công tắc riêng, nên đội tắt được một tool mà không cần đổi version. Trước khi bật một bản cấu hình mới, đội chạy một bộ eval nhỏ, tức bộ ca kiểm thử tự động. Khách gặp vấn đề thì gọi tổng đài của hãng. Trong kênh Slack `#su-co` có Claude Tag, tức Claude tham gia kênh như một thành viên. Claude Tag được nối với Datadog (công cụ giám sát), PagerDuty (công cụ gọi người trực) và GitHub, nên đọc được số liệu, cảnh báo và lịch sử deploy. Log hội thoại và log của các tool cũng được gửi về Datadog, nên Claude đọc được cả nội dung hội thoại.

## Triage: có thật không, cái gì vừa đổi, nặng tới đâu

Hai dạng sự cố lộ ra theo cách khác nhau, người phát hiện cũng khác, và nguyên nhân thường nằm ở chỗ khác nhau.

|   | Ngừng dịch vụ | Giảm chất lượng |
| --- | --- | --- |
| Dấu hiệu | `529 overloaded_error`, `500`, timeout, tỉ lệ lỗi tăng | HTTP 200, câu trả lời sai, thiếu hay lạc đề, Claude từ chối trả lời (refusal) nhiều hơn |
| Ai thấy trước | Cảnh báo tỉ lệ lỗi | Khách, tổng đài, bộ eval chấm điểm trên traffic thật |
| Nguyên nhân hay gặp | Phía nhà cung cấp, mạng, gateway của bạn | Thay đổi của chính bạn, như prompt, tool, model hay dữ liệu |

Trước khi sửa gì, bạn cần trả lời ba câu hỏi. Câu đầu tiên là sự cố có thật không, hay chỉ là một cảnh báo nhiễu quen thuộc, và số liệu có khớp với cảnh báo không. Câu thứ hai là cái gì vừa thay đổi trong một hai giờ trước, ví dụ một lần deploy, một feature flag, version cấu hình hay model. Bạn cũng nên xem trang trạng thái của nhà cung cấp để biết phía họ có đang gặp sự cố không. Câu thứ ba là sự cố nặng tới đâu, gồm bao nhiêu khách, từ lúc nào, và có tool nào đang làm việc không hoàn tác được dựa trên câu trả lời sai không. Với hãng hàng không này, trợ lý báo sai quy định chỉ gây phiền. Còn nếu khách đã bấm đổi chuyến theo thông tin sai và bị trừ tiền thì nặng hơn hẳn.

Hai câu hỏi đầu, bạn có thể giao cho Claude Tag tra ngay khi cảnh báo vừa tới, trước khi người trực kịp mở máy. Đội chỉ cần dặn Claude một lần ngay trong kênh `#su-co`, ví dụ "khi có cảnh báo, xem nó bắt đầu lúc nào, quanh lúc đó có deploy hay đổi flag gì không, nên kiểm tra gì trước, rồi tag người trực". Thêm câu "remember for this channel" thì lời dặn được lưu vào memory của kênh và áp dụng cho mọi thread sau này.

Có một chỗ cần cấu hình. Tin cảnh báo do Datadog hay PagerDuty đăng là tin của bot, và Claude chỉ đọc tin của bot để lấy thông tin chứ không tự trả lời. Vì vậy đội cấu hình để tin cảnh báo có @Claude. Ngoài ra, kênh phải đang bật chế độ tự trả lời (**Respond automatically**, mặc định là bật) và không được là kênh Slack Connect, tức kênh dùng chung với công ty khác. Với những cảnh báo đội đã biết là nhiễu, đội liệt kê chúng ở ô Channel instructions trên trang Configure của kênh để Claude bỏ qua. Nếu Claude điều tra sai hướng, bất kỳ ai trong kênh cũng có thể trả lời trong thread để chỉnh lại.

Chính Anthropic cũng dùng cách này. Claude Tag là bên đầu tiên vào điều tra mỗi khi CI/CD của Anthropic lỗi. Theo số đo của họ, từ lúc sự cố được mở tới khi có bản phân tích đầu tiên kèm bằng chứng mất trung vị 14 phút. Có hai điểm trong cách họ làm mà bạn nên học theo. Thứ nhất, cảnh báo vẫn do luật cố định (deterministic) bắn ra, agent không quyết chuyện có báo hay không. Chỉ tới bước gọi thêm người (escalation), hệ thống mới có hai lối, một lối theo luật cố định và một lối do agent tự đánh giá. Thứ hai, mỗi lần điều tra, Claude đọc trước nhật ký các sự cố đã xử lý, tức một file ghi lại từng sự cố cũ. Nhờ vậy giả thuyết đầu tiên dựa trên những lỗi đã thật sự xảy ra gần đây.

Có một chỗ hay hiểu sai. Nếu bạn chỉ viết "đợi người trực đồng ý rồi mới rollback" vào chỉ dẫn cho Claude thì đó vẫn chỉ là một lời dặn. Lời dặn giúp Claude biết nên làm gì, nhưng không ngăn được nó làm khác, vì lời dặn chỉ nằm trong context và có thể bị quên hoặc bị lời dặn khác đè lên. Việc gì tuyệt đối không được làm thì phải chặn từ bên ngoài hội thoại. Một cách là admin chỉ cấp cho kênh những connection và quyền thật sự cần, như GitHub hay Datadog. Claude dùng service account riêng của kênh chứ không dùng quyền của người đang hỏi, nên quyền của service account đó là giới hạn thật. Cách khác là branch protection hay check bắt buộc trên repo.

## Giảm thiệt hại và rollback

Giờ áp ba câu hỏi triage vào một sự cố cụ thể của hãng. Thứ Năm, lúc 16:00, hãng bật cấu hình v41 cho 100% hội thoại mới cùng lúc, không qua rollout dần. Bản v41 chỉ thêm một dòng vào system prompt để câu trả lời gọn hơn. Mọi chuyện diễn ra như sau.

**Sơ đồ: Không cảnh báo nào kêu, tổng đài biết trước, và tới 17:12 khách vẫn bị trừ nhiều hơn số được báo**

Lỗi cụ thể là thế này. Trên v41, khi khách hỏi đổi chuyến, trợ lý chỉ nêu phí đổi cố định mà quên tiền chênh lệch giá vé. Khách đồng ý theo con số đó, nhưng tool lại trừ đúng tổng thật, tức nhiều hơn số trợ lý vừa báo. Lúc 16:40, tổng đài báo lên kênh `#su-co` rằng đã có 3 khiếu nại, và người trực @Claude để hỏi chuyện gì vừa thay đổi. Lúc 17:05, Claude trả lời rằng v41 là thay đổi duy nhất, và 11 trên 50 hội thoại mẫu báo thiếu tiền. Lúc đó, đội có năm lựa chọn.

| Lựa chọn | Hợp khi | Không giúp khi |
| --- | --- | --- |
| Rollback về bản cấu hình tốt gần nhất | Chất lượng giảm ngay sau một thay đổi của bạn | Sự cố ở phía nhà cung cấp, hoặc model của bản cũ đã ngừng phục vụ |
| Fallback sang model khác, hoặc gọi Claude qua nền tảng khác như Amazon Bedrock | Ngừng dịch vụ, khi `529` hay `5xx` kéo dài trên một model hay nền tảng | Lỗi nằm trong prompt hay tool, vì model dự phòng nhận đúng prompt đó |
| Tắt riêng tool làm việc không hoàn tác được (như trừ tiền) | Câu trả lời sai có thể làm khách mất tiền | Không có tool nào như vậy |
| Thu hẹp tính năng, chuyển cho người | Chưa rõ nguyên nhân, hoặc chưa có bản tốt để quay về | Đội tiếp nhận không đủ người cho lượng chuyển sang |
| Sửa nóng prompt rồi deploy tiếp | Nguyên nhân đã rõ, sửa nhỏ, có eval chạy được trong vài phút | Nguyên nhân mới chỉ là phỏng đoán, và bản sửa chưa qua eval có thể sinh lỗi mới |

Lúc 17:12, người trực đồng ý cho đội làm hai bước. Đầu tiên đội tắt tool đổi chuyến bằng công tắc riêng của tool, vì đó là chỗ khách đang mất tiền, và tắt tool nhanh hơn rollback. Sau đó đội mới rollback flag về v40. Đến 17:40, mẫu 50 hội thoại mới trên v40 không còn ca nào báo thiếu, và đội bật lại tool đổi chuyến. Rollback chỉ chạy suôn nếu hệ thống chuẩn bị sẵn ba điều.

- Model, prompt và định nghĩa tool đi chung một version, nên quay về v40 là quay về đúng tổ hợp đã từng chạy tốt, không phải ghép prompt cũ với tool mới.
- Hội thoại đang dở đi theo version lúc nó bắt đầu. Flag mới chỉ áp cho hội thoại mới, còn hội thoại v41 đang mở được chuyển cho nhân viên. Lý do là nếu hội thoại đang bật thinking, tức Claude suy nghĩ trước khi trả lời, mà bạn đổi `system` hay `tools` giữa chừng, API có thể trả lỗi 400, vì API đòi phần đầu hội thoại phải giữ y như trước (bài 2.3).
- Bản cũ phải còn chạy được. Nếu model của bản cũ đã ngừng phục vụ (retired), mọi request tới nó đều lỗi. Với model phát hành công khai, Anthropic báo trước ít nhất 60 ngày. Trong khoảng đó model ở trạng thái deprecated, tức đã có thông báo sẽ ngừng nhưng vẫn gọi được, và thường kém ổn định hơn model đang active. Giữ bản trước ở trạng thái chạy được là một phần của kế hoạch rollback.

Với ngừng dịch vụ, cách xử lý khác hẳn. Sáng thứ Hai tuần trước, tỉ lệ request bị lỗi `529` (API đang quá tải) lên tới 18% trong 20 phút, dù hãng không đổi gì. Lúc đó rollback cấu hình chẳng giúp được gì. Việc nên làm là để retry có backoff, tức chờ lâu dần giữa các lần thử lại, và fallback tự xử lý như bài 2.1. Hãng cũng ẩn nút trợ lý ở màn hình đổi chuyến, hiện số tổng đài thay vào, rồi theo dõi trang trạng thái của nhà cung cấp.

**Sơ đồ: Lỗi do chính mình đổi thì rollback được, còn khi nhà cung cấp quá tải thì rollback không giúp gì**
- v41 củachính hãng
- rồi
- không đổi gì,529 lên 18%trong 20 phút
- chưa rõnguyên nhân
- Cái gìvừa đổi?
- Đội tắt tool đổi chuyếntrước, vì việc trừ tiềnkhông hoàn tác được
- Đội rollback cả bộcấu hình về v40
- Retry có backoffvà fallback tự xử lý
- Hãng ẩn nút trợ lý,hiện số tổng đài
- Đội thu hẹp tính năng,chuyển cho người

> **Bẫy đề**
>
> Lúc 17:05, đội đã biết v41 là thay đổi duy nhất, và trợ lý báo thiếu tiền ở 11 trên 50 hội thoại mẫu. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Sửa dòng prompt mới rồi deploy v42 ngay**. Nghe nhanh hơn rollback. Nhưng chưa chắc dòng đó là nguyên nhân duy nhất, v42 chưa qua eval, và trong lúc chờ thì tool đổi chuyến vẫn trừ tiền.
> - **Chuyển sang model mạnh hơn**. Nghe như model hiện tại "kém". Nhưng model dự phòng nhận đúng system prompt v41, nên vẫn được dặn trả lời gọn.
> - **Thêm câu "giá cuối cùng hiển thị ở bước thanh toán"**. Nghe như minh bạch hơn. Nhưng khách đã đồng ý theo số trợ lý báo, và tiền vẫn bị trừ.
>
> **Chọn:** tắt tool đổi chuyến, rollback flag về v40, kiểm lại trên một mẫu hội thoại mới, rồi mới đi tìm nguyên nhân.

> **Trong đề chọn gì**
>
> Nếu chất lượng giảm ngay sau một thay đổi của chính bạn, hãy chặn tool đang gây thiệt hại và rollback cả bộ cấu hình trước, rồi mới tìm nguyên nhân. Nếu dịch vụ ngừng vì sự cố phía nhà cung cấp thì rollback không giúp gì, bạn cần retry, fallback và tạm thu hẹp tính năng.

## Báo tin trong sự cố

Trong lúc xử lý sự cố, bạn phải báo tin cho hai nhóm người, và mỗi nhóm cần một cách nói khác.

Trong công ty, cách làm phổ biến là gom mọi trao đổi về sự cố vào một thread duy nhất và giao cho một người cầm trịch. Người đó cập nhật đều đặn, ví dụ mỗi 30 phút hoặc mỗi khi tình hình đổi, và lần nào cũng nói rõ đội đã biết gì, chưa biết gì, bước tiếp theo là gì. Claude Tag đăng được bản tóm tắt theo lịch vào chính thread đó. Đội CI của Anthropic còn dựng một agent tổng hợp tình hình mọi sự cố, chỉ số build và hàng đợi merge thành bản tin, đăng trên một kênh cả công ty đều đọc được. Nhờ vậy kỹ sư khác tự vào xem chứ không phải nhắn hỏi đội trực. Họ cũng phải sửa định dạng bản tin nhiều lần thì người đọc mới thấy dễ dùng.

Với khách, bạn cần nói rõ tác động bằng con số đếm từ dữ liệu, không ước chừng. Ở sự cố này, trong khoảng 16:00–17:12 có 412 khách đổi chuyến qua trợ lý, và 63 người trong số đó bị trừ nhiều hơn số trợ lý báo. Hãng hoàn phần chênh lệch cho 63 khách đó và gửi tin riêng cho từng người. Kể nguyên nhân tới đâu, giải thích gốc lỗi bằng lời thường hay chỉ nói tác động và cách khắc phục, là việc người quyết, không để agent tự chọn. Claude có thể soạn bản nháp và lập danh sách khách từ log của tool. Tuy vậy, chi tiết nội bộ như tên version hay dòng prompt không đưa vào tin gửi khách mà chỉ ghi trong postmortem nội bộ. Bản cuối do người đọc lại và bấm gửi.

Tin gửi khách nên nói thẳng điều khách lo nhất, kể từng lỗi kèm thời gian và phạm vi, rồi nêu việc sẽ thay đổi. Bản postmortem công khai mà Anthropic đăng về ba lỗi hạ tầng tháng 8–9/2025 làm đúng như vậy. Bài còn nói thẳng rằng Anthropic không bao giờ hạ chất lượng model vì nhu cầu sử dụng, giờ trong ngày hay tải hệ thống. Bồi thường cũng nên có. Sau đợt Claude Code kém đi vì ba thay đổi sản phẩm hồi tháng 3–4/2026, Anthropic đặt lại hạn mức sử dụng cho mọi người dùng gói trả phí.

## Biến sự cố thành eval, cảnh báo và postmortem

Rollback xong chưa phải là hết việc. Sự cố chỉ thật sự khép lại khi lần sau lỗi đó bị chặn trước khi tới tay khách. Để làm được vậy, đội cần ba đầu ra, mỗi đầu ra trả lời một câu hỏi.

### Ca eval hồi quy: lần sau eval có bắt được không

Eval hồi quy là bộ ca kiểm thử chạy lại mỗi khi bạn thay đổi cấu hình, để chắc chắn lỗi đã sửa không quay lại. Đội lấy hội thoại của 63 khách bị trừ nhiều (trong đó có 3 người đã khiếu nại) và bỏ hết thông tin cá nhân. Từ đó đội chọn khoảng 30 ca khác nhau về tuyến bay và mức chênh giá, rồi viết mỗi ca kèm một tiêu chí rõ ràng, "báo đủ phí đổi và tiền chênh lệch, khớp số tool trả về".

Để biết bộ ca mới có bắt đúng lỗi không, đội chạy thử nó trên cả hai bản. Trên v41 các ca phải trượt, trên v40 phải qua. Nếu v41 vẫn qua thì các ca chưa bắt được đúng lỗi này. Sau đó đội thêm các ca vào bộ eval hồi quy, và mọi thay đổi cấu hình phải qua bộ này thì mới được bật (bài 5.1). Bạn không cần bộ ca lớn ngay từ đầu. 20–50 ca lấy từ lỗi thật là đủ, và nên ưu tiên ca ảnh hưởng nhiều tới người dùng.

### Giám sát: tín hiệu nào lẽ ra báo trước khiếu nại

Trong sự cố này, tổng đài biết trước mọi dashboard, vì hệ thống không trả về lỗi nào để cảnh báo bắt được. Hãng thêm một phép kiểm cố định (deterministic) chạy trên production. Phép kiểm so số tiền trợ lý nói trong câu trả lời với số tool báo giá trả về trong cùng hội thoại. Nếu trong 15 phút có hơn 2% số lượt báo giá bị lệch, hệ thống bắn cảnh báo. Ngoài phép kiểm đó, đội nên chạy eval liên tục trên một phần hội thoại thật của production, và làm eval đủ nhạy để phân biệt bản chạy đúng với bản đã hỏng. Anthropic cũng cam kết làm việc này sau ba lỗi hạ tầng năm 2025.

### Postmortem: vì sao lọt, và ai làm gì tiếp

Postmortem nên viết theo tinh thần không đổ lỗi (**blameless**), nghĩa là kể hệ thống đã chạy thế nào chứ không tìm xem ai sai. Mỗi mốc trong dòng thời gian lấy từ một tin nhắn hay một cảnh báo có giờ. Những chỗ cần người quyết thì ghi thành câu hỏi mở, ví dụ "tính tác động từ 16:00 (bật v41) hay từ 16:40 (khiếu nại đầu tiên)?", vì hai mốc cho hai số khách khác nhau. Bản postmortem cần tách nguyên nhân gốc, ở đây là dòng prompt bắt trả lời gọn, khỏi các yếu tố góp phần. Yếu tố góp phần ở đây là bật v41 cho tất cả mà không rollout dần, và bộ eval không có ca đổi chuyến nào có chênh lệch giá. Mỗi việc cần làm phải có một người nhận và một hạn chót.

Claude có thể soạn bản nháp đầu tiên từ thread sự cố và template của đội. Nếu được dặn, nó sẽ đánh dấu những chỗ nó không chắc. Bạn cũng có thể đặt lịch để bản nháp có sẵn trước buổi review, khi đó người review chỉ cần đọc và sửa chứ không phải viết từ đầu.

Danh sách việc của hãng khá giống những gì Anthropic cam kết thay đổi sau đợt Claude Code kém đi hồi tháng 3–4/2026. Mỗi thay đổi system prompt đều phải chạy bộ eval trên từng model. Đội làm ablation, tức bỏ từng dòng khỏi system prompt để đo ảnh hưởng của mỗi dòng. Thay đổi nào có thể làm giảm chất lượng thì cho chạy thử một thời gian (soak) rồi rollout dần.

**Sơ đồ: Mỗi đầu ra trả lời một câu hỏi và chặn lỗi ở một chỗ khác nhau trong lần sau**
_Từ sự cố v41 ra bốn đầu ra. Ca eval hồi quy chặn bản lỗi trước khi bật, cảnh báo mới kêu trên production, postmortem giao việc có người nhận, nhật ký sự cố được Claude Tag đọc ở lần điều tra sau_

- **SỰ CỐ**
- **ĐẦU RA VÀ CÂU HỎI NÓ TRẢ LỜI**
- **LẦN SAU CHẶN Ở ĐÂU**
- **Sự cố v41**: 63 khách bị trừ
- nhiều hơn số
- trợ lý báo
- **CA EVAL HỒI QUY**
- **Lần sau eval có bắt được không?**: khoảng 30 ca, v41 trượt và v40 qua
- **CẢNH BÁO MỚI**
- **Tín hiệu nào lẽ ra báo trước?**: hơn 2% lượt báo giá lệch trong 15 phút
- **POSTMORTEM**
- **Vì sao lọt, và ai làm gì tiếp?**: gốc lỗi là dòng prompt bắt trả lời gọn
- **NHẬT KÝ SỰ CỐ**
- **Lần điều tra sau bắt đầu từ đâu?**: gốc lỗi, cách sửa, điều cần nhớ
- **Thay đổi kế tiếp**: Bản lỗi bị chặn
- trước khi bật
- **Production**: Cảnh báo kêu trước
- khiếu nại đầu tiên
- **Danh sách việc**: Mỗi việc có người
- nhận và hạn chót
- **Claude Tag**: Claude đọc nhật ký
- đầu mỗi lần điều tra
- lần sau lỗi đó bị chặn trước khi tới tay khách

Nhật ký sự cố là thứ giúp Claude Tag điều tra giỏi dần lên theo thời gian. Ở Anthropic, mỗi mục ghi chuyện gì xảy ra, nguyên nhân gốc, cách sửa và điều cần nhớ, và Claude tự thêm mục mới sau mỗi sự cố. Họ lưu nhật ký, các skill (file hướng dẫn Claude cách điều tra từng loại lỗi) và chỉ dẫn lâu dài cho Claude trong repo GitHub, nên đội quản lý thay đổi của chúng giống như quản lý code. Trong nhật ký của họ có một dòng đáng nhớ, đại ý là hãy xem số liệu trước rồi mới đặt giả thuyết. Cấu hình chỉ cho biết chỗ nào có thể hỏng, còn số liệu mới cho biết chỗ nào đã thật sự hỏng.

> **Ý chính**
>
> Khi có sự cố, trước tiên hãy hỏi sự cố có thật không, cái gì vừa thay đổi, và nặng tới đâu. Khi rollback, quay về cả bộ cấu hình và giữ sẵn bản cũ còn chạy được. Việc gì không được làm thì chặn bằng phân quyền, đừng chỉ dặn trong prompt. Báo tin cho khách bằng số đếm từ dữ liệu, và để người quyết định kể nguyên nhân tới đâu. Sự cố chỉ khép lại khi có ca eval trượt trên bản hỏng và qua trên bản tốt, một cảnh báo mới, và các việc cần làm đều có người nhận.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Watch monitors and alerts (Claude Tag Docs)](https://claude.com/docs/claude-tag/users/use-cases/watch-monitors)
3. [Proactivity and standing work (Claude Tag Docs)](https://claude.com/docs/claude-tag/users/proactivity)
4. [How Claude Tag works (Claude Tag Docs)](https://claude.com/docs/claude-tag/concepts/how-it-works)
5. [When Claude responds (Claude Tag Docs)](https://claude.com/docs/claude-tag/users/when-claude-responds)
6. [Good habits (Claude Tag Docs)](https://claude.com/docs/claude-tag/users/good-habits)
7. [How Claude Tag serves as Anthropic's first responder for CI/CD failures (Claude Blog)](https://claude.com/resources/articles/ai-ci-cd-on-call)
8. [Errors (Claude API Docs)](https://platform.claude.com/docs/en/api/errors)
9. [Model deprecations (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
10. [An update on recent Claude Code quality reports (Anthropic Engineering)](https://www.anthropic.com/research/april-23-postmortem)
11. [A postmortem of three recent issues (Anthropic Engineering)](https://www.anthropic.com/research/a-postmortem-of-three-recent-issues)
12. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
