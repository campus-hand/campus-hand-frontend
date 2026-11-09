export type TutorAvatarTone = 'sun' | 'daily' | 'note';

/** A tutor card on the landing page. */
export class Tutor {
  constructor(
    readonly name: string,
    readonly headline: string,
    readonly rating: number,
    readonly verification: string,
    readonly tone: TutorAvatarTone = 'sun',
  ) {}

  /** "Dr. Atim Grace" -> "AG" (titles like Dr. are skipped). */
  get initials(): string {
    return this.name
      .split(/\s+/)
      .filter((part) => part && !part.endsWith('.'))
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('');
  }

  get ratingLabel(): string {
    return this.rating.toFixed(1);
  }
}
