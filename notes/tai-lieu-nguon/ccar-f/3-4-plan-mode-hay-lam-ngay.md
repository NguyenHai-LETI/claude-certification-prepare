---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-4-plan-mode-hay-lam-ngay
ngay_tai: 2026-11-27
tieu_de: Khi nào dùng plan mode, khi nào làm ngay
---

Domain 3: Claude Code Configuration & Workflows · Task 3.4

# Khi nào dùng plan mode, khi nào làm ngay

Nhận ra việc nào cần plan mode để khảo sát và lên kế hoạch trước, việc nào nên làm ngay, và dùng subagent Explore để giữ context chính gọn.

- 17 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Chọn plan mode cho thay đổi lớn, nhiều cách làm, có quyết định kiến trúc
- Chọn làm ngay cho thay đổi nhỏ, rõ phạm vi
- Kết hợp lên kế hoạch bằng plan mode rồi làm theo kế hoạch đã duyệt
- Dùng subagent Explore cho giai đoạn khảo sát in ra nhiều để context chính không bị đầy

Khi giao việc cho Claude Code, bạn có hai cách bắt đầu. Cách thứ nhất là bảo Claude làm ngay (**direct execution**), tức là Claude đọc phần code cần thiết rồi sửa luôn. Cách thứ hai là bật chế độ lên kế hoạch (**plan mode**). Ở chế độ này Claude khảo sát code và viết ra kế hoạch trước, rồi chỉ sửa file sau khi bạn duyệt.

Chọn sai thì tốn công theo cả hai hướng. Dùng plan mode cho một việc sửa một dòng là thêm bước thừa. Làm ngay một việc đụng tới vài chục file khi chưa hiểu các file phụ thuộc nhau thế nào thì dễ phải làm lại từ đầu. Bài này giúp bạn nhận ra việc nào nên làm theo cách nào và khi nào nên kết hợp cả hai. Bài cũng chỉ cách giữ cho context, tức phần nội dung Claude đang giữ trong cuộc trò chuyện, không bị đầy khi phải đọc nhiều code.

**Sơ đồ: Việc nhỏ, rõ phạm vi thì làm ngay; việc lớn thì lên kế hoạch trong plan mode rồi mới sửa**
_Bản đồ bài: thay đổi nhỏ, rõ phạm vi thì direct execution, đọc code và sửa luôn; complex tasks thì vào plan mode, chỉ đọc và chưa sửa file: khảo sát code, giao phần khảo sát dài cho subagent Explore ở context riêng và nhận về tóm tắt, viết kế hoạch hoặc so các hướng cho đội chọn, việc cần nhiều phán đoán thì chia pha; duyệt xong thì thoát plan mode và direct execution theo kế hoạch đã duyệt_

- **Nhỏ, rõ phạm vi?**: biết sửa gì, ở đâu
- có
- **LÀM NGAY**
- **Direct execution**: simple, well-scoped: đọc code, sửa luôn
- không
- **COMPLEX TASKS: PLAN MODE, CHƯA SỬA FILE**
- **Khảo sát code**: đọc file, chạy lệnh
- **Subagent Explore**: context riêng
- chỉ gửi tóm tắt về
- **Kế hoạch, hoặc so các hướng cho đội chọn**: việc cần nhiều phán đoán thì chia pha
- duyệt, thoát plan mode
- **Direct execution**: làm theo kế hoạch đã duyệt

## Ví dụ xuyên suốt: app đặt lịch khám cho chuỗi phòng khám thú y

Một chuỗi 15 phòng khám thú y ở TP.HCM có app cho chủ thú cưng đặt lịch khám, xem lịch tiêm phòng và nhận nhắc tái khám. App còn có phần hoá đơn và module thanh toán cho khách trả tiền khám. Backend viết bằng TypeScript, giao diện bằng React. Đội có 5 dev, anh Quân là trưởng nhóm, Minh Anh là dev phụ trách phần lịch hẹn.

Trong một tuần, Minh Anh nhận liền mấy việc lớn nhỏ khác nhau. Có việc làm ngay được, có việc phải lên kế hoạch trước.

## Plan mode làm gì

Trong plan mode, Claude được đọc file và chạy lệnh shell để tìm hiểu code, rồi viết ra một kế hoạch thay đổi. Mọi thao tác sửa source code đều bị chặn cho tới khi bạn duyệt kế hoạch đó. Ngoại lệ duy nhất là session chạy trong terminal với chế độ bypass permissions được bật sẵn: khi đó Claude vẫn được dặn chỉ lên kế hoạch, nhưng Claude Code không chặn nữa.

