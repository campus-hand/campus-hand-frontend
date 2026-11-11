import { http, HttpResponse } from 'msw';
import createClient from 'openapi-fetch';
import { describe, expect, it } from 'vitest';
import type { paths } from '@/lib/api/schema';
import { server } from '@/test/msw/server';
import { ApiCatalogueSource } from './api-catalogue-source';
import { codeLine, termLabel } from './catalogue';
import { createCatalogueSource } from './create-catalogue-source';
import { catalogueMode, showPreviewRibbon } from './data-mode';
import { PreviewCatalogueSource } from './preview-catalogue-source';

const API = 'http://api.test';
const source = () => new ApiCatalogueSource(createClient<paths>({ baseUrl: API }));
const PROGRAMME_ID = '0b9d5a2e-2f4c-4a3b-9c1d-7e6f5a4b3c2d';
const UNIT_ID = '4b0c5e0e-1d2f-4a8b-9c3d-2e1f0a9b8c7d';

describe('ApiCatalogueSource', () => {
  it('finds a programme by code among an institution’s programmes', async () => {
    server.use(
      http.get(`${API}/catalogue/institutions/uict/programmes`, () =>
        HttpResponse.json({
          items: [
            {
              id: PROGRAMME_ID,
              code: 'SAMPLE-DCS',
              name: 'Diploma in Computer Science',
              awardLevel: 'diploma',
              durationYears: 2,
              academicUnit: { kind: 'department', name: 'Computing' },
            },
          ],
        }),
      ),
    );
    expect(await source().findProgramme('uict', 'SAMPLE-DCS')).toEqual({
      id: PROGRAMME_ID,
      code: 'SAMPLE-DCS',
      name: 'Diploma in Computer Science',
      durationYears: 2,
    });
    expect(await source().findProgramme('uict', 'OTHER')).toBeNull();
  });

  it('lists institutions, and no programmes for an unknown institution', async () => {
    server.use(
      http.get(`${API}/catalogue/institutions`, () =>
        HttpResponse.json({
          items: [{ slug: 'uict', name: 'UICT full name', shortName: 'UICT' }],
        }),
      ),
      http.get(`${API}/catalogue/institutions/nowhere/programmes`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );
    expect(await source().listInstitutions()).toEqual([
      { slug: 'uict', name: 'UICT full name', shortName: 'UICT' },
    ]);
    expect(await source().listProgrammes('nowhere')).toEqual([]);
  });

  it('asks for one year and semester of a programme', async () => {
    let query = '';
    server.use(
      http.get(`${API}/catalogue/programmes/${PROGRAMME_ID}/course-units`, ({ request }) => {
        query = new URL(request.url).search;
        return HttpResponse.json({
          items: [
            {
              id: UNIT_ID,
              code: 'SAMPLE-CS 1201',
              title: 'Data Structures and Algorithms',
              creditUnits: 4,
              yearOfStudy: 1,
              semester: 2,
              isElective: false,
            },
          ],
        });
      }),
    );
    const units = await source().termCourseUnits(PROGRAMME_ID, 1, 2);
    expect(query).toBe('?year=1&semester=2');
    expect(units.map((u) => u.code)).toEqual(['SAMPLE-CS 1201']);
  });

  it('maps a course unit detail', async () => {
    server.use(
      http.get(`${API}/catalogue/course-units/${UNIT_ID}`, () =>
        HttpResponse.json({
          id: UNIT_ID,
          code: 'SAMPLE-CS 1201',
          title: 'Data Structures and Algorithms',
          creditUnits: 4,
          institution: { slug: 'uict', name: 'UICT full name', shortName: 'UICT' },
          topics: [{ id: 't1', title: 'Big-O', position: 1 }],
          programmes: [
            {
              id: PROGRAMME_ID,
              code: 'SAMPLE-DCS',
              name: 'Diploma in Computer Science',
              yearOfStudy: 1,
              semester: 2,
              isElective: false,
            },
          ],
        }),
      ),
    );
    const unit = await source().courseUnit(UNIT_ID);
    expect(unit?.taughtIn).toEqual([
      {
        programmeCode: 'SAMPLE-DCS',
        programmeName: 'Diploma in Computer Science',
        yearOfStudy: 1,
        semester: 2,
        isElective: false,
      },
    ]);
    expect(unit?.topics[0].title).toBe('Big-O');
  });

  it('treats 404 and 400 as "not found", and other failures as errors', async () => {
    server.use(
      http.get(`${API}/catalogue/course-units/missing`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
      http.get(`${API}/catalogue/course-units/bad`, () =>
        HttpResponse.json({ message: 'Bad id' }, { status: 400 }),
      ),
      http.get(`${API}/catalogue/course-units/boom`, () =>
        HttpResponse.json({ message: 'Down' }, { status: 503 }),
      ),
      http.get(`${API}/catalogue/institutions/nope/programmes`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
      http.get(`${API}/catalogue/programmes/gone/course-units`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );
    expect(await source().courseUnit('missing')).toBeNull();
    expect(await source().courseUnit('bad')).toBeNull();
    await expect(source().courseUnit('boom')).rejects.toThrow('Catalogue API answered 503');
    expect(await source().findProgramme('nope', 'X')).toBeNull();
    expect(await source().termCourseUnits('gone', 1, 1)).toEqual([]);
  });
});

describe('PreviewCatalogueSource', () => {
  const preview = new PreviewCatalogueSource();

  it('serves the design’s Year 2 Semester 1 course units', async () => {
    const programme = await preview.findProgramme('sample', 'BSCS');
    expect(programme?.name).toBe('BSc Computer Science');
    const units = await preview.termCourseUnits(programme!.id, 2, 1);
    expect(units.map((u) => u.code)).toEqual([
      'CSC 2100',
      'CSC 2104',
      'CSC 2110',
      'CSC 2112',
      'MTH 2105',
    ]);
    expect(await preview.termCourseUnits(programme!.id, 1, 1)).toEqual([]);
    expect(await preview.termCourseUnits('other', 2, 1)).toEqual([]);
    expect(await preview.findProgramme('uict', 'BSCS')).toBeNull();
  });

  it('lists the sample university and its one programme', async () => {
    expect((await preview.listInstitutions()).map((i) => i.slug)).toEqual(['sample']);
    expect((await preview.listProgrammes('sample')).map((p) => p.code)).toEqual(['BSCS']);
    expect(await preview.listProgrammes('uict')).toEqual([]);
  });

  it('returns a course unit with numbered topics, or null', async () => {
    const unit = await preview.courseUnit('csc-2100');
    expect(unit?.topics).toHaveLength(7);
    expect(unit?.topics[3]).toEqual({
      id: 'csc-2100-t4',
      title: 'Trees and binary search trees',
      position: 4,
    });
    expect((await preview.courseUnit('csc-2104'))?.topics).toEqual([]);
    expect(await preview.courseUnit('nope')).toBeNull();
  });
});

describe('catalogue mode', () => {
  it('uses the API in production or when asked, preview otherwise', () => {
    expect(catalogueMode({ appEnv: 'production' })).toBe('api');
    expect(catalogueMode({ appEnv: 'staging', mode: 'api' })).toBe('api');
    expect(catalogueMode({ appEnv: 'staging' })).toBe('preview');
    expect(catalogueMode({})).toBe('preview');
    expect(createCatalogueSource('preview').mode).toBe('preview');
    expect(createCatalogueSource('api').mode).toBe('api');
  });

  it('shows the preview ribbon everywhere except production', () => {
    expect(showPreviewRibbon('production')).toBe(false);
    expect(showPreviewRibbon('staging')).toBe(true);
    expect(showPreviewRibbon(undefined)).toBe(true);
  });
});

describe('catalogue labels', () => {
  it('formats terms and code lines', () => {
    expect(termLabel(2, 1)).toBe('Year 2, Semester 1');
    expect(codeLine({ code: 'CSC 2100', creditUnits: 4 })).toBe('CSC 2100, 4 credit units');
    expect(codeLine({ code: 'X 1', creditUnits: 1 })).toBe('X 1, 1 credit unit');
    expect(codeLine({ code: 'X 1', creditUnits: null })).toBe('X 1');
  });
});
