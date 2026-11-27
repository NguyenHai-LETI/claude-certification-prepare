---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/7-3-dinh-danh-bi-mat-va-audit
ngay_tai: 2026-11-27
tieu_de: Danh tính, bí mật và audit ở quy mô lớn - danh tính agent, Workload Identity Federation, vault, quyền tối thiểu và audit log
---

Domain 7: Runtime Guardrails and Production Security · Task 7.3

# Danh tính, bí mật và audit ở quy mô lớn - danh tính agent, Workload Identity Federation, vault, quyền tối thiểu và audit log

Agent làm việc nhân danh ai, thay khoá API tĩnh bằng Workload Identity Federation, giữ bí mật ngoài sandbox, cấp quyền tool tối thiểu, ghi audit log.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 12 nguồn

## Đọc xong bạn nắm được

- Phân biệt danh tính của workload, của người dùng cuối và của chính agent, và chọn agent hành động nhân danh ai
- Thay khoá API tĩnh bằng Workload Identity Federation, viết federation rule đủ hẹp và chuyển đổi không gián đoạn
- Giữ credential trong vault, ngoài tầm với của model, và biết những đường bí mật vẫn lọt về sandbox
- Cấp quyền tool tối thiểu theo từng tool, từng agent và từng credential
- Thiết kế audit log trả lời được ai yêu cầu, agent nào làm, bằng quyền nào, ai duyệt

Một dịch vụ bình thường chỉ cần một danh tính. Agent thì cần ít nhất ba, gồm danh tính của workload (process đang chạy agent), của người dùng mà agent đang làm việc cho, và của chính agent. Nếu gộp cả ba vào một khoá API dùng chung, bạn sẽ khó trả lời ai đã yêu cầu việc này, agent được phép làm tới đâu, và khi có sự cố thì tra lại bằng log nào.

Những công cụ doanh nghiệp vẫn dùng cho dịch vụ thường vẫn áp được cho agent. Đó là hệ thống đăng nhập tập trung (IdP, identity provider), hệ thống cất giữ bí mật (secrets manager) và hệ thống gom log từ nhiều nguồn để phát hiện tấn công (SIEM). Chỉ cần áp chúng cho đủ cả ba danh tính.

Tên task trong đề là **Identity, Secrets, and Audit at Scale**. Nó gồm việc áp cách quản lý danh tính và bí mật của doanh nghiệp (**enterprise identity and secrets practice**) cho các hệ thống Claude chạy production. Các ý bên trong là danh tính của agent, Workload Identity Federation thay khoá API tĩnh, quản lý credential và bí mật, cấp quyền tool tối thiểu, và audit log cho các hành động liên quan tới bảo mật của agent. Mỗi ý có chữ tiếng Anh của đề ở mục tương ứng bên dưới.

Kiến thức nền về các loại khoá API, lỗi 401 (chưa xác thực), lỗi 403 (thiếu quyền) và cách xoay vòng khoá nằm ở bài 7.4 của CCDV-F. Lý do MCP server không được chuyển tiếp token của người dùng sang dịch vụ khác nằm ở bài 7.2.

**Sơ đồ: Ba chặng mang danh tính, bí mật chỉ gắn vào ở egress, ứng dụng và session cùng ghi audit log**
_Bản đồ bài: trong ứng dụng của bạn, người dùng cuối đăng nhập qua IdP rồi gửi yêu cầu tới backend. Backend là workload, qua WIF, gửi yêu cầu tới session của agent trên Managed Agents. Session mang agent_id và policy từng tool, gửi lệnh chạy tới sandbox chỉ thấy placeholder. Lệnh gọi cần duyệt đi tới màn hình duyệt, người duyệt bấm Cho phép thì lời duyệt quay về session. Request từ session và sandbox đi qua egress; vault của từng người gửi token tới egress, egress gắn token và thay placeholder bằng giá trị thật rồi gửi tới MCP server và API đối tác. Màn hình duyệt ghi vào log ứng dụng (ai hỏi, ai duyệt), session ghi event của session (lệnh gọi tool); hai log khớp nhau bằng session_id và tool_use_id. Ba ô mang danh tính là người dùng cuối, backend và session._