Có ba cách vào plan mode. Bạn nhấn `Shift+Tab` trong session cho tới khi thanh trạng thái hiện `⏸ plan mode on`, hoặc gõ `/plan` ở đầu một prompt, hoặc mở Claude Code bằng lệnh `claude --permission-mode plan`.

Khi kế hoạch xong, Claude trình bày và hỏi bạn muốn làm tiếp thế nào. Bạn có thể duyệt kế hoạch rồi cho Claude sửa ở auto mode, tức là Claude làm tiếp mà không hỏi bạn từng bước. Bạn cũng có thể duyệt kế hoạch nhưng vẫn tự xem và duyệt từng chỗ sửa (**Yes, manually approve edits**). Nếu chưa ưng, bạn chọn **No, keep planning** để ở lại plan mode và nói Claude cần đổi gì trong kế hoạch. Nhấn `Ctrl+G` thì kế hoạch mở trong trình soạn thảo để bạn sửa thẳng. Khi bạn duyệt kế hoạch, session thoát plan mode và Claude bắt đầu sửa theo kế hoạch đó.

**Sơ đồ: Trong plan mode Claude chỉ đọc và viết kế hoạch; duyệt xong mới thoát ra và sửa file**
- Shift+Tab, /planhoặc --permission-mode plan
- No, keep planninghoặc Ctrl+G sửa thẳng
- duyệt, rồi sửa ở auto modehoặc tự duyệt từng chỗ sửa
- Khảo sát, sửa file bị chặn
- Trình bày kế hoạch
- Thoát plan mode, sửa theo kế hoạch

Plan mode hợp với việc phức tạp (**complex tasks**). Đó là những thay đổi trên diện rộng (**large-scale changes**), việc có nhiều cách làm đều hợp lý (**multiple valid approaches**), việc có quyết định kiến trúc (**architectural decisions**), hay việc phải sửa nhiều file cùng lúc (**multi-file modifications**). Ví dụ như tách lại một hệ thống microservice (**microservice restructuring**), hay đổi một thư viện đang dùng ở vài chục file. Lợi ích chính là Claude được tìm hiểu code và tính cách làm trước khi đụng vào file nào (**safe codebase exploration and design**), nên trong lúc tìm hiểu không có gì bị sửa hỏng. Phát hiện hướng sai ở bước kế hoạch rẻ hơn nhiều so với phát hiện khi đã sửa dở vài chục file và phải làm lại (**costly rework**).

## Làm ngay cho việc nhỏ, phạm vi rõ

Việc đầu tiên của Minh Anh là một lỗi trên production. Từ sáng, nhiều chủ thú cưng nhận nhắc tái khám vào ngày đã qua. Log báo `TypeError: Cannot read properties of undefined (reading 'soNgay')` tại `tinhNgayTaiKham.ts` dòng 42. Minh Anh chưa từng làm với module này, nhưng stack trace đã chỉ đúng chỗ.

Minh Anh bảo Claude làm ngay: đọc stack trace, mở `tinhNgayTaiKham.ts`, xem đoạn quanh dòng 42. Claude thấy lỗi xảy ra khi loại vaccine không có trong bảng lịch tiêm, nên `soNgay` không có giá trị. Claude sửa đúng chỗ đó. Khi stack trace đã chỉ rõ chỗ lỗi mà việc lại đang gấp, vào plan mode để phân tích kiến trúc cả module chỉ tốn thêm thời gian, không cho bạn biết thêm gì.

Việc thứ hai còn nhỏ hơn. Anh Quân muốn app chặn đặt lịch vào ngày đã qua, một bước kiểm tra ngày (**date validation**) đơn giản. Việc này chỉ cần thêm một câu `if` vào hàm `taoLichHen` có sẵn, và mọi thứ nằm gọn trong một file. Minh Anh biết cần sửa gì và sửa ở đâu, nên làm ngay là hợp.

Làm ngay phù hợp với thay đổi đơn giản, phạm vi rõ (**simple, well-scoped changes**), như sửa một lỗi trong một file có stack trace rõ (**single-file bug fix**), hay thêm một điều kiện kiểm tra ngày vào một hàm.

