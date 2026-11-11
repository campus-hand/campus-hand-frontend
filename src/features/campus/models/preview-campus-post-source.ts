import { previewPosts } from '../content/preview-posts';
import type { CampusPost, CampusPostSource } from './campus-post';

/** Sample posts in memory, until the blog API exists. TODO(backend): blog posts API. */
export class PreviewCampusPostSource implements CampusPostSource {
  constructor(private readonly posts: readonly CampusPost[] = previewPosts) {}

  async list(): Promise<CampusPost[]> {
    return [...this.posts];
  }

  async find(slug: string): Promise<CampusPost | null> {
    return this.posts.find((p) => p.slug === slug) ?? null;
  }
}
