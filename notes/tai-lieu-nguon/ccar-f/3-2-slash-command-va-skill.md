---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-2-slash-command-va-skill
ngay_tai: 2026-11-27
tieu_de: Tạo slash command và skill cho Claude Code
---

Domain 3: Claude Code Configuration & Workflows · Task 3.2

# Tạo slash command và skill cho Claude Code

Đặt lệnh và skill ở đâu để cả nhóm dùng chung, cấu hình frontmatter context fork, allowed-tools, argument-hint, và khi nào dùng skill thay CLAUDE.md.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Đặt lệnh và skill trong repo để cả nhóm dùng, hoặc trong thư mục home để dùng riêng
- Dùng context fork để skill có output dài chạy tách khỏi cuộc trò chuyện chính
- Cấu hình allowed-tools và argument-hint trong frontmatter của SKILL.md
- Tạo bản skill riêng cho mình mà không ảnh hưởng tới đồng đội
- Chọn giữa skill và CLAUDE.md cho từng loại hướng dẫn

Trong Claude Code, gõ `/` là ra danh sách lệnh. Ngoài các lệnh có sẵn, bạn có thể tự tạo lệnh (**custom slash command**) cho những việc nhóm làm đi làm lại, như review code theo checklist, thêm một loại sản phẩm mới theo mẫu, hay phân tích một module trước khi sửa.

Bên cạnh lệnh còn có skill, một thư mục chứa hướng dẫn và file đi kèm mà bạn cũng gọi bằng `/` y như lệnh, và CLAUDE.md, file hướng dẫn chung mà Claude Code tự đọc ở đầu mỗi session. Bài này trả lời bốn câu hỏi. Đặt lệnh ở đâu để cả nhóm cùng có? Cấu hình lệnh bằng những field nào? Lệnh có output dài thì làm sao để nó không làm rối cuộc trò chuyện chính? Và khi nào nên viết hướng dẫn thành skill thay vì ghi vào CLAUDE.md?

**Sơ đồ: Lệnh và skill nằm trong repo hay thư mục home, cấu hình bằng frontmatter, nạp đầy đủ khi được gọi**
_Bản đồ bài, ba cột. Đặt ở đâu: repo với .claude/commands/ và .claude/skills/ cho cả đội, commit theo git; thư mục home với ~/.claude/skills/ chỉ cho bạn, bản riêng đặt tên khác để không che bản của đội; trùng tên thì Enterprise trước Personal, rồi Project. Frontmatter của SKILL.md: description nói khi nào dùng, argument-hint gợi ý tham số, context: fork cho output dài chạy ở subagent riêng, allowed-tools cho chạy không cần hỏi, disallowed-tools bỏ hẳn tool khi chạy. Nạp vào context: CLAUDE.md nạp mọi session, cho quy ước của mọi việc; skill nạp đầy đủ khi được gọi, cho quy trình của một loại việc_

- **ĐẶT Ở ĐÂU**
- **Repo: cả đội**: .claude/commands/
- .claude/skills/
- commit, đi theo git
- **Home: chỉ bạn**: ~/.claude/skills/
- bản riêng: tên khác
- để không che bản đội
- Trùng tên thì chạy bản:
- **Enterprise > Personal**
- **> Project**
- **FRONTMATTER SKILL.MD**
- **description**: khi nào dùng skill
- **argument-hint**: gợi ý tham số
- **context: fork**: output dài ở subagent
- **allowed-tools**: chạy không cần hỏi
- **disallowed-tools**: bỏ hẳn tool khi chạy
- **NẠP VÀO CONTEXT**
- **CLAUDE.md**: nạp mọi session
- quy ước cho mọi việc:
- lệnh test, đặt tên
- **Skill**: nạp đầy đủ khi gọi
- cho một loại việc:
- review, thêm model

## Ví dụ xuyên suốt: phần mềm bảo hành cho một hãng máy lọc nước

Một hãng máy lọc nước ở Bình Dương bán khoảng 30 model máy và có 120 điểm bảo hành trên cả nước. Phần mềm bảo hành của hãng viết bằng Python (Django). Khi khách mang máy tới, kỹ thuật viên tạo phiếu, hệ thống tự tính máy còn bảo hành hay không, đặt linh kiện và nhắn tin báo khách khi sửa xong.

