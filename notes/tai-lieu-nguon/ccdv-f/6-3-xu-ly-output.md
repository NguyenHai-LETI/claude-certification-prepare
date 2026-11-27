---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccdv-f/6-3-xu-ly-output
ngay_tai: 2026-11-27
tieu_de: Xử lý đầu ra - structured outputs, kiểm tra, đọc phòng thủ, hoài nghi câu trả lời tự tin
---

Domain 6: Prompt and Context Engineering · Task 6.3

# Xử lý đầu ra - structured outputs, kiểm tra, đọc phòng thủ, hoài nghi câu trả lời tự tin

Lấy đầu ra đúng khuôn bằng structured outputs hay strict tool use, kiểm trước khi chuyển đi, đọc phòng thủ, và không coi câu trả lời tự tin là sự thật.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Giải thích vì sao JSON xin bằng prompt vẫn có thể hỏng, và structured outputs chặn điều đó thế nào
- Biết những trường hợp đầu ra vẫn lệch schema, và kiểm đầu ra trước khi chuyển cho hệ thống sau
- Đọc đầu ra phòng thủ - trường lạ, thiếu giá trị, sai kiểu - để code phía sau không sập
- Áp sự hoài nghi với câu trả lời nghe chắc chắn - cho phép "không biết", trích dẫn, đối chiếu

Đầu ra của Claude thường không dừng ở màn hình: nó được đổ vào database, dashboard, hệ thống khác. Ở đó một trường thiếu có thể làm sập cả pipeline, và một con số sai nhưng viết rất tự tin có thể được coi là sự thật.

Bài này giúp bạn trả lời: làm sao lấy được đầu ra đúng khuôn, kiểm nó thế nào trước khi chuyển đi, và khi nào không nên tin câu trả lời dù nó nghe rất chắc chắn?

## Ví dụ xuyên suốt: công ty khảo sát thị trường

Một công ty khảo sát thị trường nhận khoảng 2.000 câu trả lời mở mỗi ngày ("Bạn nghĩ gì về bao bì mới?"). Claude đọc từng câu, trả về JSON: chủ đề, cảm xúc (tích cực, trung tính, tiêu cực), và một câu trích nguyên văn. Kết quả đổ thẳng vào dashboard của khách hàng.

Vấn đề tháng trước: thỉnh thoảng JSON hỏng làm job đêm dừng giữa chừng; dashboard có lúc hiện câu trích dẫn mà người trả lời không hề viết; và trong bản tóm tắt tuần, Claude viết rất chắc "62% người trả lời khen màu sắc" dù con số đó không có trong dữ liệu.

## Vì sao JSON xin bằng prompt vẫn hỏng

Docs structured outputs nói: không có tính năng này, kể cả prompt kỹ, Claude vẫn có thể trả JSON sai cú pháp, thiếu trường bắt buộc, sai kiểu dữ liệu. Có hai cách bảo đảm đúng schema bằng giải mã có ràng buộc (constrained decoding), tức là chỉ cho model sinh những token hợp với schema:

| Cách | Dùng khi | Đặt ở |
| --- | --- | --- |
| JSON outputs | Muốn câu trả lời của Claude là một khối JSON | `output_config.format` với `type: "json_schema"` |
| Strict tool use | Muốn tham số Claude truyền cho tool đúng schema | `strict: true` trong định nghĩa tool |

Đề thi gọi nhóm kỹ thuật này là các mẫu đầu ra có cấu trúc (**structured output patterns**).

> **Trong đề chọn gì**
>
> Câu luyện thi: ứng dụng cần JSON đúng một schema rõ ràng, hệ thống phía sau từ chối JSON hỏng. Chọn **định nghĩa schema rõ, prompt yêu cầu đúng schema đó, và kiểm đầu ra theo schema trước khi chuyển đi**. Sai: mô tả schema bằng lời rồi để hệ thống sau tự đọc; có schema nhưng để hệ thống sau tự kiểm; bỏ đầu ra có cấu trúc cho "linh hoạt".

## Vẫn phải kiểm trước khi chuyển đi

Structured outputs bảo đảm đúng schema trong hầu hết trường hợp, nhưng docs liệt kê vài lúc đầu ra vẫn có thể lệch:

- **Từ chối** (`stop_reason: "refusal"`): API vẫn trả 200, vẫn tính tiền, và lời từ chối được ưu tiên hơn schema.
- **Hết token** (`stop_reason: "max_tokens"`): đầu ra bị cắt, có thể không đủ schema. Thử lại với `max_tokens` lớn hơn.
- **Chữ hoa chữ thường của giá trị `enum`** không được bảo đảm: có thể nhận `"Tich_cuc"` thay vì `"tich_cuc"`.

Ngoài ra schema chỉ kiểm hình dạng, không kiểm nghĩa. Một câu trích dẫn đúng kiểu chuỗi vẫn có thể không có trong câu trả lời gốc. Vì vậy cần một bước kiểm đầu ra (**response validation**) đặt ngay sau lời gọi, nơi còn sửa hay gọi lại được: kiểm `stop_reason`, kiểm schema, rồi kiểm luật nghiệp vụ (câu trích phải xuất hiện nguyên văn trong câu trả lời gốc).

**Sơ đồ**
1. **Schema**: trich_dan có phải là chuỗi không? **|** **Luật nghiệp vụ**: câu trích có nguyên văn trong câu trả lời gốc không?
   ↓ _với một câu trích người trả lời không hề viết_
2. **Đạt, lỗi lọt qua** **|** **Không đạt, bắt được lỗi**

