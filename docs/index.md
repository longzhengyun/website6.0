# website6.0 档案索引（docs/ 归档地图）

维护人：佳瑞网-知识｜建立：2026-10-26（P-1 一期档案 git 化）
来源：一期协作会话共享目录（conv_01m5kf62xa44v7nz4g43jb3g78/shared，2026-10-23 ~ 10-26 产物），本次全部实体收录进仓库。
收录口径：文档全量实体收录（34/34）；关键验收/裁定依据截图目录全量实体收录（28/28，共约 2.2MB）；机器级原始证据与浏览器缓存不收录（见"未收录清单"）。

## 快照时效声明
- `impl/` 内的 workflow/schema/sources/prompt/deploy 副本是**一期定稿时点快照**，运行事实源永远是 `.github/workflows/` 与 `pipeline/` 目录当前版本；两者不一致时以仓库当前文件为准，快照仅作决策溯源。
- 文内引用的 `shared/`、`EV/`、`qa-outputs/` 路径指当时本机会话缓存，clone 者不可达；对应内容已实体化到 `docs/`（文档与关键截图），未实体化部分见"未收录清单"。

## 一、决策层（docs/adr · docs/decisions）
| 文件 | 类型 | 说明 | 去向 |
|---|---|---|---|
| adr/website6.0-adr.md | ADR | 站主裁定归档 ADR-001~004 | 已收录 |
| decisions/website6.0-decisions.md | 选型/否决记录 | S1-S9 采纳、V1-V8 否决/暂缓、遗留观察项 | 已收录 |
| decisions/ruling-index-phase1.md | 裁定索引 | 一期站主裁定 seq→commit/文档 映射补录（本次新增） | 已收录 |

## 二、方案层（docs/proposal，8 份）
| 文件 | 类型 | 去向 |
|---|---|---|
| website6.0-requirements.md | 需求原文 | 已收录 |
| website6.0-proposal-overview.md | 总方案（Q1-Q14 裁定入口） | 已收录 |
| website6.0-proposal-product.md | 产品方案 | 已收录 |
| website6.0-proposal-design.md | 设计方案 | 已收录 |
| website6.0-proposal-frontend.md | 前端方案 | 已收录 |
| website6.0-proposal-backend.md | 后端方案（pipeline 设计） | 已收录 |
| website6.0-proposal-devops.md | 开发运维方案 | 已收录 |
| website6.0-proposal-knowledge.md | 知识侧方案（基线/缺口） | 已收录 |

## 三、实施层（docs/impl，16 份）
| 文件 | 类型 | 去向 |
|---|---|---|
| website6.0-impl-product-scope-v1.2.md | 范围/验收标准 | 已收录 |
| website6.0-impl-product-brand-copy.md | 品牌文案 | 已收录 |
| website6.0-impl-product-mobile-acceptance.md | 移动端专项验收 | 已收录 |
| website6.0-impl-product-acceptance-v1.6-r15r17.md | 验收 v1.6（R15/R17 修订） | 已收录 |
| website6.0-impl-design-spec.md | 设计 spec（至 v1.1.2，含 §8 对比度裁定链） | 已收录 |
| website6.0-impl-design-crossreview.md | 设计交叉评审 | 已收录 |
| website6.0-impl-r15r16-design.md | R15/R16 首页方案 | 已收录 |
| website6.0-impl-frontend.md | 前端实施记录 | 已收录 |
| website6.0-impl-backend-pipeline.md | 后端 pipeline 实施 | 已收录 |
| website6.0-impl-backend-crosscheck.md | 后端交叉核对 | 已收录 |
| website6.0-impl-owner-checklist.md | 站主人工操作清单 v1.0（Secrets/换绑 D1-D5） | 已收录 |
| website6.0-impl-news-schema.json | 新闻数据契约快照 | 已收录 |
| website6.0-impl-news-sources.json | 数据源白名单快照 | 已收录 |
| website6.0-impl-news-prompt.md | LLM 摘要 prompt 快照 | 已收录 |
| website6.0-impl-news-pipeline.yml | 管线 workflow 快照 | 已收录 |
| website6.0-impl-deploy-pages.yml | 部署 workflow 快照 | 已收录 |

## 四、测试层（docs/test，8 份）
| 文件 | 类型 | 去向 |
|---|---|---|
| website6.0-impl-test-acceptance-checklist.md | 验收清单（全量） | 已收录 |
| website6.0-impl-test-dgroup-local.md | D 组本地测试 | 已收录 |
| website6.0-impl-test-m3-verification.md | M3 验证 | 已收录 |
| website6.0-impl-test-m4-online.md | M4 线上验证 | 已收录 |
| website6.0-impl-test-m4-reverify.md | M4 复验 | 已收录 |
| website6.0-impl-test-m41-preflight.md | M4.1 preflight | 已收录 |
| website6.0-impl-test-m4r-0203-verify.md | M4R-02/03 修复复验 | 已收录 |
| website6.0-impl-test-exit-batch.md | 出口批报告（7/7 通过 + BUG-M4R-05 探针假阳撤销 Addendum） | 已收录 |

## 五、关键截图证据（docs/evidence，28 张，实体收录）
| 目录 | 内容 | 张数 | 去向 |
|---|---|---|---|
| evidence/m4-verify/ | M4 响应式/200% 缩放终验（BUG-M4R-03 关闭依据） | 12 | 已收录 |
| evidence/m41-verify/ | M4.1/M4R 视觉与对比度验证（含 dark 复核） | 10 | 已收录 |
| evidence/r1819-verify/ | R18/R19 品牌与 favicon 验收（站主请求 seq=430 依据） | 6 | 已收录 |

## 六、未收录清单（档案完整性证据）
| 项 | 体量 | 未收录理由 | 原始位置 |
|---|---|---|---|
| qa-outputs 机器级原始证据（Lighthouse JSON、CDP 探针输出、axe JSON、HTML 快照、浏览器 profile/缓存） | 约 85MB / 1273 文件（website6.0 全目录） | 非档案资产：属一次性机器原始数据，结论文本已全部固化在 docs/test 各报告内；且混有浏览器 profile 缓存（含本地杂数据），不宜入公开仓库 | E:/Jary/qa-outputs/website6.0/ |
| 二期头脑风暴/方案工作文档（各角色 brainstorm、plan-project(-rev2)、dispatch-plan、knowledge-gaps） | 约 15 份 | 属二期进行中产物，非一期归档范围；定稿后建议随二期任务各自沉淀（P-1 范围外，已在裁定索引登记入口） | 本会话 shared/ |
| 各角色会话缓存（.qoder/memory、sessions/redacted） | 数 MB | 会话临时记忆非团队档案；redacted 含内部会话细节不宜公开入仓 | website6.0/.qoder/ |
| EXIT-20261026-01 报告正文 | 已单独收录核心结论 | 其内容与本目录 test-exit-batch.md 同源，机器附录见上 | docs/test/ |

## 七、溯源规则
- 裁定级决策：先看 adr/ + decisions/ruling-index-phase1.md；再按索引跳 impl/proposal 细节。
- 本文档由 P-1 建档；后续每次站主裁定或里程碑收尾，知识角色按 decisions.md §四更新规则归并补录。
