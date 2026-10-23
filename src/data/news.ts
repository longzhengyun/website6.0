export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
}

export interface NewsFeed {
  version: number;
  mode: 'seed' | 'degraded' | 'full';
  generatedAt: string;
  note?: string;
  items: NewsItem[];
}

import feed from './news.json';

export const news = feed as NewsFeed;

export const sortedItems = [...news.items].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export const allTags = [...new Set(news.items.flatMap((i) => i.tags))].sort();
