import { describe, expect, it } from 'vitest';
import type { PreferenceStorage } from '@/features/theme/theme-store';
import { authErrorMessage } from '../content/auth-content';
import { AuthFlowStore } from './auth-flow-store';
import {
  CodeDetails,
  LogInDetails,
  NewPasswordDetails,
  ResetRequestDetails,
  SignUpDetails,
  withoutField,
} from './auth-forms';
import { ApiAuthClient } from './api-auth-client';
import { EmailAddress, SignInIdentifier, UgandaPhoneNumber } from './contact';
import { createAuthClient } from './create-auth-client';
import { DeviceSession } from './device-session';
import { OtpCode, ResendCountdown } from './otp-code';
import { PasswordStrength } from './password-strength';
import { PreviewAuthClient } from './preview-auth-client';
import { ReturnTo } from './return-to';

const clockAt = (ms: number) => ({ now: () => ms });

describe('PasswordStrength', () => {
  it('rejects short, common and predictable passwords', () => {
    expect(PasswordStrength.assess('').acceptable).toBe(false);
    expect(PasswordStrength.assess('short1').message).toMatch(/at least 8/);
    expect(PasswordStrength.assess('password123').score).toBe(0);
    expect(PasswordStrength.assess('11111111').score).toBe(0);
    expect(PasswordStrength.assess('12345678').score).toBe(0);
    expect(PasswordStrength.assess('abcdefgh').score).toBe(0);
  });

  it('does not accept the person’s own name or email', () => {
    const result = PasswordStrength.assess('nakato2026!', [
      'Nakato Sarah',
      'nakato.sarah@gmail.com',
    ]);
    expect(result.acceptable).toBe(false);
    expect(result.message).toMatch(/name or email/);
  });

  it('scores length and variety, so phrases come out strongest', () => {
    expect(PasswordStrength.assess('kampalarain').score).toBe(1);
    expect(PasswordStrength.assess('Kampala-rain7').label).toBe('Good');
    expect(PasswordStrength.assess('mango tea at 4pm').label).toBe('Strong');
    expect(PasswordStrength.assess('kampalarainfall').acceptable).toBe(true);
  });
});

describe('contact details', () => {
  it('parses and masks email addresses', () => {
    expect(EmailAddress.parse('  Nakato.Sarah@Gmail.com ')?.value).toBe('nakato.sarah@gmail.com');
    expect(EmailAddress.parse('nakato@gmail')).toBeNull();
    expect(EmailAddress.mask('nakato.sarah@gmail.com')).toBe('n•••••@gmail.com');
    expect(EmailAddress.mask('not-an-email')).toBe('not-an-email');
  });

  it.each(['0772 123 456', '772123456', '+256 772 123 456', '256772123456', '(0772)-123-456'])(
    'reads %s as a Ugandan mobile number',
    (input) => {
      expect(UgandaPhoneNumber.parse(input)?.e164).toBe('+256772123456');
    },
  );

  it('rejects numbers that are not Ugandan mobiles', () => {
    expect(UgandaPhoneNumber.parse('0412 123 456')).toBeNull(); // landline
    expect(UgandaPhoneNumber.parse('77212345')).toBeNull();
    expect(UgandaPhoneNumber.parse('+254712345678')).toBeNull();
  });

  it('formats phone numbers for display and masking', () => {
    const phone = UgandaPhoneNumber.parse('0772123456')!;
    expect(phone.display()).toBe('+256 772 123 456');
    expect(phone.masked()).toBe('+256 7•• ••• 456');
  });

  it('tells email from phone in "Email or phone"', () => {
    expect(SignInIdentifier.parse('NAKATO@gmail.com')).toEqual({
      kind: 'email',
      value: 'nakato@gmail.com',
    });
    expect(SignInIdentifier.parse('0772 123 456')).toEqual({
      kind: 'phone',
      value: '+256772123456',
    });
    expect(SignInIdentifier.parse('nakato@')).toBeNull();
    expect(SignInIdentifier.parse('hello')).toBeNull();
    expect(SignInIdentifier.mask({ kind: 'phone', value: '+256772123456' })).toBe(
      '+256 7•• ••• 456',
    );
    expect(SignInIdentifier.mask({ kind: 'email', value: 'sarah@mak.ac.ug' })).toBe(
      's•••••@mak.ac.ug',
    );
  });
});

