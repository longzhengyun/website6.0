# website6.0 可执行验收清单 + 证据模板（测试侧，v1.7.1 — 出口批次全绿 + M4R-05 撤销（探针假阳））

作者：测试 ｜ 日期：2026-10-23 ｜ 状态：可直接执行（M4）
v1.7.1 变更（探针修复复验轮 2026-10-26，EV/website6.0-exit-ctfix-rerun.txt + 报告 §4 Addendum）：
- **BUG-M4R-05 撤销、出口批改判 7/7 通过、BUG-M4R-01 关闭**：原 light 6 组"违例 4.36"系测试探针 lum() 幂项误用 ^2.2（WCAG 2.1 规定 ^2.4），比值系统性偏低致假阳；修复后标准口径 CT2-* 全 16 组（light/dark×双视口×四页）违例=0。锚点自检 5/5（#767676@#fff=4.542、黑@白=21、#6A6E76@#FAFAF8=4.895、@#fff=5.116、#7B8394@#0B0D11=5.108——设计/项目复算值全部吻合）。归因更正：非 blue-only（权重齐全），2.2 加权 L=0.1813 与 lin₂.₄(118)=0.1812 撞值系巧合，设计 seq=493 与项目 seq=497 的通道归因不采信、数值结论采信。
- axe incomplete 更正：color-contrast incomplete 仅涉装饰性 span[aria-hidden]，ink-faint 节点 axe 标准口径本就可判且通过；AC-G04/AC-M21 双模式**通过**。
- §8.8 兜底条款（#666A72）不触发；前端批六取消确认；resume"4.54 临界"观察项作废（标准 5.12）。
v1.7 变更（出口批次 EXIT-20261026-01，基线 d02de29/Deploy 40261073455，报告 shared/website6.0-impl-test-exit-batch.md）：
- **出口批 7 项判定完成**：②axe 四组合、③AC-R15/16 全条款、④BUG-M4R-04 关闭、⑤news-perf（desktop 0.95/LCP 774ms；mobile LCP 4 轮全≤2.5s、perf 多数轮≥0.90，remedy 不触发）、⑥R18/R19、⑦设计走查证据 全部通过；OVF/R17 数据面（122 条/noopener/CJK/P04-fresh）回归通过。R17-03 主探针日粒度假阳性已按 published_at 全时间戳补证 PASS（DOM 序==源序一致）。
- **①contrast 全样本发现新违例 → BUG-M4R-05(S)**（**注：本条已被 v1.7.1 撤销，系探针 ^2.2 口径假阳**）：light 模式 `--c-ink-faint:#6a6e76` 落 body `#FAFAF8` 实测 **4.36:1 < 4.5**（index/news/about 三页 6 组违例，节点=© 2026 Jary、nav 02/03 序号、about row-num、data source 行、⌘K 提示；fs 12–13px fw 500）。**AC-G04/AC-M21 light 面维持 fail**；dark 8 组全过、resume light 4.54 临界过（观察项）。裁决注记：axe 因背景归因失败将 color-contrast 计入 incomplete 不判（violation=0 非免罪证据，实测计算为准，见报告 §2 与 EV/website6.0-exit-contrast-diag.txt）；设计申报 4.90@#FAFAF8 系算术错误（4.54 是对 #fff）。修复面=单 token 亮色值（AA 参考锚点 ≤#666a72→4.61），设计裁定→前端实施→测试同口径复验；BUG-M4R-01 与之同面续挂不关闭。
- **BUG-M4R-02/03/04 线上关闭实锤**（underline/axe 零 serious、R16-05 @200% 全池 0 违例、rise-shift transform-only 底缘带 opacity=1）。
- 残余风险更新：AC-R15-04 元素守恒无基线未执行；AC-R17-04 空态不可构造；真机/4G 由本机节流轮替代；news long task 790~877ms 观察项；LLM ai 模式待门禁②。news-perf 已由测试本机 Lighthouse 12.8.2 完成，**无需 devops 补官方轮**（seq=460 约定仅本机不可行时转）。
v1.6 变更（复验报告 shared/website6.0-impl-test-m4-reverify.md + 项目裁定 cmsg_01m5m2bxxmc3k58qajw6ewb0zv seq=280）：
- **BUG-M4-01/02/03 复验关闭**：822e3d5 线上复跑全绿——溢出矩阵 375/390/430×四页 sw==cw 零离屏 leaf、tab 条各项在视口内（含 200% 缩放态）、chip-row 容器内滚（526px 内容/ovfX:auto）符合 spec §6.3、200% 缩放四页无溢出、36 条命中/倒序/noopener 全过、Network 30 请求白名单外零外部。
- **新增未通过（axe 首扫+独立实测色值双口径互证，非回归——首轮未跑 axe）**：**BUG-M4R-01(S)** 必读信息大量使用 ink-faint #8B9098（日期/来源/标签，实测 2.81:1@#FAFAF8、2.93:1@#fff，12–13px）违反 AC-G04 双重口径（AA<4.5 + "ink-faint 不用于必读信息"禁用规则）；主导航激活态 tab 朱红 #E5484D 3.69:1 且 12–13px 小字朱红违反"正文级小字无朱红"。**BUG-M4R-02(A)** 正文内 arrow-link 仅靠颜色区分（axe link-in-text-block serious，WCAG 1.4.1）。挂 AC-G04/AC-M21/AC-M19/AC-CI04 fail。
- AC-G05/M14 Lighthouse：devops 正式轮进行中——index 已落盘 A11y=0.91(<0.95 不达标，color-contrast/link-in-text-block score=0 与 axe 互证)，Perf 0.99/BP 1.0 达标；news/about/resume 待其补齐后引用，不重复跑。
- **R15/R16/R17 并入**（全文见 shared/website6.0-impl-product-acceptance-v1.6-r15r17.md，测试侧执行映射）：
  - AC-R15-01~06：**前端 M4.1 交付后验收门禁**（1280×720/375×667 单屏 scrollHeight≤视口×1.10、移动首页无新闻节点、桌面动态条≤64px、AC-R15-05 横向溢出回归同法复跑、禁 overflow:hidden 裁切作弊）。AC-R15-01 简历暗线按项目裁定①=页面级可达（/resume 存在+About 内链+⌘K 可达即合规）。
  - AC-R16-01~06：M4.1 后执行；D02 Network 口径不因 R16 回归（R16-01）、reload×8 ≥3 种副标题（R16-02，概率口径 confidence=high 上限）、副标题 CLS 贡献=0（R16-03）、禁 JS 首条+池 ≤20 全角字不破版（R16-05）、新增 JS≤2KB gzip（R16-06）。
  - AC-R17-02/03/04/05：当前可执行（降级口径），随 M3 管线后续产物批次跑；AC-R17-01 属 ai 模式，并入 F 组 Blocked(等 key)。
