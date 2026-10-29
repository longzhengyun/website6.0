/**
 * F2-3 L0 瓦片客户端：08 册光影拼框呼吸驱动 + spring/手势两枚 canvas 演示。
 * 纪律：
 * - 光带呼吸 L(t)=0.5+0.5·sin(2πt/7+φ)（WAAPI opacity，φ=mulberry32(hashSeedStr(瓦片id)) 派生，可复现）；
 *   静态峰值 0.18；hover/focus-within → 暂停呼吸、180ms 弹性补满至 0.55（断口保留、退出 φ 不重置）；
 *   reduced-motion=静止 0.18 不呼吸（08 册 §8）。
 * - spring 演示=自写半隐式欧拉积分（stiffness 260/damping 20/mass 1，04 册弹簧族），目标每 2.6s 换向，
 *   拖尾=最近 40 样本衰减；手势演示=pointer 采样 60pt 紫色渐隐路径，空闲 2.4s 后自走 Lissajous 环（周期性=可循环）。
 * - 低端（hardwareConcurrency≤4 ‖ deviceMemory≤4）/reduce=单帧静图；astro:page-load 重初始化（旧 rAF 全停）。
 * - 颜色实读 token（--c-demo-1/--c-demo-4），零新 hex；仅 D 档渲染（瓦片 M 端 display:none → 跳过）。
 */
import { hashSeedStr, mulberry32 } from '../lib/v3-art.mjs';

const EDGE_PEAK = 0.18;
const EDGE_HOVER = 0.55;
const BREATHE_MS = 7000;
const SPRING = { k: 260, d: 20, m: 1 };

function tokenColor(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function isStaticMode(): boolean {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd =
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4);
  return reduce || lowEnd;
}

/* ---------- 08 册案 A：光带呼吸 + hover 补满（φ 不重置） ---------- */

