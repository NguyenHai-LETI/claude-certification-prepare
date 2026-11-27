---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/5-3-do-chat-luong-tren-production
ngay_tai: 2026-11-27
tieu_de: Đo chất lượng trên production - lấy mẫu lưu lượng thật, A/B test, vòng phản hồi và chọn chỉ số theo loại việc
---

Domain 5: Evaluation Engineering and Quality Assurance · Task 5.3

# Đo chất lượng trên production - lấy mẫu lưu lượng thật, A/B test, vòng phản hồi và chọn chỉ số theo loại việc

Đo chất lượng trên lưu lượng thật khi không có đáp án chuẩn, bằng cách lấy mẫu theo nhóm, A/B test có chỉ số chặn, vòng phản hồi và chỉ số hợp từng loại việc.

- 16 phút đọc
- Đối chiếu docs 22/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Lấy mẫu lưu lượng thật để chấm, đủ ca cho cả những nhóm nhỏ mà rủi ro cao
- Chọn chỉ số online hợp với từng loại việc - trích xuất, sinh văn bản, agent và trả lời có truy xuất
- Chạy A/B test trên production với chỉ số chính và chỉ số chặn, đọc kết quả không bị đánh lừa
- Dùng phản hồi tường minh và tín hiệu ngầm của người dùng, và đưa lỗi đã xác nhận ngược về bộ eval và judge

Bộ eval offline, tức bộ ca thử đội tự soạn và chạy trước mỗi lần release, chỉ chứa những câu hỏi đội đã nghĩ ra. Người dùng thật lại hỏi những câu khác, và cách họ hỏi cũng đổi dần theo mùa, theo sản phẩm mới. Khi chất lượng cứ thế tụt dần mà không ai sửa gì, người ta gọi đó là trôi (**drift**). Bài này giúp bạn đo chất lượng ngay trên lưu lượng thật (**online evaluation**) khi không có đáp án chuẩn, và chọn chỉ số hợp với từng loại việc.

Tên task trong đề là **Online Quality Measurement**. Nó gồm việc phân tích chất lượng trên lưu lượng thật của production, gồm lấy mẫu lưu lượng thật (**live-traffic sampling**), A/B test (**A/B testing**), vòng phản hồi (**feedback loops**), và chọn chỉ số theo loại việc (**metric selection matched to task type**). Bốn loại việc là trích xuất (**extraction**), sinh văn bản (**generation**), agent (**agentic**) và trả lời có truy xuất (**retrieval-grounded**).

Cách xây bộ eval offline nằm ở bài 5.1, còn chỉ số dịch vụ và cách cảnh báo khi chất lượng trôi nằm ở bài 3.2.

**Sơ đồ: Judge chấm mẫu lưu lượng thật theo loại việc, lỗi đã xác nhận quay về bộ eval và judge**
_Bản đồ bài. Lưu lượng thật đi vào bước lấy mẫu theo nhóm, rồi LLM judge chấm mẫu hằng đêm qua batch. Điểm được tách theo bốn loại việc, extraction, generation, agentic và retrieval-grounded. Lưu lượng thật cũng được chia theo khách vào A/B test, nhánh A và nhánh B được so bằng chỉ số chính và chỉ số chặn lấy từ khối chỉ số, rồi chọn bản đưa lên. Ca điểm thấp và phản hồi của người dùng, gồm explicit feedback và implicit signals, cùng đi tới kỹ sư xác nhận lỗi. Lỗi đã xác nhận thành ca mới trong bộ eval offline, cổng CI chạy ca đó với mọi bản prompt sau. Một đường nét đứt từ ô kỹ sư quay về LLM judge: nếu judge chấm sai thì sửa rubric._

- **LẤY MẪU LƯU LƯỢNG THẬT**
- **Lưu lượng thật**: live traffic
- **Lấy mẫu theo nhóm**: stratified sampling
- **LLM judge**: chấm hằng đêm qua batch
- điểm tách theo loại việc
- chia theo khách
- **CHỈ SỐ THEO LOẠI VIỆC**
- **Extraction**: trích xuất
- **Generation**: sinh văn bản
- **Agentic**: agent
- **Retrieval-grounded**: trả lời có truy xuất
- **A/B test**: nhánh A, nhánh B
- so chỉ số chính
- và chỉ số chặn
- rồi chọn bản đưa lên
- chỉ số chính
- + chỉ số chặn
- **VÒNG PHẢN HỒI**
- **Phản hồi người dùng**: explicit feedback
- implicit signals
- **Kỹ sư xác nhận lỗi**: gắn nhóm, có đáp án chuẩn
- **Bộ eval offline**: CI chạy ca mới với
- mọi bản prompt sau
- ca điểm thấp
- sửa rubric nếu chấm sai

