import { ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TutorCheck, TutorProfile } from '../models/tutors';
import { ratingLabel } from '../models/tutors';

const CHECK_TONE: Record<TutorCheck['tone'], string> = {
  note: 'bg-note-bg text-note-fg',
  daily: 'bg-daily-bg text-daily-fg',
  plain: 'bg-sunken text-ink-2',
};

/** "A in CSC 2100, checked" with a shield icon. */
export function CheckBadge({ check }: { check: TutorCheck }) {
  return (
    <span className={cn('tag h-auto min-h-8 gap-1.5 px-2.5 text-[14.5px]', CHECK_TONE[check.tone])}>
      <ShieldCheck className="size-4" aria-hidden="true" />
      {check.label}
    </span>
  );
}

/** "★ 4.9 from 32 sessions" */
export function RatingBadge({ tutor }: { tutor: Pick<TutorProfile, 'rating' | 'sessions'> }) {
  return (
    <span className="tag bg-paper-tag-bg text-ink h-auto min-h-8 gap-1.5 px-2.5 text-[14.5px]">
      <Star className="fill-sun text-paper-tag-fg size-4" aria-hidden="true" />
      {ratingLabel(tutor)}
    </span>
  );
}
