"use client";

import { useEffect } from "react";

/** Enables `scroll-behavior: smooth` on <html> for anchor-link navigation
 * (nav pills, "voltar ao topo", scroll-snap carousels) while this page is
 * mounted, and restores whatever was there before on unmount. A pure DOM
 * side effect — no React state involved — so this is a plain useEffect, not
 * the useSyncExternalStore dance lib/cart.ts and WelcomeSplash.tsx need for
 * state that has to agree with what was server-rendered. */
export function useSmoothScroll(): void {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = previous;
    };
  }, []);
}
