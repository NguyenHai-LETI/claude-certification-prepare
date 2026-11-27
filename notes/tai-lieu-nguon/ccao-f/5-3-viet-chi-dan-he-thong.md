---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccao-f/5-3-viet-chi-dan-he-thong
ngay_tai: 2026-11-27
tieu_de: Viết chỉ dẫn cấp hệ thống cho Claude
---

Domain 5 : Configuration and Knowledge Management·Task 5.3

# Viết chỉ dẫn cấp hệ thống cho Claude

Ba tầng chỉ dẫn (tài khoản, Project, tổ chức) khác nhau ra sao, viết chỉ dẫn theo thứ tự nào, và vì sao chỉ dẫn cụ thể thắng chỉ dẫn mơ hồ.

- 6 phút đọc
- Đối chiếu docs 07/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Phân biệt chỉ dẫn tài khoản, chỉ dẫn Project, chỉ dẫn tổ chức và skill
- Viết chỉ dẫn theo thứ tự, bắt đầu từ mục đích và ranh giới
- Biến chỉ dẫn mơ hồ thành chỉ dẫn cụ thể, kiểm được
- Biết chỉ dẫn tổ chức được ưu tiên ra sao và giới hạn của nó

Prompt chỉ có tác dụng trong một tin nhắn. Chỉ dẫn cấp hệ thống (**system-level instructions**) có tác dụng với mọi tin nhắn trong một phạm vi: cả tài khoản, cả Project, hay cả tổ chức. Vì áp dụng rộng như vậy, viết mơ hồ một câu là sai lặp đi lặp lại trong hàng trăm cuộc chat.

Bài này giúp bạn trả lời: có những tầng chỉ dẫn nào, và viết chỉ dẫn thế nào cho Claude làm đúng?

## Ví dụ xuyên suốt: thư xin lỗi sau sự cố mất mạng

Đội chăm sóc khách hàng của một nhà mạng internet có một Project soạn thư xin lỗi khách sau mỗi sự cố mất mạng. Chỉ dẫn hiện tại chỉ có một câu:

```
Hãy đồng cảm và thân mật, viết ngắn, và tặng khách một khoản bồi thường.
```

Kết quả: thư quá suồng sã so với giọng thương hiệu, có thư chỉ ba dòng, và thư nào cũng hứa bồi thường, kể cả khi khách không đủ điều kiện theo chính sách.

## Các tầng chỉ dẫn

| Tầng | Ai đặt | Áp dụng cho |
|---|---|---|
| Chỉ dẫn tài khoản (**Instructions for Claude**) | Từng người, ở Settings > Your Claude | Mọi cuộc chat của người đó |
| Chỉ dẫn Project (**project instructions**) | Người có quyền sửa Project | Mọi cuộc chat trong Project đó |
| Chỉ dẫn tổ chức (**organization instructions**) | Owner, Primary Owner gói Team, Enterprise | Mọi cuộc chat của mọi người trong tổ chức |
| **Skill** | Từng người hoặc tổ chức cung cấp | Nạp khi một việc cần tới, để làm việc đó theo cùng một cách |

Trang hỗ trợ về cá nhân hoá tóm lại: chỉ dẫn tài khoản cho thói quen chung của bạn, chỉ dẫn Project cho bối cảnh và yêu cầu riêng của một khối việc, skill cho cách định dạng và làm một loại việc lặp lại.

Với chỉ dẫn tổ chức: khi chỉ dẫn tổ chức và chỉ dẫn cá nhân mâu thuẫn trực tiếp, **Claude ưu tiên chỉ dẫn tổ chức**; chỉ dẫn cá nhân vẫn áp dụng cho những gì tổ chức không nói tới. Chỉ dẫn tổ chức dài tối đa 3.000 ký tự, có thể mất tới một giờ để có hiệu lực, và không thể tắt các nguyên tắc an toàn có sẵn của Claude.

## Viết theo thứ tự

Việc **đầu tiên** khi viết chỉ dẫn là **định mục đích của Project và ranh giới chỉ dẫn phải tôn trọng**. Sau đó mới viết nháp, thử trên các yêu cầu tiêu biểu, sửa chỗ thiếu, rồi chia sẻ cho người cùng dùng.

1. 
  - **Định mục đích và ranh giới**
2. rồi
  - **Viết nháp chỉ dẫn**
3. rồi
  - **Thử trên các yêu cầu tiêu biểu**
4. rồi
  - **Sửa chỗ thiếu thấy được khi thử**
5. rồi
  - **Chia sẻ cho người cùng dùng**

