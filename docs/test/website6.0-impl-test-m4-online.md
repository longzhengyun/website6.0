# website6.0 M4 线上批次执行报告（测试，第一轮）

作者：测试｜日期：2026-10-23｜依据：项目分派 cmsg_01m5kv88nz6t94xqpev2snh1zk + 清单 v1.4
对象：https://longzhengyun.github.io/website6.0/（部署消费 8ceebcd 数据面 + 55bcf5b CI；实测 HEAD 状态以线上产物为准）
方法：curl 直连（github.com 间歇超时项走 Pages CDN 185.199.108.153，按项目口径不判 blocked）+ headless Chrome 155 CDP 确定性实测（Network 监听、视口矩阵、DOM 度量、截图）
证据目录：E:\Jary\qa-outputs\website6.0\M4-online-20261023-01\evidence\（website6.0-m4-online-* 前缀：http-probes、live-*.html、html-checks、browser 记录、offenders-v3、tabbar-forensics、PNG 截图 ×8）

---

## 1. 通过/未通过总表

### 1.1 未通过（缺陷，均移动 P0 页面，阻断 M4 出口）

| ID | 级别 | 缺陷 | 复现步骤 | 期望 vs 实测 | 证据 |
|---|---|---|---|---|---|
| BUG-M4-01 | **S** | /news 移动端整页横向溢出 | 375/390/430 任一移动视口打开 /news/ | 期望无横向滚动（AC-M01/M-A1、AC-G02）；实测 document scrollWidth=546/546/550 > 视口。**根因定位**：筛选胶囊行容器 `.chip-row`（overflow-x:auto 名义在位）自身展开到内容宽 526px（clientW=scrollW=526，未被约束为视口宽），把页面级 scrollWidth 顶出去；standards/tools 胶囊渲染于 x=359-546 视口外 | offenders-v3.txt、tabbar-forensics.txt、375-news-clean.png。注：与其余三页对比（index/about/resume 375 下 sw=375 全 PASS），仅 /news 复发，稳定可复现，置信度 high |
| BUG-M4-02 | **S**（疑为 01 派生） | /news 底部 tab 条被顶宽，⌘K 项离屏不可达 | 同视口打开 /news/，检查 fixed tab-bar | 期望 tab 条视口内 4 项均布、拇指区可达（M-B1/M-B2）；实测 nav.tab-bar 宽=546（=页面 scrollWidth），⌘K 按钮 rect x=456-500 超出 375 视口。**对照**：index 同视口 tab-bar 4 项各 44px 全部在视口内（x≤350）→ 佐证是 01 的溢出传导而非 tab 条自身样式错误 | tabbar-forensics.txt、375-news-tabbar-evidence.png。修复 01 后必复测本项 |
| BUG-M4-03 | **A** | 文字缩放 200% 四页横向溢出/内容离屏 | 375 视口，根字号设 200%（rem 体系下等价用户文本放大） | 期望 M-A5：200% 文本缩放不丢内容（WCAG 1.4.4）；实测 sw：index 475、about 475、resume 395、news 831 全部 >375；index 离屏元素=tab-bar ⌘K（right 448）+ 页脚邮箱链接（w=243）。**口径说明**：用 rootFontSize 200% 近似浏览器文本缩放，二者对本页 rem/px 混合布局的传导基本一致；tab-bar 项目宽度随字号扩张是主因，属可修（min-width 弹性化/换行策略） | overflow-v2.txt、offenders-v3.txt、375-zoom2x-index.png |

### 1.2 线上通过（关键项）

