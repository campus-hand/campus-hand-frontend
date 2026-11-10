import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { siteNavLinks } from '../content/site-nav';
import { MobileMenu } from './mobile-menu';

async function openMenu() {
  const user = userEvent.setup();
  render(<MobileMenu />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  const dialog = await screen.findByRole('dialog', { name: 'Menu' });
  return { user, dialog };
}

describe('MobileMenu', () => {
  it('starts closed', () => {
    render(<MobileMenu />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a drawer with every main link, Log in and Sign up free', async () => {
    const { dialog } = await openMenu();
    for (const link of siteNavLinks) {
      expect(within(dialog).getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.href,
      );
    }
    expect(within(dialog).getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(within(dialog).getByRole('link', { name: 'Sign up free' })).toHaveAttribute(
      'href',
      '/signup',
    );
  });

  it('closes with the close button', async () => {
    const { user, dialog } = await openMenu();
    await user.click(within(dialog).getByRole('button', { name: 'Close menu' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes with Escape', async () => {
    const { user } = await openMenu();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes when a link is chosen', async () => {
    const { user, dialog } = await openMenu();
    await user.click(within(dialog).getByRole('link', { name: 'Tutors' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
