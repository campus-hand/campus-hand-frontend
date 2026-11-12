import { House, Receipt, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';
import type { CampusCategory } from '@/features/campus/models/campus-post';

const topicStyle: Partial<Record<CampusCategory, { band: string; tag: string; icon: LucideIcon }>> =
  {
    Fees: { band: 'bg-cobalt text-sun', tag: 'bg-sun text-on-sun', icon: Receipt },
    Hostels: { band: 'bg-daily-bg text-daily-fg', tag: 'bg-surface text-daily-fg', icon: House },
    Food: { band: 'bg-sun text-on-sun', tag: 'bg-surface text-tut-fg', icon: UtensilsCrossed },
  };

export function CampusBlogSection() {
  const { campus } = landingContent;

  return (
    <section id="campus" aria-labelledby="campus-h" className="wrap scroll-mt-6 pt-24">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-[560px]">
          <h2 id="campus-h" className="display h2">
            {campus.title}
          </h2>
          <p className="text-mute mt-3 text-lg">{campus.lead}</p>
        </div>
        <Link href={SiteRoutes.blog} className="btn btn-line">
          {campus.cta}
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {campus.posts.map((post) => {
          const style = topicStyle[post.category] ?? topicStyle.Fees!;
          const Icon = style.icon;
          return (
            <Link
              key={post.slug}
              href={SiteRoutes.blogPost(post.slug)}
              className="panel flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
            >
              <div className={`flex h-[150px] items-start justify-between p-5 ${style.band}`}>
                <span className={`tag ${style.tag}`}>{post.category}</span>
                <Icon className="size-14 opacity-90" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="px-5 pt-[18px] pb-5">
                <h3 className="text-[19px] leading-[1.3] font-bold">{post.title}</h3>
                <p className="text-mute mt-2 text-sm">{post.byline}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
