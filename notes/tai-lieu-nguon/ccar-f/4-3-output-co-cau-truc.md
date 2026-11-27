---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/4-3-output-co-cau-truc
ngay_tai: 2026-11-27
tieu_de: Ép đầu ra có cấu trúc bằng tool use và JSON schema
---

Domain 4: Prompt Engineering & Structured Output · Task 4.3

# Ép đầu ra có cấu trúc bằng tool use và JSON schema

Lấy dữ liệu đúng schema qua tool use, chọn tool_choice hợp tình huống, biết schema không kiểm được nghĩa, dùng null, enum other và unclear để Claude khỏi bịa.

- 18 phút đọc
- Đối chiếu docs 22/11/2026
- 4 nguồn

## Đọc xong bạn nắm được

- Định nghĩa tool trích xuất có JSON schema và lấy dữ liệu từ khối tool_use
- Phân biệt tool_choice auto, any và ép một tool cụ thể, biết khi nào dùng cái nào
- Hiểu schema chặt bỏ được lỗi cú pháp nhưng không chặn được lỗi về nghĩa
- Cho field nhận null khi tài liệu có thể không có thông tin, để Claude khỏi bịa
- Dùng enum có other kèm field chi tiết, giá trị unclear, và luật chuẩn hoá định dạng trong prompt

Khi Claude trích dữ liệu cho một hệ thống khác dùng, kết quả phải là JSON đúng khuôn. Chỉ cần thiếu một dấu ngoặc hay một field sai kiểu là bước phía sau từ chối cả bản ghi. Dặn Claude "chỉ trả về JSON" trong prompt thì phần lớn lần sẽ chạy, nhưng "phần lớn" là chưa đủ cho một pipeline xử lý hàng nghìn tài liệu mỗi ngày.

Bài này chỉ cách dùng **tool use** với JSON schema để lấy dữ liệu đúng khuôn, chọn `tool_choice` cho từng tình huống, và thiết kế schema sao cho Claude không phải bịa để lấp chỗ trống. Bạn cũng sẽ thấy vì sao đúng schema vẫn chưa chắc đúng nghĩa.

**Sơ đồ: Tool có input_schema giữ đúng khuôn, schema chừa chỗ nói "không rõ", đúng nghĩa thì code kiểm**
_Bản đồ bài: request gửi Claude gồm tài liệu nguồn, extraction tool có JSON schema làm input_schema và strict true (schema có field nhận null, enum có other kèm chi tiết, giá trị unclear), tool_choice auto, any hay tool, và prompt có luật chuẩn hoá định dạng cùng câu dặn trả null; Claude gọi tool, code đọc input của khối tool_use, strict bỏ lỗi cú pháp nhưng lỗi nghĩa phải kiểm bằng code rồi mới đẩy sang hệ thống phía sau_

- **REQUEST GỬI CLAUDE**
- **Tài liệu nguồn**: chứng từ chụp hoặc scan
- **Extraction tool**: strict: true
- input_schema chừa chỗ cho "không có":
- nullable
- other + detail
- unclear
- **tool_choice**: auto
- any
- tool
- **Prompt**: luật chuẩn hoá định dạng
- field không ghi thì trả null
- **Claude gọi tool**
- **Khối tool_use**: code đọc input, không parse chữ
- hết lỗi cú pháp
- **Kiểm nghĩa bằng code**: schema không chặn lỗi nghĩa
- khớp thì đẩy tiếp
- **Hệ thống phía sau**

## Ví dụ xuyên suốt: số hoá chứng từ cho một công ty dịch vụ kế toán

Một công ty dịch vụ kế toán ở Hải Dương làm sổ sách cho khoảng 200 doanh nghiệp nhỏ. Mỗi tháng công ty nhận khoảng 9.000 chứng từ chụp hoặc scan, gồm hoá đơn giá trị gia tăng, hợp đồng và phiếu chi. Đội công nghệ có 5 dev, anh Toàn là trưởng nhóm. Quyên, một dev trong nhóm, phụ trách pipeline gọi Claude Haiku 5.5 để trích dữ liệu từ chứng từ rồi đẩy vào phần mềm kế toán. Kế toán viên của công ty đối chiếu số liệu trước khi chốt sổ, và công ty có sẵn một danh bạ doanh nghiệp để tra mã số thuế.