## Ví dụ xuyên suốt: sàn bán đồ nội thất trực tuyến

Một sàn bán đồ nội thất trực tuyến dùng Claude qua Messages API cho bốn việc, tổng khoảng 24.500 lượt mỗi ngày.

- Claude Haiku 5.5 đọc phiếu giao hàng PDF của 300 nhà cung cấp và trích ra JSON đơn nhập hàng, khoảng 6.000 phiếu mỗi ngày.
- Claude viết khoảng 2.500 mô tả sản phẩm mỗi ngày cho người bán sửa rồi đăng.
- Agent đổi trả chạy Claude Sonnet 5.5 với các tool `tra_don_hang`, `tao_phieu_doi_tra`, `hen_lay_hang`, khoảng 4.000 hội thoại mỗi ngày.
- Trợ lý hỏi đáp chính sách bảo hành và giao hàng, gọi tắt là trợ lý chính sách, cũng chạy Sonnet 5.5, trả lời khoảng 12.000 câu mỗi ngày. Câu trả lời có trích dẫn từ trang chính sách, và dưới mỗi câu có nút "hữu ích" và "không hữu ích".

Trong bài, một lượt là một lần gọi trong việc trích xuất hay viết mô tả, một hội thoại là một lần khách nói chuyện với agent đổi trả, và một câu là một câu trả lời của trợ lý chính sách. Ca là một lượt, một hội thoại hay một câu được chọn vào mẫu để chấm.

## Lấy mẫu lưu lượng thật

Ban đầu, mỗi ngày đội lấy ngẫu nhiên 2% số lượt của cả bốn việc, khoảng 490 lượt, rồi đưa cho judge chấm. Judge ở đây là một model Claude chấm câu trả lời theo một bảng tiêu chí viết sẵn, gọi là rubric. Sau một lần sửa prompt, agent bắt đầu hẹn lấy hàng cồng kềnh như tủ, giường, những món phải chở bằng xe tải, vào khung giờ xe tải không chạy. Lỗi kéo dài 9 ngày, và đội biết được nhờ khách khiếu nại. Mẫu chấm mỗi ngày có thấy khoảng 1 hội thoại lỗi, nhưng một ca đó chìm trong điểm trung bình của 490 lượt nên không vượt ngưỡng báo động.

Lý do là lấy ngẫu nhiên đều trên toàn bộ lưu lượng thì nhóm nhỏ gần như không có mặt trong mẫu. Hàng cồng kềnh chỉ chiếm khoảng 150 hội thoại mỗi ngày, nên 2% là 3 hội thoại.

**Sơ đồ: Lấy đều 2% thì nhóm hàng cồng kềnh chỉ có 3 hội thoại mỗi ngày, và một ca lỗi chìm trong điểm chung**

✗ _Lấy ngẫu nhiên 2% mọi lượt_
1. Nhóm hàng cồng kềnh có **150** hội thoại mỗi ngày
   ↓ _2% là khoảng 3 hội thoại vào mẫu mỗi ngày_
2. Mỗi ngày **1 trong 3** hội thoại lỗi, chấm chung với cả mẫu **490** lượt của sàn
3. **9 ngày** điểm chung không vượt ngưỡng, đội chỉ biết lỗi khi khách khiếu nại

✓ _Lấy theo nhóm, mỗi nhóm ít nhất 40 ca_
1. Nhóm hàng cồng kềnh vẫn có **150** hội thoại mỗi ngày
   ↓ _40 hội thoại vào mẫu mỗi ngày, nhóm có điểm riêng_
2. Mỗi ngày khoảng **12 trong 40** hội thoại hẹn sai khung giờ
3. **1 ngày** sau đêm chấm đầu tiên, điểm của nhóm tụt rõ

Nếu khi đó đội lấy theo nhóm, mỗi nhóm ít nhất 40 ca, thì nhóm hàng cồng kềnh có 40 hội thoại vào mẫu mỗi ngày. Khoảng 12 hội thoại trong số đó hẹn sai khung giờ, nên ngay sau đêm chấm đầu tiên điểm của nhóm đã tụt rõ.

