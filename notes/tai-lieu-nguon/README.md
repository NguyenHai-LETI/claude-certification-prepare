# Tài liệu nguồn: bài "Kiến thức" của anthropic.cloudexam.pro

Bản crawl từ https://anthropic.cloudexam.pro/kien-thuc/<kỳ thi>, mỗi bài một file Markdown, đầu file có `nguon` (URL gốc) và `ngay_tai`.
Crawl lại: `npm run crawl-cloudexam -- [ccar-f ccdv-f ccdv-p ccar-p ccao-f]` (script `scripts/crawl-cloudexam.ts`, README này được sinh lại tự động).
Sơ đồ trên trang được chuyển thành chữ (danh sách bước, cột so sánh), không giữ hình.

Lưu ý: đây là tài liệu của bên thứ ba (cloudexam.pro), không phải tài liệu chính thức của Anthropic; mỗi bài có mục "Nguồn" trỏ tới docs gốc.

| Bộ | Số bài |
|---|---|
| [CCAO-F](#ccao-f) | 31 (tải 2026-11-27) |
| [CCAR-F](#ccar-f) | 31 (tải 2026-11-27) |
| [CCAR-P](#ccar-p) | 39 (tải 2026-11-27) |
| [CCDV-F](#ccdv-f) | 26 (tải 2026-11-27) |
| [CCDV-P](#ccdv-p) | 26 (tải 2026-11-27) |

## CCAO-F

| File | Bài |
|---|---|
| [on-nhanh.md](ccao-f/on-nhanh.md) | Tổng quan CCAO-F |
| [1-1-viet-prompt-hieu-qua.md](ccao-f/1-1-viet-prompt-hieu-qua.md) | Viết prompt hiệu quả cho việc kinh doanh và kỹ thuật |
| [1-2-chia-nho-yeu-cau.md](ccao-f/1-2-chia-nho-yeu-cau.md) | Chia nhỏ một yêu cầu phức tạp |
| [1-3-lap-lai-de-cai-thien.md](ccao-f/1-3-lap-lai-de-cai-thien.md) | Sửa prompt qua nhiều lượt để kết quả tốt hơn |
| [1-4-prompt-theo-loai-viec.md](ccao-f/1-4-prompt-theo-loai-viec.md) | Đổi cách prompt theo loại việc |
| [2-1-danh-gia-chinh-xac-va-day-du.md](ccao-f/2-1-danh-gia-chinh-xac-va-day-du.md) | Đánh giá kết quả của Claude có chính xác và đầy đủ không |
| [2-2-hallucination-mau-thuan-thien-kien.md](ccao-f/2-2-hallucination-mau-thuan-thien-kien.md) | Nhận ra hallucination, mâu thuẫn và thiên kiến |
| [2-3-kiem-chung-thong-tin.md](ccao-f/2-3-kiem-chung-thong-tin.md) | Kiểm chứng thông tin trong kết quả của Claude |
| [2-4-khi-nao-can-nguoi-duyet.md](ccao-f/2-4-khi-nao-can-nguoi-duyet.md) | Khi nào kết quả cần người duyệt hoặc kiểm thêm |
| [2-5-chinh-output-theo-nguoi-doc.md](ccao-f/2-5-chinh-output-theo-nguoi-doc.md) | Sửa, chuyển thể và so sánh kết quả cho đúng người đọc |
| [2-6-chon-dinh-dang-output.md](ccao-f/2-6-chon-dinh-dang-output.md) | Sắp xếp thông tin và chọn khuôn đầu ra |
| [3-1-chon-tinh-nang-claude.md](ccao-f/3-1-chon-tinh-nang-claude.md) | Chọn tính năng Claude cho từng việc |
| [3-2-cac-dong-model.md](ccao-f/3-2-cac-dong-model.md) | Phân biệt các dòng model Claude |
| [3-3-chon-model-theo-viec.md](ccao-f/3-3-chon-model-theo-viec.md) | Chọn model theo yêu cầu của việc |
| [3-4-context-va-memory.md](ccao-f/3-4-context-va-memory.md) | Giới hạn context và Memory, khi nào bắt đầu lại, tóm tắt hay lưu lâu dài |
| [4-1-phan-tich-yeu-cau.md](ccao-f/4-1-phan-tich-yeu-cau.md) | Dùng Claude phân tích yêu cầu và use case |
| [4-2-nghien-cuu-va-lap-ke-hoach.md](ccao-f/4-2-nghien-cuu-va-lap-ke-hoach.md) | Dùng Claude cho nghiên cứu, lập kế hoạch và tối ưu quy trình |
| [4-3-thiet-ke-giai-phap.md](ccao-f/4-3-thiet-ke-giai-phap.md) | Dùng Claude thiết kế giải pháp, làm bản mẫu và làm lặp |
| [4-4-dua-claude-vao-quy-trinh.md](ccao-f/4-4-dua-claude-vao-quy-trinh.md) | Đưa Claude vào quy trình đang có |
| [4-5-trinh-bay-gia-tri-va-gioi-han.md](ccao-f/4-5-trinh-bay-gia-tri-va-gioi-han.md) | Nói với các bên về giá trị và giới hạn của Claude |
| [5-1-cau-hinh-project.md](ccao-f/5-1-cau-hinh-project.md) | Cấu hình Project với chỉ dẫn và tài liệu |
| [5-2-tai-lieu-va-connector.md](ccao-f/5-2-tai-lieu-va-connector.md) | Quản lý tài liệu tải lên và connector |
| [5-3-viet-chi-dan-he-thong.md](ccao-f/5-3-viet-chi-dan-he-thong.md) | Viết chỉ dẫn cấp hệ thống cho Claude |
| [5-4-bao-tri-cau-hinh.md](ccao-f/5-4-bao-tri-cau-hinh.md) | Duy trì và cập nhật cấu hình, tài liệu và Memory |
| [6-1-viec-nen-va-khong-nen-dung.md](ccao-f/6-1-viec-nen-va-khong-nen-dung.md) | Việc nên và không nên dùng Claude |
| [6-2-du-lieu-nhay-cam.md](ccao-f/6-2-du-lieu-nhay-cam.md) | Dữ liệu nhạy cảm, quy định và quyền riêng tư khi dùng Claude |
| [6-3-chinh-sach-ai-to-chuc.md](ccao-f/6-3-chinh-sach-ai-to-chuc.md) | Làm theo chính sách AI và chuẩn quản trị của tổ chức |
| [6-4-dao-duc-khi-dung-ai.md](ccao-f/6-4-dao-duc-khi-dung-ai.md) | Hệ quả đạo đức khi dùng AI trong công việc |
| [7-1-chan-doan-ket-qua-kem.md](ccao-f/7-1-chan-doan-ket-qua-kem.md) | Chẩn đoán và sửa prompt cho kết quả kém |
| [7-2-dieu-chinh-theo-phan-hoi.md](ccao-f/7-2-dieu-chinh-theo-phan-hoi.md) | Điều chỉnh cách làm theo phản hồi và kết quả |
| [7-3-toi-uu-quy-trinh.md](ccao-f/7-3-toi-uu-quy-trinh.md) | Tối ưu quy trình dùng Claude cho nhanh và hiệu quả |
| [tom-tat-on-gap-4-7.md](ccao-f/tom-tat-on-gap-4-7.md) | Tự soạn, không phải bản crawl |

## CCAR-F

| File | Bài |
|---|---|
| [on-nhanh.md](ccar-f/on-nhanh.md) | Tổng quan CCAR-F |
| [1-1-vong-lap-agent.md](ccar-f/1-1-vong-lap-agent.md) | Vòng lặp agent và stop_reason |
| [1-2-dieu-phoi-nhieu-agent.md](ccar-f/1-2-dieu-phoi-nhieu-agent.md) | Điều phối nhiều agent theo mô hình coordinator–subagent |
| [1-3-goi-subagent-va-truyen-context.md](ccar-f/1-3-goi-subagent-va-truyen-context.md) | Gọi subagent, truyền context và chạy song song |
| [1-4-ep-quy-trinh-va-chuyen-giao.md](ccar-f/1-4-ep-quy-trinh-va-chuyen-giao.md) | Ép thứ tự các bước và bàn giao cho người |
| [1-5-hook-agent-sdk.md](ccar-f/1-5-hook-agent-sdk.md) | Hook trong Agent SDK - chặn lời gọi tool và chuẩn hoá kết quả |
| [1-6-chia-nho-nhiem-vu.md](ccar-f/1-6-chia-nho-nhiem-vu.md) | Chia nhỏ nhiệm vụ phức tạp |
| [1-7-session-tiep-tuc-va-fork.md](ccar-f/1-7-session-tiep-tuc-va-fork.md) | Resume, fork hay mở session mới |
| [2-1-thiet-ke-tool.md](ccar-f/2-1-thiet-ke-tool.md) | Thiết kế tool có mô tả rõ ràng và ranh giới tách bạch |
| [2-2-loi-co-cau-truc-mcp.md](ccar-f/2-2-loi-co-cau-truc-mcp.md) | Trả lỗi có cấu trúc từ tool MCP |
| [2-3-phan-tool-va-tool-choice.md](ccar-f/2-3-phan-tool-va-tool-choice.md) | Phân tool cho từng agent và cấu hình tool_choice |
| [2-4-tich-hop-mcp-server.md](ccar-f/2-4-tich-hop-mcp-server.md) | Tích hợp MCP server vào Claude Code và agent |
| [2-5-tool-co-san-claude-code.md](ccar-f/2-5-tool-co-san-claude-code.md) | Dùng đúng tool có sẵn Read, Write, Edit, Bash, Grep, Glob |
| [3-1-phan-cap-claude-md.md](ccar-f/3-1-phan-cap-claude-md.md) | Phân cấp CLAUDE.md, @import và .claude/rules |
| [3-2-slash-command-va-skill.md](ccar-f/3-2-slash-command-va-skill.md) | Tạo slash command và skill cho Claude Code |
| [3-3-rule-theo-duong-dan.md](ccar-f/3-3-rule-theo-duong-dan.md) | Rule theo đường dẫn trong .claude/rules |
| [3-4-plan-mode-hay-lam-ngay.md](ccar-f/3-4-plan-mode-hay-lam-ngay.md) | Khi nào dùng plan mode, khi nào làm ngay |
| [3-5-tinh-chinh-lap-lai.md](ccar-f/3-5-tinh-chinh-lap-lai.md) | Tinh chỉnh lặp lại cho tới khi đúng |
| [3-6-claude-code-trong-ci.md](ccar-f/3-6-claude-code-trong-ci.md) | Đưa Claude Code vào pipeline CI/CD |
| [4-1-tieu-chi-ro-rang.md](ccar-f/4-1-tieu-chi-ro-rang.md) | Viết prompt có tiêu chí rõ ràng để bớt báo sai |
| [4-2-few-shot.md](ccar-f/4-2-few-shot.md) | Dùng few-shot để kết quả nhất quán |
| [4-3-output-co-cau-truc.md](ccar-f/4-3-output-co-cau-truc.md) | Ép đầu ra có cấu trúc bằng tool use và JSON schema |
| [4-4-kiem-tra-va-thu-lai.md](ccar-f/4-4-kiem-tra-va-thu-lai.md) | Kiểm tra, retry và vòng phản hồi cho dữ liệu trích xuất |
| [4-5-xu-ly-theo-lo.md](ccar-f/4-5-xu-ly-theo-lo.md) | Thiết kế xử lý theo lô cho hiệu quả |
| [4-6-review-nhieu-luot.md](ccar-f/4-6-review-nhieu-luot.md) | Thiết kế review nhiều instance và nhiều lần |
| [5-1-quan-ly-context.md](ccar-f/5-1-quan-ly-context.md) | Giữ thông tin quan trọng trong cuộc trò chuyện dài |
| [5-2-chuyen-cho-nguoi-va-mo-ho.md](ccar-f/5-2-chuyen-cho-nguoi-va-mo-ho.md) | Khi nào chuyển cho người, và xử lý yêu cầu mơ hồ |
| [5-3-lan-truyen-loi.md](ccar-f/5-3-lan-truyen-loi.md) | Truyền lỗi giữa các agent trong hệ thống nhiều agent |
| [5-4-kham-pha-codebase-lon.md](ccar-f/5-4-kham-pha-codebase-lon.md) | Quản lý context khi tìm hiểu codebase lớn |
| [5-5-nguoi-duyet-va-do-tin-cay.md](ccar-f/5-5-nguoi-duyet-va-do-tin-cay.md) | Thiết kế quy trình người duyệt và hiệu chỉnh độ tin cậy |
| [5-6-nguon-goc-thong-tin.md](ccar-f/5-6-nguon-goc-thong-tin.md) | Giữ nguồn gốc thông tin khi tổng hợp từ nhiều nguồn |

## CCAR-P

| File | Bài |
|---|---|
| [on-nhanh.md](ccar-p/on-nhanh.md) | Tổng quan CCAR-P |
| [1-1-tu-bai-toan-den-giai-phap.md](ccar-p/1-1-tu-bai-toan-den-giai-phap.md) | Từ bài toán kinh doanh đến giải pháp dùng Claude |
| [1-2-kien-truc-dau-cuoi.md](ccar-p/1-2-kien-truc-dau-cuoi.md) | Thiết kế kiến trúc đầu cuối |
| [1-3-chon-mau-kien-truc.md](ccar-p/1-3-chon-mau-kien-truc.md) | Chọn augmented LLM, workflow hay agent |
| [1-4-he-nhieu-agent.md](ccar-p/1-4-he-nhieu-agent.md) | Thiết kế hệ nhiều agent và cách điều phối |
| [1-5-chia-nho-bai-toan.md](ccar-p/1-5-chia-nho-bai-toan.md) | Chia nhỏ bài toán phức tạp |
| [1-6-tru-cot-gia-tri.md](ccar-p/1-6-tru-cot-gia-tri.md) | Gắn giải pháp với các trụ cột giá trị kinh doanh |
| [2-1-chon-model.md](ccar-p/2-1-chon-model.md) | Chọn model Claude theo đánh đổi |
| [2-2-system-prompt-va-guardrail.md](ccar-p/2-2-system-prompt-va-guardrail.md) | Thiết kế system prompt, template và guardrail |
| [2-3-ky-thuat-prompt.md](ccar-p/2-3-ky-thuat-prompt.md) | Zero-shot, few-shot và chain-of-thought |
| [2-4-context-window-va-token.md](ccar-p/2-4-context-window-va-token.md) | Tối ưu context window và quản lý token |
| [2-5-tai-su-dung-prompt.md](ccar-p/2-5-tai-su-dung-prompt.md) | Dùng lại prompt bằng caching, module và Skills |
| [3-1-cau-hinh-thua-nang-luc.md](ccar-p/3-1-cau-hinh-thua-nang-luc.md) | Đánh giá cấu hình tool bị thừa năng lực |
| [3-2-xac-thuc-va-phan-quyen.md](ccar-p/3-2-xac-thuc-va-phan-quyen.md) | Phân tích xác thực và phân quyền để tìm lỗ hổng |
| [3-3-do-chinh-xac-va-do-tre.md](ccar-p/3-3-do-chinh-xac-va-do-tre.md) | Đánh đổi độ chính xác và độ trễ |
| [3-4-quan-sat-o-quy-mo-lon.md](ccar-p/3-4-quan-sat-o-quy-mo-lon.md) | Quan sát hệ thống agent ở quy mô lớn |
| [3-5-rag-chunking-va-index.md](ccar-p/3-5-rag-chunking-va-index.md) | Thiết kế pipeline RAG, chia chunk và đánh chỉ mục |
| [3-6-chien-luoc-truy-xuat.md](ccar-p/3-6-chien-luoc-truy-xuat.md) | Chọn chiến lược truy xuất theo dữ liệu và kiểu câu hỏi |
| [3-7-chon-co-che-tich-hop.md](ccar-p/3-7-chon-co-che-tich-hop.md) | Chọn cơ chế tích hợp MCP, API/CLI hay agent-to-agent |
| [3-8-nap-dan-hay-nap-het.md](ccar-p/3-8-nap-dan-hay-nap-het.md) | Nạp dần hay nạp hết context |
| [4-1-chi-so-danh-gia.md](ccar-p/4-1-chi-so-danh-gia.md) | Định nghĩa chỉ số đánh giá |
| [4-2-bo-du-lieu-danh-gia.md](ccar-p/4-2-bo-du-lieu-danh-gia.md) | Thiết kế bộ dữ liệu đánh giá và khung kiểm thử |
| [4-3-ab-test-va-cai-tien.md](ccar-p/4-3-ab-test-va-cai-tien.md) | A/B test và cải tiến lặp |
| [4-4-chan-doan-su-co.md](ccar-p/4-4-chan-doan-su-co.md) | Chẩn đoán sự cố của hệ thống dùng Claude |
| [4-5-toi-uu-chi-phi-va-do-tre.md](ccar-p/4-5-toi-uu-chi-phi-va-do-tre.md) | Tối ưu token, độ trễ và chi phí so với hiệu năng |
| [4-6-giam-sat-van-hanh.md](ccar-p/4-6-giam-sat-van-hanh.md) | Giám sát hiệu năng bằng log và công cụ quan sát |
| [5-1-guardrail-va-kiem-soat.md](ccar-p/5-1-guardrail-va-kiem-soat.md) | Triển khai guardrail và kiểm soát an toàn |
| [5-2-rui-ro-va-cach-hong.md](ccar-p/5-2-rui-ro-va-cach-hong.md) | Nhận diện rủi ro, giới hạn và kiểu hỏng của hệ thống LLM |
| [5-3-nguoi-duyet-trong-vong-lap.md](ccar-p/5-3-nguoi-duyet-trong-vong-lap.md) | Áp dụng người duyệt trong vòng lặp |
| [5-4-tuan-thu-quy-dinh.md](ccar-p/5-4-tuan-thu-quy-dinh.md) | Bảo đảm tuân thủ quy định như GDPR, HIPAA, FedRAMP |
| [5-5-dao-duc-ai.md](ccar-p/5-5-dao-duc-ai.md) | Đạo đức AI, gồm thiên lệch, công bằng và minh bạch |
| [6-1-khao-sat-yeu-cau.md](ccar-p/6-1-khao-sat-yeu-cau.md) | Khảo sát có cấu trúc và thu thập yêu cầu |
| [6-2-trinh-bay-quyet-dinh.md](ccar-p/6-2-trinh-bay-quyet-dinh.md) | Trình bày quyết định kiến trúc và các đánh đổi |
| [6-3-ky-vong-va-sla.md](ccar-p/6-3-ky-vong-va-sla.md) | Vòng phản hồi, kỳ vọng của các bên và SLA |
| [6-4-tai-lieu-kien-truc.md](ccar-p/6-4-tai-lieu-kien-truc.md) | Viết tài liệu kiến trúc và hướng dẫn triển khai |
| [6-5-vong-doi-du-an.md](ccar-p/6-5-vong-doi-du-an.md) | Đồng hành qua các giai đoạn của vòng đời giải pháp |
| [7-1-cau-hinh-claude-code-cho-team.md](ccar-p/7-1-cau-hinh-claude-code-cho-team.md) | Cấu hình Claude Code cho cả đội |
| [7-2-quy-trinh-lap-trinh-voi-ai.md](ccar-p/7-2-quy-trinh-lap-trinh-voi-ai.md) | Cải thiện quy trình lập trình bằng công cụ AI |
| [7-3-go-loi-va-su-co.md](ccar-p/7-3-go-loi-va-su-co.md) | Gỡ lỗi và xử lý sự cố vận hành Claude Code |

## CCDV-F

| File | Bài |
|---|---|
| [on-nhanh.md](ccdv-f/on-nhanh.md) | Tổng quan CCDV-F |
| [1-1-workflow-hay-agent.md](ccdv-f/1-1-workflow-hay-agent.md) | Workflow hay agent, và khi nào chia cho subagent |
| [1-2-cach-dung-agent.md](ccdv-f/1-2-cach-dung-agent.md) | Dựng agent với Claude - tự viết vòng lặp, Agent SDK hay Managed Agents |
| [1-3-mau-agent-va-framework.md](ccdv-f/1-3-mau-agent-va-framework.md) | Các mẫu agent và framework - vòng lặp tool, subagent, bộ nhớ, context |
| [2-1-tu-yeu-cau-den-cau-hinh.md](ccdv-f/2-1-tu-yeu-cau-den-cau-hinh.md) | Từ yêu cầu nghiệp vụ đến yêu cầu chức năng và hạ tầng |
| [2-2-vong-doi-he-thong.md](ccdv-f/2-2-vong-doi-he-thong.md) | Vòng đời hệ thống - vận hành, model hết hạn và thay đổi phiên bản API |
| [2-3-co-che-messages-api.md](ccdv-f/2-3-co-che-messages-api.md) | Cơ chế Messages API - hội thoại, streaming, ảnh, thinking, gọi theo lô |
| [2-4-nen-tang-ky-thuat-phan-mem.md](ccdv-f/2-4-nen-tang-ky-thuat-phan-mem.md) | Nền tảng kỹ thuật phần mềm khi tích hợp Claude |
| [2-5-thiet-ke-ung-dung-claude.md](ccdv-f/2-5-thiet-ke-ung-dung-claude.md) | Thiết kế ứng dụng Claude - giao diện, ranh giới nội dung, schema, phiên, plugin |
| [2-6-quan-ly-cau-hinh.md](ccdv-f/2-6-quan-ly-cau-hinh.md) | Quản lý cấu hình - CLAUDE.md, settings.json, ghim model, phiên bản prompt, plugin |
| [3-1-van-hanh-claude-code.md](ccdv-f/3-1-van-hanh-claude-code.md) | Vận hành Claude Code - thành phần, phiên, headless, auto mode |
| [4-1-go-loi-va-xu-ly-loi.md](ccdv-f/4-1-go-loi-va-xu-ly-loi.md) | Gỡ lỗi và xử lý lỗi - loại lỗi, cách phục hồi, đọc trace |
| [5-1-nen-tang-llm.md](ccdv-f/5-1-nen-tang-llm.md) | Nền tảng LLM - token, context window, lấy mẫu, thinking và ví dụ trong prompt |
| [5-2-goi-api-qua-sdk-va-rest.md](ccdv-f/5-2-goi-api-qua-sdk-va-rest.md) | Gọi Claude qua REST và SDK - endpoint, header, phản hồi, WebSocket |
| [5-3-chon-model.md](ccdv-f/5-3-chon-model.md) | Chọn model Claude - năng lực, độ trễ, chi phí và thay đổi giữa các bản |
| [5-4-chi-phi-va-token.md](ccdv-f/5-4-chi-phi-va-token.md) | Quản lý chi phí và token - giá, dự toán, prompt caching, theo dõi mức dùng |
| [6-1-quan-ly-context.md](ccdv-f/6-1-quan-ly-context.md) | Context engineering - chống trôi và phình context, cô lập bằng subagent |
| [6-2-viet-prompt.md](ccdv-f/6-2-viet-prompt.md) | Viết prompt - chỉ dẫn rõ, ví dụ mẫu, đặt đúng chỗ, ràng buộc đầu ra, sửa có đo |
| [6-3-xu-ly-output.md](ccdv-f/6-3-xu-ly-output.md) | Xử lý đầu ra - structured outputs, kiểm tra, đọc phòng thủ, hoài nghi câu trả lời tự tin |
| [7-1-bao-mat-ung-dung-ai.md](ccdv-f/7-1-bao-mat-ung-dung-ai.md) | Bảo mật ứng dụng AI - prompt injection, jailbreak, nội dung không tin cậy, dữ liệu nhạy cảm |
| [7-2-guardrail-nhieu-lop.md](ccdv-f/7-2-guardrail-nhieu-lop.md) | Guardrail nhiều lớp và triển khai an toàn - chính sách nội dung, quyền tối thiểu, định danh |
| [7-3-hook-chan-hanh-dong-nguy-hiem.md](ccdv-f/7-3-hook-chan-hanh-dong-nguy-hiem.md) | Hook của Claude - chặn hành động phá huỷ một cách tất định |
| [7-4-api-key-va-bi-mat.md](ccdv-f/7-4-api-key-va-bi-mat.md) | Định danh, khoá API và bí mật - loại khoá, lưu trữ, xoay vòng, xử lý khi lộ |
| [8-1-viet-tool.md](ccdv-f/8-1-viet-tool.md) | Viết tool cho Claude - chỗ tool chạy, schema, mô tả, lỗi và bộ tool gọn |
| [8-2-viet-mcp-server.md](ccdv-f/8-2-viet-mcp-server.md) | Viết MCP server - host, client, server, ba primitive và hai cách giao tiếp |
| [8-3-tool-skill-hay-mcp.md](ccdv-f/8-3-tool-skill-hay-mcp.md) | Tool có sẵn, tool tự viết, skill hay MCP - chọn cách mở rộng Claude |

## CCDV-P

| File | Bài |
|---|---|
| [on-nhanh.md](ccdv-p/on-nhanh.md) | Tổng quan CCDV-P |
| [1-1-dieu-phoi-nhieu-agent.md](ccdv-p/1-1-dieu-phoi-nhieu-agent.md) | Điều phối nhiều agent trên production - giao việc, cô lập context, giao tiếp và người duyệt |
| [1-2-chay-ben-va-luu-trang-thai.md](ccdv-p/1-2-chay-ben-va-luu-trang-thai.md) | Chạy bền cho agent dài hơi - lưu session, checkpoint, resume và đổi model giữa chừng |
| [1-3-chon-kien-truc-khi-mo-rong.md](ccdv-p/1-3-chon-kien-truc-khi-mo-rong.md) | Chọn kiến trúc khi hệ thống lớn lên - workflow hay agent, harness nào, chuẩn dùng chung cho team |
| [1-4-kien-truc-context-va-memory.md](ccdv-p/1-4-kien-truc-context-va-memory.md) | Kiến trúc context và memory cho agent chạy lâu - tool search, context editing, compaction, đổi chỉ dẫn giữa chừng |
| [2-1-do-tin-cay-dich-vu-claude.md](ccdv-p/2-1-do-tin-cay-dich-vu-claude.md) | Độ tin cậy cho dịch vụ Claude - retry, circuit breaker và fallback theo đúng loại lỗi |
| [2-2-quy-mo-va-thong-luong.md](ccdv-p/2-2-quy-mo-va-thong-luong.md) | Quy mô và thông lượng - rate limit, hàng đợi, batch và quota cho nhiều tenant |
| [2-3-mcp-production-va-quan-ly-thay-doi.md](ccdv-p/2-3-mcp-production-va-quan-ly-thay-doi.md) | MCP production và quản lý thay đổi - remote MCP, version tool, đổi model, prompt và rollout |
| [2-4-truy-xuat-va-grounding.md](ccdv-p/2-4-truy-xuat-va-grounding.md) | Truy xuất và grounding ở quy mô lớn - đo theo tầng, chunk, hybrid search, rerank, trích dẫn |
| [3-1-telemetry-va-instrumentation.md](ccdv-p/3-1-telemetry-va-instrumentation.md) | Telemetry và instrumentation - trace agent, đếm token, chẩn đoán cache, ghi nội dung khi có ZDR |
| [3-2-giam-sat-va-canh-bao.md](ccdv-p/3-2-giam-sat-va-canh-bao.md) | Giám sát và cảnh báo trên production - SLI, SLO, dashboard token và chi phí, phát hiện chất lượng giảm |
| [3-3-phan-tich-trace-quy-mo-lon.md](ccdv-p/3-3-phan-tich-trace-quy-mo-lon.md) | Phân tích trace ở quy mô lớn - lấy mẫu, gom số, phân tích cohort lỗi |
| [4-1-chan-doan-loi-phuc-tap.md](ccdv-p/4-1-chan-doan-loi-phuc-tap.md) | Chẩn đoán lỗi phức tạp - tìm ra lỗi sinh ở model, harness, tool hay dữ liệu |
| [4-2-xu-ly-su-co.md](ccdv-p/4-2-xu-ly-su-co.md) | Xử lý sự cố và rút kinh nghiệm - triage, giảm thiệt hại, rollback, báo tin, postmortem |
| [5-1-thiet-ke-he-thong-eval.md](ccdv-p/5-1-thiet-ke-he-thong-eval.md) | Thiết kế hệ thống eval offline - golden set, regression suite, cổng CI/CD và giữ bộ eval còn đúng |
| [5-2-llm-as-judge.md](ccdv-p/5-2-llm-as-judge.md) | LLM-as-judge - rubric, thiên lệch, hiệu chỉnh với nhãn của người và độ trôi giữa các version model |
| [5-3-do-chat-luong-tren-production.md](ccdv-p/5-3-do-chat-luong-tren-production.md) | Đo chất lượng trên production - lấy mẫu lưu lượng thật, A/B test, vòng phản hồi và chọn chỉ số theo loại việc |
| [6-1-chi-phi-quy-mo-lon.md](ccdv-p/6-1-chi-phi-quy-mo-lon.md) | Kiến trúc chi phí ở quy mô lớn - tính và dự báo chi phí, chia việc cho nhiều model, cache, batch và ngân sách theo tenant |
| [6-2-toi-uu-do-tre.md](ccdv-p/6-2-toi-uu-do-tre.md) | Tối ưu độ trễ - TTFT và độ trễ tổng, streaming, gọi tool song song, cache, effort |
| [7-1-guardrail-luc-chay.md](ccdv-p/7-1-guardrail-luc-chay.md) | Guardrail lúc chạy - xếp lớp theo rủi ro, che PII, chặn hành động phá huỷ, sandbox, approval gate và tinh chỉnh bộ lọc |
| [7-2-phong-thu-tan-cong-agent.md](ccdv-p/7-2-phong-thu-tan-cong-agent.md) | Phòng thủ agent trước tấn công - prompt injection, đầu độc tool và memory, rò dữ liệu, red team |
| [7-3-dinh-danh-bi-mat-va-audit.md](ccdv-p/7-3-dinh-danh-bi-mat-va-audit.md) | Danh tính, bí mật và audit ở quy mô lớn - danh tính agent, Workload Identity Federation, vault, quyền tối thiểu và audit log |
| [8-1-chay-song-song-coding-agent.md](ccdv-p/8-1-chay-song-song-coding-agent.md) | Chạy song song nhiều coding agent - chia việc, worktree riêng, chiến lược merge và telemetry của cả nhóm agent |
| [8-2-kiem-chung-va-ai-code-review.md](ccdv-p/8-2-kiem-chung-va-ai-code-review.md) | Kiểm chứng và vận hành AI code review - shadow mode, hiệu chỉnh với review của người, cổng merge và thiết kế giám sát |
| [8-3-agent-chay-khong-nguoi-truc.md](ccdv-p/8-3-agent-chay-khong-nguoi-truc.md) | Agent chạy không người trực - chạy tới mục tiêu, theo lịch và theo sự kiện, với checkpoint, thông báo và leo thang |
| [8-4-cau-hinh-toan-to-chuc.md](ccdv-p/8-4-cau-hinh-toan-to-chuc.md) | Cấu hình coding agent cho cả tổ chức - managed settings, MCP allowlist, telemetry, gateway và chuẩn chia sẻ skill, plugin |
