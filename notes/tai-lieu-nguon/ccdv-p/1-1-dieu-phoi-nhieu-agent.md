---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-p/1-1-dieu-phoi-nhieu-agent
ngay_tai: 2026-11-27
tieu_de: Điều phối nhiều agent trên production - giao việc, cô lập context, giao tiếp và người duyệt
---

Domain 1: Advanced Agent Architecture and Orchestration · Task 1.1

# Điều phối nhiều agent trên production - giao việc, cô lập context, giao tiếp và người duyệt

Chọn kiểu điều phối, giao việc song song có giới hạn, tách context và quyền giữa các agent, chuyển kết quả không rơi chi tiết, đặt người duyệt đúng chỗ.

- 18 phút đọc
- Đối chiếu docs 21/11/2026
- 12 nguồn

## Đọc xong bạn nắm được

- Chọn giữa subagent, dynamic workflow, advisor và agent team theo việc ai quyết định bước tiếp theo
- Giao việc song song bằng prompt đủ ý, có giới hạn độ sâu, số lượng và chi phí đặt trong cấu hình
- Biết subagent nhận được những gì, dùng chung những gì với agent chính, và tool nào chỉ nên để agent chính giữ
- Nhận ra lỗi giữa các agent như làm trùng, mất chi tiết khi chuyển tay, báo xong mà thiếu, và sửa đúng chỗ
- Thiết kế approval flow khi hành động đến từ subagent, và biết vì sao chỉ tin nhắn từ client mới được tính là ý người dùng

Khi nào một agent không đủ sức, phải chia việc cho nhiều agent? Và khi đã chia, agent chính phải giao việc thế nào để các agent con không làm trùng, không bỏ sót, không tự ý làm việc nguy hiểm? Trên production, những câu này quan trọng vì một lỗi nhỏ ở khoảng giữa các agent có thể biến thành một hành động thật, không rút lại được.

Trong đề thi, nhóm kỹ năng này tên là **multi-agent orchestration**. Bạn phải đánh giá được các kiểu điều phối (**orchestration patterns**) và các lỗi xảy ra giữa các agent (**inter-agent failures**). Cụ thể có năm ý: một agent chính chỉ huy nhiều agent con (**supervisor/worker hierarchies**), giao nhiều việc cùng lúc (**parallel subagent dispatch**), ranh giới của việc được giao và phần context mỗi agent nhìn thấy (**delegation and context-isolation boundaries**), cách các agent chuyển kết quả cho nhau (**inter-agent communication**), và chỗ đặt người duyệt (**human-in-the-loop and approval flows**). Phần nền về orchestrator và subagent có ở bài 1.1 của CCDV-F.

**Sơ đồ: Ai quyết định bước sau tách bốn kiểu điều phối; với subagent, tool nguy hiểm phải qua người duyệt**
_Bản đồ bài: bốn kiểu điều phối và ai quyết định bước sau; kiểu subagent: agent chính giao việc, nhận báo cáo, xin duyệt trước khi gọi tool nguy hiểm_

- **Orchestration patterns: ai quyết định bước tiếp theo?**
- **Subagent**: agent chính, sau
- khi đọc báo cáo
- **Dynamic workflow**: chương trình điều phối
- do Claude viết
- **Advisor**: agent chính tự làm,
- hỏi ý model khác
- **Agent team**: các teammate
- tự chia việc
- kiểu này, vẽ chi tiết dưới đây
- **Agent chính**: orchestrator
- **Giao việc**: prompt đủ 4 phần,
- giới hạn ở cấu hình
- **Báo cáo về**
- **Lỗi chuyển tay**: báo xong mà còn thiếu
- **Context-isolation boundaries**: subagent
- subagent
- subagent
- context riêng: chỉ thấy prompt giao việc
- quyền: chưa chắc đã tách riêng
- xin gọi tool
- **Approval gate**: permission policy
- đồng ý
- **Tool nguy hiểm**: không rút lại được
- nếu chưa tách quyền

## Ví dụ xuyên suốt: agent khai hải quan của một đại lý logistics

