---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/7-1-cau-hinh-claude-code-cho-team
ngay_tai: 2026-11-27
tieu_de: Cấu hình Claude Code cho cả đội
---

Domain 7: Developer Productivity & Operational Enablement · Task 7.1

# Cấu hình Claude Code cho cả đội

Các nơi đặt cấu hình Claude Code, cái nào thắng khi trùng, viết luật quyền, đưa thứ bắt buộc vào managed settings, và triển khai cho đội theo từng bước.

- 10 phút đọc
- Đối chiếu docs 02/11/2026
- 13 nguồn

## Đọc xong bạn nắm được

- Chọn đúng nơi đặt cấu hình cho thứ của cả tổ chức, của nhóm, của một người
- Biết thứ tự ưu tiên giữa các nơi cấu hình và cách mảng quyền được gộp
- Viết luật allow, ask, deny hẹp đúng việc thay vì cho chạy mọi lệnh
- Đưa thiết lập bảo mật vào managed settings để không ai tắt được
- Lên kế hoạch triển khai cho đội, gồm cấu hình nền, chạy thử và quản lý skill

Một lập trình viên dùng Claude Code thì cấu hình thế nào cũng được. Một trăm người dùng cùng lúc thì khác: thứ phải giống nhau cho cả nhóm, thứ không ai được tắt, thứ để mỗi người tự chọn đều phải nằm đúng chỗ.

Bài này giúp bạn trả lời: cấu hình Claude Code cho một đội hay cả tổ chức thế nào để vừa thống nhất, vừa an toàn, vừa không bó tay từng người?

## Ví dụ xuyên suốt: công ty game di động

Một công ty game di động có 120 lập trình viên trong 8 nhóm sắp dùng Claude Code. Yêu cầu từ các phía:

- **Phòng an toàn thông tin**: Claude không được đọc file `.env` chứa khoá dịch vụ, không ai được bật chế độ bỏ qua mọi lời hỏi quyền, và chỉ dùng tài khoản của công ty.
- **Nhóm làm server game**: mọi người trong repo dùng chung một MCP server tra cứu hệ thống quản lý công việc, và chung một bộ quy ước code.
- **Từng người**: có người muốn Claude trả lời bằng tiếng Việt, có người thích theme sáng.

## Năm nơi đặt cấu hình, mỗi nơi chạm tới ai

| Nơi (scope) | File | Ảnh hưởng tới | Trong ví dụ |
| --- | --- | --- | --- |
| Managed | Do quản trị viên phát: qua bảng quản trị, qua công cụ quản lý thiết bị, hoặc file `managed-settings.json` trên máy | Mọi người trong tổ chức, không ai ghi đè được | Chặn đọc `.env`, tắt chế độ bỏ qua quyền |
| Dòng lệnh | Tham số khi chạy `claude` | Một phiên | Thử một model khác trong một buổi |
| Local | `.claude/settings.local.json`, không commit | Một người trong một repo | Quyền riêng một người cần cho repo này |
| Project | `.claude/settings.json` và `.mcp.json`, commit vào repo | Mọi người làm trong repo đó | MCP server chung, luật quyền chung của nhóm server |
| User | `~/.claude/settings.json` | Một người, ở mọi repo | Ngôn ngữ trả lời, theme |

Khi hai nơi đặt cùng một thiết lập, thứ tự ưu tiên từ cao xuống thấp là **managed > dòng lệnh > local > project > user**. Với thiết lập một giá trị, nơi cao hơn thắng. Với các mảng như danh sách luật quyền, docs nói các mảng được **gộp** từ mọi nơi, nên một luật deny ở bất kỳ nơi nào cũng có hiệu lực.

Đặt một thiết lập vào đâu thì hỏi nó chạm tới ai:

