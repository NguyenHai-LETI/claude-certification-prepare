---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-5-xu-ly-theo-lo
ngay_tai: 2026-11-27
tieu_de: Thiết kế xử lý theo lô cho hiệu quả
---

Domain 4: Prompt Engineering & Structured Output · Task 4.5

# Thiết kế xử lý theo lô cho hiệu quả

Message Batches API rẻ một nửa nhưng có thể chờ tới 24 giờ. Chọn việc nào gửi theo lô, tính nhịp gửi lô cho kịp SLA, thử prompt trên mẫu, chỉ gửi lại phần lỗi.

- 15 phút đọc
- Đối chiếu docs 22/11/2026
- 2 nguồn

## Đọc xong bạn nắm được

- Biết Message Batches API giảm 50% chi phí, có thể mất tới 24 giờ và không cam kết độ trễ
- Chọn batch cho việc chờ được, gọi đồng bộ cho việc đang chặn người dùng
- Tính tần suất gửi lô để vẫn kịp cam kết thời gian
- Hiểu batch không chạy được vòng gọi tool của bạn giữa một request
- Thử prompt trên một tập mẫu trước khi chạy cả khối, rồi dùng custom_id để chỉ gửi lại các request lỗi

Không phải lần gọi Claude nào cũng cần kết quả ngay. Báo cáo tuần, việc rà soát chạy đêm hay việc số hoá hàng chục nghìn hồ sơ cũ đều chờ được vài giờ. Với những việc như vậy, gửi request theo lô (batch) rẻ hơn hẳn gọi từng request một.

Bài này giúp bạn quyết định việc nào nên gửi theo lô và việc nào phải gọi đồng bộ. Bạn cũng sẽ tính được bao lâu gửi một lô để vẫn kịp cam kết thời gian, và biết cách xử lý khi một phần của lô bị lỗi.

**Sơ đồ: Việc chờ được thì gửi lô cho rẻ một nửa, việc có người chờ hay cần chạy tool của bạn thì gọi đồng bộ**
_Bản đồ bài: gọi đồng bộ qua Messages API trả kết quả ngay, dùng cho việc chỉnh prompt trên tập mẫu, cho vòng gọi tool do code của bạn chạy (trong lô request dừng ở tool_use) và cho việc đang chặn người dùng như pre-merge checks. Message Batches API dùng cho việc chờ được: giảm 50% chi phí, xử lý tới 24 giờ, không cam kết độ trễ. Vòng đời một lô: prompt đã chỉnh trên mẫu đi vào bước gom request, khoảng gom cộng 24 giờ phải nằm trong SLA; lô xử lý, mỗi request một custom_id; kết quả về khác thứ tự, ghép theo custom_id; chỉ gửi lại các request errored trong một lô mới_

- **GỌI ĐỒNG BỘ QUA MESSAGES API: KẾT QUẢ NGAY**
- **Chỉnh prompt**: trên tập mẫu
- (sample set)
- **Gọi tool**: của bạn; trong lô
- dừng ở tool_use
- **Việc đang chặn người dùng**: blocking workflows, như pre-merge checks:
- dev đang chờ kết quả để merge
- prompt đã chỉnh
- **MESSAGE BATCHES API: VIỆC CHỜ ĐƯỢC**: giảm 50% chi phí
- xử lý tới 24 giờ
- không cam kết độ trễ
- **Gom request**: khoảng gom + 24 giờ
- nằm trong SLA
- **Lô xử lý**: mỗi request
- một custom_id
- **Kết quả về**: khác thứ tự,
- ghép theo custom_id
- **Gửi lại phần lỗi**: chỉ các request
- errored
- 1.
- 2.
- 3.
- 4. gửi trong một lô mới

## Ví dụ xuyên suốt: dữ liệu công trình của một công ty xây dựng

Một công ty xây dựng ở Vinh đang thi công 40 công trình. Mỗi ngày các chỉ huy trưởng gửi về khoảng 600 nhật ký công trình dạng ảnh chụp và PDF. Công trình còn gửi báo cáo sự cố an toàn lao động, và công ty còn hàng chục nghìn hồ sơ nghiệm thu cũ chưa số hoá. Phòng công nghệ có 5 dev. Anh Khải là trưởng phòng, còn Ngọc lo các pipeline gọi Claude. Đội dev cũng dùng Claude để review pull request và sinh test cho phần mềm quản lý công trình của công ty.

