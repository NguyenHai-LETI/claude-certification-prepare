---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-6-chien-luoc-truy-xuat
ngay_tai: 2026-11-27
tieu_de: Chọn chiến lược truy xuất theo dữ liệu và kiểu câu hỏi
---

Domain 3: Integration · Task 3.6

# Chọn chiến lược truy xuất theo dữ liệu và kiểu câu hỏi

Khớp cách truy xuất với dữ liệu và kiểu câu hỏi, từ cả kho trong prompt, embedding, BM25, truy vấn có cấu trúc, hybrid, rerank tới để agent tự tìm.

- 7 phút đọc
- Đối chiếu docs 02/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Ghép mỗi cách truy xuất với loại dữ liệu và kiểu câu hỏi nó hợp
- Biết vì sao hybrid search tốt hơn từng cách riêng, và rerank đổi lại gì
- Dùng truy vấn có cấu trúc cho câu hỏi lọc và tổng hợp trên dữ liệu bảng
- Chọn giữa truy xuất tính trước và để agent tự tìm bằng tool lúc chạy

Không có cách truy xuất nào thắng ở mọi nơi. Tìm "chính sách đổi hàng khi khách đã mặc thử" cần hiểu ý; tìm "SKU AO-2291-XL" cần khớp từng ký tự; hỏi "tháng trước chi nhánh nào bán áo khoác nhiều nhất" thì chẳng cần tìm đoạn văn nào cả, mà cần một câu truy vấn trên bảng số liệu.

Bài này giúp bạn trả lời: với một loại dữ liệu và một kiểu câu hỏi, chọn cách truy xuất nào?

## Ví dụ xuyên suốt: trợ lý nội bộ của một chuỗi thời trang

Một chuỗi bán lẻ thời trang làm trợ lý cho nhân viên văn phòng. Dữ liệu gồm:

1. **Chính sách và quy trình**: vài trăm trang văn bản (đổi trả, bảo hành, khuyến mãi).
2. **Danh mục sản phẩm**: 80.000 mã SKU kèm mô tả ngắn.
3. **Dữ liệu bán hàng**: kho dữ liệu SQL có bảng doanh số theo ngày, chi nhánh, sản phẩm.
4. **Mã nguồn hệ thống bán hàng**: đội kỹ thuật sửa hằng ngày.

## Câu hỏi đầu tiên: có cần truy xuất không

Bài viết về contextual retrieval của Anthropic nói kho kiến thức dưới khoảng 200.000 token có thể đưa cả vào prompt, kết hợp prompt caching. Bộ chính sách vài trăm trang nằm quanh ngưỡng này: nếu vừa, đưa cả vào prompt có cache thường đơn giản và đủ tốt hơn dựng một chỉ mục vector.

## Khớp cách truy xuất với dữ liệu

| Cách | Hợp với | Trong ví dụ |
| --- | --- | --- |
| Embedding (**dense retrieval**) | Câu hỏi diễn đạt khác chữ trong tài liệu, văn bản tự do | "Khách mặc thử rồi có đổi được không" |
| Từ khoá (**sparse**, BM25) | Mã định danh, từ hiếm, thuật ngữ chính xác | "SKU AO-2291-XL", mã lỗi máy POS |
| Truy vấn có cấu trúc (**structured query**) | Lọc và tổng hợp trên cơ sở dữ liệu có schema và chỉ mục | Doanh số áo khoác theo chi nhánh tháng trước |
| **Hybrid** (embedding + BM25) | Câu hỏi trộn ý nghĩa và mã chính xác | "Áo AO-2291 có được đổi size khi đang khuyến mãi không" |
| Cả kho trong prompt | Kho nhỏ, đọc nhiều lần | Bộ chính sách nếu dưới ngưỡng |
| Agent tự tìm bằng tool lúc chạy | Dữ liệu đổi liên tục | Mã nguồn đang sửa hằng ngày |

Với dữ liệu bán hàng, cách đúng là cho Claude một tool chạy truy vấn SQL (chỉ đọc, giới hạn đúng bảng được phép), không phải embed từng dòng doanh số rồi tìm theo nghĩa.

Gặp một kiểu câu hỏi, hỏi lần lượt:

1. **Kho nhỏ dưới khoảng 200.000 token, đọc nhiều lần?** → Đưa cả kho vào prompt, có cache
2. **Dữ liệu đổi liên tục?** → Để agent tự tìm bằng tool lúc chạy
3. **Cần lọc, tổng hợp trên bảng có schema?** → Truy vấn có cấu trúc, tool SQL chỉ đọc
4. **Câu hỏi trộn ý nghĩa và mã chính xác?** → Hybrid
5. **Chỉ có mã định danh, từ hiếm?** → BM25
- **Còn lại** → Văn bản tự do, diễn đạt khác chữ trong tài liệu: embedding

