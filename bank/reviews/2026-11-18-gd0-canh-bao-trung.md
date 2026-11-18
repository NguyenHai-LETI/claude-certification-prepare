# Soát câu hỏi — cảnh báo validate + cặp stem gần trùng — 2026-11-18
Người soát: claude-opus-5-5 (người soát độc lập) · Phạm vi: 10 câu bị `npm run validate` cảnh báo (giải thích < 60 ký tự: ccx G03, G17, K142, K149, K153, K158; đáp án dài hơn hẳn phương án nhiễu: ccx G10, E57, official OF-CCDVF-02, OF-CCARP-03) + 7 cặp stem gần trùng (ccx B08↔W09, D23↔W05, E17↔E65, T06↔T13, K133↔K166, PA32↔OF-CCARP-02, PB01↔OF-CCARP-01) · Số câu: 24

> Lượt này **không sửa file pack** (nhiều agent soát song song). Mọi thay đổi nằm ở mục *Đề xuất sửa* dưới dạng cặp OLD/NEW để áp dụng bằng Edit thay chuỗi chính xác. Người áp dụng tự thêm `reviewed: 2026-11-18` cho mọi câu PASS/FIX/RETIRE và `status: retired` cho câu RETIRE.
> Đã kiểm tra trên bản sao tạm: mỗi khối OLD xuất hiện đúng 1 lần trong file đích; sau khi thay cả 14 khối, hai file vẫn parse được bằng `yaml`; mọi giải thích ≥ 60 ký tự; tỉ lệ độ dài đáp án/nhiễu ở các câu ccx đều ≤ 1,4. Lưu ý: `ccx.yaml` và `official.yaml` dùng xuống dòng CRLF, còn khối OLD/NEW viết bằng LF. Công cụ Edit tự xử lý được; nếu áp dụng bằng script thì cần chuẩn hoá xuống dòng trước.

## Tổng kết
| Kết luận | Số câu |
|---|---|
| PASS | 3 (W09, W05, T13) |
| FIX | 14 (G03, G17, K142, K149, K153, K158, G10, E57, E65, K133, OF-CCDVF-02, OF-CCARP-01, OF-CCARP-02, OF-CCARP-03) |
| RETIRE | 7 (B08, D23, E17, T06, K166, PA32, PB01) |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

## Lỗi theo tiêu chí
| Tiêu chí | Số câu trượt |
|---|---|
| a. Đáp án đúng | 0 |
| b. Đúng một đáp án | 0 (K166 có rủi ro b nhưng đã RETIRE vì g) |
| c. Phương án nhiễu / manh mối | 3 (G10, E57, K153) |
| d. Stem | 0 |
| e. Giải thích | 14 (G03, G17, K142, K149, K153, K158, G10, E57, E65, K133, OF-CCDVF-02, OF-CCARP-01, OF-CCARP-02, OF-CCARP-03) |
| f. Gắn kỳ thi/domain | 1 (E17, đã RETIRE) |
| g. Gần trùng | 7 (B08, D23, E17, T06, K166, PA32, PB01) |

