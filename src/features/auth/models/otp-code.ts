/** The 6-digit codes sent by email or SMS (sign-up, password reset, device switch). */
export class OtpCode {
  static readonly LENGTH = 6;
  /** How long a code works, shown in the copy ("It works for 10 minutes"). */
  static readonly LIFETIME_MINUTES = 10;

  /** Keeps digits only, so pasted text such as "519 384" or "Code: 519384" still works. */
  static clean(input: string): string {
    return input.replace(/\D/g, '').slice(0, OtpCode.LENGTH);
  }

  static isComplete(value: string): boolean {
    return new RegExp(`^\\d{${OtpCode.LENGTH}}$`).test(value);
  }
}

/** Lets tests control time. */
export interface Clock {
  now(): number;
}

export const systemClock: Clock = { now: () => Date.now() };

/** "Resend in 0:42": how long before another code may be sent. */
export class ResendCountdown {
  static readonly WAIT_SECONDS = 60;

  constructor(
    private readonly sentAt: number | null | undefined,
    private readonly clock: Clock = systemClock,
    private readonly waitSeconds = ResendCountdown.WAIT_SECONDS,
  ) {}

  remainingSeconds(): number {
    if (this.sentAt == null) return 0;
    const left = this.sentAt + this.waitSeconds * 1000 - this.clock.now();
    return Math.max(0, Math.ceil(left / 1000));
  }

  canResend(): boolean {
    return this.remainingSeconds() === 0;
  }

  /** "0:42" */
  label(): string {
    const seconds = this.remainingSeconds();
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
