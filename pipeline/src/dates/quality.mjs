/* Q3 数据质量辅助（P-3a，后端 2026-10-26）。纯函数、零依赖，供 news-pipeline 与修复/测试脚本复用。
 * 背景：infoq-cn feed 将 UTC+8 墙钟错标为 GMT（实抓证据见 shared/backend-q3-timezone-fix-plan-20261026.md）。
 * 解析器本身按标注解析是正确行为；补偿与护栏在数据质量层处理。 */

/** 源级时区错标补偿：feed 把墙钟多加了 hours 小时（如 UTC+8 标成 GMT → hours=8），解析值回拨 hours。 */
export function applyTzMislabel(d, hours) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return d;
  const h = Number(hours) || 0;
  return h === 0 ? d : new Date(d.getTime() - h * 3600_000);
}

/** 通用护栏：任何源若仍产出晚于运行时刻（NOW）的发布时间，钳制为 NOW 并标记降级。 */
export function clampFutureDate(published, now) {
  if (published instanceof Date && published > now) return { date: now, clamped: true };
  return { date: published, clamped: false };
}

/** F3 落盘断言（容差 0min，站主批复口径）：真实发布不可能晚于抓取，返回违例条目列表。 */
export function findDateViolations(items) {
  return (items ?? []).filter((i) => Date.parse(i.published_at) > Date.parse(i.fetched_at));
}
