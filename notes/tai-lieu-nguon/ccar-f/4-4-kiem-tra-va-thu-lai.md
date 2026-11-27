---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-4-kiem-tra-va-thu-lai
ngay_tai: 2026-11-27
tieu_de: Kiểm tra, retry và vòng phản hồi cho dữ liệu trích xuất
---

Domain 4: Prompt Engineering & Structured Output · Task 4.4

# Kiểm tra, retry và vòng phản hồi cho dữ liệu trích xuất

Retry kèm đúng lỗi kiểm tra để Claude tự sửa, biết lúc retry vô ích, thêm field tự kiểm calculated_total, và ghi detected_pattern để biết vì sao dev bỏ qua.

- 13 phút đọc
- Đối chiếu docs 22/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Retry kèm tài liệu gốc, kết quả hỏng và lỗi kiểm tra cụ thể để Claude tự sửa
- Phân biệt lỗi retry sửa được (sai định dạng, sai cấu trúc) với lỗi retry vô ích (thông tin không có trong tài liệu gốc)
- Phân biệt lỗi về nghĩa với lỗi cú pháp schema
- Thêm calculated_total cạnh stated_total và cờ conflict_detected để tự phát hiện chỗ lệch
- Thêm detected_pattern vào mỗi phát hiện của bot review để biết loại nào hay bị báo nhầm

Tool use với schema chặt cho bạn JSON đúng khuôn, nhưng chưa cho bạn dữ liệu đúng. Con số trích ra vẫn có thể trái với quy định nghiệp vụ, hai con số đáng ra phải khớp vẫn có thể lệch nhau, và Claude vẫn có thể bỏ sót một field. Pipeline cần một bước kiểm tra sau khi trích, và một cách xử lý những bản ghi trượt kiểm tra.

Bài này chỉ cách retry sao cho Claude thật sự sửa được, cách nhận ra lúc retry chỉ tốn tiền, cách thiết kế field để Claude tự phát hiện chỗ lệch, và, với một bot review code, cách ghi lại đủ thông tin để biết vì sao dev hay bỏ qua những gì bot báo.

**Sơ đồ: Nguồn có đủ dữ liệu thì retry kèm lỗi, vắng khỏi nguồn hay còn lệch thì chuyển người**
_Bản đồ bài. Tài liệu gốc đi vào Claude trích bằng tool use có JSON schema, rồi qua bước kiểm tra; qua thì dùng được. Bản ghi trượt kiểm tra chia theo loại lỗi. Sai định dạng hay cấu trúc thì retry kèm lỗi: gửi tài liệu gốc, kết quả trích hỏng và lỗi kiểm tra cụ thể, gọi lại Claude; retry vài lần vẫn trượt thì chuyển nhân viên chứng từ. Thông tin không có trong nguồn thì không retry: để field là null, tra nguồn khác; tra không ra thì chuyển nhân viên chứng từ. Lỗi về nghĩa thì thêm field tự kiểm calculated_total, conflict_detected; còn lệch thì gắn cờ, chuyển nhân viên chứng từ. Riêng bot review code có vòng phản hồi: bot báo phát hiện kèm detected_pattern, dev bỏ qua thì lưu kèm pattern, rồi nhóm theo pattern để biết chỗ sửa prompt._

- **Tài liệu gốc**: source document
- **Claude trích**: tool use + schema
- **Kiểm tra**: validation
- qua
- **Dùng được**: trượt
- gọi lại Claude
- **TRƯỢT KIỂM TRA**
- **Sai định dạng**: format, structural
- **Thiếu trong nguồn**: absent from source
- **Lỗi về nghĩa**: semantic errors
- **Retry kèm lỗi**: tài liệu, kết quả hỏng
- + lỗi kiểm tra cụ thể
- **Không retry**: để field là null,
- tra nguồn khác
- **Field tự kiểm**: calculated_total,
- conflict_detected
- vẫn trượt sau vài lần
- tra không ra
- còn lệch: gắn cờ
- **Người xử lý: nhân viên chứng từ**: nhận bản ghi kèm lý do hay cờ
- **RIÊNG BOT REVIEW CODE: VÒNG PHẢN HỒI (FEEDBACK LOOP)**
- **Bot báo phát hiện**: kèm detected_pattern
- **Dev bỏ qua**: lưu kèm pattern
- **Nhóm theo pattern**: biết chỗ sửa prompt

