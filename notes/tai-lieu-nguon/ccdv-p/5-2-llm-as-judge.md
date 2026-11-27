---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/5-2-llm-as-judge
ngay_tai: 2026-11-27
tieu_de: LLM-as-judge - rubric, thiên lệch, hiệu chỉnh với nhãn của người và độ trôi giữa các version model
---

Domain 5: Evaluation Engineering and Quality Assurance · Task 5.2

# LLM-as-judge - rubric, thiên lệch, hiệu chỉnh với nhãn của người và độ trôi giữa các version model

Dựng judge có rubric rõ, kiểm thiên lệch vị trí và độ dài, đo mức khớp với nhãn của người, chỉ cho judge chặn release khi đã hiệu chỉnh xong.

- 16 phút đọc
- Đối chiếu docs 21/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Biết phần nào chấm bằng code, phần nào giao cho judge, phần nào cần người
- Viết rubric và định dạng kết quả để judge chấm ổn định, có lối thoát khi không đủ thông tin
- Nhận ra những kiểu judge hay chấm lệch (thích câu đứng trước, thích câu dài, chấm dễ cho câu do chính model mình viết) và cách kiểm soát
- Đo mức khớp giữa judge và nhãn của người, hiểu vì sao tỉ lệ khớp thô có thể đánh lừa
- Giữ judge đáng tin khi đổi version model, và chỉ giao quyền chặn release sau khi đã hiệu chỉnh

Khi bộ eval có hàng trăm câu trả lời dạng văn bản tự do, không ai đọc hết được sau mỗi lần sửa prompt. Cách phổ biến là nhờ một model khác chấm, gọi là **LLM-as-judge**, gọn là judge. Nhưng judge cũng là model nên cũng chấm sai, và thường sai lặp đi lặp lại theo cùng một kiểu, chẳng hạn lần nào cũng cho câu dài điểm cao hơn. Một judge chấm sai còn nguy hiểm hơn không có judge, vì nó cho cả đội cảm giác mọi thứ đang tốt lên.

Bài này giúp bạn biết judge của mình có đáng tin không, và từ lúc nào thì được để judge tự quyết bản prompt mới có được merge hay không. Bài gọi quyền này là quyền chặn release, và gọi bước chạy judge tự động trước khi merge là cổng.

Tên task trong đề là **LLM-as-Judge Engineering**. Nó gồm việc phân tích chất lượng của judge so với dữ liệu người đã gắn nhãn (**human-labeled data**). Nhãn ở đây là kết quả đạt hay không đạt do người chấm gán cho từng câu trả lời. Task gồm hiệu chỉnh (**calibration**), soạn rubric (**rubric design**), thiên lệch và hiệu ứng vị trí (**bias and position effects**), mức khớp giữa những người chấm (**inter-rater reliability**), và độ trôi của judge khi đổi version model (**judge drift across model versions**).

**Sơ đồ: Judge chỉ được chặn release sau khi có rubric, đã kiểm thiên lệch và đủ khớp với người chấm**
_Bản đồ bài, năm bước từ chọn cách chấm tới giao quyền chặn release, và vòng quay lại hiệu chỉnh khi đổi model của judge_

- 1. **Chọn cách chấm**: code, judge hay người
- phần nào giao cho judge
- partial credit từng phần
- 2. **Rubric và schema**: rubric design
- pass, fail hay unknown
- verdict và explanation
- 3. **Kiểm thiên lệch**: position bias
- thiên lệch độ dài
- tự chấm bài của mình
- 4. **Hiệu chỉnh**: calibration
- so với nhãn của người
- inter-rater, Cohen's kappa
- 5. **Chặn release**: gating authority
- trước đó judge chỉ báo cáo
- pin model ID của judge
- **Đổi model judge**: judge drift
- điểm đổi dù không ai sửa
- deprecated rồi retired
- quay lại hiệu chỉnh, chấm lại bản đang chạy để lấy mốc mới

## Ví dụ xuyên suốt: trợ lý hỗ trợ của một phần mềm quản lý kho

