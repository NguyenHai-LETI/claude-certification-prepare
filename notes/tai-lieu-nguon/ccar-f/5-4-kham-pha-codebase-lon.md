---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-4-kham-pha-codebase-lon
ngay_tai: 2026-11-27
tieu_de: Quản lý context khi tìm hiểu codebase lớn
---

Domain 5: Context Management & Reliability · Task 5.4

# Quản lý context khi tìm hiểu codebase lớn

Cách nhận ra context suy giảm trong session khám phá dài, và giữ phát hiện bằng file ghi chú, subagent, bản tóm tắt chuyển giai đoạn, manifest và /compact.

- 22 phút đọc
- Đối chiếu docs 22/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Nhận ra dấu hiệu context suy giảm trong session khám phá codebase dài
- Dùng file ghi chú để giữ các phát hiện quan trọng qua nhiều giai đoạn
- Giao từng câu hỏi cụ thể cho subagent, để agent chính lo phần điều phối
- Tóm tắt giai đoạn trước rồi đưa bản tóm tắt vào context ban đầu của subagent giai đoạn sau
- Thiết kế khôi phục sau sự cố bằng manifest, và dùng /compact khi context đầy output khám phá

Tìm hiểu một codebase lớn là việc đọc rất nhiều: mở file, lần theo import, chạy tìm kiếm. Mọi thứ Claude đọc vào đều nằm lại trong context, tức phần văn bản Claude nhìn thấy trong một session làm việc. Sau một lúc, context đầy nội dung những file đã đọc qua, và Claude bắt đầu quên những gì nó tìm ra lúc đầu.

Bài này giúp bạn nhận ra lúc context bắt đầu suy giảm, và giữ được các phát hiện qua một session khám phá dài. Bạn sẽ biết khi nào dùng file ghi chú, khi nào giao việc cho subagent, cách nối các giai đoạn bằng bản tóm tắt, cách cho một hệ nhiều agent chạy tiếp sau sự cố, và lúc nào nên chạy `/compact`.

**Sơ đồ: Claude quên điều đã tìm ra thì giữ phát hiện ngoài context; hệ chạy lâu thêm manifest để chạy tiếp**
_Bản đồ bài. Nhóm dấu hiệu context suy giảm trong session khám phá dài: Claude trả lời trái ngược điều đã nói lúc trước, nói về mẫu thường gặp thay vì tên class đã tìm ra, người dùng phải nhắc lại điều đã tìm ra. Nhóm bốn cách giữ phát hiện và dọn chỗ. Một, file ghi chú trên đĩa: ghi điều đã kiểm, đọc lại trước khi trả lời. Hai, subagent cho từng câu hỏi: đọc trong context riêng, gửi về bản tóm tắt. Ba, tóm tắt trước khi sang giai đoạn sau: đưa vào context ban đầu của subagent mới. Bốn, /compact khi context đầy: nén lịch sử dài, kèm phần cần giữ. Nhóm hệ nhiều agent chạy lâu: mỗi agent ghi trạng thái ra một chỗ cố định; khi chạy lại, agent điều phối đọc file manifest và đưa phần liên quan vào prompt_

- **DẤU HIỆU CONTEXT SUY GIẢM**: Trả lời trái ngược điều
- đã nói lúc trước
- Nói "mẫu thường gặp" thay
- vì tên class đã tìm ra
- Người dùng phải nhắc lại
- điều đã tìm ra
- **GIỮ PHÁT HIỆN, DỌN CHỖ TRONG CONTEXT**
- 1. **File ghi chú trên đĩa**: ghi điều đã kiểm, đọc lại trước khi trả lời
- 2. **Subagent cho từng câu hỏi**: đọc trong context riêng, gửi về bản tóm tắt
- 3. **Tóm tắt trước khi sang giai đoạn sau**: đưa vào context ban đầu của subagent mới
- 4. **/compact khi context đầy**: nén lịch sử dài, kèm phần cần giữ
- **HỆ NHIỀU AGENT CHẠY LÂU**: Mỗi agent ghi trạng thái ra một chỗ cố định.
- Khi chạy lại, agent điều phối đọc file manifest và đưa phần liên quan vào prompt

