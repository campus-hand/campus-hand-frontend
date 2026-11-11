import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ScreenLoading } from '@/components/app/screen-loading';
import { PostScreen } from '@/features/campus/components/post-screen';
import { relatedPosts } from '@/features/campus/models/campus-post';
import { getCampusPost, getCampusPosts } from '@/features/student-app/data';

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = await getCampusPost((await params).slug);
  return post ? { title: post.title, description: post.summary } : { title: 'Campus' };
}

async function Post({ slug }: { slug: string }) {
  const post = await getCampusPost(slug);
  if (!post) notFound();
  const next = relatedPosts(await getCampusPosts(), post);
  return <PostScreen post={post} next={next} />;
}

export default function CampusPostPage({ params }: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<ScreenLoading label="Opening the post" />}>
      {params.then(({ slug }) => (
        <Post slug={slug} />
      ))}
    </Suspense>
  );
}