Một công ty làm phần mềm quản lý kho dạng SaaS có trợ lý trả lời ticket kỹ thuật của khách, như lỗi đồng bộ tồn kho giữa các chi nhánh hay cách cấu hình máy quét mã vạch. Trợ lý chạy Claude Sonnet 5.5 và tra cứu bộ tài liệu hướng dẫn của sản phẩm.

Mỗi lần sửa system prompt, pipeline CI chạy bộ eval gồm 400 ticket cũ trên mỗi pull request. Với mỗi ticket, một judge đặt câu trả lời của bản prompt mới cạnh câu của bản đang chạy rồi chọn câu tốt hơn. Bản mới chỉ được merge khi thắng ít nhất một nửa số cặp. Judge cũng dùng Claude Sonnet 5.5, với prompt chỉ một câu "Câu trả lời nào hữu ích hơn?". Ticket khó thì do kỹ sư hỗ trợ trực ticket xử lý.

Ba tháng sau, bản prompt nào cũng qua cổng, nhưng tỉ lệ khách mở lại ticket không giảm. Đội bắt đầu nghi judge không đo đúng thứ họ quan tâm.

## Phần nào giao cho judge

Trước khi sửa judge, nên xem phần nào của câu trả lời thật sự cần tới judge. Với mỗi phần, hãy chọn cách chấm nhanh nhất mà vẫn đáng tin khi chạy trên hàng trăm câu. Có ba cách chấm.

| Cách chấm | Mạnh | Yếu |
| --- | --- | --- |
| Bằng code (khớp chính xác, chứa cụm từ, chạy test) | Nhanh nhất, ổn định nhất | Không chấm được những thứ cần phán đoán |
| Bằng model (judge) | Nhanh, linh hoạt, chấm được câu trả lời tự do | Chấm lại cùng một câu có thể ra kết quả khác, và phải so với người chấm trước khi tin |
| Bằng người | Chất lượng cao nhất, sát với chuyên gia | Chậm, đắt, khó có đủ chuyên gia |

Trong thực tế, phần nào so khớp được thì để code chấm. Judge chỉ nhận phần văn bản có nhiều cách diễn đạt đúng. Những ca hiếm mà sai thì hậu quả lớn thì để người chấm. Với trợ lý quản lý kho, mã lỗi và link tới đúng trang tài liệu được chấm bằng code, các bước hướng dẫn giao cho judge, còn ticket liên quan tới mất dữ liệu do kỹ sư hỗ trợ xem. Khi câu trả lời gồm nhiều phần, nên cho điểm từng phần (**partial credit**) thay vì chấm cả câu là đạt hay trượt.

## Viết rubric cho judge

Quay lại chuyện bản nào cũng qua cổng mà ticket mở lại không giảm. Đội lấy 50 cặp judge đã chấm ra đọc lại, và thấy câu trả lời dài, nhiều gạch đầu dòng gần như luôn thắng, kể cả khi sai một bước hướng dẫn.

Một phần nguyên nhân là prompt "Câu trả lời nào hữu ích hơn?" quá mơ hồ. Judge cần một rubric, tức bảng tiêu chí ghi rõ thế nào thì đạt, thế nào thì trượt. Không có rubric, judge chấm mỗi lúc một kiểu và tự lấy những thứ dễ thấy nhất như độ dài hay cách trình bày làm tiêu chí. Một judge chấm ổn định cần sáu điều.

- Rubric ghi thẳng thế nào là đạt, thế nào là không đạt, kể cả những lỗi khiến câu trả lời trượt ngay.
- Kết quả phải đếm được, tức đạt hoặc không đạt, hay một thang điểm có định nghĩa cho từng mức. Nếu judge chỉ viết nhận xét chung chung, bạn không cộng lại thành số liệu để so hai bản prompt được.
- Kết quả theo schema. Bạn dùng structured outputs, tức gửi kèm một JSON schema để response bắt buộc khớp với nó. Field `verdict` để code đếm, field `explanation` để người đọc hiểu vì sao judge chấm như vậy.
- Judge có một lối thoát là trả `unknown` khi không đủ thông tin để chấm. Không có lựa chọn này, judge buộc phải đoán đạt hoặc trượt.
- Judge được suy nghĩ trước khi chấm, bằng cách bật thinking, tức tính năng cho Claude suy luận từng bước trước khi trả lời. Với tiêu chí cần phán đoán phức tạp, cách này giúp judge chấm tốt hơn.
- Mỗi tiêu chí được chấm trong một lần gọi riêng, thay vì bắt một judge chấm cùng lúc độ đúng, độ đủ và giọng điệu.

