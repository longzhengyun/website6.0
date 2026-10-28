// L-1 三态主题切换：auto → light → dark 循环；data-theme 持久化；预绘脚本见 BaseLayout。
export const THEME_STORAGE_KEY = 'theme-mode';
export const MODES = ['auto', 'light', 'dark'] as const;
export type ThemeMode = (typeof MODES)[number];

export const LABEL: Record<ThemeMode, string> = { auto: '跟随系统', light: '亮色', dark: '暗色' };

export function getMode(): ThemeMode {
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

export function cycleMode(): void {
  const cur = getMode();
  const next = MODES[(MODES.indexOf(cur) + 1) % MODES.length];
  applyMode(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // 存储不可用时仅本次会话生效
  }
  refreshThemeLabels();
}

export function refreshThemeLabels(): void {
  const mode = getMode();
  document.querySelectorAll<HTMLElement>('[data-theme-label]').forEach((el) => {
    el.textContent = LABEL[mode];
  });
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((el) => {
    el.setAttribute('aria-label', `切换主题（当前：${LABEL[mode]}，点击切换到下一个）`);
  });
}

function initTheme(): void {
  applyMode(getMode());
  refreshThemeLabels();

  // 文档级委托，跨 ClientRouter 页面交换持续有效
  document.addEventListener('click', (ev) => {
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
