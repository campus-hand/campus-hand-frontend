import { previewResources } from '../content/preview-resources';
import type { ReaderResource, ResourceSource } from './resource';

/** Sample files from the design until uploads exist. TODO(backend): content API. */
export class PreviewResourceSource implements ResourceSource {
  constructor(private readonly resources: readonly ReaderResource[] = previewResources) {}

  async find(id: string): Promise<ReaderResource | null> {
    return this.resources.find((r) => r.id === id) ?? null;
  }
}
