import type { Client } from 'openapi-fetch';
import type { paths } from '@/lib/api/schema';
import type {
  CatalogueSource,
  CourseUnitDetail,
  InstitutionSummary,
  Programme,
  TermCourseUnit,
} from './catalogue';

/** The catalogue from the Campus Hand API (only "live" institutions are public). */
export class ApiCatalogueSource implements CatalogueSource {
  readonly mode = 'api' as const;

  constructor(private readonly client: Client<paths>) {}

  async listInstitutions(): Promise<InstitutionSummary[]> {
    const { data, response } = await this.client.GET('/catalogue/institutions');
    if (!data) return (await ApiCatalogueSource.missing(response)) ?? [];
    return data.items.map(({ slug, name, shortName }) => ({ slug, name, shortName }));
  }

  async listProgrammes(institutionSlug: string): Promise<Programme[]> {
    const { data, response } = await this.client.GET('/catalogue/institutions/{slug}/programmes', {
      params: { path: { slug: institutionSlug } },
    });
    if (!data) return (await ApiCatalogueSource.missing(response)) ?? [];
    return data.items.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      durationYears: p.durationYears,
    }));
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
    const { data, response } = await this.client.GET('/catalogue/programmes/{id}/course-units', {
      params: {
        path: { id: programmeId },
        query: { year: String(year), semester: String(semester) },
      },
    });
    if (!data) return (await ApiCatalogueSource.missing(response)) ?? [];
    return data.items;
  }

  async courseUnit(id: string): Promise<CourseUnitDetail | null> {
    const { data, response } = await this.client.GET('/catalogue/course-units/{id}', {
      params: { path: { id } },
    });
    if (!data) return ApiCatalogueSource.missing(response);
    return {
      id: data.id,
      code: data.code,
      title: data.title,
      creditUnits: data.creditUnits,
      institution: data.institution,
      topics: data.topics,
      taughtIn: data.programmes.map((p) => ({
        programmeCode: p.code,
        programmeName: p.name,
        yearOfStudy: p.yearOfStudy,
        semester: p.semester,
        isElective: p.isElective,
      })),
    };
  }

  /** 404 and 400 (e.g. a malformed id) mean "not found"; anything else is an error. */
  private static async missing(response: Response): Promise<null> {
    if (response.status === 404 || response.status === 400) return null;
    throw new Error(`Catalogue API answered ${response.status}`);
  }
}
