---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/5-1-thiet-ke-he-thong-eval
ngay_tai: 2026-11-27
tieu_de: Thiết kế hệ thống eval offline - golden set, regression suite, cổng CI/CD và giữ bộ eval còn đúng
---

Domain 5: Evaluation Engineering and Quality Assurance · Task 5.1

# Thiết kế hệ thống eval offline - golden set, regression suite, cổng CI/CD và giữ bộ eval còn đúng

Dựng golden set và regression suite, chấm agent nhiều lần, đo truy xuất và groundedness, đặt cổng CI/CD, và nhận ra khi bộ eval mất giá trị.

- 18 phút đọc
- Đối chiếu docs 21/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Dựng golden set, tách regression suite với capability suite, viết behavioral check cho cả ca nên làm và ca không nên làm
- Chấm agent khi mỗi lần chạy cho kết quả khác nhau, chọn giữa pass@k và pass^k
- Đưa độ chính xác truy xuất và groundedness vào bộ eval, tách khỏi điểm đúng sai của câu trả lời cuối
- Đặt cổng eval trong CI/CD và tiêu chí release khác nhau cho thay đổi prompt, model và agent
- Nhận ra bộ eval đã mất giá trị vì lộ đáp án, điểm chạm trần hay thiếu loại câu hỏi

Sửa một câu trong system prompt có thể khiến trợ lý trả lời đúng thêm mười câu hỏi nhưng lại sai ba câu khác, và không ai để ý. Muốn bắt được chuyện này, bạn cần một bộ eval, tức một bộ câu hỏi thử có sẵn đáp án, chạy tự động để chấm trợ lý.

Bài này nói về bộ eval offline (**offline evaluation**), tức bộ eval chạy trước khi thay đổi tới tay người dùng. Bạn sẽ thấy bộ eval này cần có gì để chặn được một bản prompt hay model làm hỏng trợ lý, và làm sao biết nó vẫn còn đo đúng sau vài tháng.

Tên task trong đề là **Evaluation System Design**. Nó gồm việc dựng golden set (**golden sets**), regression suite (**regression suites**) và behavioral check (**behavioral checks**), cách chấm agent khi mỗi lần chạy ra kết quả khác nhau, đưa độ chính xác truy xuất (**retrieval precision**) và chỉ số groundedness (**groundedness metrics**) vào bộ eval, đặt cổng eval trong CI/CD (**CI/CD evaluation gates**) và tiêu chí release (**release criteria**). Nó cũng gồm việc giữ bộ eval khỏi lộ đáp án (**contamination**), bão hoà (**saturation**) và thiếu độ phủ (**coverage gaps**).

Phần cơ bản về dựng bộ dữ liệu và chọn cách chấm nằm ở bài 4.2 của CCAR-P. Cách dựng judge, tức dùng một model để chấm điểm thay người, nằm ở bài 5.2.

**Sơ đồ: Mỗi thay đổi qua hai lớp cổng eval rồi mới tới canary, và chỉ ca regression được chặn release**
_Bản đồ bài. Kỹ sư sửa prompt hay model, thay đổi qua smoke eval 30 ca phủ mọi nhóm trên mỗi pull request, đạt thì qua full suite chạy cả golden set khi merge và trước release, đạt thì mới thử canary trên nhóm nhỏ sinh viên. Smoke eval trượt thì không merge, full suite trượt thì không release, cả hai quay về kỹ sư sửa. Trong full suite, ca của regression suite chặn release, ca của capability suite chỉ báo điểm. Golden set có version gồm cách chấm mỗi ca (ca agent chạy nhiều trial, báo bằng pass^k, đo riêng truy xuất, câu trả lời cuối, groundedness), regression suite gồm việc đã làm được và đạt gần 100%, capability suite gồm việc khó điểm thấp, ca ổn định thì chuyển sang regression. Golden set mất giá trị theo ba cách: contamination, saturation, coverage gaps._

