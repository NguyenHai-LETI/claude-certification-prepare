---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/3-5-rag-chunking-va-index
ngay_tai: 2026-11-27
tieu_de: Thiết kế pipeline RAG, chia chunk và đánh chỉ mục
---

Domain 3: Integration · Task 3.5

# Thiết kế pipeline RAG, chia chunk và đánh chỉ mục

Khi nào cần RAG, chia chunk theo hình dạng dữ liệu, contextual retrieval giảm truy xuất hỏng ra sao, và chọn embedding, chỉ mục cho một pipeline RAG.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Quyết định khi nào đưa cả kho tài liệu vào prompt thay vì dựng RAG
- Mô tả các bước của pipeline RAG từ nạp tài liệu tới dựng prompt
- Chọn cách chia chunk theo loại tài liệu
- Hiểu contextual retrieval, và đánh chỉ mục bằng embedding lẫn BM25
- Biết chỗ cần xem đầu tiên khi RAG bắt đầu trả lời sai

RAG (**retrieval-augmented generation**) là cách cho Claude trả lời dựa trên tài liệu của bạn: tìm những đoạn liên quan rồi đưa vào prompt. Chất lượng câu trả lời phụ thuộc rất nhiều vào khâu tìm. Claude không thể trả lời đúng từ một đoạn tài liệu sai hay thiếu.

Bài này giúp bạn trả lời: có cần RAG không, chia tài liệu thành đoạn (**chunk**) thế nào, và đánh chỉ mục (**index**) ra sao để tìm đúng?

## Ví dụ xuyên suốt: kho tài liệu của một hãng thiết bị y tế

Một hãng sản xuất máy theo dõi bệnh nhân muốn trợ lý trả lời câu hỏi của kỹ thuật viên bệnh viện. Kho tài liệu gồm ba loại:

1. **Sổ tay vận hành và bảo trì**: mỗi cuốn vài trăm trang, chia chương, mục, bảng.
2. **Phiếu bảo hành và phiếu sự cố**: hàng chục nghìn bản ghi ngắn, mỗi phiếu vài dòng.
3. **Đặc tả firmware**: mã nguồn và tài liệu đặc tả phân cấp theo module.

Kỹ thuật viên hỏi kiểu "máy báo lỗi E-417 khi đo SpO2 thì làm gì", có mã lỗi chính xác lẫn mô tả bằng lời.

## Có cần RAG không

Bài viết về contextual retrieval của Anthropic nói: nếu kho kiến thức nhỏ hơn khoảng **200.000 token** (khoảng 500 trang), có thể đưa cả kho vào prompt, không cần RAG. Kết hợp prompt caching, bài viết nói độ trễ giảm hơn 2 lần và chi phí giảm tới 90% cho phần dùng lại.

Kho của hãng thiết bị lớn hơn nhiều, nên cần RAG. Nhưng nếu một trợ lý khác chỉ cần một cuốn sổ tay 300 trang, đưa cả cuốn vào prompt có cache thường đơn giản và chính xác hơn dựng cả một pipeline.

## Các bước của pipeline

| Giai đoạn | Việc |
| --- | --- |
| Nạp tài liệu | Đọc file, tách văn bản và bảng, gắn metadata (nguồn, phiên bản, ngày, quyền truy cập) |
| Chia chunk | Cắt thành đoạn theo hình dạng tài liệu |
| Đánh chỉ mục | Tạo embedding cho mỗi chunk và lưu vào vector store; đồng thời dựng chỉ mục từ khoá (BM25) |
| Truy xuất | Nhận câu hỏi, tìm trên cả hai chỉ mục, gộp kết quả, có thể xếp hạng lại (rerank) |
| Dựng prompt | Đưa các chunk tìm được, kèm nguồn, vào prompt để Claude trả lời và trích dẫn |
| Làm mới | Khi tài liệu đổi, chunk lại, embed lại, cập nhật chỉ mục |

Metadata về quyền truy cập phải gắn từ lúc nạp, để khâu truy xuất lọc được theo người hỏi (bài 3.2).

