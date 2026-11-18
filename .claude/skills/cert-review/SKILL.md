---
name: cert-review
description: Kiểm định độc lập chất lượng câu hỏi trong ngân hàng của app luyện thi chứng chỉ Claude (repo claude-certification-prepare) — tự giải trước, đối chiếu tài liệu chính thức Anthropic, chấm PASS / FIX / RETIRE theo rubric (đáp án, một đáp án tốt nhất, phương án nhiễu, stem, giải thích, gắn kỳ thi/domain, trùng lặp), sửa trực tiếp lỗi rõ ràng và viết báo cáo vào bank/reviews/. Dùng khi người dùng gõ /cert-review, khi app chạy tác vụ review, hoặc muốn "review câu hỏi", "soát câu AI", "kiểm tra đáp án", "soát pack mới", "câu này đúng không".
argument-hint: "[trống = câu AI chưa soát | pack <id hoặc file> | ids=AI-CCARF-001,… | exam=CCAR-F domains=D2] [count=N]"
---

Bạn là **người soát độc lập**. Người học không tự phát hiện được đáp án sai — câu sai lọt vào ngân hàng sẽ bị học thuộc. **Không tin**
đáp án và giải thích có sẵn (kể cả câu chính phiên này vừa sinh): tự giải trước, rồi mới so. Working directory = gốc repo; đường dẫn
tính từ gốc repo (= thư mục app). Chạy từ app: không hỏi lại, Bash chỉ có `node scripts/validate.ts`.

**Được ghi:** `bank/packs/*.yaml` (sửa tại chỗ các câu trong phạm vi), báo cáo mới `bank/reviews/YYYY-MM-DD-<slug>.md`.
**Chỉ đọc:** `exams.yaml`, `notes/**`, `bank/issues.md`, `results/**` (không bao giờ sửa). **Không chạm:** code app (`server/`, `web/`,
`shared/`, `scripts/`), cấu hình, `coach/`, `.local/`. Không commit.

## 1. Phạm vi

`$ARGUMENTS` (hoặc `exam`, `domains`, `count`, `note` khi app gọi):
- danh sách id → đúng các câu đó · pack (id hoặc file) → mọi câu không `retired` của pack · `exam` / `domains` → câu active thuộc đó;
- trống → câu **không có `reviewed:`** trong các pack `origin: ai`, không `retired`, pack mới trước.
Tối đa `count` (mặc định 30) câu mỗi lượt; phần còn lại ghi vào báo cáo mục *Để lượt sau*.

## 2. Soát từng câu

1. **Tự giải (che đáp án):** đọc stem + phương án, chọn đáp án tốt nhất theo ràng buộc và qualifier. Mở tài liệu chính thức liên quan
   bằng WebFetch: docs.claude.com (kể cả trang chuyển hướng tới), code.claude.com, modelcontextprotocol.io, support.claude.com,
   anthropic.com, Exam Guide (`notes/exams/<CODE>.md`). Không dựa vào trí nhớ cho giới hạn, tên, flag, giá. Ghi lại URL đã dùng.
2. **So với `answer`** rồi chấm từng tiêu chí (ghi mã tiêu chí trượt):
   - **a. Đáp án đúng** theo tài liệu chính thức (trích URL).
   - **b. Đúng một** đáp án bảo vệ được (hoặc đúng N với câu "Choose N"; số đáp án = số stem yêu cầu).
   - **c. Phương án nhiễu** hợp lý nhưng sai rõ vì một lý do nêu được từ stem; không manh mối: đáp án dài/chi tiết hơn hẳn, từ tuyệt đối
     chỉ ở phương án nhiễu, lệch ngữ pháp, đáp án lặp nguyên văn từ của stem, tính năng không tồn tại quá lộ.
   - **d. Stem** là tình huống thực tế có qualifier, không mơ hồ, tiếng Anh chuẩn (ngữ pháp, thuật ngữ đúng tên chính thức).
   - **e. Giải thích** đúng sự thật, tiếng Việt, nêu vì sao đáp án đúng và vì sao **từng** phương án nhiễu sai, gọi bằng nội dung chứ
     không bằng chữ cái (app xáo phương án); có nguồn khi nêu con số / giới hạn.
   - **f. Gắn kỳ thi / domain / scenario** đúng theo `exams.yaml` và task statements trong `notes/exams/<CODE>.md`; `scenario` chỉ cho
     CCAR-F và khớp bối cảnh; `ref` trỏ tới anchor có thật (Grep `id="` / heading trong `notes/`).
   - **g. Không gần trùng** câu khác: Grep bank theo khái niệm chính; cùng quyết định + cùng đáp án ở góc giống nhau = trùng.
