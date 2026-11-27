---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-1-quan-ly-context
ngay_tai: 2026-11-27
tieu_de: Giữ thông tin quan trọng trong cuộc trò chuyện dài
---

Domain 5: Context Management & Reliability · Task 5.1

# Giữ thông tin quan trọng trong cuộc trò chuyện dài

Messages API không nhớ gì giữa các lần gọi. Cách giữ số liệu khỏi bị bản tóm tắt làm rơi, cắt kết quả tool cho gọn, và sắp đầu vào dài để Claude không sót.

- 31 phút đọc
- Đối chiếu docs 22/11/2026
- 9 nguồn

## Đọc xong bạn nắm được

- Gửi lại đủ lịch sử và system prompt ở mỗi lần gọi Messages API
- Tóm tắt phần cũ, giữ nguyên văn phần gần, và tách số tiền, ngày, mã đơn ra một khối case facts riêng
- Cắt kết quả tool chỉ còn các field cần dùng trước khi chúng dồn vào context
- Đặt tóm tắt phát hiện chính ở đầu đầu vào dài và chia mục có tiêu đề để giảm sót thông tin ở giữa
- Bắt subagent trả dữ liệu có cấu trúc kèm ngày, nguồn và cách làm

Một cuộc chat hỗ trợ khách có thể kéo dài cả tiếng, với hàng chục tin nhắn, vài lần tra cứu và ba bốn vấn đề khác nhau. Claude không tự nhớ gì giữa các lần gọi API, nên mọi thứ nó biết về cuộc trò chuyện đều nằm trong những gì ứng dụng của bạn gửi lên. Gửi thiếu thì Claude quên. Gửi quá nhiều, hay gửi sai cách, thì thứ quan trọng bị chìm hoặc bị nén mất.

Bài này giúp bạn quyết định gửi gì trong mỗi lần gọi. Bạn sẽ biết vì sao bản tóm tắt hay làm rơi số tiền và ngày hẹn, cách giữ chúng trong một khối riêng, cách cắt kết quả tool trước khi chúng chiếm chỗ, và cách sắp đầu vào dài để Claude không bỏ sót phần ở giữa.

**Sơ đồ: Request nào cũng phải đủ và gọn; đầu vào dài thì đặt tóm tắt ở đầu, yêu cầu ở cuối**
_Bản đồ bài. Hai khung trên là hai đòi hỏi với mỗi request gửi lên Messages API. Khung trái, gửi lại đủ ở mọi lần gọi: vì API stateless, không nhớ gì giữa các lần gọi, nên mỗi request cần system prompt với vai trò và nguyên tắc, toàn bộ lịch sử trong mảng messages, và lời nhắc nguyên tắc hay tin mới chèn giữa chừng. Khung phải, gửi gọn mà không mất số liệu: vì context rot, càng nhiều token càng kém chính xác, nên cần tóm tắt phần cũ và giữ nguyên văn phần gần, khối case facts giữ mã đơn, số tiền, ngày, và kết quả tool chỉ còn field cần dùng. Khung dưới: ba subagent trả dữ liệu có cấu trúc kèm ngày, nguồn, cách làm; mỗi subagent gửi kết quả vào một mục có tiêu đề riêng ở giữa đầu vào của agent tổng hợp, đầu vào này mở đầu bằng tóm tắt phát hiện chính và kết thúc bằng yêu cầu, rồi được gửi tới agent tổng hợp_

- **GỬI LẠI ĐỦ Ở MỌI LẦN GỌI**
- **Stateless**: API không nhớ gì giữa các lần gọi
- vì vậy mỗi request cần có:
- System prompt: vai trò, nguyên tắc
- Toàn bộ lịch sử trong mảng messages
- Nhắc nguyên tắc, báo tin mới giữa chừng
- **GỬI GỌN, KHÔNG MẤT SỐ LIỆU**
- **Context rot**: càng nhiều token, càng kém chính xác
- vì vậy mỗi request nên:
- Tóm tắt phần cũ, nguyên văn phần gần
- Khối case facts: mã đơn, số tiền, ngày
- Kết quả tool chỉ còn field cần dùng
- **ĐẦU VÀO DÀI CỦA AGENT TỔNG HỢP**: Subagent 1
- Subagent 2
- Subagent 3
- trả dữ liệu có cấu trúc,
- kèm ngày, nguồn, cách làm
- Đầu: tóm tắt phát hiện chính
- Giữa: mục subagent 1, có tiêu đề
- Giữa: mục subagent 2, có tiêu đề
- Giữa: mục subagent 3, có tiêu đề
- Cuối: yêu cầu, câu hỏi
- **Agent**
- **tổng hợp**: mũi tên: gửi tới

## Ví dụ xuyên suốt: trợ lý chat của một app thuê xe tự lái

Một công ty ở Đà Lạt cho thuê 300 xe máy và 80 ô tô tự lái qua app. Khách đặt xe, đặt cọc, nhận xe, rồi trả xe và chờ hoàn cọc sau khi nhân viên kiểm tra xe. Đội công nghệ có 4 dev. Chị Diệp là trưởng nhóm, còn Vũ phụ trách trợ lý chat dùng Claude để trả lời khách. Trợ lý có các tool `tra_don_thue`, `tim_xe_trong`, `gia_han_thue` và `tra_chinh_sach`. Đội còn một agent tổng hợp chuyên viết báo cáo tháng cho ban giám đốc. Nó gom kết quả từ ba subagent, tức ba agent con, mỗi agent lo một phần việc: một subagent đọc đánh giá trên Google Maps, một subagent đọc ticket hỗ trợ và bản ghi cuộc gọi tổng đài, và một subagent đọc phiếu bảo dưỡng xe.

## Gửi lại đủ lịch sử và system prompt ở mỗi lần gọi

