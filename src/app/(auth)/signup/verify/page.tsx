import type { Metadata } from 'next';
import { VerifyEmailScreen } from '@/features/auth/components/verify-email-screen';

export const metadata: Metadata = {
  title: 'Check your email',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <VerifyEmailScreen />;
}
