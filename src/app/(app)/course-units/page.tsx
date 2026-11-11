import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { CoursesScreen } from '@/features/course-unit/components/courses-screen';

export const metadata: Metadata = { title: 'Courses' };

export default function CoursesPage({ searchParams }: PageProps<'/course-units'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Loading your course units" />}>
      {searchParams.then(({ q }) => (
        <CoursesScreen query={typeof q === 'string' ? q.slice(0, 80) : ''} />
      ))}
    </Suspense>
  );
}
