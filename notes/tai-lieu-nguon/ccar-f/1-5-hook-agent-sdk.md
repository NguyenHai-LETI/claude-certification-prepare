---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-5-hook-agent-sdk
ngay_tai: 2026-11-27
tieu_de: Hook trong Agent SDK - chặn lời gọi tool và chuẩn hoá kết quả
---

Domain 1: Agentic Architecture & Orchestration · Task 1.5

# Hook trong Agent SDK - chặn lời gọi tool và chuẩn hoá kết quả

Dùng hook PreToolUse để chặn hay sửa lời gọi tool vi phạm chính sách, hook PostToolUse để chuẩn hoá dữ liệu, và khi nào chọn hook thay vì lời dặn.

- 14 phút đọc
- Đối chiếu docs 22/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Viết hook PostToolUse chuẩn hoá dữ liệu khác định dạng từ nhiều MCP server trước khi Claude đọc
- Viết hook PreToolUse chặn lời gọi tool vi phạm chính sách và chuyển hồ sơ sang quy trình khác, như chuyển cho nhân viên duyệt
- Dùng hook để thay tham số Claude điền bằng giá trị đã xác minh
- Chọn hook thay vì lời dặn trong prompt khi luật nghiệp vụ phải được tuân thủ lần nào cũng đúng

Agent SDK cho bạn gắn hook, tức những hàm do bạn viết mà SDK tự gọi ở các thời điểm cố định trong vòng lặp agent. Hai thời điểm quan trọng nhất là ngay trước khi một tool chạy và ngay sau khi tool trả kết quả. Ở hai chỗ đó, code của bạn xem và sửa được thứ đang đi qua: lời gọi tool trước khi tool chạy, và kết quả tool trước khi Claude đọc. Các hook chặn ở hai chỗ này gọi chung là **tool call interception hooks**.

Hook **PreToolUse** chặn lời gọi tool ngay trước khi nó chạy để bắt agent theo đúng luật (**intercept outgoing tool calls to enforce compliance rules**). Ví dụ, hook chặn một khoản bồi thường vượt ngưỡng (**block policy-violating actions**) rồi đưa hồ sơ sang một quy trình khác (**redirect to alternative workflows**), như chuyển cho nhân viên duyệt (**human escalation**). Hook **PostToolUse** thì chặn kết quả tool để sửa lại trước khi Claude đọc (**intercept tool results for transformation**). Việc hay gặp nhất là đổi dữ liệu mỗi nơi một kiểu về cùng một dạng (**normalize heterogeneous data formats**), chẳng hạn mốc giờ và mã trạng thái từ nhiều MCP tool khác nhau. Cuối bài so hook với lời dặn trong prompt. Hook là code nên lần nào cũng chạy đúng (**deterministic guarantees**), còn lời dặn thì Claude chỉ làm theo với một xác suất nào đó (**probabilistic compliance**).

**Sơ đồ: Hook chen vào hai chỗ của vòng lặp: trước khi tool chạy và trước khi Claude đọc kết quả**
_Vòng lặp agent với hai điểm hook: PreToolUse giữa Claude và tool (allow, allow kèm updatedInput, deny), PostToolUse giữa tool và Claude, cùng hai chỗ đặt luật nghiệp vụ là lời dặn trong prompt và hook_

- **Claude**: chọn tool,
- điền tool_input
- tool_use
- **PreToolUse**: chạy ngay trước khi tool chạy
- allow
- allow + updatedInput
- (tham số đã sửa)
- **Tool chạy**: MCP tool,
- boi_thuong…
- deny: tool không chạy, lý do về Claude
- kết quả
- **PostToolUse**: trước khi Claude đọc kết quả
- updatedToolOutput: thay kết quả
- additionalContext: ghi thêm
- Claude đọc
- **LUẬT NGHIỆP VỤ ĐẶT Ở ĐÂU**
- **Dặn trong prompt: có lúc lọt**: probabilistic compliance
- **Hook: lần nào cũng chạy**: deterministic guarantees