> **Bẫy đề**
>
> Một lỗi nghiêm trọng đang ảnh hưởng người dùng production. Log cho thấy exception trong module `OrderProcessing`, stack trace chỉ rõ một vùng cụ thể, nhưng bạn chưa từng làm với module này. Cách hiệu quả nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Dùng plan mode để phân tích lỗi trong thiết kế của module, liệt kê nguyên nhân có thể và xếp thứ tự cách sửa** (_plan mode for systematic analysis_). Cách này nghe bài bản. Nhưng stack trace đã chỉ đúng chỗ, nên phân tích cả module chỉ làm chậm việc sửa một lỗi đang gấp.
> - **Làm ngay để thu thập thông tin, rồi chuyển sang plan mode để thiết kế giải pháp toàn diện** (_direct then plan mode_). Nghe như lấy được cái lợi của cả hai cách. Có điều lỗi đã khoanh vùng thì không cần giải pháp toàn diện, chỉ cần sửa đúng nguyên nhân.
> - **Vào plan mode để khảo sát kiến trúc và phụ thuộc của module trước khi sửa** (_explore the architecture first_). Nghe an toàn, vì bạn chưa quen module. Ngặt nỗi khi stack trace đã cho biết cần đọc chỗ nào, việc chưa quen module cũng không làm lỗi này khó sửa hơn.
>
> **Chọn:** làm ngay. Xem stack trace, đọc phần code liên quan, và sửa khi đã thấy nguyên nhân gốc.

> **Trong đề chọn gì**
>
> Nếu đề hỏi nên làm thế nào để thêm bước kiểm tra ngày sự kiện phải ở tương lai, mà việc chỉ là thêm một câu điều kiện vào một hàm có sẵn, hãy chọn làm ngay. Bật extended thinking, tức cho Claude suy nghĩ lâu hơn trước khi trả lời, là thừa, vì logic kiểm tra này không có gì mơ hồ. Vào plan mode để phân tích ảnh hưởng tới cả luồng đặt chỗ, hay để lập chiến lược cài đặt chi tiết, cũng chỉ thêm bước. Tương tự, nếu đề hỏi việc nào hợp với làm ngay nhất trong một danh sách, hãy chọn việc sửa một lỗi cụ thể có stack trace rõ trong một file. Các đáp án còn lại đều là việc cho plan mode: đổi schema database kèm mọi model liên quan, đổi thư viện quản lý state trên cả một app React lớn, hay thiết kế tích hợp với một API mới khi chưa rõ phụ thuộc.

## Plan mode cho thay đổi lớn và quyết định kiến trúc

Việc thứ ba lớn hơn hẳn. Đội quyết định bỏ thư viện ngày giờ cũ, đổi sang một thư viện mới. Ở thư viện mới, bạn không sửa thẳng được một đối tượng ngày, vì mỗi lần cộng ngày sẽ nhận về một đối tượng mới. Cách định dạng ngày cũng khác. Grep cho thấy thư viện cũ được import ở 48 file, rải khắp các phần lịch hẹn, lịch tiêm, nhắc tái khám và hoá đơn.

Nếu Minh Anh bảo Claude làm ngay, Claude sẽ gặp file nào sửa file đó. Có những chỗ code cũ cộng ngày thẳng vào một đối tượng rồi truyền chính đối tượng đó sang hàm khác dùng tiếp. Khi phép cộng trả về đối tượng mới, hàm phía sau không còn thấy ngày đã cộng, và luồng dữ liệu hỏng. Nếu sửa tới file thứ 20 mới phát hiện ra, Minh Anh phải quay lại làm từ đầu.

Minh Anh vào plan mode. Claude đọc các module dùng thư viện cũ, tìm những chỗ đối tượng ngày được truyền qua nhiều hàm, rồi đề xuất một chiến lược chuyển đổi (**migration strategy**): viết một wrapper chung trước, đổi các module theo thứ tự phụ thuộc, chạy test sau mỗi module. Minh Anh và anh Quân đọc kế hoạch, sửa thứ tự một bước, rồi duyệt.

Duyệt xong, session thoát plan mode và Claude sửa từng module theo đúng thứ tự đã thống nhất. Đây là cách kết hợp hai chế độ cho việc lớn. Bạn dùng plan mode để tìm hiểu và chọn cách làm, rồi làm ngay theo kế hoạch đã duyệt (**combining plan mode for investigation with direct execution for implementation**).

