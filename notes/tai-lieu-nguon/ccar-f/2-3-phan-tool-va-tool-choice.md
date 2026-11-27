---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-3-phan-tool-va-tool-choice
ngay_tai: 2026-11-27
tieu_de: Phân tool cho từng agent và cấu hình tool_choice
---

Domain 2: Tool Design & MCP Integration · Task 2.3

# Phân tool cho từng agent và cấu hình tool_choice

Vì sao agent có quá nhiều tool thì chọn kém, cách giới hạn tool theo vai, thay tool chung bằng tool có giới hạn, và dùng tool_choice để buộc gọi tool.

- 17 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Hiểu vì sao đưa quá nhiều tool cho một agent làm việc chọn tool kém đi
- Giới hạn tool của mỗi subagent theo đúng vai của nó
- Thay tool chung chung bằng tool có giới hạn, và cấp tool dùng chéo vai cho việc cần thường xuyên
- Dùng tool search để nạp tool khi cần với thư viện tool lớn
- Cấu hình tool_choice auto, any và ép một tool cụ thể

Trong hệ thống nhiều agent, câu hỏi không chỉ là viết tool nào, mà còn là agent nào được dùng tool nào. Cho mọi agent dùng chung mọi tool nghe thì tiện, vì agent nào cũng làm được mọi việc. Nhưng thực tế, agent càng có nhiều tool thì càng dễ chọn nhầm, và hay tự làm cả những việc vốn không phải của nó.

Bài này lần lượt nói về việc phân tool theo vai, thay tool chung chung bằng tool có giới hạn, cấp tool dùng chéo vai cho việc hay gặp, xử lý một thư viện tool rất lớn, và dùng `tool_choice` để buộc Claude gọi tool khi bạn cần.

**Sơ đồ: Bạn chỉnh hai thứ: tools quyết agent thấy tool nào, tool_choice quyết Claude có buộc gọi tool không**
_Bản đồ bài: quá nhiều tool làm agent chọn nhầm; bốn cách chỉnh danh sách tools là giới hạn theo vai, tool có giới hạn, tool dùng chéo vai, tool search; tham số tool_choice có bốn giá trị auto, any, tool, none; cả hai cùng quyết Claude gọi tool nào_

- **TOOLS: AGENT THẤY NHỮNG TOOL NÀO**
- **Quá nhiều tool**: chọn nhầm, làm ngoài vai
- sửa bằng bốn cách:
- **Giới hạn theo vai**: scoped tool access
- **Tool có giới hạn**: thay tool chung chung
- **Tool dùng chéo vai**: hẹp, cho việc hay cần
- **Tool search**: defer_loading, nạp khi cần
- **TOOL_CHOICE: CÓ BUỘC GỌI?**
- **auto**: tự quyết, là mặc định
- **any**: phải gọi, tự chọn tool
- **tool + name**: phải gọi đúng tool đó
- **none**: không được gọi tool
- **Claude chọn và gọi tool**

## Ví dụ xuyên suốt: hệ thống soạn hồ sơ du học

Một công ty tư vấn du học ở TP.HCM giúp khoảng 300 học sinh mỗi năm nộp hồ sơ vào đại học ở Úc, Canada và Hàn Quốc. Đội kỹ thuật của công ty dựng một hệ thống nhiều agent để soạn báo cáo tư vấn cho từng học sinh. Agent điều phối nhận yêu cầu của tư vấn viên, phân loại yêu cầu đó, rồi giao việc cho bốn subagent:

- `tim-truong` tìm thông tin trường và học bổng trên web.
- `doc-tai-lieu` đọc tài liệu tuyển sinh dạng PDF do các trường đăng.
- `tong-hop` gom kết quả của `tim-truong` và `doc-tai-lieu` rồi so sánh các lựa chọn.
- `viet-bao-cao` viết báo cáo cuối gửi phụ huynh.

Trước khi giao việc, hệ thống còn một bước nhận hồ sơ: tư vấn viên gửi bảng điểm và thông tin học sinh để Claude trích thành dữ liệu có cấu trúc.

## Quá nhiều tool làm agent chọn kém đi

