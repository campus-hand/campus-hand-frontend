import type { PreferenceStorage } from '@/features/theme/theme-store';
import type { DeviceSummary } from './device-session';
import type { Identifier } from './contact';

export type CodeChannel = 'email' | 'sms';

/**
 * What one auth screen hands to the next (never the password). Kept in
 * sessionStorage so a refresh keeps the "Check your email" screen working and
 * no email address ends up in the URL or browser history.
 */
export interface AuthFlowState {
  /** Sign-up details, so "Change it" and "Back" refill the form. */
  name?: string;
  email?: string;
  phone?: string;
  /** Log-in or reset: the email or phone the person typed. */
  identifier?: Identifier;
  /** Where the last code went. */
  channel?: CodeChannel;
  /** When the last code was sent (ms), for "Resend in 0:42". */
  codeSentAt?: number;
  /** Set when someone logs in before confirming their email. */
  reason?: 'unverified';
  /** The other signed-in device, for the one-device-at-a-time screen. */
  device?: DeviceSummary;
  maskedEmail?: string;
}

type Listener = () => void;

/** External store (useSyncExternalStore) over sessionStorage. */
export class AuthFlowStore {
  static readonly KEY = 'ch-auth-flow';

  private raw: string | null | undefined;
  private parsed: AuthFlowState | null = null;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly storage: PreferenceStorage | null) {}

  getSnapshot = (): AuthFlowState | null => {
    const raw = this.safeRead();
    if (raw !== this.raw) {
      this.raw = raw;
      this.parsed = AuthFlowStore.parse(raw);
    }
    return this.parsed;
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Replaces the state (start of a new flow). */
  start(state: AuthFlowState): void {
    this.write(state);
  }

  /** Merges into the current state. */
  update(patch: Partial<AuthFlowState>): void {
    this.write({ ...(this.getSnapshot() ?? {}), ...patch });
  }

  clear(): void {
    try {
      this.storage?.removeItem(AuthFlowStore.KEY);
    } catch {
      // Storage blocked: nothing was saved.
    }
    this.memory = null;
    this.emit();
  }

  static parse(raw: string | null): AuthFlowState | null {
    if (!raw) return null;
    try {
      const value: unknown = JSON.parse(raw);
      return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as AuthFlowState)
        : null;
    } catch {
      return null;
    }
  }

  /** Used when sessionStorage is blocked, so the flow still works for this page view. */
  private memory: string | null = null;

  private write(state: AuthFlowState): void {
    const raw = JSON.stringify(state);
    this.memory = raw;
    try {
      this.storage?.setItem(AuthFlowStore.KEY, raw);
    } catch {
      // Private mode or blocked storage: keep it in memory only.
    }
    this.emit();
  }

  private safeRead(): string | null {
    try {
      return this.storage?.getItem(AuthFlowStore.KEY) ?? this.memory;
    } catch {
      return this.memory;
    }
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  private static instance: AuthFlowStore | null = null;

  static forBrowser(): AuthFlowStore {
    if (!AuthFlowStore.instance) {
      let storage: PreferenceStorage | null = null;
      try {
        storage = window.sessionStorage;
      } catch {
        storage = null;
      }
      AuthFlowStore.instance = new AuthFlowStore(storage);
    }
    return AuthFlowStore.instance;
  }
}
