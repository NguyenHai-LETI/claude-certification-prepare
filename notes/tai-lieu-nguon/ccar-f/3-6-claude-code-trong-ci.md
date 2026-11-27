---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-6-claude-code-trong-ci
ngay_tai: 2026-11-27
tieu_de: Đưa Claude Code vào pipeline CI/CD
---

Domain 3: Claude Code Configuration & Workflows · Task 3.6

# Đưa Claude Code vào pipeline CI/CD

Chạy Claude Code trong CI bằng -p, lấy kết quả có cấu trúc bằng --output-format json và --json-schema, đưa context qua CLAUDE.md, review bằng session riêng.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 7 nguồn

## Đọc xong bạn nắm được

- Chạy Claude Code không tương tác bằng -p để job CI không bị treo
- Dùng --output-format json với --json-schema để script đọc được kết quả và đăng comment
- Đưa chuẩn test, fixture và tiêu chí review vào CLAUDE.md cho Claude Code chạy trong CI
- Chạy lại review sau commit mới mà không lặp comment cũ, sinh test không trùng test có sẵn
- Giải thích vì sao session viết code review kém hơn một session review độc lập

Claude Code không chỉ chạy trong terminal của bạn. Bạn có thể gọi nó trong pipeline CI/CD để review pull request, sinh test hay kiểm bảo mật mỗi khi có code mới. Khác biệt lớn là trong CI không có ai ngồi gõ phím. Không ai trả lời câu hỏi của Claude, và kết quả phải để một script đọc chứ không phải người đọc.

Bài này đi qua những việc cần làm để Claude Code chạy ổn trong CI. Bạn cho Claude Code chạy không tương tác, lấy kết quả có cấu trúc, đưa context của dự án vào, chạy lại review mà không lặp comment, và review bằng một session khác với session đã viết code.

**Sơ đồ: Trong CI, claude -p nhận diff và context của dự án, trả object JSON để script đăng comment**
_Bản đồ bài: lần gọi claude -p trong CI nhận pull request (diff và repo, chạy lại mỗi commit mới), chỉ dẫn review qua --append-system-prompt nối vào prompt mặc định, CLAUDE.md chứa chuẩn test, fixture và mẫu có chủ ý, cùng phát hiện cũ và test có sẵn của lần chạy trước. claude -p chạy không tương tác, làm xong rồi thoát, giới hạn bằng --max-turns và --max-budget-usd, là session mới độc lập chỉ thấy diff và repo, không tự review bằng session đã viết code. Kết quả là object JSON nhờ --output-format json và --json-schema, có structured_output, result và total_cost_usd; script đọc findings để đăng comment inline. Ngoài pipeline tự viết, Code Review managed qua Claude GitHub App đọc REVIEW.md ở gốc repo cho luật chỉ dành cho review_

- **ĐƯA VÀO LẦN GỌI**
- **Pull request**: diff và repo
- mỗi commit mới chạy lại
- **Chỉ dẫn review**: --append-system-prompt
- nối vào prompt mặc định
- **CLAUDE.md**: chuẩn test, fixture,
- mẫu có chủ ý
- **Lần chạy trước**: phát hiện cũ,
- test có sẵn của module
- **claude -p**: không tương tác:
- làm xong rồi thoát
- --max-turns
- --max-budget-usd
- session mới, độc lập,
- chỉ thấy diff và repo
- **Tự review**: bằng chính session đã viết,
- mang giả định lúc viết
- **Object JSON**: --output-format json
- và --json-schema
- structured_output
- result
- total_cost_usd
- findings
- **Script**: đăng comment inline
- ngay tại dòng có vấn đề
- **CODE REVIEW MANAGED (CLAUDE GITHUB APP)**: REVIEW.md ở gốc repo: luật chỉ dành cho review

## Ví dụ xuyên suốt: review PR tự động cho phần mềm bán bảo hiểm xe máy

Một công ty bảo hiểm ở Hà Nội bán bảo hiểm xe máy qua app và website. Backend viết bằng TypeScript, repo `bao-hiem-xe` dùng GitHub Actions. Mỗi ngày đội 8 dev mở khoảng 25 pull request. Anh Bình phụ trách DevOps, Hạnh là dev viết phần tính phí bảo hiểm.

