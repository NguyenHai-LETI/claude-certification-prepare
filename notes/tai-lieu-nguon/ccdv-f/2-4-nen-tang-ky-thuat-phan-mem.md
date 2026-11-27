---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/2-4-nen-tang-ky-thuat-phan-mem
ngay_tai: 2026-11-27
tieu_de: Nền tảng kỹ thuật phần mềm khi tích hợp Claude
---

Domain 2: Applications and Integration · Task 2.4

# Nền tảng kỹ thuật phần mềm khi tích hợp Claude

Gọi Claude như một REST API trả JSON, dùng async client trong service bất đồng bộ, và giữ đủ kỷ luật phần mềm - version control, review, test, CI, refactor.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Hình dung một lần gọi Claude là HTTPS POST gửi và nhận JSON, và lưu hội thoại dạng JSON trong kho của mình
- Chọn giữa gọi chặn, async client, streaming và gửi rồi hỏi kết quả sau, cho từng loại việc
- Biết SDK tự thử lại lỗi nào, timeout mặc định bao lâu
- Yêu cầu đúng những gì khi review code tích hợp Claude, và dựng test, CI đủ tầng
- Refactor nhỏ từng bước có test, và biết cách làm thay đổi lớn trên nhiều file

Thêm Claude vào một service không làm các quy tắc kỹ thuật phần mềm thông thường biến mất. Lời gọi Claude vẫn là một lời gọi mạng có thể chậm hay lỗi; prompt và tên model vẫn là cấu hình cần review; phần tích hợp vẫn cần test.

Bài này giúp bạn trả lời: gọi Claude từ code thế nào cho đúng, và những thực hành nào (version control, review, test, CI, refactor) vẫn áp dụng?

## Ví dụ xuyên suốt: service phân loại phản hồi của hợp tác xã cà phê

Một hợp tác xã cà phê có khoảng 300 đại lý. Mỗi ngày đại lý gửi khoảng 800 phản hồi qua ứng dụng: hàng giao trễ, bao bì rách, khách khen hương vị. Đội 4 lập trình viên viết một service web bất đồng bộ (async) bằng Python: nhận phản hồi, gọi Claude để phân loại và tóm tắt, lưu kết quả vào database.

Service chạy được 6 tháng. Phần code xử lý prompt bắt đầu rối: logic lặp lại ở nhiều chỗ, tên model viết thẳng trong code, chưa có test cho phần gọi Claude.

## Claude API là một REST API nói JSON

Một lần gọi Messages API là một yêu cầu HTTPS `POST` tới `https://api.anthropic.com/v1/messages`, gửi JSON và nhận JSON. Yêu cầu cần vài header: khoá API trong `Authorization: Bearer <khoá>` (header cũ `x-api-key` vẫn được nhận), phiên bản API (`anthropic-version`), và `content-type: application/json`. SDK chính thức gửi các header này giúp bạn.

Vì API không giữ trạng thái, hội thoại phải được lưu ở phía bạn. Cách đơn giản là lưu chính danh sách `messages` dưới dạng JSON, theo mã hội thoại, rồi đọc ra và thêm lượt mới mỗi lần gọi. Trong ví dụ, một phản hồi có thể có vài lượt hỏi lại ("đơn này giao trễ mấy ngày?"), nên mỗi phản hồi có một bản ghi JSON riêng.

## Gọi chặn, async, streaming hay gửi rồi hỏi sau

Lời gọi Claude là chờ mạng (I/O), không phải tính toán nặng. Đó đúng là chỗ lập trình bất đồng bộ phát huy: trong lúc chờ Claude, service vẫn phục vụ được yêu cầu khác. SDK Python có hai client với cùng giao diện: `Anthropic` (đồng bộ) và `AsyncAnthropic` (bất đồng bộ).

```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def phan_loai(noi_dung: str):
    return await client.messages.create(model=MODEL, max_tokens=512, messages=[...])
```

| Cách gọi | Hợp khi |
| --- | --- |
| Gọi chặn với client đồng bộ | Script, job chạy một luồng |
| Async client, `await` trong code async | Service web nhận nhiều yêu cầu cùng lúc |
| Streaming | Đầu ra dài hoặc có người đang nhìn |
| Gửi rồi hỏi kết quả sau (Batch API) | Khối lượng lớn, không ai chờ |

Trong service async, gọi client đồng bộ sẽ chặn event loop: mọi yêu cầu khác phải đứng chờ. Cũng tránh để nhiều coroutine cùng sửa một danh sách `messages` dùng chung; mỗi phản hồi nên có danh sách riêng.

**Sơ đồ**
1. **Client đồng bộ trong service async** **|** **AsyncAnthropic với await**
   ↓ _trong lúc chờ Claude trả lời_
2. **Event loop bị chặn, mọi yêu cầu khác đứng chờ** **|** **Event loop rảnh, service vẫn phục vụ yêu cầu khác**

> **Trong đề chọn gì**
>
> Câu luyện thi: tích hợp Claude vào một REST service bất đồng bộ, xử lý nhiều yêu cầu cùng lúc. Chọn **async client của SDK, viết lời gọi Claude thành thao tác `await` cùng với phần code async còn lại**. Sai: gọi đồng bộ và chặn event loop; viết lại cả service thành đồng bộ; đẩy lời gọi sang một thread pool riêng.

SDK còn lo sẵn vài việc bạn không nên tự viết lại:

- **Thử lại**: lỗi kết nối, 408, 409, 429 và lỗi 5xx được thử lại 2 lần mặc định, chờ tăng dần (exponential backoff). Đổi bằng `max_retries`.
- **Timeout**: mặc định 10 phút, đổi bằng `timeout`. SDK báo lỗi trước nếu một yêu cầu không streaming có thể kéo dài quá khoảng 10 phút.
- **Mã yêu cầu**: mỗi phản hồi có `_request_id` lấy từ header `request-id`; ghi vào log để tra lỗi.

