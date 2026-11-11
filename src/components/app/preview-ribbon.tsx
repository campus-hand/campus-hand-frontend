import { showPreviewRibbon } from '@/features/catalogue/models/data-mode';

/**
 * Thin notice on every app screen outside production: the student, notes,
 * plans and tutors are sample data until sign-in and content are live.
 */
export function PreviewRibbon() {
  if (!showPreviewRibbon()) return null;
  return (
    <p className="bg-paper-tag-bg text-paper-tag-fg border-edge border-b-2 px-4 py-1.5 text-center text-[13px] font-semibold">
      Preview: you are seeing a sample student and sample notes until sign-in and uploads are live.
    </p>
  );
}