- **ỨNG DỤNG CỦA BẠN**
- **CLAUDE MANAGED AGENTS**
- **BÊN NGOÀI**
- **Người dùng cuối**: đăng nhập qua IdP
- **Backend**: workload, qua WIF
- **Màn hình duyệt**: người bấm Cho phép
- **Sandbox**: thấy placeholder
- **Session**: agent_id,
- policy từng tool
- **Vault**: từng người
- **Egress**: gắn token,
- thay bằng
- giá trị thật
- **MCP server**: hệ thống nội bộ
- **API đối tác**: nhận khoá thật
- hỏi duyệt
- Cho phép
- **AUDIT LOG**
- **Log ứng dụng**: ai hỏi, ai duyệt
- **Event session**: lệnh gọi tool
- session_id
- tool_use_id
- gửi tới
- ghi vào audit log
- khớp cùng ID
- mang danh tính
- người duyệt

## Ví dụ xuyên suốt: agent đặt hàng của một nhà phân phối dược phẩm

Một công ty phân phối dược phẩm có 140 nhân viên kinh doanh, mỗi người phụ trách một nhóm trong 3.200 nhà thuốc, trung bình khoảng 23 nhà thuốc mỗi người. Công ty chạy một agent trên Claude Managed Agents để nhân viên kinh doanh hỏi công nợ, xem tồn kho và tạo đơn cho nhà thuốc của mình. Agent gọi hệ thống ERP qua một MCP server. Hệ thống ERP do một đội khác của công ty quản lý, gọi là đội ERP. Agent còn có một sandbox để chạy lệnh, và code trong sandbox gọi thẳng API của một đối tác vận chuyển để tra lịch giao hàng.

Backend của agent chạy trên cluster Kubernetes của công ty và gọi Claude API. Lúc đầu, backend xác thực bằng một khoá `sk-ant-` lưu trong Kubernetes Secret. Đội làm agent của công ty, gọi tắt là đội, lo phần kỹ thuật này.

## Agent hành động nhân danh ai

Ở bản đầu tiên, MCP server gọi vào ERP bằng một credential dịch vụ, tức tài khoản dành cho phần mềm chứ không gắn với người nào, và tài khoản này xem được cả 3.200 nhà thuốc. Một nhân viên miền Bắc hỏi "công nợ quá hạn lớn nhất hiện nay", và agent trả lời bằng một nhà thuốc miền Nam của đồng nghiệp. Lỗi không nằm ở ERP. Mọi câu hỏi đều tới ERP từ cùng một tài khoản toàn quyền, nên ERP không biết người đang hỏi là ai để giới hạn kết quả.

Danh tính của agent (**agent identity**) cần tách thành ba lớp, mỗi lớp trả lời một câu hỏi khác nhau.

| Danh tính | Trả lời câu hỏi | Trong ví dụ |
| --- | --- | --- |
| Workload | Process nào đang gọi Claude API | Service account của backend, qua Workload Identity Federation |
| Người dùng cuối | Agent đang làm việc cho ai | Nhân viên kinh doanh đã đăng nhập |
| Chính agent | Agent nào đang gọi tool | Agent đặt hàng, khác với agent làm báo cáo |

Câu hỏi khó là agent nên có danh tính riêng, hay chỉ là phần nối dài của người dùng và thừa hưởng quyền của họ. Câu trả lời nhiều khả năng là kết hợp cả hai. Chẳng hạn Claude Cowork, ứng dụng để Claude làm việc ngay trên máy tính của bạn, giữ credential của người dùng trong keychain của máy, rồi cấp cho mỗi session một token ít quyền hơn và thu hồi được riêng.

Nếu hệ thống phía sau đã phân quyền theo từng người như ERP ở đây, cách đơn giản nhất là cho agent dùng credential của chính người dùng. Khi đó ERP tự trả đúng phần dữ liệu mà người đó được xem. Trên Managed Agents, credential của từng người được cất trong vault. Vault là một tập credential gắn với một người dùng cuối, và bạn truyền nó vào bằng `vault_ids` khi tạo session. Nhờ vậy một agent dùng chung được cho cả 140 nhân viên, còn credential vẫn tách riêng theo từng người.

