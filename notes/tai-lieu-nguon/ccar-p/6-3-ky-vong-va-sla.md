---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/6-3-ky-vong-va-sla
ngay_tai: 2026-11-27
tieu_de: Vòng phản hồi, kỳ vọng của các bên và SLA
---

Domain 6: Stakeholder Communication & Lifecycle Management · Task 6.3

# Vòng phản hồi, kỳ vọng của các bên và SLA

Cách viết một SLA đo được, dựa SLA trên đúng những gì Claude API cam kết, xử lý lo ngại và yêu cầu phát sinh, và giữ vòng phản hồi có nhịp với các bên.

- 12 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Viết SLA có đủ chỉ số, ngưỡng, khoảng thời gian tính và việc phải làm khi vi phạm
- Biết Claude API cam kết gì và không cam kết gì về sẵn sàng, rate limit, trần chi tiêu, vòng đời model
- Xử lý lo ngại và yêu cầu phát sinh bằng số đo và các lựa chọn để các bên tự quyết
- Tổ chức buổi phản hồi và nhịp xem lại kỳ vọng, giải quyết bất đồng công khai
- Phân biệt xuống cấp thật với dao động bình thường trước khi báo động

Giữa dự án, các bên liên quan bắt đầu than "trợ lý chậm quá". Bạn có thể tối ưu ngay, có thể giải thích rằng mô hình ngôn ngữ vốn vậy, hoặc có thể mở bảng số đo ra cùng họ xem. Chỉ cách cuối giữ được lòng tin, và nó chỉ làm được nếu từ đầu đã có một cam kết đo được.

Bài này giúp bạn trả lời: thống nhất kỳ vọng và cam kết mức dịch vụ (**SLA**, service level agreement) với các bên thế nào, và giữ chúng khớp với thực tế suốt dự án ra sao?

## Ví dụ xuyên suốt: chuỗi rạp chiếu phim

Một chuỗi rạp chiếu phim đang chạy thử trợ lý chat trên app ở 5 rạp: trả lời lịch chiếu, giá vé, chính sách đổi vé, và giữ chỗ giúp khách. Sau một tối thứ Sáu đông khách, giám đốc vận hành nhận vài lời phàn nàn và muốn hợp đồng ghi "trợ lý luôn trả lời ngay, không bao giờ ngừng" trước khi mở rộng ra 40 rạp, đúng dịp mở bán vé một phim bom tấn. Cùng tuần đó, giám đốc marketing muốn thêm tính năng gợi ý phim theo sở thích vào đợt chạy thử.

## SLA phải đo được

"Luôn trả lời ngay" là một mong muốn, chưa phải SLA. Một SLA dùng được trong vận hành có bốn phần:

| Phần | Câu hỏi | Trong ví dụ |
| --- | --- | --- |
| Chỉ số (**metric**) | Đo cái gì, đo ở đâu? | Thời gian từ lúc khách gửi tới khi chữ đầu tiên hiện trên app |
| Ngưỡng (**threshold**) | Bao nhiêu là đạt? | Phân vị 95 (p95) dưới 2 giây, tức 95% tin nhắn có chữ đầu tiên trong 2 giây |
| Khoảng thời gian tính (**evaluation window**) | Tính trên bao lâu? | 28 ngày gần nhất |
| Việc phải làm khi vi phạm (**consequence for breach**) | Vượt ngưỡng thì sao? | Nhóm kỹ thuật gửi báo cáo nguyên nhân và kế hoạch khắc phục trong 5 ngày làm việc |

Thiếu khoảng thời gian thì không ai biết một tối thứ Sáu chậm có tính là vi phạm hay không. Thiếu việc phải làm thì vi phạm xong cũng không có gì xảy ra.

