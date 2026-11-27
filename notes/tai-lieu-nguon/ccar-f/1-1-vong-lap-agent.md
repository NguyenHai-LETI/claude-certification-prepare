---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-1-vong-lap-agent
ngay_tai: 2026-11-27
tieu_de: Vòng lặp agent và stop_reason
---

Domain 1: Agentic Architecture & Orchestration · Task 1.1

# Vòng lặp agent và stop_reason

Bài giải thích khi nào vòng lặp agent gọi Claude tiếp, khi nào dừng, và cách gửi kết quả tool về để Claude dùng ở lần gọi sau.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Viết được vòng lặp agent chạy tiếp khi stop_reason là tool_use và dừng khi là end_turn
- Gửi kết quả tool về đúng chỗ, đúng thứ tự để Claude dùng được ở lần gọi sau
- Phân biệt để Claude tự chọn bước tiếp theo với thứ tự tool viết sẵn trong code
- Nhận ra ba cách dừng vòng lặp nghe hợp lý nhưng sai, và xử lý các giá trị stop_reason khác

Khi bạn cho Claude dùng một tool do code của bạn chạy (client tool), Claude không tự chạy tool đó. Nó chỉ trả lời rằng nó muốn gọi tool nào, với tham số gì. Code của bạn phải chạy tool, gửi kết quả về cho Claude, rồi gọi Claude thêm lần nữa để nó làm tiếp. Đoạn code lặp đi lặp lại như vậy là vòng lặp agent (**agentic loop**). Câu hỏi khó nhất khi viết vòng lặp này là lúc nào gọi tiếp và lúc nào dừng.

Câu trả lời nằm ở field `stop_reason` trong mỗi phản hồi của Claude. Nếu `stop_reason` là **`"tool_use"`**, Claude đang chờ kết quả tool và vòng lặp phải chạy tiếp. Nếu là **`"end_turn"`**, Claude đã trả lời xong và vòng lặp dừng. Phần code rẽ nhánh theo hai giá trị này là phần điều khiển luồng của vòng lặp (**agentic loop control flow**).

Bài này đi qua từng bước của vòng lặp (**agentic loop lifecycle**). Code gửi request, đọc `stop_reason`, chạy tool, rồi thêm kết quả tool vào lịch sử hội thoại (**conversation history**) để Claude dùng ở lần gọi sau. Sau đó bài so hai cách chọn bước tiếp theo. Một là để Claude tự quyết (**model-driven decision-making**), hai là viết sẵn thứ tự trong code (**pre-configured decision trees** hay **tool sequences**). Bài cũng nói về ba anti-pattern (**anti-patterns**), tức ba cách dừng vòng lặp nghe hợp lý nhưng sai.

**Sơ đồ: Code lặp bốn bước quanh Claude, và chỉ stop_reason quyết định lặp tiếp, dừng hay xử lý riêng**
_Vòng đời agentic loop: gửi request, đọc stop_reason, chạy tool, thêm kết quả vào messages, và các lối ra_

- **Claude**: tự chọn tool tiếp theo
- request
- phản hồi
- **CODE CỦA BẠN: AGENTIC LOOP**
- 1. **Gửi request**: tools + messages
- 2. **Đọc stop_reason**: của mỗi phản hồi
- tool_use
- 3. **Chạy tool**: mỗi khối tool_use
- 4. **Thêm vào messages**: phản hồi, tool_result
- lặp
- **end_turn**: dừng, trả lời khách
- **Giá trị khác**: max_tokens, refusal…
- xử lý riêng
- **Ba cách dừng sai: đoán thay vì đọc stop_reason**: có khối text
- đếm đủ số lần gọi
- dò cụm “đã đặt”
- Giới hạn số lần gọi chỉ là lưới an toàn phụ

## Ví dụ xuyên suốt: agent đặt lịch bảo dưỡng của một chuỗi tiệm sửa xe