Có lúc tool cần biết cả agent nào đang gọi, chẳng hạn để agent báo cáo không tạo được đơn. Khi đó bạn cần danh tính của chính agent. Nếu bạn tự host Managed Agents (bản self-hosted), thì mỗi lần agent liệt kê tool hay gọi tool, server của bạn ký một JWT (token có chữ ký số) ghi `agent_id` của agent đó. JWT này sống ngắn, mặc định tối đa 5 phút. MCP server, hoặc gateway (cổng đặt trước các MCP server), kiểm chữ ký rồi phân quyền theo `agent_id`. Khi dùng token này, có ba chỗ hay làm sai.

- Nếu người tạo session đăng nhập qua single sign-on (SSO), token có thêm `actor_sub` ghi danh tính người đó. Nhưng `actor_sub` **không có nghĩa người đó đã duyệt lệnh gọi tool**, vì chính model tự chọn gọi tool nào, lúc nào.
- Token của lần liệt kê tool, token của subagent, và token của session tạo bằng API key của server đều không có `actor_sub`. Vì vậy nếu gateway phân quyền theo người dùng, nó phải từ chối mọi lệnh gọi thiếu `actor_sub` chứ không cho qua.
- Gateway nên gọi tiếp tới từng tool bằng credential riêng của mình, không chuyển nguyên token của agent sang cho tool.

## Workload Identity Federation thay khoá tĩnh

Workload Identity Federation (**workload identity federation**, viết tắt WIF) là cách thay khoá API tĩnh (**replacing static API keys**). Thay vì giữ một khoá `sk-ant-` không bao giờ hết hạn, workload xác thực với Claude API bằng một token OIDC ngắn hạn (OIDC là chuẩn phát token đăng nhập có chữ ký). Token này do IdP bạn đang dùng cấp, như Kubernetes, AWS IAM, Google Cloud hay GitHub Actions. Không còn bí mật tĩnh nào để lưu, xoay vòng hay làm lộ. Cấu hình gồm ba thứ.

- **Service account** (`svac_...`) là tài khoản dành cho phần mềm chứ không cho người, nằm trong tổ chức của bạn trên Anthropic. Bạn thêm nó vào một hoặc vài workspace, tức các nhóm tách riêng tài nguyên và khoá API trong tổ chức.
- **Federation issuer** (`fdis_...`) là bản đăng ký IdP với Anthropic, gồm giá trị `iss` ghi trên JWT và nơi lấy khoá công khai (JWKS) để kiểm chữ ký. Thường mỗi môi trường có một issuer riêng.
- **Federation rule** (`fdrl_...`) quyết định JWT nào được đổi lấy token, theo dạng "JWT do issuer X ký, có các claim khớp điều kiện Y, thì được hành động như service account Z với scope S". Claim là các trường thông tin trong JWT. Ví dụ `sub` ghi danh tính workload, còn `aud` (audience) ghi JWT được cấp để dùng ở đâu. Scope giới hạn những API mà token được gọi.

Khi chạy, SDK đổi JWT của IdP lấy token `sk-ant-oat01-...` và tự làm mới trước khi hết hạn. Token này sống tối đa bằng giá trị nhỏ hơn trong hai giá trị, là `token_lifetime_seconds` của rule (mặc định 3.600 giây) và gấp đôi thời gian JWT gốc còn hiệu lực. Ví dụ JWT còn 10 phút thì token sống tối đa 20 phút. Nhờ vậy token Anthropic không còn dùng được quá lâu sau khi JWT sinh ra nó đã hết hạn.

Quay lại công ty dược phẩm. Cluster của họ có 18 namespace thuộc sáu đội. Khi chuyển backend agent sang WIF, đội viết rule với `subject_prefix` (phần đầu mà claim `sub` phải khớp) là `system:serviceaccount:*` để "cho chạy được trước", và không đặt `audience`. Hai tuần sau, trang authentication history trong Claude Console, nơi ghi lại từng lần đổi JWT lấy token, cho thấy một batch job của đội khác cũng đổi được token Claude API. Đây chính là cách cấu hình cần tránh. Prefix kết thúc bằng `*` khớp với mọi service account trong cluster, còn khi không đặt `audience` thì rule chấp nhận cả token mặc định mà pod nào cũng có sẵn.

**Sơ đồ: Rule khớp mọi service account và không đặt audience thì pod nào trong cluster cũng lấy được token**

