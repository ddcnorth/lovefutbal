import { useState } from 'react';
import Pitch from '../shared/Pitch.jsx';
import Flag from '../shared/Flag.jsx';
import Num from '../shared/Num.jsx';
import { useMatch } from '../shared/match.js';
import { useInterval } from '../shared/util.js';
import { GAMES } from './data.js';
import { whereIs } from './pitches.js';
import Figs, { Scoreline, Totals } from './Figs.jsx';

const clockNow = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function Game({ g, match }) {
  const snap = useMatch(match);
  return (
    <li className="game">
      <div className="g-head">
        <div><h3>{g.site}</h3><p>{whereIs(g)}, {g.n}-a-side</p></div>
        <div className="count"><Num value={snap.count} rise=".15em" /><span>players</span></div>
      </div>
      <Pitch match={match} players={false} label={`The pitch at ${g.site}, seen from above`} />
      <Scoreline g={g} />
    </li>
  );
}

/** Live tab: world totals on top, then every game with its pitch and headcount. */
export default function Live({ matches, world }) {
  const [clock, setClock] = useState(clockNow);
  useInterval(() => setClock(clockNow()), 10000);

  return (
    <section className="live panel">
      <div className="wrap">
        <header className="head live-head">
          <h2 className="display h2"><Flag className="flagmark" />Playing right now</h2>
          <div className="clock" aria-label="Your local time">{clock}</div>
        </header>
        <Figs world={world} />
        <Totals world={world} showing={GAMES.length} />
        <ul className="games">
          {GAMES.map((g, i) => <Game key={g.site} g={g} match={matches[i]} />)}
        </ul>
      </div>
    </section>
  );
}
