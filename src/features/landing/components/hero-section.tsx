import { ChevronDown, GraduationCap, Search } from 'lucide-react';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';
import { MageziIcon } from '../icons/magezi-icon';

export function HeroSection() {
  const { hero, launchUniversity } = landingContent;

  return (
    <section className="border-edge bg-sun text-on-sun border-y-[2.5px]">
      <div className="wrap grid items-center gap-14 pt-10 pb-12 md:pt-14 md:pb-16 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Link href={SiteRoutes.universities} className="chip self-start">
            <GraduationCap className="size-4" aria-hidden="true" />
            {launchUniversity}
            <ChevronDown className="size-4" aria-hidden="true" />
            <span className="sr-only">(change university)</span>
          </Link>
          <h1 className="display text-[clamp(52px,7.4vw,99px)]">{hero.title}</h1>
          <p className="max-w-[46ch] text-[19px] font-medium">{hero.lead}</p>
          <form
            action={SiteRoutes.courseUnits}
            method="get"
            className="flex max-w-[560px] flex-col gap-2.5"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search course units
            </label>
            <div className="panel flex min-h-[58px] items-center gap-2.5 rounded-[18px] py-1.5 pr-2 pl-[18px]">
              <Search className="text-mute size-5 flex-none" aria-hidden="true" />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder={hero.searchPlaceholder}
                className="text-ink placeholder:text-mute min-w-0 flex-1 border-0 bg-transparent text-[17px] outline-none"
              />
              <button type="submit" className="btn btn-sun min-h-[44px] px-[18px]">
                Search
              </button>
            </div>
            <p className="text-sm font-semibold">{hero.searchNote}</p>
          </form>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

/** Past paper question with Magezi explaining it (decorative but labelled). */
function HeroIllustration() {
  const { sheet, magezi } = landingContent.hero;

  return (
    <figure
      aria-label="A past paper question with the study buddy explaining it"
      className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[540px]"
    >
      <div
        aria-hidden="true"
        className="sheet absolute top-0 left-[16%] h-[330px] w-[72%] rotate-[5deg] pt-7 pr-6 pl-[72px] sm:left-[70px] sm:h-[440px] sm:w-[380px]"
      >
        <p className="text-daily-fg text-[12.5px] leading-7 font-bold">{sheet.backLabel}</p>
      </div>
      <div className="sheet absolute top-9 left-0 h-[340px] w-[88%] -rotate-3 pt-[26px] pr-6 pl-[62px] sm:h-[460px] sm:w-[400px] sm:pl-[72px]">
        <div className="flex h-7 items-center justify-between">
          <span className="text-[13px] font-extrabold">{sheet.code}</span>
          <span className="tag tag-paper">{sheet.sitting}</span>
        </div>
        <p className="text-sm leading-7">{sheet.paper}</p>
        <p className="mt-7 text-base leading-7">
          <b>2.</b> {sheet.before}
          <span className="highlight">{sheet.highlight}</span>
          {sheet.after}
        </p>
        <p className="text-right text-[13px] leading-7 text-[#4B5654]">{sheet.marks}</p>
      </div>
      <div className="bg-surface text-ink absolute right-0 bottom-0 flex w-[78%] flex-col gap-3 rounded-[22px] p-[18px] shadow-[0_0_0_1px_var(--track),0_24px_48px_-18px_rgb(20_32_31/0.45)] sm:w-[300px]">
        <div className="flex items-center gap-2.5">
          <span className="bg-cobalt text-sun grid size-8 place-items-center rounded-[10px]">
            <MageziIcon />
          </span>
          <b className="text-[14.5px]">Magezi</b>
        </div>
        <p className="text-[15.5px] leading-[1.45]">{magezi}</p>
        <div className="flex gap-2" aria-hidden="true">
          <span className="chip min-h-8 text-[13px]">Draw it</span>
          <span className="chip min-h-8 text-[13px]">Quiz me</span>
        </div>
      </div>
    </figure>
  );
}
