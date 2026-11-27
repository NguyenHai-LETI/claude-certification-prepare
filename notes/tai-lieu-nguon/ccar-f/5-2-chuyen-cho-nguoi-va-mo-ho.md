---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-2-chuyen-cho-nguoi-va-mo-ho
ngay_tai: 2026-11-27
tieu_de: Khi nào chuyển cho người, và xử lý yêu cầu mơ hồ
---

Domain 5: Context Management & Reliability · Task 5.2

# Khi nào chuyển cho người, và xử lý yêu cầu mơ hồ

Ba trường hợp agent nên chuyển cho nhân viên, vì sao mức bực bội và điểm tự tin không dùng được, và cách xử lý khi tra ra nhiều khách hay yêu cầu chưa rõ.

- 22 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Nhận ra ba trường hợp agent nên chuyển cho nhân viên, và biết ca nhiều bước không phải lý do để chuyển
- Chuyển ngay khi khách đòi gặp người, còn khi khách chỉ bực thì đề nghị giải quyết
- Hiểu vì sao mức bực bội và điểm tự tin Claude tự chấm không đo được độ khó của ca
- Viết tiêu chí chuyển kèm ví dụ few-shot cho cả hai phía vào system prompt
- Hỏi thêm thông tin nhận dạng khi tra ra nhiều kết quả, và nêu rõ giả định khi yêu cầu mơ hồ

Agent hỗ trợ khách giải quyết được phần lớn yêu cầu, nhưng có những ca nó không nên tự quyết. Chuyển cho người quá ít thì agent tự đồng ý những thứ chính sách không cho phép. Chuyển quá nhiều thì khách phải chờ nhân viên cho cả những việc agent làm xong trong một phút.

Bài này giúp bạn vạch ranh giới đó. Bạn sẽ biết ba trường hợp nên chuyển, vì sao không nên dựa vào mức bực bội của khách hay điểm tự tin Claude tự chấm, và cách viết tiêu chí chuyển vào system prompt. Phần cuối bài nói cách xử lý khi tool tra ra nhiều khách cùng tên, và khi khách chưa nói rõ mình muốn gì.

**Sơ đồ: Chỉ ba tín hiệu quyết định chuyển cho người; cảm xúc, điểm tự tin và số bước thì không**
_Bản đồ bài. Vùng trên: tin nhắn của khách đi qua ba câu hỏi. Khách đòi gặp người thì chuyển ngay, không tra trước. Chính sách không nói tới hay nói không rõ thì chuyển, không tự đồng ý hay tự từ chối. Agent đã thử mà không tiến triển được thì chuyển, hoặc mời khách thử lại sau. Không rơi vào ba trường hợp đó thì agent tự giải quyết, kể cả ca nhiều bước; khách chỉ bực thì ghi nhận và đề nghị giải quyết. Tiêu chí và ví dụ few-shot cho cả hai phía ghi trong system prompt. Vùng dưới trái: không dùng làm tín hiệu chuyển: mức bực bội, điểm tự tin Claude tự chấm, số bước của ca. Vùng dưới phải: khi chưa rõ: tool trả nhiều kết quả khớp thì hỏi thêm thông tin nhận dạng; yêu cầu mơ hồ thì nêu giả định, gợi ý luôn, hỏi trước bước khó đảo ngược_

- **BA TÍN HIỆU CHUYỂN CHO NGƯỜI (TIÊU CHÍ VÀ FEW-SHOT TRONG SYSTEM PROMPT)**
- **Tin nhắn**
- 1. Khách đòi gặp người
- 2. Chính sách không nói tới, không rõ
- 3. Đã thử mà không tiến triển
- **Chuyển nhân viên**: 1: chuyển ngay, không tra
- 2: không tự đồng ý
- hay tự từ chối
- 3: hoặc mời thử lại sau
- **Không rơi vào ba trường hợp: agent tự giải quyết**: kể cả ca nhiều bước; khách chỉ bực thì ghi nhận, đề nghị giải quyết
- **KHÔNG DÙNG LÀM TÍN HIỆU CHUYỂN**: Mức bực bội của khách
- Điểm tự tin Claude tự chấm
- Số bước của ca
- **KHI CHƯA RÕ LÀ AI, MUỐN GÌ**: Tool trả nhiều kết quả khớp:
- hỏi thêm thông tin nhận dạng
- Yêu cầu mơ hồ: nêu giả định,
- gợi ý luôn, hỏi trước bước khó
- đảo ngược

