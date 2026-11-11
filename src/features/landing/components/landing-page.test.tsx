import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  it('renders every section from the design in order', () => {
    render(<LandingPage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Filed the way your timetable is',
      'How it works',
      'Study with Magezi',
      'Deep research with Magezi',
      'Still stuck? Book someone who passed it.',
      'Campus, explained by students',
      'Questions',
      'Bring your whole class',
    ]);
    // Removed on purpose (11 Nov 2026): they repeated sections above and made the phone page too long.
    expect(screen.queryByText('Your semester starts here')).not.toBeInTheDocument();
    expect(screen.queryByText('Invite your coursemates')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Find the past paper. Understand the answer.',
      }),
    ).toBeInTheDocument();
  });

  it('lists course units with their resource counts', () => {
    render(<LandingPage />);
    expect(screen.getByText('Data Structures and Algorithms')).toBeInTheDocument();
    expect(screen.getByText('18 notes, 6 papers')).toBeInTheDocument();
  });

  it('shows tutors with initials and ratings', () => {
    render(<LandingPage />);
    expect(screen.getByText('AG')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
  });

  it('builds WhatsApp share links for the invite band', () => {
    render(<LandingPage />);
    const links = screen.getAllByRole('link', { name: /share on whatsapp/i });
    expect(links).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'SMS' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^sms:/),
    );
    for (const link of links)
      expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\//));
  });

  it('copies the invite link', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<LandingPage />);
    const [copy] = screen.getAllByRole('button', { name: /copy link/i });
    await user.click(copy!);
    expect(writeText).toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: /link copied/i })).toBeInTheDocument();
  });

  it('has labelled follow links and a footer appearance control', () => {
    render(<LandingPage />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Campus Hand on TikTok' })).toBeInTheDocument();
    expect(within(footer).getByRole('switch', { name: 'Night mode' })).toBeInTheDocument();
  });
});