Ở bước dựng prompt, nếu bạn tự truy xuất từ kho riêng (phiếu sự cố, tài liệu nội bộ) và muốn Claude trích nguồn, hãy dùng **search results**. Tool truy xuất của bạn đóng mỗi đoạn tìm được thành một khối `search_result`: `source` và `title` là bắt buộc, `content` là mảng khối text. Docs nói nhờ vậy Claude trích dẫn nội dung của bạn như cách nó trích kết quả web search, và mỗi trích dẫn mang đúng `source` và `title` bạn đã cấp. Citations mặc định tắt nên cần đặt `citations.enabled`, và mọi `search_result` trong một yêu cầu phải cùng cài đặt này. Web search thì nhắm vào nội dung trên web, còn web fetch đọc trang hoặc PDF theo URL và từ chối địa chỉ riêng, nên cả hai không phải đường cho kho dữ liệu riêng.

## Chia chunk theo hình dạng dữ liệu

Bài viết về contextual retrieval nói kích thước chunk, ranh giới chunk và độ chồng lấn giữa các chunk đều ảnh hưởng tới kết quả truy xuất. Không có một kích thước đúng cho mọi kho. Câu luyện thi ghép cách chia với loại tài liệu như sau:

| Loại tài liệu | Cách chia hợp | Trong ví dụ |
| --- | --- | --- |
| Tài liệu dài có cấu trúc | Chia theo ngữ nghĩa ở ranh giới đoạn hay điều khoản; chia phân cấp theo chương, mục | Sổ tay vận hành |
| Bản ghi ngắn, rời rạc | Mỗi bản ghi một chunk; hoặc chia cố định có chồng lấn khi các bản ghi dài gần bằng nhau | Phiếu bảo hành, phiếu sự cố |
| Code hoặc đặc tả phân cấp | Chia theo hàm hoặc theo mục; chia theo cây, bám cấu trúc code hay đặc tả | Firmware |

## Contextual retrieval: chunk mất ngữ cảnh

Một chunk tách ra khỏi tài liệu thường mất ngữ cảnh. Bài viết lấy ví dụ một chunk chỉ ghi doanh thu tăng 3% so với quý trước, mà không nói công ty nào, quý nào. Trong ví dụ của hãng thiết bị, một chunk "Thay cảm biến theo bước 4.2" không nói đó là model máy nào.

**Contextual retrieval** sửa bằng cách, trước khi embed, nhờ Claude viết một đoạn ngữ cảnh ngắn (thường 50 tới 100 token) cho mỗi chunk dựa trên cả tài liệu, rồi ghép vào đầu chunk. Đoạn ngữ cảnh được đưa vào **cả** embedding **lẫn** chỉ mục BM25. Kết quả trong bài viết, đo bằng tỉ lệ không tìm được đoạn cần trong 20 đoạn đầu:

**Sơ đồ**
1. **Chunk gốc**: "Thay cảm biến theo bước 4.2", không nói model máy nào
   ↓ _Claude đọc cả tài liệu, viết đoạn ngữ cảnh 50–100 token cho riêng chunk này_
2. **Chunk có ngữ cảnh**: đoạn ngữ cảnh ghép vào đầu chunk
   ↓ _đưa vào cả hai chỉ mục_
3. **Embedding** **|** **BM25**

| Cách | Giảm tỉ lệ truy xuất hỏng |
| --- | --- |
| Contextual embeddings | 35% |
| Contextual embeddings + contextual BM25 | 49% |
| Thêm bước rerank | 67% |

Chi phí tạo ngữ cảnh được giữ thấp nhờ prompt caching: cả tài liệu được cache một lần rồi dùng lại cho mọi chunk của nó; bài viết ước tính khoảng 1,02 USD cho mỗi triệu token tài liệu. Hướng dẫn trong Cookbook nhấn mạnh phải xử lý **lần lượt từng tài liệu**, không trộn ngẫu nhiên chunk của nhiều tài liệu, thì cache mới trúng.

> **Bẫy đề**
>
> Ghép một bản tóm tắt chung của cả tài liệu vào mọi chunk nghe giống contextual retrieval, nhưng bài viết nói cách đó cho lợi rất ít. Ngữ cảnh phải viết riêng cho từng chunk. Và chỉ thêm ngữ cảnh vào embedding mà bỏ quên BM25 là bỏ lỡ một phần lợi ích.

## Trích dẫn đúng câu nguồn: Citations

