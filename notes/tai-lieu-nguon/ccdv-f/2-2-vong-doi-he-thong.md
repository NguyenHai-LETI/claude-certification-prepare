---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/2-2-vong-doi-he-thong
ngay_tai: 2026-11-27
tieu_de: Vòng đời hệ thống - vận hành, model hết hạn và thay đổi phiên bản API
---

Domain 2: Applications and Integration · Task 2.2

# Vòng đời hệ thống - vận hành, model hết hạn và thay đổi phiên bản API

Sau khi ship là vận hành và bảo trì. Bài này nói vòng đời của model Claude, cách đổi model và tham số trước hạn, và kiểm tác động lên hệ thống phía sau.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Biết giai đoạn sau khi ship là vận hành và bảo trì, gồm những việc gì
- Gọi đúng bốn trạng thái của model Claude và biết mỗi trạng thái nghĩa là gì với ứng dụng đang chạy
- Lên kế hoạch đổi model hay tham số bị bỏ - kiểm tra mức dùng, viết regression test, đổi theo từng đợt
- Đánh giá tác động lên các hệ thống phía sau trước khi phát hành một thay đổi

Ứng dụng dùng Claude không đứng yên sau ngày ra mắt. Model mới ra, model cũ hết hạn, tham số bị bỏ, phiên bản API đổi. Một hệ thống chạy ổn hôm nay có thể bắt đầu trả lỗi 400 vào tháng sau nếu không ai theo dõi.

Bài này giúp bạn trả lời: sau khi ship thì làm gì, model Claude đi qua những trạng thái nào, và đổi model hay tham số thế nào cho an toàn?

## Ví dụ xuyên suốt: trợ lý giám định của công ty bảo hiểm xe máy

Một công ty bảo hiểm xe máy chạy trợ lý giám định được một năm. Trợ lý đọc ảnh hiện trường và tờ khai của khách, trả về một bản tóm tắt có cấu trúc: loại hư hỏng, mức độ, số tiền ước tính. Bản tóm tắt này được hai hệ thống khác đọc: hệ thống bồi thường (tự duyệt các vụ nhỏ) và hệ thống phát hiện gian lận.

Code gọi model `claude-sonnet-4-5-20250929` và đặt `temperature=0.2` ở khoảng 40 chỗ, viết từ hồi mới làm.

## Sau khi ship là vận hành và bảo trì

Đề thi hỏi về các khái niệm vòng đời hệ thống (**systems life cycle**): phát triển, triển khai, vận hành và bảo trì một hệ thống IT. Ship lên production không phải là kết thúc. Giai đoạn tiếp theo là vận hành và bảo trì: theo dõi hệ thống, xử lý sự cố, và lên kế hoạch cho các thay đổi tiếp theo.

Với ứng dụng dùng Claude, phần bảo trì có thêm những việc riêng: theo dõi chi phí token, độ trễ, tỉ lệ lỗi, chất lượng đầu ra; và theo dõi lịch hết hạn của model, các tham số bị bỏ, các phiên bản API mới.

> **Trong đề chọn gì**
>
> Câu luyện thi: vừa ship một ứng dụng dùng Claude, đội nội bộ đang dùng. Giai đoạn tiếp theo là **vận hành và bảo trì: theo dõi, xử lý sự cố, lên kế hoạch phát triển tiếp**. Sai: cho hệ thống nghỉ hưu vì ship là bước cuối; họp đánh giá giai đoạn phát triển trước khi làm gì khác; giao hẳn cho một đội vận hành riêng.

## Bốn trạng thái của một model Claude

Trang model deprecations của Anthropic chia vòng đời model thành bốn trạng thái:

| Trạng thái | Nghĩa | Ứng dụng cần làm gì |
| --- | --- | --- |
| **Active** | Được hỗ trợ đầy đủ, nên dùng | Không cần làm gì |
| **Legacy** | Không còn được cập nhật, có thể bị deprecate sau này | Bắt đầu để ý model thay thế |
| **Deprecated** | Vẫn chạy nhưng không còn được khuyên dùng; có model thay thế và ngày retire | Lên kế hoạch đổi trước ngày retire |
| **Retired** | Không dùng được nữa; yêu cầu tới model này thất bại | Quá muộn: ứng dụng đã hỏng |

