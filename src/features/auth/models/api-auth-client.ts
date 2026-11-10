import {
  type AuthClient,
  type AuthErrorCode,
  type AuthResult,
  fail,
  type LogInOutcome,
  ok,
  type SignUpInput,
  type VerifyInput,
} from './auth-client';
import type { CodeChannel } from './auth-flow-store';
import type { Identifier } from './contact';
import type { DeviceSummary } from './device-session';

type Fetcher = (input: string, init: RequestInit) => Promise<Response>;

/** Server error codes (Better Auth style) mapped to what the screens show. */
const ERROR_CODES: Record<string, AuthErrorCode> = {
  USER_ALREADY_EXISTS: 'email_taken',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'email_taken',
  INVALID_EMAIL_OR_PASSWORD: 'invalid_credentials',
  INVALID_PHONE_NUMBER_OR_PASSWORD: 'invalid_credentials',
  INVALID_OTP: 'invalid_code',
  INVALID_CODE: 'invalid_code',
  OTP_EXPIRED: 'expired_code',
  CODE_EXPIRED: 'expired_code',
  TOO_MANY_ATTEMPTS: 'too_many_attempts',
  PASSWORD_TOO_SHORT: 'weak_password',
  PASSWORD_TOO_WEAK: 'weak_password',
};

/**
 * Talks to the Campus Hand API's /api/auth routes (Better Auth in NestJS).
 *
 * TODO(backend): the paths and bodies follow Better Auth's email+password,
 * email-otp and phone-number plugins. Confirm them when the API's sign-in
 * feature is built; /device/take-over and the OTHER_DEVICE_ACTIVE response are
 * Campus Hand additions for one device at a time.
 */
export class ApiAuthClient implements AuthClient {
  readonly mode = 'api' as const;

  constructor(
    private readonly apiUrl: string,
    private readonly siteUrl: string,
    private readonly fetcher: Fetcher = (input, init) => fetch(input, init),
  ) {}

  async signUp(input: SignUpInput): Promise<AuthResult> {
    const result = await this.post('/sign-up/email', {
      name: input.name,
      email: input.email,
      password: input.password,
      ...(input.phone ? { phoneNumber: input.phone } : {}),
    });
    return result.ok ? ok() : result;
  }

  async sendVerificationCode(input: {
    channel: CodeChannel;
    email: string;
    phone?: string;
  }): Promise<AuthResult> {
    const result =
      input.channel === 'sms'
        ? await this.post('/phone-number/send-otp', { phoneNumber: input.phone })
        : await this.post('/email-otp/send-verification-otp', {
            email: input.email,
            type: 'email-verification',
          });
    return result.ok ? ok() : result;
  }

  async verifyContact(input: VerifyInput): Promise<AuthResult> {
    const result =
      input.channel === 'sms'
        ? await this.post('/phone-number/verify', { phoneNumber: input.phone, code: input.code })
        : await this.post('/email-otp/verify-email', { email: input.email, otp: input.code });
    return result.ok ? ok() : result;
  }

  async logIn(input: {
    identifier: Identifier;
    password: string;
    remember: boolean;
  }): Promise<AuthResult<LogInOutcome>> {
    const { identifier, password, remember } = input;
    const path = identifier.kind === 'email' ? '/sign-in/email' : '/sign-in/phone-number';
    const body =
      identifier.kind === 'email'
        ? { email: identifier.value, password, rememberMe: remember }
        : { phoneNumber: identifier.value, password, rememberMe: remember };
    const response = await this.send(path, body);
    if (!response) return fail('network');
    const data = await ApiAuthClient.json(response);
    if (response.ok) return ok({ status: 'signed_in' });

    const code = ApiAuthClient.code(data);
    if (code === 'EMAIL_NOT_VERIFIED') {
      const email = typeof data?.email === 'string' ? data.email : identifier.value;
      return ok({ status: 'verify_email', email });
    }
    if (code === 'OTHER_DEVICE_ACTIVE' && data?.device) {
      return ok({
        status: 'other_device',
        device: data.device as DeviceSummary,
        maskedEmail: typeof data.maskedEmail === 'string' ? data.maskedEmail : '',
      });
    }
    return ApiAuthClient.failure(response, data);
  }

  async requestPasswordReset(input: { identifier: Identifier }): Promise<AuthResult> {
    const { identifier } = input;
    const result =
      identifier.kind === 'email'
        ? await this.post('/forget-password/email-otp', { email: identifier.value })
        : await this.post('/phone-number/request-password-reset', {
            phoneNumber: identifier.value,
          });
    return result.ok ? ok() : result;
  }

  async resetPassword(input: {
    identifier: Identifier;
    code: string;
    password: string;
  }): Promise<AuthResult> {
    const { identifier, code, password } = input;
    const result =
      identifier.kind === 'email'
        ? await this.post('/email-otp/reset-password', {
            email: identifier.value,
            otp: code,
            password,
          })
        : await this.post('/phone-number/reset-password', {
            phoneNumber: identifier.value,
            otp: code,
            newPassword: password,
          });
    return result.ok ? ok() : result;
  }

  async takeOverDevice(input: { code: string }): Promise<AuthResult> {
    const result = await this.post('/device/take-over', { otp: input.code });
    return result.ok ? ok() : result;
  }

  async googleSignInUrl(returnTo: string): Promise<AuthResult<string>> {
    const result = await this.post('/sign-in/social', {
      provider: 'google',
      callbackURL: new URL(returnTo, this.siteUrl).toString(),
      disableRedirect: true,
    });
    if (!result.ok) return result;
    const url = (result.value as { url?: unknown } | null)?.url;
    return typeof url === 'string' ? ok(url) : fail('unknown');
  }

  /** Maps an error response to a screen error. */
  static failure(response: Response, data: Record<string, unknown> | null): AuthResult<never> {
    const retryAfter = Number(response.headers.get('retry-after')) || undefined;
    const mapped = ERROR_CODES[ApiAuthClient.code(data) ?? ''];
    if (mapped) return fail(mapped, retryAfter);
    if (response.status === 429) return fail('too_many_attempts', retryAfter);
    if (response.status === 404) return fail('not_available');
    return fail('unknown');
  }

  private async post(path: string, body: unknown): Promise<AuthResult<unknown>> {
    const response = await this.send(path, body);
    if (!response) return fail('network');
    const data = await ApiAuthClient.json(response);
    return response.ok ? ok(data) : ApiAuthClient.failure(response, data);
  }

  private async send(path: string, body: unknown): Promise<Response | null> {
    try {
      return await this.fetcher(`${this.apiUrl}/api/auth${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      return null; // offline, DNS failure, CORS: the screens say "check your connection"
    }
  }

  private static code(data: Record<string, unknown> | null): string | undefined {
    return typeof data?.code === 'string' ? data.code.toUpperCase() : undefined;
  }

  private static async json(response: Response): Promise<Record<string, unknown> | null> {
    try {
      const data: unknown = await response.json();
      return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
}
