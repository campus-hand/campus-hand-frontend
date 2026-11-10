import { SiteRoutes } from '@/lib/routes';

export interface SiteNavLink {
  readonly label: string;
  readonly href: string;
}

/** Main navigation, shared by the desktop header and the phone menu drawer. */
export const siteNavLinks: readonly SiteNavLink[] = [
  { label: 'Course units', href: '#units' },
  { label: 'Tutors', href: '#tutors' },
  { label: 'Campus blog', href: '#campus' },
  { label: 'For lecturers', href: SiteRoutes.lecturers },
];
