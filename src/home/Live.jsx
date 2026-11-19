import { useState } from 'react';
import Pitch from '../shared/Pitch.jsx';
import Flag from '../shared/Flag.jsx';
import Num from '../shared/Num.jsx';
import { useMatch } from '../shared/match.js';
import { useInterval } from '../shared/util.js';
import { GAMES } from './data.js';
import { whereIs } from './pitches.js';
import Figs, { Totals } from './Figs.jsx';

const clockNow = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function Arrow({ back }) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" style={back ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M2 8h19M14.5 2 21 8l-6.5 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Live tab: world totals on top, then one game at a time with its score written on the pitch. */
export default function Live({ matches, world }) {
  const [clock, setClock] = useState(clockNow);
  const [at, setAt] = useState(0);
  useInterval(() => setClock(clockNow()), 10000);
  const g = GAMES[at];
  const snap = useMatch(matches[at]);
  const step = (by) => setAt((at + by + GAMES.length) % GAMES.length);

  return (
    <section className="live panel">
      <div className="wrap">
        <header className="head live-head">
          <h2 className="display h2"><Flag className="flagmark" />Playing right now</h2>
          <div className="clock" aria-label="Your local time">{clock}</div>
        </header>
        <Figs world={world} />
        <Totals world={world} showing={GAMES.length} />
        <article className="game" aria-label={`${g.a} ${g.s[0]}, ${g.b} ${g.s[1]}, at ${g.site}`}>
          <div className="g-head">
            <div><h3>{g.site}</h3><p>{whereIs(g)}, {g.n}-a-side</p></div>
            <div className="count"><Num value={snap.count} rise=".15em" /><span>players</span></div>
          </div>
          <div className="duel">
            {/* The key makes each game's pitch a new drawing, so its lines are chalked in again. */}
            <Pitch key={g.id} match={matches[at]} players={false} label={`The pitch at ${g.site}, seen from above`} />
            <b className="goals a" aria-hidden="true">{g.s[0]}</b>
            <b className="goals b" aria-hidden="true">{g.s[1]}</b>
          </div>
          <p className="sides"><span className="side a">{g.a}</span><span aria-hidden="true">–</span><span className="side b">{g.b}</span></p>
          <div className="pager">
            <button type="button" className="btn btn-line arrow" aria-label="Previous game" onClick={() => step(-1)}><Arrow back /></button>
            <span role="status">Game {at + 1} of {GAMES.length}</span>
            <button type="button" className="btn btn-line arrow" aria-label="Next game" onClick={() => step(1)}><Arrow /></button>
          </div>
        </article>
      </div>
    </section>
  );
}
