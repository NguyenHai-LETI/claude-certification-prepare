---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-6-nguon-goc-thong-tin
ngay_tai: 2026-11-27
tieu_de: Giữ nguồn gốc thông tin khi tổng hợp từ nhiều nguồn
---

Domain 5: Context Management & Reliability · Task 5.6

# Giữ nguồn gốc thông tin khi tổng hợp từ nhiều nguồn

Giữ nguồn của từng nhận định qua các bước tóm tắt, ghi chú số liệu mâu thuẫn kèm nguồn, ghi ngày cho dữ liệu, và trình bày mỗi loại nội dung một cách hợp lý.

- 19 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Hiểu vì sao nguồn của nhận định bị mất khi tóm tắt, và bắt subagent xuất ánh xạ nhận định với nguồn
- Bắt agent tổng hợp giữ và gộp ánh xạ nhận định với nguồn qua mọi bước
- Ghi chú số liệu mâu thuẫn kèm nguồn thay vì tự chọn một con số
- Ghi ngày công bố hay ngày thu thập để không nhầm thay đổi theo thời gian là mâu thuẫn
- Tách phần đã vững khỏi phần còn tranh cãi, và trình bày mỗi loại nội dung theo dạng hợp với nó

Một hệ thống nghiên cứu nhiều agent đi qua nhiều bước: tìm nguồn, đọc, tóm tắt, tổng hợp, viết báo cáo. Mỗi bước tóm tắt lại bỏ bớt chi tiết, và chi tiết hay bị bỏ nhất là "câu này lấy từ đâu". Tới báo cáo cuối, có thể có một con số trông rất chắc chắn mà không còn ai biết nó lấy từ đâu.

Bài này giúp bạn giữ nguồn của từng nhận định từ subagent tới báo cáo cuối. Bạn cũng sẽ biết xử lý thế nào khi hai nguồn đáng tin đưa hai con số khác nhau, vì sao số liệu phải kèm ngày, và trình bày báo cáo sao cho người đọc thấy rõ chỗ nào chắc, chỗ nào còn bàn cãi.

**Sơ đồ: Nguồn và ngày đi theo từng nhận định tới tận báo cáo, mâu thuẫn thì giữ đủ hai phía**
_Bản đồ bài. Các subagent tìm web, đọc tài liệu, lấy số liệu tài chính. Mỗi subagent xuất ánh xạ nhận định với nguồn gồm nhận định, URL hay tên tài liệu, đoạn trích, ngày công bố hay ngày thu thập. Agent tổng hợp giữ và gộp các ánh xạ; số liệu mâu thuẫn thì giữ cả hai kèm nguồn; có ngày thì tách thay đổi theo thời gian khỏi mâu thuẫn thật. Báo cáo cuối có phần đã vững và phần còn tranh cãi, giữ cách nguồn mô tả và phương pháp; số liệu tài chính thành bảng, tin tức thành văn xuôi, thông số kỹ thuật thành danh sách_

- **SUBAGENT**: tim-web
- doc-tai-lieu
- so-lieu-tai-chinh
- mỗi nhận định kèm nguồn,
- đoạn trích và ngày
- **tong-hop**: giữ và gộp ánh xạ
- nhận định với nguồn
- mâu thuẫn: giữ cả hai
- giá trị, ghi nguồn từng cái
- có ngày: tách thay đổi
- theo thời gian khỏi
- mâu thuẫn thật
- **BÁO CÁO**: Phần đã vững
- Phần còn tranh cãi
- giữ cách nguồn mô tả
- và phương pháp
- **MỖI LOẠI NỘI DUNG MỘT CÁCH TRÌNH BÀY**
- **Số liệu tài chính**: thành bảng
- **Tin tức**: thành văn xuôi
- **Thông số kỹ thuật**: thành danh sách

## Ví dụ xuyên suốt: báo cáo thị trường xe máy điện cho một hãng xe đạp điện

