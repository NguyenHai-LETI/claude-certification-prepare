---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-1-phan-cap-claude-md
ngay_tai: 2026-11-27
tieu_de: Phân cấp CLAUDE.md, @import và .claude/rules
---

Domain 3: Claude Code Configuration & Workflows · Task 3.1

# Phân cấp CLAUDE.md, @import và .claude/rules

Đặt CLAUDE.md ở đâu thì ai nhận được, file nào được nạp lúc nào, cách chia CLAUDE.md dài bằng @import hay .claude/rules/, và cách kiểm file đang nạp.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Biết đặt hướng dẫn ở cấp user, project hay thư mục con để đúng người nhận
- Tìm ra vì sao một người trong nhóm không nhận được hướng dẫn chung
- Dùng @import để mỗi package chỉ kéo vào tài liệu chuẩn nó cần
- Tách một CLAUDE.md dài thành nhiều file theo chủ đề trong .claude/rules/
- Dùng /memory và /context để kiểm file hướng dẫn nào đang được nạp

CLAUDE.md là file chứa hướng dẫn cho Claude Code: dự án dùng công cụ gì, viết test ra sao, đặt tên thế nào. Mỗi lần bạn mở Claude Code, nó đọc các file CLAUDE.md liên quan rồi mới bắt tay vào việc. Một máy có thể có nhiều file CLAUDE.md ở nhiều chỗ, xếp thành nhiều cấp (**configuration hierarchy**), nên câu hỏi đầu tiên là đặt file ở đâu thì ai nhận được hướng dẫn trong đó.

Bài này bắt đầu với ba cấp CLAUDE.md và thời điểm Claude Code nạp từng file, rồi tới cách kiểm tra xem file nào đang được nạp. Sau đó là hai cách giữ hướng dẫn gọn khi dự án lớn dần, là `@import` và thư mục `.claude/rules/`. Cuối bài nói vì sao có những yêu cầu không nên chỉ ghi trong CLAUDE.md.

**Sơ đồ: Chỗ đặt file quyết định ai nhận được và file nạp lúc nào. Mọi file chỉ là lời dặn trong context**
_Bản đồ bài: file hướng dẫn nằm ở máy bạn ngoài git (user-level, ~/.claude/CLAUDE.md) hoặc trong repo đi theo git (project-level ./CLAUDE.md có thể @import file khác, .claude/rules/ mỗi file một chủ đề, directory-level CLAUDE.md trong thư mục con). Lúc mở session nạp CLAUDE.md ở thư mục mở và mọi thư mục cha, ~/.claude/CLAUDE.md và rule không có paths; khi Claude đụng tới file trong thư mục con hay file khớp paths thì nạp thêm. Mọi file nối lại trong context, không file nào ghi đè, user trước project sau; kiểm bằng /memory và /context all. CLAUDE.md chỉ là lời dặn: việc cấm tuyệt đối dùng permissions.deny, việc phải chạy ở thời điểm cố định dùng hook_

