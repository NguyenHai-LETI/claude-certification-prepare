---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-1-tieu-chi-ro-rang
ngay_tai: 2026-11-27
tieu_de: Viết prompt có tiêu chí rõ ràng để bớt báo sai
---

Domain 4: Prompt Engineering & Structured Output · Task 4.1

# Viết prompt có tiêu chí rõ ràng để bớt báo sai

Vì sao dặn "chỉ báo khi chắc chắn" không làm review tốt hơn, cách viết tiêu chí báo gì và bỏ gì, cách định nghĩa mức nghiêm trọng kèm ví dụ code.

- 17 phút đọc
- Đối chiếu docs 22/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Thay lời dặn chung chung bằng tiêu chí cụ thể về cái cần báo và cái bỏ qua
- Hiểu vì sao "hãy thận trọng" hay "chỉ báo khi chắc chắn" không làm review chính xác hơn
- Hiểu báo sai nhiều ở một loại lỗi làm dev mất lòng tin vào cả những loại đang báo đúng
- Tạm tắt loại lỗi hay báo sai trong lúc sửa prompt cho loại đó
- Định nghĩa mức nghiêm trọng kèm ví dụ code cho từng mức

Bạn dựng một bot review code bằng Claude, và sau vài tuần dev bắt đầu bỏ qua mọi comment của nó. Phản xạ đầu tiên thường là thêm vào prompt một câu "chỉ báo những lỗi bạn chắc chắn". Câu đó hầu như không giúp được gì, có khi còn làm bot bỏ sót bug thật.

Bài này chỉ cách viết prompt để Claude báo đúng cái cần báo và bỏ qua cái nên bỏ qua. Bạn sẽ thấy vì sao lời dặn về độ tự tin không lọc được báo sai, tức là những comment chỉ ra thứ không đáng sửa hoặc không phải lỗi thật, cách viết tiêu chí cụ thể, cách xử lý khi dev đã mất lòng tin, và cách định nghĩa mức nghiêm trọng để bot xếp mức ổn định.

**Sơ đồ: Bốn vấn đề của bot review, mỗi vấn đề một cách chữa**
_Bốn vấn đề của bot review và cách chữa. Báo gì, bỏ gì: lời dặn mơ hồ như be conservative không tăng precision, chữa bằng tiêu chí cụ thể báo bug và bảo mật, bỏ minor style và local patterns. Lòng tin của dev: một loại có false positive rates cao làm dev bỏ qua cả loại báo đúng, chữa bằng tạm tắt loại đó, sửa tiêu chí rồi mới bật lại. Xếp mức: chỉ có tên mức thì cùng một lỗi tuần này cao tuần sau trung bình, chữa bằng explicit severity criteria kèm ví dụ code để có consistent classification. Trả lời dev hỏi: chuỗi nếu thì hụt khi dev không nói trình độ, chữa bằng nguyên tắc kèm lý do, giữ điều kiện an toàn._

- **VẤN ĐỀ**
- **CÁCH CHỮA**
- 1. Báo gì,
- bỏ gì
- **Lời dặn mơ hồ**: vague: be conservative,
- precision không tăng
- **Tiêu chí cụ thể**: báo: bug, bảo mật
- bỏ: minor style, local patterns
- 2. Lòng tin
- của dev
- **Một loại báo sai nhiều**: false positive rates cao làm
- dev bỏ qua cả loại báo đúng
- **Tạm tắt loại đó**: temporarily disabling, sửa
- tiêu chí rồi mới bật lại
- 3. Xếp mức
- **Chỉ có tên mức**: cùng một lỗi, tuần này cao,
- tuần sau trung bình
- **Mức kèm ví dụ code**: explicit severity criteria,
- consistent classification
- 4. Trả lời
- dev hỏi
- **Chuỗi nếu… thì…**: hụt khi dev không nói
- trình độ: trả lời quá dài
- **Nguyên tắc kèm lý do**: Claude tự đọc tín hiệu,
- giữ điều kiện an toàn
- đỏ: vấn đề · xanh: cách chữa · mũi tên: chữa bằng

