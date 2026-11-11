import { formatUgx } from '@/lib/format';
import type { WeeklyTimes } from './availability';

export type TutorKind = 'student' | 'lecturer' | 'external';

/** How the tutor was checked, shown as a badge. */
export interface TutorCheck {
  /** "A in CSC 2100, checked", "Verified lecturer", "ID and degree checked" */
  readonly label: string;
  readonly tone: 'note' | 'daily' | 'plain';
}

/** A tutor as the list and profile need them (plain data, so it can cross to the browser). */
export interface TutorProfile {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly tone: 'sun' | 'forest' | 'red';
  readonly kind: TutorKind;
  /** "Senior student, Year 4 Computer Science" */
  readonly roleLine: string;
  readonly check: TutorCheck;
  /** How they were checked, as the profile says it ("Results slip checked"). */
  readonly profileCheck: TutorCheck;
  /** Grades shown on the profile, e.g. "A in CSC 2100". */
  readonly grades: readonly string[];
  readonly rating: number;
  readonly sessions: number;
  /** Their guide price in UGX for one hour. */
  readonly hourlyRate: number;
  readonly bio: string;
  /** Course unit codes they tutor. */
  readonly courseUnitCodes: readonly string[];
  readonly offered: WeeklyTimes;
  readonly booked: WeeklyTimes;
}

/** "Brian Okello" -> "Brian" (the first name, for "Request Brian"). */
export function firstNameOf(tutor: Pick<TutorProfile, 'name'>): string {
  return tutor.name.replace(/^(Dr|Mr|Mrs|Ms|Prof)\.\s+/, '').split(/\s+/)[0];
}

/** "4.9 from 32 sessions" */
export function ratingLabel(tutor: Pick<TutorProfile, 'rating' | 'sessions'>): string {
  return `${tutor.rating.toFixed(1)} from ${tutor.sessions} session${tutor.sessions === 1 ? '' : 's'}`;
}

export const SESSION_LENGTHS = [
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
] as const;

/** Guide price for a session of `minutes` at the tutor's hourly rate. */
export function sessionPrice(hourlyRate: number, minutes: number): number {
  return Math.round((hourlyRate * minutes) / 60 / 500) * 500; // to the nearest UGX 500
}

export interface TutorFilters {
  /** Only tutors for this course unit code ("" = all). */
  readonly unitCode: string;
  readonly freeToday: boolean;
  readonly seniorStudents: boolean;
  readonly lecturers: boolean;
  readonly under20k: boolean;
}

export const NO_FILTERS: TutorFilters = {
  unitCode: '',
  freeToday: false,
  seniorStudents: false,
  lecturers: false,
  under20k: false,
};

/**
 * Applies the list's filter chips. "Senior students" and "Lecturers" widen
 * each other (either kind); the rest narrow the list.
 */
export function filterTutors(
  tutors: readonly TutorProfile[],
  filters: TutorFilters,
  isFreeToday: (tutor: TutorProfile) => boolean,
): TutorProfile[] {
  const kinds = new Set<TutorKind>();
  if (filters.seniorStudents) kinds.add('student');
  if (filters.lecturers) kinds.add('lecturer');
  return tutors.filter(
    (t) =>
      (!filters.unitCode || t.courseUnitCodes.includes(filters.unitCode)) &&
      (kinds.size === 0 || kinds.has(t.kind)) &&
      (!filters.under20k || t.hourlyRate < 20_000) &&
      (!filters.freeToday || isFreeToday(t)),
  );
}

/** "UGX 15,000" + " an hour" is split in the UI; this is the amount part. */
export function hourlyLabel(tutor: Pick<TutorProfile, 'hourlyRate'>): string {
  return formatUgx(tutor.hourlyRate);
}

export interface BookingRequest {
  readonly tutorId: string;
  readonly unitCode: string;
  readonly dateKey: string;
  readonly time: string;
  readonly minutes: number;
}

export interface TutorSource {
  list(): Promise<TutorProfile[]>;
  find(id: string): Promise<TutorProfile | null>;
  /** Sends the request to the tutor; no payment goes through Campus Hand. */
  requestBooking(request: BookingRequest): Promise<{ ok: boolean }>;
}
