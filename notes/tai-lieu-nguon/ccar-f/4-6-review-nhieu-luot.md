---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-6-review-nhieu-luot
ngay_tai: 2026-11-27
tieu_de: Thiết kế review nhiều instance và nhiều lần
---

Domain 4: Prompt Engineering & Structured Output · Task 4.6

# Thiết kế review nhiều instance và nhiều lần

Vì sao Claude tự review code của mình kém hơn một instance độc lập, cách chia PR lớn thành các lần review từng file và một lần tích hợp, và cách dùng độ tự tin.

- 14 phút đọc
- Đối chiếu docs 22/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Giải thích vì sao tự review trong cùng session ít bắt được lỗi
- Dùng một instance Claude độc lập, không mang lập luận lúc viết code, để review
- Chia review nhiều file thành các lần review từng file, rồi thêm một lần tích hợp liên file
- Tách review theo nhóm vấn đề, và tách bước tìm khỏi bước lọc
- Cho Claude tự báo độ tự tin cạnh mỗi phát hiện để chuyển việc review cho đúng chỗ

Một PR lớn có thể chứa hai kiểu lỗi: lỗi nằm gọn trong một file, và lỗi chỉ lộ ra khi đọc nhiều file cùng lúc. Nếu chỉ review một lần, nhất là khi người review lại chính là Claude vừa viết code đó, thì cả hai kiểu đều dễ bị sót.

Bài này chỉ cách sắp xếp các instance Claude (mỗi instance là một lần chạy Claude riêng, với context riêng) và các lần review để bắt được nhiều lỗi hơn. Bạn sẽ thấy vì sao nên review bằng một instance khác, cách chia một PR lớn thành nhiều lần review, cách tách review theo nhóm vấn đề, và cách dùng độ tự tin của từng phát hiện (mỗi lỗi mà review chỉ ra) để biết phát hiện nào cần người xem.

**Sơ đồ: Một instance độc lập review code vừa viết qua nhiều lần, rồi một bước riêng lọc phát hiện**
_Kiến trúc review nhiều instance và nhiều lần: session viết code không tự review, instance độc lập chạy prompt theo nhóm vấn đề, các lần review từng file rồi lần tích hợp, sau đó lần kiểm tra chuyển phát hiện tới PR, hàng chờ người xem hoặc log_

- **Session viết code**: mang lập luận lúc viết
- self-review
- **Tự review**: ít nghi ngờ chính mình
- diff, không kèm lập luận
- **INSTANCE ĐỘC LẬP · BƯỚC TÌM: BAO PHỦ**: prompt theo nhóm vấn đề
- nét đứt: prompt áp cho mỗi lần review từng file
- bảo mật + API
- logic nghiệp vụ
- **Review từng file**: mỗi file: lỗi cục bộ
- **Lần tích hợp**: luồng dữ liệu liên file
- phát hiện từng file + liên file, kèm độ tự tin
- **BƯỚC LỌC RIÊNG**
- **CALIBRATED ROUTING**
- **Lần kiểm tra**: tự báo độ tự tin
- xác nhận, tự tin cao
- xác nhận, tự tin thấp
- hoặc bác một phần
- bác hẳn
- **Đăng lên PR**
- **Hàng chờ người xem**
- **Chỉ ghi log**

## Ví dụ xuyên suốt: hệ thống tích điểm của một chuỗi cửa hàng tiện lợi

Một công ty phần mềm ở Nam Định làm hệ thống tích điểm cho một chuỗi 120 cửa hàng tiện lợi. Khách mua hàng thì được tích điểm, rồi dùng điểm đổi quà. Backend viết bằng TypeScript. Đội có 6 dev, anh Hiếu là trưởng nhóm, Trang là dev viết phần lớn logic tích điểm. Đội dùng Claude Code để viết code, và có một pipeline review trong CI gọi Claude review từng PR.

## Khi Claude tự review code vừa viết trong cùng session

Trang nhờ Claude Code viết lại hàm `tinhDiemDonHang` để áp hệ số nhân điểm theo hạng thẻ. Viết xong, Trang gõ tiếp trong cùng session: "Review lại code vừa viết, tìm lỗi giúp mình". Claude trả lời code ổn, chỉ gợi ý đổi tên một biến. Hôm sau, pipeline review bắt được hai lỗi: hệ số hạng Vàng áp hai lần khi đơn có khuyến mãi, và đơn bị huỷ vẫn được cộng điểm.

