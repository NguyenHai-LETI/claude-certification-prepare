---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/4-1-chan-doan-loi-phuc-tap
ngay_tai: 2026-11-27
tieu_de: Chẩn đoán lỗi phức tạp - tìm ra lỗi sinh ở model, harness, tool hay dữ liệu
---

Domain 4: Advanced Debugging and Incident Response · Task 4.1

# Chẩn đoán lỗi phức tạp - tìm ra lỗi sinh ở model, harness, tool hay dữ liệu

Gom bằng chứng từ trace, gửi lại đúng request đã ghi để tách model khỏi harness, rồi lần theo lỗi nhiều lượt, nhiều agent, refusal và grounding.

- 20 phút đọc
- Đối chiếu docs 24/11/2026
- 13 nguồn

## Đọc xong bạn nắm được

- Gom đủ bằng chứng của một lần chạy hỏng, kể cả phần trace mặc định không ghi
- Gửi lại request đã ghi và đổi từng phần một để biết lỗi do model, harness, tool hay dữ liệu
- Lần ngược một lỗi nhiều lượt hay nhiều agent về chỗ nó sinh ra
- Chẩn đoán lỗi lúc có lúc không bằng cách chạy nhiều lần và tìm điểm rẽ đầu tiên
- Phân biệt refusal của safety classifier với các kiểu "từ chối" khác, và tách lỗi truy xuất khỏi lỗi grounding

Trợ lý trả lời sai ở lượt 9, nhưng lỗi sinh ra ở đâu? Với lỗi production phức tạp (**complex production failures**), lỗi hiếm khi lộ ra ở đúng chỗ nó sinh ra. Có thể thông tin đã rơi mất từ lượt 3, hoặc subagent đã báo đúng nhưng agent chính tóm tắt sai.

Tên task trong đề là **Complex Failure Diagnosis**. Nó gồm việc phân tích bằng chứng (**analyzing evidence**) từ lỗi nhiều lượt (**multi-turn**), lỗi nhiều agent (**multi-agent**) và lỗi lúc có lúc không (**non-deterministic**), để tìm ra lỗi sinh ra ở đâu (**problem origin**). Thường lỗi nằm ở một trong bốn chỗ, là output của model (**model output**), harness của agent (**agent harness**), tool (**tools**) và dữ liệu (**data**). Harness là phần code bạn viết bọc quanh model, lo ghép message, chạy tool, quản lý context và giao việc cho subagent. Dữ liệu là những gì tool hay hệ truy xuất đưa vào cho Claude, như bảng giá hay văn bản chính sách. Task cũng gồm hai loại lỗi cần nhận ra riêng, là refusal của model (**model refusals as a failure class**) và lỗi truy xuất, grounding (**retrieval-grounding failures**).

**Sơ đồ: Gom trace, gửi lại request và đổi từng thứ một để biết lỗi sinh ở model, harness, tool hay dữ liệu**
_Bốn chỗ sinh lỗi và cách tìm ra lỗi nằm ở chỗ nào_

- **Gom trace đủ**: raw body và request ID
- 1. **Gửi lại request**: không qua harness
- 2. **Đổi từng thứ một**: ablation, chạy nhiều lần
- 3. **PROBLEM ORIGIN, BỐN CHỖ SINH LỖI**
- **Model output**: đầu ra của Claude
- **Agent harness**: code bọc quanh model
- **Tools**: tool và schema
- **Data**: văn bản, bảng giá
- **CÁCH KIỂM**: dùng kết quả tool
- đã ghi, chạy lại
- gửi lại thẳng tới API
- bỏ từng phần request
- so trace đúng và sai
- tìm điểm rẽ đầu tiên
- văn bản xếp trên
- còn hiệu lực không
- **CA TRONG BÀI**: trích đúng đoạn
- mà thiếu căn cứ
- lượt trống sau
- tool_result
- refusal
- reasoning_extraction
- thiếu huyen, tool
- tính giá nội thành
- văn bản hết hạn
- còn trong index

Bài này đi tiếp từ bài 4.4 của CCAR-P. Ở đó bạn đã học cách tách lỗi trong một request, cách kiểm xem Claude có bịa thông tin không, và các lỗi tool cơ bản. Cách gom lỗi thành nhóm trên hàng nghìn trace nằm ở bài 3.3. Cách xử lý khi Claude từ chối trong lúc chạy production nằm ở bài 2.1.

