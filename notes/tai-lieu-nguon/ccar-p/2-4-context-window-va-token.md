---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/2-4-context-window-va-token
ngay_tai: 2026-11-27
tieu_de: Tối ưu context window và quản lý token
---

Domain 2: Claude Models, Prompting & Context Engineering · Task 2.4

# Tối ưu context window và quản lý token

Những gì chiếm context window, chuyện gì xảy ra khi chạm giới hạn, cách đo token trước và sau khi gọi, và cách giảm token ở từng giai đoạn của một yêu cầu.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Kể được mọi thứ tính vào context window, kể cả phần đã cache và phần thinking
- Phân biệt lỗi khi đầu vào quá dài với lúc câu trả lời bị dừng vì hết chỗ
- Đo token trước khi gửi bằng token counting và sau khi gửi bằng các trường usage
- Xếp các cách giảm token vào đúng giai đoạn chuẩn bị đầu vào, dựng prompt, xử lý đầu ra
- Giảm phần context do tool chiếm, và giữ hội thoại dài trong giới hạn

Context window 1 triệu token nghe như không bao giờ hết. Nhưng mỗi token trong đó đều tốn tiền, làm chậm câu trả lời, và docs của Anthropic nói rõ: càng nhiều token thì độ chính xác và khả năng nhớ lại càng giảm. Nhồi càng nhiều càng tốt là sai.

Bài này giúp bạn trả lời: cái gì đang chiếm context, đo nó ra sao, và giảm ở chỗ nào mà không làm hỏng chất lượng?

## Ví dụ xuyên suốt: trợ lý kỹ thuật của một hãng máy lạnh

Một hãng máy lạnh làm trợ lý cho kỹ thuật viên đi sửa máy tại nhà. Mỗi yêu cầu gửi kèm:

- System prompt 6.000 token: quy trình an toàn điện, cách chẩn đoán, giọng văn.
- 35 tool: tra mã lỗi, tra sơ đồ mạch, tra linh kiện tồn kho, đặt linh kiện, ghi biên bản...
- Đoạn trích từ sổ tay sửa chữa dài 300 trang, truy xuất theo câu hỏi.
- Cả lịch sử trò chuyện với kỹ thuật viên, có khi kéo dài cả buổi.

Hoá đơn API tăng nhanh, và những cuộc trò chuyện dài bắt đầu có câu trả lời lẫn lộn giữa hai máy khác nhau.

## Cái gì chiếm context

Docs về context window liệt kê: mọi thứ trong yêu cầu đều tính, gồm system prompt, mọi tin nhắn trong `messages` (kể cả kết quả tool), và định nghĩa tool. Câu trả lời Claude sinh ra, kể cả phần thinking, cũng tính.

Một yêu cầu của trợ lý máy lạnh chiếm context như sau:

**Sơ đồ**
1. **Định nghĩa 35 tool**
2. **System prompt 6.000 token**: quy trình an toàn điện, cách chẩn đoán, giọng văn
3. **Đoạn trích sổ tay**: truy xuất theo câu hỏi
4. **Lịch sử trò chuyện cả buổi**: kể cả kết quả tool
5. **Câu trả lời Claude sinh ra**: kể cả phần thinking

_Tất cả đều tính vào context window, kể cả phần đã cache_

Ba điều hay bị hiểu sai:

| Hiểu sai | Đúng |
| --- | --- |
| Phần đã cache thì không chiếm chỗ | Docs nói phần prompt đã cache **vẫn chiếm** context window. Cache chỉ đổi giá bạn trả cho chúng |
| Context càng lớn càng tốt | Docs gọi hiện tượng độ chính xác giảm khi token tăng là **context rot** |
| Định nghĩa tool không đáng kể | 35 tool gửi kèm mọi yêu cầu là một khoản lớn, cả về chỗ lẫn tiền |

