---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-5-nguoi-duyet-va-do-tin-cay
ngay_tai: 2026-11-27
tieu_de: Thiết kế quy trình người duyệt và hiệu chỉnh độ tin cậy
---

Domain 5: Context Management & Reliability · Task 5.5

# Thiết kế quy trình người duyệt và hiệu chỉnh độ tin cậy

Vì sao con số chính xác tổng che lỗi, cách hiệu chỉnh điểm tin cậy từng field bằng tập có nhãn, lấy mẫu phân tầng, và dồn người duyệt vào ca khó.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Hiểu vì sao độ chính xác tổng có thể che kết quả kém ở một loại tài liệu hay một field
- Kiểm tra độ chính xác theo loại tài liệu và field trước khi bớt người duyệt
- Cho Claude xuất điểm tin cậy từng field, rồi hiệu chỉnh ngưỡng duyệt bằng tập có nhãn
- Lấy mẫu ngẫu nhiên phân tầng các kết quả điểm cao để đo tỉ lệ lỗi và bắt kiểu lỗi mới
- Dồn người duyệt vào field điểm thấp và tài liệu mơ hồ hay mâu thuẫn

Hệ thống trích xuất chạy một thời gian, có người duyệt lại từng kết quả. Rồi tới lúc ai cũng muốn bớt việc duyệt: "đúng 97% rồi, cho chạy tự động đi". Quyết định đó cần nhiều dữ liệu hơn một con số trung bình.

Bài này giúp bạn thiết kế quy trình người duyệt (**human review workflow**) và hiệu chỉnh độ tin cậy (**confidence calibration**). Bạn sẽ biết vì sao phải tách độ chính xác theo từng loại tài liệu và từng field. Bạn cũng sẽ biết cách dựa vào dữ liệu thật để chọn ngưỡng cho điểm tin cậy Claude tự chấm, cách tiếp tục đo lỗi sau khi đã tự động hoá, và loại kết quả nào vẫn phải đưa người duyệt xem.

**Sơ đồ: Ngưỡng đã hiệu chỉnh chia phần đi thẳng và phần cần người duyệt; mẫu mỗi tuần theo dõi phần đi thẳng**
_Bản đồ bài. Trên cùng: trước khi tự động hoá, kiểm tra theo loại tài liệu và field, không chỉ nhìn con số tổng. Claude trích xuất kèm điểm tin cậy từng field. Code so điểm với ngưỡng đã hiệu chỉnh bằng tập có nhãn. Field dưới ngưỡng, hoặc tài liệu nguồn mơ hồ hay mâu thuẫn, thì đưa người duyệt. Field điểm cao ở nhóm đã kiểm tra và đạt thì đi thẳng. Từ phần đi thẳng, mỗi tuần lấy mẫu ngẫu nhiên phân tầng cho người duyệt, để đo tỉ lệ lỗi và bắt kiểu lỗi mới_

- **Trước khi tự động hoá: kiểm tra theo loại tài liệu và field, không chỉ số tổng**
- **Claude trích**: mỗi field kèm
- điểm tin cậy
- **Code so ngưỡng**: ngưỡng từng field,
- hiệu chỉnh bằng tập có nhãn
- **Người duyệt**: field dưới ngưỡng,
- hoặc tài liệu mơ hồ,
- mâu thuẫn
- **Đi thẳng**: điểm cao, ở nhóm đã
- kiểm tra và đạt
- **MỖI TUẦN: MẪU NGẪU NHIÊN PHÂN TẦNG TỪ PHẦN ĐI THẲNG**: mỗi nhóm loại tài liệu và field có đủ mẫu riêng; người duyệt đo tỉ lệ lỗi
- của phần điểm cao và bắt kiểu lỗi mới chưa ai nghĩ tới

## Ví dụ xuyên suốt: trích hồ sơ vay mua nhà ở một ngân hàng

Trung tâm xử lý hồ sơ vay của một ngân hàng ở Thanh Hoá nhận khoảng 3.000 bộ hồ sơ vay mua nhà mỗi tháng. Mỗi bộ có ba loại giấy tờ: hợp đồng mua bán căn hộ, giấy chứng nhận quyền sử dụng đất và sao kê lương. Một tool trích xuất dùng Claude để lấy các field như bên bán, giá mua, số thửa, diện tích, chủ sở hữu và thu nhập hằng tháng, rồi chuyển sang hệ thống thẩm định khoản vay, từ đây gọi là hệ thống phía sau.