1. **Áp cho cả tổ chức, không ai được tắt?** → Managed
2. **Chung cho mọi người làm trong repo?** → Project, commit vào repo
3. **Chỉ một người, trong một repo?** → Local, không commit
4. **Chỉ một người, đi theo họ qua mọi repo?** → User
- **Còn lại** → Chỉ cho một phiên: tham số dòng lệnh

`.mcp.json` là cách để cả nhóm dùng chung MCP server mà không phải đồng bộ tay: commit vào repo, ai kéo code về cũng có. Docs Claude Code nói server khai báo ở đây cần mỗi người duyệt một lần trước khi dùng.

Vì `.claude/settings.json` được commit cho cả nhóm, đừng đặt API key hay bất kỳ credential nào vào đó. Bài hướng dẫn về API key trên Help Center của Anthropic nói không đưa key trực tiếp vào code hay file cấu hình, cách an toàn là dùng biến môi trường, và khi triển khai thật thì dùng giải pháp quản lý bí mật (secret management) để truyền key vào lúc chạy.

> **Trong đề chọn gì**
>
> Bốn câu luyện thi về chọn scope. Thứ tự ưu tiên: **Managed > command-line > local > project > user**. Cả nhóm dùng chung MCP server mà không đồng bộ tay: **`.claude/settings.json` và `.mcp.json` ở project scope, commit vào repo**. User scope dùng cho **thứ của riêng một người, đi theo họ qua mọi repo** (theme, ngôn ngữ trả lời). Danh sách thực hành tốt: **project scope cho MCP server và luật quyền dùng chung**, **managed cho thiết lập bảo mật không ai được ghi đè**.

> **Bẫy đề**
>
> Các đáp án sai trong nhóm câu đó: đặt luật bảo mật ở local scope "để từng người tự điều chỉnh"; đặt MCP server chung của nhóm ở user scope; đặt sở thích cá nhân như theme ở project scope; dùng user scope để áp chính sách cho cả công ty. Mỗi thứ đều đặt sai người chịu ảnh hưởng.

## Luật quyền: allow, ask, deny

Luật quyền quyết định Claude được làm gì mà không cần hỏi. Claude Code xét **deny trước, rồi ask, rồi allow**. Docs nói rõ một luật allow không khoét được ngoại lệ trong một luật deny.

1. **Lệnh khớp luật deny?** → Bị chặn, dù có khớp luật allow
2. **Khớp luật ask?** → Claude phải hỏi
3. **Khớp luật allow?** → Chạy không cần hỏi
- **Còn lại** → Không khớp luật nào: theo chế độ quyền đang dùng

Cách viết đúng là hẹp theo việc thật cần, kèm deny rõ cho thao tác nhạy cảm:

```json
{
  "permissions": {
    "allow": ["Bash(npm run test *)", "Bash(npm run lint *)", "Bash(git diff *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Bash(git push --force *)"]
  }
}
```

Trong ví dụ, `git push` thường thì Claude phải hỏi, còn `git push --force` thì bị cấm: lệnh khớp cả luật ask lẫn luật deny thì deny thắng.

> **Bẫy đề**
>
> Câu luyện thi: một đồng nghiệp viết luật cho Bash chạy mọi lệnh ở mọi dự án. Đáp án đúng là **thay bằng các mẫu lệnh hẹp đúng việc cần, và thêm deny rõ cho thao tác nhạy cảm**. Sai: duyệt luôn vì thu hẹp thì cấu hình phức tạp; mở thêm quyền cho các tool khác "cho cân"; tắt hết luật quyền.

Có một giới hạn cần nhớ: luật dạng `Bash(...)` so theo chuỗi lệnh, nên không phải ranh giới bảo mật tuyệt đối. Ví dụ trong docs gỡ lỗi cấu hình: deny `Bash(rm *)` không chặn được lệnh gọi bằng đường dẫn đầy đủ `/bin/rm`. Muốn chặn ở mức hệ điều hành thì bật sandbox.

## Thứ bắt buộc thì đưa vào managed settings