## Ví dụ xuyên suốt: chứng từ xuất khẩu của một công ty đồ gỗ

Một công ty xuất khẩu đồ gỗ ngoài trời ở Quy Nhơn mỗi tháng nhận khoảng 2.000 bộ chứng từ từ các xưởng gia công, gồm hoá đơn thương mại và phiếu đóng gói (packing list). Đội công nghệ có 4 dev, chị Thư là trưởng nhóm, Duy phụ trách pipeline dùng Claude trích dữ liệu chứng từ ra JSON để làm tờ khai hải quan. Pipeline dùng tool use với JSON schema, chưa bật strict, rồi chạy thêm một bước kiểm tra bằng Pydantic, một thư viện Python chuyên kiểm kiểu dữ liệu và luật của từng field. Schema có field `uoc_luong` để đánh dấu những số xưởng chỉ ghi ước chừng. Bản ghi nào không qua được thì chuyển cho nhân viên chứng từ. Ngoài pipeline này, đội còn tự chạy một bot dùng Claude để review code trong repo của mình.

## Retry kèm lỗi kiểm tra cụ thể

Tuần đầu chạy thật, 9% bản ghi trượt kiểm tra Pydantic. Một lỗi hay gặp là `so_kien: expected int, got '2 đến 3'`, vì xưởng chỉ ghi số kiện ước chừng, kiểu "2 đến 3 kiện". Duy viết code gửi lại đúng request cũ khi kiểm tra thất bại. Gần như toàn bộ bản ghi vẫn trượt đúng chỗ cũ, vì gửi y nguyên request thì Claude cũng trả về gần như y nguyên kết quả.

Duy đổi cách retry. Lần gọi sau là một request tiếp theo (**follow-up request**) gửi kèm ba thứ: tài liệu gốc, kết quả trích lần trước, và lỗi kiểm tra cụ thể (**the original document, the failed extraction, and specific validation errors**). Cách này gọi là retry kèm phản hồi lỗi (**retry-with-error-feedback**), tức là nối lỗi kiểm tra cụ thể vào prompt để Claude biết phải sửa chỗ nào.

```
<tai_lieu_goc> ...ảnh phiếu đóng gói PL-2611... </tai_lieu_goc>
<ket_qua_lan_truoc>
{"so_phieu": "PL-2611", "so_kien": "2 đến 3", "trong_luong_kg": 184.5}
</ket_qua_lan_truoc>
<loi_kiem_tra>
so_kien: phải là số nguyên. Phiếu ghi "2 đến 3 kiện".
Theo quy định của đội, lấy số lớn nhất và đặt uoc_luong = true.
</loi_kiem_tra>
Hãy sửa kết quả trên theo lỗi kiểm tra, giữ nguyên các field đã đúng.
```

Lần này Claude biết thêm field nào sai và sai vì sao. Phần lớn bản ghi được sửa trong một hai lần retry. Cách làm này giống kiểu nối nhiều prompt thành chuỗi để Claude tự sửa (**self-correction**). Lần gọi đầu viết bản nháp, bước sau kiểm bản nháp theo tiêu chí, rồi lần gọi cuối nhờ Claude sửa dựa trên kết quả kiểm. Ở đây bước kiểm do code Pydantic làm, còn bước sửa do Claude làm. Mỗi bước là một lần gọi API riêng, nên Duy ghi log và đếm được bao nhiêu bản ghi được sửa ở lần retry thứ mấy.

