---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/2-1-tu-yeu-cau-den-cau-hinh
ngay_tai: 2026-11-27
tieu_de: Từ yêu cầu nghiệp vụ đến yêu cầu chức năng và hạ tầng
---

Domain 2: Applications and Integration · Task 2.1

# Từ yêu cầu nghiệp vụ đến yêu cầu chức năng và hạ tầng

Đọc mục tiêu nghiệp vụ thành yêu cầu chức năng và hạ tầng, rồi đổi từng yêu cầu thành lựa chọn - model, gọi tức thì hay theo lô, nền tảng, nơi xử lý dữ liệu.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Tách một mục tiêu nghiệp vụ thành yêu cầu chức năng và yêu cầu hạ tầng có thể kiểm được
- Đổi từng yêu cầu thành lựa chọn kỹ thuật - model, streaming, Batch API, nền tảng, nơi xử lý
- Loại model hay nền tảng không đáp ứng giới hạn cứng trước khi so chất lượng
- Biết khi nào tích hợp thẳng với Claude, khi nào phải đi qua nền tảng cloud theo hợp đồng

Yêu cầu từ phía kinh doanh thường chỉ có một câu: "giúp lễ tân trả lời khách nhanh hơn". Từ câu đó tới một ứng dụng chạy được còn rất nhiều câu hỏi: nhanh là bao nhiêu giây, dữ liệu đi qua đâu, chạy trên nền tảng nào, mỗi tháng tốn bao nhiêu.

Bài này giúp bạn trả lời: làm sao đọc một mục tiêu nghiệp vụ thành các yêu cầu kỹ thuật, và mỗi yêu cầu dẫn tới lựa chọn nào khi làm với Claude?

## Ví dụ xuyên suốt: chuỗi nha khoa và tin nhắn của khách

Một chuỗi nha khoa có 12 chi nhánh nhận khoảng 2.000 tin nhắn mỗi ngày qua trang web và ứng dụng chat: hỏi giá, hỏi giờ mở cửa, xin đặt hoặc đổi lịch hẹn, gửi ảnh chụp răng hỏi có cần đến khám không. Ban giám đốc đưa ra hai mục tiêu:

1. "Lễ tân trả lời khách nhanh hơn."
2. "Mỗi sáng quản lý biết hôm qua khách phàn nàn gì nhiều nhất."

Công ty đã ký hợp đồng dùng AWS cho toàn bộ hệ thống, và bộ phận pháp chế yêu cầu dữ liệu khách không được rời khỏi hạ tầng đã ký hợp đồng.

## Bước đầu: diễn giải yêu cầu chức năng và hạ tầng

Trước khi nghĩ tới model hay prompt, hãy diễn giải những gì mục tiêu nghiệp vụ ngầm đòi hỏi. Đề thi gọi đây là yêu cầu chức năng (**functional requirements**) và yêu cầu hạ tầng (**infrastructure requirements**):

| Loại | Câu hỏi | Trong ví dụ |
| --- | --- | --- |
| Chức năng | Hệ thống làm gì, đầu vào và đầu ra ra sao, thế nào là đúng | Soạn câu trả lời cho lễ tân duyệt; đọc được ảnh; trả lịch hẹn dạng có cấu trúc để ghi vào phần mềm lịch |
| Chức năng | Nhanh bao nhiêu thì đạt | Khách đang chờ trong khung chat: chữ phải hiện trong vài giây |
| Hạ tầng | Chạy trên nền tảng nào, gọi qua đâu | Hợp đồng AWS: gọi Claude qua Amazon Bedrock |
| Hạ tầng | Dữ liệu được xử lý và lưu ở đâu | Không ra ngoài hạ tầng đã ký hợp đồng |
| Hạ tầng | Khối lượng và chi phí | 2.000 tin nhắn mỗi ngày, cao điểm giờ trưa; báo cáo đêm không cần gấp |

Mỗi dòng phải đủ cụ thể để kiểm được. "Nhanh hơn" chưa kiểm được; "chữ đầu tiên hiện trong 2 giây ở 95% lượt chat" thì kiểm được.

