---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-4-truy-xuat-va-grounding
ngay_tai: 2026-11-27
tieu_de: Truy xuất và grounding ở quy mô lớn - đo theo tầng, chunk, hybrid search, rerank, trích dẫn
---

Domain 2: Production Integration, Reliability, and Knowledge Grounding · Task 2.4

# Truy xuất và grounding ở quy mô lớn - đo theo tầng, chunk, hybrid search, rerank, trích dẫn

Chẩn đoán lỗi truy xuất theo từng tầng, chọn RAG hay agentic search, sửa chunk, embedding, hybrid search, rerank, rồi buộc câu trả lời có trích dẫn.

- 18 phút đọc
- Đối chiếu docs 21/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Đo truy xuất riêng với câu trả lời cuối để biết lỗi nằm ở tầng nào trước khi sửa
- Chọn giữa đưa cả kho tài liệu vào prompt, RAG, agentic search hay kết hợp, theo kích thước và độ thay đổi của dữ liệu
- Sửa chunk mất ngữ cảnh bằng contextual retrieval, chọn embedding, thêm BM25 và rerank
- Trả về tài liệu của mình dưới dạng search_result để có trích dẫn, và biết các giới hạn của citations
- Thiết kế cách nói "không đủ thông tin" và tín hiệu độ tin cậy cho câu trả lời

Một trợ lý trả lời dựa trên tài liệu nội bộ thường chạy qua bốn tầng. Đầu tiên, tài liệu được cắt thành từng đoạn nhỏ gọi là chunk. Tiếp theo, hệ thống tìm những chunk gần với câu hỏi, rồi xếp hạng chúng. Cuối cùng, Claude đọc các chunk đó và viết câu trả lời. Tầng nào cũng có thể hỏng. Chunk có thể bị cắt mất nghĩa, bước tìm có thể bỏ sót chunk đúng, bước xếp hạng có thể đẩy chunk đúng xuống dưới, và câu trả lời có thể không bám vào chunk. Sửa prompt chỉ chữa được tầng cuối cùng.

Bài này trả lời bốn câu hỏi. Làm sao đo để biết lỗi nằm ở tầng nào? Khi nào nên dùng RAG, tức tìm sẵn các đoạn liên quan rồi đưa vào prompt, và khi nào nên để agent tự đi tìm? Mỗi tầng sửa bằng cách nào? Và làm sao để câu trả lời có trích dẫn, biết nói "không đủ thông tin" khi tài liệu không có?

Tên task trong đề là **Retrieval and Knowledge Grounding at Scale**. Nó gồm việc đánh giá kiến trúc truy xuất cho ứng dụng trả lời dựa trên tài liệu, như cân nhắc giữa agentic search và RAG (**agentic search versus RAG tradeoffs**), chiến lược chia chunk và embedding (**chunking and embedding strategy**), **hybrid search** và **reranking**. Nó cũng gồm các cách giữ câu trả lời bám tài liệu (**grounding practices**) như trích dẫn nguồn, nói rõ khi không chắc và tín hiệu độ tin cậy, cùng việc chẩn đoán lỗi truy xuất theo từng tầng (**diagnosing retrieval-quality failures by stage**). Nếu muốn xem RAG từ phía thiết kế hệ thống, tức cách dựng index và chọn chiến lược truy xuất, hãy đọc thêm bài 3.5 và bài 3.6 của CCAR-P.

**Sơ đồ: Mỗi tầng đo bằng chỉ số riêng và hỏng theo kiểu riêng, nên phải đo từng tầng trước khi sửa**
_Bản đồ bài: bốn tầng của pipeline RAG, agentic search và grounding_

