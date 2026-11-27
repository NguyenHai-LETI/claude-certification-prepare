---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-5-tai-su-dung-prompt
ngay_tai: 2026-11-27
tieu_de: Dùng lại prompt bằng caching, module và Skills
---

Domain 2: Claude Models, Prompting & Context Engineering · Task 2.5

# Dùng lại prompt bằng caching, module và Skills

Ba cách dùng lại prompt là prompt caching cho phần đầu giống hệt nhau, prompt chia module để phần đầu ổn định, và Agent Skills cho quy trình dùng chung.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Hiểu prompt caching hoạt động thế nào, tốn và tiết kiệm bao nhiêu, cái gì làm mất cache
- Xếp prompt thành các module từ ổn định nhất tới hay đổi nhất
- Đóng gói một quy trình thành Agent Skill và hiểu cách Skill được nạp dần
- Chọn caching, module, Skill hay truy xuất cho từng tình huống

Nếu mọi yêu cầu đều mang theo cùng một đoạn hướng dẫn dài, bạn đang trả tiền và chờ đợi để model đọc lại đúng đoạn đó hàng nghìn lần. Dùng lại prompt là cách bỏ phần lặp đó đi, về chi phí, về độ trễ, và về công sức bảo trì.

Bài này giúp bạn trả lời: dùng lại prompt bằng những cách nào, mỗi cách tiết kiệm gì, và chọn cách nào cho tình huống nào?

## Ví dụ xuyên suốt: chuỗi nhà thuốc và quy trình tư vấn

Một chuỗi nhà thuốc dùng Claude ở ba nơi: chatbot trên website, trợ lý cho dược sĩ tại quầy, và hệ thống trả lời tổng đài. Cả ba đều cần:

- Một bảng tương tác thuốc khoảng 50.000 token, gửi kèm mọi câu hỏi.
- Một **quy trình tư vấn** do phòng dược chính soạn: hỏi những gì trước khi gợi ý thuốc không kê đơn, khi nào bắt buộc khuyên đi khám. Quy trình này sửa 4 tới 6 lần một năm khi có hướng dẫn mới của cơ quan quản lý.

Hiện mỗi nơi chép quy trình vào system prompt của mình, và sau mỗi lần sửa thì ba bản lệch nhau.

## Prompt caching

**Prompt caching** cho phép dùng lại phần đầu của prompt (prefix) đã xử lý ở lần gọi trước. Docs của Anthropic mô tả:

- Cache theo thứ tự `tools` → `system` → `messages`, tính tới khối có đánh dấu `cache_control`. Bật bằng một trường `cache_control` ở cấp request (cache tự động, điểm cache tự dời theo hội thoại), hoặc đặt điểm cache (breakpoint) trên từng khối; tối đa 4 điểm.
- Phần cache phải **giống hệt** từ đầu tới điểm cache. Khác một ký tự là không trúng.
- Có độ dài tối thiểu: với các model 5.x là 512 token. Ngắn hơn thì yêu cầu vẫn chạy nhưng không được cache, và không báo lỗi.
- Cache sống mặc định 5 phút, được làm mới miễn phí mỗi lần dùng. Có tuỳ chọn 1 giờ cho lưu lượng thưa hơn.

Về tiền và tốc độ:

| Khoản | Giá so với token đầu vào thường |
| --- | --- |
| Ghi cache, sống 5 phút | 1,25 lần |
| Ghi cache, sống 1 giờ | 2 lần |
| Đọc cache (trúng) | 0,1 lần; riêng Opus 5.5 và Sonnet 5.5 là 0,05 lần, Fable 5.1 là 0,025 lần |

Trúng cache còn giảm thời gian tới chữ đầu tiên, và với đa số model, token đọc từ cache không tính vào hạn mức token đầu vào mỗi phút. Bản thân điểm cache không tốn thêm gì. Một lưu ý khi chạy song song: cache chỉ dùng được sau khi phản hồi đầu tiên bắt đầu trả về, nên gửi 100 yêu cầu cùng lúc thì chúng không dùng chung cache của nhau.

