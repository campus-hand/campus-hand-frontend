import type { Client } from 'openapi-fetch';
import type { paths } from '@/lib/api/schema';
import type { CatalogueSource, CourseUnitDetail, Programme, TermCourseUnit } from './catalogue';

/** The catalogue from the Campus Hand API (only "live" institutions are public). */
export class ApiCatalogueSource implements CatalogueSource {
  readonly mode = 'api' as const;

  constructor(private readonly client: Client<paths>) {}

  async findProgramme(institutionSlug: string, programmeCode: string): Promise<Programme | null> {
    const { data, response } = await this.client.GET('/catalogue/institutions/{slug}/programmes', {
      params: { path: { slug: institutionSlug } },
    });
    if (!data) return ApiCatalogueSource.missing(response);
    const found = data.items.find((p) => p.code === programmeCode);
    return found
      ? { id: found.id, code: found.code, name: found.name, durationYears: found.durationYears }
      : null;
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
