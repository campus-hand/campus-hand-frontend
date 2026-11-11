/** Where a question is asked from: a page in the reader, a course unit, or the campus assistant. */
export type MageziScope = 'page' | 'unit' | 'campus';

export interface MageziQuestion {
  readonly question: string;
  readonly scope: MageziScope;
  /** The file open in the reader, when asked from a page. */
  readonly resourceId?: string;
  /** e.g. "CSC 2100", when asked about a course unit. */
  readonly courseUnitCode?: string;
}

export interface MageziAnswer {
  /** Text with **bold** and ==highlight== markers (see rich-text.ts). */
  readonly text: string;
  /** A drawing to show under the text. */
  readonly diagram?: 'bst-50-30-70-20-40';
  /** "Check your drawing: …" note beside the drawing. */
  readonly diagramNote?: string;
  /** Where the answer came from, e.g. "From Lecture 5, page 7". */
  readonly citation?: string;
  /** Next questions to offer as chips. */
  readonly followUps: readonly string[];
  /** When set, "Quiz me on this" opens this topic's quiz. */
  readonly quizTopicId?: string;
}

export interface MageziSource {
  answer(question: MageziQuestion): Promise<MageziAnswer>;
}

/**
 * Free Magezi questions left today. Free students get 3 a day (docs: AI costs
 * by feature), reset at midnight Kampala time; Pro has no daily limit here.
 */
export class MageziAllowance {
  constructor(
    readonly left: number,
    readonly perDay: number,
    readonly unlimited = false,
  ) {}

  get canAsk(): boolean {
    return this.unlimited || this.left > 0;
  }

  /** The allowance after asking one question (unchanged on Pro). */
  spend(): MageziAllowance {
    if (this.unlimited) return this;
    return new MageziAllowance(Math.max(0, this.left - 1), this.perDay, false);
  }

  /** "2 of 3 free questions left today", "No free questions left today". */
  get label(): string {
    if (this.unlimited) return 'Pro: no daily limit';
    if (this.left === 0) return 'No free questions left today';
    return `${this.left} of ${this.perDay} free question${this.perDay === 1 ? '' : 's'} left today`;
  }
}
