---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-5-dao-duc-ai
ngay_tai: 2026-11-27
tieu_de: Đạo đức AI, gồm thiên lệch, công bằng và minh bạch
---

Domain 5: Governance, Safety & Risk Management · Task 5.5

# Đạo đức AI, gồm thiên lệch, công bằng và minh bạch

Thiên lệch vào hệ thống dùng Claude từ đâu, đo công bằng giữa các nhóm thế nào, vì sao khớp quyết định của người chưa đủ, và minh bạch với người dùng ra sao.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Chỉ ra các chỗ thiên lệch có thể đi vào một hệ thống dùng Claude
- Đo công bằng bằng chênh lệch kết quả và chênh lệch tỉ lệ sai giữa các nhóm
- Nhận ra những lập luận sai thường dùng để bỏ qua đánh giá thiên lệch
- Giữ trách nhiệm của con người với quyết định ảnh hưởng lớn, và minh bạch việc dùng AI

Một hệ thống có thể chính xác trung bình rất cao mà vẫn đối xử không công bằng với một nhóm người. Và vì quyết định đi qua một model, người ta dễ nghĩ nó "khách quan". Đạo đức AI trong đề thi xoay quanh ba chữ: thiên lệch (**bias**), công bằng (**fairness**) và minh bạch (**transparency**).

Bài này giúp bạn trả lời: thiên lệch đi vào hệ thống ở đâu, đo công bằng thế nào, và minh bạch với người dùng ra sao?

## Ví dụ xuyên suốt: nền tảng cho thuê nhà

Một nền tảng cho thuê căn hộ dùng Claude đọc hồ sơ người thuê (thu nhập, lịch sử thuê, thư giới thiệu) và đề xuất cho chủ nhà: nên ưu tiên, cân nhắc, hay không phù hợp. Một thành viên ban giám đốc nói: "Model không được huấn luyện trên dữ liệu của công ty mình, nên không cần đánh giá thiên lệch."

## Thiên lệch đi vào từ đâu

| Chỗ | Trong ví dụ |
| --- | --- |
| Dữ liệu huấn luyện của model | Khoá AI Capabilities and Limitations của Anthropic nói kiến thức của model phủ không đều và mang theo thiên lệch từ dữ liệu nó học |
| Prompt và ví dụ | Ví dụ "hồ sơ tốt" toàn người làm văn phòng ở trung tâm thành phố |
| Tài liệu truy xuất | Bộ hướng dẫn chấm hồ sơ cũ có tiêu chí gián tiếp phân biệt (như ưu tiên người không có con nhỏ) |
| Cách đánh giá | Bộ test chỉ lấy từ một nhóm người thuê |

Vì thiên lệch có thể đến từ quá trình huấn luyện ban đầu của model, việc "không huấn luyện trên dữ liệu công ty" không miễn trừ đánh giá.

**Sơ đồ**
1. **Model**: thiên lệch từ dữ liệu đã học **|** **Prompt và ví dụ**: "hồ sơ tốt" toàn người làm văn phòng **|** **Tài liệu truy xuất**: tiêu chí cũ phân biệt gián tiếp
   ↓ _cùng đi vào_
2. **Đề xuất cho chủ nhà**: ưu tiên, cân nhắc, không phù hợp
   ↓ _bộ test chỉ lấy từ một nhóm thì không thấy_
3. **Thiên lệch tới tay chủ nhà mà không ai biết**

> **Bẫy đề**
>
> Câu luyện thi: một bên liên quan nói model không được huấn luyện trên dữ liệu công ty nên không cần đánh giá thiên lệch cho công cụ sàng lọc ứng viên. Hai phản biện đúng: **model có thể mang thiên lệch nhân khẩu học từ giai đoạn huấn luyện ban đầu**, thể hiện ra trong kết quả sàng lọc; và **phải đánh giá chênh lệch kết quả giữa các nhóm được bảo vệ trước khi triển khai**. Các lập luận sai: minh bạch chỉ cần báo là có dùng AI; chỉ cần kiểm công bằng khi dữ liệu huấn luyện được biết là có thuộc tính nhạy cảm; nhà cung cấp đã công bố hướng dẫn sử dụng có trách nhiệm thì không cần đánh giá.

## Đo công bằng

Nghiên cứu của Anthropic về đánh giá phân biệt đối xử trong quyết định của model ngôn ngữ dùng một cách làm áp dụng được cho hệ thống của bạn: tạo nhiều tình huống quyết định (họ dùng 70 tình huống), rồi **giữ nguyên mọi thứ, chỉ thay thông tin nhân khẩu học**, xem kết quả có đổi không. Họ phát hiện cả phân biệt theo hướng có lợi lẫn bất lợi ở model Claude 2.0 trong một số tình huống, và cho thấy viết prompt cẩn thận giảm đáng kể cả hai. Nghiên cứu cũng nói rõ họ **không** ủng hộ dùng model ngôn ngữ để tự động ra quyết định trong các tình huống rủi ro cao được nghiên cứu.

Áp vào hồ sơ thuê nhà:

**Sơ đồ**
1. **Một hồ sơ**: giữ nguyên thu nhập, lịch sử thuê, thư giới thiệu
   ↓ _chỉ thay thông tin nhân khẩu học_