Đội phần mềm có 6 dev. Anh Đạt là trưởng nhóm, Trâm vào đội được hai tháng. Cả đội dùng Claude Code hằng ngày, và có ba việc họ lặp lại nhiều nhất: review pull request theo checklist 8 mục, thêm một model máy mới vào hệ thống, và phân tích một module cũ trước khi sửa.

## Đặt lệnh ở đâu để cả đội cùng dùng

Anh Đạt viết checklist review thành một file lệnh trên máy mình, `~/.claude/commands/review.md`. File lệnh chỉ là một file Markdown: gõ tên lệnh thì nội dung file được gửi cho Claude như một prompt. Gõ `/review` là Claude review theo đủ 8 mục: thay đổi API, độ phủ test, migration, log, bảo mật và vài mục khác. Những người còn lại thì vẫn dán checklist vào đầu mỗi session review. Có người dán bản cũ còn 6 mục, nên Claude bỏ sót mục migration.

File trong thư mục home chỉ nằm trên máy của anh Đạt, không đi theo git. Lệnh trong thư mục home là lệnh cấp user (**user-scoped command**), chỉ mình bạn dùng được. Muốn cả đội cùng có lệnh, bạn đặt file trong thư mục `.claude/commands/` của repo rồi commit lên. Đây là lệnh cấp project (**project-scoped command**), có cho cả đội nhờ version control (**team-wide availability via version control**). Anh Đạt chuyển file sang `.claude/commands/review.md` và commit. Từ lần pull sau, ai trong đội gõ `/review` cũng nhận cùng một checklist, và khi đội sửa checklist thì mọi người nhận bản mới qua git.

Tên lệnh lấy từ tên file. `.claude/commands/review.md` thành `/review`. File trong thư mục con thì tên lệnh có thêm dấu hai chấm, ví dụ `.claude/commands/bao-hanh/phieu.md` thành `/bao-hanh:phieu`.

Có một chỗ đề thi và Claude Code hiện nay vênh nhau. Đề thi vẫn coi `.claude/commands/` là chỗ đặt slash command, và `~/.claude/commands/` là chỗ đặt lệnh riêng. Trong Claude Code hiện nay, lệnh tự tạo đã được gộp vào skill, một dạng mở rộng hơn mà mục sau nói kỹ. File trong `.claude/commands/` vẫn chạy như cũ, nhưng skill là cách được khuyên dùng cho việc mới. Tài liệu hiện nay cũng không còn nhắc `~/.claude/commands/`, mà ghi chỗ đặt skill riêng của bạn là `~/.claude/skills/`. Nếu một skill và một file lệnh trùng tên, Claude Code chạy skill. Trong đề thi, nếu câu hỏi hỏi chỗ đặt lệnh cho cả đội, bạn chọn `.claude/commands/` hoặc `.claude/skills/` trong repo, tuỳ đáp án nào có.

> **Bẫy đề**
>
> Đội muốn có một lệnh `/review` chạy checklist chuẩn của đội, và ai clone hay pull repo về cũng có lệnh này. Nên tạo file lệnh ở đâu? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Trong `~/.claude/commands/` ở thư mục home của từng dev** (_user-scoped commands_). Nghe như ai cũng có lệnh. Nhưng file đó không đi theo git, mỗi người phải tự chép, và người mới clone về thì không có.
> - **Trong CLAUDE.md ở gốc project**. Đặt chung chỗ với hướng dẫn của đội nghe cũng tiện. Có điều CLAUDE.md là hướng dẫn và context của project, không phải nơi định nghĩa lệnh.
> - **Trong file `.claude/config.json` với một mảng `commands`** (_a commands array in config.json_). Đáp án này nghe như gom cấu hình về một chỗ, nhưng Claude Code không có cơ chế cấu hình nào như vậy.
>
> **Chọn:** đặt file trong `.claude/commands/` của repo. File được commit, nên ai clone hay pull về cũng có lệnh.

## Viết quy trình thành skill