Phòng an toàn thông tin muốn những thiết lập không ai tắt được. Chỗ duy nhất làm được việc đó là **managed settings**, đặt tập trung cho cả tổ chức. Docs Claude Code nêu ba cách phát: cấu hình trên máy chủ qua bảng quản trị của claude.ai, qua công cụ quản lý thiết bị (plist trên macOS, registry trên Windows), hoặc file `managed-settings.json` trong thư mục hệ thống như `/etc/claude-code/` hay `C:\Program Files\ClaudeCode\`. Lập trình viên không ghi đè được giá trị managed. Có nhiều nguồn managed cùng lúc thì mặc định Claude Code chỉ dùng nguồn xếp hạng cao nhất (cấu hình từ máy chủ, rồi tới công cụ quản lý thiết bị, rồi tới file) và bỏ qua các nguồn còn lại. Dòng `Setting sources` trong `/status` cho biết máy đang nhận nguồn nào.

Vài thiết lập hay đặt trong managed settings để khoá chặt hơn. Nhóm `allowManaged...Only` chỉ được đọc từ managed:

| Thiết lập | Tác dụng |
| --- | --- |
| `permissions.disableBypassPermissionsMode` | Không ai bật được chế độ bỏ qua mọi lời hỏi quyền |
| `allowManagedPermissionRulesOnly` | Chỉ dùng luật quyền từ managed, bỏ qua luật ở các nơi khác |
| `allowManagedMcpServersOnly`, `allowManagedHooksOnly` | Chỉ dùng MCP server, hook do quản trị viên khai báo |
| `forceLoginMethod`, `forceLoginOrgUUID` | Buộc đăng nhập bằng tài khoản tổ chức |
| `availableModels` | Giới hạn các model được chọn |

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi cách bảo đảm một cờ bảo mật không kỹ sư nào tắt được. Chọn **managed configuration áp tập trung, không ghi đè được**. Sai: user scope trên máy từng người; biến môi trường chỉ trong CI/CD; project scope commit vào repo. Cả ba đều có đường vòng.

Còn hướng dẫn cho Claude thì sao? Quy ước code, kiến trúc dự án nên ghi vào `CLAUDE.md` của repo và commit, để phiên nào cũng tự nạp, không ai phải gõ lại đầu mỗi phiên. Docs cũng có `CLAUDE.md` managed cho cả tổ chức. Nhưng docs nói rõ `CLAUDE.md` là ngữ cảnh, không phải cấu hình bắt buộc. Chặn đọc `.env` phải là luật deny, không phải một dòng "đừng đọc .env" trong `CLAUDE.md`.

## Triển khai cho cả đội từng bước

Trang hướng dẫn quản trị của Claude Code đi theo các câu hỏi: dùng nhà cung cấp nào, phát cấu hình bằng cách nào, thứ gì cần ép, theo dõi mức dùng ra sao, dữ liệu đi đâu, và kiểm bằng `/status` trên một máy sau khi phát. Áp vào ví dụ, thứ tự hợp lý là:

1. **Trước khi chạy thử**: xác định quy trình làm việc của các nhóm, ranh giới bảo mật, và việc nào thuộc managed, việc nào thuộc project. Soạn cấu hình nền ở project scope: MCP server, luật quyền, subagent dùng chung.
2. **Chạy thử** với một nhóm nhỏ, lấy phản hồi.
3. **Chỉnh và ổn định** cấu hình nền theo kết quả chạy thử.
4. **Mở rộng** sang các nhóm khác, kèm tài liệu và một kênh hỗ trợ.

> **Trong đề chọn gì**
>
> Câu luyện thi hỏi hai bước phải xong **trước khi** chạy thử cấu hình với nhóm nhỏ. Chọn **định nghĩa cấu hình nền ở project scope (MCP server, luật quyền, subagent)** và **xác định quy trình của nhóm, ranh giới bảo mật, việc nào thuộc managed và việc nào thuộc project**. Loại: đào tạo bắt buộc cho cả tổ chức; mở rộng sang nhóm khác; chỉnh theo kết quả chạy thử. Hai việc cuối cần kết quả chạy thử nên đến sau.

Còn khi công ty chưa có công cụ quản lý thiết bị (MDM), máy lập trình viên không được quản lý thì sao? Chọn Claude for Teams hoặc Enterprise làm nhà cung cấp: một gói theo seat dùng chung cho Claude Code và claude.ai, không cần tự chạy hạ tầng. Chính sách phát qua **server-managed settings** từ bảng quản trị claude.ai: Claude Code tải khi khởi động và làm mới mỗi giờ, không cần MDM. Cách này phủ cả phiên chạy trên cloud, còn settings phát qua MDM thì không tới được các phiên đó. Mức dùng xem ở `claude.ai/analytics/claude-code`; số token và chi tiêu ước tính theo từng người lấy từ báo cáo chi tiêu trong phần cài đặt analytics. Nếu chọn Bedrock làm nhà cung cấp thì server-managed settings bị bỏ qua.

Skill (gói hướng dẫn và script Claude nạp khi cần) là chỗ dễ loạn khi đội lớn. Câu luyện thi có tình huống 280 lập trình viên trong 14 nhóm muốn dùng skill cho chuẩn code, checklist review, mẫu báo cáo sự cố. Cách quản lý được chấm đúng: **mỗi nhóm tự viết skill của mình, nhưng có một cổng duyệt và phát hành chung**. Để một nhóm trung tâm viết hết thì nghẽn; để ai cũng viết, không duyệt thì không ai tin được. Docs Claude Code gợi ý đóng gói skill dùng chung thành plugin để một nhóm nền tảng quản lý phiên bản ở một chỗ.

**Sơ đồ**
1. **Nhóm chuẩn code**: tự viết skill **|** **Nhóm review**: tự viết skill **|** **Nhóm vận hành**: tự viết skill
   ↓ _qua một cổng chung_
2. **Cổng duyệt và phát hành**: giữ chất lượng để các nhóm tin dùng được
   ↓ _đóng gói thành plugin, quản lý phiên bản ở một chỗ_
3. **Skill dùng chung cho cả công ty**

> **Ý chính**
>
> Thứ của cả tổ chức và không ai được tắt thì vào managed; thứ chung của nhóm thì vào project scope và commit; thứ của riêng một người thì vào user. Luật quyền viết hẹp kèm deny rõ, deny luôn thắng; `CLAUDE.md` để hướng dẫn, không để ép buộc.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 7](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Claude Code settings (Claude Code Docs)](https://code.claude.com/docs/en/settings)
3. [Configure permissions (Claude Code Docs)](https://code.claude.com/docs/en/permissions)
4. [Managed settings (Claude Code Docs)](https://code.claude.com/docs/en/managed-settings)
5. [Set up Claude Code for your organization (Claude Code Docs)](https://code.claude.com/docs/en/admin-setup)
6. [Memory and project instructions (Claude Code Docs)](https://code.claude.com/docs/en/memory)
7. [Connect Claude Code to tools via MCP (Claude Code Docs)](https://code.claude.com/docs/en/mcp)
8. [Set up Claude Code in a monorepo or large codebase (Claude Code Docs)](https://code.claude.com/docs/en/large-codebases)
9. [Debug your configuration (Claude Code Docs)](https://code.claude.com/docs/en/debug-your-config)
10. [API key best practices (Claude Help Center)](https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure)
11. [Server-managed settings (Claude Code Docs)](https://code.claude.com/docs/en/server-managed-settings)
12. [Analytics (Claude Code Docs)](https://code.claude.com/docs/en/analytics)
13. [Third-party integrations (Claude Code Docs)](https://code.claude.com/docs/en/third-party-integrations)
