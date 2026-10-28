/**
 * N-3 V3 生成式画布「朱红印刷纹理」单源生成器（shared/t2-n3n5-homepage-proposal.md rev1.1 §2）。
 * 硬边界（站主 seq=471 R2/R3 + 项目 seq=509 裁定值复述）：
 * - 纯函数 (seed, w, h) → 图元序列：Canvas2D 与 SSR SVG 静帧共用本文件，零分叉；
 * - mulberry32（32-bit 整数态 PRNG）+ FNV-1a 字符串散列；无外部依赖、无 Math.random、无日期输入；
 * - 布局参数量化：宽度进入 art() 前由调用方 bucket 到 100px 档（§2.2 可复现口径），DPR 不进几何；
 * - 色板派生零新 hex：图元不含颜色，颜色由消费方（canvas var 实读 / SVG currentColor）注入；
 * - 元素数与面积挂钩且有硬顶（内存钳 ≤2.5M px 由画布侧 DPR≤2 负责，此处段数封顶 ≤400 线 ×4 段）。
 * Node（.mjs，npm test / astro frontmatter）与浏览器（tsconfig include 后 .mjs 可被 TS 侧 import）双端共用。
 */

/** 默认种子 0x5EED 固定母版（R3 裁定：全网同一首帧，"生成感"由 D 端入场动画承担）。 */
export const DEFAULT_SEED_KEY = '0x5EED';

/** 线数与画布面积挂钩：~1240 条/百万 px，钳到 [200, 400]（§2.1）。 */
export const COUNT_MIN = 200;
export const COUNT_MAX = 400;
export const MIN_BUCKETS = 8;
export const MAX_BUCKETS = 30;
export const TOTAL_MS = 8000; // D 端入场总时长 ≤8s，到时永久定格（WCAG 2.2.2）

/** FNV-1a 32-bit：字符串 seed → uint32。 */
export function hashSeedStr(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32：纯函数状态机，返回 [0,1) 取值器。 */
export function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 宽度量化档（§2.2：可复现性以 bucket 为准，同档同图）。 */
export function bucketWidth(w) {
  return Math.max(100, Math.round(w / 100) * 100);
}

/**
 * 几何生成：200-400 条 2-4 段短折线，自左下向右上随机游走叠印成斜向「笔触带」。
 * 坐标基于传入 (w, h) 绝对值；调用方负责 w 已 bucket。
 * @returns {{ polylines: Array<{ pts: number[][], alpha: number }> }}
 */
export function art(seedKey, w, h) {
  const rng = mulberry32(hashSeedStr(String(seedKey)));
  const dots = Math.min(COUNT_MAX, Math.max(COUNT_MIN, Math.round((w * h) / 800)));
  const polylines = [];
  for (let i = 0; i < dots; i++) {
    let x = rng() * w * 0.35;
    let y = h - rng() * h * 0.25;
    const pts = [[x, y]];
    const segs = 2 + Math.floor(rng() * 3); // 2-4 段
    for (let s = 0; s < segs; s++) {
      const t = (s + 1) / segs;
      x += w * (0.02 + 0.06 * rng());
      y -= h * (0.02 + 0.06 * rng());
      x += (rng() - 0.5) * w * 0.015 * t; // 横向微抖
      y += (rng() - 0.5) * h * 0.10 * t; // 纵向游走
      if (x > w * 0.99) x = w * 0.99;
      if (y < h * 0.02) y = h * 0.02;
      pts.push([x, y]);
    }
    polylines.push({ pts, alpha: 0.04 + rng() * 0.10 }); // 0.04-0.14
  }
  return { polylines };
}

/** 入场时长预算：TOTAL_MS 封顶逐段揭示，到时 rAF 全停（WCAG 2.2.2 有限时长）。 */

/**
 * Canvas 消费：把 art 摊平为逐段线段 token（入场动画的最小揭示单位）。
 * final=true 时输出全量；Canvas 绘制与完成态帧共用。
 * @returns Array<[x1,y1,x2,y2,alpha]>
 */
export function tokensFrom(artObj) {
  const tokens = [];
  for (const pl of artObj.polylines) {
    for (let i = 1; i < pl.pts.length; i++) {
      const a = pl.pts[i - 1];
      const b = pl.pts[i];
      tokens.push([a[0], a[1], b[0], b[1], pl.alpha]);
    }
  }
  return tokens;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * SSR 无 JS 静帧：同 seed 的构建期等价图（§2.3 降级列；坐标取整=降级近似，canvas 侧保持浮点原值）。
 * 单块/变体：stroke=currentColor（同文档内联 SVG 可吃宿主 CSS var + data-theme 三态，免亮/暗双块）；
 * alpha 量化 6 档 <g> 聚合去重复属性（HTML 字节 119KB→~17KB/对，见回执）。
 */
const ALPHA_BUCKETS = [0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
export function artToSvgString(artObj, w, h, seedKey) {
  const groups = new Map(ALPHA_BUCKETS.map((a) => [a, []]));
  for (const pl of artObj.polylines) {
    let bi = 0;
    for (let k = 1; k < ALPHA_BUCKETS.length; k++) {
      if (Math.abs(pl.alpha - ALPHA_BUCKETS[k]) < Math.abs(pl.alpha - ALPHA_BUCKETS[bi])) bi = k;
    }
    groups.get(ALPHA_BUCKETS[bi]).push(pl);
  }
  const body = [...groups.entries()]
    .filter(([, pls]) => pls.length > 0)
    .map(
      ([a, pls]) =>
        `<g stroke-opacity="${a}">` +
        pls.map((pl) => `<path d="${pl.pts.map((p, i) => `${i ? 'L' : 'M'}${Math.round(p[0])} ${Math.round(p[1])}`).join('')}"/>`).join('') +
        '</g>',
    )
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" ` +
    `viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" fill="none" ` +
    `stroke="currentColor" stroke-width="${Math.max(1, Math.round(w / 800))}" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-seed="${esc(seedKey)}" ` +
    `style="display:block">${body}</svg>`
  );
}
