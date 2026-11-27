---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-2-few-shot
ngay_tai: 2026-11-27
tieu_de: Dùng few-shot để kết quả nhất quán
---

Domain 4: Prompt Engineering & Structured Output · Task 4.2

# Dùng few-shot để kết quả nhất quán

Khi hướng dẫn chi tiết vẫn cho kết quả mỗi lần một kiểu, vài ví dụ mẫu chọn kỹ giúp Claude giữ định dạng, phán đoán đúng ca mập mờ và bớt bịa khi trích dữ liệu.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 2 nguồn

## Đọc xong bạn nắm được

- Biết khi nào thêm ví dụ hiệu quả hơn viết thêm hướng dẫn
- Viết vài ví dụ nhắm đúng ca mập mờ, kèm lý do chọn cách này thay vì cách khác
- Dùng ví dụ để cố định định dạng output và phân biệt mẫu code chấp nhận được với lỗi thật
- Dùng ví dụ để trích đúng từ tài liệu có cấu trúc khác nhau, bớt bỏ trống và bớt bịa số

Few-shot (**few-shot prompting**), còn gọi là multishot, là cách đưa vào prompt vài ví dụ mẫu: đầu vào thế này thì đầu ra thế kia. Thay vì tả bằng lời kết quả đúng trông thế nào, bạn cho Claude xem tận mắt.

Bài này giúp bạn nhận ra lúc nào nên thêm ví dụ thay vì viết thêm hướng dẫn, và chọn ví dụ thế nào cho trúng. Bạn sẽ dùng ví dụ để giữ định dạng, để dạy Claude phán đoán ở ca mập mờ, để bớt báo nhầm khi review code, và để trích đúng dữ liệu từ những tài liệu trình bày mỗi nơi một kiểu.

**Sơ đồ: Hướng dẫn chỉ tả bằng lời, ví dụ cho Claude xem tận mắt: bốn việc ví dụ làm được mà quy tắc không**
_Bản đồ bài: prompt có hướng dẫn chi tiết nhưng một mình vẫn cho kết quả lộn xộn; thêm vài ví dụ few-shot chọn kỹ giúp bốn việc: giữ định dạng nhất quán bằng cặp đầu vào và đầu ra hoàn chỉnh, phán đoán ca mập mờ nhờ ví dụ kèm lý do, cố định khuôn review và bớt báo sai nhờ cặp ví dụ báo và không báo, trích đúng từ tài liệu có cấu trúc khác nhau và bớt bịa số đo không chính thức_

- **PROMPT**
- **Hướng dẫn chi tiết**: detailed instructions
- một mình vẫn lộn xộn
- thêm ví dụ thay quy tắc
- **Ví dụ few-shot**: few-shot examples
- vài ví dụ chọn kỹ,
- nhắm đúng chỗ đang sai,
- cho Claude xem tận mắt
- **Giữ định dạng nhất quán**: consistently formatted, actionable output
- cặp đầu vào và đầu ra hoàn chỉnh
- **Phán đoán ca mập mờ**: ambiguous-case handling, novel patterns
- ví dụ kèm lý do chọn, áp cho câu mới
- **Khuôn cố định, bớt báo nhầm**: location, issue, severity, suggested fix
- cặp báo và không báo, bớt false positives
- **Trích từ tài liệu khác kiểu**: varied document structures
- bớt null, bớt bịa số đo không chính thức

## Ví dụ xuyên suốt: xử lý hồ sơ bồi thường bảo hiểm sức khoẻ

Một công ty bảo hiểm sức khoẻ ở Đà Nẵng nhận khoảng 1.500 hồ sơ bồi thường mỗi tuần, gồm hoá đơn viện phí, giấy ra viện và đơn thuốc chụp từ nhiều bệnh viện khác nhau. Đội công nghệ có 6 dev, anh Sơn là trưởng nhóm. Nhi phụ trách pipeline dùng Claude để trích dữ liệu từ hồ sơ ra JSON qua tool use. Đội còn có một trợ lý chat tra cứu hợp đồng và hồ sơ cho khách, và một bot review code cho chính repo của đội.