Lần retry cần đủ cả ba thứ. Nếu không có tài liệu gốc, Claude không có chỗ để đọc ra giá trị đúng. Nếu không thấy kết quả lần trước, Claude sẽ trích lại từ đầu và có khi hỏng sang chỗ khác. Còn bỏ phần lỗi cụ thể đi thì thực chất bạn chỉ đang gửi lại request cũ.

**Sơ đồ: Gửi lại request cũ thì trượt đúng chỗ cũ; gửi kèm lỗi cụ thể thì Claude biết phải sửa gì**

✗ _Gửi lại đúng request cũ_
1. Ảnh phiếu đóng gói **PL-2611** và prompt cũ, không thêm gì
   ↓ _Claude trích lại gần như y hệt lần trước_
2. **so_kien: "2 đến 3"**, Pydantic báo lại đúng lỗi cũ
3. **Vẫn trượt** gần như toàn bộ bản ghi, đúng chỗ cũ

✓ _Gửi kèm ba thứ_
1. Tài liệu gốc PL-2611, kết quả lần trước, **lỗi kiểm tra cụ thể**
   ↓ _Claude biết field nào sai và sai vì sao_
2. **so_kien** lấy số lớn nhất, đặt **uoc_luong = true**
3. **Sửa được** phần lớn bản ghi chỉ sau một hai lần retry

> **Bẫy đề**
>
> Pipeline trích hoá đơn trả JSON có cấu trúc nhưng thiếu field bắt buộc `invoice_number`, dù số này in rõ trên PDF. Đội muốn retry, lần này kèm phản hồi chỉ ra đúng chỗ sai. Nên thiết kế lần retry thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gửi lại PDF với system prompt viết lại, nhấn mạnh xuất JSON đúng schema** (_stronger schema reminder_). Nghe như nhắc mạnh hơn. Nhưng lời nhắc không nói field nào thiếu, và Claude cũng không thấy mình đã trả gì lần trước.
> - **Gửi lại PDF và prompt cũ, hạ temperature về 0** (_same prompt, temperature 0_). Cách này làm kết quả ổn định hơn. Có điều, thứ ổn định ở đây lại chính là kết quả thiếu field đó.
> - **Gửi JSON lỗi và lỗi kiểm tra, bỏ PDF cho prompt gọn** (_drop the source document_). Bỏ PDF thì đỡ tốn token. Ngặt nỗi không có PDF thì Claude chẳng có chỗ nào để đọc ra số hoá đơn.
>
> **Chọn:** gửi lại PDF kèm JSON bị lỗi và một tin nhắn nêu rõ `invoice_number` là field bắt buộc mà output trước đã bỏ sót.

> **Trong đề chọn gì**
>
> Nếu đề kể 12% kết quả trượt kiểm tra Pydantic với lỗi như "expected float for quantity, got '2 to 3'", và gửi lại y nguyên vẫn lỗi, hãy chọn gửi thêm một request kèm lỗi kiểm tra để model tự sửa output. Đặt temperature bằng 0 chỉ làm lỗi lặp lại ổn định hơn. Dựng pipeline phụ với model lớn hơn là thêm hạ tầng khi model hiện tại chỉ thiếu thông tin về lỗi. Còn xử lý tài liệu trước cho đều định dạng thì bạn phải đoán trước được mọi kiểu ghi có thể gặp.

## Khi nào retry vô ích

Sau một tháng, Duy thấy khoảng 1% tổng số bản ghi retry tới lần thứ ba vẫn trượt. Tất cả đều trượt ở field `ma_hs`, mã HS dùng để phân loại hàng hoá trên tờ khai. Mấy xưởng này không ghi mã HS trên hoá đơn. Mã đó chỉ nằm trong bảng danh mục sản phẩm của công ty, mà bảng này không hề được gửi kèm khi gọi Claude trích dữ liệu.

