# website6.0 前端技术选型方案（方案阶段，不出码）

作者：前端 ｜ 日期：2026-10-23 ｜ 状态：待项目汇总、站主确认
前提：GitHub Pages 纯静态部署（无运行时服务端）、域名 jary8.com、仓库 website6.0。本方案全部选型均以"静态产物可在 Pages 上完整工作"为可行性底线。

---

## 1. 推荐技术栈总览

| 层 | 选型 | 理由（一句话） | Pages 静态可行性 |
|---|---|---|---|
| 框架 | **Astro 5.x**（content-driven + Islands） | 内容型个人站最优解：默认零 JS、按岛水合，天然 SSG；State of JS 连续三年满意度第一；团队已在 website5.0 有 Astro 经验，风险最低 | ✅ `output: 'static'` 直接产出纯静态，`astro build` 后一键部署 Pages |
| 语言 | TypeScript 5.9+（strict） | 体现工程素养的基础项 | ✅ 构建期完成 |
| 样式 | **Tailwind CSS 4**（CSS-first 配置）+ 原生现代 CSS | v4 用 `@theme` 原生 CSS 变量驱动、零 JS 运行时；配合 `:has()`、container queries、`color-mix()`、Cascade Layers 展示"CSS 新能力" | ✅ 全部构建期编译 |
| 构建 | Vite 7（Astro 内置）/ Rolldown 工具链 | 2026 事实标准，HMR 与产物体积控制好 | ✅ CI 内 `npm run build` |
| 渲染策略 | SSG 为主 + 客户端 Islands + **View Transitions API** 页面切换 | 全站预渲染保 Lighthouse 满分潜力；View Transitions（Chrome/Edge/Safari 26 已支持，Firefox 待开 flag）做无刷新丝滑转场，是"前沿感"的高性价比落点 | ✅ 纯浏览器 API，渐进增强 |
| 内容层 | Astro Content Collections + Markdown/MDX | 类型安全的内容 schema（blog/projects/news 各 collection） | ✅ |
| 动效 | CSS 优先 + Motion（11.x）做高价值时刻；WebGPU shader 做首页 signature 背景（可选实验项） | 动效集中在入场/转场等高影响时刻，避免全站动画拖性能 | ✅ WebGPU 有 Canvas2D/CSS 降级 |
| 测试/质量 | Vitest + Playwright（冒烟）+ Lighthouse CI（预算：LCP<1.5s、CLS<0.05、JS<150KB 首屏）+ axe 无障碍 | 交付证据链需要 | ✅ GitHub Actions 内运行 |
| 部署 | GitHub Actions 自建流水线（`astro build` → `actions/deploy-pages`），**不用 Pages 默认 Jekyll 构建** | Pages 的 Actions 部署路径完全静态、免费、官方支持自定义域名 | ✅ |

备选组合（供项目对比裁定）：
- **B：React 19 + Vite 7 SPA**——如果站主更想展示 RSC/Compiler 生态，但 SPA 首屏 JS 明显更重、SEO 弱于 Astro，个人内容站性价比低。不推荐主选。
- **C：Next.js 15+ static export**——同 B，静态导出限制多（禁用 RSC 数据路径），不如 Astro 干净。
- 结论：**主选 A（Astro）**，B/C 仅作为"站长技术广度"的 blog 对比素材（见 §4 点子 3）。

---

## 2. AI 结合的具体落点（5 个，按确定性排序）

### 落点 1：构建期 AI 新闻管线（⭐ 强烈推荐，硬性需求"业内新闻"的最优解）
- 做法：GitHub Actions 定时 workflow（如每日 2 次）→ 抓取 RSS/arXiv/HN 白名单源 → 调 LLM API（站主提供密钥，存 Actions Secrets）做**去重、中文摘要、分级打标签** → 产出静态 `news.json` 入库或作为 artifact → 构建部署。
- 静态可行性：✅ 运行时零成本、零密钥暴露、无配额风险（配额在 CI 侧，可精确控制）；页面只展示标题+简介+直跳链接，完全命中需求 5b。
- 风险：Actions 定时任务在私有仓库需付费分钟（公开仓库免费 → website6.0 建议公开仓库）；LLM 调用失败需缓存上一版产物兜底。

### 落点 2：Chrome Built-in AI（Gemini Nano 端侧）——"零成本、零密钥"的前沿名片
- 做法：用 `ai.languageModel`（Prompt API）/ Summarize / Writer 等浏览器内置 API 实现：新闻列表"就地总结/翻译"、文章要点抽取。`capabilities()` 探测 + 不支持浏览器隐藏该功能（渐进增强）。
- 静态可行性：✅ 纯客户端、不下载云端权重、无密钥。Chrome 已正式支持（2026 年 Built-in AI 文档齐全，Edge 有对应端侧模型）。
- 风险：仅部分浏览器可用，必须设计为"锦上添花"而非依赖项。

