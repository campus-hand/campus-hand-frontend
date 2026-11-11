'use client';

import { CircleCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatUgx } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AvailabilityCalendar, type DayPeriod } from '../models/availability';
import { PreviewTutorSource } from '../models/preview-tutor-source';
import {
  firstNameOf,
  SESSION_LENGTHS,
  sessionPrice,
  type TutorProfile,
  type TutorSource,
} from '../models/tutors';

const PERIODS: DayPeriod[] = ['Morning', 'Afternoon', 'Evening'];

/** Tutoring payments don't go through Campus Hand at launch (payments research, 31 Oct). */
function PayNote({ first, className }: { first: string; className?: string }) {
  return (
    <p className={cn('text-ink-2 text-[14.5px]', className)}>
      {first} accepts or declines the request. You pay {first} directly; Campus Hand doesn&apos;t
      take payment for sessions.
    </p>
  );
}

const segment =
  'min-h-12 flex-1 rounded-[13px] px-3 text-[16px] font-semibold text-ink-2 aria-checked:bg-surface aria-checked:text-ink aria-checked:shadow-[0_1px_3px_rgb(20_32_31/0.18)]';

/**
 * Pick a length, a day and a time, then send a booking request. The tutor
 * accepts or declines; the student pays the tutor directly (Campus Hand does
 * not take payment for sessions at launch).
 */
