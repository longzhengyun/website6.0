import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTzMislabel, clampFutureDate, findDateViolations } from '../../pipeline/src/dates/quality.mjs';

test('applyTzMislabel: infoq-cn 型错标（UTC+8 标 GMT）回拨 8h 还原真实瞬间', () => {
  const labeled = new Date('2026-10-26T20:08:25Z'); // feed 标 20:08 "GMT"，实为北京时间
  const fixed = applyTzMislabel(labeled, 8);
  assert.equal(fixed.toISOString(), '2026-10-26T12:08:25.000Z');
});

test('applyTzMislabel: hours 缺省/0/非法 = 不补偿（其余源零影响）', () => {
  const d = new Date('2026-10-26T05:00:00Z');
  for (const h of [undefined, 0, null, NaN]) assert.equal(applyTzMislabel(d, h), d);
});

test('applyTzMislabel: null/无效日期透传（保留 date_inferred 兜底路径语义）', () => {
  assert.equal(applyTzMislabel(null, 8), null);
  assert.ok(Number.isNaN(applyTzMislabel(new Date('bad'), 8).getTime()));
});

test('clampFutureDate: 晚于 NOW 的发布时间钳制为 NOW 并报 clamped', () => {
  const now = new Date('2026-10-26T12:00:00Z');
  const r = clampFutureDate(new Date('2026-10-26T19:00:00Z'), now);
  assert.equal(r.clamped, true);
  assert.equal(r.date, now);
});

test('clampFutureDate: 正常/恰等于 NOW 不触发钳制', () => {
  const now = new Date('2026-10-26T12:00:00Z');
  assert.deepEqual(clampFutureDate(new Date('2026-10-26T11:00:00Z'), now), { date: new Date('2026-10-26T11:00:00Z'), clamped: false });
  assert.equal(clampFutureDate(now, now).clamped, false);
  assert.deepEqual(clampFutureDate(null, now), { date: null, clamped: false });
});

test('findDateViolations: 容差 0min——严格大于才违例，等于通过；仅检出坏条目', () => {
  const items = [
    { fingerprint: 'a', published_at: '2026-10-26T13:21:00.000Z', fetched_at: '2026-10-26T05:42:38.794Z' }, // 违例（Q3 实样）
    { fingerprint: 'b', published_at: '2026-10-26T05:00:00.000Z', fetched_at: '2026-10-26T05:42:38.794Z' }, // 正常
    { fingerprint: 'c', published_at: '2026-10-26T05:42:38.794Z', fetched_at: '2026-10-26T05:42:38.794Z' }, // 边界（钳制后相等）
  ];
  const v = findDateViolations(items);
  assert.equal(v.length, 1);
  assert.equal(v[0].fingerprint, 'a');
  assert.deepEqual(findDateViolations([]), []);
  assert.deepEqual(findDateViolations(undefined), []);
});
