import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import {
  getCourseUnit,
  getTermUnits,
  getTutors,
  getViewer,
  requestTimeMs,
} from '@/features/student-app/data';
import { TutorsScreen } from '@/features/tutors/components/tutors-screen';

export const metadata: Metadata = { title: 'Tutors' };

const first = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

/** ?unit=<course unit id> (from a course unit page) or ?code=<course unit code>. */
async function Tutors({ unitId, code }: { unitId: string; code: string }) {
  const nowMs = await requestTimeMs(); // "Free today" depends on the time now
  const viewer = await getViewer();
  const [{ units }, tutors, unit] = await Promise.all([
    getTermUnits(viewer.studyPlace),
    getTutors(),
    unitId ? getCourseUnit(unitId) : Promise.resolve(null),
  ]);
  const wanted = unit?.code ?? code;
  const initialUnitCode = units.some((u) => u.code === wanted) ? wanted : '';
  return (
    <TutorsScreen
      tutors={tutors}
      units={units.map((u) => ({ code: u.code, title: u.title }))}
      initialUnitCode={initialUnitCode}
      nowMs={nowMs}
    />
  );
}

export default function TutorsPage({ searchParams }: PageProps<'/tutors'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Finding tutors" />}>
      {searchParams.then((sp) => (
        <Tutors unitId={first(sp.unit).slice(0, 80)} code={first(sp.code).slice(0, 40)} />
      ))}
    </Suspense>
  );
}
