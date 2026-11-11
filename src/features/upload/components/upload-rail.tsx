import { BookMarked, MessageSquareWarning } from 'lucide-react';
import { SectionTitle } from '@/components/app/bits';
import { cn } from '@/lib/utils';
import type { MyUpload, UploadStatus } from '../models/upload';

const STATUS: Record<UploadStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'tag-daily' },
  review: { label: 'In review', className: 'tag-paper' },
  changes: { label: 'Changes asked', className: 'bg-surface text-red-text' },
};

/** "Your uploads" with their review status. */
export function MyUploads({ uploads }: { uploads: readonly MyUpload[] }) {
  return (
    <section aria-labelledby="mine-h" className="panel flex flex-col gap-4 p-5">
      <SectionTitle id="mine-h" className="text-[26px] sm:text-[28px]">
        Your uploads
      </SectionTitle>
      {uploads.length === 0 ? (
        <p className="text-ink-2 text-[15.5px]">Nothing yet. Your first upload shows here.</p>
      ) : (
        <ul className="flex flex-col divide-y-2 divide-[var(--rule)]">
          {uploads.map((u) => {
            const status = STATUS[u.status];
            return (
              <li key={u.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[16.5px] leading-snug font-bold">{u.title}</p>
                  <span className={cn('tag flex-none', status.className)}>{status.label}</span>
                </div>
                <p className="text-ink-2 text-[14.5px]">{u.detail}</p>
                {u.moderatorNote ? (
                  <p className="text-red-text flex items-start gap-2 text-[14.5px] font-semibold">
                    <MessageSquareWarning className="mt-0.5 size-4 flex-none" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Moderator: </span>
                      {u.moderatorNote}
                    </span>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Explains the two ways a book can be added. */
export function SharingABook() {
  return (
    <aside
      aria-labelledby="book-tip-h"
      className="bg-paper-tag-bg flex flex-col gap-2 rounded-[18px] p-5 shadow-[inset_0_0_0_2px_var(--edge)]"
    >
      <h2 id="book-tip-h" className="flex items-center gap-2 text-[17px] font-bold">
        <BookMarked className="size-5" aria-hidden="true" />
        Sharing a book?
      </h2>
      <p className="text-[15.5px]">
        Choose <strong>Book</strong> under “What is it?”. If you can’t share the file, list it on
        the reading list instead: students see where to find it in the library or a bookshop.
      </p>
    </aside>
  );
}
