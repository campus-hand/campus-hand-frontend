import { describe, expect, it } from 'vitest';
import { previewPosts } from '../content/preview-posts';
import { CampusPost, categoryFromParam, postsIn, relatedPosts } from './campus-post';
import { PreviewCampusPostSource } from './preview-campus-post-source';

const post = (slug: string, category: CampusPost['category'], publishedOn: string) =>
  new CampusPost(slug, category, slug, '', { name: 'Okot Denis' }, 3, publishedOn, []);

describe('CampusPost', () => {
  const retake = previewPosts[0];

  it('writes the byline, author line and initials', () => {
    expect(retake.byline).toBe('Namusoke Joan, 5 minute read');
    expect(retake.authorDetail).toBe('Year 3 Law, 5 minute read');
    expect(retake.initials).toBe('NJ');
    expect(post('a', 'Food', '2026-01-01').authorDetail).toBe('3 minute read');
  });

  it('labels the date it went live', () => {
    expect(retake.publishedLabel).toBe('10 November 2026');
  });
});

describe('categories', () => {
  it('reads ?topic= values in any case, and nothing else', () => {
    expect(categoryFromParam('fees')).toBe('Fees');
    expect(categoryFromParam(' FRESHERS ')).toBe('Freshers');
    expect(categoryFromParam('')).toBeNull();
    expect(categoryFromParam('gossip')).toBeNull();
  });

  it('filters by category, newest first', () => {
    const posts = [
      post('old-fees', 'Fees', '2026-01-01'),
      post('food', 'Food', '2026-03-01'),
      post('new-fees', 'Fees', '2026-02-01'),
    ];
    expect(postsIn(posts, null).map((p) => p.slug)).toEqual(['food', 'new-fees', 'old-fees']);
    expect(postsIn(posts, 'Fees').map((p) => p.slug)).toEqual(['new-fees', 'old-fees']);
    expect(postsIn(posts, 'Events')).toEqual([]);
  });

  it('suggests the same category first, then the newest, never the post itself', () => {
    const posts = [
      post('a', 'Fees', '2026-01-01'),
      post('b', 'Food', '2026-04-01'),
      post('c', 'Fees', '2026-02-01'),
      post('d', 'Events', '2026-03-01'),
    ];
    expect(relatedPosts(posts, posts[0]).map((p) => p.slug)).toEqual(['c', 'b', 'd']);
    expect(relatedPosts(posts, posts[0], 1).map((p) => p.slug)).toEqual(['c']);
  });
});

describe('PreviewCampusPostSource', () => {
  it('lists the sample posts and finds one by slug', async () => {
    const source = new PreviewCampusPostSource();
    const posts = await source.list();
    expect(posts).toHaveLength(7);
    expect(new Set(posts.map((p) => p.slug)).size).toBe(7);
    expect((await source.find('lunch-under-5000'))?.category).toBe('Food');
    expect(await source.find('nope')).toBeNull();
  });
});
