import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { getTermUnits, getTutor, getViewer, requestTimeMs } from '@/features/student-app/data';
import { TutorProfileScreen } from '@/features/tutors/components/tutor-profile-screen';

export async function generateMetadata({ params }: PageProps<'/tutors/[id]'>): Promise<Metadata> {
  const tutor = await getTutor((await params).id);
  return { title: tutor ? `${tutor.name}, tutor` : 'Tutor' };
}

async function Profile({ id }: { id: string }) {
  const tutor = await getTutor(id);
  if (!tutor) notFound();
  const nowMs = await requestTimeMs(); // the calendar starts from today
  const viewer = await getViewer();
  const { units } = await getTermUnits(viewer.studyPlace);
  // The session is for the first of the viewer's units this tutor covers.
  const unitCode = units.find((u) => tutor.courseUnitCodes.includes(u.code))?.code ?? '';
  return <TutorProfileScreen tutor={tutor} unitCode={unitCode} nowMs={nowMs} />;
}

export default function TutorPage({ params }: PageProps<'/tutors/[id]'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Opening the tutor's profile" />}>
      {params.then(({ id }) => (
        <Profile id={id} />
      ))}
    </Suspense>
  );
}