Áp vào trợ lý quản lý kho, đội bỏ câu "Câu trả lời nào hữu ích hơn?" và viết rubric riêng cho tiêu chí "các bước hướng dẫn", chấm từng câu trả lời là đạt hay không đạt, như sau.

```
Tiêu chí: các bước hướng dẫn
- Đạt: mọi bước đều có trong tài liệu đi kèm, đúng thứ tự, đủ để khách tự làm theo.
- Không đạt: có ít nhất một bước không có trong tài liệu, hoặc thiếu bước khiến khách không làm tiếp được.
- Unknown: tài liệu đi kèm không nói về chức năng khách hỏi.
Độ dài và cách trình bày không phải tiêu chí của mục này.
```

Kết quả của judge phải khớp với schema sau, để code đọc được field `verdict` mà đếm.

```json
{
  "type": "object",
  "properties": {
    "explanation": { "type": "string" },
    "verdict": { "type": "string", "enum": ["pass", "fail", "unknown"] }
  },
  "required": ["explanation", "verdict"]
}
```

Judge không cần đáp án mẫu. Nó nhận ticket, câu trả lời và các trang tài liệu liên quan, rồi đối chiếu từng bước với tài liệu. Nhờ vậy, câu trả lời nào đúng nhưng diễn đạt khác cũng không bị trừ điểm.

## Thiên lệch của judge

Rubric đã rõ mà judge vẫn có thể chấm lệch, tức nghiêng về một kiểu câu trả lời bất kể đúng sai. Những kiểu lệch này gọi chung là thiên lệch và hiệu ứng vị trí. Bảng sau là ba kiểu hay gặp.

| Thiên lệch | Biểu hiện | Cách kiểm soát |
| --- | --- | --- |
| Thiên lệch vị trí (**position bias**) | Khi so hai câu trả lời, judge hay chọn câu đứng ở một vị trí nhất định nhiều hơn hẳn người chấm | Đổi thứ tự ngẫu nhiên, hoặc chấm hai lần với thứ tự đảo ngược |
| Thiên lệch độ dài | Câu dài, trình bày đẹp được điểm cao dù sai | Rubric ghi rõ độ dài không phải tiêu chí, và so kết quả của judge với người chấm riêng cho nhóm câu dài |
| Thiên lệch tự chấm bài của mình | Judge chấm dễ hơn cho câu do chính model của nó viết | Dùng model khác với model viết câu trả lời để chấm |

Cột cách kiểm soát là những cách làm hay dùng khi dùng LLM làm judge.

Đội quản lý kho dính đúng thiên lệch tự chấm bài của mình, vì judge và trợ lý cùng chạy Claude Sonnet 5.5. Cách chữa đơn giản nhất là cho judge chạy một model khác với trợ lý.

Thiên lệch vị trí xuất hiện khi judge đặt hai câu trả lời cạnh nhau để chọn câu tốt hơn, đúng như cách judge của đội đang so bản prompt mới với bản đang chạy. Muốn biết judge có bị lệch kiểu này không, bạn cho nó chấm cùng một cặp hai lần, lần sau đảo thứ tự. Đội quản lý kho thử với một cặp, câu A ngắn và đúng, câu B dài nhưng sai bước thứ ba.

**Sơ đồ: Đảo thứ tự thì judge đổi ý, vậy là nó chấm theo vị trí chứ không theo nội dung**

• _Lần 1_
1. A đúng đứng trước, B sai đứng sau
   ↓ _judge chọn câu tốt hơn_
2. **Chọn A** judge chọn câu đứng trước

• _Lần 2_
1. B sai đứng trước, A đúng đứng sau
   ↓ _judge chọn câu tốt hơn_
2. **Chọn B** judge chọn câu sai vì nó đứng trước