## Chi tiết
| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đã sửa gì | Nguồn |
|---|---|---|---|---|---|
| G03 (ccx) | CCAR-F D5 · S1 | FIX | e | Đáp án đúng: khách đòi gặp người thì escalate ngay, không điều tra trước. Giải thích cũ chỉ 1 câu; viết lại, nêu ba trigger escalate và vì sao từng phương án nhiễu sai. | notes/exams/CCAR-F.md §5.2 (Exam Guide CCAR-F v1.0, Domain 5) |
| G17 (ccx) | CCDV-F D4 | FIX | e | Đọc trace từng bước để tìm bước hỏng đầu tiên là đúng. Viết lại giải thích, nêu vì sao tự sửa / đổi model / tăng `max_tokens` sai. | notes/exams/CCDV-F.md D4 (trace analysis); https://www.anthropic.com/engineering/building-effective-agents |
| K142 (ccx) | CCAO-F D6 | FIX | e | Báo qua kênh chính sách AI/bảo mật quy định là đúng. Viết lại giải thích đủ từng phương án nhiễu. | notes/exams/CCAO-F.md D6 (Exam Guide: tuân theo chính sách AI và governance của tổ chức) |
| K149 (ccx) | CCAO-F D7 | FIX | e | Chỉ rõ thứ tự cột kèm bảng mẫu là đúng (ví dụ là cách đáng tin cậy để giữ định dạng nhất quán). Viết lại giải thích. | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| K153 (ccx) | CCAO-F D7 | FIX | c, e | Đáp án đúng (quyền connector + từ khoá tìm). Ba phương án nhiễu vô lý quá lộ (font serif, “Claude ghét người gửi”, độ phân giải màn hình) → viết lại thành ba ngộ nhận hợp lý nhưng sai (training cutoff, extended thinking, Project knowledge); giữ thứ tự, đáp án C. Viết lại giải thích. | https://support.claude.com/en/articles/10166901-use-google-workspace-connectors |
| K158 (ccx) | CCAO-F D7 | FIX | e | Tóm tắt rồi mở chat mới là đúng (context dài làm giảm khả năng nhớ chính xác; chat dài tốn usage hơn). Viết lại giải thích. | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents; https://support.claude.com/en/articles/9797557-usage-limit-best-practices |
| G10 (ccx) | CCAR-F D5 · S4 | FIX | c, e | Khoá A+B (scratchpad + subagent) đúng. Phương án B dài gấp ~2,8 lần nhiễu dài nhất → rút gọn B, viết lại C và D cho cân độ dài (giữ ý sai: `max_tokens`, dặn “nhớ hết”). Giải thích bổ sung vì sao C, D sai. Gần trùng Z13 (ngoài phạm vi, xem *Rủi ro còn lại*). | notes/exams/CCAR-F.md §5.4; https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| E57 (ccx) | CCAR-F D3 · S5 | FIX | c, e | Khoá A+B (`-p`, `--output-format json`) đúng. Nhiễu `--verbose`, `--continue` ngắn trơ trọi so với đáp án có chú thích → thêm chú thích ngắn cho C, D. Giải thích bổ sung vì sao C, D sai. | https://code.claude.com/docs/en/headless |
| OF-CCDVF-02 (official) | CCDV-F D7 | FIX | e | Stem/phương án/đáp án là văn bản gốc Exam Guide → giữ nguyên; cảnh báo độ dài đáp án **được chấp nhận** vì là văn bản gốc. Giải thích gọi phương án bằng chữ cái (app xáo phương án) → đổi sang gọi theo nội dung; câu “model nghe lời hơn còn dễ bị injection hơn” là suy đoán không nguồn → sửa thành “đổi model không phải biện pháp kiểm soát”. | https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls (cảnh báo indirect prompt injection) |
| OF-CCARP-03 (official) | CCAR-P D4 | FIX | e | Văn bản gốc, giữ nguyên; cảnh báo độ dài **được chấp nhận**. Nội dung giải thích đúng; chỉ đổi cách gọi phương án từ chữ cái sang nội dung. | notes/exams/CCAR-P.md D4 (Exam Guide CCAR-P v1.0, Sample Questions) |
| B08 (ccx) | CCDV-F D5 | RETIRE | g | Trùng W09: cùng quyết định (prefix tĩnh tools/system + câu hỏi đổi → breakpoint sau phần tĩnh), cùng đáp án, cùng góc. Giữ W09 vì giải thích nêu lý do từng phương án nhiễu; B08 không nêu. | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| W09 (ccx) | CCDV-F D5 | PASS | — | Prefix theo thứ tự `tools` → `system` → `messages`; breakpoint đặt trên khối cuối còn cố định; đổi thứ tự tool / timestamp làm mất cache. | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| D23 (ccx) | CCDV-F D2 | RETIRE | g | Trùng W05 (ba `tool_use` → mọi `tool_result` trong một user message). Giữ W05: phương án nhiễu cân hơn (D23 có đáp án dài nhất, nhiễu “plain text in the system prompt” quá lộ), gắn D8 Tools and MCPs hợp hơn. | https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use |
| W05 (ccx) | CCDV-F D8 | PASS | — | Docs: “Wrong: a separate user message for each tool result · Correct: all tool results together in a single user message”, tách message “teaches” Claude tránh gọi song song. | https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use; https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls |
| E17 (ccx) | CCDV-F D2 | RETIRE | f, g | Trùng E65 (deny ở `.claude/settings.json` vs allow ở `settings.local.json` → deny thắng). Giữ E65 (gắn đúng D3 Claude Code, có nhiễu “allow cụ thể hơn”); E17 gắn D2 sai domain, giải thích 1 câu. | https://code.claude.com/docs/en/permissions |
| E65 (ccx) | CCDV-F D3 | FIX | e | Đáp án C đúng: “If a tool is denied at any level, no other level can allow it”; “rule specificity doesn't change the order”. Giải thích cũ chưa nói vì sao nhiễu “fall back to ask” và “allow cụ thể hơn” sai → bổ sung. | https://code.claude.com/docs/en/permissions; https://code.claude.com/docs/en/settings |
| T06 (ccx) | CCAO-F D4 | RETIRE | g | Trùng T13 (ai duyệt output + ai chịu trách nhiệm quyết định cuối). T06 gộp hai ý vào một đáp án, nhiễu A bị kéo dài giả tạo, giải thích không nói vì sao nhiễu sai. Giữ T13. | notes/exams/CCAO-F.md D4; https://academy.claude.com/courses/building-effective-human-agent-teams |
| T13 (ccx) | CCAO-F D4 | PASS | — | Hai khoá (người duyệt, người chịu trách nhiệm) khớp D4 “bước nào giữ cho người: phán đoán, phê duyệt, trách nhiệm”; giải thích nêu vì sao giấu AI / đổ lỗi sai. Nhiễu thuộc loại bẫy đạo đức, chấp nhận được. | notes/exams/CCAO-F.md D4; https://academy.claude.com/courses/building-effective-human-agent-teams |
| K133 (ccx) | CCAO-F D6 | FIX | e | Đáp án C đúng: Usage Policy xếp Insurance (“determining the outcome of a claim”) vào High-risk, phải có người đủ chuyên môn duyệt thực chất. Giải thích cũ không nói vì sao từng phương án khác ổn → viết lại, có nguồn. | https://www.anthropic.com/legal/aup |
| K166 (ccx) | CCAO-F D6 | RETIRE | g (b) | Trùng K133 (quyết định hệ trọng tự động không người duyệt). Ngoài ra phương án “Automatically approving loan applications” khó bảo vệ tuyệt đối: AUP miễn human review cho quyết định “wholly favorable” với cá nhân. Giữ K133 (bồi thường bảo hiểm gồm cả từ chối, rõ ràng hơn). | https://www.anthropic.com/legal/aup |
| PA32 (ccx) | CCAR-P D2 | RETIRE | g | Diễn đạt lại gần nguyên văn câu mẫu chính thức OF-CCARP-02 (cùng bốn phương án, cùng đáp án). Theo quy tắc cặp ccx↔official, giữ câu official. | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| OF-CCARP-02 (official) | CCAR-P D2 | FIX | e | Văn bản gốc, giữ nguyên. Nội dung giải thích đúng (prefix caching giảm TTFT và giá đọc cache ~0,1× input); đổi cách gọi phương án từ chữ cái sang nội dung, bổ sung thứ tự prefix. | https://platform.claude.com/docs/en/build-with-claude/prompt-caching |
| PB01 (ccx) | CCAR-P D3 | RETIRE | g | Diễn đạt lại gần nguyên văn câu mẫu OF-CCARP-01 (least privilege: gỡ tool refund/delete). Giữ câu official. | notes/exams/CCAR-P.md D3 (Exam Guide CCAR-P v1.0, Sample Questions) |
| OF-CCARP-01 (official) | CCAR-P D3 | FIX | e | Văn bản gốc, giữ nguyên. Nội dung giải thích đúng; chỉ đổi cách gọi phương án từ chữ cái sang nội dung. | notes/exams/CCAR-P.md D3 (Exam Guide CCAR-P v1.0, Sample Questions) |