Trên lưu lượng thật không có đáp án chuẩn để so, nên mẫu lấy từ lưu lượng thật phải nhờ judge chấm. Judge chỉ có trong tay đầu vào của lượt đó, câu trả lời và rubric. Với agent, judge cần cả hội thoại cùng kết quả các tool. Với trợ lý chính sách, judge cần thêm những đoạn tài liệu hệ thống đã tìm ra để trả lời. Người vẫn phải kiểm tra lại judge định kỳ (bài 5.2).

Sau sự cố, đội đổi sang cách lấy mẫu dưới đây. Riêng lấy mẫu theo nhóm là cách làm phổ biến mà đội tự dựng, Claude không có sẵn tính năng nào làm việc này.

- Đội lấy mẫu theo nhóm (stratified). Mỗi việc và mỗi nhóm quan trọng, như hàng cồng kềnh hay khách hỏi bảo hành quá hạn, có ít nhất 40 ca trong mẫu mỗi ngày, và nhóm nào rủi ro cao thì lấy nhiều hơn nữa. Vì nhóm nhỏ được lấy nhiều hơn tỉ lệ thật của nó, khi tính điểm chung đội nhân điểm của từng nhóm với tỉ lệ thật của nhóm đó, để nhóm lấy dày không kéo lệch điểm chung.
- Với agent, đội lấy nguyên cả hội thoại chứ không lấy từng request rời, vì lỗi hẹn sai giờ chỉ lộ ra khi đọc từ câu hỏi đầu tiên tới lịch hẹn cuối cùng. Cách lấy mẫu trace, tức bản ghi từng bước của một lần chạy, theo hội thoại nằm ở bài 3.3.
- Đội chấm hằng đêm qua Message Batches API, vì không ai cần ngồi chờ kết quả, và giá batch chỉ bằng một nửa request thường. Batch không nằm trong diện ZDR (zero data retention, tức Anthropic không lưu dữ liệu sau khi trả response), vì Anthropic giữ kết quả batch trong 29 ngày. Nếu tổ chức của bạn bắt buộc ZDR, bạn chấm bằng request thường.
- Hệ thống báo động khi điểm tụt nhiều hơn mức lên xuống bình thường, chẳng hạn thấp hơn điểm trung bình của các đêm gần đây hơn hai độ lệch chuẩn. Tỉ lệ lấy mẫu 1–5% và ngưỡng hai độ lệch chuẩn chỉ là mức hay dùng để bắt đầu. Việc nào ít lượt thì phải lấy tỉ lệ cao hơn mới đủ ca để chấm.

Muốn chấm thì phải lưu lại nội dung hội thoại, nên lưu những gì và lưu bao lâu phải khớp với chính sách lưu trữ dữ liệu của công ty (bài 3.1).

## Chọn chỉ số theo loại việc

Sau sự cố hàng cồng kềnh, mẫu chấm đã có điểm theo nhóm. Nhưng mọi việc vẫn được chấm bằng cùng một rubric chung theo thang 1 đến 5, và dashboard chất lượng chỉ hiện điểm gộp của cả bốn việc. Khi điểm giảm 0,1, không ai biết việc nào hỏng, và một thang điểm chung cũng không hợp cho cả trích xuất lẫn agent.

Ở eval offline, việc nào cũng có thể so câu trả lời với đáp án chuẩn. Trên production thì không có đáp án để so, nên mỗi loại việc phải dựa vào tín hiệu riêng mà hệ thống tự thu được. Vì vậy chọn chỉ số theo loại việc quan trọng hơn hẳn so với lúc eval offline.

| Loại việc | Chỉ số online | Ở sàn nội thất |
| --- | --- | --- |
| Trích xuất | Code kiểm các giá trị có khớp nhau không, và tỉ lệ field người phải sửa | Cộng các dòng hàng có bằng tổng trên phiếu không, mã SKU có trong danh mục không, và tỉ lệ field nhân viên nhận hàng phải sửa, tách theo nhà cung cấp |
| Sinh văn bản | Judge chấm theo rubric, và người dùng giữ nguyên hay phải sửa | Judge kiểm mô tả không bịa ra tính năng nào ngoài thông số, và tỉ lệ người bán đăng gần nguyên văn |
| Agent | Trạng thái cuối cùng ghi trong hệ thống, và tỉ lệ xong việc mà không phải chuyển nhân viên | Phiếu đổi trả đúng đơn, đúng lý do, lịch hẹn hợp lệ, tỉ lệ chuyển nhân viên, và khách liên hệ lại trong 48 giờ |
| Trả lời có truy xuất | Groundedness, tức mỗi ý trong câu trả lời đều có đoạn tài liệu làm căn cứ, và tỉ lệ câu trả lời "không tìm thấy thông tin" | Judge kiểm từng ý với đoạn trích `cited_text` mà API trả kèm, và tỉ lệ "không có trong chính sách" tăng hay giảm đột ngột |

