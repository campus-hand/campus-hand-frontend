import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { CampusScreen } from '@/features/campus/components/campus-screen';
import { categoryFromParam } from '@/features/campus/models/campus-post';
import { getCampusPosts } from '@/features/student-app/data';

export const metadata: Metadata = {
  title: 'Campus',
  description:
    'Fees, hostels, food and the offices you will need. Written by students, checked by moderators.',
};

async function Campus({ topic }: { topic: string }) {
  const posts = await getCampusPosts();
  return <CampusScreen posts={posts} category={categoryFromParam(topic)} />;
}

/** ?topic=fees filters by category. */
export default function CampusPage({ searchParams }: PageProps<'/blog'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Loading campus posts" />}>
      {searchParams.then(({ topic }) => (
        <Campus topic={typeof topic === 'string' ? topic.slice(0, 20) : ''} />
      ))}
    </Suspense>
  );
}
