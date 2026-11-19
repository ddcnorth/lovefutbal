import { useLayoutEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import './switcher.css';

const LINKS = [
  { to: '/', label: 'New front page', end: true },
  { to: '/options', label: 'All options' },
  { to: '/pitch', label: 'The pitch' },
  { to: '/world-clock', label: 'World clock' },
  { to: '/live-board', label: 'Live board' },
  { to: '/site', label: 'Full site' },
];

/** Thin bar above every page for jumping between the prototypes. */
export default function Switcher() {
  const bar = useRef(null);
  useLayoutEffect(() => {
    const style = document.documentElement.style;
    const previous = style.getPropertyValue('--prototype-bar-height');
    const measure = () => style.setProperty('--prototype-bar-height', `${bar.current.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar.current, { box: 'border-box' });
    return () => {
      observer.disconnect();
      if (previous) style.setProperty('--prototype-bar-height', previous);
      else style.removeProperty('--prototype-bar-height');
    };
  }, []);

  return (
    <nav id="lf-switch" ref={bar} aria-label="Prototypes">
      <span className="lf-label">Prototypes</span>
      <ul>
        {LINKS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}>{label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
