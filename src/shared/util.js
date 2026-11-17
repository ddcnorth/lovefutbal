import { useEffect, useRef } from 'react';

/** True when the visitor asked for reduced motion. */
export const still =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Small seeded generator so sample data repeats between visits. */
export function rng(s) {
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/** setInterval that always calls the latest callback; pass ms = null to pause. */
export function useInterval(fn, ms) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  });
  useEffect(() => {
    if (ms == null) return undefined;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}