2. **Bản nhóm A** **|** **Bản nhóm B** **|** **Bản nhóm C**
   ↓ _so đề xuất của ba bản_
3. **Đề xuất có đổi không? Đổi thì có phân biệt đối xử cần xử lý**

Các chỉ số cần nhìn:

- **Chênh lệch kết quả**: tỉ lệ được đề xuất "ưu tiên" giữa các nhóm.
- **Chênh lệch tỉ lệ sai**: trong số người thật ra phù hợp, tỉ lệ bị đề xuất "không phù hợp" ở mỗi nhóm có như nhau không. Tỉ lệ duyệt bằng nhau vẫn có thể che tỉ lệ sai khác nhau.
- **Nhất quán theo cách diễn đạt**: cùng một hồ sơ viết theo hai cách có nhận cùng đề xuất và cùng lý do không.

> **Bẫy đề**
>
> Câu luyện thi: trợ lý sơ duyệt vay có 94% đề xuất khớp quyết định của chuyên viên, và nhóm công bằng thấy tỉ lệ duyệt giữa các nhóm được bảo vệ không chênh đáng kể; một thành viên hội đồng hỏi vậy đã đủ kết luận là công bằng chưa. Hai nhận định đúng: **tỉ lệ duyệt bằng nhau tự nó không đánh giá chênh lệch tỉ lệ sai giữa các nhóm**, và **khớp với chuyên viên không chứng minh là không có thiên lệch do chính chuyên viên đưa vào**. Các nhận định sai: 94% khớp là đủ bằng chứng công bằng; nhóm công bằng chắc đã bỏ sót nhóm nào đó; cần mẫu lớn hơn mới nói được gì.

## Không suy rộng vượt dữ liệu, con người chịu trách nhiệm

Hai mục nên có trong checklist đánh giá đạo đức (câu luyện thi chấm đúng):

- Đầu ra **không dựa vào những khái quát về con người** mà dữ liệu bên dưới không hỗ trợ. Một dòng nhận xét kiểu "người làm tự do thường trả tiền thuê không đều" là khái quát cần bị chặn nếu không có dữ liệu thật của chính người đó.
- Quyết định ảnh hưởng lớn **vẫn do con người chịu trách nhiệm**, không quy cho model.

Chính sách sử dụng của Anthropic xếp nhà ở vào nhóm rủi ro cao: khuyến nghị AI ảnh hưởng tới việc tiếp cận nhà ở phải được một người có chuyên môn xem xét thực chất, có quyền thay đổi. Chính sách cũng cấm dùng sản phẩm để phân biệt đối xử dựa trên thuộc tính được bảo vệ. Khung AI Fluency gọi năng lực chịu trách nhiệm về sản phẩm có AI tham gia là **Diligence**, gồm cả việc minh bạch vai trò của AI và chịu trách nhiệm với kết quả đưa cho người khác.

Các mục câu luyện thi chấm sai cho checklist đạo đức: kiểm điều khoản giấy phép của nhà cung cấp (chuyện pháp lý, không phải đạo đức của đầu ra); chỉ xem xét đầu ra có độ tin cậy cao; kiểm độ trễ và thông lượng giữa các nhóm người dùng.

## Minh bạch với người dùng

Chính sách sử dụng của Anthropic có hai yêu cầu liên quan:

- Chatbot hướng tới người tiêu dùng phải cho người dùng biết họ đang trò chuyện với AI, tối thiểu ở đầu mỗi phiên hoặc trong giao diện sản phẩm.
- Người nhận một khuyến nghị rủi ro cao, hay chịu một quyết định dựa trên nó, phải được báo rõ là AI đã được dùng (không cần nêu tên nhà cung cấp hay model).

Trong ví dụ: người thuê nhà được biết hồ sơ của họ có được AI sơ duyệt, và có cách liên hệ một người thật để hỏi lại.

> **Trong đề chọn gì**
>
> Câu luyện thi về minh bạch cho trợ lý hướng tới khách hàng mà câu trả lời chịu ảnh hưởng lớn của AI. Đáp án: **công bố việc dùng AI cho người dùng cuối** theo chính sách minh bạch của tổ chức, **kèm một đường liên hệ người thật** khi cần. Các đáp án sai: nói sai vai trò của AI cho "tự nhiên" hơn; từ chối trả lời khi người dùng hỏi có dùng AI không; chỉ công bố cho nhân viên nội bộ.

> **Ý chính**
>
> Thiên lệch có thể đến từ model, prompt, tài liệu và cách đánh giá, nên luôn phải đo: chênh lệch kết quả, chênh lệch tỉ lệ sai, nhất quán theo cách diễn đạt. Con người chịu trách nhiệm với quyết định ảnh hưởng lớn, và người dùng phải biết AI đã được dùng.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Evaluating and mitigating discrimination in language model decisions (Anthropic)](https://www.anthropic.com/research/evaluating-and-mitigating-discrimination-in-language-model-decisions)
3. [Usage Policy (Anthropic)](https://www.anthropic.com/legal/aup)
4. [AI Capabilities and Limitations (Anthropic Academy)](https://academy.claude.com/courses/ai-capabilities-and-limitations)
5. [AI Fluency, Framework and Foundations (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
6. [Building safeguards for Claude (Anthropic)](https://www.anthropic.com/news/building-safeguards-for-claude)
