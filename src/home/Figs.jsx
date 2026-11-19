import Num from '../shared/Num.jsx';

/** The three big numbers: games, teams and players on right now. */
export default function Figs({ world }) {
  return (
    <div className="figs" aria-live="polite">
      <div className="fig"><Num value={world.games} rise=".12em" /><span>games on</span></div>
      <div className="fig"><Num value={world.teams} rise=".12em" /><span>teams playing around the world</span></div>
      <div className="fig"><Num value={world.players} rise=".12em" /><span>players playing around the world</span></div>
    </div>
  );
}

/** The smaller running totals that sit under the big numbers. */
export function Totals({ world, showing }) {
  return (
    <p className="totals">
      <span><b>6</b> countries with a game on</span>
      <span><Num value={world.today.toLocaleString('en-GB')} /> players so far today</span>
      <span><Num value={world.goals} /> goals today</span>
      {showing != null && <span>Showing <b>{showing}</b> of the games on now</span>}
    </p>
  );
}

/** Home team, score, away team, each side marked with a dot in its colour. */
export function Scoreline({ g }) {
  return (
    <p className="scoreline">
      <span className="side a">{g.a}</span>
      <b>{g.s[0]}–{g.s[1]}</b>
      <span className="side b">{g.b}</span>
    </p>
  );
}
