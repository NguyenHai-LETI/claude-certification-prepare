---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/1-4-prompt-theo-loai-viec
ngay_tai: 2026-11-27
tieu_de: Đổi cách prompt theo loại việc
---

Domain 1 : Prompting and Task Execution·Task 1.4

# Đổi cách prompt theo loại việc

Brainstorm, nghiên cứu, phân tích và soạn thảo cần prompt khác nhau ra sao, khi nào dùng prompt mở, khi nào dùng mẫu cứng.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Hiểu vì sao một mẫu prompt cho mọi việc không cho kết quả tốt như nhau
- Prompt cho brainstorm để có nhiều phương án khác nhau mà vẫn đúng ràng buộc
- Prompt cho nghiên cứu để có nguồn và mức tin cậy, và biết khi nào bật Research
- Chọn khuôn đầu ra hợp với việc phân tích và soạn thảo

Hỏi Claude "cho tôi vài ý tưởng" và hỏi "tổng hợp số liệu đối thủ, có nguồn" là hai việc rất khác nhau. Dùng cùng một kiểu prompt cho cả hai thì ít nhất một việc sẽ ra kết quả kém.

Bài này giúp bạn trả lời: mỗi loại việc (phân tích, nghiên cứu, soạn thảo, brainstorm) cần prompt thế nào?

## Ví dụ xuyên suốt: món mới mùa hè của chuỗi trà sữa

Nhóm sản phẩm của một chuỗi trà sữa 30 cửa hàng chuẩn bị ra món mùa hè. Trong hai tuần, họ cần Claude giúp bốn việc:

1. **Brainstorm** tên và ý tưởng món, mỗi món hợp với một trong ba mức giá đã định.
2. **Nghiên cứu** các chuỗi khác đang bán món mùa hè gì, giá bao nhiêu.
3. **Phân tích** doanh số mùa hè năm ngoái của 30 cửa hàng.
4. **Soạn** bài đăng ra mắt món mới trên fanpage.

Một bạn trong nhóm có sẵn một mẫu prompt dùng cho mọi việc: "Bạn là chuyên gia F&B. Hãy viết một báo cáo chuyên nghiệp về…". Mẫu này hợp với việc thứ ba, nhưng làm hỏng việc thứ nhất và thứ tư.

## Mỗi loại việc một cách prompt

| Loại việc | Prompt nên nhấn vào | Khuôn đầu ra hợp | Tính năng hỗ trợ |
|---|---|---|---|
| Brainstorm | Nhiều phương án **khác hẳn nhau**, ràng buộc rõ, chưa chốt | Danh sách phương án kèm đánh đổi | Chat thường |
| Nghiên cứu | Câu hỏi nghiên cứu cụ thể, đòi nguồn và mức tin cậy | Bảng phát hiện, mỗi dòng có nguồn | Web search, Research |
| Phân tích | Dữ liệu đầy đủ, chỉ số cần tính, cách so sánh | Bảng, biểu đồ | Code execution, tải file |
| Soạn thảo | Người đọc, giọng, độ dài, bố cục từng phần | Văn bản theo bố cục đã định | Artifact nếu cần sửa nhiều lần |

> Bẫy đề
>
> Câu luyện thi: một thành viên dùng cùng một mẫu prompt cho mọi loại việc. Các đáp án sai khen thói quen đó: "một mẫu bảo đảm chất lượng đồng đều", "đổi cách prompt chỉ phí thời gian", "loại việc không ảnh hưởng tới cách prompt". Đáp án đúng: **cách prompt nên đổi theo loại việc**, vì một mẫu không cho kết quả tốt như nhau ở mọi việc.

## Brainstorm: rộng nhưng vẫn đúng ràng buộc

Giai đoạn brainstorm cần độ rộng. Đừng để Claude chốt sớm một phương án: xin **nhiều phương án khác nhau, mỗi phương án nêu đánh đổi**, và nói rõ vòng này chưa cần đề xuất phương án nào tốt nhất. Việc so và chọn để sang buổi sau, khi cả nhóm cùng xem.

Nếu ý tưởng phải nằm trong ràng buộc (mức giá, đối tượng khách), hãy ghi ràng buộc thẳng vào prompt và **bắt mỗi ý tự ghi nó thuộc ràng buộc nào**. Như vậy bạn kiểm được ngay ý nào lạc đề.

```
Đề xuất 10 món mùa hè khác hẳn nhau cho chuỗi trà sữa.
Ba mức giá: dưới 35.000đ, 35.000–50.000đ, trên 50.000đ.
Mỗi món ghi: tên món, thuộc mức giá nào, khách chính là ai,
và một điểm yếu của món đó. Chưa cần chọn món tốt nhất.
```

