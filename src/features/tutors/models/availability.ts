import { addDays, kampalaNow, weekdayOf } from '@/features/home/models/kampala-time';

/** Times a tutor offers each weekday (0 = Sunday), as "HH:MM" in Kampala time. */
export type WeeklyTimes = Readonly<Partial<Record<number, readonly string[]>>>;

export interface CalendarDay {
  readonly dateKey: string;
  /** "Mon" */
  readonly weekdayShort: string;
  /** "Monday" */
  readonly weekdayLong: string;
  readonly dayOfMonth: number;
  /** "October" */
  readonly month: string;
  readonly isToday: boolean;
  /** At least one free time that has not passed. */
  readonly hasFreeTime: boolean;
}

export type DayPeriod = 'Morning' | 'Afternoon' | 'Evening';

export interface TimeSlot {
  /** "18:00" */
  readonly time: string;
  /** "6:00 pm" */
  readonly label: string;
  readonly period: DayPeriod;
  /** False when already booked or already past. */
  readonly free: boolean;
}

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** "18:00" -> "6:00 pm", "09:30" -> "9:30 am", "12:00" -> "12:00 pm". */
export function timeLabel(time: string): string {
  const minutes = toMinutes(time);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

export function periodOf(time: string): DayPeriod {
  const minutes = toMinutes(time);
  if (minutes < 12 * 60) return 'Morning';
  if (minutes < 17 * 60) return 'Afternoon';
  return 'Evening';
}

/**
 * When a tutor can meet: the weekly times they offer, minus times already
 * booked, minus times that have passed (all in Kampala time).
 */
export class AvailabilityCalendar {
  constructor(
    private readonly offered: WeeklyTimes,
    /** Times already booked each weekday (shown struck through). */
    private readonly booked: WeeklyTimes = {},
  ) {}

  slots(dateKey: string, now: Date): TimeSlot[] {
    const weekday = weekdayOf(dateKey);
    const today = kampalaNow(now);
    const taken = new Set(this.booked[weekday] ?? []);
    return [...(this.offered[weekday] ?? [])]
      .sort((a, b) => toMinutes(a) - toMinutes(b))
      .map((time) => {
        const past =
          dateKey < today.dateKey ||
          (dateKey === today.dateKey && toMinutes(time) <= today.minutes);
        return {
          time,
          label: timeLabel(time),
          period: periodOf(time),
          free: !taken.has(time) && !past,
        };
      });
  }

  days(now: Date, count = 7): CalendarDay[] {
    const today = kampalaNow(now).dateKey;
    return Array.from({ length: count }, (_, i) => {
      const dateKey = addDays(today, i);
      const date = new Date(`${dateKey}T00:00:00Z`);
      const weekday = date.getUTCDay();
      return {
        dateKey,
        weekdayShort: SHORT[weekday],
        weekdayLong: LONG[weekday],
        dayOfMonth: date.getUTCDate(),
        month: MONTHS[date.getUTCMonth()],
        isToday: i === 0,
        hasFreeTime: this.slots(dateKey, now).some((s) => s.free),
      };
    });
  }

  /** The first free time from now, looking up to `horizonDays` ahead. */
  nextFree(
    now: Date,
    horizonDays = 14,
  ): { dateKey: string; slot: TimeSlot; inDays: number } | null {
    const today = kampalaNow(now).dateKey;
    for (let i = 0; i < horizonDays; i++) {
      const dateKey = addDays(today, i);
      const slot = this.slots(dateKey, now).find((s) => s.free);
      if (slot) return { dateKey, slot, inDays: i };
    }
    return null;
  }

  /** "Free today from 6:00 pm", "Next free tomorrow, 2:00 pm", "Next free Saturday, 10:00 am". */
  nextFreeLabel(now: Date): string {
    const next = this.nextFree(now);
    if (!next) return 'No free times in the next two weeks';
    if (next.inDays === 0) return `Free today from ${next.slot.label}`;
    if (next.inDays === 1) return `Next free tomorrow, ${next.slot.label}`;
    return `Next free ${LONG[weekdayOf(next.dateKey)]}, ${next.slot.label}`;
  }
}