## Khi hướng dẫn chi tiết vẫn cho kết quả mỗi lần một kiểu

Pipeline của Nhi trích field `chan_doan` từ giấy ra viện. Prompt đã có hơn 30 dòng quy tắc: viết tên bệnh theo tiếng Việt, tách mã bệnh theo chuẩn ICD ra một field riêng, không viết tắt. Vậy mà kết quả vẫn mỗi lần một kiểu: lúc "Viêm phổi", lúc "VP cộng đồng (J18.9)", có lần để trống dù giấy ra viện ghi rõ chẩn đoán.

Nhi không thêm quy tắc nữa mà đưa vào prompt hai cặp đầu vào và đầu ra hoàn chỉnh. Mỗi cặp là một đoạn giấy ra viện thật (đã che tên bệnh nhân) và JSON đúng mong muốn, đặt trong thẻ `<example>` để Claude tách được ví dụ khỏi hướng dẫn.

```xml
<examples>
  <example>
    <input>Chẩn đoán ra viện: VP cộng đồng (J18.9). Điều trị 5 ngày.</input>
    <output>{"chan_doan": "Viêm phổi cộng đồng", "ma_icd": "J18.9", "so_ngay_dieu_tri": 5}</output>
  </example>
  <example>
    <input>Ra viện ngày 12/10. Bệnh chính: sốt xuất huyết Dengue có dấu hiệu cảnh báo.</input>
    <output>{"chan_doan": "Sốt xuất huyết Dengue có dấu hiệu cảnh báo", "ma_icd": null, "so_ngay_dieu_tri": null}</output>
  </example>
</examples>
```

Từ lần chạy sau, Claude viết `chan_doan` theo cùng một kiểu, và gần như không còn bỏ trống. Khi chỉ có hướng dẫn chi tiết mà kết quả vẫn lộn xộn (**detailed instructions alone produce inconsistent results**), cách hiệu quả nhất là thêm ví dụ mẫu (**few-shot examples**). Nhờ có ví dụ, output nhất quán, đúng định dạng và dùng được ngay (**consistently formatted, actionable output**). Ví dụ cho Claude thấy kết quả đúng trông thế nào, còn quy tắc chỉ tả lại điều đó bằng lời. Lời tả trừu tượng như "giải thích sâu hơn cho người đã quen" để Claude tự hiểu thế nào là sâu hơn. Ví dụ cho từng mức thì cho thấy khác biệt cụ thể về từ vựng và độ sâu, nên Claude có mẫu để bám suốt một cuộc trò chuyện dài. Ví dụ nên sát với việc thật, và đủ khác nhau để Claude không bắt chước một chi tiết tình cờ, như chép luôn số ngày điều trị của ví dụ.

> **Bẫy đề**
>
> Hệ thống trích mô tả sản phẩm ra JSON có schema rõ, nhưng field "materials" lúc là "cotton blend", lúc "Cotton/Polyester mix", có lúc bỏ trống dù nguồn ghi rõ chất liệu. Cách hiệu quả nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Chuyển sang model mạnh hơn** (_a stronger model tier_). Nghe như vấn đề nằm ở năng lực. Nhưng model không biết cách viết chuẩn mà bạn muốn, và model mạnh hơn cũng không tự đoán ra điều đó.
> - **Đặt temperature bằng 0** (_temperature 0_). Cách này làm kết quả ít ngẫu nhiên hơn. Có điều nó chỉ cố định một cách viết nào đó, không phải cách viết đã chuẩn hoá mà bạn cần.
> - **Đổi field "materials" thành bắt buộc trong schema** (_make the field required_). Nghe như chặn được chuyện bỏ trống. Ngặt nỗi bắt field phải có giá trị không dạy được model viết giá trị đó cho thống nhất.
>
> **Chọn:** thêm 2–3 cặp đầu vào và đầu ra hoàn chỉnh, cho thấy đúng cách viết chất liệu đã chuẩn hoá. Các ví dụ cũng cho thấy field này luôn phải có giá trị khi nguồn có ghi.

