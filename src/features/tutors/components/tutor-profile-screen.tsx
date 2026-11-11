import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/app/bits';
import { SiteRoutes } from '@/lib/routes';
import { ratingLabel, type TutorProfile } from '../models/tutors';
import { BookingPanel } from './booking-panel';
import { CheckBadge } from './tutor-bits';

/** A tutor's profile with the booking calendar (full screen on phones). */
export function TutorProfileScreen({
  tutor,
  unitCode,
  nowMs,
}: {
  tutor: TutorProfile;
  unitCode: string;
  nowMs: number;
}) {
  return (
    <div className="mx-auto max-w-[760px] px-5 pt-4">
      <Link
        href={
          unitCode ? `${SiteRoutes.tutors}?code=${encodeURIComponent(unitCode)}` : SiteRoutes.tutors
        }
        aria-label="Back to tutors"
        className="hover:bg-sunken -ml-2 flex size-11 items-center justify-center rounded-full"
      >
        <ArrowLeft className="size-6" aria-hidden="true" />
      </Link>

      <header className="mt-4 flex items-center gap-5">
        <Avatar
          initials={tutor.initials}
          tone={tutor.tone}
          className="size-24 text-[40px] sm:size-28"
        />
        <div className="min-w-0">
          <h1 className="display text-[clamp(40px,10vw,60px)]">{tutor.name}</h1>
          <p className="text-ink-2 text-[17px]">{tutor.roleLine}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[17px] font-bold">
            <Star className="fill-sun text-paper-tag-fg size-5" aria-hidden="true" />
            {ratingLabel(tutor)}
          </p>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        <CheckBadge check={tutor.profileCheck} />
        {tutor.grades.map((g) => (
          <span key={g} className="tag bg-sunken text-ink h-auto min-h-8 px-2.5 text-[14.5px]">
            {g}
          </span>
        ))}
      </div>
      <p className="text-ink-2 mt-5 text-[17px] leading-relaxed">{tutor.bio}</p>

      <section aria-label={`Request a session with ${tutor.name}`} className="mt-8">
        <BookingPanel tutor={tutor} unitCode={unitCode} nowMs={nowMs} layout="page" />
      </section>
    </div>
  );
}