> **Bẫy đề**
>
> Câu luyện thi: phần lớn JSON đúng, thỉnh thoảng hỏng làm vỡ bước xử lý sau. Đúng là **thêm bước kiểm đầu ra theo schema, coi đầu ra hỏng là một nhánh lỗi đã biết có thử lại hoặc dự phòng**. Sai: người duyệt mọi phản hồi; bỏ JSON chuyển sang chữ tự do; thử lại mãi tới khi được (không giới hạn, cộng dồn độ trễ).

## Đọc phòng thủ

Đề thi gọi đây là đọc phòng thủ (**defensive parsing**): code nhận đầu ra phải chịu được ba kiểu lệch hay gặp, trường lạ, thiếu giá trị, sai kiểu, thay vì sập.

```python
def doc_ket_qua(raw: dict) -> dict | None:
    cam_xuc = str(raw.get("cam_xuc", "")).lower()          # chuẩn hoá chữ hoa
    if cam_xuc not in {"tich_cuc", "trung_tinh", "tieu_cuc"}:
        return None                                       # sang nhánh thử lại / người duyệt
    trich = raw.get("trich_dan") or ""
    if trich and trich not in cau_tra_loi_goc:
        trich = ""                                        # bỏ trích dẫn không có trong nguồn
    return {"chu_de": raw.get("chu_de", "khac"), "cam_xuc": cam_xuc, "trich_dan": trich}
```

Đọc phòng thủ không có nghĩa là lặng lẽ vứt đầu ra hỏng. Bản ghi không đọc được phải đi vào một nhánh có xử lý (thử lại, dự phòng, người duyệt) và được đếm, để biết tỉ lệ hỏng đang tăng hay giảm.

**Sơ đồ**
1. **Job đêm đọc đầu ra của từng câu trả lời**
   ↓ _đọc phòng thủ_
2. **Đọc được**: đổ vào dashboard **|** **Không đọc được**: thử lại, dự phòng, người duyệt

> **Trong đề chọn gì**
>
> Câu luyện thi: đầu ra có cấu trúc được code phía sau dùng, đội muốn xử lý đầu ra lệch mà không làm sập hệ thống. Chọn **đọc phòng thủ để xử lý trường lạ, thiếu giá trị, sai kiểu**. Sai: sập khi gặp đầu ra lạ rồi khôi phục tay; lặng lẽ bỏ đầu ra lệch; dùng nguyên đầu ra, để việc ép schema tới giai đoạn sau.

## Hoài nghi câu trả lời nghe chắc chắn

Model sinh câu trôi chảy và tự tin kể cả khi sai (bài 5.1). Giọng văn chắc chắn không nói gì về độ đúng. Đề thi gọi thái độ cần có là hoài nghi đầu ra tự tin (**skepticism toward confident output**). Docs về giảm bịa đặt đưa ra các cách:

| Cách | Trong ví dụ |
| --- | --- |
| Cho phép Claude nói "không biết" | "Nếu dữ liệu không đủ để kết luận, ghi rõ là không đủ dữ liệu" |
| Trích nguyên văn trước rồi mới làm việc | Bản tóm tắt tuần phải dẫn câu trả lời gốc cho mỗi nhận định |
| Kiểm bằng trích dẫn: mỗi nhận định phải có câu dẫn chứng, không tìm được thì rút lại | Bỏ "62% khen màu sắc" vì không có dẫn chứng |
| Chạy nhiều lần rồi so (best-of-N): kết quả lệch nhau là dấu hiệu bịa | Chạy tóm tắt 3 lần, so các con số |
| Chỉ dùng thông tin trong tài liệu được cung cấp | Cấm dùng kiến thức chung về thị trường |

Con số phần trăm thì tốt nhất là đừng để Claude tự ước: code đếm từ dữ liệu đã phân loại, Claude chỉ viết lời.

**Sơ đồ**
1. **Claude phân loại từng câu trả lời**
   ↓ _code đếm trên dữ liệu đã phân loại_
2. **Con số phần trăm**: tính được, kiểm lại được
   ↓ _Claude chỉ viết lời_
3. **Bản tóm tắt tuần**

> **Bẫy đề**
>
> Câu luyện thi: ứng dụng trả lời nghe rất chắc, nhưng thỉnh thoảng sai sự thật, và hệ thống phía sau coi đó là sự thật. Đúng là **hoài nghi đầu ra tự tin: thêm bước kiểm, yêu cầu nguồn, hoặc hiệu chỉnh độ tin cậy trước khi coi là sự thật**. Sai: hạ temperature cho bớt tự tin; người kiểm mọi phản hồi; thêm dòng miễn trừ trách nhiệm vào mọi đầu ra.

1. **stop_reason là refusal hay max_tokens?** → Xử lý riêng, không đọc như đầu ra bình thường
2. **Không đúng schema sau khi đọc phòng thủ?** → Thử lại có giới hạn, rồi dự phòng hoặc người duyệt
3. **Đúng schema nhưng sai luật nghiệp vụ?** → Sửa tại chỗ hoặc gửi người duyệt
4. **Có nhận định, con số không có dẫn chứng?** → Rút lại hoặc để code tính
- **Còn lại** → Chuyển cho hệ thống phía sau

> **Ý chính**
>
> Dùng structured outputs hoặc strict tool use để đầu ra đúng schema, nhưng vẫn kiểm `stop_reason`, schema và luật nghiệp vụ trước khi chuyển đi. Đọc phòng thủ, và đưa bản hỏng vào nhánh có xử lý. Câu trả lời tự tin không phải bằng chứng: đòi trích dẫn, cho phép "không biết", để code tính các con số.

## Nguồn

1. [Exam Guide CCDV-F v1.0, Domain 6](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf)
2. [Structured outputs (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
3. [Strict tool use (Claude API Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)
4. [Reduce hallucinations (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
5. [Increase output consistency (Claude API Docs)](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/increase-consistency)