## Lấy dữ liệu qua tool use

Bản đầu, Quyên viết prompt "Trích hoá đơn sau thành JSON theo schema này, chỉ trả về JSON", rồi parse phần chữ Claude trả về. Khoảng 3% kết quả bị hỏng. Có lần JSON bị bọc trong khối markdown, có lần Claude viết thêm một câu giải thích phía trước, có lần thiếu dấu ngoặc ở cuối.

Quyên chuyển sang tool use, tức là đưa cho Claude một tool để "gọi" thay vì xin nó viết JSON ra phần chữ. Quyên định nghĩa một tool trích xuất, dùng JSON schema (bản mô tả có những field nào, mỗi field kiểu gì) làm tham số đầu vào của tool (**extraction tools with JSON schemas as input parameters**). Claude "gọi" tool đó và điền dữ liệu đã trích vào tham số. Code của Quyên không chạy hàm nào cả. Nó chỉ đọc phần `input` trong khối `tool_use`, tức phần của response cho biết Claude gọi tool nào với tham số gì (**extracting structured data from the tool_use response**).

```python
tool_hoa_don = {
    "name": "trich_hoa_don",
    "description": "Ghi lại dữ liệu trích từ một hoá đơn giá trị gia tăng.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "so_hoa_don": {"type": "string"},
            "ngay_lap": {"type": "string", "format": "date"},
            "ma_so_thue_ban": {"type": "string"},
            "dong_hang": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "ten_hang": {"type": "string"},
                        "thanh_tien": {"type": "number"}
                    },
                    "required": ["ten_hang", "thanh_tien"],
                    "additionalProperties": False
                }
            },
            "tong_tien_hang": {"type": "number"},
            "tien_thue_gtgt": {"type": "number"},
            "tong_thanh_toan": {"type": "number"}
        },
        "required": ["so_hoa_don", "ngay_lap", "ma_so_thue_ban", "dong_hang",
                     "tong_tien_hang", "tien_thue_gtgt", "tong_thanh_toan"],
        "additionalProperties": False
    }
}

khoi_tool = next(k for k in response.content if k.type == "tool_use")
du_lieu = khoi_tool.input   # đã là dict đúng schema, không cần parse chữ
```

Có một chỗ đề thi và Claude API hiện nay vênh nhau. Đề thi coi tool use với JSON schema là cách chắc nhất để có output đúng schema, không còn lỗi cú pháp JSON (**guaranteed schema-compliant structured output**). Nhưng trên Claude API hiện nay, nếu chỉ dùng tool use bình thường, Claude vẫn có thể trả sai kiểu (`"2"` thay vì `2`) hoặc bỏ sót field bắt buộc. Muốn input của tool chắc chắn khớp schema, bạn đặt `strict: true` trên định nghĩa tool (strict tool use), như Quyên đã làm. Claude API còn có structured outputs: bạn đặt schema ở `output_config.format`, và phần chữ Claude trả về sẽ phải theo đúng schema đó, không cần qua tool. Còn khi đi thi, gặp câu hỏi cần output đúng khuôn thì bạn chọn tool use với JSON schema.

> **Bẫy đề**
>
> Hệ thống phải lấy thông tin sự kiện từ lời mời họp trong lịch, rồi xuất JSON khớp tuyệt đối với schema gồm title, date, time, location, attendees. Hệ thống phía sau từ chối mọi JSON hỏng hay sai schema. Cách nào chắc nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Đưa chỉ dẫn định dạng JSON và schema vào prompt, rồi parse câu trả lời dạng chữ** (_instructions then parse text_). Cách Quyên làm ở bản đầu nghe đủ dùng. Nhưng chữ vẫn có thể kèm câu giải thích hay thiếu ngoặc, và parse hỏng là mất bản ghi.
> - **Điền sẵn dấu `{` vào đầu câu trả lời để buộc Claude viết tiếp JSON** (_prefill an opening brace_). Nghe như ép được khuôn từ ký tự đầu. Có điều từ các model Claude 4.6 trở đi, API không còn cho điền sẵn phần đầu câu trả lời của Claude (prefill) nữa. Mà kể cả còn dùng được, cách này cũng không kiểm gì về schema.
> - **Dặn "Output only valid JSON matching the schema exactly" và retry khi parse lỗi** (_instructions plus retry_). Nghe như có lưới an toàn. Ngặt nỗi lời dặn không bảo đảm gì, còn retry chỉ chữa sau khi đã hỏng.
>
> **Chọn:** định nghĩa một tool nhận đúng schema cần xuất làm tham số đầu vào, để Claude gọi tool đó và điền dữ liệu đã trích vào.

