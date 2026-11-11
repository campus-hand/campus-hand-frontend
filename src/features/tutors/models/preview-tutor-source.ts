import type { BookingRequest, TutorProfile, TutorSource } from './tutors';

const EVENINGS = ['15:00', '16:00', '18:00', '19:00', '20:00', '14:00'];

/**
 * The design's three sample tutors. Times are offered every week, so the
 * calendar always has something to show.
 * TODO(backend): tutoring requests API. TODO(content): illustration only.
 */
export const PREVIEW_TUTORS: readonly TutorProfile[] = [
  {
    id: 'brian-okello',
    name: 'Brian Okello',
    initials: 'BO',
    tone: 'sun',
    kind: 'student',
    roleLine: 'Senior student, Year 4 Computer Science',
    check: { label: 'A in CSC 2100, checked', tone: 'note' },
    profileCheck: { label: 'Results slip checked', tone: 'note' },
    grades: ['A in CSC 2100', 'A in CSC 1202'],
    rating: 4.9,
    sessions: 32,
    hourlyRate: 15_000,
    bio: 'I explain trees and recursion with drawings, then we go through past paper questions together. Bring the question you are stuck on.',
    courseUnitCodes: ['CSC 2100', 'CSC 1202'],
    // Every day but Wednesday; 2:00 pm is always booked.
    offered: { 0: EVENINGS, 1: EVENINGS, 2: EVENINGS, 4: EVENINGS, 5: EVENINGS, 6: EVENINGS },
    booked: { 0: ['14:00'], 1: ['14:00'], 2: ['14:00'], 4: ['14:00'], 5: ['14:00'], 6: ['14:00'] },
  },
  {
    id: 'atim-grace',
    name: 'Dr. Atim Grace',
    initials: 'AG',
    tone: 'forest',
    kind: 'lecturer',
    roleLine: 'Lecturer, School of Computing',
    check: { label: 'Verified lecturer', tone: 'daily' },
    profileCheck: { label: 'Verified lecturer', tone: 'daily' },
    grades: [],
    rating: 4.8,
    sessions: 51,
    hourlyRate: 30_000,
    bio: 'I teach CSC 2104 and help students with data structures before exams. Sessions follow the course outline.',
    courseUnitCodes: ['CSC 2100', 'CSC 2104'],
    offered: { 6: ['10:00', '11:00', '15:00'], 0: ['10:00', '11:00'] },
    booked: {},
  },
  {
    id: 'kato-joseph',
    name: 'Kato Joseph',
    initials: 'KJ',
    tone: 'red',
    kind: 'external',
    roleLine: 'External tutor, BSc Computer Science',
    check: { label: 'ID and degree checked', tone: 'plain' },
    profileCheck: { label: 'ID and degree checked', tone: 'plain' },
    grades: [],
    rating: 4.7,
    sessions: 19,
    hourlyRate: 20_000,
    bio: 'I tutor databases and networks, with lots of worked examples from past papers.',
    courseUnitCodes: ['CSC 2100', 'CSC 2110', 'CSC 2112'],
    offered: {
      1: ['14:00', '15:00', '17:00'],
      2: ['14:00', '15:00', '17:00'],
      3: ['14:00', '15:00', '17:00'],
      4: ['14:00', '15:00', '17:00'],
      5: ['14:00', '15:00', '17:00'],
      6: ['14:00', '15:00'],
    },
    booked: {},
  },
];

export class PreviewTutorSource implements TutorSource {
  constructor(private readonly delayMs = 600) {}

  async list(): Promise<TutorProfile[]> {
    return [...PREVIEW_TUTORS];
  }

  async find(id: string): Promise<TutorProfile | null> {
    return PREVIEW_TUTORS.find((t) => t.id === id) ?? null;
  }

  async requestBooking(request: BookingRequest): Promise<{ ok: boolean }> {
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));
    return { ok: PREVIEW_TUTORS.some((t) => t.id === request.tutorId) };
  }
}
