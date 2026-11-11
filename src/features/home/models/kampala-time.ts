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

/** "Good morning" before noon, "Good afternoon" until 5 pm, then "Good evening". */
export function greetingFor(at: Date): string {
  const hour = kampalaHour(at);
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
