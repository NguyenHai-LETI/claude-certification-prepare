---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/3-3-phan-tich-trace-quy-mo-lon
ngay_tai: 2026-11-27
tieu_de: Phân tích trace ở quy mô lớn - lấy mẫu, gom số, phân tích cohort lỗi
---

Domain 3: Observability and Production Monitoring · Task 3.3

# Phân tích trace ở quy mô lớn - lấy mẫu, gom số, phân tích cohort lỗi

Lấy mẫu trace sao cho vẫn giữ đủ lỗi, gom số từ hàng triệu span, rồi tách cohort để thấy và đo được lỗi hệ thống mà đọc từng trace không thấy.

- 14 phút đọc
- Đối chiếu docs 21/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Chọn cách lấy mẫu giữ được mọi lỗi và nguyên cả hội thoại, và biết lấy mẫu ở ứng dụng ảnh hưởng gì tới span phía Claude API
- Gom số từ span mà không đếm trùng, và không tính tỉ lệ từ dữ liệu đã lấy mẫu
- Phân tích cohort lỗi để tìm nhóm traffic bị hỏng và đo mức ảnh hưởng
- Dùng Claude gom cụm nội dung hội thoại ở quy mô lớn mà vẫn giữ riêng tư

Một lỗi ảnh hưởng tới 6% traffic thường không làm trace nào trông hỏng. Đọc riêng từng hội thoại thì thấy hợp lý, chỉ khi nhìn tổng thể mới thấy kết quả tệ đi. Trace là bản ghi toàn bộ đường đi của một việc, gồm nhiều span. Mỗi span ghi lại một bước, như một lần gọi API hay một lần gọi tool. Bài này trả lời ba câu hỏi. Với hàng triệu span mỗi ngày, nên giữ lại trace nào? Gom số từ chúng thế nào? Và tách nhóm ra sao để thấy và đo được một lỗi hệ thống?

Tên task trong đề là **Trace Analysis at Scale**. Nó gồm việc phân tích lượng trace lớn bằng chiến lược lấy mẫu (**sampling strategies**), gom số (**aggregation**) và phân tích cohort lỗi (**failure-cohort analysis**), để tìm và đo những lỗi hệ thống không lộ ra trong từng trace riêng lẻ (**systemic issues that are not visible in individual traces**). Cách gắn trace vào ứng dụng nằm ở bài 3.1. SLI, tức chỉ số đo chất lượng dịch vụ, và cảnh báo nằm ở bài 3.2.

**Sơ đồ: Phân tích cohort lấy tỉ lệ từ event, kiểu lỗi từ cụm của Claude; trace đã lấy mẫu để đọc**
_Bản đồ bài: Claude gom cụm nội dung ra kiểu lỗi cho bước 1, event tóm tắt của mọi hội thoại cho tỉ lệ ở bước 2, trace đã lấy mẫu ở collector để kỹ sư đọc; bốn bước failure-cohort analysis dẫn tới systemic issue_

- **CLAUDE ĐỌC NỘI DUNG**: lỗi không có dimension
- **Full content**: workspace riêng
- **Claude gom cụm**: đặt tên kiểu lỗi
- **AGGREGATION**: không lấy mẫu, để tính tỉ lệ
- **Event tóm tắt**: ứng dụng ghi cho mọi hội thoại
- **SAMPLING**: để đọc, không để tính tỉ lệ
- **OTel Collector**: tail sampling
- **Trace backend**: kỹ sư đọc từng cái
- **FAILURE COHORT**
- 1. **Định nghĩa lỗi**: tín hiệu đo được
- 2. **Tách theo dimension**: tỉ lệ lỗi mỗi nhóm
- 3. **So baseline**: nhóm cao hẳn, đủ đông
- 4. **Đo ảnh hưởng**: số lỗi thừa, số khách
- **Systemic issue**: lộ ra ở tỉ lệ một nhóm
- dữ liệu đưa vào
- bước tiếp theo
- lỗi hệ thống tìm ra

## Ví dụ xuyên suốt: trợ lý kỹ thuật của một nhà mạng cáp quang

