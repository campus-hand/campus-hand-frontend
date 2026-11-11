import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';

/** Shown when a course unit id does not exist (or its university is not live yet). */
export default function CourseUnitNotFound() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-start gap-5 px-5 pt-16 sm:px-8 lg:pt-24">
      <span className="sticker display text-xl">Not found</span>
      <h1 className="display text-[clamp(40px,6vw,72px)]">We can&apos;t find that course unit</h1>
      <p className="text-ink-2 text-lg">
        The link may be old, or the course unit isn&apos;t on Campus Hand yet. Your course units for
        this semester are on the Courses page.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href={SiteRoutes.courseUnits} className="btn btn-sun">
          See your course units
        </Link>
        <Link href={SiteRoutes.upload} className="btn btn-line">
          Ask us to add it
        </Link>
      </div>
    </div>
  );
}
