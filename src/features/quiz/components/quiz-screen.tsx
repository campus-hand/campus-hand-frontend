'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Quiz, type QuizDefinition } from '../models/quiz';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** "Quiz me": one question at a time, with why after each answer. */
export function QuizScreen({
  definition,
  closeHref,
  closeLabel,
}: {
  definition: QuizDefinition;
  closeHref: string;
  closeLabel: string;
}) {
  const [quiz, setQuiz] = useState(() => Quiz.start(definition));
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // Move focus to the feedback after answering, and to the question after "Next".
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (quiz.status === 'answered') feedbackRef.current?.focus();
    else questionRef.current?.focus();
  }, [quiz.status, quiz.index]);

  if (quiz.status === 'finished') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[720px] flex-col justify-center gap-6 px-5 py-10">
        <p className="text-ink-2 text-[17px] font-semibold">
          {definition.topicTitle}, {definition.sources}
        </p>
        <h1
          ref={questionRef}
          tabIndex={-1}
          className="display text-[clamp(48px,9vw,80px)] outline-none"
        >
          You got {quiz.scoreLabel}
        </h1>
        <p className="text-ink-2 text-[18px]">
          {quiz.correctCount === quiz.total
            ? 'Every one right. This topic is ready for the exam.'
            : 'Go over the ones you missed in the notes, then try again.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-sun" onClick={() => setQuiz((q) => q.restart())}>
            Try again
          </button>
          <Link href={closeHref} className="btn btn-line">
            Back to {closeLabel}
          </Link>
        </div>
      </div>
    );
  }

  const question = quiz.question;
  const answered = quiz.status === 'answered';

  return (
    <div className="mx-auto flex min-h-dvh max-w-[760px] flex-col">
      <div className="flex items-center gap-4 px-5 pt-5">
        <Link
          href={closeHref}
          aria-label={`Close the quiz and go back to ${closeLabel}`}
          className="hover:bg-sunken -ml-2 flex size-11 flex-none items-center justify-center rounded-full"
        >
          <X className="size-7" aria-hidden="true" />
        </Link>
        <ol aria-hidden="true" className="flex flex-1 gap-2">
          {definition.questions.map((q, i) => (
            <li
              key={q.id}
              className={cn(
                'h-3 flex-1 rounded-full',
                quiz.segment(i) === 'done' && 'bg-cobalt',
                quiz.segment(i) === 'current' && 'bg-sun',
                quiz.segment(i) === 'upcoming' && 'bg-track',
              )}
            />
          ))}
        </ol>
        <p className="text-[17px] font-bold whitespace-nowrap">
          <span className="sr-only">Question </span>
          {quiz.positionLabel}
        </p>
      </div>

      <div className={cn('flex flex-1 flex-col gap-7 px-5 pt-8', answered ? 'pb-80' : 'pb-10')}>
        <p className="text-ink-2 text-[17px] font-semibold">
          {definition.topicTitle}, {definition.sources}
        </p>
        <h1
          ref={questionRef}
          tabIndex={-1}
          className="display text-[clamp(40px,7vw,64px)] leading-[0.98] outline-none"
        >
          {question.prompt}
        </h1>

        <ul className="flex flex-col gap-4" aria-label="Answers">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isChosen = i === quiz.chosen;
            const showRight = answered && isCorrect;
            const showWrong = answered && isChosen && !isCorrect;
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => setQuiz((q) => q.answer(i))}
                  disabled={answered}
                  aria-label={`${LETTERS[i]}: ${option}${showRight ? ', correct answer' : ''}${showWrong ? ', your answer, wrong' : ''}`}
                  className={cn(
                    'flex min-h-[76px] w-full items-center gap-5 rounded-[22px] px-5 text-left text-[22px] font-semibold',
                    'bg-surface shadow-[inset_0_0_0_2px_var(--edge)]',
                    !answered && 'hover:bg-sunken',
                    showRight &&
                      'bg-daily-bg text-daily-fg shadow-[inset_0_0_0_2.5px_var(--green),3px_3px_0_var(--drop)]',
                    showWrong &&
                      'bg-tut-bg text-tut-fg shadow-[inset_0_0_0_2.5px_var(--red),3px_3px_0_var(--drop)]',
                    answered && !showRight && !showWrong && 'opacity-60',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-12 flex-none items-center justify-center rounded-[13px] text-[18px] font-extrabold',
                      showRight
                        ? 'bg-forest text-on-forest'
                        : showWrong
                          ? 'bg-signal-red text-on-cobalt'
                          : 'bg-sunken',
                    )}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showRight ? <Check className="size-7" aria-hidden="true" /> : null}
                  {showWrong ? <X className="size-7" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {answered ? (
        <section
          aria-live="polite"
          className={cn(
            'fixed inset-x-0 bottom-0 z-30 rounded-t-[28px] border-t-[2.5px] border-[var(--edge)] px-5 pt-7 pb-[max(24px,env(safe-area-inset-bottom))]',
            quiz.isRight ? 'bg-forest text-on-forest' : 'bg-signal-red text-on-cobalt',
          )}
        >
          <div className="mx-auto flex max-w-[720px] flex-col gap-4">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="bg-sun text-on-sun flex size-14 flex-none items-center justify-center rounded-full"
              >
                {quiz.isRight ? (
                  <Check className="size-7" strokeWidth={3} />
                ) : (
                  <X className="size-7" strokeWidth={3} />
                )}
              </span>
              <h2
                ref={feedbackRef}
                tabIndex={-1}
                className="display text-[clamp(32px,6vw,48px)] outline-none"
              >
                {quiz.isRight
                  ? question.rightTitle
                  : `Not quite: it's ${LETTERS[question.correctIndex]}, ${question.options[question.correctIndex]}`}
              </h2>
            </div>
            <p className="text-[18px] leading-relaxed">{question.explanation}</p>
            <button
              type="button"
              className="btn btn-sun w-full"
              onClick={() => setQuiz((q) => q.next())}
            >
              {quiz.isLast ? 'See your score' : 'Next question'}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