- **MỘT THAY ĐỔI QUA HAI LỚP CỔNG CI/CD**
- **Kỹ sư sửa**: prompt, model
- **Smoke eval**: mỗi pull request
- 30 ca, phủ mọi nhóm
- 1. **Full suite**: merge, trước release
- cả golden set
- 2. **Canary**: nhóm nhỏ
- sinh viên
- đạt
- đạt
- đạt
- trượt: không merge
- trượt: không release
- ca chặn release
- ca chỉ báo điểm
- **GOLDEN SET CÓ VERSION**
- **Cách chấm mỗi ca**: ca agent: nhiều trial, pass^k
- đo riêng truy xuất,
- trả lời cuối, groundedness
- **Regression suite**: việc đã làm được
- đạt gần 100%
- **Capability suite**: việc khó, điểm thấp
- ca ổn định thì chuyển
- sang regression
- **BA CÁCH GOLDEN SET MẤT GIÁ TRỊ**
- **Contamination**: lộ đáp án
- **Saturation**: điểm chạm trần
- **Coverage gaps**: thiếu loại câu hỏi

## Ví dụ xuyên suốt: trợ lý học vụ của một trường đại học

Một trường đại học có khoảng 28.000 sinh viên dùng trợ lý học vụ trên cổng thông tin. Trợ lý chạy Claude Sonnet 5.5 qua Messages API và có ba tool. Tool `tra_quy_che` tìm trong quy chế đào tạo và trả về các block `search_result`, tức dạng kết quả tìm kiếm mà Claude trích dẫn lại được. Tool `xem_ket_qua_hoc_tap` đọc bảng điểm. Tool `dang_ky_hoc_phan` ghi đăng ký vào hệ thống của phòng đào tạo.

Hai kỹ sư sửa prompt mỗi tuần một hai lần, và mỗi học kỳ quy chế lại có điều mới. Lúc ra mắt, bộ eval chỉ có 60 câu hỏi do đội tự viết, chạy tay một lần trước khi deploy.

## Golden set, regression suite và capability suite

Tháng 10, một kỹ sư sửa prompt để trợ lý trả lời câu hỏi về học bổng kỹ hơn. Hai tuần sau, phòng đào tạo phát hiện trợ lý trả lời sai số tín chỉ tối thiểu để xét tốt nghiệp. Trong 60 câu có một câu về đúng chuyện này, nhưng không ai chạy lại bộ eval sau lần sửa đó.

**Golden set** là bộ ca thử có đáp án chuẩn do người hiểu nghiệp vụ duyệt, ở đây là chuyên viên phòng đào tạo. Mỗi ca là một câu hỏi cùng đáp án chuẩn của nó. Golden set nằm trong repo như code, có version, có người duyệt khi thêm ca, và được chạy lại sau mọi thay đổi. Mỗi ca ghi ba thứ.

- Đầu vào là câu hỏi của sinh viên, cùng dữ liệu giả của sinh viên đó nếu ca cần gọi tool.
- Đáp án chuẩn là các ý bắt buộc phải có, điều quy chế phải được trích, hoặc kết quả phải thấy trong hệ thống sau khi agent làm xong, ví dụ lớp đã có trong danh sách đăng ký của sinh viên.
- Nhãn nhóm (slice), như học bổng, tốt nghiệp, đăng ký học phần, để đọc điểm theo từng nhóm.

Bạn không cần chờ đủ hàng trăm ca mới bắt đầu. Chỉ 20–50 ca rút từ lỗi thật đã là khởi đầu tốt, và nguồn ca tốt nhất là các ticket sinh viên báo trợ lý trả lời sai. Một ca tốt là ca mà hai chuyên viên chấm riêng vẫn ra cùng kết luận. Ca mơ hồ chỉ làm điểm nhiễu thêm.

Với mỗi ca, đội nên viết sẵn một lời giải mẫu đạt chuẩn rồi cho grader, tức phần chấm tự động, chấm thử. Lời giải mẫu mà bị chấm trượt thì hoặc ca không giải được, hoặc grader cấu hình sai. Nếu phải chọn giữa nhiều ca chấm tự động và ít ca chấm tay thật kỹ, nên chọn nhiều ca chấm tự động.

