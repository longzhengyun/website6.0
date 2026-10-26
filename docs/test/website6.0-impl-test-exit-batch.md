# website6.0 出口批次测试报告（EXIT-20261026-01，测试）

基线：master=d02de29 ｜ Deploy run 40261073455 ｜ 线上 CSS `_astro/about.CAT37jBM.css` ｜ /news 122 条
环境：headless Chrome 155.0.8059.85（CDP）+ axe-core 4.10.2 + Lighthouse 12.8.2（本机节流轮）
证据目录：`E:/Jary/qa-outputs/website6.0/EXIT-20261026-01/evidence/`（下称 EV/；全部线上 URL 带 cache-buster 取证）
代际核验（EV/website6.0-exit-batch.txt 前置 curl 断言，见前轮记录）：线上 HTML 引用 CAT37jBM=2805faa 批四代际 ✓、122 条 ✓、23×10-26 ✓、rise-shift transform-only ✓、#8B9098 零命中 ✓、title/footer/favicon 为批五代际 ✓。

## 0. 总结论

**（2026-10-26 复验轮后修正，见 §4 Addendum）出口批 7 项全部通过。** 原判第①项 light 面违例（BUG-M4R-05）经设计 seq=493 质疑、项目 seq=497 独立复算采纳，确认**系测试探针口径缺陷（假阳），非产品缺陷**：lum() 误用 ^2.2 纯幂近似替代 WCAG 2.1 规定的 ((c+0.055)/1.055)^2.4，比值系统性偏低。修复后标准口径重跑 CT-* 全 16 组（含暗面复核）违例=0，锚点自检 5/5 过。BUG-M4R-05 撤销（改列"探针口径缺陷"，不占产品缺陷号），BUG-M4R-01 全部关闭条件满足。

（原始判定记录保留如下，其中 ① 的"未通过"结论已被 §4 推翻）

## 1. 通过/未通过清单（出口批 7 项）

| # | 项 | 判定 | 结果 | 证据 |
|---|---|---|---|---|
| ① | contrast 全样本复测（祖先链 opacity 合成口径，4 页×light/dark×375/1280=16 组） | **未通过（light）** | dark 8/8 过、resume light 过；index/news/about light 共 6 组违例，全部 ratio=4.36<4.5，节点统一为 `--c-ink-faint:#6a6e76` 落 body `#FAFAF8` 上 → **BUG-M4R-05** | EV/website6.0-exit-batch.txt CT-* 16 行 + EV/website6.0-exit-contrast-diag.txt |
| ② | axe 四组合（375/1280×index/news）零 critical/serious | 通过 | 4 组合违例类=0（注意：axe 对 ink-faint 节点因背景归因失败进 incomplete 不判，①②互证以实测计算为准） | EV/website6.0-exit-axe-*.json、contrast-diag 判定段 |
| ③ | AC-R15/16 正式判定 | 通过 | R15-01 桌面 sh=720/移动 sh=667（≤视口×1.10）、R15-02 动态条 58px≤64 两行、R15-03 移动整块移出 DOM、R15-06 reduced-motion sh=720、R16-05 @200% 全池 12 条违例=0（maxRight=355≤375，BUG-M4R-03 关闭线上实锤）、R16-02 reload×8=5 种、R16-04 CLS max=0.0000 且 tagline 零帧、D02 48 请求零外部 | EV/website6.0-exit-batch.txt R15/R16/D02 段 |
| ④ | BUG-M4R-04 关闭复验 | **关闭成立** | /news 底缘带 scrollY=0/1/2vh 三档：静止 opacity=1、animation-name=rise-shift（transform-only），违例=0；全站条目=122 | EV/website6.0-exit-batch.txt R04-edge-0/1/2+R04-total |
| ⑤ | news-perf 检查点（perf≥0.90 且 LCP≤2.5s） | 通过（remedy 不触发） | desktop 0.95/LCP 774ms/TBT 0；mobile 4 轮 LCP 2209/1821/2195/2126ms 全部≤2.5s，perf 0.96/0.75/0.95/0.93——0.75 为 TBT 离群轮（56→1051ms，本机节流噪声；long task 790~877ms 稳定存在列观察项），多数轮≥0.90 | EV/lh-news-desktop.json、lh-news-mobile{,2,3,4}.json |
| ⑥ | R18/R19 线上复验 | 通过 | 四页 title 全 `…— 佳瑞网 · Jary`/resume `— Jary · 佳瑞网站长`；页头 brand `Jary佳瑞网`；index/about/news footer `© 2026 Jary`（contrast 探针命中实证）；resume 页零 `jary8`、署名 Jary；about 仅存 1 处 `jary8.com` 为域名类标识符（项目裁定排除项，标注）；favicon=SVG「佳」+CJK 字体栈，文档级 16/32/64 渲染截图待设计终确认 | EV/live-*-exit.html、website6.0-exit-favicon-doc-render.png、R18-* 段 |
| ⑦ | 设计走查项配合 | 已交证据 | 导航激活指示条 `::before` computed：light rgb(229,72,77)（朱红）/dark rgb(94,234,212)（磷光青），高 2px；「·」圆点样本 fs/lh 实测；favicon 三档渲染图 | EV/website6.0-exit-designwalkthrough.txt + 上述截图 |

回归附加项：R17-02 条目=122 ✓；**R17-03 倒序 ✓（主探针首报 FAIL 为口径假阳性**——DOM 断言只抓日粒度而 10-23 有 69 条同日；已按 published_at 全时间戳补证：源序严格倒序违例=0 且线上 DOM 顺序与源序逐项一致）；R17-05 noopener ✓；CJK 标题断言 ✓（注记①口径）；P04-fresh 最新=2026-10-26 ✓；D02-news ✓；OVF 375/390/430×双页 ✓；无节流 LCP(news,375)=312ms（OBS）。

