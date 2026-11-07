import { http, HttpResponse } from 'msw';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const handlers = [http.get(`${API}/health`, () => HttpResponse.json({ status: 'ok' }))];
