---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-2-dieu-phoi-nhieu-agent
ngay_tai: 2026-11-27
tieu_de: Điều phối nhiều agent theo mô hình coordinator–subagent
---

Domain 1: Agentic Architecture & Orchestration · Task 1.2

# Điều phối nhiều agent theo mô hình coordinator–subagent

Agent điều phối chọn subagent theo câu hỏi, chia phạm vi cho đủ và không trùng, tìm chỗ còn thiếu để giao thêm, và giữ mọi trao đổi đi qua nó.

- 17 phút đọc
- Đối chiếu docs 22/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Thiết kế hệ thống nhiều agent theo kiểu hub-and-spoke, mọi trao đổi và lỗi đều đi qua agent điều phối
- Biết subagent chỉ nhận được đúng phần việc agent điều phối giao, không thấy hội thoại của nó
- Để agent điều phối chọn gọi subagent nào theo độ phức tạp của câu hỏi, thay vì lần nào cũng chạy đủ cả chuỗi
- Chia phạm vi nghiên cứu để không sót mảng nào và các subagent không làm trùng nhau
- Dựng vòng lặp tìm chỗ còn thiếu trong bản tổng hợp rồi giao thêm việc cho tới khi đủ

Một hệ thống nhiều agent thường có một agent điều phối (**coordinator**) và vài subagent, mỗi subagent làm một phần việc. Agent điều phối nhận câu hỏi, chia việc, giao cho subagent, gom kết quả rồi trả lời. Hệ thống chạy tốt hay không phần lớn nằm ở agent điều phối: nó chia việc có đủ không, có gọi subagent thừa không, và có nhận ra kết quả còn thiếu không.

Bài này dùng mô hình **hub-and-spoke**. Agent điều phối đứng ở giữa, mọi trao đổi giữa các subagent đều đi qua nó, và nó cũng là nơi quyết định xử lý lỗi thế nào, thông tin nào được đưa cho ai (**information routing**). Mỗi subagent có context riêng (**isolated context**). Context là toàn bộ những gì model nhìn thấy khi làm việc: prompt, các message trước đó, kết quả tool. Subagent không tự thừa hưởng lịch sử hội thoại của agent điều phối.

Việc của agent điều phối gồm chia việc (**task decomposition**), giao việc (**delegation**), gom kết quả (**result aggregation**), và chọn gọi subagent nào theo độ phức tạp của câu hỏi (**query complexity**). Các mục sau đi qua từng việc, cùng hai lỗi hay gặp khi chia việc và vòng lặp giao thêm khi bản tổng hợp còn thiếu.

**Sơ đồ: Mọi việc giao, kết quả và lỗi đều đi qua agent điều phối, các subagent không gửi thẳng cho nhau**
_Mô hình hub-and-spoke: người dùng chỉ hỏi và nhận báo cáo từ agent điều phối; agent điều phối có bốn việc, giao prompt xuống từng subagent tim-web, doc-van-ban, tong-hop và nhận kết quả hoặc lỗi lên; khi bản tổng hợp còn thiếu, nó quay lại bước giao việc; các subagent không gửi thẳng cho nhau, mỗi subagent có context riêng_

- Người dùng
- câu hỏi
- báo cáo
- **Agent điều phối (coordinator)**: trục (hub): log, retry, xử lý lỗi ở một chỗ
- Chọn gọi ai
- query complexity
- Chia việc
- task decomposition
- Giao việc
- delegation
- Gom kết quả
- result aggregation
- còn thiếu thì giao thêm
- (refinement loop)
- giao việc
- kết quả, lỗi
- giao việc
- kết quả, lỗi
- giao việc
- kết quả, lỗi
- **tim-web**: tìm tin trên web
- **doc-van-ban**: đọc văn bản PDF dài
- **tong-hop**: viết bản báo cáo
- gạch đỏ có dấu X: subagent không gửi thẳng cho nhau
- **MỖI SUBAGENT CÓ CONTEXT RIÊNG (ISOLATED CONTEXT)**

