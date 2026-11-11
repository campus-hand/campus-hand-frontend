import Link from 'next/link';
import { CourseUnitTile } from '@/components/app/course-unit-tile';
import { termLabel } from '@/features/catalogue/models/catalogue';
import { getTermUnits, getViewer } from '@/features/student-app/data';
import { SiteRoutes } from '@/lib/routes';

/** Matches a course unit by code (spaces ignored) or by words in its title. */
export function matchesQuery(unit: { code: string; title: string }, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  const compact = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  return compact(unit.code).includes(compact(q)) || unit.title.toLowerCase().includes(q);
}

/** "Courses": the viewer's course units this semester, optionally filtered by ?q=. */
export async function CoursesScreen({ query }: { query: string }) {
  const viewer = await getViewer();
  const { programmeName, units } = await getTermUnits(viewer.studyPlace);
  const shown = units.filter((u) => matchesQuery(u, query));
  const { year, semester } = viewer.studyPlace;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 pt-6 sm:px-8 lg:px-10 lg:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="display text-[clamp(48px,7vw,84px)]">Courses</h1>
        <p className="text-ink-2 text-[17px]">
          {termLabel(year, semester)}
          {programmeName ? `, ${programmeName}` : ''}
        </p>
      </header>

      <form action={SiteRoutes.courseUnits} role="search" className="max-w-[560px]">
        <label htmlFor="courses-q" className="sr-only">
          Search your course units
        </label>
        <input
          id="courses-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Course unit or code"
          className="bg-surface placeholder:text-mute min-h-[54px] w-full rounded-[16px] px-4 text-[16px] shadow-[inset_0_0_0_2px_var(--edge)] outline-none"
        />
      </form>

      {query ? (
        <p className="text-ink-2 text-[16px]" role="status">
          {shown.length === 0
            ? `No course units match “${query}”.`
            : `${shown.length} course unit${shown.length === 1 ? '' : 's'} match “${query}”.`}{' '}
          <Link href={SiteRoutes.courseUnits} className="text-link font-bold">
            Show all
          </Link>
        </p>
      ) : null}

      {shown.length > 0 ? (
        <ul className="grid gap-5 pt-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((unit) => (
            <li key={unit.id}>
              <CourseUnitTile
                href={SiteRoutes.courseUnit(unit.id)}
                code={unit.code}
                title={unit.title}
                index={units.indexOf(unit)}
              />
            </li>
          ))}
        </ul>
      ) : !query ? (
        <p className="panel text-ink-2 p-5 text-[16px]">
          Your course units will show here once your programme is on Campus Hand.
        </p>
      ) : null}
    </div>
  );
}