- **v1.6 执行注记①（项目 seq=318，抽验踩坑实证）**：news.json schema **无 `title` 字段**，条目结构=title_original + title_zh + summary_zh；AC-R17-01 与所有 CJK 断言必须打在 **title_zh/summary_zh** 上，打错字段会全量误判（93/93 假阴性先例）。D/F 组既有 CJK 类断言一并复核口径。
- **v1.6 修复批复验注记（测试 2026-10-23，批次 M4R-0203-verify-20261023-01，报告 shared/website6.0-impl-test-m4r-0203-verify.md）**：deploy 39941469030 已含 5b44c64+38eab9d → 四步中的 ③（375@200% 全池 12 条 right=355≤375 全过）与 link-in-text-block axe 四组合=0 **线上通过，BUG-M4R-02/03 关闭**；underline 作用域实测 main 内=underline、品牌=none、news 整卡豁免复核成立；回归 OVF/单屏/CLS/D02 全绿。剩余方差面=①contrast-measure 全样本+②axe 零 critical/serious 压 **批三+BUG-M4R-04 修复上线**后执行（注：本批复验时线上已是 38fa315 代际——C42_XXv7.css 含 #6a6e76/#7B8394、#8B9098 零命中，色值类 index 双视口违例 0；/news 仅剩 6/7 serious=新判 **BUG-M4R-04(A)**：.scroll-rise `animation-timeline:view()` 静止低透明度致底缘带卡片必读文本 1.42~3.83:1，根因 ce044ee 引入、修色后裸露，reduced-motion 兜底=0，AC-G04 /news 维持 fail 挂新号，详见报告 §2A），与 AC-R15/16 出口判定+news-perf 检查点同批，不拆轮。观察项：index 动态条 1 条 arrow-link 命中下划线待设计走查；边缘缓存窗口（旧 HTML 引用已删 CSS ≤600s）非部署撕裂。
- **v1.6 修复批挂账（前端 seq=350，未部署不判修复）**：BUG-M4R-03=本地 5b44c64、BUG-M4R-02=本地 38eab9d（feat 链 …7136190→5b44c64→38eab9d，未 push）；BUG-M4R-01 等设计 design-spec v1.1 §9 裁定（seq=349，含 tagline-line 涉事点）后实施。**测试复验触发条件=devops 叠推+deploy 绿**，届时按线上口径四步跑：① contrast-measure（含新增 .tagline-line 选择器）② axe 四组合零 critical/serious ③ 375@200% 全池条目复现集 right≤lim ④ CLS<0.05 且 tagline 零贡献；与 AC-R15/16 出口判定+news-perf 检查点同批。
- **v1.6 预检记录（M4.1=65a9880 线上，报告 shared/website6.0-impl-test-m41-preflight.md）**：R15 条款（AC-R15-01 单屏双视口、R15-02 动态条 58px/两项/移动整块移出 DOM、R15-05 溢出回归、R15-06 reduced-motion）与 R16 大部分（池 12 条内联、reload×8=6 种、CLS 0.0081、D02 零外部）**预检 pass**；**AC-R16-05 移动 200% 缩放档 fail → 新缺陷 BUG-M4R-03(A)**（tagline nowrap 固定行盒，≥14 全角字段语 @200% 裁切离屏 right=399~426>375，@100% 正常；12 条池多数条目可触发）。出口判定仍与 BUG-M4R-01/02 修复+PAT 回写同批。
- **v1.6 执行注记②（产品 seq=316 裁定，news-perf 硬检查点）**：Lighthouse news 页 perf 0.71/LCP 3.89s（devops 正式轮 M4-online-20261023-02）本轮记观察项、不阻塞；**检查点=「M4.1 合入 + NEWS_SYNC_PAT 回写打通」后的复验窗口实测，perf≥0.90 且 LCP≤2.5s 过线，未过线即转修复项（owner 前端），预案已锁死=首屏限 N 条+分页/"加载更多"（约束：不破 AC-R17-04 空态/AC-P04≥5 条/AC-R15-05 溢出回归/D02 零外部，纯 CSS/原生 JS）**。随 AC-G05 执行、与 BUG-M4R-01 同批复验不拆轮；Q14 契约不豁免，最终不达需站主明示知情。前提修正：R17 回写后 feed 更长（93 条全 zh），数值不会自然好转。
v1.5 变更（M4 线上首轮，报告 shared/website6.0-impl-test-m4-online.md）：
- AC-AI-D02 Network 完整断言线上 **pass**（31 请求全同源零第三方）；AC-AI-D01/D03/D05 线上重验 pass（28 条渲染/倒序/noopener/时间戳）。
- 新增未通过：**BUG-M4-01(S)** /news 移动横向溢出 sw=546（.chip-row 未约束宽度）；**BUG-M4-02(S)** /news tab 条被顶宽 ⌘K 离屏（疑 01 派生，修复后复测）；**BUG-M4-03(A)** 200% 文字缩放四页溢出（M-A5/WCAG 1.4.4）。AC-M01/M-A5 对应条款判 fail 挂缺陷号。
- AC-CI04/G4 Lighthouse：**blocked**——本机无 CLI、CI 无 lhci job（两 workflow grep 0 命中），需开发运维补位或人工取证。
- P05 footer-nav 误圈口径修正记录：禁字区提取必须排除 `aria-label="页脚导航"` 的 nav 节点（线上首轮 3 个假阳性由此来）。
v1.4 变更（D 组解冻分派 cmsg_01m5kmrg4303psz20pap1ap8sa 执行完毕，报告 shared/website6.0-impl-test-dgroup-local.md）：
- **D 组 seed 豁免口径全部解除**：对象=f9b9367（前端 news.ts import 已切 './news.json'，实测确认）。AC-AI-D01/D03/D04/D05 本地全量 pass；AC-AI-D02 本地半段 pass（dist 静态扫描零第三方请求），完整 Network 断言仍等 M4 部署地址。
- AC-AI-D04 校验目标 env 变量名以代码为准更正：实际=`LLM_API_KEY`+`GEMINI_MODEL`（provider 固定 Gemini，`LLM_PROVIDER` 不存在；后端 §6 原口径引用更正）。
- §6 待办 2（M3 切换点核验+D 组全量在 M4 前复跑）关闭。
v1.3.1 变更：AC-P05 禁字区域明确为 header/tab bar；⌘K 面板按产品 IA 属允许的暗线通道，面板含简历条目不算违规（M3 核验中发现原表述会误伤，据 website6.0-proposal-product.md §2 导航条款澄清口径）。
v1.3 变更（响应项目裁定消息 cmsg_01m5khymw32e5h8mpn9y24w42y，后端差异裁定 1/5/6 条落实进 D 组）：
- **D 组数据锚点分两阶段**：M3 管线迁入前，`src/data/` 下只有占位文件 **news.seed.json**（mode 三态 seed|degraded|full 属 seed 占位设计，**不参与 schema/D 组数据真实性断言**）；M3 起管线为唯一写者，生成契约一致的 **news.json**（mode 仅 ai|rss_only 两值，落盘前 schema 校验内置），D 组数据类用例（D01/D05）按该契约文件执行。F 组不变；tags 7 值枚举、日期 RFC3339 随映射表 M3 生效（对验收口径无额外影响，AC-AI-F02/AC-AI-D01 校验目标即契约 schema）。
- seed 阶段（M2 门禁内）D 组可执行部分仅剩 UI 同构类：AC-AI-D03 对 seed 渲染仍有效（前端渲染层不感知模式）；AC-AI-D01/D05 在 seed 阶段记 N/A(等M3)，不计失败也不算通过。

