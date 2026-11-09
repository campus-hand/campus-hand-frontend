import { Star } from 'lucide-react';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';
import type { TutorAvatarTone } from '../models/tutor';

const avatarTone: Record<TutorAvatarTone, string> = {
  sun: 'bg-sun text-on-sun',
  daily: 'bg-daily-bg text-daily-fg',
  note: 'bg-note-bg text-note-fg',
};

export function TutorsSection() {
  const { tutors } = landingContent;

  return (
    <section
      id="tutors"
      aria-labelledby="tutors-h"
      className="border-edge bg-cobalt text-on-cobalt mt-24 scroll-mt-6 border-y-[2.5px]"
    >
      <div className="wrap grid items-start gap-14 py-[72px] lg:grid-cols-2">
        <div className="flex max-w-[460px] flex-col gap-4">
          <h2 id="tutors-h" className="display h2">
            {tutors.title}
          </h2>
          <p className="text-on-cobalt-mute text-lg">{tutors.lead}</p>
          <Link href={SiteRoutes.tutors} className="btn btn-sun mt-2 self-start">
            {tutors.cta}
          </Link>
        </div>
        <ul className="flex flex-col gap-3">
          {tutors.items.map((tutor) => (
            <li
              key={tutor.name}
              className="panel bg-paper text-ink flex items-center gap-4 px-[18px] py-4"
            >
              <span
                className={`display grid size-14 flex-none place-items-center rounded-full text-[22px] shadow-[inset_0_0_0_2px_var(--edge)] ${avatarTone[tutor.tone]}`}
                aria-hidden="true"
              >
                {tutor.initials}
              </span>
              <span className="min-w-0 flex-1">
                <b className="text-[17px]">{tutor.name}</b>
                <span className="text-mute block text-sm">{tutor.headline}</span>
              </span>
              <span className="text-right">
                <b className="inline-flex items-center gap-1 text-base">
                  <Star className="fill-sun text-edge size-4" aria-hidden="true" />
                  <span className="sr-only">Rated </span>
                  {tutor.ratingLabel}
                </b>
                <span className="text-green-text block text-[13px] font-semibold">
                  {tutor.verification}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
