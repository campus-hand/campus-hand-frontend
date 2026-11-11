export interface QuizQuestion {
  readonly id: string;
  /** Question in sentence case; the screen shows it in display type. */
  readonly prompt: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  /** Headline when right, e.g. "Right, height 3". */
  readonly rightTitle: string;
  /** Why the right answer is right (shown after answering). */
  readonly explanation: string;
}

export interface QuizDefinition {
  readonly topicId: string;
  readonly topicTitle: string;
  /** "from Lecture 5 and the Dec 2024 paper" */
  readonly sources: string;
  readonly courseUnitCode: string;
  readonly questions: readonly QuizQuestion[];
}

export interface QuizSource {
  forTopic(topicId: string): Promise<QuizDefinition | null>;
}

export type QuizStatus = 'asking' | 'answered' | 'finished';

/**
 * A run through one quiz: answer, see why, go to the next question.
 * Immutable: every action returns the next state.
 */
export class Quiz {
  private constructor(
    readonly definition: QuizDefinition,
    readonly index: number,
    readonly chosen: number | null,
    readonly correctCount: number,
    readonly status: QuizStatus,
  ) {}

  static start(definition: QuizDefinition): Quiz {
    if (definition.questions.length === 0) throw new Error('A quiz needs at least one question');
    return new Quiz(definition, 0, null, 0, 'asking');
  }

  get question(): QuizQuestion {
    return this.definition.questions[this.index];
  }

  get total(): number {
    return this.definition.questions.length;
  }

  /** "3 of 5" */
  get positionLabel(): string {
    return `${this.index + 1} of ${this.total}`;
  }

  get isRight(): boolean {
    return this.chosen === this.question.correctIndex;
  }

  get isLast(): boolean {
    return this.index === this.total - 1;
  }

  /** Progress segment state for question i: done, current or upcoming. */
  segment(i: number): 'done' | 'current' | 'upcoming' {
    if (this.status === 'finished' || i < this.index) return 'done';
    return i === this.index ? 'current' : 'upcoming';
  }

  answer(optionIndex: number): Quiz {
    if (this.status !== 'asking') return this;
    if (optionIndex < 0 || optionIndex >= this.question.options.length) return this;
    const right = optionIndex === this.question.correctIndex;
    return new Quiz(
      this.definition,
      this.index,
      optionIndex,
      this.correctCount + (right ? 1 : 0),
      'answered',
    );
  }

  next(): Quiz {
    if (this.status !== 'answered') return this;
    if (this.isLast) {
      return new Quiz(this.definition, this.index, this.chosen, this.correctCount, 'finished');
    }
    return new Quiz(this.definition, this.index + 1, null, this.correctCount, 'asking');
  }

  /** "4 out of 5" */
  get scoreLabel(): string {
    return `${this.correctCount} out of ${this.total}`;
  }

  restart(): Quiz {
    return Quiz.start(this.definition);
  }
}
