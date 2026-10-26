# website6.0 站主人工操作清单（定稿 v1.0 · 开发运维）

状态口径：M1/M2 期间站主**零必须操作**（建仓也不阻塞前端本地开工）；下表按里程碑触发。
原则：所有操作可逆、单项 ≤5 分钟、不暴露密钥明文到群聊（生成后直接填入 GitHub Secrets 输入框即可，无需发给任何人）。

## A. 现在可提前做（可选，3 分钟）

| # | 操作 | 位置 | 耗时 |
|---|---|---|---|
| A1 | 创建 public 仓库 `website6.0`：New repository → owner=longzhengyun，名称 website6.0，**Public**，不勾选 Add README / .gitignore / license → Create | github.com 网页 | 3 min |

说明：Public 是 Q11 裁定结果，也是 Actions 免费长跑 + 本密钥方案安全前提（密钥只进 Secrets，不进代码/产物，有 grep 门禁双保险）。

## B. Secrets / Variables 键名表（建仓后按需注入，M1/M2 均可为空）

| 键名 | 类型 | 注入时机 | 用途 | 站主怎么生成 |
|---|---|---|---|---|
| `SITE_URL` | Variable | 建仓即可（可先不设，workflow 有默认值 `https://longzhengyun.github.io/website6.0/`） | 站点 canonical URL；换绑日改为 `https://www.jary8.com/` | Settings→Secrets and variables→Actions→Variables→New |
| `LLM_API_KEY` | Secret | **M3、站主 key 到位后**（晚点提供已裁定，不阻塞） | 新闻管线 AI 摘要；缺位时管线自动降级为纯 RSS 聚合 | 提供商控制台生成 API key（建议 Gemini 免费档），直接粘贴进 Secrets，**不要发到群聊** |
| `NEWS_SYNC_PAT` | Secret | M3，与 LLM key 同期 | bot 回写 news.json 专用，与 LLM key 权限分离（后端红线 4） | fine-grained PAT：仅授权 `website6.0` 一个仓库、权限只有 Contents: Read and write、不设 expiry 建议 1 年 |
| `GEMINI_MODEL` | Variable | 可选，M3 | 覆盖默认模型名（后端适配层已有默认值，一般无需设置） | 同 SITE_URL 方式 |

## C. 提供商控制台用量告警（M3 期，约 3 分钟，配额唯一硬熔断，后端 B-5）

| # | 操作 | 耗时 |
|---|---|---|
| C1 | 在 LLM 提供商控制台设置用量/费用告警（免费档额度 80% 预警），账号级预算通知开启 | 3 min |

## D. 域名换绑 jary8.com ——【暂缓 · 时机由站主自定】

前提：M4 路径地址（`https://longzhengyun.github.io/website6.0/`）验收通过。**顺序执行，约 10 分钟 + HTTPS 生效等待（通常 <10 min，偶发至 1 h）：**

| # | 操作 | 位置 | 说明 |
|---|---|---|---|
| D1 | website5.0 Settings→Pages→Custom domain **清空**并 Save | website5.0 仓库 | 解除域名占用（GitHub 域名仓库级唯一）；此步完成后 5.0 降级为 `longzhengyun.github.io/website5.0` 路径访问（Q13：保留） |
| D2 | website6.0 Settings→Pages→Custom domain 填 `www.jary8.com` → Save → 勾选 **Enforce HTTPS** | website6.0 仓库 | 仓库 `public/CNAME` 已在构建门禁校验（值必须精确等于 www.jary8.com） |
| D3 | `SITE_URL` Variable 改为 `https://www.jary8.com/`，随后手动触发一次 deploy-pages workflow_dispatch | website6.0 Actions | 刷新 canonical URL/sitemap |
| D4 | 阿里云 DNS 控制台**只核对不修改**：apex 与 www 的 CNAME→longzhengyun.github.io 在位（实测已就位） | aliyun 域名控制台 | 2 min |
| D5 | 验证交测试执行：`https://www.jary8.com`、`https://jary8.com`（301→www）、证书链、6.0 内容指纹 | — | 团队负责，站主无操作 |

**回滚**：反向执行 D2→D1（清空 6.0 域名、恢复 5.0 的 www.jary8.com），10 分钟内恢复 5.0 上线，无不可逆步骤。

## E. 汇总时间预期

| 阶段 | 站主操作 | 耗时 |
|---|---|---|
| M1/M2 | 无（A1 可选提前做） | 0 |
| M3 启用摘要 | B 表 3 个键 + C1 | ~8 min |
| M5 换绑（时机自定） | D1–D4 | ~10 min + 生效等待 ≤1h |
| 合计（全生命周期） | — | **≤25 分钟**，全程可回滚 |

## F. 本机 push 连通性波动处置（团队侧，无需站主）

实测本机到 GitHub 存在按 IP 波动（一次 git 直连超时、curl 正常）。策略：push 失败自动重试 ≤3 次（间隔 10s）；仍失败改用可达 IP 固定解析或次日重试；CI 运行在 GitHub 托管 runner，不受本机影响。远端未建前前端仅本地提交（分派已明确不 push）。
