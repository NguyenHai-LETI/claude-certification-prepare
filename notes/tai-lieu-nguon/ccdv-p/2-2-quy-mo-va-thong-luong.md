---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-2-quy-mo-va-thong-luong
ngay_tai: 2026-11-27
tieu_de: Quy mô và thông lượng - rate limit, hàng đợi, batch và quota cho nhiều tenant
---

Domain 2: Production Integration, Reliability, and Knowledge Grounding · Task 2.2

# Quy mô và thông lượng - rate limit, hàng đợi, batch và quota cho nhiều tenant

Biết thứ gì làm hệ thống nghẽn khi tải lớn (rate limit, tốc độ sinh token hay chi phí), rồi tách làn, đưa việc không gấp sang batch và đặt quota từng tenant.

- 19 phút đọc
- Đối chiếu docs 24/11/2026
- 12 nguồn

## Đọc xong bạn nắm được

- Đọc biểu đồ và header rate limit để biết đang chạm RPM, ITPM, OTPM, ramp limit hay chỉ là request chạy chậm
- Xử lý được nhiều token hơn trong cùng limit nhờ token đọc từ cache không tính vào ITPM, trước khi xin thêm limit
- Dựng hàng đợi có ưu tiên và backpressure để một tenant tăng tải không làm hỏng các tenant khác
- Thiết kế pipeline Message Batches API, kể cả khi batch chưa xong lúc tới hạn
- Tính công suất lúc cao điểm và biết giới hạn khác nhau giữa Claude API và các nền tảng cloud

Khi tải còn nhỏ, rate limit, tức số request và số token tối đa bạn được gửi mỗi phút, chỉ là một con số trong Console (trang quản lý tài khoản Claude API). Khi hàng nghìn khách hàng cùng dùng một tính năng có Claude, nó thành bài toán thiết kế. Bạn phải quyết việc nào cần trả lời ngay, việc nào chờ được, mỗi khách được dùng bao nhiêu, và lúc cao điểm thì hạn mức nào sẽ cạn trước.

Bài này giúp bạn nhận ra hệ thống đang vướng ở đâu. Có thể là chạm rate limit, có thể là model sinh chữ quá chậm, cũng có thể chỉ là tốn tiền cho những việc không ai ngồi chờ. Với mỗi trường hợp, bài chỉ ra nên chỉnh ở chỗ nào.

Tên task trong đề là **Scale and Throughput Management**. Nó gồm chiến lược rate limit (**rate-limit strategy**), hàng đợi và backpressure (**queueing and backpressure**), thiết kế pipeline batch (**batch pipeline design**), quota và cách ly cho nhiều tenant (**multi-tenant quota and isolation**), lập kế hoạch công suất (**capacity planning**), và nhận ra ràng buộc chính đang là rate limit, thông lượng token hay chi phí của batch. Các loại lỗi 429 và cách retry có ở bài 2.1. Phần cơ bản về Message Batches API có ở bài 2.3 của CCDV-F.

**Sơ đồ: Việc gấp, việc chờ được và việc không ai chờ đi ba đường riêng, mỗi đường vướng một ràng buộc khác**
_Bản đồ bài: việc của các tenant đi qua dispatcher có quota và hai làn, tới workspace, rate limit và model; việc không ai chờ đi qua Batches API_

- **Tenant**
- **Có người chờ**: trả lời ngay
- **Chờ được**: không gấp
- **Không ai chờ**: chạy ban đêm
- **DISPATCHER**: bạn tự dựng
- quota từng tenant
- **Làn tức thì**: đi trước
- **Làn nền**: dùng phần dư
- **CLAUDE API**: một organization
- **rate limit**: RPM, ITPM, OTPM, ramp
- **realtime**: workspace
- **bulk**: workspace
- cache-aware ITPM
- bỏ token đọc cache
- **Claude**: token
- throughput
- backpressure khi gặp 429
- gửi cả batch, rẻ 50%
- **Batches API**: batch economics
- **Capacity planning**: so tải cao điểm của từng model với RPM, ITPM, OTPM

