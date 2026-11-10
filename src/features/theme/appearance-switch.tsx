'use client';

import { useTheme } from './use-theme';

/**
 * Appearance control from the design: the sun-to-moon switch. The site
 * follows the device setting until the switch is used (see ThemeStore.setNight).
 */
export function AppearanceSwitch({ label = 'Appearance' }: { label?: string }) {
  const { store, isNight } = useTheme();

  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
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
