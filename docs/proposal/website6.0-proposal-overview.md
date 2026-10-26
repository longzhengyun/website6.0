# website6.0 总方案（团队汇总稿 v1.1 — 站主已裁定，进入实施）

汇总人：项目｜日期：2026-10-23｜阶段：实施（方案已确认）

## 裁定结果（站主消息 cmsg_01m5kgkshnd3dr3v4j7qxzymzz，2026-10-23）
- Q1-Q14：**全部按默认建议采纳**。
- 站名定稿：中文「佳瑞网」/ 英文「jary8」；其余文案团队自主发挥（Q4 关闭）。
- **新增硬性要求：站点需要支持移动端**（原 G2/Lighthouse 移动端条款升级为正式需求，移动体验为一等验收项而非兼容底线）。
- LLM key：站主晚点提供（Q8 挂起不阻塞：M1/M2 先行，key 到位后注入 Actions Secrets 并启用落点①摘要；到位前新闻管线按降级模式=纯 RSS 聚合验证）。
- 域名换绑时机：站主自定，保持人工门禁（M5）。

---
成员方案全文（本文件为唯一决策入口，细节溯源看这 6 份）：
- shared/website6.0-proposal-product.md（产品）
- shared/website6.0-proposal-design.md（设计）
- shared/website6.0-proposal-frontend.md（前端）
- shared/website6.0-proposal-backend.md（后端）
- shared/website6.0-proposal-devops.md（开发运维）
- shared/website6.0-proposal-knowledge.md（知识）

---

## 1. 一句话定位

jary8.com 本身就是站长的作品——一个用原生前沿 CSS + Astro + 构建期 AI 管线做出来的极简编辑部风格个人站，招聘方/技术同行 10 秒看懂"这个人技术很新"。

## 2. 推荐方案摘要（默认推荐 = 站主全采纳时的样子）

### 2.1 信息架构（产品，MVP 6 页）
| 页面 | 路由 | 内容 | 优先级 |
|---|---|---|---|
| 首页 | `/` | 站点名 + 站长身份一句话 + 单一视觉焦点（可变字体呼吸动画），极简 | P0 |
| 业内新闻 | `/news` | 标题 + 简介 + 新窗口直跳外链（rel=noopener），按 AI 标签筛选 | P0 |
| 关于/能力 | `/about` | 技能栈 + 履历时间线，简历入口承载页 | P0 |
| 简历 | `/resume` | 网页为主 + 打印导出 PDF；不进主导航（页脚 + About 内链 + ⌘K 暗线） | P0（弱化） |
| 作品/实验 | `/lab` | 可交互 demo 卡片 | P1（建议不进 MVP） |
| 404 | — | 有性格的终端风 404 | P2 |

主导航：Home / News / About（/ Lab）。AI 不新开页面，嵌入 News（AI 摘要/看点）与 About（"问站长"）。

### 2.2 视觉方向（设计）
首选 **B「瑞士排版 + 动态字体」**，吸收 A「精密终端」的编号系统与 ⌘K 命令面板细节；C「生成式画布」的 AI 个性化画布列为二期。
理由：开发者圈暗色终端已泛滥，编辑部风格差异化最强；纯原生 CSS（scroll-driven animations、可变字体插值）性能与无障碍最佳、Pages 零压力；与"极简首页"要求完美契合。

### 2.3 技术栈（前端）
Astro 5（SSG+Islands，默认零 JS）+ TypeScript strict + Tailwind CSS 4（CSS-first）+ Vite 7 + View Transitions API + Content Collections；动效 CSS 优先；GitHub Actions 自建流水线部署 Pages（不用 Jekyll 默认构建）。
性能红线进 CI：首屏 JS ≤150KB、LCP <1.5s、CLS <0.05、axe 无严重违规，不过关不合并。
备选 React 19 / Next.js static export 已对比，不推荐（首屏更重、静态导出限制多）。

### 2.4 AI 结合落点（前端+后端会师结论）
| 落点 | 做法 | 优先级 | 结论 |
|---|---|---|---|
| ① 构建期 AI 新闻管线 | Actions 定时抓 RSS/HN → LLM 去重+中文摘要+打标签 → 静态 news.json | **P0 主推** | 后端判定安全合规（密钥只在 Actions Secrets）；失败自动回落上一版 |
| ② Chrome Built-in AI | 端侧 Gemini Nano 就地总结/翻译，capabilities() 探测渐进增强 | P0/P1 | 零密钥零下载 |
| ③ 本地 RAG "问站长" | 构建期 embedding 索引 + 端侧检索；WebLLM 全离线作彩蛋档 | P1 | 静态可行 |
| ④ BYOK 云端兜底 | 访客自持 key、localStorage、官方端点白名单 | P1 默认关闭 | 后端建议：可整块砍掉不伤 P0 |
| ⑤ AI 个性化 | 端侧偏好学习调新闻排序/主题 | P1 | 复用②③引擎 |
全部 AI 渐进增强：任一失效时核心内容 100% 可用。**不需要 serverless**（已逐条盘点；未来若要做公共 AI 问答，出口预案 Cloudflare Workers 已按 ADR 记录）。
密钥安全四条红线（后端）：密钥只存在于 Actions Secrets 与访客 localStorage；workflow 仅 schedule/workflow_dispatch 触发；产物密钥痕迹 grep 门禁；回写凭据与 LLM key 权限分离。