Một đại lý làm thủ tục hải quan cho hàng nhập khẩu dùng agent để khai báo. Agent chạy trên Claude Managed Agents, dịch vụ mà Anthropic chạy giúp bạn cả vòng lặp agent lẫn sandbox trên hạ tầng của họ. Cách còn lại là Agent SDK, thư viện để bạn tự chạy vòng lặp agent trong code của mình; bài này sẽ nhiều lần so hai nền tảng với nhau. Với mỗi lô hàng, agent chính đọc hoá đơn, phiếu đóng gói và giấy chứng nhận xuất xứ, rồi chia việc cho các subagent: tra mã HS cho từng dòng hàng (mã phân loại hàng hoá, quyết định thuế suất), kiểm giấy phép chuyên ngành trên cổng của cơ quan quản lý, tính thuế và soạn tờ khai nháp. Subagent kiểm giấy phép tra cổng đó qua MCP server `tra_giay_phep` (MCP server là chương trình cung cấp tool cho agent qua giao thức MCP). Bước cuối là agent chính gọi tool `nop_to_khai` của MCP server `cong_hai_quan` để nộp tờ khai lên cổng hải quan. Tờ khai đã nộp thì không rút lại được, nên đây là bước nguy hiểm nhất của cả quy trình.

## Chọn kiểu điều phối

Trong hệ nhiều agent, agent giao việc được tài liệu tiếng Anh gọi là orchestrator hay **lead agent**, còn các agent nhận việc là subagent. Bài này gọi thống nhất là agent chính và subagent. Cấu trúc một agent chỉ huy, nhiều agent làm theo này gọi là **supervisor/worker hierarchy**. Chia việc cho subagent chỉ đáng làm khi bạn cần một trong ba thứ. Thứ nhất là giữ context của agent chính gọn: subagent đọc hàng chục tài liệu, agent chính chỉ nhận lại một bản báo cáo ngắn. Thứ hai là chạy song song nhiều phần việc độc lập. Thứ ba là cần một "chuyên gia", tức một agent có system prompt và bộ tool riêng. Không cần thứ nào trong ba thứ đó mà vẫn thêm agent thì hệ chỉ tốn tiền hơn và khó gỡ lỗi hơn.

Khi đã quyết chia việc, nền tảng Claude có bốn cách dựng. Ba cách dễ hình dung: giao từng việc cho subagent, hỏi ý một model mạnh hơn, hay để các agent ngang hàng nhắn tin cho nhau. Cách thứ tư, dynamic workflow, cần nói thêm một câu: ở đây Claude không tự giao từng việc mà viết ra một chương trình điều phối nhỏ, chương trình đó tạo hàng loạt agent, cho chúng chạy qua từng giai đoạn (phase) rồi gom kết quả. Muốn phân biệt bốn cách, bạn hỏi: ai quyết định bước tiếp theo?

| Kiểu | Ai quyết định bước tiếp theo | Hợp khi |
| --- | --- | --- |
| Subagent (tool `Agent` trong Agent SDK, `subagents` trong Managed Agents) | Agent chính, sau khi đọc báo cáo của từng subagent | Có vài việc chuyên biệt, và agent chính có thể cần hỏi lại subagent sau khi đọc báo cáo |
| Dynamic workflow (tool `Workflow`, `workflows` trong Managed Agents) | Chương trình điều phối do Claude viết ra, chạy background qua từng phase | Rất nhiều phần việc giống nhau cần chạy song song, như rà hàng trăm tài liệu hay chuyển đổi hàng loạt file |
| Advisor (`advisor` trong Managed Agents, advisor tool trong Messages API) | Agent chính tự làm hết, chỉ hỏi ý một model khác, thường mạnh hơn, ở vài thời điểm | Một agent làm đủ việc, chỉ cần thêm phán đoán lúc lập kế hoạch hay lúc rà kết quả |
| Agent team (chỉ có trong session Claude Code chạy tương tác, đang thử nghiệm) | Các agent ngang hàng (teammate) tự chia việc qua tin nhắn và danh sách task chung | Các agent cần trao đổi hay phản biện nhau |

Tool giao việc cho subagent của Agent SDK nay tên là `Agent`, nhưng trong danh sách tool lúc khởi tạo session nó vẫn hiện là `Task`, và các bản Claude Code trước v2.1.63 cũng gọi là `Task`. Đề thi có thể gọi nó là Task.