**Sơ đồ: Đổi thư viện ở 48 file: làm ngay thì sửa dở 20 file mới thấy hỏng, plan mode thấy trước khi sửa**

✗ _Làm ngay_
1. Gặp file nào sửa file đó, trong **48 file**
   ↓ _có chỗ cộng ngày vào một đối tượng rồi dùng lại ở hàm khác_
2. Kiểu trả về đối tượng mới làm hỏng luồng dữ liệu ở chỗ khác
3. **File thứ 20** mới thấy hỏng, phải làm lại từ đầu

✓ _Plan mode, rồi làm theo kế hoạch_
1. Claude đọc các module, tìm chỗ đối tượng ngày truyền qua nhiều hàm
2. Kế hoạch: **lớp bọc chung** trước, đổi theo thứ tự phụ thuộc, test sau mỗi module
   ↓ _Minh Anh và anh Quân sửa thứ tự một bước, rồi duyệt_
3. Thoát plan mode, Claude sửa từng module theo đúng thứ tự

> **Bẫy đề**
>
> Một đợt kiểm tra bảo mật yêu cầu nâng thư viện xác thực từ v2 lên v3. Bản hướng dẫn nâng cấp liệt kê các breaking change: `authenticate()` trả về Promise thay vì nhận callback, kiểu `User` đổi thứ tự field, ba method cũ bị xoá. Thư viện được import ở 45 file trên nhiều module. Cách hiệu quả nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tạo một slash command gói các phép chuyển đổi, rồi chạy trên từng file mà không khảo sát codebase trước** (_a custom slash command per file_). Nghe như tự động hoá được việc lặp lại. Nhưng chuyển từ callback sang Promise làm thay đổi cách code chạy qua nhiều file, nên sửa từng file riêng lẻ mà không hiểu cả hệ thống thì dễ làm vỡ code.
> - **Nâng version, chạy test, rồi để Claude Code sửa từng lỗi khi nó hiện ra** (_upgrade and fix failures_). Cách này nghe nhanh. Có điều nó đi theo lỗi chứ không theo một chiến lược, và những chỗ test không phủ sẽ lọt.
> - **Dán các breaking change vào prompt và làm ngay trên cả 45 file** (_direct execution across 45 files_). Nghe như Claude đã có đủ thông tin. Ngặt nỗi danh sách thay đổi không cho biết code của bạn dùng thư viện thế nào, nên Claude vẫn sửa mà không hiểu các phụ thuộc.
>
> **Chọn:** vào plan mode để khảo sát cách thư viện được dùng trên các module, tìm các nhánh code bị ảnh hưởng, rồi lập chiến lược chuyển đổi trước khi sửa.

> **Trong đề chọn gì**
>
> Nếu đề kể một dev được giao đổi một thư viện utility dùng chung mà hơn 45 file đang import, hãy chọn plan mode để khảo sát codebase, hiểu các phụ thuộc và chọn hướng trước khi sửa. Làm ngay rồi đợi các phụ thuộc tự lộ ra trong lúc sửa chính là cách dẫn tới phải làm lại. Bắt đầu làm ngay rồi chỉ chuyển sang plan mode khi gặp lỗi biên dịch cũng vậy, vì lúc đó nhiều file đã bị sửa dở. Có đáp án nhắc tới một slash command giúp vượt giới hạn context, nhưng đáp án đó cũng sai, vì không có slash command nào được làm ra cho việc này.

Việc thứ tư của Minh Anh là làm thông báo tức thời. Khi khách bấm check-in trên app, máy của lễ tân phải hiện ngay tên khách và tên thú cưng. Việc này làm được bằng WebSockets, Server-Sent Events hoặc polling định kỳ. Mỗi cách khác nhau về độ phức tạp, về trình duyệt hỗ trợ, và về hạ tầng phải thêm. Chọn cách nào là quyết định kiến trúc, nên đội phải cùng duyệt.

Minh Anh vào plan mode và bảo Claude đọc phần backend hiện có, so ba cách theo hạ tầng đội đang chạy, rồi trình bày ưu nhược của từng cách trước khi viết dòng code nào. Khi còn nhiều cách làm hợp lý mà đội chưa chọn, việc cần làm là so sánh để đội quyết, chưa phải lúc viết code.