- **RAG: TÌM SẴN MỘT LẦN RỒI ĐƯA VÀO PROMPT**
- **Chunking**: thêm ngữ cảnh
- vào từng chunk
- đo: đọc mẫu chunk
- 1. **Retrieval**: embedding + BM25
- = hybrid search
- đo: recall@k
- 2. **Reranking**: lấy rộng, rồi giữ
- vài chunk tốt nhất
- đo: precision, MRR
- 3. mất ngữ cảnh,
- cắt ngang bảng
- sót mã phụ tùng,
- nhầm chunk na ná
- chunk đúng bị đẩy
- xuống dưới
- bịa khi thiếu
- tài liệu
- **Generation**: search_result
- có citations
- đo: LLM-as-judge
- 4. **AGENTIC SEARCH: THAY TẦNG 1–3, HOẶC CHẠY CÙNG RAG**
- **Agent tự gọi tool khi cần**: truy vấn bảng, web search, glob, grep
- **Grounding**: source citation
- uncertainty
- confidence signals
- **Chẩn đoán theo tầng: chunk đúng có lọt top k không?**: Chưa lọt thì sửa tầng 1–3. Đã lọt mà vẫn sai thì sửa tầng 4 bằng grounding.
- kiểu hỏng hay gặp của tầng ngay trên
- đầu ra đưa sang bước sau
- cách chữa

## Ví dụ xuyên suốt: trợ lý tra cứu của một công ty bảo dưỡng máy bay

Một công ty bảo dưỡng máy bay làm dịch vụ cho hai dòng máy bay, mỗi dòng có hai đời là -100 và -200. Thợ máy hỏi trợ lý ngay tại xưởng những câu như lực siết bao nhiêu, bước nào làm trước, phụ tùng mã nào. Kho tài liệu gồm sổ tay bảo dưỡng (AMM, khoảng 38.000 trang) và 2.400 thông báo kỹ thuật (service bulletin, SB). Mỗi SB thường sửa một phần quy trình trong AMM, và chỉ áp dụng cho một số máy bay. Công ty có sẵn một bảng dữ liệu ghi SB nào áp dụng cho máy bay nào.

Pipeline ban đầu chạy thế này. Tài liệu được cắt theo tiêu đề thành các chunk khoảng 600 token. Mỗi chunk được chuyển thành embedding bằng `voyage-4`. Embedding là một vector biểu diễn nghĩa của đoạn văn, nên hai đoạn cùng nghĩa sẽ có vector gần nhau. Khi thợ máy hỏi, hệ thống lấy 5 chunk có vector gần câu hỏi nhất và đưa vào prompt cho Sonnet 5.5.

Để đo chất lượng, đội có một bộ eval, tức bộ câu hỏi mẫu kèm đáp án dùng để chấm hệ thống, gồm 200 câu do thợ máy viết. Mỗi câu ghi sẵn cả đáp án đúng lẫn chunk chứa đáp án đó.

## Chẩn đoán theo từng tầng trước khi sửa

Tháng đầu, trợ lý trả lời đúng 72% số câu trong bộ eval, tức sai 56 câu. Đội sửa prompt ba lần mà tỉ lệ chỉ nhích lên 73%. Sửa mãi không tăng thường là dấu hiệu lỗi không nằm ở prompt.

Muốn biết lỗi nằm ở đâu thì chẩn đoán theo từng tầng. Bạn đo riêng xem bước tìm có lấy được chunk đúng không, và đo riêng xem câu trả lời cuối có đúng không. Vì vậy mỗi câu trong bộ eval phải ghi cả chunk đúng, chứ không chỉ đáp án. Bảng sau cho biết mỗi tầng đo bằng gì và hay hỏng kiểu nào.

| Tầng | Đo bằng | Lỗi hay gặp |
| --- | --- | --- |
| Chia chunk | Đọc mẫu xem chunk có tự hiểu được khi đứng một mình không | Chunk mất ngữ cảnh, cắt ngang bảng |
| Truy xuất | **Recall@k**: trong số chunk đúng, bao nhiêu nằm trong top k | Không tìm ra chunk có đúng mã phụ tùng; lấy nhầm giữa hai chunk gần như giống nhau |
| Xếp hạng lại (rerank) | **Precision**: bao nhiêu chunk lấy về là đúng. **MRR**: lấy 1 chia cho thứ hạng của chunk đúng đầu tiên, rồi tính trung bình trên cả bộ eval, càng gần 1 thì chunk đúng càng hay đứng đầu | Chunk đúng bị đẩy xuống dưới chunk na ná |
| Sinh câu trả lời | Tỉ lệ câu trả lời cuối đúng, do một model so với đáp án mẫu để chấm (LLM-as-judge); tỉ lệ nhận định có trích dẫn | Bịa khi thiếu tài liệu |

