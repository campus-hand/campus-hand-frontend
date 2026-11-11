import { ArrowUpFromLine } from 'lucide-react';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { getTermUnits, getViewer } from '@/features/student-app/data';
import { SiteRoutes } from '@/lib/routes';
import { BottomTabs, BottomTabsView, SidebarNav, SidebarNavView } from './app-nav';
import { Avatar } from './bits';
import { PreviewRibbon } from './preview-ribbon';

/** "This semester" list in the sidebar: the viewer's course units. */
async function SemesterUnits() {
  const viewer = await getViewer();
  const { units } = await getTermUnits(viewer.studyPlace);
  if (units.length === 0) return null;
  return (
    <section aria-labelledby="sidebar-term" className="mt-8">
      <h2 id="sidebar-term" className="text-mute px-4 text-[15px] font-semibold">
        This semester
      </h2>
      <ul className="mt-2 flex flex-col">
        {units.map((unit) => (
          <li key={unit.id}>
            <Link
              href={SiteRoutes.courseUnit(unit.id)}
              className="hover:bg-sunken grid min-h-11 grid-cols-[96px_1fr] items-center gap-2 rounded-[12px] px-4 py-1.5"
            >
              <span className="display text-link text-[17px] leading-tight">{unit.code}</span>
              <span className="text-ink-2 text-[15px] leading-snug">{unit.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function ViewerChip() {
  const viewer = await getViewer();
  return (
    <div className="flex items-center gap-3 px-2">
      <Avatar initials={viewer.initials} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold">{viewer.name}</p>
        <p className="text-mute truncate text-[13.5px]">{viewer.statusLabel}</p>
      </div>
    </div>
  );
}

/**
 * Frame for every signed-in screen: a left sidebar from 1024 px up, and a
 * bottom tab bar (with the raised Ask button) on phones and small tablets.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper min-h-dvh">
      <a
        href="#app-main"
        className="focus:bg-sun focus:text-on-sun sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <PreviewRibbon />
      <div className="lg:grid lg:grid-cols-[300px_1fr]">
        <aside className="bg-sunken border-rule hidden border-r-2 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:px-4 lg:pt-7 lg:pb-5">
          <div className="px-2">
            <Logo size={46} wordmarkClassName="text-[27px]" />
          </div>
          <nav aria-label="App" className="mt-10">
            <Suspense fallback={<SidebarNavView active={null} />}>
              <SidebarNav />
            </Suspense>
          </nav>
          <Suspense fallback={null}>
            <SemesterUnits />
          </Suspense>
          <div className="mt-auto flex flex-col gap-5 pt-8">
            <Link href={SiteRoutes.upload} className="btn btn-line w-full">
              <ArrowUpFromLine className="size-5" aria-hidden="true" />
              Upload notes
            </Link>
            <Suspense fallback={null}>
              <ViewerChip />
            </Suspense>
          </div>
        </aside>

        <main id="app-main" className="min-w-0 pb-28 lg:pb-12">
          {children}
        </main>
      </div>

      <nav
        aria-label="App"
        className="bg-paper border-edge fixed inset-x-0 bottom-0 z-40 border-t-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <Suspense fallback={<BottomTabsView active={null} />}>
          <BottomTabs />
        </Suspense>
      </nav>
    </div>
  );
}
