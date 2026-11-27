---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/8-4-cau-hinh-toan-to-chuc
ngay_tai: 2026-11-27
tieu_de: Cấu hình coding agent cho cả tổ chức - managed settings, MCP allowlist, telemetry, gateway và chuẩn chia sẻ skill, plugin
---

Domain 8: Agent Fleet Operations for Software Delivery · Task 8.4

# Cấu hình coding agent cho cả tổ chức - managed settings, MCP allowlist, telemetry, gateway và chuẩn chia sẻ skill, plugin

Đưa policy tới mọi session Claude Code, giới hạn MCP server và đích telemetry, định tuyến qua gateway, đặt chuẩn an toàn và chất lượng cho plugin dùng chung.

- 21 phút đọc
- Đối chiếu docs 22/11/2026
- 14 nguồn

## Đọc xong bạn nắm được

- Biết managed settings tới máy qua những nguồn nào, nguồn nào được dùng, và vì sao một key ở nguồn cao hơn làm máy bỏ qua cả file policy ở nguồn thấp
- Nhận ra session nào không nhận server-managed settings, như session qua gateway hay CI dùng API key của Console
- Viết MCP allowlist chặn được thật, và khoá đích telemetry để mỗi nhóm có số liệu riêng
- Định tuyến Claude Code qua gateway với credential riêng của từng developer và giới hạn chi tiêu
- Đặt chuẩn chất lượng và an toàn cho skill, MCP server và plugin trước khi phát cho cả tổ chức

Tên task trong đề là **Organization-Wide Coding Agent Configuration**. Nó gồm việc cấu hình coding agent cho cả một tổ chức (**enterprise configuration**). Các ý bên trong là managed settings và policy, MCP allowlist, telemetry, định tuyến qua gateway, và quản trị việc chia sẻ prompt, skill và MCP server theo một chuẩn chất lượng và an toàn. Mỗi ý có chữ tiếng Anh của đề ở mục tương ứng bên dưới.

Khi vài trăm kỹ sư cùng dùng coding agent, tổ chức cần nắm chắc mấy chuyện. Policy của công ty có thật sự áp lên mọi session không. Request gọi model đi qua đâu và ai trả tiền. Số liệu sử dụng được gửi về đâu. Và skill hay MCP server nào được phát cho cả công ty dùng.

Bài này đi vào những chỗ dễ sai khi làm việc đó. Khi cấu hình tới máy từ nhiều nguồn thì nguồn nào được dùng. Loại session nào không nhận policy. Viết allowlist thế nào mới chặn được thật. Và skill hay plugin phải đạt chuẩn gì mới được chia sẻ.

Phần nền đã có ở bài khác. Năm nơi đặt cấu hình, luật allow, ask, deny và ba cách phát managed settings nằm ở bài 7.1 của CCAR-P. Chuyện gateway phải chuyển tiếp nguyên header và body nằm ở bài 2.3.

**Sơ đồ: Bốn nguồn managed gộp ở Claude Code để khoá bốn thứ, nhưng server-managed không tới mọi session**
_Bản đồ bài. Bốn nguồn managed, xếp từ ưu tiên cao xuống thấp, mỗi nguồn có mũi tên tới Claude Code trên máy. Một là server-managed, từ admin console hoặc Claude apps gateway, chỉ tới session claude.ai, không tới session qua gateway hay dùng key Console (nét đứt). Hai là MDM, plist trên macOS hay HKLM trên Windows, tới mọi session. Ba là managed-settings.json trong thư mục hệ thống, tới mọi session. Bốn là HKCU trên Windows, người dùng tự ghi được nên chỉ nên đặt mặc định. Claude Code gộp theo first-wins, mặc định, chỉ dùng nguồn cao nhất có policy key, hoặc merge, phải bật, gộp danh sách từ mọi nguồn và key khoá lấy giá trị chặt nhất, rồi policy đã gộp khoá bốn thứ: allowlist MCP server, đích telemetry OTEL, gateway cùng apiKeyHelper, và marketplace plugin. Mũi tên nghĩa là policy đi tới._

