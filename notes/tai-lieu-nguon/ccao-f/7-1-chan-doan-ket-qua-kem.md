---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/7-1-chan-doan-ket-qua-kem
ngay_tai: 2026-11-27
tieu_de: Chẩn đoán và sửa prompt cho kết quả kém
---

Domain 7 : Troubleshooting and Optimization·Task 7.1

# Chẩn đoán và sửa prompt cho kết quả kém

Gỡ lỗi một kết quả kém theo thứ tự nào, các nguyên nhân gốc hay gặp nhất, và vì sao các cách sửa ngoài prompt thường không chạm tới gốc.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Gỡ lỗi kết quả kém theo đúng năm bước, từ đọc kết quả tới ghi nguyên nhân
- Nhận ra các nguyên nhân gốc hay gặp nằm trong prompt
- Phân biệt cách sửa đúng gốc với cách chỉ che triệu chứng
- Biết kiểm cả những chỗ ngoài prompt như chat quá dài hay tài liệu cũ

Khi Claude trả về kết quả kém, phản xạ thường gặp là đổi ngay một thứ gì đó: viết lại cả prompt, đổi model, mở chat mới. Đôi khi may mắn trúng. Nhưng nếu không biết vì sao kết quả kém, lần sau lỗi sẽ quay lại.

Bài này giúp bạn trả lời: chẩn đoán một kết quả kém thế nào, và nguyên nhân gốc thường nằm ở đâu?

## Ví dụ xuyên suốt: chăm sóc khách hàng của ví điện tử

Đội chăm sóc khách hàng của một ví điện tử dùng Claude cho ba việc, việc nào cũng đang có vấn đề:

1. **Phân loại ticket**, prompt chỉ có một câu: "Phân loại ticket này." Cùng một loại ticket, hôm thì ra "Thanh toán", hôm ra "Lỗi giao dịch".
2. **Báo cáo tuần**, cùng một prompt mỗi tuần: tuần thì đúng các mục nhưng sai giọng, tuần thì đúng giọng nhưng thiếu mục.
3. **Trả lời khiếu nại**: prompt hỏi ba câu trong một đoạn, cách nhau bằng dấu phẩy ("vì sao giao dịch bị treo, bao giờ hoàn tiền, có phí không"); Claude chỉ trả lời câu đầu.

## Gỡ lỗi theo năm bước

1. 
  - **Đọc hết kết quả, chỉ ra đúng chỗ kém**
2. rồi so
  - **So kết quả với prompt, tìm chỗ không khớp giữa yêu cầu và kết quả**
3. rồi đoán
  - **Đặt giả thuyết**phần nào của prompt gây ra chỗ kém
4. rồi thử
  - **Sửa một chỗ duy nhất, xem kết quả đổi thế nào**
5. rồi ghi
  - **Ghi nguyên nhân gốc và cách sửa để dùng lại**

Đặt giả thuyết trước khi đọc kỹ kết quả là đoán mò. So với prompt trước khi biết chỗ kém là so không có mục tiêu. Và sửa nhiều chỗ một lúc thì không biết chỗ nào có tác dụng.

> Bẫy đề
>
> Câu luyện thi xếp năm bước gỡ lỗi một kết quả kém lặp lại. Đáp án sai hay gặp: đặt giả thuyết trước rồi mới đọc kết quả; so kết quả với prompt trước khi chỉ ra chỗ kém; đặt giả thuyết trước khi so với prompt. Đáp án đúng: **đọc, chỉ ra chỗ kém → so với prompt → đặt giả thuyết → sửa một chỗ, xem tác dụng → ghi nguyên nhân và cách sửa**.

## Nguyên nhân gốc hay gặp nằm trong prompt

Trang hỗ trợ của Claude khi prompt không cho câu trả lời hữu ích khuyên: nói yêu cầu đơn giản và rõ ràng, đưa càng nhiều bối cảnh càng tốt như thể người đọc không biết gì, chia việc phức tạp thành bước nhỏ, và góp ý để Claude viết lại. Đặt cạnh ba việc trong ví dụ:

| Triệu chứng | Nguyên nhân gốc | Sửa |
|---|---|---|
| Phân loại không nhất quán giữa các lần | Prompt không nêu danh mục, khuôn đầu ra, tiêu chí chọn | Liệt kê đúng các danh mục, khuôn trả lời, tiêu chí phân biệt |
| Mỗi tuần lệch một kiểu | Prompt thiếu người đọc, giọng, khuôn, các mục bắt buộc; mỗi lần Claude nhấn một kiểu | Nêu đủ bốn thứ đó |
| Bỏ sót câu hỏi | Phần nêu việc không liệt kê rõ từng câu | Đánh số từng câu, đòi trả lời từng câu |
| Câu trả lời mơ hồ, lạc đề | Prompt chỉ nêu chủ đề, không nêu việc, người đọc, khuôn | Viết lại theo bài 1.1 |

