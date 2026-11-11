import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { ReaderScreen } from '@/features/reader/components/reader-screen';
import { courseUnitLink, getResource, getTermUnits, getViewer } from '@/features/student-app/data';

export async function generateMetadata({ params }: PageProps<'/read/[id]'>): Promise<Metadata> {
  const resource = await getResource((await params).id);
  return { title: resource ? `${resource.title}, ${resource.courseUnitCode}` : 'Reader' };
}

async function Reader({ id }: { id: string }) {
  const resource = await getResource(id);
  if (!resource) notFound();
  const viewer = await getViewer();
  const [{ units }, back] = await Promise.all([
    getTermUnits(viewer.studyPlace),
    courseUnitLink(resource.courseUnitCode, viewer.studyPlace),
  ]);
  return (
    <ReaderScreen
      resource={resource}
      backHref={back.href}
      backLabel={back.label}
      units={units.map((u) => ({ code: u.code, title: u.title }))}
      allowance={{ ...viewer.credits, unlimited: viewer.isPro }}
      isPro={viewer.isPro}
    />
  );
}

export default function ReaderPage({ params }: PageProps<'/read/[id]'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Opening the file" />}>
      {params.then(({ id }) => (
        <Reader id={id} />
      ))}
    </Suspense>
  );
}