- **NGUỒN MANAGED**
- 1. **Server-managed**: admin console, apps gateway
- 2. **MDM**: plist macOS, HKLM Windows
- 3. **managed-settings.json**: trong thư mục hệ thống
- **HKCU trên Windows**
- 4. registry của người dùng
- chỉ tới session claude.ai,
- không qua gateway
- tới mọi session
- tới mọi session
- người dùng tự ghi được,
- chỉ nên đặt mặc định
- **Claude Code**: trên máy
- **first-wins, mặc định**: chỉ dùng nguồn cao nhất
- có policy key
- **merge, phải bật**: danh sách gộp mọi nguồn,
- key khoá lấy chặt nhất
- **MCP server**: khoá allowlist
- **Telemetry**: khoá đích OTEL
- **Gateway**: khoá apiKeyHelper
- **Plugin**: khoá marketplace
- Mũi tên: policy đi tới; nét đứt: chỉ tới một số session. Số 1–4: ưu tiên, 1 cao nhất.

## Ví dụ xuyên suốt: công ty chứng khoán với 320 kỹ sư

Một công ty chứng khoán vận hành app giao dịch cho khoảng 900.000 tài khoản. 320 kỹ sư trong 14 nhóm dùng Claude Code, và công ty có gói Enterprise. Một nhóm nền tảng, tức nhóm lo công cụ chung cho kỹ sư, phụ trách cấu hình Claude Code cho cả công ty. Công ty cũng có vài MCP server nội bộ, như server của repo code và của hệ ticket.

280 kỹ sư làm trên laptop Mac, quản lý bằng MDM (công cụ quản lý thiết bị), và đăng nhập bằng tài khoản claude.ai của công ty.

40 kỹ sư của nhóm khớp lệnh làm trên máy trạm Linux trong mạng giao dịch. Các máy này được quản lý bằng công cụ cấu hình (configuration management) thay vì MDM. Theo yêu cầu của phòng tuân thủ, nhóm này chỉ được gọi model qua Amazon Bedrock trong tài khoản AWS của công ty, và mọi request đều đi qua một gateway nội bộ. Gateway là một proxy đứng giữa Claude Code và nhà cung cấp model.

Còn các job CI có dùng Claude Code thì chạy trên runner riêng, xác thực bằng một API key tạo trong Claude Console. Console là trang quản lý API dành cho developer, tách khỏi tổ chức Enterprise trên claude.ai.

## Thứ tự triển khai cho cả tổ chức

Việc triển khai cho cả tổ chức thường đi theo năm bước. Đầu tiên là chọn provider, tức gói Team hay Enterprise, Console, hay một nền tảng cloud. Sau đó chọn cách đưa policy tới máy, chọn những gì cần ép, và dựng chỗ theo dõi mức dùng. Cuối cùng là rà lại cách dữ liệu được lưu, như ZDR (Anthropic không lưu dữ liệu sau khi xử lý) hay cấu hình cho HIPAA.

Chọn provider nào cũng quyết định luôn bạn có những tính năng gì. Cloud session, cloud scheduled task và Code Review chỉ có khi đăng nhập bằng tài khoản claude.ai. Dùng key Console hay credential của nền tảng cloud thì không có các tính năng này.

## Managed settings: nguồn nào được dùng

Managed settings và policy (**managed settings and policies**) là cấu hình tổ chức áp lên Claude Code, được ưu tiên hơn mọi cấu hình của developer. Chúng tới máy qua bốn nguồn, xếp từ ưu tiên cao xuống thấp.

1. Server-managed, đặt trong admin console của claude.ai, hoặc do Claude apps gateway phát (gateway này nói ở phần sau).
2. Policy của MDM, là plist trên macOS hay registry HKLM trên Windows.
3. File `managed-settings.json` và thư mục `managed-settings.d/` trong thư mục hệ thống.
4. Registry HKCU trên Windows.

Người dùng tự ghi được vào HKCU, nên chỉ nên dùng nguồn này để đặt giá trị mặc định cho tiện, đừng dùng nó để ép policy. Hai nguồn MDM và file `managed-settings.json` nằm ngay trên máy và cần quyền admin mới ghi được. Bài gọi chung chúng là nguồn trên máy.

