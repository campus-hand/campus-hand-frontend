import { ApiAuthClient } from './api-auth-client';
import type { AuthClient } from './auth-client';
import { PreviewAuthClient } from './preview-auth-client';

export interface AuthClientEnv {
  /** NEXT_PUBLIC_AUTH_MODE: "api" or "preview". */
  mode?: string;
  /** NEXT_PUBLIC_APP_ENV: "production", "staging", … */
  appEnv?: string;
  apiUrl?: string;
  siteUrl?: string;
}

/**
 * Picks the real API client or the click-through preview.
 *
 * Production always talks to the API. Elsewhere the preview is used until
 * NEXT_PUBLIC_AUTH_MODE=api is set, i.e. until the API's sign-in feature is
 * live on staging. TODO(backend): set NEXT_PUBLIC_AUTH_MODE=api on staging then.
 */
export function createAuthClient(
  env: AuthClientEnv = {
    mode: process.env.NEXT_PUBLIC_AUTH_MODE,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  },
): AuthClient {
  const useApi = env.appEnv === 'production' || env.mode === 'api';
  if (!useApi) return new PreviewAuthClient();
  return new ApiAuthClient(
    env.apiUrl ?? 'http://localhost:4000',
    env.siteUrl ?? 'http://localhost:3000',
  );
}