Một hãng sản xuất xe đạp điện ở Hưng Yên đang cân nhắc mở dòng xe máy điện. Anh Thịnh, giám đốc chiến lược, cần một báo cáo thị trường mỗi quý để trình ban giám đốc. Hậu, dev của phòng, dựng một hệ thống nhiều agent bằng Claude Agent SDK để viết báo cáo.

Agent điều phối giao việc cho năm subagent. Ba subagent đầu đi lấy thông tin. `tim-web` tìm tin tức và báo cáo công khai trên web. `doc-tai-lieu` đọc các báo cáo ngành dạng PDF, khảo sát khách hàng nội bộ và hợp đồng với nhà cung cấp pin. `so-lieu-tai-chinh` gọi API của một nhà cung cấp dữ liệu để lấy doanh thu, biên lợi nhuận và tốc độ tăng trưởng của các hãng xe niêm yết. Hai subagent sau xử lý những gì ba subagent đầu mang về. `tong-hop` là agent tổng hợp, gộp mọi thứ thành bản nháp. `viet-bao-cao` viết bản cuối có trích dẫn.

## Nguồn bị mất khi tóm tắt

Bản báo cáo đầu tiên ghi "thị phần xe máy điện năm 2025 đạt khoảng 12%". Một thành viên ban giám đốc hỏi con số đó lấy từ đâu, và không ai trả lời được. Hậu xem log thì thấy `tim-web` và `doc-tai-lieu` đều gắn nguồn đúng cho từng ý: URL bài báo, tên file PDF và số trang. Nhưng `tong-hop` gộp các ý đó thành mấy đoạn văn mạch lạc, và nguồn rơi mất ở bước này.

Hiện tượng này là nguồn bị mất ở bước tóm tắt (**source attribution is lost during summarization steps when findings are compressed without preserving claim-source mappings**). Bước tóm tắt viết lại nhiều ý thành văn mới, nên mối nối giữa từng nhận định và nguồn của nó biến mất mà không có lỗi nào báo ra. Bài này gọi mối nối đó, tức bản ghi cho biết nhận định nào lấy từ nguồn nào, là ánh xạ nhận định với nguồn. Muốn giữ được nguồn, bạn phải yêu cầu rõ từng agent ghi ánh xạ này ở dạng có cấu trúc, và giữ nguyên nó qua mọi bước.

Hậu yêu cầu mỗi subagent trả kèm một ánh xạ có cấu trúc cho từng nhận định (**structured claim-source mappings**). Mỗi ánh xạ ghi URL nguồn, tên tài liệu và đoạn trích liên quan (**source URLs, document names, relevant excerpts**), và các agent phía sau phải giữ ánh xạ này qua bước tổng hợp. Ánh xạ cho con số 12% trông như sau:

```json
{
  "nhan_dinh": "Xe máy điện chiếm khoảng 12% doanh số xe máy năm 2025",
  "nguon": "Báo cáo ngành xe hai bánh 2025.pdf, trang 14",
  "trich_doan": "Tỷ trọng xe máy điện ước đạt khoảng 12% tổng doanh số..."
}
```

`tong-hop` không chỉ giữ mà còn phải gộp ánh xạ (**the synthesis agent must preserve and merge**). Khi hai nguồn cùng ủng hộ một nhận định, nhận định đó trong bản nháp mang cả hai nguồn. Khi một đoạn văn gộp ba nhận định, mỗi nhận định vẫn giữ nguồn riêng của nó.

Lúc chuyển sang `viet-bao-cao`, agent điều phối không đưa toàn bộ những gì các agent trước đã đọc. Nó đưa bản nháp của `tong-hop` kèm một chỉ mục nguồn có cấu trúc, nối từng nhận định chính với URL và đoạn trích. Như vậy `viet-bao-cao` có đúng thứ cần để viết bản cuối và chèn trích dẫn, mà không phải đọc lại hàng trăm nghìn token nội dung thô. Các subagent cũng có thể ghi kết quả ra file rồi chỉ chuyển đường dẫn về agent điều phối, để nội dung không bị chép đi chép lại qua nhiều bước và rơi rớt dần.