Lấy càng nhiều chunk thì recall càng tăng, vì dễ vớt được chunk đúng hơn, nhưng precision giảm vì lẫn nhiều chunk thừa. Vì vậy nhiều hệ lấy rộng ở bước tìm để khỏi sót, rồi dùng bước rerank lọc lại, chỉ đưa vài chunk tốt nhất vào prompt.

Đội đo lại theo tầng và thấy ở 44 trên 200 câu, chunk đúng không lọt vào top 5, và cả 44 câu này đều trả lời sai (recall@5 = 0,78). Lỗi của những câu này nằm ở tầng truy xuất, nơi sửa prompt không chạm tới. Các mục sau kể đội đã sửa tầng này thế nào. Sửa xong, recall@20 đạt 0,95, tức 95% số câu có chunk đúng lọt vào top 20, và trợ lý trả lời đúng khoảng 90% số câu.

Trong 56 câu sai ban đầu, 12 câu còn lại có chunk đúng nằm trong top 5 mà trợ lý vẫn trả lời sai. Chỉ những câu này mới là lỗi ở tầng sinh câu trả lời. Cách chữa là grounding, tức buộc câu trả lời bám vào tài liệu, có ở mục cuối bài.

**Sơ đồ: Tách 56 câu sai theo tầng: 44 câu hỏng ở bước tìm, chỉ 12 câu là lỗi của tầng sinh câu trả lời**
- sửa prompt
- đo từng tầng
- Không
- Có
- 200 câu eval,trợ lý sai 56
- Ba lần sửaprompt, tỉ lệđúng chỉ 73%
- Chunk đúnglọt top 5?
- 44 câu sai vìbước tìm bỏ sótrecall@5 = 0,78
- 12 câu sai dùcó chunk đúng
- Sửa truy xuất,recall@20 = 0,95trợ lý đúng khoảng 90%
- Đội sửa bằnggrounding

> **Trong đề chọn gì**
>
> Khi trợ lý trả lời sai, việc đầu tiên là kiểm tra chunk đúng có được lấy về không (recall theo từng câu), trước khi nghĩ tới đổi model hay sửa prompt. Nếu chunk đúng không được lấy về, sửa tầng truy xuất. Nếu chunk đúng đã có mà câu trả lời vẫn sai, sửa tầng sinh câu trả lời.

## Chunk và embedding

Đội mở 44 câu sai ở tầng truy xuất ra xem, và gặp nhiều ca giống ca này. Thợ máy hỏi lực siết bu-lông giá đỡ bơm thuỷ lực số 2 trên đời -200, trợ lý trả lời 45 Nm. Đó là giá trị của đời -100, còn đời -200 phải là 52 Nm.

Khi chọn chiến lược chia chunk và embedding, bạn quyết ba thứ là mỗi chunk dài bao nhiêu, cắt ở đâu, và hai chunk liền nhau chồng lên nhau bao nhiêu chữ (overlap). Với sổ tay kỹ thuật, chỗ cắt quan trọng hơn độ dài. Nếu một bảng lực siết bị cắt đôi, nửa sau của bảng nằm trong chunk khác và mất luôn dòng tiêu đề cột.

Vấn đề lớn hơn là **chunk mất ngữ cảnh**. Chunk "Siết 4 bu-lông giá đỡ ở 52 Nm" không nói bơm nào, đời máy bay nào, nên vector của nó gần như trùng với chunk cùng nội dung của đời -100. Cách chữa là **contextual retrieval**. Với mỗi chunk, bạn đưa cho Claude cả tài liệu gốc lẫn chunk đó, và nhờ Claude viết một đoạn ngữ cảnh ngắn, thường 50–100 token, nói chunk này thuộc phần nào, áp dụng cho đâu. Đoạn ngữ cảnh được đặt lên đầu chunk rồi mới tạo embedding (**contextual embeddings**). Chunk đã thêm ngữ cảnh cũng được đưa vào index BM25 (**contextual BM25**). BM25 là cách tìm theo từ khoá, chấm điểm theo những chữ câu hỏi và chunk có chung.

