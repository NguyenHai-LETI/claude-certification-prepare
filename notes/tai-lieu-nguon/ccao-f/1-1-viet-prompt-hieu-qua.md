---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/1-1-viet-prompt-hieu-qua
ngay_tai: 2026-11-27
tieu_de: Viết prompt hiệu quả cho việc kinh doanh và kỹ thuật
---

Domain 1 : Prompting and Task Execution·Task 1.1

# Viết prompt hiệu quả cho việc kinh doanh và kỹ thuật

Một prompt tốt gồm những phần nào, vì sao phải viết như đang giao việc cho người mới, và cách biến một yêu cầu viết vội thành prompt có cấu trúc.

- 9 phút đọc
- Đối chiếu docs 07/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Viết prompt nêu rõ việc cần làm, người đọc, dữ kiện, ràng buộc và khuôn đầu ra
- Hiểu Description trong khung AI Fluency và ba phần Product, Process, Performance
- Biến một yêu cầu viết vội thành prompt có cấu trúc theo đúng thứ tự
- Nhận ra những thứ thêm vào prompt mà không giúp gì

Cùng một việc, có người nhận về bản nháp dùng được ngay, có người phải sửa gần hết. Phần lớn khác biệt nằm ở prompt: Claude chỉ biết những gì bạn viết ra.

Bài này giúp bạn trả lời: một prompt tốt cho công việc gồm những gì, và viết nó theo thứ tự nào?

## Ví dụ xuyên suốt: lịch trực Tết của chuỗi phòng khám nha khoa

Chị Hạnh là trưởng nhóm vận hành của một chuỗi phòng khám nha khoa có năm chi nhánh. Giám đốc dán lên màn hình chị một tờ giấy nhớ: "Gửi anh em lịch trực Tết nhé." Chị mở Claude và gõ đúng câu đó.

Claude trả về một thông báo chung chung, giọng trang trọng, không có ngày cụ thể, không nói ai trực chi nhánh nào. Không có gì sai, nhưng cũng không dùng được.

## Viết như đang giao việc cho người mới

Trang hỗ trợ của Claude khuyên coi Claude như một người mới được thuê: giỏi, nhưng không biết gì về bạn, về việc bạn đang làm hay về tổ chức của bạn. Tài liệu prompting của Anthropic có một phép thử dễ nhớ: đưa prompt cho một đồng nghiệp chưa biết gì về việc này và nhờ họ làm theo. Nếu họ bối rối thì Claude cũng sẽ bối rối.

Với câu "Gửi anh em lịch trực Tết", một nhân viên mới sẽ phải hỏi lại ngay: gửi cho ai, qua kênh nào, trực những ngày nào, ai trực ở đâu, viết dài hay ngắn? Claude không hỏi lại mà tự đoán, nên kết quả chung chung.

> Ý chính
>
> Claude không tự biết bối cảnh của bạn. Phần nào bạn không nói, Claude sẽ tự đoán, và đoán thì thường ra kết quả chung chung.

## Một prompt tốt gồm những phần nào

| Phần | Câu hỏi nó trả lời | Trong ví dụ |
|---|---|---|
| Việc cần làm | Claude phải làm ra cái gì? | Soạn tin nhắn thông báo lịch trực Tết |
| Người đọc và mục đích | Ai đọc, đọc xong họ cần làm gì? | 40 nhân viên lễ tân và phụ tá; cần biết mình trực ngày nào, ở đâu, đổi ca thì báo ai |
| Dữ kiện | Claude cần những thông tin gì mà nó không thể tự biết? | Bảng phân ca, ngày nghỉ, số điện thoại người phụ trách |
| Ràng buộc | Điều gì bắt buộc hoặc không được làm? | Không nêu lương trực trong tin chung; hạn đổi ca trước 20 tháng Chạp |
| Khuôn đầu ra | Trông nó ra sao: độ dài, giọng, bố cục? | Tin nhắn nhóm dưới 150 chữ, giọng thân thiện, chia theo chi nhánh |

