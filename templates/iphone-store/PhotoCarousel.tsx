"use client";

import { useRef, useState } from "react";
import styles from "./PhotoCarousel.module.css";

// Simple swipeable photo carousel (native scroll-snap, no autoplay — a
// buyer inspecting product photos shouldn't have them cycle on their own).
// Dots stay in sync via a scroll listener; no drag-to-scroll wiring needed
// since touch devices already scroll natively and this is only ever used
// for product photos, not clickable content that would fight a mouse-drag.
export function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(index);
  }

  if (images.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.slide}>
          <span className={styles.placeholder}>sem foto</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className={styles.slide}>
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded via R2, not a next/image-optimized asset */}
            <img src={url} alt={`${alt} ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <div className={styles.dots}>
          {images.map((url, index) => (
            <span key={url} className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
