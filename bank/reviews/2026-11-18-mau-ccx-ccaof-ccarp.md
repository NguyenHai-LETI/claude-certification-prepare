# Soát câu hỏi — mẫu ngẫu nhiên pack ccx (CCAO-F 15 câu, CCAR-P 5 câu) — 2026-11-18
Người soát: Claude Opus 5.5 (claude-opus-5-5) · Phạm vi: `bank/packs/ccx.yaml`, mẫu đo tỉ lệ lỗi: Q10, K109, K37, Y12, Q06, K124, Q04, K167, K17, T05, Y26, Q07, K66, T04, K10 (CCAO-F); PA18, PA11, PC26, PB27, PA21 (CCAR-P) · Số câu: 20

Ghi chú quy trình: soát song song nên **không sửa** `bank/packs/`; mọi sửa đổi ghi ở mục *Đề xuất sửa* để áp dụng sau. Chưa câu nào được đặt `reviewed:`. Không chạy validate.

## Tổng kết
| Kết luận | Số câu |
|---|---|
| PASS | 8 |
| FIX | 12 |
| RETIRE | 0 |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

- **Số câu đáp án sai (tiêu chí a): 0 / 20**
- **Số câu không có đúng một đáp án bảo vệ được (tiêu chí b): 0 / 20**

Nhận xét đo lường: đáp án của mẫu đều đúng; lỗi tập trung ở chất lượng phương án nhiễu (c, 8/20) và giải thích không nêu lý do sai của từng phương án nhiễu (e, 11/20). CCAR-P (5 câu) tốt hơn hẳn CCAO-F (15 câu): 4/5 PASS so với 4/15.

## Lỗi theo tiêu chí
| Tiêu chí | Số câu trượt | Câu |
|---|---|---|
| a. Đáp án đúng | 0 | |
| b. Đúng một đáp án | 0 | |
| c. Phương án nhiễu (hợp lý, không manh mối) | 8 | K109, K37, Q06, K124, K167, T04, Q07, PB27 |
| d. Stem | 0 | |
| e. Giải thích (đủ từng phương án nhiễu, nguồn) | 11 | K109, K37, Q06, K124, K167, K17, T04, Q07, K66, K10, PB27 |
| f. Gắn kỳ thi / domain / ref | 1 | Q04 |
| g. Gần trùng | 0 | (K10 trùng K162 ngoài phạm vi; K10 là câu cũ hơn, tốt hơn nên giữ K10, xem *Rủi ro còn lại*) |

