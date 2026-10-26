# website6.0 发布通路盘点（GitHub Pages + jary8.com 域名接管）

产出人：开发运维 ｜ 2026-10-23 ｜ 阶段：仅方案，未建仓库、未做任何变更

## 1. 现状与环境实测证据（本机 E:\Jary\github）

| 检查项 | 实测结果 | 结论 |
|---|---|---|
| GitHub 账号/仓库形态 | website5.0 远端 `https://github.com/longzhengyun/website5.0.git` | website6.0 将建在同账号 `longzhengyun` 下，仓库名 `website6.0` |
| jary8.com 当前解析 |  apex `jary8.com` CNAME → `longzhengyun.github.io`（解析到 Pages IP 185.199.108-111.153）；`www.jary8.com` 同样 CNAME → `longzhengyun.github.io`；HTTPS 访问 apex 返回 301 → `https://www.jary8.com/` | **DNS 记录已经全部就位，域名接管原则上不需要改 DNS**，只需要在 GitHub 侧把自定义域名从 website5.0 换绑到 website6.0 |
| DNS 服务商 | NS = `dns31/dns32.hichina.com` | 阿里云（万网）DNS，由站主账号管理，任何记录调整只能站主手动完成 |
| 现 Pages 部署方式 | website5.0 用 GitHub Actions（`deploy-pages.yml`：push master 触发，configure-pages → upload-pages-artifact → deploy-pages，CNAME=`www.jary8.com` 由 `public/CNAME` 校验入 dist） | 同一套 workflow 模式可直接复用到 website6.0，路径成熟 |
| git 推送凭据 | `~/.git-credentials` 存有 1 条 github.com 记录；website5.0 提交序列历史上从本机成功推送 | 推送能力已具备（实施阶段验证即可） |
| gh CLI | **未安装**（PATH 与常见安装目录均无） | 建仓/Pages 设置若走 CLI 需先安装 gh + PAT；若走 GitHub 网页由站主操作则不需要 |
| 网络到 GitHub | `api.github.com` 200（0.4s）、`github.com` 200（1.6s）；但某次 `git ls-remote` 解析到 `20.205.243.166:443` 超时直连失败 | 本机到 GitHub 存在**按 IP 波动的连通性**（部分 GitHub IP 不可达）。风险：push/CI 触发偶发失败。缓解：重试即可；必要时对 git 固定可达 IP。CI 在 GitHub 托管 runner 上运行，不受本机网络影响 |

## 2. 目标通路（方案）

```
代码 push (master) ──> GitHub Actions build ──> upload dist(含 CNAME) ──> Deploy to Pages
                                                                     │
jary8.com / www.jary8.com ──(阿里云 DNS CNAME，已在位，不改)──> longzhengyun.github.io ──> GitHub 按 Host 路由到 website6.0
```

关键机制：GitHub 自定义域名是**仓库级唯一**的——同一个域名同时只能绑一个 Pages 站点。换绑必须先解除 website5.0 的 custom domain，再在 website6.0 上设置，否则 website6.0 会报 "custom domain already taken"。

### 域名形态二选一（需站主裁定）

- **A. 沿用 www 主站（改动最小，推荐）**：`public/CNAME = www.jary8.com`，apex 301→www 的现状不变。DNS 零改动。
- **B. apex 主站**：CNAME 改 `jary8.com`，需要在阿里云把 www 记录调整并处理 301 方向；改动多、收益小，不建议本期做。

### 与 website5.0 的交接

- 换绑瞬间 website5.0 将不可通过 jary8.com 访问（降级为 `longzhengyun.github.io/website5.0` 路径访问）。站主已说明 6.0 可不参考 5.0，是否保留 5.0 可访问需拍板。
- 建议实施顺序：website6.0 先在 `longzhengyun.github.io/website6.0` 路径完成部署与测试 → 验收通过后再执行域名换绑（5.0/6.0 切换点由站主确认，属于人工门禁）。

## 3. 需要站主手动完成的步骤清单

