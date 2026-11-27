---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-1-khao-sat-yeu-cau
ngay_tai: 2026-11-27
tieu_de: Khảo sát có cấu trúc và thu thập yêu cầu
---

Domain 6: Stakeholder Communication & Lifecycle Management · Task 6.1

# Khảo sát có cấu trúc và thu thập yêu cầu

Biến yêu cầu mơ hồ thành bản mô tả có người dùng, nhu cầu, ràng buộc, tiêu chí đạt và bài kiểm nghiệm thu viết trước, kèm cách tìm yêu cầu chưa ai nói.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Dẫn một buổi khảo sát có cấu trúc thay vì làm ngay theo yêu cầu mơ hồ
- Phân biệt yêu cầu chức năng với yêu cầu phi chức năng
- Viết tiêu chí thành công và ngưỡng thất bại trước khi xây
- Tìm những yêu cầu chưa ai nói ra, và viết bài kiểm nghiệm thu trước khi có code

"Chúng tôi muốn AI cải thiện trải nghiệm khách hàng, tuần sau bắt đầu thiết kế nhé." Một yêu cầu như vậy chưa đủ để thiết kế bất cứ thứ gì: chưa biết khách gặp khó ở đâu, đo bằng gì, AI phải hỗ trợ quyết định nào. Khảo sát (**discovery**) là bước biến câu đó thành thứ xây được và kiểm được.

Bài này giúp bạn trả lời: khảo sát và thu thập yêu cầu cho một giải pháp dùng Claude thế nào?

## Ví dụ xuyên suốt: chuỗi phòng khám thú y

Giám đốc một chuỗi phòng khám thú y nói: "Tôi muốn AI cải thiện trải nghiệm khách hàng." Ông không nói được hành trình nào của khách đang hỏng, chỉ số nào cho thấy điều đó, hay AI sẽ hỗ trợ quyết định gì, và muốn bắt đầu thiết kế tuần sau.

## Khảo sát trước, thiết kế sau

> **Bẫy đề**
>
> Câu luyện thi có đúng tình huống này. Hành động đúng đầu tiên: **dẫn một buổi khảo sát có cấu trúc** để xác định quyết định đang hỏng và chỉ số mục tiêu. Các đáp án sai: đề nghị nhà tài trợ viết lại yêu cầu rồi nộp sau (đẩy việc đi); làm ngay một trợ lý chung chung cho kịp hạn; tự đề xuất một phạm vi cố định dựa trên giả định của mình.

Khoá AI Fluency for Builders của Anthropic Academy gợi ý một bản mô tả vấn đề ngắn (một trang) với bốn câu hỏi:

| Câu hỏi | Trong ví dụ |
| --- | --- |
| Ai là người dùng? Cụ thể | Chủ thú cưng đặt lịch khám, phần lớn đặt qua điện thoại vào buổi tối |
| Họ thật sự cần gì? Không phải "một chatbot", mà kết quả họ mong | Đặt được lịch sớm khi thú cưng có dấu hiệu bệnh, biết có cần đi cấp cứu không |
| Một giải pháp tốt dùng sẽ thấy thế nào? Tả trải nghiệm, không tả tính năng | Trong 2 phút biết nên mang thú cưng đến ngay hay đặt lịch hôm sau |
| Ràng buộc thật là gì? | Ngân sách, nhân viên lễ tân ít rành công nghệ, dữ liệu bệnh án thú cưng, không được chẩn đoán thay bác sĩ |

Khoá học cũng nói giao việc cho AI bắt đầu từ **chia nhỏ vấn đề**, rồi mới quyết định AI đảm nhận gì ở từng bước. Khung AI Fluency gọi năng lực này là **Delegation**. Khoá học tách ba mức giao: AI làm rồi người kiểm (**Automation**), người và AI cùng làm (**Augmentation**), AI tự hành động trong ranh giới đặt sẵn (**Agency**).

> **Trong đề chọn gì**
>
> Câu luyện thi: hai việc của giai đoạn khảo sát cho giải pháp chăm sóc khách hàng. Chọn **tổ chức workshop với các bên liên quan để làm rõ ràng buộc về độ trễ, độ chính xác, tuân thủ trước khi chốt phạm vi**, và **ghi tiêu chí thành công cùng ngưỡng thất bại làm điều kiện để đưa vào production**. Loại: chọn model theo kinh nghiệm dự án cũ trước khi khảo sát; làm prototype rồi điều chỉnh theo phản ứng thay cho yêu cầu bằng văn bản; để ghi ràng buộc tới giai đoạn thiết kế tích hợp.

## Yêu cầu chức năng và phi chức năng

- **Chức năng**: hệ thống phải **làm gì**. Phân loại tin nhắn vào các loại cố định; trích các trường từ phiếu khám; soạn câu trả lời nháp cho lễ tân sửa.
- **Phi chức năng**: hệ thống phải làm **tốt tới mức nào**: độ trễ, độ sẵn sàng, chi phí, bảo mật, tuân thủ.

> **Trong đề chọn gì**
>
> Câu luyện thi: trong bốn yêu cầu, yêu cầu phi chức năng là "hệ thống phải phản hồi ở phân vị 95 dưới 800 ms với khối lượng yêu cầu dự kiến". Trích trường, soạn nháp cho người sửa, phân loại ticket đều là yêu cầu chức năng.