Ở bản đầu, đội cho cả bốn subagent dùng chung trọn bộ 18 tool, từ `tim_web`, `tai_url`, `doc_pdf` tới `tinh_hoc_phi`, `xuat_bao_cao`. Ý định là để agent nào gặp việc gì cũng tự làm được. Khi chạy thử, các agent liên tục làm việc ngoài vai của mình. `tong-hop` tự gọi `tim_web` để tìm thêm thông tin thay vì dùng kết quả đã có, và thường lấy về các bài blog cũ. `viet-bao-cao` thì tự mở lại PDF của trường để đọc, dù `doc-tai-lieu` đã đọc xong.

Nguyên nhân chính là mỗi agent phải chọn trong quá nhiều tool. Chọn đúng một tool trong 18 tool khó hơn nhiều so với chọn trong 4–5 tool liên quan tới việc của mình, vì quyết định phức tạp hơn hẳn (**decision complexity**), và độ tin cậy khi chọn tool (**tool selection reliability**) giảm theo. Mỗi lần gọi tool, agent phải cân nhắc thêm hơn chục lựa chọn chẳng liên quan gì tới vai của nó, và mỗi lựa chọn thừa là thêm một cơ hội chọn sai. Ngoài ra, hễ có sẵn tool ngoài chuyên môn (**tools outside their specialization**) là agent dễ dùng tới. `tong-hop` có `tim_web` trong tay nên tự đi tìm, dù tìm kiếm không phải việc của nó.

Ngay cả với một agent đa năng, Claude cũng bắt đầu chọn nhầm tool nhiều hơn khi số tool vượt quá khoảng 30–50. Một subagent chỉ làm một việc hẹp thì càng nên có ít tool.

> **Trong đề chọn gì**
>
> Đề có thể kể các subagent cùng có trọn bộ tool, chẳng hạn 18 tool, và hay gọi tool ngoài chuyên môn, như agent tổng hợp tự đi tìm web. Khi đề hỏi nguyên nhân chính, hãy chọn đáp án nói rằng agent phải chọn trong quá nhiều tool thay vì 4–5 tool liên quan, nên quyết định quá phức tạp. Đổ cho agent điều phối không nắm được subagent làm được gì là sai, vì việc vẫn được giao đúng subagent, chỉ là subagent đó gọi nhầm tool. Đổ cho system prompt mô tả vai mâu thuẫn với bộ tool cũng sai, vì sửa system prompt mà vẫn để 18 tool thì agent vẫn phải chọn trong 18 tool. Còn 18 định nghĩa tool thì chưa đủ để làm đầy context, nên đó cũng không phải nguyên nhân chính.

## Giới hạn tool theo vai của từng subagent

Để sửa, đội giới hạn tool theo vai (**scoped tool access**), tức mỗi subagent chỉ được dùng những tool cần cho việc của nó:

| Subagent | Tool được dùng |
| --- | --- |
| `tim-truong` | `tim_web`, `trich_ket_qua_web`, `tra_hoc_bong` |
| `doc-tai-lieu` | `tai_url`, `doc_pdf`, `trich_bang_hoc_phi` |
| `tong-hop` | `so_sanh_lua_chon`, `tinh_hoc_phi` |
| `viet-bao-cao` | `xuat_bao_cao`, `chen_bang_so_sanh` |

Nếu dựng hệ thống bằng Agent SDK (bộ thư viện của Anthropic để viết agent), bạn khai báo việc này qua field `tools` khi định nghĩa subagent. `tools` là danh sách tên tool subagent được dùng. Nếu không khai báo field này, subagent nhận mọi tool mà nó được phép có. Sau khi giới hạn, `tong-hop` không còn `tim_web` nên không tự đi tìm được nữa, và mỗi agent chỉ còn chọn trong hai ba tool. Agent không còn dùng nhầm tool của vai khác (**cross-specialization misuse**), vì nó không có tool đó trong tay.

## Thay tool chung chung bằng tool có giới hạn

Bộ tool mới của `doc-tai-lieu` vẫn còn một chỗ hở. Subagent này có tool `tai_url`, tải về bất kỳ URL nào. Nhiệm vụ của nó là đọc tài liệu tuyển sinh chính thức. Nhưng khi `tim-truong` gửi qua một danh sách link lẫn lộn, `doc-tai-lieu` tải luôn cả bài trên diễn đàn và trang của công ty môi giới, rồi lấy học phí ghi ở đó như số chính thức.

