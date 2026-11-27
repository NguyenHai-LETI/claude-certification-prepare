---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/6-1-chi-phi-quy-mo-lon
ngay_tai: 2026-11-27
tieu_de: Kiến trúc chi phí ở quy mô lớn - tính và dự báo chi phí, chia việc cho nhiều model, cache, batch và ngân sách theo tenant
---

Domain 6: Cost and Latency Optimization at Scale · Task 6.1

# Kiến trúc chi phí ở quy mô lớn - tính và dự báo chi phí, chia việc cho nhiều model, cache, batch và ngân sách theo tenant

Tính và dự báo chi phí từ dữ liệu usage, chọn cách chia việc cho nhiều model, giữ cache, chọn batch hay realtime, và tự chặn chi tiêu của từng tenant.

- 23 phút đọc
- Đối chiếu docs 24/11/2026
- 14 nguồn

## Đọc xong bạn nắm được

- Tính chi phí trên mỗi việc làm xong từ năm loại token trong usage, rồi dự báo riêng cho từng khối việc
- Dùng cache diagnostics tìm chỗ phần đầu prompt bị đổi khi tỉ lệ đọc cache tụt
- Chọn giữa router, cascade và advisor tool, và so các lựa chọn bằng chi phí trên mỗi việc làm xong
- Quyết định việc nào chạy batch, việc nào giữ realtime, dựa trên tiền tiết kiệm được và thời gian người dùng chờ được
- Tự chặn chi tiêu của từng tenant ngay trong gateway, và để spend limit của Claude Platform làm chốt chặn cuối

Khi hoá đơn Claude tăng nhanh hơn số khách, bạn nên sửa ở đâu trước? Và làm sao để một khách không tiêu hết ngân sách của cả hệ thống? Bài này chỉ cách đọc số liệu usage và chi phí để quyết định nên tối ưu chỗ nào cho cả hệ thống.

Tên task trong đề là **Cost Architecture at Scale**. Nó gồm việc đánh giá các chiến lược tối ưu ở mức cả hệ thống (**fleet-level optimization**) dựa trên dữ liệu usage và chi phí (**usage and cost data**). Bài đi lần lượt qua năm việc. Việc đầu là tính và dự báo chi phí (**cost modeling and forecasting**). Thứ hai là chia việc cho nhiều model Claude, bằng router hoặc cascade (**model routing and cascades across the Claude model family**). Thứ ba là dùng cache và tìm lý do cache bị mất (**caching strategy and cache diagnostics**). Thứ tư là chọn giữa batch và realtime dựa trên tiền (**batch-versus-realtime economics**). Cuối cùng là chặn chi tiêu của từng tenant (**per-tenant budget enforcement**).

Nếu chưa nắm giá token và cách đặt điểm cache, bạn nên đọc bài 5.4 CCDV-F trước. Rate limit, hàng đợi và quota theo tenant nằm ở bài 2.2, còn chuyện độ trễ nằm ở bài 6.2.

**Sơ đồ: Gateway chọn model, chọn batch và ghi sổ từng tenant, còn usage của mọi response là gốc để dự báo**
_Bản đồ bài. App CRM gửi mọi request kèm mã tenant vào gateway của công ty. Trong gateway có ba bước. Sổ chi tiêu tenant lo per-tenant budget enforcement. Router, cascade hay advisor lo model routing and cascades. Bước chọn batch hay realtime lo batch-versus-realtime economics. Request đi tiếp sang Claude Platform, gồm Messages API hoặc Message Batches API, prompt cache cùng cache diagnostics, và spend limit của tổ chức làm chốt chặn cuối. Phần tính và dự báo chi phí, cost modeling and forecasting, gồm usage của từng response, cộng vào sổ chi tiêu của tenant, chi phí mỗi việc làm xong, và dự báo theo từng khối việc, đối soát bằng Usage and Cost Analytics API._

- **App CRM**: kèm mã tenant
- **GATEWAY CỦA CÔNG TY**
- **Sổ chi tiêu tenant**: per-tenant budget enforcement
- **Router, cascade, advisor**: model routing and cascades
- **Batch hay realtime**: batch-versus-realtime economics
- **CLAUDE PLATFORM**
- **Prompt cache**: caching, cache diagnostics
- **Messages API**: hoặc Message Batches API
- **Spend limit tổ chức**: chốt chặn cuối
- **TÍNH VÀ DỰ BÁO CHI PHÍ**: cost modeling and forecasting
- **usage**: cộng vào sổ của tenant
- **Chi phí mỗi việc**: tính theo việc làm xong
- **Dự báo theo khối việc**: đối soát bằng Analytics API