Việc thứ hai của đội là thêm một model máy mới. Mỗi lần làm phải đủ năm bước: thêm model vào bảng sản phẩm, khai báo thời hạn bảo hành, gắn danh sách linh kiện, thêm mẫu tin nhắn và viết test. Quy trình này cần một file mẫu danh sách linh kiện đi kèm. File lệnh chỉ là một file đơn lẻ, còn skill là cả một thư mục nên chứa được file đi kèm. Vì vậy đội viết quy trình này thành skill.

Skill là một thư mục trong `.claude/skills/` của repo, với một file `SKILL.md` ở trong. Cũng như file lệnh, thư mục này được commit lên git, nên ai pull về cũng có skill, và khi đội sửa skill thì mọi người nhận bản mới. Đầu file là phần **frontmatter**, một khối YAML nằm giữa hai dòng `---`, dùng để cấu hình skill. Sau frontmatter là hướng dẫn Claude làm theo khi skill chạy. Tên thư mục thành tên lệnh, nên thư mục `them-model` cho lệnh `/them-model`:

```markdown
---
description: Thêm một model máy lọc nước mới vào hệ thống bảo hành. Dùng khi cần khai báo model, thời hạn bảo hành và linh kiện.
argument-hint: "[ma-model] [so-thang-bao-hanh]"
disable-model-invocation: true
---

Thêm model $0 với thời hạn bảo hành $1 tháng:
1. Thêm model vào bảng sản phẩm trong san_pham/models.py
2. Khai báo thời hạn bảo hành
3. Gắn danh sách linh kiện theo mẫu trong linh-kien-mau.md
4. Thêm mẫu tin nhắn báo sửa xong
5. Viết test cho model mới
```

Frontmatter này có ba field.

- `description` cho Claude biết skill làm gì và khi nào nên dùng. Claude dựa vào mô tả này để tự quyết định có nên gọi skill hay không. Bình thường chỉ phần mô tả nằm sẵn trong context, tức những gì Claude đang đọc trong cuộc trò chuyện, còn nội dung đầy đủ của skill chỉ nạp vào khi có người gọi skill.
- `argument-hint` là gợi ý tham số (**argument hint**) hiện lên khi bạn gõ `/them-model`, cho biết lệnh cần mã model và số tháng bảo hành.
- `disable-model-invocation: true` để Claude không tự gọi skill này. Chỉ khi bạn gõ `/them-model` thì nó mới chạy. Với field này, mô tả của skill cũng không nằm sẵn trong context, vì Claude không cần biết tới nó.

Trong phần hướng dẫn, `$0` và `$1` là chỗ điền tham số. Gõ `/them-model LN-920 24` thì `$0` thành `LN-920` và `$1` thành `24`. Còn `$ARGUMENTS` là toàn bộ chuỗi bạn gõ sau tên lệnh. Ngoài ra còn ba field hay dùng là `context: fork`, `allowed-tools` và `disallowed-tools`, hai mục tiếp theo sẽ nói tới.

Trâm thường quên phải gõ tham số nào. Gợi ý từ `argument-hint` hiện ngay khi Trâm gõ tên lệnh, nên Trâm biết cần thêm mã model và số tháng. Trong Claude Code hiện nay, gợi ý này chỉ hiện trong danh sách autocomplete lúc bạn gõ lệnh. Nếu bạn quên tham số, chỗ `$1` trong hướng dẫn giữ nguyên chữ chứ không có bước nào dừng lại hỏi. Đề thi thì mô tả `argument-hint` là field nhắc dev nhập tham số bắt buộc khi gọi skill mà quên tham số, nên khi làm bài bạn trả lời theo cách hiểu này.

> **Trong đề chọn gì**
>
> Nếu đề hỏi đặt skill ở đâu để mọi dev gọi được bằng `/ten-skill`, và quy trình luôn đồng bộ khi đội sửa dần, hãy chọn `.claude/skills/<ten-skill>/SKILL.md` ở gốc project, commit vào git. Bản trong `~/.claude/skills/` trên máy từng người sẽ lệch nhau sau vài lần sửa. Khối chỉ dẫn trong CLAUDE.md nạp vào mọi session mà không tạo ra lệnh nào. Còn `skillOverrides` trong `.claude/settings.json` chỉ quyết định một skill có hiện ra cho Claude thấy, và có hiện trong menu `/` hay không. Nó không dùng để tạo skill.

