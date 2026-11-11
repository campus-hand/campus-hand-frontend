'use client';

import { ChevronDown, CircleAlert, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Error line under a field (same look as the auth screens). */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-red-text flex items-start gap-2 text-[15px] font-semibold">
      <CircleAlert className="mt-0.5 size-4 flex-none" aria-hidden="true" />
      {children}
    </p>
  );
}

/** "From your profile" badge beside a pre-filled pick. */
export function FromProfile() {
  return (
    <span className="tag tag-daily h-auto min-h-7 gap-1.5 px-2.5 text-[13.5px]">
      <UserRound className="size-3.5" aria-hidden="true" />
      From your profile
    </span>
  );
}

/** Labelled select in the outlined field style. */
export function SelectField({
  id,
  label,
  badge,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  hint,
}: {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
  hint?: ReactNode;
}) {
  const describedBy = [error ? `${id}-error` : '', hint ? `${id}-hint` : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center justify-between gap-3">
        <label htmlFor={id} className="text-[16px] font-bold">
          {label}
        </label>
        {badge}
      </div>
      <div className="field" data-invalid={error ? '' : undefined}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="text-ink-2 mr-2 size-5 flex-none" aria-hidden="true" />
      </div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
      {hint ? (
        <p id={`${id}-hint`} className="text-ink-2 text-[14.5px]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Row of choices that look like a segmented sign (Year 1 2 3 4, Semester 1 2). */
export function Segmented({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: number | null;
  options: readonly number[];
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span id={`${id}-label`} className="text-[16px] font-bold">
        {label}
      </span>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        tabIndex={-1}
        className={cn(
          'flex gap-1 rounded-[16px] p-1.5 shadow-[inset_0_0_0_2px_var(--edge)]',
          disabled ? 'bg-sunken opacity-60' : 'bg-surface',
          error && 'shadow-[inset_0_0_0_2px_var(--red-text)]',
        )}
      >
        {options.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n}`}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={cn(
              'min-h-11 flex-1 rounded-[11px] text-[17px] font-bold',
              value === n ? 'bg-inverse text-on-inverse' : 'hover:bg-sunken',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  );
}
