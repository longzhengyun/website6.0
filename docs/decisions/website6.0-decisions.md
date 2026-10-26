# website6.0 选型与否决记录（decisions）

维护人：佳瑞网-知识｜建立日期：2026-10-23
用途：记录"为什么这样选 / 为什么否决"，防止实施期重复讨论。裁定级决策见 shared/website6.0-adr.md；本文件随实施更新，每条含状态。

---

## 一、已采纳选型（含理由）

| # | 选型 | 理由 | 出处 |
|---|---|---|---|
| S1 | Astro 5（SSG+Islands，默认零 JS） | 内容驱动个人站场景匹配；首屏 JS 可控满足 CI 红线（≤150KB）；5.0 已验证同类内容模型可迁移 | frontend §选型 |
| S2 | TypeScript strict + Tailwind CSS 4（CSS-first）+ Vite 7 | 5.0 的 Tailwind 4 与 strict 检查经验直接沿用；配置简化 | frontend / knowledge 基线 |
| S3 | View Transitions API + 可变字体 + scroll-driven animations（动效 CSS 优先） | 纯原生实现"前沿技术"诉求，性能与无障碍最佳、Pages 零压力 | frontend / overview §2.2-2.3 |
| S4 | GitHub Actions 自建流水线部署 Pages（弃 Jekyll 默认构建） | 构建可控（Node .nvmrc 基准、Pagefind 类工具可挂载）、可加密钥 grep 门禁等自定义步骤 | frontend / devops |
| S5 | 构建期 AI 新闻管线（落点①，P0 主推）：Actions 定时 RSS/HN → LLM 去重+中文摘要+标签 → 静态 news.json，bot 回写 commit | 运行时零密钥零成本，完全命中"标题+简介+直跳"硬需求；失败自动回落上一版；后端判定安全合规（密钥只在 Actions Secrets）+ 四条红线 + 四层配额控制 | frontend+backend 会师，overview §2.4 |
| S6 | 端侧 AI 渐进增强（Chrome Built-in AI / 本地 RAG / BYOK 默认关闭） | 零密钥零下载优先；任一 AI 失效时核心内容 100% 可用 | frontend §AI 落点②③④⑤ |
| S7 | 域名方案 A：www.jary8.com 主站，DNS 零改动 | 实测 CNAME 已就位；仓库级唯一冲突走"先解绑 5.0 再绑 6.0"，全程可逆 | devops 实测 |
| S8 | 仓库 public | Actions 免费额度前提；密钥面已验证不随公开泄露（密钥只进 Secrets） | backend / Q11 |
| S9 | 新闻数据源分层：白名单 RSS + 构建期生成，LLM key 解耦（换提供商只改 Secrets+适配层） | 免费档政策变动风险已对冲 | overview §6 |

## 二、否决/暂缓项（含理由与复审条件）

| # | 事项 | 结论 | 理由 | 复审条件 |
|---|---|---|---|---|
| V1 | React 19 SPA / Next.js static export 作主栈 | 否决 | 首屏更重、静态导出限制多，不满足性能红线取向 | 若出现必须重交互的 P0 功能，以 Islands 组件形式引入，不换栈 |
| V2 | serverless / 外部服务 | 否决（本阶段） | 已对全部 P0/P1 AI 需求及搜索/周报档案/llms.txt 逐条盘点，静态+Actions+浏览器 API 全覆盖 | 唯一需要它的场景="共享密钥公共 AI 入口"，明确不做；届时首选 Cloudflare Workers 薄代理 |
| V3 | 视觉方向 C「生成式画布」 | 暂缓至二期 | 暗色终端风在开发者圈泛滥，B+A 编辑部风格差异化更强且性能/无障碍更优 | 6.0 上线稳定后可作为 Lab/彩蛋评估 |
| V4 | Lab 页进 MVP | 否决 | 先保 4 个 P0 页质量（站主裁定 Q6） | P1 排期，站主勾选脑暴池时评估 |
| V5 | BYOK 访客自持 key 默认开启 | 否决，改默认关闭（P1） | localStorage 明文是固有属性，需 5 条硬约束收窄；砍掉不伤 P0 | 上线后视访客需求与约束实现完备度再议 |
| V6 | 简历进主导航 | 否决 | 站主硬性要求弱化：页脚 + About 内链 + ⌘K 暗线，主导航无"简历"字样 | 无（验收固定条款） |
| V7 | website5.0 归档下线 | 否决，保留路径访问 | 保留 SEO/外链资产；换绑可逆 | 站主随时可改（M5 人工门禁的一部分） |
| V8 | CSP 响应头 | 平台不支持，改 meta 标签替代 | GitHub Pages 不下发自定义 HTTP 响应头（_headers 是 Netlify/Workers 特性）；frame-ancestors 不可用，本站无登录态影响面小 | 若未来迁 Workers 代理层可恢复响应头能力 |

## 三、遗留观察项（不阻塞，标注跟踪）
- Actions schedule 高峰期延迟数小时 → 新闻时效波动，M6 后观察实际延迟。
- Firefox 对新 CSS API 滞后 → 渐进增强"能用不丑"，测试清单覆盖。
- 本机到 GitHub 连通性按 IP 波动 → push 重试策略已入 devops 方案；CI 不受影响。
- 本机无 gh CLI → 站主网页操作规避；若实施期频繁建 PR 再评估安装。

## 四、更新规则
- 新增选型/否决：由提出角色补一行，知识角色每周或按里程碑归并核对。
- 状态变更（如暂缓→采纳）须引用站主裁定消息 ID。
- M6 上线后做一次 5.0→6.0 对照复盘，本文件结论沉淀进团队 SOP。