## Giá và thời gian chờ của Message Batches API

Ngọc đang gọi Claude trích dữ liệu cho từng nhật ký công trình ngay khi nó tới, qua Messages API thường. Đó là gọi đồng bộ, tức mỗi lần gửi một request và chờ nhận kết quả ngay. Kết quả chỉ dùng để làm báo cáo tiến độ tuần gửi ban giám đốc. Hoá đơn API mỗi tháng tăng dần theo số công trình, trong khi chẳng ai cần kết quả trích xuất trong vài giây.

**Message Batches API** nhận một lô nhiều request rồi xử lý không đồng bộ: bạn gửi cả lô đi, lát sau quay lại lấy kết quả. Mọi token của request trong lô, cả input lẫn output, được tính bằng 50% giá thường (**50% cost savings**). Phần đổi lại là thời gian chờ. Phần lớn lô xong trong chưa tới 1 giờ, nhưng lô có thể mất tới 24 giờ (**up to 24-hour processing window**), và lô nào chưa xong sau 24 giờ thì hết hạn. Batch không cam kết độ trễ nào (**no guaranteed latency SLA**).

Mỗi request trong lô mang một `custom_id` do bạn đặt (**custom_id fields for correlating batch request/response pairs**). Kết quả có thể về theo bất kỳ thứ tự nào, không theo thứ tự lúc gửi, nên bạn ghép kết quả với request bằng `custom_id`. Ngọc đặt `custom_id` là mã nhật ký, như `NK-CT17-20261121`.

> **Trong đề chọn gì**
>
> Nếu đề hỏi hai nhận định đúng về Message Batches API, hãy chọn dùng `custom_id` để ghép request với kết quả, và giảm 50% chi phí so với gọi đồng bộ. Hai đáp án sai hay gặp là dùng batch cho chatbot trả lời thời gian thực, và cho rằng có gói nào đó cam kết lô xong trong 1 giờ. Cả hai đều không đúng.
>
> Nếu đề kể cuối mỗi chu kỳ release, đội tóm tắt 200 commit bằng 200 lần gọi Messages API riêng, chỉ cần kết quả vào sáng hôm sau, và hỏi cách giảm chi phí mà giữ nguyên model và chất lượng, hãy chọn gửi 200 request lên Message Batches API, mỗi request một `custom_id`. Gộp cả 200 commit vào một request không phải lúc nào cũng rẻ hơn, và trong một câu trả lời dài, tóm tắt của các commit dễ trộn vào nhau. Gửi song song nhiều kết nối không làm giá mỗi token thấp đi. Đổi sang model hạng Haiku thì đổi cả chất lượng.

## Việc nào gửi theo lô, việc nào gọi đồng bộ

Anh Khải muốn chuyển hết sang batch để tiết kiệm. Trước khi đổi, Ngọc liệt kê những việc đang dùng Claude và xem ai đang chờ kết quả của từng việc.

| Việc | Ai đang chờ kết quả | Cách gọi |
| --- | --- | --- |
| Trích nhật ký công trình cho báo cáo tuần | Không ai chờ, báo cáo làm vào thứ Hai | Batch |
| Đọc báo cáo sự cố an toàn lao động, cảnh báo trong 30 phút | Chỉ huy trưởng và phòng an toàn | Gọi đồng bộ |
| Review PR, chặn merge tới khi review xong | Dev đang chờ để merge | Gọi đồng bộ |
| Rà soát nợ kỹ thuật và sinh test mỗi đêm | Không ai chờ, sáng hôm sau xem | Batch |

Batch hợp với việc không chặn ai và chờ được (**non-blocking, latency-tolerant workloads**), như báo cáo chạy đêm, rà soát hằng tuần hay sinh test hằng đêm (**overnight reports, weekly audits, nightly test generation**). Còn việc đang chặn người dùng (**blocking workflows**), như bước review trước khi merge (**pre-merge checks**), thì phải gọi đồng bộ. Nói cách khác, bạn chọn cách gọi API theo mức trễ mà từng việc chịu được (**matching API approach to workflow latency requirements**).

Báo cáo sự cố an toàn và nhật ký công trình dùng chung một schema trích xuất, nhưng Ngọc vẫn tách hai loại: nhật ký thì gửi theo lô, còn báo cáo sự cố thì gọi đồng bộ. Lý do là báo cáo sự cố phải có cảnh báo trong 30 phút, mà một lô có thể mất tới 24 giờ.