Các model hiện nay (Opus, Sonnet, Haiku 5.5, Fable 5.1) có context window 1 triệu token. Một số model cũ hơn vẫn là 200.000 token.

## Khi chạm giới hạn

Có hai trường hợp khác nhau:

- **Riêng đầu vào đã vượt context window**: API trả lỗi 400 `invalid_request_error` ("prompt is too long"), trên mọi model. Yêu cầu không chạy.
- **Đầu vào cộng `max_tokens` vượt context window**: trên các model từ Claude 4.5 trở đi, yêu cầu vẫn chạy, và nếu câu trả lời dài tới mức hết chỗ thì dừng với `stop_reason` là `model_context_window_exceeded`.

1. **Riêng đầu vào đã vượt context window?** → Lỗi 400, yêu cầu không chạy, trên mọi model
2. **Đầu vào cộng max_tokens vượt, trên model từ Claude 4.5 trở đi?** → Vẫn chạy; câu trả lời hết chỗ thì dừng với stop_reason model_context_window_exceeded
- **Còn lại** → Không vượt: chạy bình thường

> **Bẫy đề**
>
> Đừng nghĩ cứ tổng đầu vào và `max_tokens` vượt giới hạn là bị lỗi 400 như đầu vào quá dài. Trên model mới, chỉ khi riêng đầu vào đã vượt mới bị từ chối.

## Đo token trước và sau khi gửi

**Trước khi gửi**: endpoint token counting cho biết một yêu cầu có bao nhiêu token mà không phải gọi model. Docs nói dùng nó để quản lý giới hạn tốc độ và chi phí, chọn model theo độ dài, và tối ưu prompt về một độ dài nhất định. Đây là con số **ước lượng**, và tokenizer của các model từ Claude 4.7 trở đi cho số token nhiều hơn khoảng 30% với cùng một đoạn chữ, nên đếm lại theo đúng model sẽ dùng.

**Sau khi gửi**: đọc object `usage` trong phản hồi. Tổng token đầu vào là `cache_read_input_tokens` + `cache_creation_input_tokens` + `input_tokens`. Chỉ nhìn `input_tokens` sẽ thấy con số nhỏ bất thường khi đang dùng cache, vì nó chỉ đếm phần sau điểm cache cuối cùng.

## Giảm token ở từng giai đoạn

Câu luyện thi chia các cách quản lý token theo giai đoạn của một yêu cầu. Cách chia này dễ nhớ:

| Giai đoạn | Cách giảm | Trong ví dụ |
| --- | --- | --- |
| Chuẩn bị đầu vào (**Input Preparation**) | Tóm tắt phần hội thoại cũ khi không cần đầy đủ nữa; cắt đoạn truy xuất chỉ còn phần liên quan tới câu hỏi | Bỏ chi tiết của máy đã sửa xong; chỉ lấy đoạn sổ tay về đúng mã lỗi |
| Dựng prompt (**Prompt Construction**) | Xếp phần ổn định lên đầu để cache được; đưa nội dung lặp lại vào prefix cache | System prompt 6.000 token và định nghĩa tool đặt đầu, bật cache |
| Xử lý đầu ra (**Output Handling**) | Kiểm đầu ra có cấu trúc đúng schema; lưu kết quả đã kiểm cho bước sau và cho kiểm toán | Kiểm biên bản sửa chữa trước khi ghi vào hệ thống |

> **Trong đề chọn gì**
>
> Đề cho chi phí bị chi phối bởi một system prompt dài lặp lại và một lượng lớn nội dung truy xuất mỗi yêu cầu, hỏi cách tối ưu nhắm đúng nhất. Chọn: đưa system prompt vào prefix cache được **và** cắt nội dung truy xuất xuống phần liên quan. Loại: tăng độ sâu truy xuất; thêm nội dung lặp vào system prompt; chuyển mọi yêu cầu sang model nặng nhất.

### Phần context do tool chiếm