**Sơ đồ: Thêm đời máy bay vào đầu chunk thì hai chunk 45 Nm và 52 Nm mới tách xa nhau**
_Hai chunk lực siết của đời -100 và -200, trước và sau khi thêm ngữ cảnh_

- **TRƯỚC: EMBED NGUYÊN VĂN CHUNK**
- **SAU: THÊM NGỮ CẢNH RỒI MỚI EMBED**: "Siết 4 bu-lông giá đỡ ở 45 Nm"
- "Siết 4 bu-lông giá đỡ ở 52 Nm"
- **Bơm thuỷ lực số 2, đời -100.**
- **Bơm thuỷ lực số 2, đời -200.**: Siết 4 bu-lông giá đỡ ở 45 Nm
- Siết 4 bu-lông giá đỡ ở 52 Nm
- embed bằng voyage-4
- embedding và BM25 đều thấy "-200"
- **KHÔNG GIAN VECTOR**: 45 Nm
- 52 Nm
- lấy nhầm
- câu hỏi về đời -200
- **KHÔNG GIAN VECTOR**: 45 Nm, đời -100
- 52 Nm, đời -200
- câu hỏi về đời -200
- **Trợ lý trả 45 Nm cho đời -200**
- **Trợ lý trả 52 Nm cho đời -200**

Mọi chunk của một tài liệu đều gửi kèm cùng tài liệu gốc đó, nên dùng prompt caching để lưu phần tài liệu lại. Prompt caching lưu phần đầu của prompt để các request sau đọc lại với giá rẻ hơn nhiều, nhờ vậy mỗi tài liệu chỉ tính giá đầy đủ một lần. Toàn bộ chi phí viết ngữ cảnh chỉ phát sinh lúc nạp kho tài liệu, chứ không lặp lại mỗi khi thợ máy đặt câu hỏi.

Thử nghiệm của Anthropic đo tỉ lệ câu hỏi mà chunk liên quan không lọt vào top 20. Chỉ dùng contextual embeddings thì tỉ lệ này giảm 35%. Dùng thêm contextual BM25 thì giảm 49%. Thêm cả bước rerank (mục sau) thì giảm 67%. Nếu chỉ gắn cùng một bản tóm tắt chung của cả tài liệu vào mọi chunk thì gần như không cải thiện gì, vì đoạn ngữ cảnh phải viết riêng cho từng chunk.

Còn một câu hỏi là lấy embedding từ đâu. **Anthropic không có model embedding riêng.** Nhà cung cấp hay được dùng cùng Claude là Voyage AI, có model đa dụng như `voyage-4` và model cho từng lĩnh vực như `voyage-code-4` (code) hay `voyage-law-2` (pháp luật). Khi tạo embedding, đặt `input_type="query"` cho câu hỏi và `input_type="document"` cho tài liệu, để model biết đâu là câu hỏi, đâu là đoạn văn cần tìm. Nếu không muốn nhờ Claude viết ngữ cảnh cho từng chunk, có thể dùng `voyage-context-4`. Model này nhìn cả tài liệu khi tạo vector cho từng chunk, nên vector đã mang sẵn ngữ cảnh.

## Hybrid search và rerank

Thêm ngữ cảnh cho chunk xong, đội vẫn gặp một kiểu sai khác. Thợ máy hỏi về mã phụ tùng (part number, viết tắt P/N) "P/N 7716-203", trợ lý lại trả lời chung chung về cả chương thuỷ lực, vì bước tìm không lấy được đoạn có mã đó.

Embedding giỏi nhận ra hai câu cùng nghĩa dù viết khác chữ, nhưng kém với những chuỗi phải trùng từng ký tự như mã phụ tùng. **BM25** thì tìm theo từ khoá, nên thấy ngay chunk có đúng chuỗi "7716-203". Tìm kết hợp (**hybrid search**) chạy cả tìm bằng embedding lẫn BM25, rồi gộp hai danh sách kết quả và bỏ chunk trùng. Bước gộp gọi là **rank fusion**. Một kỹ thuật rank fusion hay gặp ngoài ngành là reciprocal rank fusion, trong đó mỗi chunk được cộng điểm theo thứ hạng của nó trong từng danh sách, nên chunk đứng cao ở cả hai danh sách sẽ lên đầu.

