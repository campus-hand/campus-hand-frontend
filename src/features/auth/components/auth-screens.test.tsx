import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PreferenceStorage } from '@/features/theme/theme-store';
import { ThemePill } from '@/features/theme/theme-pill';
import type { AuthClient } from '../models/auth-client';
import { AuthFlowStore, type AuthFlowState } from '../models/auth-flow-store';
import { PreviewAuthClient } from '../models/preview-auth-client';
import { AuthLayout } from './auth-layout';
import { AuthProvider } from './auth-hooks';
import { ForgotPasswordScreen } from './forgot-password-screen';
import { LogInScreen } from './log-in-screen';
import { OtherDeviceScreen } from './other-device-screen';
import { ResetPasswordScreen } from './reset-password-screen';
import { SignUpScreen } from './sign-up-screen';
import { VerifyEmailScreen } from './verify-email-screen';

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));

class MemoryStorage implements PreferenceStorage {
  readonly data = new Map<string, string>();
  getItem = (key: string) => this.data.get(key) ?? null;
  setItem = (key: string, value: string) => void this.data.set(key, value);
  removeItem = (key: string) => void this.data.delete(key);
}

function renderScreen(
  ui: ReactElement,
  { flow, client = new PreviewAuthClient(0) }: { flow?: AuthFlowState; client?: AuthClient } = {},
) {
  const store = new AuthFlowStore(new MemoryStorage());
  if (flow) store.start(flow);
  const user = userEvent.setup();
  render(
    <AuthProvider client={client} flowStore={store}>
      {ui}
    </AuthProvider>,
  );
  return { user, store };
}

const field = (name: RegExp | string) => screen.getByLabelText(name, { selector: 'input' });

