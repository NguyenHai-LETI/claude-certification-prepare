# Khử trùng ngân hàng câu hỏi CCAO-F — 2026-11-18

Phạm vi: toàn bộ 264 câu active của CCAO-F (official 3, ai-20261118-ccaof-ccdvf 30, ccx 231), so từng cặp kể cả giữa các domain khác nhau.
Tiêu chí: g trong `.claude/skills/cert-review/SKILL.md`, nghĩa là cùng quyết định cần đưa ra, cùng đáp án và cùng góc tiếp cận (stem diễn đạt khác hay bối cảnh bề mặt khác vẫn tính là trùng). Câu dạng chọn hai mà hai đáp án chỉ là đáp án của một câu khác tách đôi cũng tính là trùng (giống cặp K162 ~ K10).
Thứ tự ưu tiên chọn câu giữ: official > ai > ccx đã reviewed > ccx viết tốt hơn. Chỉ đề xuất retire câu thuộc pack `ccx`.
Lượt này **không sửa** file nào trong `bank/packs/`.

## Tổng quan

- **Số nhóm trùng:** 32
- **Số câu đề xuất retire:** 50 (đều thuộc ccx, không câu nào đã `reviewed`), tức 21,6% số câu ccx của CCAO-F. Tỷ lệ này cao hơn mức ~13% ước từ mẫu ngẫu nhiên vì lượt này so toàn bộ, gồm cả trùng chéo domain (D3↔D5↔D7, D1↔D7) và các câu chọn hai tách từ câu một đáp án.
- **Sau khử trùng:** 214 câu active.

| Domain | Trọng số | Trước | Retire | Còn lại | Số câu mỗi đề 60 câu | Còn lại / số câu mỗi đề |
|---|---|---|---|---|---|---|
| D1 Prompting and Task Execution | 14% | 36 | 8 | 28 | ~8,4 | 3,3× |
| D2 Output Evaluation and Validation | 21% | 56 | 11 | 45 | ~12,6 | 3,6× |
| D3 Product and Model Selection | 12% | 32 | 9 | 23 | ~7,2 | 3,2× |
| D4 Workflow Integration and Solution Design | 16% | 42 | 5 | 37 | ~9,6 | 3,9× |
| D5 Configuration and Knowledge Management | 12% | 32 | 7 | 25 | ~7,2 | 3,5× |
| D6 Governance, Risk, and Responsible Use | 15% | 40 | 6 | 34 | ~9,0 | 3,8× |
| D7 Troubleshooting and Optimization | 10% | 26 | 4 | 22 | ~6,0 | 3,7× |
| **Tổng** | | **264** | **50** | **214** | 60 | 3,6× |

**Ghi chú về độ phủ:** không domain nào bị thiếu nghiêm trọng, nhưng **D3 (23 câu, 10,7% kho so với trọng số 12%)** và **D1 (28 câu, 13,1% so với 14%)** mỏng nhất, chỉ đủ khoảng 3 đề thi thử mà không lặp câu. Nên dùng `/cert-generate` bổ sung khoảng 8–10 câu D3 và 5 câu D1, ưu tiên các góc chưa có: chọn effort level hay model theo việc, Cowork hay chat hay Research, memory theo Project (D3); chỉ dẫn nhiều bước, prefill định dạng (D1).

## Bảng nhóm trùng

