import { describe, expect, it } from 'vitest';
import { AvailabilityCalendar, periodOf, timeLabel } from './availability';
import { PREVIEW_TUTORS, PreviewTutorSource } from './preview-tutor-source';
import {
  filterTutors,
  firstNameOf,
  hourlyLabel,
  NO_FILTERS,
  ratingLabel,
  sessionPrice,
} from './tutors';

// Wednesday 11 November 2026, 12:00 in Kampala (09:00 UTC).
const WED_NOON = new Date('2026-11-11T09:00:00Z');
// Same Wednesday, 21:30 in Kampala.
const WED_LATE = new Date('2026-11-11T18:30:00Z');

describe('time labels', () => {
  it('reads 24-hour times as am/pm and names the part of the day', () => {
    expect(timeLabel('18:00')).toBe('6:00 pm');
    expect(timeLabel('09:30')).toBe('9:30 am');
    expect(timeLabel('12:00')).toBe('12:00 pm');
    expect(timeLabel('00:15')).toBe('12:15 am');
    expect(periodOf('10:00')).toBe('Morning');
    expect(periodOf('14:00')).toBe('Afternoon');
    expect(periodOf('17:00')).toBe('Evening');
  });
});

describe('AvailabilityCalendar', () => {
  const calendar = new AvailabilityCalendar(
    { 3: ['14:00', '10:00', '18:00'], 4: ['15:00'] },
    { 3: ['14:00'] },
  );

  it('lists a day’s times in order, marking booked and past ones', () => {
    expect(calendar.slots('2026-11-11', WED_NOON)).toEqual([
      { time: '10:00', label: '10:00 am', period: 'Morning', free: false }, // already past
      { time: '14:00', label: '2:00 pm', period: 'Afternoon', free: false }, // booked
      { time: '18:00', label: '6:00 pm', period: 'Evening', free: true },
    ]);
    expect(calendar.slots('2026-11-13', WED_NOON)).toEqual([]); // Friday: none offered
  });

  it('builds a week of days from today in Kampala', () => {
    const days = calendar.days(WED_NOON, 7);
    expect(days).toHaveLength(7);
    expect(days[0]).toMatchObject({
      dateKey: '2026-11-11',
      weekdayShort: 'Wed',
      weekdayLong: 'Wednesday',
      dayOfMonth: 11,
      month: 'November',
      isToday: true,
      hasFreeTime: true,
    });
    expect(days[1]).toMatchObject({ weekdayShort: 'Thu', hasFreeTime: true });
    expect(days[2]).toMatchObject({ weekdayShort: 'Fri', hasFreeTime: false });
  });

  it('says when the next free time is', () => {
    expect(calendar.nextFreeLabel(WED_NOON)).toBe('Free today from 6:00 pm');
    expect(calendar.nextFreeLabel(WED_LATE)).toBe('Next free tomorrow, 3:00 pm');
    const weekendOnly = new AvailabilityCalendar({ 6: ['10:00'] });
    expect(weekendOnly.nextFreeLabel(WED_NOON)).toBe('Next free Saturday, 10:00 am');
    expect(new AvailabilityCalendar({}).nextFreeLabel(WED_NOON)).toBe(
      'No free times in the next two weeks',
    );
  });
});

describe('tutor helpers', () => {
  const [brian, atim, kato] = PREVIEW_TUTORS;

  it('names, rates and prices tutors', () => {
    expect(firstNameOf(brian)).toBe('Brian');
    expect(firstNameOf(atim)).toBe('Atim');
    expect(ratingLabel(brian)).toBe('4.9 from 32 sessions');
    expect(ratingLabel({ rating: 5, sessions: 1 })).toBe('5.0 from 1 session');
    expect(hourlyLabel(brian)).toBe('UGX 15,000');
    expect(sessionPrice(15_000, 30)).toBe(7_500);
    expect(sessionPrice(15_000, 120)).toBe(30_000);
    expect(sessionPrice(25_000, 30)).toBe(12_500);
  });

  it('filters by course unit, kind, price and free today', () => {
    const all = PREVIEW_TUTORS;
    const never = () => false;
    expect(filterTutors(all, NO_FILTERS, never)).toHaveLength(3);
    expect(filterTutors(all, { ...NO_FILTERS, unitCode: 'CSC 2104' }, never)).toEqual([atim]);
    expect(filterTutors(all, { ...NO_FILTERS, lecturers: true }, never)).toEqual([atim]);
    expect(
      filterTutors(all, { ...NO_FILTERS, lecturers: true, seniorStudents: true }, never),
    ).toEqual([brian, atim]);
    expect(filterTutors(all, { ...NO_FILTERS, under20k: true }, never)).toEqual([brian]);
    expect(filterTutors(all, { ...NO_FILTERS, freeToday: true }, (t) => t.id === kato.id)).toEqual([
      kato,
    ]);
  });
});

describe('PreviewTutorSource', () => {
  it('finds tutors and accepts requests for them', async () => {
    const source = new PreviewTutorSource(0);
    expect(await source.list()).toHaveLength(3);
    expect((await source.find('kato-joseph'))?.name).toBe('Kato Joseph');
    expect(await source.find('nobody')).toBeNull();
    const request = { unitCode: 'CSC 2100', dateKey: '2026-11-12', time: '15:00', minutes: 60 };
    expect(await source.requestBooking({ ...request, tutorId: 'brian-okello' })).toEqual({
      ok: true,
    });
    expect(await source.requestBooking({ ...request, tutorId: 'nobody' })).toEqual({ ok: false });
  });
});