Chuyện mã HS cho thấy retry có giới hạn (**the limits of retry**). Retry có ích khi lỗi nằm ở cách Claude ghi dữ liệu ra, tức là sai định dạng hay sai cấu trúc (**format mismatches, structural output errors**). Ví dụ số bị ghi thành chuỗi, ngày kèm cả giờ trong khi schema chỉ cần ngày, hay mảng lồng nhau trong khi schema cần mảng phẳng. Retry vô ích khi thông tin cần trích không có trong tài liệu gốc (**the required information is simply absent from the source document**), ví dụ thông tin chỉ nằm trong một tài liệu bên ngoài không được đưa vào (**information exists only in an external document not provided**). Gửi lại bao nhiêu lần cũng không tạo ra dữ liệu không có trong tài liệu gốc. Tệ hơn, nếu schema bắt field này phải có giá trị, Claude có thể đoán ra một mã HS nghe rất hợp lý.

Duy cho `ma_hs` nhận `null` trong bước trích, rồi viết thêm một bước bằng code, lấy mã sản phẩm tra ra mã HS trong bảng danh mục. Những bản ghi không tra được thì chuyển cho nhân viên chứng từ. Vòng retry giờ chỉ chạy cho những lỗi mà tài liệu gốc có đủ dữ liệu để sửa.

**Sơ đồ: Mã HS không có trong hoá đơn thì retry bao lần cũng không ra: để null rồi tra bảng danh mục**
- Nguồn có dữ liệu,sai định dạng
- Mã HS không cótrong nguồn
- Không có trongnguồn, vẫn retry
- Sửa được
- Vẫn trượt
- Không tra được
- Tra được
- Bản ghi trượtkiểm tra
- Retry kèm lỗi kiểm travd so_kien '2 đến 3'
- Trích ma_hs = null,code tra bảng danh mụctheo mã sản phẩm
- Cách sai: vẫn retrylần thứ ba vẫn trượt,hoặc Claude đoán mã
- Qua kiểm tra
- Chuyển nhân viênchứng từ
- Điền ma_hstừ bảng danh mục

> **Trong đề chọn gì**
>
> Nếu đề kể hệ thống retry kèm lỗi kiểm tra sửa được hầu hết lỗi trong 2–3 lần, và hỏi với lỗi nào thì retry thêm sẽ kém hiệu quả nhất, hãy chọn lỗi mà thông tin không có trong đầu vào, ví dụ khi trích thông tin bài báo khoa học, model chỉ ghi được "et al." (và cộng sự) ở chỗ tên đồng tác giả, vì danh sách đầy đủ nằm ở một tài liệu khác không gửi kèm. Ba đáp án còn lại đều là lỗi định dạng hoặc cấu trúc, nên retry kèm lỗi sửa được: số trích dẫn ghi kiểu "1,234" khi schema cần số nguyên, keywords lồng theo nhóm khi schema cần mảng phẳng, và ngày có cả giờ khi schema cần `YYYY-MM-DD`.

## Lỗi về nghĩa và field để Claude tự kiểm

Bước kiểm tra Pydantic chỉ bắt lỗi kiểu và định dạng. Nhân viên chứng từ còn phát hiện khoảng 6% hoá đơn có tổng tiền các dòng hàng không bằng tổng cộng ghi trên hoá đơn. Có hoá đơn lệch vì ảnh scan mờ khiến Claude đọc sai một chữ số, có hoá đơn lệch vì Claude trích nhầm một dòng, và cũng có khi chính xưởng cộng sai tổng.

