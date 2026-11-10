import { type Clock, systemClock } from './otp-code';

/** The other signed-in device, as the API describes it. */
export interface DeviceSummary {
  /** "Tecno Spark 20, Chrome" */
  name: string;
  /** ISO date-time of the last request from that device. */
  lastActiveAt: string;
  /** Rough place from the IP address, e.g. "Kampala". */
  place?: string;
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** Campus Hand keeps one device signed in at a time; this describes the other one. */
export class DeviceSession {
  private static readonly relative = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

  constructor(
    readonly summary: DeviceSummary,
    private readonly clock: Clock = systemClock,
  ) {}

  /** "Last active 2 hours ago, Kampala" */
  lastActiveLabel(): string {
    const parts = [`Last active ${this.ago()}`];
    if (this.summary.place) parts.push(this.summary.place);
    return parts.join(', ');
  }

  private ago(): string {
    const at = Date.parse(this.summary.lastActiveAt);
    if (Number.isNaN(at)) return 'recently';
    const seconds = Math.max(0, Math.round((this.clock.now() - at) / 1000));
    for (const [unit, size] of UNITS) {
      if (seconds >= size) return DeviceSession.relative.format(-Math.floor(seconds / size), unit);
    }
    return 'just now';
  }
}
