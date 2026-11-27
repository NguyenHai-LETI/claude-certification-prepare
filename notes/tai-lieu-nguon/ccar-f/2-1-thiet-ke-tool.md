---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-1-thiet-ke-tool
ngay_tai: 2026-11-27
tieu_de: Thiết kế tool có mô tả rõ ràng và ranh giới tách bạch
---

Domain 2: Tool Design & MCP Integration · Task 2.1

# Thiết kế tool có mô tả rõ ràng và ranh giới tách bạch

Bài chỉ cách viết mô tả cho rõ, đổi tên, tách hoặc gộp tool để hết chồng chéo, và rà system prompt tìm những câu kéo Claude chọn sai.

- 20 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Hiểu vì sao mô tả tool là thứ chính quyết định Claude chọn tool nào
- Viết mô tả có định dạng đầu vào, câu hỏi mẫu, edge case và ranh giới với tool gần giống
- Đổi tên, tách hoặc gộp tool để hết chồng chéo chức năng
- Dùng mã định danh trong tham số và kết quả tool để bước sau dùng tiếp được
- Rà system prompt tìm những câu bám theo từ khoá kéo Claude sang tool sai

Khi bạn đưa cho Claude nhiều tool, Claude phải tự chọn tool hợp với từng yêu cầu (**tool selection**) và tự điền tham số cho tool đó. Để chọn, Claude dựa chủ yếu vào tên tool và phần mô tả (**description**) bạn viết. Vì vậy, khi agent chọn nhầm tool hay điền sai tham số, chỗ nên xem đầu tiên thường là chính các định nghĩa tool, chưa phải model.

Bài đi qua sáu cách sửa theo thứ tự: viết mô tả cho đủ ý, đổi tên những tool đang chồng chéo, tách tool làm quá nhiều việc, dùng mã định danh thay cho tên trong tham số và kết quả, gộp các tool trùng nghĩa, và rà system prompt tìm những câu vô tình kéo Claude sang tool sai.

**Sơ đồ: Claude chọn tool chỉ dựa vào những gì nó đọc, nên mọi cách sửa đều nhắm vào những thứ đó**
_Bản đồ bài: Claude không thấy code bên trong tool, nó chỉ đọc chữ: description, name, danh sách tool, tham số và kết quả tool, system prompt, rồi chọn tool và điền tham số. Sáu cách sửa theo thứ tự các mục: 1 description đủ ý, nói rõ ranh giới; 2 đổi tên cho hết chồng chéo; 3 tách tool đa năng theo việc; 4 dùng mã định danh thay cho tên trong tham số và kết quả; 5 gộp tool trùng nghĩa; 6 bỏ câu dặn bám từ khoá trong system prompt_

- **CLAUDE ĐỌC GÌ ĐỂ CHỌN TOOL · SÁU CÁCH SỬA**: không thấy code bên trong tool, chỉ đọc chữ dưới đây
- 1. **description**: đủ ý, nói rõ ranh giới
- 2. **name**: đổi tên cho hết chồng chéo
- 3. **danh sách tool**: tách tool đa năng theo việc
- 4. **tham số, kết quả**: mã định danh thay cho tên
- 5. **danh sách tool**: gộp tool trùng nghĩa
- 6. **system prompt**: bỏ câu dặn bám từ khoá
- **Claude**: chọn tool,
- điền tham số

## Ví dụ xuyên suốt: trợ lý cho một văn phòng luật

Một văn phòng luật ở Hà Nội có 12 luật sư, chuyên hợp đồng thuê mặt bằng và tranh chấp thương mại. Đội IT nhỏ của văn phòng dựng một trợ lý trên Claude API để luật sư hỏi đáp hằng ngày. Trợ lý tra văn bản pháp luật và án lệ trên web, đọc hợp đồng khách gửi, ghi tiến độ vào hồ sơ vụ việc của từng khách, tính phí dịch vụ, đặt lịch tư vấn, và soạn danh mục án lệ cho từng hồ sơ. Về sau, bộ phận kế toán cũng dùng trợ lý để giảm phí hay hoàn phí cho khách.

