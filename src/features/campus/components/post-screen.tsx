import { ArrowLeft, Flag, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/app/bits';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { CampusPost, PostBlock } from '../models/campus-post';
import { CATEGORY_STYLE } from './category-style';
import { CheckedBadge, PostCard } from './post-cards';

function Block({ block }: { block: PostBlock }) {
  switch (block.kind) {
    case 'h':
      return <h2 className="display mt-4 text-[30px] sm:text-[36px]">{block.text}</h2>;
    case 'steps':
      return (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="bg-sun text-on-sun display flex size-9 flex-none items-center justify-center rounded-full text-[18px] shadow-[inset_0_0_0_2px_var(--edge)]"
              >
                {i + 1}
              </span>
              <span className="pt-1">{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <p className="bg-daily-bg text-daily-fg flex items-start gap-3 rounded-[18px] p-4 shadow-[inset_0_0_0_2px_var(--green)]">
          <Lightbulb className="mt-1 size-5 flex-none" aria-hidden="true" />
          <span>
            <strong>Tip: </strong>
            {block.text}
          </span>
        </p>
      );
    default:
      return <p>{block.text}</p>;
  }
}

/** One campus post, with posts to read next. */
export function PostScreen({ post, next }: { post: CampusPost; next: readonly CampusPost[] }) {
  const style = CATEGORY_STYLE[post.category];
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-5 pt-4 pb-6 sm:px-8 lg:px-10 lg:pt-8">
      <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link
            href={SiteRoutes.blog}
            aria-label="Back to Campus"
            className="hover:bg-sunken -ml-2 flex size-11 items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
          </Link>
          <Link
            href={SiteRoutes.blogTopic(post.category)}
            className={cn('tag min-h-8 px-3 text-[14px] hover:underline', style.tag)}
          >
            {post.category}
          </Link>
        </div>

        <header className="flex flex-col gap-5">
          <h1 className="display text-[clamp(44px,8vw,76px)] leading-[0.95]">{post.title}</h1>
          <p className="text-ink-2 text-[19px] leading-relaxed">{post.summary}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-3">
              <Avatar initials={post.initials} tone={style.avatar} />
              <div>
                <p className="text-[16px] font-bold">{post.author.name}</p>
                <p className="text-ink-2 text-[14.5px]">
                  {post.authorDetail},{' '}
                  <time dateTime={post.publishedOn}>{post.publishedLabel}</time>
                </p>
              </div>
            </div>
            {post.checkedAgainst ? <CheckedBadge against={post.checkedAgainst} full /> : null}
          </div>
        </header>

        <div className="border-rule flex flex-col gap-5 border-t-2 pt-6 text-[17.5px] leading-relaxed">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <footer className="bg-sunken flex flex-col gap-2 rounded-[18px] p-4 text-[15px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-2">
            Written by a student and checked by a moderator. Things change, so check with the office
            concerned before you act on it.
          </p>
          <Link
            href={SiteRoutes.report}
            className="text-link flex min-h-11 flex-none items-center gap-1.5 font-bold underline"
          >
            <Flag className="size-4" aria-hidden="true" />
            Report a problem
          </Link>
        </footer>
      </article>

      {next.length > 0 ? (
        <section aria-labelledby="next-h" className="flex flex-col gap-3">
          <h2 id="next-h" className="display text-[30px] sm:text-[36px]">
            Read next
          </h2>
          <div className="divide-rule grid divide-y-2 md:grid-cols-3 md:gap-5 md:divide-y-0">
            {next.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel={3} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