v1.2 变更（响应项目消息 cmsg_01m5kgzadwyngwpvww9e9eq3ha，§6 待合并增量全部到盘）：
- 并入设计 spec v1.0（shared/website6.0-impl-design-spec.md）§6.1/6.2/6.4 移动条款与触控基准值 + §2.1 token 表。**对比度条款保留实测方法、不照抄数值**（spec 自标"ink-muted 双模式需实测复核"）。
- 并入 devops workflow（shared/website6.0-impl-deploy-pages.yml / website6.0-impl-news-pipeline.yml）：AC-CI05/SEC02/SEC05/SEC06/REL01 的审查检查点已具体化；正式审查对象为建仓后 `.github/workflows/` 内实际文件。
- 并入后端管线契约（shared/website6.0-impl-backend-pipeline.md + news-schema/sources/prompt）：news.json 路径定稿 `src/data/news.json`（与 workflow grep 一致），AC-AI-D/F 组核验锚点落定（schema 字段、7 词标签枚举、降级矩阵、"上次构建时间"注入）。
- 移动端导航形态按 spec 定稿更新：M 端为**底部常驻 tab 条**（56px+safe-area，Home/News/About/⌘K），不用抽屉/汉堡（AC-M07/M12 口径随之调整）。
- "较严者为准"规则由 spec 数值落实关闭：产品 M 系列阈值（44px/8px/16px）与 spec §6.1 一致，spec 更严的增量（胶囊 gap 12px、列表项内禁嵌套第二可点元素、行长 ≤42 汉字、输入框 ≥16px 防 iOS 聚焦放大）已并入对应 AC。

来源输入（全部可溯源）：
- shared/website6.0-proposal-overview.md §2.6 + §2.3 + 裁定结果
- shared/website6.0-proposal-backend.md §1.2 / §5（红线 4 条）；website6.0-proposal-product.md §5
- shared/website6.0-impl-product-mobile-acceptance.md（M-A~M-E）
- shared/website6.0-impl-design-spec.md v1.0；website6.0-impl-deploy-pages.yml；website6.0-impl-news-pipeline.yml
- shared/website6.0-impl-backend-pipeline.md + website6.0-impl-news-schema.json / news-sources.json / news-prompt.md
- shared/website6.0-adr.md ADR-002/003/004；website6.0-impl-product-scope-v1.2.md；website6.0-impl-product-brand-copy.md
- 项目分派/同步消息 cmsg_01m5kgpnccefgg1vyjrh2trvwf、cmsg_01m5kgwckmsagkdcmhvwr0mdw7、cmsg_01m5kgzadwyngwpvww9e9eq3ha

## 0. 使用说明

