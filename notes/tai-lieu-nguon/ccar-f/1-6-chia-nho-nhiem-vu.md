---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/1-6-chia-nho-nhiem-vu
ngay_tai: 2026-11-27
tieu_de: Chia nhỏ nhiệm vụ phức tạp
---

Domain 1: Agentic Architecture & Orchestration · Task 1.6

# Chia nhỏ nhiệm vụ phức tạp

Khi nào chia việc thành chuỗi bước cố định (prompt chaining), khi nào để agent chia dần theo phát hiện, và cách tách một lần review PR lớn.

- 16 phút đọc
- Đối chiếu docs 22/11/2026
- 6 nguồn

## Đọc xong bạn nắm được

- Phân biệt chuỗi bước cố định với cách chia việc dần theo những gì vừa phát hiện
- Dùng prompt chaining cho việc review có các mặt biết trước
- Tách review PR nhiều file thành bước xem riêng từng file và một bước xem liên kết giữa các file
- Để agent tự sinh việc tiếp theo khi điều tra một lỗi chưa biết nằm ở đâu
- Lập kế hoạch có ưu tiên cho việc mở như viết test cho phần code cũ

Giao cho Claude một việc lớn trong một lần gọi thường cho kết quả không đều, chỗ làm kỹ, chỗ làm qua loa. Cách sửa là chia nhỏ, nhưng chia thế nào thì tuỳ loại việc. Khi nào nên viết sẵn các bước từ đầu, và khi nào nên để agent tự quyết bước tiếp theo dựa trên thứ nó vừa tìm thấy?

Có hai cách chia chính. Cách thứ nhất là chuỗi bước cố định (**fixed sequential pipeline**), còn gọi là **prompt chaining**. Code định sẵn các bước, và ở mỗi lần gọi, Claude xử lý kết quả của lần gọi trước. Cách thứ hai là chia dần theo phát hiện (**dynamic adaptive decomposition**). Agent làm một bước, xem thứ vừa tìm thấy (**intermediate findings**), rồi mới quyết định việc tiếp theo. Bài sẽ đi qua từng cách, và thêm một kiểu chia riêng cho lúc review PR lớn.

**Sơ đồ: Biết trước các bước thì viết sẵn chuỗi cố định, chưa biết thì để agent sinh việc từ từng phát hiện**
_Bản đồ bài: chuỗi bước cố định (prompt chaining) gồm các lần gọi nối nhau, giữa hai lần gọi có gate do code kiểm; kiểu tách cho PR lớn gồm bước xem riêng từng file và một agent xem liên kết giữa các file; chia dần theo phát hiện là vòng agent làm một bước, xem phát hiện rồi sinh việc tiếp theo, dùng cho lỗi chưa biết nằm đâu và việc mở chưa biết phạm vi_

- **CHUỖI BƯỚC CỐ ĐỊNH (FIXED SEQUENTIAL PIPELINE)**: prompt chaining: code định sẵn các bước, mỗi lần gọi nhận kết quả của lần trước
- **Lần gọi 1**: một việc dễ
- **Lần gọi 2**: nhận kết quả 1
- **Lần gọi 3**: nhận kết quả 2
- **Lần gọi gộp**: bản cuối
- gate
- gate
- gate
- gate: code kiểm kết quả đúng dạng chưa, sai thì gọi lại bước đó
- **PR LỚN: TÁCH HAI LOẠI LẦN GỌI**
- 1. **per-file local analysis**: mỗi file một lần gọi, cùng độ kỹ
- file 1
- file 2
- file 3
- …
- file n
- 2. **cross-file integration pass**: agent có Read, Grep, Glob
- lần theo chỗ gọi hàm, kể cả file ngoài PR
- **CHIA DẦN THEO PHÁT HIỆN**: dynamic adaptive decomposition
- **Làm một bước**: agent quyết định
- **Phát hiện**: thứ vừa tìm thấy
- phát hiện sinh ra việc tiếp theo
- **Lỗi chưa biết nằm đâu**: adaptive investigation plan
- **Việc mở, chưa biết phạm vi**: map structure → prioritized plan