Một nhà mạng internet cáp quang có trợ lý chat hỗ trợ kỹ thuật, khoảng 150.000 hội thoại mỗi ngày. Trợ lý chạy Claude Sonnet 5.5 qua Messages API, dùng tool runner của SDK, tức phần tự chạy vòng gọi tool. Trợ lý có ba tool là `kiem_tra_duong_truyen` (đọc tín hiệu quang và trạng thái modem của khách), `khoi_dong_lai_modem` và `dat_lich_ky_thuat`. Khi không tự xử lý được, trợ lý chuyển khách sang tổng đài. Tỉ lệ chuyển tổng đài thường là 7,5%.

Toàn bộ span đổ về một OpenTelemetry Collector của nhà mạng, tức dịch vụ nhận, lọc và chuyển tiếp span. Span phía SDK do ứng dụng gửi tới. Span phía Claude API do API gửi qua destination, tức địa chỉ bạn khai báo trong Claude Console để API gửi span tới. Mỗi hội thoại sinh khoảng 40 span, tức khoảng 6 triệu span mỗi ngày.

## Lấy mẫu mà vẫn giữ lỗi

Để giảm tiền lưu trữ, nhóm bật lấy mẫu ngay trong ứng dụng. Với mỗi request, ứng dụng chỉ giữ trace với xác suất 5% và bỏ phần còn lại. Một tháng sau, khi cần xem các hội thoại lỗi, họ chỉ tìm được một phần nhỏ so với số lỗi thật, và phần lớn thiếu mất mấy request ở giữa hội thoại.

Quyết định giữ hay bỏ một trace có thể đặt ở hai chỗ, và chọn chỗ nào chính là chọn chiến lược lấy mẫu.

Chỗ thứ nhất là head sampling, tức ứng dụng quyết định ngay lúc trace bắt đầu, trước khi biết kết quả. Quyết định này đi kèm request trong header `traceparent`. Đây là header chuẩn W3C mang trace ID, span ID và cờ sampled, tức cờ cho biết trace có được giữ hay không. Khi cờ này tắt, Claude API không phát span nào cho request đó, kể cả span con. Vì API không có span để trỏ tới, MCP server nối qua MCP connector cũng không nhận được `traceparent` tham chiếu span của API. Nhờ vậy span của ứng dụng, API và MCP server luôn cùng được giữ hoặc cùng bị bỏ. Cái giá phải trả là head sampling không biết request nào sẽ lỗi, nên lấy mẫu 5% thì cũng chỉ giữ được khoảng 5% số lỗi. Với khoảng 450 hội thoại lỗi mỗi ngày, đó là chừng 22 hội thoại, mà phần lớn lại chỉ còn một phần trace.

Chỗ thứ hai là tail sampling, tức collector giữ tạm span tới khi trace xong rồi mới quyết định. Lúc đó đã biết kết quả, nên collector có thể giữ mọi trace có status `ERROR`, bị cắt vì hết giới hạn token (`stop_reason` là `max_tokens`), bị Claude từ chối (`refusal`) hay chậm bất thường. Nó giữ thêm một phần nhỏ trace bình thường. Đây là bộ xử lý tail sampling của OpenTelemetry Collector, không phải tính năng của Claude. Muốn vậy, ứng dụng phải để cờ sampled luôn bật và gửi mọi span về collector. Nếu không, API sẽ không phát span và collector chẳng có gì để chọn. Vì span phía Claude API đi qua destination chứ không đi chung đường với span của ứng dụng, collector phải đợi nhận đủ span từ cả hai phía rồi mới quyết định.

Với agent nhiều lượt, lỗi thường chỉ lộ ra khi đọc liền mấy lượt. Nếu giữ hay bỏ theo từng request, hội thoại bị cắt thành mảnh. Vì vậy nên quyết định cho cả hội thoại. Cách hay dùng là quyết định dựa trên hash của ID hội thoại, tức giá trị bạn đặt vào `conversation_id` của SDK, để mọi request của cùng một hội thoại cùng được giữ hoặc cùng bị bỏ.