Đội muốn ba việc chạy tự động trên mỗi PR. Claude review code và đăng comment ngay tại dòng có vấn đề. Claude sinh test cho code mới. Bước review chặn merge nếu có lỗi nghiêm trọng. Ngoài repo chính, công ty còn vài repo nhỏ cho trang quản trị, ít người làm hơn.

## Chạy không tương tác bằng flag -p

Anh Bình viết bước đầu tiên của workflow là `claude "Review PR này"`. Job chạy, rồi đứng im cho tới khi GitHub Actions cắt vì hết thời gian. Chạy `claude` mà không kèm flag nào thì nó mở session tương tác (**interactive mode**) và chờ người gõ tiếp, mà trong CI thì không có ai gõ.

Flag `-p` (hay `--print`) cho Claude Code chạy không tương tác (**non-interactive mode**). Claude làm xong việc, in kết quả rồi thoát, không chờ ai trả lời. Claude Code thoát với exit code 0 khi chạy thành công và exit code khác 0 khi lỗi, nên script trong CI có thể dựa vào exit code để quyết định bước tiếp theo. Anh Bình sửa lệnh thành `claude -p "Review PR này"`, và job chạy xong trong vài phút.

Vài hôm sau có một PR hơn 50 file. Lần review đó, Claude đọc file, chạy tool rồi lặp lại nhiều vòng, mất hơn 20 phút mới xong. Đội muốn chính Claude Code tự dừng mỗi lần gọi khi chạm một giới hạn đặt trước, chứ không đợi GitHub Actions cắt. Flag `--max-turns` giới hạn số vòng agentic, tức số lần Claude gọi tool, đọc kết quả rồi quyết định bước tiếp. Còn `--max-budget-usd` dừng lần chạy khi chi phí ước tính chạm mức đặt ra. Cả hai chỉ dùng được với `-p`. Đội thêm `--max-turns 10 --max-budget-usd 2.00` vào lệnh.

> **Trong đề chọn gì**
>
> Nếu đề hỏi tổ hợp flag nào để job CI chạy không treo và cho ra output máy đọc được, hãy chọn `claude -p` kèm `--output-format json` và `--json-schema`. Không có flag `--batch`, `--ci-mode` hay `--format structured`. Cách chạy không tương tác là flag `-p`, chứ không phải một biến môi trường như `CLAUDE_HEADLESS`.
>
> Nếu đề hỏi cấu hình nào để Claude Code tự áp cả giới hạn số vòng lặp lẫn giới hạn tiền cho mỗi lần gọi, hãy chọn cách thêm `--max-turns` và `--max-budget-usd` vào lệnh `claude -p`. Đặt `--permission-mode dontAsk` chỉ từ chối các tool chưa được cho phép, không giới hạn vòng hay tiền. Đổi sang model rẻ hơn làm mỗi vòng rẻ hơn nhưng không đặt mức trần nào. Đặt giới hạn thời gian cho bước job (như `timeout-minutes` của GitHub Actions) là giới hạn do runner áp, không phải Claude Code. Còn theo dõi chi phí trên Console, trang quản lý tài khoản API của Anthropic, chỉ để xem lại chứ không chặn được lần chạy nào.

## Lấy kết quả có cấu trúc để script đăng comment

Bước review chạy được, nhưng output là một đoạn markdown dài. Anh Bình cần một script đọc kết quả rồi đăng từng phát hiện thành comment ngay tại dòng code (**inline PR comment**). Muốn vậy, script cần kết quả có cấu trúc (**structured output**), tức là biết chắc mỗi phát hiện có đủ tên file, số dòng, mức độ nghiêm trọng và nội dung.

Flag `--output-format json` cho Claude Code in kết quả dưới dạng một object JSON. Nếu thêm `--json-schema` kèm một JSON Schema, Claude Code sẽ đặt kết quả khớp schema đó vào field `structured_output` của object, như trong lệnh dưới đây.