Trong ví dụ: bảng tương tác thuốc 50.000 token đặt ở đầu và bật cache. Từ câu hỏi thứ hai trong vòng 5 phút, phần đó chỉ tính 0,1 lần giá (hoặc thấp hơn tuỳ model) thay vì giá đầy đủ.

> **Trong đề chọn gì**
>
> Câu hỏi mẫu Anthropic công bố cho chứng chỉ này: mọi yêu cầu gửi cùng một system prompt và tài liệu chính sách 8.000 token, theo sau là câu hỏi ngắn thay đổi; cần giảm cả độ trễ lẫn chi phí. Đáp án: đặt phần tĩnh lên trước phần thay đổi và bật prompt caching. Các đáp án sai: cắt tài liệu còn 1.000 token đầu (mất nội dung cần), đổi sang model nhỏ nhất bất kể việc (hại chất lượng), chuyển tài liệu vào khối few-shot (không tạo prefix dùng lại được).

## Prompt chia module: ổn định trước, thay đổi sau

Cache chỉ trúng khi phần đầu giống hệt, nên cách xếp prompt quyết định cache có hiệu quả không. Nguyên tắc: xếp các module từ **ít đổi nhất** tới **hay đổi nhất**.

**Sơ đồ**
1. **Định nghĩa tool**: gần như không đổi
2. **System prompt, vai trò và luật**: đổi vài lần một năm
3. **Bảng tương tác thuốc**: đổi hằng tháng
   _(điểm cache_control: mọi thứ phía trên được dùng lại)_
4. **Hồ sơ khách, câu hỏi lần này**: đổi mỗi yêu cầu

Docs liệt kê những thay đổi làm mất cache. Thay đổi ở một cấp làm mất cache của cấp đó và mọi cấp sau:

| Thay đổi | Mất cache ở đâu |
| --- | --- |
| Sửa định nghĩa tool (tên, mô tả, tham số) | Toàn bộ |
| Bật hay tắt web search, citations | System và messages |
| Đổi `tool_choice`, thêm hay bớt ảnh | Chỉ messages |
| Đổi thông số thinking hay effort | Messages (luôn luôn) |

Lỗi hay gặp là đặt thứ hay đổi lên đầu, ví dụ chèn ngày giờ hiện tại vào câu đầu system prompt: mỗi yêu cầu có prefix khác nhau, nên không lần nào trúng cache. Còn nếu prompt rất dài, nhiều khối, cache có thể trượt dù phần đầu không đổi, vì hệ thống chỉ dò ngược tối đa 20 vị trí tính từ mỗi điểm cache; khi đó đặt thêm một điểm cache gần chỗ đã ghi cache lần trước.

> **Bẫy đề**
>
> Đổi `tool_choice` giữa hội thoại không xoá toàn bộ cache, chỉ mất phần messages. Thứ xoá toàn bộ cache là sửa định nghĩa tool.

## Agent Skills: quy trình dùng chung nhiều nơi

**Agent Skills** đóng gói chỉ dẫn, metadata và tài nguyên tuỳ chọn (script, mẫu văn bản) thành một thư mục có file `SKILL.md`. Điểm khác với nhét vào system prompt là Skill được **nạp dần** (**progressive disclosure**):

| Cấp | Nạp lúc nào | Chiếm bao nhiêu |
| --- | --- | --- |
| Metadata (`name`, `description`) | Luôn nạp, nằm trong system prompt | Khoảng 100 token mỗi Skill |
| Nội dung `SKILL.md` | Khi Skill được kích hoạt | Dưới 5.000 token |
| File tham chiếu, script | Khi cần tới | Script chạy xong chỉ đưa kết quả vào context |

Nhờ vậy có thể cài nhiều Skill mà không làm phình context. Docs nói Skill giúp "tạo một lần, dùng tự động", không phải lặp lại cùng hướng dẫn qua các cuộc hội thoại.

**Sơ đồ**
1. **Metadata**: luôn nạp, khoảng 100 token mỗi Skill
   ↓ _Skill được kích hoạt_
2. **Nội dung SKILL.md**: dưới 5.000 token
   ↓ _khi cần tới_
3. **File tham chiếu, script**: script chạy xong chỉ đưa kết quả vào context

