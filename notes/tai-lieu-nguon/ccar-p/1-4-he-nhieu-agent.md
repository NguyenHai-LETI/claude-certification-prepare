---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-4-he-nhieu-agent
ngay_tai: 2026-11-27
tieu_de: Thiết kế hệ nhiều agent và cách điều phối
---

Domain 1: Solution Design & Architecture · Task 1.4

# Thiết kế hệ nhiều agent và cách điều phối

Khi nào nên tách thành nhiều agent, chia việc theo context thay vì theo vai trò, giao việc cho subagent thế nào, và cần lo gì khi chạy thật.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Nhận ra ba tình huống đáng tách thành nhiều agent và các tình huống nên giữ một agent
- Chia việc theo ranh giới context thay vì theo vai trò, và biết khi nào dùng agent kiểm tra
- Hiểu subagent thấy gì, trả về gì, và giao việc cho nó đủ thông tin
- Ước lượng chi phí token, và nêu các việc cần làm để hệ nhiều agent chạy ổn định
- Xét ràng buộc cứng khi chọn hạ tầng cho hệ nhiều agent

Nhiều agent chạy song song nghe rất mạnh. Nhưng mỗi agent thêm vào là thêm token, thêm chỗ phối hợp và thêm chỗ hỏng. Người kiến trúc sư cần biết lúc nào cái giá đó đáng bỏ ra.

Bài này giúp bạn trả lời: khi nào nên dùng hệ nhiều agent (**multi-agent system**), chia việc cho các agent thế nào, và cần lo gì khi chạy thật?

## Ví dụ xuyên suốt: khảo sát thị trường cho chuỗi điện máy

Một chuỗi cửa hàng điện máy muốn mở chi nhánh mới và cần báo cáo về 12 tỉnh: dân số, thu nhập, đối thủ đang có, giá thuê mặt bằng, quy hoạch đô thị. Mỗi tỉnh là một hướng tìm hiểu riêng, gần như không phụ thuộc tỉnh khác. Tài liệu đọc được cho 12 tỉnh cộng lại vượt xa một context window.

Cùng công ty còn một việc khác: thêm tính năng đặt hàng trước vào phần mềm quản lý kho. Tính năng này đụng tới ba module gọi nhau.

## Bắt đầu bằng một agent, chỉ tách khi có lý do

Bài blog của Anthropic về xây hệ nhiều agent khuyên bắt đầu bằng một agent. Ngoài vài tình huống cụ thể, chi phí phối hợp thường lớn hơn lợi ích. Ba tình huống mà nhiều agent thường làm tốt hơn:

| Tình huống | Dấu hiệu | Trong ví dụ |
| --- | --- | --- |
| Context bị nhiễu (**context pollution**) | Một việc con sinh ra rất nhiều nội dung mà phần lớn không liên quan tới việc chính | Đọc hàng trăm trang quy hoạch để rút ra vài dòng |
| Việc song song được | Nhiều hướng độc lập, không cần kết quả của nhau | 12 tỉnh |
| Cần chuyên môn hoá | Một agent có quá nhiều tool (blog nêu mốc khoảng 20 trở lên) nên chọn sai tool, hoặc phải đóng hai vai mâu thuẫn | Không có trong ví dụ này |

Cái giá phải trả: blog nói trong thử nghiệm của họ, hệ nhiều agent thường dùng **3 tới 10 lần** token so với một agent cho cùng việc. Bài viết về hệ thống nghiên cứu của Anthropic đưa con số khác cho trường hợp của họ: agent dùng khoảng 4 lần token so với chat, hệ nhiều agent khoảng 15 lần. Đổi lại, trên bộ đánh giá nội bộ, hệ nhiều agent của họ tốt hơn một agent chạy một mình 90,2%.

Một điểm hay bị hiểu sai: lợi ích chính của chạy song song là **làm kỹ hơn**, không phải nhanh hơn. Blog nói hệ nhiều agent thường mất **nhiều thời gian hơn** tổng cộng so với một agent, vì tổng lượng tính toán lớn hơn.

> **Bẫy đề**
>
> "Chạy nhiều agent song song sẽ nhanh hơn và rẻ hơn" là sai cả hai vế. Song song giúp phủ rộng và kỹ hơn, nhưng tốn nhiều token hơn và thường không xong sớm hơn.

Những tình huống nên giữ một agent: các giai đoạn nối tiếp của cùng một việc, các phần gắn chặt với nhau, và việc cần dùng chung trạng thái. Tính năng đặt hàng trước đụng ba module gọi nhau là một ví dụ: một agent nắm toàn bộ context sẽ làm tốt hơn.

Khi phân vân, hỏi lần lượt:

1. **Việc con sinh ra rất nhiều nội dung không liên quan tới việc chính?** → Tách subagent để context chính không bị nhiễu
2. **Có nhiều hướng độc lập, không cần kết quả của nhau?** → Chạy nhiều agent song song
3. **Một agent có quá nhiều tool nên chọn sai, hoặc phải đóng hai vai mâu thuẫn?** → Tách để chuyên môn hoá
- **Còn lại** → Không có dấu hiệu nào: giữ một agent

## Chia theo context, không theo vai trò

Blog nhấn mạnh: khi chia việc, hãy nhìn theo **ranh giới context** (context-centric), không theo **loại việc** (problem-centric). Chia theo loại việc, như một agent lập kế hoạch, một agent viết code, một agent viết test, một agent review, nghe gọn nhưng thường phản tác dụng. Khi Anthropic thử cách đó, các subagent tốn nhiều token cho việc phối hợp hơn là cho việc thật. Mỗi lần chuyển giao lại mất một ít thông tin, như trò chơi truyền tin.

Chia theo context nghĩa là: agent làm tính năng đặt hàng trước thì tự viết luôn test cho tính năng đó, vì nó đang nắm context. Ranh giới tốt là những hướng tìm hiểu độc lập (12 tỉnh), hoặc các thành phần giao tiếp qua một giao diện rõ ràng.

**Sơ đồ**
1. **Chia theo vai trò**: lập kế hoạch, viết code, viết test, review mỗi thứ một agent **|** **Chia theo context**: agent làm đặt hàng trước tự viết luôn test, mỗi tỉnh một agent
   ↓ _kết quả_
2. **Token tốn vào phối hợp nhiều hơn việc thật, mỗi lần chuyển giao mất một ít thông tin** **|** **Mỗi agent nắm đủ context cho phần việc của mình, ít phải chuyển giao**

Có một kiểu tách mà blog nói hiệu quả ở nhiều lĩnh vực: **agent kiểm tra** (verification subagent). Agent chính làm xong một phần thì tạo một agent mới, chỉ đưa cho nó sản phẩm, tiêu chí đạt và tool để kiểm. Agent kiểm không cần biết quá trình làm. Lỗi hay gặp là agent kiểm chạy một hai bài test rồi tuyên bố đạt; cách chữa là tiêu chí cụ thể và yêu cầu rõ phải chạy đủ bộ test.

> **Trong đề chọn gì**
>
> Việc rộng, nhiều hướng độc lập, lượng tài liệu lớn: chọn nhiều agent chạy song song. Việc cần chung context hoặc các bước phụ thuộc nhau: chọn một agent. Đáp án chia theo vai trò (lập kế hoạch, làm, kiểm, duyệt) mà không có lý do về context thường là đáp án yếu.

## Orchestrator-worker và cách giao việc

Hệ thống nghiên cứu của Anthropic dùng mô hình **orchestrator-worker**: agent chính (lead agent) đọc câu hỏi, lập kế hoạch, tạo các subagent chạy song song, mỗi subagent có prompt, tool và context riêng; agent chính gom kết quả và quyết định cần tìm thêm hay đã đủ. Trong ví dụ, agent chính chia 12 tỉnh cho các subagent rồi so sánh và viết báo cáo.

**Sơ đồ**
- Trung tâm: **Agent chính**: chia 12 tỉnh, so sánh, viết báo cáo
- **Subagent Huế**: prompt, tool, context riêng
- **Subagent Đà Nẵng**: prompt, tool, context riêng
- **Subagent Cần Thơ**: prompt, tool, context riêng
- **Các tỉnh còn lại**: mỗi tỉnh một subagent

_Agent chính gom kết quả rồi quyết định cần tìm thêm hay đã đủ_

### Subagent thấy gì và trả về gì

Docs của Agent SDK nói rõ cách cách ly context:

- Subagent chạy trong một cuộc hội thoại riêng, **không thấy** lịch sử hội thoại, kết quả tool hay system prompt của agent chính.
- Thứ duy nhất truyền từ agent chính sang là **chuỗi prompt** khi gọi subagent. Đường dẫn file, lỗi đã gặp, quyết định đã chốt đều phải nằm trong chuỗi đó.
- Khi xong, **chỉ tin nhắn cuối** của subagent quay về agent chính. Các lần gọi tool ở giữa ở lại bên trong.
- Nếu không khai báo danh sách `tools` cho subagent, nó **kế thừa mọi tool** dành cho subagent. Muốn giới hạn thì phải liệt kê.