## Ví dụ xuyên suốt: nền tảng phần mềm quản lý nhà hàng

Một công ty bán phần mềm quản lý nhà hàng cho 3.000 nhà hàng, thuộc khoảng 2.200 khách hàng. Mỗi khách hàng, dù là quán lẻ hay cả một chuỗi nhiều chi nhánh, là một **tenant**, tức một khách dùng chung hệ thống với mọi khách khác nhưng có dữ liệu riêng.

Công ty có ba tính năng dùng Claude, cùng chạy dưới một organization (tài khoản cấp công ty trên Claude API). Organization này ở Scale tier. Rate limit chia thành các bậc gọi là tier, gồm Start, Build, Scale và Custom, bậc càng cao thì limit càng lớn.

- **Gợi ý trả lời đánh giá.** Chủ quán bấm nút rồi chờ Claude gợi ý câu trả lời cho đánh giá của thực khách. Tính năng này dùng Sonnet 5.5. Giờ trưa có khoảng 1.200 request mỗi phút. Mỗi request có 6.000 token input, gồm 500 token hồ sơ nhà hàng, 4.500 token chỉ dẫn và ví dụ dùng chung, 1.000 token đánh giá, và trả về 300 token output.
- **Dịch menu** sang 8 ngôn ngữ, cũng dùng Sonnet 5.5. Hệ thống gọi đồng bộ, tức gửi request rồi chờ kết quả ngay như khi có người đang chờ.
- **Phân loại đánh giá ban đêm.** Mỗi đêm hệ thống dùng Haiku 5.5 phân loại khoảng 400.000 đánh giá. Mỗi request có 1.200 token input và 150 token output.

## Ràng buộc nào đang chặn tải

Đúng 11:00, một chuỗi 600 chi nhánh tải lên menu mùa mới gồm 54.000 món, và hệ thống dịch ngay với khoảng 3.000 request mỗi phút, mỗi request dịch một món sang cả 8 ngôn ngữ. Mỗi request có 1.500 token input và 700 token output. Lượt gửi đầu mất khoảng 18 phút, rồi retry của các request bị 429 kéo dài thêm, nên trong 40 phút sau đó, 18% request gợi ý trả lời của mọi nhà hàng bị trả lỗi 429, tức lỗi vượt rate limit. Độ trễ p95 (95% request nhanh hơn mức này) tăng từ 4 lên 31 giây. Trưởng nhóm đề xuất xin nâng rate limit.

Trước khi xin nâng, cần biết thứ gì đang thật sự giới hạn hệ thống, gọi là ràng buộc chính (**binding constraint**). Chiến lược rate limit bắt đầu từ đó, và có ba khả năng.

- Hệ thống chạm rate limit.
- Chưa chạm limit, nhưng model sinh token chậm nên từng request mất nhiều thời gian. Đây là chuyện thông lượng token (**token throughput**).
- Không ai chờ kết quả, và vấn đề chỉ là tiền. Đây là chuyện chi phí của batch (**batch economics**).

Mỗi khả năng có cách chữa riêng.

Rate limit của Messages API tính riêng cho từng dòng model theo ba con số, là request mỗi phút (**RPM**), token input mỗi phút (**ITPM**) và token output mỗi phút (**OTPM**). Ở Scale tier, Sonnet 5.5 và Haiku 5.5 mỗi model có 13.000 RPM, 10 triệu ITPM và 2 triệu OTPM. Mỗi model đếm riêng, nên Haiku dùng nhiều cũng không ăn vào phần của Sonnet. Có ba điều về cách API đếm mà người ta hay bỏ qua.

- API đếm theo kiểu **token bucket**. Hãy hình dung một cái xô được đổ đầy lại đều đặn từng chút, chứ không phải đầu mỗi phút mới đổ đầy một lần. API cũng có thể kiểm theo khoảng ngắn hơn một phút, ví dụ 60 RPM thành 1 request mỗi giây. Vì vậy, dù tổng cả phút chưa vượt, một đợt request dồn trong vài giây vẫn có thể bị 429.
- `max_tokens`, số token output tối đa bạn cho phép, không tính vào OTPM. OTPM chỉ đếm số token model thật sự sinh ra.
- **Ramp limit** giới hạn tốc độ tăng tải. Mỗi phút, bạn chỉ được gửi nhiều hơn mức cao nhất gần đây thêm một step, là mức tăng mà Anthropic đặt riêng cho từng model. Nếu tải tăng vọt, bạn sẽ nhận 429 `ramp_limit_exceeded` dù vẫn còn dưới rate limit.

