export type DataMode = 'api' | 'preview';

export interface DataModeEnv {
  /** NEXT_PUBLIC_CATALOGUE_MODE: "api" or "preview". */
  mode?: string;
  /** NEXT_PUBLIC_APP_ENV: "production", "staging", … */
  appEnv?: string;
}

/**
 * Where the student app reads the catalogue from. Production always uses the
 * API. Elsewhere the design's sample data is used unless
 * NEXT_PUBLIC_CATALOGUE_MODE=api is set (as on staging once its catalogue is
 * imported), so local runs and CI never depend on a sleeping staging API.
 */
export function catalogueMode(
  env: DataModeEnv = {
    mode: process.env.NEXT_PUBLIC_CATALOGUE_MODE,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
  },
): DataMode {
  return env.appEnv === 'production' || env.mode === 'api' ? 'api' : 'preview';
}

/** True on every environment except production: shows the "Preview" ribbon. */
export function showPreviewRibbon(appEnv: string | undefined = process.env.NEXT_PUBLIC_APP_ENV) {
  return appEnv !== 'production';
}