✗ _Rule viết rộng cho chạy được trước_
1. subject_prefix là system:serviceaccount:* và không đặt audience
   ↓ _pod nào cũng có sẵn token mặc định của cluster_
2. **18 namespace** pod nào cũng đổi được token Claude API

✓ _Rule chỉ khớp đúng một workload_
1. subject_prefix là system:serviceaccount:dat-hang:agent-backend
   ↓ _audience bắt buộc, khớp với giá trị đặt trên token của pod_
2. **Chỉ agent-backend** đổi được token, scope workspace:developer

Từ sự cố này, có mấy quy tắc nên giữ khi viết rule và khi chuyển sang WIF.

- Trong `subject_prefix`, hãy ghi đủ namespace và tên service account, không để `*` ở cuối. Luôn đặt `audience` bằng một giá trị `aud` dành riêng cho Anthropic, để token mặc định của cluster không dùng được. Mỗi namespace nên có một rule và một service account Anthropic riêng.
- Scope chỉ đặt mức trần cho quyền. `workspace:inference` gồm Messages, Models và endpoint chat tương thích OpenAI. `workspace:developer` thêm Managed Agents, Files và các endpoint không quản trị khác. Token chỉ làm được những việc mà cả scope lẫn vai trò của service account (`developer` hay `admin`) cùng cho phép. Worker chỉ tóm tắt đơn hàng thì dùng `workspace:inference`.
- Để chuyển đổi không gián đoạn, cần biết SDK ưu tiên `ANTHROPIC_API_KEY` hơn các biến môi trường của WIF, nên chừng nào biến này còn thì SDK vẫn dùng khoá cũ. Vì vậy hãy cấu hình WIF chạy song song, chạy `ant auth status` trong workload để xem nó đang xác thực bằng cách nào, gỡ `ANTHROPIC_API_KEY` ở mọi nơi nạp nó, kiểm tra lại, rồi mới xoá khoá.
- Mọi lần JWT bị từ chối, API đều trả cùng một lỗi `401` "Authentication failed", để kẻ tấn công dò thử không đoán được rule được cấu hình thế nào. Muốn biết lý do thật, bạn xem trang authentication history.
- Mặc định, JWT có `jti` (ID duy nhất của JWT) chỉ đổi được một lần. Nếu vòng retry gửi lại đúng JWT cũ, lần đổi đó bị từ chối với lý do `jti_reused`.

Dù vậy, WIF không tự làm mọi thứ an toàn. Anthropic tin một JWT vì tin IdP đã ký nó, nên nếu IdP bị chiếm hoặc cấp JWT quá dễ dãi thì WIF cũng hở theo.

> **Bẫy đề**
>
> Batch job của đội khác đổi được token Claude API vì rule khớp mọi service account. Có ba cách xử lý nghe hợp lý nhưng sai.
>
> - **Quay lại khoá API tĩnh cho chắc** (_go back to a static API key_). Cách này bớt được một thứ phải cấu hình. Nhưng khoá tĩnh mà lộ thì ai cầm được cũng dùng được cho tới khi có người thu hồi, và nhìn vào lệnh gọi cũng không biết nó đến từ workload nào.
> - **Rút `token_lifetime_seconds` xuống 60 giây** (_shorten the token lifetime_). Token sống ngắn hơn nghe như giảm được thiệt hại. Nhưng pod lạ chỉ cần đổi token mới thường xuyên hơn. Lỗi nằm ở chỗ rule khớp quá rộng, không nằm ở thời gian sống của token.
> - **Đổi scope sang `workspace:inference`** (_narrow the OAuth scope_). Thu hẹp scope có vẻ đúng nguyên tắc quyền tối thiểu. Nhưng mọi pod vẫn gọi được Claude API bằng tiền và hạn mức của workload thật.
>
> **Chọn:** sửa `subject_prefix` thành đúng namespace và service account của backend, bắt buộc `audience`, rồi xem trang authentication history để biết những ai đã đổi được token.

> **Trong đề chọn gì**
>
> Khi phải chọn giữa một credential dùng chung, sống lâu và một danh tính ngắn hạn gắn đúng workload hay đúng người, hãy chọn cái sau. Đó là WIF với rule hẹp cho workload, và credential uỷ quyền theo từng người cho dữ liệu. Những đáp án như lưu khoá cẩn thận hơn hay xoay vòng khoá thường hơn nghe có vẻ an toàn, nhưng vẫn giữ nguyên một khoá dùng chung cho mọi workload và mọi người.

