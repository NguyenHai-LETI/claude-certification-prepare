# Ôn gấp CCAO-F: Domain 4 → 7 (bài 4.1 – 7.3)

Tóm tắt từ 15 bài trong thư mục này, đọc khoảng 45–60 phút. Mỗi bài có 3 phần: **Thứ tự** (đề hay bắt xếp bước), **Chọn** (đáp án đúng), **Loại** (đáp án bẫy).

---

## 0. Bảy quy luật chung (đọc kỹ phần này trước)

1. **Câu hỏi "bước ĐẦU TIÊN" thì đáp án gần như luôn là xác định / đo / phân loại / ghi hiện trạng**: mục đích, vấn đề, ràng buộc, câu hỏi nghiên cứu, người nghe. Đáp án "làm luôn" (xin ý tưởng, sửa, triển khai, thử, viết tài liệu, đào tạo) là bước sau.
2. **Claude soạn nháp, gom, tổng hợp; con người duyệt và quyết.** Quyết định cuối về người, tiền, pháp lý, tuyển dụng, tín dụng, tuyển sinh thì người giữ.
3. **Sửa đúng gốc, không che triệu chứng.** Gốc thường nằm ở prompt hoặc chỉ dẫn thiếu, hoặc tài liệu cũ. Đáp án "đổi model / hạ temperature / thêm người sửa sau / mở chat mới" là sai.
4. **Mỗi lần chỉ sửa một chỗ (một hai điều chỉnh), đo rồi ghi lại.**
5. **Thử nhỏ trước, triển khai sau.** Thử với nhóm nhỏ trên việc thật rồi mới cho cả đội.
6. **Không lách chính sách.** Incognito, diễn đạt lại, "chỉ dùng nội bộ", dặn Claude "đừng lưu" đều không thay được việc làm đúng chính sách. Chưa rõ thì hỏi đúng người. Có sự cố thì báo đúng kênh.
7. **Không tự quyết thay người có quyền.** Gặp mâu thuẫn thì đánh dấu và trả về người nêu. Lãnh đạo kỳ vọng quá mức thì ghi nhận lợi ích, giải thích vì sao vẫn cần người duyệt.

---

## DOMAIN 4: Workflow Integration & Solution Design

### 4.1 Phân tích yêu cầu và use case
- **Thứ tự 5 bước:** gom và **gắn nhãn nguồn** → đưa Claude prompt **trích có cấu trúc** (must-have / nice-to-have / câu hỏi mở / mâu thuẫn, mỗi mục ghi nguồn, không thêm gì ngoài tài liệu) → nhóm, đánh dấu mâu thuẫn và chỗ mơ hồ → **kiểm với nguồn gốc** → ghi bộ yêu cầu cuối kèm nguồn và trạng thái.
  - Gắn nhãn nguồn **TRƯỚC** khi đưa Claude, để giữ được **traceability** (truy vết).
- **Yêu cầu mâu thuẫn:** chọn **đánh dấu, ghi nguồn từng bên, trả về người nêu để họ thống nhất**.
  - Loại: chọn yêu cầu có lý do kinh doanh mạnh nhất; đưa cả ba vào làm "phương án" để quyết sau; nhờ Claude viết câu thoả hiệp.
- **Yêu cầu viết thành giải pháp** ("cần dashboard"): chọn nhờ Claude **viết lại thành kết quả mong muốn**, mục nào chưa rõ thì đánh dấu **[CẦN HỎI LẠI]**. Không nhờ Claude thiết kế luôn dashboard.
- **Claude hợp nhất ở đâu:** tổng hợp đầu vào từ nhiều nguồn thành danh sách có cấu trúc, truy vết được.
  - Sai: để Claude tự bịa yêu cầu từ tên dự án; để Claude phỏng vấn thay người; chỉ dùng Claude để xếp ưu tiên mà bỏ phần gom.
- **Hợp giao cho Claude:** soạn nháp, tóm tắt, tổng hợp có người duyệt sau.
- **Không giao cho Claude:** duyệt bản cuối gửi ra ngoài, đàm phán hợp đồng, quyết định tuyển dụng hay sa thải, cam kết pháp lý.

### 4.2 Nghiên cứu, lập kế hoạch, tối ưu quy trình
- **Nghiên cứu, bước đầu:** **xác định các câu hỏi nghiên cứu cụ thể**.
  - Sau đó: để Claude **nháp kế hoạch và câu hỏi mở, nhóm chỉnh lại**, rồi dùng **Research và kiểm trích dẫn với nguồn gốc**.
  - Loại: giấu quyết định mà nghiên cứu phục vụ "để Claude khỏi bị dẫn dắt" (sai, phải nói rõ quyết định); nhận số liệu Claude đưa là kết quả cuối; xin kết luận trong một prompt rồi công bố luôn.
- **So sánh nhiều đối tượng theo nhiều tiêu chí:** việc đầu là **chốt đối tượng và tiêu chí (khung) trước**, rồi mới nhờ Claude điền, chọn khuôn trình bày sau cùng.
  - Loại: xếp hạng ngay; chọn khuôn bảng trước; gộp các câu trả lời rời rạc thành một tài liệu dài.