Có ba chỗ hay bị hiểu nhầm khi chọn chỉ số online.

- Structured outputs là tính năng buộc Claude trả JSON đúng schema bạn đưa. Nó bảo đảm JSON hợp lệ và đúng kiểu theo schema, còn giá trị bên trong đúng hay sai thì bạn vẫn phải tự kiểm. Tỉ lệ JSON hợp lệ 100% không cho biết số lượng hay mã SKU có đúng không, nên trích xuất cần kiểm giá trị bằng code và đếm field người phải sửa.
- Citations là tính năng cho API trả kèm đoạn trích từ tài liệu nguồn. API bảo đảm đoạn trích trỏ đúng vào tài liệu bạn gửi. Còn đoạn đó có đủ làm căn cứ cho ý đang nói hay không thì bạn phải tự kiểm, nên groundedness vẫn phải nhờ judge chấm.
- Với agent, câu "Đã tạo phiếu đổi trả cho bạn" ở cuối hội thoại chưa phải kết quả. Kết quả là phiếu có trong hệ thống, đúng đơn và đúng lý do.

Nếu muốn xem cách chọn chỉ số cho eval offline dựa theo kiểu output, bạn đọc bài 4.1 của CCAR-P.

> **Trong đề chọn gì**
>
> Golden set (bộ ca có đáp án chuẩn của eval offline) chỉ chứa những câu đội đã nghĩ ra, nên không đo được chất lượng trên lưu lượng thật. Chỉ số online phải là loại không cần đáp án chuẩn, như judge theo rubric, trạng thái cuối trong hệ thống, tỉ lệ người dùng phải sửa, groundedness. Đáp án kiểu "cho người gắn nhãn toàn bộ lưu lượng" là sai, vì ở quy mô production không ai làm nổi.

## A/B test trên lưu lượng thật

Tách chỉ số xong, đội chuyển sang cải thiện trợ lý chính sách. Họ viết prompt v2 để câu trả lời ngắn và dứt khoát hơn. Prompt v2 vượt qua bộ eval offline. Nhưng bộ đó chỉ kiểm câu trả lời có đúng ý chính không, nên chưa cho biết khách có thấy dễ hiểu hơn, có phải hỏi lại ít hơn không.

A/B test chia lưu lượng thật cho hai bản prompt, mỗi bản gọi là một nhánh, rồi so kết quả thật của người dùng ở hai nhánh. Cách này trả lời được những câu mà eval offline chịu, như khách có thấy dễ hiểu hơn không. Bù lại, nó chậm vì cần đủ lưu lượng, thường mất từ vài ngày tới vài tuần mới kết luận được, và chỉ thử được bản đã deploy. Cách thiết kế một thí nghiệm A/B, gồm đặt giả thuyết, chọn mức chênh nhỏ nhất muốn phát hiện và tính cỡ mẫu, nằm ở bài 4.3 của CCAR-P. Khi A/B một ứng dụng dùng Claude, đội làm theo bốn cách. Chuyện pin version là cách Managed Agents hỗ trợ sẵn, ba cách còn lại là cách làm phổ biến.

- Đội chia theo khách và giữ cố định. Mỗi khách luôn gặp đúng một nhánh trong suốt thí nghiệm, không đổi nhánh giữa các câu hỏi, để kết quả của một khách chỉ phản ánh một bản.
- Trace của mỗi lượt đều ghi version prompt và model đã dùng, để tách được mọi chỉ số theo từng nhánh. Nếu agent chạy trên Managed Agents (dịch vụ chạy agent do Anthropic quản lý), mỗi lần cập nhật agent sẽ sinh ra một version mới không sửa được nữa (immutable). Khi tạo session cho một nhánh, bạn pin session đó vào đúng version của nhánh.
- Trước khi chạy, đội chốt một chỉ số chính và vài chỉ số chặn (guardrail metric). Chỉ số chính là thứ đội muốn cải thiện, còn chỉ số chặn là những thứ không được phép tệ đi, như groundedness, tỉ lệ chuyển nhân viên hay chi phí mỗi câu.
- Hai nhánh được chấm bằng cùng một judge và cùng cách lấy mẫu. Nếu chấm khác nhau thì chênh lệch giữa hai nhánh có thể chỉ do cách chấm chứ không do prompt.

