import { type CourseUnitMaterials, EMPTY_MATERIALS, type MaterialsSource } from './materials';

/**
 * Sample notes, papers and tutors from the design canvas (CSC 2100 only).
 * Other course units are empty until uploads exist.
 * TODO(backend): replace with the content API. TODO(content): illustration only.
 */
const SAMPLES: Record<string, CourseUnitMaterials> = {
  'CSC 2100': {
    lecturer: 'Mr. Okello Daniel',
    following: true,
    totals: { notes: 18, papers: 6, tutors: 3 },
    topics: [
      { position: 1, noteCount: 3, tutorialCount: 1, progress: 'revised', files: [] },
      { position: 2, noteCount: 4, tutorialCount: 0, progress: 'revised', files: [] },
      { position: 3, noteCount: 3, tutorialCount: 1, progress: 'revised', files: [] },
      {
        position: 4,
        noteCount: 3,
        tutorialCount: 1,
        progress: 'current',
        files: [
          {
            id: 'lec5',
            title: 'Lecture 5: Binary search trees',
            kind: 'lecture',
            meta: 'Mr. Okello, 24 pages',
          },
          {
            id: 'avl',
            title: 'AVL rotations, worked examples',
            kind: 'daily',
            meta: 'Nakato Sarah, 4 pages',
          },
          {
            id: 'trav',
            title: 'Tree traversals cheat sheet',
            kind: 'daily',
            meta: 'Okot Denis, 2 pages',
          },
          { id: 'tut4', title: 'Tutorial sheet 4', kind: 'tutorial', meta: '2 pages' },
        ],
      },
      { position: 5, noteCount: 2, tutorialCount: 0, progress: 'none', files: [] },
      { position: 6, noteCount: 0, tutorialCount: 0, progress: 'none', files: [] },
      { position: 7, noteCount: 3, tutorialCount: 0, progress: 'none', files: [] },
    ],
    pastPapers: [
      { id: 'pp1', sitting: 'Dec 2024', title: 'Paper 1', withAnswers: true, rating: 4.8 },
      { id: 'pp2', sitting: 'May 2024', title: 'Paper 1', withAnswers: false, rating: 4.6 },
      { id: 'pp3', sitting: 'Dec 2023', title: 'Paper 1', withAnswers: true, rating: 4.7 },
      { id: 'pp4', sitting: 'Aug 2023', title: 'Supplementary', withAnswers: false, rating: 4.2 },
    ],
    tutors: [
      {
        id: 'brian-okello',
        name: 'Brian Okello',
        initials: 'BO',
        summary: 'A in CSC 2100, UGX 15,000 an hour',
        tone: 'sun',
      },
      {
        id: 'atim-grace',
        name: 'Dr. Atim Grace',
        initials: 'AG',
        summary: 'Lecturer, UGX 30,000 an hour',
        tone: 'forest',
      },
    ],
  },
};

export class PreviewMaterialsSource implements MaterialsSource {
  async forCourseUnit(code: string): Promise<CourseUnitMaterials> {
    return SAMPLES[code] ?? EMPTY_MATERIALS;
  }
}
