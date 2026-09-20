"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./Page.module.css";

// Ported from the `enableDrag()` IIFE in
// references/modelos/barbearia-tnt/index.html: lets desktop users drag the
// horizontal team/gallery strips with the mouse (touch already scrolls
// natively). Only reacts to mouse pointers, exactly like the original —
// touch/pen pointers fall through to native scrolling.
export function DragScroll({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ isDown: false, startX: 0, scrollStart: 0 });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    state.current.isDown = true;
    el.classList.add(styles.dragging);
    state.current.startX = event.clientX;
    state.current.scrollStart = el.scrollLeft;
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!state.current.isDown) return;
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = state.current.scrollStart - (event.clientX - state.current.startX);
  }

  function stopDrag() {
    state.current.isDown = false;
    ref.current?.classList.remove(styles.dragging);
  }

  return (
    <div
      ref={ref}
      className={`${styles.scrollRow} ${className ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onPointerLeave={stopDrag}
    >
      {children}
    </div>
  );
}