## Ví dụ xuyên suốt: agent chăm sóc khách của một chuỗi điện máy

Một chuỗi điện máy ở Thái Nguyên có 12 cửa hàng và bán online, mỗi ngày nhận khoảng 900 cuộc chat. Đội công nghệ có 3 dev. Anh Lâm là trưởng nhóm, còn Hà phụ trách agent chăm sóc khách chạy bằng Claude. Agent có các tool `tim_khach`, `tra_don`, `dieu_chinh_gia`, `hoan_tien`, `doi_hang`, `dat_lich_lap` và `chuyen_nhan_vien`.

Agent làm việc theo hai chính sách của chuỗi. Chính sách điều chỉnh giá ghi rõ: nếu chính chuỗi giảm giá một sản phẩm trong 7 ngày sau khi khách mua, khách được hoàn phần chênh lệch. Chính sách đổi hàng cho khách đổi sang sản phẩm khác, trả thêm phần chênh lệch, và đặt lịch lắp lại nếu cần.

Ngoài agent cho khách, Hà còn làm một công cụ nội bộ cũng chạy bằng Claude. Nhân viên cửa hàng dùng nó để dọn hồ sơ khách bị trùng.

## Ba trường hợp nên chuyển cho nhân viên

Sau tháng đầu chạy thật, tỉ lệ ca giải quyết xong ngay trong lần chat đầu tiên thấp hơn hẳn kỳ vọng. Hà đọc lại log và thấy agent làm ngược. Nó chuyển cho nhân viên những việc đơn giản, như đổi địa chỉ giao hàng, chỉ vì khách viết dài. Nó lại tự quyết những ca mà chính sách không cho nó quyền quyết. Một khách gửi ảnh chụp giá chiếc tủ lạnh ở một shop khác rẻ hơn 600.000 đồng, và agent tự đồng ý hoàn khoản chênh lệch đó.

Chỉ có ba trường hợp nên chuyển cho người (**escalation triggers**). Thứ nhất, khách yêu cầu gặp người (**customer requests for a human**). Thứ hai, ca cần một ngoại lệ chính sách, hoặc chính sách có khoảng trống (**policy exceptions/gaps**). Thứ ba, agent không thể tiến triển thêm được gì đáng kể (**inability to make meaningful progress**). Ca phức tạp không nằm trong danh sách này (**not just complex cases**).

Chuyện chiếc tủ lạnh rơi đúng vào trường hợp thứ hai. Chính sách chỉ nói tới việc hoàn chênh lệch khi chính chuỗi giảm giá (**own-site adjustments**), không nói gì về giá của đối thủ (**competitor price matching**). Khi chính sách không nói tới hoặc nói không rõ yêu cầu cụ thể của khách (**policy is ambiguous or silent**), agent chuyển cho nhân viên. Nó không tự đồng ý, cũng không tự từ chối, vì cả hai đều là quyết định mà chính sách chưa giao cho nó.

Ngưỡng nghiệp vụ mà chuỗi tự đặt ra cũng thuộc trường hợp thứ hai. Giả sử chuỗi quy định mọi khoản hoàn trên 5 triệu đồng phải có người duyệt. Khi đó chính sách đã nói rõ khoản hoàn như vậy không thuộc quyền của agent, nên agent phải chuyển. Ngưỡng kiểu này nên để code kiểm, không để Claude tự nhớ rồi tự phán đoán.

Ngược lại, một ca nhiều bước nhưng nằm gọn trong chính sách thì agent tự làm. Một khách muốn đổi chiếc điều hoà vừa mua sang model công suất lớn hơn. Agent phải gọi `doi_hang`, tính tiền khách trả thêm, rồi gọi `dat_lich_lap` để hẹn thợ lắp lại. Bước nào cũng có trong chính sách đổi hàng và agent có đủ tool, nên số bước tự nó không phải lý do để chuyển.