## Ví dụ xuyên suốt: trợ lý mua sắm của chuỗi siêu thị điện máy

Một chuỗi 140 siêu thị điện máy có trợ lý mua sắm trên web và app, khoảng 11.000 hội thoại mỗi ngày, trung bình 9 lượt mỗi hội thoại. Agent chính là một vòng lặp đội tự viết, gọi Messages API. Nó nói chuyện với khách, và khi cần thì gọi một tool giao việc để chuyển việc cho một trong ba subagent. Subagent thứ nhất tra tồn kho và giá. Subagent thứ hai tra khuyến mãi và trả góp, bằng cách tìm trong khoảng 900 văn bản chính sách. Subagent thứ ba tính phí giao và lắp đặt bằng tool `tinh_phi_giao`, nhận địa chỉ giao có tham số `huyen`.

Đội ghi lại từng lượt, từng lần gọi API và từng lần gọi tool thành trace, tức nhật ký có cấu trúc của một lần chạy, theo chuẩn OpenTelemetry. Trace được gửi về collector, tức máy chủ gom trace, của công ty. Trace có cả nguyên request, response và kết quả tool. Đội ghi được nhiều như vậy vì hệ thống lưu trace đã được duyệt cho phép giữ dữ liệu khách 14 ngày.

## Gom đủ bằng chứng của lần chạy hỏng trước khi đoán

Nếu chỉ nhìn câu trả lời cuối mà đoán gốc lỗi thì thường đoán sai, vì cùng một triệu chứng có thể đến từ bất kỳ chỗ nào trong bốn chỗ. Vì vậy việc đầu tiên là gom đủ bằng chứng của đúng lần chạy hỏng, gồm ba thứ.

Thứ nhất là cây span, cho biết lần chạy đã đi qua những bước nào. Mỗi bước, như một lượt, một lần gọi API hay một lần gọi tool, là một span. Các span lồng vào nhau thành một trace. Span của subagent phải nằm dưới span của lần giao việc, để cả chuỗi nằm trong cùng một trace. Đội siêu thị tự viết vòng lặp nên phải tự lồng span cho đúng. Nếu dùng Agent SDK thì SDK làm sẵn việc này. SDK chạy Claude Code CLI như một subprocess, và CLI ghi một span `claude_code.interaction` cho mỗi lượt, một span `claude_code.llm_request` cho mỗi lần gọi API (kèm tên model, độ trễ, số token), một span `claude_code.tool` cho mỗi lần gọi tool. Span của subagent nằm dưới span `claude_code.tool` của agent chính. Nhiều lần gọi `query()`, tức hàm gửi một yêu cầu cho agent trong SDK, không tự nối thành một dòng thời gian. Muốn ghép chúng lại, bạn lọc theo `session.id`. Trace của SDK đang ở bản beta, muốn dùng thì phải đặt biến môi trường `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`.

Thứ hai là nội dung của từng bước, phần mà mặc định trace không ghi. Mặc định, span chỉ ghi khung của lần chạy như thời gian, tên model, tên tool. Với Agent SDK, muốn ghi input của tool thì bật `OTEL_LOG_TOOL_DETAILS=1`. Muốn ghi kết quả tool thì bật `OTEL_LOG_TOOL_CONTENT=1`, và mặc định kết quả dài hơn 60 KB sẽ bị cắt. Muốn có raw body thì bật `OTEL_LOG_RAW_API_BODIES`. Raw body là nguyên JSON của request và response gửi qua Messages API, gồm cả lịch sử hội thoại. Raw body ghi thẳng vào span cũng bị cắt ở 60 KB, mà hội thoại 9 lượt kèm kết quả tool dễ vượt mức này. Nếu cần body nguyên vẹn để gửi lại, bạn đặt biến này thành `file:<thư mục>` để ghi body ra file. Riêng phần thinking, tức đoạn Claude suy nghĩ trước khi trả lời, đã bị che đi trong raw body. Bạn chỉ nên bật các biến này khi hệ thống lưu trace được phép giữ dữ liệu khách.

Thứ ba là các mã để đối chiếu. Mỗi response có một request ID, và bạn cần gửi kèm mã này khi hỏi support. Đội cũng nên tự gắn version của prompt, tool và harness vào span, để biết lần chạy hỏng đã dùng bản nào.

