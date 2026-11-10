import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw/server';
import { ApiAuthClient } from './api-auth-client';

const API = 'http://api.test';
const auth = (path: string) => `${API}/api/auth${path}`;
const client = new ApiAuthClient(API, 'https://staging.campushand.com');
const email = { kind: 'email' as const, value: 'nakato@gmail.com' };
const phone = { kind: 'phone' as const, value: '+256772123456' };

/** Records the JSON body of each matching request. */
function capture(path: string, response: () => Response = () => HttpResponse.json({})) {
  const bodies: unknown[] = [];
  server.use(
    http.post(auth(path), async ({ request }) => {
      bodies.push(await request.json());
      return response();
    }),
  );
  return bodies;
}

describe('ApiAuthClient', () => {
  it('signs up with email + password and an optional phone', async () => {
    const bodies = capture('/sign-up/email');
    const result = await client.signUp({
      name: 'Nakato Sarah',
      email: 'nakato@gmail.com',
      password: 'mango tea at 4pm',
      phone: '+256772123456',
    });
    expect(result).toEqual({ ok: true, value: undefined });
    expect(bodies[0]).toEqual({
      name: 'Nakato Sarah',
      email: 'nakato@gmail.com',
      password: 'mango tea at 4pm',
      phoneNumber: '+256772123456',
    });
  });

  it('maps server error codes to screen errors', async () => {
    capture('/sign-up/email', () =>
      HttpResponse.json({ code: 'USER_ALREADY_EXISTS' }, { status: 422 }),
    );
    expect(await client.signUp({ name: 'N', email: 'a@b.co', password: 'x' })).toEqual({
      ok: false,
      error: 'email_taken',
    });
  });

  it('reads Retry-After on 429 and falls back on unknown errors', async () => {
    capture(
      '/email-otp/verify-email',
      () => new HttpResponse(null, { status: 429, headers: { 'retry-after': '120' } }),
    );
    expect(
      await client.verifyContact({ channel: 'email', email: 'a@b.co', code: '123456' }),
    ).toEqual({ ok: false, error: 'too_many_attempts', retryAfterSeconds: 120 });

    capture('/phone-number/verify', () => HttpResponse.text('boom', { status: 500 }));
    expect(
      await client.verifyContact({
        channel: 'sms',
        email: 'a@b.co',
        phone: '+256772123456',
        code: '1',
      }),
    ).toEqual({ ok: false, error: 'unknown' });

    capture('/device/take-over', () => new HttpResponse(null, { status: 404 }));
    expect(await client.takeOverDevice({ code: '123456' })).toEqual({
      ok: false,
      error: 'not_available',
    });
  });

  it('sends codes by email or SMS', async () => {
    const emailBodies = capture('/email-otp/send-verification-otp');
    const smsBodies = capture('/phone-number/send-otp');
    await client.sendVerificationCode({ channel: 'email', email: 'a@b.co' });
    await client.sendVerificationCode({ channel: 'sms', email: 'a@b.co', phone: '+256772123456' });
    expect(emailBodies[0]).toEqual({ email: 'a@b.co', type: 'email-verification' });
    expect(smsBodies[0]).toEqual({ phoneNumber: '+256772123456' });
  });

  it('logs in by email or phone', async () => {
    const emailBodies = capture('/sign-in/email');
    const phoneBodies = capture('/sign-in/phone-number');
    expect(await client.logIn({ identifier: email, password: 'pw', remember: true })).toEqual({
      ok: true,
      value: { status: 'signed_in' },
    });
    await client.logIn({ identifier: phone, password: 'pw', remember: false });
    expect(emailBodies[0]).toEqual({ email: 'nakato@gmail.com', password: 'pw', rememberMe: true });
    expect(phoneBodies[0]).toEqual({
      phoneNumber: '+256772123456',
      password: 'pw',
      rememberMe: false,
    });
  });

  it('turns "email not verified" and "other device" answers into next steps', async () => {
    capture('/sign-in/email', () =>
      HttpResponse.json({ code: 'EMAIL_NOT_VERIFIED' }, { status: 403 }),
    );
    expect(await client.logIn({ identifier: email, password: 'pw', remember: true })).toEqual({
      ok: true,
      value: { status: 'verify_email', email: 'nakato@gmail.com' },
    });

    const device = { name: 'Tecno Spark 20, Chrome', lastActiveAt: '2026-11-10T10:00:00Z' };
    capture('/sign-in/email', () =>
      HttpResponse.json(
        { code: 'OTHER_DEVICE_ACTIVE', device, maskedEmail: 'n•••••@gmail.com' },
        { status: 409 },
      ),
    );
    expect(await client.logIn({ identifier: email, password: 'pw', remember: true })).toEqual({
      ok: true,
      value: { status: 'other_device', device, maskedEmail: 'n•••••@gmail.com' },
    });

    capture('/sign-in/email', () =>
      HttpResponse.json({ code: 'INVALID_EMAIL_OR_PASSWORD' }, { status: 401 }),
    );
    expect(await client.logIn({ identifier: email, password: 'pw', remember: true })).toEqual({
      ok: false,
      error: 'invalid_credentials',
    });
  });

  it('requests and completes password resets by email or phone', async () => {
    const forgotEmail = capture('/forget-password/email-otp');
    const forgotPhone = capture('/phone-number/request-password-reset');
    const resetEmail = capture('/email-otp/reset-password');
    const resetPhone = capture('/phone-number/reset-password');
    await client.requestPasswordReset({ identifier: email });
    await client.requestPasswordReset({ identifier: phone });
    await client.resetPassword({ identifier: email, code: '519384', password: 'new pass phrase' });
    await client.resetPassword({ identifier: phone, code: '519384', password: 'new pass phrase' });
    expect(forgotEmail[0]).toEqual({ email: 'nakato@gmail.com' });
    expect(forgotPhone[0]).toEqual({ phoneNumber: '+256772123456' });
    expect(resetEmail[0]).toEqual({
      email: 'nakato@gmail.com',
      otp: '519384',
      password: 'new pass phrase',
    });
    expect(resetPhone[0]).toEqual({
      phoneNumber: '+256772123456',
      otp: '519384',
      newPassword: 'new pass phrase',
    });
  });

  it('asks for the Google sign-in URL with a full callback address', async () => {
    const bodies = capture('/sign-in/social', () =>
      HttpResponse.json({ url: 'https://accounts.google.com/o/oauth2' }),
    );
    expect(await client.googleSignInUrl('/notes/x')).toEqual({
      ok: true,
      value: 'https://accounts.google.com/o/oauth2',
    });
    expect(bodies[0]).toMatchObject({
      provider: 'google',
      callbackURL: 'https://staging.campushand.com/notes/x',
    });

    capture('/sign-in/social', () => HttpResponse.json({}));
    expect(await client.googleSignInUrl('/')).toEqual({ ok: false, error: 'unknown' });
  });

  it('reports a network error when the request cannot be made', async () => {
    const offline = new ApiAuthClient(API, 'https://x', () =>
      Promise.reject(new TypeError('offline')),
    );
    expect(await offline.signUp({ name: 'N', email: 'a@b.co', password: 'x' })).toEqual({
      ok: false,
      error: 'network',
    });
    expect(await offline.logIn({ identifier: email, password: 'pw', remember: true })).toEqual({
      ok: false,
      error: 'network',
    });
  });
});
