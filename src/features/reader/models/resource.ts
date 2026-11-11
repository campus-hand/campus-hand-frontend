import type { MaterialKind } from '@/features/home/models/study';

/**
 * One block of a page as the reader draws it on the ruled sheet. Text may
 * mark terms with ==double equals== to highlight them (see rich-text.ts).
 */
export type PageBlock =
  | { readonly kind: 'section'; readonly text: string }
  | { readonly kind: 'heading'; readonly text: string }
  | { readonly kind: 'paragraph'; readonly text: string }
  | {
      readonly kind: 'question';
      /** "2." on the first part of a question, nothing on later parts. */
      readonly number?: string;
      /** "(a)" */
      readonly part?: string;
      readonly text: string;
      readonly marks?: number;
      /** What Magezi calls this part, e.g. "2(a)". */
      readonly ref?: string;
    };

export interface ReaderPage {
  readonly blocks: readonly PageBlock[];
}

/** A note, past paper or tutorial opened in the reader. */
export interface ReaderResource {
  readonly id: string;
  /** "Past paper, Paper 1" */
  readonly title: string;
  readonly kind: MaterialKind;
  readonly courseUnitCode: string;
  readonly courseUnitTitle: string;
  /** "December 2024", "Lecture 5" … */
  readonly when: string;
  /** "1.1 MB" */
  readonly sizeLabel: string;
  /** Short date for the shelf stamp, e.g. "DEC 2024". */
  readonly stamp: string;
  /** Page to open on (0-based), e.g. where the student stopped. */
  readonly startPage: number;
  readonly pages: readonly ReaderPage[];
  /** Questions Magezi offers first on this resource. */
  readonly suggestions: readonly string[];
}

export interface ResourceSource {
  /** null when there is no such resource. */
  find(id: string): Promise<ReaderResource | null>;
}

/** "CSC 2100 Data Structures and Algorithms, December 2024" */
export function longSubtitle(r: ReaderResource): string {
  return `${r.courseUnitCode} ${r.courseUnitTitle}, ${r.when}`;
}

/** "CSC 2100, Dec 2024, p. 2 of 6" */
export function shortSubtitle(r: ReaderResource, pageIndex: number): string {
  const when = r.when.replace(/^(\w{3})\w+ /, '$1 ');
  return `${r.courseUnitCode}, ${when}, p. ${pageIndex + 1} of ${r.pages.length}`;
}

/** Keeps a page number inside the resource (0-based). */
export function clampPage(r: Pick<ReaderResource, 'pages'>, index: number): number {
  return Math.min(Math.max(0, index), Math.max(0, r.pages.length - 1));
}
