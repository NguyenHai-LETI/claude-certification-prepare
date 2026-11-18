# Khử trùng ngân hàng câu hỏi CCAR-P — 2026-11-18

Người soát: claude-opus-5-5 · Phạm vi: toàn bộ 192 câu active gắn CCAR-P (pack `official`, `ai-20261118-ccarp-ccarf`, `ccx`), so từng cặp cả trong cùng domain lẫn khác domain · Tiêu chí: mục g của `.claude/skills/cert-review/SKILL.md` (cùng quyết định + cùng đáp án ở góc giống nhau = trùng, kể cả khi bối cảnh bề mặt khác).

Báo cáo này **chỉ đề xuất**: chưa sửa file nào trong `bank/packs/`. Câu official và ai không bị đề xuất retire.

## Tổng quan

| Chỉ số | Giá trị |
|---|---|
| Số câu active trước khử trùng | 192 |
| Số nhóm trùng | 8 (mỗi nhóm 2 câu) |
| Số câu đề xuất retire | 8 (đều thuộc `ccx`) |
| Số câu còn lại | 184 |
| Tỉ lệ trùng trong phần `ccx` (144 câu) | 8/144 ≈ 5,6% |

Cách chọn câu giữ: official > ai > ccx đã reviewed > ccx viết tốt hơn (tình huống thực tế hơn, phương án nhiễu hợp lý hơn, giải thích đầy đủ hơn).

### Số câu theo domain

| Domain | Trọng số | Trước | Retire | Còn lại | Tỉ lệ sau |
|---|---|---|---|---|---|
| D1 Solution Design & Architecture | 17% | 32 | 1 | 31 | 16,8% |
| D2 Models, Prompting & Context | 13% | 25 | 0 | 25 | 13,6% |
| D3 Integration | 19% | 36 | 1 | 35 | 19,0% |
| D4 Evaluation, Testing & Optimization | 16% | 32 | 2 | 30 | 16,3% |
| D5 Governance, Safety & Risk | 14% | 27 | 3 | 24 | 13,0% |
| D6 Stakeholder Communication & Lifecycle | 14% | 27 | 1 | 26 | 14,1% |
| D7 Developer Productivity & Ops | 7% | 13 | 0 | 13 | 7,1% |

Sau khử trùng, mọi domain vẫn bám sát trọng số. Domain hơi thấp nhất là **D5** (13,0% so với 14%, mất 3 câu). Chưa thiếu nghiêm trọng, nhưng nếu sinh thêm câu thì nên ưu tiên D5. D7 chỉ có 13 câu tuyệt đối: đủ cho thi thử theo trọng số 7%, nhưng sẽ lặp lại nhanh khi luyện riêng domain.

## Bảng nhóm trùng

| Giữ | Retire | Domain | Lý do trùng (1 dòng) |
|---|---|---|---|
| PC43 (ccx, reviewed) | PC32 | D5 · D5 | Cùng kiểm thiên lệch khi sàng lọc ứng viên bằng cặp hồ sơ chỉ khác thuộc tính nhạy cảm; PC32 có đáp án dài hơn hẳn, nhiễu dùng từ tuyệt đối ("always", "every form"). |
| OF-CCARP-03 (official) | PC11 | D4 · D4 | PC11 chép gần nguyên văn câu mẫu official (RAG sai sau khi làm mới tài liệu → điều tra retrieval/indexing), cùng 4 phương án. |
| OF-CCARP-01 (official) | PC34 | D3 · D5 | Cùng quyết định least privilege: agent có quyền nó không cần → gỡ hẳn quyền đó; nhiễu cùng kiểu (log, lời dặn trong prompt, giảm tần suất / thêm xác nhận). |
| PA01 (ccx) | PD01 | D1 · D6 | Cùng hỏi việc cần làm rõ đầu tiên khi mở đầu dự án AI: tiêu chí thành công, quy trình hiện tại, ràng buộc, giá của lỗi; PA01 có nhiễu hợp lý hơn (PD01 có nhiễu "màu giao diện" quá lộ). |
| PB16 (ccx) | PC44 | D3 · D5 | Cùng quyết định: ngăn người dùng thấy dữ liệu không được phép bằng cách lọc retrieval theo quyền người hỏi, nhiễu cùng là lời dặn trong prompt; PB16 có triệu chứng cụ thể và nhiễu tinh hơn (bớt chunk, xoá tài liệu). |
| PB21 (ccx) | PC18 | D3 · D4 | Cùng hỏi cách giảm độ trễ mà không giảm chất lượng → chạy song song các bước gọi độc lập; nhiễu trùng kiểu (hạ model, cắt max_tokens). PB21 có tình huống cụ thể, PC18 chỉ hỏi chung. |
| PB13 (ccx) | PA22 | D3 · D1 | Cùng quyết định: kho tài liệu nhỏ, ít đổi → đưa nguyên vào prompt có caching thay vì hệ phức tạp; nhiễu cùng bộ (fine-tune, multi-agent, web). PB13 nêu ngưỡng cỡ kho rõ hơn. |
| PA34 (ccx) | PB25 | D2 · D3 | Cùng quyết định: nhiều quy trình làm đầy context → nạp dần bằng Skills khi cần; nhiễu trùng ("tách deployment theo từng quy trình", "nhồi hết vào prompt"). Phần tool search của PB25 đã có ở PB02, phần mô tả skill có ở PB29. |

## Gần giống nhưng giữ cả hai

