"use client";

import { useState } from "react";
import styles from "./LinkHub.module.css";

// Fades the Google Maps iframe in once it loads, same as the `is-ready`
// class toggle in references/modelos/adega-mm/index.html's inline script —
// avoids a flash of the raw (uninverted) map before the CSS filter/overlay
// are perceived as ready.
export function MapEmbed({ addressLine }: { addressLine: string }) {
  const [ready, setReady] = useState(false);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(addressLine)}&z=16&output=embed`;

  return (
    <span className={styles.mapFrame}>
      <span className={styles.mapFallback} aria-hidden="true">
        <MapPinIcon />
        <span>Ver no mapa</span>
      </span>
      <iframe
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa da localização"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={() => setReady(true)}
        className={ready ? styles.isReady : undefined}
      />
    </span>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10.5c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10.2" r="2.9" />
    </svg>
  );
}