Từ golden set, đội tách ra hai bộ (suite). **Regression suite** gồm những việc trợ lý đã làm được, dùng để bắt chỗ bị hỏng lại. **Capability suite** gồm những việc khó mà trợ lý chưa làm tốt, dùng để đo nó tiến bộ tới đâu.

|   | Regression suite | Capability suite |
| --- | --- | --- |
| Hỏi | Trợ lý còn làm được những gì nó từng làm được không? | Trợ lý làm được tới đâu với những việc khó? |
| Tỉ lệ đạt mong đợi | Gần 100%, nên chỉ cần một ca tụt là biết có chỗ hỏng | Thấp lúc đầu, vì đây là những việc trợ lý chưa làm tốt |
| Dùng để | Chặn release | Đo tiến bộ, chọn hướng sửa |

Khi một ca trong capability suite đã đạt ổn định, đội chuyển nó sang regression suite. Lúc đó câu hỏi về ca này không còn là "trợ lý làm được chưa?" mà là "trợ lý còn làm được đều không?".

**Behavioral check** là ca kiểm một hành vi cụ thể, và cần có cả ca trợ lý nên làm lẫn ca trợ lý không nên làm. Nếu chỉ có ca trợ lý nên gọi `dang_ky_hoc_phan`, đội sẽ dần chỉnh ra một trợ lý gọi tool đó cả khi sinh viên chỉ hỏi "Học phần này mấy tín chỉ?". Bộ của trường có ca nên đăng ký, ca chỉ hỏi thông tin, ca phải từ chối vì sinh viên chưa học môn tiên quyết. Bộ cũng có các ca biên, tức những đầu vào bất thường dễ làm trợ lý lúng túng, như câu hỏi rỗng, tin nhắn rất dài hay câu hỏi ngoài phạm vi học vụ.

Với ca agent có gọi tool, nên chấm kết quả cuối cùng chứ không chấm đường đi. Chẳng hạn, ca chỉ cần kiểm database thử có bản đăng ký với đúng mã lớp hay không. Đừng bắt agent gọi tool theo đúng một thứ tự cố định, vì agent hay tìm ra cách khác mà vẫn đúng.

## Chấm agent khi mỗi lần chạy ra kết quả khác nhau

Tháng 11, đội thêm 40 ca đăng ký học phần, mỗi ca chạy một lần, và coi từ 35/40 trở lên là đạt. Cùng một commit, chạy lần đầu được 36/40, chạy lần hai chỉ còn 33/40. Code không đổi gì mà lần thì đạt, lần thì trượt.

Output của model khác nhau giữa các lần chạy, nên mỗi ca cần chạy nhiều lần, mỗi lần gọi là một **trial**. Có hai cách gộp kết quả của k trial, và mỗi cách trả lời một câu hỏi khác nhau.

- **pass@k** là xác suất có ít nhất một lần đúng trong k lần. Cách này hợp với việc chỉ cần một lời giải dùng được, ví dụ cho model sinh nhiều phương án rồi lấy phương án qua được test.
- **pass^k** là xác suất cả k lần đều đúng. Agent phục vụ người dùng nên đo bằng cách này, vì sinh viên nào cũng cần đăng ký đúng ngay ở lần của mình. Một ca đúng 90% mỗi lần thì pass^3 chỉ còn khoảng 73% (0,9 × 0,9 × 0,9).

**Sơ đồ: Chạy mỗi ca một lần thì điểm lên xuống, chạy năm trial thì thấy 9 ca không đạt cả năm lần**

✗ _Mỗi ca chạy một lần_
1. 40 ca đăng ký, từ 35/40 trở lên là đạt
   ↓ _cùng một commit, chạy hai lần_
2. **36 rồi 33** Lần đầu qua ngưỡng, lần sau trượt, và đội không biết ca nào yếu

✓ _Mỗi ca chạy năm trial_
1. 200 trial, trợ lý đúng 178 lần (89%)
   ↓ _đếm ca đúng cả năm lần, tức pass^5_
2. **31/40** Đội đọc transcript 9 ca không đạt cả năm lần