Một chuỗi 6 tiệm sửa xe máy ở TP.HCM nhận khoảng 300 tin nhắn mỗi ngày qua fanpage, phần lớn là khách hỏi xe đã tới hạn thay nhớt chưa và xin đặt lịch. Chủ chuỗi giao cho đội IT hai người viết một agent bằng Python để trả lời các tin nhắn đó, trong khi fanpage vẫn hiện cho khách biết tin của họ đang được xử lý. Ở bản đầu, đội tự viết vòng lặp gọi Claude qua Messages API, tức API nhận một danh sách message và trả về một phản hồi của Claude. Agent có ba tool: `tra_xe(bien_so)` trả số km đã đi từ lần thay nhớt gần nhất, `xem_lich_trong(chi_nhanh, ngay)` trả các khung giờ còn trống, và `dat_lich(bien_so, chi_nhanh, gio)` ghi lịch hẹn. Vài tháng sau, đội chuyển agent sang Agent SDK, một bộ thư viện của Anthropic đã viết sẵn vòng lặp này, nên đội không phải tự viết nữa.

Trong bài, "tin nhắn" là tin khách gửi qua fanpage, còn "message" là một phần tử trong mảng `messages` gửi cho Claude.

## Một tin nhắn đặt lịch đi qua vòng lặp thế nào

Anh Tuấn nhắn: "Xe 59X3-123.45 tới hạn thay nhớt chưa? Nếu tới rồi thì đặt giúp mình sáng thứ Bảy ở chi nhánh Gò Vấp." Log của agent cho thấy để trả lời tin này, code gọi Claude 4 lần. Ba phản hồi đầu có `stop_reason` là `tool_use`, phản hồi cuối là `end_turn`.

Lần gọi nào cũng diễn ra như nhau. Code gửi cho Claude một request gồm danh sách tool và mảng `messages`, chứa mọi message từ đầu cuộc trò chuyện. Claude trả về một phản hồi. Field `content` của phản hồi là danh sách các khối nội dung, trong đó khối `text` chứa chữ Claude viết, còn khối `tool_use` là một yêu cầu gọi tool kèm tham số. Code đọc `stop_reason`. Nếu nó là `tool_use`, code chạy các tool Claude yêu cầu, thêm kết quả vào `messages` rồi gửi request tiếp theo. Nếu nó là `end_turn`, code lấy câu trả lời gửi cho khách và thoát vòng lặp.

Với tin của anh Tuấn, ở lần gọi thứ nhất Claude xin chạy `tra_xe`. Tool trả về xe đã đi 2.140 km từ lần thay nhớt gần nhất, mà tiệm khuyên thay sau mỗi 2.000 km. Ở lần gọi thứ hai, Claude đọc kết quả đó và xin chạy `xem_lich_trong` cho Gò Vấp sáng thứ Bảy. Tool báo khung 08:00 đã kín, khung 09:30 còn trống. Ở lần gọi thứ ba, Claude xin chạy `dat_lich` lúc 09:30. Ở lần gọi thứ tư, Claude viết câu trả lời cho anh Tuấn, và `stop_reason` là `end_turn`.

Mảng `messages` dài thêm sau mỗi lần gọi. Lần gọi đầu, `messages` chỉ có 1 message là tin của khách. Sau mỗi lần Claude xin gọi tool, code thêm hai message, một là phản hồi của Claude, hai là kết quả tool. Vì vậy lần gọi thứ hai gửi 3 message, lần thứ ba gửi 5, lần thứ tư gửi 7. Messages API không lưu gì giữa hai request, nên lần nào code cũng phải gửi lại cả lịch sử. Claude chỉ biết xe đã đi 2.140 km hay khung 09:30 còn trống khi các kết quả đó nằm trong `messages` của request đang gửi.

**Sơ đồ: Tin của anh Tuấn thành 4 request: tool_use ba lần rồi end_turn, messages thêm 2 sau mỗi lần**
Bên tham gia: Claude, Code (vòng lặp)

1. Request 1, messages dài 1: tin của anh Tuấn
2. tool_use: tra_xe 59X3-123.45
3. Request 2, messages dài 3: đã đi 2.140 km
4. tool_use: xem_lich_trong Gò Vấp, thứ Bảy
5. Request 3, messages dài 5: 09:30 còn trống
6. tool_use: dat_lich lúc 09:30
7. Request 4, messages dài 7: kết quả dat_lich
8. end_turn: câu trả lời cho anh Tuấn

Phần lõi của vòng lặp chỉ cần vài dòng:

