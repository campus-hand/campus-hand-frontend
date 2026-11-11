import { ArrowLeft, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { requestTimeMs } from '@/features/student-app/data';
import { UploadForm } from '@/features/upload/components/upload-form';
import { SiteRoutes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Share notes or past papers' };

async function GuestUpload() {
  const nowMs = await requestTimeMs(); // exam years count back from this year
  return <UploadForm mode="guest" profile={null} currentYear={new Date(nowMs).getFullYear()} />;
}

/** Upload without an account: anyone can add to the pool; a moderator checks it. */
export default function GuestUploadPage() {
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-5 pt-4 pb-10 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={SiteRoutes.home}
          aria-label="Back to Campus Hand"
          className="hover:bg-sunken -ml-2 flex size-11 items-center justify-center rounded-full"
        >
          <ArrowLeft className="size-6" aria-hidden="true" />
        </Link>
        <Link href={SiteRoutes.login} className="btn btn-line">
          Log in
        </Link>
      </div>
      <header>
        <h1 className="display text-[clamp(44px,9vw,72px)]">Share notes or past papers</h1>
      </header>
      <p className="bg-sun text-on-sun flex items-start gap-3 rounded-[18px] p-4 text-[16px] font-semibold shadow-[inset_0_0_0_2px_var(--edge),3px_3px_0_var(--drop)]">
        <Info className="mt-0.5 size-5 flex-none" aria-hidden="true" />
        No account needed. Anyone can add to the pool. A moderator checks every upload before
        students see it.
      </p>
      <Suspense fallback={<ScreenLoading label="Opening upload" />}>
        <GuestUpload />
      </Suspense>
    </div>
  );
}
