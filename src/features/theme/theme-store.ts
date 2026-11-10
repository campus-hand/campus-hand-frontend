/** What the person picked: follow the device, or a fixed look. */
export type ThemePreference = 'auto' | 'day' | 'night';
/** What is actually on screen. */
export type ResolvedTheme = 'day' | 'night';

export const THEME_STORAGE_KEY = 'ch-theme';
export const NIGHT_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/** The small slice of Storage the store needs (lets tests pass a fake). */
export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The small slice of MediaQueryList the store needs. */
export interface DeviceScheme {
  readonly matches: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

/** Where the resolved theme is written (the <html> element in the browser). */
export interface ThemeTarget {
  setAttribute(name: string, value: string): void;
}

type Listener = () => void;

/**
 * Owns the Auto / Day / Night appearance setting.
 *
 * - Auto follows the phone or laptop setting and is the default.
 * - Flipping the switch picks Day or Night and turns Auto off.
 * - The choice is remembered on this device only.
 *
 * Built as a tiny external store so React can read it with useSyncExternalStore.
 */
export class ThemeStore {
  private preference: ThemePreference;
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly storage: PreferenceStorage | null,
    private readonly device: DeviceScheme | null,
    private readonly target: ThemeTarget | null,
  ) {
    this.preference = ThemeStore.parse(this.safeRead());
    this.device?.addEventListener('change', this.handleDeviceChange);
  }

  static parse(value: string | null | undefined): ThemePreference {
    return value === 'day' || value === 'night' ? value : 'auto';
  }

  getPreference(): ThemePreference {
    return this.preference;
  }

  getResolved(): ResolvedTheme {
    if (this.preference !== 'auto') return this.preference;
    return this.device?.matches ? 'night' : 'day';
  }

  /** Stable string snapshot for useSyncExternalStore. */
  getSnapshot = (): string => `${this.preference}:${this.getResolved()}`;

  setPreference(next: ThemePreference): void {
    this.preference = next;
    this.safeWrite(next);
    this.apply();
    this.emit();
  }

  /**
   * The day/night switch. Picking the opposite of the device setting is
   * remembered; switching back to match the device returns to Auto, so the
   * site follows the system again (there is no separate Auto button).
   */
  setNight(isNight: boolean): void {
    const wanted: ResolvedTheme = isNight ? 'night' : 'day';
    const device: ResolvedTheme | null = this.device
      ? this.device.matches
        ? 'night'
        : 'day'
      : null;
    this.setPreference(wanted === device ? 'auto' : wanted);
  }

  /** Writes data-theme / data-theme-pref on the target element. */
  apply(): void {
    this.target?.setAttribute('data-theme', this.getResolved());
    this.target?.setAttribute('data-theme-pref', this.preference);
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  dispose(): void {
    this.device?.removeEventListener('change', this.handleDeviceChange);
    this.listeners.clear();
  }

  private readonly handleDeviceChange = (): void => {
    if (this.preference !== 'auto') return;
    this.apply();
    this.emit();
  };

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  private safeRead(): string | null {
    try {
      return this.storage?.getItem(THEME_STORAGE_KEY) ?? null;
    } catch {
      return null; // private mode or blocked storage: fall back to Auto
    }
  }

  private safeWrite(value: ThemePreference): void {
    try {
      if (value === 'auto') this.storage?.removeItem(THEME_STORAGE_KEY);
      else this.storage?.setItem(THEME_STORAGE_KEY, value);
    } catch {
      // Storage unavailable: the choice lasts for this visit only.
    }
  }

  /** One shared store per browser tab. */
  private static instance: ThemeStore | null = null;

  static forBrowser(): ThemeStore {
    if (!ThemeStore.instance) {
      let storage: PreferenceStorage | null = null;
      try {
        storage = window.localStorage;
      } catch {
        storage = null;
      }
      ThemeStore.instance = new ThemeStore(
        storage,
        window.matchMedia(NIGHT_MEDIA_QUERY),
        document.documentElement,
      );
    }
    return ThemeStore.instance;
  }
}