**Sơ đồ: Head sampling quyết định trước khi biết có lỗi, tail sampling đợi hội thoại xong rồi mới chọn**
_Cùng một hội thoại bốn lượt, lượt 3 có ERROR: head sampling 5% giữ hay bỏ từng lượt lúc bắt đầu, tail sampling ở collector đợi hết hội thoại rồi giữ trọn_

- **HEAD SAMPLING**: ứng dụng quyết định cho từng request, giữ 5%
- **Lượt 1**: bị bỏ
- **Lượt 2**: được giữ
- **Lượt 3**: ERROR, bị bỏ
- **Lượt 4**: bị bỏ
- quyết định ngay lúc request bắt đầu, khi chưa biết kết quả
- cờ sampled trong traceparent tắt thì Claude API không phát span cho request đó
- **Chỉ khoảng 22 trong 450 hội thoại lỗi còn giữ được một phần trace**
- **TAIL SAMPLING**: collector quyết định cho cả hội thoại
- **Lượt 1**: được giữ
- **Lượt 2**: được giữ
- **Lượt 3**: ERROR, được giữ
- **Lượt 4**: được giữ
- collector giữ tạm span của ứng dụng và của Claude API tới khi hội thoại xong
- quyết định khi hội thoại xong, có ERROR, max_tokens, refusal hay chậm thì giữ trọn
- **Cả 450 hội thoại lỗi được giữ trọn, cùng 2% hội thoại bình thường**: Khoảng 3.400 hội thoại được lưu mỗi ngày, mỗi hội thoại bình thường thay mặt cho 50

Lấy mẫu kiểu này cố ý làm dữ liệu lệch đi. Trong backend lưu trace, khoảng 13% hội thoại có lỗi (450 trên khoảng 3.400), trong khi thực tế chỉ 0,3%. Vì vậy, tỉ lệ lỗi và số request phải lấy từ metric, tức bộ đếm ứng dụng ghi cho mọi request trước khi lấy mẫu. Số token thì lấy từ metric hoặc Usage and Cost Analytics API. Trace đã lấy mẫu chỉ dùng để đọc và để so các nhóm với nhau. Khi so, mỗi trace bình thường phải tính là 50, vì mỗi trace như vậy thay mặt cho 50 hội thoại bình thường.

> **Trong đề chọn gì**
>
> Head sampling ở ứng dụng cũng quyết định luôn span phía Claude API, vì khi cờ sampled tắt thì API không phát span nào cho request đó. Muốn giữ mọi lỗi, bạn dùng tail sampling ở collector và quyết định cho cả hội thoại. Còn tỉ lệ thì phải đo từ metric, đừng đếm từ trace đã lấy mẫu.

## Gom số từ hàng triệu span

Muốn tìm nhóm traffic bị hỏng, trước hết bạn phải gom hàng triệu span thành những con số đọc được. Việc này cần làm trước bốn việc.

- **Bỏ span trùng.** Đường gửi span chỉ bảo đảm mỗi span tới ít nhất một lần, nên có khi cùng một span tới hai lần. Hãy dùng cặp trace ID và span ID để đếm mỗi span đúng một lần.
- **Dựng lại hội thoại.** Gom các span có cùng `gen_ai.conversation.id` rồi xếp theo thời gian bắt đầu. Nếu chạy agent trên Managed Agents, tức dịch vụ chạy agent do Anthropic host, thì gom theo `anthropic.session.id` để có đủ cả session. Từ đó tính các con số của cả hội thoại như số lượt, số lần gọi từng tool, và có chuyển tổng đài không.
- **Ghi một event tóm tắt cho mọi hội thoại.** Khi hội thoại kết thúc, ứng dụng ghi một event gồm các field cố định, chứa những con số vừa tính và các dimension ở gạch sau. Event này ghi cho mọi hội thoại, không lấy mẫu. 150.000 event mỗi ngày rẻ hơn nhiều so với 6 triệu span, và đây là nguồn để tính tỉ lệ trên toàn bộ traffic.
- **Gắn dimension để tách nhóm.** Dimension là thứ bạn dùng để chia traffic thành nhóm, như model, vùng hay version. Span có sẵn một số dimension, gồm model thật sự trả lời request (`gen_ai.response.model`), `stop_reason`, `error.type`, tên tool, và workspace (đơn vị chia tài nguyên trong tổ chức). Những dimension riêng của bạn như version prompt, version app, vùng, dòng modem, version firmware hay giờ trong ngày thì tự thêm làm thuộc tính span.

