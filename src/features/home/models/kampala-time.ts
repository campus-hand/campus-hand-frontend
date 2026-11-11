/** Campus Hand runs on Kampala time (UTC+3, no daylight saving), whatever the server's zone. */
export const KAMPALA_TIME_ZONE = 'Africa/Kampala';

/** The calendar date in Kampala as "YYYY-MM-DD". */
export function kampalaDay(at: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KAMPALA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

/** The hour (0-23) in Kampala. */
export function kampalaHour(at: Date): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: KAMPALA_TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(at);
  return Number(hour);
}

/** Whole calendar days from `from` to `to` in Kampala (0 = same day, negative = past). */
export function kampalaDaysBetween(from: Date, to: Date): number {
  const toUtcMidnight = (day: string) => Date.parse(`${day}T00:00:00Z`);
  return Math.round((toUtcMidnight(kampalaDay(to)) - toUtcMidnight(kampalaDay(from))) / 86_400_000);
}

/** Kampala is UTC+3 all year (no daylight saving). */
const KAMPALA_OFFSET_MS = 3 * 3_600_000;

/** The date in Kampala as "YYYY-MM-DD", the weekday (0 = Sunday) and minutes past midnight. */
export function kampalaNow(at: Date): { dateKey: string; weekday: number; minutes: number } {
  const shifted = new Date(at.getTime() + KAMPALA_OFFSET_MS);
  return {
    dateKey: shifted.toISOString().slice(0, 10),
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

/** "YYYY-MM-DD" plus `days` calendar days. */
export function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Weekday (0 = Sunday) of a "YYYY-MM-DD" date. */
export function weekdayOf(dateKey: string): number {
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

/** "Good morning" before noon, "Good afternoon" until 5 pm, then "Good evening". */
export function greetingFor(at: Date): string {
  const hour = kampalaHour(at);
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
