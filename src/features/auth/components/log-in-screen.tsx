'use client';

import { Mail, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { authContent } from '../content/auth-content';
import {
  type FieldErrors,
  LogInDetails,
  type LogInField,
  withoutField,
} from '../models/auth-forms';
import { SignInIdentifier } from '../models/contact';
import { systemClock } from '../models/otp-code';
import { ReturnTo } from '../models/return-to';
import { useAuthClient, useAuthFlow, useRequest, useReturnTo } from './auth-hooks';
import {
  AuthCard,
  AuthHeading,
  GoogleButton,
  Notice,
  OrDivider,
  PreviewTips,
  SubmitButton,
} from './auth-ui';
import { PasswordField, TextField } from './fields';
import { ErrorNotice, focusFirstInvalid, useGoogleSignIn } from './screen-parts';

const FIELDS: readonly LogInField[] = ['identifier', 'password'];
const copy = authContent.logIn;

export function LogInScreen() {
  const client = useAuthClient();
  const router = useRouter();
  const returnTo = useReturnTo();
  const { store } = useAuthFlow();
  const google = useGoogleSignIn();
  const { pending, error, run } = useRequest();
  const [values, setValues] = useState<Record<LogInField, string>>({
    identifier: '',
    password: '',
  });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FieldErrors<LogInField>>({});

  function change(field: LogInField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => withoutField(current, field));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = LogInDetails.check(values);
    if (!checked.ok) {
      setErrors(checked.errors);
      focusFirstInvalid('login', FIELDS, checked.errors);
      return;
    }
    setErrors({});
    const { identifier, password } = checked.value;
    const result = await run(() => client.logIn({ identifier, password, remember }), {
      holdOnSuccess: true,
    });
    if (!result.ok) return;

    const outcome = result.value;
    if (outcome.status === 'signed_in') {
      store?.clear();
      router.replace(returnTo);
    } else if (outcome.status === 'verify_email') {
      store?.start({
        email: outcome.email,
        channel: 'email',
        codeSentAt: systemClock.now(),
        reason: 'unverified',
      });
      router.push(ReturnTo.append(SiteRoutes.verifyEmail, returnTo));
    } else {
      store?.start({
        identifier,
        device: outcome.device,
        maskedEmail: outcome.maskedEmail,
        codeSentAt: systemClock.now(),
      });
      router.push(ReturnTo.append(SiteRoutes.otherDevice, returnTo));
    }
  }

  /** Carries what was typed over to "Forgot password?". */
  function rememberIdentifier() {
    const identifier = SignInIdentifier.parse(values.identifier);
    if (identifier) store?.start({ identifier });
    else store?.clear();
  }

  const forgotHref = ReturnTo.append(SiteRoutes.forgotPassword, returnTo);

  return (
    <AuthCard>
      <AuthHeading title={copy.title}>{copy.lead}</AuthHeading>

      <GoogleButton onClick={google.start} pending={google.pending}>
        {copy.google}
      </GoogleButton>
      <ErrorNotice error={google.error} />
      <OrDivider>{copy.divider}</OrDivider>

      <form noValidate onSubmit={submit} className="flex flex-col gap-6">
        <TextField
          id="login-identifier"
          label={copy.identifierLabel}
          icon={Mail}
          type="text"
          inputMode="email"
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          placeholder={copy.identifierPlaceholder}
          value={values.identifier}
          onChange={(e) => change('identifier', e.target.value)}
          error={errors.identifier}
        />
        <PasswordField
          id="login-password"
          label={copy.passwordLabel}
          autoComplete="current-password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={(e) => change('password', e.target.value)}
          error={errors.password}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[16px]">
            <input
              type="checkbox"
              className="accent-cobalt dark:accent-link size-[22px]"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {copy.remember}
          </label>
          <Link
            href={forgotHref}
            onClick={rememberIdentifier}
            className="auth-link py-2.5 text-[16px]"
          >
            {copy.forgot}
          </Link>
        </div>

        <ErrorNotice error={error}>
          {error?.code === 'invalid_credentials' ? (
            <Link href={forgotHref} onClick={rememberIdentifier} className="auth-link">
              {authContent.otherDevice.resetLink}
            </Link>
          ) : null}
        </ErrorNotice>

        <SubmitButton pending={pending} pendingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>
      </form>

      <Notice icon={Smartphone}>{copy.oneDevice}</Notice>

      <p className="text-center text-[17px]">
        {copy.newHere}{' '}
        <Link href={ReturnTo.append(SiteRoutes.signup, returnTo)} className="auth-link">
          {copy.createAccount}
        </Link>
      </p>
      {client.mode === 'preview' ? <PreviewTips /> : null}
    </AuthCard>
  );
}
