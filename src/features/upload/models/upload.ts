import type { Placement } from './placement';

export type UploadKind = 'lecture' | 'daily' | 'paper' | 'tutorial' | 'book' | 'other';

export const UPLOAD_KINDS: { value: UploadKind; label: string }[] = [
  { value: 'lecture', label: 'Lecture notes' },
  { value: 'daily', label: 'Daily notes' },
  { value: 'paper', label: 'Past paper' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'book', label: 'Book' },
  { value: 'other', label: 'Other' },
];

/** Exams a past paper can come from. */
export const EXAM_SITTINGS = ['Final exam', 'Supplementary exam', 'Mid-semester test'] as const;

/** Past papers only from exams already sat: this year and the nine before. */
export function examYears(currentYear: number): number[] {
  return Array.from({ length: 10 }, (_, i) => currentYear - i);
}

/** Where a listed book can be found. */
export type BookPlace = 'library' | 'bookshop' | 'online';

export const BOOK_PLACES: { value: BookPlace; label: string }[] = [
  { value: 'library', label: 'University library' },
  { value: 'bookshop', label: 'Bookshop' },
  { value: 'online', label: 'Online' },
];

export interface BookDetails {
  readonly title: string;
  readonly authors: string;
  /** "2nd, 2011" */
  readonly editionYear: string;
  readonly isbn: string;
  readonly places: readonly BookPlace[];
  /** "Main Library, QA76.73 .G66" */
  readonly shelf: string;
  readonly whyItHelps: string;
}

export const EMPTY_BOOK: BookDetails = {
  title: '',
  authors: '',
  editionYear: '',
  isbn: '',
  places: [],
  shelf: '',
  whyItHelps: '',
};

export interface ChosenFile {
  readonly name: string;
  readonly sizeBytes: number;
  readonly type: string;
}

/** Files we can convert and show (PDF, Word, PowerPoint, photos). */
export const ACCEPTED_FILES = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png';
/** TODO(content): confirm the upload size limit with the owner. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = ACCEPTED_FILES.split(',');

/** "2.4 MB", "820 KB" */
export function fileSizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "PDF", "DOCX" … for the file badge. */
export function fileBadge(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1
    ? 'FILE'
    : name
        .slice(dot + 1)
        .toUpperCase()
        .slice(0, 4);
}

/** Why a chosen file can't be used, or null when it can. */
export function fileProblem(file: ChosenFile): string | null {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return 'Choose a PDF, Word or PowerPoint file, or a photo (JPG or PNG).';
  }
  if (file.sizeBytes > MAX_FILE_BYTES) return 'This file is over 25 MB. Choose a smaller file.';
  if (file.sizeBytes === 0) return 'This file is empty.';
  return null;
}

export type UploaderMode = 'member' | 'guest';
export type BookChoice = 'list' | 'share';

/** Everything on the upload form. */
export interface UploadValues {
  readonly file: ChosenFile | null;
  readonly placement: Placement;
  readonly kind: UploadKind | null;
  readonly title: string;
  readonly description: string;
  readonly examYear: string;
  readonly examSitting: string;
  readonly bookChoice: BookChoice;
  readonly book: BookDetails;
  readonly guestName: string;
  readonly guestContact: string;
  readonly rightsConfirmed: boolean;
}

export type UploadErrors = Partial<Record<string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{9,16}$/;

/** True when the upload is a book listed on the reading list (no file). */
export function isReadingListEntry(v: Pick<UploadValues, 'kind' | 'bookChoice'>): boolean {
  return v.kind === 'book' && v.bookChoice === 'list';
}

/**
 * Checks the upload form. Returns field ids mapped to messages, in the order
 * the fields appear, so the first one can take focus.
 */
export function validateUpload(v: UploadValues, mode: UploaderMode): UploadErrors {
  const errors: UploadErrors = {};
  const listing = isReadingListEntry(v);

  if (!listing && !v.file) errors.file = 'Choose the file to upload.';
  if (!listing && v.file) {
    const problem = fileProblem(v.file);
    if (problem) errors.file = problem;
  }
  const p = v.placement;
  if (!p.institutionSlug) errors.institution = 'Choose the university.';
  if (!p.programmeId) errors.programme = 'Choose the course (programme).';
  if (p.year === null) errors.year = 'Choose the year.';
  if (p.semester === null) errors.semester = 'Choose the semester.';
  if (!p.courseUnitId) errors.courseUnit = 'Choose the course unit.';
  if (!v.kind) errors.kind = 'Choose what it is.';

  if (v.kind === 'paper') {
    if (!v.examYear) errors.examYear = 'Choose the exam year.';
    if (!v.examSitting) errors.examSitting = 'Choose the exam.';
  }

  if (listing) {
    if (v.book.title.trim().length < 2) errors.bookTitle = 'Enter the book title.';
    if (v.book.authors.trim().length < 2) errors.bookAuthors = 'Enter the author or authors.';
    if (!v.book.editionYear.trim()) errors.bookEdition = 'Enter the edition and year.';
    if (v.book.isbn.trim() && !/^[\d-]{10,17}X?$/i.test(v.book.isbn.replace(/\s/g, ''))) {
      errors.bookIsbn = 'An ISBN has 10 or 13 digits.';
    }
    if (v.book.places.length === 0) errors.bookPlaces = 'Choose where students can find it.';
  } else {
    const title = v.title.trim();
    if (title.length < 3) errors.title = 'Give it a title students will recognise.';
    else if (title.length > 120) errors.title = 'Keep the title under 120 characters.';
    if (!v.rightsConfirmed) {
      errors.rights =
        mode === 'guest'
          ? 'Confirm you have the right to share this file.'
          : 'Confirm these are your notes or that you may share them.';
    }
  }
  if (v.description.length > 500) errors.description = 'Keep the description under 500 characters.';

  if (mode === 'guest') {
    const contact = v.guestContact.trim();
    if (contact && !EMAIL.test(contact) && !PHONE.test(contact)) {
      errors.guestContact = 'Enter an email or a phone number, or leave it empty.';
    }
  }
  return errors;
}

/** Points the canvas promises when an upload is approved (signed-in students only). */
export const POINTS_NOTE =
  'Daily notes 5, notes for a topic 15, a past paper 20 (50 with worked answers). Spend points on Pro.';

export type UploadStatus = 'live' | 'review' | 'changes';

export interface MyUpload {
  readonly id: string;
  readonly title: string;
  /** "CSC 2100, 214 views", "CSC 2104, sent yesterday" */
  readonly detail: string;
  readonly status: UploadStatus;
  /** Shown when a moderator asked for changes. */
  readonly moderatorNote?: string;
}

export interface UploadSource {
  /** Sends the file, reporting progress from 0 to 1. */
  sendFile(file: ChosenFile, onProgress: (share: number) => void): Promise<{ fileId: string }>;
  /** Sends the details for review (or adds a book to the reading list). */
  submit(values: UploadValues, mode: UploaderMode): Promise<{ ok: boolean; reference: string }>;
  myUploads(): Promise<MyUpload[]>;
}
