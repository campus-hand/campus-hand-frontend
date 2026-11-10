import {
  type AuthClient,
  type AuthResult,
  fail,
  type LogInOutcome,
  ok,
  type SignUpInput,
  type VerifyInput,
} from './auth-client';
import { EmailAddress, type Identifier } from './contact';
import { PasswordStrength } from './password-strength';

/**
 * Stand-in for the API until its sign-in feature exists, so the screens can
 * be clicked through on staging and tested. Nothing is saved.
 *
 * Rules (also shown in the preview tips on each screen):
 * - code 123456 works, 000000 has expired, 999999 means too many tries;
 * - an email containing "taken" is already used;
 * - a password starting with "wrong" does not match;
 * - logging in with "unverified" in the email asks to confirm it first;
 * - logging in with "busy" in the email or phone shows the other-device screen.
 */
export class PreviewAuthClient implements AuthClient {
  static readonly CODE = '123456';
  readonly mode = 'preview' as const;

  constructor(
    private readonly delayMs = 700,
    private readonly now: () => number = () => Date.now(),
  ) {}

  async signUp(input: SignUpInput): Promise<AuthResult> {
    await this.wait();
    if (input.email.includes('taken')) return fail('email_taken');
    if (!PasswordStrength.assess(input.password).acceptable) return fail('weak_password');
    return ok();
  }

  async sendVerificationCode(): Promise<AuthResult> {
    await this.wait();
    return ok();
  }

  async verifyContact(input: VerifyInput): Promise<AuthResult> {
    await this.wait();
    return this.checkCode(input.code);
  }

  async logIn(input: {
    identifier: Identifier;
    password: string;
  }): Promise<AuthResult<LogInOutcome>> {
    await this.wait();
    const { identifier, password } = input;
    if (password.toLowerCase().startsWith('wrong')) return fail('invalid_credentials');
    if (identifier.value.includes('unverified')) {
      return ok({ status: 'verify_email', email: identifier.value });
    }
    if (identifier.value.includes('busy') || identifier.value.endsWith('000')) {
      const email = identifier.kind === 'email' ? identifier.value : 'nakato.sarah@gmail.com';
      return ok({
        status: 'other_device',
        maskedEmail: EmailAddress.mask(email),
        device: {
          name: 'Tecno Spark 20, Chrome',
          lastActiveAt: new Date(this.now() - 2 * 3_600_000).toISOString(),
          place: 'Kampala',
        },
      });
    }
    return ok({ status: 'signed_in' });
  }

  async requestPasswordReset(): Promise<AuthResult> {
    await this.wait();
    return ok();
  }

  async resetPassword(input: { code: string; password: string }): Promise<AuthResult> {
    await this.wait();
    if (!PasswordStrength.assess(input.password).acceptable) return fail('weak_password');
    return this.checkCode(input.code);
  }

  async takeOverDevice(input: { code: string }): Promise<AuthResult> {
    await this.wait();
    return this.checkCode(input.code);
  }

  async googleSignInUrl(): Promise<AuthResult<string>> {
    await this.wait();
    return fail('not_available');
  }

  private checkCode(code: string): AuthResult {
    if (code === '000000') return fail('expired_code');
    if (code === '999999') return fail('too_many_attempts', 600);
    return code === PreviewAuthClient.CODE ? ok() : fail('invalid_code');
  }

  private wait(): Promise<void> {
    return this.delayMs > 0
      ? new Promise((resolve) => setTimeout(resolve, this.delayMs))
      : Promise.resolve();
  }
}
