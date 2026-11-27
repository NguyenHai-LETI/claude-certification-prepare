---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/on-nhanh
ngay_tai: 2026-11-27
tieu_de: Tổng quan CCAO-F
---

# Tổng quan CCAO-F

Cả chứng chỉ CCAO-F trên một trang, giải thích ngay tại chỗ, kèm sơ đồ, bẫy đề và bảng chọn nhanh. Chưa học bài nào vẫn đọc được.

- 31 phút đọc
- Đối chiếu docs 07/11/2026
- 8 nguồn

Đọc trang này đầu tiên. Nó gói cả chứng chỉ vào một chỗ: mỗi khái niệm được giải thích ngay tại chỗ bằng lời thường, có sơ đồ ở những chỗ cần hình dung thứ tự, nên chưa học gì bạn vẫn đọc hiểu được. Cuối mỗi domain có các bài để học kỹ hơn (số bài ghi trong ngoặc). Trước giờ thi, quay lại đây ôn các bảng **Trong đề chọn gì**.

CCAO-F dành cho người dùng Claude trong công việc hằng ngày (vận hành, marketing, quản lý dự án, giáo dục, truyền thông), không dành cho lập trình viên. Đề không hỏi API hay code; nó hỏi bạn viết prompt, kiểm kết quả, chọn tính năng, cấu hình Project và dùng AI có trách nhiệm ra sao.

## Đề thi gồm những gì

| Mục | Chi tiết |
|---|---|
| Số câu | 60, một đáp án hoặc nhiều đáp án (câu nào cũng ghi rõ chọn mấy) |
| Thời gian | 120 phút |
| Cấu trúc | Mỗi câu là một tình huống riêng |
| Điểm đậu | 720 trên thang 100–1.000 |
| Lệ phí, hiệu lực | $99; chứng chỉ có hiệu lực 12 tháng, gia hạn đúng hạn bằng bài đánh giá miễn phí |
| Kết quả | Đạt hay không, điểm quy đổi, và tỉ lệ đúng theo từng domain |

| Domain | Tỉ trọng | Hỏi về |
|---|---|---|
| 1. Prompting and Task Execution | 14% | Viết prompt, chia nhỏ việc, lặp prompt, đổi cách prompt theo loại việc |
| 2. Output Evaluation and Validation | 21% | Kiểm đúng và đủ, hallucination, kiểm chứng, khi nào cần người duyệt, chỉnh cho người đọc, chọn khuôn đầu ra |
| 3. Product and Model Selection | 12% | Chọn tính năng, các dòng model, chọn model theo việc, context và Memory |
| 4. Workflow Integration and Solution Design | 16% | Phân tích yêu cầu, nghiên cứu và lập kế hoạch, thiết kế giải pháp, đưa Claude vào quy trình, nói với các bên |
| 5. Configuration and Knowledge Management | 12% | Cấu hình Project, tài liệu và connector, chỉ dẫn cấp hệ thống, bảo trì |
| 6. Governance, Risk, and Responsible Use | 15% | Việc nên và không nên, dữ liệu nhạy cảm, chính sách tổ chức, đạo đức |
| 7. Troubleshooting and Optimization | 10% | Chẩn đoán kết quả kém, điều chỉnh theo phản hồi, tối ưu quy trình |

Domain 2 lớn nhất: cứ năm câu thì có một câu hỏi cách kiểm kết quả của Claude. Nhiều câu là dạng **xếp thứ tự các bước** (chọn dãy số như "3, 5, 1, 2, 4") hoặc **chọn hai việc phải làm trước**.

Trang chứng chỉ trên Anthropic Partner Academy báo nội dung đề sẽ đổi từ 07/12/2026. Các bài ở đây bám tài liệu hướng dẫn đề thi chính thức bản 1.0 (07/2026), là bản đang dùng cho tới mốc đó.

## Khung AI Fluency: bốn chữ D

Đề CCAO-F hay gọi tên bốn năng lực trong khung **AI Fluency** của Anthropic và hai giáo sư Rick Dakan, Joseph Feller. Gặp tên nào thì nhớ nó hỏi gì:

| Năng lực | Là gì | Đáp án đúng thường là |
|---|---|---|
| **Delegation** | Quyết định giao gì cho AI, giữ gì cho người | Xét hậu quả khi sai, có đảo ngược được không, bước đó có cần phán đoán, thấu cảm của con người không |
| **Description** | Nói cho AI biết mình cần gì | Nêu rõ phạm vi việc, khuôn đầu ra, người đọc, ràng buộc |
| **Discernment** | Đánh giá cái AI trả về | Kiểm có hệ thống theo yêu cầu, tài liệu nguồn và chuẩn nghề nghiệp trước khi chia sẻ |
| **Diligence** | Chịu trách nhiệm với kết quả | Người làm vẫn chịu trách nhiệm đầy đủ, tự kiểm và sửa, minh bạch về vai trò của AI |

Description chia thành Product (sản phẩm cuối), Process (cách làm) và Performance (cách Claude cư xử khi làm cùng bạn). Delegation dựa trên Problem Awareness, Platform Awareness và Task Delegation. Có ba cách làm việc với AI: **Automation** (AI làm một việc theo chỉ dẫn), **Augmentation** (người và AI cùng làm), **Agency** (người thiết lập để AI tự làm thay).

