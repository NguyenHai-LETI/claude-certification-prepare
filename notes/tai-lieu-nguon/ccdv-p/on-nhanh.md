---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/on-nhanh
ngay_tai: 2026-11-27
tieu_de: Tổng quan CCDV-P
---

# Tổng quan CCDV-P

Cả chứng chỉ CCDV-P trên một trang, khái niệm nào cũng giải thích ngay, kèm sơ đồ, bẫy đề và bảng chọn nhanh. Chưa học bài nào vẫn đọc được.

- 37 phút đọc
- Đối chiếu docs 22/11/2026
- 7 nguồn

Hãy đọc trang này đầu tiên. Trang gom cả chứng chỉ vào một chỗ, khái niệm nào cũng được giải thích ngay bằng lời thường, nên chưa học bài nào bạn vẫn đọc hiểu được. Mỗi domain gồm các khái niệm chính và bẫy đề hay gặp, rồi kết bằng bảng **Trong đề chọn gì** để tra nhanh trước giờ thi.

## Đề thi gồm những gì

| Mục | Chi tiết |
| --- | --- |
| Số câu | 70, trong đó 60 câu tính điểm và 10 câu thử không tính (bạn không biết là câu nào) |
| Thời gian | 120 phút |
| Cấu trúc | Câu hỏi đi theo tình huống: một đoạn mô tả công ty và hệ thống dùng chung cho 2–7 câu liền nhau. Khoá luyện thi chỉ có câu một đáp án |
| Điểm đậu | 720 trên thang 100–1.000 |
| Lệ phí, hiệu lực | $175, chứng chỉ có hiệu lực 12 tháng |
| Kết quả | Đạt hay không, điểm quy đổi, và tỉ lệ đúng theo từng domain |

| Domain | Tỉ trọng | Hỏi về |
| --- | --- | --- |
| 1. Advanced Agent Architecture and Orchestration | 17% | Nhiều agent phối hợp, agent chạy lâu không mất việc, chọn workflow hay agent, context và memory |
| 2. Production Integration, Reliability, and Knowledge Grounding | 20% | Retry và fallback, rate limit, đổi model có kiểm soát, MCP, truy xuất tài liệu |
| 3. Observability and Production Monitoring | 12% | Trace, SLI và SLO, cảnh báo, lấy mẫu và đọc lượng trace rất lớn |
| 4. Advanced Debugging and Incident Response | 10% | Khoanh nguyên nhân lỗi, xử lý sự cố, postmortem |
| 5. Evaluation Engineering and Quality Assurance | 12% | Bộ eval, cổng CI/CD, LLM-as-judge, đo chất lượng trên production |
| 6. Cost and Latency Optimization at Scale | 8% | Mô hình chi phí, định tuyến model, cache, batch, ngân sách, độ trễ |
| 7. Runtime Guardrails and Production Security | 11% | Guardrail, prompt injection, red team, danh tính, bí mật, audit |
| 8. Agent Fleet Operations for Software Delivery | 10% | Coding agent song song, AI code review, agent không người trực, cấu hình cho cả tổ chức |

Đề Professional mặc định bạn đã nắm kiến thức của chứng chỉ nền tảng CCDV-F, nên không hỏi lại phần cơ bản. Câu hỏi thường cho xem một hệ thống đang chạy, kèm trace, số đo hay kết quả một đợt tự tấn công thử (red team), rồi hỏi nên đổi gì, hoặc nên làm gì **trước tiên**.

**Sơ đồ: Mọi thay đổi, kể cả bản sửa sự cố hay giảm chi phí, đều qua cổng eval rồi mới deploy**
_Vòng đời một hệ thống agent trên production gồm sáu bước đánh số, mọi mũi tên cùng một nghĩa: xong bước này thì tới bước sau. Bước 1 dựng, thay đổi hệ thống, gắn nhãn D1 Kiến trúc 17% và D2 Tích hợp 20%. Bước 2 chạy eval, gắn nhãn D5 Eval 12%, là cổng mọi thay đổi phải qua. Bước 3 deploy. Bước 4 vận hành, gắn nhãn D7 Guardrail 11%. Bước 5 theo dõi, gắn nhãn D3 Observability 12%. Bước 6 sửa sự cố hay tối ưu chi phí, gắn nhãn D4 Sự cố 10% và D6 Chi phí 8%; bản sửa là một thay đổi mới nên quay về bước 1. Ngoài vòng, trong khung riêng không nối mũi tên và ghi rõ là mảng riêng của đề, không phải một bước, là D8 Coding agent 10%: chạy đội coding agent viết code cho phần mềm._

- D1 Kiến trúc 17%
- D2 Tích hợp 20%
- D5 Eval 12%
- 1. **Dựng, thay đổi**
- **Chạy eval**
- 2.
- 3. **Deploy**
- **VÒNG ĐỜI MỘT HỆ THỐNG AGENT**
- 4. **Vận hành**
- 5. **Theo dõi**
- 6. **Sửa, tối ưu**: D7 Guardrail 11%
- D3 Observability 12%
- D4 Sự cố 10%
- D6 Chi phí 8%
- **NGOÀI VÒNG · MẢNG RIÊNG CỦA ĐỀ, KHÔNG PHẢI MỘT BƯỚC**
- **Chạy đội coding agent viết code cho phần mềm**: D8 Coding agent 10%

## Domain 1: Advanced Agent Architecture and Orchestration

### Điều phối nhiều agent

Chọn cách điều phối theo việc gồm những phần như thế nào.

1. **Rất nhiều phần việc giống nhau?** → Dynamic workflow, code chia việc và mỗi phần giao một agent
2. **Vài việc chuyên biệt, có lúc cần hỏi lại?** → Subagent, mỗi agent con có context riêng
3. **Một agent làm đủ, chỉ thiếu phán đoán ở vài điểm?** → Advisor, hỏi ý một model (thường mạnh hơn) ở đúng điểm đó
- **Còn lại** → Chưa có lý do về context, song song hay chuyên môn thì giữ một agent

- Prompt giao việc cho subagent nói đủ mục tiêu, dạng kết quả trả về, tool và nguồn nên dùng, và việc nằm ngoài phạm vi.
- Subagent có context riêng (**cô lập context**) không có nghĩa là quyền của nó bị giới hạn (**cô lập quyền**). Tool không đảo ngược được, như nộp, gửi hay xoá, chỉ nên nằm ở một agent có **approval gate**, tức bước chờ người duyệt, và màn hình duyệt ghi rõ agent nào đang xin.

### Lưu trạng thái ra ngoài để agent chạy lâu không mất việc

Agent chạy hàng giờ sẽ có lúc bị ngắt, khi container bị thay, khi deploy hay khi đổi version model. Thứ gì chỉ nằm trong context hay trên ổ đĩa container thì mất.

| Trạng thái | Lưu ở |
| --- | --- |
| Transcript hội thoại | **Session store** bên ngoài (`SessionStore`) hoặc session phía server, để resume trên host khác |
| File agent làm ra | Git hoặc volume ngoài container |
| Tiến độ | Bảng ghi trạng thái từng mục. Agent tiếp quản đọc bảng rồi kiểm lại, không đoán từ file |
| Quy ước dùng qua nhiều session | Memory, file ghi nhớ agent đọc lại ở mỗi session mới |

