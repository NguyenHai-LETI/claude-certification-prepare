---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/6-2-viet-prompt
ngay_tai: 2026-11-27
tieu_de: Viết prompt - chỉ dẫn rõ, ví dụ mẫu, đặt đúng chỗ, ràng buộc đầu ra, sửa có đo
---

Domain 6: Prompt and Context Engineering · Task 6.2

# Viết prompt - chỉ dẫn rõ, ví dụ mẫu, đặt đúng chỗ, ràng buộc đầu ra, sửa có đo

Viết chỉ dẫn rõ kèm lý do, dùng ví dụ mẫu, đặt chỉ dẫn ở system prompt hay lượt user, ràng buộc định dạng đầu ra, làm sạch đầu vào, sửa prompt bằng eval.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Viết chỉ dẫn cụ thể, có lý do, có các bước đánh số khi thứ tự quan trọng
- Chọn zero-shot hay few-shot, và viết ví dụ mẫu sát việc, đa dạng, bọc thẻ
- Gom chỉ dẫn hành vi và định dạng vào system prompt, giữ lượt user cho đầu vào
- Ràng buộc định dạng đầu ra khi model mới không còn nhận prefill, và sàng lọc đầu vào
- Sửa prompt từng thay đổi một trên các ca đang hỏng, và dọn một prompt đã phình to

Prompt là phần dễ sửa nhất của một ứng dụng dùng Claude, nên cũng dễ bị sửa lung tung nhất: mỗi người thêm một dòng, chỉ dẫn rải khắp system prompt và tin nhắn, sửa xong không ai đo xem tốt hơn hay tệ đi.

Bài này giúp bạn trả lời: viết prompt thế nào cho Claude hiểu đúng, đặt chỉ dẫn ở đâu, và sửa prompt ra sao để chắc chắn là tốt lên?

## Ví dụ xuyên suốt: trợ lý soạn kịch bản tiệc cưới

Một công ty tổ chức tiệc cưới dùng Claude soạn bản đề xuất kịch bản tiệc từ phiếu thông tin của cô dâu chú rể: số khách, phong cách, tiết mục mong muốn, ngân sách. Sau một năm:

- System prompt đã dài khoảng 350 dòng, có chỗ chồng chéo và mâu thuẫn: dòng 40 bảo "trả lời ngắn gọn", dòng 210 bảo "mô tả chi tiết từng tiết mục".
- Một số chỉ dẫn định dạng nằm trong system prompt, một số khác được code chèn vào tin nhắn user, có cái lặp lại hai lần.
- Đề xuất cho tiệc cưới kết hợp hai văn hoá (số lượng tăng gấp ba năm nay) thường thiếu nghi lễ của một bên.
- Đội có sẵn 6 bản đề xuất mẫu được trưởng phòng chấm đạt.

## Chỉ dẫn rõ ràng, có lý do

Docs prompting best practices khuyên coi Claude như một nhân viên mới rất giỏi nhưng chưa biết quy ước của bạn. Phép thử: đưa prompt cho một đồng nghiệp không biết gì về việc này; nếu họ bối rối thì Claude cũng sẽ bối rối. Đề thi gọi đây là độ rõ của chỉ dẫn (**instruction clarity**). Cụ thể:

- Nói rõ định dạng và ràng buộc của đầu ra.
- Khi thứ tự hay sự đầy đủ của các bước quan trọng, viết thành danh sách đánh số.
- Kèm lý do: giải thích vì sao một hành vi quan trọng giúp Claude hiểu mục tiêu và làm đúng hơn.
- Nói điều cần làm thay vì điều không được làm: thay "đừng dùng gạch đầu dòng" bằng "viết thành các đoạn văn liền mạch".

```
Soạn đề xuất kịch bản tiệc theo đúng thứ tự:
1. Đón khách và nghi lễ của từng bên gia đình
2. Tiết mục chính, mỗi tiết mục ghi rõ thời lượng
3. Tổng thời gian, không vượt quá giờ thuê sảnh
Lý do: sảnh tính phí theo giờ, quá giờ là phát sinh chi phí cho khách.
```

## Đặt chỉ dẫn đúng chỗ

Đề thi hỏi về đặt chỉ dẫn ở system hay user (**system versus user placement**). Quy tắc gọn:

| Nội dung | Đặt ở |
| --- | --- |
| Vai trò, quy tắc hành vi, quy tắc định dạng ổn định | System prompt |
| Đầu vào của lượt này (phiếu thông tin của cặp đôi) | Lượt user |
| Nội dung bên thứ ba và kết quả tool | Khối `tool_result` (bài 2.5) |
| Tài liệu dài đáng tin (bảng giá, danh mục tiết mục) | Đầu prompt, trước câu hỏi |

