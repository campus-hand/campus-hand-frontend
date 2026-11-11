import type { AuthErrorCode } from '../models/auth-client';

/**
 * Copy for the sign-up, log-in and password screens. Text from the design
 * canvas is used as-is; lines written for states the canvas does not show yet
 * (errors, loading, SMS, empty states) are marked TODO(content).
 */
export const authContent = {
  brandPanel: {
    signTitle: ['Pass every', 'course unit.'],
    signNote: 'Free to join. Pay only if you want more.',
    features: [
      {
        icon: 'notes',
        text: 'Notes and past papers for every course unit you are doing this semester',
      },
      { icon: 'magezi', text: 'Magezi explains pages, quizzes you and plans your revision' },
      { icon: 'people', text: 'Tutors and classmates from your own campus' },
    ],
  },

  signUp: {
    title: 'Create your account',
    lead: 'Free notes, past papers and Magezi for your university. Takes a minute.',
    google: 'Sign up with Google',
    divider: 'or with your email',
    nameLabel: 'Full name',
    emailLabel: 'Email',
    emailPlaceholder: 'you@gmail.com',
    emailHint: 'Any email works. You can verify as a student later.',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    phoneLabel: 'Phone',
    phoneOptional: '(optional)',
    phonePlaceholder: '7XX XXX XXX',
    phoneHint: 'For codes by SMS if email is slow. Never shown to others.',
    submit: 'Create account',
    submitting: 'Creating your account…', // TODO(content)
    consentBefore: 'By creating an account you agree to the',
    consentAnd: 'and',
    consentAfter: '. Magezi may learn from your questions; turn it off any time in Settings.',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    haveAccount: 'Already have an account?',
    logIn: 'Log in',
    emailTakenAction: 'Log in instead', // TODO(content)
  },

  verify: {
    step: 'Step 2 of 2',
    back: 'Back',
    titleEmail: 'Check your email',
    titleSms: 'Check your phone', // TODO(content)
    sentEmailBefore: 'We sent a 6-digit code to',
    sentSmsBefore: 'We sent a 6-digit code by SMS to', // TODO(content)
    sentAfter: '. It works for 10 minutes.',
    unverifiedNote:
      'Confirm your email to finish setting up your account. We just sent you a new code.', // TODO(content)
    codeLabel: 'Code',
    submit: 'Confirm and continue',
    submitting: 'Checking the code…', // TODO(content)
    resendIn: 'Resend in',
    resend: 'Resend code', // TODO(content)
    resent: 'New code sent.', // TODO(content)
    useSms: 'Send by SMS instead',
    useEmail: 'Send by email instead', // TODO(content)
    helpEmailBefore: 'Not there? Check Spam and Promotions. Wrong email?',
    helpSmsBefore: 'Not there? SMS can take a minute on busy networks. Wrong number?', // TODO(content)
    changeIt: 'Change it',
    missingTitle: 'Start again', // TODO(content)
    missingText:
      "We can't tell which email to check on this device. Sign up again, or log in if you already have an account.", // TODO(content)
  },

  logIn: {
    title: 'Welcome back',
    lead: 'Log in to your shelf, notes and Magezi.',
    google: 'Continue with Google',
    divider: 'or with your email',
    identifierLabel: 'Email or phone',
    identifierPlaceholder: 'you@gmail.com or 7XX XXX XXX',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    remember: 'Keep me logged in',
    forgot: 'Forgot password?',
    submit: 'Log in',
    submitting: 'Logging in…', // TODO(content)
    oneDevice: 'One device at a time. Logging in here may ask to sign out your other device.',
    newHere: 'New to Campus Hand?',
    createAccount: 'Create an account',
  },

  otherDevice: {
    title: ["You're signed in", 'on another device'],
    lead: 'Campus Hand stays on one device at a time, so your offline notes stay safe.',
    instructionBefore: 'To sign it out and continue here, enter the code we sent to',
    instructionAfter: ". You don't need the other phone.",
    codeLabel: 'Code',
    submit: 'Sign out the other device and continue',
    submitting: 'Signing out the other device…', // TODO(content)
    cancel: 'Cancel, stay signed out here',
    warningBefore: 'Offline notes on the other device are removed. Not you?',
    resetLink: 'Reset your password',
    missingText: 'This page opens after you log in. Log in again to continue.', // TODO(content)
    missingAction: 'Back to log in', // TODO(content)
  },

  forgot: {
    back: 'Back to log in',
    title: 'Forgot your password?',
    lead: "Enter the email or phone on your account. We'll send a 6-digit code to reset it.",
    identifierLabel: 'Email or phone',
    identifierPlaceholder: 'you@gmail.com or 7XX XXX XXX',
    submit: 'Send reset code',
    submitting: 'Sending the code…', // TODO(content)
    safety: 'For your safety we show the same message whether or not an account exists.',
    googleBefore: 'Signed up with Google?',
    google: 'Continue with Google',
  },

  reset: {
    back: 'Back',
    title: 'Set a new password',
    sentBefore: 'Code sent to',
    sentSmsAfter: ' by SMS', // TODO(content)
    codeLabel: 'Code',
    passwordLabel: 'New password',
    passwordPlaceholder: 'At least 8 characters',
    submit: 'Save and log in',
    submitting: 'Saving…', // TODO(content)
    signOutNote: "Saving signs you out everywhere else. We'll email you that the password changed.",
    missingText: 'Ask for a reset code first, then come back to set your new password.', // TODO(content)
    missingAction: 'Get a reset code', // TODO(content)
  },

  // TODO(content): field and server error messages (none are on the canvas yet).
  fieldErrors: {
    nameRequired: 'Enter your full name.',
    emailInvalid: 'Enter an email like you@gmail.com.',
    identifierInvalid: 'Enter your email, or a mobile number like 772 123 456.',
    phoneInvalid: 'Enter a mobile number like 772 123 456.',
    passwordRequired: 'Enter your password.',
    codeIncomplete: 'Enter all 6 digits of the code.',
  },

  errors: {
    email_taken: 'An account already uses this email.',
    invalid_credentials:
      "That email or phone and password don't match. Check them, or reset your password.",
    invalid_code: "That code isn't right. Check the newest message and try again.",
    expired_code: 'That code has expired. Send a new one and try again.',
    too_many_attempts: 'Too many tries. Wait a few minutes, then try again.',
    weak_password: 'Choose a stronger password. A short phrase you can remember works well.',
    not_available: "This isn't switched on yet. Please use your email for now.",
    network: "We couldn't reach Campus Hand. Check your connection and try again.",
    unknown: 'Something went wrong on our side. Please try again.',
  } satisfies Record<AuthErrorCode, string>,

  // Only shown on staging/preview builds (see PreviewAuthClient).
  preview: {
    summary: 'Preview mode: nothing is saved',
    tips: [
      'Any code is wrong except 123456. 000000 has expired; 999999 is too many tries.',
      'An email with "taken" in it is already used.',
      'A password starting with "wrong" does not match.',
      'Log in with "unverified" in the email to confirm it first, or "busy" to meet the other-device screen.',
    ],
  },
} as const;

/** Error line for a failed request; adds the wait time when the server gives one. */
export function authErrorMessage(error: AuthErrorCode, retryAfterSeconds?: number): string {
  if (error === 'too_many_attempts' && retryAfterSeconds) {
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    return `Too many tries. Wait ${minutes} minute${minutes === 1 ? '' : 's'}, then try again.`; // TODO(content)
  }
  return authContent.errors[error];
}