Trong ví dụ, mục đích là "soạn thư xin lỗi khách sau sự cố, đúng giọng thương hiệu"; ranh giới là "không hứa gì ngoài chính sách bồi thường".

## Cụ thể thắng mơ hồ

Trang hỗ trợ về chỉ dẫn tổ chức có một ví dụ dễ nhớ: thay vì "hãy chuyên nghiệp", viết "trả lời bằng tiếng Anh trang trọng, không dùng từ viết tắt, tiếng lóng hay emoji". Nguyên tắc đó đúng với mọi tầng chỉ dẫn. Thêm vài nguyên tắc nữa:

- **Ngắn gọn.** Trang hỗ trợ nói chỉ dẫn tổ chức được gửi kèm mọi tin nhắn của mọi người trong tổ chức, nên chỉ dẫn dài chiếm chỗ trong mọi cuộc chat. Trang hỗ trợ về context window cũng khuyên giữ chỉ dẫn Project ngắn: bối cảnh chung, nguyên tắc chính, vai trò của Claude.
- **Không tự mâu thuẫn.** Chỉ dẫn mâu thuẫn nhau thì Claude có thể không theo được cái nào.
- **Nói lý do khi cần.** Tài liệu prompting của Anthropic cho thấy Claude làm đúng hơn khi hiểu vì sao một quy tắc quan trọng.
- **Thử lại sau khi lưu.** Mở cuộc chat mới, kiểm Claude có làm theo không.

Viết lại chỉ dẫn của nhà mạng:

```
Bạn soạn thư xin lỗi khách hàng sau sự cố mất mạng.
Giọng: đồng cảm, trang trọng, không viết tắt, không emoji.
Độ dài: tối thiểu 120 chữ; nêu thời gian sự cố, nguyên nhân đã biết, việc đã khắc phục.
Bồi thường: chỉ đề xuất khi khách đủ điều kiện theo Chính sách bồi thường trong knowledge;
không đủ điều kiện thì không nhắc tới bồi thường.
```

> Bẫy đề
>
> Câu luyện thi về chỉ dẫn thư xin lỗi sai giọng, quá ngắn, hứa bồi thường bừa có ba cách sửa sai:
>
> - Giữ nguyên chỉ dẫn cũ, thêm một câu "tham khảo hướng dẫn giọng và chính sách bồi thường trong knowledge". Câu sai cũ vẫn còn đó.
> - Chuyển tài liệu vào knowledge rồi để tài liệu tự quyết giọng, độ dài, bồi thường, không sửa chỉ dẫn.
> - Đổi "thân mật" thành "theo hướng dẫn giọng", bỏ hẳn phần bồi thường, để độ dài tuỳ sự cố.
>
> Đáp án đúng: **nêu cụ thể các đặc điểm giọng (đồng cảm, trang trọng, không viết tắt), đặt độ dài tối thiểu, chỉ đề xuất bồi thường khi chính sách đính kèm cho phép**.

> Trong đề chọn gì
>
> Đề hỏi bước đầu tiên khi viết chỉ dẫn cấp hệ thống cho một Project: chọn **định mục đích của Project và ranh giới chỉ dẫn phải tôn trọng**. Sửa theo kết quả thử, thử trên yêu cầu tiêu biểu, và chia sẻ chỉ dẫn đã chốt đều đến sau.

1. Thói quen chung cho mọi cuộc chat của mình?Chỉ dẫn tài khoản
2. Bối cảnh và quy tắc riêng của một khối việc?Chỉ dẫn Project
3. Chuẩn mực cho cả tổ chức?Chỉ dẫn tổ chức, do Owner đặt
4. Một quy trình làm việc lặp lại, có thể kèm tài nguyên?Skill
5. Còn lạiTài liệu tham chiếu dài: đưa vào knowledge, không nhồi vào chỉ dẫn

> Ý chính
>
> Chọn đúng tầng chỉ dẫn cho phạm vi cần áp dụng. Bắt đầu từ mục đích và ranh giới; viết cụ thể, ngắn, không mâu thuẫn; thử lại sau khi lưu.

## Nguồn

1. [Exam Guide CCAO-F v1.0, Domain 5(mở tab mới)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Understanding Claude's personalization features (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features)
3. [Set organization instructions (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/14546867-set-organization-instructions)
4. [How large is the context window on paid Claude plans? (Claude Help Center)(mở tab mới)](https://support.claude.com/en/articles/8606394-how-large-is-the-context-window-on-paid-claude-plans)
5. [Prompting best practices (Claude Docs)(mở tab mới)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

## Nắm rồi thì thử sức với đề

Xem khoá luyện thi
