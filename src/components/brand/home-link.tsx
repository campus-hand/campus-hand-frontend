'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { SiteRoutes } from '@/lib/routes';

type HomeLinkProps = Omit<ComponentProps<typeof Link>, 'href'>;

/**
 * Link to the landing page. From any other page it navigates home; on the
 * landing page itself (where Next.js would not scroll) it goes back to the top.
 */
export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const plainClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (event.defaultPrevented || !plainClick || window.location.pathname !== SiteRoutes.home) {
      return;
    }
    event.preventDefault();
    window.history.replaceState(null, '', SiteRoutes.home);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <Link href={SiteRoutes.home} onClick={handleClick} {...props} />;
}
