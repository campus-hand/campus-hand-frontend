/**
 * Hamburger icon: a small arc (a nod to the mortarboard in the logo) over
 * two bars, the lower one shorter. On hover or focus of the parent button
 * the arc lifts and the short bar grows to full width (see .menu-icon in
 * globals.css).
 */
export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={['menu-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path className="menu-icon-arc" d="M7 8.2Q12 3.6 17 8.2" />
      <path d="M4 12.5h16" />
      <path className="menu-icon-short" d="M6.5 17.5h11" />
    </svg>
  );
}

/** Close (X) icon used on the drawer's close button. */
export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