Mỗi response của API có header như `anthropic-ratelimit-input-tokens-remaining` hay `anthropic-ratelimit-requests-remaining`, cho biết bạn còn bao nhiêu token hay request trước khi chạm limit. Trang Usage của Console thì vẽ biểu đồ token input và output so với đường giới hạn. Bảng sau cho biết thấy dấu hiệu nào thì ràng buộc chính là gì, và nên chỉnh ở đâu.

| Dấu hiệu | Ràng buộc chính | Chỉnh ở đâu |
| --- | --- | --- |
| 429, biểu đồ input chạm giới hạn | ITPM | Cache thêm phần prompt dùng chung, dời việc không gấp sang batch, rồi mới xin nâng |
| 429, biểu đồ output chạm giới hạn | OTPM | Rút ngắn output, tách việc sinh nhiều chữ sang batch |
| 429, số request chạm giới hạn trong khi token còn xa giới hạn | RPM | Gộp nhiều việc nhỏ vào ít request hơn |
| 429 `ramp_limit_exceeded` dù còn xa giới hạn | Ramp limit | Giữ mức đang chạy được, tăng một step mỗi phút |
| Không có 429, request chạy quá lâu | Tốc độ sinh token | Rút ngắn output, chạy song song, hoặc fast mode |
| Không ai chờ kết quả, chi phí là vấn đề | Chi phí | Message Batches API, rẻ 50% |

Chạm RPM trước thường xảy ra khi hệ thống gửi rất nhiều request ngắn, mỗi request chỉ làm một việc nhỏ, chẳng hạn gửi mỗi đánh giá một request để phân loại. Khi đó số request chạm giới hạn trong lúc lượng token vẫn còn xa giới hạn. Gộp nhiều việc vào một request sẽ giảm số request đi nhiều lần, còn tổng token thì không tăng.

Fast mode ở hàng "request chạy quá lâu" là một chế độ bật bằng `speed: "fast"`. Nó sinh output nhanh tới 2,5 lần, đổi lại giá gấp đôi và có rate limit riêng, và hiện chỉ có trên vài model như Opus 5.5. Fast mode nhằm giảm độ trễ, không phải cách chữa lỗi 429, và Sonnet 5.5 cũng chưa có fast mode.

Quay lại sự cố 11:00. Cả ITPM lẫn OTPM của Sonnet 5.5 đều vượt. ITPM lên khoảng 10,8 triệu trên giới hạn 10 triệu, trong đó 6,3 triệu là của gợi ý trả lời và 4,5 triệu của dịch menu. OTPM lên khoảng 2,46 triệu trên giới hạn 2 triệu. Gốc của vấn đề là việc dịch menu, vốn chờ được, đang tranh hạn mức với việc gợi ý trả lời, vốn có người đang chờ. Nâng limit thì lần sau một chuỗi lớn hơn tải menu, hệ thống vẫn vỡ như cũ.

> **Trong đề chọn gì**
>
> Gặp câu hỏi về 429 lúc tải cao, trước hết tìm xem RPM, ITPM, OTPM hay ramp limit chạm trước, hay thật ra không có 429 mà request chỉ chạy chậm. Chọn đáp án dùng cách bạn tự làm được trước, như cache để tăng thông lượng, hoặc giữ mức tải và tăng từng step nếu vướng ramp limit, rồi mới xin nâng limit. Đáp án giảm `max_tokens` để khỏi chạm OTPM là sai, vì `max_tokens` không tính vào OTPM.

## Token đọc từ cache không tính vào ITPM

