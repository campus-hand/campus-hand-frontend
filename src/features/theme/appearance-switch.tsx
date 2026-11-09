'use client';

import { useSyncExternalStore } from 'react';
import { ThemeStore } from './theme-store';

const serverStore = {
  subscribe: () => () => {},
  getSnapshot: () => 'auto:day',
};

function useTheme() {
  const store = typeof window === 'undefined' ? null : ThemeStore.forBrowser();
  const snapshot = useSyncExternalStore(
    store?.subscribe ?? serverStore.subscribe,
    store?.getSnapshot ?? serverStore.getSnapshot,
    serverStore.getSnapshot,
  );
  const [preference, resolved] = snapshot.split(':');
  return { store, isAuto: preference === 'auto', isNight: resolved === 'night' };
}

/**
 * Appearance control from the design: an "Auto" button plus the
 * sun-to-moon switch. Picking day or night turns Auto off.
 */
export function AppearanceSwitch({ label = 'Appearance' }: { label?: string }) {
  const { store, isAuto, isNight } = useTheme();

  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        className="theme-auto"
        aria-pressed={isAuto}
        onClick={() => store?.setPreference('auto')}
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" />
        </svg>
        Auto
      </button>
      <span className="dn" style={{ ['--dn-edge' as string]: '#7C88B5' }}>
        <input
          type="checkbox"
          role="switch"
          aria-label="Night mode"
          checked={isNight}
          onChange={(event) => store?.setNight(event.target.checked)}
        />
        <span className="dn-track" aria-hidden="true">
          <span className="dn-cloud c1" />
          <span className="dn-cloud c2" />
          <span className="dn-star s1" />
          <span className="dn-star s2" />
          <span className="dn-star s3" />
          <span className="dn-star s4" />
          <span className="dn-knob">
            <i />
            <i />
            <i />
          </span>
        </span>
      </span>
    </div>
  );
}