Xếp hạng lại (**reranking**) là bước lọc sau khi đã lấy rộng. Đầu tiên bạn lấy về thật nhiều chunk, trong thử nghiệm của Anthropic là 150. Sau đó một model rerank, tức model chuyên chấm xem từng chunk liên quan tới câu hỏi tới đâu, cho điểm từng chunk. Cuối cùng chỉ giữ vài chunk điểm cao nhất để đưa vào prompt. Trong thử nghiệm, giữ 20 chunk cho kết quả tốt hơn giữ 5 hay 10. Voyage có model rerank riêng (`rerank-3`), còn thử nghiệm của Anthropic dùng reranker của Cohere. Đổi lại, mỗi câu hỏi sẽ chậm hơn và tốn thêm tiền, nên cần thử trên dữ liệu của mình để chọn số chunk vừa đủ.

## RAG, agentic search hay cả hai

Sửa xong chunk và bước tìm, đội gặp một kiểu sai mà truy xuất giỏi hơn cũng không chữa được. Thông báo kỹ thuật SB 29-0042 thay bước 4 của một quy trình trong AMM, vậy mà trợ lý vẫn trích bước cũ. Bước tìm đã lấy về cả chunk của AMM lẫn chunk của SB. Vấn đề là Claude không có cách nào biết SB đó có áp dụng cho chiếc máy bay đang sửa hay không.

Ca này cho thấy vấn đề không nằm ở chỗ tìm giỏi hay dở, mà ở cách đưa thông tin cho Claude. Đây là chuyện cân nhắc giữa agentic search và RAG. Agentic search là để agent tự gọi tool đi tìm khi cần, thay vì tìm sẵn một lần rồi đưa vào prompt. Thực tế có bốn cách để chọn.

| Cách | Hợp khi | Cái giá |
| --- | --- | --- |
| Đưa cả kho tài liệu vào prompt | Kho tài liệu dưới 200.000 token (khoảng 500 trang) | Mỗi request mang cả kho tài liệu; prompt caching làm rẻ hơn nhiều |
| RAG (tìm các đoạn liên quan trước, rồi đưa vào prompt) | Kho tài liệu lớn, câu hỏi tra một chỗ, cần nhanh | Phải cập nhật index mỗi khi tài liệu đổi; hệ thống chỉ tìm một lần, tìm sai thì không có cơ hội tìm lại |
| Agentic search (agent tự tìm bằng tool) | Phải lần theo tham chiếu, dữ liệu đổi nhanh | Chậm hơn; cần tool và chỉ dẫn tốt |
| Kết hợp RAG và agentic search | Vừa cần nhanh vừa cần lần theo tham chiếu | Phức tạp hơn để vận hành và đo |

Cách để agent tự tìm còn gọi là truy xuất **just in time**. Agent không nạp sẵn nội dung mà chỉ giữ những thứ giúp tìm lại được, như đường dẫn file hay câu truy vấn, và chỉ đọc nội dung khi thật sự cần. Claude Code là một ví dụ của cách kết hợp. File CLAUDE.md luôn được nạp sẵn vào đầu session, còn code thì Claude tự tìm bằng glob và grep khi cần. Vì không dựng index trước, Claude Code tránh được cảnh index cũ hơn code.

Với ca SB 29-0042, đội viết tool `sb_dang_hieu_luc(ma_quy_trinh, so_dang_ky_may_bay)` để tra bảng SB của công ty, và dặn trợ lý gọi tool này trước khi trả lời. Khi dữ liệu đã nằm sẵn trong một bảng có cột rõ ràng, hãy cho agent truy vấn thẳng vào bảng, đừng biến nó thành embedding rồi hy vọng bước tìm lấy ra đúng dòng.

