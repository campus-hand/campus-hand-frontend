import { describe, expect, it } from 'vitest';

describe('API mock', () => {
  it('answers /health through MSW', async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/health`);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