| Giữ | Retire | Domain | Lý do trùng (1 dòng) |
|---|---|---|---|
| Y33 | K01, K59 | D1 | Yêu cầu mơ hồ ("write something…", "write a project update") → bổ sung người đọc, mục đích, số liệu, độ dài, định dạng; giữ Y33 vì giải thích nêu lý do sai của từng nhiễu. |
| K170 | K02, Y34, K60 | D1 | Việc lớn nhiều phần → chia thành chuỗi bước, kiểm từng bước rồi mới làm bước sau (không làm một prompt cho tất cả); giữ K170 vì giải thích đầy đủ nhất, có nhiễu thiên lệch xác nhận. |
| Q10 (D7, reviewed) | K03, K61 (D1) | D1/D7 | Bản nháp đúng nội dung nhưng sai giọng/quá chuyên môn → góp ý cụ thể chỗ cần đổi và chỗ cần giữ, ngay trong chat (không "make it better"/làm lại từ đầu). |
| OF-CCAOF-01 (official) | K05, Y31 | D2 | Claude trích số điều khoản/mục cụ thể một cách tự tin → đối chiếu với văn bản gốc trước khi gửi (K05 gần như diễn đạt lại câu mẫu Exam Guide). |
| K07 | K74 | D2 | Số liệu trong cùng output mâu thuẫn nhau → kiểm số đúng trong dữ liệu gốc rồi yêu cầu Claude sửa; giữ K07 vì nhiễu "sửa dữ liệu gốc cho khớp" hợp lý hơn. |
| K08 | K83, K76 | D2 | Chọn output cần người duyệt/kiểm thêm → nội dung rủi ro cao, gửi ra ngoài (hợp đồng, nhà đầu tư, y tế, cơ quan quản lý) đối lập với việc nội bộ nhẹ. |
| Y18 | K09, K79 | D2 | Tài liệu độc lập sẽ được sửa nhiều lần, chia sẻ, dùng lại → artifact; giữ Y18 vì nhiễu hợp lý và giải thích từng phương án. |
| K10 (reviewed) | K80, K162 | D2 | Dữ liệu trích để đưa vào bảng tính/hệ thống → bảng hoặc CSV, mỗi dòng một mục, cột cố định (K162 tách đôi đáp án của K10). |
| K27 | K161 | D2 | Kiểm tóm tắt tài liệu dài → đối chiếu độc lập các phần/số liệu chính với bản gốc, không hỏi lại Claude hay so độ dài. |
| K86 | K160 | D2 | Nguồn không tìm thấy/link "page not found" là dấu hiệu có thể bịa → coi là chưa kiểm chứng; K160 lấy đúng tình huống của K86 (và K30) làm đáp án. |
| AI-CCAOF-010 (ai) | K156 (D7) | D2/D7 | Claude bịa chi tiết khi tài liệu không nói → cho phép nói "không có trong tài liệu / không đủ thông tin". |
| Y10 (D5) | K12 (D3), K94 (D3), K25 (D7) | D3/D5/D7 | Bối cảnh, tài liệu và quy tắc dùng lại cho việc lặp lại → đưa vào Project (knowledge + instructions) thay vì dán lại mỗi chat; giữ Y10 vì phân biệt rõ knowledge và instructions. |
| Y19 | K13, K95 | D3 | Báo cáo tổng hợp nhiều nguồn có trích dẫn → Research; giữ Y19 vì nhiễu so với web search và extended thinking sát đề thật hơn. |
| K158 (D7, reviewed) | K14 (D3), K98 (D3), Y30 (D7) | D3/D7 | Chat quá dài, Claude lẫn hoặc quên quyết định trước → tóm tắt các điểm đã chốt rồi mở chat mới kèm bản tóm tắt. |
| K44 | K102 | D3 | Suy luận phức tạp, đối chiếu mâu thuẫn trên nhiều tài liệu dài → model mạnh nhất (Opus); giữ K44 vì là tình huống, nhiễu của K102 quá lộ. |
| OF-CCAOF-02 (official) | B15, K92 | D3 | Việc ngắn, khối lượng lớn, ưu tiên tốc độ và chi phí → model nhanh, rẻ (Haiku). |
| K104 | K45 | D4 | Ca sử dụng đầu tiên tốt → soạn câu trả lời lặp lại có người duyệt; giữ K104 vì nhiễu và giải thích nêu thêm rủi ro gian lận thanh toán. |
| K17 (reviewed) | K103 | D4 | Hỗ trợ thu thập yêu cầu → cấu trúc hoá ghi chú, nêu câu hỏi mở và giả định để các bên xác nhận. |
| Y28 | K33 | D4 | Đưa Claude vào quy trình soạn thư hay cập nhật → Claude soạn, người chịu trách nhiệm duyệt rồi gửi; giữ Y28 (bối cảnh Cowork + email, giải thích từng nhiễu). |
| K34 | K111 | D4 | Đo hiệu quả hay quyết định mở rộng → số đo trước và sau về thời gian và chất lượng, không dùng số lượt dùng hay lời Claude tự đánh giá. |
| K47 | K106 | D4 | Lập kế hoạch (ra mắt sản phẩm, chuyển văn phòng) → Claude phác timeline/checklist, người phụ trách xác nhận. |
| K124 (reviewed) | K18, K51 | D5 | Quy tắc áp dụng cho mọi chat của cả nhóm (giọng, định dạng, mục Sources) → đặt ở Project instructions. |
| K19 | K125, K130 | D5 | Kho Project có bản cũ và bản mới của cùng tài liệu → thay bằng bản hiện hành, gỡ bản lỗi thời. |
| Y11 | K123 | D5 | Sự thật nghiệp vụ thay đổi (đổi tên sản phẩm, đổi chính sách) → cập nhật cả knowledge lẫn instructions còn nội dung cũ; giữ Y11 vì nhiễu hợp lý hơn. |
| K50 | K165 | D5 | Giữ kho tri thức đáng tin → gỡ bản trùng hoặc lỗi thời, đặt tên file rõ ràng (K165 tách đôi đáp án của K50). |
| K20 | K122 | D5 | Connector (Drive/Gmail) đọc được những gì tài khoản bạn truy cập được → chỉ bật hoặc kết nối khi cần và chính sách cho phép. |
| K149 (D7, reviewed) | K56 (D7) | D7 | Định dạng/cấu trúc output thay đổi mỗi lần → nêu cấu trúc chính xác kèm ví dụ mẫu trong chỉ dẫn dùng chung. |
| K24 (D7) | K65 (D1) | D1/D7 | Muốn output ngắn hoặc vừa khuôn → ràng buộc cụ thể (số ý, số từ) thay cho "keep it short"/"short but complete". |
| OF-CCAOF-03 (official) | H09, K21, Y08 | D6 | File có định danh cá nhân, chính sách hạn chế → xoá hoặc ẩn danh trước khi tải lên; dặn Claude "đừng lưu" không phải là biện pháp kiểm soát. |
| K22 | K141 | D6 | Tài liệu mật hoặc nội bộ → chỉ xử lý trong workspace công ty được duyệt, không dùng tài khoản cá nhân; giữ K22 vì có xung đột thực tế (tiết kiệm thời gian), nhiễu của K141 quá lộ. |
| K133 (reviewed) | K23 | D6 | Ca sử dụng không phù hợp → tự động ra quyết định hệ trọng (bồi thường bảo hiểm, cho vay) không có người duyệt (cùng lý do trước đây đã retire K166). |
| Y04 | K143 | D6 | Yêu cầu viết đánh giá hoặc bài đăng giả danh khách hàng → từ chối vì lừa dối; giữ Y04 vì nhiễu "manager duyệt / thêm chú thích" hợp lý và có dẫn Usage Policy. |

