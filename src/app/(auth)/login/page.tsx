import type { Metadata } from 'next';
import { LogInScreen } from '@/features/auth/components/log-in-screen';

export const metadata: Metadata = {
  title: 'Log in',
};

export default function Page() {
  return <LogInScreen />;
}
