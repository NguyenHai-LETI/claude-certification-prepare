---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/2-3-co-che-messages-api
ngay_tai: 2026-11-27
tieu_de: Cơ chế Messages API - hội thoại, streaming, ảnh, thinking, gọi theo lô
---

Domain 2: Applications and Integration · Task 2.3

# Cơ chế Messages API - hội thoại, streaming, ảnh, thinking, gọi theo lô

Một lần gọi Messages API gửi gì và nhận gì, giữ hội thoại ở đâu, khi nào stream, gửi ảnh ra sao, trả thinking về thế nào, và khi nào dùng Batch API.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 10 nguồn

## Đọc xong bạn nắm được

- Đọc một phản hồi Messages API - các khối content, stop_reason và usage
- Giữ hội thoại trong code của mình và gửi lại đủ mỗi lần gọi
- Chọn giữa gọi thường, streaming và Batch API theo việc người dùng có đang chờ không
- Gửi ảnh bằng base64, URL hay file_id, và trả khối thinking về đúng cách khi dùng tool
- Biết yêu cầu thay đổi gì khi gọi Claude qua Amazon Bedrock hay Google Cloud

Gần như mọi thứ bạn làm với Claude đều đi qua một endpoint: `POST /v1/messages`. Hiểu một lần gọi gửi gì, nhận gì, và những biến thể của nó (streaming, ảnh, tool, theo lô), là nền cho cả phần còn lại của chứng chỉ.

Bài này giúp bạn trả lời: Messages API hoạt động thế nào, và với mỗi yêu cầu cụ thể thì gọi theo cách nào?

## Ví dụ xuyên suốt: ứng dụng gợi ý món ăn

Một ứng dụng nấu ăn cho người dùng chụp ảnh tủ lạnh rồi hỏi "tối nay nấu được món gì?". Claude nhìn ảnh, gọi tool `tim_cong_thuc` để tra kho công thức của ứng dụng, rồi trả lời từng bước nấu. Người dùng hỏi tiếp được ("không có hành thì sao?").

Ngoài phần chat, mỗi đêm ứng dụng cần viết mô tả ngắn cho khoảng 5.000 công thức mới do người dùng đóng góp. Một đối tác lớn muốn chạy bản riêng của ứng dụng trên Google Cloud.

## Một lần gọi: gửi gì, nhận gì

Yêu cầu gồm `model`, `max_tokens`, có thể có `system`, và `messages` là danh sách lượt `user` và `assistant` xen kẽ. Phản hồi là một đối tượng `Message`:

```json
{
  "role": "assistant",
  "content": [{ "type": "text", "text": "Với trứng, cà chua và đậu phụ, bạn có thể..." }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 1830, "output_tokens": 412 }
}
```

- `content` là danh sách khối: `text`, `tool_use`, `thinking`… chứ không phải một chuỗi.
- `stop_reason` cho biết vì sao dừng: `end_turn` (xong), `max_tokens` (hết số token cho phép, câu trả lời bị cắt), `tool_use` (Claude muốn gọi tool), `refusal`…
- `usage` cho số token vào và ra, dùng để tính tiền.

**Messages API không giữ trạng thái** (**stateless**): lần gọi nào bạn cũng phải gửi lại toàn bộ hội thoại. Lịch sử hội thoại nằm trong code và kho lưu trữ của bạn. Khi người dùng hỏi "không có hành thì sao?", ứng dụng gửi lại ảnh, câu hỏi đầu, câu trả lời của Claude, rồi mới tới câu hỏi mới.

Lần gọi thứ hai vì vậy gửi đi cả ba phần:

**Sơ đồ**
1. **Lượt user**: ảnh tủ lạnh và câu hỏi đầu
2. **Lượt assistant**: câu trả lời trước của Claude
3. **Lượt user mới**: "không có hành thì sao?"

_Bỏ hai phần đầu thì Claude không biết "hành" đang nói về món nào_

Gửi lại nhiều thì tốn token. Prompt caching giúp phần đầu giống nhau giữa các lần gọi được đọc từ cache: thêm `cache_control` vào yêu cầu, lần sau cùng phần đầu đó thì token đọc từ cache tính giá thấp (thường bằng 0,1 giá đầu vào; Opus 5.5 và Sonnet 5.5 là 0,05). Cache tính theo cả tiền tố `tools`, `system`, `messages` theo đúng thứ tự đó, nên giữ phần đầu ổn định, đừng chèn nội dung thay đổi vào đầu.

