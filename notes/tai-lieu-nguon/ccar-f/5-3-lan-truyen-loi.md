---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/5-3-lan-truyen-loi
ngay_tai: 2026-11-27
tieu_de: Truyền lỗi giữa các agent trong hệ thống nhiều agent
---

Domain 5: Context Management & Reliability · Task 5.3

# Truyền lỗi giữa các agent trong hệ thống nhiều agent

Subagent báo lỗi có cấu trúc, tách lỗi truy cập khỏi kết quả rỗng, tự retry lỗi tạm thời, và báo cáo cuối ghi rõ phần nào còn thiếu nguồn.

- 15 phút đọc
- Đối chiếu docs 22/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Trả ngữ cảnh lỗi có cấu trúc gồm loại lỗi, việc đã thử, kết quả từng phần và cách khác có thể thử
- Phân biệt lỗi truy cập với kết quả rỗng hợp lệ khi báo về agent điều phối
- Nhận ra hai cách làm sai là giấu lỗi và dừng cả quy trình chỉ vì một lỗi
- Để subagent tự retry lỗi tạm thời, chỉ báo lên lỗi nó không tự giải quyết được
- Ghi chú trong báo cáo tổng hợp phần nào đủ nguồn, phần nào còn thiếu

Trong hệ thống nhiều agent, agent điều phối (**coordinator**) không tự gọi database hay tìm web. Nó giao việc cho các subagent, tức các agent con mỗi con lo một phần việc, rồi dựa vào những gì chúng báo về để quyết định bước tiếp. Vì vậy cách một subagent báo lỗi quyết định agent điều phối có xử lý đúng hay không. Nếu subagent báo thiếu thông tin, agent điều phối phải đoán mò. Nếu subagent giấu lỗi, agent điều phối sẽ tin vào một kết quả sai.

Bài này giúp bạn thiết kế đường đi của lỗi, từ subagent lên agent điều phối rồi vào báo cáo cuối. Bạn sẽ biết một báo lỗi tốt cần có gì, vì sao phải tách lỗi truy cập khỏi kết quả rỗng, lỗi nào subagent nên tự xử lý, và cách ghi rõ trong báo cáo phần nào còn thiếu nguồn.

**Sơ đồ: Lỗi đi lên kèm đủ ngữ cảnh, để agent điều phối chọn đúng cách xử lý và báo cáo nói rõ chỗ còn thiếu**
_Bản đồ bài. Subagent gọi nguồn dữ liệu. Lỗi tạm thời như mất kết nối thì subagent tự retry ngay bên trong; retry được thì báo thành công. Kết quả nó gửi về agent điều phối có ba dạng: kết quả có dữ liệu; kết quả rỗng hợp lệ, tức truy vấn chạy xong mà không có dòng nào khớp; lỗi truy cập mà subagent không tự gỡ được, kèm ngữ cảnh có cấu trúc gồm loại lỗi, việc đã thử, kết quả từng phần, cách khác. Hai cách làm sai bị gạch: giấu lỗi bằng cách trả rỗng như thành công, và dừng cả quy trình vì một lỗi. Agent điều phối dựa vào đó để chọn retry, đổi nguồn hay dùng phần đã có. Báo cáo tổng hợp ghi rõ phần nào đủ nguồn: nội dung đủ nguồn thì ghi nguồn xác nhận, chủ đề còn thiếu thì ghi nguồn nào không truy cập được và vì sao_

- **SUBAGENT**
- **Gọi nguồn dữ liệu**: database, API, tìm web
- **Lỗi tạm thời**: tự retry bên trong,
- retry được thì báo thành công
- ✗ giấu lỗi: trả rỗng như
- thành công
- **BÁO VỀ AGENT ĐIỀU PHỐI**
- **Có dữ liệu**
- **Rỗng hợp lệ**: chạy xong, 0 dòng khớp
- **Lỗi truy cập**: loại lỗi, việc đã thử,
- kết quả từng phần,
- cách khác có thể thử
- **Agent điều phối**: chọn: retry, đổi nguồn,
- hay dùng phần đã có
- ✗ dừng cả quy trình
- vì một lỗi
- **BÁO CÁO TỔNG HỢP GHI RÕ PHẦN NÀO ĐỦ NGUỒN**: Nội dung đủ nguồn: ghi rõ nguồn nào xác nhận
- Chủ đề còn thiếu: ghi rõ nguồn nào không truy cập được, vì sao

## Ví dụ xuyên suốt: bản tin thị trường của một công ty xuất khẩu cà phê