Chỗ dễ sai nhất là khi máy nhận policy từ nhiều nguồn cùng lúc thì Claude Code gộp chúng ra sao. Mặc định, tức `managedSourcesBehavior: "first-wins"`, Claude Code chỉ dùng nguồn cao nhất có ít nhất một policy key, và bỏ qua toàn bộ các nguồn bên dưới mà không báo gì. Policy key là bất kỳ key chính sách nào, trừ các key chỉ dùng để điều khiển cách gộp như `managedSourcesBehavior`.

Có vài key là ngoại lệ, được đọc từ cả ba nguồn do admin kiểm soát, tức mọi nguồn trừ HKCU. Đó là các key khoá (lock) của sandbox, tức key admin bật lên thì người dùng không tắt được, cùng `allowManagedMcpServersOnly`, `deniedMcpServers` và `env` (gộp theo từng biến).

Nhóm nền tảng dùng MDM phát cho các laptop một file policy có 9 key về plugin và quyền. Trong đó có danh sách marketplace được phép (marketplace là nơi liệt kê các plugin để cài), danh sách plugin bắt buộc và `permissions.disableBypassPermissionsMode`. Ba tuần sau, một admin claude.ai đặt `availableModels` trong admin console để giới hạn model. Với 280 laptop đăng nhập claude.ai, server-managed giờ có một policy key nên được dùng, và cả file MDM bị bỏ qua.

**Sơ đồ: Một key ở server-managed làm 280 laptop bỏ qua cả file policy MDM**

✗ _Mặc định first-wins_
1. Server-managed chỉ có một key là **availableModels**
   ↓ _nguồn cao nhất có policy key được dùng, các nguồn dưới bị bỏ qua_
2. **0 trong 9** key trong file MDM còn hiệu lực trên 280 laptop

✓ _Bật merge ở nguồn cao nhất, tức server-managed_
1. Server-managed giữ availableModels, MDM giữ phần plugin và quyền
   ↓ _danh sách được gộp, key khoá lấy giá trị chặt nhất_
2. **9 trong 9** key của file MDM áp lại trên cả 280 laptop

Nhóm nền tảng chỉ phát hiện ra chuyện này nhờ telemetry, tức số liệu Claude Code gửi về hệ thống theo dõi của công ty (nói kỹ ở mục telemetry). Mỗi lần session khởi động, và mỗi khi policy đổi giữa chừng, Claude Code gửi event `claude_code.managed_settings_resolved`, liệt kê mọi nguồn managed có policy key cùng cách gộp đang dùng (`source_behavior`). Trên dashboard, nhóm nền tảng thấy 280 laptop có cả server-managed lẫn MDM mà vẫn ở `first-wins`, nghĩa là file MDM đang bị bỏ qua. Trên từng máy, `/status` cũng có dòng `Skipped sources` liệt kê nguồn bị bỏ qua.

Có hai cách sửa. Một là dồn mọi key về một nguồn. Hai là bật `"merge"`. Claude Code chỉ đọc `managedSourcesBehavior` từ nguồn cao nhất có key này hoặc có policy key, nên bạn phải đặt nó ở nguồn cao nhất. Với laptop thì đó là server-managed. Với những máy không nhận server-managed, bạn đặt thêm key này trong file MDM.

Ở chế độ merge, mỗi loại key được gộp một kiểu.

- Danh sách như `permissions.allow` được gộp từ mọi nguồn.
- Key khoá như `allowManagedHooksOnly` lấy giá trị chặt nhất.
- Allowlist như `availableModels`, `allowedMcpServers` hay `strictKnownMarketplaces` lấy nguyên từ nguồn cao nhất có đặt, không gộp.

Chỉ nên bật merge khi mọi nguồn bên dưới đều do admin kiểm soát, vì danh sách được gộp từ mọi nguồn. Trên từng máy, dòng `Setting sources` trong `/status` cho biết nguồn nào đang được dùng. Các hành vi trong mục này cần Claude Code đủ mới (chế độ merge từ v2.1.242, event `managed_settings_resolved` từ v2.1.274), nên hãy kiểm version trên máy trước.

Bạn cũng cần biết thêm hai đặc điểm của managed settings.

