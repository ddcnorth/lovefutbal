import { NavLink } from 'react-router';
import './switcher.css';

const LINKS = [
  { to: '/', label: 'All options', end: true },
  { to: '/pitch', label: 'The pitch' },
  { to: '/world-clock', label: 'World clock' },
  { to: '/live-board', label: 'Live board' },
  { to: '/site', label: 'Full site' },
];

/** Thin bar above every page for jumping between the prototypes. */
export default function Switcher() {
  return (
    <nav id="lf-switch" aria-label="Prototypes">
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