> **Bẫy đề**
>
> Sếp muốn dùng Message Batches API cho pipeline CI/CD để giảm 50% chi phí. Pipeline có hai bước. Bước review code chạy ngay khi có PR và chặn merge cho tới khi review xong. Bước rà soát nợ kỹ thuật chạy mỗi đêm. Nên áp dụng thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Dùng batch cho cả hai, poll trạng thái cho bước trước merge** (_batch both and poll_). Nghe như tiết kiệm tối đa. Nhưng poll không làm lô xong nhanh hơn, và dev có thể phải chờ tới 24 giờ mới merge được.
> - **Gọi đồng bộ cho cả hai, vì batch không hỗ trợ output theo JSON schema** (_batch lacks structured output_). Nghe như có lý do kỹ thuật. Có điều hầu hết tham số của Messages API đều dùng được trong lô, chỉ vài tham số như `stream: true` bị loại, nên batch không bị loại vì lý do này.
> - **Chuyển cả hai sang batch, thêm fallback gọi đồng bộ nếu lô chạy quá 5 phút** (_timeout fallback_). Cách này có vẻ an toàn. Ngặt nỗi lô có thể mất hơn 5 phút (phần lớn xong dưới 1 giờ), nên bước review trước merge dễ phải chờ đủ 5 phút rồi mới gọi đồng bộ lại, chậm hơn hẳn gọi đồng bộ ngay từ đầu.
>
> **Chọn:** chỉ dùng batch cho bước rà soát nợ kỹ thuật chạy đêm, giữ gọi đồng bộ cho bước review chặn merge.

> **Trong đề chọn gì**
>
> Nếu đề kể có hai loại tài liệu dùng chung một schema, một là báo cáo tháng chỉ để lưu trữ, hai là báo cáo ngoại lệ khẩn phải cảnh báo trong 30 phút, thì hãy chọn gửi báo cáo tháng qua batch và gọi đồng bộ cho báo cáo khẩn. Gửi lô mỗi giờ rồi xử lý tài liệu khẩn trước khi kết quả về vẫn sai, vì tài liệu khẩn có thể phải chờ tới 24 giờ. Gửi hết lên batch rồi cảnh báo trễ là bỏ cam kết 30 phút. Gọi đồng bộ cho mọi tài liệu thì mất phần tiết kiệm của báo cáo tháng.
>
> Nếu đề kể review bảo mật không chặn merge, dev sửa các lỗi mà review tìm ra ở commit sau, và hỏi yếu tố nào quyết định có nên chuyển sang batch, hãy chọn đáp án nói tới việc phản hồi review đến muộn tới 24 giờ sau khi tạo PR có còn dùng được hay không. Dựng mỗi review thành một request hay chịu được kết quả về khác thứ tự là điều kiện kỹ thuật dễ đáp ứng, không phải thứ quyết định. Còn đáp án nói độ trễ giảm từ 30–60 giây xuống gần như tức thì thì ngược sự thật, vì batch rẻ hơn và chậm hơn chứ không nhanh hơn.

## Tính tần suất gửi lô theo cam kết thời gian

Ban giám đốc đổi yêu cầu. Giờ dữ liệu của mỗi nhật ký phải có trong hệ thống chậm nhất 30 giờ sau khi chỉ huy trưởng gửi lên. Cam kết thời gian kiểu này gọi là SLA. Nhật ký tới rải rác suốt ngày, nên Ngọc phải chọn bao lâu gom một lô.

Gọi thời gian giữa hai lần gửi lô là khoảng gom. Nhật ký nào tới ngay sau khi Ngọc vừa gửi một lô sẽ phải chờ trọn khoảng gom đó mới được gửi đi, rồi chờ thêm tối đa 24 giờ để lô xử lý. Vì vậy trong trường hợp xấu nhất, một nhật ký phải chờ khoảng gom cộng 24 giờ.

| Khoảng gom | Xấu nhất | So với mốc 30 giờ |
| --- | --- | --- |
| Cuối ngày, một lô | 24 + 24 = 48 giờ | Trễ |
| 6 giờ | 6 + 24 = 30 giờ | Sát mốc, không còn chỗ trừ hao |
| 4 giờ | 4 + 24 = 28 giờ | Kịp, còn 2 giờ đệm |