## Ví dụ xuyên suốt: CRM cho văn phòng môi giới bất động sản

Một công ty bán phần mềm CRM cho 1.800 văn phòng môi giới bất động sản. Mỗi văn phòng là một tenant, tức một khách hàng của CRM có dữ liệu tách riêng. Công ty dùng Claude API cho ba khối việc, cả ba đều chạy Sonnet 5.5.

- Trợ lý soạn tin trả lời khách ngay trong app, khoảng 20.000 hội thoại mỗi ngày, trung bình 6 lượt mỗi hội thoại, mỗi lượt gửi khoảng 14.000 token đầu vào.
- Tóm tắt cuộc gọi sau mỗi cuộc gọi với khách, khoảng 25.000 cuộc mỗi ngày.
- Chấm điểm 100.000 lead mỗi đêm. Lead là một khách tiềm năng mà đội sales cần biết nên gọi ai trước.

Mọi request tới Claude đều đi qua một gateway, tức một lớp trung gian công ty tự viết, đứng giữa app và API. Gateway ghi lại `usage` của từng response kèm mã tenant. `usage` là phần trong mỗi response cho biết request đó dùng bao nhiêu token mỗi loại. Hoá đơn tháng 10 là 65.700 USD, và quý sau dự kiến có thêm 900 văn phòng.

## Tính và dự báo chi phí

Bạn nên tính chi phí trên mỗi việc làm xong, như một hội thoại, một bản tóm tắt hay một lead đã chấm, chứ không dừng ở giá mỗi token. Lý do là việc làm hỏng vẫn bị tính tiền, rồi bạn còn trả thêm cho lần làm lại.

Muốn tính chi phí một việc, bạn cộng tiền của mọi request thuộc việc đó. Trong `usage` của mỗi request có năm loại token, mỗi loại một giá.

| Loại token | Trường trong `usage` | Giá so với đầu vào thường |
| --- | --- | --- |
| Đầu vào không cache | `input_tokens`, phần prompt nằm sau điểm cache cuối cùng | 1 lần |
| Ghi cache 5 phút | `cache_creation.ephemeral_5m_input_tokens` | 1,25 lần |
| Ghi cache 1 giờ | `cache_creation.ephemeral_1h_input_tokens` | 2 lần |
| Đọc cache | `cache_read_input_tokens` | 0,05 lần trên Opus 5.5 và Sonnet 5.5, 0,025 lần trên Fable 5.2, 0,1 lần trên các model còn lại như Haiku 5.5 |
| Đầu ra | `output_tokens` | Gấp 5 lần đầu vào trên các model hiện nay |

Điểm cache là chỗ bạn đánh dấu trong prompt bằng `cache_control`. Phần prompt từ đầu tới điểm đó được lưu lại để các request sau đọc với giá rẻ.

Tính theo giá Sonnet 5.5 (2 USD mỗi triệu token vào, 10 USD mỗi triệu token ra) và Haiku 5.5 (0,10 USD và 0,50 USD), chi phí tháng 10 của công ty CRM chia theo khối việc như sau.

| Khối việc | Số việc mỗi tháng | Chi phí mỗi việc làm xong | Tháng 10 |
| --- | --- | --- | --- |
| Trợ lý soạn tin, Sonnet 5.5 | 600.000 hội thoại | 0,062 USD | 37.200 USD |
| Tóm tắt cuộc gọi, Sonnet 5.5, gọi đồng bộ | 750.000 cuộc | 0,018 USD | 13.500 USD |
| Chấm điểm lead, Sonnet 5.5 | 3 triệu lead | 0,005 USD | 15.000 USD |

Khi dự báo, bạn lấy số việc dự kiến của từng khối nhân với chi phí mỗi việc của khối đó, chứ không lấy cả hoá đơn nhân với tỉ lệ tăng tenant. Tính riêng như vậy thì khi một khối đổi model hay mất cache, bạn chỉ sửa đúng dòng của khối đó. Thêm 900 văn phòng nghĩa là số việc ở mỗi khối tăng khoảng 50%. Nếu chi phí mỗi việc giữ nguyên, hoá đơn sẽ vào khoảng 98.600 USD mỗi tháng.

Dự báo nào cũng dựa trên vài giả định, và có ba giả định làm lệch dự báo nhiều nhất nên phải ghi rõ.

