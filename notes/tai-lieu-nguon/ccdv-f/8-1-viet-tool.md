---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/8-1-viet-tool
ngay_tai: 2026-11-27
tieu_de: Viết tool cho Claude - chỗ tool chạy, schema, mô tả, lỗi và bộ tool gọn
---

Domain 8: Tools and MCPs · Task 8.1

# Viết tool cho Claude - chỗ tool chạy, schema, mô tả, lỗi và bộ tool gọn

Tool chạy ở đâu thì bạn phải làm gì, một định nghĩa tool gồm những gì, viết mô tả để Claude chọn đúng, kiểm tham số và trả lỗi có cấu trúc, và dựng bộ tool gọn.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Phân loại tool - do bạn định nghĩa, theo schema của Anthropic, hay chạy ở máy chủ - và biết ứng dụng phải làm gì với từng loại
- Viết định nghĩa tool với name, description, input_schema, input_examples và strict
- Viết mô tả tool đủ chi tiết để Claude chọn đúng tool
- Kiểm tham số trước khi chạy tool và trả lỗi có cấu trúc để agent gọi lại
- Dựng bộ tool gọn - gộp, đặt tiền tố, trả thông tin có ích - và cấu hình tool_choice đúng

Claude không tự gọi được hệ thống nào của bạn. Nó chỉ nói "tôi muốn gọi tool này với tham số này", và chất lượng của lời đề nghị đó phụ thuộc gần như hoàn toàn vào cách bạn mô tả tool. Tool mô tả sơ sài, schema lỏng lẻo, lỗi trả về khó hiểu là ba nguồn lỗi phổ biến nhất của agent.

Bài này giúp bạn trả lời: viết một tool cho Claude gồm những gì, và làm sao để Claude dùng nó đúng?

## Ví dụ xuyên suốt: agent đặt xe của hãng cho thuê xe tự lái

Một hãng cho thuê xe tự lái có 15 chi nhánh. Đội phát triển dựng agent nhận yêu cầu khách ("cần xe 7 chỗ ở Đà Lạt từ thứ Sáu tới Chủ nhật") và đặt xe. Agent hiện có 14 tool, trong đó `tim_xe`, `tim_xe_trong`, `tra_xe_chi_nhanh` làm gần như cùng một việc. Tool `tinh_gia` gọi sang một dịch vụ báo giá bên ngoài, đôi khi trả lỗi khi dịch vụ đó quá tải. Thỉnh thoảng agent gọi `dat_xe` với tham số `loai_xe: "SUV lớn"` không có trong schema, và hệ thống đặt xe báo lỗi.

## Tool chạy ở đâu quyết định bạn phải làm gì

Docs "How tool use works" chia tool theo nơi chạy:

| Loại | Ví dụ | Ứng dụng của bạn phải làm |
| --- | --- | --- |
| Do bạn định nghĩa, chạy ở phía bạn (client) | `tim_xe`, `dat_xe` | Viết schema, chạy tool, gửi kết quả về, và chạy vòng lặp |
| Theo schema của Anthropic, chạy ở phía bạn | Bash, sửa file, memory | Chạy tool; schema đã được Claude học sẵn nên gọi rất ổn định |
| Chạy ở máy chủ Anthropic | `web_search`, `web_fetch`, `code_execution` | Chỉ bật tool và đọc kết quả |

Với tool client, mỗi lần gọi là một vòng: Claude trả `stop_reason: "tool_use"` kèm khối `tool_use`, bạn chạy tool, gửi khối `tool_result`, Claude viết tiếp. Với tool máy chủ, phản hồi chứa khối `server_tool_use` cho biết đã chạy gì; nếu vòng lặp phía máy chủ chạm giới hạn số vòng thì `stop_reason` là `"pause_turn"` và bạn gửi lại hội thoại để chạy tiếp.

## Một định nghĩa tool

Sau khi sắp lại bộ tool (mục cuối bài), ba tool tìm xe gộp thành một tool `xe_tim`, còn `tinh_gia` và `dat_xe` đổi tên thành `xe_bao_gia` và `xe_dat`. Định nghĩa của `xe_tim`:

```json
{
  "name": "xe_tim",
  "description": "Tìm xe còn trống theo chi nhánh, loại xe và khoảng thời gian. Dùng khi khách hỏi còn xe không hoặc trước khi đặt. Không trả giá; giá lấy bằng xe_bao_gia. Chỉ trả tối đa 10 xe, sắp theo giá tăng dần.",
  "input_schema": {
    "type": "object",
    "properties": {
      "chi_nhanh": { "type": "string", "description": "Mã chi nhánh, ví dụ DL01" },
      "loai_xe": { "type": "string", "enum": ["4_cho", "7_cho", "ban_tai"] },
      "tu_ngay": { "type": "string", "format": "date" },
      "den_ngay": { "type": "string", "format": "date" }
    },
    "required": ["chi_nhanh", "loai_xe", "tu_ngay", "den_ngay"],
    "additionalProperties": false
  },
  "strict": true
}
```

- `name` phải khớp `^[a-zA-Z0-9_-]{1,128}$`.
- `input_examples` (không bắt buộc) là các ví dụ tham số hợp lệ, có ích với tool có đầu vào phức tạp hay nhạy cảm về định dạng.
- `strict: true` bảo đảm tham số Claude gửi luôn đúng schema, nhờ ràng buộc việc sinh token.

## Mô tả quyết định việc chọn tool

Docs "Define tools" nói mô tả chi tiết là yếu tố quan trọng nhất với hiệu quả của tool. Mô tả nên nói: tool làm gì, khi nào nên dùng và khi nào không, mỗi tham số nghĩa là gì, và giới hạn quan trọng (như "không trả giá"). Nên có ít nhất 3–4 câu, nhiều hơn với tool phức tạp. Tên tool chỉ vài chữ; mô tả mới phân biệt được hai tool na ná nhau.

> **Trong đề chọn gì**
>
> Câu luyện thi: đồng nghiệp đề xuất bỏ phần mô tả của tool vì tên đã đủ rõ. Chọn **giải thích model dùng mô tả để quyết định khi nào gọi tool, và mô tả phân biệt các trường hợp mà tên không đủ**. Sai: đồng ý vì tên là đủ; thay mô tả bằng ví dụ lời gọi; chuyển mô tả ra file tài liệu riêng.

## Kiểm tham số và trả lỗi có cấu trúc

Lỗi `loai_xe: "SUV lớn"` có cách sửa đúng: giữ schema chặt (thêm `enum` và `strict: true`), kiểm tham số trước khi gọi hệ thống đặt xe, và nếu sai thì trả về một lỗi có cấu trúc để agent hiểu và gọi lại.

Docs "Handle tool calls" nói khi tool lỗi, trả thông báo lỗi trong `content` kèm `is_error: true`. Bài viết "Writing effective tools for agents" khuyên lỗi phải giúp agent sửa được, ví dụ nêu rõ giá trị nào hợp lệ, thay vì một mã lỗi khó hiểu.

