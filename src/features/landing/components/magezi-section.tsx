import { Check, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { landingContent } from '../content/landing-content';
import { MageziIcon } from '../icons/magezi-icon';

export function MageziSection() {
  const { magezi } = landingContent;

  return (
    <section
      id="magezi"
      aria-labelledby="mz-h"
      className="wrap flex scroll-mt-6 flex-col gap-7 pt-24"
    >
      <div className="grid items-end gap-7 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <span className="sticker display text-xl">
            <MageziIcon className="size-5" />
            {magezi.sticker}
          </span>
          <h2 id="mz-h" className="display text-[clamp(44px,5vw,68px)]">
            {magezi.title}
          </h2>
        </div>
        <p className="max-w-[46ch] text-lg">{magezi.lead}</p>
      </div>

      <div className="grid items-start gap-5 md:grid-cols-3">
        <MageziCard
          number={1}
          title={magezi.explain.title}
          body={magezi.explain.body}
          className="bg-surface"
        >
          <ExplainMock />
          <span className="plan-tag plan-free">{magezi.explain.plan}</span>
        </MageziCard>

        <MageziCard
          number={2}
          title={magezi.quiz.title}
          body={magezi.quiz.body}
          className="bg-cobalt text-on-cobalt"
          numberClassName="bg-on-cobalt text-cobalt"
        >
          <QuizMock />
          <span className="plan-tag bg-surface text-ink">{magezi.quiz.plan}</span>
        </MageziCard>

        <MageziCard
          number={3}
          title={magezi.roadmap.title}
          body={magezi.roadmap.body}
          className="bg-sun text-on-sun -rotate-[0.6deg]"
        >
          <RoadmapMock />
          <span className="plan-tag plan-pro">{magezi.roadmap.plan}</span>
        </MageziCard>
      </div>

      <p className="flex items-center gap-2.5 text-[15.5px]">
        <Info className="size-5 flex-none" aria-hidden="true" />
        <span>{magezi.footnote}</span>
      </p>
    </section>
  );
}

interface MageziCardProps {
  number: number;
  title: string;
  body: string;
  className?: string;
  numberClassName?: string;
  children: ReactNode;
}

function MageziCard({
  number,
  title,
  body,
  className = '',
  numberClassName,
  children,
}: MageziCardProps) {
  return (
    <article className={`sign relative flex flex-col gap-3.5 p-[18px] ${className}`}>
      <div className="flex items-center gap-3">
        <span
          className={`display grid size-[38px] flex-none place-items-center rounded-[11px] text-[21px] ${numberClassName ?? 'bg-inverse text-on-inverse'}`}
          aria-hidden="true"
        >
          {number}
        </span>
        <h3 className="display text-2xl">{title}</h3>
      </div>
      <p className="text-[15px] leading-[1.45]">{body}</p>
      {children}
    </article>
  );
}

function ExplainMock() {
  return (
    <div aria-hidden="true" className="relative pb-[58px]">
      <div className="sheet sheet-tight pt-2.5 pr-3 pb-[34px] pl-[52px] text-sm leading-[22px]">
        <p>
          <b>2.</b> (b) Explain why a search in a{' '}
          <span className="highlight">binary search tree</span> can take O(n) time. (4 marks)
        </p>
      </div>
      <div className="mock bg-surface absolute right-[-4px] bottom-0 left-[26px] text-sm leading-[1.4] shadow-[inset_0_0_0_2px_var(--edge),3px_3px_0_var(--drop)]">
        <b>Magezi:</b> If keys arrive in order, the tree grows into one long line. A search then
        checks every node. <span className="text-link font-bold">Page 2</span>
      </div>
    </div>
  );
}

function QuizMock() {
  const options = [
    { label: 'In-order', correct: false },
    { label: 'Pre-order', correct: true },
    { label: 'Post-order', correct: false },
  ];
  return (
    <div className="mock flex flex-col gap-2" aria-hidden="true">
      <p className="text-mute flex justify-between text-[12.5px] font-bold">
        <span>Question 3 of 10 · CSC 2100</span>
        <span>7/10 so far</span>
      </p>
      <p className="text-[15px] font-bold">Which traversal visits the root first?</p>
      {options.map((option) => (
        <span
          key={option.label}
          className={`flex min-h-10 items-center justify-between gap-2 rounded-[10px] px-3 text-sm font-semibold ${
            option.correct
              ? 'bg-daily-bg text-daily-fg shadow-[inset_0_0_0_2px_var(--t-daily-fg)]'
              : 'bg-surface shadow-[inset_0_0_0_1.5px_var(--rule)]'
          }`}
        >
          {option.label}
          {option.correct ? <Check className="size-4" /> : null}
        </span>
      ))}
    </div>
  );
}

function RoadmapMock() {
  const { roadmap } = landingContent.magezi;
  return (
    <div className="mock px-3 py-2" aria-hidden="true">
      <p className="text-mute pt-1 pb-1.5 text-[12.5px] font-bold">{roadmap.heading}</p>
      {roadmap.days.map((day) => {
        const isToday = 'today' in day && day.today;
        return (
          <div
            key={day.day}
            className={`border-rule grid min-h-[38px] grid-cols-[40px_1fr_auto] items-center gap-2.5 border-b text-sm last:border-b-0 ${
              isToday
                ? 'bg-paper-tag-bg text-paper-tag-fg -mx-1.5 rounded-lg border-transparent px-1.5'
                : ''
            }`}
          >
            <b className="display text-base">{day.day}</b>
            <span>{day.topic}</span>
            {isToday ? (
              <span className="text-[12.5px] font-bold">Today</span>
            ) : 'done' in day && day.done ? (
              <Check className="text-green-text size-4" />
            ) : (
              <span />
            )}
          </div>
        );
      })}
    </div>
  );
}