## Cần người xem
Không có.

## Rủi ro còn lại
- **Giải thích của toàn bộ `official.yaml` gọi phương án bằng chữ cái** (“**B đúng.**”, “**A sai:**”), trong khi app xáo phương án (`practice.shuffle_options: true`, `server/lib/tests.ts`) và chỉ đổi chữ cái của đáp án qua `displayLetters`, không đổi chữ trong giải thích. Lượt này chỉ sửa 4 câu trong phạm vi (OF-CCDVF-02, OF-CCARP-01/02/03). 17 câu official còn lại (OF-CCARF-01…12, OF-CCDVF-01/03, OF-CCAOF-01…03) cần sửa giống vậy ở lượt sau.
- **G10 gần trùng Z13** (ccx, CCAR-F D5 · S4, ngoài phạm vi): cùng triệu chứng “typical patterns”, cùng cách chữa scratchpad + subagent; Z13 gộp hai ý vào một đáp án. Đề nghị khi soát Z13 thì RETIRE Z13 (giữ G10 dạng chọn hai sau khi sửa), hoặc viết lại Z13 sang góc khác (vd. manifest / crash recovery).
- Các cặp gần trùng nhưng **không** coi là trùng: K142 ↔ K55 (tự mình làm lộ dữ liệu vs thấy nhóm khác dùng tool chưa duyệt); K158 ↔ K163 (chữa triệu chứng chat dài vs nhận diện tình huống nên mở chat mới). Nên để ý khi sinh thêm câu CCAO-F D6/D7.
- **Mẫu lỗi của bộ ccx**: giải thích kiểu một câu tóm tắt, không nêu vì sao từng phương án nhiễu sai (gặp ở 8/10 câu ccx bị FIX). Bộ K (CCAO-F) có nhiều phương án nhiễu vô lý (K142 “Post about it on social media”, K149 “Switch models daily”), làm câu quá dễ. K142 lượt này chỉ sửa giải thích; nên soát phương án nhiễu của cả cụm K1xx.
- Câu dễ lỗi thời: E57 (cờ CLI; tài liệu ghi `--bare` “will become the default for `-p` in a future release”); W09 / OF-CCARP-02 (hệ số giá cache, ngưỡng tối thiểu theo model thay đổi theo đời model). Giải thích đề xuất tránh ghi con số cụ thể ngoài hệ số mặc định 0,1×.
- K153: thay 3/4 phương án nhiễu là sửa lớn hơn mức “một phương án”. Cấu trúc (số phương án, thứ tự, đáp án C) giữ nguyên nên kết quả cũ vẫn khớp chữ cái. Nếu người áp dụng thấy quá tay, có thể chỉ áp phần giải thích rồi sinh câu thay thế bằng `/cert-generate`.

