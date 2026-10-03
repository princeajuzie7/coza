import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * A media query is an external store, so subscribe to it rather than mirroring
 * it into state from an effect. This also gives a correct server snapshot —
 * `false` — so the sidebar renders its desktop shell during SSR and hydrates
 * without a flash.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  );
}
