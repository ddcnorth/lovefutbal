import { useEffect, useRef, useState } from 'react';
import Logo from '../shared/Logo.jsx';
import Num from '../shared/Num.jsx';
import Pitch from '../shared/Pitch.jsx';
import { createMatch, useMatch } from '../shared/match.js';
import { rng, still, useInterval } from '../shared/util.js';

// Sample games for the public display.
const GAMES = [
  { site: 'Campo da Várzea', city: 'Recife, Brazil', a: 'Várzea Unidos', b: 'Leões do Capibaribe', n: 5, s: [2, 1] },
  { site: 'Cancha La Esperanza', city: 'Mexico City, Mexico', a: 'Barrio Norte', b: 'Las Águilas', n: 7, s: [0, 0] },
  { site: 'Cancha El Mirador', city: 'Bogotá, Colombia', a: 'Mirador FC', b: 'Los Vecinos', n: 5, s: [3, 3] },
  { site: 'Cancha Villa Nueva', city: 'Guatemala City, Guatemala', a: 'Villa Nueva', b: 'Santa Fe', n: 6, s: [1, 0] },
  { site: 'Potrero San Martín', city: 'Buenos Aires, Argentina', a: 'Los Pibes', b: 'Club Unión', n: 5, s: [4, 2] },
  { site: 'Eastside Community Pitch', city: 'Houston, United States', a: 'Eastside United', b: 'Third Ward FC', n: 7, s: [1, 1] },
];
const lr = rng(42);
const clockNow = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** One game panel: name, headcount, the pitch, and the score. Flashes clay on a goal. */
function Game({ g, match, delay, onGoal }) {
  const snap = useMatch(match);
  const ref = useRef(null);
  useEffect(
    () =>
      match.onGoal(() => {
        onGoal();
        const el = ref.current;
        if (!el) return;
        el.classList.remove('flash');
        void el.offsetWidth; // restart the animation
        el.classList.add('flash');
      }),
    [match, onGoal],
  );
  return (
    <article className="game" ref={ref}>
      <header>
        <div><h2>{g.site}</h2><p>{g.city}</p></div>
        <div className="head"><Num value={snap.count} /><span>players</span></div>
      </header>
      <div className="p"><Pitch match={match} delay={delay} label={`${g.a} against ${g.b}, seen from above`} /></div>
      <div className="line"><span>{g.a}</span><b>{snap.score[0]}–{snap.score[1]}</b><span>{g.b}</span></div>
    </article>
  );
}

function useTotalCount(matches) {
  const [, force] = useState(0);
  useEffect(() => {
    const offs = matches.map((m) => m.subscribe(() => force((x) => x + 1)));
    return () => offs.forEach((off) => off());
  }, [matches]);
  return matches.reduce((a, m) => a + m.get().count, 0);
}

export default function App() {
  const [matches] = useState(() => GAMES.map((g, i) => createMatch({ n: g.n, seed: i * 13 + 5, score: g.s })));
  const [world, setWorld] = useState({ games: 19, other: 151, today: 1284, goals: 312 });
  const [clock, setClock] = useState(clockNow);
  const [onGoal] = useState(() => () => setWorld((w) => ({ ...w, goals: w.goals + 1 })));
  const onPitch = useTotalCount(matches);

  useInterval(() => setClock(clockNow()), 10000);
  useInterval(
    () => {
      matches[(lr() * matches.length) | 0].toggle();
      const drift = ((lr() * 5) | 0) - 2;
      const arrived = lr() < 0.5 ? 1 + ((lr() * 3) | 0) : 0;
      const gameChange = lr() < 0.1 ? (lr() < 0.5 ? -1 : 1) : 0;
      setWorld((w) => {
        const games = Math.max(16, Math.min(23, w.games + gameChange));
        const other = Math.max(120, Math.min(190, w.other + drift)) + (games - w.games) * 10;
        return { ...w, games, other, today: w.today + arrived };
      });
    },
    still ? null : 2400,
  );

  return (
    <div className="wrap">
      <p className="proto">Design prototype for the public live display. Sites, teams and counts are sample data.</p>
      <div className="top">
        <div className="logo"><Logo /></div>
        <h1><span className="livedot" />Playing right now</h1>
        <div className="clock num" aria-label="Your local time">{clock}</div>
      </div>
      <div className="figs" aria-live="polite">
        <div className="fig"><Num value={world.games} /><span>games on</span></div>
        <div className="fig"><Num value={world.games * 2} /><span>teams playing around the world</span></div>
        <div className="fig"><Num value={onPitch + world.other} /><span>players playing around the world</span></div>
      </div>
      <div className="totals">
        <span><b>6</b> countries with a game on</span>
        <span><Num value={world.today.toLocaleString('en-GB')} /> players so far today</span>
        <span><Num value={world.goals} /> goals today</span>
        <span>Showing <b>{GAMES.length}</b> of the games on now</span>
      </div>
      <div className="games">
        {GAMES.map((g, i) => (
          <Game key={g.site} g={g} match={matches[i]} delay={900 + i * 170} onGoal={onGoal} />
        ))}
      </div>
    </div>
  );
}
