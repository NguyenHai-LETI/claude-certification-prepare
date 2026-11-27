---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/3-3-rule-theo-duong-dan
ngay_tai: 2026-11-27
tieu_de: Rule theo đường dẫn trong .claude/rules
---

Domain 3: Claude Code Configuration & Workflows · Task 3.3

# Rule theo đường dẫn trong .claude/rules

Dùng trường paths với mẫu glob để một file rule chỉ được nạp khi Claude đụng tới file khớp mẫu, và khi nào chọn cách này thay CLAUDE.md ở thư mục con.

- 12 phút đọc
- Đối chiếu docs 22/11/2026
- 2 nguồn

## Đọc xong bạn nắm được

- Viết file trong .claude/rules/ có frontmatter paths để rule chỉ nạp khi cần
- Dùng mẫu glob để áp quy ước theo loại file, bất kể file nằm ở thư mục nào
- Hiểu vì sao rule theo đường dẫn giúp context gọn và đỡ tốn token
- Chọn rule theo đường dẫn thay CLAUDE.md ở thư mục con khi file nằm rải rác

Ở bài 3.1, bạn đã biết thư mục `.claude/rules/` dùng để chia một CLAUDE.md dài thành nhiều file theo chủ đề. Một file rule bình thường, không khai báo gì thêm, được nạp ngay khi bạn mở Claude Code, giống CLAUDE.md. Nhưng quy ước cho file hạ tầng chỉ cần khi Claude sửa file hạ tầng, còn lúc sửa giao diện thì nạp vào chỉ tốn chỗ.

Bài này trả lời câu hỏi: làm sao để một quy ước chỉ được nạp khi Claude làm việc với đúng loại file cần nó, kể cả khi những file đó nằm rải rác khắp repo?

**Sơ đồ: Rule có paths chỉ nạp khi Claude mở file khớp mẫu glob, còn CLAUDE.md nạp ngay khi mở session**
_Bản đồ bài: khi mở session, CLAUDE.md và rule không có paths trong .claude/rules/ được nạp ngay, rule có YAML sai cú pháp cũng nạp như không có paths; rule có paths chờ, khi Claude mở một file bằng Read, Write, Edit hay cat thì Claude Code so file đó với mẫu glob, khớp thì nạp rule vào context, không khớp thì rule không chiếm chỗ; quy ước gắn một thư mục thì dùng CLAUDE.md thư mục con hay rule đều được, một loại file nằm rải rác thì dùng rule có paths với mẫu glob theo loại file_

- **NẠP NGAY KHI MỞ SESSION**
- **CLAUDE.md**: nạp ở mọi session
- **Rule không có paths**: trong .claude/rules/
- **YAML sai cú pháp**: nạp như không có paths
- **RULE CÓ PATHS: NẠP KHI CẦN**
- **Rule có paths**: chờ file khớp mẫu glob
- **Claude mở file**: Read, Write, Edit, cat
- **File khớp mẫu?**: khớp
- không khớp
- **Nạp vào context**
- **Không chiếm chỗ**
- **QUY ƯỚC NẰM Ở ĐÂU THÌ CHỌN CÁCH NÀO**
- **Quy ước gắn một thư mục**: CLAUDE.md thư mục con hay rule đều được
- **Một loại file nằm rải rác**: rule có paths, mẫu glob theo loại file

## Ví dụ xuyên suốt: phần mềm điều phối container ở cảng Hải Phòng

Một công ty ở Hải Phòng làm phần mềm điều phối container cho ba bến cảng: xếp lịch tàu vào, chỉ chỗ đặt container trong bãi, tính phí lưu bãi. Đội có 10 dev, chị Thảo là trưởng nhóm kỹ thuật. Mọi thứ nằm trong một repo:

```
cang-hp/
├── CLAUDE.md          # 520 dòng
├── web/src/           # giao diện React (TypeScript)
├── api/src/           # API Node.js
├── terraform/         # hạ tầng trên cloud
└── scripts/           # script chạy định kỳ
```

