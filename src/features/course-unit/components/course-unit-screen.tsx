import { ArrowLeft, Bell, Check, ChevronDown, ListChecks, Search } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/app/bits';
import { MaterialTag, SheetThumb } from '@/components/app/material';
import { codeLine, termLabel, type CourseUnitDetail } from '@/features/catalogue/models/catalogue';
import { MageziIcon } from '@/features/landing/icons/magezi-icon';
import { getCourseUnit, getMaterials, getViewer } from '@/features/student-app/data';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  type CourseUnitMaterials,
  type MaterialFile,
  type TopicMaterials,
  topicSummary,
  totalsSentence,
} from '../models/materials';
import { CourseUnitTabs } from './course-unit-tabs';
import { FollowButton } from './follow-button';

function FileCard({ file }: { file: MaterialFile }) {
  return (
    <Link
      href={SiteRoutes.reader(file.id)}
      className="panel tile-pop flex items-center gap-4 p-3.5"
    >
      <SheetThumb kind={file.kind} className="h-[64px] w-[50px]" />
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[16.5px] leading-snug font-bold">{file.title}</span>
        <span className="flex flex-wrap items-center gap-2">
          <MaterialTag kind={file.kind} />
          <span className="text-ink-2 text-[14.5px]">{file.meta}</span>
        </span>
      </span>
    </Link>
  );
}

