import type { Metadata } from 'next';
import { ForgotPasswordScreen } from '@/features/auth/components/forgot-password-screen';

export const metadata: Metadata = {
  title: 'Forgot your password?',
};

export default function Page() {
  return <ForgotPasswordScreen />;
}
