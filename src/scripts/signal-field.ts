/**
 * F2-1 安静 mesh 场客户端（04 册 M-01 v2.1 改稿；配套 src/components/SignalField.astro）。
 * 硬边界：
 * - 峰值合成 alpha ≤0.06（07 册「亮度压到不可察觉」）；去粒子；流速减半（原 0.8px/f → 0.4px/f 制式）；
 * - 散点（F3-0 设计走查 seq=993 修正）：原「信标 3→1」红点与 03 册大标挂件构成 L0 双红点违例，
 *   本位降为白/灰静态散点（--c-ink-muted 实读，01 册散点语义，无呼吸/脉冲环），L0 唯一红点=大标挂件；
 * - seed：?seed= 覆盖（与 v3 同源 [/^[\w.-]{1,64}$/] 白名单），mulberry32(hashSeedStr(seed)) 派生三带相位/抖幅 → uniform，
 *   同 seed 同场可复现；regenerate 按钮（[data-v3-regen]）换 seed 后随 URL 重初始化；
 * - 颜色零新 hex：--c-accent（带色起点）/--c-teal（带色终点）/--c-ink-muted（散点）getComputedStyle 实读，三态主题翻转重绘；
 * - reduce / 低端（hardwareConcurrency≤4 ‖ deviceMemory≤4）/ M 端 = 单帧静图；D 档 rAF 常驻，页签隐藏停帧省电。
 * 与 v3-canvas 同策略：仅首页引用 → 独立小 chunk，load/astro:page-load 后动态 import，不抢首屏带宽。
 */
import { hashSeedStr, mulberry32 } from '../lib/v3-art.mjs';

const MQ_DESK = '(min-width: 768px)';
const ALPHA_CEIL = 0.06; // 三带合成总顶（07 册）
const BEACON = { x: 0.18, yTop: 0.64 }; // 01 册散点位（18vw, 64vh；原信标位，F3-0 起为灰散点）

const VERT = `#version 300 es
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uBand[3];   // x=相位偏移 y=抖幅系数（seed 派生）
uniform vec3 uBlue;
uniform vec3 uTeal;
uniform vec3 uScatter;  // 白/灰散点（--c-ink-muted 实读，非信标红）
uniform vec2 uBeacon;    // uv（y 向上）
out vec4 o;

float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 3; k++){ v += a * vnoise(p); p = p * 2.03 + vec2(1.7, -3.1); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  // 20° 斜轴：along=沿带方向，across=垂直带方向（纵横比校正）
  float ang = 0.349066; // 20deg
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 nrm = vec2(-dir.y, dir.x);
  vec2 uva = vec2(uv.x * (uRes.x / uRes.y), uv.y);
  float along = dot(uva, dir);
  float across = dot(uva, nrm);

  vec3 col = vec3(0.0);
  float aBand = 0.0;
  for (int j = 0; j < 3; j++){
    float fj = float(j);
    // 流速减半制式：0.4px/f ≈ 24px/s → 归一化时间 ×0.02/s（1080p 高折算）
    float cx = along * 2.2 + uTime * 0.02 * (0.5 + uBand[j].y * 0.25) + uBand[j].x;
    float center = 0.34 + fj * 0.14 + 0.085 * fbm(vec2(cx, fj * 7.0 + uBand[j].x));
    float d = abs(across - center);
    float glow = exp(-d * d / 0.0018);                       // 带核高斯衰减
    float shimmer = 0.65 + 0.35 * fbm(vec2(cx * 2.6, across * 9.0)); // 波形纹理
    float w = (0.05 - fj * 0.008) * glow * shimmer;          // 主带最亮，副带渐次
    col += mix(uBlue, uTeal, clamp(along * 0.5 + 0.2 + fj * 0.13, 0.0, 1.0)) * w;
    aBand += w;
  }
  if (aBand > ${ALPHA_CEIL.toFixed(2)}){ col *= ${ALPHA_CEIL.toFixed(2)} / aBand; aBand = ${ALPHA_CEIL.toFixed(2)}; }

  // 散点（F3-0 seq=993 修正）：静态白/灰小点，无呼吸无脉冲环，不占 07 册「L0 唯一红点」额度；
  // 01 册散点语义=非信号源的构图呼吸件。亮度受 0.06 顶同族约束（≤0.10 观感级）。
  vec2 dxy = (uv - uBeacon) * vec2(uRes.x / uRes.y, 1.0);
  float bd = length(dxy);
  float aB = (1.0 - smoothstep(0.0030, 0.0052, bd)) * 0.10;

  col += uScatter * aB;              // 预乘累加（canvas premultipliedAlpha 默认 true）
  float a = clamp(aBand + aB, 0.0, 1.0);
  o = vec4(col, a);
}`;

function seedFromLocation(): string {
  try {
    const q = new URLSearchParams(location.search).get('seed');
    if (q && /^[\w.-]{1,64}$/.test(q)) return q;
  } catch {
    /* location 异常：回落默认 */
  }
  return '';
}

