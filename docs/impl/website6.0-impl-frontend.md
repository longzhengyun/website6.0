# website6.0 前端实施汇报 M1+M2（前端）

日期：2026-10-23｜分支：`feat/website60-m1m2-20261023`（仓库 `E:\Jary\github\website6.0`，本地，未 push——远端仓库建好前按分派要求不推）

## 1. 提交序列（Step 制）

| Step | Commit | 内容 |
|---|---|---|
| M1 脚手架 | `6420324` | package.json（astro 5.18.2 / tailwindcss 4.3.3 / @tailwindcss/vite 4.3.3 / typescript 5.9.3 / @astrojs/check 0.9.12 / vite 8.3.5 / @fontsource-variable geist+geist-mono 5.3.0）、`.nvmrc`=24.19.0、tsconfig extends astro strict、astro.config（base=/website6.0/、output=static）、.gitignore |
| M2-1 token | `ce044ee` | `src/styles/theme.css`：spec §2 全部色彩/字体/断点/版心/tab 条 token 直转 Tailwind 4 `@theme`；`global.css`：A1-A6 动效 + 打印规则 |
| M2-2 数据 | `cea51eb` | `src/data/`：site/news/about/resume 类型化数据；news.json 按 devops 约定路径落 `src/data/news.json`，schema `{version,mode,generatedAt,items[{id,title,summary,url,source,publishedAt,tags[]}]}`，`mode:"seed"` 标记，M3 直接覆盖 |
| M2-3 布局 | `30eb4c0` | BaseLayout（ClientRouter 转场、跳主区链接、viewport-fit=cover）、SiteHeader、TabBar（M 端底部 56px+安全区）、SiteFooter（简历暗线）、CommandPalette（⌘K，vanilla ~110 行） |
| M2-4 页面 | `b36790c` | 四 P0 页 + favicon(j8 黑底反白) + robots |

## 2. 验收红线自检（本机实测证据）

- `astro check`：**0 errors / 0 warnings**（TypeScript 5.9.3 strict）
- `astro build`：**4 pages built，1.63s，Complete**（Node 24.19.0 = .nvmrc 基准）
- preview 冒烟（localhost:4322）：`/ /news/ /about/ /resume/ favicon` 全 **200**；首页含文案「把浏览器能做的，做到最新。」；**主导航内「简历」字样出现 0 次**（红线通过，入口仅在页脚/About 内链/⌘K/返回链）；Resume 顶栏 `← jary8` 在位
- 首屏 JS：外链 chunk 仅 ClientRouter 15.4KB（gzip 5.3KB）+ 页内联增强脚本 <5KB ≪ 150KB 预算；字体自托管 latin woff2 29.4KB（浏览器按 unicode-range 只下载 latin 子集）
- 动效全 CSS：A1 呼吸（桌面 wght 400↔640 14s，M 端透明度微幅，reduced-motion 停 wght 500）；A2 `animation-timeline: view()` 带 `@supports` 降级；A6 书脊 `scroll(root)`；A5 面板 180ms 曲线；A3 根淡入 200ms

## 3. 设计 spec 符合性与决策答复

- **开放项①（Geist 托管）前端决定：自托管**。经 `@fontsource-variable/geist(-mono)` 构建期拷贝 woff2 入 dist，无运行时 CDN 依赖，Pages 可控且可过密钥 grep 门禁；运行时仅 latin 子集（≈45KB 两族合计）。
- L1 双语叠印：桌面 `jary8·佳瑞网`（· 用 accent），移动两行制（佳瑞网静态粗体 + jary8 mono 域名式下划线），按 §3 执行。
- 身份文案用产品 C1；断点按 spec 425/768/1200（覆盖 Tailwind 默认）；radius 0、无阴影、accent 每屏克制（正文小字禁朱红，链接靠下划线双通道）。
- 触控条款 §6：tab 条/胶囊/返回链均 ≥44px，胶囊 gap 12px、横滚渐隐遮罩、`hover:none` 下无 hover 依赖信息、输入 16px。
- About 的「问站长」按 §4.3 渲染为 mono 虚线实验位装饰行（明确标注 P1 建设中，非 mock 交互）。
- Resume 打印：`@media print` 强制白底黑字、隐藏导航/动效/示例横幅、`break-inside: avoid`；横幅注明示例数据、屏幕打印两便。

## 4. 渐进增强矩阵（无 JS 时）

核心内容 100% 可读；⌘K 面板/筛选胶囊/打印按钮隐藏（`html[data-enhanced]` 门控）；A2/A6 不支持时静态可见。News 标签筛选为 JS 增强（spec 只要求键盘可达 + 筛选态样式，无 JS 全量展示符合"任一失效核心可用"约束）。

## 5. 遗留与风险（不阻塞，供 M4 测试与后续处理）

