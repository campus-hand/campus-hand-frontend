'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { StickyHeaderController } from '../models/sticky-header-controller';

/** Full-width header bar that stays at the top while the page scrolls. */
export function StickyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const controller = new StickyHeaderController<HTMLElement>(
      ref.current,
      window,
      document.documentElement,
      typeof ResizeObserver === 'undefined' ? null : (onResize) => new ResizeObserver(onResize),
    );
    controller.start();
    return () => controller.stop();
  }, []);

  return (
    <header ref={ref} className="site-header">
      {children}
    </header>
  );
}