Prompt caching cho phép API lưu lại phần đầu prompt đã xử lý, để request sau dùng lại. Với hầu hết model, ITPM **chỉ đếm token input không lấy từ cache**. Trong `usage` của response, `input_tokens` và `cache_creation_input_tokens` (token ghi vào cache) bị tính vào ITPM, còn `cache_read_input_tokens` (token đọc lại từ cache) thì không. Ví dụ, với 2 triệu ITPM và 80% token input được đọc từ cache, bạn xử lý được 10 triệu token input mỗi phút. Ramp limit cũng không đếm token đọc từ cache. Cách đếm này gọi là **cache-aware ITPM**.

Request chỉ đọc được từ cache khi phần đầu (prefix) của nó giống hệt một request gửi gần đây, và cache mặc định chỉ giữ 5 phút. Prompt gợi ý trả lời lại đặt hồ sơ nhà hàng ngay ở đầu, nên prefix của mỗi quán mỗi khác. Kết quả là request chỉ đọc được từ cache khi chính quán đó bấm lại trong vòng 5 phút. Tỉ lệ đọc từ cache vì vậy chỉ khoảng 12%, và gợi ý trả lời tính vào ITPM khoảng 6,3 triệu token mỗi phút.

**Sơ đồ: Phần dùng chung đứng đầu prompt thì token tính vào ITPM mỗi phút giảm từ 6,3 triệu còn 1,8 triệu**
_Cùng một prompt gợi ý trả lời 6.000 token xếp theo hai thứ tự, kèm thanh ITPM so với giới hạn 10 triệu của Sonnet 5.5_

- **HỒ SƠ NHÀ HÀNG ĐỨNG ĐẦU**: prefix mỗi quán mỗi khác
- **Hồ sơ**
- **Chỉ dẫn và ví dụ dùng chung**
- **Đánh giá**: 500
- 4.500 token
- 1.000
- Chỉ đọc được cache khi chính quán đó gọi lại trong 5 phút, tỉ lệ khoảng 12%
- **6,3 triệu token mỗi phút tính vào ITPM**: giới hạn 10 triệu
- **PHẦN DÙNG CHUNG ĐỨNG ĐẦU**: mọi tenant chung một prefix
- **Chỉ dẫn và ví dụ dùng chung**
- **Hồ sơ**
- **Đánh giá**: cache_control
- 4.500 token đọc từ cache
- 500
- 1.000
- Mọi tenant đọc chung một prefix, tỉ lệ đọc từ cache khoảng 75%
- **1,8 triệu token mỗi phút tính vào ITPM**: giới hạn 10 triệu

Đội đảo thứ tự, đưa 4.500 token chỉ dẫn dùng chung lên đầu và đặt `cache_control` ở cuối phần đó để API cache tới đúng chỗ ấy. Giờ mọi tenant dùng chung một prefix, nên tỉ lệ đọc từ cache lên khoảng 75%, và token tính vào ITPM mỗi phút giảm từ 6,3 triệu còn 1,8 triệu. Chi phí cũng giảm theo, vì với Sonnet 5.5, token đọc từ cache chỉ tốn 5% giá token input thường. Phần được cache phải dài ít nhất 512 token. Cache còn tách theo workspace, chuyện này có ở mục nhiều tenant.

## Hàng đợi và backpressure

Cache giúp tăng thông lượng, nhưng chưa giải quyết được chuyện việc không gấp chen vào việc gấp. Để làm việc đó cần hàng đợi (**queueing**) và **backpressure**, tức khi phía sau đã quá tải thì phía trước phải chậm lại hoặc từ chối, thay vì đẩy thêm việc. Claude API không có sẵn hàng đợi. Phần dưới là cách làm phổ biến, kết hợp với cách API xử lý ramp limit và retry.

SDK của Anthropic tự retry lỗi 429 và 5xx hai lần, nên mỗi lần worker gọi có thể thành 3 request. Nếu worker tự gọi tối đa 3 lượt, một việc thành 3 × 3 = 9 request, đúng lúc API đang báo bạn gửi chậm lại. Vì vậy nên đặt một dispatcher (bộ điều phối) đứng giữa ứng dụng và API, làm bốn việc sau.

