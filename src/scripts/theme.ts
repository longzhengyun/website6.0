// L-1 三态主题切换：auto → light → dark 循环；data-theme 持久化；预绘脚本见 BaseLayout。
export const THEME_STORAGE_KEY = 'theme-mode';
export const MODES = ['auto', 'light', 'dark'] as const;
export type ThemeMode = (typeof MODES)[number];

// FB-8-2（站主 seq=1277 裁③「隐藏亮/暗切换，一直保持暗色」）：恒暗单源标志。
// SYNC:FORCE_DARK —— 本常量与 BaseLayout.astro 预绘脚本内联 FORCE_DARK、BaseLayout frontmatter
// FORCE_DARK（⌘K 条目过滤）三处必须同值；置 false 即整体放开（亮色 CSS 零删除，全可逆）。
// 口径：true 时不读取也不擦除 localStorage（放开后用户原偏好自动恢复）；
// 入口隐藏见 global.css FB-8-2 节（.theme-arc / [data-theme-toggle] / .tab-item-theme）。
export const FORCE_DARK = true;

export const LABEL: Record<ThemeMode, string> = { auto: '跟随系统', light: '亮色', dark: '暗色' };

export function getMode(): ThemeMode {
  if (FORCE_DARK) return 'dark';
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    // 隐私模式等场景 localStorage 不可用：回退默认 auto
  }
  return 'auto';
}

export function applyMode(mode: ThemeMode): void {
  const resolved = mode === 'auto' ? systemMode() : mode;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.setAttribute('data-theme', resolved);
}

function systemMode(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setMode(mode: ThemeMode): void {
  if (FORCE_DARK) return; // SYNC:FORCE_DARK 双保险：入口已隐藏，任何残余触发（theme:cycle/旧引用）不改态
  applyMode(mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // 存储不可用时仅本次会话生效
  }
  refreshThemeLabels();
}

export function cycleMode(): void {
  const cur = getMode();
  const next = MODES[(MODES.indexOf(cur) + 1) % MODES.length];
  setMode(next);
}

export function refreshThemeLabels(): void {
  const mode = getMode();
  document.querySelectorAll<HTMLElement>('[data-theme-label]').forEach((el) => {
    el.textContent = LABEL[mode];
  });
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((el) => {
    el.setAttribute('aria-label', `切换主题（当前：${LABEL[mode]}，点击切换到下一个）`);
  });
  // F3-4 弧排三点：当前档 aria-pressed=true（设计裁定 seq=1003 制式）
  document.querySelectorAll<HTMLElement>('[data-theme-set]').forEach((el) => {
    el.setAttribute('aria-pressed', String(el.dataset.themeSet === mode));
  });
}

function initTheme(): void {
  applyMode(getMode());
  refreshThemeLabels();

  // 文档级委托，跨 ClientRouter 页面交换持续有效
  document.addEventListener('click', (ev) => {
    // F3-4 弧排三点：直接置档（light/dark/auto），优先于循环制式
    const setBtn = (ev.target as Element | null)?.closest?.<HTMLElement>('[data-theme-set]');
    const want = setBtn?.dataset.themeSet;
    if (want === 'light' || want === 'dark' || want === 'auto') {
      ev.preventDefault();
      setMode(want);
      return;
    }
    const btn = (ev.target as Element | null)?.closest?.<HTMLElement>('[data-theme-toggle]');
    if (btn) {
      ev.preventDefault();
      cycleMode();
    }
  });

  // CommandPalette 动作条目派发
  document.addEventListener('theme:cycle', () => cycleMode());

  // auto 模式下跟随系统变化
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => applyMode(getMode()));

  // DEF-THEME-1：ClientRouter 的 html 级 swap 会擦掉 <html> 上的运行时属性
  // （data-theme/data-theme-mode 不在新页 SSR html 里，morphdom 属性同步即移除），
  // 预绘 inline 脚本 swap 时不重放——故每次 page-load 从 localStorage 重放 applyMode，
  // 与 local-reactions 的"文档级委托 + page-load 再水合"同构。
  document.addEventListener('astro:page-load', () => {
    applyMode(getMode());
    refreshThemeLabels();
  });
}

initTheme();
