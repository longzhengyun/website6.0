// news-pipeline 抓取层微加固助手（纯函数，注入 attempt/sleep 以便单测）
// 依据：后端排查结论 seq=521 + 项目开工令 seq=526（选项 2）——
//   fetch 抛错 或 HTTP 200 但解析 0 条（静默空源）时，延迟后重试 1 次，两异常同码处理。
//   实测背景：juejin 瞬态空源率约 3/8（近 8 个数据批 items_fetched=0 出现 3 次），
//   hn-frontpage 近 8 批网络层 fetch failed 2 次；重试后理论空/败率收敛为原率平方
//   （juejin≈9/64≈14%，hn≈4/64≈6%）。
// 边界（开工令锁定）：重试后仍 0 条/仍失败 => 维持原语义（status=ok+0 或 failed），G5 fail 口径不动；
//   重试封顶 1 次、固定延迟取批复 3-5s 中值 4s、零新依赖。
export const FETCH_RETRY_DELAY_MS = 4000;
export const FETCH_RETRY_MAX = 1;

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {(attemptNo: number) => Promise<{ok: boolean, items: any[], error: string|null}>} attempt 单次抓取；ok=false 表示网络/HTTP 失败
 * @param {{delayMs?: number, sleep?: (ms:number)=>Promise<void>, maxRetries?: number, onRetry?: (nextAttemptNo:number, reason:'fetch_failed'|'empty_feed', lastError:string|null)=>void}} [opts]
 */
export async function fetchWithEmptyRetry(attempt, opts = {}) {
  const {
    delayMs = FETCH_RETRY_DELAY_MS,
    sleep = defaultSleep,
    maxRetries = FETCH_RETRY_MAX,
    onRetry = () => {},
  } = opts;
  let res = await attempt(1);
  for (let next = 2; next <= maxRetries + 1; next++) {
    const hasItems = res.ok && Array.isArray(res.items) && res.items.length > 0;
    if (hasItems) break;
    onRetry(next, res.ok ? 'empty_feed' : 'fetch_failed', res.ok ? null : res.error);
    await sleep(delayMs);
    res = await attempt(next);
  }
  return res;
}