> Bẫy đề
>
> Mọi đáp án kiểu "câu chữ trôi chảy nên chắc đúng", "có AI hỗ trợ thì trách nhiệm không còn hoàn toàn ở mình", hay "giao trách nhiệm cho chính Claude" đều sai với cả Discernment lẫn Diligence.

## Domain 1: Prompting and Task Execution

Domain này hỏi cách viết một prompt dùng được ngay, khi nào chia việc lớn thành nhiều bước, lặp prompt thế nào cho có ích, và đổi cách prompt theo loại việc.

### Prompt tốt gồm những gì

Coi Claude như một người mới vào việc: giỏi nhưng không biết gì về bạn. Phần nào bạn không nói, Claude tự đoán. Một prompt tốt có năm phần:

| Phần | Câu hỏi |
|---|---|
| Việc cần làm | Claude phải làm ra cái gì? |
| Người đọc và mục đích | Ai đọc, đọc xong họ cần làm gì? |
| Dữ kiện | Thông tin gì Claude không thể tự biết? |
| Ràng buộc | Điều gì bắt buộc hoặc không được làm? |
| Khuôn đầu ra | Độ dài, giọng, bố cục |

- Nói lý do; nói điều cần làm thay vì điều cấm; bước nào cần đúng thứ tự thì đánh số; có ví dụ thì đưa ví dụ (1.1).
- Biến yêu cầu viết vội thành prompt: **tìm việc thật sự → xác nhận người đọc và quyết định cần hỗ trợ → dữ kiện, ràng buộc → độ dài, giọng, khuôn → gửi** (1.1).
- Tài liệu cũ (như bản tin quý trước) chỉ dùng **làm mẫu giọng**; tự nêu người đọc, độ dài, thông điệp (1.1).

### Chia nhỏ và lặp

Chia nhỏ khi yêu cầu có **nhiều sản phẩm cho người đọc khác nhau**, hoặc **phần sau phụ thuộc phần dữ kiện phía trước**. Prompt dài, muốn dạng bảng hay chủ đề lạ tay không phải lý do để chia (1.2).

1. 
  - **Định tiêu chí**
2. tiêu chí quyết định cần gom gì
  - **Gom dữ liệu theo tiêu chí**
3. có dữ liệu rồi mới chấm
  - **Chấm, xếp hạng**

↻Báo cáo nhiều phần: soạn từng phần riêng, viết tóm tắt sau cùng

Lặp có ích khi **mỗi lượt sửa nhắm một điểm yếu đã chỉ ra**, đổi một yếu tố, ghi lại tác dụng và **so với tiêu chí ban đầu**. Bốn lượt liền không tiến bộ là tới mức lợi ích giảm dần: đổi cách hoặc nhờ người duyệt (1.3).

### Theo loại việc

| Loại việc | Prompt nhấn vào |
|---|---|
| Brainstorm | Nhiều phương án khác hẳn nhau kèm đánh đổi, chưa chốt; ràng buộc ghi rõ và mỗi ý tự ghi nhãn |
| Nghiên cứu | Câu hỏi rõ, ghi nguồn và mức tin cậy; Research cho báo cáo nhiều nguồn |
| Phân tích | Dữ liệu nhiều bản ghi thì bảng; phép tính thì code execution |
| Soạn thảo | Người đọc, giọng, độ dài, bố cục từng phần |

Mẫu cứng hợp với báo cáo theo khuôn cố định; prompt mở hợp với brainstorm giai đoạn đầu (1.4).

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Hai phần cốt lõi của prompt cho việc kinh doanh | Nêu rõ việc phải làm; ngữ cảnh liên quan như người đọc và mục tiêu |
> | Sửa prompt theo Description | Nêu rõ phạm vi, khuôn đầu ra, người đọc, ràng buộc |
> | Kết quả lệch giọng, thiếu chi tiết | Nêu giọng và người đọc cụ thể; đưa một ví dụ đạt chuẩn |
> | Claude làm sai thứ tự các bước | Viết thành danh sách đánh số đúng thứ tự |
> | Brainstorm 10 ý, ba mức ngân sách | Nêu đủ ràng buộc, mỗi ý tự ghi nhãn ràng buộc |
> | Cần độ rộng trước khi thu hẹp | Nhiều phương án kèm đánh đổi, chưa đề xuất phương án nào |
> | Lặp tám lượt, chất lượng chững | Lợi ích giảm dần: nhờ người duyệt hoặc đổi cách |

Học kỹ: 1.1 Viết prompt hiệu quả · 1.2 Chia nhỏ yêu cầu · 1.3 Lặp prompt · 1.4 Prompt theo loại việc.

## Domain 2: Output Evaluation and Validation

Domain lớn nhất. Nó hỏi cách biết kết quả của Claude có đúng, đủ, đúng trọng tâm không, cách kiểm chứng, khi nào cần người duyệt, và cách chỉnh kết quả cho người đọc.

### Kiểm đúng và đủ

