'use client';

import {
  BookOpen,
  CircleCheck,
  CircleHelp,
  Ellipsis,
  FileText,
  Lock,
  type LucideIcon,
  NotebookTabs,
  PencilLine,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useMemo, useRef, useState } from 'react';
import { TextField } from '@/features/auth/components/fields';
import type { CatalogueSource } from '@/features/catalogue/models/catalogue';
import { createCatalogueSource } from '@/features/catalogue/models/create-catalogue-source';
import { SiteRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { EMPTY_PLACEMENT, type Placement } from '../models/placement';
import { PreviewUploadSource } from '../models/preview-upload-source';
import {
  type BookChoice,
  EMPTY_BOOK,
  EXAM_SITTINGS,
  examYears,
  fileProblem,
  isReadingListEntry,
  POINTS_NOTE,
  UPLOAD_KINDS,
  type UploadErrors,
  type UploadKind,
  type UploaderMode,
  type UploadSource,
  type UploadValues,
  validateUpload,
} from '../models/upload';
import { BookChoicePicker, BookDetailsForm, ReadingListCard } from './book-listing';
import { FilePicker } from './file-picker';
import { FieldError, SelectField } from './form-bits';
import { WhereItBelongs } from './where-it-belongs';

const KIND_ICON: Record<UploadKind, LucideIcon> = {
  lecture: BookOpen,
  daily: PencilLine,
  paper: FileText,
  tutorial: CircleHelp,
  book: NotebookTabs,
  other: Ellipsis,
};

/** Order of fields for focusing the first problem. */
const FIELD_ORDER = [
  'file',
  'institution',
  'programme',
  'year',
  'semester',
  'courseUnit',
  'kind',
  'examYear',
  'examSitting',
  'bookTitle',
  'bookAuthors',
  'bookEdition',
  'bookIsbn',
  'bookPlaces',
  'title',
  'description',
  'guestContact',
  'rights',
];

function initialValues(placement: Placement): UploadValues {
  return {
    file: null,
    placement,
    kind: null,
    title: '',
    description: '',
    examYear: '',
    examSitting: '',
    bookChoice: 'list',
    book: EMPTY_BOOK,
    guestName: '',
    guestContact: '',
    rightsConfirmed: false,
  };
}

/** The upload form, for signed-in students ("member") or anyone without an account ("guest"). */
export function UploadForm({
  mode,
  profile,
  currentYear,
  catalogue: catalogueProp,
  source,
}: {
  mode: UploaderMode;
  /** The signed-in student's own picks; null for guests. */
  profile: Placement | null;
  currentYear: number;
  catalogue?: CatalogueSource;
  source?: UploadSource;
}) {
  const catalogue = useMemo(() => catalogueProp ?? createCatalogueSource(), [catalogueProp]);
  const [uploadSource] = useState<UploadSource>(() => source ?? new PreviewUploadSource());
  const [values, setValues] = useState<UploadValues>(() =>
    initialValues(profile ?? EMPTY_PLACEMENT),
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<UploadErrors>({});
  const [state, setState] = useState<'editing' | 'sending' | 'sent'>('editing');
  const [reference, setReference] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const uploadRun = useRef(0);

  const listing = isReadingListEntry(values);
  const update = (patch: Partial<UploadValues>) => setValues((v) => ({ ...v, ...patch }));

  async function chooseFile(file: File) {
    const chosen = { name: file.name, sizeBytes: file.size, type: file.type };
    update({ file: chosen });
    setErrors((e) => ({ ...e, file: fileProblem(chosen) ?? undefined }));
    if (fileProblem(chosen)) {
      setProgress(null);
      return;
    }
    const run = ++uploadRun.current;
    setProgress(0);
    await uploadSource.sendFile(chosen, (share) => {
      if (run === uploadRun.current) setProgress(share);
    });
  }

  function removeFile() {
    uploadRun.current++;
    update({ file: null });
    setProgress(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateUpload(values, mode);
    if (!listing && values.file && progress !== null && progress < 1) {
      found.file = 'Wait for the file to finish uploading.';
    }
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      summaryRef.current?.focus();
      document.getElementById(first)?.focus({ preventScroll: false });
      return;
    }
    setState('sending');
    const result = await uploadSource.submit(values, mode);
    if (result.ok) {
      setReference(result.reference);
      setState('sent');
    } else {
      setState('editing');
    }
  }

  function startAgain() {
    uploadRun.current++;
    setValues(initialValues(values.placement));
    setProgress(null);
    setErrors({});
    setState('editing');
  }

  if (state === 'sent') {
    return (
      <section role="status" className="panel flex flex-col items-start gap-4 p-6 sm:p-8">
        <CircleCheck className="text-green-text size-12" aria-hidden="true" />
        <h2 ref={(el) => el?.focus()} tabIndex={-1} className="display text-[40px] outline-none">
          {listing ? 'Added to the reading list' : 'Sent for review'}
        </h2>
        <p className="text-[17px]">
          {listing
            ? 'A moderator checks the details, then students doing this course unit will see the book on its reading list.'
            : 'A moderator checks every upload, usually within a day. We will tell you when it is live.'}
        </p>
        <p className="text-ink-2 text-[15px]">Reference: {reference}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-sun" onClick={startAgain}>
            Upload another
          </button>
          <Link
            href={mode === 'member' ? SiteRoutes.appHome : SiteRoutes.home}
            className="btn btn-line"
          >
            {mode === 'member' ? 'Back to Home' : 'Back to Campus Hand'}
          </Link>
        </div>
        {mode === 'guest' ? (
          <p className="text-ink-2 text-[15px]">
            Want points for Pro time and to track your upload?{' '}
            <Link href={SiteRoutes.signup} className="text-link font-bold underline">
              Sign up free
            </Link>
          </p>
        ) : null}
      </section>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-7">
      <div ref={summaryRef} tabIndex={-1} className="outline-none">
        {errorCount > 0 ? (
          <p role="alert" className="notice notice-error">
            {errorCount === 1 ? 'One thing needs fixing' : `${errorCount} things need fixing`}{' '}
            before this can be sent. They are marked below.
          </p>
        ) : null}
      </div>

      {!listing ? (
        <FilePicker
          file={values.file}
          progress={progress}
          onChoose={(f) => void chooseFile(f)}
          onRemove={removeFile}
          error={errors.file}
        />
      ) : null}

      <WhereItBelongs
        mode={mode}
        placement={values.placement}
        onChange={(placement) => update({ placement })}
        profile={profile}
        catalogue={catalogue}
        errors={errors}
      />

      <fieldset
        id="kind"
        tabIndex={-1}
        aria-describedby={errors.kind ? 'kind-error' : undefined}
        className="flex flex-col gap-3"
      >
        <legend className="mb-3 text-[17px] font-bold">What is it?</legend>
        <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-6">
          {UPLOAD_KINDS.map((k) => {
            const Icon = KIND_ICON[k.value];
            const selected = values.kind === k.value;
            return (
              <label
                key={k.value}
                className={cn(
                  'flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[16px] px-2 text-center text-[15.5px] font-bold',
                  selected
                    ? 'bg-daily-bg text-daily-fg shadow-[inset_0_0_0_2.5px_var(--green)]'
                    : 'bg-surface hover:bg-sunken shadow-[inset_0_0_0_2px_var(--edge)]',
                  'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]',
                )}
              >
                <input
                  type="radio"
                  name="kind"
                  value={k.value}
                  checked={selected}
                  onChange={() => update({ kind: k.value })}
                  className="sr-only"
                />
                <Icon className="size-6" aria-hidden="true" />
                {k.label}
              </label>
            );
          })}
        </div>
        {errors.kind ? <FieldError id="kind-error">{errors.kind}</FieldError> : null}
      </fieldset>

      {values.kind === 'paper' ? (
        <div className="flex flex-col gap-5">
          <p className="notice notice-error flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 size-5 flex-none" aria-hidden="true" />
            Only papers from exams already sat. Leaked or “predicted” papers are removed.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="examYear"
              label="Exam year"
              value={values.examYear}
              onChange={(v) => update({ examYear: v })}
              options={examYears(currentYear).map((y) => ({ value: String(y), label: String(y) }))}
              placeholder="Choose the year"
              error={errors.examYear}
            />
            <SelectField
              id="examSitting"
              label="Exam"
              value={values.examSitting}
              onChange={(v) => update({ examSitting: v })}
              options={EXAM_SITTINGS.map((s) => ({ value: s, label: s }))}
              placeholder="Choose the exam"
              error={errors.examSitting}
            />
          </div>
        </div>
      ) : null}

      {values.kind === 'book' ? (
        <BookChoicePicker
          value={values.bookChoice}
          onChange={(c: BookChoice) => update({ bookChoice: c })}
        />
      ) : null}

      {listing ? (
        <>
          <BookDetailsForm
            book={values.book}
            onChange={(book) => update({ book })}
            errors={errors}
          />
          <section aria-labelledby="preview-h" className="flex flex-col gap-3">
            <h2 id="preview-h" className="text-[17px] font-bold">
              How students will see it
            </h2>
            <ReadingListCard book={values.book} />
          </section>
        </>
      ) : (
        <>
          <TextField
            id="title"
            label="Title"
            placeholder="AVL rotations, worked examples"
            value={values.title}
            onChange={(e) => update({ title: e.target.value })}
            error={errors.title}
          />
          <div className="flex flex-col gap-2.5">
            <label htmlFor="description" className="text-[16px] font-bold">
              Short description <span className="text-ink-2 font-normal">(optional)</span>
            </label>
            <div className="field field-area" data-invalid={errors.description ? '' : undefined}>
              <textarea
                id="description"
                value={values.description}
                maxLength={500}
                onChange={(e) => update({ description: e.target.value })}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
            </div>
            {errors.description ? (
              <FieldError id="description-error">{errors.description}</FieldError>
            ) : null}
          </div>
        </>
      )}

      {mode === 'member' && !listing ? (
        <p className="bg-daily-bg text-daily-fg flex items-start gap-3 rounded-[18px] p-4 text-[15.5px] shadow-[inset_0_0_0_2px_var(--green)]">
          <Trophy className="mt-0.5 size-5 flex-none" aria-hidden="true" />
          <span>
            <strong>Earn points when it is approved.</strong> {POINTS_NOTE}
          </span>
        </p>
      ) : null}

      {mode === 'guest' ? (
        <section aria-labelledby="credit-h" className="flex flex-col gap-4">
          <h2 id="credit-h" className="text-[17px] font-bold">
            Get credit and updates <span className="text-ink-2 font-normal">(optional)</span>
          </h2>
          <TextField
            id="guestName"
            label="Your name"
            placeholder="Shown as the uploader"
            autoComplete="name"
            value={values.guestName}
            onChange={(e) => update({ guestName: e.target.value })}
          />
          <TextField
            id="guestContact"
            label="Phone or email"
            placeholder="We tell you when it is live"
            value={values.guestContact}
            onChange={(e) => update({ guestContact: e.target.value })}
            error={errors.guestContact}
          />
        </section>
      ) : null}

      {!listing ? (
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-3 text-[16.5px]">
            <input
              id="rights"
              type="checkbox"
              checked={values.rightsConfirmed}
              onChange={(e) => update({ rightsConfirmed: e.target.checked })}
              aria-invalid={errors.rights ? true : undefined}
              aria-describedby={errors.rights ? 'rights-error' : undefined}
              className="accent-cobalt mt-0.5 size-6 flex-none"
            />
            {mode === 'guest'
              ? 'I have the right to share this file.'
              : 'These are my own notes, or I have permission to share them.'}
          </label>
          {errors.rights ? <FieldError id="rights-error">{errors.rights}</FieldError> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          className="btn btn-cobalt sm:flex-none"
          disabled={state === 'sending'}
          aria-busy={state === 'sending' || undefined}
        >
          {state === 'sending'
            ? 'Sending…'
            : listing
              ? 'Add to the reading list'
              : 'Send for review'}
        </button>
        <p className="text-ink-2 flex items-start gap-2 text-[15px]">
          <Lock className="mt-0.5 size-4 flex-none" aria-hidden="true" />A moderator checks every
          {mode === 'guest' ? ' upload' : ' student upload'}, usually within a day. We will tell you
          when it is live.
        </p>
      </div>
      {mode === 'guest' ? (
        <p className="text-ink-2 text-center text-[15px]">
          Want points for Pro time and to track your upload?{' '}
          <Link href={SiteRoutes.signup} className="text-link font-bold underline">
            Sign up free
          </Link>
        </p>
      ) : null}
    </form>
  );
}
