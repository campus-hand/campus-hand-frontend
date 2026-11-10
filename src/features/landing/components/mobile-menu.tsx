'use client';

import { Dialog } from '@base-ui/react/dialog';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { SiteRoutes } from '@/lib/routes';
import { siteNavLinks } from '../content/site-nav';
import { CloseIcon, MenuIcon } from '../icons/menu-icon';

/**
 * Phone-only hamburger menu: a green drawer that slides in from the right
 * with the main links, Log in and Sign up free. Base UI's Dialog handles the
 * focus trap, Escape, scroll lock and returning focus to the button.
 */
export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={['btn btn-line menu-trigger', className].filter(Boolean).join(' ')}
        aria-label="Open menu"
      >
        <MenuIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="menu-backdrop" />
        <Dialog.Popup className="menu-drawer">
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="display text-[22px] tracking-[0.04em] opacity-80">
              Menu
            </Dialog.Title>
            <Dialog.Close className="btn btn-line menu-close" aria-label="Close menu">
              <CloseIcon />
            </Dialog.Close>
          </div>

          <nav aria-label="Main" className="mt-8 flex flex-col">
            {siteNavLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={close}
                className="menu-link display"
                style={{ '--i': index } as CSSProperties}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="menu-link mt-auto flex flex-col gap-3 pt-8"
            style={{ '--i': siteNavLinks.length } as CSSProperties}
          >
            <Link href={SiteRoutes.login} onClick={close} className="btn btn-line w-full">
              Log in
            </Link>
            <Link href={SiteRoutes.signup} onClick={close} className="btn btn-sun w-full">
              Sign up free
            </Link>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