## Ví dụ xuyên suốt: bot review PR của một công ty giao hàng

Một công ty giao hàng ở Biên Hòa có phần mềm điều phối khoảng 400 tài xế, backend viết bằng Python. Đội có 9 dev, chị Hằng là trưởng nhóm. Lộc, một dev trong đội, dựng một bot gọi Claude để review mọi pull request và đăng comment ngay tại dòng code, mỗi comment gắn một nhãn mức nghiêm trọng. Dev còn hỏi lại bot ngay trong PR khi chưa hiểu một comment. Mỗi ngày đội mở khoảng 20 PR.

## Lời dặn "hãy thận trọng" không làm review chính xác hơn

Sau ba tuần, bot đăng trung bình 14 comment mỗi PR. Dev bỏ qua khoảng 70% số comment đó, đánh dấu là "không đáng sửa". Phần lớn là góp ý đặt tên biến, gợi ý tách hàm, và kiểu "docstring này chưa đủ chi tiết". Prompt ban đầu của Lộc chỉ có một dòng chung chung: "Review PR này, tìm lỗi và kiểm tra comment có chính xác không". Chữ "comment" trong câu đó là comment và docstring trong code, khác với comment bot đăng lên PR.

Lộc thử sửa nhanh bằng cách thêm một câu vào prompt: "Hãy thận trọng, chỉ báo những phát hiện bạn rất tự tin". Số comment giảm còn 6 mỗi PR, nhưng tỉ lệ bị bỏ qua gần như không đổi. Tệ hơn, ngay tuần đó một PR mang lỗi tính sai phí giao hàng ở mốc 10 km lọt lên production. Log cho thấy Claude có đọc tới đúng đoạn code chứa lỗi, phần suy luận còn ghi nhận phép so sánh khoảng cách, nhưng không có comment nào.

Những lời dặn chung chung (**vague instructions**) không nói cho Claude biết **cái gì** đáng báo. Ví dụ là "hãy thận trọng" (**be conservative**) hay "chỉ báo phát hiện bạn rất tự tin" (**only report high-confidence findings**). Ở đội Lộc, comment về tên biến vẫn còn, chỉ là ít đi. Số comment giảm đều ở cả lỗi thật lẫn lỗi vặt, chứ lỗi vặt không bị lọc riêng ra. Vì vậy những lời dặn này không làm tăng **precision**, tức là tỉ lệ comment của bot thật sự đáng sửa. Tiêu chí cụ thể theo từng loại lỗi (**specific categorical criteria**) thì làm được.

Dặn Claude tự lọc như vậy còn một tác dụng phụ. Từ Claude Opus 4.8, model làm theo lời dặn sát chữ hơn các model trước. Gặp câu như "chỉ báo lỗi nghiêm trọng" hay "hãy thận trọng", Claude có thể vẫn đọc code kỹ như cũ, vẫn tìm ra bug, rồi không báo những gì nó cho là dưới ngưỡng bạn đặt. Lỗi tính phí của đội Lộc bị sót đúng theo cách đó. Claude vẫn xem code kỹ như trước, chỉ báo ra ít phát hiện hơn. Muốn Claude không giấu phát hiện mà vẫn có output gắn nhãn để lọc, hãy bảo nó báo mọi phát hiện kèm độ tự tin và nhãn mức nghiêm trọng, rồi để một bước phía sau lọc.

Có một chỗ đề thi và tài liệu hiện nay của Anthropic vênh nhau. Đề coi những lời dặn như "hãy thận trọng" là không làm tăng precision. Tài liệu prompting cho Claude Opus 4.8 thì ghi precision thường có nhích lên, nhưng recall, tức là tỉ lệ bug thật được báo ra, có thể tụt. Hai bên cùng đi tới một chỗ: lời dặn này không lọc đúng loại lỗi, nên cách đúng vẫn là tiêu chí cụ thể. Khi đi thi, chọn theo đề.

