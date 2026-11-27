---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/6-2-toi-uu-do-tre
ngay_tai: 2026-11-27
tieu_de: Tối ưu độ trễ - TTFT và độ trễ tổng, streaming, gọi tool song song, cache, effort
---

Domain 6: Cost and Latency Optimization at Scale · Task 6.2

# Tối ưu độ trễ - TTFT và độ trễ tổng, streaming, gọi tool song song, cache, effort

Đọc hồ sơ độ trễ của ứng dụng Claude so với mục tiêu, tách TTFT khỏi độ trễ tổng, rồi dùng streaming, tool song song, điểm cache và effort cho đúng chỗ chậm.

- 19 phút đọc
- Đối chiếu docs 24/11/2026
- 15 nguồn

## Đọc xong bạn nắm được

- Tách một câu trả lời thành các đoạn thời gian từ trace và so từng đoạn với mục tiêu độ trễ
- Phân biệt thời gian tới chữ đầu tiên với độ trễ tổng, và biết cách nào chỉ làm người dùng thấy nhanh hơn mà không rút ngắn tổng thời gian
- Gửi kết quả tool đúng định dạng để Claude gọi nhiều tool trong một lượt, rồi chạy các tool đó cùng lúc
- Đặt điểm cache và làm ấm cache để prompt dài có chữ đầu tiên sớm hơn
- Chỉnh effort cho vừa mục tiêu độ trễ mà vẫn giữ chất lượng đo được và không làm mất cache

Khi người dùng kêu trợ lý chậm, chậm ở đâu? Có thể ở lúc chờ chữ đầu tiên, lúc chờ tool chạy, hoặc lúc chờ câu trả lời viết xong. Mỗi chỗ chậm cần một cách sửa riêng, và bài này giúp bạn tìm đúng chỗ trước khi sửa.

Tên task trong đề là **Latency Engineering**. Nó gồm việc chia thời gian của một câu trả lời thành từng đoạn để thấy chậm ở đâu, gọi là hồ sơ độ trễ (**latency profile**), rồi so với mục tiêu độ trễ (**latency target**). Bạn sẽ tách thời gian tới chữ đầu tiên (**time-to-first-token**, TTFT) khỏi độ trễ tổng (**total latency**). Sau đó bài đi qua bốn cách sửa là **streaming**, chạy tool song song (**parallel tool execution**), đặt điểm cache (**cache checkpointing**) và chỉnh effort (**effort-level tuning**). Effort là mức độ Claude nghĩ và làm kỹ trước khi trả lời.

Cách đo thời gian từng bước và các chỉ số để dựng hồ sơ độ trễ nằm ở bài 3.1, còn chi phí của các cách tối ưu trong bài này nằm ở bài 6.1.

**Sơ đồ: Streaming chỉ làm chữ hiện sớm, còn tool song song, cache và effort cắt bớt từng đoạn thời gian**
_Bản đồ bài. Một câu trả lời của agent gồm các vòng gọi tool có thể lặp nhiều lần và một vòng cuối viết câu trả lời. Mỗi vòng gọi model có prefill, thinking rồi sinh đầu ra, trong đó prefill và thinking hợp thành TTFT. Total latency bằng tổng TTFT và thời gian sinh của mỗi vòng cộng tổng thời gian tool. Streaming và hiện tên tool chỉ đổi cảm nhận, tổng thời gian không đổi. Parallel tool execution bớt vòng gọi model và cho tool chạy cùng lúc, cache checkpointing cho prefill đọc phần đầu prompt từ cache, effort-level tuning làm Claude nghĩ ít hơn và gọi tool ít lần hơn._