### 2.5 发布通路（开发运维，本机实测）
- DNS 已全部就位（apex/www CNAME → longzhengyun.github.io），接管不需改 DNS。
- 关键机制：自定义域名仓库级唯一，须先解绑 website5.0 再绑 website6.0。
- 顺序：website6.0 先建 public 仓库 → 在 `longzhengyun.github.io/website6.0` 路径部署验收 → 站主确认时机后执行域名换绑（人工门禁，可逆，回滚=反向执行两步）。
- 站主手动清单 7 步共 15–20 分钟 + HTTPS 生效等待 10–60 分钟。
- 已知环境缺口：本机无 gh CLI（可网页操作规避）；到 GitHub 存在按 IP 波动的连通性（push 需重试，CI 不受影响）。

### 2.6 验收标准（测试可直接消费，摘自产品草案）
全局：Pages+jary8.com 双地址 HTTPS 可访问；375/1440 无遮挡；键盘全站可达 + 对比度 AA；Lighthouse 移动端 Perf≥90/A11y≥95/BP≥95；首页 LCP<2.5s。
关键条款：新闻每条仅标题+简介+新窗口直跳；主导航不出现"简历"字样；至少 1 个真实 AI 落地上线非 mock；构建产物 grep 无密钥。

## 3. 站主裁定清单（Q1–Q14，均附默认建议）

| # | 决策点 | 选项 | 默认建议 |
|---|---|---|---|
| Q1 | 视觉方向 | B+A混合 / A / B / C | **B+A 混合**，C 列二期 |
| Q2 | 主题模式 | 亮 / 暗 / 跟随系统 | 双模式跟随系统 |
| Q3 | 强调色 | 朱红/克莱因蓝/磷光青/琥珀 | 亮底朱红 + 暗底磷光青 |
| Q4 | 主标题语言与站名 | 英文 JIARUI+中文副题 / 纯中文 | 前者；站名最终文案请站主给一句话 |
| Q5 | 首要访客假设 | 招聘方/技术同行为主 / 其他 | 按招聘方视角打磨（影响 About/Lab 权重） |
| Q6 | Lab 页是否进 MVP | 进 / 不进 | 不进，先保 4 个 P0 页质量 |
| Q7 | 简历形态 | 网页 / PDF / 两者 | 网页为主 + 打印导出 PDF |
| Q8 | 是否提供 1 个自持 LLM key | 提供（推荐 Gemini 免费档，月成本≈0）/ 不提供 | 提供；不提供则落点①退化为纯 RSS 聚合无 AI 摘要（仍达标但少一个 AI 亮点） |
| Q9 | BYOK 实验特性 | 保留默认关闭(P1) / 砍掉 | 保留默认关闭 |
| Q10 | news.json 回写 | bot 直接 commit（全自动）/ 人工周合入（强审计） | bot 直接 commit |
| Q11 | 仓库公开/私有 | public / private | public（Actions 免费额度前提，密钥面已验证不随公开泄露） |
| Q12 | 域名形态 | A 沿用 www 主站 / B apex 主站 | 方案 A，DNS 零改动 |
| Q13 | website5.0 去留 | 保留路径访问 / 归档下线；SEO 资产(外链/收录)是否迁移 | 保留 `longzhengyun.github.io/website5.0` 路径访问；换绑时机由站主拍板 |
| Q14 | 验收数值契约 | 按 §2.6 / 微调 | 按草案执行 |

## 4. 功能脑暴池（超出硬性要求，站主勾选后可排期）

差异化杀器候选：⌘K 命令面板导航 + WebMCP 站点代理接口（实验区）；"查看源代码"模式（网站自我解释技术名片）；About 页展示本站真实 Lighthouse/包体积/构建耗时（CI 写入静态 JSON）；WebGPU 生成艺术首页背景（CSS 降级）；llms.txt + JSON 端点（把站点做成 AI 可消费数据源）；AI 技能图谱页；新闻 AI 周报档案（news.json 历史 commit 即档案）；"本站数据心跳"管线可观测折叠区；PR 预览环境；Releases 驱动 changelog；有性格的 404。

## 5. 确认后的实施路线（预告，不现在执行）

里程碑 M1 脚手架（仓库+Astro+CI 通路）→ M2 四个 P0 页静态实现 → M3 AI 落点①新闻管线 → M4 路径地址验收（测试出通过/未通过清单）→ M5 人工门禁：站主换绑 jary8.com → M6 上线复验 + ADR 归档。
每个里程碑按群 SOP 五阶段流转；站主只在 M5 和裁定项上花时间。

## 6. 已知限制（站主知情确认项，均不阻塞）

- GitHub Pages 不下发自定义 HTTP 响应头（CSP 用 meta 替代，frame-ancestors 不可用；本站无登录态影响面小）。
- Actions schedule 高峰期可能延迟数小时（新闻时效波动，可接受）。
- Firefox 对部分新 CSS API 滞后（渐进增强，"能用不丑"底线）。
- 提供商免费档政策可能变化（已按提供商解耦设计，换 key 只改 Secrets+适配层）。
- 本机到 GitHub 连通性按 IP 波动（实施期 push 重试策略）。