## Tiêu chí thành công viết trước khi xây

Docs của Anthropic về tiêu chí thành công nói tiêu chí tốt phải cụ thể, đo được, làm được, đúng mục đích, và hầu hết ứng dụng cần **nhiều** tiêu chí cùng lúc (độ chính xác, độ trễ, chi phí, an toàn...). Một mục tiêu độ chính xác duy nhất là chưa đủ.

Trong ví dụ:

- Phân loại đúng mức khẩn cấp (cấp cứu, trong ngày, đặt lịch thường) cho ít nhất 95% tin nhắn trong bộ 300 tin nhắn mẫu có nhãn của bác sĩ.
- **Không** có ca cấp cứu nào bị xếp thành đặt lịch thường trong bộ mẫu (ngưỡng thất bại: một ca là dừng).
- Phản hồi đầu tiên dưới 3 giây cho 95% tin nhắn.

## Tìm những yêu cầu chưa ai nói ra

Nhiều yêu cầu quan trọng nhất không ai nói ra, vì người trong nghề thấy chúng hiển nhiên. Bài blog của Anthropic về tìm "những điều chưa biết" chia thành bốn loại: điều biết là mình biết (đã có trong yêu cầu), điều biết là mình chưa biết, điều mình biết nhưng hiển nhiên tới mức không bao giờ viết ra, và điều chưa từng nghĩ tới. Các cách được gợi ý:

- **Nhờ Claude phỏng vấn**: yêu cầu Claude hỏi bạn từng câu một về những chỗ mơ hồ, ưu tiên câu mà câu trả lời làm thay đổi kiến trúc. Docs Claude Code có mẫu tương tự: "phỏng vấn tôi cho tới khi đủ để viết spec".
- **Rà điểm mù** (blind spot pass): nhờ Claude chỉ ra những gì bạn chưa xét tới.
- **Làm prototype sớm**: những điều "hiển nhiên" thường chỉ lộ ra khi người dùng thấy một bản chạy thử, và phát hiện lúc đó rẻ hơn nhiều so với lúc đang triển khai.
- **Xem dữ liệu thật**: đọc 50 tin nhắn thật của khách trước khi viết yêu cầu.

Trong ví dụ, đọc tin nhắn thật lộ ra một yêu cầu không ai nói: nhiều khách gửi ảnh thú cưng kèm tin nhắn, nên hệ thống phải đọc được ảnh.

## Bài kiểm nghiệm thu viết trước code

Khoá AI Fluency for Builders khuyên viết **bài kiểm nghiệm thu** (acceptance test) trước khi có code, vì chúng là định nghĩa chung về "xong" cho cả bạn và AI. Mỗi bài phải cụ thể tới mức một người ngoài phán được đạt hay không đạt. Ví dụ tốt: "Chủ thú cưng dùng điện thoại cơ bản biết được nên đến ngay hay đặt lịch trong vòng 2 phút, không cần tạo tài khoản." Ví dụ tồi: "Hệ thống dễ dùng."

Khoá học còn mô tả một chuỗi diễn đạt (**Description Chain**): lời của người dùng, thành yêu cầu, thành spec kỹ thuật, thành chỉ dẫn cho AI. Prompt chỉ là mắt xích cuối. Khoá học nói rõ: test đạt mà người dùng vẫn không vui nghĩa là bạn đã mô tả sai ý định, và phải lần ngược lên tìm mắt xích hỏng.

**Sơ đồ**
1. **Lời của người dùng**: "muốn biết có cần mang thú cưng đi ngay không"
   ↓ _thành_
2. **Yêu cầu**: phân loại mức khẩn cấp của tin nhắn
   ↓ _thành_
3. **Spec kỹ thuật**: ba mức khẩn cấp, đầu vào, đầu ra, ngưỡng đạt
   ↓ _thành_
4. **Chỉ dẫn cho AI**: prompt là mắt xích cuối

Cả đường đi của bước khảo sát trong ví dụ:

**Sơ đồ**
1. **"Tôi muốn AI cải thiện trải nghiệm khách hàng"**
   ↓ _khảo sát có cấu trúc: quyết định nào đang hỏng, chỉ số nào_
2. **Bản mô tả vấn đề**: người dùng, nhu cầu thật, trải nghiệm mong muốn, ràng buộc
   ↓ _viết thành con số_
3. **Tiêu chí kèm ngưỡng thất bại**: 95% đúng mức khẩn cấp, không ca cấp cứu nào bị xếp nhầm
   ↓ _viết trước khi có code_
4. **Bài kiểm nghiệm thu**: người ngoài phán được đạt hay không đạt

> **Ý chính**
>
> Yêu cầu mơ hồ thì khảo sát trước: người dùng, nhu cầu thật, trải nghiệm mong muốn, ràng buộc. Viết nhiều tiêu chí đo được cùng ngưỡng thất bại, chủ động tìm yêu cầu chưa ai nói, và viết bài kiểm nghiệm thu trước khi có code.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [AI Fluency for Builders, Delegation (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-for-builders/delegation-the-builder-s-toolkit)
3. [AI Fluency for Builders, Description (Anthropic Academy)](https://academy.claude.com/courses/ai-fluency-for-builders/description-building-great-things)
4. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
5. [A field guide to Claude Fable, finding your unknowns (Claude Blog)](https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns)
6. [Best practices for Claude Code (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