> **Trong đề chọn gì**
>
> Câu luyện thi: đội sản phẩm mô tả tính năng bằng lời nghiệp vụ ("agent giúp chuyên viên viết bản ghi nhớ cho khách nhanh hơn"), bạn phải đổi thành yêu cầu kỹ thuật. Bước đầu tiên là **diễn giải các yêu cầu chức năng và hạ tầng mà mục tiêu nghiệp vụ ngụ ý**. Sai: hỏi chuyên viên chỗ nào chèn được một bước soạn bằng prompt; tham khảo tính năng tương tự ở nơi khác; xem model nào có sẵn rồi chọn. Các bước đó đến sau, khi đã biết yêu cầu.

## Đổi từng yêu cầu thành lựa chọn

Khi đã có danh sách yêu cầu, mỗi yêu cầu thường chỉ thẳng vào một lựa chọn:

| Yêu cầu | Lựa chọn |
| --- | --- |
| Người dùng đang chờ, muốn thấy chữ hiện dần | Messages API với streaming |
| Khối lượng lớn, không ai chờ, xong trong ngày là được | Message Batches API: giảm 50% giá token, phần lớn lô xong trong 1 giờ, tối đa 24 giờ |
| Cần đọc ảnh, PDF | Model hỗ trợ ảnh và tài liệu; kiểm giới hạn kích thước yêu cầu |
| Câu trả lời phải đúng khuôn để máy khác đọc | Structured outputs |
| Dữ liệu phải xử lý trong nước Mỹ (Claude API) | `inference_geo: "us"`, giá nhân 1,1 với model từ thế hệ 4.6 trở đi |
| Hợp đồng bắt dùng một nền tảng cloud | Gọi Claude qua nền tảng đó, và kiểm tính năng nào nền tảng đó có |

Trong ví dụ, mục tiêu 1 dẫn tới Messages API có streaming. Mục tiêu 2 thoạt nhìn hợp với Batch API: tóm tắt 2.000 tin nhắn mỗi đêm, sáng mới cần. Nhưng ở đây yêu cầu hạ tầng chen vào. Docs của Claude in Amazon Bedrock liệt kê những thứ chưa hỗ trợ trên nền tảng này, trong đó có endpoint Message Batches, Files API, nguồn ảnh qua URL và các tool chạy phía máy chủ (code execution, web search). Vậy đội phải chọn cách khác cho báo cáo đêm, ví dụ một job gọi tuần tự có giới hạn tốc độ, và ước lại chi phí khi không có giảm giá 50%.

**Sơ đồ**
1. **Mục tiêu 1**: khách đang chờ trong khung chat **|** **Mục tiêu 2**: báo cáo đêm, không ai chờ
   ↓ _theo yêu cầu thì chọn_
2. **Messages API có streaming** **|** **Batch API, giảm 50%**
   ↓ _kiểm trên Amazon Bedrock_
3. **Dùng được** **|** **Chưa có endpoint này**: đổi sang job gọi tuần tự, ước lại chi phí

Đó là lý do nên đi từ yêu cầu hạ tầng trước: nó loại bớt lựa chọn trước khi bạn mất công so chất lượng.

**Sơ đồ**
1. **"Lễ tân trả lời khách nhanh hơn"**
   ↓ _diễn giải_
2. **Yêu cầu chức năng**: đọc ảnh, chữ hiện trong vài giây **|** **Yêu cầu hạ tầng**: hợp đồng AWS, dữ liệu không ra ngoài
   ↓ _yêu cầu hạ tầng loại bớt lựa chọn_
3. **Các lựa chọn còn lại**: gọi qua Bedrock, Messages API có streaming
   ↓ _so bằng bộ test riêng_
4. **Chọn model**: 200 tin nhắn thật, thử Haiku 5.5 và Sonnet 5.5

> **Trong đề chọn gì**
>
> Câu luyện thi: hợp đồng với AWS bắt mọi lời gọi Claude phải đi qua Amazon Bedrock; đội chưa quen ràng buộc này. Chọn **cấu hình ứng dụng gọi Claude qua đường Bedrock ngay từ đầu, giữ logic ứng dụng không phụ thuộc nhà cung cấp**. Sai: làm với Anthropic API trước rồi chuyển sau; làm hai bản song song và chọn bản nhanh hơn lúc chạy; bỏ qua điều khoản hợp đồng.