Đội cũng tính cho trợ lý tra trang thông báo công khai của nhà sản xuất máy bay. Với tài liệu công khai trên web như vậy, Claude API có **web search tool**. Đây là server tool, tức tool chạy trên máy chủ của Anthropic, nên bạn không phải tự viết code tìm kiếm. API tự tìm và trả kết quả kèm trích dẫn. Tham số `allowed_domains` giới hạn những trang web tool được phép tìm. Tên tool kèm ngày để chỉ version, và từ version `web_search_20260209`, tool có thêm **dynamic filtering**, tức Claude tự viết code lọc bớt kết quả trước khi đưa vào context.

Không phải nền tảng nào cũng có đủ các version. Trên Claude Models on Google Cloud (Google managed) và Microsoft Foundry trên Azure, chỉ có bản cơ bản `web_search_20250305`. Danh sách nền tảng hỗ trợ trên trang web search không có Amazon Bedrock.

Khi tìm kiếm lỗi, ví dụ hết số lượt được phép hay vượt rate limit, API vẫn trả HTTP 200, và lỗi nằm bên trong block `web_search_tool_result`. Vì thế code phải đọc block này chứ không chỉ xem mã HTTP. Với lượt tìm kéo dài, API có thể tạm dừng và trả `stop_reason` là `pause_turn`, khi đó bạn gửi lại nguyên message của assistant để Claude làm tiếp. Mỗi 1.000 lần tìm tốn 10 USD, chưa kể tiền token cho nội dung tìm được.

## Grounding: buộc câu trả lời bám vào tài liệu

Còn lại là 12 câu sai ở tầng sinh câu trả lời. Ca đáng lo nhất là thế này. Thợ máy hỏi quy trình thay một van chỉ có trên đời -300. Công ty không bảo dưỡng đời này nên kho tài liệu không có trang nào về nó, vậy mà trợ lý vẫn viết ra sáu bước nghe rất hợp lý, không kèm trích dẫn nào.

Grounding là những cách buộc câu trả lời bám vào tài liệu thay vì để Claude tự nghĩ ra. Có ba việc cần làm, là kèm trích dẫn nguồn cho mỗi nhận định (**source citation**), nói rõ khi tài liệu không đủ để trả lời (**uncertainty declaration**), và có tín hiệu cho biết câu trả lời đáng tin tới đâu (**confidence signals**).

### Trích dẫn tài liệu của bạn

Để có trích dẫn, tool tìm kiếm của bạn nên trả kết quả dưới dạng block `search_result` thay vì một chuỗi văn bản thường. Mỗi block ghi `source`, `title`, `content` và bật `citations: {"enabled": true}`. Khi nhận kết quả kiểu này, Claude tự gắn trích dẫn vào câu trả lời mà bạn không cần dặn. Mỗi trích dẫn có trường `cited_text` chứa nguyên văn đoạn tài liệu làm căn cứ, nên thợ máy biết câu nào lấy từ đâu.

Citations có ba giới hạn cần nhớ.

- Citations bật cho tất cả hoặc không cho cái nào. Mọi `search_result` trong cùng một request phải cùng bật hoặc cùng tắt.
- Citations không dùng chung được với structured outputs, tức chế độ buộc câu trả lời theo đúng một JSON schema. Bật cả hai thì API trả lỗi 400.
- Phần `cited_text` không bị tính vào token output.

### Nói rõ khi không đủ thông tin

Trợ lý bịa sáu bước cho đời -300 vì prompt không cho nó lối thoát nào khác. Trong prompt, hãy nói rõ Claude được phép trả lời "tôi không biết", và chỉ được dùng tài liệu đưa vào. Sau khi Claude viết xong, yêu cầu nó tìm câu trích trong tài liệu làm căn cứ cho từng nhận định, và bỏ nhận định nào không tìm được căn cứ. Khi tool tìm không ra kết quả nào, cho tool trả `"No results found."` thay vì báo lỗi, để Claude biết chắc kho tài liệu không có gì và nói thẳng điều đó với thợ máy.

**Sơ đồ: Với câu hỏi về đời -300, chỉ prompt cho phép nói "không biết" mới chặn được quy trình bịa**
Bên tham gia: Tool tìm tài liệu, Claude, Thợ máy