Chỉ dẫn rải rác và lặp lại chính là lý do định dạng đầu ra không đều trong ví dụ. Gom mọi chỉ dẫn hành vi và định dạng về system prompt, để lượt user chỉ chứa phiếu thông tin.

**Sơ đồ**
1. **Chỉ dẫn rải khắp**: system prompt và tin nhắn do code chèn, có cái lặp hai lần
   ↓ _gom lại đúng chỗ_
2. **System prompt**: vai trò, hành vi, định dạng **|** **Lượt user**: chỉ còn phiếu thông tin của cặp đôi

> **Trong đề chọn gì**
>
> Câu luyện thi: đầu ra không đều về định dạng, chỉ dẫn rải giữa system prompt và tin nhắn user, có cái nói một lần, có cái lặp lại. Chọn **gom chỉ dẫn hành vi và định dạng vào system prompt, giữ tin nhắn user cho đầu vào của người dùng**. Sai: dồn hết vào tin nhắn user; để chỉ dẫn ở chỗ người viết đầu tiên thấy tự nhiên; lặp mọi chỉ dẫn ở cả hai nơi.

## Bọc nhiều tài liệu bằng thẻ

Khi prompt có nhiều tài liệu, đừng dán chúng liền nhau thành một khối chữ. Docs khuyên bọc mỗi tài liệu trong thẻ `<document>`, bên trong có `<source>` (tên hay nguồn tài liệu) và `<document_content>` (nội dung), rồi gom tất cả vào thẻ `<documents>` bên ngoài. Ranh giới và metadata rõ ràng như vậy giúp Claude biết mỗi ý đến từ tài liệu nào, nên ít gán nhầm nguồn hơn. Thẻ có thể kèm thuộc tính như `index="1"`. Đặt các tài liệu lên đầu prompt, câu hỏi hay chỉ dẫn ở cuối.

## Ví dụ mẫu: zero-shot hay few-shot

Prompt không có ví dụ là zero-shot; có vài ví dụ là few-shot (multi-shot). Docs nói ví dụ là một trong những cách chắc nhất để điều khiển định dạng, giọng và cấu trúc, và khuyên 3–5 ví dụ:

- **Sát việc thật**: giống đầu vào sẽ gặp.
- **Đa dạng**: phủ cả trường hợp khó, đủ khác nhau để Claude không bắt chước nét không cố ý.
- **Có cấu trúc**: bọc trong `<example>`, nhiều ví dụ thì trong `<examples>`.

Trong ví dụ, đội chọn 4 trong 6 bản đề xuất mẫu, cố ý lấy 2 bản tiệc hai văn hoá, vì đó đúng là chỗ đang yếu.

> **Bẫy đề**
>
> Hai câu luyện thi cùng ý. Có sẵn vài ví dụ đã gắn nhãn thể hiện định dạng mong muốn: chọn **multi-shot, đưa ví dụ vào prompt**. Có vài ví dụ trường hợp khó kèm câu trả lời mong muốn: chọn **thêm chúng vào prompt làm few-shot**. Sai ở cả hai: huấn luyện một model riêng; cất ví dụ vào database để tra; chỉ zero-shot; cảnh báo người dùng tránh loại đầu vào đó.

## Ràng buộc định dạng đầu ra

Đề thi gọi đây là ràng buộc đầu ra (**output constraints**). Docs nêu vài cách hiệu quả:

- Mô tả rõ schema bắt buộc và yêu cầu chỉ trả đúng schema đó.
- Dùng thẻ XML làm chỉ báo định dạng, ví dụ yêu cầu viết phần tóm tắt trong `<tom_tat>`.
- Viết prompt theo đúng phong cách muốn nhận lại: prompt toàn gạch đầu dòng thì dễ nhận lại gạch đầu dòng.

Một kỹ thuật cũ đã không còn dùng được: điền sẵn phần đầu câu trả lời của assistant (prefill), ví dụ điền `{` để ép JSON. Từ các model Claude 4.6, yêu cầu có prefill ở lượt assistant cuối bị lỗi 400. Docs khuyên dùng structured outputs nếu cần đúng schema, hoặc chỉ dẫn trong system prompt.

> **Trong đề chọn gì**
>
> Câu luyện thi: system prompt cho ứng dụng phải trả JSON đúng một hình dạng, hệ thống phía sau từ chối mọi đầu ra lệch. Chọn **mô tả rõ ràng buộc về schema JSON và yêu cầu chỉ trả đầu ra khớp schema**. Sai: để Claude tự chọn định dạng; lúc JSON lúc chữ; không nhắc định dạng rồi nhờ bước xử lý sau nắn lại. Trong thực tế, thêm structured outputs và bước kiểm đầu ra (bài 6.3).

