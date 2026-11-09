/** Magezi's robot mark (same icon as the Ask tab in the app). */
export function MageziIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="7" width="16" height="13" rx="4.5" />
      <path d="M12 7V4.6M2.5 12.5V15M21.5 12.5V15" />
      <circle cx="12" cy="3.6" r="1.1" fill="currentColor" stroke="none" />
      <path
        fill="currentColor"
        stroke="none"
        fillRule="evenodd"
        d="M9.8 10.2h4.4a3.1 3.1 0 0 1 0 6.2H9.8a3.1 3.1 0 0 1 0-6.2zM10.3 11.9a1 1.4 0 1 0 0 2.8a1 1.4 0 1 0 0-2.8zM13.7 11.9a1 1.4 0 1 0 0 2.8a1 1.4 0 1 0 0-2.8z"
      />
    </svg>
  );
}
