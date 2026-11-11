'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { BottomSheet } from '@/components/app/bottom-sheet';
import { SheetThumb } from '@/components/app/material';
import type { MaterialKind } from '@/features/home/models/study';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { ShelfStore } from '../models/shelf-store';

export interface ShelfUnitOption {
  code: string;
  title: string;
}

const OTHER = '__other__';

/** "Add to my shelf": file a note or paper under one of the viewer's course units. */
export function AddToShelfSheet({
  open,
  onOpenChange,
  resource,
  units,
  isPro,
  onAdded,
  store,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: {
    id: string;
    title: string;
    detail: string;
    kind: MaterialKind;
    stamp: string;
    courseUnitCode: string;
  };
  units: readonly ShelfUnitOption[];
  isPro: boolean;
  onAdded: (filedUnder: string | null) => void;
  store?: ShelfStore;
}) {
  const matches = units.some((u) => u.code === resource.courseUnitCode);
  const [choice, setChoice] = useState(matches ? resource.courseUnitCode : OTHER);
  const [offline, setOffline] = useState(false);
  const [failed, setFailed] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const filedUnder = choice === OTHER ? null : choice;
    const saved = (store ?? ShelfStore.forBrowser()).add(resource.id, filedUnder, isPro && offline);
    if (!saved) {
      setFailed(true);
      return;
    }
    onAdded(filedUnder);
    onOpenChange(false);
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Add to my shelf">
      <form onSubmit={submit} className="mt-5 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <SheetThumb kind={resource.kind} stamp={resource.stamp} />
          <div>
            <p className="text-[19px] font-bold">{resource.title}</p>
            <p className="text-ink-2 text-[16px]">{resource.detail}</p>
          </div>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[18px] font-bold">Which course unit is it for?</legend>
          {[
            ...units.map((u) => ({ value: u.code, code: u.code, title: u.title })),
            {
              value: OTHER,
              code: 'Other',
              title: 'Not one of my course units',
            },
          ].map((option) => {
            const selected = choice === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  'flex min-h-16 cursor-pointer items-center gap-4 rounded-[18px] px-4 py-3 shadow-[inset_0_0_0_2px_var(--edge)]',
                  selected ? 'bg-note-bg shadow-[inset_0_0_0_2.5px_var(--cobalt)]' : 'bg-surface',
                )}
              >
                <input
                  type="radio"
                  name="shelf-unit"
                  value={option.value}
                  checked={selected}
                  onChange={() => setChoice(option.value)}
                  className="accent-cobalt size-6 flex-none"
                />
                <span className="flex flex-col">
                  <span className="text-[17px]">
                    <strong>{option.code}</strong> {option.title}
                  </span>
                  {option.value === resource.courseUnitCode ? (
                    <span className="text-ink-2 text-[15px]">Matches this file</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="flex flex-wrap items-center gap-2 text-[17px] font-bold">
              <span id="shelf-offline-label">Keep it readable offline</span>
              <span className="plan-tag plan-pro">Pro</span>
            </p>
            <p className="text-ink-2 text-[15px]">
              {isPro ? 'Opens only inside Campus Hand.' : 'Offline reading comes with Pro. '}
              {!isPro ? (
                <Link href={SiteRoutes.pro} className="text-link font-bold">
                  See Pro
                </Link>
              ) : null}
            </p>
          </div>
          <label className="relative inline-flex flex-none">
            <input
              type="checkbox"
              role="switch"
              aria-labelledby="shelf-offline-label"
              checked={isPro && offline}
              disabled={!isPro}
              onChange={(e) => setOffline(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="bg-sunken peer-checked:bg-forest h-10 w-[68px] rounded-full shadow-[inset_0_0_0_2px_var(--edge)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)] peer-disabled:opacity-60"
            />
            <span
              aria-hidden="true"
              className="bg-surface absolute top-1.5 left-1.5 size-7 rounded-full shadow-[inset_0_0_0_2px_var(--edge)] transition-transform peer-checked:translate-x-7"
            />
          </label>
        </div>

        {failed ? (
          <p className="notice notice-error" role="alert">
            Your shelf couldn&apos;t be saved on this device. Check that the browser allows saving
            data, then try again.
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-3">
          <button type="submit" className="btn btn-sun btn-block w-full">
            Add to shelf
          </button>
          <p className="text-ink-2 text-[15px]">Move or remove it any time from My shelf.</p>
        </div>
      </form>
    </BottomSheet>
  );
}
