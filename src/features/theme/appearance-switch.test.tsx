import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppearanceSwitch } from './appearance-switch';
import { THEME_STORAGE_KEY } from './theme-store';

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe('AppearanceSwitch', () => {
  it('has no Auto button, only the night mode switch', () => {
    render(<AppearanceSwitch />);
    expect(screen.queryByRole('button', { name: 'Auto' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Night mode' })).toBeInTheDocument();
  });

  it('follows a day device, switches to night, then back to following the device', async () => {
    const user = userEvent.setup();
    render(<AppearanceSwitch />);

    const night = screen.getByRole('switch', { name: 'Night mode' });
    expect(night).not.toBeChecked();

    await user.click(night);
    expect(night).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('night');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('night');

    await user.click(night);
    expect(night).not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('day');
    expect(document.documentElement.dataset.themePref).toBe('auto');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
