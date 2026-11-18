# Soát câu hỏi — pack ai-20261118-ccarp-ccarf — 2026-11-18
Người soát: claude-opus-5-5 (người soát độc lập) · Phạm vi: toàn bộ 55 câu của `bank/packs/ai-20261118-ccarp-ccarf.yaml` (bỏ giới hạn 30 câu/lượt theo yêu cầu) · Số câu: 55

Cách làm: tự giải từng câu trước khi xem đáp án, rồi mở tài liệu chính thức (WebFetch) để kiểm đáp án và từng phương án nhiễu; mở lại chính URL trong giải thích để xem có nói đúng điều giải thích khẳng định không. Grep `ccx.yaml`, `official.yaml` và `ai-20261118-ccaof-ccdvf.yaml` (chỉ đọc) để tìm câu gần trùng. Kiểm mọi `ref` có anchor `id="…"` thật trong `notes/lessons/`.

## Tổng kết
| Kết luận | Số câu |
|---|---|
| PASS | 49 |
| FIX | 6 (AI-CCARP-007, 011, 016, 018, 019, 020) |
| RETIRE | 0 |
| Cần người xem | 0 |
| Đổi đáp án | 0 |

Mọi đáp án đều đúng theo tài liệu hiện hành. Các câu tác giả kém chắc (CCARP-001, 005, 007, 013, 014, 015, 016, 023, 038; CCARF-002, 004, 005) đều khớp tài liệu, nhiều chỗ khớp gần như nguyên văn. Hai câu trong số đó vẫn phải sửa vì trùng hoặc vì phụ thuộc phiên bản (007, 016).

## Lỗi theo tiêu chí
| Tiêu chí | Số câu trượt |
|---|---|
| a. Đáp án đúng | 0 |
| b. Đúng một đáp án | 0 |
| c. Phương án nhiễu | 0 |
| d. Stem | 0 |
| e. Giải thích / nguồn | 4 (016, 018, 019, 020) |
| f. Gắn kỳ thi / domain / scenario / ref | 0 (29 anchor `ref` đều tồn tại) |
| g. Gần trùng | 3 (007, 011, 016) |

Cảnh báo trùng chéo pack (không tính là trượt vì hai câu nằm ở pool kỳ thi khác nhau; xem *Rủi ro còn lại*): 010 ↔ AI-CCAOF-001, 014 ↔ AI-CCDVF-015, 034 ↔ AI-CCDVF-008.

