---
title: "CCDV-P · Claude Certified Developer – Professional"
exams: [CCDV-P]
---

# CCDV-P · Claude Certified Developer – Professional

> Repo **chưa có Exam Guide chính thức** của CCDV-P. Tên domain dưới đây lấy từ bộ luyện `bank/sources/ccdv-p-1.txt`. Số câu, thời gian và weight trong `exams.yaml` là **tạm**: weight = phân bố 70 câu của bộ này. Có guide chính thức thì sửa lại cả hai chỗ.

## Domain (thứ tự theo số bài học của khoá gốc)

| ID | Domain | Số câu trong ccdv-p-1 | Bài học gốc |
|---|---|---|---|
| D1 | Advanced Agent Architecture and Orchestration | 11 | 1-1 điều phối nhiều agent · 1-2 chạy bền và lưu trạng thái · 1-3 chọn kiến trúc khi mở rộng · 1-4 kiến trúc context và memory |
| D2 | Production Integration, Reliability, and Knowledge Grounding | 15 | 2-1 độ tin cậy dịch vụ Claude · 2-2 quy mô và thông lượng · 2-3 MCP production và quản lý thay đổi · 2-4 truy xuất và grounding |
| D3 | Observability and Production Monitoring | 6 | 3-1 telemetry và instrumentation · 3-2 giám sát và cảnh báo · 3-3 phân tích trace quy mô lớn |
| D4 | Advanced Debugging and Incident Response | 7 | 4-1 chẩn đoán lỗi phức tạp · 4-2 xử lý sự cố |
| D5 | Evaluation Engineering and Quality Assurance | 9 | 5-1 thiết kế hệ thống eval · 5-2 LLM-as-judge · 5-3 đo chất lượng trên production |
| D6 | Cost and Latency Optimization at Scale | 7 | 6-1 chi phí quy mô lớn · 6-2 tối ưu độ trễ |
| D7 | Runtime Guardrails and Production Security | 9 | 7-1 guardrail lúc chạy · 7-2 phòng thủ tấn công agent · 7-3 định danh, bí mật và audit |
| D8 | Agent Fleet Operations for Software Delivery | 6 | 8-1 chạy song song coding agent · 8-2 kiểm chứng và AI code review · 8-3 agent chạy không người trực · 8-4 cấu hình toàn tổ chức |

## Bộ câu

- Pack `ccdv-p-1` (`bank/packs/ccdv-p-1.yaml`): 70 câu theo tình huống, 3 set, mỗi câu 1 đáp án. Giải thích tiếng Việt gồm mẹo nhớ, vì sao đúng / sai từng phương án, từ khoá.
- Nhập bộ mới cùng định dạng: `npm run import-txt -- <file.txt>` (dòng đầu file là tên kỳ thi như trong `exams.yaml`).
