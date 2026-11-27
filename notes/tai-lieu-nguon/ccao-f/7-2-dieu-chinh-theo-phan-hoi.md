---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/7-2-dieu-chinh-theo-phan-hoi
ngay_tai: 2026-11-27
tieu_de: Điều chỉnh cách làm theo phản hồi và kết quả
---

Domain 7 : Troubleshooting and Optimization·Task 7.2

# Điều chỉnh cách làm theo phản hồi và kết quả

Biến phản hồi thành thay đổi có chủ đích qua từng vòng, xử lý phản hồi mơ hồ, giữ yêu cầu bằng văn bản để sửa không phá chỗ cũ, và báo lỗi cho Anthropic.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Chạy một vòng phản hồi và điều chỉnh theo đúng thứ tự
- Biến phản hồi mơ hồ thành ví dụ cụ thể trước khi sửa
- Ghi yêu cầu ra để mỗi lần sửa không phá lại chỗ đã sửa
- Quay về bản tốt nhất khi càng sửa càng lệch, và báo lỗi bằng nút không thích

Một quy trình dùng Claude hiếm khi đúng ngay từ tuần đầu. Người dùng sẽ góp ý, có góp ý rõ ràng, có góp ý chỉ là "chưa ổn lắm". Biết biến những góp ý đó thành thay đổi có tác dụng là thứ làm quy trình tốt dần lên thay vì cứ sửa vòng quanh.

Bài này giúp bạn trả lời: dùng phản hồi để cải thiện qua từng vòng thế nào, và làm gì khi phản hồi mơ hồ?

## Ví dụ xuyên suốt: bản bàn giao ca ở công trường

Anh Toàn là điều phối viên ở một công trường xây dựng. Mỗi cuối ca, Claude tóm tắt nhật ký ca thành **bản bàn giao** cho ca sau: việc đã xong, việc đang dở, rủi ro còn mở (giàn giáo chưa kiểm, vật tư thiếu…). Sau hai tuần:

- Vài kỹ sư nói bản bàn giao "bỏ sót rủi ro còn mở", nhưng không ai nói rủi ro nào, ca nào.
- Ba trong tám người dùng thử nói kết quả "chưa ổn lắm", không nói gì thêm.
- Sau tám lượt sửa prompt, sửa lỗi mới thì lỗi cũ từ ba lượt trước lại quay về.

## Một vòng phản hồi và điều chỉnh

Phản hồi có ích khi nó **cụ thể**, được ghi lại **sau mỗi lần chạy**, rồi **biến thành thay đổi có chủ đích** trong prompt hay quy trình, và bạn **xem các lần chạy sau có tốt hơn không**. Gom nhận xét chung chung rồi viết lại cả prompt, đợi nhiều lần chạy mới ghi nhận, hay chỉ chấm một điểm tổng mỗi lần đều làm mất chi tiết cần để sửa.

Thứ tự một vòng hằng tuần:

1. 1**Ghi lại phản hồi cụ thể nhận được trong tuần**
2. 2**Biến thành một hai điều chỉnh có chủ đích cho vòng sau**
3. 3**Chạy vòng sau, so với vòng trước**
4. 4**Ghi lại đã đổi gì, tác dụng ra sao, còn gì chưa xong**

↻Quyết: làm tiếp, đổi cách, hay báo lên

Mỗi vòng chỉ một hai điều chỉnh, để biết điều chỉnh nào có tác dụng (bài 1.3).

> Bẫy đề
>
> Câu luyện thi xếp năm bước của vòng phản hồi hằng tuần. Đáp án sai hay gặp: chạy vòng sau trước khi ghi phản hồi; điều chỉnh trước khi ghi lại phản hồi cụ thể. Đáp án đúng: **ghi phản hồi cụ thể → biến thành một hai điều chỉnh → chạy và so với vòng trước → ghi đã đổi gì và tác dụng → quyết làm tiếp, đổi cách hay báo lên**.

## Phản hồi mơ hồ: xin ví dụ trước khi sửa

"Chưa ổn lắm" và "bỏ sót rủi ro" chưa đủ để sửa. Việc **đầu tiên** là biến chúng thành ví dụ cụ thể:

- Hỏi người góp ý **ví dụ cụ thể: kết quả đã viết gì, và lẽ ra phải viết gì**.
- Với "bỏ sót rủi ro": xin **hai bản bàn giao bị sót, kèm tên rủi ro bị sót**, rồi **so hai bản đó với nhật ký ca** để thấy chính xác cái gì bị bỏ.

So xong, anh Toàn thấy hai rủi ro bị sót đều được ghi ở cuối nhật ký, dưới mục "ghi chú khác". Nguyên nhân gốc nằm ở đó: prompt chỉ bảo Claude lấy rủi ro ở mục "Rủi ro". Sửa đúng chỗ này hiệu quả hơn nhiều so với viết lại chỉ dẫn chung chung kiểu "rủi ro là quan trọng nhất".