## Ví dụ xuyên suốt: trợ lý nghiên cứu của một hiệp hội xuất khẩu thủy sản

Một hiệp hội xuất khẩu thủy sản có khoảng 200 doanh nghiệp hội viên, mỗi tuần nhận chừng 40 câu hỏi về thị trường và quy định nhập khẩu của các nước. Đội kỹ thuật của phòng chính sách dựng một trợ lý nghiên cứu bằng Agent SDK, bộ thư viện của Anthropic để viết agent chạy trên Claude. Agent điều phối giao việc cho ba subagent: `tim-web` tìm tin tức và bài phân tích trên web, `doc-van-ban` đọc các văn bản quy định dài dạng PDF, và `tong-hop` viết bản báo cáo từ các kết quả gom được. Câu hỏi có loại chỉ cần một con số, có loại cần một báo cáo vài trang.

## Vì sao mọi trao đổi đi qua agent điều phối

Ở bản đầu, đội cho `tim-web` ghi kết quả ra một thư mục dùng chung, rồi `doc-van-ban` tự đọc thư mục đó để biết cần đọc văn bản nào. Mỗi subagent cũng có cách retry riêng khi gặp lỗi và ghi log theo một kiểu riêng. Một hôm `tim-web` bị lỗi giữa chừng khi tìm tin về thị trường Nhật Bản. `doc-van-ban` thấy thư mục rỗng, tưởng không có văn bản nào cần đọc, và bản báo cáo gửi hội viên không nhắc gì tới quy định của Nhật. Log của `tim-web` có ghi lỗi, còn log của `doc-van-ban` chỉ thấy một thư mục rỗng, nên không ai nối được lỗi đó với bản báo cáo thiếu Nhật Bản.

Mô hình hub-and-spoke tránh được chuyện này. Agent điều phối là trục (hub), các subagent là nan (spoke). Subagent nhận việc từ agent điều phối, trả kết quả hay báo lỗi về agent điều phối, và không gửi thẳng cho nhau. Agent SDK có tool `SendMessage` cho các agent nhắn nhau, nhưng mô hình này chọn không dùng để giữ một chỗ duy nhất theo dõi được mọi việc. Khi `doc-van-ban` cần biết `tim-web` tìm được gì, agent điều phối nhận kết quả của `tim-web` rồi đưa phần liên quan vào prompt giao việc cho `doc-van-ban`.

Đi vòng qua trục có lợi ở ba chỗ. Bạn chỉ cần đọc log của agent điều phối là thấy việc nào đã giao cho ai và ai trả về gì (**observability**). Lỗi ở subagent nào cũng đổ về một chỗ, nên agent điều phối xử lý chúng theo cùng một cách (**consistent error handling**): retry, giao cho subagent khác, hay báo người dùng phần nào còn thiếu. Và vì subagent chỉ nhận phần việc và dữ liệu mà agent điều phối chọn đưa vào prompt giao việc, bạn kiểm soát được thông tin đi đâu (**controlled information flow**).

Đội sửa lại theo hướng đó. Việc retry, việc chờ khi chạm rate limit và việc ghi log giờ đều nằm ở agent điều phối, còn subagent chỉ báo kết quả hay báo lỗi về. Khi `tim-web` lỗi, agent điều phối thấy ngay và ghi trong báo cáo rằng phần thị trường Nhật Bản chưa có dữ liệu.

**Sơ đồ: Lỗi ở tim-web: qua thư mục chung thì không ai nối được, qua trục thì báo cáo ghi rõ phần thiếu**
_Hai cách cho subagent trao đổi: bản đầu tim-web ghi vào thư mục dùng chung, doc-van-ban tự đọc thư mục rỗng, dẫn tới báo cáo thiếu Nhật Bản mà không ai nối được lỗi với hậu quả; bản sửa tim-web báo lỗi về agent điều phối, agent điều phối giao việc và nhận kết quả từ doc-van-ban, dẫn tới báo cáo ghi rõ phần Nhật Bản chưa có dữ liệu_

