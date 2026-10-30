# DESIGN.md — 佳瑞网 v6.0 设计系统契约（P-2 初稿，供前端评审后并入仓库 docs/）

- 产出人：设计 ｜ 日期：2026-10-26 ｜ 状态：**rev2 定稿 + W8 三期改写进册（P4-01；差异稿 shared/phase3-w8-design-md-rewrite-v1.md 签核后机械应用：§1-2 可感知的炫技、§1-5 双区契约、§3.5 中文与时间口径、§2.2 暗档 ink-muted #9ba3af 对齐）**
- 数据源：website6.0 源码实测（theme.css/global.css/4 页面/4 组件）+ WCAG 相对亮度公式计算（脚本：E:\Jary\github\.scratch\contrast-p2.mjs，Node v24.19.0 执行，输出全量记录见 §7）
- 裁定依据：站主 seq=84 第 2 项"按建议统一品牌色"（B 方案，朱红系）；本文即 P-2 的"朱红系统一 token 基线"。

## 1. 设计原则（C 路线）

1. **单一品牌色**：全站一个记忆点——朱红。亮暗两模式是同一色相的明度适配，不是两套品牌（本次统一的核心决策）。
2. **可感知的炫技（三期双区制，站主 seq=841/848 裁定）**：技术要以**被看见**的方式展示——首页是前沿表现区，视觉大胆度与动效密度不设克制预算（WebGL/View Transitions/滚动驱动/backdrop-filter 与视频素材按设计需要自由使用，兼容性与性能预算豁免，验收基线=最新 Chrome/Safari+最新移动设备）；内页延续负责任的丰富（降级三列在契约内、对比度与克制条款照常）。**责任心的新形态**：首页每一项前沿能力仍须登记降级台账形态（台账在案即负责，不判缺陷）；"负责任比丰富更重要"在内页原样成立，在首页改写为"**可追溯的出格比安全的平庸更重要**"。
3. **accent 是预算不是涂料**：每屏 ≤3 处；`<18px 文字禁用 accent 色`（实测亮色朱红小字对底色仅 3.74-3.91:1，不达正文 AA——这不是偏好，是数学）。
4. **零后端边界自守**：所有交互纯端侧（CSS/原生 JS/localStorage/构建期 JSON），无运行时外部请求。
5. **双区契约（三期）**：
   - **首页=前沿豁免区**：仅指 home（D 档可滚动叙事层 + M 档严格一屏双档，seq=852 口径）；构图总纪律=禁矩形/禁对齐类规整元素（走查图例源=D2 01 册，胶囊 radius≥46px、blob/圆窗为合规形态）；标题定制化或图片化（D-6）；兼容/性能豁免——降级态（reduced-motion/无 JS/旧浏览器）呈现简化形态不判缺陷，验收只按最新 Chrome/Safari 基线；INP≤100ms 对首页豁免。
   - **内页=传统基线**：/news、/about、/changelog、/resume、404 沿用 square 栅格传统版式（胶囊/blob 只属首页），**§4 铁律「零新增 JS 运行时、全部三列降级为验收项」对内页原样适用**；内页降级闸门、无障碍与对比度（≥7:1 文字档）条款、accent 预算类规则全部保留；内页动效不设数量判据，按「传统展示+新风格 token 一致性」走查。
   - **机制三件套红线（两区通用，不可豁免）**：三态主题+首帧预写（DEF-THEME-1 修复语义）、ClientRouter 页面标记重放、日期数据 UTC 入库/北京时间（+08:00）显示。
   - **证据链红线（两区通用）**：汇报与公开叙事只写已发生事实、commit master 可核验、外来素材授权证据归档 docs/asset-licenses/ 后方可进仓。

## 2. 色彩 Token 基线（统一后）