- **Lập kế hoạch:** đưa **ràng buộc thật** (ngân sách, hạn chót, nhân lực), để Claude nháp và đánh dấu [GIẢ ĐỊNH], người duyệt từng mốc.
- **Tối ưu quy trình có số liệu:** chọn **vẽ quy trình hiện tại → tìm điểm nghẽn từ số liệu → đề xuất phương án cho người duyệt**.
  - **Điểm nghẽn (bottleneck) = bước có thời gian xử lý trung bình mỗi đơn cao nhất.** Không phải bước mới thêm, không phải bước người làm kêu nhiều nhất.
  - Loại: viết quy trình "tối ưu theo chuẩn ngành" rồi so; để Claude dự đoán tác động và xếp hạng để làm theo; để Claude phỏng vấn rồi thiết kế lại.
- **Ghi nhớ:** nghiên cứu bắt đầu bằng **câu hỏi**, so sánh bắt đầu bằng **khung**, tối ưu bắt đầu bằng **số liệu**.

### 4.3 Thiết kế giải pháp, bản mẫu, làm lặp
- **Bước đầu tiên:** **nêu vấn đề giải pháp phải giải quyết và các ràng buộc**.
- **Thứ tự:** vấn đề + ràng buộc → nhờ Claude đưa **nhiều** ý tưởng khác nhau → so với ràng buộc, chọn một → làm **bản mẫu** cho các bên góp ý → sửa theo góp ý (lặp lại).
- **Việc sáng tạo (chiến dịch, chương trình): 2 việc phải xong trước khi xin ý tưởng:**
  - **mục tiêu và thước đo thành công**
  - **giọng thương hiệu và người dùng/người nghe**
  - Đây là **Problem Awareness**, một phần của Delegation.
- **Việc lớn nhiều giai đoạn:** định **mục tiêu chung và các giai đoạn lớn** trước, rồi mới làm chi tiết từng giai đoạn.
- **Bản mẫu:** làm bằng **artifact** (mở cạnh chat, sửa được, chia sẻ được). Muốn thử hướng khác mà không mất bản đang có: **sửa một tin nhắn cũ để tạo nhánh mới**.
- **Góp ý cụ thể (2 điểm):** **sửa đúng 2 điểm, giữ nguyên phần đã duyệt, ghi lại đã đổi gì**.
  - Loại: viết lại cả bản; tiện tay thêm cải tiến.

### 4.4 Đưa Claude vào quy trình đang có
- **Delegation** (AI Fluency) gồm 3 phần:
  - **Problem Awareness**: muốn đạt gì
  - **Platform Awareness**: AI làm được gì, không làm được gì
  - **Task Delegation**: chia việc giữa người và AI
- **2 tiêu chí trực tiếp nhất để quyết giao bước nào:**
  - bước đó **có cần sáng tạo, thấu cảm, phán đoán của con người không**
  - **có đảo ngược được không, sai thì hậu quả ra sao**
  - Loại: chức vụ người đang làm; độ phức tạp của sơ đồ; quy trình tồn tại bao lâu.
- **3 cách làm việc với AI:**
  - **Automation**: AI làm việc cụ thể theo chỉ dẫn
  - **Augmentation**: người và AI cùng làm, qua lại như cộng sự
  - **Agency**: người thiết lập để AI tự làm thay. Càng gần Agency thì khâu duyệt của người càng quan trọng.
- **Thứ tự tích hợp:** **ghi quy trình hiện tại** (bước, người phụ trách, điểm ra quyết định) → chọn bước Claude bổ trợ và bước người giữ → định **đầu vào, đầu ra, điểm bàn giao** → thử nhóm nhỏ trên việc thật → cập nhật và triển khai cả đội.
  - Đề hỏi "bước đầu khi tích hợp vào quy trình nhiều người": chọn **xác định chỗ Claude tạo giá trị và từng điểm bàn giao cho người**.
- **Dùng chung cho cả đội:** đưa vào **Project** (chỉ dẫn chung). Quy trình lặp lại cố định thì đóng gói thành **skill**.
- **Bổ trợ (augment)** là giữ nguyên các bước, Claude làm nhanh một bước. **Thiết kế lại (redesign)** là sắp xếp lại cả quy trình. Cả hai đều phải giữ có chủ đích các khâu người duyệt.

### 4.5 Nói với các bên về giá trị và giới hạn
- **2 việc làm trước khi soạn thông điệp:**
  - **xác định nhóm người nghe và mỗi nhóm cần hiểu gì**
  - **chốt sự thật về vai trò của Claude và ranh giới**
- **Thông điệp đúng:**
  - **nói rõ giới hạn và các kiểu lỗi đã biết**
  - **mô tả trung thực chỗ Claude hỗ trợ, chỗ người giữ quyết định**
  - Loại: "không bao giờ sai"; "Claude tự làm hết"; "AI lo hết rồi".