Chị Vân là trưởng nhóm vận hành, quản lý 12 thẩm định viên. Tùng là dev phụ trách pipeline trích xuất. Ba tháng qua, các thẩm định viên đóng vai người duyệt, xem lại toàn bộ kết quả Claude trích trước khi dữ liệu sang hệ thống phía sau. Việc này chiếm gần hết thời gian của họ, trong khi việc chính là thẩm định khoản vay.

## Con số tổng có thể che một nhóm rất kém

Mỗi field Claude trích ra đều kèm một điểm tin cậy từ 0 tới 1, do Claude tự chấm xem mình chắc tới đâu. Tùng đối chiếu ba tháng kết quả với bản đã duyệt. Tính gộp mọi loại giấy tờ, những field có điểm trên 0,9 đúng 97%. Ban giám đốc đề xuất cho các kết quả điểm cao đi thẳng sang hệ thống phía sau, bỏ bước duyệt.

Trước khi làm, Tùng tách con số đó theo loại tài liệu và theo field. Hợp đồng mua bán chiếm khoảng một nửa số kết quả điểm cao và đúng 99%. Sao kê lương chiếm khoảng 35% và đúng 98%. Giấy chứng nhận chỉ chiếm 15% và đúng 86%. Một số giấy chứng nhận có thêm trang biến động, tức trang ghi lại việc tách thửa hay đổi diện tích. Trên những giấy này, field diện tích chỉ đúng 71%, vì Claude hay lấy diện tích ở trang đầu thay vì con số mới nhất ở trang biến động.

**Sơ đồ: Con số tổng 97% che một nhóm chỉ đúng 71%: diện tích trên giấy chứng nhận có trang biến động**
- Tổng
- Hợp đồng
- Sao kê
- Giấy chứng nhận
- Diện tích có trang biến động
- 98
- 96
- 94
- 92
- 90
- 88
- 86
- 84
- 82
- 80
- 78
- 76
- 74
- 72
- Độ chính xác (%)

Đó là rủi ro của con số tổng (**aggregate accuracy metrics (e.g., 97% overall) may mask poor performance on specific document types or fields**). Hợp đồng và sao kê vừa nhiều vừa dễ nên kéo trung bình lên cao, còn nhóm vừa ít vừa khó thì chìm mất trong con số chung. Nếu cho tự động theo con số 97%, cứ khoảng ba bộ hồ sơ có trang biến động thì một bộ mang diện tích sai sang hệ thống phía sau, và không ai xem lại.

Vì vậy, trước khi tự động hoá các kết quả điểm cao, bạn cần kiểm tra độ chính xác theo từng loại tài liệu và từng nhóm field, chẳng hạn diện tích trên giấy chứng nhận (**validating accuracy by document type and field segment before automating high-confidence extractions**). Chỉ nhóm nào đạt mới nên bớt người duyệt (**analyzing accuracy by document type and field to verify consistent performance across all segments before reducing human review**). Tùng đề xuất cho hợp đồng và sao kê đi thẳng, còn giấy chứng nhận vẫn qua người duyệt cho tới khi sửa được lỗi diện tích.

Để những con số này đáng tin, hồ sơ Tùng dùng để đo phải có tỉ lệ các loại giấy tờ giống hồ sơ thật gửi tới, kể cả những ca hiếm và khó. Riêng những ca mà chính các thẩm định viên còn bất đồng thì phải chốt nhãn đúng sai trước khi đưa vào bộ đo, vì nhãn mơ hồ làm nhiễu số đo.

> **Bẫy đề**
>
> Hệ thống đã chạy 3 tháng, và người duyệt xem lại toàn bộ kết quả. Các kết quả có điểm tin cậy trên 0,9 (đề có thể ghi 90%) đúng 97% tính gộp, và đội vận hành định tự động hoá phần này. Nên làm gì trước? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Chạy thử hai tuần, cho 25% kết quả điểm cao đi thẳng xuống hệ thống phía sau rồi theo dõi báo lỗi** (_pilot first_). Nghe thận trọng vì chỉ thử một phần. Nhưng lỗi đã chảy xuống hệ thống phía sau, và báo lỗi thường về muộn.
> - **Kiểm tra xem 97% có đủ cho mọi hệ thống phía sau dùng dữ liệu này không** (_check downstream needs_). Nghe như hỏi đúng người dùng dữ liệu. Có điều câu hỏi vẫn xoay quanh con số gộp, trong khi một nhóm có thể kém hơn nhiều.
> - **So độ chính xác ở các ngưỡng 85%, 90%, 95% để tìm điểm cắt tối ưu** (_tune the threshold_). Nghe như tối ưu bằng số liệu. Ngặt nỗi mỗi ngưỡng vẫn chỉ cho một con số gộp, nên nhóm kém vẫn bị che.
>
> **Chọn:** phân tích độ chính xác theo loại tài liệu và theo field, để chắc kết quả điểm cao tốt ở mọi nhóm chứ không chỉ khi tính gộp.

