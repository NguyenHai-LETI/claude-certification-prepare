---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/6-1-viec-nen-va-khong-nen-dung
ngay_tai: 2026-11-27
tieu_de: Việc nên và không nên dùng Claude
---

Domain 6 : Governance, Risk, and Responsible Use·Task 6.1

# Việc nên và không nên dùng Claude

Phân biệt việc hợp với Claude và việc không nên giao, các yêu cầu bắt buộc của Anthropic cho việc rủi ro cao, và các bước đánh giá một cách dùng mới.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Nhận ra cách dùng Claude phù hợp và không phù hợp
- Biết các yêu cầu bắt buộc của Usage Policy cho việc rủi ro cao
- Tách việc ra quyết định khỏi việc soạn văn bản khi quyết định ảnh hưởng tới người
- Đánh giá một cách dùng Claude mới theo đúng thứ tự

Claude làm được nhiều việc, nhưng "làm được" không có nghĩa là "nên giao". Có những việc mà nếu Claude sai, một người cụ thể mất khoản vay, mất cơ hội việc làm hay mất chỗ học. Với những việc đó, câu hỏi không phải Claude giỏi tới đâu, mà là ai chịu trách nhiệm.

Bài này giúp bạn trả lời: việc nào nên dùng Claude, việc nào không, và đánh giá một cách dùng mới thế nào?

## Ví dụ xuyên suốt: phòng tín dụng của công ty tài chính tiêu dùng

Một công ty tài chính tiêu dùng nhận khoảng 3.000 hồ sơ vay trả góp mỗi tháng. Giám đốc khối muốn:

1. Claude tóm tắt hồ sơ và đánh dấu giấy tờ còn thiếu cho chuyên viên.
2. Claude soạn thư thông báo kết quả gửi khách.
3. Claude **tự quyết định duyệt hay từ chối hạn mức**, "cho nhanh, khỏi cần chuyên viên".
4. Claude tự gửi email cho khách và tự cập nhật trạng thái hồ sơ trong hệ thống, không cần ai duyệt.

## Phù hợp và không phù hợp

| Phù hợp (có người duyệt) | Không phù hợp |
|---|---|
| Tóm tắt hồ sơ, đánh dấu giấy tờ thiếu | Làm người quyết định duy nhất về khoản vay, tuyển dụng, tuyển sinh |
| Soạn nháp thư, email cho người duyệt | Tự thực hiện hành động khó đảo ngược mà không ai duyệt |
| Tổng hợp tài liệu dài thành bản tóm tắt | Ra cam kết ràng buộc pháp lý thay công ty |
| Soạn câu hỏi phỏng vấn, mô tả công việc | Theo dõi dòng dữ liệu thời gian thực, cần phản ứng tức thì |

Việc 1 và 2 hợp với Claude. Việc 3 và 4 thì không, và lý do không chỉ là "Claude có thể sai". Trang hỗ trợ của Claude nói đừng coi Claude là nguồn sự thật duy nhất. Còn khoá AI Fluency coi quyết định cuối cùng về tuyển dụng là việc **không phù hợp để giao hẳn cho AI**, vì nó cần phán đoán, trách nhiệm của con người, và hậu quả với người bị ảnh hưởng.

> Bẫy đề
>
> Câu luyện thi: dùng Claude làm người quyết định duy nhất cho việc duyệt hạn mức tín dụng. Ba cách xử lý sai:
>
> - Mở rộng thêm: Claude vừa đánh giá vừa gửi thông báo duyệt thẳng cho khách.
> - Đồng ý vì Claude xử lý nhanh hơn đội chuyên viên.
> - Chạy thử, chỉ báo bộ phận tuân thủ khi có chuyện.
>
> Đáp án đúng: **từ chối thiết kế để Claude quyết định một mình, đề xuất Claude hỗ trợ chuyên viên, chuyên viên giữ quyền quyết định**.

## Yêu cầu của Anthropic cho việc rủi ro cao

Usage Policy của Anthropic (chính sách sử dụng áp dụng cho mọi người dùng, kể cả người dùng app Claude; bản có hiệu lực từ 12/11/2026) có mục riêng cho **việc rủi ro cao** (*high-risk use cases*): những việc ảnh hưởng tới sức khoẻ, quyền pháp lý, tài chính, sinh kế, hay khả năng tiếp cận nhà ở, giáo dục, dịch vụ thiết yếu của một người. Các lĩnh vực được liệt kê gồm pháp lý, y tế, tài chính cá nhân, **tín dụng**, bảo hiểm, nhà ở, **tuyển dụng và quản lý nhân sự**, **tuyển sinh và chấm thi** quyết định đầu vào hay văn bằng, tiếp cận dịch vụ y tế, phúc lợi công, và các quyết định về tình trạng pháp lý.

