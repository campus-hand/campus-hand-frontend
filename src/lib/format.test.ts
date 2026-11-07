import { describe, expect, it } from 'vitest';
import { formatUgx } from './format';

describe('formatUgx', () => {
  it('adds the currency and thousands separators', () => {
    expect(formatUgx(1500)).toBe('UGX 1,500');
    expect(formatUgx(5000)).toBe('UGX 5,000');
  });
  it('rounds to whole shillings', () => {
    expect(formatUgx(499.6)).toBe('UGX 500');
  });
  it('rejects non-numbers', () => {
    expect(() => formatUgx(Number.NaN)).toThrow(RangeError);
  });
});
