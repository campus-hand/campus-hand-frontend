'use client';

import { BookOpen, House, Newspaper, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MageziIcon } from '@/features/landing/icons/magezi-icon';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type NavKey = 'home' | 'courses' | 'ask' | 'tutors' | 'campus';

const ITEMS: { key: NavKey; label: string; href: string; match: string[] }[] = [
  { key: 'home', label: 'Home', href: SiteRoutes.appHome, match: [SiteRoutes.appHome] },
  {
    key: 'courses',
    label: 'Courses',
    href: SiteRoutes.courseUnits,
    match: [SiteRoutes.courseUnits],
  },
  { key: 'ask', label: 'Ask', href: SiteRoutes.ask, match: [SiteRoutes.ask] },
  { key: 'tutors', label: 'Tutors', href: SiteRoutes.tutors, match: [SiteRoutes.tutors] },
  { key: 'campus', label: 'Campus', href: SiteRoutes.blog, match: [SiteRoutes.blog] },
];

function Icon({ name, className }: { name: NavKey; className?: string }) {
  const props = { className, 'aria-hidden': true, strokeWidth: 1.8 } as const;
  switch (name) {
    case 'home':
      return <House {...props} />;
    case 'courses':
      return <BookOpen {...props} />;
    case 'ask':
      return <MageziIcon className={className} />;
    case 'tutors':
      return <Users {...props} />;
    case 'campus':
      return <Newspaper {...props} />;
  }
}

/** Which nav item a path belongs to ("/course-units/x" -> Courses). */
export function activeNavKey(pathname: string): NavKey | null {
  const hit = ITEMS.find((item) =>
    item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`)),
  );
  return hit?.key ?? null;
}

/** Desktop sidebar links for the current page (reads the URL, so render inside Suspense). */
export function SidebarNav() {
  return <SidebarNavView active={activeNavKey(usePathname())} />;
}

/** Phone tab bar for the current page (reads the URL, so render inside Suspense). */
export function BottomTabs() {
  return <BottomTabsView active={activeNavKey(usePathname())} />;
}

/** Desktop sidebar links: the active one is drawn as an outlined sign. */
export function SidebarNavView({ active }: { active: NavKey | null }) {
  return (
    <ul className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const current = item.key === active;
        return (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'flex min-h-12 items-center gap-3.5 rounded-[14px] px-4 text-[17px] font-semibold',
                current ? 'bg-surface shadow-[inset_0_0_0_2px_var(--edge)]' : 'hover:bg-sunken',
              )}
            >
              <Icon name={item.key} className="size-[22px]" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Phone tab bar: Ask is the raised yellow button in the middle. */
export function BottomTabsView({ active }: { active: NavKey | null }) {
  return (
    <ul className="grid grid-cols-5">
      {ITEMS.map((item) => {
        const current = item.key === active;
        const isAsk = item.key === 'ask';
        return (
          <li key={item.key} className="flex justify-center">
            <Link
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className="flex min-h-[60px] min-w-[60px] flex-col items-center justify-center gap-1 text-[12.5px] font-semibold"
            >
              <span
                className={cn(
                  'flex h-9 items-center justify-center rounded-full',
                  isAsk
                    ? 'bg-sun text-on-sun -mt-5 h-12 w-[72px] shadow-[inset_0_0_0_2px_var(--edge),2px_3px_0_var(--drop)]'
                    : 'w-14',
                  current && !isAsk && 'bg-inverse text-on-inverse',
                )}
              >
                <Icon name={item.key} className={isAsk ? 'size-6' : 'size-[22px]'} />
              </span>
              <span className={cn(current ? 'text-ink' : 'text-mute')}>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