File test nằm ngay cạnh file nó kiểm tra. `web/src/lich-tau/BangLich.tsx` có `BangLich.test.tsx` đứng bên cạnh, `api/src/phi-luu-bai/tinhPhi.ts` có `tinhPhi.test.ts`. Repo có khoảng 300 file test như vậy, rải trong hơn 80 thư mục.

## Khi mọi quy ước dồn vào CLAUDE.md gốc

`CLAUDE.md` ở gốc repo dài 520 dòng, chia thành các mục có tiêu đề: `## Quy ước React`, `## Quy ước API`, `## Quy ước Terraform`, `## Quy ước test`. Để chung như vậy, đội gặp hai vấn đề.

Vấn đề thứ nhất là context bị lãng phí. Khang, một dev trong đội, chỉ sửa giao diện React, nhưng mỗi session của Khang đều nạp đủ 520 dòng, trong đó có cả trăm dòng quy ước Terraform mà Khang không bao giờ cần. Phần đó chiếm chỗ trong context và tốn token ở mọi request mà Claude Code gửi lên model.

Vấn đề thứ hai khó thấy hơn. Mục `## Quy ước test` yêu cầu mỗi test dùng hàm `taoContainerGia()` để tạo dữ liệu giả, không tự viết object. Có lúc Claude theo, có lúc không. Khi mọi quy ước nằm chung một file, Claude phải tự đoán đoạn nào áp cho file đang sửa. Vì vậy Claude có theo quy ước hay không là tuỳ lần đoán đó đúng hay sai.

Chia lại CLAUDE.md thành các mục có tiêu đề rõ hơn không giải quyết được vấn đề nào. File vẫn nạp đủ ở mọi session, và Claude vẫn phải tự đoán mục nào áp vào đâu.

## Tách quy ước Terraform thành rule có paths

Chị Thảo chuyển phần Terraform sang một file rule riêng, `.claude/rules/terraform.md`, và thêm trường `paths` vào **YAML frontmatter**, tức khối khai báo nằm giữa hai dòng `---` ở đầu file:

```markdown
---
paths:
  - "terraform/**/*"
---

# Quy ước Terraform
- Mỗi resource phải có tag `du-an = "cang-hp"`.
- Không sửa tay file state. Luôn chạy `terraform plan` trước khi apply.
```

Rule có trường `paths` như vậy gọi là rule theo đường dẫn (**path-scoped rule**, hay **path-specific rule**). Trường `paths` biến rule thành rule có điều kiện (**conditional rule activation**): nó không nạp lúc mở session. Claude Code chỉ nạp rule này khi Claude mở một file khớp mẫu, bằng tool Read, Write hay Edit, hoặc bằng lệnh Bash mà Claude Code coi là đọc file, như `cat` hay `head`. Trong session của Khang, Claude chỉ sửa file trong `web/`, nên quy ước Terraform không bao giờ vào context. Còn với người sửa hạ tầng, quy ước vào context ngay khi Claude mở file đầu tiên trong `terraform/`.

**Sơ đồ: Session của Khang không mở file nào trong terraform/, nên quy ước Terraform không vào context**
Bên tham gia: Context, Claude Code, Claude

1. Khang mở session: nạp đủ 520 dòng,
2. có cả quy ước Terraform
3. Edit web/src/lich-tau/
4. BangLich.tsx
5. không khớp terraform/**/*,
6. không nạp
7. Read file đầu tiên
8. trong terraform/
9. khớp terraform/**/*,
10. nạp terraform.md

Lợi ích chính của rule theo đường dẫn là context chỉ chứa những quy ước liên quan tới file đang làm, nên bớt chữ thừa và đỡ tốn token.

Có một chỗ đề thi và Claude Code hiện nay hơi lệch nhau. Trong đề, bạn sẽ gặp chữ **editing**, tức rule nạp khi Claude sửa file khớp mẫu. Thực tế Claude Code nạp rule ngay khi Claude đọc file đó, nên quy ước đã nằm trong context trước khi Claude bắt đầu sửa.