## Chi tiết
| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đề xuất sửa gì | Nguồn |
|---|---|---|---|---|---|
| Q10 | CCAO-F D7 | PASS | — | Góp ý cụ thể vào đúng chỗ chưa đạt đúng tinh thần Discernment (đánh giá output rồi lặp lại); nhiễu hợp lý, giải thích đủ từng phương án. | https://www.anthropic.com/ai-fluency/overview ; https://academy.claude.com/courses/ai-fluency-framework-foundations |
| K109 | CCAO-F D4 | FIX | c, e | Ba nhiễu là "người rơm" (không đọc được hợp đồng; độ chính xác không quan trọng; luôn 100%), từ tuyệt đối chỉ ở nhiễu → viết lại 3 nhiễu thành lời hứa quá / quá thận trọng / tin trích dẫn; viết lại giải thích. | notes/exams/CCAO-F.md (D4, D2); https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| K37 | CCAO-F D6 | FIX | c, e | Nhiễu "vừa một slide" vô nghĩa → thay bằng mối lo khả thi khác (tính lặp lại của kết quả); giải thích thêm lý do từng nhiễu. | notes/exams/CCAO-F.md (D6); https://www.anthropic.com/legal/aup |
| Y12 | CCAO-F D3 | PASS | — | Đúng: tắt Memory ở menu "+" trước tin nhắn đầu, chat vẫn lưu, không dùng memory của cả người dùng lẫn Project; incognito chỉ mở ngoài Project và không lưu chat. | https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context |
| Q06 | CCAO-F D3 | FIX | c, e | Cả 3 nhiễu lộ (guarantees never, chia sẻ cho sếp, entire file server) → thay 2 nhiễu bằng hiểu lầm có thật (chỉ giữ trong một chat; owner đọc được memory, trong khi tài liệu nói owner không xem được); giải thích từng nhiễu. | https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context |
| K124 | CCAO-F D5 | FIX | c, e | Nhiễu "trong tên file", "comment trên tài liệu chia sẻ" không hợp lý → thay bằng Project knowledge và memory cá nhân (nhầm lẫn thật); giải thích từng nhiễu. | https://support.claude.com/en/articles/9517075-what-are-projects ; https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context |
| Q04 | CCAO-F D1 → D4 | FIX | f | Nội dung là phân chia việc giữa người và Claude, giữ quyết định nhân sự cho người, không phải kỹ thuật prompt (D1). Đổi sang D4 (task "quyết định bước nào giao cho Claude"); D6 cũng chấp nhận được. Giải thích viết rõ hơn. | notes/exams/CCAO-F.md (D1, D4, D6); https://www.anthropic.com/ai-fluency/overview |
| K167 | CCAO-F D7 | FIX | c, e | Nhiễu "repeat the same vague request" tự gắn nhãn xấu, "switch to a different AI tool" lộ → thay bằng bẫy thật của D7 (tạo lại nhiều lần; đổi model mà giữ prompt); cập nhật giải thích. | notes/exams/CCAO-F.md (D7); https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview |
| K17 | CCAO-F D4 | FIX | e | Đáp án đúng, nhiễu chấp nhận được; giải thích không nói vì sao từng nhiễu sai → viết lại. | notes/exams/CCAO-F.md (D4) |
| T05 | CCAO-F D3 | PASS | — | Chia giai đoạn kèm tóm tắt + đưa tài liệu ổn định vào Project khớp task D3 (tóm tắt, lưu lại); nhiễu "bỏ hết chỉ dẫn" hơi yếu nhưng chấp nhận được. | notes/exams/CCAO-F.md (D3); https://support.claude.com/en/articles/9517075-what-are-projects |
| Y26 | CCAO-F D5 | PASS | — | Skill nạp khi liên quan (progressive disclosure) và cần bật code execution: khớp help center; skill tự tạo được. | https://support.claude.com/en/articles/12512176-what-are-skills |
| Q07 | CCAO-F D3 | FIX | c, e | Nhiễu "A regular chat saved to memory" tự phủ định stem → thay bằng chat trong Project riêng; giải thích thêm lý do nhiễu đó sai. | https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context |
| K66 | CCAO-F D1 | FIX | e | Đáp án và nhiễu ổn; giải thích không nói vì sao "viết lại cho dễ đọc" và "có/không" sai → viết lại. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview |
| T04 | CCAO-F D2 | FIX | c, e | Đáp án đúng (lost in the middle có trong Exam Guide CCAR-F; context rot trong bài context engineering), nhưng 3 nhiễu vô lý với "always" → viết lại 3 nhiễu; giải thích nêu nguồn và từng nhiễu. | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents ; notes/exams/CCAR-F.md (dòng "Lost in the middle") |
| K10 | CCAO-F D2 | FIX | e | Đáp án đúng; giải thích một câu, không nói về từng nhiễu → viết lại. Gần trùng K162 (ngoài phạm vi): giữ K10. | notes/exams/CCAO-F.md (D2: structured data cho dữ liệu xử lý tiếp) |
| PA18 | CCAR-P D1 | PASS | — | Managed Agents: harness + sandbox do Anthropic vận hành, có "scheduled deployments" chạy theo cron; Batches không chạy vòng tool nhiều lượt. | https://platform.claude.com/docs/en/managed-agents/overview |
| PA11 | CCAR-P D1 | PASS | — | Đúng nguyên văn bài multi-agent research: "Simple fact-finding requires just 1 agent with 3-10 tool calls"; quy tắc scale effort nhúng vào prompt. | https://www.anthropic.com/engineering/multi-agent-research-system |
| PC26 | CCAR-P D5 | PASS | — | Định tuyến ca tin cậy thấp/mâu thuẫn cho người + lấy mẫu phân tầng phần tự duyệt để đo lỗi; khớp task statement 5.5 (stratified random sampling). | notes/exams/CCAR-F.md (5.5); notes/exams/CCAR-P.md (D5) |
| PB27 | CCAR-P D4 | FIX | c, e | Nhiễu "Raise the confidence threshold so that the agent escalates fewer conversations" sai logic nội tại (nâng ngưỡng tin cậy thường làm escalate **nhiều** hơn), gây mơ hồ → viết lại; giải thích thiếu lý do cho phương án "không làm gì". | notes/exams/CCAR-P.md (D4: giám sát bằng logging, observability) |
| PA21 | CCAR-P D1 | PASS | — | Kết quả có cấu trúc gọn + lưu trạng thái bền để resume; bài multi-agent nói restart từ đầu tốn kém, nên "resume from where the agent was". | https://www.anthropic.com/engineering/multi-agent-research-system |

