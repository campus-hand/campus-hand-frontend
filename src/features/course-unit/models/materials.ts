import type { MaterialKind } from '@/features/home/models/study';

export interface MaterialFile {
  readonly id: string;
  readonly title: string;
  readonly kind: MaterialKind;
  /** "Mr. Okello, 24 pages", "2 pages" */
  readonly meta: string;
}

export type TopicProgress = 'revised' | 'current' | 'none';

export interface TopicMaterials {
  /** Matches the catalogue topic position (1, 2, …). */
  readonly position: number;
  readonly files: readonly MaterialFile[];
  /** Counts shown under the topic when it is closed, e.g. "3 notes, 1 tutorial". */
  readonly noteCount: number;
  readonly tutorialCount: number;
  readonly progress: TopicProgress;
}

export interface PastPaper {
  readonly id: string;
  /** "Dec 2024" */
  readonly sitting: string;
  readonly title: string;
  readonly withAnswers: boolean;
  readonly rating: number;
}

export interface UnitTutor {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  /** "A in CSC 2100, UGX 15,000 an hour" */
  readonly summary: string;
  readonly tone: 'sun' | 'forest' | 'red';
}

export interface CourseUnitMaterials {
  readonly lecturer: string | null;
  readonly following: boolean;
  readonly topics: readonly TopicMaterials[];
  readonly totals: { readonly notes: number; readonly papers: number; readonly tutors: number };
  readonly pastPapers: readonly PastPaper[];
  readonly tutors: readonly UnitTutor[];
}

export interface MaterialsSource {
  forCourseUnit(code: string): Promise<CourseUnitMaterials>;
}

export const EMPTY_MATERIALS: CourseUnitMaterials = {
  lecturer: null,
  following: false,
  topics: [],
  totals: { notes: 0, papers: 0, tutors: 0 },
  pastPapers: [],
  tutors: [],
};

/** "3 notes, 1 tutorial", "4 notes", "No notes yet". */
export function topicSummary(t: Pick<TopicMaterials, 'noteCount' | 'tutorialCount'>): string {
  const parts: string[] = [];
  if (t.noteCount > 0) parts.push(`${t.noteCount} note${t.noteCount === 1 ? '' : 's'}`);
  if (t.tutorialCount > 0) {
    parts.push(`${t.tutorialCount} tutorial${t.tutorialCount === 1 ? '' : 's'}`);
  }
  return parts.length > 0 ? parts.join(', ') : 'No notes yet';
}

/** "18 notes, 6 past papers, 3 tutors." */
export function totalsSentence(totals: CourseUnitMaterials['totals']): string {
  const n = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
  return `${n(totals.notes, 'note')}, ${n(totals.papers, 'past paper')}, ${n(totals.tutors, 'tutor')}.`;
}