Đội chia đôi lưu lượng của trợ lý chính sách và chạy trong 7 ngày, mỗi nhánh khoảng 6.000 câu mỗi ngày, tức khoảng 42.000 câu cho cả 7 ngày. Chỉ số chính là tỉ lệ bấm "hữu ích" trong số khách có bấm nút, còn groundedness là một chỉ số chặn.

**Sơ đồ: Prompt v2 thắng chỉ số chính nhưng tụt groundedness, chỉ số chặn không được phép tệ đi so với v1**
_Biểu đồ cột A/B test của trợ lý chính sách trong 7 ngày, mỗi nhánh khoảng 42.000 câu. Chỉ số chính là tỉ lệ bấm hữu ích, nhánh A prompt v1 được 71%, nhánh B prompt v2 được 78%. Chỉ số chặn là groundedness, luật là nhánh B không được thấp hơn nhánh A. Một đường nét đứt đánh dấu mức 93% của nhánh A, nhánh B chỉ được 84%, thấp hơn 9 điểm. Mũi tên từ cột này dẫn tới quyết định: đội không đưa prompt v2 lên, vì v2 hay bỏ bớt điều kiện như còn nguyên tem nên câu trả lời nghe chắc chắn mà sai._

- **Trợ lý chính sách chia đôi lưu lượng trong 7 ngày**: Mỗi nhánh có khoảng 42.000 câu, và hai nhánh được chấm bằng cùng một judge.
- **CHỈ SỐ CHÍNH**
- **Tỉ lệ bấm hữu ích**
- **CHỈ SỐ CHẶN**
- **Groundedness**: luật: B không thấp hơn A
- **71%**
- **78%**
- **93%**
- **84%**: mức A
- −9 điểm
- Nhánh A
- prompt v1
- Nhánh B
- prompt v2
- Nhánh A
- prompt v1
- Nhánh B
- prompt v2
- **Đội không đưa prompt v2 lên**: Prompt v2 hay bỏ bớt điều kiện như "còn nguyên tem", nên câu trả lời nghe chắc chắn mà sai.

Đội đọc kỹ những câu của nhánh B bị judge chấm groundedness thấp, và thấy v2 hay bỏ bớt điều kiện, chẳng hạn "trong 30 ngày, còn nguyên tem". Vì vậy câu trả lời nghe chắc chắn hơn, nhưng lại sai với những khách không đủ các điều kiện đó.

> **Bẫy đề**
>
> Sau 7 ngày, prompt v2 được 78% lượt bấm hữu ích so với 71% của v1, nhưng groundedness tụt từ 93% xuống 84%. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Đưa v2 lên vì thắng chỉ số chính** (_ship the variant that won the primary metric_). Cách này có vẻ đúng quy trình. Nhưng chỉ số chặn chốt từ đầu được đặt ra chính là để chặn trường hợp này. Một câu trả lời sai mà nghe chắc chắn làm khách vui lúc đọc, rồi khách khiếu nại khi đi đổi trả.
> - **Chạy thêm hai tuần cho chắc** (_extend the test for significance_). Làm vậy trông cẩn thận. Nhưng groundedness là chỉ số chặn đã chốt, nó đã tụt 9 điểm phần trăm, nên chạy thêm cũng không đổi quyết định mà chỉ khiến thêm nhiều khách nhận câu trả lời thiếu điều kiện.
> - **Tin nút bấm vì đó là ý kiến khách thật** (_trust explicit user ratings_). Lý do này nghe rất sát người dùng. Có điều chỉ một phần nhỏ khách bấm, và khách không biết câu trả lời thiếu điều kiện cho tới khi bị từ chối đổi trả.
>
> **Chọn:** không đưa v2 lên. Đội sửa prompt để câu trả lời giữ lại điều kiện và trích dẫn, chạy lại bộ eval offline, rồi mới A/B lại.

