---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-4-ep-quy-trinh-va-chuyen-giao
ngay_tai: 2026-11-27
tieu_de: Ép thứ tự các bước và bàn giao cho người
---

Domain 1: Agentic Architecture & Orchestration · Task 1.4

# Ép thứ tự các bước và bàn giao cho người

Khi nào phải chặn bằng code thay vì dặn trong prompt, cách tách yêu cầu nhiều việc, và bản bàn giao có cấu trúc khi chuyển cho nhân viên.

- 14 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Phân biệt chặn bằng code (hook, điều kiện tiên quyết) với lời dặn trong prompt, và biết khi nào lời dặn không đủ
- Chặn các tool ở bước sau cho tới khi bước bắt buộc phía trước đã xong
- Tách một yêu cầu có nhiều việc thành từng mục, tra song song với context dùng chung, rồi gộp thành một câu trả lời
- Soạn bản bàn giao có cấu trúc khi chuyển cho nhân viên không xem được cuộc trò chuyện

Một quy trình nhiều bước thường có bước bắt buộc phải xảy ra trước bước khác, như xác minh khách trước khi hoàn tiền. Bạn có thể dặn Claude điều đó trong system prompt, hoặc viết code chặn hẳn bước sau cho tới khi bước trước xong. Bài này giúp bạn biết lúc nào dặn trong prompt là đủ, lúc nào phải chặn bằng code, cách xử lý khi khách nhắn nhiều việc một lúc, và làm gì khi agent phải dừng giữa chừng để chuyển việc cho nhân viên.

Trong đề thi, chặn bằng code gọi là **programmatic enforcement**, làm bằng hook hoặc bằng điều kiện tiên quyết (**prerequisite gates**). Dặn trong prompt gọi là **prompt-based guidance**. Khi một bước phải được tuân thủ lần nào cũng đúng (**deterministic compliance**), như xác minh danh tính trước khi động tới tiền, thì lời dặn không đủ, vì lúc nào nó cũng còn một tỉ lệ làm sai lớn hơn 0 (**non-zero failure rate**).

**Sơ đồ: Hook trong code chặn tool bước sau tới khi xác minh xong; vượt hạn mức thì bàn giao nhân viên**
_Bản đồ bài: khách nhắn nhiều việc, agent xác minh trước, hook PreToolUse đọc mã khách để cho tool bước sau chạy hoặc deny, trong hạn mức thì gộp một câu trả lời cho khách, vượt hạn mức thì chuyển nhân viên kèm bàn giao có cấu trúc_

- **Khách**: nhắn nhiều việc
- **Agent**: tách từng mục
- trước tiên
- gọi tool
- deny + lý do, agent hỏi lại OTP
- **PREREQUISITE GATE TRONG CODE**
- **xac_minh_khach**: trả mã khách
- mã khách (hook đọc)
- **Hook PreToolUse**: chưa có mã: deny
- có mã
- **Tool ở bước sau**: tra_don, hoan_tien, doi_ghe
- **Trong hạn mức?**: hạn mức hoàn của agent
- có
- **Gộp một câu trả lời**: kết quả mọi mục
- **Khách**: nhận một tin
- vượt
- **chuyen_nhan_vien**: structured handoff
- **Nhân viên**: không xem chat
- bước tiếp theo
- dữ liệu hook đọc
- bị chặn, quay lại agent
- **Chỉ dặn trong prompt:**: non-zero failure rate, nên cổng này phải nằm trong code

## Ví dụ xuyên suốt: agent chăm sóc khách của một nền tảng bán vé sự kiện

