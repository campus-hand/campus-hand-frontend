'use client';

import { Mail, Smartphone, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { authContent } from '../content/auth-content';
import {
  type FieldErrors,
  SignUpDetails,
  type SignUpField,
  withoutField,
} from '../models/auth-forms';
import { UgandaPhoneNumber } from '../models/contact';
import { systemClock } from '../models/otp-code';
import { ReturnTo } from '../models/return-to';
import { useAuthClient, useAuthFlow, useRequest, useReturnTo } from './auth-hooks';
import {
  AuthCard,
  AuthHeading,
  GoogleButton,
  OrDivider,
  PreviewTips,
  SubmitButton,
} from './auth-ui';
import { PasswordField, TextField } from './fields';
import { ErrorNotice, focusFirstInvalid, useGoogleSignIn } from './screen-parts';

const FIELDS: readonly SignUpField[] = ['name', 'email', 'password', 'phone'];
const copy = authContent.signUp;

export function SignUpScreen() {
  const client = useAuthClient();
  const router = useRouter();
  const returnTo = useReturnTo();
  const { flow, store } = useAuthFlow();
  const google = useGoogleSignIn();
  const { pending, error, run } = useRequest();

  // Coming back from "Change it" or "Back": refill what was typed (never the password).
  const saved: Record<SignUpField, string> = {
    name: flow?.name ?? '',
    email: flow?.email ?? '',
    password: '',
    phone: flow?.phone ? (UgandaPhoneNumber.parse(flow.phone)?.display().slice(5) ?? '') : '',
  };
  const [edits, setEdits] = useState<Partial<Record<SignUpField, string>>>({});
  const values = { ...saved, ...edits };
  const [errors, setErrors] = useState<FieldErrors<SignUpField>>({});

  useEffect(() => {
    const field = window.location.hash.slice(1);
    if (field === 'email' || field === 'phone') document.getElementById(`signup-${field}`)?.focus();
  }, []);

  function change(field: SignUpField, value: string) {
    setEdits((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => withoutField(current, field));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = SignUpDetails.check(values);
    if (!checked.ok) {
      setErrors(checked.errors);
      focusFirstInvalid('signup', FIELDS, checked.errors);
      return;
    }
    setErrors({});
    const input = checked.value;
    const result = await run(() => client.signUp(input), { holdOnSuccess: true });
    if (!result.ok) {
      if (result.error === 'email_taken') {
        setErrors({ email: authContent.errors.email_taken });
        document.getElementById('signup-email')?.focus();
      }
      return;
    }
    store?.start({
      name: input.name,
      email: input.email,
      phone: input.phone,
      channel: 'email',
      codeSentAt: systemClock.now(),
    });
    router.push(ReturnTo.append(SiteRoutes.verifyEmail, returnTo));
  }

  const loginHref = ReturnTo.append(SiteRoutes.login, returnTo);

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
          id="signup-name"
          label={copy.nameLabel}
          icon={Users}
          autoComplete="name"
          placeholder={copy.namePlaceholder}
          value={values.name}
          onChange={(e) => change('name', e.target.value)}
          error={errors.name}
        />
        <TextField
          id="signup-email"
          label={copy.emailLabel}
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder={copy.emailPlaceholder}
          value={values.email}
          onChange={(e) => change('email', e.target.value)}
          error={errors.email}
          hint={copy.emailHint}
        />
        {errors.email === authContent.errors.email_taken ? (
          <p className="-mt-3 text-[15px]">
            <Link href={loginHref} className="auth-link">
              {copy.emailTakenAction}
            </Link>
          </p>
        ) : null}
        <PasswordField
          id="signup-password"
          label={copy.passwordLabel}
          autoComplete="new-password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={(e) => change('password', e.target.value)}
          error={errors.password}
          showStrength
          personal={[values.name, values.email]}
        />
        <TextField
          id="signup-phone"
          label={
            <>
              {copy.phoneLabel} <span className="text-mute font-normal">{copy.phoneOptional}</span>
            </>
          }
          icon={Smartphone}
          prefix={<span className="field-prefix">{UgandaPhoneNumber.COUNTRY_CODE}</span>}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={copy.phonePlaceholder}
          value={values.phone}
          onChange={(e) => change('phone', e.target.value)}
          error={errors.phone}
          hint={copy.phoneHint}
        />

        {error && error.code !== 'email_taken' ? <ErrorNotice error={error} /> : null}

        <SubmitButton pending={pending} pendingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>

        <p className="text-mute text-center text-[14px] leading-relaxed">
          {copy.consentBefore}{' '}
          <Link href={SiteRoutes.terms} className="auth-link">
            {copy.terms}
          </Link>{' '}
          {copy.consentAnd}{' '}
          <Link href={SiteRoutes.privacy} className="auth-link">
            {copy.privacy}
          </Link>
          {copy.consentAfter}
        </p>
      </form>

      <p className="text-center text-[17px]">
        {copy.haveAccount}{' '}
        <Link href={loginHref} className="auth-link">
          {copy.logIn}
        </Link>
      </p>
      {client.mode === 'preview' ? <PreviewTips /> : null}
    </AuthCard>
  );
}