1. **未做浏览器级交互/视觉走查**（⌘K 键盘流、tab 条实机、对比度实测、Lighthouse 数值）——属测试/设计走查职责，M4 覆盖；curl 级证据已列上。
2. astro preview 下无尾斜杠 `/news` 返回状态 quirky（带斜杠/真实 Pages 目录结构均正常）；GitHub Pages 对 `news/index.html` 自动处理，判定非阻塞，M4 在路径地址实测确认。
3. 站主邮箱进入页脚/简历（spec §4.1 要求）——公开仓库即公开，如站主要撤可一行移除。
4. About/Resume 部分条目为**结构示例数据**（页面横幅明示），真实履历文案需站主/知识岗采集后仅替换 `src/data/*`。
5. M5 域名切换时 `astro.config.mjs` base 改 `'/'`（一行）+ 重新构建。
6. 本机 git 2.24（无 `init -b`），提交均在新分支 `feat/website60-m1m2-20261023`；`main` 保持未出生状态待建仓后定基线。
7. CI 指标门禁（Lighthouse/axe/预算）依赖开发运维 workflow 落 `.github/workflows/`（两 yml 已在我仓库目录待建仓后拷入即可）。

## 6. 下一步（等分派）

M3 新闻管线前端接入点已预留：news.json 路径/schema 对齐、`mode` 徽标、generatedAt 注入页脚。后端 schema 若有出入，改 `src/data/news.ts` 接口即可。

---

## 7. 批次一：设计交叉审查 B1/B2 修复（commit a9731b7，分支 feat/website60-m1m2-20261023）

**B1 accent 预算回收**
- `.arrow-link .arrow` 常态改 `var(--c-ink-muted)`（原 accent）；仅 `(hover:hover)` 下 `.arrow-link:hover`/`.news-card:hover` 与键盘 `.arrow-link:focus-visible`/`.news-card:focus-visible` 转 accent（global.css）
- `.rank-blocks` filled 块改 `var(--c-ink-muted)`；技能卡非可点元素，不加 hover-accent（避免伪交互暗示）
- about.astro 时间线 period：`text-accent` → `text-ink-faint`

**B2 内联链接命中区 ≥44px**（统一 `inline-flex items-center min-h-[44px]`，照 resume.astro:13-19 正例）
- SiteFooter.astro：在线简历 / GitHub / 邮箱三链接
- SiteHeader.astro：wordmark + 桌面导航两项（header h-14 内容纳 44px 目标，不撑破）
- about.astro：简历内链

**顺手处理的低项（单独标注，设计复看可只核 B1/B2）**
- L1：补 `.row-num{color:var(--c-ink-faint)}`（「编号随视口中心转 accent」列 P2，未实现）
- L2：`.scroll-rise` 在 `prefers-reduced-motion: reduce` 下 `animation:none`（直接可见）
- L3：A3 VT 转场 reduce 下 `::view-transition-old/new(root){animation:none}`（同帧替换）
- L4：`.palette-overlay` 补 120ms `overlay-in` 淡入，reduce 关闭
- L5：M 端 hero `max-md:min-h-[60vh]`；佳瑞网 `text-[2.25rem]!`；jary8 mono `text-[0.875rem]!`（`!` 必要：`.t-display/.t-label` 为非 layer 作者类，普通 utility 覆不过；两 span 均 `md:hidden`，桌面零影响）
- L6：空等级块 `·` → `□`（对齐 spec §4.3 `■■■■□`；aria-label 不变）
- L7：未改（与设计结论一致，接受现状）

**自验证据（2026-10-23 复跑）**
- `npx astro check`：Result (14 files) — 0 errors / 0 warnings / 0 hints
- `npx astro build`：4 page(s) built in 1.83s；首屏 JS 无变化 ClientRouter 15.36 kB（gzip 5.28 kB）
- dist 抽查：`about.DkFQ2URK.css` 内 `.arrow-link .arrow{...color:var(--c-ink-muted)}`、`.rank-blocks{...ink-muted}`、`.row-num{color:var(--c-ink-faint)}`、`overlay-in`/`view-transition` reduce 规则均命中；`index.html` `min-h-[44px]` 出现 6 处（wordmark+2 导航+3 页脚）、`text-[2.25rem]`/`text-[0.875rem]`/`min-h-[60vh]` 各 1；`about/index.html` `□` 8 处
- 提交序列：… → fa80c64 → a8d663a → **a9731b7**（5 files, +57/−20）；工作树干净；**未 push**（站主建仓门禁不变）

---

## 8. 批次二：M3 迁入包（commits d7e3780 → 51b4cd2 → 9a83c16 → ffde584）

**1. seed 重命名 + crosscheck §3 映射**（9a83c16）
- `src/data/news.json` → `src/data/news.seed.json`（契约外开发占位，news.ts 头注显式标注；管线首跑覆盖 news.json 后仅需切 import 一行退役）
- 字段全表迁移：version→schema_version(1)、generatedAt→generated_at、mode seed→**rss_only**（枚举仅 ai|rss_only）、id→fingerprint（按 pipeline §1-4 归一化现算 SHA-256 前 16 位）、title→title_zh+title_original 同值、summary→summary_zh（76–95 字符 ≤160）、source→source_name+source_id（web.dev→webdev、chrome docs→chrome-developers-blog，其余域名 slug）、publishedAt→published_at（补时刻恒 Z）、tags→7 值枚举映射（browser/webgpu/js→frontend、wasm/build/framework→tools、css→standards，≤3/条）、补 level:general + pipeline{rss_only,null,seed}；note 字段去除（schema additionalProperties:false）
- 迁移后 seed 结构即与契约同构（理论上可过 schema 校验），非豁免态

