import { describe, expect, it } from 'vitest';
import { choose, EMPTY_PLACEMENT, type Placement, readiness, yearsFor } from './placement';
import { PreviewUploadSource } from './preview-upload-source';
import {
  EMPTY_BOOK,
  examYears,
  fileBadge,
  fileProblem,
  fileSizeLabel,
  isReadingListEntry,
  type UploadValues,
  validateUpload,
} from './upload';

const full: Placement = {
  institutionSlug: 'sample',
  programmeId: 'bscs',
  year: 2,
  semester: 1,
  courseUnitId: 'csc-2100',
  topicId: 'csc-2100-t4',
};

const pdf = { name: 'avl.pdf', sizeBytes: 2_400_000, type: 'application/pdf' };

const ready: UploadValues = {
  file: pdf,
  placement: full,
  kind: 'lecture',
  title: 'AVL rotations',
  description: '',
  examYear: '',
  examSitting: '',
  bookChoice: 'list',
  book: EMPTY_BOOK,
  guestName: '',
  guestContact: '',
  rightsConfirmed: true,
};

describe('placement', () => {
  it('clears the picks that depended on a changed pick', () => {
    expect(choose(full, 'institutionSlug', 'uict')).toEqual({
      ...EMPTY_PLACEMENT,
      institutionSlug: 'uict',
    });
    expect(choose(full, 'programmeId', 'other')).toEqual({
      ...EMPTY_PLACEMENT,
      institutionSlug: 'sample',
      programmeId: 'other',
      semester: 1,
    });
    expect(choose(full, 'semester', 2)).toMatchObject({ year: 2, courseUnitId: '', topicId: '' });
    expect(choose(full, 'courseUnitId', 'csc-2104')).toMatchObject({ topicId: '' });
    expect(choose(full, 'topicId', '')).toMatchObject({ courseUnitId: 'csc-2100', topicId: '' });
  });

  it('keeps the same object when a pick does not change', () => {
    expect(choose(full, 'year', 2)).toBe(full);
  });

  it('unlocks each picker once the ones before it are chosen', () => {
    expect(readiness(EMPTY_PLACEMENT)).toEqual({
      programme: false,
      term: false,
      courseUnit: false,
      topic: false,
    });
    expect(
      readiness({ ...EMPTY_PLACEMENT, institutionSlug: 'sample', programmeId: 'bscs' }),
    ).toEqual({ programme: true, term: true, courseUnit: false, topic: false });
    expect(readiness(full)).toEqual({ programme: true, term: true, courseUnit: true, topic: true });
  });

  it('offers the programme’s years, 4 when unknown, between 1 and 7', () => {
    expect(yearsFor(3)).toEqual([1, 2, 3]);
    expect(yearsFor(undefined)).toEqual([1, 2, 3, 4]);
    expect(yearsFor(0)).toEqual([1]);
    expect(yearsFor(12)).toHaveLength(7);
  });
});

describe('files', () => {
  it('labels sizes and types', () => {
    expect(fileSizeLabel(2.4 * 1024 * 1024)).toBe('2.4 MB');
    expect(fileSizeLabel(820 * 1024)).toBe('820 KB');
    expect(fileSizeLabel(10)).toBe('1 KB');
    expect(fileBadge('Lecture 5.pptx')).toBe('PPTX');
    expect(fileBadge('notes')).toBe('FILE');
  });

  it('accepts documents and photos up to 25 MB', () => {
    expect(fileProblem(pdf)).toBeNull();
    expect(fileProblem({ ...pdf, name: 'PHOTO.JPG' })).toBeNull();
    expect(fileProblem({ ...pdf, name: 'setup.exe' })).toMatch(/Choose a PDF/);
    expect(fileProblem({ ...pdf, sizeBytes: 26 * 1024 * 1024 })).toMatch(/over 25 MB/);
    expect(fileProblem({ ...pdf, sizeBytes: 0 })).toBe('This file is empty.');
  });

  it('only offers exam years already past or this year', () => {
    expect(examYears(2026)).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]);
  });
});