Hai lần chấm ra hai kết quả trái nhau, nên cặp này coi như hoà, không tính cho câu nào. Chỉ khi cả hai lần đều chọn A thì A mới thật sự thắng. Nếu nhiều cặp đổi kết quả khi đảo thứ tự, judge này chưa đủ tin để làm cổng.

> **Trong đề chọn gì**
>
> Một câu hỏi mẫu Anthropic công bố cho kỳ thi này kể về một judge so câu trả lời của bản prompt mới với câu của bản đang chạy. Bản prompt nào cũng qua cổng, nhưng chất lượng thực tế không tăng. Khi so với người chấm, judge chỉ cho cùng kết quả ở hơn một nửa số cặp, và chọn câu đứng trước nhiều hơn hẳn người. Việc làm **đầu tiên** là **đổi thứ tự ngẫu nhiên, đo lại mức khớp với nhãn của người, và rút quyền chặn release của judge cho tới khi mức khớp chấp nhận được** (**withhold gating authority until agreement is acceptable**).

## Hiệu chỉnh judge với nhãn của người

Hiệu chỉnh là cho judge và người chấm cùng chấm một mẫu, so hai kết quả, rồi sửa rubric hay prompt của judge cho tới khi hai bên đủ khớp. Bạn chỉ nên tin judge sau bước này. Khi kết quả đã ổn định, người chỉ cần thỉnh thoảng xem lại. Với trợ lý quản lý kho, đội hiệu chỉnh judge theo bốn bước.

1. Đội lấy một mẫu đủ đa dạng, gồm 200 câu trả lời thật, trải đều các loại ticket, có câu dài câu ngắn, có câu đúng câu sai.
2. Hai kỹ sư chấm độc lập trước. Mức khớp giữa hai người chấm (**inter-rater reliability**) thường được coi là mức trần, vì judge được so với nhãn của người. Nếu chính hai người còn chấm vênh nhau nhiều thì judge khó khớp với họ hơn thế. Khi đó lỗi nằm ở rubric hoặc ở chính ticket, và phải sửa những chỗ này trước. Một cách thử dễ nhớ là ticket nào hai kỹ sư chấm độc lập vẫn ra cùng kết luận thì mới đáng giữ trong bộ eval.
3. Hai kỹ sư bàn lại những câu chấm vênh và chốt một nhãn chung. Sau đó đội cho judge chấm cùng 200 câu rồi so với nhãn chung.
4. Đội đọc từng chỗ judge vênh với người, xem judge sai vì rubric mơ hồ, vì thiếu thông tin, hay vì thiên lệch. Tìm ra nguyên nhân rồi thì đội sửa rubric và chạy judge lại trên cùng mẫu.

Con số dễ tính nhất là tỉ lệ khớp thô, tức phần trăm số câu mà judge và người cho cùng kết quả. Nhưng chỉ nhìn con số này thì dễ bị đánh lừa. Trong 200 câu, người chấm 170 câu đạt và 30 câu không đạt. Một judge lười, câu nào cũng chấm đạt, vẫn khớp với người 85% mà không bắt được câu sai nào. Còn đây là kết quả thật của judge đội đang dùng, đặt cạnh nhãn của người.

|   | Người chấm đạt | Người chấm không đạt |
| --- | --- | --- |
| Judge chấm đạt | 164 | 10 |
| Judge chấm không đạt | 6 | 20 |

Tỉ lệ khớp thô là (164 + 20) / 200 = 92%. Nghe cao, nhưng có hai con số khác quan trọng hơn.

- **Mức khớp sau khi trừ phần khớp do may rủi.** Hệ số Cohen's kappa, một thước đo thống kê chuẩn, cho biết judge khớp với người hơn mức may rủi bao nhiêu. Người chấm đạt 170 trên 200 câu (0,85), judge chấm đạt 174 trên 200 câu (0,87). Nếu hai bên chấm bừa theo đúng tỉ lệ đó, họ vẫn tình cờ khớp khoảng 0,85 × 0,87 + 0,15 × 0,13 ≈ 0,76. Kappa so phần khớp vượt mức may rủi (0,92 − 0,76) với phần tối đa có thể vượt (1 − 0,76), ra khoảng 0,67. Kappa bằng 1 là khớp hoàn toàn, bằng 0 là không hơn chấm bừa. Judge lười câu nào cũng chấm đạt có kappa bằng 0.
- **Số câu sai bị judge cho qua.** Khi judge làm cổng, lỗi nguy hiểm nhất là chấm đạt cho một câu sai. Ở đây người chấm 30 câu không đạt, nhưng judge cho qua 10 câu, tức một phần ba số câu sai lọt cổng.