**Sơ đồ: Dặn "hãy thận trọng" chỉ làm bot nói ít đi: Claude đọc tới lỗi phí ở mốc 10 km mà không báo**

✗ _Dặn Claude tự lọc_
1. Prompt một dòng: **14 comment** mỗi PR, dev bỏ qua khoảng **70%**
   ↓ _Lộc thêm "chỉ báo những phát hiện bạn rất tự tin"_
2. Claude vẫn đọc tới đoạn tính phí ở mốc 10 km, nhưng không báo
3. **6 comment mỗi PR** dev vẫn bỏ qua khoảng 70%, lỗi phí lọt lên production

✓ _Báo hết, để bước sau lọc_
1. Claude báo mọi phát hiện tìm ra, không tự giấu cái nó cho là dưới ngưỡng
   ↓ _mỗi phát hiện kèm độ tự tin và nhãn mức nghiêm trọng_
2. Bước sau xếp hạng và lọc theo nhãn
3. **Không giấu lỗi** lỗi phí ở mốc 10 km có trong output, bước sau quyết định giữ hay bỏ

> **Bẫy đề**
>
> Prompt review có câu "Only flag critical issues that would definitely cause production failures. Ignore minor concerns and anything you're uncertain about." Bot bỏ sót những bug logic thật mà model đã xem xét nhưng chọn không báo. Đội muốn output vẫn có cấu trúc, mỗi phát hiện gắn nhãn để lọc. Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Bỏ hết hướng dẫn về mức nghiêm trọng, để model tự phán đoán nên báo gì** (_remove all severity guidance_). Nghe như gỡ được cái ngưỡng khiến bot bỏ sót bug. Nhưng model mất luôn nhãn mức nghiêm trọng mà bước sau cần để lọc.
> - **Thêm một lần review thứ hai đọc lại diff bằng cùng prompt** (_second review pass_). Cách này nghe như bắt được phần lần đầu bỏ sót. Có điều lần hai vẫn mang đúng câu dặn lọc đó, nên vẫn giấu đúng những phát hiện ấy.
> - **Bật extended thinking để model suy luận từng bước về mỗi thay đổi** (_extended thinking_). Nghe như giúp model xem kỹ hơn. Ngặt nỗi model vốn đã xem kỹ và tìm ra bug rồi, chỗ hỏng nằm ở câu dặn bảo nó đừng báo.
>
> **Chọn:** bảo model báo mọi phát hiện kèm độ tự tin và nhãn mức nghiêm trọng, rồi để một bước phía sau lọc.

## Viết tiêu chí cụ thể: báo gì và bỏ qua gì

Lộc bỏ câu "hãy thận trọng" và xem lại từng loại comment bị dev bỏ qua. Tệ nhất là nhóm comment bot đăng khi kiểm tra comment trong code (_check that comments are accurate_). Lời dặn "kiểm tra comment có chính xác không" để Claude tự hiểu thế nào là chính xác, nên comment ngắn, comment thiếu chi tiết hay comment viết vụng đều bị báo.

Tiêu chí rõ ràng (**explicit criteria**) thì nói đúng điều kiện để báo. Lộc đổi lời dặn thành: "Chỉ báo một comment khi nó nêu một hành vi mà code làm khác, và dẫn dòng code mâu thuẫn với nó". Ví dụ docstring của hàm `tim_tai_xe_gan_nhat` ghi "trả về None nếu không có tài xế trong bán kính 3 km", trong khi code ném `KhongTimThayTaiXe`. Docstring đó sai thật, bot dẫn được dòng `raise` mâu thuẫn với nó, và dev sửa ngay. Còn docstring ngắn nhưng đúng thì không còn bị báo.

