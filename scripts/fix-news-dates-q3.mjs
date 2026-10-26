#!/usr/bin/env node
/**
 * Q3 一次性数据修复（P-3a F1，后端 2026-10-26；站主批复 seq=100）
 * 对 src/data/news.json 中 published_at > fetched_at 的存量违例条目：
 *   - 源带 pubdate_tz_mislabel_hours 者回拨补偿（infoq-cn: -8h）；
 *   - 修正后仍晚于 fetched_at 者钳制为 fetched_at 并置 date_inferred=true。
 * 写盘前跑与管线同构的 schema 校验 + 密钥痕迹扫描；默认 --dry-run，加 --apply 才写。
 * 本脚本为一次性工具，修复完成后保留作审计与同类缺陷应急复用（非死代码）。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { applyTzMislabel, findDateViolations } from '../pipeline/src/dates/quality.mjs';

const require = createRequire(import.meta.url);
const Ajv = require('ajv/dist/2020');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  sources: join(ROOT, 'pipeline/config/sources.json'),
  schema: join(ROOT, 'pipeline/schema/news.schema.json'),
  out: join(ROOT, 'src/data/news.json'),
};
const SECRET_PATTERNS =
  /AIza[0-9A-Za-z_-]{20,}|ghp_[0-9A-Za-z]{36}|github_pat_[0-9A-Za-z_]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;

const apply = process.argv.includes('--apply');
const feed = JSON.parse(readFileSync(P.out, 'utf8'));
const mislabel = new Map(
  JSON.parse(readFileSync(P.sources, 'utf8')).sources.map((s) => [s.id, Number(s.pubdate_tz_mislabel_hours) || 0]),
);

const before = findDateViolations(feed.items);
console.log(`[fix-news-dates] violations before: ${before.length}`);
const report = [];
for (const it of feed.items) {
  if (Date.parse(it.published_at) <= Date.parse(it.fetched_at)) continue;
  const oldPub = it.published_at;
  const shifted = applyTzMislabel(new Date(it.published_at), mislabel.get(it.source_id) ?? 0);
  let pub = shifted.toISOString();
  let inferred = it.date_inferred;
  if (Date.parse(pub) > Date.parse(it.fetched_at)) {
    pub = it.fetched_at;
    inferred = true;
  }
  it.published_at = pub;
  it.date_inferred = inferred;
  report.push(`${it.source_id} ${it.fingerprint} ${oldPub} -> ${pub} (date_inferred=${it.date_inferred})`);
}
for (const r of report) console.log('  fixed:', r);

const after = findDateViolations(feed.items);
console.log(`[fix-news-dates] violations after: ${after.length}`);
if (after.length) {
  console.error('[fix-news-dates] FATAL: violations remain after fix, nothing written.');
  process.exitCode = 1;
} else {
  const ajv = new Ajv({ strict: false });
  ajv.addFormat('date-time', { type: 'string', validate: (s) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(s) });
  ajv.addFormat('uri', { type: 'string', validate: (s) => /^https?:\/\/\S+$/.test(s) });
  const validate = ajv.compile(JSON.parse(readFileSync(P.schema, 'utf8')));
  if (!validate(feed)) {
    for (const err of validate.errors ?? []) console.error('[fix-news-dates] schema_error', JSON.stringify(err));
    console.error('[fix-news-dates] FATAL: schema validation failed, nothing written.');
    process.exitCode = 1;
  } else {
    const out = JSON.stringify(feed, null, 2) + '\n';
    if (SECRET_PATTERNS.test(out)) {
      console.error('[fix-news-dates] FATAL: secret-like pattern, nothing written.');
      process.exitCode = 1;
    } else if (apply) {
      writeFileSync(P.out, out, 'utf8');
      console.log('[fix-news-dates] APPLIED: news.json written.');
    } else {
      console.log('[fix-news-dates] dry-run only (pass --apply to write).');
    }
  }
}