**Sơ đồ: Gom mỗi 4 giờ thì nhật ký chậm nhất 28 giờ có dữ liệu, còn 2 giờ đệm trước mốc 30 giờ**
_Thời gian xấu nhất của một nhật ký tới ngay sau lúc vừa gửi lô, so với mốc 30 giờ. Một lô cuối ngày: chờ gom 24 giờ rồi lô xử lý tới 24 giờ, xong ở giờ 48, vượt mốc. Gom mỗi 6 giờ: chờ 6 giờ rồi xử lý tới 24 giờ, xong đúng giờ 30, sát mốc. Gom mỗi 4 giờ: chờ 4 giờ rồi xử lý tới 24 giờ, xong ở giờ 28, còn 2 giờ đệm_

- nhật ký tới ngay sau lúc vừa gửi lô
- **mốc 30 giờ**
- **Một lô cuối ngày**: 48 giờ: trễ
- chờ gom 24 giờ
- xử lý tới 24 giờ: trễ
- **Gom mỗi 6 giờ**: 30 giờ: sát mốc
- 6 giờ
- lô xử lý tới 24 giờ
- **Gom mỗi 4 giờ**: 28 giờ: kịp
- 4 giờ
- lô xử lý tới 24 giờ
- **2 giờ đệm**: giờ 0
- 24
- 30
- 48 giờ

Ngọc chọn gửi lô mỗi 4 giờ. Khi tính tần suất gửi lô theo SLA (**calculating batch submission frequency based on SLA constraints**), bạn lấy SLA trừ 24 giờ xử lý tối đa, rồi chọn khoảng gom ngắn hơn phần còn lại và chừa chút đệm, vì lô có thể chậm hơn bình thường lúc hệ thống đông. Với SLA 30 giờ, gửi mỗi 4 giờ là đủ (**4-hour windows to guarantee 30-hour SLA with 24-hour batch processing**). Ngọc cũng không chọn khoảng ngắn hơn nữa, vì 4 giờ đủ dài để mỗi lô vẫn gom được nhiều nhật ký.

> **Trong đề chọn gì**
>
> Nếu đề kể tài liệu tới liên tục trong giờ làm việc, dùng batch (giảm 50%, tối đa 24 giờ) và SLA là 30 giờ với độ tin cậy 99,9%, hãy chọn gửi lô mỗi 4 giờ. Hai giờ đệm là thứ giữ được độ tin cậy đó. Gửi một lô cuối ngày có thể mất tới 48 giờ. Gửi mỗi 6 giờ thì xấu nhất là đúng 30 giờ, không còn chỗ trừ hao. Gọi đồng bộ cho mọi tài liệu thì bỏ luôn phần giảm giá trong khi SLA vẫn cho phép chờ.

## Batch không chạy vòng gọi tool của bạn

Ngoài việc trích nhật ký, công ty còn một agent đối chiếu vật tư đang gọi đồng bộ. Agent này đọc nhật ký, thấy tên vật tư như "thép D16", gọi tool `tra_ma_vat_tu` của công ty để lấy mã chuẩn, rồi mới viết kết quả. Ngọc thử chuyển nó vào lô chạy đêm cho rẻ. Khi chạy trong lô, kết quả của request chỉ có một khối `tool_use`, tức phần Claude trả về để xin gọi `tra_ma_vat_tu`, rồi dừng ở đó. Không có ai trả kết quả tool về cho Claude giữa chừng.

Request trong lô có thể chứa định nghĩa tool, và Claude vẫn có thể trả về khối `tool_use`. Nhưng mỗi request trong lô là một lần gọi Messages API độc lập. Batch không hỗ trợ gọi tool của bạn nhiều vòng trong một request (**does not support multi-turn tool calling within a single request**). Giữa chừng không có gì chạy tool của bạn rồi gửi kết quả lại cho Claude. Tool chạy phía server của Anthropic, như web search hay code execution, thì vẫn chạy được trong lô, còn tool do bạn định nghĩa và tự chạy thì không. Muốn đi tiếp, bạn phải tự chạy tool rồi gửi một request mới. Nếu request mới cũng đi theo lô thì mỗi vòng gọi tool tốn thêm tới 24 giờ.

