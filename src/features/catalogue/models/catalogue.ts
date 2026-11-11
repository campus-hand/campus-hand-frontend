/** A programme a student follows, e.g. "BSc Computer Science". */
export interface Programme {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly durationYears: number;
}

export interface InstitutionSummary {
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
}

/** A course unit as listed for one year and semester of a programme. */
export interface TermCourseUnit {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly creditUnits: number | null;
  readonly yearOfStudy: number;
  readonly semester: number;
  readonly isElective: boolean;
}

export interface Topic {
  readonly id: string;
  readonly title: string;
  readonly position: number;
}

/** Everything the course unit page shows from the catalogue. */
export interface CourseUnitDetail {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly creditUnits: number | null;
  readonly institution: {
    readonly slug: string;
    readonly name: string;
    readonly shortName: string;
  };
  readonly topics: readonly Topic[];
  readonly taughtIn: readonly {
    readonly programmeCode: string;
    readonly programmeName: string;
    readonly yearOfStudy: number;
    readonly semester: number;
    readonly isElective: boolean;
  }[];
}

/**
 * What the app needs from the catalogue. The API implements it today;
 * a preview implementation serves the design's sample data elsewhere.
 */
export interface CatalogueSource {
  readonly mode: 'api' | 'preview';
  /** Institutions that are live on Campus Hand. */
  listInstitutions(): Promise<InstitutionSummary[]>;
  /** An institution's programmes ([] when the institution is unknown). */
  listProgrammes(institutionSlug: string): Promise<Programme[]>;
  findProgramme(institutionSlug: string, programmeCode: string): Promise<Programme | null>;
  termCourseUnits(programmeId: string, year: number, semester: number): Promise<TermCourseUnit[]>;
  /** null when there is no such course unit (or it is not public). */
  courseUnit(id: string): Promise<CourseUnitDetail | null>;
}

/** "Year 2, Semester 1" */
export function termLabel(year: number, semester: number): string {
  return `Year ${year}, Semester ${semester}`;
}

/** "CSC 2100, 4 credit units" (credit units left out when unknown). */
export function codeLine(unit: { code: string; creditUnits: number | null }): string {
  if (unit.creditUnits === null) return unit.code;
  return `${unit.code}, ${unit.creditUnits} credit unit${unit.creditUnits === 1 ? '' : 's'}`;
}
