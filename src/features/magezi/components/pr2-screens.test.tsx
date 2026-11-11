import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { QuizScreen } from '@/features/quiz/components/quiz-screen';
import { PreviewQuizSource } from '@/features/quiz/models/preview-quiz-source';
import { ReaderScreen } from '@/features/reader/components/reader-screen';
import { PreviewResourceSource } from '@/features/reader/models/preview-resource-source';
import { AddToShelfSheet } from '@/features/shelf/components/add-to-shelf-sheet';
import { SHELF_STORAGE_KEY, ShelfStore } from '@/features/shelf/models/shelf-store';
import { BST_QUIZ_TOPIC, PreviewMageziSource } from '../models/preview-magezi-source';
import { MageziChat } from './magezi-chat';

const units = [
  { code: 'CSC 2100', title: 'Data Structures and Algorithms' },
  { code: 'CSC 2104', title: 'Operating Systems' },
];

beforeEach(() => localStorage.clear());

describe('MageziChat', () => {
  it('answers a suggestion, offers follow-ups and counts down the free questions', async () => {
    const user = userEvent.setup();
    render(
      <MageziChat
        scope="page"
        suggestions={['Explain 2(a)']}
        allowance={{ left: 2, perDay: 3 }}
        source={new PreviewMageziSource(0)}
      />,
    );
    expect(screen.getByText('2 of 3 free questions left today')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explain 2(a)' }));

    const log = screen.getByRole('log', { name: 'Conversation with Magezi' });
    expect(await within(log).findByText('From Lecture 5, page 7')).toBeInTheDocument();
    expect(within(log).getByRole('img', { name: /Binary search tree/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quiz me on this' })).toHaveAttribute(
      'href',
      `/quiz/${BST_QUIZ_TOPIC}`,
    );
    expect(screen.getByText('1 of 3 free questions left today')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Your question for Magezi' }), 'Do 2(b)');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await within(log).findByText(/O\(n\)/)).toBeInTheDocument();

    // Free questions used up: an upgrade note, and nothing more can be asked.
    expect(screen.getByText("Today's 3 free questions are used up")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go unlimited with Pro' })).toHaveAttribute(
      'href',
      '/pro',
    );
    expect(screen.getByRole('textbox', { name: 'Your question for Magezi' })).toBeDisabled();
  });

  it('asks an opening question straight away and has no limit on Pro', async () => {
    render(
      <MageziChat
        scope="campus"
        suggestions={[]}
        allowance={{ left: 0, perDay: 3, unlimited: true }}
        initialQuestion="Where do I pay for a retake?"
        source={new PreviewMageziSource(0)}
      />,
    );
    expect(await screen.findByText(/can’t look up campus offices/)).toBeInTheDocument();
    expect(screen.getByText('Pro: no daily limit')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Go unlimited' })).not.toBeInTheDocument();
  });
});

describe('QuizScreen', () => {
  it('shows why after each answer and a score at the end', async () => {
    const user = userEvent.setup();
    const quiz = (await new PreviewQuizSource().forTopic(BST_QUIZ_TOPIC))!;
    render(
      <QuizScreen definition={quiz} closeHref="/course-units/csc-2100" closeLabel="CSC 2100" />,
    );

    expect(screen.getByText('1 of 5')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^B\s*To the left/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Right, to the left' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^A\s*Pre-order/ }));
    expect(
      screen.getByRole('heading', { level: 2, name: "Not quite: it's C, In-order" }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^C\s*In-order, correct answer/ })).toBeDisabled();

    for (let i = 3; i <= 5; i++) {
      await user.click(screen.getByRole('button', { name: /Next question|See your score/ }));
      await user.click(screen.getAllByRole('button', { name: /^B\s*\S/ })[0]);
    }
    await user.click(screen.getByRole('button', { name: 'See your score' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/You got \d out of 5/);
    expect(screen.getByRole('link', { name: 'Back to CSC 2100' })).toHaveAttribute(
      'href',
      '/course-units/csc-2100',
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });
});

describe('AddToShelfSheet', () => {
  const resource = {
    id: 'pp1',
    title: 'Past paper, Paper 1',
    detail: 'CSC 2100, December 2024',
    kind: 'paper' as const,
    stamp: 'DEC 2024',
    courseUnitCode: 'CSC 2100',
  };

  it('preselects the matching course unit and files it on the shelf', async () => {
    const user = userEvent.setup();
    let filed: string | null | undefined;
    render(
      <AddToShelfSheet
        open
        onOpenChange={() => {}}
        resource={resource}
        units={units}
        isPro={false}
        onAdded={(code) => (filed = code)}
      />,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Add to my shelf' });
    expect(within(dialog).getByRole('radio', { name: /CSC 2100/ })).toBeChecked();
    expect(within(dialog).getByText('Matches this file')).toBeInTheDocument();
    // Offline reading is a Pro feature.
    expect(within(dialog).getByRole('switch', { name: 'Keep it readable offline' })).toBeDisabled();

    await user.click(within(dialog).getByRole('radio', { name: /Other/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Add to shelf' }));
    expect(filed).toBeNull();
    expect(new ShelfStore(localStorage).entries()[0]).toMatchObject({
      resourceId: 'pp1',
      courseUnitCode: null,
      offline: false,
    });
  });

  it('lets Pro keep a file offline, and says when it cannot be saved', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <AddToShelfSheet
        open
        onOpenChange={() => {}}
        resource={resource}
        units={units}
        isPro
        onAdded={() => {}}
      />,
    );
    await user.click(await screen.findByRole('switch', { name: 'Keep it readable offline' }));
    await user.click(screen.getByRole('button', { name: 'Add to shelf' }));
    expect(JSON.parse(localStorage.getItem(SHELF_STORAGE_KEY)!)[0].offline).toBe(true);
    unmount();

    render(
      <AddToShelfSheet
        open
        onOpenChange={() => {}}
        resource={{ ...resource, courseUnitCode: 'NOT MINE' }}
        units={units}
        isPro={false}
        onAdded={() => {}}
        store={new ShelfStore(null)}
      />,
    );
    expect(await screen.findByRole('radio', { name: /Other/ })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Add to shelf' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn't be saved/);
  });
});

describe('ReaderScreen', () => {
  it('opens on the saved page and moves between pages', async () => {
    const user = userEvent.setup();
    const paper = (await new PreviewResourceSource().find('pp1'))!;
    render(
      <ReaderScreen
        resource={paper}
        backHref="/course-units/csc-2100"
        backLabel="CSC 2100"
        units={units}
        allowance={{ left: 2, perDay: 3 }}
        isPro={false}
      />,
    );
    expect(screen.getByRole('link', { name: 'Back to CSC 2100' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Page 2 of 6' })).toHaveTextContent(
      'binary search tree',
    );
    await user.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    expect(screen.getByRole('article', { name: 'Page 3 of 6' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(screen.getByRole('article', { name: 'Page 1 of 6' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Previous page' })[0]).toBeDisabled();

    // Phone: open and close the Magezi panel; open the shelf sheet.
    await user.click(screen.getByRole('button', { name: 'Ask Magezi about this page' }));
    await user.click(screen.getByRole('button', { name: 'Close Magezi' }));
    await user.click(screen.getByRole('button', { name: 'Add to shelf' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add to my shelf' });
    await user.click(within(dialog).getByRole('button', { name: 'Add to shelf' }));
    expect(await screen.findByRole('button', { name: 'On your shelf' })).toBeInTheDocument();
  });
});