Khi đọc trace của Agent SDK, có hai chỗ dễ hiểu nhầm. Một là nếu collector không nhận, CLI bỏ telemetry mà không báo gì, nên thiếu span chưa chắc là lượt đó không chạy. Bạn đặt `CLAUDE_CODE_OTEL_DIAG_STDERR=1` để CLI in lỗi gửi trace ra stderr. Hai là span của request bị lỗi hay bị huỷ có thể không có số token.

Ở hệ nhiều agent, thiếu trace thì gần như không đoán được gốc lỗi. Anthropic kể về hệ nghiên cứu nhiều agent của họ. Khi một agent không tìm ra thông tin mà ai cũng thấy, lý do có thể là nó viết câu tìm kiếm kém, chọn nguồn kém, hay tool bị hỏng. Chỉ trace đầy đủ từ production mới cho biết là lý do nào.

## Gửi lại đúng request để tách model khỏi harness

Khi đã có raw body, cách nhanh nhất để biết lỗi do model hay do harness là tự gửi lại đúng request đó vài lần, thẳng tới Messages API, không đi qua harness. Kết quả cho bạn biết bước tiếp theo.

**Sơ đồ: Gửi lại request không qua harness để biết nên nghi harness hay bỏ từng phần của request**
- hầu hết tốt
- vẫn hỏng
- hết lỗi
- vẫn còn lỗi
- Gửi lại raw bodyvài lần, thẳngtới API
- Harness gây lỗi lúcđọc response, chạy toolhay ghép lượt sau
- Bỏ từng phầncủa request
- Phần vừa bỏ là gốc,cần tìm ai đưa nó vào
- Gốc chưa rõ, bạn đổimodel hay kết quả tool,mỗi lần một thứ

Cách bỏ từng phần một rồi xem lỗi có hết không gọi là ablation. Mùa xuân 2026, nhiều người phàn nàn Claude Code kém đi, dù API và tầng inference vẫn bình thường. Một trong ba nguyên nhân là một dòng system prompt giới hạn độ dài câu trả lời. Dòng này chỉ lộ ra khi Anthropic bỏ thử từng dòng system prompt, chạy trên một bộ eval rộng hơn và thấy điểm giảm 3%.

Đội siêu thị cũng gặp một ca như vậy. Thứ Hai, họ cập nhật harness, và trong cùng tuần đó agent chính chuyển sang model mới. Từ đó, khoảng 5% hội thoại có một lượt trợ lý trả lời trống ngay sau khi tra tồn kho. Khách hỏi giá mà màn hình không hiện gì.

Raw body của 40 lượt trống cho thấy response chỉ dài 2–3 token, và `stop_reason` là `end_turn`, tức Claude tự cho là đã trả lời xong. Đội gửi lại nguyên 40 request đó thì response vẫn trống, nên lỗi nằm trong chính request. Bản harness mới chèn thêm một block text ngay sau `tool_result`, tức block chứa kết quả tool gửi về cho Claude. Block đó có câu "Nhắc: giá phải gồm VAT". Khi đội bỏ block text này đi, Claude trả lời bình thường, trên cả model cũ lẫn model mới.

Lý do là lịch sử hội thoại cho thấy ngay sau mỗi kết quả tool đều có một đoạn text của user. Claude thường học theo mẫu đó và kết thúc lượt của mình mà không viết gì. Không phải lần nào Claude cũng làm vậy, nên chỉ một phần lượt bị trống. Đội sửa ở harness, bỏ block text khỏi message chứa `tool_result` và chuyển lời nhắc VAT vào system prompt. Nếu vẫn còn lượt trống, harness nên thêm một user message mới để nhắc Claude trả lời tiếp. Gửi lại y nguyên lịch sử có response trống thì không ăn thua, vì Claude đã coi lượt đó là xong.

