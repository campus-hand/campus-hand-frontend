import type { Metadata } from 'next';
import { AppShell } from '@/components/app/app-shell';

export const metadata: Metadata = {
  // Signed-in screens are never indexed.
  robots: { index: false, follow: false },
};

export default function StudentAppLayout({ children }: LayoutProps<'/'>) {
  return <AppShell>{children}</AppShell>;
}