## Ví dụ xuyên suốt: phần mềm bán hàng của một chuỗi nhà thuốc

Một chuỗi 40 nhà thuốc dùng phần mềm bán hàng tự viết bằng Python, quản lý thuốc theo lô và hạn dùng, in hoá đơn và trừ kho sau mỗi lần bán. Mỗi lần bán đi qua bốn phần do các nhóm khác nhau viết: app bán hàng ở quầy, API nhận đơn, một message queue và job trừ kho. Đội phần mềm có 6 dev, dùng Claude theo hai cách. Một pipeline gọi Claude API và Agent SDK để review mọi pull request (PR), bản review được đăng lên PR sau khi PR đã mở. Còn hằng ngày, dev dùng Claude Code để điều tra lỗi và viết test.

## Hai cách chia việc

Chuỗi bước cố định hợp với việc mà bạn biết trước nó gồm những bước nào. Với prompt chaining, mỗi bước là một lần gọi Claude, và lần gọi sau nhận kết quả của lần gọi trước. Giữa hai bước, code có thể kiểm tra kết quả để chắc quy trình vẫn đi đúng hướng. Chỗ kiểm này gọi là gate. Cách này chậm hơn vì phải gọi nhiều lần, nhưng đổi lại chính xác hơn, vì mỗi lần gọi chỉ phải làm một việc dễ.

Chia dần theo phát hiện hợp với việc mà không ai đoán trước được cần làm những bước nào. Một ví dụ của cách này là kiểu orchestrator-workers. Một lần gọi Claude đóng vai điều phối, tự chia việc tuỳ theo từng đầu vào, giao các việc con cho những lần gọi khác rồi gom kết quả lại. Các việc con không định sẵn, mà sinh ra từ chính thứ đang xử lý. Một agent điều tra lỗi cũng làm như vậy, vì mỗi file nó đọc có thể làm thay đổi bước nên làm tiếp theo.

Dù vậy, không phải lúc nào cũng cần tự chia. Khi bật adaptive thinking hoặc dùng subagent, Claude tự lo được phần lớn việc suy luận nhiều bước ngay trong một lần chạy. Bạn vẫn nên tự viết chuỗi prompt khi cần xem kết quả giữa chừng, hoặc khi muốn chắc các bước luôn chạy đúng thứ tự đã định. Vì mỗi bước là một lần gọi API riêng, bạn có thể ghi log, kiểm chất lượng kết quả hay rẽ sang nhánh khác ở bất kỳ bước nào.

Bảng sau xếp bốn loại việc mà bài sẽ đi qua, cùng cách chia hợp với từng loại.

| Loại việc | Cách chia | Ví dụ ở chuỗi nhà thuốc |
| --- | --- | --- |
| Các bước biết trước, lặp lại y nhau mỗi lần | Prompt chaining | Review mọi PR theo ba mặt cố định |
| Việc lớn nhưng chia được theo đơn vị rõ ràng | Xem riêng từng phần, rồi một bước xem chung | PR đổi 16 file |
| Chưa biết lỗi nằm đâu | Chia dần theo phát hiện | Hoá đơn thỉnh thoảng bị trừ kho hai lần |
| Việc mở, chưa biết phạm vi | Nắm cấu trúc, xếp ưu tiên, sửa kế hoạch khi biết thêm | Viết test cho phần kho cũ |

## Review PR theo ba mặt cố định

Pipeline review đầu tiên của đội gửi cả diff cùng một prompt dài, dặn Claude cùng lúc kiểm style code, tìm lỗ hổng bảo mật và kiểm tài liệu có đủ không. Bản review thường dồn gần hết vào style. Phần bảo mật chỉ có một hai câu chung chung, và có PR thiếu hẳn phần tài liệu.