## Chi tiết
| Câu | Kỳ thi/Domain | Kết luận | Tiêu chí trượt | Lý do (1 dòng) / đã sửa gì | Nguồn |
|---|---|---|---|---|---|
| AI-CCARP-001 | CCAR-P D1 | PASS | — | Bài viết khuyên bắt đầu bằng gọi API trực tiếp và phải hiểu code bên dưới nếu dùng framework. Không trùng C255 (Claude trong LangGraph) hay X29 (framework không sửa lỗi mô tả tool, CCDV-F) | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCARP-002 | CCAR-P D1 | PASS | — | Sectioning: một instance trả lời, một instance sàng lọc, "tends to perform better" | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCARP-003 | CCAR-P D1 | PASS | — | Stopping condition (max iterations) và checkpoint chờ phản hồi người: đúng nguyên văn bài viết | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCARP-004 | CCAR-P D1 | PASS | — | Chạy bất đồng bộ thêm song song nhưng thêm thách thức "result coordination, state consistency, error propagation" | https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARP-005 | CCAR-P D1 | PASS | — | Doc: prompt chaining tường minh vẫn hữu ích để kiểm output trung gian; mẫu self-correction draft → review → refine, mỗi bước một lời gọi để log, chấm, rẽ nhánh | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-006 | CCAR-P D1 | PASS | — | "The best form of feedback is providing clearly defined rules for an output" (linting); LLM-as-judge kém bền, tốn độ trễ | https://claude.com/blog/building-agents-with-the-claude-agent-sdk |
| AI-CCARP-007 | CCAR-P D1 | FIX | g | Gần trùng X18 (CCDV-F D6): cùng đáp án memory tool, hai distractor gần như giống hệt (compaction, prompt caching). Viết lại distractor "Prompt caching with a long TTL…" thành "Session transcripts uploaded through the Files API…" (file nằm trong storage Anthropic, phạm vi workspace chứ không theo khách), để câu kiểm góc kiểm soát dữ liệu thay vì chỉ "nhớ qua phiên"; cập nhật giải thích và nguồn. Đáp án giữ nguyên | https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool ; https://platform.claude.com/docs/en/build-with-claude/files |
| AI-CCARP-008 | CCAR-P D1 | PASS | — | Nguyên tắc minh bạch; Claude Code hiện kế hoạch dạng checklist thời gian thực, người dùng can thiệp được bất cứ lúc nào | https://www.anthropic.com/engineering/building-effective-agents ; https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents |
| AI-CCARP-009 | CCAR-P D2 | PASS | — | "Right altitude": giữa logic giòn hard-code và hướng dẫn mơ hồ | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| AI-CCARP-010 | CCAR-P D2 | PASS | — | Không nhồi "laundry list" edge case; chọn ví dụ "diverse, canonical"; doc prompting: 3–5 ví dụ, thẻ `<example>` | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents ; https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-011 | CCAR-P D2 (bỏ CCDV-F D6) | FIX | g | Nội dung đúng (tài liệu dài ở trên, câu hỏi ở cuối, tới 30%). Trong pool CCDV-F đã có F59 và F13 cùng quyết định và cùng đáp án, nên bỏ mapping `CCDV-F: D6` và giữ câu cho CCAR-P (pool CCAR-P chưa có câu này) | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-012 | CCAR-P D2, CCDV-F D6 | PASS | — | "Tell Claude what to do instead of what not to do"; "smoothly flowing prose paragraphs"; bỏ markdown khỏi prompt giúp giảm markdown ở output. AI-CCAOF-002 cùng ý nhưng thuộc CCAO-F | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-013 | CCAR-P D2, CCAR-F D5 | PASS | — | Doc agent loop gần như nguyên văn: "Persistent rules belong in CLAUDE.md (loaded via settingSources)… because CLAUDE.md content is re-injected on every request" | https://code.claude.com/docs/en/agent-sdk/agent-loop |
| AI-CCARP-014 | CCAR-P D2 | PASS | — (cảnh báo g chéo pack) | Doc: harness tự compact thì nói rõ trong prompt, nếu không Claude có thể tự kết thúc sớm; khớp prompt mẫu. Trùng gần nguyên văn AI-CCDVF-015 (pack khác, CCDV-F/CCAR-F) | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-015 | CCAR-P D2 | PASS | — | Doc "Watch for overuse": spawn subagent khi grep là đủ; prompt mẫu "Use subagents when… For simple tasks… single-file edits… work directly". Stem không nêu tên model nên không phụ thuộc phiên bản | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-016 | CCAR-P D3 (bỏ CCDV-F D8) | FIX | e, g | Đáp án đúng (Limitations: chỉ tool calls; server phải công khai qua HTTP; stdio cục bộ không kết nối trực tiếp; có Client-side MCP helpers). Đáp án cũ dựa vào giới hạn "only tools" của bản beta (có thể đổi), nên viết lại thành "…since the connector cannot reach a local stdio server" (nguyên lý ổn định) và sửa giải thích tương ứng. Bỏ mapping CCDV-F D8 vì trùng X28 (server nội bộ có tools + resources, đáp án tự viết MCP client) | https://platform.claude.com/docs/en/agents-and-tools/mcp-connector |
| AI-CCARP-017 | CCAR-P D3 | PASS | — | Session hijacking: MUST verify all inbound requests, MUST NOT dùng session để xác thực, khoá `<user_id>:<session_id>` | https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices (chuyển hướng tới bản 2025-11-25) |
| AI-CCARP-018 | CCAR-P D3 | FIX | e | Nội dung đúng (scope minimization, common mistakes). URL nguồn bản 2025-06-18 nay chuyển hướng sang bản 2025-11-25, nên đổi sang URL 2025-11-25 cho đúng phiên bản chứa nội dung được trích | https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices |
| AI-CCARP-019 | CCAR-P D3 | FIX | e | Đúng (MUST hiện đủ lệnh, không cắt bớt, xin chấp thuận; SHOULD sandbox quyền tối thiểu). Đổi URL nguồn sang 2025-11-25 như câu 018 | https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices |
| AI-CCARP-020 | CCAR-P D3 | FIX | e | Đúng (SSRF: HTTPS, chặn private/link-local, egress proxy, tránh tự viết kiểm tra IP vì octal/hex/IPv6). Đổi URL nguồn sang 2025-11-25 | https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices |
| AI-CCARP-021 | CCAR-P D3, CCAR-F D2 | PASS | — | Namespacing theo dịch vụ (`asana_search`, `jira_search`); mô tả như cho nhân viên mới | https://www.anthropic.com/engineering/writing-tools-for-agents |
| AI-CCARP-022 | CCAR-P D3, CCAR-F D2 | PASS | — | Ví dụ `get_customer_context` gom thông tin gần đây một lần | https://www.anthropic.com/engineering/writing-tools-for-agents |
| AI-CCARP-023 | CCAR-P D3 | PASS | — | "Start with agentic search, and only add semantic search if you need faster results or more variations"; semantic kém chính xác, khó bảo trì, kém minh bạch | https://claude.com/blog/building-agents-with-the-claude-agent-sdk |
| AI-CCARP-024 | CCAR-P D3, CCAR-F D2 | PASS | — | Poka-yoke: đổi tool để luôn yêu cầu đường dẫn tuyệt đối | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCARP-025 | CCAR-P D4 | PASS | — | Develop tests: "More questions with slightly lower signal automated grading is better than fewer questions with high-quality human hand-graded evals" | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests ; https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| AI-CCARP-026 | CCAR-P D4, CCDV-F D4 | PASS | — | "Grade what the agent produced, not the path it took"; end-state evaluation | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents ; https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARP-027 | CCAR-P D4 | PASS | — | Bộ bài cân bằng; ví dụ agent "searches for almost everything" | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| AI-CCARP-028 | CCAR-P D4 | PASS | — | Mỗi trial cô lập, môi trường sạch; ví dụ đọc git history của trial trước | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| AI-CCARP-029 | CCAR-P D4 | PASS | — | Eval saturation; capability eval có điểm cao "graduate" thành regression suite | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| AI-CCARP-030 | CCAR-P D4 | PASS | — | Hai chuyên gia độc lập cùng kết luận; reference solution chứng minh task giải được và grader cấu hình đúng | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| AI-CCARP-031 | CCAR-P D4 | PASS | — | "We relied on held-out test sets to ensure we did not overfit" | https://www.anthropic.com/engineering/writing-tools-for-agents |
| AI-CCARP-032 | CCAR-P D5 | PASS | — | Thử giám sát trước (sàng lọc output, hậu xử lý); tránh chi tiết độc quyền không cần thiết | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak |
| AI-CCARP-033 | CCAR-P D5 | PASS | — | "Respond to repeat offenders": báo vi phạm chính sách, cân nhắc throttle hoặc ban | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks |
| AI-CCARP-034 | CCAR-P D5 | PASS | — (cảnh báo g chéo pack) | "The agent must never pay: Give it a tool that requests or queues a payment for a person to release, and no tool that can move money". Trùng đáp án với AI-CCDVF-008 (pack khác, CCDV-F/CCAR-F) | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-035 | CCAR-P D5 | PASS | — | Ví dụ "delete what it considers duplicates"; khuyến khích hành động cục bộ đảo ngược được, hỏi trước hành động phá huỷ hoặc ảnh hưởng hệ thống dùng chung | https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents ; https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| AI-CCARP-036 | CCAR-P D5, CCDV-F D7 | PASS | — | "Screen tool outputs before Claude acts on them" bằng lời gọi phân loại nhỏ có structured output; "Don't put your own instructions in tool results" | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks |
| AI-CCARP-037 | CCAR-P D6 | PASS | — | Rainbow deployment chuyển dần traffic, không làm gián đoạn agent đang chạy | https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARP-038 | CCAR-P D6 | PASS | — | Doc: ngày trên trang áp dụng cho nền tảng do Anthropic vận hành; Amazon Bedrock và Google Cloud (Google managed) tự đặt lịch retire, cần xem bảng model của nền tảng đó. Nguyên lý ổn định, không gắn ngày cụ thể | https://platform.claude.com/docs/en/about-claude/model-deprecations |
| AI-CCARP-039 | CCAR-P D6 | PASS | — | Mục "Auditing model usage": Console Usage → Export → CSV theo API key và model | https://platform.claude.com/docs/en/about-claude/model-deprecations |
| AI-CCARP-040 | CCAR-P D6 | PASS | — | Ví dụ "good" nhiều chiều: F1 ≥ 0,85, 10.000 bài, 99,5% non-toxic, 95% < 200 ms | https://platform.claude.com/docs/en/test-and-evaluate/define-success |
| AI-CCARP-041 | CCAR-P D6 | PASS | — | Theo dõi "decision patterns and interaction structures" mà không giám sát nội dung từng hội thoại | https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARP-042 | CCAR-P D6 | PASS | — | Agent khoảng 4×, multi-agent khoảng 15× token so với chat; chỉ đáng với task giá trị cao | https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARP-043 | CCAR-P D6 | PASS | — | Định nghĩa Active / Legacy / Deprecated / Retired và báo trước ít nhất 60 ngày khớp doc | https://platform.claude.com/docs/en/about-claude/model-deprecations |
| AI-CCARP-044 | CCAR-P D6 | PASS | — | Workflow cho tính dự đoán được với task rõ; agent tốn chi phí cao hơn, lỗi cộng dồn | https://www.anthropic.com/engineering/building-effective-agents |
| AI-CCARP-045 | CCAR-P D7, CCAR-F D3 | PASS | — | Non-root `remoteUser` (CLI từ chối cờ khi chạy root) và giới hạn egress; tránh mount `~/.ssh` hay file credential cloud | https://code.claude.com/docs/en/devcontainer |
| AI-CCARF-001 | CCAR-F D1 S3, CCDV-F D1 | PASS | — | Bảng "What subagents inherit": subagent không nhận system prompt của parent | https://code.claude.com/docs/en/agent-sdk/subagents |
| AI-CCARF-002 | CCAR-F D1 S4, CCDV-F D1 | PASS | — | "The budget cap covers subagents… spawning another subagent fails with Budget limit reached"; "Setting a budget is a good default for production agents" | https://code.claude.com/docs/en/agent-sdk/agent-loop ; https://code.claude.com/docs/en/agent-sdk/subagents |
| AI-CCARF-003 | CCAR-F D1 S5, CCDV-F D1 | PASS | — | `result` chỉ có ở subtype `success`; mọi subtype có `session_id`; ví dụ "Resume with a higher limit" | https://code.claude.com/docs/en/agent-sdk/agent-loop |
| AI-CCARF-004 | CCAR-F D1 S5, CCDV-F D1 | PASS | — | Cảnh báo "`allowed_tools` does not constrain `bypassPermissions`… use `disallowed_tools`". Khác góc C267 (ẩn Bash bằng disallowed_tools) và DV15 (deny rule trong bypass) | https://code.claude.com/docs/en/agent-sdk/permissions |
| AI-CCARF-005 | CCAR-F D1 S1, CCDV-F D1 | PASS | — | "Auto-approved tools never reach canUseTool… use a PreToolUse hook, which runs for those calls too. A hook deny applies even in bypassPermissions" | https://code.claude.com/docs/en/agent-sdk/permissions |
| AI-CCARF-006 | CCAR-F D1 S3 | PASS | — | Subagent lưu kết quả ra hệ thống ngoài, trả "lightweight references", tránh "game of telephone". Khác đáp án L05 | https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARF-007 | CCAR-F D1 S3 | PASS | — | LeadResearcher lưu kế hoạch vào Memory, lấy lại khi gần giới hạn context | https://www.anthropic.com/engineering/multi-agent-research-system |
| AI-CCARF-008 | CCAR-F D1 S2 | PASS | — | Hai kiểu thất bại; initializer (init.sh, claude-progress.txt, commit đầu, feature list JSON `passes: false`); mỗi phiên làm một tính năng, test end-to-end; JSON ít bị ghi đè sai hơn Markdown | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents |
| AI-CCARF-009 | CCAR-F D2 S1, CCDV-F D8 | PASS | — | Tránh `uuid`, `mime_type`, URL ảnh; chuyển UUID thành định danh có nghĩa; enum `response_format` | https://www.anthropic.com/engineering/writing-tools-for-agents |
| AI-CCARF-010 | CCAR-F D4 S1, CCDV-F D6 | PASS | — (cảnh báo g chéo pack) | Ví dụ "NEVER use ellipses" → giải thích lý do text-to-speech. AI-CCAOF-001 (CCAO-F) cùng nguyên lý, khác bối cảnh | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |

## Cần người xem
Không có. Mọi trang trích dẫn đều mở được và nói đúng điều giải thích khẳng định.

## Rủi ro còn lại
- **Trùng chéo pack cùng ngày (pack `ai-20261118-ccaof-ccdvf` do người soát khác phụ trách, không sửa ở đây):**
  - AI-CCARP-014 ↔ AI-CCDVF-015: gần như cùng stem và cùng đáp án (báo cho agent biết context sẽ được compact tự động).
  - AI-CCARP-034 ↔ AI-CCDVF-008: cùng đáp án (tool xếp hàng thanh toán, không có tool chuyển tiền).
  - AI-CCARF-010 ↔ AI-CCAOF-001: cùng nguyên lý (giải thích lý do cho TTS).

  Hai câu trong mỗi cặp hiện nằm ở pool kỳ thi khác nhau, nên tôi giữ câu bên này. Nếu sau này một câu được gắn thêm kỳ thi của câu kia, cần retire một câu. Đề nghị người soát pack kia **không** gắn thêm CCAR-P cho các câu đó.
- **Nội dung dễ lỗi thời:**
  - CCARP-016: giới hạn "chỉ tool calls" của MCP connector đang beta, header là `mcp-client-2026-09-15`. Câu đã được viết lại để dựa vào giới hạn ổn định là "remote-only, stdio không kết nối được".
  - CCARF-002: việc trần ngân sách tính cả subagent cần Claude Code v2.1.217 trở lên.
  - CCARP-014 và 015: hành vi "context awareness" và "dùng subagent quá mức" trong doc gắn với một số model cụ thể. Stem không nêu tên model nên vẫn đúng, nhưng doc có thể chuyển hướng dẫn sang trang theo từng model.
  - CCARP-038: danh sách nền tảng do đối tác vận hành (Bedrock, Google managed) có thể đổi.