Đội thay tool chung chung (**generic tool**) `tai_url` bằng `tai_tai_lieu_truong`, một tool có giới hạn (**constrained alternative**). Tool này chỉ nhận URL thuộc tên miền của các trường trong danh sách đối tác, chỉ tải file PDF hoặc trang tuyển sinh, và trả lỗi rõ ràng khi URL nằm ngoài danh sách: "URL không thuộc trang chính thức của trường nào trong danh sách. Hãy nhờ agent điều phối tìm tài liệu chính thức." Vì chính code của tool kiểm tra URL, agent không thể vô tình đọc nhầm nguồn, dù prompt có dặn nó cẩn thận hay không.

Tool càng chung chung thì agent càng có nhiều cách dùng sai. Tool có giới hạn chỉ nhận đúng loại đầu vào của việc cần làm, nên agent khó dùng sai hơn, và cũng hiểu ngay tool đó để làm gì.

## Tool dùng chéo vai cho việc hay gặp

Giới hạn tool chặt quá cũng có cái giá. Khi so sánh các lựa chọn, `tong-hop` rất hay cần kiểm tra một con số cụ thể, như học phí năm nhất của một ngành hay hạn nộp hồ sơ học bổng. Nếu lần nào cũng phải trả việc về agent điều phối, chờ nó giao cho `tim-truong` rồi chờ kết quả quay lại, thì mỗi báo cáo mất thêm vài phút chỉ vì những lần kiểm tra rất nhỏ.

Đội cấp cho `tong-hop` một tool dùng chéo vai (**cross-role tool**), tức một tool làm một phần nhỏ của việc vốn thuộc vai khác, ở đây là việc tra cứu của `tim-truong`. Tool đó là `xac_minh_du_kien`, dành cho nhu cầu hay gặp (**high-frequency needs**). Tool này nhận một dữ kiện cùng nguồn của nó, lấy từ kết quả `tim-truong` đã trả về, rồi tra lại đúng trang chính thức đó và trả "khớp", "không khớp" hay "không tìm thấy". Nó không tìm kiếm tự do, cũng không mở trang mới ngoài nguồn đã có. Những trường hợp phức tạp hơn, như cần tìm một học bổng mới hay so với một trường chưa có trong kết quả, vẫn đi qua agent điều phối để giao cho `tim-truong` (**routing complex cases through the coordinator**).

Nhờ vậy, việc kiểm tra nhỏ thì nhanh mà ranh giới giữa các vai vẫn giữ được. `tong-hop` tự kiểm tra con số bằng một tool hẹp. Còn việc tìm kiếm thật sự vẫn đi qua agent điều phối, nên `tong-hop` không biến thành một agent tìm kiếm thứ hai.

**Sơ đồ: Từ 18 tool dùng chung sang vài tool theo vai, cộng một tool hẹp cho việc tong-hop hay cần**
_Bản đầu cả bốn subagent tim-truong, doc-tai-lieu, tong-hop, viet-bao-cao dùng chung 18 tool nên tong-hop tự gọi tim_web và viet-bao-cao mở lại PDF; bản sau mỗi subagent chỉ có vài tool theo vai, tong-hop tự kiểm dữ kiện bằng xac_minh_du_kien trên trang đã có, còn học bổng mới hay trường mới thì đi qua agent điều phối để giao cho tim-truong_

- **BẢN ĐẦU: CẢ BỐN SUBAGENT DÙNG CHUNG 18 TOOL**: tim-truong
- doc-tai-lieu
- tong-hop
- viet-bao-cao
- **18 tool dùng chung**: tim_web, tai_url, doc_pdf, …, tinh_hoc_phi, xuat_bao_cao
- tong-hop tự gọi tim_web, lấy blog cũ; viet-bao-cao mở lại PDF đã đọc
- **SAU: TOOL THEO VAI, CỘNG MỘT TOOL DÙNG CHÉO VAI**
- **Agent điều phối**: giao cho tim-truong
- học bổng mới, trường mới
- **tim-truong**: chỉ 3 tool
- **doc-tai-lieu**: chỉ 3 tool
- **tong-hop**: không còn tim_web
- **viet-bao-cao**: chỉ 2 tool
- việc nhỏ, hay cần: tong-hop tự kiểm
- **xac_minh_du_kien**: trang đã có

