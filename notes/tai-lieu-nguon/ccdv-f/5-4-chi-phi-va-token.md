---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/5-4-chi-phi-va-token
ngay_tai: 2026-11-27
tieu_de: Quản lý chi phí và token - giá, dự toán, prompt caching, theo dõi mức dùng
---

Domain 5: Model Selection and Optimization · Task 5.4

# Quản lý chi phí và token - giá, dự toán, prompt caching, theo dõi mức dùng

Token vào và ra có giá khác nhau, các hệ số đổi giá, dự toán chi phí, đặt điểm cache cho phần prompt lặp lại, đếm token và theo dõi chi phí theo tính năng.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Ước chi phí một yêu cầu từ số token vào, ra và bảng giá của model
- Biết các hệ số làm đổi đơn giá - Batch, cache, nơi xử lý, fast mode - và chúng cộng dồn thế nào
- Đặt điểm cache đúng chỗ để phần prompt lặp lại được tính giá đọc cache
- Đếm token trước khi gửi, đọc usage trong phản hồi, và theo dõi chi phí theo từng tính năng

Hoá đơn Claude không tăng đều theo số người dùng. Nó tăng theo số token, và một vài lựa chọn thiết kế (gửi lại cả bảng thuật ngữ mỗi lần, để câu trả lời dài vô tội vạ, không bật cache) có thể làm chi phí gấp mấy lần mà không ai để ý.

Bài này giúp bạn trả lời: một yêu cầu tốn bao nhiêu tiền, dự toán thế nào, prompt caching tiết kiệm ở đâu, và theo dõi chi phí ra sao?

## Ví dụ xuyên suốt: công ty dịch thuật hợp đồng

Một công ty dịch thuật dùng Claude Sonnet 5.5 hỗ trợ biên dịch viên dịch hợp đồng thương mại Anh sang Việt. Mỗi yêu cầu gửi:

- System prompt và bảng thuật ngữ pháp lý của công ty: khoảng 30.000 token, giống hệt nhau ở mọi yêu cầu.
- Đoạn hợp đồng cần dịch: khoảng 2.000 token.
- Bản dịch trả về: khoảng 2.500 token.

Ứng dụng có ba tính năng: dịch, rà soát thuật ngữ, tóm tắt hợp đồng. Mỗi ngày khoảng 3.000 yêu cầu. Tháng này hoá đơn tăng gấp đôi, và không ai biết tính năng nào gây ra.

## Token vào và token ra có giá khác nhau

Mỗi model có hai đơn giá, tính theo triệu token (MTok):

| Model | Đầu vào | Đầu ra |
| --- | --- | --- |
| Claude Fable 5.1 | $10 | $50 |
| Claude Opus 5.5 | $4 | $20 |
| Claude Sonnet 5.5 | $2 | $10 |
| Claude Haiku 5.5 | từ $0,10 | từ $0,50 |

Với các model này, token đầu ra đắt gấp 5 lần token đầu vào. Mô hình chi phí phải tính riêng hai đơn giá; một câu trả lời dài thường tốn hơn một prompt dài cùng số token.

> **Trong đề chọn gì**
>
> Câu luyện thi: đồng nghiệp hỏi vì sao token đầu ra bị tính giá khác token đầu vào. Chọn **token đầu ra thường đắt hơn token đầu vào, và mô hình chi phí phải tính riêng hai đơn giá**. Sai: hai giá như nhau, chênh lệch là lỗi tính tiền; đầu ra rẻ hơn; đầu ra không tính tiền.

## Các hệ số làm đổi đơn giá

| Hệ số | Ảnh hưởng |
| --- | --- |
| Message Batches API | Giảm 50% cả đầu vào và đầu ra |
| Ghi cache 5 phút / 1 giờ | 1,25 lần / 2 lần giá đầu vào |
| Đọc cache | 0,1 lần giá đầu vào; Opus 5.5 và Sonnet 5.5 là 0,05; Fable 5.1 là 0,025 |
| `inference_geo: "us"` | Nhân 1,1 mọi loại token (model từ 4.6) |
| Fast mode | Giá cao hơn; không dùng được với Batch API |
| Prompt dài trên 100.000 token trên Haiku 5.5 | Bảng giá cao hơn cho cả yêu cầu |

