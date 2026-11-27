---
nguon: https://anthropic.cloudexam.pro/kien-thuc/ccar-f/2-5-tool-co-san-claude-code
ngay_tai: 2026-11-27
tieu_de: Dùng đúng tool có sẵn Read, Write, Edit, Bash, Grep, Glob
---

Domain 2: Tool Design & MCP Integration · Task 2.5

# Dùng đúng tool có sẵn Read, Write, Edit, Bash, Grep, Glob

Grep tìm trong nội dung, Glob tìm theo tên file, Edit sửa đúng một chỗ, Read cùng Write khi Edit không bám được, và cách tìm hiểu codebase từng bước.

- 15 phút đọc
- Đối chiếu docs 22/11/2026
- 2 nguồn

## Đọc xong bạn nắm được

- Chọn Grep để tìm trong nội dung file, Glob để tìm file theo mẫu tên
- Dùng Read và Write cho cả file, Edit cho một chỗ sửa có chuỗi khớp duy nhất
- Chuyển sang Read rồi Write khi Edit không tìm được chuỗi khớp duy nhất
- Tìm hiểu codebase từng bước, từ điểm vào lần theo import
- Lần theo một hàm qua các module đổi tên khi export lại

Claude Code có sẵn một bộ tool dựng sẵn (**built-in tools**) để làm việc với code: Read, Write, Edit, Bash, Grep và Glob. Chọn đúng tool thì Claude tìm ra thứ cần tìm nhanh hơn và sửa file ít sai hơn. Claude cũng không phải nhồi vào context, tức phần nội dung Claude đang giữ suốt session, những file chẳng liên quan. Chọn sai thì Claude đọc thừa hàng nghìn dòng, hoặc sửa nhầm chỗ.

Bài này kể lần lượt việc của từng tool, cách xử lý khi Edit không sửa được, cách tìm hiểu một codebase lớn mà không phải đọc hết mọi file, và cách tìm đủ chỗ gọi một hàm đã bị đổi tên khi export lại.

**Sơ đồ: Mỗi việc một tool: Grep, Glob để tìm; Read, Edit, Write để đọc và sửa; Bash để chạy lệnh**
_Bản đồ bài: nhóm tìm có Grep tìm trong nội dung file và Glob tìm theo mẫu tên file, tìm chỗ import một package vẫn là việc của Grep; nhóm đọc và sửa có Read đọc cả file, Write ghi cả file, Edit cần old_string duy nhất, không duy nhất thì chuyển sang Read rồi Write; nhóm chạy lệnh có Bash cho test, build, git, không dùng cat thay Read hay find thay Glob; tìm hiểu codebase bằng Grep tìm điểm vào, Read các file đó, lần theo import; lần theo hàm đổi tên bằng cách đọc thư viện và wrapper, liệt kê mọi tên, Grep từng tên_

- **TÌM**
- **Grep**: trong nội dung file
- **Glob**: theo mẫu tên file
- tìm chỗ import một package:
- vẫn là việc của Grep
- **ĐỌC VÀ SỬA**
- **Read**: đọc cả file
- **Write**: ghi cả file
- **Edit**: đoạn cần thay phải duy nhất
- không duy nhất
- **Read rồi Write**: tự chèn đúng chỗ trên cả file
- **CHẠY LỆNH**
- **Bash**: test, build, git
- việc có tool riêng thì
- không chạy qua Bash:
- cat → Read
- find → Glob
- **TÌM HIỂU CODEBASE**
- 1. Grep tìm điểm vào (entry point)
- 2. Read đúng các file đó
- 3. lần theo import, lời gọi hàm
- **LẦN THEO HÀM ĐỔI TÊN**
- 1. Read thư viện và wrapper
- 2. liệt kê mọi tên được export
- 3. Grep từng tên, có tên mới thì lặp

## Ví dụ xuyên suốt: dev mới ở một công ty phần mềm kế toán

Một công ty ở Cần Thơ làm phần mềm kế toán cho hộ kinh doanh: ghi sổ bán hàng, xuất hoá đơn điện tử và tính thuế theo quý. Codebase viết bằng TypeScript, là một monorepo khoảng 900 file chia thành 12 service, có phần giao diện viết bằng React, vài thư viện dùng chung tên `@congty/...`, một lớp cache, và vài job chạy ban đêm. Thuận, một dev mới vào tuần trước, dùng Claude Code trên máy Windows để làm quen với codebase và nhận những việc đầu tiên.