**Sơ đồ: Tóm tắt thành văn xuôi thì con số còn mà nguồn mất; ánh xạ có cấu trúc thì nguồn đi tới tận báo cáo**

✗ _Tóm tắt thành văn xuôi_
1. tim-web, doc-tai-lieu gắn nguồn đúng cho từng ý
   ↓ _tong-hop viết lại thành đoạn văn_
2. Báo cáo ghi "thị phần khoảng 12%", không còn nguồn
3. **12%** không ai biết con số lấy từ đâu

✓ _Ánh xạ nhận định với nguồn_
1. Mỗi nhận định kèm nguồn và đoạn trích
   ↓ _tong-hop giữ và gộp ánh xạ_
2. viet-bao-cao nhận bản nháp kèm chỉ mục nguồn
3. **12%** kèm tên báo cáo ngành, trang 14

Với tài liệu bạn đưa thẳng vào request, Claude API có sẵn tính năng **citations**, tức là gắn từng câu trả lời với đúng đoạn nguồn của nó. Bạn bật citations cho tài liệu PDF hay văn bản thường, và mỗi nhận định trong câu trả lời đi kèm đoạn được trích (`cited_text`) cùng vị trí của nó: số trang với PDF, vị trí ký tự với văn bản thường. API bảo đảm các vị trí này trỏ đúng vào tài liệu đã đưa, nên người đọc mở được đúng đoạn nguồn. Đoạn `cited_text` không bị tính vào token output. Với phần tài liệu này, bạn không phải tự dựng ánh xạ.

> **Bẫy đề**
>
> Trong production, báo cáo cuối thường có nhận định thiếu nguồn. Agent tìm web và agent phân tích tài liệu gắn trích dẫn đúng vào output của mình, nhưng agent tổng hợp mất dấu nguồn nào hỗ trợ nhận định nào. Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm một bước kiểm tra, so độ giống về nghĩa giữa nhận định và tài liệu để đoán lại nhận định nào lấy từ tài liệu nào** (_reconstruct by similarity_). Nghe như sửa được mà không đụng tới các agent. Nhưng dựng lại bằng độ giống là đoán, nhất là khi nhiều nguồn nói gần giống nhau.
> - **Cho agent điều phối chèn mã nhận diện nguồn vào đầu đoạn văn trước mỗi lần chuyển cho agent khác, rồi đọc lại mã đó lúc viết báo cáo** (_inline source prefixes_). Cách này có vẻ đơn giản, có điều mã nằm trong văn bản tự do, nên khi `tong-hop` viết lại văn bản thì mã cũng rơi mất hoặc lệch chỗ.
> - **Lưu đủ transcript của mọi subagent, thêm một agent đọc log để tìm nguồn trước khi viết báo cáo** (_mine the logs_). Thêm agent đọc log thì đủ thông tin thật. Ngặt nỗi đó là dựng cả một agent chỉ để tìm lại thứ lẽ ra không nên để mất.
>
> **Chọn:** yêu cầu mọi subagent xuất ánh xạ nhận định với nguồn có cấu trúc, và agent tổng hợp phải giữ và gộp các ánh xạ này khi kết hợp phát hiện.