Một nền tảng bán vé ca nhạc, kịch và thể thao dùng agent trả lời khách qua chat, khoảng 1.500 cuộc chat mỗi ngày vào mùa cao điểm. Đội kỹ thuật của nền tảng dựng agent bằng Agent SDK, bộ thư viện của Anthropic để viết agent chạy trên Claude, và tự viết các tool cho nó, gom trong một MCP server tên `ve`. `xac_minh_khach(so_dien_thoai, ma_otp)` kiểm số điện thoại và mã OTP, trả về mã khách đã xác minh. `hoan_tien(ma_don, so_tien, dry_run)` hoàn tiền; khi `dry_run` là `true`, tool chỉ cho xem trước số tiền chứ chưa hoàn thật. Ngoài ra còn `tra_don(ma_don)`, `doi_ghe(ma_don, ghe_moi)`, `gui_lai_ve(ma_don)` và `chuyen_nhan_vien(...)`. Agent được tự hoàn tiền tới 2.000.000 đồng mỗi đơn. Khoản lớn hơn phải chuyển cho nhân viên chăm sóc khách hàng, những người nhận việc qua một hệ thống hàng chờ riêng và không xem được nội dung chat.

## Dặn trong prompt thì vẫn có lúc hỏng

System prompt của agent có câu "Luôn gọi `xac_minh_khach` trước khi hoàn tiền hay đổi ghế". Bộ phận đối soát rà lại số liệu tháng 10 và thấy trong 4.200 lần hoàn tiền có 31 lần agent hoàn mà chưa xác minh khách, khoảng 0,7%. Phần lớn rơi vào những cuộc chat mà khách đưa luôn mã đơn ngay tin đầu, giọng rất chắc chắn, nên agent đi thẳng tới `tra_don` rồi `hoan_tien`. Hai lần trong số đó, tiền về nhầm tài khoản của người khác.

Claude làm theo lời dặn trong prompt ở hầu hết trường hợp, nhưng không phải mọi trường hợp. Viết câu dặn mạnh hơn hay thêm ví dụ có thể làm tỉ lệ hỏng giảm xuống, nhưng không đưa nó về 0. Với nhiều việc, như thứ tự hỏi thăm hay cách chào khách, sai vài lần trong nghìn lần vẫn chấp nhận được. Nhưng nếu chỉ một lần sai đã là mất tiền, lộ dữ liệu hay vi phạm quy định, thì phải viết code chặn bước sau cho tới khi bước bắt buộc đã xong. Code chặn không phụ thuộc vào việc Claude có nhớ lời dặn hay không.

> **Ý chính**
>
> Lời dặn trong prompt luôn có tỉ lệ hỏng lớn hơn 0. Nếu chỉ một lần làm sai đã gây thiệt hại thật, hãy dùng code chặn bước sau cho tới khi bước bắt buộc đã xong.

## Chặn các tool ở bước sau cho tới khi bước trước xong

Đội viết một hook `PreToolUse`. Đây là một hàm mà Agent SDK gọi ngay trước khi chạy một tool, và hàm này có thể cho tool chạy, chặn lại hoặc sửa tham số. Khi `xac_minh_khach` trả về một mã khách đã xác minh, code của agent lưu mã đó vào trạng thái riêng của session, tra theo `session_id`. Mỗi lần Claude gọi `tra_don`, `hoan_tien` hay `doi_ghe`, hook kiểm tra xem session đã có mã khách chưa, và đơn đang thao tác có đúng của khách đó không. Nếu thiếu một trong hai điều kiện, hook trả `deny`, nghĩa là không cho tool chạy, kèm lý do.

```python
async def chan_khi_chua_xac_minh(input_data, tool_use_id, context):
    ma_khach = trang_thai_session.get(input_data["session_id"], {}).get("ma_khach")
    if not ma_khach or not don_thuoc_khach(input_data["tool_input"]["ma_don"], ma_khach):
        return {"hookSpecificOutput": {
            "hookEventName": input_data["hook_event_name"],
            "permissionDecision": "deny",
            "permissionDecisionReason": "Chưa xác minh khách sở hữu đơn này. Gọi xac_minh_khach trước.",
        }}
    return {}

hooks = {"PreToolUse": [HookMatcher(matcher="mcp__ve__tra_don|mcp__ve__hoan_tien|mcp__ve__doi_ghe", hooks=[chan_khi_chua_xac_minh])]}
```