Muốn đổi version model cho agent đang chạy dở, hãy thử model mới trên việc thật, rồi đổi ở một **checkpoint**, tức lúc agent vừa ghi xong trạng thái ra ngoài. Quyết định quan trọng cũng phải ghi ra ngoài, vì phần thinking (đoạn model tự suy nghĩ trước khi trả lời) có thể mất khi đổi model.

### Workflow hay agent khi hệ thống lớn dần

Workflow là luồng mà code viết sẵn từng bước, còn agent để model tự chọn bước tiếp theo. Khi cân nhắc, hãy xem chi phí, độ tin cậy và chất lượng **tách theo từng loại đầu vào**, đừng chỉ nhìn con số tổng.

- Loại đầu vào quá đa dạng mà workflow xử lý kém thì chỉ chuyển riêng loại đó sang agent.
- Loại mà lần nào agent cũng đi đúng một chuỗi bước thì viết thành workflow.
- **Harness** là phần code chạy vòng lặp agent. Tự viết trên Messages API, dùng Agent SDK hay Managed Agents tuỳ bạn muốn tự quản hay để Anthropic quản vòng lặp, session và dữ liệu.

Skill hay plugin nhiều team dùng chung thì để trong git và qua review, chạy eval (bộ ca kiểm tra tự động) trước khi phát hành, và production **pin version**, tức cố định một version.

### Context và memory cho agent chạy lâu

Khi context gần đầy hay tốn quá ngân sách, tìm xem token tốn vào đâu rồi xử lý đúng nguồn đó. Đổi sang model có context window lớn hơn chỉ hoãn vấn đề.

| Token tốn vào | Cách xử lý |
| --- | --- |
| Hàng trăm định nghĩa tool nạp sẵn | **Tool search**, chỉ nạp tool khi cần |
| Kết quả tool cũ chất đống | **Context editing**, tự dọn kết quả tool cũ |
| Hội thoại dài | **Compaction** (nén hội thoại thành bản tóm tắt), kèm `instructions` nói rõ phải giữ gì |
| Điều phải nhớ qua nhiều session | Memory |

Muốn đổi chỉ dẫn giữa chừng, thêm một message `role: "system"` vào cuối hội thoại. Đừng sửa trường `system` hay `tools` ở đầu prompt, vì như vậy phần prompt đã được cache (lưu sẵn để đọc lại rẻ hơn, xem Domain 6) của cả lịch sử phía sau mất hết.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Subagent tự gọi tool ghi hay nộp | Bỏ tool khỏi subagent, để ở agent chính với `always_ask` (luôn chờ người duyệt) |
> | Container tạm phải resume được session | Session store bên ngoài hoặc session phía server, giữ container sống lâu hơn không thay được |
> | Agent báo xong khi còn việc | Bảng tiến độ bên ngoài context |
> | Đổi version model cho agent đang chạy dở | Đổi ở checkpoint, sau khi thử trên việc thật |
> | Một loại đầu vào xử lý kém, các loại khác tốt | Chỉ chuyển loại đó sang agent |
> | Chia sẻ skill cho nhiều team | Review, eval trước khi phát hành, production pin version |
> | Context gần đầy | Xử lý đúng nguồn tốn token, không đổi sang context window lớn hơn |
> | Đổi chỉ dẫn giữa hội thoại | Thêm system message ở cuối, không sửa `system` hay `tools` |

**Học kỹ domain này**

- [1.1 Điều phối nhiều agent trên production - giao việc, cô lập context, giao tiếp và người duyệt](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-1-dieu-phoi-nhieu-agent) (18 phút đọc)
- [1.2 Chạy bền cho agent dài hơi - lưu session, checkpoint, resume và đổi model giữa chừng](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-2-chay-ben-va-luu-trang-thai) (18 phút đọc)
- [1.3 Chọn kiến trúc khi hệ thống lớn lên - workflow hay agent, harness nào, chuẩn dùng chung cho team](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-3-chon-kien-truc-khi-mo-rong) (21 phút đọc)
- [1.4 Kiến trúc context và memory cho agent chạy lâu - tool search, context editing, compaction, đổi chỉ dẫn giữa chừng](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-4-kien-truc-context-va-memory) (18 phút đọc)

## Domain 2: Production Integration, Reliability, and Knowledge Grounding

### Phân loại lỗi trước khi retry

Nhiều sự cố bắt nguồn từ việc gom mọi lỗi vào chung một đường retry.

1. **429 kèm retry-after?** → Backoff rồi retry, ở đúng một chỗ
2. **429 enforced_spend_limit_reached?** → Hết hạn mức chi tiêu, đừng retry mà báo đội vận hành
3. **500 hoặc 529?** → Retry có backoff, lỗi kéo dài thì chuyển sang model hay region khác
4. **stop_reason là max_tokens?** → Câu trả lời bị cắt, cần tăng ngân sách output vì gửi lại y nguyên thì vẫn cụt
5. **Model từ chối (refusal)?** → Đưa sang luồng xử lý riêng
- **Còn lại** → 400, 401, 403 thì sửa request hay quyền rồi mới gửi, retry không giúp

- **Chỉ retry ở một chỗ.** SDK chính thức đã tự retry lỗi tạm thời. App bọc thêm một vòng retry thì số request bị nhân lên đúng lúc API đang quá tải.
- Lỗi 429 (vượt rate limit) có khi xuất hiện dù chưa chạm giới hạn. Đó là **ramp limit**, giới hạn chặn mức dùng tăng quá nhanh, nên giữ tải ở mức đang chạy được rồi tăng dần.
- **Fallback** là chuyển request sang model, region hay nền tảng khác khi nơi chính lỗi. Nó chỉ an toàn khi request vẫn hợp lệ ở nơi mới, dữ liệu vẫn được xử lý ở nơi quy định cho phép, và đường fallback đã được chạy thử trước khi có sự cố.

> **Bẫy đề**
>
> Một dịch vụ đưa mọi lỗi vào chung một đường, retry có backoff rồi chuyển sang model thứ hai. Sau khi model được cập nhật, hoá đơn tăng vọt và câu trả lời của model thứ hai ngắn bất thường. Trace cho thấy ba thứ lẫn trong đường đó là rate limit, câu bị cắt vì chạm độ dài tối đa, và câu model từ chối.
>
> - **Tăng số lần retry, nới backoff** (_retry harder, wait longer_). Câu bị cắt vẫn bị cắt, câu bị từ chối vẫn bị từ chối, chỉ có chi phí tăng.
> - **Chuyển hẳn sang model dự phòng** (_send everything to the backup model_). Model kia đang trả lời được, có điều ba loại lỗi vẫn chung một đường.
> - **Tắt fallback, trả ngay lỗi đầu tiên** (_turn fallback off, surface errors_). Người dùng nhận lỗi cả khi chỉ cần chờ vài giây vì rate limit.
>
> **Chọn:** tách đường xử lý theo lý do dừng (**branch on the stop condition**). 429 thì chờ rồi retry, câu bị cắt vì `max_tokens` thì tăng giới hạn output, câu bị từ chối thì sang luồng riêng.

### Rate limit và nhiều tenant

**Tenant** là một khách hàng hay tổ chức dùng chung hệ thống của bạn. Khi gặp 429, đọc header của response để biết giới hạn nào bị chạm trước, **ITPM** hay **OTPM** (token đầu vào, đầu ra tối đa mỗi phút) hay ramp limit. Rồi thử những cách tự làm được trước khi xin nâng limit.

