---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-2-loi-co-cau-truc-mcp
ngay_tai: 2026-11-27
tieu_de: Trả lỗi có cấu trúc từ tool MCP
---

Domain 2: Tool Design & MCP Integration · Task 2.2

# Trả lỗi có cấu trúc từ tool MCP

Tool MCP báo lỗi thế nào để agent biết nên thử lại, đổi cách hay dừng. Gồm cờ isError, bốn loại lỗi, chỗ thử lại, và phân biệt lỗi với kết quả rỗng.

- 19 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Dùng cờ isError của MCP để báo tool chạy thất bại
- Phân biệt lỗi tạm thời, lỗi dữ liệu đầu vào, lỗi nghiệp vụ và lỗi không có quyền
- Trả kèm loại lỗi, có nên thử lại không và lời giải thích dễ hiểu
- Để tool hay subagent tự thử lại lỗi tạm thời, chỉ báo lên những lỗi không tự xử lý được
- Phân biệt lỗi truy cập với kết quả rỗng hợp lệ

MCP (**Model Context Protocol**) là chuẩn để nối agent với hệ thống bên ngoài. Với mỗi hệ thống, người ta dựng một MCP server, và server đó cung cấp các tool để agent gọi. Tool nào rồi cũng có lúc hỏng: mạng chập chờn, dữ liệu sai, người dùng yêu cầu một việc quy định không cho phép, hay hệ thống không cấp quyền. Agent chỉ biết những gì tool báo lại, nên cách tool báo lỗi quyết định agent sẽ thử lại, đổi cách khác, giải thích cho người dùng, hay dừng.

Bài bắt đầu với cờ `isError` của MCP, sau đó là bốn loại lỗi và những thông tin nên trả kèm mỗi lỗi. Tiếp theo là chuyện nên thử lại lỗi tạm thời ở đâu. Cuối bài nói cách phân biệt lần tra bị lỗi với lần tra xong mà không có kết quả nào.

**Sơ đồ: Agent chỉ biết những gì tool báo lại, nên mỗi kiểu kết quả dẫn tới một cách xử lý**
_Bản đồ bài: agent gọi tool trên MCP server bằng tools/call. Tool trả về một trong ba kiểu: protocol error JSON-RPC khi request sai, agent khó tự sửa; isError true kèm errorCategory, isRetryable, message, mỗi loại lỗi một việc cho agent: transient thì thử lại hoặc báo đợi, validation thì sửa tham số hoặc hỏi lại, business thì giải thích quy định, permission thì chuyển nhân viên; isError false với results rỗng khi đã tra xong mà không có gì khớp, agent tin là không có. Chỉ lỗi transient đi qua bước tool tự thử lại có backoff, hết lượt mới trả lên; ba loại còn lại tool trả ngay. Nếu agent nhận lỗi là subagent, nó báo lên agent điều phối lỗi không tự xử lý được, kèm việc đã làm được_

- **Agent**: khó tự sửa
- làm việc ghi
- cạnh loại lỗi
- tin là không có
- tools/call
- **Protocol error (JSON-RPC)**: request sai: gọi tool không tồn tại
- **isError: true**: errorCategory, isRetryable, message
- transient: thử lại hoặc báo đợi
- validation: sửa tham số, hỏi lại
- business: giải thích quy định
- permission: chuyển nhân viên
- **isError: false, results: []**: đã tra xong, không có gì khớp
- **Tool**: trên MCP server
- API, database
- tự thử lại
- có backoff, hết
- lượt mới trả
- 3 loại còn lại:
- trả ngay
- nếu Agent là subagent: báo lên lỗi không tự xử lý được, kèm việc đã làm được
- **Agent điều phối**: hỏi khách cách khác

## Ví dụ xuyên suốt: MCP server của một nhà xe khách liên tỉnh

Một nhà xe chạy 40 xe giường nằm trên các tuyến TP.HCM đi Đà Lạt và Nha Trang, bán khoảng 1.200 vé mỗi ngày. Đội kỹ thuật của nhà xe dựng một MCP server `nha_xe` với năm tool: `tim_chuyen`, `tra_ve` (tra theo mã vé hoặc số điện thoại), `dat_ve`, `hoan_ve` và `gui_tin_xac_nhan`. Phía sau server là database vé và hệ thống giữ ghế của nhà xe, cùng API của một dịch vụ nhắn tin bên ngoài để gửi tin xác nhận. Một phần vé trên tuyến Nha Trang do một nhà xe đối tác bán qua API của họ.