Đội chạy lại, mỗi ca năm trial. Trong 200 trial, trợ lý đúng 178 lần (89%), nhưng chỉ 31/40 ca đúng cả năm lần, nên có 9 ca không ổn định. Đội đọc transcript, tức bản ghi đủ mọi lượt gọi model và tool, của 9 ca đó. Trong đó, 4 ca hỏng vì môi trường chứ không vì agent. Các trial dùng chung database thử, trial trước đã đăng ký lớp nên trial sau nhận lỗi "đã đăng ký".

Vì vậy, mỗi trial phải bắt đầu từ một môi trường sạch. Nếu các trial dùng chung thứ gì đó, như file còn sót, dữ liệu cache hay tài nguyên đã bị dùng cạn, thì một nguyên nhân duy nhất có thể làm nhiều trial cùng hỏng. Khi đó năm trial không còn là năm lần thử độc lập, và pass^5 không còn phản ánh đúng agent.

Sai lệch do hạ tầng có thể lớn hơn bạn nghĩ. Trong thử nghiệm của Anthropic trên một benchmark coding, chỉ đổi cấu hình tài nguyên của container đã làm điểm chênh 6 điểm phần trăm. Vì vậy, khi hai bản chỉ chênh nhau vài điểm, bạn chỉ nên tin con số nếu hai lần chạy dùng cùng một môi trường. Ngoài ra, nên đếm riêng lỗi hạ tầng như database thử bị timeout hay container bị kill, đừng gộp chúng vào điểm của agent.

## Đo truy xuất và groundedness trong bộ eval

Tới tháng 12, đội đã thêm 300 ca hỏi đáp quy chế vào golden set. Cùng tháng, đội đổi cách cắt quy chế thành từng đoạn nhỏ (chunk) để tìm kiếm. Trước đây mỗi điều quy chế là một chunk, giờ mỗi chunk dài cố định 400 token. Tỉ lệ trả lời đúng trên 300 ca hỏi đáp chỉ giảm từ 86% xuống 85%, nên bản mới được merge.

Nhìn con số giảm 1 điểm, ai cũng nghĩ thay đổi này vô hại. Nhưng điểm của câu trả lời cuối không cho biết trợ lý tìm đúng điều quy chế hay chỉ đoán trúng. Với trợ lý phải tìm tài liệu rồi mới trả lời, cần đo riêng ba thứ dưới đây. Để code tính được, mỗi ca trong golden set ghi sẵn điều quy chế đúng của nó.

- **Truy xuất** đo xem tool có tìm đúng đoạn quy chế không. **Retrieval precision** cho biết trong các chunk lấy về có bao nhiêu chunk đúng. Recall cho biết trong các chunk đúng có bao nhiêu chunk được lấy về. MRR cho biết chunk đúng đầu tiên nằm ở thứ hạng nào. Bạn lấy 1 chia cho thứ hạng đó rồi tính trung bình trên các ca, càng gần 1 càng tốt. Cách tìm ra lỗi nằm ở tầng nào có trong bài 2.4.
- **Câu trả lời cuối** (end-to-end accuracy) là judge so câu trả lời với đáp án chuẩn.
- **Groundedness** đo xem mỗi ý trong câu trả lời có dựa trên tài liệu lấy về hay không. Tính năng citations của API gắn kèm đoạn trích (`cited_text`) cho từng ý, và API chỉ bảo đảm đoạn trích đó có thật trong tài liệu. API không kiểm đoạn trích có thật sự làm căn cứ cho ý kia không. Vì vậy vẫn cần một judge kiểm từng cặp ý và đoạn trích, cùng một đoạn code kiểm mỗi con số (số tín chỉ, mức điểm) có nằm trong một `cited_text` nào đó không.

**Sơ đồ: Điểm đúng sai gần như đứng yên trong khi truy xuất và groundedness tụt mạnh**
- Câu trả lời cuối
- Judge so vớiđáp án chuẩn
- Đúng trên 300 ca86% → 85%
- Viết câu trả lời
- Claude trả lờikèm cited_text
- Groundedness91% → 74%
- Truy xuất
- tra_quy_che tìmchunk 400 token
- Recall trong5 chunk đầu0,93 → 0,78