Bản thử đầu tiên của Vũ chỉ gửi tin nhắn mới nhất của khách lên API. Anh Tâm nhắn mã đơn `TX-3318`, hỏi về tiền cọc, rồi hỏi tiếp "vậy phí trầy xước tính sao?". Trợ lý trả lời bằng cách hỏi lại mã đơn, như thể chưa từng nói chuyện.

Messages API không giữ trạng thái giữa các lần gọi (**stateless**). Mỗi lần gọi, Claude chỉ thấy những gì nằm trong request đó, nên bạn phải gửi lại toàn bộ lịch sử trò chuyện trong mảng `messages`, là mảng chứa lần lượt các tin nhắn của người dùng và của Claude (**passing complete conversation history in subsequent API requests**). Messages API không có tham số session nào để tự nhớ hộ. Vũ sửa code để mỗi lần gọi gửi lại cả các tin nhắn trước, gồm cả câu trả lời của trợ lý, rồi mới nối tin nhắn mới vào cuối.

Tuần sau, chị Diệp thấy một lỗi khác. System prompt dặn trợ lý xưng "anh/chị", luôn đọc lại mã đơn trước khi báo số tiền, không hứa ngày hoàn cọc khi kế toán chưa duyệt, và kết thúc mỗi cuộc chat bằng một dòng tóm tắt việc đã làm. Ba bốn tin nhắn đầu trợ lý làm đúng, nhưng tới tin nhắn thứ bảy thì trả lời trống không, chẳng còn đọc lại mã đơn. Cuộc chat lúc đó mới khoảng 2.000 token. Vũ tìm ra là sau khi tách hàm, code chỉ gửi trường `system` ở lần gọi đầu.

System prompt nằm ở trường `system` cấp cao nhất của request, tách khỏi mảng `messages`, và cũng phải được gửi lại ở mọi lần gọi. Thiếu nó, Claude không còn biết vai trò và các nguyên tắc của trợ lý. Những hành vi và giọng điệu trợ lý phải giữ suốt cuộc trò chuyện, như cách xưng hô hay việc luôn đọc lại mã đơn, cũng nên đặt ở system prompt.

> **Bẫy đề**
>
> Khi test, một trợ lý dạy từ vựng có vẻ không nhớ các từ đã học trước đó trong cùng cuộc trò chuyện. Học sinh hỏi "Can you quiz me on those words?" thì nó trả lời như chưa từ nào được nhắc tới. Giải thích nào hợp lý nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Context window đã đầy nên phần cũ bị bỏ** (_context window full_). Nghe như giới hạn kỹ thuật. Nhưng một buổi học từ vựng chỉ vài nghìn token, còn xa mới chạm giới hạn.
> - **System prompt cần dặn Claude nhớ thông tin từ các tin nhắn trước** (_instruct it to remember_). Nghe như thiếu một câu dặn. Có điều Claude không thể nhớ thứ không được gửi lên, dặn kiểu gì cũng vậy.
> - **Phải bật lưu hội thoại bằng tham số session ID** (_session ID parameter_). Nghe như một cấu hình bị quên. Ngặt nỗi Messages API không có tham số đó, vì API không giữ trạng thái.
>
> **Chọn:** nguyên nhân là ứng dụng không gửi kèm các tin nhắn trước trong mỗi request. API không giữ trạng thái nên không tự lưu lịch sử.

> **Trong đề chọn gì**
>
> Nếu đề kể agent xác minh danh tính qua nhiều bước, và sau câu trả lời thứ ba lại hỏi tên khách như chưa từng trao đổi, hãy chọn nguyên nhân là lịch sử cuộc trò chuyện không được gửi kèm ở các request sau. Các đáp án sai đổ cho chuyện prompt thiếu câu dặn nhớ, tool xác minh xoá trạng thái nội bộ của agent, hoặc Claude mặc định chỉ nhớ hai lần trao đổi. Cả ba đều sai, vì ngoài những gì có trong request, Claude không giữ gì cả.
>
> Nếu đề kể trợ lý gợi ý playlist hỏi lại thể loại nhạc dù người dùng vừa nói thích jazz, hãy chọn nguyên nhân là ứng dụng không đưa các tin nhắn trước vào mảng `messages`. Vài tin nhắn thì chưa thể vượt context window, còn vector database hay tham số `session_id` đều không phải thứ API cần.
>
> Nếu đề kể trợ lý theo đúng nguyên tắc trong system prompt ở mấy tin nhắn đầu rồi bỏ hẳn từ tin nhắn thứ bảy, khi cuộc chat mới 2.000 token, hãy chọn nguyên nhân là system prompt chỉ được gửi ở request đầu. Ba đáp án còn lại nói sự chú ý của Claude tự yếu dần, các câu trả lời trước làm loãng system prompt, hoặc system prompt chỉ định hình hành vi lúc đầu. Ở 2.000 token thì những chuyện đó không xảy ra, và system prompt có tác dụng ở mọi lần gọi miễn là nó được gửi lên.
>
> Nếu đề hỏi nên đặt các nguyên tắc hành vi cần giữ ổn định qua mọi lần tương tác ở đâu, như luôn hào hứng, luôn giải thích lý do gợi ý, hãy chọn system prompt. Biến môi trường của ứng dụng thì Claude không bao giờ thấy. Đặt trong tin nhắn assistant đầu tiên hay chèn vào đầu mỗi tin nhắn user là biến chỉ dẫn của ứng dụng thành một phần lời hội thoại.

## Nhắc lại nguyên tắc và báo tin mới giữa cuộc trò chuyện

Sửa xong lỗi system prompt, đội lại gặp chuyện trợ lý dần làm lệch khỏi các nguyên tắc đã dặn. Một khách chat suốt buổi chiều để lên lịch thuê xe cho cả nhóm, hơn 30 tin nhắn. System prompt vẫn được gửi đủ, context mới dùng một phần rất nhỏ, vậy mà từ khoảng tin nhắn thứ 25, trợ lý bắt đầu quên dòng tóm tắt cuối và có lúc hứa ngày hoàn cọc dù kế toán chưa duyệt.