Trên server đó, nhà xe chạy một hệ thống agent trả lời khách qua Zalo. Hệ thống có một agent điều phối nói chuyện với khách, và một subagent đặt vé (agent con nhận việc từ agent điều phối) lo giữ ghế và xuất vé.

## Báo lỗi bằng cờ isError

Ở bản đầu của server, mỗi tool báo lỗi theo một kiểu riêng. `tra_ve` ném exception khi không tìm thấy mã vé, và framework của agent chỉ ghi log rồi báo "có lỗi xảy ra". `hoan_ve` khi hỏng thì vẫn trả kết quả thành công, kèm một field `status: "loi"`. Cả hai cách đều khiến agent hiểu sai. Gặp exception, agent không biết vì sao hỏng. Còn khi kết quả báo thành công, agent dễ coi field `status: "loi"` là dữ liệu bình thường.

MCP có hai cách báo lỗi, tuỳ lỗi nằm ở chính request hay xảy ra lúc tool đang chạy. MCP dùng JSON-RPC làm định dạng cho request và phản hồi, nên lỗi ở tầng request là lỗi JSON-RPC:

| Cách báo | Dùng cho | Ví dụ |
| --- | --- | --- |
| Lỗi giao thức JSON-RPC (**protocol error**) | Lỗi ở chính request: gọi tool không tồn tại, request hỏng cấu trúc (không đúng schema `CallToolRequest`), lỗi server | Gọi tool tên `dat_ve_xe` không có trên server |
| Kết quả tool có `isError: true` (**tool execution error**) | Lỗi xảy ra lúc tool chạy: API bên ngoài hỏng, tham số sai hay thiếu khi tool kiểm tra đầu vào, vi phạm quy định nghiệp vụ | Ngày đi đã qua, API nhà xe đối tác trả 503, vé đã quá hạn hoàn |

Khi tool hỏng lúc đang chạy, server vẫn trả về một kết quả như bình thường, có nội dung giải thích lỗi. Cờ `isError: true` cho agent biết đây là một lần thất bại chứ không phải dữ liệu. Client, tức chương trình chạy agent và gọi tool, nên đưa loại lỗi này cho Claude đọc, vì trong đó có thông tin để Claude tự sửa rồi gọi lại với tham số khác. Còn lỗi giao thức nằm ở cấu trúc của request, nên Claude ít khi tự sửa được.

Nếu gọi Claude API trực tiếp, cờ tương ứng là `is_error: true`, đặt trong block `tool_result` (phần bạn gửi kết quả tool về cho Claude). Nhận lỗi xong, Claude có thể gọi lại tool, nên vòng lặp agent trong code của bạn cần giới hạn số lần thử lại.

> **Trong đề chọn gì**
>
> Nếu đề hỏi cách báo lỗi của một tool MCP (không tìm thấy đơn, database lỗi tạm thời), hãy chọn đáp án trả thông báo lỗi trong nội dung kết quả tool với `isError: true`. Ném exception, trả kết quả thành công kèm field trạng thái, hay ghi log rồi trả rỗng đều sai. Bỏ `is_error: true` để Claude đọc lỗi như dữ liệu thường cũng sai, vì Claude mất tín hiệu rõ nhất rằng lời gọi đã hỏng. Nếu đề kể ba lỗi xảy ra khi tool chạy, như thiếu tham số bắt buộc, API bên ngoài trả 404 và API trả 503, thì cả ba đều phải trả bằng kết quả tool có `isError: true`. Thiếu tham số ở đây là lỗi tool phát hiện khi kiểm tra đầu vào. Lỗi JSON-RPC chỉ dành cho request hỏng cấu trúc hay gọi tool không tồn tại.

## Một câu "Thao tác thất bại" cho mọi lỗi

Sau khi chuyển hết sang `isError`, đội kỹ thuật gặp chuyện khác. Lỗi gì thì tool cũng trả về đúng một câu "Thao tác thất bại", tức một câu lỗi giống hệt nhau cho mọi trường hợp (**uniform error responses**), và agent xử lý lung tung. Khách gõ nhầm mã vé, agent thử lại `tra_ve` năm lần với đúng mã đó. API đối tác chập mạng vài giây, agent chuyển ngay cho nhân viên. API key của nhà xe không có quyền hoàn những vé do nhà xe đối tác bán, agent lại hỏi khách "anh kiểm tra lại giúp em mã vé nhé".

