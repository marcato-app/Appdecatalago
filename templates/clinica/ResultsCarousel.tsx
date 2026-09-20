"use client";

import { useEffect, useRef } from "react";
import type { BlockItemDto } from "@/lib/blocks";
import styles from "./Page.module.css";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const AUTO_DELAY = 1800;
const RESUME_DELAY = 6000;

// Ported from the mural carousel IIFE in
// references/modelos/clinica-giullia-bandeira/index.html: scroll-snap track
// with prev/next arrows, dots, mouse-drag (touch scrolls natively), and
// autoplay that starts once the carousel is mostly on screen (via
// IntersectionObserver) and pauses for a bit after any manual interaction.
// Kept imperative/DOM-driven like the original instead of mirroring it in
// React state — there's nothing here a re-render needs to know about.
export function ResultsCarousel({ results }: { results: BlockItemDto[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slides = Array.from(track.querySelectorAll<HTMLElement>(`.${styles.result}`));
    const dots = Array.from(track.parentElement?.querySelectorAll<HTMLElement>(`.${styles.muralDot}`) ?? []);
    const prevBtn = track.parentElement?.querySelector<HTMLElement>(`.${styles.muralArrow}[data-dir="prev"]`);
    const nextBtn = track.parentElement?.querySelector<HTMLElement>(`.${styles.muralArrow}[data-dir="next"]`);
    if (slides.length === 0) return;

    function slideWidth(): number {
      return slides[0].getBoundingClientRect().width + 14;
    }

    function currentIndex(): number {
      return Math.round(track!.scrollLeft / slideWidth());
    }

    function goTo(i: number): void {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      track!.scrollTo({ left: clamped * slideWidth(), behavior: "smooth" });
    }

    function goToLoop(i: number): void {
      if (i >= slides.length) i = 0;
      if (i < 0) i = slides.length - 1;
      goTo(i);
    }

    function updateDots(): void {
      const i = currentIndex();
      dots.forEach((dot, idx) => dot.classList.toggle(styles.active, idx === i));
    }

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    function onScroll() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDots, 80);
    }
    track.addEventListener("scroll", onScroll);

    let autoTimer: ReturnType<typeof setInterval> | null = null;
    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => goToLoop(currentIndex() + 1), AUTO_DELAY);
    }
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    function pauseAutoAwhile() {
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, RESUME_DELAY);
    }

    function onPrev() {
      goTo(currentIndex() - 1);
      pauseAutoAwhile();
    }
    function onNext() {
      goTo(currentIndex() + 1);
      pauseAutoAwhile();
    }
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    const onDotClick = (idx: number) => () => {
      goTo(idx);
      pauseAutoAwhile();
    };
    const dotHandlers = dots.map((dot, idx) => {
      const handler = onDotClick(idx);
      dot.addEventListener("click", handler);
      return { dot, handler };
    });

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    function onMouseDown(e: MouseEvent) {
      isDown = true;
      track!.classList.add(styles.dragging);
      startX = e.pageX;
      startScroll = track!.scrollLeft;
      pauseAutoAwhile();
    }
    function onMouseUp() {
      if (!isDown) return;
      isDown = false;
      track!.classList.remove(styles.dragging);
      goTo(currentIndex());
    }
    function onMouseMove(e: MouseEvent) {
      if (!isDown) return;
      e.preventDefault();
      track!.scrollLeft = startScroll - (e.pageX - startX);
    }
    function onTouchStart() {
      pauseAutoAwhile();
    }
    track.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    track.addEventListener("touchstart", onTouchStart, { passive: true });

    const wrap = track.closest(`.${styles.muralWrap}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startAuto();
          else stopAuto();
        });
      },
      { threshold: 0.6 },
    );
    if (wrap) observer.observe(wrap);

    updateDots();

    return () => {
      track.removeEventListener("scroll", onScroll);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      dotHandlers.forEach(({ dot, handler }) => dot.removeEventListener("click", handler));
      track.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      track.removeEventListener("touchstart", onTouchStart);
      observer.disconnect();
      stopAuto();
      clearTimeout(scrollTimer);
      clearTimeout(resumeTimer);
    };
  }, [results]);

  if (results.length === 0) return null;

  return (
    <div className={styles.muralWrap}>
      <div className={styles.mural} ref={trackRef}>
        {results.map((result) => (
          <div key={result.id} className={styles.result}>
            {result.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
              <img src={result.imageUrl} alt={result.title ?? ""} />
            ) : null}
            <div className={styles.resultCap}>
              {result.title ? <b>{result.title}</b> : null} {result.body ? <>— {result.body}</> : null}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.muralNav}>
        <div className={styles.muralArrow} data-dir="prev">
          <ArrowLeftIcon />
        </div>
        <div className={styles.muralDots}>
          {results.map((result, idx) => (
            <div key={result.id} className={`${styles.muralDot} ${idx === 0 ? styles.active : ""}`} />
          ))}
        </div>
        <div className={styles.muralArrow} data-dir="next">
          <ArrowRightIcon />
        </div>
      </div>
    </div>
  );
}