Cách chữa quen thuộc, cũng là đáp án của đề, là chèn một tin nhắn role `user` nhắc lại các nguyên tắc quan trọng ở những điểm ngắt tự nhiên của cuộc trò chuyện, như lúc khách chuyển sang chuyện mới, nhất là ngay trước một yêu cầu phức tạp. Nhờ vậy lời nhắc nằm gần chỗ Claude đang trả lời, chứ không chỉ nằm tận đầu cuộc trò chuyện.

Claude API hiện có thêm một cách mà đề chưa nhắc tới: chèn một tin nhắn role `system` vào giữa mảng `messages` (**mid-conversation system message**), ngay tại điểm nguyên tắc cần áp dụng. Cách này dùng được trên Claude Opus 5.5, Opus 5, Opus 4.8, Sonnet 5.5, Haiku 5.5 và các model Fable, Mythos, nhưng không dùng được trên Sonnet 5. Khác với tin nhắn role `user`, tin nhắn role `system` được tính là lời của ứng dụng chứ không phải của người dùng, nên khi hai bên mâu thuẫn thì nó được ưu tiên. Nó cũng không đụng tới trường `system` ở đầu request, nên phần đầu prompt mà API đã lưu cache (lưu lại để lần gọi sau đọc nhanh và rẻ hơn) vẫn dùng lại được. Khi thi, nếu các đáp án không có cách này thì chọn tin nhắn role `user` nhắc nguyên tắc.

Cùng chiều hôm đó, chị Hạnh đang chat hỏi bao giờ nhận được tiền cọc của đơn `TX-3402` thì kế toán bấm xác nhận đã chuyển khoản, và hệ thống nhận một webhook báo chuyện này. Đây là thông tin trạng thái mà ứng dụng biết, không phải lời của khách. Vũ thêm trạng thái mới vào system prompt trước lần gọi API kế tiếp, nên khi chị Hạnh nhắn tiếp, Claude tự lồng tin đó vào câu trả lời. Cách này làm đổi trường `system` ở đầu request, nên phần đã cache bị mất. Nếu model đang dùng có hỗ trợ, cách tốt hơn là đưa tin trạng thái vào một tin nhắn role `system` chèn giữa cuộc trò chuyện.

> **Trong đề chọn gì**
>
> Nếu đề kể Claude theo đúng system prompt ở 10–15 tin nhắn đầu nhưng tới 25–30 tin nhắn thì lệch giọng, bỏ định dạng, khi context mới dùng khoảng 30.000 trên 200.000 token, hãy chọn chèn tin nhắn role `user` nhắc lại nguyên tắc ở các điểm ngắt tự nhiên, nhất là trước yêu cầu phức tạp. Tự mở cuộc trò chuyện mới sau 20 tin nhắn kèm bản tóm tắt thì mất chi tiết, trong khi context còn dư nhiều. Chuyển nguyên tắc sang tin nhắn user đầu tiên thì chúng vẫn nằm ở tận đầu cuộc trò chuyện. Kiểm tra rồi sinh lại từng câu trả lời chỉ chữa triệu chứng, tốn thêm nhiều lần gọi.
>
> Nếu đề kể webhook báo kiện hàng đã gửi đi trong lúc người dùng đang chat, và hỏi cách để câu trả lời kế tiếp lồng tin này vào tự nhiên, hãy chọn thêm trạng thái giao hàng vào system prompt trước lần gọi API kế tiếp. Gửi ngay một request với tin nhắn user giả sẽ sinh ra một câu trả lời không ai hỏi. Nối thông tin vào đầu tin nhắn kế tiếp của người dùng là trộn lời của ứng dụng vào lời khách. Bắt trợ lý gọi tool tra trạng thái ở đầu mọi câu trả lời thì tốn một lần gọi tool cho cả những câu không liên quan.

## Tóm tắt phần cũ, giữ nguyên văn phần gần

Cuộc chat của anh Tâm kéo dài gần một tiếng, vì anh hỏi luôn chuyện gia hạn chiếc xe máy của vợ và đổi cách nhận tiền hoàn. Vũ không muốn gửi lại hàng chục tin nhắn cũ ở mỗi lần gọi, vì càng nhiều token thì Claude càng kém chính xác và càng khó nhớ lại chi tiết. Hiện tượng này gọi là **context rot**, nên gửi nhiều hơn chưa chắc đã tốt hơn.

Vũ chọn cách tóm tắt dần (**progressive summarization**). Khi cuộc chat dài tới một ngưỡng, các tin nhắn cũ được thay bằng một bản tóm tắt, còn khoảng sáu tin nhắn gần nhất vẫn gửi nguyên văn. Bản tóm tắt giữ cho trợ lý biết đại ý chuyện cũ, còn phần nguyên văn đủ chi tiết cho chuyện đang bàn. Claude API có tính năng compaction (đang ở bản beta), tức tự nén phần cũ của cuộc trò chuyện thành bản tóm tắt. Bạn có thể tự gọi nó khi cần, hoặc để API tự chạy khi số token đầu vào chạm ngưỡng bạn đặt. Compaction giữ nguyên văn được vài tin nhắn gần nhất và cho bạn viết prompt tóm tắt riêng. Bạn cũng có thể dùng bộ tóm tắt tự viết.

Prompt tóm tắt nên nói rõ cần rút ra những gì. Nếu phần sau của cuộc trò chuyện dựa vào kết luận của phần trước, hãy dặn Claude ghi rõ các kết luận, quyết định và chủ đề lặp lại, thay vì chỉ kể đã bàn những chuyện gì.