### 2.1 亮色（不变项为主）
| Token | 值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--c-bg` | #fafaf8 | 页面底 | ink 17.33:1 |
| `--c-surface` | #ffffff | 卡片/条 | ink-faint 5.12:1 |
| `--c-ink` | #14161a | 正文 | 17.33:1 ✓AAA |
| `--c-ink-muted` | #5a5e66 | 次要 | 6.51:1 ✓ |
| `--c-ink-faint` | #6a6e76 | 弱化/编号 | 4.90:1@bg / 5.12:1@surface ✓（BUG-M4R-01 校注值，保留） |
| `--c-line` | #e3e2de | 分隔线（装饰件，无对比度义务） | — |
| `--c-accent` | #e5484d | 品牌朱红：图形件/焦点环/≥18px 强调 | 3.74:1@bg / 3.91:1@surface ✓（仅图形件 3:1 与大字） |
| `--c-accent-ink` | #ffffff | accent 底上的字 | 3.91:1 ——**限制见 2.3** |
| `--c-accent-strong`（**新增**） | #c93a3f | 实心 accent 按钮底（白字需 ≥4.5:1 时） | #fff on #c93a3f = 5.05:1 ✓ |

### 2.2 暗色（本次变更点）
| Token | 旧值 | 新值 | 变更理由 / 实测 |
|---|---|---|---|
| `--c-accent` | **#5eead4（青）** | **#ff7b81（朱红提亮档）** | 统一品牌色相。复测：7.78:1@bg、7.18:1@surface —— 图形件(≥3)与任意字号文字(≥4.5)全过关，无 B1 规则妥协 |
| `--c-accent-ink` | #0b0d11 | #0b0d11（不变） | #0b0d11 on #ff7b81 = 7.78:1 ✓AAA（反色行/实心件可用） |
| bg/surface/ink/ink-faint/line | — | 全部不变 | 复核：ink 17.46、ink-faint 5.11/4.71，均 ✓，BUG-M4R-01 R-1 暗色校注保持有效 |
| `--c-ink-muted`（暗档） | #5a5e66 | **#9ba3af**（P4-01/§六-4 对齐；F1-01 裁定 seq=971 选 b） | 判据锚=二期 dark 实测 7.64:1（≥7 文字档组）不得静默降档→回值实测 **7.87@bg #080808 / 7.05@surface #14171d**（值沿用测试记录）✓；theme.css 两处成对 `SYNC:dark` |

备选档（若站主觉得 #ff7b81 偏粉）：`#ff7076`（7.4x）、`#f2555a`（5.76/5.32，更接近亮色原色相，仍全过 AA 文字档）。**设计推荐维持 #ff7b81**：与暗底明度差更大，焦点环/指示条可见性最好。

### 2.3 accent 用色规则（统一后修订）
- R-C1 每屏 accent ≤3 处（B1 沿用）；非交互元素常态 `ink-muted`，仅 hover/focus 转 accent（箭头条款沿用）。
- R-C2 `<18px` 文字禁用 accent 着色（两模式通用）。旧暗色青因 4.5+ 曾可豁免，统一后**豁免取消**，规则两模式一致——契约简化，也是统一的额外收益。
- R-C3 亮色下**实心 accent 底 + 白字**组合仅允许：(a) ≥18.66px bold，或 (b) 改用 `--c-accent-strong` #c93a3f（5.05:1 ✓）。暗色无此限制（7.78:1）。二期新组件（主题切换控件、L-4 状态卡高亮态）遵守此条。
- R-C4 焦点环 `2px solid var(--c-accent)` + offset 2px：两模式均 ≥3:1 ✓（暗 7.78 / 亮 3.74）。
- R-C5 品牌分隔点保持图形件 `.brand-dot`（5px 圆点），不得回退为 accent 文字。
- R-C6 `--c-warn` 为独立语义色（状态卡异常提示专用），**不占 accent ≤3 处预算**、不得挪作装饰；亮 #b45309 / 暗 #ffa94d 双档，任何新用途需先过 §7 复测流程。

## 3. 版式契约

### 3.1 字体
- 正文 `--font-sans`: Geist Variable → PingFang SC → Microsoft YaHei → Noto Sans CJK SC。
- 标签/编号/代码 `--font-mono`: Geist Mono Variable → SF Mono → Cascadia Code。
- 中文标题字重上限 **600**（`.zh-title`），行高 1.2 ——Geist wght 轴 100-900，中文回退字体无对应轴，超 600 会渲染崩坏，**不可调高**。

