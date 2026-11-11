import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import {
  getMyUploads,
  getProfilePlacement,
  getViewer,
  requestTimeMs,
} from '@/features/student-app/data';
import { MyUploads, SharingABook } from '@/features/upload/components/upload-rail';
import { UploadForm } from '@/features/upload/components/upload-form';

export const metadata: Metadata = { title: 'Upload' };

async function Upload() {
  const nowMs = await requestTimeMs(); // exam years count back from this year
  const viewer = await getViewer();
  const [profile, uploads] = await Promise.all([
    getProfilePlacement(viewer.studyPlace),
    getMyUploads(),
  ]);
  return (
    <div className="wide:grid-cols-[1fr_400px] mx-auto grid max-w-[1400px] gap-10 px-5 pt-6 pb-10 sm:px-8 lg:px-10 lg:pt-10">
      <div className="flex min-w-0 flex-col gap-7">
        <header>
          <h1 className="display text-[clamp(52px,7vw,84px)]">Upload</h1>
          <p className="text-ink-2 mt-1 text-[17px]">
            Share notes, past papers, tutorials and books with students doing the same course unit.
          </p>
        </header>
        <UploadForm mode="member" profile={profile} currentYear={new Date(nowMs).getFullYear()} />
      </div>
      <div className="flex flex-col gap-6">
        <MyUploads uploads={uploads} />
        <SharingABook />
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<ScreenLoading label="Opening upload" />}>
      <Upload />
    </Suspense>
  );
}