- **执行时点**：AC-* 除标注 M6/M3-F 外，全部在 M4（`https://longzhengyun.github.io/website6.0/` 路径地址）执行；M6（换绑后 `https://www.jary8.com`）仅复跑 AC-G01 / AC-M01 / AC-CI-* 冒烟 + 双地址对拍。LLM key 到位前 D 组正常执行、F 组记 Blocked(等 key)，不计失败。
- **环境基准**：Chrome 最新稳定版；视口 375×667（基线）+ 390×844 / 430×932 + DevTools device emulation + 真机（iOS Safari、Android Chrome）至少各 1 台；网络 Fast 3G/4G 各跑一轮；Lighthouse 走 CI 或本地 CLI（移动端模拟）；Node 以 .nvmrc 为准（24.19.0，E:\Jary\github\.tools）。
- **阻断级别**：`S`=硬阻断；`A`=功能阻断（该条记"未通过"，不掩盖其它结果）；`B`=建议项。
- **判定基准值来源**：移动/触控/排版阈值以设计 spec v1.0 §2/§6 为准（已与产品 M 系列取较严者合并）；设计 spec 若走 v1.1+ 增量修订，测试同步更新对应 AC 并注明来源版本。
- **对比度原则**：spec §2.1 的比值是"设计侧预估"，验收只认**实测**（方法见 AC-G04/M21），不照抄表内数值作为通过依据。
- 共 59 条：§1 全局 7 ｜ §2 页面 9 ｜ §3 移动专项 21 ｜ §4 CI/安全/AI 双态/部署 22。每条必落证据（§5），无证据的"通过"不计入清单。

## 1. 全局与可访问性（源自 §2.6 + 产品 G1-G5）

| ID | 验收条款 | 执行方法 | 预期（通过条件） | 级别 |
|---|---|---|---|---|
| AC-G01 | GitHub Pages 与 jary8.com 双地址 HTTPS 可访问，无混合内容告警 | 分别请求两地址全 P0 页（/ /news /about /resume），记录状态码；Console+Network 查 mixed-content | 全部 200，证书有效，无混合内容告警。M4 阶段 jary8.com 记 N/A(门禁M5)，不记失败 | S |
| AC-G02 | 375px 与 1440px 核心页面无横向滚动、无内容遮挡 | 四页 × 两宽度：`scrollWidth <= clientWidth` + 目视截图 | scrollWidth==clientWidth；无遮挡；每页每宽度各 1 张截图 | S |
| AC-G03 | 键盘全站可达、焦点可见、焦点双通道（颜色+轮廓） | 仅用 Tab/Shift+Tab/Enter/Esc 完成四页导航、⌘K 开合、新闻筛选与胶囊切换（spec 要求 Tab 到每个胶囊 Enter 切换）、折叠区展开；跳过链接有效 | 无键盘陷阱；焦点环全部可见（`outline 2px + offset 2px`，实测对比度≥3:1） | S |
| AC-G04 | 对比度 WCAG AA 实测：正文≥4.5:1、大字/图形≥3:1，亮/暗双模式分别验。**不照抄 spec §2.1 数值** | 取实现后主题文件（theme.css @theme）实际色值，对 bg 逐 token 计算：ink/ink-muted/ink-faint/accent 文本；重点复测 ink-muted 双模式（spec 自标需复核）与朱红按钮 accent-ink；验证禁用规则落地：正文级小字无朱红、ink-faint 不用于必读信息 | 全部实测≥阈值；违规组合（如小字朱红、必读 ink-faint）判 fail 并列复现选择器 | S |
| AC-G05 | Lighthouse 移动端：Perf≥90、A11y≥95、BP≥95 | Lighthouse CI 或 CLI 移动端模拟跑四页（与 AC-M14 同源） | 四页三项全部≥阈值；报告 JSON 存档 | S |
| AC-G06 | 首页 LCP<2.5s（4G 模拟，§2.6 全局条款；<1.5s CI 门禁见 AC-CI02） | Lighthouse 移动端模式测首页 | LCP<2500ms；CI 口径同时留档 | S |
| AC-G07 | 主题双模式跟随系统（spec：prefers-color-scheme 驱动，无强制手动切换器） | 切换 OS prefers-color-scheme 检查四页 | 无错色、无未适配区块；不存在与裁定相悖的强制切换 UI | A |

## 2. 页面内容条款（源自 §2.6 + 产品 H/N/A/R/AI + scope v1.2 + 设计 spec §4）

| ID | 验收条款 | 执行方法 | 预期 | 级别 |
|---|---|---|---|---|
| AC-P01 | 首页首屏仅站点名（L1 双语叠印：桌面 `jary8·佳瑞网` display 行；移动两行制）+ 身份一句话（默认 C1「把浏览器能做的，做到最新」，站主换组不改口径）+ 单一视觉焦点（A1 呼吸仅作用 jary8），除站名与一句话外无按钮/图形 | 1440 与 375 首屏截图逐项目视 | 版式与 spec §3/§4.1 一致；H1 只验"站点名+身份表述存在且首屏极简" | S |
| AC-P02 | 首页到 News、About 一级点击可达 | 点击链路测试 | 一跳到达；href 正确 | S |
| AC-P03 | 新闻每条仅标题+简介（spec：简介最多 2 行 line-clamp）+日期/来源；整条点击新标签打开原文且 `rel="noopener"`；无图、无"阅读更多" | DOM 审查 a[target=_blank] 的 rel；抽点 ≥5 条 | 无正文/图片混排；全部 noopener；无硬约束外的冗余元素 | S |
| AC-P04 | 新闻列表≥5 条真实条目；示例数据须显式标注 | 逐条核对来源可点击、日期合理；与 news.json 字段对拍 | ≥5 条真实，或示例标注清晰 | S |
| AC-P05 | 主导航（D 端顶栏 + M 端底部 tab 条）不出现"简历/Resume"字样；简历暗线=页脚+About 内链（+⌘K——产品 IA 明确 ⌘K 为允许的暗线通道，面板内容含简历条目**不算违规**，v1.3.1 口径澄清） | grep 渲染后 DOM 的 header/tab bar 区 + 双视口截图 | 导航区零命中；暗线两处存在 | S |
| AC-P06 | 简历入口在页脚与 About 均可找到；`/resume` 打印为 PDF 排版完整（spec §4.4：print 白底黑字、隐藏导航/页脚/动效、`break-inside: avoid`、M 端手风琴默认展开不折叠） | Chrome 打印预览→导出 PDF；含移动 emulation 下打印 | 两入口均在；PDF 无截断、无导航噪音、ATS 复制友好 | A |
| AC-P07 | About 页含技能栈矩阵 + 履历时间线（spec §4.3：等级 5 格方块非百分比；「问站长」实验位未启用时渲染为静态装饰并标注） | 目视+截图 | 两区块完整；实验位不误报为可用功能 | A |
| AC-P08 | AI 功能任一失效时页面主内容 100% 可用、有兜底文案 | DevTools 断网/block 对应请求 | 主内容不受阻；兜底文案出现；无未捕获异常 | S |
| AC-P09 | 渐进增强底线：scroll-driven/View Transitions 不支持的环境"能用不丑"、内容静态可见（spec §7：不支持即降级完成，不算 bug） | Firefox 最新版跑四页 | 无布局崩坏、无不可交互区、列表始终可见 | B |

