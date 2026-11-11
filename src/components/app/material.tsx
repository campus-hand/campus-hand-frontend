import type { MaterialKind } from '@/features/home/models/study';
import { cn } from '@/lib/utils';

const KIND: Record<MaterialKind, { label: string; tag: string; stamp: string }> = {
  lecture: { label: 'Lecture notes', tag: 'tag-note', stamp: 'bg-note-bg text-note-fg' },
  daily: { label: 'Daily notes', tag: 'tag-daily', stamp: 'bg-daily-bg text-daily-fg' },
  paper: { label: 'Past paper', tag: 'tag-paper', stamp: 'bg-paper-tag-bg text-paper-tag-fg' },
  tutorial: { label: 'Tutorial', tag: 'tag-tut', stamp: 'bg-tut-bg text-tut-fg' },
};

export function materialLabel(kind: MaterialKind): string {
  return KIND[kind].label;
}

/** Coloured tag: "Lecture notes", "Daily notes", "Past paper", "Tutorial". */
export function MaterialTag({ kind, className }: { kind: MaterialKind; className?: string }) {
  return <span className={cn('tag', KIND[kind].tag, className)}>{KIND[kind].label}</span>;
}

/**
 * Small ruled-sheet thumbnail (red margin line) with an optional stamp such
 * as "DEC 2024" or "LEC 6" in the corner. Decorative.
 */
export function SheetThumb({
  kind,
  stamp,
  className,
}: {
  kind: MaterialKind;
  stamp?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'sheet-thumb relative inline-block h-[72px] w-[56px] flex-none rounded-[6px]',
        className,
      )}
    >
      {stamp ? (
        <span
          className={cn(
            'absolute top-2 left-3 rounded-[3px] px-1 text-[9px] leading-[1.1] font-extrabold whitespace-pre-line uppercase',
            KIND[kind].stamp,
          )}
        >
          {stamp.replace(' ', '\n')}
        </span>
      ) : null}
    </span>
  );
}
