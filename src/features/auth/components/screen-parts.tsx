'use client';

import { Clock3 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { authContent, authErrorMessage } from '../content/auth-content';
import type { ResendCountdown } from '../models/otp-code';
import { type FormError, useAuthClient, useRequest, useReturnTo } from './auth-hooks';
import { AuthCard, AuthHeading, Notice } from './auth-ui';

/** "Resend in 0:42" on the left (a Resend button once it reaches 0), an optional link on the right. */
export function ResendRow({
  countdown,
  onResend,
  pending,
  aside,
}: {
  countdown: ResendCountdown;
  onResend: () => void;
  pending: boolean;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[16px]">
      {countdown.canResend() ? (
        <button
          type="button"
          className="auth-link min-h-11"
          onClick={onResend}
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {authContent.verify.resend}
        </button>
      ) : (
        <p className="text-mute flex min-h-11 items-center gap-2">
          <Clock3 className="size-5" aria-hidden="true" />
          {authContent.verify.resendIn} {countdown.label()}
        </p>
      )}
      {aside}
    </div>
  );
}

/** Sends the browser to Google's sign-in page. */
export function useGoogleSignIn() {
  const client = useAuthClient();
  const returnTo = useReturnTo();
  const { pending, error, run } = useRequest();

  async function start() {
    const result = await run(() => client.googleSignInUrl(returnTo), { holdOnSuccess: true });
    if (result.ok) window.location.assign(result.value);
  }

  return { pending, error, start };
}

export function ErrorNotice({
  error,
  children,
}: {
  error: FormError | null;
  children?: ReactNode;
}) {
  if (!error) return null;
  return (
    <Notice tone="error">
      {authErrorMessage(error.code, error.retryAfterSeconds)}
      {children ? <> {children}</> : null}
    </Notice>
  );
}

/** Shown when a step is opened without the earlier one (new tab, cleared storage). */
export function MissingStep({
  title,
  text,
  actionHref,
  actionLabel,
}: {
  title: string;
  text: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <AuthCard>
      <AuthHeading title={title}>{text}</AuthHeading>
      <Link href={actionHref} className="btn btn-sun btn-block">
        {actionLabel}
      </Link>
    </AuthCard>
  );
}

/** Moves focus to the first field with an error after a failed submit. */
export function focusFirstInvalid(prefix: string, fields: readonly string[], errors: object) {
  const first = fields.find((field) => field in errors);
  if (first) document.getElementById(`${prefix}-${first}`)?.focus();
}
