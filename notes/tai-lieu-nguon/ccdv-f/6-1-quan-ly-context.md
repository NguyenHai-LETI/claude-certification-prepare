---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/6-1-quan-ly-context
ngay_tai: 2026-11-27
tieu_de: Context engineering - chống trôi và phình context, cô lập bằng subagent
---

Domain 6: Prompt and Context Engineering · Task 6.1

# Context engineering - chống trôi và phình context, cô lập bằng subagent

Context engineering khác prompt engineering ở đâu, vì sao context dài làm Claude kém đi, cách cắt tỉa kết quả tool, nén hội thoại, cô lập bằng subagent.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 9 nguồn

## Đọc xong bạn nắm được

- Phân biệt prompt engineering với context engineering
- Giải thích vì sao thêm context không phải lúc nào cũng tốt hơn, và cái gì đang chiếm context
- Cắt tỉa kết quả tool cũ bằng context editing và nén hội thoại bằng compaction, biết mỗi cách ảnh hưởng prompt cache thế nào
- Cô lập ngữ cảnh cho từng bước bằng subagent hoặc workflow nhiều bước
- Chọn cách xử lý theo đúng nguồn gây phình context

Context window 1 triệu token nghe như vô tận, nhưng agent vẫn có thể "quên" ràng buộc đặt ra từ đầu sau vài chục lần gọi tool. Vấn đề thường không phải hết chỗ, mà là thông tin quan trọng bị chìm giữa một đống thứ đã hết giá trị.

Bài này giúp bạn trả lời: context engineering là gì, vì sao context dài làm Claude làm kém đi, và có những cách nào để giữ context gọn?

## Ví dụ xuyên suốt: agent hỗ trợ kỹ thuật của hãng máy in

Một hãng máy in văn phòng có agent hỗ trợ kỹ thuật cho khách. Mỗi phiếu hỗ trợ, agent gọi tool khoảng 20 lần: đọc log lỗi của máy, tra tài liệu sửa chữa 800 trang, xem lịch sử bảo hành, kiểm tồn kho linh kiện. Mỗi kết quả tool dài vài nghìn token.

System prompt có một ràng buộc quan trọng: "chỉ hướng dẫn những thao tác khách tự làm được, không bao giờ bảo khách tháo vỏ máy". Đội nhận thấy sau khoảng 20 lần gọi tool, agent bắt đầu trả lời lan man và thỉnh thoảng quên ràng buộc đó.

## Prompt engineering và context engineering

Bài viết "Effective context engineering for AI agents" của Anthropic phân biệt:

- **Prompt engineering**: cách viết và sắp xếp chỉ dẫn cho LLM để ra kết quả tốt. Tập trung vào từng prompt.
- **Context engineering**: các chiến lược chọn lọc và duy trì tập token tốt nhất trong lúc model chạy, gồm mọi thông tin khác đi vào context ngoài prompt: kết quả tool, lịch sử hội thoại, tài liệu, bộ nhớ.

Anthropic coi context engineering là bước phát triển tiếp theo của prompt engineering. Với việc dài nhiều bước như agent máy in, phần quyết định chất lượng là context engineering.

> **Trong đề chọn gì**
>
> Câu luyện thi: đồng nghiệp hỏi hai khái niệm khác nhau thế nào với ứng dụng chạy việc dài nhiều bước. Chọn **prompt engineering nắn từng prompt cho đầu ra cụ thể; context engineering quản lý nội dung đi qua các lượt, các bước, giữ trạng thái liên quan luôn rõ**. Sai: hai tên gọi cho cùng một việc; một cái lo đầu ra, một cái lo đầu vào của người dùng; gộp làm một vì kỹ thuật trùng nhau.

## Thêm context không phải lúc nào cũng tốt hơn

Docs về context window nói: số token càng tăng thì độ chính xác và khả năng nhớ lại càng giảm, hiện tượng gọi là **context rot**. Vì vậy chọn lọc cái gì nằm trong context quan trọng ngang với việc có bao nhiêu chỗ. Bài viết về context engineering nói LLM có một "ngân sách chú ý" hữu hạn; context tốt là tập token nhỏ nhất mà mang nhiều tín hiệu nhất.

Thứ chiếm context gồm: system prompt, định nghĩa tool, toàn bộ hội thoại, kết quả tool, khối thinking, tài liệu, ảnh. Trong ví dụ, 20 kết quả tool vài nghìn token mỗi cái đã chiếm phần lớn context, và ràng buộc "không tháo vỏ máy" ở đầu system prompt bị loãng giữa chúng.

**Sơ đồ**
1. **System prompt**: "không bao giờ bảo khách tháo vỏ máy"
2. **20 kết quả tool**: vài nghìn token mỗi cái
3. **Câu hỏi của khách**: lượt hiện tại

_Ràng buộc vẫn nằm trong context, chỉ là bị loãng giữa những thứ đã hết giá trị_