Bản đầu có ba tool được gọi nhiều nhất: `tim_web` tìm trang trên mạng, `phan_tich_noi_dung` và `phan_tich_tai_lieu`. Các tool còn lại sẽ được kể ở mục nói tới chúng.

## Viết mô tả tool cho đủ ý

Hai tool phân tích của bản đầu có mô tả gần như y nhau. `phan_tich_noi_dung` ghi "Phân tích nội dung và trả về kết quả", còn `phan_tich_tai_lieu` ghi "Phân tích tài liệu và trả về kết quả". Thực ra `phan_tich_noi_dung` được viết để đọc các trang web mà `tim_web` trả về, còn `phan_tich_tai_lieu` để đọc file hợp đồng luật sư tải lên. Khi luật sư gõ "phân tích giúp tôi hợp đồng thuê này", có lúc Claude gọi tool này, có lúc gọi tool kia. Log cho thấy khoảng 1 trong 5 yêu cầu đọc hợp đồng bị chuyển nhầm sang tool đọc trang web (**misrouting**).

Claude không nhìn thấy code bên trong tool. Thứ nó đọc được chỉ là tên, mô tả và `input_schema`, tức phần JSON Schema mô tả các tham số. Trong đó, mô tả chi tiết là yếu tố quan trọng nhất, hơn hẳn mọi thứ khác, quyết định tool có được dùng đúng hay không. Hai mô tả na ná nhau thì Claude không có căn cứ gì để phân biệt, nên chọn tool nào thành chuyện may rủi.

Một mô tả tốt trả lời được năm câu hỏi:

1. Tool làm gì, và trả về gì.
2. Khi nào nên dùng, khi nào không, và khác tool gần giống ở chỗ nào. Phần này là ranh giới giữa các tool (**boundary explanations**).
3. Mỗi tham số nghĩa là gì, nhận định dạng nào (**input formats**), và ảnh hưởng tới kết quả ra sao.
4. Có giới hạn hay trường hợp đặc biệt (**edge case**) nào cần biết, chẳng hạn tool trả gì khi không tìm thấy, hay thông tin nào tool không trả.
5. Vài câu hỏi mẫu (**example queries**) mà tool trả lời được, để Claude thấy loại yêu cầu nào thuộc về tool này.

Mỗi mô tả nên dài ít nhất 3–4 câu, tool phức tạp thì dài hơn. Một cách nghĩ dễ áp dụng là viết như đang giải thích tool cho một nhân viên mới vào đội. Những gì bạn ngầm hiểu, như định dạng truy vấn đặc thù, nghĩa của thuật ngữ chuyên ngành hay quan hệ giữa các loại dữ liệu, đều cần viết ra. Với tool có tham số lồng nhau hoặc nhạy định dạng, bạn có thể thêm field `input_examples`, một danh sách ví dụ đầu vào hợp lệ theo `input_schema`. Dù vậy, viết mô tả cho rõ vẫn là việc cần làm trước.

> **Trong đề chọn gì**
>
> Nếu đề bài kể agent chọn nhầm giữa hai tool có mô tả sơ sài, như "Archives a file" và "Deletes a file", và hỏi cách cải thiện việc chọn tool trực tiếp nhất, hãy chọn đáp án viết lại mô tả: nói rõ khi nào dùng, khi nào không dùng (ví dụ "Do not use for backup files"). Chặn ở server, thêm bước xác nhận hay thêm few-shot vào system prompt có thể giảm thiệt hại, nhưng không sửa đúng chỗ Claude dựa vào để chọn. Nếu đề hỏi mô tả nên viết thế nào cho tool tra cứu, hãy chọn đáp án có định dạng đầu vào, câu hỏi mẫu, edge case và ranh giới với tool tương tự, chứ không phải mô tả thật ngắn cho đỡ tốn token, bỏ trống mô tả để Claude tự hiểu từ tên tool, hay chỉ liệt kê các thuộc tính JSON.

## Đổi tên tool cho hết chồng chéo