- **Định tiêu chí và ngưỡng đạt trước khi chấm**; tiêu chí bám việc, nguồn và người đọc (2.1).
- Chính xác: **so với nguồn**, không so với cảm giác. Đầy đủ: **đối chiếu từng yêu cầu** đánh số, kể cả độ sâu từng mục (2.1).
- Kết quả đúng từng chữ nhưng trả lời câu khác là **lệch trọng tâm**: hỏi lại đúng câu (2.1).

1. 
  - **Nhắc lại tiêu chí nghiệm thu**
2. rồi
  - **Đọc hết kết quả**
3. rồi
  - **So với nguồn và các mục bắt buộc**
4. rồi
  - **Ghi chỗ thiếu, chỗ sai**
5. rồi
  - **Quyết**dùng, sửa tiếp, hay báo lên

### Hallucination, mâu thuẫn, thiên kiến

- **Hallucination** nằm ở chỗ cụ thể và nghe đáng tin: số hiệu điều khoản, ngày tháng, con số, link, câu trích; cả việc Claude nói đã "gửi email" khi không có công cụ đó (2.2).
- **Giọng chắc chắn không phải tín hiệu.** Hỏi Claude tự chấm độ tự tin cũng không (2.2).
- Nghi hallucination: việc đầu tiên là **chỉ ra đúng khẳng định không có căn cứ** (2.2).
- Mâu thuẫn nặng nhất: **kết luận chính trái với bằng chứng trong bài**. Chạy lại ra giống nhau không chứng minh là đúng (2.2).
- Câu khái quát về một nhóm người: **viết lại theo hành vi quan sát được và kiểm bằng dữ liệu thật**, không chỉ thêm câu miễn trừ (2.2).

### Kiểm chứng

1. 
  - **Đọc hết, đánh dấu chỗ bất ngờ**
2. rồi
  - **Nhặt từng khẳng định cụ thể**
3. rồi
  - **Đối chiếu với nguồn**
4. rồi
  - **Ghi vị trí và mức độ**
5. rồi
  - **Quyết**tự sửa, làm lại, hay báo lên

- Luôn về **nguồn gốc**: con số chép ở ba bài báo thì tìm nghiên cứu gốc; câu trích thì mở báo cáo tìm đúng câu; hai nguồn vênh ngày thì theo nguồn chính thức (2.3).
- Có trích dẫn từ web search rồi vẫn phải **mở từng nguồn** xác nhận con số có trong đó (2.3).
- Rào cản lớn nhất khi kiểm là **thiếu chuyên môn**: nhờ người hiểu lĩnh vực đọc lại (2.3).

### Khi nào cần người duyệt

Mức duyệt đi theo **hậu quả khi sai**: ra ngoài tổ chức, có cam kết (thời hạn, tiền), ảnh hưởng tới một người cụ thể, khó rút lại, lĩnh vực pháp lý, tài chính, sức khoẻ. Khối việc không ai đọc phía sau phải tự gánh chất lượng (2.4).

Thứ tự quyết có báo lên không: **đánh giá kết quả → người đọc và tác động nếu sai → so với tiêu chí báo lên của tổ chức → quyết → ghi lại** (2.4).

### Chỉnh cho người đọc và chọn khuôn

| Người đọc | Cách chỉnh |
|---|---|
| Hội đồng, ban lãnh đạo | Tiêu đề thống nhất, câu gọn, đúng thuật ngữ, kiểm từng dữ kiện |
| Nhà đầu tư, thời gian có hạn | Kết quả chính trước, yếu tố dẫn tới gọn, triển vọng cuối |
| Khách hàng, người dùng cuối | Câu ngắn, từ thông dụng, giữ đúng từng bước |

Sửa theo góp ý: **sửa đúng chỗ được góp ý, giữ phần đã duyệt, ghi lại thay đổi**; góp ý mơ hồ thì hỏi lại (2.5).

| Khuôn | Hợp khi |
|---|---|
| Trả lời trong chat | Câu ngắn, dùng một lần |
| Bảng, CSV, JSON | Nhiều bản ghi cần so, lọc: mỗi bản ghi một dòng, mỗi chỉ số một cột |
| Artifact | Nội dung lớn, sẽ sửa tiếp, dùng lại, chia sẻ |
| File Word, Excel, PowerPoint, PDF | Người nhận làm việc trong phần mềm văn phòng |

(2.6)

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Hai việc trước khi chấm theo checklist | Định tiêu chí; định ngưỡng đạt |
> | Tóm tắt có dẫn số tiểu mục, sắp gửi phòng tuân thủ | Kiểm số tiểu mục với văn bản chính thức |
> | Kiểm tóm tắt so với RFP 12 yêu cầu | Đối chiếu từng yêu cầu đánh số |
> | "Chuẩn ngành ai cũng biết", không nguồn | Coi là chưa kiểm: tìm nguồn có thẩm quyền hoặc bỏ |
> | Bản tin có trích dẫn, đăng trong một giờ | Mở từng nguồn, xác nhận con số |
> | Yếu tố cần báo lên trước khi dùng ra ngoài | Bản nháp chưa sửa gửi khách trả phí, có cam kết dịch vụ |
> | Bài hướng dẫn đúng nhưng khó đọc | Câu ngắn, từ thông dụng, giữ đúng từng bước |
> | Bên liên quan góp hai ý, phần còn lại đã duyệt | Sửa đúng hai ý, giữ phần khác, ghi lại |