## Ví dụ xuyên suốt: agent bồi thường hàng hư của một sàn bán nông sản

Một sàn bán rau củ và trái cây online giao hàng trong ngày ở Hà Nội, cam kết giao trong 2 tiếng kể từ lúc xuất kho. Mỗi ngày sàn nhận khoảng 200 yêu cầu bồi thường vì hàng dập, héo hay giao trễ, khách gửi qua chat kèm ảnh. Đội kỹ thuật dựng một agent bằng Agent SDK để xử lý các yêu cầu này. Agent lấy dữ liệu qua ba MCP server, tức ba dịch vụ cung cấp tool theo chuẩn Model Context Protocol, do ba đội khác nhau viết. Server `kho_hang` cho biết lúc hàng xuất kho, `giao_hang` cho biết lúc giao, còn `thanh_toan` cho biết đơn đã thanh toán tới đâu. Đội tự viết thêm server `cskh` với hai tool: `boi_thuong(ma_don, ma_khach, so_tien)` để chuyển tiền bồi thường, và `chuyen_khieu_nai(...)` để chuyển hồ sơ cho bộ phận khiếu nại. Chính sách của sàn chỉ cho agent tự bồi thường tới 3.000.000 đồng mỗi đơn, khoản lớn hơn phải do bộ phận khiếu nại duyệt.

## Chuẩn hoá kết quả tool trước khi Claude đọc

Bà Lan khiếu nại đơn sầu riêng giao trễ. Agent kết luận đơn giao đúng hẹn và từ chối bồi thường. Đội đọc lại log thì thấy ba tool trả về ba kiểu dữ liệu khác nhau. Tool của `kho_hang` ghi giờ xuất kho là `1795132800`, tức một Unix timestamp (số giây tính từ năm 1970). Tool của `giao_hang` ghi giờ giao là `2026-11-20T09:40:00+07:00`, theo chuẩn ISO 8601. Tool của `thanh_toan` ghi trạng thái là `3`, một mã số mà chỉ đội thanh toán biết nghĩa là "đã hoàn tiền một phần". Claude phải tự đổi số giây ra giờ và tự đoán mã `3` nghĩa là gì. Lần này nó đổi số giây theo nhầm múi giờ +8 thành 8 giờ sáng, nên tính ra đơn chỉ đi 1 tiếng 40 phút, trong hạn 2 tiếng. Thực ra hàng xuất kho lúc 7 giờ, giao lúc 9 giờ 40, trễ 40 phút.

Hook PostToolUse chạy ngay sau khi một tool trả kết quả, trước khi kết quả đó tới Claude. Hook có thể trả field `updatedToolOutput` để thay hẳn kết quả mà Claude sẽ thấy, hoặc `additionalContext` để ghi thêm thông tin cạnh kết quả gốc. Đội viết một hook PostToolUse cho các tool của ba server. Hook đổi mọi mốc thời gian về cùng một dạng ISO 8601 theo giờ Việt Nam, và đổi mã trạng thái số thành chữ có nghĩa. Claude giờ nhận được `"xuat_kho": "2026-11-20T07:00:00+07:00"` và `"trang_thai_thanh_toan": "da_hoan_mot_phan"`, nên không còn phải đoán.

**Sơ đồ: Ba server trả ba kiểu dữ liệu, hook PostToolUse đổi về một dạng trước khi Claude đọc**
_Ca bà Lan: kho_hang trả Unix timestamp, giao_hang trả ISO 8601, thanh_toan trả mã số 3; hook PostToolUse trả updatedToolOutput để Claude nhận cùng một dạng_

