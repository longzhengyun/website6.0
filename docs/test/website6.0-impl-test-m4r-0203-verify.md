# website6.0 — BUG-M4R-02/03 线上独立复验报告（批次 M4R-0203-verify-20261023-01）

复验人：测试（QA）｜日期：2026-10-23｜对象：线上 https://longzhengyun.github.io/website6.0/（deploy run 39941469030，含 5b44c64=M4R-03、38eab9d=M4R-02；38fa315=M4R-01 未上线不在本轮判定）
口径：seq=360「未部署不判修复」反推——已部署即触发复验；独立探针（自有 CDP 脚本），不复用前端 .m4tools/m4rcheck。

## 0. 代际核验（前置证据）
- 缓存绕过抓取 index（`?qa=0203`，HTTP 200，13702B）引用新 CSS `_astro/about.C42_XXv7.css`（HTTP 200，22508B）；含 `.tagline-line{overflow-wrap:anywhere}`（5b44c64）与 `main a.arrow-link:not(.tab-item){text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}`（38eab9d）两标记。
- 注记：CDN 边缘缓存内旧 index HTML（age≤600s）仍引用已删除的 `about.CCnuZNVW.css`（404），属 Pages 正常缓存轮换窗口，非部署撕裂；缓存击穿后一致。记观察项 OBS-CACHE-01，不阻塞。

## 1. 断言结果：21/21 PASS（fails=0）
原始日志：E:\Jary\qa-outputs\website6.0\M4R-0203-verify-20261023-01\evidence\website6.0-m4r-0203-browser.txt
脚本：同目录 m4r-0203-verify.js（node --check PARSE-OK，确定性可重放）；池复现集 JSON：website6.0-m4r0203-pool-zoom.json

### BUG-M4R-03（tagline @200% 裁切）— 关闭
- M4R03-pool12：池 12 条内联，lim=375。
- M4R03-zoom200-all：逐条强制注入 @200%，12/12 max right=355≤375（原缺陷条目 right=399~426 全部转为换行内收）。
- M4R03-zoom200-page：整页 @200% sw=375=cw，离屏 leaf=0（sh=1137 为换行增高，预期允许，非裁切）。

### BUG-M4R-02（链接 1.4.1 非色彩提示）— 关闭
- UL-main-index/about：main 内 a.arrow-link 全部 text-decoration=underline（1+1），无遗漏。
- UL-scope-index/about/news：main 外 arrow-link（品牌位）0 误加。
- UL-newscard 实测复核：/news 93 卡为整卡 `<a class="news-card">`（非 arrow-link，td=none），标题 `.zh-title.arrow-link` 为非锚点元素；整卡独立链接非"文本块内链接"，axe link-in-text-block=0 佐证豁免成立，无贯穿下划线。
- AXE-litb 四组合（375/1280 × index/news）：link-in-text-block 违例节点=0。

### 回归（全绿）
- OVF-375/390/430 × index/news：sw=cw、溢出 leaf=0（6/6）。
- S1-desktop/mobile：1280×720 sh=720、375×667 sh=667（单屏双视口保持）。
- R16-reload8：6 种副标题；CLS-reload8 最大 0.0000<0.05；CLS-tagline-zero：8 轮 0 帧无 tagline 贡献。
- D02-net：48 请求白名单外=0。

## 2. 观察项（不阻塞）
- OBS-UL-pulse：index 动态条内 1 条 arrow-link 落在 main 被规则命中加下划线（td=underline），是否符合设计意图交设计走查（design-spec v1.1 §9 涉事点相邻区域）。
- OBS-AXE-cc：/news color-contrast serious 6（375）/7（1280）节点仍在——见 §2A，已升级为缺陷判定 BUG-M4R-04。
- OBS-CACHE-01：见 §0 边缘缓存窗口。

## 2A. 新缺陷 BUG-M4R-04(A)：.scroll-rise scroll-driven 静止低透明度 → /news 真实对比度违例
**代际更正**：本批实测时线上已是 38fa315 代际（seq=380 叠推完成，C42_XXv7.css 含 #6a6e76/#7b8394、#8B9098 零命中——我抓取文件 grep 实证），即本批同时构成 M4R-01 色值上线后的首轮线上 axe 扫描。
**现象**：axe color-contrast 于 /news 静止态报 serious 6（375）/7（1280），全部命中 `.scroll-rise[data-tags=ai]` 首屏部分入视卡片（h2 标题 1.81:1、row-num/日期/来源/#标签/点击查看原文 1.42~3.83:1）；/index 双视口=0；滚动全页后回顶复扫仍同样 6/7（稳定复现）；reduced-motion 下=0。
**根因（线上 CSS 实锤）**：`.scroll-rise{animation:rise .25s both}` + `animation-timeline:view();animation-range:cover 0% cover 35%`——opacity 绑滚动位置而非时间，卡片停在视口底缘（cover<35%）即静止在低透明度（取证帧：nc1=1.0 finished / nc2=0.86 / nc3=0.27 / nc10=0，evidence/website6.0-m4r-scrollrise-forensics.json）。引入时点=ce044ee（M1 动效设计），此前被色值违例噪声掩盖，38fa315 修色后裸露；复验批 axe 明细 33 个 scroll-rise 节点即同源（evidence/website6.0-m4-axe-detail.json）。
**影响与判定**：WCAG 1.4.3 在任意滚动静止位的"底缘带"卡片必读文本（标题/日期/来源）对比度不达标，未滚动收敛不自愈；reduced-motion 有 animation:none 兜底、完全入屏后达标 → 定级 A（非 S：影响限于部分入视带、可滚动自愈；非 B：承载必读信息）。AC-G04/AA 条款在 /news 记 fail 挂本缺陷号。
**修复方向建议（不代前端实现）**：三选一供设计裁定——① IO 触发一次性时间动画（静止即收敛终态）② animation-range 收敛+起始 opacity 地板值抬高至叠加后仍 ≥4.5 ③ 底缘带降级为纯 transform 不动 opacity。owner=前端实施、设计裁定动效语义，devops 随批三叠推。


## 3. 结论
1. BUG-M4R-02 与 BUG-M4R-03 **线上独立复验通过，关闭**。
2. 本批实际运行于 38fa315 代际：色值类违例在 /index 已清零、/news 仅剩 opacity 帧违例 → **新判 BUG-M4R-04(A)**，/news AC-G04 条款维持 fail 挂新号。
3. M4 出口批剩余面：① contrast-measure 全样本复跑+② axe 四组合零 critical/serious（待 BUG-M4R-04 修复与批三上线后一次执行）+ AC-R15/16 出口判定 + news-perf 检查点（待 NEWS_SYNC_PAT 回写）+ AC-R17 挂账，同批不拆轮。

