import { PencilLine } from 'lucide-react';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  CAMPUS_CATEGORIES,
  type CampusCategory,
  type CampusPost,
  postsIn,
} from '../models/campus-post';
import { FeaturedPost, PostCard } from './post-cards';

/** The campus blog: topic chips, the newest post featured, then the rest. */
export function CampusScreen({
  posts,
  category,
}: {
  posts: readonly CampusPost[];
  category: CampusCategory | null;
}) {
  const [featured, ...rest] = postsIn(posts, category);
  const chips: { label: string; href: string; on: boolean }[] = [
    { label: 'All', href: SiteRoutes.blog, on: category === null },
    ...CAMPUS_CATEGORIES.map((c) => ({
      label: c,
      href: SiteRoutes.blogTopic(c),
      on: category === c,
    })),
  ];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 pt-6 sm:px-8 lg:px-10 lg:pt-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(52px,7vw,84px)]">Campus</h1>
          <p className="text-ink-2 mt-1 text-[17px]">
            <span className="hidden md:inline">
              Fees, hostels, food and the offices you will need.{' '}
            </span>
            Written by students, checked by moderators.
          </p>
        </div>
        <Link
          href={SiteRoutes.writePost}
          className="btn btn-line md:bg-cobalt md:text-on-cobalt flex-none"
        >
          <PencilLine className="size-5" aria-hidden="true" />
          <span>
            Write<span className="hidden md:inline"> a post</span>
          </span>
        </Link>
      </header>

      <nav aria-label="Topics" className="-mx-5 overflow-x-auto px-5 pt-1 pb-2 sm:mx-0 sm:px-0">
        <ul className="flex gap-2.5 sm:flex-wrap">
          {chips.map((chip) => (
            <li key={chip.label} className="flex-none">
              <Link
                href={chip.href}
                aria-current={chip.on ? 'page' : undefined}
                className={cn(
                  'chip min-h-11 px-5 text-[16px] font-bold',
                  chip.on && 'bg-inverse text-on-inverse shadow-none',
                )}
              >
                {chip.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {featured ? (
        <>
          <FeaturedPost post={featured} />
          {rest.length > 0 ? (
            <section aria-label="More posts">
              <div className="divide-rule grid divide-y-2 md:grid-cols-2 md:gap-5 md:divide-y-0 lg:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <div className="panel flex flex-col items-start gap-3 p-6">
          <h2 className="text-[20px] font-bold">No {category} posts yet</h2>
          <p className="text-ink-2 text-[16px]">
            Know how something works on campus? Write it up and help the next student.
          </p>
          <Link href={SiteRoutes.writePost} className="btn btn-sun">
            Write a post
          </Link>
        </div>
      )}
    </div>
  );
}
