'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { SiteRoutes } from '@/lib/routes';
import type { AuthClient, AuthErrorCode, AuthResult } from '../models/auth-client';
import { AuthFlowStore, type AuthFlowState } from '../models/auth-flow-store';
import { createAuthClient } from '../models/create-auth-client';
import { type Clock, ResendCountdown, systemClock } from '../models/otp-code';
import { ReturnTo } from '../models/return-to';

const AuthClientContext = createContext<AuthClient | null>(null);
const FlowStoreContext = createContext<AuthFlowStore | null>(null);

let defaultClient: AuthClient | null = null;

/** Lets tests hand the screens a fake client and an in-memory flow store. */
export function AuthProvider({
  client,
  flowStore,
  children,
}: {
  client?: AuthClient;
  flowStore?: AuthFlowStore;
  children: ReactNode;
}) {
  return (
    <AuthClientContext.Provider value={client ?? null}>
      <FlowStoreContext.Provider value={flowStore ?? null}>{children}</FlowStoreContext.Provider>
    </AuthClientContext.Provider>
  );
}

export function useAuthClient(): AuthClient {
  const injected = useContext(AuthClientContext);
  if (injected) return injected;
  defaultClient ??= createAuthClient();
  return defaultClient;
}

const serverFlow = { subscribe: () => () => {}, getSnapshot: () => undefined };

/**
 * State handed between screens. `undefined` while rendering on the server
 * (not read yet), `null` when there is none on this device.
 */
export function useAuthFlow(): {
  flow: AuthFlowState | null | undefined;
  store: AuthFlowStore | null;
} {
  const injected = useContext(FlowStoreContext);
  const store = injected ?? (typeof window === 'undefined' ? null : AuthFlowStore.forBrowser());
  const flow = useSyncExternalStore<AuthFlowState | null | undefined>(
    store?.subscribe ?? serverFlow.subscribe,
    store?.getSnapshot ?? serverFlow.getSnapshot,
    serverFlow.getSnapshot,
  );
  return { flow, store };
}

const noSubscribe = () => () => {};

/**
 * The page to finish on (?returnTo=). Read from the address bar after
 * hydration so the auth pages stay fully prerendered (no Suspense fallback).
 */
export function useReturnTo(): string {
  return useSyncExternalStore(
    noSubscribe,
    () => ReturnTo.fromSearch(window.location.search),
    () => SiteRoutes.home,
  );
}

/** Seconds left before "Resend" works; ticks once a second. */
export function useResendCountdown(sentAt: number | undefined, clock: Clock = systemClock) {
  const [, tick] = useState(0);
  const countdown = new ResendCountdown(sentAt, clock);
  const waiting = !countdown.canResend();

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, [waiting, sentAt]);

  return countdown;
}

export interface FormError {
  code: AuthErrorCode;
  retryAfterSeconds?: number;
}

/** Runs one request at a time and keeps its error for the screen to show. */
export function useRequest() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);

  /**
   * `holdOnSuccess`: stay busy after success because the screen is about to
   * navigate away (stops a second tap while the next page loads).
   */
  async function run<T>(
    request: () => Promise<AuthResult<T>>,
    { holdOnSuccess = false } = {},
  ): Promise<AuthResult<T>> {
    setPending(true);
    setError(null);
    const result = await request().catch((): AuthResult<T> => ({ ok: false, error: 'unknown' }));
    if (!result.ok) setError({ code: result.error, retryAfterSeconds: result.retryAfterSeconds });
    if (!result.ok || !holdOnSuccess) setPending(false);
    return result;
  }

  return { pending, error, setError, run };
}
