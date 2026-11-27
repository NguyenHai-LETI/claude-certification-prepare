---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-p/1-5-chia-nho-bai-toan
ngay_tai: 2026-11-27
tieu_de: Chia nhỏ bài toán phức tạp
---

Domain 1: Solution Design & Architecture · Task 1.5

# Chia nhỏ bài toán phức tạp

Các cách chia một bài toán lớn thành phần nhỏ, gồm tách phần cho code và phần cho Claude, nối chuỗi có bước kiểm, chạy song song, và tự kiểm rồi sửa.

- 8 phút đọc
- Đối chiếu docs 02/11/2026
- 5 nguồn

## Đọc xong bạn nắm được

- Tách phần việc cần kết quả chắc chắn (giao cho code) khỏi phần cần hiểu ngôn ngữ (giao cho Claude)
- Nối các bước thành chuỗi và đặt bước kiểm giữa chúng
- Chọn giữa chạy song song và chạy tuần tự dựa vào sự phụ thuộc giữa các phần
- Dùng vòng viết, tự kiểm, sửa khi có tiêu chí rõ
- Biết khi nào chuyển vòng gọi tool sang code và khi nào gom việc thành lô

Một prompt dài làm năm việc cùng lúc thường làm việc nào cũng tạm được, và khi sai thì không biết sai ở đâu. Chia nhỏ giúp mỗi phần làm tốt một việc, và cho bạn chỗ để kiểm giữa các phần.

Bài này giúp bạn trả lời: chia một bài toán lớn theo những cách nào, và cách nào hợp với tình huống nào?

## Ví dụ xuyên suốt: viết mô tả cho 40.000 sản phẩm

Một sàn thương mại điện tử cần viết lại mô tả cho 40.000 sản phẩm. Dữ liệu gốc do người bán nhập: tên lộn xộn, thông số thiếu đơn vị, có sản phẩm ghi sai ngành hàng. Mô tả mới phải đúng giọng văn của sàn, không chứa lời quảng cáo bị cấm (như "tốt nhất thị trường", "chữa khỏi bệnh"), và giá hiển thị phải tính đúng theo khuyến mãi đang chạy.

Bản đầu tiên là một prompt duy nhất làm tất cả. Kết quả: giá tính sai ở nhiều sản phẩm, vài mô tả vẫn lọt lời quảng cáo bị cấm, và khi có lỗi không ai biết lỗi do khâu nào.

## Cách 1: tách phần cho code, phần cho Claude

Câu hỏi đầu tiên khi chia: phần nào cần kết quả chắc chắn, lặp lại y hệt mỗi lần? Phần đó để code làm.

| Phần việc | Ai làm |
| --- | --- |
| Chuẩn hoá đơn vị (g, kg, ml), bỏ ký tự lạ | Code |
| Xếp sản phẩm vào đúng ngành hàng | Claude |
| Viết mô tả theo giọng văn của sàn | Claude |
| Tính giá sau khuyến mãi | Code |
| Kiểm mô tả có đủ trường bắt buộc, đúng độ dài | Code |
| Lưu vào cơ sở dữ liệu | Code |

Chia theo cách này cũng chính là xếp các phần vào ba tầng tiền xử lý, tầng model, hậu xử lý (bài 1.2). Giá tính sai ở bản đầu tiên là vì để Claude làm một phép tính mà code làm chắc chắn hơn.

## Cách 2: nối chuỗi và đặt bước kiểm

Phần còn lại cho Claude vẫn có hai việc khác nhau: xếp ngành hàng và viết mô tả. Tách thành hai lần gọi nối tiếp nhau là mẫu **prompt chaining**: kết quả bước trước là đầu vào bước sau. Giữa hai bước có thể đặt một bước kiểm bằng code (gate), ví dụ ngành hàng trả về phải nằm trong danh sách ngành hàng của sàn, không thì dừng lại cho người xem.