function TopicRow({
  title,
  position,
  topicId,
  materials,
}: {
  title: string;
  position: number;
  topicId: string;
  materials: TopicMaterials | undefined;
}) {
  const current = materials?.progress === 'current';
  const empty = !materials || materials.noteCount + materials.tutorialCount === 0;
  const summary = current
    ? `Revising now, ${materials.files.length} files`
    : materials
      ? topicSummary(materials)
      : 'No notes yet';

  return (
    <li className="border-rule border-b">
      <details open={current} className="group">
        <summary className="flex min-h-[88px] cursor-pointer list-none items-center gap-4 py-3 [&::-webkit-details-marker]:hidden">
          <span
            className={cn(
              'display flex size-12 flex-none items-center justify-center rounded-[12px] text-[22px]',
              current ? 'bg-inverse text-on-inverse' : 'bg-sunken',
            )}
          >
            {position}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[18px] font-bold">{title}</span>
            <span className="text-ink-2 text-[15.5px]">{summary}</span>
          </span>
          {materials?.progress === 'revised' ? (
            <span className="tag tag-note">
              <Check className="size-3.5 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Revised</span>
              <span className="sr-only sm:hidden">Revised</span>
            </span>
          ) : null}
          <ChevronDown
            className="text-ink-2 size-5 flex-none transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="flex flex-col gap-4 pb-5 sm:pl-16">
          {empty ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink-2 text-[15.5px]">No notes yet. Be the first to share yours.</p>
              <Link href={SiteRoutes.upload} className="btn btn-line min-h-11">
                Upload
              </Link>
            </div>
          ) : materials.files.length > 0 ? (
            <ul className="grid gap-3 xl:grid-cols-2">
              {materials.files.map((file) => (
                <li key={file.id}>
                  <FileCard file={file} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-2 text-[15.5px]">{topicSummary(materials)} in this topic.</p>
          )}
          {!empty ? (
            <Link
              href={SiteRoutes.quiz(topicId)}
              className="bg-note-bg text-note-fg flex min-h-12 items-center justify-center gap-2.5 self-stretch rounded-[14px] px-5 text-[16.5px] font-bold sm:self-start"
            >
              <ListChecks className="size-5" aria-hidden="true" />
              Quiz me on this topic
            </Link>
          ) : null}
        </div>
      </details>
    </li>
  );
}

function PastPapersList({ materials }: { materials: CourseUnitMaterials }) {
  if (materials.pastPapers.length === 0) {
    return <p className="text-ink-2 text-[15.5px]">No past papers yet for this course unit.</p>;
  }
  return (
    <ul className="divide-rule divide-y">
      {materials.pastPapers.map((paper) => (
        <li key={paper.id}>
          <Link
            href={SiteRoutes.reader(paper.id)}
            className="flex min-h-16 items-center gap-4 py-2.5"
          >
            <span className="tag tag-paper w-[86px] justify-center">{paper.sitting}</span>
            <span className="flex-1 text-[16px] font-semibold">
              {paper.title}
              {paper.withAnswers ? ', with answers' : ''}
            </span>
            <span className="text-ink-2 text-[15px]" aria-label={`Rated ${paper.rating} out of 5`}>
              {paper.rating.toFixed(1)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TutorsList({ materials, unitId }: { materials: CourseUnitMaterials; unitId: string }) {
  return (
    <div className="flex flex-col gap-4">
      {materials.tutors.length === 0 ? (
        <p className="text-ink-2 text-[15.5px]">No tutors for this course unit yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {materials.tutors.map((tutor) => (
            <li key={tutor.id}>
              <Link href={SiteRoutes.tutor(tutor.id)} className="flex items-center gap-3.5">
                <Avatar initials={tutor.initials} tone={tutor.tone} className="size-12" />
                <span className="flex flex-col">
                  <span className="text-[16.5px] font-bold">{tutor.name}</span>
                  <span className="text-ink-2 text-[15px]">{tutor.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`${SiteRoutes.tutors}?unit=${encodeURIComponent(unitId)}`}
        className="btn btn-cobalt w-full"
      >
        Request a session
      </Link>
    </div>
  );
}

function teaching(unit: CourseUnitDetail, programmeCode: string) {
  return unit.taughtIn.find((t) => t.programmeCode === programmeCode) ?? unit.taughtIn[0];
}

/** One course unit: topics with their files, past papers and tutors. */
export async function CourseUnitScreen({ id }: { id: string }) {
  const unit = await getCourseUnit(id);
  if (!unit) notFound();
  const [viewer, materials] = await Promise.all([getViewer(), getMaterials(unit.code)]);
  const taught = teaching(unit, viewer.studyPlace.programmeCode);
  const allFiles = materials.topics.flatMap((t) => t.files);

  const lead = [
    materials.lecturer ? `Taught by ${materials.lecturer}.` : null,
    taught ? `${termLabel(taught.yearOfStudy, taught.semester)}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const topicsPanel =
    unit.topics.length === 0 ? (
      <div className="panel flex flex-col gap-3 p-6">
        <p className="text-[17px] font-bold">Topics are on their way</p>
        <p className="text-ink-2 text-[15.5px]">
          This course unit&apos;s topics haven&apos;t been added yet. You can still share notes or
          past papers for it.
        </p>
        <Link href={SiteRoutes.upload} className="btn btn-sun self-start">
          Upload notes
        </Link>
      </div>
    ) : (
      <ol className="border-rule border-t">
        {unit.topics.map((topic) => (
          <TopicRow
            key={topic.id}
            topicId={topic.id}
            title={topic.title}
            position={topic.position}
            materials={materials.topics.find((t) => t.position === topic.position)}
          />
        ))}
      </ol>
    );

  return (
    <div>
      {/* Desktop top bar: search inside this course unit */}
      <div className="border-rule hidden border-b-2 px-10 py-5 lg:block">
        <form action={SiteRoutes.courseUnits} role="search" className="max-w-[560px]">
          <input type="hidden" name="unit" value={unit.id} />
          <label htmlFor="unit-search" className="sr-only">
            Search in {unit.code}
          </label>
          <div className="bg-surface flex min-h-[54px] items-center gap-3 rounded-[16px] px-4 shadow-[inset_0_0_0_2px_var(--edge)]">
            <Search className="text-mute size-5" aria-hidden="true" />
            <input
              id="unit-search"
              name="q"
              type="search"
              placeholder={`Search in ${unit.code}`}
              className="placeholder:text-mute min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            />
          </div>
        </form>
      </div>

      {/* Phone top bar */}
      <div className="flex items-center justify-between px-3 pt-3 lg:hidden">
        <Link
          href={SiteRoutes.courseUnits}
          aria-label="Back to your course units"
          className="flex size-12 items-center justify-center rounded-full"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </Link>
        <span
          className="text-link flex size-12 items-center justify-center"
          title={materials.following ? 'Following' : undefined}
        >
          {materials.following ? (
            <>
              <Bell className="size-6" aria-hidden="true" />
              <span className="sr-only">You follow this course unit</span>
            </>
          ) : null}
        </span>
      </div>

      <div className="wide:grid-cols-[1fr_400px] mx-auto grid max-w-[1400px] gap-10 px-5 pt-2 sm:px-8 lg:px-10 lg:pt-10">
        <div className="flex min-w-0 flex-col gap-7">
          <header className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-link text-[17px] font-bold">{codeLine(unit)}</p>
              <h1 className="display max-w-[18ch] text-[clamp(44px,5.6vw,84px)]">{unit.title}</h1>
              <p className="text-ink-2 text-[17px]">
                {lead}
                <span className="hidden sm:inline"> {totalsSentence(materials.totals)}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-none">
              <FollowButton
                code={unit.code}
                initiallyFollowing={materials.following}
                className="hidden sm:inline-flex"
              />
              <Link
                href={`${SiteRoutes.ask}?unit=${encodeURIComponent(unit.id)}`}
                className="btn btn-sun"
              >
                <MageziIcon className="size-5" />
                Ask about this unit
              </Link>
              <Link
                href={`${SiteRoutes.tutors}?unit=${encodeURIComponent(unit.id)}`}
                className="btn btn-line sm:hidden"
              >
                Find a tutor
              </Link>
            </div>
          </header>

          <CourseUnitTabs
            label={`${unit.code} sections`}
            tabs={[
              { value: 'topics', label: 'Topics', content: topicsPanel },
              {
                value: 'notes',
                label: `All notes ${materials.totals.notes}`,
                desktopOnly: true,
                content:
                  allFiles.length > 0 ? (
                    <ul className="grid gap-3 xl:grid-cols-2">
                      {allFiles.map((file) => (
                        <li key={file.id}>
                          <FileCard file={file} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ink-2 text-[15.5px]">No notes yet for this course unit.</p>
                  ),
              },
              {
                value: 'papers',
                label: `Past papers ${materials.totals.papers}`,
                content: <PastPapersList materials={materials} />,
              },
              {
                value: 'tutors',
                label: `Tutors ${materials.totals.tutors}`,
                content: <TutorsList materials={materials} unitId={unit.id} />,
              },
            ]}
          />
        </div>

        <aside
          aria-label={`${unit.code} at a glance`}
          className="wide:grid-cols-1 hidden content-start items-start gap-6 lg:grid lg:grid-cols-2"
        >
          <section aria-labelledby="rail-papers" className="panel p-6">
            <div className="flex items-baseline justify-between">
              <h2 id="rail-papers" className="display text-[30px]">
                Past papers
              </h2>
              <span className="text-ink-2 text-[15px] font-semibold">
                {materials.totals.papers} in all
              </span>
            </div>
            <div className="mt-2">
              <PastPapersList materials={materials} />
            </div>
          </section>
          <section aria-labelledby="rail-tutors" className="panel p-6">
            <h2 id="rail-tutors" className="display mb-4 text-[30px]">
              Tutors for this unit
            </h2>
            <TutorsList materials={materials} unitId={unit.id} />
          </section>
        </aside>
      </div>
    </div>
  );
}