Giả định đầu tiên là tỉ lệ đọc cache. Hiện trợ lý đọc 93% đầu vào từ cache. Nếu tỉ lệ này tụt xuống 60%, chi phí mỗi hội thoại sẽ tăng hơn gấp đôi, và riêng khối trợ lý đã vượt dự báo khoảng 65.000 USD. Theo dữ liệu của Anthropic, một vòng lặp agent thường đọc khoảng 84% đầu vào từ cache (đây là số trung vị). Nếu hệ thống của bạn dưới khoảng 80%, nhiều khả năng có chỗ đang làm mất cache.

Giả định thứ hai là các hội thoại tốn kém bất thường. Chỉ 3% hội thoại, như những lần môi giới dán cả hợp đồng vào hoặc chat hơn 30 lượt, đã chiếm 38% chi phí của trợ lý. Vì vậy khi cân nhắc một cách tiết kiệm, bạn nên xem nó tác động ra sao lên 10% việc tốn nhất, chứ đừng chỉ nhìn con số trung bình.

Giả định thứ ba là model mỗi khối đang dùng. Chỉ cần chuyển một khối sang model khác là chi phí mỗi việc của khối đó đổi hẳn, nên dự báo phải tính lại cho khối đó. Không chỉ giá mỗi token đổi, số token cũng có thể đổi theo tokenizer, tức bộ tách chữ thành token của model. Các model từ Claude 4.7 trở đi dùng chung một tokenizer mới. Với tokenizer này, cùng một đoạn chữ cho ra nhiều token hơn các model trước đó, thường khoảng 30%, mức chênh cụ thể tuỳ nội dung. Khi dự báo cho một khối chuyển từ model cũ hơn 4.7 sang, bạn đếm lại token của prompt trên chính model mới, chứ đừng dùng số đã đo trên model cũ.

Số liệu để tính lấy từ hai nguồn, mỗi nguồn hợp với một việc.

- Nguồn thứ nhất là Usage and Cost Analytics API, đang ở bản beta và gọi bằng Admin API key. API này trả chi phí chia theo model, workspace (một nhóm API key trong tổ chức), API key, service tier và loại token. Trường `amount` là số tiền sau chiết khấu, còn `list_amount` là số tiền theo giá niêm yết. Số liệu thường có sau khoảng 4 giờ, có khi 24 giờ, và còn được điều chỉnh tới khoảng 7 ngày sau cuối tháng. Vì vậy nguồn này hợp để đối soát và dự báo.
- Các tenant dùng chung API key của gateway, nên API này không tách được chi phí theo tenant. Vì vậy chi phí của từng tenant, và mọi số liệu cần gần thời gian thực, phải lấy từ nguồn thứ hai là `usage` mà gateway đã ghi.

## Chiến lược cache và cache diagnostics

Trong ba giả định trên, tỉ lệ đọc cache là thứ làm lệch hoá đơn nhiều nhất. Trong các phép đo của Anthropic, cache cũng thường là cách giảm chi phí hiệu quả nhất. Chiến lược cache cho cả hệ thống gồm ba quyết định.

Quyết định thứ nhất là xếp prompt sao cho phần giống nhau giữa các request nằm ở đầu. Phần đầu này gọi là prefix, và cache chỉ dùng lại được prefix. Cache so prompt từng byte theo thứ tự `tools`, rồi `system`, rồi `messages`. Chỉ cần một byte khác, toàn bộ phần từ chỗ đó trở về sau sẽ không đọc được từ cache. Vì vậy phần cố định đặt trước, còn phần đổi theo request như giờ hiện tại hay trạng thái hàng đợi thì đặt ở cuối lượt user mới nhất. Nếu cần báo cho model thông tin mới giữa hội thoại, bạn gửi nó trong một message mới thay vì sửa system prompt. Claude Code cũng làm vậy, nó chèn thẻ `<system-reminder>` vào lượt kế tiếp.

Quyết định thứ hai là chọn thời gian sống của cache. Theo mặc định cache sống 5 phút, tính từ lúc request bắt đầu, và được làm mới mỗi lần có request đọc nó. Cache 1 giờ tốn tiền ghi hơn, 2 lần giá đầu vào so với 1,25 lần. Nó đáng dùng khi cứ khoảng 20 lượt lại có một lượt đến sau một khoảng nghỉ từ 5 phút tới 1 giờ, và ít khi nghỉ quá 1 giờ. Nếu các lượt chỉ cách nhau vài giây thì cache 5 phút là đủ. Môi giới hay bỏ dở hội thoại để đi gọi khách rồi quay lại trong vòng một giờ, nên trợ lý của công ty dùng cache 1 giờ.