Viết thêm mô tả cho hai tool giúp được phần nào, nhưng cái tên `phan_tich_noi_dung` vẫn rộng tới mức đọc hợp đồng cũng có vẻ hợp. Hai tool vẫn chồng chéo về chức năng (**functional overlap**). Đội đổi tên nó thành `trich_ket_qua_web`, và viết lại mô tả chỉ nói về trang web:

```json
{
  "name": "trich_ket_qua_web",
  "description": "Đọc các trang web mà tim_web vừa trả về và trích những đoạn liên quan tới câu hỏi, kèm URL nguồn. Dùng cho văn bản pháp luật, án lệ, bài phân tích đăng công khai trên mạng, ví dụ 'mức phạt vi phạm hợp đồng thương mại tối đa là bao nhiêu'. Không dùng cho file hợp đồng hay tài liệu luật sư tải lên: những file đó dùng phan_tich_tai_lieu. Nếu không trang nào có nội dung liên quan, tool trả danh sách rỗng chứ không tự viết câu trả lời.",
  "input_schema": {
    "type": "object",
    "properties": {
      "danh_sach_url": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Các URL lấy từ kết quả của tim_web, tối đa 10 URL."
      },
      "cau_hoi": {
        "type": "string",
        "description": "Câu hỏi cần trả lời bằng nội dung các trang web."
      }
    },
    "required": ["danh_sach_url", "cau_hoi"]
  }
}
```

Sau khi đổi, tên tool đã nói lên phạm vi, và mô tả chỉ thẳng sang tool kia cho trường hợp file hợp đồng. Hai tool không còn vùng nào chồng lên nhau, nên Claude không phải đoán.

Khi số tool tăng dần, có thêm một cách tách bạch nữa là đặt tiền tố theo dịch vụ hay theo loại dữ liệu (**namespacing**), chẳng hạn `web_tim`, `web_trich`, `hop_dong_tom_tat`. Tool gom theo tiền tố thì ranh giới giữa các nhóm hiện ra ngay từ cái tên.

> **Trong đề chọn gì**
>
> Nếu đề bài kể hai tool có mô tả gần như y nhau, như `analyze_content` và `analyze_document`, hãy chọn đáp án đổi tên và viết lại mô tả cho hết chồng chéo, như đổi `analyze_content` thành `extract_web_results` với mô tả chỉ nói về kết quả web.

## Tách tool đa năng thành các tool có việc rõ ràng

Vấn đề lớn hơn nằm ở `phan_tich_tai_lieu`. Tool này nhận một file và một tham số `chi_dan` viết tự do. Luật sư nhờ "trích các mốc thời hạn trong hợp đồng" thì có lúc nhận về một đoạn văn tóm tắt. Nhờ "tóm tắt điều khoản phạt" thì có lúc nhận về một bảng số liệu thô. Bước soạn báo cáo phía sau phải hỏi lại khá thường xuyên, vì không biết lần này tool sẽ trả về dạng gì.

Gốc của chuyện này là một tool gánh ba việc khác hẳn nhau, và việc nào được làm thì tuỳ cách Claude hiểu một câu chỉ dẫn tự do. Đội tách nó thành ba tool theo mục đích (**purpose-specific tools**). Mỗi tool có quy ước rõ ràng về thứ nó nhận và thứ nó trả (**input/output contract**):

| Tool | Nhận | Trả về |
| --- | --- | --- |
| `trich_diem_du_lieu` | mã tài liệu, danh sách loại dữ liệu cần trích (ngày, số tiền, tên bên) | danh sách mục, mỗi mục có giá trị, số trang, câu gốc |
| `tom_tat_noi_dung` | mã tài liệu, độ dài mong muốn | một đoạn văn tóm tắt |
| `doi_chieu_nhan_dinh` | một nhận định, mã tài liệu nguồn | khớp, không khớp hay không đủ căn cứ, kèm đoạn trích làm bằng chứng |

Mỗi tool có tên và mô tả riêng, nên yêu cầu "trích mốc thời hạn" chỉ khớp với một tool, và kết quả lần nào cũng cùng một dạng. Đội cũng sửa mô tả của `trich_ket_qua_web`, để phần "không dùng cho file hợp đồng" giờ chỉ sang ba tool mới.