Claude giống một nhân viên mới rất giỏi nhưng chưa biết quy ước của đội. Bạn giải thích càng cụ thể, kết quả càng sát ý. Lộc viết lại cả prompt theo hướng đó, nói rõ loại nào cần báo và loại nào bỏ qua, kèm lý do ở những dòng dễ gây thắc mắc.

```
Báo:
- Lỗi logic làm sai kết quả, ví dụ tính sai phí giao hàng hay gán đơn cho tài xế đang nghỉ.
- Lỗi bảo mật: lộ số điện thoại khách, thiếu kiểm quyền, SQL ghép chuỗi.
- Comment nêu một hành vi mà code làm khác (dẫn dòng code mâu thuẫn).

Bỏ qua:
- Cách đặt tên, độ dài hàm, cách viết vòng lặp. Đội đã có linter cho phần này.
- Những mẫu code đội đang dùng chung trong repo, dù bạn thấy có cách hay hơn.
- Comment ngắn hoặc thiếu chi tiết nhưng không sai.
```

Danh sách này nói rõ loại vấn đề cần báo là bug và bảo mật. Loại bỏ qua là style nhỏ (**minor style**) và các mẫu code riêng của dự án (**local patterns**). Như vậy Claude không phải tự lọc theo độ tự tin (**confidence-based filtering**). Nếu pipeline có bước lọc riêng phía sau, cách báo hết kèm độ tự tin và mức nghiêm trọng cũng dùng được. Còn nếu Claude phải tự lọc ngay trong một lần gọi, hãy mô tả ngưỡng bằng tiêu chí cụ thể, giống danh sách báo và bỏ qua của Lộc, đừng dùng chữ "quan trọng" hay "chắc chắn".

> **Bẫy đề**
>
> Review tự động sinh nhiều phát hiện cho mỗi PR, nhưng dev bỏ qua khoảng một nửa vì "không đáng sửa". Phần bị bỏ qua thường đúng về kỹ thuật nhưng chỉ là style nhỏ hay các mẫu code đội chấp nhận. Trước khi thêm hạ tầng, nên đổi gì trong prompt? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Dựng một model phân loại thứ hai để lọc phát hiện theo khả năng dev chấp nhận** (_a second classifier model_). Nghe như lọc được tự động. Nhưng đề hỏi đổi prompt trước khi thêm hạ tầng, và model lọc cũng không biết ranh giới "đáng báo" của đội.
> - **Thêm câu "chỉ báo những phát hiện bạn rất tự tin là vấn đề thật"** (_only high-confidence findings_). Cách này nghe như bớt được báo sai. Có điều góp ý style vẫn đúng về kỹ thuật, nên Claude vẫn tự tin về chúng và vẫn báo.
> - **Bắt Claude chấm độ tự tin 1–10 cho từng phát hiện, chỉ giữ từ 8 trở lên** (_confidence score threshold_). Nghe như có con số khách quan. Ngặt nỗi điểm tự tin không nói phát hiện đó có thuộc loại đội cần hay không.
>
> **Chọn:** thêm tiêu chí rõ ràng nói loại vấn đề cần báo (bug, bảo mật) và loại bỏ qua (style nhỏ, mẫu riêng của dự án).

> **Trong đề chọn gì**
>
> Nếu đề hỏi câu nào thay tốt nhất cho lời dặn "check that comments are accurate", hãy chọn lời dặn bảo Claude chỉ báo khi comment trong code nêu một hành vi cụ thể mà code làm khác, kèm ví dụ và dẫn dòng code mâu thuẫn. Câu "chỉ báo khi đủ quan trọng để dev chú ý" vẫn để Claude tự đoán thế nào là quan trọng. Câu "chỉ báo khi lệch style guide hoặc thiếu chi tiết" lại khuyến khích đúng kiểu bắt bẻ câu chữ mà dev đang bỏ qua. Câu "chỉ báo khi bạn rất tự tin" vẫn là lọc theo độ tự tin.