Trường hợp thứ ba cũng cần đọc cho đúng. Chuỗi giảm giá chiếc máy giặt ba ngày sau khi một khách mua, nên khách đủ điều kiện hoàn chênh lệch 350.000 đồng. Agent đã tra đơn, giải thích cách tính và xác nhận khách đủ điều kiện. Tới lúc gọi `hoan_tien` thì tool trả lỗi timeout. Code trả kết quả đó về cho Claude dưới dạng `tool_result` có `is_error: true`, kèm thông báo lỗi cụ thể.

Agent không chuyển ngay, vì như thế là bỏ phí phần đã làm. Nó cũng không hứa "tiền sẽ về" rồi đóng cuộc chat, vì lệnh hoàn tiền vừa lỗi. Nó báo khách là hệ thống hoàn tiền đang gặp sự cố nên chưa hoàn ngay được, rồi để khách chọn chuyển cho nhân viên hay thử lại sau.

> **Bẫy đề**
>
> Nhóm đang quyết định khi nào agent gọi `escalate_to_human`, với bốn đề xuất. Cách nào nhận ra chắc nhất những ca thật sự cần người? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Chuyển sau ba lần gọi tool liên tiếp mà chưa xong việc** (_three failed tool calls_). Nghe như đã thử đủ mới nhờ người. Nhưng ca nhiều bước bình thường cũng cần nhiều lần gọi tool, còn ca chính sách có khoảng trống thì không cần gọi tool nào vẫn phải chuyển.
> - **Dựng rules engine, tức một bảng luật cố định, ánh xạ loại vấn đề, nhóm khách và danh mục sản phẩm sang quyết định chuyển** (_rules engine_). Nghe như chắc chắn và dễ kiểm. Có điều bảng luật không bắt được yêu cầu mà chính sách chưa từng nghĩ tới, đúng loại ca cần người nhất.
> - **Chạy phân tích cảm xúc trên từng tin nhắn, chuyển khi điểm bực bội vượt ngưỡng** (_sentiment threshold_). Nghe như quan tâm tới khách. Ngặt nỗi mức bực bội không cho biết ca khó hay dễ.
>
> **Chọn:** dặn agent chuyển khi khách yêu cầu gặp người, khi ca cần ngoại lệ chính sách, hoặc khi agent không tiến triển được gì đáng kể.

> **Trong đề chọn gì**
>
> Nếu đề hỏi tín hiệu nào là lý do hợp lệ để chuyển một session cho nhân viên, hãy chọn phát hiện một khoảng trống chính sách mà chưa quy tắc nào trong cơ sở kiến thức phủ tới. Hai đáp án điểm tự tin tự báo dưới 0,6 và tin nhắn rất tiêu cực đều dựa vào tín hiệu không đáng tin. Đáp án cuộc chat dài quá 5 lần trao đổi thì không nói gì về việc có cần người hay không.
>
> Nếu đề kể khách của công ty điện cần điều chỉnh hoá đơn qua ba bước, bước nào cũng có trong chính sách và agent có tool cho từng bước, hãy chọn không chuyển. Ba bước đó là đọc lại công tơ, trả lại tiền tính theo số ngày, và đổi gói cước. Số bước tự nó không phải lý do, nên agent tự giải quyết. Các đáp án bắt một người duyệt trước, cho người giám sát cả ca, hay chỉ chuyển riêng bước trả lại tiền đều coi nhiều bước là rủi ro, trong khi chính sách đã phủ hết.
>
> Nếu đề kể `process_refund` trả lỗi timeout sau khi agent đã giải thích hoá đơn và xác nhận khách đủ điều kiện, hãy chọn làm hết phần làm được, nói rõ hệ thống đang lỗi, rồi đề nghị chuyển cho người hoặc thử lại sau. Đáp án chuyển ngay là bỏ phí phần đã xong. Đáp án exponential backoff, tức tự thử lại nhiều lần với khoảng chờ dài dần trong lúc giữ khách chờ, thì không biết bao giờ backend hết lỗi. Đáp án hứa hoàn tiền rồi đóng cuộc chat là hứa điều hệ thống chưa làm được.

## Khi khách đòi gặp người, và khi khách chỉ đang bực