- **BẢN ĐẦU: SUBAGENT TRAO ĐỔI QUA THƯ MỤC CHUNG**
- **tim-web**: lỗi khi tìm Nhật
- ghi
- **Thư mục**: chung, rỗng
- đọc
- **doc-van-ban**: không đọc gì cả
- **Báo cáo**: thiếu Nhật Bản
- Lỗi ghi ở log của tim-web, hậu quả lộ ra ở doc-van-ban, nên không ai nối được hai chuyện
- **BẢN SỬA: MỌI TRAO ĐỔI VÀ LỖI ĐI QUA TRỤC**
- **tim-web**: lỗi khi tìm Nhật
- báo lỗi
- **Agent điều phối**: log và retry ở một chỗ
- giao việc
- kết quả
- **doc-van-ban**: đọc theo prompt
- **Báo cáo ghi rõ**: phần Nhật Bản chưa có dữ liệu
- Đọc log của agent điều phối là thấy việc nào giao cho ai, ai trả về gì
- ghi, đọc file
- tin nhắn qua agent điều phối
- dẫn tới kết quả

> **Bẫy đề**
>
> `tim-web` đã tìm được vài bài phân tích về quy định của Hàn Quốc, và giờ `doc-van-ban` cần đọc các văn bản gốc liên quan. Thông tin nên đi giữa hai subagent này thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Hai subagent dùng chung một memory store** (_a shared memory store_). Subagent sau chỉ việc đọc thứ subagent trước đã ghi, nên cách này trông gọn. Thực ra đó chính là thư mục dùng chung của bản đầu, nơi lỗi ở một bên lộ ra ở bên kia mà agent điều phối không hề biết.
> - **`tim-web` gọi thẳng `doc-van-ban`** (_the web search agent calls the analysis agent directly_). Bớt được một bước trung gian thật, có điều agent điều phối sẽ mất dấu luồng việc, và lỗi cũng không còn một chỗ chung để xử lý.
> - **Trao đổi qua một message queue** (_an event-driven message queue_). Message queue là hạ tầng quen thuộc của dân backend. Dù vậy, hai subagent vẫn nói chuyện với nhau mà không qua trục.
>
> **Chọn:** agent điều phối nhận kết quả của `tim-web` rồi đưa phần liên quan vào prompt khi giao việc cho `doc-van-ban`. Nếu đề tả cảnh mỗi subagent tự retry và ghi log theo kiểu riêng, hãy chọn đáp án dồn việc retry và ghi log về agent điều phối.

## Subagent biết được những gì

Một hội viên hỏi: "Thị trường Hàn Quốc năm nay khó hơn năm ngoái ở điểm nào?". Lần này agent điều phối không chép gì từ câu hỏi sang, chỉ giao cho `tong-hop` một dòng: "So sánh với năm ngoái và nêu điểm khác". Bản trả về nói chung chung về xuất khẩu thủy sản, không nhắc tới Hàn Quốc. `tong-hop` không biết "năm ngoái" là năm nào, so cái gì, cho thị trường nào, vì nó không thấy câu hỏi của hội viên.

Mỗi subagent chạy trong một cuộc hội thoại riêng, lúc bắt đầu thì trống trơn. Nó không thấy lịch sử hội thoại của agent điều phối, không thấy kết quả các tool mà agent điều phối đã gọi, cũng không thấy system prompt của agent điều phối. Lúc khởi động, subagent chỉ có system prompt của riêng nó, các tool được cấp cho nó và file CLAUDE.md của dự án. Thứ duy nhất agent điều phối truyền sang được là đoạn prompt nó viết khi giao việc. Chiều ngược lại, các bước làm và kết quả tool của subagent ở lại trong context của nó, chỉ câu trả lời cuối cùng được gửi về agent điều phối.

