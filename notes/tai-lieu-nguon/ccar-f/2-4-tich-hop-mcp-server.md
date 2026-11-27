---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-4-tich-hop-mcp-server
ngay_tai: 2026-11-27
tieu_de: Tích hợp MCP server vào Claude Code và agent
---

Domain 2: Tool Design & MCP Integration · Task 2.4

# Tích hợp MCP server vào Claude Code và agent

Chọn server có sẵn hay tự viết, đặt server ở scope project hay user, giữ token bằng biến môi trường, viết mô tả để agent chịu dùng tool MCP, dùng MCP resources.

- 16 phút đọc
- Đối chiếu docs 22/11/2026
- 3 nguồn

## Đọc xong bạn nắm được

- Chọn server có sẵn cho hệ thống phổ biến, tự viết server cho quy trình riêng của đội
- Đặt server dùng chung trong .mcp.json và server cá nhân trong ~/.claude.json
- Dùng biến môi trường trong .mcp.json để không commit token
- Hiểu rằng tool của mọi MCP server đã kết nối đều dùng được cùng lúc
- Viết mô tả tool MCP đủ rõ để agent không quay về Grep hay Bash, và dùng MCP resources để agent đọc được danh mục dữ liệu

Đội bạn sắp nối vài MCP server vào Claude Code. Nên dùng server có sẵn hay tự viết? Cấu hình đặt ở đâu để cả đội dùng chung, và token để ở đâu cho khỏi lộ? Vì sao đã có tool MCP mà Claude vẫn quay về Grep, tool tìm chữ có sẵn mà nó quen dùng? Và làm sao để Claude biết mỗi server có dữ liệu gì mà không phải dò từng bước? Bài này trả lời lần lượt từng câu.

**Sơ đồ: Claude Code đọc cấu hình ở hai nơi rồi nối mọi server, còn mô tả tool quyết định Claude chọn gì**
_Bản đồ bài: hai nơi đặt cấu hình theo scope, Claude Code nối mọi MCP server có sẵn hay tự viết, rồi Claude chọn giữa tool dựng sẵn, MCP tools và MCP resources_

- **CẤU HÌNH THEO SCOPE**
- **.mcp.json**: scope project, lên git
- token: ${BIEN}
- **~/.claude.json**: user hoặc local
- riêng máy bạn
- **Claude Code**: nối mọi server
- khi mở session
- **MCP SERVER**
- **Server có sẵn**: Jira, GitHub
- tích hợp chuẩn
- **Server tự viết**: quy trình riêng
- của đội
- mọi tool,
- cùng lúc
- **CLAUDE CHỌN THEO MÔ TẢ TOOL**
- **Grep, Read, Bash**: tool dựng sẵn,
- Claude quen dùng
- **MCP tools**: mcp__server__tool
- hành động, ghi được
- **MCP resources**: danh mục nội dung
- đọc trước, đỡ dò
- Mô tả nói rõ tool MCP hơn Grep ở đâu thì Claude mới chọn nó

## Ví dụ xuyên suốt: đội phần mềm quản lý khách sạn

Một công ty ở Nha Trang viết phần mềm quản lý khách sạn, đang chạy ở khoảng 150 khách sạn và resort miền Trung. Phần mềm lo đặt phòng, nhận phòng, trả phòng, và đồng bộ giá phòng lên các trang đặt phòng trực tuyến (OTA, như Booking hay Agoda). Đội có 8 dev, ai cũng dùng Claude Code hằng ngày. Họ dùng Jira để quản lý việc, GitHub để chứa code, một wiki nội bộ để viết tài liệu thiết kế, và một database PostgreSQL khoảng 120 bảng.

## Dùng server có sẵn hay tự viết

Đội muốn Claude đọc được ticket Jira, thay vì dev phải copy-paste nội dung ticket vào cuộc trò chuyện. Lúc đầu đội định tự viết một MCP server bọc API của Jira, với vài tool riêng cho quy trình của đội. Trưởng nhóm cân nhắc lại. Jira rất phổ biến, nên đã có sẵn MCP server mà nhiều đội đang dùng (**existing community MCP servers**), với tool để đọc ticket, comment và metadata. Tự viết nghĩa là tự lo xác thực, phân trang, rate limit, và sửa lại mỗi khi Jira đổi API, chỉ để có thứ gần giống bản có sẵn.

