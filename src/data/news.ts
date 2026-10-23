/* 数据入口 —— M3 契约迁入后（backend crosscheck §3）：
 * - 类型由 pipeline/schema/news.schema.json 经 json-schema-to-typescript 生成（news.types.d.ts），不再手写。
 * - 本文件消费管线唯一写者产物 src/data/news.json（首跑为 rss_only 降级模式真实条目）。
 * - news.seed.json 已退役为占位参考（契约外，不参与构建；保留供离线开发/演示回退）。 */
import type { Website60NewsJson } from './news.types';
import feed from './news.json';

// JSON 模块推断无法表达 tags 的元组约束（minItems/maxItems）；沿用旧版断言口径——运行时校验在管线落盘前（schema 校验），前端信任构建产物
export const news = feed as unknown as Website60NewsJson;

export const sortedItems = [...news.items].sort((a, b) =>
  b.published_at.localeCompare(a.published_at),
);

export const allTags = [...new Set(news.items.flatMap((i) => [...i.tags]))].sort();