Lời dặn cụ thể còn chữa được một kiểu bỏ sót khác của bot. Bot bắt được những hàm hoàn toàn chưa có test, nhưng lại sót nhánh `if` hay nhánh xử lý lỗi chưa có test nằm trong một hàm đã có test. Lý do là bot đang xét ở mức hàm. Lộc ghi thêm vào prompt rằng bot phải liệt kê từng nhánh điều kiện và từng nhánh exception trong code thay đổi, rồi kiểm tra mỗi nhánh đã có assertion trong file test chưa. Chỉ một lời dặn là bot xét tới từng nhánh, không cần thêm lần gọi nào.

Khi trả lời dev hỏi lại trong PR, bot từng mở đầu câu nào cũng bằng "Chắc chắn rồi!". Lộc chữa cũng bằng một lời dặn nói thẳng, ghi vào system prompt rằng không được mở đầu câu trả lời bằng những cụm như vậy.

> **Trong đề chọn gì**
>
> Nếu đề kể review bắt được hàm chưa có test nhưng sót nhánh điều kiện chưa có test bên trong hàm đã có test, hãy chọn thêm lời dặn bảo model liệt kê từng nhánh điều kiện và nhánh exception, rồi kiểm mỗi nhánh có assertion chưa. Tách thành pipeline nhiều lần gọi là thêm hạ tầng cho việc một lời dặn làm được. Xếp code và test xen kẽ nhau trong prompt cũng không khiến model xét tới từng nhánh. Thêm ví dụ few-shot về một nhánh thiếu test chỉ dạy một trường hợp, không bắt model đi hết mọi nhánh.
>
> Nếu đề kể câu trả lời nào cũng mở đầu bằng "Certainly!" hay "I'd be happy to help!", hãy chọn thêm vào system prompt một lời dặn nêu thẳng các cụm không được dùng để mở đầu. Viết code cắt câu chào khỏi output chỉ nên dùng để gỡ những lần thỉnh thoảng còn lọt, gốc vẫn là sửa lời dặn. Cách prefill, tức là viết sẵn phần đầu câu trả lời trong message assistant cuối, không còn dùng được từ các model Claude 4.6 trở đi. Hạ temperature (tham số chỉnh độ ngẫu nhiên của câu trả lời) không nhắm vào câu mở đầu.

## Khi một loại comment hay báo sai, dev bỏ qua cả bot

Quay lại tuần thứ ba, khi bot còn chạy prompt một dòng, đội từng gặp một chuyện. Bot đăng một comment đúng: API `chi_tiet_don` trả cả số điện thoại khách cho tài xế đã huỷ đơn. Comment đó nằm giữa 13 comment về đặt tên và docstring, và dev duyệt PR bỏ qua luôn. Chị Hằng chỉ phát hiện ra khi khách gọi lên phàn nàn.

Dev không đọc từng comment rồi đánh giá riêng. Khi thấy phần lớn comment về đặt tên là vô nghĩa, họ kết luận "bot này nói nhảm" và bỏ qua cả loại comment về bảo mật, dù loại đó vẫn báo đúng. Tỉ lệ báo sai (**false positive rates**) tác động tới lòng tin của dev (**developer trust**) theo đúng cách đó. Chỉ cần một loại comment hay báo sai là dev mất tin luôn cả những loại đang báo đúng.

Ngay hôm đó, chị Hằng bảo Lộc tạm tắt (**temporarily disabling**) hai loại hay báo sai nhất (**high false-positive categories**), là góp ý style và kiểm tra comment trong code, và chỉ giữ lại lỗi logic với lỗi bảo mật. Bot vẫn chạy trên mọi PR, chỉ là ít comment hơn và comment nào cũng đáng đọc. Trong lúc hai loại kia bị tắt, Lộc viết tiêu chí báo và bỏ qua cho chúng, rồi chạy thử trên 50 PR cũ mà đội đã biết comment nào đúng. Góp ý style vẫn nằm trong danh sách bỏ qua. Khi tỉ lệ báo sai của loại kiểm tra comment xuống mức đội chấp nhận được, Lộc mới bật lại loại đó.