Cuối cùng đội dùng server Jira và server GitHub có sẵn, và chỉ tự viết server (**custom servers**) `dong_bo_ota`, vì chưa ai làm sẵn server đọc nhật ký đồng bộ giá phòng theo định dạng riêng của công ty. Quy tắc chung là hệ thống phổ biến như Jira hay GitHub thì dùng server có sẵn, còn quy trình riêng của đội (**team-specific workflows**) mới cần tự viết server.

Dùng server có sẵn thì cần thêm một bước. Trước khi kết nối một server của bên ngoài, hãy chắc là bạn tin nguồn của nó. Server đọc nội dung từ bên ngoài có thể mang theo prompt injection, tức đoạn chữ được cài sẵn để lừa Claude làm theo.

> **Trong đề chọn gì**
>
> Nếu tình huống trong đề cần agent đọc thẳng dữ liệu của một hệ thống phổ biến như Jira, thay vì copy-paste bằng tay, hãy chọn đáp án dùng MCP server có sẵn. Gọi REST API bằng curl trong Bash thì agent phải tự lo header xác thực và tự đọc JSON thô, mà không có tool nào để agent tự tìm thấy. Xuất ticket ra file markdown trong repo thì dữ liệu cũ ngay khi xuất xong, và phải xuất lại bằng tay. Tự viết server bọc API thì tốn công làm lại thứ đã có. Server tự viết chỉ hợp khi quy trình là riêng của đội.

## Server dùng chung để trong .mcp.json, server cá nhân để trong ~/.claude.json

Đội muốn mọi người cùng dùng ba MCP server: Jira, GitHub và `dong_bo_ota`. Ban đầu mỗi người tự thêm server trên máy mình, mỗi người đặt tên một kiểu, và người mới vào phải hỏi đồng nghiệp từng bước cài đặt. Trong khi đó, Khánh, một dev trong đội, đang thử một server ghi chú cá nhân mà chưa ai khác cần.

Khi thêm một MCP server vào Claude Code, bạn chọn một trong ba phạm vi (**scope**). Scope quyết định cấu hình được lưu ở file nào, dùng được ở project nào, và có chia sẻ với đội hay không:

| Scope | Dùng được ở đâu | Chia sẻ với đội | Lưu ở |
| --- | --- | --- | --- |
| Local (mặc định) | Chỉ project hiện tại | Không | `~/.claude.json`, trong mục của project đó |
| Project | Chỉ project hiện tại | Có, qua git | `.mcp.json` ở thư mục gốc project |
| User | Mọi project trên máy bạn | Không | `~/.claude.json` |

Đội thêm ba server dùng chung bằng lệnh `claude mcp add` với cờ `--scope project`, nên Claude Code ghi chúng vào `.mcp.json` ở gốc repo. Đội commit file này, và ai pull code về cũng có đúng ba server với cùng tên. Khánh thêm server ghi chú của mình với `--scope user`. Server này nằm trong `~/.claude.json` trên máy Khánh, dùng được ở mọi project của Khánh, và không ai khác thấy.

```bash
claude mcp add --transport http jira --scope project https://jira-mcp.example.com/mcp
claude mcp add --transport http ghi-chu --scope user https://ghi-chu.example.com/mcp
```

Vì `.mcp.json` có thể do người khác viết rồi đẩy lên git, Claude Code hỏi bạn có đồng ý dùng các server scope project trong file đó không. Câu hỏi này hiện ra khi bạn mở Claude Code và làm việc trực tiếp với nó, nên lần đầu clone repo về, bạn sẽ gặp câu hỏi này.

## Giữ token bằng biến môi trường

