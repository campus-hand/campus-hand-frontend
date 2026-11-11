import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { QuizScreen } from '@/features/quiz/components/quiz-screen';
import { courseUnitLink, getQuiz, getViewer } from '@/features/student-app/data';

export async function generateMetadata({ params }: PageProps<'/quiz/[id]'>): Promise<Metadata> {
  const quiz = await getQuiz((await params).id);
  return { title: quiz ? `Quiz: ${quiz.topicTitle}` : 'Quiz' };
}

async function QuizLoader({ id }: { id: string }) {
  const quiz = await getQuiz(id);
  if (!quiz) notFound();
  const viewer = await getViewer();
  const back = await courseUnitLink(quiz.courseUnitCode, viewer.studyPlace);
  return <QuizScreen definition={quiz} closeHref={back.href} closeLabel={back.label} />;
}

export default function QuizPage({ params }: PageProps<'/quiz/[id]'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Getting your quiz ready" />}>
      {params.then(({ id }) => (
        <QuizLoader id={id} />
      ))}
    </Suspense>
  );
}