Docs của Anthropic về tiêu chí thành công cũng nhắc rằng hầu hết ứng dụng cần đánh giá trên nhiều mặt cùng lúc, trong đó có độ trễ và chi phí bên cạnh chất lượng. Vì vậy, trước khi ký SLA, các bên nên thống nhất cả những chỉ số đi kèm: tỉ lệ trả lời đúng lịch chiếu trên bộ câu hỏi kiểm thử, tỉ lệ cuộc chat phải chuyển cho nhân viên, chi phí mỗi cuộc chat. Một SLA chỉ về tốc độ có thể đạt trong khi trợ lý trả lời sai giờ chiếu.

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi định nghĩa SLA nào có ý nghĩa nhất trong vận hành. Chọn định nghĩa có **chỉ số, ngưỡng, khoảng thời gian tính và việc phải làm khi vi phạm**, kiểu "p95 độ trễ mỗi yêu cầu dưới 800 ms trong cửa sổ 28 ngày".

> **Bẫy đề**
>
> Các đáp án sai trong câu đó: gắn với cảm nhận ("đội thấy hài lòng"); cam kết định tính ("hệ thống sẽ nhanh và ổn định"); có chỉ số và ngưỡng nhưng **thiếu khoảng thời gian và việc phải làm khi vi phạm**. Đáp án cuối dễ chọn nhầm nhất vì trông đã có số.

## Cam kết của bạn dựa trên cam kết bạn nhận được

Trợ lý của bạn gọi Claude API, nên SLA bạn ký không thể mạnh hơn những gì API cam kết, trừ khi bạn có đường lùi. Đây là những gì docs của Anthropic nói:

| Thứ | Docs nói | Nghĩa cho SLA của bạn |
| --- | --- | --- |
| Hạng dịch vụ Standard | Hạng mặc định cho mọi yêu cầu, sẵn sàng theo kiểu cố gắng hết mức (**best-effort**) | Không có con số thời gian hoạt động được cam kết |
| Priority Tier | Mục tiêu 99,5% thời gian hoạt động. Nay đã thành tính năng cũ, không bán thêm cam kết mới, và không hỗ trợ các model mới như Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.1. Cần dung lượng bảo đảm thì liên hệ bộ phận bán hàng | Dự án mới không dựa vào hạng này được |
| Rate limit | Là mức **tối đa**, không phải mức tối thiểu được bảo đảm. Tính theo kiểu thùng token nạp lại liên tục, nên dồn nhiều yêu cầu trong vài giây vẫn có thể bị lỗi 429. Lưu lượng tăng vọt đột ngột cũng có thể bị 429 | Đo đỉnh thật, xin nâng hạn mức trước, tăng lưu lượng từ từ |
| Trần chi tiêu theo hạng tài khoản | Hạng Start $500, Build $1.000, Scale $200.000 mỗi tháng. Chạm trần thì mọi yêu cầu trả 429 không có `retry-after`, tới 00:00 UTC ngày 1 tháng sau | Theo dõi chi tiêu, nâng hạng trước mùa cao điểm |
| Lỗi 529 | API tạm quá tải do lưu lượng chung của mọi người dùng | Phải có đường lùi |

Thêm một điều ít người để ý: trang hỗ trợ của Anthropic nói giới hạn do thiếu dung lượng không phải là sự cố, và sẽ không hiện trên trang trạng thái `status.claude.com`. Trang trạng thái chỉ báo các sự cố kỹ thuật thật. Muốn biết trợ lý của mình có giữ được SLA hay không, bạn phải tự đo.

Trong ví dụ, câu trả lời cho "không bao giờ ngừng" là một đề xuất cụ thể: SLA tính trên trải nghiệm của khách, kể cả khi Claude không trả lời được. Khi API báo lỗi, app hiện lịch chiếu lấy thẳng từ hệ thống bán vé kèm nút gọi tổng đài. Trước ngày mở bán phim bom tấn, nhóm đo đỉnh lưu lượng của tối thứ Sáu, xin nâng hạn mức, và mở rộng từ 5 lên 40 rạp theo từng đợt chứ không bật một lần.

**Sơ đồ**
1. **Khách nhắn trên app**
   ↓ _gọi Claude API_
2. **Claude trả lời được**: hiện câu trả lời **|** **API báo lỗi**: app hiện lịch chiếu từ hệ thống bán vé, kèm nút gọi tổng đài

## Khi các bên lo lắng: đưa số đo, rồi thương lượng

Giám đốc vận hành lo vì vài lời phàn nàn. Hai việc làm cho kỳ vọng khớp lại với thực tế:

1. **Đưa số đo so với ngưỡng đã thống nhất**: p50 và p95 độ trễ đo được, đặt cạnh ngưỡng SLA. Trong ví dụ: p50 là 0,9 giây, p95 là 2,6 giây, vượt ngưỡng 2 giây chủ yếu ở các câu hỏi về đổi vé, loại câu cần tra nhiều thông tin.
2. **Sửa SLA cùng các bên nếu ngưỡng hiện tại không đạt được** trong điều kiện thật. Ví dụ tách thành hai ngưỡng: câu hỏi lịch chiếu và giá vé dưới 2 giây, câu hỏi đổi vé dưới 4 giây kèm dòng "đang kiểm tra vé của bạn".

> **Bẫy đề**
>
> Câu luyện thi có đúng tình huống các bên lo về độ trễ giữa dự án. Đáp án sai: dừng mọi việc phát triển để dồn toàn lực tối ưu độ trễ; nói độ trễ là giới hạn của mô hình ngôn ngữ, ngoài tầm kiểm soát của nhóm; thay sang model của hãng khác mà không đánh giá. Đáp án đúng là hai việc ở trên: **đưa số p50, p95 đo được so với ngưỡng SLA**, và **cùng các bên sửa định nghĩa SLA nếu ngưỡng không khả thi**.

Yêu cầu phát sinh cũng xử lý theo tinh thần đó. Gợi ý phim theo sở thích là một nhu cầu chính đáng, nhưng thêm vào giữa đợt chạy thử sẽ đẩy lùi ngày mở rộng. Cách làm: ghi nhận yêu cầu, nói rõ tác động lên phạm vi và tiến độ, rồi đưa các lựa chọn để người yêu cầu tự chọn: để sang đợt sau, bỏ bớt một việc khác, hoặc lùi ngày mở rộng.

**Sơ đồ**
1. **Yêu cầu phát sinh**: gợi ý phim theo sở thích
   ↓ _ghi nhận, nói rõ tác động lên phạm vi và tiến độ_
2. **Để sang đợt sau** **|** **Bỏ bớt một việc khác** **|** **Lùi ngày mở rộng**

> **Trong đề chọn gì**
>
> Câu luyện thi về yêu cầu thêm phạm vi lớn giữa chừng: chọn **ghi nhận, nói minh bạch tác động lên phạm vi và tiến độ, đưa các lựa chọn (hoãn, bớt việc khác, giãn tiến độ) để bên liên quan chọn**. Loại: từ chối thẳng không đưa lựa chọn; nhận vào mà không nói tác động; giấu yêu cầu khỏi đội triển khai.

## Vòng phản hồi có nhịp

Kỳ vọng không thống nhất một lần là xong. Lưu lượng, khách hàng, model đều thay đổi, nên giả định ban đầu cũng phải được xem lại.

Một buổi phản hồi có ích khi:

- Có chương trình họp tập trung, và tài liệu (bảng số đo, các cuộc chat mẫu) được gửi **trước** buổi họp để mọi người chuẩn bị.
- Quyết định và việc cần làm được ghi lại bằng văn bản, mỗi việc có người phụ trách và hạn.

Ngoài từng buổi họp, cả quy trình cần:

- **Nhịp xem lại cố định** cho kỳ vọng và giả định. Trong ví dụ: hai tuần một lần trong lúc chạy thử, mỗi tháng một lần sau khi mở rộng.
- **Giải quyết công khai** khi các bên có ý kiến khác nhau. Giám đốc vận hành muốn trợ lý chuyển cho nhân viên sớm, giám đốc marketing muốn trợ lý giữ khách lâu hơn. Đặt hai ý đó cạnh nhau, cùng số liệu, và chốt một quy tắc. Lờ đi cho buổi họp êm thì bất đồng sẽ quay lại ở lần sau.

> **Trong đề chọn gì**
>
> Hai câu luyện thi về vòng phản hồi. Buổi phản hồi: chọn **chương trình tập trung, gửi tài liệu trước, ghi quyết định và việc cần làm, chốt người phụ trách và hạn**; loại họp mở không chương trình, phát tài liệu ngay đầu buổi, kết thúc không ghi lại gì. Quy trình thống nhất kỳ vọng: chọn **nhịp xem lại định kỳ** và **giải quyết công khai các ý kiến khác nhau**; loại ghi hình gửi người vắng, đẩy mọi bất đồng lên người tài trợ phán quyết, luân phiên người chủ trì.