> **Bẫy đề**
>
> Trong tuần có lượt trống, đội vừa đổi model vừa cập nhật harness. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Quay lại model cũ** (_roll back the model upgrade_). Nghe như bỏ đi thay đổi đáng ngờ nhất. Nhưng gửi request đã ghi tới model cũ thì response vẫn trống, nghĩa là lỗi nằm ở cách harness ghép message chứ không ở model.
> - **Tự gửi lại khi response trống** (_retry empty responses_). Nghe như vá được ngay cho khách. Nhưng gửi lại đúng lịch sử đó thì Claude vẫn coi lượt là xong, và hệ thống chỉ tốn thêm request.
> - **Tăng `max_tokens`** (_raise the output budget_). Nghe như response bị cắt giữa chừng. Nhưng `stop_reason` là `end_turn` chứ không phải `max_tokens`, nên Claude dừng vì nó cho là đã xong.
>
> **Chọn:** lấy raw body của lượt hỏng, gửi lại thẳng tới API không qua harness, rồi bỏ từng phần của request cho tới khi hết lỗi. Trong ca này, phần gây lỗi là block text mà harness chèn sau `tool_result`.

## Lỗi nhiều lượt: lỗi lộ ra ở lượt sau nhưng sinh ra từ lượt trước

Với lỗi nhiều lượt (**multi-turn failures**), câu hỏi đầu tiên là thông tin cần cho lượt hỏng có còn trong request của lượt đó không. Ở siêu thị, một khách nói ngay lượt 2 rằng nhà ở tầng 5 chung cư không có thang máy. Tới lượt 9, trợ lý báo phí giao và lắp máy giặt như nhà có thang máy. Mở request của lượt 9 ra, đội thấy câu của khách ở lượt 2 không còn, vì harness đã tóm tắt phần lịch sử cũ và bỏ mất chi tiết đó.

Thông tin có thể rơi khỏi request theo hai cách, hoặc vẫn còn nguyên mà Claude không dùng tới.

- **Harness cắt hay nén lịch sử.** Để request vừa context, harness có thể tóm tắt phần lịch sử cũ (compaction), xoá kết quả tool cũ hay xoá phần thinking cũ. Lúc làm vậy, nó có thể xoá mất đúng chi tiết khách nói ở đầu hội thoại.
- **Harness có bug trong cách quản lý context.** Tháng 3/2026, Claude Code có một thay đổi nhằm xoá thinking cũ đúng một lần khi session đã nghỉ quá một giờ. Do bug, nó lại xoá ở mọi lượt sau đó. Người dùng thấy Claude hay quên và lặp lại, tưởng là model kém đi. Cùng lúc, một thay đổi khác trong cách hiển thị thinking làm bug không lộ ra ở phần lớn session CLI, nên phải mất hơn một tuần mới xác nhận được gốc lỗi.
- **Claude có thông tin nhưng không dùng.** Chỉ khi thông tin vẫn còn nguyên trong request mà câu trả lời bỏ qua nó, bạn mới nên nghi tới prompt hay model.

Vì vậy, khi trợ lý sai ở lượt 9, bạn mở request của lượt 9 ra và kiểm xem thông tin khách nói ở lượt trước còn trong đó không. Hãy tìm bước sai sớm nhất chứ đừng dừng ở chỗ lỗi lộ ra. Lỗi của agent cộng dồn qua từng bước. Một bước hỏng có thể kéo cả chuỗi bước sau đi sai hướng, nên những bước sai về sau thường chỉ là hệ quả.

## Lỗi nhiều agent: lần theo đường giao việc

Với lỗi nhiều agent (**multi-agent failures**), mỗi chỗ giao nhận là một chỗ thông tin có thể rơi mất. Có ba chỗ như vậy, là prompt giao việc mà agent chính viết cho subagent, cách subagent làm việc, và cách agent chính tóm tắt kết quả.

Trong hai tuần, siêu thị nhận 37 khiếu nại giống nhau. Trợ lý nói tủ lạnh được trả góp 0%, nhưng khách tới quầy mới biết chương trình chỉ áp dụng cho thẻ của hai ngân hàng. Trace của các hội thoại đó cho thấy bốn bước.

1. Ở lượt 3, khách nói thẻ của mình thuộc một ngân hàng khác.
2. Prompt giao việc, tức toàn bộ những gì subagent khuyến mãi nhìn thấy, chỉ là "tra trả góp 0% cho tủ lạnh mã RF-520".
3. Subagent trả về đúng, là có trả góp 0% kèm điều kiện thẻ ngân hàng A hoặc B.
4. Agent chính tóm lại thành "được trả góp 0%" và bỏ mất điều kiện.

