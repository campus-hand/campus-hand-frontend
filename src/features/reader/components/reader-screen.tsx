'use client';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudCheck,
  CloudDownload,
  Download,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MageziChat } from '@/features/magezi/components/magezi-chat';
import { MageziIcon } from '@/features/landing/icons/magezi-icon';
import {
  AddToShelfSheet,
  type ShelfUnitOption,
} from '@/features/shelf/components/add-to-shelf-sheet';
import { useTheme } from '@/features/theme/use-theme';
import { cn } from '@/lib/utils';
import {
  clampPage,
  longSubtitle,
  type PageBlock,
  type ReaderResource,
  shortSubtitle,
} from '../models/resource';
import { RichTextView } from './rich-text-view';

function Block({ block }: { block: PageBlock }) {
  switch (block.kind) {
    case 'section':
      return <p className="text-[15px] font-extrabold tracking-[0.06em] uppercase">{block.text}</p>;
    case 'heading':
      return <p className="text-[19px] font-bold">{block.text}</p>;
    case 'paragraph':
      return (
        <p className="text-[17px]">
          <RichTextView text={block.text} />
        </p>
      );
    case 'question':
      return (
        <div className={cn(block.number && 'mt-[44px] first:mt-0')}>
          <p className="text-[17px] sm:text-[19px]">
            {block.number ? <strong className="mr-1.5">{block.number}</strong> : null}
            {block.part ? <span className="mr-1">{block.part}</span> : null}
            <RichTextView text={block.text} />
          </p>
          {block.marks ? (
            <p className="text-right text-[15px] opacity-75">({block.marks} marks)</p>
          ) : null}
        </div>
      );
  }
}

