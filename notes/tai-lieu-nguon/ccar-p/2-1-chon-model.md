---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-1-chon-model
ngay_tai: 2026-11-27
tieu_de: Chọn model Claude theo đánh đổi
---

Domain 2: Claude Models, Prompting & Context Engineering · Task 2.1

# Chọn model Claude theo đánh đổi

Bốn model Claude hiện nay khác nhau ra sao, bắt đầu với model nào, so model bằng chi phí trên mỗi việc xong, và khi nào dùng nhiều model cùng lúc.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Nắm vị trí của Fable, Opus, Sonnet và Haiku về năng lực, tốc độ và giá
- Biết phải làm gì trước khi đem model ứng viên ra thử
- So model bằng chi phí trên mỗi việc hoàn thành, không bằng giá mỗi token
- Chỉnh effort trước khi đổi model, và chia lưu lượng cho nhiều model khi hợp lý

"Dùng model mạnh nhất cho chắc" và "dùng model rẻ nhất cho tiết kiệm" đều là cách chọn sai. Model đúng là model rẻ nhất mà vẫn đạt chất lượng bạn cần, và chỉ biết được bằng cách thử trên chính dữ liệu của mình.

Bài này giúp bạn trả lời: chọn model Claude cho một khối việc dựa vào đâu, bắt đầu từ model nào, và so sánh các model ra sao?

## Ví dụ xuyên suốt: nền tảng học tiếng Anh trực tuyến

Một nền tảng học tiếng Anh có ba khối việc cần dùng Claude:

1. **Gắn nhãn lỗi** cho khoảng 200.000 câu trả lời ngắn mỗi ngày (sai thì, sai giới từ, sai chính tả). Nhãn có sẵn danh sách, học viên chờ kết quả ngay trên màn hình.
2. **Gia sư hội thoại**: học viên chat với gia sư ảo, cần trả lời tự nhiên và nhanh.
3. **Soạn lại giáo trình**: một agent viết lại 40 bài học theo khung trình độ mới, đối chiếu chéo giữa các bài, chạy hàng giờ, mỗi tháng một lần.

## Bốn model hiện nay

| Model | Docs mô tả | Tốc độ | Giá input / output mỗi triệu token |
| --- | --- | --- | --- |
| Claude Fable 5.1 | Suy luận khó và việc agent chạy rất dài | Chậm hơn | $10 / $50 |
| Claude Opus 5.5 | Agent viết code chạy lâu và công việc tri thức; điểm bắt đầu cho đa số khối việc | Vừa | $4 / $20 |
| Claude Sonnet 5.5 | Cân bằng tốt nhất giữa tốc độ và trí tuệ | Nhanh | $2 / $10 |
| Claude Haiku 5.5 | Việc khối lượng lớn, nhạy về độ trễ như phân loại, trích xuất, định tuyến | Nhanh nhất | $0,10 / $0,50 (prompt tới 100.000 token; dài hơn thì giá cao hơn) |

Cả bốn đều có context window 1 triệu token và đầu ra tối đa 128.000 token, nên kích thước context không phải là thứ phân biệt chúng. Muốn đọc giới hạn và khả năng của từng model bằng code, dùng Models API: nó trả về số token vào tối đa, số token ra tối đa và một object `capabilities` cho từng model.

Model nặng hơn không chỉ đắt hơn mà còn chậm hơn, và giới hạn tốc độ gọi API (rate limit) được tính riêng cho từng nhóm model. Ví dụ ở hạng tài khoản thấp nhất, Fable có hạn mức token đầu vào mỗi phút thấp hơn hẳn các model còn lại.

> **Bẫy đề**
>
> **Fast mode** không phải là một model nhỏ hơn. Nó chạy đúng model đó (hiện là Claude Opus 5.5) với cấu hình suy luận nhanh hơn, tốc độ sinh chữ tới 2,5 lần, không đổi trí tuệ, nhưng giá token gấp đôi. Chọn fast mode là trả thêm tiền để nhanh hơn, không phải để rẻ hơn.

## Bắt đầu từ đâu

Docs của Anthropic nêu bốn tiêu chí khi chọn: năng lực, tốc độ, chi phí, và mức **effort** (thông số điều chỉnh model bỏ bao nhiêu công cho mỗi câu trả lời). Docs đưa ra hai cách bắt đầu:

| Cách | Làm thế nào | Hợp khi |
| --- | --- | --- |
| Bắt đầu nhỏ | Dùng Haiku 5.5, thử kỹ, chỉ nâng lên khi thấy thiếu năng lực cụ thể | Việc khối lượng lớn, kết quả kiểm được |
| Bắt đầu mạnh | Dùng Opus 5.5, tối ưu prompt, rồi hạ effort hoặc chuyển xuống model rẻ hơn dần | Việc phức tạp; docs nói đa số khối việc bắt đầu với Opus 5.5 |

Dù chọn cách nào, docs nhấn mạnh có một bộ đánh giá tốt là bước quan trọng nhất: tạo bộ test cho đúng việc của bạn, chạy với prompt và dữ liệu thật, so độ chính xác, chất lượng và các ca khó, rồi cân với chi phí.

Thứ tự công việc vì vậy là:

1. Xác định mức chất lượng, độ trễ chấp nhận được và khối lượng dự kiến.
2. Chọn model ứng viên theo yêu cầu và năng lực đã biết.
3. Chạy thử trên mẫu dữ liệu đại diện.
4. Chọn model nhẹ nhất đạt chuẩn một cách ổn định.
5. Thử lại khi có phiên bản model mới.

**Sơ đồ**
1. **Đặt mức chất lượng, độ trễ, khối lượng**
   ↓ _rồi mới_