**Sơ đồ: Hai tool na ná nhau thì 1 trong 5 yêu cầu đi nhầm; đổi tên và tách xong, mỗi việc chỉ khớp một tool**
_Trước: luật sư gõ phân tích giúp tôi hợp đồng thuê này; hai tool phan_tich_noi_dung và phan_tich_tai_lieu có mô tả gần như y nhau, Phân tích nội dung và trả về kết quả, Phân tích tài liệu và trả về kết quả, nên khoảng 1 trong 5 yêu cầu đọc hợp đồng bị chuyển sang tool đọc trang web. Sau: phan_tich_noi_dung đổi tên thành trich_ket_qua_web, chỉ đọc trang web mà tim_web trả về, mô tả chỉ sang ba tool khác cho file hợp đồng; phan_tich_tai_lieu tách thành trich_diem_du_lieu trả danh sách mục có giá trị, số trang, câu gốc; tom_tat_noi_dung trả một đoạn văn tóm tắt; doi_chieu_nhan_dinh trả khớp, không khớp hay không đủ căn cứ kèm đoạn trích_

- **Trước: hai tool có mô tả gần như y nhau**: Luật sư gõ
- “Phân tích giúp tôi
- hợp đồng thuê này”
- **phan_tich_noi_dung**: “Phân tích nội dung và trả về kết quả”
- **phan_tich_tai_lieu**: “Phân tích tài liệu và trả về kết quả”
- **1 trong 5**
- **Sau: đổi tên một tool, tách tool kia thành ba**
- **trich_ket_qua_web**: chỉ đọc trang web
- mà tim_web trả về
- trước là phan_tich_noi_dung
- file hợp đồng thì mô tả
- chỉ sang ba tool này
- **TÁCH TỪ PHAN_TICH_TAI_LIEU**
- **trich_diem_du_lieu**: → danh sách mục: giá trị, số trang, câu gốc
- **tom_tat_noi_dung**: → một đoạn văn tóm tắt
- **doi_chieu_nhan_dinh**: → khớp, không khớp hay không đủ căn cứ

Một tool khác cũng gặp chuyện tương tự ở mức tham số. `tinh_phi` nhận `loai_viec`, `so_luong` và `don_vi`. Phí tư vấn tính theo giờ, phí soạn hợp đồng tính theo trang, nhưng Claude thỉnh thoảng truyền `don_vi: "giờ"` cho việc soạn thảo. Đội tách thành `tinh_phi_tu_van(so_gio)` và `tinh_phi_soan_thao(so_trang)`. Mỗi tool chỉ có đúng tham số hợp lệ cho loại việc của nó, nên không còn cách nào viết ra tổ hợp sai. Thêm ví dụ vào mô tả thì Claude vẫn có thể viết sai, còn kiểm tổ hợp ở server chỉ bắt được lỗi sau khi Claude đã viết sai.

> **Bẫy đề**
>
> Một tool `analyze_document` nhận chỉ dẫn tự do, và kết quả lúc là văn xuôi, lúc là bảng, khiến nhiều yêu cầu phải hỏi lại. Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Giữ một tool, thêm tham số enum chọn chế độ** (_add a mode or analysis_type enum_). Nghe như có enum thì Claude buộc phải chọn rõ. Nhưng cả ba chế độ vẫn dùng chung một mô tả và một dạng đầu ra, nên ranh giới giữa các việc vẫn mờ như cũ.
> - **Thêm ví dụ vào mô tả, chỉ cách diễn đạt nào ứng với đầu ra nào** (_add detailed examples to the description_). Nghe như ví dụ sẽ dạy Claude cách hiểu đúng. Có điều gốc lỗi là chỉ dẫn tự do, và ví dụ không thay được một contract đầu ra cố định.
> - **Cho agent điều phối phân loại yêu cầu trước** (_have the coordinator pre-classify requests_). Nghe chặt chẽ vì có thêm một bước lọc. Ngặt nỗi tool phía sau vẫn nhận chỉ dẫn tự do và vẫn trả dạng không đoán được.
>
> **Chọn:** tách thành các tool theo mục đích, như `extract_data_points`, `summarize_content` và `verify_claim_against_source`, mỗi tool một mô tả và một contract riêng. Gộp nó vào một tool `process_document` rộng hơn, hay dặn trong system prompt "gọi tool một lần cho mỗi việc", cũng không được, vì chỉ dẫn vẫn tự do. Với tool có các tổ hợp tham số dễ sai (đơn vị đo, loại thao tác), cũng chọn tách thành các tool chỉ nhận đúng tham số của mình, thay vì enum, `if-then-else` trong JSON Schema, object lồng nhau hay few-shot.

