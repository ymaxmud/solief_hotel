// Solief Hotel operates in Tashkent, Uzbekistan, which is a fixed UTC+5 offset
// year-round (Uzbekistan does not observe daylight saving time). Centralizing
// the offset here keeps admin "today"/date filters and displayed timestamps
// aligned with what hotel staff mean by local time.
export const TASHKENT_TZ = "Asia/Tashkent";
export const TASHKENT_UTC_OFFSET = "+05:00";

/** Current calendar date in Tashkent as YYYY-MM-DD. */
export function tashkentToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TASHKENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

/** Start-of-day (00:00:00 Tashkent) for a YYYY-MM-DD date, as an offset ISO string. */
export function tashkentDayStart(dateStr: string): string {
  return `${dateStr}T00:00:00.000${TASHKENT_UTC_OFFSET}`;
}

/** End-of-day (23:59:59.999 Tashkent) for a YYYY-MM-DD date, as an offset ISO string. */
export function tashkentDayEnd(dateStr: string): string {
  return `${dateStr}T23:59:59.999${TASHKENT_UTC_OFFSET}`;
}

/**
 * Convert a naive `datetime-local` value ("2026-07-03T14:30") — which the browser
 * emits with no timezone — into a proper UTC ISO string, interpreting the input
 * as Tashkent local time. Returns null if the value is not a valid datetime-local.
 */
export function localInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return null;
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const parsed = new Date(`${withSeconds}${TASHKENT_UTC_OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Format a timestamp for display in Tashkent local time. */
export function formatTashkent(
  value: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }
): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TASHKENT_TZ, ...opts }).format(date);
}