Quyết định thứ ba là theo dõi tỉ lệ đọc cache sát như theo dõi uptime. Đội làm Claude Code ở Anthropic đặt cảnh báo khi tỉ lệ này tụt và xử lý như một sự cố.

Công ty CRM chưa có cảnh báo đó. Ngày 3/11, một bản deploy đổi cách gom tool từ nhiều module sang dùng một set. Set không giữ thứ tự, nên thứ tự các tool trong danh sách đổi giữa các process của gateway, và request sau thường khác request trước ngay ở phần `tools`. Không ai phát hiện ra lỗi này cho tới ngày 7/11, khi đội tài chính xem báo cáo chi phí.

**Sơ đồ: Thứ tự tool đổi giữa các lượt, và bốn ngày đó công ty tốn thêm khoảng 24.000 USD**

✗ _Từ bản deploy 3/11_
1. Gateway gom tool qua một set nên thứ tự danh sách tool đổi giữa các lượt
   ↓ _phần tools khác đi, và cache diagnostics sẽ báo tools_changed_
2. Mỗi lượt ghi cache lại cả **14.000 token** đầu vào và đọc gần **0%** từ cache
3. **366 USD** cho mỗi 1.000 hội thoại

✓ _Sau khi sửa ngày 7/11_
1. Gateway giữ nguyên danh sách và thứ tự tool ở mọi lượt
   ↓ _phần tools giống hệt nhau giữa các lượt_
2. Mỗi lượt chỉ ghi cache phần mới thêm vào và đọc **93%** đầu vào từ cache
3. **62 USD** cho mỗi 1.000 hội thoại

Trong bốn ngày lỗi, mỗi lượt phải ghi cache lại cả 14.000 token đầu vào, nên cứ 1.000 hội thoại của trợ lý tốn 366 USD. Sau khi sửa, tỉ lệ đọc cache về lại 93% và 1.000 hội thoại chỉ còn tốn 62 USD, đúng mức 0,062 USD mỗi hội thoại trong bảng chi phí tháng 10. Bốn ngày đó tốn thêm khoảng 24.000 USD.

Cache diagnostics là một tính năng của API, giúp tìm ra chỗ prompt bị đổi mà không phải đoán. Để bật, bạn gửi kèm trường `diagnostics` trong mỗi request. Lượt đầu tiên gửi `{"previous_message_id": null}`, các lượt sau gửi `id` của response ngay trước đó. API sẽ so request hiện tại với request trước rồi trả về `cache_miss_reason`, chỉ ra chỗ khác nhau đầu tiên. Nếu công ty CRM bật tính năng này từ trước, thì ngay lượt thứ hai sau bản deploy 3/11 API đã báo `tools_changed`. Trường `type` trong `cache_miss_reason` có thể nhận các giá trị sau.

| `type` | Nghĩa | Cách sửa |
| --- | --- | --- |
| `model_changed` | Đổi model giữa hội thoại, do router, A/B test hay fallback | Giữ một model trong suốt hội thoại có cache |
| `system_changed` | System prompt khác đi, thường do chèn giờ hay ID | Để system prompt cố định, đưa giá trị hay đổi vào lượt user |
| `tools_changed` | Thêm, bớt, đổi thứ tự tool, hay schema serialize không ổn định | Giữ cùng danh sách, cùng thứ tự tool, và sắp xếp key |
| `messages_changed` | Lịch sử bị cắt, bị sửa, hay gửi lại khác byte | Chỉ nối thêm, gửi lại nội dung assistant và tool result y nguyên |
| `previous_message_not_found` | Request trước không bật diagnostics, khác workspace, hay đã quá lâu | Lý do này không chứng tỏ request đã đổi, nên bật diagnostics cho mọi request |
| `unavailable` | Không so được, ví dụ vì đổi `thinking`, `output_config`, `tool_choice` hay header beta | Giữ các tham số đó cố định suốt hội thoại |

Bạn nên đọc diagnostics cùng với `cache_read_input_tokens`. Nếu diagnostics trả `null`, tức không thấy request nào đổi, mà số token đọc từ cache vẫn gần 0, thì request vẫn giống hệt nhau. Khi đó hoặc cache đã hết hạn, hoặc prompt ngắn hơn mức tối thiểu để được cache, là 512 token trên Opus 5.5, Sonnet 5.5, Haiku 5.5 và Fable 5.2. Bạn có thể bật diagnostics cả khi prompt chứa dữ liệu khách, vì nó chỉ lưu hash và số token ước lượng, không lưu nội dung prompt.