> **Trong đề chọn gì**
>
> Nếu đề kể field `skills: string[]` gặp ba lỗi cùng lúc, hãy chọn thêm ví dụ few-shot. Lỗi thứ nhất, cụm "Python and SQL" lúc giữ nguyên, lúc bị tách làm hai. Lỗi thứ hai, kỹ năng tài liệu chỉ ngầm nhắc tới vẫn bị đưa vào. Lỗi thứ ba, có kết quả chỉ 5 mục, có kết quả hơn 40 mục. Ví dụ cho thấy cách xử lý cụm ghép, thế nào thì tính là kỹ năng được ghi rõ, và mỗi mục nên chi tiết tới đâu. Thêm bước chuẩn hoá sau khi trích chỉ dọn lại kết quả, không sửa cách trích. Thêm ràng buộc "tối đa 10–20 kỹ năng, mỗi mục một kỹ năng, chỉ lấy kỹ năng nêu rõ" vẫn là lời dặn: con số thì tuỳ ý, còn hai quy tắc kia không cho Claude thấy cụm ghép tách ra sao. Mở rộng schema thêm `confidence` và `source_quote` chỉ ghi thêm metadata, không làm cách trích nhất quán hơn.
>
> Nếu đề kể một trợ lý có system prompt dài tả bằng lời cách điều chỉnh câu trả lời theo trình độ người học, và cuộc trò chuyện càng dài thì trợ lý càng bỏ qua phần này, hãy chọn thay đoạn mô tả bằng vài ví dụ few-shot, mỗi ví dụ là một câu trả lời đúng cho một trình độ. Ví dụ cho thấy khác biệt cụ thể về từ vựng và độ sâu, nên Claude có mẫu để bám. Chèn system message nhắc lại sau mỗi vài tin nhắn, gọi API thêm một lần để chấm câu trả lời rồi sinh lại nếu chưa đạt, hay đặt phần quy tắc thành một mục ngay trước lịch sử hội thoại đều giữ nguyên lời mô tả trừu tượng.

## Ví dụ cho ca mập mờ, kèm lý do

Trợ lý chat của công ty có hai tool: `tra_hop_dong` đọc điều khoản và hạn mức của hợp đồng, `tra_ho_so` đọc tình trạng các hồ sơ bồi thường đã nộp. Khách hỏi "Tôi còn được chi trả bao nhiêu?", và trợ lý lúc gọi tool này, lúc gọi tool kia. Câu hỏi này mập mờ vì số tiền còn lại phụ thuộc cả hạn mức trong hợp đồng lẫn số tiền đã chi trong các hồ sơ trước.

**Sơ đồ: Số còn lại cần cả hai tool: gọi một tool thì chỉ có một vế của phép trừ**
- chỉ gọi tool này
- Tôi còn đượcchi trả bao nhiêu?
- tra_hop_donghạn mức năm
- tra_ho_sosố đã chi trong năm
- Trả hạn mức đầy đủ,khách tưởng còn nguyên
- Số còn lại =hạn mức − đã chi
- Biết số đã chi,không biết hạn mức

Đội thêm vào prompt của trợ lý vài ví dụ nhắm đúng những câu mập mờ như vậy. Mỗi ví dụ không chỉ ghi tool nào được gọi, mà còn ghi lý do chọn tool đó thay vì cách khác cũng nghe hợp lý (**reasoning for why one action was chosen over plausible alternatives**).

```
Khách: "Tôi còn được chi trả bao nhiêu?"
Gọi: tra_hop_dong, rồi tra_ho_so.
Lý do: Số còn lại = hạn mức năm trong hợp đồng trừ số đã chi trong năm.
Chỉ gọi tra_hop_dong thì trả hạn mức đầy đủ, khách tưởng còn nguyên.
Chỉ gọi tra_ho_so thì biết số đã chi nhưng không biết hạn mức năm là bao nhiêu.

Khách: "Hồ sơ nằm viện tháng 9 của tôi tới đâu rồi?"
Gọi: tra_ho_so.
Lý do: Khách hỏi tình trạng một hồ sơ đã nộp, điều khoản hợp đồng không trả lời được.
```