- **Cache.** Prompt caching lưu sẵn phần đầu prompt để request sau đọc lại, và token đọc từ cache mặc định không tính vào ITPM.
- **Hai làn.** Tách việc có người chờ (chat) khỏi việc chạy background (dịch, phân loại), và cho mỗi tenant một quota riêng để một tenant không kéo cả hệ thống dính 429.
- **Batch.** Việc không ai chờ thì gửi qua Message Batches API, rẻ một nửa và không vướng ramp limit.

`max_tokens`, số token output tối đa mỗi response, không được tính vào OTPM, nên hạ nó không chữa được 429 do OTPM.

### Đổi model, prompt, tool và MCP server có kiểm soát

- **Đổi tool theo kiểu chỉ thêm.** Thêm tool hay thêm tham số không bắt buộc thì sửa thẳng. Đổi tên, bỏ tham số hay thêm tham số bắt buộc thì tạo tool tên mới và cho tool cũ chạy song song.
- **Đổi model qua bốn bước.** **Contract test** gửi thật tới model mới mỗi kiểu request code có dùng. Sau đó là eval, rồi **shadow traffic** (gửi thêm một bản lưu lượng thật tới model mới mà không trả cho người dùng), cuối cùng là **canary** (một phần nhỏ lưu lượng dùng bản mới trước). Unit test dùng response giả nên không bắt được lỗi 400 của model mới.
- Prompt, model và MCP server (dịch vụ cung cấp tool cho Claude theo chuẩn MCP) đều pin version, để rollback chỉ là đổi về version cũ.
- MCP server remote ở production tự kiểm token như mọi API khác. Nó chỉ nhận token cấp riêng cho nó, nhận biết qua trường `audience` (bên nhận dự định), và không chuyển tiếp token của người dùng sang dịch vụ khác.
- **MCP connector** của Messages API chỉ dùng được tool, cần server có URL công khai, và không thuộc diện **ZDR** (cam kết Anthropic không lưu dữ liệu request và response).

### Truy xuất và grounding

**RAG** là lấy đoạn tài liệu liên quan đưa vào prompt, với tài liệu được cắt thành các **chunk** để đánh chỉ mục. Khi RAG trả lời sai, việc đầu tiên là đo xem chunk chứa câu trả lời có được lấy về không.

- Chunk đúng không được lấy về thì sửa tầng truy xuất. **Contextual retrieval** thêm một câu ngữ cảnh vào từng chunk trước khi đánh chỉ mục, **BM25** tìm theo từ khoá nên bắt được mã sản phẩm hay mã lỗi, hoặc lấy nhiều chunk rồi **rerank** (xếp hạng lại).
- Chunk đúng đã về mà câu trả lời vẫn sai thì lỗi ở bước Claude viết từ tài liệu, cần sửa prompt hay cách đưa tài liệu vào.

**Grounding** là bắt câu trả lời bám vào tài liệu đã lấy về. Trả tài liệu dưới dạng block `search_result`, bật citations để Claude tự gắn trích dẫn, và cho phép Claude nói "không đủ thông tin". Citations không bật chung được với structured outputs (chế độ ép response theo JSON schema), API sẽ báo lỗi 400.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Một tenant làm cả hệ thống dính 429 | Quota theo tenant, làn riêng cho việc chạy background |
> | 429 vì chạm OTPM | Giảm `max_tokens` không giúp |
> | Mua Priority Tier (gói mua trước dung lượng ưu tiên) cho chắc | Gói này không còn bán, và không hỗ trợ Sonnet 5.5 |
> | Đổi model khi mới có model ID đã pin và unit test đang xanh | Chưa đủ, phải qua contract test, eval, shadow traffic rồi mới canary |
> | Prompt mới làm tăng khiếu nại | Rollback về version đã pin trước đó |
> | MCP server remote nhận token của người dùng | Kiểm `audience`, không chuyển tiếp token |
> | RAG sai sau khi làm mới tài liệu | Đo chunk đúng có được lấy về không, rồi sửa đúng tầng |
> | Muốn câu trả lời có nguồn | `search_result` có citations, không ép JSON có trường "nguồn" |

**Học kỹ domain này**

- [2.1 Độ tin cậy cho dịch vụ Claude - retry, circuit breaker và fallback theo đúng loại lỗi](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-1-do-tin-cay-dich-vu-claude) (20 phút đọc)
- [2.2 Quy mô và thông lượng - rate limit, hàng đợi, batch và quota cho nhiều tenant](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-2-quy-mo-va-thong-luong) (19 phút đọc)
- [2.3 MCP production và quản lý thay đổi - remote MCP, version tool, đổi model, prompt và rollout](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-3-mcp-production-va-quan-ly-thay-doi) (21 phút đọc)
- [2.4 Truy xuất và grounding ở quy mô lớn - đo theo tầng, chunk, hybrid search, rerank, trích dẫn](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/2-4-truy-xuat-va-grounding) (18 phút đọc)

## Domain 3: Observability and Production Monitoring

### Trace và token

- **Trace** là bản ghi đường đi của một request. Mỗi lần gọi model hay gọi tool là một **span**, các span lồng nhau thành cây cho cả vòng lặp agent.
- Muốn truy một câu trả lời về nguồn và lập luận, ghi ngay lúc nó trả về ID tài liệu được trích, bản tóm tắt thinking (nếu bật), model thật sự trả lời (có thể khác model bạn gọi nếu đã fallback), và `request-id` để nối với trace.
- Span dùng để gỡ lỗi và xem xu hướng. Tiền thì đối soát bằng **Usage and Cost Analytics API**, đừng cộng từ span.
- Trên production chỉ ghi metadata như model, số token và thời gian. Cần nội dung đầy đủ để gỡ lỗi thì gửi vào một nơi lưu riêng, ít người đọc và tự xoá sớm. ZDR chỉ ràng buộc Anthropic, nội dung đã gửi sang nền tảng observability thì theo quy định của nền tảng đó.

### Chỉ số, cảnh báo và chất lượng trôi

- **SLI** là chỉ số đo mức phục vụ, **SLO** là mục tiêu đặt cho chỉ số đó. SLI nên đếm việc đã thật sự xong, như một bài nộp đã chấm đủ các câu, vì request trả HTTP 200 vẫn có thể chưa làm xong việc.
- Đặt cảnh báo cho span có status `ERROR` và response có `stop_reason=max_tokens`. Span của stream bị đóng sớm mà status để trống (unset) là người dùng huỷ, không phải lỗi.
- Lưu lượng bất thường, như từ một key bị lộ, có thể không sinh span nào, nên mức dùng theo từng API key phải lấy từ Usage and Cost API.
- Sau khi đổi model, dashboard lỗi và độ trễ có thể vẫn xanh trong khi câu trả lời kém dần (**chất lượng trôi**). Cần một SLI chất lượng tính hằng ngày, tách theo `gen_ai.response.model` để so trước và sau. Đặt rõ mức `effort` (mức model nghĩ, gọi tool và tự kiểm, xem Domain 6) thay vì để mặc định, và rollout qua canary có ngưỡng dừng trên SLI đó.

### Lấy mẫu và đọc lượng trace rất lớn

