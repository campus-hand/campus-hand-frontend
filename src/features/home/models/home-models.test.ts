import { describe, expect, it } from 'vitest';
import { greetingFor, kampalaDay, kampalaDaysBetween, kampalaHour } from './kampala-time';
import { PreviewStudySource } from './preview-study-source';
import { ExamCountdown, StudyPlan } from './study';

describe('Kampala time', () => {
  it('reads the date and hour in Kampala (UTC+3), not the server zone', () => {
    const lateUtc = new Date('2026-11-10T22:30:00Z'); // 01:30 on 11 Nov in Kampala
    expect(kampalaDay(lateUtc)).toBe('2026-11-11');
    expect(kampalaHour(lateUtc)).toBe(1);
  });

  it('counts calendar days, not 24-hour blocks', () => {
    const tonight = new Date('2026-11-11T19:00:00Z'); // 22:00 in Kampala
    const tomorrowMorning = new Date('2026-11-12T04:00:00Z'); // 07:00 next day
    expect(kampalaDaysBetween(tonight, tomorrowMorning)).toBe(1);
    expect(kampalaDaysBetween(tomorrowMorning, tonight)).toBe(-1);
  });

  it('greets by the time of day in Kampala', () => {
    expect(greetingFor(new Date('2026-11-11T05:00:00Z'))).toBe('Good morning'); // 08:00
    expect(greetingFor(new Date('2026-11-11T10:00:00Z'))).toBe('Good afternoon'); // 13:00
    expect(greetingFor(new Date('2026-11-11T15:00:00Z'))).toBe('Good evening'); // 18:00
  });
});

describe('ExamCountdown', () => {
  const now = new Date('2026-11-11T09:00:00Z');
  const exam = (days: number, revised = 3, total = 7) =>
    new ExamCountdown(
      'CSC 2100',
      new Date(now.getTime() + days * 86_400_000),
      revised,
      total,
      null,
    );

  it('labels the days left', () => {
    expect(exam(12).daysLeftLabel(now)).toBe('12 days');
    expect(exam(1).daysLeftLabel(now)).toBe('1 day');
    expect(exam(0).daysLeftLabel(now)).toBe('Today');
    expect(exam(-3).daysLeft(now)).toBe(0);
  });

  it('knows the share revised and whether revision is on track', () => {
    expect(exam(12).revisedShare).toBeCloseTo(3 / 7);
    expect(exam(12, 3, 7).isOnTrack(now)).toBe(true);
    expect(exam(2, 1, 7).isOnTrack(now)).toBe(false);
    expect(exam(12, 0, 0).revisedShare).toBe(0);
  });
});

describe('StudyPlan', () => {
  const plan = new StudyPlan([
    { id: 'a', title: 'Big-O recap', when: 'Mon', done: true },
    { id: 'b', title: 'Trees', when: 'Tonight', done: false },
    { id: 'c', title: 'Past paper', when: 'Sun', done: false },
  ]);

  it('counts done tasks and finds the next one', () => {
    expect(plan.doneCount).toBe(1);
    expect(plan.next?.id).toBe('b');
  });

  it('ticks a task without changing the original plan', () => {
    const ticked = plan.toggle('b');
    expect(ticked.doneCount).toBe(2);
    expect(ticked.next?.id).toBe('c');
    expect(plan.doneCount).toBe(1);
  });
});

describe('PreviewStudySource', () => {
  it('puts the sample exam 12 days from now and fills every section', async () => {
    const now = new Date('2026-11-11T09:00:00Z');
    const overview = await new PreviewStudySource().overview(now);
    expect(overview.exam?.daysLeft(now)).toBe(12);
    expect(overview.plan.tasks).toHaveLength(5);
    expect(overview.resume.length).toBeGreaterThan(0);
    expect(overview.shelf.total).toBeGreaterThanOrEqual(overview.shelf.items.length);
    expect(overview.newByCourseUnit['CSC 2100']).toBe(3);
    expect(overview.feed.length).toBeGreaterThan(0);
  });
});
