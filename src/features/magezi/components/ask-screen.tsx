import { MageziIcon } from '@/features/landing/icons/magezi-icon';
import { getCourseUnit, getViewer } from '@/features/student-app/data';
import { MageziChat } from './magezi-chat';

const CAMPUS_SUGGESTIONS = [
  'Where do I pay for a retake?',
  'When do exams start?',
  'How do I get my results slip?',
];

/** Ask: Magezi for campus questions, or about one course unit (?unit=). */
export async function AskScreen({ question, unitId }: { question: string; unitId: string }) {
  const viewer = await getViewer();
  const unit = unitId ? await getCourseUnit(unitId) : null;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-[820px] flex-col gap-6 px-5 pt-6 sm:px-8 lg:pt-10">
      <header className="flex items-start gap-4">
        <span className="bg-sun text-on-sun flex size-14 flex-none items-center justify-center rounded-[16px] shadow-[inset_0_0_0_2px_var(--edge),3px_3px_0_var(--drop)]">
          <MageziIcon className="size-7" />
        </span>
        <div>
          <h1 className="display text-[clamp(44px,7vw,72px)]">
            {unit ? `Ask about ${unit.code}` : 'Ask Magezi'}
          </h1>
          <p className="text-ink-2 text-[17px]">
            {unit
              ? `Answers from ${unit.title} notes and past papers.`
              : 'Fees, offices, hostels or anything in your course units.'}
          </p>
        </div>
      </header>
      <MageziChat
        scope={unit ? 'unit' : 'campus'}
        courseUnitCode={unit?.code}
        suggestions={unit ? ['Explain 2(a)', 'Do 2(b)', 'Explain more simply'] : CAMPUS_SUGGESTIONS}
        allowance={{ ...viewer.credits, unlimited: viewer.isPro }}
        initialQuestion={question || undefined}
        placeholder={unit ? `Ask about ${unit.code}` : 'Ask about campus or your course units'}
        className="flex-1 pb-6"
      />
    </div>
  );
}