Đây là lỗi về nghĩa (**semantic validation errors**), như các giá trị cộng lại không khớp hay giá trị nằm nhầm field (**values don't sum, wrong field placement**). Ví dụ trọng lượng tịnh điền nhầm vào field trọng lượng cả bì: cùng kiểu số nên schema vẫn cho qua. Lỗi về nghĩa khác lỗi cú pháp schema (**schema syntax errors**), tức là JSON sai khuôn, thiếu field hay sai kiểu, loại lỗi mà strict tool use chặn được từ đầu. Schema không kiểm được chuyện các số cộng lại có khớp hay không, nên Duy bắt Claude tự cộng ngay trong bước trích để có số mà so.

Duy thêm vào schema field `stated_total` cho tổng ghi trên hoá đơn và field `calculated_total` cho tổng do Claude tự cộng từ các dòng hàng đã trích (**extracting "calculated_total" alongside "stated_total"**). Sau đó code so hai số này. Nếu chúng lệch nhau, Duy retry một lần kèm cả hai số, vì có khi Claude chỉ trích nhầm một dòng. Còn lệch sau lần đó, tức là chính chứng từ có vấn đề, thì code gắn cờ bản ghi để người review xem, kèm cả hai số để họ biết lệch bao nhiêu. Lần gọi trích đưa cả hoá đơn và phiếu đóng gói của cùng một lô, nên Duy thêm được field boolean `conflict_detected` (**"conflict_detected" booleans for inconsistent source data**). Claude đặt field này thành `true` khi hai chứng từ ghi số kiện khác nhau, và không được tự chọn một bên. Cách thiết kế luồng kiểm tra tự sửa (**self-correction validation flows**) như vậy biến một chỗ lệch dễ bị lọt thành tín hiệu rõ ràng, để người review biết mà xử lý.

```json
{
  "so_hoa_don": "CI-0937",
  "stated_total": 18450.00,
  "calculated_total": 18540.00,
  "conflict_detected": true,
  "ghi_chu_xung_dot": "Hoá đơn ghi 42 kiện, phiếu đóng gói PL-0937 ghi 40 kiện"
}
```

**Sơ đồ: Tổng lệch hay số kiện mâu thuẫn đều được gắn cờ cho người review, kèm cả hai giá trị**
_Hai chỗ lệch của bộ chứng từ CI-0937 thành cờ cho người review. Lệch tổng: Claude trích stated_total 18450.00 là tổng ghi trên hoá đơn và calculated_total 18540.00 là tổng tự cộng từ các dòng hàng; code so hai số, thấy lệch nhau. Hai chứng từ cùng lô ghi khác nhau: hoá đơn ghi 42 kiện, phiếu đóng gói PL-0937 ghi 40 kiện; Claude đặt conflict_detected là true, không tự chọn bên nào. Cả hai đi tới người review, kèm cả hai số. Pydantic vẫn cho qua vì mọi field đúng kiểu._

- **LỆCH TỔNG TRONG MỘT HOÁ ĐƠN**
- **Hoá đơn CI-0937**: dòng hàng, tổng cộng
- **stated_total: 18450.00**: tổng ghi trên hoá đơn
- ≠ code so hai số: lệch nhau
- **calculated_total: 18540.00**: Claude tự cộng các dòng hàng
- **HAI CHỨNG TỪ CÙNG LÔ GHI KHÁC NHAU**
- **Hoá đơn CI-0937**: ghi 42 kiện
- **Phiếu PL-0937**: ghi 40 kiện
- **conflict_detected: true**: Claude không tự chọn bên nào
- **Người review**: nhận bản ghi gắn cờ
- kèm cả hai số,
- biết lệch bao nhiêu
- và nguồn mâu thuẫn
- Pydantic vẫn cho qua: mọi field đúng kiểu, chỗ sai nằm ở nghĩa

> **Bẫy đề**
>
> Pipeline trích hoá đơn lấy ra dòng hàng, tạm tính, tiền thuế và tổng cộng. 18% kết quả có tổng các dòng hàng không khớp tổng trích ra, có khi do bước OCR (máy đọc chữ trên ảnh scan) đọc sai, có khi do model trích sai. Nên cải tiến thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm ví dụ few-shot với hoá đơn mà dòng hàng cộng đúng bằng tổng** (_few-shot consistent totals_). Nghe như dạy model trích cho khớp. Nhưng khi chính tài liệu gốc lệch, ép cho khớp là che mất chỗ lệch thật.
> - **Tự chỉnh tiền các dòng hàng theo tỉ lệ khi tổng không khớp** (_auto-adjust line items_). Cách này làm số khớp ngay. Có điều nó sửa dữ liệu mà không biết bên nào sai, và chỗ lệch biến mất khỏi mắt người review.
> - **Trích dòng hàng và tổng riêng, rồi dùng một model kiểm tra để chọn giá trị nhiều khả năng đúng** (_a separate verifier model_). Nghe như có người phân xử. Ngặt nỗi nếu OCR đã đọc sai thì model kiểm tra cũng không biết số đúng là bao nhiêu, phải có người nhìn vào tài liệu.
>
> **Chọn:** thêm field `calculated_total` để model cộng các dòng hàng đã trích, đặt cạnh `stated_total`, và gắn cờ cho người review khi hai giá trị lệch nhau.

> **Trong đề chọn gì**
>
> Nếu đề kể tool use với schema chặt đã hết lỗi cú pháp, nhưng 12% kết quả vẫn trượt kiểm tra về nghĩa, chẳng hạn dòng hàng không khớp tổng hay mã nhà cung cấp sai định dạng, và hỏi cách xử lý, hãy chọn gửi một request tiếp theo kèm tài liệu, kết quả trích và lỗi kiểm tra để model tự sửa. Ràng buộc schema chặt hơn không diễn tả được chuyện cộng có khớp. Retry tối đa 3 lần rồi lấy kết quả đầu tiên qua kiểm tra là retry mù, vì mỗi lần vẫn là request cũ, Claude không được biết mình sai ở đâu. Thêm một bước tự tính lại tổng sau khi trích thì lại là sửa dữ liệu mà không biết bên nào sai. Đề còn có một câu tương tự, kể 8% tài liệu bị lệch tổng. Ở câu đó, đáp án đúng là thêm `calculated_total` kèm một cờ như `is_total_consistent` để người review xem.

## Vòng phản hồi cho bot review code

Thêm field để sau này có dữ liệu mà soi cũng giúp đội ở bot review code. Mỗi chỗ bot báo trong code gọi là một phát hiện (finding). Dev bấm "bỏ qua" khoảng 40% số phát hiện, nhưng mỗi phát hiện chỉ có vị trí, mô tả và mức nghiêm trọng. Chị Thư muốn biết loại phát hiện nào hay bị bỏ qua để sửa prompt, mà không có dữ liệu nào để nhóm các phát hiện lại.

Duy thêm field `detected_pattern` vào mỗi phát hiện (**adding detected_pattern fields to structured findings**), ghi kiểu code khiến Claude báo, ví dụ `except_rong`, `sql_ghep_chuoi`, `vong_lap_trong_vong_lap`. Mỗi lần dev bỏ qua một phát hiện, bot lưu lần bỏ qua đó kèm giá trị `detected_pattern` của nó. Sau hai tuần, Duy nhóm theo field này và thấy 70% số lần bỏ qua rơi vào `vong_lap_trong_vong_lap` ở các script chạy một lần trên dữ liệu nhỏ. Chị Thư biết đúng chỗ cần sửa prompt.

Cách làm này gọi là thiết kế vòng phản hồi (**feedback loop design**). Bạn ghi lại kiểu code nào khiến bot báo, để sau đó nhóm các lần bị bỏ qua lại mà xem cho có bài bản (**systematic analysis of dismissal patterns**). Nếu thiếu `detected_pattern`, bạn chỉ biết tổng số lần bị bỏ qua. Có field này, bạn thấy bot hay báo nhầm (**false positive patterns**) ở những kiểu code nào.

> **Ý chính**
>
> Muốn biết vì sao dev hay bỏ qua những gì bot review báo, thêm field `detected_pattern` vào từng phát hiện, rồi nhóm các lần bị bỏ qua theo field đó.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 4.4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Prompting best practices, Chain complex prompts (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
3. [Strict tool use (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)