## Cần người xem
Không có.

## Rủi ro còn lại
- **Mẫu lỗi lặp lại của người soạn (CCAO-F):** phương án nhiễu kiểu "người rơm", vô lý ngay khi đọc, hay mang từ tuyệt đối (always, never, guarantees, entire, 100%) chỉ ở nhiễu, hoặc tự gắn nhãn xấu ("vague request", "regular chat saved to memory"). Câu loại này đo được độ đọc hiểu chứ không đo phán đoán; ước tính khoảng một nửa câu CCAO-F trong pack có vấn đề này.
- **Giải thích quá ngắn:** nhiều câu chỉ có một câu nêu nguyên tắc ("Chọn định dạng theo cách dùng…"), không nói vì sao từng nhiễu sai, ít dẫn nguồn. Lỗi e chiếm 11/20.
- **Mapping domain:** câu về "delegation" (AI Fluency) bị gắn D1 Prompting; nên rà các câu cùng chủ đề delegation khác trong pack.
- **Gần trùng:** K10 và K162 (cùng quyết định "dữ liệu để dán vào bảng tính thì xin bảng/CSV", nhiễu cùng kiểu văn xuôi/slide). Đề nghị RETIRE K162 ở lượt sau, giữ K10. T04 và K38 cùng chủ đề "bỏ sót phần giữa" nhưng khác quyết định (vì sao cần cẩn thận vs cách sửa), chấp nhận được.
- **Dễ lỗi thời:** Y12, Q07, Q06 dựa vào giao diện memory/incognito hiện tại (menu "+", ghost icon chỉ ngoài Project); PA18 dựa vào Managed Agents đang beta (`managed-agents-2026-04-01`) và tính năng scheduled deployments. Đề CCAO-F và CCAR-P đổi nội dung từ 07/12/2026.
- **Nguồn D7/AI Fluency:** trang khoá học AI Fluency trên academy không định nghĩa chi tiết 4D; định nghĩa lấy từ trang anthropic.com/ai-fluency (qua kết quả tìm kiếm, không mở trực tiếp được toàn văn).

## Để lượt sau
- Áp dụng 12 đề xuất FIX bên dưới rồi đặt `reviewed: 2026-11-18`; đặt `reviewed: 2026-11-18` cho 8 câu PASS; chạy `node scripts/validate.ts`.
- RETIRE K162 (gần trùng K10).
- Mở rộng soát pack ccx theo mẫu lỗi c/e ở CCAO-F.

## Đề xuất sửa

Không câu nào đổi đáp án. Không đổi thứ tự / số phương án. Khối OLD chép nguyên văn từ `bank/packs/ccx.yaml` (thụt lề giữ nguyên).