Với mọi PR, đội luôn cần đúng ba mặt đó, theo đúng thứ tự đó. Đây là kiểu review nhiều mặt mà mặt nào cũng biết trước (**multi-aspect review**). Khi các bước đã rõ từ đầu như vậy, chuỗi bước cố định là cách đơn giản và dễ kiểm soát nhất. Đội viết lại pipeline thành bốn lần gọi: một lần cho style, một lần cho bảo mật, một lần cho tài liệu, rồi một lần gộp ba phần thành bản review cuối. Mỗi bước nhận diff cùng các phần đã xong, để không nêu lại vấn đề mà bước trước đã nêu.

Giữa các bước có một gate. Code kiểm xem phần vừa nhận có đúng dạng không, tức là phải có danh sách vấn đề và vấn đề nào cũng ghi tên file và số dòng, rồi mới đi tiếp. Phần nào sai dạng thì code gọi lại bước đó.

```python
MAT_REVIEW = ["style", "bao_mat", "tai_lieu"]

def review_pr(diff, files_doi):
    cac_phan = {}
    for mat in MAT_REVIEW:
        phan = goi_claude(PROMPT[mat], diff, files_doi, cac_phan)
        if not dung_dang(phan):        # gate: code kiểm, không hỏi Claude
            phan = goi_claude(PROMPT[mat], diff, files_doi, cac_phan)
        cac_phan[mat] = phan
    return goi_claude(PROMPT["gop"], cac_phan)
```

`goi_claude` là hàm do đội tự viết. Mỗi lần gọi hàm này là một request tới Messages API, tức API chính để gửi nội dung cho Claude và nhận câu trả lời. Vì mỗi bước tách riêng, khi phần bảo mật của một PR sai, đội mở log là thấy ngay bước bảo mật đã nhận gì và trả gì.

> **Bẫy đề**
>
> Một pipeline cần review mọi PR theo cùng một quy trình, xét ba mặt là style, bảo mật và tài liệu. Nên chia việc theo kiểu nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Một prompt lo cả ba mặt** (_a single comprehensive prompt_). Cách này gọi ít lần hơn nên rẻ và nhanh hơn. Nhưng đó chính là bản đầu tiên của đội, bản mà phần style lấn hết phần bảo mật và tài liệu.
> - **Orchestrator-workers** (_a central LLM decides what to check for each PR_). Kiểu này hợp với việc không đoán trước được các bước. Ở đây ba bước đã biết trước, nên để Claude chọn lại các bước cho từng PR chỉ sinh thêm chỗ có thể sai.
> - **Routing theo loại PR** (_classify each PR as feature, bugfix or refactor first_). Phân loại trước rồi chuyển sang prompt riêng nghe có vẻ bài bản. Thế nhưng PR loại nào cũng cần đủ ba mặt, nên phân loại trước không giúp PR nào được xem đủ ba mặt.
>
> **Chọn:** prompt chaining, mỗi mặt một bước riêng, rồi một bước gộp ở cuối.

## PR đổi 16 file: xem riêng từng file, rồi xem liên kết

Tháng sau, một dev mở PR cho tính năng bán thuốc theo đơn điện tử, đổi 16 file. Pipeline gửi cả 16 file vào cùng một lần gọi cho bước bảo mật. Năm file đầu được nhận xét kỹ, còn 11 file sau mỗi file chỉ được một hai dòng. Cùng một đoạn code làm tròn tiền bị đánh dấu là lỗi ở `hoa_don.py`, nhưng ở `tra_hang.py` lại được khen là ổn. Còn một lỗi thật thì bản review bỏ sót hẳn. PR đổi thứ tự tham số của hàm `tru_kho(ma_lo, so_luong)` thành `tru_kho(so_luong, ma_lo)`, trong khi `nhap_kho.py` vẫn gọi theo thứ tự cũ. File đó không nằm trong PR.

