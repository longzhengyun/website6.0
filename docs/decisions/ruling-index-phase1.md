# website6.0 裁定索引（站主裁定 seq → commit/文档 映射）

维护人：佳瑞网-知识｜建立：2026-10-26（P-1 补录）
用途：一期裁定散落在群消息 seq 与 commit message 中，此前未归并进 decisions.md。本表把"站主原话依据 → 实施落点 → 档案文档"串成一条可抽验链路。裁定权威是群消息原文，本表只做索引；改判必须引用新的站主消息 seq。

## 一、正式 ADR（见 adr/website6.0-adr.md）
| 编号 | 裁定 | 站主依据 | 落点 |
|---|---|---|---|
| ADR-001 | 总方案 Q1-Q14 全按建议采纳（视觉 B+A、双主题、Astro 5 技术栈、jary8.com 方案 A、仓库 public 等） | 消息 cmsg_01m5kgkshnd3dr3v4j7qxzymzz（2026-10-23） | proposal/website6.0-proposal-overview.md |
| ADR-002 | 移动端升级为一等验收项 | 2026-10-23 站主硬性要求 | impl/website6.0-impl-product-mobile-acceptance.md |
| ADR-003 | LLM key 晚点提供，管线降级模式先行 | Q8 挂起 | impl/website6.0-impl-backend-pipeline.md |
| ADR-004 | 域名换绑暂缓、人工门禁 | 站主自定时机 | impl/website6.0-impl-owner-checklist.md §D |

## 二、一期后半段裁定补录（本次归并，此前只在 commit/群消息中）
| 裁定 | 站主依据 | 实施 commit | 档案 |
|---|---|---|---|
| R15 首页单屏 + 桌面资讯脉冲 | 产品裁定 v1.6 | 4bf5fa2 | impl/website6.0-impl-r15r16-design.md、impl/website6.0-impl-product-acceptance-v1.6-r15r17.md |
| R16 三行 hero + tagline 随机池 | 同上 | 3f11699 | 同上 |
| R17 资讯中文-only 展示策略 + 空态分支 | 产品裁定 v1.6 | fbf647e、08b3d11 | acceptance v1.6 |
| R18/R19 品牌文案 jary8→Jary（13 站点文案）+ favicon 改「佳」字 | 站主请求 seq=430 | bd8aad4 | evidence/r1819-verify/（6 张验收截图） |
| 资讯上限 100 条 + 184→100 一次性裁剪（total_cap/schema maxItems 对齐） | 站主指令 seq=621 | dddf791、0ce0a8a | 口径：数据面+展示面同限（站主指令原话范围）；100 条外无存档 |
| 简历：经验/教育默认留白"暂未公示"、保留栏目头、去样例横幅、技能栏实数据 | 站主裁定 seq=621/638 | 194ea40、c5bb835、37ae755（merge 55f849b） | impl/website6.0-impl-frontend.md |
| 亮/暗品牌色冷暖分裂曾判保留 → 二期改判统一朱红系（暗色候选 #ff7b81，对比度复测为准） | 一期：design-spec v1.1 §8 裁定链；二期：seq=84 第 2 项 | 一期落点 38fa315、5c3825a、2805faa | impl/website6.0-impl-design-spec.md（v1.1~v1.1.2）；二期 P-2 |
| BUG-M4R-05 定性撤销：探针 ^2.2 幂近似致假阳，非产品缺陷；确立 WCAG 标准口径+锚点自检 | 设计 seq=493 质疑 / 项目 seq=497 独立复算采纳 | 无代码变更（2805faa 为 M4R-04 静止态修复） | test/website6.0-impl-test-exit-batch.md §4 Addendum |

## 三、角色执行事件登记（非站主裁定，防"未归档即失踪"）
| 事件 | 落点 commit | 备注 |
|---|---|---|
| ruanyifeng 源禁用（CI runner http_403，geo/WAF；zh 活跃源 3 个仍满足裁定基线） | 7136190 | 原 decisions.md 未登记，本次补录；二期若换出口 IP 可复评 |
| LLM 提供商扩展：tongyi(DashScope) 分支 + LLM_TOKEN_BUDGET 防超额 | cbd8ab2、8ceebcd | 现状 pipeline 处于 ai 模式·tongyi（开发运维 2026-10-26 实测） |
| per-source 失败摘要打印（REDACTED） | 65a9880 | 属"零告警投入"下的日志可见性手段，与 D-R2-7 裁定一致 |

## 四、二期方向裁定（本会话，执行基线）
| 裁定 | 站主依据 | 落点 |
|---|---|---|
| 二期主目标=C 技术展示（设计/UI/交互体现技术）；不考虑资讯影响力；长期纯静态、无后端无数据库 | seq=65 | shared/v6.0-phase2-plan-project-rev2.md；本表 |
| D-R2-1 域名换绑延后至本版上线后（base 维持 /website6.0/）；D-R2-2 品牌色统一；D-R2-3 Playwright 不引；D-R2-4 V3=首页展位；D-R2-5 英文版暂不做；D-R2-6 资讯区保留（自动化展示位，pipeline 每日 2 次不动）；D-R2-7 告警/Dependabot 先不要 | seq=84 | shared/v6.0-phase2-dispatch-plan.md（T0/T1/T2 分派定稿） |
| 待批复单点：P-3a 时区缺陷修复（线上 news.json 13/100 条"未来日期"）是否随第 7 项一并搁置 | 项目已向站主请示，待回复 | dispatch-plan §三 P-3a |

## 五、维护规则
- 新裁定落表：裁定发生当日由项目/知识登记一行（依据 seq、原文要点、commit/文档落点）。
- 状态变更须引用站主消息 seq；与 ADR/decisions.md 冲突时以本表最新登记为准，并同步修订 decisions.md。
- 每里程碑收尾，知识角色核对"commit message 中的 seq 引用 ↔ 本表"无遗漏（decisions.md §四归并规则的落地）。
