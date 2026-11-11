import { describe, expect, it } from 'vitest';
import { Quiz } from '@/features/quiz/models/quiz';
import { PreviewQuizSource } from '@/features/quiz/models/preview-quiz-source';
import { PreviewResourceSource } from '@/features/reader/models/preview-resource-source';
import { clampPage, longSubtitle, shortSubtitle } from '@/features/reader/models/resource';
import { parseRichText, plainText } from '@/features/reader/models/rich-text';
import {
  SHELF_STORAGE_KEY,
  ShelfStore,
  type ShelfStorage,
} from '@/features/shelf/models/shelf-store';
import { MageziAllowance } from './magezi';
import { BST_QUIZ_TOPIC, PreviewMageziSource } from './preview-magezi-source';

describe('MageziAllowance', () => {
  it('counts down free questions and stops at zero', () => {
    const a = new MageziAllowance(2, 3);
    expect(a.label).toBe('2 of 3 free questions left today');
    const b = a.spend().spend();
    expect(b.left).toBe(0);
    expect(b.canAsk).toBe(false);
    expect(b.label).toBe('No free questions left today');
    expect(b.spend().left).toBe(0);
    expect(new MageziAllowance(1, 1).label).toBe('1 of 1 free question left today');
  });

  it('has no daily limit on Pro', () => {
    const pro = new MageziAllowance(0, 3, true);
    expect(pro.canAsk).toBe(true);
    expect(pro.spend()).toBe(pro);
    expect(pro.label).toBe('Pro: no daily limit');
  });
});

describe('PreviewMageziSource', () => {
  const magezi = new PreviewMageziSource(0);

  it('answers the design’s 2(a) question with the drawing, source and quiz', async () => {
    const answer = await magezi.answer({ question: 'Explain 2(a)', scope: 'page' });
    expect(answer.diagram).toBe('bst-50-30-70-20-40');
    expect(answer.citation).toBe('From Lecture 5, page 7');
    expect(answer.quizTopicId).toBe(BST_QUIZ_TOPIC);
    expect(answer.followUps).toContain('Do 2(b)');
  });

  it.each([
    ['Do 2(b)', 'O(n)'],
    ['Explain 2(c)', 'rotates'],
    ['Explain more simply', 'phone book'],
  ])('answers "%s"', async (question, expected) => {
    expect((await magezi.answer({ question, scope: 'page' })).text).toContain(expected);
  });

  it('never invents campus facts in the preview', async () => {
    const campus = await magezi.answer({
      question: 'Where do I pay for a retake?',
      scope: 'campus',
    });
    expect(campus.text).toContain('can’t look up campus offices');
    expect(campus.followUps).toEqual([]);
    const other = await magezi.answer({ question: 'What is a heap?', scope: 'page' });
    expect(other.text).toContain('only answer the sample questions');
  });

  it('waits like a network call when asked to', async () => {
    const started = Date.now();
    await new PreviewMageziSource(20).answer({ question: 'hi', scope: 'page' });
    expect(Date.now() - started).toBeGreaterThanOrEqual(15);
  });
});

describe('rich text', () => {
  it('splits bold and highlighted runs', () => {
    expect(parseRichText('Start with **50** as the ==root== now')).toEqual([
      { kind: 'text', text: 'Start with ' },
      { kind: 'bold', text: '50' },
      { kind: 'text', text: ' as the ' },
      { kind: 'highlight', text: 'root' },
      { kind: 'text', text: ' now' },
    ]);
    expect(parseRichText('**unclosed')).toEqual([{ kind: 'text', text: '**unclosed' }]);
    expect(plainText('a **b** ==c==')).toBe('a b c');
  });
});

describe('reader resources', () => {
  it('finds the sample past paper, opening on page 2', async () => {
    const source = new PreviewResourceSource();
    const paper = await source.find('pp1');
    expect(paper?.pages).toHaveLength(6);
    expect(paper?.startPage).toBe(1);
    expect(longSubtitle(paper!)).toBe('CSC 2100 Data Structures and Algorithms, December 2024');
    expect(shortSubtitle(paper!, 1)).toBe('CSC 2100, Dec 2024, p. 2 of 6');
    expect(clampPage(paper!, 99)).toBe(5);
    expect(clampPage(paper!, -2)).toBe(0);
    expect(await source.find('nope')).toBeNull();
    expect((await source.find('proc-sched'))?.startPage).toBe(8);
  });
});

describe('Quiz', () => {
  it('scores answers and moves through to the end', async () => {
    const definition = (await new PreviewQuizSource().forTopic(BST_QUIZ_TOPIC))!;
    let quiz = Quiz.start(definition);
    expect(quiz.positionLabel).toBe('1 of 5');
    expect(quiz.segment(0)).toBe('current');
    expect(quiz.segment(1)).toBe('upcoming');

    quiz = quiz.answer(quiz.question.correctIndex);
    expect(quiz.status).toBe('answered');
    expect(quiz.isRight).toBe(true);
    expect(quiz.answer(0)).toBe(quiz); // can't change an answer
    expect(quiz.next().segment(0)).toBe('done');

    for (let i = 1; i < quiz.total; i++) {
      quiz = quiz.next().answer(0); // option A: right only for some questions
    }
    expect(quiz.isLast).toBe(true);
    quiz = quiz.next();
    expect(quiz.status).toBe('finished');
    expect(quiz.segment(4)).toBe('done');
    expect(quiz.scoreLabel).toBe(`${quiz.correctCount} out of 5`);
    expect(quiz.restart().positionLabel).toBe('1 of 5');
  });

  it('ignores out-of-range answers and early "next"', async () => {
    const quiz = Quiz.start((await new PreviewQuizSource().forTopic(BST_QUIZ_TOPIC))!);
    expect(quiz.answer(9)).toBe(quiz);
    expect(quiz.next()).toBe(quiz);
    expect(await new PreviewQuizSource().forTopic('other')).toBeNull();
    expect(() => Quiz.start({ ...quiz.definition, questions: [] })).toThrow();
  });
});

class MemoryStorage implements ShelfStorage {
  readonly data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

describe('ShelfStore', () => {
  it('adds and refiles resources on this device', () => {
    const storage = new MemoryStorage();
    const shelf = new ShelfStore(storage, () => 1000);
    expect(shelf.add('pp1', 'CSC 2100', false)).toBe(true);
    expect(shelf.add('pp1', null, true)).toBe(true);
    expect(shelf.entries()).toEqual([
      { resourceId: 'pp1', courseUnitCode: null, offline: true, addedAt: 1000 },
    ]);
    expect(shelf.has('pp1')).toBe(true);
    expect(shelf.has('lec5')).toBe(false);
  });

  it('copes with blocked or damaged storage', () => {
    const broken: ShelfStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(new ShelfStore(broken).entries()).toEqual([]);
    expect(new ShelfStore(broken).add('pp1', null, false)).toBe(false);
    expect(new ShelfStore(null).add('pp1', null, false)).toBe(false);
    const damaged = new MemoryStorage();
    damaged.setItem(SHELF_STORAGE_KEY, '{"not":"a list"}');
    expect(new ShelfStore(damaged).entries()).toEqual([]);
    expect(ShelfStore.forBrowser()).toBeInstanceOf(ShelfStore);
  });
});