> **Bẫy đề**
>
> Agent tổng hợp thường xuyên cần kiểm tra một dữ kiện. Mỗi lần như vậy, nó trả việc về agent điều phối, agent điều phối gọi agent tìm kiếm, rồi gọi lại agent tổng hợp, nên rất chậm. Phần lớn các lần kiểm tra chỉ là tra ngày, tên hay một con số. Nên làm gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Cho agent tổng hợp dùng mọi tool tìm web** (_give the synthesis agent access to all web search tools_). Nghe nhanh nhất vì agent tự kiểm tra được ngay. Nhưng làm vậy là cấp thừa tool, đúng kiểu dùng tool ngoài chuyên môn đã khiến hệ thống chọn nhầm tool và lấy phải nguồn kém tin cậy.
> - **Gom mọi nhu cầu kiểm tra, cuối lượt trả một lần cho agent điều phối** (_batch all verification needs_). Nghe gọn vì chỉ còn một lần chuyển việc. Có điều các bước tổng hợp sau thường dựa vào dữ kiện đã kiểm tra ở bước trước, nên gom lại tới cuối thì những bước đó phải chờ.
> - **Cho agent tìm kiếm lưu sẵn thêm ngữ cảnh quanh mỗi nguồn** (_proactively cache extra context_). Nghe chu đáo vì dữ kiện có sẵn trước khi cần. Ngặt nỗi không ai đoán trước được agent tổng hợp sẽ cần kiểm tra chỗ nào.
>
> **Chọn:** cấp một tool dùng chéo vai, phạm vi hẹp cho đúng việc hay cần, như `verify_fact` cho agent tổng hợp (giống `xac_minh_du_kien` của `tong-hop`), còn các trường hợp phức tạp vẫn đi qua agent điều phối. Nếu đề kể một tool chung như `fetch_url` bị dùng sai nguồn, chọn thay nó bằng tool có giới hạn như `load_document` có kiểm tra URL, giống `tai_tai_lieu_truong`.

## Thư viện tool lớn: chỉ nạp tool khi cần

Công ty sau đó làm việc với 60 trường đối tác. Mỗi trường có một connector riêng, tức một tool gọi vào cổng tuyển sinh của trường đó để tra tình trạng hồ sơ. Đưa cả 60 connector vào một agent thì agent chọn sai rất nhiều. Đội thử viết thêm một tool `tim_connector(mo_ta)` trả về các connector khớp, nhưng gặp hai chuyện. Có lúc agent bỏ qua bước tìm, đoán đại rồi gọi thẳng một connector, vì cả 60 connector vẫn nằm sẵn trong danh sách tool. Có lúc agent tìm xong rồi vẫn chọn sai trong số connector vừa tìm ra.

Cách giải đúng là để connector chỉ xuất hiện khi đã được tìm ra. Claude API có tool search (**tool search tool**) cho việc này. Bạn khai báo đủ 60 connector trong `tools` nhưng đặt `defer_loading: true` cho chúng, nên ban đầu Claude chỉ thấy tool search. Khi Claude tìm, API trả về những tool khớp nhất, mặc định tối đa 5 tool, và nạp định nghĩa đầy đủ của chúng vào để Claude chọn. Connector chưa được tìm ra thì chưa có định nghĩa trong context, nên Claude không có gì để đoán mà gọi thẳng. Sau khi tìm, Claude chỉ còn chọn trong vài connector, nên cũng ít chọn sai hơn.

**Sơ đồ: Tự viết tim_connector thì agent vẫn gọi đoán mò; defer_loading giấu connector tới khi được tìm ra**

✗ _Tự viết tool tim_connector(mo_ta)_
1. Cả **60 connector** vẫn nằm sẵn trong danh sách tool
   ↓ _agent bỏ qua bước tìm_
2. Gọi thẳng một connector đoán mò
3. **60 connector** lúc nào cũng gọi được, nên chọn sai rất nhiều

✓ _Tool search và defer_loading: true_
1. Ban đầu Claude chỉ thấy tool search
   ↓ _Claude tìm, API nạp định nghĩa đầy đủ của các tool khớp_
2. Connector chưa tìm ra thì chưa có trong context
3. **5 tool** tối đa theo mặc định, Claude chọn trong nhóm đã lọc