Trace quá nhiều nên thường chỉ giữ một phần, gọi là lấy mẫu (sampling). **Head sampling** quyết giữ hay bỏ ngay khi request bắt đầu, và nếu ứng dụng đã bỏ (cờ sampled tắt) thì Claude API cũng không gửi span nào. **Tail sampling** chạy ở **collector**, dịch vụ nhận, lọc và chuyển tiếp span, đợi xong cả hội thoại mới quyết nên giữ được mọi hội thoại có lỗi.

**Sơ đồ: Cờ sampled tắt thì span mất từ đầu, collector giữ được hội thoại lỗi, còn tỉ lệ thì đếm ở metric**
- kèm cờsampled
- cờ tắt
- cờ bậtgửi span
- giữ mọihội thoại lỗi
- đếm đủmọi request
- Ứng dụnghead samplingquyết từ đầu
- Claude API
- Không gửispan nào
- Collectortail samplingđợi hết hội thoại
- Nơi lưutrace
- Metrictỉ lệ lỗi, tỉ lệchuyển nhân viên

- Tỉ lệ như tỉ lệ lỗi hay tỉ lệ chuyển sang nhân viên phải tính từ metric, vì trace đã lấy mẫu chỉ còn một phần.
- Lỗi có hệ thống ít khi lộ ra ở từng trace mà lộ ra khi tỉ lệ của một nhóm lệch hẳn. Hãy tách tỉ lệ theo từng chiều (version app, loại khách, tool…), so với mức bình thường (baseline), rồi đo ảnh hưởng theo cả số lượt lẫn số khách.
- Kiểu lỗi không nằm trong thuộc tính nào của span, như hiểu sai ý khách, thì cho Claude đọc và gom cụm nội dung hội thoại.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Đối soát tiền | Usage and Cost Analytics API, không cộng từ span |
> | Cần nội dung để gỡ lỗi khi có ZDR | Metadata trên production, nội dung đầy đủ ở nơi lưu riêng, ít người đọc, tự xoá sớm |
> | Cảnh báo trên span stream có status unset | Không, đó là người dùng huỷ chứ không phải lỗi |
> | Dashboard xanh mà chất lượng tụt sau khi đổi model | SLI chất lượng theo model thật sự trả lời, canary có ngưỡng |
> | Muốn giữ mọi hội thoại lỗi | Tail sampling ở collector, theo cả hội thoại |
> | Tỉ lệ chuyển sang nhân viên tăng, 50 trace ngẫu nhiên trông ổn | Tách tỉ lệ theo từng chiều, tìm nhóm lệch |

**Học kỹ domain này**

- [3.1 Telemetry và instrumentation - trace agent, đếm token, chẩn đoán cache, ghi nội dung khi có ZDR](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/3-1-telemetry-va-instrumentation) (16 phút đọc)
- [3.2 Giám sát và cảnh báo trên production - SLI, SLO, dashboard token và chi phí, phát hiện chất lượng giảm](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/3-2-giam-sat-va-canh-bao) (16 phút đọc)
- [3.3 Phân tích trace ở quy mô lớn - lấy mẫu, gom số, phân tích cohort lỗi](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/3-3-phan-tich-trace-quy-mo-lon) (14 phút đọc)

## Domain 4: Advanced Debugging and Incident Response

### Khoanh nguyên nhân lỗi

- **Bằng chứng trước, giả thuyết sau.** Lấy **raw body** (request nguyên văn đã gửi) của lượt hỏng, gửi lại không qua harness, rồi bỏ dần từng phần cho tới khi hết lỗi.
- **Lỗi lúc có lúc không.** Chạy lại một lần thấy ổn chưa chứng minh gì. Chạy nhiều lần, đặt trace lần đúng và lần sai cạnh nhau, tìm span đầu tiên khác nhau.
- **Lỗi nhiều lượt.** Lượt trả lời sai thường không phải lượt gây lỗi. Kiểm xem thông tin cần dùng còn trong request của lượt đó không, hay đã bị cắt hoặc nén mất trước đó.
- **Lỗi nhiều agent.** Lần ngược đường giao việc về bước sai sớm nhất. Subagent làm đúng với input nó nhận thì lỗi ở prompt giao việc, và cách sửa là thêm trường bắt buộc vào prompt giao việc và định dạng kết quả trả về, thay vì viết thêm lời dặn.
- **Refusal**, tức câu model từ chối, có ba kiểu với ba nguyên nhân. Một là bộ phân loại an toàn của API chặn, response vẫn trả HTTP 200 với `stop_reason: "refusal"`. Hai là Claude tự giải thích bằng lời vì sao không làm, thường do prompt. Ba là Claude không làm theo chỉ dẫn harness đặt trong kết quả tool, vì coi đó là nội dung bên ngoài.

### Xử lý sự cố

Khi có sự cố, bước đầu là **triage** (đánh giá nhanh) xem sự cố có thật không, cái gì vừa đổi, và nặng tới đâu. Sau đó giảm thiệt hại trước, tìm nguyên nhân gốc sau.

1. **Chất lượng giảm ngay sau thay đổi của chính mình?** → Chặn hành động gây hại, rollback cả bộ cấu hình, đo lại rồi mới tìm gốc
2. **Phía nhà cung cấp đang lỗi?** → Retry, fallback, thu hẹp tính năng; rollback không giúp
- **Còn lại** → Chưa rõ thì xác nhận sự cố có thật không, cái gì vừa đổi, nặng tới đâu

- Chặn hành động gây hại bằng quyền, như tắt tool hay rút quyền, chứ không bằng lời dặn thêm vào prompt.
- Khi báo tin cho khách, số khách bị ảnh hưởng phải đếm từ dữ liệu. Nói nguyên nhân chi tiết tới đâu do người phụ trách quyết, còn chi tiết nội bộ như tên version hay dòng prompt chỉ ghi trong postmortem.
- Sự cố chỉ khép lại khi có đủ ba thứ. Một ca eval mới trượt trên bản hỏng và qua trên bản tốt. Một tín hiệu giám sát mới để lần sau phát hiện sớm hơn. Và **postmortem** (báo cáo sau sự cố) không đổ lỗi, tách nguyên nhân gốc khỏi yếu tố góp phần, mỗi việc cần làm có người nhận và hạn chót.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Vừa đổi model vừa đổi harness, có lượt trả về rỗng | Gửi lại raw body ngoài harness, bỏ dần từng phần |
> | Agent chính sai vì kết quả của subagent | Lần về prompt giao việc, thêm trường bắt buộc |
> | Chạy lại một lần thấy ổn | Chưa chứng minh gì, phải chạy nhiều lần |
> | Lỗi xuất hiện ngay sau bản prompt mới | Tắt hành động gây hại, rollback cả bộ, rồi mới tìm nguyên nhân |
> | Sửa dòng prompt rồi deploy bản mới ngay | Không, rollback về bản tốt trước |
> | Khép sự cố | Ca eval mới, tín hiệu giám sát mới, postmortem có người nhận từng việc |

**Học kỹ domain này**

- [4.1 Chẩn đoán lỗi phức tạp - tìm ra lỗi sinh ở model, harness, tool hay dữ liệu](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/4-1-chan-doan-loi-phuc-tap) (20 phút đọc)
- [4.2 Xử lý sự cố và rút kinh nghiệm - triage, giảm thiệt hại, rollback, báo tin, postmortem](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/4-2-xu-ly-su-co) (19 phút đọc)

## Domain 5: Evaluation Engineering and Quality Assurance

### Bộ eval và cổng CI/CD