- **Ghi sai thì Claude Code chọn phía chặt (fail closed).** Với key chỉ có tác dụng khi bật, như `allowManagedPermissionRulesOnly: true`, nếu giá trị bị ghi sai thì Claude Code coi như key đang bật cho tới khi bạn sửa. Còn `allowedMcpServers` hay `strictKnownMarketplaces` mà ghi sai thì bị coi là allowlist rỗng, tức không cho gì cả.
- **Server-managed là kiểm soát phía client, không phải ranh giới bảo mật.** Người dùng sửa file cache trên máy thì bản sửa vẫn có hiệu lực cho tới lần Claude Code tải policy tiếp theo. Nếu không gọi được API, Claude Code dùng bản cache, hoặc chạy luôn mà không có policy nào. Đặt `forceRemoteSettingsRefresh: true` thì CLI phải tải policy xong mới chạy, và thoát luôn nếu tải không được. Muốn chắc hơn thì dùng nguồn trên máy.

## Session nào không nhận policy

Claude Code chỉ tải server-managed settings khi session gọi thẳng tới `api.anthropic.com` bằng một credential được hỗ trợ, như tài khoản claude.ai của tổ chức, và chỉ nhận policy của đúng tổ chức sở hữu credential đó. Vì vậy ba nhóm máy của công ty chứng khoán phải nhận policy theo ba đường khác nhau, và có hai loại session không nhận được server-managed.

**Sơ đồ: Chỉ 280 laptop nhận server-managed, máy trạm khớp lệnh và runner CI cần file managed trên máy**
- có
- không
- Đặt ANTHROPIC_BASE_URLhay CLAUDE_CODE_USE_*?
- 40 máy trạmkhớp lệnhcần file manageddo công cụ cấu hình
- CredentialEnterpriseclaude.ai?
- 280 laptopnhận server-managedkèm MDM khi merge
- Runner CI dùngkey Consolecần file managedtrong image

Loại thứ nhất là session qua gateway. Khi máy đặt `ANTHROPIC_BASE_URL` khác giá trị mặc định, hoặc đặt một biến `CLAUDE_CODE_USE_*` như `CLAUDE_CODE_USE_BEDROCK`, Claude Code không tải server-managed nữa. Một developer chỉ cần tự export `ANTHROPIC_BASE_URL` là session của họ không nhận server-managed. Lúc đầu nhóm khớp lệnh cũng tự export địa chỉ gateway trong shell, nên 40 máy này chạy mà không có policy nào. Kỹ sư vẫn bật được `bypassPermissions`, chế độ cho Claude làm mọi việc mà không hỏi quyền. Bạn cũng không thể đặt địa chỉ gateway trong khối `env` của server-managed để ép, vì khối `env` cũng chỉ tới máy qua lần tải server-managed, mà lần tải đó đã bị bỏ qua.

Loại thứ hai là CI dùng API key của Console. Key tạo trong Console thuộc về một tổ chức trên Console, tách riêng với tổ chức Enterprise trên claude.ai, nên policy đặt trong admin console không tới được runner. Có hai cách sửa. Một là đặt sẵn file managed trong image của runner. Hai là cho CI dùng token OAuth của tổ chức Enterprise, tạo bằng lệnh `claude setup-token`.

Với cả hai loại, muốn ép policy mà không phụ thuộc vào shell của từng người, bạn phát nó qua nguồn trên máy.

> **Bẫy đề**
>
> Phòng an toàn thông tin muốn chắc chắn không ai trong nhóm khớp lệnh bật được chế độ bỏ qua mọi lời hỏi quyền. Có ba cách nghe hợp lý nhưng sai.
>
> - **Đặt `permissions.disableBypassPermissionsMode` trong admin console** (_rely on server-managed settings for everyone_). Cách này hấp dẫn vì chỉ cần đặt một chỗ. Nhưng session qua gateway không tải server-managed, nên đúng 40 máy cần khoá nhất lại không nhận.
> - **Dặn kỹ sư đừng export biến môi trường nào lạ** (_instruct developers not to override the base URL_). Lời dặn không ép được ai, huống chi địa chỉ gateway lại chính là thứ nhóm này buộc phải đặt.
> - **Commit khoá vào `.claude/settings.json` của repo khớp lệnh** (_enforce it in project settings_). Project settings không phải managed, chỉ áp khi Claude Code chạy trong repo đó, nên không khoá được session mở ở thư mục khác.
>
> **Chọn:** dùng công cụ cấu hình đặt file `/etc/claude-code/managed-settings.json` lên 40 máy trạm. File này chứa luôn địa chỉ gateway (`ANTHROPIC_BASE_URL`), lệnh lấy key cho từng người (`apiKeyHelper`, giải thích ở mục sau) và `permissions.disableBypassPermissionsMode`. Sau đó kiểm lại bằng `/status` và event `managed_settings_resolved`.

