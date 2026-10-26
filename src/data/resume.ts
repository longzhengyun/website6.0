// 示例内容基线：站主真实履历到位后仅替换本文件数据；页面结构与打印规则不变。
import { site } from './site';

export interface ResumeEntry {
  org: string;
  role: string;
  period: string;
  bullets: string[];
}

export const resume = {
  name: 'Jary · 佳瑞网站长',
  title: 'Web 前端开发工程师',
  sampleNote: '⚠ 以下为结构示例内容，真实履历由站主提供后替换（此提示不随打印输出）。',
  summary:
    '专注把浏览器最新能力直接做成可用产品的全站型前端：架构（Astro/TS/Tailwind 4）、渲染（可变字体、scroll-driven、WebGPU）、AI 工程（端侧模型、构建期 LLM 管线）三条线并进，本站即技术自证。',
  experience: [] as ResumeEntry[],
  projects: [
    {
      name: 'website6.0（佳瑞网）',
      period: '2026',
      desc: '纯静态 + 构建期 AI 新闻管线 + 端侧 AI 渐进增强的个人站，GitHub Pages 部署。',
    },
    {
      name: 'website5.0',
      period: '2026',
      desc: 'Astro 静态站迭代：CI 质量门禁、设计 token 体系与无障碍基线的建立。',
    },
  ],
  education: [{ school: '教育背景待站主补充', period: '—', note: '' }],
  contact: { email: site.email, github: site.github },
} as const;