- **LATENCY PROFILE CỦA MỘT CÂU TRẢ LỜI**: vòng gọi tool, có thể lặp nhiều lần
- vòng cuối viết câu trả lời
- **Prefill**: cache
- **Thinking**: effort
- tool_use
- hiện tên
- **Tool**: song song
- **Prefill**: cache
- **Thinking**: effort
- **Sinh đầu ra**: streaming
- **TTFT**
- **TTFT**
- **Total latency**: = Σ (TTFT + thời gian sinh) của mỗi vòng + Σ thời gian tool
- **CHỈ ĐỔI CẢM NHẬN**
- **Streaming**: chữ hiện dần từ token đầu
- **Hiện tên tool**: ngay ở content_block_start
- tổng thời gian không đổi
- **RÚT NGẮN TỔNG THỜI GIAN**
- **Parallel tool execution**: bớt vòng gọi model, tool chạy cùng lúc
- **Cache checkpointing**: prefill đọc phần đầu prompt từ cache
- **Effort-level tuning**: Claude nghĩ ít hơn, gọi tool ít lần hơn

## Ví dụ xuyên suốt: trợ lý báo giá của nhà phân phối vật liệu xây dựng

Một nhà phân phối vật liệu xây dựng có 60 cửa hàng. Khi khách đang đứng chờ ở quầy, nhân viên bán hàng dùng tablet hỏi trợ lý xem ba kho hàng còn bao nhiêu thép và xi măng, giá theo hạng khách là bao nhiêu, ngày giao sớm nhất là ngày nào, rồi nhờ trợ lý soạn báo giá.

Trợ lý chạy Sonnet 5.5 trên Claude API, có năm tool chỉ đọc dữ liệu mà không sửa gì. Đó là ba tool tra tồn kho (mỗi kho một tool), một tool tra giá và một tool tra lịch giao. Tool lịch giao chỉ cần mã khu vực và tên sản phẩm, không cần kết quả tồn kho, nên năm tool không phụ thuộc nhau. System prompt và catalog sản phẩm dài 18.000 token.

Đội đặt ba mục tiêu, tính ở phân vị 95 (p95), nghĩa là 95% số câu trả lời phải nhanh hơn mức này.

- Trong 2 giây, màn hình phải cho thấy trợ lý đang làm gì.
- Trong 4 giây phải có chữ đầu tiên của câu trả lời.
- Trong 10 giây phải có báo giá hoàn chỉnh.

## Hồ sơ độ trễ: chậm ở đoạn nào

Có hai cách đo độ trễ, ứng với hai câu hỏi khác nhau. Người dùng chờ bao lâu mới thấy chữ, và chờ bao lâu mới có câu trả lời hoàn chỉnh.

TTFT là thời gian từ lúc gửi request tới khi nhận token đầu tiên của response, tức chữ đầu tiên người dùng thấy. Khoảng này gồm hai phần. Phần đầu là prefill, lúc model đọc hết đầu vào, nên prompt càng dài thì càng lâu. Phần sau là thinking, lúc Claude nghĩ trước khi viết, và phần này vẫn tốn thời gian kể cả khi chữ thinking bị ẩn.

Độ trễ tổng là thời gian từ lúc gửi request tới token cuối cùng. Nó bằng TTFT cộng thời gian sinh toàn bộ đầu ra, mà thời gian sinh thì bằng số token đầu ra chia cho tốc độ sinh.

Với agent, một câu trả lời người dùng thấy gồm nhiều vòng gọi model nối nhau. Mỗi lần ứng dụng gửi request cho model và nhận response về là một vòng. Xen giữa các vòng là thời gian chạy tool.

```
độ trễ một câu trả lời = Σ (TTFT + thời gian sinh) của mỗi vòng gọi model
                       + Σ thời gian chạy tool giữa các vòng
```

Hồ sơ độ trễ là bảng chia một câu trả lời thành các đoạn thời gian đó. Số liệu lấy từ trace, tức bản ghi từng bước của một câu trả lời, trong đó mỗi lần gọi model hay gọi tool là một span. Bạn đo ở p95 chứ không lấy trung bình, rồi đặt từng đoạn cạnh mục tiêu. Hiện báo giá mất 21 giây ở p95. Đây là trace của một lần báo giá chậm.