Có dimension rồi, bạn gom số theo nhóm thay vì xem từng trace. Bảng sau ghép những câu hỏi hay gặp với cách gom số để trả lời.

| Câu hỏi | Cách gom |
| --- | --- |
| Tool nào hay hỏng, hay chậm? | Gom theo tên tool, tính tỉ lệ span `ERROR` và thời lượng p50, p95 (mức mà 50% và 95% số lần gọi nhanh hơn) |
| Model có trả lời bị cắt không? | Phân bố `anthropic.message.stop_reason` theo model và version prompt |
| Hội thoại tốn token nhiều nhất ở bước nào? | Token theo bước, theo số lượt, và số request mỗi hội thoại |
| Lần thay đổi nào làm các số trên xấu đi? | Mọi số trên, tách theo version app, prompt và model, so trước và sau ngày deploy |

## Phân tích cohort lỗi

Nhóm đã chuyển sang tail sampling theo hội thoại. Trong hai tuần sau đó, tỉ lệ chuyển tổng đài tăng từ 7,5% lên khoảng 8,9%. Nhóm lấy ngẫu nhiên 50 trace có chuyển tổng đài ra đọc. Trace nào cũng giống nhau, trợ lý hỏi đúng, gọi `kiem_tra_duong_truyen`, nhận kết quả "không xác định", xin lỗi rồi chuyển khách. Không trace nào trông sai.

Gặp một lỗi lẻ, Claude thường tự xoay xở được, chẳng hạn hỏi lại, xin lỗi hay chuyển khách cho nhân viên. Vì vậy span không báo `ERROR` và hội thoại nào nhìn cũng hợp lý, chỉ có tần suất là bất thường. Muốn thấy tần suất đó, bạn dùng phân tích cohort lỗi. Cohort là một nhóm hội thoại có chung một đặc điểm, ví dụ cùng vùng hay cùng dòng modem. Cách làm có bốn bước.

1. Chọn một tín hiệu đo được trên mọi hội thoại làm định nghĩa lỗi. Ở đây lỗi là hội thoại bị chuyển tổng đài.
2. Tách event tóm tắt của mọi hội thoại theo từng dimension (vùng, dòng modem, version firmware, version app, model, version prompt, giờ trong ngày), rồi tính tỉ lệ lỗi của mỗi nhóm.
3. So tỉ lệ của mỗi nhóm với baseline, tức tỉ lệ của toàn bộ phần còn lại. Tìm nhóm vừa có tỉ lệ cao hơn hẳn vừa đủ đông. Một nhóm chỉ có 20 hội thoại mà tỉ lệ lỗi 50% thì có thể chỉ là ngẫu nhiên.
4. Đo ảnh hưởng. Số lỗi thừa, tức số lỗi vượt so với mức bình thường, bằng số hội thoại của nhóm nhân với phần chênh tỉ lệ. Sau đó đếm thêm số khách bị ảnh hưởng, vì một tỉ lệ nhỏ tính trên hội thoại vẫn có thể chạm tới rất nhiều khách.

**Sơ đồ: Gộp chung chỉ thấy 7,5% lên 8,9%, tách theo firmware thì nhóm 3.2 chuyển tổng đài tới 31%**
_Biểu đồ cột tỉ lệ chuyển tổng đài: toàn bộ traffic 7,5% rồi 8,9%, phần còn lại 7,5%, firmware 3.2 là 31%, phần vượt baseline ứng với khoảng 2.100 lượt thừa mỗi ngày_