Vì subagent không thấy gì ngoài prompt, giao việc phải đủ. Bài viết về hệ thống nghiên cứu rút ra rằng mỗi subagent cần đủ bốn thứ: **mục tiêu**, **định dạng kết quả**, **tool và nguồn nên dùng**, và **ranh giới công việc**. Giao việc quá ngắn kiểu "tìm hiểu thị trường Huế" dễ làm hai subagent cùng tìm một thứ, còn phần khác thì không ai làm. Mức đầu tư cũng phải theo độ khó: câu hỏi tra cứu đơn giản chỉ cần một agent; một lỗi họ gặp lúc đầu là tạo tới 50 subagent cho một câu hỏi đơn giản.

**Sơ đồ**
1. **Agent chính**: có lịch sử hội thoại, kết quả tool, system prompt của nó
   ↓ _chỉ chuỗi prompt đi sang, nên phải ghi đủ mục tiêu, định dạng kết quả, tool và nguồn, ranh giới công việc_
2. **Subagent**: chạy trong hội thoại riêng, không thấy gì khác
   ↓ _chỉ tin nhắn cuối quay về, các lần gọi tool ở giữa ở lại bên trong_
3. **Agent chính**: nhận kết quả gọn, context không bị lấp đầy

> **Bẫy đề**
>
> Bỏ trống danh sách tool của subagent không làm nó an toàn hơn. Ngược lại, nó nhận mọi tool có thể dùng. Subagent chỉ cần đọc thì liệt kê đúng các tool đọc.

## Chạy thật: chậm nhất quyết định tốc độ, lỗi cộng dồn

Docs Agent SDK nói các subagent độc lập chạy cùng lúc thì xong trong thời gian của subagent **chậm nhất**, không phải tổng thời gian. Hệ thống nghiên cứu của Anthropic chạy subagent đồng bộ, chờ cả nhóm xong mới đi tiếp, nên một subagent chậm làm cả hệ thống chờ. Chạy bất đồng bộ nhanh hơn nhưng khó hơn ở chỗ gom kết quả, giữ trạng thái nhất quán và lan truyền lỗi.

Agent chạy lâu và có trạng thái, nên một lỗi nhỏ cũng có thể làm hỏng cả lượt chạy dài. Những việc bài viết nêu:

- Lưu điểm khôi phục (checkpoint) và có cơ chế thử lại, để tiếp tục từ chỗ hỏng thay vì chạy lại từ đầu.
- Ghi vết (tracing) toàn bộ luồng quyết định để gỡ lỗi, vì mỗi lần chạy mỗi khác.
- Cập nhật phiên bản từ từ, để agent đang chạy dở không bị đổi code giữa chừng.
- Đặt trần chi phí: Agent SDK có `max_budget_usd`, Managed Agents có ngân sách cho cả phiên, tính cả các agent con.

## Tự vận hành hay dùng hạ tầng có sẵn

Tự chạy hệ nhiều agent trên hạ tầng của mình nghĩa là tự lo hàng đợi tin nhắn, khôi phục trạng thái, mở rộng. Claude Managed Agents là lựa chọn mà Anthropic chạy vòng lặp agent, việc thực thi tool và runtime giúp bạn. Tính năng nhiều agent của nó (đang beta) cho mọi agent dùng chung sandbox, hệ thống file và thông tin xác thực, nhưng mỗi agent chạy trong một luồng riêng có lịch sử hội thoại riêng.

Khi cân nhắc chuyển sang, đừng chỉ so công sức vận hành.

> **Bẫy đề**
>
> Câu luyện thi: một nhóm tốn nhiều công sức vận hành hệ bảy agent tự chạy, giám đốc tài chính muốn chuyển sang managed agent, còn bộ phận bảo mật yêu cầu dữ liệu tài chính của khách ở trong vùng mạng đã duyệt. Các đáp án sai hỏi agent có khớp mẫu của managed agent không, có rẻ hơn tính theo token không, có hỗ trợ kiến trúc hàng đợi hiện tại không. Đáp án đúng: cách managed agent xử lý dữ liệu có đáp ứng yêu cầu vùng mạng không. Ràng buộc cứng không đạt thì các lợi ích khác không còn ý nghĩa.

> **Ý chính**
>
> Bắt đầu bằng một agent. Chỉ tách khi context bị nhiễu, việc song song được, hoặc cần chuyên môn hoá; chia theo ranh giới context, không theo vai trò; và giao cho subagent đủ mục tiêu, định dạng, tool và ranh giới vì nó không thấy gì khác.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Building multi-agent systems, when and how to use them (Claude Blog)](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
3. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/engineering/multi-agent-research-system)
4. [Subagents in the SDK (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/subagents)
5. [Multiagent orchestration (Claude Managed Agents)](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration)
6. [Use case guides (Claude Docs)](https://platform.claude.com/docs/en/about-claude/use-case-guides/overview)
