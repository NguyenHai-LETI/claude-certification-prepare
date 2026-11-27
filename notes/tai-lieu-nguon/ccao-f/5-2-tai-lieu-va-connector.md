---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/5-2-tai-lieu-va-connector
ngay_tai: 2026-11-27
tieu_de: Quản lý tài liệu tải lên và connector
---

Domain 5 : Configuration and Knowledge Management·Task 5.2

# Quản lý tài liệu tải lên và connector

Khi nào tải tài liệu lên, khi nào nối connector như Google Drive hay Gmail, cần kiểm gì trước khi nối, và giữ cho connector không chiếm chỗ vô ích.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Chọn giữa tải file lên và nối connector theo việc tài liệu có hay đổi không
- Biết giới hạn khi tải file vào chat và vào Project
- Kiểm đúng hai việc trước khi cho phép một connector mới
- Nhận ra cách nối connector an toàn và không an toàn
- Quản lý số connector đang bật để không lãng phí context

Có hai cách đưa tài liệu của bạn tới Claude: tải file lên, hoặc nối Claude với nơi tài liệu đang nằm (Google Drive, Gmail…) qua connector. Chọn sai cách thì hoặc Claude dùng bản cũ, hoặc bạn mở cho Claude truy cập nhiều hơn mức cần.

Bài này giúp bạn trả lời: khi nào tải lên, khi nào nối connector, và nối thế nào cho an toàn?

## Ví dụ xuyên suốt: phòng chính sách của công ty bảo hiểm nhân thọ

Phòng chính sách của một công ty bảo hiểm nhân thọ dùng Claude để trả lời câu hỏi của đại lý. Họ có:

- **Sổ tay đại lý** trên Google Drive, cập nhật gần như mỗi tuần (điều kiện hồ sơ, mẫu đơn mới).
- **Báo cáo thường niên** năm nay, đã chốt, không đổi nữa.
- Hộp thư chung nhận câu hỏi của đại lý.
- Một đồng nghiệp đề xuất nối thêm hệ thống hồ sơ nhân sự và hệ thống tính lương "cho tiện".

## Tải lên hay nối connector

Câu hỏi quyết định là: **tài liệu có hay thay đổi không?**

| Tài liệu | Cách đưa vào | Vì sao |
|---|---|---|
| Sổ tay đổi hằng tuần trên Drive | **Nối Google Drive** | Tài liệu Google Docs thêm qua Drive được đồng bộ từ Drive, nên luôn là bản mới nhất |
| Báo cáo thường niên đã chốt | **Tải vào Project knowledge** | Không đổi nữa, tải một lần là đủ |

Dán cả cuốn sổ tay vào mỗi cuộc chat mới thì tốn công và dễ dán nhầm bản; tải sổ tay lên một lần rồi dùng cả năm thì Claude sẽ trả lời theo quy định cũ. Còn "nối connector tới báo cáo năm rồi xoá nó khỏi Drive" chẳng giải quyết gì.

> Trong đề chọn gì
>
> Đề hỏi cách đưa vào Project một sổ tay đổi hằng tuần trên Drive và một báo cáo năm không đổi: chọn **nối thư mục Drive cho sổ tay** và **tải báo cáo năm vào Project knowledge**.

Một chi tiết của trang hỗ trợ về Google Workspace: thêm file Drive vào mục Files của Project chỉ làm được với **Project riêng tư**; với Project đã chia sẻ, tuỳ chọn này bị tắt.

## Giới hạn khi tải file

|  | Tải vào cuộc chat | Tải vào Project |
|---|---|---|
| Cỡ file | Tối đa 500MB mỗi file | Tối đa 30MB mỗi file |
| Số file | Tối đa 20 file mỗi cuộc chat | Không giới hạn, nhưng nội dung phải vừa context (trên gói trả phí có RAG mở rộng tới 10 lần) |

Định dạng tài liệu đọc được gồm PDF, DOCX, CSV, TXT, HTML, JSON, XLSX (XLSX cần bật code execution) và một số định dạng khác. Với PDF tới 100 trang, Claude đọc cả chữ lẫn hình, biểu đồ; từ 101 tới 1.000 trang thì chỉ đọc chữ. Với file Word và các file không phải PDF, Claude chỉ đọc phần chữ.