| # | 操作 | 由谁 | 前提 | 预计耗时 |
|---|---|---|---|---|
| 1 | 在 GitHub 网页（longzhengyun 账号）创建 public 仓库 `website6.0`（空仓库，不设 README 冲突分支） | 站主 | 浏览器可登录 GitHub（当前网络可访问） | 3 分钟 |
| 2 | 若采用 CI 需要私有配置（如 AI key 走变量）：在仓库 Settings→Secrets/Variables 添加团队提供的键名清单 | 站主 | 团队先给出变量名与用途说明（不出现明文值） | 5 分钟 |
| 3 | website6.0 Settings→Pages：Build source 选 "Deploy from a branch" 或保持由 workflow 部署（按前端选定的框架产物目录对齐） | 站主（或授权团队用 gh CLI 后代操作） | 首次 Actions run 成功后 | 3 分钟 |
| 4 | website6.0 Pages→Custom domain 填 `www.jary8.com`，勾选 Enforce HTTPS（该设置会同时写 CNAME，仓库侧仍保留 `public/CNAME` 防止误清） | 站主 | 第 5 步先做或同步做，避免 taken 冲突 | 3 分钟 |
| 5 | website5.0 Pages→Custom domain 清空（解除 jary8.com 占用） | 站主 | 接受 5.0 暂时只有路径地址 | 2 分钟 |
| 6 | 阿里云 DNS 控制台核对（只核对，不改）：apex 与 www 的 CNAME→longzhengyun.github.io 在位 | 站主 | 无需改记录 | 2 分钟 |
| 7 | 换绑后验证：`https://www.jary8.com` 返回 6.0 内容、HTTPS 证书正常（GitHub 自动签发，生效通常 <10 分钟，偶发至 1 小时） | 团队（测试复验） | 第 1–6 完成 | 10–60 分钟等待生效 |

**总计站主手工操作约 15–20 分钟**（不含 HTTPS/换绑生效等待）。全程可回滚：把第 4、5 步反向执行即恢复 5.0 上线状态，无不可逆操作。

## 4. 团队侧实施前提（确认方案后执行，不需要站主做）

- 安装/配置 gh CLI + fine-grained PAT（仅 repo+pages 最小权限，由站主生成后录入 Secrets 边界，不落盘明文）——若站主更愿意全程网页点选，此项可省去。
- 复用 website5.0 的 `deploy-pages.yml` 骨架改造 workflow（Node 版本以新项目 `.nvmrc` 为准；本机已有 Node 24.19.0 于 `E:\Jary\github\.tools`）。
- CI 增加构建+链接检查门；发布验证清单（HTTP 状态码、CNAME hash、HTTPS、apex 跳转）由测试执行。

## 5. 风险与遗留观察项

| 风险/观察 | 影响 | 处置 |
|---|---|---|
| 本机到 GitHub 部分 IP 不通（实测一次 git 直连超时） | 实施期 push 偶发失败 | 重试/固定可达 IP；不阻塞方案期（不依赖 CI） |
| CNAME apex 记录在阿里云的形态 | 极小概率某记录调整后 301 方向变化 | 方案 A 不动 DNS，风险归零；列为换绑日验证项 |
| website5.0 是否保留 | 换绑后 5.0 失去域名 | 需站主拍板（不阻塞方案，实施前裁定即可） |
| 若前端选型需要 serverless/外部 API（后端评估结论） | GitHub Pages 纯静态无服务端能力 | 属另一条通路评估，不在本盘点范围；出现时再补 workflow 侧支持 |
| Actions 用量 | 个人 public 仓库免费额度充足 | 无风险，仅记录 |

## 6. 开发运维的头脑风暴功能点子（2-3 条）

1. **"站点体检报告"公开页**：CI 每次发布跑 Lighthouse/无障碍/SEO 并把得分、趋势写入站点数据文件，网站自身展示自己工程的指标——最直接的"体现站长技术"手法，成本几乎为零。
2. **PR 预览环境（Preview Deployments）**：每个功能分支自动构建独立预览地址（GitHub Actions artifacts / 临时 Pages），访客可见开发过程，也是前沿工程实践的展示位。
3. **Release Changelog 引擎**：网站改版历史用 GitHub Releases 驱动，changelog 页面在构建期自动生成，"网站本身有版本管理"即是技术名片。