- **Giới hạn quan trọng nhất khi kết quả gửi ra ngoài:** **Claude có thể nói rất chắc chắn mà không có căn cứ, nên việc tác động lớn bắt buộc có người duyệt**. Mốc dữ liệu huấn luyện, độ dài, kết quả mỗi lần khác nhau đều đúng nhưng không phải điều quan trọng nhất.
- **Thông báo cho đội:** nói **cái gì thay đổi, cái gì vẫn là việc của họ, chỗ nào họ vẫn duyệt**.
- **Thuyết phục lãnh đạo hoài nghi:**
  - **ví dụ cụ thể, đo được** (ví dụ 2 ngày thay vì 5 ngày)
  - **chỗ người vẫn duyệt và vì sao**
  - Không dùng: so benchmark; hứa "không cần kiểm".
- **Lãnh đạo kỳ vọng quá mức** ("bỏ khâu duyệt đi"): **ghi nhận lợi ích, giải thích vì sao vẫn cần người duyệt, kèm ví dụ rủi ro cụ thể**.
  - Loại: im lặng làm theo; thử nhỏ để "chứng minh" sau; báo lên cấp cao trước khi trả lời.
- **Diligence** (AI Fluency) là minh bạch về vai trò của AI. **AI diligence statement** ghi: AI giúp gì, dùng công cụ nào, người đã kiểm và sửa gì, ai chịu trách nhiệm.

---

## DOMAIN 5: Configuration & Knowledge Management

### 5.1 Cấu hình Project
- **Project knowledge** là tài liệu tải lên, làm ngữ cảnh cho mọi chat trong Project. **Project instructions** là cách Claude cư xử, áp dụng cho mọi chat trong Project.
- **3 điểm hay bị hiểu nhầm:**
  - **Tên và mô tả Project Claude KHÔNG đọc được.**
  - **Các chat trong cùng Project KHÔNG thấy nhau.** Muốn dùng chung thì phải để trong knowledge.
  - Gói Team/Enterprise: chia sẻ Project là chia sẻ knowledge và chỉ dẫn; **chat của từng người vẫn riêng**.
- **Thứ tự:** **định mục đích và các việc lặp lại Project phục vụ** → viết chỉ dẫn (vai trò, chuẩn mực, khuôn đầu ra) và tải tài liệu tham chiếu vào knowledge → **thử trên một yêu cầu thật** → rồi mới mời người, đặt quyền.
- **Quy tắc áp dụng cho mọi câu trả lời → chỉ dẫn. Tài liệu tham chiếu dài → knowledge.**
  - Danh sách viết tắt 2 trang là tài liệu, đặt trong knowledge. Quy tắc "không dùng viết tắt ngoài danh sách" là quy tắc, đặt trong chỉ dẫn.
  - Chỉ dẫn của Project viết lách: **khuôn, độ dài chuẩn, giọng thương hiệu**. **Bài viết mẫu thuộc knowledge**, không thuộc chỉ dẫn.
  - Chỉ dẫn đủ phải có 3 thứ: **vai trò + chuẩn của tổ chức + khuôn đầu ra**.
- **Knowledge gồm tài liệu hiện hành, liên quan, dùng lại qua nhiều chat.**
  - Không đưa: phiên bản cũ; mọi email "cho đủ bối cảnh"; tài liệu của nhóm khác.
  - Khi gần chạm giới hạn context (gói trả phí), Project tự chuyển sang **RAG**, chứa nhiều gấp **10 lần**. Đặt tên file rõ ràng để Claude tìm đúng.
- **Ghép với skill:** bật skill liên quan + tài liệu vào knowledge + chỉ dẫn nhắc tới cả skill lẫn tài liệu. Skill bật ở Customize > Skills và **cần bật code execution**.
- **Hai khách hàng:** mỗi khách **một Project riêng, có memory, knowledge, chỉ dẫn riêng, và kiểm tra không lẫn sang nhau**. Muốn tách hẳn thì tắt **"Use account memory"** trong Project.
  - Loại: chat chung một chỗ; dùng chung memory; một Project chung rồi tin Claude tự tách.

### 5.2 Tài liệu tải lên và connector
- **Câu hỏi quyết định: tài liệu có hay thay đổi không?**
  - Hay đổi (sổ tay cập nhật hằng tuần trên Drive): **nối connector Google Drive**, luôn lấy được bản mới.
  - Cố định (báo cáo năm đã chốt): **tải vào Project knowledge**.
  - Chỉ cần cho một chat: tải thẳng vào chat.
  - Thêm file Drive vào Project **chỉ làm được với Project riêng tư**.
- **Giới hạn tải file:**
  - Tải vào chat: **500MB/file, tối đa 20 file**.
  - Tải vào Project: **30MB/file**, số file không giới hạn nhưng nội dung phải vừa context (RAG mở rộng tới 10 lần).
  - **PDF ≤100 trang:** đọc cả chữ lẫn hình. **101–1.000 trang:** chỉ đọc chữ. DOCX và file khác: chỉ đọc chữ. **XLSX cần bật code execution.**