> **Bẫy đề**
>
> Người dùng phản ánh trong các cuộc trò chuyện dài, trợ lý quên chủ đề, ví dụ và sở thích họ nhắc trước đó. Ứng dụng đang dùng cửa sổ trượt (**sliding window**), chỉ giữ 25 cặp tin nhắn gần nhất. Cách nào vẫn nắm được nội dung cũ mà kiểm soát được kích thước context? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tăng cửa sổ lên 50 cặp tin nhắn** (_bigger window_). Nghe như giữ thêm được nhiều. Nhưng cách này chỉ dời điểm quên ra xa hơn, cuộc trò chuyện đủ dài thì vẫn quên.
> - **Thêm một lần gọi API riêng ở mỗi tin nhắn để tóm tắt phần sắp bị bỏ, đặt bản tóm tắt cộng dồn lên đầu** (_summarize every turn_). Cách này gần đúng. Có điều nó tốn thêm một lần gọi Claude ở mọi tin nhắn và làm chậm từng câu trả lời, trong khi chỉ cần tóm tắt khi lịch sử gần chạm ngưỡng.
> - **Tìm các tin nhắn cũ liên quan bằng vector similarity search cho mỗi câu hỏi** (_vector retrieval_). Nghe hiện đại. Ngặt nỗi các tin nhắn lấy ra là từng mảnh rời, mất mạch của cuộc trò chuyện, và phải dựng thêm cả một hệ tìm kiếm.
>
> **Chọn:** bỏ cửa sổ trượt, chuyển sang tóm tắt các tin nhắn cũ và giữ nguyên văn các tin nhắn gần đây.

> **Trong đề chọn gì**
>
> Nếu đề kể một nhóm đọc sách họp hằng tuần, lịch sử lên tới 85.000 token, và khi hỏi "What did we conclude about the theme of isolation?" thì trợ lý chỉ phân tích chung chung, hãy chọn tóm tắt dần với bản tóm tắt ghi rõ kết luận, quyết định và chủ đề lặp lại, giữ nguyên văn các trao đổi gần đây. Gắn thẻ XML đánh dấu kết luận thì lịch sử vẫn nặng 85.000 token. Cửa sổ trượt 25.000 token cắt mất đúng các kết luận cũ. Index bằng embedding rồi thay cả cuộc trò chuyện bằng các đoạn lấy ra thì mất mạch, trong khi các buổi sau dựa vào kết luận của buổi trước.
>
> Nếu đề kể hội thoại tới tin nhắn thứ 35 thì trung bình đã 50.000 token và trợ lý trả lời chậm, kém mạch lạc, hãy xem tiếp hai số liệu: 94% câu hỏi chỉ liên quan tới 3–5 lần trao đổi gần nhất, còn 6% hỏi chuyện cũ mà người dùng dễ nhắc lại. Khi đó, hãy chọn lớp tóm tắt dần giữ nguyên văn 5–6 lần trao đổi gần nhất. Cửa sổ trượt rồi nhờ người dùng nhắc lại làm trải nghiệm kém đi. Prompt caching giảm chi phí và độ trễ của phần đầu prompt nhưng Claude vẫn phải đọc đủ 50.000 token, nên không sửa được chuyện kém mạch lạc. Dựng hệ retrieval riêng là quá nặng cho 6% câu hỏi.

## Tách thông tin giao dịch ra khối case facts

Sau lần tóm tắt đầu tiên, phần chuyện tiền cọc của anh Tâm chỉ còn một câu: "Khách muốn hoàn cọc sớm, xe có trầy xước nhẹ". Lúc đầu anh nói rõ đơn `TX-3318` cọc 5.000.000 đồng, nhân viên trừ 400.000 đồng phí sơn lại cản sau, và anh cần nhận tiền trước thứ Sáu 27/11 vì phải bay về Hà Nội. Khi anh hỏi "bao giờ tôi nhận được tiền?", trợ lý trả lời theo chính sách chung: hoàn trong 7–10 ngày làm việc.

Đây là rủi ro chính của tóm tắt dần. Bản tóm tắt lặng lẽ biến số tiền, phần trăm, ngày tháng và những điều khách nói rõ là mình muốn thành những câu chung chung (**condensing numerical values, percentages, dates, and customer-stated expectations into vague summaries**). Tóm tắt càng nhiều lần thì càng rơi nhiều chi tiết, và không có lỗi nào báo ra.

Vũ tách những thông tin giao dịch như số tiền, ngày, mã đơn và trạng thái ra một khối "case facts" riêng, nghĩa là các dữ kiện của vụ việc (**extracting transactional facts into a persistent "case facts" block**). Khối này gửi kèm ở mọi lần gọi và nằm ngoài phần lịch sử được tóm tắt (**included in each prompt, outside summarized history**). Phần trò chuyện chung có thể tóm tắt thoải mái, còn khối này không bao giờ đi qua bước tóm tắt, chỉ được cập nhật khi có thay đổi.

**Sơ đồ: Bản tóm tắt làm rơi cả ba con số, khối case facts giữ chúng nguyên vẹn qua mọi lần gọi**

✗ _Chỉ có bản tóm tắt_
1. Tóm tắt: khách muốn hoàn cọc sớm, xe có trầy xước nhẹ
   ↓ _khách hỏi "bao giờ tôi nhận được tiền?"_
2. Claude trả lời theo chính sách chung: hoàn trong **7–10 ngày làm việc**
3. **0/3** số tiền cọc, phí trừ, ngày hẹn còn trong context

✓ _Khối case facts gửi kèm mỗi lần gọi_
1. TX-3318, cọc **5.000.000**, trừ **400.000**, cần nhận trước **27/11**
   ↓ _khách hỏi "bao giờ tôi nhận được tiền?"_