```bash
claude -p "Review diff của PR này so với main" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"findings":{"type":"array","items":{"type":"object","properties":{"file":{"type":"string"},"line":{"type":"integer"},"severity":{"type":"string","enum":["nghiem-trong","nen-sua","goi-y"]},"message":{"type":"string"}},"required":["file","line","severity","message"]}}},"required":["findings"]}' \
  | jq '.structured_output.findings'
```

Script đọc mảng `findings` rồi gọi API của GitHub để đăng từng comment. Nếu lần chạy kết thúc mà không có kết quả hợp lệ, ví dụ vì Claude từ chối yêu cầu, object trả về sẽ không có field `structured_output`. Vì vậy, script của anh Bình kiểm xem có field này không rồi mới dùng.

Object JSON đó còn chứa sẵn thông tin khác ngoài kết quả. Field `result` chứa câu trả lời dạng chữ, `total_cost_usd` là tổng chi phí ước tính, ngoài ra còn có một bảng chia chi phí theo từng model. Khi bộ phận tài chính hỏi mỗi lần review tốn bao nhiêu, anh Bình chỉ cần cho script đọc thêm các field này, không phải thêm flag nào.

**Sơ đồ: Một object JSON: script lấy findings trong structured_output, tài chính đọc total_cost_usd**
- có
- không
- claude -p trên PRcủa bao-hiem-xe--output-format json--json-schema
- Object JSON in ra stdout
- Cóstructured_output?
- resultcâu trả lời dạng chữ
- total_cost_usd vàbảng chi phí theo model
- structured_output.findingsscript đăng comment inline
- Không có kết quả hợp lệ,ví dụ Claude từ chối
- Bộ phận tài chínhtheo dõi mỗi lần chạy

> **Bẫy đề**
>
> Pipeline CI phải đọc feedback review của Claude bằng code để đăng comment inline lên pull request GitHub. Nên ép đúng cấu trúc của output thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Dùng regex để bóc tách output markdown không cấu trúc** (_regex parsing_). Regex là cách nhiều người nghĩ tới đầu tiên. Nhưng Claude không hứa giữ đúng một kiểu markdown, nên regex vỡ ngay khi cách viết đổi một chút.
> - **Chèn một hook `PostToolUse` để định dạng output thành JSON** (_a PostToolUse hook_). Nghe như tự động hoá được. Có điều hook này chạy sau mỗi lần gọi tool, không phải sau câu trả lời cuối, nên nó không đổi được dạng của kết quả review.
> - **Đưa ít nhất 10 ví dụ few-shot về JSON hợp lệ vào system prompt** (_few-shot examples_). Nghe như dạy Claude cho đúng khuôn. Ngặt nỗi ví dụ chỉ giúp Claude dễ theo khuôn hơn, chứ không có bước nào kiểm xem kết quả có khớp schema hay không.
>
> **Chọn:** thêm `--output-format json` và đưa cấu trúc yêu cầu qua flag `--json-schema`.

> **Trong đề chọn gì**
>
> Nếu đề muốn câu trả lời luôn đúng một khuôn JSON, như object có `passed` kiểu boolean và mảng chuỗi `issues`, hãy chọn `claude -p` kèm `--output-format json` và `--json-schema` với schema bắt buộc cả hai field. Dặn trong `--append-system-prompt` "chỉ trả về JSON" hay ghi yêu cầu vào prompt kèm `--max-turns 1` chỉ là lời dặn, Claude Code không kiểm kết quả có đúng khuôn hay không. Còn `--output-format stream-json` với `--verbose` và `--include-partial-messages` là để xem từng event trong lúc đang chạy, không ép khuôn kết quả.
>
> Nếu đề hỏi chi phí theo từng model của mỗi lần chạy `claude -p --output-format json` đã có sẵn ở đâu, mà không thêm flag mới, hãy chọn object JSON in ra stdout, vốn có `total_cost_usd` và bảng chi phí theo model. Các đáp án nhắc tới trang usage trên Console, `stream-json` hay file transcript `.jsonl` đều bắt bạn đổi flag hoặc đi tìm ở chỗ khác, trong khi object JSON đã có sẵn chi phí cho đúng lần chạy đó.