beforeEach(() => {
  router.push.mockReset();
  router.replace.mockReset();
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('Sign up', () => {
  it('explains every problem and moves focus to the first one', async () => {
    const { user } = renderScreen(<SignUpScreen />);
    await user.type(field('Password'), 'short');
    await user.type(field(/Phone/), '123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Enter your full name.')).toBeInTheDocument();
    expect(screen.getByText(/Enter an email like/)).toBeInTheDocument();
    expect(screen.getByText(/Too short/)).toBeInTheDocument();
    expect(screen.getByText(/a mobile number like 772 123 456/)).toBeInTheDocument();
    expect(field('Full name')).toHaveFocus();
    expect(field('Full name')).toHaveAttribute('aria-invalid', 'true');

    await user.type(field('Full name'), 'N');
    expect(screen.queryByText('Enter your full name.')).not.toBeInTheDocument();
  });

  it('creates the account and goes to step 2 with the details handed over', async () => {
    window.history.replaceState(null, '', '/signup?returnTo=%2Fnotes%2Fcsc-1100');
    const { user, store } = renderScreen(<SignUpScreen />);
    await user.type(field('Full name'), 'Nakato Sarah');
    await user.type(field('Email'), 'nakato.sarah@gmail.com');
    await user.type(field('Password'), 'mango tea at 4pm');
    expect(screen.getByText('Strong. Nice one.')).toBeInTheDocument();
    await user.type(field(/Phone/), '0772 123 456');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(router.push).toHaveBeenCalledWith('/signup/verify?returnTo=%2Fnotes%2Fcsc-1100');
    expect(store.getSnapshot()).toMatchObject({
      name: 'Nakato Sarah',
      email: 'nakato.sarah@gmail.com',
      phone: '+256772123456',
      channel: 'email',
    });
    expect(JSON.stringify(store.getSnapshot())).not.toContain('mango');
  });

  it('says when the email already has an account and offers to log in', async () => {
    const { user } = renderScreen(<SignUpScreen />);
    await user.type(field('Full name'), 'Nakato Sarah');
    await user.type(field('Email'), 'taken@gmail.com');
    await user.type(field('Password'), 'mango tea at 4pm');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('An account already uses this email.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in instead' })).toHaveAttribute('href', '/login');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('refills the form when coming back to change the email', () => {
    renderScreen(<SignUpScreen />, {
      flow: { name: 'Nakato Sarah', email: 'old@gmail.com', phone: '+256772123456' },
    });
    expect(field('Full name')).toHaveValue('Nakato Sarah');
    expect(field('Email')).toHaveValue('old@gmail.com');
    expect(field(/Phone/)).toHaveValue('772 123 456');
    expect(field('Password')).toHaveValue('');
  });

  it('shows the preview tips only with the preview client', () => {
    renderScreen(<SignUpScreen />);
    expect(screen.getByText('Preview mode: nothing is saved')).toBeInTheDocument();
  });

  it('shows Google errors next to the Google button', async () => {
    const { user } = renderScreen(<SignUpScreen />);
    await user.click(screen.getByRole('button', { name: 'Sign up with Google' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/isn't switched on yet/);
  });
});

describe('Check your email', () => {
  const flow: AuthFlowState = {
    name: 'Nakato Sarah',
    email: 'nakato.sarah@gmail.com',
    phone: '+256772123456',
    channel: 'email',
    codeSentAt: Date.now(),
  };

  it('asks to start again when opened without signing up first', () => {
    renderScreen(<VerifyEmailScreen />);
    expect(screen.getByRole('heading', { name: 'Start again' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/signup');
  });

  it('shows where the code went, the resend timer and the SMS option', () => {
    renderScreen(<VerifyEmailScreen />, { flow });
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(screen.getByText('nakato.sarah@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(screen.getByText(/Resend in 0:(5\d|60)/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change it' })).toHaveAttribute(
      'href',
      '/signup#email',
    );
  });

  it('says what is wrong with a bad code', async () => {
    const { user } = renderScreen(<VerifyEmailScreen />, { flow });
    await user.click(screen.getByRole('button', { name: 'Confirm and continue' }));
    expect(screen.getByText('Enter all 6 digits of the code.')).toBeInTheDocument();

    await user.type(field('Code'), '000000');
    await user.click(screen.getByRole('button', { name: 'Confirm and continue' }));
    expect(await screen.findByText(/That code has expired/)).toBeInTheDocument();
    expect(field('Code')).toHaveFocus();
  });

  it('confirms the code and finishes where the student started', async () => {
    window.history.replaceState(null, '', '/signup/verify?returnTo=%2Fnotes%2Fcsc-1100');
    const { user, store } = renderScreen(<VerifyEmailScreen />, { flow });
    await user.type(field('Code'), '123 456');
    await user.click(screen.getByRole('button', { name: 'Confirm and continue' }));
    expect(router.replace).toHaveBeenCalledWith('/notes/csc-1100');
    expect(store.getSnapshot()).toBeNull();
  });

  it('switches to SMS and back', async () => {
    const { user, store } = renderScreen(<VerifyEmailScreen />, { flow });
    await user.click(screen.getByRole('button', { name: 'Send by SMS instead' }));
    expect(await screen.findByRole('heading', { name: 'Check your phone' })).toBeInTheDocument();
    expect(screen.getByText('+256 772 123 456')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('New code sent.');
    expect(store.getSnapshot()?.channel).toBe('sms');
    expect(screen.getByRole('link', { name: 'Change it' })).toHaveAttribute(
      'href',
      '/signup#phone',
    );

    await user.click(screen.getByRole('button', { name: 'Send by email instead' }));
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
  });

  it('offers Resend once the wait is over, and hides SMS without a phone', async () => {
    const { user } = renderScreen(<VerifyEmailScreen />, {
      flow: { email: 'a@gmail.com', codeSentAt: 0 },
    });
    expect(screen.queryByRole('button', { name: 'Send by SMS instead' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resend code' }));
    expect(await screen.findByText('New code sent.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resend code' })).not.toBeInTheDocument();
  });

  it('explains why when sent here from log-in with an unconfirmed email', () => {
    renderScreen(<VerifyEmailScreen />, {
      flow: { email: 'a@gmail.com', reason: 'unverified', codeSentAt: Date.now() },
    });
    expect(screen.getByText(/Confirm your email to finish/)).toBeInTheDocument();
    expect(screen.queryByText('Step 2 of 2')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/login');
  });
});

describe('Log in', () => {
  async function logIn(identifier: string, password = 'mango tea at 4pm') {
    const rendered = renderScreen(<LogInScreen />);
    await rendered.user.type(field('Email or phone'), identifier);
    await rendered.user.type(field('Password'), password);
    await rendered.user.click(screen.getByRole('button', { name: 'Log in' }));
    return rendered;
  }

  it('checks the fields before sending anything', async () => {
    const { user } = renderScreen(<LogInScreen />);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByText(/Enter your email, or a mobile number/)).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Keep me logged in' })).toBeChecked();
  });

  it('signs in and returns to the page that asked', async () => {
    window.history.replaceState(null, '', '/login?returnTo=%2Fpast-papers');
    await logIn('nakato@gmail.com');
    expect(router.replace).toHaveBeenCalledWith('/past-papers');
  });

  it('shows a wrong-password message with a reset link', async () => {
    await logIn('nakato@gmail.com', 'wrong-pass');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/don't match/);
    expect(within(alert).getByRole('link', { name: 'Reset your password' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('sends an unconfirmed account to confirm its email', async () => {
    const { store } = await logIn('unverified@gmail.com');
    expect(router.push).toHaveBeenCalledWith('/signup/verify');
    expect(store.getSnapshot()).toMatchObject({
      email: 'unverified@gmail.com',
      reason: 'unverified',
    });
  });

  it('goes to the other-device screen when another device is signed in', async () => {
    const { store } = await logIn('0772 123 000');
    expect(router.push).toHaveBeenCalledWith('/login/other-device');
    expect(store.getSnapshot()?.device?.name).toBe('Tecno Spark 20, Chrome');
  });

  it('carries the typed email to "Forgot password?"', async () => {
    const { user, store } = renderScreen(<LogInScreen />);
    await user.type(field('Email or phone'), 'nakato@gmail.com');
    await user.click(screen.getByRole('link', { name: 'Forgot password?' }));
    expect(store.getSnapshot()?.identifier).toEqual({ kind: 'email', value: 'nakato@gmail.com' });
  });

  it('lets the password be shown and hidden', async () => {
    const { user } = renderScreen(<LogInScreen />);
    expect(field('Password')).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field('Password')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('Signed in on another device', () => {
  const flow: AuthFlowState = {
    identifier: { kind: 'email', value: 'nakato@gmail.com' },
    maskedEmail: 'n•••••@gmail.com',
    device: {
      name: 'Tecno Spark 20, Chrome',
      lastActiveAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
      place: 'Kampala',
    },
  };

  it('sends people back to log in when opened directly', () => {
    renderScreen(<OtherDeviceScreen />);
    expect(screen.getByRole('link', { name: 'Back to log in' })).toHaveAttribute('href', '/login');
  });

  it('describes the other device and where the code went', () => {
    renderScreen(<OtherDeviceScreen />, { flow });
    expect(screen.getByText('Tecno Spark 20, Chrome')).toBeInTheDocument();
    expect(screen.getByText('Last active 2 hours ago, Kampala')).toBeInTheDocument();
    expect(screen.getByText('n•••••@gmail.com')).toBeInTheDocument();
  });

  it('signs the other device out with the right code', async () => {
    const { user, store } = renderScreen(<OtherDeviceScreen />, { flow });
    await user.type(field('Code'), '111111');
    await user.click(
      screen.getByRole('button', { name: 'Sign out the other device and continue' }),
    );
    expect(await screen.findByText(/That code isn't right/)).toBeInTheDocument();

    await user.clear(field('Code'));
    await user.type(field('Code'), '123456');
    await user.click(
      screen.getByRole('button', { name: 'Sign out the other device and continue' }),
    );
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(store.getSnapshot()).toBeNull();
  });

  it('can be cancelled', async () => {
    const { user, store } = renderScreen(<OtherDeviceScreen />, { flow });
    await user.click(screen.getByRole('button', { name: 'Cancel, stay signed out here' }));
    expect(router.replace).toHaveBeenCalledWith('/login');
    expect(store.getSnapshot()).toBeNull();
  });
});

describe('Forgot and reset password', () => {
  it('prefills what was typed on log-in and sends the code', async () => {
    const { user, store } = renderScreen(<ForgotPasswordScreen />, {
      flow: { identifier: { kind: 'phone', value: '+256772123456' } },
    });
    expect(field('Email or phone')).toHaveValue('+256 772 123 456');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    expect(router.push).toHaveBeenCalledWith('/forgot-password/reset');
    expect(store.getSnapshot()?.codeSentAt).toBeTypeOf('number');
  });

  it('checks the email or phone first', async () => {
    const { user } = renderScreen(<ForgotPasswordScreen />);
    await user.type(field('Email or phone'), 'nakato');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    expect(screen.getByText(/Enter your email, or a mobile number/)).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('asks for a reset code first when opened directly', () => {
    renderScreen(<ResetPasswordScreen />);
    expect(screen.getByRole('link', { name: 'Get a reset code' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('sets a new password with the code, showing strength as it is typed', async () => {
    const { user, store } = renderScreen(<ResetPasswordScreen />, {
      flow: { identifier: { kind: 'email', value: 'nakato@gmail.com' }, codeSentAt: Date.now() },
    });
    expect(screen.getByText('n•••••@gmail.com')).toBeInTheDocument();
    await user.type(field('New password'), 'nakato123');
    await user.click(screen.getByRole('button', { name: 'Save and log in' }));
    expect(screen.getByText('Enter all 6 digits of the code.')).toBeInTheDocument();
    expect(screen.getByText(/Avoid your name or email/)).toBeInTheDocument();

    await user.type(field('Code'), '123456');
    await user.clear(field('New password'));
    await user.type(field('New password'), 'Kampala-rain7');
    expect(screen.getByText(/Good. Long phrases like/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save and log in' }));
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(store.getSnapshot()).toBeNull();
  });

  it('says when the reset code is wrong, and says "by SMS" for phones', async () => {
    const { user } = renderScreen(<ResetPasswordScreen />, {
      flow: { identifier: { kind: 'phone', value: '+256772123456' }, codeSentAt: 0 },
    });
    expect(screen.getByText(/by SMS/)).toBeInTheDocument();
    await user.type(field('Code'), '999999');
    await user.type(field('New password'), 'mango tea at 4pm');
    await user.click(screen.getByRole('button', { name: 'Save and log in' }));
    expect(await screen.findByText(/Wait 10 minutes/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resend code' }));
    expect(await screen.findByText('New code sent.')).toBeInTheDocument();
  });
});

describe('request states', () => {
  it('shows the busy label while waiting and blocks a second tap', async () => {
    let finish: () => void = () => {};
    const slow = new PreviewAuthClient(0);
    vi.spyOn(slow, 'requestPasswordReset').mockImplementation(
      () => new Promise((resolve) => (finish = () => resolve({ ok: true, value: undefined }))),
    );
    const { user } = renderScreen(<ForgotPasswordScreen />, { client: slow });
    await user.type(field('Email or phone'), 'nakato@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    const busy = screen.getByRole('button', { name: /Sending the code/ });
    expect(busy).toBeDisabled();
    await act(async () => finish());
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('shows a connection message when the request fails outright', async () => {
    const broken = new PreviewAuthClient(0);
    vi.spyOn(broken, 'requestPasswordReset').mockRejectedValue(new Error('boom'));
    const { user } = renderScreen(<ForgotPasswordScreen />, { client: broken });
    await user.type(field('Email or phone'), 'nakato@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Something went wrong/);
  });
});

describe('AuthLayout and the Day/Night button', () => {
  it('shows the brand panel and switches theme', async () => {
    const user = userEvent.setup();
    render(
      <AuthLayout>
        <p>form</p>
      </AuthLayout>,
    );
    const panel = screen.getByRole('complementary', { name: 'About Campus Hand' });
    expect(panel).toHaveTextContent('Tutors and classmates from your own campus');
    expect(panel).not.toHaveTextContent(/Kampala|Ugand/);
    const pill = screen.getByRole('button', { name: 'Switch to Night mode' });
    await user.click(pill);
    expect(document.documentElement.dataset.theme).toBe('night');
    expect(screen.getByRole('button', { name: 'Switch to Day mode' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Switch to Day mode' }));
    expect(document.documentElement.dataset.theme).toBe('day');
  });

  it('renders the pill on its own', () => {
    render(<ThemePill className="x" />);
    expect(screen.getByRole('button')).toHaveClass('theme-pill', 'x');
  });
});
