# website6.0 M3 切换点核验报告（测试侧，本地实跑）

作者：测试 ｜ 日期：2026-10-23 ｜ 对象：E:\Jary\github\website6.0 @ feat/website60-m1m2-20261023，HEAD `ffde584`（工作区 clean）
依据：shared/website6.0-impl-test-acceptance-checklist.md v1.3 §6 待办 2（三项）+ 项目消息 cmsg_01m5kkdb0g1mt3q2s8fjddtak8 分派
证据目录（绝对路径）：`E:\Jary\qa-outputs\website6.0\M3-local-20261023-01\`（含 local-static-checks.js/txt 原始输出）
环境：Node v24.19.0（E:\Jary\github\.tools\node-v24.19.0-win-x64\node.exe，= .nvmrc 基准）

## 结论速览

**§6 待办 2 三项全部通过**；本地可即时执行的 8 组用例全过（明细 §B）；发现 1 个**非阻断依赖缺口**（管线执行脚本未入库，§C-1）和 1 处**清单口径澄清**（AC-P05 ⌘K，已修 v1.3.1，§C-2）。D 组数据类断言按登记口径处于 Blocked(待管线首跑)，见 §D。

## A. 切换点三项核验（全部独立实跑，非转述）

### ① seed 重命名 + 契约路径接管 — 通过
- `src/data/` 实际内容：`news.seed.json`、`news.types.d.ts`、`news.ts`、about.ts/resume.ts/site.ts；**`news.json` 已不存在**（契约路径空位待管线首跑创建，与"管线唯一写者"设计一致）。
- seed 按 crosscheck §3 映射表迁移到位（Node 解析断言）：顶层 `schema_version=1/generated_at/mode/items`；`mode="rss_only"`（枚举仅 ai|rss_only ✓）；条目字段 `fingerprint,url,title_original,title_zh,summary_zh,tags,level,source_id,source_name,published_at,pipeline`；**无 note 越契约字段**（additionalProperties:false 前提成立）；6 条 `published_at` 全部带时刻（RFC3339 形态正则 ✓）；tags 全落 7 值词表 ✓；fingerprint 全部 `^[0-9a-f]{16}$` ✓；summary_zh 全部 ≤160 ✓；逐条 `pipeline={mode:"rss_only",enriched_by:null,run_id:"seed"}` ✓。
- 独立 schema 校验（ajv 2020-12，用仓库 node_modules/ajv，管线产物同款规则）：**seed 对 pipeline/schema/news.schema.json PASS**。注：ajv 未装 ajv-formats，date-time/uri 格式级未断言（已用正则人工覆盖 published_at/fingerprint），结构/枚举/长度约束全部生效。裁定 5 下本项为超额证据（seed 本可豁免），不改变"seed 不参与 D 组断言"的口径。

### ② news.ts 生成类型 + 映射表字段名 — 通过
- `news.types.d.ts` 头部为 json-schema-to-typescript 自动生成标记（"DO NOT MODIFY IT BY HAND"），interface `Website60NewsJson` 与 schema 描述一致（mode 两值枚举、tags minItems1/maxItems3 元组约束、stats_ref 可选）。
- `src/data/news.ts`：`import type { Website60NewsJson } from './news.types'`，不再手写接口；`as unknown as` 断言仅规避 JSON 推断的 tags 元组限制（注释注明运行时校验归管线落盘前 schema——与裁定 6 一致）。
- 消费点机械改名核实（grep dist + src）：`news.astro:45/48/51/52`、`index.astro:62/67/69`、`BaseLayout.astro:25` 全部使用 `title_zh/summary_zh/published_at/source_name`；无旧字段名（`publishedAt/summary:` 等）残留于渲染路径。

### ③ deploy workflow 三路径 grep 门禁 — 通过
- 仓库 `.github/workflows/deploy-pages.yml` 与 `shared/website6.0-impl-deploy-pages.yml`（开发运维 seq=130 更新版）**逐行 diff 一致**；`news-pipeline.yml` 同样与 shared 最新版 **零差异**。
- deploy 门禁循环覆盖 `src/data/news.json / news-stats.json / news.seed.json` 三路径、带 `[ -f ]` 守卫（缺位不误报）+ dist 全目录 `grep -rIqE`（AIza/ghp_/github_pat_/AKIA/PRIVATE KEY 五特征）。
- pipeline 门禁同批覆盖 news.json + news-stats.json，回写 `git add/status` 亦含两文件（stats 不会被静默丢弃，开发运维关注点落实）。

## B. 本地即时用例结果（无部署地址可跑部分）

| 用例 | 结果 | 关键证据 |
|---|---|---|
| astro check（复跑） | 通过 | 0 errors / 0 warnings / 0 hints（15 files） |
| astro build（复跑） | 通过 | 4 page(s) 1.47s，Complete |
| AC-SEC01 密钥零外泄面 | 通过 | `git log -p --all` 五特征+扩展 api_key 正则 **0 命中**；`git grep HEAD` 跟踪文件 0 命中；重建后 dist/ 0 命中（退出码 1=无匹配，原始输出在 evidence） |
| AC-SEC02 触发器审查 | 通过 | news-pipeline.yml 仅 `schedule`(cron 15 1,9) + `workflow_dispatch`；无 pull_request_target；checkout ref:master + persist-credentials:false |
| AC-SEC05 双门禁在位 | 通过 | deploy（dist 全扫+三路径循环）与 pipeline（双文件）两处均 set -euo pipefail + exit 1 阻断 |
| AC-SEC06 凭据分离 | 通过 | `permissions: contents: read`（GITHUB_TOKEN 只读）；回写走独立 `NEWS_SYNC_PAT`；`LLM_API_KEY` 仅注入 pipeline job；无 token 回显路径（set-url 不回显）。站主侧 PAT 创建/告警设置属人工门禁，跟踪其在位性（A1 建仓清单） |
| AC-P03 静态半段（noopener） | 通过 | 四页 `_blank` 锚点 12 处（4/7/1/0），missing noopener=0 |
| AC-M05 静态半段（viewport） | 通过 | 四页 viewport 均 `width=device-width, initial-scale=1, viewport-fit=cover`，无 user-scalable=no |
| AC-P05 简历红线（静态） | 通过 | header/tab bar 段"简历/Resume"命中 0；出现位置仅页脚、About 内链区、⌘K 面板条目、resume 页 title/meta（均合规暗线/非导航区，见 §C-2） |
| CommandPalette 修复回归 | 通过 | 四页 `data-palette-index` JSON.parse OK、entries=10、字面量占位 false（fa80c64 修后无回归，覆盖 AC-G03 前置） |
| AC-AI-D03 静态半段 | 通过 | News 页无"AI摘要"虚假宣称、含"数据来源/构建期/RSS"说明与 rss_only 标识 |
| AC-REL01 本地半段 | 通过 | dist 结构 index.html+news/about/resume 目录+_astro+favicon+robots+CNAME；`public/CNAME` 内容精确 `www.jary8.com`（a8d663a 补交已核）；astro.config.mjs:8 site 行在位（SITE_URL 消费） |

未列入本轮：一切依赖部署地址的动态项（Lighthouse/axe/对比度实测/375 真机/Network 断言/回写 commit 序列等），M4 建仓后按清单执行。

## C. 发现与建议（不修码，转对应 owner）

1. **[中·M3 依赖缺口，不阻塞本核验] 管线执行脚本未入库**：`.github/workflows/news-pipeline.yml` 步骤 `node scripts/news-pipeline.mjs`，但仓库**无 scripts/ 目录**（`pipeline/src/` 仅 llm/adapter.ts 接口契约转写）。当前状态下 schedule/dispatch 实跑会在该步骤 fail（行为安全：失败不回写、保留上一版，符合 SEC04 精神；但 M4 前 AC-AI-D01/D05 无数据可验）。owner 建议：后端（脚本实现入库为管线首跑前提）；开发运维在 A1 建仓后第一次 dispatch 实测确认。**建议项目把"scripts/news-pipeline.mjs 落位"列入 M3 收尾必交项。**
2. **[低·口径澄清，测试侧已自修] AC-P05 ⌘K 表述**：原"⌘K 默认视图不得出现简历字样"过严——产品 IA（proposal-product §2）明确 ⌘K 为允许的暗线通道，面板含"Résumé 在线简历"条目合规。清单升 v1.3.1：禁字区域=header/tab bar。非前端缺陷，无返工。
3. **[信息] ajv-formats 缺位**：seed 独立校验为结构级 PASS；若希望 CI 内做 schema 校验（管线侧后端已内置落盘前校验，前端仓无需引 ajv——前端回报"未引 ajv"与裁定一致性成立），无行动项。

## D. D/F 组当前可执行状态（按 v1.3 两阶段口径）

- AC-AI-D01/D05：**Blocked(待管线首跑)** — 契约 news.json 尚未存在（本轮确认空位合规）；前置=§C-1 脚本落位 + A1 建仓 + 首次 dispatch/schedule 产出。产出后 D 组数据断言即跑（seed 阶段 N/A 口径已被本轮 seed=契约同构 PASS 超额覆盖）。
- AC-AI-D02/D03/D04：D03 静态半段已过（§B）；D02/D04 待 M4 部署环境（Network 断言）与管线首跑（模式切换演练）；D04 的解耦性本轮已获强证据（seed 即契约同构、消费点仅类型层）。
- F 组：维持 Blocked(等 key)，裁定不变。

## E. 交付状态

§6 待办 2 三项核验 **完成并通过**；本地即时用例 12 组全部执行并留证。M4 主体验收等待部署地址（站主 A1 建仓窗口）；届时按清单四态记录逐条执行。残余风险：真机可用性未确认（AC-M18 emulation 降级预案在案）、连通性 push 重试策略不影响本地证据。