```python
while True:
    response = client.messages.create(model=MODEL, max_tokens=1024, tools=TOOLS, messages=messages)
    messages.append({"role": "assistant", "content": response.content})
    if response.stop_reason == "tool_use":
        results = [run_tool(block) for block in response.content if block.type == "tool_use"]
        messages.append({"role": "user", "content": results})
        continue
    return response
```

Nếu không cần tự viết phần chạy tool, bạn có thể dùng tool runner trong SDK của Claude API, tức thư viện Anthropic phát hành để gọi API từ Python hay TypeScript. Tool runner tự chạy tool và gửi kết quả về cho Claude. Agent SDK thì làm hộ bạn cả vòng lặp.

> **Trong đề chọn gì**
>
> Gặp câu hỏi vòng lặp agent dựa vào đâu để chạy tiếp hay dừng, bạn chọn đáp án đọc `stop_reason` của mỗi phản hồi. Vòng lặp chạy tiếp khi giá trị là `"tool_use"` và thoát khi là `"end_turn"`. Điểm tự tin do Claude tự báo hay số token đã dùng không phải tín hiệu dừng.

## Ba cách dừng vòng lặp nghe hợp lý nhưng sai

Vòng lặp vừa xem là bản đội viết sau khi đã vấp. Trước đó, bản đầu của agent dừng vòng lặp theo ba cách khác, và cách nào cũng làm hỏng một số tin nhắn của khách.

Cách thứ nhất là dừng khi phản hồi có chữ. Đội nghĩ rằng hễ Claude viết chữ là đang trả lời khách, còn khi gọi tool thì Claude không viết gì. Thực tế, phản hồi đầu tiên cho tin của anh Tuấn có cả hai thứ: một khối `text` "Để mình tra xe của anh trước nhé" và một khối `tool_use` gọi `tra_xe`. Vòng lặp thấy có chữ nên dừng ngay sau lần gọi thứ nhất, và anh Tuấn chỉ nhận được đúng câu đó. Lấy việc phản hồi có chữ làm dấu hiệu xong việc (_checking for assistant text content as a completion indicator_) là một đáp án sai hay gặp.

Cách thứ hai là dừng ngay sau 3 lần gọi, vì đội nghĩ tin nào cũng chỉ cần ba bước tra xe, xem lịch, đặt lịch. Nhưng sau ba lần gọi có tool vẫn còn lần gọi thứ tư để Claude viết câu trả lời. Vòng lặp dừng trước lần đó, nên lịch đã được đặt mà khách không nhận được tin xác nhận nào. Tin hỏi cho hai xe thì cần nhiều lần gọi hơn nữa, nên bị cắt sớm hơn. Dùng một con số tự chọn làm cách dừng chính (_setting arbitrary iteration caps as the primary stopping mechanism_) sẽ luôn cắt ngang những tin cần nhiều bước hơn con số đó.

Cách thứ ba là dò cụm chữ "đã đặt" trong câu Claude viết, và cách này hỏng khi có khách xin đặt lịch cho hai xe. Sau khi đặt xong xe đầu, Claude viết "Đã đặt xong xe thứ nhất, giờ mình đặt tiếp xe thứ hai", kèm một khối `tool_use` gọi `dat_lich` cho xe thứ hai. Code thấy "đã đặt" nên dừng, và xe thứ hai không có lịch. Đoán ý từ câu chữ để quyết định dừng (_parsing natural language signals to determine loop termination_) hỏng ngay khi Claude viết những chữ đó lúc việc còn dở.

**Sơ đồ: Ba cách đoán đều dừng sớm, chỉ stop_reason dừng đúng ở lần gọi thứ tư**
_Chỗ dừng của từng cách trên bốn phản hồi cho tin nhắn của anh Tuấn, và cách dò cụm đã đặt trên tin nhắn hai xe_

- **PHẢN HỒI CHO TIN ANH TUẤN**
- **Có chữ là dừng**
- **Cắt sau 3 lần**
- **Đọc stop_reason**
- 1. **text + tool_use tra_xe**: stop_reason: tool_use
- 2. **tool_use xem_lich_trong**: stop_reason: tool_use
- 3. **tool_use dat_lich**: stop_reason: tool_use
- 4. **text: trả lời anh Tuấn**: stop_reason: end_turn
- khách chỉ nhận
- câu đầu tiên
- lịch đã đặt,
- không xác nhận
- khách nhận
- câu trả lời đủ
- **TIN NHẮN HAI XE**
- **“Đã đặt xong xe thứ nhất…”**: kèm tool_use dat_lich cho xe thứ hai
- **Dò “đã đặt”: dừng**: xe thứ hai không có lịch