Khi đo riêng, đội thấy recall trong 5 chunk đầu tụt từ 0,93 xuống 0,78, và groundedness tụt từ 91% xuống 74%. Claude vẫn trả lời đúng nhiều câu vì quy chế các trường na ná nhau. Nhưng đó là câu đúng nhờ đoán, và sẽ sai ngay khi trường đổi quy chế. Đội thêm vào golden set những ca mà quy chế không có câu trả lời. Đáp án chuẩn của các ca này là trợ lý nói rõ mình không tìm thấy, để đo xem trợ lý có biết nói "không biết" thay vì đoán hay không.

## Cổng CI/CD và tiêu chí release

Sau ba chuyện là sai số tín chỉ tốt nghiệp, 40 ca lúc đạt lúc không, và lần đổi chunk làm tụt groundedness, đội dựng cổng eval trong CI/CD. Cổng là bước chạy eval tự động, không qua thì code không được merge hay release. Cổng của trường có hai lớp.

- **Smoke eval trên mỗi pull request.** Đây là một bộ nhỏ 30 ca, phủ đủ mọi nhóm, chỉ để bắt nhanh những lỗi rõ ràng. Bộ này gửi từng request ngay, không gom lô, vì người mở pull request đang chờ kết quả, và chạy xong trong vài phút. Đội đặt nó thành check bắt buộc (required check) trong branch protection. Nếu không đặt như vậy, check có đỏ thì ai cũng vẫn bấm merge được.
- **Full suite khi merge và trước mỗi release.** Lúc này golden set đã có 400 ca, gồm 60 câu ban đầu, 40 ca đăng ký học phần và 300 ca hỏi đáp, và lớp này chạy đủ cả 400. Chỉ ca thuộc regression suite mới chặn release, còn ca của capability suite chỉ báo điểm. Ca hỏi đáp một lượt và bước judge chấm được gửi qua Message Batches API, tức gửi cả lô để xử lý dần. Không ai ngồi chờ lớp này, và batch có giá bằng một nửa request thường. Ca agent thì khác. Mỗi ca là một vòng lặp nhiều lượt, phải chạy tool rồi gửi tiếp. Mỗi request trong batch được xử lý độc lập nên không làm được việc này, vì vậy đội chạy năm trial bằng request thường.

Tiêu chí release phụ thuộc vào loại thay đổi, vì mỗi loại làm hỏng ở chỗ khác nhau.

| Thay đổi | Chạy thêm | Tiêu chí qua |
| --- | --- | --- |
| Prompt | Smoke eval, rồi full suite | Ca regression nào từ đạt thành trượt đều phải có người xem qua. Không nhóm nào giảm quá ngưỡng đội đặt, và groundedness không giảm |
| Model (thử chuyển sang Claude Haiku 5.5 cho rẻ) | Full suite, capability suite, năm trial cho ca agent, chấm lại cả bản đang chạy trong cùng lần chạy để có mốc so sánh (baseline) | Như thay đổi prompt, cộng thêm pass^5 không giảm, chi phí và độ trễ cho mỗi việc hoàn thành không vượt mức đội chấp nhận. Nếu judge cũng đổi model thì phải hiệu chỉnh lại judge với người chấm |
| Agent (thêm tool, sửa mô tả tool, đổi vòng lặp agent) | Ca agent có trial, behavioral check cả ca nên làm và ca không nên làm | Database thử có đúng các bản đăng ký mà ca yêu cầu. Tỉ lệ gọi tool không cần thiết không tăng, và có người đọc transcript các ca đổi kết quả |

Qua được cổng offline chưa có nghĩa là bật cho toàn bộ sinh viên. Nó chỉ cho phép thử bản mới trên một nhóm nhỏ trước, gọi là canary. Cách rollout từng phần và rollback khi có sự cố nằm ở bài 2.3.