Khi một lần gọi phải xem quá nhiều file, sự chú ý của Claude bị chia mỏng (**attention dilution**). Kết quả là có file được xem kỹ, có file chỉ được lướt qua, và cùng một đoạn code bị nhận xét trái ngược nhau. Context, tức lượng nội dung Claude đọc trong một lần gọi, có lớn hơn cũng không chữa được chuyện này. Context lớn chỉ giúp nhét vừa nhiều file hơn, không giúp Claude chú ý đều cho từng file.

Vì vậy đội tách bước review thành hai loại lần gọi:

1. Xem riêng từng file (**per-file local analysis**). Mỗi file bị đổi được xem trong một lần gọi riêng, và lần gọi đó chỉ tìm vấn đề nằm gọn trong file. File nào cũng được xem với cùng độ kỹ.
2. Xem liên kết giữa các file (**cross-file integration pass**). Một lần gọi riêng đọc nhận xét của từng file và chỉ xét dữ liệu đi qua nhiều file. Ví dụ, khi một hàm đổi signature thì còn chỗ nào gọi theo kiểu cũ, hay khi một kiểu dữ liệu đổi thì còn chỗ nào dùng kiểu cũ.

Bước xem liên kết không thể chỉ đọc 16 file trong PR, vì lỗi `tru_kho` nằm ở một file không đổi. Đội chạy bước này như một agent nhỏ, dựng bằng Agent SDK, thư viện của Anthropic để viết agent có sẵn vòng lặp gọi tool. Agent dùng ba tool chỉ đọc `Read`, `Grep` và `Glob` để đọc file và tìm trong codebase, nhờ đó lần theo được các chỗ gọi hàm. `allowed_tools` chỉ cho ba tool này chạy mà không phải hỏi quyền, chứ không giới hạn agent ở ba tool đó. Vì thế đội chặn thêm `Edit`, `Write` và `Bash` bằng `disallowed_tools`. Đội cũng đặt `max_turns` để giới hạn số lượt, mỗi lượt là một lần Claude trả lời và gọi tool, để agent không chạy quá lâu. Bản review được đăng lên PR sau khi PR đã mở, dev không phải ngồi chờ, nên bước này có thời gian cho vài lượt tool.

```python
nhan_xet_file = [goi_claude(PROMPT_MOT_FILE, f, diff_cua(f)) for f in files_doi]

tuy_chon = ClaudeAgentOptions(
    allowed_tools=["Read", "Grep", "Glob"],      # chạy không cần hỏi quyền
    disallowed_tools=["Edit", "Write", "Bash"],  # agent review không được sửa gì
    max_turns=20,
)
async for message in query(
    prompt=PROMPT_LIEN_KET.format(nhan_xet=nhan_xet_file, diff=diff),
    options=tuy_chon,
):
    if isinstance(message, ResultMessage) and message.subtype == "success":
        lien_ket = message.result
```

Agent tìm `tru_kho(` bằng `Grep`, thấy `nhap_kho.py` vẫn truyền `ma_lo` trước, và báo lỗi đó.

Cách dùng nhiều lần xem rồi một bước kiểm lại không phải đội tự nghĩ ra. Tính năng Code Review có sẵn trong Claude Code cũng cho nhiều agent cùng xem diff và phần code xung quanh, sau đó một bước kiểm lại sẽ bỏ các phát hiện sai rồi mới đăng.

