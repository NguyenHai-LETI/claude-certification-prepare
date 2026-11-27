---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/1-3-lap-lai-de-cai-thien
ngay_tai: 2026-11-27
tieu_de: Sửa prompt qua nhiều lượt để kết quả tốt hơn
---

Domain 1 : Prompting and Task Execution·Task 1.3

# Sửa prompt qua nhiều lượt để kết quả tốt hơn

Lặp prompt thế nào cho có ích, mỗi lượt sửa cái gì, so kết quả với gì, và khi nào nên dừng lặp để đổi cách hoặc nhờ người duyệt.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Biết vì sao lặp lại là thói quen quan trọng nhất khi chat với Claude
- Mỗi lượt sửa nhắm đúng một điểm yếu đã chỉ ra, và ghi lại tác dụng
- Chọn cách sửa có tác dụng thật cho lỗi giọng, lỗi chi tiết, lỗi thuật ngữ
- Nhận ra lúc lặp không còn đem lại gì và biết bước tiếp theo

Lần trả lời đầu tiên của Claude hiếm khi là bản cuối. Người dùng giỏi không phải người viết được prompt hoàn hảo ngay từ đầu, mà là người biết sửa đúng chỗ qua vài lượt.

Bài này giúp bạn trả lời: lặp prompt thế nào để mỗi lượt thật sự tốt hơn, và khi nào thì nên thôi?

## Ví dụ xuyên suốt: mô tả sách thiếu nhi trên sàn thương mại điện tử

Chị Ngọc làm ở một nhà xuất bản sách thiếu nhi, cần viết mô tả cho 60 đầu sách mới đăng lên sàn thương mại điện tử. Chị nhờ Claude viết thử mô tả cho cuốn "Chú mèo đi lạc ở chợ nổi".

Bản đầu tiên đúng nội dung, nhưng giọng như bài phê bình văn học, dài 400 chữ, gọi là "truyện tranh" trong khi nhà xuất bản luôn gọi là "sách tranh". Không sai hẳn, nhưng chưa đăng được.

## Vì sao lặp lại quan trọng

Anthropic đo thói quen của người dùng qua hàng nghìn cuộc chat (gọi là AI Fluency Index). Họ thấy khoảng 86% cuộc chat trong mẫu có **lặp lại và tinh chỉnh** (*iteration and refinement*): người dùng dựa vào câu trả lời trước để sửa tiếp, thay vì nhận câu đầu rồi chuyển sang việc khác. Những cuộc chat đó cũng có nhiều thói quen tốt khác hơn hẳn.

Anthropic gọi lặp lại là "bước chuyển đặc trưng" (*signature move*) khi chat với Claude: người sửa qua nhiều lượt thì làm tốt hơn ở mọi kỹ năng khác, còn người gửi một tin rồi đi gần như không hề đánh giá lại kết quả.

Khoá AI Fluency gọi vòng này là **vòng Description–Discernment**: bạn mô tả cái mình cần (Description), đọc kỹ kết quả và chỉ ra chỗ chưa đạt (Discernment), rồi mô tả lại rõ hơn đúng ở chỗ đó.

1. 1**Mô tả**viết hoặc sửa prompt
2. 2**Claude trả lời**
3. 3**Đánh giá**so với tiêu chí ban đầu, chỉ ra điểm yếu
4. 4**Sửa đúng điểm yếu đó trong prompt**

↻Dừng khi đạt tiêu chí, hoặc khi lặp không còn tiến bộ

## Mỗi lượt sửa một điểm yếu đã chỉ ra

Lặp có ích khi mỗi lần sửa nhắm vào **một điểm yếu cụ thể** mà bạn đã chỉ ra được. Lặp vô ích khi bạn chỉ gửi lại, hay viết chung chung "làm tốt hơn đi".

Với bản mô tả sách, chị Ngọc tách ra ba điểm yếu rồi sửa từng cái:

| Lượt | Điểm yếu | Thay đổi trong prompt | Kết quả |
|---|---|---|---|
| 2 | Giọng như phê bình văn học | Nêu người đọc: phụ huynh có con 4–7 tuổi, đang lướt điện thoại tìm quà | Giọng gần gũi hơn |
| 3 | Quá dài | Giới hạn 120 chữ, câu đầu nói sách hợp với bé nào | Đúng độ dài |
| 4 | Gọi sai "truyện tranh" | Đưa bảng thuật ngữ của nhà xuất bản, dặn chỉ dùng thuật ngữ trong bảng | Đúng thuật ngữ |

Mỗi lượt chỉ đổi một thứ nên chị biết thay đổi nào có tác dụng. Nếu đổi ba thứ cùng lúc mà kết quả tệ đi, chị sẽ không biết lỗi do đâu.

Sau mỗi lượt, hãy **so kết quả với tiêu chí ban đầu**, không chỉ với bản ngay trước đó. Bản sau "khác" bản trước chưa chắc đã "tốt hơn" theo cái bạn cần.