Có vài điều cần biết khi viết frontmatter. Trong frontmatter của rule, Claude Code chỉ đọc trường `paths`. Nếu bạn thêm trường khác, Claude Code lặng lẽ bỏ qua chứ không báo lỗi. Nếu khối YAML giữa hai dòng `---` viết sai cú pháp, Claude Code bỏ qua cả frontmatter và nạp rule như thể không có `paths`, tức là nạp ở mọi session. Muốn thấy lỗi cú pháp đó, bạn chạy `claude --debug`.

> **Bẫy đề**
>
> Một repo có module Terraform, manifest Kubernetes và script pipeline, mỗi loại theo một quy ước riêng, và mọi quy ước đều nằm trong CLAUDE.md gốc dài hơn 500 dòng. Khi dev sửa file Kubernetes, quy ước Terraform vẫn vào context và tốn token. Nên tổ chức lại thế nào để Claude chỉ nạp quy ước liên quan? Ba đáp án sau nghe hợp lý nhưng không phải cách tốt nhất:
>
> - **Giữ CLAUDE.md gốc và dùng `@path/to/import` để kéo vào file hướng dẫn của từng tool** (_@import per tool_). Chia nhỏ nghe thì gọn. Nhưng file được kéo vào bằng `@` nạp cùng lúc với CLAUDE.md gốc, nên quy ước Terraform vẫn vào context ở mọi session.
> - **Tách thành CLAUDE.md trong từng thư mục con, như `/terraform/CLAUDE.md`, `/kubernetes/CLAUDE.md`** (_subdirectory CLAUDE.md files_). Với ba thư mục này, cách đó cũng nạp đúng chỗ. Có điều mỗi CLAUDE.md bị trói vào một thư mục, còn rule có `paths` được làm ra đúng cho việc nạp theo đường dẫn: mọi rule nằm chung một chỗ, khớp theo mẫu, và vẫn áp được khi cùng loại file nằm ngoài thư mục đó. Đây là cơ chế đề muốn bạn chọn.
> - **Sắp lại CLAUDE.md gốc thành các mục có tiêu đề như `## Terraform Conventions`** (_clearer headings_). Nghe như dễ đọc hơn. Nhưng thêm tiêu đề không đổi được cách nạp, nên cả file vẫn vào context ở mọi session.
>
> **Chọn:** tạo file trong `.claude/rules/` với YAML frontmatter giới hạn theo đường dẫn, như `paths: ["terraform/**/*"]`, để rule chỉ nạp khi Claude làm việc với file khớp.

## Viết mẫu glob để áp quy ước theo loại file

Mẫu trong `paths` là mẫu glob (**glob pattern**), một cách viết đường dẫn có ký tự đại diện: `*` thay cho một đoạn tên bất kỳ, còn `**` thay cho bao nhiêu tầng thư mục cũng được. Đường dẫn trong mẫu tính từ gốc repo, tức thư mục chứa `.claude/`. Bảng sau là vài mẫu hay dùng và những file mỗi mẫu khớp.

| Mẫu | Khớp với |
| --- | --- |
| `terraform/**/*` | Mọi file nằm dưới `terraform/`, ở mọi tầng |
| `**/*.ts` | File `.ts` ở bất kỳ đâu trong repo |
| `*.md` | File `.md` ở bất kỳ đâu trong repo |
| `/*.md` | File `.md` nằm ngay ở gốc repo, không tính thư mục con |
| `web/src/components/*.tsx` | File `.tsx` nằm ngay trong `web/src/components/`, không tính thư mục con |

Một rule có thể khai báo nhiều mẫu. Trong một mẫu, bạn cũng dùng được dấu ngoặc nhọn (**brace expansion**) để gom nhiều đuôi file, ví dụ `src/**/*.{ts,tsx}` khớp cả file `.ts` lẫn `.tsx` trong `src/`.

Với quy ước test, chị Thảo không cần biết 300 file test nằm ở đâu. Chị tạo `.claude/rules/testing.md` với một mẫu theo đuôi file:

```markdown
---
paths:
  - "**/*.test.{ts,tsx}"
---

# Quy ước test
- Tạo dữ liệu giả bằng `taoContainerGia()`, không tự viết object.
- Mỗi test chỉ kiểm một hành vi, tên test nói rõ hành vi đó.
```