### 3.2 字号阶梯（M=375 基线 / D=≥768 覆写）
| 档 | M | D | 行高 | 字重 | 用途 |
|---|---|---|---|---|---|
| t-display | 3rem | 6.5rem | 1.02 | 620 | 仅首页 hero |
| t-h1 | 2rem | 2.75rem | 1.15 | 600 | 页标题 |
| t-h2 | 1.375rem | 1.5rem | 1.25 | 560 | 区块题 / hero 副行 |
| t-h3 | 1.125rem | 1.25rem | 1.3 | 540 | 条目标题 |
| t-body | 1rem | 1.0625rem | 1.65 | 400 | 正文，measure 上限 34em/42em |
| t-small | 0.875rem | 0.9375rem | 1.5 | 440 | 摘要/说明 |
| t-label | 0.75rem | 0.8125rem | 1.4 | 500 | mono 标签，letter-spacing .08em，多 uppercase |

### 3.3 栅格与版心
- 断点 sm=425 / md=768 / lg=1200；`.shell` 内衬 20→24px；D 端版心 720px、lg 1080px、`.shell-wide` 1280px（仅 hero）。
- 移动端底部 tab 条避让：`56px + env(safe-area-inset-bottom)`，`.tab-item` 命中区 ≥44×44px。
- 圆角全 0、禁阴影（卡片用 1px line 区分，hover 边色转 ink）；间距节奏以 4 倍数，区块间 mb-12/16。

### 3.4 CJK 字重实际渲染口径（A8 spike 结论 C，2026-10-27 补；spike：shared/l3-a8-variable-cjk-spike.md）
- **事实基线**（Windows+Chromium 实测，CJK 实际渲染者=Microsoft YaHei）：CJK 只有 Regular/Bold 两态；目标字重 ≥550 一律吸附 Bold，500-540 落 Regular，**无中间插值**；连续 wght 轴仅拉丁段（Geist Variable）真实生效。
- 现阶梯的 CJK 有效档：t-body 400 / t-small 440 / t-label 500 / **t-h3 540 → Regular**；t-h1 600 / t-h2 560 / t-display 620 / .zh-title 600 → **Bold**。设计依赖只写两档：CJK 层级差=字号+色彩档+Regular/Bold，中间数值（540/560/620）仅约束拉丁段连续档。
- **禁则**：CJK 场景字重不得 >700（900 档触发 Chromium 合成加粗，笔画糊连——截图实证 a8-chrome-light.png w900 行）；如某档含 CJK 需 >700 的视觉强度，改用字号或 accent 层级解决。
- **混排已知特性**：同一行 CJK+拉丁在 550-650 区间，拉丁段视觉细于 CJK 段（如 hero 副行、404 大字行）——接受，不做合成粗补偿；需平衡时调拉丁档（拉丁 700 ≈ CJK Bold 观感）。
- **暗色约束**：暗底亮字有光学增粗（glow），Bold CJK 小字号糊感明显 → **dark 下 <24px 的 CJK 禁用 ≥550 档**（与现阶梯无冲突：小字档均 ≤540；标题层 ≥24px 两态皆可 Bold）。
- **跨平台口径**：macOS（PingFang 原生多档）/Android（Noto）出现的中间档差异按渐进增强处理，设计稿与验收一律以"两态最小公分母"为准；本结论实测范围仅 Windows+Chromium（Firefox 未测，如实注记）。
- 选项 B（CJK VF subsets 白名单）**不入本版**；若未来立项，限 hero 级孤立大字（设计判断详见 L-3 走查消息），不并入常规阶梯。

### 3.5 中文与时间口径（三期重定义，站主 seq=841 D-4）
- **「中文优先」的唯一含义=数据层**：①新闻条目标题/摘要以中文呈现（继承一期 R17 资讯中文-only 既有裁定）；②全站日期/时间展示统一北京时间（UTC+8），渲染层由 UTC 入库值 +08:00 转换，显示口径须可量测核对。
- **版面上中英文比例不作要求**：文案语言形态（含导航字面、$ 命令制式、标签语料）归设计裁量，不设中英占比判据；历史 7:3 比例、首屏英文功能词=0 等口径自三期起作废，不得进入验收单。
- CJK 渲染技术条款（§3.4）不受本节影响，继续有效并随字体资产变化复核（见附注）。
- 附注（主笔诚实标注）：§3.4「CJK 无 wght 轴两态公分母」的事实基线建立在系统回退字体（雅黑）上——F1 落地 Noto Sans SC 可变子集自托管后，正文中文段将有真实 wght 轴，§3.4 部分禁则（字重上限 600/两态吸附）可能放宽。此节不在本次契约稿预改：等 F1 合入后以实测复核为准（红线=契约不写未实证事实），参数供数归设计（D2 03 册已预留）。

