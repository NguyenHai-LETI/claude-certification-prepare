---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-3-goi-subagent-va-truyen-context
ngay_tai: 2026-11-27
tieu_de: Gọi subagent, truyền context và chạy song song
---

Domain 1: Agentic Architecture & Orchestration · Task 1.3

# Gọi subagent, truyền context và chạy song song

Cách agent điều phối gọi subagent qua tool Agent, ghi đủ context vào prompt giao việc, giữ nguồn khi chuyển kết quả, chạy song song và fork session.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Cấu hình agent điều phối để gọi được subagent, và khai báo từng subagent bằng AgentDefinition
- Ghi đủ kết quả của các agent trước vào prompt giao việc, vì subagent không tự thấy context của agent điều phối
- Chuyển kết quả giữa các agent bằng dữ liệu có cấu trúc để không mất nguồn trích dẫn
- Cho nhiều subagent chạy song song bằng cách gọi tool Agent nhiều lần trong cùng một phản hồi
- Viết prompt giao việc bằng mục tiêu và tiêu chí chất lượng, và dùng fork để thử hai hướng từ cùng một phân tích

Subagent là một agent được agent khác, gọi là agent điều phối, giao cho một phần việc. Khi giao việc kiểu này, có ba chỗ hay hỏng. Có khi lời gọi subagent không chạy vì cấu hình sai. Có khi subagent chạy được nhưng không biết những gì agent điều phối đã biết. Cũng có khi kết quả quay về mà mất luôn dấu nguồn. Bài đi qua từng chỗ, rồi tới cách cho nhiều subagent chạy cùng lúc và cách thử hai hướng từ cùng một điểm xuất phát.

Agent điều phối tạo subagent bằng cách gọi một tool. Trong đề thi, tool này tên **Task**, và đề nói `allowedTools` của agent điều phối phải có `"Task"`. Trong Agent SDK, bộ thư viện của Anthropic để viết agent chạy trên Claude, tool này nay tên `Agent`. Mỗi loại subagent được khai báo bằng một **AgentDefinition**, gồm mô tả, system prompt và giới hạn tool. Mọi thứ subagent cần biết phải ghi rõ trong prompt giao việc (**explicitly provided in the prompt**), vì subagent không tự thấy context của agent điều phối. Context ở đây là toàn bộ những gì model nhìn thấy khi làm việc: hội thoại, kết quả tool, tài liệu đã đọc.

**Sơ đồ: Agent điều phối chỉ gửi đi prompt, chỉ nhận về câu trả lời cuối, và fork session của nó thành hai**
_Bản đồ bài: agent điều phối có allowed_tools gồm Agent (đề gọi là Task) và lịch sử riêng mà subagent không thấy. Mũi tên liền là gửi tới: nó gửi prompt giao việc chép đủ kết quả trước, nêu mục tiêu và tiêu chí chất lượng tới subagent khai báo bằng AgentDefinition (description, prompt, tools); nhiều lời gọi Agent trong một phản hồi thì các subagent chạy song song. Subagent bắt đầu lại mỗi lần gọi và chỉ gửi về câu trả lời cuối, claim và source tách field để nguồn đi nguyên. Bên dưới, mũi tên nét đứt là fork: session của agent điều phối, có session_id, tách thành session gốc giữ ID đi hướng 1 và session fork có ID mới đi hướng 2; chỉ tách lịch sử hội thoại, không tách file_

- **Agent điều phối**: giao việc, gộp kết quả
- allowed_tools
- có Agent (đề: Task)
- lịch sử riêng,
- subagent không thấy
- **Gửi đi: prompt giao việc**: kết quả trước, chép đủ
- mục tiêu, tiêu chí chất lượng
- nhiều lời gọi Agent trong
- một phản hồi: chạy song song
- **SUBAGENT**
- **subagent**: AgentDefinition gồm
- description, prompt,
- tools: giới hạn tool
- **subagent khác**: bắt đầu lại mỗi lần gọi
- **Gửi về: chỉ câu trả lời cuối**: claim + source: nguồn đi nguyên
- **FORK SESSION**: nét đứt: tách lịch sử hội thoại, không tách file
- **Agent điều phối**: session có session_id
- session gốc: giữ ID, đi tiếp hướng 1
- fork_session=True: ID mới, đi hướng 2