2. Claude báo hoàn **4.600.000** đồng và đối chiếu với hạn **27/11**
3. **3/3** con số vẫn đúng như lúc khách nói

Cuộc chat của anh Tâm có ba vấn đề: hoàn cọc đơn `TX-3318`, gia hạn đơn xe máy `XM-0921` thêm hai ngày với giá 150.000 đồng mỗi ngày, và đổi cách nhận tiền hoàn sang ví điện tử. Với một cuộc chat nhiều vấn đề như vậy, Vũ chia khối case facts thành từng mục, mỗi vấn đề một mục có cấu trúc gồm mã đơn, số tiền và trạng thái. Đây chính là một tầng context riêng cho session nhiều vấn đề (**a separate context layer for multi-issue sessions**). Gần cuối cuộc chat anh hỏi lại "vụ tiền cọc sao rồi?". Phần trao đổi về tiền cọc đã bị tóm tắt từ lâu, nhưng trợ lý vẫn đọc được từ khối case facts và báo đúng anh sẽ nhận 4.600.000 đồng.

```json
{
  "case_facts": [
    {"van_de": "hoan_coc", "ma_don": "TX-3318", "tien_coc": 5000000, "phi_tru": 400000,
     "ly_do_tru": "sơn lại cản sau", "khach_can_truoc": "2026-11-27", "trang_thai": "cho_ke_toan_duyet"},
    {"van_de": "gia_han", "ma_don": "XM-0921", "so_ngay": 2, "gia_moi_ngay": 150000, "trang_thai": "da_xac_nhan"},
    {"van_de": "doi_cach_nhan_tien", "cach_moi": "ví điện tử", "trang_thai": "cho_xac_minh"}
  ]
}
```

Một khách khác lúc đầu tìm xe 5 chỗ dưới 1.000.000 đồng mỗi ngày, rồi đổi ý: "thôi lấy xe 7 chỗ, tối đa 1.500.000". Mấy câu trả lời sau, trợ lý vẫn có lúc gợi ý xe 5 chỗ, dù câu đổi ý nằm rõ trong lịch sử. Vũ đưa nhu cầu của khách vào một object trạng thái có cấu trúc tên `nhu_cau_hien_tai`, cập nhật mỗi khi khách đổi ý, và gửi kèm mọi request. Claude không còn phải tự đọc cả lịch sử để đoán giá trị nào là mới nhất.

Khối case facts hợp với những thông tin bạn biết trước là sẽ cần. Hợp đồng thuê xe thì khác. Nó dài 12 trang, và khách có thể hỏi bất kỳ điều khoản nào, như mức khách tự chịu khi xe hỏng hay phí trả xe muộn từng giờ. Không ai đoán trước được điều khoản nào sẽ cần. Vì vậy Vũ giữ văn bản hợp đồng ngoài context, và khi câu hỏi cần con số chính xác thì dùng `tra_chinh_sach` lấy lại đúng đoạn liên quan đưa vào context. Nếu tóm tắt hợp đồng cho gọn rồi bỏ bản gốc, rất dễ mất đúng điều khoản mà về sau khách mới hỏi.

> **Bẫy đề**
>
> Agent hỗ trợ khách liên tục tóm tắt lịch sử trong các session dài, và theo thời gian quên mã tài khoản chính xác và số tiền đơn hàng của khách. Mẫu kiến trúc nào chặn được kiểu suy giảm này? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tóm tắt thường hơn, mỗi 3 tin nhắn thay vì mỗi 10** (_summarize more often_). Nghe như giữ được nhiều hơn. Nhưng mỗi lần tóm tắt lại nén thêm một lần, nên số liệu rơi còn nhanh hơn.
> - **Dùng flag `--resume` để nạp lại toàn bộ lịch sử từ database** (_--resume_). Nghe như khôi phục được hết. Có điều `--resume` là flag của Claude Code chứ không phải cách xây agent hỗ trợ, và nạp lại toàn bộ lịch sử thì context lại đầy như cũ.
> - **Đổi sang model context lớn hơn và tắt hẳn tóm tắt** (_bigger context window_). Nghe như bỏ được gốc rễ. Ngặt nỗi context càng dài thì Claude càng dễ sót chi tiết, chi phí mỗi lần gọi tăng, và session đủ dài thì vẫn chạm giới hạn.
>
> **Chọn:** tách thông tin giao dịch ra một khối case facts luôn gửi kèm ở đầu context, không cho đi qua bước tóm tắt.

