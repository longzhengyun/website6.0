/**
 * F2-4 L2 演示墙客户端（D-only）：
 * - 案 B WallField：08 册 §案 B——独立覆盖层 WebGL2 canvas，按瓦片矩形 SDF 分边输出四条渐隐光带
 *   （长度 70/62/66/74% 居中、2px 芯 + ~1.2px 柔化、圆角段 JS 预钳制），同一 7s 呼吸 uniform、
 *   每格 φ=mulberry32(hashSeedStr('L2-WALL')) 派生可复现；hover 补满 0.55（与 M-14 共享指针态）；
 *   reduce/低端=单帧静峰 0.18；WebGL2 不可用=边缘光缺席（台账备案，格体与内容不受影响）。
 * - M-14 磁吸：全格对指针 ±12px 位移吸附（--mx/--my + rAF lerp≈spring 观感），磁吸演示格内球另随指针
 *   在 ±40% 半径内跟随；离开回弹归零。
 * - 终端打字：SSR 全量可读为真相，JS 仅首次进视口重放一次逐字表演（reduce/低端不启动）。
 * - odometer：[data-count] 首次进视口 0→终值 count-up（构建期快照值不动，表演不造数）。
 * - scramble：L1 微型演示②解码循环（SSR=终值）。
 * - 示波器：L1 胶囊内 mini-canvas 实时波形（离屏暂停；reduce/低端=单帧）。
 */
import { hashSeedStr, mulberry32 } from '../lib/v3-art.mjs';

const BREATHE_MS = 7000;
const EDGE_HOVER = 0.55;
const MAG_MAX = 12;
const CELL_RADIUS = 46;
const MAX_CELLS = 8;

function isStaticMode(): boolean {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd =
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2);
  return reduce || lowEnd;
}

function tokenColor(name: string, fallback: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const m = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (!m) return [0.3, 0.3, 0.3];
  return [parseInt(m[1] + m[2], 16) / 255, parseInt(m[3] + m[4], 16) / 255, parseInt(m[5] + m[6], 16) / 255];
}

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

/* ---------- 案 B：WallField shader ---------- */

const WF_VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const WF_FS = `#version 300 es
precision highp float;
uniform vec2 uBuf;      // drawingBuffer 尺寸（device px）
uniform float uDpr;
uniform float uTime;    // 秒
uniform int uCount;
uniform float uStatic;  // 1=静峰 0.18（reduce/低端单帧）
uniform vec4 uRect[${MAX_CELLS}]; // css px：cx, cy, hw, hh（canvas 左上原点、y 向下）
uniform vec4 uLen[${MAX_CELLS}];  // 四边带长 px：top, right, bottom, left（圆角段已钳制）
uniform float uRot[${MAX_CELLS}]; // 弧度（CSS rotate 同向）
uniform float uPhi[${MAX_CELLS}];
uniform float uHov[${MAX_CELLS}]; // 0..1 hover 补满进度
uniform vec3 uCol[${MAX_CELLS}];
out vec4 outColor;

float bandMask(float perp, float along, float halfLen) {
  if (halfLen <= 0.0) return 0.0;
  float across = 1.0 - smoothstep(0.6, 2.8, perp);            // 2px 芯 + ~1.2px 柔化
  float ends = 1.0 - smoothstep(halfLen * 0.84, halfLen, abs(along)); // 两端渐隐（断口）
  return across * ends;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) / uDpr;
  vec3 acc = vec3(0.0);
  float aA = 0.0;
  for (int i = 0; i < ${MAX_CELLS}; i++) {
    if (i >= uCount) break;
    vec2 q = p - uRect[i].xy;
    float c = cos(-uRot[i]);
    float s = sin(-uRot[i]);
    q = vec2(q.x * c - q.y * s, q.x * s + q.y * c);
    float hh = uRect[i].w;
    float hw = uRect[i].z;
    float m = 0.0;
    m = max(m, bandMask(abs(q.y + hh), q.x, uLen[i].x * 0.5));
    m = max(m, bandMask(abs(q.y - hh), q.x, uLen[i].z * 0.5));
    m = max(m, bandMask(abs(q.x - hw), q.y, uLen[i].y * 0.5));
    m = max(m, bandMask(abs(q.x + hw), q.y, uLen[i].w * 0.5));
    if (m <= 0.002) continue;
    float breathe = 0.5 + 0.5 * sin(6.2831853 * uTime / ${(BREATHE_MS / 1000).toFixed(1)} + uPhi[i]);
    float peak = mix(uStatic > 0.5 ? 0.18 : 0.18 * breathe, ${EDGE_HOVER}, uHov[i]);
    float a = m * peak;
    acc += uCol[i] * a;
    aA = min(1.0, aA + a);
  }
  outColor = vec4(acc, aA);
}`;

