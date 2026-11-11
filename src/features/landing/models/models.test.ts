import { describe, expect, it, vi } from 'vitest';
import { CourseUnit } from './course-unit';
import { ReferralProgram } from './referral-program';
import { ShareLinkBuilder } from './share-link-builder';
import { Tutor } from './tutor';

describe('CourseUnit', () => {
  it('summarises notes and papers', () => {
    expect(new CourseUnit('CSC 2100', 'DSA', 18, 6).resourceSummary).toBe('18 notes, 6 papers');
    expect(new CourseUnit('X', 'Y', 1, 1).resourceSummary).toBe('1 note, 1 paper');
  });
});

describe('Tutor', () => {
  it('builds initials and skips titles', () => {
    expect(new Tutor('Dr. Atim Grace', '', 4.8, '').initials).toBe('AG');
    expect(new Tutor('Brian Okello', '', 4.9, '').initials).toBe('BO');
  });
  it('formats the rating', () => {
    expect(new Tutor('A B', '', 5, '').ratingLabel).toBe('5.0');
  });
});

describe('ReferralProgram', () => {
  const program = new ReferralProgram();
  it('gives a free week for every 5 verified friends', () => {
    expect(program.weeksEarned(4)).toBe(0);
    expect(program.weeksEarned(5)).toBe(1);
    expect(program.weeksEarned(13)).toBe(2);
    expect(program.weeksEarned(-3)).toBe(0);
  });
  it('unlocks Class builder at 20', () => {
    expect(program.hasClassBuilderBadge(19)).toBe(false);
    expect(program.hasClassBuilderBadge(20)).toBe(true);
  });
  it('describes the rule', () => {
    expect(program.headlineRule).toBe('5 coursemates = 1 free week of Pro');
    expect(program.friendReward).toBe('2 days of Pro');
  });
});

describe('ShareLinkBuilder', () => {
  const share = ShareLinkBuilder.forSite('https://staging.campushand.com/');
  it('trims the site url and builds share links', () => {
    expect(share.url).toBe('https://staging.campushand.com');
    expect(share.whatsapp()).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(decodeURIComponent(share.sms())).toContain('https://staging.campushand.com');
  });
  it('falls back to the production domain', () => {
    expect(ShareLinkBuilder.forSite(undefined).url).toBe('https://campushand.com');
  });
  it('copies the link and reports failures', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(share.copy({ writeText })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('https://staging.campushand.com');
    await expect(
      share.copy({ writeText: vi.fn().mockRejectedValue(new Error('no')) }),
    ).resolves.toBe(false);
    await expect(share.copy(undefined)).resolves.toBe(false);
  });
});