> **Bẫy đề**
>
> Câu luyện thi: agent gọi tool nhiều, sau khoảng 20 lần thì trả lời kém tập trung và bỏ qua ràng buộc ban đầu. Đúng là **dùng kỹ thuật context engineering như cắt tỉa kết quả tool hay compaction để trạng thái việc đang làm luôn rõ mà giảm khối nội dung cũ**. Sai: bỏ hẳn tool; tăng context window để giữ mọi kết quả; khởi động lại agent sau mỗi 5 lần gọi tool (mất hết trạng thái).

## Cắt tỉa kết quả tool cũ: context editing

Cách nhẹ nhàng và an toàn nhất, theo bài viết của Anthropic, là xoá kết quả tool cũ: một khi tool đã được gọi từ lâu, agent hiếm khi cần xem lại nguyên văn kết quả. Đề thi gọi đây là cắt tỉa kết quả tool (**tool output pruning**).

Claude API làm việc này phía máy chủ qua **context editing** (đang beta, header `context-management-2025-06-27`) với chiến lược `clear_tool_uses_20250919`: khi prompt vượt ngưỡng, API xoá các kết quả tool cũ nhất và thay bằng một dòng báo cho Claude biết nội dung đã bị bỏ.

```json
"context_management": {
  "edits": [{
    "type": "clear_tool_uses_20250919",
    "trigger": { "type": "input_tokens", "value": 100000 },
    "keep": { "type": "tool_uses", "value": 3 },
    "exclude_tools": ["tra_bao_hanh"]
  }]
}
```

| Tham số | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `trigger` | 100.000 token đầu vào | Khi nào bắt đầu xoá |
| `keep` | 3 lần gọi tool | Giữ lại bao nhiêu cặp gọi và kết quả gần nhất |
| `exclude_tools` | Không có | Tool không bao giờ bị xoá kết quả |
| `clear_at_least` | Không có | Chỉ xoá khi xoá được ít nhất bấy nhiêu token |

Một điểm cần nhớ: xoá kết quả tool làm mất hiệu lực prompt cache từ chỗ bị xoá. Docs khuyên dùng `clear_at_least` để mỗi lần xoá đủ nhiều, đáng với việc phá cache. Trong ví dụ, kết quả tra bảo hành được giữ (`exclude_tools`) vì agent cần nó tới cuối phiếu.

Với cấu hình ở trên, khi prompt vượt 100.000 token:

**Sơ đồ**
1. **20 lần gọi tool trong lịch sử**
   ↓ _vượt trigger, API xử lý từng loại_
2. **Kết quả cũ nhất**: thay bằng một dòng báo đã bỏ **|** **3 lần gọi gần nhất**: giữ nguyên **|** **tra_bao_hanh**: giữ nguyên, nằm trong exclude_tools

## Nén hội thoại: compaction

**Compaction** thay các lượt cũ của hội thoại bằng một bản tóm tắt do Claude viết. Bản tóm tắt giữ cái cốt lõi (mục tiêu, quyết định đã chốt, việc còn dở), chi tiết vụn bị nén lại. Trên Claude API, compaction chạy ở máy chủ (đang beta): theo yêu cầu, hoặc tự động khi vượt một ngưỡng token. Agent SDK và Claude Code tự nén khi context gần đầy.

Vì các lượt cũ bị thay bằng bản tóm tắt, chỉ dẫn nói từ đầu hội thoại có thể không còn nguyên. Quy tắc cần bền thì đặt trong **CLAUDE.md** (trong Agent SDK, file này nạp qua `settingSources`), không đặt trong prompt đầu: nội dung CLAUDE.md được nạp lại ở mỗi yêu cầu, còn prompt đầu sẽ bị tóm tắt cùng phần cũ. Nếu cần giữ bản đầy đủ, dùng hook **PreCompact**: nó chạy ngay trước khi nén, nên là chỗ để lưu nguyên transcript trước khi phần cũ bị thay. Hook `PostToolUse` thì gắn với lúc tool chạy xong, không gắn với compaction.

**Sơ đồ**
1. **Các lượt cũ**: đầy chi tiết vụn **|** **Các lượt gần đây**
   ↓ _compaction thay các lượt cũ bằng bản tóm tắt do Claude viết_
2. **Bản tóm tắt**: mục tiêu, quyết định đã chốt, việc còn dở **|** **Các lượt gần đây**: vẫn tiếp tục từ đây

Compaction hợp với chuyện hội thoại dài mà model cứ bám vào chi tiết cũ không còn liên quan: phần cũ vẫn còn ý chính nhưng không còn nặng ký như trước. Bài viết của Anthropic cảnh báo nén quá tay có thể làm mất chi tiết nhỏ mà sau mới thấy quan trọng.

