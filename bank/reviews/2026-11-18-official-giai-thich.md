# Soát câu hỏi — pack official (giải thích gọi phương án bằng chữ cái) — 2026-11-18
Người soát: claude-opus-5-5 (người soát độc lập) · Phạm vi: 17 câu chưa có `reviewed:` trong `bank/packs/official.yaml` (OF-CCARF-01…12, OF-CCDVF-01, OF-CCDVF-03, OF-CCAOF-01…03) · Số câu: 17

Ràng buộc của lượt này: câu official chép nguyên văn từ Exam Guide nên **không đổi** stem, phương án, đáp án, thứ tự phương án. Chỉ viết lại `explanation` (gọi phương án bằng nội dung thay vì chữ cái, nêu lý do cho từng phương án nhiễu, thêm nguồn khi nêu con số/tính năng) và thêm `reviewed: 2026-11-18`.

## Tổng kết
| Kết luận | Số câu |
|---|---|
| PASS | 0 |
| FIX | 17 |
| RETIRE | 0 |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

Tự giải trước cả 17 câu (che đáp án): kết quả trùng đáp án official ở cả 17 câu.

## Lỗi theo tiêu chí
| Tiêu chí | Số câu trượt |
|---|---|
| a. Đáp án đúng | 0 |
| b. Đúng một đáp án | 0 |
| c. Phương án nhiễu / manh mối | 0 (không sửa được: câu official) |
| d. Stem | 0 |
| e. Giải thích (gọi phương án bằng chữ cái; thiếu nguồn khi nêu con số) | 17 |
| f. Gắn kỳ thi / domain / `ref` | 0 |
| g. Trùng lặp | 0 |

## Chi tiết
| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đã sửa gì | Nguồn |
|---|---|---|---|---|---|
| OF-CCARF-01 | CCAR-F D1 (S1) | FIX | e | Viết lại giải thích bằng nội dung; thêm ý hook `PreToolUse` `deny` là bảo đảm tất định, còn chỉ dẫn văn bản chỉ là context; nói rõ vì sao classifier không giải quyết thứ tự. | https://code.claude.com/docs/en/agent-sdk/hooks · https://code.claude.com/docs/en/skills |
| OF-CCARF-02 | CCAR-F D2 (S1) | FIX | e | Viết lại bằng nội dung; dẫn "mô tả chi tiết là yếu tố quan trọng nhất", ít nhất 3–4 câu/mô tả; ghi nhận gộp tool là hợp lệ nhưng không phải bước đầu. | https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools |
| OF-CCARF-03 | CCAR-F D5 (S1) | FIX | e | Viết lại bằng nội dung, giữ lập luận rationale chính thức (ranh giới quyết định chưa rõ → tiêu chí + few-shot). | notes/exams/CCAR-F.md#52-escalation-và-xử-lý-mơ-hồ (rationale Exam Guide) |
| OF-CCARF-04 | CCAR-F D3 (S2) | FIX | e | Viết lại bằng nội dung; thêm ghi chú custom command đã gộp vào skill (`.claude/skills/`), `.claude/commands/` là định dạng cũ vẫn chạy. | https://code.claude.com/docs/en/slash-commands |
| OF-CCARF-05 | CCAR-F D3 (S2) | FIX | e | Viết lại bằng nội dung; mô tả plan mode đúng tài liệu (đọc file, đề xuất kế hoạch, không sửa tới khi duyệt). | https://code.claude.com/docs/en/common-workflows |
| OF-CCARF-06 | CCAR-F D3 (S2) | FIX | e | Viết lại bằng nội dung; rule `paths` chỉ nạp khi làm việc với file khớp glob; phần skill sửa cho đúng tài liệu (mô tả nạp sẵn, nội dung đầy đủ khi được gọi). | https://code.claude.com/docs/en/memory · https://code.claude.com/docs/en/skills |
| OF-CCARF-07 | CCAR-F D1 (S3) | FIX | e | Viết lại bằng nội dung, giữ lập luận phân rã quá hẹp ở coordinator. | notes/exams/CCAR-F.md#12-multi-agent-coordinatorsubagent (rationale Exam Guide) |
| OF-CCARF-08 | CCAR-F D5 (S3) | FIX | e | Viết lại bằng nội dung; nói rõ retry cục bộ không sai, sai ở thông báo chung chung. | notes/exams/CCAR-F.md#53-lan-truyền-lỗi-trong-hệ-multi-agent (rationale Exam Guide) |
| OF-CCARF-09 | CCAR-F D2 (S3) | FIX | e | Viết lại bằng nội dung, giữ lập luận least privilege và tỉ lệ 85/15 từ stem. | notes/exams/CCAR-F.md#23-phân-bổ-tool-và-tool_choice (rationale Exam Guide) |
| OF-CCARF-10 | CCAR-F D3 (S5) | FIX | e | Viết lại bằng nội dung; xác nhận `-p`/`--print` chạy không tương tác, `claude "query"` mở phiên tương tác, không có `--batch`, tài liệu không có `CLAUDE_HEADLESS`. | https://code.claude.com/docs/en/cli-reference · https://code.claude.com/docs/en/env-vars |
| OF-CCARF-11 | CCAR-F D4 (S5) | FIX | e | Viết lại bằng nội dung; số liệu kiểm lại: giảm 50%, phần lớn xong dưới 1 giờ, tối đa 24 giờ, kết quả không theo thứ tự → ghép bằng `custom_id`. | https://platform.claude.com/docs/en/build-with-claude/batch-processing |
| OF-CCARF-12 | CCAR-F D4 (S5) | FIX | e | Viết lại bằng nội dung, giữ lập luận attention dilution và chia lượt cục bộ + tích hợp. | notes/exams/CCAR-F.md#46-review-nhiều-instance-nhiều-lượt (rationale Exam Guide) |
| OF-CCDVF-01 | CCDV-F D2 | FIX | e | Viết lại bằng nội dung; kèm nguồn cho 50% / dưới 1 giờ / tối đa 24 giờ. | https://platform.claude.com/docs/en/build-with-claude/batch-processing |
| OF-CCDVF-03 | CCDV-F D8 | FIX | e | Viết lại bằng nội dung; bỏ khẳng định mơ hồ về built-in tool, thay bằng: tool do Anthropic cung cấp là bộ cố định (server tool chạy trên hạ tầng Anthropic). | https://modelcontextprotocol.io/docs/getting-started/intro · https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview |
| OF-CCAOF-01 | CCAO-F D2 | FIX | e | Viết lại bằng nội dung; dẫn khuyến nghị "luôn kiểm chứng thông tin quan trọng". | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations |
| OF-CCAOF-02 | CCAO-F D3 | FIX | e | Viết lại bằng nội dung; Haiku được mô tả "for high-volume, latency-sensitive tasks". | https://platform.claude.com/docs/en/about-claude/models/overview |
| OF-CCAOF-03 | CCAO-F D6 | FIX | e | Viết lại bằng nội dung, giữ lập luận ẩn danh hoá trước khi tải lên. | notes/exams/CCAO-F.md#d6--governance-risk-and-responsible-use-15 (rationale Exam Guide) |