- **Connector:** Claude **thừa hưởng quyền của chính bạn**. Gói Team/Ent: Owner phải bật connector ở cấp tổ chức trước. Gmail/Drive **mặc định hỏi bạn duyệt** trước khi gửi, xoá, chia sẻ.
- **2 việc kiểm trước khi nối connector mới:**
  - **connector có trong danh sách được phép của tổ chức**
  - **mức phân loại dữ liệu của nguồn, nhóm có được dùng không**
  - Đào tạo, gỡ connector cũ là việc sau.
- **Nối an toàn:** không gian quản lý dự án của nhóm trong phạm vi được duyệt; **chỉ đọc** vào kho kiến thức công khai.
  - **Nối không an toàn:** tài khoản lưu trữ cá nhân; hệ thống tính lương; hồ sơ nhân sự "cho tiện".
- **Chế độ nạp connector:**
  - **Auto** (mặc định): Claude tự chọn.
  - **Always available**: dưới 10 connector, dùng thường xuyên.
  - **On demand**: từ 10 connector trở lên, hoặc chat hay chạm giới hạn.
- **Việc đơn giản mà đang bật nhiều connector:** **tắt cho việc này, cần thì bật lại**. Dặn Claude "đừng dùng" không giải phóng chỗ; xoá hẳn connector thì quá tay.

### 5.3 Chỉ dẫn cấp hệ thống
- **4 tầng:**

  | Tầng | Ai đặt | Phạm vi |
  |---|---|---|
  | Chỉ dẫn tài khoản (Settings > Your Claude) | từng người | mọi chat của người đó |
  | Chỉ dẫn Project | người có quyền sửa Project | mọi chat trong Project |
  | Chỉ dẫn tổ chức | **Owner / Primary Owner** (Team, Ent) | mọi chat của cả tổ chức |
  | Skill | người hoặc tổ chức | nạp khi việc cần, làm theo cùng một cách |

- **Chỉ dẫn tổ chức:**
  - Mâu thuẫn trực tiếp với chỉ dẫn cá nhân thì **chỉ dẫn tổ chức thắng**. Chỉ dẫn cá nhân vẫn áp dụng cho những gì tổ chức không nói tới.
  - Tối đa **3.000 ký tự**, mất **tới 1 giờ** mới có hiệu lực, **không tắt được nguyên tắc an toàn** của Claude.
- **Thứ tự viết:** **định mục đích và ranh giới** → viết nháp → thử trên các yêu cầu tiêu biểu → sửa chỗ thiếu → chia sẻ.
- **Cụ thể thắng mơ hồ:** "trang trọng, không viết tắt, không tiếng lóng, không emoji" thay cho "hãy chuyên nghiệp". Viết **ngắn**, **không tự mâu thuẫn**, **nói lý do**, **thử lại sau khi lưu**.
- **Bẫy thư xin lỗi** (chỉ dẫn cũ: "thân mật, ngắn, tặng bồi thường"):
  - Chọn: **nêu cụ thể giọng (đồng cảm, trang trọng, không viết tắt), độ dài tối thiểu, chỉ đề xuất bồi thường khi chính sách cho phép**.
  - Loại: giữ chỉ dẫn cũ rồi thêm câu "tham khảo knowledge"; để tài liệu tự quyết; để độ dài tuỳ sự cố.

### 5.4 Bảo trì cấu hình, tài liệu, Memory
- **Xem lại định kỳ, kể cả khi chất lượng chưa giảm**, vì chính sách, thuật ngữ, tài liệu thay đổi. Hai thời điểm: tới kỳ rà soát, và **ngay khi tài liệu nguồn đổi**.
  - Loại: chỉ sửa khi kết quả hỏng; để yên rồi sửa trong từng chat; sửa theo lịch cứng bất kể có gì đổi.
- **Kết quả Project trôi khỏi kỳ vọng:** thử đầu tiên là **xem lại chỉ dẫn và tài liệu tham chiếu so với chuẩn hiện hành**.
  - Loại: chấp nhận độ lệch; đổi model; dựng lại từ đầu.
  - Thay tài liệu thì **xoá bản cũ khỏi knowledge**.
- **Thay tài liệu trong Project dùng chung:** **báo cho người dùng đã đổi gì** (để họ biết câu trả lời cũ không còn đúng).
  - Loại: ghi chú vào tên Project (Claude không đọc tên); mỗi người tự sao một bản; xoá lịch sử chat.
- **Bảo trì Memory** (Settings > Your Claude > Manage):
  - **xuất memory làm bản sao lưu trước khi sửa**
  - **sửa hoặc xoá mục cũ, sai; thêm phần còn thiếu**
  - Loại: để nguyên; tắt hẳn Memory; xoá sạch để học lại.
- **Nhập Memory từ dịch vụ AI khác:** bật Memory và dùng import. **Đây là tính năng thử nghiệm, có thể không nhập được hết, phần thiếu thì thêm bằng tay.**
  - Loại: "memory nhập lưu riêng"; "Claude cố ý bỏ"; "ghi đè toàn bộ".
  - Đề có thể ghi đường dẫn cũ Settings > Capabilities.