## Để lượt sau
- 17 câu official còn lại: đổi cách gọi phương án trong giải thích (xem *Rủi ro còn lại*).
- Soát Z13 (gần trùng G10).

## Đề xuất sửa

### G03 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: Khách yêu cầu gặp người thì chuyển ngay.
```
**NEW**
```yaml
    explanation: "Khách nói rõ muốn gặp người thật thì agent phải chuyển (escalate) ngay, không điều tra hay cố tự giải quyết trước, kể cả khi vấn đề trông dễ. Đây là một trong ba trigger escalate của Exam Guide: khách yêu cầu gặp người, ngoại lệ hoặc khoảng trống chính sách, và không thể tiến triển. Giải quyết trước rồi mới đề nghị chuyển người là phớt lờ yêu cầu rõ ràng của khách. Giải thích rằng agent tự lo được rồi làm tiếp cũng là gạt yêu cầu đó đi. Hỏi vì sao khách muốn gặp người chỉ trì hoãn việc chuyển, khách không cần biện minh. (Khác ca khách chỉ bực bội mà chưa đòi người: khi đó ghi nhận cảm xúc và đề nghị giải quyết, chỉ escalate nếu khách nhắc lại.)"
```

### G17 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: Đọc trace từng bước để biết lỗi bắt đầu ở đâu; đừng sửa mò.
```
**NEW**
```yaml
    explanation: "Lỗi của agent thường bắt đầu ở một bước giữa chừng (request sai, tool trả lỗi hoặc dữ liệu sai, model hiểu nhầm kết quả tool) rồi lan sang các bước sau. Đọc trace từng bước (request, tool call, tool result) giúp tìm bước hỏng đầu tiên, cô lập lỗi ở tầng tích hợp hay ở prompt/context, rồi sửa đúng chỗ. Bảo Claude “tự tìm và sửa lỗi” trong một prompt mới, không có trace, chỉ là đoán. Đổi model liên tục là sửa mò, có thể che lỗi mà vẫn không biết nguyên nhân. Tăng `max_tokens` chỉ nới giới hạn độ dài output, không sửa được lỗi logic hay dữ liệu sai ở bước trước."
```