**Sơ đồ: Khớp thô 92% nghe cao, nhưng kappa chỉ khoảng 0,67 và 10 trên 30 câu sai vẫn lọt cổng**
_Bảng 2×2 so judge với nhãn chung của người trên 200 câu, cạnh đó là cách tính khớp thô, khớp do may rủi, kappa và số câu sai lọt cổng_

- **Người chấm**: đạt
- không đạt
- **Judge chấm**: đạt
- **Judge chấm**: không đạt
- **164**: cùng chấm đạt
- **10**: câu sai
- lọt cổng
- **6**: câu đúng
- bị đánh trượt
- **20**: cùng chấm
- không đạt
- Người chấm đạt 170, không đạt 30
- Judge chấm đạt 174 trên 200 câu
- **Khớp thô 92%**: (164 + 20) / 200
- **Judge lười vẫn khớp 85%**: câu nào cũng chấm đạt, kappa bằng 0
- **Khớp do may rủi ≈ 0,76**: 0,85 × 0,87 + 0,15 × 0,13
- **Cohen's kappa ≈ 0,67**: (0,92 − 0,76) / (1 − 0,76)
- **10 trên 30 câu sai lọt cổng**: judge cho qua một phần ba số câu sai

Không có ngưỡng kappa nào dùng chung cho mọi đội. Mỗi đội tự đặt mức đủ khớp, thường lấy mức khớp giữa hai người chấm làm mốc. Nên xem thêm kết quả tách theo nhóm (loại ticket, độ dài câu trả lời), vì judge có thể khớp tốt ở mức trung bình nhưng lệch hẳn ở một nhóm. Chuyện câu dài, nhiều gạch đầu dòng được điểm cao dù sai chỉ lộ ra khi tách riêng nhóm câu dài.

> **Bẫy đề**
>
> Quay lại câu hỏi mẫu về judge so bản prompt mới với bản đang chạy. Judge hay chọn câu đứng trước, nên bản prompt nào cũng qua cổng. Có ba cách sửa nghe hợp lý nhưng sai.
>
> - **Đổi judge sang model lớn hơn** (_a stronger judge model will agree with humans more_). Nghe hợp lý vì model mạnh thường chấm tốt hơn. Đổi model để judge không tự chấm bài của mình là chuyện khác. Ở đây vấn đề là thiên lệch vị trí, và chưa ai đo model lớn hơn có khớp với người chấm hơn không, nên đổi model chưa chứng minh được gì.
> - **Đổi sang chấm điểm tuyệt đối theo rubric** để judge không thấy hai câu cạnh nhau (_switch to absolute scoring_). Cách này trông như né được thiên lệch vị trí, và có thể giúp về sau. Nhưng judge chấm kiểu mới vẫn phải được so với người chấm trước khi đội tin nó.
> - **Hạ ngưỡng qua cổng** cho nhạy hơn (_lower the pass threshold_). Làm vậy có vẻ bắt được những cải thiện nhỏ. Nhưng judge còn lệch thì hạ ngưỡng chỉ làm cổng dễ dãi hơn.
>
> **Chọn:** đổi thứ tự ngẫu nhiên, đo lại mức khớp với người chấm, và chưa cho judge quyền chặn release cho tới khi khớp đủ.

## Khi nào cho judge chặn release, và làm gì khi đổi model của judge

Trong thời gian chưa hiệu chỉnh xong, judge chỉ nên báo cáo. Kết quả của judge hiện trong pull request, nhưng người quyết định có merge hay không. Khi mức khớp đã đạt ngưỡng đội đặt, judge mới được chặn merge tự động. Sau đó cổng mới lại chạy bộ 400 ticket trên mỗi pull request và chặn merge khi bản mới kém hơn.

