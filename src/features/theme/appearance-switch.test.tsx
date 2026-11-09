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
  it('starts on Auto and switches to night, then back to Auto', async () => {
    const user = userEvent.setup();
    render(<AppearanceSwitch />);

    const auto = screen.getByRole('button', { name: 'Auto' });
    const night = screen.getByRole('switch', { name: 'Night mode' });
    expect(auto).toHaveAttribute('aria-pressed', 'true');
    expect(night).not.toBeChecked();

    await user.click(night);
    expect(night).toBeChecked();
    expect(auto).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.dataset.theme).toBe('night');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('night');

    await user.click(auto);
    expect(auto).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('day');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