### K142 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: "Tuân thủ quản trị: báo qua kênh quy định để xử lý đúng."
```
**NEW**
```yaml
    explanation: "Theo D6 (tuân theo chính sách AI và chuẩn governance của tổ chức), khi thấy dữ liệu khách hàng bị đưa vào một công cụ AI chưa được phê duyệt, cách đúng là báo qua kênh mà chính sách AI hoặc bảo mật quy định, để bộ phận có thẩm quyền đánh giá rủi ro lộ dữ liệu và xử lý. Tự dùng luôn công cụ đó là lặp lại chính vi phạm. Làm ngơ vì “không phải nhóm mình” để rủi ro với dữ liệu khách tiếp diễn; tuân thủ governance là trách nhiệm của mọi người. Đăng lên mạng xã hội không giải quyết gì, còn có thể làm lộ thêm thông tin nội bộ và khách hàng."
```

### K149 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: "Định dạng không ổn định: chỉ rõ cấu trúc, kèm ví dụ."
```
**NEW**
```yaml
    explanation: "Thứ tự cột thay đổi vì chỉ dẫn chưa nói rõ cấu trúc. Cách sửa hiệu quả là ghi chính xác thứ tự cột, tốt nhất kèm một bảng mẫu: tài liệu Anthropic nói ví dụ là một trong những cách đáng tin cậy nhất để định hướng định dạng và cấu trúc output, giúp kết quả nhất quán hơn. Đổi model mỗi ngày không sửa được chỉ dẫn mơ hồ. Chỉ bảo Claude “nhất quán” mà không nói nhất quán theo cấu trúc nào thì vẫn mơ hồ. Chấp nhận rồi tự sắp lại cột mỗi lần là bỏ qua nguyên nhân gốc và tốn công lặp lại; nên đưa chỉ dẫn vào Project instructions hoặc template để dùng lại."
```

### K153 (bank/packs/ccx.yaml)
Viết lại ba phương án nhiễu (giữ thứ tự, đáp án vẫn C) + giải thích.

**OLD**
```yaml
      - Whether the email was written in a serif font that Claude cannot parse.
      - Whether Claude dislikes the sender.
      - Whether the connector has the needed permissions and your search terms match the email.
      - Whether your screen resolution is too low for Claude to read the inbox.
    answer:
      - C
    explanation: "Sự cố connector: kiểm tra quyền và cách tìm kiếm."
```
**NEW**
```yaml
      - Whether the email arrived after Claude’s training cutoff date.
      - Whether extended thinking is turned on for this chat.
      - Whether the connector has the needed permissions and your search terms match the email.
      - Whether the email is stored in a Project’s knowledge base.
    answer:
      - C
    explanation: "Gmail connector đọc hộp thư trực tiếp qua tài khoản Google bạn đã kết nối và chỉ thấy những gì tài khoản đó được phép truy cập; trên gói Team/Enterprise, Owner còn phải bật connector trước. Claude tìm thư bằng truy vấn, và một số bộ lọc Gmail nâng cao có thể không được hỗ trợ. Vì vậy cần kiểm tra quyền và kết nối của connector, rồi chỉnh từ khoá tìm (người gửi, tiêu đề, khoảng thời gian) cho khớp thư. Ngày training cutoff của model không liên quan, vì connector đọc dữ liệu sống. Bật hay tắt extended thinking chỉ đổi cách Claude suy luận, không đổi quyền truy cập hộp thư. Thư không cần nằm trong knowledge của Project, vì connector truy vấn Gmail trực tiếp."
```