## Ví dụ xuyên suốt: bản tin doanh nghiệp của một công ty chứng khoán

Phòng phân tích của một công ty chứng khoán có 5 chuyên viên, mỗi ngày viết khoảng 12 bản tin ngắn về các doanh nghiệp niêm yết cho khách hàng cá nhân. Đội công nghệ dựng một hệ thống bằng Agent SDK, chạy trên server. Agent điều phối nhận yêu cầu của chuyên viên, như "viết bản tin về kết quả quý 3 của mã TPM" (một mã giả định), rồi giao việc cho ba subagent: `tim-tin` tìm tin tức và công bố thông tin trên web, `doc-bctc` đọc báo cáo tài chính (BCTC) dạng PDF, và `viet-ban-tin` viết bản tin. Trước khi gửi khách, bộ phận tuân thủ kiểm tra từng con số trong bản tin, nên số nào cũng phải ghi rõ lấy từ tài liệu nào, trang mấy.

## Agent điều phối gọi subagent qua tool Agent

Bản đầu của hệ thống chỉ có một agent tự làm hết. Để nó không tự tách việc ra subagent, đội thêm `Agent` vào `disallowed_tools`. Khi chuyển sang mô hình có ba subagent, đội viết đủ `AgentDefinition` nhưng quên bỏ dòng đó. Trong 30 yêu cầu chạy thử tuần đầu, không subagent nào chạy. Log không có lỗi nào: agent điều phối viết "Mình sẽ nhờ subagent đọc báo cáo tài chính quý 3", rồi tự viết luôn một bản tin không có số liệu.

Agent điều phối không tạo subagent bằng code. Nó gọi một tool, giống như gọi tool tìm kiếm, và SDK chạy subagent khi thấy lời gọi đó. Tên `disallowed_tools` có trong danh sách thì SDK bỏ định nghĩa tool đó khỏi request, nên Claude không còn tool nào để gọi. Nó vẫn đọc được mô tả các subagent nên vẫn nói được sẽ giao việc gì, nhưng không gọi được, và log không có lỗi vì chưa hề có lời gọi nào thất bại.

Đề thi viết luật này thành "`allowedTools` phải có `Task`" (**allowedTools**). Với Agent SDK hiện nay, lời gọi `Agent` vốn không cần duyệt, nên nó chạy cả khi không có tên trong `allowed_tools`, kể cả ở permission mode `dontAsk`. Dù vậy, các ví dụ chính thức của SDK vẫn ghi `Agent` vào `allowed_tools` cho rõ ý. Đội bỏ `Agent` khỏi `disallowed_tools` và thêm nó vào `allowed_tools`, từ đó các subagent chạy bình thường. Có một chỗ dễ nhầm khi đọc log: block `tool_use` ghi tên tool là `"Agent"`, còn danh sách tool trong message `system:init` vẫn ghi `"Task"`, và các bản Claude Code trước v2.1.63 cũng ghi `"Task"` trong `tool_use`. Code lọc log nên so cả hai tên.

Mỗi subagent được khai báo bằng một `AgentDefinition`. Các field hay dùng là:

- `description`: mô tả khi nào nên dùng subagent này. Agent điều phối đọc mô tả để quyết định giao việc nào cho ai, nên mô tả phải rõ và cụ thể.
- `prompt`: system prompt của subagent, nói vai trò và cách làm việc của nó.
- `tools`: danh sách tool subagent được dùng. Nếu bỏ trống field này, subagent được dùng mọi tool mà agent điều phối có. `doc-bctc` chỉ cần đọc file, nên đội chỉ cho nó `Read`.
- `model`: model riêng cho subagent, nếu muốn khác agent điều phối.

