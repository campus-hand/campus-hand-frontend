/** A course unit as shown in the landing "Filed the way your timetable is" list. */
export class CourseUnit {
  constructor(
    readonly code: string,
    readonly title: string,
    readonly noteCount: number,
    readonly paperCount: number,
  ) {}

  /** "18 notes, 6 papers" (singular when there is one). */
  get resourceSummary(): string {
    return `${CourseUnit.count(this.noteCount, 'note')}, ${CourseUnit.count(this.paperCount, 'paper')}`;
  }

  private static count(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`;
  }
}