## Streaming: khi người dùng đang nhìn màn hình

Không streaming, người dùng nhìn màn hình trống tới khi Claude viết xong. Với streaming (`"stream": true`, hoặc `client.messages.stream()` trong SDK), API trả về dần qua server-sent events theo thứ tự:

1. `message_start`: đối tượng `Message` với `content` rỗng.
2. Với mỗi khối nội dung: `content_block_start`, nhiều `content_block_delta`, rồi `content_block_stop`.
3. Một hay nhiều `message_delta` (có `stop_reason` và số token cộng dồn).
4. `message_stop`.

Xen giữa có thể có `ping`, và có thể có sự kiện `error` giữa chừng, ví dụ `overloaded_error` lúc tải cao. Code đọc stream phải xử lý trường hợp đó.

Khi stream với thinking bật, chữ của khối thinking đến qua các sự kiện `thinking_delta`. Ngay trước `content_block_stop` của khối đó có thêm một sự kiện `signature_delta`, mang chữ ký dùng để kiểm tính toàn vẹn của khối thinking. Nếu thinking để ẩn (`display: "omitted"`), `thinking_delta` chỉ mang chuỗi rỗng, còn chữ ký vẫn đến qua `signature_delta`. Vì vậy khi ghép các delta lại để gửi trả ở lượt sau, đừng bỏ sót chữ ký và giữ nguyên nội dung khối, như mục về tool và thinking trong bài này nói.

Streaming còn có lý do thứ hai ngoài trải nghiệm: yêu cầu dài. Docs về lỗi khuyên dùng streaming hoặc Batch API cho yêu cầu dài, nhất là trên 10 phút, và tránh đặt `max_tokens` lớn mà không stream. SDK còn kiểm trước và báo lỗi nếu một yêu cầu không streaming có thể vượt 10 phút. Nếu bạn không cần xử lý từng mẩu, SDK có thể tự gom stream rồi trả về `Message` hoàn chỉnh (`stream.get_final_message()` trong Python).

> **Trong đề chọn gì**
>
> Câu luyện thi: cần đưa đầu ra tới người dùng ngay khi đang sinh, không chờ xong cả câu trả lời. Chọn **streaming, trả token dần khi model sinh ra**. Sai: structured output (chỉ trả khi xong cả khối JSON); Batch API (trả sau, cho việc không tương tác); prompt caching (giảm chi phí lần sau, không đổi thời điểm nhận).

## Ảnh và file

Ảnh gửi trong khối `image`, với một trong ba nguồn:

| Nguồn | Khi nào dùng |
| --- | --- |
| `base64` nhúng trong yêu cầu | Ảnh người dùng vừa chụp, như ảnh tủ lạnh |
| `url` trỏ tới ảnh trên mạng | Ảnh đã có địa chỉ công khai |
| `file_id` từ Files API | Tải lên một lần, dùng lại nhiều lần |

Vài điều cần nhớ: trên Amazon Bedrock và Google Cloud bản Google quản lý hiện chỉ dùng được `base64`. Docs khuyên đặt ảnh trước câu hỏi, giống như đặt tài liệu dài trước câu hỏi. Một yêu cầu chứa được tới 600 ảnh nhưng giới hạn kích thước yêu cầu (128 MB trên Claude API, 20 MB trên Bedrock, 30 MB trên Google Cloud bản Google quản lý) có thể tới trước. File tải qua Files API được giữ tới khi bạn xoá hoặc hết hạn, nên không thuộc diện Zero Data Retention.

## Tool và thinking trong cùng vòng lặp

Khi Claude cần tra công thức, phản hồi có `stop_reason: "tool_use"` và một khối `tool_use`. Ứng dụng chạy tool, gửi lại cả lượt `assistant` vừa nhận và một lượt `user` chứa khối `tool_result`, rồi Claude viết tiếp.

Từ Claude 5 trở đi, thinking (Claude suy nghĩ trước khi trả lời) đã bật sẵn ở chế độ adaptive, không cần cấu hình, và phần chữ của thinking mặc định bị ẩn. Khối `thinking` vẫn có trong phản hồi, kèm `signature`. Khi trả kết quả tool, bạn **phải gửi lại các khối thinking của lượt assistant đó, đầy đủ và không sửa**: Claude đang viết dở câu trả lời và cần lập luận trước đó. Khối thinking bị sửa sẽ bị từ chối với lỗi 400.