## Ví dụ xuyên suốt: ví điện tử học đường của một công ty fintech

Một công ty fintech ở Bắc Ninh làm ví điện tử cho 300 trường học. Phụ huynh nạp tiền vào ví để đóng học phí, tiền ăn bán trú và tiền xe đưa đón. Codebase viết bằng Java trong sáu năm, có khoảng 2.600 file chia thành 18 module. Nhóm có một máy chủ chạy các job tự động qua đêm.

Chị Loan là trưởng nhóm. Khoa mới vào làm được hai tuần và nhận việc đầu tiên: thêm tính năng hoàn học phí một phần khi học sinh chuyển trường giữa kỳ. Khoa chưa biết gì về luồng hoàn tiền, nên dùng Claude Code để tìm hiểu codebase trước khi sửa.

## Dấu hiệu context suy giảm trong session dài

Khoảng 40 phút đầu, mọi thứ suôn sẻ. Claude tìm ra ba điều. `RefundOrchestrator` là class điều phối việc hoàn tiền, còn `LedgerAdjuster` ghi bút toán vào sổ cái. Tiền hoàn vào ví thì đi qua queue `refund-events`, rồi `RefundQueueConsumer` đọc từ queue đó và cộng tiền vào ví.

Session kéo dài gần hai tiếng, và tới lúc đó Claude đã đọc khoảng 60 file cùng nhiều kết quả tìm kiếm dài. Khoa hỏi hoàn học phí nên gọi vào đâu, và Claude trả lời: "Thường các hệ thống thanh toán sẽ có một service hoàn tiền gọi tới lớp ghi sổ." Câu đó không nhắc tên class nào đã tìm ra. Ngay câu trả lời tiếp theo, Claude lại bảo tiền hoàn vào ví được ghi sổ ngay trong cùng request, ngược với chuyện queue mà chính nó kể lúc đầu session. Khoa phải dán lại tên các class vào khung chat.

Đây là dấu hiệu context suy giảm trong session dài (**context degradation in extended sessions**). Claude bắt đầu trả lời không nhất quán (**inconsistent answers**), và nói về "mẫu thường gặp" (**"typical patterns"**) thay vì các class cụ thể nó đã tìm ra trước đó (**specific classes discovered earlier**). Nguyên nhân là mọi file đã đọc và mọi kết quả tool đều nằm lại trong context. Context càng nhiều token, Claude càng khó nhớ lại chính xác một chi tiết trong đó (**context rot**). Những phát hiện từ sớm bị vùi dưới hàng chục file đọc sau.

Bản Claude Code hiện tại có context window, tức lượng token tối đa Claude xem được cùng lúc, là 1 triệu token trên phần lớn model. Khi gần đầy, nó tự compact, tức tự nén lịch sử trò chuyện thành bản tóm tắt, nên hiếm khi hết chỗ. Nhưng hết chỗ và suy giảm là hai chuyện khác nhau. Context càng ít thứ thừa thì câu trả lời càng tốt và càng rẻ, nên các cách trong bài vẫn đáng dùng. Trong đề thi, nếu câu hỏi kể chuyện Claude quên những class đã tìm ra, hãy chọn cách ghi phát hiện ra ngoài context hoặc giao bớt việc đọc cho subagent.

## Giữ phát hiện trong file ghi chú

Chị Loan bảo Khoa cho Claude giữ một file ghi chú (**scratchpad file**) ngay trong repo, ở `ghi-chu/kham-pha-hoan-tien.md`. Mỗi khi kiểm tra chắc một điều, Claude ghi điều đó vào file, kèm đường dẫn tới file code chứng minh nó. Trước khi trả lời một câu hỏi mới về luồng hoàn tiền, Claude đọc lại file này (**agents maintain scratchpad files recording key findings, referencing them for subsequent questions to counteract context degradation**).

