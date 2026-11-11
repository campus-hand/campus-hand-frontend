import { describe, expect, it } from 'vitest';
import { PreviewViewerSource, Viewer } from './viewer';

const place = { institutionSlug: 'sample', programmeCode: 'BSCS', year: 2, semester: 1 };

describe('Viewer', () => {
  it('reads names written surname first', () => {
    const v = new Viewer('Nakato Sarah', 'student', true, place, { left: 2, perDay: 3 });
    expect(v.firstName).toBe('Sarah');
    expect(v.initials).toBe('SN');
    expect(new Viewer('Okello', 'student', true, place, { left: 0, perDay: 3 }).initials).toBe('O');
  });

  it('describes the role and verification', () => {
    expect(new Viewer('A B', 'student', true, place, { left: 1, perDay: 3 }).statusLabel).toBe(
      'Verified student',
    );
    expect(new Viewer('A B', 'lecturer', true, place, { left: 1, perDay: 3 }).statusLabel).toBe(
      'Verified lecturer',
    );
    expect(new Viewer('A B', 'student', false, place, { left: 1, perDay: 3 }).statusLabel).toBe(
      'Student (not verified yet)',
    );
  });

  it('works out the share of free credits left, kept between 0 and 1', () => {
    const v = (left: number, perDay: number) =>
      new Viewer('A B', 'student', true, place, { left, perDay });
    expect(v(2, 3).creditsLeftShare).toBeCloseTo(2 / 3);
    expect(v(5, 3).creditsLeftShare).toBe(1);
    expect(v(1, 0).creditsLeftShare).toBe(0);
  });
});

describe('PreviewViewerSource', () => {
  it('studies the imported UICT sample on the API, the canvas sample in preview', async () => {
    expect((await new PreviewViewerSource('api').current()).studyPlace).toMatchObject({
      institutionSlug: 'uict',
      programmeCode: 'SAMPLE-DCS',
    });
    const preview = await new PreviewViewerSource('preview').current();
    expect(preview.studyPlace).toEqual(place);
    expect(preview.credits.perDay).toBe(3);
  });
});
