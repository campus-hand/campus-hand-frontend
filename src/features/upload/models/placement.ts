/** "Where it belongs": every upload is tied to an institution, programme, year, semester and course unit. */
export interface Placement {
  readonly institutionSlug: string;
  readonly programmeId: string;
  readonly year: number | null;
  readonly semester: number | null;
  readonly courseUnitId: string;
  /** Optional. */
  readonly topicId: string;
}

export type PlacementField = keyof Placement;

export const EMPTY_PLACEMENT: Placement = {
  institutionSlug: '',
  programmeId: '',
  year: null,
  semester: null,
  courseUnitId: '',
  topicId: '',
};

/** Which later picks become invalid when a pick changes. */
const CLEARS: Record<PlacementField, PlacementField[]> = {
  institutionSlug: ['programmeId', 'year', 'semester', 'courseUnitId', 'topicId'],
  programmeId: ['year', 'courseUnitId', 'topicId'],
  year: ['courseUnitId', 'topicId'],
  semester: ['courseUnitId', 'topicId'],
  courseUnitId: ['topicId'],
  topicId: [],
};

/** Sets one pick and clears the picks that depended on the old value. */
export function choose<F extends PlacementField>(
  placement: Placement,
  field: F,
  value: Placement[F],
): Placement {
  if (placement[field] === value) return placement;
  const next = { ...placement, [field]: value } as Record<PlacementField, unknown>;
  for (const cleared of CLEARS[field]) next[cleared] = EMPTY_PLACEMENT[cleared];
  return next as unknown as Placement;
}

/** Which pickers can be used yet (each waits for the ones before it). */
export function readiness(p: Placement) {
  const programme = p.institutionSlug !== '';
  const term = programme && p.programmeId !== '';
  const courseUnit = term && p.year !== null && p.semester !== null;
  return { programme, term, courseUnit, topic: courseUnit && p.courseUnitId !== '' };
}

/** Years to offer for a programme (1 to its length; 4 when unknown). */
export function yearsFor(durationYears: number | undefined): number[] {
  const n = Math.min(7, Math.max(1, durationYears ?? 4));
  return Array.from({ length: n }, (_, i) => i + 1);
}
