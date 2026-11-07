import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins class names and drops falsy ones', () => {
    expect(cn('p-2', false && 'hidden', 'text-sm')).toBe('p-2 text-sm');
  });
  it('lets later Tailwind classes win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
