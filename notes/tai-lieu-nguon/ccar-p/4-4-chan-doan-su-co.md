---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/4-4-chan-doan-su-co
ngay_tai: 2026-11-27
tieu_de: Chẩn đoán sự cố của hệ thống dùng Claude
---

Domain 4: Evaluation, Testing & Optimization · Task 4.4

# Chẩn đoán sự cố của hệ thống dùng Claude

Khoanh lỗi vào tầng truy xuất, prompt, tool hay model trước khi sửa, xác nhận bịa thông tin, rồi so với bản tốt gần nhất, chạy lại và tái hiện để tìm gốc.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Khoanh lỗi vào một trong bốn tầng trước khi chọn cách sửa
- Xác nhận một nghi vấn bịa thông tin bằng trích dẫn, độ nhất quán và kiểm nguồn
- Đọc triệu chứng dùng tool sai ngược về phần định nghĩa tool gây ra nó
- Nhận ra lệch model, và dùng so sánh, chạy lại, tái hiện để tìm nguyên nhân gốc
- Ước lượng quy mô sự cố trước khi kết luận

Khi hệ thống trả lời sai, phản xạ quen thuộc là sửa ngay thứ gần tay nhất: thêm một câu vào prompt, hạ temperature, đổi model lớn hơn. Nhưng sửa trước khi biết lỗi nằm ở đâu thường chỉ che triệu chứng, và đôi khi làm hỏng thứ đang chạy tốt.

Bài này giúp bạn trả lời: một hệ thống dùng Claude hỏng thì tìm nguyên nhân thế nào, theo thứ tự nào?

## Ví dụ xuyên suốt: trợ lý tra cứu quy định của phòng pháp chế

Phòng pháp chế một ngân hàng dùng trợ lý RAG để tra quy định nội bộ và văn bản của cơ quan quản lý. Trong một tháng có ba sự cố:

1. Sau khi **nâng phiên bản model**, trợ lý bắt đầu đưa ra những khẳng định không có trong tài liệu truy xuất được, dù khâu truy xuất không đổi.
2. Sau **đợt bảo trì cuối tuần**, bước trích xuất trả về JSON hỏng, làm bước xử lý phía sau lỗi hàng loạt.
3. Một người dùng báo một bản tóm tắt có **trích dẫn không tồn tại**. Trưởng nhóm hỏi: lỗi cá biệt hay lỗi kiến trúc?

## Bốn tầng có thể hỏng

| Tầng | Triệu chứng điển hình |
| --- | --- |
| Truy xuất và grounding | Câu trả lời tự tin nhưng sai sau khi làm mới tài liệu; đoạn đưa vào không liên quan hay đã cũ |
| Prompt | Claude làm đúng chữ nhưng sai ý; định dạng đầu ra lúc thế này lúc thế khác dù đầu vào sạch |
| Tool | Gọi sai tool, sai tham số, không gọi tool |
| Model | Lỗi xuất hiện sau khi đổi model hay đổi effort; model quá nhỏ cho việc khó, hay quá lớn cho việc đơn giản |

Câu hỏi đầu tiên luôn là: **cái gì đã thay đổi** ngay trước khi lỗi xuất hiện? Tầng không đổi thì tạm loại khỏi diện nghi vấn.

1. **Vừa làm mới tài liệu?** → Nghi tầng truy xuất và grounding
2. **Vừa sửa prompt, template hay schema?** → Nghi tầng prompt
3. **Vừa đổi định nghĩa tool?** → Nghi tầng tool
4. **Vừa đổi model hay effort?** → Nghi tầng model
- **Còn lại** → Tầng nào không đổi thì tạm loại khỏi diện nghi vấn

> **Trong đề chọn gì**
>
> Sự cố 1 là câu luyện thi: trợ lý bắt đầu nói ngược với tài liệu truy xuất được, dù khâu truy xuất không đổi. Hai hành động chẩn đoán nhắm đúng gốc: **kiểm xem lỗi có tái hiện trên phiên bản model trước** không (để thử giả thuyết lệch model), và **xem lại chỉ dẫn grounding trong system prompt** xem ràng buộc trích dẫn còn nguyên không. Các đáp án sai: tăng context window để nhét thêm chunk, đổi sang model embedding khác, hạ temperature cho mọi loại câu hỏi.