## 4. 动效契约（现状 A1-A6 固化 + 二期 A7-A10 立项口径）

| # | 动效 | 参数 | 降级（必测三列） |
|---|---|---|---|
| A1 | 站名字体呼吸 | wght 400↔640，14s，仅 D 端拉丁 | M 端透明度微呼吸；reduce 停 |
| A2 | 条目入场 | scroll-driven `view()`，transform-only（防低对比冻结位，BUG-M4R-04 条款） | 不支持=静态可见；reduce=none |
| A3 | 页面切换 | View Transitions 200ms cubic-bezier(.33,1,.68,1) | reduce 同帧替换 |
| A4 | hover/focus | 色 120ms、箭头位移 160ms | 无 hover 设备不依赖悬停 |
| A5 | ⌘K 面板 | 遮罩 120ms / 面板 180ms cubic-bezier(.16,1,.3,1) | reduce 无动画 |
| A6 | 滚动书脊 | 2px accent，scroll(root)，D 端 | 不支持/reduce 隐藏 |
| A7(新) | 筛选/列表交叉淡入 | 复用 A3 参数，same-document | 同 A3 |
| A8(新) | 中文标题呼吸 | **先 spike**：CJK 回退字体无 wght 轴，装机率实测后定立项 | 静态恒可见 |
| A9(新) | 书脊章节感应 | 经 §编号区块微加粗 | 同 A6 |
| A10(新) | 404/空状态微动效 | ≤2 属性动画 | reduce 静态 |

铁律：**零新增 JS 运行时、全部三列降级（reduce/特性不支持/无 JS）为验收项**。

## 5. 组件基线与现有 theme.css/global.css 差异清单（前端评审焦点）

### 5.1 现状类清单（保留，语义不变）
`shell` / `shell-wide`、`tab-bar`+`tab-item`+`tab-label`、`chip`+`chip-row`、`news-card`、`arrow-link`+`arrow`、`rank-blocks`、`row-num`、`brand-dot`、`tagline-line`、`spine`、`scroll-rise`、`enhanced-only`、`ask-slot`、`palette-overlay/panel`、`clamp-2`、`zh-title`、t-* 七档、打印条款。

### 5.2 需变更（本次统一 + L-1 前置，theme.css 落地由前端执行）
1. 暗色 `--c-accent: #5eead4` → `#ff7b81`；`5eead4` 全仓 grep 实测仅 theme.css L49 一处（accent 均走变量），单点替换。
2. 新增亮色 `--c-accent-strong: #c93a3f` + `@theme` 注册 `--color-accent-strong`（R-C3 用）。
3. 暗色块从 `@media (prefers-color-scheme: dark)` 重构为三态结构（L-1 前置）——**已按前端评审细则定稿**：
   - 显式档：`:root[data-theme="dark"]` / `:root[data-theme="light"]`；
   - 系统回退块写成 `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }`（`:not` 与显式 light 零冲突，不依赖优先级论证）；
   - L-1 预绘脚本首绘即解析 system 并挂**显式** `data-theme="dark|light"`（auto 也写实际值），仅无 JS 用户留在 media 回退路径；
   - 暗色 token 因此存在于两个块（media 回退 + 属性），**成对修改，以 `/* SYNC:dark */` 注释标记两处**，改色必同改（前端在 theme.css 落实，设计验收检查项）。
4. `--c-accent-ink` 语义收窄：仅"accent 底上的字"；反色行（palette 选中，CommandPalette.astro:71）改 `bg-ink text-bg` 对（--color-bg 已注册，无新 token），避免 R-C3 歧义。

### 5.3 待新增组件（二期，视觉零膨胀原则）
| 组件 | 服务任务 | 契约要点 |
|---|---|---|
| `ThemeToggle` | L-1 | header 桌面+tab 移动+⌘K 命令注册；图形件，不占 accent 预算，控件 44px |
| `PageHeader`（§编号+h1） | 全站 | 固化 `§0x / en` t-label + zh-title h1 节奏，news/about 现手写样式的抽取 |
| `NewsCard` | L-3/L-4/L-5 | 含已读态（见 5.4）；整卡可点、focus-visible 边色 ink |
| `VitalsCard`（工程状态卡） | L-4 | mono 语言复用 rank-blocks 图形；"源健康"用 ink-muted/faint 分级，异常**不用品牌 accent 报警色**（防与品牌色混读），使用**双模式 `--c-warn`：暗 #ffa94d（10.22:1@bg / 9.43:1@surface）/ 亮 #b45309（5.02:1@surface / 4.81:1@bg）**，见 §7 复测；warn 语义色不占 accent 预算（R-C6） |
| `SectionTitle`（row-num 前缀） | 全站 | `01/` 编号恒 ink-faint |
| 404 终端页 | L-2 | 复用 ask-slot 虚线语言 + 四页出口 |