> **Trong đề chọn gì**
>
> Nếu tỉ lệ đọc cache tụt ngay sau một bản deploy, hãy tìm chỗ phần đầu prompt bị đổi, bằng cache diagnostics hoặc bằng cách so hai request liên tiếp. Đổi thời gian sống của cache hay đổi model đều không giúp được gì, vì prefix đã khác đi rồi.

## Chia việc cho nhiều model Claude

Sau cache, cách giảm chi phí tiếp theo là để model rẻ hơn làm bớt việc. Bốn model hiện nay xếp từ rẻ tới đắt là Haiku 5.5, Sonnet 5.5, Opus 5.5 và Fable 5.2. Nhưng trước khi ghép hai model, hãy thử các mức effort của model đang dùng. Effort là tham số chỉnh xem model nghĩ và làm nhiều hay ít, và nhiều khi chỉ cần hạ effort là đã đủ rẻ. Bạn chỉ nên giữ cách ghép hai model nếu nó đạt điểm eval (điểm trên bộ bài kiểm chất lượng của bạn) cao hơn một model đơn lẻ có cùng chi phí, ở mọi mức effort. Khi so các lựa chọn, hãy tính chi phí trên mỗi việc làm xong bằng lưu lượng thật của hệ thống mình, đừng so giá mỗi token.

Có ba cách dùng nhiều model, mỗi cách hợp với một kiểu việc.

| Cách | Ai quyết khi nào dùng model mạnh | Hợp khi |
| --- | --- | --- |
| **Router** chọn model ngay lúc bắt đầu | Code của bạn, dựa theo loại việc hay độ khó đoán trước được | Các khối việc tách bạch, như chấm lead, tóm tắt, chat |
| **Cascade** chạy model rẻ trước, chỉ làm lại phần hỏng bằng model mạnh hơn | Bộ kiểm tự động (verifier), tức code kiểm kết quả | Kết quả kiểm được bằng schema, luật cứng hay test |
| **Advisor tool** (beta) để model rẻ chạy vòng lặp và tự hỏi model mạnh | Chính model rẻ | Việc nhiều lượt, chỉ khó ở vài chỗ quyết định |

Nếu dùng router, hãy chọn model một lần cho cả hội thoại, đừng chọn lại ở từng lượt. Mỗi model có cache riêng. Đổi model giữa chừng thì phải ghi lại cả prefix cho model mới. Khi quay về model cũ mà cache đã hết hạn, bạn lại phải ghi thêm một lần nữa. Cứ thế, phần tiền tiết kiệm được nhờ model rẻ bị ăn dần. Nếu một bước cần model khác, hãy giao bước đó cho một subagent kèm bản tóm tắt ngắn. Subagent chạy trong hội thoại riêng, nên cache của hội thoại chính vẫn giữ được.

Chấm điểm lead là chỗ hợp với cascade, vì kết quả kiểm được bằng code. Điểm phải có lý do, chỉ được trích những trường có trong hồ sơ lead, và không được trái luật cứng, ví dụ lead đã ký hợp đồng thì không được xếp "nóng". Công ty thử trên 500 lead mà đội sales đã tự chấm sẵn. Trước đó công ty đã thử hạ effort của Sonnet 5.5, nhưng ở mức đủ rẻ thì kết quả khớp với đội sales kém hẳn, nên mới chuyển sang cascade. Kết quả của cascade khớp với đội sales ở 93% số lead, còn chạy toàn bộ bằng Sonnet 5.5 thì khớp 94%. Mức chênh 1 điểm này nhỏ hơn độ dao động giữa hai lần chạy cùng một cấu hình, nên có thể coi chất lượng hai cách là ngang nhau.

**Sơ đồ: Haiku chấm trước và chỉ 9% lead lên Sonnet, nên chi phí tháng giảm từ 15.000 còn 2.190 USD**

Mỗi tháng có 3 triệu lead. Haiku 5.5 chấm hết số đó với effort low, mỗi lead tốn 0,00028 USD, cả tháng khoảng 840 USD. 91% lead qua bộ kiểm ngay ở bước này. 9% còn lại, tức 270.000 lead, được Sonnet 5.5 chấm lại với giá 0,005 USD mỗi lead, thêm 1.350 USD. Cộng lại là 2.190 USD mỗi tháng, thay vì 15.000 USD khi để Sonnet 5.5 chấm toàn bộ.

