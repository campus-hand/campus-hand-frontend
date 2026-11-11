import type { DataMode } from '@/features/catalogue/models/data-mode';

export type ViewerRole = 'student' | 'lecturer';

/** Where the viewer studies: what the catalogue needs to list their course units. */
export interface StudyPlace {
  readonly institutionSlug: string;
  readonly programmeCode: string;
  readonly year: number;
  readonly semester: number;
}

/** The signed-in person, as the app screens need them. */
export class Viewer {
  constructor(
    readonly name: string,
    readonly role: ViewerRole,
    readonly verified: boolean,
    readonly studyPlace: StudyPlace,
    /** Free Magezi credits left today and the daily allowance (docs: 3 a day). */
    readonly credits: { readonly left: number; readonly perDay: number },
  ) {}

  /** "Nakato Sarah" -> "Sarah" (Ugandan names are often written surname first). */
  get firstName(): string {
    const parts = this.name.trim().split(/\s+/);
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }

  /** "Nakato Sarah" -> "SN": first name, then surname, as in the design's avatar. */
  get initials(): string {
    const parts = this.name.trim().split(/\s+/);
    const letters = parts.length > 1 ? [this.firstName, parts[0]] : [parts[0]];
    return letters.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  /** "Verified student", "Lecturer", "Student (not verified yet)". */
  get statusLabel(): string {
    const role = this.role === 'lecturer' ? 'lecturer' : 'student';
    return this.verified
      ? `Verified ${role}`
      : `${role[0].toUpperCase()}${role.slice(1)} (not verified yet)`;
  }

  /** Share of today's free Magezi credits still left, 0 to 1. */
  get creditsLeftShare(): number {
    if (this.credits.perDay <= 0) return 0;
    return Math.min(1, Math.max(0, this.credits.left / this.credits.perDay));
  }
}

export interface ViewerSource {
  current(): Promise<Viewer>;
}

/**
 * Stand-in until sign-in is live: the design's sample student. On the API
 * catalogue they study the imported UICT sample; in preview, the canvas sample.
 * TODO(backend): read the signed-in user's profile instead.
 */
export class PreviewViewerSource implements ViewerSource {
  constructor(private readonly mode: DataMode) {}

  async current(): Promise<Viewer> {
    const studyPlace: StudyPlace =
      this.mode === 'api'
        ? { institutionSlug: 'uict', programmeCode: 'SAMPLE-DCS', year: 1, semester: 2 }
        : { institutionSlug: 'sample', programmeCode: 'BSCS', year: 2, semester: 1 };
    // TODO(content): sample student from the design canvas.
    return new Viewer('Nakato Sarah', 'student', true, studyPlace, { left: 2, perDay: 3 });
  }
}
