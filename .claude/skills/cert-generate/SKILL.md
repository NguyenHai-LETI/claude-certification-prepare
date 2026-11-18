---
name: cert-generate
description: Sinh câu hỏi trắc nghiệm mới chuẩn đề thật cho các kỳ thi chứng chỉ Claude (CCAR-F, CCDV-F, CCAO-F, CCAR-P) theo kỳ thi / domain / số câu, dựa trên tài liệu chính thức của Anthropic, lưu thành pack mới bank/packs/ai-YYYYMMDD-<slug>.yaml. Dùng khi người dùng gõ /cert-generate, khi app chạy tác vụ generate, hoặc muốn "sinh câu hỏi", "tạo thêm câu cho CCAR-F D2", "thêm câu về MCP", "domain này ít câu quá", "viết câu luyện mới".
argument-hint: "[exam=CCAR-F,CCAR-P] [domains=D2] [count=10] [chủ đề / ghi chú]"
---

Yêu cầu: `$ARGUMENTS` (hoặc `exam`, `domains`, `count`, `note` trong prompt khi app gọi). Thiếu → tự chọn: `count` 10; không có
domain → chia theo trọng số `exams.yaml` nhưng ưu tiên domain có ít câu active so với trọng số; không có exam → CCAR-F.
Working directory = gốc repo (= thư mục app); đường dẫn tính từ đó. Chạy từ app: không hỏi lại, Bash chỉ có `validate.ts`.

**Được ghi:** đúng **một file mới** `bank/packs/ai-YYYYMMDD-<slug>.yaml`. **Chỉ đọc:** các pack khác, `exams.yaml`, `notes/**`.
**Không chạm:** pack có sẵn, `bank/issues.md`, `results/**` (không đọc cũng được), `coach/`, code app (`server/`, `web/`, `shared/`,
`scripts/`), cấu hình. Không commit.

## 1. Chuẩn bị

1. Đọc `exams.yaml` (domain, trọng số, scenario S1–S6 của CCAR-F) và `notes/exams/<CODE>.md` (task statements) của từng kỳ thi.
2. Đếm câu active hiện có theo kỳ thi/domain (Grep `<CODE>: D` trong `bank/packs/`) để biết chỗ mỏng.
3. Id kế tiếp: Grep `id: AI-<EXAM bỏ gạch>-` (vd `AI-CCARF-`, `AI-CCDVF-`, `AI-CCAOF-`, `AI-CCARP-`) trên **mọi** pack, lấy số lớn
   nhất + 1, 3 chữ số (`AI-CCARP-001`). Câu gắn nhiều kỳ thi lấy tiền tố của kỳ thi được yêu cầu đầu tiên.
4. Lập danh sách khái niệm cần hỏi (một task statement → một quyết định cụ thể). Với **mỗi** khái niệm, Grep bank theo từ khoá
   (tên tính năng, tham số, tình huống) — đã có câu kiểm tra cùng quyết định với cùng đáp án → đổi góc (qualifier khác, ràng buộc khác,
   lỗi khác) hoặc bỏ khái niệm đó.

## 2. Nguồn sự thật

Mỗi câu dựa trên ít nhất một trang tài liệu chính thức **đã mở bằng WebFetch** trong lượt này: docs.claude.com (kể cả trang chuyển
hướng tới), code.claude.com, modelcontextprotocol.io, support.claude.com, anthropic.com, Exam Guide. Không dựa vào trí nhớ cho
giới hạn, tên model, tên tham số / flag / file cấu hình, header beta, giá. Không xác nhận được → bỏ câu. Tránh nội dung hay đổi
(giá chính xác, số phiên bản model, tính năng beta mới) trừ khi người dùng yêu cầu; ưu tiên khái niệm và quyết định thiết kế bền vững.

## 3. Chuẩn câu hỏi (giống đề thật)

- **Stem** tiếng Anh, 2–5 câu: một tình huống cụ thể (công ty / nhóm / hệ thống, ràng buộc rõ: chi phí, độ trễ, bảo mật, khối lượng,
  quy trình) rồi một câu hỏi có qualifier rõ: *MOST appropriate*, *most cost-effective*, *with the least operational overhead*,
  *What should the team do FIRST?*… Qualifier phải đủ để phân định đáp án. Theo kỳ thi:
  CCAR-F = kiến trúc agent / tool / Claude Code / prompt / context; CCDV-F = lập trình viên dùng API, SDK, Claude Code, MCP;
  CCAO-F = người dùng nghiệp vụ với Claude apps (Projects, Artifacts, connectors, Research…), đánh giá output, governance;
  CCAR-P = kiến trúc doanh nghiệp, tích hợp, eval, governance, stakeholder, vòng đời.
