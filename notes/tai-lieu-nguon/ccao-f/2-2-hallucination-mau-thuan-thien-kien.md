---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/2-2-hallucination-mau-thuan-thien-kien
ngay_tai: 2026-11-27
tieu_de: Nhận ra hallucination, mâu thuẫn và thiên kiến
---

Domain 2 : Output Evaluation and Validation·Task 2.2

# Nhận ra hallucination, mâu thuẫn và thiên kiến

Hallucination hay nằm ở đâu, vì sao giọng chắc chắn không phải tín hiệu, cách bắt mâu thuẫn, và sửa câu khái quát hoá về một nhóm người.

- 7 phút đọc
- Đối chiếu docs 07/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Biết hallucination là gì và những chỗ nó hay xuất hiện
- Phân biệt nghe hợp lý với đã kiểm chứng
- Nhận ra mâu thuẫn trong kết quả và loại mâu thuẫn nghiêm trọng nhất
- Nhận ra thiên kiến và sửa đúng cách, không chỉ thêm câu miễn trừ
- Viết prompt giảm hallucination ngay từ đầu

Claude có thể viết ra một số hiệu điều khoản, một con số thống kê hay một câu trích dẫn trông rất thật mà không hề có thật. Lỗi kiểu này không lộ ra khi đọc lướt, vì câu văn vẫn trôi chảy và giọng vẫn chắc chắn.

Bài này giúp bạn trả lời: hallucination, mâu thuẫn và thiên kiến trong kết quả trông ra sao, và gặp thì làm gì?

## Ví dụ xuyên suốt: bản tin học bổng của trung tâm tư vấn du học

Chị Thư làm ở một trung tâm tư vấn du học, nhờ Claude soạn bản tin tháng về học bổng thạc sĩ ở ba nước. Bản nháp có:

- Hạn nộp hồ sơ của một học bổng là "15/02/2027, theo điều 4.2 quy chế học bổng".
- Một đường link tới trang học bổng, bấm vào thì không mở được.
- Câu cuối: "Tôi đã gửi bản tin này tới danh sách học viên."
- Đoạn đầu nói học bổng trị giá 15.000 euro, đoạn sau ghi 12.000 euro.
- Một câu: "Sinh viên từ các tỉnh thường yếu tiếng Anh nên ít khi đạt học bổng này."

Năm chỗ, mỗi chỗ một kiểu lỗi.

## Hallucination là gì

Trang hỗ trợ của Claude gọi hiện tượng Claude đưa ra thông tin sai hoặc gây hiểu nhầm là **hallucination**. Đó là giới hạn hiện nay của các model AI tạo sinh, không phải lỗi hiếm gặp. Claude có thể trích những câu nghe rất có thẩm quyền mà không dựa trên sự thật nào. Trang hỗ trợ khuyên đừng coi Claude là nguồn sự thật duy nhất, và phải soi kỹ mọi lời khuyên quan trọng.

Hallucination hay nằm ở những chỗ **cụ thể và nghe đáng tin**:

| Loại | Trong ví dụ |
|---|---|
| Số hiệu, trích dẫn, điều khoản | "Điều 4.2 quy chế học bổng" |
| Ngày tháng, con số | Hạn nộp 15/02/2027 |
| Đường link, tên tài liệu | Link không mở được |
| Khả năng mà Claude không có | "Tôi đã gửi bản tin tới học viên" |
| Sự kiện gần đây | Thay đổi sau thời điểm model được huấn luyện |

Hai chỗ cuối có lý do riêng. Trang hỗ trợ nói Claude đôi khi "tưởng tượng" ra khả năng của mình: nó không gửi được email hay truyền file nếu công cụ đó chưa được kết nối, dù nó nói là đã làm. Còn mỗi model có một mốc dữ liệu huấn luyện (các model 5.5 là tháng 6/2026), nên chuyện xảy ra sau mốc đó Claude có thể không biết, trừ khi bạn bật web search.

## Giọng chắc chắn không phải tín hiệu

Câu hỏi mẫu đầu tiên trong tài liệu chính thức của đề thi: Claude tóm tắt một quy định mới, rất tự tin, có dẫn số tiểu mục cụ thể. Trước khi gửi cho phòng tuân thủ thì làm gì? Đáp án: **kiểm số tiểu mục đó với văn bản quy định chính thức**. Đáp án sai: gửi luôn vì Claude rất tự tin; hỏi Claude tự chấm độ tự tin rồi gửi nếu cao; sửa câu chữ cho trang trọng rồi gửi. Lời giải thích nói rõ: độ tự tin Claude tự báo không phải là thước đo độ chính xác.

Câu hỏi dùng để tách **nghe hợp lý** khỏi **đã kiểm chứng** rất đơn giản: *từng khẳng định cụ thể có truy được về một nguồn đáng tin hoặc về tài liệu bạn đưa vào không?* Câu kiểu "đây là chuẩn ngành ai cũng biết" mà không nêu nguồn thì coi là **chưa kiểm**: tìm nguồn có thẩm quyền, hoặc bỏ đi.

