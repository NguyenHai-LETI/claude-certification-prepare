---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/5-4-tuan-thu-quy-dinh
ngay_tai: 2026-11-27
tieu_de: Bảo đảm tuân thủ quy định như GDPR, HIPAA, FedRAMP
---

Domain 5: Governance, Safety & Risk Management · Task 5.4

# Bảo đảm tuân thủ quy định như GDPR, HIPAA, FedRAMP

Xác định quy định áp dụng, ai xử lý dữ liệu, dữ liệu giữ bao lâu, ZDR khác HIPAA readiness ra sao, DPA cho GDPR, và kiểm soát nào phải nằm ở ứng dụng.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Xác định quy định áp dụng và kiểm kê công cụ tuân thủ có sẵn trước khi so điều khoản
- Biết ai là bên xử lý dữ liệu tuỳ cách triển khai Claude
- Phân biệt chính sách lưu dữ liệu mặc định, Zero Data Retention và HIPAA readiness
- Nêu các thành phần của một tư thế GDPR đầy đủ, và cách tra FedRAMP
- Nhận ra kiểm soát tuân thủ nào phải nằm ở tầng ứng dụng

Tuân thủ không phải là một công tắc bật trong cấu hình. Nó là chuỗi câu hỏi: quy định nào áp dụng cho dữ liệu này, ai đang xử lý nó, nó được giữ ở đâu và bao lâu, hợp đồng nào ràng buộc các bên, và những kiểm soát nào ứng dụng của bạn phải tự làm.

Bài này giúp bạn trả lời: đưa Claude vào một hệ thống chịu quy định như GDPR, HIPAA hay FedRAMP thì phải kiểm gì?

## Ví dụ xuyên suốt: công ty phần mềm y tế

Một công ty phần mềm làm trợ lý ghi chép khám bệnh, tóm tắt cuộc khám thành hồ sơ. Khách hàng gồm phòng khám ở Mỹ (dữ liệu sức khoẻ, chịu HIPAA), phòng khám ở châu Âu (dữ liệu cá nhân, chịu GDPR), và công ty đang chuẩn bị dự thầu cho một cơ quan liên bang Mỹ (thường đòi FedRAMP).

## Xác định trước khi đối chiếu

1. **Quy định nào thật sự áp dụng, xét theo loại dữ liệu, khu vực pháp lý và đối tượng người dùng?** → Xác định phạm vi áp dụng
2. **Nhà cung cấp đang có những công cụ và cam kết tuân thủ nào, và cái nào đã bật?** → Kiểm kê công cụ tuân thủ của nhà cung cấp
3. **Kiểm soát hiện có so với yêu cầu thiếu ở đâu?** → So kiểm soát với điều khoản, tìm khoảng trống
- **Còn lại** → Lên kế hoạch khắc phục theo mức ưu tiên, ghi lại khoảng trống và rủi ro còn lại

> **Trong đề chọn gì**
>
> Đề hỏi hai việc phải xong trước khi đối chiếu luồng dữ liệu với điều khoản của một quy định. Chọn **xác định quy định có áp dụng không theo loại dữ liệu, khu vực pháp lý, đối tượng**, và **kiểm kê công cụ tuân thủ nhà cung cấp cung cấp, xác nhận cái nào đã bật**. So kiểm soát với yêu cầu, lên lịch khắc phục, ghi lại khoảng trống đều đến sau.

## Ai xử lý dữ liệu, giữ bao lâu

Câu hỏi đầu tiên với mọi quy định bảo vệ dữ liệu: ai xử lý prompt và câu trả lời? Docs của Anthropic về lưu dữ liệu nói khi dùng Claude qua Amazon Bedrock hay Google Cloud (bản do Google quản lý), **nhà cung cấp cloud** là bên xử lý dữ liệu, và bạn tra chính sách, chứng nhận của họ. Khi dùng Claude API trực tiếp (hay các bản do Anthropic vận hành trên AWS, Google Cloud), chính sách của Anthropic áp dụng.

**Sơ đồ**
1. **Prompt và câu trả lời đi qua đâu?**
   ↓ _tuỳ cách dùng Claude_
2. **Claude API trực tiếp, hoặc bản do Anthropic vận hành**: chính sách của Anthropic áp dụng **|** **Amazon Bedrock, Google Cloud bản do Google quản lý**: nhà cung cấp cloud là bên xử lý

