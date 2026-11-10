import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { authContent } from '../content/auth-content';
import { GoogleLogo } from '../icons/google-logo';

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="auth-card flex flex-col gap-6">{children}</div>;
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-ink -my-2 inline-flex min-h-11 items-center gap-2 self-start text-[17px] font-bold hover:underline"
    >
      <ChevronLeft className="size-5" aria-hidden="true" />
      {children}
    </Link>
  );
}

/** Two bars and "Step 2 of 2". */
export function StepIndicator({ step, of, label }: { step: number; of: number; label: string }) {
  return (
    <div className="text-mute flex items-center gap-2 text-[15px] font-bold">
      <span className="flex gap-2" aria-hidden="true">
        {Array.from({ length: of }, (_, i) => (
          <span
            key={i}
            className={cn('h-1.5 w-7 rounded-full', i < step ? 'bg-cobalt' : 'bg-track')}
          />
        ))}
      </span>
      {label}
    </div>
  );
}

export function AuthHeading({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="display text-[38px] leading-[0.95]">{title}</h1>
      {children ? <p className="text-mute text-[17px] leading-normal">{children}</p> : null}
    </div>
  );
}

type NoticeTone = 'info' | 'error' | 'success';

/** Sunken info box; red for errors (announced to screen readers), green for success. */
export function Notice({
  icon: Icon = CircleAlert,
  tone = 'info',
  children,
  className,
}: {
  icon?: LucideIcon;
  tone?: NoticeTone;
  children: ReactNode;
  className?: string;
}) {
  const ToneIcon = tone === 'success' ? CircleCheck : Icon;
  return (
    <div
      role={tone === 'error' ? 'alert' : tone === 'success' ? 'status' : undefined}
      className={cn('notice', tone !== 'info' && `notice-${tone}`, className)}
    >
      <ToneIcon className="size-5" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Big yellow button; shows a spinner and its busy label while the request runs. */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
  chevron = true,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pending: boolean;
  pendingLabel: string;
  chevron?: boolean;
}) {
  return (
    <button
      type="submit"
      className={cn('btn btn-sun btn-block', className)}
      disabled={pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          {chevron ? <ChevronRight className="size-5" aria-hidden="true" /> : null}
        </>
      )}
    </button>
  );
}

export function GoogleButton({
  children,
  onClick,
  pending,
}: {
  children: ReactNode;
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      className="btn-google"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleLogo />
      )}
      {children}
    </button>
  );
}

export function OrDivider({ children }: { children: ReactNode }) {
  return (
    <div className="text-mute flex items-center gap-4 text-[15px] font-semibold">
      <span className="bg-rule h-px flex-1" aria-hidden="true" />
      {children}
      <span className="bg-rule h-px flex-1" aria-hidden="true" />
    </div>
  );
}

/** Staging/preview only: how to reach each state of the fake sign-in. */
export function PreviewTips() {
  const { preview } = authContent;
  return (
    <details className="text-mute border-rule rounded-[14px] border-2 border-dashed px-4 py-2 text-[14px]">
      <summary className="min-h-9 cursor-pointer py-2 font-bold">{preview.summary}</summary>
      <ul className="mb-2 flex list-disc flex-col gap-1 pl-5">
        {preview.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </details>
  );
}