**Sơ đồ: Năm vòng gọi tool nối nhau trước khi viết, nên nhân viên nhìn màn hình trống 21 giây**
_Trace của một lần báo giá chậm, vẽ theo tỉ lệ từ 0 tới 21 giây. Vạch đứt là mục tiêu p95 ở 2 giây, 4 giây và 10 giây. Màn hình nhân viên trống suốt 21 giây. Vòng đầu gửi 18.000 token chưa có cache và mất 2,9 giây rồi gọi tool tồn kho Bình Dương, tool chạy 1 giây tới giây 3,9. Thêm 4 vòng nữa, mỗi vòng model 1,5 giây rồi tool 1 giây, tới giây 13,9. Vòng thứ sáu nghĩ khoảng 2 giây rồi viết báo giá 700 token từ giây 15,9, không stream. Tới giây 21 màn hình mới hiện chữ đầu tiên, cũng là lúc báo giá xong._

- Vạch đứt là mục tiêu p95, 2 s có trạng thái, 4 s có chữ đầu, 10 s xong báo giá
- **2 s**
- **4 s**
- **10 s**
- **Màn hình**
- **trống suốt 21 giây**: vòng đầu gửi 18.000 token, chưa có cache
- **Model**
- **Tool**: 2,9 s
- nghĩ
- 700 token
- vòng 6, nghĩ rồi viết
- báo giá, không stream
- tồn kho Bình Dương
- thêm 4 vòng, mỗi vòng model 1,5 giây rồi tool 1 giây
- 0 s
- 2,9 s
- 13,9 s
- 15,9 s
- 21 s
- **giây 21 mới có chữ đầu, cũng là lúc báo giá xong**

Vòng đầu gửi 18.000 token chưa có cache, nên model mất 2,9 giây mới gọi tool tra tồn kho Bình Dương. Tool chạy 1 giây, xong ở giây 3,9. Sau đó còn 4 vòng nữa, mỗi vòng model mất 1,5 giây rồi tool chạy 1 giây, nên tới giây 13,9 tool cuối mới xong. Ở vòng thứ sáu, Claude nghĩ khoảng 2 giây, tới giây 15,9 mới bắt đầu viết báo giá 700 token, và viết xong ở giây 21.

Đặt cạnh mục tiêu thì cả ba mốc đều trễ. Nếu có stream thì sớm nhất tới giây 2,9 mới có tên tool đầu tiên để hiện lên, trong khi mục tiêu là 2 giây. Còn hiện tại màn hình trống tới tận giây 21. Chữ đầu tiên và báo giá hoàn chỉnh cùng tới ở giây 21, trong khi mục tiêu là 4 giây và 10 giây.

Hồ sơ cho thấy bốn chỗ chậm, mỗi chỗ có một cách sửa riêng.

- Suốt 21 giây màn hình không hiện gì. Chỗ này sửa bằng streaming.
- Năm tool không phụ thuộc nhau nhưng bị gọi nối nhau qua năm vòng. Chỗ này sửa bằng gọi tool song song.
- Vòng nào model cũng đọc lại 18.000 token. Chỗ này sửa bằng cache.
- Thời gian Claude nghĩ và số lần nó gọi tool được chỉnh bằng effort.

Đổi model chưa phải việc nên làm đầu tiên. Haiku 5.5 là model nhanh nhất, nhưng chuyển sang Haiku thì trợ lý vẫn gọi tool qua năm vòng và vẫn không stream.

Trước khi rút ngắn độ trễ, bạn cần để trợ lý trả lời đúng đã. Có mức chất lượng tốt nhất làm mốc thì mới biết mỗi lần tăng tốc làm mất bao nhiêu chất lượng. Đội có bộ eval, tức bộ bài kiểm tra tự động, gồm 200 báo giá mẫu, và chạy lại bộ này sau mỗi thay đổi.

## Streaming cho người dùng thấy chữ sớm hơn

