---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-4-tai-lieu-kien-truc
ngay_tai: 2026-11-27
tieu_de: Viết tài liệu kiến trúc và hướng dẫn triển khai
---

Domain 6: Stakeholder Communication & Lifecycle Management · Task 6.4

# Viết tài liệu kiến trúc và hướng dẫn triển khai

Viết tài liệu kiến trúc cho giải pháp dùng Claude, gồm người đọc, những gì phải chốt, ADR, gói bàn giao có runbook, và CLAUDE.md cho đội triển khai.

- 12 phút đọc
- Đối chiếu docs 02/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Xác định người đọc và câu hỏi của họ trước khi viết, rồi mới lập khung tài liệu
- Chốt trong tài liệu nơi chạy vòng lặp agent, model, phiên bản API, tool và hợp đồng giữa các thành phần
- Ghi quyết định thành ADR có bối cảnh, phương án đã cân nhắc và hệ quả
- Lập gói bàn giao đủ để đội triển khai tự xây và tự trực vận hành, có runbook
- Đưa quy ước triển khai vào CLAUDE.md khi đội dùng Claude Code

Bản thiết kế nằm trong đầu kiến trúc sư thì chỉ dùng được khi kiến trúc sư còn ở đó. Tài liệu kiến trúc tốt là thứ cho phép đội triển khai xây đúng, trực vận hành và sửa lỗi lúc 2 giờ sáng mà không phải gọi ai.

Bài này giúp bạn trả lời: tài liệu kiến trúc và hướng dẫn triển khai cho một giải pháp dùng Claude cần có gì, viết theo thứ tự nào?

## Ví dụ xuyên suốt: công ty quản lý chung cư

Một công ty quản lý 12 toà chung cư nhận khoảng 600 tin nhắn của cư dân mỗi ngày: báo hỏng thang máy, hỏi phí dịch vụ, phản ánh tiếng ồn. Bạn đã thiết kế xong một trợ lý gồm ba bước:

1. Claude Haiku 5.5 phân loại tin nhắn (sửa chữa, phí, an ninh, khác) và đánh dấu việc khẩn cấp.
2. Một agent chạy Claude Sonnet 5.5 tra hồ sơ căn hộ và tạo phiếu sửa chữa trong phần mềm quản lý toà nhà.
3. Câu trả lời nháp gửi cho lễ tân duyệt trước khi tới cư dân.

Đội triển khai của một công ty phần mềm đối tác sẽ xây và trực vận hành hệ thống. Hai tuần nữa bạn chuyển sang dự án khác.

**Sơ đồ**
1. **Tin nhắn của cư dân**
   ↓ _Haiku 5.5 phân loại, đánh dấu việc khẩn cấp_
2. **Tin sửa chữa**: agent Sonnet 5.5 tra hồ sơ căn hộ, tạo phiếu **|** **Tin khác**: phí, an ninh, khác
   ↓ _soạn câu trả lời nháp_
3. **Lễ tân duyệt**
   ↓ _gửi_
4. **Cư dân nhận câu trả lời**

## Trước khi viết: ai đọc, họ cần hỏi gì

Hai việc phải xong trước khi viết nội dung từng phần:

1. **Xác định người đọc và câu hỏi tài liệu phải trả lời cho họ.**
2. **Lập khung các phần**: tổng quan, thành phần, hợp đồng giữa các thành phần, các luồng chính, runbook, giới hạn đã biết (_overview, components, contracts, flows, runbooks, limitations_).

| Người đọc | Câu hỏi của họ |
| --- | --- |
| Lập trình viên của đội triển khai | Mỗi thành phần nhận gì, trả gì, gọi ai, cấu hình bằng gì? |
| Kỹ sư trực vận hành | Báo động này nghĩa là gì, xử lý thế nào, gọi ai, quay lại bản cũ ra sao? |
| Người kiểm toán, nhân viên mới sau này | Vì sao hệ thống được thiết kế thế này? |

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi hai bước phải xong **trước khi** viết từng phần của tài liệu kiến trúc. Chọn **xác định người đọc và câu hỏi họ cần trả lời**, và **lập khung các phần (tổng quan, thành phần, hợp đồng, luồng, runbook, giới hạn)**. Loại: dịch sang các ngôn ngữ khác; cho đội triển khai thẩm định rồi sửa; đưa vào quản lý phiên bản với lịch duyệt. Ba việc đó đều cần, nhưng làm sau khi đã có nội dung.

