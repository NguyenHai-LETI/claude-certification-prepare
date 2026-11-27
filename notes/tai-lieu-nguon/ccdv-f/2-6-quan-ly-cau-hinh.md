---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/2-6-quan-ly-cau-hinh
ngay_tai: 2026-11-27
tieu_de: Quản lý cấu hình - CLAUDE.md, settings.json, ghim model, phiên bản prompt, plugin
---

Domain 2: Applications and Integration · Task 2.6

# Quản lý cấu hình - CLAUDE.md, settings.json, ghim model, phiên bản prompt, plugin

Đặt CLAUDE.md và settings.json đúng tầng, đưa vào version control, ghim model ID, quản lý phiên bản prompt có review, và ghim phiên bản plugin phụ thuộc.

- 9 phút đọc
- Đối chiếu docs 02/11/2026
- 8 nguồn

## Đọc xong bạn nắm được

- Đặt chỉ dẫn vào đúng tầng CLAUDE.md để luật chung không phải chép lại ở từng repo
- Biết thứ tự ưu tiên của các file settings.json và file nào commit, file nào không
- Phân biệt model ID ghim cố định với alias tự đổi, và ghim model cho từng môi trường
- Quản lý prompt như code - một nguồn duy nhất, version control, bắt buộc review, ghim và lùi phiên bản
- Khai báo plugin phụ thuộc với dải phiên bản hoặc ghim đúng một phiên bản

Một ứng dụng dùng Claude có nhiều thứ "không phải code" nhưng quyết định hành vi y như code: file chỉ dẫn, file settings, tên model, nội dung prompt, phiên bản plugin. Khi chúng nằm rải rác trong biến môi trường, script cài đặt và trí nhớ của từng người, sự cố production sẽ rất khó lần lại.

Bài này giúp bạn trả lời: mỗi loại cấu hình đặt ở đâu, ghim thế nào, và thay đổi qua quy trình nào?

## Ví dụ xuyên suốt: đội phần mềm của công ty vận tải container

Một công ty vận tải container có 4 repo dùng Claude Code hằng ngày và một ứng dụng dùng Claude API để đọc vận đơn, chạy ở ba môi trường: dev, staging, production. Hiện trạng:

- Quy ước code chung của công ty được chép tay vào `CLAUDE.md` của cả 4 repo, và đã bắt đầu lệch nhau.
- Model và prompt của ứng dụng đọc vận đơn nằm lẫn trong biến môi trường, giá trị viết thẳng trong code và một script cài đặt không ai ghi tài liệu.
- Tuần trước, một plugin tự cập nhật lên bản mới làm hỏng một skill, và không ai biết bản cũ là bản nào.

## CLAUDE.md theo tầng

Claude Code đọc `CLAUDE.md` từ nhiều tầng và cộng dồn chúng:

| Tầng | Vị trí | Dùng cho |
| --- | --- | --- |
| Managed policy | Đường dẫn hệ thống, như `/etc/claude-code/CLAUDE.md` trên Linux | Quy chuẩn chung của tổ chức, do IT triển khai |
| User | `~/.claude/CLAUDE.md` | Thói quen riêng của bạn, mọi dự án |
| Project | `./CLAUDE.md` hoặc `./.claude/CLAUDE.md` | Quy ước của dự án, cả đội dùng chung qua source control |
| Local | `./CLAUDE.local.md` (thêm vào `.gitignore`) | Ghi chú riêng của bạn trong dự án này |

Các file ở thư mục cha được nạp khi mở phiên; file trong thư mục con nạp khi Claude làm việc ở đó. Ngoài ra:

- Luật chỉ áp dụng cho một phần code thì đặt trong `.claude/rules/`, có thể giới hạn theo đường dẫn file.
- `CLAUDE.md` có thể nhập file khác bằng `@duong/dan/file`.
- Repo đã có `AGENTS.md` cho công cụ khác: nếu không có `CLAUDE.md`, Claude Code đọc `AGENTS.md`.
- Docs khuyên mỗi file dưới 200 dòng; file dài tốn context và Claude làm theo kém hơn.

Trong ví dụ, quy ước chung đưa lên một tầng rộng (managed policy do IT triển khai cho máy của cả đội), còn `CLAUDE.md` của từng repo chỉ giữ phần riêng của repo đó.

**Sơ đồ**
1. **Managed policy**: quy ước code chung của công ty, IT triển khai
   ↓ _cộng dồn với_
2. **Repo 1**: phần riêng của repo **|** **Repo 2**: phần riêng của repo **|** **Repo 3**: phần riêng của repo **|** **Repo 4**: phần riêng của repo