## Định tuyến qua gateway

Mỗi developer giữ một credential do gateway cấp, nhờ đó gateway biết request nào của ai. Còn credential của tổ chức với nhà cung cấp model thì chỉ gateway giữ. Định tuyến qua gateway như vậy (**gateway routing**) gom việc xác thực, theo dõi, ngân sách và audit log về một chỗ.

Nếu công ty dùng một gateway có sẵn của riêng mình, như gateway nội bộ của nhóm khớp lệnh, file managed trên máy cần hai thứ. Thứ nhất là `ANTHROPIC_BASE_URL` trỏ tới gateway. Phát bằng managed thì không còn phụ thuộc vào shell của từng người. Thứ hai là `apiKeyHelper`, một lệnh mà Claude Code chạy để lấy key từ secret store bằng danh tính của developer đang dùng máy, nhờ vậy mỗi người có key riêng. Khi đã dùng credential của gateway thì đừng đặt thêm `forceLoginMethod` hay `forceLoginOrgUUID`, vì hai key này chặn `apiKeyHelper` và các biến API key ngay lúc khởi động.

Một lựa chọn khác là Claude apps gateway, gateway có sẵn trong chính binary `claude` mà công ty tự chạy trên server của mình. Với gateway này, developer đăng nhập bằng SSO của công ty qua `/login`. Gateway giới hạn model và phát managed settings theo nhóm người dùng trong IdP (hệ quản lý danh tính như Okta hay Entra ID). Policy này có cùng mức ưu tiên cao nhất như server-managed, nên dù session đi qua Bedrock vẫn nhận được policy từ xa.

Claude apps gateway cũng đặt được giới hạn chi tiêu theo ngày, tuần hay tháng cho từng người, từng nhóm hay cả tổ chức. Vượt mức thì request bị trả `429` kèm `billing_error`. Mức đặt cho nhóm được áp riêng cho từng thành viên chứ không phải một quỹ cả nhóm xài chung. Đặt 100 USD một tháng cho một nhóm nghĩa là mỗi người trong nhóm được 100 USD.

Gateway này không cấp token cho máy chạy tự động (service token). Lần đăng nhập nào cũng cần một người bấm duyệt trên trình duyệt, nên job CI vẫn phải cấu hình gọi thẳng tới nhà cung cấp model. Trên session qua gateway này, WebSearch bị tắt và Remote Control không dùng được.

## Giới hạn MCP server được dùng

Mặc định, ai chạy Claude Code cũng nối được bất kỳ MCP server nào. MCP server có hai loại. Remote server chạy ở xa và được gọi qua URL. Stdio server là một lệnh chạy ngay trên máy. Có bốn mẫu cấu hình hay dùng, ba mẫu để siết lại và một mẫu để cấp thêm server.

| Cách | Tác dụng | Cấu hình |
| --- | --- | --- |
| Bộ cố định | Chỉ các server tổ chức liệt kê mới được chạy | File `managed-mcp.json` trong thư mục hệ thống, phát qua MDM hay công cụ cấu hình, không phát được qua server-managed |
| Cấp thêm | Mọi người nhận các remote server tổ chức đưa, vẫn giữ server của mình | `managedMcpServers` |
| Danh mục duyệt sẵn | Người dùng tự thêm server trong danh sách, server ngoài danh sách bị chặn | `allowedMcpServers` cùng `allowManagedMcpServersOnly: true` |
| Chỉ chặn server xấu | Chặn đúng các server trong danh sách, mọi server khác vẫn dùng được | `deniedMcpServers` |

