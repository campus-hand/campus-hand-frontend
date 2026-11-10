'use client';

import { CircleAlert, CircleCheck, Eye, EyeOff, LockKeyhole, type LucideIcon } from 'lucide-react';
import { type InputHTMLAttributes, type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { OtpCode } from '../models/otp-code';
import { PasswordStrength } from '../models/password-strength';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'prefix'>;

interface FieldProps extends InputProps {
  id: string;
  label: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  error?: string;
  prefix?: ReactNode;
  action?: ReactNode;
  /** Extra content between the input and the hint (strength meter). */
  below?: ReactNode;
  fieldClassName?: string;
}

/** Label, outlined input with an icon, then a hint or an error line. */
export function TextField({
  id,
  label,
  icon: Icon,
  hint,
  error,
  prefix,
  action,
  below,
  fieldClassName,
  ...input
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-ink text-[16px] font-bold">
        {label}
      </label>
      <div className={cn('field', fieldClassName)} data-invalid={error ? '' : undefined}>
        {Icon ? <Icon className="size-[22px] flex-none" aria-hidden="true" /> : null}
        {prefix}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
        />
        {action}
      </div>
      {below}
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
      {hint ? (
        <p id={hintId} className="text-mute text-[15px]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-red-text flex items-start gap-2 text-[15px] font-semibold">
      <CircleAlert className="mt-0.5 size-4 flex-none" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Password with a show/hide button and, on new passwords, the strength bars. */
export function PasswordField({
  showStrength = false,
  personal = [],
  error,
  value,
  ...props
}: Omit<FieldProps, 'type' | 'icon' | 'action' | 'below' | 'value'> & {
  value: string;
  showStrength?: boolean;
  personal?: readonly string[];
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength && value ? PasswordStrength.assess(value, personal) : null;
  // The strength line already says what is wrong, so the error is not repeated under it.
  const errorText = strength && error === strength.message ? undefined : error;

  return (
    <TextField
      {...props}
      value={value}
      error={errorText}
      type={visible ? 'text' : 'password'}
      icon={LockKeyhole}
      action={
        <button
          type="button"
          className="field-action"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <EyeOff className="size-[22px]" aria-hidden="true" />
          ) : (
            <Eye className="size-[22px]" aria-hidden="true" />
          )}
        </button>
      }
      below={
        strength ? (
          <StrengthMeter score={strength.score} message={strength.message} invalid={!!error} />
        ) : null
      }
    />
  );
}

const meterTone = (score: number) =>
  score >= 3 ? 'bg-forest' : score === 2 ? 'bg-sun' : 'bg-signal-red';
const textTone = (score: number) =>
  score >= 3 ? 'text-green-text' : score === 2 ? 'text-paper-tag-fg' : 'text-red-text';

function StrengthMeter({
  score,
  message,
  invalid,
}: {
  score: number;
  message: string;
  invalid: boolean;
}) {
  const Icon = score >= 3 ? CircleCheck : CircleAlert;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              bar <= Math.max(score, 1) ? meterTone(score) : 'bg-track',
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'flex items-start gap-2 text-[15px]',
          textTone(score),
          invalid && 'font-semibold',
        )}
        aria-live="polite"
      >
        <Icon className="mt-0.5 size-4 flex-none" aria-hidden="true" />
        {message}
      </p>
    </div>
  );
}

/** One input for the 6-digit code: phones can fill it from the SMS, and pasting works. */
export function CodeField({
  value,
  onValueChange,
  ...props
}: Omit<FieldProps, 'onChange' | 'value' | 'icon'> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <TextField
      {...props}
      fieldClassName="field-code"
      value={value}
      onChange={(event) => onValueChange(OtpCode.clean(event.target.value))}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      maxLength={OtpCode.LENGTH + 4}
      placeholder={'0'.repeat(OtpCode.LENGTH)}
      spellCheck={false}
    />
  );
}