> **Trong đề chọn gì**
>
> Câu luyện thi: đội dùng Claude Code ở nhiều repo, muốn quy chuẩn chung áp cho mọi repo và vài luật chỉ áp cho repo cụ thể, hiện đang chép lặp. Chọn **phân tầng `CLAUDE.md`: quy chuẩn chung ở tầng rộng, ngữ cảnh riêng trong `CLAUDE.md` của từng repo**. Sai: chuyển hết sang trang tài liệu riêng; bỏ `CLAUDE.md` và để mỗi người tự cấu hình; lấy `CLAUDE.md` của một repo làm nguồn chính rồi trỏ link từ các repo khác.

## settings.json: tầng nào thắng, file nào commit

Khi cùng một khoá có ở nhiều nơi, Claude Code lấy giá trị ở tầng cao nhất, theo thứ tự: managed settings, tham số dòng lệnh, `.claude/settings.local.json` (riêng bạn trong dự án), `.claude/settings.json` (cả đội), `~/.claude/settings.json` (riêng bạn, mọi dự án).

Quy tắc "lấy giá trị ở tầng cao nhất" chỉ áp dụng cho khoá một giá trị như `model`. Với khoá dạng danh sách như `permissions.allow` hay `permissions.deny`, Claude Code **gộp** các danh sách từ mọi file thay vì để file này thay hẳn file kia. Khi kiểm quyền, nó xét luật theo thứ tự deny, rồi ask, rồi allow, và luật khớp đầu tiên quyết định kết quả. Hệ quả: luật `deny` trong `.claude/settings.json` của dự án vẫn chặn lệnh, dù một lập trình viên thêm luật `allow` cho đúng lệnh đó trong `.claude/settings.local.json`. Allow không khoét được ngoại lệ trong deny, và deny ở bất kỳ tầng nào cũng thắng allow.

Docs khuyên commit `.claude/settings.json` để ai clone repo cũng có cùng quyền, hook và plugin; còn `.claude/settings.local.json` thì không commit (Claude Code tự loại nó khỏi git khi tạo file). Như vậy thay đổi cấu hình và thay đổi code đi chung một pull request, được review cùng nhau, và checkout một commit cũ là có đúng cặp code và cấu hình của thời điểm đó.

> **Bẫy đề**
>
> Câu luyện thi: chọn cách quản lý `CLAUDE.md` và `settings.json` để thay đổi được theo dõi và review. Đúng là **đưa cả hai vào version control cùng repo với source code, thay đổi qua quy trình pull request thường lệ**. Sai: chép chúng sang nhiều repo cho "dự phòng"; để cả hai, hoặc chỉ `settings.json`, trong một repo cấu hình tách khỏi code.

## Ghim model

Trên Claude API, mỗi model ID là một bản ghim cố định: model bên dưới không đổi trong suốt vòng đời của ID đó. Từ thế hệ 4.6, ID không còn ngày (`claude-sonnet-5-5`) và bản thân nó đã là bản ghim. Với model cũ hơn, ID có ngày (`claude-sonnet-4-5-20250929`), còn dạng ngắn (`claude-sonnet-4-5`) là alias trỏ tới bản mới nhất của dòng đó; cam kết "không đổi" chỉ áp cho ID, không áp cho alias.

Claude Code có alias riêng: `sonnet`, `opus`, `fable`… luôn trỏ tới bản được khuyên dùng và đổi theo thời gian. Muốn ghim thì dùng tên đầy đủ (`claude-opus-5-5`) hoặc biến môi trường như `ANTHROPIC_DEFAULT_OPUS_MODEL`.

Trong ví dụ, ứng dụng đọc vận đơn ghi model ID đầy đủ cho từng môi trường trong file cấu hình: staging có thể thử model mới trước, production chỉ đổi khi regression test đạt.

**Sơ đồ**
1. **File cấu hình trong version control**: model, phiên bản prompt, plugin của từng môi trường
   ↓ _mỗi môi trường đọc phần của mình_
2. **Dev** **|** **Staging**: thử model mới trước **|** **Production**: chỉ đổi khi regression test đạt

## Prompt là cấu hình, phải có phiên bản

Prompt quyết định hành vi ứng dụng y như code. Quy tắc cơ bản: một nguồn duy nhất cho prompt, lưu trong version control cùng code, và mọi thay đổi prompt phải qua code review.