## Giữ hành vi mặc định khi thêm chỉ dẫn review

Anh Bình muốn Claude review theo bộ chỉ dẫn riêng của đội, nên thêm `--system-prompt "Bạn là reviewer của đội bảo hiểm..."`. Kết quả tệ hơn hẳn, vì Claude chỉ nhìn đoạn diff được đưa vào, không mở file nào khác. Có một PR sửa hàm `tinhPhiCoBan`, hàm này được 14 module khác gọi, vậy mà Claude không mở chỗ nào trong số đó.

Nguyên nhân là `--system-prompt` thay toàn bộ system prompt mặc định của Claude Code, kể cả phần dặn Claude khi nào nên dùng tool để đọc file, tìm code và dùng như thế nào. Flag `--append-system-prompt` thì nối chỉ dẫn của bạn vào cuối prompt mặc định, giữ nguyên hành vi có sẵn. Đội đổi sang `--append-system-prompt`, và Claude lại đọc các file liên quan trước khi kết luận. Nếu chỉ dẫn dài, bạn có thể để nó trong một file rồi dùng `--append-system-prompt-file`.

**Sơ đồ: --system-prompt thay luôn hướng dẫn dùng tool; --append-system-prompt giữ lại và nối thêm**
_Hai cách đưa chỉ dẫn review của đội bảo hiểm. Với --system-prompt, system prompt gửi cho Claude chỉ còn chỉ dẫn của đội; prompt mặc định của Claude Code bị thay, mất phần hướng dẫn khi nào và cách nào dùng tool đọc file, tìm code; Claude chỉ nhìn đoạn diff, không mở chỗ nào trong 14 module gọi tinhPhiCoBan. Với --append-system-prompt, prompt mặc định giữ nguyên hướng dẫn dùng tool, chỉ dẫn của đội nối vào cuối; Claude đọc các file liên quan trước khi kết luận_

- **--system-prompt**: system prompt gửi cho Claude
- **Prompt mặc định: bị thay**: mất hướng dẫn dùng tool
- **Chỉ dẫn của đội**: Bạn là reviewer của đội bảo hiểm...
- **Chỉ nhìn đoạn diff**: tinhPhiCoBan có 14 module gọi,
- Claude không mở chỗ nào
- **--append-system-prompt**: system prompt gửi cho Claude
- **Prompt mặc định: giữ**: còn hướng dẫn dùng tool
- **Chỉ dẫn của đội**: nối vào cuối prompt mặc định
- **Đọc các file liên quan**: trước khi kết luận

> **Bẫy đề**
>
> Pipeline review không tương tác dùng `--system-prompt` cho chỉ dẫn review riêng. Claude chỉ nhìn chữ của diff, không dùng tool đọc file hay tìm code, nên không thấy context của một hàm lõi được nhiều module gọi. Nên đổi gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Bỏ `--system-prompt`, đưa chỉ dẫn vào CLAUDE.md vì `--system-prompt` không dùng chung được với tool use khi chạy `-p`** (_move to CLAUDE.md_). Nghe như đổi chỗ là xong. Nhưng `--system-prompt` vẫn dùng chung được với tool. Vấn đề là nó xoá mất phần hướng dẫn dùng tool trong prompt mặc định.
> - **Nhúng diff vào chuỗi prompt thay vì đưa qua stdin** (_embed the diff in the prompt_). Cách này chỉ đổi đường đưa diff vào. Có điều diff đi đường nào thì system prompt vẫn đã bị thay, và phần hướng dẫn dùng tool vẫn mất.
> - **Giữ `--system-prompt`, thêm `--allowedTools "Read, Glob, Grep"`** (_allow file tools_). Nghe như bật tool lên. Ngặt nỗi `--allowedTools` chỉ cho các tool này chạy mà không cần hỏi, còn phần hướng dẫn dùng tool thì vẫn mất.
>
> **Chọn:** thay `--system-prompt` bằng `--append-system-prompt`, để chỉ dẫn review được nối thêm vào prompt mặc định.

## Đưa context của dự án qua CLAUDE.md