> **Trong đề chọn gì**
>
> Nếu đề kể dữ liệu trích từ CV phải khớp tuyệt đối một JSON schema, vì chỉ cần thiếu field hay sai kiểu là bước sau hỏng, hãy chọn định nghĩa một tool có input schema khớp cấu trúc cần, rồi lấy dữ liệu từ khối `tool_use`. Gọi API hai lần (trích chữ rồi nhờ định dạng thành JSON) là thêm một lần gọi mà vẫn xin JSON trong chữ. Đưa chỉ dẫn định dạng kèm một ví dụ mẫu vào prompt thì vẫn chỉ là lời dặn mà Claude có thể không theo. Parse bằng regex kèm retry là vá ở phía sau thay vì ràng buộc ngay ở tầng API.

## Chọn tool_choice: auto, any hay ép một tool

Pipeline nhận ba loại chứng từ, mỗi loại một tool có schema riêng: `trich_hoa_don`, `trich_hop_dong`, `trich_phieu_chi`. Quyên chưa đặt gì cho `tool_choice`, nên nó nhận giá trị mặc định. Với khoảng 2% chứng từ, Claude không gọi tool nào mà trả lời bằng chữ, kiểu "Đây có vẻ là một phiếu chi viết tay, chữ hơi mờ". Bước phía sau không nhận được JSON nào.

Field `tool_choice` (**tool_choice**) trong request quyết định Claude có bắt buộc gọi tool không, và nếu có thì gọi tool nào. Nó có bốn giá trị.

| Giá trị | Claude làm gì | Dùng khi |
| --- | --- | --- |
| `{"type": "auto"}` | Tự quyết gọi tool hay trả lời bằng chữ. Đây là mặc định khi có `tools` | Hội thoại thường, có lúc không cần tool |
| `{"type": "any"}` | Bắt buộc gọi một tool, nhưng tự chọn tool nào | Có nhiều schema trích xuất và chưa biết loại tài liệu |
| `{"type": "tool", "name": "..."}` | Bắt buộc gọi đúng tool được nêu tên | Một bước trích phải chạy trước các bước khác |
| `{"type": "none"}` | Không gọi tool nào | Muốn câu trả lời chỉ có chữ |

Với `auto`, Claude được phép trả chữ thay vì gọi tool (**model may return text instead of calling a tool**), nên mới có 2% chứng từ không ra JSON. `any` buộc Claude gọi một tool nhưng để nó tự chọn tool nào (**must call a tool but can choose which**), còn ép theo tên (**forced tool selection**) thì chỉ cho gọi đúng một tool.

Quyên đổi sang `tool_choice: {"type": "any"}` với cả ba tool. Claude luôn gọi một tool, và vẫn tự chọn tool hợp với loại chứng từ, chỉ trong một lần gọi. Đây đúng là lúc nên dùng `any`: có nhiều schema trích xuất mà chưa biết trước tài liệu thuộc loại nào (**multiple extraction schemas exist and the document type is unknown**), và lần nào cũng cần nhận về output có cấu trúc.