- **BA SERVER TRẢ VỀ**
- **CLAUDE NHẬN**
- **kho_hang · xuất kho**: 1795132800 (Unix timestamp)
- **giao_hang · giờ giao**: 2026-11-20T09:40:00+07:00
- **thanh_toan · trạng thái**: 3 (mã số)
- **PostToolUse**: updatedToolOutput
- đổi về một dạng
- **xuat_kho**: 2026-11-20T07:00:00+07:00
- **giờ giao (giữ nguyên)**: 2026-11-20T09:40:00+07:00
- **trang_thai_thanh_toan**: da_hoan_mot_phan
- Không có hook: Claude tự đổi giờ, sai múi giờ nên từ chối bồi thường bà Lan
- Có hook: mọi mốc giờ cùng dạng ISO 8601 giờ Việt Nam, mã số thành chữ
- viền đỏ: dạng Claude phải tự đổi, tự đoán
- viền xám: đã đúng dạng

```python
async def chuan_hoa(input_data, tool_use_id, context):
    ket_qua = doi_moc_gio_va_ma_trang_thai(input_data["tool_response"])
    return {"hookSpecificOutput": {
        "hookEventName": input_data["hook_event_name"],
        "updatedToolOutput": ket_qua,
    }}

hooks = {"PostToolUse": [HookMatcher(matcher="mcp__kho_hang__.*|mcp__giao_hang__.*|mcp__thanh_toan__.*", hooks=[chuan_hoa])]}
```

Tên tool của MCP server có dạng `mcp__<tên server>__<tên tool>`. Vì vậy field `matcher`, tức mẫu tên tool mà hook sẽ chạy cho, chỉ cần dùng tiền tố đó là bắt được mọi tool của ba server. Có hai điều cần nhớ về PostToolUse. Thứ nhất, hook chạy khi tool đã chạy xong, nên nó chỉ đổi được thứ Claude nhìn thấy, không huỷ được việc tool đã làm. Muốn chặn hay sửa một lời gọi trước khi nó chạy thì phải dùng PreToolUse. Thứ hai, gom việc chuẩn hoá vào một hook chung tốt hơn là nhờ từng đội sửa server của mình. Sau này có thêm server thứ tư, bạn chỉ cần thêm server đó vào `matcher` và thêm cách đổi dữ liệu của nó vào hook.

Claude Code cũng có hook PostToolUse, và một cách dùng hay gặp là tự định dạng code. Hook PostToolUse với matcher `Edit|Write` chạy Prettier, một công cụ tự định dạng code, cho mỗi file Claude vừa sửa, thay vì trông vào lời dặn "luôn chạy Prettier" trong CLAUDE.md. Hook này không chạy khi file bị ghi bằng `Bash` hay bằng chương trình ngoài Claude Code.

> **Trong đề chọn gì**
>
> Nếu đề tả các MCP tool trả dữ liệu khác định dạng (Unix timestamp, ISO 8601, mã trạng thái số) và agent hiểu sai, hãy chọn hook PostToolUse chuẩn hoá kết quả trước khi agent xử lý. Nếu đề tả Claude Code sinh code định dạng không đều dù CLAUDE.md đã dặn và đã nhấn mạnh, hãy chọn hook PostToolUse với matcher `Edit|Write` chạy formatter. Tách luật định dạng ra file rule theo đường dẫn, gói thành skill, hay thêm một hook Stop nhờ Claude tự kiểm đều vẫn trông vào việc Claude làm theo.

## Chặn lời gọi tool vi phạm chính sách

Chuyện định dạng xử lý xong, đội gặp vấn đề ở chiều ngược lại, tức lời gọi tool mà Claude gửi đi. Ông Hùng đặt một đơn quà Tết gồm nho Mỹ và táo Nhật, trị giá 5.400.000 đồng, và cả đơn bị dập khi giao. System prompt của agent có câu "Không tự bồi thường quá 3.000.000 đồng, khoản lớn hơn phải chuyển bộ phận khiếu nại". Claude vẫn gọi `boi_thuong` với 5.400.000 đồng, vì ông Hùng gửi ảnh rõ ràng và Claude thấy đây là trường hợp hiển nhiên. Đội rà log tháng 10 và thấy khoảng 2% các khoản trên ngưỡng bị agent tự chi như vậy.