> Bẫy đề
>
> Câu luyện thi hỏi cách lặp giúp học được nhiều nhất. Các đáp án sai đều nghe có lý:
>
> - Mỗi lượt viết lại prompt từ đầu cho khỏi bị câu chữ cũ ảnh hưởng, cuối cùng chọn bản tốt nhất.
> - Gộp vài thay đổi cùng nhắm một điểm yếu, tệ hơn thì bỏ cả cụm.
> - Sửa mọi điểm yếu trong một lần, rồi so với bản trước.
>
> Đáp án đúng: **mỗi lượt đổi một yếu tố, ghi lại thay đổi và tác dụng**, yếu tố đó ổn rồi mới đổi yếu tố khác.

## Cách sửa nào có tác dụng

Mỗi loại lỗi có cách sửa trúng nhất:

| Lỗi | Sửa thế nào |
|---|---|
| Lệch giọng, thiếu chi tiết | Nêu rõ giọng (bằng tính từ cụ thể) và người đọc; đưa **một ví dụ** đạt chuẩn |
| Sai thuật ngữ của tổ chức | Đưa bảng thuật ngữ, dặn chỉ dùng thuật ngữ trong bảng |
| Sai khuôn, sai độ dài | Nói rõ khuôn và độ dài, kèm lý do |
| Bỏ sót ý | Liệt kê từng ý bắt buộc, đánh số |
| Góp ý của người khác mơ hồ | Hỏi lại người góp ý trước khi sửa |

Prompting best practices của Anthropic coi ví dụ là một trong những cách đáng tin nhất để Claude theo đúng khuôn, giọng và bố cục. Với chị Ngọc, dán một mô tả cũ mà nhà xuất bản rất ưng thường hiệu quả hơn mười câu dặn về giọng.

Khi sửa theo góp ý của đồng nghiệp hay sếp, có hai thói quen đáng giữ: góp ý nào mơ hồ ("chưa ổn lắm") thì **hỏi lại cho rõ** trước khi sửa, và **ghi mỗi góp ý ứng với thay đổi nào** trong bản sau. Gộp hết mọi góp ý, kể cả những ý mâu thuẫn nhau, vào cùng một bản chỉ làm bản nháp rối thêm.

> Bẫy đề
>
> Câu luyện thi: kết quả đầu tiên dùng được một phần nhưng lệch giọng, thiếu chi tiết. Đáp án sai: **tăng temperature** rồi gửi lại prompt cũ; gửi lại vài lần rồi chọn bản tốt nhất; thêm câu "làm tốt hơn đi" vào cuối. Đáp án đúng: **thêm từ mô tả giọng cụ thể và người đọc cụ thể**, và **đưa một ví dụ đạt chuẩn**.
>
> Trong app Claude, menu cạnh nút gửi chỉ có ba thứ để chỉnh: model, mức effort và thinking, không có temperature. Dù sao thì gửi lại prompt cũ cũng không sửa được nguyên nhân: Claude vẫn thiếu đúng những thông tin đó.

## Khi nào nên dừng lặp

Lặp không phải càng nhiều càng tốt. Nếu đã sửa tám lượt mà bốn lượt gần nhất chất lượng không nhích lên, việc lặp đã tới **mức lợi ích giảm dần** (*diminishing returns*). Lúc này nên đổi cách làm (chia nhỏ việc, đổi tài liệu đưa vào, đổi tính năng) hoặc đưa cho người có chuyên môn duyệt.

Hai cách xử lý sai cũng hay gặp: chấp nhận bản hiện tại dù còn lỗi, hoặc bỏ luôn việc mà không báo ai.

1. Kết quả đã đạt tiêu chí ban đầu?Dừng, dùng kết quả
2. Chỉ ra được điểm yếu cụ thể?Sửa đúng điểm đó trong prompt, lặp tiếp
3. Vài lượt gần nhất không tiến bộ?Đổi cách làm hoặc nhờ người duyệt
4. Còn lạiChưa chỉ ra được điểm yếu: đọc lại kết quả theo từng tiêu chí trước khi sửa

> Trong đề chọn gì
>
> Đề hỏi nhận định đúng về lặp prompt: chọn **so kết quả với tiêu chí ban đầu để biết lặp có giúp không**, và **lặp hiệu quả nhất khi mỗi thay đổi nhắm một điểm yếu đã chỉ ra**. Loại các câu "gửi lại cùng prompt là cách cải thiện đáng tin nhất", "càng lặp nhiều càng tốt, đổi gì cũng được", "chỉ dừng khi đã thử hết mọi cách diễn đạt".

> Ý chính
>
> Mỗi lượt: chỉ ra một điểm yếu, sửa đúng chỗ đó, so với tiêu chí ban đầu, ghi lại tác dụng. Hết tiến bộ thì đổi cách hoặc nhờ người duyệt, đừng lặp mãi.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 1(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Getting good at Claude, a research-backed curriculum (Claude Academy)(mở tab mới)](https://academy.claude.com/tutorials/getting-good-at-claude-a-research-backed-curriculum)
3. [The AI Fluency Index (Claude Academy)(mở tab mới)](https://academy.claude.com/tutorials/the-ai-fluency-index)
4. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
5. [Change the model, effort, and thinking settings (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
