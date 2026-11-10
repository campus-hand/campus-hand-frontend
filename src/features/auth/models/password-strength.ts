export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface StrengthResult {
  score: StrengthScore;
  label: 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  message: string;
  /** Strong enough to save (Fair or better). */
  acceptable: boolean;
}

/** Passwords people pick first; checked in lower case. */
const COMMON = new Set([
  'password',
  'password1',
  'password123',
  'passw0rd',
  'iloveyou',
  'qwerty123',
  'qwertyuiop',
  'abcd1234',
  'abc12345',
  'letmein1',
  'welcome1',
  'campushand',
  'makerere',
  'kampala1',
  'uganda256',
]);

const LABELS: Record<StrengthScore, StrengthResult['label']> = {
  0: 'Too weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

// TODO(content): only the "Good" line comes from the design canvas.
const MESSAGES: Record<StrengthScore, string> = {
  0: "Too easy to guess. Try a short phrase you'll remember.",
  1: 'Weak. Add a few more words or characters.',
  2: 'Fair. A longer phrase would be stronger.',
  3: 'Good. Long phrases like "mango tea at 4pm" are even stronger.',
  4: 'Strong. Nice one.',
};

/**
 * Scores a password the way the sign-up and reset screens show it: four
 * bars and one short line of advice. Length counts most, so a phrase such as
 * "mango tea at 4pm" scores higher than "P@ssw0rd!".
 */
export class PasswordStrength {
  static readonly MIN_LENGTH = 8;

  static assess(password: string, personal: readonly string[] = []): StrengthResult {
    if (password.length < PasswordStrength.MIN_LENGTH) {
      return {
        score: 0,
        label: LABELS[0],
        message: `Too short. Use at least ${PasswordStrength.MIN_LENGTH} characters.`,
        acceptable: false,
      };
    }
    if (PasswordStrength.isPredictable(password)) return PasswordStrength.result(0);
    if (PasswordStrength.usesPersonalInfo(password, personal)) {
      return {
        score: 1,
        label: LABELS[1],
        message: 'Avoid your name or email. Try a short phrase instead.',
        acceptable: false,
      };
    }

    let score = 1;
    if (password.length >= 12) score += 1;
    if (PasswordStrength.characterKinds(password) >= 3) score += 1;
    const words = password.trim().split(/\s+/).length;
    if (password.length >= 16 || (words >= 3 && password.length >= 14)) score += 1;
    return PasswordStrength.result(Math.min(score, 4) as StrengthScore);
  }

  private static result(score: StrengthScore): StrengthResult {
    return { score, label: LABELS[score], message: MESSAGES[score], acceptable: score >= 2 };
  }

  private static isPredictable(password: string): boolean {
    const lower = password.toLowerCase();
    if (COMMON.has(lower)) return true;
    if (/^(.)\1+$/.test(lower)) return true; // 11111111, aaaaaaaa
    return '01234567890123456789'.includes(lower) || 'abcdefghijklmnopqrstuvwxyz'.includes(lower);
  }

  /** Names and email parts of 3+ letters must not appear in the password. */
  private static usesPersonalInfo(password: string, personal: readonly string[]): boolean {
    const lower = password.toLowerCase();
    return personal
      .flatMap((value) =>
        value
          .toLowerCase()
          .split('@')[0]
          .split(/[^a-z0-9]+/),
      )
      .some((part) => part.length >= 3 && lower.includes(part));
  }

  private static characterKinds(password: string): number {
    return [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((kind) => kind.test(password)).length;
  }
}
