'use client';

import { CircleCheck, CircleHelp, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type {
  CatalogueSource,
  InstitutionSummary,
  Programme,
  TermCourseUnit,
  Topic,
} from '@/features/catalogue/models/catalogue';
import { termLabel } from '@/features/catalogue/models/catalogue';
import { SiteRoutes } from '@/lib/routes';
import { choose, type Placement, readiness, yearsFor } from '../models/placement';
import type { UploaderMode, UploadErrors } from '../models/upload';
import { FromProfile, Segmented, SelectField } from './form-bits';

/** Loads the options each picker needs, as the picks before it are made. */
export function usePlacementOptions(placement: Placement, catalogue: CatalogueSource) {
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [units, setUnits] = useState<TermCourseUnit[]>([]);
  const [topics, setTopics] = useState<readonly Topic[]>([]);
  const { institutionSlug, programmeId, year, semester, courseUnitId } = placement;

  useEffect(() => {
    let live = true;
    void catalogue.listInstitutions().then((list) => live && setInstitutions(list));
    return () => {
      live = false;
    };
  }, [catalogue]);

  useEffect(() => {
    let live = true;
    const load = institutionSlug ? catalogue.listProgrammes(institutionSlug) : Promise.resolve([]);
    void load.then((list) => live && setProgrammes(list));
    return () => {
      live = false;
    };
  }, [catalogue, institutionSlug]);

  useEffect(() => {
    let live = true;
    const load =
      programmeId && year !== null && semester !== null
        ? catalogue.termCourseUnits(programmeId, year, semester)
        : Promise.resolve([]);
    void load.then((list) => live && setUnits(list));
    return () => {
      live = false;
    };
  }, [catalogue, programmeId, year, semester]);

  useEffect(() => {
    let live = true;
    const load = courseUnitId ? catalogue.courseUnit(courseUnitId) : Promise.resolve(null);
    void load.then((unit) => live && setTopics(unit?.topics ?? []));
    return () => {
      live = false;
    };
  }, [catalogue, courseUnitId]);

  return { institutions, programmes, units, topics };
}

/** "Where it belongs": university, programme, year, semester, course unit and topic. */
export function WhereItBelongs({
  mode,
  placement,
  onChange,
  profile,
  catalogue,
  errors,
}: {
  mode: UploaderMode;
  placement: Placement;
  onChange: (next: Placement) => void;
  /** The signed-in student's own picks (for the "From your profile" badges). */
  profile: Placement | null;
  catalogue: CatalogueSource;
  errors: UploadErrors;
}) {
  const { institutions, programmes, units, topics } = usePlacementOptions(placement, catalogue);
  const ready = readiness(placement);
  const programme = programmes.find((p) => p.id === placement.programmeId);
  const set = <F extends keyof Placement>(field: F, value: Placement[F]) =>
    onChange(choose(placement, field, value));
  const fromProfile = (field: keyof Placement) =>
    profile !== null && placement[field] !== '' && placement[field] === profile[field] ? (
      <FromProfile />
    ) : null;

  return (
    <section aria-labelledby="where-h" className="panel flex flex-col gap-5 p-5 sm:p-7">
      <div>
        <h2 id="where-h" className="display flex items-center gap-3 text-[30px] sm:text-[36px]">
          <GraduationCap className="size-7" aria-hidden="true" />
          Where it belongs
        </h2>
        <p className="text-ink-2 mt-1 text-[15.5px]">
          {mode === 'member'
            ? 'Filled in from your profile. Change anything that is different for this file.'
            : 'Tell us where this belongs so students doing the same course unit can find it.'}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <SelectField
            id="institution"
            label="University"
            badge={fromProfile('institutionSlug')}
            value={placement.institutionSlug}
            onChange={(v) => set('institutionSlug', v)}
            options={institutions.map((i) => ({ value: i.slug, label: i.name }))}
            placeholder="Choose a university"
            error={errors.institution}
          />
          {mode === 'guest' ? (
            <p className="text-ink-2 text-[14.5px]">
              Not listed?{' '}
              <Link href={SiteRoutes.universities} className="text-link font-bold underline">
                Tell us your university
              </Link>
            </p>
          ) : null}
        </div>
        <SelectField
          id="programme"
          label="Course (programme)"
          badge={fromProfile('programmeId')}
          value={placement.programmeId}
          onChange={(v) => set('programmeId', v)}
          options={programmes.map((p) => ({ value: p.id, label: p.name }))}
          placeholder={ready.programme ? 'Choose a course' : 'Choose a university first'}
          disabled={!ready.programme}
          error={errors.programme}
        />
        <Segmented
          id="year"
          label="Year"
          value={placement.year}
          options={yearsFor(programme?.durationYears)}
          onChange={(v) => set('year', v)}
          disabled={!ready.term}
          error={errors.year}
        />
        <Segmented
          id="semester"
          label="Semester"
          value={placement.semester}
          options={[1, 2]}
          onChange={(v) => set('semester', v)}
          disabled={!ready.term}
          error={errors.semester}
        />
        <SelectField
          id="courseUnit"
          label="Course unit"
          value={placement.courseUnitId}
          onChange={(v) => set('courseUnitId', v)}
          options={units.map((u) => ({ value: u.id, label: `${u.code} ${u.title}` }))}
          placeholder={
            ready.courseUnit ? 'Choose a course unit' : 'Choose course, year and semester'
          }
          disabled={!ready.courseUnit}
          error={errors.courseUnit}
          hint={
            ready.courseUnit && placement.year !== null && placement.semester !== null ? (
              <span className="flex items-center gap-1.5">
                <CircleCheck className="size-4" aria-hidden="true" />
                {termLabel(placement.year, placement.semester)} course units
              </span>
            ) : undefined
          }
        />
        <SelectField
          id="topic"
          label={
            <>
              Topic <span className="text-ink-2 font-normal">(optional)</span>
            </>
          }
          value={placement.topicId}
          onChange={(v) => set('topicId', v)}
          options={topics.map((t) => ({ value: t.id, label: `${t.position}. ${t.title}` }))}
          placeholder={
            !ready.topic
              ? 'Choose a course unit first'
              : topics.length === 0
                ? 'No topics listed yet'
                : 'Choose a topic'
          }
          disabled={!ready.topic || topics.length === 0}
        />
      </div>

      <Link
        href={SiteRoutes.help}
        className="text-link flex items-center gap-2 self-start text-[16px] font-bold underline"
      >
        <CircleHelp className="size-5" aria-hidden="true" />
        Can&apos;t find your course unit? Ask us to add it
      </Link>
    </section>
  );
}