Học kỹ: 2.1 Chính xác và đầy đủ · 2.2 Hallucination, mâu thuẫn, thiên kiến · 2.3 Kiểm chứng · 2.4 Khi nào cần người duyệt · 2.5 Chỉnh theo người đọc · 2.6 Chọn khuôn đầu ra.

## Domain 3: Product and Model Selection

Domain này hỏi tính năng nào cho việc nào, các dòng model khác nhau ra sao, chọn model theo yêu cầu của việc, và xử lý giới hạn context, Memory.

### Tính năng nào cho việc nào

| Tính năng | Dùng khi |
|---|---|
| Chat thường | Việc nhanh, dùng một lần |
| **Project** | Tài liệu và chỉ dẫn dùng lại qua nhiều cuộc chat, nhiều người |
| **Research** | Báo cáo tổng hợp nhiều nguồn, có trích dẫn (gói trả phí) |
| **Web search** | Câu hỏi sự thật đơn giản cần thông tin mới |
| **Code execution** | Phép tính chính xác, phân tích file, biểu đồ, tạo Excel, Word, PowerPoint, PDF |
| **Artifact** | Thứ sẽ sửa tiếp và chia sẻ: tài liệu, slide, bản mẫu tương tác |
| **Skill** | Quy trình lặp lại, làm theo cùng một cách mỗi lần |
| **Connector** | Dữ liệu ở công cụ khác (Drive, Gmail…), thay đổi thường xuyên |

Việc phức tạp thường ghép hai tính năng: báo cáo đối thủ nhiều nguồn mà cả nhóm sửa nhiều tuần là **Research + artifact** (3.1).

### Các dòng model

| Dòng | Đặc điểm |
|---|---|
| Haiku | Nhanh nhất, nhẹ nhất; khối lượng lớn, suy luận nhẹ |
| Sonnet | Cân bằng; mặc định cho phần lớn việc hằng ngày |
| Opus | Mạnh nhất trong ba dòng đề hỏi; chậm hơn, tốn hạn mức hơn |
| Fable | Mạnh hơn Opus, cho suy luận khó; đề không hỏi |

Model càng mạnh càng chậm và càng tốn hạn mức. Trong cùng một model, **effort** (Low tới Max) quyết định độ kỹ; chỉnh effort trước khi đổi model (3.2, 3.3).

1. Khối lượng lớn, câu ngắn, cần nhanh?Dòng nhanh và rẻ nhất
2. Việc hằng ngày cần cân tốc độ và chất lượng?Dòng cân bằng
3. Suy luận nhiều bước, ít việc nhưng khó?Dòng suy luận sâu nhất
4. Còn lạiChưa đạt: sửa prompt, nâng effort, rồi mới lên dòng cao hơn

Trước khi thử model cho một khối việc mới: **định mức chất lượng, độ trễ, khối lượng** và **chọn model ứng viên theo đó**. Việc hằng tuần mới: định nghĩa kết quả tốt, chạy mẫu thật trên dòng mặc định, so, chỉ đổi dòng khi thiếu (3.3).

### Context và Memory

**Context window** là lượng chữ có giới hạn model xét cùng lúc: lịch sử chat, tài liệu đính kèm, tin nhắn hiện tại, chỉ dẫn và công cụ đang bật. Nó khác **hạn mức sử dụng** (theo phiên năm giờ và theo tuần) (3.4).

1. Việc mới không liên quan?Mở chat mới
2. Chat dài bắt đầu trôi khỏi yêu cầu?Tóm tắt trạng thái, làm tiếp với prompt tập trung
3. Brainstorm dùng một lần sắp chạm giới hạn?Cứ để chat tự thu gọn
4. Tài liệu cần dùng qua nhiều cuộc chat?Đưa vào Project
5. Còn lạiThông tin về bạn dùng lại thường xuyên: để Memory ghi nhớ

Chuyển từ chat dài bị trôi sang chat mới: **tóm tắt → chọn tài liệu dùng lâu dài → đưa vào Project → mở chat mới với bản tóm tắt → kiểm chat mới đúng việc** (3.4).

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Sổ tay, FAQ dùng qua nhiều chat, nhiều người | Project |
> | Phép tính chính xác trên bảng tính nhiều sheet | Code execution |
> | Bản mẫu trang web tương tác để nhóm sửa và chia sẻ | Artifact |
> | Nhiều tin nhắn trả lời ngắn, tốc độ và chi phí quan trọng | Model nhanh hơn, rẻ hơn |
> | Tóm tắt họp lặp lại, không cần suy luận sâu | Sonnet |
> | Mô tả đúng ba dòng model | Haiku nhanh nhẹ, Sonnet mặc định cân bằng, Opus mạnh nhất, chậm và tốn hơn |
> | Chat dài kết quả kém dần, việc đầu tiên | Tóm tắt trạng thái hiện tại |

