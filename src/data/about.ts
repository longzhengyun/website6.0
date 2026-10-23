// 示例内容基线：真实履历/年限由站主提供后替换（数据结构即验收契约，知识岗已建档待采集）。
export interface Skill {
  name: string;
  rank: 1 | 2 | 3 | 4 | 5;
  note: string;
}

export interface TimelineEntry {
  period: string;
  role: string;
  org: string;
  desc: string;
}

export const skills: Skill[] = [
  { name: 'TypeScript', rank: 5, note: 'strict 模式默认，类型即文档' },
  { name: 'CSS 平台新特性', rank: 5, note: 'scroll-driven / VF / 层叠 / :has()' },
  { name: 'Astro / Vite 生态', rank: 4, note: 'Islands、Content Collections、插件' },
  { name: 'React / Vue', rank: 4, note: '19 / 3.5 全家桶，迁移与混用' },
  { name: 'Web AI 工程', rank: 4, note: 'Built-in AI / WebLLM / RAG 索引' },
  { name: '性能与 A11y', rank: 4, note: 'CWV 预算制、WCAG AA' },
  { name: 'WebGPU / 图形', rank: 3, note: 'compute shader 与降级链' },
  { name: '构建与 CI', rank: 3, note: 'Actions 流水线、质量门禁' },
];

export const timeline: TimelineEntry[] = [
  {
    period: '2024 —',
    role: '前端工程师（个人站长期迭代）',
    org: 'jary8.com',
    desc: '从 website5.0（Astro）到 6.0：把生产实践直接发布为站点本身，构建期 AI 管线、端侧模型、原生 CSS 动效为当前主线。',
  },
  {
    period: '示例条目',
    role: '此条为结构示例',
    org: '真实经历待站主补充',
    desc: '字段：年份 / 角色 / 组织 / 一句话成果。替换本条即完成数据接入，无需改页面。',
  },
];