---

## DOMAIN 6: Governance, Risk & Responsible Use

### 6.1 Việc nên và không nên dùng Claude
- **Không phù hợp:**
  - làm **người quyết định duy nhất** về khoản vay, tuyển dụng, tuyển sinh
  - **tự thực hiện hành động khó đảo ngược mà không ai duyệt** (tự gửi email, tự sửa dữ liệu thật)
  - cam kết pháp lý
  - theo dõi dữ liệu thời gian thực cần phản ứng tức thì
- **Claude tự duyệt hạn mức tín dụng:** chọn **từ chối thiết kế để Claude quyết một mình; Claude hỗ trợ, chuyên viên giữ quyền quyết**.
  - Loại: mở rộng cho Claude gửi thông báo luôn; đồng ý vì nhanh; chạy thử rồi chỉ báo tuân thủ khi có chuyện.
- **Usage Policy, việc rủi ro cao (high-risk):** pháp lý, y tế, tài chính, **tín dụng**, bảo hiểm, nhà ở, **tuyển dụng / nhân sự**, **tuyển sinh / chấm thi**, phúc lợi công, tình trạng pháp lý. Có **2 yêu cầu bắt buộc**:
  - **Qualified human-in-the-loop**: người đủ chuyên môn, có quyền sửa, xem xét thực chất, chịu trách nhiệm.
  - **Disclosure**: người bị ảnh hưởng được biết có dùng AI.
  - **Thực thi pháp luật và tư pháp hình sự: cấm hẳn.**
- **Tách quyết định khỏi việc viết thư:** việc đầu là **tách quyết định ai được nhận khỏi việc viết thư, người giữ quyết định**.
- **Rủi ro của agent tự hành động:** **mất giám sát của con người với hành động khó đảo ngược**. Rủi ro này không đổi dù dùng API hay app.
- **Thứ tự đánh giá một cách dùng mới:** người đọc, **tác động, khả năng đảo ngược** → **loại dữ liệu** (có nhạy cảm không) → **đối chiếu chính sách và pháp luật** → quyết (cho làm / cho làm khi sửa lại / từ chối) → **ghi lại kết quả và lý do**.
- Quyết định cuối về con người **không giao hẳn cho AI**, vì **cần phán đoán và trách nhiệm của con người**, không phải chỉ vì "hệ thống chưa ổn định".

### 6.2 Dữ liệu nhạy cảm và quyền riêng tư
- **Cần che hoặc ẩn danh:** số định danh, số thẻ, số tài khoản, lương kèm tên, hồ sơ sức khoẻ hay nhân sự, địa chỉ nhà, mã nhân viên kèm ngày vào làm, mật khẩu.
  - **Không cần che:** chức danh công khai, mô tả sản phẩm, thông cáo báo chí.
- **Câu mẫu chính thức** (bảng tính có tên và số tài khoản, chính sách hạn chế): chọn **bỏ hoặc ẩn danh thông tin định danh TRƯỚC khi tải lên**.
  - Loại: tải nguyên vì nội bộ; tải rồi dặn Claude đừng lưu; bỏ hẳn việc phân tích.
- **Bước đầu với tài liệu lẫn dữ liệu nhạy cảm:** **phân loại nội dung, chỉ ra trường nào nhạy cảm**.
- **Dữ liệu của người khác (khảo sát):** **kiểm sự đồng ý và chính sách** → bỏ trường không cần → chạy việc, đọc lại kết quả → ghi lại đã bỏ gì.
- **Nguyên tắc: chỉ đưa vào những gì việc cần.**
  - Loại: đổi trường nhạy cảm này lấy trường nhạy cảm khác; gửi cả hồ sơ rồi dặn "đừng nhắc"; thêm tên khách "cho có bối cảnh".
- **Incognito:**
  - Có tác dụng: không lưu lịch sử, không dùng hay tạo memory, **không dùng để cải thiện Claude**.
  - **Nhưng:** vẫn được giữ **30 ngày**; trên Team/Ent vẫn nằm trong bản xuất dữ liệu của chủ tổ chức; **KHÔNG thay được chính sách dữ liệu** của tổ chức.
- **Tắt Memory cho một chat:** thông tin không thành memory, nhưng **không thay được việc che dữ liệu**.
- **Code execution cách ly:** **không thay được việc rà và che dữ liệu**.
- **Giữ kín một con số chưa công bố:** **chat Incognito**, hoặc **tắt Memory cho chat đó**.
- **Dữ liệu theo gói:**
  - **Gói cá nhân** (Free / Pro / Max / Ultra): dùng để cải thiện model **nếu bạn cho phép**, nếu bị đánh dấu rà soát an toàn, hoặc nếu bạn tham gia.
  - **Gói doanh nghiệp** (Team / Enterprise / API): **mặc định KHÔNG dùng để huấn luyện**.
  - **Bấm thumbs up/down: toàn bộ cuộc chat được lưu tới 5 năm.** Owner Team/Ent có thể **tắt tính năng đánh giá cho cả tổ chức**.