**2. 生成类型替换手写**（51b4cd2）
- devDep json-schema-to-typescript@^16；`npx json2ts -i pipeline/schema/news.schema.json -o src/data/news.types.d.ts`
- news.ts 重写消费 `Website60NewsJson`；tags 元组联合 JSON 推断无法表达 → `as unknown as` 断言并注明（运行时校验在管线落盘前，同旧口径）
- 消费点机械改名：news.astro / index.astro（title_zh、summary_zh、source_name、published_at.slice(0,10)、generated_at）、BaseLayout paletteIndex i.title→i.title_zh

**3. astro.config site 行**（ffde584）：`site: process.env.SITE_URL || 'https://longzhengyun.github.io/website6.0/'`

**4. 管线文件与 workflow 落位**（d7e3780，§7 路径契约）
- pipeline/schema/news.schema.json、pipeline/config/sources.json、pipeline/prompts/news-enrichment.md（shared 交付件原样迁入）
- pipeline/src/llm/adapter.ts：转写后端 §3 接口契约（LlmAdapter/completeJson/LLM_ENV）；Gemini REST 具体实现留后端；目录在 src/ 外不进构建输入
- .github/workflows/ 两份 = seq=133 项目抽验最新版；deploy-pages.yml:67 grep 循环覆盖 news.json / news-stats.json / news.seed.json 三路径已确认

**5. 自验**
- astro check（HEAD 复跑）：15 files 0/0/0；astro build：4 page(s) 1.58s，首屏 JS 不变 15.36 kB/gzip 5.28 kB
- News smoke：日期 2026-10-18 渲染、mode rss_only、build 2026-10-23T04:45Z、data-tags 收敛词表值均通过；首页 latest-3 倒序通过；palette external 6 条通过
- **News 渲染 DOM 结构零变化**（仅数据文本：mode 值、标签词表、日期显示仍 YYYY-MM-DD）——设计视觉回归可做可不做，供项目转达
- 未引 ajv 做独立 schema 校验——留给测试 §6 切换点三项核验
- 工作树干净；序列 a9731b7 → d7e3780 → 51b4cd2 → 9a83c16 → ffde584；未 push

---

## 9. M3 收尾一行切换（commit f9b9367）

- `src/data/news.ts` import：`./news.seed.json` → `./news.json`（管线首跑真实产物 25 条 rss_only）；seed 保留为占位参考不再参与构建输入消费
- 自验：news.json 数据面 node 直读 mode=rss_only / 25 items / published_at 全序列倒序 true；`astro check` 0/0/0；`astro build` 4 page(s) 1.73s，首屏 JS 不变 15.36 kB/gzip 5.28 kB
- Smoke：dist/news 渲染 25 条目（data-news-item 26=25 li+1 脚本引用）、footer `build 2026-10-23T05:39`（证明消费管线时间戳）、`mode rss_only`；首页 latest-3 日期 10-23/10-23/10-22 倒序正确
- HEAD 序列 …ac49854→**f9b9367**，工作树干净，未 push

## 10. M4 出口判定修复：BUG-M4-01 / BUG-M4-03（commits 7ff059e → 822e3d5）

工具：`E:\Jary\github\.m4tools\measure.mjs`（CDP 直连 headless Chrome，可复跑）
- 用法：`node measure.mjs '[{"name","url","w","h","zoom"}]' <outdir>`，输出 sw/cw/chip/tabK/mail + `culprits`（溢出叶子元素探针）+ `chipReach`（容器内滚动可达性），并落盘截图
- 证据截图：`shared/m4-verify/`（pre-* 修复前 4 张，final-* 修复后 8 张）

### 10.1 修复前基线（复现测试数据，逐条吻合）
| 用例 | scrollWidth | clientWidth |
|---|---|---|
| /news 375 / 390 / 430 | 546 / 546 / 550 | 375 / 390 / 430 |
| index·about @200% | 475 | 375 |
| resume @200% | 395 | 375 |
| news @200% | 831 | 375 |