- **Phạm vi CCAR-F:** CCARF-002 (trần chi phí) chạm vùng "billing, tính giá" mà guide CCAR-F xếp ngoài đề. Câu hỏi về option `max_budget_usd` của vòng lặp agent, không phải về quản lý billing, nên giữ mapping. Nếu muốn chặt hơn, có thể chỉ để CCDV-F D1. CCARP-045 (dev container) tương tự với mục "container" ngoài đề của CCAR-F D3, nhưng trọng tâm là cấu hình Claude Code nên vẫn giữ.
- **Nguồn MCP:** URL spec `2025-06-18/basic/security_best_practices` nay chuyển hướng sang bản 2025-11-25. Câu 017 vẫn để URL cũ vì mục session hijacking có ở cả hai bản. Câu 018–020 đã đổi sang URL 2025-11-25.
- **Mẫu lỗi của người sinh câu:**
  1. Gắn thêm kỳ thi phụ (CCDV-F) mà không grep trùng trong pool kỳ thi đó (011, 016).
  2. Dùng lại distractor của câu ccx có sẵn (007).
  3. Đáp án dựa vào giới hạn của tính năng beta (016).

  Chất lượng tổng thể cao: đáp án và giải thích bám sát nguyên văn tài liệu, distractor không lộ, độ dài các phương án cân bằng.

## Để lượt sau
Không còn câu nào trong phạm vi. Cả 55 câu đã có `reviewed: 2026-11-18`. `node claude-cert/scripts/validate.ts` cho kết quả ĐẠT: 0 lỗi; 10 cảnh báo, đều ở `ccx.yaml` và `official.yaml`, không có cảnh báo nào ở pack này.