## Tài liệu kiến trúc phải chốt được những gì

Với một hệ thống dùng Claude, có vài thứ nếu tài liệu không ghi rõ thì mỗi lập trình viên sẽ tự đoán một kiểu:

- **Vòng lặp agent chạy ở đâu.** Docs của Anthropic nêu ba đường xây: tự viết vòng lặp trên Messages API (kiểm soát nhiều nhất), Agent SDK (vòng lặp và việc chạy tool nằm trong tiến trình của bạn), hoặc Managed Agents (Anthropic chạy vòng lặp, tool và môi trường). Trong ví dụ: Agent SDK chạy trên máy chủ của công ty.
- **Model, effort và phiên bản API của từng bước.** Docs nói mọi model ID của Claude đều là một bản cố định (snapshot), kể cả các ID không có ngày như `claude-sonnet-5-5`. Ghi đúng ID thì mọi người cùng biết đang chạy model nào. Mỗi yêu cầu API cũng gửi một header `anthropic-version`, và một phiên bản API mới có thể bỏ tham số cũ: bản `2026-10-21` đã bỏ `temperature`, `top_p`, `top_k`. Ghi phiên bản API vào tài liệu để biết khi nào phải nâng.
- **Tool nối vào thế nào.** Tool viết thẳng trong code hay qua MCP server; nếu qua MCP thì server nào, cách kết nối, xác thực ra sao, cấp những tool nào.
- **Hợp đồng giữa các thành phần** (**integration contracts**): hình dạng đầu vào, đầu ra, lỗi, và tham số cấu hình kèm giá trị mặc định.
- **Các luồng chính**, vẽ thành sơ đồ trình tự (**sequence diagram**): tin nhắn báo hỏng thang máy đi qua những bước nào, chỗ nào có người duyệt.
- **Lý do mỗi lớp tồn tại.** Vì sao có bước phân loại riêng bằng Haiku, vì sao lễ tân duyệt trước khi gửi.

Một thẻ thành phần trong tài liệu có thể trông như sau:

```yaml
thanh_phan: phan-loai-tin-nhan
chay_tren: Agent SDK, máy chủ nội bộ
model: claude-haiku-5-5
effort: low
anthropic_version: 2026-10-21
dau_vao: { tin_nhan: string, toa: string, can_ho: string }
dau_ra: { loai: sua-chua | phi | an-ninh | khac, khan_cap: boolean }
khi_loi: chuyển tin vào hàng chờ của lễ tân, không tự trả lời
cau_hinh:
  tu_khoa_khan_cap: [thang máy, cháy, rò rỉ gas]   # mặc định
```

## Ghi lý do bằng ADR

Một năm sau, người mới vào đội sẽ hỏi: "Sao không để một agent làm hết cho gọn?" Câu trả lời phải nằm trong tài liệu, không phải trong trí nhớ của bạn. Dạng chuẩn cho việc này là bản ghi quyết định kiến trúc (**Architecture Decision Record**, ADR), mỗi quyết định một bản:

```
ADR-004: Tách bước phân loại khỏi agent tạo phiếu
Ngày: 2026-10-20. Tác giả: kiến trúc sư giải pháp, trưởng nhóm vận hành toà nhà
Bối cảnh: 600 tin nhắn mỗi ngày, khoảng 70% chỉ hỏi phí hoặc giờ làm việc.
Quyết định: Haiku 5.5 phân loại trước; chỉ tin sửa chữa mới vào agent Sonnet 5.5.
Phương án đã cân nhắc: một agent Sonnet 5.5 làm hết (đắt hơn, chậm hơn với
tin đơn giản); phân loại bằng từ khoá (sai nhiều với tin viết tắt, không dấu).
Hệ quả: thêm một lần gọi API cho mỗi tin; phải theo dõi riêng độ chính xác phân loại.
```