Trong Managed Agents, mỗi agent có một bản định nghĩa, là cấu hình gồm model, system prompt và tool của agent đó. Ba kiểu đầu được bật hay tắt trong khối `multiagent` của bản định nghĩa này. Mặc định `subagents` và `workflows` bật, còn `advisor` tắt. Cấu hình chỉ quyết định agent được phép dùng kiểu nào, còn lúc nào dùng kiểu nào thì agent tự chọn. Vì vậy system prompt phải nói rõ trường hợp nào dùng kiểu nào. Với đại lý, một câu như vậy có thể là: "Lô dưới 20 dòng hàng thì giao cho subagent, từ 20 dòng trở lên thì chạy workflow, gặp dòng hàng khó phân loại thì hỏi advisor." Lúc mới chạy, system prompt của đại lý chưa có câu nào như thế.

Cây agent nên nông. Managed Agents chỉ cho giao việc một tầng: subagent mà có khối `multiagent` riêng thì API trả lỗi 400. Agent SDK mặc định cho sâu tới ba tầng. Mỗi tầng thêm vào là thêm một lần kết quả bị tóm tắt trước khi chuyển lên, nên càng nhiều tầng càng dễ rơi chi tiết.

> **Trong đề chọn gì**
>
> Câu hỏi bắt chọn kiểu điều phối thì tự hỏi ai quyết định bước tiếp theo. Rất nhiều phần việc giống nhau thì chọn **dynamic workflow**. Vài việc chuyên biệt mà agent chính cần hỏi lại thì chọn **subagent**. Một agent làm đủ, chỉ thiếu phán đoán ở vài điểm thì chọn **advisor**. Đáp án "thêm agent cho chắc" mà không nêu được lý do về context, chạy song song hay chuyên môn là đáp án tốn tiền mà không giải quyết gì.

## Giao việc song song có giới hạn

Lô hàng đầu tiên chạy thật có 14 dòng hàng. Agent chính tạo mỗi dòng một subagent, và prompt giao việc chỉ có một câu như "Tra mã HS dòng 6". Hoá đơn và phiếu đóng gói lại đánh số dòng khác nhau. Subagent nhận "dòng 11" lại đếm theo phiếu đóng gói, nên tra đúng món mà subagent "dòng 6" đang tra. Kết quả là một món bị tra hai lần, còn dòng 11 của hoá đơn thì không ai tra. Ngoài ra có bốn dòng được trả mã HS nhưng không kèm căn cứ phân loại, tức lý do vì sao chọn mã đó. Nhân viên phải tra lại bằng tay cả năm dòng này.

Lỗi kiểu này hay gặp nhất khi giao việc (**delegation**) cho nhiều subagent chạy cùng lúc (**parallel subagent dispatch**). Lý do là **prompt giao việc là tất cả những gì subagent biết về phần việc của nó**. Subagent không thấy lịch sử hội thoại, không thấy kết quả tool hay system prompt của agent chính. Vì vậy prompt nào cũng cần đủ bốn phần: mục tiêu, định dạng kết quả, tool và nguồn nên dùng, và ranh giới, tức phần nào thuộc việc của subagent, phần nào không.

**Sơ đồ: Prompt giao việc chỉ một câu: mỗi subagent tự hiểu một kiểu, 5 trên 14 dòng hàng phải tra lại**
_Hai cách giao việc tra mã HS: prompt một câu dẫn tới 1 dòng sót và 4 dòng thiếu căn cứ; prompt đủ bốn phần cho mọi subagent đếm theo hoá đơn và kèm căn cứ_

- **Cách sai: prompt một câu**
- **Agent chính tạo 14 subagent**: mỗi dòng một cái: “Tra mã HS dòng 6”
- **Đếm dòng lệch**: “dòng 11” đếm theo
- phiếu đóng gói
- **Không đòi căn cứ**: prompt không nói
- định dạng kết quả
- **Sót 1 dòng**
- **4 dòng**: dòng 11 của hoá đơn;
- một món tra hai lần
- có mã HS nhưng
- không kèm căn cứ
- **5 dòng nhân viên phải tra lại bằng tay**: 1 dòng sót + 4 dòng thiếu căn cứ = 5 dòng
- **Cách đúng: prompt đủ 4 phần**
- **Prompt “dòng 6”**
- **Mục tiêu**
- **Tool và nguồn**
- **Ranh giới**
- **Định dạng**: mã HS dòng 6 theo hoá đơn,
- kèm căn cứ phân loại
- tra mã HS ở đâu, tool nào
- chỉ dòng này, không tính thuế
- số dòng theo hoá đơn,
- mã HS, căn cứ phân loại
- **Đếm dòng theo hoá đơn**: mã HS nào cũng kèm căn cứ