- **MÁY BẠN, NGOÀI GIT**
- **User-level**: ~/.claude/CLAUDE.md
- **TRONG REPO, ĐI THEO GIT**
- **Project-level**: ./CLAUDE.md, có @import
- **.claude/rules/**: mỗi file một chủ đề
- **Directory-level**: thư mục con/CLAUDE.md
- **NẠP LÚC NÀO**
- **Lúc mở session**: CLAUDE.md ở thư mục mở
- và mọi thư mục cha
- ~/.claude/CLAUDE.md
- rule không có paths
- **Khi Claude đụng tới**: file trong thư mục con
- rule có paths khớp file
- **Context**: các file nối lại,
- không file nào ghi đè
- user trước,
- project sau
- Claude đọc và cố theo
- kiểm bằng /memory
- và /context all
- **CLAUDE.md chỉ là lời dặn, Claude cố theo chứ không bắt buộc**: cấm tuyệt đối → permissions.deny
- chạy ở thời điểm cố định → hook

## Ví dụ xuyên suốt: phần mềm quản lý trung tâm tiếng Anh

Một công ty ở Huế làm phần mềm quản lý cho khoảng 60 trung tâm tiếng Anh: xếp lớp, điểm danh, thu học phí và gửi thông báo cho phụ huynh. Code nằm trong một monorepo TypeScript với 9 package trong thư mục `packages/`, như `hoc-vien`, `thanh-toan`, `lop-hoc`, `thong-bao` và `bao-cao`. Mỗi package có một người phụ trách. Repo còn có thư mục `db/migrations/` chứa các file migration của database, một module log dùng chung, và dùng Prettier để tự định dạng code TypeScript. Đội có 7 dev, chị Ngân là trưởng nhóm, và ai cũng dùng Claude Code hằng ngày.

Đội có ba tài liệu chuẩn trong `tai-lieu/chuan/`: `bao-mat-du-lieu.md` cho package giữ dữ liệu cá nhân của học viên, `mau-test.md` về cách viết test cho mọi package, và `quy-uoc-api.md` dành cho các package có API mà bên ngoài gọi vào. Tuần này đội nhận thêm một dev mới tên Phong.

## Ba cấp CLAUDE.md, và ai nhận được hướng dẫn

Ngày đầu, Phong clone repo về và nhờ Claude sửa một lỗi nhỏ trong `lop-hoc`. Claude viết commit message theo kiểu tự do, và chạy `npm test` cho cả repo. Trong khi đó, trên máy những người còn lại, Claude luôn viết commit theo mẫu `[lop-hoc] sửa: ...` và chỉ chạy test của package vừa sửa. Phong mở `CLAUDE.md` ở gốc repo ra xem thì thấy file gần như trống.

Hoá ra từ đầu, chị Ngân ghi các quy ước này vào `~/.claude/CLAUDE.md` trên máy mình, rồi gửi qua chat cho từng người dán vào file cùng tên trên máy họ. File đó nằm trong thư mục home, ngoài repo, nên không đi theo git. Vì vậy khi clone repo, Phong chỉ có cái CLAUDE.md gần như trống, còn các quy ước thật thì nằm trên máy từng người.

Mỗi vị trí của CLAUDE.md có một phạm vi (**scope**) riêng:

| Cấp | Vị trí | Ai nhận được |
| --- | --- | --- |
| User (**user-level**) | `~/.claude/CLAUDE.md` | Chỉ bạn, ở mọi project trên máy bạn |
| Project (**project-level**) | `./CLAUDE.md` hoặc `./.claude/CLAUDE.md` ở gốc repo | Cả đội, qua git |
| Thư mục con (**directory-level**) | `CLAUDE.md` trong một thư mục con, như `packages/thanh-toan/CLAUDE.md` | Cả đội, qua git, khi Claude làm việc trong thư mục đó |

Ngoài ba cấp này còn hai loại file nữa. `CLAUDE.local.md` đặt ở gốc project, chứa ghi chú riêng của bạn cho project đó, và bạn tự thêm nó vào `.gitignore` để không commit lên. Loại còn lại là file CLAUDE.md do bộ phận IT quản lý (**managed policy**), áp dụng cho cả công ty.

Hướng dẫn ở cấp user chỉ có tác dụng với chính người đó, vì file nằm ngoài repo nên không đi theo git. Muốn cả đội, kể cả người mới, nhận cùng một quy ước, bạn phải đặt nó ở cấp project. Chị Ngân chuyển phần quy ước commit và chạy test vào `CLAUDE.md` ở gốc repo rồi commit lên. Từ lần pull sau, Claude trên máy Phong cũng viết commit và chạy test giống hệt máy của mọi người. Trong `~/.claude/CLAUDE.md` của chị chỉ còn những thói quen riêng, như thích Claude trả lời ngắn.

**Sơ đồ: Quy ước ở ~/.claude của chị Ngân nên Phong không có. Chuyển vào CLAUDE.md gốc thì Phong có ngay**
_Trước: chị Ngân ghi quy ước commit và chạy test vào ~/.claude/CLAUDE.md trên máy mình, gửi qua chat cho từng người; CLAUDE.md của repo gần như trống; Phong clone repo về, Claude viết commit kiểu tự do và chạy npm test cho cả repo. Sau: chị Ngân chuyển quy ước vào CLAUDE.md ở gốc repo và commit lên; Phong pull về, Claude viết commit [lop-hoc] sửa: và chỉ test đúng package vừa sửa; ~/.claude/CLAUDE.md của chị chỉ còn thói quen riêng như thích trả lời ngắn_

- **MÁY CHỊ NGÂN, NGOÀI GIT**
- **REPO, ĐI THEO GIT**
- **MÁY PHONG**
- 1. **~/.claude/CLAUDE.md**: quy ước commit, test
- gửi qua chat cho từng người
- **./CLAUDE.md**: gần như trống
- 2. **Phong clone về**: commit kiểu tự do
- npm test cho cả repo
- chuyển vào, commit
- **~/.claude/CLAUDE.md**: chỉ còn thói quen riêng
- như thích trả lời ngắn
- 3. **./CLAUDE.md**: quy ước commit, test
- chị Ngân commit lên
- 4. **Phong pull về**: commit [lop-hoc] sửa:
- chỉ test package vừa sửa

> **Trong đề chọn gì**
>
> Đề có thể kể rằng người cũ trong đội thấy Claude theo đúng quy ước, còn người mới clone repo về thì không, và CLAUDE.md của repo gần như trống. Khi đó, hãy chọn đáp án nói rằng quy ước nằm trong `~/.claude/CLAUDE.md` trên máy từng người, ngoài repo, nên clone về không mang theo. Đáp án đổ cho hộp thoại duyệt file `@import` là sai, vì CLAUDE.md của repo gần như trống, không import file nào. Đáp án bảo phải chạy `/init` trước cũng sai, vì `/init` chỉ là lệnh tạo nhanh một CLAUDE.md, còn Claude Code vẫn đọc CLAUDE.md của project mà không cần lệnh này. Đáp án đổ cho `.gitignore` chặn CLAUDE.md cũng không khớp, vì nếu bị chặn thì người mới đã không có cả cái file trống đó trong bản clone.

## File nào được nạp, và nạp lúc nào

Biết vị trí rồi, bạn cần biết thêm lúc nào mỗi file được đọc. Khi bạn mở Claude Code trong một thư mục, nó nạp `CLAUDE.md` và `CLAUDE.local.md` ở thư mục đó và ở mọi thư mục cha. Nạp nghĩa là đưa nội dung file vào context, tức phần văn bản Claude được đọc trong session đó. Phong mở Claude Code ở gốc repo, nên `CLAUDE.md` ở gốc được nạp ngay từ đầu session, cùng với `~/.claude/CLAUDE.md` của Phong.

Claude Code không nạp CLAUDE.md ở các thư mục con lúc mở session. CLAUDE.md của một thư mục con chỉ được nạp khi Claude đọc, ghi hay sửa một file nằm trong thư mục đó. Ví dụ `packages/thanh-toan/CLAUDE.md` chỉ vào context khi Claude bắt đầu đụng tới code của `thanh-toan`, nên lúc Phong làm việc trong `lop-hoc` thì hướng dẫn của `thanh-toan` không chiếm chỗ.

Mọi file Claude Code tìm thấy đều được nối lại với nhau trong context, không file nào ghi đè file nào. Hướng dẫn cấp user đứng trước, hướng dẫn cấp project đứng sau, và file càng gần thư mục bạn mở Claude Code thì càng được đọc sau. Nếu hai file nói ngược nhau về cùng một việc, Claude có thể theo bất kỳ bên nào, nên bạn phải tự giữ cho các file không mâu thuẫn.

## Kiểm tra file nào đang được nạp bằng /memory

Vài tuần sau, đội thêm vào CLAUDE.md ở gốc repo một quy ước mới, là mọi handler API phải ném lỗi bằng class `LoiApi` của đội. Phong để ý thấy có session Claude làm đúng, có session lại viết `try/catch` chung chung với thông báo dạng chuỗi. Claude làm lúc đúng lúc sai giữa các session (**inconsistent behavior across sessions**), nhìn như ngẫu nhiên.

Trước khi sửa câu chữ hay thêm quy ước mới, bước đầu tiên là xem session làm sai thật sự đã nạp những file hướng dẫn nào. Claude Code gọi chung các file hướng dẫn này là file memory. Lệnh `/memory` liệt kê các file memory ở cấp user và project, như CLAUDE.md và CLAUDE.local.md, và cho bạn mở từng file ra sửa. Để biết chắc file nào đã vào context lúc mở session, bạn chạy `/context all` và xem danh sách **Memory files**, kèm đường dẫn của từng file. Danh sách này chỉ có những file nạp lúc mở session. CLAUDE.md ở thư mục con và rule chỉ nạp khi cần thì chưa có trong đó cho tới khi Claude đụng tới file liên quan.

Có một chỗ đề thi và Claude Code hiện nay vênh nhau. Đề thi coi `/memory` là lệnh để xem file memory nào đang được nạp. Trong Claude Code hiện nay, `/memory` liệt kê và mở các file, còn danh sách file đã nạp thật nằm ở `/context all`. Khi đi thi, nếu gặp câu hỏi về bước đầu tiên để kiểm tra file nào đang được nạp, bạn cứ chọn `/memory`.

Phong chạy `/context all` trong một session làm sai, và danh sách cho thấy ngay nguyên nhân. `CLAUDE.md` được nạp nằm trong một git worktree cũ, tức một thư mục làm việc thứ hai của cùng repo mà Phong tạo để thử một nhánh khác. Phong mở file đó ra thì thấy đây là bản cũ, chưa có quy ước `LoiApi`. Những session làm đúng đều mở ở bản checkout chính. Phong cập nhật nhánh trong worktree đó, và Claude không còn làm sai nữa.

> **Bẫy đề**
>
> Claude lúc theo, lúc không theo quy ước trong CLAUDE.md của project, và chuyện này xảy ra như ngẫu nhiên giữa các session. Bước chẩn đoán đầu tiên là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tạo một rule trong `.claude/rules/` chỉ áp dụng cho các file handler** (_a path-scoped rule for handlers_). Nghe như đặt quy ước sát chỗ cần dùng hơn. Nhưng đó đã là cách sửa, trong khi bạn còn chưa biết session sai đang nạp file nào.
> - **Thêm ví dụ code chi tiết vào CLAUDE.md** (_add detailed code examples_). Nghe như Claude sẽ hiểu rõ hơn. Có điều nếu session làm sai không hề nạp file đó, thêm bao nhiêu ví dụ cũng vô ích.
> - **Tìm chỉ dẫn mâu thuẫn trong `~/.claude/CLAUDE.md` hay `~/.claude/rules/`, vì file cấp user có thể ghi đè quy ước của project** (_look for conflicting user-level instructions_). Nghe hợp lý vì mâu thuẫn có thể làm Claude theo bên kia. Nhưng file cấp user không ghi đè được file project, hai bên chỉ nối vào nhau. Làm vậy cũng mới là đoán một nguyên nhân, còn xem danh sách file đang nạp trước thì bạn thấy được cả file thiếu, file thừa lẫn file mâu thuẫn nếu có.
>
> **Chọn:** chạy `/memory`, lệnh mà đề thi coi là cách xem file memory nào đang được nạp, rồi kiểm tra xem CLAUDE.md của project có trong danh sách không và được nạp từ đường dẫn nào.

## Chỉ kéo đúng tài liệu chuẩn vào từng package bằng @import

Mỗi package có một CLAUDE.md riêng, và từ trước tới giờ, CLAUDE.md của cả 9 package đều chép nguyên nội dung ba tài liệu chuẩn. Package `bao-cao` không đụng tới dữ liệu cá nhân, nhưng vẫn mang theo cả trang quy định bảo mật dữ liệu học viên. Package `lop-hoc` không có API cho bên ngoài, mà vẫn có đủ quy ước API. Claude nhận cả những hướng dẫn không dính gì tới package đang sửa, và khi đội đổi một chuẩn thì phải sửa ở 9 chỗ.

Tên package không cho biết package nào giữ dữ liệu cá nhân hay có API cho bên ngoài. Chỉ người phụ trách mới biết rõ package của mình cần chuẩn nào, nhờ hiểu nghiệp vụ của package đó (**maintainer domain knowledge**). Vì vậy đội để mỗi người phụ trách tự chọn chuẩn cho package của mình, bằng cú pháp import (**@import syntax**). Một CLAUDE.md có thể kéo nội dung file khác vào bằng cách viết `@duong/dan/toi/file`, và file được import sẽ vào context cùng với CLAUDE.md đã import nó. Cách này chia hướng dẫn thành nhiều mảnh nhỏ dùng lại được (**modular**). `packages/thanh-toan/CLAUDE.md` giờ chỉ còn mấy dòng:

```markdown
# Package thanh-toan

Package này gọi cổng thanh toán và có API cho các trung tâm gọi vào.

- Chuẩn test: @../../tai-lieu/chuan/mau-test.md
- Quy ước API: @../../tai-lieu/chuan/quy-uoc-api.md
- Bảo mật dữ liệu học viên: @../../tai-lieu/chuan/bao-mat-du-lieu.md
```

Còn `packages/lop-hoc/CLAUDE.md` chỉ import `mau-test.md`, vì `lop-hoc` chỉ dùng mã học viên để xếp lớp, không giữ thông tin cá nhân nào. Đường dẫn tương đối được tính từ file chứa dòng import, không phải từ thư mục bạn mở Claude Code. File được import có thể import tiếp file khác, sâu tối đa bốn tầng. Đổi một chuẩn giờ chỉ cần sửa một file trong `tai-lieu/chuan/`.

**Sơ đồ: Mỗi package @import đúng chuẩn mình cần; đổi một chuẩn chỉ sửa một file trong tai-lieu/chuan/**
- tai-lieu/chuan/
- packages/: mỗi mũi tên là một dòng @import
- người phụ trách tự chọn
- Trước: cả 9 package chépnguyên ba chuẩn,đổi một chuẩn phải sửa 9 chỗ
- thanh-toan/CLAUDE.mdcó API cho trung tâm
- lop-hoc/CLAUDE.mdkhông có API cho bên ngoài
- quy-uoc-api.md
- bao-mat-du-lieu.md
- mau-test.md

Có hai điều cần biết thêm. Thứ nhất, file được import vẫn chiếm chỗ trong context y như khi bạn chép thẳng nội dung vào. Package `bao-cao` nhẹ đi là vì nó không import chuẩn bảo mật, chứ bản thân `@import` không làm nội dung ngắn lại. Thứ hai, nếu một CLAUDE.md của project import một file nằm ngoài thư mục làm việc, như một file trong thư mục home, thì lần đầu gặp dòng import đó, Claude Code hiện hộp thoại xin bạn duyệt. Hộp thoại này có để bảo vệ bạn, vì CLAUDE.md do người khác commit vào project có thể kéo vào những file bạn không ngờ tới.

> **Bẫy đề**
>
> Monorepo có ba tài liệu chuẩn dùng chung, và CLAUDE.md của mỗi package đều chép cả ba, kể cả phần không liên quan. Tên package không cho biết package nào cần chuẩn nào, chỉ người phụ trách mới biết. Cách hiệu quả nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Tạo một rule cho mỗi chuẩn trong `.claude/rules/`, với `paths` liệt kê các thư mục package cần chuẩn đó** (_path-scoped rules listing package directories_). Nghe gọn vì có một chỗ quản lý chung. Nhưng danh sách đó phải do một người giữ chung cho cả repo, trong khi chỉ người phụ trách từng package mới biết package mình cần gì, và mỗi lần thêm package mới lại phải sửa rule.
> - **Tạo một file `shared-standards.md` import cả ba chuẩn, rồi mọi package import file đó** (_one combined file imported everywhere_). Mỗi package chỉ còn một dòng, nghe rất gọn. Có điều mỗi package vẫn nhận đủ cả ba chuẩn, tức là lỗi cũ vẫn còn nguyên.
> - **Đưa cả ba chuẩn vào CLAUDE.md gốc, kèm câu "bỏ qua chuẩn bảo mật ở package không xử lý dữ liệu cá nhân"** (_root file with override instructions_). Nghe như một chỗ là đủ. Ngặt nỗi cả ba chuẩn vẫn nằm trong context ở mọi package, và Claude phải tự đoán package nào thuộc loại nào.
>
> **Chọn:** dùng `@import` trong CLAUDE.md của mỗi package để chỉ kéo vào những file chuẩn liên quan, do chính người phụ trách package đó chọn.

## Tách CLAUDE.md dài thành các file trong .claude/rules/

`CLAUDE.md` ở gốc repo dài dần lên hơn 600 dòng: quy ước commit, cách chạy test, các bước triển khai, cách đặt tên migration, quy ước xử lý lỗi, đủ thứ. Mỗi lần ai sửa một phần là cả file hiện trong diff, và hai người sửa hai phần khác nhau cũng dễ đụng nhau. File quá dài còn chiếm nhiều context hơn, và Claude theo hướng dẫn kém đi. Nên giữ mỗi file CLAUDE.md ở mức khoảng 200 dòng trở xuống.

Đội giữ lại phần tổng quan trong CLAUDE.md gốc, và chuyển phần còn lại sang thư mục `.claude/rules/`, mỗi file một chủ đề (**topic-specific rule files**), thay cho một CLAUDE.md nguyên khối (**monolithic CLAUDE.md**):

```
CLAUDE.md                 # tổng quan dự án, quy ước commit
.claude/
└── rules/
    ├── testing.md        # cách chạy test
    ├── api-conventions.md
    └── deployment.md
```

Claude Code tìm mọi file `.md` trong `.claude/rules/`, kể cả trong thư mục con. Ở đầu mỗi file rule có thể có một khối frontmatter, tức vài dòng YAML nằm giữa hai dòng `---`. Rule không khai báo `paths` trong frontmatter thì được nạp lúc mở session, với cùng mức ưu tiên như `.claude/CLAUDE.md`. Rule có `paths` thì chỉ vào context khi Claude làm việc với file có đường dẫn khớp mẫu trong `paths`. Ví dụ `api-conventions.md` có thể mở đầu như sau, để chỉ nạp khi Claude đọc hay sửa file handler:

```markdown
---
paths:
  - "packages/*/src/api/**/*.ts"