## Sáu tool và việc của từng tool

Ngày đầu, Thuận nhờ Claude tìm xem lỗi `HOA_DON_LECH: tổng tiền dòng không khớp tổng hoá đơn` trong log production do service nào sinh ra. Claude chọn Grep, tìm đúng chuỗi `HOA_DON_LECH` trên toàn repo, và thấy nó nằm trong một câu lệnh `throw` ở service xuất hoá đơn. Claude Read file đó để hiểu lỗi được ném ra trong trường hợp nào. Chuỗi lỗi thường nằm nguyên văn trong code, nên tìm theo nội dung (**content search**) là cách nhanh nhất. Tìm các file import module xử lý lỗi, dùng Glob tìm trong thư mục `errors/`, hay đọc README rồi đọc dần từng service thì chậm hơn nhiều. Chuỗi `HOA_DON_LECH` lại nằm ở service xuất hoá đơn chứ không ở thư mục `errors/` nào.

Việc thứ hai là liệt kê mọi file test React để biết test nằm ở đâu. Tên file test trong codebase không thống nhất: có file `.test.tsx`, có file `.spec.tsx`, và vài file cũ chỉ kết thúc bằng `Test.tsx`. Lần này Claude dùng Glob với ba mẫu `**/*.test.tsx`, `**/*.spec.tsx` và `**/*Test.tsx`. Glob tìm file theo mẫu đường dẫn (**file path pattern matching**) và trả về danh sách đường dẫn, không cần mở file nào.

Hai việc này cho thấy Grep và Glob là cặp tool hay bị nhầm nhất. Bảng sau tóm tắt việc của cả sáu tool:

| Tool | Làm gì | Dùng khi |
| --- | --- | --- |
| Grep | Tìm mẫu chữ trong nội dung file | Tìm chỗ gọi một hàm, một thông báo lỗi, một câu lệnh `import` |
| Glob | Tìm file theo mẫu tên hay đuôi file | Tìm mọi file `*.test.tsx`, mọi file trong `src/**/` |
| Read | Đọc cả nội dung một file | Cần hiểu một file, xem cấu hình |
| Write | Tạo file mới, hoặc ghi đè cả file | Viết file mới, hay thay toàn bộ nội dung |
| Edit | Thay đúng một đoạn chữ bằng đoạn khác | Sửa một chỗ trong file, khi đoạn chữ cần thay chỉ có một |
| Bash | Chạy lệnh shell | Chạy test, build, git, cài package |

Read và Write làm việc với cả file (**full file operations**), còn Edit chỉ sửa đúng một chỗ (**targeted modifications**).

Một việc thường gặp là tìm mọi file import package `@congty/xac-thuc`. Nghe như việc của Glob, vì có chữ "xac-thuc" trong tên package. Nhưng câu `import ... from "@congty/xac-thuc"` nằm trong nội dung file, còn tên file thì có thể là bất kỳ gì. Đây là việc của Grep. Nếu dùng Glob tìm file có chữ "xac-thuc" trong tên, bạn chỉ nhận về các file của chính package đó, chứ không thấy các file đang dùng nó. Đọc `package.json` của từng service cũng không đủ, vì file đó chỉ khai báo dependency, không cho biết file nào thật sự import package.

Khi dùng Grep, bạn nên biết thêm hai điều. Grep trả kết quả theo một trong ba kiểu: chỉ danh sách file (mặc định), các dòng khớp kèm số dòng, hay số lần khớp ở mỗi file. Grep dùng cú pháp regex của ripgrep, nên các ký tự đặc biệt cần escape, ví dụ tìm `eval(` phải viết `eval\(`.

Còn Bash thì đừng dùng cho việc đã có tool riêng. Muốn xem `config.json`, Claude dùng Read chứ không chạy `cat config.json` qua Bash. Read trả nội dung kèm số dòng, và đọc được cả ảnh, PDF hay notebook. Dùng `cat` qua Bash thay cho Read là một cách làm sai về kiến trúc (**anti-pattern**) mà đề hay hỏi.