Streaming gửi response về dần qua server-sent events. Đầu tiên là `message_start`, rồi tới từng `content_block_start`, `content_block_delta`, `content_block_stop`, rồi `message_delta`, cuối cùng là `message_stop`. Mỗi response gồm nhiều khối (content block), ví dụ một khối text hay một khối `tool_use`. Nhờ streaming, người dùng thấy chữ ngay từ token đầu tiên thay vì chờ tới token cuối.

Nhưng chữ đầu chỉ tới sớm khi Claude bắt đầu viết câu trả lời sớm. Ở trợ lý này, tới giây 15,9 Claude mới bắt đầu viết báo giá, nên chỉ bật streaming thì chữ đầu vẫn hiện ra trễ. Muốn đạt mục tiêu 4 giây, phải bớt số vòng gọi tool. Streaming cũng không làm model sinh chữ nhanh hơn, nên không giúp báo giá xong trong 10 giây.

Với agent, khoảng màn hình trống thường rơi vào các vòng gọi tool chứ không phải lúc viết câu trả lời cuối. Bạn có thể lấp khoảng đó. Khi Claude gọi tool, response mở khối `tool_use` bằng sự kiện `content_block_start`, và sự kiện này đã có sẵn tên tool, còn tham số tới sau qua các `input_json_delta`. Vì vậy ngay khi khối mở, ứng dụng có thể hiện dòng "Đang tra tồn kho ba kho hàng…". Kết hợp với cache để vòng đầu prefill nhanh hơn (mục cache bên dưới), trợ lý đạt mục tiêu 2 giây.

Có thêm hai cách giúp chữ tới sớm hơn khi stream.

- **Fine-grained tool streaming** là cách stream tham số tool ngay trong lúc Claude đang viết. Mặc định, API chờ có đủ từng giá trị tham số và kiểm JSON xong rồi mới gửi về. Giả sử đội thêm tool `tao_bao_gia` nhận cả bản báo giá làm tham số. Trợ lý hiện không có tool này, đây chỉ là tình huống giả định. Đặt `eager_input_streaming: true` trên tool này thì từng mảnh báo giá về ngay khi Claude viết, nên màn hình hiện được báo giá sớm hơn. Đổi lại, JSON ghép từ các mảnh có thể hỏng, hoặc bị cắt giữa chừng nếu response chạm `max_tokens`. Vì vậy code nên parse JSON trong `try`, và nếu parse lỗi thì gửi về một `tool_result` báo lỗi cho Claude, ví dụ bọc chuỗi hỏng trong `{"INVALID_JSON": ...}` và kèm `is_error: true`.
- **Nếu không cần cho người dùng xem phần thinking, hãy để `display: "omitted"`**. Trên các model Claude 5, đây đã là giá trị mặc định. Khi đó server không stream chữ thinking về, nên chữ của câu trả lời tới sớm hơn. Claude vẫn nghĩ đầy đủ và bạn vẫn trả tiền cho phần thinking, nên cách này chỉ giảm độ trễ chứ không giảm chi phí.

> **Trong đề chọn gì**
>
> Nếu đề hỏi cách để người dùng thấy phản hồi sớm, hãy chọn streaming và hiện tên tool ngay khi Claude bắt đầu gọi tool. Nếu đề hỏi cách để xong cả việc nhanh hơn thì streaming không đủ. Khi đó phải bớt số vòng gọi model, và bớt số token model phải đọc và phải sinh.

## Gọi nhiều tool trong một vòng

Trong một vòng, Claude có thể gọi nhiều tool cùng lúc bằng cách trả về nhiều khối `tool_use`. Khả năng này được bật sẵn.

Code của bạn mới là bên chạy tool, và API không bắt chạy theo thứ tự nào. Tool chỉ đọc và không phụ thuộc nhau thì nên chạy cùng lúc, ví dụ bằng `asyncio.gather` hay `Promise.all`. Tool làm thay đổi dữ liệu, hoặc cần chạy theo thứ tự, thì chạy lần lượt.

