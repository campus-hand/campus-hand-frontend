'use client';

import { ArrowUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { RichTextView } from '@/features/reader/components/rich-text-view';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  type MageziAnswer,
  MageziAllowance,
  type MageziScope,
  type MageziSource,
} from '../models/magezi';
import { PreviewMageziSource } from '../models/preview-magezi-source';
import { BstDiagram } from './bst-diagram';

type Message =
  | { readonly id: number; readonly from: 'you'; readonly text: string }
  | { readonly id: number; readonly from: 'magezi'; readonly answer: MageziAnswer };

export interface MageziChatProps {
  scope: MageziScope;
  resourceId?: string;
  courseUnitCode?: string;
  /** Questions offered as chips before the first one is asked. */
  suggestions: readonly string[];
  allowance: { left: number; perDay: number; unlimited?: boolean };
  /** Asked straight away (e.g. from the Home "Ask the campus assistant" box). */
  initialQuestion?: string;
  placeholder?: string;
  source?: MageziSource;
  className?: string;
  /** Classes for the scrolling conversation (e.g. padding). */
  bodyClassName?: string;
  /** Classes for the allowance line and question box, which stay in view. */
  footerClassName?: string;
}

const chipClass =
  'min-h-11 rounded-full bg-surface px-4 text-[15.5px] font-bold shadow-[inset_0_0_0_2px_var(--edge)] hover:bg-sunken';

/** Magezi conversation: questions, answers with drawings and sources, and today's allowance. */
export function MageziChat({
  scope,
  resourceId,
  courseUnitCode,
  suggestions,
  allowance: initialAllowance,
  initialQuestion,
  placeholder = 'Ask about this page',
  source,
  className,
  bodyClassName,
  footerClassName,
}: MageziChatProps) {
  const [mageziSource] = useState<MageziSource>(() => source ?? new PreviewMageziSource());
  const [allowance, setAllowance] = useState(
    () =>
      new MageziAllowance(
        initialAllowance.left,
        initialAllowance.perDay,
        initialAllowance.unlimited ?? false,
      ),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);
  const asked = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || pending || !allowance.canAsk) return;
    setMessages((m) => [...m, { id: nextId.current++, from: 'you', text }]);
    setAllowance((a) => a.spend());
    setDraft('');
    setPending(true);
    try {
      const answer = await mageziSource.answer({
        question: text,
        scope,
        resourceId,
        courseUnitCode,
      });
      setMessages((m) => [...m, { id: nextId.current++, from: 'magezi', answer }]);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      void ask(initialQuestion);
    }
    // Ask the opening question once, on first render only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [messages, pending]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  const lastAnswer = [...messages].reverse().find((m) => m.from === 'magezi');

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div
        role="log"
        aria-label="Conversation with Magezi"
        className={cn('flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto', bodyClassName)}
      >
        {messages.length === 0 && !pending ? (
          <div className="flex flex-wrap gap-2.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className={chipClass}
                onClick={() => void ask(s)}
                disabled={!allowance.canAsk}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {messages.map((message) =>
          message.from === 'you' ? (
            <p
              key={message.id}
              className="bg-inverse text-on-inverse max-w-[85%] self-end rounded-[18px] px-4 py-2.5 text-[16px] font-semibold"
            >
              <span className="sr-only">You asked: </span>
              {message.text}
            </p>
          ) : (
            <AnswerView key={message.id} answer={message.answer} />
          ),
        )}

        {pending ? (
          <p className="text-mute text-[15px]" role="status">
            Magezi is thinking…
          </p>
        ) : null}

        {lastAnswer && lastAnswer.from === 'magezi' && !pending ? (
          <div className="flex flex-wrap gap-2.5">
            {lastAnswer.answer.followUps.map((f) =>
              f === 'Quiz me on this' && lastAnswer.answer.quizTopicId ? (
                <Link
                  key={f}
                  href={SiteRoutes.quiz(lastAnswer.answer.quizTopicId)}
                  className={cn(chipClass, 'inline-flex items-center')}
                >
                  {f}
                </Link>
              ) : (
                <button
                  key={f}
                  type="button"
                  className={chipClass}
                  onClick={() => void ask(f)}
                  disabled={!allowance.canAsk}
                >
                  {f}
                </button>
              ),
            )}
          </div>
        ) : null}

        {!allowance.canAsk ? (
          <div
            className="sign bg-paper-tag-bg text-paper-tag-fg flex flex-col gap-2 p-4"
            role="status"
          >
            <p className="text-[16px] font-bold">
              Today&apos;s {allowance.perDay} free questions are used up
            </p>
            <p className="text-[15px]">They come back at midnight. Pro has no daily limit.</p>
            <Link href={SiteRoutes.pro} className="btn btn-sun mt-1 self-start">
              Go unlimited with Pro
            </Link>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className={cn('border-rule flex flex-col gap-3 border-t pt-4', footerClassName)}>
        <div className="flex items-center justify-between gap-3 text-[14.5px]">
          <span className="text-ink-2">{allowance.label}</span>
          {!allowance.unlimited ? (
            <Link href={SiteRoutes.pro} className="text-link font-bold">
              Go unlimited
            </Link>
          ) : null}
        </div>
        <form
          onSubmit={submit}
          className="bg-surface flex items-center gap-2 rounded-[18px] p-1.5 pl-4 shadow-[inset_0_0_0_2px_var(--edge)]"
        >
          <label htmlFor={`magezi-q-${scope}`} className="sr-only">
            Your question for Magezi
          </label>
          <input
            id={`magezi-q-${scope}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            disabled={!allowance.canAsk}
            className="placeholder:text-mute min-h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!allowance.canAsk || pending || draft.trim() === ''}
            className="bg-cobalt text-on-cobalt flex size-11 flex-none items-center justify-center rounded-[13px] disabled:opacity-50"
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

function AnswerView({ answer }: { answer: MageziAnswer }) {
  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-[17px] leading-relaxed">
        <span className="sr-only">Magezi: </span>
        <RichTextView text={answer.text} />
      </p>
      {answer.diagram ? (
        <figure className="panel grid items-center gap-4 p-4 sm:grid-cols-[minmax(0,220px)_1fr]">
          <BstDiagram />
          {answer.diagramNote ? (
            <figcaption className="text-ink-2 text-[15.5px] leading-relaxed">
              <RichTextView text={answer.diagramNote} />
            </figcaption>
          ) : null}
        </figure>
      ) : null}
      {answer.citation ? (
        <p className="text-ink-2 flex items-center gap-2 text-[15px] font-semibold">
          <FileText className="size-4" aria-hidden="true" />
          {answer.citation}
        </p>
      ) : null}
    </div>
  );
}