type WF = {
  gl: WebGL2RenderingContext;
  loc: Record<string, WebGLUniformLocation | null>;
  canvas: HTMLCanvasElement;
  cells: HTMLElement[];
  rot: number[];
  phi: number[];
  hov: number[];
  hovT: number[];
  colors: [number, number, number][];
  rectBuf: Float32Array;
  lenBuf: Float32Array;
  staticMode: boolean;
  visible: boolean;
  raf: number;
  io?: IntersectionObserver;
};

function wfCompile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('[wall-field] shader 编译失败：', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function wfUpdateGeometry(wf: WF) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = wf.canvas.clientWidth;
  const ch = wf.canvas.clientHeight;
  const bw = Math.round(cw * dpr);
  const bh = Math.round(ch * dpr);
  if (wf.canvas.width !== bw || wf.canvas.height !== bh) {
    wf.canvas.width = bw;
    wf.canvas.height = bh;
  }
  const base = wf.canvas.getBoundingClientRect();
  const n = Math.min(wf.cells.length, MAX_CELLS);
  for (let i = 0; i < n; i++) {
    const r = wf.cells[i].getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    wf.rectBuf[i * 4] = r.left - base.left + w / 2;
    wf.rectBuf[i * 4 + 1] = r.top - base.top + h / 2;
    wf.rectBuf[i * 4 + 2] = w / 2;
    wf.rectBuf[i * 4 + 3] = h / 2;
    // 圆角段钳制：带长不超过直边段（08 册断口纪律：宁短勿越角）
    const straightX = Math.max(0, w - 2 * CELL_RADIUS - 8);
    const straightY = Math.max(0, h - 2 * CELL_RADIUS - 8);
    wf.lenBuf[i * 4] = Math.min(0.7 * w, straightX); // top（水平带受宽向直边限制）
    wf.lenBuf[i * 4 + 1] = Math.min(0.62 * h, straightY); // right（垂直带）
    wf.lenBuf[i * 4 + 2] = Math.min(0.66 * w, straightX); // bottom
    wf.lenBuf[i * 4 + 3] = Math.min(0.74 * h, straightY); // left
  }
  return n;
}