Dù chạy kiểu nào, bạn cũng gửi tất cả `tool_result` về **trong cùng một user message**. Mỗi kết quả mang đúng `tool_use_id` của lần gọi tương ứng, và các kết quả phải đứng trước mọi đoạn text trong message đó. Tool nào bạn quyết định không chạy thì vẫn phải gửi một `tool_result` có `is_error: true`.

**Sơ đồ: Gửi mỗi kết quả trong một user message riêng thì Claude gọi từng tool, năm tool thành năm vòng**

✗ _Harness gửi mỗi kết quả một user message_
1. Claude gọi một tool, tồn kho Bình Dương
   ↓ _harness chạy tool rồi gửi kết quả về_
2. User message chỉ mang **một tool_result**
   ↓ _Claude đọc kết quả rồi gọi tool kế tiếp_
3. **5 vòng gọi tool** tool cuối xong ở giây 13,9

✓ _Harness gửi mọi kết quả trong một user message_
1. Claude trả về **năm khối tool_use** trong cùng một vòng
   ↓ _harness chạy năm tool cùng lúc_
2. User message mang đủ **năm tool_result**, mỗi cái đúng tool_use_id
3. **1 vòng gọi tool** Claude viết báo giá ngay ở vòng sau

Trợ lý báo giá đang gọi từng tool một, vì harness, tức code chạy vòng lặp agent, gửi mỗi kết quả thành một user message riêng. Lịch sử hội thoại như vậy dạy Claude rằng ở đây tool được gọi lần lượt. Đây là nguyên nhân hay gặp nhất khi Claude không gọi tool song song. Code dưới đây chạy năm tool cùng lúc rồi gửi mọi kết quả trong một user message.

```python
results = await asyncio.gather(*[run_tool(b) for b in tool_uses])
messages.append({"role": "user", "content": [
    {"type": "tool_result", "tool_use_id": b.id, "content": r}
    for b, r in zip(tool_uses, results)
]})  # một user message cho mọi kết quả
```

> **Bẫy đề**
>
> Báo giá mất 21 giây vì năm tool không phụ thuộc nhau lại bị gọi trong năm vòng, và kết quả của mỗi tool được gửi về trong một user message riêng. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Đổi sang Haiku 5.5**. Model nhanh nhất có vẻ giải quyết được ngay. Nhưng trợ lý vẫn gọi model năm vòng, vòng nào cũng đọc lại 18.000 token, và đội phải đo lại chất lượng báo giá từ đầu.
> - **Tắt hẳn tool song song cho chắc**, bằng cách đặt `disable_parallel_tool_use: true` trong `tool_choice` để mỗi vòng Claude gọi tối đa một tool. Cách này có vẻ an toàn vì tránh được lỗi thứ tự. Nhưng năm tool này chỉ đọc và không phụ thuộc nhau, nên tắt đi là khoá luôn năm vòng.
> - **Thêm dòng "hãy trả lời thật nhanh" vào system prompt**. Thêm một dòng thì gần như không tốn gì. Nhưng câu dặn chung không đổi cách harness gửi kết quả, nên năm vòng gọi vẫn còn nguyên.
>
> **Chọn:** gửi mọi `tool_result` trong một user message, chạy năm tool cùng lúc, rồi đo lại số vòng trên trace.

Nếu đã gửi kết quả đúng cách mà Claude vẫn ít gọi nhiều tool một lúc, hãy thêm vào system prompt một câu dặn Claude gom các lệnh gọi không phụ thuộc nhau vào cùng một vòng. Việc này hay cần với Fable 5.1, model có thể gọi song song ít hơn trong vòng lặp agent dài.

Còn một trường hợp khác. Các lệnh gọi nối nhau thành vòng lặp nhưng Claude không cần nghĩ gì giữa các bước. Khi đó có thể dùng **programmatic tool calling**. Claude viết một đoạn code gọi cả loạt tool và chạy nó trong container, là môi trường chạy code do API cấp, nhờ vậy N vòng gọi model chỉ còn một. Cách này không giúp được khi bước sau phụ thuộc vào việc Claude đọc kết quả bước trước. Với năm tool không phụ thuộc nhau của trợ lý báo giá thì gọi song song là đủ.

