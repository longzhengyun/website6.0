/**
 * D-4 重定义（站主 seq=841）渲染层时区转换：数据管线 UTC 入库不动，显示 +08:00（北京时间）。
 * 纯偏移换算（先加 8h 再取 UTC 分量），与运行环境 TZ 无关，CI/本机/Actions 结果一致。
 * 判据口径：测试 P2 改写单 §四「新闻条目中文 + 日期北京时间可量测」。
 */

const BJ_OFFSET_MS = 8 * 60 * 60 * 1000;

const pad = (n: number): string => String(n).padStart(2, '0');

/** ISO（UTC）→ 北京时间分量；解析失败返回 null，调用方回退原字面 */
function bjParts(iso: string): { y: number; mo: number; d: number; h: number; mi: number } | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const d = new Date(t + BJ_OFFSET_MS);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
}

/** 'YYYY-MM-DD'（北京时间） */
export function beijingDate(iso: string): string {
  const p = bjParts(iso);
  return p ? `${p.y}-${pad(p.mo)}-${pad(p.d)}` : iso.slice(0, 10);
}

/** 'MM-DD'（北京时间，首页紧凑位） */
export function beijingMonthDay(iso: string): string {
  const p = bjParts(iso);
  return p ? `${pad(p.mo)}-${pad(p.d)}` : iso.slice(5, 10);
}

/** 'YYYY-MM-DD HH:mm'（北京时间） */
export function beijingDateTime(iso: string): string {
  const p = bjParts(iso);
  return p ? `${p.y}-${pad(p.mo)}-${pad(p.d)} ${pad(p.h)}:${pad(p.mi)}` : iso.slice(0, 16).replace('T', ' ');
}