Ví dụ có lý do giúp Claude phán đoán ở ca mập mờ (**ambiguous-case handling**), như chọn tool cho một yêu cầu mập mờ (**tool selection for ambiguous requests**). Lý do còn quan trọng hơn bản thân lựa chọn. Nhờ thấy cách suy luận, Claude áp được cùng phán đoán cho những câu hỏi chưa có trong ví dụ (**generalize judgment to novel patterns**), chứ không chỉ khớp đúng các câu đã liệt kê sẵn (**matching only pre-specified cases**). Chẳng hạn khách hỏi "Năm nay tôi còn khám răng được không?" thì Claude cũng biết phải tra cả hợp đồng lẫn hồ sơ. Nếu bạn bật thinking (cho Claude suy nghĩ từng bước trước khi trả lời), ví dụ viết theo trình tự vấn đề, cách làm, kết quả còn định hướng luôn cách Claude suy nghĩ.

Bot review code của đội cần kiểu ví dụ này cho một ca mập mờ khác: hàm đã có test, nhưng một nhánh `if` bên trong chưa test nào chạy tới (**branch-level test coverage gaps**). Một ví dụ chỉ ra nhánh nào cần báo và vì sao, nên Claude xét tới từng nhánh chứ không dừng ở chỗ hàm đã có file test.

Có một chỗ đề thi và tài liệu prompting hiện nay của Anthropic vênh nhau về số ví dụ. Trong đề, con số là 2–4 ví dụ nhắm đúng ca mập mờ (**2–4 targeted few-shot examples**), còn tài liệu hiện nay khuyên 3–5 ví dụ. Cả hai cùng muốn nói rằng vài ví dụ chọn kỹ, trong đó có ví dụ rơi đúng vào chỗ Claude đang sai, thì tốt hơn nhiều ví dụ dàn trải. Khi đi thi, chọn theo con số của đề.

> **Bẫy đề**
>
> Bộ phân loại review của khách gặp khó ở các ca mập mờ như mỉa mai hay cảm xúc lẫn lộn. Bạn quyết định dùng few-shot. Nên làm thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Đưa 8–10 ví dụ để phủ kín mọi nhãn cảm xúc** (_cover every label_). Nghe như càng nhiều càng chắc. Nhưng ví dụ dàn trải cho mọi nhãn không nhắm vào đúng chỗ đang sai là câu mỉa mai.
> - **Không dùng few-shot, viết system prompt giải thích thật kỹ thế nào là mỉa mai** (_describe sarcasm in detail_). Cách này nghe kỹ lưỡng. Có điều giải thích dài đến mấy cũng không cho Claude thấy cách phán đoán ở một câu mỉa mai cụ thể.
> - **Đưa đúng 1 ví dụ là một review tích cực bình thường để cố định định dạng JSON** (_one plain example_). Một ví dụ có vẻ đủ để giữ khuôn JSON. Ngặt nỗi ví dụ đó không dạy gì về ca mập mờ.
>
> **Chọn:** đưa 2–4 ví dụ, trong đó có ít nhất một ví dụ nhắm đúng ca mập mờ như câu mỉa mai.

## Ví dụ cố định định dạng và phân biệt mẫu code chấp nhận được

Bot review code của đội có hai vấn đề. Bot viết comment mỗi lần một kiểu: có comment không nói lỗi nằm ở dòng nào, có comment không gợi ý cách sửa. Và khoảng 35% phát hiện bị dev đánh dấu là báo nhầm. Phần lớn số báo nhầm rơi vào khối `except Exception` (bắt mọi loại lỗi) ở lớp bắt lỗi ngoài cùng (**error boundary**), tức các hàm nơi API nhận request. Ở đó đội cố ý bắt mọi lỗi để ghi log rồi raise lại.