## Version control, review, test và CI

Prompt và tên model quyết định hành vi của ứng dụng y như code. Chúng cần được lưu trong version control, đổi qua pull request và được review như code.

> **Bẫy đề**
>
> Câu luyện thi: pull request thêm tính năng dùng Claude, chạy được, nhưng prompt và model viết thẳng trong code, không xử lý lỗi, không có test cho phần tích hợp. Đúng là **yêu cầu sửa cả ba: đưa prompt và cấu hình model ra chỗ cấu hình được, thêm xử lý lỗi khi Claude API lỗi, thêm test tích hợp**. Sai: duyệt rồi tự sửa sau; duyệt nguyên trạng vì chạy được; yêu cầu hai thứ và để xử lý lỗi cho bản sau. Không bắt lỗi API thì sự cố mạng hay giới hạn tốc độ đổ thẳng tới người dùng.

Một chiến lược test có ba tầng, mỗi tầng bắt một loại lỗi:

| Tầng | Kiểm gì | Trong ví dụ |
| --- | --- | --- |
| Unit test | Từng hàm | Hàm dựng prompt, hàm đọc kết quả phân loại |
| Integration test | Chỗ nối với Claude | Gửi 20 phản hồi mẫu, kiểm đầu ra đúng khuôn và đúng nhãn |
| End-to-end test | Luồng người dùng quan trọng | Đại lý gửi phản hồi, quản lý thấy nó trong báo cáo |

Pipeline CI chạy trên mọi pull request nên gồm đủ các cổng chất lượng đội đã áp cho service khác (lint, test, quét bảo mật), cộng thêm test tích hợp Claude. Ứng dụng dùng AI không được miễn kỷ luật thông thường.

**Sơ đồ**
1. **Lint** **|** **Test** **|** **Quét bảo mật** **|** **Test tích hợp Claude**
   ↓ _đạt đủ các cổng_
2. **Pull request mới đủ điều kiện để merge**

> **Trong đề chọn gì**
>
> Hai câu luyện thi cùng hướng. Chính thức hoá chiến lược test: chọn **unit test cho hàm, integration test cho phần tích hợp Claude, end-to-end cho luồng quan trọng, áp dụng nhất quán**, thay vì chỉ TDD, chỉ end-to-end, hay tiếp tục viết test tuỳ hứng. Dựng CI: chọn **test tích hợp Claude, lint, và mọi cổng chất lượng chuẩn của đội**, thay vì triển khai production cho mỗi pull request hay để test Claude làm tay.

## Refactor nhỏ và refactor lớn

Sau 6 tháng, code xử lý prompt của service đã rối tới mức thêm tính năng nào cũng chậm. Khi nợ kỹ thuật đã cản trở trực tiếp việc thêm tính năng, hoãn thêm ngày nào là trả giá thêm ngày đó. Hướng hợp lý là lên kế hoạch một đợt refactor: gộp logic lặp lại, tách các phần có trách nhiệm khác nhau, làm gọn luồng điều khiển, rồi mới làm tính năng mới.

> **Bẫy đề**
>
> Câu luyện thi: ứng dụng chạy 6 tháng, code xử lý prompt lặp và rối, tính năng mới ngày càng khó thêm. Đúng là **lên kế hoạch một đợt refactor để gộp logic lặp, tách trách nhiệm, làm gọn luồng điều khiển trước khi thêm tính năng**. Sai: dọn dần như việc phụ trong mỗi ticket tính năng; làm thêm hai đợt phát hành rồi tính; gom tất cả vào một hàm lớn cho ít file.

Khi làm refactor với Claude Code, docs đưa vài mẹo: làm từng bước nhỏ kiểm được bằng test, giữ tương thích ngược khi cần, và chạy test sau mỗi bước. Với một thay đổi máy móc trên rất nhiều file (như đổi mọi handler sang helper mới), lệnh `/batch` chia việc thành 5 tới 30 phần độc lập, trình kế hoạch cho bạn duyệt, rồi chạy mỗi phần trong một worktree riêng và mở pull request cho từng phần. Một phiên Claude Code thứ hai, hay `/code-review`, có thể đóng vai người review độc lập cho phần vừa viết.

Cách `/batch` chia một thay đổi máy móc:

**Sơ đồ**
1. **/batch**: đổi mọi handler sang helper mới
   ↓ _chia thành 5 tới 30 phần độc lập, bạn duyệt kế hoạch_
2. **Worktree 1** **|** **Worktree 2** **|** **Các worktree còn lại**
   ↓ _mỗi phần một pull request_
3. **Pull request 1** **|** **Pull request 2** **|** **Các pull request còn lại**

> **Ý chính**
>
> Gọi Claude là gọi REST trả JSON qua mạng: trong service async thì dùng async client, để SDK lo thử lại và timeout. Prompt và model là cấu hình, phải nằm trong version control và qua review. Test đủ ba tầng, CI giữ đủ cổng chất lượng, và refactor theo từng bước nhỏ có test.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [API overview (Claude API Docs)](https://platform.claude.com/docs/en/api/overview)
3. [Python SDK (Claude API Docs)](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python)
4. [Working with the Messages API (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)
5. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
6. [Common workflows (Claude Code Docs)](https://code.claude.com/docs/en/common-workflows)
7. [Best practices for Claude Code (Claude Code Docs)](https://code.claude.com/docs/en/best-practices)
8. [Commands (Claude Code Docs)](https://code.claude.com/docs/en/commands)