## 3. 移动端专项（一等验收项；产品 M-A~M-D 与 设计 spec §6 合并编号，来源列可溯源）

| ID | 来源 | 验收条款 | 执行方法 | 预期 | 级别 |
|---|---|---|---|---|---|
| AC-M01 | M-A1 | 375px 下四页无横向滚动、无内容溢出裁切 | 375×667 逐页 `scrollWidth==clientWidth` + 截图 | 全部通过 | S |
| AC-M02 | M-A2 + spec §2.2/6.4 | 正文≥16px（text-body 1rem）、无放大才可读的辅助文字；375 下行长 ≤42 汉字；输入框（⌘K 等）字号 ≥16px 防 iOS 聚焦放大 | DevTools 量取 computed font-size + 行长估算 | 达标；违反 spec 判 fail | S |
| AC-M03 | M-A3 + spec §2.2 | 首页站名 375 下不折行破相（display 48px「佳瑞网」`text-wrap: balance`）、不溢出视口；A1 呼吸仅拉丁 `jary8`，中文静态粗体；`prefers-reduced-motion` 下动画停中值/降级且内容完整可读 | 常规+reduced-motion 两态截图 | 两态标题完整、可读；中文无 VF 动画误用 | S |
| AC-M04 | M-A4 + spec §4.3 | About 时间线移动端垂直单列（左侧 mono 年份+细竖线）；长内容区可触摸滚动且不劫持全局滚动 | 375 下操作时间线区 | 布局符合 spec；无跨屏拖拽手势依赖 | A |
| AC-M05 | M-A5 | 视口允许用户缩放（禁 `user-scalable=no`）；文本缩放 200% 不丢内容 | meta viewport 审查 + DevTools 字体放大 200% 四页 | 无禁用缩放；200% 下内容与功能完整 | S |
| AC-M06 | M-A6 + spec §6.4 | 图片/媒体按视口响应；MVP 实现应为"除 favicon 与 inline SVG 箭头外无位图"——移动端流量与 CLS 双达标 | Network 面板审查请求清单 | 无位图原图加载；inline SVG 视觉 16px/命中 44px | A |
| AC-M07 | M-B1 + spec §6.2 | 移动端导航为**底部常驻 tab 条**（高 56px + `env(safe-area-inset-bottom)`，Home/News/About/⌘K 四项，非汉堡/抽屉）；导航直达全流程 ≤3 步 | 375/390/430 三宽度核对形态与步数；safe-area 模拟 | 与 spec 一致；≤3 步；当前路由高亮有 `aria-current` 语义 | S |
| AC-M08 | M-B2 + spec §6.1 | 所有可点元素命中区 ≥44×44px（视觉可小于命中区，padding/`::after` 扩展）；相邻可点元素间距 ≥8px；筛选胶囊间 gap 12px；列表项标题内禁止嵌套第二可点元素 | DevTools 量取命中盒（含 tab 条、胶囊、新闻卡内链、页脚链接） | 全部达标；嵌套可点判 fail | S |
| AC-M09 | M-B3 + spec §6.2 | 拇指区：高频操作（导航、⌘K、筛选、返回）在视口下半部可达区；低频（简历、邮箱、版权）留页脚正常流 | 375 热区图对照抽查 + 单手持握模拟 | 符合；不符记录实际位置供设计复核 | A |
| AC-M10 | M-B4 | 新闻整条卡片为点击热区（不只标题小字）；外链新窗口+noopener；按压缩态可感知、无 300ms 延迟卡顿 | 点击卡片空白/简介区验证热区；观察按压反馈 | 全卡可点；反馈可见（与 AC-P03 交叉） | S |
| AC-M11 | M-B5 | 简历暗线移动端可达：页脚 Resume 链接为合格触摸目标；⌘K 不可用（无实体键盘）时页脚/About 内链保底存在 | 375 下不使用键盘完成"首页→简历" | 不依赖实体键盘可达 | S |
| AC-M12 | M-B6 + spec §6.2/6.3 | 弹层焦点管理（按定稿形态适用于 ⌘K 面板：遮罩+面板，Esc/点击外部可关，焦点入输入框、关闭后归位）；底部 tab 条常驻无开合，验 aria-current 与不误触相邻项 | 触摸+键盘交替验证 ⌘K 开合各 3 次 | 焦点陷阱正确、A5 时序降级（reduced-motion 无动画直接呈现）不破坏焦点管理 | S |
| AC-M13 | M-B7 + spec A3 | 浏览器前进/后退在移动 Web 行为正常（View Transitions 不破坏返回手势/滚动位置恢复；reduced-motion 下同帧替换） | 移动端模拟下深滚→跳转→返回 | 滚动位置恢复、无白屏/错帧 | A |
| AC-M14 | M-C1 | Lighthouse 移动端 Perf≥90、A11y≥95、BP≥95（Q14 门禁，CI 同源复跑） | 同 AC-G05，独立留移动报告 | 全部达标 | S |
| AC-M15 | M-C2 | 4G 模拟首页 LCP<1.5s、CLS<0.05；首屏 JS≤150KB（gzip 口径以 CI 定义为准并写明） | Lighthouse 4G 模拟 + bundle 统计 | 全部达标（与 AC-CI01/02/03 对拍） | S |
| AC-M16 | M-C3 | 新闻管线降级模式在移动网络下不出现骨架屏长期停留；AI 标签筛选不可用时列表仍完整可用 | Fast 3G/4G 各加载 /news；block 标签数据复跑 | 骨架屏被内容及时替换；列表始终可用（与 AC-AI-D03 交叉） | S |
| AC-M17 | M-C4 + spec §6.4 | 无 hover-only 功能：hover 态信息一律有 `:focus-visible`/active 等价态；`@media (hover: none)` 下不出现依赖 hover 的提示文案 | 触摸模拟逐页遍历 + CSS 审查 | 无隐藏功能死角 | A |
| AC-M18 | M-C5 | 深浅色双模式在移动端系统切换时即时生效、无超 1 帧可感知闪白/闪黑 | iOS/Android 真机切换深色模式录屏观察 | 即时切换、无异常闪烁 | A |
| AC-M19 | M-D1 | axe 在移动视口跑一轮无严重违规（不只桌面） | axe-core @375 视口四页 | 无 critical/serious（与 AC-CI04 双口径） | S |
| AC-M20 | M-D2 | 折叠/弹层导航读屏可达：展开/收起状态有 ARIA 语义（aria-expanded）、Tab 顺序符合视觉顺序；tab 条当前项 aria-current | a11y 树审查（VoiceOver/NVDA 等效） | 语义正确、顺序一致 | A |
| AC-M21 | M-D3 + spec §2.1/§7.2 | 对比度 AA 移动端两主题（亮底朱红/暗底磷光青）实测达标，小字号辅助文本（ink-muted/text-small/text-label）重点抽查；暗模式交互色全部磷光青（暗底无朱红文字） | 按 AC-G04 同方法在 375 双主题实测，记录计算值 | 全部达标；实测值入证据（不以 spec 预估值为通过依据） | S |