Anh Sơn thêm vào prompt hai ví dụ. Ví dụ thứ nhất là một chỗ bắt mọi lỗi bằng `except Exception` mà bot cần báo, ví dụ thứ hai là chỗ dùng được phép, và ví dụ nào cũng mở bằng kết luận. Ví dụ nên báo có đủ bốn phần của khuôn output: vị trí, vấn đề, mức nghiêm trọng, cách sửa (**location, issue, severity, suggested fix**).

```
Code:
    try:
        luu_ho_so(ho_so)
    except Exception:
        pass
Kết luận: BÁO.
Vị trí: xu_ly_ho_so.py:88
Vấn đề: Nuốt mọi lỗi khi lưu hồ sơ, hồ sơ mất mà không ai biết.
Mức: Cao
Cách sửa: Bắt lỗi cụ thể của tầng lưu trữ, ghi log và báo lỗi cho người gọi.

Code:
    try:
        return xu_ly_request(req)
    except Exception:
        logger.exception("Lỗi chưa xử lý ở API nhận hồ sơ")
        raise
Kết luận: KHÔNG BÁO.
Lý do: Đây là lớp bắt lỗi ngoài cùng, ghi log rồi raise lại. Đội cố ý dùng mẫu này.
```

Ví dụ có khuôn cố định cho Claude thấy mỗi phát hiện phải có đủ bốn phần, nên comment nhất quán hơn hẳn so với chỉ dặn bằng lời. Cặp ví dụ báo và không báo cho Claude thấy ranh giới giữa mẫu code chấp nhận được và lỗi thật (**acceptable code patterns from genuine issues**). Claude bớt báo nhầm (**reduce false positives**) ở những chỗ đội cố ý dùng mẫu này, mà vẫn bắt được khối `except` thật sự nguy hiểm ở những file chưa từng có trong ví dụ (**enabling generalization**).

**Sơ đồ: Thiếu ví dụ, bot báo cả except cố ý; cặp ví dụ báo và không báo vạch ra ranh giới**

✗ _Chưa có ví dụ cho except bắt mọi lỗi_
1. Bot gặp except Exception ở điểm nhận request ngoài cùng
   ↓ _không phân biệt nuốt lỗi với ghi log rồi raise lại_
2. Báo cả những chỗ đội cố ý dùng mẫu này
3. **35%** phát hiện bị đánh là báo nhầm, phần lớn ở khối này

✓ _Cặp ví dụ BÁO và KHÔNG BÁO_
1. Ví dụ BÁO có đủ vị trí, vấn đề, mức, cách sửa
   ↓ _Claude thấy ranh giới: nuốt lỗi, hay ghi log rồi raise lại_
2. Bỏ qua chỗ cố ý, vẫn bắt except nguy hiểm ở file mới

> **Bẫy đề**
>
> Khoảng 35% phát hiện của bot review code là báo nhầm, theo các mẫu lặp lại: gợi ý style trái quy ước của nhóm, cảnh báo bảo mật cho mẫu vốn an toàn trong bối cảnh của bạn, gợi ý tối ưu hiệu năng mà làm code chạy tệ hơn với cách dùng thực tế. Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Viết một bản đặc tả đầy đủ mọi mẫu không nên báo rồi đưa hết vào system prompt** (_exhaustive spec_). Nghe như phủ được hết. Nhưng liệt kê từng trường hợp thì không bao giờ đủ, và Claude không học được ranh giới để áp cho code mới.
> - **Lọc phát hiện chứa từ như "convention", "context-dependent", "trade-off"** (_keyword filter_). Cách này chặn được một ít báo nhầm. Có điều lọc theo từ khoá cũng chặn luôn phát hiện đúng có chứa các từ đó.
> - **Thêm "be conservative", "only flag definite issues"** (_be conservative_). Nghe như bớt báo nhầm. Ngặt nỗi lời dặn về độ tự tin không nói mẫu nào là chấp nhận được, và dặn thêm "có thể cố ý" thì Claude vẫn không biết mẫu nào là cố ý.
>
> **Chọn:** thêm ví dụ few-shot gồm các đoạn code có chú thích, phân biệt mẫu chấp nhận được với vấn đề thật ở từng nhóm: style, bảo mật và hiệu năng.