### K109
OLD:
```yaml
      - It cannot read contracts at all, because legal language is too complex.
      - Accuracy does not really matter, since summaries are only for reference.
      - Usually helpful but not error-free, so we will test it on samples and keep review.
      - It is always 100% accurate on contracts, so no review step is needed once it has been set up.
    answer:
      - C
    explanation: "Truyền đạt giá trị và giới hạn trung thực: hữu ích nhưng có thể sai, nên thử nghiệm và giữ bước duyệt."
```
NEW:
```yaml
      - It is too unpredictable for contracts, so we should not use it for them at all.
      - It is highly accurate, so we only need to spot-check during the first week.
      - Usually helpful but not error-free, so we will test it on samples and keep review.
      - Its summaries cite clause numbers, so any cited point can be trusted without checking.
    answer:
      - C
    explanation: "Truyền đạt giá trị và giới hạn trung thực: Claude thường hữu ích nhưng có thể sai, nên thử trên mẫu hợp đồng thật và giữ bước duyệt. Từ chối dùng hẳn bỏ qua giá trị có thể kiểm chứng bằng thử nghiệm; chỉ kiểm tra trong tuần đầu là hứa quá, lỗi vẫn có thể xuất hiện về sau; số điều khoản được trích dẫn chính là loại chi tiết trông rất cụ thể dễ bị bịa, phải đối chiếu bản gốc."
```

### K37
OLD:
```yaml
      - Whether the engagement ratings fit on one slide for leadership.
      - The cost of the subscription needed to process that many messages.
    answer:
      - A
    explanation: "Nhận diện ca sử dụng không phù hợp: dữ liệu cá nhân, quyền riêng tư, quy định phải được xét trước tính khả thi kỹ thuật."
```
NEW:
```yaml
      - Whether the ratings would come out the same if the messages were analyzed twice.
      - The cost of the subscription needed to process that many messages.
    answer:
      - A
    explanation: "Nhận diện ca sử dụng không phù hợp: đọc tin nhắn riêng của nhân viên để chấm điểm đụng tới quyền riêng tư, luật lao động và chính sách nội bộ, nên phải xét có được phép hay không trước mọi câu hỏi kỹ thuật. Claude có hiểu tiếng lóng, emoji hay không, kết quả có lặp lại ổn định không, và chi phí gói dịch vụ đều là chuyện tính khả thi, chỉ đáng bàn sau khi ca sử dụng đã được phép."
```

### Q06
OLD:
```yaml
      - It guarantees that Claude never makes mistakes.
      - It shares your chats with your manager.
      - It carries useful preferences and context across chats, and you can view and edit it.
      - It automatically stores your company's entire shared file server so you can ask about it later.
    answer:
      - C
    explanation: Memory mang sở thích, bối cảnh hữu ích sang các cuộc chat; người dùng xem, sửa, xoá được. Nó không tự nạp kho tài liệu công ty.
```
NEW:
```yaml
      - It keeps your preferences only for the current chat and resets when you start a new one.
      - It lets your organization's owners read your memories to monitor how you use Claude.
      - It carries useful preferences and context across chats, and you can view and edit it.
      - It automatically stores your company's entire shared file server so you can ask about it later.
    answer:
      - C
    explanation: "Memory mang sở thích, bối cảnh hữu ích sang các cuộc chat khác; người dùng xem, sửa, xoá được từng mục trong Settings. Memory tồn tại xuyên các cuộc chat chứ không chỉ trong một chat rồi mất. Owner của tổ chức không xem hay sửa được memory cá nhân của người dùng. Memory cũng không tự nạp kho tài liệu công ty; tài liệu dùng chung thì đưa vào Project hoặc dùng connector."
```

### K124
OLD:
```yaml
    stem: Where should you put a rule that every answer in a team Project must end with a “Sources” section?
    options:
      - In the Project instructions.
      - In each team member's first message of every chat.
      - In a file name.
      - In a comment on a shared document.
    answer:
      - A
    explanation: Quy tắc áp dụng cho mọi cuộc chat trong Project đặt ở Project instructions để nhất quán.
```
NEW:
```yaml
    stem: Where should you put a rule that every answer in a team Project must end with a “Sources” section?
    options:
      - In the Project instructions.
      - In each team member's first message of every chat.
      - In a reference document uploaded to the Project knowledge.
      - In your own memory, so Claude applies it in every chat.
    answer:
      - A
    explanation: "Quy tắc áp dụng cho mọi câu trả lời trong Project đặt ở Project instructions để nhất quán. Nhắc trong tin nhắn đầu của từng người dễ bị quên và không đồng đều; Project knowledge dành cho tài liệu tham khảo, không phải quy tắc hành vi; memory là của riêng từng người dùng nên không áp dụng cho cả nhóm."
```