> **Bẫy đề**
>
> Agent có hơn 50 connector, và tool tìm connector tự viết không giải quyết được: agent lúc bỏ qua bước tìm để gọi thẳng, lúc tìm xong vẫn chọn sai. Nên ghép tool thế nào để xử lý cả hai chuyện? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Viết mô tả chi tiết cho mọi connector, kèm few-shot "tìm rồi mới dùng"** (_richer descriptions plus few-shot examples_). Nghe như mô tả tốt hơn thì chọn đúng hơn. Nhưng cả 50 connector vẫn nằm sẵn và gọi thẳng được, nên agent vẫn có thể bỏ qua bước tìm.
> - **Gộp thành một tool `find_and_execute` vừa tìm vừa chạy connector khớp nhất** (_a combined find_and_execute tool_). Nghe gọn vì không còn bước nào để bỏ qua. Có điều tool tự chạy connector khớp nhất, nên Claude không còn được chọn trong nhóm đã lọc, và tool khớp nhất chưa chắc đã đúng.
> - **Cho mỗi connector tự kiểm tra tương thích, trả lỗi khi request không khớp** (_built-in compatibility checks_). Nghe an toàn. Ngặt nỗi connector sai vẫn bị gọi trước rồi mới báo lỗi, nên số lần chọn sai không giảm.
>
> **Chọn:** cho bước tìm thêm các connector khớp vào danh sách tool của agent, còn ban đầu connector chưa dùng được, đúng như tool search với `defer_loading: true`.

## Dùng tool_choice để buộc gọi tool

Ở bước nhận hồ sơ, Claude dùng tool `trich_ho_so` để trích bảng điểm và thông tin học sinh thành dữ liệu có cấu trúc. Sau đó Claude mới gọi các tool bổ sung thông tin như `loc_hoc_bong(gpa, nganh)` và `kiem_dieu_kien_visa(quoc_gia, ...)`. Khi tư vấn viên gõ "trích hồ sơ và xem em này có học bổng nào", Claude đôi khi gọi `loc_hoc_bong` trước, và lần gọi đó hỏng vì chưa có điểm GPA, mà GPA chỉ có sau khi `trich_ho_so` chạy xong.

Để sửa chuyện thứ tự, đội dùng tham số `tool_choice` của Claude API. Tham số này quyết định Claude có bắt buộc gọi tool hay không, theo bốn giá trị sau:

| Giá trị | Nghĩa |
| --- | --- |
| `{"type": "auto"}` | Claude tự quyết gọi tool nào hay trả lời bằng chữ. Đây là mặc định khi có `tools` |
| `{"type": "any"}` | Claude phải gọi một tool trong danh sách, nhưng tự chọn tool nào |
| `{"type": "tool", "name": "..."}` | Claude phải gọi đúng tool có tên đó (**forced tool selection**) |
| `{"type": "none"}` | Claude không được gọi tool nào |

Để chắc chắn `trich_ho_so` chạy trước, đội đặt `tool_choice` là `{"type": "tool", "name": "trich_ho_so"}` cho request đầu tiên. Khi đã có kết quả trích, các request tiếp theo (**follow-up turns**) chuyển về `{"type": "auto"}`, để Claude tự chọn giữa `loc_hoc_bong`, `kiem_dieu_kien_visa` hay trả lời luôn. Đội chỉ ép tool ở đúng bước phải chạy trước, chứ không ép suốt cả pipeline, vì nếu request nào cũng ép thì Claude chỉ gọi được mỗi `trich_ho_so`.

**Sơ đồ: Ép trich_ho_so ở request đầu để có GPA, rồi về auto cho Claude tự chọn bước tiếp**
Bên tham gia: Claude, App của công ty

1. Request 1, tool_choice:
2. {"type": "tool",
3. "name": "trich_ho_so"}
4. tool_use trich_ho_so
5. (GPA, ngành)
6. Request 2, kèm kết quả trích
7. tool_choice: {"type": "auto"}
8. loc_hoc_bong,
9. kiem_dieu_kien_visa
10. hay trả lời luôn

Giá trị `any` hợp với một kiểu việc khác. Bước phân loại yêu cầu của agent điều phối phải luôn trả kết quả qua một trong ba tool `yeu_cau_moi`, `cap_nhat_ho_so` hay `hoi_dap`, vì code phía sau chỉ đọc lời gọi tool. Có lúc Claude trả lời thẳng bằng một câu văn bình thường, và code không biết xử lý câu đó thế nào. Đặt `tool_choice` là `{"type": "any"}` bảo đảm Claude luôn gọi một tool thay vì trả lời bằng chữ (**guarantee a tool call rather than conversational text**), mà vẫn để Claude chọn tool nào.