### 5.4 交互状态契约（L-5 已读/进度 + 无障碍补票）
- 已读卡片：标题转 `ink-muted`、编号保持 faint——**不用删除线/透明度<1 作状态**（对比度地板 4.5 保持）。
- 阅读进度：复用 A6 书脊，不新增第二进度件。
- ⌘K 空结果："未找到 …"占位行（ink-muted，listbox 内 role=option 禁），修一期遗留。
- chip 筛选加 `aria-live=polite` 结果计数播报，修一期遗留。

## 6. 测试可采集基线矩阵（T5 视觉回归口径，设计签字点）

- 维度：主题三态（light/dark/system×系统）× 4 页 + 404 × 状态（默认/hover/focus-visible/reduced-motion/无 JS/200% 缩放）。
- 重点断言：暗色新 accent 下焦点环可见、chip 激活态指示条、spine、brand-dot、反色行文字 ≥4.5:1（值见 §7）。
- L-2/L-3 完成时**统一色后观感走查由设计签字**（分派卡 L-3 验收条款）。

## 7. 对比度复测记录（2026-10-26，WCAG 2.x 相对亮度公式）

```
7.78:1  #ff7b81 on #0b0d11   (暗 accent：图形件/文字全档 ✓AAA)
7.18:1  #ff7b81 on #14171d   (暗 accent on surface ✓)
7.78:1  #0b0d11 on #ff7b81   (暗 accent-ink ✓AAA)
8.60:1 / 7.94:1  #ff8a90 备选两底
5.76:1 / 5.32:1  #f2555a 备选两底（仍过 4.5）
6.69:1  #ff7076 on #14171d
3.74:1  #e5484d on #fafaf8   (亮 accent 图形件 ✓≥3)
3.91:1  #e5484d on #ffffff   (同上 ✓)
3.91:1  #fff on #e5484d      (<4.5 → R-C3 限制成立)
5.05:1  #fff on #c93a3f      (accent-strong ✓AA → R-C3 解)
6.29:1  #fff on #b32d31      (更保守备选)
17.46 / 7.64→7.05 / 5.11→4.71  暗 ink 三档复核 ✓
17.33 / 6.51 / 4.90→5.12      亮 ink 三档复核 ✓
--
warn 档（前端评审必改项，设计侧已独立复算确认，2026-10-26）：
1.90:1 / 1.82:1  #ffa94d on 亮白底/bg —— 亮色不可用（必改项属实）
5.02:1 / 4.81:1  #b45309 on #ffffff / #fafaf8  ✓AA → 采纳为亮 --c-warn
5.50:1 / 5.26:1  #a8500a 备选（更保守，未采纳：明度阶与暗档一致性略差）
3.87:1 / 3.57:1  #b45309 on 暗底（不用于暗模式，记录备查）
10.22:1 / 9.43:1 #ffa94d on 暗 bg/surface → 采纳为暗 --c-warn
```

复测结论：**暗色 #ff7b81 达标（P-2 验收线 ≥AA 通过），亮色基线无需变动，仅需新增 accent-strong 一档。** 品牌色统一在无障碍上无妥协成本。

## 8. 开放项（不阻塞评审）

1. `#ff7b81` 偏粉倾向的外观确认建议站主在三态切换 L-1 demo 里直观看（备选 #f2555a 更"正统红"，两档都已过关，改值不引发返工）。
2. A8 spike 结论回收后补 §4 表行。
3. V3 画布（N-3）色板由本 token 派生（双模式各一套，种子确定性），视觉方案单独出，不在本契约展开。

— 设计 出品；评审通过后前端按 §5.2 清单落 theme.css，本文件随 P-1 归档流并入仓库 docs/DESIGN.md。
