import { BookOpen, Loader, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';
import { ThemePill } from '@/features/theme/theme-pill';
import { authContent } from '../content/auth-content';

const featureIcons = { notes: BookOpen, magezi: Loader, people: Users } as const;

/**
 * Frame for every auth screen.
 * - Desktop (lg): brand panel on the left, the form card on the right.
 * - Tablet (sm): logo and Day/Night button above a centred card.
 * - Phone: the same header, then the form on the page with no card.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[46fr_54fr]">
      <BrandPanel />
      <div className="flex min-h-dvh flex-col items-center px-5 pt-5 pb-10 sm:justify-center sm:px-8 sm:py-12">
        <div className="w-full max-w-[480px]">
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8 lg:mb-6 lg:justify-end">
            <Logo className="lg:hidden" wordmarkClassName="text-[27px] min-[360px]:text-[31px]" />
            <ThemePill />
          </div>
          <main id="main">{children}</main>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  const { brandPanel } = authContent;
  return (
    // The coloured column runs the full page height; its content stays in view while the form scrolls.
    <aside
      aria-label="About Campus Hand"
      className="bg-brand-panel text-on-brand-panel hidden lg:block"
    >
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden px-11 py-10">
        <Logo
          size={50}
          wordmarkClassName="text-[32px] text-on-brand-panel"
          handClassName="text-sun"
        />
        <div className="my-auto flex max-w-[460px] flex-col gap-9 py-10">
          <div className="sign bg-sun text-on-sun -rotate-[1.5deg] px-8 pt-8 pb-6">
            <p className="display text-[50px] leading-[0.92]">
              {brandPanel.signTitle[0]}
              <br />
              {brandPanel.signTitle[1]}
            </p>
            <p className="mt-4 -rotate-[1.5deg] text-[16px] font-medium">{brandPanel.signNote}</p>
          </div>
          <ul className="flex flex-col gap-5">
            {brandPanel.features.map((feature) => {
              const Icon = featureIcons[feature.icon];
              return (
                <li key={feature.icon} className="flex items-start gap-4 text-[17px] leading-snug">
                  <span className="bg-brand-tile grid size-9 flex-none place-items-center rounded-[10px]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="pt-1">{feature.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