Cả ba cách đều đoán xem Claude đã xong chưa, trong khi Claude nói thẳng điều đó trong `stop_reason`. Khi chuyển sang đọc `stop_reason`, đội đổi giới hạn thành 15 lần gọi cho mỗi tin nhắn, chỉ để chặn trường hợp bất thường như Claude gọi một tool mãi không thôi. Với tin bình thường, vòng lặp đã dừng nhờ `stop_reason` khi còn cách mức đó rất xa.

> **Bẫy đề**
>
> Khách xin đặt lịch cho hai xe, và agent phải gọi tool nhiều lần nối tiếp. Đề hỏi tín hiệu nào cho biết vòng lặp nên kết thúc. Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Có khối text là xong** (_the response contains a text content block_). Đáp án này dễ chọn vì câu trả lời cuối cho khách lúc nào cũng là chữ. Nhưng ngay phản hồi đầu tiên cũng có thể có chữ, như câu "Để mình tra xe của anh trước nhé" đi kèm yêu cầu gọi `tra_xe`. Dừng ở đó thì mọi bước sau đều bị bỏ dở.
> - **Đếm đủ số lần gọi tool thì thoát** (_exit when a preset maximum number of tool calls is reached_). Giới hạn này có chặn được vòng lặp chạy mãi. Có điều tin hai xe cần nhiều bước hơn tin một xe, nên một con số cố định hoặc sẽ cắt ngang việc đang làm, hoặc phải đặt lớn tới mức không bao giờ dùng để dừng được.
> - **Câu trả lời có cụm "task complete" hay "đã đặt"** (_the assistant text includes a completion phrase_). Một cụm chữ như vậy trông giống lời xác nhận rõ ràng nhất. Thế nhưng Claude viết "Đã đặt xong xe thứ nhất" khi việc còn dở, ngay trong phản hồi có yêu cầu gọi `dat_lich` cho xe thứ hai.
>
> **Chọn:** đọc `stop_reason`. Vòng lặp chạy tiếp khi giá trị là `"tool_use"` và dừng khi là `"end_turn"`, còn giới hạn số lần gọi chỉ là lưới an toàn phụ.

## Gửi kết quả tool về sao cho Claude dùng được

Phần gửi kết quả tool về cũng có luật riêng, và đội học được luật đầu tiên qua một lần làm tắt. Khi muốn báo cho khách biết agent đang tra cứu, một lập trình viên chèn vào `messages` một message role `user` có chữ "(khách đang chờ)", ngay sau phản hồi có `tool_use` và trước message chứa kết quả. Từ hôm đó, lần gọi thứ hai của mọi tin nhắn đều bị API từ chối với lỗi "tool_use ids were found without tool_result blocks immediately after".

Lỗi này đến từ một luật về thứ tự. Kết quả tool phải nằm ngay sau phản hồi có yêu cầu gọi tool, không được có message nào chen giữa. Mỗi khi `stop_reason` là `tool_use`, code phải làm đúng mấy việc sau:

1. Thêm nguyên phản hồi của Claude vào `messages` với role `assistant`, không bỏ khối nào, kể cả khối `tool_use`.
2. Thêm một message role `user`, trong đó mỗi khối `tool_use` của Claude có đúng một khối `tool_result` trả lời. Nếu tool chạy lỗi, bạn vẫn gửi `tool_result`, đặt `is_error` là `true` và ghi rõ lỗi gì để Claude biết đường xử lý. Nội dung của `tool_result` có thể là một chuỗi chữ thường hoặc một danh sách khối nội dung.
3. Ghi vào field `tool_use_id` của mỗi `tool_result` đúng `id` của khối `tool_use` mà nó trả lời. Mỗi yêu cầu gọi tool có một `id` riêng, và nhờ `id` này Claude biết kết quả nào thuộc yêu cầu nào.
4. Trong message đó, các khối `tool_result` phải đứng đầu tiên. Nếu muốn thêm chữ, bạn đặt khối `text` sau tất cả kết quả.
5. Gửi request tiếp theo với cùng danh sách tool như request đầu.

