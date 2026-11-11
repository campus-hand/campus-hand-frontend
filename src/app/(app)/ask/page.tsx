import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { AskScreen } from '@/features/magezi/components/ask-screen';

export const metadata: Metadata = { title: 'Ask Magezi' };

const first = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

export default function AskPage({ searchParams }: PageProps<'/ask'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Opening Magezi" />}>
      {searchParams.then((sp) => (
        <AskScreen question={first(sp.q).slice(0, 300)} unitId={first(sp.unit).slice(0, 80)} />
      ))}
    </Suspense>
  );
}