> **Trong đề chọn gì**
>
> Ba câu luyện thi cùng nhóm. Kết quả tool mỗi bước chỉ cần một lúc rồi hết giá trị, đang lấp đầy context: chọn **cắt tỉa kết quả tool không còn cần cho các bước sau**, không phải prompt caching (giảm tiền, không giảm độ dài) hay giữ mãi mọi kết quả. Context đủ chỗ mà thông tin vẫn bị chìm sau 10–15 lần gọi tool: chọn **mẫu quản lý context tóm tắt hoặc cắt tỉa kết quả tool cũ, giữ trạng thái việc đang làm**. Model hay nhắc lại chuyện nhiều lượt trước đã hết liên quan: chọn **compaction, tóm tắt phần cũ để giữ ý chính mà giảm trọng lượng chi tiết**, không phải tăng context, xoá sạch sau mỗi lượt hay chỉ giữ lượt cuối.

## Cô lập ngữ cảnh bằng subagent

Có những bước không nên thấy toàn bộ lịch sử. Một khi nội dung đã nằm trong context, dặn "hãy bỏ qua" không xoá được nó; cách chắc chắn là đừng đưa vào. Đề thi gọi đây là cô lập ngữ cảnh (**context isolation**) qua subagent hoặc workflow nhiều bước.

Bài viết của Anthropic mô tả: mỗi subagent có thể dùng hàng chục nghìn token để tìm tòi, nhưng chỉ trả về bản tóm tắt cô đọng, thường 1.000–2.000 token. Trong ví dụ, việc tra tài liệu sửa chữa 800 trang giao cho một subagent; agent chính chỉ nhận "bước 3 trang 214: lau trục kéo giấy bằng khăn khô", không nhận cả chương.

**Sơ đồ**
1. **Agent chính**: giao việc tra tài liệu sửa chữa
   ↓ _chỉ lời giao việc đi sang_
2. **Subagent**: đọc tài liệu 800 trang, tốn hàng chục nghìn token
   ↓ _chỉ bản tóm tắt quay về_
3. **Agent chính**: nhận đúng một dòng "lau trục kéo giấy", context vẫn gọn

Một ý gần đó là nạp "vừa đúng lúc" (**just in time**): thay vì nạp sẵn mọi dữ liệu, agent giữ các tham chiếu nhẹ (đường dẫn file, mã tài liệu) và chỉ dùng tool nạp nội dung khi cần.

> **Trong đề chọn gì**
>
> Câu luyện thi: workflow nhiều bước, có bước phải suy luận mà không thấy toàn bộ lịch sử trước đó. Chọn **cô lập ngữ cảnh qua subagent hoặc workflow nhiều bước, mỗi bước chỉ nhận phần nó cần**. Sai: đưa mọi nội dung vào mọi bước; một prompt chung cho mọi bước; nhúng toàn bộ lịch sử vào từng bước.

## Chọn cách theo nguồn gây phình

Docs về quản lý ngữ cảnh tool chia các cách theo thứ chúng giảm:

| Nguồn phình | Cách xử lý |
| --- | --- |
| Quá nhiều định nghĩa tool nạp từ đầu (từ 20 tool trở lên) | Tool search: Claude tìm tool khi cần |
| Chuỗi nhiều lần gọi tool qua lại | Programmatic tool calling: chạy cả chuỗi trong một đoạn script |
| Định nghĩa tool lặp lại tốn tiền | Prompt caching (giảm tiền, không giảm độ dài context) |
| Kết quả tool cũ trong lịch sử | Context editing |
| Cả hội thoại quá dài | Compaction |
| Việc tìm tòi sinh nhiều token | Subagent |
| Thông tin cần qua nhiều phiên | Ghi chú ra ngoài (memory tool, file) |

1. **Kết quả tool cũ đã hết giá trị?** → Context editing, giữ vài kết quả gần nhất
2. **Hội thoại dài, model bám chi tiết cũ?** → Compaction
3. **Một bước sinh rất nhiều token tìm tòi?** → Giao cho subagent, nhận bản tóm tắt
4. **Bước sau không nên thấy lịch sử?** → Cô lập ngữ cảnh, chỉ truyền phần cần
- **Còn lại** → Quá nhiều định nghĩa tool thì dùng tool search

> **Ý chính**
>
> Context càng dài thì Claude nhớ và chính xác kém đi (context rot), nên giữ context nhỏ mà nhiều tín hiệu. Kết quả tool cũ thì cắt tỉa, hội thoại dài thì compaction, việc tìm tòi nặng thì subagent. Tăng context window hay prompt caching không chữa được việc thông tin bị chìm.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Effective context engineering for AI agents (Anthropic Engineering)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
3. [Context windows (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
4. [Context editing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/context-editing)
5. [Compaction overview (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/compaction)
6. [Manage tool context (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
7. [Subagents in the SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/subagents)
8. [How the agent loop works (Claude Code Docs, Agent SDK)](https://code.claude.com/docs/en/agent-sdk/agent-loop)
9. [Intercept and control agent behavior with hooks (Claude Code Docs, Agent SDK)](https://code.claude.com/docs/en/agent-sdk/hooks)