## Cần người xem
Không có. Cả 17 đáp án official khớp với lời tự giải và tài liệu chính thức.

## Rủi ro còn lại
- **Cảnh báo validate trên câu official ngoài phạm vi:** OF-CCDVF-02 (đáp án 179 so với ≤ 83 ký tự) và OF-CCARP-03 (68 so với ≤ 40) bị cảnh báo đáp án dài. Đây là nguyên văn Exam Guide nên cố ý không sửa. Cảnh báo sẽ còn mãi; nên cho validate bỏ qua cảnh báo này với `origin: official`.
- **`ref` dùng slug heading, không dùng `id="`:** `notes/` không có anchor dạng `id="…"`. Cả 21 `ref` đều khớp slug heading tính theo `slugify` của app (`server/lib/notes.ts`), nên không sửa `ref` nào.
- **Nội dung dễ lỗi thời:**
  - OF-CCARF-04: Claude Code đã gộp custom command vào skill. Đáp án `.claude/commands/` vẫn đúng vì định dạng cũ vẫn chạy, nhưng có thể lỗi thời nếu định dạng này bị bỏ.
  - OF-CCARF-06: skill hiện cũng có frontmatter `paths`, nên phương án nhiễu về skill yếu hơn trước. Rule `.claude/rules/` vẫn là cơ chế dành riêng cho quy ước theo đường dẫn, nên đáp án vẫn là tốt nhất.
  - OF-CCARF-11 / OF-CCDVF-01: các con số của batch (50%, 24 giờ) đã kiểm ngày 2026-11-18.
- **Không có `reviewed:` mà vẫn đã soát:** không có. Cả 21 câu official giờ đều có `reviewed: 2026-11-18`.

## Để lượt sau
Không có. Đã soát hết 17 câu còn lại; Grep không còn giải thích nào trong `official.yaml` gọi phương án bằng chữ cái (`**A`…`**D`, "A sai", "phương án C"…).