Học kỹ: 3.1 Chọn tính năng · 3.2 Các dòng model · 3.3 Chọn model theo việc · 3.4 Context và Memory.

## Domain 4: Workflow Integration and Solution Design

Domain này hỏi cách dùng Claude trong các giai đoạn của một dự án: phân tích yêu cầu, nghiên cứu, thiết kế, đưa vào quy trình, và nói với các bên.

### Yêu cầu, nghiên cứu, thiết kế

- Phân tích yêu cầu: **gom và gắn nhãn nguồn → Claude trích có cấu trúc → nhóm, đánh dấu mâu thuẫn → kiểm với nguồn → ghi bộ yêu cầu kèm nguồn và trạng thái** (4.1).
- Yêu cầu mâu thuẫn: **đánh dấu, ghi nguồn từng bên, trả về người nêu yêu cầu**; không tự chọn, không nhờ Claude viết thoả hiệp (4.1).
- Yêu cầu viết thành giải pháp ("cần dashboard"): nhờ Claude **viết lại thành kết quả mong muốn, đánh dấu mục chưa rõ** (4.1).
- Nghiên cứu: **câu hỏi nghiên cứu trước**; Claude nháp kế hoạch, nhóm chỉnh; Research rồi kiểm trích dẫn. So sánh nhiều đối tượng: **chốt đối tượng và tiêu chí trước** (4.2).
- Tối ưu quy trình: vẽ hiện trạng, tìm điểm nghẽn từ số liệu thời gian, đề xuất cho người duyệt (4.2).
- Thiết kế giải pháp: **nêu vấn đề và ràng buộc trước**; việc sáng tạo thì định mục tiêu, thước đo, giọng và người nghe trước khi xin ý tưởng; việc lớn thì định mục tiêu chung và các giai đoạn trước khi làm chi tiết (4.3).

### Đưa Claude vào quy trình

Chỗ Claude tạo giá trị nhiều nhất: **soạn nháp và tổng hợp từ nhiều nguồn cho người duyệt phía sau**. Không giao: duyệt bản cuối gửi ra ngoài, đàm phán, quyết định nhân sự, cam kết pháp lý (4.1, 4.4).

1. 
  - **Ghi quy trình hiện tại**bước, người phụ trách, điểm quyết định
2. rồi
  - **Chọn bước Claude bổ trợ, bước người giữ**
3. rồi
  - **Định đầu vào, đầu ra, điểm bàn giao**
4. rồi
  - **Thử với nhóm nhỏ**
5. rồi
  - **Cập nhật và triển khai cho cả đội**

Tiêu chí Delegation trực tiếp nhất: **bước đó có cần sáng tạo, thấu cảm, phán đoán của con người không**, và **có đảo ngược được không, sai thì hậu quả ra sao** (4.4).

### Nói với các bên

- Trước khi soạn thông điệp: **xác định nhóm người nghe và nhu cầu từng nhóm**, **chốt sự thật về vai trò của Claude và ranh giới** (4.5).
- Nói trung thực: **giới hạn và kiểu lỗi đã biết**, **chỗ Claude hỗ trợ và chỗ người giữ quyết định** (4.5).
- Giới hạn quan trọng nhất khi dùng cho việc gửi khách: **kết quả nghe chắc chắn mà vẫn có thể sai, nên cần người duyệt** (4.5).
- Lãnh đạo hoài nghi: ví dụ cải thiện đo được, chỗ người vẫn duyệt và lý do. Lãnh đạo muốn bỏ khâu duyệt: ghi nhận lợi ích, giải thích vì sao vẫn cần, kèm ví dụ (4.5).

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Claude hỗ trợ phân tích yêu cầu thế nào | Tổng hợp đầu vào thành danh sách yêu cầu có truy vết nguồn |
> | Bước đầu khi dùng Claude nghiên cứu | Xác định câu hỏi nghiên cứu |
> | Bước đầu khi thiết kế giải pháp | Nêu vấn đề và ràng buộc |
> | Bước đầu khi tích hợp vào quy trình nhiều người | Xác định chỗ Claude tạo giá trị và từng điểm bàn giao cho người |
> | Thông báo Claude sẽ nháp mọi báo cáo sự cố | Cái gì đổi, cái gì vẫn của từng người, chỗ nào họ vẫn duyệt |
> | Hai thông điệp phù hợp về Claude | Nói rõ giới hạn; mô tả trung thực chỗ hỗ trợ và chỗ người quyết |

Học kỹ: 4.1 Phân tích yêu cầu · 4.2 Nghiên cứu và lập kế hoạch · 4.3 Thiết kế giải pháp · 4.4 Đưa Claude vào quy trình · 4.5 Giá trị và giới hạn.

## Domain 5: Configuration and Knowledge Management

Domain này hỏi cách cấu hình Project, quản lý tài liệu và connector, viết chỉ dẫn cấp hệ thống, và giữ cấu hình luôn cập nhật.

### Project: chỉ dẫn và knowledge

