import { SiteRoutes } from '@/lib/routes';
import { BlogPost } from '../models/blog-post';
import { CourseUnit } from '../models/course-unit';
import { ReferralProgram } from '../models/referral-program';
import { Tutor } from '../models/tutor';

/**
 * Landing page copy, taken as-is from the design canvas
 * ("Landing (desktop, with invite band and footer)", v0.5).
 * The sample course units, tutors and blog posts are illustrations from the
 * design; swap them for real data once the API serves it.
 */
export const landingContent = {
  launchUniversity: 'Makerere University',

  hero: {
    title: 'Find the past paper. Understand the answer.',
    lead: 'Notes and past papers for every course unit you are doing this semester, with Magezi, a study buddy that explains them and tutors who passed them.',
    searchPlaceholder: 'Course unit or code, like CSC 2100',
    searchNote: 'Free for students with a university email or student ID.',
    sheet: {
      code: 'CSC 2100',
      sitting: 'Dec 2024',
      paper: 'End of semester exam, Paper 1',
      before: '(a) Insert the keys 50, 30, 70, 20, 40 into an empty ',
      highlight: 'binary search tree',
      after: ' and draw the result.',
      marks: '(6 marks)',
      backLabel: 'Lecture 5',
    },
    magezi:
      '50 goes at the root. 30 is smaller, so it goes left. 70 is bigger, so right. Then 20 and 40 sit under 30.',
  },

  units: {
    title: 'Filed the way your timetable is',
    lead: 'Pick your programme, year and semester once. After that you only see the course units you are actually doing, each with its topics, notes and past papers.',
    cta: 'Find your course units',
    programme: 'BSc Computer Science',
    period: 'Year 2, Semester 1',
    items: [
      new CourseUnit('CSC 2100', 'Data Structures and Algorithms', 18, 6),
      new CourseUnit('CSC 2104', 'Operating Systems', 11, 4),
      new CourseUnit('CSC 2110', 'Database Systems', 14, 5),
      new CourseUnit('CSC 2112', 'Computer Networks', 8, 3),
      new CourseUnit('MTH 2105', 'Probability and Statistics', 9, 7),
    ],
  },

  howItWorks: {
    title: 'How it works',
    steps: [
      {
        title: 'Find your course unit',
        body: 'Browse notes and past papers for free. Previews show you what is inside before you sign up.',
      },
      {
        title: 'Show you are a student',
        body: 'Use your university email for an instant code, or a photo of your student ID.',
      },
      {
        title: 'Study with Magezi',
        body: 'Ask it to explain a page, quiz you before the exam or plan your revision week.',
        link: { label: 'See what Magezi can do', href: '#magezi' },
      },
    ],
  },

  magezi: {
    sticker: 'Meet Magezi',
    title: 'Study with Magezi',
    lead: 'Magezi has read the notes and past papers for your course units. Ask it anything, any time, and it shows you where the answer came from.',
    footnote:
      'Magezi switches on once you verify as a student or lecturer. Every feature comes with a free taste before you pay.',
    explain: {
      title: 'Explain a page',
      body: 'Highlight a passage or a past-paper question. Magezi explains it with an everyday example and shows the page it used.',
      plan: 'Free, a few every day',
    },
    quiz: {
      title: 'Quiz you before the exam',
      body: "Ten questions from this week's topics and past papers, marked at once, with the right answer explained.",
      plan: 'Free to try, unlimited on Pro',
    },
    roadmap: {
      title: 'Plan your revision week',
      body: 'Give it your exam dates. Magezi builds a day-by-day road map and re-plans when you fall behind.',
      plan: 'Try free, then Pro',
      heading: 'Road map to CSC 2100 exam, Mon 8 Dec',
      days: [
        { day: 'Mon', topic: 'Trees and BSTs', done: true },
        { day: 'Tue', topic: 'Graphs and BFS', today: true },
        { day: 'Wed', topic: 'Past paper, Dec 2024' },
        { day: 'Thu', topic: 'Hashing' },
        { day: 'Fri', topic: 'Mock exam with Magezi' },
      ],
    },
  },

  research: {
    sticker: 'For finals and projects',
    title: 'Deep research with Magezi',
    lead: 'From topic to reference list. Magezi searches journals, yours and the web, keeps every source in your own library and helps you plan, read and write.',
    integrity:
      'Every claim links to its source, and Magezi marks what it drafted. You rewrite it in your own words and stay within your university’s rules.',
    cta: 'Start a research project',
    compare: 'Compare Free and paid plans',
    library: {
      kind: 'Final-year project',
      title: 'Mobile Money use among market traders in Kampala',
      meta: '14 sources · 9 notes · APA 7th edition',
      sources: [
        {
          type: 'Journal article',
          title: 'Mobile money and the growth of small traders',
          authors: 'Namuli, J. and Okot, P. (2023)',
          status: 'Summary ready',
          tone: 'daily',
        },
        {
          type: "Master's thesis",
          title: 'Cash, credit and trust in a Kampala market',
          authors: 'Kato, R. (2021)',
          status: '12 highlights',
          tone: 'note',
        },
        {
          type: 'Policy report',
          title: 'Digital payments in Uganda, a 2024 review',
          authors: 'Ouma, D. (2024)',
          status: 'To read',
          tone: 'paper',
        },
      ],
      citation: '(Namuli and Okot, 2023)',
      tip: 'two of your sources disagree on transfer fees. Compare page 7 of Namuli and page 31 of Kato.',
    },
    features: [
      {
        icon: 'search',
        title: 'Find sources',
        plan: 'pro',
        body: 'Searches journals, theses and the web for your topic, then ranks what is worth reading.',
      },
      {
        icon: 'bookmark',
        title: 'Save and organise',
        plan: 'free',
        body: 'One tap saves a source to your library. Sort it into projects with tags, highlights and notes.',
      },
      {
        icon: 'quote',
        title: 'Cite in any style',
        plan: 'free',
        body: 'APA, Harvard, MLA, IEEE and more. In-text citations and a reference list that updates itself.',
      },
      {
        icon: 'book',
        title: 'Read for you',
        plan: 'pro',
        body: 'Summaries, key findings and quotes with page numbers, so you know what to read in full.',
      },
      {
        icon: 'map',
        title: 'Plan your project',
        plan: 'pro',
        body: 'Topic ideas, research questions, a proposal outline and feedback on your methods.',
      },
      {
        icon: 'pen',
        title: 'Draft and review',
        plan: 'pro',
        body: 'A first draft of a section from your saved sources for you to rewrite, and a chapter review before you submit.',
      },
    ],
  },

  tutors: {
    title: 'Still stuck? Book someone who passed it.',
    lead: 'Senior students with an A in the course unit, and lecturers who tutor. Sessions are by video, and you agree the time and fee with your tutor directly.',
    cta: 'See tutors for your units',
    items: [
      new Tutor(
        'Brian Okello',
        'Year 4 Computer Science, A in CSC 2100',
        4.9,
        'Results slip checked',
        'sun',
      ),
      new Tutor('Dr. Atim Grace', 'Lecturer, School of Computing', 4.8, 'Staff verified', 'daily'),
      new Tutor(
        'Kato Joseph',
        'External tutor, BSc Computer Science',
        4.7,
        'ID and degree checked',
        'note',
      ),
    ],
  },

  campus: {
    title: 'Campus, explained by students',
    lead: 'Fees, hostels, food and the offices you will need. Written by students, checked by our moderators.',
    cta: 'Read the campus blog',
    posts: [
      new BlogPost('Fees', 'Paying for a retake, step by step', 'Namusoke Joan', 5),
      new BlogPost(
        'Hostels',
        'Hostels near campus under UGX 400,000 a semester',
        'Ssemakula Paul',
        7,
      ),
      new BlogPost('Food', 'Lunch under UGX 5,000 near Wandegeya', 'Achieng Faith', 4),
    ],
  },

  faq: {
    title: 'Questions',
    items: [
      {
        q: 'Is it free?',
        a: 'Browsing and reading online are free for verified students. Premium adds offline reading inside the app, lifts the daily Magezi limit and lets you create group quizzes.',
      },
      {
        // TODO(content): answer not on the design boards yet; confirm wording.
        q: 'Who uploads the notes?',
        a: 'Students, lecturers and tutors. Every note and past paper is filed under its university, course, year, semester and course unit, and our moderators check uploads.',
      },
      {
        // TODO(content): answer not on the design boards yet; confirm wording.
        q: 'Can I read without data?',
        a: 'Reading online needs data. With Pro you can save notes and past papers in the app and read them offline.',
      },
      {
        // TODO(content): answer not on the design boards yet; confirm wording.
        q: 'Is my university on Campus Hand?',
        a: 'We are starting with Makerere University and adding more universities soon.',
      },
    ],
  },

  invite: {
    program: new ReferralProgram(),
    title: 'Bring your whole class',
    lead: 'Share Campus Hand in your class WhatsApp group. Every 5 coursemates who join and verify as a student or lecturer gives you a week of Pro, free. They get 2 days of Pro too.',
    ownLink: 'Have an account? Get your own invite link',
    chat: {
      group: 'CSC Year 2 class group',
      members: 'Brian, Joan, Ivan and 84 others',
      previewTitle: 'Campus Hand: CSC 2100 past papers and notes',
      previewNote: 'Free for verified students',
      message: 'Guys, the Dec 2024 paper with worked answers is on here.',
      time: '9:41',
      replies: [
        { who: 'Okello Brian', text: 'This is the one we needed. Joining now.', tone: 'red' },
        { who: 'Namuli Joan', text: 'Joined and verified, thanks Sarah!', tone: 'link' },
      ],
    },
    qr: {
      title: 'Scan to open on your phone',
      body: 'Show it in a lecture or pin it on a notice board.',
    },
    steps: [
      { title: 'Share your link', body: 'In your class group, by SMS, a QR code or on TikTok' },
      {
        title: 'They join and verify',
        body: 'As a student or lecturer. They get 2 days of Pro free',
      },
      {
        title: 'Every 5 = 1 free week of Pro',
        body: 'Reach 20 for a month of Pro and the Class builder badge',
      },
    ],
  },

  footer: {
    description:
      'Notes, past papers, tutors and Magezi for every course unit you are doing this semester.',
    groups: [
      {
        title: 'Study',
        links: [
          { label: 'Course units', href: SiteRoutes.courseUnits },
          { label: 'Past papers', href: SiteRoutes.pastPapers },
          { label: 'Notes', href: SiteRoutes.notes },
          { label: 'Ask Magezi', href: SiteRoutes.magezi },
          { label: 'Research help', href: SiteRoutes.research },
        ],
      },
      {
        title: 'Get help',
        links: [
          { label: 'Find a tutor', href: SiteRoutes.tutors },
          { label: 'Campus blog', href: SiteRoutes.blog },
          { label: 'Help centre', href: SiteRoutes.help },
          { label: 'Contact Us', href: SiteRoutes.help },
        ],
      },
      {
        title: 'Give back',
        links: [
          { label: 'Upload notes', href: SiteRoutes.upload },
          { label: 'Become a tutor', href: SiteRoutes.becomeTutor },
          { label: 'For lecturers', href: SiteRoutes.lecturers },
          { label: 'Invite friends', href: SiteRoutes.invite },
        ],
      },
      {
        title: 'Campus Hand',
        links: [
          { label: 'About us', href: SiteRoutes.about },
          { label: 'Pro plans', href: SiteRoutes.pro },
          { label: 'Universities', href: SiteRoutes.universities },
          { label: 'Report a problem', href: SiteRoutes.report },
        ],
      },
    ],
    legal: [
      { label: 'Terms & Conditions', href: SiteRoutes.terms },
      { label: 'Privacy Policy', href: SiteRoutes.privacy },
    ],
    payments: 'Pay with Mobile Money, card, Chipper Cash or bank',
    rightsNotice: 'All rights reserved.',
  },
} as const;

export type LandingContent = typeof landingContent;