describe('validateUpload', () => {
  it('passes a complete upload', () => {
    expect(validateUpload(ready, 'member')).toEqual({});
  });

  it('lists every problem in form order', () => {
    const empty: UploadValues = {
      ...ready,
      file: null,
      placement: EMPTY_PLACEMENT,
      kind: null,
      title: '',
      rightsConfirmed: false,
    };
    expect(Object.keys(validateUpload(empty, 'member'))).toEqual([
      'file',
      'institution',
      'programme',
      'year',
      'semester',
      'courseUnit',
      'kind',
      'title',
      'rights',
    ]);
    expect(validateUpload(empty, 'guest').rights).toBe(
      'Confirm you have the right to share this file.',
    );
  });

  it('asks for the exam year and exam on a past paper', () => {
    const errors = validateUpload({ ...ready, kind: 'paper' }, 'member');
    expect(Object.keys(errors)).toEqual(['examYear', 'examSitting']);
    expect(
      validateUpload(
        { ...ready, kind: 'paper', examYear: '2025', examSitting: 'Final exam' },
        'member',
      ),
    ).toEqual({});
  });

  it('checks titles and descriptions', () => {
    expect(validateUpload({ ...ready, title: ' a ' }, 'member').title).toMatch(/recognise/);
    expect(validateUpload({ ...ready, title: 'x'.repeat(121) }, 'member').title).toMatch(/120/);
    expect(
      validateUpload({ ...ready, description: 'x'.repeat(501) }, 'member').description,
    ).toMatch(/500/);
  });

  it('needs book details, not a file, for a reading-list entry', () => {
    const listing: UploadValues = { ...ready, file: null, kind: 'book', rightsConfirmed: false };
    expect(isReadingListEntry(listing)).toBe(true);
    expect(Object.keys(validateUpload(listing, 'member'))).toEqual([
      'bookTitle',
      'bookAuthors',
      'bookEdition',
      'bookPlaces',
    ]);
    const book = {
      ...EMPTY_BOOK,
      title: 'Data Structures',
      authors: 'Goodrich',
      editionYear: '2nd, 2011',
      places: ['library' as const],
    };
    expect(validateUpload({ ...listing, book }, 'member')).toEqual({});
    expect(
      validateUpload({ ...listing, book: { ...book, isbn: '12' } }, 'member').bookIsbn,
    ).toMatch(/10 or 13/);
    expect(
      validateUpload({ ...listing, book: { ...book, isbn: '978-0-470-38327-8' } }, 'member'),
    ).toEqual({});
    // Sharing the book file is an ordinary upload.
    expect(isReadingListEntry({ kind: 'book', bookChoice: 'share' })).toBe(false);
  });

  it('accepts an empty, email or phone contact from guests', () => {
    expect(validateUpload(ready, 'guest')).toEqual({});
    expect(validateUpload({ ...ready, guestContact: 'sarah@example.com' }, 'guest')).toEqual({});
    expect(validateUpload({ ...ready, guestContact: '+256 700 123456' }, 'guest')).toEqual({});
    expect(validateUpload({ ...ready, guestContact: 'tomorrow' }, 'guest').guestContact).toMatch(
      /email or a phone/,
    );
  });
});

describe('PreviewUploadSource', () => {
  it('reports progress up to 1 and gives a reference', async () => {
    const source = new PreviewUploadSource(0, 4);
    const seen: number[] = [];
    await source.sendFile(pdf, (s) => seen.push(s));
    expect(seen).toEqual([0.25, 0.5, 0.75, 1]);
    expect((await source.submit(ready, 'member')).reference).toMatch(/^UP-M\d+$/);
    expect(
      (await source.submit({ ...ready, kind: 'book', bookChoice: 'list' }, 'guest')).reference,
    ).toMatch(/^RL-G\d+$/);
  });

  it('lists sample uploads in each status', async () => {
    const mine = await new PreviewUploadSource(0).myUploads();
    expect(mine.map((u) => u.status)).toEqual(['live', 'review', 'changes']);
    expect(mine[2].moderatorNote).toMatch(/blurry/);
  });
});