`matcher` là chỗ ghi những tool mà hook sẽ canh. Tool của một MCP server có tên dạng `mcp__<tên server>__<tên tool>`, nên ba tool ở đây mang tiền tố `mcp__ve__`. Lý do trong `permissionDecisionReason` được gửi cho Claude, nên khi bị chặn, Claude biết vì sao và thường quay lại hỏi khách số điện thoại cùng mã OTP. Sau khi bật hook, trong tháng 11 không còn lần hoàn tiền nào thiếu bước xác minh.

Cách làm này gọi là điều kiện tiên quyết bằng code (**programmatic prerequisite**): tool ở bước sau bị chặn cho tới khi bước trước trả về kết quả cần thiết. Bạn cũng có thể đặt điều kiện đó ngay trong code của tool `hoan_tien` ở phía server. Hai cách giống nhau ở chỗ phần kiểm tra nằm trong code chứ không nằm trong lời dặn.

**Sơ đồ: Tháng 10 chỉ dặn trong prompt: 31 lần bỏ xác minh; tháng 11 có hook: không còn lần nào**

✗ _Tháng 10: chỉ dặn trong system prompt_
1. "Luôn gọi **xac_minh_khach** trước khi hoàn tiền hay đổi ghế"
   ↓ _khách đưa mã đơn ngay tin đầu, giọng rất chắc chắn_
2. Agent đi thẳng tới tra_don rồi hoan_tien
3. **31 trong 4.200 lần** hoàn tiền tháng 10 mà chưa xác minh, hai lần tiền về nhầm người

✓ _Tháng 11: hook PreToolUse chặn ở code_
1. Chưa có mã khách, hoặc đơn không thuộc khách: hook trả **deny** kèm lý do
   ↓ _Claude biết vì sao bị chặn_
2. Quay lại hỏi số điện thoại và mã OTP, gọi xac_minh_khach
3. **Cả tháng 11** không còn lần hoàn tiền nào thiếu bước xác minh

Một tuần sau, đội phát hiện chuyện tương tự với bước xem trước. System prompt đã dặn agent luôn gọi `hoan_tien` với `dry_run` là `true` trước, đọc số tiền cho khách xác nhận, rồi mới gọi với `dry_run` là `false`. Vậy mà log cho thấy ở khoảng 5% số lần hoàn tiền, agent gọi thẳng với `dry_run` là `false` và bỏ qua bước xem trước. Lần này, thay vì thêm một hook nữa, đội sửa chính cách thiết kế tool. Họ tách `hoan_tien` thành hai tool. `xem_truoc_hoan_tien` trả số tiền sẽ hoàn kèm một mã xác nhận chỉ dùng được một lần (**one-time confirmation token**). `thuc_hien_hoan_tien` chỉ chạy khi có mã đó, và mã chỉ khớp với đúng khoản đã xem trước. Muốn hoàn thì buộc phải qua bước xem trước, nên không còn ai phải nhớ thứ tự. Đội cũng đổi `matcher` của hook từ `hoan_tien` sang `thuc_hien_hoan_tien`, để bước xác minh vẫn được canh.

> **Trong đề chọn gì**
>
> Nếu đề tả agent bỏ bước xem trước của một thao tác nguy hiểm (gọi thẳng `dry_run=false`), hãy chọn cách tách thành hai tool: một tool xem trước trả mã xác nhận dùng một lần, và một tool thực hiện chỉ chạy khi có mã đó. Thêm chỉ dẫn và ví dụ few-shot vào mô tả tool vẫn là trông vào xác suất. Đánh dấu tool cần người duyệt ở tầng điều phối thì có người bấm duyệt, nhưng không buộc người đó đã xem bản xem trước. Cho server nhận `dry_run=false` nếu trong 60 giây trước có lời gọi xem trước cùng tham số thì vẫn không gắn việc thực hiện với đúng lần xem trước mà khách đã xác nhận.