ADR là thứ dùng được cho kiểm toán và cho người mới, vì nó có bối cảnh, quyết định, phương án đã cân nhắc, hệ quả, ngày và người viết. Người đọc biết **vì sao** chọn, không chỉ biết **đã chọn gì**.

> **Bẫy đề**
>
> Câu luyện thi hỏi tài liệu nào hợp nhất để phục vụ kiểm toán và người mới về sau. Đáp án đúng là **ADR có bối cảnh, quyết định, phương án đã cân nhắc, hệ quả, ngày và tác giả**. Đáp án sai: bộ slide không kèm lý do viết ra; một dòng comment trong code ghi ý kiến của một kỹ sư; trao đổi miệng ngoài hành lang.

## Gói bàn giao để đội triển khai tự làm được

Thước đo của tài liệu bàn giao: đội triển khai xây và vận hành được mà không phải hỏi lại bạn. Gói đầy đủ gồm:

| Phần | Trong ví dụ |
| --- | --- |
| Tổng quan kiến trúc (**architecture overview**) | Sơ đồ ba bước, nơi chạy, các hệ thống nối vào |
| Các ADR | ADR-001 tới ADR-009 |
| Hợp đồng từng thành phần (**component contracts**) | Thẻ thành phần như ở trên, kèm tham số cấu hình và giá trị mặc định |
| Sơ đồ trình tự các luồng chính | Báo hỏng khẩn cấp, hỏi phí, tin không phân loại được |
| Khung đánh giá kèm bộ mẫu tham chiếu (**evaluation framework**, reference set) | 300 tin nhắn thật đã gắn nhãn, chạy lại mỗi lần đổi prompt hay model |
| Runbook và hướng dẫn cho ca trực (**on-call playbook**) | Xem dưới |
| Danh sách giới hạn đã biết (**known limitations**) | Chưa đọc được ảnh chụp đồng hồ nước; tin trộn nhiều vấn đề thì chỉ tạo phiếu cho vấn đề đầu |

> **Trong đề chọn gì**
>
> Ba câu luyện thi cùng hỏi tài liệu cho đội triển khai. Gói bàn giao: chọn **tổng quan kiến trúc, ADR, hợp đồng thành phần, khung đánh giá kèm bộ mẫu tham chiếu, runbook, hướng dẫn ca trực, giới hạn đã biết**. Hướng dẫn triển khai: chọn **trách nhiệm từng thành phần, hợp đồng giữa các thành phần, sơ đồ trình tự các luồng chính, tham số cấu hình kèm mặc định, runbook**. Dấu hiệu tài liệu đủ để làm không cần kiến trúc sư: **có hợp đồng tích hợp, schema cấu hình, hình dạng đầu vào và đầu ra**, và **có nhật ký quyết định ghi lý do cùng phương án bị loại**.

> **Bẫy đề**
>
> Các đáp án sai trong ba câu đó thường là một gói thiếu vài phần: chỉ có slide; chỉ có mã nguồn; buổi hướng dẫn miệng ngày bàn giao; tổng quan kèm danh sách giới hạn mà không có hợp đồng hay cấu hình. Hai đáp án sai dễ chọn nhầm: **ghi số điện thoại của kiến trúc sư** để hỏi khi cần (nghĩa là tài liệu chưa đủ), và **liệt kê mọi model đã thử mà không nói chọn model nào, vì sao**.

### Runbook

Runbook là thứ kỹ sư trực mở ra khi có báo động. Nó phải dẫn từ lúc phát hiện tới lúc xử lý xong, nên cần đủ bốn thứ: các báo động thường gặp kèm bước kiểm tra, đường chuyển lên cấp trên (**escalation path**), cách quay lại bản trước (**rollback**), và đường dẫn tới dashboard, log liên quan.

Bốn thứ đó dẫn kỹ sư trực đi từ báo động tới xử lý xong:

**Sơ đồ**
1. **Báo động**: kèm bước kiểm tra
   ↓ _mở đường dẫn tới dashboard và log_
2. **Tìm nguyên nhân**: có gì vừa đổi không?
   ↓ _rẽ theo kết quả_
