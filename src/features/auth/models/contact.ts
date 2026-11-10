const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** An email address, trimmed and lower-cased. */
export class EmailAddress {
  private constructor(readonly value: string) {}

  static parse(input: string): EmailAddress | null {
    const value = input.trim().toLowerCase();
    return EMAIL_PATTERN.test(value) ? new EmailAddress(value) : null;
  }

  /** "nakato.sarah@gmail.com" -> "n•••••@gmail.com", for screens other people may see. */
  static mask(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    return `${local.slice(0, 1)}•••••@${domain}`;
  }
}

/**
 * A Ugandan mobile number. Students type it many ways (0772 123 456,
 * 772123456, +256 772 123 456); everything is stored as +256XXXXXXXXX.
 */
export class UgandaPhoneNumber {
  static readonly COUNTRY_CODE = '+256';

  private constructor(readonly e164: string) {}

  static parse(input: string): UgandaPhoneNumber | null {
    const compact = input.replace(/[\s\-().]/g, '');
    const local = /^\+256\d{9}$/.test(compact)
      ? compact.slice(4)
      : /^256\d{9}$/.test(compact)
        ? compact.slice(3)
        : /^0\d{9}$/.test(compact)
          ? compact.slice(1)
          : /^\d{9}$/.test(compact)
            ? compact
            : null;
    // Ugandan mobile numbers start with 7 after the country code.
    if (!local || !/^7\d{8}$/.test(local)) return null;
    return new UgandaPhoneNumber(`${UgandaPhoneNumber.COUNTRY_CODE}${local}`);
  }

  /** "+256 772 123 456" */
  display(): string {
    const local = this.e164.slice(4);
    return `${UgandaPhoneNumber.COUNTRY_CODE} ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  /** "+256 7•• ••• 456" */
  masked(): string {
    const local = this.e164.slice(4);
    return `${UgandaPhoneNumber.COUNTRY_CODE} ${local.slice(0, 1)}•• ••• ${local.slice(6)}`;
  }
}

export type IdentifierKind = 'email' | 'phone';

/** What someone typed into "Email or phone". */
export interface Identifier {
  kind: IdentifierKind;
  /** Lower-case email, or the phone number as +256XXXXXXXXX. */
  value: string;
}

export class SignInIdentifier {
  static parse(input: string): Identifier | null {
    if (input.includes('@')) {
      const email = EmailAddress.parse(input);
      return email ? { kind: 'email', value: email.value } : null;
    }
    const phone = UgandaPhoneNumber.parse(input);
    return phone ? { kind: 'phone', value: phone.e164 } : null;
  }

  static mask(identifier: Identifier): string {
    if (identifier.kind === 'email') return EmailAddress.mask(identifier.value);
    return UgandaPhoneNumber.parse(identifier.value)?.masked() ?? identifier.value;
  }
}