> **Bẫy đề**
>
> Agent bỏ bước `xac_minh_khach` ở 31 trong 4.200 lần hoàn tiền, và hai lần tiền về nhầm người. Thay đổi nào sửa được tận gốc? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Viết lại system prompt, nói rõ xác minh là bắt buộc** (_state in the system prompt that verification is mandatory_). Đây là cách sửa đầu tiên ai cũng nghĩ tới. Nhưng system prompt của agent đã có câu đó, và lời dặn mạnh hơn chỉ làm giảm tỉ lệ hỏng, không đưa nó về 0.
> - **Thêm ví dụ few-shot cho thấy agent luôn xác minh trước** (_few-shot examples showing get_customer called first_). Ví dụ giúp Claude làm đúng thứ tự thường xuyên hơn, nhưng làm theo hay không vẫn do Claude quyết, nên cách này vẫn dựa vào xác suất.
> - **Dùng một classifier phân loại yêu cầu, rồi chỉ bật một số tool cho từng loại** (_a routing classifier that enables a subset of tools_). Cách này quyết định agent có tool nào, còn vấn đề nằm ở thứ tự gọi tool. Yêu cầu hoàn tiền vẫn cần cả `xac_minh_khach` lẫn `hoan_tien`.
>
> **Chọn:** thêm điều kiện tiên quyết bằng code, chặn `tra_don` và `hoan_tien` cho tới khi `xac_minh_khach` trả về mã khách đã xác minh.

## Tách yêu cầu nhiều việc rồi gộp thành một câu trả lời

Chặn xong chuyện bỏ bước, đội gặp một kiểu lỗi khác: khách nhắn nhiều việc trong cùng một tin. Chị Mai nhắn một tin dài: vé xem kịch tối thứ Sáu bị trừ tiền hai lần, chị muốn đổi hai ghế đêm nhạc tuần sau lên gần sân khấu hơn, và chị chưa nhận được email vé của trận bóng Chủ nhật. Agent xác minh chị, xử lý khoản trừ tiền hai lần, rồi viết "Mình đã hoàn khoản bị trừ trùng cho chị" và kết thúc. Hai việc còn lại không ai đụng tới, và chị Mai phải nhắn lại từ đầu.

Khi khách nhắn nhiều việc trong một tin (**multi-concern customer requests**), agent nên tách ra từng mục trước khi bắt tay vào làm. Agent của đội giờ làm theo ba bước. Đầu tiên nó liệt kê các mục trong tin nhắn: khoản trừ trùng, đổi ghế, email vé. Sau đó nó tra từng mục. Các mục không phụ thuộc nhau nên agent tra song song được (**parallel investigation**). Cả ba mục cũng dùng chung những gì đã có trong cuộc chat, như mã khách chị Mai vừa xác minh, nên agent không phải hỏi lại chị lần nào (**shared context**). Cuối cùng agent gộp kết quả thành một câu trả lời chung cho mọi mục (**unified resolution**), nói rõ từng mục đã xử lý ra sao và mục nào cần chị làm thêm.

Khi đội chạy lại tin của chị Mai với agent bản mới, kết quả tra cho thấy khoản trừ trùng 850.000 đồng hoàn được ngay, đêm nhạc còn hai ghế gần sân khấu, còn email vé không tới được vì địa chỉ trong hồ sơ bị gõ thiếu một chữ. Agent hoàn tiền, đổi ghế, rồi viết một tin trả lời cả ba việc. Với việc thứ ba, agent đọc lại địa chỉ email đang lưu, nhờ chị xác nhận địa chỉ đúng, và gửi lại vé tới địa chỉ đó ngay khi chị trả lời.