Lỗi không nằm ở agent. Nhận một câu chung chung, agent không có căn cứ gì để chọn cách xử lý, trong khi mỗi loại lỗi lại cần một cách riêng, như bảng sau:

| Loại lỗi | Ví dụ ở nhà xe | Thử lại? | Agent nên làm gì |
| --- | --- | --- | --- |
| Tạm thời (**transient**) | timeout, API đối tác trả 503 | Có, sau một lúc | Thử lại, hoặc báo khách đợi một chút |
| Dữ liệu đầu vào sai (**validation**) | mã vé sai định dạng, ngày đi đã qua | Không, trừ khi sửa đầu vào | Sửa tham số, hoặc hỏi lại khách |
| Nghiệp vụ (**business**) | vé đã quá hạn hoàn, ghế đã có người đặt | Không | Giải thích quy định cho khách, đề xuất cách khác |
| Không có quyền (**permission**) | API key không được hoàn vé của nhà xe đối tác | Không | Chuyển cho nhân viên, không hỏi khách |

Lỗi tạm thời là lỗi nên thử lại (**retryable**). Ba loại còn lại là lỗi không nên thử lại (**non-retryable**), vì gọi lại y hệt bao nhiêu lần cũng hỏng.

Đội sửa server để lỗi nào cũng trả kèm thông tin có cấu trúc (**structured error metadata**), nghĩa là chia thành từng field rõ ràng thay vì gộp trong một câu. Có ba thứ: loại lỗi (`errorCategory`), có nên thử lại đúng lời gọi đó không (`isRetryable`), và một câu giải thích bằng lời thường (**human-readable description**). MCP không đặt tên sẵn các field này. Đây là quy ước riêng của nhà xe, và các field nằm trong phần `content` của kết quả lỗi:

```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\"errorCategory\": \"validation\", \"isRetryable\": false, \"message\": \"Không có vé nào mã XK-90213. Mã vé của nhà xe có dạng XK- và 6 chữ số. Nếu khách không nhớ mã, dùng tra_ve theo số điện thoại.\"}"
  }]
}
```

Với lỗi này, `isRetryable: false` báo agent đừng gọi lại y hệt, còn câu giải thích chỉ cho agent bước tiếp theo nên làm. Gặp lỗi timeout, server trả `errorCategory: "transient"` và `isRetryable: true`, kèm câu "Hệ thống vé đối tác không phản hồi sau 10 giây, vài phút nữa thử lại có thể sẽ được".

**Sơ đồ: Một câu lỗi chung dẫn agent tới cách sai ở cả ba sự cố; errorCategory dẫn tới cách đúng**
1. **Mọi lỗi trả "Thao tác thất bại"**: agent không có căn cứ để chọn cách xử lý
   ↓ _agent đành đoán_
2. **SaiKhách gõ nhầm mã vé**: agent thử lại **tra_ve** năm lần với đúng mã đó **|** **SaiAPI đối tác chập vài giây**: agent chuyển ngay cho nhân viên **|** **SaiKhông có quyền hoàn vé đối tác**: agent hỏi khách kiểm tra lại mã vé
   ↓ _sửa server: lỗi trả kèm errorCategory và isRetryable_
3. **Đúngvalidation, không thử lại**: agent hỏi lại mã, hoặc tra theo số điện thoại **|** **Đúngtransient, thử lại được**: agent thử lại, hoặc báo khách đợi một chút **|** **Đúngpermission**: agent chuyển cho nhân viên, không hỏi khách

Câu giải thích nên viết như một lời hướng dẫn. Thay vì một chữ "failed", hãy nói rõ cái gì hỏng và agent nên thử gì tiếp theo, chẳng hạn "Rate limit exceeded. Retry after 60 seconds." Một lỗi chỉ có mã kỹ thuật thô như `HTTP 504, partner_api=..., timeout=10000` giúp ích cho người debug, nhưng không giúp agent biết phải nói gì với khách.