Server GitHub cần token để gọi API, và mỗi dev có personal access token riêng. Không ai được commit token thật vào repo, nên đội cần một cách quản lý token (**credential management**) cho file dùng chung. Lúc mới thử, một dev ghi thẳng `Authorization: Bearer ghp_...` vào `.mcp.json` và suýt commit luôn file đó lên repo.

Trong `.mcp.json`, Claude Code tự điền giá trị của biến môi trường vào chỗ bạn ghi tên biến (**environment variable expansion**). Bạn viết `${TEN_BIEN}` ở các field như `command`, `args`, `env`, `url` hay `headers`, và Claude Code thay bằng giá trị của biến đó lúc chạy. Bạn cũng có thể đặt giá trị mặc định bằng cách viết `${TEN_BIEN:-mac_dinh}`, và Claude Code sẽ dùng giá trị đó khi biến chưa được đặt. Server `dong_bo_ota` trong ví dụ dưới đây dùng cách này cho `OTA_MCP_URL`.

```json
{
  "mcpServers": {
    "jira": {
      "type": "http",
      "url": "https://jira-mcp.example.com/mcp"
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    },
    "dong_bo_ota": {
      "type": "http",
      "url": "${OTA_MCP_URL:-https://ota-mcp.noibo.example}/mcp"
    }
  }
}
```

File này commit được, vì nó chỉ chứa tên biến. Mỗi dev tự đặt `GITHUB_TOKEN` trong shell của mình. Nếu một biến chưa được đặt và cũng không có giá trị mặc định, Claude Code vẫn nạp cấu hình, nhưng `claude mcp list` sẽ báo thiếu biến. Khi đó server nhận nguyên chuỗi `${GITHUB_TOKEN}` thay cho token thật, nên không kết nối được.

**Sơ đồ: .mcp.json đưa lên git chỉ chứa tên biến, còn token và server ghi-chu nằm lại trên máy Khánh**
_File .mcp.json trong repo chứa ba server dùng chung với ${GITHUB_TOKEN}; máy Khánh giữ token trong shell và server ghi-chu trong ~/.claude.json_

- **REPO GIT, CẢ ĐỘI PULL**
- **.mcp.json**: scope project, cả đội thấy
- jira
- github: Bearer ${GITHUB_TOKEN}
- dong_bo_ota
- **Bearer ghp_... ghi thẳng**: commit là lộ token lên repo
- **MÁY CỦA KHÁNH**
- **GITHUB_TOKEN=ghp_...**: biến trong shell, không commit
- điền token
- **Claude Code của Khánh**: 3 server từ .mcp.json
- + ghi-chu từ ~/.claude.json
- pull
- thêm ghi-chu
- **~/.claude.json**: ghi-chu, scope user
- 8 dev pull cùng một file, và mỗi người tự đặt GITHUB_TOKEN trong shell của mình

> **Bẫy đề**
>
> Cả đội dùng chung một GitHub MCP server, mỗi người có token riêng, và cấu hình phải commit được vào repo mà không chứa token thật. Nên cấu hình thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Đặt trong `.mcp.json` rồi đưa file đó vào `.gitignore`** (_project scope, but gitignore the file_). Nghe an toàn vì không commit thì không lộ token. Nhưng file không lên repo thì cũng không còn là cấu hình dùng chung.
> - **Ghi `Bearer <token>` trong file, mỗi người tự thay placeholder** (_placeholder in the committed file_). Nghe đơn giản vì ai cũng tự điền được. Có điều người nào thay token thật vào rồi lỡ commit là lộ token lên repo.
> - **Mỗi người tự thêm server ở scope user trong `~/.claude.json`** (_user scope on each machine_). Nghe ổn vì token chỉ nằm trên máy từng người. Ngặt nỗi mỗi người cấu hình một kiểu, và repo không có cấu hình chung nào.
>
> **Chọn:** đặt server ở scope project trong `.mcp.json`, ghi header là `Authorization: Bearer ${GITHUB_TOKEN}`, và để mỗi người tự đặt biến `GITHUB_TOKEN` trong shell của mình. Nếu đề hỏi nên đặt server dùng chung và server thử nghiệm của riêng một người ở đâu, hãy đặt server dùng chung trong `.mcp.json` và server thử nghiệm trong `~/.claude.json`. Đảo ngược hai file thì server dùng chung không tới được ai khác, còn server thử nghiệm lại bị đẩy lên repo cho cả đội. Để cả hai trong `.mcp.json` thì cả đội bị kéo theo server thử nghiệm, còn để cả hai trong `~/.claude.json` thì không ai khác có server dùng chung.