Trong đề thi, hai phần cốt lõi của một prompt có cấu trúc cho việc kinh doanh là **nêu rõ việc mô hình phải làm** (*a clear statement of the task*) và **ngữ cảnh liên quan như người đọc và mục tiêu** (*relevant context such as the audience and the goal*).

Tài liệu của Anthropic còn mấy mẹo nhỏ mà hiệu quả:

- **Nói lý do.** "Tin này đọc trên điện thoại khi đang làm việc nên cần ngắn" giúp Claude hiểu mục đích và tự áp dụng đúng cho cả những chỗ bạn không dặn.
- **Nói điều cần làm thay vì điều cấm.** "Viết thành các đoạn ngắn" hiệu quả hơn "đừng dùng gạch đầu dòng".
- **Bước nào cần đúng thứ tự thì đánh số.** Khi thứ tự hay sự đầy đủ của các bước quan trọng, viết chúng thành danh sách đánh số.
- **Có ví dụ thì đưa ví dụ.** Ví dụ là một trong những cách đáng tin nhất để Claude theo đúng giọng và bố cục. Tài liệu khuyên dùng 3–5 ví dụ, sát với việc thật và đủ khác nhau.
- **Tách rõ các phần.** Khi prompt có cả chỉ dẫn, tài liệu và ví dụ, đặt tiêu đề hoặc thẻ cho từng phần để Claude không nhầm đâu là lệnh, đâu là dữ liệu.

Prompt của chị Hạnh sau khi viết lại:

```
Bạn soạn giúp tôi tin nhắn thông báo lịch trực Tết gửi vào nhóm chat nhân viên.

Người đọc: 40 lễ tân và phụ tá ở năm chi nhánh. Họ đọc trên điện thoại
giữa giờ làm, nên tin cần ngắn và tìm được tên mình nhanh.

Dữ kiện: bảng phân ca dán bên dưới. Đổi ca thì báo chị Hạnh (0903 xxx xxx).

Ràng buộc: không nêu tiền trực trong tin chung. Hạn xin đổi ca: 20 tháng Chạp.

Khuôn: dưới 150 chữ, giọng thân thiện, chia theo chi nhánh,
mỗi chi nhánh một dòng gồm ngày trực và tên người trực.

<bảng phân ca>
...
</bảng phân ca>
```

> Bẫy đề
>
> Câu luyện thi hỏi hai thành phần nên có trong prompt cho việc kinh doanh. Các đáp án sai nghe rất "thân thiện": thêm chỉ dẫn giọng vui vẻ cho dễ gần, thêm một mẩu chuyện cá nhân cho prompt bớt khô, dán cả danh mục sản phẩm của công ty "cho Claude có bối cảnh". Không cái nào giúp Claude biết phải làm gì, cho ai. Ngữ cảnh tốt là ngữ cảnh **liên quan** đến việc, không phải càng nhiều càng tốt.

## Description trong khung AI Fluency

Anthropic cùng hai giáo sư Rick Dakan và Joseph Feller có một khoá học miễn phí tên AI Fluency, xây quanh bốn năng lực khi làm việc với AI, gọi là **4D**: Delegation (quyết định giao gì cho AI), Description (nói cho AI biết mình cần gì), Discernment (đánh giá cái AI trả về) và Diligence (chịu trách nhiệm về kết quả). Đề CCAO-F hay nhắc tên bốn năng lực này.

Viết prompt chính là **Description**. Khoá học chia nó thành ba phần:

| Phần | Bạn mô tả | Trong ví dụ |
|---|---|---|
| **Product Description** | Sản phẩm cuối: là gì, cho ai, khuôn và giọng ra sao | Tin nhắn dưới 150 chữ, thân thiện, chia theo chi nhánh |
| **Process Description** | Cách làm: các bước Claude nên đi qua | Đọc bảng phân ca, gom theo chi nhánh, rồi mới viết tin |
| **Performance Description** | Cách Claude cư xử khi làm việc cùng bạn | "Chỗ nào bảng phân ca thiếu tên thì hỏi tôi, đừng tự điền" |

