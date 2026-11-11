import { cn } from '@/lib/utils';

/** Thin progress track (cobalt fill by default). `value` is 0 to 1. */
export function ProgressBar({
  value,
  label,
  className,
  fillClassName = 'bg-cobalt',
  trackClassName = 'bg-track',
}: {
  value: number;
  /** Accessible name, e.g. "Question 2 of 6". */
  label: string;
  className?: string;
  fillClassName?: string;
  trackClassName?: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn('h-1.5 w-full overflow-hidden rounded-full', trackClassName, className)}
    >
      <div className={cn('h-full rounded-full', fillClassName)} style={{ width: `${percent}%` }} />
    </div>
  );
}

const AVATAR_TONES = {
  sun: 'bg-sun text-on-sun',
  forest: 'bg-daily-bg text-daily-fg',
  red: 'bg-tut-bg text-tut-fg',
  cobalt: 'bg-note-bg text-note-fg',
} as const;

/** Round initials badge ("SN", "BO") in the display font. */
export function Avatar({
  initials,
  tone = 'sun',
  className,
}: {
  initials: string;
  tone?: keyof typeof AVATAR_TONES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'display inline-flex size-11 flex-none items-center justify-center rounded-full text-lg',
        AVATAR_TONES[tone],
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** Section heading used on app screens: "PICK UP WHERE YOU LEFT OFF". */
export function SectionTitle({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn('display text-[28px] sm:text-[34px]', className)}>
      {children}
    </h2>
  );
}