Docs nói các hệ số này cộng dồn với nhau: hệ số cache áp chung với giảm giá Batch và hệ số nơi xử lý, và cả hai hệ số đó cũng áp lên trên giá fast mode.

## Dự toán chi phí

Mô hình chi phí cần đủ năm thứ: số yêu cầu, số token đầu vào trung bình, số token đầu ra trung bình, bảng giá của model đã chọn, và phần tiết kiệm nhờ cache. Tính thử cho tính năng dịch:

|   | Không cache | Có cache (bảng thuật ngữ đọc từ cache) |
| --- | --- | --- |
| 30.000 token phần cố định | 30.000 × $2/MTok = $0,060 | 30.000 × $0,10/MTok = $0,003 |
| 2.000 token đoạn hợp đồng | $0,004 | $0,004 |
| 2.500 token đầu ra | $0,025 | $0,025 |
| Mỗi yêu cầu | $0,089 | $0,032 |
| 3.000 yêu cầu mỗi ngày | khoảng $267 | khoảng $96, cộng phí ghi cache |

Phí ghi cache: mỗi lần ghi 30.000 token ở giá 1,25 lần ($2,50/MTok) là $0,075, chỉ trả khi cache chưa có hoặc đã hết hạn.

> **Bẫy đề**
>
> Câu luyện thi: đội sản phẩm cần dự toán chi phí trước khi ra mắt. Đúng là **mô hình kết hợp số yêu cầu, token đầu vào trung bình, token đầu ra trung bình, giá của model đã chọn và lợi ích từ cache**. Sai: lấy chi phí mỗi yêu cầu của ứng dụng năm ngoái rồi nhân lên; bỏ token đầu ra vì cho là nhỏ; để số token vào, ra tới sau khi ra mắt mới ước.

## Prompt caching: đặt điểm cache đúng chỗ

Prompt caching cho phép phần đầu của prompt được đọc lại từ cache thay vì xử lý lại. Cache tính theo tiền tố, theo đúng thứ tự `tools`, `system`, `messages`, tới khối có `cache_control`. Đề thi nhắc tới đặt điểm cache (**cache check-pointing**). Những điều cần nắm:

- **Chỉ cache được đầu vào.** Phần hợp để cache là phần tĩnh lặp lại giữa các yêu cầu: system prompt, chỉ dẫn, tài liệu dùng chung, định nghĩa tool. Đầu ra của model không phải là thứ prompt caching lưu.
- **Hai cách bật**: một trường `cache_control` ở cấp cao nhất của yêu cầu (cache tự động, điểm cache đặt ở khối cuối có thể cache), hoặc đặt `cache_control` trên từng khối, tối đa 4 điểm.
- **Đặt điểm cache ở khối cuối cùng giống hệt nhau giữa các yêu cầu.** Chèn thứ thay đổi (giờ hiện tại, mã người dùng) vào trước điểm cache là làm hỏng cache.
- **Hội thoại dài**: hệ thống chỉ dò ngược tối đa 20 khối từ mỗi điểm cache. Nếu một lượt thêm từ 20 khối trở lên, thêm một điểm cache gần nội dung cũ hơn.
- **Ngưỡng tối thiểu**: 512 token với các model mới nhất (Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5). Ngắn hơn thì không được cache, và API không báo lỗi.
- **Thời gian sống** mặc định 5 phút, có thể chọn 1 giờ với giá ghi gấp đôi.

Một yêu cầu dịch của công ty, điểm cache đặt ngay sau phần không đổi:

**Sơ đồ**
1. **System prompt và bảng thuật ngữ**: 30.000 token, giống hệt nhau ở mọi yêu cầu
   _(điểm cache: phần trên đọc từ cache, giá 0,05 lần trên Sonnet 5.5)_
2. **Đoạn hợp đồng**: 2.000 token, đổi mỗi yêu cầu, giá đầu vào
3. **Bản dịch trả về**: 2.500 token, giá đầu ra, không cache được

```json
{
  "system": [
    { "type": "text", "text": "Bạn là biên dịch viên pháp lý... <bang_thuat_ngu>...</bang_thuat_ngu>",
      "cache_control": { "type": "ephemeral" } }
  ],
  "messages": [{ "role": "user", "content": "Dịch đoạn sau: ..." }]
}
```