**Sơ đồ: Gọi đồng bộ thì code của bạn chạy tool và gửi kết quả lại, trong lô thì request dừng ở tool_use**
_Hai cách chạy agent đối chiếu vật tư. Qua Messages API thường: Claude đọc nhật ký, trả tool_use đòi tra_ma_vat_tu cho thép D16, code của Ngọc chạy tool và gửi tool_result lại, Claude viết kết quả có mã vật tư chuẩn. Trong Message Batches API: lô đêm gửi request có định nghĩa tool, Claude đọc nhật ký và trả tool_use rồi request dừng; không ai chạy tool hay gửi tool_result giữa chừng. Muốn đi tiếp phải tự chạy tool rồi gửi request mới trong lô sau, thêm tới 24 giờ mỗi vòng_

- **MESSAGES API THƯỜNG: CODE CỦA BẠN CHẠY VÒNG GỌI TOOL**
- **tra_ma_vat_tu**: code của Ngọc chạy tool
- **Claude**: đọc nhật ký
- tool_use
- tool_result
- **Kết quả**: có mã vật tư chuẩn
- code của bạn chạy tool giữa các lần gọi, Claude đi tiếp với kết quả của tool
- **MESSAGE BATCHES API: MỖI REQUEST LÀ MỘT LẦN GỌI ĐỘC LẬP**
- **Lô đêm**: request có định nghĩa tool
- **Claude**: đọc nhật ký
- tool_use
- **Dừng ở đây**: đòi tra_ma_vat_tu
- không ai chạy tool, không có tool_result gửi lại
- muốn đi tiếp: tự chạy tool, gửi request mới trong lô sau, thêm tới 24 giờ mỗi vòng

Ngọc tách việc ra. Bước trích tên vật tư chạy trong lô đêm, không cần tool. Sáng hôm sau, một đoạn code của Ngọc tra mã từng vật tư trong danh mục rồi ghép vào kết quả trích. Agent nào thật sự cần gọi tool nhiều vòng thì giữ ở gọi đồng bộ.

> **Ý chính**
>
> Batch không chạy tool của bạn giữa một request, nên việc cần gọi tool nhiều vòng thì không đưa vào lô.

## Thử prompt trên tập mẫu trước khi chạy cả khối

Công ty còn một việc lớn là số hoá 40.000 hồ sơ nghiệm thu công trình cũ trong hai tuần. Ngọc chạy thử 500 hồ sơ, và chỉ 80% qua kiểm tra schema ngay lần đầu. Phần còn lại hỏng vì nhiều lý do, như thiếu field bắt buộc, ngày ghi kiểu khác, hay biên bản chỉ có chữ ký mà không ghi tên người nghiệm thu.

Nếu gửi cả 40.000 hồ sơ với prompt hiện tại, khoảng 8.000 hồ sơ sẽ phải gửi lại, và mỗi vòng sửa prompt rồi gửi lại có thể tốn thêm tới 24 giờ. Vì vậy Ngọc mở rộng tập mẫu lên khoảng 2.000 hồ sơ và gọi đồng bộ. Ngọc gom các lỗi theo kiểu, sửa prompt và schema cho từng kiểu, rồi chạy lại trên tập mẫu cho tới khi tỉ lệ qua ngay lần đầu đủ cao. Gọi đồng bộ trả kết quả ngay trong lúc làm việc, nên mỗi vòng sửa prompt tính bằng giờ chứ không bằng ngày. Xong bước đó, Ngọc mới gửi cả 40.000 hồ sơ theo lô với prompt đã chỉnh. Một lô nhận tối đa 100.000 request hoặc 256 MB, nên Ngọc chia 40.000 hồ sơ thành vài lô theo dung lượng.

Chỉnh prompt trên tập mẫu trước khi chạy khối lớn theo lô (**prompt refinement on a sample set before batch-processing large volumes**) giúp tỉ lệ qua ngay lần đầu cao nhất có thể và bớt tiền gửi lại nhiều vòng (**maximize first-pass success rates and reduce iterative resubmission costs**).

