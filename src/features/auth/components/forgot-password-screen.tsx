'use client';

import { Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { authContent } from '../content/auth-content';
import { ResetRequestDetails } from '../models/auth-forms';
import { UgandaPhoneNumber } from '../models/contact';
import { systemClock } from '../models/otp-code';
import { ReturnTo } from '../models/return-to';
import { useAuthClient, useAuthFlow, useRequest, useReturnTo } from './auth-hooks';
import { AuthCard, AuthHeading, BackLink, Notice, PreviewTips, SubmitButton } from './auth-ui';
import { TextField } from './fields';
import { ErrorNotice, useGoogleSignIn } from './screen-parts';

const copy = authContent.forgot;

export function ForgotPasswordScreen() {
  const client = useAuthClient();
  const router = useRouter();
  const returnTo = useReturnTo();
  const { flow, store } = useAuthFlow();
  const google = useGoogleSignIn();
  const { pending, error, run } = useRequest();

  // Prefilled with what was typed on the log-in screen.
  const typed = flow?.identifier;
  const saved =
    typed?.kind === 'phone'
      ? (UgandaPhoneNumber.parse(typed.value)?.display() ?? '')
      : (typed?.value ?? '');
  const [edited, setEdited] = useState<string | null>(null);
  const value = edited ?? saved;
  const [fieldError, setFieldError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = ResetRequestDetails.check({ identifier: value });
    if (!checked.ok) {
      setFieldError(checked.errors.identifier);
      document.getElementById('forgot-identifier')?.focus();
      return;
    }
    setFieldError(undefined);
    const identifier = checked.value;
    const result = await run(() => client.requestPasswordReset({ identifier }), {
      holdOnSuccess: true,
    });
    if (!result.ok) return;
    store?.start({ identifier, codeSentAt: systemClock.now() });
    router.push(ReturnTo.append(SiteRoutes.resetPassword, returnTo));
  }

  return (
    <AuthCard>
      <BackLink href={ReturnTo.append(SiteRoutes.login, returnTo)}>{copy.back}</BackLink>
      <AuthHeading title={copy.title}>{copy.lead}</AuthHeading>

      <form noValidate onSubmit={submit} className="flex flex-col gap-6">
        <TextField
          id="forgot-identifier"
          label={copy.identifierLabel}
          icon={Mail}
          type="text"
          inputMode="email"
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          placeholder={copy.identifierPlaceholder}
          value={value}
          onChange={(e) => {
            setEdited(e.target.value);
            setFieldError(undefined);
          }}
          error={fieldError}
        />
        <ErrorNotice error={error} />
        <SubmitButton pending={pending} pendingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>
      </form>

      <Notice icon={ShieldCheck}>{copy.safety}</Notice>

      <div className="flex flex-col gap-3">
        <p className="text-center text-[17px]">
          {copy.googleBefore}{' '}
          <button
            type="button"
            className="auth-link min-h-11"
            onClick={google.start}
            disabled={google.pending}
            aria-busy={google.pending || undefined}
          >
            {copy.google}
          </button>
        </p>
        <ErrorNotice error={google.error} />
      </div>
      {client.mode === 'preview' ? <PreviewTips /> : null}
    </AuthCard>
  );
}