export function BookingPanel({
  tutor,
  unitCode,
  nowMs,
  layout,
  source,
}: {
  tutor: TutorProfile;
  /** The course unit the session is for ("" when not chosen). */
  unitCode: string;
  /** The time "now" on the server, so the page and the browser agree. */
  nowMs: number;
  /** "panel": side panel on desktop; "page": full-screen profile with a bottom bar. */
  layout: 'panel' | 'page';
  source?: TutorSource;
}) {
  const now = useMemo(() => new Date(nowMs), [nowMs]);
  const calendar = useMemo(() => new AvailabilityCalendar(tutor.offered, tutor.booked), [tutor]);
  const days = useMemo(() => calendar.days(now, 7), [calendar, now]);
  const firstFree = calendar.nextFree(now, 7);
  const [minutes, setMinutes] = useState<number>(60);
  const [dateKey, setDateKey] = useState(firstFree?.dateKey ?? days[0].dateKey);
  const [time, setTime] = useState<string | null>(null);
  const [state, setState] = useState<'choosing' | 'sending' | 'sent' | 'failed'>('choosing');
  const [tutorSource] = useState<TutorSource>(() => source ?? new PreviewTutorSource());

  const day = days.find((d) => d.dateKey === dateKey) ?? days[0];
  const slots = calendar.slots(dateKey, now);
  const chosen = slots.find((s) => s.time === time && s.free);
  const price = sessionPrice(tutor.hourlyRate, minutes);
  const lengthLabel = SESSION_LENGTHS.find((l) => l.minutes === minutes)?.label ?? '';
  const first = firstNameOf(tutor);
  const summary = chosen
    ? `${day.weekdayShort} ${day.dayOfMonth} ${day.month.slice(0, 3)}, ${chosen.label}`
    : 'Pick a time';

  async function send() {
    if (!chosen) return;
    setState('sending');
    const result = await tutorSource.requestBooking({
      tutorId: tutor.id,
      unitCode,
      dateKey,
      time: chosen.time,
      minutes,
    });
    setState(result.ok ? 'sent' : 'failed');
  }

  if (state === 'sent') {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-2">
        <CircleCheck className="text-green-text size-12" aria-hidden="true" />
        <h3 className="display text-[36px]">Request sent</h3>
        <p className="text-[17px]">
          {first} will accept or decline <strong>{summary}</strong> ({lengthLabel}). We&apos;ll let
          you know.
        </p>
        <p className="text-ink-2 text-[15.5px]">
          You pay {first} directly. Campus Hand doesn&apos;t take payment for sessions.
        </p>
        <button type="button" className="btn btn-line" onClick={() => setState('choosing')}>
          Request another time
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', layout === 'page' && 'pb-36')}>
      <section aria-labelledby={`len-${tutor.id}`}>
        <h3 id={`len-${tutor.id}`} className="mb-3 text-[17px] font-bold">
          Session length
        </h3>
        <div
          role="radiogroup"
          aria-labelledby={`len-${tutor.id}`}
          className="bg-sunken flex gap-1 rounded-[17px] p-1.5"
        >
          {SESSION_LENGTHS.map((l) => (
            <button
              key={l.minutes}
              type="button"
              role="radio"
              aria-checked={minutes === l.minutes}
              onClick={() => setMinutes(l.minutes)}
              className={segment}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby={`day-${tutor.id}`}>
        <h3 id={`day-${tutor.id}`} className="mb-3 text-[17px] font-bold">
          Day
        </h3>
        <div
          role="radiogroup"
          aria-labelledby={`day-${tutor.id}`}
          className="-mx-1 flex snap-x scroll-px-1 gap-2.5 overflow-x-auto px-1 pt-1 pb-2"
        >
          {days.map((d) => {
            const selected = d.dateKey === dateKey;
            return (
              <button
                key={d.dateKey}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${d.weekdayLong} ${d.dayOfMonth} ${d.month}${d.hasFreeTime ? '' : ', no free times'}`}
                disabled={!d.hasFreeTime}
                onClick={() => {
                  setDateKey(d.dateKey);
                  setTime(null);
                }}
                className={cn(
                  'flex h-[84px] w-[72px] flex-none snap-start flex-col items-center justify-center rounded-[16px] shadow-[inset_0_0_0_2px_var(--edge)]',
                  selected ? 'bg-inverse text-on-inverse' : 'bg-surface',
                  !d.hasFreeTime && 'text-mute opacity-55 shadow-[inset_0_0_0_2px_var(--rule)]',
                )}
              >
                <span className="text-[14px] font-semibold">{d.weekdayShort}</span>
                <span className="display text-[30px]">{d.dayOfMonth}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby={`time-${tutor.id}`}>
        <h3 id={`time-${tutor.id}`} className="mb-3 text-[17px] font-bold">
          Time on {day.weekdayLong} {day.dayOfMonth} {day.month}
        </h3>
        {slots.length === 0 ? (
          <p className="text-ink-2 text-[15.5px]">{first} has no times on this day.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {PERIODS.map((period) => {
              const inPeriod = slots.filter((s) => s.period === period);
              if (inPeriod.length === 0) return null;
              return (
                <div key={period} role="radiogroup" aria-label={period}>
                  <p className="text-ink-2 mb-2 text-[15px] font-semibold">{period}</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {inPeriod.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        role="radio"
                        aria-checked={time === s.time}
                        aria-label={`${s.label}${s.free ? '' : ', taken'}`}
                        disabled={!s.free}
                        onClick={() => setTime(s.time)}
                        className={cn(
                          'min-h-14 rounded-[16px] text-[17px] font-bold shadow-[inset_0_0_0_2px_var(--edge)]',
                          time === s.time ? 'bg-cobalt text-on-cobalt shadow-none' : 'bg-surface',
                          !s.free &&
                            'text-mute line-through opacity-60 shadow-[inset_0_0_0_2px_var(--rule)]',
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {layout === 'page' ? <PayNote first={first} /> : null}

      {/* Summary: in the panel on desktop, a bottom bar on the phone profile */}
      <div
        className={cn(
          layout === 'page'
            ? 'border-rule bg-paper fixed inset-x-0 bottom-0 z-30 border-t-2 px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]'
            : 'border-rule border-t pt-5',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[760px] gap-4',
            layout === 'page' ? 'items-center justify-between' : 'flex-col',
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-[17px] font-bold" aria-live="polite">
                {summary}
              </p>
              <p className="text-ink-2 text-[15px]">
                {lengthLabel} by video, {formatUgx(price)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={cn('btn btn-sun', layout === 'panel' && 'w-full')}
            disabled={!chosen || state === 'sending'}
            aria-busy={state === 'sending' || undefined}
            onClick={() => void send()}
          >
            {state === 'sending' ? 'Sending…' : 'Send request'}
          </button>
        </div>
        {layout === 'panel' ? <PayNote first={first} className="mt-3 text-center" /> : null}
        {state === 'failed' ? (
          <p className="notice notice-error mt-3" role="alert">
            The request didn&apos;t go through. Check your connection and try again.
          </p>
        ) : null}
      </div>
    </div>
  );
}