**Sơ đồ**
1. **Claude gọi xe_dat**: loai_xe là "SUV lớn"
2. **Code kiểm tham số**: sai, chưa gọi hệ thống đặt xe
3. **tool_result có is_error**: nêu rõ giá trị hợp lệ
- ↻Tham số đã hợp lệ thì tool mới chạy

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_01...",
  "is_error": true,
  "content": "loai_xe 'SUV lớn' không hợp lệ. Giá trị hợp lệ: 4_cho, 7_cho, ban_tai."
}
```

Tool `xe_bao_gia` gọi dịch vụ ngoài cũng phải tự bắt lỗi của dịch vụ đó và trả `is_error` với thông điệp rõ ("dịch vụ báo giá đang quá tải, thử lại sau 30 giây"), thay vì để lỗi làm sập cả vòng lặp. Lưu ý khi gửi kết quả: trong tin nhắn user chứa kết quả tool, các khối `tool_result` phải đứng trước, chữ (nếu có) đứng sau.

> **Bẫy đề**
>
> Hai câu luyện thi cùng ý. Agent gọi tool với tham số mà schema không khai báo, đồng nghiệp đề xuất nới schema: đúng là **giữ schema chặt, kiểm tham số trước khi chạy tool, trả lỗi có cấu trúc để agent thử lại**; sai là nới schema, bỏ schema để dịch vụ phía sau tự từ chối, hay chỉ dặn trong system prompt. Khối `tool_use` có tham số không có trong schema: đúng là **kiểm tham số theo schema trước khi chạy, xử lý tham số sai như một nhánh lỗi đã biết**; sai là ghi log rồi vẫn chạy, thử lại mãi, hay bỏ hẳn tool.

> **Trong đề chọn gì**
>
> Câu luyện thi: viết tool gọi dịch vụ báo giá bên ngoài. Chọn **schema rõ ràng, mô tả chính xác khi nào gọi, và xử lý lỗi của dịch vụ một cách tường minh**. Sai: bỏ mô tả để model tự đoán; schema lỏng cho linh hoạt; không xử lý lỗi, để vòng lặp tự bắt.

## Bộ tool gọn

14 tool với ba tool tìm xe trùng nhau là lý do agent hay chọn nhầm. Docs và bài viết của Anthropic khuyên:

- **Gộp các thao tác liên quan** vào ít tool hơn, ví dụ một tool với tham số `action`. Ít tool mà mạnh hơn thì ít mơ hồ khi chọn.
- **Bỏ tool không dùng**, và viết lại mô tả để mỗi tool có một mục đích riêng.
- **Đặt tiền tố theo dịch vụ**: `xe_tim`, `xe_bao_gia`, `khach_tra_cuu`. Điều này càng quan trọng khi dùng tool search.
- **Trả thông tin có ích**: tên, biển số, chi nhánh thay vì mã UUID; bài viết nói đổi mã khó hiểu thành tên có nghĩa giúp Claude chính xác hơn và bớt bịa.
- **Tiết kiệm token**: phân trang, lọc, cắt bớt với giá trị mặc định hợp lý. Claude Code mặc định giới hạn kết quả tool ở 25.000 token.

Riêng ba tool tìm xe của hãng:

**Sơ đồ**
1. **tim_xe** **|** **tim_xe_trong** **|** **tra_xe_chi_nhanh**
   ↓ _gộp ba tool gần như cùng một việc_
2. **xe_tim**: một mục đích rõ, mô tả nói khi nào dùng, khi nào không

> **Trong đề chọn gì**
>
> Câu luyện thi: agent có quá nhiều tool, nhiều tool chồng chức năng, thường chọn nhầm. Chọn **tái cấu trúc bộ tool: gộp tool trùng, bỏ tool không dùng, làm rõ mô tả để mỗi tool có mục đích riêng**. Sai: thêm tool cho mọi biến thể; bỏ hết tool; chỉ thêm ví dụ vào mô tả mỗi tool.

## tool_choice và các bước cần duyệt

`tool_choice` điều khiển việc gọi tool: `auto` (mặc định, Claude tự quyết), `none` (không gọi), `any` (phải gọi một tool nào đó), `tool` (phải gọi đúng tool chỉ định). Trên Opus 5.5, Sonnet 5.5, Fable 5.1, hai loại ép buộc `any` và `tool` trả lỗi 400; docs khuyên dùng `auto` kết hợp strict tool use.

Đề thi còn nhắc mẫu duyệt (**approval patterns**): với tool client, chính code của bạn chạy tool, nên bạn có thể dừng trước tool có tác dụng phụ để người duyệt. Trong ví dụ, `xe_tim` và `xe_bao_gia` chạy ngay, còn `xe_dat` chỉ chạy sau khi nhân viên bấm xác nhận.

**Sơ đồ**
1. **Claude gọi một tool**
   ↓ _code của bạn rẽ theo tool_
2. **xe_tim, xe_bao_gia**: chạy ngay **|** **xe_dat**: có tác dụng phụ, chờ nhân viên bấm xác nhận

> **Ý chính**
>
> Biết tool chạy ở đâu để biết mình phải làm gì. Mô tả chi tiết là yếu tố quan trọng nhất; schema chặt với `strict: true`; kiểm tham số trước khi chạy và trả `is_error` có hướng dẫn sửa. Giữ bộ tool gọn, có tiền tố, trả thông tin có nghĩa, và đặt bước duyệt trước tool có tác dụng phụ.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 8](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [How tool use works (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
3. [Define tools (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
4. [Handle tool calls (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
5. [Strict tool use (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)
6. [Writing effective tools for agents (Anthropic Engineering)](https://www.anthropic.com/engineering/writing-tools-for-agents)