2. **Chọn model ứng viên**: theo yêu cầu và năng lực đã biết
   ↓ _hai việc trên phải xong trước khi chạy thử_
3. **Chạy thử trên mẫu đại diện**: prompt và dữ liệu thật
   ↓ _so độ chính xác và chi phí trên mỗi việc xong_
4. **Chọn model nhẹ nhất đạt chuẩn ổn định**

> **Trong đề chọn gì**
>
> Đề hỏi việc nào phải xong **trước khi** chạy thử model trên mẫu đại diện: chọn "xác định mức chất lượng, độ trễ chấp nhận được, khối lượng" và "chọn model ứng viên theo yêu cầu". Các việc như chọn model nhẹ nhất đạt chuẩn, thử lại khi có phiên bản mới, hay ký duyệt kế hoạch triển khai đều cần kết quả thử nên đến sau.

Docs còn có một câu đáng nhớ: chỉnh effort thường là đòn bẩy tốt hơn đổi model. Trước khi chuyển sang model khác, thử hạ hoặc nâng effort trên model đang dùng.

## So bằng chi phí trên mỗi việc xong

Docs về tối ưu chi phí khuyên so model theo **chi phí trên mỗi việc hoàn thành**, không theo giá mỗi token. Một model rẻ mỗi token nhưng làm hỏng nhiều thì bạn vẫn trả tiền cho lần hỏng và lần làm lại. Docs khuyên so trên phần khó nhất của khối việc, khoảng một phần mười việc khó nhất, vì hoá đơn thường do những việc model rẻ làm hỏng quyết định.

Áp vào ví dụ:

- **Gắn nhãn lỗi**: nhãn có sẵn, cần ít suy luận, khối lượng lớn, học viên đang chờ. Haiku 5.5 hợp nhất. Kết quả kiểm được nên dễ đo tỉ lệ đúng.
- **Gia sư hội thoại**: cần trả lời tự nhiên và nhanh. Sonnet 5.5 là ứng viên hợp lý để thử trước.
- **Soạn lại giáo trình**: việc agent dài, đối chiếu nhiều bài, mỗi tháng một lần nên không ai chờ. Opus 5.5 là điểm bắt đầu; nếu chạy ở effort cao nhất mà vẫn chưa đạt thì mới cân nhắc Fable 5.1.

1. **Khối lượng lớn, nhãn rõ, cần trả lời ngay?** → Thử Haiku 5.5 trước
2. **Việc hằng ngày cần cân tốc độ và chất lượng?** → Thử Sonnet 5.5
3. **Việc agent dài hoặc phức tạp?** → Bắt đầu với Opus 5.5
4. **Opus 5.5 ở effort cao nhất vẫn chưa đạt?** → Thử Fable 5.1
- **Còn lại** → Chưa chắc: bắt đầu với Opus 5.5, có bộ test rồi mới hạ effort hoặc đổi model rẻ hơn

> **Bẫy đề**
>
> Với bộ lọc nội dung khối lượng lớn, độ trễ chặt, nhãn rõ ràng, các đáp án sai trong câu luyện thi là: dùng Opus vì "mọi quyết định cần suy luận sâu nhất"; dùng Sonnet vì "model lớn được ưu tiên dù độ trễ chặt"; bật thinking sâu cho mọi yêu cầu. Đáp án đúng là Haiku, vì độ trễ và chi phí của nó hợp với việc phân loại khối lượng lớn cần ít suy luận.

## Dùng nhiều model trong một hệ thống

Không bắt buộc một model cho cả hệ thống. Docs mô tả các cách ghép model rẻ với model mạnh để phần lớn token tính theo giá thấp:

- **Định tuyến theo độ khó**: câu thường đi vào model nhẹ, câu cần năng lực cao mới vào model nặng.
- **Advisor**: model rẻ chạy vòng lặp và hỏi ý model mạnh khi cần lập kế hoạch hay sửa hướng.
- **Orchestrator**: model mạnh điều phối, giao phần việc khối lượng lớn cho các model rẻ hơn.

Trong ví dụ, gia sư hội thoại có thể để câu hỏi đơn giản ("từ này nghĩa là gì") cho Haiku 5.5 và câu cần giải thích ngữ pháp dài cho Sonnet 5.5. Định tuyến như vậy giảm cả chi phí lẫn độ trễ cho phần lớn lưu lượng.

**Sơ đồ**
1. **Câu của học viên trong gia sư hội thoại**
   ↓ _định tuyến theo độ khó_
2. **"Từ này nghĩa là gì"**: Haiku 5.5, nhanh và rẻ **|** **Câu cần giải thích ngữ pháp dài**: Sonnet 5.5

> **Trong đề chọn gì**
>
> Câu luyện thi chấm đúng: model suy luận nặng tốn hạn mức và chạy chậm hơn model nhẹ; đánh giá trên mẫu đại diện của khối việc thật là căn cứ để chốt model; chia tầng (model nhẹ cho lưu lượng thường, model nặng cho phần cần năng lực). Chấm sai: model mạnh nhất luôn là lựa chọn đúng; chọn theo phiên bản mới công bố gần nhất; bỏ qua khác biệt hành vi giữa các phiên bản khi prompt đã chạy tốt trên một phiên bản.

> **Ý chính**
>
> Đặt mức chất lượng, độ trễ và khối lượng trước, thử trên dữ liệu thật, so bằng chi phí trên mỗi việc xong, chỉnh effort trước khi đổi model, và thử lại khi có model mới.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Models overview (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/overview)
3. [Choosing the right model (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
4. [Optimizing for cost and intelligence (Claude Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
5. [Rate limits (Claude Docs)](https://platform.claude.com/docs/en/api/rate-limits)
6. [Fast mode (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/fast-mode)