```json
{"role": "user", "content": [
  {"type": "tool_result", "tool_use_id": "toolu_01Xa...", "content": "Đã đi 2.140 km từ lần thay nhớt gần nhất"}
]}
```

Đội sửa bằng cách bỏ message chen giữa. Câu báo agent đang tra cứu thì fanpage gửi thẳng cho khách, không đưa vào hội thoại với Claude. Kể cả khi đặt đúng chỗ, sau các khối `tool_result`, chữ thêm vào vẫn có thể gây hại theo cách khác. Nếu trong lịch sử, sau kết quả tool nào cũng có chữ của phía `user`, Claude có thể bắt chước khuôn đó. Hậu quả là Claude trả về một phản hồi rỗng, mà `stop_reason` vẫn là `end_turn`.

Còn một luật nữa, chỉ lộ ra khi Claude gọi nhiều tool cùng lúc. Một khách hỏi cho hai xe, và Claude trả về một phản hồi có hai khối `tool_use` gọi `tra_xe`, mỗi khối cho một biển số. Lúc đó một lập trình viên vừa sửa phần chạy tool để tool nào chạy xong là gửi kết quả ngay, mỗi kết quả trong một message role `user` riêng. Lịch sử hội thoại như vậy làm Claude ít gọi song song hơn ở các lần sau. Vì vậy hai kết quả nên đi chung trong một message role `user`, mỗi kết quả nằm trong một khối `tool_result` riêng, như vòng lặp gốc đã làm.

> **Bẫy đề**
>
> Phản hồi đầu tiên có `stop_reason` là `"tool_use"` và một khối `tool_use` gọi `tra_xe`. Code đã chạy tool xong. Đề hỏi phải gửi kết quả về thế nào. Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gửi kết quả trong message role `assistant`** (_return the result in an assistant message_). Nhiều người chọn vì tool là thứ phía agent chạy. Nhưng role `assistant` chỉ dành cho chính phản hồi của Claude, còn kết quả tool luôn đi trong message role `user`.
> - **Ghi kết quả vào một khối text thường, kèm `tool_use_id` trong chữ** (_a plain text block that mentions the id_). Claude vẫn đọc được chữ đó. Có điều kết quả được ghép với yêu cầu qua field `tool_use_id` của khối `tool_result`, nên một khối text không trả lời được yêu cầu nào.
> - **Chỉ gửi kết quả, bỏ message có `tool_use` khỏi lịch sử** (_resend the history without the tool_use turn_). Cách này giữ lịch sử ngắn gọn, nhưng Messages API không lưu gì giữa hai request. Không có message chứa `tool_use` thì kết quả không có gì để ghép vào.
>
> **Chọn:** thêm nguyên phản hồi có `tool_use` vào lịch sử, rồi thêm một message role `user` có khối `tool_result` mang `tool_use_id` khớp với `id` của yêu cầu. Đáp án nói kết quả bắt buộc phải là JSON, chuỗi thường sẽ làm vòng lặp kết thúc, cũng sai, vì `tool_result` nhận được chuỗi thường.

## Để Claude chọn bước tiếp theo, hay viết sẵn thứ tự trong code

Khi agent chạy ổn, chủ chuỗi đề nghị một cách mà họ cho là chắc ăn hơn. Code sẽ đi cố định theo thứ tự tra xe, xem lịch, đặt lịch, còn Claude chỉ viết câu trả lời cuối. Đội thử bản này. Ngay ngày đầu, trong khoảng 300 tin nhắn, có 23 tin rơi vào những trường hợp mà thứ tự cố định không tính tới, như xe chưa tới hạn, khung giờ khách muốn đã kín, hay khách hỏi cho hai xe. Chị Hoa nhắn hỏi về xe 51G1-678.90, mới đi 1.200 km từ lần thay nhớt, vậy mà bản viết sẵn vẫn đặt lịch thay nhớt cho chị.