> **Trong đề chọn gì**
>
> Đề thi thường gọi Claude là "model", nên các đáp án dưới đây giữ cách gọi đó.
>
> Nếu đề kể bộ đánh giá tự động báo độ chính xác tổng 96%, mà người dùng phàn nàn có nhiều lỗi ở hợp đồng phức tạp, hãy chọn theo dõi độ chính xác riêng theo loại tài liệu và theo nhóm field. Đáp án chuyển sang Message Batches API chỉ đổi cách gửi request, không đo thêm được gì. Đáp án tăng cỡ mẫu ngẫu nhiên tổng thể thì vẫn ra một con số gộp, chỉ chính xác hơn. Đáp án chạy đánh giá trong một hook PreToolUse cũng không đo gì theo nhóm.

## Điểm tin cậy từng field, hiệu chỉnh bằng tập có nhãn

Điểm tin cậy cho từng field đã có sẵn trong JSON trích xuất (**having models output field-level confidence scores**). Tùng muốn dùng điểm này để quyết định field nào cần người xem.

Nhưng điểm Claude tự chấm chưa cho biết field đó thật sự đúng bao nhiêu phần trăm. Điểm 0,9 ở field này có thể đúng 99%, ở field khác chỉ đúng 80%. Vì vậy phải hiệu chỉnh, tức đối chiếu điểm với những kết quả đã biết đúng sai, để biết mỗi mức điểm ứng với tỉ lệ đúng thật là bao nhiêu. Tùng lấy 1.200 bộ hồ sơ mà thẩm định viên đã xác nhận đúng sai từng field làm tập có nhãn (**labeled validation set**). Với mỗi field, Tùng chia kết quả theo khoảng điểm rồi đếm xem ở mỗi khoảng Claude đúng thật bao nhiêu phần trăm.

| Field | Tỉ lệ đúng thật khi điểm từ 0,9 tới 1,0 | Ngưỡng để đi thẳng |
| --- | --- | --- |
| Thu nhập hằng tháng (sao kê) | 99% | từ 0,9 |
| Giá mua (hợp đồng) | 99% | từ 0,9 |
| Diện tích (giấy chứng nhận) | 80% | luôn qua người duyệt |

Con số 80% của diện tích tính trên mọi giấy chứng nhận. Riêng những giấy có trang biến động thì chỉ còn 71%, như đã thấy khi tách con số tổng.

Ngưỡng của mỗi field được chọn theo tỉ lệ đúng thật đo trên tập có nhãn, không theo cảm giác (**field-level confidence scores calibrated using labeled validation sets for routing review attention**). Nhờ vậy, điểm tin cậy dùng được để phân luồng. Field nào dưới ngưỡng của nó thì người duyệt xem, còn field nào trên ngưỡng thì đi thẳng (**calibrating review thresholds using labeled validation sets**).

Quyết định có cần duyệt hay không cũng nên do code đưa ra, không để Claude tự phán đoán. Tool trích xuất trả mỗi field kèm điểm của nó. Code so điểm với ngưỡng đã hiệu chỉnh rồi bật cờ `can_duyet`, và ghi vào danh sách `ly_do_duyet` những field khiến hồ sơ phải qua người duyệt. Trong đề, hai field này thường có tên `requires_review` và `review_reasons`.

```json
{
  "dien_tich": {"gia_tri": "65,2 m²", "diem": 0.93},
  "thu_nhap_thang": {"gia_tri": "28.400.000", "diem": 0.97},
  "can_duyet": true,
  "ly_do_duyet": ["dien_tich: field trên giấy chứng nhận luôn qua người duyệt"]
}
```

Cờ do code tính theo ngưỡng đã hiệu chỉnh sửa được lỗi theo cả hai chiều. Field điểm thấp không lọt ra ngoài chỉ vì agent phía sau thấy giá trị trông hợp lý. Field đã chắc đúng cũng không bị đẩy đi duyệt chỉ vì agent thấy điểm "chưa đủ cao".