- **Rủi ro Project công khai chứa bảng lương:** **bất kỳ ai cũng hỏi ra được lương** bằng câu hỏi bình thường.
- **Quy tắc chọn đáp án: xử lý dữ liệu TRƯỚC khi gửi.** Loại các đáp án dựa vào lời dặn Claude, Incognito, môi trường cách ly, "chỉ dùng nội bộ".

### 6.3 Chính sách AI và quản trị của tổ chức
- **Khung quản trị AI có 4 điều:**
  - **công cụ được duyệt** (tài khoản công ty, không dùng tài khoản cá nhân)
  - **dữ liệu được phép đưa vào**
  - **khâu duyệt bắt buộc**
  - **đường báo cáo sự cố**
  - Không phải danh sách khoá học, bảng giá, hay bộ văn bản pháp lý.
- **Chính sách cấm rõ** (ví dụ thông tin điều tra nội bộ đang diễn ra): **không đưa vào, hỏi người phụ trách cách được duyệt**.
  - Loại: đợi điều tra xong; dùng Incognito; diễn đạt lại bỏ chi tiết định danh.
- **Không chắc chính sách đòi gì:** **tìm hiểu chính sách trước khi gửi**.
  - Loại: nhờ quản lý ký để chuyển trách nhiệm; hỏi khách; **thêm dòng "có dùng AI" rồi gửi** (bẫy hay gặp nhất: ghi chú minh bạch không thay được các bước khác mà chính sách đòi).
- **Kết quả có thể đã lộ thông tin bị hạn chế:** **ngừng dùng → ghi lại (prompt, nguồn, con số) → báo qua kênh quản trị hoặc kênh sự cố**.
  - Loại: mở chat mới coi như xong; dùng nội bộ; tự sửa rồi ghi sổ tay cá nhân mà không báo.
- **Skill hoặc connector từ bên thứ ba lạ, 2 kiểm tra:**
  - **đối chiếu với danh sách được tổ chức duyệt**
  - **xem quyền và khả năng nó yêu cầu có hợp với việc không**
  - Đánh giá tốt ở bên ngoài không thay được 2 kiểm tra này. Ưu tiên skill do Owner cung cấp sẵn.
- **Diligence:** **áp dụng chính sách nhất quán như thói quen, tự tìm chỗ lệch và sửa dần**. Không phải ký cam kết một lần, không phải đẩy hết cho bộ phận tuân thủ.

### 6.4 Đạo đức khi dùng AI
- **2 rủi ro đạo đức lớn nhất:**
  - **kết quả có hệ thống gây bất lợi cho một nhóm được bảo vệ** (giới tính, tuổi, tôn giáo, khuyết tật…)
  - **quyết định ảnh hưởng lớn tới việc làm của một người mà không ai chịu trách nhiệm**
  - Lỗi chính tả, gạch ngang, giọng văn **không phải** vấn đề đạo đức.
- **Kiểm công bằng:**
  - câu hỏi phỏng vấn **áp dụng như nhau cho mọi ứng viên, không giả định về xuất thân, bám yêu cầu thật của công việc**
  - mô tả nhóm người **theo hành vi và dữ liệu quan sát được**, không theo khái quát nhân khẩu học
  - Loại: xoay vòng thứ tự câu hỏi; thêm câu riêng theo CV từng người; chỉ chỉnh giọng và độ dài.
- **Claude chấm điểm và tự loại ứng viên:** Claude chỉ tóm tắt theo tiêu chí; **người tuyển dụng đọc, quyết định, chịu trách nhiệm**; ứng viên được biết có AI tham gia.
- **Minh bạch có 3 mức:**
  - với người bị ảnh hưởng
  - với người đọc (**AI diligence statement**)
  - trong chính nội dung: watermark hoặc Content Credentials theo EU AI Act, áp dụng cho model ra mắt ở EU từ 02/08/2026. Dấu này không thay việc tự nói rõ.
- **Thứ tự rà soát đạo đức trước khi công bố:** **người đọc và tác động** → **nội dung** (khái quát, công bằng, chính xác) → **minh bạch** → **sửa hoặc báo lên** nếu vượt thẩm quyền → **ghi lại**.
- Nghiên cứu của Anthropic (Claude 2.0): đổi thông tin nhân khẩu học thì có lúc kết quả đổi. Prompt cẩn thận giúp giảm. Anthropic **không cho phép** dùng model để tự động ra quyết định rủi ro cao.

---

## DOMAIN 7: Troubleshooting & Optimization

### 7.1 Chẩn đoán kết quả kém
- **5 bước:** **đọc hết, chỉ ra đúng chỗ kém** → **so với prompt** → **đặt giả thuyết** → **sửa MỘT chỗ, xem tác dụng** → **ghi nguyên nhân gốc và cách sửa**.
  - Sai thứ tự hay gặp: đặt giả thuyết trước khi đọc; so với prompt trước khi biết chỗ kém.