| Cặp / cụm | Vì sao không coi là trùng |
|---|---|
| PA33 ~ PC40 ~ OF-CCARP-02 | Cùng khái niệm cache theo tiền tố nhưng ba quyết định khác nhau: chọn tối ưu hoá (OF-02), chẩn đoán vì sao cache không trúng (PA33), sửa khi đã biết dấu thời gian nằm ở dòng đầu (PC40). PC40 sát nhất với PA33. Nếu cần bớt thêm, đây là cặp nên xem lại đầu tiên. |
| PD30 ~ PA33 / PD27 | PD30 là tool chèn giữa danh sách làm đổi tiền tố (bối cảnh vận hành, chi phí tăng); PD27 hỏi kiểm tra gì đầu tiên, không phải nguyên nhân. |
| PC21 ~ PD13 | Cùng tình huống model sắp retire. PC21 hỏi cách đánh giá (eval đầy đủ thay vì benchmark công khai / hỏi model), PD13 hỏi phản ứng vòng đời (deprecated vẫn chạy tới ngày retire, lên kế hoạch migration). |
| PB05 ~ PB16 | PB05 chẩn đoán lỗ hổng (service account dùng chung bỏ qua phân quyền theo người dùng); PB16 hỏi cách sửa. |
| PC35 ~ PB16 | PC35 về memory không tách theo người dùng; PB16 về lọc retrieval theo quyền. |
| PB02 ~ PA34 | PB02 là quá nhiều tool definition → tool search; PA34 là quá nhiều quy trình → Skills. Cơ chế khác nhau. |
| PA11 ~ AI-CCARP-015 ~ AI-CCARP-042 | Cùng chủ đề lạm dụng subagent nhưng khác quyết định: lead agent phân bổ nỗ lực theo độ phức tạp (PA11), thêm hướng dẫn trong prompt sau khi đổi model (AI-015), giải thích chi phí cho CFO (AI-042). |
| PA06 ~ AI-CCARP-044 | PA06 chọn kiến trúc workflow; AI-044 giải thích lựa chọn đó cho nhà tài trợ (góc truyền đạt của D6). |
| PC36 ~ AI-CCARP-035 | PC36 nhận diện hành động cần cổng duyệt; AI-035 chọn chính sách tự chủ (đảo ngược được vs phá huỷ). |
| PC23 ~ AI-CCARP-034 | Cùng "ép quy tắc bằng code, không bằng prompt" nhưng cơ chế khác: hook kiểm tra ngưỡng hoàn tiền vs chỉ cấp tool xếp hàng yêu cầu thanh toán. |
| PC24 ~ OF-CCARP-01 | PC24 là góc prompt injection (cắt quyền hành động khi đọc nội dung không tin cậy), đáp án cho phép cả cổng duyệt người; OF-01 là quyền thừa thuần tuý. |
| PB20 ~ PB28 ~ PB22 | PB20 đã biết nút thắt (reranker) → chỉnh; PB28 chưa biết stage nào chậm → trace và lập ngân sách độ trễ; PB22 là trace để chẩn đoán câu sai, không phải độ trễ. |
| PB15 ~ PB18 | PB15 chọn hai cải tiến tổng quát (hybrid + rerank); PB18 là ca cụ thể mã lỗi chính xác → thêm BM25 / khớp chính xác. |
| PA38 ~ PC13 | PA38: không tìm được nguồn → cho phép nói "không biết"; PC13: nguồn có sẵn trong context → bật citations. Đáp án khác. |
| PA31 ~ PD18 | PA31 là prompt bị sao chép lệch giữa các nhóm → module dùng chung; PD18 hỏi nơi kiểm soát cấu hình production. |
| PA37 ~ AI-CCARP-009 | PA37 là migration sang model mới với prompt quá chi tiết; AI-009 so hai thái cực (quá cứng vs quá mơ hồ) để chọn "độ cao" phù hợp. |
| PA29 ~ AI-CCARP-010 ~ PA42 | Ba quyết định khác nhau về few-shot: thêm ví dụ (PA29), cắt gọn bộ ví dụ phình to (AI-010), giữ zero-shot khi đã đạt (PA42). |
| PD10 ~ PC20 | PD10 là kênh thu phản hồi người dùng; PC20 là cách duy trì bộ eval. |
| PA26 ~ PC12 | PA26 hỏi cách phòng (ghim model ID); PC12 hỏi phân loại nguyên nhân. |
| PA05 ~ PB24 | PA05 hỏi vị trí xử lý PII trong pipeline; PB24 hỏi thực hành với log đã chứa PII (che, giới hạn truy cập, thời hạn lưu). |
| AI-CCARP-040 ~ PD08 | AI-040 viết tiêu chí thành công ở discovery; PD08 định nghĩa SLA cho dịch vụ đang chạy. |
| PA03 ~ PD05 | PA03 là cách trình bày giá trị kinh doanh để duyệt dự án; PD05 là giải thích chọn model tầm trung cho ban điều hành. |
| PC06 ~ AI-CCARP-029 | PC06 phân biệt eval năng lực vs hồi quy; AI-029 xử lý bộ eval đã bão hoà. |

## Ghi chú

- Hai cặp ccx↔official đã bị retire ở lượt trước (PA32 ~ OF-CCARP-02, PB01 ~ OF-CCARP-01, xem `2026-11-18-gd0-canh-bao-trung.md`) không còn trong danh sách active nên không tính ở đây.
- Tỉ lệ trùng đo được trong CCAR-P (≈5,6% phần ccx) thấp hơn ước lượng 13% từ mẫu ngẫu nhiên toàn pack; các cặp trùng còn lại của pack nhiều khả năng nằm ở kỳ thi khác.
- Khi áp dụng: đặt `status: retired` cho 8 câu trong `RETIRE_IDS`, rồi chạy `npm run validate`.

KEEP_IDS: PC43,OF-CCARP-03,OF-CCARP-01,PA01,PB16,PB21,PB13,PA34
RETIRE_IDS: PC32,PC11,PC34,PD01,PC44,PC18,PA22,PB25