> M-E 交付证据要求已吸收进 §5（前缀 website6.0-m4-mobile-*；M-C1/C2 附 Lighthouse JSON 或 CI run 链接；未通过项必须给复现步骤，不接受"偶现"，复现 1 次即记录）。

## 4. CI 门禁、安全红线与 AI 双态用例（ADR-003 拆分；审查对象=建仓后 .github/workflows/ 实际文件，shared/ 版为基线）

### 4.1 CI 门禁

| ID | 条款 | 执行方法 | 预期 | 级别 |
|---|---|---|---|---|
| AC-CI01 | 首屏 JS ≤150KB（四页） | CI bundle 报告 + 本地构建统计对拍 | 每页≤150KB，口径（minify+gzip）与 CI 一致并写明 | S |
| AC-CI02 | LCP<1.5s（CI 门禁，首页） | CI Lighthouse job + 本地复测 | CI<1500ms；实测同数量级（波动>20% 注明网络条件） | S |
| AC-CI03 | CLS<0.05（CI 门禁，四页） | 同上取 CLS | 全部<0.05 | S |
| AC-CI04 | axe 无严重违规（CI 门禁） | CI axe 输出 + 本地对拍（桌面+移动双视口，移动见 AC-M19） | 无 critical/serious | S |
| AC-CI05 | 门禁真实阻断而非仅记录 | 审查 deploy-pages.yml 各门禁步骤（type check/build/secret scan 均 set -euo pipefail、无 continue-on-error）；条件允许做一次故意超标 dispatch 验证 | 指标超标即 job fail、不产出部署 | A |

### 4.2 安全红线（后端 §1.2/§5 四条 + 两 workflow 落实点核对）

| ID | 条款 | 执行方法（含 workflow 具体检查点） | 预期 | 级别 |
|---|---|---|---|---|
| AC-SEC01 | 红线1：代码、dist、commit 历史、issue/PR 零密钥 | `git log -p` 特征扫描 + dist 全目录 grep（与 workflow PATTERNS 同集：AIza/ghp_/github_pat_/AKIA/PRIVATE KEY，另补本地扩展特征）+ news.json/news-stats.json 抽查 | 零命中；报告写明扫描范围与正则 | S |
| AC-SEC02 | 红线2：news-pipeline.yml 仅 `schedule`+`workflow_dispatch` 触发 | 审查 workflows 全部触发器；核对无 `pull_request_target`、不 checkout 外部 ref（基线已核：checkout ref: master + persist-credentials: false） | 无 PR 系触发读 Secrets 组合；建仓后的实际文件若与基线漂移，以漂移内容为准判 fail | S |
| AC-SEC03 | 红线3：BYOK 默认关闭（P1，M4 仅验默认态与入口位置） | 检查默认态、入口在 AI 问答高级设置内；网络层零上传断言待启用后补 | 默认 off；未启用无 key 输入面 | A |
| AC-SEC04 | 红线4：AI 全失效核心内容 100% 可用；管线全量失败保留上一版 news.json 不回写（后端 §5 降级矩阵：429/超时/坏输出→批降级入库，下轮补） | 断网/block + 审查 pipeline 脚本失败分支或构造失败 run | 站点可浏览；news.json 保持旧版、无空列表/损坏页；部分降级批次可核 | S |
| AC-SEC05 | 产物密钥痕迹扫描已进 pipeline 且阻断（deploy-pages build 后 dist grep + news-pipeline commit 前 news.json grep，两处均在） | 审查两 yml 门禁步骤存在且失败即 exit 1（基线已核存在）；确认建仓后文件一致 | 两处扫描均阻断部署/回写 | S |
| AC-SEC06 | 回写凭据与 LLM key 权限分离、最小权限 | 核对 news-pipeline.yml：`permissions: contents: read`（GITHUB_TOKEN 只读）+ 回写走独立 `NEWS_SYNC_PAT`（fine-grained 仅本仓库 contents 读写）+ `LLM_API_KEY` 仅注入 pipeline job；日志无 token 回显 | 两类凭据不互换不混用；注意：PAT 由站主创建，属人工门禁项，测试验"使用方式"并跟踪其在位性 | S |

