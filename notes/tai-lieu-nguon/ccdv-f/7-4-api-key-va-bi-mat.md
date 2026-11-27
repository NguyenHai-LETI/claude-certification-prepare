---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/7-4-api-key-va-bi-mat
ngay_tai: 2026-11-27
tieu_de: Định danh, khoá API và bí mật - loại khoá, lưu trữ, xoay vòng, xử lý khi lộ
---

Domain 7: Security and Safety · Task 7.4

# Định danh, khoá API và bí mật - loại khoá, lưu trữ, xoay vòng, xử lý khi lộ

Chọn loại khoá API theo danh tính nó mang, đọc lỗi 401 và 403, lưu khoá ngoài source code, mỗi môi trường một khoá, đặt hạn, xoay vòng, và xử lý khi khoá bị lộ.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Chọn giữa khoá cá nhân, khoá service account, khoá workspace cũ và Workload Identity Federation theo danh tính mỗi loại mang
- Phân biệt lỗi xác thực 401 với lỗi quyền 403, và biết khi nào phải gửi header workspace
- Lưu khoá trong secrets manager, nạp lúc chạy, tách khoá theo môi trường, đặt hạn và xoay vòng
- Xử lý khi nghi khoá bị lộ - tắt, thay, và theo dõi mức dùng theo khoá

Khoá API của Claude là một chuỗi bắt đầu bằng `sk-ant-`, và ai cầm nó là gọi được API bằng tiền của bạn. Phần lớn sự cố về khoá không đến từ tấn công tinh vi, mà từ những thói quen như dán khoá vào file cấu hình rồi commit, hay dùng chung một khoá cho mọi môi trường.

Bài này giúp bạn trả lời: dùng loại khoá nào, lưu ở đâu, xoay vòng ra sao, và làm gì khi khoá bị lộ?

## Ví dụ xuyên suốt: phần mềm chấm công của công ty SaaS

Một công ty SaaS làm phần mềm chấm công cho nhà máy, dùng Claude để tóm tắt bảng công và trả lời câu hỏi của bộ phận nhân sự. Hệ thống có ba môi trường (dev, staging, production) và một pipeline GitHub Actions chạy test tích hợp Claude.

Hiện trạng: một khoá duy nhất do trưởng nhóm tạo, dùng ở cả ba môi trường và trong CI, nằm trong file `.env` và từng bị commit nhầm lên repo một lần. Khi trưởng nhóm nghỉ việc và bị xoá khỏi tổ chức, mọi thứ ngừng chạy.

## Loại khoá và danh tính nó mang

Đề thi gọi nhóm kiến thức này là định danh và xác thực (**identity validation and authentication**). Docs xác thực của Claude API nêu các cách:

| Cách | Mang danh tính của | Ngừng hoạt động khi | Hợp với |
| --- | --- | --- | --- |
| Khoá cá nhân (personal key) | Bạn, với vai trò và quyền của bạn | Bạn mất quyền truy cập tổ chức | Phát triển, script của riêng bạn |
| Khoá service account | Một service account | Service account bị lưu trữ | Việc dùng chung hay tự động: CI, dịch vụ production |
| Khoá workspace (cũ) | Không ai, thuộc về workspace | Hết hạn, bị tắt, xoá, hoặc workspace bị lưu trữ | Còn chạy nhưng nên thay |
| Workload Identity Federation (WIF) | Workload của bạn, qua nhà cung cấp định danh | Token ngắn hạn tự hết hạn | Production trên cloud, CI/CD, Kubernetes, muốn bỏ hẳn bí mật tĩnh |

Ngoài ra còn khoá Admin API (tiền tố `sk-ant-admin01-` trên Claude Console), chỉ thành viên có vai trò admin tạo được, dùng cho các API quản trị như Admin API và API báo cáo mức dùng. Docs nói khoá cá nhân dùng chung sẽ hỏng khi người đó rời đi; việc dùng chung hay chạy tự động nên có service account riêng. Đó đúng là sự cố trong ví dụ.

Với GitHub Actions, WIF cho mỗi lần chạy workflow đổi token định danh do GitHub ký lấy một token truy cập ngắn hạn của Anthropic, nên CI không cần lưu khoá nào. Docs lưu ý WIF không tự bảo đảm an toàn đầu cuối: chuỗi tin cậy chỉ mạnh bằng cấu hình nhà cung cấp định danh của bạn.

**Sơ đồ**
1. **Workflow GitHub Actions chạy**
   ↓ _GitHub ký một token định danh_
2. **Đổi token đó lấy token truy cập ngắn hạn của Anthropic**
   ↓ _gọi Claude API_
3. **Test tích hợp chạy, CI không lưu khoá nào**

## Đọc lỗi: 401 hay 403, và header workspace

| Lỗi | Nghĩa | Sửa |
| --- | --- | --- |
| `401 authentication_error` | Khoá sai định dạng, bị thu hồi, hoặc hết hạn | Kiểm khoá; khoá hết hạn không bật lại được, phải tạo khoá mới |
| `403 permission_error` | Khoá hợp lệ nhưng không có quyền với tài nguyên đó | Kiểm quyền của tổ chức và cấu hình workspace trong Console |

Khoá tạo cho một workspace chỉ dùng được trong workspace đó. Khoá không gắn workspace thì mỗi yêu cầu phải gửi header `anthropic-workspace-id`. Admin API chỉ nhận khoá cá nhân hay service account khi khoá đó không gắn với một workspace.

## Lưu, tách, đặt hạn, xoay vòng

