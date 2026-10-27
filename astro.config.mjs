import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// M5 换绑已完成（2026-10-27，站主 DNS+Pages custom domain，开发运维诊断留档 shared/devops-domain-rebind-evidence.md）：
// base 回到站点根 '/'，site 切正式域名；OG/sitemap 绝对 URL 经 Astro.site 单出处自动跟随（seq=261 口径）。
export default defineConfig({
  base: '/',
  site: process.env.SITE_URL || 'https://www.jary8.com/',
  output: 'static',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
