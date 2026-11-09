import { describe, expect, it, vi } from 'vitest';
import {
  type DeviceScheme,
  type PreferenceStorage,
  THEME_STORAGE_KEY,
  ThemeStore,
} from './theme-store';
import { themeBootScript } from './theme-script';

class MemoryStorage implements PreferenceStorage {
  readonly data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

class FakeDevice implements DeviceScheme {
  private listener: (() => void) | null = null;
  constructor(public matches: boolean) {}
  addEventListener(_: 'change', listener: () => void) {
    this.listener = listener;
  }
  removeEventListener() {
    this.listener = null;
  }
  flip(matches: boolean) {
    this.matches = matches;
    this.listener?.();
  }
}

function setup(stored: string | null = null, deviceNight = false) {
  const storage = new MemoryStorage();
  if (stored) storage.setItem(THEME_STORAGE_KEY, stored);
  const device = new FakeDevice(deviceNight);
  const target = { setAttribute: vi.fn() };
  const store = new ThemeStore(storage, device, target);
  return { storage, device, target, store };
}

describe('ThemeStore', () => {
  it('defaults to Auto and follows the device', () => {
    const { store } = setup(null, true);
    expect(store.getPreference()).toBe('auto');
    expect(store.getResolved()).toBe('night');
  });

  it('ignores unknown stored values', () => {
    expect(ThemeStore.parse('purple')).toBe('auto');
    expect(ThemeStore.parse(undefined)).toBe('auto');
  });

  it('remembers a picked theme and turns Auto off', () => {
    const { store, storage, target } = setup(null, false);
    store.setNight(true);
    expect(store.getPreference()).toBe('night');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('night');
    expect(target.setAttribute).toHaveBeenCalledWith('data-theme', 'night');
  });

  it('forgets the stored choice when going back to Auto', () => {
    const { store, storage } = setup('day');
    store.setPreference('auto');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('reacts to device changes only in Auto', () => {
    const { store, device } = setup(null, false);
    const listener = vi.fn();
    store.subscribe(listener);
    device.flip(true);
    expect(store.getSnapshot()).toBe('auto:night');
    expect(listener).toHaveBeenCalledTimes(1);

    store.setPreference('day');
    device.flip(false);
    device.flip(true);
    expect(store.getResolved()).toBe('day');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('keeps working when storage throws', () => {
    const broken: PreferenceStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    const store = new ThemeStore(broken, null, null);
    expect(store.getPreference()).toBe('auto');
    expect(() => store.setNight(true)).not.toThrow();
    expect(store.getResolved()).toBe('night');
  });

  it('unsubscribes and disposes cleanly', () => {
    const { store } = setup();
    const listener = vi.fn();
    const off = store.subscribe(listener);
    off();
    store.setNight(true);
    expect(listener).not.toHaveBeenCalled();
    store.dispose();
  });
});

describe('themeBootScript', () => {
  it('sets night before paint when the stored choice is night', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'night');
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    new Function(themeBootScript)();
    expect(document.documentElement.getAttribute('data-theme')).toBe('night');
    expect(document.documentElement.getAttribute('data-theme-pref')).toBe('night');
    localStorage.clear();
  });
});
