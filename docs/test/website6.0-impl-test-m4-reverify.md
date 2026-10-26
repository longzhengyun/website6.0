# website6.0 M4 复验报告（822e3d5 · BUG-M4-01/02/03 关闭 + axe 首扫新发现）

作者：测试 ｜ 日期：2026-10-23 ｜ 对象：`https://longzhengyun.github.io/website6.0/`（deploy 822e3d5，devops 通知 cmsg_01m5ky2mc5wfwt5zjrajyf1xh7，deploy run 39924517050）
方法基准：项目 seq=250 口径——同脚本复跑 + axe + 残余条款 + 200% 文字缩放。
证据目录：`E:\Jary\qa-outputs\website6.0\M4-reverify-20261023-01\evidence\`
- `reverify-e2e.js` + `website6.0-m4-reverify-browser-v3.txt`（终跑，28 项断言 24 PASS / 4 axe FAIL）
- `axe.min.js`（axe-core 4.10.2）+ `website6.0-m4-axe-detail.json`（违例节点级明细 60 条）
- `contrast-measure.js` + `website6.0-m4-contrast-measure.json`（独立 WCAG 公式实测，40 个违例样本）
- `deployed-news-822e3d5.json`（线上数据基线 36 条）
- 截图 `website6.0-m4-reverify-375-news-fixed.png` 等
工具修正记录：axe 4.10.2 经 Runtime.evaluate 传 553KB 大脚本必 FATAL（截断），改 `Page.addScriptToEvaluateOnNewDocument` 注入后导航生效；溢出探针加 overflow-x auto/scroll 祖先排除（容器内滚=spec §6.3 设计行为，首跑 5 个假阳性由此来）。

## 1. 通过项（BUG-M4-01/02/03 复验证据）

| 断言 | 结果 | 数据 |
|---|---|---|
| OVF 矩阵 375/390/430 × index/news/about/resume | 12/12 pass | sw==cw==视口宽，离屏 leaf=0（BUG-M4-01 关闭） |
| TABBAR-375/390/430 | pass | tab-bar 宽=视口，各项 right≤视口（如 375：64/158/261/344），⌘K 在位（BUG-M4-02 关闭） |
| CHIPROW 三视口 | pass | 容器 335/350/382px，内滚内容 526px，ovfX=auto——设计行为 |
| 200% 文字缩放四页 | pass | @200% sw==cw==375，离屏=0（BUG-M4-03 关闭） |
| 200% 下 tab 项+页脚 | pass | tab 项 right≤360（label ellipsis 生效）、页脚链接 right≤303 |
| 数据口径 | pass | 822e3d5=36 条 rss_only：线上命中 36/36、倒序违例 0、_blank noopener 违例 0 |
| D02R Network | pass | 复验轮 30 请求，白名单外=0 |

## 2. 新发现缺陷（axe 首扫 + 独立实测互证；非回归——首轮未跑 axe，本窗口为 axe 覆盖首次落地）

### BUG-M4R-01（S）— 必读信息对比度不足 + 禁用规则未落地
- **复现**：桌面 1280 或移动 375 打开 /news、/，检查新闻条目日期/来源/标签、导航序号前缀、激活态 tab 文字。
- **实测**（WCAG 相对亮度公式独立计算 + axe color-serious 互证 + devops Lighthouse index color-contrast score=0 三口径一致）：
  - `--color-ink-faint` #8B9098：@#FAFAF8=**2.81:1**、@#fff=**2.93:1**，用于 12–13px 必读元信息（日期 2026-10-23、来源 Hacker News Front、标签 #ai、导航 "02/" 前缀等）→ 双违反：AA 需 ≥4.5:1；AC-G04 明确禁用规则"ink-faint 不用于必读信息"。
  - `--color-accent` #E5484D 激活态导航 tab（`nav a[aria-current="page"]` 及 `.tab-label`）：**3.69:1**@#fff / 3.54:1@#FAFAF8 @12–13px → AA 不足且违反"正文级小字无朱红"。
- **影响面**：四页全站；样本 40 违例节点（1280-news 21、1280-index 13+1、375-news 16、375-index 8+2）。
- **判定**：AC-G04 / AC-M21 / AC-M19 / AC-CI04 记 fail，挂本缺陷号。归属建议：设计 token 用色策略 + 前端实现层（需设计裁定深一档的 faint 值或改用途）。

### BUG-M4R-02（A）— 正文链接仅靠颜色区分（WCAG 1.4.1）
- **复现**：首页/news 正文内 `.arrow-link`（href$=news"更多"类链接），与周边文本同字号、无下划线，仅 color 差异。
- **实测**：axe link-in-text-block serious ×（index 两视口各 1 节点）；Lighthouse index link-in-text-block score=0。
- **判定**：AC-G03/M-D 系列无障碍条款联动 fail 项，建议加下划线或非颜色线索。

## 3. Lighthouse（引用 devops 正式轮，不重复跑）
- 目录 `E:\Jary\qa-outputs\website6.0\M4-online-20261023-02\` 四页 8 文件已齐（项目 seq=318 实盘核验）：index 0.99/0.91/1.00、about 0.99/0.91/1.00、resume 0.99/0.94/1.00、**news 0.71/0.96/1.00（LCP 3.89s）**。G4/AC-CI04 证据闭环。A11y<0.95 缺口与 §2 两缺陷同源（color-contrast、link-in-text-block score=0 互证）。
- news 页 perf 缺口按产品 seq=316 裁定：本轮记观察项；硬检查点压在「M4.1 合入+PAT 回写打通」复验窗口实测 perf≥0.90 且 LCP≤2.5s，未过线转修复项（预案锁死：首屏限 N 条+分页），与 BUG-M4R-01 同批不拆轮。

## 4. M4 出口重判定（测试侧结论）
- 首轮 3 缺陷（S/S/A）**全部复验关闭**。
- 新增 2 缺陷（S/A）挂 AC-G04/M19/M21/CI04 → **M4 出口仍未通过**，阻塞项=BUG-M4R-01（S）。
- 修复后复验口径：同探针 `contrast-measure.js` 重跑（全样本 ratio≥req）+ axe 四组合零 critical/serious + Lighthouse A11y≥0.95。
- 可并行事项：前端 M4.1（R15/R16）改动会触及首页/导航用色，建议 BUG-M4R-01/02 修复与 M4.1 合并一批上线，测试按 v1.6 单屏门禁+无障碍一次复跑，避免拆轮。

## 5. 残余风险与未覆盖面（延续披露）
- 真机 iOS Safari/Android Chrome 未覆盖（emulation 替代，confidence=medium）；4G 节流网络矩阵不可控未跑。
- F 组（AC-AI-F01~F05、AC-R17-01）Blocked 等 LLM key+网络可达性；NEWS_SYNC_PAT 回写闭环未通（观察项，非站点缺陷）。
- jary8.com apex 301→www 无解析（观察项，M5 清单）。
- axe/Lighthouse 均自动检测子集，读屏实机行为未验。