> **Trong đề chọn gì**
>
> Nếu đề hỏi rủi ro chính khi kết quả trung gian bị tóm tắt cho gọn, hãy chọn đáp án nói nguồn bị mất mà không có gì báo ra. Rủi ro này chỉ tránh được khi bạn yêu cầu rõ các agent giữ nguyên ánh xạ nhận định với nguồn ở dạng có cấu trúc. Đáp án context window tự cắt phần giữa bản tóm tắt nhầm chỗ, vì nguồn mất do bước tóm tắt viết lại văn bản chứ không do giới hạn context. Đáp án ngân sách extended thinking bị dùng hết và đáp án hook PreToolUse chặn agent tổng hợp đọc dữ liệu đều không liên quan gì tới chuyện mất nguồn.
>
> Có câu hỏi kể ba bước. Agent tìm web lấy 25 nguồn, tổng cộng 120K token nội dung thô. Agent phân tích rút ý chính còn 15K token. Agent tổng hợp viết bản nháp 3K token. Nếu đề hỏi nên chuyển gì cho agent viết báo cáo, hãy chọn bản nháp kèm chỉ mục nguồn có cấu trúc, nối từng nhận định chính với URL và đoạn trích. Đáp án chuyển toàn bộ context tích luỹ thì nhồi 120K token thô vào một bước chỉ cần bản nháp. Đáp án chuyển bản tóm tắt cô đọng chỉ ghi nguồn bằng tên thì mất URL và đoạn trích. Đáp án chỉ chuyển bản nháp rồi để một bước xử lý phía sau tự khớp nguồn thì cũng là đoán lại nguồn khi ánh xạ đã mất.
>
> Khi người đọc cần bấm vào để tới đúng đoạn nguồn, citations của Claude hơn một danh sách tài liệu tham khảo ghi bằng chữ ở chỗ nào? Nếu đề hỏi vậy, hãy chọn citations gắn từng nhận định với vị trí ký tự hay số trang trong tài liệu đã cung cấp. Việc của citations chỉ là trả về đoạn trích và vị trí của nó. Vì vậy các đáp án gán cho citations việc so sánh hay hoà giải số liệu giữa các nguồn, hay việc ghi ngày công bố của nguồn, đều sai. Đáp án nói citations giúp subagent khỏi phải đọc tài liệu cũng sai, vì tài liệu vẫn phải do bạn đưa vào request, và Claude vẫn đọc tài liệu đó để trả lời.

## Nguồn đáng tin đưa hai con số khác nhau

Quý sau, `doc-tai-lieu` đọc hai báo cáo ngành, đều từ những tổ chức có uy tín. Báo cáo của một hiệp hội ghi doanh số xe máy điện năm 2025 là 410.000 chiếc. Báo cáo của một hãng nghiên cứu thị trường ghi 520.000 chiếc. Bản nháp của `tong-hop` chỉ ghi 520.000, vì báo cáo đó ra sau.

Hậu đọc kỹ hai báo cáo thì thấy hãng nghiên cứu tính cả xe đạp điện công suất lớn, còn hiệp hội thì không. Hai con số đều đúng, chúng chỉ đo hai thứ khác nhau. Vì vậy `tong-hop` không nên tự chọn một con số. Gặp số liệu mâu thuẫn từ các nguồn đáng tin, cách đúng là ghi chú chỗ mâu thuẫn kèm nguồn của từng giá trị (**annotating conflicts with source attribution rather than arbitrarily selecting one value**).

Hậu sửa luồng xử lý. Từ nay `doc-tai-lieu` vẫn phân tích hết tài liệu, đưa cả hai giá trị vào kết quả và ghi rõ chỗ chúng vênh nhau (**completing document analysis with conflicting values included and explicitly annotated**). Agent điều phối quyết định cách đối chiếu trước khi chuyển sang `tong-hop` (**letting the coordinator decide how to reconcile before passing to synthesis**). Ở đây nó giữ cả hai, kèm ghi chú phạm vi đo của từng nguồn.

```json
{
  "chi_so": "Doanh số xe máy điện 2025",
  "gia_tri": [
    {"so": 410000, "nguon": "Báo cáo của hiệp hội, trang 8", "pham_vi": "chỉ xe máy điện đăng ký biển số"},
    {"so": 520000, "nguon": "Báo cáo của hãng nghiên cứu, trang 21", "pham_vi": "gồm cả xe đạp điện công suất lớn"}
  ],
  "mau_thuan": true,
  "ghi_chu": "Hai nguồn đo phạm vi khác nhau, không phải một bên sai"
}
```

