import type { CodeChannel } from './auth-flow-store';
import type { Identifier } from './contact';
import type { DeviceSummary } from './device-session';

export type AuthErrorCode =
  | 'email_taken'
  | 'invalid_credentials'
  | 'invalid_code'
  | 'expired_code'
  | 'too_many_attempts'
  | 'weak_password'
  | 'not_available'
  | 'network'
  | 'unknown';

export type AuthResult<T = void> =
  { ok: true; value: T } | { ok: false; error: AuthErrorCode; retryAfterSeconds?: number };

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  /** +256XXXXXXXXX, only if given (for codes by SMS). */
  phone?: string;
}

export interface VerifyInput {
  channel: CodeChannel;
  email: string;
  phone?: string;
  code: string;
}

export type LogInOutcome =
  | { status: 'signed_in' }
  /** Account exists but the email was never confirmed; a new code has been sent. */
  | { status: 'verify_email'; email: string }
  /** Another device is signed in; a code to switch has been emailed. */
  | { status: 'other_device'; device: DeviceSummary; maskedEmail: string };

/**
 * Everything the sign-up, log-in and password screens need from the server.
 * Screens depend on this interface only, so tests and the staging preview can
 * use a fake while the API's sign-in feature is being built.
 */
export interface AuthClient {
  readonly mode: 'api' | 'preview';
  /** Creates the account and sends the email code. */
  signUp(input: SignUpInput): Promise<AuthResult>;
  sendVerificationCode(input: {
    channel: CodeChannel;
    email: string;
    phone?: string;
  }): Promise<AuthResult>;
  verifyContact(input: VerifyInput): Promise<AuthResult>;
  logIn(input: {
    identifier: Identifier;
    password: string;
    remember: boolean;
  }): Promise<AuthResult<LogInOutcome>>;
  /** Always succeeds for a well-formed email or phone (no hint whether an account exists). */
  requestPasswordReset(input: { identifier: Identifier }): Promise<AuthResult>;
  resetPassword(input: {
    identifier: Identifier;
    code: string;
    password: string;
  }): Promise<AuthResult>;
  /** Signs the other device out with the emailed code and signs in here. */
  takeOverDevice(input: { code: string }): Promise<AuthResult>;
  /** URL of Google's sign-in page; the browser goes there. */
  googleSignInUrl(returnTo: string): Promise<AuthResult<string>>;
}

export function fail(error: AuthErrorCode, retryAfterSeconds?: number): AuthResult<never> {
  return retryAfterSeconds ? { ok: false, error, retryAfterSeconds } : { ok: false, error };
}

export function ok(): AuthResult;
export function ok<T>(value: T): AuthResult<T>;
export function ok<T>(value?: T): AuthResult<T | undefined> {
  return { ok: true, value };
}
