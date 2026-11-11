import { ArrowRight, Bell, CloudDownload, Search } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { Avatar, ProgressBar, SectionTitle } from '@/components/app/bits';
import { CourseUnitTile } from '@/components/app/course-unit-tile';
import { MaterialTag, SheetThumb } from '@/components/app/material';
import { termLabel } from '@/features/catalogue/models/catalogue';
import { MageziIcon } from '@/features/landing/icons/magezi-icon';
import { getTermUnits, getViewer } from '@/features/student-app/data';
import { SiteRoutes } from '@/lib/routes';
import { greetingFor } from '../models/kampala-time';
import { PreviewStudySource } from '../models/preview-study-source';
import { PlanChecklist } from './plan-checklist';

/** The signed-in student's dashboard (Home), phone and desktop. */
export async function HomeScreen() {
  await connection(); // greeting and countdown depend on the time now
  const now = new Date();
  const viewer = await getViewer();
  const [{ programmeName, units }, study] = await Promise.all([
    getTermUnits(viewer.studyPlace),
    new PreviewStudySource().overview(now),
  ]);
  const { year, semester } = viewer.studyPlace;
  const unitByCode = new Map(units.map((u) => [u.code, u]));
  const examUnit = study.exam ? unitByCode.get(study.exam.courseUnitCode) : undefined;

  return (
    <div>
      {/* Desktop top bar */}
      <div className="border-rule hidden items-center justify-between gap-6 border-b-2 px-10 py-5 lg:flex">
        <form action={SiteRoutes.courseUnits} role="search" className="max-w-[560px] flex-1">
          <label htmlFor="app-search" className="sr-only">
            Search notes, past papers and course units
          </label>
          <div className="bg-surface flex min-h-[54px] items-center gap-3 rounded-[16px] px-4 shadow-[inset_0_0_0_2px_var(--edge)]">
            <Search className="text-mute size-5" aria-hidden="true" />
            <input
              id="app-search"
              name="q"
              type="search"
              placeholder="Search notes, past papers and course units"
              className="placeholder:text-mute min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            />
          </div>
        </form>
        <Link
          href={SiteRoutes.notifications}
          aria-label="Notifications"
          className="btn btn-line size-12 p-0"
        >
          <Bell className="size-5" aria-hidden="true" />
        </Link>
      </div>

      <div className="wide:grid-cols-[1fr_380px] mx-auto grid max-w-[1400px] gap-10 px-5 pt-6 sm:px-8 lg:px-10 lg:pt-10">
        <div className="flex min-w-0 flex-col gap-10">
          {/* Greeting */}
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-ink-2 text-[16px] font-semibold">
                {termLabel(year, semester)}
                {programmeName ? <span className="hidden sm:inline">, {programmeName}</span> : null}
              </p>
              <h1 className="display mt-1 text-[clamp(40px,6vw,72px)]">
                {greetingFor(now)}, {viewer.firstName}
              </h1>
            </div>
            <div className="flex flex-none items-center gap-3 lg:hidden">
              <Link
                href={SiteRoutes.notifications}
                aria-label="Notifications"
                className="btn btn-line size-12 p-0"
              >
                <Bell className="size-5" aria-hidden="true" />
              </Link>
              <Avatar initials={viewer.initials} className="size-12" />
            </div>
          </header>

          {/* Exam countdown */}
          {study.exam ? (
            <section
              aria-labelledby="exam-h"
              className="sign bg-signal-red text-on-cobalt grid gap-6 p-6 sm:p-8 2xl:grid-cols-[1fr_auto] 2xl:items-center"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <p id="exam-h" className="text-[17px] font-bold">
                    {study.exam.courseUnitCode} exam
                  </p>
                  <span className="sticker text-[14px] font-bold md:hidden">
                    {study.exam.isOnTrack(now) ? 'On track' : 'Behind'}
                  </span>
                </div>
                <p className="display text-[clamp(64px,7vw,108px)] leading-[0.85]">
                  {study.exam.daysLeftLabel(now)}
                  <span className="hidden md:inline"> to go</span>
                </p>
                <div className="flex flex-col gap-2 md:max-w-[520px]">
                  <div className="flex justify-between text-[15px] font-bold">
                    <span>
                      {study.exam.topicsRevised} of {study.exam.topicsTotal} topics revised
                    </span>
                    <span className="hidden md:inline">
                      {study.exam.isOnTrack(now) ? 'On track' : 'Behind'}
                    </span>
                  </div>
                  <ProgressBar
                    value={study.exam.revisedShare}
                    label={`${study.exam.topicsRevised} of ${study.exam.topicsTotal} topics revised`}
                    trackClassName="bg-surface shadow-[inset_0_0_0_2px_var(--edge)] h-3.5"
                    fillClassName="bg-sun"
                    className="h-3.5"
                  />
                </div>
              </div>
              {study.exam.tonight ? (
                <Link
                  href={examUnit ? SiteRoutes.courseUnit(examUnit.id) : SiteRoutes.courseUnits}
                  className="sign bg-sun text-on-sun flex items-center justify-between gap-4 p-5 md:max-w-[440px] md:-rotate-1"
                >
                  <span>
                    <span className="block text-[15px] font-bold">
                      Tonight, {study.exam.tonight.minutes} minutes
                    </span>
                    <span className="display mt-1 block text-[26px] leading-[0.95] sm:text-[32px]">
                      {study.exam.tonight.title}
                    </span>
                  </span>
                  <span className="bg-inverse text-on-inverse flex size-12 flex-none items-center justify-center rounded-full">
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </span>
                </Link>
              ) : null}
            </section>
          ) : null}

          {/* Pick up where you left off */}
          <section aria-labelledby="resume-h" className="flex flex-col gap-4">
            <SectionTitle id="resume-h">Pick up where you left off</SectionTitle>
            <ul className="grid gap-4 md:grid-cols-2">
              {study.resume.map((item) => (
                <li key={item.id}>
                  <Link
                    href={SiteRoutes.reader(item.id)}
                    className="panel tile-pop flex items-center gap-4 p-4"
                  >
                    <SheetThumb kind={item.kind} stamp={item.stamp} />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="text-[17px] font-bold">{item.title}</span>
                      <span className="text-ink-2 text-[15px]">
                        {item.courseUnitCode}, {item.position.label}
                      </span>
                      <ProgressBar
                        value={item.position.done / item.position.total}
                        label={`${item.title}: ${item.position.label}`}
                        className="mt-1"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* My shelf (phone, as in the design) */}
          <section aria-labelledby="shelf-h" className="flex flex-col gap-4 lg:hidden">
            <div className="flex items-baseline justify-between gap-4">
              <SectionTitle id="shelf-h">My shelf</SectionTitle>
              <Link href={SiteRoutes.shelf} className="text-link text-[16px] font-bold">
                See all {study.shelf.total}
              </Link>
            </div>
            <ul className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
              {study.shelf.items.map((item) => (
                <li key={item.id} className="w-[200px] flex-none snap-start">
                  <Link
                    href={SiteRoutes.reader(item.id)}
                    className="panel flex h-full flex-col gap-3 p-4"
                  >
                    <SheetThumb kind={item.kind} stamp={item.stamp} />
                    <span className="text-[16px] leading-snug font-bold">{item.title}</span>
                    <span className="chip self-start">{item.courseUnitCode}</span>
                    {item.offline ? (
                      <span className="text-green-text flex items-center gap-1.5 text-[14px] font-bold">
                        <CloudDownload className="size-4" aria-hidden="true" />
                        Offline
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-ink-2 text-[14.5px]">
              Everything you add is kept here by course unit. Pro also keeps it readable offline,
              inside the app.
            </p>
          </section>

          {/* Your course units */}
          <section aria-labelledby="units-h" className="flex flex-col gap-5">
            <div className="flex items-baseline justify-between gap-4">
              <SectionTitle id="units-h">Your course units</SectionTitle>
              <Link href={SiteRoutes.courseUnits} className="text-link text-[16px] font-bold">
                Change semester
              </Link>
            </div>
            {units.length > 0 ? (
              <ul className="-mx-5 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 pt-3 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
                {units.map((unit, i) => (
                  <li key={unit.id} className="w-[220px] flex-none snap-start sm:w-auto">
                    <CourseUnitTile
                      href={SiteRoutes.courseUnit(unit.id)}
                      code={unit.code}
                      title={unit.title}
                      index={i}
                      newCount={study.newByCourseUnit[unit.code] ?? 0}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel text-ink-2 p-5 text-[16px]">
                Your course units for this semester will show here once your programme is on Campus
                Hand.
              </p>
            )}
          </section>

          {/* New from your classmates */}
          <section aria-labelledby="feed-h" className="flex flex-col gap-2">
            <SectionTitle id="feed-h">New from your classmates</SectionTitle>
            <ul className="divide-rule divide-y">
              {study.feed.map((item) => (
                <li key={item.id}>
                  <Link
                    href={SiteRoutes.reader(item.id)}
                    className="flex items-center gap-4 py-4 sm:gap-5"
                  >
                    <SheetThumb kind={item.kind} stamp={item.stamp} />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[17px] font-bold">{item.title}</span>
                      <span className="text-ink-2 text-[15px]">{item.byline}</span>
                      <MaterialTag kind={item.kind} className="mt-1 self-start sm:hidden" />
                    </span>
                    <MaterialTag kind={item.kind} className="hidden sm:inline-flex" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right rail (desktop) */}
        <aside
          aria-label="Your week"
          className="wide:grid-cols-1 hidden content-start items-start gap-6 lg:grid lg:grid-cols-2"
        >
          <section aria-labelledby="plan-h" className="panel p-6">
            <div className="flex items-baseline justify-between">
              <h2 id="plan-h" className="display text-[30px]">
                This week&apos;s plan
              </h2>
              <Link href={SiteRoutes.studyPlan} className="text-link text-[16px] font-bold">
                Edit
              </Link>
            </div>
            <div className="mt-2">
              <PlanChecklist tasks={study.plan.tasks} />
            </div>
          </section>

          <section aria-labelledby="assist-h" className="bg-deep text-on-deep rounded-[22px] p-6">
            <div className="flex items-center gap-3">
              <span className="bg-sun text-on-sun flex size-10 items-center justify-center rounded-[10px]">
                <MageziIcon className="size-5" />
              </span>
              <h2 id="assist-h" className="text-[19px] font-bold">
                Ask the campus assistant
              </h2>
            </div>
            <p className="text-deep-mute mt-3 text-[15.5px]">
              Fees, offices, hostels or anything in your course units.
            </p>
            <form action={SiteRoutes.ask} className="mt-4">
              <label htmlFor="assist-q" className="sr-only">
                Your question for the campus assistant
              </label>
              <div className="bg-surface text-ink flex items-center gap-2 rounded-[14px] p-1.5 pl-4">
                <input
                  id="assist-q"
                  name="q"
                  placeholder="Where do I pay for a retake?"
                  className="placeholder:text-mute min-w-0 flex-1 bg-transparent text-[15.5px] outline-none"
                />
                <button
                  type="submit"
                  aria-label="Ask"
                  className="bg-cobalt text-on-cobalt flex size-11 items-center justify-center rounded-[12px]"
                >
                  <ArrowRight className="size-5 -rotate-90" aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>

          <section aria-labelledby="credits-h" className="panel p-6">
            <div className="flex items-baseline justify-between">
              <h2 id="credits-h" className="text-[17px] font-bold">
                Magezi today
              </h2>
              <span className="text-ink-2 text-[15px]">
                {viewer.credits.left} of {viewer.credits.perDay} left
              </span>
            </div>
            <ProgressBar
              value={viewer.creditsLeftShare}
              label={`${viewer.credits.left} of ${viewer.credits.perDay} free Magezi questions left today`}
              className="mt-3 h-2"
            />
            <Link
              href={SiteRoutes.pro}
              className="text-link mt-4 inline-block text-[16px] font-bold"
            >
              Go unlimited with Pro
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