- **Golden set** là bộ ca có đáp án chuẩn, có version, chạy lại sau mọi thay đổi.
- Chỉ dùng **regression suite**, bộ ca lúc nào cũng phải đạt với tỉ lệ gần 100%, làm cổng chặn release, vì tụt dù một lần là tín hiệu rõ. **Capability suite**, bộ ca khó có tỉ lệ đạt thấp, dùng để đo tiến bộ, đem làm cổng thì bản nào cũng bị chặn.
- Agent mỗi lần chạy ra kết quả khác, nên mỗi ca chạy nhiều lần trong môi trường sạch và báo **pass^k**, tỉ lệ ca mà cả k lần đều đạt.
- Hệ có truy xuất cần đo riêng truy xuất, câu trả lời cuối và **groundedness** (mỗi ý trả lời có tài liệu đỡ không). Điểm đúng sai có thể đứng yên trong khi hai thứ kia tụt mạnh.
- Bộ eval mất giá trị khi đáp án bị lộ (ca đã chép vào prompt), khi điểm chạm trần, hoặc khi lưu lượng thật có loại câu bộ không có.

### LLM-as-judge

Judge chỉ đáng tin sau khi so kết quả chấm của nó với kết quả người chấm trên cùng một bộ câu.

1. **Judge chưa được so với nhãn của người?** → Chưa giao quyền chặn release
2. **Đảo thứ tự hai câu trả lời mà judge đổi ý?** → Thiên lệch vị trí, đổi thứ tự ngẫu nhiên rồi đo lại
3. **Vừa đổi model của judge?** → Hiệu chỉnh lại, lấy mốc mới
- **Còn lại** → Đồng thuận với người đã đủ thì cho judge chặn release, vẫn theo dõi độ trôi