Mẫu `**/*.test.{ts,tsx}` khớp với mọi file test, dù nó nằm trong `web/src/lich-tau/` hay `api/src/phi-luu-bai/`. Khi Claude mở `BangLich.test.tsx`, quy ước test được nạp. Khi Claude chỉ sửa `BangLich.tsx`, quy ước test không chiếm chỗ. Giờ thì quy ước có vào context hay không là do file có khớp mẫu, chứ không còn tuỳ Claude đoán.

**Sơ đồ: Một mẫu **/*.test.{ts,tsx} khớp file test ở mọi thư mục, file nguồn cạnh nó thì không**
_Repo cang-hp: thư mục web/src/lich-tau/ có BangLich.tsx và BangLich.test.tsx, thư mục api/src/phi-luu-bai/ có tinhPhi.ts và tinhPhi.test.ts. File .claude/rules/testing.md có paths **/*.test.{ts,tsx} khớp BangLich.test.tsx và tinhPhi.test.ts nên nạp quy ước test, còn BangLich.tsx và tinhPhi.ts không khớp nên không nạp. Repo có khoảng 300 file test, rải trong hơn 80 thư mục_

- **cang-hp/**: web/src/lich-tau/
- BangLich.tsx
- không nạp
- **BangLich.test.tsx**: nạp quy ước test
- api/src/phi-luu-bai/
- tinhPhi.ts
- không nạp
- **tinhPhi.test.ts**: nạp quy ước test
- khoảng 300 file test, rải trong hơn 80 thư mục
- **.claude/rules/**
- **testing.md**: paths: **/*.test.{ts,tsx}

> **Trong đề chọn gì**
>
> Đề có thể hỏi vì sao, khi file test nằm rải rác cạnh file nguồn, nên đặt quy ước test vào một file trong `.claude/rules/` thay vì sửa CLAUDE.md gốc. Đáp án đúng nói rằng gom mọi quy ước vào CLAUDE.md gốc thì Claude phải tự đoán đoạn nào áp cho file nào, nên không chắc lần nào Claude cũng theo đúng. Hai đáp án sai nói CLAUDE.md gốc chỉ dùng để mở rộng biến môi trường, hoặc nói nó không xử lý được framework test như Jest hay Vitest. Cả hai đều sai, vì CLAUDE.md gốc ghi được mọi loại quy ước. Cũng đừng chọn đáp án nói rule trong `.claude/rules/` tự chạy lệnh shell trước khi nạp. Rule chỉ là chữ nạp vào context, còn muốn chạy lệnh thì dùng hook, tức lệnh shell mà Claude Code tự chạy ở những thời điểm định sẵn.

## Rule theo đường dẫn hay CLAUDE.md ở thư mục con

CLAUDE.md đặt trong thư mục con (**subdirectory CLAUDE.md files**) cũng chỉ nạp khi Claude đọc hay sửa file trong thư mục đó. Vì vậy, với quy ước gắn chặt với một thư mục, như quy ước Terraform cho `terraform/`, cách nào cũng chạy được. Hai cách chỉ khác nhau khi một quy ước phải áp cho file nằm ở nhiều thư mục.

CLAUDE.md gắn với thư mục chứa nó. Muốn dùng nó cho quy ước test, chị Thảo phải đặt một bản CLAUDE.md trong từng thư mục có file test, tức hơn 80 bản. Sửa một dòng quy ước là phải sửa hơn 80 chỗ, và mỗi lần thêm thư mục mới, chị lại phải nhớ chép thêm một bản. Một bản CLAUDE.md đặt ở `web/` cũng không giúp gì, vì nó nạp cho mọi file trong `web/`, kể cả file không phải test. Còn rule có mẫu glob thì chỉ cần một file, áp cho mọi file đúng loại, dù file đó nằm ở đâu.

**Sơ đồ: Quy ước test bằng CLAUDE.md phải chép hơn 80 bản; rule có mẫu glob chỉ cần một file**