## 2. BUG-M4R-05(S) 缺陷包（已撤销——保留作审计记录，定性见 §4 Addendum）

```
BUG-M4R-05 [S] 亮色模式 --c-ink-faint:#6a6e76 落 body #FAFAF8 实测 4.36:1 < AA 4.5:1，必读小字违例
复现: 1) https://longzhengyun.github.io/website6.0/(200) light 模式 375×667 或 1280×720
      2) 任选 footer「© 2026 Jary」/ nav「02/ 03/」序号 / about「01/ 02/」行号 / news 顶栏「data source: RSS ·」「按 ⌘K 直达任意内容」
      3) computed color=rgb(106,110,118)、bg 链唯一层=BODY rgb(250,250,248)、opacity=1、fs 12–13px fw 500
      4) WCAG 相对亮度=(0.9584+0.05)/(0.1814+0.05)=4.36 < 4.5
预期/实际: AA≥4.5 / 4.36
影响: index+news+about 三页 light 模式（resume 白底 surface 实测 4.54 临界过）；AC-G04/AC-M21 light 面 fail；dark 全过；移动+桌面双视口同样违例
证据: EV/website6.0-exit-batch.txt（6 组 FAIL 含节点样本）、EV/website6.0-exit-contrast-diag.txt（裁决：axe incomplete=背景归因失败不判，4.36 为算术正确值）
口径纠错: 设计申报「4.90:1@#FAFAF8」与项目复算「逐位一致」均系算术错误（对 #fff 才是 ≈4.54）；前端自验 0 违例疑只对 #fff 底或未合成 body 底色
owner 建议: 设计裁定亮色新值（AA≥4.5 参考锚点：≤#666a72 可过，实测 4.61；同时保留 dark #7b8394 不动）→ 前端实施单 token 改动 → 测试按本批同口径复验
```

## 3. 挂账关闭与残余

- **BUG-M4R-01**：复验轮（§4）后**关闭**——标准口径下 light/dark 全部实测≥4.5（ink-faint 4.90@#FAFAF8 / 5.12@#fff；#8B9098 已零使用）；原"light 面续挂"判定基于假阳口径，作废。**M4R-02/03/04 线上关闭**（本批 R16-05/axe/R04 复实锤）。
- 观察项（不阻塞）：①~~resume light 4.54 临界过~~（作废：系 2.2 口径 artifact，标准口径 5.12 不临界）；②news 页 long task 790~877ms 稳定存在（perf 分数受 TBT 噪声影响大）；③边缘缓存 ≤600s 旧 HTML 窗口（OBS-CACHE-01，非部署撕裂）。
- 残余风险（不变）：AC-R15-04 元素守恒无基线未执行；AC-R17-04 空态线上不可构造；真机/4G 档位未覆盖（本机节流轮替代）；LLM ai 模式待门禁②（站主 A/B/C 决策，不阻塞出口批）；news-perf 为 Lighthouse 本机轮，devops 无需补官方轮（seq=460 约定仅在本机不可行时才转）。

## 4. Addendum：探针修复复验轮（2026-10-26，回应设计 seq=493/项目 seq=497；EV/website6.0-exit-ctfix-rerun.txt）

**结论：BUG-M4R-05 为测试探针假阳，撤销产品缺陷号；AC-G04/AC-M21 light+dark 全 16 组标准口径违例=0，出口批 7/7 通过。**

1. 根因修正（对两方归因都不采信的独立结论）：原探针 lum() 的 R/G/B 权重齐全（0.2126/0.7152/0.0722），**并非 blue-only**——实际错误是幂项用了 ((v+0.055)/1.055)^2.2 近似，WCAG 2.1 规定指数为 **2.4**。2.2 下 #6a6e76 加权 L=0.1813 恰与 lin₂.₄(118)=0.1812 撞值，导致"蓝通道单通道"误归因（设计与项目 seq=497 均中此巧合）。方向性影响：^2.2 抬高前景 L → 比值系统性偏低 → **假阳违例**；深底场景 bg L 极小、+0.05 占主导，原判暗面 PASS 不受假阴影响（本轮仍全量重跑双保险）。
2. 锚点自检 5/5：#767676@#fff=4.542（业界锚 4.54）、黑@白=21.000、#6A6E76@#FAFAF8=**4.895**（=申报 4.90；旧口径 4.36 复现说明见 §2）、@#fff=**5.116**（=5.12）、#7B8394@#0B0D11=**5.108**（=设计代验 5.11）。
3. CT2-* 16/16 全过（light/dark × 375/1280 × index/news/about/resume，文本节点样本量与原轮一致 14/871/88/23/27/873/90/23），违例全部=0；ink-faint 样本节点直测 fg=rgb(106,110,118)、bodyBg=rgb(250,250,248)、footer 链全透明。
4. axe color-contrast 排查更正：viol=0 且唯一 incomplete 节点为装饰性 span[aria-hidden=true]（背景归因失败），**ink-faint 节点在 axe 标准口径下本就可判且通过**——原报告"axe 因背景归因失败不判 ink-faint"表述作废（EV/website6.0-exit-axe-incomplete.json）。
5. 流程自纠：本轮假阳由测试侧口径错误引起、曾错误推翻设计/项目复算并开 S 级号+触发批六预案，责任在测试；设计 §8.8/v1.1.2 维持 token 的裁定与实测一致；§8.8 兜底条款（#666A72）不触发。BUG-M4R-01 关闭。