> **Trong đề chọn gì**
>
> Nếu đề kể 12% kết quả vẫn qua bước kiểm JSON schema nhưng giá trị bên trong sai, và người duyệt chỉ đủ sức xem 20%, hãy chọn cho model xuất điểm tin cậy từng field rồi hiệu chỉnh ngưỡng duyệt bằng tập có nhãn. Đáp án lấy ngẫu nhiên 20% thì đo được tỉ lệ lỗi nhưng không dồn công duyệt vào chỗ dễ sai. Đáp án duyệt mọi tài liệu có định dạng lạ là đoán theo hình thức, trong khi lỗi nằm ở nghĩa của giá trị. Đáp án chỉ duyệt field trống hay ghi không tìm thấy thì bỏ qua đúng loại lỗi này, vì field sai vẫn có giá trị.
>
> Nếu đề hỏi cách chọn tài liệu cần duyệt tay khi năng lực duyệt có hạn, hãy chọn điểm tin cậy từng field cùng ngưỡng hiệu chỉnh bằng tập có nhãn. Đáp án chọn ngẫu nhiên 10% không nhắm vào chỗ dễ sai. Đáp án dựa vào mức tự tin model tự nói ra trong câu trả lời thì dùng một con số chưa qua hiệu chỉnh. Đáp án duyệt mọi tài liệu dài hơn 5 trang lấy độ dài làm thước đo, trong khi độ dài không nói lên độ khó.
>
> Nếu đề kể tool trích hoá đơn trả điểm tin cậy 0,0–1,0 cho mỗi field, mà agent vẫn dùng kết quả điểm thấp và lại đòi duyệt cả những kết quả đã đúng, hãy chọn trả field kèm điểm, cộng cờ `requires_review` tính theo ngưỡng đã hiệu chỉnh và mảng `review_reasons` nói field nào cần duyệt. Đáp án chia field vào hai object `verified` và `needs_verification` thì không cho biết vì sao field cần duyệt, mà ngưỡng chia cũng chưa được hiệu chỉnh. Đáp án trả điểm thô kèm few-shot dạy cách hiểu điểm thì vẫn để model tự phán đoán. Đáp án gộp một điểm chất lượng cho mọi field thì che mất field nào yếu.

## Lấy mẫu ngẫu nhiên phân tầng để tiếp tục đo lỗi

Sau khi hợp đồng và sao kê đi thẳng, chị Vân hỏi: làm sao biết phần đi thẳng vẫn đúng? Kết quả điểm cao không ai xem nữa, nên nếu Claude bắt đầu sai ở đó, sẽ không ai thấy cho tới khi hệ thống phía sau gặp chuyện.

Mỗi tuần, Tùng cho hệ thống lấy ngẫu nhiên một phần kết quả điểm cao để thẩm định viên xem. Cách lấy là chia kết quả theo loại tài liệu và nhóm field, rồi lấy ngẫu nhiên trong từng nhóm. Cách này gọi là lấy mẫu ngẫu nhiên phân tầng (**stratified random sampling**). Lấy ngẫu nhiên thì số đo tỉ lệ lỗi không bị lệch về phía ca dễ hay ca khó, còn chia theo nhóm thì nhóm nhỏ cũng có đủ mẫu để xem riêng.

Mỗi tuần có khoảng 2.000 field điểm cao đi thẳng, chia làm bốn nhóm: giá mua và bên bán trên hợp đồng, thu nhập trên sao kê do ngân hàng in, và thu nhập trên sao kê do doanh nghiệp tự in. Nhóm cuối chỉ chiếm khoảng 2%. Lấy ngẫu nhiên 3% trên toàn bộ thì được 60 mẫu, mà nhóm cuối thường chỉ có 1 mẫu. Lấy theo nhóm thì Tùng giữ cùng tỉ lệ 3% cho mỗi nhóm, nhưng nhóm nào ít hơn 30 mẫu thì nâng lên 30.

**Sơ đồ: Lấy mẫu trên toàn bộ thì nhóm nhỏ gần như không có mẫu; lấy theo nhóm thì nhóm nhỏ cũng có đủ mẫu**

• _Ngẫu nhiên trên toàn bộ_
1. Lấy **3%** của khoảng 2.000 field điểm cao mỗi tuần
   ↓ _nhóm đông chiếm gần hết mẫu_
2. Sao kê do doanh nghiệp tự in chỉ chiếm khoảng 2%
3. **1 mẫu** cho nhóm sao kê doanh nghiệp tự in