```python
options = ClaudeAgentOptions(
    allowed_tools=["WebSearch", "Read", "Agent"],
    permission_mode="dontAsk",
    agents={
        "doc-bctc": AgentDefinition(
            description="Đọc báo cáo tài chính PDF và trích số liệu kèm số trang.",
            prompt="Bạn là chuyên viên đọc báo cáo tài chính...",
            tools=["Read"],
        ),
    },
)
```

Hệ thống chạy trên server, không có ai bấm duyệt, nên đội đặt permission mode là `dontAsk`. Ở mode này, lời gọi nào cần người duyệt mà không có trong danh sách duyệt sẵn thì bị từ chối luôn. Lưu ý `tools` và `allowed_tools` làm hai việc khác nhau. `tools` trong `AgentDefinition` quyết định subagent có những tool nào, nhưng không tự duyệt sẵn lời gọi. Còn `allowed_tools` trong options là danh sách tool được duyệt sẵn. Tool không có tên trong đó vẫn dùng được, nhưng lời gọi cần duyệt thì phải qua permission mode.

> **Bẫy đề**
>
> Agent điều phối đã có `AgentDefinition` cho cả ba subagent, mỗi subagent có mô tả và giới hạn tool phù hợp. Khi chạy thử, nó viết "Mình sẽ nhờ subagent đọc báo cáo tài chính" mà không subagent nào chạy, và log không có lỗi. Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **System prompt của agent điều phối không liệt kê các subagent** (_the coordinator's prompt does not list the available subagent types_). Agent không biết có subagent thì sẽ không gọi, nên đáp án này dễ được chọn. Thực ra agent điều phối đã nhắc đúng việc cần giao, tức là nó biết có subagent đó.
> - **`max_tokens` quá thấp nên lời gọi bị cắt** (_max_tokens too low, so the call is truncated_). Phản hồi đúng là có thể bị cắt giữa chừng. Khi đó lần gọi dừng với `stop_reason` là `max_tokens`, còn ở đây agent điều phối viết trọn câu rồi tự kết thúc.
> - **Phải cấu hình chuyển context sang subagent** (_configure explicit context forwarding in ClaudeAgentOptions_). Thiếu context làm subagent làm sai việc, nhưng subagent phải được gọi trước đã. Ở đây nó chưa hề chạy.
>
> **Chọn:** agent điều phối không có quyền dùng tool gọi subagent. Đề viết là `allowedTools` thiếu `"Task"`, nên nó nói được việc giao mà không gọi được.

## Subagent nhận context qua đâu

Gọi được subagent rồi, đội gặp lỗi tiếp theo. `tim-tin` và `doc-bctc` chạy xong, agent điều phối gọi `viet-ban-tin` với prompt "Viết bản tin dựa trên các kết quả nghiên cứu ở trên". `viet-ban-tin` trả lời rằng nó không viết được, vì không ai đưa cho nó số liệu nào. Ở một lần khác, nó viết được nhưng số liệu chung chung, không khớp gì với báo cáo tài chính của TPM.

Subagent bắt đầu mà không biết gì về những việc agent điều phối đã làm. Nó không thấy lịch sử hội thoại, không thấy kết quả các tool agent điều phối đã gọi, không thấy kết quả của các subagent khác. Lúc khởi động, subagent chỉ có system prompt và bộ tool khai báo cho nó, file CLAUDE.md của dự án nếu SDK có nạp, cộng với chuỗi prompt agent điều phối truyền vào lời gọi tool `Agent`. Trong các thứ đó, chỉ chuỗi prompt là đi từ agent điều phối sang. Mặc định, mỗi lần gọi subagent cũng bắt đầu lại từ đầu, nên lần trước `viet-ban-tin` có đọc gì thì lần sau nó cũng không nhớ. Vì vậy chữ "ở trên" trong prompt không trỏ tới đâu cả.

**Sơ đồ: Từ agent điều phối, chỉ chuỗi prompt sang được subagent, nên “ở trên” trỏ vào chỗ trống**
_Ranh giới context: lịch sử hội thoại, kết quả tool và kết quả subagent khác của agent điều phối không sang được viet-ban-tin; chỉ prompt giao việc đi qua; prompt sai nói “ở trên” trỏ vào phần trống, prompt đúng mang sẵn số liệu và nguồn_

- **CONTEXT CỦA AGENT ĐIỀU PHỐI**
- **Lịch sử hội thoại**
- **Kết quả tool đã gọi**
- **Kết quả subagent khác**: không sang được
- **Prompt giao việc**: chép số liệu, tin, nguồn
- chỉ phần subagent cần
- chỉ prompt đi qua
- **CONTEXT CỦA SUBAGENT**
- **viet-ban-tin**: system prompt, tools
- không có hội thoại,
- không có kết quả nào
- **“…kết quả ở trên”**: trỏ vào chỗ trống
- **Prompt có số liệu, nguồn**: viết được bản tin

Cách sửa là chép thẳng kết quả của `tim-tin` và `doc-bctc` vào prompt giao việc cho `viet-ban-tin` (**including complete findings from prior agents**), gồm các con số doanh thu, lợi nhuận và các tin quan trọng, kèm nguồn. Nhưng không phải chép tất cả. Agent điều phối chỉ đưa những kết quả và tham số mà subagent đó cần cho việc của nó. Nếu agent điều phối đổ cả context của mình vào prompt, subagent phải tự lọc phần cần dùng giữa rất nhiều thứ không liên quan. Khi đó lợi ích của việc cho subagent một context riêng, gọn, chỉ chứa đúng việc của nó, cũng mất.

> **Bẫy đề**
>
> `tim-tin` và `doc-bctc` đã xong, và agent điều phối cần giao cho `viet-ban-tin` viết bản tin. Ba cách đưa thông tin sau nghe hợp lý nhưng sai:
>
> - **Viết "dựa trên các kết quả ở trên" vì subagent thấy được hội thoại** (_the subagent inherits the coordinator's conversation history_). Câu này tự nhiên như dặn một đồng nghiệp ngồi cạnh. Nhưng subagent không thấy hội thoại nào, và đây chính là lý do `viet-ban-tin` báo không có số liệu.
> - **Ghi kết quả vào một file chung để mọi agent cùng đọc** (_a shared scratchpad file all agents read_). Đỡ phải chép vào prompt thật, nhưng subagent phải tự tìm trong file phần nào thuộc việc của mình, và agent điều phối không còn chọn được đúng phần cần đưa.
> - **Đưa toàn bộ context của agent điều phối vào prompt** (_pass the entire coordinator context window_). Thông tin thì đủ, có điều phần lớn không liên quan tới bản tin, nên subagent phải tự lọc.
>
> **Chọn:** chép thẳng vào prompt giao việc những kết quả và tham số subagent cần cho đúng việc của nó.

## Giữ nguồn khi chuyển kết quả giữa các agent

Bản tin đầu tiên viết ra được thì bị bộ phận tuân thủ trả về. Bản tin ghi "doanh thu quý 3 tăng 18% so với cùng kỳ" nhưng không cho biết con số lấy từ đâu. `doc-bctc` có ghi số trang khi đọc báo cáo, nhưng nó viết kết quả thành một đoạn văn tóm tắt. Agent điều phối tóm tắt đoạn đó thêm một lần trước khi đưa cho `viet-ban-tin`, và tên tài liệu cùng số trang rơi mất trên đường.

**Sơ đồ: Qua hai lần tóm tắt, "tăng 18%" mất nguồn, còn field source riêng đưa trang 4 tới bản tin**

✗ _Kết quả là đoạn văn tóm tắt_
1. doc-bctc đọc BCTC quý 3 của TPM, ghi được trang 4
   ↓ _tóm tắt lần 1: doc-bctc viết kết quả thành đoạn văn_
2. Agent điều phối nhận đoạn văn "tăng **18%**", nguồn lẫn trong câu
   ↓ _tóm tắt lần 2: agent điều phối rút gọn đoạn văn_
3. viet-ban-tin chỉ nhận "doanh thu quý 3 tăng **18%**"
4. **Bị trả về** bộ phận tuân thủ không biết số lấy từ đâu

✓ _Dữ liệu có cấu trúc_
1. doc-bctc đọc BCTC quý 3 của TPM, ghi được trang 4
   ↓ _doc-bctc trả về hai field riêng_
2. Agent điều phối nhận **claim** "tăng 18%" và **source** "BCTC quý 3 của TPM", trang 4
   ↓ _agent điều phối chỉ rút gọn claim, source chuyển nguyên_
3. viet-ban-tin nhận đủ tên tài liệu và **trang 4**
4. **Có nguồn** mỗi con số đều ghi rõ lấy từ tài liệu nào, trang mấy

Mỗi lần một agent tóm tắt văn bản, metadata, tức các thông tin đi kèm như đường link, tên tài liệu hay số trang, dễ bị coi là chi tiết thừa và bị lược đi. Cách giữ chúng là tách nội dung và metadata thành các field riêng trong dữ liệu có cấu trúc (**structured data formats to separate content from metadata**). Đội đổi để mỗi subagent trả về một danh sách kiểu như sau:

```json
[
  {"claim": "Doanh thu quý 3 tăng 18% so với cùng kỳ",
   "source": {"document": "BCTC quý 3 của TPM", "page": 4, "url": null}},
  {"claim": "Giá nguyên liệu chính giảm trong quý 3",
   "source": {"document": "Tin ngành trên báo điện tử", "page": null, "url": "https://..."}}
]
```

Agent nào muốn tóm tắt thì chỉ rút gọn field `claim`, còn field `source` được chuyển nguyên. Đến lượt `viet-ban-tin`, nó vẫn có đủ tên tài liệu và số trang để ghi nguồn cho từng con số.

> **Trong đề chọn gì**
>
> Đề có thể tả một báo cáo cuối có nhận định mà không có trích dẫn, vì thông tin nguồn đã mất qua các bước tóm tắt. Gặp câu như vậy, hãy chọn đáp án cho mỗi agent trả về dữ liệu có cấu trúc, trong đó nội dung và nguồn (URL, tên tài liệu, số trang) nằm ở các field riêng. Nếu chỉ dặn agent ghi nguồn lẫn vào đoạn tóm tắt, bước tóm tắt sau vẫn có thể lược mất nguồn. Nếu bỏ hẳn bước tóm tắt, agent phải chuyển nguyên những kết quả thô rất dài. Còn đợi viết xong mới hỏi lại agent tìm tin là sửa lỗi ở sai chỗ.

## Cho nhiều subagent chạy cùng lúc

Khi hệ thống đã cho ra bản tin đúng, chuyên viên than chờ lâu. Log cho thấy agent điều phối gọi `tim-tin`, chờ báo cáo của nó về sau khoảng 40 giây, rồi mới gọi `doc-bctc` ở phản hồi sau và chờ thêm khoảng 70 giây. Hai việc này không cần kết quả của nhau, vậy mà thời gian chờ vẫn cộng dồn, khoảng 110 giây.

**Sơ đồ: Gọi lần lượt thì chờ khoảng 110 giây, gọi trong một phản hồi thì chừng 70 giây**
_Thanh thời gian: gọi lần lượt thì tim-tin khoảng 40 giây xong mới tới doc-bctc khoảng 70 giây, cộng dồn khoảng 110 giây; gọi hai lời gọi Agent trong một phản hồi thì hai thanh bắt đầu cùng lúc, chờ chừng 70 giây_

- **GỌI LẦN LƯỢT**: chờ xong mới gọi tiếp
- **tim-tin**: khoảng 40 giây
- **doc-bctc**: khoảng 70 giây
- **cộng dồn: khoảng 110 giây**
- **GỌI TRONG MỘT PHẢN HỒI**: hai lời gọi Agent cùng lúc
- **tim-tin**: khoảng 40 giây
- **doc-bctc**: khoảng 70 giây
- **chừng 70 giây, bằng subagent chậm nhất**

Muốn các subagent chạy song song, agent điều phối phải gọi tool `Agent` nhiều lần trong cùng một phản hồi (**multiple Task tool calls in a single coordinator response**), tức trong cùng một message `assistant`, mỗi lời gọi cho một subagent. Trong Agent SDK hiện nay, subagent mặc định chạy ở background: lời gọi trả về ngay, còn báo cáo của subagent tới ở lượt sau. Nhưng nếu agent điều phối đợi báo cáo của `tim-tin` rồi mới gọi `doc-bctc`, như log của đội cho thấy, hai việc vẫn nối đuôi nhau. Đội sửa để agent điều phối giao hai việc độc lập này trong cùng một phản hồi, với hai lời gọi `Agent`. Thời gian chờ còn chừng 70 giây, bằng subagent chậm nhất.

Gọi nhiều subagent cùng lúc cũng có ích khi một việc lớn chia được thành nhiều phần độc lập. Một chuyên viên muốn so kết quả kinh doanh của TPM qua 4 quý gần nhất, và `doc-bctc` đọc lần lượt 4 báo cáo nên rất chậm. Agent điều phối giao cho 4 subagent `doc-bctc` cùng lúc, mỗi subagent đọc một báo cáo quý, rồi tự gộp kết quả trước khi chuyển cho `viet-ban-tin`. Việc chia này do agent điều phối làm, nên mọi lời gọi vẫn đi qua nó và vẫn theo dõi được trong log.

> **Trong đề chọn gì**
>
> Câu hỏi "làm sao cho agent điều phối chạy nhiều subagent song song" có đáp án là gọi tool Task (nay là `Agent`) nhiều lần trong cùng một phản hồi. Đừng chọn dựng một tầng bất đồng bộ bên ngoài agent, đổi subagent sang model nhỏ hơn cho nhanh, hay chỉ thêm vào system prompt một đoạn giải thích lợi ích của chạy song song. Có dạng câu khác: một subagent phải đọc lần lượt nhiều tài liệu độc lập nên chậm, và đề muốn giảm độ trễ mà vẫn theo dõi được hệ thống. Đáp án là để agent điều phối tạo nhiều subagent chạy song song, mỗi subagent lo một phần, rồi agent điều phối gộp kết quả. Đừng chọn message queue, agent gọi agent lồng nhiều tầng, hay cho subagent tự tạo subagent của riêng nó.

## Viết prompt giao việc bằng mục tiêu và tiêu chí chất lượng

Chạy nhanh rồi, đội quay sang chất lượng của từng subagent, bắt đầu từ `tim-tin`. Prompt mà agent điều phối dùng để giao việc cho nó là một danh sách đánh số: "Bước 1, tìm 5 bài báo mới nhất về TPM. Bước 2, mở từng bài. Bước 3, lấy ngày đăng. Bước 4, trả về một bảng." Một tuần sau, chuyên viên thấy `tim-tin` vẫn trả đủ 5 bài dù 2 bài chỉ là tin đăng lại của nhau, và vẫn bỏ qua nghị quyết hội đồng quản trị quan trọng nhất vì nó không phải là "bài báo".

Khi chỉ có danh sách bước (_step-by-step procedural instructions_), subagent làm đúng từng bước nhưng lỡ mất mục tiêu. Gặp tình huống không có trong danh sách, như nguồn trùng nhau hay nguồn tốt nhất lại không phải bài báo, nó không có căn cứ gì để làm khác đi. Cách tốt hơn là giao mục tiêu nghiên cứu và tiêu chí chất lượng (**research goals and quality criteria**), rồi để subagent tự quyết cách làm. Đội viết lại prompt giao việc cho `tim-tin` như sau: "Tìm những thông tin công khai trong 30 ngày qua có thể ảnh hưởng tới kết quả kinh doanh của TPM. Ưu tiên nguồn gốc của tin, như nghị quyết hay công bố thông tin của chính doanh nghiệp. Bỏ tin đăng lại. Mỗi thông tin ghi ngày công bố và nguồn. Báo rõ nếu không tìm thấy gì đáng kể."

Giao việc bằng mục tiêu và tiêu chí không có nghĩa là viết prompt giao việc thật ngắn. Anthropic từng dựng một hệ thống nhiều agent để nghiên cứu một chủ đề trên web. Khi agent điều phối trong hệ thống đó chỉ giao một câu kiểu "nghiên cứu tình trạng thiếu chip", các subagent hiểu sai việc hoặc tìm trùng nhau. Mỗi việc giao cần đủ mục tiêu, dạng kết quả cần trả về, nên dùng tool và nguồn nào, và ranh giới của việc.

> **Bẫy đề**
>
> Agent điều phối giao cho `tim-tin` các bước rất chi tiết, kể cả câu tìm kiếm cụ thể, và subagent hay hỏng khi gặp tình huống ngoài dự tính. Làm sao để subagent xoay xở tốt hơn khi gặp tình huống lạ? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Bỏ hết chi tiết, chỉ giao "tìm hiểu kỹ về TPM"** (_a simple goal like "research it thoroughly"_). Nghe như trả lại tự do cho subagent. Nhưng không có tiêu chí chất lượng thì subagent không biết thế nào là đủ, thế nào là nguồn tốt.
> - **Thêm chỉ dẫn dự phòng vào danh sách bước** (_add explicit fallback instructions_). Mỗi chỉ dẫn dự phòng chỉ cứu được tình huống đã lường trước. Gặp một tình huống khác chưa có trong danh sách, subagent lại kẹt.
> - **Xếp việc thành hai loại rồi dùng hai bộ chỉ dẫn** (_classify requests and use different instruction sets_). Chia hai loại thì có hai bộ chỉ dẫn, nhưng mỗi bộ vẫn là một danh sách bước cứng, nên tình huống nằm ngoài danh sách vẫn làm subagent kẹt.
>
> **Chọn:** nêu mục tiêu nghiên cứu và tiêu chí chất lượng (nguồn nào được ưu tiên, độ bao phủ, dạng kết quả), rồi để subagent tự quyết cách làm.

## Fork để thử hai hướng từ cùng một phân tích

Sau khi agent điều phối phân tích xong kết quả quý 3 của TPM, một chuyên viên muốn viết hai bản định giá, một theo hệ số giá trên lợi nhuận (P/E) và một theo dòng tiền chiết khấu (DCF), để so xem hai cách cho kết quả lệch nhau bao nhiêu. Chạy lại phân tích từ đầu cho mỗi bản thì tốn thêm thời gian và token. Viết tiếp bản thứ hai trong cùng session thì bản thứ nhất lẫn vào context của bản thứ hai.

Fork giải quyết đúng chuyện này (**fork-based session management**). Session là một cuộc làm việc với agent, có lịch sử riêng. Fork tạo một session mới, bắt đầu bằng bản sao lịch sử của session gốc, rồi từ đó đi riêng. Session fork có session ID riêng, còn session gốc giữ nguyên ID và lịch sử. Kết quả là hai session độc lập, và mỗi session đều resume (chạy tiếp) riêng được. Trong Agent SDK, bạn lấy `session_id` của lần chạy phân tích, rồi gọi `query()` với `resume` là ID đó và `fork_session=True`. Chuyên viên chạy tiếp session gốc với cách định giá P/E, còn session fork thì chạy với cách DCF. Cả hai bắt đầu từ cùng một phân tích quý 3, không session nào thấy những gì session kia viết sau đó.

Fork chỉ tách lịch sử hội thoại, không tách file trên ổ đĩa. Nếu agent ở một nhánh sửa file, file đó bị sửa thật, và session khác làm việc trong cùng thư mục cũng thấy thay đổi.

> **Ý chính**
>
> Muốn thử nhiều hướng khác nhau từ cùng một phân tích ban đầu, hãy fork session thay vì chạy lại từ đầu hay viết tiếp chồng lên session cũ.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Subagents in the SDK (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/subagents)
3. [Configure permissions (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/permissions)
4. [Work with sessions (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/sessions)
5. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/research/multi-agent-research-system)
