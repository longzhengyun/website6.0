// 真实素材基线（任务A·方案B）。出处均可证、原文录入不改写：
// - 身份/联系/自述/技能：website5.0/src/content/profile/profile.mdx（站主已发布）
// - 站史条目：website5.0/src/data/version-log.json（V3 2016.05 / V4 2020.06 / V5 2026.10）
//   技术栈互证：website3.0 product/views/about.html（AngularJS 等）、website4.0 pages/mine/about.vue（VUE/NODE/SQLITE）
// - 6.0/5.0 项目记录：本文件原示例基线（事实已由实施记录核验）
// 工作经历/教育两节待站主提供后原文录入；手机/年龄/期望年薪等旧后端字段一律不公示。
import { site } from './site';

export interface ResumeEntry {
  org: string;
  role: string;
  period: string;
  bullets: string[];
}

export interface SkillGroup {
  group: string;
  items: { name: string; level: string }[];
}

export const resume = {
  name: 'Jary',
  title: 'Web 前端开发',
  meta: 'UTC+8 · 站点始于 2008 · 从业始于 2007',
  sampleNote: '⚠ 部分字段待补充：工作经历与教育背景待站主提供后原文填入（此提示不随打印输出）。',
  summary:
    '多年 Web 前端开发经验。关心界面、性能与可维护性，也写字记录取舍；这里放着项目、文章，以及一些经得起回看的答案。',
  skills: [
    {
      group: '语言与基础',
      items: [
        { name: 'HTML / CSS', level: '熟练' },
        { name: 'JavaScript', level: '熟练' },
        { name: 'TypeScript', level: '熟练' },
      ],
    },
    {
      group: '框架与工具',
      items: [
        { name: 'React', level: '熟练' },
        { name: 'Vue', level: '熟练' },
        { name: 'Astro', level: '熟练' },
        { name: 'Node.js', level: '了解' },
      ],
    },
    {
      group: '工程与质量',
      items: [
        { name: '性能优化', level: '熟练' },
        { name: '可访问性', level: '熟练' },
        { name: '构建与发布', level: '熟练' },
      ],
    },
  ] as SkillGroup[],
  experience: [] as ResumeEntry[],
  projects: [
    {
      name: 'website6.0（佳瑞网）',
      period: '2026',
      desc: '纯静态 + 构建期 AI 新闻管线 + 端侧 AI 渐进增强的个人站，GitHub Pages 部署。',
    },
    {
      name: 'website5.0（佳瑞网）',
      period: '2026.10',
      desc: 'Astro 静态站迭代：CI 质量门禁、设计 token 体系与无障碍基线的建立。',
    },
    {
      name: 'website4.0（佳瑞网）',
      period: '2020.06',
      desc: 'Nuxt 2 + Koa + SQLite 版本上线，形成文章、案例、收藏与个人资料的完整内容结构。',
    },
    {
      name: 'website3.0（佳瑞网）',
      period: '2016.05',
      desc: 'AngularJS + PHP 版本，开始以文章与作品集的方式记录前端实践。',
    },
  ],
  education: [{ school: '教育背景待站主补充', period: '—', note: '' }],
  contact: { email: site.email, github: site.github },
} as const;