> **Trong đề chọn gì**
>
> Nếu đề kể agent chỉ nói "thiết bị không phản hồi" hay "có lỗi với yêu cầu", hãy chọn đáp án cho tool trả lỗi có `isError: true`, kèm loại lỗi, cho biết lỗi có khắc phục được không, và gợi ý bước tiếp theo cho người dùng. Tạo thêm tool riêng để lấy gợi ý hay để phục hồi lỗi chỉ thêm lời gọi, trong khi gợi ý lẽ ra đã nằm sẵn trong lỗi. Một lỗi chung kiểu `{"success": false, "error": "lookup_failed"}` cho mọi trường hợp thì gọn nhưng lại xoá mất loại lỗi. Trả `is_error: false` kèm một câu lạc quan "lệnh đã gửi" thì giấu luôn chuyện lệnh chưa chắc đã chạy. Còn cho tool tự retry rồi chỉ báo khi hết lượt thì mới xử lý được lỗi tạm thời. Với lỗi dữ liệu sai hay lỗi không tìm thấy, Claude vẫn nhận một câu lỗi chung và vẫn không biết nên thử cách nào.

> **Bẫy đề**
>
> Tool MCP trả cùng một câu lỗi `"Operation failed"` cho mọi trường hợp, và agent lúc thử lại quá nhiều, lúc chuyển cho người quá sớm, lúc hỏi lại người dùng sai chỗ. Cải tiến nào hiệu quả nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm tool `analyze_error` để agent gọi sau mỗi lỗi** (_an analyze_error tool_). Nghe bài bản vì có hẳn một tool chuyên phân loại lỗi. Nhưng tool đó cũng chỉ thấy câu "Operation failed", nên không có gì để phân loại.
> - **Thêm few-shot dạy agent đọc chữ trong thông báo lỗi** (_few-shot examples for reading error text_). Nghe như ví dụ sẽ giúp agent đoán tốt hơn. Có điều thông tin cần thiết không có trong câu lỗi, nên đoán kiểu gì cũng vẫn là đoán.
> - **Cho server tự retry mọi lỗi với exponential backoff** (_retry everything in the server_), tức mỗi lần thử lại chờ lâu hơn lần trước. Nghe chắc ăn vì lỗi nào cũng được thử thêm. Ngặt nỗi lỗi dữ liệu sai hay lỗi quyền thử bao nhiêu lần cũng hỏng, chỉ làm agent chờ lâu hơn rồi vẫn nhận câu lỗi chung.
>
> **Chọn:** cho tool trả thông tin lỗi có cấu trúc, gồm `errorCategory` (transient, validation, permission, business), `isRetryable` và một câu mô tả nguyên nhân. Thêm một bước phân loại lỗi trong vòng lặp agent, chặn lỗi trước khi Claude thấy rồi gắn nhãn "retry" hay "escalate", cũng không hơn, vì bước đó cũng chỉ có câu lỗi chung để đoán. Nếu đề hỏi field nào cho biết có nên thử lại đúng lời gọi đó, chọn `isRetryable` (không phải `isError`, `errorCategory` hay `tool_choice`). Đề gọi `isError` và `errorCategory` là hai field chuẩn của phản hồi lỗi, dù spec MCP chỉ định nghĩa `isError`, nên nếu đề hỏi hai field chuẩn thì chọn hai field này.

## Lỗi nghiệp vụ và câu trả lời viết sẵn cho khách

Quy định của nhà xe là vé chỉ được hoàn khi còn ít nhất 24 tiếng nữa mới tới giờ xe chạy. Theo log, khoảng 1 trong 10 lời gọi `hoan_ve` vấp quy định này. Lỗi nghiệp vụ là loại lỗi thử lại bao nhiêu lần cũng không thành, vì quy định không đổi theo số lần gọi. Nhờ `isRetryable: false`, agent đã thôi thử lại. Nhưng nó vẫn phải tự đoán quy định từ một câu `message` viết cho kỹ thuật, nên mỗi lần nói với khách một kiểu, có lúc chỉ là "vé của anh không hoàn được ạ".

Đội thêm vào lỗi của `hoan_ve` một field `customerMessage`, chứa câu giải thích viết sẵn cho khách (**customer-friendly explanation**):

```json
{
  "errorCategory": "business",
  "isRetryable": false,
  "message": "Vé XK-482915 khởi hành 21h hôm nay, còn 5 tiếng, dưới mức 24 tiếng nên không hoàn được.",
  "customerMessage": "Dạ vé chỉ hoàn được khi còn ít nhất 24 tiếng nữa mới tới giờ xe chạy anh ạ. Em đặt giúp anh một chuyến khác trong 7 ngày tới được, anh có muốn đặt không ạ?"
}
```