Claude in Amazon Bedrock dùng cùng dạng yêu cầu Messages API như API của Anthropic, chỉ khác endpoint, cách xác thực (thông tin đăng nhập AWS) và model ID (`anthropic.claude-sonnet-5-5` thay vì `claude-sonnet-5-5`). Phần logic còn lại của ứng dụng gần như giữ nguyên.

## Loại theo giới hạn cứng, rồi mới so chất lượng

Một số yêu cầu là giới hạn cứng: không đạt thì model hay nền tảng đó bị loại, không cần thử. Bảng so sánh model của Anthropic cho các con số cần kiểm:

| Giới hạn | Bốn model mới nhất (Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5) |
| --- | --- |
| Context window | 1 triệu token |
| Output tối đa mỗi lần gọi | 128 nghìn token |
| Độ trễ tương đối | Fable chậm nhất, Opus vừa, Sonnet nhanh, Haiku nhanh nhất |
| Giá token đầu vào / đầu ra (mỗi triệu) | Fable $10 / $50, Opus $4 / $20, Sonnet $2 / $10, Haiku từ $0,10 / $0,50 |

Với các model còn lại sau khi lọc, trang hướng dẫn chọn model khuyên dựng bộ test riêng cho đúng việc của bạn, chạy với prompt và dữ liệu thật, so độ chính xác, chất lượng và cách xử lý trường hợp khó, rồi cân với chi phí. Trong ví dụ, đội lấy 200 tin nhắn thật đã được lễ tân trả lời làm bộ test, chạy thử Haiku 5.5 và Sonnet 5.5.

> **Bẫy đề**
>
> Đừng chọn model trước rồi mới viết yêu cầu. Đáp án kiểu "xem model nào mạnh nhất rồi chọn" hay "đổi sang model nhỏ nhất cho rẻ" bỏ qua bước xác định yêu cầu, và thường sai ở chỗ không trả lời được ràng buộc mà đề nêu (thời gian, nền tảng, nơi xử lý dữ liệu).

## Tích hợp thẳng hay qua lớp trung gian

Một yêu cầu hạ tầng hay bị đặt ra mà không ai cần: "phải đổi được sang nhà cung cấp LLM khác". Lớp trừu tượng nhiều nhà cung cấp có chi phí thật: thêm một tầng phải bảo trì, và thường che mất các tính năng riêng của Claude sau một giao diện chung. Nếu không có ai yêu cầu đổi nhà cung cấp, tích hợp thẳng qua SDK của Claude là lựa chọn đơn giản hơn.

> **Bẫy đề**
>
> Câu luyện thi: mọi trường hợp dùng hiện tại và dự kiến đều chạy trên Claude, không khách hàng nội bộ nào đòi đổi được nhà cung cấp, lộ trình hai năm không nhắc chuyện này, còn lớp trừu tượng thì tốn công. Đúng là **tích hợp thẳng với Claude qua SDK**. Sai: dùng lớp trừu tượng "cho linh hoạt lâu dài"; chạy cả hai đường để so; tự viết lớp trừu tượng riêng.

1. **Hợp đồng hay chính sách bắt dùng nền tảng cụ thể?** → Gọi qua nền tảng đó, kiểm danh sách tính năng có và không có
2. **Có yêu cầu nơi xử lý dữ liệu?** → Chọn vùng xử lý phù hợp, tính thêm phụ phí nếu có
3. **Người dùng đang chờ?** → Messages API, bật streaming
4. **Khối lượng lớn, không ai chờ?** → Batch API nếu nền tảng có
- **Còn lại** → So các model còn lại bằng bộ test riêng, cân chất lượng với chi phí

> **Ý chính**
>
> Bước đầu luôn là diễn giải mục tiêu nghiệp vụ thành yêu cầu chức năng và hạ tầng đo được. Yêu cầu hạ tầng (nền tảng, nơi xử lý dữ liệu, khối lượng) loại bớt lựa chọn trước; sau đó mới so chất lượng bằng bộ test riêng.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Choosing the right model (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
3. [Models overview (Claude API Docs)](https://platform.claude.com/docs/en/models/overview)
4. [Batch processing (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
5. [Data residency (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/data-residency)
6. [Pricing (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/pricing)
7. [Claude in Amazon Bedrock (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)
8. [API and data retention (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