Cascade chỉ dùng được khi có đủ hai điều kiện. Thứ nhất, bộ kiểm phải đáng tin, vì nếu nó cho qua kết quả sai thì lỗi sẽ lọt tới khách. Thứ hai, bạn chấp nhận được việc những việc bị loại mất gấp đôi thời gian, vì phải chạy hai lần. Cách này cũng áp được cho effort trên cùng một model. Trong thử nghiệm của Anthropic, chạy mọi việc ở `low` rồi chạy lại phần hỏng ở `high` rẻ hơn khoảng 40% so với chạy hết ở `high`, mà tỉ lệ đạt vẫn như nhau.

Advisor tool khác cascade ở chỗ không có bộ kiểm. Model rẻ, gọi là executor, tự quyết khi nào cần hỏi model mạnh, nên advisor chỉ có ích nếu executor biết hỏi đúng lúc. Riêng phần định nghĩa tool advisor đã tốn khoảng 1.000 token ở mỗi request, kể cả khi không được gọi. Vì vậy bạn nên đo trước xem trên việc thật của mình executor hỏi bao nhiêu lần, rồi mới tính xem có lời không.

> **Trong đề chọn gì**
>
> Khi gặp câu hỏi về đổi hay ghép model để giảm chi phí, hãy chọn đáp án so bằng chi phí mỗi việc làm xong, và có xét tới 10% việc tốn nhất. Đáp án chọn model theo giá mỗi token, hay chuyển từng lượt sang model rẻ nhất, là sai.

## Batch hay realtime

Hai khối tóm tắt và chấm lead không phải lúc nào cũng cần kết quả ngay, nên còn một cách tiết kiệm nữa là chạy batch. Message Batches API giảm 50% giá mọi loại token, kể cả token cache. Đổi lại, kết quả có thể về bất cứ lúc nào trong 24 giờ, dù phần lớn batch xong dưới 1 giờ. Mức giảm của batch được áp thêm lên mức giảm của cache. Để chia việc, bạn hỏi xem có ai đang chờ kết quả này không, và họ chờ được bao lâu.

| Khối việc | Ai chờ | Quyết định |
| --- | --- | --- |
| Trợ lý soạn tin | Môi giới đang nhìn màn hình | Realtime |
| Tóm tắt cuộc gọi có lịch hẹn xem nhà trong ngày (15%) | Môi giới cần đọc trước buổi hẹn | Realtime |
| Tóm tắt các cuộc gọi còn lại (85%) | Môi giới đọc trước lần gọi sau, thường là hôm sau | Batch mỗi giờ |
| Chấm điểm lead | Đội sales xem lúc 8:00 sáng | Batch lúc 0:30 |

Chia như vậy thì chi phí khối tóm tắt giảm từ 13.500 USD xuống khoảng 7.760 USD mỗi tháng. Khối chấm lead vốn đã chạy ban đêm, nên có thể đưa cả hai bước của cascade vào batch. Bước Haiku chạy trước, xong thì gửi tiếp bước Sonnet. Nhờ vậy chi phí sau cascade giảm tiếp từ 2.190 USD xuống khoảng 1.095 USD. Lead vẫn không qua bộ kiểm sau bước Sonnet được đưa vào danh sách để đội sales xem tay.

Khi tính tiền cho batch, bạn cần để ý ba chuyện. Thứ nhất, cache trong batch chỉ là best-effort, tức có cache thì dùng chứ không bảo đảm, vì các request chạy song song và không theo thứ tự. Nên đặt cache 1 giờ cho phần prompt dùng chung, để các request chạy sau vẫn còn cache mà đọc. Thứ hai, batch không dùng chung được với fast mode (chế độ sinh chữ nhanh hơn với giá cao hơn), message threads (tính năng beta giữ hội thoại ở phía server) hay session của Managed Agents (agent do Anthropic chạy hộ). Thứ ba, nếu việc có hạn chót thì phải chuẩn bị đường lui. Một cách hay dùng là khi gần tới hạn mà batch chưa xong, bạn huỷ batch rồi gửi phần còn lại bằng request đồng bộ. Phần đã chạy vẫn bị tính tiền và vẫn trả kết quả, còn request chưa kịp chạy thì không bị tính. Vì vậy dự báo nên tính cả tiền chạy đồng bộ cho phần có thể phải gửi lại này. Với khối chấm lead, đội gửi batch Haiku lúc 0:30 và đặt mốc kiểm lúc 5:30. Nếu tới mốc đó batch chưa xong, đội huỷ batch và chạy đồng bộ phần còn lại để kịp 8:00. Mỗi batch tối đa 100.000 request hoặc 256 MB, mà 100.000 lead mỗi đêm vừa chạm mốc này, nên đội chia làm hai batch.