Có hai điều cần biết khi ép gọi tool. Thứ nhất, với `any` hoặc ép một tool, câu trả lời của Claude bắt đầu ngay bằng lời gọi tool, nên Claude không viết đoạn giải thích nào trước đó, kể cả khi được yêu cầu. Nếu muốn Claude vừa giải thích bằng chữ vừa gọi tool, bạn để `auto` và ghi rõ trong user message rằng Claude cần dùng tool đó. Có điều `auto` kèm lời dặn chỉ khuyến khích chứ không bảo đảm Claude sẽ gọi tool.

Thứ hai, không phải lúc nào cũng ép tool được. Nếu bạn bật extended thinking (cho Claude suy nghĩ trước khi trả lời) theo kiểu thủ công, tức `thinking: {type: "enabled"}`, API báo lỗi khi `tool_choice` là `any` hoặc `tool`. Các model như Claude Opus 5.5, Claude Sonnet 5.5, Claude Fable 5.1 và 5.2, Claude Mythos 5.1 và 5.2 trả lỗi 400 với `any` và `tool`, bất kể cấu hình thinking. Trên các model này, hãy dùng `auto` kèm strict tool use, tức chế độ bắt tham số Claude truyền vào tool phải đúng schema. Còn nếu cần câu trả lời theo một dạng JSON cố định, hãy dùng structured outputs. Với những model bật thinking sẵn mà vẫn nhận ép tool, như Claude Opus 5 hay Claude Haiku 5.5, một lời gọi bị ép sẽ bỏ qua bước thinking.

> **Bẫy đề**
>
> Claude đôi khi gọi tool bổ sung thông tin trước, và lần gọi đó lỗi vì tool cần dữ liệu chỉ có sau khi `extract_metadata` (giống `trich_ho_so` trong bài) chạy xong. Cách nào bảo đảm `extract_metadata` chạy trước? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **`tool_choice: "any"` kèm lời dặn ưu tiên `extract_metadata`** (_any plus a system prompt instruction_). Nghe chắc vì `any` buộc Claude gọi tool. Nhưng `any` không buộc gọi tool nào, nên thứ tự vẫn trông vào lời dặn.
> - **Để `auto` và xếp `extract_metadata` lên đầu mảng `tools`** (_reorder the tools array_). Nghe như Claude sẽ ưu tiên tool đứng trước. Có điều thứ tự trong mảng không phải là cách ép Claude gọi tool nào trước, chỉ `tool_choice` mới ép được.
> - **Ép `extract_metadata` cho mọi request trong pipeline** (_force it on every call_). Cách này chắc chắn làm `extract_metadata` chạy trước. Ngặt nỗi các bước sau cũng bị ép gọi lại đúng tool đó, nên không bao giờ tới được bước bổ sung.
>
> **Chọn:** ép `{"type": "tool", "name": "extract_metadata"}` cho request đầu, rồi xử lý các bước bổ sung ở các request sau. Làm tương tự nếu một agent phải gọi `create_profile` trước mọi việc khác: ép tool đó ở request đầu rồi chuyển về `auto`. `none` ở request đầu là sai, vì nó cấm luôn lời gọi `create_profile`. `any` cho cả hội thoại cũng sai, vì sau bước đầu agent phải được trả lời người dùng bằng chữ. Nếu đề hỏi cách bảo đảm Claude gọi một tool thay vì trả lời bằng chữ mà không chỉ định tool nào, chọn `any`. Nếu đề hỏi ép tool có cho Claude viết suy luận bằng chữ trước lời gọi không, câu trả lời là không, và `any` cũng vậy. Muốn có cả suy luận lẫn lời gọi chắc chắn thì không có cấu hình nào làm được: `auto` kèm lời dặn có chữ nhưng không bảo đảm lời gọi.

> **Ý chính**
>
> Mỗi agent chỉ nên có vài tool cho đúng vai của nó, cộng tool hẹp dùng chéo vai cho việc hay cần. Tool chung chung thì thay bằng tool có giới hạn. Thư viện tool lớn thì đặt `defer_loading` và để Claude tìm bằng tool search. Muốn một tool chạy trước, bạn ép đúng tool đó ở request đầu rồi chuyển về `auto`. Muốn chắc Claude gọi một tool nào đó thay vì trả lời bằng chữ, bạn dùng `any`. Trước khi ép tool, hãy kiểm tra model đang dùng có hỗ trợ việc này không.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 2.3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Define tools (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
3. [Tool search tool (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
4. [Subagents in the SDK (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/subagents)
5. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/research/writing-tools-for-agents)