Hậu cũng đổi cách viết báo cáo cuối. Báo cáo chia làm hai phần riêng, một phần cho những phát hiện đã vững, một phần cho những phát hiện còn tranh cãi (**structuring reports with explicit sections distinguishing well-established findings from contested ones**). Ở cả hai phần, báo cáo giữ đúng cách nguồn diễn đạt kết quả của mình và nói rõ nguồn đã đo bằng phương pháp nào (**preserving original source characterizations and methodological context**). Nguồn viết "ước tính sơ bộ" thì báo cáo giữ đúng chữ "ước tính sơ bộ", không đổi thành một con số chắc nịch. Anh Thịnh đọc là biết con số nào dùng ngay được để lập kế hoạch, con số nào phải hỏi thêm.

> **Bẫy đề**
>
> Khi review các báo cáo chạy trên production, đội thấy mỗi báo cáo nói về độ chắc chắn một kiểu. Có báo cáo quy hết về một cách nói chung, có báo cáo chỉ đưa ước lượng mơ hồ mà không nói phương pháp. Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm một bước quy đổi, biến mọi cách nói về độ chắc chắn thành xác suất từ 0.0 tới 1.0, rồi tính trung bình có trọng số** (_normalize to probabilities_). Nghe như khoa học và nhất quán. Nhưng ép mọi nguồn về một thang làm mất cách chính nguồn mô tả kết quả và phương pháp của nó.
> - **Cho subagent chỉ báo phát hiện đạt đủ tiêu chí độ phủ, độ đa dạng nguồn và chất lượng** (_filter upstream_). Lọc từ sớm thì báo cáo gọn hơn, có điều phần chưa chắc bị giấu đi, trong khi anh Thịnh cần biết chỗ nào còn bàn cãi.
> - **Thêm subagent kiểm chứng, chỉ nhận phát hiện có ít nhất hai nguồn độc lập xác nhận** (_two-source rule_). Luật hai nguồn trông chặt chẽ. Ngặt nỗi phát hiện đúng mà chỉ có một nguồn cũng bị bỏ, và báo cáo vẫn không nói gì về phần còn tranh cãi.
>
> **Chọn:** dặn agent tổng hợp dùng các mục riêng, tách phát hiện đã xác nhận khỏi phần còn tranh cãi, và giữ nguyên cách từng nguồn mô tả kết quả của mình.

> **Trong đề chọn gì**
>
> Nếu đề hỏi cách xử lý đúng khi hai subagent đưa số liệu mâu thuẫn từ hai nguồn đều đáng tin, hãy chọn giữ cả hai giá trị và ghi rõ mâu thuẫn kèm nguồn của từng giá trị, để agent điều phối hay người dùng tự đối chiếu. Đáp án lấy trung bình thì tạo ra một con số không nguồn nào nói. Đáp án chọn nguồn mới nhất là chọn bừa, vì mới hơn không có nghĩa là đúng hơn hay đo cùng một thứ. Đáp án bỏ hẳn điểm dữ liệu tranh cãi thì giấu đúng chỗ người đọc cần biết.
>
> Nếu đề hỏi hai cách làm nào giúp giữ nguồn gốc thông tin và nói rõ chỗ chưa chắc trong hệ nhiều agent, hãy chọn hai đáp án sau. Một là báo cáo có phần riêng cho phát hiện đã vững và cho phát hiện còn tranh cãi, kèm phương pháp của nguồn. Hai là subagent xuất ánh xạ nhận định với nguồn có cấu trúc, gồm URL, tên tài liệu và đoạn trích. Đáp án bỏ ngày xuất bản khỏi metadata để tiết kiệm token thì mất đúng thông tin cần để biết số liệu thuộc thời điểm nào. Đáp án lặng lẽ bỏ các phát hiện còn tranh cãi để báo cáo trông tự tin hơn là giấu đi chính chỗ chưa chắc.

