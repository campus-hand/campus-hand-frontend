import { authContent } from '../content/auth-content';
import type { SignUpInput } from './auth-client';
import { EmailAddress, type Identifier, SignInIdentifier, UgandaPhoneNumber } from './contact';
import { OtpCode } from './otp-code';
import { PasswordStrength } from './password-strength';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** A checked form: either the clean input, or one message per bad field. */
export type Checked<K extends string, T> =
  { ok: true; value: T } | { ok: false; errors: FieldErrors<K> };

const messages = authContent.fieldErrors;

function finish<K extends string, T>(errors: FieldErrors<K>, build: () => T): Checked<K, T> {
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: build() };
}

export type SignUpField = 'name' | 'email' | 'password' | 'phone';

export class SignUpDetails {
  static check(values: Record<SignUpField, string>): Checked<SignUpField, SignUpInput> {
    const errors: FieldErrors<SignUpField> = {};
    const name = values.name.trim().replace(/\s+/g, ' ');
    const email = EmailAddress.parse(values.email);
    const phone = values.phone.trim() ? UgandaPhoneNumber.parse(values.phone) : null;
    const strength = PasswordStrength.assess(values.password, [name, values.email]);

    if (!name) errors.name = messages.nameRequired;
    if (!email) errors.email = messages.emailInvalid;
    if (!strength.acceptable) errors.password = strength.message;
    if (values.phone.trim() && !phone) errors.phone = messages.phoneInvalid;

    return finish(errors, () => ({
      name,
      email: email!.value,
      password: values.password,
      ...(phone ? { phone: phone.e164 } : {}),
    }));
  }
}

export type LogInField = 'identifier' | 'password';

export class LogInDetails {
  static check(
    values: Record<LogInField, string>,
  ): Checked<LogInField, { identifier: Identifier; password: string }> {
    const errors: FieldErrors<LogInField> = {};
    const identifier = SignInIdentifier.parse(values.identifier);
    if (!identifier) errors.identifier = messages.identifierInvalid;
    if (!values.password) errors.password = messages.passwordRequired;
    return finish(errors, () => ({ identifier: identifier!, password: values.password }));
  }
}

export class ResetRequestDetails {
  static check(values: { identifier: string }): Checked<'identifier', Identifier> {
    const identifier = SignInIdentifier.parse(values.identifier);
    return finish(identifier ? {} : { identifier: messages.identifierInvalid }, () => identifier!);
  }
}

export class CodeDetails {
  static check(values: { code: string }): Checked<'code', string> {
    const code = OtpCode.clean(values.code);
    return finish(OtpCode.isComplete(code) ? {} : { code: messages.codeIncomplete }, () => code);
  }
}

export type NewPasswordField = 'code' | 'password';

export class NewPasswordDetails {
  static check(
    values: Record<NewPasswordField, string>,
    personal: readonly string[] = [],
  ): Checked<NewPasswordField, { code: string; password: string }> {
    const errors: FieldErrors<NewPasswordField> = {};
    const code = OtpCode.clean(values.code);
    const strength = PasswordStrength.assess(values.password, personal);
    if (!OtpCode.isComplete(code)) errors.code = messages.codeIncomplete;
    if (!strength.acceptable) errors.password = strength.message;
    return finish(errors, () => ({ code, password: values.password }));
  }
}

/** Drops one field's message (when the person edits that field). */
export function withoutField<K extends string>(errors: FieldErrors<K>, field: K): FieldErrors<K> {
  const next = { ...errors };
  delete next[field];
  return next;
}