## Quản lý credential và bí mật

Quản lý credential và bí mật (**credential and secrets management**) cho agent có một mục tiêu riêng. Model và code chạy trong sandbox (môi trường cô lập nơi agent chạy lệnh) không được thấy giá trị thật của bí mật, kể cả khi bí mật bị một server bên ngoài gửi ngược về. Managed Agents có ba cơ chế cho việc này.

- **Credential MCP** (`mcp_oauth`, `static_bearer`) gắn với URL của một MCP server. Mỗi khi agent kết nối tới URL đó, Managed Agents tự gắn token vào request.
- **Credential biến môi trường** (`environment_variable`) chỉ xuất hiện trong sandbox dưới dạng placeholder, tức một chuỗi giữ chỗ chứ không phải giá trị thật. Managed Agents chỉ thay placeholder bằng giá trị thật khi request HTTPS đi ra ngoài, và chỉ với những host mà credential cho phép. Nên đặt `injection_location` chỉ là header, vì body request thường được dựng từ nội dung mà agent đọc được. Nếu tạo credential mà bỏ trống trường này, Managed Agents sẽ thay giá trị thật vào cả header lẫn body.
- **Giá trị bí mật là write-only.** Bạn ghi vào được, nhưng API không bao giờ trả lại giá trị đó. Managed Agents đọc lại credential định kỳ, nên khi bạn xoay vòng hay archive credential (vô hiệu hoá nhưng giữ bản ghi), session đang chạy cũng nhận thay đổi sau một khoảng trễ mà không cần khởi động lại.

Dù có placeholder, bí mật vẫn có đường lọt về. Đội cấu hình khoá API của đối tác vận chuyển thành credential biến môi trường. Đối tác có một endpoint debug trả lại nguyên các header của request, và có lần agent gọi nhầm endpoint đó để "kiểm tra kết nối". Response trả về chứa nguyên header có khoá thật, và khoá đó đi thẳng vào context của model và vào transcript. Placeholder chỉ che bí mật bên trong sandbox, còn những gì server bên ngoài gửi ngược về thì không được che.

**Sơ đồ: Placeholder chỉ che bí mật trong sandbox, endpoint debug trả nguyên header là khoá thật vào context**
Bên tham gia: API đối tác, Egress HTTPS, Sandbox

1. header chứa placeholder
2. gọi endpoint debug
3. trả nguyên các header

Trường `networking` của credential quy định giá trị thật được thay vào request tới những host nào. Lúc đầu đội để `unrestricted`, tức host nào cũng được. Nên đặt `limited` và chỉ liệt kê đúng host cần dùng, tránh wildcard, tránh domain của dịch vụ hosting mà nhiều khách dùng chung, và tránh host nào trả lại header của request. Đội chuyển credential sang `limited` với đúng host API giao hàng. Nhưng endpoint debug nằm ngay trên host đó, nên `limited` chỉ thu hẹp phạm vi, còn chuyện khoá bị trả ngược về thì chỉ hết khi đối tác tắt endpoint debug.

Ngoài chuyện giới hạn host, còn ba điều nữa khi giữ bí mật cho agent.

- **Không đưa khoá Claude API hay token truy cập `sk-ant-oat01-` cho agent**, kể cả qua vault. Có khoá trong tay, code trong sandbox gọi thẳng được Claude API, và những lệnh gọi đó nằm ngoài mọi cấu hình tool, bước duyệt và ngân sách bạn đặt cho agent.
- **Ứng dụng của bạn tự lấy token của bên thứ ba rồi cất vào vault.** Đừng để code trong sandbox tự dùng một bí mật đã lưu để đi xin token, vì token xin được sẽ nằm trong sandbox ở dạng thật, không còn là placeholder.
- **Workload khác mức tin cậy thì để vault ở workspace khác**, vì ai tạo được session trong một workspace cũng tham chiếu được vault của workspace đó.

## Quyền tối thiểu cho tool

