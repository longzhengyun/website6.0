/**
 * N-3 V3 画布客户端（rev1.1 §2；与 src/lib/v3-art.mjs 单源同几何——canvas 与无 JS SVG 同 seed 等价）。
 * 硬边界：默认 seed 0x5EED（SSR data-seed），?seed= 覆盖且刷新保持；D 端 ≤8s 入场逐段揭示后 rAF 全停；
 * reduce / 低端（hardwareConcurrency≤4 ‖ deviceMemory≤4）=终帧静图；M 端（<768）=静帧条零持续动画；
 * regenerate=history.replaceState（不触 ClientRouter navigate）+ 同帧重绘（INP≤100ms）；astro:page-load 重初始化；
 * 配色经 getComputedStyle 实读 --c-accent（var 注入，零新 hex）；每帧绘制预算 ≤4ms（超预算自动降批不减总量）。
 * 设计口径「脚本 inlined 于首页」按「不进公共包」落实：模块仅首页引用 → vite 独立小 chunk，
 * 公共包 BaseLayout/ClientRouter 字节级零增长（回执披露）。
 */
import { art, tokensFrom, bucketWidth, TOTAL_MS } from '../lib/v3-art.mjs';

const MQ_DESK = '(min-width: 768px)';
const MAX_PIXELS = 2_500_000; // §2.4 内存钳
const FRAME_BUDGET_MS = 4; // §2.4 每帧 JS+绘制 ≤4ms
const ALPHA_CAP_LIGHT = 0.16;
const ALPHA_CAP_DARK = 0.22;

type Tokens = ReturnType<typeof buildTokens>;

function seedFromLocation(): string {
  try {
    const q = new URLSearchParams(location.search).get('seed');
    if (q && /^[\w.-]{1,64}$/.test(q)) return q;
  } catch {
    /* location 异常不可用：回落默认 */
  }
  return '';
}

function buildTokens(seed: string, w: number, h: number) {
  const a = art(seed, w, h);
  return tokensFrom(a);
}

function paintAll(ctx: CanvasRenderingContext2D, tokens: Tokens, color: string, cap: number, w: number, h: number, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, Math.round(w / 800));
  // 逐段 stroke 会因 alpha 叠加改变观感：按 alpha 分桶批量 beginPath 聚合，
  // 但入场需逐段揭示——揭示态下同一 polyline 相邻段允许叠画（叠印本就有重叠语义，观感一致性由设计走查签字）。
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    ctx.globalAlpha = Math.min(t[4], cap);
    ctx.beginPath();
    ctx.moveTo(t[0], t[1]);
    ctx.lineTo(t[2], t[3]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function currentAccent(): { color: string; cap: number } {
  const cs = getComputedStyle(document.documentElement);
  const color = cs.getPropertyValue('--c-accent').trim() || '#e5484d';
  const theme = document.documentElement.getAttribute('data-theme');
  const dark = theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches);
  return { color, cap: dark ? ALPHA_CAP_DARK : ALPHA_CAP_LIGHT };
}