## Dùng cache để prompt dài có chữ đầu tiên sớm hơn

Prompt caching lưu kết quả prefill của phần đầu prompt. Request sau có cùng phần đầu thì đọc lại thay vì tính lại, nên với prompt dài TTFT giảm rõ, ngoài chuyện rẻ hơn. Ở trợ lý báo giá, vòng nào model cũng đọc lại 18.000 token system prompt và catalog. Muốn cache phần này, bạn đặt điểm cache, trong API gọi là cache breakpoint và đặt bằng `cache_control`. Điểm cache đánh dấu chỗ kết thúc phần prompt sẽ được lưu vào cache.

Điểm cache nên đặt ở khối cuối cùng còn giống nhau giữa các request. Prompt gồm các khối nối nhau là system, từng tool, rồi từng message. Trợ lý báo giá đặt một điểm sau catalog và một điểm ở message mới nhất của hội thoại. Những thông tin đổi theo từng request, như giờ hay mã quầy, được đặt trong message user mới chứ không nằm trong system prompt hay catalog. Nếu để chúng ở phần đầu prompt, chỉ cần một chữ thay đổi là phần cache phía sau không dùng được nữa.

Mỗi request có tối đa 4 điểm cache. Khi tìm phần đã cache, API chỉ dò ngược lại tối đa 20 khối tính từ mỗi điểm cache. Nếu mỗi vòng hội thoại thêm từ 20 khối trở lên, bạn cần đặt thêm một điểm cache ở giữa, nếu không API sẽ không tìm thấy phần đã lưu.

Bạn cũng có thể làm ấm cache (**cache pre-warming**) trước khi người dùng hỏi. Khi nhân viên mở màn hình khách, ứng dụng gửi trước một request có `max_tokens: 0`. Request này có cùng phần đầu prompt (prefix), cùng cấu hình thinking và cùng effort với request thật sẽ gửi sau đó. API ghi cache rồi trả về ngay mà không sinh chữ nào. Bạn vẫn trả tiền cho lần ghi này như mọi lần ghi cache khác. Request làm ấm không được kèm `stream: true`, `thinking.type: "enabled"`, structured outputs hay `tool_choice` ép gọi tool.

Theo mặc định, cache chỉ sống 5 phút (gọi là TTL), tính từ lúc request bắt đầu. Ví dụ, nếu response stream mất 4 phút thì request tiếp theo phải bắt đầu trong khoảng 1 phút sau đó mới dùng lại được cache. Tương tự, nếu nhân viên mở màn hình khách mà hơn 5 phút sau mới hỏi thì cache đã làm ấm sẽ hết hạn.

Với agent có hội thoại rất dài, còn một cách nữa để giảm TTFT là **message threads**, đang ở bản beta và bật bằng header `message-threads-2026-08-12`. Ứng dụng gửi toàn bộ hội thoại một lần. Từ vòng sau, ứng dụng chỉ gửi message mới kèm `id` của response trước. Request nhờ vậy nhỏ hơn, nên TTFT thấp và ổn định hơn khi hội thoại dài ra. Thread chỉ giảm TTFT chứ không giảm chi phí, nên vẫn phải giữ `cache_control`. Thread hết hạn nếu 5 phút không dùng tới, vì vậy ứng dụng vẫn phải giữ bản sao hội thoại để gửi lại khi API báo lỗi 404. Thread cũng không nằm trong chế độ ZDR (Zero Data Retention, tức Anthropic không lưu dữ liệu sau khi trả response). Trợ lý báo giá có hội thoại ngắn nên chưa cần cách này.

## Chỉnh effort cho vừa độ trễ