### 10.2 根因（两处都不是"缺 max-width"，而是优先级/收缩策略）
- **BUG-M4-01**：`.chip-row` 同时带 `enhanced-only`，而 `html[data-enhanced] .enhanced-only{display:inline-flex}` 优先级 (0,2,1) 高于 `.chip-row{display:flex}` (0,1,0) → 实际渲染为 inline-flex，按内容撑到 526px，自身 `overflow-x:auto` 永不触发。修复：显式覆盖回块级 flex + `max-width:100%`（global.css，6 行含注释）。
- **BUG-M4-03**：tab 条 `li` 宽度随字号刚性增长；页脚 email 长链接 w=243 不换行；**resume 页另有第三处**——头部 `mailto` + `github.com/longzhengyun` 两个长链接（测试未列出，`culprits` 探针定位到 `A.hover:text-accent:395`）。修复：`.tab-bar .tab-item{flex:1 1 0;min-width:0;overflow:hidden}` + `.tab-label` 省略号；页脚 `nav` 改 `flex-wrap` + email `[overflow-wrap:anywhere]`；resume 两个长链接 `[overflow-wrap:anywhere]`。
- 收缩规则刻意作用域到 `.tab-bar` 内：`.tab-item` 也被 resume 返回链复用，全局加 flex 收缩会连带影响该处布局。
- 未引入缩放锁：viewport meta 未改动（`user-scalable=no` 仍不存在）。

### 10.3 修复后实测（全部达标）
- /news 375/390/430：sw==cw==375/390/430，`culprits` 空；chip-row 宽 335/350/382、内容 526 → 溢出转容器内滚动，standards/tools 经 `scrollLeft` 可达
- @200%：index/about/news/resume 四页 sw==cw==375，`culprits` 空；⌘K 右缘 360、页脚 mail 右缘 263 均在视口内
- @300% 加测（超出验收）：news sw=545，仅 chip 容器内 + tab-label 省略号触发，页面主体不破版
- BUG-M4-02（tab 条溢出）确认为 01 传导：01 修复后 tabUl sw==cw==视口宽，未单独改 tab 条样式
- `astro check` 0 errors / 0 warnings / 0 hints；`astro build` 4 page(s) 1.74s
- HEAD 序列 …41a4a32→**7ff059e**→**822e3d5**，工作树干净（仅 `.qoder/` 未跟踪），未 push

## 11. M4.1 批次：R15 单屏首页 + R16 动态副标题 + R17 前端空态（commits 4bf5fa2 → 3f11699 → 08b3d11）

按 seq=280 项目汇总裁定实施：R15 取"设计混合方案"（桌面 ≤64px 单行两条脉冲条；移动端整块新闻从 DOM 移除），R16 三行 hero + 固定身份行 + 刷新随机标语池，R17 前端只做空态分支（不做逐条语言检测）。证据截图：`shared/m41-verify/`。

### 11.1 R15（commit 4bf5fa2）feat(home): single-screen minimal hero + desktop-only compact news pulse
- `src/pages/index.astro`：hero 下方新增 `section.shell hidden md:block [data-home-pulse]`——单行两条（`sortedItems.slice(0, 2)`）+ `/news>全部新闻 →` 尾链，条目为纯文字链接（row-num / truncate 标题 / ↗ / 日期），**无卡片边框无阴影**（首版误用 `.news-card` 带出 1px 边+surface 底，截图核对后已去除）。
- 移动端 DOM 移除：section 后同步 `is:inline` 脚本 `matchMedia('(min-width: 768px)')` 不匹配时在解析期 `removeChild`，375 视口 DOM 中新闻节点计数=0（非隐藏）。
- 垂直预算微调（按设计 budget 表）：`pt-[24vh]→[20vh]`、`md:pb-24→md:pb-16`、pulse 去 `pb-4`、footer `mt-16→mt-8 md:mt-16`、移动端 hero `max-md:min-h-[calc(100svh-300px)]` + flex 垂直居中。
- **回落纯 A 未触发**：display 保持 6.5rem（裁定②），1280×720 实测未破屏，无需一步回退。

### 11.2 R16（commit 3f11699）feat(home): three-line hero with client-random tagline pool + mobile footer single row
- 三行 hero：line1 站名（原有）、line2 固定身份行 `{site.role}`（`src/data/site.ts` 新增 `role: 'web 前端开发工程师'`，不轮播）、line3 `▍`（aria-hidden）+ `#tagline-text`。
- 标语池：`src/data/taglines.ts` 12 条（≤20 全角字符；[0] 为 no-JS SSR 回退渲染位；4/8 两条为可验证事实，站主上线前可整体替换）。
- 随机语义：SSG 构建期渲染 pool[0]（no-JS 回退 + LCP 稳定）；同步 `is:inline` 脚本替换于首绘前。`window.__tagline === undefined` 才重抽 → **刷新重抽、站内导航（ClientRouter window 存活）保持同一条**。
- 固定行盒：`.tagline-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`（global.css）→ 行高恒定，CLS=0。
- 移动端页脚单行（裁定①）：footer 外层 `flex flex-wrap … md:flex-nowrap`，`nav` 同步 wrap；简历入口隐藏（`hidden md:inline-flex`），移动可达性=页面级（About 链接 + ⌘K）。
- 修复记录（同类 BUG-M4-01 具体性问题）：⌘K 提示 span 同时带 `hidden md:inline` 与 `enhanced-only` 时，非分层规则 `html[data-enhanced] .enhanced-only{display:inline-flex}` (0,2,1) 压过 Tailwind 分层 `hidden` utility → 移动端被渲染、页脚超宽、© 行被挤到 tab 条下。修复：外层 wrapper span 只负责断点（`hidden md:inline`），内层只负责 `enhanced-only`（ SiteFooter.astro 有注释）。