> Bẫy đề
>
> Câu luyện thi: nghi kết quả có hallucination, việc **đầu tiên** là gì? Đáp án sai: ghi vào sổ rủi ro của nhóm; bỏ cả kết quả rồi chạy lại prompt mới; thông báo cho người dùng. Đáp án đúng: **chỉ ra đúng khẳng định nào không có căn cứ**. Chưa biết sai ở đâu thì không sửa được, cũng không báo được cho ai.

## Mâu thuẫn trong kết quả

Mâu thuẫn là khi chính kết quả nói hai điều không khớp nhau: 15.000 euro ở đoạn đầu, 12.000 euro ở đoạn sau. Ít nhất một trong hai là sai, và bạn phải về nguồn mới biết cái nào.

Không phải mâu thuẫn nào cũng nặng như nhau:

| Mâu thuẫn | Mức độ |
|---|---|
| **Kết luận chính trái với bằng chứng trong bài** | Nặng nhất: người đọc không biết tin vào đâu |
| Hai đoạn cùng nói một ý nhưng dùng thuật ngữ khác nhau | Gây rối, cần sửa |
| Một tiêu đề phụ ngắn hơn các tiêu đề khác, lỗi trình bày | Nhẹ, không ảnh hưởng nội dung |

Tài liệu giảm hallucination của Anthropic có một mẹo dựa trên mâu thuẫn: chạy cùng một prompt vài lần rồi so. Kết quả giữa các lần mà khác nhau là dấu hiệu có hallucination. Nhưng điều ngược lại không đúng: hai lần ra **giống nhau** không chứng minh là đúng. Muốn biết đúng thì vẫn phải về nguồn.

## Thiên kiến

Thiên kiến (**bias**) là khi kết quả nghiêng về một phía mà không có cơ sở, hay gặp nhất là câu khái quát hoá về một nhóm người: "sinh viên từ các tỉnh thường yếu tiếng Anh". Câu đó không đúng với từng người, và nếu đi vào bản tin thì làm tổn thương đúng những người trung tâm muốn tư vấn.

Cách sửa đúng là viết lại theo **hành vi hoặc dữ kiện quan sát được** (ví dụ "học bổng yêu cầu IELTS 6.5, mỗi kỹ năng từ 6.0"), rồi **kiểm lại bằng dữ liệu thật** nếu muốn nói gì về một nhóm.

> Bẫy đề
>
> Câu luyện thi: Claude viết mô tả nhóm khách hàng có một câu khái quát về hành vi mua của một nhóm nhân khẩu học. Ba cách xử lý sai:
>
> - Thêm câu miễn trừ "có thể không đúng với mọi người" mà giữ nguyên nội dung.
> - Bỏ toàn bộ phần mô tả nhóm khách vì "cứ dính tới nhân khẩu học là có vấn đề".
> - Giữ nguyên vì chỉ dùng nội bộ.
>
> Đáp án đúng: **viết lại theo hành vi quan sát được, rồi kiểm bằng dữ liệu khách hàng thật**.

## Giảm hallucination ngay từ prompt

Tài liệu "Reduce hallucinations" của Anthropic có ba cách cơ bản, dùng được ngay trong chat:

- **Cho phép Claude nói "tôi không biết".** Cho phép rõ ràng việc thừa nhận không chắc giảm đáng kể thông tin sai.
- **Trích nguyên văn trước, phân tích sau.** Với tài liệu dài, nhờ Claude trích đúng những câu liên quan trước, rồi chỉ dựa vào các câu đó để trả lời.
- **Dẫn nguồn cho từng khẳng định.** Nhờ Claude tìm câu trích hỗ trợ cho từng khẳng định; khẳng định nào không tìm được câu trích thì phải rút lại.

```
Chỉ dùng thông tin trong ba file quy chế học bổng tôi tải lên.
Với mỗi hạn nộp, mức tiền, điều kiện: trích nguyên văn câu trong file kèm tên file.
Chỗ nào file không nói, ghi "không có trong tài liệu", đừng tự điền.
```

Tài liệu cũng nhắc: các cách này giảm hallucination chứ không xoá hết được. Thông tin quan trọng vẫn phải kiểm (bài 2.3).

> Trong đề chọn gì
>
> Thấy một con số, số hiệu, câu trích dẫn hay link cụ thể trong kết quả sắp gửi ra ngoài: chọn đáp án **đối chiếu với nguồn gốc có thẩm quyền**. Loại mọi đáp án dựa vào độ tự tin của Claude, vào việc câu chữ nghe chuyên nghiệp, hay vào việc chạy lại thấy ra giống nhau.

> Ý chính
>
> Hallucination nằm ở chỗ cụ thể và nghe đáng tin, giọng chắc chắn không chứng minh gì. Gặp nghi vấn thì chỉ ra đúng khẳng định đó rồi về nguồn; gặp câu khái quát về nhóm người thì viết lại theo dữ kiện và kiểm bằng dữ liệu.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 2 và câu hỏi mẫu 1(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Claude is providing incorrect or misleading responses (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)
3. [Claude is producing links that don't work (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8241188-claude-is-producing-links-that-don-t-work-and-falsely-claiming-that-it-has-sent-emails-or-produced-external-documents-what-s-going-on)
4. [How up-to-date is Claude's training data? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8114494-how-up-to-date-is-claude-s-training-data)
5. [Reduce hallucinations (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
