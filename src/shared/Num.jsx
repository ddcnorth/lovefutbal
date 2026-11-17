import { useEffect, useRef } from 'react';
import { still } from './util.js';

/** A number that rolls up into place whenever its value changes. */
export default function Num({ value, as: Tag = 'b', className, rise = '.35em', duration = 350, ...rest }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (still || !ref.current?.animate) return;
    ref.current.animate(
      [{ transform: `translateY(${rise})`, opacity: 0.3 }, { transform: 'none', opacity: 1 }],
      { duration, easing: 'ease-out' },
    );
  }, [value, rise, duration]);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {value}
    </Tag>
  );
}
