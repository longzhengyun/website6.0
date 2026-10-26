# website6.0 D 组本地批次执行报告（M4 本地半程，测试）

作者：测试｜日期：2026-10-23
对象：E:\Jary\github\website6.0 @ **f9b9367**（前端 seed→news.json 切换已落定，news.ts:6 `import feed from './news.json'` 实测确认）
依据：shared/website6.0-impl-test-acceptance-checklist.md v1.3.1 §4 D 组 + 项目分派 cmsg_01m5kmrg4303psz20pap1ap8sa
证据目录：E:\Jary\qa-outputs\website6.0\D-group-local-20261023-01\evidence\（dgroup-checks.js/.txt、dist-render-checks.js/.txt、git-incremental-scan.txt、d04-structure-review.txt）
执行方式：全部本地独立实跑，不采信后端/前端自报结论。

---

## 1. 结果总表（D 组 + 附带复验）

| 用例 | 结果 | 关键证据 |
|---|---|---|
| AC-AI-D01 真实性/契约 | **pass** | ajv 2020 独立校验 news.json pass=true errors=0；date-time/uri/fingerprint 人工正则全合规（无 ajv-formats 补位口径）；mode=rss_only、schema_version=1、tags 词表零越界、fingerprint 25/25 唯一、summary_zh 1..160 零违例、逐条 pipeline.mode 一致；抽样 3 条回源（endler.dev / simonwillison.net ×2）HTTP 200 且标题命中 → 25 条 ≥5 真实门槛（AC-P04 交叉过） |
| AC-AI-D02 本地半段 | **pass（本地口径）** | 复跑 astro build（4 页）后扫描 dist 全量 20 文件：script/link/img/iframe/source/video/audio/form 外部 src/href/action、JS 外链字面量、JS Worker/EventSource/WebSocket 构造、CSS url() 外链 —— own hosts（longzhengyun.github.io/jary8.com/www.jary8.com/localhost）白名单外**零命中**。完整 Network 面板断言仍等 M4 部署地址 |
| AC-AI-D03 降级 UI 同构 | **pass（渲染态全量）** | news 页真实条目标题命中 25/25（初测 24/25，MISS 项 `Today's PHP...` 核实为 `'`→`&#39;` 实体转义的测试脚本假阴性，页面实际渲染）；seed 独占 6 标题零泄漏；页面位置序 vs published_at 倒序违例=0；target=_blank 缺 noopener=0；"AI摘要"宣称不存在、来源说明 footer 在位 |
| AC-AI-D04 切换设计就绪 | **pass** | pipeline/config/sources.json（10 源）+ pipeline/prompts/news-enrichment.md + pipeline/schema/news.schema.json + pipeline/src/llm/adapter.ts + scripts/news-pipeline.mjs 五件套齐；env 读取点单点收敛（LLM_KEY 空⇒rss_only 路径实证于 stats.llm.key_present=false/calls=0）；注入=配 Secrets `LLM_API_KEY` 一步（workflow 已带 `${{ secrets.LLM_API_KEY }}` 注入），撤 key 即回降级，双向可逆成立 |
| AC-AI-D05 run 元数据/时间戳 | **pass** | news.json generated_at 与 stats generated_at 距今 0.26h、无未来时间；stats.news_items_total=25 与 items 实数一致；published_at 无未来条目；llm 零调用与 rss_only 自洽。**run_id 差异可解释**：items run_id=local-20261023053905，stats run_id=local-20261023053919，`short_circuited=true` 证明 stats 为二跑（无新增短路）记录、news.json 为首跑产物——与后端自证的 SHORT_CIRCUIT 二跑行为吻合，不算造假但见观察项 2 |
| SEC05 产物密钥扫描 | **pass** | workflow 五特征 + api_key 赋值形态扩展正则扫 dist 全量 + news.json + news-stats.json 共 22 文件 0 命中 |
| SEC01 增量历史扫描 | **pass** | `git log -p ffde584..f9b9367`（含 ac49854/f9b9367 两笔新提交全 diff，1262 行）五特征 0 命中、api_key 形态 0 命中 |
| astro check / build 复跑 | **pass** | check：15 files 0 errors/0 warnings/0 hints；build：4 page(s) built in 1.75s Complete |
| M3 静态回归复跑（新 dist） | **pass** | 复用 M3-local 批次脚本：四页 viewport 无 user-scalable=no、header/tab bar 简历禁字 0 命中（⌘K 面板「Résumé 在线简历」为 v1.3.1 允许暗线）、palette JSON 4/4 OK、CNAME=www.jary8.com、seed 自身 ajv 亦 PASS |

**结论：D 组五项（D01/D03/D04/D05 全量，D02 本地半段）从 Blocked 转 pass；无未通过项。** M3 数据链路（管线产物→契约校验→前端消费→渲染）本地闭环成立。

## 2. 观察项（不阻塞）

1. **源覆盖 5/7**：stats 显示 `webdev`、`arxiv-cs-ai` 首跑 status=failed（fetch failed，本地网络波动概率大）。管线容错行为正确（其余源继续、errors=[]、degraded_all_sources=false）。M4/M6 部署环境复跑时复查 sources 状态，若持续失败需后端核查源地址可达性。
2. **stats 与 news.json run_id 不同源**：当前入库的 news-stats.json 是 short_circuit 二跑记录（new_items=0），并非生成 news.json 那次首跑的 stats。契约允许（stats 反映最近一次 run），但若「本站数据心跳」要展示"哪次 run 产出了当前数据"，消费口径应取 `items[].pipeline.run_id` 而非顶层 stats.run_id。建议产品/前端知悉，非缺陷。
3. **HN 条目 published_at 语义**：`endler.dev/2024/...` 原文为 2024 年文章，published_at=2026-10-23 是 HN 发帖时间（feed 语义）。"新鲜度"以源发布时间为准，与白名单源行为一致，验收按 feed 原值判定为真。
4. **env 命名与清单引用有偏差**：后端 §6 口径写作 `LLM_PROVIDER/LLM_MODEL/LLM_API_KEY`，实际实现为 `LLM_API_KEY` + `GEMINI_MODEL`（provider 固定 Gemini，无 LLM_PROVIDER）。解耦与一步注入结论不受影响；清单 v1.4 已将 D04 校验目标更正为实际变量名（以代码为准）。

## 3. 剩余状态与衔接

- **等 M4 部署地址（站主 A1 建仓）**：AC-AI-D02 Network 面板完整断言、F 组正常态回归、其余部署地址类条款（AC-G01/REL01 等）——清单 §0 已锚定 longzhengyun.github.io/website6.0。
- **等 LLM key（站主提供）**：F 组 AC-AI-F01~F05 整组；届时 AC-AI-D04 的"一步注入"将做真实验证（现仅结构就绪审查）。
- seed 阶段豁免口径（N/A(等M3)）自本报告起全部解除，D 组以 f9b9367 迁移后文件为最终对象（清单 §6 待办 2 的"D 组全量在 M4 前复跑一次"已完成）。