- **TỈ LỆ CHUYỂN TỔNG ĐÀI**: tính trên event tóm tắt của mọi hội thoại
- **GỘP CHUNG**
- **Lúc đầu**
- **7,5%**
- **Hai tuần sau**
- **8,9%**
- **TÁCH THEO VERSION FIRMWARE**
- **Phần còn lại**
- **7,5%**: baseline
- **Firmware 3.2**: 9.000 hội thoại/ngày
- **31%**: phần vượt baseline
- **9.000 × (31% − 7,5%) ≈ 2.100 lượt chuyển thừa mỗi ngày**: Firmware 3.2 đổi tên trường tín hiệu quang nên kiem_tra_duong_truyen đọc ra rỗng

Tính ra, nhóm firmware 3.2 có 9.000 × (31% − 7,5%) ≈ 2.100 lượt chuyển tổng đài thừa mỗi ngày. Lỗi nằm ở dữ liệu tool trả về chứ không nằm ở model. Firmware 3.2 đổi tên trường chứa tín hiệu quang trong dữ liệu modem trả về, nên `kiem_tra_duong_truyen` đọc ra giá trị rỗng. Claude không bịa ra một giá trị tín hiệu mà chuyển khách sang tổng đài, và đó là cách xử lý đúng.

Đếm theo khách quan trọng tới mức nào thì có thể thấy qua một sự cố có thật của Anthropic. Tháng 8 và tháng 9 năm 2025, Anthropic gặp ba lỗi hạ tầng xảy ra chồng lên nhau. Một trong ba lỗi làm một số request tới Sonnet 4 bị gửi nhầm sang server dành cho context window 1 triệu token. Lúc đầu lỗi này ảnh hưởng khoảng 0,8% request, về sau tăng lên, và vào giờ tệ nhất là 16%. Tính cả giai đoạn, khoảng 30% người dùng Claude Code có ít nhất một message bị gửi nhầm như vậy. Mỗi nền tảng, gồm API của Anthropic, Amazon Bedrock và Google Cloud, bị ảnh hưởng ở mức khác nhau, nên nhìn tổng thể chỉ thấy chất lượng giảm lác đác.

Sự cố này cho hai bài học, giống hệt chuyện firmware của nhà mạng. Thứ nhất, tỉ lệ nhỏ tính theo request vẫn có thể ứng với rất nhiều người. Thứ hai, gộp mọi nền tảng lại thì nhóm bị ảnh hưởng nặng nhất sẽ bị che mất.

> **Bẫy đề**
>
> Tỉ lệ chuyển tổng đài của nhà mạng tăng từ 7,5% lên khoảng 8,9%, và 50 trace đọc ngẫu nhiên đều trông hợp lý. Có ba hướng xử lý nghe hợp lý nhưng sai.
>
> - **Đọc thêm trace cho tới khi thấy lỗi.** Nghe như làm kỹ hơn. Nhưng trace nào cũng hợp lý, đọc 500 trace cũng chỉ thấy cùng một mẫu "không xác định" mà vẫn không biết nó tập trung ở nhóm nào.
> - **Giữ nhiều trace bình thường hơn, từ 2% lên 20%.** Nghe như thêm dữ liệu là thêm hiểu biết. Nhưng thứ còn thiếu không phải là số trace mà là dimension để tách nhóm, trong khi số trace phải lưu tăng từ khoảng 3.400 lên khoảng 30.000 mỗi ngày.
> - **Đổi sang model mạnh hơn để bớt chuyển tổng đài.** Nghe như sửa chất lượng trả lời. Nhưng tool trả `tin_hieu_quang` rỗng, và nếu model mạnh hơn tự đoán một giá trị tín hiệu để khỏi chuyển khách thì còn tệ hơn.
>
> **Chọn:** tách tỉ lệ chuyển tổng đài theo từng dimension để tìm ra nhóm firmware 3.2, đo số lượt chuyển thừa, rồi sửa cách `kiem_tra_duong_truyen` đọc trường tín hiệu quang.

## Dùng Claude đọc nội dung ở quy mô lớn

Lỗi firmware tìm ra được vì nó gắn với một dimension có sẵn trên span. Có những kiểu lỗi không gắn với dimension nào cả. Ví dụ, khách tả "mạng chập chờn buổi tối", trợ lý hiểu thành mất mạng và đặt lịch kỹ thuật, trong khi thật ra wifi nhà khách bị nghẽn. Muốn đếm kiểu lỗi này phải đọc nội dung, và không ai đọc nổi 3.400 hội thoại mỗi ngày.