```
# Luồng hoàn tiền (đã kiểm)
- RefundOrchestrator (refund/src/.../RefundOrchestrator.java): điều phối mọi loại hoàn tiền.
- LedgerAdjuster (ledger/src/.../LedgerAdjuster.java): ghi bút toán vào sổ cái, gọi từ RefundOrchestrator.
- Hoàn vào ví KHÔNG ghi sổ trong cùng request: RefundOrchestrator đẩy sự kiện vào queue
  refund-events, RefundQueueConsumer đọc rồi cộng vào ví (đã mở consumer để kiểm).
- Hoàn về thẻ ngân hàng: gọi cổng thanh toán, đã đọc cả phần xử lý lỗi.

# Chưa rõ
- TuitionInvoice có giữ số tiền theo từng kỳ không?
```

File nằm trên đĩa, ngoài context window. Session dài bao lâu thì file vẫn còn nguyên, kể cả sau khi compact, và hôm sau mở session mới vẫn đọc lại được (**scratchpad files for persisting key findings across context boundaries**). Cách này giống việc Claude Code tự lập danh sách việc cần làm, hay một file `NOTES.md` mà agent tự giữ: ghi đều đặn ra ngoài context, rồi đọc lại khi cần.

File chỉ nên ghi điều đã kiểm, kèm đường dẫn để mở lại được. Câu "hoàn vào ví đi qua queue" có giá trị vì Claude đã mở `RefundQueueConsumer` để kiểm, chứ không đoán theo thói quen của các hệ thống khác. Điều chưa chắc thì để riêng ở mục "Chưa rõ", để lần sau Claude biết còn phải kiểm tra chỗ nào.

> **Trong đề chọn gì**
>
> Nếu đề kể agent trả lời không nhất quán sau khoảng 30 phút khám phá, và kỹ sư phải nhắc lại các module đã khám phá, hãy chọn cho agent giữ một file ghi chú (scratchpad) các phát hiện chính rồi tra file đó cho các câu hỏi sau. Đáp án tự xoá context mỗi 15 phút thì xoá luôn những gì vừa tìm ra. Đáp án đổi sang model có context window lớn hơn thì context vẫn suy giảm khi dài ra. Đáp án tóm tắt mọi file nguồn trước khi khám phá thì tốn công cho cả những file không bao giờ cần, và bản tóm tắt chung chung không chứa đúng chi tiết sẽ cần.
>
> Nếu đề kể một dự án dbt, tức công cụ dựng pipeline dữ liệu bằng SQL, có khoảng 1.400 model SQL, và mỗi session mới agent lại mô tả quan hệ giữa các tầng dữ liệu theo một kiểu khác, hãy chọn giữ một file ghi chú các điều đã kiểm chắc cho từng tầng, cập nhật trong lúc làm và tra trước khi trả lời. Đáp án dùng hook dừng session sau 150 lần gọi tool thì session mới vẫn bắt đầu với context trống. Đáp án tắt tự động compact thì context đầy hơn, suy giảm nặng hơn. Đáp án mở đầu bằng việc đọc lại 20 model bị sửa nhiều nhất tuần trước thì sai chỗ, vì 20 model đó chưa chắc nằm ở những tầng agent đã đi qua.

## Giao từng câu hỏi cụ thể cho subagent

Khoa còn nhiều câu hỏi, mỗi câu phải đọc vài chục file: tìm mọi file test của module thanh toán, lần theo các dependency của luồng hoàn tiền, xem hoàn tiền ảnh hưởng báo cáo đối soát cuối ngày ra sao. Đọc hết trong session chính thì context lại đầy như lần trước.

Chị Loan chỉ Khoa giao mỗi câu hỏi đó cho một subagent riêng (**spawning subagents to investigate specific questions**). Subagent là một agent phụ mà Claude tạo ra để làm riêng một việc, với context window riêng. Các lần gọi tool của nó không đi vào session chính, và khi xong, session chính chỉ nhận lại bản tóm tắt. Mỗi subagent có thể dùng tới hàng chục nghìn token để đọc, nhưng thường chỉ gửi về khoảng 1.000–2.000 token.