## Dùng mã định danh (ID) thay cho tên trong tham số và kết quả

Trợ lý có một tool `cap_nhat_ho_so(ten_khach, ngay_ky, loai_hop_dong)` để ghi tiến độ vào hồ sơ vụ việc. Log cho thấy nó hay ghi nhầm hồ sơ. Claude viết tên khách lúc có dấu lúc không, ghi ngày lúc theo kiểu 05/03 lúc theo kiểu 2026-03-05. Có khách thuê hai mặt bằng và ký cả hai trong cùng tháng, nên văn phòng có hai hồ sơ trùng tên khách, trùng loại hợp đồng.

Đội bỏ ba tham số đó, thay bằng một tham số `ma_ho_so`, và thêm tool `tim_ho_so` trả về các hồ sơ khớp kèm mã của từng hồ sơ. Việc tìm cho ra hồ sơ nào được tách khỏi việc ghi tiến độ. Claude tìm trước để lấy mã chính xác, rồi mới ghi bằng mã đó.

Kết quả của `tim_ho_so` cũng phải dùng được cho bước sau. Bản đầu trả về một câu như "Tìm thấy 2 hồ sơ: Thuê mặt bằng Cầu Giấy, Thuê mặt bằng Đống Đa". Claude đọc được, nhưng muốn mở hồ sơ thứ hai thì không có mã nào để truyền tiếp. Bản sửa trả dữ liệu có cấu trúc: mỗi hồ sơ một mã ổn định, kèm vài field cần cho bước sau như tên khách và ngày ký. Kết quả tool chỉ nên chứa thông tin đáng giá, kèm mã có nghĩa và ổn định thay cho các mã nội bộ khó hiểu. Kết quả càng dài thì càng chiếm chỗ trong context (phần văn bản Claude đọc ở mỗi lần gọi), và Claude càng khó nhặt ra thứ cần.

Ngay sau khi đổi sang `ma_ho_so`, đội gặp một lỗi mới. Luật sư nhờ "ghi giúp tiến độ hồ sơ anh Bình", và có lần Claude gọi thẳng `cap_nhat_ho_so` với một mã trông rất hợp lý nhưng không tồn tại, thay vì gọi `tim_ho_so` trước. Mô tả lúc đó chỉ ghi "mã hồ sơ", không nói mã phải lấy từ đâu. Đội viết lại mô tả tham số: "`ma_ho_so`: mã hồ sơ dạng HS-2026-0412, lấy từ kết quả của `tim_ho_so`. Không bao giờ tự đặt hay đoán mã." Từ đó Claude luôn tra trước rồi mới ghi.

Chuyện này cho thấy mô tả từng tham số cũng quan trọng không kém mô tả tool, vì Claude điền tham số theo những gì nó đọc được về tham số đó:

- Tên tham số nên rõ nghĩa: `ma_ho_so` chứ không phải `ho_so`, cũng như nên đặt `user_id` thay cho `user`.
- Mô tả tham số nói rõ định dạng và nguồn của giá trị, như câu mô tả `ma_ho_so` của đội.
- Tool nhận một nhóm field tuỳ chọn thì mô tả liệt kê những field cập nhật được, và nói tool có nhận cập nhật một phần hay không. Thiếu hai điều này, Claude sẽ tự nghĩ ra field mà schema không có.