Một công ty xuất khẩu cà phê robusta ở Buôn Ma Thuột gửi ban giám đốc một bản tin thị trường trước 8 giờ sáng thứ Hai hằng tuần. Chị Quỳnh, trưởng phòng phân tích, duyệt bản tin trước khi gửi. Phát, dev của phòng, dựng một hệ thống nhiều agent bằng Claude Agent SDK để viết bản tin.

Agent điều phối giao việc cho ba subagent. `gia-san` lấy giá robusta trên sàn London qua API của một nhà cung cấp dữ liệu. `hai-quan` truy vấn một database số liệu xuất khẩu do công ty mua lại từ bên ngoài, mỗi thị trường một truy vấn. Database này còn có một bảng tổng hợp tháng đã công bố, cập nhật chậm hơn số liệu chi tiết. `doc-tin` tìm tin thời tiết, mùa vụ trên web. Một subagent thứ tư, `tong-hop`, gộp kết quả thành bản tin. Khi việc lớn, chẳng hạn chạy lại số liệu cả năm, `hai-quan` có thể tự chia việc cho vài subagent con.

## Hai cách xử lý lỗi sai: giấu lỗi và dừng cả quy trình

Thứ Hai đầu tháng 11, bản tin ghi "xuất khẩu sang Đức trong tháng 10: không có lô nào". Đức là thị trường lớn thứ hai của công ty. Phát xem log thì thấy truy vấn cho Đức của `hai-quan` bị timeout vì database đang chạy bảo trì. Code bắt lỗi rồi trả về danh sách rỗng như một kết quả bình thường, nên agent điều phối và `tong-hop` tưởng đó là số liệu thật.

Giấu lỗi bằng cách trả kết quả rỗng như thể đã thành công (**silently suppressing errors (returning empty results as success)**) là một anti-pattern, tức một cách làm sai mà nhiều người hay mắc. Agent điều phối không thể phân biệt "không có dữ liệu" với "không lấy được dữ liệu", và một lỗi kỹ thuật biến thành một kết luận sai trong bản tin gửi ban giám đốc.

Phát sửa vội theo hướng ngược lại. Hễ một subagent gặp lỗi, code ném exception lên tới tầng ngoài cùng của hệ thống. Tuần sau, API giá sàn chậm vài phút, và cả hệ thống dừng. Sáng thứ Hai không có bản tin nào, dù số liệu hải quan và tin thời tiết đã lấy xong. Dừng cả quy trình chỉ vì một lỗi ở một chỗ (**terminating entire workflows on single failures**) cũng là anti-pattern.

Một hệ thống nhiều agent chạy lâu, và mỗi bước dựa vào bước trước. Một lỗi nhỏ mà làm dừng cả hệ thống thì mất hết phần đã làm, còn chạy lại từ đầu thì vừa tốn vừa chậm. Cách tốt hơn là cho agent điều phối biết chỗ nào đang lỗi, rồi để nó tự xoay xở với phần còn lại. Cách này thường hiệu quả bất ngờ.

## Báo lỗi có cấu trúc thay vì một dòng chung chung

Sau hai cách làm hỏng, Phát cho `hai-quan` báo lỗi bằng một dòng `{"error": "search unavailable"}` và để agent điều phối tự lo. Agent điều phối nhận dòng đó nhưng không biết phải làm gì. Nó không biết lỗi là do timeout, do hết quyền truy cập hay do câu truy vấn sai, cũng không biết subagent đã lấy được phần nào. Một trạng thái lỗi chung chung như vậy giấu mất những thông tin mà agent điều phối cần (**generic error statuses ("search unavailable") hide valuable context from the coordinator**).

Phát đổi sang báo lỗi có cấu trúc (**structured error context**). Mỗi báo lỗi có bốn phần. Đầu tiên là loại lỗi (**failure type**). Tiếp theo là việc đã thử (**attempted query**), tức đã chạy truy vấn nào và thử mấy lần. Sau đó là phần kết quả đã lấy được (**partial results**). Cuối cùng là những cách khác có thể thử (**alternative approaches**). Nhờ đủ thông tin, agent điều phối quyết định được bước tiếp một cách hợp lý (**enabling intelligent coordinator recovery decisions**).

Tuần database bảo trì tiếp theo, `hai-quan` gửi về báo lỗi như sau:

```json
{
  "trang_thai": "loi_truy_cap",
  "loai_loi": "timeout",
  "da_thu": "truy vấn xuất khẩu tháng 10 cho 12 thị trường, mỗi thị trường 1 lần, quá 60 giây thì dừng",
  "ket_qua_tung_phan": {"da_lay": 8, "con_thieu": ["Đức", "Bỉ", "Ý", "Tây Ban Nha"]},
  "cach_khac": ["chạy lại sau 2 giờ khi database bảo trì xong",
                "dùng bảng tổng hợp tháng đã công bố cho 4 thị trường còn thiếu"]
}
```

Với báo lỗi này, agent điều phối giữ số liệu của 8 thị trường đã lấy được và chỉ xử lý tiếp 4 thị trường còn thiếu. Chờ 2 giờ nữa thì lỡ hạn gửi bản tin lúc 8 giờ sáng, nên nó chọn cách dùng bảng tổng hợp tháng cho 4 thị trường đó.

Chuyện này không chỉ đúng với subagent. Khi bạn tự viết tool cho agent, thông báo lỗi của tool cũng nên nói rõ lỗi gì và nên thử gì tiếp, thay vì một chữ "failed" chung chung, để Claude có đủ thông tin mà xoay xở. Với MCP, giao thức chuẩn để nối tool vào Claude, tool chạy lỗi thì trả lỗi ngay trong kết quả với `isError: true`, kèm lời giải thích cụ thể để Claude sửa tham số rồi gọi lại.

Báo lỗi có cấu trúc càng có ích khi nhiều subagent chạy song song và mỗi con về một kiểu: con xong, con xong một phần, con không gửi về gì. Có lần Phát cần chạy lại toàn bộ dữ liệu năm 2025, nên `hai-quan` chia việc cho ba subagent con, mỗi con lo bốn tháng. Subagent thứ nhất xong cả. Subagent thứ hai báo lấy được ba tháng, còn tháng 8 bị chặn vì lỗi quyền truy cập bảng lưu trữ. Subagent thứ ba bị sập giữa chừng và không gửi về gì. Agent điều phối giữ ba tháng của subagent thứ hai và chỉ xử lý tiếp tháng 8. Với subagent thứ ba, nó không biết tháng nào đã xong, nên coi như chưa có tháng nào và chạy lại cả bốn tháng.

> **Trong đề chọn gì**
>
> Nếu đề kể subagent bị timeout khi truy vấn database và hỏi nên báo lỗi về agent điều phối thế nào, hãy chọn trả ngữ cảnh lỗi có cấu trúc gồm loại lỗi, việc đã thử và kết quả từng phần. Đáp án bắt timeout rồi trả danh sách rỗng kèm trạng thái thành công là giấu lỗi. Đáp án trả một chuỗi chung chung như `{"error": "Operation failed"}` không cho agent điều phối biết gì để quyết định. Đáp án đẩy exception lên handler cao nhất để dừng cả quy trình là bỏ luôn phần các subagent khác đã làm xong.

> **Bẫy đề**
>
> Agent điều phối chia việc index tài liệu cho ba subagent chạy song song, mỗi subagent một thư mục. Subagent 1 xong. Subagent 2 gặp lỗi quyền ở một file mà nó không tự xử lý được, nên báo về kết quả một phần kèm lỗi đó. Subagent 3 bị sập, không có output nào. Agent điều phối nên xử lý hai subagent sau khác nhau thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Gộp kết quả một phần của subagent 2 và đánh dấu thư mục đã xong; coi subagent 3 là chạy sạch vì không báo lỗi file nào** (_treat silence as success_). Nghe như không bỏ phí gì. Nhưng không có output không có nghĩa là chạy sạch, và file bị lỗi quyền vẫn chưa được index.
> - **Giữ phần của subagent 2 và thử lại file lỗi; với subagent 3, chỉ thử lại những file nhiều khả năng gặp cùng lỗi quyền** (_guess the crash cause_). Nghe như tận dụng được lỗi subagent 2 đã báo. Có điều subagent 3 không để lại gì, nên lấy lỗi của subagent 2 làm nguyên nhân chỉ là đoán mò.
> - **Bỏ kết quả một phần của subagent 2 rồi chạy lại cả thư mục, giống subagent 3** (_rerun both_). Nghe an toàn. Ngặt nỗi subagent 2 đã báo rõ phần nào xong, chạy lại là bỏ phí đúng phần đáng tin.
>
> **Chọn:** giữ kết quả một phần của subagent 2 và chỉ xử lý tiếp các file bị lỗi quyền. Với subagent 3, chạy lại cả thư mục và không coi file nào là đã index.

## Lỗi truy cập khác kết quả rỗng hợp lệ

