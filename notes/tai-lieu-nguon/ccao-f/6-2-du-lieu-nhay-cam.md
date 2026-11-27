---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/6-2-du-lieu-nhay-cam
ngay_tai: 2026-11-27
tieu_de: Dữ liệu nhạy cảm, quy định và quyền riêng tư khi dùng Claude
---

Domain 6 : Governance, Risk, and Responsible Use·Task 6.2

# Dữ liệu nhạy cảm, quy định và quyền riêng tư khi dùng Claude

Dữ liệu nào cần che trước khi đưa vào Claude, xử lý theo thứ tự nào, Incognito và Memory giúp tới đâu, và dữ liệu được dùng ra sao theo gói.

- 8 phút đọc
- Đối chiếu docs 07/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Nhận ra dữ liệu cần che hoặc ẩn danh trước khi đưa vào prompt
- Xử lý tài liệu có dữ liệu nhạy cảm theo đúng thứ tự, chỉ giữ phần cần cho việc
- Hiểu Incognito, tắt Memory và môi trường code execution không thay được chính sách dữ liệu
- Biết dữ liệu được dùng ra sao trên gói cá nhân và gói doanh nghiệp

Mỗi lần dán một file vào Claude là một lần dữ liệu rời khỏi máy bạn. Phần lớn dữ liệu công việc không có gì đáng lo, nhưng số định danh, số thẻ, hồ sơ sức khoẻ, bảng lương thì khác: chính sách của tổ chức và pháp luật đều có quy định riêng cho chúng.

Bài này giúp bạn trả lời: dữ liệu nào cần xử lý trước khi đưa vào Claude, xử lý theo thứ tự nào, và các cài đặt riêng tư của Claude giúp được tới đâu?

## Ví dụ xuyên suốt: hồ sơ bồi thường bảo hiểm xe

Chị Uyên làm ở phòng bồi thường của một công ty bảo hiểm xe. Chị muốn nhờ Claude tóm tắt 50 hồ sơ khiếu nại để tìm các lỗi xử lý lặp lại. Mỗi hồ sơ có: họ tên khách, số căn cước, địa chỉ nhà, số tài khoản ngân hàng nhận tiền, biển số xe, mô tả sự cố và ghi chú của giám định viên. Chính sách công ty cấm đưa dữ liệu cá nhân thuộc diện được pháp luật bảo vệ vào công cụ AI khi chưa ẩn danh.

## Dữ liệu nào cần che

Trang hỗ trợ của Claude khuyên cân nhắc kỹ trước khi đưa vào chat những thông tin rất nhạy cảm như: thông tin tài chính (số định danh, số thẻ, số tài khoản), hồ sơ sức khoẻ, mật khẩu, tài liệu mật của doanh nghiệp hay cá nhân.

| Cần che hoặc ẩn danh | Thường không cần |
|---|---|
| Số định danh nhà nước, số thẻ thanh toán gắn với người cụ thể | Chức danh trên sơ đồ tổ chức công khai |
| Lương, khung lương kèm tên người | Mô tả sản phẩm trên website công ty |
| Ghi chú hồ sơ nhân sự (như đơn xin điều chỉnh công việc vì lý do sức khoẻ) | Thông cáo báo chí đã đăng |
| Địa chỉ nhà, mã nhân viên kèm ngày vào làm | Mô tả công việc đã bỏ thông tin riêng |

Câu hỏi mẫu thứ ba trong tài liệu chính thức của đề thi: một quản lý dự án muốn tải bảng tính có tên và số tài khoản của khách lên để Claude phân tích xu hướng, trong khi chính sách hạn chế chia sẻ dữ liệu cá nhân được bảo vệ. Đáp án: **bỏ hoặc ẩn danh các thông tin định danh trước khi tải lên, đúng theo chính sách**. Đáp án sai: tải nguyên vì chỉ phân tích nội bộ; tải lên rồi dặn Claude đừng lưu (dặn như vậy không thoả được yêu cầu của chính sách); bỏ hẳn việc phân tích (không cần, vì ẩn danh xong vẫn làm được).

## Xử lý theo thứ tự, chỉ giữ phần cần

Với một tài liệu lẫn dữ liệu nhạy cảm, việc **đầu tiên** là **phân loại nội dung và chỉ ra trường nào nhạy cảm**. Chưa biết trường nào nhạy cảm thì chưa che được, càng chưa gửi được.

Khi dữ liệu đến từ người khác (như câu trả lời khảo sát có tên và nơi làm việc), thứ tự đầy đủ là:

1. 
  - **Kiểm sự đồng ý của người cung cấp và chính sách công ty cho phép gì**
2. rồi
  - **Bỏ các trường mà việc này không cần**
3. rồi
  - **Chạy việc, đọc lại kết quả trước khi gửi đi**
4. rồi
  - **Ghi lại đã bỏ những gì, để người đọc hiểu đúng kết quả**

Nguyên tắc chung là **chỉ đưa vào những gì việc cần**. Để tóm tắt vấn đề của khách, Claude không cần số căn cước hay địa chỉ nhà.