| 用例 | 结果 | 实测数据 |
|---|---|---|
| AC-G01 github.io 路径可达 | pass | /、/news/、/about/、/resume/ 全 200（直连）；404 探针经 CDN IP 404 正常；TLS ssl_verify=0；title「佳瑞网 · jary8 — 把浏览器能做的，做到最新。」；四页零 http:// 资源引用（无混合内容） |
| **AC-AI-D02 Network 完整断言（补段，本次核心）** | **pass** | 四页冷加载 + /news 筛选点击 + ⌘K 交互共 **31 个请求，全部同源 longzhengyun.github.io，白名单外零外部请求**（自托管字体口径达成，红线 3/N3 交叉） |
| AC-N1/D03 线上消费态 | pass | 部署版 news.json（git show 8ceebcd 提取）28 条 rss_only → 线上渲染 28/28 命中、published_at 倒序违例 0、_blank 37 链接 noopener 零缺、无 AI 宣称、来源说明+构建时间显示在位 |
| AC-P05 导航禁字 | pass | header/主导航/移动端 tab 条区「简历/Resume」零命中（命中仅在页脚导航暗线，v1.3.1 口径；提取逻辑修正复跑，初测 3 FAIL 为 footer nav 误圈假阳性） |
| AC-G04/M-A5 viewport | pass | 四页 viewport=`width=device-width, initial-scale=1, viewport-fit=cover`，无 user-scalable=no/maximum-scale 锁 |
| AC-M07/M-B2 tab 条形态 | pass | 360/390/430 下移动端 tab 条 fixed 可见、高 56px、4 项各 44×56（index 全量核验） |
| AC-M15 筛选交互（375） | pass | 胶囊高 44px；frontend 点击后 aria-pressed=true、选中色 rgb(229,72,77)=#E5484D accent；列表即时过滤可用 |
| AC-P09 ⌘K 面板 | pass | meta+k 唤起：面板 560px、输入框自动聚焦、10 条目标项 |
| AC-G03 键盘可达（静态段） | pass | 首页 Tab 前 6 跳焦点链连续（skip-link→…→新闻条目），outline=solid 全链可见 |
| AC-SEC05 线上产物 | pass | 四页 HTML 密钥五特征 0 命中 |
| 本地 pass 项线上重验 | pass | live-*.html 静态断言 14/14（html-checks.txt），含 M-A4 about 时间线无溢出 |

### 1.3 N/A / Blocked / 未跑（残余风险如实登记）

- AC-G01 自定义域部分：**n_a（M5 门禁未启用，符合流程）**。观察：apex jary8.com 已在 GitHub Pages 前置 301→www.jary8.com，但 www 无解析（curl 000）——M5 换绑时站主需补 www CNAME，一并提示。
- G4/AC-CI04 Lighthouse 移动 Perf≥90/A11y≥95/BP≥95 + LCP/CLS 实测：**blocked**——本机无 lighthouse CLI（npx --no-install 失败），且两 workflow 均无 Lighthouse job（grep 0 命中）。需开发运维决策：CI 加 lhci 步骤或人工跑一次并给 run 链接；否则 M4 出口缺该门禁证据。
- AC-M18 真机（iOS Safari/Android Chrome 各 1 台）：**未覆盖**，本轮全部 device emulation，按清单规则 confidence=medium 记入残余风险。
- AC-AI-F01~F05：Blocked 等 LLM key + 回写闭环，按分派未跑。
- M-D1 axe 扫描、M-C2 4G 网络节流：本轮未跑（axe 可与修复复验合并跑；网络节流受 CDN 路径不可控），记缺口。

## 2. 交接建议（不代修复）

BUG-M4-01/03 指向同一族移动端布局约束缺失，owner 建议前端（.chip-row 宽度约束 + tab-bar 弹性 + 页脚长文本 break）；02 待 01 修复后复测确认是否派生。修复 commit 落定部署后我按同脚本复跑（全部确定性、可重放）。

## 3. 汇总口径

本轮线上执行 25 个断言组：pass 22 / **fail 3（2S+1A，集中 /news 移动端 + 文本缩放）** / blocked 1（Lighthouse）/ n_a 若干（域名/F 组）。M4 出口判定：**未通过，待前端修复复验**。数据面、安全面、请求面、交互面全部干净，缺陷集中在 CSS 移动约束，修复面小。