Nhờ vậy, toàn bộ nội dung file và kết quả tìm kiếm dài dòng chỉ nằm trong subagent (**subagent delegation for isolating verbose exploration output**). Agent chính, tức Claude ở session chính, giữ bức tranh tổng thể và điều phối (**while the main agent coordinates high-level understanding**). Nó biết câu nào đã có câu trả lời, câu nào còn mở, và ghép các bản tóm tắt lại (**the main agent preserves high-level coordination**).

Claude Code có sẵn subagent `Explore` cho việc này. Nó chỉ đọc và tìm, không sửa file. Khi giao việc, Claude chọn mức kỹ lưỡng cho nó: mức nhanh dùng khi cần tra một chỗ đã biết, mức rất kỹ dùng khi cần phân tích toàn diện, còn mức vừa nằm ở giữa. Khoa chỉ cần viết "dùng subagent tìm mọi file test của module thanh toán, trả về danh sách đường dẫn và test nào chạm tới hoàn tiền".

Giao cho subagent không làm câu trả lời thông minh hơn. Cái lợi là phần đọc nặng không đổ vào session chính. Đổi lại, tổng số token tốn nhiều hơn, vì subagent cũng phải đọc. Câu hỏi chỉ cần mở một hai file thì Claude cứ đọc thẳng trong session chính.

> **Bẫy đề**
>
> Kỹ sư nhờ agent tìm các nhánh code chưa có test trong một module thanh toán cũ gồm 45 file. Đọc được 8 file đầu thì agent quên các mẫu code đã bàn, trong khi chưa tìm đủ file test và chưa lần ra các luồng thanh toán quan trọng. Cách nào hiệu quả nhất để làm xong việc tìm hiểu này? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **`/clear` rồi chỉ đọc lại các file quan trọng nhất, ghi phát hiện vào file ghi chú tồn tại qua các lần xoá** (_clear and reread_). Nghe như vừa dọn chỗ vừa giữ phát hiện. Nhưng khi đọc lại file thì context lại đầy dần, vì một context vẫn phải gánh cả 45 file.
> - **Ghi mọi phát hiện vào một báo cáo tóm tắt, xoá sạch context, rồi tìm hiểu tiếp chỉ với báo cáo đó** (_summarize and restart_). Nghe gọn gàng. Có điều phần còn lại vẫn đổ vào một context duy nhất, nên sẽ lại suy giảm trước khi xong.
> - **Dùng Grep tìm tên function thay vì đọc cả file** (_grep instead_). Nghe như tiết kiệm được context. Ngặt nỗi kết quả Grep vẫn đổ vào context đang quá tải, và không chữa được chuyện agent đã quên các mẫu code.
>
> **Chọn:** tạo các subagent tìm hiểu từng câu hỏi cụ thể, như tìm mọi file test cho phần thanh toán hay lần theo dependency của luồng hoàn tiền, trong khi agent chính điều phối và giữ bức tranh tổng thể.

> **Trong đề chọn gì**
>
> Nếu đề hỏi mẫu kiến trúc nào giữ context của agent chính sạch khi tìm hiểu một luồng xác thực phức tạp, hãy chọn tạo một subagent đọc riêng phần khám phá dài dòng, rồi chỉ gửi về một bản tóm tắt ngắn đúng trọng tâm. Đáp án Message Batches API là gửi request theo batch khi không cần kết quả ngay, không liên quan tới việc tách context. Đáp án `fork_session` tách một nhánh mới mang theo cả lịch sử của session, nên không làm context nhẹ đi. Đáp án tóm tắt dần lịch sử chính sau mỗi 2 lượt thì vẫn để output khám phá đổ vào session chính, lại mất chi tiết sau mỗi lần tóm tắt.

## Tóm tắt giai đoạn trước rồi mới giao giai đoạn sau

Khoa chia việc tìm hiểu thành hai giai đoạn. Giai đoạn đầu là luồng hoàn về thẻ ngân hàng, đã xong. Giai đoạn sau là hoàn vào ví và cách nó hiện trong báo cáo đối soát. Khoa định giao giai đoạn sau cho một subagent với một dòng: "tìm hiểu luồng hoàn tiền vào ví".