### K158 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: "Chat dài làm giảm tập trung: tóm tắt rồi mở chat mới."
```
**NEW**
```yaml
    explanation: "Chat càng dài thì context càng đầy. Anthropic mô tả hiện tượng context rot: số token trong context tăng thì khả năng nhớ chính xác thông tin của model giảm; độ dài hội thoại cũng làm tốn usage hơn. Cách thực tế là tóm tắt các điểm đã chốt rồi mở chat mới với bản tóm tắt đó, để context gọn mà không mất quyết định quan trọng. Tiếp tục thêm tin nhắn vào cùng chat chỉ làm context dài thêm, càng tệ. Đổi trình duyệt rồi mở lại đúng chat đó vẫn là cùng một hội thoại dài. Bảo Claude “cố gắng hơn” không làm context ngắn lại."
```

### G10 (bank/packs/ccx.yaml)
Rút gọn đáp án B, viết lại nhiễu C, D cho cân độ dài (giữ thứ tự, đáp án vẫn A+B) + giải thích. Độ dài sau sửa: đáp án dài nhất 83 ký tự, nhiễu dài nhất 70 ký tự (tỉ lệ 1,19).

**OLD**
```yaml
      - Delegate focused questions (e.g. “trace the refund flow”) to subagents, while the main agent keeps the big picture.
      - Raise `max_tokens`.
      - Tell the agent to “remember everything”.
    answer:
      - A
      - B
    explanation: Phiên dài bị suy giảm context. Scratchpad file và subagent cho câu hỏi cụ thể giữ thông tin chính xác; `/compact` cũng giúp khi context đầy output dò tìm.
```
**NEW**
```yaml
      - Delegate focused questions to subagents while the main agent keeps the big picture.
      - Raise `max_tokens` so the agent can write longer, more detailed answers.
      - Add “remember every class you have found” to the agent’s instructions.
    answer:
      - A
      - B
    explanation: "Phiên khám phá dài làm context đầy và suy giảm, nên agent bắt đầu nói chung chung (“typical patterns”) thay vì nhắc class cụ thể đã tìm thấy. Ghi phát hiện chính vào scratchpad file rồi đọc lại khi cần giúp giữ thông tin chính xác ngoài context window (structured note-taking). Giao câu hỏi hẹp (vd. lần theo luồng refund) cho subagent chạy với context sạch và chỉ trả về bản tóm tắt, còn agent chính giữ bức tranh tổng. Tăng `max_tokens` chỉ nới độ dài output mỗi lượt, không giảm lượng context đã tích tụ. Dặn agent “nhớ hết mọi class” không làm nó nhớ tốt hơn, vì vấn đề nằm ở context quá tải chứ không ở chỉ dẫn. `/compact` cũng giúp khi context đầy output dò tìm."
```

### E57 (bank/packs/ccx.yaml)
Thêm chú thích ngắn cho hai nhiễu để hết manh mối độ dài (giữ thứ tự, đáp án vẫn A+B) + giải thích.

**OLD**
```yaml
      - "`--verbose`"
      - "`--continue`"
    answer:
      - A
      - B
    explanation: "`-p` chạy không tương tác (không treo chờ nhập); `--output-format json` (kèm `--json-schema`) cho kết quả có cấu trúc để script đọc."
```
**NEW**
```yaml
      - "`--verbose` (full logs)"
      - "`--continue` (last session)"
    answer:
      - A
      - B
    explanation: "`-p` (`--print`) chạy Claude Code không tương tác: in kết quả ra stdout rồi thoát, không treo chờ nhập. `--output-format json` trả JSON có `result`, session ID và metadata để script đọc; thêm `--json-schema` khi cần output theo schema (nằm trong trường `structured_output`). `--verbose` chỉ hiện chi tiết từng lượt cho người đọc log (thường đi kèm `stream-json`), không làm kết quả máy đọc được. `--continue` nối tiếp hội thoại gần nhất, dùng cho lượt hỏi tiếp, không phải điều kiện để chạy tự động hay parse kết quả."
