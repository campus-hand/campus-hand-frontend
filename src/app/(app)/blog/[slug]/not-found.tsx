import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';

/** Shown when a campus post does not exist (or was taken down). */
export default function CampusPostNotFound() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-start gap-5 px-5 pt-16 sm:px-8 lg:pt-24">
      <span className="sticker display text-xl">Not found</span>
      <h1 className="display text-[clamp(40px,6vw,72px)]">We can&apos;t find that post</h1>
      <p className="text-ink-2 text-lg">
        The link may be old, or the post was taken down. Other students&apos; posts are on the
        Campus page.
      </p>
      <Link href={SiteRoutes.blog} className="btn btn-sun">
        Go to Campus
      </Link>
    </div>
  );
}