describe('codes and resending', () => {
  it('keeps only the first six digits of what was typed or pasted', () => {
    expect(OtpCode.clean('Code: 519 384')).toBe('519384');
    expect(OtpCode.clean('51938499')).toBe('519384');
    expect(OtpCode.isComplete('519384')).toBe(true);
    expect(OtpCode.isComplete('5193')).toBe(false);
  });

  it('counts down 60 seconds before another code can be sent', () => {
    expect(new ResendCountdown(undefined).canResend()).toBe(true);
    const countdown = new ResendCountdown(1_000, clockAt(1_000 + 18_000));
    expect(countdown.remainingSeconds()).toBe(42);
    expect(countdown.label()).toBe('0:42');
    expect(new ResendCountdown(0, clockAt(61_000)).canResend()).toBe(true);
    expect(new ResendCountdown(0, clockAt(0), 125).label()).toBe('2:05');
  });
});

describe('ReturnTo', () => {
  it('keeps paths on this site', () => {
    expect(ReturnTo.sanitise('/notes/csc-1100?page=3#q2')).toBe('/notes/csc-1100?page=3#q2');
    expect(ReturnTo.fromSearch('?returnTo=%2Fpast-papers')).toBe('/past-papers');
  });

  it.each([
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '/login',
    '/signup/verify',
    '/forgot-password/reset',
  ])('sends %s home instead', (value) => {
    expect(ReturnTo.sanitise(value)).toBe('/');
  });

  it('adds ?returnTo= only when it goes somewhere other than home', () => {
    expect(ReturnTo.append('/login', '/')).toBe('/login');
    expect(ReturnTo.append('/login', '/notes/a b')).toBe('/login?returnTo=%2Fnotes%2Fa%2520b');
  });
});

describe('DeviceSession', () => {
  const now = Date.parse('2026-11-10T12:00:00Z');
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

  it('describes when the other device was last used', () => {
    const device = (lastActiveAt: string, place?: string) =>
      new DeviceSession({ name: 'Tecno Spark 20, Chrome', lastActiveAt, place }, clockAt(now));
    expect(device(at(120), 'Kampala').lastActiveLabel()).toBe('Last active 2 hours ago, Kampala');
    expect(device(at(5)).lastActiveLabel()).toBe('Last active 5 minutes ago');
    expect(device(at(0)).lastActiveLabel()).toBe('Last active just now');
    expect(device(at(60 * 24 * 3)).lastActiveLabel()).toBe('Last active 3 days ago');
    expect(device('not a date').lastActiveLabel()).toBe('Last active recently');
  });
});

class MemoryStorage implements PreferenceStorage {
  readonly data = new Map<string, string>();
  getItem = (key: string) => this.data.get(key) ?? null;
  setItem = (key: string, value: string) => void this.data.set(key, value);
  removeItem = (key: string) => void this.data.delete(key);
}

describe('AuthFlowStore', () => {
  it('starts, merges and clears the hand-over state, notifying listeners', () => {
    const storage = new MemoryStorage();
    const store = new AuthFlowStore(storage);
    let calls = 0;
    const off = store.subscribe(() => calls++);

    expect(store.getSnapshot()).toBeNull();
    store.start({ email: 'a@b.co', channel: 'email' });
    store.update({ channel: 'sms' });
    expect(store.getSnapshot()).toEqual({ email: 'a@b.co', channel: 'sms' });
    expect(store.getSnapshot()).toBe(store.getSnapshot()); // stable for useSyncExternalStore
    expect(storage.data.get(AuthFlowStore.KEY)).toContain('sms');

    store.clear();
    expect(store.getSnapshot()).toBeNull();
    expect(calls).toBe(3);
    off();
  });

  it('ignores damaged data and survives blocked storage', () => {
    expect(AuthFlowStore.parse('{oops')).toBeNull();
    expect(AuthFlowStore.parse('[1]')).toBeNull();
    const blocked: PreferenceStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    const store = new AuthFlowStore(blocked);
    store.start({ email: 'a@b.co' });
    expect(store.getSnapshot()).toEqual({ email: 'a@b.co' });
    expect(() => store.clear()).not.toThrow();
    expect(store.getSnapshot()).toBeNull();
  });
});