Chia sẻ Skill tuỳ nơi dùng: trên Claude API, Skill tự tạo dùng chung cho cả workspace; trên claude.ai, Skill là của riêng từng người, admin không quản lý tập trung được; trong Claude Code, Skill nằm ở thư mục cá nhân hoặc thư mục dự án, và chia sẻ qua plugin. Skill **không tự đồng bộ** giữa các nơi.

Vài luật khi viết Skill theo docs: `name` tối đa 64 ký tự, chỉ chữ thường, số và gạch nối, không chứa từ `anthropic` hay `claude`; `description` tối đa 1.024 ký tự, viết ở ngôi thứ ba, nói Skill làm gì và khi nào dùng; thân `SKILL.md` dưới 500 dòng, file tham chiếu chỉ sâu một cấp. Docs khuyên tạo bộ đánh giá trước khi viết nhiều, và chỉ viết những gì Claude chưa biết.

Trong Claude Code, Skill có tác dụng phụ (gửi tin nhắn, xoá branch, deploy) nên đặt `disable-model-invocation: true` trong frontmatter. Khi đó Claude không tự gọi được Skill, chỉ bạn gọi bằng `/tên`, và mô tả Skill cũng không còn nằm sẵn trong context. Docs nêu lý do: bạn không muốn Claude tự quyết deploy chỉ vì code trông đã sẵn sàng. Xoá `description` không thay được việc này, vì nếu thiếu, Claude Code lấy dòng đầu của nội dung làm mô tả.

Trong ví dụ: quy trình tư vấn được đóng gói thành một Skill do **phòng dược chính sở hữu**, và cả ba nơi cùng tham chiếu đúng Skill đó. Sửa một lần ở nguồn, ba nơi cùng dùng bản mới, không còn bản nào lệch.

**Sơ đồ**
- Trung tâm: **Skill quy trình tư vấn**: phòng dược chính sở hữu, sửa một lần ở nguồn
- **Chatbot website**
- **Trợ lý tại quầy**
- **Hệ thống tổng đài**

_Cả ba nơi tham chiếu đúng một Skill, không còn bản nào lệch_

> **Bẫy đề**
>
> Với quy trình phải áp y hệt ở nhiều luồng và đổi vài lần một năm, câu luyện thi có các đáp án sai: chép quy trình vào system prompt của từng luồng lúc tích hợp; để mỗi nhóm tự viết lại cho hợp luồng của mình; đưa vào kho truy xuất dùng chung. Đáp án đúng gồm hai ý: đóng gói thành một Skill do nhóm chịu trách nhiệm quy trình sở hữu, và cả ba luồng tham chiếu cùng Skill đó.

## Chọn cách nào

| Tình huống | Cách |
| --- | --- |
| Cùng một phần đầu dài lặp lại ở nhiều yêu cầu | Prompt caching, phần tĩnh đặt trước |
| Nhiều prompt dùng chung một số phần, khác nhau ở biến số | Prompt chia module (template), phần chung ở đầu |
| Quy trình dùng ở nhiều nơi, có người sở hữu và cập nhật | Agent Skill |
| Kho tài liệu lớn, mỗi câu chỉ cần vài đoạn | Truy xuất (RAG, domain 3) |

> **Trong đề chọn gì**
>
> Đề yêu cầu giảm chi phí mà **độ chính xác không đổi**: chọn cách giảm chi phí xử lý lại mà giữ nguyên nội dung, như cache phần mở đầu tĩnh và cache những đoạn truy xuất được dùng lại nhiều lần trong ngày. Loại các cách giảm nội dung hay năng lực: cắt bớt phần mở đầu, truy xuất ít đoạn hơn, đổi sang model nhỏ hơn.

> **Ý chính**
>
> Phần lặp lại thì cache, và muốn cache trúng thì xếp prompt từ ổn định tới hay đổi. Quy trình dùng chung nhiều nơi thì đóng gói thành một Skill có chủ sở hữu, đừng chép ra nhiều bản.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Prompt caching (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
3. [Tool use with prompt caching (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-use-with-prompt-caching)
4. [Agent Skills overview (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
5. [Skill authoring best practices (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
6. [Extend Claude with skills (Claude Code Docs)](https://code.claude.com/docs/en/skills)