Có một tuần, bản tin cần số liệu xuất khẩu cà phê chồn sang Chile, một mặt hàng công ty mới thử bán. Truy vấn của `hai-quan` chạy xong và trả về 0 dòng. Cùng tuần đó, lần gọi API của `gia-san` bị treo tới hết thời gian chờ mà chưa nhận được phản hồi nào.

Hai chuyện này trông giống nhau vì đều không có dữ liệu, nhưng nghĩa hoàn toàn khác. Timeout là lỗi truy cập (**access failures**). Nguồn chưa hề trả lời, nên chưa ai biết thật ra có dữ liệu hay không. Agent điều phối phải quyết định có retry hay không (**timeouts needing retry decisions**). Còn 0 dòng là kết quả rỗng hợp lệ (**valid empty results**). Truy vấn đã chạy thành công, và câu trả lời của nguồn là không có gì khớp (**successful queries with no matches**). Thử lại bao nhiêu lần cũng ra 0 dòng.

**Sơ đồ: Cùng không có dữ liệu, nhưng chỉ timeout mới đáng retry; 0 dòng là câu trả lời thật của nguồn**

• _Lỗi truy cập_
1. API giá sàn bị treo, hết thời gian chờ, **chưa có phản hồi nào**
   ↓ _chưa biết nguồn có dữ liệu hay không_
2. Báo **loi_truy_cap**, agent điều phối quyết định retry hay đổi nguồn
3. **Retry** có thể lấy được ở lần sau

• _Kết quả rỗng hợp lệ_
1. Truy vấn cà phê chồn sang Chile chạy xong, trả về **0 dòng**
   ↓ _nguồn đã trả lời: không có lô nào khớp_
2. Báo **thanh_cong** với danh sách rỗng, ghi rõ đã tra gì
3. **Không retry** thử lại vẫn ra 0 dòng

Phát cho mọi subagent ghi rõ hai trạng thái này khi báo về (**distinguishing access failures from valid empty results in error reporting**). Với kết quả rỗng, subagent đặt `trang_thai` là `thanh_cong` và kèm câu truy vấn đã chạy, để `tong-hop` viết được "chưa có lô cà phê chồn nào xuất sang Chile trong tháng 10". Với lỗi truy cập, subagent đặt `trang_thai` là `loi_truy_cap`, kèm loại lỗi, việc đã thử, phần đã lấy và cách khác, để agent điều phối biết chỗ này chưa có câu trả lời.

> **Trong đề chọn gì**
>
> Nếu đề kể một subagent gọi API catalog bị treo quá thời gian chờ, còn một subagent khác tra SKU đã ngừng bán và nhận HTTP 200 với 0 dòng, hãy chọn báo timeout là lỗi truy cập có thể retry, còn 200 với 0 dòng là kết quả rỗng hợp lệ không cần retry. Nếu đáp án báo cả hai là rỗng hợp lệ, thì dù có kèm ghi chú về timeout, agent điều phối vẫn bỏ qua chỗ đáng retry. Nếu đáp án báo cả hai là lỗi truy cập, agent điều phối sẽ retry vô ích chỗ nguồn đã trả lời. Đáp án đảo ngược hai loại thì mắc cả hai lỗi đó.

## Subagent tự xử lý lỗi tạm thời, chỉ báo lên lỗi không tự gỡ được

Database hải quan thỉnh thoảng reset kết nối vài giây rồi tự chạy lại. Phát biết đây là lỗi tạm thời. Lúc đầu, mỗi lần như vậy `hai-quan` đều báo lỗi lên, và agent điều phối mất công quyết định retry cho những lỗi chỉ cần thử lại sau vài giây là xong.

Phát cho subagent tự phục hồi tại chỗ với lỗi tạm thời (**local recovery for transient failures**). Gặp lỗi reset kết nối, `hai-quan` tự chạy lại truy vấn, tổng cộng tối đa ba lần tính cả lần đầu, mỗi lần chờ lâu hơn lần trước. Chạy đủ ba lần mà vẫn lỗi, nó mới báo lên agent điều phối, kèm việc đã thử và phần kết quả đã có (**only propagate errors they cannot resolve, including what was attempted and partial results**). Những việc chạy theo luật cố định như retry tự động hay lưu checkpoint, tức điểm lưu tiến độ để chạy tiếp từ đó khi có sự cố, nên viết sẵn trong code, đi kèm khả năng tự xoay xở của agent.

Nếu lần chạy thứ ba thành công, `hai-quan` báo kết quả thành công như bình thường. Hai lần reset là chuyện nội bộ nó đã tự xử lý xong, nên không cần đẩy lên thành lỗi, cũng không cần bắt agent điều phối kiểm lại. Subagent có thể ghi số lần retry vào log để Phát theo dõi độ ổn định của database.

