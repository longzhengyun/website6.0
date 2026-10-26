# website6.0 设计侧交叉验证报告（M2 分支符合性审查）

审查人：设计｜2026-10-23｜方式：只读审查，未改任何代码
对象：E:\Jary\github\website6.0 分支 feat/website60-m1m2-20261023（含修复提交 fa80c64，工作区干净）
基线：shared/website6.0-impl-design-spec.md v1.0

## 0. 结论一句话

整体高度符合 spec；发现 **2 条中等级偏差（建议 M2 门禁内处理）+ 若干低等级观察项**，无新增阻断级缺陷。命令面板 S 级缺陷确认已由 fa80c64 修复（`set:html` 写法，CommandPalette.astro:37）。

## 1. 符合项（逐项核对通过）

| spec 条款 | 证据位置 | 说明 |
|---|---|---|
| §2.1 色彩 token 双模式全值 | src/styles/theme.css:27-51 | 8 组 token 与 spec 表逐值一致；`color-scheme` 声明到位 |
| §2.1 焦点环 | src/styles/global.css:136-140 | `:focus-visible` 2px accent + offset 2px，全站生效 |
| §2.2 七级字号阶梯 M/D | theme.css:53-113 | 字号/行高/字重/mono 字距全对齐；`zh-title` 中文上限 600 落实（:116-119） |
| §2.4 栅格断点/版心 | theme.css:121-144 | 20/24px 页边距、720/1080/1280 版心（border-box 计内衬，等效正确） |
| §6.2 底部 tab 条 | theme.css:146-172 + TabBar.astro:7-31 | 56px+`env(safe-area-inset-bottom)`、z-40、`tab-item` ≥44px、md 隐藏；main 有 pb-24 避让（BaseLayout.astro:55） |
| §3 L1 双语叠印结构 | src/pages/index.astro:15-28 | 桌面 `jary8·佳瑞网`（accent 中点）；移动两行制+accent 下划线 |
| A1 呼吸 | global.css:10-44 | wght 400↔640、14s、仅桌面拉丁元素；reduced-motion 停 wght 500；M 端透明度微幅 |
| A2 入场 | global.css:46-67 | `view()` + `cover 0% cover 35%` + `@supports` 静态兜底 |
| A3 转场 | global.css:213-218 + BaseLayout.astro:37 | ClientRouter + 200ms `cubic-bezier(0.33,1,0.68,1)` |
| A4 | global.css:104-126 | 颜色 120ms/箭头 160ms，`(hover:hover)` 守卫 |
| A5 面板 | global.css:185-211 + CommandPalette.astro:13-35 | 遮罩 ink/40%、下沉 8px、180ms 贝塞尔、reduce 关动画；焦点圈闭、aria-modal、Esc 均在 |
| A6 书脊 | global.css:69-102 | 2px accent `scaleY` `scroll(root)`、D 端限定、pointer-events:none |
| §6.1 胶囊 | global.css:150-173 | gap 12px、min-height 44px、0 圆角、横滚+mask 渐隐+藏滚动条 |
| §6.4 输入条款 | CommandPalette.astro:22-32 | `style="font-size: 16px"`、`enterkeyhint="search"`、`autocomplete` 显式 |
| §4.4 打印 | global.css:227-258 + resume.astro:54-118 | 白底黑字、隐藏导航/tab/spine、关动效、`resume-section break-inside: avoid`、`data-print-url` 外链打印展开 |
| 红线：主导航无「简历」 | src/data/site.ts:11-15 | nav 仅 Home/News/About；简历走页脚(SiteFooter.astro:8-13)/About 内链(about.astro:82-87)/⌘K/返回链 |
| §4.2 News 版式 | news.astro:41-57 | D 端 3fr/1fr≈0.75/0.25 双列、meta 竖排 mono、每条仅标题+简介+直跳（`target=_blank rel=noopener` news.astro:36-38） |
| §4.3 About 条款 | about.astro:22(34em 行长), 33(M2/D4 技能网格), 74-77(实验位静态装饰+标注) | |

## 2. 偏差清单

### 中等（建议 M2 门禁内修复，改动极小）

**B1｜accent 每屏 ≤3 处规则被打破**（spec §2.1）
- global.css:105-109：`.arrow` 常态即为 accent——首页 3 卡+1 链、News 每条目各 1 个 ↗，单屏 accent 出现 ≥4 处；
- global.css:176-180 + about.astro:38-44：技能熟练度方块 filled 用 accent，4-8 卡同屏；
- about.astro:60：时间线每期年份 `text-accent`，3 条即 3 处起步。
修复建议：`.arrow` 与 `.rank-blocks` 改 `color: var(--c-ink-muted)`（hover/pressed 才转 accent）；时间线 period 改 `text-ink-faint`（当前态可保留 accent 最多 1 处）。

**B2｜内联文字链接触控命中区 <44px**（spec §6.1，移动为一等验收项）
- SiteFooter.astro:8-27（在线简历/GitHub/邮箱三链接）、SiteHeader.astro:19-29（桌面导航项）与 :10-16（wordmark）：inline 文本实际高度约 21-33px，未做命中区扩展；about.astro:82-87 简历内链同理。
修复建议：给这类链接加 `inline-flex items-center min-h-[44px] px-2`（或 `::after` 绝对定位铺满），视觉不变更即可达标；resume.astro:13-19 返回链已是 44px 正例，照此统一。

### 低（记录在案，可 M4 前顺手修或明确接受）

- L1 `.row-num` 类无 CSS 定义（index.astro:54、news.astro:44、about.astro:31,54 使用；styles 下 0 条规则）→ 编号未取 `ink-faint`，继承正文色。补 `.row-num{color:var(--c-ink-faint)}` 一行即可。A6 条款后半段「编号随视口中心转 accent」未实现——建议明确列 P2，不算 bug。
- L2 global.css:57-59：`.scroll-rise` 基础 250ms 入场动画未包 `prefers-reduced-motion: no-preference`——reduce 用户仍有一次性淡入位移（spec 要求直接可见）。
- L3 global.css:213-218：A3 View Transitions 无 reduce 降级（spec：同帧替换）。补 reduce 下 `::view-transition-old/new(root){ animation: none }`。
- L4 global.css:186-191：A5 遮罩 120ms 淡入缺失（面板有、遮罩瞬间出现）。观感项。
- L5 index.astro:15：M 端 hero 未设最小 60vh（spec §4.1，现靠 24vh 顶留白+内容撑开，375px 短内容时屏占比不足）；M 端「佳瑞网」继承 display 3rem（spec 2.25rem）；M 端 jary8 mono 用 t-label 0.75rem（spec 0.875rem）。均为标度小偏差，无折行/遮挡风险，前端可二选一：按 spec 调或报我确认改 spec 增量。
- L6 about.astro:38-44：等级空位用 `·`（spec 示例 `□`）——语义等效，接受即可，记录差异。
- L7 观察：Resume 页 bare 布局（resume.astro:11）无底部 tab 与 ⌘K 入口（键盘 ⌘K 仍可用）；打印按钮 enhanced-only，无 JS 时靠系统打印菜单，均可接受。

## 3. 汇总建议

B1/B2 由前端各一次小提交解决（合计改动 <10 行 CSS/类名），修后我复看即可；L 系列不阻塞 M3。设计侧交叉验证到此完成。