- Chia việc vào hai **làn**, tức hai hàng đợi riêng. Làn tức thì dành cho việc có người đang chờ, làn nền cho việc chờ được. Làn nền chỉ dùng phần hạn mức mà làn tức thì chưa dùng tới.
- Đặt quota cho từng tenant bằng một token bucket riêng trong ứng dụng, để chuỗi 600 chi nhánh không dùng mất phần của các quán khác.
- Theo dõi header `anthropic-ratelimit-*-remaining` để giảm tốc trước khi chạm limit. Khi bị 429, chờ đúng số giây trong header `retry-after` rồi mới gửi lại.
- Từ chối sớm khi hàng đợi quá dài. Ví dụ, nếu một việc ở làn tức thì đã chờ quá 10 giây, hệ thống báo "đang bận" cho chủ quán, hoặc trả một câu gợi ý đơn giản hơn.

**Sơ đồ: Dịch menu chung làn với gợi ý trả lời: một tenant làm 18% request của mọi quán bị 429 suốt 40 phút**

Chuỗi tải menu lên lúc 11:00. Tới 11:18 lượt gửi đầu mới xong, và suốt 18 phút đó OTPM của Sonnet 5.5 ở khoảng 2,46 triệu, vượt giới hạn 2 triệu. Retry còn kéo dài tới 11:40 mới dừng, vì mỗi món có thể thành tới 9 request.

Giới hạn 600.000 OTPM của làn nền không nằm trong dispatcher mà đặt bằng workspace, như mục sau.

## Nhiều tenant: quota và cách ly

Quota theo tenant ở dispatcher là phần công ty tự làm. Phía Claude API cũng có một công cụ để chia hạn mức và cách ly tải, đó là **workspace**. Workspace là một nhóm con trong organization. API key gắn với một workspace thì request gửi bằng key đó chạy trong workspace ấy, và chỉ thấy tài nguyên của workspace ấy. Có năm điều cần biết khi dùng workspace cho nhiều tenant.

- Bạn có thể đặt cho mỗi workspace spend limit (mức chi tối đa) và rate limit cho từng model, và chỉ mức thấp hơn mức của organization mới có tác dụng. Đặt cao hơn thì limit của organization vẫn là mức được áp.
- Mỗi organization mặc định có tối đa 1.000 workspace, trong khi công ty có khoảng 2.200 tenant, nên không thể cho mỗi tenant một workspace. Workspace hợp để tách theo làn, theo môi trường như staging, hoặc tách riêng vài khách rất lớn. Quota cho từng tenant thì vẫn phải tự đặt trong ứng dụng.
- Trên Claude API, Claude Platform on AWS và Microsoft Foundry, request ở workspace này không đọc được cache của workspace khác. Trên Amazon Bedrock và Claude Models on Google Cloud (Google managed), cache dùng chung trong cả organization. Vì vậy, chia càng nhiều workspace thì càng ít request đọc được từ cache, và bạn mất bớt phần thông lượng có được nhờ cache-aware ITPM.
- Khi workspace chạm spend limit, API trả lỗi 400 `invalid_request_error`, không phải 429. Code chỉ xử lý 429 sẽ không nhận ra mình đã hết tiền.
- Muốn biết mỗi tenant tốn bao nhiêu, bạn phải tự ghi `usage` của mỗi response vào log, kèm mã tenant. Usage and Cost Analytics API, API báo cáo mức dùng và chi phí của Anthropic, nhóm số liệu được theo các chiều như workspace, API key, model hay actor, nhưng không có chiều nào là tenant của bạn.

Công ty nhà hàng chia ba workspace là `realtime`, `bulk` (dịch menu và phân loại ban đêm) và `staging`. Workspace `bulk` được đặt OTPM của Sonnet 5.5 là 600.000. Đó chính là giới hạn của làn nền ở sơ đồ hàng đợi, nhờ vậy làn tức thì luôn còn ít nhất 1,4 triệu OTPM.

## Pipeline batch