**Sơ đồ**
1. **Claude trả tool_use**: kèm khối thinking có signature
2. **Ứng dụng chạy tool**: tim_cong_thuc
3. **Gửi lại**: lượt assistant nguyên vẹn, rồi lượt user có tool_result
- ↻Khối thinking bị sửa thì lỗi 400

```python
messages.append({"role": "assistant", "content": response.content})  # giữ nguyên cả khối thinking
messages.append({"role": "user", "content": [{"type": "tool_result", "tool_use_id": tu.id, "content": ket_qua}]})
```

## Gọi tức thì hay theo lô

Việc viết mô tả cho 5.000 công thức mỗi đêm không có ai ngồi chờ. Đó là việc của **Message Batches API**:

|   | Messages API (tức thì) | Message Batches API |
| --- | --- | --- |
| Ai chờ | Người dùng đang chờ | Không ai chờ |
| Giá | Giá thường | Giảm 50% cả token vào và ra |
| Thời gian | Vài giây | Phần lớn lô xong trong 1 giờ; quá 24 giờ chưa xong thì hết hạn |
| Quy mô | Từng yêu cầu | Tới 100.000 yêu cầu hoặc 256 MB mỗi lô |
| Kết quả | Trả ngay | Lấy về trong 29 ngày; thứ tự không đảm bảo, ghép bằng `custom_id` |

1. **Người dùng đang nhìn màn hình?** → Messages API có streaming
2. **Khối lượng lớn, không ai chờ?** → Message Batches API, giảm 50%
3. **Yêu cầu rất dài, có thể trên 10 phút?** → Streaming hoặc Batch API, đừng gọi thường
- **Còn lại** → Yêu cầu ngắn, code đọc khi đã xong: gọi Messages API thường

> **Bẫy đề**
>
> Câu hỏi mẫu chính thức của đề thi và một câu luyện thi cùng kiểu: xử lý hàng nghìn tài liệu hay email qua đêm, không gấp, chi phí là chính. Đúng là **Message Batches API**. Sai: gửi song song thật nhiều yêu cầu thường cho nhanh (không giảm giá mỗi token); giảm `max_tokens`; đổi sang model nhỏ nhất bất kể chất lượng; streaming ghi kết quả từng phần vào database.

## Gọi Claude qua nền tảng cloud

Đề thi nhắc việc gọi Claude qua nhà cung cấp bên thứ ba (**third-party vendors**). Dạng yêu cầu gần như giống hệt, nhưng có vài chỗ khác:

| Nền tảng | Khác với Claude API |
| --- | --- |
| Claude in Amazon Bedrock | Endpoint `/anthropic/v1/messages` trên hạ tầng AWS, xác thực bằng thông tin AWS, model ID dạng `anthropic.claude-sonnet-5-5`. Chưa có Message Batches, Files API, nguồn ảnh URL, tool chạy phía máy chủ |
| Claude Models on Google Cloud (Google quản lý) | Tên model nằm trong URL endpoint (`...:rawPredict`, stream thì `:streamRawPredict`), không đặt trong body; `anthropic_version` gửi trong body |

Trong ví dụ, bản cho đối tác chạy trên Google Cloud: ảnh tủ lạnh vẫn gửi `base64` như cũ nên không phải sửa, nhưng code tạo client và cách đặt tên model phải đổi. Giữ phần logic ứng dụng tách khỏi phần gọi API giúp việc này gọn.

> **Ý chính**
>
> Messages API không giữ trạng thái: lịch sử nằm ở code của bạn. Người dùng đang chờ thì stream; không ai chờ và khối lượng lớn thì Batch API, rẻ hơn 50%. Khi dùng tool, gửi lại khối thinking nguyên vẹn. Gọi qua nền tảng cloud thì kiểm endpoint, xác thực, model ID và tính năng nào chưa có.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Working with the Messages API (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
3. [Streaming messages (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/streaming)
4. [Vision (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/vision)
5. [Thinking (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/thinking)
6. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
7. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
8. [API overview (Claude API Docs)](https://platform.claude.com/docs/en/api/overview)
9. [Claude in Amazon Bedrock (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)
10. [Claude Models on Google Cloud, Google managed (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai)