### 11.3 R17 前端（commit 08b3d11）feat(news): empty-state branch
- `src/pages/news.astro`：`sortedItems.length === 0` 时渲染空态文案"本期暂无更新，稍后再来。"（`[data-news-empty]`），chip 行同条件不渲染；有数据分支保持原 ul。
- 验证方式：临时把 news.json items 置空重新 build → body 内空态文案在、chip button=0、li=0（注意 grep 需限定 `<main>`，内联脚本源码含 data-* 字符串会假阳性）；恢复后真实构建 76 条中文 + 4 chip + 首页 pulse 正常。

### 11.4 自验实测（AC-R15-05 / AC-R16 全绿）
| 检查项 | 结果 |
|---|---|
| 首页 1280×720 单屏 | sh=720，滚动 0% |
| 首页 375×667 单屏 | sh=667，滚动 0%（100svh 预算） |
| pulse 高度 | 58px ≤ 64px |
| 移动端新闻 DOM | `[data-home-pulse]` 节点不存在（移除非隐藏） |
| 375/390/430 横向溢出回归 | 全页 sw==cw==视口宽，culprits 空（防 BUG-M4-01 类回归） |
| 200% 缩放回归 | sw==cw==375，culprits 空 |
| R16 10 次 reload（.m4tools/r16check.mjs） | 9/10 互异（允许 1 次重复），行高恒定 17px，每次 CLS=0.00000 |
| R16 no-JS / SSG 回退 | SSR_FIRST=pool[0]（原始 HTML 校验） |
| R16 外部请求 | Network 监听全 reload EXTERNAL_REQUESTS=[] |
| R16 新增 JS 体积 | 内联合计 817B ≤ 2KB；池 12 条全部 ≤20 全角字符 |
| astro check / build | 0 errors / 0 warnings / 0 hints；4 page(s) |

- HEAD 序列 …822e3d5→fbf647e（后端 R17 管线，边界已核）→**4bf5fa2**→**3f11699**→**08b3d11**，工作树干净（仅 `.qoder/` 未跟踪），未 push（push/部署由开发运维执行）。

## 12. 修复批（一）：BUG-M4R-03 + BUG-M4R-02（commits 5b44c64 → 38eab9d）

BUG-M4R-01（对比度）等设计裁定色值后另笔实施（seq=342/347 口径）。工具：`.m4tools/m4rcheck.mjs` + `m4rcheck2.mjs`（CDP，可复跑）。

### 12.1 BUG-M4R-03（A）tagline 200% 文字缩放裁切（commit 5b44c64）
- 根因确认与测试一致：`.tagline-line` nowrap+overflow:hidden 固定单行行盒，@200% 长条目裁在视口外不可找回（WCAG 1.4.4）。
- 修复方案（自定方向=换行回退）：`nowrap/ellipsis` 移除，改 `overflow-wrap:anywhere`——@100% 池内最长条目单行可容纳（实测 right=223<360），视觉零变化；@200% 长条目整句换两行完整可见。CLS 不受影响：随机替换脚本同步执行于首绘前，行盒高度在首次布局即定。
- 实测（375 视口 + `documentElement.style.fontSize='200%'`，逐条断言 `#tagline-text` 全 rect maxRight ≤ clientWidth=360）：12 条池全部通过——18 字=244/325（两行）、16 字=335/332、14 字=321，最大 335 ≤ 360；页面 sw==cw==360 无横向溢出。对照修复前测试基线 426/399。截图 `shared/m41-verify/home-375-z200-longest.png`。
- 回归：@100% 单屏 375×667 sh=667、1280×720 sh=720、pulse 58px；reload×8 CLS≤0.00041 且 tagline 贡献=0、5 种互异副标题、sh 恒 667。

### 12.2 BUG-M4R-02（A）正文链接仅颜色区分（commit 38eab9d）
- 修复：`main a.arrow-link:not(.tab-item)` 静态下划线（offset 3px / thickness 1px）。作用域天然排除：header 品牌链（不在 main）、resume 返回链（.tab-item）、news 整卡（下划线在 h2 非锚点，卡片靠边框+结构区分）。
- 实测 computed textDecorationLine：index@1280 尾链"全部新闻 →"=underline、header 品牌=none；about 简历入口=underline；resume tab 形态=none；news 卡锚点=none。
- 溢出回归 375/390/430 × index/news：sw==cw、culprits 空（下划线不改盒宽）。

### 12.3 状态
- HEAD 序列 …08b3d11→7136190（后端 ruanyifeng 裁定）→**5b44c64**→**38eab9d**，工作树干净，未 push（@开发运维 随批叠推）。
- BUG-M4R-01 待设计裁定（含测试 seq=347 补充的 tagline-line ink-faint 涉事点）后一批实施。