## Khi số liệu không ghi ngày

Một bản nháp khác báo "mâu thuẫn" giữa hai nguồn. `doc-tai-lieu` lấy từ khảo sát khách hàng nội bộ con số 22% người được hỏi muốn mua xe máy điện, còn `tim-web` lấy từ một khảo sát công khai con số 41%. `tong-hop` đánh dấu đây là hai nguồn cãi nhau. Thật ra khảo sát nội bộ làm năm 2023, còn khảo sát công khai làm năm 2025. Hai con số cho thấy nhu cầu tăng lên, không phải mâu thuẫn.

Lỗi nằm ở chỗ output của các subagent không có ngày. Với dữ liệu thay đổi theo thời gian, bạn phải bắt output có cấu trúc ghi kèm ngày công bố hay ngày thu thập, để hai con số khác thời điểm không bị đọc nhầm thành mâu thuẫn (**requiring publication/collection dates in structured outputs to prevent temporal differences from being misinterpreted as contradictions**). Hậu làm đúng như vậy, thêm field `ngay` vào ánh xạ của mọi subagent, chẳng hạn `"ngay": "công bố 03/2026, số liệu cả năm 2025"` cho con số 12% lấy từ báo cáo ngành. Có trục thời gian, `tong-hop` tách được thay đổi theo thời gian khỏi mâu thuẫn thật.

**Sơ đồ: Không có ngày thì 22% và 41% thành hai nguồn cãi nhau; có ngày thì đó là nhu cầu đang tăng**

✗ _Output không ghi ngày_
1. Khảo sát nội bộ: **22%** muốn mua xe máy điện
2. Khảo sát công khai: **41%**
   ↓ _tong-hop so hai con số_
3. Báo "mâu thuẫn giữa hai nguồn"

✓ _Output ghi ngày thu thập_
1. Khảo sát nội bộ, thu thập năm 2023: **22%**
2. Khảo sát công khai, thu thập năm 2025: **41%**
   ↓ _tong-hop đặt lên trục thời gian_
3. Viết "nhu cầu tăng từ 22% lên 41% sau hai năm"

Ngày cũng quan trọng với tài liệu bị sửa đổi. Hợp đồng nhập cell pin với nhà cung cấp ghi giá 2,1 USD mỗi cell, còn phụ lục 1 đổi thành 1,9 USD từ ngày 01/07/2026. Nếu schema output của `doc-tai-lieu` chỉ có một field `gia_cell`, subagent buộc phải tự chọn một giá trị, và chọn giá nào cũng mất thông tin. Hậu cho field này ghi được nhiều giá trị, mỗi giá trị kèm vị trí trong tài liệu và ngày có hiệu lực. Nhờ vậy `tong-hop` biết giá nào áp dụng ở thời điểm nào.

> **Trong đề chọn gì**
>
> Nếu đề kể agent tìm web lấy số liệu năm 2024 là 35%, còn agent phân tích tài liệu lấy từ báo cáo nội bộ năm 2022 là 18%, và agent tổng hợp đánh dấu nhầm đây là mâu thuẫn, hãy chọn yêu cầu các subagent ghi ngày công bố hay ngày thu thập trong output có cấu trúc. Đáp án thêm agent tự bỏ dữ liệu cũ khi có dữ liệu mới thì mất luôn xu hướng, và vẫn không có ngày để biết cái nào cũ. Đáp án chỉ lấy kết quả web trong 6 tháng gần nhất thì bỏ dữ liệu cũ cần cho so sánh, còn tài liệu nội bộ vẫn không có ngày. Đáp án luôn coi dữ liệu mới nhất là chuẩn và đưa dữ liệu cũ vào phụ lục cũng sai, vì chưa có ngày thì vẫn không biết cái nào mới hơn, còn mâu thuẫn thật trong cùng một kỳ lại bị giấu đi.
>
> Nếu đề kể hợp đồng có điều khoản gốc "thanh toán trong 30 ngày", phụ lục 1 (Amendment 1) đổi thành "45 ngày", và Claude lúc trích ra 30 ngày, lúc trích ra 45 ngày, hãy chọn thiết kế lại schema để field bị sửa đổi ghi được nhiều giá trị, mỗi giá trị kèm vị trí nguồn và ngày có hiệu lực. Đáp án luôn lấy phụ lục mới nhất thì mất lịch sử điều khoản, và sai khi phụ lục chỉ áp dụng cho một phần. Đáp án dùng pattern matching tìm phụ lục rồi đẩy cho người duyệt tay thì tốn công cho việc schema giải quyết được. Đáp án dùng một classifier để bỏ các phần đã bị thay trước khi trích thì xoá luôn thông tin, và classifier cũng có thể bỏ nhầm.

