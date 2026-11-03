import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// FB-9-1（站主 seq=1329 指令，项目 seq=1332 分派）：站主已在 GitHub Pages 移除 jary8.com 域名，
// 站点回到 github.io 子路径托管形态。base '/website6.0/' + site 指向子路径根；
// OG/绝对 URL 仍经 Astro.site 单出处自动跟随（seq=261 口径不变）；SITE_URL 环境变量保留可切换。
// 注意：仓库 Variable SITE_URL 若仍指 jary8.com 会覆盖本默认值——开发运维 FB-9-2 核对项。
export default defineConfig({
  base: '/website6.0/',
  site: process.env.SITE_URL || 'https://longzhengyun.github.io/website6.0/',
  output: 'static',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