## 13. 修复批（二）：BUG-M4R-01 用色裁定实施（commit 38fa315）

按 design-spec v1.1 §8（R-1/R-2/R-3）+ 项目 seq=365 放行实施，9 文件单提交。工具：`.m4tools/contrastcheck.mjs`（WCAG 公式逐节点实测，亮/暗 × 375/1280 × 四页）。

### 13.1 实施内容
- **R-1 hex 地板值**：theme.css `--c-ink-faint` 亮 #8b9098→**#6a6e76**、暗 #5f6773→**#7b8394**（一处覆盖所有装饰序号节点：nav 02/03/ 前缀、row-num、rank 空块、footer 提示/©、news build-meta）。
- **R-1 必读元信息迁移 faint→muted**：news 日期/来源/#标签+面包屑、index tagline-line+脉冲日期、about 面包屑/period/实验位注/打印注、resume 全部 meta 与区段小标题（9+4 处）。news 页脚 build-meta 行按"非必读装饰档"保留 faint（新值已 ≥4.5）。
- **R-2 激活态去 accent 小字**：桌面 nav / 移动 tab = `text-ink` + 字重 600 + accent 2px 指示条（nav ::after 下划线 / tab ::before 顶条）；chip[aria-pressed=true] = ink + 600 + accent 边框（1.4.11 3:1 适用非文字件）；CommandPalette 选中行 accent 文字→`bg-ink/text-accent-ink` 反色行（双通道非颜色线索）；resume 提示框 `text-accent`→`text-ink + border-accent`。
- **实施期发现（记录）**：① t-label 的 `font-weight:500` 是非分层规则，Tailwind `font-semibold` utility（layered）压不过 → 字重改由非分层 `nav a[aria-current="page"]{font-weight:600}` 驱动，语义源仍是 aria-current；② 品牌分隔符 `·`（13px text-accent，3.74:1）为探针新发现违例（spec 8.3 清单外）——图形化为 5px `.brand-dot`（aria-hidden，accent 底非文字件），保品牌节奏不违 <18px 禁 accent；hero 大字 `·`（104px，large-text 3:1 口径 3.74 ✓）保留文字形态。

### 13.2 自验（测试 seq=347 四步口径）
- 对比度全样本：16 组合（亮/暗 × 375/1280 × index/news/about/resume）共 ~2600 文本节点，**违例 0**（修复前 light 3+ 组合各 1、暗 0）；`.tagline-line` 在探针覆盖内（实测色 muted 亮 #5A5E66/暗 #9BA3AF）。
- 激活态 computed 断言：nav/tab color=ink、fw=600、指示条 bg=accent h=2px；chip color=ink fw=600 border=accent。
- 回归：单屏 375×667 sh=667 / 1280×720 sh=720 / pulse 58px；375/390/430 溢出 sw==cw culprits 空；reload×8 CLS≤0.00041 tagline 零贡献 6 种互异；tagline @200% 12 条池 maxRight≤335<360 全过；M4R-02 下划线断言不变（尾链/about=underline，品牌/tab/卡片=none）。
- `astro check` 0/0/0；`astro build` 4 page(s)。截图 `shared/m41-verify/m4r01-index-375-dark.png`、`m4r01-news-1280-light.png`。
- 残留观察（不阻塞）：hover 态 `hover:text-accent`（交互瞬时态，axe 静态扫描不覆盖）与 focus-ring accent（颜色+轮廓双通道，spec 合法用途）未改，留设计出口批次视觉走查顺带确认。

### 13.3 批次状态
- 三修齐：链 …7136190→**5b44c64**→**38eab9d**→**38fa315**，工作树干净（仅 .qoder/），未 push（@开发运维 一批叠推）。

## 14. 修复批（三）：hover/focus-visible 小字 accent → ink（design-spec v1.1 §8.5，seq=376/382）

### 14.1 实施（commit 5c3825a）
- 8 处单类替换（全部 t-label/t-small 链接，<18px）：
  - `src/pages/index.astro:85`「全部新闻 →」`hover:text-accent`→`hover:text-ink`
  - `src/pages/about.astro:84` 简历入口 `hover:` + `focus-visible:` →ink
  - `src/components/SiteFooter.astro:10`（hover+focus-visible）、`:18`、`:24`（hover）→ink
  - `src/pages/resume.astro:40`、`:47` 头部邮箱/github →ink
- 保留（非文字件，1.4.11 合法，设计 seq=376/项目 seq=382 确认）：`.arrow-link:hover .arrow` / `.news-card:hover .arrow` 箭头图形 accent；`:focus-visible` 2px accent 轮廓环；chip/nav accent 指示条。
- 顺带卫生修复：`.gitignore` 增 `.qoder/` ——Tailwind v4 内容扫描此前把会话 .md 里的 `hover:text-accent` 字样编入产物 CSS（`.hover\:text-accent:hover` 幽灵规则）；忽略后产物重建即消失。CSS hash 变化：about.Jf1gdSPk.css → **about.C19isPln.css**。

