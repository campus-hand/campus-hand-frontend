import { Check } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/app/bits';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { CampusPost } from '../models/campus-post';
import { CATEGORY_STYLE } from './category-style';

/** "Checked against the official fees guide" (short "Checked" on phones). */
export function CheckedBadge({ against, full = false }: { against: string; full?: boolean }) {
  return (
    <span className="tag tag-note h-auto min-h-7 gap-1.5 px-2.5 text-[13.5px]">
      <Check className="size-3.5 flex-none" aria-hidden="true" />
      {full ? (
        `Checked against ${against}`
      ) : (
        <>
          <span className="md:hidden">Checked</span>
          <span className="hidden md:inline">Checked against {against}</span>
        </>
      )}
    </span>
  );
}

/** The big blue card for the newest post. */
export function FeaturedPost({ post }: { post: CampusPost }) {
  return (
    <article className="panel relative grid overflow-hidden has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] md:grid-cols-[1.45fr_1fr]">
      <div className="bg-cobalt text-on-cobalt flex min-h-[230px] flex-col justify-between gap-8 p-6 md:min-h-[300px] md:p-8">
        <span className="tag bg-sun text-on-sun self-start">{post.category}</span>
        <h2 className="display text-[clamp(40px,5.4vw,64px)] leading-[0.95]">
          <Link
            href={SiteRoutes.blogPost(post.slug)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h2>
      </div>
      <div className="flex flex-col justify-center gap-4 p-5 md:p-8">
        <p className="text-ink-2 hidden text-[16.5px] leading-relaxed md:block">{post.summary}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-start">
          <div className="flex items-center gap-3">
            <Avatar initials={post.initials} tone={CATEGORY_STYLE[post.category].avatar} />
            <div>
              <p className="text-[16px] font-bold">{post.author.name}</p>
              <p className="text-ink-2 text-[14.5px]">{post.authorDetail}</p>
            </div>
          </div>
          {post.checkedAgainst ? <CheckedBadge against={post.checkedAgainst} /> : null}
        </div>
      </div>
    </article>
  );
}

/** A post: a row with an icon tile on phones, a card with a colour band from md up. */
export function PostCard({ post, headingLevel = 2 }: { post: CampusPost; headingLevel?: 2 | 3 }) {
  const style = CATEGORY_STYLE[post.category];
  const Icon = style.icon;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article
      className={cn(
        'relative flex gap-4 py-5 md:flex-col md:gap-0 md:overflow-hidden md:py-0',
        'md:bg-surface md:rounded-[22px] md:shadow-[inset_0_0_0_2px_var(--edge),3px_3px_0_var(--drop)] md:transition-transform md:hover:-translate-y-0.5',
        'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]',
      )}
    >
      <div
        className={cn(
          'flex size-[72px] flex-none items-center justify-center rounded-[16px]',
          'md:h-[150px] md:w-full md:items-end md:justify-between md:rounded-none md:p-4',
          style.band,
        )}
      >
        <span className={cn('tag hidden md:inline-flex', style.tag)}>{post.category}</span>
        <Icon className="size-8 md:size-12" strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 md:p-5">
        <span className={cn('tag self-start md:hidden', style.tag)}>{post.category}</span>
        <Heading className="text-[18px] leading-snug font-bold">
          <Link
            href={SiteRoutes.blogPost(post.slug)}
            className="after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="text-ink-2 text-[15px] md:hidden">{post.byline}</p>
        <div className="mt-2 hidden items-center gap-3 md:flex">
          <Avatar initials={post.initials} tone={style.avatar} className="size-9 text-[15px]" />
          <div>
            <p className="text-[14.5px] font-bold">{post.author.name}</p>
            <p className="text-ink-2 text-[13.5px]">{post.readTime}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