function driveEdge(tile: HTMLElement, edge: HTMLElement, phase: number) {
  if (isStaticMode()) {
    edge.style.opacity = String(EDGE_PEAK);
    return;
  }
  // 呼吸关键帧：从相位 φ 起（delay 负值），0→0.18→0 正弦
  const breathe = edge.animate(
    [
      { opacity: 0 },
      { opacity: EDGE_PEAK, offset: 0.5 },
      { opacity: 0 },
    ],
    { duration: BREATHE_MS, easing: 'ease-in-out', iterations: Infinity, delay: -phase * BREATHE_MS },
  );
  let hover: Animation | null = null;
  const enter = () => {
    breathe.pause();
    const from = parseFloat(getComputedStyle(edge).opacity) || 0;
    hover?.cancel();
    hover = edge.animate([{ opacity: from }, { opacity: EDGE_HOVER }], {
      duration: 180,
      easing: 'cubic-bezier(0.22, 1.2, 0.36, 1)', // ≈ spring k260/d20 观感（M-14 同族）
      fill: 'forwards',
    });
  };
  const leave = () => {
    const h = hover;
    if (!h) return;
    const cur = parseFloat(getComputedStyle(edge).opacity) || EDGE_HOVER;
    h.finish();
    const back = edge.animate([{ opacity: cur }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
    back.onfinish = () => {
      back.cancel();
      breathe.play(); // 从暂停相位继续（φ 不重置）
    };
    hover = null;
  };
  tile.addEventListener('pointerenter', enter);
  tile.addEventListener('pointerleave', leave);
  tile.addEventListener('focusin', enter);
  tile.addEventListener('focusout', leave);
}

/* ---------- canvas 通用 ---------- */

function fitCanvas(c: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const rect = c.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(rect.width * dpr);
  c.height = Math.round(rect.height * dpr);
  const ctx = c.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ---------- ① spring：黄球 + 衰减轨迹 ---------- */

function runSpring(canvas: HTMLCanvasElement, stopper: { cancel(): void }) {
  const ctx = fitCanvas(canvas);
  if (!ctx) return;
  const color = tokenColor('--c-demo-1', '#fbd509');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  let x = w * 0.12;
  let v = 0;
  let target = w * 0.85;
  let last = performance.now();
  let acc = 0;
  const trail: { x: number; a: number }[] = [];
  const staticMode = isStaticMode();
  if (staticMode) {
    // 静图=过冲后收敛位 + 完整衰减曲线示意
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const px = w * 0.12 + (target - w * 0.12) * (1 - Math.exp(-3 * t) * Math.cos(9 * t));
      const py = h * 0.5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(target, h * 0.5, Math.min(9, h * 0.12), 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const step = (now: number) => {
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    acc += dt;
    if (acc > 2.6) {
      acc = 0;
      target = target > w / 2 ? w * 0.12 : w * 0.85;
    }
    // 半隐式欧拉：a = (-k(x-target) - d·v)/m
    const a = (-SPRING.k * (x - target) - SPRING.d * v) / SPRING.m;
    v += a * dt;
    x += v * dt;
    trail.push({ x, a: 1 });
    if (trail.length > 40) trail.shift();
    ctx.clearRect(0, 0, w, h);
    // 轨迹（水平线 + 衰减点）
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.5);
    ctx.lineTo(w * 0.85, h * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      ctx.globalAlpha = (i / trail.length) * 0.35;
      ctx.beginPath();
      ctx.arc(p.x, h * 0.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, h * 0.5, Math.min(9, h * 0.12), 0, Math.PI * 2);
    ctx.fill();
    // 目标锚点（空心圈）
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(target, h * 0.5, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const raf = requestAnimationFrame(step);
    stopper.cancel = () => cancelAnimationFrame(raf);
  };
  const raf = requestAnimationFrame(step);
  stopper.cancel = () => cancelAnimationFrame(raf);
}

/* ---------- ③ gesture：指针路径（空闲自走 Lissajous） ---------- */

function runGesture(canvas: HTMLCanvasElement, tile: HTMLElement, stopper: { cancel(): void }) {
  const ctx = fitCanvas(canvas);
  if (!ctx) return;
  const color = tokenColor('--c-demo-4', '#a16ce5');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const pts: { x: number; y: number }[] = [];
  let lastMove = -10;
  const t0 = performance.now();
  const staticMode = isStaticMode();
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    // 基准 Lissajous 幽灵路径（静态环，pointer 路径在其上覆写）
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      const px = w * 0.5 + Math.sin(u * Math.PI * 2) * w * 0.32;
      const py = h * 0.5 + Math.sin(u * Math.PI * 4 + 1.2) * h * 0.3;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 1; i < pts.length; i++) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = (i / pts.length) * 0.9;
      ctx.lineWidth = 1 + (i / pts.length) * 2.4;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    if (pts.length) {
      const p = pts[pts.length - 1];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  if (staticMode) {
    // 静图=预置一段 Lissajous 采样
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      pts.push({ x: w * 0.5 + Math.sin(u * Math.PI * 2) * w * 0.32, y: h * 0.5 + Math.sin(u * Math.PI * 4 + 1.2) * h * 0.3 });
    }
    draw();
    return;
  }
  const push = (x: number, y: number) => {
    pts.push({ x, y });
    if (pts.length > 60) pts.shift();
  };
  tile.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) return;
    lastMove = performance.now();
    push(x, y);
  });
  const step = (now: number) => {
    if (now - lastMove > 2400) {
      // 空闲自走：整数频率 Lissajous，(u+p) mod 1 周期化
      const u = ((now - t0) / 6000) % 1;
      push(w * 0.5 + Math.sin(u * Math.PI * 2) * w * 0.32, h * 0.5 + Math.sin(u * Math.PI * 4 + 1.2) * h * 0.3);
    }
    if (pts.length > 1) draw();
    const raf = requestAnimationFrame(step);
    stopper.cancel = () => cancelAnimationFrame(raf);
  };
  const raf = requestAnimationFrame(step);
  stopper.cancel = () => cancelAnimationFrame(raf);
}

/* ---------- 初始化 ---------- */

const stoppers: { cancel(): void }[] = [];

function initAll() {
  for (const s of stoppers) s.cancel();
  stoppers.length = 0;
  const desktop = matchMedia('(min-width: 768px)').matches;
  if (!desktop) return; // M 档瓦片不渲染（F3 另案）
  const rng = mulberry32(hashSeedStr('L0-TILES'));
  document.querySelectorAll<HTMLElement>('[data-tile]').forEach((tile) => {
    if (!tile.isConnected) return;
    const edge = tile.querySelector<HTMLElement>('.tile-edge');
    const phase = rng(); // 每瓦片独立相位（同页不同步，可复现）
    if (edge) driveEdge(tile, edge, phase);
    const stopper = { cancel: () => {} };
    stoppers.push(stopper);
    try {
      if (tile.dataset.tile === 'spring') {
        const c = tile.querySelector('canvas');
        if (c) runSpring(c, stopper);
      } else if (tile.dataset.tile === 'gesture') {
        const c = tile.querySelector('canvas');
        if (c) runGesture(c, tile, stopper);
      }
    } catch {
      /* 演示件失败不伤页面 */
    }
  });
}

const w = window as unknown as { __l0TilesBound?: boolean };
if (!w.__l0TilesBound) {
  w.__l0TilesBound = true;
  document.addEventListener('astro:page-load', () => initAll());
  let t = 0;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = window.setTimeout(initAll, 200);
  });
}
initAll();