Có một chỗ đề thi và Claude Code hiện nay vênh nhau. Trên Windows, như máy của Thuận, Glob và Grep có sẵn. Nhưng trên macOS, Linux và WSL, Claude Code mặc định không bật hai tool này. Khi đó Claude tìm bằng lệnh `find` và `grep` qua Bash, và hai lệnh này thật ra gọi tới `bfs` và `ugrep`, hai công cụ tìm kiếm đóng gói sẵn trong Claude Code. Glob và Grep được bật lại khi Bash bị tắt, khi một subagent liệt kê chúng trong field `tools` mà không có Bash, hoặc khi bạn khai báo tool. Với `--tools`, bạn nhận đúng những tool bạn liệt kê, còn ghi một trong hai tên ở `--allowedTools` thì bật lại cả hai. Đề thi và câu luyện thi vẫn coi Grep, Glob là tool có sẵn và chấm theo đó, nên trong đề, `find` qua Bash vẫn là đáp án sai.

> **Trong đề chọn gì**
>
> Nếu tình huống trong đề là tìm theo nội dung, như tìm chỗ gọi `eval(`, mọi file import một package hay nơi sinh ra một thông báo lỗi, hãy chọn Grep. Glob với mẫu tên kiểu `/eval` chỉ tìm được file có chữ eval trong tên. Đọc file điểm vào rồi lần theo import để tìm `eval` thì chậm và dễ sót. Nếu đề cần danh sách file theo mẫu tên (mọi file `.test.tsx`, `.spec.tsx`, `Test.tsx`), hãy chọn Glob với đủ các mẫu. `find -name '*.test.tsx'` qua Bash chỉ phủ một mẫu và là chọn sai tool. Đọc cấu hình Jest để lấy `testMatch` thì vòng vo, còn Grep tìm `describe` thì sót file test chưa có `describe` và lẫn cả file không phải test. Dùng Bash chạy `find`, `ls -R | grep` hay `cat` cho những việc đã có tool riêng là chọn sai tool. Nếu đề hỏi cách đọc file cấu hình nào là anti-pattern, đáp án là `Bash("cat ...")`. Read là cách đúng, đưa đường dẫn cho một MCP resource đã duyệt cũng không sai, còn dùng Glob kiểm tra file có tồn tại trước khi đọc chỉ là thừa chứ không phải anti-pattern.

## Khi Edit không sửa được

Tuần thứ hai, Thuận nhờ Claude chèn một hàm `lamTronTienThue` vào giữa hai hàm có sẵn trong `tien-ich/so-tien.ts`, một file 150 dòng. File có nhiều hàm na ná nhau, hàm nào cũng có cùng một khối chú thích JSDoc ở đầu và cùng kiểu tham số. Edit báo lỗi vì đoạn chữ Claude định bám vào xuất hiện ở bốn chỗ.

Edit hoạt động bằng cách thay chính xác một chuỗi cũ (`old_string`) bằng chuỗi mới, không dùng regex hay so khớp gần đúng. Edit chỉ sửa được khi chuỗi cũ khớp đúng một chỗ trong file (**unique text matching**), tức đủ hai điều kiện sau:

1. `old_string` có trong file đúng như đã viết. Lệch một dấu cách hay một mức thụt lề là không khớp.
2. `old_string` xuất hiện đúng một lần. Nếu xuất hiện nhiều lần, Claude phải lấy thêm chữ xung quanh cho tới khi chỉ còn một chỗ khớp, hoặc đặt `replace_all: true` để thay tất cả.

Lấy thêm chữ xung quanh là bước thử đầu tiên hợp lý. Nhưng file này lặp lại nhiều tới mức muốn `old_string` chỉ khớp một chỗ thì Claude phải lấy kèm cả chục dòng. Chuỗi dài như vậy chỉ cần lệch một dấu cách là lại không khớp. `replace_all` thì càng sai, vì nó chèn hàm mới vào cả bốn chỗ.