**Sơ đồ: Subagent tự gỡ lỗi tạm thời, chỉ lỗi còn lại sau khi chạy đủ ba lần mới báo lên agent điều phối**
Bên tham gia: Database hải quan, hai-quan, Agent điều phối

1. lấy xuất khẩu tháng 10, 12 thị trường
2. chạy lần 1
3. reset kết nối
4. chạy lần 2
5. reset kết nối
6. chạy lần 3
7. đủ 12 thị trường
8. thành công, không báo lỗi

> **Bẫy đề**
>
> Agent điều phối giao cho subagent một việc chuyển dữ liệu ba bước: extract, transform, load. Bước load lỗi hai lần vì kết nối database bị reset, rồi thành công ở lần thứ ba, vẫn trong cùng lần chạy của subagent. Reset kết nối ở đây là lỗi tạm thời đã biết. Subagent nên báo gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Yêu cầu escalation, cho rằng hai lần reset là lỗi credential và xin cấp credential mới** (_blame credentials_). Nghe như cẩn thận. Nhưng reset kết nối vốn là lỗi tạm thời, và lần thứ ba đã chạy được với chính credential cũ.
> - **Báo hoàn thành một phần: extract và transform xong, load chưa xác nhận** (_partial completion_). Nghe như thận trọng. Có điều load đã thành công, báo chưa xác nhận là bắt agent điều phối kiểm lại việc đã xong.
> - **Trả `isError: true` kèm hai lần reset và lần thành công cuối, để agent điều phối quyết định có chạy lại từ đầu không** (_report as error_). Nghe minh bạch. Ngặt nỗi việc đã xong, gắn cờ lỗi chỉ dễ khiến agent điều phối chạy lại cả việc chuyển dữ liệu một cách vô ích.
>
> **Chọn:** báo kết quả thành công cho cả ba bước, giữ các lần retry bước load ở bên trong subagent thay vì đẩy lên.

## Ghi rõ trong báo cáo phần nào đủ nguồn, phần nào còn thiếu

Quay lại tuần database hải quan bảo trì. Agent điều phối đã dùng bảng tổng hợp tháng cho 4 thị trường còn thiếu, nhưng bảng đó mới có Đức và Bỉ. Ý và Tây Ban Nha vẫn chưa có số. Bản tin vẫn phải gửi đúng giờ.

Phát dặn `tong-hop` thêm vào bản tin, tức báo cáo tổng hợp (**synthesis output**), phần ghi chú độ phủ (**coverage annotations**). Phần này ghi rõ mỗi nội dung có đủ nguồn hay chưa. Nội dung nào có nguồn xác nhận đầy đủ (**well-supported**) thì ghi nguồn đó. Chủ đề nào còn thiếu vì không truy cập được nguồn (**topic areas have gaps due to unavailable sources**) thì ghi rõ thiếu gì và vì sao. Chị Quỳnh đọc phần này là biết con số nào tin được ngay, con số nào phải chờ bổ sung, thay vì tưởng mọi thứ đều đủ.

```
Xuất khẩu tháng 10 theo thị trường
- Đủ nguồn: 10/12 thị trường, theo database hải quan (8) và bảng tổng hợp tháng (Đức, Bỉ).
- Còn thiếu: Ý, Tây Ban Nha. Database hải quan bảo trì, bảng tổng hợp tháng chưa có hai nước này.
  Sẽ bổ sung trong bản tin tuần sau.

Giá robusta London: đủ nguồn, theo API giá sàn, chốt phiên thứ Sáu.
Thời tiết Tây Nguyên: đủ nguồn, 4 bài báo và bản tin khí tượng.
```

> **Ý chính**
>
> Subagent tự retry lỗi tạm thời. Lỗi không tự gỡ được thì báo lên kèm loại lỗi, việc đã thử, kết quả từng phần và cách khác. Khi báo về, subagent tách lỗi truy cập khỏi kết quả rỗng hợp lệ, không trả danh sách rỗng để che lỗi, và một lỗi ở một chỗ không được làm dừng cả quy trình. Báo cáo cuối ghi rõ phần nào đủ nguồn, phần nào còn thiếu.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 5.3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [How we built our multi-agent research system (Anthropic)](https://www.anthropic.com/research/multi-agent-research-system)
3. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/research/writing-tools-for-agents)
4. [MCP specification, Tools (error handling)](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
5. [Handle tool calls (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
