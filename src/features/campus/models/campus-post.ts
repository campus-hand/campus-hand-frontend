/** Campus blog categories, in the order the filter chips show them. */
export const CAMPUS_CATEGORIES = [
  'Fees',
  'Hostels',
  'Food',
  'Courses',
  'Freshers',
  'Events',
] as const;
export type CampusCategory = (typeof CAMPUS_CATEGORIES)[number];

/** A block of a post's body. */
export type PostBlock =
  | { readonly kind: 'p'; readonly text: string }
  | { readonly kind: 'h'; readonly text: string }
  | { readonly kind: 'steps'; readonly items: readonly string[] }
  | { readonly kind: 'tip'; readonly text: string };

export interface PostAuthor {
  readonly name: string;
  /** "Year 3 Law" */
  readonly line?: string;
}

/** A campus blog post: written by a student, checked by a moderator. */
export class CampusPost {
  constructor(
    readonly slug: string,
    readonly category: CampusCategory,
    readonly title: string,
    /** One or two sentences for the featured card and the post's lead. */
    readonly summary: string,
    readonly author: PostAuthor,
    readonly minutes: number,
    /** ISO date it went live. */
    readonly publishedOn: string,
    readonly body: readonly PostBlock[],
    /** What a moderator checked it against ("the official fees guide"), when they did. */
    readonly checkedAgainst?: string,
  ) {}

  get readTime(): string {
    return `${this.minutes} minute read`;
  }

  /** "Namusoke Joan, 5 minute read" */
  get byline(): string {
    return `${this.author.name}, ${this.readTime}`;
  }

  /** "Year 3 Law, 5 minute read", or just the read time. */
  get authorDetail(): string {
    return this.author.line ? `${this.author.line}, ${this.readTime}` : this.readTime;
  }

  /** "Namusoke Joan" -> "NJ" (as written, surname first, like the design). */
  get initials(): string {
    return this.author.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  /** "12 November 2026" */
  get publishedLabel(): string {
    const date = new Date(`${this.publishedOn}T12:00:00Z`);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Africa/Kampala',
    });
  }
}

/** Reads a category from a ?topic= value ("fees" -> "Fees"); null for anything else. */
export function categoryFromParam(value: string): CampusCategory | null {
  return CAMPUS_CATEGORIES.find((c) => c.toLowerCase() === value.trim().toLowerCase()) ?? null;
}

/** The posts for one category (all of them when null), newest first. */
export function postsIn(
  posts: readonly CampusPost[],
  category: CampusCategory | null,
): CampusPost[] {
  return posts
    .filter((p) => category === null || p.category === category)
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

/** Other posts to read next: same category first, then the newest. */
export function relatedPosts(
  posts: readonly CampusPost[],
  post: CampusPost,
  count = 3,
): CampusPost[] {
  const others = postsIn(posts, null).filter((p) => p.slug !== post.slug);
  return [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, count);
}

export interface CampusPostSource {
  /** Posts a moderator has checked. */
  list(): Promise<CampusPost[]>;
  find(slug: string): Promise<CampusPost | null>;
}