### 14.2 自验
- grep 清零断言：`hover:text-accent|focus-visible:text-accent|focus:text-accent` 全 src **0 命中**；`text-accent` 仅剩 hero 104px「·」（大字保留）与 palette 反色行 `text-accent-ink`（§8.3 已批）。
- 产物 CSS 断言：dist 内 `.hover\:text-accent`/`.focus-visible\:text-accent` 规则 0；`.hover\:text-ink:hover`、`.focus-visible\:text-ink:focus-visible` 在位。
- 运行时 computed 抽查（CDP `CSS.forcePseudoState`，1280×720 light，脚本 `.m4tools/hovercheck.mjs`）：9 项 **ALL PASS**——8 个涉事链接 hover/focus-visible 后 computed color = ink `rgb(20,22,26)`（原 ink-muted `rgb(90,94,102)`）；news 卡片箭头 hover 后仍 accent `rgb(229,72,77)`。
  - 口径注记：涉 `transition-colors` 元素须等待 ≥160ms 再读 computed，否则取到过渡中间值（首跑 7 项假阴性由此产生，加 300ms settle 后全绿）。测试复验可直接沿用该脚本。
- 四步不变：本批纯 hover/focus 态类替换，静态样本零改动（`.tagline-line` 等不受影响），无需重跑全量对比度探针；构建期 `astro check` 0/0/0、`astro build` 4 page(s) ✓。
- 工作树干净（.qoder/ 已忽略不再显示 untracked），链 …38fa315→**5c3825a**，未 push。

### 14.3 交接口径
- 叠推队列更新（@开发运维）：7136190→5b44c64→38eab9d→38fa315→**5c3825a**。
- 出口批次（@测试）可顺带抽查 computed hover 态（14.2 脚本可复用）；@设计 线上视觉走查含圆点基线重心 + 激活项 ::before 指示条 computed 色值两项留观。

## 15. 修复批（四）：BUG-M4R-04 scroll-rise 底缘静止位对比度（design-spec v1.1.1 §8.6 方案③，seq=402/406）

### 15.1 实施（commit 2805faa）
- global.css 单点：新增 `@keyframes rise-shift`（translateY(12px)→none，无 opacity）；仅在既有 `@supports (animation-timeline: view())` + `no-preference` 块内加 `animation-name: rise-shift`。
- 不动项（按裁定）：250ms 时间轴淡入回退（rise，短时自愈）、reduce 直显（animation:none）、news 逐卡结构、.spine 书脊。
- pulse 区「全部新闻 →」下划线=设计意图维持，选择器不收窄（seq=402 判定记录）。

### 15.2 自验（探针 `.m4tools/batch4check.mjs`，opacity 合成感知版）
- 探针口径升级：文本前景色按祖先链累计 opacity 合成后再算 WCAG 比值——原版（contrastcheck.mjs）会漏检 opacity 违例；此为出口批复用关键注记。
- **对照运行（线上修复前，longzhengyun.github.io）**：12/12 帧 FAIL——viol 2~6、底缘带 opacity 0.27~0.95、animation-name=rise——证明探针可检出原缺陷类。
- **修复后本地构建**：12/12 帧 ALL PASS（light/dark × 375×667/1280×720 × scrollY 0/40/90）——viol=0、底缘带 opacity 恒 1、animation-name=rise-shift。
- 动效保持证据：修复后 transform 矩阵与对照逐帧一致（如 8.32386/6.24374/3.95903），位移曲线未变，仅剥离 opacity。
- grep 断言：src 与 dist 的 view() 块内均无 opacity 参与 keyframes；dist CSS hash → **about.CAT37jBM.css**。
- astro check 0/0/0、build 4 page(s) 绿。CLS：transform 不参与布局，机理保证 0（出口批回归覆盖）。

### 15.3 交接
- 叠推队列=六笔：7136190→5b44c64→38eab9d→38fa315→5c3825a→**2805faa**（@开发运维）。
- 出口批触发链按 seq=406：叠推 deploy 绿 → 测试一次跑完（contrast 全样本 + axe 四组合 + AC-R15/16 + BUG-M4R-04 关闭复验【可复用 batch4check.mjs 双跑口径】+ news-perf 压 PAT）+ 设计走查。线上抽查 CSS hash 断言以 about.CAT37jBM.css 为准。

## 16. 修复批（五）：R18 品牌文案 jary8→Jary + R19 favicon「佳」（站主 seq=430，项目分派 seq=432）

### 16.1 实施（commit bd8aad4，9 文件 +16/-16）
- R18 展示层 13 处：site.ts nameEn（驱动三页 `<title>`）、index hero 双位+desc、SiteHeader aria-label+品牌位、about desc/正文/CLI 行、SiteFooter © 行、resume.astro desc+返回行、resume.ts 署名；global.css :10/:30 注释措辞同步。
- 域名白名单未动（裁定）：public/CNAME、deploy workflow www.jary8.com 断言与注释、news.schema.json $id、sources.json user_agent、about.ts:30 org:'jary8.com'（显示为域名）。站主如要 org 一并改，一句话即补。
- R19 favicon.svg：text「j8」→「佳」，rect #14161A/字色 #FAFAF8 维持；font-family 改 CJK 优先栈（'PingFang SC','Microsoft YaHei','Noto Sans CJK SC','Source Han Sans SC',system-ui,sans-serif——monospace 不保证汉字字形），font-size 28→40、dominant-baseline=central + y=33 居中；dist 同名文件由构建同步，未手改。

