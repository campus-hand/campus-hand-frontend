import {
  previewInstitution,
  previewProgramme,
  type PreviewUnit,
  previewUnits,
} from '../content/preview-catalogue';
import type {
  CatalogueSource,
  CourseUnitDetail,
  InstitutionSummary,
  Programme,
  TermCourseUnit,
} from './catalogue';

/** The design's sample catalogue, in memory. Behaves like the API (null when missing). */
export class PreviewCatalogueSource implements CatalogueSource {
  readonly mode = 'preview' as const;

  constructor(private readonly units: readonly PreviewUnit[] = previewUnits) {}

  async listInstitutions(): Promise<InstitutionSummary[]> {
    return [{ ...previewInstitution }];
  }

  async listProgrammes(institutionSlug: string): Promise<Programme[]> {
    return institutionSlug === previewInstitution.slug ? [{ ...previewProgramme }] : [];
  }

  async findProgramme(institutionSlug: string, programmeCode: string): Promise<Programme | null> {
    const programmes = await this.listProgrammes(institutionSlug);
    return programmes.find((p) => p.code === programmeCode) ?? null;
  }

  async termCourseUnits(
    programmeId: string,
    year: number,
    semester: number,
  ): Promise<TermCourseUnit[]> {
    if (programmeId !== previewProgramme.id) return [];
    return this.units
      .filter((u) => u.year === year && u.semester === semester)
      .map((u) => ({
        id: u.id,
        code: u.code,
        title: u.title,
        creditUnits: u.creditUnits,
        yearOfStudy: u.year,
        semester: u.semester,
        isElective: u.isElective ?? false,
      }));
  }

  async courseUnit(id: string): Promise<CourseUnitDetail | null> {
    const unit = this.units.find((u) => u.id === id);
    if (!unit) return null;
    return {
      id: unit.id,
      code: unit.code,
      title: unit.title,
      creditUnits: unit.creditUnits,
      institution: { ...previewInstitution },
      topics: (unit.topics ?? []).map((title, i) => ({
        id: `${unit.id}-t${i + 1}`,
        title,
        position: i + 1,
      })),
      taughtIn: [
        {
          programmeCode: previewProgramme.code,
          programmeName: previewProgramme.name,
          yearOfStudy: unit.year,
          semester: unit.semester,
          isElective: unit.isElective ?? false,
        },
      ],
    };
  }
}