> **Trong đề chọn gì**
>
> Nếu đề hỏi rủi ro chính của tóm tắt dần trong một session hỗ trợ dài, hãy chọn chuyện nó lặng lẽ làm mất ngày tháng, số tiền chính xác và mã định danh. Đáp án nói tóm tắt làm context vượt giới hạn là ngược, vì tóm tắt làm context gọn đi. Hai đáp án sai còn lại nói về logic `stop_reason` và `tool_choice: "auto"`, nhưng cả hai chẳng liên quan gì tới tóm tắt.
>
> Nếu đề kể khách nêu ba vấn đề trong một session (hoàn tiền, gói đăng ký, phương thức thanh toán), context gần đầy, và tới cuối session khách hỏi "What happened with my refund?", hãy chọn trích dữ liệu có cấu trúc của từng vấn đề vào một tầng context riêng. Gọi MCP tool lấy lại thì agent vẫn phải biết đang hỏi đơn nào, số tiền nào. Cửa sổ trượt 30 lần trao đổi cắt mất đúng vấn đề hoàn tiền ở đầu. Tóm tắt các vấn đề cũ thành đoạn mô tả thì rơi số liệu.
>
> Nếu đề kể một session lên thực đơn tiệc 78.000 token có khách dị ứng hải sản có vỏ, số đo để nấu cho 8 phần ăn và định nghĩa riêng "room temperature butter" là 68°F, hãy chọn trích các dữ liệu này vào một mục tham chiếu gọn, tóm tắt phần bàn chung, giữ nguyên văn phần gần. Tóm tắt cả lịch sử thành các chủ đề chính sẽ rơi mất 8 phần ăn và 68°F. Cửa sổ trượt 20.000 token rồi trông vào người dùng nhắc lại thì có thể cắt mất đúng chuyện dị ứng. Semantic search trên cả cuộc trò chuyện không chắc kéo được chuyện dị ứng lên đúng lúc cần.
>
> Nếu đề kể một trợ lý cùng viết truyện, có những thứ phải giữ suốt như lý lịch nhân vật, cấu trúc cốt truyện và luật của thế giới, hãy chọn tách chúng thành một mục "story bible" giữ ở đầu context, và chỉ cắt hay tóm tắt phần brainstorm. Cửa sổ trượt 25 tin nhắn, tóm tắt toàn bộ mỗi 20 tin nhắn, hay thay lịch sử bằng đoạn lấy từ vector database đều làm mất tính cách nhân vật đã định.
>
> Nếu đề kể người dùng đổi tiêu chí giữa chừng ("raise the budget to $650K", "a condo instead of a house") mà trợ lý vẫn nhắc sở thích cũ, khi context mới dùng 35%, hãy chọn object trạng thái có cấu trúc chứa sở thích hiện tại, cập nhật khi đổi và đưa vào mọi request. Cắt bỏ các tin nhắn có sở thích cũ dễ cắt nhầm cả thông tin khác. Dặn trong system prompt hay thêm few-shot thì Claude vẫn phải tự lục lịch sử để đoán cái nào mới nhất.
>
> Nếu đề kể một trợ lý hỗ trợ nghiên cứu cứ sau 8 lần trao đổi lại tóm tắt phần đã bàn về bài báo, nên các câu hỏi cần cỡ mẫu hay p-value chính xác thường bị trả lời sai, hãy chọn cơ chế truy xuất đưa lại đúng đoạn bài báo liên quan khi câu hỏi cần số liệu cụ thể. Giữ vĩnh viễn chữ gốc của mục phương pháp và kết quả thì context lại phình theo số bài. Tóm tắt "trung thực hơn" thì vẫn là tóm tắt, vẫn rơi số. Còn một database chứa sẵn các fact trích ra thì phải đoán trước cần field nào, dễ thiếu đúng chi tiết người dùng hỏi.

## Cắt kết quả tool trước khi chúng dồn vào context

Để xử lý hoàn cọc, trợ lý gọi `tra_don_thue`. Tool trả về 46 field, khoảng 3.000 token mỗi lần: lịch sử GPS 1.240 điểm, 18 ảnh lúc nhận xe, giấy tờ của khách, lịch sử thanh toán, và nhiều thứ khác. Trong cuộc chat với anh Tâm, trợ lý tra đơn ba lần, hai lần cho `TX-3318` và một lần cho `XM-0921`. Ba kết quả đó đã chiếm khoảng 9.000 token, trong khi việc hoàn cọc chỉ cần mã đơn, tiền cọc, ngày trả xe, phí phạt và trạng thái hoàn.

Kết quả tool cứ dồn lại trong context, và số token chúng chiếm lớn hơn nhiều so với phần thật sự có ích (**tool results accumulate in context and consume tokens disproportionately to their relevance**). Mỗi kết quả nằm lại trong lịch sử và được gửi lại ở mọi lần gọi sau, nên phần thừa bị tính lại ở từng lần. Vũ thêm một bước trong code. Trước khi đưa kết quả vào khối `tool_result`, nơi chứa kết quả tool gửi lại cho Claude, code chỉ giữ năm field liên quan tới hoàn cọc (**trimming verbose tool outputs to only relevant fields**). Mỗi kết quả giờ chỉ còn khoảng 120 token, nên ba lần tra chỉ còn khoảng 360 token.

**Sơ đồ: Lọc trong code trước khi thêm vào tool_result: 46 field còn 5, ba lần tra từ 9.000 còn 360 token**
_Kết quả tra_don_thue có 46 field, khoảng 3.000 token mỗi lần tra, gồm ma_don, tien_coc, lich_su_gps 1.240 điểm, ngay_tra_xe, anh_check_in 18 ảnh, phi_phat, lich_su_thanh_toan, trang_thai_hoan, giay_to_khach và các field khác. Code lọc trước khi thêm vào tool_result, chỉ giữ 5 field ma_don, tien_coc, ngay_tra_xe, phi_phat, trang_thai_hoan, khoảng 120 token. Ba lần tra đơn trong context: chưa cắt khoảng 9.000 token, đã cắt khoảng 360 token_

- **tra_don_thue: 46 field**: khoảng 3.000 token mỗi lần tra
- **ma_don**
- **tien_coc**: lich_su_gps: 1.240 điểm
- **ngay_tra_xe**: anh_check_in: 18 ảnh
- **phi_phat**: lich_su_thanh_toan
- **trang_thai_hoan**: giay_to_khach
- … và các field khác
- code lọc
- trước khi thêm
- vào tool_result
- **Chỉ giữ 5 field**: khoảng 120 token
- ma_don, tien_coc,
- ngay_tra_xe, phi_phat,
- trang_thai_hoan
- **BA LẦN TRA ĐƠN TRONG CONTEXT**: chưa cắt: khoảng 9.000 token
- đã cắt: khoảng 360 token

Trợ lý còn gọi `tra_chinh_sach` mỗi khi khách hỏi về chính sách. Kết quả của mọi lần tra cũ cứ nằm lại, và sau khoảng 15 tin nhắn, chúng lấn chỗ của chính cuộc trò chuyện. Vũ chỉ giữ kết quả của 2–3 lần tra gần nhất, bỏ kết quả cũ hơn, còn lịch sử trò chuyện thì giữ nguyên. Claude API cũng có tính năng context editing, cho phép server tự dọn bớt nội dung trong context. Khi bật chiến lược `clear_tool_uses_20250919`, server tự xoá các kết quả tool cũ mỗi khi context vượt ngưỡng bạn đặt.