Effort được đặt trong `output_config.effort`, với năm mức từ thấp tới cao là `low`, `medium`, `high`, `xhigh` và `max`. Mức này quyết định Claude nghĩ nhiều hay ít, gọi bao nhiêu tool và có tự kiểm lại hay không. Vì vậy effort ảnh hưởng tới toàn bộ token đầu ra và cả số vòng gọi tool.

Effort không bắt mọi request nghĩ sâu như nhau. Thinking của các model Claude hiện nay là **adaptive thinking**, bật bằng `thinking: {"type": "adaptive"}`. Với mỗi request, Claude tự xét độ khó rồi mới quyết định có nghĩ không và nghĩ bao nhiêu. Câu hỏi đơn giản có thể được trả lời ngay mà không có block thinking nào, còn việc nhiều bước thì Claude nghĩ kỹ hơn. Effort chỉ là gợi ý mềm về việc nên nghĩ thường xuyên và sâu tới đâu. Vì vậy một luồng vừa có câu hỏi ngắn vừa có việc nhiều bước không nhất thiết phải hạ effort cho tất cả, hay tách sang model khác. Cách cũ đặt cố định `budget_tokens` cho thinking không còn dùng được: từ các model 4.7 trở đi, kể cả Sonnet 5.5, API trả lỗi 400.

Trên Claude API, Sonnet 5.5 mặc định chạy ở `high`. Với chat và những việc cần nhanh, bạn nên bắt đầu ở `medium` hoặc `low`. Nếu muốn Sonnet 5.5 trả lời ngay mà không nghĩ trước, hãy gửi `thinking: {"type": "between_tools"}`. Cách này chỉ dùng được ở `low`, `medium` và `high`, còn ở `xhigh` hay `max` thì API báo lỗi 400. Khi đã dùng cách này, bạn cũng không đổi được effort giữa hội thoại.

Đội có thể chỉnh effort theo mấy bước sau.

1. Chạy thử từng mức effort trên bộ eval của mình (**effort sweep**), mỗi mức một session riêng để cache không bị lẫn, và đo cả độ trễ p95 lẫn chất lượng.
2. Đọc kết quả ở hai đầu. Effort thấp quá, nhất là ở `low`, thì Claude dễ bỏ sót một lần tra, dừng sớm hoặc bỏ bước tự kiểm. Báo giá thiếu thì nhân viên phải hỏi lại, và lại tốn thêm cả một câu trả lời. Effort cao quá thì tốn thêm token và thời gian mà chất lượng tăng không bao nhiêu, nhất là ở `max`.
3. Giữ effort cố định suốt hội thoại. Nếu đổi effort của cả request khi hội thoại đang diễn ra, bạn có thể mất cache. Nếu thật sự cần đổi giữa chừng, hãy dùng effort theo message, đang ở bản beta và bật bằng header `mid-conversation-output-config-2026-07-01`. Bạn chèn vào hội thoại một message `role: "system"` không có nội dung, chỉ mang `output_config.effort` mới, còn effort của cả request thì để nguyên.
4. Khi đổi model, chạy thử lại các mức effort chứ đừng mang mức cũ sang, vì cùng là `medium` nhưng mỗi model lại nghĩ và làm nhiều ít khác nhau.

Ngoài effort, còn hai cách nữa để rút ngắn thời gian sinh chữ.

Cách thứ nhất là **fast mode**, bật bằng `speed: "fast"`. Fast mode giúp model sinh chữ nhanh hơn tới 2,5 lần nhưng giá cao hơn, ví dụ với Opus 5.5 là gấp đôi giá thường, và không làm TTFT giảm. Fast mode có rate limit riêng, và nếu đổi tốc độ giữa hội thoại thì bạn mất cache. Chế độ này có trên Opus 5.5, Fable 5.2 và Mythos 5.2 chứ không có trên Sonnet 5.5, nên trợ lý dùng Sonnet 5.5 không bật được.