```

### E65 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: Quyền được xét theo thứ tự deny, ask, allow; deny ở bất kỳ cấp nào thắng allow ở cấp khác. Thứ tự ưu tiên giữa các file áp cho khoá đơn, không cho phép allow khoét ngoại lệ trong deny.
```
**NEW**
```yaml
    explanation: "Luật quyền được xét theo thứ tự deny → ask → allow, luật khớp đầu tiên quyết định, và độ cụ thể của luật không đổi thứ tự này. Tài liệu Claude Code ghi rõ: tool bị deny ở bất kỳ cấp nào thì không cấp nào khác allow lại được, nên lệnh push bị chặn. “Local ưu tiên hơn project” chỉ đúng với khoá giá trị đơn (vd. `model`); danh sách luật như `permissions.allow` được gộp giữa các file chứ không ghi đè deny. Luật allow “cụ thể hơn” không thắng deny (ở đây hai luật còn giống hệt nhau). Allow và deny cùng khớp cũng không chuyển sang hỏi người dùng: deny được xét trước nên chặn luôn."
```

### K133 (bank/packs/ccx.yaml)
**OLD**
```yaml
    explanation: Quyết định có hệ quả lớn với con người cần người duyệt; tự động hoàn toàn là không phù hợp.
```
**NEW**
```yaml
    explanation: "Usage Policy của Anthropic xếp bảo hiểm vào nhóm High-risk: quyết định kết quả một yêu cầu bồi thường cần người có chuyên môn xem xét thực chất trước khi áp dụng, và người bị ảnh hưởng phải được cho biết có dùng AI. Tự động quyết định claim mà không có người duyệt là không phù hợp. Tóm tắt báo cáo ngành công khai và nghĩ tên cho sự kiện nhóm là việc rủi ro thấp, không đụng dữ liệu nhạy cảm hay quyết định hệ trọng. Soạn bản nháp kế hoạch đào tạo để quản lý duyệt lại thì đã có người kiểm soát đầu ra."
```

### OF-CCDVF-02 (bank/packs/official.yaml)
Chỉ sửa giải thích (stem/phương án/đáp án là văn bản gốc Exam Guide, giữ nguyên).

**OLD**
```yaml
      **B đúng.** Đây là prompt injection gián tiếp. Cách xử lý: coi nội dung trang là **dữ liệu không tin cậy**, tách khỏi chỉ dẫn tin cậy, và dùng guardrail/hook theo least privilege để chữ bị chèn không thể kích hoạt tool hay hành động nhạy cảm.
      - **A sai:** temperature không liên quan tới injection; làm hành vi khó đoán hơn không phải biện pháp an ninh.
      - **C sai:** lời nhờ người dùng đừng chèn lệnh độc không phải kiểm soát thực thi được (kẻ tấn công không tuân theo).
      - **D sai:** model nghe lời hơn có thể còn **dễ** làm theo lệnh bị chèn hơn, không phải ít hơn.
```
**NEW**
```yaml
      **Đúng: coi nội dung trang là dữ liệu không tin cậy, tách khỏi chỉ dẫn tin cậy, dùng guardrail/hook.** Đây là prompt injection gián tiếp: lệnh ẩn nằm trong nội dung do người ngoài kiểm soát. Cách xử lý là coi nội dung trang là **dữ liệu không tin cậy**, giữ nó tách khỏi chỉ dẫn tin cậy (vd. trả về trong `tool_result` hoặc khối dữ liệu riêng, không nhét vào system prompt), và dùng guardrail/hook theo least privilege để chữ bị chèn không thể kích hoạt tool hay hành động nhạy cảm.
      - **Tăng temperature:** không liên quan tới injection; làm hành vi khó đoán hơn không phải biện pháp an ninh.
      - **Thêm dòng nhờ người dùng đừng chèn lệnh độc:** không phải kiểm soát thực thi được, kẻ tấn công không tuân theo.
      - **Đổi sang model lớn hơn, nghe lời hơn:** model nào cũng có thể bị lệnh chèn đánh lừa; đổi model không tách dữ liệu khỏi chỉ dẫn và không chặn được hành động nhạy cảm.
```

### OF-CCARP-01 (bank/packs/official.yaml)
Chỉ sửa giải thích.

