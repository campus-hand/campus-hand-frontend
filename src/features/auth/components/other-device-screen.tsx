'use client';

import { CircleAlert, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { authContent, authErrorMessage } from '../content/auth-content';
import { CodeDetails } from '../models/auth-forms';
import { DeviceSession } from '../models/device-session';
import { ReturnTo } from '../models/return-to';
import { useAuthClient, useAuthFlow, useRequest, useReturnTo } from './auth-hooks';
import { AuthCard, AuthHeading, Notice, PreviewTips, SubmitButton } from './auth-ui';
import { CodeField } from './fields';
import { ErrorNotice, MissingStep } from './screen-parts';

const copy = authContent.otherDevice;
const CODE_ERRORS = new Set(['invalid_code', 'expired_code', 'too_many_attempts']);

/** One device at a time: sign the other device out with an emailed code. */
export function OtherDeviceScreen() {
  const client = useAuthClient();
  const router = useRouter();
  const returnTo = useReturnTo();
  const { flow, store } = useAuthFlow();
  const { pending, error, run } = useRequest();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();

  const loginHref = ReturnTo.append(SiteRoutes.login, returnTo);

  if (flow === null || (flow && !flow.device)) {
    return (
      <MissingStep
        title={authContent.logIn.title}
        text={copy.missingText}
        actionHref={loginHref}
        actionLabel={copy.missingAction}
      />
    );
  }

  const device = flow?.device ? new DeviceSession(flow.device) : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = CodeDetails.check({ code });
    if (!checked.ok) {
      setCodeError(checked.errors.code);
      document.getElementById('device-code')?.focus();
      return;
    }
    setCodeError(undefined);
    const result = await run(() => client.takeOverDevice({ code: checked.value }), {
      holdOnSuccess: true,
    });
    if (!result.ok) {
      if (CODE_ERRORS.has(result.error)) {
        setCodeError(authErrorMessage(result.error, result.retryAfterSeconds));
        document.getElementById('device-code')?.focus();
      }
      return;
    }
    store?.clear();
    router.replace(returnTo);
  }

  function cancel() {
    store?.clear();
    router.replace(loginHref);
  }

  return (
    <AuthCard>
      <AuthHeading
        title={
          <>
            {copy.title[0]}
            <br />
            {copy.title[1]}
          </>
        }
      >
        {copy.lead}
      </AuthHeading>

      <div className="field min-h-[76px] gap-4 py-3 pl-3">
        <span className="bg-note-bg text-note-fg grid size-12 flex-none place-items-center rounded-[12px]">
          <Smartphone className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-ink font-bold">{device?.summary.name ?? '…'}</p>
          <p className="text-mute text-[15px]">{device?.lastActiveLabel() ?? ''}</p>
        </div>
      </div>

      <p className="text-ink text-[17px] leading-normal">
        {copy.instructionBefore} <b>{flow?.maskedEmail || 'your email'}</b>
        {copy.instructionAfter}
      </p>

      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <CodeField
          id="device-code"
          label={copy.codeLabel}
          value={code}
          onValueChange={(value) => {
            setCode(value);
            setCodeError(undefined);
          }}
          error={codeError}
        />
        <ErrorNotice error={error && !CODE_ERRORS.has(error.code) ? error : null} />
        <SubmitButton pending={pending} pendingLabel={copy.submitting} chevron={false}>
          {copy.submit}
        </SubmitButton>
        <button type="button" className="btn btn-line btn-block shadow-none" onClick={cancel}>
          {copy.cancel}
        </button>
      </form>

      <Notice icon={CircleAlert}>
        {copy.warningBefore}{' '}
        <Link href={ReturnTo.append(SiteRoutes.forgotPassword, returnTo)} className="auth-link">
          {copy.resetLink}
        </Link>
        .
      </Notice>
      {client.mode === 'preview' ? <PreviewTips /> : null}
    </AuthCard>
  );
}