Có hai cách để hệ thống biết bước tiếp theo làm gì. Cách thứ nhất là để Claude tự quyết (**model-driven decision-making**) dựa trên context, tức mọi thứ nằm trong request, gồm tin nhắn của khách, mô tả tool và kết quả các tool vừa chạy. Cách thứ hai là code đi theo một cây quyết định hay một chuỗi tool đã định sẵn (**pre-configured decision trees** hay **tool sequences**), ví dụ "luôn gọi `tra_xe`, rồi `xem_lich_trong`, rồi `dat_lich`". Vòng lặp agent đi theo cách thứ nhất.

Quay lại xe của chị Hoa. Ở bản để Claude tự chọn, code thêm kết quả `tra_xe` báo 1.200 km vào `messages`, tức đưa thông tin mới vào context của lần gọi sau (**conversation context**). Ở lần gọi kế tiếp, Claude đọc con số đó và tự suy ra xe chưa cần thay nhớt, nên nó không gọi `xem_lich_trong` mà hỏi chị có muốn kiểm tra hạng mục khác không. Không ai phải viết trước nhánh "xe chưa tới hạn". Khi khung giờ khách muốn đã kín thì cũng thế, Claude đọc danh sách khung còn trống và đề nghị giờ khác thay vì đặt bừa.

**Sơ đồ: Xe chị Hoa mới đi 1.200 km: thứ tự viết sẵn vẫn đặt thay nhớt, Claude đọc kết quả rồi hỏi lại**

✗ _Thứ tự viết sẵn trong code_
1. tra_xe 51G1-678.90: **1.200 km**
   ↓ _code không xem kết quả, cứ gọi bước kế_
2. xem_lich_trong
3. dat_lich: đặt thay nhớt cho xe chưa tới hạn
4. **23 tin** trong khoảng 300 tin ngày đầu mà thứ tự cố định không tính tới

✓ _Claude chọn bước tiếp theo_
1. tra_xe 51G1-678.90: **1.200 km**
   ↓ _kết quả được thêm vào cuộc hội thoại_
2. Claude đọc **1.200 km**: xe chưa cần thay nhớt, không gọi xem_lich_trong
3. Hỏi chị Hoa có muốn kiểm tra hạng mục khác không

Thứ tự viết sẵn vẫn có chỗ dùng. Nếu một bước bắt buộc phải xảy ra trước bước khác thì code nên ép thứ tự đó, thay vì trông vào Claude tự nhớ. Chẳng hạn nếu sau này agent được thêm tool huỷ lịch, bước xác minh chủ xe phải chạy trước bước huỷ. Phần còn lại, nơi bước sau tuỳ vào kết quả bước trước, nên để Claude quyết.

> **Trong đề chọn gì**
>
> Khi được hỏi vòng lặp agent chọn tool tiếp theo bằng cách nào, bạn chọn đáp án nói rằng kết quả tool được thêm vào hội thoại và Claude tự suy ra bước tiếp. Các đáp án sau đều không phải vòng lặp agent: cây quyết định dựng sẵn, chuỗi tool lên kế hoạch từ đầu, code bên ngoài tự đổi tool theo một field trạng thái, một chuỗi hook chặn trước mỗi lần gọi tool, hay bắt người duyệt ở mỗi bước.

## Các giá trị khác của stop_reason

Một khách nhờ agent liệt kê toàn bộ lịch sử bảo dưỡng ba năm của xe và giải thích từng hạng mục. Đội đặt `max_tokens` là 1024, tức mỗi phản hồi dài tối đa 1024 token, mà token là đơn vị Claude dùng để đo độ dài chữ. Câu trả lời này dài hơn mức đó, nên Claude dừng giữa câu và `stop_reason` là `max_tokens`. Vòng lặp của đội chỉ tách riêng nhánh `tool_use`, còn mọi giá trị khác đi vào dòng `return response` như thể đó là `end_turn`. Vì vậy khách nhận một câu trả lời đứt giữa chừng như thể đã hoàn chỉnh, và không có lỗi nào được ghi lại.

`stop_reason` có nhiều giá trị hơn hai giá trị quen thuộc, và mỗi giá trị cần một cách xử lý riêng:

| `stop_reason` | Khi nào xảy ra | Code nên làm gì |
| --- | --- | --- |
| `end_turn` | Claude tự kết thúc câu trả lời | Dùng câu trả lời |
| `tool_use` | Claude muốn gọi tool và chờ kết quả | Chạy tool, gửi kết quả về, gọi tiếp |
| `max_tokens` | Phản hồi chạm giới hạn `max_tokens` của request | Tăng `max_tokens`, hoặc gọi tiếp để Claude viết nốt |
| `stop_sequence` | Claude viết ra một chuỗi dừng bạn đã đặt trong `stop_sequences` | Đọc field `stop_sequence` để biết chuỗi nào |
| `pause_turn` | Vòng lặp của server tool (tool do Anthropic chạy, như web search) chạm giới hạn số vòng | Gửi lại nguyên phản hồi để Claude làm tiếp |
| `refusal` | Claude từ chối trả lời | Đọc `stop_details`, có thể thử lại với một model Claude khác |
| `model_context_window_exceeded` | Phản hồi lấp đầy context window, tức lượng token tối đa Claude đọc và viết được trong một request | Coi như câu trả lời bị cắt |

Cả bảy giá trị đều nằm trong một phản hồi thành công. Lỗi thật thì đi đường khác, API trả về mã HTTP 4xx hay 5xx chứ không trả phản hồi kèm `stop_reason`. Vì vậy vòng lặp phải xử lý từng giá trị `stop_reason`, chứ không thể chờ có lỗi mới biết phản hồi có vấn đề. Đội sửa vòng lặp, thêm nhánh riêng cho `max_tokens` để gọi tiếp cho Claude viết nốt, và ghi log mọi giá trị lạ.

Chuyện tương tự xảy ra sau khi đội chuyển sang Agent SDK. Agent SDK tự chạy vòng lặp và cho đặt giới hạn bằng `max_turns` (số lượt tối đa) hay `max_budget_usd` (mức chi tối đa tính bằng USD). Một lượt (turn) ở đây giống một lần gọi trong vòng lặp tự viết, gồm một lần Claude trả lời và việc chạy các tool nó gọi trong lần đó. Đội đặt `max_turns` là 8. Một khách có ba xe hỏi lịch thay nhớt cho cả ba ở hai chi nhánh, và agent dùng hết 8 lượt trong khi còn đang tra lịch. Khi chạm giới hạn, SDK trả về `ResultMessage`, tức message cuối cùng báo kết quả cả vòng lặp, với `subtype` là `error_max_turns` và không có câu trả lời cuối. Khách không nhận được gì.

Khi đặt `max_turns`, nhớ đếm mỗi lượt có gọi tool, cộng thêm một lượt cho câu trả lời cuối chỉ có chữ. Nếu bạn quên cộng lượt đó, SDK vẫn trả `error_max_turns` dù các tool đã chạy xong. Nhưng nâng giới hạn không giải quyết hết, vì sẽ luôn có tin nhắn cần nhiều lượt hơn. Vì vậy đội sửa ở tầng điều phối (**orchestration layer**), tức phần code gọi agent và nhận kết quả khi agent dừng. Mỗi khi vòng lặp dừng, code đọc `subtype`. Nếu nó không phải `success`, code tự chuyển tin nhắn cho nhân viên tiệm (**escalation**), kèm lịch sử hội thoại và các kết quả tool đã có. Như vậy, dù vòng lặp dừng vì lý do gì, khách hoặc được trả lời xong, hoặc được chuyển cho nhân viên tiệm.

> **Trong đề chọn gì**
>
> Nếu đề tả vòng lặp chỉ rẽ nhánh theo `tool_use` và `end_turn` rồi trả về một câu trả lời bị cắt, chỗ cần sửa là thêm nhánh xử lý `max_tokens` trong vòng lặp. Nếu đề đòi mọi cuộc trò chuyện với khách phải kết thúc bằng việc giải quyết xong hoặc chuyển cho người, dù vòng lặp dừng vì lý do gì, bạn chọn code ở tầng điều phối kiểm tra kết quả sau khi vòng lặp dừng. Đừng chọn thêm chỉ dẫn vào system prompt, thêm một hook đếm số lần gọi tool, hay tách việc thành hai agent nối tiếp.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Handling stop reasons (Claude API)](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
3. [Handle tool calls (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
4. [Parallel tool use (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use)
5. [Using the Messages API (Claude API)](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
6. [How the agent loop works (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/agent-loop)