> **Bẫy đề**
>
> Đội đang chọn giữa hai hướng tích hợp một cổng thanh toán mới. Một hướng cần thêm message queue và một nhóm worker chạy async. Hướng kia gọi đồng bộ từ các service hiện có, kèm logic retry. Hai hướng có ưu nhược khác nhau về hạ tầng và vận hành, và đội chưa quyết. Nên làm tiếp với Claude Code thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Làm ngay, để Claude ước lượng hướng nào thêm ít file và module hơn rồi cài hướng nhỏ hơn** (_pick the smaller one_). Nghe tiết kiệm công. Nhưng đội cần so chi phí vận hành và rủi ro, mà số file nhiều hay ít không nói lên hai điều đó.
> - **Dùng plan mode để Claude soạn thiết kế chi tiết cho hướng dùng queue, rồi coi đó là hướng đội đã chọn** (_plan only the queue approach_). Nghe như đã dùng đúng plan mode. Có điều đội chưa chọn hướng nào, nên thiết kế một hướng rồi coi như đã chọn là bỏ qua bước so sánh.
> - **Làm ngay cả hai hướng trên hai nhánh, rồi so hai pull request và giữ một** (_build both_). Nghe như so sánh bằng code thật. Ngặt nỗi cách này tốn công viết code cho một hướng chắc chắn sẽ bị bỏ.
>
> **Chọn:** dùng plan mode để Claude đọc các service hiện có, so hai hướng về chi phí vận hành và rủi ro, rồi báo lại trước khi viết code.

> **Trong đề chọn gì**
>
> Nếu đề kể một tính năng cập nhật thời gian thực làm được bằng WebSockets, Server-Sent Events hoặc polling, mỗi cách một kiểu ưu nhược về hạ tầng, hãy chọn vào plan mode để khảo sát kiến trúc, cân ưu nhược từng cách và trình bày các lựa chọn cho đội duyệt trước khi cài đặt. Ba đáp án còn lại (làm ngay với WebSockets rồi refactor khi gặp vấn đề, làm polling trước rồi tính sau, hay để Claude tự phân tích rồi cài cách nó thấy tốt nhất) đều chốt một hướng trước khi đội kịp so sánh.

## Chia pha cho việc cần nhiều phán đoán

Ngoài độ lớn của việc, còn một điều nữa quyết định có nên lên kế hoạch trước hay không: việc đó cần phán đoán nhiều hay ít. Cuối tuần, anh Quân gửi thêm hai yêu cầu. Yêu cầu A là đổi tên hàm `layLichHen` thành `taiLichHen` ở mọi chỗ dùng. Yêu cầu B là cải thiện cách xử lý lỗi trong cả module thanh toán, gồm thêm `try/catch`, viết thông báo lỗi có nghĩa, và bảo đảm lỗi không âm thầm làm hỏng dữ liệu.

Yêu cầu A là việc cơ học, cứ chỗ nào gọi tên cũ thì đổi sang tên mới, không có gì phải phán đoán. Yêu cầu B thì mở, nghĩa là không có sẵn một cách làm đúng mà phải phán đoán ở từng chỗ. Chỗ nào cần `try/catch`, thông báo lỗi thế nào là có nghĩa, lỗi nào có thể làm hỏng dữ liệu, đều phải cân nhắc. Với yêu cầu B, nên chia thành nhiều pha (**multi-phase tasks**): Claude phân tích trước, đề xuất cách sửa, rồi mới cài đặt kèm review. Nhờ vậy đội xem được hướng làm trước khi Claude sửa hàng loạt. Còn với yêu cầu A, chia pha gần như không thêm được gì, vì kết quả đúng đã rõ từ đầu. Yêu cầu B cũng không phải trường hợp chia pha chẳng giúp gì, và hai yêu cầu không được lợi như nhau.

## Dùng subagent Explore cho phần khảo sát dài

Ở lần đổi thư viện ngày giờ, Claude phải đọc 48 file trước khi viết được kế hoạch. Toàn bộ phần Claude đọc được là output khảo sát rất dài (**verbose discovery output**). Nếu nó nằm lại trong cuộc trò chuyện chính, context có nguy cơ bị đầy (**context window exhaustion**) trước khi Claude kịp sửa code. Việc càng chia nhiều pha thì nguy cơ này càng lớn.