Prompt phân loại sau khi sửa:

```
Phân loại ticket vào đúng một trong 4 danh mục:
1. Nạp tiền: tiền đã trừ ở ngân hàng nhưng chưa vào ví.
2. Thanh toán: thanh toán cho cửa hàng hoặc hoá đơn bị lỗi.
3. Tài khoản: đăng nhập, xác thực, khoá tài khoản.
4. Khác: không thuộc ba loại trên.
Nếu ticket khớp nhiều loại, chọn theo việc khách cần được giải quyết trước.
Chỉ trả về tên danh mục, không giải thích.
```

> Bẫy đề
>
> Câu luyện thi: prompt một câu "Categorize this ticket" cho danh mục không nhất quán, nhóm muốn sửa đúng gốc. Ba đáp án sai:
>
> - Hạ temperature về 0 để kết quả cố định. Kết quả có thể "cố định sai"; vả lại trong app Claude, menu chỉ chỉnh model, effort và thinking.
> - Cho người kiểm tra sửa nhãn trước khi ticket tới khách. Đó là thêm bước hậu kiểm, không sửa gốc.
> - Chuyển sang model lớn hơn "để nó tự suy ra định nghĩa danh mục". Model nào cũng không biết danh mục của đội nếu không ai nói.
>
> Đáp án đúng: **viết lại prompt, nêu đúng danh mục, khuôn đầu ra và tiêu chí chọn**.

> Bẫy đề
>
> Câu luyện thi về báo cáo tuần lúc lệch giọng, lúc thiếu mục cũng có ba lời giải thích sai: đầu vào mỗi tuần khác nhau quá, phải chuẩn hoá đầu vào trước; model vốn không cố định nên chấp nhận chênh lệch; tách giọng và bố cục thành hai prompt. Đáp án đúng: **prompt nêu thiếu người đọc, giọng, khuôn và các mục bắt buộc**, nên mỗi lần chạy trôi theo chỗ model nhấn lần đó.

## Khi nguyên nhân không nằm trong prompt

Prompt là chỗ kiểm đầu tiên, nhưng không phải chỗ duy nhất. Nếu prompt đã đủ mà kết quả vẫn kém, xem thêm:

- **Chat quá dài, bắt đầu trôi**: tóm tắt trạng thái rồi làm tiếp (bài 3.4).
- **Tài liệu hay chỉ dẫn của Project đã cũ**: xem lại knowledge và chỉ dẫn (bài 5.4).
- **Sai tính năng**: phép tính chính xác mà không dùng code execution, cần thông tin mới mà không bật web search (bài 3.1).
- **Việc thật sự khó**: nâng effort trước, rồi mới cân nhắc model mạnh hơn (bài 3.3).

1. Đã chỉ ra đúng chỗ kém chưa?Đọc hết kết quả, nêu cụ thể chỗ kém
2. Prompt có nêu rõ việc, người đọc, khuôn, các mục bắt buộc?Bổ sung phần thiếu, sửa một chỗ mỗi lần
3. Prompt đủ mà chat đã dài, đang trôi?Tóm tắt trạng thái, làm tiếp
4. Tài liệu, chỉ dẫn của Project đã cũ?Cập nhật cấu hình
5. Còn lạiPrompt và cấu hình đều ổn mà việc rất khó: nâng effort, rồi mới đổi model

> Trong đề chọn gì
>
> Đề hỏi nguyên nhân gốc của kết quả kém: gần như luôn chọn đáp án chỉ vào **phần prompt nêu thiếu** (việc, danh mục, câu hỏi cần trả lời, người đọc, khuôn). Loại các đáp án đổ cho tính ngẫu nhiên của model, cho prompt quá dài, hay đề xuất đổi model, chỉnh temperature, thêm người sửa sau.

> Ý chính
>
> Chẩn đoán trước khi sửa: đọc, so với prompt, đặt giả thuyết, sửa một chỗ, ghi lại. Nguyên nhân gốc thường là prompt nêu thiếu; đổi model hay thêm bước hậu kiểm chỉ che triệu chứng.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 7(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [My prompt isn't giving me a helpful answer (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer)
3. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
4. [Change the model, effort, and thinking settings (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