Sau đó anh Toàn muốn thêm một bước bổ sung dữ liệu, là đối chiếu mã số thuế người bán với danh bạ doanh nghiệp. Muốn đối chiếu thì phải có sẵn thông tin chung của chứng từ trước, gồm loại chứng từ, ngày và mã số thuế. Quyên viết thêm tool `trich_thong_tin_chung` chỉ để lấy mấy thông tin đó, rồi ép Claude gọi nó ở lần gọi đầu bằng `tool_choice: {"type": "tool", "name": "trich_thong_tin_chung"}`. Các lần gọi sau mới đối chiếu mã số thuế, rồi dùng lại `any` với ba tool theo loại chứng từ. Ép theo tên là cách chắc chắn để một bước trích chạy trước các bước bổ sung (**ensure a particular extraction runs before enrichment steps**).

**Sơ đồ: auto cho Claude trả chữ, any buộc gọi một trong ba tool, ép tool thì bước đó chạy trước**
_Ba cột cho ba giá trị tool_choice với các tool của Quyên. auto: Claude tự quyết có gọi tool, được chọn trich_hoa_don, trich_hop_dong, trich_phieu_chi hay trả lời bằng chữ, nên 2% chứng từ chỉ có chữ, bước sau không có JSON. any: phải gọi một trong ba tool, không còn trả bằng chữ, luôn có tool_use trong một lần gọi. tool: lần gọi đầu chỉ được gọi trich_thong_tin_chung, tool khác và trả chữ đều không được, các lần gọi sau mới đối chiếu mã số thuế với danh bạ_

- **AUTO, MẶC ĐỊNH**
- **Claude**: tự quyết có gọi tool
- trich_hoa_don
- trich_hop_dong
- trich_phieu_chi
- trả lời bằng chữ
- **2% chứng từ**: chỉ có chữ, không có JSON
- **ANY**
- **Claude**: phải gọi, tự chọn tool
- trich_hoa_don
- trich_hop_dong
- trich_phieu_chi
- không còn trả bằng chữ
- **Luôn có tool_use**: trong một lần gọi
- **TOOL, ÉP THEO TÊN**
- **Claude**: gọi đúng tool đã nêu
- trich_thong_tin_chung
- gọi tool khác hay trả chữ
- đều không được ở lần đầu
- **Lần gọi sau mới**: đối chiếu mã số thuế

Ở chỗ này, đề thi và Claude API hiện nay cũng vênh nhau. Trên một số model mới nhất như Claude Opus 5.5, Claude Sonnet 5.5 và Claude Fable 5.2, `tool_choice` là `any` hay `tool` trả về lỗi 400. Hai giá trị này cũng báo lỗi khi bạn bật extended thinking (cho Claude suy nghĩ trước khi trả lời) theo kiểu tự đặt số token suy nghĩ. Trên những model đó, bạn dùng `auto` kèm strict tool use, hoặc structured outputs. Đội của Quyên dùng Claude Haiku 5.5, model vẫn nhận ép tool, nên cả `any` lẫn ép `trich_thong_tin_chung` đều chạy được. Còn khi đi thi, gặp câu hỏi về `any` hay ép tool, bạn cứ trả lời theo đúng cách bốn giá trị của `tool_choice` hoạt động.

> **Bẫy đề**
>
> Pipeline nhận hoá đơn, hợp đồng, biên lai, mỗi loại một tool trích xuất có schema riêng. Với `tool_choice: "auto"`, Claude đôi khi trả lời bằng chữ thay vì gọi tool. Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm một lần gọi phân loại trước, rồi gọi lần hai ép vào tool đã xác định** (_classify then force_). Nghe chắc chắn từng bước. Nhưng cách này tốn hai lần gọi cho việc `any` làm được trong một.
> - **Gộp mọi loại tài liệu vào một tool với một schema chung rồi ép dùng tool đó** (_one merged schema_). Cách này bảo đảm lần nào cũng có tool được gọi. Có điều schema chung phải chứa field của cả ba loại, nên mất phần chặt chẽ của từng schema.
> - **Giữ `auto`, thêm chỉ dẫn trong system prompt bắt buộc dùng tool** (_auto plus instructions_). Nghe như nhắc là đủ. Ngặt nỗi với `auto`, gọi tool hay không vẫn là quyền của Claude, lời dặn không bảo đảm gì.
>
> **Chọn:** đặt `tool_choice: "any"` với tất cả tool trích xuất.