### 4.3 AI 降级模式 D 组（锚点=后端管线契约 §5 + news-schema.json + src/data/news.json；**v1.4：两阶段豁免已解除**，本地批次全量 pass 见 shared/website6.0-impl-test-dgroup-local.md，M4 部署后仅复跑 D02 Network 完整断言）

| ID | 条款 | 执行方法 | 预期 | 级别 |
|---|---|---|---|---|
| AC-AI-D01 | 纯 RSS 聚合为真实产出非 mock：**news.json（M3 起=管线唯一写者的契约文件）**由管线构建生成，条目按 schema 校验通过、可溯源（源=白名单 pipeline/config/sources.json 命中，`published_at`/来源字段真实） | 核对 run 记录与 news.json 字段；抽点条目回源比对；schema 用 `pipeline/schema/news.schema.json` 独立跑校验 | ≥5 条真实（与 AC-P04 交叉）；schema_version 匹配、mode ∈ {ai, rss_only}；无"假数据冒充"。seed 阶段（news.seed.json 占位）本条记 N/A(等M3)——占位数据不受本断言约束（项目裁定 5） | S |
| AC-AI-D02 | 降级模式运行时零第三方 LLM 请求 | Network 面板过滤第三方域，冷加载四页+交互一轮 | 除方案内允许 CDN 项（自托管字体定稿后应趋零）外零请求 | A |
| AC-AI-D03 | 降级模式 UI：AI 摘要/标签缺席时同构渲染不报错（前端无需感知模式）；筛选区不可用/空词表时列表完整可用；页面不伪造 AI 存在 | 用降级模式 news.json 构建站点验证渲染；block 标签数据复跑（与 AC-M16 交叉） | 无虚假宣称；功能完整 | S |
| AC-AI-D04 | 降级→完整切换设计就绪（密钥无关件全部落位）：源白名单/prompt 模板/JSON Schema/Gemini 适配层接口形状齐；注入 key 只需 Secrets+一步（后端 §6），撤 key 即回降级（双向可逆） | 审查仓库文件结构与 env 读取点（实际=`LLM_API_KEY`+`GEMINI_MODEL`，v1.4 以代码为准；后端 §6 原口径 LLM_PROVIDER/LLM_MODEL 未实现，provider 固定 Gemini 不影响解耦结论）；输出注入操作步骤清单 | 解耦成立；步骤清单可直接执行 | A |
| AC-AI-D05 | News 页底部"数据来源 RSS · 构建期更新"mono 说明 + 上次构建时间（管线注入）真实反映 run 时刻 | 对比 news.json/stats 时间戳与页面显示；触发一次 dispatch 后复查更新 | 时间来源可信、随 run 更新。seed 阶段无管线注入，时间戳断言记 N/A(等M3)，仅验说明文案静态渲染 | A |

### 4.4 AI 完整模式 F 组（key 注入后 M3 验；key 未到位期间记 Blocked 不计失败）

| ID | 条款 | 执行方法 | 预期 | 级别 |
|---|---|---|---|---|
| AC-AI-F01 | 摘要为 LLM 真实产物非 mock：`summary_zh` ≤80 字、`title_zh` 直译口径；抽 5 条与原文比对为归纳性中文；URL 一律来自源数据（模型不产链接） | 审查 Actions run 日志佐证调用发生 + 内容比对 + schema 校验 | 真实产出；来源出处保留 | S |
| AC-AI-F02 | AI 标签为固定词表（frontend/ai/tools/standards/career/security/other 7 枚举 + level 三值），News 页筛选真实可用 | 点击各标签验证结果；检查无词表外标签泄漏（词外值应已降级为 other） | 枚举合规；筛选正确；空结果有兜底 | S |
| AC-AI-F03 | key 注入后复跑零泄露：AC-SEC01 全量 grep + run 日志无明文回显（::add-mask:: 生效）+ 门禁扫描步骤实际通过记录 | 注入后复跑 + 抽查 run 日志 | 零命中、零回显 | S |
| AC-AI-F04 | 配额与告警（B-5）：站主提供商控制台 usage alert 设置的在位确认（人工门禁，测试只验存在性）；单次 run 调用封顶/节流/去重增量按后端 §1.3 机制抽查一轮 run 统计（news-stats.json） | 请站主/开发运维提供告警设置证据；比对 run 调用量与 ≤100 摘要/日 ≤400 预算 | 告警存在；机制数据可核 | A |
| AC-AI-F05 | bot 回写走 NEWS_SYNC_PAT、commit 历史干净（Q10）：作者 github-actions[bot]、无变更时 skip commit、PAT push 触发 deploy 重发布符合预期 | 审查 news.json 更新 commit 序列与 Pages 部署 run 关联 | 记录可溯、无凭据痕迹泄漏（与 AC-SEC01 交叉） | A |