Thấy `isRetryable: false`, agent biết phải dừng, và đã có sẵn một câu trả lời lịch sự, đúng quy định, kèm cách khác cho khách. Agent cũng không phải tự đoán quy định từ một thông báo kỹ thuật, nên khách nào hỏi cũng nhận cùng một câu trả lời.

Cách này cũng tốt hơn việc chỉ cho tool tự thử lại các lỗi kỹ thuật rồi chuyển lỗi nghiệp vụ cho Claude dưới dạng chữ thường. Cách đó bớt được vài lần thử lại, nhưng Claude vẫn không có cờ nào cho biết lỗi nghiệp vụ không nên thử lại, và vẫn không có câu nào để nói với khách.

> **Trong đề chọn gì**
>
> Nếu đề kể agent tốn nhiều lượt thử lại các lỗi nghiệp vụ (quá hạn đổi trả, đã hoàn tiền rồi), hãy chọn đáp án trả lỗi có cấu trúc với `isRetryable: false` kèm lời giải thích dễ hiểu cho khách. Đề có thể viết field này là `retryable` hay `retriable` (**retriable flag**), nghĩa vẫn như nhau. Thêm tool kiểm tra điều kiện trước khi gọi, hay few-shot dạy đọc thông báo lỗi, đều không trả lời được câu "có nên thử lại không".

## Khi tool không biết việc đã xong hay chưa

Lỗi nghiệp vụ thì biết chắc là không làm được. Có một kiểu lỗi ngược lại: tool không biết việc đã xong hay chưa, và phải nói rõ điều đó. `gui_tin_xac_nhan` gọi API của dịch vụ nhắn tin, và khi API này timeout, nhà xe không biết tin đã tới khách chưa. Lúc đầu, lỗi timeout của tool này được gắn `transient`, `isRetryable: true` như mọi timeout khác, nên agent gửi lại, và nhiều khách nhận hai ba tin xác nhận giống nhau.

Bản sửa nói thẳng là chưa biết: "Timeout, chưa rõ tin đã đi chưa. Có thể tin đã tới khách rồi. Đừng gửi lại. Báo nhân viên kiểm tra trạng thái tin sau 5 phút." Trả `isRetryable: true` ở đây là sai, vì chính việc thử lại đã gây ra tin trùng. Một câu khuyến khích thử lại, hay lặp lại nguyên nội dung tin nhắn gốc trong lỗi, cũng không giúp agent biết rằng tin có thể đã đi rồi.

> **Trong đề chọn gì**
>
> Nếu tool không biết lệnh đã chạy xong hay chưa (gửi thông báo bị timeout), hãy chọn thông báo nói rõ là chưa biết, rằng tin có thể đã được gửi, và dặn agent đừng thử lại. Cờ kiểu `retry_safe: true` cho timeout là sai, vì thử lại chính là thứ gây ra tin trùng.

## Thử lại ở đâu: trong tool, trong subagent, hay báo lên agent điều phối

Lỗi tạm thời như timeout hay 503 thường tự hết sau một lúc. Với loại này, thử lại ngay trong tool là hợp lý nhất. `tim_chuyen` gọi API đối tác, gặp 503 thì tự thử lại tối đa 5 lần sau lần gọi đầu, mỗi lần chờ lâu hơn lần trước (**exponential backoff**). Agent không cần biết những lần thử đó. Chỉ khi thử hết mà vẫn hỏng, tool mới trả lỗi `transient` lên. Còn lỗi dữ liệu sai hay lỗi quyền thì tool trả ngay, không thử lại, kèm câu mô tả rõ để agent sửa tham số hay chuyển cho người.

Tầng tiếp theo là subagent. Subagent đặt vé được giao "giữ 3 ghế liền nhau chuyến 22h đi Đà Lạt". Khi một lần giữ ghế gặp lỗi tạm thời, subagent tự xử lý tại chỗ (**local error recovery**) bằng cách thử lại, hoặc chọn ba ghế liền nhau khác trên cùng chuyến. Lỗi nào không tự giải quyết được thì nó mới báo lên agent điều phối (**propagate to the coordinator**), kèm việc đã làm được (**partial results**) và những cách đã thử (**what was attempted**), như báo cáo sau:

```
Không giữ được 3 ghế liền nhau chuyến 22h.
Đã giữ được: 2 ghế A07, A08 (giữ tạm 10 phút).
Đã thử: giữ A09 ba lần, cả ba bị lỗi transient từ hệ thống giữ ghế; thử bộ B03–B05 thì B04 đã có người đặt.
Còn trống trên chuyến 22h: 4 ghế lẻ ở tầng dưới. Chuyến 23h còn 3 ghế liền nhau.
```

Với báo cáo đó, agent điều phối có đủ thông tin để hỏi khách muốn lấy 2 ghế liền nhau cộng 1 ghế lẻ, hay chuyển sang chuyến 23h. Nếu subagent chỉ báo "đặt vé thất bại", agent điều phối phải giao lại từ đầu, và hai ghế đã giữ được cũng không ai dùng.

**Sơ đồ: Lỗi tạm thời được thử lại gần chỗ xảy ra; lỗi còn lại báo lên kèm ghế đã giữ được**
_Ba tầng xử lý lỗi. Tầng 1 trong tool: timeout, 503 thì tự thử lại có backoff; báo lên tầng 2 lỗi transient khi hết lượt, còn validation và permission thì báo ngay, không thử, kèm câu mô tả rõ. Tầng 2 subagent đặt vé: tự thử lại hoặc đổi bộ 3 ghế liền khác; lỗi không tự xử lý được thì báo lên tầng 3, kèm ghế đã giữ A07, A08 và cách đã thử. Tầng 3 agent điều phối: hỏi khách lấy 2 ghế liền cộng 1 ghế lẻ hay chuyển chuyến 23h, đây là bước cuối. Cách sai: subagent chỉ báo đặt vé thất bại, agent điều phối phải giao lại từ đầu, A07, A08 bỏ phí_

- 1. **TRONG TOOL**
- **Tool gọi API**
- **Tự xử lý**: timeout, 503:
- tự thử lại có backoff
- **Báo lên**: transient: hết lượt
- validation, permission:
- báo ngay, không thử
- kèm câu mô tả rõ
- 2. **SUBAGENT ĐẶT VÉ**
- **Subagent đặt vé**
- **Tự xử lý**: thử lại, hoặc đổi
- bộ 3 ghế liền khác
- **Báo lên**: lỗi không tự xử lý được,
- kèm ghế đã giữ:
- A07, A08
- và cách đã thử
- 3. **AGENT ĐIỀU PHỐI**
- **Agent điều phối**
- **Hỏi khách**: 2 ghế liền + 1 ghế lẻ,
- hay chuyển chuyến 23h
- bước cuối: chờ khách chọn
- **CÁCH SAI**
- **Subagent chỉ báo**: “đặt vé thất bại”, không kèm gì
- **Agent điều phối**: giao lại từ đầu, A07, A08 bỏ phí

> **Bẫy đề**
>
> Tool gọi một API bên ngoài, lúc gặp lỗi tạm thời (timeout, 503), lúc gặp lỗi thử lại cũng không hết (403 không có quyền, 422 dữ liệu sai). Hiện tool trả thẳng mọi lỗi cho agent, và agent thử lại cả những lỗi không bao giờ thành công. Nên chia việc xử lý lỗi thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Báo mọi lỗi cho agent kèm chi tiết, để agent tự quyết** (_surface everything and let the agent decide_). Nghe hợp lý vì tool giữ được đơn giản và agent toàn quyền quyết định. Nhưng đó chính là tình trạng hiện tại, khi agent tốn lượt vào những lỗi mà tool tự xử lý được.
> - **Tool tự thử lại mọi lỗi, hết lượt mới báo** (_retry all errors in the tool_). Nghe hợp lý vì agent không bị làm phiền. Có điều lỗi 403 hay 422 thử lại vô ích, chỉ làm chậm thêm.
> - **Một bộ bắt lỗi chung trả "tool unavailable, try again later"** (_a generic catch-all message_). Nghe gọn vì giấu bớt chi tiết. Ngặt nỗi agent mất hết căn cứ để phân biệt các loại lỗi, lại còn được khuyên thử lại cả lỗi không bao giờ thành.
>
> **Chọn:** tool tự thử lại có backoff cho lỗi tạm thời, còn lỗi thử lại cũng không hết thì báo ngay cho agent, kèm thông báo mô tả rõ để agent sửa. Nếu đề hỏi riêng cách xử lý 503 của API bên ngoài, chọn tự thử lại vài lần với exponential backoff, chứ không trả danh sách rỗng hay báo lỗi ngay.