describe('form checks', () => {
  it('lists every problem on the sign-up form', () => {
    const result = SignUpDetails.check({ name: ' ', email: 'x', password: 'short', phone: '123' });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(Object.keys(result.errors)).toEqual(['name', 'email', 'password', 'phone']);
  });

  it('cleans a good sign-up (phone optional)', () => {
    const base = {
      name: ' Nakato   Sarah ',
      email: 'Nakato@Gmail.com',
      password: 'mango tea at 4pm',
    };
    expect(SignUpDetails.check({ ...base, phone: '' })).toEqual({
      ok: true,
      value: { name: 'Nakato Sarah', email: 'nakato@gmail.com', password: 'mango tea at 4pm' },
    });
    const withPhone = SignUpDetails.check({ ...base, phone: '0772 123 456' });
    expect(withPhone.ok && withPhone.value.phone).toBe('+256772123456');
  });

  it('checks log-in, reset requests, codes and new passwords', () => {
    expect(LogInDetails.check({ identifier: 'nope', password: '' })).toEqual({
      ok: false,
      errors: {
        identifier: expect.stringMatching(/email/),
        password: expect.stringMatching(/password/),
      },
    });
    expect(LogInDetails.check({ identifier: '0772123456', password: 'x' }).ok).toBe(true);
    expect(ResetRequestDetails.check({ identifier: 'a@b.co' })).toEqual({
      ok: true,
      value: { kind: 'email', value: 'a@b.co' },
    });
    expect(ResetRequestDetails.check({ identifier: '' }).ok).toBe(false);
    expect(CodeDetails.check({ code: '519 384' })).toEqual({ ok: true, value: '519384' });
    expect(CodeDetails.check({ code: '519' }).ok).toBe(false);
    const weak = NewPasswordDetails.check({ code: '1', password: 'sarah123' }, ['sarah@x.co']);
    expect(weak.ok === false && Object.keys(weak.errors)).toEqual(['code', 'password']);
    expect(NewPasswordDetails.check({ code: '519384', password: 'mango tea at 4pm' }).ok).toBe(
      true,
    );
  });

  it('drops one field’s message when it is edited', () => {
    expect(withoutField<'name' | 'email'>({ name: 'a', email: 'b' }, 'name')).toEqual({
      email: 'b',
    });
  });
});

describe('createAuthClient', () => {
  it('uses the preview until the API is switched on, and always the API in production', () => {
    expect(createAuthClient({ appEnv: 'staging' })).toBeInstanceOf(PreviewAuthClient);
    expect(createAuthClient({ appEnv: 'staging', mode: 'api' })).toBeInstanceOf(ApiAuthClient);
    expect(createAuthClient({ appEnv: 'production', mode: 'preview' })).toBeInstanceOf(
      ApiAuthClient,
    );
    expect(createAuthClient().mode).toBe('preview');
  });
});

describe('authErrorMessage', () => {
  it('adds the wait time to "too many tries" when the server gives one', () => {
    expect(authErrorMessage('too_many_attempts', 600)).toMatch(/Wait 10 minutes/);
    expect(authErrorMessage('too_many_attempts', 30)).toMatch(/Wait 1 minute,/);
    expect(authErrorMessage('network')).toMatch(/connection/);
  });
});

describe('PreviewAuthClient', () => {
  const client = new PreviewAuthClient(0, () => Date.parse('2026-11-10T12:00:00Z'));
  const email = (value: string) => ({ kind: 'email' as const, value });

  it('follows the documented preview rules', async () => {
    expect(
      await client.signUp({ name: 'N', email: 'taken@x.co', password: 'mango tea at 4pm' }),
    ).toEqual({
      ok: false,
      error: 'email_taken',
    });
    expect((await client.signUp({ name: 'N', email: 'a@x.co', password: 'short' })).ok).toBe(false);
    expect(
      (await client.signUp({ name: 'N', email: 'a@x.co', password: 'mango tea at 4pm' })).ok,
    ).toBe(true);
    expect((await client.sendVerificationCode()).ok).toBe(true);
    expect(
      await client.verifyContact({ channel: 'email', email: 'a@x.co', code: '000000' }),
    ).toEqual({
      ok: false,
      error: 'expired_code',
    });
    expect(await client.takeOverDevice({ code: '999999' })).toEqual({
      ok: false,
      error: 'too_many_attempts',
      retryAfterSeconds: 600,
    });
    expect((await client.takeOverDevice({ code: '123456' })).ok).toBe(true);
    expect((await client.requestPasswordReset()).ok).toBe(true);
    expect((await client.resetPassword({ code: '123456', password: 'weak' })).ok).toBe(false);
    expect((await client.googleSignInUrl()).ok).toBe(false);

    expect(await client.logIn({ identifier: email('a@x.co'), password: 'wrong one' })).toEqual({
      ok: false,
      error: 'invalid_credentials',
    });
    expect(await client.logIn({ identifier: email('unverified@x.co'), password: 'x' })).toEqual({
      ok: true,
      value: { status: 'verify_email', email: 'unverified@x.co' },
    });
    const busy = await client.logIn({
      identifier: { kind: 'phone', value: '+256772123000' },
      password: 'x',
    });
    expect(busy.ok && busy.value.status === 'other_device' && busy.value.maskedEmail).toBe(
      'n•••••@gmail.com',
    );
  });

  it('waits a little by default so loading states show on staging', async () => {
    const slow = new PreviewAuthClient(5);
    const started = Date.now();
    await slow.sendVerificationCode();
    expect(Date.now() - started).toBeGreaterThanOrEqual(4);
  });
});