Khi Project dùng RAG, Claude tìm trong knowledge bằng một công cụ tìm kiếm thay vì nạp hết. Trang hỗ trợ khuyên **đặt tên file rõ ràng**, nhóm tài liệu liên quan trong cùng Project, và **gọi đúng tên tài liệu** khi hỏi để Claude tìm trúng.

## Connector: kiểm trước khi nối

Connector cho Claude truy cập ứng dụng của bạn, lấy dữ liệu và thực hiện thao tác trong đó. Claude **thừa hưởng quyền của chính bạn** ở dịch vụ đó: bạn không mở được file nào thì Claude qua connector cũng không mở được. Trên gói Team và Enterprise, chủ tổ chức phải bật connector ở cấp tổ chức trước. Với Gmail và Drive, mặc định Claude hỏi bạn duyệt trước mỗi lần gửi, trả lời, chuyển tiếp email hay chia sẻ, di chuyển, xoá file.

Trước khi cho phép một connector mới, hai việc phải xong:

1. **Xác nhận connector có trong danh sách được phép** của tổ chức (danh sách nhà cung cấp được bộ phận IT duyệt).
2. **Xác nhận mức phân loại dữ liệu của nguồn**, và nhóm bạn có được phép dùng dữ liệu đó không.

Đào tạo cả nhóm, gỡ connector cũ, hay chuyển báo cáo sang nguồn mới đều là việc sau. Với connector cho một nguồn dữ liệu nhiều người dùng chung cũng vậy: kiểm phê duyệt và phân loại dữ liệu trước, rồi mới nối, kiểm đăng nhập, ghi tài liệu hướng dẫn và thử.

> Bẫy đề
>
> Câu luyện thi hỏi hai cách nối connector an toàn. Đáp án đúng: **nối vào không gian quản lý dự án của nhóm trong phạm vi được duyệt**, và **nối chỉ đọc vào kho kiến thức công khai**. Ba đáp án sai đều mở quá mức cần: nối vào tài khoản lưu trữ cá nhân có lẫn file riêng; nối vào hệ thống tính lương để nộp chi phí; nối vào hệ thống hồ sơ nhân sự để xếp lịch. Trong ví dụ, đề xuất nối hồ sơ nhân sự và hệ thống lương "cho tiện" thuộc đúng loại này.

## Đừng bật connector không dùng tới

Trang hỗ trợ về quản lý công cụ nói mỗi connector chiếm một phần chỗ trong cuộc chat; càng nhiều connector, càng ít chỗ cho tài liệu và lịch sử chat. App có ba chế độ cho từng cuộc chat:

| Chế độ | Cách nạp | Hợp khi |
|---|---|---|
| **Auto** (mặc định) | Claude tự chọn connector cần nạp | Phần lớn người dùng |
| **Always available** | Nạp hết connector ngay từ đầu | Dưới 10 connector, dùng thường xuyên |
| **On demand** | Chỉ nạp khi Claude tìm ra connector cần cho yêu cầu | Từ 10 connector trở lên, hoặc chat hay chạm giới hạn độ dài |

Với việc đơn giản như soạn một bài viết, nếu đang bật nhiều connector và công cụ không cần, **tắt chúng cho việc này, khi cần thì bật lại**. Nhắc Claude "đừng dùng connector" trong mỗi tin nhắn không giải phóng chỗ; xoá hẳn connector khỏi tài khoản thì quá tay.

1. Tài liệu thay đổi thường xuyên, nằm ở Drive hay công cụ khác?Nối connector để luôn có bản mới
2. Tài liệu cố định, dùng qua nhiều cuộc chat?Tải vào Project knowledge
3. Chỉ cần cho một cuộc chat?Tải thẳng vào cuộc chat
4. Định nối connector mới?Kiểm danh sách được phép và phân loại dữ liệu trước
5. Còn lạiConnector đang bật mà việc này không cần: tắt, khi cần bật lại

> Ý chính
>
> Tài liệu hay đổi thì nối connector, tài liệu cố định thì tải lên. Trước khi nối, kiểm connector được phép và dữ liệu được dùng; chỉ nối trong phạm vi cần, và tắt những gì việc hiện tại không cần.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 5(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Upload files to Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8241126-upload-files-to-claude)
3. [Use connectors to extend Claude's capabilities (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)
4. [Use Google Workspace connectors (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors)
5. [Manage Claude's tool access (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/13730515-manage-claude-s-tool-access)
6. [Retrieval augmented generation (RAG) for projects (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
