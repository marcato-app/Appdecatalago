"use client";

import { useEffect, useSyncExternalStore } from "react";
import styles from "./Cardapio.module.css";

// Ported from the `welcome()` IIFE in
// references/modelos/adega-mm/assets/js/script.js: shows once per browser
// session (sessionStorage, namespaced per store — the original used one
// fixed key since it was a single-store static site), skips entirely under
// prefers-reduced-motion, and can be dismissed early by a click.
//
// Implemented as a tiny external store (useSyncExternalStore), same
// approach as lib/cart.ts and for the same reason: whether to show the
// splash depends on sessionStorage/matchMedia, neither available during
// SSR, so the decision can only be made once code is actually running in
// the browser. Deciding it inside `subscribe` (called by React itself,
// not synchronously in an effect body) — rather than a `useEffect` that
// calls setState directly — avoids the extra cascading render that pattern
// causes.
type Phase = "hidden" | "visible" | "leaving";

const phases = new Map<string, Phase>();
const listeners = new Map<string, Set<() => void>>();

function notify(storeId: string): void {
  listeners.get(storeId)?.forEach((callback) => callback());
}

function decideInitialPhase(storeId: string): Phase {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try {
    seen = sessionStorage.getItem(`welcome:${storeId}`) === "1";
  } catch {
    // storage disabled — fall through as "not seen", just don't persist it
  }

  if (reduced || seen) return "hidden";

  try {
    sessionStorage.setItem(`welcome:${storeId}`, "1");
  } catch {
    // ignore
  }
  return "visible";
}

function subscribe(storeId: string, callback: () => void): () => void {
  if (!listeners.has(storeId)) listeners.set(storeId, new Set());
  listeners.get(storeId)!.add(callback);

  if (!phases.has(storeId)) {
    phases.set(storeId, decideInitialPhase(storeId));
    notify(storeId);
  }

  return () => listeners.get(storeId)?.delete(callback);
}

function getSnapshot(storeId: string): Phase {
  return phases.get(storeId) ?? "hidden";
}

function getServerSnapshot(): Phase {
  return "hidden";
}

function dismiss(storeId: string): void {
  if (phases.get(storeId) !== "visible") return;
  phases.set(storeId, "leaving");
  notify(storeId);
}

function finishDismiss(storeId: string): void {
  phases.set(storeId, "hidden");
  notify(storeId);
}

export function WelcomeSplash({ storeId, storeName, logoUrl }: { storeId: string; storeName: string; logoUrl: string | null }) {
  const phase = useSyncExternalStore(
    (callback) => subscribe(storeId, callback),
    () => getSnapshot(storeId),
    getServerSnapshot,
  );

  useEffect(() => {
    if (phase === "visible") {
      document.body.classList.add("welcoming");
      const timer = setTimeout(() => dismiss(storeId), 2150);
      return () => clearTimeout(timer);
    }
    if (phase === "leaving") {
      document.body.classList.remove("welcoming");
      const timer = setTimeout(() => finishDismiss(storeId), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, storeId]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`${styles.welcome} ${phase === "leaving" ? styles.gone : ""}`}
      onClick={() => dismiss(storeId)}
      aria-hidden="true"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
        <img src={logoUrl} alt="" className={styles.welcomeMark} />
      ) : null}
      <h2>{storeName}</h2>
      <p>Bem-vindo</p>
    </div>
  );
}
