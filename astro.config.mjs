import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// base 为路径验收阶段（longzhengyun.github.io/website6.0）；
// M5 域名换绑后改回 '/' 即可（一行变更，由开发运维门禁流程触发）。
export default defineConfig({
  base: '/website6.0/',
  site: process.env.SITE_URL || 'https://longzhengyun.github.io/website6.0/',
  output: 'static',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