## Tool của mọi server dùng được cùng lúc

Một dev hỏi Claude: "Tạo branch cho HOTEL-482 rồi gắn link tài liệu đồng bộ giá vào ticket." Yêu cầu này cần tool của cả GitHub và Jira. Có người trong đội nghĩ phải chỉ định server nào dùng cho từng yêu cầu, hay Claude chỉ nạp tool của một server mỗi lần.

Thực tế không như vậy. Khi kết nối với từng server đã cấu hình, Claude Code lấy danh sách tool của server đó (**discovered at connection time**). Tool của mọi server đã kết nối đều dùng được cùng lúc (**available simultaneously**). Vì vậy, trong cùng một yêu cầu, Claude gọi tool GitHub để tạo branch rồi gọi tool Jira để cập nhật ticket, và không ai phải chọn server trước. Tên tool có tiền tố theo server, dạng `mcp__github__create_branch`. Tiền tố này chỉ để tên tool của các server không lẫn với nhau. Claude không phải hỏi lần lượt từng server rồi mới định tuyến lời gọi, cũng không chỉ nạp tool của server "liên quan nhất".

Khi có nhiều server và nhiều tool, Claude Code dùng tool search để context đỡ chật, tức là không đưa định nghĩa của mọi tool vào ngay từ đầu. Lúc session bắt đầu, Claude Code chỉ nạp tên tool và đoạn hướng dẫn mà mỗi server gửi kèm. Định nghĩa đầy đủ của một tool, gồm mô tả và tham số, chỉ được lấy về khi Claude cần dùng tool đó. Dù vậy, Claude vẫn gọi được mọi tool ngay từ đầu.

## Viết mô tả để Claude chịu dùng tool MCP

Server `dong_bo_ota` có tool `phan_tich_nhat_ky`. Tool này đọc nhật ký đồng bộ của một khách sạn, nhóm lỗi theo trang đặt phòng và chỉ ra lần đồng bộ hỏng gần nhất. Nhưng khi dev hỏi "vì sao giá phòng khách sạn Hòn Tre không lên được trang đặt phòng", Claude lại dùng Grep tìm chữ "error" trong thư mục nhật ký, đọc từng dòng, và thường bỏ sót nguyên nhân. Lý do nằm ở mô tả của tool (**MCP tool descriptions**), vốn chỉ có đúng một câu: "Phân tích nhật ký đồng bộ."

Claude có sẵn các tool dựng sẵn (**built-in tools**) như Grep, Read hay Bash, và nó quen dùng chúng. Nếu tool MCP chỉ có mô tả sơ sài, Claude không biết tool đó làm được gì hơn Grep, nên cũng chẳng có lý do gì để chọn nó. Đội viết lại mô tả:

```
Phân tích nhật ký đồng bộ giá và phòng trống của một khách sạn lên các trang đặt
phòng trực tuyến trong N ngày gần nhất. Trả về: các lỗi đã nhóm theo trang đặt
phòng và loại lỗi, số lần mỗi lỗi xảy ra, lần đồng bộ thành công cuối cùng, và
lần hỏng gần nhất kèm mã phản hồi của trang. Dùng tool này thay cho Grep khi cần
biết vì sao giá hay phòng trống không lên trang: nó đọc cả nhật ký đã nén và nối
các dòng của cùng một lần đồng bộ, việc Grep không làm được.
Tham số: ma_khach_san (dạng KS-0123), so_ngay (mặc định 3, tối đa 30).
```

Mô tả mới nói tool trả về gì, khi nào nên dùng thay cho Grep và vì sao nó làm tốt hơn. Sau khi sửa, Claude gọi `phan_tich_nhat_ky` ngay ở lần hỏi đầu.