- Rubric, bảng tiêu chí chấm, phải rõ và có lựa chọn `unknown` khi không đủ thông tin để chấm.
- Judge nên dùng model khác với model viết câu trả lời. Kiểm cả thiên lệch vị trí lẫn thiên lệch độ dài.
- Đo bằng mức đồng thuận đã trừ phần khớp do may rủi (**Cohen's kappa**), không chỉ tỉ lệ khớp thô.

> **Bẫy đề**
>
> Mỗi bản prompt mới được judge so với câu trả lời đang chạy, bản nào cũng qua cổng mà người dùng không thấy gì tốt hơn. Lấy mẫu ra so thì judge đồng ý với người chấm chỉ nhỉnh hơn tung đồng xu, và nghiêng hẳn về câu đứng đầu.
>
> - **Đổi sang chấm điểm tuyệt đối theo rubric** (_score each answer alone on a rubric_). Né được thiên lệch vị trí, nhưng judge vẫn chưa được đo với người.
> - **Dùng model lớn hơn làm judge** (_a bigger model as judge_). Model mạnh hơn chưa chắc khớp người hơn, chưa đo thì chưa biết.
> - **Hạ ngưỡng qua cổng** (_relax the gate_). Judge còn lệch thì hạ ngưỡng chỉ làm cổng dễ dãi hơn.
>
> **Chọn:** xáo thứ tự để xử lý thiên lệch, đo lại độ khớp với người chấm, và để judge ngoài cổng release cho tới khi khớp đủ.

### Đo chất lượng trên production

Golden set chỉ chứa câu đội đã nghĩ ra. Trên production phải dùng chỉ số không cần đáp án chuẩn, như judge chấm theo rubric, trạng thái cuối của việc (đơn đã giao, ticket đã đóng), tỉ lệ người dùng phải sửa câu trả lời, hay groundedness.

- Lấy mẫu theo nhóm, nhóm nhỏ mà rủi ro cao thì lấy tỉ lệ cao hơn. Lấy đều 2% thì nhóm đó mỗi ngày chỉ có vài hội thoại và lỗi chìm trong nhiễu.
- **A/B test** chốt trước chỉ số chính và **chỉ số chặn** (guardrail metric). Chỉ số chặn tụt thì không phát hành, dù bản mới thắng ở chỉ số chính.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Chọn bộ eval làm cổng CI | Regression suite có tỉ lệ đạt gần 100% |
> | Điểm tăng sau khi chép ca eval vào few-shot | Chuyển ca đã lộ sang tập phát triển prompt, viết ca mới cùng chủ đề cho bộ eval |
> | Judge hay chọn câu đứng trước | Đổi thứ tự ngẫu nhiên, đo lại với người, chưa cho chặn release |
> | Đổi model của judge | Hiệu chỉnh lại, lấy mốc mới |
> | Prompt mới thắng chỉ số chính, thua chỉ số chặn | Không phát hành |
> | Đòi người gắn nhãn toàn bộ lưu lượng | Không làm được ở quy mô production |

**Học kỹ domain này**

- [5.1 Thiết kế hệ thống eval offline - golden set, regression suite, cổng CI/CD và giữ bộ eval còn đúng](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/5-1-thiet-ke-he-thong-eval) (18 phút đọc)
- [5.2 LLM-as-judge - rubric, thiên lệch, hiệu chỉnh với nhãn của người và độ trôi giữa các version model](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/5-2-llm-as-judge) (16 phút đọc)
- [5.3 Đo chất lượng trên production - lấy mẫu lưu lượng thật, A/B test, vòng phản hồi và chọn chỉ số theo loại việc](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/5-3-do-chat-luong-tren-production) (16 phút đọc)

## Domain 6: Cost and Latency Optimization at Scale

### Mô hình chi phí và cache

- Tính **chi phí trên mỗi việc xong**, như một hội thoại hay một bản tóm tắt, bằng cách cộng các loại token trong trường `usage` của mỗi response, đừng chỉ nhìn giá mỗi token. Việc hỏng vẫn tính tiền và còn tốn lần làm lại.
- Dự báo bằng số việc dự kiến của từng nhóm nhân chi phí mỗi việc, và ghi rõ giả định tỉ lệ đọc cache. Tỉ lệ này tụt mạnh thì chi phí mỗi hội thoại có thể tăng hơn gấp đôi.
- Prompt caching chỉ trúng khi phần đầu prompt (**prefix**) giống hệt từng byte. Tỉ lệ đọc cache tụt sau một bản deploy thì dùng **cache diagnostics**, API báo chỗ đầu tiên request lệch so với request trước (`tools_changed`, `system_changed`, `model_changed`…).

**Sơ đồ: Đổi một lớp thì mất cache từ lớp đó về sau, thêm system message ở cuối thì giữ cả prefix**
_Prefix của prompt đi theo thứ tự tools, system rồi các message, và cache chỉ trúng khi prefix giống hệt từng byte. Request trước đã cache cả prefix. Sửa tools thì cache diagnostics báo tools_changed và mọi lớp phải ghi cache lại. Sửa system thì báo system_changed, tools vẫn đọc từ cache, còn system và mọi message phía sau phải ghi lại. Đổi model thì báo model_changed và mất cache cả prefix, vì cache gắn với từng model. Thêm một message role system ở cuối hội thoại thì cả prefix cũ vẫn đọc từ cache, chỉ phần mới thêm phải ghi._

- **PREFIX SO KHỚP TỪNG BYTE TỪ ĐẦU PROMPT**
- **Request trước**: cả prefix đã cache
- tools
- system
- message
- message
- message
- **Sửa tools**: tools_changed
- tools
- system
- message
- message
- message
- **Sửa system**: system_changed
- tools
- system
- message
- message
- message
- **Đổi model**: model_changed
- tools
- system
- message
- message
- message
- **Thêm system message**: ở cuối hội thoại
- tools
- system
- message
- message
- message
- role system
- đọc từ cache
- ghi cache lại
- phần mới thêm

### Định tuyến model và batch

- Cache gắn với từng model, nên giữ một model cho cả hội thoại. Cần model khác thì giao qua subagent kèm một bản bàn giao ngắn.
- **Cascade**, cho model rẻ chạy trước rồi làm lại phần hỏng bằng model mạnh hơn, chỉ dùng được khi có bộ kiểm tự động bắt được kết quả hỏng.
- Việc không ai chờ thì gửi qua **batch**, giảm 50%, cộng dồn được với giảm giá của cache, kết quả về trong 24 giờ.

### Ngân sách theo tenant

Claude API không chặn chi tiêu theo tenant giúp bạn, nên ứng dụng phải tự làm. Gateway, lớp trung gian mọi request đi qua, giữ sổ chi tiêu cho mỗi tenant, cộng `usage` của từng response, có ngưỡng cảnh báo và ngưỡng chặn hội thoại mới. Spend limit, hạn mức chi tiêu đặt trong Console, chỉ là lớp chặn cuối.

> **Bẫy đề**
>
> Một khách hàng gói nhỏ nối script tự động vào API và tiêu gấp năm lần hạn mức tháng chỉ trong một đêm.
>
> - **Mỗi tenant một workspace có spend limit riêng** (_one workspace per tenant_). Nền tảng chặn giúp, nhưng mỗi tổ chức mặc định chỉ có 1.000 workspace, và chặn cả workspace thì mọi khách trong đó cùng mất dịch vụ.
> - **Chặn theo báo cáo của Usage and Cost API** (_block from the cost report_). Số liệu chính thức, có điều API không có chiều tenant và dữ liệu thường trễ vài giờ.
> - **Hạ `max_tokens` cho tenant đó** (_cap output length_). Model không thấy `max_tokens`, nên câu trả lời bị cắt giữa chừng mà số hội thoại không giảm.
>
> **Chọn:** sổ chi tiêu theo tenant trong gateway tính từ `usage` của từng response, còn spend limit của nền tảng làm lớp chặn cuối.

### Độ trễ

**TTFT** (thời gian tới chữ đầu tiên) khác **độ trễ tổng** (thời gian tới chữ cuối). Streaming, gửi chữ về dần trong lúc model viết, chỉ làm người dùng thấy chữ sớm hơn chứ không làm câu trả lời xong sớm hơn. Muốn xong sớm thật phải bớt số lần gọi model và bớt token model phải đọc, phải viết.

1. **Màn hình trống lâu trước khi có chữ?** → Streaming, hiện trạng thái tool ngay khi khối tool_use mở
2. **Tool độc lập bị gọi lần lượt?** → Gửi mọi tool_result trong một user message, chạy tool đồng thời
3. **Prompt dài lặp lại ở mọi request?** → Đặt điểm cache, làm ấm cache trước khi người dùng hỏi
- **Còn lại** → Vẫn chậm thì chạy thử từng mức effort trên eval, đo cả p95 lẫn chất lượng

- **Effort** là mức model nghĩ, gọi tool và tự kiểm, từ `low` tới `max`. Đổi effort giữa hội thoại có thể làm mất cache. Đổi model thì chạy thử lại từng mức, đừng giữ mức đã chọn cho model cũ.
- **Fast mode** tăng tốc độ sinh chữ tới 2,5 lần với giá gấp đôi, không giảm TTFT, chỉ có trên Opus 5.5, Fable 5.2 và Mythos 5.2.
- **Message threads** (beta) giữ hội thoại ở phía server, giảm TTFT của hội thoại rất dài nhưng không giảm chi phí và không thuộc diện ZDR.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Tỉ lệ đọc cache tụt sau một bản deploy | Cache diagnostics chỉ ra chỗ prefix bị đổi |
> | Giảm chi phí bằng đổi hay ghép model | So chi phí mỗi việc xong trên phần việc khó nhất, không theo giá mỗi token |
> | Chuyển từng lượt sang model rẻ nhất | Không, model mới phải ghi lại cả cache |
> | Việc chạy đêm, không ai chờ | Batch |
> | Màn hình trống lâu | Streaming, hiện trạng thái tool ngay khi khối tool_use mở |
> | Năm tool độc lập đi qua năm lượt gọi | Gửi mọi `tool_result` trong một user message. Đổi sang Haiku vẫn đủ năm lượt |

**Học kỹ domain này**

- [6.1 Kiến trúc chi phí ở quy mô lớn - tính và dự báo chi phí, chia việc cho nhiều model, cache, batch và ngân sách theo tenant](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/6-1-chi-phi-quy-mo-lon) (23 phút đọc)
- [6.2 Tối ưu độ trễ - TTFT và độ trễ tổng, streaming, gọi tool song song, cache, effort](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/6-2-toi-uu-do-tre) (19 phút đọc)

## Domain 7: Runtime Guardrails and Production Security

### Guardrail lúc chạy

Guardrail xếp thành nhiều lớp, dày hay mỏng tuỳ rủi ro của agent.

1. **Hành động không đảo ngược (xoá, gửi, chuyển tiền)?** → Chặn ngoài model trước khi xảy ra, bằng quyền, tool có giới hạn và người duyệt hiểu việc mình duyệt
2. **Agent vừa có dữ liệu riêng, vừa đọc nội dung lạ, vừa gửi được ra ngoài?** → Cắt ít nhất một trong ba bằng cơ chế cố định ngoài model
- **Còn lại** → Còn lại thì lọc đầu vào, lọc đầu ra, tinh chỉnh riêng cho từng loại hành động

- **Hook `PreToolUse`** là code chạy trước mỗi lần gọi tool và chặn được lệnh. Hook dùng để chặn phải đặt `onFailure: "block"` (fail-closed) để khi chính hook lỗi thì lệnh cũng bị chặn. Mặc định hook ném lỗi thì lệnh vẫn chạy.
- Luật deny so khớp theo chữ của lệnh nên dễ bị lách, như bọc lệnh cấm trong `bash -c "…"`. Chắc nhất là bỏ quyền ghi khỏi môi trường agent và cho hành động nguy hiểm đi qua một tool có giới hạn.
- Agent dùng web và chạy lệnh trong **sandbox**, môi trường cách ly không chạm production. Mỗi domain thêm vào allowlist mạng là thêm một quyền, cần duyệt như mọi lần cấp quyền.

### Phòng thủ trước tấn công

**Prompt injection** là chỉ dẫn độc cài trong nội dung agent đọc. Nguy hiểm nhất là khi agent có đủ ba thứ, gồm dữ liệu riêng tư, nội dung không tin cậy, và đường gửi ra ngoài.

**Sơ đồ: Agent có đủ ba thứ thì có đường rò, cắt một cạnh bằng cơ chế ngoài model là đường rò đứt**
_Agent dùng tool ở giữa, nối với ba thứ. Nội dung không tin cậy như ticket, CV, email đi vào agent. Dữ liệu riêng tư như hồ sơ khách trong CRM cũng đi vào agent. Agent gửi được ra ngoài qua email hay đích mạng. Đủ cả ba cạnh thì một chỉ dẫn độc trong nội dung có đường đưa dữ liệu ra ngoài. Mỗi cạnh cắt được bằng một cơ chế cố định ngoài model. Thu hẹp dữ liệu, chỉ tra tài khoản của ticket đang xử lý, cắt cạnh dữ liệu. Tách agent đọc nội dung khỏi agent hành động cắt cạnh nội dung. Allowlist người nhận hay đích mạng, hoặc người duyệt, cắt cạnh gửi ra ngoài. Lời dặn trong system prompt không cắt được cạnh nào._

- Đường đỏ là đường rò khi
- agent có đủ cả ba thứ
- **Dữ liệu riêng tư**: hồ sơ khách, CRM
- **Không tin cậy**: ticket, CV, email
- **Agent**: dùng tool
- **Gửi ra ngoài**: email, đích mạng
- **Thu hẹp dữ liệu**: chỉ tra tài khoản của ticket
- **Tách agent đọc**: khỏi agent hành động
- **Allowlist, người duyệt**: người nhận, đích mạng
- Lời dặn trong system prompt không cắt được cạnh nào

- Cắt ít nhất một trong ba bằng cơ chế cố định ngoài model, như thu hẹp dữ liệu, allowlist người nhận hay đích mạng, bắt người duyệt, hoặc tách agent đọc nội dung khỏi agent hành động.
- **Đầu độc tool** (tool poisoning) là khi MCP server cài chỉ dẫn độc vào mô tả hay kết quả tool. Chỉ kết nối MCP server đã kiểm, và để tool ghi, tool gửi ở chế độ cần duyệt.
- **Red team** tấn công qua chính các kênh agent nhận đầu vào (ticket, CV, email), dùng OWASP Top 10 for LLM và NIST AI RMF làm khung để không bỏ sót.

> **Bẫy đề**
>
> Agent hỗ trợ khách đọc ticket, tra được CRM và gửi được email. Trong đợt red team, một ticket giấu dòng chữ khiến agent tra hồ sơ khách khác rồi email ra địa chỉ bên ngoài, dù system prompt đã dặn không làm theo chỉ dẫn trong ticket.
>
> - **Cảnh báo mạnh hơn trong system prompt** (_tighten the prompt wording_). Lời dặn đã có mà vẫn bị vượt, viết mạnh hơn cũng vậy.
> - **Hạ effort** (_make the model think less_). Model có thể ít làm theo chuỗi chỉ dẫn hơn, nhưng đường rò vẫn mở.
> - **Ghi log mọi email** (_keep an email audit trail_). Log chỉ cho biết sau khi dữ liệu đã ra ngoài.
>
> **Chọn:** chặn ở tool. Email chỉ gửi tới địa chỉ trong danh sách cho phép hoặc phải qua người duyệt, và tool tra CRM chỉ tra được tài khoản gắn với ticket đang xử lý.

### Danh tính, bí mật và audit

- Agent có ba danh tính, là **workload** (dịch vụ đang chạy), **người dùng cuối** mà agent làm thay, và **chính agent**.
- **Workload Identity Federation (WIF)** đổi danh tính workload lấy token ngắn hạn, thay cho khoá API tĩnh. Rule của WIF, luật quyết định danh tính nào được đổi lấy token, phải chỉ khớp đúng service account của workload và bắt buộc có `audience`, nếu không pod nào trong cluster cũng đổi được. Ai đã đổi được token thì xem trang authentication history trong Claude Console.
- Khi truy cập dữ liệu, agent dùng credential uỷ quyền theo từng người để hệ thống phía sau tự giới hạn theo người đang hỏi.
- Bí mật nằm trong vault, agent không thấy giá trị thật, giá trị chỉ được chèn vào request lúc đi ra tới đúng host. Tool ghi, kể cả tool thêm sau, đều đặt `always_ask`.
- Audit log nối người hỏi, agent, credential và người duyệt bằng ID chung. Người duyệt thì nền tảng không ghi, ứng dụng phải tự ghi.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Lệnh xoá lọt qua luật deny | Bỏ quyền ghi khỏi môi trường agent, xoá qua một tool có giới hạn và phải có người duyệt |
> | Viết thêm "không bao giờ xoá dữ liệu" vào system prompt | Không chặn được |
> | Agent đọc nội dung lạ và gửi được ra ngoài | Allowlist người nhận hoặc người duyệt, thu hẹp dữ liệu |
> | Khoá API dùng chung, sống lâu | WIF với rule hẹp cho workload, credential uỷ quyền theo từng người |
> | Rule WIF khớp mọi service account | Sửa về đúng service account, bắt buộc `audience`, xem authentication history |
> | Cần biết ai đã duyệt hành động | Ứng dụng tự ghi người duyệt vào audit log |

**Học kỹ domain này**

- [7.1 Guardrail lúc chạy - xếp lớp theo rủi ro, che PII, chặn hành động phá huỷ, sandbox, approval gate và tinh chỉnh bộ lọc](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/7-1-guardrail-luc-chay) (20 phút đọc)
- [7.2 Phòng thủ agent trước tấn công - prompt injection, đầu độc tool và memory, rò dữ liệu, red team](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/7-2-phong-thu-tan-cong-agent) (20 phút đọc)
- [7.3 Danh tính, bí mật và audit ở quy mô lớn - danh tính agent, Workload Identity Federation, vault, quyền tối thiểu và audit log](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/7-3-dinh-danh-bi-mat-va-audit) (20 phút đọc)

## Domain 8: Agent Fleet Operations for Software Delivery

### Chạy song song nhiều coding agent

**Fan-out** là chia một việc lớn cho nhiều agent chạy song song. Cách chạy tuỳ ai giữ kế hoạch và các agent có sửa chung file không, và điều quan trọng nhất là không để hai agent sửa cùng một file.

- Mỗi phần việc sửa một nhóm file riêng và có test riêng. Phần code dùng chung làm và merge trước rồi mới chia.
- Mỗi agent làm trong một **worktree**, thư mục làm việc riêng của git trên cùng repo. Mặc định worktree rẽ nhánh từ nhánh chính trên remote, nên commit chưa push thì agent không thấy.
- Nhánh nào cũng chạy lại test trên main mới nhất. Phần sửa xung đột khi merge là một thay đổi mới, cần test và review.

**Sơ đồ: Phần dùng chung lên main trước, nhánh nào cũng test lại trên main mới nhất rồi mới merge**
_Bốn làn nhánh git. Từ main, nhánh shared làm phần code dùng chung rồi merge vào main trước khi chia việc. Từ commit merge đó mới rẽ hai nhánh module A và module B, mỗi nhánh một worktree và một nhóm file riêng. Nhánh A chạy test trên main mới nhất rồi merge vào main. Sau đó nhánh B lấy main mới nhất về, sửa xung đột nếu có, chạy test và review lại, rồi mới merge vào main._

- shared
- main
- module A
- module B
- phần dùng chung
- merge trước khi chia
- worktree A
- nhóm file A
- test trên
- main mới nhất
- merge A
- worktree B
- nhóm file B
- lấy main mới,
- sửa xung đột
- test lại,
- review lại
- merge B
- merge vào main
- test trên main mới nhất
- commit trong worktree

### Kiểm chứng và AI code review

- Agent đưa bằng chứng, tức lệnh đã chạy kèm output, trước khi mở pull request, không chỉ nói "test đều qua".
- AI reviewer mới chạy **shadow mode** trước, chỉ viết nhận xét chứ chưa chặn merge. Mỗi lỗi reviewer báo gọi là một finding. Đội hiệu chỉnh bằng cách xem finding nào được sửa theo hay bị bác, chạy reviewer trên PR từng gây sự cố và trên PR sạch. Nhiều finding sai thì sửa `REVIEW.md` (file hướng dẫn cho reviewer) rồi đo lại, đừng chồng thêm reviewer đắt hơn.
- Chỉ chặn merge với finding mức Important (lỗi nên sửa trước khi merge) ở repo rủi ro cao. Review chưa có kết luận thì tính là chưa qua.
- Repo rủi ro cao vẫn cần người duyệt. Approval chỉ có hiệu lực cho đúng commit đã duyệt, có commit mới thì duyệt lại. Vòng qua lại giữa agent và reviewer cũng có số vòng tối đa.

### Agent chạy không người trực

- Lệnh `/goal` cho agent chạy liên tục tới khi đạt điều kiện hoàn thành bạn đặt. Điều kiện phải là trạng thái đo được, có cách chứng minh và agent không lách được. Chỉ kiểm mã thoát của lệnh test thì agent bỏ qua test cũng được tính là xong.
- Việc phải chạy cả khi máy tắt dùng **cloud scheduled task**, chạy dưới tên người tạo. Mỗi task có endpoint `/fire` để công cụ cảnh báo kích hoạt một lần chạy.
- Gộp cảnh báo theo sự cố trước khi gọi `/fire`, để mỗi sự cố chỉ một lần chạy. Agent chỉ đọc, phân tích và đề xuất bằng draft PR.
- Agent ghi kết quả ra ngoài session trong lúc chạy để phần đã làm còn lại nếu session dừng. Trạng thái Succeeded chỉ nghĩa là session kết thúc không lỗi, chưa phải việc đã xong.

### Cấu hình cho cả tổ chức

- **Managed settings** là cấu hình tổ chức áp xuống Claude Code, tới máy từ nhiều nguồn như admin console, MDM hay file trên máy. Mặc định (first-wins), Claude Code chỉ dùng nguồn ưu tiên cao nhất có policy, các nguồn thấp hơn bị bỏ mà không cảnh báo.
- Server-managed settings, policy đặt trong admin console của claude.ai, không áp cho session đi qua gateway hay dùng API key tạo trong Console. Những máy đó cần file managed settings đặt trên máy, rồi kiểm bằng `/status`.
- Allowlist MCP chỉ chặn được thật khi bật `allowManagedMcpServersOnly`, key khoá không cho người dùng tự thêm server. Allowlist so theo URL hoặc lệnh, không theo tên server, vì tên do người dùng tự đặt.
- Biến OpenTelemetry chỉ bật được telemetry khi đặt trong managed settings, user settings hay shell. Đặt trong `.claude/settings.json` của repo thì bị bỏ qua.
- Plugin dùng chung được review xem nó thật sự chạy gì, và chạy eval so với điểm khi không dùng plugin. Điểm gần bằng thì plugin chưa chứng minh được giá trị.

> **Trong đề chọn gì**
>
> | Tình huống | Chọn |
> | --- | --- |
> | Nhiều nhánh song song xung đột | Sửa ở bước chia việc, làm phần dùng chung trước, mỗi agent một nhóm file |
> | Chuyển sang agent team (các agent nhắn tin trực tiếp cho nhau) để tránh sửa trùng file | Nhắn tin không thay được việc chia file |
> | Muốn cho AI review chặn merge ngay | Chạy shadow mode, hiệu chỉnh trên PR của đội, chỉ chặn ở finding Important |
> | Mỗi cảnh báo mở một lần chạy agent | Gộp cảnh báo theo sự cố trước khi gọi `/fire` |
> | Cho agent quyền retry giao dịch, rollback để khỏi chờ người | Không, agent chỉ đọc và đề xuất |
> | Khoá chế độ bỏ qua hỏi quyền trên mọi máy | File managed settings đặt trên máy, kiểm bằng `/status` |
> | Allowlist MCP theo tên server | Không chặn được, phải so theo URL hoặc lệnh và bật key khoá |

**Học kỹ domain này**

- [8.1 Chạy song song nhiều coding agent - chia việc, worktree riêng, chiến lược merge và telemetry của cả nhóm agent](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-1-chay-song-song-coding-agent) (20 phút đọc)
- [8.2 Kiểm chứng và vận hành AI code review - shadow mode, hiệu chỉnh với review của người, cổng merge và thiết kế giám sát](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-2-kiem-chung-va-ai-code-review) (20 phút đọc)
- [8.3 Agent chạy không người trực - chạy tới mục tiêu, theo lịch và theo sự kiện, với checkpoint, thông báo và leo thang](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-3-agent-chay-khong-nguoi-truc) (20 phút đọc)
- [8.4 Cấu hình coding agent cho cả tổ chức - managed settings, MCP allowlist, telemetry, gateway và chuẩn chia sẻ skill, plugin](https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-4-cau-hinh-toan-to-chuc) (21 phút đọc)

## Mẹo chọn đáp án khi phân vân

Khi phân vân giữa hai đáp án, thử lần lượt các nguyên tắc sau.

1. Phân loại trước rồi mới xử lý. Một đường xử lý chung cho mọi loại lỗi thường chính là nguyên nhân gốc.
2. Cơ chế chặn ngoài model đáng tin hơn lời dặn trong prompt. Hành động không đảo ngược được thì chặn bằng quyền, allowlist hay người duyệt.
3. Chưa đo thì chưa giao quyền. Judge, AI reviewer, model hay prompt mới đều phải được đo trên dữ liệu của bạn trước khi được quyết thay người.
4. Đề hỏi làm gì trước tiên thì đáp án thường là chặn thiệt hại hoặc đo cho rõ, như rollback, tắt tool gây hại hay đo trên mẫu, chưa phải tìm nguyên nhân.
5. Nhìn tỉ lệ theo nhóm, đừng nhìn vài trace, vì lỗi có hệ thống lộ ra ở một nhóm.
6. Sửa đúng nguyên nhân gốc thay vì làm mạnh tay hơn. Tăng retry, đổi model lớn hơn, chạy lại tất cả hay tắt hẳn tính năng là các đáp án nhiễu quen thuộc.
7. Dùng cách tự làm được trước khi xin thêm, như cache, tách làn và batch trước khi xin nâng limit, hạ effort trước khi đổi model.

## Tên trong đề và tên hiện nay

Một vài tên trong đề nay đã có tính năng riêng. Bảng sau đối chiếu.

| Trong đề | Hiện nay |
| --- | --- |
| **safety-handling path** cho câu bị từ chối | Claude API có `fallbacks` (beta), request bị từ chối sẽ tự chạy lại trên model được khuyến nghị. Trên nền tảng khác thì dùng middleware của SDK. Lỗi rate limit vẫn cần retry riêng |

## Nguồn

1. [Exam Guide CCDV-P v1.0](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Handling stop reasons (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)
3. [Rate limits (Claude API Docs)](https://platform.claude.com/docs/en/api/rate-limits)
4. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
5. [Optimizing for cost and intelligence (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)
6. [Parallel tool use (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use)
7. [Mitigate jailbreaks and prompt injections (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)