- **Nguyên nhân gốc gần như luôn là prompt nêu thiếu:**

  | Triệu chứng | Gốc |
  |---|---|
  | Phân loại không nhất quán | thiếu **danh mục, khuôn đầu ra, tiêu chí chọn** |
  | Mỗi tuần lệch một kiểu | thiếu **người đọc, giọng, khuôn, các mục bắt buộc** |
  | Bỏ sót câu hỏi (hỏi 3 câu cách nhau bằng dấu phẩy) | không **đánh số từng câu** |
  | Mơ hồ, lạc đề | chỉ nêu chủ đề, không nêu việc, người đọc, khuôn |

- **"Categorize this ticket" ra danh mục không nhất quán:** chọn **viết lại prompt nêu danh mục, khuôn, tiêu chí**.
  - Loại: **hạ temperature về 0** ("cố định sai"; app Claude chỉ chỉnh được model, effort, thinking); thêm người kiểm (hậu kiểm, không sửa gốc); **đổi model lớn hơn**.
- **Báo cáo tuần lệch:** gốc là **prompt thiếu người đọc, giọng, khuôn, mục bắt buộc**.
  - Loại: chuẩn hoá đầu vào; chấp nhận vì model ngẫu nhiên; tách thành 2 prompt.
- **Prompt đã đủ mà kết quả vẫn kém, xem thêm:**
  - chat quá dài thì **tóm tắt trạng thái rồi làm tiếp**
  - tài liệu hay chỉ dẫn Project cũ thì **cập nhật**
  - sai tính năng: tính toán thì dùng **code execution**, cần thông tin mới thì bật **web search**
  - việc rất khó thì **nâng effort trước, rồi mới đổi model**

### 7.2 Điều chỉnh theo phản hồi
- **Phản hồi có ích khi:** cụ thể, ghi lại **sau mỗi lần chạy**, biến thành thay đổi có chủ đích, rồi xem các lần sau có tốt hơn không.
- **Vòng hằng tuần:** **ghi phản hồi cụ thể** → biến thành **1–2 điều chỉnh** → chạy, so với vòng trước → ghi đã đổi gì và tác dụng → **quyết làm tiếp, đổi cách, hay báo lên**.
- **Phản hồi mơ hồ ("chưa ổn lắm", "bỏ sót rủi ro"):** việc đầu là **xin ví dụ cụ thể** (kết quả đã viết gì, lẽ ra phải viết gì). Với "bỏ sót rủi ro": **xin 2 bản bị sót kèm tên rủi ro, so với nhật ký gốc**.
  - Loại: chấm điểm 1–10; đổi sang bảng "cho dễ thấy"; viết lại ngay chỉ dẫn chung.
  - 8 người thử, 3 người nói "chưa ổn": **hỏi chính 3 người đó ví dụ cụ thể**. Không dừng thử nghiệm, không hỏi 5 người hài lòng.
- **Sửa lỗi mới thì lỗi cũ quay lại:** rủi ro lớn nhất là **không có văn bản ghi kết quả phải đáp ứng gì**. Cách sửa: **ghi danh sách yêu cầu, mỗi lượt sửa kiểm lại CẢ danh sách**.
- **Càng sửa càng lệch:** **quay về phiên bản prompt gần đúng nhất, sửa tiếp từ đó**. Vì vậy phải giữ các phiên bản prompt kèm ghi chú.
- **Muốn Anthropic ghi nhận lỗi:** **bấm thumbs down trên đúng câu trả lời sai**, đồng thời tự sửa bản nháp. Gõ "câu trước sai" chỉ sửa trong chat đó. (Feedback lưu cả chat **5 năm**; Owner có thể tắt nút này.)

### 7.3 Tối ưu quy trình
- **Tối ưu ở cấp Associate là:** **bớt trùng lặp, bỏ bước ít giá trị, dùng Claude ở chỗ có giá trị đo được, VẪN GIỮ các khâu duyệt và kiểm bắt buộc**.
  - Loại: cắt xuống ít bước nhất; thay mọi bước tay bằng Claude; ép mọi bước theo khuôn cố định.
- **2 việc trước khi sửa:**
  - **đo chất lượng, thời gian, chi phí hiện tại**
  - **tìm bước gây vấn đề nhiều nhất**
- **5 bước:** **vẽ quy trình hiện tại** → **tìm điểm nghẽn bằng số liệu** → **sửa đúng bước đó** → **thử nhỏ, so với mức cũ** → **triển khai, ghi lại**.
- **Thay đổi có tác dụng thật:**
  - **đưa tài liệu tham chiếu chuẩn vào Project** (khỏi dán lại; nội dung Project **được lưu đệm**, tốn ít hạn mức hơn)
  - **thêm khâu kiểm chất lượng trước khi kết quả sang bước sau**
  - **Thay đổi bề ngoài** (đổi tiêu đề, đặt tên bước, đổi tên workspace) không tính là tối ưu.