Docs xác thực nói thẳng: lưu khoá trong secrets manager, xoay vòng định kỳ, tắt hoặc xoá ngay khoá nghi bị lộ. Cụ thể:

- **Không để trong source code.** Lưu trong secrets manager hoặc cấu hình riêng của môi trường không commit, nạp lúc chạy. SDK tự đọc biến môi trường `ANTHROPIC_API_KEY`.
- **Mỗi môi trường một khoá.** Dev là nơi kiểm soát lỏng nhất nên dễ lộ nhất; dùng chung khoá thì sự cố ở dev kéo theo production. Khoá riêng còn giúp tách mức dùng và chi phí theo môi trường.
- **Đặt hạn.** Khi tạo khoá trong Console, chọn hạn 3 giờ, 1 ngày, 7 ngày, 30 ngày, tuỳ chỉnh, hoặc "Never" cho khoá lưu trong secrets manager mà bạn tự xoay vòng. Anthropic gửi email nhắc trước khi hết hạn với khoá đủ dài. Admin API trả `expires_at` của từng khoá để bạn rà soát.
- **Xoay vòng không gián đoạn**: tạo khoá mới, triển khai vào nơi ứng dụng đọc khoá, kiểm yêu cầu chạy được, rồi mới xoá khoá cũ.

**Sơ đồ**
1. **Tạo khoá mới**: khoá cũ vẫn chạy
   ↓ _triển khai vào nơi ứng dụng đọc khoá_
2. **Ứng dụng chuyển sang khoá mới**
   ↓ _kiểm yêu cầu chạy được_
3. **Lúc này mới xoá khoá cũ**

Docs nhấn mạnh: hạn dùng giới hạn tuổi thọ của khoá bị lộ, nhưng không thay được việc giữ bí mật cẩn thận.

> **Bẫy đề**
>
> Câu luyện thi: lưu khoá API của nhiều dịch vụ bên ngoài. Đúng là **secrets manager hoặc cấu hình riêng của môi trường không commit vào source code, nạp lúc chạy**. Sai: để trong file cấu hình rồi commit cùng code; một khoá chung cho mọi dịch vụ để ai cũng tìm thấy; gửi email khoá cho từng lập trình viên.

> **Trong đề chọn gì**
>
> Câu luyện thi: khoá API nằm trong secrets manager, đội tranh luận có nên dùng chung một khoá cho dev, staging, production. Chọn **mỗi môi trường một khoá riêng, để lộ ở một nơi không ảnh hưởng nơi khác**. Sai: xoay vòng một khoá chung ở thời điểm ngẫu nhiên; dùng chung một khoá và chấp nhận rủi ro; dùng khoá dev ở mọi nơi.

## Khi nghi khoá bị lộ

Thứ tự xử lý trong ví dụ, khi phát hiện khoá từng bị commit:

1. **Tắt ngay** khoá trong trang API keys của Console. Tắt (Disable) đảo ngược được; xoá (Delete) là vĩnh viễn.
2. **Tạo khoá mới** theo đúng mô hình: một khoá service account cho mỗi môi trường, CI chuyển sang WIF.
3. **Xem khoá đã bị dùng tới đâu**: trang Usage của Console xuất được CSV theo API key và model; API báo cáo mức dùng lọc được theo API key, workspace, model.
4. **Giới hạn thiệt hại về tiền**: đặt hạn mức chi tiêu thấp hơn mức của hạng sử dụng. Chạm hạn mức tự đặt thì yêu cầu nhận lỗi 400, thay vì tiếp tục tiêu tiền.

Sau đợt này, mô hình khoá của công ty đổi như sau:

**Sơ đồ**
1. **Trước**: một khoá của trưởng nhóm, dùng ở ba môi trường và CI
   ↓ _tách ra, mỗi nơi một danh tính_
2. **Dev**: khoá service account riêng **|** **Staging**: khoá service account riêng **|** **Production**: khoá service account riêng **|** **CI**: WIF, không lưu khoá

Đề thi còn nhắc phê duyệt truy cập, kiểm cấp độ quyền và giám sát truy cập được phép (**access approval, level verification, authorized access monitoring**): ai được tạo khoá, khoá đó có quyền ở workspace nào, và mức dùng của từng khoá có khớp với việc nó được cấp để làm không.

1. **Script hay máy của riêng bạn?** → Khoá cá nhân, có hạn dùng
2. **Dịch vụ chạy chung hay tự động?** → Khoá service account, mỗi môi trường một khoá
3. **Workload đã có định danh từ cloud hay CI?** → Workload Identity Federation, bỏ khoá tĩnh
4. **Nghi khoá bị lộ?** → Tắt ngay, tạo khoá mới, xem mức dùng theo khoá, đặt hạn mức chi tiêu
- **Còn lại** → Khoá luôn nằm trong secrets manager, không bao giờ trong repo

> **Ý chính**
>
> Dùng khoá gắn với danh tính: cá nhân cho bạn, service account cho việc chung, WIF khi workload đã có định danh. 401 là khoá sai hay hết hạn, 403 là thiếu quyền. Khoá nằm trong secrets manager, mỗi môi trường một khoá, có hạn, xoay vòng được. Nghi lộ thì tắt ngay rồi mới điều tra.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 7](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Authentication (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/authentication)
3. [Use WIF with GitHub Actions (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/wif-providers/github-actions)
4. [Create an Admin API key (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/admin-api-keys)
5. [Claude API errors (Claude API Docs)](https://platform.claude.com/docs/en/api/errors)
6. [Rate limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
7. [Usage and Cost API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
8. [Model deprecations (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