Hook PreToolUse chạy ngay trước khi tool chạy, và có thể trả `permissionDecision` là `allow` (cho chạy), `deny` (chặn), `ask` (hỏi người đang vận hành agent) hay `defer` (để luật quyền bình thường quyết). Khi trả `deny`, hook ghi kèm `permissionDecisionReason`, và lý do này được gửi cho Claude. Đội viết một hook PreToolUse cho `boi_thuong`. Nếu `so_tien` lớn hơn 3.000.000, hook trả `deny` với lý do "Vượt hạn mức 3.000.000 đồng. Gọi chuyen_khieu_nai kèm mã đơn, số tiền và ảnh khách gửi". Claude đọc lý do rồi gọi `chuyen_khieu_nai`. Vậy là lời gọi sai chính sách bị chặn lại, còn hồ sơ của ông Hùng đi đúng đường, sang bộ phận khiếu nại.

**Sơ đồ: Chỉ dặn trong prompt thì vẫn lọt khoảng 2%, hook trả deny thì chặn hẳn và chuyển sang khiếu nại**

✗ _Chỉ dặn trong system prompt_
1. Prompt: không tự bồi thường quá **3.000.000** đồng
   ↓ _Claude thấy ca ông Hùng là hiển nhiên_
2. Claude gọi boi_thuong với **5.400.000** đồng, tool chạy
3. **khoảng 2%** khoản trên ngưỡng vẫn bị agent tự chi

✓ _Hook PreToolUse cho boi_thuong_
1. Claude gọi boi_thuong với **5.400.000** đồng
   ↓ _hook thấy so_tien vượt 3.000.000_
2. Hook trả **deny** kèm permissionDecisionReason, tool không chạy
   ↓ _Claude đọc lý do_
3. Claude gọi **chuyen_khieu_nai** kèm mã đơn, số tiền và ảnh
4. **Chặn hẳn** tiền không chuyển, hồ sơ chờ bộ phận khiếu nại duyệt

```python
async def chan_vuot_han_muc(input_data, tool_use_id, context):
    if input_data["tool_input"]["so_tien"] > 3_000_000:
        return {"hookSpecificOutput": {
            "hookEventName": input_data["hook_event_name"],
            "permissionDecision": "deny",
            "permissionDecisionReason": "Vượt hạn mức 3.000.000 đồng. Gọi chuyen_khieu_nai kèm mã đơn, số tiền và ảnh khách gửi.",
        }}
    return {}

hooks = {"PreToolUse": [HookMatcher(matcher="mcp__cskh__boi_thuong", hooks=[chan_vuot_han_muc])]}
```

Trả `{}` nghĩa là hook không quyết gì, lời gọi đi tiếp qua các luật quyền bình thường của SDK. Nếu nhiều hook PreToolUse cùng chạy cho một lời gọi và trả quyết định khác nhau, `deny` thắng mọi quyết định khác.

Có một cách khác cũng chắc chắn không kém là đặt luật ngay trong code của tool. Tool `boi_thuong` có thể tự kiểm số tiền ở phía server. Khoản dưới ngưỡng thì tool chi luôn. Khoản trên ngưỡng thì tool không chi, mà tự tạo một yêu cầu chờ duyệt và trả về trạng thái "đang chờ bộ phận khiếu nại". Khi đó agent không có tham số nào để lách. Cách này khác với một tool chỉ trả lỗi "vượt hạn mức, hãy chuyển khiếu nại" rồi thôi: tool kiểu đó chặn được tiền, nhưng việc chuyển hồ sơ vẫn trông vào Claude tự làm. Hook PreToolUse và tool tự tạo yêu cầu chờ duyệt giống nhau ở chỗ cả việc chặn lẫn việc chuyển đều nằm trong code, chứ không nằm trong lời dặn.