- **Thói quen tiết kiệm hạn mức:**
  - đưa đủ yêu cầu và tài liệu vào tin đầu
  - gom câu hỏi liên quan vào một tin
  - dùng Project cho tài liệu dùng lại
  - **việc mới thì mở chat mới**
  - hạ effort xuống Low/Medium cho việc thường
  - tắt connector không cần, hoặc dùng On demand
  - đóng gói quy trình lặp lại thành skill
  - Thứ tự đề hay hỏi: **quyết định mình cần gì → đưa yêu cầu và tài liệu vào tin đầu → hỏi tiếp dựa trên tin đầu → việc mới thì mở chat mới**.

---

## Bảng tra nhanh trước giờ thi

| Đề hỏi… | Chọn |
|---|---|
| Bước đầu phân tích yêu cầu | gom và gắn nhãn nguồn |
| Yêu cầu mâu thuẫn | đánh dấu, ghi nguồn, trả về người nêu |
| Yêu cầu dạng giải pháp | viết lại thành kết quả mong muốn, đánh dấu cần hỏi lại |
| Bước đầu nghiên cứu | câu hỏi nghiên cứu cụ thể |
| So sánh nhiều đối tượng | chốt đối tượng và tiêu chí trước |
| Điểm nghẽn | thời gian xử lý trung bình cao nhất |
| Bước đầu thiết kế giải pháp | vấn đề và ràng buộc |
| Trước khi xin ý tưởng sáng tạo | mục tiêu, thước đo + giọng, người dùng |
| 2 tiêu chí Delegation | cần phán đoán / thấu cảm / sáng tạo? + đảo ngược được không, hậu quả? |
| Automation / Augmentation / Agency | AI làm theo lệnh / cùng làm / AI tự làm thay |
| Giới hạn quan trọng nhất khi gửi ra ngoài | nói chắc mà không căn cứ, cần người duyệt |
| Thuyết phục người hoài nghi | ví dụ đo được + chỗ người vẫn duyệt |
| Bước đầu cấu hình Project | mục đích và các việc lặp lại |
| Chỉ dẫn hay knowledge | quy tắc → chỉ dẫn; tài liệu, bài mẫu → knowledge |
| Tài liệu hay đổi / cố định | connector / tải lên Project |
| Trước khi nối connector | danh sách được phép + phân loại dữ liệu |
| Chỉ dẫn tổ chức và cá nhân mâu thuẫn | tổ chức thắng (3.000 ký tự, ≤1 giờ, không tắt được an toàn) |
| Project trôi | xem lại chỉ dẫn và tài liệu so với chuẩn hiện hành |
| Thay tài liệu Project chung | xoá bản cũ + báo người dùng đã đổi gì |
| Bảo trì Memory | xuất sao lưu → sửa, xoá, thêm |
| Import memory thiếu | tính năng thử nghiệm, thêm bằng tay |
| AI tự quyết tín dụng, tuyển dụng, tuyển sinh | từ chối; người đủ chuyên môn quyết + disclosure |
| Thứ tự đánh giá cách dùng mới | tác động, đảo ngược → dữ liệu → chính sách → quyết → ghi lại |
| Dữ liệu định danh | bỏ hoặc ẩn danh TRƯỚC khi tải lên |
| Incognito | không train, nhưng chính sách vẫn áp dụng |
| Chính sách cấm | không làm, hỏi người phụ trách |
| Chính sách chưa rõ | tìm hiểu trước khi gửi |
| Có thể đã lộ thông tin | ngừng → ghi lại → báo kênh quản trị |
| Skill lạ | danh sách được duyệt + quyền yêu cầu |
| 2 rủi ro đạo đức lớn nhất | bất lợi cho nhóm được bảo vệ + không ai chịu trách nhiệm |
| Gỡ lỗi | đọc → so prompt → giả thuyết → sửa 1 chỗ → ghi |
| Gốc của kết quả kém | prompt nêu thiếu (không phải temperature hay model) |
| Phản hồi mơ hồ | xin ví dụ cụ thể, so với nguồn |
| Sửa vòng quanh | danh sách yêu cầu + quay về bản prompt tốt nhất |
| Báo lỗi cho Anthropic | thumbs down trên đúng câu sai |
| Tối ưu quy trình | đo → vẽ → điểm nghẽn → sửa → thử nhỏ → triển khai |
| Thay đổi đáng làm | tài liệu vào Project + thêm khâu kiểm chất lượng |

### Con số cần thuộc
- Chat: **500MB/file, 20 file**. Project: **30MB/file**. RAG: **gấp 10 lần**.
- PDF **≤100 trang** đọc cả hình; **101–1.000 trang** chỉ đọc chữ.
- Connector: **<10** thì dùng Always available; **≥10** thì dùng On demand.
- Chỉ dẫn tổ chức: **3.000 ký tự**, hiệu lực trong **≤1 giờ**.
- Incognito giữ **30 ngày**. Feedback thumbs up/down lưu **5 năm**.
- Usage Policy có hiệu lực từ **12/11/2026**. Watermark EU áp dụng từ **02/08/2026**.
