import { CampusBlogSection } from './campus-blog-section';
import { CourseUnitsSection } from './course-units-section';
import { FaqSection } from './faq-section';
import { HeroSection } from './hero-section';
import { HowItWorksSection } from './how-it-works-section';
import { InviteBand } from './invite-band';
import { MageziSection } from './magezi-section';
import { ResearchSection } from './research-section';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { TutorsSection } from './tutors-section';

/** Public landing page, in the order of the design canvas board. */
export function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <a
        href="#main"
        className="focus:bg-sun focus:text-on-sun sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <CourseUnitsSection />
        <HowItWorksSection />
        <MageziSection />
        <ResearchSection />
        <TutorsSection />
        <CampusBlogSection />
        <FaqSection />
        <InviteBand />
      </main>
      <SiteFooter />
    </div>
  );
}
