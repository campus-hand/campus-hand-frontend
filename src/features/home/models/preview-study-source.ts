import { ExamCountdown, StudyPlan, type StudyOverview, type StudySource } from './study';

/**
 * The design's sample dashboard until the study plan, shelf and content
 * features exist in the API. TODO(backend): replace with the API.
 * TODO(content): every title, name and number here is illustration.
 */
export class PreviewStudySource implements StudySource {
  async overview(now: Date): Promise<StudyOverview> {
    const examDate = new Date(now.getTime() + 12 * 86_400_000);
    return {
      exam: new ExamCountdown('CSC 2100', examDate, 3, 7, {
        title: 'Trees and binary search trees',
        minutes: 40,
      }),
      plan: new StudyPlan([
        { id: 'p1', title: 'Big-O recap', when: 'Mon', done: true },
        { id: 'p2', title: 'Linked lists', when: 'Tue', done: true },
        { id: 'p3', title: 'Stacks and queues', when: 'Wed', done: true },
        { id: 'p4', title: 'Trees and BSTs', when: 'Tonight', done: false },
        { id: 'p5', title: 'Timed past paper, Dec 2024', when: 'Sun', done: false },
      ]),
      resume: [
        {
          id: 'pp1',
          title: 'Past paper, Paper 1',
          courseUnitCode: 'CSC 2100',
          kind: 'paper',
          position: { label: 'question 2 of 6', done: 2, total: 6 },
          stamp: 'DEC 2024',
        },
        {
          id: 'proc-sched',
          title: 'Process scheduling',
          courseUnitCode: 'CSC 2104',
          kind: 'lecture',
          position: { label: 'page 9 of 18', done: 9, total: 18 },
          stamp: 'LEC 6',
        },
      ],
      shelf: {
        total: 12,
        items: [
          {
            id: 'pp1',
            title: 'Exam, Paper 1, December 2024',
            courseUnitCode: 'CSC 2100',
            kind: 'paper',
            stamp: 'DEC 2024',
            offline: true,
          },
          {
            id: 'lec5',
            title: 'Lecture 5: Binary search trees',
            courseUnitCode: 'CSC 2100',
            kind: 'lecture',
            stamp: 'LEC 5',
            offline: true,
          },
          {
            id: 'proc-sched',
            title: 'Process scheduling',
            courseUnitCode: 'CSC 2104',
            kind: 'lecture',
            stamp: 'LEC 6',
            offline: false,
          },
        ],
      },
      newByCourseUnit: { 'CSC 2100': 3, 'CSC 2104': 1 },
      feed: [
        {
          id: 'avl',
          title: 'AVL rotations, worked examples',
          byline: 'Nakato Sarah, CSC 2100',
          kind: 'daily',
          stamp: '15 OCT',
        },
        {
          id: 'proc-sched',
          title: 'Process scheduling',
          byline: 'Dr. Atim Grace, lecturer, CSC 2104',
          kind: 'lecture',
          stamp: 'LEC 6',
        },
        {
          id: 'pp-2110-may25',
          title: 'Past paper, Paper 2',
          byline: 'CSC 2110, added by a moderator',
          kind: 'paper',
          stamp: 'MAY 2025',
        },
      ],
    };
  }
}