**OLD**
```yaml
      **B đúng.** Least privilege = gỡ hẳn năng lực vai trò không cần. Nhân viên chỉ đọc ticket và soạn trả lời → bỏ tool refund và delete khỏi cấu hình agent, **xoá luôn bề mặt tấn công** thay vì canh chừng nó (đây cũng là ca "capability bloat" của D3).
      - **A sai:** logging là kiểm soát phát hiện sau sự việc, không gỡ quyền thừa.
      - **C sai:** hộp xác nhận là kiểm soát bù trừ; quyền nguy hiểm vẫn còn đó.
      - **D sai:** kích cỡ model không liên quan tới phạm vi quyền.
```
**NEW**
```yaml
      **Đúng: gỡ hẳn tool refund và delete khỏi cấu hình agent.** Least privilege = gỡ hẳn năng lực vai trò không cần. Nhân viên chỉ đọc ticket và soạn trả lời → bỏ hai tool này để **xoá luôn bề mặt tấn công** thay vì canh chừng nó (đây cũng là ca "capability bloat" của D3).
      - **Thêm logging cho tool refund/delete:** là kiểm soát phát hiện sau sự việc, không gỡ quyền thừa.
      - **Giữ mọi tool nhưng thêm bước xác nhận:** là kiểm soát bù trừ; quyền nguy hiểm vẫn còn đó.
      - **Thay bằng model lớn hơn:** kích cỡ model không liên quan tới phạm vi quyền.
```

### OF-CCARP-02 (bank/packs/official.yaml)
Chỉ sửa giải thích.

**OLD**
```yaml
      **C đúng.** Đặt phần tĩnh (system prompt + policy) trước phần động rồi bật prompt caching → tiền tố lặp lại được tái dùng, giảm cả time-to-first-token lẫn chi phí mỗi request mà không bỏ bớt context cần thiết.
      - **A sai:** cắt còn 1.000 token làm mất nội dung policy cần dùng.
      - **B sai:** hạ model bất chấp độ phù hợp với việc → rủi ro chất lượng.
      - **D sai:** dời policy thành khối few-shot không tạo ra tiền tố cache tái dùng được, cũng không giảm token.
```
**NEW**
```yaml
      **Đúng: đặt system prompt và policy tĩnh trước phần động rồi bật prompt caching.** Cache được dựng theo tiền tố (`tools` → `system` → `messages`), nên phần lặp lại đứng đầu được tái dùng: giảm time-to-first-token với prompt dài, và token đọc từ cache chỉ tính một phần nhỏ giá input (mặc định 0,1×), mà không bỏ bớt context cần thiết.
      - **Cắt policy còn 1.000 token đầu:** mất nội dung policy cần dùng.
      - **Chuyển sang model nhỏ nhất bất chấp độ phù hợp:** hạ model không xét việc cần gì → rủi ro chất lượng.
      - **Dời policy vào khối few-shot:** không tạo ra tiền tố cache tái dùng được, cũng không giảm token.
```

### OF-CCARP-03 (bank/packs/official.yaml)
Chỉ sửa giải thích.

**OLD**
```yaml
      **B đúng.** Triệu chứng xuất hiện **ngay sau khi làm mới tài liệu**, trong khi model và độ trễ không đổi → nghi bước retrieval đưa context kém cho model (re-index hỏng, embedding không khớp, chunk cũ/không liên quan). Model trả lời tự tin dựa trên context sai.
      - **A sai:** phiên bản model không đổi; "weights tự thay đổi" không phải giả thuyết hợp lý.
      - **C sai:** temperature thấp không gây ra sai lệch gắn với sự kiện làm mới tài liệu.
      - **D sai:** context window không tự co lại; cũng không liên quan tới việc làm mới tài liệu.
```
**NEW**
```yaml
      **Đúng: bước retrieval/indexing đang trả về chunk không liên quan hoặc cũ.** Triệu chứng xuất hiện **ngay sau khi làm mới tài liệu**, trong khi model và độ trễ không đổi → nghi bước retrieval đưa context kém cho model (re-index hỏng, embedding không khớp, chunk cũ/không liên quan). Model trả lời tự tin dựa trên context sai.
      - **Trọng số model âm thầm thay đổi:** phiên bản model không đổi; "weights tự thay đổi" không phải giả thuyết hợp lý.
      - **Temperature quá thấp:** temperature thấp không gây ra sai lệch gắn với sự kiện làm mới tài liệu.
      - **Context window bị co lại:** context window không tự co lại; cũng không liên quan tới việc làm mới tài liệu.
```
