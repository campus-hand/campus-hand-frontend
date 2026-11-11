// Server-side data for the student app. Each function returns plain data so it
// can be cached ('use cache') and handed to client components.
import { cacheLife } from 'next/cache';
import type { CourseUnitDetail, TermCourseUnit } from '@/features/catalogue/models/catalogue';
import { createCatalogueSource } from '@/features/catalogue/models/create-catalogue-source';
import { catalogueMode } from '@/features/catalogue/models/data-mode';
import type { CourseUnitMaterials } from '@/features/course-unit/models/materials';
import { PreviewMaterialsSource } from '@/features/course-unit/models/preview-materials-source';
import { PreviewViewerSource, type StudyPlace, type Viewer } from '@/features/viewer/models/viewer';

export interface TermUnits {
  readonly programmeName: string | null;
  readonly units: readonly TermCourseUnit[];
}

/** The signed-in student (a preview student until sign-in exists). */
export function getViewer(): Promise<Viewer> {
  return new PreviewViewerSource(catalogueMode()).current();
}

/** The viewer's course units this semester, from the catalogue. */
export async function getTermUnits(place: StudyPlace): Promise<TermUnits> {
  'use cache';
  cacheLife('minutes');
  const catalogue = createCatalogueSource();
  const programme = await catalogue.findProgramme(place.institutionSlug, place.programmeCode);
  if (!programme) return { programmeName: null, units: [] };
  const units = await catalogue.termCourseUnits(programme.id, place.year, place.semester);
  return { programmeName: programme.name, units };
}

/** One course unit from the catalogue, or null when it does not exist (or is not public). */
export async function getCourseUnit(id: string): Promise<CourseUnitDetail | null> {
  'use cache';
  cacheLife('minutes');
  return createCatalogueSource().courseUnit(id);
}

/** Notes, past papers and tutors for a course unit (preview data until uploads exist). */
export function getMaterials(code: string): Promise<CourseUnitMaterials> {
  return new PreviewMaterialsSource().forCourseUnit(code);
}