> **Bẫy đề**
>
> Tool `update_game_score(game_date, home_team, away_team)` hay ghi nhầm trận: agent dùng biệt danh đội, ghi ngày mỗi lần một kiểu, và chọn sai khi hai đội gặp lại nhau trong cùng mùa. Đổi interface thế nào để chặn được cả ba lỗi? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm enum tên đội và regex ép định dạng ngày ISO 8601** (_enum constraints and regex pattern_). Nghe như khoá được cả tên lẫn ngày. Nhưng hai trận cùng hai đội trong một mùa vẫn không phân biệt được.
> - **Thêm tham số `season` và cờ `confirm_before_update`** (_add a season parameter and a confirmation flag_). Nghe như vừa phân biệt được trận, vừa có bước kiểm lại. Có điều agent vẫn phải tự viết tên đội và ngày, nên lỗi biệt danh và lỗi định dạng vẫn còn.
> - **Thêm ví dụ định dạng ngày và danh sách tên đội vào mô tả** (_add detailed examples to the description_). Nghe như đủ thông tin để điền đúng. Ngặt nỗi đây vẫn là ba tham số chữ mà Claude phải tự ghép, và trận gặp lại vẫn mơ hồ.
>
> **Chọn:** thay ba tham số bằng một `game_id`, kèm một tool `search_games` riêng trả về các mã trận khớp.

> **Trong đề chọn gì**
>
> Nếu đề hỏi tool tìm kiếm nên trả về gì để agent làm tiếp nhiều bước, hãy chọn dữ liệu có cấu trúc gồm mã và metadata của từng kết quả. Danh sách tiêu đề, URL cho người bấm, hay mô tả dễ đọc cho người (_human-readable descriptions_) dù chi tiết hơn vẫn không cho bước sau một mã để truyền tiếp. Nếu agent bịa một mã trông hợp lý thay vì tra trước, hãy chọn đáp án sửa mô tả của tool, nói rõ mã phải lấy từ tool tra cứu và không được tự tạo. Đổi `tool_choice` sang `any` chỉ ép agent gọi tool chứ không ép gọi đúng tool tra cứu. Kiểm mã ở server chỉ bắt lỗi sau khi đã bịa. Tiền xử lý tin nhắn để bóc mã cũng vô ích khi khách không hề nhắc mã nào. Nếu đề hỏi điều gì quan trọng nhất để Claude truyền đúng tham số, hãy chọn mô tả tham số nói rõ định dạng, như "user_id: UUID of the user to update (required)". Tên tham số dài kiểu `user_id_string_uuid_format`, lỗi trả về chi tiết hơn hay kiểu JSON Schema chặt hơn đều không cho Claude biết giá trị cần điền là gì. Nếu đề kể model truyền field không có trong schema, hãy chọn lỗ hổng là mô tả không liệt kê field hợp lệ và không nói có nhận cập nhật một phần hay không. Thứ tự khai báo tool, hay chuyện camelCase với snake_case, không gây ra lỗi này. Bắt Claude gửi đủ mọi field ở mỗi lần gọi cũng không phải cách sửa.

## Khi nào nên gộp tool

Tách không phải lúc nào cũng đúng. Nhiều khi nên gộp các thao tác liên quan vào ít tool hơn (**consolidate**), vì ít tool mà mỗi tool làm được nhiều thì Claude ít phải phân vân hơn. Hai lời khuyên không mâu thuẫn nhau. Tách khi một tool gánh nhiều việc khác hẳn nhau và kết quả tuỳ vào một chỉ dẫn mơ hồ. Gộp khi nhiều tool thực ra cùng nghĩa, hoặc lúc nào cũng phải gọi nối nhau.

Trợ lý của văn phòng có ba chỗ cần gộp.

Chỗ thứ nhất là các tool trùng nghĩa. Khi văn phòng thêm nhóm tool cho bộ phận kế toán cùng vài tool tra cứu, bộ tool phình thêm 5 tool. Bộ eval của đội (tập câu hỏi mẫu dùng để chấm trợ lý) cho thấy Claude chọn đúng tool ít hẳn đi. Phần lớn lỗi rơi vào hai cặp: `giam_phi` với `hoan_phi`, và `xem_tien_do` với `tim_ho_so` (hai tool cùng tra hồ sơ, `xem_tien_do` chỉ thêm phần tiến độ). Đội gộp `giam_phi` và `hoan_phi` thành `dieu_chinh_phi` có tham số `hanh_dong`, và gộp `xem_tien_do` vào `tim_ho_so` bằng một tham số tuỳ chọn `kem_tien_do`. Không còn hai tool cùng nghĩa thì Claude không thể chọn nhầm giữa chúng.