> **Trong đề chọn gì**
>
> Bộ eval dùng để chặn release phải là bộ có tỉ lệ đạt gần 100% (regression suite), để một lần tụt là tín hiệu rõ. Bộ có tỉ lệ đạt thấp (capability suite) dùng để đo tiến bộ. Nếu đem nó làm cổng thì gần như bản nào cũng bị chặn, hoặc đội phải hạ ngưỡng tới mức cổng không còn ý nghĩa.

## Giữ bộ eval còn đúng theo thời gian

Bộ eval cũng cần bảo trì như unit test, và phải có người phụ trách. Sang học kỳ 2, bộ eval của trường mất giá trị theo ba cách cùng lúc.

### Lộ đáp án

Lộ đáp án (contamination) là khi ca trong bộ eval đã lọt vào chỗ trợ lý nhìn thấy được, nên trợ lý đạt vì đã thấy đáp án chứ không vì giỏi hơn. Ở trường, một kỹ sư chép 40 ca khó trong full suite vào system prompt làm ví dụ few-shot. Điểm full suite tăng từ 86% lên 90,5%, và riêng 40 ca đã chép tăng từ 24 ca đúng (60%) lên cả 40 ca (100%).

**Sơ đồ: Gần hết phần điểm tăng thêm nằm ở 40 ca đã chép vào prompt**
_Biểu đồ cột điểm trước và sau khi chép 40 ca vào system prompt làm few-shot, trục dọc từ 0 đến 100%. Riêng 40 ca đã chép, điểm tăng từ 60% (đúng 24 ca) lên 100% (đúng cả 40 ca). Trên 360 ca chưa lộ, điểm chỉ tăng từ 88,9% lên 89,4%. Gộp cả 400 ca, điểm tăng từ 86% lên 90,5%; điểm trước của 400 ca thấp hơn của 360 ca vì 40 ca khó chỉ đạt 60%._

- **60%**
- **100%**
- **88,9%**
- **89,4%**
- **86%**
- **90,5%**: trước
- sau
- trước
- sau
- trước
- sau
- **40 ca đã chép**: vào prompt làm few-shot
- đúng 24 ca, rồi cả 40 ca
- **360 ca chưa lộ**: không ca nào trong prompt
- **Cả 400 ca**: gộp 40 ca và 360 ca
- Cột không tô: trước khi chép. Cột tô màu: sau khi chép; đỏ là điểm có lẫn ca đã lộ.

Ca đã lộ không còn đo được khả năng xử lý câu hỏi mới. Đáp án còn có thể lộ theo đường khác. Chẳng hạn, bộ tài liệu tra cứu có một trang hỏi đáp viết lại từ chính đáp án chuẩn, hoặc agent có web search tìm thấy đáp án đã bị đăng công khai.

BrowseComp là một benchmark đo khả năng tìm thông tin trên web. Trong một lần chạy benchmark này, Anthropic thấy Claude Opus 4.6 gặp đáp án bị lộ trong các bài báo khoa học. Có hai lần, nó còn tự đoán ra mình đang bị kiểm tra, tìm ra đó là benchmark nào rồi giải mã bộ đáp án. Với agent có web search, cách hiệu quả nhất trong lần đó là chặn mọi kết quả search nhắc tới tên benchmark.

Với ứng dụng của bạn, có ba việc hay làm. Thứ nhất, giữ riêng một tập ca (held-out) mà không ai dùng khi chỉnh prompt. Thứ hai, viết code kiểm xem đầu vào nào của bộ eval đã xuất hiện trong prompt hay trong bộ tài liệu tra cứu. Thứ ba, đọc transcript của những ca tự nhiên chuyển sang đạt.

### Bão hoà

Bão hoà (saturation) là khi điểm đã chạm trần. Sau khi có cổng CI/CD, đội viết thêm cho capability suite 60 ca khó, khác với bộ 60 câu lúc ra mắt. Lúc đầu trợ lý chỉ đạt 55%, tới học kỳ 2 đã đạt 97%, và thử Haiku 5.5 cũng được 95%.

