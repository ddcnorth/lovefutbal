import { useLayoutEffect, useRef } from 'react';
import { still } from './util.js';

/**
 * Slides list rows from their old place to their new one when the order changes.
 * Returns ref(id) to attach to each row. Uses offsetTop so page scroll does not matter.
 */
export default function useFlip(deps, { duration = 500, easing = 'cubic-bezier(.2,.8,.2,1)', movingClass } = {}) {
  const nodes = useRef(new Map());
  const tops = useRef(new Map());
  useLayoutEffect(() => {
    nodes.current.forEach((el, id) => {
      const was = tops.current.get(id);
      const now = el.offsetTop;
      tops.current.set(id, now);
      if (was == null || was === now || still) return;
      if (movingClass) el.classList.add(movingClass);
      const a = el.animate([{ transform: `translateY(${was - now}px)` }, { transform: 'none' }], { duration, easing });
      if (movingClass) a.onfinish = () => el.classList.remove(movingClass);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (id) => (el) => {
    if (el) nodes.current.set(id, el);
    else nodes.current.delete(id);
  };
}