> **Trong đề chọn gì**
>
> Nếu đề kể agent đôi lúc bỏ qua `extract_metadata` để trả lời thẳng, rồi hỏi cách chắc nhất để bước trích metadata luôn chạy trước, hãy chọn `tool_choice` loại `tool` với tên `extract_metadata`, rồi xử lý phần bổ sung ở các lần gọi sau. `auto` kèm lời dặn ưu tiên metadata không bảo đảm gì. Xếp `extract_metadata` lên đầu danh sách tool cũng vô ích, vì Claude không ưu tiên tool theo thứ tự. `any` kèm chỉ dẫn "gọi extract_metadata trước" vẫn để Claude được chọn tool khác.

## Đúng schema chưa chắc đúng nghĩa

Nhờ strict, không còn bản ghi nào hỏng khuôn. Nhưng khi kế toán viên đối chiếu, chị phát hiện một hoá đơn có tổng các dòng hàng là 12.400.000 đồng, trong khi `tong_tien_hang` ghi 14.200.000 đồng. Ở một hoá đơn khác, số tiền thuế 1.240.000 đồng lại nằm trong field `tong_tien_hang`, còn `tien_thue_gtgt` thì chứa tổng tiền hàng.

Cả hai bản ghi đều đúng schema: đủ field, đúng kiểu số. Schema chặt bỏ được lỗi cú pháp (**eliminate syntax errors**) nhưng không chặn được lỗi về nghĩa (**do not prevent semantic errors**). Hai hoá đơn của Quyên là đúng hai kiểu lỗi nghĩa hay gặp. Một cái có các dòng hàng cộng lại không bằng tổng (**line items that don't sum to total**), cái kia có giá trị nằm nhầm field (**values in wrong fields**). Schema cũng không có cách nào diễn tả những ràng buộc kiểu này. Với strict, JSON Schema thậm chí không hỗ trợ cả ràng buộc số đơn giản như `minimum` hay `maximum`.

Quyên thêm một bước kiểm bằng code sau khi trích. Code cộng `thanh_tien` của các `dong_hang` rồi so với `tong_tien_hang`, kiểm `tong_tien_hang + tien_thue_gtgt` có bằng `tong_thanh_toan` không, và kiểm tiền thuế có đúng khoảng 8% hay 10% tiền hàng không. Bản ghi nào lệch thì code giữ lại cho kế toán viên xem, chứ không đẩy thẳng vào sổ.

**Sơ đồ: Hai hoá đơn đều qua được strict, chỉ có bước kiểm bằng code sau khi trích mới giữ chúng lại**
- lệch
- khớp
- Hoá đơn 1cộng dòng hàng: 12.400.000tong_tien_hang: 14.200.000
- Hoá đơn 2tong_tien_hang: 1.240.000(là số tiền thuế)tien_thue_gtgt: tiền hàng
- strict schema: cả hai qua,đủ field, đúng kiểu số
- Code kiểm sau khi trích:dòng hàng cộng ra tổng?hàng + thuế = thanh toán?thuế 8% hay 10% tiền hàng?
- Giữ lại, khôngđẩy thẳng vào sổ
- Phần mềm kế toán

> **Trong đề chọn gì**
>
> Nếu đề hỏi tool use với JSON schema chặt thực sự bảo đảm được gì, hãy chọn đáp án nói nó bảo đảm đúng cấu trúc, tức JSON hợp lệ và đủ field bắt buộc, nhưng không bảo đảm nội dung đúng. Các đáp án còn lại gán cho schema việc nó không làm, như loại bỏ hoàn toàn chuyện bịa, bảo đảm cả cấu trúc lẫn nghĩa, hay tự thử lại khi giá trị sai luật nghiệp vụ.

## Cho field nhận null để Claude khỏi bịa

Nhiều phiếu chi viết tay không ghi số tài khoản người nhận. Schema bản đầu để `so_tai_khoan_nhan` là field bắt buộc kiểu chuỗi. Kết quả là Claude điền một số tài khoản nghe rất thật nhưng không có trong phiếu, vì schema buộc phải có giá trị.

Chọn field bắt buộc hay tuỳ chọn (**required vs optional fields**) là một quyết định thiết kế schema. Field bắt buộc ép Claude phải điền một cái gì đó, kể cả khi tài liệu không có. Với những field mà chứng từ có thể không ghi, Quyên cho phép nhận `null`, ví dụ khai báo `"type": ["string", "null"]`. Đó là field tuỳ chọn (**optional (nullable) fields**). Khi đó Claude có một cách hợp lệ để nói "phiếu không ghi thông tin này", nên không còn bị schema dồn vào thế phải bịa (**preventing the model from fabricating values to satisfy required fields**). Quyên còn thêm vào prompt một câu: "Field nào không được ghi trực tiếp trong chứng từ thì trả `null`, không suy ra từ chứng từ khác". Cho phép `null` mới chỉ cho Claude thêm một lựa chọn. Câu dặn trong prompt mới nói rõ lúc nào phải chọn nó, vì Claude có xu hướng điền cho đủ mọi field để tỏ ra hữu ích.

**Sơ đồ: Field bắt buộc ép Claude bịa số tài khoản, còn cho nhận null thì Claude nói được "phiếu không ghi"**

✗ _so_tai_khoan_nhan bắt buộc, kiểu chuỗi_
1. Phiếu chi viết tay **không ghi** số tài khoản
   ↓ _schema buộc phải có giá trị_
2. Claude điền một số tài khoản nghe rất thật
3. **Số bịa** không có trong phiếu mà vẫn đúng schema

✓ _so_tai_khoan_nhan nhận null_
1. Cùng phiếu chi đó, **không ghi** số tài khoản
   ↓ _["string", "null"] và câu dặn trong prompt_
2. Claude trả **null** cho so_tai_khoan_nhan
3. **null** phiếu không ghi thông tin này

> **Bẫy đề**
>
> Khi tài liệu nguồn thiếu một số thông số, model bịa giá trị nghe hợp lý để lấp các field bắt buộc, ví dụ tài liệu chỉ ghi kích thước mà output có "weight: 2.3 kg". Nên sửa thế nào? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Thêm một bước kiểm nghĩa, xác nhận từng giá trị đều có trong tài liệu nguồn** (_semantic verification step_). Cách này bắt được giá trị bịa. Nhưng nó chỉ bắt sau khi đã bịa, còn schema vẫn ép model bịa.
> - **Dặn "chỉ trích thông tin được nêu rõ; dùng chữ giữ chỗ cho giá trị thiếu"** (_placeholder text_). Nghe như cho model lối thoát. Có điều chữ giữ chỗ trong field số là một giá trị giả khác, bước sau vẫn đọc nhầm.
> - **Thêm field "confidence" cạnh mỗi thông số rồi lọc bỏ những giá trị có độ tin cậy thấp** (_confidence field_). Nghe như lọc được giá trị đáng ngờ. Ngặt nỗi model vẫn phải điền field bắt buộc, và có thể rất tự tin với giá trị bịa.
>
> **Chọn:** đổi các field có thể không có trong tài liệu nguồn từ bắt buộc sang tuỳ chọn hoặc cho nhận `null`.

> **Trong đề chọn gì**
>
> Nếu đề kể schema đã cho mọi field nhận `null` mà model vẫn điền giá trị nghe hợp lý cho những field bài báo nguồn không hề nhắc tới, hãy chọn thêm vào prompt một câu dặn trả `null` cho mọi field mà nguồn không ghi trực tiếp. Đổi mọi field thành bắt buộc chỉ ép model bịa nhiều hơn. Đổi sang model mạnh hơn cũng không bỏ được thói điền cho đủ. Gọi thêm một LLM để kiểm từng giá trị là vá ở phía sau, trong khi chỉ cần nói rõ ngay trong prompt.

## Thêm giá trị khác, không rõ vào enum và chuẩn hoá định dạng

Schema phiếu chi có field `loai_chi_phi` là enum: `van_phong_pham`, `dien_nuoc`, `xang_xe`, `tiep_khach`. Khoảng 6% phiếu bị kế toán viên sửa lại loại chi phí, vì phiếu chi có nhiều khoản hiếm như "phí kiểm định cân", "thuê xe cẩu" mà enum không có. Claude phải ép các khoản đó vào một giá trị gần nhất của enum, và thường ép sai.

Quyên thêm giá trị `khac` (tức "other") vào enum, kèm một field chuỗi `loai_chi_phi_chi_tiet` để ghi rõ khoản đó là gì khi chọn `khac` (**"other" + detail string**). Những khoản chi quen thuộc vẫn nằm gọn trong enum, còn khoản lạ có chỗ ghi đúng tên mà không phải sửa schema mỗi lần gặp. Cách này giúp danh mục mở rộng được (**extensible categories**). Quyên cũng thêm giá trị `khong_ro` (tức "unclear") cho những phiếu chữ mờ không đọc được nội dung chi (**"unclear" for ambiguous cases**), để Claude có lựa chọn trung thực thay vì đoán bừa. Giá trị này đi cùng cách cho field nhận `null`. Field có thể vắng trong chứng từ thì nhận `null`, còn enum thì có `khong_ro` cho ca mơ hồ, nên Claude không phải bịa ở cả hai chỗ.

Chứng từ còn ghi số tiền và ngày mỗi nơi một kiểu. Số tiền lúc là "1.250.000đ", lúc "1,250,000 VND", có khi "1tr25". Ngày lúc là "05/11/2026", lúc là "ngày 05 tháng 11 năm 2026". Quyên ghi luật chuẩn hoá định dạng ngay trong prompt, đi kèm schema chặt (**format normalization rules in prompts alongside strict output schemas**). Số tiền luôn ghi bằng số nguyên tính theo đồng, còn ngày luôn theo dạng `YYYY-MM-DD`. Claude chuẩn hoá luôn lúc trích, nên Quyên không cần viết thêm bước chuẩn hoá riêng ở phía sau, và cũng bớt một chỗ có thể hỏng.

> **Trong đề chọn gì**
>
> Nếu đề kể enum `property_type` chỉ có vài loại nhà nên 8% kết quả trượt kiểm tra vì tin đăng ghi loại hiếm như "studio", "loft", hoặc hỏi nên thiết kế enum phân loại tài liệu thế nào khi có thể gặp loại mới, hãy chọn thêm `other` vào enum kèm một field chuỗi chi tiết. Dạy model quy loại lạ về giá trị gần nhất là ép sai. Đổi thành chuỗi tự do là mất ràng buộc của enum. Liên tục mở rộng enum thì không bao giờ theo kịp. Dùng hook `PreToolUse` (đoạn code chạy trước mỗi lần gọi tool) để chặn loại chưa biết thì tài liệu đó bị bỏ luôn, chẳng được phân loại gì.
>
> Nếu đề kể review ngắn hoặc mơ hồ khiến model bịa `pros`, `cons` mà review không hề nêu, và chọn bừa `overall_sentiment` cho câu mỉa mai, hãy chọn cho `pros`, `cons` nhận `null` và thêm `unclear` vào enum sentiment. Mảng rỗng không phân biệt được "không có ưu điểm" với "review không nói". Chỉ đánh dấu `pros`, `cons` là tuỳ chọn thì Claude có thể bỏ field, nhưng không nói rõ là "review không nêu", còn `null` nói điều đó thẳng. Thêm `neutral` thì thừa, vì "trung tính" khác "không rõ" và `unclear` đã đủ cho ca mơ hồ. Thêm field độ tin cậy rồi lọc thì vẫn để model bịa trước.
>
> Nếu đề kể thực đơn ghi giá "$12" hay "12.00", nhãn ăn kiêng lúc là icon lúc là chữ, và hỏi cách chắc nhất để output nhất quán, hãy chọn schema chặt kèm luật chuẩn hoá định dạng trong prompt. Trích riêng từng field, chuẩn hoá bằng code sau khi trích, hay trích nhiều lần rồi lấy định dạng xuất hiện nhiều nhất đều thêm bước cho việc một prompt làm được.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 4.3](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Define tools, Forcing tool use (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
3. [Strict tool use (Claude API)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)
4. [Structured outputs (Claude API)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
