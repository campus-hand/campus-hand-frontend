import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeScreen } from '@/features/home/components/home-screen';
import { ScreenLoading } from '@/components/app/screen-loading';

export const metadata: Metadata = { title: 'Home' };

export default function HomePage() {
  return (
    <Suspense fallback={<ScreenLoading label="Loading your dashboard" />}>
      <HomeScreen />
    </Suspense>
  );
}
