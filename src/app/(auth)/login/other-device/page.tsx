import type { Metadata } from 'next';
import { OtherDeviceScreen } from '@/features/auth/components/other-device-screen';

export const metadata: Metadata = {
  title: 'Signed in on another device',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OtherDeviceScreen />;
}
