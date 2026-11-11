'use client';

import { BookMarked, Link2, MapPin, Store } from 'lucide-react';
import { TextField } from '@/features/auth/components/fields';
import { cn } from '@/lib/utils';
import {
  BOOK_PLACES,
  type BookChoice,
  type BookDetails,
  type BookPlace,
  type UploadErrors,
} from '../models/upload';
import { FieldError } from './form-bits';

/** "Can you share the book file?": share it as a file, or list it on the reading list. */
export function BookChoicePicker({
  value,
  onChange,
}: {
  value: BookChoice;
  onChange: (value: BookChoice) => void;
}) {
  const options: { value: BookChoice; title: string; body: string }[] = [
    {
      value: 'list',
      title: 'No, list it as a resource',
      body: 'Students see the details and find the book themselves in a library, bookshop or online.',
    },
    {
      value: 'share',
      title: 'Yes, I can share it',
      body: 'It is open licence or out of copyright, or I am the lecturer who wrote it and I give permission. Bought textbooks can’t be shared. A moderator checks before it goes live.',
    },
  ];
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[17px] font-bold">Can you share the book file?</legend>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              'flex cursor-pointer items-start gap-4 rounded-[18px] p-4',
              selected
                ? 'bg-paper-tag-bg shadow-[inset_0_0_0_2.5px_var(--edge),3px_3px_0_var(--drop)]'
                : 'bg-surface shadow-[inset_0_0_0_2px_var(--rule)]',
            )}
          >
            <input
              type="radio"
              name="book-choice"
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="accent-ink mt-1 size-6 flex-none"
            />
            <span>
              <span className="block text-[17px] font-bold">{o.title}</span>
              <span className="text-ink-2 block text-[15px]">{o.body}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

const PLACE_ICON: Record<BookPlace, typeof MapPin> = {
  library: BookMarked,
  bookshop: Store,
  online: Link2,
};

/** Book details for a reading-list entry. */
export function BookDetailsForm({
  book,
  onChange,
  errors,
}: {
  book: BookDetails;
  onChange: (book: BookDetails) => void;
  errors: UploadErrors;
}) {
  const set = <K extends keyof BookDetails>(key: K, value: BookDetails[K]) =>
    onChange({ ...book, [key]: value });
  const toggle = (place: BookPlace) =>
    set(
      'places',
      book.places.includes(place)
        ? book.places.filter((p) => p !== place)
        : [...book.places, place],
    );

  return (
    <section aria-labelledby="book-h" className="panel flex flex-col gap-5 p-5 sm:p-7">
      <h2 id="book-h" className="display flex items-center gap-3 text-[30px] sm:text-[36px]">
        <BookMarked className="size-7" aria-hidden="true" />
        Book details
      </h2>
      <TextField
        id="bookTitle"
        label="Title"
        value={book.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.bookTitle}
      />
      <TextField
        id="bookAuthors"
        label="Author(s)"
        value={book.authors}
        onChange={(e) => set('authors', e.target.value)}
        error={errors.bookAuthors}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="bookEdition"
          label="Edition and year"
          placeholder="2nd, 2011"
          value={book.editionYear}
          onChange={(e) => set('editionYear', e.target.value)}
          error={errors.bookEdition}
        />
        <TextField
          id="bookIsbn"
          label={
            <>
              ISBN <span className="text-ink-2 font-normal">(optional)</span>
            </>
          }
          placeholder="978-…"
          inputMode="numeric"
          value={book.isbn}
          onChange={(e) => set('isbn', e.target.value)}
          error={errors.bookIsbn}
        />
      </div>
      <fieldset
        id="bookPlaces"
        tabIndex={-1}
        aria-describedby={errors.bookPlaces ? 'bookPlaces-error' : undefined}
        className="flex flex-col gap-3"
      >
        <legend className="mb-3 text-[16px] font-bold">Where to find it</legend>
        <div className="flex flex-wrap gap-2.5">
          {BOOK_PLACES.map((p) => {
            const Icon = PLACE_ICON[p.value];
            const on = book.places.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(p.value)}
                className={cn(
                  'chip min-h-11 px-4 text-[15.5px] font-bold',
                  on && 'bg-inverse text-on-inverse shadow-none',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {p.label}
              </button>
            );
          })}
        </div>
        {errors.bookPlaces ? (
          <FieldError id="bookPlaces-error">{errors.bookPlaces}</FieldError>
        ) : null}
      </fieldset>
      {book.places.includes('library') ? (
        <TextField
          id="bookShelf"
          label="Library and shelf number"
          placeholder="Main Library, QA76.73 .G66"
          value={book.shelf}
          onChange={(e) => set('shelf', e.target.value)}
        />
      ) : null}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="bookWhy" className="text-[16px] font-bold">
          Why it helps <span className="text-ink-2 font-normal">(optional)</span>
        </label>
        <div className="field field-area">
          <textarea
            id="bookWhy"
            value={book.whyItHelps}
            maxLength={300}
            onChange={(e) => set('whyItHelps', e.target.value)}
            placeholder="Chapters 7 to 10 match the tree and graph topics."
          />
        </div>
      </div>
    </section>
  );
}

/** How students will see a reading-list entry (also used as the live preview). */
export function ReadingListCard({ book }: { book: BookDetails }) {
  const where = book.places.includes('library') && book.shelf ? book.shelf : null;
  const letters = (book.title.match(/\b[A-Z]/g) ?? ['B']).slice(0, 3).join('');
  return (
    <article className="panel flex gap-4 p-4" aria-label="Reading list entry">
      <span
        aria-hidden="true"
        className="bg-cobalt text-on-cobalt display flex h-24 w-[72px] flex-none items-center justify-center rounded-[8px] text-[20px] shadow-[inset_0_0_0_2px_var(--edge)]"
      >
        {letters}
      </span>
      <div className="min-w-0">
        <span className="tag tag-note">Reading list</span>
        <p className="mt-1.5 text-[17px] leading-snug font-bold">{book.title || 'Book title'}</p>
        <p className="text-ink-2 text-[14.5px]">
          {[book.authors || 'Author', book.editionYear].filter(Boolean).join(' · ')}
        </p>
        {where ? (
          <p className="mt-1 flex items-center gap-1.5 text-[14.5px] font-bold">
            <MapPin className="size-4" aria-hidden="true" />
            {where}
          </p>
        ) : null}
        <p className="text-ink-2 mt-1 text-[14px]">
          No download. Find it in the library or a bookshop.
        </p>
      </div>
    </article>
  );
}