Danh mục duyệt sẵn, tức MCP allowlist (**MCP allowlists**), hợp khi bạn muốn người dùng tự chọn server trong một danh sách đã duyệt. Viết allowlist có ba chỗ dễ sai.

- **Thiếu key khoá thì người dùng tự nới allowlist được.** Nếu không đặt `allowManagedMcpServersOnly`, Claude Code gộp allowlist từ mọi nơi, kể cả `~/.claude/settings.json` của người dùng, nên ai cũng tự thêm được server vào danh sách. Denylist thì luôn được gộp từ mọi nơi. `allowManagedPermissionRulesOnly` là một key khoá khác, chỉ khoá luật quyền chứ không khoá allowlist MCP.
- **`serverName` không phải kiểm soát bảo mật.** Tên là nhãn người dùng tự đặt khi chạy `claude mcp add`, nên ai cũng đặt được tên `github` cho một server bất kỳ. Allowlist phải so theo `serverUrl` với remote server (được dùng ký tự đại diện `*`), và theo `serverCommand` với stdio server (phải khớp đúng từng đối số). `serverCommand` không so biến môi trường, nên nếu tổ chức muốn tự đặt cả `env` của server thì phải khai báo server đó trong `managed-mcp.json`.
- **Không đặt khác với để rỗng.** `allowedMcpServers` không đặt thì mọi server đều được phép. Đặt `[]` thì không server nào được, trừ các server tổ chức tự cấp.

Công ty chứng khoán viết allowlist theo URL của các MCP server nội bộ, như server của repo code và của hệ ticket, cùng lệnh chính xác của hai stdio server. Họ đặt allowlist này kèm `allowManagedMcpServersOnly: true` ở hai nơi, server-managed cho laptop và file managed trên máy trạm của nhóm khớp lệnh.

## Telemetry cho cả tổ chức

Claude Code gửi telemetry (**telemetry**), tức số liệu sử dụng như token, chi phí và event, theo chuẩn OpenTelemetry tới một collector, là hệ thống công ty dựng để nhận số liệu. Các biến OpenTelemetry chỉ bật được telemetry khi đặt trong `env` của managed settings, trong user settings, hoặc trong shell của từng người. Trong `.claude/settings.json` của repo, Claude Code bỏ qua chúng, để repo không tự bật telemetry hay đổi đích gửi. Repo chỉ tắt được một loại tín hiệu bằng cách đặt biến chọn exporter thành `none`, trừ khi managed settings đã đặt biến đó.

Khi managed settings đặt `OTEL_EXPORTER_OTLP_ENDPOINT`, Claude Code bỏ các endpoint riêng cho từng loại dữ liệu (metrics, logs, traces) mà developer tự đặt, nên không ai đẩy được một loại sang collector khác. Riêng biến chọn exporter (`OTEL_METRICS_EXPORTER`, `OTEL_LOGS_EXPORTER`) thì vẫn theo thứ tự ưu tiên bình thường giữa các nơi đặt, nên nếu managed settings bỏ trống thì developer tự đặt được. Muốn khoá thì bạn đặt luôn chúng trong managed settings.

Công ty chứng khoán thêm ba biến.

- `OTEL_RESOURCE_ATTRIBUTES="team.id=khop-lenh,cost_center=..."` trong file managed của từng nhóm, để chi phí và mức dùng tách được theo nhóm.
- `OTEL_LOG_TOOL_DETAILS=1`, để event ghi cả tên MCP server, tool và plugin. Nếu không bật biến này, tên của plugin bên thứ ba bị ẩn đi.
- `OTEL_LOG_MANAGED_SETTINGS=1`, để event `managed_settings_resolved` kèm tên key và cấu trúc của policy (hầu hết giá trị chuỗi bị che) cùng mã băm SHA-256 của nó. Nhờ mã băm, nhóm nền tảng so được session nào vẫn đang chạy policy cũ. Muốn biết theo từng máy thì đặt thêm `OTEL_RESOURCE_INCLUDE_HOST=1`, vì tên máy mặc định không được gửi.