Subagent mới bắt đầu với context trống. Nó không thấy cuộc trò chuyện của session chính. Ngoại lệ duy nhất là fork, loại subagent bắt đầu bằng một bản sao của cả cuộc trò chuyện. Chỉ có một dòng giao việc thì subagent phải tự dò lại từ đầu những điều session chính đã tìm ra, và có thể đi tới kết luận khác. Còn fork thì mang theo đúng cái context đã đầy và đang nhầm.

Cách đúng là tóm tắt các phát hiện chính của giai đoạn trước, rồi đưa bản tóm tắt vào context ban đầu của subagent giai đoạn sau (**summarizing key findings from one exploration phase before spawning sub-agents for the next phase, injecting summaries into initial context**). Subagent có context sạch mà vẫn biết những gì đã tìm ra, còn session chính không phình thêm. Bản tóm tắt lấy từ file ghi chú là tiện nhất, vì file chỉ chứa điều đã kiểm.

Ghi chú đã có chuyện queue, nhưng Claude từng nói ngược lại ở cuối session. Trước khi tóm tắt, Khoa bảo Claude mở lại `RefundQueueConsumer` một lần nữa để chắc chắn tiền hoàn vào ví đi qua queue chứ không ghi sổ ngay. Bản tóm tắt sai thì subagent mang theo cái sai, và kết quả của nó sai theo.

```
Nhiệm vụ: tìm hiểu hoàn tiền vào ví và cách nó hiện trong báo cáo đối soát cuối ngày.

Đã biết (đã kiểm, đừng dò lại):
- RefundOrchestrator điều phối mọi loại hoàn tiền; LedgerAdjuster ghi bút toán sổ cái.
- Hoàn vào ví đi qua queue refund-events; RefundQueueConsumer đọc rồi cộng vào ví.

Cần trả lời:
1. Báo cáo đối soát đọc bút toán hoàn tiền ở đâu, lúc nào?
2. Nếu RefundQueueConsumer lỗi giữa chừng, sổ cái và ví có lệch nhau không?
Trả về: câu trả lời kèm đường dẫn file, tối đa một trang.
```

**Sơ đồ: Hỏi tiếp trong context đầy thì Claude nhầm tiếp; subagent có bản tóm tắt vẫn biết điều đã tìm ra**

✗ _Hỏi tiếp trong session chính_
1. Context đã chứa khoảng **60 file** đọc từ trước
   ↓ _hỏi thêm về hoàn tiền vào ví_
2. Claude nói theo "mẫu thường gặp", nhầm ghi sổ ngay với đi qua queue

✓ _Subagent kèm bản tóm tắt_
1. Tóm tắt từ file ghi chú, kiểm lại chỗ ghi sổ hay queue
   ↓ _đưa vào prompt đầu tiên của subagent_
2. Subagent đọc phần ví trong context riêng
3. Gửi về bản tóm tắt; session chính không phình thêm

> **Bẫy đề**
>
> Agent đã khám phá subsystem rendering của một game engine trong 25 phút, đọc shader, quản lý buffer và đồng bộ frame. Giờ agent cần tìm hiểu physics engine kết nối với phần rendering ra sao, để vẽ lớp overlay debug hiển thị va chạm. Các câu trả lời gần đây nhắc tới "các mẫu rendering thông thường" thay vì `VulkanPipeline` và `FrameGraph` mà agent đã tìm ra. Cách nào hiệu quả nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **`/clear` rồi khám phá physics lại từ đầu bằng các đường dẫn trong CLAUDE.md** (_clear and restart_). Nghe như có context sạch. Nhưng `/clear` xoá luôn các phát hiện về rendering, đúng thứ cần để nối hai hệ.
> - **Tạo một subagent khám phá physics độc lập, rồi tự tổng hợp kết quả với kiến thức rendering trong cuộc trò chuyện chính** (_independent subagent_). Nghe như đã tách phần đọc ra. Có điều subagent không biết gì về rendering, còn bước tổng hợp lại dựa vào đúng context chính đang suy giảm.
> - **Tiếp tục trong context hiện tại với prompt cụ thể hơn, gọi đích danh các class** (_sharper prompts_). Nghe rẻ vì không tốn thêm agent nào. Ngặt nỗi context vẫn quá tải, và khám phá physics chỉ đổ thêm vào đó.
>
> **Chọn:** tóm tắt các phát hiện chính về rendering, rồi tạo một subagent khám phá physics với bản tóm tắt đó trong context ban đầu.

