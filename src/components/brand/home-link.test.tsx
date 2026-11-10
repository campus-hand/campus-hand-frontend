import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Logo } from './logo';

describe('Logo home link', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('links to the landing page', () => {
    render(<Logo />);
    expect(screen.getByRole('link', { name: 'Campus Hand home' })).toHaveAttribute('href', '/');
  });

  it('scrolls back to the top and drops the #section when clicked on the landing page', () => {
    window.history.replaceState(null, '', '/#magezi');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Logo />);
    const link = screen.getByRole('link', { name: 'Campus Hand home' });
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(window.location.hash).toBe('');
  });

  it('leaves modified clicks (new tab) to the browser', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Logo />);
    fireEvent.click(screen.getByRole('link', { name: 'Campus Hand home' }), { ctrlKey: true });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('navigates normally from other pages', () => {
    window.history.replaceState(null, '', '/tutors');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Logo />);
    fireEvent.click(screen.getByRole('link', { name: 'Campus Hand home' }));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