function hexToRgb(css: string): [number, number, number] {
  const s = css.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) {
    const n = parseInt(s.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  return [0.18, 0.43, 0.93]; // 解析失败=--c-accent dark 值近似（氛围层兜底，非设计色位）
}

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  return {
    blue: hexToRgb(cs.getPropertyValue('--c-accent') || '#2f6fed'),
    teal: hexToRgb(cs.getPropertyValue('--c-teal') || '#37d0c0'),
    scatter: hexToRgb(cs.getPropertyValue('--c-ink-muted') || '#9ba3af'),
  };
}

function bandParams(seed: string): number[] {
  const rng = mulberry32(hashSeedStr(seed || '0x5EED'));
  const out: number[] = [];
  for (let j = 0; j < 3; j++) out.push(rng() * 100, 0.4 + rng() * 1.2);
  return out;
}

function initOne(root: HTMLElement) {
  const canvas = root.querySelector('canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return; // M 档 display:none：跳过

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) {
    // WebGL2 不可用=氛围层缺失不判缺陷（台账：观感回退到 grain+底色静面）；不抛错
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader compile');
    return sh;
  };
  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link');
  } catch {
    canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
    return; // 编译失败：氛围层整体缺席（台账口径同上）
  }
  gl.useProgram(program);

  const emptyVao = gl.createVertexArray();
  gl.bindVertexArray(emptyVao);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const loc = {
    res: u('uRes'),
    time: u('uTime'),
    band: u('uBand[0]'),
    blue: u('uBlue'),
    teal: u('uTeal'),
    scatter: u('uScatter'),
    beacon: u('uBeacon'),
  };

  const seed = seedFromLocation() || root.getAttribute('data-seed') || '0x5EED';
  const band = bandParams(seed);
  const tokens = readTokens();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.uniform2f(loc.res, canvas.width, canvas.height);
  gl.uniform2fv(loc.band, new Float32Array(band));
  gl.uniform3fv(loc.blue, tokens.blue);
  gl.uniform3fv(loc.teal, tokens.teal);
  gl.uniform3fv(loc.scatter, tokens.scatter);
  gl.uniform2f(loc.beacon, BEACON.x, 1 - BEACON.yTop);

  const draw = (t: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(loc.time, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const desktop = matchMedia(MQ_DESK).matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd =
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4);

  canvas.classList.add('sf-on');

  if (!desktop || reduce || lowEnd) {
    draw(0); // 单帧静图（reduce/低端/M 共用；F3 起 M 端渲染=一屏场主体层）
    return;
  }

  const t0 = performance.now();
  let raf = 0;
  const step = () => {
    if (document.hidden) {
      raf = requestAnimationFrame(() => step());
      return;
    }
    draw((performance.now() - t0) / 1000);
    raf = requestAnimationFrame(() => step());
  };
  raf = requestAnimationFrame(() => step());
  if (root.__sfCancel) root.__sfCancel();
  root.__sfCancel = () => cancelAnimationFrame(raf);
}

declare global {
  interface HTMLElement {
    __sfCancel?: () => void;
  }
}

/* 合拢批 H3：L3 V2 环境带——可见性驱动播放（进屏注 src+play，离屏 pause 省电）；
 * reduce/低端=不注 src=poster webp 静帧制式（与 isStaticMode 同口径阈值）；
 * webm 优先（canPlayType），H.264 mp4 兜底。resize/主题重跑 initAll 时旧 IO 先 disconnect。 */
let bandIO: IntersectionObserver | null = null;

function bindL3Band() {
  bandIO?.disconnect();
  bandIO = null;
  const video = document.querySelector<HTMLVideoElement>('.l3-band-v');
  if (!video || !video.isConnected || !video.dataset.webm) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd =
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4);
  if (reduce || lowEnd) return;
  const src = video.canPlayType('video/webm;codecs=vp9') ? video.dataset.webm : video.dataset.mp4;
  bandIO = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          if (!video.src && src) {
            video.src = src;
            video.load();
          }
          void video.play().catch(() => {
            /* 自动播放被拦=静帧 poster，不伤页面 */
          });
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: '120px' },
  );
  bandIO.observe(video);
}

function initAll() {
  document.querySelectorAll<HTMLElement>('[data-sf]').forEach((el) => {
    if (!el.isConnected) return;
    if (el.__sfCancel) el.__sfCancel(); // 重初始化前先停旧 rAF（resize/主题/seed 换场）
    try {
      initOne(el);
    } catch {
      /* 氛围层单实例失败不影响页面其余部分 */
    }
  });
  bindL3Band();
}

function bindGlobal() {
  const w = window as unknown as { __sfBound?: boolean };
  if (w.__sfBound) return;
  w.__sfBound = true;

  // regenerate 与 v3 画布共件：URL 已由 v3-canvas 监听器写 seed（replaceState），
  // 本监听只负责重读 URL 重绘场（两监听无顺序依赖：均从 location 解析）
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target.closest('[data-v3-regen]') : null;
    if (!target) return;
    initAll();
  });

  let resizeT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(initAll, 200);
  });

  new MutationObserver(() => initAll()).observe(document.documentElement, { attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => initAll());

  document.addEventListener('astro:page-load', () => initAll());
}

bindGlobal();
initAll();