**Sơ đồ: Comment đúng về chi_tiet_don chìm giữa 13 comment vặt; tạm tắt hai loại hay báo sai để dev tin lại**
_Bước 1, một PR trước khi tắt: 13 comment vặt về đặt tên và docstring thuộc hai loại góp ý style và kiểm tra comment; một comment đúng thuộc loại lỗi bảo mật: API chi_tiet_don trả số điện thoại khách cho tài xế đã huỷ đơn. Comment đúng bị chìm, dev bỏ qua luôn, rồi khách gọi lên phàn nàn và chị Hằng mới biết. Bước 2, chị Hằng bảo tạm tắt góp ý style và kiểm tra comment, giữ lỗi bảo mật và lỗi logic. Lộc sửa prompt cho hai loại bị tắt, thử trên 50 PR cũ, rồi bật lại kiểm tra comment khi tỉ lệ báo sai xuống mức chấp nhận được; góp ý style vẫn tắt._

- 1. **MỘT PR TRƯỚC KHI TẮT**
- 2. **CHỊ HẰNG BẢO TẠM TẮT**
- **13 comment vặt**: về đặt tên và docstring
- **Comment đúng, bị chìm**: chi_tiet_don trả số điện thoại
- khách cho tài xế đã huỷ đơn
- **Dev bỏ qua luôn**: kể cả comment về bảo mật
- **Khách gọi lên phàn nàn**: chị Hằng mới biết, sang bước 2
- nét đứt: comment thuộc loại nào
- **Góp ý style**: tắt
- **Kiểm tra comment**: tắt
- **Lỗi bảo mật**: bật
- **Lỗi logic**: bật
- **Sửa prompt, thử trên 50 PR cũ**: cho hai loại bị tắt
- **Bật lại kiểm tra comment**: khi báo sai đủ thấp; style vẫn tắt

> **Trong đề chọn gì**
>
> Nếu đề kể dev bắt đầu bỏ qua cả comment đúng vì có một loại comment báo sai nhiều, hãy chọn tạm tắt loại đó để lấy lại lòng tin, giữ các loại đang báo đúng, rồi sửa prompt cho loại bị tắt trước khi bật lại. Tắt cả bot là bỏ luôn phần đang có ích. Giữ nguyên rồi bảo dev tự lọc thì dev vẫn tiếp tục bỏ qua cả comment đúng.

## Mức nghiêm trọng kèm ví dụ code

Khi bot chạy lại ổn, đội gặp chuyện khác. Cùng một kiểu lỗi, thiếu kiểm tra quyền ở một API, tuần này bot xếp "cao", tuần sau lại xếp "trung bình". Dev không biết nên sửa comment nào trước. Chữ "nghiêm trọng" mỗi người hiểu một kiểu, và Claude cũng vậy.

Cách sửa là định nghĩa rõ từng mức (**explicit severity criteria**) bằng tiêu chí, và kèm một ví dụ code cụ thể cho mỗi mức (**concrete code examples**). Lộc thêm vào prompt một bảng như sau.

| Mức | Tiêu chí | Ví dụ code trong repo |
| --- | --- | --- |
| Khẩn cấp | Lộ dữ liệu cá nhân hoặc cho người không có quyền thao tác | `chi_tiet_don` trả số điện thoại khách mà không kiểm tài xế còn giữ đơn |
| Cao | Sai kết quả nghiệp vụ, không lộ dữ liệu | Tính phí đơn từ 10 km trở lên bằng `>` thay vì `>=`, đơn đúng 10 km bị tính giá nội thành |
| Trung bình | Có thể gây lỗi trong trường hợp hiếm | Không xử lý khi tài xế gửi toạ độ GPS rỗng lúc mất sóng |