## Tra xong mà rỗng khác với chưa tra được

Khi chuyển sang `isError`, đội chỉ sửa những chỗ tool ném exception hay trả kết quả thành công giả. `tim_chuyen` vẫn giữ một thói quen cũ: gặp database timeout thì bắt lỗi rồi trả danh sách rỗng. Một khách hỏi chuyến TP.HCM đi Đà Lạt lúc 2 giờ sáng. Nhà xe không chạy giờ đó, nên danh sách rỗng là câu trả lời đúng. Nhưng một tối database bị chậm, khách hỏi chuyến 21h, và `tim_chuyen` cũng trả danh sách rỗng.

Agent không phân biệt được hai trường hợp này. Có lúc nó báo khách "không có chuyến nào" trong khi thật ra chưa tra được. Có lúc nó lại tra đi tra lại một câu hỏi mà câu trả lời vốn là không có.

Lỗi truy cập (**access failure**) nghĩa là tool không tới được nguồn dữ liệu, như khi database timeout, nên chưa tra được gì. Kết quả rỗng hợp lệ (**valid empty result**) nghĩa là đã tra xong và không có gì khớp. Đội cho tool trả hai trường hợp này theo hai dạng khác nhau:

```json
{"isError": false, "content": [{"type": "text", "text": "{\"success\": true, \"results\": [], \"note\": \"Không có chuyến nào khởi hành từ 0h đến 4h trên tuyến này.\"}"}]}
```

```json
{"isError": true, "content": [{"type": "text", "text": "{\"errorCategory\": \"transient\", \"isRetryable\": true, \"message\": \"Database không phản hồi, chưa tra được chuyến nào.\"}"}]}
```

Kết quả rỗng đi với `isError: false` và một mảng `results` rỗng, nên agent tin được là không có chuyến. Lỗi truy cập đi với `isError: true`, nên agent biết phải thử lại hoặc báo khách đợi, chứ không kết luận là không có chuyến.

**Sơ đồ: Mảng rỗng chỉ có nghĩa "không có chuyến" khi database đã trả lời; timeout phải là lỗi**
- không, timeout
- có
- không
- tim_chuyenTP.HCM đi Đà Lạt, 2 giờ sáng
- Databasetrả lời?
- isError: true, transientagent thử lạihoặc báo khách đợi
- Có chuyếnkhớp?
- isError: false, results: []agent nói: không cóchuyến từ 0h đến 4h
- isError: falseresults: các chuyến

> **Ý chính**
>
> Lỗi khi tool chạy thì trả bằng `isError: true`, kèm loại lỗi, `isRetryable` và câu giải thích chỉ bước tiếp theo. Lỗi tạm thời được thử lại càng gần chỗ xảy ra càng tốt, lỗi còn lại báo lên kèm những gì đã làm được. Tool phải trả hai trường hợp chưa tra được và tra xong mà rỗng theo hai dạng khác nhau, để agent không nhầm.

> **Trong đề chọn gì**
>
> Nếu đề kể agent tìm lại ngay sau khi nhận 0 kết quả, trong khi API trả 200 với mảng rỗng, hãy chọn đáp án trả kết quả có cấu trúc kiểu `success` cộng mảng `results`, và chỉ dùng `isError: true` cho lỗi thật sự xảy ra lúc tool chạy. Gắn `isError: true` cho kết quả rỗng là sai, vì tra xong không có gì không phải là lỗi. Thêm field `suggestions` gợi ý cách tìm khác, hay trả một câu văn tự nhiên để agent tự hiểu, đều không cho agent biết rõ đây là kết quả hợp lệ. Nếu đề hỏi cách phân biệt đúng hai trường hợp này, chọn cho lỗi truy cập trả `isError: true` vì chưa tra được gì, còn kết quả rỗng hợp lệ trả `isError: false`. Lặng lẽ trả mảng rỗng khi lỗi, hay ném exception cho cả hai trường hợp, đều sai.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 2.2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [MCP specification, Tools (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
3. [Handle tool calls (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
4. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/research/writing-tools-for-agents)
