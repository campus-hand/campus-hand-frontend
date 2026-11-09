import {
  BookOpen,
  Bookmark,
  Copy,
  FileText,
  Library,
  Map,
  PenLine,
  Quote,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';

const featureIcons: Record<string, LucideIcon> = {
  search: Search,
  bookmark: Bookmark,
  quote: Quote,
  book: BookOpen,
  map: Map,
  pen: PenLine,
};

const statusTone: Record<string, string> = {
  daily: 'tag-daily',
  note: 'tag-note',
  paper: 'tag-paper',
};

export function ResearchSection() {
  const { research } = landingContent;
  const { library } = research;

  return (
    <section
      id="research"
      aria-labelledby="rs-h"
      className="border-edge bg-deep text-on-deep mt-[72px] scroll-mt-6 border-y-[2.5px]"
    >
      <div className="wrap flex flex-col gap-9 py-[72px]">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-[18px]">
            <span className="sticker display text-xl">{research.sticker}</span>
            <h2 id="rs-h" className="display text-[clamp(44px,5vw,68px)]">
              {research.title}
            </h2>
            <p className="text-deep-mute max-w-[46ch] text-lg">{research.lead}</p>
            <p className="flex max-w-[52ch] items-start gap-2.5 text-[15px] leading-[1.45]">
              <ShieldCheck className="text-sun mt-0.5 size-5 flex-none" aria-hidden="true" />
              <span>{research.integrity}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <Link href={SiteRoutes.research} className="btn btn-sun min-h-[54px]">
                {research.cta}
              </Link>
              <Link
                href={SiteRoutes.pro}
                className="inline-flex min-h-11 items-center font-bold underline underline-offset-[3px]"
              >
                {research.compare}
              </Link>
            </div>
          </div>

          <div className="rotate-1">
            <figure
              aria-label="Example research library for a final-year project"
              className="sign bg-paper text-ink flex flex-col gap-3 p-4 shadow-[inset_0_0_0_2.5px_var(--edge),5px_5px_0_var(--drop)]"
            >
              <div className="flex items-start gap-2.5">
                <span className="bg-cobalt text-on-cobalt grid size-10 flex-none place-items-center rounded-xl">
                  <Library className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="eyebrow text-mute block">{library.kind}</span>
                  <b className="block text-base leading-[1.3]">{library.title}</b>
                </span>
              </div>
              <p className="text-mute text-[13px]">{library.meta}</p>
              <ul>
                {library.sources.map((source) => (
                  <li
                    key={source.title}
                    className="border-rule flex items-start gap-2.5 border-t py-2.5"
                  >
                    <span className="bg-surface text-link grid h-10 w-8 flex-none place-items-center rounded-[5px] shadow-[inset_0_0_0_1.5px_var(--edge)]">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-mute block text-[12.5px]">{source.type}</span>
                      <b className="block text-[14.5px] leading-[1.3]">{source.title}</b>
                      <span className="text-mute block text-[12.5px]">{source.authors}</span>
                    </span>
                    <span className={`tag self-center ${statusTone[source.tone]}`}>
                      {source.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-rule flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                <span className="text-[13px]">
                  <span className="text-mute">In-text:</span> <b>{library.citation}</b>
                </span>
                <span className="tag bg-inverse text-on-inverse h-[30px] border-0 px-2.5">
                  <Copy className="size-3.5" aria-hidden="true" />
                  Copy reference list
                </span>
              </div>
              <p className="mock bg-paper-tag-bg text-paper-tag-fg -rotate-[0.5deg] text-[13.5px] leading-[1.4]">
                <b>Magezi:</b> {library.tip}
              </p>
            </figure>
          </div>
        </div>

        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {research.features.map((feature) => {
            const Icon = featureIcons[feature.icon] ?? Search;
            return (
              <li
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-3.5 shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.18)]"
              >
                <span className="bg-sun text-on-sun grid size-10 flex-none place-items-center rounded-xl shadow-[inset_0_0_0_2px_var(--edge)]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-[16.5px] font-bold">{feature.title}</h3>
                    <span
                      className={`plan-tag ${feature.plan === 'free' ? 'plan-free' : 'plan-pro'}`}
                    >
                      {feature.plan === 'free' ? 'Free' : 'Research plan'}
                    </span>
                  </span>
                  <p className="text-deep-mute mt-1 text-sm leading-[1.45]">{feature.body}</p>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