• _Ngẫu nhiên phân tầng_
1. Chia bốn nhóm theo loại tài liệu và field
   ↓ _lấy ngẫu nhiên trong từng nhóm_
2. Mỗi nhóm 3%, nhóm nào dưới 30 mẫu thì nâng lên
3. **30 mẫu** cho chính nhóm sao kê doanh nghiệp tự in

Mẫu này làm hai việc (**implementing stratified random sampling of high-confidence extractions for ongoing error rate measurement and novel pattern detection**). Việc đầu là đo tỉ lệ lỗi thật của phần điểm cao theo thời gian. Tỉ lệ lấy mẫu giữ cố định, nên tuần này so được với tuần trước, và Tùng biết một lần sửa prompt có làm lỗi giảm thật không. Việc thứ hai là bắt những kiểu lỗi mới mà lúc hiệu chỉnh chưa ai nghĩ tới (**detecting novel error patterns**).

Sang tháng thứ hai sau khi tự động hoá, đợt lấy mẫu hằng tuần bắt được đúng một lỗi kiểu này. Một doanh nghiệp lớn đổi cách trình bày sao kê lương, thêm cột phụ cấp không thường xuyên. Claude cộng luôn cột này vào thu nhập hằng tháng, với điểm 0,96. Không ngưỡng nào chặn được lỗi này, vì Claude rất tự tin. Nhờ nhóm sao kê doanh nghiệp tự in có đủ 30 mẫu, thẩm định viên thấy cùng một lỗi lặp lại ngay trong tuần, và Tùng sửa prompt trước khi lỗi lan rộng.

> **Bẫy đề**
>
> Hệ thống chuyển cho người duyệt các tài liệu có độ tin cậy dưới 85%. Đợt kiểm tra hằng quý thấy 12% kết quả có điểm trên 85% vẫn sai, và các giá trị sai đó trông rất hợp lý. Nên làm gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Trích xuất lại mỗi tài liệu điểm cao lần hai, đánh dấu những ca hai lần trích cho kết quả khác nhau** (_double extraction_). Nghe như tự kiểm chéo. Nhưng cách này tốn gấp đôi, và hai lần có thể cùng ra một giá trị sai trông hợp lý.
> - **Hạ ngưỡng từ 85% xuống 70%** (_lower the threshold_). Nghe như duyệt nhiều hơn thì an toàn hơn. Có điều hạ ngưỡng chỉ đưa thêm kết quả điểm thấp cho người xem, trong khi lỗi đang nằm ở phần điểm cao.
> - **Dùng luật đánh dấu tài liệu có bảng so sánh hay phụ lục để duyệt, bất kể điểm** (_heuristic rules_). Nghe như nhắm đúng chỗ khó. Ngặt nỗi luật chỉ bắt được kiểu lỗi đã biết, không bắt được kiểu mới.
>
> **Chọn:** lấy mẫu ngẫu nhiên phân tầng, duyệt một tỉ lệ cố định kết quả điểm cao mỗi tuần để đo tỉ lệ lỗi và bắt kiểu lỗi mới.

## Dồn người duyệt vào field điểm thấp và tài liệu mơ hồ, mâu thuẫn

Khi phần lớn kết quả đã đi thẳng, chị Vân chuyển các thẩm định viên về việc thẩm định khoản vay. Phần sức còn dành cho việc duyệt kết quả trích chỉ đủ xem kỹ khoảng 15% số field mỗi tháng, nên chị muốn số công đó dồn vào chỗ dễ sai nhất. Tùng đưa cho người duyệt hai loại kết quả: field Claude chấm điểm dưới ngưỡng đã hiệu chỉnh, và field lấy từ tài liệu nguồn mơ hồ hay mâu thuẫn (**routing extractions with low model confidence or ambiguous/contradictory source documents to human review, prioritizing limited reviewer capacity**).

Tài liệu mâu thuẫn phải qua người duyệt bất kể điểm cao hay thấp. Một bộ hồ sơ có hợp đồng ghi diện tích 68,5 m², còn giấy chứng nhận ghi 65,2 m². Claude chọn một con số với điểm 0,93, nhưng ở đây không có giá trị đúng nào để chọn, chỉ có hai giấy tờ nói khác nhau. Phải có người quyết định tin giấy nào, hay yêu cầu khách bổ sung giấy tờ. Vì vậy Tùng cho Claude liệt kê mọi giá trị tìm thấy cho mỗi field, kèm giấy tờ và số trang. Hễ các giá trị đó khác nhau, code đánh dấu hồ sơ để người duyệt xem.