### 4.5 部署通路

| ID | 条款 | 执行方法 | 预期 | 级别 |
|---|---|---|---|---|
| AC-REL01 | Actions 构建→Pages：产物目录 dist 与 Astro 对齐；`public/CNAME` 必须恰为 www.jary8.com（workflow 有校验步骤且缺失即 fail，前端 owns）；SITE_URL 仓库 Variable 可切换（M4 路径→M5 换绑后改）；路径地址可访问 | 核对最新 run 部署 URL 结构、CNAME 校验步骤行为、SITE_URL 变量对 canonical/ sitemap 的影响 | 部署成功、目录正确、`longzhengyun.github.io/website6.0/` 可访问；M4 阶段 CNAME 在产物中不引路径访问异常 | S |

## 5. 证据模板（每条 AC 按此格式落盘）

证据目录约定：`qa-outputs/website6.0/<run批次>/evidence/`（本机绝对路径在汇报中给出）；**移动端专项证据文件名前缀 `website6.0-m4-mobile-*`**；汇总清单同步写盘 shared/（前缀 website6.0-impl-*）。

### 5.1 单条场景执行记录模板（含 M-E 要求的 URL+视口+截图路径）

```yaml
case_id: AC-M08
run_batch: M4-20261023-01           # M4路径验收 / M6上线复验 / KEY回归(F组)
target_url: https://longzhengyun.github.io/website6.0/news
http_status: 200                    # 页面主请求状态码；子资源异常列备注
viewport: 375x667 / chrome-140 / device-emulation   # 或 real-device: iPhone-XX / Android-Pixel-XX
network: Fast 3G | 4G | none       # M 系列必填
method: devtools-metric | lighthouse | axe | grep | manual-visual | network-assert | workflow-review | contrast-calc
result: pass | fail | blocked | n_a # blocked 仅用于 F 组（等 key）；n_a 仅用于门禁未开（如 M4 的 jary8.com）
evidence:
  - evidence/website6.0-m4-mobile-AC-M08-news-375-targets.png
  - evidence/website6.0-m4-mobile-lighthouse-news-mobile.json   # M-C1/C2 必附 Lighthouse JSON 或 CI run 链接
  - reports/website6.0-validation.md#AC-M08
expected: 命中区≥44x44px、间距≥8px、胶囊 gap 12px（基准来源：设计 spec v1.0 §6.1）
actual: tab 条 56px OK；筛选胶囊 gap 实测 9px
defect_ref: BUG-001                 # fail 必填；不接受"偶现"，复现 1 次即记录并给复现步骤
confidence: high | medium(flaky已复跑n次)
```

### 5.2 缺陷记录模板

```
BUG-<nnn> [severity: S/A/B] <一句话标题>
复现步骤: 1) 打开 <URL>(状态码) 2) …（精确到视口/设备/网络档位与模式）
预期 / 实际: …
影响: <页面/人群/是否阻断上线>
证据: <evidence/ 路径列表 + 报告路径>
owner 建议: <前端/设计/开发运维/后端>
```

### 5.3 M4 交付：通过/未通过清单总表模板

| AC-ID | 条款摘要 | 结果 | 阻断级 | 证据路径 | 缺陷引用 | 备注 |
|---|---|---|---|---|---|---|
| AC-G01 | 双地址 HTTPS | 通过/未通过/Blocked/N/A | S | reports/…#AC-G01 | — | M4 时 jary8.com 记 N/A(门禁M5) |

交付要求：清单必含 ①已验范围与环境 ②四态计数 ③每条证据路径 ④未验面与残余风险 ⑤AI 执行模式标注（降级 D 组 / 完整 F 组）。

## 6. 合并状态与剩余待办

已并入：产品 M-A~M-E、ADR-002/003/004、scope v1.2、品牌文案 C1、设计 spec v1.0（§2.1 对比度按"实测复核"原则处理、§6 移动基准值取较严者）、devops 两 workflow（SEC/CI/REL 检查点具体化）、后端管线契约（news.json 路径 src/data/news.json 定稿、schema/sources/prompt 锚点、降级矩阵、D05/F05 新增）。

剩余待办（非合并阻塞，执行期确认）：
1. **建仓核对**：两 workflow 当前为 shared/ 基线版，M4 审查时对照 `.github/workflows/` 实际文件；发现漂移以实际文件为准并回记差异（后端若调整 news.json 路径，AC-SEC05/REL01 grep 路径同步改）。
2. ~~**M3 迁入切换点核验（v1.3 新增，随项目裁定）**~~ **已关闭（v1.4）**：三项核验 pass（shared/website6.0-impl-test-m3-verification.md）；D 组全量已以迁移后文件（f9b9367）为对象复跑 pass（shared/website6.0-impl-test-dgroup-local.md）。
3. **自托管字体定稿**（设计开放项①→前端答复）：影响 AC-AI-D02 的"允许 CDN 项"清单——Geist Variable 自托管子集成立则第三方请求目标为零（前端已答复自托管，M4 以 Network 实测确认）。
4. **真机可用性**：iOS Safari / Android Chrome 各 1 台；无真机时 AC-M18 降级为 emulation 并标 confidence=medium，列入残余风险。
5. **LLM key 到位**：F 组（AC-AI-F01~F05）整组执行，run_batch 记 KEY回归；D 组中 AC-AI-D03 筛选不可用场景转为 F02 正常态验证。

## 7. 边界声明

- 本清单不覆盖单元测试、不做产品代码修改；发现缺陷输出交接包给对应 owner。
- M4 全部在路径地址执行；域名换绑（M5）为站主人工门禁，测试仅在 M6 复验，不执行换绑。
- P1 项（BYOK 启用态、⌘K 完整搜索、Lab 页）不在本期硬阻断范围，仅按标注口径验证。