- Việc đầu tiên khi cấu hình Project: **định mục đích và các việc lặp lại nó phục vụ** (5.1).
- **Quy tắc áp dụng cho mọi lần vào chỉ dẫn; tài liệu tham chiếu vào knowledge.** Danh sách viết tắt vào knowledge, quy tắc "chỉ dùng viết tắt trong danh sách" vào chỉ dẫn; bài viết mẫu vào knowledge (5.1).
- Chỉ dẫn tốt nêu đủ **vai trò, chuẩn của tổ chức, khuôn đầu ra** (5.1).
- Knowledge chỉ chứa **tài liệu hiện hành, liên quan, dùng lại**; không bản cũ, không email cả năm, không tài liệu của quy trình khác (5.1).
- Claude không đọc tên và mô tả Project; các chat trong Project không thấy nhau (5.1).
- Hai khách hàng: hai Project có memory, knowledge, chỉ dẫn riêng, kiểm không lẫn; tắt "Use account memory" nếu cần tách hẳn (5.1).

### Tài liệu và connector

| Tài liệu | Cách đưa vào |
|---|---|
| Hay đổi, nằm ở Drive | Nối connector (luôn bản mới) |
| Cố định, dùng nhiều lần | Tải vào Project knowledge |
| Chỉ cần cho một chat | Tải thẳng vào chat |

Trước khi nối connector mới: **có trong danh sách được duyệt** và **phân loại dữ liệu cho phép**. Nối trong phạm vi cần, ưu tiên chỉ đọc; tắt connector việc này không cần (5.2).

### Chỉ dẫn cấp hệ thống

| Tầng | Áp dụng cho |
|---|---|
| Chỉ dẫn tài khoản | Mọi chat của bạn |
| Chỉ dẫn Project | Mọi chat trong Project |
| Chỉ dẫn tổ chức (Owner đặt) | Mọi chat trong tổ chức; thắng chỉ dẫn cá nhân khi mâu thuẫn |

Viết theo thứ tự **mục đích và ranh giới → nháp → thử trên yêu cầu tiêu biểu → sửa → chia sẻ**. Cụ thể thắng mơ hồ: thay "đồng cảm và thân mật, tặng bồi thường" bằng giọng cụ thể, độ dài tối thiểu, chỉ đề xuất bồi thường khi chính sách cho phép (5.3).

### Bảo trì

1. Tài liệu nguồn vừa đổi?Cập nhật knowledge, xoá bản cũ, báo cho người dùng
2. Kết quả Project trôi khỏi kỳ vọng?Xem lại chỉ dẫn và tài liệu so với chuẩn hiện hành
3. Tới kỳ rà soát?Xem lại dù chưa thấy lỗi
4. Còn lạiMemory có mục cũ hoặc thiếu: xuất sao lưu, rồi sửa, xoá, thêm

Nhập Memory từ dịch vụ AI khác còn **thử nghiệm**, có thể không vào hết: thêm tay phần thiếu (5.4).

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Bước đầu cấu hình Project, viết chỉ dẫn | Định mục đích (và ranh giới) |
> | Hai thứ vào chỉ dẫn của Project viết lách | Khuôn và độ dài; giọng thương hiệu |
> | Skill cùng Project | Bật skill, tải tài liệu, chỉ dẫn nhắc cả hai |
> | Sổ tay đổi hằng tuần trên Drive và báo cáo năm cố định | Nối Drive cho sổ tay; tải báo cáo vào knowledge |
> | Bước đầu khi nối connector cho nguồn dùng chung | Xác nhận connector được duyệt và phân loại dữ liệu phù hợp |
> | Vừa thay ma trận báo cấp trong Project dùng chung | Báo cho người dùng đã đổi gì |
> | Bảo trì Memory | Xuất sao lưu; sửa, xoá mục cũ, thêm phần thiếu |

Học kỹ: 5.1 Cấu hình Project · 5.2 Tài liệu và connector · 5.3 Chỉ dẫn cấp hệ thống · 5.4 Bảo trì cấu hình.

## Domain 6: Governance, Risk, and Responsible Use

Domain này hỏi việc nào nên giao cho Claude, xử lý dữ liệu nhạy cảm, làm theo chính sách AI của tổ chức, và hệ quả đạo đức.

### Việc nên và không nên

- Hợp: soạn nháp, tóm tắt, tổng hợp **có người duyệt**. Không hợp: làm người quyết định duy nhất về tín dụng, tuyển dụng, tuyển sinh; hành động khó đảo ngược không ai duyệt (6.1).
- Usage Policy của Anthropic yêu cầu với việc rủi ro cao (pháp lý, y tế, tài chính, tín dụng, bảo hiểm, nhà ở, việc làm, giáo dục…): **người đủ chuyên môn duyệt và chịu trách nhiệm**, và **người bị ảnh hưởng được biết có dùng AI** (6.1).
- Tách **quyết định** khỏi **văn bản báo quyết định**: Claude viết thư, người quyết (6.1).
- Đánh giá cách dùng mới: **tác động và khả năng đảo ngược → loại dữ liệu → đối chiếu chính sách, quy định → quyết → ghi lại** (6.1).

### Dữ liệu nhạy cảm

1. 
  - **Phân loại, chỉ ra trường nhạy cảm**