**Sơ đồ: Mô tả chỉ một câu thì Claude quay về Grep, còn mô tả rõ thì Claude gọi phan_tich_nhat_ky ngay**

✗ _Mô tả: "Phân tích nhật ký đồng bộ."_
1. Dev hỏi vì sao giá phòng khách sạn **Hòn Tre** không lên trang đặt phòng
   ↓ _Claude không biết tool này làm được gì hơn Grep_
2. **Grep "error"** trong thư mục nhật ký, đọc từng dòng
3. **Bỏ sót** Claude thường không tìm ra nguyên nhân

✓ _Mô tả nói tool trả gì, khi nào dùng thay Grep_
1. Cùng câu hỏi về khách sạn **Hòn Tre**
   ↓ _mô tả nói tool đọc được nhật ký nén, nối dòng của cùng một lần đồng bộ_
2. Gọi **phan_tich_nhat_ky** với ma_khach_san và so_ngay
3. **Lần hỏi đầu** lỗi nhóm theo trang đặt phòng, kèm lần hỏng gần nhất

> **Bẫy đề**
>
> Agent có các tool MCP chuyên dụng (refactor, phân tích phụ thuộc, chẩn đoán database) chạy tốt, nhưng vẫn dùng Write, sed, Grep hay psql qua Bash, vì mỗi tool MCP chỉ có mô tả chưa tới mười chữ. Cách nào giúp agent dùng tool MCP? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gỡ Write, Grep hay chặn Bash để agent buộc phải dùng tool MCP** (_remove the built-in tools_). Nghe dứt khoát vì agent không còn đường khác. Nhưng agent vẫn cần các tool đó cho việc khác, như chạy migration và test bằng Bash.
> - **Thêm bộ phân loại request, hay luật điều hướng trong system prompt** (_a request classifier or routing rules_). Nghe chắc vì có luật rõ ràng. Có điều Claude chọn tool dựa vào mô tả của tool, và mô tả vẫn chỉ có một câu, nên Claude vẫn không biết tool MCP làm được gì hơn.
> - **Tách tool thành nhiều tool nhỏ hơn, hay thêm một skill chỉ liệt kê tên tool** (_split into smaller tools, or a skill listing tool names_). Nghe như làm tool rõ việc hơn. Ngặt nỗi tool nhỏ hơn mà mô tả vẫn sơ sài thì Claude vẫn không có căn cứ để chọn, và một danh sách tên không nói tool trả gì.
>
> **Chọn:** viết lại mô tả tool MCP: tool làm gì, nhận tham số gì, trả về gì, và khi nào nó tốt hơn tool có sẵn. Chờ agent tự quen dần, hay chấp nhận vì sed dễ đoán hơn, đều không sửa gì.

## Dùng MCP resources để Claude biết có dữ liệu gì

Đội nối thêm một server cho database PostgreSQL và một server cho wiki nội bộ. Khi dev hỏi "đổi cách tính giá cuối tuần trong HOTEL-517 thì ảnh hưởng tới những bảng nào?", Claude mất khoảng 10 lời gọi tool, mà phần lớn chỉ để biết dữ liệu nằm ở đâu (**exploratory tool calls**). Nó liệt kê database, liệt kê bảng, xem từng bảng có cột gì, tìm trong Jira rồi lại quay sang wiki.

Muốn bớt chuyện dò này, cần biết MCP server có hai cách đưa dữ liệu cho Claude. Tool (**MCP tools**) là hành động Claude gọi để làm việc, và có thể có tác dụng phụ như ghi vào database. Resource (**MCP resources**) là nội dung chỉ để đọc, mỗi resource có một URI riêng. Server dùng resource để đưa dữ liệu vào context cho Claude, chẳng hạn một schema, một cây tài liệu hay một danh sách tóm tắt. Server liệt kê resource qua `resources/list` và trả nội dung qua `resources/read`.

