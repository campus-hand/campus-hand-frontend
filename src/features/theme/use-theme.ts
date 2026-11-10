'use client';

import { useSyncExternalStore } from 'react';
import { ThemeStore } from './theme-store';

const serverStore = {
  subscribe: () => () => {},
  getSnapshot: () => 'auto:day',
};

/** Reads the shared ThemeStore; on the server it reports day until hydration. */
export function useTheme() {
  const store = typeof window === 'undefined' ? null : ThemeStore.forBrowser();
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? serverStore.subscribe,
    store?.getSnapshot ?? serverStore.getSnapshot,
    serverStore.getSnapshot,
  );
  const [, resolved] = snapshot.split(':');
  return { store, isNight: resolved === 'night' };
}