Cách chữa tốt nhất là đừng để tool trả nhiều ngay từ đầu. Tool `tim_xe_trong` từng tự lấy hết mọi trang kết quả từ hệ thống đặt xe. Mùa cao điểm, một truy vấn khớp hơn 200 xe, và tool mất 15–20 giây mới trả về một danh sách dài. Vũ sửa cho nó trả trang đầu kèm tổng số xe khớp và một cursor để lấy trang sau, để agent tự quyết có cần xem thêm hay không. Tool nào có thể trả nhiều dữ liệu thì nên có phân trang, cho chọn khoảng (ví dụ theo ngày), lọc theo điều kiện hoặc tự cắt bớt, kèm giá trị mặc định hợp lý. Để tham khảo, Claude Code mặc định cắt kết quả tool ở 25.000 token.

> **Bẫy đề**
>
> Agent gọi `lookup_order` nhiều lần khi xử lý yêu cầu trả hàng. Mỗi kết quả có hơn 40 field (mặt hàng, giao hàng, thanh toán, lịch sử trạng thái), và kết quả tool đã chiếm phần lớn context. Khách nhắc thêm hai đơn nữa. Nên làm gì trước khi tra tiếp? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Cứ tra tiếp, không đụng tới kết quả cũ** (_keep everything_). Nghe như giữ đủ dữ liệu. Nhưng hai lần tra nữa với hơn 40 field mỗi lần sẽ đẩy context tới sát giới hạn.
> - **Đưa mọi kết quả tool vào vector database có semantic index, lấy phần liên quan khi cần** (_vector store_). Nghe gọn gàng. Có điều phải dựng thêm hạ tầng, trong khi field nào cần cho việc trả hàng thì đã biết rõ.
> - **Cho Claude viết tóm tắt bằng lời các chi tiết chính của từng đơn, thay kết quả có cấu trúc bằng đoạn văn** (_prose summary_). Nghe như nén được nhiều. Ngặt nỗi đổi dữ liệu có cấu trúc thành văn xuôi là đúng kiểu nén dễ làm sai ngày và số tiền.
>
> **Chọn:** chỉ giữ các field liên quan tới trả hàng (mặt hàng, ngày mua, hạn trả hàng, trạng thái) từ mỗi kết quả, bỏ phần còn lại.

> **Trong đề chọn gì**
>
> Nếu đề kể context chứa kết quả RAG (các đoạn tài liệu được tìm ra rồi đưa vào prompt) tích luỹ từ mọi truy vấn trước, lấn chỗ lịch sử hội thoại và làm mất mạch sau hơn 15 tin nhắn, hãy chọn cửa sổ trượt cho kết quả RAG, chỉ giữ của 2–3 truy vấn gần nhất, còn lịch sử hội thoại giữ nguyên. Nén mọi kết quả RAG thành một tài liệu gộp thì nó vẫn phình theo thời gian và còn mất chi tiết. Bỏ các kết quả trùng ý nhau thì vẫn còn các kết quả cũ không liên quan. Dành phần lớn context cho kết quả RAG và bớt phần lịch sử là làm ngược, vì lịch sử mới là thứ giữ mạch.
>
> Nếu đề kể tool tìm sản phẩm gọi API catalog phân trang 50 mục mỗi request, truy vấn hay khớp hơn 200 sản phẩm và việc tự lấy hết mọi trang gây trễ 15–20 giây, hãy chọn trả trang đầu kèm tổng số kết quả và cursor để lấy trang sau. Xếp hạng ở server rồi chỉ trả 50 mục thì agent không biết còn bao nhiêu và không lấy thêm được. Thêm tham số giới hạn mặc định 2 trang thì tool vẫn tự quyết lấy bao nhiêu trang, thay vì để agent quyết. Tách thành hai tool tìm kiếm và lấy thêm thì thừa một tool cho việc mà cursor trong cùng tool đã làm được.

## Thông tin ở giữa đầu vào dài dễ bị bỏ sót

Chuyện sót thông tin còn xảy ra ở agent tổng hợp. Báo cáo tháng 10 của nó bỏ sót một chuyện nghiêm trọng. Subagent đọc phiếu bảo dưỡng đã tìm ra 5 xe máy cùng một lô có má phanh mòn sớm bất thường. Agent tổng hợp nhận kết quả của ba subagent nối liền nhau, tổng cộng 36 trang: đánh giá Google Maps 12 trang, phiếu bảo dưỡng 9 trang, ticket hỗ trợ 15 trang. Báo cáo nói kỹ phần đánh giá ở đầu và phần ticket ở cuối, còn chuyện má phanh nằm ở giữa thì không có một dòng nào.

Đây là hiệu ứng "lạc ở giữa" (**lost in the middle effect**). Với đầu vào dài, Claude xử lý chắc phần đầu và phần cuối, nhưng có thể bỏ sót những phát hiện nằm ở giữa (**models reliably process information at the beginning and end of long inputs but may omit findings from middle sections**). Để giảm ảnh hưởng của vị trí (**position effects**), Vũ sắp lại đầu vào của agent tổng hợp. Đầu tiên là một bản tóm tắt các phát hiện chính, mỗi phát hiện một dòng, rồi tới kết quả chi tiết của từng subagent dưới tiêu đề riêng (**key findings summaries at the beginning of aggregated inputs, explicit section headers**). Yêu cầu viết báo cáo đặt ở cuối.