Một phần của nhịp xem lại là báo trước những thay đổi từ phía Anthropic. Docs về vòng đời model chia bốn trạng thái: đang dùng (Active), cũ (Legacy, không cập nhật nữa), sắp ngừng (Deprecated, đã có ngày ngừng và model thay thế), và đã ngừng (Retired, gọi tới là lỗi). Với model đã phát hành công khai, Anthropic báo qua email cho khách đang dùng ít nhất 60 ngày trước ngày ngừng. Trong ví dụ, nhóm ghi vào kế hoạch: ai nhận email đó, trong bao lâu báo cho các bên, và lịch chạy lại bộ kiểm thử với model thay thế. Trang trạng thái cũng nên có người theo dõi để báo sớm khi có sự cố thật.

**Sơ đồ**
1. **Active**: đang dùng
   ↓ _không cập nhật nữa_
2. **Legacy**: vẫn gọi được
   ↓ _đã có ngày ngừng và model thay thế. Email báo ít nhất 60 ngày trước ngày ngừng_
3. **Deprecated**: lúc này phải chạy lại bộ kiểm thử với model thay thế
   ↓ _tới ngày ngừng_
4. **Retired**: gọi tới là lỗi

## Phân biệt xuống cấp thật với dao động bình thường

Một tối chậm hay một câu trả lời sai chưa chắc là hệ thống xuống cấp. Model có tính ngẫu nhiên: cùng câu hỏi, chạy hai lần có thể ra hai kết quả. Bài viết về đánh giá agent của Anthropic phân biệt hai cách đo: tỉ lệ làm được ít nhất một lần trong k lần thử (`pass@k`) và tỉ lệ cả k lần đều làm được (`pass^k`). Với trợ lý khách hàng, khách mong lần nào cũng đúng, nên `pass^k` mới là con số đáng báo.

Trước khi báo động hay hứa sửa, kiểm vài điều:

- So trên cùng khoảng thời gian của SLA (28 ngày), không phải một buổi tối.
- So với mức nền đã đo khi bắt đầu, trên cùng bộ câu hỏi kiểm thử, chạy nhiều lần. Cách tính khoảng tin cậy cho các lần chạy có ở bài 4.3.
- Xem thay đổi có trùng với một sự kiện không: mở thêm rạp, đổi prompt, đổi model, lưu lượng tăng vọt.

1. **Số đo vượt ngưỡng trên cả khoảng thời gian của SLA?** → Vi phạm thật: làm đúng việc đã ghi trong SLA
2. **Lệch khỏi mức nền ngoài khoảng dao động của các lần chạy?** → Tìm nguyên nhân, báo các bên kèm số đo
3. **Chỉ một buổi hay vài cuộc chat lẻ?** → Ghi lại, theo dõi tiếp, chưa đổi hệ thống
- **Còn lại** → Báo trong buổi phản hồi định kỳ

> **Ý chính**
>
> SLA phải có chỉ số, ngưỡng, khoảng thời gian và việc phải làm khi vi phạm, và không thể mạnh hơn những gì Claude API cam kết nếu không có đường lùi. Khi các bên lo lắng, đưa số đo và cùng họ sửa mục tiêu; khi có yêu cầu phát sinh, đưa lựa chọn để họ quyết; giữ nhịp xem lại và giải quyết bất đồng công khai.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Define success criteria and build evaluations (Claude Docs)](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
3. [Service tiers (Claude Docs)](https://platform.claude.com/docs/en/api/service-tiers)
4. [Rate limits (Claude Docs)](https://platform.claude.com/docs/en/api/rate-limits)
5. [API errors (Claude Docs)](https://platform.claude.com/docs/en/api/errors)
6. [Troubleshoot Claude error messages (Claude Help Center)](https://support.claude.com/en/articles/12466728-troubleshoot-claude-error-messages)
7. [Model deprecations (Claude Docs)](https://platform.claude.com/docs/en/about-claude/model-deprecations)
8. [Demystifying evals for AI agents (Anthropic Engineering)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