> **Bẫy đề**
>
> Đội trích dữ liệu từ 50.000 hợp đồng cũ với hạn hai tuần. Chạy thử 500 tài liệu mẫu, đội thấy 82% qua schema ngay lần đầu, còn 18% lỗi vì nhiều lý do khác nhau. Nên làm thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gọi đồng bộ cho cả 50.000 tài liệu vì batch có thể mất 24 giờ** (_real-time for everything_). Nghe an toàn cho hạn chót. Nhưng hai tuần dư sức cho vài lô 24 giờ, và cách này mất phần giảm 50%.
> - **Gửi cả 50.000 theo lô, rồi gửi lại phần lỗi qua các lô kế tiếp, chỉnh prompt giữa mỗi lô** (_batch then resubmit failures_). Cách này cuối cùng cũng xong. Có điều khoảng 9.000 tài liệu lỗi ở lô đầu phải chạy lại, và mỗi vòng chỉnh prompt tốn thêm tới 24 giờ.
> - **Chia thành 10 lô tuần tự, mỗi lô 5.000, chỉnh prompt giữa các lô** (_ten sequential batches_). Nghe như vừa làm vừa học. Ngặt nỗi lô đầu vẫn chạy với prompt chưa chỉnh, và mỗi lần sửa prompt vẫn phải chờ một lô chạy xong, tức tới 24 giờ.
>
> **Chọn:** gọi đồng bộ cho khoảng 2.000 tài liệu mẫu để tìm các kiểu lỗi và chỉnh prompt, rồi chạy cả 50.000 theo lô với prompt đã chỉnh.

## custom_id và chỉ gửi lại phần lỗi

Các lô của 40.000 hồ sơ chạy xong. File kết quả cho thấy 1.200 request (3%) ở trạng thái `errored` vì vượt giới hạn context, tức lượng chữ tối đa model đọc được trong một request, vì các hồ sơ này kèm thuyết minh kỹ thuật dài hàng trăm trang. Request lỗi trong lô không bị tính tiền.

Ngọc lọc ra 1.200 `custom_id` lỗi. Với mỗi hồ sơ, Ngọc cắt phần thuyết minh thành các đoạn đủ ngắn để nằm gọn trong giới hạn context, gửi các đoạn đó trong một lô mới, rồi ghép kết quả các đoạn lại theo mã hồ sơ. 38.800 hồ sơ đã thành công không phải chạy lại. Khi xử lý lỗi của lô (**handling batch failures**), bạn chỉ gửi lại các tài liệu lỗi và tìm ra chúng bằng `custom_id` (**resubmitting only failed documents (identified by custom_id)**). Trước khi gửi lại, hãy sửa đúng nguyên nhân lỗi, như cắt nhỏ tài liệu vượt giới hạn context (**chunking documents that exceeded context limits**).

**Sơ đồ: Chỉnh prompt trên 2.000 mẫu rồi mới chạy lô, xong chỉ gửi lại 1.200 request lỗi, giữ nguyên 38.800**
- Sau khi lô xong
- 38.800 thành công
- 1.200 errored (3%)
- File kết quảtheo custom_id
- Giữ nguyên,không chạy lại
- Vượt context:lọc theo custom_id,cắt thuyết minh
- Lô mới, ghépkết quả các đoạntheo mã hồ sơ
- Trước khi gửi lô lớn
- Thử 500 hồ sơ80% qua schema
- Chỉnh prompt, schematrên 2.000 mẫugọi đồng bộ
- Các lô 40.000 hồ sơprompt đã chỉnh

> **Bẫy đề**
>
> Lô 10.000 tài liệu mỗi ngày chạy xong, 300 tài liệu (3%) lỗi "context_length_exceeded". File kết quả xác định từng tài liệu lỗi theo `custom_id`. Cách tiết kiệm nhất để xử lý là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tăng `max_tokens` cho 300 tài liệu lỗi rồi gửi lại** (_raise max_tokens_). Nghe như nới giới hạn. Nhưng `max_tokens` giới hạn độ dài câu trả lời, còn lỗi nằm ở đầu vào quá dài.
> - **Chạy lại cả lô với prompt caching** (_rerun with caching_). Cách này làm phần system prompt rẻ hơn. Có điều 9.700 tài liệu đã thành công bị chạy lại không cần thiết, và 300 tài liệu kia vẫn quá dài.
> - **Gửi lại cả lô với model có context window lớn hơn** (_bigger model, whole batch_). Nghe như chữa tận gốc. Ngặt nỗi bạn trả tiền chạy lại 9.700 tài liệu đã xong, với giá của model lớn hơn.
>
> **Chọn:** chỉ gửi lại 300 tài liệu lỗi sau khi cắt chúng thành các phần nhỏ hơn, rồi ghép kết quả trích xuất của từng phần lại.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 4.5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Batch processing (Claude API)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