> Bẫy đề
>
> Câu luyện thi về bản bàn giao ca "bỏ sót rủi ro" có ba đáp án sai:
>
> - Bảo mọi người chấm điểm 10 mỗi bản từ nay để theo dõi xu hướng. Điểm số không nói rủi ro nào bị sót.
> - Đổi bản bàn giao sang dạng bảng "cho dễ thấy". Đoán nguyên nhân, chưa có bằng chứng.
> - Viết lại ngay chỉ dẫn chung của Project để nhấn mạnh rủi ro. Sửa khi chưa biết sai ở đâu.
>
> Đáp án đúng: **xin hai bản bị sót, có nêu tên rủi ro**, và **so với nhật ký ca để thấy chính xác cái gì bị bỏ**. Với câu tám người thử, ba người nói "chưa ổn lắm": việc đầu tiên là **hỏi ba người đó ví dụ cụ thể**, không phải dừng thử nghiệm, hỏi năm người hài lòng, hay tự đoán rồi viết lại chỉ dẫn.

## Ghi yêu cầu ra, và biết quay về bản tốt nhất

Sau tám lượt sửa, sửa lỗi mới lại làm lỗi cũ quay về. Rủi ro lớn nhất ở đây không phải prompt dài dòng hay câu chữ kém tự nhiên, mà là **không có văn bản ghi kết quả phải đáp ứng những gì**: mỗi lượt sửa có thể phá chỗ đã sửa trước đó mà không ai nhận ra.

Cách khắc phục: ghi danh sách yêu cầu (bản bàn giao phải có những mục nào, rủi ro lấy từ đâu, dài bao nhiêu), và sau mỗi lượt sửa, kiểm lại **cả danh sách**, không chỉ lỗi vừa sửa.

Nếu càng sửa kết quả càng xa khuôn mong muốn, **quay về phiên bản prompt cho kết quả gần đúng nhất và sửa tiếp từ đó**. Vì vậy hãy giữ lại các phiên bản prompt cùng ghi chú tác dụng của từng bản. Dừng lại chấp nhận bản lệch nhất, tiếp tục đổi nhiều thứ cùng lúc chờ may mắn, hay bỏ hết các bản cũ đều là cách xử lý sai.

## Báo lỗi cho Anthropic

Khi Claude trả lời sai rõ ràng, ví dụ nói sai về chính tổ chức của bạn, bạn tự sửa bản nháp của mình. Nếu muốn lỗi đó **được ghi nhận** để Anthropic cải thiện, bấm **nút không thích (thumbs down) trên đúng câu trả lời có lỗi**, như trang hỗ trợ về câu trả lời sai hướng dẫn. Viết thêm một dòng "câu trước sai" trong cuộc chat chỉ sửa cuộc chat đó; viết lại prompt mạnh tay hơn hay mở chat mới thì không báo được cho ai.

Cần biết: khi gửi phản hồi bằng nút thích hoặc không thích, toàn bộ cuộc chat liên quan được lưu tới 5 năm. Trên gói Team và Enterprise, chủ tổ chức có thể tắt tính năng đánh giá này cho cả tổ chức; nếu không thấy nút, đó có thể là lý do.

> Trong đề chọn gì
>
> Đề hỏi cách dùng phản hồi để cải thiện dần: chọn **ghi phản hồi cụ thể sau mỗi lần chạy, biến thành thay đổi có chủ đích, xem các lần sau có tốt hơn**. Đề hỏi muốn lỗi của Claude được ghi nhận: chọn **bấm nút không thích trên câu trả lời có lỗi**, cùng với việc tự sửa bản nháp.

1. Phản hồi mơ hồ?Xin ví dụ cụ thể, so với nguồn
2. Đã có phản hồi cụ thể?Biến thành một hai điều chỉnh, chạy và so với vòng trước
3. Sửa xong lỗi cũ lại quay về?Ghi danh sách yêu cầu, kiểm cả danh sách mỗi lượt
4. Càng sửa càng lệch?Quay về bản prompt gần đúng nhất
5. Còn lạiVài vòng không tiến bộ: đổi cách làm hoặc báo lên

> Ý chính
>
> Phản hồi phải cụ thể mới sửa được: xin ví dụ, so với nguồn, mỗi vòng một hai điều chỉnh, ghi lại tác dụng. Giữ danh sách yêu cầu và các phiên bản prompt để không sửa vòng quanh.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 7(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Claude is providing incorrect or misleading responses (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)
3. [Is my data used for model training? Commercial (Anthropic Privacy Center)(mở tab mới)](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)
4. [Manage user feedback settings on Team and Enterprise plans (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/10504844-manage-user-feedback-settings-on-team-and-enterprise-plans)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