Subagent đã làm đúng với input nó nhận. Gốc lỗi nằm ở hai chỗ giao nhận của agent chính, là prompt giao việc thiếu thông tin và bản tóm tắt làm rơi điều kiện. Prompt giao việc quá ngắn là lỗi hay gặp ở hệ nhiều agent, vì subagent dễ hiểu sai việc hoặc làm trùng việc của nhau. Mỗi prompt giao việc nên nói rõ mục tiêu, kết quả trả về theo định dạng nào, nên dùng tool nào, và việc gì nằm ngoài phạm vi.

Đội sửa hai chỗ ở harness. Schema của tool giao việc có thêm một trường bắt buộc ghi ngân hàng của thẻ khách. Subagent trả về JSON có trường `dieu_kien`, và agent chính phải nêu lại trường này. Đội chạy lại 200 hội thoại hỏi trả góp trên bản cũ và bản đã sửa. Câu trả lời thiếu điều kiện giảm từ 28 hội thoại (14,0%) xuống 3 hội thoại (1,5%).

**Sơ đồ: Subagent báo đúng điều kiện thẻ, nhưng điều kiện rơi ở hai chỗ giao nhận của agent chính**
_Đường giao nhận của câu hỏi trả góp tủ lạnh RF-520, trước và sau khi sửa_

- **TRƯỚC KHI SỬA, 37 KHIẾU NẠI TRONG HAI TUẦN**
- **Khách**
- **Agent chính**
- **Subagent khuyến mãi**: lượt 3, thẻ thuộc ngân hàng khác
- 1. prompt giao việc chỉ có mã RF-520
- 2. không có ngân hàng của thẻ
- 0%, chỉ cho thẻ ngân hàng A hoặc B
- 3. “được trả góp 0%”
- 4. điều kiện thẻ bị bỏ mất
- **SAU KHI SỬA HAI CHỖ GIAO NHẬN Ở HARNESS**
- **Trường bắt buộc**
- **Trường dieu_kien**: ngân hàng của thẻ khách
- 2. agent chính phải nêu lại
- 4. **Lỗi giảm từ 28 xuống 3**: trên 200 hội thoại, 14,0% → 1,5%

Một thay đổi nhỏ ở agent chính có thể đổi cách subagent làm việc theo kiểu khó đoán. Vì vậy, mỗi lần sửa prompt của agent chính, đội chạy lại toàn bộ test case của các subagent.

> **Trong đề chọn gì**
>
> Khi lỗi lộ ra ở agent chính hay ở một lượt sau, hãy lần ngược qua các chỗ giao nhận để tìm bước sai sớm nhất. Nếu subagent đã làm đúng với input nó nhận thì gốc lỗi nằm ở chỗ giao việc. Cách sửa là thêm cấu trúc, như trường bắt buộc trong prompt giao việc và trong kết quả, chứ không phải dặn thêm bằng lời.

## Lỗi lúc có lúc không: chạy nhiều lần rồi mới kết luận

Có những lỗi lúc xảy ra lúc không dù input giống hệt (**non-deterministic failures**). Với loại lỗi này, gửi lại một lần thấy đúng chưa chứng minh lỗi đã hết. Ngược lại, tái hiện được lỗi một lần cũng chưa chứng minh bạn đã tìm đúng gốc. Bạn nên làm theo bốn bước.