**Sơ đồ: Bản đầu làm một việc rồi dừng; bản mới tách ba mục, tra song song, gộp thành một tin trả lời**
- Bản đầu
- Tin chị Maiba việc
- Chỉ hoàn khoản trừ trùngrồi dừng, bỏ hai việc
- Bản mới
- Tách ba mụctra song songchung mã khách
- Trừ tiền hai lầnhoàn 850.000 đồng
- Đổi ghếgần sân khấu
- Hỏi lại emailgửi lại vé
- Một tin trả lờicả ba việc

> **Trong đề chọn gì**
>
> Nếu đề tả một tin nhắn chứa vài vấn đề riêng biệt, hãy chọn đáp án tách thành từng mục, tra song song với context dùng chung, rồi gộp thành một câu trả lời cho mọi vấn đề. Chuyển ngay cho nhân viên, chỉ xử lý vấn đề đầu tiên, hay bảo khách gửi từng yêu cầu riêng đều là đáp án sai.

## Bàn giao có cấu trúc khi chuyển cho nhân viên

Có những việc agent không được tự làm, và lúc đó nó phải chuyển cho người (**escalation**; trong đề là tool `escalate_to_human`). Anh Khoa mua 6 vé hạng VIP cho một đêm nhạc, tổng 9.600.000 đồng, và bị trừ tiền hai lần. Agent xác minh anh, tra đơn và log thanh toán, rồi tìm ra nguyên nhân: cổng thanh toán bị timeout ở lần trừ đầu, khiến hệ thống tự retry và trừ thêm một lần nữa. Khoản cần hoàn vượt hạn mức 2.000.000 đồng của agent, nên agent gọi `chuyen_nhan_vien`. Ở bản đầu, tool này chỉ nhận một field ghi chú dạng văn bản tự do, và agent ghi: "Khách cần hỗ trợ hoàn tiền, vui lòng kiểm tra." Nhân viên nhận việc không xem được đoạn chat, nên phải gọi lại cho anh Khoa và tra lại từ đầu. Anh Khoa phải kể chuyện của mình thêm một lần.

Agent nên chuyển ngay khi biết việc vượt quyền của mình, chứ đừng thử gọi `hoan_tien` rồi chờ hệ thống từ chối mới chuyển. Lý do chuyển cũng không chỉ là số tiền. Một khoản sai do lỗi giá khuyến mãi cần quản lý duyệt cũng phải chuyển, dù số tiền nhỏ. Lý do chuyển nên là quy tắc rõ ràng như hạn mức hay quyền hạn, chứ không dựa vào điểm tự tin mà agent tự báo.

Khi chuyển việc cho nhân viên giữa chừng, agent đang giữ mọi thứ nó vừa tìm ra, còn nhân viên thì không có gì. Bản bàn giao là thứ duy nhất nhân viên nhận được từ agent (**structured handoff**). Nó phải đủ để nhân viên làm tiếp ngay mà không phải điều tra lại: mã khách (**customer ID**), nguyên nhân gốc (**root cause analysis**) và hành động đề xuất (**recommended actions**). Đội sửa `chuyen_nhan_vien`, thay field ghi chú bằng một loạt field bắt buộc trong `input_schema` của tool, tức phần mô tả các tham số mà tool nhận. Agent phải điền đủ thì lời gọi mới hợp lệ:

```json
{
  "ma_khach": "KH-208341",
  "ma_don": "VE-77120",
  "van_de": "Bị trừ tiền hai lần cho đơn 6 vé VIP",
  "nguyen_nhan_goc": "Cổng thanh toán timeout ở lần trừ đầu, hệ thống tự retry và trừ thêm lần nữa",
  "so_tien_hoan": 9600000,
  "da_lam": "Đã xác minh khách, đối chiếu hai giao dịch trong log thanh toán",
  "hanh_dong_de_xuat": "Duyệt hoàn 9.600.000 đồng cho giao dịch thứ hai"
}
```