> **Trong đề chọn gì**
>
> Hai câu luyện thi về cache. Hội thoại nhiều lượt gửi lại cả lịch sử, chi phí tăng theo độ dài: chọn **prompt caching để dùng lại phần ngữ cảnh tĩnh qua các lượt**, không phải chuyển mọi lượt sang Batch API, cắt còn hai tin nhắn cuối, hay tóm tắt sau mỗi lượt (mất thông tin). Đồng nghiệp đề xuất cache cả đầu ra của model: chọn **áp prompt caching cho phần tĩnh của prompt lặp lại giữa các yêu cầu, như system prompt, chỉ dẫn, ngữ cảnh dùng chung**.

## Đếm trước, đo sau, theo từng tính năng

**Đếm trước khi gửi.** Endpoint `POST /v1/messages/count_tokens` nhận cùng đầu vào như một yêu cầu Messages (system, tool, ảnh, PDF) và trả số token ước tính. Docs nói nó miễn phí, có giới hạn số yêu cầu mỗi phút riêng, không trừ vào giới hạn của việc tạo message. Dùng nó để kiểm prompt có vừa giới hạn không, chọn model, hay so số token khi đổi sang model có tokenizer khác.

**Đo sau khi gửi.** Trường `usage` của mỗi phản hồi cho biết số token thật:

| Trường | Nghĩa |
| --- | --- |
| `input_tokens` | Chỉ phần đầu vào sau điểm cache cuối cùng |
| `cache_creation_input_tokens` | Phần được ghi vào cache lần này |
| `cache_read_input_tokens` | Phần đọc từ cache |
| `output_tokens` | Token đầu ra |

Cộng ba trường đầu mới ra tổng token đầu vào. Nếu `cache_read_input_tokens` luôn bằng 0 thì cache không trúng: kiểm lại vị trí điểm cache và ngưỡng tối thiểu.

**Theo tính năng.** API báo cáo mức dùng của tổ chức lọc được theo API key, workspace, model, nhưng không biết "tính năng" của bạn là gì. Muốn biết tính năng nào tốn tiền, ghi `usage` của mỗi lời gọi kèm nhãn tính năng vào log, hoặc dùng API key hay workspace riêng cho từng tính năng. Docs khuyên dùng Usage and Cost Analytics API cho tích hợp mới; Usage and Cost Admin API là bản cũ.

Trong ví dụ, sau khi gắn nhãn, đội thấy tính năng tóm tắt gửi nguyên hợp đồng 80.000 token mỗi lần và trả về bản tóm tắt dài 6.000 token. Đó mới là thứ cần sửa, không phải cắt đều mọi tính năng.

**Sơ đồ**
1. **Mỗi lời gọi**: usage kèm nhãn tính năng
   ↓ _gom theo nhãn_
2. **Dịch** **|** **Rà soát thuật ngữ** **|** **Tóm tắt**: nguyên hợp đồng 80.000 token mỗi lần

> **Bẫy đề**
>
> Câu luyện thi: chi phí token tăng nhanh hơn dự kiến, đội chưa theo dõi mức dùng theo tính năng nên không biết tính năng nào gây tốn. Đúng là **thêm theo dõi token theo tính năng vào log để tìm ra nguồn gốc trước khi đề xuất thay đổi**. Sai: chuyển mọi tính năng sang model nhỏ nhất; cắt đều một nửa token cho mọi tính năng; coi chi phí tăng là không tránh được.

> **Ý chính**
>
> Chi phí = số yêu cầu × (token vào × giá vào + token ra × giá ra), rồi áp các hệ số Batch, cache, nơi xử lý. Cache phần tĩnh lặp lại, đặt điểm cache ở khối cuối cùng không đổi, và kiểm `cache_read_input_tokens` để biết cache có trúng. Đếm token trước, đọc `usage` sau, và gắn nhãn tính năng để biết tiền đi đâu.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 5](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Pricing (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/pricing)
3. [Prompt caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
4. [Token counting (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/token-counting)
5. [Usage and Cost API (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
6. [Models overview (Claude API Docs)](https://platform.claude.com/docs/en/models/overview)