Cách thứ hai là cho Claude biết thời gian là quan trọng, và gửi kèm thời gian đã trôi qua trong mỗi request. Cách này khác câu dặn chung "hãy trả lời thật nhanh" ở chỗ Claude biết mình đã tốn bao lâu nên tự cân nhắc khi nào dừng. Nhưng nó không thay được việc sửa số vòng gọi tool do harness gây ra. Trong thử nghiệm của Anthropic, một agent Opus 5.5 chạy ở `medium` làm xong một bài nghiên cứu điển hình nhanh hơn 47%, đổi lại điểm trung bình thấp hơn 4,1.

Cuối cùng, nhà phân phối bật streaming, gọi tool song song, cache catalog, làm ấm cache khi nhân viên mở màn hình khách, và hạ effort xuống `medium`. Trên bộ eval 200 báo giá, tỉ lệ đúng là 97%, so với 98% trước đó. Tức là chỉ chênh 2 báo giá trên 200, và đội chấp nhận mức này để báo giá xong sớm hơn 12 giây. Hạ effort chủ yếu làm Claude nghĩ ít hơn trước mỗi vòng, còn 700 token báo giá vẫn cần khoảng 5 giây để sinh.

**Sơ đồ: Vẫn là Sonnet 5.5, nhưng bớt vòng gọi, cache catalog và stream, nên báo giá xong trong 8,6 giây**
_Hai thanh thời gian cùng tỉ lệ từ 0 tới 21 giây, vạch đứt là mục tiêu p95 ở 2 giây, 4 giây và 10 giây. Trước khi sửa, effort high, màn hình trống tới giây 21. Sau khi sửa, effort medium, tên tool hiện sau 1,0 giây, năm tool chạy cùng lúc, chữ đầu của báo giá tới sau 3,5 giây, 700 token báo giá stream tới khi xong ở giây 8,6, sớm hơn 12 giây. Bốn cách sửa là streaming, tool song song, cache catalog có làm ấm, effort medium, vẫn dùng Sonnet 5.5. Eval 200 báo giá đúng 97%, trước đó 98%._

- Vạch đứt là mục tiêu p95, 2 s có trạng thái, 4 s có chữ đầu, 10 s xong báo giá
- **2 s**
- **4 s**
- **10 s**
- **Trước**: effort high
- **màn hình trống tới giây 21**
- **Sau**: effort medium
- năm tool
- 700 token
- **xong sớm hơn 12 giây**
- **1,0 s**: tên tool
- **3,5 s**: chữ đầu
- **8,6 s**: xong
- **BỐN CÁCH SỬA, VẪN LÀ SONNET 5.5**
- **Streaming**
- **Tool song song**
- **Cache, làm ấm**
- **Effort medium**: Eval 200 báo giá đúng 97%, trước đó 98%, tức chỉ chênh 2 báo giá

Cả ba mốc giờ đều đạt mục tiêu. Tên tool hiện sau 1,0 giây so với mục tiêu 2 giây, chữ đầu tới sau 3,5 giây so với mục tiêu 4 giây, và báo giá xong sau 8,6 giây so với mục tiêu 10 giây.

> **Ý chính**
>
> Hãy đọc hồ sơ độ trễ ở p95 trước khi sửa, và tách chữ đầu tiên khỏi độ trễ tổng. Streaming và hiện tên tool sớm chỉ làm người dùng thấy nhanh hơn. Muốn xong việc nhanh hơn thì phải bớt vòng gọi model bằng cách gọi tool song song và gửi mọi `tool_result` trong một user message, cache phần đầu prompt dài, rồi chạy thử từng mức effort trên bộ eval của mình. Đổi model không phải việc đầu tiên.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 6](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Reduce latency (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency)
3. [Streaming messages (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/streaming)
4. [Fine-grained tool streaming (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming)
5. [Parallel tool use (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use)
6. [Programmatic tool calling (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
7. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
8. [Message threads (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/message-threads)
9. [Effort (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/effort)
10. [Steering thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost)
11. [Extended thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
12. [Per-message effort (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/effort-per-message)
13. [Building with thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
14. [Fast mode (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
15. [Optimizing for cost and intelligence (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