### Q04
OLD:
```yaml
  - id: Q04
    exams:
      CCAO-F: D1
```
NEW:
```yaml
  - id: Q04
    exams:
      CCAO-F: D4
```
OLD:
```yaml
    explanation: "Delegation tốt: giao phần soạn thảo, tổng hợp; giữ quyết định ảnh hưởng tới con người cho người có trách nhiệm."
```
NEW:
```yaml
    explanation: "Delegation tốt (AI Fluency): giao cho Claude phần soạn thảo, tổng hợp thành tích đã ghi nhận; quyết định ảnh hưởng tới con người giữ cho người có trách nhiệm. Chọn ai vào diện cải thiện hiệu suất, quyết định tăng giảm lương hay chấm điểm cuối cùng đều là quyết định nhân sự hệ trọng; muốn kết quả nhất quán không phải lý do để giao trách nhiệm đó cho AI."
```

### K167
OLD:
```yaml
    stem: Claude keeps ignoring your formatting instruction in a team Project. Which TWO steps help most?
    options:
      - Repeat the same vague request more times.
      - Make the format explicit, with an example output.
      - Put the rule in the Project instructions.
      - Switch to a different AI tool.
    answer:
      - B
      - C
    explanation: Chỉ dẫn cụ thể kèm ví dụ, đặt ở cấp Project để áp dụng mọi chat. Đổi công cụ hay lặp lại yêu cầu mơ hồ không giải quyết gốc.
```
NEW:
```yaml
    stem: Claude keeps ignoring your formatting instruction in a team Project. Which TWO steps help most?
    options:
      - Regenerate the response several times until the format comes out right.
      - Make the format explicit, with an example output.
      - Put the rule in the Project instructions.
      - Switch to a more capable model and keep the prompt as it is.
    answer:
      - B
      - C
    explanation: "Chỉ dẫn định dạng cụ thể kèm ví dụ output, đặt ở Project instructions để áp dụng cho mọi chat của nhóm. Bấm tạo lại nhiều lần hay đổi sang model mạnh hơn mà giữ nguyên prompt không sửa nguyên nhân gốc là chỉ dẫn mơ hồ, nên kết quả vẫn thất thường."
```

### K17
OLD:
```yaml
    explanation: Dùng Claude để phân tích yêu cầu, lập kế hoạch; con người vẫn xác nhận với các bên liên quan.
```
NEW:
```yaml
    explanation: "Dùng Claude phân tích yêu cầu: rút câu hỏi mở, giả định từ ghi chú và phác cấu trúc để nhóm xác nhận với các bên liên quan. Viết bản cuối rồi gửi thẳng cho mọi người là bỏ qua bước kiểm chứng; quyết định ngân sách hay chọn nhà cung cấp cần trách nhiệm và dữ liệu nội bộ, Claude chỉ nên hỗ trợ phân tích chứ không quyết thay."
```

### Q07
OLD:
```yaml
      - A regular chat saved to memory
      - An artifact published to colleagues
      - An incognito chat
    answer:
      - D
    explanation: Incognito chat không lưu vào lịch sử và không dùng cho memory (vẫn theo chính sách dữ liệu của tổ chức). Project chia sẻ hay artifact công khai làm lộ thông tin.
```
NEW:
```yaml
      - A new chat in a private Project that only you can access
      - An artifact published to colleagues
      - An incognito chat
    answer:
      - D
    explanation: "Incognito chat không lưu vào lịch sử chat và không đọc, không ghi memory (ở Team, Enterprise vẫn được giữ theo chính sách lưu trữ của tổ chức, tối thiểu 30 ngày vì lý do an toàn). Chat trong Project riêng vẫn lưu vào lịch sử và có thể ghi vào memory của Project; Project chia sẻ với nhóm hay artifact công bố cho đồng nghiệp còn làm lộ nội dung cho người khác."
```

