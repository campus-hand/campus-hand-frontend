import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';

/** Shown for a file or quiz that does not exist (or is not ready yet). */
export default function FocusNotFound() {
  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-[720px] flex-col items-start justify-center gap-5 px-5">
      <span className="sticker display text-xl">Not found</span>
      <h1 className="display text-[clamp(40px,6vw,72px)]">We can&apos;t find that</h1>
      <p className="text-ink-2 text-lg">
        The file or quiz may have moved, or isn&apos;t ready yet. Your course units have everything
        that is on Campus Hand so far.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href={SiteRoutes.courseUnits} className="btn btn-sun">
          See your course units
        </Link>
        <Link href={SiteRoutes.appHome} className="btn btn-line">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