Docs của Anthropic nói nối chuỗi tường minh vẫn có ích khi bạn cần xem kết quả trung gian hoặc muốn ép một cấu trúc pipeline cụ thể: mỗi bước là một lần gọi API riêng, nên bạn ghi log, đánh giá hay rẽ nhánh được ở bất kỳ bước nào. Đó chính là thứ bản đầu tiên thiếu: không biết lỗi nằm ở khâu nào.

Nối chuỗi không làm hệ thống nhanh hơn. Mỗi bước là thêm một lần gọi model, nên bài viết Building effective agents nói prompt chaining đổi độ trễ lấy độ chính xác: mỗi lần gọi làm một việc dễ hơn.

Sau khi xếp ngành hàng, có thể thêm **routing**: sản phẩm ngành thực phẩm chức năng đi qua prompt có quy định quảng cáo riêng, sản phẩm thời trang đi qua prompt khác.

Ghép ba cách đầu lại, một sản phẩm đi qua hệ thống như sau:

**Sơ đồ**
1. **Code**: chuẩn hoá đơn vị, bỏ ký tự lạ
   ↓ _Claude làm việc đầu tiên_
2. **Claude**: xếp ngành hàng
   ↓ _gate bằng code: ngành hàng có trong danh sách của sàn không? Không thì dừng cho người xem_
3. **Prompt thực phẩm chức năng**: có quy định quảng cáo riêng **|** **Prompt thời trang**
   ↓ _Claude viết mô tả theo đúng nhánh_
4. **Code**: tính giá sau khuyến mãi, kiểm đủ trường và độ dài, lưu vào cơ sở dữ liệu

Có lỗi thì giờ biết ngay nó nằm ở khâu nào, vì mỗi khâu có kết quả riêng để xem.

## Cách 3: song song hay tuần tự

Hai phần không phụ thuộc nhau thì chạy song song được. Bài viết Building effective agents gọi đây là **parallelization**, có hai kiểu:

- **Sectioning**: chia thành phần độc lập chạy cùng lúc. Trong ví dụ: một lần gọi viết mô tả, một lần gọi khác cùng lúc kiểm lời quảng cáo bị cấm. Tách việc kiểm ra một lần gọi riêng thường tốt hơn bắt một prompt vừa viết vừa tự canh.
- **Voting**: chạy cùng một việc nhiều lần rồi so kết quả, khi cần độ chắc chắn cao hơn. Ví dụ hỏi ba lần xem một mô tả có vi phạm không, chỉ duyệt khi cả ba đều nói không.

**Sơ đồ**
1. **Một mô tả vừa viết xong**
   ↓ _cùng câu hỏi "có vi phạm không?", hỏi ba lần_
2. **Lần 1** **|** **Lần 2** **|** **Lần 3**
   ↓ _chỉ duyệt khi cả ba đều nói không_
3. **Mô tả được duyệt**

Khi phần sau cần kết quả của phần trước (viết mô tả cần biết ngành hàng), bắt buộc chạy tuần tự. Và chạy song song cũng không rẻ hơn: số lần gọi model vẫn vậy hoặc nhiều hơn (voting nhân số lần gọi lên), chỉ có thời gian chờ là ngắn lại.

> **Trong đề chọn gì**
>
> Đề cho một pipeline đã chia thành các thành phần và hỏi mỗi thành phần thuộc lớp nào. Đi theo đường dữ liệu: nhận diện chữ trong ảnh, che dữ liệu cá nhân là Pre-Processing; Claude phân loại, Claude trích trường là Model Stage; kiểm schema, lưu vào hệ thống chính là Post-Processing.

## Cách 4: viết, tự kiểm, sửa

Khi có tiêu chí rõ ràng, có thể cho Claude viết bản nháp, rồi kiểm bản nháp theo tiêu chí, rồi sửa. Docs gọi đây là mẫu nối chuỗi phổ biến nhất (**self-correction**). Bài viết Building effective agents gọi phiên bản dùng hai model, một viết một chấm, là **evaluator-optimizer**, hợp khi tiêu chí rõ và sửa nhiều vòng thật sự cho kết quả tốt hơn.