/** Reader with Magezi: the page on a ruled sheet, page controls, Night, shelf and Magezi. */
export function ReaderScreen({
  resource,
  backHref,
  backLabel,
  units,
  allowance,
  isPro,
}: {
  resource: ReaderResource;
  backHref: string;
  backLabel: string;
  units: readonly ShelfUnitOption[];
  allowance: { left: number; perDay: number; unlimited?: boolean };
  isPro: boolean;
}) {
  const [page, setPage] = useState(() => clampPage(resource, resource.startPage));
  const [mageziOpen, setMageziOpen] = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [onShelf, setOnShelf] = useState(false);
  const { store: theme, isNight } = useTheme();
  const total = resource.pages.length;
  const go = (index: number) => setPage(clampPage(resource, index));

  const shelfLabel = onShelf ? 'On your shelf' : 'Add to shelf';
  const ShelfIcon = onShelf ? CloudCheck : CloudDownload;

  const pager = (
    <div className="bg-surface inline-flex items-center rounded-[14px] shadow-[inset_0_0_0_2px_var(--edge)]">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => go(page - 1)}
        disabled={page === 0}
        className="flex size-11 items-center justify-center disabled:opacity-40"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <span className="min-w-[110px] text-center text-[16px] font-bold" aria-live="polite">
        Page {page + 1} of {total}
      </span>
      <button
        type="button"
        aria-label="Next page"
        onClick={() => go(page + 1)}
        disabled={page === total - 1}
        className="flex size-11 items-center justify-center disabled:opacity-40"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div className="bg-paper flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="border-rule bg-paper sticky top-0 z-30 flex items-center gap-3 border-b-2 px-3 py-2.5 sm:px-6">
        <Link
          href={backHref}
          aria-label={`Back to ${backLabel}`}
          className="hover:bg-sunken flex size-11 flex-none items-center justify-center rounded-full"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-bold sm:text-[20px]">{resource.title}</h1>
          <p className="text-ink-2 truncate text-[14.5px] sm:hidden">
            {shortSubtitle(resource, page)}
          </p>
          <p className="text-ink-2 hidden truncate text-[15px] sm:block">
            {longSubtitle(resource)}
          </p>
        </div>
        <div className="hidden md:block">{pager}</div>
        <button
          type="button"
          onClick={() => setShelfOpen(true)}
          aria-label={shelfLabel}
          className={cn('btn btn-line size-11 p-0 sm:w-auto sm:px-4', onShelf && 'text-link')}
        >
          <ShelfIcon className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline" aria-hidden="true">
            {shelfLabel}
          </span>
        </button>
        <button
          type="button"
          onClick={() => theme?.setNight(!isNight)}
          aria-label={isNight ? 'Switch to Day mode' : 'Switch to Night mode'}
          className="btn btn-line size-11 p-0 sm:w-auto sm:px-4"
        >
          {isNight ? (
            <Sun className="size-5" aria-hidden="true" />
          ) : (
            <Moon className="size-5" aria-hidden="true" />
          )}
          <span className="hidden sm:inline" aria-hidden="true">
            {isNight ? 'Day' : 'Night'}
          </span>
        </button>
        <button
          type="button"
          disabled
          title="Downloads start once uploads are live"
          className="btn btn-line hidden px-4 disabled:opacity-60 lg:inline-flex"
        >
          <Download className="size-5" aria-hidden="true" />
          Download, {resource.sizeLabel}
          <span className="sr-only"> (not available in the preview)</span>
        </button>
      </header>

      <div className="flex flex-1 lg:grid lg:grid-cols-[150px_1fr_440px]">
        {/* Page thumbnails (desktop) */}
        <nav aria-label="Pages" className="border-rule bg-sunken hidden border-r-2 lg:block">
          <ol className="sticky top-[74px] flex max-h-[calc(100dvh-74px)] flex-col items-center gap-5 overflow-y-auto py-6">
            {resource.pages.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === page ? 'page' : undefined}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'sheet-thumb block h-[132px] w-[102px] rounded-[6px]',
                      i === page && 'shadow-[inset_0_0_0_3px_var(--cobalt),2px_2px_0_var(--drop)]',
                    )}
                  />
                  <span className={cn('text-[14px]', i === page ? 'font-extrabold' : 'text-ink-2')}>
                    {i + 1}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* The page */}
        <main
          id="reader-page"
          className="bg-sunken min-w-0 flex-1 px-3 pt-4 pb-40 sm:px-8 sm:pt-8 lg:pb-12"
        >
          <article
            aria-label={`Page ${page + 1} of ${total}`}
            className="sheet reader-sheet mx-auto max-w-[920px] px-5 py-[44px] pl-[84px] sm:pr-14 sm:pl-[130px]"
          >
            <div className="flex flex-col">
              {resource.pages[page].blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </article>
          <div className="mt-5 flex justify-center md:hidden">{pager}</div>
        </main>

        {/* Magezi: right column on desktop, bottom panel on phones */}
        <aside
          aria-label="Magezi"
          className={cn(
            'border-edge bg-paper z-40 flex-col',
            'lg:sticky lg:top-[74px] lg:flex lg:h-[calc(100dvh-74px)] lg:border-l-2',
            mageziOpen
              ? 'fixed inset-x-0 bottom-0 flex max-h-[78dvh] rounded-t-[28px] border-t-2 shadow-[0_-6px_24px_rgb(0_0_0/0.18)] lg:static lg:max-h-none lg:rounded-none lg:border-t-0 lg:shadow-none'
              : 'hidden',
          )}
        >
          <div className="border-rule flex items-center gap-3 border-b px-5 py-4">
            <span className="bg-cobalt text-on-cobalt flex size-11 flex-none items-center justify-center rounded-[12px]">
              <MageziIcon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[19px] font-bold">Magezi</h2>
              <p className="text-ink-2 text-[14.5px]">
                Answers from this file and your {resource.courseUnitCode} notes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMageziOpen(false)}
              aria-label="Close Magezi"
              className="hover:bg-sunken flex size-11 items-center justify-center rounded-full lg:hidden"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>
          <MageziChat
            scope="page"
            resourceId={resource.id}
            courseUnitCode={resource.courseUnitCode}
            suggestions={resource.suggestions}
            allowance={allowance}
            className="min-h-0 flex-1"
            bodyClassName="px-5 py-5"
            footerClassName="px-5 pb-5"
          />
        </aside>
      </div>

      {/* Phone: open Magezi */}
      {!mageziOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden">
          <button
            type="button"
            onClick={() => setMageziOpen(true)}
            className="btn btn-cobalt w-full justify-between"
          >
            <span className="flex items-center gap-2.5">
              <MageziIcon className="size-5" />
              Ask Magezi about this page
            </span>
            <ChevronUp className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <AddToShelfSheet
        open={shelfOpen}
        onOpenChange={setShelfOpen}
        resource={{
          id: resource.id,
          title: resource.title,
          detail: `${resource.courseUnitCode}, ${resource.when}`,
          kind: resource.kind,
          stamp: resource.stamp,
          courseUnitCode: resource.courseUnitCode,
        }}
        units={units}
        isPro={isPro}
        onAdded={() => setOnShelf(true)}
      />
      {onShelf ? (
        <p role="status" className="sr-only">
          Added to My shelf.
        </p>
      ) : null}
    </div>
  );
}