Context riêng là lý do người ta dùng subagent. `doc-van-ban` có thể đọc một văn bản quy định dài hàng trăm trang mà không làm đầy context của agent điều phối, vì agent điều phối chỉ nhận về bản tóm tắt cuối cùng. Mặt trái là subagent không tự đoán được những gì bạn không viết ra. Quay lại câu hỏi về Hàn Quốc, đội viết lại prompt giao việc cho `tong-hop`, ghi rõ thị trường Hàn Quốc, hai năm cần so, và các kết quả `tim-web` cùng `doc-van-ban` đã tìm được.

> **Ý chính**
>
> Viết prompt giao việc như viết cho một người chưa nghe câu hỏi gốc: ghi rõ câu hỏi, phạm vi và những gì các subagent khác đã tìm được.

## Agent điều phối chọn gọi subagent nào theo câu hỏi

Một hội viên hỏi: "Mức dư lượng tối đa cho phép của một loại kháng sinh trong tôm xuất sang Úc là bao nhiêu?". Agent điều phối lúc đó lần nào cũng chạy đủ chuỗi `tim-web`, `doc-van-ban` rồi `tong-hop`. Câu hỏi chỉ cần một con số mà mất gần 50 giây, và `tong-hop` viết hẳn một báo cáo ba mục cho con số đó.

Ngoài chia việc, giao việc và gom kết quả, agent điều phối còn một việc hay bị bỏ qua: quyết định có cần gọi subagent nào không, và gọi bao nhiêu. Câu hỏi tra một con số có thể chỉ cần một subagent đọc đúng văn bản. Câu hỏi so sánh hai thị trường cần vài subagent. Câu hỏi "toàn cảnh rào cản xuất khẩu sang EU" mới cần cả chuỗi. Agent điều phối nên phân tích từng câu hỏi lúc chạy (_analyze query requirements_) rồi chọn subagent theo những gì câu hỏi đó cần (**dynamically select**), thay vì lần nào cũng đi qua cả chuỗi (_always routing through the full pipeline_).

Claude không tự biết một câu hỏi đáng bỏ bao nhiêu công sức, nên bạn cần ghi quy tắc về chuyện đó thẳng vào prompt của agent điều phối. Anthropic có dựng một hệ thống nghiên cứu nhiều agent cho chính Claude, và prompt của agent điều phối trong hệ thống đó có sẵn các quy tắc như vậy. Tra một dữ kiện đơn giản chỉ cần 1 agent với 3–10 lần gọi tool. So sánh trực tiếp có thể cần 2–4 subagent, mỗi subagent 10–15 lần gọi. Nghiên cứu phức tạp có thể dùng hơn 10 subagent, mỗi subagent một phần việc rõ ràng. Nếu không có các quy tắc này, agent điều phối hay làm quá tay với cả những câu hỏi đơn giản.

Có trường hợp agent điều phối không cần gọi subagent nào. Sau khi nhận báo cáo về Hàn Quốc, hội viên nhắn: "Tóm tắt giúp mình ba ý chính". Thế mà agent điều phối vẫn gọi `tong-hop`, chép khoảng 60.000 token vào prompt giao việc, và hội viên chờ hơn nửa phút. Số token đó là các câu trả lời cuối của ba subagent cùng bản báo cáo, vốn đã nằm sẵn trong context của agent điều phối, nên nó tự tóm tắt là đủ.

**Sơ đồ: Agent điều phối đọc từng câu hỏi rồi mới chọn gọi ai, có khi không gọi subagent nào**
- tra một con số
- so sánh hai thị trường
- toàn cảnh rào cản EU
- tóm tắt báo cáo vừa làm
- Câu hỏi của hội viên
- Agent điều phối:câu hỏi cần gì?
- chỉ doc-van-ban,không chạycả chuỗi
- vài subagent
- cả chuỗi tim-web,doc-van-ban,tong-hop
- tự trả lờitừ context, khônggọi subagent

