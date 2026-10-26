# 佳瑞网 website6.0

Astro 纯静态个人/技术展示站（无后端、无数据库，GitHub Pages 托管）。站主裁定基线：站点长期保持纯静态，核心定位是技术展示（设计/UI/交互）。（docs/decisions/ruling-index-phase1.md §四）

- 线上地址（当前主入口）：https://longzhengyun.github.io/website6.0/
- www.jary8.com 暂仍由旧站 website5.0 占用；域名换绑按站主裁定（seq=84）延后至本版上线后执行。`astro.config.mjs` base 维持 `/website6.0/`，换绑时配套改 `/` 并更新 `SITE_URL`（操作清单：docs/impl/website6.0-impl-owner-checklist.md §D）。
- 页面：首页（index）/ 关于（about）/ 资讯（news）/ 简历（resume）+ 命令面板（⌘K）。

## 技术栈

Astro 5（SSG，默认零 JS + Islands）· TypeScript strict · Tailwind CSS 4（CSS-first，@tailwindcss/vite）· View Transitions / scroll-driven animations（纯 CSS 动效）· Node 以 `.nvmrc` 为准（24.19.0）。

## 开发

```bash
nvm use                 # Node 24.19.0
npm ci                  # 依赖锁定 package-lock.json
npm run dev             # 本地开发
npm run check           # astro check（类型 + 组件检查，CI 门禁同款）
npm run build           # 静态构建 → dist/
npm run preview         # 预览构建产物
```

质量口径（站主裁定）：不引入 Playwright；防线 = astro check + ESLint 门禁（二期 P-4 落地中）+ 手工冒烟清单 + 部署后 smoke。

## 目录结构

```
src/pages/          4 个页面
src/components/     SiteHeader / SiteFooter / TabBar / CommandPalette
src/layouts/        BaseLayout
src/styles/         theme.css（设计 token，暗色 #ff7b81 统一朱红系为二期 P-2 基线）+ global.css
src/data/           site.ts / about.ts / resume.ts / taglines.ts / news.ts + news.json（管线产物）+ news-stats.json
pipeline/           资讯采集管道契约：config/sources.json · schema/news.schema.json · prompts/news-enrichment.md · src/llm/adapter.ts
scripts/news-pipeline.mjs   管线入口（构建期/定时运行，非站内运行时）
.github/workflows/  deploy-pages.yml（CI 部署）· news-pipeline.yml（定时采集+回写）
docs/               项目档案：ADR/选型否决/裁定索引/方案/实施/测试/关键截图（入口 docs/index.md）
```

## 资讯 Pipeline 运行手册

数据流：RSS/HN 源白名单 →（LLM 去重+中文摘要+标签，或降级纯 RSS）→ `src/data/news.json` + `news-stats.json` → bot 回写 commit → deploy-pages 构建上线。失败自动保留上一版数据。

- 调度：每日 2 次（cron `15 1,9 * * *` UTC）+ 手动 workflow_dispatch；平台限制：高峰期可能延迟数小时。提频涉按量费用，未经站主裁定不调整（D-R2-7）。
- 模式：`LLM_API_KEY` 缺位=自动降级 `rss_only`（纯聚合无摘要）；存在=`ai` 模式。提供商经 `LLM_PROVIDER` 切换（默认 gemini；当前线上为 tongyi/qwen）。
- Secrets / Variables（键名表与生成方式详见 docs/impl/website6.0-impl-owner-checklist.md §B）：
  | 键 | 类型 | 作用 |
  |---|---|---|
  | `LLM_API_KEY` | Secret | AI 摘要；缺位即降级 |
  | `NEWS_SYNC_PAT` | Secret | 仅 news.json 回写（fine-grained，单仓 Contents 读写，与 LLM key 权限分离；注意过期将导致静默断链） |
  | `LLM_PROVIDER` / `LLM_MODEL` / `LLM_BASE_URL` | Variable | 提供商/模型/端点覆盖 |
  | `LLM_TOKEN_BUDGET` | Variable | 单 run token 上限防超额（另含 ≤100 calls 硬顶） |
  | `SITE_URL` | Variable | canonical 站点 URL（换绑日改 www.jary8.com） |
- 红线（workflow 文件头注释为准）：仅 schedule/dispatch 触发、不 checkout 外部 ref；密钥只进 Secrets，产物入库前有 grep 密钥门禁；GITHUB_TOKEN 只读。
- 数据约束：news.json 上限 100 条（站主指令 seq=621，total_cap 与 schema maxItems 对齐），无窗口外存档。
- 本地跑一次（不提交）：设置环境变量后 `node scripts/news-pipeline.mjs`。
- 已知缺陷（待站主批复是否修复，P-3a）：infoq-cn 时区解析致 13/100 条 `published_at` 为"未来日期"，污染排序展示。

## CI/CD

push master → `deploy-pages.yml`：`npm ci` → `npm run check` → `npm run build` → Pages 部署（configure-pages@v5 / deploy-pages@v4）。check 或密钥 grep 失败不部署。边缘缓存 ≤600s，发布后短时间内可能读到旧 HTML。

## 决策与档案治理

- 唯一裁定入口：站主群消息。索引：docs/decisions/ruling-index-phase1.md（seq→commit→文档）。
- ADR：docs/adr/；选型与否决（含复审条件）：docs/decisions/website6.0-decisions.md——**提新功能前先查 V1-V8 否决池**，改判需引用站主新裁定。
- 一期完整方案/实施/测试档案：docs/index.md（34 文档 + 28 关键截图实体收录）。