Một tối, một khách nhắn: "Tôi giải thích hai lần rồi mà chẳng ai xử lý. Cho tôi nói chuyện với nhân viên ngay." Agent trả lời "Dạ, để em kiểm tra đơn hàng của anh trước đã", rồi gọi `tim_khach` và `tra_don`. Khách nhắn thêm hai lần nữa, rồi bỏ đi và để lại đánh giá một sao.

Khi khách nói rõ muốn gặp người, agent chuyển ngay, không điều tra trước (**honoring explicit customer requests for human agents immediately without first attempting investigation**). Khách không cần dùng đúng chữ "nhân viên". Câu "tôi muốn nói chuyện với người thật, không phải bot" hay "cho tôi gặp ai đó thật sự giúp được" đều là đòi gặp người. Việc khách cần có đơn giản tới đâu cũng vậy. Khách đã nói không muốn tiếp tục với agent, nên agent không cố giữ khách lại để tự làm. Agent gọi `chuyen_nhan_vien` kèm lịch sử cuộc chat, để nhân viên không phải hỏi lại từ đầu.

Khách chỉ đang bực mà không đòi gặp ai thì khác (**escalating immediately when a customer explicitly demands it versus offering to resolve when the issue is straightforward**). Một khách khác viết: "Đặt hàng ba hôm mà vẫn chưa đổi được địa chỉ giao, bực thật đấy." Việc đổi địa chỉ nằm trong khả năng của agent. Agent ghi nhận sự bực bội, nói rõ việc này làm được ngay, và đề nghị làm luôn (**acknowledging frustration while offering resolution when the issue is within the agent's capability**). Nếu khách nhắc lại là muốn gặp người, lúc đó agent mới chuyển (**escalating only if the customer reiterates their preference**).

**Sơ đồ: Cùng giọng bực bội, nhưng chỉ câu đòi gặp người mới khiến agent chuyển ngay**

• _Khách đòi gặp người_
1. "Giải thích hai lần rồi mà chẳng ai xử lý. Cho tôi nói chuyện với nhân viên ngay"
   ↓ _không tra đơn, không hỏi thêm_
2. Gọi **chuyen_nhan_vien** kèm lịch sử cuộc chat
3. **1 bước** chuyển ngay, dù việc khách cần có đơn giản

• _Khách chỉ bực, việc làm được_
1. "Ba hôm rồi chưa đổi được địa chỉ, bực thật đấy"
   ↓ _ghi nhận sự bực bội, nói rõ làm được ngay_
2. Đề nghị đổi địa chỉ luôn; khách nhắc lại muốn gặp người thì mới chuyển
3. **2 lựa chọn** agent làm luôn, hoặc chuyển nếu khách vẫn muốn

> **Bẫy đề**
>
> Khách nhắn: "This is frustrating. I've explained my issue twice and nothing is being resolved. I want to talk to a real person NOW." Agent chưa gọi tool nào để xem tài khoản. Agent nên làm gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Giải thích ngắn agent giúp được gì, đề nghị giải quyết nhanh, chỉ chuyển khi khách nhắc lại** (_offer to resolve first_). Nghe như cách đúng với khách đang bực. Nhưng khách này không chỉ bực, khách đã đòi gặp người.
> - **Ghi nhận sự bực bội và hỏi một câu để hiểu vấn đề trước khi chuyển** (_one clarifying question_). Nghe như giúp nhân viên đỡ việc. Có điều mỗi câu hỏi thêm là thêm một lần khách phải giải thích, đúng thứ khách đang bực.
> - **Gọi `get_customer` và `lookup_order` trước để nắm tài khoản rồi mới chuyển** (_investigate first_). Nghe chu đáo. Ngặt nỗi đây đúng là điều tra trước khi chuyển, và lịch sử cuộc chat chuyển kèm đã đủ cho nhân viên bắt đầu.
>
> **Chọn:** gọi ngay `escalate_to_human` kèm lịch sử cuộc chat.

> **Trong đề chọn gì**
>
> Nếu đề kể khách viết "I just want to speak to someone who can actually help me" về một ca trả hàng mà agent đã xác nhận là đơn giản và làm được ngay, hãy chọn gọi ngay `escalate_to_human`. Câu đó là đòi gặp người. Đáp án tự hoàn tiền rồi báo đã xong là bỏ qua điều khách vừa nói. Đáp án hỏi lần trước vướng ở đâu là bắt khách giải thích thêm. Đáp án ghi nhận sự bực bội rồi đề nghị làm luôn chỉ đúng với khách bực mà chưa đòi gặp người.
>
> Nếu đề kể công ty đã cấu hình luật chuyển là đáp ứng ngay yêu cầu gặp nhân viên, không thử giải quyết trước, và khách nhắn "I want a real person, not a bot" về một lần đặt lại mật khẩu bình thường, hãy chọn chuyển cuộc chat cho nhân viên ngay để nhân viên lo việc đặt lại mật khẩu. Ba đáp án còn lại là đề nghị đặt lại ngay, gửi link trước rồi mới chuyển, và hỏi khách cần gặp vì việc gì. Cả ba đều là thử giải quyết trước, trái với luật.

## Vì sao không dựa vào mức bực bội hay điểm tự tin

Anh Lâm đề xuất hai cách để agent tự biết khi nào chuyển. Cách đầu là chạy phân tích cảm xúc (**sentiment analysis**), tức cho một bước chấm mức tiêu cực của từng tin nhắn, rồi chuyển khi mức bực bội vượt ngưỡng. Cách thứ hai là bắt Claude tự chấm độ tự tin từ 1 tới 10 sau mỗi câu trả lời, rồi chuyển khi điểm dưới 7. Trước khi làm, Hà đối chiếu cả hai với log hai tuần.

Cả hai đều không đo đúng độ khó thật của ca (**sentiment-based escalation and self-reported confidence scores are unreliable proxies for actual case complexity**). Những khách bực bội nhất trong log phần lớn chỉ cần đổi địa chỉ hay hỏi lịch giao hàng, việc agent làm xong ngay. Còn khách đòi bù giá theo shop đối thủ thì viết rất lịch sự. Chuyển theo mức bực bội vì vậy sẽ gửi nhầm ca dễ cho nhân viên, và để lọt đúng ca cần người.

Điểm tự tin cũng không khá hơn. Hà thử cho agent chạy lại ca tủ lạnh, lần này kèm bước tự chấm điểm. Agent vẫn đồng ý hoàn 600.000 đồng, và tự chấm 9 trên 10. Điều này không lạ. Agent không biết mình đang vượt quyền, nên nó cũng chẳng có lý do gì để chấm thấp. Điểm tự chấm không cho biết chính sách thiếu chỗ nào.

| Ca trong log | Mức bực bội của khách | Có cần người không |
| --- | --- | --- |
| Đổi địa chỉ giao hàng sau ba ngày chờ | Rất bực | Không, agent làm được ngay |
| Bù giá theo shop đối thủ | Lịch sự | Có, chính sách không nói tới |
| Đổi điều hoà sang model lớn hơn, hẹn lắp lại | Bình thường | Không, chính sách phủ từng bước |
| Khách nói "cho tôi gặp nhân viên" | Bực | Có, khách đã đòi gặp người |

> **Trong đề chọn gì**
>
> Nếu đề hỏi vì sao chuyển cho người theo cảm xúc tiêu cực là anti-pattern, hãy chọn đáp án nói cảm xúc không tương quan với độ phức tạp của việc: khách đang giận vẫn có thể có yêu cầu đơn giản. Đáp án nói phân tích cảm xúc bắt buộc phải fine-tune một model embedding là sai, vì không cần. Đáp án nhắc `tool_choice: "auto"` thì không liên quan gì tới cảm xúc. Đáp án nói cảm xúc tiêu cực làm Claude tự kết thúc session cũng sai.
>
> Nếu đề hỏi hai cách nào là anti-pattern khi thiết kế logic chuyển cho người, hãy chọn chuyển chỉ vì khách dùng lời lẽ tiêu cực, và tự động chuyển khi điểm tự tin Claude tự báo xuống dưới ngưỡng. Chuyển ngay khi khách yêu cầu rõ gặp nhân viên là cách đúng. Chuyển một giao dịch vượt ngưỡng nghiệp vụ cũng là cách đúng, khi ngưỡng đó do code kiểm qua hook PostToolUse, tức đoạn code chạy ngay sau mỗi lần gọi tool. Ngưỡng đó là chính sách do code áp, không dựa vào phán đoán của Claude.

## Viết tiêu chí chuyển vào system prompt kèm few-shot

Sau khi bỏ hai đề xuất kia, Hà sửa đúng chỗ gốc: agent không biết ranh giới giữa việc tự làm và việc phải chuyển. Hà ghi các tiêu chí chuyển rõ ràng vào system prompt, kèm ví dụ few-shot cho cả hai phía của ranh giới: ca nên chuyển và ca nên tự làm (**explicit escalation criteria with few-shot examples to the system prompt demonstrating when to escalate versus resolve autonomously**). Theo kinh nghiệm của Hà, prompt chỉ có ví dụ của một phía thì agent hay nghiêng về phía đó.

```
<tieu_chi_chuyen_nhan_vien>
Chuyển cho nhân viên bằng chuyen_nhan_vien khi:
- Khách nói muốn gặp người. Chuyển ngay, không tra đơn trước.
- Chính sách không nói tới hoặc nói không rõ yêu cầu của khách. Không tự đồng ý, không tự từ chối.
- Bạn đã thử mà không tiến triển được (tool lỗi lặp lại, thiếu quyền).
Ca nhiều bước mà chính sách phủ từng bước thì tự làm. Khách bực nhưng việc làm được thì ghi nhận, đề nghị làm luôn.
</tieu_chi_chuyen_nhan_vien>

<vi_du>
Khách: "Shop X bán tủ lạnh này rẻ hơn 600.000, bù cho tôi được không?"
Agent: chuyển nhân viên. Chính sách chỉ nói về giảm giá của chính chuỗi, không nói về giá shop khác.
</vi_du>
<vi_du>
Khách: "Đổi điều hoà sang loại 18.000 BTU, lắp lại giúp tôi."
Agent: tự làm: doi_hang, báo tiền trả thêm, dat_lich_lap.
</vi_du>
<vi_du>
Khách: "Ba hôm rồi chưa đổi được địa chỉ, bực thật."
Agent: xin lỗi, báo đổi được ngay và đề nghị đổi luôn. Chỉ chuyển nếu khách nhắc lại muốn gặp người.
</vi_du>
```

Để biết cách sửa có hiệu quả không, Hà theo dõi thêm tỉ lệ chuyển đúng (**escalation accuracy**): trong số ca lẽ ra phải chuyển, bao nhiêu ca thật sự được chuyển. Mục tiêu hay dùng cho chỉ số này là từ 95% trở lên.

> **Trong đề chọn gì**
>
> Nếu đề kể agent có tỉ lệ giải quyết ngay trong lần liên hệ đầu thấp, vì tự xử lý ngoại lệ chính sách phức tạp mà lại chuyển việc đơn giản, hãy chọn thêm tiêu chí chuyển rõ ràng vào system prompt kèm ví dụ few-shot cho cả hai phía. Hai đáp án điểm tự tin tự báo dưới 7 và phân tích cảm xúc đều dựa vào tín hiệu không đáng tin. Đáp án huấn luyện một model classifier riêng thì thêm cả một hệ thống, trong khi agent chỉ đang thiếu ranh giới rõ ràng trong prompt.

## Tra ra nhiều khách cùng tên thì hỏi thêm thông tin nhận dạng

Một khách nhắn: "Tôi là Nguyễn Văn Hùng, đơn trước của tôi giao bao giờ?". Agent gọi `tim_khach` và nhận về ba tài khoản cùng tên. Một ở TP Thái Nguyên, số điện thoại đuôi 4821, có đơn máy giặt ngày 12/11. Một ở Phổ Yên, đuôi 0937, có đơn tủ lạnh ngày 19/11. Một ở Đại Từ, đuôi 5512, chưa có đơn nào.

Prompt cũ không nói gì về chuyện này, nên agent chọn tài khoản có đơn gần nhất, tức tài khoản ở Phổ Yên, rồi đọc luôn lịch giao. Đó là đơn của một anh Hùng khác, và khách vừa được nghe địa chỉ giao hàng của người lạ. Khách thật ra là anh Hùng ở TP Thái Nguyên.

**Sơ đồ: Ba tài khoản trùng tên: đoán theo đơn gần nhất thì nhầm người, hỏi số điện thoại thì ra đúng người**
_Khách nhắn tên Nguyễn Văn Hùng. tim_khach trả về ba tài khoản cùng tên: tài khoản ở TP Thái Nguyên, số điện thoại đuôi 4821, đơn gần nhất máy giặt 12/11; tài khoản ở Phổ Yên, đuôi 0937, đơn gần nhất tủ lạnh 19/11; tài khoản ở Đại Từ, đuôi 5512, chưa có đơn. Cách sai: chọn theo đơn gần nhất, ra tài khoản Phổ Yên, nhầm người, khách nghe địa chỉ giao hàng của người khác. Cách đúng: hỏi thêm số điện thoại hay mã đơn, khách đọc đuôi 4821, ra đúng tài khoản TP Thái Nguyên_

- **Khách nhắn**: "Tôi là Nguyễn Văn Hùng"
- tim_khach
- **3 TÀI KHOẢN CÙNG TÊN**: TP Thái Nguyên · đuôi 4821 · máy giặt 12/11
- Phổ Yên · đuôi 0937 · tủ lạnh 19/11
- Đại Từ · đuôi 5512 · chưa có đơn
- **Đoán theo đơn gần nhất**: chọn Phổ Yên, đơn tủ lạnh 19/11
- nhầm người: khách nghe địa chỉ
- giao hàng của một anh Hùng khác
- heuristic selection
- **Hỏi thêm thông tin**: "Anh cho em số điện thoại đặt hàng
- hoặc mã đơn ạ"
- khách đọc đuôi 4821: TP Thái Nguyên
- additional identifiers

Khi tool tra cứu trả về nhiều kết quả khớp (**multiple customer matches**), agent không được chọn theo một quy tắc đoán (**heuristic selection**), như tài khoản có đơn gần nhất hay tài khoản hoạt động gần đây. Việc đúng là hỏi khách thêm thông tin để biết chắc là ai (**requesting additional identifiers**), như số điện thoại đặt hàng hay mã đơn, rồi tra lại. Hà thêm vào system prompt: "Khi `tim_khach` trả về nhiều hơn một tài khoản, hỏi khách số điện thoại hoặc mã đơn, không tự chọn" (**instructing the agent to ask for additional identifiers when tool results return multiple matches**). Một câu hỏi thêm rẻ hơn nhiều so với việc xử lý nhầm tài khoản của người khác.

Nguyên tắc này càng quan trọng khi bước tiếp theo khó đảo ngược, như xoá hay huỷ. Khi có nhiều bản ghi khớp, phải xác nhận đúng bản ghi trước khi làm. Công cụ nội bộ dọn hồ sơ trùng gặp đúng chuyện này. Lệnh "xoá hồ sơ trùng của Nguyễn Văn Hùng" khớp cả ba tài khoản, và đã có vài lần xoá nhầm phải khôi phục lại. Công cụ có thêm quy trình xác nhận nhiều bước, nhưng nhân viên thấy quá phiền. Hà đổi sang cách khác: công cụ hiện các bản ghi khớp kèm vài field giúp phân biệt, như khu vực, đuôi số điện thoại và ngày tạo. Nhân viên chỉ cần bấm một lần để chọn đúng bản ghi trước khi xoá.

> **Trong đề chọn gì**
>
> Nếu đề hỏi khi `get_customer` trả về nhiều kết quả khớp thì agent nên làm gì, hãy chọn hỏi người dùng thêm thông tin nhận dạng. Đáp án chọn tài khoản hoạt động gần nhất là đoán. Đáp án trả lỗi rồi dừng workflow là bỏ dở một việc chỉ cần thêm một câu hỏi. Đáp án tự động chuyển nhân viên là đẩy cho người một việc agent tự làm được.
>
> Nếu đề kể tool `delete_contact` của CRM xoá nhầm 8% vì có các bản ghi tên gần giống nhau ("Acme Corp", "Acme Corporation"), và người dùng chê luồng xác nhận nhiều bước quá phiền, hãy chọn hiện các bản ghi khớp kèm field phân biệt và một cú bấm xác nhận đúng bản ghi. Đáp án bắt nhập đúng record ID là bỏ luôn cách gọi tên tự nhiên mà công cụ đang phục vụ. Đáp án soft-delete 30 ngày chỉ giúp sửa sau khi đã xoá nhầm. Đáp án tự phát hiện và gộp bản ghi trùng thì thêm một hệ thống mới, và vẫn có thể gộp nhầm.

## Khi khách chưa nói rõ mình muốn gì

Agent còn tư vấn mua hàng. Khách hay nhắn kiểu "tư vấn giúp cái máy giặt", không nói ngân sách, số người trong nhà hay chỗ đặt máy. Bản đầu của agent trả lời bằng bốn câu hỏi liền một lúc, và 38% khách bỏ đi ngay sau đó. Hà thử bớt câu hỏi, cho agent cứ gợi ý theo mặc định mà không nói gì thêm. Lần này khách lại nhận những gợi ý không hợp.

Hà sửa system prompt theo hướng khác. Khi yêu cầu chưa rõ, agent suy ra giả định hợp lý từ những gì đã có, như lịch sử mua hàng của khách hay câu trước đó trong cuộc chat. Nó nói rõ giả định đó, gợi ý luôn, rồi mời khách sửa nếu hiểu sai. Ví dụ: "Em đoán nhà mình 4 người, nên gợi ý máy cửa trước 9 kg trong tầm 8–10 triệu. Anh chị cần khác thì nói em đổi nhé." Giả định không nói ra thì khách không biết chỗ nào cần sửa.

Câu hỏi được để dành cho bước khó đảo ngược, như chốt đơn hay thanh toán. Nói gọn, khi ý khách chưa rõ, agent suy ra việc hữu ích nhất rồi làm tiếp. Trước việc khó đảo ngược thì agent hỏi khách trước.

> **Trong đề chọn gì**
>
> Nếu đề kể trợ lý trả lời "Can you help me with the report?" bằng ba câu hỏi đánh số, và 40% cuộc trò chuyện bị bỏ dở, hãy chọn sửa system prompt để trợ lý đưa ra giả định hợp lý từ context, nói rõ giả định và mời điều chỉnh. Đáp án mỗi lần chỉ hỏi một câu thì vẫn là chuỗi câu hỏi, chỉ dài ra. Đáp án thêm model nhỏ chấm độ mơ hồ là thêm một bước mà không bớt được câu hỏi nào. Đáp án dùng bảng mặc định mà không nói ra giả định thì người dùng không biết chỗ nào cần sửa.
>
> Nếu đề kể trợ lý đặt địa điểm hỏi trung bình 4,2 câu khiến 35% người dùng bỏ dở, nhưng hỏi ít thì gợi ý không hợp, hãy chọn nêu rõ giả định từ lịch sử cuộc chat, gợi ý luôn kèm lời mời sửa, và chỉ hỏi trước thao tác khó đảo ngược như xác nhận đặt chỗ. Đáp án gộp mọi câu hỏi thành một câu ghép thì vẫn bắt người dùng trả lời hết trước khi thấy gì. Đáp án dùng form tiếp nhận bắt điền đủ từ đầu cũng vậy. Đáp án làm theo mặc định mà không nói ra giả định thì người dùng nhận kết quả sai mà không biết vì sao.

> **Ý chính**
>
> Chuyển cho người khi khách đòi gặp người, khi chính sách không phủ tới yêu cầu, hoặc khi agent không tiến triển được. Mức bực bội và điểm tự tin Claude tự chấm không cho biết ca khó hay dễ. Tra ra nhiều người khớp thì hỏi thêm thông tin nhận dạng. Khách chưa nói rõ muốn gì thì nêu giả định rồi gợi ý luôn, chỉ hỏi trước bước khó đảo ngược.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 5.2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Customer support agent (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat)
3. [Building effective agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)
4. [Prompting best practices (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
5. [Handle tool calls (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
