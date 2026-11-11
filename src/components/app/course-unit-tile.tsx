import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Tile colours in the design's order: cobalt, green, red, yellow, white. */
const TONES = [
  'bg-cobalt text-on-cobalt',
  'bg-forest text-on-forest',
  'bg-signal-red text-on-cobalt',
  'bg-sun text-on-sun',
  'bg-surface text-ink',
] as const;

export function tileTone(index: number): string {
  return TONES[index % TONES.length];
}

/** Big coloured sign for one course unit, with an optional "3 new" sticker. */
export function CourseUnitTile({
  href,
  code,
  title,
  index,
  newCount = 0,
  className,
}: {
  href: string;
  code: string;
  title: string;
  index: number;
  newCount?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'sign tile-pop relative flex min-h-[170px] flex-col justify-between gap-6 p-5 sm:min-h-[196px] sm:p-6',
        tileTone(index),
        className,
      )}
    >
      <span className="display text-[40px] leading-[0.95] break-words sm:text-[52px]">{code}</span>
      <span className="text-[17px] leading-snug font-bold sm:text-[19px]">{title}</span>
      {newCount > 0 ? (
        <span className="sticker absolute -top-3 right-3 text-[14px] font-extrabold">
          {newCount} new
        </span>
      ) : null}
    </Link>
  );
}