Chuyện tiếp theo nằm ở tool. MCP server của ERP có 34 tool, agent đặt hàng chỉ cần 5, nhưng đội vẫn bật cả toolset, tức toàn bộ tool mà MCP server cung cấp. Mỗi tool có một permission policy, quy định lệnh gọi có cần người duyệt hay không. `always_allow` cho chạy luôn. `always_ask` dừng lại chờ người duyệt. `auto` để Managed Agents tự đánh giá từng lệnh gọi rồi cho chạy, từ chối hoặc chờ duyệt.

Để bớt các lần chờ duyệt, đội đặt `default_config.permission_policy` của cả MCP toolset thành `always_allow`. Tháng sau, đội ERP thêm tool `huy_hoa_don` vào server. Khi một nhân viên nhắn rằng nhà thuốc muốn "bỏ đơn hôm qua", agent gọi ngay tool này để huỷ hoá đơn mà không có ai duyệt.

Cấp quyền tool tối thiểu (**least-privilege tool permissioning**) nghĩa là thu hẹp quyền ở cả bốn tầng sau.

| Tầng | Làm gì | Trong ví dụ |
| --- | --- | --- |
| Tool được bật | Chỉ bật tool agent cần, tool không cần thì tắt hẳn | 5 trên 34 tool của ERP |
| Permission policy từng tool | Giữ mặc định `always_ask` của MCP toolset, chỉ đặt `auto` cho từng tool chỉ đọc | Tool tạo đơn `always_ask`, `huy_hoa_don` thêm sau vẫn phải chờ duyệt |
| Agent | Mỗi việc một agent với bộ tool riêng | Agent báo cáo không có tool tạo đơn |
| Credential | Giới hạn quyền ngay trên khoá, ở phía dịch vụ đã cấp khoá đó | Token ERP của nhân viên chỉ thấy nhà thuốc của họ |

Bật đúng 5 tool là cách sửa thứ nhất. Lớp bảo vệ thứ hai là mặc định `always_ask` của MCP toolset. Nhờ mặc định này, tool nào MCP server thêm vào sau cũng không chạy được khi chưa có người duyệt. Đặt `always_allow` cho cả toolset là bỏ đi đúng lớp bảo vệ đó, nên `huy_hoa_don` mới chạy được ngay. Bộ tool dựng sẵn của Managed Agents (agent toolset, gồm `bash`, `write`, `edit`…) thì ngược lại. Mặc định của nó là `always_allow`, nên bạn phải tự chuyển những tool cần duyệt sang `always_ask`.

## Audit log cho hành động của agent

Một nhà thuốc khiếu nại đơn 1.200 hộp kháng sinh mà họ không đặt. Event của session, tức dòng event Managed Agents ghi lại cho từng bước của agent, có lệnh gọi tool tạo đơn. ERP cho biết đơn được tạo bằng tài khoản của nhân viên nào, nhưng không cho biết đơn đến từ session nào và từ câu hỏi nào. Event của session thì không có chỗ nào ghi ai đã bấm duyệt. Đội mất hai ngày ghép log của ứng dụng, log của ERP và lịch sử session.

Audit log cho các hành động liên quan tới bảo mật của agent (**audit logging of security-relevant agent actions**) phải nối được cả chuỗi, từ người hỏi, qua session và lệnh gọi tool, tới người duyệt và bản ghi trong ERP. Các nguồn log nối với nhau bằng những ID chung như `session_id` và `tool_use_id`.

**Sơ đồ: Ứng dụng tự ghi một dòng nối người hỏi, người duyệt, session và đơn 1.200 hộp trong ERP**
- ứng dụng ghi người duyệt
- ứng dụng ghi người hỏi
- client gửi user.tool_confirmation,không ghi người bấm
- khớp session_id, tool_use_id
- khớp tài khoản, thời điểm tạo đơn
- Người bấm Cho phép
- Dòng audit của ứng dụngnhân viên, session_id,tool_use_id, người duyệt
- Nhân viên kinh doanhngười yêu cầu
- Event của sessionlệnh gọi tool tạo đơn
- ERPđơn 1.200 hộp

Mỗi nguồn log chỉ ghi được một phần của chuỗi đó.