### Dữ liệu được giữ bao lâu

| Chế độ | Nghĩa là |
| --- | --- |
| Mặc định của API | Anthropic xoá đầu vào và đầu ra trong vòng 30 ngày, trừ dịch vụ bạn chọn lưu lâu hơn (như Files API), thoả thuận khác, hay khi bị gắn cờ vi phạm chính sách (giữ tới 2 năm). Dữ liệu từ sản phẩm thương mại mặc định **không** dùng để huấn luyện model |
| **Zero Data Retention** (ZDR) | Anthropic không lưu prompt và câu trả lời sau khi trả kết quả. Phải xin qua đội sales, bật cho từng organization |
| **HIPAA readiness** | Một organization đã ký thoả thuận BAA và bật cấu hình HIPAA, được dùng các tính năng đủ điều kiện để xử lý dữ liệu sức khoẻ (PHI) |

Những điểm hay nhầm về ZDR, theo docs:

- ZDR **không chặn** tính năng không đủ điều kiện; nó chỉ không áp cho chúng. Những thứ như Console, Batch (giữ 29 ngày), Files API, MCP connector, code execution, Claude Managed Agents đều nằm ngoài ZDR.
- Một số model (docs gọi là Covered Models, như Fable 5.1) cần lưu dữ liệu 30 ngày; tổ chức có ZDR muốn dùng thì bật lưu 30 ngày cho riêng một workspace.

## HIPAA

Theo docs, HIPAA readiness gồm:

- Ký **BAA** (Business Associate Agreement) và bật cấu hình HIPAA cho organization. Với Claude API, bật ở trang Data retention trong Console; khi đã bật thì **vĩnh viễn**, quản trị viên không tắt được. Với Claude Enterprise, chủ sở hữu chính của tổ chức phải tự bật; gói Enterprise tiêu chuẩn không tự có BAA.
- BAA chỉ phủ **đúng organization đã ký**. Nên tách organization cho việc có PHI và việc không có PHI.
- Khác ZDR, HIPAA readiness **chặn** tính năng không đủ điều kiện: gọi tới sẽ bị lỗi 400. Theo trang BAA, các thứ như Batch API, Files API, code execution, web fetch không được phủ.
- Không đưa PHI vào định nghĩa JSON schema; không dùng Console để xử lý PHI; Claude Platform on AWS chưa có HIPAA readiness.

Docs nói bản BAA đã ký là nguồn chính thức về tính năng nào được phủ.

Chỗ khác nhau dễ nhầm nhất giữa hai chế độ:

**Sơ đồ**
1. **Zero Data Retention**: không lưu prompt và câu trả lời **|** **HIPAA readiness**: BAA cộng cấu hình HIPAA
   ↓ _gọi tới tính năng không đủ điều kiện, như Batch API_
2. **Vẫn chạy được, chỉ là ZDR không áp cho nó** **|** **Bị chặn, lỗi 400**

> **Bẫy đề**
>
> Câu luyện thi chấm đúng phương án "Claude Enterprise với BAA đã ký, bật Zero Data Retention, cấu hình audit log" cho một triển khai HIPAA. Theo docs hiện tại, HIPAA readiness dựa trên BAA và cấu hình HIPAA của organization, còn ZDR là một thoả thuận riêng chứ không phải điều kiện bắt buộc. Trong đề, phương án đó đúng vì các phương án còn lại sai rõ: dùng Claude Free, tắt hết audit log "để không lưu PHI", hay để bác sĩ dùng tài khoản cá nhân.

> **Trong đề chọn gì**
>
> Câu luyện thi: hai thiết kế cho pipeline xử lý hồ sơ bệnh nhân theo HIPAA. Chọn **kiểm soát truy cập theo vai trò để chỉ người được phép mới truy xuất PHI**, và **không bao giờ đưa dữ liệu bệnh nhân vào vòng phản hồi gửi nhà cung cấp khi chưa có BAA**. Loại các lựa chọn về hiệu năng: hạ `max_tokens`, chọn model mạnh nhất, bật streaming.

## GDPR và FedRAMP

Các thành phần chính theo tài liệu của Anthropic:

- **DPA** (Data Processing Addendum): là một phần của điều khoản thương mại; khách hàng là bên kiểm soát (controller), Anthropic là bên xử lý (processor). Có điều khoản hợp đồng mẫu (SCC) cho việc chuyển dữ liệu ra khỏi EU, cam kết báo sự cố an ninh trong 48 giờ, và xoá dữ liệu trong 30 ngày sau khi chấm dứt.
- **Nơi xử lý và lưu dữ liệu**: theo trang hỏi đáp về máy chủ, mặc định lưu lượng có thể được định tuyến tới Mỹ, châu Âu, châu Á, Úc, còn dữ liệu được lưu ở Mỹ. Docs về data residency có tham số `inference_geo` để chỉ chạy suy luận ở Mỹ (`us`, giá 1,1 lần) hoặc toàn cầu (`global`).
- **Tối thiểu hoá dữ liệu** trong ứng dụng: che dữ liệu cá nhân không cần cho việc trước khi gửi, đặt chính sách lưu giữ, và có quy trình xử lý quyền của chủ thể dữ liệu (truy cập, xoá).

> **Trong đề chọn gì**
>
> Câu luyện thi về triển khai có nghĩa vụ GDPR: đáp án đúng gồm **đủ cả bốn**: gói doanh nghiệp có DPA đã ký, cấu hình lưu giữ dữ liệu rõ ràng, che dữ liệu cá nhân không cần cho việc, và quy trình xử lý quyền chủ thể dữ liệu. Các đáp án sai: tắt hết cấu hình lưu giữ và che dữ liệu; dùng tài khoản cá nhân xử lý dữ liệu EU quy mô lớn; dán toàn bộ dữ liệu cá nhân vào mọi prompt "cho Claude đủ ngữ cảnh".

### FedRAMP

FedRAMP là chương trình cấp phép an ninh cho dịch vụ cloud dùng trong cơ quan liên bang Mỹ. Trang chứng nhận của Anthropic (kiểm ngày 02/11/2026) liệt kê cấu hình sẵn sàng HIPAA (có BAA), ISO 27001:2022, ISO/IEC 42001:2023 và SOC 2 Type I, Type II; **không** liệt kê FedRAMP. Với dự thầu cơ quan liên bang, kiểm mức FedRAMP của chính môi trường cloud nơi bạn chạy Claude, vì ở Bedrock hay Google Cloud, nhà cung cấp cloud là bên xử lý dữ liệu.

## Kiểm soát nào phải nằm ở ứng dụng

Nhà cung cấp lo phần của họ; nhiều kiểm soát vẫn là việc của ứng dụng: ai được dùng tính năng nào, ghi audit log, kiểm quyền truy cập dữ liệu.

> **Bẫy đề**
>
> Câu luyện thi: bộ phận tuân thủ đã duyệt một Claude Skill tạo bản tóm tắt đầu tư cho khách, Skill đã có câu miễn trừ và danh sách từ cấm. Hai kiểm soát vẫn phải nằm ở tầng ứng dụng: **kiểm người yêu cầu có quyền tạo bản tóm tắt này không**, và **ghi mọi bản tóm tắt vào audit trail tuân thủ**. Định dạng theo văn phong, áp mẫu miễn trừ, áp danh sách từ cấm thì Skill đã làm.

**Sơ đồ**
1. **Bản tóm tắt đầu tư cho khách**
   ↓ _ai lo phần nào_
2. **Skill đã duyệt**: văn phong, mẫu miễn trừ, danh sách từ cấm **|** **Tầng ứng dụng**: kiểm người yêu cầu có quyền, ghi audit trail

> **Ý chính**
>
> Xác định quy định áp dụng và ai xử lý dữ liệu trước. ZDR là không lưu dữ liệu, không chặn tính năng; HIPAA readiness là BAA cộng cấu hình, có chặn tính năng không đủ điều kiện. Kiểm quyền và audit log luôn là việc của ứng dụng.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [API and data retention (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
3. [How long do you store my organization's data? (Anthropic Privacy Center)](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)
4. [Business Associate Agreements for commercial customers (Anthropic Privacy Center)](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers)
5. [What certifications has Anthropic obtained? (Anthropic Privacy Center)](https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained)
6. [Data Processing Addendum (Anthropic)](https://www.anthropic.com/legal/data-processing-addendum)
7. [Data residency (Claude Docs)](https://platform.claude.com/docs/en/manage-claude/data-residency)