- **Chạy nhiều lần và đếm.** Một khách báo phí giao bị tính sai cho địa chỉ ở huyện ngoại thành. Đội chạy lại hội thoại đó 20 lần và thấy 3 lần sai. Phải có tỉ lệ lỗi trước khi sửa thì mới biết bản sửa có tốt hơn không. Hai thước đo hay dùng là pass@k, xác suất ít nhất một trong k lần chạy đúng, và pass^k, xác suất cả k lần đều đúng (bài 5.1).
- **Tìm điểm rẽ đầu tiên.** Bạn đặt trace của lần đúng và lần sai cạnh nhau rồi tìm span đầu tiên khác nhau. Trong ca phí giao, đó là lần gọi tool `tinh_phi_giao`. Ở lần sai, Claude không truyền tham số `huyen`, và tool không báo lỗi mà lặng lẽ tính theo giá nội thành. Vậy gốc lỗi nằm ở tool, vì schema không đánh dấu `huyen` là bắt buộc. Cách sửa là đánh dấu tham số này bắt buộc. Khi thiếu nó, tool trả về một kết quả (`tool_result`) có `is_error: true`, kèm câu nói rõ thiếu tham số nào, để Claude hỏi lại khách hoặc gọi lại tool. Cùng lý do đó, khi tool bị timeout hay gặp lỗi mạng, harness cũng phải gửi về `tool_result` có `is_error: true`. Nếu harness chỉ gửi về một kết quả rỗng mà không đánh dấu lỗi, Claude không có tín hiệu rõ ràng nào cho biết tool đã hỏng, và dễ làm tiếp như thể tool đã chạy xong.
- **Giữ nguyên mọi thứ trừ model.** Khi chạy lại, bạn đưa vào kết quả tool đã ghi thay vì gọi tool thật. Nếu kết quả vẫn lúc đúng lúc sai thì phần ngẫu nhiên nằm ở model, hoặc ở hạ tầng chạy model như ca dưới đây. Nếu lỗi biến mất thì nó đến từ tool hoặc từ dữ liệu đang thay đổi.
- **Nghi cả hạ tầng và cả bộ eval.** Tháng 8/2025, Anthropic gặp một lỗi trình biên dịch trên loại chip dùng để chạy model. Lỗi này lúc xảy ra lúc không, tuỳ vào những thứ chẳng liên quan như thao tác nào chạy ngay trước hay sau nó. Vì vậy cùng một prompt mà lúc đúng lúc sai, và một workaround cũ còn che lỗi này suốt nhiều tháng. Điểm eval thấp cũng chưa chắc là do agent. Opus 4.5 từng chỉ đạt 42% trên benchmark CORE-Bench, một phần vì bộ chấm quá cứng, đòi đúng "96.124991…" nên chấm sai đáp án "96.12". Phần còn lại vì mô tả task mơ hồ, có task mang yếu tố ngẫu nhiên không tái hiện được, và scaffold, tức phần code chạy agent, quá hạn chế.

## Refusal là một loại lỗi riêng

Refusal là khi Claude không làm việc được yêu cầu. Nên coi refusal là một loại lỗi riêng, vì có mấy kiểu trông giống nhau nhưng gốc lại khác nhau. Việc đầu tiên là xác định bạn đang gặp kiểu nào. Bảng dưới có một kiểu đến từ safety classifier, tức bộ phân loại an toàn của API. Khi classifier chặn, response vẫn trả HTTP 200 nhưng dừng với `stop_reason: "refusal"`.

| Trông như | Dấu hiệu | Gốc thường gặp |
| --- | --- | --- |
| Safety classifier của API từ chối | HTTP 200, `stop_reason: "refusal"`, có `stop_details` (trường `category` có thể là `null`) | Nội dung request khớp một nhóm chính sách, có khi do chính prompt của harness |
| Claude tự từ chối bằng lời | `end_turn`, câu trả lời giải thích vì sao không làm | Prompt, chính sách trong system prompt, hoặc yêu cầu thật sự nằm ngoài phạm vi |
| Claude không làm theo chỉ dẫn trong kết quả tool mà hỏi lại người dùng | Kết quả tool có câu ra lệnh | Harness đặt chỉ dẫn của chính nó trong `tool_result`, và Claude coi đó là nội dung từ bên ngoài, không tin như lời người dùng |

Đội siêu thị gặp refusal của classifier sau khi thêm trường `suy_luan` vào schema của tool tính phí, để ghi lại vì sao subagent chọn mức phí đó. Từ đó, một phần request bị từ chối với nhóm `reasoning_extraction`. Nhóm này thường xuất hiện khi prompt, skill (gói chỉ dẫn nạp thêm cho Claude) hay mô tả tool yêu cầu Claude viết suy luận của chính nó ra output. Với nhóm này, Anthropic khuyên sửa prompt chứ không thử lại trên model khác, và gửi lại đúng request thì thường vẫn bị từ chối. Với nhóm này, request bị từ chối trước khi có output vẫn bị tính tiền, còn các nhóm như `cyber` thì không. Đội sửa harness, đổi trường đó thành một lời giải thích ngắn hay bằng chứng cho mức phí.

Có hai chỗ nữa làm refusal khó thấy khi chẩn đoán. Thứ nhất, refusal trả về HTTP 200, nên dashboard chỉ đếm lỗi 5xx sẽ không thấy nó. Thứ hai, tham số `fallbacks` cho API tự thử lại trên model khác khi bị từ chối, nhưng nó không áp dụng cho các lần gọi model mà tool tự thực hiện, như khi tool giao việc gọi subagent. Vì vậy, subagent bị từ chối có thể chỉ hiện ra ở agent chính thành câu "không tìm thấy thông tin". Muốn thấy refusal đó, bạn phải mở span của subagent.