Docs nói Anthropic báo trước ít nhất 60 ngày trước khi retire một model đã phát hành công khai, cho những khách đang dùng nó. Docs cũng lưu ý model đã deprecated có thể kém ổn định hơn model active.

Trong ví dụ, `claude-sonnet-4-5-20250929` bị deprecate từ 30/09/2026, ngày retire dự kiến là 30/11/2026, model thay thế được khuyên là `claude-sonnet-5-5`. Công ty còn chưa tới một tháng.

**Sơ đồ**
1. **Active**: nên dùng
   ↓ _không còn được cập nhật_
2. **Legacy**: bắt đầu để ý model thay thế
   ↓ _có ngày retire, báo trước ít nhất 60 ngày_
3. **Deprecated**: claude-sonnet-4-5-20250929 đang ở đây từ 30/09/2026
   ↓ _ngày retire dự kiến 30/11/2026_
4. **Retired**: yêu cầu tới model này thất bại

Hai điều hay bị bỏ sót:

- Lịch trên trang đó áp dụng cho các nền tảng do Anthropic vận hành (Claude API, Claude Platform on AWS, Google Cloud bản Anthropic quản lý, Microsoft Foundry). Amazon Bedrock và Google Cloud bản Google quản lý tự đặt lịch retire riêng.
- Để biết còn chỗ nào gọi model cũ, vào trang Usage của Claude Console, bấm **Export**, xem file CSV chia theo API key và model.

## Tham số bị bỏ và phiên bản API

Không chỉ model, tham số cũng có vòng đời. Mỗi yêu cầu gửi header `anthropic-version`. Với một phiên bản API, Anthropic giữ nguyên các tham số đầu vào và đầu ra đã có, nhưng có thể thêm trường mới, thêm giá trị mới cho trường dạng liệt kê, và đổi điều kiện của một số loại lỗi. Nếu bạn dùng SDK, yêu cầu của bạn dùng phiên bản API hiện hành lúc phiên bản major của SDK đó ra mắt; nâng SDK lên major mới là đổi luôn phiên bản API.

Phiên bản `2026-10-21` bỏ hẳn `temperature`, `top_p`, `top_k`: gửi bất kỳ tham số nào trong ba tham số đó đều bị lỗi 400 trên mọi model. Ngay cả với phiên bản API cũ, model từ Claude 4.7 trở đi đã trả 400 khi các tham số này khác giá trị mặc định. Vậy với công ty bảo hiểm, đổi sang `claude-sonnet-5-5` mà giữ `temperature=0.2` thì mọi lời gọi đều hỏng, dù chưa nâng SDK.

Tham số thay thế không phải lúc nào cũng có cùng ý nghĩa. Bỏ `temperature=0.2` nghĩa là model lấy mẫu ở giá trị mặc định; đầu ra có thể khác trước một chút về cách diễn đạt, và hệ thống phía sau phải chịu được điều đó.

> **Bẫy đề**
>
> Câu luyện thi: một tham số bị deprecate, dùng ở khoảng 40 chỗ, có 6 tháng trước khi bị bỏ, tham số thay thế có ý nghĩa hơi khác. Đúng là **viết regression test phủ hành vi của tham số đó, rồi đổi từng đợt, mỗi đợt kiểm lại bằng test**. Sai: đổi cả 40 chỗ một lần sát hạn; đổi cả 40 chỗ một lần ngay bây giờ; giữ tham số cũ và bọc một hàm quanh nó. Chìa khoá là "ý nghĩa hơi khác": code vẫn chạy nhưng hành vi lệch âm thầm, chỉ test mới bắt được.

## Tính năng Beta

Tính năng đang **Beta** là tính năng thử nghiệm, bật bằng header `anthropic-beta`, trước khi vào API chuẩn. Docs cảnh báo tính năng Beta có thể thay đổi, kể cả thay đổi làm hỏng code cũ (breaking change), có báo trước; có thể bị deprecate hoặc gỡ; có thể có rate limit hoặc giá khác; và không phải vùng nào cũng có.