## Tách skill có output dài khỏi cuộc trò chuyện chính bằng context: fork

Việc thứ ba là phân tích một module cũ trước khi sửa. Đội có skill `/phan-tich-module` để Claude đọc toàn bộ một module, lần theo các chỗ gọi tới nó, rồi báo lại cấu trúc và các chỗ dễ vỡ. Trâm chạy skill này cho module `tinh_bao_hanh`, có 46 file. Claude đọc từng file ngay trong cuộc trò chuyện, nên nội dung của cả 46 file nằm lại trong context. Sau đó Trâm hỏi tiếp về việc cần sửa, và câu trả lời của Claude vừa chậm vừa lẫn chi tiết của những file chẳng liên quan.

Field `context: fork` giải quyết đúng chuyện này. Skill có `context: fork` chạy trong một subagent, tức một Claude phụ được giao việc, có context riêng tách khỏi cuộc trò chuyện của bạn (**isolated sub-agent context**). Subagent nhận nội dung skill làm prompt, tự đọc file và gọi tool trong context của nó, rồi chỉ gửi kết quả tóm tắt về cuộc trò chuyện chính. Đội thêm hai dòng vào frontmatter:

```markdown
---
description: Phân tích một module trước khi sửa. Báo cấu trúc, các chỗ gọi tới module và chỗ dễ vỡ.
argument-hint: "[ten-module]"
context: fork
agent: Explore
---

Phân tích module $ARGUMENTS:
1. Tìm các file của module và các chỗ gọi tới nó
2. Đọc và ghi lại cấu trúc chính
3. Tóm tắt các chỗ dễ vỡ, kèm tên file và số dòng
```

Field `agent` chọn loại subagent chạy skill. `Explore` là subagent dựng sẵn trong Claude Code, chỉ dùng được các tool đọc, nên hợp với việc khám phá code. Nếu bạn không ghi `agent`, skill sẽ chạy bằng subagent `general-purpose`. Subagent không thấy lịch sử cuộc trò chuyện của bạn, nên nội dung skill phải tự đủ ý.

**Sơ đồ: Không có fork thì 46 file đọng lại trong cuộc trò chuyện chính; có fork thì chỉ tóm tắt quay về**
_Trâm chạy /phan-tich-module cho module tinh_bao_hanh có 46 file: không có context: fork thì cả 46 file nằm trong cuộc trò chuyện chính; có context: fork thì 46 file nằm trong context của subagent Explore, cuộc trò chuyện chính chỉ nhận bản tóm tắt_

- Trâm chạy /phan-tich-module cho tinh_bao_hanh, 46 file
- **KHÔNG CÓ CONTEXT: FORK**
- **Cuộc trò chuyện chính**: nội dung 46 file nằm lại
- Trâm hỏi tiếp về việc cần sửa
- **Trả lời chậm, lẫn chi tiết**: của những file không liên quan
- **CÓ CONTEXT: FORK**
- **Cuộc trò chuyện chính**: chỉ nhận tóm tắt: chỗ dễ vỡ
- nội dung skill
- tóm tắt
- **Subagent Explore**: context riêng, chỉ có tool đọc

`context: fork` hợp với hai loại skill. Loại thứ nhất là skill sinh nhiều output (**verbose output**), như phân tích cả một codebase. Loại thứ hai là skill có nhiều bước thăm dò (**exploratory context**), như nghĩ ra vài cách làm khác nhau trước khi chọn một. Ngược lại, đừng dùng `context: fork` cho skill chỉ chứa quy ước, kiểu "API viết theo mẫu này". Subagent nhận được quy ước nhưng không có việc cụ thể nào để làm, nên trả về chẳng có gì dùng được.

