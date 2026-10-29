# Noto Sans SC 可变子集 · 授权与生产证据（F1-2）

- 用途：三期正文/内页标题字体（站主 seq=841 D-6 裁定「正文用 Noto Sans SC 子集」；设计规格 03 册）
- 仓库产物：`src/assets/fonts/noto-sans-sc-var.woff2`
  - bytes：1,032,804（0.985 MiB，≤1.5MB 预算）
  - sha256：`26a550b0bae5a5e04b6e5c46d6621e29a7abf6bb18575918738cb6fd5dbc16d0`
  - 轴域：wght 400–900（partial instancing 裁切，100–400 不入包）；字形 4108；内部名已归一为「Noto Sans SC / Regular」
- 许可：SIL Open Font License 1.1（全文见同目录 `OFL-noto-sans-sc.txt`；无 Reserved Font Name 冲突——嵌入子集属许可内使用，不要求随页署名，本档案为证据留痕）
- 母版来源（未入仓，17.8MB 超仓库纪律）：google/fonts 仓库 `ofl/notosanssc/NotoSansSC[wght].ttf`
  - 获取通道：`https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf`（2026-10-29 实测 206/200 可达）
  - 母版 sha256：`a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`
  - 本机路径（复现用，经 `NOTO_MASTER_TTF` 环境变量传入）：`E:\Jary\github\.qa-scratch\phase3-f1\NotoSansSC-var.ttf`
- 子集规则（scripts/font_pipeline.py，2026-10-29 运行）：
  1. 字集 = GB2312 一级汉字（≈通用规范汉字表一级 3500）∪ 全站可见文案穷举（源文件去注释后取 CJK，双保险）∪ 排版符号 → 目标 3,817 字
  2. `fontTools.varLib.instancer wght=400:900`（部分实例化，保留 400–900 变轴）
  3. `fontTools.subset` → woff2：layout-features 限 kern,liga,ccmp,locl,mark,mkmk；no-hinting
  4. 内部名归一（Thin→Regular）+ 输出单文件 + 体积/哈希/轴域实测打印
- 复现命令：`NOTO_MASTER_TTF=<母版路径> python scripts/font_pipeline.py`（fonttools 4.60.2 + brotli，Python 3.9）
- CSS 挂点：`src/styles/fonts.css`（font-display: swap；CJK 首屏系统栈占位）+ `theme.css --font-sans` 栈序 Geist→Noto→系统
