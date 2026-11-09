import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { SiteRoutes } from '@/lib/routes';

const navLinks = [
  { label: 'Course units', href: '#units' },
  { label: 'Tutors', href: '#tutors' },
  { label: 'Campus blog', href: '#campus' },
  { label: 'For lecturers', href: SiteRoutes.lecturers },
];

export function SiteHeader() {
  return (
    <header className="wrap flex min-h-[84px] flex-wrap items-center gap-x-7 gap-y-3 py-3">
      <Logo />
      <nav
        aria-label="Main"
        className="text-ink-2 order-3 flex w-full flex-wrap gap-x-6 gap-y-1 text-[15.5px] font-semibold md:order-none md:w-auto md:flex-1"
      >
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} className="py-2 hover:underline">
            {link.label}
          </a>
        ))}
      </nav>
      <div className="ml-auto flex gap-2.5 md:ml-0">
        <Link href={SiteRoutes.login} className="btn btn-line min-h-[46px] px-4 sm:px-[22px]">
          Log in
        </Link>
        <Link href={SiteRoutes.signup} className="btn btn-sun min-h-[46px] px-4 sm:px-[22px]">
          Sign up free
        </Link>
      </div>
    </header>
  );
}