Claude Code có sẵn một subagent tên **Explore** cho việc này. Subagent là một agent phụ mà Claude gọi ra để làm riêng một phần việc, rồi gửi kết quả về. Explore là subagent chỉ đọc, chạy nhanh, làm riêng cho việc tìm file, tìm code và khảo sát codebase. Nó không có quyền dùng Write và Edit. Claude giao việc khảo sát cho Explore khi cần tìm hiểu codebase mà không sửa gì. Explore đọc file trong context riêng của nó rồi chỉ gửi về bản tóm tắt, nên phần khảo sát dài không chiếm chỗ trong cuộc trò chuyện chính. Khi giao việc, Claude chọn mức kỹ lưỡng cho Explore: **quick** cho tra cứu nhanh, **medium** cho khảo sát vừa phải, **very thorough** cho phân tích toàn diện.

**Sơ đồ: Explore đọc 48 file ở context riêng, context chính chỉ nhận bản tóm tắt và còn chỗ để sửa code**
_Ranh giới context: Claude trong plan mode ở cuộc trò chuyện chính giao việc khảo sát cho subagent Explore; Explore chỉ đọc, không có Write và Edit, đọc 48 file của lịch hẹn, lịch tiêm, nhắc tái khám, hoá đơn trong context riêng và chỉ gửi bản tóm tắt về; không có Explore thì nội dung 48 file nằm lại context chính_

- **CUỘC TRÒ CHUYỆN CHÍNH**
- **Claude, plan mode**: đổi thư viện ngày giờ
- **CONTEXT CHÍNH**: yêu cầu của Minh Anh
- bản tóm tắt từ Explore
- còn chỗ cho phần sửa code
- **CONTEXT RIÊNG CỦA EXPLORE**
- **Explore, chỉ đọc**: không có Write, Edit
- lịch hẹn
- lịch tiêm
- nhắc tái khám
- hoá đơn
- 2. đọc hết 48 file ở đây
- mức kỹ lưỡng Claude chọn:
- quick, medium, very thorough
- 1. giao khảo sát
- 3. chỉ gửi tóm tắt
- **Không có Explore**: nội dung 48 file nằm lại context chính, nên context đầy trước khi sửa code

Trong plan mode, Claude còn có một subagent có sẵn khác là **Plan**. Plan cũng chỉ đọc, và Claude giao cho nó phần tìm hiểu code trước khi trình bày kế hoạch, để kết quả khảo sát nằm ở context riêng. Explore và Plan đều khởi động mà không nạp CLAUDE.md, nên khảo sát nhanh hơn và tốn ít token hơn.

> **Bẫy đề**
>
> Trong một lần refactor rất phức tạp, nhiều pha, context có nguy cơ bị đầy vì output khảo sát quá dài, trước khi sửa được dòng code nào. Claude Code có sẵn cơ chế nào để giảm chuyện này trong lúc lên kế hoạch? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Lệnh `/compact` chạy tự động trong một hook `PreToolUse`** (_auto /compact in a hook_). Nghe như dọn context thường xuyên. Nhưng `/compact` chỉ tóm lại cuộc trò chuyện sau khi output đã vào context, còn đề cần giữ output khảo sát ở ngoài context chính ngay từ đầu.
> - **Message Batches API**. Nghe như hợp với khối lượng lớn. Có điều Batches API là cách gửi nhiều request lên API mà không cần kết quả ngay, chứ không phải cơ chế quản lý context trong một session Claude Code.
> - **Flag CLI `--json-schema` để ép output khảo sát nén lại** (_--json-schema_). Nghe như làm output ngắn hơn. Ngặt nỗi flag này dùng để ép câu trả lời cuối theo đúng một schema, chứ không tách phần Claude đọc trong lúc khảo sát ra khỏi context chính.
>
> **Chọn:** subagent Explore, để output khảo sát nằm ở context riêng và chỉ bản tóm tắt quay về cuộc trò chuyện chính.

> **Ý chính**
>
> Việc nhỏ, phạm vi rõ thì làm ngay. Việc lớn, nhiều file, nhiều cách làm hay có quyết định kiến trúc thì dùng plan mode để tìm hiểu và chọn cách làm, rồi làm theo kế hoạch đã duyệt.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 3.4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Choose a permission mode, Plan mode (Claude Code)](https://code.claude.com/docs/en/permission-modes)
3. [Common workflows (Claude Code)](https://code.claude.com/docs/en/common-workflows)
4. [Create custom subagents, Built-in subagents (Claude Code)](https://code.claude.com/docs/en/sub-agents)
5. [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