`claude -p` vẫn nạp CLAUDE.md, hook, skill và MCP server giống một session tương tác. Vì vậy CLAUDE.md là chỗ đưa context của dự án cho Claude Code chạy trong CI. Đó là chuẩn test (**testing standards**), quy ước fixture (**fixture conventions**), tức dữ liệu hay object mẫu dựng sẵn để các test dùng chung, và tiêu chí review (**review criteria**).

Bước sinh test của đội ban đầu cho ra nhiều test vô ích. Hạnh đếm thì 55% số test chỉ kiểm hàm không ném exception, kiểm lại thứ đã có test khác phủ, hoặc tự viết object thay cho fixture có sẵn. Hạnh ghi vào `CLAUDE.md` của repo ba thứ: thế nào là test có giá trị, các fixture có sẵn và dùng khi nào (như `taoHopDongGia()` cho hợp đồng mẫu), và một cặp ví dụ so sánh test kiểm hành vi với assertion vô nghĩa. Từ lần chạy sau, Claude sinh test theo đúng chuẩn đó ngay từ đầu, mà đội không phải thêm bước nào vào pipeline.

Hạnh cũng cho bước sinh test chạy các test vừa viết. Test nào fail thì output lỗi cụ thể của test đó, gồm tên test, giá trị mong đợi và giá trị thực tế, được đưa lại cho Claude để sửa tiếp. Có đúng thông báo lỗi, Claude biết phải sửa chỗ nào thay vì đoán.

Bước review cũng gặp chuyện tương tự. Nó cứ báo những cách viết đội cố ý chọn, chẳng hạn class `DieuPhoiHopDong` rất lớn, dù kiến trúc của đội cố ý để class này lớn. Đội ghi vào CLAUDE.md tiêu chí review, gồm báo gì và bỏ qua gì, kèm các cách viết được chấp nhận và lý do, để Claude biết trước đó là cố ý và thôi báo.

Cách đưa context qua CLAUDE.md có một chỗ dễ vấp, đó là flag `--bare`. Anthropic khuyên dùng `--bare` cho các lệnh chạy bằng script, và nó sẽ thành mặc định của `-p` ở một version sau. `--bare` giúp khởi động nhanh bằng cách bỏ qua bước tự tìm hook, skill, plugin, MCP server và CLAUDE.md. Khi dùng `--bare`, CLAUDE.md không còn tự được nạp, nên bạn phải tự đưa nó vào, chẳng hạn bằng `--append-system-prompt-file ./CLAUDE.md`.

> **Bẫy đề**
>
> Bước sinh test cho ra nhiều test giá trị thấp: assertion vô nghĩa, test trùng phần đã phủ, test bỏ qua quy ước fixture. Làm sao giảm ngay từ đầu tỉ lệ test giá trị thấp, mà không tăng độ trễ hay sửa script pipeline? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm bước phân tích coverage sau khi sinh, loại test không làm tăng line coverage** (_coverage filter_). Cách này có vẻ khách quan. Nhưng lọc sau khi sinh không giảm được số test tệ sinh ra, và coverage cũng không cho biết test có kiểm đúng hành vi không.
> - **Sinh test hai pha, một lần gọi Claude thứ hai chấm từng test rồi loại test điểm thấp** (_second-pass grading_). Nghe chặt chẽ. Có điều cách này thêm một lần gọi, thêm độ trễ và chi phí, và vẫn chỉ lọc sau khi đã sinh.
> - **Chỉ sinh test ở những thư mục mà trước đây đội giữ lại nhiều test Claude sinh ra** (_only in high-acceptance directories_). Nghe như né chỗ tệ. Ngặt nỗi cách này bỏ luôn việc sinh test ở chỗ cần nhất, không sửa nguyên nhân.
>
> **Chọn:** ghi chuẩn test vào CLAUDE.md, gồm tiêu chí test có giá trị, các fixture có sẵn kèm mục đích dùng, và ví dụ phân biệt test hành vi có ý nghĩa với assertion vô nghĩa.

