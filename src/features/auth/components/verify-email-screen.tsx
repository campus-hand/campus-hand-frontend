'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { authContent, authErrorMessage } from '../content/auth-content';
import { CodeDetails } from '../models/auth-forms';
import type { CodeChannel } from '../models/auth-flow-store';
import { UgandaPhoneNumber } from '../models/contact';
import { systemClock } from '../models/otp-code';
import { ReturnTo } from '../models/return-to';
import {
  useAuthClient,
  useAuthFlow,
  useRequest,
  useResendCountdown,
  useReturnTo,
} from './auth-hooks';
import {
  AuthCard,
  AuthHeading,
  BackLink,
  Notice,
  PreviewTips,
  StepIndicator,
  SubmitButton,
} from './auth-ui';
import { CodeField } from './fields';
import { ErrorNotice, MissingStep, ResendRow } from './screen-parts';

const copy = authContent.verify;
const CODE_ERRORS = new Set(['invalid_code', 'expired_code', 'too_many_attempts']);

/** Step 2 of sign-up: the 6-digit code from the email (or SMS). */
export function VerifyEmailScreen() {
  const client = useAuthClient();
  const router = useRouter();
  const returnTo = useReturnTo();
  const { flow, store } = useAuthFlow();
  const verify = useRequest();
  const resend = useRequest();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [resent, setResent] = useState(false);
  const countdown = useResendCountdown(flow?.codeSentAt);

  if (flow === null || (flow && !flow.email)) {
    return (
      <MissingStep
        title={copy.missingTitle}
        text={copy.missingText}
        actionHref={ReturnTo.append(SiteRoutes.signup, returnTo)}
        actionLabel={authContent.signUp.submit}
      />
    );
  }

  const email = flow?.email ?? '';
  const phone = flow?.phone ? UgandaPhoneNumber.parse(flow.phone) : null;
  const channel: CodeChannel = flow?.channel === 'sms' && phone ? 'sms' : 'email';
  const fromLogIn = flow?.reason === 'unverified';
  const other: CodeChannel | null = channel === 'sms' ? 'email' : phone ? 'sms' : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = CodeDetails.check({ code });
    if (!checked.ok) {
      setCodeError(checked.errors.code);
      document.getElementById('verify-code')?.focus();
      return;
    }
    setCodeError(undefined);
    const result = await verify.run(
      () => client.verifyContact({ channel, email, phone: phone?.e164, code: checked.value }),
      { holdOnSuccess: true },
    );
    if (!result.ok) {
      if (CODE_ERRORS.has(result.error)) {
        setCodeError(authErrorMessage(result.error, result.retryAfterSeconds));
        document.getElementById('verify-code')?.focus();
      }
      return;
    }
    store?.clear();
    router.replace(returnTo);
  }

  async function sendCode(via: CodeChannel) {
    setResent(false);
    const result = await resend.run(() =>
      client.sendVerificationCode({ channel: via, email, phone: phone?.e164 }),
    );
    if (!result.ok) return;
    store?.update({ channel: via, codeSentAt: systemClock.now() });
    setCode('');
    setCodeError(undefined);
    setResent(true);
  }

  const backHref = ReturnTo.append(fromLogIn ? SiteRoutes.login : SiteRoutes.signup, returnTo);
  const changeHref = `${ReturnTo.append(SiteRoutes.signup, returnTo)}#${channel === 'sms' ? 'phone' : 'email'}`;
  const verifyError = verify.error && !CODE_ERRORS.has(verify.error.code) ? verify.error : null;

  return (
    <AuthCard>
      <BackLink href={backHref}>{copy.back}</BackLink>
      <div className="flex flex-col gap-3">
        {fromLogIn ? null : <StepIndicator step={2} of={2} label={copy.step} />}
        <AuthHeading title={channel === 'sms' ? copy.titleSms : copy.titleEmail}>
          {channel === 'sms' ? copy.sentSmsBefore : copy.sentEmailBefore}{' '}
          <b className="text-ink break-all">{channel === 'sms' ? phone?.display() : email}</b>
          {copy.sentAfter}
        </AuthHeading>
      </div>
      {fromLogIn ? <Notice>{copy.unverifiedNote}</Notice> : null}

      <form noValidate onSubmit={submit} className="flex flex-col gap-6">
        <CodeField
          id="verify-code"
          label={copy.codeLabel}
          value={code}
          onValueChange={(value) => {
            setCode(value);
            setCodeError(undefined);
          }}
          error={codeError}
        />
        <ErrorNotice error={verifyError} />
        <SubmitButton pending={verify.pending} pendingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>
      </form>

      <ResendRow
        countdown={countdown}
        pending={resend.pending}
        onResend={() => sendCode(channel)}
        aside={
          other ? (
            <button
              type="button"
              className="auth-link min-h-11"
              onClick={() => sendCode(other)}
              disabled={resend.pending}
            >
              {other === 'sms' ? copy.useSms : copy.useEmail}
            </button>
          ) : null
        }
      />
      {resent ? <Notice tone="success">{copy.resent}</Notice> : null}
      <ErrorNotice error={resend.error} />

      <Notice>
        {channel === 'sms' ? copy.helpSmsBefore : copy.helpEmailBefore}{' '}
        <a href={changeHref} className="auth-link">
          {copy.changeIt}
        </a>
        .
      </Notice>
      {client.mode === 'preview' ? <PreviewTips /> : null}
    </AuthCard>
  );
}