> **Trong đề chọn gì**
>
> Nếu đề kể agent tìm hiểu cách xử lý lỗi trong một module thanh toán cũ gồm 15 file, và đọc được 8 file thì agent quên các mẫu code đã phát hiện, hãy chọn tạo một subagent khám phá các file còn lại với bản tóm tắt các mẫu đã phát hiện làm context ban đầu. Đáp án dùng Grep thì vẫn đổ thêm vào context đang quá tải. Đáp án ghi tóm tắt vào file rồi bắt đầu lại với context mới thì phần còn lại, gồm file test và luồng dữ liệu, vẫn dồn vào một context và sẽ lại đầy. Đáp án `/clear` rồi chỉ đọc lại file quan trọng nhất thì mất các mẫu đã tìm ra.
>
> Nếu đề kể agent nói ngược điều nó đã nói về cách `SyncQueue` retry các lần upload bị lỗi, và giờ cần một subagent giải thích push notification khởi động việc đồng bộ thế nào, hãy chọn viết bản tóm tắt những gì đã biết về phần đồng bộ, kiểm tra lại cơ chế retry trước, rồi đưa bản đó cho subagent kèm nhiệm vụ. Đáp án quay về prompt đầu tiên của session thì bỏ mất mọi thứ đã tìm ra từ đó. Đáp án dán lại code của `SyncQueue` vào cuộc trò chuyện chính thì đổ thêm vào context đang suy giảm. Đáp án chạy thêm một subagent về đồng bộ rồi tự gộp hai báo cáo thì không kiểm chỗ mâu thuẫn, và bước gộp vẫn nằm trong context chính.
>
> Nếu đề kể agent rà 18 handler, mới xong 10 cái đã nói sai những điều một giờ trước còn nói đúng, trong khi 8 handler còn lại dài hơn, phần test chưa đọc và phải xong trong ngày, hãy chọn chia các handler còn lại cho hai subagent. Mỗi subagent nhận danh sách các kiểu kiểm tra dữ liệu mà agent đã tìm ra trong 10 handler đầu, và chỉ phải đọc bốn handler. Đáp án chỉ đọc 50 dòng đầu mỗi handler thì bỏ sót logic nằm phía dưới. Đáp án tóm tắt 10 handler rồi mở session mới thì 8 handler dài vẫn đổ vào một context. Đáp án thu hẹp còn 10 handler đã đọc là bỏ việc chứ không phải làm xong.

## Khôi phục sau sự cố bằng manifest

Trước khi thiết kế tính năng, chị Loan muốn có bản đồ đầy đủ của bốn module liên quan. Bốn module quá lớn để Khoa ngồi hỏi từng câu, nên chị cho chạy một đợt khám phá tự động qua đêm trên máy chủ job. Đợt này viết bằng Claude Agent SDK, bộ thư viện để chạy agent bằng code thay vì chat. Nó có một agent điều phối và bốn agent con `ban-do-thanh-toan`, `ban-do-vi`, `ban-do-hoc-phi` và `ban-do-doi-soat`, mỗi agent lập bản đồ một module.

Lúc 2 giờ sáng, máy chủ khởi động lại. Khi đó thanh toán và ví đã xong, học phí mới xong 5 trên 9 package, còn đối soát chưa chạy. Lần đầu gặp chuyện này, nhóm chạy lại từ đầu và mất thêm cả buổi sáng. Các agent này chạy rất lâu và tích lại trạng thái qua rất nhiều lần gọi tool, nên chạy lại từ đầu vừa tốn vừa chậm. Hệ thống cần chạy tiếp được từ chỗ đã dừng.