Ngoài nội dung prompt, số subagent cũng phải hợp với độ khó của việc. Chuyện tạo quá nhiều subagent không chỉ xảy ra ở đại lý: trong hệ nghiên cứu nhiều agent mà Anthropic tự dựng, bản đầu từng tạo tới 50 subagent cho một câu hỏi đơn giản. Cách chữa là ghi quy tắc vào prompt: tra một dữ kiện thì một agent là đủ, so sánh vài thứ thì 2–4 agent, chỉ việc thật phức tạp mới cần hơn 10 agent.

Tuy vậy, lời dặn trong prompt chỉ định hướng, còn tạo bao nhiêu subagent vẫn là Claude tự quyết. Muốn chắc thì **đặt giới hạn bằng cấu hình, không chỉ bằng prompt**. Ở Managed Agents, mỗi lần chạy agent là một session. Trong session, mỗi subagent có một luồng hội thoại riêng gọi là child thread, với lịch sử riêng của nó. Thread đã chạy xong vẫn bị tính vào giới hạn cho tới khi bạn archive (đóng hẳn) nó. Bảng sau so ba loại giới hạn ở hai nền tảng:

| Giới hạn | Agent SDK | Managed Agents |
| --- | --- | --- |
| Độ sâu | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, mặc định 3 | Chỉ một tầng |
| Số agent cùng lúc | `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, mặc định 20 | 25 child thread mỗi session. Thread do workflow tạo không tính vào con số này; mỗi lần chạy workflow (một run) có tối đa 64 thread chạy cùng lúc, cả run khởi động tối đa 1.000 agent |
| Chi phí | `maxBudgetUsd`, mặc định không giới hạn | Session budget, đặt lúc tạo session |

Vấn đề tiếp theo là chờ đợi. Nếu agent chính đợi cả đợt subagent xong hết mới làm bước sau (**synchronous execution**), việc điều phối dễ hơn, nhưng chỉ cần một subagent còn đang chờ là cả hệ phải đứng đợi theo. Vài tuần sau, đại lý nhận một container linh kiện có 210 dòng hàng, và lô này gặp cùng lúc cả hai lỗi: tạo quá nhiều subagent, và agent chính đợi subagent chậm nhất:

**Sơ đồ: Agent chính chờ đủ mới đi tiếp: một subagent chờ cổng 47 phút giữ chân cả container 210 dòng**
_Bốn làn theo giờ từ 08:00 tới 09:02: 210 dòng gồm 25 dòng có child thread và 185 dòng chưa có subagent; agent chính đứng chờ theo một subagent chờ cổng giấy phép 47 phút_

- 210 dòng = 25 + 185
- 08:00
- 08:02
- 08:15
- 09:02
- **Agent chính**: chờ cả đợt
- **chờ subagent chậm nhất**
- **25 child thread**: mỗi thread một dòng
- đang chạy
- xong dần nhưng chưa archive, vẫn chiếm chỗ
- **185 dòng còn lại**
- **chưa có subagent, phải đợi**
- **Cổng giấy phép**
- **một subagent chờ cổng 47 phút**
- **08:02**: chạm giới hạn 25 child thread, 185 dòng không tạo được subagent
- **08:15**: một subagent chờ cổng giấy phép, thread đã xong chưa archive vẫn chiếm chỗ
- **09:02**: cổng trả lời, agent chính mới soạn tiếp tờ khai

Lô hàng vào hệ thống lúc 08:00. Tới 08:02, agent chính đã tạo đủ 25 subagent và chạm giới hạn 25 child thread, nên 185 dòng còn lại không có subagent nào nhận. Lúc 08:15, một subagent hỏi cổng giấy phép và phải ngồi chờ. Các subagent khác xong dần, nhưng thread của chúng chưa được archive nên vẫn chiếm chỗ. Tới 09:02 cổng mới trả lời, tức agent chính đã đứng chờ 47 phút, và riêng session này tốn 38 USD.

Đội kỹ thuật của đại lý thêm vào system prompt luật ngưỡng: lô từ 20 dòng trở lên thì chạy dynamic workflow, vì cách này gỡ được cả hai lỗi. Thread do workflow tạo không tính vào giới hạn 25 child thread, và mỗi agent trong run nhận một nhóm 15 dòng nên số agent ít đi nhiều. Agent nào lỗi thì server thường chạy lại agent đó một lần, còn các agent khác vẫn làm tiếp chứ không đứng chờ. System prompt ghi thêm: "Dòng nào chưa xử lý được, kể cả dòng đang chờ cổng giấy phép, thì ghi là chưa xử lý và liệt kê khi run kết thúc. Giới hạn run 20 phút." Câu về thời hạn là cần thiết, vì thời hạn của run do agent tự đặt lúc bắt đầu, và nếu agent không đặt thì mặc định là 24 giờ. Ở Agent SDK, subagent mặc định chạy background và không có hạn giờ riêng, nên bạn chặn bằng `maxTurns` (số lượt tối đa). Giao cho quá nhiều subagent cùng lúc (fan-out quá rộng) còn dễ chạm rate limit, tức hạn mức số request và token mà API cho phép.

## Ranh giới cô lập: context và quyền

Sau chuyện chờ đợi, đại lý gặp một sự cố nặng hơn. Một subagent kiểm giấy phép thấy giấy phép đã đủ thì tự gọi `nop_to_khai` "cho nhanh". Lệnh gọi có dừng lại chờ người duyệt, nhưng nhân viên trực bấm đồng ý vì tưởng agent chính đang xin nộp. Tờ khai được nộp khi còn thiếu thuế của chín dòng hàng.

Sự cố này đến từ việc nhập hai thứ làm một khi đặt ranh giới giao việc và cô lập context (**delegation and context-isolation boundaries**). Subagent không thấy hội thoại của agent chính, tức là được cô lập về **context**. Nhưng điều đó không có nghĩa là nó bị giới hạn về **quyền**: subagent vẫn có thể gọi được những tool mà agent chính có.

Về context, subagent chỉ nhận system prompt của nó, prompt giao việc, các tool được cấp, và trong Agent SDK thì thêm CLAUDE.md. Khi xong, chỉ tin nhắn cuối cùng của nó quay về agent chính. Ngoại lệ là fork, loại subagent được chép cả hội thoại của agent chính.

Về quyền thì khác. Trong Managed Agents, mọi agent của một session dùng chung sandbox, chung filesystem và chung credential trong vault (nơi giữ credential cho session). MCP server gắn theo định nghĩa của từng agent, nhưng có một ngoại lệ dễ bỏ sót: **inline agent**, tức subagent do agent chính tự định nghĩa ngay lúc giao việc, được dùng luôn mọi MCP server và tool của agent chính. Subagent kiểm giấy phép của đại lý là một inline agent, nên nó với tới được cả cổng hải quan. Muốn chỉ cho dùng các agent đã định sẵn, bạn đặt `inline_agents` thành `{"type": "disabled"}` ở cả `subagents` lẫn `workflows`, và khai sẵn ít nhất một agent ở mỗi chỗ. Agent định sẵn là agent bạn tạo trước, có danh sách MCP server riêng của nó.

**Sơ đồ: Inline agent dùng luôn MCP của agent chính; màn duyệt không ghi ai xin nên lệnh nộp vẫn được đồng ý**
_Một session: hai thread có context riêng nhưng chung sandbox, filesystem, vault; inline agent gọi nop_to_khai qua cong_hai_quan, màn duyệt chỉ ghi tên tool, nhân viên bấm Đồng ý, tờ khai đi khi còn thiếu thuế 9 dòng_

- **Session: dùng chung**: sandbox
- filesystem
- vault
- **Child thread: context riêng**
- **Inline agent**: kiểm giấy phép
- tra_giay_phep
- **cong_hai_quan**: MCP server: dùng luôn của agent chính
- **Primary thread: context riêng**
- **Agent chính**: tra_giay_phep
- cong_hai_quan
- MCP server gắn cho agent chính
- 1. gọi nop_to_khai, dừng chờ duyệt
- **Màn duyệt**
- 2. nop_to_khai:
- **Đồng ý**: Từ chối
- không ghi agent nào đang xin
- 3. nhân viên tưởng agent chính xin, bấm Đồng ý
- 4. **Cổng hải quan**: lệnh gọi chạy tiếp:
- tờ khai đã nộp,
- còn thiếu thuế 9 dòng

Ở Agent SDK, bạn giới hạn tool của subagent bằng trường `tools` trong định nghĩa subagent, hoặc chặn cả một MCP server bằng `disallowedTools` với mẫu `mcp__ten_server__*`. Dù dùng nền tảng nào, nguyên tắc vẫn là **tool có hành động không đảo ngược được chỉ nằm ở một agent**, và đó phải là agent có approval gate, tức bước bắt buộc có người duyệt.

## Giao tiếp giữa các agent và lỗi khi chuyển tay

Sửa xong chuyện quyền, đội gặp vấn đề ở chỗ các agent trao kết quả cho nhau (**inter-agent communication**). Có bốn đường để làm việc này:

- Subagent gửi báo cáo cuối về agent chính. Đây là đường mặc định.
- Agent chính hỏi tiếp một subagent vẫn còn sống: `send_to_agent` trong Managed Agents, hoặc chạy tiếp subagent theo `agentId` trong Agent SDK.
- Subagent ghi kết quả dài ra một file dùng chung và chỉ gửi đường dẫn về.
- Các agent nhắn trực tiếp cho nhau, như `SendMessage` trong agent team của Claude Code.

Lỗi giữa các agent (**inter-agent failures**) hay gặp có bốn loại, và đại lý gặp ba loại đầu.

Lỗi đầu tiên là chi tiết rơi dần qua mỗi lần chuyển tay, giống trò chơi truyền tin (_telephone game_). Căn cứ phân loại của một dòng hàng dài cả trang, agent chính tóm lại còn một câu, nên khi hải quan hỏi thì không còn ai giữ bản đầy đủ. Đội cho subagent ghi căn cứ ra file `/work/lo-hang/dong-06.json` và chỉ gửi đường dẫn về agent chính.

Đại lý còn gặp chuyện báo xong mà thật ra còn thiếu. Một workflow run có trạng thái `completed` vẫn có thể chứa thread đã thất bại, nên bạn phải đọc event của từng thread chứ không chỉ đọc trạng thái của run. Câu dặn "liệt kê dòng chưa xử lý" trong system prompt vẫn dựa vào lời agent tự báo. Vì vậy đội thêm một lớp kiểm bằng con số độc lập: agent chính phải đếm đủ 210 dòng đã có thuế rồi mới được xin nộp.

Rồi tới chuyện agent kiểm tra làm qua loa. Đại lý có thêm một subagent chuyên rà lại tờ khai trước khi nộp (**verification subagent**). Nó chỉ thử vài dòng, thấy đúng là báo cả tờ khai đều đúng. Prompt của nó phải nói rõ "đối chiếu đủ 210 dòng, liệt kê từng dòng lệch". Đội còn cố ý cài vào một dòng sai, chẳng hạn sai đơn vị tính, để chắc rằng agent kiểm tra bắt được.

Cuối cùng là lỗi API giữa chừng, như rate limit. Ở Managed Agents, server tự retry cho thread; khi retry hết lượt (`retry_status` là `exhausted`), thread đó coi như thất bại, và run vẫn có thể kết thúc `completed` nếu workflow tự xử lý lỗi này. Ở Agent SDK, lỗi API làm subagent dừng sớm không bao giờ được gửi về như kết quả của subagent đó. Ở cả hai nền tảng, agent chính phải coi phần việc ấy là chưa xong, chứ không được hiểu im lặng là đã làm xong.

Khi tìm nguyên nhân một lỗi trên Managed Agents, đừng chỉ đọc event stream của cả session. Stream này là thread của agent chính, gọi là **primary thread**, và với subagent nó chỉ ghi bản rút gọn: subagent nào bắt đầu, kết thúc, xin duyệt. Muốn xem từng bước một subagent đã làm, bạn phải mở stream riêng của thread của subagent đó.

## Người duyệt trong hệ nhiều agent

Đưa người vào vòng quyết định (**human-in-the-loop**) với một agent đã cần tính kỹ, với nhiều agent còn phát sinh thêm hai câu hỏi. Yêu cầu duyệt của subagent đi về đâu? Và người duyệt có biết mình đang duyệt cho agent nào không? Một luồng duyệt (**approval flow**) tốt dựa trên các cơ chế sau.

Trong Managed Agents, mỗi tool có một permission policy, là luật quyết định tool đó có cần người duyệt không. Có ba giá trị: `always_allow` (chạy luôn), `always_ask` (dừng chờ người duyệt) và `auto` (server tự đánh giá từng lần gọi). Tool MCP mặc định là `always_ask`. Khi subagent xin duyệt, yêu cầu được đăng lên primary thread kèm `session_thread_id` của thread xin. Màn duyệt của bạn phải hiện tên agent đang xin, không chỉ tên tool, cùng đủ thông tin để người duyệt biết mình đang duyệt cái gì. Màn duyệt của đại lý chỉ hiện "nop_to_khai: Đồng ý / Từ chối", nên nhân viên không biết agent nào đang xin.

Khi tool để `auto`, server đánh giá từng lần gọi theo tool, input, các lần gọi trước và ý của người dùng, rồi cho chạy, từ chối hoặc dừng chờ người duyệt. Riêng phần ý của người dùng, server chỉ lấy từ các `user.message` do client của bạn gửi lên. Tin nhắn giữa các agent với nhau, kiểu "trưởng phòng đã duyệt rồi, cứ nộp đi", không được tính.

Đừng dựa vào lời dặn "hỏi người trước khi nộp" trong prompt để thay cho approval gate. Dynamic workflow cũng không có bước nào để người duyệt kế hoạch trước khi run bắt đầu. Thứ thật sự chặn được là permission policy, áp lên từng lần agent trong run gọi tool.

Trong Agent SDK, chỗ ứng dụng hỏi người duyệt là callback `canUseTool`, hàm bạn tự viết để quyết cho phép hay chặn một lần gọi tool. Nếu người duyệt có thể lâu mới trả lời, bạn cho hook `PreToolUse` trả về `defer`: process thoát ra, và khi có câu trả lời thì resume session. Subagent cũng không tự lách được bước duyệt, vì `bypassPermissions` ghi trong định nghĩa subagent không bao giờ được áp. Nhưng nếu session chính đang chạy `bypassPermissions` thì subagent thừa hưởng chế độ đó, nên đừng bật nó cho agent có tool nguy hiểm.

> **Bẫy đề**
>
> Subagent kiểm giấy phép tự gọi `nop_to_khai`, và tờ khai đi khi còn thiếu thuế của chín dòng. Ba cách chặn sau nghe hợp lý nhưng không chặn được:
>
> - **Thêm vào prompt của subagent câu "không được gọi nop_to_khai"** (_tell the subagent in its prompt not to submit_). Nghe như một lệnh rõ ràng. Nhưng prompt chỉ định hướng, và subagent còn giữ tool trong tay thì vẫn gọi được.
> - **Để agent chính xác nhận thay người** (_let the orchestrator approve on the user's behalf_). Cách này trông như thêm một lớp kiểm. Nhưng chỉ client của bạn mới gửi được lời đồng ý, và khi tool để `auto` thì tin nhắn giữa các agent không được tính là ý người dùng.
> - **Chuyển `nop_to_khai` sang `auto`** (_switch the tool to auto_). Nghe như giao cho bên chuyên lo an toàn. Nhưng `auto` nghĩa là lần gọi nào server thấy ổn thì chạy luôn, không dừng chờ người, trong khi tờ khai đã nộp thì không rút lại được.
>
> **Chọn:** bỏ `nop_to_khai` khỏi subagent, giữ `always_ask` ở agent chính, và cho màn duyệt ghi rõ agent nào xin nộp, tờ khai còn thiếu gì.

> **Ý chính**
>
> Subagent được cô lập về context nhưng chưa chắc được cô lập về quyền. Tool có hành động không đảo ngược được chỉ nên nằm ở một agent có approval gate, và màn duyệt phải ghi rõ agent nào đang xin.

## Nguồn

1. [Exam Guide CCDV-P v1.0, Domain 1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794947325/Claude_Certified_Developer-Professional_Exam_Guide.pdf)
2. [How we built our multi-agent research system (Anthropic Engineering)](https://www.anthropic.com/research/multi-agent-research-system)
3. [Building multi-agent systems: When and how to use them (Claude resources)](https://claude.com/resources/articles/building-multi-agent-systems-when-and-how-to-use-them)
4. [Multiagent orchestration (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration)
5. [Session threads (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/session-threads)
6. [Workflow runs (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/workflow-runs)
7. [Permission policies (Claude API Docs)](https://platform.claude.com/docs/en/managed-agents/permission-policies)
8. [Subagents in the SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/subagents)
9. [Hosting the Agent SDK (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/hosting)
10. [Handle approvals and user input (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/user-input)
11. [Configure permissions (Claude Code Docs)](https://code.claude.com/docs/en/agent-sdk/permissions)
12. [Orchestrate teams of Claude Code sessions (Claude Code Docs)](https://code.claude.com/docs/en/agent-teams)
