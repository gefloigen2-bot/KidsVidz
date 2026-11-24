/** Drawn icons, so they look the same on every device (emoji differ by OS). */
export function PlayIcon({ className = '', color = '#2563EB' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="23" fill="#fff" />
      <path d="M19 14.5v19a1.5 1.5 0 0 0 2.3 1.3l15-9.5a1.5 1.5 0 0 0 0-2.6l-15-9.5A1.5 1.5 0 0 0 19 14.5Z" fill={color} />
    </svg>
  );
}
