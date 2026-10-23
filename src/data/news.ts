/* 数据入口 —— M3 契约迁入后（backend crosscheck §3）：
 * - 类型由 pipeline/schema/news.schema.json 经 json-schema-to-typescript 生成（news.types.d.ts），不再手写。
 * - news.seed.json 为契约外开发占位数据；管线首跑覆盖 src/data/news.json 后，仅需把下方 import 切到 './news.json'，seed 退役。 */
import type { Website60NewsJson } from './news.types';
import feed from './news.seed.json';

// JSON 模块推断无法表达 tags 的元组约束（minItems/maxItems）；沿用旧版断言口径——运行时校验在管线落盘前（schema 校验），前端信任构建产物
export const news = feed as unknown as Website60NewsJson;

export const sortedItems = [...news.items].sort((a, b) =>
  b.published_at.localeCompare(a.published_at),
);

export const allTags = [...new Set(news.items.flatMap((i) => [...i.tags]))].sort();