## Xác nhận bịa thông tin

Docs của Anthropic về giảm bịa thông tin cho vài cách kiểm và cách sửa:

- **Trích trước, trả lời sau**: với tài liệu dài, yêu cầu Claude trích nguyên văn đoạn liên quan rồi mới trả lời. Ý nào không có đoạn trích thì không có căn cứ.
- **Trích dẫn và rút lại**: mỗi khẳng định phải kèm trích dẫn; không tìm được trích dẫn thì phải rút lại khẳng định đó.
- **So nhiều lần chạy** (best-of-N): chạy cùng câu hỏi nhiều lần; các câu trả lời mâu thuẫn nhau là dấu hiệu bịa.
- **Cho phép nói "không biết"**, và chỉ dùng tài liệu được cấp, không dùng kiến thức chung.

Docs cũng nói rõ các kỹ thuật này giảm chứ không loại bỏ hẳn việc bịa.

Ghép "trích trước" với "trích dẫn và rút lại":

**Sơ đồ**
1. **Tài liệu dài**
   ↓ _Claude trích nguyên văn đoạn liên quan_
2. **Các đoạn trích**
   ↓ _trả lời, mỗi khẳng định kèm trích dẫn_
3. **Câu trả lời nháp**
   ↓ _khẳng định không tìm được trích dẫn thì rút lại_
4. **Câu trả lời cuối**: ý nào cũng có căn cứ để kiểm

> **Bẫy đề**
>
> Câu luyện thi: sau khi nâng model, câu trả lời bắt đầu có khẳng định không được tài liệu nguồn hỗ trợ. Biện pháp nhắm thẳng vào lỗi này: **ràng buộc câu trả lời chỉ dùng nội dung có nguồn, bắt buộc trích dẫn, thêm một bước kiểm**. Chấm từng phiên bản model trên một bộ test tấn công cố định là việc tốt nhưng nhắm vào trôi chất lượng an toàn; thay API key bằng OAuth và lọc đầu vào lúc nạp là chuyện bảo mật, không liên quan.

## Lỗi prompt: làm đúng chữ, sai ý

Định dạng JSON đổi tên trường giữa các lần chạy dù đầu vào sạch không phải là bịa thông tin; đó là prompt **chưa nói đủ**. Sửa bằng schema cố định và một ví dụ đầu ra (bài 2.3), hoặc structured outputs nếu cần chắc chắn đúng schema. Một luật bị áp quá tay ở chỗ không cần thường là vì luật thiếu lý do; docs về prompt khuyên nói rõ mục đích để Claude hiểu phạm vi của luật.

> **Trong đề chọn gì**
>
> Sự cố 2 là câu luyện thi: JSON hỏng ngay sau đợt bảo trì. Hai bước cô lập gốc: **so system prompt và cấu hình schema hiện tại với bản tốt gần nhất trước đợt bảo trì**, và **chạy lại một loạt yêu cầu cũ trên cấu hình hiện tại, xem đầu ra thô của model trước khi parse**. Các đáp án sai: xoá cache rồi gửi lại, đổi sang model khác "để loại trừ phía nhà cung cấp", tăng `max_tokens` xem có bị cắt không.

## Lỗi tool: đọc triệu chứng ngược về định nghĩa

Docs về xử lý sự cố tool use cho bảng triệu chứng, nguyên nhân, cách sửa. Tóm lại:

| Triệu chứng | Nguyên nhân hay gặp | Sửa |
| --- | --- | --- |
| Không bao giờ gọi tool | Trùng tên tool, schema quá chung chung | Bỏ trùng; thêm `input_examples` cho thấy cách dùng |
| Gọi nhầm tool | Mô tả mơ hồ | Phân biệt các tool theo **khi nào** dùng, không chỉ **làm gì** |
| Sai kiểu tham số, bịa tham số | Schema mơ hồ, không bật strict | `strict: true` nếu schema nằm trong phần được hỗ trợ, hoặc `input_examples` |
| So chuỗi đầu vào tool hỏng khi đổi model | Cách thoát ký tự khác giữa các phiên bản | Parse JSON, không so chuỗi thô |
| Chỉ dẫn bị coi như prompt injection | Chỉ dẫn của bạn nằm trong `tool_result` | Chuyển chỉ dẫn ra lượt user sau `tool_result` |

Bài viết của Anthropic về viết tool cho agent thêm: nhiều lỗi tham số không hợp lệ thường nghĩa là mô tả tool cần rõ hơn hoặc cần ví dụ.

## Lệch model và ước lượng quy mô

**Lệch model** (**model mismatch**) có hai chiều. Model quá nhỏ cho việc khó thì chất lượng tụt; model quá lớn cho việc đơn giản (trả lời theo mẫu) thì đúng nhưng chậm và đắt. Nếu chất lượng tụt sau khi ai đó **hạ effort**, việc đầu tiên là trả effort về rồi chạy lại bộ test, trước khi nghĩ tới đổi model. Docs về chọn model khuyên chỉ nâng model khi thấy thiếu năng lực cụ thể, đo bằng bộ test.

Dấu hiệu của thiếu năng lực thật là gì? Docs chọn model xếp việc cần hiểu sắc thái và lập luận phức tạp vào nhóm nên bắt đầu từ model mạnh. Tiêu chí thực dụng của bài này: bạn nghĩ tới nâng model khi workflow có chuỗi bước phụ thuộc nhau mà lỗi cộng dồn, điểm trên bộ test của chính use case vẫn dưới ngưỡng sau khi đã sửa prompt, và lỗi khi xem tay trông như suy luận sai thật (không phải do thiếu hay bị cắt đầu vào). Prompt chưa chỉnh cho model hiện tại, độ trễ mạng thông thường hay chi phí vượt ngân sách thì chưa chứng minh được điều này.

Với sự cố 3, câu hỏi "cá biệt hay kiến trúc" phải trả lời bằng số liệu. Khung AI Fluency gọi việc chịu trách nhiệm về sản phẩm có AI tham gia là **Diligence**.

> **Bẫy đề**
>
> Sự cố 3 là câu luyện thi: hai hành động đúng là **lấy mẫu các bản tóm tắt gần đây để ước lượng tần suất bịa** trên toàn bộ, và **xem pipeline có kiểm soát nào gắn trích dẫn với nguồn không**. Nếu chưa từng có kiểm soát nào, đó là lỗ hổng kiến trúc. Các đáp án sai: tắt trợ lý ngay cho mọi người khi chưa chẩn đoán gì; coi là chuyện cá biệt và bỏ qua; nói với người dùng rằng trợ lý được thiết kế để không bịa.

Ba sự cố đặt cạnh nhau, mỗi sự cố một hành động đầu tiên:

**Sơ đồ**
1. **Sự cố 1**: vừa nâng model, truy xuất không đổi **|** **Sự cố 2**: JSON hỏng sau bảo trì **|** **Sự cố 3**: một trích dẫn không tồn tại
   ↓ _làm gì trước_
2. **Tái hiện trên phiên bản model trước, xem chỉ dẫn grounding** **|** **So prompt và schema với bản tốt gần nhất, xem đầu ra thô** **|** **Lấy mẫu ước lượng tần suất, xem có kiểm soát gắn trích dẫn với nguồn không**

> **Ý chính**
>
> Hỏi cái gì đã đổi, khoanh lỗi vào một tầng, rồi mới sửa. So với bản tốt gần nhất, chạy lại yêu cầu cũ, tái hiện trên phiên bản trước, và ước lượng quy mô bằng mẫu trước khi kết luận.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 4](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Reduce hallucinations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
3. [Troubleshooting tool use (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/troubleshooting-tool-use)
4. [Prompting best practices (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
5. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/engineering/writing-tools-for-agents)
6. [Choosing the right model (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
7. [AI Fluency, Framework and Foundations (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