Đừng nhầm A/B test với canary. Canary là đưa bản mới cho một phần nhỏ lưu lượng để sớm phát hiện bản đó hỏng, và rollback ngay nếu có chuyện (bài 2.3). A/B test thì cần đủ lưu lượng ở cả hai nhánh để so kết quả. Thường thì bản mới chạy canary trước, ổn rồi mới đưa vào A/B.

## Vòng phản hồi

Ngoài chuyện so hai bản prompt, đội còn muốn dùng chính nút đánh giá để tìm lỗi. Khách chỉ bấm "không hữu ích" ở 0,8% câu trả lời của trợ lý chính sách, khoảng 96 lượt bấm mỗi ngày. Đọc 100 lượt gần nhất, đội thấy hơn một nửa là khách bực vì hàng giao chậm, không phải vì câu trả lời sai.

Phản hồi tường minh (**explicit feedback**), tức khách chủ động bấm nút hay gửi báo lỗi, mang lại những ví dụ thật mà đội không nghĩ tới. Nhưng loại phản hồi này thưa. Chỉ khách nào muốn bấm mới bấm, họ thường chỉ bấm khi gặp chuyện nặng, và hiếm khi nói rõ vì sao.

Tín hiệu ngầm (**implicit signals**) thì có ở mọi lượt và phản ánh việc có xong hay không. Ví dụ là khách hỏi lại cùng ý bằng câu khác, khách chuyển sang nhân viên, người bán viết lại mô tả, nhân viên nhận hàng sửa field, phiếu đổi trả bị huỷ rồi tạo lại.

Vòng phản hồi chỉ có giá trị khi vòng được khép kín, nghĩa là lỗi đã xác nhận phải quay về bộ eval để bản release sau không mắc lại. Sơ đồ dưới đây theo chân câu trả lời thiếu điều kiện đổi trả qua từng bước.

**Sơ đồ: Câu thiếu điều kiện đổi trả thành ca eval chặn bản prompt sau, và sửa judge nếu judge chấm sai**
- không
- lỗi thật
- nếu judge từng cho đạt
- Mẫu chấm đêm: judge gắn cờcâu bỏ mất 'còn nguyên tem'
- Kỹ sư đọc câu:lỗi thật?
- Nút bấm: khách bấm'không hữu ích'
- Kỹ sư bỏ qua, ví dụkhách bực vì giao chậm
- Kỹ sư thêm ca evalcó đáp án chuẩn
- Cổng CI chạy ca mớivới mọi bản prompt sau
- Đội sửa rubric,hiệu chỉnh judge

Ca mới được chạy trong cổng CI, tức bước kiểm tự động trước khi release, với mọi bản prompt sau. Mỗi tuần, có người đọc thêm một mẫu transcript để tìm loại lỗi chưa ai đặt tên. Lỗi đã xác nhận cũng quay về judge. Nếu người xác nhận một câu judge cho đạt mà thực ra sai, ca đó được dùng để sửa rubric và hiệu chỉnh lại judge (bài 5.2).

Mỗi bước trong vòng cần có một người chịu trách nhiệm, nếu không phản hồi sẽ chỉ dồn lại trong một bảng không ai mở. Khi gom lỗi theo chủ đề, đội còn thấy bộ eval đang thiếu ca ở đâu. Chẳng hạn, nếu các câu hỏi về bảo hành quá hạn liên tục bị chấm trượt, nhiều khả năng bộ eval offline gần như chưa có ca nào về chủ đề này.

> **Ý chính**
>
> Trên production không có đáp án chuẩn, nên bạn lấy mẫu theo nhóm để nhóm nhỏ mà rủi ro cao vẫn đủ ca, chấm bằng judge mà người vẫn kiểm tra định kỳ, và báo động khi điểm tụt hơn mức lên xuống bình thường. Mỗi loại việc cần chỉ số riêng. Với A/B test, bạn chốt chỉ số chính và chỉ số chặn từ trước khi chạy. Phản hồi chỉ có ích khi lỗi đã xác nhận quay về bộ eval và judge.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
3. [Define success criteria and build evaluations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
4. [Evals in production - CI, batch, and drift (Claude Academy, Introduction to evals)](https://academy.claude.com/courses/introduction-to-evals/evals-in-production)
5. [Managed Agents tutorial - prompt versioning and rollback (Claude Cookbook)](https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback)
6. [Structured outputs (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
7. [Citations (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/citations)
8. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