2. rồi
  - **Bỏ hoặc che phần việc không cần**
3. rồi
  - **Chạy việc, đọc lại kết quả**
4. rồi
  - **Ghi lại đã bỏ gì**

- Chỉ đưa vào **những gì việc cần**: tóm tắt vấn đề của khách không cần số định danh, địa chỉ nhà (6.2).
- Dặn Claude "đừng lưu" hay "đừng nhắc tới" không thay việc che dữ liệu trước khi gửi (6.2).
- **Incognito**: không lưu lịch sử, không vào Memory, không dùng để cải thiện Claude; nhưng vẫn giữ 30 ngày và **chính sách dữ liệu vẫn áp dụng** (6.2).
- Gói doanh nghiệp mặc định không dùng dữ liệu để huấn luyện; nút thích, không thích gửi cả cuộc chat. Chủ gói Team, Enterprise tắt được tính năng đánh giá (6.2).

### Chính sách của tổ chức

- Khung quản trị AI quy định **công cụ được duyệt, dữ liệu được dùng, khâu duyệt bắt buộc, đường báo cáo** (6.3).
- Chính sách cấm: không lách (Incognito, diễn đạt lại, đợi sau), hỏi người phụ trách cách được duyệt. Không chắc chính sách đòi gì: tìm hiểu trước khi gửi (6.3).
- Kết quả có thể lộ thông tin hạn chế: **ngừng dùng, ghi lại kèm prompt và nguồn, báo kênh quản trị** (6.3).
- Skill từ nguồn lạ: kiểm danh sách skill được duyệt và quyền nó yêu cầu (6.3).

### Đạo đức

Rủi ro đạo đức thật: **kết quả gây bất lợi có hệ thống cho một nhóm được bảo vệ**, và **quyết định ảnh hưởng tới việc làm của một người mà không ai chịu trách nhiệm**. Câu hỏi phỏng vấn chung phải áp dụng như nhau, không giả định về xuất thân, bám yêu cầu công việc (6.4).

Rà soát đạo đức trước khi công bố: **người đọc và tác động → nội dung (khái quát, công bằng, chính xác) → minh bạch → sửa hoặc báo lên → ghi lại** (6.4).

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Claude làm người quyết định duy nhất duyệt hạn mức | Từ chối; Claude hỗ trợ chuyên viên, chuyên viên quyết |
> | Claude xét tuyển sinh và viết thư báo | Tách quyết định khỏi viết thư, nhân viên giữ quyết định |
> | Tải bảng có tên và số tài khoản khách để phân tích | Bỏ hoặc ẩn danh định danh trước khi tải, theo chính sách |
> | Bàn con số mật chưa công bố | Incognito, hoặc tắt Memory cho cuộc chat |
> | Incognito có làm việc dán dữ liệu thuộc diện quản lý thành hợp lệ | Không: chính sách vẫn áp dụng |
> | Trước khi cho phép connector mới | Danh sách nhà cung cấp được duyệt; phân loại dữ liệu |
> | Diligence trong quản trị | Áp dụng chính sách thành thói quen, tự tìm và sửa chỗ lệch |

Học kỹ: 6.1 Việc nên và không nên · 6.2 Dữ liệu nhạy cảm · 6.3 Chính sách AI của tổ chức · 6.4 Đạo đức.

## Domain 7: Troubleshooting and Optimization

Domain này hỏi cách chẩn đoán kết quả kém, dùng phản hồi để cải thiện, và tối ưu quy trình.

### Chẩn đoán

1. 
  - **Đọc kết quả, chỉ ra đúng chỗ kém**
2. rồi
  - **So với prompt, tìm chỗ không khớp**
3. rồi
  - **Đặt giả thuyết**phần nào gây ra
4. rồi
  - **Sửa một chỗ, xem tác dụng**
5. rồi
  - **Ghi nguyên nhân và cách sửa**

Nguyên nhân gốc thường là **prompt nêu thiếu**: không liệt kê từng câu hỏi, không nêu danh mục và tiêu chí, thiếu người đọc, giọng, khuôn, các mục bắt buộc. Đổi model, hạ temperature, thêm người sửa sau chỉ che triệu chứng (7.1).

### Phản hồi

- Vòng hằng tuần: **ghi phản hồi cụ thể → một hai điều chỉnh → chạy, so với vòng trước → ghi đã đổi gì và tác dụng → quyết làm tiếp, đổi cách hay báo lên** (7.2).
- Phản hồi mơ hồ ("chưa ổn lắm", "bỏ sót rủi ro"): **xin ví dụ cụ thể**, so với nguồn (7.2).
- Sửa lỗi mới làm lỗi cũ quay về: thiếu **danh sách yêu cầu viết ra**. Càng sửa càng lệch: **quay về bản prompt gần đúng nhất** (7.2).
- Muốn lỗi của Claude được ghi nhận: **nút không thích** trên câu trả lời có lỗi (7.2).

### Tối ưu

Tối ưu ở cấp Associate: **bớt trùng lặp, bỏ bước ít giá trị, dùng Claude ở chỗ có giá trị đo được, giữ các khâu duyệt và kiểm bắt buộc** (7.3).