Có ví dụ code, Claude so một lỗi mới với các mẫu này thay vì tự đoán, nên xếp mức ổn định hơn hẳn (**consistent classification**). Lỗi thiếu kiểm tra quyền ở API giờ được xếp vào mức khẩn cấp, vì nó giống ví dụ `chi_tiet_don`.

> **Ý chính**
>
> Chỉ có tên mức thì mỗi lần Claude hiểu một kiểu. Có ví dụ code cho từng mức thì Claude so lỗi mới với ví dụ, nên các lần xếp khớp nhau.

## Khi nào viết nguyên tắc kèm lý do thay cho chuỗi "nếu… thì…"

Bot của Lộc còn trả lời khi dev hỏi lại trong PR, ví dụ "@bot giải thích chỗ này". Lộc viết vào prompt một chuỗi điều kiện: nếu dev ghi "em mới vào" thì giải thích từng bước, nếu dev dùng từ như "race condition" thì trả lời ngắn, nếu thay đổi chạm vào module thanh toán thì luôn nhắc cần chị Hằng duyệt. Bot làm đúng khi dev nói rõ trình độ, nhưng phần lớn dev không nói, và bot cứ trả lời dài như cho người mới.

Tiêu chí cụ thể không có nghĩa là viết một chuỗi "nếu… thì…" cho từng trường hợp. Trình độ người hỏi thường lộ ra qua những tín hiệu ngầm, như cách họ đặt câu hỏi hay chữ họ dùng, mà những tín hiệu đó thì không liệt kê hết bằng điều kiện được. Lộc thay phần lớn các điều kiện bằng một nguyên tắc kèm lý do: "Điều chỉnh độ sâu giải thích theo trình độ của người hỏi, dùng lại đúng thuật ngữ họ dùng, vì dev lâu năm cần câu trả lời ngắn còn dev mới cần thấy từng bước". Khi biết lý do, Claude thường tự suy ra được cách làm cho cả những tín hiệu không có trong prompt. Lộc chỉ giữ lại điều kiện cứng về module thanh toán, vì đó là quy tắc an toàn, không được để Claude tự phán đoán.

**Sơ đồ: Thay cả chuỗi nếu… thì… về trình độ bằng một nguyên tắc; điều kiện thanh toán giữ nguyên**
- Prompt mới
- Prompt cũ: chuỗi nếu… thì…
- thay bằng
- giữ nguyên
- nếu ghi 'em mới vào'thì giải thích từng bước
- nếu dùng 'race condition'thì trả lời ngắn
- không điều kiện nào khớp(phần lớn dev không nóitrình độ): trả lời dàinhư cho người mới
- nếu chạm module thanh toánthì nhắc cần chị Hằng duyệt
- Nguyên tắc kèm lý do:độ sâu theo trình độ,dùng lại thuật ngữ người hỏi
- Điều kiện cứng, giữ nguyên:nhắc cần chị Hằng duyệt

> **Trong đề chọn gì**
>
> Nếu đề kể một trợ lý có system prompt toàn điều kiện kiểu "nếu người dùng nói là người mới thì…", làm đúng khi người dùng nói rõ trình độ nhưng lúng túng khi họ không nói, hãy chọn thay phần lớn điều kiện bằng một nguyên tắc chung như "điều chỉnh độ sâu giải thích theo trình độ người dùng, dùng lại thuật ngữ của họ", chỉ giữ điều kiện về an toàn. Thêm nhánh điều kiện cho từng tín hiệu mới thì không bao giờ liệt kê hết được. Bắt người dùng tự chấm trình độ trước cuộc trò chuyện, hay hỏi lại trình độ mỗi khi tin nhắn đầu chưa rõ, đều thêm bước cho người dùng thay vì để Claude tự đọc tín hiệu.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 4.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Prompting best practices (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
3. [Prompting Claude Opus 4.8 (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)