3. **Kết luận:**
   - **PASS** — đạt mọi tiêu chí → thêm `reviewed: YYYY-MM-DD`.
   - **FIX** — lỗi rõ và ít rủi ro (câu chữ stem, giải thích, mapping, `ref`, viết lại một phương án nhiễu cho hết mơ hồ / hết manh mối)
     → sửa trực tiếp bằng Edit tối thiểu + `reviewed: YYYY-MM-DD`. Đáp án sai mà tài liệu chính thức **rõ ràng không thể hiểu khác** →
     sửa `answer` + giải thích, ghi rõ "đổi đáp án" trong báo cáo kèm URL.
   - **RETIRE** — đáp án sai mà tài liệu không rõ, hai đáp án cùng bảo vệ được và không sửa nhẹ được, kiến thức lỗi thời, câu trùng
     (giữ câu cũ hơn / tốt hơn) → `status: retired` + `reviewed: YYYY-MM-DD`, lý do trong báo cáo.
   - Nghi ngờ mà không kiểm được (trang không mở được, tài liệu mâu thuẫn) → **không** đặt `reviewed`, ghi mục *Cần người xem*.
4. **Quy tắc sửa:** Edit đúng các dòng của câu, không ghi lại cả file. **Không đổi thứ tự, thêm hay bớt phương án** (kết quả cũ lưu
   chữ cái theo thứ tự gốc) — cần đổi cấu trúc → RETIRE và đề nghị sinh câu thay thế bằng `/cert-generate`. Không sửa `results/`.
   YAML: chuỗi có `: `, `#`, backtick/nháy ở đầu → bọc `"…"` hoặc block `|-`.

## 3. Báo cáo — `bank/reviews/YYYY-MM-DD-<slug>.md`

Slug theo phạm vi (vd `ai-20261118-ccarf-d2-mcp`, `ccar-f-d2`, `chua-soat`); trùng tên → thêm `-2`. Tiếng Việt:

```markdown
# Soát câu hỏi — <phạm vi> — YYYY-MM-DD
Người soát: <model> · Phạm vi: <…> · Số câu: N

## Tổng kết
| Kết luận | Số câu |   (PASS / FIX / RETIRE / Cần người xem; số câu đổi đáp án)
## Lỗi theo tiêu chí
| Tiêu chí | Số câu trượt |   (a–g, kèm tên ngắn)
## Chi tiết
| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đã sửa gì | Nguồn |
## Cần người xem
## Rủi ro còn lại      (điểm tài liệu chưa rõ, nội dung dễ lỗi thời, domain có nhiều câu trượt, mẫu lỗi lặp lại của người sinh câu)
## Để lượt sau
```

Mỗi câu đã soát đúng một dòng trong *Chi tiết*, kể cả PASS; cột Nguồn là URL tài liệu chính thức đã mở.

## 4. Kết thúc

1. `node scripts/validate.ts` → sửa mọi lỗi phát sinh ở câu đã đụng; chạy lại tới khi sạch lỗi.
2. Trả lời cuối 3–5 dòng tiếng Việt: số câu soát, PASS / FIX / RETIRE (id các câu đổi đáp án hoặc retire), số *Cần người xem*,
   đường dẫn báo cáo.
