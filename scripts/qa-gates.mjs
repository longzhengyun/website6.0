#!/usr/bin/env node
/**
 * P-4/G1-G6 质量门禁断言（开发运维实现；口径=测试 shared/qa-v6p2-quality-baseline-v1.md §2.1）
 * 本地模式（默认）：G2 dist 完整性+内链、G3 每页 meta 结构、G4 外链 rel 审计、G5 news 数据断言。
 * 在线模式（--live <url>）：G6 部署后 smoke（四页 200 / robots / 真 404 状态码 / _astro 哈希资源 / 首条一致性）。
 * 零第三方依赖（node builtins + fetch）。G5 容差 0min（站主裁定口径）；P-3a 修复合入后默认 fail（3f92c3b 起），
 * 如需临时降级可显式 QA_G5_MODE=warn（切换已同步后端/测试对账）。
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const args = process.argv.slice(2);
const liveIdx = args.indexOf('--live');
const LIVE = liveIdx >= 0 ? args[liveIdx + 1] : null;
if (liveIdx >= 0 && (!LIVE || LIVE.startsWith('--'))) {
  console.error('[qa-gates] --live 需要非空 URL 参数（在线模式 G6），例如: node scripts/qa-gates.mjs --live https://example.com/');
  process.exit(1);
}

// base 从 astro.config.mjs 读取（M5 换绑 base 改 '/' 后无需改本脚本）
const cfgSrc = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
const baseMatch = cfgSrc.match(/base:\s*'([^']*)'/);
const BASE = (baseMatch ? baseMatch[1] : '/').replace(/\/$/, ''); // '' when base '/'
const PAGES = ['index.html', 'about/index.html', 'news/index.html', 'resume/index.html'];
const G5_WHITELIST = ['juejin']; // items_fetched=0 已知基线例外（测试 §2.1 G5；待后端定夺移除）

let failures = [];
let warnings = [];
const fail = (gate, msg) => failures.push(`[${gate}] ${msg}`);
const warn = (gate, msg) => warnings.push(`[${gate}] ${msg}`);

function walkHtml(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (e.endsWith('.html')) acc.push(p);
  }
  return acc;
}
function relUrlToDistCandidates(u) {
  // strip query/hash; u 已去除 BASE 前缀、以 / 开头
  const path = u.split(/[?#]/)[0];
  if (path === '' || path === '/') return ['index.html'];
  const p = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return [`${p}/index.html`, p, `${p}.html`];
}
function decodeEnt(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
}
const countRe = (html, re) => (html.match(re) || []).length;

// ---------- 本地门禁 G2-G5 ----------
async function localGates() {
  if (!existsSync(DIST)) { fail('G2', 'dist/ 不存在：先 astro build'); return; }
  const htmls = walkHtml(DIST);

  // G2a 页面存在（404.html 为 L-2 可选项，缺失仅提示）
  for (const pg of PAGES) {
    if (!existsSync(join(DIST, pg))) fail('G2', `缺页面产物 dist/${pg}`);
  }
  if (!existsSync(join(DIST, '404.html'))) warn('G2', '404.html 未生成（L-2 前挂起，不阻塞）');

  // G2b 内链命中
  const seen = new Set();
  for (const f of htmls) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|tel:|\/\/|#|data:)/i.test(u)) continue;
      let rel = u;
      if (BASE && (u === BASE || u.startsWith(BASE + '/'))) rel = u.slice(BASE.length) || '/';
      else if (u.startsWith('/') && BASE && !u.startsWith(BASE + '/') && u !== BASE) continue; // 站外根路径（如 5.0 遗留）不属本站 dist
      const key = `${f}|${rel}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const cands = relUrlToDistCandidates(rel);
      if (!cands.some((c) => existsSync(join(DIST, c)))) fail('G2', `内链未命中 dist：${u} (${rel})`);
    }
  }

  // G3 每页结构断言 + OG（L-2 后启用 OG 断言）
  const ogAsserted = existsSync(join(DIST, '404.html'));
  for (const f of htmls) {
    const html = readFileSync(f, 'utf8');
    const page = f.slice(DIST.length + 1).replace(/\\/g, '/');
    if (countRe(html, /<title[\s>]/gi) !== 1) fail('G3', `${page}: title 数≠1`);
    if (countRe(html, /<meta[^>]+name=["']description["']/gi) !== 1) fail('G3', `${page}: description 数≠1`);
    if (countRe(html, /<meta[^>]+name=["']viewport["']/gi) !== 1) fail('G3', `${page}: viewport 数≠1`);
    if (countRe(html, /<h1[\s>]/gi) !== 1) fail('G3', `${page}: h1 数≠1`);
    if (ogAsserted) {
      for (const prop of ['og:title', 'og:description', 'og:url', 'og:image']) {
        if (!html.includes(`property="${prop}"`)) fail('G3', `${page}: 缺 ${prop}`);
      }
      if (!html.includes('name="twitter:card"')) fail('G3', `${page}: 缺 twitter:card`);
    }
  }

  // G4 外链 rel 审计
  let blankTotal = 0, blankOk = 0;
  for (const f of htmls) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
      const tag = m[0];
      if (!/target=["']_blank["']/i.test(tag)) continue;
      blankTotal++;
      const relM = tag.match(/rel=["']([^"']*)["']/i);
      const rel = (relM ? relM[1] : '').toLowerCase();
      if (rel.includes('noopener') && rel.includes('noreferrer')) blankOk++;
      else fail('G4', `外链缺 noopener/noreferrer：${tag.slice(0, 120)} in ${f.slice(DIST.length + 1)}`);
    }
  }
  console.log(`G4 外链: ${blankOk}/${blankTotal} 合规`);

  // G5 news 数据断言（0min 容差）
  const news = JSON.parse(readFileSync(join(ROOT, 'src/data/news.json'), 'utf8'));
  const items = Array.isArray(news) ? news : news.items;
  if (items.length > 100) fail('G5', `items ${items.length} > 100 上限`);
  let prev = null;
  for (const it of items) {
    const label = (it.title_zh || it.url || it.fingerprint || '?').slice(0, 40);
    const pub = Date.parse(it.published_at), fet = Date.parse(it.fetched_at);
    if (Number.isNaN(pub) || Number.isNaN(fet)) { fail('G5', `${label}: 时间不可解析`); continue; }
    if (pub > fet) fail('G5', `未来日期 ${label}: published_at=${it.published_at} > fetched_at=${it.fetched_at}`);
    if (prev !== null && pub > prev) fail('G5', `排序违例（非降序）：${label}`);
    prev = pub;
  }
  const statsPath = join(ROOT, 'src/data/news-stats.json');
  if (existsSync(statsPath)) {
    const stats = JSON.parse(readFileSync(statsPath, 'utf8'));
    for (const s of stats.sources || []) {
      if ((s.items_fetched ?? 0) === 0 && !G5_WHITELIST.includes(s.id)) {
        fail('G5', `源静默掉取 items_fetched=0：${s.id}（status=${s.status}）`);
      } else if ((s.items_fetched ?? 0) === 0) {
        warn('G5', `白名单例外源 items_fetched=0：${s.id}（待后端定夺）`);
      }
    }
  }
}

// ---------- G6 部署后 smoke ----------
async function get(url, opts = {}) {
  // 网络层错误重试 2 次（Pages 边缘 4 IP 轮转偶发抖动；状态码本身即断言，不重试）
  const delays = [2000, 5000];
  let lastErr;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', ...opts });
      return { status: res.status, body: await res.text() };
    } catch (e) {
      lastErr = new Error(`fetch ${url}: ${e.message}${e.cause ? ' cause: ' + (e.cause.message || e.cause.code || e.cause) : ''}`);
      if (attempt < delays.length) await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }
  throw lastErr;
}
async function liveGates(liveUrl) {
  const base = liveUrl.endsWith('/') ? liveUrl : liveUrl + '/';
  for (const p of ['', 'about/', 'news/', 'resume/', 'robots.txt']) {
    const r = await get(base + p);
    if (r.status !== 200) fail('G6', `${base + p} -> ${r.status}（期望 200）`);
  }
  const rand = 'qa-missing-' + Date.now().toString(36);
  const nf = await get(base + rand + '/');
  if (nf.status !== 404) fail('G6', `不存在路径 ${base + rand}/ -> ${nf.status}（期望真 404）`);

  const idx = await get(base);
  const assets = new Set();
  for (const m of idx.body.matchAll(/(?:href|src)="((?:[^"]*\/)?_astro\/[^"]+)"/g)) {
    const u = m[1];
    assets.add(u.startsWith('http') ? u : new URL(u, base).href);
  }
  for (const a of assets) {
    const res = await get(a);
    if (res.status !== 200) fail('G6', `哈希资源 ${a} -> ${res.status}`);
  }
  console.log(`G6 资源: ${assets.size} 个 _astro 资产检查`);

  // 首条一致性（与页面同口径：published_at 字符串降序首条的 title_zh；线上缓存最多 10min，重试 3 次×15s）
  const news = JSON.parse(readFileSync(join(ROOT, 'src/data/news.json'), 'utf8'));
  const items = Array.isArray(news) ? news : news.items;
  const first = [...items].sort((a, b) => b.published_at.localeCompare(a.published_at))[0];
  const firstTitle = decodeEnt(first?.title_zh || '');
  let consistent = false;
  for (let i = 0; i < 3 && !consistent; i++) {
    const nx = await get(base + 'news/');
    consistent = nx.body.includes(firstTitle);
    if (!consistent && i < 2) await new Promise((r) => setTimeout(r, 15000));
  }
  if (!consistent) fail('G6', `线上 /news 首条与仓库 master 不一致：${firstTitle}`);
}

(async () => {
  try {
    if (LIVE) await liveGates(LIVE);
    else await localGates();
  } catch (e) {
    fail(LIVE ? 'G6' : 'GATE', `脚本异常：${e && e.message}`);
  }
  for (const w of warnings) console.warn('WARN ' + w);
  if (failures.length) {
    const g5Only = failures.every((f) => f.startsWith('[G5]'));
    const mode = process.env.QA_G5_MODE || 'fail'; // P-3a 已合入（3f92c3b）：默认 fail；临时降级需显式 QA_G5_MODE=warn
    if (g5Only && mode === 'warn') {
      for (const f of failures) console.warn('WARN(G5 degraded) ' + f);
      console.log(`QA gates: ${failures.length} G5 违例按显式 warn 处理（默认口径为 fail）`);
      process.exit(0);
    }
    for (const f of failures) console.error('::error::' + f);
    console.error(`QA gates FAILED: ${failures.length} 项`);
    process.exit(1);
  }
  console.log('QA gates OK');
})();