Bản bàn giao này ngắn hơn nhiều so với cả đoạn chat, nhưng có đúng thứ nhân viên cần: khách là ai, chuyện gì xảy ra, vì sao, cần bao nhiêu tiền, agent đã làm gì và nên làm gì tiếp. Nhân viên đọc xong là duyệt được.

**Sơ đồ: Mỗi field bắt buộc trả lời sẵn một câu mà nhân viên lẽ ra phải hỏi hay tra lại**
_Các field của bản bàn giao cho ca anh Khoa, mỗi field ứng với một câu nhân viên cần biết, so với bản đầu chỉ có field ghi chú tự do_

- **BẢN BÀN GIAO CA ANH KHOA: FIELD BẮT BUỘC**
- **NHÂN VIÊN KHỎI PHẢI HỎI**
- **ma_khach**: KH-208341
- **ma_don**: VE-77120
- khách là ai, đơn nào
- **van_de**: Bị trừ tiền hai lần cho đơn 6 vé VIP
- chuyện gì xảy ra
- **nguyen_nhan_goc**: Timeout ở lần trừ đầu, tự retry
- vì sao
- **so_tien_hoan**: 9600000 (9.600.000 đồng)
- cần bao nhiêu tiền
- **da_lam**: Đã xác minh, đối chiếu hai giao dịch
- đã làm gì rồi
- **hanh_dong_de_xuat**: Duyệt hoàn cho giao dịch thứ hai
- nên làm gì
- **Tên tô màu**: : bốn field cốt lõi (khách nào, vì sao, bao nhiêu tiền, làm gì)
- **ĐỂ SO: BẢN ĐẦU**
- **Bản đầu: một field ghi chú tự do**: “Khách cần hỗ trợ hoàn tiền, vui lòng kiểm tra.”
- Nhân viên gọi lại anh Khoa, tra lại từ đầu
- **Nhân viên duyệt ngay**: đọc xong là duyệt được
- anh Khoa không phải kể lại

> **Bẫy đề**
>
> Agent xác định anh Khoa bị trừ 9.600.000 đồng hai lần là do cổng thanh toán timeout, và phải chuyển cho nhân viên vì khoản hoàn vượt hạn mức. Nhân viên không xem được đoạn chat. Các cách bàn giao sau nghe hợp lý nhưng sai:
>
> - **Chuyển nguyên đoạn chat và mọi kết quả tool, hoặc lưu chúng rồi gửi mã tham chiếu** (_the full transcript, or a reference ID to the stored transcript_). Cách này có đủ thông tin, nhưng nhân viên phải tự đọc hết mới thấy được điều agent đã tìm ra, nghĩa là vẫn phải điều tra lại từ đầu.
> - **Chỉ gửi tin nhắn đầu tiên của khách** (_only the customer's original message_). Tin đầu cho biết khách than phiền gì, còn những gì agent đã tra ra thì mất hết.
> - **Chỉ ghi chẩn đoán và số tiền** (_only the diagnosis and the refund amount_). Bản này ngắn gọn thật, nhưng thiếu mã khách nên nhân viên không biết hoàn cho ai, và thiếu hành động đề xuất nên không biết mình cần duyệt gì.
> - **Giữ field ghi chú tự do, chỉ nới giới hạn ký tự hoặc dặn thêm trong system prompt** (_keep the free-text notes field with more room or prompt guidance_). Ghi chú có thể đầy đủ hơn trong phần lớn trường hợp, nhưng agent vẫn ghi theo ý nó, nên không có gì bảo đảm lần nào cũng đủ các ý cần thiết.
>
> **Chọn:** bản bàn giao có cấu trúc, gồm mã khách, nguyên nhân gốc, số tiền cần hoàn và hành động đề xuất, đặt thành các field bắt buộc mà agent phải điền đủ trước khi chuyển.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Intercept and control agent behavior with hooks (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/hooks)
3. [Configure permissions (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/permissions)
4. [Implement tool use (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
5. [Building effective agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)
