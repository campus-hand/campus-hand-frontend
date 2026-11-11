import { describe, expect, it } from 'vitest';
import { matchesQuery } from '../components/courses-screen';
import { EMPTY_MATERIALS, topicSummary, totalsSentence } from './materials';
import { PreviewMaterialsSource } from './preview-materials-source';

describe('materials labels', () => {
  it('summarises a topic', () => {
    expect(topicSummary({ noteCount: 3, tutorialCount: 1 })).toBe('3 notes, 1 tutorial');
    expect(topicSummary({ noteCount: 1, tutorialCount: 2 })).toBe('1 note, 2 tutorials');
    expect(topicSummary({ noteCount: 0, tutorialCount: 0 })).toBe('No notes yet');
  });

  it('writes the totals sentence', () => {
    expect(totalsSentence({ notes: 18, papers: 6, tutors: 3 })).toBe(
      '18 notes, 6 past papers, 3 tutors.',
    );
    expect(totalsSentence({ notes: 1, papers: 1, tutors: 1 })).toBe(
      '1 note, 1 past paper, 1 tutor.',
    );
  });
});

describe('PreviewMaterialsSource', () => {
  it('has the design’s CSC 2100 materials and nothing for other units', async () => {
    const source = new PreviewMaterialsSource();
    const csc2100 = await source.forCourseUnit('CSC 2100');
    expect(csc2100.topics.find((t) => t.progress === 'current')?.files).toHaveLength(4);
    expect(csc2100.pastPapers[0]).toMatchObject({ sitting: 'Dec 2024', withAnswers: true });
    expect(await source.forCourseUnit('SAMPLE-CS 1201')).toBe(EMPTY_MATERIALS);
  });
});

describe('matchesQuery', () => {
  const unit = { code: 'CSC 2100', title: 'Data Structures and Algorithms' };
  it('matches codes without spaces and words in titles, case-insensitively', () => {
    expect(matchesQuery(unit, 'csc2100')).toBe(true);
    expect(matchesQuery(unit, 'structures')).toBe(true);
    expect(matchesQuery(unit, '  ')).toBe(true);
    expect(matchesQuery(unit, 'networks')).toBe(false);
  });
});