Trong ví dụ, tiêu chí giọng văn của sàn đã viết thành danh sách, nên vòng này đáng làm cho nhóm sản phẩm bán chạy. Với 40.000 sản phẩm, chạy thêm vòng kiểm cho tất cả thì tốn gấp đôi; người kiến trúc sư phải cân chất lượng với chi phí.

**Sơ đồ**
1. **Claude viết bản nháp**: mô tả sản phẩm
2. **Kiểm theo tiêu chí**: danh sách giọng văn của sàn
3. **Sửa bản nháp**: theo chỗ chưa đạt
- ↻Đạt tiêu chí thì thoát vòng

> **Bẫy đề**
>
> Thấy kết quả sai, phản xạ dễ có là viết prompt dài hơn, thêm nhiều quy tắc hơn vào cùng một prompt. Nếu lỗi nằm ở phép tính, cách sửa đúng là chuyển phép tính sang code. Nếu lỗi nằm ở chỗ không biết khâu nào sai, cách sửa là tách thành chuỗi để kiểm được kết quả từng bước.

## Cách 5: chuyển vòng gọi tool dày sang code, gom việc không gấp thành lô

Hai cách chia nữa không đổi việc Claude làm mà đổi **cách gọi**:

**Programmatic tool calling.** Trước khi viết mô tả, sàn muốn kiểm tồn kho của mỗi sản phẩm ở 8 kho. Để Claude gọi tool 8 lần, mỗi lần một lượt đi về với model, thì chậm và mọi kết quả đều chất vào context. Với programmatic tool calling, Claude viết một đoạn code chạy trong container code execution; đoạn code đó gọi tool của bạn 8 lần, gộp kết quả, và chỉ đưa bản tóm tắt cuối vào context. Docs nói cách này hợp với việc tỏa ra nhiều lời gọi độc lập hay phải lọc dữ liệu lớn, và không hợp với chuỗi mà mỗi bước cần Claude suy luận trên kết quả bước trước. Docs cũng khuyên đo số token đầu vào có và không có tính năng này trên một mẫu lưu lượng thật trước khi bật rộng.

**Sơ đồ**
1. **Gọi tool bình thường**: 8 kho là 8 lần gọi, mỗi lần một lượt đi về với model **|** **Programmatic tool calling**: Claude viết một đoạn code, đoạn code gọi tool 8 lần
   ↓ _kết quả đi về đâu_
2. **Cả 8 kết quả chất vào context, chậm** **|** **Code gộp lại, chỉ bản tóm tắt cuối vào context**

**Xử lý theo lô.** 40.000 mô tả không ai cần ngay trong giây lát. Message Batches API tính 50% giá thường, đa số lô xong trong dưới 1 giờ và tối đa 24 giờ. Đổi lại, kết quả không về tức thì, nên chỉ dùng cho việc không có ai đang chờ.

> **Bẫy đề**
>
> Batch không dùng được để rút ngắn một vòng gọi tool dày: các yêu cầu trong lô chạy độc lập, kết quả của yêu cầu này không đưa sang yêu cầu kia được. Vòng gọi tool dày thì chuyển sang code (programmatic tool calling); việc hàng loạt không gấp mới đưa vào batch.

> **Ý chính**
>
> Phần cần chắc chắn giao cho code. Phần cho Claude chia thành từng bước một việc, kiểm giữa các bước, chạy song song những gì không phụ thuộc nhau.

## Nguồn

1. [Exam Guide CCAR-P v1.0, Domain 1](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf)
2. [Building effective agents (Anthropic)](https://www.anthropic.com/engineering/building-effective-agents)
3. [Prompting best practices (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
4. [Programmatic tool calling (Claude Docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
5. [Batch processing (Claude Docs)](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