---

# Quy ước API
- Handler ném lỗi bằng class LoiApi, không ném chuỗi.
```

Mỗi người giờ sửa đúng file của chủ đề mình phụ trách. Bạn cũng có thể đặt rule cá nhân trong `~/.claude/rules/`, áp dụng cho mọi project trên máy. Rule cấp user được nạp trước rule của project, và cũng giống CLAUDE.md, hai bên chỉ được nối lại chứ không ghi đè nhau.

> **Trong đề chọn gì**
>
> Nếu đề hỏi nhận định đúng về `.claude/rules/`, hãy chọn hai ý. Một là thư mục này cho phép chia hướng dẫn thành các file theo chủ đề, thay cho một CLAUDE.md nguyên khối. Hai là rule hỗ trợ field `paths` trong YAML frontmatter, nhận mẫu glob như `packages/*/src/api/**/*.ts`, để rule chỉ được nạp khi Claude làm việc với file khớp mẫu đó. Đáp án nói rule của project tự ghi đè `~/.claude/CLAUDE.md` của từng người là sai, vì các file chỉ được nối lại. Đáp án nói rule thay được MCP server, tức chương trình cho Claude gọi tới một dịch vụ bên ngoài để lấy dữ liệu mới, cũng sai, vì rule chỉ là chữ cố định nạp vào context.

## Có yêu cầu không nên chỉ ghi trong CLAUDE.md

Đội ghi ba yêu cầu trong `CLAUDE.md`: không bao giờ sửa file trong `db/migrations/`, nên dùng module log của đội thay cho `console.log`, và phải chạy Prettier cho mọi file TypeScript sau mỗi lần sửa. Trong một lần refactor lớn, Claude vẫn sửa một file migration.

Với Claude, CLAUDE.md là văn bản trong context để đọc và cố làm theo, chứ không phải cấu hình bắt buộc. Câu chữ càng rõ thì Claude càng dễ theo, nhưng không có gì bảo đảm tuyệt đối. Vì vậy, cần đưa mỗi yêu cầu vào cơ chế hợp với nó:

- Sửa file trong `db/migrations/` là việc tuyệt đối không được xảy ra, nên đội thêm `Edit(./db/migrations/**)` vào `permissions.deny`, danh sách thao tác bị cấm trong file cấu hình `.claude/settings.json` của project. Dòng `deny` này chặn các tool sửa file của Claude Code nhắm vào đường dẫn đó, bất kể Claude có nhớ lời dặn hay không.
- Dùng module log của đội chỉ là điều nên làm, đôi khi vẫn có lý do chính đáng để làm khác, nên yêu cầu này cứ để trong CLAUDE.md.
- Chạy Prettier sau mỗi lần sửa là việc phải xảy ra ở một thời điểm cố định, nên đội dùng hook. Hook là lệnh shell mà Claude Code tự chạy ở những thời điểm cố định trong session, bất kể Claude quyết định gì. Đội viết một hook `PostToolUse`, loại chạy ngay sau khi một tool chạy xong, với matcher `Edit|Write` để hook chỉ chạy sau tool sửa hay ghi file. Hook này chạy Prettier cho file vừa sửa.

**Sơ đồ: CLAUDE.md chỉ là lời dặn; lệnh cấm do permissions.deny chặn, Prettier do hook chạy**
Bên tham gia: Hook PostToolUse, Claude Code, Claude

1. Edit db/migrations/...
2. bị chặn vì khớp permissions.deny
3. Edit một file .ts
4. matcher Edit|Write khớp
5. Prettier chạy cho file vừa sửa

> **Bẫy đề**
>
> Một đội ghi ba yêu cầu vào CLAUDE.md, gồm cấm sửa thư mục migration, ưu tiên module log riêng, và chạy Prettier sau mỗi lần sửa. Dù vậy, Claude vẫn sửa một file migration. Nên tổ chức lại thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Viết lại cả ba bằng lời lẽ mạnh hơn, thêm few-shot** (_stronger wording and few-shot examples_). Nghe như Claude sẽ nghe lời hơn. Nhưng CLAUDE.md vẫn chỉ là lời dặn trong context, nên không gì bảo đảm Claude giữ đúng lệnh cấm.
> - **Dùng hook cho cả ba, kể cả một hook `PreToolUse` thêm context về quy ước log** (_hooks for all three_). Nghe chặt chẽ vì mọi thứ đều tự động. Có điều quy ước log chỉ là điều nên làm, đưa nó vào hook là làm phức tạp một việc CLAUDE.md đã lo được.
> - **Chuyển cả ba vào `.claude/rules/` với `paths` theo thư mục** (_path-scoped rules for all three_). Nghe như đặt rule đúng chỗ cần dùng. Ngặt nỗi rule cũng chỉ là chữ nạp vào context, nên lệnh cấm vẫn không được bảo đảm, và Prettier vẫn không tự chạy.
>
> **Chọn:** thêm `Edit(./db/migrations/**)` vào `permissions.deny` trong settings của project, giữ yêu cầu về log trong CLAUDE.md, và thêm một hook `PostToolUse` trên tool sửa file để chạy Prettier cho file TypeScript vừa sửa.

> **Ý chính**
>
> Hướng dẫn cho cả đội đặt trong CLAUDE.md của project và commit lên git, còn `~/.claude/CLAUDE.md` chỉ là của riêng bạn. CLAUDE.md ở thư mục đang mở và các thư mục cha được nạp lúc mở session, còn CLAUDE.md ở thư mục con chỉ được nạp khi Claude đụng tới file trong thư mục đó. Khi Claude theo hướng dẫn lúc được lúc không, việc đầu tiên là kiểm tra file nào đang được nạp. Mỗi package dùng `@import` để kéo đúng chuẩn nó cần, và CLAUDE.md dài thì tách thành các file theo chủ đề trong `.claude/rules/`. Việc tuyệt đối không được làm thì chặn bằng permission, việc phải chạy ở thời điểm cố định thì dùng hook.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 3.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [How Claude remembers your project (Claude Code)](https://code.claude.com/docs/en/memory)
3. [Configure permissions (Claude Code)](https://code.claude.com/docs/en/permissions)
4. [Automate workflows with hooks (Claude Code)](https://code.claude.com/docs/en/hooks-guide)