## Lỗi truy xuất hay lỗi grounding

Khi câu trả lời dựa trên văn bản bị sai, lỗi có thể nằm ở khâu truy xuất (lấy sai đoạn văn bản), ở chính văn bản, hoặc ở grounding. Grounding là việc câu trả lời bám đúng vào đoạn văn bản được đưa cho Claude. Để tách lỗi truy xuất với lỗi grounding, bạn trả lời lần lượt ba câu hỏi. Ở siêu thị, trợ lý vẫn giới thiệu với khách một chương trình giảm 15%, trong khi chương trình đó đã kết thúc từ tuần trước.

**Sơ đồ: Ca giảm 15% dừng ở câu hỏi thứ hai, vì văn bản hết hạn vẫn nằm trong index**

Câu hỏi đầu tiên là đoạn đúng có được lấy về không. Nếu không, lý do hay gặp là đoạn đó bị cắt rời khỏi ngữ cảnh. Ví dụ, một đoạn chỉ ghi "áp dụng tới hết tháng" mà không nói là chương trình nào. Contextual retrieval xử lý chuyện này bằng cách gắn thêm một câu ngữ cảnh vào mỗi đoạn trước khi đổi đoạn thành vector (embed) và đưa vào index, tức nơi lưu các đoạn văn để hệ truy xuất tìm trong đó.

Câu hỏi thứ hai là văn bản được xếp trên có còn hiệu lực không. Ở ca giảm 15%, văn bản của chương trình mới cũng được lấy về, nhưng xếp dưới văn bản cũ. Văn bản hết hạn vẫn còn trong index, nên Claude chỉ trả lời đúng theo văn bản nó nhận được. Lỗi nằm ở dữ liệu chứ không ở model.

Câu hỏi thứ ba là đoạn được trích có thật sự làm căn cứ cho câu trả lời không. Tính năng citations của API giúp một phần. Nó bảo đảm mỗi trích dẫn trỏ đúng vào văn bản bạn đã đưa vào, và `cited_text` là nguyên văn một đoạn trong văn bản đó. Nhưng trích đúng chỗ chưa có nghĩa là đoạn đó đủ làm căn cứ. Chẳng hạn, câu "được trả góp" có thể trích đúng đoạn nói về trả góp nhưng bỏ mất dòng điều kiện ngay bên dưới. Vì vậy bạn nên thêm một bước đối chiếu từng khẳng định với đoạn được trích, và cho phép Claude trả lời là không đủ thông tin.

> **Ý chính**
>
> Muốn biết lỗi do model hay harness, hãy bật ghi đủ nội dung để có raw body, gửi lại request không qua harness, rồi bỏ từng phần cho tới khi hết lỗi. Với lỗi nhiều lượt, kiểm xem thông tin cần dùng còn trong request không. Với lỗi nhiều agent, lần theo các chỗ giao nhận và sửa bằng trường bắt buộc. Lỗi lúc có lúc không thì cần chạy nhiều lần và tìm điểm rẽ đầu tiên. Refusal có ba kiểu với ba gốc khác nhau. Khi câu trả lời dựa trên văn bản bị sai, hãy kiểm lần lượt khâu truy xuất, bản thân văn bản, rồi tới grounding.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Observability with OpenTelemetry (Agent SDK, Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/observability)
3. [Handling stop reasons (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
4. [Troubleshooting tool use (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/troubleshooting-tool-use)
5. [Refusals and fallback (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback)
6. [Citations (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/citations)
7. [Reduce hallucinations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
8. [How we built our multi-agent research system (Anthropic Engineering)](https://www.anthropic.com/research/multi-agent-research-system)
9. [An update on recent Claude Code quality reports (Anthropic Engineering)](https://www.anthropic.com/research/april-23-postmortem)
10. [A postmortem of three recent issues (Anthropic Engineering)](https://www.anthropic.com/research/a-postmortem-of-three-recent-issues)
11. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
12. [Introducing Contextual Retrieval (Anthropic Engineering)](https://www.anthropic.com/research/contextual-retrieval)
13. [Handle tool calls (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
