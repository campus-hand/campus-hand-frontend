import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { SiteRoutes } from '@/lib/routes';
import { siteNavLinks } from '../content/site-nav';
import { MobileMenu } from './mobile-menu';
import { StickyHeader } from './sticky-header';

export function SiteHeader() {
  return (
    <StickyHeader>
      <div className="wrap flex min-h-[84px] flex-wrap items-center gap-x-3 gap-y-3 py-3 sm:gap-x-7 md:gap-x-5 xl:gap-x-7">
        {/* Slightly smaller wordmark only on the narrowest phones (< 360 px) so the menu button fits. */}
        <Logo wordmarkClassName="text-[25px] min-[360px]:text-[29px]" />
        <nav
          aria-label="Main"
          className="text-ink-2 order-3 hidden w-full flex-wrap gap-x-6 gap-y-1 text-[15.5px] font-semibold sm:flex md:order-none md:w-auto md:flex-1 md:gap-x-4 xl:gap-x-6"
        >
          {siteNavLinks.map((link) => (
            <a key={link.label} href={link.href} className="link-pop inline-block py-2">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden gap-2.5 sm:flex md:ml-0">
          <Link
            href={SiteRoutes.login}
            className="btn btn-line btn-login min-h-[46px] px-4 sm:px-[22px]"
          >
            Log in
          </Link>
          <Link href={SiteRoutes.signup} className="btn btn-sun min-h-[46px] px-4 sm:px-[22px]">
            Sign up free
          </Link>
        </div>
        <MobileMenu className="ml-auto sm:hidden" />
      </div>
    </StickyHeader>
  );
}
