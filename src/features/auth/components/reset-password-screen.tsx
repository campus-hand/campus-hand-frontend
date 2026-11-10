'use client';

import { LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { authContent, authErrorMessage } from '../content/auth-content';
import {
  type FieldErrors,
  NewPasswordDetails,
  type NewPasswordField,
  withoutField,
} from '../models/auth-forms';
import { SignInIdentifier } from '../models/contact';
import { systemClock } from '../models/otp-code';
import { ReturnTo } from '../models/return-to';
import {
  useAuthClient,
  useAuthFlow,
  useRequest,
  useResendCountdown,
  useReturnTo,
} from './auth-hooks';
import { AuthCard, AuthHeading, BackLink, Notice, PreviewTips, SubmitButton } from './auth-ui';
import { CodeField, PasswordField } from './fields';
import { ErrorNotice, focusFirstInvalid, MissingStep, ResendRow } from './screen-parts';

const copy = authContent.reset;
const FIELDS: readonly NewPasswordField[] = ['code', 'password'];
const CODE_ERRORS = new Set(['invalid_code', 'expired_code', 'too_many_attempts']);

export function ResetPasswordScreen() {
  const client = useAuthClient();
  const router = useRouter();
  const returnTo = useReturnTo();
  const { flow, store } = useAuthFlow();
  const save = useRequest();
  const resend = useRequest();
  const [values, setValues] = useState<Record<NewPasswordField, string>>({
    code: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors<NewPasswordField>>({});
  const [resent, setResent] = useState(false);
  const countdown = useResendCountdown(flow?.codeSentAt);

  const forgotHref = ReturnTo.append(SiteRoutes.forgotPassword, returnTo);

  if (flow === null || (flow && !flow.identifier)) {
    return (
      <MissingStep
        title={copy.title}
        text={copy.missingText}
        actionHref={forgotHref}
        actionLabel={copy.missingAction}
      />
    );
  }

  const identifier = flow?.identifier;

  function change(field: NewPasswordField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => withoutField(current, field));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identifier) return;
    const checked = NewPasswordDetails.check(values, [identifier.value]);
    if (!checked.ok) {
      setErrors(checked.errors);
      focusFirstInvalid('reset', FIELDS, checked.errors);
      return;
    }
    setErrors({});
    const result = await save.run(() => client.resetPassword({ identifier, ...checked.value }), {
      holdOnSuccess: true,
    });
    if (!result.ok) {
      if (CODE_ERRORS.has(result.error)) {
        setErrors({ code: authErrorMessage(result.error, result.retryAfterSeconds) });
        document.getElementById('reset-code')?.focus();
      } else if (result.error === 'weak_password') {
        setErrors({ password: authContent.errors.weak_password });
        document.getElementById('reset-password')?.focus();
      }
      return;
    }
    store?.clear();
    router.replace(returnTo);
  }

  async function resendCode() {
    if (!identifier) return;
    setResent(false);
    const result = await resend.run(() => client.requestPasswordReset({ identifier }));
    if (!result.ok) return;
    store?.update({ codeSentAt: systemClock.now() });
    setValues((current) => ({ ...current, code: '' }));
    setResent(true);
  }

  const shownError =
    save.error && !CODE_ERRORS.has(save.error.code) && save.error.code !== 'weak_password'
      ? save.error
      : null;

  return (
    <AuthCard>
      <BackLink href={forgotHref}>{copy.back}</BackLink>
      <AuthHeading title={copy.title}>
        {copy.sentBefore}{' '}
        <b className="text-ink break-all">{identifier ? SignInIdentifier.mask(identifier) : '…'}</b>
        {identifier?.kind === 'phone' ? copy.sentSmsAfter : ''}.
      </AuthHeading>

      <form noValidate onSubmit={submit} className="flex flex-col gap-6">
        <CodeField
          id="reset-code"
          label={copy.codeLabel}
          value={values.code}
          onValueChange={(value) => change('code', value)}
          error={errors.code}
        />
        <PasswordField
          id="reset-password"
          label={copy.passwordLabel}
          autoComplete="new-password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={(e) => change('password', e.target.value)}
          error={errors.password}
          showStrength
          personal={identifier ? [identifier.value] : []}
        />
        <ErrorNotice error={shownError} />
        <SubmitButton pending={save.pending} pendingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>
      </form>

      <ResendRow countdown={countdown} pending={resend.pending} onResend={resendCode} />
      {resent ? <Notice tone="success">{authContent.verify.resent}</Notice> : null}
      <ErrorNotice error={resend.error} />

      <Notice icon={LockKeyhole}>{copy.signOutNote}</Notice>
      {client.mode === 'preview' ? <PreviewTips /> : null}
    </AuthCard>
  );
}
