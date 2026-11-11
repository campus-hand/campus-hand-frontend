// Sample files for the reader until uploads exist in the API.
// TODO(content): illustration only (the canvas's CSC 2100 sample).
import type { ReaderPage, ReaderResource } from '../models/resource';

const sample = (title: string): ReaderPage => ({
  blocks: [
    { kind: 'heading', text: title },
    {
      kind: 'paragraph',
      text: 'This is a sample page. The real file appears here once uploads are live.',
    },
  ],
});

const PAST_PAPER_SUGGESTIONS = ['Explain 2(a)', 'Do 2(b)', 'Explain more simply'];

const paperOne: ReaderResource = {
  id: 'pp1',
  title: 'Past paper, Paper 1',
  kind: 'paper',
  courseUnitCode: 'CSC 2100',
  courseUnitTitle: 'Data Structures and Algorithms',
  when: 'December 2024',
  sizeLabel: '1.1 MB',
  stamp: 'DEC 2024',
  startPage: 1,
  suggestions: PAST_PAPER_SUGGESTIONS,
  pages: [
    {
      blocks: [
        { kind: 'heading', text: 'CSC 2100 Data Structures and Algorithms' },
        { kind: 'paragraph', text: 'End of semester examination, December 2024. Time: 3 hours.' },
        {
          kind: 'paragraph',
          text: 'Answer all questions in Section A and any two questions from Section B.',
        },
      ],
    },
    {
      blocks: [
        { kind: 'section', text: 'Section A' },
        {
          kind: 'question',
          number: '2.',
          part: '(a)',
          ref: '2(a)',
          text: 'Insert the keys 50, 30, 70, 20, 40 into an empty ==binary search tree== and draw the result.',
          marks: 6,
        },
        {
          kind: 'question',
          part: '(b)',
          ref: '2(b)',
          text: 'State the worst-case time complexity of searching a binary search tree with n nodes, and say when it happens.',
          marks: 4,
        },
        {
          kind: 'question',
          part: '(c)',
          ref: '2(c)',
          text: 'Explain how an AVL tree avoids this worst case.',
          marks: 5,
        },
        {
          kind: 'question',
          number: '3.',
          part: '(a)',
          ref: '3(a)',
          text: 'Explain the difference between a stack and a queue, giving one real use of each.',
          marks: 6,
        },
        {
          kind: 'question',
          part: '(b)',
          ref: '3(b)',
          text: 'Show how a queue can be built from two stacks.',
        },
      ],
    },
    sample('Section A, question 4'),
    sample('Section B, question 5'),
    sample('Section B, question 6'),
    sample('Section B, question 7'),
  ],
};

const simple = (
  id: string,
  title: string,
  kind: ReaderResource['kind'],
  courseUnitCode: string,
  courseUnitTitle: string,
  when: string,
  stamp: string,
  pages: number,
): ReaderResource => ({
  id,
  title,
  kind,
  courseUnitCode,
  courseUnitTitle,
  when,
  stamp,
  sizeLabel: `${(0.2 * pages).toFixed(1)} MB`,
  startPage: 0,
  suggestions: ['Explain this page', 'Explain more simply'],
  pages: Array.from({ length: pages }, (_, i) => sample(`${title}, page ${i + 1}`)),
});

const DSA = 'Data Structures and Algorithms';
const OS = 'Operating Systems';

export const previewResources: readonly ReaderResource[] = [
  paperOne,
  simple('pp2', 'Past paper, Paper 1', 'paper', 'CSC 2100', DSA, 'May 2024', 'MAY 2024', 5),
  simple('pp3', 'Past paper, Paper 1', 'paper', 'CSC 2100', DSA, 'December 2023', 'DEC 2023', 6),
  simple(
    'pp4',
    'Past paper, Supplementary',
    'paper',
    'CSC 2100',
    DSA,
    'August 2023',
    'AUG 2023',
    4,
  ),
  simple(
    'lec5',
    'Lecture 5: Binary search trees',
    'lecture',
    'CSC 2100',
    DSA,
    'Lecture 5',
    'LEC 5',
    24,
  ),
  simple(
    'avl',
    'AVL rotations, worked examples',
    'daily',
    'CSC 2100',
    DSA,
    '15 October',
    '15 OCT',
    4,
  ),
  simple('trav', 'Tree traversals cheat sheet', 'daily', 'CSC 2100', DSA, 'Week 6', 'WK 6', 2),
  simple('tut4', 'Tutorial sheet 4', 'tutorial', 'CSC 2100', DSA, 'Week 6', 'TUT 4', 2),
  {
    ...simple(
      'proc-sched',
      'Process scheduling',
      'lecture',
      'CSC 2104',
      OS,
      'Lecture 6',
      'LEC 6',
      18,
    ),
    startPage: 8,
  },
  simple(
    'pp-2110-may25',
    'Past paper, Paper 2',
    'paper',
    'CSC 2110',
    'Database Systems',
    'May 2025',
    'MAY 2025',
    4,
  ),
];
