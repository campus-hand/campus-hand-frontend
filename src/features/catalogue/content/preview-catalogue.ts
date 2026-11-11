// Sample catalogue from the design canvas, used wherever the app is not
// talking to the API (local development, tests, previews).
// TODO(content): illustration only; real catalogues are imported into the API.

export const previewInstitution = {
  slug: 'sample',
  name: 'Makerere University',
  shortName: 'MAK',
} as const;

export const previewProgramme = {
  id: 'bscs',
  code: 'BSCS',
  name: 'BSc Computer Science',
  durationYears: 3,
} as const;

export interface PreviewUnit {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  year: number;
  semester: number;
  isElective?: boolean;
  topics?: string[];
}

export const previewUnits: PreviewUnit[] = [
  {
    id: 'csc-2100',
    code: 'CSC 2100',
    title: 'Data Structures and Algorithms',
    creditUnits: 4,
    year: 2,
    semester: 1,
    topics: [
      'Complexity and Big-O',
      'Arrays and linked lists',
      'Stacks and queues',
      'Trees and binary search trees',
      'Heaps and priority queues',
      'Hashing',
      'Graphs and traversal',
    ],
  },
  {
    id: 'csc-2104',
    code: 'CSC 2104',
    title: 'Operating Systems',
    creditUnits: 4,
    year: 2,
    semester: 1,
  },
  {
    id: 'csc-2110',
    code: 'CSC 2110',
    title: 'Database Systems',
    creditUnits: 4,
    year: 2,
    semester: 1,
  },
  {
    id: 'csc-2112',
    code: 'CSC 2112',
    title: 'Computer Networks',
    creditUnits: 3,
    year: 2,
    semester: 1,
  },
  {
    id: 'mth-2105',
    code: 'MTH 2105',
    title: 'Probability and Statistics',
    creditUnits: 3,
    year: 2,
    semester: 1,
  },
];
