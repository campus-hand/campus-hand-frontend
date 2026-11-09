import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';

export function FinalCta() {
  const { finalCta } = landingContent;

  return (
    <section aria-labelledby="cta-h" className="wrap pt-[88px] pb-10">
      <div className="sign bg-sun text-on-sun flex flex-wrap items-center justify-between gap-6 rounded-[22px] px-6 py-8 sm:px-10 sm:py-10">
        <div>
          <h2 id="cta-h" className="display text-[clamp(42px,5vw,69px)]">
            {finalCta.title}
          </h2>
          <p className="mt-2.5 text-lg">{finalCta.lead}</p>
        </div>
        <Link href={SiteRoutes.courseUnits} className="btn btn-ink min-h-14 px-7 text-[17px]">
          {finalCta.cta}
        </Link>
      </div>
    </section>
  );
}