> **Trong đề chọn gì**
>
> Nếu đề hỏi hai chiến lược nên dùng khi đưa Claude vào quy trình sinh test, hãy chọn ghi chuẩn test, tiêu chí test có giá trị và fixture vào CLAUDE.md của project, và đưa cho Claude output lỗi cụ thể của test để sửa dần. Dùng hook `PreToolUse` chạy test để chặn lưu code là sai chỗ, vì hook này chạy trước khi tool chạy, tức là trước khi code mới được lưu, và chặn lưu thì vòng sửa cũng dừng. Dựa vào chỉ số coverage tổng cũng sai, vì coverage chỉ cho biết dòng nào được chạy qua, không cho biết test có kiểm đúng ý nghĩa không.
>
> Nếu đề kể review tự động cứ báo những cách viết đội dùng có chủ ý, như force-unwrap trong file test hay import module nội bộ đã đánh dấu deprecated, và hỏi cách để review không báo những chỗ đó ngay từ đầu, hãy chọn ghi các cách viết được chấp nhận vào CLAUDE.md của dự án. Nếu chỉ cho Claude xem những dòng thay đổi và bỏ context xung quanh, review sẽ kém đi. Lọc theo từ khoá như "force unwrap" sau khi sinh thì chặn cả phát hiện đúng. Thêm comment chặn ở từng dòng rồi bỏ các dòng đó khỏi diff là giấu code khỏi review.
>
> Nếu đề kể job CI mất 18 giây khởi động vì tự tìm hook, MCP server, plugin, skill và nhiều CLAUDE.md lồng nhau, và chuẩn của đội nằm ở CLAUDE.md gốc, hãy chọn chạy `--bare` kèm `--append-system-prompt-file ./CLAUDE.md`. Nếu chạy `--bare` rồi chép mọi tiêu chí vào prompt của `-p`, chuẩn sẽ nằm ở hai chỗ và dễ lệch nhau. `--system-prompt-file ./CLAUDE.md` thay hẳn prompt mặc định, mất hướng dẫn dùng tool. Còn `--exclude-dynamic-system-prompt-sections` chỉ giúp prompt cache dùng lại được giữa các máy, không bỏ bước tự tìm.

Với mấy repo nhỏ của trang quản trị, đội không muốn tự viết pipeline. Cách khác là bật Code Review, dịch vụ review do Anthropic chạy sẵn (managed) qua Claude GitHub App. Dịch vụ này tự review PR theo cài đặt của tổ chức, đội không phải viết workflow nào. Nó đọc hai file. CLAUDE.md là hướng dẫn chung của dự án, áp cho mọi việc kể cả review. `REVIEW.md` ở gốc repo chứa luật chỉ dành cho review, gồm báo gì, ở mức nào và bỏ qua gì. Luật chỉ dành cho review PR nên để trong `REVIEW.md`, như bỏ qua file sinh tự động, bỏ qua những gì linter của CI đã kiểm, hay buộc mỗi phát hiện phải dẫn ra đúng dòng code cho thấy hành vi sai.

> **Trong đề chọn gì**
>
> Nếu đề kể Code Review managed của Claude báo trung bình 18 phát hiện mỗi PR, trong đó có lỗi style mà linter đã bắt, phát hiện trên code sinh tự động trong `src/gen/`, và các cách render có chủ ý bị báo nhầm, hãy chọn tạo `REVIEW.md` ở gốc repo. File này chứa luật bỏ qua phần CI đã kiểm và file sinh tự động, và thêm luật buộc mỗi phát hiện về render phải dẫn ra đúng dòng code gây lỗi. Workflow GitHub Actions riêng cho từng vùng code hay tham số prompt của action không phải là cách cấu hình Code Review managed. Còn dồn hết vào CLAUDE.md là trộn luật chỉ dành cho review vào hướng dẫn chung của mọi việc, và cũng thiếu luật buộc phát hiện phải dẫn ra đúng dòng code.

## Chạy lại review sau commit mới, và sinh test không trùng

Hạnh đẩy thêm commit để sửa theo review. Bước review chạy lại từ đầu và đăng lại đủ 9 comment cũ, kể cả 6 cái Hạnh đã sửa. Nhìn vào PR, không ai biết comment nào còn đúng.