Chỗ thứ hai là hai tool luôn gọi nối nhau, mà trong khoảng giữa hai lần gọi có thể có người chen vào. Đặt lịch tư vấn cần gọi `xem_gio_trong(luat_su, ngay)` rồi mới gọi `dat_lich(luat_su, gio, ma_khach)`. Khoảng 15% lần đặt thất bại, vì trong lúc Claude chuẩn bị gọi tool thứ hai thì giờ đó đã có người khác đặt mất. Đội gộp thành một tool `dat_lich_tu_van`, kiểm giờ trống và đặt lịch trong cùng một thao tác. Tool trả về lịch đã xác nhận, hoặc danh sách giờ khác còn trống nếu giờ yêu cầu đã hết. Không còn khoảng hở giữa lúc kiểm và lúc đặt, nên lỗi này cũng hết.

**Sơ đồ: Kiểm giờ và đặt lịch là hai lần gọi thì có người chen giữa; gộp làm một thì hết khoảng hở**
Bên tham gia: Người đặt khác, Hệ thống lịch, Claude

1. xem_gio_trong(luat_su, ngay)
2. giờ đó còn trống
3. đặt mất giờ đó
4. dat_lich(luat_su, gio, ma_khach)
5. thất bại: giờ đã có người đặt
6. dat_lich_tu_van: kiểm và đặt cùng một thao tác
7. lịch đã xác nhận, hoặc giờ khác còn trống

Chỗ thứ ba là chuỗi gọi quá dài. Để soạn danh mục án lệ cho một hồ sơ, Claude gọi `tim_an_le(chu_de)`, rồi gọi `danh_gia_an_le(ma)` cho từng án lệ, rồi `them_vao_ho_so(ma, ma_ho_so)` cho án lệ được chọn. Một yêu cầu tốn hơn 18 lần gọi nối tiếp. Đội gộp hai tool đầu thành `tim_va_danh_gia_an_le(chu_de)`, trả về mọi án lệ ứng viên kèm điểm đánh giá trong một lần gọi. `them_vao_ho_so` vẫn để riêng. Claude nhìn toàn bộ danh sách cùng điểm số rồi tự chọn những án lệ hợp với hồ sơ. Việc cân nhắc chọn án lệ nào vẫn do Claude làm, chỉ bớt đi các lần gọi thừa.

> **Bẫy đề**
>
> Sau khi thêm nhóm tool mới, độ chính xác chọn tool giảm, và log cho thấy lỗi tập trung ở các cặp tool chồng chéo về nghĩa, như `issue_credit` với `process_refund`. Cách nào loại bỏ tận gốc chỗ chồng chéo? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Chia tool cho hai subagent cùng một agent điều phối** (_split tools across specialized sub-agents_). Nghe như mỗi agent ít tool hơn thì dễ chọn hơn. Nhưng `issue_credit` và `process_refund` vẫn nằm chung một agent, nên cặp trùng nghĩa vẫn còn.
> - **Bật tool search với `defer_loading` cho các tool mới** (_defer loading the new tools_). Tool search là cơ chế chỉ nạp định nghĩa tool khi Claude tìm tới, nên nghe như giảm được số tool phải chọn. Có điều khi cần, Claude vẫn phải chọn giữa hai tool cùng nghĩa.
> - **Thêm few-shot vào system prompt cho từng cặp dễ nhầm** (_few-shot examples per confusable pair_). Nghe như ví dụ sẽ dạy Claude phân biệt. Ngặt nỗi hai tool vẫn trùng nghĩa, nên đây là vá chứ không phải bỏ gốc.
>
> **Chọn:** gộp từng cặp trùng nghĩa thành một tool (thêm tham số `action` hay cờ tuỳ chọn như `include_tracking`). Với hai tool kiểm rồi mới làm mà bị người khác chen giữa, chọn gộp thành một tool làm cả hai việc trong một thao tác, thay vì thêm tool giữ chỗ tạm, retry hay trả lỗi chi tiết hơn. Với chuỗi gọi dài mà vẫn cần agent tự cân nhắc, chọn gộp phần tìm và đánh giá nhưng giữ riêng bước ra quyết định. Một tool tự chọn theo ngưỡng cấu hình sẵn, hay cặp tool xem trước rồi duyệt theo luật cố định, đều lấy mất phần cân nhắc của agent. Thêm cache cho bước đánh giá thì không bớt được lần gọi nào.