Nếu dùng Claude apps gateway thì cần nhớ thêm một chuyện. Session qua gateway này gửi telemetry tới chính gateway, nên bạn phải thêm collector của công ty vào `telemetry.forward_to` của gateway, hoặc cho policy trỏ thẳng tới collector. Nếu không, số liệu sẽ dừng ở gateway.

## Chuẩn để chia sẻ skill, MCP server và plugin

Muốn quản trị việc chia sẻ trong cả tổ chức (**governance**), bạn cần một chuẩn chất lượng và an toàn (**quality and safety bar**). Trước khi phát cho mọi người, một skill hay plugin phải chứng minh được nó thật sự có ích, và phải có người đã đọc xem nó sẽ chạy những gì trên máy.

Công ty chứng khoán đóng gói skill, prompt, hook và cấu hình MCP server dùng chung thành plugin, đặt trong một marketplace nội bộ, tức một repo liệt kê plugin do công ty tự dựng. Họ phát marketplace này qua managed settings với các key sau.

- `extraKnownMarketplaces` đăng ký marketplace trên mọi máy.
- `enabledPlugins` bật bắt buộc những plugin cần có. Đặt `false` cho một plugin thì chặn plugin đó dù nó nằm trong marketplace được phép.
- `strictKnownMarketplaces` chỉ cho cài từ các marketplace được phép.
- `disableSideloadFlags` chặn các cách nạp plugin từ ngoài marketplace, như cờ `--plugin-dir`. Không có key này, người dùng vẫn nạp được plugin từ thư mục trên máy.
- `strictPluginOnlyCustomization` chặn skill, agent, hook và MCP server tới từ `~/.claude` hay từ repo. Dùng cùng hai key trên thì bốn loại này chỉ còn tới được từ plugin đã duyệt.

Về chuẩn an toàn, hook, monitor (lệnh nền mà plugin tự khởi động), MCP server và LSP server (server phân tích code) của plugin đều chạy ngoài sandbox với toàn quyền của người dùng, vì luật quyền chỉ áp lên các tool call do Claude gọi. Còn skill và command thì được nạp vào context như chỉ dẫn cho Claude, nên một câu viết ẩu hay có ý xấu trong đó cũng lái được Claude. Người review đọc `hooks/hooks.json`, `.mcp.json` và mọi file trong `bin/`, và lệnh `claude plugin details` in ra danh sách thành phần của plugin. Vì auto-update có thể thay file đã được review, mỗi bản qua review nên mang một `version` mới. Nếu bạn sửa plugin mà giữ nguyên `version`, máy người dùng vẫn chạy bản cũ trong cache.

Về chuẩn chất lượng, `claude plugin eval` chạy plugin trên các ca thử (case), mỗi ca 3 lần trong một session mới chỉ nạp plugin đó, rồi chạy lại y như vậy khi không có plugin. Lấy điểm có plugin trừ điểm không có plugin, ta được Δ, đó mới là phần plugin thật sự đóng góp. Ví dụ, nhóm ký quỹ, một trong 14 nhóm, xin đưa lên marketplace một plugin kiểm tra lệnh ký quỹ. Với 12 ca, mỗi ca 3 lần, ca nào cũng đạt từ ngưỡng 0,8 trở lên, điểm trung bình là 0,92 và lệnh trả exit code 0. Nhưng chạy cùng 12 ca khi không có plugin vẫn được 0,90, tức Δ chỉ 0,02.

**Sơ đồ: Qua ngưỡng chưa đủ, Δ chỉ 0,02 thì plugin chưa chứng minh được giá trị**

✗ _Chỉ xét ngưỡng 0,8_
1. Có plugin, 12 ca, mỗi ca 3 lần, ca nào cũng đạt từ 0,8
   ↓ _exit code 0, plugin lên kênh chung_
2. **0,92** điểm trung bình có plugin

✓ _Xét thêm Δ so với khi không có plugin_
1. Không có plugin, cùng 12 ca, điểm **0,90**
   ↓ _job CI tự đọc Δ trong file JSON, vì Δ không đổi exit code_
2. **0,02** Δ = 0,92 − 0,90, plugin chưa lên kênh chung, trả nhóm viết