Với tài liệu mơ hồ, chỉ phần mơ hồ mới cần người duyệt. Thu nhập trên sao kê gần như luôn đúng khi có đơn vị rõ, nhưng một số sao kê chỉ ghi "28.400" mà không nói là đồng hay nghìn đồng. Code chỉ đưa người duyệt những sao kê không ghi đơn vị, còn sao kê có đơn vị rõ vẫn đi thẳng. Nhờ vậy, công duyệt dồn vào đúng chỗ dễ sai, còn những sao kê khác không bị chậm lại.

Cho phép Claude nói "không chắc" cũng giúp phân luồng. Prompt trích xuất cho phép Claude ghi field là không tìm thấy hay không rõ, thay vì đoán ra một giá trị cho đủ. Field nào Claude ghi là không rõ thì chuyển thẳng cho người duyệt.

> **Trong đề chọn gì**
>
> Nếu đề hỏi hai loại kết quả nào nên ưu tiên đưa người duyệt khi năng lực duyệt có hạn, hãy chọn kết quả từ tài liệu nguồn mơ hồ hoặc mâu thuẫn, và kết quả model báo độ tin cậy thấp ở cấp từng field. Đáp án lấy ngẫu nhiên từ loại tài liệu đã đúng 99% là dồn công vào chỗ ít sai nhất. Đáp án ưu tiên các tài liệu xử lý với `tool_choice` là `"auto"` thì sai, vì `tool_choice` chỉ quy định cách Claude được gọi tool, không liên quan gì tới độ khó của tài liệu.
>
> Nếu đề kể người duyệt chỉ xử lý được khoảng 5% số trích xuất và hỏi căn cứ chọn kết quả đưa duyệt, hãy chọn kết quả model báo độ tin cậy thấp, hoặc tài liệu nguồn mơ hồ hay mâu thuẫn. Đáp án duyệt mọi kết quả có số tiền, ngày tháng bất kể độ tin cậy thì tốn công cho cả những giá trị đã chắc đúng. Đáp án lấy ngẫu nhiên 5% không nhắm vào chỗ dễ sai. Đáp án chờ hệ thống phía sau báo lỗi mới duyệt thì lỗi đã đi xa rồi.
>
> Nếu đề kể field `weight` của vận đơn đúng 94% tính tổng nhưng chỉ 70% khi tài liệu không ghi rõ đơn vị, hãy chọn chỉ đưa người duyệt các giá trị `weight` thiếu đơn vị, còn có đơn vị rõ thì đi thẳng. Đáp án gán đơn vị hay gặp nhất rồi cho ra output là đoán. Đáp án cho nhân viên nhập tay mọi vận đơn thì bỏ phí phần model đang làm tốt. Đáp án lấy mẫu ngẫu nhiên cố định theo con số 94% và xử lý tài liệu thiếu đơn vị như mọi tài liệu khác thì bỏ qua đúng chỗ đang sai.
>
> Nếu đề kể hợp đồng có hai điều khoản ở hai trang nêu thời hạn báo trước khác nhau, và model trích ra một giá trị với độ tự tin cao, hãy chọn đưa người duyệt mỗi khi tài liệu cho nhiều giá trị khác nhau cho cùng một field, bất kể model tự tin thế nào. Đáp án giữ giá trị ở trang trước là đoán điều khoản nào có hiệu lực. Đáp án dựa vào ngưỡng điểm tin cậy thì để lọt ca này, vì model vẫn tự tin. Đáp án chạy lượt trích thứ hai với prompt diễn đạt lại thì hai lượt có thể chọn cùng một giá trị, trong khi mâu thuẫn nằm ngay trong tài liệu.

> **Ý chính**
>
> Đừng bớt người duyệt chỉ vì con số tổng cao, mà hãy tách độ chính xác theo loại tài liệu và field trước. Cho Claude chấm điểm từng field, rồi chọn ngưỡng theo tỉ lệ đúng thật đo trên tập có nhãn. Phần đi thẳng vẫn cần mẫu ngẫu nhiên phân tầng mỗi tuần để đo lỗi và bắt kiểu lỗi mới. Công duyệt có hạn thì dồn vào field điểm thấp và tài liệu mơ hồ hay mâu thuẫn.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 5.5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Define success criteria and build evaluations (Claude API)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [Reduce hallucinations (Claude API)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
4. [Demystifying evals for AI agents (Anthropic)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