Khi dùng Claude để đưa ra khuyến nghị trong các lĩnh vực đó, có hai yêu cầu bắt buộc:

- **Có người đủ chuyên môn trong vòng duyệt** (*qualified human-in-the-loop*): một người có đào tạo hoặc kinh nghiệm trong lĩnh vực, có quyền sửa khuyến nghị, phải xem xét thực chất trước khi khuyến nghị tới tay người nhận hay được dùng để ra quyết định. Người đó chịu trách nhiệm về kết quả.
- **Công khai** (*disclosure*): người nhận lời khuyên, hoặc người bị quyết định ảnh hưởng, phải được nói rõ là có dùng AI.

Dùng Claude để ra hay gợi ý quyết định trong hoạt động thực thi pháp luật hay tư pháp hình sự thì bị cấm hẳn.

## Tách quyết định khỏi việc viết

Một cách nghĩ hữu ích: trong nhiều quy trình, **quyết định** và **văn bản báo quyết định** là hai việc khác nhau. Claude có thể giúp viết thư rõ ràng, tử tế; còn quyết định thì người giữ.

Một câu luyện thi: phòng tuyển sinh muốn Claude xét tiêu chí tuyển sinh rồi soạn luôn thư báo cho phụ huynh xem con có được nhận vào trường đang quá tải không. Việc **đầu tiên** là **tách việc quyết định ai được nhận khỏi việc viết thư, và để nhân viên giữ quyết định**. Nhờ Claude nhắc lại tiêu chí, chạy thử một trường xem phụ huynh có phàn nàn không, hay dặn Claude "áp tiêu chí đúng từng chữ" đều không giải quyết chuyện ai chịu trách nhiệm.

## Hành động khó đảo ngược

Việc 4 trong ví dụ, để Claude tự gửi email và tự sửa dữ liệu thật mà không ai duyệt, có rủi ro chính là **bỏ mất sự giám sát của con người với những hành động khó đảo ngược**: sai thì đã gây hại trước khi có ai kịp can thiệp. Rủi ro này không mất đi vì dùng API thay vì app chat, hay vì dùng công cụ của Anthropic thay vì của bên thứ ba. Usage Policy cũng có phần hướng dẫn riêng cho việc dùng agent.

Đó cũng là lý do connector Gmail và Drive mặc định hỏi bạn duyệt trước mỗi lần gửi email hay chia sẻ, xoá file.

## Đánh giá một cách dùng mới

Trước khi duyệt cho nhóm dùng Claude vào một việc mới, thứ tự đánh giá hợp lý:

1. 
  - **Xét người đọc, tác động của quyết định, có đảo ngược được không**
2. rồi xét
  - **Loại dữ liệu dùng tới, có dữ liệu nhạy cảm không**
3. rồi đối chiếu
  - **Chính sách của tổ chức và quy định pháp luật liên quan**
4. rồi quyết
  - **Cho làm, cho làm khi sửa lại, hoặc từ chối**
5. rồi ghi lại
  - **Kết quả đánh giá và lý do, để truy lại được**

> Trong đề chọn gì
>
> Đề hỏi thứ tự đánh giá một cách dùng Claude trước khi duyệt: chọn **tác động và khả năng đảo ngược → loại dữ liệu → đối chiếu chính sách, quy định → quyết → ghi lại**. Đề hỏi một quyết định cuối về con người (tuyển dụng, tín dụng, tuyển sinh) có giao hẳn cho AI được không: chọn **không**, vì cần phán đoán và trách nhiệm của con người, không phải chỉ vì hệ thống có thể chưa ổn định.

1. Quyết định ảnh hưởng tới quyền lợi của một người cụ thể?Người đủ chuyên môn giữ quyết định, báo cho người đó có dùng AI
2. Hành động khó đảo ngược (gửi đi, sửa dữ liệu thật)?Có người duyệt trước mỗi hành động
3. Thuộc thực thi pháp luật, tư pháp hình sự?Không dùng
4. Còn lạiSoạn nháp, tóm tắt, tổng hợp có người duyệt: hợp để dùng Claude

> Ý chính
>
> Claude hợp với soạn nháp, tóm tắt, tổng hợp có người duyệt. Quyết định ảnh hưởng tới quyền lợi của một người thì người đủ chuyên môn giữ, và người bị ảnh hưởng phải được biết có dùng AI.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 6(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Usage Policy (Anthropic)(mở tab mới)](https://www.anthropic.com/legal/aup)
3. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
4. [Claude is providing incorrect or misleading responses (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)
5. [Use Google Workspace connectors (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
