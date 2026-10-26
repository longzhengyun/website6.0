# website6.0 后端交叉验证：news.ts / news.json 与 schema 契约对齐审查

审查人：后端 ｜ 日期：2026-10-23 ｜ 性质：只读审查（未改码）
对象：E:\Jary\github\website6.0 分支 feat/website60-m1m2-20261023（commit b36790c）
- src/data/news.ts:1-27
- src/data/news.json:1-62
基准契约：shared/website6.0-impl-news-schema.json、shared/website6.0-impl-backend-pipeline.md §7/§8

## 结论一句话

**路径契约完全对齐；数据契约未对齐（预期内——seed 先于管线定稿），但差异是纯命名/枚举层，无语义冲突。** 前端已在汇报中声明"后端 schema 有出入只需改 src/data/news.ts 接口"，建议按 §3 方案在 M3 迁入时一次性对齐，不构成 M2 阻断。

## 1. 对齐项 ✅

| # | 项 | 证据 |
|---|---|---|
| A1 | 文件路径 | seed 与未来管线产物均为 `src/data/news.json`，与 pipeline.md §7 路径契约、devops workflow 两处 grep 路径三方一致 |
| A2 | 顶层结构骨架 | 顶层含 version / mode / generatedAt / items[]，与 schema 的 schema_version / mode / generated_at / items 概念一一对应，仅命名风格差异（camel vs snake） |
| A3 | 条目核心字段语义齐备 | url、标题、简介、来源、发布时间、标签数组全部存在；"标题+简介+直跳"需求字段闭环 |
| A4 | 排序逻辑兼容 | news.ts:23-25 按发布时间字符串倒序——schema 的 published_at（更完整的 ISO8601）同样按字典序正确，重命名后可直接复用 |
| A5 | 简介长度容错 | seed summary 60–90 字符 < schema summary_zh maxLength 160，渲染容错口径与交付汇报给前端的提示一致 |
| A6 | 三态 mode 设计意图 | seed/degraded/full 与我"AI 模式/降级模式"分层意图同向（degraded≈rss_only、full≈ai），news.json:5 自注即锚定 news-schema |
| A7 | stats_ref | schema 中为可选字段，seed 未提供不违规；「本站数据心跳」文件不占用 news.json 契约 |

## 2. 不对齐项 ⚠（M3 迁入时需处理，逐条附建议处置）

| # | 位置 | 现状 | 契约要求 | 严重度 | 建议处置 |
|---|---|---|---|---|---|
| B1 | 顶层 mode 枚举 | news.ts:13 `'seed'\|'degraded'\|'full'` | schema `mode ∈ ["ai","rss_only"]`（管线产物的唯一真值集） | 低（枚举语义重叠） | **枚举定为 `ai`/`rss_only` 两个**；`seed` 态不应由 mode 表达——建议 seed 文件重命名 `news.seed.json`（契约外占位），或至少在 schema 独立校验（测试 D 组用例）时豁免 seed 文件。前端类型随 §3 映射表改 |
| B2 | 字段命名全表 | id / title / summary / source / publishedAt / version / generatedAt（news.ts:2-8,12-13） | fingerprint / title_original+title_zh / summary_zh / source_id+source_name / published_at / schema_version / generated_at | 中（机械改名，但 title 一拆二、source 一拆二） | 按 §3 映射表一次性对齐；`title` 在 seed 里本就是我处理的中文标题，迁 `title_zh` + `title_original=title_zh` 即可 |
| B3 | tags 词表 | news.json:14 等使用 browser/webgpu/js/wasm/css/framework/build（自由词表） | 7 值枚举 `frontend/ai/tools/standards/career/security/other`（prompt 词表与 schema 同源，改动需双向同步，见 prompt 文件"变更纪律"） | 中（词表分歧会扩散到 prompt/schema/测试断言三处） | **保持 7 值枚举不动摇**（它是 LLM 约束输出的产物）；seed 标签迁入时改映射（browser/webgpu/js/wasm→frontend 或 tools；css→standards 或 frontend；framework/build→tools）。前端 allTags 是数据驱动（news.ts:27），筛选 UI 无需硬编码词表，实际不受影响 |
| B4 | 时间格式 | news.json:13 等 `"2026-10-18"`（date-only） | schema `format: date-time`（RFC3339 含时刻） | 低 | 管线产出恒为完整 ISO8601；seed 改一行样例值即可 |
| B5 | 必填字段缺失 | 条目无 fingerprint、level、pipeline{mode,enriched_by,run_id}；无 duplicate_of/original_lang | schema items 必填集（fingerprint/published_at/pipeline 等 10 项） | 中（schema 独立校验必失败——测试 D 组第 2 条会拦） | 这正是 seed≠契约数据的体现；方案见 B1（豁免）或迁入时补全（fingerprint 按归一化 URL 现算，pipeline.mode=seed 记 `rss_only`+note） |
| B6 | `feed as NewsFeed` 无运行时校验（news.ts:21） | TS 断言不校验 JSON 实际形状 | — | 信息 | 非契约违反；建议 M3 起用 json-schema-to-typescript 从 `pipeline/schema/news.schema.json` 生成类型替换手写 news.ts（pipeline.md §7 已预留该机制），消除"两份定义漂移"这一首要长期风险 |

## 3. 推荐对齐方案（供项目调度 M3 迁入时执行）

1. **契约唯一性**：`pipeline/schema/news.schema.json` 为唯一数据契约；管线是 `src/data/news.json` 唯一写者（落盘前已过 schema 校验，pipeline.md §1 第 7 步）。
2. **seed 处理**：重命名 `src/data/news.seed.json` 并在代码里显式标注"契约外开发占位数据"；首跑管线覆盖 `src/data/news.json` 后自然退役。避免"seed 态写进正式契约"污染 mode 枚举。
3. **前端接口迁移面**（回应前端"只需改 news.ts"的声明——确认属实）：仅 `news.ts` 一个文件按映射表改字段名与枚举 + News/About 页若有直接引用 `publishedAt/title/summary` 处随 import 改名（IDE 可全查，改动机械）；渲染层、筛选逻辑、样式零改动。
4. **映射表**（迁入执行清单，给前端/项目直接消费）：

| 现字段 | 契约字段 |
|---|---|
| version | schema_version |
| generatedAt | generated_at |
| mode: degraded/full | mode: rss_only / ai |
| id | fingerprint（16hex，重算） |
| title | title_zh（另补 title_original） |
| summary | summary_zh |
| source | source_name（另补 source_id） |
| publishedAt | published_at（补时刻与时区） |
| tags（自由词） | tags（7 值枚举，映射见 B3） |
| — | level（seed 恒 general）、pipeline{mode:"rss_only",enriched_by:null,run_id:"seed"} |

5. **测试衔接**：D 组"JSON Schema 独立校验"用例建议对 `news.seed.json` 与 `news.json` 区分断言——迁入完成前 news.json 允许=seed 内容，但完成校验必须跑在管线首次真实产出上。

## 4. 审查留痕

- 未修改任何仓库文件（只读）；seed 六条链接真实可达性属 M4 测试范围，不在本审查项。
- sources.json / prompt.md / pipeline.md 与仓库现状无冲突项；devops 的 workflow grep 路径按 §7 已对齐（其交叉验证由开发运维侧确认）。
