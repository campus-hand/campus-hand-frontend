import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { CourseUnitScreen } from '@/features/course-unit/components/course-unit-screen';
import { getCourseUnit } from '@/features/student-app/data';

export async function generateMetadata({
  params,
}: PageProps<'/course-units/[id]'>): Promise<Metadata> {
  const unit = await getCourseUnit((await params).id);
  return { title: unit ? `${unit.code} ${unit.title}` : 'Course unit' };
}

export default function CourseUnitPage({ params }: PageProps<'/course-units/[id]'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Loading the course unit" />}>
      {params.then(({ id }) => (
        <CourseUnitScreen id={id} />
      ))}
    </Suspense>
  );
}