- **Event của session Managed Agents.** Mỗi event `agent.tool_use` và `agent.mcp_tool_use` có trường `evaluated_permission` (`allow`, `ask` hay `deny`), và hầu hết event còn có object `evaluation` ghi policy nào đã ra quyết định đó. Lời duyệt là event `user.tool_confirmation` do client của bạn gửi lên. Event này chỉ mang `tool_use_id`, kết quả allow hay deny và `deny_message`, không có trường nào ghi người bấm, nên **ứng dụng của bạn phải tự ghi danh tính người duyệt**.
- **Claude Code và Agent SDK** xuất event theo chuẩn OpenTelemetry (chuẩn mở để gửi log, metric và trace sang hệ thống giám sát), và các event này dùng được làm nguồn audit. Event `tool_decision` cho biết một lệnh gọi được cho chạy hay bị chặn, và quyết định đó đến từ cấu hình, hook hay người dùng. Event `permission_mode_changed` ghi lại mỗi lần permission mode đổi, kèm mode cũ, mode mới và nguyên nhân. Nếu xác thực bằng API key, event chỉ có `user.id` (mã ẩn danh theo từng bản cài, không phải tên người dùng) và `session.id`, nên bạn phải tự gắn danh tính người dùng qua `OTEL_RESOURCE_ATTRIBUTES`.
- **Compliance API** là API để tra hoạt động của tổ chức phục vụ kiểm tra tuân thủ. Phần Activity Feed của nó ghi các hoạt động xác thực và quản trị trong tổ chức. Hầu hết hoạt động tra được trong vòng 1 phút (riêng nhóm security posture có thể lâu hơn), và mọi hoạt động được giữ 6 năm.
- **Authentication history của WIF** ghi các lần đổi token gần đây, kèm issuer, rule đã xét, claim, và bước kiểm nào hỏng nếu bị từ chối. Chính trang này đã cho đội thấy batch job của đội khác đổi được token Claude API.

Khi giữ log, có ba điều cần để ý. Khi dọn vault hay credential, nên archive thay vì delete, vì archive xoá bí mật nhưng giữ lại bản ghi để còn tra cứu, còn delete xoá luôn cả bản ghi. Nếu bật `OTEL_LOG_TOOL_DETAILS=1`, event sẽ chứa nguyên lệnh và tham số của tool, có thể gồm cả dữ liệu nhạy cảm, nên chỉ gửi event tới collector (máy chủ nhận và chuyển tiếp event) đã được phép lưu loại nội dung này. Và bản thân log chỉ là một dòng event thô, còn việc phát hiện bất thường và gửi cảnh báo thường do SIEM đảm nhận, không phải do Claude.

Sau sự cố, ứng dụng tự ghi một dòng cho mỗi đơn tạo qua agent, gồm nhân viên, `session_id`, `tool_use_id`, người duyệt và nội dung họ đã xem. Ứng dụng biết `session_id` vì chính nó tạo session. Dòng này nối với bản ghi ERP qua tài khoản nhân viên và thời điểm tạo đơn. Lần khiếu nại sau, đội tìm ra ai đã yêu cầu và ai đã duyệt đơn chỉ trong mười phút.

> **Ý chính**
>
> Agent có ba danh tính là workload, người dùng cuối và chính agent. Rule WIF phải khớp đúng service account và có `audience`. Bí mật nằm trong vault và chỉ được thay vào request đi ra tới đúng host cho phép, nhưng vẫn có thể lọt về sandbox qua response. Giữ `always_ask` cho tool ghi và tool thêm sau. Audit log phải nối người yêu cầu, agent, credential và người duyệt bằng các ID chung, và ứng dụng của bạn phải tự ghi danh tính người duyệt.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 7](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [Workload Identity Federation (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation)
3. [WIF reference (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/wif-reference)
4. [Use WIF with Kubernetes (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/wif-providers/kubernetes)
5. [Authenticate with vaults (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/vaults)
6. [Secure your Managed Agents deployment (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/secure-deployment)
7. [Permission policies (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/permission-policies)
8. [Agent identity and credentials, self-hosted Managed Agents (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/self-hosted/agent-identity)
9. [Compliance API Activity Feed (Claude API Docs)](https://platform.claude.com/docs/en/manage-claude/compliance-activity-feed)
10. [Observability with OpenTelemetry (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/observability)
11. [Monitoring, audit security events (Claude Code Docs)](https://code.claude.com/docs/en/monitoring-usage)
12. [How we contain Claude across products (Anthropic Engineering)](https://www.anthropic.com/research/how-we-contain-claude)