> Bẫy đề
>
> Câu luyện thi: tóm tắt vấn đề của khách từ hồ sơ có số định danh, địa chỉ nhà, tên, số tài khoản. Ba đáp án sai:
>
> - Thay số định danh bằng tên, thay địa chỉ bằng số tài khoản "vì ít nhạy cảm hơn". Vẫn là dữ liệu cá nhân, chỉ đổi chỗ.
> - Gửi cả hồ sơ, dặn Claude đừng nhắc tới số định danh và địa chỉ. Dữ liệu vẫn đã được gửi đi.
> - Chỉ gửi mô tả vấn đề, thêm tên khách "cho có bối cảnh". Tên không cần cho bản tóm tắt.
>
> Đáp án đúng: **bỏ hoặc che số định danh và địa chỉ nhà trước khi gửi**, vì bản tóm tắt không cần chúng.

## Cài đặt riêng tư giúp gì, không giúp gì

| Cài đặt | Giúp được | Không thay được |
|---|---|---|
| **Chat Incognito** | Không lưu vào lịch sử, không dùng và không tạo memory, không dùng để cải thiện Claude | Chính sách dữ liệu của tổ chức. Incognito vẫn được giữ 30 ngày (hoặc lâu hơn theo cài đặt lưu trữ của tổ chức), và trên gói Team, Enterprise vẫn nằm trong bản xuất dữ liệu của chủ tổ chức |
| **Tắt Memory cho một cuộc chat** | Thông tin trong chat không thành memory về sau | Việc che dữ liệu trước khi gửi |
| **Code execution trong môi trường riêng** | Code chạy cách ly với hệ thống của bạn | Việc rà và che trường nhạy cảm theo chính sách phân loại dữ liệu |

Với chuyện cần giữ kín như một con số tài chính chưa công bố, hai cài đặt đúng là **mở chat Incognito**, hoặc nếu không dùng Incognito thì **tắt Memory cho cuộc chat đó**, để con số không thành bối cảnh xuất hiện lại trong các phiên sau.

> Bẫy đề
>
> Câu luyện thi: trưởng nhóm hỏi dùng chat Incognito trên gói cá nhân thì có được dán hồ sơ khách hàng thuộc diện quy định không. Đáp án sai: Incognito tương đương không gian làm việc của công ty nên không cần duyệt; được, miễn thay tên khách bằng mã; được, vì không gì bị giữ lại sau khi chat xong. Đáp án đúng: **Incognito không bao giờ được dùng để cải thiện Claude, nhưng quy định của chính sách về dữ liệu thuộc diện quản lý vẫn áp dụng**.

## Dữ liệu được dùng ra sao theo từng gói

Trung tâm quyền riêng tư của Anthropic phân biệt hai loại gói:

- **Gói cá nhân** (Free, Pro, Max, Ultra): cuộc chat được dùng để cải thiện model nếu bạn cho phép trong cài đặt quyền riêng tư, nếu cuộc chat bị đánh dấu để rà soát an toàn, hoặc nếu bạn chủ động tham gia. Bạn đổi được cài đặt này bất cứ lúc nào.
- **Gói doanh nghiệp** (Team, Enterprise, API): mặc định không dùng dữ liệu đầu vào và đầu ra để huấn luyện model, trừ khi tổ chức chọn cho phép hoặc người dùng gửi phản hồi.

Ở cả hai loại gói, bấm nút thích hoặc không thích (thumbs up/down) để gửi phản hồi thì **toàn bộ cuộc chat liên quan** được lưu tới 5 năm. Vì vậy, chủ gói Team và Enterprise lo nội dung chat ra khỏi tổ chức có thể **tắt tính năng đánh giá câu trả lời cho cả tổ chức**.

Trên gói doanh nghiệp, chủ tổ chức (Primary Owner) quản lý tài khoản và dữ liệu của bạn, kể cả quyền xuất dữ liệu gồm các cuộc chat. Dữ liệu công việc nên ở trong tài khoản công ty được duyệt, không ở tài khoản cá nhân.

## Project dùng chung

Một lỗi dễ mắc: tải nguyên một thư mục của nhóm vào knowledge của một Project chia sẻ cho cả tổ chức, trong thư mục có bảng lương từng người. Rủi ro không phải là Project chạy chậm hay Claude từ chối trả lời, mà là **bất kỳ ai mở Project đều có thể hỏi ra thông tin lương** bằng những câu hỏi bình thường. Tài liệu trong knowledge của Project công khai thì mọi thành viên tổ chức đều dùng được.

> Trong đề chọn gì
>
> Gặp câu về dữ liệu nhạy cảm, chọn đáp án **xử lý dữ liệu trước khi gửi** (phân loại, bỏ hoặc che phần không cần, đối chiếu chính sách). Loại các đáp án dựa vào lời dặn Claude, vào Incognito, vào môi trường cách ly, hay vào việc "chỉ dùng nội bộ" để bỏ qua chính sách.

> Ý chính
>
> Phân loại trước, chỉ gửi những gì việc cần, che phần còn lại theo chính sách. Incognito, tắt Memory hay môi trường cách ly là lớp bảo vệ thêm, không thay được việc xử lý dữ liệu trước khi gửi.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 6 và câu hỏi mẫu 3(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [I would like to input sensitive data into my chats with Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8325621-i-would-like-to-input-sensitive-data-into-my-chats-with-claude-who-can-view-my-conversations)
3. [Use incognito chats (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12260368-use-incognito-chats)
4. [Is my data used for model training? Consumer (Anthropic Privacy Center)(mở tab mới)](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
5. [Is my data used for model training? Commercial (Anthropic Privacy Center)(mở tab mới)](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)
6. [Manage user feedback settings on Team and Enterprise plans (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/10504844-manage-user-feedback-settings-on-team-and-enterprise-plans)
7. [Manage project visibility and sharing (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/9519189-manage-project-visibility-and-sharing)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