> **Bẫy đề**
>
> Agent tự bồi thường 5.400.000 đồng cho ông Hùng, dù system prompt cấm chi quá 3.000.000 đồng. Làm sao để luật này được tuân thủ lần nào cũng đúng? Bốn đáp án sau nghe hợp lý nhưng sai:
>
> - **Viết system prompt mạnh hơn, in hoa chữ "CRITICAL"** (_a stronger system prompt with emphatic wording_). Ai cũng muốn thử cách này trước vì nó nhanh. Nhưng câu dặn vốn đã có mà vẫn lọt 2%, và viết mạnh hơn chỉ kéo tỉ lệ đó xuống chứ không đưa về 0.
> - **Thêm ví dụ few-shot ở các mức tiền khác nhau** (_few-shot examples at different refund amounts_). Ví dụ giúp Claude thấy rõ ranh giới, nhưng Claude vẫn tự quyết có làm theo hay không, nên luật chỉ được tuân theo phần lớn thời gian.
> - **Hook PreToolUse thêm một cờ cần duyệt vào context, rồi để tool tự kiểm cờ** (_a hook that adds a requires_approval flag to the context_). Cờ đi vào `additionalContext`, tức tới Claude chứ không tới tool, nên tool không có gì để kiểm.
> - **Hook chỉ gửi thông báo hay ghi log mà vẫn cho giao dịch chạy** (_a notification or logging hook while the transaction proceeds_). Cách này có dùng hook thật, nhưng hook chỉ báo tin. Tiền vẫn được chuyển đi trước khi quản lý kịp đọc.
>
> **Chọn:** dùng hook PreToolUse kiểm số tiền trước khi `boi_thuong` chạy, chặn khoản vượt ngưỡng và chuyển hồ sơ sang bộ phận khiếu nại. Để tool tự áp ngưỡng và tự tạo yêu cầu chờ duyệt cũng đạt được bảo đảm này.

## Thay tham số Claude điền bằng giá trị đã xác minh

Sau một vụ khiếu nại giả mạo, đội thêm bước xác minh khách qua mã OTP. Xác minh xong, code của agent lưu mã khách đã xác minh vào session state, tức phần dữ liệu agent giữ riêng cho từng cuộc chat, tra theo `session_id`. Đội cũng thêm một hook PreToolUse chặn `boi_thuong` nếu session chưa có mã đó. Dù vậy, vẫn còn một lỗi lọt qua. Ở một cuộc chat, khách gõ nhầm mã khách của người nhà vào tin nhắn, và Claude điền đúng mã gõ nhầm đó vào `ma_khach` khi gọi `boi_thuong`. Hook chỉ kiểm session đã có mã khách xác minh hay chưa, nên vẫn cho lời gọi chạy, và tiền suýt về tài khoản của người khác.

Hook PreToolUse không chỉ quyết cho lời gọi chạy hay chặn nó lại. Hook còn có thể trả `updatedInput` để thay tham số của lời gọi trước khi tool chạy. Đội sửa hook. Khi session đã có mã khách xác minh, hook trả `permissionDecision` là `allow` kèm `updatedInput`, trong đó `ma_khach` được thay bằng mã lưu trong session. Dù Claude điền gì vào `ma_khach`, tool luôn chạy với giá trị đã xác minh. Nếu chỉ trả `allow` mà không có `updatedInput`, tool sẽ chạy với giá trị Claude điền. Còn nếu trả `deny` rồi bảo Claude gọi lại với mã đúng, bạn vẫn phải trông Claude chép lại mã cho đúng.

**Sơ đồ: Chỉ allow kèm updatedInput mới bảo đảm boi_thuong chạy với mã khách đã xác minh**
- chỉ allow
- deny, bảo gọi lại
- allow + updatedInput
- Claude gọi boi_thuongma_khach = mã gõ nhầm
- HookPreToolUse
- Session statemã khách đã xác minh
- Tool chạy với mã gõ nhầmtiền về người khác
- Trông vào Claudechép lại mã cho đúng
- Tool chạy vớimã khách đã xác minh