Khi không có đoạn chữ nào đủ riêng để Edit bám vào, cách chắc nhất là thôi dùng Edit và chuyển sang cách dự phòng (**fallback**). Claude dùng Read đọc cả file, tự chèn hàm mới vào đúng chỗ trên cả file, rồi dùng Write ghi lại toàn bộ file. Write không nối thêm vào cuối file, cũng không trộn với nội dung cũ. Nó thay cả file bằng nội dung Claude đưa vào, nên hàm mới nằm đúng chỗ Claude đã đặt trên bản vừa đọc. Với nhiều model, Claude phải đọc file có sẵn rồi mới được ghi đè, và bước Read đầu tiên cũng lo luôn điều kiện này.

**Sơ đồ: Bốn chỗ cùng khối JSDoc: Edit báo lỗi, replace_all chèn cả bốn, Read rồi Write chèn đúng chỗ**
_File tien-ich/so-tien.ts dài 150 dòng có bốn hàm mở đầu bằng cùng một khối JSDoc và cùng kiểu tham số; cần chèn lamTronTienThue vào giữa hàm thứ hai và thứ ba. Edit bám vào khối JSDoc thì lỗi vì old_string khớp bốn chỗ; thêm chữ xung quanh thì phải kéo cả chục dòng, dễ lệch dấu cách; replace_all true chèn hàm mới vào cả bốn chỗ; Read cả file rồi Write thì Claude tự đặt hàm vào đúng một chỗ_

- **tien-ich/so-tien.ts**: 150 dòng
- 1. khối JSDoc giống hệt nhau
- hàm có sẵn, cùng kiểu tham số
- 2. khối JSDoc giống hệt nhau
- hàm có sẵn, cùng kiểu tham số
- 3. khối JSDoc giống hệt nhau
- hàm có sẵn, cùng kiểu tham số
- 4. khối JSDoc giống hệt nhau
- hàm có sẵn, cùng kiểu tham số
- **chèn lamTronTienThue vào đây**
- **CLAUDE THỬ**
- **Edit bám vào khối JSDoc**: lỗi: old_string khớp bốn chỗ
- **Edit, thêm chữ xung quanh**: phải kéo cả chục dòng, dễ lệch dấu cách
- **Edit, replace_all: true**: hàm mới bị chèn vào cả bốn chỗ
- **Read cả file, rồi Write**: Claude tự đặt hàm vào đúng một chỗ

> **Bẫy đề**
>
> Agent cần chèn một hàm vào giữa hai hàm trong một file có cấu trúc lặp lại nhiều, và Edit báo lỗi vì `old_string` không duy nhất. Cách chắc chắn nhất là gì? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Dùng `replace_all` nhắm vào một mẫu chung** (_replace_all with a shared pattern_). Nghe gọn vì chỉ một lệnh là xong. Nhưng mẫu chung xuất hiện ở nhiều chỗ, nên hàm mới bị chèn vào tất cả, rồi lại phải xoá các bản thừa.
> - **Dùng Edit với `old_string` dài hơn 30 dòng** (_a very long old_string_). Nghe như chuỗi dài thế thì chắc chỉ khớp một chỗ. Có điều chuỗi càng dài càng dễ lệch một dấu cách, và vẫn không chắc là duy nhất khi cả khối lặp lại.
> - **Dùng Bash nối hàm vào cuối file bằng heredoc** (_append with a heredoc_). Nghe dễ vì không cần khớp chuỗi nào. Ngặt nỗi hàm nằm ở cuối file chứ không ở đúng chỗ, mà việc cần làm là chèn vào giữa.
>
> **Chọn:** Read cả file, đặt hàm vào đúng chỗ, rồi Write lại file. Tình huống chèn một rule vào giữa một danh sách rule có thứ tự cũng giải theo cách này. Thêm một dòng chú thích làm mốc cho Edit bám vào thì cần thêm một lần Edit cũng phải tìm được chỗ bám duy nhất, lại để rác trong file. Tách rule sang một file nạp sau thì đổi luôn thứ tự rule, mà thứ tự lại quyết định kết quả.

## Tìm hiểu codebase từng bước

Thuận được giao sửa phần phân quyền. Hiện nhân viên thu ngân vẫn xem được báo cáo thuế, trong khi lẽ ra chỉ chủ hộ mới được xem. Phần xác thực và phân quyền trải trên nhiều service. Lần đầu, Claude định đọc mọi file có chữ "auth", "quyen" hay "token" trong tên hoặc nội dung, và danh sách lên tới hơn 70 file. Nếu đọc hết chừng đó file, context sẽ đầy trước khi Claude kịp hiểu luồng chạy.