## Làm sạch đầu vào

Đề thi nhắc làm sạch đầu vào (**input sanitization**). Docs về chống jailbreak gợi ý hai lớp trước khi đầu vào tới cuộc hội thoại chính:

- **Sàng lọc bằng model nhẹ**: một lần gọi Haiku 5.5 kiểm đầu vào có hại hay có dấu hiệu lách luật không, trả kết quả dạng có cấu trúc để code đọc.
- **Kiểm đầu vào**: lọc các mẫu tấn công đã biết.

**Sơ đồ**
1. **Đầu vào của người dùng**
   ↓ _Haiku 5.5 sàng lọc, trả kết quả có cấu trúc; lọc mẫu tấn công đã biết_
2. **Hợp lệ**: đi vào cuộc hội thoại chính **|** **Có hại hoặc lách luật**: code chặn lại, không đi tiếp

Nội dung không do người dùng viết (email, trang web, file) thì đi vào `tool_result` và mã hoá JSON (bài 2.5, bài 7.1).

## Sửa prompt có đo, từng thay đổi một

Trang tổng quan prompt engineering nói trước khi chỉnh prompt cần ba thứ: tiêu chí thành công rõ ràng, cách kiểm thực nghiệm theo tiêu chí đó, và một bản prompt nháp. Bản đầu tiên chỉ là bản nháp. Cách sửa:

1. Lấy các ca đang hỏng từ eval (trong ví dụ: tiệc hai văn hoá).
2. Đổi một thứ mỗi lần: thêm ví dụ, thêm một bước, làm rõ một câu.
3. Chạy lại eval trên cả ca hỏng lẫn ca thông thường, để sửa chỗ này không làm hỏng chỗ khác.

**Sơ đồ**
1. **Lấy ca đang hỏng**: tiệc hai văn hoá
2. **Đổi một thứ**: thêm ví dụ, thêm bước, làm rõ một câu
3. **Chạy lại eval**: cả ca hỏng lẫn ca thông thường
- ↻Đạt tiêu chí thành công thì thoát vòng

> **Trong đề chọn gì**
>
> Câu luyện thi: prompt viết từ nhiều tháng trước, eval cho thấy tốt với ca thường nhưng kém với một nhóm đầu vào đang tăng. Chọn **chỉnh prompt nhắm vào nhóm kém, kiểm bằng eval, tiếp tục tinh chỉnh**. Sai: cảnh báo người dùng tránh nhóm đó; thay hẳn prompt và chấp nhận ca thường tệ đi; tách nhóm đó sang ứng dụng riêng.

Với system prompt 350 dòng của ví dụ, việc đầu tiên là dọn: tìm chỗ chồng chéo, mâu thuẫn, lỗi thời, rồi viết lại để mỗi chỉ dẫn rõ, còn hiệu lực, không trùng. Docs về `CLAUDE.md` có một nhận xét cũng đúng ở đây: hai chỉ dẫn mâu thuẫn thì Claude có thể chọn một cái tuỳ ý, chứ không chắc theo cái mới hơn.

> **Bẫy đề**
>
> Câu luyện thi: system prompt đã dài vài trăm dòng, có chỉ dẫn chồng chéo, mâu thuẫn, lỗi thời. Đúng là **rà soát tìm chồng chéo, mâu thuẫn, nội dung lỗi thời, rồi viết lại để mỗi chỉ dẫn rõ ràng, còn hiệu lực, không trùng**. Sai: thêm chỉ dẫn mới cho "luật mới nhất thắng"; chỉ sửa phần mâu thuẫn, để phần còn lại sau; chia ra nhiều system prompt.

> **Ý chính**
>
> Viết chỉ dẫn cụ thể, có lý do, có bước đánh số. Hành vi và định dạng ở system prompt, đầu vào ở lượt user. Vài ví dụ thì dùng few-shot, 3–5 ví dụ đa dạng bọc thẻ. Prefill đã bị bỏ, dùng structured outputs. Sửa prompt từng thay đổi một và đo bằng eval.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Prompting best practices (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
3. [Prompt engineering overview (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
4. [Define success criteria and build evaluations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
5. [Mitigate jailbreaks and prompt injections (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
6. [Structured outputs (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
7. [How Claude remembers your project (Claude Code Docs)](https://code.claude.com/docs/en/memory)