function initOne(root: HTMLElement) {
  const canvas = root.querySelector('canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return; // display:none 档位（另一端）：跳过，切换时由 matchMedia 重初始化

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = bucketWidth(rect.width);
  let h = rect.height;
  // 内存钳：w×h×dpr² ≤ 2.5M，超限降 dpr 优先、再降 w 档
  let effDpr = dpr;
  if (w * h * effDpr * effDpr > MAX_PIXELS) effDpr = Math.max(1, Math.sqrt(MAX_PIXELS / (w * h)));
  if (w * h * effDpr * effDpr > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / (w * h * effDpr * effDpr));
    w = Math.max(100, Math.round(w * scale));
    h = Math.max(80, Math.round(h * scale));
  }
  canvas.width = Math.round(w * effDpr);
  canvas.height = Math.round(h * effDpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return; // canvas 不支持：noscript 外 SVG 已随 SSR 在位？——SVG 在 noscript 内不显形；接受（现代无 canvas 浏览器≈无 noscript 语义场景），回执披露
  canvas.classList.add('v3-on');

  const defaultSeed = root.getAttribute('data-seed') || '0x5EED';
  const seed = seedFromLocation() || defaultSeed;
  const tokens = buildTokens(seed, w, h);

  const desktop = matchMedia(MQ_DESK).matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd =
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4);
  const animate = desktop && !reduce && !lowEnd;

  const { color, cap } = currentAccent();
  if (!animate) {
    paintAll(ctx, tokens, color, cap, w, h, effDpr); // 终帧静图（reduce/低端/M 端共用路径）
    return;
  }

  // D 端入场：逐段揭示，≤TOTAL_MS 永久定格；每帧预算超支自动降批（不减总段数）
  const start = performance.now();
  const deadline = start + TOTAL_MS;
  let cursor = 0;
  let batch = Math.max(8, Math.ceil(tokens.length / 160)); // 60fps×8s≈480 帧，160 批起步留足低帧率余量
  let raf = 0;
  const step = (now: number) => {
    const t0 = performance.now();
    const end = Math.min(tokens.length, cursor + batch);
    ctx.setTransform(effDpr, 0, 0, effDpr, 0, 0);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, Math.round(w / 800));
    for (let i = cursor; i < end; i++) {
      const tk = tokens[i];
      ctx.globalAlpha = Math.min(tk[4], cap);
      ctx.beginPath();
      ctx.moveTo(tk[0], tk[1]);
      ctx.lineTo(tk[2], tk[3]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    cursor = end;
    const cost = performance.now() - t0;
    if (cost > FRAME_BUDGET_MS && batch > 8) batch = Math.max(8, Math.floor(batch / 2));
    if (cursor >= tokens.length || now >= deadline) {
      if (cursor < tokens.length) paintAll(ctx, tokens, color, cap, w, h, effDpr); // 到时未画完：终帧补齐后定格
      cancelAnimationFrame(raf);
      return;
    }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

function initAll() {
  document.querySelectorAll<HTMLElement>('[data-v3]').forEach((el) => {
    if (!el.isConnected) return;
    try {
      initOne(el);
    } catch {
      /* 单实例失败不影响页面其余部分（氛围层可全删） */
    }
  });
}

function bindGlobal() {
  // ClientRouter 回首页会重执行本模块（body 交换后 window 标记仍在）：全局监听只绑一次；
  // 重执行时末尾 initAll() 仍会跑一次（唯一初始化出处）
  const w = window as unknown as { __v3Bound?: boolean };
  if (w.__v3Bound) return;
  w.__v3Bound = true;

  // regenerate：换 seed 写 URL（replaceState，不触 ClientRouter navigate/无 A3 动效）+ 全重初始化
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-v3-regen]') : null;
    if (!target) return;
    e.preventDefault();
    const seed = Math.random().toString(36).slice(2, 9);
    const url = new URL(location.href);
    url.searchParams.set('seed', seed);
    history.replaceState(history.state, '', url.toString());
    initAll();
  });

  // 端档位切换：跨过 768 时按新视口重绘（同 seed，可复现性不破坏；debounce）
  let resizeT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(initAll, 200);
  });

  // 主题切换（data-theme 显式翻转/auto 跟系统）：重读 token 实色即跟色
  new MutationObserver(() => initAll()).observe(document.documentElement, {
    attributeFilter: ['data-theme'],
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => initAll());

  // ClientRouter：每次页面装载（含 SPA 进出首页）从 URL 重解析 seed 再初始化；
  // DEF-THEME-1：v3-js 是 html 级 class，swap 后被擦除且本模块不重执行——随 page-load 重放
  document.addEventListener('astro:page-load', () => {
    document.documentElement.classList.add('v3-js');
    initAll();
  });
}

bindGlobal();
// 无 JS 时 regenerate 保持 visibility:hidden（布局预位防 CLS、不可聚焦防键盘落空）
document.documentElement.classList.add('v3-js');
initAll();