## Gần giống nhưng giữ cả hai

| Cặp / cụm | Vì sao không coi là trùng |
|---|---|
| K40 ↔ Y33 | K40 là prompt tóm tắt cho lãnh đạo (trọng tâm quyết định, rủi ro, chi phí; nhiễu "giữ mọi chi tiết"), không phải yêu cầu viết mơ hồ. |
| K31 ↔ K64 | Cùng ý "đưa ví dụ", nhưng K31 bắt giọng văn kèm người đọc và ý chính, K64 bắt cấu trúc tài liệu. Chưa đủ chắc để retire; có thể xem lại khi soát D1. |
| K04 ↔ K63 | K04 so sánh cách viết prompt brainstorm và prompt phân tích; K63 chỉ hỏi prompt brainstorm. |
| K66 ↔ AI-CCAOF-007 | Cùng bối cảnh soát hợp đồng bên mua, nhưng đáp án khác: nêu bối cảnh và tiêu chí xếp hạng rủi ro, so với giao vai chuyên gia. |
| K68, K77 ↔ Q10 | K68: khôi phục số liệu bị mất mà vẫn giữ giọng mới. K77: chuyển nội dung cho người đọc khác (chọn lại nội dung: tác động, chi phí), không chỉ đơn giản hoá. |
| K67 ↔ K170 | K67 là chọn hai, thêm ý "liệt kê câu hỏi mở và giả định trước khi soạn". |
| Q03 ↔ Y20 | Q03: khi nào nên bật suy luận từng bước (so với việc đơn giản). Y20: thinking so với web search hay Research. |
| K06 ↔ K75 | K06: xử lý một thống kê không nguồn (kiểm hoặc xoá). K75: phương pháp fact-check (truy nguồn gốc). |
| K30 ↔ K86 ↔ K73 | Cùng chủ đề nguồn có thể bị bịa nhưng ba tình huống khác nhau: danh sách sách sẽ công bố (kiểm mọi mục), link cơ quan nhà nước hỏng (tìm lại trên trang chính thức), trích dẫn không có trong file khảo sát (bịa hoặc diễn giải lại). |
| K87 ↔ AI-CCAOF-016 | Cùng đáp án "loại chi tiết nội bộ trước khi gửi ra ngoài", nhưng AI-016 kiểm kiến thức Research tự dùng connector mà không hỏi duyệt; K87 là đổi người đọc. |
| K42 ↔ T03 | K42: khái quát quá mức so với số đếm thực. T03: phạm vi kết luận bị giới hạn bởi dữ liệu được cung cấp. |
| K29 ↔ AI-CCAOF-018 | AI-018 là chọn hai rộng hơn (kỹ thuật không loại bỏ hẳn hallucination). |
| K57 ↔ AI-CCAOF-010 / AI-CCAOF-011 | K57 là chẩn đoán "thử gì trước" (file có đọc được không, rồi yêu cầu bám file); AI-011 là trích quote trước. |
| K89 ↔ K07 | K89 hỏi cách kiểm nhanh một phép cộng; K07 hỏi xử lý mâu thuẫn nội tại. |
| K144 ↔ K08 | K144 hỏi yếu tố quyết định mức giám sát (mức tác động của lỗi), không phải chọn ví dụ. |
| K26, Y16 ↔ K100 | Phân tích CSV bằng code execution; chọn output .xlsx có công thức; năng lực tạo file. Ba quyết định khác nhau. |
| K43 ↔ K88 | Chọn tính năng (chat thường) so với chọn định dạng trả lời (ngắn, trong chat). |
| K97, K155 ↔ OF-CCAOF-02 | K97: chọn model theo việc đạt ngưỡng chất lượng trên mẫu. K155: tối ưu khi đang dùng Opus cho mọi việc. Góc khác câu official. |
| K163, T05 ↔ K158 | K163: nhận diện khi nào nên mở chat mới (đã ghi ở review trước). T05: việc quá lớn cho một cuộc chat (chia giai đoạn + Project). |
| K96 ↔ Y18 | K96: dựng công cụ tương tác nhỏ; Y18: tài liệu sửa và chia sẻ. |
| K99 ↔ Y10 | K99 hỏi thông tin nào nên lưu bền, không hỏi lưu ở đâu. |
| K16 ↔ Y35 ↔ Y32 | Cùng giải thích giá trị và giới hạn, nhưng K16 về quyền phê duyệt, Y35 về thông điệp cho quy trình hỗ trợ, Y32 thêm chuyển phần tích hợp cho developer hoặc architect. |
| Q04 ↔ Q12 ↔ K49 | Cùng nguyên tắc Delegation nhưng quyết định khác: phần nào giao cho Claude khi chấm hiệu suất; chia việc chọn nhà cung cấp; bước tuyển dụng phải giữ cho người. |
| K15, K34 ↔ K164 | K164 là chọn hai gộp hai ý (phạm vi có người duyệt + số đo trước và sau), không trùng riêng câu nào. |
| K118 ↔ K171 | K118: tăng cường so với thay người. K171: tăng cường so với thiết kế lại quy trình. |
| K105 ↔ Y28 | K105 có đáp án khác (prompt template trong Project). |
| K46 ↔ K110 | Hai mối lo khác nhau: bị thay thế, so với bị giám sát. |
| Y11 ↔ K19 | Y11 có thêm ý sửa instructions đang ghi nội dung cũ. |
| K121 ↔ K50 | K121: nên tải gì lên Project mới. K50: dọn kho đang lộn xộn. |
| K132, Y24 ↔ K20 | K132: cấp quyền tối thiểu (một thư mục). Y24: dự đoán hệ quả của việc kế thừa quyền. |
| K52 ↔ K127 | K127 là chọn hai rộng hơn (tắt memory hoặc dùng incognito + soát và xoá). |
| K35 ↔ K151 | K35: yêu cầu đổi nên phải sửa instructions. K151: Claude trả lời sai ngôn ngữ, cần thêm quy tắc. |
| K167 ↔ K149 | Cả hai đã reviewed; K167 là chọn hai về chỗ đặt (Project instructions) và cách viết (kèm ví dụ). |
| K139 ↔ OF-CCAOF-03 / K22 | K139 là chọn hai gộp ẩn danh + workspace được duyệt. |
| K146 ↔ K22 | K146 thêm nguyên tắc lưu giữ dữ liệu (retention). |
| K140 ↔ Y02 ↔ K133 | K140: chọn việc ổn khi duyệt bình thường. Y02: nhận diện danh mục High-risk của Usage Policy. Góc khác nhau. |
| K55 ↔ K142 | Tự mình làm lộ dữ liệu so với thấy nhóm khác dùng tool chưa duyệt (đã ghi ở review trước). |
| Y01 ↔ Y03 | Y03 kiểm riêng yêu cầu công khai việc dùng AI khi đã có người duyệt. |
| K36 ↔ Q11 | K36: tuân thủ quy định công khai việc dùng AI. Q11: định nghĩa ứng dụng của Diligence. |
| K38 ↔ T04 ↔ K154 | T04 hỏi vì sao (bỏ sót phần giữa); K38 là cách tóm tắt từng phần; K154 là hỏi đáp trên tài liệu dài. |
| K58 ↔ K153 | Hai connector, triệu chứng khác (không mở được doc, so với không tìm thấy email do từ khoá). |