## Ngân sách theo tenant

Tháng 11, một văn phòng nối script tự động vào API công khai của CRM và tạo 4.000 hội thoại trong một đêm, tiêu hết 310 USD. Trong khi đó, gói văn phòng này mua chỉ dành 60 USD mỗi tháng cho chi phí AI.

Claude Platform không chặn được chi tiêu theo từng tenant, nên việc này ứng dụng phải tự làm. Các mức chặn có sẵn của Claude Platform đều rộng hơn một tenant.

| Mức chặn | Phạm vi | Khi chạm ngưỡng |
| --- | --- | --- |
| Spend limit bạn tự đặt cho tổ chức | Cả tổ chức, theo tháng | Request bị trả lỗi 400 `invalid_request_error` ("You have reached your specified API usage limits"), và phải sang tháng mới mở lại nếu bạn không nâng mức |
| Hạn mức chi tiêu theo usage tier, tức mức Anthropic tự xếp cho tổ chức dựa trên lịch sử sử dụng | Cả tổ chức, do Anthropic đặt | Lỗi 429 với `enforced_spend_limit_reached`, không có `retry-after`, nên retry cũng vô ích |
| Spend limit của workspace | Một workspace, mặc định mỗi tổ chức có tối đa 1.000 workspace | Lỗi 400 với "...workspace API usage limits" |
| Session budget của Managed Agents (beta) | Một session, tính theo giá niêm yết (`max_list_cost`) | Session tạm dừng (idle) với `budget_reached`, nâng budget thì chạy tiếp. Request đang chạy vẫn chạy xong nên có thể vượt trần một chút |

Với 1.800 tenant, công ty không thể tạo cho mỗi tenant một workspace. Còn nếu nhiều văn phòng dùng chung một workspace, chặn workspace đó thì mọi văn phòng trong đó cùng mất trợ lý.

Vì vậy công ty CRM tự ghi sổ chi tiêu cho từng tenant ngay trong gateway, tức một bảng cộng dồn số tiền mỗi tenant đã tiêu trong tháng. Sau mỗi response, gateway tính tiền năm loại token trong `usage` theo giá niêm yết rồi cộng vào sổ của tenant đó. Trước khi mở một hội thoại mới, gateway đọc sổ để quyết định theo các bước sau.

**Sơ đồ: Gateway kiểm sổ tenant khi mở hội thoại mới và sau mỗi lượt, nên gói 60 USD không trôi tới 310 USD**
_Ngân sách theo tenant. Sổ chi tiêu của tenant nằm trong gateway, gói 60 USD mỗi tháng, cộng dồn từ usage. Gateway kiểm sổ ở hai lúc. Khi mở hội thoại mới, gateway đọc sổ. Tenant đã dùng 100% hạn mức thì không mở hội thoại mới và báo quản lý văn phòng nâng gói. Từ 80% trở lên thì vẫn mở, hội thoại mới dùng effort low và gửi cảnh báo cho quản lý. Dưới 80% thì mở bình thường. Sau mỗi lượt, khi lượt hiện tại đã chạy xong, gateway tính tiền năm loại token và cộng vào sổ. Hội thoại vượt 1 USD thì dừng, kèm gợi ý mở hội thoại mới. Tenant vừa chạm 100% thì các hội thoại đang dở của tenant đó cũng dừng. Spend limit của tổ chức đặt cao hơn tổng hạn mức các gói khoảng 20%, làm chốt chặn cuối khi sổ có lỗi._