> **Bẫy đề**
>
> Câu hỏi tra một con số cũng đi qua cả ba subagent và mất gần 50 giây, còn câu hỏi tổng quan thì thật sự cần đủ cả chuỗi. Loại câu hỏi của hội viên đổi theo mùa vụ và theo tin tức. Làm sao để mỗi câu hỏi chỉ gọi đúng các subagent nó cần? Ba cách sau nghe hợp lý nhưng sai:
>
> - **Huấn luyện một bộ phân loại độ phức tạp** (_train a query complexity classifier on labeled historical data_). Có sẵn dữ liệu lịch sử nên ai cũng muốn thử cách này. Có điều câu hỏi đổi liên tục, nên bạn phải gán nhãn dữ liệu và huấn luyện lại bộ phân loại mãi, trong khi agent điều phối đọc được từng câu hỏi ngay lúc chạy.
> - **Xếp câu hỏi theo mẫu rồi gán sẵn tổ hợp subagent** (_pattern-based routing to predefined subagent combinations_). Một bảng ghi sẵn loại câu hỏi nào gọi subagent nào thì dễ đọc và dễ kiểm tra. Câu hỏi nằm ngoài các mẫu đã định lại đi sai đường, và mỗi loại câu hỏi mới lại phải sửa bảng.
> - **Làm đường tắt cho câu hỏi tra dữ kiện, còn lại chạy đủ chuỗi** (_a shortcut path that bypasses subagents for factual questions_). Câu hỏi tra dữ kiện thì nhanh hơn thật. Còn câu so sánh hai thị trường vẫn phải chạy đủ chuỗi, dù chỉ cần hai subagent.
>
> **Chọn:** để agent điều phối phân tích từng câu hỏi lúc chạy và tự chọn gọi subagent nào. Nếu kết quả cần dùng đã nằm sẵn trong context của agent điều phối, như khi tóm tắt lại báo cáo vừa làm, để nó tự trả lời.

## Chia phạm vi cho đủ và không trùng

Một hội viên đặt câu hỏi lớn: "Những rào cản nào sẽ làm khó hàng thủy sản xuất sang EU năm tới?". Từng subagent đều chạy xong, không báo lỗi, và báo cáo viết mạch lạc. Nhưng báo cáo chỉ nói về dư lượng kháng sinh, không có chữ nào về truy xuất nguồn gốc, nhãn mác hay thuế. Log của agent điều phối cho thấy nó chia câu hỏi thành ba việc: "dư lượng kháng sinh trong tôm", "dư lượng kháng sinh trong cá tra" và "dư lượng kháng sinh trong mực".

Các subagent đã làm đúng việc được giao. Lỗi nằm ở chính các việc được giao: agent điều phối chia câu hỏi theo mặt hàng, rồi cả ba việc đều chỉ xoay quanh một loại rào cản. Đây là kiểu chia việc quá hẹp (**overly narrow task decomposition**). Các subagent phủ kín một góc nhỏ của câu hỏi lớn, và không ai nhận ra phần còn lại bị bỏ trống. Khi báo cáo thiếu cả một mảng, hãy đọc log chia việc của agent điều phối trước, rồi mới nghi tới subagent.

Lần chạy sau, đội gặp lỗi ngược lại. Agent điều phối giao hai việc nghe khác nhau, "quy định an toàn thực phẩm của EU" và "yêu cầu kiểm dịch khi nhập vào EU". Hai lượt chạy cùng đọc một văn bản quy định về kiểm soát dư lượng, và báo cáo có hai đoạn gần như giống nhau. Hệ thống nghiên cứu của Anthropic cũng từng gặp chuyện này: khi agent điều phối chỉ giao việc bằng một câu ngắn, các subagent hiểu sai việc hoặc tìm y hệt nhau.