> **Bẫy đề**
>
> Một dev muốn có một cách gọi lại được nhiều lần để Claude khám phá codebase trước khi refactor lớn, mà không làm đầy context của cuộc trò chuyện chính. Nên dùng cơ chế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Một hook `PostToolUse` chạy script Bash ở background** (_a PostToolUse hook_). Nghe như tự động và không làm phiền ai. Nhưng hook chỉ là một lệnh shell tự chạy sau mỗi lần Claude gọi tool. Nó không thể đi khám phá code rồi tóm tắt lại như Claude.
> - **Một custom command trong `.claude/commands/`** (_a custom command_). Nghe như cũng dùng lại được. Có điều một lệnh không có `context: fork` chạy ngay trong cuộc trò chuyện chính, nên mọi file nó đọc vẫn đổ vào context chính.
> - **Một file CLAUDE.md cấp project** (_project CLAUDE.md_). CLAUDE.md là hướng dẫn nạp vào mọi session, không phải thứ bạn gọi ra khi cần, và nó không tách context.
>
> **Chọn:** một skill trong `SKILL.md` có `context: fork` trong frontmatter, để việc khám phá chạy trong subagent riêng và chỉ kết quả quay về.

## Giới hạn tool khi skill chạy: allowed-tools và disallowed-tools

Một lần, trong lúc chạy `/them-model`, Claude tự chạy thử migration của database và làm hỏng dữ liệu thử trên máy Trâm. Từ đó đội muốn giới hạn tool của skill này (**restrict tool access**): chỉ đọc và sửa file, không chạy lệnh shell. Anh Đạt thêm vào frontmatter dòng `allowed-tools: Read Edit Write`, nghĩ rằng như vậy Claude chỉ còn ba tool này. Lần sau, Claude vẫn xin chạy Bash, và Trâm bấm đồng ý theo thói quen.

Thật ra `allowed-tools` là danh sách tool Claude được dùng mà không phải hỏi bạn trong lượt gọi skill đó. Nó không ngăn Claude gọi tool khác. Claude vẫn gọi được tool không có trong danh sách, chỉ là lúc đó Claude Code xử lý theo cài đặt quyền bình thường của bạn. Vì vậy Bash vẫn hiện hộp hỏi quyền như mọi khi. Muốn thật sự bỏ một tool khỏi danh sách Claude được dùng khi skill đang chạy, bạn dùng field `disallowed-tools`. Anh Đạt sửa lại:

```markdown
---
description: Thêm một model máy lọc nước mới vào hệ thống bảo hành.
argument-hint: "[ma-model] [so-thang-bao-hanh]"
disable-model-invocation: true
allowed-tools: Read Edit Write
disallowed-tools: Bash
---
```

Với cấu hình này, Claude đọc và sửa file mà không phải hỏi, còn Bash không còn trong danh sách tool lúc skill chạy. Còn nếu muốn chặn một tool ở mọi nơi, kể cả ngoài skill, bạn thêm rule `deny` vào permission settings, phần cài đặt quyền của Claude Code.

**Sơ đồ: allowed-tools chỉ bỏ bước hỏi, muốn chặn hẳn Bash thì cần thêm disallowed-tools**
- có
- không
- Tool có trongdisallowed-tools?
- Bị bỏ khỏi danh sách tool(Bash, sau khi anh Đạt sửa)
- Có trongallowed-tools?
- Chạy không cần hỏiRead, Edit, Write
- Hỏi quyền như thườngBash lúc chỉ có allowed-tools:Trâm bấm đồng ý, Bash chạy

Đây là chỗ vênh thứ hai giữa đề thi và cách Claude Code chạy hiện nay. Đề thi mô tả `allowed-tools` là field giới hạn tool khi skill chạy, ví dụ chỉ cho ghi file để Claude không chạy lệnh làm hỏng dữ liệu (**destructive actions**). Gặp câu hỏi chọn field nào trong frontmatter để giới hạn tool của skill, hãy chọn `allowed-tools`. Còn nếu đề kể rằng Claude vẫn gọi được một tool không có trong `allowed-tools`, câu đó đang theo cách Claude Code chạy hiện nay. Khi đó đáp án đúng là thêm `disallowed-tools` để bỏ hẳn tool.