Chị Loan sửa theo hướng lưu trạng thái có cấu trúc để khôi phục sau sự cố (**structured state persistence for crash recovery**). Mỗi agent định kỳ ghi trạng thái của mình ra một chỗ cố định (**each agent exports state to a known location**), ở `.kham-pha/trang-thai/<tên agent>.json`. File ghi agent đã làm gì, tìm ra gì và còn lại gì. Agent điều phối giữ một file manifest, tức file danh mục liệt kê từng agent, trạng thái của nó và đường dẫn tới file trạng thái.

```json
{
  "dot": "ban-do-hoan-tien",
  "agents": [
    {"ten": "ban-do-thanh-toan", "trang_thai": "xong", "file": ".kham-pha/trang-thai/ban-do-thanh-toan.json"},
    {"ten": "ban-do-vi", "trang_thai": "xong", "file": ".kham-pha/trang-thai/ban-do-vi.json"},
    {"ten": "ban-do-hoc-phi", "trang_thai": "dang_do", "tien_do": "5/9 package",
     "file": ".kham-pha/trang-thai/ban-do-hoc-phi.json"},
    {"ten": "ban-do-doi-soat", "trang_thai": "chua_chay", "file": null}
  ]
}
```

Khi chạy lại, agent điều phối nạp manifest (**the coordinator loads a manifest on resume**). Hai agent đã xong thì nó dùng luôn kết quả đã lưu. Với `ban-do-hoc-phi`, nó đọc file trạng thái rồi đưa phần liên quan vào prompt của agent này (**loads on resume and injects into agent prompts**). Phần đó gồm 5 package đã xong, những gì đã tìm ra và 4 package còn lại, để agent làm tiếp từ chỗ dừng. `ban-do-doi-soat` chưa có gì thì chạy mới.

**Sơ đồ: Agent điều phối đọc manifest để bỏ qua phần đã xong và làm tiếp phần dở từ trạng thái đã lưu**
_Agent điều phối nạp manifest khi chạy lại. Manifest liệt kê bốn agent: ban-do-thanh-toan xong, ban-do-vi xong, ban-do-hoc-phi đang dở 5 trên 9 package, ban-do-doi-soat chưa chạy. Việc khi chạy lại: hai agent xong thì bỏ qua, dùng kết quả đã lưu; agent đang dở thì đưa trạng thái vào prompt, làm tiếp 4 package còn lại; agent chưa chạy thì chạy mới_

- **Agent điều phối**: nạp manifest
- khi chạy lại
- **MANIFEST.JSON**
- **ban-do-thanh-toan**: xong, có file trạng thái
- **ban-do-vi**: xong, có file trạng thái
- **ban-do-hoc-phi**: đang dở, 5/9 package
- **ban-do-doi-soat**: chưa chạy
- **Bỏ qua**: dùng kết quả đã lưu
- **Bỏ qua**: dùng kết quả đã lưu
- **Làm tiếp**: trạng thái vào prompt,
- 4 package còn lại
- **Chạy mới**: chưa có trạng thái

Hai thứ làm cách này hiệu quả. File trạng thái có cấu trúc nên giữ đúng từng phát hiện, không bị nén thành câu chung chung. Agent điều phối chỉ chọn phần liên quan để đưa vào prompt, nên agent làm tiếp không phải đọc cả lịch sử của mọi agent khác.

> **Trong đề chọn gì**
>
> Nếu đề kể pipeline nghiên cứu nhiều agent bị sập khi mới xử lý 12 trong 28 tài liệu, và hỏi cách lưu trạng thái nào vừa giữ đúng chi tiết vừa không làm context phình to, hãy chọn cho mỗi agent lưu một báo cáo có cấu trúc vào vị trí định sẵn. Khi chạy tiếp, agent điều phối (coordinator) nạp các báo cáo và đưa phần trạng thái liên quan vào prompt của từng agent. Đáp án mỗi agent tự giữ file riêng và tự nạp lại thì không ai nắm cả đợt chạy, agent này không biết phần của agent khác đã tới đâu. Đáp án đánh index mọi output vào vector store rồi tìm theo nghĩa thì trả về các mảnh rời theo độ giống, dễ sót và mất cấu trúc trạng thái. Đáp án đưa nguyên log hội thoại của agent điều phối cho các agent thì nhồi cả lịch sử vào prompt, đúng thứ làm context quá tải.