Khi bên kiểm toán cần biết câu trả lời lấy từ **đúng câu nào**, dùng tính năng **Citations** của Messages API. Bạn đưa tài liệu vào khối `document` với `citations: {enabled: true}`; Claude trả về các trích dẫn kèm `cited_text` và vị trí (chỉ số ký tự với văn bản thuần, số trang với PDF). Tài liệu được chia thành câu nên Claude trích được một câu hoặc vài câu liền nhau.

Đừng nhầm với ba thứ gần giống. **Search results** là trích dẫn theo từng khối kết quả tìm kiếm bạn tự đưa vào, kèm nguồn và tiêu đề bạn gắn. **Files API** chỉ để khỏi gửi lại file. **Token counting** chỉ đếm token trước khi gửi.

## Embedding và chỉ mục

- **Anthropic không có model embedding riêng.** Docs gợi ý Voyage AI, nhưng khuyên tự đánh giá nhiều nhà cung cấp. Voyage có model chung, model cho code, cho pháp lý, cho tài chính, và một model tạo vector cho chunk mang sẵn ngữ cảnh của cả tài liệu.
- **Ghi rõ loại đầu vào.** Docs dặn khi dùng cho truy xuất, đặt `input_type` là `document` khi embed chunk và `query` khi embed câu hỏi; không bỏ trống.
- **Hai loại chỉ mục bổ sung nhau.** Bài viết nói embedding giỏi bắt ý nghĩa nhưng có thể lỡ những chỗ khớp chính xác; BM25 đặc biệt hiệu quả với mã định danh và thuật ngữ kỹ thuật. Câu hỏi có "E-417" cần BM25 (bài 3.6).
- **Cùng một model cho chunk và câu hỏi.** Đổi model embedding mà không embed lại cả kho thì vector của câu hỏi và của chunk không còn so được với nhau.

Ghép cả bài, kho của hãng thiết bị đi qua pipeline như sau:

**Sơ đồ**
1. **Sổ tay vận hành** **|** **Phiếu sự cố** **|** **Đặc tả firmware**
   ↓ _chia theo hình dạng tài liệu_
2. **Theo chương, mục** **|** **Mỗi phiếu một chunk** **|** **Theo hàm, theo cây**
   ↓ _thêm ngữ cảnh riêng cho từng chunk_
3. **Chunk có ngữ cảnh và metadata quyền truy cập**
   ↓ _đánh chỉ mục hai kiểu_
4. **Embedding**: bắt ý nghĩa **|** **BM25**: bắt mã như E-417
   ↓ _có câu hỏi: tìm cả hai, gộp, có thể rerank_
5. **Claude trả lời, trích dẫn chunk đã dùng**

> **Trong đề chọn gì**
>
> Câu hỏi mẫu Anthropic công bố: hệ thống RAG bỗng trả lời tự tin nhưng sai sau một lần làm mới tài liệu, trong khi độ trễ và phiên bản model không đổi. Chỗ xem đầu tiên: **khâu truy xuất và đánh chỉ mục** đang trả về chunk không liên quan hoặc cũ, ví dụ đánh chỉ mục lại bị hỏng hay embedding không khớp. Các đáp án sai (trọng số model tự đổi, temperature quá thấp, context window bị thu nhỏ) không phải là thứ bị kích hoạt bởi việc làm mới tài liệu.

Bài viết cũng khuyên luôn chạy đánh giá: đo tỉ lệ tìm đúng đoạn trên một bộ câu hỏi có đáp án sẵn mỗi khi đổi cách chia, đổi model embedding hay làm mới kho.

> **Ý chính**
>
> Kho nhỏ thì đưa cả vào prompt có cache. Kho lớn thì chia chunk theo hình dạng tài liệu, thêm ngữ cảnh riêng cho từng chunk, đánh chỉ mục bằng cả embedding và BM25, và khi RAG sai sau khi làm mới tài liệu thì xem khâu truy xuất trước.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 3](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Introducing Contextual Retrieval (Anthropic)](https://www.anthropic.com/engineering/contextual-retrieval)
3. [Embeddings (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/embeddings)
4. [Contextual embeddings guide (Claude Cookbook)](https://platform.claude.com/cookbook/capabilities-contextual-embeddings-guide)
5. [Prompt caching (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
6. [Search results (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/search-results)
7. [Citations (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/citations)
8. [Web fetch tool (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool)