> Trong đề chọn gì
>
> Đề hỏi cách sửa một prompt kém "theo đúng Description": chọn đáp án **nêu rõ phạm vi việc, khuôn đầu ra, người đọc và các ràng buộc** đủ để lần chạy sau ra kết quả dùng được. Các đáp án sai thì làm ngược lại: thêm chữ độn mà không lấp chỗ thiếu, bỏ hết ngữ cảnh chỉ để lại một câu yêu cầu trơn, hoặc thay chỉ dẫn cụ thể bằng câu chung chung.

## Từ yêu cầu viết vội đến prompt có cấu trúc

Tờ giấy nhớ "Gửi anh em lịch trực Tết" là kiểu yêu cầu bạn sẽ gặp hằng ngày. Thứ tự hợp lý để biến nó thành prompt:

1. Đã biết việc thật sự là gì chưa?Đọc kỹ câu chữ vắn tắt, tìm ra sản phẩm cần làm
2. Đã biết ai đọc và họ dùng nó để làm gì chưa?Xác nhận người đọc và quyết định cần hỗ trợ
3. Đã có dữ kiện và ràng buộc chưa?Gom đúng những gì liên quan tới việc này
4. Đã nói độ dài, giọng, khuôn chưa?Ghi rõ khuôn đầu ra
5. Còn lạiGửi prompt cho Claude

Thứ tự này có lý do: phải biết việc là gì mới biết ai đọc; phải biết ai đọc mới chọn đúng dữ kiện đưa vào; có đủ những thứ đó rồi mới chọn được độ dài và giọng hợp lý.

> Bẫy đề
>
> Câu luyện thi xếp thứ tự các bước biến giấy nhớ thành prompt. Đáp án sai hay gặp là bắt đầu bằng "xác nhận người đọc" trước khi hiểu việc là gì, hoặc đưa dữ kiện vào trước khi biết người đọc cần quyết định gì. Đáp án đúng: **tìm việc thật sự → xác nhận người đọc và quyết định → dữ kiện, ràng buộc → độ dài, giọng, khuôn → gửi**.

Một chỗ nữa đề hay bẫy: khi có sẵn tài liệu cũ, như bản tin quý trước mà cả nhóm thích, đừng chỉ đính kèm rồi bảo Claude "làm giống vậy". Claude sẽ chép cả bố cục, độ dài, thậm chí thông điệp cũ. Hãy tự nêu người đọc, độ dài, giọng và thông điệp chính, và nói rõ tài liệu cũ **chỉ dùng làm mẫu giọng**.

## Prompt cho việc kỹ thuật

Đề thi nói tới prompt cho cả việc kinh doanh lẫn việc kỹ thuật (*business and technical tasks*). Người thi CCAO-F không viết phần mềm, nhưng vẫn hay nhờ Claude viết công thức bảng tính, câu lệnh lọc dữ liệu hay một đoạn mã nhỏ. Nguyên tắc giữ nguyên, chỉ có dữ kiện cần chính xác hơn:

- Tên thật của cột, sheet, file ("cột C là ngày trực, cột D là mã chi nhánh").
- Công cụ và phiên bản đang dùng (Excel hay Google Sheets).
- Vài dòng dữ liệu mẫu và kết quả bạn mong đợi cho các dòng đó.

```
Viết công thức Google Sheets đếm số ca trực của từng người.
Sheet "PhanCa": cột B là tên, cột C là ngày, mỗi dòng một ca.
Ví dụ: Lan có 3 dòng thì kết quả cho Lan là 3.
```

> Ý chính
>
> Prompt tốt là prompt mà một đồng nghiệp chưa biết gì đọc xong làm được ngay: nói việc, người đọc, dữ kiện, ràng buộc và khuôn đầu ra, kèm lý do khi cần.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 1(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
3. [Introduction to prompt design (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/7996853-introduction-to-prompt-design)
4. [My prompt isn't giving me a helpful answer (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer)
5. [AI Fluency, Framework and Foundations (Claude Academy)(mở tab mới)](https://academy.claude.com/courses/ai-fluency-framework-foundations)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