1. Quy trình thay van, đời -300?
2. Claude bịa sáu bước,
3. không kèm trích dẫn nào
4. Tìm tài liệu cho đời -300
5. "No results found."
6. Trợ lý báo kho không có
7. tài liệu cho đời -300

### Tín hiệu độ tin cậy

Claude không có sẵn tín hiệu nào cho biết câu trả lời đáng tin tới đâu, nên bạn phải tự tạo. Có thể dùng ba cách. Best-of-N ở cách thứ ba là cách Anthropic khuyên dùng để giảm bịa, còn hai cách đầu là bạn tự dựng từ trích dẫn và điểm rerank.

- Viết code kiểm tra mọi con số và mã trong câu trả lời, như lực siết hay mã phụ tùng, xem có nằm trong `cited_text` nào không.
- Nếu chunk xếp đầu có điểm rerank thấp hơn một ngưỡng, kho tài liệu có thể không chứa câu trả lời. Ngưỡng này chọn bằng cách thử trên bộ eval.
- Với câu hỏi rủi ro cao, cho Claude trả lời vài lần rồi so (best-of-N). Nếu các lần trả lời lệch nhau, nhiều khả năng Claude đang bịa.

Các cách grounding trong mục này làm Claude bịa ít đi chứ không chặn được hẳn. Vì thế thợ máy vẫn nên mở tài liệu gốc mà trích dẫn trỏ tới để đối chiếu trước khi làm.

> **Bẫy đề**
>
> Trợ lý trả 45 Nm cho đời -200, trong khi đúng là 52 Nm. Ba cách sửa nghe hợp lý nhưng sai:
>
> - **Đổi sang model mạnh hơn** (_switch to a more capable generation model_). Nghe hợp lý vì lỗi lộ ra ở câu trả lời. Nhưng bước tìm không hề lấy về chunk của đời -200, nên model mạnh tới đâu cũng chỉ thấy con số 45 Nm.
> - **Đưa thật nhiều chunk vào prompt** (_retrieve many more chunks_). Nghe như dễ có chunk đúng hơn. Nhưng lỗi nằm ở chỗ chunk thiếu ngữ cảnh, nên hai chunk vẫn na ná nhau dù lấy bao nhiêu. Cách đúng là thêm ngữ cảnh cho chunk, lấy rộng ở bước tìm để rerank chấm điểm, rồi chỉ đưa những chunk điểm cao nhất vào prompt.
> - **Bắt model trả JSON có trường "nguồn"** (_ask for citations in a JSON response_). Nghe gọn vì ứng dụng đọc JSON dễ. Nhưng bật citations cùng structured outputs thì API báo lỗi, còn chỉ dặn trong prompt "chỉ trả JSON" thì câu trả lời có rất ít hoặc không có trích dẫn.
>
> **Chọn:** đo xem chunk đúng có được lấy về không, rồi sửa tầng truy xuất.

> **Ý chính**
>
> Đo truy xuất riêng với câu trả lời cuối để biết lỗi ở tầng nào. Sửa chunk mất ngữ cảnh bằng contextual retrieval, thêm BM25 cho mã phải khớp chính xác, lấy rộng rồi rerank. Với dữ liệu đã nằm trong bảng, viết tool để agent truy vấn thẳng vào bảng. Trả tài liệu dạng `search_result` có citations, cho phép Claude nói "không đủ thông tin", và tự tạo tín hiệu độ tin cậy từ trích dẫn.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Introducing Contextual Retrieval (Anthropic Engineering)](https://www.anthropic.com/research/contextual-retrieval)
3. [Effective context engineering for AI agents (Anthropic Engineering)](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
4. [Retrieval augmented generation (Claude Cookbook)](https://github.com/anthropics/claude-cookbooks/blob/main/capabilities/retrieval_augmented_generation/guide.ipynb)
5. [Contextual embeddings (Claude Cookbook)](https://github.com/anthropics/claude-cookbooks/blob/main/capabilities/contextual-embeddings/guide.ipynb)
6. [Embeddings (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/embeddings)
7. [Search results (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/search-results)
8. [Citations (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/citations)
9. [Reduce hallucinations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
10. [Web search tool (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)