Workspace `bulk` còn chứa một việc nữa là job phân loại đánh giá ban đêm. Job này chạy 64 worker gọi đồng bộ từ 01:00. Mới vài giây đầu, các worker đã nhận 429 `ramp_limit_exceeded`, vì tải tăng vọt từ 0. Chúng retry dồn dập, và job kéo dài tới 04:10 mới xong.

Việc không ai ngồi chờ như vậy nên chạy qua **Message Batches API** (từ đây gọi tắt là Batches API). Bạn gửi cả một batch request một lần, API xử lý dần trong nền, xong thì bạn lấy kết quả về, và giá chỉ bằng một nửa so với gọi thường. Thiết kế pipeline batch cần biết các giới hạn sau.

| Mục | Giá trị |
| --- | --- |
| Kích thước một batch | Tối đa 100.000 request hoặc 256 MB, cái nào tới trước |
| Thời gian | Phần lớn batch xong trong 1 giờ. Request nào sau 24 giờ chưa chạy thì thành `expired` |
| Kết quả | Giữ 29 ngày kể từ lúc tạo batch |
| Rate limit | Batch có rate limit riêng, không ăn vào limit của Messages API. Số request được nằm chờ xử lý cùng lúc là 500.000 ở Scale tier, 300.000 ở Build tier |
| Ramp limit | Không áp cho Batches API |
| Không hỗ trợ | `stream: true`, `speed` (fast mode), `fallbacks` |

Có ba điều cần làm khi dựng pipeline.

Thứ nhất, kết quả batch không trả theo thứ tự bạn gửi, nên mỗi request cần một `custom_id` để ghép kết quả với request. Mỗi kết quả có một trong bốn trạng thái là `succeeded`, `errored`, `canceled` và `expired`, và ba trạng thái sau không tính tiền.

Thứ hai, batch có thể chạy lâu hơn 5 phút, nên hãy đặt cache 1 giờ cho phần prompt dùng chung. Giảm giá của cache và của batch được cộng dồn, nhưng việc đọc cache trong batch chỉ là best-effort, không bảo đảm lần nào cũng đọc được.

Thứ ba, nếu có hạn chót thì phải chuẩn bị đường lui. Tới giờ mà batch chưa xong thì huỷ nó đi. Batch bị huỷ vẫn giữ những kết quả đã xong, còn các request bị huỷ thì gửi lại bằng cách gọi đồng bộ.

**Sơ đồ: Mười batch gửi lúc 00:30 tốn 39 USD mỗi đêm thay vì 78 USD, và tới 06:00 vẫn có đường lui**
- xong
- chưa
- 400.000 đánh giá10 batch × 40.000khoảng 200 MB/batch
- Gửi lúc 00:30hàng đợi 500.000của Scale tier
- 06:00xong hết?
- Ghép kết quảtheo custom_id
- Huỷ, giữ phần đã xongrequest bị huỷgửi lại đồng bộ

Đội gửi mười batch lúc 00:30, mỗi batch 40.000 đánh giá, khoảng 200 MB. Cả 400.000 request vẫn nằm gọn trong hàng đợi 500.000 của Scale tier. Hạn chót là 06:00. Tới giờ đó mà còn batch chưa xong thì đội huỷ nó, giữ phần đã xong và gửi lại đồng bộ các request bị huỷ.

Mỗi đêm job này tốn 39 USD, thay vì 78 USD nếu gọi đồng bộ. Hai con số này tính theo giá Haiku 5.5, là 0,10 USD cho mỗi triệu token input và 0,50 USD cho mỗi triệu token output, gửi qua batch thì còn một nửa. Đội chia thành mười batch vì giới hạn dung lượng tới trước giới hạn số request. Mỗi request khoảng 5 KB, nên 100.000 request sẽ vượt 256 MB, và API trả lỗi 413 `request_too_large`.

Đội cũng làm tương tự với việc dịch menu. Menu lớn như đợt 54.000 món của chuỗi 600 chi nhánh được gửi qua batch, còn menu dưới 50 món vẫn dịch đồng bộ trong làn nền.

## Lập kế hoạch công suất