> **Bẫy đề**
>
> Một dev đặt `allowed-tools: Write Edit` cho một skill, mong Claude không gọi Bash khi skill chạy. Claude vẫn gọi Bash sau khi hỏi xin phép. Vì sao, và nên cấu hình gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **`allowed-tools` chỉ áp cho tool người dùng gọi trực tiếp, đặt thêm `model: inherit`** (_model: inherit_). Nghe như bắt skill dùng chung thiết lập với session. Nhưng `allowed-tools` không phân biệt ai gọi tool, nó áp cho cả tool Claude tự chọn trong lượt gọi skill. Còn `model` chỉ chọn model chạy skill, không đổi danh sách tool mà Claude gọi được.
> - **Tên tool trần không được coi là giới hạn, phải viết `Write*` và `Edit*`** (_wildcard patterns_). Nghe như sửa cú pháp là xong. Có điều thêm dấu `*` không làm field đổi tác dụng, `allowed-tools` vẫn chỉ là danh sách tool được dùng mà không cần hỏi.
> - **`allowed-tools` chỉ áp sau khi skill chạy xong, nên đặt `context: fork`** (_context: fork_). Đáp án này nghe như khi chạy riêng thì Claude chỉ có các tool được liệt kê. Nhưng subagent dùng được tool nào là do field `agent` quyết định. Hơn nữa, `allowed-tools` có hiệu lực ngay trong lượt gọi skill, chứ không phải sau khi skill chạy xong.
>
> **Chọn:** `allowed-tools` chỉ cho các tool được liệt kê chạy không cần hỏi, còn tool khác vẫn gọi được. Thêm `disallowed-tools: Bash` để Bash bị bỏ khỏi danh sách tool lúc skill chạy.

## Bản skill riêng mà không ảnh hưởng đồng đội

Khi đã quen với skill, đội chuyển `/review` từ file lệnh sang skill `.claude/skills/review/SKILL.md`, vẫn commit trong repo. Ngoài 8 mục của đội, Trâm muốn Claude kiểm thêm tên biến tiếng Việt không dấu cho thống nhất. Trâm không muốn sửa `/review` của đội, vì sửa ở đó thì cả đội cũng bị đổi theo.

Trâm tạo một bản riêng (**personal variant**) tên `review-tram` trong thư mục home, tại `~/.claude/skills/review-tram/SKILL.md`. Skill trong `~/.claude/skills/` chỉ có trên máy của Trâm, dùng được ở mọi project của Trâm, và không đi theo git. Đồng đội vẫn dùng `/review` như cũ, còn Trâm có thêm `/review-tram`.

Trâm cố ý đặt tên khác, vì khi hai skill trùng tên, Claude Code chỉ chạy một bản theo thứ tự ưu tiên: bản do tổ chức cài cho cả công ty (**enterprise**), rồi bản cá nhân (**personal**), rồi bản của project. Nếu Trâm đặt bản riêng tên `review`, thì trên máy Trâm, `/review` sẽ chạy bản riêng thay cho bản của đội. Khi đội sửa checklist, bản mới vẫn về máy Trâm qua git, nhưng `/review` của Trâm vẫn chạy bản riêng, và Trâm không hề hay biết. Còn skill đi kèm plugin, tức gói mở rộng cài thêm vào Claude Code, thì không tranh tên với ba cấp này, vì bạn luôn gọi nó kèm tên plugin, dạng `/ten-plugin:ten-skill`.

**Sơ đồ: Bản riêng tên review che bản của đội, đặt tên review-tram thì hai bản cùng dùng được**

✗ _Bản riêng đặt tên review_
1. ~/.claude/skills/**review**/ trùng tên skill của đội
   ↓ _trùng tên: enterprise, rồi personal, rồi project_
2. Trâm gõ **/review**: chạy bản riêng thay cho bản của đội
   ↓ _đội sửa checklist, Trâm pull về_
3. **Vẫn chạy bản riêng** không theo checklist mới, mà Trâm cũng không biết

✓ _Bản riêng đặt tên review-tram_
1. ~/.claude/skills/**review-tram**/ không trùng tên nào
   ↓ _hai skill cùng có trên máy Trâm_