Cách làm là để Claude đọc từng hội thoại rồi xếp những hội thoại giống nhau vào chung một cụm (clustering). Anthropic dựng Clio theo cách này. Clio là công cụ nghiên cứu xem người dùng dùng Claude vào việc gì mà vẫn giữ riêng tư cho họ. Áp vào nhà mạng, quy trình có bốn bước.

1. **Rút facet** cho mỗi hội thoại. Facet là vài trường mô tả ngắn, như vấn đề khách tả, việc trợ lý đã làm, lý do chuyển tổng đài, và có đặt lịch kỹ thuật hay không. Trong prompt, bạn yêu cầu Claude bỏ những chi tiết riêng như tên, địa chỉ, số hợp đồng.
2. **Gom cụm** các hội thoại có facet gần nhau, rồi cho Claude viết tên và mô tả cho từng cụm.
3. **Đặt ngưỡng tối thiểu.** Một cụm chỉ hiện cho kỹ sư xem khi có đủ số khách khác nhau. Nhờ vậy, chủ đề quá hẹp, chỉ gắn với một người cụ thể, sẽ không bị lộ ra. Clio còn cho Claude kiểm lại mô tả cụm để chắc không có thông tin nhận diện được người.
4. **Đếm và tách.** Đếm xem cụm "chập chờn buổi tối bị hiểu thành mất mạng" có bao nhiêu hội thoại và bắt đầu tăng từ khi nào. Sau đó tách cụm theo version prompt và các dimension khác, giống cách đã tìm ra nhóm firmware 3.2.

Việc này cần đọc nội dung hội thoại, nên phải chạy ở nơi được phép giữ nội dung. Như ở bài 3.1, bạn đặt chế độ Full content cho destination của một workspace riêng để span chứa cả nội dung hội thoại, và chỉ cấp quyền đọc cho ít người. Thứ được đưa ra ngoài chỉ là kết quả đã gom cụm. Rút facet không cần có kết quả ngay, nên bạn có thể gửi qua Message Batches API. API này nhận cả loạt request, xử lý dần rồi trả kết quả sau, với giá chỉ bằng một nửa.

**Sơ đồ: Nội dung hội thoại ở lại trong workspace riêng, ra ngoài chỉ có những cụm đủ đông**
- Workspace riêng, destination Full content
- đủ
- chưa đủ
- 1. Rút facetbỏ tên, địa chỉqua Batches API
- 2. Gom cụmClaude đặt tên
- 3. Ngưỡngđủ số kháchkhác nhau?
- 4. Đếm, tách cụmchập chờn buổi tốitheo version prompt
- Không hiệncho kỹ sư

> **Ý chính**
>
> Lỗi hệ thống lộ ra ở tỉ lệ của một nhóm chứ không ở từng trace. Muốn tìm nó, bạn tách traffic theo dimension, so từng nhóm với baseline, rồi đo ảnh hưởng theo cả số lượt lẫn số khách. Tỉ lệ phải lấy từ metric và event tóm tắt, không lấy từ trace đã lấy mẫu.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [OpenTelemetry tracing for the Claude API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry)
3. [Set up OpenTelemetry with the Claude API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api)
4. [OpenTelemetry span reference (Claude API Docs)](https://platform.claude.com/docs/en/api/opentelemetry/spans)
5. [Trace Claude API requests and Managed Agents sessions with OpenTelemetry (Claude Cookbook)](https://platform.claude.com/cookbook/observability-opentelemetry-tracing)
6. [A postmortem of three recent issues (Anthropic Engineering)](https://www.anthropic.com/research/a-postmortem-of-three-recent-issues)
7. [An update on recent Claude Code quality reports (Anthropic Engineering)](https://www.anthropic.com/research/april-23-postmortem)
8. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
9. [Clio: privacy-preserving insights into real-world AI use (Anthropic)](https://www.anthropic.com/research/clio)
10. [Trace agents with OpenTelemetry on the Claude Platform (Claude)](https://claude.com/resources/articles/agent-observability-on-the-claude-platform)