### 落点 3：本地 RAG 站点问答（"问站长/问这个网站"）——AI 与个人站结合的核心体验
- 做法分两档：
  - 3a（稳）：构建期对 blog/projects/resume 全部页面生成 **embedding 索引**（Pagefind 或本地向量 JSON，构建期用密钥在 CI 完成），运行时浏览器只对用户 query 做端侧 embedding（Transformers.js v4 小模型）→ 本地检索 → 把命中片段交给落点 2/4 的任一 LLM 生成回答。
  - 3b（炫）：WebLLM 直接在浏览器跑量化开源小模型（Qwen/Gemma/Mistral 3B 级，WebGPU），全离线对话。
- 静态可行性：✅ 索引是静态文件，推理全在客户端；模型权重走 CDN 按需拉取。
- 风险：3b 对独显依赖强、首次下载数百 MB，必须用户显式点击触发、放 Worker+流式渲染，且不达标时自动回落到 3a/4。建议 3a 为默认、3b 作为"实验区"彩蛋。

### 落点 4：BYOK 云端 API 兜底问答（浏览器直连 Gemini/OpenAI 兼容端点）
- 做法：用户（站主访客）粘贴自己的 API key 存 localStorage，前端直连；key 永不上传站点。Vercel AI SDK v5+ 可统一 2/3/4 三个引擎的 streamText 接口，@browser-ai/core 这类 provider 已能同时接 Prompt API/Transformers.js/WebLLM。
- 静态可行性：✅ 技术上可行，但密钥安全、CORS、配额归属细节交**后端方案**统一裁定；前端仅承诺：不内置任何共享密钥、默认关闭、仅显式授权后启用。

### 落点 5：AI 个性化体验（低风险点缀）
- 阅读偏好端侧学习（内置 AI 分类 API）→ 动态调整新闻排序/主题色；简历页"AI 生成个人化导览词"（访问路径不同，落地文案不同）。全部可用落点 2/3 的引擎实现，不新增依赖。

---

## 3. 风险与红线（前端承诺）

1. **不在前端代码/仓库中存放任何 API 密钥**（构建期密钥只进 Actions Secrets）。
2. 所有 AI 功能均为渐进增强：关闭/不支持时站点核心内容（首页、新闻、简历、blog）100% 可用。
3. 端侧推理一律 Web Worker + 流式输出，不阻塞主线程；有 CPU/无 WebGPU 环境自动降级。
4. 性能预算写进 CI（首屏 JS ≤150KB、LCP <1.5s、a11y 无严重违规），不过关不合并。
5. Firefox 对新 CSS API 支持滞后，全站以"能用、不丑"为底线，炫技效果不做功能依赖。

## 4. 头脑风暴功能点子（前端视角，3 条）

1. **⌘K 命令面板 + WebMCP 站点代理接口**：Cmd+K 唤起全站搜索/导航/AI 问答；同时把站点注册为 Chrome WebMCP 源试用的 structured tool（"这个站点对 AI agent 可编程"）——极前沿，几乎无个人站做过，"体现站长技术"的差异化杀器。风险：WebMCP 处早期，作为实验区功能。
2. **WebGPU 生成艺术首页背景**：极简首页（站点名+身份）之下是一层响应鼠标的 GPU compute 粒子/流场 shader，附 FPS 面板开关——视觉签名 + 图形能力双证明，CSS 渐变降级。
3. **"技术选型对比"互动 blog 系列 + 同构 demo 沙盒**：把 A/B/C 三栈在同一内容下的 bundle/渲染对比做成站内交互实验（StackBlitz SDK 嵌入沙盒跑实时 demo），既有内容营销价值又秀架构能力。

## 5. 移交/待裁定问题（给项目 & 后端）

- 密钥与配额：落点 1（CI 侧）与落点 4（访客侧）的密钥策略以后端方案结论为准；前端默认按"公开仓库 + 站主自持密钥"设计。
- 仓库公开/私有决定 Actions 免费额度，建议站主选公开。
- Node 版本基准沿用 .nvmrc（本机 24.19.0 可用），实施期由开发运维确认 CI 镜像。
- UI 层完全等设计方向的 2-3 个概念，前端所有选型对三种方向均无冲突。

---

参考来源（调研依据）：
- [Chrome 内置 AI / Gemini Nano 文档](https://developer.chrome.com/docs/ai/built-in)
- [web.dev AI 专栏（WebLLM / Prompt API 教程）](https://web.dev/explore/ai)
- [2026 年必火的 5 个 JS 新趋势：ES2026、Wasm 组件模型与端侧 AI 落地](https://juejin.cn/post/7680137672493563938)
- [2026 前端技术选型全景图](https://blog.csdn.net/weixin_40297452/article/details/162605802)
- [Best Frontend Frameworks 2026](https://quartzdevs.com/resources/best-frontend-frameworks-2026-every-major-javascript-framework)
- [Chrome 本地 AI 接入 Vercel AI SDK 实测](https://www.163.com/dy/article/L5G5P1MS05561FZM.html)
- [浏览器本地跑大模型完整指南](https://blog.csdn.net/xxue345678/article/details/163072969)