Trong cùng session, context vẫn còn nguyên những lập luận Claude dùng lúc viết code (**retains reasoning context from generation**). Lúc viết, nó đã quyết rằng cách tính đó đúng, nên khi review nó ít khi quay lại nghi ngờ chính quyết định ấy (**less likely to question its own decisions in the same session**). Đây là giới hạn của tự review (**self-review limitations**). Dặn thêm "hãy review thật khắt khe" (**self-review instructions**) hay bật **extended thinking** (cho Claude suy nghĩ lâu hơn trước khi trả lời) cũng không gỡ hết được giới hạn đó, vì lập luận cũ vẫn nằm trong context.

Một instance review độc lập (**independent review instances**) không mang theo những lập luận đó, nên bắt lỗi tinh vi tốt hơn so với việc dặn Claude tự review kỹ hơn hay bật extended thinking. Anh Hiếu biến chuyện đó thành quy tắc cho cả đội: code nào Claude viết ra cũng phải có một instance Claude thứ hai review, và instance này không thấy cuộc trò chuyện lúc viết (**a second independent Claude instance to review generated code without the generator's reasoning context**). Không ai dùng tự review trong session nữa. Ngay trong terminal, Trang có thể gõ `/code-review`. Lệnh này giao diff cho một subagent mới (một agent con chạy với context riêng), nên bên review chưa từng thấy cuộc trò chuyện lúc viết. Mở một session Claude Code thứ hai cũng được, vì session mới chỉ đọc các file đã sửa chứ không biết code được viết ra thế nào.

**Sơ đồ: Cùng hàm tinhDiemDonHang: session còn lập luận lúc viết thấy ổn, instance độc lập bắt được 2 lỗi**
_Context của hai lần review hàm tinhDiemDonHang: session lúc viết còn lập luận cũ và chỉ gợi ý đổi tên biến; instance độc lập chỉ có diff và bắt được hai lỗi_

- **Cùng session lúc viết code**
- **CONTEXT KHI REVIEW**: Yêu cầu: nhân điểm theo hạng thẻ
- **Lập luận lúc viết: đã quyết là đúng**: Code tinhDiemDonHang vừa viết
- “Review lại code vừa viết, tìm lỗi”
- **Code ổn**: chỉ gợi ý đổi tên một biến
- **Instance độc lập**
- **CONTEXT KHI REVIEW**: Diff của tinhDiemDonHang
- không thấy cuộc trò chuyện lúc viết
- review CI hay /code-review
- **Bắt được 2 lỗi**: hệ số Vàng áp hai lần khi có khuyến mãi
- đơn huỷ vẫn được cộng điểm

> **Bẫy đề**
>
> Một developer dùng Claude Code refactor một hàm, rồi nhờ chính session đó review tìm lỗi trước khi commit. Sau đó lần review tự động trong CI bắt được vài bug mà lần review trong session bỏ sót. Điều gì giải thích chuyện này rõ nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **CI có context đầy đủ của codebase, còn session local chỉ thấy file hiện tại** (_CI sees more code_). Nghe như khác biệt về lượng thông tin. Nhưng session Claude Code cũng đọc được cả repo, và các bug bị sót nằm ngay trong hàm vừa refactor.
> - **Session kéo dài làm context đầy lịch sử, còn ít chỗ để phân tích** (_context window full_). Cách giải thích này nghe kỹ thuật. Có điều một lần refactor một hàm hiếm khi làm đầy context, và vấn đề nằm ở chỗ trong context có gì, chứ không phải context nhiều hay ít.
> - **Review CI dùng prompt cụ thể hơn, còn yêu cầu của developer quá chung chung** (_a better prompt_). Nghe như sửa prompt là xong. Ngặt nỗi dù prompt cụ thể tới đâu, session đó vẫn mang theo lập luận lúc viết code.
>
> **Chọn:** trong session đó Claude vẫn còn giữ lập luận lúc viết code, nên nó ít khi nghi ngờ chính quyết định của mình.

> **Trong đề chọn gì**
>
> Nếu đề hỏi vì sao để chính session vừa viết code review PR của nó là một anti-pattern, hãy chọn đáp án nói bên review vẫn giữ lập luận và giả định từ lúc viết code, nên dễ mắc **confirmation bias**, tức là chỉ thấy những gì khớp với điều mình đã tin. Những đáp án nói tool bị khoá sau lần gọi đầu, Message Batches API không hỗ trợ tự review, hay bị vượt giới hạn token đều đổ cho một giới hạn kỹ thuật, trong khi nguyên nhân thật là lập luận cũ còn nằm trong context.

## Chia PR lớn thành các lần review từng file và một lần tích hợp

Tháng sau, đội làm tính năng đổi quà theo mùa, và PR của tính năng này sửa tới 40 file. Pipeline review đưa cả 40 file vào một lần gọi. Kết quả trả về toàn nhận xét chung chung kiểu "nên thêm xử lý lỗi", còn một lỗi liên file thì bị sót. `doiQua.ts` trừ điểm theo số đã làm tròn xuống, trong khi `tinhDiem.ts` cộng điểm theo số làm tròn lên, nên khách đổi quà xong vẫn còn dư 1 điểm.

Khi một lần review ôm quá nhiều file, sự chú ý bị loãng (**attention dilution**). Claude phải chia sự chú ý cho quá nhiều file, nên lỗi trong từng file dễ bị lướt qua, còn lỗi nằm giữa hai file thì chìm giữa hàng chục file khác.

Anh Hiếu chia review thành nhiều lần (**multi-pass review**). Mỗi file được review trong một lần riêng, tập trung vào lỗi cục bộ (**focused per-file passes for local issues**). Sau đó có thêm một lần review tích hợp riêng (**separate integration passes**), tức lần review xem các file liên quan với nhau thế nào. Lần này nhận các phát hiện từ những lần review từng file cùng các file liên quan, để lần theo dữ liệu chạy qua các file (**cross-file data flow analysis**). Lần tích hợp còn có một việc nữa: mỗi lần review từng file chỉ thấy một file, nên hai lần có thể đưa ra phát hiện mâu thuẫn nhau (**contradictory findings**) về cùng một lỗi liên file.

```
Lần 1..40 (mỗi file một lần):  lỗi cục bộ trong file đó
        │
        ▼  phát hiện của 40 lần + các file liên quan
Lần tích hợp:  điểm được cộng ở đâu, trừ ở đâu, làm tròn có khớp nhau không
```

Khi chạy cách mới lần đầu, lần review riêng `tinhDiem.ts` thấy comment trong file ghi điểm phải làm tròn xuống theo quy định, nên đề xuất đổi phép cộng sang làm tròn xuống. Lần review riêng `doiQua.ts` thấy test trong file để dư 1 điểm sau khi đổi hết, nên đề xuất đổi phép trừ sang làm tròn lên. Hai đề xuất sửa cùng một lỗi mà không ăn khớp: áp cả hai thì số dư lại lệch theo chiều ngược lại, vì mỗi lần chỉ thấy một file. Lần tích hợp đọc cả hai file cùng lúc và lần theo điểm từ lúc được cộng tới lúc bị trừ. Nó chỉ đưa ra một cách sửa: cả hai file cùng gọi một hàm làm tròn xuống dùng chung.

**Sơ đồ: Mỗi lần review từng file chỉ thấy file của mình, lần tích hợp gộp hai đề xuất thành một cách sửa**
- 40 lần review từng file
- tinhDiem.tscộng: làm tròn lên
- Đề xuất riêng:đổi phép cộngsang tròn xuống
- doiQua.tstrừ: làm tròn xuống
- Đề xuất riêng:đổi phép trừsang tròn lên
- Các file còn lại
- Lần tích hợp: đặt haiđề xuất cạnh nhau, áp cảhai thì lệch ngược lại
- Cả hai filelàm tròn xuống quamột hàm dùng chung

> **Bẫy đề**
>
> Một hệ thống review dùng agent đang review một PR sửa 40 file trong monorepo. Khi một lần review ôm cả 40 file, lỗi liên file tinh vi bị sót, còn nhận xét thì chung chung. Nên thiết kế lại thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Chạy review trên cả diff nhiều lần, mỗi lần xáo thứ tự file, rồi giữ những nhận xét lần nào cũng có** (_shuffle and vote_). Nghe như lọc được nhiễu. Nhưng lần nào cũng ôm đủ 40 file, nên sự chú ý vẫn loãng như cũ.
> - **Chuyển sang model có context window lớn hơn để đọc cả diff một lần** (_bigger context window_). Cách này giúp diff khỏi bị cắt bớt khi quá dài. Có điều diff 40 file vốn đã vừa context window, cái hỏng là Claude phải chú ý quá nhiều thứ cùng lúc.
> - **Giữ một lần, cho Claude xếp hạng rủi ro file trước rồi dồn công vào file rủi ro cao** (_risk-rank files_). Nghe như ưu tiên hợp lý. Ngặt nỗi file rủi ro thấp vẫn bị lướt, và vẫn không có bước nào nhìn ra lỗi liên file.
>
> **Chọn:** review từng file trong một lần riêng để tìm lỗi cục bộ, rồi chạy thêm một lần tích hợp trên các phát hiện đó để xem các file tác động lên nhau thế nào.

> **Trong đề chọn gì**
>
> Nếu đề kể review riêng từng file trên hai file phụ thuộc nhau cho ra hai cách sửa trái ngược cho cùng một lỗi luồng dữ liệu, hãy chọn thêm một lần tích hợp liên file riêng, xem cả hai file cùng lúc và đưa ra một đề xuất theo luồng dữ liệu thật. Nhờ bên viết code phân xử là quay lại đúng bên đang có thiên kiến. Chạy lại rồi giữ đề xuất nghe tự tin hơn là chọn theo giọng văn. Gộp hai file thành một đầu vào rồi cho một lần review đọc chung là quay về đúng chuyện loãng chú ý, và bỏ mất bước lần theo luồng dữ liệu liên file.
>
> Nếu đề hỏi hai chiến lược nên dùng cho kiến trúc review nhiều instance và nhiều lần, hãy chọn instance độc lập review code vừa viết, và chia review nhiều file thành các lần review từng file rồi một lần tích hợp liên file. Đáp án chạy ba lần review trên cả PR rồi chỉ giữ chỗ cả ba cùng đồng ý thì chỉ lặp lại cùng một điểm mù ba lần, còn để session viết code tự review chính là anti-pattern đã nói.

## Mỗi prompt review lo một nhóm vấn đề

Chia xong các lần review, pipeline vẫn còn một chỗ yếu khác. Nó dùng chung một prompt để soi cả bảo mật, thiết kế API lẫn logic tích điểm. Anh Hiếu chạy thử trên một bộ PR cũ mà đội đã biết trước lỗi nằm ở đâu. Review bắt tốt lỗi bảo mật, nhưng bỏ sót nhiều edge case của logic tích điểm, như đơn trả hàng một phần hay điểm hết hạn đúng ngày đổi quà. Khi anh thêm ví dụ về logic tích điểm vào prompt, review lại bắt lỗi bảo mật kém đi.

Anh Hiếu tách review thành các prompt tập trung riêng: một prompt cho bảo mật và thiết kế API, một prompt cho logic nghiệp vụ tích điểm. Mỗi prompt có ví dụ riêng của nó. Các phát hiện được gộp và bỏ trùng trước khi đăng lên PR. Vì mỗi prompt chỉ lo một nhóm vấn đề, thêm ví dụ cho nhóm này không còn làm review nhóm kia yếu đi.

> **Trong đề chọn gì**
>
> Nếu đề kể một prompt review bao cả bảo mật, thiết kế API và logic nghiệp vụ, bắt tốt loại này nhưng sót edge case của loại kia, hãy chọn tách thành các prompt tập trung riêng, mỗi prompt có ví dụ riêng, rồi gộp phát hiện trước khi đăng. Thay ví dụ bằng checklist edge case vẫn để mọi thứ chen nhau trong một prompt. Đưa cả repo vào context chỉ làm sự chú ý loãng thêm. Nâng model mạnh hơn không gỡ được việc một prompt phải chia sự chú ý cho nhiều nhóm.

## Tách bước tìm khỏi bước lọc

Còn một chỗ nữa trong các prompt review của đội. Để giảm báo nhầm, prompt có câu "only report high-confidence issues you are certain about" (chỉ báo lỗi bạn chắc chắn) và "err on the side of not commenting" (phân vân thì đừng comment). Dev thích vì ít comment, nhưng bug thật vẫn lọt. Rất có thể Claude đã đọc tới đoạn code lỗi và thấy vấn đề, nhưng không báo vì chưa chắc tới mức prompt đòi hỏi.

Anh Hiếu tách review thành hai bước. Ở bước tìm, mục tiêu là bao phủ, tức là Claude báo mọi vấn đề nó thấy, kể cả cái nó chưa chắc hay cho là nhẹ, và ghi kèm độ tự tin, mức nghiêm trọng cho từng phát hiện. Bước lọc là một bước riêng, quyết định phát hiện nào được đăng lên PR. Lúc đầu bước lọc chỉ là một ngưỡng đơn giản theo mức nghiêm trọng. Khi pipeline có bước lọc riêng, hãy nói rõ với Claude rằng việc của nó ở bước tìm là bao phủ chứ không phải lọc.

> **Bẫy đề**
>
> Review tự động có precision cao (ít báo nhầm) nhưng recall thấp (bỏ lọt nhiều bug thật). Prompt dặn "only report high-confidence issues you are certain about" và "err on the side of not commenting". Dev thích việc ít báo nhầm. Nên đổi kiến trúc thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm ví dụ few-shot về các loại bug cần báo, nhưng giữ chỉ dẫn lọc theo độ tự tin cao** (_examples plus filter_). Nghe như giữ được cả precision lẫn recall. Nhưng chính câu dặn lọc là chỗ làm bug bị giấu, và nó vẫn còn đó.
> - **Bỏ chỉ dẫn lọc, báo mọi vấn đề, rồi dùng code gộp trùng và ẩn các loại trước giờ hay báo nhầm** (_report all, hide noisy categories_). Cách này mở lại được recall. Có điều ẩn nguyên một loại chỉ vì trước đây hay báo nhầm là vứt luôn cả những phát hiện đúng trong loại đó, mà phát hiện lại không kèm độ tự tin hay mức nghiêm trọng để lọc kỹ hơn.
> - **Đưa thêm file test, lịch sử git và dependency graph vào context** (_more context_). Nghe như giúp đánh giá mức nghiêm trọng tốt hơn. Ngặt nỗi Claude vẫn được dặn đừng báo những gì nó chưa chắc.
>
> **Chọn:** tách review thành bước tìm có mục tiêu là độ bao phủ, báo mọi vấn đề kèm độ tự tin và mức nghiêm trọng, và một bước riêng lọc phát hiện theo ngưỡng.

## Dùng độ tự tin để chuyển phát hiện tới đúng người xem

Sau khi tách bước tìm, mỗi PR có khoảng 25 phát hiện, và ngưỡng theo mức nghiêm trọng vẫn đẩy quá nhiều lên PR cho anh Hiếu đọc. Anh thay ngưỡng đó bằng một lần kiểm tra (**verification passes**). Ở lần này, một instance khác đọc từng phát hiện cùng đoạn code liên quan rồi xác nhận hoặc bác bỏ. Nó cũng tự ghi độ tự tin của chính nó cạnh mỗi phát hiện (**the model self-reports confidence alongside each finding**), và pipeline dựa vào độ tự tin này chứ không dựa vào độ tự tin của bước tìm.

Pipeline dùng độ tự tin này để chuyển mỗi phát hiện tới đúng chỗ (**calibrated review routing**). Phát hiện được xác nhận với độ tự tin cao thì đăng thẳng lên PR. Phát hiện độ tự tin thấp hay bị bác một phần thì vào hàng chờ cho anh Hiếu xem. Phát hiện bị bác hẳn thì chỉ ghi log. Ba nhánh này là cách đội chọn, điều cốt lõi là độ tự tin quyết định phát hiện đi đâu. Trong vài tuần đầu, anh Hiếu đối chiếu xem những phát hiện tự tin cao có thật sự đúng nhiều hơn không, rồi mới chỉnh ngưỡng. Chữ calibrated nói đúng việc này: ngưỡng được chỉnh theo kết quả thật. Dev chỉ thấy những comment đã qua kiểm tra, còn người review chỉ phải đọc phần đáng ngờ.

**Sơ đồ: Khoảng 25 phát hiện mỗi PR, nhưng anh Hiếu chỉ phải đọc những phát hiện đáng ngờ**
- xác nhận, tự tin cao
- xác nhận, tự tin thấphoặc bác một phần
- bác hẳn
- Bước tìm: khoảng 25phát hiện mỗi PR,kèm độ tự tin,mức nghiêm trọng
- Lần kiểm tra:instance khác đọcphát hiện và code,tự báo độ tự tin
- Đăng thẳng lên PR
- Hàng chờ anh Hiếu
- Chỉ ghi log

> **Ý chính**
>
> Hãy dùng độ tự tin để chuyển phát hiện tới đúng người xử lý sau khi đã tìm xong, đừng dùng nó làm ngưỡng khiến Claude tự giấu bớt phát hiện ngay lúc đang tìm.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 4.6](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
3. [Prompting Claude Opus 4.8, Code review harnesses (Claude API)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)