3. **Do bản vừa đổi**: quay lại bản trước **|** **Chưa rõ sau một thời gian**: chuyển lên cấp trên

Ví dụ một mục trong runbook của công ty quản lý chung cư:

```
Báo động: tỉ lệ tin "khac" vượt 15% trong 1 giờ
Kiểm tra: mở dashboard phân loại, xem 20 tin gần nhất. Có toà mới, loại tin mới?
          Prompt hay model vừa đổi? Xem nhật ký triển khai.
Quay lại: đặt lại phiên bản prompt phân loại trước đó trong cấu hình, không cần build lại.
Chuyển lên: quá 30 phút chưa rõ nguyên nhân thì gọi trưởng nhóm kỹ thuật đối tác;
            ảnh hưởng tin khẩn cấp thì báo ngay trưởng ban quản lý toà nhà.
```

> **Bẫy đề**
>
> Câu luyện thi về runbook có ba đáp án sai, mỗi đáp án thiếu một khúc: chỉ có dashboard và log; chỉ có báo động và bước kiểm tra; chỉ có đường chuyển lên và cách quay lại. Đáp án đúng có **đủ cả bốn**: báo động kèm bước kiểm tra, đường chuyển lên, cách quay lại, đường dẫn dashboard và log.

## Hướng dẫn cho Claude Code của đội triển khai

Nếu đội triển khai dùng Claude Code để viết code, một phần hướng dẫn triển khai nên nằm trong file `CLAUDE.md` của repository, để cả người lẫn Claude cùng đọc một bộ quy ước.

- **Ghi gì**: những điều Claude không tự đọc ra từ code được. Lệnh chạy test, quy ước đặt tên, những thư mục không được sửa tay. Docs Claude Code khuyên giữ mỗi file dưới khoảng 200 dòng; quy trình dài thì tách thành skill, chỉ nạp khi cần.
- **Đặt ở đâu**: `CLAUDE.md` ở gốc cho quy ước chung, và một file trong từng thư mục con cho quy ước riêng của phần đó. Claude Code nạp file ở thư mục làm việc và các thư mục cha khi khởi động, file của thư mục con thì nạp khi cần. Commit các file này để cả đội cùng dùng; người phụ trách thư mục nào giữ file của thư mục đó.
- **Giữ cho đúng**: duyệt thay đổi `CLAUDE.md` trong pull request như mọi tài liệu khác, và xem lại sau mỗi lần có model mới, vì một luật viết để lách giới hạn của model cũ có thể không còn cần.

```
packages/phan-loai/CLAUDE.md
Chạy test: pnpm test --filter phan-loai. Bộ mẫu tham chiếu ở eval/mau-300.jsonl.
Đổi prompt thì chạy lại eval trước khi mở pull request.
Không sửa tay file trong src/generated/. Chạy pnpm codegen.
```

Docs cũng nói rõ `CLAUDE.md` là ngữ cảnh cho Claude, không phải cấu hình bắt buộc. Việc nhất định phải xảy ra (chặn sửa file sinh tự động, chạy lint sau mỗi lần sửa) thì dùng hook hoặc luật `permissions.deny`, và ghi điều đó vào tài liệu bàn giao. Cấu hình Claude Code cho cả đội có ở bài 7.1.

> **Ý chính**
>
> Xác định người đọc và lập khung trước khi viết. Chốt nơi chạy, model, phiên bản API, tool và hợp đồng giữa các thành phần; ghi lý do bằng ADR; bàn giao đủ bộ để đội triển khai tự xây và tự trực, có runbook đủ bốn phần và danh sách giới hạn đã biết.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Use case guides, choosing a build path (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/overview)
3. [Models overview (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/overview)
4. [API versions (Claude Docs)](https://platform.claude.com/docs/en/api/versioning)
5. [Memory and project instructions (Claude Code Docs)](https://code.claude.com/docs/en/memory)
6. [Set up Claude Code in a monorepo or large codebase (Claude Code Docs)](https://code.claude.com/docs/en/large-codebases)
7. [Best practices for Claude Code (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