Để không sót và không trùng, đội đổi cả cách chia lẫn cách viết từng việc giao (**partitioning research scope**). Có hai cách chia hay dùng:

- Chia theo các mảng không chồng lên nhau của câu hỏi: an toàn thực phẩm, truy xuất nguồn gốc, nhãn mác, thuế và hạn ngạch. Mỗi mảng là một lượt giao việc riêng. Agent điều phối có thể gọi `tim-web` hay `doc-van-ban` nhiều lần, mỗi lần cho một mảng.
- Chia theo loại nguồn: `tim-web` lo tin tức và bài phân tích, `doc-van-ban` lo văn bản quy định gốc. Hai subagent cùng một chủ đề mà khác nguồn thì ít khi làm trùng.

Dù chia kiểu nào, mỗi việc giao cũng phải ghi đủ bốn thứ: mục tiêu, dạng kết quả cần trả về, nên dùng tool và nguồn nào, và ranh giới của việc (mảng nào không thuộc phần mình).

**Sơ đồ: Chia theo mặt hàng dồn cả ba việc vào một mảng, ba mảng còn lại không ai được giao**
_Câu hỏi rào cản xuất sang EU: chia theo mặt hàng thì ba việc tôm, cá tra, mực đều về dư lượng kháng sinh, bỏ trống truy xuất nguồn gốc, nhãn mác, thuế và hạn ngạch; chia theo mảng thì mỗi mảng một lượt giao việc_

- **Chia theo mặt hàng**
- **Chia theo mảng**
- **An toàn thực phẩm**
- **Truy xuất nguồn gốc**
- **Nhãn mác**
- **Thuế và hạn ngạch**: tôm
- cá tra
- mực
- đều về dư lượng kháng sinh
- trống: không ai được giao
- trống: không ai được giao
- trống: không ai được giao
- một lượt giao việc
- một lượt giao việc
- một lượt giao việc
- một lượt giao việc
- Báo cáo chỉ nói về kháng sinh
- Mỗi việc ghi rõ ranh giới,
- mảng nào không thuộc phần mình

Chia được thành các mảng không chồng lên nhau thì còn một cái lợi nữa: các lượt giao việc có thể chạy song song. Agent điều phối giao việc cho subagent bằng một tool, trong Agent SDK hiện nay tên là `Agent`. Tên cũ của nó là `Task`, và đề cũng như danh sách tool trong message `system:init` của SDK vẫn dùng tên này. Để chạy song song, agent điều phối gọi tool này nhiều lần ngay trong cùng một response, mỗi lần cho một mảng, chứ không gọi một lần rồi chờ xong mới gọi tiếp. Trong hệ thống nghiên cứu của Anthropic, khi agent điều phối chạy 3–5 subagent song song và mỗi subagent gọi từ 3 tool trở lên cùng lúc, thời gian nghiên cứu một câu hỏi phức tạp giảm tới 90%.