> **Trong đề chọn gì**
>
> Nếu đề kể bot review báo rất nhiều chỗ dùng một mẫu code, chẳng hạn khối `except` bắt mọi lỗi, mà phần lớn là chỗ cố ý ở lớp bắt lỗi ngoài cùng, hãy chọn thêm vào prompt hai ví dụ của mẫu này: một chỗ nên báo, một chỗ được phép, mỗi ví dụ ghi rõ kết luận. Nâng ngưỡng tự tin để mỗi file chỉ báo một phát hiện là lọc theo độ tự tin, không theo đúng sai. Tắt việc kiểm ở những file bị báo nhiều nhất thì mất luôn chỗ sai thật trong các file đó. Quy tắc chỉ báo khi mẫu xuất hiện hơn ba lần dựa trên một con số chẳng liên quan gì tới chuyện mẫu đó có được phép hay không.

## Ví dụ cho tài liệu có cấu trúc khác nhau

Quay lại pipeline của Nhi. Claude trả kết quả qua tool use với một JSON schema chặt, nên JSON không còn lỗi cú pháp. Nhưng khoảng 5% kết quả có `tong_chi_phi` bằng `null` hoặc `danh_sach_thuoc` là mảng rỗng, dù hồ sơ có ghi đủ. Nhi kiểm ngẫu nhiên một số hồ sơ và thấy lỗi xuất phát từ cách mỗi bệnh viện trình bày giấy tờ. Bệnh viện này để tổng chi phí trong bảng ở cuối hoá đơn, bệnh viện kia ghi trong một câu ở phần thanh toán. Đơn thuốc lúc là bảng có cột liều dùng, lúc là đoạn văn bác sĩ viết tay rồi chụp lại.

**Sơ đồ: Cùng một field nằm mỗi bệnh viện một chỗ: có ví dụ cho từng kiểu thì Claude mới tìm ra**
_Hoá đơn viện phí có tong_chi_phi lúc trong bảng ở cuối hoá đơn, lúc trong một câu ở phần thanh toán; đơn thuốc có danh_sach_thuoc lúc là bảng có cột liều dùng, lúc là đoạn văn viết tay chụp lại. Chưa có ví dụ cho từng kiểu thì khoảng 5% kết quả có tong_chi_phi null hoặc danh_sach_thuoc rỗng dù hồ sơ ghi đủ; có ví dụ cho từng kiểu trình bày thì Claude biết đi tìm field ở đâu_

- **HOÁ ĐƠN VIỆN PHÍ: CÙNG MỘT FIELD, HAI CHỖ**: Tổng trong bảng cuối
- Tổng cộng
- **tong_chi_phi**: Tổng trong một câu
- Thanh toán:
- **ĐƠN THUỐC: CÙNG MỘT FIELD, HAI KIỂU**: Bảng có cột liều dùng
- Thuốc
- Liều dùng
- **danh_sach_thuoc**: Đoạn văn viết tay
- **Chưa có ví dụ cho từng kiểu**: tong_chi_phi null, danh_sach_thuoc rỗng
- khoảng 5% kết quả, dù hồ sơ ghi đủ
- **Mỗi kiểu trình bày một ví dụ**: Claude biết đi tìm field ở đâu,
- không bỏ trống khi field ở chỗ lạ

Nhi thêm ví dụ trích đúng từ từng kiểu trình bày: một hoá đơn có tổng ở bảng, một hoá đơn có tổng nằm trong câu, một đơn thuốc dạng bảng và một đơn thuốc dạng đoạn văn. Ví dụ cho Claude thấy tài liệu có cấu trúc khác nhau (**varied document structures**) thì cùng một field có thể nằm ở những chỗ khác nhau, nên Claude biết đi tìm ở đâu thay vì để trống khi không thấy đúng chỗ quen. Thêm ví dụ trích đúng từ tài liệu nhiều định dạng như vậy chính là cách chữa chuyện field bắt buộc bị rỗng hay null (**empty/null extraction of required fields**).

