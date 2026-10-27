// [L-2 设计 spec §1.5] GitHub Pages 项目站 404 规则：命中错误路径时 Pages 返回的是**仓库站点根**的
// 404.html，而不是 base 前缀内的 /website6.0/404.html —— 构建后必须把 dist/<base>/404.html 复制到 dist/ 根。
// 【换绑替换点】域名换绑、base 改 '/' 后 astro 直接产出 dist/404.html，本脚本自动 no-op；
// 但复制步本身保留（Pages 根 404 规则不随域名变化）。若遇 Pages 行为变化由开发运维实测反馈。
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, '..', 'dist');
const base = String(config.base ?? '/').replace(/^\/+|\/+$/g, '');
const nested = base ? join(dist, ...base.split('/'), '404.html') : join(dist, '404.html');
const root = join(dist, '404.html');

if (!existsSync(dist)) {
  console.error('copy-root-404: dist/ 不存在，先 astro build');
  process.exit(1);
}
if (nested === root) {
  if (!existsSync(root)) {
    console.error('copy-root-404: base 为 / 但 dist/404.html 缺失（404.astro 未构建？）');
    process.exit(1);
  }
  console.log('copy-root-404: no-op（404.html 已在 dist 根）');
} else if (existsSync(root)) {
  console.log('copy-root-404: no-op（dist/404.html 已存在）');
} else if (existsSync(nested)) {
  copyFileSync(nested, root);
  console.log(`copy-root-404: ${nested.slice(dist.length + 1).split(sep).join('/')} -> dist/404.html`);
} else {
  console.error('copy-root-404: 未找到 404 产物（期望 dist/<base>/404.html）');
  process.exit(1);
}
