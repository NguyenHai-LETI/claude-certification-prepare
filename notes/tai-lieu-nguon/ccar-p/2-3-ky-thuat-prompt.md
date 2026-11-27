---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-3-ky-thuat-prompt
ngay_tai: 2026-11-27
tieu_de: Zero-shot, few-shot và chain-of-thought
---

Domain 2: Claude Models, Prompting & Context Engineering · Task 2.3

# Zero-shot, few-shot và chain-of-thought

Khi nào chỉ cần chỉ dẫn (zero-shot), khi nào thêm ví dụ (few-shot), khi nào cho Claude suy nghĩ trước (chain-of-thought, thinking), và cái giá của mỗi cách.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Bắt đầu bằng chỉ dẫn rõ, chỉ thêm ví dụ khi kết quả còn lệch
- Chọn ví dụ liên quan, đa dạng, bọc trong thẻ để Claude học đúng điều cần học
- Biết khi nào bật thinking hay chain-of-thought, và cái giá về độ trễ, chi phí
- Đặt tài liệu dài và câu hỏi đúng chỗ trong prompt
- Kiểm lại kỹ thuật prompt khi đổi phiên bản model

Ba kỹ thuật prompt hay được nhắc nhất là không cho ví dụ (**zero-shot**), cho vài ví dụ (**few-shot**), và cho model suy luận từng bước trước khi trả lời (**chain-of-thought**, CoT). Không kỹ thuật nào luôn tốt nhất. Mỗi cái thêm vào đều tốn token hoặc thời gian, nên chỉ thêm khi nó sửa được một vấn đề cụ thể.

Bài này giúp bạn trả lời: với một việc cụ thể, dùng kỹ thuật nào, và làm sao biết nó có đáng không?

## Ví dụ xuyên suốt: phòng nhân sự của một nhà máy

Phòng nhân sự của một nhà máy 3.000 công nhân dùng Claude cho ba việc:

1. **Xếp 2.000 phản hồi khảo sát** vào 8 chủ đề (lương thưởng, ca kíp, an toàn lao động, bếp ăn...). Mỗi chủ đề đã có một câu mô tả.
2. **Trích thông tin từ đơn xin nghỉ** viết tay đã được nhận diện chữ, ra JSON với đúng tên trường mà hệ thống chấm công đang dùng.
3. **Xét đơn nghỉ có hợp quy chế không**, khi quy chế có nhiều điều kiện chồng nhau: thâm niên, loại nghỉ, ngày lễ, số ngày đã nghỉ trong năm.

## Zero-shot: bắt đầu bằng chỉ dẫn rõ

Với việc 1, danh sách chủ đề và mô tả đã nằm trong prompt. Đây là phân loại vào một tập nhãn đóng, và chỉ dẫn rõ thường đã đủ. Bài blog về prompt engineering của Anthropic nói ví dụ không phải lúc nào cũng cần; chúng phát huy nhất khi giải thích một khái niệm khó tả hoặc một định dạng cụ thể.

Vì vậy bắt đầu bằng zero-shot, chạy trên một mẫu có nhãn sẵn, xem sai ở đâu rồi mới quyết định thêm gì.

## Few-shot: khi chỉ dẫn chưa đủ

Với việc 2, chỉ dẫn "trả về JSON gồm họ tên, mã nhân viên, ngày bắt đầu, ngày kết thúc, lý do" vẫn cho ra tên trường lúc thế này lúc thế khác. Ví dụ là cách sửa đáng tin cậy nhất: docs nói ví dụ là một trong những cách chắc chắn nhất để điều khiển định dạng, giọng văn và cấu trúc. Một ví dụ có đúng tên trường sẽ neo định dạng đầu ra.

Docs khuyên 3 tới 5 ví dụ, và ví dụ phải:

| Tiêu chí | Nghĩa là | Trong ví dụ |
| --- | --- | --- |
| Liên quan | Giống việc thật | Đơn nghỉ thật đã che tên, không phải đơn bịa ngắn gọn |
| Đa dạng | Phủ các ca khó, không lặp một kiểu | Có đơn thiếu ngày kết thúc, đơn ghi ngày kiểu "thứ Hai tuần sau", đơn nghỉ nửa ngày |
| Có cấu trúc | Bọc mỗi ví dụ trong `<example>`, nhiều ví dụ trong `<examples>` | Tách rõ ví dụ với dữ liệu thật |

Bài blog gợi ý bắt đầu với một ví dụ, chỉ thêm khi kết quả còn chưa đạt. Blog cũng lưu ý các model Claude mới chú ý rất kỹ tới chi tiết trong ví dụ. Nếu cả 5 ví dụ đều là nghỉ phép năm, Claude dễ nghĩ đơn nào cũng là nghỉ phép năm.

> **Bẫy đề**
>
> Kết quả còn lệch thì phản xạ dễ có là thêm nhiều ví dụ hơn. Nếu các ví dụ đang giống nhau, thêm ví dụ cùng kiểu không sửa được; cần ví dụ **khác nhau**, phủ đúng những ca đang sai.

## Chain-of-thought và thinking

Việc 3 cần suy luận nhiều bước: kiểm thâm niên, loại nghỉ, trừ ngày lễ, cộng số ngày đã nghỉ. Trả lời ngay một lượt dễ bỏ sót một điều kiện. Đây là chỗ cho Claude suy nghĩ trước khi trả lời có ích.

