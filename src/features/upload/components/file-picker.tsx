'use client';

import { ArrowUpFromLine, X } from 'lucide-react';
import { useRef } from 'react';
import { ProgressBar } from '@/components/app/bits';
import { cn } from '@/lib/utils';
import { ACCEPTED_FILES, type ChosenFile, fileBadge, fileSizeLabel } from '../models/upload';
import { FieldError } from './form-bits';

/** Choose a file; once chosen, show it with its upload progress and a remove button. */
export function FilePicker({
  file,
  progress,
  onChoose,
  onRemove,
  error,
}: {
  file: ChosenFile | null;
  /** 0 to 1, or null before the upload starts. */
  progress: number | null;
  onChoose: (file: File) => void;
  onRemove: () => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);

  if (!file) {
    return (
      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="file"
          className={cn(
            'panel hover:bg-sunken flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-6 text-center',
            error && 'shadow-[inset_0_0_0_2px_var(--red-text)]',
          )}
        >
          <ArrowUpFromLine className="size-7" aria-hidden="true" />
          <span className="text-[17px] font-bold">Choose a file</span>
          <span className="text-ink-2 text-[14.5px]">
            PDF, Word, PowerPoint or a photo, up to 25 MB
          </span>
        </label>
        <input
          ref={input}
          id="file"
          type="file"
          accept={ACCEPTED_FILES}
          className="sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'file-error' : undefined}
          onChange={(e) => {
            const chosen = e.target.files?.[0];
            if (chosen) onChoose(chosen);
            e.target.value = '';
          }}
        />
        {error ? <FieldError id="file-error">{error}</FieldError> : null}
      </div>
    );
  }

  const done = progress !== null && progress >= 1;
  const percent = Math.round((progress ?? 0) * 100);
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={cn(
          'panel flex items-center gap-4 p-4',
          error && 'shadow-[inset_0_0_0_2px_var(--red-text)]',
        )}
      >
        <span className="bg-tut-bg text-tut-fg flex size-14 flex-none items-center justify-center rounded-[12px] text-[13px] font-extrabold">
          {fileBadge(file.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-bold outline-none" id="file" tabIndex={-1}>
            {file.name}
          </p>
          <p className="text-ink-2 text-[15px]" aria-live="polite">
            {fileSizeLabel(file.sizeBytes)}. {done ? 'Uploaded' : `Uploading, ${percent}%`}
          </p>
          <ProgressBar
            value={progress ?? 0}
            label={`Upload of ${file.name}`}
            className="mt-2 h-2"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className="hover:bg-sunken flex size-11 flex-none items-center justify-center rounded-full"
        >
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>
      {error ? <FieldError id="file-error">{error}</FieldError> : null}
    </div>
  );
}
