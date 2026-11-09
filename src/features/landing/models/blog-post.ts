export type BlogTopic = 'Fees' | 'Hostels' | 'Food';

/** A campus blog teaser card. */
export class BlogPost {
  constructor(
    readonly topic: BlogTopic,
    readonly title: string,
    readonly author: string,
    readonly minutes: number,
  ) {}

  get byline(): string {
    return `${this.author}, ${this.minutes} minute read`;
  }
}