- **Phương án**: 4, cùng độ dài (chênh ≤ ~30 %) và cùng dạng ngữ pháp (cùng bắt đầu bằng động từ / danh từ…), đều nghe hợp lý với
  người học nửa vời; đúng **một** đáp án tốt nhất. ~10 % câu dạng nhiều đáp án: 5 phương án, 2 đáp án, stem kết thúc "(Choose TWO.)".
  Không "All/None of the above", không "both A and B". Mỗi phương án nhiễu sai vì **một lý do nêu được từ dữ kiện trong stem**
  (vi phạm ràng buộc, dùng sai tính năng, tính năng không tồn tại / không làm được điều đó, giải bài toán khác, tốn vận hành/chi phí hơn,
  đúng một phần). Không manh mối: đáp án không dài/chi tiết hơn hẳn, không lặp nguyên văn từ của stem, từ tuyệt đối (*always*, *never*)
  không chỉ nằm ở phương án nhiễu.
- **Vị trí đáp án** cân bằng A–D trong cả pack (chênh tối đa 1–2 khi ≥ 8 câu), không quá 3 câu liền cùng chữ cái.
- **explanation** tiếng Việt, giữ thuật ngữ tiếng Anh, 50–150 từ: vì sao đáp án đúng → mỗi phương án nhiễu sai vì sao, gọi bằng nội
  dung (app xáo thứ tự, **không** viết "A sai…") → `Nguồn: <URL đã mở>`.
- **exams**: gắn mọi kỳ thi có domain thật sự bao phủ khái niệm (đối chiếu task statements), vd `{CCAR-P: D7, CCAR-F: D3}`; không gắn
  cho đủ số. **scenario** (chỉ khi có CCAR-F): S1–S6 khi stem đúng bối cảnh tình huống đó, viết stem cho khớp; không hợp → bỏ trống.
- **ref**: `lessons/<file>.html#<anchor>` hoặc `<file>.md#<anchor>` của note liên quan nhất; anchor phải có thật (Grep `id="` trong
  `notes/lessons/*.html`, heading trong `.md`). Không tìm được → bỏ `ref` (validator chỉ cảnh báo), không bịa.
- `status: active`, `difficulty` (mặc định ~20 % easy, 50 % medium, 30 % hard), `tags` 1–3 từ khoá, `created: YYYY-MM-DD`.

Tự kiểm từng câu trước khi ghi: che đáp án, đọc như thí sinh giỏi — chọn được đúng một (hoặc đúng hai) đáp án chỉ từ dữ kiện stem?
Còn phương án thứ hai bảo vệ được → thêm ràng buộc vào stem hoặc viết lại phương án nhiễu.

## 4. Ghi pack

`bank/packs/ai-YYYYMMDD-<slug>.yaml` (slug ngắn không dấu, vd `ccarf-d2-mcp`; file đã tồn tại → thêm `-2`). `id` của pack = tên file
không đuôi.

```yaml
id: ai-20261118-ccarf-d2-mcp
title: "AI sinh: CCAR-F D2 Tool Design & MCP"
origin: ai
generatedBy: <model đang chạy>
created: 2026-11-18
description: "<yêu cầu gốc, số câu, nguồn tài liệu chính>"
questions:
  - id: AI-CCARF-001
    exams: { CCAR-F: D2, CCDV-F: D8 }
    scenario: S1
    stem: "…"
    options:
      - "…"
      - "…"
      - "…"
      - "…"
    answer: [C]
    explanation: "… Nguồn: https://…"
    ref: lessons/04-tool-mcp.html#<anchor>
    status: active
    difficulty: medium
    tags: [mcp, tool-design]
    created: 2026-11-18
```

Chuỗi luôn bọc `"…"` (escape `\"`) hoặc dùng block `|-` cho stem/giải thích nhiều đoạn; code trong backtick.

## 5. Kiểm tra & báo cáo

1. `node scripts/validate.ts` → sửa mọi lỗi của pack mới; cảnh báo của pack mới (đáp án dài > 1.6×, giải thích ngắn,
   thiếu ref, stem nhiều đáp án không nói số lượng) → sửa nếu được. Chạy lại tới khi sạch lỗi.
2. Trả lời cuối (tiếng Việt): đường dẫn pack, bảng `Kỳ thi / Domain | Số câu`, phân bố vị trí đáp án A–D, số câu nhiều đáp án,
   khái niệm đã bỏ vì trùng hoặc không xác nhận được, và nhắc chạy `/cert-review <pack>` để soát độc lập trước khi tin dùng.