Δ thấp như vậy nghĩa là plugin chưa chứng minh được giá trị. Có thể 12 ca thử quá dễ, không có plugin thì Claude vẫn tự làm đúng, hoặc Claude không chọn dùng skill của plugin. Nhóm viết phải kiểm cả hai khả năng. `claude plugin eval` trả exit code 1 khi có ca nào dưới ngưỡng `--threshold` (ngưỡng xét riêng từng ca) hoặc khi chạy bị lỗi. Δ chỉ được báo ra, không bao giờ làm job thất bại, nên bước kiểm trước khi phát hành trong CI phải tự đọc Δ trong file JSON kết quả. Hãy cố định cả model chạy lẫn model chấm (judge) để điểm so được qua thời gian, và đặt `--max-cost-usd`, vì mỗi lần chạy là một lần gọi model thật.

Plugin nào qua cả hai chuẩn thì lên kênh `latest` cho nhóm dùng sớm trước, rồi mới sang `stable`. Mỗi kênh thực chất là một marketplace riêng, trỏ tới một ref (branch hay tag) khác nhau của cùng plugin. Muốn nhóm nào dùng kênh nào, bạn phát marketplace tương ứng cho nhóm đó qua file managed riêng, qua policy theo nhóm của gateway, hoặc qua cấu hình nhóm trong admin console. Sau khi phát, event `plugin_installed` và `plugin_loaded` cho biết session nào đã cài và nạp gì.

> **Trong đề chọn gì**
>
> Gặp câu hỏi về cấu hình cho cả tổ chức, hãy hỏi trước tiên policy có thật sự tới được session đó không. Session có đi qua gateway hay dùng key Console không, và nguồn managed nào đang được dùng. Sau đó mới xét tiếp allowlist so theo tên hay theo URL và lệnh, và plugin chia sẻ đã có Δ chưa, đã có người đọc xem nó chạy gì chưa.

> **Ý chính**
>
> Mặc định Claude Code chỉ dùng nguồn managed cao nhất có policy, nên một key ở nguồn cao hơn cũng làm cả các nguồn dưới bị bỏ qua. Session qua gateway và CI dùng key Console không nhận server-managed, nên phải ép bằng MDM hoặc file managed trên máy. MCP allowlist cần `allowManagedMcpServersOnly` và phải so theo URL hoặc lệnh, không theo tên. Biến OpenTelemetry chỉ có hiệu lực từ managed, user settings hoặc shell. Plugin chia sẻ phải qua review những gì nó chạy và qua eval có Δ so với khi không có plugin.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 8](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Set up Claude Code for your organization (Claude Code Docs)](https://code.claude.com/docs/en/admin-setup)
3. [Deploy managed settings (Claude Code Docs)](https://code.claude.com/docs/en/managed-settings)
4. [Configure server-managed settings (Claude Code Docs)](https://code.claude.com/docs/en/server-managed-settings)
5. [Control MCP server access for your organization (Claude Code Docs)](https://code.claude.com/docs/en/managed-mcp)
6. [Monitoring (Claude Code Docs)](https://code.claude.com/docs/en/monitoring-usage)
7. [Run Claude Code through a gateway (Claude Code Docs)](https://code.claude.com/docs/en/gateways)
8. [Roll out an LLM gateway for your organization (Claude Code Docs)](https://code.claude.com/docs/en/llm-gateway-rollout)
9. [Claude apps gateway (Claude Code Docs)](https://code.claude.com/docs/en/claude-apps-gateway)
10. [Claude apps gateway spend limits (Claude Code Docs)](https://code.claude.com/docs/en/claude-apps-gateway-spend-limits)
11. [Manage Claude Code plugins for your organization (Claude Code Docs)](https://code.claude.com/docs/en/plugins/org)
12. [Host and maintain a marketplace (Claude Code Docs)](https://code.claude.com/docs/en/plugins/host-marketplace)
13. [Plugin security and trust (Claude Code Docs)](https://code.claude.com/docs/en/plugins/security)
14. [Test plugins with evals (Claude Code Docs)](https://code.claude.com/docs/en/plugin-evals)
