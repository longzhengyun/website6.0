export const site = {
  nameZh: '佳瑞网',
  nameEn: 'Jary',
  tagline: '把浏览器能做的，做到最新。',
  taglineEn: 'Pushing the browser to its latest.',
  /** R16 三行制固定身份行（站主硬需求 5：站长身份必须稳定，不轮播） */
  role: 'web 前端开发工程师',
  email: 'jary0419@163.com',
  github: 'https://github.com/longzhengyun',
  year: 2026,
} as const;

export const nav = [
  { num: '01', href: '/', label: 'Home', zh: '首页' },
  { num: '02', href: '/news', label: 'News', zh: '新闻' },
  { num: '03', href: '/about', label: 'About', zh: '关于' },
] as const;

/** 去掉部署 base 前缀，得到路由相对路径 */
export function relativePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export const isActive = (href: string, current: string): boolean =>
  href === '/' ? current === '/' : current.startsWith(href);