Lập kế hoạch công suất bắt đầu bằng phép tính lúc cao điểm cho từng model. Bạn so số request mỗi phút với giới hạn RPM. Lấy số request mỗi phút nhân số token input không đọc từ cache của mỗi request, rồi so với ITPM. Làm tương tự với token output để so với OTPM.

Sau khi sửa cách cache, tính năng gợi ý trả lời lúc cao điểm dùng 1.200 trên 13.000 RPM, 1,8 triệu trên 10 triệu ITPM và 360.000 trên 2 triệu OTPM. Nếu số nhà hàng tăng gấp ba, tính năng này cần khoảng 3.600 RPM, 5,4 triệu ITPM và 1,08 triệu OTPM, vẫn dưới giới hạn. Nếu không sửa cách cache thì sẽ cần khoảng 19 triệu ITPM, gần gấp đôi giới hạn.

Để đo, dùng trang Usage, header của response, Rate Limits API (API trả về các limit hiện có của organization) và token counting API (đếm token của một prompt trước khi gửi). Ở các bậc dưới, bạn xin lên bậc trên bằng nút Request tier increase trong Console. Công ty nhà hàng đã ở Scale tier, nên muốn hơn nữa thì phải liên hệ sales để lên Custom tier.

Nếu kế hoạch fallback ở bài 2.1 là chuyển sang Claude trên một nền tảng cloud khi Claude API gặp sự cố, bạn cũng phải tính hạn mức ở nền tảng đó, thường gọi là quota, vì nó khác Claude API. Trên Amazon Bedrock, quota mặc định là 2 triệu token input mỗi phút, và bạn tự xin được tới 5 triệu input và 500.000 output mà không cần Anthropic duyệt. Claude Platform on AWS thì không cho đặt rate limit theo workspace và không có fast mode.

> **Bẫy đề**
>
> Lúc 11:00, chuỗi 600 chi nhánh dịch menu làm 18% request gợi ý trả lời bị 429. Bốn cách sửa nghe hợp lý nhưng sai:
>
> - **Xin nâng rate limit ngay** (_request a higher rate limit_). Nghe như đi thẳng vào gốc. Nhưng việc không gấp vẫn tranh hạn mức với việc gấp, nên limit mới rồi cũng bị chiếm.
> - **Tăng số worker hay số lần retry** (_add concurrency or retries_). Thêm worker có vẻ đẩy được nhiều việc hơn. Nhưng API đang trả 429, nên gửi thêm request chỉ làm có thêm lỗi và hàng đợi dài thêm.
> - **Giảm `max_tokens` để khỏi chạm OTPM** (_lower max_tokens_). OTPM đang vượt thật, nên cách này có vẻ trúng chỗ. Nhưng `max_tokens` không tính vào OTPM.
> - **Mua Priority Tier** (_buy Priority Tier_), một gói cam kết công suất để được ưu tiên khi API đông. Cái tên gợi cảm giác mua được quyền ưu tiên. Nhưng gói này không còn bán, và cũng không hỗ trợ Sonnet 5.5.
>
> **Chọn:** tách việc gấp và việc chờ được thành làn tức thì và làn nền, đặt quota cho từng tenant, cache phần prompt dùng chung, và đưa việc không gấp sang batch. Làm hết mà vẫn thiếu thì mới xin nâng limit.

> **Ý chính**
>
> Token đọc từ cache không tính vào ITPM, nên cache phần dùng chung là cách tăng thông lượng rẻ nhất. Việc có người chờ và việc chờ được nên đi hai làn, có quota cho từng tenant. Việc không ai chờ thì gửi qua Batches API, đặt `custom_id` cho mỗi request, và chuẩn bị sẵn cách xử lý khi batch chưa xong lúc tới hạn.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Rate limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
3. [Rate Limits API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/rate-limits-api)
4. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
5. [Workspaces (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/workspaces)
6. [Usage and Cost Analytics API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api)
7. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
8. [Pricing (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/pricing)
9. [Fast mode (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
10. [Service tiers (Claude API Docs)](https://platform.claude.com/docs/en/api/service-tiers)
11. [Errors (Claude API Docs)](https://platform.claude.com/docs/en/api/errors)
12. [Claude in Amazon Bedrock (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)