> **Bẫy đề**
>
> Câu luyện thi: prompt nằm lẫn trong repo, trong file cấu hình riêng và dựng tại chỗ lúc chạy; một thay đổi prompt vừa lên production mà không ai review. Đúng là **lập một nguồn duy nhất cho prompt, version control cùng code, bắt buộc review khi đổi prompt**. Sai: chuyển prompt ra bảng tính cho ai cũng sửa; dựng prompt tại chỗ để sửa nhanh ngoài quy trình review; có nguồn duy nhất nhưng review tuỳ chọn khi gấp.

Có một cách khác khi dùng Claude Managed Agents: prompt nằm ở phía server. Mỗi lần cập nhật agent tạo ra một phiên bản mới không sửa được; session chọn phiên bản bằng số. Cookbook của Anthropic chỉ ra chỗ hở: không có bước duyệt nào cho thao tác cập nhật, và ai gọi bằng ID trần sẽ nhận ngay bản mới nhất. Cách đưa bước review trở lại: production luôn ghim một số phiên bản cụ thể, và con số đó nằm trong cấu hình có review. Tạo phiên bản mới thì dễ; đưa nó lên production (sửa con số ghim) mới phải qua review. Lùi lại chỉ là ghim về số cũ.

**Sơ đồ**
1. **Cập nhật agent**: tạo phiên bản mới, không có bước duyệt
   ↓ _đưa lên production: sửa con số ghim trong cấu hình, qua review_
2. **Production ghim phiên bản mới**

## Plugin phụ thuộc: ghim phiên bản

Docs về plugin dependencies nói: một phụ thuộc không có ràng buộc phiên bản sẽ theo bản mới nhất của marketplace mỗi lần người dùng cập nhật. Nếu bản mới đổi tên một tool MCP mà plugin của bạn gọi, plugin hỏng với mọi người vừa cập nhật. Đó đúng là chuyện đã xảy ra trong ví dụ.

Khai báo phụ thuộc trong `.claude-plugin/plugin.json` với một dải phiên bản theo semantic versioning:

```json
{
  "name": "doc-van-don",
  "version": "3.1.0",
  "dependencies": [
    "audit-logger",
    { "name": "kho-ma-cang", "version": "~2.1.0" }
  ]
}
```

`~2.1.0` nhận các bản vá `2.1.x` nhưng không lên `2.2`; `^2.0` nhận mọi bản `2.x`; `=2.1.0` ghim đúng một bản. Muốn lên bản mới thì thử trước rồi mới nới dải phiên bản. Người duy trì plugin được phụ thuộc phải gắn tag cho các bản phát hành để dải phiên bản phân giải được.

> **Trong đề chọn gì**
>
> Hai câu luyện thi về cấu hình. Plugin cập nhật gây lỗi mà không ai theo dõi phiên bản: chọn **thêm theo dõi phiên bản plugin vào cấu hình dự án để xác định, ghim và nâng cấp có chủ đích**, không phải bỏ hết plugin hay nâng cấp đều đặn lên bản mới nhất. Ba môi trường dùng model, prompt, plugin khác nhau nhưng cấu hình rải rác: chọn **gom cấu hình vào một hệ thống có version control, ghi rõ model ghim, phiên bản prompt và plugin của từng môi trường**, không phải ép mọi môi trường dùng chung giá trị hay bỏ ghim model.

1. **Chỉ dẫn cho Claude Code?** → CLAUDE.md đúng tầng, commit bản project
2. **Quyền, hook, plugin cho cả đội?** → .claude/settings.json, commit; ngoại lệ riêng vào settings.local.json
3. **Model của ứng dụng?** → Model ID đầy đủ, ghi theo từng môi trường
4. **Prompt?** → Một nguồn, version control, review bắt buộc, ghim phiên bản trên production
- **Còn lại** → Plugin phụ thuộc: khai dải phiên bản hoặc ghim đúng bản

> **Ý chính**
>
> Mọi thứ quyết định hành vi của Claude (CLAUDE.md, settings.json, model, prompt, plugin) đều là cấu hình: đặt đúng tầng, lưu trong version control cùng code, thay đổi qua review, và ghim phiên bản để biết chính xác production đang chạy gì.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 2](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [How Claude remembers your project (Claude Code Docs)](https://code.claude.com/docs/en/memory)
3. [Settings files and precedence (Claude Code Docs)](https://code.claude.com/docs/en/settings)
4. [Model IDs and versioning (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)
5. [Model configuration (Claude Code Docs)](https://code.claude.com/docs/en/model-config)
6. [Prompt versioning and rollback (Claude Cookbook)](https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback)
7. [Plugin dependencies (Claude Code Docs)](https://code.claude.com/docs/en/plugins/dependencies)
8. [Configure permissions (Claude Code Docs)](https://code.claude.com/docs/en/permissions)
