---
title: "Tổng quan bốn kỳ thi chứng chỉ Claude"
---

# Tổng quan bốn kỳ thi chứng chỉ Claude

Ghi chú bám **Exam Guide v1.0 (July 2026)** — bản áp dụng tới trước đợt đổi nội dung ngày **07/12/2026**. Quy định đăng ký, đổi lịch, giá lấy từ FAQ và trang Pearson VUE (cập nhật tháng 11/2026). Khi guide và FAQ khác nhau, ghi chú nêu cả hai.

## Chương trình là gì

- **Claude Certification Program** của Anthropic xác nhận người làm ở tổ chức đối tác có kỹ năng làm việc thực tế với Claude, theo ba vai trò: **Associate** (Pearson gọi là Practitioner), **Developer**, **Architect**. Bắt đầu ở Foundations, lên Professional nếu có.
- Chứng chỉ tính vào vị thế của công ty trong **Claude Partner Network**, trừ **Associate – Foundations** (không tính vào điều kiện tier).
- Thi trên **Pearson VUE** (từ 30/06/2026), huy hiệu số qua **Credly**.
- Trang Partner Certifications liệt kê **4 đề** (app này luyện cả 4). FAQ còn nhắc **Claude Certified Developer – Professional** (175 USD) và đã có lộ trình prep cho nó, nhưng chưa có trong bảng đề thi của trang chứng chỉ → app chưa có.
- Khác với **certificate of completion** của Claude Academy (học xong khoá + qua quiz): chứng chỉ là bài thi có giám thị, thang 100–1.000, đạt 720, hiệu lực 12 tháng.

