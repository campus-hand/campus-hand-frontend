import type { Metadata } from 'next';
import { ResetPasswordScreen } from '@/features/auth/components/reset-password-screen';

export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ResetPasswordScreen />;
}
