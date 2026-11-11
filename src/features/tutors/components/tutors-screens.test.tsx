import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PREVIEW_TUTORS, PreviewTutorSource } from '../models/preview-tutor-source';
import type { TutorSource } from '../models/tutors';
import { BookingPanel } from './booking-panel';
import { TutorProfileScreen } from './tutor-profile-screen';
import { TutorsScreen } from './tutors-screen';

// Wednesday 11 November 2026, 12:00 in Kampala.
const NOW = Date.parse('2026-11-11T09:00:00Z');
const [brian] = PREVIEW_TUTORS;
const units = [
  { code: 'CSC 2100', title: 'Data Structures and Algorithms' },
  { code: 'CSC 2104', title: 'Operating Systems' },
];

describe('BookingPanel', () => {
  it('needs a time, then sends the request and says who to pay', async () => {
    const user = userEvent.setup();
    render(
      <BookingPanel
        tutor={brian}
        unitCode="CSC 2100"
        nowMs={NOW}
        layout="panel"
        source={new PreviewTutorSource(0)}
      />,
    );
    // Wednesday: Brian has no times, so Thursday is chosen and Wednesday is off.
    expect(
      screen.getByRole('radio', { name: /Wednesday 11 November, no free times/ }),
    ).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Thursday 12 November' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Send request' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: '2:00 pm, taken' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: '2 hours' }));
    await user.click(screen.getByRole('radio', { name: '6:00 pm' }));
    expect(screen.getByText('Thu 12 Nov, 6:00 pm')).toBeInTheDocument();
    expect(screen.getByText('2 hours by video, UGX 30,000')).toBeInTheDocument();

    // Changing the day clears the time.
    await user.click(screen.getByRole('radio', { name: 'Friday 13 November' }));
    expect(screen.getByText('Pick a time')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '3:00 pm' }));
    await user.click(screen.getByRole('button', { name: 'Send request' }));

    const sent = await screen.findByRole('status');
    expect(within(sent).getByRole('heading', { name: 'Request sent' })).toBeInTheDocument();
    expect(sent).toHaveTextContent('Fri 13 Nov, 3:00 pm');
    expect(sent).toHaveTextContent("You pay Brian directly. Campus Hand doesn't take payment");
    await user.click(screen.getByRole('button', { name: 'Request another time' }));
    expect(screen.getByRole('button', { name: 'Send request' })).toBeInTheDocument();
  });

  it('says so when the request fails', async () => {
    const user = userEvent.setup();
    const failing: TutorSource = {
      list: async () => [],
      find: async () => null,
      requestBooking: async () => ({ ok: false }),
    };
    render(<BookingPanel tutor={brian} unitCode="" nowMs={NOW} layout="page" source={failing} />);
    expect(screen.getByText(/You pay Brian directly/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '3:00 pm' }));
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("didn't go through");
  });
});

describe('TutorsScreen', () => {
  it('filters tutors and books the chosen one on desktop', async () => {
    const user = userEvent.setup();
    render(
      <TutorsScreen tutors={PREVIEW_TUTORS} units={units} initialUnitCode="CSC 2100" nowMs={NOW} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      '3 tutors for Data Structures and Algorithms',
    );
    expect(screen.getByRole('heading', { name: 'Request Brian' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Lecturers' }));
    expect(screen.getByRole('button', { name: 'Lecturers' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 tutor for Data Structures');
    expect(screen.getByRole('heading', { name: 'Request Atim' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Under UGX 20,000' }));
    expect(screen.getByText('No tutors match yet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lecturers' }));
    await user.click(screen.getByRole('button', { name: 'Under UGX 20,000' }));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Course unit' }), 'CSC 2104');
    expect(screen.getByRole('status')).toHaveTextContent('1 tutor for Operating Systems');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Course unit' }), '');
    expect(screen.getByRole('status')).toHaveTextContent('3 tutors for your course units');

    await user.click(screen.getByRole('button', { name: 'Request a session with Kato Joseph' }));
    expect(screen.getByRole('heading', { name: 'Request Kato' })).toBeInTheDocument();
    expect(screen.getByText('Free today from 2:00 pm')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Apply to tutor' })).toHaveAttribute(
      'href',
      '/tutors/apply',
    );
  });

  it('can show only tutors free today', async () => {
    const user = userEvent.setup();
    render(<TutorsScreen tutors={PREVIEW_TUTORS} units={units} initialUnitCode="" nowMs={NOW} />);
    await user.click(screen.getByRole('button', { name: 'Free today' }));
    // On this Wednesday only Kato has times left.
    expect(screen.getByRole('status')).toHaveTextContent('1 tutor for your course units');
    expect(screen.getByRole('heading', { level: 2, name: 'Kato Joseph' })).toBeInTheDocument();
  });
});

describe('TutorProfileScreen', () => {
  it('shows how the tutor was checked and their grades', () => {
    render(<TutorProfileScreen tutor={brian} unitCode="CSC 2100" nowMs={NOW} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Brian Okello' })).toBeInTheDocument();
    expect(screen.getByText('Results slip checked')).toBeInTheDocument();
    expect(screen.getByText('A in CSC 1202')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to tutors' })).toHaveAttribute(
      'href',
      '/tutors?code=CSC%202100',
    );
  });
});