## Ghi chú cho người áp dụng

- Chỉ đặt `status: retired` cho các ID trong `RETIRE_IDS`. Câu giữ không cần sửa vì lý do trùng.
- Sau khi retire, chạy `node scripts/validate.ts`.
- Mẫu lặp của bộ ccx: cùng một ý thường có 2–4 biến thể (câu tình huống, câu kiến thức thuần, câu chọn hai tách đôi đáp án), nhất là ở Project, chat dài, Research và chọn model. Khi sinh thêm câu CCAO-F, kiểm trùng với các câu giữ ở bảng trên.

KEEP_IDS: Y33,K170,Q10,OF-CCAOF-01,K07,K08,Y18,K10,K27,K86,AI-CCAOF-010,Y10,Y19,K158,K44,OF-CCAOF-02,K104,K17,Y28,K34,K47,K124,K19,Y11,K50,K20,K149,K24,OF-CCAOF-03,K22,K133,Y04
RETIRE_IDS: K01,K59,K02,Y34,K60,K03,K61,K05,Y31,K74,K83,K76,K09,K79,K80,K162,K161,K160,K156,K12,K94,K25,K13,K95,K14,K98,Y30,K102,B15,K92,K45,K103,K33,K111,K106,K18,K51,K125,K130,K123,K165,K122,K56,K65,H09,K21,Y08,K141,K23,K143