2. **/review** chạy bản của đội, **/review-tram** kiểm thêm tên biến
   ↓ _đội sửa checklist, Trâm pull về_
3. **Nhận bản mới** /review luôn theo checklist của đội

> **Trong đề chọn gì**
>
> Nếu đề hỏi thứ tự ưu tiên khi skill cá nhân, skill project, skill của plugin và skill enterprise trùng tên, hãy chọn Enterprise > Personal > Project > Plugins. Plugin đứng cuối chỉ vì nó không tranh tên với ai, do luôn được gọi kèm tên plugin. Mọi đáp án đặt Project hay Plugins trên Personal, hoặc đặt Personal trên Enterprise, đều sai.

## Skill hay CLAUDE.md

Đến đây đội có hai chỗ để viết hướng dẫn cho Claude, là CLAUDE.md và skill, và anh Đạt cần chia rõ hướng dẫn nào ghi ở đâu. CLAUDE.md được nạp vào mọi session, nên nó dành cho những quy ước áp dụng cho mọi việc (**universal standards**): lệnh chạy test, quy ước đặt tên, cấu trúc thư mục, những luật kiểu "luôn làm X". Skill chỉ nạp đầy đủ khi được gọi (**on-demand invocation**), nên nó dành cho quy trình của một loại việc cụ thể (**task-specific workflow**), như review, thêm model, phân tích module.

Checklist review là ví dụ rõ nhất. Đội dùng Claude cho nhiều việc khác ngoài review: viết tính năng mới, debug lỗi trên production, viết tài liệu. Nếu checklist nằm trong CLAUDE.md, nó chiếm chỗ trong context ở cả những session không liên quan gì tới review. Một checklist mà bạn cứ phải dán tay vào chat mỗi lần làm một loại việc là đúng thứ nên đóng gói thành lệnh hay skill.

> **Bẫy đề**
>
> Một đội muốn Claude theo checklist review 8 mục khi review pull request, và cũng dùng Claude nhiều cho viết tính năng, debug và viết tài liệu. Hiện dev của đội đó dán checklist vào đầu mỗi session review. Cách nào tốt nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Đặt plan mode làm mặc định cho các session review** (_plan mode by default_). Nghe như Claude sẽ cẩn thận hơn. Nhưng plan mode chỉ bắt Claude lập kế hoạch trước khi sửa, nó không mang checklist nào theo.
> - **Tạo một subagent review riêng với checklist nhúng sẵn** (_a dedicated review subagent_). Nghe như tách bạch. Có điều subagent dành cho lúc bạn muốn giao hẳn một việc sang context riêng. Ở đây bạn chỉ cần checklist có sẵn mỗi khi bắt đầu review, nên một lệnh gọi tay là đủ.
> - **Thêm checklist vào CLAUDE.md dưới mục "Code Review"** (_a section in CLAUDE.md_). Ai cũng nhận được, nhưng CLAUDE.md nạp vào mọi session, nên checklist chen vào cả lúc viết tính năng hay debug.
>
> **Chọn:** tạo một slash command `/review` chứa checklist, gọi khi bắt đầu review.

> **Ý chính**
>
> Lệnh và skill cho cả đội đặt trong `.claude/commands/` hoặc `.claude/skills/` của repo rồi commit lên git. Bản trong thư mục home chỉ là của riêng bạn. Trong frontmatter của `SKILL.md`, `argument-hint` gợi ý tham số, còn `context: fork` cho skill chạy trong subagent riêng để output dài không đổ vào cuộc trò chuyện chính. `allowed-tools` chỉ bỏ bước hỏi quyền, muốn bỏ hẳn một tool thì dùng `disallowed-tools`. Bản skill riêng thì đặt tên khác trong `~/.claude/skills/` để không che bản của đội. Quy ước cho mọi việc ghi trong CLAUDE.md, quy trình của một loại việc viết thành skill.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 3.2](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Extend Claude with skills (Claude Code)](https://code.claude.com/docs/en/skills)
3. [Create custom subagents (Claude Code)](https://code.claude.com/docs/en/sub-agents)
4. [How Claude remembers your project (Claude Code)](https://code.claude.com/docs/en/memory)