1. 
  - **Vẽ quy trình hiện tại**
2. rồi
  - **Tìm điểm nghẽn bằng số liệu**
3. rồi
  - **Sửa đúng bước đó**
4. rồi
  - **Thử nhỏ, so với mức cũ**
5. rồi
  - **Triển khai, ghi lại**

Thay đổi có tác dụng thật: **đưa tài liệu tham chiếu chuẩn vào Project**, **thêm khâu kiểm chất lượng trước bước sau**. Đổi tên, sắp lại tiêu đề chỉ là bề ngoài. Tiết kiệm hạn mức: quyết mình cần gì → đưa đủ vào tin đầu → hỏi tiếp dựa trên đó → việc mới thì chat mới (7.3).

> Trong đề chọn gì
>
> | Tình huống | Chọn |
> |---|---|
> | Claude chỉ trả lời một trong ba câu hỏi | Phần nêu việc chưa liệt kê rõ từng câu |
> | Prompt "phân loại ticket này" cho kết quả thất thường | Viết lại: danh mục, khuôn, tiêu chí chọn |
> | Prompt hằng tuần lúc lệch giọng, lúc thiếu mục | Prompt nêu thiếu người đọc, giọng, khuôn, các mục |
> | Ba người thử nói "chưa ổn lắm" | Hỏi họ ví dụ cụ thể |
> | Hai việc trước khi sửa quy trình | Đo chất lượng, thời gian, chi phí; tìm bước gây vấn đề |
> | Bật nhiều connector không cần khi soạn thảo | Tắt chúng, khi cần bật lại |

Học kỹ: 7.1 Chẩn đoán kết quả kém · 7.2 Điều chỉnh theo phản hồi · 7.3 Tối ưu quy trình.

## Mẹo chọn đáp án khi phân vân

Học xong bảy domain, bạn sẽ thấy các câu hỏi lặp lại vài quy tắc. Phân vân giữa hai đáp án thì áp lần lượt:

1. **Định nghĩa trước, làm sau.** Câu "việc nào phải xong trước" hầu như luôn chọn bước định mục đích, tiêu chí, câu hỏi, vấn đề và ràng buộc; bước thử, triển khai, ghi lại đến sau. Bước "ghi lại" gần như luôn ở cuối.
2. **Về nguồn gốc.** Kiểm một khẳng định thì mở nguồn gốc, không tin số đông nguồn chép lại, độ tự tin của Claude, hay việc chạy lại ra giống nhau.
3. **Con người giữ quyết định ảnh hưởng tới người khác.** Tuyển dụng, tín dụng, tuyển sinh, cam kết pháp lý: Claude hỗ trợ, người quyết và chịu trách nhiệm.
4. **Xử lý dữ liệu trước khi gửi.** Không dựa vào lời dặn Claude, Incognito hay môi trường cách ly để bỏ qua chính sách.
5. **Sửa đúng gốc, sửa một chỗ.** Kết quả kém thì xem prompt nêu thiếu gì; đổi model, đổi nhà cung cấp, làm lại từ đầu thường là đáp án sai.
6. **Cụ thể thắng mơ hồ.** Chỉ dẫn, phản hồi, thông điệp: chọn bản nêu cụ thể (giọng, độ dài, danh mục, ví dụ).
7. **Trung thực về giới hạn.** Loại mọi đáp án hứa "không bao giờ sai", "không cần kiểm", "AI lo hết".
8. **Loại đáp án cực đoan.** Bỏ hẳn việc, xoá sạch memory, tắt hẳn tính năng, gộp mọi thứ vào một prompt.

## Tên trong đề và tên hiện nay

Đề thi được soạn từ 07/2026, và app Claude đã đổi ở vài chỗ. Khi luyện và khi thi, chọn theo cách đề chấm; khi làm thật, theo app hiện tại.

| Trong đề | Hiện nay (11/2026) |
|---|---|
| Ba dòng Haiku, Sonnet, Opus; Opus là dòng mạnh nhất | Có thêm Fable 5.1, mạnh hơn Opus; model mới nhất là Haiku 5.5, Sonnet 5.5, Opus 5.5 |
| Chỉnh temperature (luôn nằm ở đáp án sai) | Menu cạnh nút gửi chỉ chỉnh model, effort và thinking; các model 5.5 luôn suy nghĩ, muốn nghĩ ít hơn thì hạ effort |
| Thêm tay vào Memory ở Settings > Capabilities | Bố cục cài đặt mới: Settings > Your Claude, mục Your memory |

## Nguồn

1. [Exam Guide CCAO-F v1.0(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Claude Certified Associate – Foundations (Anthropic Partner Academy)(mở tab mới)](https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification)
3. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)
4. [Change the model, effort, and thinking settings (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)
5. [How large is the context window on paid Claude plans? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8606394-how-large-is-the-context-window-on-paid-claude-plans)
6. [Use Claude's chat search and memory to build on previous context (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
7. [Import and export your memory from Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/12123587-import-and-export-your-memory-from-claude)
8. [Usage Policy (Anthropic)(mở tab mới)](https://www.anthropic.com/legal/aup)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
