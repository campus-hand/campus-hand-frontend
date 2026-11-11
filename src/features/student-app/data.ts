// Server-side data for the student app. Each function returns plain data so it
// can be cached ('use cache') and handed to client components.
import { cacheLife } from 'next/cache';
import { connection } from 'next/server';
import type { CourseUnitDetail, TermCourseUnit } from '@/features/catalogue/models/catalogue';
import { createCatalogueSource } from '@/features/catalogue/models/create-catalogue-source';
import { catalogueMode } from '@/features/catalogue/models/data-mode';
import type { CourseUnitMaterials } from '@/features/course-unit/models/materials';
import { PreviewMaterialsSource } from '@/features/course-unit/models/preview-materials-source';
import type { QuizDefinition } from '@/features/quiz/models/quiz';
import { PreviewQuizSource } from '@/features/quiz/models/preview-quiz-source';
import { PreviewResourceSource } from '@/features/reader/models/preview-resource-source';
import type { ReaderResource } from '@/features/reader/models/resource';
import { PreviewTutorSource } from '@/features/tutors/models/preview-tutor-source';
import type { TutorProfile } from '@/features/tutors/models/tutors';
import { PreviewViewerSource, type StudyPlace, type Viewer } from '@/features/viewer/models/viewer';
import { SiteRoutes } from '@/lib/routes';

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

/** A file to open in the reader (preview data until uploads exist). */
export function getResource(id: string): Promise<ReaderResource | null> {
  return new PreviewResourceSource().find(id);
}

/**
 * The time of this request, in ms. Waits for the request first, so pages that
 * show "today" or "free now" render per request instead of at build time.
 */
export async function requestTimeMs(): Promise<number> {
  await connection();
  return Date.now();
}

/** Tutors (preview data until the tutoring requests API exists). */
export function getTutors(): Promise<TutorProfile[]> {
  return new PreviewTutorSource().list();
}

export function getTutor(id: string): Promise<TutorProfile | null> {
  return new PreviewTutorSource().find(id);
}

/** A topic's quiz (preview data until Magezi builds quizzes). */
export function getQuiz(topicId: string): Promise<QuizDefinition | null> {
  return new PreviewQuizSource().forTopic(topicId);
}

/**
 * Where "back" goes for something in a course unit: that course unit's page
 * when it is one of the viewer's units this semester, otherwise Home.
 */
export async function courseUnitLink(
  code: string,
  place: StudyPlace,
): Promise<{ href: string; label: string }> {
  const { units } = await getTermUnits(place);
  const unit = units.find((u) => u.code === code);
  return unit
    ? { href: SiteRoutes.courseUnit(unit.id), label: code }
    : { href: SiteRoutes.appHome, label: 'Home' };
}