Vì thế đừng dựng phần lõi của một hệ thống production chỉ trên một tính năng Beta: nếu nó đổi hay biến mất, bạn phải viết lại. Phần lõi nên dựa trên tính năng đã ra chính thức (**GA**), còn Beta dùng cho phần thay thế được. Docs không nêu mức phụ phí cố định nào cho Beta, cũng không cấm dùng Beta cùng caching hay batch.

## Kế hoạch đổi model an toàn

Ghép lại, đội của công ty bảo hiểm làm theo thứ tự:

1. **Kiểm mức dùng**: xuất CSV từ trang Usage, tìm mọi API key còn gọi model cũ.
2. **Viết regression test**: lấy 300 hồ sơ đã giám định, lưu đầu ra hiện tại làm mốc; test kiểm cấu trúc đầu ra và các trường quan trọng (loại hư hỏng, mức độ).
3. **Đổi theo từng đợt**: bỏ `temperature`, đổi model ID ở một nhóm chỗ gọi, chạy test, rồi tới nhóm tiếp.
4. **Kiểm tác động lên hệ thống phía sau** trước khi phát hành (mục dưới).
5. **Ghim model ID mới** trong cấu hình, ghi ngày retire dự kiến của nó (`claude-sonnet-5-5`: không sớm hơn 28/09/2027) vào lịch theo dõi.

1. **Model đang dùng đã deprecated?** → Xuất Usage CSV, lên kế hoạch đổi trước ngày retire
2. **Có tham số bị bỏ hay đổi ý nghĩa?** → Viết regression test trước, đổi từng đợt
3. **Đầu ra đổi có thể ảnh hưởng hệ thống khác?** → Đánh giá với chủ từng hệ thống trước khi phát hành
- **Còn lại** → Phát hành, ghim model ID mới, ghi lịch retire vào theo dõi

## Kiểm tác động lên hệ thống phía sau

Test trên staging chỉ chứng minh ứng dụng của bạn chạy được. Nó không chứng minh đầu ra mới vẫn khớp với những gì hệ thống phía sau mong đợi. Trong ví dụ, model mới viết phần "mô tả hư hỏng" dài hơn; hệ thống bồi thường không sao, nhưng hệ thống phát hiện gian lận có một luật đếm từ khoá trong đúng trường này và bắt đầu gắn cờ sai nhiều hơn.

**Sơ đồ**
1. **Trợ lý giám định**: model mới viết phần mô tả hư hỏng dài hơn
   ↓ _cùng một đầu ra đi tới hai nơi_
2. **Hệ thống bồi thường**: không sao **|** **Hệ thống phát hiện gian lận**: luật đếm từ khoá gắn cờ sai nhiều hơn

> **Trong đề chọn gì**
>
> Câu luyện thi: chuẩn bị phát hành thay đổi cấu hình, đổi vài phiên bản prompt; đã test trên staging nhưng chưa ai đánh giá ảnh hưởng tới từng hệ thống phía sau dùng đầu ra. Chọn **đánh giá tác động lên từng hệ thống phía sau trước khi phát hành, phối hợp với chủ các hệ thống đó khi cần**. Sai: ghi changelog rồi phát hành, coi staging là đủ; báo trước một tuần nhưng không đánh giá; chỉ phát hành cho các hệ thống có trong staging.

> **Ý chính**
>
> Ship xong là vận hành và bảo trì. Model đi qua Active, Legacy, Deprecated, Retired; tới Retired thì yêu cầu thất bại. Đổi model hay tham số thì kiểm mức dùng, viết regression test, đổi từng đợt, và đánh giá tác động lên hệ thống phía sau trước khi phát hành.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Model deprecations (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
3. [Versions (Claude API Docs)](https://platform.claude.com/docs/en/api/versioning)
4. [Migrating to API version 2026-10-21 (Claude API Docs)](https://platform.claude.com/docs/en/api/migration-2026-10-21)
5. [Models overview (Claude API Docs)](https://platform.claude.com/docs/en/models/overview)
6. [Beta headers (Claude Docs)](https://platform.claude.com/docs/en/api/beta-headers)