Bộ eval có điểm gần 100% vẫn bắt được regression, nhưng không còn cho biết model nào hay bản prompt nào tốt hơn. Khi điểm đã sát trần, một bước tiến lớn cũng chỉ làm điểm nhích lên vài điểm. Đội chuyển 60 ca đó sang regression suite và viết ca khó mới cho capability suite, như câu hỏi kết hợp nhiều điều quy chế, đăng ký khi lớp trùng lịch, ngoại lệ cho sinh viên học lại.

### Thiếu độ phủ

Thiếu độ phủ (coverage gaps) là khi sinh viên hỏi những loại câu mà bộ eval gần như không có. Đội gom chủ đề câu hỏi thật của sinh viên trong tháng (cách gom ở bài 3.3) và thấy 7% hỏi về chuyển ngành và học song ngành, trong khi bộ eval chỉ có 2 ca về chủ đề này.

Ngoài chuyện thiếu ca, còn có chuyện đáp án chuẩn đã cũ. Quy chế học kỳ 2 đổi điều kiện học vượt, nên vài đáp án chuẩn trước đây giờ đã sai. Vì vậy mỗi đáp án chuẩn phải ghi rõ nó theo version quy chế nào, và được cập nhật mỗi khi quy chế đổi. Mỗi tháng, đội so tỉ lệ từng chủ đề trong câu hỏi thật của sinh viên với tỉ lệ trong bộ eval, và chuyển ticket báo sai thành ca mới.

> **Bẫy đề**
>
> Sau khi chép 40 ca vào few-shot, điểm full suite tăng từ 86% lên 90,5%. Có ba cách đọc nghe hợp lý nhưng sai.
>
> - **Điểm tăng nên prompt mới tốt hơn, release** (_the eval score improved, ship it_). Cách đọc này có vẻ dựa trên số liệu. Nhưng trên 360 ca chưa lộ, điểm chỉ tăng từ 88,9% lên 89,4%, và phần tăng thêm là do trợ lý chép lại đáp án nó đã thấy.
> - **Xoá 40 ca đó khỏi bộ eval cho sạch** (_drop the leaked cases_). Làm vậy trông như gỡ được chỗ lộ. Nhưng đó là những ca khó nhất, chỗ trợ lý hay sai nhất. Xoá xong mà không viết ca khó mới cùng chủ đề thì bộ eval mất luôn mảng khó nhất.
> - **Lấy 90,5% làm mốc mới** để so các bản sau (_re-baseline on the new score_). Nghe như cập nhật mốc cho đúng hiện trạng. Nhưng mốc đó bị thổi phồng, vì bản nào giữ 40 ví dụ few-shot cũng trông tốt hơn bản bỏ chúng đi.
>
> **Chọn:** coi 40 ca đã lộ là tập dùng khi phát triển prompt chứ không dùng để chấm nữa, viết ca mới cùng chủ đề cho bộ eval, lấy điểm trên phần chưa lộ, và thêm vào CI bước kiểm ca eval có lọt vào prompt không.

> **Ý chính**
>
> Golden set có version và chạy lại sau mọi thay đổi. Mỗi ca agent chạy nhiều trial, trial nào cũng bắt đầu từ môi trường sạch, và kết quả báo bằng pass^k. Truy xuất, câu trả lời cuối và groundedness phải đo riêng. Bộ eval mất giá trị khi đáp án lộ, khi điểm chạm trần và khi sinh viên hỏi những loại câu mà bộ eval không có.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Define success criteria and build evaluations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
4. [Quantifying infrastructure noise in agentic coding evals (Anthropic Engineering)](https://www.anthropic.com/research/infrastructure-noise)
5. [Eval awareness in Claude Opus 4.6's BrowseComp performance (Anthropic Engineering)](https://www.anthropic.com/research/eval-awareness-browsecomp)
6. [Evals in production - CI, batch, and drift (Claude Academy, Introduction to evals)](https://academy.claude.com/courses/introduction-to-evals/evals-in-production)
7. [Retrieval augmented generation (Claude Cookbook)](https://platform.claude.com/cookbook/capabilities-retrieval-augmented-generation-guide)
8. [Search results (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/search-results)
9. [Citations (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/citations)
10. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
