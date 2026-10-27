// L-5 本地反应精选：已读标记 + 阅读进度（design-contract-p2 §5.3/§5.4）。
// 硬边界：纯端侧 localStorage，零网络回传（数据不出本机）；无 JS 时功能整体缺席，内容可读不受损。
// 跨页一致：文档级委托 + astro:page-load 再水合，与 theme.ts 同构（ClientRouter 交换 DOM 后状态重放）。
import { relativePath } from '../data/site';

const READ_KEY = 'w6-read-items';
const PROGRESS_KEY = 'w6-read-progress';
const READ_CAP = 200; // LRU 上限：超限按最旧读取时间淘汰，防长期膨胀
const SAVE_INTERVAL_MS = 800; // 进度写盘节流
const RESTORE_MIN = 0.08; // 恢复窗口：<8% 视为没开始读
const RESTORE_MAX = 0.94; // >94% 视为已读完，重访回顶部更合理

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback; // localStorage 不可用（隐私模式）或数据损坏：按无数据降级
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储不可用：仅本次会话生效，不报错、不阻塞阅读
  }
}

// ---------- 已读标记 ----------

type ReadMap = Record<string, number>; // fingerprint → 最后点击时间 ms

function markRead(fingerprint: string): void {
  const map = readJson<ReadMap>(READ_KEY, {});
  map[fingerprint] = Date.now();
  const keys = Object.keys(map);
  if (keys.length > READ_CAP) {
    for (const k of keys.sort((a, b) => map[a] - map[b]).slice(0, keys.length - READ_CAP)) {
      delete map[k];
    }
  }
  writeJson(READ_KEY, map);
}

// §5.4：已读=标题转 ink-muted、编号保持 faint；不用删除线/透明度<1（对比度地板 4.5 保持）。
// 状态不只靠颜色：补 sr-only「（已读）」文本等价物（WCAG 1.4.1），视觉零膨胀。
function applyReadState(): void {
  const map = readJson<ReadMap>(READ_KEY, {});
  for (const card of document.querySelectorAll<HTMLAnchorElement>('a[data-news-key]')) {
    const fp = card.dataset.newsKey;
    const isRead = Boolean(fp && map[fp]);
    card.classList.toggle('is-read', isRead);
    let badge = card.querySelector<HTMLSpanElement>('[data-read-badge]');
    if (isRead && !badge) {
      badge = document.createElement('span');
      badge.setAttribute('data-read-badge', '');
      badge.className = 'sr-only';
      badge.append('（已读）');
      (card.querySelector('h2') ?? card).append(badge);
    } else if (!isRead && badge) {
      badge.remove();
    }
  }
}

// ---------- 阅读进度（可见进度件 = A6 书脊，本脚本只做持久化恢复，不新增第二进度件） ----------

type ProgressMap = Record<string, { pct: number; y: number; at: number }>;

function saveProgress(): void {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return; // 不可滚页无进度语义
  const pct = Math.min(1, Math.max(0, window.scrollY / scrollable));
  if (pct < 0.01) return; // 顶部微动不写盘，避免覆盖有效进度
  const map = readJson<ProgressMap>(PROGRESS_KEY, {});
  map[relativePath(window.location.pathname)] = {
    pct: Math.round(pct * 1000) / 1000,
    y: Math.round(window.scrollY),
    at: Date.now(),
  };
  writeJson(PROGRESS_KEY, map);
}

let scrollPending = false;
let lastSaveAt = 0;
function onScroll(): void {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    const now = Date.now();
    if (now - lastSaveAt < SAVE_INTERVAL_MS) return;
    lastSaveAt = now;
    saveProgress();
  });
}

function restoreProgress(): void {
  if (window.location.hash) return; // 锚点导航语义优先于进度恢复
  const key = relativePath(window.location.pathname);
  const saved = readJson<ProgressMap>(PROGRESS_KEY, {})[key];
  if (!saved || saved.pct < RESTORE_MIN || saved.pct > RESTORE_MAX) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const target = Math.min(saved.y, scrollable);
  if (Math.abs(window.scrollY - target) < 4) return; // ClientRouter 已恢复到位就不二次移动
  window.scrollTo(0, target);
}

function initLocalReactions(): void {
  applyReadState();
  restoreProgress();

  // 文档级委托：ClientRouter 页面交换后无需重新绑定
  document.addEventListener('click', (ev) => {
    const card = (ev.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-news-key]');
    if (!card) return;
    const fp = card.dataset.newsKey;
    if (!fp) return;
    markRead(fp);
    applyReadState();
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  // SPA 交换后：新闻列表是服务端新 HTML（is-read 态丢失）→ 重放；进度按新页路由恢复
  document.addEventListener('astro:page-load', () => {
    applyReadState();
    restoreProgress();
  });

  // 离开页面前把最后位置落盘（节流间隙内的收尾）；SPA 离开由滚动节流覆盖，
  // 且 saveProgress 的 <1% 不写盘守卫保证新页顶部不会覆盖旧页进度
  window.addEventListener('pagehide', saveProgress);
}

initLocalReactions();
