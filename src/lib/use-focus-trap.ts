"use client";

import { useEffect, useRef } from "react";

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null);
}

/**
 * Keeps Tab focus cycling inside `containerRef` while `active` is true, and
 * restores focus to whatever element had it beforehand once deactivated —
 * the two pieces every modal/drawer in this app (lightbox, confirm dialog,
 * mobile nav) was missing. `autoFocusFirst: false` skips stealing focus on
 * activation for dialogs that already place it themselves (e.g. a button
 * with `autoFocus`).
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  options: { autoFocusFirst?: boolean } = {},
) {
  const { autoFocusFirst = true } = options;
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    if (autoFocusFirst && !container.contains(document.activeElement)) {
      const first = getFocusable(container)[0];
      (first ?? container).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = getFocusable(container);
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
