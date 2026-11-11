'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Avatar } from '@/components/app/bits';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { AvailabilityCalendar } from '../models/availability';
import {
  filterTutors,
  firstNameOf,
  hourlyLabel,
  NO_FILTERS,
  type TutorFilters,
  type TutorProfile,
} from '../models/tutors';
import { BookingPanel } from './booking-panel';
import { CheckBadge, RatingBadge } from './tutor-bits';

type ToggleKey = Exclude<keyof TutorFilters, 'unitCode'>;

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: 'freeToday', label: 'Free today' },
  { key: 'seniorStudents', label: 'Senior students' },
  { key: 'lecturers', label: 'Lecturers' },
  { key: 'under20k', label: 'Under UGX 20,000' },
];

/** Tutors: filters, tutor cards, and (on desktop) a booking panel for the chosen tutor. */
export function TutorsScreen({
  tutors,
  units,
  initialUnitCode,
  nowMs,
}: {
  tutors: readonly TutorProfile[];
  units: readonly { code: string; title: string }[];
  initialUnitCode: string;
  nowMs: number;
}) {
  const now = useMemo(() => new Date(nowMs), [nowMs]);
  const [filters, setFilters] = useState<TutorFilters>({
    ...NO_FILTERS,
    unitCode: initialUnitCode,
  });
  const calendars = useMemo(
    () => new Map(tutors.map((t) => [t.id, new AvailabilityCalendar(t.offered, t.booked)])),
    [tutors],
  );
  const shown = filterTutors(tutors, filters, (t) => calendars.get(t.id)?.nextFree(now, 1) != null);
  const [selectedId, setSelectedId] = useState<string | null>(shown[0]?.id ?? null);
  const selected = shown.find((t) => t.id === selectedId) ?? shown[0];
  const unitTitle = units.find((u) => u.code === filters.unitCode)?.title;

  return (
    <div className="wide:grid-cols-[1fr_480px] mx-auto grid max-w-[1400px] gap-10 px-5 pt-6 sm:px-8 lg:px-10 lg:pt-10">
      <div className="flex min-w-0 flex-col gap-6">
        <header>
          <h1 className="display text-[clamp(52px,7vw,84px)]">Tutors</h1>
          <p className="text-ink-2 mt-1 text-[17px]">
            Verified people who passed or teach your course units. Sessions are by video.
          </p>
        </header>

        <div className="-mx-5 flex snap-x scroll-px-5 items-center gap-2.5 overflow-x-auto px-5 pt-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <label className="relative flex-none">
            <span className="sr-only">Course unit</span>
            <select
              value={filters.unitCode}
              onChange={(e) => setFilters((f) => ({ ...f, unitCode: e.target.value }))}
              className="bg-inverse text-on-inverse min-h-12 appearance-none rounded-full py-2 pr-11 pl-5 text-[16px] font-bold"
            >
              <option value="">All my course units</option>
              {units.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.code} {u.title}
                </option>
              ))}
            </select>
            <ChevronDown
              className="text-on-inverse pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2"
              aria-hidden="true"
            />
          </label>
          {TOGGLES.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={filters[t.key]}
              onClick={() => setFilters((f) => ({ ...f, [t.key]: !f[t.key] }))}
              className={cn(
                'chip min-h-12 flex-none px-5 text-[16px] font-bold',
                filters[t.key] && 'bg-cobalt text-on-cobalt shadow-none',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-ink-2 text-[16px]" role="status">
          {shown.length} tutor{shown.length === 1 ? '' : 's'}{' '}
          {unitTitle ? `for ${unitTitle}` : 'for your course units'}
        </p>

        {shown.length === 0 ? (
          <div className="panel flex flex-col gap-2 p-6">
            <p className="text-[17px] font-bold">No tutors match yet</p>
            <p className="text-ink-2 text-[15.5px]">
              Try fewer filters, or another course unit. New tutors join every week.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {shown.map((tutor) => {
              const label = calendars.get(tutor.id)?.nextFreeLabel(now) ?? '';
              const isSelected = selected?.id === tutor.id;
              return (
                <li key={tutor.id}>
                  <article
                    aria-labelledby={`tutor-${tutor.id}`}
                    className={cn(
                      'panel flex flex-col gap-4 p-5 sm:p-6',
                      isSelected &&
                        'wide:shadow-[inset_0_0_0_3px_var(--cobalt),3px_3px_0_var(--drop)]',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar
                        initials={tutor.initials}
                        tone={tutor.tone}
                        className="size-16 text-[26px] sm:size-20 sm:text-[30px]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h2 id={`tutor-${tutor.id}`} className="text-[21px] font-bold">
                            <Link href={SiteRoutes.tutor(tutor.id)} className="hover:underline">
                              {tutor.name}
                            </Link>
                          </h2>
                          <p className="hidden text-[16px] sm:block">
                            <strong className="text-[19px]">{hourlyLabel(tutor)}</strong> an hour
                          </p>
                        </div>
                        <p className="text-ink-2 text-[16px]">{tutor.roleLine}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <CheckBadge check={tutor.check} />
                          <RatingBadge tutor={tutor} />
                        </div>
                        {isSelected ? (
                          <p className="text-ink-2 wide:block mt-3 hidden text-[16px] leading-relaxed">
                            {tutor.bio}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="border-rule flex items-center justify-between gap-4 border-t pt-4">
                      <div>
                        <p className="text-[16px] sm:hidden">
                          <strong className="text-[19px]">{hourlyLabel(tutor)}</strong> an hour
                        </p>
                        <p
                          className={cn(
                            'text-[15.5px]',
                            label.startsWith('Free today') ? 'text-link font-bold' : 'text-ink-2',
                          )}
                        >
                          {label}
                        </p>
                      </div>
                      {/* Phone and tablet: open the profile. Desktop: show the booking panel. */}
                      <Link
                        href={SiteRoutes.tutor(tutor.id)}
                        aria-label={`Request a session with ${tutor.name}`}
                        className={cn('btn wide:hidden', isSelected ? 'btn-cobalt' : 'btn-line')}
                      >
                        Request
                      </Link>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? 'Requesting' : 'Request'} a session with ${tutor.name}`}
                        onClick={() => setSelectedId(tutor.id)}
                        className={cn(
                          'btn wide:inline-flex hidden',
                          isSelected ? 'btn-cobalt' : 'btn-line',
                        )}
                      >
                        {isSelected ? 'Requesting' : 'Request'}
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        <aside
          aria-labelledby="apply-h"
          className="bg-paper-tag-bg text-paper-tag-fg flex flex-wrap items-center justify-between gap-4 rounded-[22px] p-5"
        >
          <p id="apply-h" className="text-[16.5px]">
            <strong>Got an A in a course unit?</strong> Earn by tutoring it.
          </p>
          <Link href={SiteRoutes.becomeTutor} className="btn btn-ink">
            Apply to tutor
          </Link>
        </aside>
      </div>

      {selected ? (
        <aside aria-labelledby="book-h" className="wide:block hidden">
          <div className="panel sticky top-6 p-7">
            <div className="mb-6 flex items-center gap-4">
              <Avatar
                initials={selected.initials}
                tone={selected.tone}
                className="size-16 text-[24px]"
              />
              <div>
                <h2 id="book-h" className="display text-[38px]">
                  Request {firstNameOf(selected)}
                </h2>
                <p className="text-ink-2 text-[16px]">
                  {filters.unitCode || 'Your course unit'}, by video
                </p>
              </div>
            </div>
            <BookingPanel
              key={selected.id}
              tutor={selected}
              unitCode={filters.unitCode}
              nowMs={nowMs}
              layout="panel"
            />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
