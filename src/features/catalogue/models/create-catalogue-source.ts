import { api } from '@/lib/api/client';
import { ApiCatalogueSource } from './api-catalogue-source';
import type { CatalogueSource } from './catalogue';
import { catalogueMode, type DataMode } from './data-mode';
import { PreviewCatalogueSource } from './preview-catalogue-source';

/** The catalogue for the current environment (see catalogueMode). */
export function createCatalogueSource(mode: DataMode = catalogueMode()): CatalogueSource {
  return mode === 'api' ? new ApiCatalogueSource(api) : new PreviewCatalogueSource();
}
