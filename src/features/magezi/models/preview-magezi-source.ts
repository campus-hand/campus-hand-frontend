import type { MageziAnswer, MageziQuestion, MageziSource } from './magezi';

/** The topic quiz for "Trees and binary search trees" in the sample catalogue. */
export const BST_QUIZ_TOPIC = 'csc-2100-t4';

const normalise = (q: string) =>
  q
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9()]+/g, ' ');

/**
 * Canned answers from the design canvas until Magezi runs on the API.
 * Anything else gets an honest "not in the preview yet" reply, never an
 * invented fact about a university.
 * TODO(backend): replace with the Magezi API. TODO(content): sample answers.
 */
export class PreviewMageziSource implements MageziSource {
  constructor(private readonly delayMs = 500) {}

  async answer(question: MageziQuestion): Promise<MageziAnswer> {
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));
    const q = normalise(question.question);

    if (q.includes('2(a)') || q.includes('2 a') || q.includes('binary search tree')) {
      return {
        text: 'Start with **50** as the root. Each new key goes **left if it is smaller** and **right if it is bigger**, checking from the root down.',
        diagram: 'bst-50-30-70-20-40',
        diagramNote: '**Check your drawing:** reading it left to right gives 20, 30, 40, 50, 70.',
        citation: 'From Lecture 5, page 7',
        followUps: ['Quiz me on this', 'Explain more simply', 'Do 2(b)'],
        quizTopicId: BST_QUIZ_TOPIC,
      };
    }
    if (q.includes('2(b)') || q.includes('2 b') || q.includes('worst')) {
      return {
        text: 'The worst case is **O(n)**. It happens when the keys arrive already sorted, so every node hangs off one side and the tree becomes a **chain**: a search may visit every node.',
        citation: 'From Lecture 5, page 9',
        followUps: ['Explain 2(c)', 'Quiz me on this'],
        quizTopicId: BST_QUIZ_TOPIC,
      };
    }
    if (q.includes('2(c)') || q.includes('avl')) {
      return {
        text: 'An AVL tree keeps the heights of every node’s two sides within **1** of each other. After each insert it checks the balance and, if needed, **rotates** nodes, so the height stays about **log n** and searches stay fast.',
        citation: 'From AVL rotations, worked examples',
        followUps: ['Quiz me on this', 'Explain more simply'],
        quizTopicId: BST_QUIZ_TOPIC,
      };
    }
    if (q.includes('simply') || q.includes('simpler')) {
      return {
        text: 'Think of a phone book sorted by name. To find someone you open the middle, then go **left** for earlier names and **right** for later ones. A binary search tree stores numbers the same way, so you skip half of what is left at every step.',
        followUps: ['Explain 2(a)', 'Quiz me on this'],
        quizTopicId: BST_QUIZ_TOPIC,
      };
    }
    if (question.scope === 'campus') {
      return {
        text: 'In this preview I can’t look up campus offices, fees or dates yet. Once your university’s campus guides are added, I’ll answer from them and show where each answer came from.',
        followUps: [],
      };
    }
    return {
      text: 'In this preview I can only answer the sample questions on the CSC 2100 past paper. Once Magezi is live, I’ll answer from this file and your course unit’s notes.',
      followUps: ['Explain 2(a)', 'Do 2(b)'],
    };
  }
}
