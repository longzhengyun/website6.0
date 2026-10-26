# website6.0 M4.1 线上预检（65a9880 · R15/R16 fail-fast，非出口判定）

作者：测试 ｜ 日期：2026-10-23 ｜ 对象：https://longzhengyun.github.io/website6.0/（deploy run 39938372998，链 4bf5fa2→3f11699→08b3d11→65a9880）
证据目录：E:\Jary\qa-outputs\website6.0\M4.1-preflight-20261023-01\evidence\（m41-preflight.js + website6.0-m41-preflight.txt、tagline-zoom-forensics/deterministic/100check 三探针+JSON、375 截图、live-index-65a9880.html）

## 结果：18 PASS / 1 FAIL

■ R15 全绿：1280×720 scrollHeight=720（≤792）、375×667=667（≤733.7）、动态条高 58px（≤64）单行两项、移动首页 [data-home-pulse] 整块移出 DOM（非隐藏，main 内新闻链接=0）、reduced-motion 下仍单屏、导航 CLS=0.0081<0.05 且无 tagline 贡献。
■ R16 全绿部分：reload×8 得 6 种副标题（≥3）、池 12 条内联 JSON 最长 18 码点（≤20）、reload×8 共 48 请求白名单外零外部。
■ 溢出回归全绿：375/390/430 × index/news sw==cw 零离屏（BUG-M4-01 类无回归）。

## 新缺陷 BUG-M4R-03（A）— tagline 200% 文字缩放裁切离屏
- **复现（确定性）**：375 视口 → `documentElement.style.fontSize='200%'` → `#tagline-text.textContent="今天也在追最新的 Chrome 版本"`（池内最长档 18 全角字）→ 文本 right=**426**>375；14 字段语 right=399 亦越界。12 条池中 ≥14 字段语占多数（18/16/18/16/15/14…），随机抽中即内容丢失。
- **对照**：@100% 同字段语 right=223 不破版；页面级 scrollWidth=375（nowrap 固定行盒把溢出文本裁在视口外，用户无法横滚找回）。
- **违反**：AC-R16-05「最长条目在 375px 与 200% 缩放下不破版」+ M-A5/WCAG 1.4.4。根因=`.tagline-line`/`#tagline-text` white-space:nowrap 单行行盒无缩放自适应回退。
- **修复方向建议（owner 前端，方案自定）**：预留两行行盒换行（CLS 仍可为 0），或高缩放/窄视口媒体查询降字号。返工量小。

## 挂账
- AC-R15-04 元素守恒：静态核对留出口批次（首页节点清单已截屏存证）。
- AC-R17-04 空态：线上现 36 条英文数据不触发空态分支；出口批次随 93 条 zh feed 回写后按 mock/构造口径验。
- 出口判定不变：AC-R15/R16 正式判定与 BUG-M4R-01/02/03 修复复验 + PAT 回写 + news-perf 检查点同批跑，不拆轮。本预检意义=BUG-M4R-03 在出口批次前暴露，可与对比度修复合并一批处理。
