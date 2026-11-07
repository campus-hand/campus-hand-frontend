import createClient from 'openapi-fetch';
import type { paths } from './schema';

/** Typed client for the Campus Hand API. Types come from `pnpm api:sync`. */
export const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  credentials: 'include',
});