**Sơ đồ: Một lần gọi cho 16 file sót lỗi tru_kho; xem riêng từng file rồi cho agent lần chỗ gọi thì bắt được**
_PR đổi 16 file. Một lần gọi cho cả 16 file: 5 file đầu nhận xét kỹ, 11 file sau mỗi file một hai dòng, cùng đoạn làm tròn tiền bị đánh dấu lỗi ở hoa_don.py nhưng được khen ở tra_hang.py, và lỗi đổi thứ tự tham số tru_kho không ai bắt được. Cách sửa: 16 lần gọi xem riêng từng file, rồi một agent xem liên kết có Read, Grep, Glob và max_turns, tìm tru_kho( bằng Grep và thấy nhap_kho.py ngoài PR vẫn truyền ma_lo trước_

- **Một lần gọi cho cả 16 file**: 5 file đầu: nhận xét kỹ
- 11 file sau: mỗi file chỉ một hai dòng
- **hoa_don.py**: làm tròn tiền: lỗi
- **≠**
- **tra_hang.py**: cùng đoạn đó: ổn
- **tru_kho đổi tham số**: không ai bắt được
- **Xem riêng từng file, rồi một agent xem liên kết**: 16 lần gọi, file nào cũng cùng độ kỹ
- **cross-file integration pass**: Read, Grep, Glob, max_turns=20
- Grep tru_kho(
- **NGOÀI PR, KHÔNG ĐỔI**
- **nhap_kho.py**: vẫn truyền ma_lo trước
- Bắt được lỗi: nhap_kho.py gọi tru_kho theo thứ tự cũ

> **Bẫy đề**
>
> PR đổi 16 file. Bản review xem kỹ vài file đầu nhưng sơ sài ở các file sau. Nó bỏ sót lỗi rõ ràng, và nhận xét trái ngược nhau về cùng một đoạn code ở hai file. Nên sửa pipeline thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Đổi sang model lớn hơn, context dài hơn** (_a higher-tier model with a larger context window_). Nghe thì tưởng chỉ cần chỗ chứa đủ 16 file là hết bị sót. Nhưng vấn đề là sự chú ý bị chia mỏng, mà context lớn hơn không đổi được chuyện đó.
> - **Bắt dev chia PR thành nhiều PR nhỏ** (_require developers to split large PRs_). PR nhỏ đúng là dễ review hơn. Có điều cách này đẩy việc sang dev, còn hệ thống review thì không tốt lên chút nào.
> - **Chạy ba lần, chỉ giữ lỗi xuất hiện ít nhất hai lần** (_three independent passes, flag only consensus issues_). Lọc theo đa số nghe như giảm được nhận xét sai. Ngặt nỗi, lỗi thật mà chỉ một lần bắt được cũng bị lọc mất, nên hệ thống bắt được ít lỗi hơn.
>
> **Chọn:** xem riêng từng file để tìm lỗi trong file, rồi một bước riêng xem dữ liệu đi qua nhiều file. Nếu đề tả lỗi nằm ở chỗ gọi hàm trong một file mà PR không đổi, hãy chọn đáp án cấp cho bước xem liên kết các tool đọc file và tìm trong codebase, kèm giới hạn số lượt. Đừng chọn đáp án nhét thêm file vào prompt.

## Lỗi chưa biết nằm đâu: để agent chia dần

Ngoài review PR, đội còn dùng Claude Code để điều tra lỗi. Có một lỗi khó chịu: cứ khoảng 300 hoá đơn thì có 1 hoá đơn bị trừ kho hai lần. Lỗi có thể nằm ở bất kỳ phần nào trong bốn phần mà một lần bán đi qua, và không ai biết là phần nào.

Dev đầu tiên lấy lại chuỗi prompt của sự cố quý trước, gồm năm bước cố định: kiểm database, cache, mạng, bản deploy gần nhất và cấu hình. Agent đi hết năm bước, bước nào cũng báo "không thấy gì bất thường". Chuỗi đó viết cho một lỗi khác, nên nó kiểm những chỗ không liên quan tới lỗi lần này.

Khi chưa biết lỗi nằm đâu, không ai chia việc đúng được ngay từ đầu. Đội đổi sang cách để agent tự sinh việc điều tra theo những gì nó vừa tìm thấy (**adaptive investigation plan**). Họ bắt đầu từ một hoá đơn thật đã bị trừ kho hai lần, mã HD-58213:

1. Agent đọc log API của hoá đơn đó. Log cho thấy API chỉ nhận đơn này một lần, nên lỗi không nằm ở app ở quầy hay API.
2. Agent đọc log của message queue và thấy hai message cùng mã hoá đơn, cách nhau 31 giây. Lúc này việc tiếp theo là tìm vì sao message bị gửi hai lần, chứ không còn là đi kiểm database.
3. Agent đọc code job trừ kho và thấy job chỉ báo cho hàng đợi là đã xử lý xong message (ack) sau khi trừ kho. Với HD-58213, job trừ kho xong nhưng chạy quá thời gian chờ của hàng đợi trước khi kịp báo. Hàng đợi tưởng message chưa được xử lý nên gửi lại, và job trừ kho thêm một lần nữa.

Mỗi bước loại bớt một phần hoặc khoanh vùng hẹp lại, và bước sau do kết quả của bước trước quyết định. Không ai viết sẵn được bước 3 trước khi có kết quả của bước 2.

**Sơ đồ: Năm bước cố định của sự cố cũ không thấy gì; ba bước sinh dần từ HD-58213 tìm ra lỗi ở job trừ kho**
_Điều tra hoá đơn bị trừ kho hai lần. Chuỗi năm bước cố định của sự cố quý trước kiểm database, cache, mạng, bản deploy, cấu hình, bước nào cũng không thấy gì. Cách chia dần bắt đầu từ hoá đơn HD-58213 qua bốn thành phần app ở quầy, API nhận đơn, message queue, job trừ kho: bước 1 log API cho thấy chỉ nhận đơn một lần nên loại app và API; bước 2 log hàng đợi có hai message cùng mã cách nhau 31 giây; bước 3 code job trừ kho chỉ ack message sau khi trừ, quá thời gian chờ nên hàng đợi gửi lại và kho bị trừ lần nữa_

- **CHUỖI NĂM BƯỚC CỐ ĐỊNH, CHÉP TỪ SỰ CỐ QUÝ TRƯỚC**: Database
- không thấy gì
- Cache
- không thấy gì
- Mạng
- không thấy gì
- Bản deploy
- không thấy gì
- Cấu hình
- không thấy gì
- **CHIA DẦN, BẮT ĐẦU TỪ HOÁ ĐƠN HD-58213**: App ở quầy
- API nhận đơn
- Message queue
- **Job trừ kho**: hai lần
- 1.
- 2.
- 3.
- 1. **Đọc log API: chỉ nhận đơn một lần**: nên app ở quầy và API không gây lỗi
- 2. **Đọc log hàng đợi: hai message cùng mã hoá đơn, cách nhau 31 giây**: việc tiếp theo là tìm vì sao message bị gửi hai lần, không phải kiểm database
- 3. **Đọc code job trừ kho: chỉ ack message sau khi trừ kho xong**: job quá thời gian chờ, hàng đợi gửi lại, kho bị trừ lần nữa

> **Trong đề chọn gì**
>
> Nếu đề tả một lỗi chạy qua nhiều tầng hay nhiều thành phần mà chưa ai biết nằm ở đâu, hãy chọn đáp án để agent bắt đầu từ một trường hợp lỗi có thật, rồi tự sinh việc điều tra tiếp theo dựa trên từng phát hiện. Các đáp án sau đều sai:
>
> - chạy lại chuỗi bước cố định của một sự cố cũ;
> - lập kế hoạch lần hết mọi đường đi của code trước rồi mới đọc code;
> - cho mỗi thành phần một agent chạy song song và hỏi nó "phần của bạn có gây lỗi không";
> - chờ từng nhóm tự xác nhận lỗi có nằm ở phần mình không.

## Việc mở: viết test cho phần kho cũ

Trưởng nhóm giao cho Claude Code một việc: "Viết test đầy đủ cho phần kho". Phần kho có khoảng 140 file viết từ năm năm trước, gần như chưa có test, và không ai nói nên bắt đầu từ đâu. Đây là một việc mở (**open-ended task**), chưa ai biết phạm vi tới đâu.

Một kế hoạch viết sẵn kiểu "đi lần lượt từng thư mục theo thứ tự chữ cái" sẽ dồn công sức vào những file ít ai dùng, còn các hàm tính tiền và trừ kho có khi tới lúc hết thời gian vẫn chưa được test. Đọc hết 140 file để liệt kê mọi hàm rồi mới viết test cũng không ổn, vì tốn rất nhiều context mà vẫn chưa biết chỗ nào quan trọng.

Đội chia việc theo ba bước, và để kế hoạch đổi theo những gì tìm được:

1. Nắm cấu trúc (**map structure**). Claude dùng `Glob` liệt kê file theo thư mục và dùng `Grep` đếm xem module nào được import ở nhiều nơi. `tinh_gia.py` được 23 file import, `han_dung.py` được 17 file import.
2. Tìm vùng ảnh hưởng lớn (**identify high-impact areas**). Từ số liệu đó, Claude chọn ra các module có nhiều nơi phụ thuộc hoặc dính tới tiền và hạn dùng thuốc, như `tinh_gia.py`, `han_dung.py` và `tru_kho.py`.
3. Lập kế hoạch có ưu tiên (**prioritized plan**) rồi bắt đầu từ vùng quan trọng nhất. Khi viết test cho `tru_kho.py`, Claude phát hiện module này đọc một biến cấu hình toàn cục ngay lúc được import. Claude chèn một việc mới lên đầu những việc còn lại là viết fixture, tức đoạn dựng sẵn cấu hình giả cho test, vì test của `tinh_gia.py` và `han_dung.py` cũng sẽ cần nó.

Việc viết fixture không thể có trong kế hoạch ban đầu, vì chỉ khi viết test cho `tru_kho.py` mới biết có biến cấu hình đó. Với việc mở, kế hoạch cần được sửa mỗi khi phát hiện thêm một phụ thuộc.

**Sơ đồ: Kế hoạch đi từ cấu trúc, gặp biến cấu hình toàn cục thì chèn việc viết fixture lên trước**
- Làm và sửa kế hoạch
- gặp biếncấu hình toàn cục
- Viết testtru_kho.py
- Chèn lên trướcfixture giả cấu hình
- Test tinh_gia.py,han_dung.pydùng lại fixture
- Lập kế hoạch
- Nắm cấu trúcGlob, Grep, 140 file
- Vùng ảnh hưởng lớntinh_gia.py: 23 nơi importhan_dung.py: 17 nơi importtru_kho.py: trừ kho
- Kế hoạch ưu tiênvùng quan trọng trước

> **Ý chính**
>
> Khi biết trước các bước, hãy viết chuỗi bước cố định. Với PR lớn, hãy xem riêng từng file rồi thêm một bước xem liên kết giữa các file. Khi chưa biết lỗi nằm đâu hay việc rộng tới đâu, hãy để agent chia dần theo phát hiện, bắt đầu từ cấu trúc code hoặc từ một trường hợp lỗi có thật.

> **Trong đề chọn gì**
>
> Nếu đề giao một việc mở như "thêm test đầy đủ cho codebase cũ" mà không nói nên ưu tiên gì, hãy chọn đáp án bắt đầu bằng việc dùng `Glob` và `Grep` để nắm cấu trúc và tìm các module có nhiều nơi phụ thuộc. Từ đó lập kế hoạch ưu tiên các vùng ảnh hưởng lớn, rồi sửa kế hoạch mỗi khi phát hiện thêm phụ thuộc. Đọc hết mọi file trước, chia đều công sức cho mỗi thư mục, hay đi theo thứ tự chữ cái đều không phải cách chia hợp lý.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 1.6](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Building effective agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)
3. [Prompting best practices (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
4. [Code Review (Claude Code)](https://code.claude.com/docs/en/code-review)
5. [Common workflows (Claude Code)](https://code.claude.com/docs/en/common-workflows)
6. [How the agent loop works (Agent SDK)](https://code.claude.com/docs/en/agent-sdk/agent-loop)