```python
ma_da_xac_minh = trang_thai_session[input_data["session_id"]]["ma_khach"]
tham_so_moi = dict(input_data["tool_input"], ma_khach=ma_da_xac_minh)
return {"hookSpecificOutput": {
    "hookEventName": input_data["hook_event_name"],
    "permissionDecision": "allow",
    "updatedInput": tham_so_moi,
}}
```

> **Trong đề chọn gì**
>
> Nếu đề đòi một tham số luôn phải là giá trị đã xác minh từ bước trước, không bao giờ là giá trị Claude gõ lại từ hội thoại, hãy chọn hook PreToolUse trả `allow` kèm `updatedInput` thay tham số đó bằng giá trị trong session state.

## Khi nào dùng hook, khi nào dặn trong prompt

Sau ba lần sửa, đội rà lại toàn bộ system prompt của agent. Có những câu dặn vẫn để nguyên, như "Xưng hô lễ phép với khách lớn tuổi" hay "Hỏi khách có muốn đổi hàng thay vì nhận tiền không". Có những luật đã nằm ở hook, như hạn mức 3.000.000 đồng hay bước xác minh khách. Cách đội phân loại dựa vào một câu hỏi: nếu Claude làm sai luật này một lần, thiệt hại có chấp nhận được không?

Ép luật bằng lời dặn (**prompt-based enforcement**) hợp với những việc cần phán đoán theo ngữ cảnh và sai một lần cũng không sao, như giọng điệu, cách xưng hô hay thứ tự hỏi thăm. Hook là code, lần nào cũng chạy như nhau, không phụ thuộc Claude có nhớ lời dặn hay không. Luật nào phải được tuân thủ lần nào cũng đúng (**guaranteed compliance**), như hạn mức tiền hay bước xác minh, thì nên đặt vào hook.

Hook cũng có giới hạn. Hook chỉ kiểm được những gì viết thành điều kiện trong code, như số tiền có vượt ngưỡng không, một field có đúng dạng không, hay mã khách có phải mã đã xác minh không. Nó không bảo đảm được Claude suy luận đúng, chẳng hạn kết luận một đơn có thật sự bị dập hay không, và cũng không phải chỗ để ép giọng điệu hay cách nói chuyện.

| Việc cần làm | Hợp với | Vì sao |
| --- | --- | --- |
| Chặn khoản bồi thường trên 3.000.000 đồng | Hook PreToolUse | Một lần sai là mất tiền, code kiểm con số được |
| Thay mã khách bằng mã đã xác minh | Hook PreToolUse với `updatedInput` | Giá trị phải do code quyết, không do Claude gõ |
| Đổi mốc giờ và mã trạng thái về một dạng | Hook PostToolUse | Đổi theo quy tắc cố định, phải xong trước khi Claude đọc |
| Xưng hô lễ phép, gợi ý đổi hàng | Lời dặn trong system prompt | Cần phán đoán theo ngữ cảnh, sai một lần không gây thiệt hại |

> **Bẫy đề**
>
> Đề đưa bốn tình huống và hỏi đâu là chỗ nên dùng hook. Hai tình huống sau nghe có lý nhưng sai:
>
> - **Dùng hook để ép giọng điệu, sự lịch sự và persona** (_enforce tone, politeness and persona_). Giọng điệu đúng là thứ cần giữ nhất quán. Nhưng hook là code kiểm từng lời gọi tool, còn giọng điệu là cách Claude viết, nên chỗ của nó là system prompt.
> - **Dùng hook để bảo đảm JSON Claude trích ra không có lỗi suy luận** (_guarantee extracted JSON has no semantic reasoning errors_). Hook kiểm được JSON có đúng dạng, nhưng không biết Claude hiểu nội dung đúng hay sai.
>
> **Chọn:** chặn lời gọi tool vi phạm chính sách, như giao dịch tài chính không được phép, và đổi mã trạng thái dạng số, mỗi MCP tool một kiểu, về cùng một dạng trước khi đưa vào context.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Intercept and control agent behavior with hooks (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/hooks)
3. [Hooks reference (Claude Code)](https://code.claude.com/docs/en/hooks)