Đội cấu hình để mỗi server cung cấp thêm một resource là danh mục nội dung (**content catalog**), tức bản tóm tắt cho biết server đó có những gì. Server database có schema của 120 bảng, gồm tên bảng, các cột chính và quan hệ giữa các bảng. Server Jira có bản tóm tắt các ticket đang mở, xếp theo epic, còn server wiki có cây mục lục tài liệu. Claude đọc các danh mục này trước, biết ngay bảng `gia_phong_theo_ngay` và `quy_tac_cuoi_tuan` là chỗ cần xem, rồi mới gọi tool truy vấn có mục tiêu. Số lời gọi để dò giảm hẳn.

**Sơ đồ: Đọc danh mục trước thì Claude biết ngay hai bảng cần xem, rồi mới truy vấn**
Bên tham gia: Database, Wiki, Jira, Claude

1. resource ticket mở
2. có HOTEL-517
3. resource mục lục
4. trang thiết kế giá cuối tuần
5. resource schema 120 bảng
6. gia_phong_theo_ngay, quy_tac_cuoi_tuan
7. tool truy vấn có mục tiêu
8. các bảng bị ảnh hưởng

Trong Claude Code, khi bạn gõ `@`, danh sách gợi ý hiện cả file lẫn resource của mọi server đã kết nối. Bạn nhắc tới một resource theo dạng `@server:giao_thuc://duong/dan`, và Claude Code sẽ lấy nội dung resource đó về, đính kèm vào prompt. Khi server có resource, Claude Code cũng cấp tool để Claude tự liệt kê và đọc resource.

> **Bẫy đề**
>
> Agent kết nối ba server: issue tracker, wiki và database. Với câu hỏi cần dữ liệu từ cả ba hệ thống, agent tốn rất nhiều lời gọi tool chỉ để dò xem dữ liệu nằm đâu. Nên làm gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gộp ba server thành một server thống nhất** (_merge into one unified server_). Nghe như một server thì tham chiếu chéo dễ hơn. Nhưng agent vẫn không biết trong đó có gì, và vẫn phải dò như cũ.
> - **Thêm bộ điều phối chuyển câu hỏi tới một server theo từ khoá** (_keyword-based routing_). Nghe gọn vì mỗi câu chỉ tới một chỗ. Có điều câu hỏi cần dữ liệu từ cả ba hệ thống, nên chuyển tới một server thì thiếu dữ liệu của hai server còn lại.
> - **Thêm tool `prepare_investigation` cho mỗi server** (_a natural-language summary tool_). Nghe tiện vì có hẳn tool tóm tắt. Ngặt nỗi agent vẫn phải gọi tool này một lần cho mỗi server, và nội dung tóm tắt còn tuỳ mỗi server hiểu câu hỏi ra sao.
>
> **Chọn:** đưa danh mục nội dung của mỗi server ra dưới dạng MCP resource: tóm tắt issue, cây tài liệu, schema database. Nếu đề hỏi khi nào dùng resource thay cho tool, hãy chọn resource khi bạn muốn đưa danh mục nội dung hay tài liệu cho agent đọc làm context mà agent không phải gọi tool để dò. Việc có tác dụng phụ, như ghi vào database, hay chạy lệnh trên máy cục bộ, thì vẫn làm bằng tool. Còn mẫu hội thoại dựng sẵn là MCP prompts, một loại thứ ba, không phải resource.

> **Ý chính**
>
> Hệ thống phổ biến như Jira hay GitHub thì dùng server có sẵn, quy trình riêng mới tự viết. Server dùng chung để trong `.mcp.json`, token ghi bằng tên biến như `${GITHUB_TOKEN}`, còn server cá nhân để trong `~/.claude.json`. Tool của mọi server dùng được cùng lúc, nhưng Claude chỉ chịu dùng khi mô tả nói rõ tool hơn Grep ở chỗ nào. Muốn Claude biết có dữ liệu gì mà không phải dò, hãy cho mỗi server đưa danh mục nội dung ra thành resource.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 2.4](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Connect Claude Code to tools via MCP (Claude Code)](https://code.claude.com/docs/en/mcp)
3. [MCP specification, Resources (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