### K66
OLD:
```yaml
    explanation: Nêu vị thế (bên mua), mục tiêu (rủi ro chi phí, điều khoản chấm dứt) và cách trình bày (xếp theo rủi ro). Câu hỏi chung chung cho câu trả lời chung chung.
```
NEW:
```yaml
    explanation: "Prompt tốt nêu vị thế (bên mua), mục tiêu (điều khoản làm tăng chi phí hoặc hạn chế quyền chấm dứt) và cách trình bày (xếp theo rủi ro). Viết lại cho dễ đọc là việc khác, không phải rà soát rủi ro; yêu cầu nêu mọi thứ không có tiêu chí nên câu trả lời dàn trải; câu hỏi có hoặc không bỏ mất lý do và các điều khoản cần thương lượng."
```

### T04
OLD:
```yaml
      - Summaries of long documents are always shorter than one sentence.
      - Details, especially in the middle, can be missed or merged, so check key sections.
      - Claude refuses to read any document that is longer than about ten pages, so it skips the rest.
      - Long documents always produce summaries in another language.
    answer:
      - B
    explanation: Tài liệu dài dễ bị bỏ sót hoặc gộp chi tiết (nhất là phần giữa); kiểm tra các phần quan trọng hoặc tóm tắt theo phần.
```
NEW:
```yaml
      - A well-structured, confident summary shows that nothing important was left out.
      - Details, especially in the middle, can be missed or merged, so check key sections.
      - Claude accepts only about ten pages per document, so longer files are cut off.
      - Long documents make Claude switch to a smaller model, which lowers quality.
    answer:
      - B
    explanation: "Tài liệu dài dễ bị bỏ sót hoặc gộp chi tiết, nhất là phần giữa (hiệu ứng lost in the middle nêu trong Exam Guide CCAR-F; Anthropic cũng mô tả context rot, context càng dài thì khả năng nhớ chính xác càng giảm); hãy kiểm tra các phần quan trọng hoặc tóm tắt theo phần. Bản tóm tắt gọn gàng, giọng tự tin không chứng minh là đầy đủ. Claude không giới hạn khoảng mười trang mỗi tài liệu, và tài liệu dài không làm Claude tự đổi sang model nhỏ hơn."
```

### K10
OLD:
```yaml
    explanation: "Chọn định dạng theo cách dùng: dữ liệu để xử lý tiếp thì yêu cầu bảng có cột xác định."
    ref: lessons/09-ccao-f.html#danh-gia
  - id: K11
```
NEW:
```yaml
    explanation: "Chọn định dạng theo cách dùng: dữ liệu để dán vào bảng tính rồi sắp xếp thì yêu cầu bảng hoặc CSV có cột xác định. Văn xuôi so sánh dài buộc phải chép tay từng số; slide mỗi nhà cung cấp một trang không sắp xếp được; một khuyến nghị duy nhất bỏ mất dữ liệu gốc cần để tự so sánh và kiểm chứng."
    ref: lessons/09-ccao-f.html#danh-gia
  - id: K11
```

### PB27
OLD:
```yaml
      - Raise the confidence threshold so that the agent escalates fewer conversations
    answer:
      - B
    explanation: Tỷ lệ escalation là tín hiệu chất lượng; cần cảnh báo theo xu hướng rồi đọc mẫu transcript để tìm nguyên nhân (dữ liệu mới, prompt, model). Khởi động lại không chạm nguyên nhân; hạ escalation bằng ngưỡng là che triệu chứng và tăng rủi ro.
```
NEW:
```yaml
      - Loosen the escalation rule so that the agent escalates fewer conversations
    answer:
      - B
    explanation: "Tỷ lệ escalation là tín hiệu chất lượng; cần cảnh báo theo xu hướng rồi đọc mẫu transcript để tìm nguyên nhân (dữ liệu mới, prompt, model). Coi đây chỉ là chỉ số kinh doanh là bỏ sót, vì lỗi chất lượng thường không hiện qua lỗi hệ thống hay độ trễ. Khởi động lại không chạm nguyên nhân; nới quy tắc escalation để giảm số ca là che triệu chứng và tăng rủi ro."
```