Cách tốt hơn là tìm hiểu dần từng bước (**building codebase understanding incrementally**). Claude bắt đầu bằng Grep để tìm các điểm vào (**entry point**), tức những chỗ code phân quyền bắt đầu chạy: middleware kiểm tra token, hàm `kiemQuyen` và decorator `@canQuyen`. Claude đọc mấy file đó trước, rồi lần theo các câu `import` và lời gọi hàm sang file kế tiếp, mỗi bước chỉ mở đúng file cần mở. Sau khoảng mười file, Claude đã nắm được luồng chạy. Middleware đọc vai trò từ token, nhưng route báo cáo thuế chỉ kiểm tra người dùng đã đăng nhập hay chưa, chứ không kiểm tra vai trò.

**Sơ đồ: Đọc hết là mở hơn 70 file; đi từ điểm vào theo import thì khoảng mười file đã thấy lỗi**
_Hai cách tìm hiểu phần phân quyền. Cách đọc mọi file có chữ auth, quyen hay token trong tên hoặc nội dung: hơn 70 file, context đầy trước khi hiểu luồng chạy. Cách Grep tìm điểm vào middleware kiểm token, kiemQuyen, @canQuyen rồi lần theo import và lời gọi hàm: chỉ mở khoảng mười file, ba nhánh gặp nhau ở route báo cáo thuế, nơi chỉ kiểm đã đăng nhập mà không kiểm vai trò_

- **Đọc mọi file khớp từ khoá**: tên hay nội dung có auth, quyen, token
- **hơn 70 file**: context đầy trước khi hiểu luồng chạy
- **Grep điểm vào, lần theo import**: middleware
- kiemQuyen
- @canQuyen
- **khoảng mười file**: route báo cáo thuế không kiểm vai trò

Vài hôm sau, Thuận nhờ Claude thêm một chỗ xoá cache, và cách tìm hiểu từng bước lại có ích. Sau vài lần Grep, Claude thấy logic cache nằm rải ở 15 file, tổng khoảng 8.000 dòng. Thay vì đọc cả 15 file, Claude xem các import và cây kế thừa để tìm base class của cache, đọc file đó để nắm interface, rồi chỉ lần theo những class có implement việc xoá cache. Claude nắm khung chung trước, rồi mới đọc kỹ đúng những phần liên quan.

> **Trong đề chọn gì**
>
> Nếu đề hỏi cách tìm hiểu một hệ thống lớn (hàng trăm file, nhiều service) mà context không bị đầy, hãy chọn đáp án dùng Grep tìm điểm vào, đọc các file đó, rồi lần theo import và lời gọi hàm. Đọc mọi file chứa một từ khoá thì danh sách có thể lên tới hơn 70 file, và context đầy trước khi hiểu được luồng chạy. Đọc CLAUDE.md, README rồi nhờ người chỉ ra 10–15 file quan trọng thì phụ thuộc vào người, mà người mới cũng chưa biết file nào quan trọng. Chạy song song nhiều subagent, mỗi agent đọc một service, thì không agent nào thấy luồng chạy xuyên qua các service. Nếu logic đã khoanh lại còn khoảng 15 file, hãy chọn cách tìm base class qua import và cây kế thừa rồi lần theo các class implement cụ thể. Đọc hết 15 file thì tốn context. Chỉ đọc vài dòng quanh mỗi chỗ khớp "invalidate" thì thiếu ngữ cảnh. Dùng Glob theo tên file kiểu `cache.py` rồi đọc file lớn nhất trước thì dựa vào cách đặt tên, mà file lớn nhất chưa chắc là class gốc.

## Lần theo hàm được export lại dưới tên khác

Trước khi xoá hàm `tinhThueKhoan` trong thư viện `@congty/thue`, Thuận nhờ Claude liệt kê mọi chỗ còn gọi nó. Claude Grep theo đúng tên `tinhThueKhoan`, sửa hết các chỗ tìm được, và Thuận xoá hàm. Đêm đó hai job tính thuế quý bị lỗi. Chúng gọi hàm bằng hai tên khác: `tinhThueHoKinhDoanh` và `thueQuy`.