Anh Bình sửa bước review. Trước khi gọi Claude, script lấy các phát hiện của lần review trước (**prior review findings**) và đưa vào context, kèm lời dặn Claude chỉ báo vấn đề mới, hoặc vấn đề cũ mà commit mới vẫn chưa sửa (**new or still-unaddressed issues**). Lần chạy sau, Claude chỉ báo 3 phát hiện còn lại, không đăng lại comment trùng.

**Sơ đồ: Chạy lại mà không kèm phát hiện cũ thì đăng lại 9 comment; kèm phát hiện cũ thì chỉ còn 3**

✗ _Chạy lại review từ đầu_
1. Hạnh đẩy commit mới, đã sửa **6 trong 9** chỗ bị báo
   ↓ _Claude không có phát hiện của lần trước_
2. **9 comment** đăng lại đủ, kể cả 6 cái Hạnh đã sửa

✓ _Đưa phát hiện cũ vào context_
1. Script đưa phát hiện của lần trước, dặn chỉ báo cái mới hoặc cái chưa sửa
   ↓ _Claude đối chiếu với commit mới_
2. **3 phát hiện** còn lại, không đăng lại comment trùng

Bước sinh test cũng có vấn đề tương tự. Claude đề xuất test cho trường hợp xe quá 10 năm tuổi bị tính thêm phí, trong khi `tinhPhi.test.ts` đã có đúng test đó. Hạnh cho bước sinh test đọc các file test có sẵn của module (**existing test files**) trước khi sinh, để Claude thấy tình huống nào đã có test rồi và chỉ đề xuất test cho phần còn thiếu, không sinh trùng (**duplicate scenarios**).

## Review bằng một session khác với session đã viết code

Bước sinh test lúc đầu còn có một khâu tự kiểm. Sau khi sinh test, cũng chính lần gọi `claude -p` đó được dặn review lại các test vừa viết rồi mới commit. Khâu này gần như lần nào cũng khen. Session đó mang theo cả lập luận và các giả định lúc viết test, nên nó dễ tin rằng test đúng như nó định viết, và bỏ qua chính những chỗ nó đã hiểu sai từ đầu. Hiện tượng này gọi là thiên kiến xác nhận (**confirmation bias**), tức xu hướng chỉ thấy những gì khớp với điều mình đã tin.

Đội tách khâu review sang một lần gọi `claude -p` mới, không mang context của lần gọi đã viết test. Tách context giữa hai session như vậy (**session context isolation**) cho ra một bản review độc lập (**independent review instance**). Session review chỉ thấy diff và repo, nên không bị lập luận cũ dẫn dắt, và bắt được những lỗi mà session viết test đã bỏ qua. Đây cũng là lý do lệnh `/code-review` chạy review trong một subagent mới, chưa từng thấy cuộc trò chuyện của bạn.

> **Trong đề chọn gì**
>
> Nếu đề hỏi hai cách làm nên dùng khi đưa Claude Code vào CI/CD, hãy chọn tách session sinh code khỏi session review để tránh thiên kiến xác nhận, và chạy Claude Code với `-p` để chạy không tương tác. Để chính session sinh code review lần cuối là giữ nguyên thiên kiến đó. Còn Message Batches API, cách gửi nhiều request một lượt và nhận kết quả sau, thì không hợp với bước kiểm phải xong trước khi merge, vì batch không hứa trả kết quả ngay và có thể mất tới 24 giờ.

> **Ý chính**
>
> Trong CI, gọi Claude Code bằng `-p`. Muốn script đọc được kết quả thì thêm `--output-format json` và `--json-schema`, rồi đọc field `structured_output`.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 3.6](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Run Claude Code programmatically (Claude Code)](https://code.claude.com/docs/en/headless)
3. [CLI reference (Claude Code)](https://code.claude.com/docs/en/cli-reference)
4. [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
5. [Code Review (Claude Code)](https://code.claude.com/docs/en/code-review)
6. [Customize Code Review (Claude Code)](https://code.claude.com/docs/en/code-review-customize)
7. [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
