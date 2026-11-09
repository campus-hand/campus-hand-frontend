import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';

export function CourseUnitsSection() {
  const { units } = landingContent;

  return (
    <section
      id="units"
      aria-labelledby="units-h"
      className="wrap grid scroll-mt-6 items-center gap-14 pt-[72px] pb-6 lg:grid-cols-2"
    >
      <div className="flex max-w-[480px] flex-col gap-4">
        <h2 id="units-h" className="display h2">
          {units.title}
        </h2>
        <p className="text-ink-2 text-lg">{units.lead}</p>
        <Link href={SiteRoutes.courseUnits} className="btn btn-cobalt mt-2 self-start">
          {units.cta}
        </Link>
      </div>

      <div className="panel px-5 pt-2 pb-1.5 sm:px-6">
        <div className="border-rule flex flex-wrap gap-2 border-b pt-3.5 pb-4">
          <span className="chip">{units.programme}</span>
          <span className="chip bg-inverse text-on-inverse shadow-none">{units.period}</span>
        </div>
        <ul>
          {units.items.map((unit) => (
            <li
              key={unit.code}
              className="border-rule flex min-h-[68px] items-center gap-3.5 border-b last:border-b-0"
            >
              <span className="display text-link w-[90px] text-xl whitespace-nowrap">
                {unit.code}
              </span>
              <span className="flex-1 text-base font-[650]">{unit.title}</span>
              <span className="text-mute hidden text-sm sm:inline">{unit.resourceSummary}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
