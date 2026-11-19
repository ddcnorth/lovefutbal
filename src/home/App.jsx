import './style.css';
import { useEffect, useRef, useState } from 'react';
import Logo from '../shared/Logo.jsx';
import Flag from '../shared/Flag.jsx';
import { createMatch } from '../shared/match.js';
import { rng, still, useInterval } from '../shared/util.js';
import { GAMES } from './data.js';
import Home from './Home.jsx';
import Book from './Book.jsx';
import Live from './Live.jsx';
import Leagues from './Leagues.jsx';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'book', label: 'Book a pitch' },
  { id: 'leagues', label: 'Leagues' },
  // Hidden for now: out of the menu, and #live leads to the front tab. Set hidden to false to bring it back.
  { id: 'live', label: 'Live', hidden: true },
];
const HOME_TITLE = "love.fútbol | Book a pitch, join a league, see who's playing";
const ids = TABS.filter((t) => !t.hidden).map((t) => t.id);
const fromHash = () => {
  const h = decodeURIComponent(window.location.hash.slice(1));
  return ids.includes(h) ? h : 'home';
};
const lr = rng(42);

/**
 * World totals that drift while the page is open: now and then a player joins or
 * leaves one of the games shown, and the counts for the rest of the world move a little.
 */
function useWorld(matches) {
  const [world, setWorld] = useState({ games: 19, other: 151, today: 1284, goals: 312 });
  const [, redraw] = useState(0);
  useEffect(() => {
    const offs = matches.map((m) => m.subscribe(() => redraw((x) => x + 1)));
    return () => offs.forEach((off) => off());
  }, [matches]);
  useInterval(
    () => {
      matches[(lr() * matches.length) | 0].toggle();
      const drift = ((lr() * 5) | 0) - 2;
      const arrived = lr() < 0.5 ? 1 + ((lr() * 3) | 0) : 0;
      const gameChange = lr() < 0.1 ? (lr() < 0.5 ? -1 : 1) : 0;
      const goal = lr() < 0.15 ? 1 : 0;
      setWorld((w) => {
        const games = Math.max(16, Math.min(23, w.games + gameChange));
        const other = Math.max(120, Math.min(190, w.other + drift)) + (games - w.games) * 10;
        return { ...w, games, other, today: w.today + arrived, goals: w.goals + goal };
      });
    },
    still ? null : 2400,
  );
  const onPitch = matches.reduce((sum, m) => sum + m.get().count, 0);
  return { ...world, teams: world.games * 2, players: onPitch + world.other };
}

/** The front page: one shared shell, one tab at a time, one look throughout. */
export default function App() {
  const [tab, setTab] = useState(fromHash);
  const [matches] = useState(() => GAMES.map((g, i) => createMatch({ n: g.n, seed: i ? i * 13 + 5 : 7, score: g.s })));
  const world = useWorld(matches);
  const shell = useRef(null);

  // Things that stay put while the page scrolls (the Book tab's pinned search and booking sheet)
  // stop just below this header (and the optional prototype bar), and the front tab sizes itself to the room
  // left between the header and the foot, so both need the header's and the foot's heights.
  useEffect(() => {
    const el = shell.current;
    const parts = { '--bar-h': el.querySelector('.bar'), '--foot-h': el.querySelector('.foot') };
    const measure = () => Object.entries(parts).forEach(([name, part]) => el.style.setProperty(name, `${part.getBoundingClientRect().height}px`));
    const ro = new ResizeObserver(measure);
    Object.values(parts).forEach((part) => ro.observe(part, { box: 'border-box' }));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    document.title = tab === 'home' ? HOME_TITLE : `${TABS.find((t) => t.id === tab).label} | love.fútbol`;
  }, [tab]);

  const go = (id) => (e) => {
    e.preventDefault();
    history.pushState(null, '', id === 'home' ? window.location.pathname : `#${id}`);
    setTab(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="shell" ref={shell}>
      <header className="bar">
        <div className="wrap">
          <a className="logo" href="#home" onClick={go('home')} aria-label="love.fútbol home"><Logo /></a>
          <nav className="tabs" aria-label="Sections">
            {TABS.filter((t) => t.id !== 'home' && !t.hidden).map((t) => (
              <a key={t.id} href={`#${t.id}`} aria-current={tab === t.id ? 'page' : undefined} onClick={go(t.id)}>
                <span>{t.label}</span><Flag className="flagmark" />
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main id="view">
        {tab === 'home' && <Home match={matches[0]} game={GAMES[0]} world={world} go={go} />}
        {tab === 'book' && <Book />}
        {tab === 'leagues' && <Leagues />}
        {tab === 'live' && <Live matches={matches} world={world} />}
      </main>
      <footer className="foot">
        <div className="wrap">
          <span className="logo"><Logo /></span>
          <p>This is a sample website made for the development of love.fútbol. Games, teams, hours and numbers are examples.</p>
        </div>
      </footer>
    </div>
  );
}