function wfDraw(wf: WF, t: number) {
  const { gl } = wf;
  const count = wfUpdateGeometry(wf);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(wf.loc.__p as unknown as WebGLProgram);
  gl.uniform2f(wf.loc.uBuf, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.uniform1f(wf.loc.uDpr, Math.min(window.devicePixelRatio || 1, 2));
  gl.uniform1f(wf.loc.uTime, t);
  gl.uniform1i(wf.loc.uCount, count);
  gl.uniform1f(wf.loc.uStatic, wf.staticMode ? 1 : 0);
  gl.uniform4fv(wf.loc.uRect, wf.rectBuf);
  gl.uniform4fv(wf.loc.uLen, wf.lenBuf);
  gl.uniform1fv(wf.loc.uRot, Float32Array.from(wf.rot));
  gl.uniform1fv(wf.loc.uPhi, Float32Array.from(wf.phi));
  gl.uniform1fv(wf.loc.uHov, Float32Array.from(wf.hov));
  gl.uniform3fv(wf.loc.uCol, Float32Array.from(wf.colors.flat()));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function initWallField(wall: HTMLElement, canvas: HTMLCanvasElement, cells: HTMLElement[], staticMode: boolean): WF | null {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const vs = wfCompile(gl, gl.VERTEX_SHADER, WF_VS);
  const fs = wfCompile(gl, gl.FRAGMENT_SHADER, WF_FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[wall-field] link 失败：', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray()); // 空 VAO + gl_VertexID 全屏三角（同 M-01 链路制式）
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const loc: Record<string, WebGLUniformLocation | null> = {
    __p: prog as unknown as WebGLUniformLocation,
    uBuf: gl.getUniformLocation(prog, 'uBuf'),
    uDpr: gl.getUniformLocation(prog, 'uDpr'),
    uTime: gl.getUniformLocation(prog, 'uTime'),
    uCount: gl.getUniformLocation(prog, 'uCount'),
    uStatic: gl.getUniformLocation(prog, 'uStatic'),
  };
  for (const name of ['uRect', 'uLen', 'uRot', 'uPhi', 'uHov', 'uCol']) {
    loc[name] = gl.getUniformLocation(prog, `${name}[0]`);
  }
  const rng = mulberry32(hashSeedStr('L2-WALL'));
  const wf: WF = {
    gl,
    loc,
    canvas,
    cells: cells.slice(0, MAX_CELLS),
    rot: cells.map((c) => {
      const m = getComputedStyle(c).transform;
      if (m && m !== 'none') {
        const v = m.match(/matrix\(([^)]+)\)/);
        if (v) {
          const [a, b] = v[1].split(',').map(Number);
          return Math.atan2(b, a);
        }
      }
      return 0;
    }),
    phi: cells.map(() => rng() * Math.PI * 2),
    hov: cells.map(() => 0),
    hovT: cells.map(() => 0),
    colors: cells.map((c) => {
      const token = c.dataset.edge || '--c-demo-3';
      const fb = token === '--c-demo-1' ? '#fbd509' : token === '--c-demo-2' ? '#52cd86' : token === '--c-demo-4' ? '#a16ce5' : token === '--c-demo-5' ? '#f767c1' : token === '--c-demo-6' ? '#ff4945' : '#3e98ff';
      return tokenColor(token, fb);
    }),
    rectBuf: new Float32Array(MAX_CELLS * 4),
    lenBuf: new Float32Array(MAX_CELLS * 4),
    staticMode,
    visible: false,
    raf: 0,
  };
  if (staticMode) {
    wfDraw(wf, 0);
    let done = false;
    const io = new IntersectionObserver(
      (es) => {
        if (!done && es.some((e) => e.isIntersecting)) {
          done = true;
          wfDraw(wf, 0); // 布局稳定后重画一次（rect 依赖渲染位置）
          io.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wall);
    wf.io = io;
    return wf;
  }
  const loop = () => {
    if (wf.visible && !document.hidden) {
      let active = false;
      for (let i = 0; i < wf.hov.length; i++) {
        const d = wf.hovT[i] - wf.hov[i];
        if (Math.abs(d) > 0.004) {
          wf.hov[i] += d * 0.18; // ≈180ms 弹性观感（与案 A 同族）
          active = true;
        } else wf.hov[i] = wf.hovT[i];
      }
      wfDraw(wf, performance.now() / 1000);
      void active;
    }
    wf.raf = requestAnimationFrame(loop);
  };
  wf.raf = requestAnimationFrame(loop);
  const io = new IntersectionObserver(
    (es) => {
      wf.visible = es.some((e) => e.isIntersecting);
    },
    { threshold: 0.02 },
  );
  io.observe(wall);
  wf.io = io;
  return wf;
}

/* ---------- M-14 磁吸 + hover 联动 ---------- */

type Magnet = { cancel(): void };

function initMagnet(cells: HTMLElement[], wf: WF | null, staticMode: boolean): Magnet {
  if (staticMode) return { cancel: () => {} };
  const state = cells.map((el) => ({ el, tx: 0, ty: 0, cx: 0, cy: 0, i: 0 }));
  const ball = document.querySelector<HTMLElement>('.mag-ball');
  let ballT = { x: 0, y: 0 };
  const ballC = { x: 0, y: 0 };
  let raf = 0;
  cells.forEach((el, idx) => {
    el.addEventListener('pointerenter', () => {
      if (wf) wf.hovT[idx] = 1;
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const s = state[idx];
      s.tx = Math.max(-1, Math.min(1, dx)) * MAG_MAX;
      s.ty = Math.max(-1, Math.min(1, dy)) * MAG_MAX;
      if (ball && el.classList.contains('cell-magnet')) {
        ballT = { x: Math.max(-1, Math.min(1, dx)) * r.width * 0.3, y: Math.max(-1, Math.min(1, dy)) * r.height * 0.3 };
      }
    });
    el.addEventListener('pointerleave', () => {
      const s = state[idx];
      s.tx = 0;
      s.ty = 0;
      if (wf) wf.hovT[idx] = 0;
    });
  });
  const loop = () => {
    for (const s of state) {
      s.cx += (s.tx - s.cx) * 0.16;
      s.cy += (s.ty - s.cy) * 0.16;
      if (Math.abs(s.tx - s.cx) < 0.05) s.cx = s.tx;
      if (Math.abs(s.ty - s.cy) < 0.05) s.cy = s.ty;
      s.el.style.setProperty('--mx', `${s.cx.toFixed(2)}px`);
      s.el.style.setProperty('--my', `${s.cy.toFixed(2)}px`);
    }
    if (ball) {
      ballC.x += (ballT.x - ballC.x) * 0.14;
      ballC.y += (ballT.y - ballC.y) * 0.14;
      ball.style.setProperty('--bx', `${ballC.x.toFixed(2)}px`);
      ball.style.setProperty('--by', `${ballC.y.toFixed(2)}px`);
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return {
    cancel: () => {
      cancelAnimationFrame(raf);
      for (const s of state) {
        s.el.style.removeProperty('--mx');
        s.el.style.removeProperty('--my');
      }
    },
  };
}

/* ---------- 终端打字（SSR=真相，JS 首见重放一次） ---------- */

function initTerm(term: HTMLElement, staticMode: boolean, stoppers: { cancel(): void }[]) {
  if (staticMode) return;
  const io = new IntersectionObserver(
    (es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const lines = Array.from(term.querySelectorAll<HTMLElement>('.t-line'));
      const odo = term.querySelector<HTMLElement>('.term-odo');
      let timers: number[] = [];
      term.classList.add('term-anim');
      if (odo) odo.style.opacity = '0';
      let delay = 260;
      lines.forEach((line, li) => {
        const cmd = line.querySelector<HTMLElement>('.t-cmd');
        if (!cmd) return;
        const full = cmd.textContent || '';
        cmd.dataset.full = full;
        cmd.textContent = '';
        const chars = Array.from(full);
        chars.forEach((ch, ci) => {
          void ch;
          timers.push(
            window.setTimeout(() => {
              cmd.textContent = chars.slice(0, ci + 1).join('');
            }, delay + ci * 18),
          );
        });
        delay += chars.length * 18 + 240;
        timers.push(
          window.setTimeout(() => {
            line.classList.add('t-shown');
            if (li === 2 && odo) {
              odo.style.transition = 'opacity .35s ease-out';
              odo.style.opacity = '1';
              initOdometer(term, stoppers); // cat vitals.json 落定后才滚数（表演不抢跑）
            }
          }, delay),
        );
        delay += 160;
      });
      stoppers.push({
        cancel: () => {
          timers.forEach(clearTimeout);
          timers = [];
          term.classList.remove('term-anim');
          lines.forEach((line) => {
            const cmd = line.querySelector<HTMLElement>('.t-cmd');
            if (cmd && cmd.dataset.full) cmd.textContent = cmd.dataset.full;
          });
          if (odo) odo.style.opacity = '';
        },
      });
    },
    { threshold: 0.35 },
  );
  io.observe(term);
  stoppers.push({ cancel: () => io.disconnect() });
}

/* ---------- odometer count-up（构建期终值，表演不造数） ---------- */

function initOdometer(root: ParentNode, stoppers: { cancel(): void }[]) {
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count || '', 10);
    if (!Number.isFinite(target)) return;
    const suffix = el.querySelector('.odo-suffix');
    const suffixHtml = suffix ? suffix.outerHTML : '';
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 900;
        const step = (now: number) => {
          const u = Math.min(1, (now - t0) / dur);
          const v = Math.round(target * (1 - Math.pow(1 - u, 3)));
          el.innerHTML = `${v.toLocaleString('en-US')}${suffixHtml}`;
          if (u < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    stoppers.push({ cancel: () => io.disconnect() });
  });
}

/* ---------- scramble 解码（L1 微型演示②） ---------- */

const SCRAMBLE_POOL = '信号噪声中文直读代码波场▚▞░▒';

function initScramble(el: HTMLElement, staticMode: boolean, stoppers: { cancel(): void }[]) {
  const phrase = el.textContent || '';
  if (staticMode || !phrase) return;
  let timer = 0;
  const run = () => {
    const chars = Array.from(phrase);
    const t0 = performance.now();
    const dur = 720;
    const frame = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      const shown = Math.floor(chars.length * u);
      el.textContent = chars
        .map((c, i) => (i < shown || c === ' ' || c === '·' ? c : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)]))
        .join('');
      if (u < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  const loop = () => {
    timer = window.setTimeout(() => {
      run();
      loop();
    }, 4200);
  };
  loop();
  stoppers.push({
    cancel: () => {
      clearTimeout(timer);
      el.textContent = phrase;
    },
  });
}

/* ---------- 示波器 mini-canvas（L1 胶囊，离屏暂停） ---------- */

function initScope(c: HTMLCanvasElement, stoppers: { cancel(): void }[]) {
  let raf = 0;
  let visible = false;
  const io = new IntersectionObserver((es) => (visible = es.some((e) => e.isIntersecting)), { threshold: 0.1 });
  io.observe(c);
  stoppers.push({ cancel: () => io.disconnect() });
  const ctx = fitCanvas(c);
  if (!ctx) return;
  const color = tokenColor('--c-demo-3', '#3e98ff')
    .map((v) => Math.round(v * 255))
    .join(',');
  const w = c.clientWidth;
  const h = c.clientHeight;
  const rng = mulberry32(hashSeedStr('SCOPE'));
  const noise = Array.from({ length: 64 }, () => rng());
  const draw = (t: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(${color},0.9)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const n = noise[Math.floor((x / w) * 63)];
      const y = h / 2 + Math.sin(x * 0.18 + t * 0.004) * h * 0.3 * (0.55 + 0.45 * n);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  if (isStaticMode()) {
    draw(0);
    return;
  }
  const loop = () => {
    if (visible && !document.hidden) draw(performance.now());
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  stoppers.push({ cancel: () => cancelAnimationFrame(raf) });
}

/* ---------- 初始化 ---------- */

let stoppers: { cancel(): void }[] = [];

function initAll() {
  for (const s of stoppers) s.cancel();
  stoppers = [];
  const desktop = matchMedia('(min-width: 768px)').matches;
  if (!desktop) return; // M 档 L1/L2 整层不渲染（F3 另案）
  const staticMode = isStaticMode();
  const wall = document.querySelector<HTMLElement>('[data-wall]');
  const wfCanvas = document.querySelector<HTMLCanvasElement>('[data-wf]');
  let wf: WF | null = null;
  if (wall && wfCanvas) {
    const cells = Array.from(wall.querySelectorAll<HTMLElement>('[data-cell]'));
    try {
      wf = initWallField(wall, wfCanvas, cells, staticMode);
    } catch {
      wf = null; // 案 B 缺席=边缘光简化态（台账），格体不受影响
    }
    stoppers.push({
      cancel: () => {
        cancelAnimationFrame(wf?.raf || 0);
        wf?.io?.disconnect();
        wf = null;
      },
    });
    stoppers.push(initMagnet(cells, wf, staticMode));
  }
  const term = document.querySelector<HTMLElement>('[data-term]');
  if (term) initTerm(term, staticMode, stoppers);
  const scramble = document.querySelector<HTMLElement>('[data-scramble]');
  if (scramble) initScramble(scramble, staticMode, stoppers);
  document.querySelectorAll<HTMLCanvasElement>('[data-scope]').forEach((c) => initScope(c, stoppers));
}

const w = window as unknown as { __l2WallBound?: boolean };
if (!w.__l2WallBound) {
  w.__l2WallBound = true;
  document.addEventListener('astro:page-load', () => initAll());
  let t = 0;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = window.setTimeout(initAll, 200);
  });
}
initAll();