## Rà system prompt tìm câu bám theo từ khoá

Sau khi sửa tool, đội vẫn thấy một lỗi lạ. Luật sư hỏi "kiểm tra giúp hợp đồng này còn bao lâu thì hết hạn", và Claude gọi `doi_chieu_nhan_dinh` thay vì `trich_diem_du_lieu`. Mô tả của hai tool đã rõ ràng. Thủ phạm nằm trong system prompt, ở câu đội thêm lúc dựng ba tool mới: "Khi người dùng nhắc tới 'kiểm tra' hoặc 'xác minh', hãy dùng tool đối chiếu".

Khi request có tham số `tools`, API ghép định nghĩa các tool và system prompt của bạn vào cùng một system prompt, nên Claude đọc cả hai cùng lúc. Một câu dặn gắn với từ khoá (**keyword-sensitive instruction**) như câu của đội tạo ra một liên kết ngoài ý muốn giữa chữ "kiểm tra" và một tool (**unintended tool associations**). Liên kết đó có thể lấn át cả mô tả tool đã viết kỹ. Mà chữ "kiểm tra" trong tiếng Việt lại dùng cho đủ thứ việc.

**Sơ đồ: Câu dặn bám chữ “kiểm tra” trong system prompt lấn át cả mô tả tool đã viết kỹ**
- bám từ khoá
- bị gọi
- đúng ra phải gọi
- “Kiểm tra giúp hợp đồng nàycòn bao lâu thì hết hạn”
- System prompt:nhắc tới “kiểm tra”thì dùng tool đối chiếu
- Mô tả hai toolđã rõ ràng
- Claude chọn tool
- doi_chieu_nhan_dinhnhận định có đúng không
- trich_diem_du_lieutrích ngày hết hạn

Đội xoá câu dặn đó, rồi rà cả system prompt tìm những câu cùng kiểu, tức câu nào gắn một từ cụ thể với một tool cụ thể. Chỗ nào cần nói khi nào dùng tool nào thì đưa vào mô tả tool, và mô tả theo ý định của người dùng chứ không theo chữ họ gõ. Ví dụ, mô tả của `doi_chieu_nhan_dinh` ghi "Dùng khi cần biết một nhận định cụ thể có đúng với tài liệu nguồn không", thay vì dựa vào chữ "kiểm tra".

> **Ý chính**
>
> Claude chọn tool và điền tham số theo những gì nó đọc được: tên, mô tả, schema và system prompt. Mô tả phải đủ ý và tách bạch với tool gần giống. Tool làm nhiều việc khác nhau thì tách, các tool trùng nghĩa hay luôn gọi nối nhau thì gộp. Tham số và kết quả dùng mã định danh lấy từ tool tra cứu, không dùng tên. Câu nào trong system prompt gắn một từ khoá với một tool thì sửa lại.

> **Trong đề chọn gì**
>
> Nếu đề bài kể các tool đã có mô tả tốt mà agent vẫn chọn nhầm mỗi khi người dùng dùng một từ nhất định, hãy nghĩ tới system prompt: chọn đáp án rà system prompt tìm câu dặn bám theo từ khoá.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 2.1](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Define tools (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
3. [Tool use overview (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
4. [Writing effective tools for agents (Anthropic)](https://www.anthropic.com/research/writing-tools-for-agents)
