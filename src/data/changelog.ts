/**
 * N-1 版本时间线数据源（product-t2-n1-narrative-framework-v1.md v1.0）。
 * 五字段模板锁定：1 版本号+日期+一句话主题 / 2 为什么做 / 3 做了什么 / 4 证据链 / 5 下一步。
 * 红线：只写已发生事实、不写承诺日期；公开粒度=决策与结果层（站主 seq=471 R6）；
 * 证据链只引用 master 可核验的 commit 与仓库内文件（§五细化条）；新条目只加数据不改组件。
 */

const REPO = 'https://github.com/longzhengyun/website6.0';

/** commit 短哈希 → GitHub 永久链接（引用前须能在 master 核验存在） */
export const commitRef = (hash: string): string => `${REPO}/commit/${hash}`;
/** 仓库内文件/目录路径（相对根）→ GitHub blob 链接 */
export const fileRef = (path: string): string => `${REPO}/blob/master/${path}`;

export interface ChangelogRef {
  /** 展示文本（commit 哈希或文档路径） */
  label: string;
  href: string;
}

export interface ChangelogEntry {
  /** 字段 1：版本号 */
  version: string;
  /** 字段 1：日期（收口区间，均为已发生事实） */
  date: string;
  /** 字段 1：一句话主题 */
  theme: string;
  /** 在途状态披露（非承诺日期，仅陈述当前事实） */
  status?: string;
  /** 字段 2：为什么做——站主裁定原话或 seq 编号；无裁定依据写明"问题来源（已证实事实）" */
  why: string;
  /** 字段 2 的 master 可核验落点（裁定索引/登记 commit） */
  whySource: ChangelogRef[];
  /** 字段 3：做了什么——用户可感知变化，工程细节只留链接 */
  what: string[];
  /** 字段 4：证据链——commit / 构建产物 / 测试报告路径 */
  evidence: ChangelogRef[];
  /** 字段 5：下一步——开放项引用，不写承诺日期 */
  next: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: 'v6.0 二期 T2',
    date: '2026-10-28（在途）',
    theme: '首页叙事完成 + 站主实报三修——主色定案、导流行、画布、时间线、主题跨页修复、页脚适配、移动端首页一屏',
    status: '代码侧验收完成（三签齐，master=3feea52 已推远端）：现网部署等待数据批与 Pages 发布窗口',
    why: '站主 seq=422 裁定「T1 确认 / T2 启动」；seq=471「按推荐」六项全取推荐（R1 亮色保持 #e5484d、R2 性能预算批准+INP≤100ms、R3 默认首帧 0x5EED 固定母版、R4 移动端静帧条、R5 hero 大字本批不改、R6 公开粒度=决策与结果层）。执行期站主实报三事并全部裁定：seq=623 主题跨页丢失（存量缺陷）、seq=649 页脚贴底需求、seq=687 移动端首页双轴禁滚——分别以 seq=673「按最佳实践自行适配」、seq=700「A 严格一屏」、seq=716「按推荐」（D1a/D2a/D3/D4）收口。',
    whySource: [
      { label: '10081e8（commit message 登记 seq=422 裁定）', href: commitRef('10081e8') },
      { label: '3feea52（merge 登记 seq=700/716 R-MHOME-1 拍板链）', href: commitRef('3feea52') },
      { label: 'docs/decisions/ruling-index-phase1.md §四（二期裁定索引）', href: fileRef('docs/decisions/ruling-index-phase1.md') },
    ],
    what: [
      '暗色主色统一朱红 #f2555a（纯 token 批次，全站三态自动跟随）',
      '首页技术亮点导流行：$ cat DESIGN.md / $ ls heartbeat / $ tail -f feed / $ open canvas?，SSR 零 JS',
      'V3 生成艺术画布：首页 hero 氛围层 + 移动端静帧条；种子可复现（默认 0x5EED，?seed= 覆盖）、≤8s 入场后永久定格、三列降级（reduce/低端机/无 JS 同 seed SVG 静帧）、regenerate 不重载换 seed',
      '本页：版本时间线区块（/about）+ 独立 changelog 页，数据源 src/data/changelog.ts 只加数据不改组件',
      '主题跨页丢失修复（DEF-THEME-1，站主实报）：站内跳转后暗色与切换按钮不再消失——ClientRouter 换页会擦除运行时写入的页面标记，修复为每次换页自动重放（首页画布切换按钮的同现象一并修复）',
      '页脚贴底（R-FOOTER-1，站主实报需求）：内容不满一屏时页脚固定于屏幕底部，桌面移动双档实测精确贴底',
      '移动端页脚最佳实践适配（R-FOOTER-2，站主 seq=673 授权自行适配）：页脚底部垫出与导航条等高留白（含安全区），完整可见不被遮挡；视口高度改用 dvh 回退链应对工具栏伸缩',
      '移动端首页严格一屏（R-MHOME-1，站主 seq=700 A 案 + seq=716 按推荐）：375×780 与 375×667 双档双轴零滚动；导流行与工程状态卡迁至 /about「05/ 技术亮点与工程状态」小节，画布静帧并入 hero 背景，首页收为 大标题+tagline+新闻 1 条+极简页脚',
    ],
    evidence: [
      { label: '61e607b（主色合入）', href: commitRef('61e607b') },
      { label: '0b663cf（N-5 导流行合入）', href: commitRef('0b663cf') },
      { label: '1f4c5fc（N-3 画布合入）', href: commitRef('1f4c5fc') },
      { label: '3218dc2（DEF-THEME-1 修复合入，含 2a8bc1f；merge message 登记站主 seq=623）', href: commitRef('3218dc2') },
      { label: '0230033（R-FOOTER-1 合入，含 07dcf7a）', href: commitRef('0230033') },
      { label: '203bccb（R-FOOTER-2 合入，含 336be66，站主 seq=673 授权）', href: commitRef('203bccb') },
      { label: '3feea52（R-MHOME-1 合入，含 756c8d0）', href: commitRef('3feea52') },
      { label: 'src/lib/v3-art.mjs（mulberry32 单源生成器）', href: fileRef('src/lib/v3-art.mjs') },
      { label: 'docs/design/DESIGN.md（§2.4 性能预算出处）', href: fileRef('docs/design/DESIGN.md') },
    ],
    next: [
      '代码已随通道恢复推至远端 master（3feea52），与数据批一并部署上线后，测试按站主原路径现网复验（条件，非承诺日期）',
      '移动端 dvh 工具栏伸缩效果请站主真机目检一次（headless 仿真无法量测）',
      'News 源波动观察：hn 已转绿；juejin 空源率超 1/4 将转呈站主处置选项（后端观察窗）',
      '域名换绑按站主裁定延后至本版上线后执行（下版本窗口）',
    ],
  },
  {
    version: 'v6.0 二期 T1',
    date: '2026-10-26 ~ 10-27',
    theme: '技术展示基座——三态主题、纯 CSS 动效、零 JS 状态卡、本地精选与 CI 门禁',
    why: '站主 seq=65 裁定二期主目标 = C 路线技术展示（设计/UI/交互体现技术；长期纯静态、无后端无数据库）；seq=84 七项定执行红线（D-R2-1 换绑延后至本版上线后 … D-R2-7 告警先不要）。',
    whySource: [
      { label: 'docs/decisions/ruling-index-phase1.md §四（seq=65/84 登记处）', href: fileRef('docs/decisions/ruling-index-phase1.md') },
      { label: 'docs/decisions/website6.0-decisions.md（选型/否决全档）', href: fileRef('docs/decisions/website6.0-decisions.md') },
    ],
    what: [
      '亮/暗/自动三态主题切换，首帧前预写实色零 FOUC（L-1）',
      '终端风格 404 页 + 全站 OG/Twitter 分享卡（URL 单一出处，域名换绑零硬编码）（L-2）',
      'A7/A9/A10 三组纯 CSS 微动效 + reduce-motion 绑定闸门加固（L-3 / DEF-1）',
      '首页「站点工程状态」卡：CI 运行、质量门禁、新闻管线实时状态，零 JS（L-4）',
      '本地精选：新闻已读标记 + 书脊阅读进度，只写本机 localStorage、数据不出站（L-5）',
      '域名换绑收口：base 切 "/" + 正式域 https://www.jary8.com/ 上线，github.io 旧路径 301（独立事件；「发现口径偏差→修正→复测」闭环，上游见一期条目）',
      '管线与门禁：一期档案 git 化（34 文档 + 28 截图入 docs/）、新闻时区缺陷修复（数据缺陷修复不搁置）、QA 门禁 G1–G6 接入 CI',
    ],
    evidence: [
      { label: '6b784fb / 58b8093 / f43c191 / e42a0a5 / dd73cd9 / 855f69b（L-1~L-5+DEF-1 合入链）', href: commitRef('6b784fb') },
      { label: '46fc161（M5 换绑配置合入）', href: commitRef('46fc161') },
      { label: 'fe1c07d（P-1 档案 git 化）', href: commitRef('fe1c07d') },
      { label: '3f92c3b（P-3a 时区修复合入）', href: commitRef('3f92c3b') },
      { label: 'dc4566e（QA 门禁 G2–G6 CI 合入）', href: commitRef('dc4566e') },
      { label: 'docs/index.md（档案总入口）', href: fileRef('docs/index.md') },
    ],
    next: [
      'T2 下半场启动（已发生，见上条）',
      'News 数据源 per-source 失败摘要在 G5 warn→fail 后持续监控（已转 fail）',
    ],
  },
  {
    version: 'v6.0 一期',
    date: '2026-10-23 ~ 10-26',
    theme: '从 0 到首次上线——Astro 静态基座 + 构建期 AI 新闻管线 + 编辑室风格',
    why: 'ADR-001：总方案 Q1–Q14 全按建议采纳（视觉 B+A 编辑室风、双主题、Astro 5 技术栈、仓库 public）；ADR-002：移动端升格一等验收项；ADR-003：LLM key 缓给、管线降级模式先行；ADR-004：域名换绑暂缓、人工门禁。',
    whySource: [
      { label: 'docs/adr/website6.0-adr.md（ADR-001~004）', href: fileRef('docs/adr/website6.0-adr.md') },
      { label: 'docs/decisions/ruling-index-phase1.md（裁定 seq→commit 映射）', href: fileRef('docs/decisions/ruling-index-phase1.md') },
    ],
    what: [
      'M1–M2 工程基座与四页：Astro 5 + TypeScript strict + Tailwind 4；首页/新闻/关于/简历',
      'M3 构建期 AI 新闻管线：Actions 定时抓 RSS/HN → LLM 去重中文摘要 → 静态 news.json；运行时零密钥零成本，抓取失败自动回落上一版',
      'M4 首次上线 + 验收修正：GitHub Pages 路径 URL 上线；对比度/无障碍/响应式修复链（BUG-M4R-01~05 定性，WCAG 标准口径 + 锚点自检确立）',
      'M4.1 品牌与首页定稿：站名文案 jary8→Jary·佳瑞网、favicon「佳」字；R15 首页单屏 + 桌面超紧凑新闻条；R16 tagline 随机池；R17 资讯中文-only；简历实数据',
      '口径如实（不粉饰）：一期收口时仅在 github.io 路径 URL 上线——换绑按 ADR-004 暂缓、未落地即非"最终态"；修正作为独立事件记入二期 T1 条目',
    ],
    evidence: [
      { label: '6420324（M1 工具链脚手架）', href: commitRef('6420324') },
      { label: '4bf5fa2 / 3f11699 / fbf647e / bd8aad4（R15/R16/R17/R18-19）', href: commitRef('4bf5fa2') },
      { label: '38fa315 / 38eab9d / 2805faa（BUG-M4R 修复链）', href: commitRef('38fa315') },
      { label: '55f849b（简历实数据合入）', href: commitRef('55f849b') },
      { label: 'docs/evidence/m4-verify/（上线验收截图）', href: fileRef('docs/evidence/m4-verify') },
      { label: 'docs/test/（一期测试档案 8 份）', href: fileRef('docs/test') },
    ],
    next: [
      '二期 C 路线启动（已发生，见 T1 条目）',
      '遗留观察项登记于 decisions.md §三：Actions 定时延迟波动、Firefox 新 CSS API 滞后、本机到 GitHub 连通性按 IP 波动',
    ],
  },
];