### 16.2 自验（脚本 `.m4tools/r1819check.mjs` + `favshot2.mjs`）
- astro check 0/0/0、build 4 page(s) 绿。
- grep 残留断言：src 内 jary8 仅剩 about.ts:30 域名 org（白名单）；dist 内非域名 jary8 零命中（CNAME 除外）；四页 title 实测「佳瑞网 · Jary」系。
- hero 单屏不回归（字符 5→4 实测）：1280×720 hero bottom=326≤720、375×667 bottom=216≤667，截图 r1819-verify/index-1280x720.png、index-375x667.png。
- OVF 375/390/430 × 4 页 = 12/12 scrollWidth==viewport 无横向溢出。
- favicon 渲染证据（shared/r1819-verify/）：favicon-render-strip.png（16/32/64/16@white/x4 对照）+ favicon-doc-16/32/64.png（文档级精确像素实拍）。16px 态「佳」笔画可辨、字面居中；前端判定达标，终确认留设计出口走查。
- 环境注记：① Bash 命令含汉字触发包装器 exit 127——含中文断言改用 Grep/Read 工具或脚本文件；② Chrome 禁 data: 顶层导航、file:// 页不加载 http 子资源——favicon 渲染证据须在同源 http 页内注入 harness。

### 16.3 交接
- 叠推队列=七笔：…→2805faa→**bd8aad4**（@开发运维）。deploy 绿后线上抽查：品牌文案（title/hero/footer）+ favicon.svg 内容含「佳」+ CSS hash 预期再换代（文案改动会改 HTML hash；CSS 仅注释变化，产物 hash 是否变动以实测为准）。

## 17. 任务A：简历页真实素材替换（站主 seq=621 → 项目分派 seq=624 → 裁定方案B seq=634 → 站主"先留空" seq=638 转达 seq=640）

### 17.1 取材与盘点
- 3.0/4.0 无克隆，git 443 超时：全程 api.github.com trees/contents + raw.githubusercontent.com。scratch=E:\Jary\github\.m4tools\resume-scan\（3.0 全部 131 代码 blob + 4.0 关键页/控制器 + 关键词扫描）。
- 核心事实：两站简历均为后端运行时取数（3.0 db_config.php、4.0 SELECT FROM user_data），仓库无履历正文；version4 起简历有密码门。关键词唯一正文命中为转载乐评（李健），排除。
- 采用素材（全部可证）：website5.0/src/content/profile/profile.mdx（Jary / Web 前端开发 / UTC+8 / 邮箱 / GitHub / 站点始于2008 / 从业始于2007 / shortBio / 技能三组含熟练度）+ website5.0/src/data/version-log.json（V3 2016.05 AngularJS+PHP、V4 2020.06 Nuxt2+Koa+SQLite、V5 2026.10）+ 原 resume.ts 的 6.0/5.0 真实项目记录；技术栈互证 3.0 product/views/about.html、4.0 pages/mine/about.vue。

### 17.2 实施（worktree E:\Jary\github\website6.0-wt-resume-20261026，分支 feat/resume-real-content，基 origin/master=0ce0a8a）
- 194ea40 resume.ts 数据替换：profile.mdx 全字段 + 站史四项目；隐私红线执行（无手机/年龄/薪资）。
- c5bb835 resume.astro：技能三组渲染（join 展示，全部沿用既有 token/类）、meta 行、Experience 恒显示。
- 37ae755 站主"先留空"裁定落地：experience/education 均空数组（未来仅填数据不动模板）；呈现选择=保留节标题+空态"暂未公示"（对页面结构冲击最小、锚点与打印结构稳定）；删除 sampleNote 横幅（内容已真实，无占位假内容）。
- 文案红线执行：页面句子全部为素材原文整句复用，零扩写。样式体系零改动（仅 text-ink/t-label/t-body 等既有类）。

### 17.3 自验证据
- astro check 0 errors/0 warnings/0 hints（16 files）；build 4 page(s) Complete（两次：Step1 后、Step3 后）。
- dist/resume/index.html Grep 断言：手机|年龄|期望年薪|salary|phone|示例|待站主补充|sampleNote → 0 命中；可证内容（Web 前端开发/站点始于 2008/从业始于 2007/可访问性/暂未公示×2/Nuxt 2/AngularJS）→ 命中。
- 预览冒烟：http 200（9765B），五节锚点 r-summary/r-skills/r-exp/r-projects/r-edu 全在，mailto + github 链接渲染正常；preview 已停、端口释放。
- 工作树 clean，领先 origin/master 三笔，待项目抽验与叠推。
