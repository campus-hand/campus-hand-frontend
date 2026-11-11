import { kampalaDaysBetween } from './kampala-time';

/** The next exam and how revision for it is going. */
export class ExamCountdown {
  constructor(
    readonly courseUnitCode: string,
    readonly examDate: Date,
    readonly topicsRevised: number,
    readonly topicsTotal: number,
    /** What to revise tonight, from the study plan. */
    readonly tonight: { readonly title: string; readonly minutes: number } | null,
  ) {}

  /** Calendar days until the exam in Kampala (never below 0). */
  daysLeft(now: Date): number {
    return Math.max(0, kampalaDaysBetween(now, this.examDate));
  }

  /** "12 days", "1 day", "Today". */
  daysLeftLabel(now: Date): string {
    const days = this.daysLeft(now);
    if (days === 0) return 'Today';
    return `${days} day${days === 1 ? '' : 's'}`;
  }

  get revisedShare(): number {
    return this.topicsTotal === 0 ? 0 : Math.min(1, this.topicsRevised / this.topicsTotal);
  }

  /**
   * On track when the share of topics revised keeps pace with the time used
   * so far, measured against a revision window that starts `windowDays` before
   * the exam (default four weeks).
   */
  isOnTrack(now: Date, windowDays = 28): boolean {
    const used = 1 - Math.min(windowDays, this.daysLeft(now)) / windowDays;
    return this.revisedShare >= used - 0.15;
  }
}

export interface PlanTask {
  readonly id: string;
  readonly title: string;
  /** "Mon", "Tonight", "Sun" … as the plan shows it. */
  readonly when: string;
  readonly done: boolean;
}

/** This week's revision plan. */
export class StudyPlan {
  constructor(readonly tasks: readonly PlanTask[]) {}

  get doneCount(): number {
    return this.tasks.filter((t) => t.done).length;
  }

  /** The first task not done yet (what "Tonight" points at). */
  get next(): PlanTask | undefined {
    return this.tasks.find((t) => !t.done);
  }

  toggle(id: string): StudyPlan {
    return new StudyPlan(this.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }
}

export type MaterialKind = 'lecture' | 'daily' | 'paper' | 'tutorial';

/** A note or paper the student was part-way through. */
export interface ResumeItem {
  readonly id: string;
  readonly title: string;
  readonly courseUnitCode: string;
  readonly kind: MaterialKind;
  /** "question 2 of 6", "page 9 of 18" */
  readonly position: { readonly label: string; readonly done: number; readonly total: number };
  /** Small stamp on the sheet thumbnail: "DEC 2024", "LEC 6". */
  readonly stamp: string;
}

export interface ShelfItem {
  readonly id: string;
  readonly title: string;
  readonly courseUnitCode: string;
  readonly kind: MaterialKind;
  readonly stamp: string;
  readonly offline: boolean;
}

/** Something a classmate (or lecturer, or moderator) added to one of the viewer's course units. */
export interface FeedItem {
  readonly id: string;
  readonly title: string;
  readonly byline: string;
  readonly kind: MaterialKind;
  readonly stamp: string;
}

export interface StudyOverview {
  readonly exam: ExamCountdown | null;
  readonly plan: StudyPlan;
  readonly resume: readonly ResumeItem[];
  readonly shelf: { readonly items: readonly ShelfItem[]; readonly total: number };
  /** New files per course unit code since the last visit. */
  readonly newByCourseUnit: Readonly<Record<string, number>>;
  readonly feed: readonly FeedItem[];
}

export interface StudySource {
  overview(now: Date): Promise<StudyOverview>;
}