Đơn thuốc còn một kiểu lỗi khác. Bác sĩ hay ghi liều theo lối nói thường, không có số đo cụ thể, như "ngày 2 lần, mỗi lần nửa viên" hay "uống khi đau". Lúc đó Claude hoặc tự quy ra một con số mg không có trong đơn, hoặc để trống field. Nhi thêm một ví dụ cho thấy cách làm đúng: chép nguyên văn cách ghi liều vào `lieu_dung`, không quy đổi, không bỏ. Ví dụ few-shot giảm được chuyện bịa số (**reducing hallucination in extraction tasks**) ở những chỗ ghi không chính thức như vậy (**informal measurements**).

> **Bẫy đề**
>
> Sau khi dùng tool use với schema chặt, JSON không còn lỗi cú pháp. Nhưng 5% kết quả vẫn có mảng rỗng hoặc null ở các field bắt buộc như citations và methodology, dù tài liệu có ghi, chỉ là ở nhiều dạng: trích dẫn trong câu hay danh mục tài liệu cuối bài (**inline citations vs bibliographies**), phương pháp ở mục riêng hay lẫn trong phần mở đầu (**methodology sections vs embedded details**). Cách hiệu quả nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Dựng tầng hậu xử lý bằng regex tìm mẫu trích dẫn và từ khoá rồi điền vào field rỗng** (_regex post-processing_). Nghe như vá được chỗ thiếu. Nhưng regex chỉ bắt được dạng bạn đoán trước, mà chỗ hỏng chính là các dạng khác nhau.
> - **Đổi citations và methodology thành tuỳ chọn, đánh dấu bản ghi thiếu để review tay** (_make fields optional_). Làm vậy thì bước kiểm tra hết báo lỗi. Có điều dữ liệu có trong tài liệu vẫn không được trích ra.
> - **Retry khi thấy field bắt buộc bị rỗng** (_retry on empty fields_). Nghe như cho model thêm cơ hội. Ngặt nỗi model chưa biết tìm ở những dạng khác, nên gửi lại cùng prompt vẫn ra kết quả rỗng.
>
> **Chọn:** thêm ví dụ few-shot trích từ các tài liệu có cấu trúc khác nhau, chỉ cách nhận ra trích dẫn ở nhiều dạng và tìm chi tiết phương pháp ở nhiều loại mục.

> **Trong đề chọn gì**
>
> Nếu đề hỏi kỹ thuật prompt nào cho output nhất quán khi tài liệu có cấu trúc rất khác nhau, như trích dẫn trong câu với danh mục cuối bài, hay phương pháp ở mục riêng với chi tiết lẫn trong bài, hãy chọn ví dụ few-shot minh hoạ cách trích đúng từ từng định dạng. Hook `PreToolUse` (đoạn code tự chạy trước mỗi lần Claude gọi tool) không chuẩn hoá được tài liệu trước khi tài liệu vào context. Tạo một subagent riêng cho mỗi loại tài liệu là dựng thêm cả một tầng kiến trúc cho việc mà vài ví dụ đã làm được. Chỉ dựa vào JSON schema chặt và tránh ví dụ thì schema chỉ giữ khuôn, không dạy model tìm thông tin ở đâu.
>
> Nếu đề kể người review đã sửa 847 kết quả, và 23% số lần sửa là do lượng nguyên liệu ghi kiểu "a handful" (một nắm) hay "a splash" (một chút) bị Claude bịa thành con số hoặc bỏ trống, hãy chọn thêm ví dụ few-shot cho thấy cách trích nguyên văn cách ghi đó. Fine-tune trên 847 kết quả là quá nặng tay cho một mẫu lỗi đã rõ. Pattern matching để tự điền giá trị vẫn phải đoán số. Thêm field enum `measurement_type` chỉ gắn nhãn, không cho biết phải ghi gì vào field số lượng.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 4.2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Prompting best practices, Use examples effectively (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
