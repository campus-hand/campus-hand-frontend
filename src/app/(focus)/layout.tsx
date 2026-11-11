import type { Metadata } from 'next';
import { PreviewRibbon } from '@/components/app/preview-ribbon';

export const metadata: Metadata = {
  // Signed-in screens are never indexed.
  robots: { index: false, follow: false },
};

/** Full-screen student screens (reader, quiz): no sidebar or tab bar. */
export default function FocusLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="bg-paper min-h-dvh">
      <PreviewRibbon />
      {children}
    </div>
  );
}