> Bẫy đề
>
> Câu luyện thi brainstorm có ràng buộc (10 ý tưởng, ba mức ngân sách) có ba đáp án sai:
>
> - Xin 10 ý không ràng buộc, rồi lọc sau. Sai vì có thể lọc xong chẳng còn mấy ý dùng được.
> - Xin 30 ý có ràng buộc, rồi giữ 10 ý mạnh nhất "cho có nhiều lựa chọn". Sai vì đề cần 10 ý đúng ràng buộc, không cần thêm việc lọc.
> - Nêu ràng buộc người nghe nhưng bỏ ngân sách "để khỏi bó sáng tạo".
>
> Đáp án đúng: **nêu đủ ràng buộc trong prompt và bắt mỗi ý tự ghi nhãn** người nghe và mức ngân sách.

## Nghiên cứu: câu hỏi rõ, có nguồn, có mức tin cậy

Yêu cầu mơ hồ như "xem giá của mình thế nào" cần làm rõ trước. Khi đã rõ việc là **tổng hợp giá của đối thủ để nhóm ra quyết định**, cách hợp nhất là nghiên cứu có cấu trúc: gom thông tin theo cùng một khung, **ghi nguồn** từng phát hiện và **ghi mức tin cậy** của từng phát hiện. Brainstorm hay trò chuyện mở để "cấu trúc tự hiện ra" đều không hợp.

Trong app Claude có hai tính năng tìm thông tin, dùng cho hai cỡ việc khác nhau:

- **Web search** hợp với câu hỏi đơn giản, cần thông tin mới, trả lời được bằng một hai lượt tìm.
- **Research** hợp với việc gom thông tin toàn diện: Claude chạy nhiều lượt tìm nối tiếp nhau (thường từ năm lượt trở lên, trong vài phút), đi qua web và các connector bạn đã bật, rồi viết báo cáo dài có trích dẫn. Research chỉ có trên gói trả phí và cần bật web search trước.

Việc thứ hai của nhóm trà sữa (so món mùa hè và giá của nhiều chuỗi) là việc của Research.

```
Dùng Research. Câu hỏi: 5 chuỗi trà sữa lớn ở TP.HCM đang bán món mùa hè nào, giá bao nhiêu?
Trình bày thành bảng: chuỗi, tên món, giá, ngày ra mắt, nguồn.
Thêm cột độ tin cậy (cao, vừa, thấp) và lý do,
ví dụ giá lấy từ trang chính thức hay từ bài đăng của khách.
```

## Phân tích và soạn thảo: chọn đúng khuôn đầu ra

**Phân tích** dữ liệu có nhiều bản ghi thì khuôn đầu ra nên là bảng: mỗi bản ghi một dòng, mỗi chỉ số một cột. Viết thành đoạn văn theo từng vùng nghe hay nhưng người đọc không so được. Với phép tính chính xác trên file dữ liệu, bật code execution để Claude tính bằng code thay vì nhẩm (bài 3.1). Khi tài liệu đưa vào rất dài, tài liệu prompting của Anthropic khuyên để tài liệu ở trên, câu hỏi ở cuối, và nhờ Claude trích những câu liên quan trước khi trả lời.

**Soạn thảo** thì ngược lại: hãy nói rõ bố cục từng phần. Với bài đăng ra mắt món mới:

```
Viết bài đăng fanpage ra mắt món mới, cho khách 18–25 tuổi.
Thứ tự: 1) câu mở gây tò mò; 2) ba điểm hấp dẫn của món;
3) giá và ngày bán; 4) lời kêu gọi ghé cửa hàng gần nhất.
Dưới 120 chữ, giọng vui, tối đa hai emoji.
```

> Trong đề chọn gì
>
> Đề hỏi ghép cách prompt với loại việc:
>
> - **Mẫu cứng** (*rigid templated prompting*) hợp với báo cáo định kỳ theo một khuôn cố định, như báo cáo tuân thủ hằng tháng.
> - **Prompt mở để khám phá** (*open exploratory prompting*) hợp với brainstorm giai đoạn đầu, như chiến lược cho thị trường mới.
>
> Ghép sai thường gặp: mẫu cứng cho việc đặt tên, viết slogan; mẫu cứng cho việc tóm tắt góp ý không có khuôn; prompt mở cho việc sửa hợp đồng theo thư viện điều khoản.

1. Cần nhiều ý, chưa cần chọn?Prompt mở, xin phương án khác nhau kèm đánh đổi
2. Cần thông tin bên ngoài, có nguồn?Câu hỏi nghiên cứu rõ, bật web search hoặc Research
3. Cần tính toán, so sánh số liệu?Đưa dữ liệu, xin bảng, bật code execution
4. Kết quả đi theo khuôn cố định?Dùng mẫu cứng
5. Còn lạiSoạn văn bản: nêu người đọc, giọng, độ dài và bố cục từng phần

> Ý chính
>
> Không có một prompt dùng cho mọi việc. Brainstorm cần rộng và chưa chốt; nghiên cứu cần nguồn và mức tin cậy; phân tích cần bảng và phép tính đúng; soạn thảo cần bố cục rõ cho người đọc cụ thể.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 1(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [When should I use web search, extended thinking, and research? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11095361-when-should-i-use-web-search-extended-thinking-and-research)
3. [Use research on Claude (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/11088861-use-research-on-claude)
4. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