Nguồn: [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications); [Who can take an exam](https://anthropic-partners.skilljar.com/page/certification-eligibility); [Pearson VUE – Anthropic](https://www.pearsonvue.com/us/en/anthropic.html)

## Ai được thi

- Chỉ người làm ở tổ chức thuộc **Claude Partner Network**. Đăng ký bằng **email công ty trên domain đã gắn với hồ sơ partner**; email cá nhân không dùng được. Domain chưa được nhận → email partner-support@anthropic.com (mất 7–10 ngày).
- Chứng chỉ chỉ ghi nhận cho partner nếu thi bằng domain có trong hồ sơ (domain công ty con / vùng phải được gộp trước).
- **Từ 18 tuổi**, xuất trình giấy tờ tuỳ thân do nhà nước cấp. Chỉ thi được ở các quốc gia/vùng Anthropic hỗ trợ. ID từ Belarus, Cuba, Triều Tiên, Nga, Syria, vùng bị hạn chế của Ukraine không thi online được (phải ra test center); cư dân Iran tạm dừng thi từ 08/09/2026.
- Không phải partner → không đăng ký được; học trên Claude Academy (công khai) hoặc công ty xin gia nhập tại claude.com/partners.
- Không có điều kiện tiên quyết bắt buộc cho đề nào (kinh nghiệm trong guide chỉ là khuyến nghị); có thể thi CCAR-P mà không cần CCAR-F.

Nguồn: [Who can take an exam](https://anthropic-partners.skilljar.com/page/certification-eligibility); [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications); các Exam Guide v1.0 §Prerequisites

## Bốn đề cạnh nhau

| | CCAO-F | CCDV-F | CCAR-F | CCAR-P |
|---|---|---|---|---|
| Tên | Claude Certified Associate – Foundations | Claude Certified Developer – Foundations | Claude Certified Architect – Foundations | Claude Certified Architect – Professional |
| Đối tượng | Knowledge worker dùng Claude làm công cụ năng suất (không cần lập trình) | Kỹ sư xây ứng dụng, agent trên Claude (1–5 năm SWE) | Solution architect xây ứng dụng production với Claude (≥ 6 tháng) | Architect mid/senior thiết kế, governance giải pháp doanh nghiệp (≥ 3 năm) |
| Số câu | 60 | 53 | 60 | 63 |
| Thời gian | 120 phút | 120 phút | 120 phút | 120 phút |
| Điểm đạt | 720 / 100–1.000 | 720 | 720 | 720 |
| Lệ phí (USD) | 99 | 125 | 125 | 175 |
| Số domain | 7 | 8 (chia skill có trọng số) | 5 (30 task statement) | 7 |
| Domain nặng nhất | D2 Output Evaluation and Validation 21% | D2 Applications and Integration 33,1% | D1 Agentic Architecture & Orchestration 27% | D3 Integration 19% |
| Đặc thù | Projects, model choice, kiểm chứng output, governance | Phân bố lệch: Claude Code 3,1%, Eval 2,6% | 4 scenario ngẫu nhiên trong 6 | RAG, eval, compliance, stakeholder |
| Câu mẫu trong guide | 3 | 3 | 12 | 3 |
| Đổi nội dung 07/12/2026 | Có | Có | **Không** (không có trong thông báo) | Có |

Chi tiết từng đề: [CCAO-F](exams/CCAO-F.md) · [CCDV-F](exams/CCDV-F.md) · [CCAR-F](exams/CCAR-F.md) · [CCAR-P](exams/CCAR-P.md).

Lưu ý: ảnh chụp minh hoạ trang CCAR-F trong Registration Guide có ô "Domains covered" (Claude API fundamentals 30%, Prompting and tool use 25%, Claude Code workflows 25%, MCP basics 20%) **không khớp** blueprint trong exam guide. Exam guide mới là tài liệu "authoritative" về phạm vi; dùng 5 domain 27/18/20/20/15.

Nguồn: bốn Exam Guide v1.0 (link ở [Tài liệu chính thức](#tài-liệu-chính-thức)); [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [Registration Guide (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542947%2FClaude+Certification+Program+-+Exam+Registration+Guide.pdf)

## Hình thức câu hỏi và chấm điểm

- **Multiple-choice** (một đáp án) và **multiple-response** (nhiều đáp án); **mỗi câu tự ghi phải chọn bao nhiêu đáp án** (vd. "Choose two"). FAQ mô tả: "multiple choice and scenario-based multiple response questions".
- CCAR-F: câu hỏi gắn **scenario**; mỗi lượt thi có 4 scenario chọn ngẫu nhiên trong 6.
- Thời gian làm bài 120 phút; tính cả check-in, hướng dẫn, khảo sát cuối thì khoảng **135 phút** ngồi máy.
- **Closed book**: không tài liệu, không công cụ dịch trình duyệt, không trợ lý AI.
- Chấm **criterion-referenced**: so với chuẩn cố định do chuyên gia đặt (standard-setting), không so với thí sinh khác. Báo **scaled score 100–1.000, đạt từ 720** (giống nhau cho cả 4 đề). Scaled score dùng để cân bằng các bộ đề có độ khó hơi khác nhau, nên **không quy đổi thẳng ra 72% số câu**.
- Score report: pass/fail, scaled score, **% đúng theo từng domain** (chỉ để tham khảo, không quyết định đỗ/trượt). Điểm hiện ngay trên màn hình khi thi xong; thi tại test center có bản in. Đỗ thì nhận email Credly để nhận badge.
- Trọng số domain là "approximate proportion of **scored** items". Guide **không nói** có câu thử nghiệm không tính điểm hay không, **không nói** về điểm từng phần cho câu nhiều đáp án, và **không nói** có trừ điểm khi sai. Không có cơ sở nào cho thấy bỏ trống có lợi → **trả lời mọi câu**.
- Câu mẫu trong guide "không lấy từ ngân hàng đề thật"; FAQ: practice exam của nền tảng cũ đã bị gỡ khi chuyển sang Pearson, câu mẫu trong guide là tài liệu chính thức duy nhất về văn phong đề.

Nguồn: các Exam Guide v1.0 §Exam Details, §How the Exam Is Scored; [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications) (Results and scoring, Exam content and prep)

## Đăng ký và thi

**Quy trình hiện tại (từ 12/11/2026, đăng nhập Pearson qua SSO):**

1. Đăng nhập **Anthropic Partner Academy** bằng email công ty, mở trang chứng chỉ, chọn **Register** (đã đăng ký thì chọn "Go to my Pearson account" / "Already registered for this exam?", **không đăng ký lại**).
2. Xác nhận họ tên — phải **khớp chính xác** giấy tờ sẽ xuất trình (chữ Latin, có dấu như trên giấy tờ; chỉ ghi tên đệm nếu giấy tờ có). Tên chỉ tự đổi được **một lần mỗi năm**; xác nhận hồ sơ là khoá tên một năm.
3. Sang Pearson (đã đăng nhập sẵn), chọn đề trong "Schedule an exam", chọn **OnVUE (online có giám thị)** hoặc **test center**, đồng ý chính sách, **chọn ngôn ngữ (English hoặc Japanese)**, chọn ngày giờ.
4. Thanh toán tại Pearson; giảm giá partner tự áp dụng. Giá **khoá lúc đặt lịch**; đổi lịch giữ giá, huỷ thì mất giá đã khoá.
5. Giữ email xác nhận của Pearson — có link bắt đầu bài thi online.

Registration Guide (PDF) mô tả quy trình **cũ** (thanh toán trên Partner Academy, chờ 2 email username/mật khẩu tạm từ Pearson): chỉ còn đúng cho người đã đăng ký trước 12/11/2026.

**Giảm giá theo tier partner:** Registered trả đủ; Select, Preferred, Global Premier giảm 50%; Global Premier được **100% đến hết 31/12/2026**, sau đó 50%. Thi lại vẫn được giảm theo tier.

**Đổi lịch / huỷ:** guide v1.0 ghi "tới 24 giờ trước giờ thi"; FAQ hiện tại ghi **test center tối thiểu 48 giờ, OnVUE tối thiểu 1 giờ**; trang Pearson ghi 48 giờ. Trễ hạn, vắng mặt, hoặc đến muộn quá thời gian cho phép → mất lệ phí. An toàn nhất: xử lý trước 48 giờ. Muốn chuyển OnVUE ↔ test center hay English → Japanese: huỷ rồi đặt lại từ Partner Academy (không đặt từ mục đã huỷ trên dashboard Pearson, nếu không sẽ mất giảm giá).

**Ngày thi:** giấy tờ tuỳ thân có ảnh, còn hạn, do nhà nước cấp, tên khớp hồ sơ (danh sách loại giấy tờ: trang Proof of ID của Pearson). Thi online: chạy system test trước, máy công ty có thể chặn domain của OnVUE. Cần hỗ trợ đặc biệt (accommodations) phải xin và được Pearson duyệt **trước khi** đặt lịch (nên xin ≥ 10 ngày trước). Người không nói tiếng Anh bản ngữ có thể xin thêm giờ qua mẫu ESL gửi Pearson (3–5 ngày làm việc; không thêm được vào lịch đã đặt).

**Quy tắc phòng thi:** luôn trong khung hình webcam (online); bàn trống (không ghi chú, sách, điện thoại, màn hình phụ); không giao tiếp; không chụp/chép nội dung đề. Cấm điện thoại, đồng hồ thông minh, tai nghe, tài liệu, thiết bị ghi. Giấy nháp chỉ khi Pearson cho phép. Vi phạm → huỷ kết quả, thu hồi chứng chỉ, cấm thi. Phải chấp nhận **NDA** trước khi bắt đầu; không chấp nhận → kết thúc phiên, không hoàn tiền.

Nguồn: [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications); [Pearson VUE – Anthropic](https://www.pearsonvue.com/us/en/anthropic.html); [Registration Guide (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542947%2FClaude+Certification+Program+-+Exam+Registration+Guide.pdf); các Exam Guide v1.0 §Registration, §Exam Policies, §Rules of Conduct, §NDA

## Thi lại, hiệu lực, gia hạn

- Trượt: chờ **14 ngày** sau lần 1, **30 ngày** sau lần 2, **90 ngày** sau lần 3. Tối đa **4 lần / 12 tháng cuốn chiếu cho mỗi đề** (trượt đề này không chặn đăng ký đề khác). Mỗi lần thi trả **đủ lệ phí** (vẫn được giảm theo tier).
- Hiệu lực **12 tháng** từ ngày cấp (chứng chỉ cấp trước 30/06/2026 với hạn 6 tháng đã được tự động gia hạn lên 12 tháng).
- **Gia hạn đúng hạn miễn phí**: xem lại những gì đã thay đổi + làm một bài đánh giá **không giám thị** trên Partner Academy. Để hết hạn → thi lại toàn bộ, đủ phí. Nội dung đề thay đổi lớn → Anthropic có thể yêu cầu thi lại toàn bộ thay vì bài gia hạn.
- Khiếu nại: trong **14 ngày** kể từ ngày được thông báo quyết định (hoặc từ ngày thi nếu là về kết quả), mở case với Pearson. Kết quả standard-setting và nội dung từng câu không được khiếu nại.
- Hỗ trợ: sửa tên, đăng nhập, giá sai → certifications-support@anthropic.com; lịch thi, OnVUE, test center → Pearson support; domain/hồ sơ partner → partner-support@anthropic.com; badge → Credly.

Nguồn: các Exam Guide v1.0 §Retake policy, §Credential Maintenance, §Candidate Support; [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications)

## Thay đổi từ 07/12/2026

- Pearson VUE: "Certification exams update on December 7, 2026" — đề **Associate – Foundations, Developer – Foundations, Architect – Professional** có nội dung cập nhật từ ngày này; **guide mới phát hành 17/11/2026**; ai thi từ 07/12 trở đi nên dùng guide mới.
- **Architect – Foundations (CCAR-F) không có trong danh sách** → guide v1.0 vẫn áp dụng.
- Ngày 18/11/2026, trang Partner Certifications vẫn liên kết tới các guide v1.0 (July 2026); chưa tìm thấy guide mới ở nguồn chính thức nên **chưa biết chi tiết thay đổi**. App này giữ v1.0 vì người học thi trước 07/12/2026.
- Các thay đổi khác đã có hiệu lực: chuyển sang Pearson + Credly (30/06/2026); CCAR-F tăng giá 99 → 125 USD (30/06/2026); hiệu lực 6 → 12 tháng; đăng nhập Pearson qua SSO và thanh toán tại Pearson (12/11/2026).

Nguồn: [Pearson VUE – Anthropic](https://www.pearsonvue.com/us/en/anthropic.html); [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications)

## Tài liệu chính thức

**Exam guide v1.0 (PDF):**
[CCAO-F](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf) ·
[CCDV-F](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf) ·
[CCAR-F](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) ·
[CCAR-P](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf) ·
[Registration Guide](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542947%2FClaude+Certification+Program+-+Exam+Registration+Guide.pdf) ·
[Certification Terms and Conditions](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F34hhd92iyp94a0gtbr15cy5jk%2Fpublic%2F1782870634%2FCertification+Terms+and+Conditions.pdf) ·
[Certification Exam Policy](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F34hhd92iyp94a0gtbr15cy5jk%2Fpublic%2F1782870704%2FAnthropic+Certification+Exam+Policy.pdf)

**Partner Academy (cần tài khoản partner):** [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications) · [Certification FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications) · [Exam prep courses](https://anthropic-partners.skilljar.com/page/claude-certification-exam-prep-courses) · prep: [Associate](https://anthropic-partners.skilljar.com/path/claude-certified-associate-foundations), [Developer](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations), [Architect – Foundations](https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses), [Architect – Professional](https://anthropic-partners.skilljar.com/path/claude-certified-architect-professional) · [Pearson SSO & checkout guide (PDF)](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794424056/Claude_certifications-Pearson_SSO_and_checkout.pdf)

**Pearson VUE:** [Trang Anthropic](https://www.pearsonvue.com/us/en/anthropic.html) · [OnVUE & Proof of ID](https://www.pearsonvue.com/us/en/anthropic/onvue.html?tab=3.-proof-of-id) · [Accommodations](https://www.pearsonvue.com/us/en/test-takers/accommodations/pearson_approve.anthropic.html)

**Claude Academy (công khai, miễn phí):** [academy.claude.com](https://academy.claude.com/) — Claude 101, AI Fluency, AI capabilities and limitations, Claude Code 101, Claude Code in action, Claude Platform 101, Building with the Claude API, Tool use with the Messages API, Introduction to MCP, MCP: Advanced topics, Introduction to agent skills, Introduction to evals.

**Docs:** [Claude API docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) · [Claude Code docs](https://code.claude.com/docs/en/memory) · [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) · [Model Context Protocol](https://modelcontextprotocol.io/docs/learn/architecture) · [Claude Help Center](https://support.claude.com/en/articles/9517075-what-are-projects)

Nguồn: [Partner Certifications](https://anthropic-partners.skilljar.com/page/partner-certifications); trang chứng chỉ CCAR-F trên Partner Academy; [Claude Academy](https://academy.claude.com/)

## Cách dùng app này

1. **Ôn theo trọng số**: mở ghi chú đề của mình, học domain nặng trước (CCAR-F: D1 27%; CCDV-F: D2 33,1%; CCAO-F: D2 21%; CCAR-P: D3 19%). Tạo bài **Theo domain** cho các domain đó.
2. **Làm câu mẫu chính thức trước** (pack `official`, mã `OF-…`): đây là văn phong chuẩn của đề; đọc kỹ giải thích từng phương án nhiễu.
3. **Thi thử (mock)**: đúng số câu và thời gian đề thật, chia câu theo trọng số; CCAR-F bốc 4/6 scenario. Điểm scaled trong app chỉ là **ước tính** (thang thật không công bố); nhắm ≥ 80% đúng để có biên an toàn.
4. **Ôn câu sai**: câu sai ở bất kỳ lần nào nằm trong danh sách ôn đến khi đúng liên tiếp 2 lần. Làm danh sách này sau mỗi bài thi thử.
5. **Dashboard**: xem % đúng theo domain (3 lần trả lời gần nhất mỗi câu); domain dưới 70% quay lại ghi chú + bài học liên kết.
6. **Hỏi AI**: khi không hiểu vì sao đáp án đúng, hỏi AI ngay trong câu; báo lỗi câu hỏi nếu nghi đáp án sai — coach sẽ đối chiếu tài liệu chính thức và sửa.
7. Trước ngày thi: đọc lại mục "Bẫy thường gặp" của từng domain và phần Đăng ký và thi ở trên (giấy tờ, tên khớp, hạn đổi lịch).
