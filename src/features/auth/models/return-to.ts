import { SiteRoutes } from '@/lib/routes';

const BASE = 'https://campushand.invalid';

/** Auth screens are never a destination after signing in. */
const AUTH_PATHS = [SiteRoutes.signup, SiteRoutes.login, SiteRoutes.forgotPassword];

/**
 * Where to send someone after they sign up or log in: the note or page that
 * asked them to. Only paths on this site are allowed, so a link like
 * /login?returnTo=https://evil.example cannot send students elsewhere.
 */
export class ReturnTo {
  static readonly PARAM = 'returnTo';

  static sanitise(value: string | null | undefined): string {
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
      return SiteRoutes.home;
    }
    let url: URL;
    try {
      url = new URL(value, BASE);
    } catch {
      return SiteRoutes.home;
    }
    if (url.origin !== BASE) return SiteRoutes.home;
    if (AUTH_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) {
      return SiteRoutes.home;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }

  /** Reads ?returnTo= from a location.search string. */
  static fromSearch(search: string): string {
    return ReturnTo.sanitise(new URLSearchParams(search).get(ReturnTo.PARAM));
  }

  /** Adds ?returnTo= to an auth link, leaving it off when it would just go home. */
  static append(path: string, returnTo: string): string {
    const safe = ReturnTo.sanitise(returnTo);
    if (safe === SiteRoutes.home) return path;
    return `${path}?${ReturnTo.PARAM}=${encodeURIComponent(safe)}`;
  }
}