**Sơ đồ: Tóm tắt phát hiện chính đặt ở đầu, nên chuyện má phanh không còn chìm giữa 36 trang**
1. **Điểm nhấnTóm tắt phát hiện chính**: mỗi phát hiện một dòng, có cả 5 xe má phanh mòn sớm
   _(từng mục có tiêu đề riêng)_
2. **Mục đánh giá Google Maps**: 12 trang
3. **Mục phiếu bảo dưỡng**: 9 trang
4. **Mục ticket hỗ trợ**: 15 trang
   _(yêu cầu đặt ở cuối)_
5. **Yêu cầu**: viết báo cáo tháng 10 cho ban giám đốc

Cách Vũ đặt yêu cầu ở cuối cũng khớp với lời khuyên chung cho prompt có tài liệu dài: đặt tài liệu ở đầu prompt, phía trên câu hỏi và chỉ dẫn. Trong thử nghiệm của Anthropic, đặt câu hỏi ở cuối có thể cải thiện chất lượng câu trả lời tới 30%, nhất là với đầu vào gồm nhiều tài liệu phức tạp. Với việc đọc tài liệu dài, có thể bảo Claude trích những đoạn liên quan trước rồi mới làm việc chính, để nó tập trung vào đúng phần cần.

Subagent đọc ticket còn đọc cả bản ghi các cuộc gọi tổng đài. Với cuộc gọi dưới 10 phút nó trích đủ yêu cầu của khách, nhưng với cuộc gọi 40 phút thì sót những yêu cầu khách nói giữa chừng, dù bản ghi vẫn nằm gọn trong context. Vậy là đầu vào nằm gọn trong context chưa chắc đã được Claude đọc kỹ như nhau từ đầu tới cuối. Vũ chia bản ghi dài thành từng đoạn, trích riêng từng đoạn, rồi gộp kết quả và bỏ trùng. Mỗi lần Claude chỉ phải tập trung vào một đoạn ngắn, nên ít sót hơn.

> **Trong đề chọn gì**
>
> Nếu đề kể độ chính xác trích xuất đạt 94% với transcript cuộc họp dưới 30 phút nhưng chỉ 68% với transcript trên 60 phút, cả hai đều vừa context, hãy chọn chia transcript dài thành từng đoạn, trích riêng từng đoạn rồi gộp và bỏ trùng. Thêm few-shot hay nâng model mạnh hơn không đổi được việc thông tin rải khắp một đầu vào quá dài. Cho Claude tóm tắt trước rồi mới trích là thêm một bước nén, đúng chỗ làm rơi các chi tiết rải rác.

## Subagent trả dữ liệu có cấu trúc kèm metadata

Còn một lỗi nữa trong báo cáo tháng 10. Báo cáo viết rằng phàn nàn về phí vệ sinh xe "tăng gấp đôi so với tháng trước". Thật ra subagent đánh giá đã đếm tất cả đánh giá từ đầu năm 2025, còn subagent ticket chỉ đếm ticket tháng 10. Hai con số không cùng khoảng thời gian, nhưng kết quả gửi về chỉ là một đoạn văn, nên agent tổng hợp không có cách nào biết.

Vũ yêu cầu mỗi subagent trả output có cấu trúc, kèm metadata, tức thông tin mô tả về chính dữ liệu đó (**metadata (dates, source locations, methodological context) in structured outputs**). Metadata gồm khoảng ngày của dữ liệu, vị trí trong nguồn như số phiếu, mã ticket hay đường link đánh giá, và cách thu thập, chẳng hạn "đếm trên 212 ticket từ 01/10 đến 31/10". Có metadata, agent tổng hợp mới gộp đúng và biết khi nào hai con số không so được với nhau (**accurate downstream synthesis**).

Agent tổng hợp còn phải đọc kết quả của cả ba subagent trong một context có hạn (**limited context budgets**). Lúc đầu, mỗi subagent gửi về cả đoạn văn dài kèm chuỗi lập luận của nó. Vũ sửa ba subagent để chúng chỉ trả dữ liệu có cấu trúc, gồm các thông tin chính, trích dẫn và điểm liên quan (con số cho biết phát hiện đó sát với câu hỏi tới mức nào), thay cho đoạn văn dài kèm lập luận (**return structured data (key facts, citations, relevance scores) instead of verbose content and reasoning chains**). Trong kiến trúc nhiều subagent, mỗi subagent có thể dùng hàng chục nghìn token để tìm hiểu, nhưng thường chỉ gửi về một bản cô đọng 1.000–2.000 token.

```json
{
  "subagent": "phieu_bao_duong",
  "khoang_ngay": "2026-10-01 đến 2026-10-31",
  "cach_lam": "đọc 64 phiếu bảo dưỡng xe máy tháng 10",
  "phat_hien": [
    {
      "noi_dung": "5 xe cùng lô có má phanh mòn sớm bất thường",
      "nguon": ["BD-1042", "BD-1057", "BD-1063", "BD-1071", "BD-1088"],
      "diem_lien_quan": 0.95
    }
  ]
}
```

> **Ý chính**
>
> Mỗi lần gọi, Claude chỉ biết những gì bạn gửi lên, nên phải gửi lại đủ lịch sử và system prompt. Số liệu quan trọng nên nằm trong khối case facts để không bị bản tóm tắt làm rơi. Kết quả tool cần cắt bớt trước khi đưa vào context, còn với đầu vào dài thì đặt tóm tắt phát hiện chính ở đầu.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 5.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Using the Messages API (Claude API)](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
3. [Context windows (Claude API)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
4. [Compaction (Claude API)](https://platform.claude.com/docs/en/build-with-claude/compaction)
5. [Context editing (Claude API)](https://platform.claude.com/docs/en/build-with-claude/context-editing)
6. [Mid-conversation system messages and tool changes (Claude API)](https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages)
7. [Prompting best practices, Long context prompting (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
8. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/research/writing-tools-for-agents)
9. [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
