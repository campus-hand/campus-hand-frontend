'use client';

import { cn } from '@/lib/utils';
import { useTheme } from './use-theme';

/**
 * The small "Night" / "Day" button on the auth screens. It names the look it
 * switches to, like the design; same store as the footer's sun-moon switch.
 */
export function ThemePill({ className }: { className?: string }) {
  const { store, isNight } = useTheme();
  const target = isNight ? 'Day' : 'Night';

  return (
    <button
      type="button"
      className={cn('theme-pill', className)}
      aria-label={`Switch to ${target} mode`}
      onClick={() => store?.setNight(!isNight)}
    >
      {target}
    </button>
  );
}