Kết quả của lần Grep đầu thật ra có chứa manh mối, nhưng Claude đã bỏ qua. Trong module `ho-kinh-doanh`, một dòng `export { tinhThueKhoan as tinhThueHoKinhDoanh } from "@congty/thue"` đặt cho hàm một tên mới (**exported names**). Trong module `bao-cao`, một dòng `const thueQuy = tinhThueKhoan` làm tương tự. Grep chỉ tìm đúng chuỗi bạn đưa cho nó. Nó không biết `tinhThueHoKinhDoanh` là cùng một hàm với `tinhThueKhoan`.

**Sơ đồ: Grep tên gốc thấy hai dòng đổi tên nhưng sót hai job; phải Grep tiếp từng tên mới**
- Grep tên gốc bỏ sót
- Grep tinhThueKhoan tìm thấy
- Grep tên mới
- @congty/thuetinhThueKhoan
- chỗ gọi bằngtên gốc
- ho-kinh-doanhexport … astinhThueHoKinhDoanh
- bao-caoconst thueQuy =tinhThueKhoan
- job tính thuế quýgọi tinhThueHoKinhDoanh
- job tính thuế quýgọi thueQuy

Cách lần theo chỗ dùng hàm (**tracing function usage**) cho đúng có hai bước. Trước hết, Claude đọc thư viện và các module bọc lại nó (**wrapper module**) để liệt kê mọi tên mà hàm này mang khi được export ra ngoài. Sau đó Claude Grep từng tên trên toàn codebase. Nếu gặp thêm dòng export lại hay phép gán nào, Claude thêm tên mới vào danh sách và Grep tiếp, cho tới khi không còn tên mới.

> **Bẫy đề**
>
> Các wrapper module export lại một hàm của thư viện lõi dưới những tên khác nhau, mỗi tên cho một nghiệp vụ. Bạn cần tìm mọi chỗ gọi hàm này trước khi xoá nó. Cách nào chắc chắn nhất? Ba đáp án sau nghe hợp lý nhưng sai:
>
> - **Grep tên gốc của hàm trên toàn codebase** (_grep the original name_). Nghe đủ vì đây là cách nhanh nhất. Nhưng chỗ gọi theo tên mới không chứa tên gốc, nên bị sót, đúng như hai job tính thuế quý của Thuận.
> - **Grep mọi file import thư viện hay wrapper, rồi đọc từng file** (_read every importing file_). Nghe như vét được hết. Có điều số file import có thể rất lớn, và đọc từng file vừa chậm vừa dễ bỏ qua một tên lạ. Mở hết mọi file trong vài thư mục rồi xem từng dòng cũng vậy.
> - **Tìm tên hàm trong tài liệu dự án** (_check the project documentation_). Nghe hợp lý vì tài liệu cho biết cách dùng dự kiến. Ngặt nỗi tài liệu, kể cả tài liệu API sinh tự động, không theo kịp code và không liệt kê chỗ gọi thật.
>
> **Chọn:** đọc thư viện và các wrapper để liệt kê mọi tên mà hàm được export ra, rồi Grep từng tên trên toàn codebase. Nếu đề kể rằng lần Grep đầu đã ra dòng export đổi tên hay phép gán nhưng agent bỏ qua, thì bước còn thiếu là Grep tiếp từng tên mới đó. Grep lại với `tên(` để các dòng import và phép gán biến khỏi kết quả là đi ngược lại, vì chính hai dòng đó chứa tên mới cần tìm.

> **Ý chính**
>
> Grep tìm trong nội dung file, còn Glob tìm theo tên file. Edit sửa một chỗ khi `old_string` chỉ khớp đúng một lần, nếu không thì Read cả file rồi Write lại. Tìm hiểu codebase bằng cách đi từ điểm vào và lần theo import, không đọc hết từ đầu. Muốn tìm hết chỗ gọi một hàm, hãy tìm hết các tên của nó trước.

## Nguồn

1. [Exam Guide CCAR-F, Task Statement 2.5](https://cc.sj-cdn.net/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1794946250/Claude_Certified_Architect_-_Foundations_Exam_Guide.pdf)
2. [Tools reference (Claude Code)](https://code.claude.com/docs/en/tools-reference)
