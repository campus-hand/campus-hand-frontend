import { PencilLine } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Write a post' };

/** TODO(content): the post editor comes with the blog API; until then, explain what is coming. */
export default function WritePostPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-start gap-5 px-5 pt-16 sm:px-8 lg:pt-24">
      <span className="sticker display text-xl">
        <PencilLine className="size-5" aria-hidden="true" />
        Coming soon
      </span>
      <h1 className="display text-[clamp(40px,6vw,72px)]">Write a post</h1>
      <p className="text-ink-2 text-lg">
        Soon you can write about fees, hostels, food, courses and campus life. A moderator checks
        every post before other students see it.
      </p>
      <Link href={SiteRoutes.blog} className="btn btn-sun">
        Back to Campus
      </Link>
    </div>
  );
}