> **Bẫy đề**
>
> Báo cáo về rào cản xuất sang EU chỉ nói về dư lượng kháng sinh, trong khi log cho thấy agent điều phối chia câu hỏi thành ba việc đều về kháng sinh. Nguyên nhân gốc nằm ở đâu? Với tình huống này, ba đáp án sau nghe hợp lý nhưng sai:
>
> - **`tong-hop` thiếu chỉ dẫn để nhận ra chỗ thiếu** (_the synthesis agent lacks instructions for identifying coverage gaps_). `tong-hop` là bên viết ra báo cáo thiếu, nên dễ bị đổ lỗi trước. Thực ra nó chỉ nhận được kết quả về kháng sinh, nên không có gì để tổng hợp về nhãn mác hay thuế.
> - **Truy vấn của `tim-web` chưa đủ rộng** (_the web search agent's queries are not comprehensive enough_). Mở rộng truy vấn có vẻ sẽ tìm thêm được nhiều thứ, nhưng `tim-web` đang tìm đúng việc nó được giao, mà việc đó chỉ là kháng sinh.
> - **`doc-van-ban` lọc bỏ văn bản quá tay** (_overly restrictive relevance criteria_). Bộ lọc chặt đúng là có thể làm sót tài liệu. Ở đây log không cho thấy nó lọc bỏ văn bản nào, và nó cũng chỉ được giao đọc văn bản về kháng sinh.
>
> **Chọn:** cách chia việc của agent điều phối quá hẹp, nên các việc giao cho subagent không phủ hết các mảng của câu hỏi.

## Vòng lặp tìm chỗ còn thiếu

Sau khi đội sửa cách chia việc theo mảng, bản tổng hợp của `tong-hop` vẫn còn một dòng: "Chưa tìm thấy thông tin về yêu cầu nhãn sinh thái cho hàng đông lạnh". Lúc đó, agent điều phối cứ nhận bản tổng hợp xong là gửi ngay cho hội viên. Dòng ghi chú của `tong-hop` nằm nguyên trong báo cáo, và không ai tìm thêm.

Một agent điều phối tốt không dừng ngay khi có bản tổng hợp đầu tiên (**iterative refinement loop**). Nó đọc bản tổng hợp, tìm chỗ còn thiếu, giao thêm việc cho `tim-web` và `doc-van-ban` với truy vấn nhắm đúng chỗ đó, rồi gọi `tong-hop` viết lại với thông tin mới. Vòng này lặp tới khi các mảng của câu hỏi đã có đủ thông tin. Nhận xét kiểu "còn thiếu phần nhãn sinh thái", dù đến từ `tong-hop` hay `doc-van-ban`, phải quay về agent điều phối, vì chỉ nó mới giao được việc mới. `doc-van-ban` thường là bên nhận ra chỗ thiếu sớm nhất, nên prompt giao việc dặn nó ghi cụ thể chỗ thiếu trong câu trả lời, để agent điều phối không phải tự dò dấu hiệu thiếu trong kết quả. Nếu subagent nào cũng tự đi tìm thêm, agent điều phối lại mất dấu luồng việc như ở bản đầu.

Vòng lặp này cũng cần điểm dừng. Có những thông tin không hề có trên web, tìm bao nhiêu cũng không ra. Đội đặt cho agent điều phối tối đa 3 vòng giao thêm cho một câu hỏi. Sau 3 vòng mà vẫn thiếu thì báo cáo ghi rõ phần nào chưa tìm được và vì sao.

1. **Bản tổng hợp còn chỗ thiếu, chưa đủ 3 vòng?** → Giao thêm cho tim-web, doc-van-ban với truy vấn nhắm đúng chỗ thiếu, rồi gọi tong-hop viết lại
2. **Vẫn thiếu sau 3 vòng?** → Gửi báo cáo, ghi rõ phần chưa tìm được và vì sao
- **Còn lại** → Gửi báo cáo cho hội viên

> **Trong đề chọn gì**
>
> Nếu đề tả cảnh bản tổng hợp đã báo còn chỗ thiếu mà hệ thống vẫn đi thẳng tới báo cáo cuối, hãy chọn đáp án mà agent điều phối đọc lại bản tổng hợp, giao thêm việc với truy vấn nhắm đúng chỗ thiếu cho các subagent tìm kiếm và đọc tài liệu (như `tim-web`, `doc-van-ban`), rồi gọi subagent tổng hợp viết lại. Ba đáp án sau đều không lấp được chỗ thiếu: cho subagent tổng hợp tự gọi tool tìm kiếm, mở rộng truy vấn ngay từ đầu, hoặc chỉ ghi chú phần chưa trả lời được.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/research/multi-agent-research-system)
3. [Subagents in the SDK (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/subagents)