## Trình bày từng loại nội dung trong báo cáo

Từ khi `so-lieu-tai-chinh` trả về JSON doanh thu, biên lợi nhuận và tốc độ tăng trưởng, báo cáo của Hậu trông rất khó đọc. `tong-hop` biến số liệu tài chính thành những đoạn văn dài đầy con số, còn tin tức thị trường lại bị cắt thành gạch đầu dòng cụt lủn.

Báo cáo tổng hợp nên trình bày mỗi loại nội dung theo dạng hợp với nó (**rendering different content types appropriately in synthesis outputs**). Số liệu tài chính nên đặt vào bảng (**financial data as tables**) để người đọc so theo hàng và cột. Tin tức nên viết thành văn xuôi (**news as prose**), vì cần giữ diễn biến và nguyên nhân. Còn kết quả kỹ thuật, như so sánh pin LFP với pin NMC, thì hợp với danh sách có cấu trúc (**technical findings as structured lists**). Ép mọi thứ về một định dạng chung thì loại nào cũng mất đi phần dễ đọc nhất của nó.

Lỗi nằm ở bước trình bày của `tong-hop`, nên Hậu chỉ sửa chỗ đó, bằng cách ghi thêm vào prompt của `tong-hop` cách trình bày cho từng loại nội dung. Output của các subagent vẫn giữ nguyên dạng gốc, vì đó là dạng giữ được nhiều thông tin nhất.

> **Trong đề chọn gì**
>
> Nếu đề kể hệ thống nghiên cứu thêm một agent gọi API tài chính, trả về JSON có cấu trúc, và báo cáo tổng hợp trở nên khó đọc, hãy chọn cập nhật agent tổng hợp để trình bày mỗi loại nội dung cho phù hợp: dữ liệu tài chính thành bảng, tin tức thành văn xuôi. Đáp án chuẩn hoá mọi output thành văn xuôi kèm trích dẫn thì số liệu tài chính khó so sánh. Đáp án thêm tầng chuyển mọi output sang một dạng trung gian chung là thêm một bước mà vẫn ép về một khuôn. Đáp án chuẩn hoá mọi output thành JSON có `claim`, `evidence`, `source`, `confidence` thì tin tức mất mạch kể, và người đọc vẫn nhận về một khuôn chung.

> **Ý chính**
>
> Hãy bắt mỗi subagent xuất ánh xạ nhận định với nguồn, ghi URL hay tên tài liệu, đoạn trích và ngày. Agent tổng hợp phải giữ và gộp các ánh xạ đó tới tận báo cáo cuối. Hai nguồn đáng tin đưa hai con số khác nhau thì giữ cả hai kèm nguồn, đừng chọn bừa. Số liệu có ghi ngày thì agent tổng hợp mới tách được thay đổi theo thời gian khỏi mâu thuẫn thật. Báo cáo tách phần đã vững khỏi phần còn tranh cãi, và trình bày mỗi loại nội dung theo dạng hợp với nó.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 5.6](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/research/multi-agent-research-system)
3. [Citations (Claude API)](https://platform.claude.com/docs/en/build-with-claude/citations)
4. [Prompting best practices (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