Đã cho judge chặn release thì phải giữ cho cách chấm của nó không đổi, bằng cách pin version model của judge. Pin nghĩa là ghi cứng một model ID cụ thể cho judge. Mỗi model ID của Claude ứng với một snapshot, tức một bản model cố định không bị cập nhật ngầm. Điều này đúng cả với những ID không kèm ngày phát hành, từ thế hệ 4.6 trở đi. Vì vậy, chừng nào còn giữ nguyên ID, judge vẫn là cùng một bản model và không bị trôi vì model đổi ngầm, dù mỗi lần chấm vẫn có thể lệch nhẹ.

Nhưng có lúc bạn phải đổi sang model khác, vì muốn nâng cấp hoặc vì model cũ không còn được khuyên dùng (**deprecated**) rồi tắt hẳn (**retired**). Khi đó cách chấm cũng đổi theo, và đây là độ trôi của judge giữa các version model. Khi đội thử đổi judge sang model mới hơn, tỉ lệ đạt của cùng bộ câu trả lời cũ tăng thêm 8 điểm phần trăm, dù không ai sửa gì.

**Sơ đồ: Judge mới cho cùng bộ câu trả lời cũ thêm 8 điểm phần trăm, nên phải lấy mốc mới bằng judge mới**
- mốc của judge cũ
- mốc mới
- Judge mới cho bộ câu cũtỉ lệ đạt cao hơn8 điểm phần trămdù không ai sửa gì
- Bản prompt mớiso với mốc nào?
- Đội tưởng bản mới tốt hơndù phần tăng là do judge
- Đội chấm lại bản đang chạybằng judge mới rồi mới so

Đổi model của judge giống như đổi cây thước. Có thước mới thì phải đo lại cả vật cũ trước khi so. Cụ thể, đội cần làm bốn việc.

- Chạy lại bộ hiệu chỉnh 200 câu với judge mới trước khi cho nó chặn release.
- Chấm lại bản prompt đang chạy bằng judge mới để có mốc so sánh mới.
- Lên kế hoạch đổi judge ngay khi model đang dùng bị deprecated, vì sau ngày model bị retire, mọi request gửi tới nó đều báo lỗi.
- Khi trợ lý chuyển sang model khác, nên thêm vào bộ hiệu chỉnh một số câu do model mới viết và nhờ người chấm những câu này. Lý do là model mới có thể viết dài hơn hoặc trình bày khác, đúng chỗ judge dễ chấm lệch.

Ngoài ra, judge cần được kiểm lại định kỳ. Người chấm lại một mẫu nhỏ các câu judge đã chấm và đọc các câu bị chấm trượt. Bạn cũng nên theo dõi tỉ lệ `unknown`, vì tỉ lệ này tăng thì có thể tài liệu đang thiếu, hoặc judge đang né chấm. Không tự đọc kết quả của nhiều lần chạy thì bạn không thể biết judge có chấm đúng hay không. Còn việc mỗi đêm cho judge chấm một mẫu câu trả lời thật trên production để phát hiện chất lượng tụt dần thì nằm ở bài 5.3.

> **Ý chính**
>
> Muốn tin judge, bạn cần rubric rõ có lối thoát `unknown`, và cho judge chạy model khác với model của trợ lý. Bạn cũng cần kiểm judge có thích câu đứng trước hay câu dài không, và so nó với người chấm bằng kappa chứ đừng chỉ nhìn tỉ lệ khớp thô. Chưa hiệu chỉnh xong thì chưa cho judge chặn release. Đổi model của judge thì hiệu chỉnh lại và chấm lại bản đang chạy để lấy mốc mới.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Define success criteria and build evaluations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
4. [Build a minimum viable eval (Claude Academy, Introduction to evals)](https://academy.claude.com/courses/introduction-to-evals/build-a-minimum-viable-eval)
5. [Evals in production - CI, batch, and drift (Claude Academy, Introduction to evals)](https://academy.claude.com/courses/introduction-to-evals/evals-in-production)
6. [Structured outputs (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
7. [Models overview (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/overview)
8. [Model deprecations (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