Docs về quản lý context của tool nói có hai nguồn: định nghĩa tool, và các kết quả tool tích luỹ dần. Bốn cách, mỗi cách nhắm một chỗ:

| Cách | Giảm gì | Khi nào |
| --- | --- | --- |
| **Tool search** | Không gửi trước mọi định nghĩa tool, Claude tìm tool khi cần | Bộ tool lớn, khoảng 20 tool trở lên; đổi lại thêm một lượt tra |
| **Programmatic tool calling** | Kết quả trung gian không vào lịch sử hội thoại | Chuỗi nhiều lần gọi tool nhỏ chạy được thành một đoạn code |
| **Prompt caching** cho định nghĩa tool | Không giảm token, chỉ giảm tiền cho phần lặp lại | Nên bật ngay từ đầu |
| **Context editing** | Xoá kết quả tool cũ đã dùng xong khỏi lịch sử | Hội thoại dài |

Trợ lý máy lạnh có 35 tool: bật cache cho định nghĩa tool, rồi chuyển sang tool search để chỉ những tool hay dùng (tra mã lỗi, tra sơ đồ) luôn được nạp.

### Hội thoại dài

Với hội thoại và agent chạy lâu, docs nói **compaction** phía server là cách chính để quản lý context: thay các lượt cũ bằng một bản tóm tắt do Claude viết, để hội thoại tiếp tục được. Context editing là cách nhắm hẹp hơn: xoá kết quả tool cũ hay khối thinking cũ. Với trợ lý máy lạnh, khi kỹ thuật viên chuyển sang máy thứ hai, tóm tắt phần về máy thứ nhất là cách tránh câu trả lời lẫn lộn hai máy.

**Sơ đồ**
1. **Các lượt cũ về máy thứ nhất**: chi tiết cả buổi **|** **Các lượt mới về máy thứ hai**
   ↓ _compaction thay các lượt cũ bằng bản tóm tắt do Claude viết_
2. **Bản tóm tắt về máy thứ nhất**: vài dòng **|** **Các lượt mới về máy thứ hai**: còn nguyên

Phiên agent chạy dài thường dùng ba thứ cùng lúc. Compaction tóm tắt các lượt cũ khi hội thoại gần chạm giới hạn context. Context editing xoá kết quả tool cũ khi vượt ngưỡng bạn đặt. **Memory tool** cho Claude lưu và đọc lại thông tin giữa các cuộc hội thoại, trong một thư mục file memory. Memory chạy phía client: Claude yêu cầu thao tác file, ứng dụng của bạn thực thi và tự quyết lưu ở đâu. Docs gợi ý dùng cả hai cho agent chạy lâu: compaction giữ context đang dùng nhỏ, còn memory giữ những gì phải còn lại sau khi bị tóm tắt.

Context editing có hai chiến lược. `clear_tool_uses_20250919` bắt đầu xoá khi prompt vượt ngưỡng `trigger` (tính bằng `input_tokens` hoặc `tool_uses`), xoá kết quả tool cũ nhất trước, giữ lại `keep` cặp tool use và kết quả gần nhất, và không đụng tới các tool trong `exclude_tools`. Ví dụ: `trigger` 30.000 input token, `keep` 3 lần gọi tool, `exclude_tools` là web search. `clear_thinking_20251015` thì dọn khối thinking của các lượt cũ và chỉ có tuỳ chọn `keep`. Cả hai đang ở bản beta, bật bằng beta header.

> **Ý chính**
>
> Mọi thứ đều tính vào context, kể cả phần đã cache. Đo bằng token counting trước và `usage` sau, cắt ở đầu vào, xếp phần ổn định lên đầu để cache, và đừng mặc định nhồi đầy context.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Context windows (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/context-windows)
3. [Token counting (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/token-counting)
4. [Manage tool context (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
5. [Compaction (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/compaction)
6. [Context editing (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/context-editing)
7. [Prompt caching (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
8. [Memory tool (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
