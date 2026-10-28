import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithEmptyRetry, FETCH_RETRY_DELAY_MS, FETCH_RETRY_MAX } from '../../pipeline/src/fetch/retry.mjs';

const okRes = (n) => ({ ok: true, items: Array.from({ length: n }, (_, i) => ({ title: 't' + i })), error: null });
const failRes = (msg) => ({ ok: false, items: [], error: msg });

test('首次成功且有条目：不重试、不延迟', async () => {
  const calls = []; const sleeps = []; const retries = [];
  const res = await fetchWithEmptyRetry(async (n) => { calls.push(n); return okRes(20); }, { sleep: async (ms) => sleeps.push(ms), onRetry: (...a) => retries.push(a) });
  assert.equal(res.ok, true); assert.equal(res.items.length, 20);
  assert.deepEqual(calls, [1]); assert.equal(sleeps.length, 0); assert.equal(retries.length, 0);
});

test('首次网络失败→第二次成功：重试一次并返回成功结果', async () => {
  const calls = []; const sleeps = []; const retries = [];
  const res = await fetchWithEmptyRetry(async (n) => { calls.push(n); return n === 1 ? failRes('fetch failed') : okRes(20); }, { sleep: async (ms) => sleeps.push(ms), onRetry: (n, r, e) => retries.push([n, r, e]) });
  assert.equal(res.ok, true); assert.equal(res.items.length, 20);
  assert.deepEqual(calls, [1, 2]);
  assert.deepEqual(sleeps, [FETCH_RETRY_DELAY_MS]); // 默认 4000ms，处于批复 3-5s 区间
  assert.deepEqual(retries, [[2, 'fetch_failed', 'fetch failed']]);
});

test('首次 200 空 channel→第二次有条目：空源同样触发重试', async () => {
  const calls = []; const retries = [];
  const res = await fetchWithEmptyRetry(async (n) => { calls.push(n); return n === 1 ? okRes(0) : okRes(19); }, { sleep: async () => {}, onRetry: (n, r, e) => retries.push([n, r, e]) });
  assert.equal(res.ok, true); assert.equal(res.items.length, 19);
  assert.deepEqual(calls, [1, 2]);
  assert.deepEqual(retries, [[2, 'empty_feed', null]]);
});

test('两次皆网络失败：终态 failed、error 保留末次、封顶不超 1 次重试', async () => {
  const calls = [];
  const res = await fetchWithEmptyRetry(async (n) => { calls.push(n); return failRes('attempt' + n); }, { sleep: async () => {} });
  assert.equal(res.ok, false); assert.equal(res.error, 'attempt2');
  assert.deepEqual(calls, [1, 2]); assert.equal(calls.length, FETCH_RETRY_MAX + 1);
});

test('两次皆空源：终态 ok+0 条（维持原语义供 G5 fail），不第三次', async () => {
  const calls = [];
  const res = await fetchWithEmptyRetry(async (n) => { calls.push(n); return okRes(0); }, { sleep: async () => {} });
  assert.equal(res.ok, true); assert.equal(res.items.length, 0);
  assert.deepEqual(calls, [1, 2]);
});

test('maxRetries=0 时退化为无重试（参数通道可用），自定义延迟生效', async () => {
  const calls = []; const sleeps = [];
  const res = await fetchWithEmptyRetry(async (n) => { calls.push(n); return failRes('x'); }, { maxRetries: 0, sleep: async (ms) => sleeps.push(ms) });
  assert.equal(res.ok, false); assert.deepEqual(calls, [1]); assert.equal(sleeps.length, 0);
  const res2 = await fetchWithEmptyRetry(async (n) => (n === 1 ? failRes('x') : okRes(3)), { delayMs: 3000, sleep: async (ms) => sleeps.push(ms) });
  assert.equal(res2.items.length, 3); assert.deepEqual(sleeps, [3000]);
});