- **Sổ chi tiêu của tenant**: gói 60 USD mỗi tháng, cộng dồn từ usage
- đọc sổ
- cộng tiền của lượt
- **KHI MỞ HỘI THOẠI MỚI**
- **100%**: đã dùng hết
- **Không mở**: báo quản lý nâng gói
- **Từ 80%**: trở lên
- **Mở với effort low**: cảnh báo cho quản lý
- **Dưới 80%**
- **Mở bình thường**
- **SAU MỖI LƯỢT**
- **Lượt hiện tại chạy xong**: gateway tính tiền năm loại token
- **Vượt 1 USD**: mỗi hội thoại
- **Dừng hội thoại**: gợi ý mở hội thoại mới
- **Chạm 100%**: hạn mức tenant
- **Dừng hội thoại dở**: mọi hội thoại của tenant
- **Spend limit của tổ chức là chốt chặn cuối**: Công ty đặt mức này cao hơn tổng hạn mức các gói khoảng 20%, phòng khi sổ có lỗi.

Sau mỗi lượt, gateway còn kiểm thêm hai điều. Hội thoại nào đã vượt 1 USD thì dừng, kèm gợi ý mở hội thoại mới. Tenant nào vừa chạm 100% hạn mức thì các hội thoại đang dở của tenant đó cũng dừng. Ở cả hai trường hợp, gateway vẫn để lượt hiện tại chạy xong rồi mới dừng. Nếu cắt ngang giữa lượt, token đã dùng vẫn bị tính tiền mà người dùng không nhận được câu trả lời. Gateway cũng chỉ hạ effort khi mở hội thoại mới, vì đổi effort giữa chừng có thể làm mất cache. Ngoài sổ của gateway, công ty đặt spend limit của tổ chức cao hơn tổng hạn mức các gói khoảng 20%, để làm chốt chặn cuối khi sổ có lỗi.

> **Bẫy đề**
>
> Một văn phòng có gói 60 USD mỗi tháng đã tiêu 310 USD trong một đêm. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Mỗi văn phòng một workspace có spend limit riêng**. Cách này nghe như để Claude Platform chặn hộ. Nhưng mỗi tổ chức mặc định chỉ có tối đa 1.000 workspace, ít hơn 1.800 văn phòng, chưa kể 900 văn phòng sắp thêm.
> - **Chặn tenant dựa trên báo cáo của Usage and Cost Analytics API**. Dùng số liệu chính thức có vẻ chắc chắn. Nhưng mọi tenant dùng chung API key của gateway nên API không tách được chi phí theo tenant, và số liệu thường về chậm khoảng 4 giờ, có khi tới 24 giờ. Tới lúc có số thì script đã chạy suốt đêm rồi.
> - **Hạ `max_tokens` cho tenant đó**. Nghe như đặt được trần chi tiêu. Nhưng model không biết `max_tokens` là bao nhiêu, nên nó không viết ngắn lại. Câu trả lời chỉ bị cắt giữa chừng, token đã sinh vẫn bị tính tiền, và script vẫn mở đủ 4.000 hội thoại.
>
> **Chọn:** sổ chi tiêu theo tenant ngay trong gateway, tính từ `usage` của từng response, có ngưỡng cảnh báo và ngưỡng chặn hội thoại mới. Spend limit của tổ chức hay workspace chỉ làm chốt chặn cuối.

> **Ý chính**
>
> Hãy tính chi phí trên mỗi việc làm xong và dự báo riêng cho từng khối việc, ghi rõ ba giả định là tỉ lệ đọc cache, phần việc tốn nhất và model đang dùng. Cache thường là chỗ tiết kiệm lớn nhất, nên giữ prefix ổn định, theo dõi tỉ lệ đọc cache như uptime và dùng cache diagnostics khi nó tụt. Chọn model một lần cho cả hội thoại, chỉ dùng cascade khi có bộ kiểm đáng tin, và đưa việc không ai chờ sang batch. Chi tiêu của từng tenant thì gateway tự ghi sổ và tự chặn, còn spend limit của Claude Platform chỉ là chốt chặn cuối.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 6](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Optimizing for cost and intelligence (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
3. [Pricing (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/pricing)
4. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
5. [Cache diagnostics (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/cache-diagnostics)
6. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
7. [Usage and Cost Analytics API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api)
8. [Rate limits, spend limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
9. [Workspaces (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/workspaces)
10. [Advisor tool (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool)
11. [Session budgets (Claude Managed Agents Docs)](https://platform.claude.com/docs/en/managed-agents/budgets)
12. [Lessons from building Claude Code: Prompt caching is everything (Claude Blog)](https://claude.dev/blog/lessons-from-building-claude-code-prompt-caching-is-everything/)
13. [Reducing cost and improving performance with Claude Platform (Claude Blog)](https://claude.com/resources/articles/reducing-cost-and-improving-performance-with-claude-platform)
14. [Token counting (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/token-counting)
