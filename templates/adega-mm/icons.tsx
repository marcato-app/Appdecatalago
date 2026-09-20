// Inline SVGs ported 1:1 from references/modelos/adega-mm/index.html and
// cardapio.html — kept as plain <svg> (not an icon library) to match the
// originals exactly, stroke widths included.

export function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="2.75" width="15" height="18.5" rx="2" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.65-1.22A9 9 0 1 0 12 3Z" />
      <path
        d="M8.5 8.2c.2-.45.4-.46.6-.47.16 0 .35 0 .5.02.16.02.38-.06.6.46.22.53.75 1.84.82 1.98.07.13.11.29.02.47-.09.18-.14.29-.27.44-.13.16-.28.35-.4.47-.13.13-.27.27-.12.53.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.21 2.16 1.35.27.13.42.11.58-.07.16-.18.68-.8.86-1.07.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.13.45.2.51.31.07.13.07.71-.16 1.4-.24.68-1.38 1.3-1.9 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.96-.31-1.66-.6-2.92-1.26-4.83-4.2-4.98-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10.5c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10.2" r="2.9" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9Z" />
    </svg>
  );
}

export function StoreLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
    </svg>
  );
}
