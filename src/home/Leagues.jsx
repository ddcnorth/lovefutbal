import { useMemo, useState } from 'react';
import useFlip from '../shared/useFlip.js';
import { still, useInterval } from '../shared/util.js';
import Flag from '../shared/Flag.jsx';
import { TEAMS, SF_PAIRS, newSeason, playNext, table, winner } from '../pitch/league.js';
import { GAMES } from './data.js';

function Tie({ rows, label }) {
  return (
    <div className="tie">
      {rows.map((r, i) => (
        <div key={i} className={r.tbd ? 'tbd' : r.w ? 'w' : ''}>
          <span>{r.name}</span><span className="num">{r.s ?? ''}</span>
        </div>
      ))}
      <small>{label}</small>
    </div>
  );
}
const matchRows = (m) => [
  { name: TEAMS[m.a], s: m.s?.[0], w: m.s && m.s[0] > m.s[1] },
  { name: TEAMS[m.b], s: m.s?.[1], w: m.s && m.s[1] > m.s[0] },
];

function Standings({ rows }) {
  const flip = useFlip([rows]);
  return (
    <tbody>
      {rows.map((t, k) => {
        const gd = t.gf - t.ga;
        return (
          <tr key={t.i} className={k === 3 ? 'cut' : ''} ref={flip(t.i)}>
            <td>{k + 1}</td><td>{t.name}</td><td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
            <td>{gd > 0 ? '+' : ''}{gd}</td><td>{t.pts}</td>
          </tr>
        );
      })}
    </tbody>
  );
}

/** Leagues tab: a sample league you can play through, result by result. */
export default function Leagues() {
  const [L, setL] = useState(() => newSeason(1));
  const T = useMemo(() => table(L), [L]);
  const leagueLeft = L.queue.filter((q) => q.type === 'league').length;
  const w1 = winner(L.sf[0]);
  const w2 = winner(L.sf[1]);

  const semi = (k) => {
    const m = L.sf[k] || (leagueLeft ? null : { a: T[SF_PAIRS[k][0]].i, b: T[SF_PAIRS[k][1]].i });
    if (m) return <Tie key={k} rows={matchRows(m)} label={`Semi-final ${k + 1}`} />;
    return <Tie key={k} rows={[{ name: k ? '2nd place' : '1st place', tbd: true }, { name: k ? '3rd place' : '4th place', tbd: true }]} label={`Semi-final ${k + 1}`} />;
  };
  const final = L.fin ? (
    <Tie rows={matchRows(L.fin)} label="Final" />
  ) : (
    <Tie rows={[w1 == null ? { name: 'Winner of semi-final 1', tbd: true } : { name: TEAMS[w1] }, w2 == null ? { name: 'Winner of semi-final 2', tbd: true } : { name: TEAMS[w2] }]} label="Final" />
  );

  const q = L.queue[0];
  // A result comes in every second on its own. The finished table stays up a little longer before a new season starts.
  const [playing, setPlaying] = useState(!still);
  useInterval(() => setL(playNext(L)), playing ? (q ? 1000 : 4000) : null);
  let next = <><b>Season finished</b><span>A new set of fixtures is drawn up next.</span></>;
  if (q) {
    let a; let b;
    if (q.type === 'league') { a = q.a; b = q.b; }
    else if (q.type === 'sf') { a = T[SF_PAIRS[q.k][0]].i; b = T[SF_PAIRS[q.k][1]].i; }
    else { a = w1; b = w2; }
    const kind = q.type === 'league' ? 'League match' : q.type === 'sf' ? `Semi-final ${q.k + 1}` : 'Final';
    next = <><b>{TEAMS[a]} v {TEAMS[b]}</b><span>{kind}. {q.when}, {GAMES[0].site}.</span></>;
  }
  const recent = L.log.slice(-3).reverse();

  return (
    <section className="leagues panel">
      <div className="wrap">
        <header className="head">
          <h2 className="display h2">Join a league</h2>
        </header>
        <div className="board">
          <div className="block">
            <h3>Liga Comunitária de {GAMES[0].site}</h3>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th><span className="sr">Position</span></th><th>Team</th>
                    <th><abbr title="Played">P</abbr></th><th><abbr title="Won">W</abbr></th><th><abbr title="Drawn">D</abbr></th>
                    <th><abbr title="Lost">L</abbr></th><th><abbr title="Goal difference">GD</abbr></th><th><abbr title="Points">Pts</abbr></th>
                  </tr>
                </thead>
                <Standings rows={T} />
              </table>
            </div>
            <p className="cut-note">Top four go to the knockout</p>
            {recent.length > 0 && (
              <>
                <h4 className="sub">Latest results</h4>
                <ul className="recent">{recent.map((x) => <li key={x}>{x}</li>)}</ul>
              </>
            )}
          </div>
          <div className="aside">
            <div className="block">
              <h3>Next up</h3>
              <p className="next" aria-live="polite">{next}</p>
              <div className="cta">
                <button className="btn" aria-pressed={!playing} onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Resume'}</button>
                {!playing && <button className="btn btn-line" onClick={() => setL(playNext(L))}>{q ? 'Record the next result' : 'Start a new season'}</button>}
              </div>
            </div>
            <div className="swatch">
              <h3>Knockout</h3>
              <div className="bracket">
                <div className="b-col">{semi(0)}{semi(1)}</div>
                <div className="join" aria-hidden="true" />
                <div className="b-col">{final}</div>
              </div>
              <p className="champ" aria-live="polite">{L.fin && <><Flag className="flagmark" pole="#1D1D1B" />{TEAMS[winner(L.fin)]} are champions.</>}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