> **Trong đề chọn gì**
>
> Câu luyện thi chấm đúng: truy xuất bằng embedding hợp để bắt ý được diễn đạt khác đi trên văn bản tự do; truy xuất theo từ khoá bắt mã định danh và từ hiếm đáng tin hơn embedding đơn thuần; truy vấn có cấu trúc hợp cho việc lọc và tổng hợp trên cơ sở dữ liệu quan hệ. Chấm sai: hybrid giống hệt embedding và có cùng đặc tính tìm được; lấy mẫu ngẫu nhiên từ kho dữ liệu là cách truy xuất hợp lý cho hỏi đáp thật.

## Hybrid search và rerank

Bài viết về contextual retrieval nói embedding có thể lỡ những chỗ khớp chính xác, còn BM25 đặc biệt hiệu quả với mã định danh. Hybrid chạy cả hai rồi gộp kết quả. Hướng dẫn trong Claude Cookbook lấy 150 kết quả đầu từ mỗi bên, gộp bằng cách xếp hạng có trọng số (mặc định nghiêng về embedding), và trọng số này **chỉnh được** theo tỉ lệ câu hỏi chứa mã và câu hỏi diễn đạt bằng lời trong dữ liệu của bạn.

**Rerank** là bước xếp hạng lại: lấy nhiều ứng viên (ví dụ 150), dùng một model xếp hạng chọn ra số ít tốt nhất (ví dụ 20) đưa vào prompt. Bài viết nói rerank giảm thêm tỉ lệ truy xuất hỏng, nhưng có đánh đổi: xếp hạng lại nhiều đoạn thì tốt hơn, ít đoạn thì nhanh và rẻ hơn. Bài viết cũng thấy đưa 20 đoạn vào prompt tốt hơn 10 hay 5 trong thử nghiệm của họ. Theo hướng dẫn Cookbook, chỉ thêm ngữ cảnh cho chunk (contextual embeddings) đã cho tỉ lệ hiệu quả trên chi phí tốt nhất; rerank dành cho khi cần độ chính xác cao nhất.

**Sơ đồ**
1. **"Áo AO-2291 có được đổi size khi đang khuyến mãi không"**
   ↓ _tìm ở cả hai_
2. **Embedding**: 150 kết quả đầu **|** **BM25**: 150 kết quả đầu
   ↓ _gộp bằng xếp hạng có trọng số_
3. **Danh sách ứng viên**: ví dụ 150 đoạn
   ↓ _rerank: model xếp hạng chọn số ít tốt nhất_
4. **Ví dụ 20 đoạn**: đưa vào prompt

> **Bẫy đề**
>
> "Embedding hiểu ý nên tìm được mọi thứ" là sai với câu hỏi chứa mã chính xác. Một câu hỏi về "AO-2291" có thể trả về áo AO-2219 vì vector gần nhau. Dữ liệu nhiều mã định danh cần BM25 trong hybrid.

## Truy xuất tính trước hay để agent tự tìm

Bài viết về context engineering của Anthropic phân biệt hai cách:

- **Truy xuất tính trước**: đánh chỉ mục sẵn, tìm và đưa vào prompt trước khi gọi model. Nhanh, nhưng chỉ mục có thể cũ.
- **Truy xuất đúng lúc** (**just-in-time**): agent giữ các định danh nhẹ (đường dẫn file, câu truy vấn đã lưu, đường link) và dùng tool để nạp dữ liệu khi cần. Luôn mới, nhưng bài viết nói khám phá lúc chạy chậm hơn dùng dữ liệu tính sẵn, và cần tool tốt để agent không phí context.

Bài viết lấy Claude Code làm ví dụ cho cách **kết hợp**: file CLAUDE.md được nạp sẵn từ đầu, còn code thì agent tự tìm bằng glob và grep khi cần. Bài viết cũng nói cách kết hợp hợp với nội dung ít thay đổi, như tài liệu pháp lý hay tài chính.

Trong ví dụ: mã nguồn đổi hằng ngày, chỉ mục vector dựng mỗi đêm sẽ luôn trễ một ngày; để agent tìm trực tiếp bằng tool tìm file và tìm chữ. Bộ chính sách ít đổi thì nạp sẵn.

**Sơ đồ**
1. **Bộ chính sách**: ít đổi **|** **Mã nguồn**: đổi hằng ngày
   ↓ _chọn cách nạp_
2. **Nạp sẵn trước khi gọi model**: nhanh **|** **Agent tự tìm bằng tool tìm file, tìm chữ**: luôn mới, chậm hơn

> **Ý chính**
>
> Ý nghĩa thì dùng embedding, mã chính xác thì dùng BM25, lọc và tổng hợp thì dùng truy vấn có cấu trúc, trộn lẫn thì dùng hybrid. Kho nhỏ thì đưa cả vào prompt; dữ liệu đổi liên tục thì để agent tự tìm bằng tool.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Introducing Contextual Retrieval (Anthropic)](https://www.anthropic.com/engineering/contextual-retrieval)
3. [Contextual embeddings guide (Claude Cookbook)](https://platform.claude.com/cookbook/capabilities-contextual-embeddings-guide)
4. [Effective context engineering for AI agents (Anthropic)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
5. [Embeddings (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/embeddings)