✗ _CLAUDE.md trong từng thư mục có file test_
1. Đặt **hơn 80 bản** CLAUDE.md, mỗi thư mục có file test một bản
   ↓ _sửa một dòng quy ước_
2. Sửa lần lượt từng bản, thư mục mới lại phải nhớ chép thêm
3. **Hơn 80 chỗ** phải sửa khi đổi một dòng quy ước

✓ _Một file rule trong .claude/rules/_
1. Mẫu glob theo đuôi file khớp mọi file test, nằm ở thư mục nào cũng vậy
   ↓ _sửa một dòng quy ước_
2. **1 chỗ** thư mục mới có file test cũng tự khớp mẫu

Vì vậy, với quy ước áp cho một loại file nằm rải rác khắp repo, như file test, file migration hay file cấu hình, bạn nên dùng rule theo đường dẫn với mẫu glob.

> **Bẫy đề**
>
> Codebase có nhiều vùng với quy ước khác nhau: component React, handler API, model database. File test nằm rải rác cạnh code nó kiểm tra, như `Button.test.tsx` cạnh `Button.tsx`, và mọi test phải theo cùng một quy ước. Cách nào dễ bảo trì nhất để Claude tự áp đúng quy ước khi sinh code? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gom mọi quy ước vào CLAUDE.md gốc, chia mục theo vùng, để Claude tự suy ra mục nào áp** (_consolidate in root CLAUDE.md_). Một chỗ thì dễ quản lý, nhưng cách này dựa vào Claude tự đoán chứ không khớp theo đường dẫn, nên không chắc chắn.
> - **Tạo một skill trong `.claude/skills/` cho mỗi loại code, ghi quy ước trong `SKILL.md`** (_skills per code type_). Nghe như đóng gói gọn gàng. Có điều skill, tức gói hướng dẫn Claude nạp khi cần, chỉ nạp khi bạn gọi nó hoặc khi Claude tự chọn dùng, chứ không tự nạp theo đường dẫn file như đề yêu cầu.
> - **Đặt một CLAUDE.md riêng trong mỗi thư mục con với quy ước của vùng đó** (_a CLAUDE.md per subdirectory_). Nghe như đúng chỗ. Nhưng CLAUDE.md gắn với thư mục, nên khó áp cho file test nằm rải rác ở nhiều thư mục.
>
> **Chọn:** tạo file rule trong `.claude/rules/` với YAML frontmatter chứa mẫu glob, như `**/*.test.tsx`, để quy ước áp theo đường dẫn file bất kể thư mục.

> **Trong đề chọn gì**
>
> Đề có thể bắt chọn hai nhận định đúng về `.claude/rules/`. Nhận định thứ nhất là thư mục này giúp chia hướng dẫn thành nhiều file theo chủ đề, thay cho một CLAUDE.md nguyên khối. Nhận định thứ hai là rule có thể khai báo trường `paths` trong YAML frontmatter với mẫu glob, để chỉ nạp khi Claude làm việc với file khớp. Đáp án nói rule thay được MCP server, tức chương trình cho Claude gọi tới hệ thống bên ngoài, để lấy schema API mới nhất từ backend là sai, vì rule chỉ là chữ cố định nạp vào context. Đáp án nói rule của project tự ghi đè `~/.claude/CLAUDE.md` của từng người cũng sai, vì Claude Code nối các file hướng dẫn lại với nhau, chứ không để file nào ghi đè file nào.

> **Ý chính**
>
> Khi bạn thêm trường `paths` với mẫu glob vào frontmatter của một file trong `.claude/rules/`, rule đó chỉ nạp khi Claude đọc hay sửa file khớp mẫu. Nhờ vậy context chỉ chứa quy ước liên quan và đỡ tốn token. Mẫu glob như `**/*.test.{ts,tsx}` áp quy ước theo loại file, bất kể file nằm ở thư mục nào. CLAUDE.md ở thư mục con gắn với một thư mục, nên chỉ hợp với quy ước gắn chặt với thư mục đó. Quy ước cho file nằm rải rác khắp repo thì dùng rule theo đường dẫn.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 3.3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [How Claude remembers your project (Claude Code)](https://code.claude.com/docs/en/memory)