## Dùng /compact khi context đầy output khám phá

Có những hôm Khoa vẫn cần một session dài trong Claude Code, chẳng hạn khi vừa đọc code vừa bàn thiết kế với Claude. Khi context đầy kết quả tìm kiếm và nội dung file, Khoa chạy `/compact` để giảm lượng context đang dùng (**using /compact to reduce context usage during extended exploration sessions when context fills with verbose discovery output**).

`/compact` thay cuộc trò chuyện bằng một bản tóm tắt có cấu trúc. Bản tóm tắt giữ các yêu cầu của bạn và những đoạn code chính, nhưng hướng dẫn chi tiết từ đầu cuộc trò chuyện có thể mất. Muốn chắc chắn giữ thứ gì, bạn viết thêm yêu cầu ngay sau lệnh, ví dụ `/compact giữ các class và đường dẫn của luồng hoàn tiền`. Claude Code cũng tự compact khi gần chạm giới hạn, nhưng lúc đó Claude đoán phần nào quan trọng, còn khi bạn viết thêm yêu cầu thì bạn là người chọn. Trên một session dài, bản thân `/compact` cũng là một request lớn, vì nó phải đọc cả cuộc trò chuyện để tóm tắt.

Sau compact, CLAUDE.md ở gốc dự án được nạp lại từ đĩa, và Claude Code đọc lại tối đa 5 file được đọc hoặc sửa gần nhất. File ghi chú cũng nằm trên đĩa nên không mất gì. Vì vậy file ghi chú và `/compact` bổ sung cho nhau. File giữ những điều đã kiểm tra, còn `/compact` dọn chỗ trong context.

Có hai lệnh hay bị nhầm với `/compact`. Lệnh `/clear` xoá sạch lịch sử để bắt đầu lại, hợp khi bạn chuyển sang việc khác hẳn. Lệnh `/init` thì tạo file CLAUDE.md cho dự án.

> **Trong đề chọn gì**
>
> Nếu đề hỏi lệnh có sẵn nào dọn bớt context khi nó đầy output khám phá dài dòng mà vẫn giữ các phát hiện chính, hãy chọn `/compact`. Đáp án `fork_session` tách nhánh mới mang theo cả lịch sử, không làm context nhẹ đi. Đáp án `/clear` xoá luôn các phát hiện. Đáp án `/init` chỉ tạo CLAUDE.md.
>
> Nếu đề hỏi tổ hợp nào xử lý tốt nhất việc Claude trả lời không nhất quán và quên các class đã tìm ra trong session khám phá dài, hãy chọn file ghi chú lưu phát hiện chính cùng lệnh `/compact` giảm lượng context. Đáp án tạo nhiều subagent chạy song song mà không đưa cho chúng bản tóm tắt điều đã biết thì mỗi subagent phải dò lại từ đầu. Đáp án Message Batches API là gửi request theo batch, không phải cách quản lý context của một session. Đáp án `/clear` kèm tăng temperature lên 1.0 thì xoá phát hiện, còn temperature chỉ chỉnh độ ngẫu nhiên của câu trả lời, không giúp Claude nhớ gì.

> **Ý chính**
>
> Khi Claude bắt đầu nói "mẫu thường gặp" thay vì tên class đã tìm ra, context đang suy giảm. Hãy cho Claude ghi những điều đã kiểm tra vào file và đọc lại file đó trước khi trả lời. Câu hỏi cần đọc nhiều thì giao cho subagent, kèm bản tóm tắt điều đã biết. Với hệ nhiều agent chạy lâu, mỗi agent lưu trạng thái ra một chỗ cố định để agent điều phối chạy tiếp từ manifest. Khi context đầy output dài, bạn chạy `/compact` và ghi rõ phần cần giữ.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 5.4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Explore the context window (Claude Code)](https://code.claude.com/docs/en/context-window)
3. [How Claude Code works (Claude Code)](https://code.claude.com/docs/en/how-claude-code-works)
4. [Create custom subagents (Claude Code)](https://code.claude.com/docs/en/sub-agents)
5. [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
6. [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
7. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/research/multi-agent-research-system)
