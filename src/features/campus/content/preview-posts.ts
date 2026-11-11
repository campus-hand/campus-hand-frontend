import { CampusPost } from '../models/campus-post';

/**
 * TODO(content): sample posts from the design canvas, until students write real
 * ones and moderators check them. The bodies are general advice, not official
 * rules; real posts link to the official source they were checked against.
 */
export const previewPosts: readonly CampusPost[] = [
  new CampusPost(
    'paying-for-a-retake',
    'Fees',
    'Paying for a retake, step by step',
    'I failed one paper in Year 1 and spent a week going between offices. Here is the route that takes a day: the reference, where to pay, and who has to sign.',
    { name: 'Namusoke Joan', line: 'Year 3 Law' },
    5,
    '2026-11-10',
    [
      {
        kind: 'p',
        text: 'Retakes feel worse than they are. The paperwork is the hard part, and most of it is about doing things in the right order.',
      },
      { kind: 'h', text: 'The route that takes a day' },
      {
        kind: 'steps',
        items: [
          'Check your results on the student portal and note the course unit code you need to retake.',
          'Ask your faculty or school registrar for the retake form, and get the payment reference printed on it.',
          'Pay at the bank or by mobile money using that reference only. Keep the receipt.',
          'Take the receipt and the form back to the registrar to be signed and stamped.',
          'Check the portal a few days later to see the course unit registered for this semester.',
        ],
      },
      {
        kind: 'tip',
        text: 'Pay with the reference on your form, not your student number alone. Payments without the reference can take weeks to trace.',
      },
      { kind: 'h', text: 'If something goes wrong' },
      {
        kind: 'p',
        text: 'If the course unit does not show after a week, take your receipt to the registrar first, not the bursar. They can see both sides.',
      },
    ],
    'the official fees guide',
  ),
  new CampusPost(
    'hostels-under-400k',
    'Hostels',
    'Hostels near campus under UGX 400,000 a semester',
    'What you get at this price, what to check before you pay, and the questions to ask the custodian.',
    { name: 'Ssemakula Paul', line: 'Year 2 Civil Engineering' },
    7,
    '2026-11-08',
    [
      {
        kind: 'p',
        text: 'At this price you are usually sharing a room. That is fine if you check a few things first.',
      },
      { kind: 'h', text: 'Before you pay' },
      {
        kind: 'steps',
        items: [
          'Visit in the evening: check the water, the lights and how noisy it gets.',
          'Ask whether power and water are in the price or shared separately.',
          'Get a written receipt with the room number and the semester dates.',
          'Ask what happens to your money if you leave early.',
        ],
      },
      {
        kind: 'tip',
        text: 'Never pay a deposit to someone who cannot show you the room.',
      },
    ],
  ),
  new CampusPost(
    'lunch-under-5000',
    'Food',
    'Lunch under UGX 5,000 near Wandegeya',
    'Where students eat well without spending the week’s money by Wednesday.',
    { name: 'Achieng Faith', line: 'Year 2 Nursing' },
    4,
    '2026-11-06',
    [
      {
        kind: 'p',
        text: 'Most places near campus serve a plate of food with beans or greens for less than you think, especially before the lunch rush.',
      },
      { kind: 'h', text: 'How to make it last' },
      {
        kind: 'steps',
        items: [
          'Eat before 12:30, when portions are bigger and queues shorter.',
          'Share a big plate with a friend and add a side.',
          'Carry water instead of buying soda every day.',
        ],
      },
    ],
  ),
  new CampusPost(
    'your-first-week',
    'Freshers',
    'Your first week: the offices to visit and in what order',
    'Registration, your student ID, the library and the health centre, without queueing twice.',
    { name: 'Mugisha Ivan', line: 'Year 2 Computer Science' },
    6,
    '2026-11-04',
    [
      {
        kind: 'p',
        text: 'The first week is mostly queues. Do them in this order and each one gives you what the next one asks for.',
      },
      {
        kind: 'steps',
        items: [
          'Pay or confirm your fees, and keep the receipt.',
          'Register for your course units on the student portal.',
          'Get your student ID; take the receipt and a passport photo.',
          'Register at the library with your ID.',
          'Find the health centre before you need it.',
        ],
      },
    ],
  ),
  new CampusPost(
    'year-2-electives-computer-science',
    'Courses',
    'Which Year 2 electives are worth it in Computer Science',
    'What each elective asks of you, and how students who took them felt at the end.',
    { name: 'Kato Joseph', line: 'Year 3 Computer Science' },
    8,
    '2026-11-02',
    [
      {
        kind: 'p',
        text: 'Pick electives for what you want to do after, not for the lecturer with the easiest reputation. Here is what each one asked of us.',
      },
      {
        kind: 'tip',
        text: 'Read the course outline before choosing. Your department can share it if it is not on the portal.',
      },
    ],
  ),
  new CampusPost(
    'guild-elections-how-voting-works',
    'Events',
    'Guild elections: how voting works this year',
    'Who can vote, what to bring, and where to find the results.',
    { name: 'Akello Brenda', line: 'Year 3 Political Science' },
    3,
    '2026-10-30',
    [
      {
        kind: 'p',
        text: 'Every registered student can vote. Bring your student ID; you cannot vote without it.',
      },
    ],
  ),
  new CampusPost(
    'tuition-in-instalments',
    'Fees',
    'Paying tuition in instalments without a fine',
    'How instalments work, the dates that matter, and what to do if you will miss one.',
    { name: 'Okot Denis', line: 'Year 4 Economics' },
    5,
    '2026-10-28',
    [
      {
        kind: 'p',
        text: 'Most universities let you pay in parts if you pay the first part on time. Missing a date is what brings the fine.',
      },
      {
        kind: 'tip',
        text: 'If you will miss a date, speak to the bursar before it, not after. It is much easier to agree a plan early.',
      },
    ],
    'the official fees guide',
  ),
];