**Thinking có sẵn trong model.** Các model Claude hiện nay có chế độ thinking thích ứng (**adaptive thinking**): model tự đánh giá mỗi yêu cầu có cần nghĩ không và nghĩ bao nhiêu. Thông số **effort** điều chỉnh mức công sức cho cả câu trả lời, kể cả phần nghĩ. Docs nói thinking giúp nhiều nhất ở việc phức tạp như toán, code, phân tích và việc agent dài.

**Thinking có giá.** Token thinking tính tiền như token đầu ra, kể cả khi bạn không xem phần nghĩ, và câu trả lời chậm hơn. Docs khuyên chỉ dùng thinking khi nó thật sự làm câu trả lời tốt hơn, và muốn giảm thì hạ effort trước khi dặn trong prompt. Với việc 1, phân loại theo mô tả có sẵn, suy luận dài không cần thiết.

> **Bẫy đề**
>
> "Bật chain-of-thought cho mọi việc, bất kể độ khó" bị câu luyện thi chấm sai. Việc đơn giản không cần thêm bước suy luận, mà vẫn phải trả thêm thời gian và token.

**Chain-of-thought viết tay.** Trước khi có thinking, người ta yêu cầu Claude suy luận ngay trong câu trả lời. Bài blog kể ba mức: đơn giản ("suy nghĩ từng bước"), có hướng dẫn (nêu các bước cần xét), và có cấu trúc (dùng thẻ tách phần suy luận khỏi câu trả lời cuối). Blog nói khi có thinking thì thinking thường tốt hơn; CoT viết tay vẫn có ích khi không dùng được thinking, hoặc khi bạn cần một phần lập luận đọc lại được.

Điểm sau quan trọng cho việc kiểm tra: phần thinking API trả về **không phải** chuỗi suy luận gốc mà là bản tóm tắt, còn trên nhiều model mới mặc định nó còn để trống. Nếu phòng nhân sự cần lưu lý do xét duyệt từng đơn để đối chiếu, hãy yêu cầu câu trả lời có một phần giải thích: các điều kiện đã kiểm và kết quả từng điều kiện, ví dụ một trường `ly_do` trong JSON. Đó là phần giải thích kết quả để người đọc lại, không phải chuỗi suy nghĩ của model. Docs cũng lưu ý: trên các model mới nhất (như Opus 5.5, Sonnet 5.5, Fable 5.1), prompt yêu cầu viết lập luận trong thẻ `<thinking>` có thể bị từ chối, và nên dựa vào tính năng thinking thay cho việc đó.

## Đặt tài liệu dài và câu hỏi đúng chỗ

Khi prompt có tài liệu dài (như toàn văn quy chế nhân sự), docs khuyên đặt tài liệu **ở đầu**, trên chỉ dẫn và ví dụ, và đặt câu hỏi **ở cuối**. Docs nói đặt câu hỏi cuối có thể cải thiện chất lượng tới 30% trong thử nghiệm của họ. Mỗi tài liệu bọc trong thẻ `<document>` có `<source>` và `<document_content>`, và có thể yêu cầu Claude trích đoạn liên quan trước rồi mới trả lời.

**Sơ đồ**
1. **Toàn văn quy chế nhân sự**: tài liệu dài đặt ở đầu, bọc trong thẻ document
2. **Chỉ dẫn và ví dụ**
3. **Câu hỏi**: đặt ở cuối

_Trong thử nghiệm của docs, đặt câu hỏi cuối có thể cải thiện chất lượng tới 30%_

> **Trong đề chọn gì**
>
> Câu luyện thi chấm đúng: zero-shot hợp làm điểm bắt đầu cho phân loại vào tập nhãn đóng khi nhãn và mô tả đã có trong prompt; vài ví dụ có đúng tên trường giúp neo định dạng cho việc trích xuất. Chấm sai: CoT mặc định cho mọi việc; bỏ qua khác biệt giữa các phiên bản model khi prompt đã chạy tốt trên một phiên bản.

Ý cuối có cơ sở trong docs: một kỹ thuật được đo trên model nào thì coi như chỉ đúng trên model đó, phải chạy lại bộ test của bạn trước khi áp sang model khác. Docs còn nói thêm về cách điều khiển thinking: hiệu quả của câu dặn phụ thuộc cả vào cách chữ, nên đo trước khi đưa vào dùng thật.

Với một việc mới, hỏi lần lượt:

1. **Phân loại vào tập nhãn đóng, nhãn và mô tả đã có trong prompt?** → Bắt đầu bằng zero-shot, chạy trên mẫu có nhãn sẵn
2. **Định dạng hay tên trường còn lệch?** → Thêm ví dụ, bắt đầu từ một ví dụ, phủ đúng các ca đang sai
3. **Phải suy luận nhiều điều kiện chồng nhau?** → Dùng thinking, chỉnh bằng effort
4. **Không dùng được thinking, hoặc cần lập luận đọc lại được?** → Viết chain-of-thought hoặc yêu cầu một phần giải thích trong câu trả lời
- **Còn lại** → Việc đơn giản: giữ chỉ dẫn rõ, không thêm gì

> **Ý chính**
>
> Bắt đầu bằng chỉ dẫn rõ. Định dạng còn lệch thì thêm ví dụ đa dạng; suy luận nhiều bước thì dùng thinking. Mỗi thứ thêm vào phải đo được là có lợi, và đo lại khi đổi model.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Prompting best practices (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
3. [Best practices for prompt engineering (Claude Blog)](https://claude.com/blog/best-practices-for-prompt-engineering)
4. [Building with thinking (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
5. [Steering thinking and controlling cost (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost)
