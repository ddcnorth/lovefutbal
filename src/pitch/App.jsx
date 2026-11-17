import { useEffect, useMemo, useState } from 'react';
import useFlip from '../shared/useFlip.js';
import Logo from '../shared/Logo.jsx';
import Flag from '../shared/Flag.jsx';
import Num from '../shared/Num.jsx';
import Pitch from '../shared/Pitch.jsx';
import { createMatch, useMatch } from '../shared/match.js';
import { rng, still, useInterval } from '../shared/util.js';
import { TEAMS, SF_PAIRS, newSeason, playNext, table, winner } from './league.js';

/* ---------- sample live data ---------- */
const START_GAMES = [
  { site: 'Campo da Várzea', city: 'Recife, Brazil', a: 'Várzea Unidos', b: 'Leões do Capibaribe', n: 5, c: 10, s: [2, 1], min: 23 },
  { site: 'Cancha La Esperanza', city: 'Mexico City, Mexico', a: 'Barrio Norte', b: 'Las Águilas', n: 7, c: 14, s: [0, 0], min: 8 },
  { site: 'Cancha El Mirador', city: 'Bogotá, Colombia', a: 'Mirador FC', b: 'Los Vecinos', n: 5, c: 9, s: [3, 3], min: 37 },
  { site: 'Cancha Villa Nueva', city: 'Guatemala City, Guatemala', a: 'Villa Nueva', b: 'Santa Fe', n: 6, c: 12, s: [1, 0], min: 15 },
  { site: 'Potrero San Martín', city: 'Buenos Aires, Argentina', a: 'Los Pibes', b: 'Club Unión', n: 5, c: 11, s: [4, 2], min: 44 },
  { site: 'Eastside Community Pitch', city: 'Houston, United States', a: 'Eastside United', b: 'Third Ward FC', n: 7, c: 13, s: [1, 1], min: 29 },
];
const lr = rng(42);

function Nav() {
  return (
    <header className="nav">
      <div className="wrap">
        <a className="logo" href="#top" aria-label="love.fútbol home"><Logo /></a>
        <nav aria-label="Main">
          <a href="#book">Book a pitch</a>
          <a href="#leagues">Leagues</a>
          <a href="#live">Live</a>
        </nav>
        <a className="btn" href="#book">Book a pitch</a>
      </div>
    </header>
  );
}

function Hero({ match, game }) {
  return (
    <section className="hero">
      <div className="wrap">
        <div>
          <h1>
            <a href="#book">Book a pitch.</a>
            <a href="#leagues">Join a league.</a>
            <a href="#live">See who's playing.</a>
          </h1>
          <p className="lead">
            Community pitches in several countries, open to reserve by the hour. Leagues play on the same ground, and every
            game shows up here while it is being played.
          </p>
          <div className="cta">
            <a className="btn" href="#book">Book a pitch</a>
            <a className="btn line" href="#leagues">Register a team</a>
          </div>
        </div>
        <div className="stage">
          <Pitch match={match} />
          <div className="cap" aria-live="polite">
            <span><span className="livedot" /><strong>{game.site}, {game.city.split(',')[0]}</strong></span>
            <span>{game.a} {game.s[0]}–{game.s[1]} {game.b}</span>
            <span><Num as="strong" className="num" value={game.c} /> players on the pitch</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Live({ games, world, pop }) {
  const players = games.reduce((a, g) => a + g.c, 0) + world.otherPlayers;
  return (
    <section className="live" id="live">
      <div className="wrap">
        <h2>Playing right now</h2>
        <p className="intro">Each game reports its own headcount as people join and leave. The totals add up every game on every pitch.</p>
        <div className="figs">
          <div className="fig"><Num value={games[0].c} /><span>players in the game above</span></div>
          <div className="fig"><Num value={world.games * 2} /><span>teams playing around the world</span></div>
          <div className="fig"><Num value={players} /><span>players playing around the world</span></div>
        </div>
        <div className="totals">
          <span><Num value={world.games} /> games on</span>
          <span><Num value={world.games} /> pitches in use</span>
          <span><Num value={world.countries} /> countries with a game on</span>
          <span><Num value={world.today.toLocaleString('en-GB')} /> players so far today</span>
        </div>
        <ul className="games">
          {games.map((g, i) => (
            <li key={g.site}>
              <div className="where"><b>{g.site}</b><span>{g.city}</span></div>
              <div className="teams">{g.a}<span className="sc">{g.s[0]}–{g.s[1]}</span>{g.b}</div>
              <div className="dots" aria-label={`${g.c} players`}>
                {Array.from({ length: g.n * 2 + 2 }, (_, k) => (
                  <i key={k} className={(k < g.c ? 'on' : '') + (pop === i && k === g.c - 1 ? ' pop' : '')} />
                ))}
                <em>{g.c}</em>
              </div>
              <div className="min">{g.min} min</div>
            </li>
          ))}
        </ul>
        <p className="note">Showing {games.length} of {world.games} games. A filled dot is a player on the pitch.</p>
      </div>
    </section>
  );
}

/* ---------- booking ---------- */
const SITES = {
  Brazil: [
    { name: 'Campo da Várzea, Recife', pitches: 2, league: ['VU', 'LC', 'EM', 'SA', 'BR', 'UT'] },
    { name: 'Quadra do Morro, Rio de Janeiro', pitches: 1 },
  ],
  Mexico: [{ name: 'Cancha La Esperanza, Mexico City', pitches: 3, league: ['BN', 'LA', 'SJ', 'TL'] }],
  Colombia: [{ name: 'Cancha El Mirador, Bogotá', pitches: 2, league: ['MF', 'LV', 'SC', 'BA'] }],
  Guatemala: [{ name: 'Cancha Villa Nueva, Guatemala City', pitches: 1 }],
  Argentina: [{ name: 'Potrero San Martín, Buenos Aires', pitches: 2, league: ['LP', 'CU', 'VL', 'BO'] }],
  'United States': [{ name: 'Eastside Community Pitch, Houston', pitches: 2 }],
};
const COUNTRIES = Object.keys(SITES);
const HOURS = [15, 16, 17, 18, 19, 20, 21];

/** The timetable for one site and day: free hours, bookings and league fixtures, seeded so it stays put. */
function timetable(country, siteIdx, date) {
  const s = SITES[country][siteIdx];
  const r = rng(COUNTRIES.indexOf(country) * 97 + siteIdx * 31 + date.getDate() * 7 + 3);
  const rows = [];
  for (let p = 1; p <= s.pitches; p++) {
    rows.push({
      p,
      slots: HOURS.map((x) => {
        const v = r();
        if (s.league && v < 0.2) {
          const a = s.league[(r() * s.league.length) | 0];
          let b;
          do b = s.league[(r() * s.league.length) | 0];
          while (b === a);
          return { x, kind: 'fix', text: `${a} v ${b}` };
        }
        if (v < (x >= 18 ? 0.6 : 0.38)) return { x, kind: 'taken' };
        return { x, kind: 'free', id: `${p}-${x}` };
      }),
    });
  }
  return rows;
}

function Booking() {
  const days = useMemo(
    () => [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }),
    [],
  );
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [siteIdx, setSiteIdx] = useState(0);
  const [day, setDay] = useState(0);
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const site = SITES[country][siteIdx];
  const rows = useMemo(() => timetable(country, siteIdx, days[day]), [country, siteIdx, day, days]);
  const reset = () => { setPick(null); setDone(false); };

  let summary = <><b>No hour picked yet</b>Tap a free hour in the timetable.</>;
  if (pick) {
    const [p, x] = pick.split('-');
    const d = days[day].toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    summary = (
      <>
        <b>Pitch {p}, {x}:00 to {+x + 1}:00</b>
        {d} at {site.name}.{done && ' Reserved in this prototype. No real booking was made.'}
      </>
    );
  }

  return (
    <section className="book" id="book">
      <div className="wrap">
        <div className="head">
          <h2>Book a pitch</h2>
          <p>Pick a site and a day, then tap a free hour. League fixtures sit on the same timetable, so you always see what the pitch is really doing.</p>
        </div>
        <div className="pick">
          <label>
            Country
            <select value={country} onChange={(e) => { setCountry(e.target.value); setSiteIdx(0); reset(); }}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Site
            <select value={siteIdx} onChange={(e) => { setSiteIdx(+e.target.value); reset(); }}>
              {SITES[country].map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
            </select>
          </label>
        </div>
        <div className="days" role="group" aria-label="Day">
          {days.map((d, i) => (
            <button key={i} type="button" aria-pressed={i === day} onClick={() => { setDay(i); reset(); }}>
              {i ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : 'Today'}
              <b>{d.getDate()}</b>
              {d.toLocaleDateString('en-GB', { month: 'short' })}
            </button>
          ))}
        </div>
        <div className="gridscroll">
          <div className="slots">
            <span />
            {HOURS.map((x) => <span key={x} className="h">{x}:00</span>)}
            {rows.map(({ p, slots }) => [
              <span key={'p' + p} className="p">Pitch {p}</span>,
              ...slots.map((s) => {
                const key = `${p}-${s.x}`;
                if (s.kind === 'fix')
                  return <button key={key} className="slot fix" disabled aria-label={`Pitch ${p}, ${s.x}:00, league fixture ${s.text}`}>{s.text}</button>;
                if (s.kind === 'taken')
                  return <button key={key} className="slot taken" disabled aria-label={`Pitch ${p}, ${s.x}:00, booked`}>Booked</button>;
                const sel = pick === s.id;
                return (
                  <button
                    key={key}
                    className={'slot' + (sel ? ' sel' : '')}
                    aria-pressed={sel}
                    aria-label={`Pitch ${p}, ${s.x}:00, free`}
                    onClick={() => { setPick(sel ? null : s.id); setDone(false); }}
                  >
                    {sel ? 'Picked' : 'Free'}
                  </button>
                );
              }),
            ])}
          </div>
        </div>
        <div className="legend"><span className="f">Free</span><span className="t">Booked</span><span className="l">League fixture</span></div>
        <div className="summary">
          <p aria-live="polite">{summary}</p>
          <button className="btn" disabled={!pick || done} onClick={() => setDone(true)}>
            {done ? 'Reserved' : 'Reserve this hour'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- league ---------- */
function Tie({ rows, label }) {
  return (
    <div className="tie">
      {rows.map((r, i) => (
        <div key={i} className={r.tbd ? 'tbd' : r.w ? 'w' : ''}>
          <span>{r.name}</span>
          <span className="num">{r.s ?? ''}</span>
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

/** Standings with rows that slide to their new place when the order changes. */
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

function League() {
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
    <Tie
      rows={[
        w1 == null ? { name: 'Winner of semi-final 1', tbd: true } : { name: TEAMS[w1] },
        w2 == null ? { name: 'Winner of semi-final 2', tbd: true } : { name: TEAMS[w2] },
      ]}
      label="Final"
    />
  );

  const q = L.queue[0];
  let next = <>Season finished.<span>Reset to draw up a new set of fixtures.</span></>;
  if (q) {
    let a;
    let b;
    if (q.type === 'league') { a = q.a; b = q.b; }
    else if (q.type === 'sf') { a = T[SF_PAIRS[q.k][0]].i; b = T[SF_PAIRS[q.k][1]].i; }
    else { a = w1; b = w2; }
    const kind = q.type === 'league' ? 'League match' : q.type === 'sf' ? `Semi-final ${q.k + 1}` : 'Final';
    next = <>{TEAMS[a]} v {TEAMS[b]}<span>{kind}. {q.when}, Campo da Várzea.</span></>;
  }

  return (
    <section className="league" id="leagues">
      <div className="wrap">
        <h2>Join a league</h2>
        <ol className="steps">
          <li><b>Register your team</b>Add your players and pick a league at your site.</li>
          <li><b>Get your fixtures</b>The season is drawn up and each match is placed on a pitch and an hour.</li>
          <li><b>Play for the table</b>Results update the standings. The top four go into the knockout.</li>
        </ol>
        <div className="board">
          <div>
            <h3>Liga Comunitária da Várzea</h3>
            <div className="tablewrap">
              <table>
                <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
                <Standings rows={T} />
              </table>
            </div>
            <p className="q">Teams above the dashed line qualify for the knockout.</p>
            <div className="next">
              <button className="btn" onClick={() => setL(playNext(L))}>{q ? 'Record the next result' : 'Reset the season'}</button>
              <p aria-live="polite">{next}</p>
            </div>
            <ul className="results">
              {L.log.slice(-3).reverse().map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <h3>Knockout</h3>
            <div className="ko">
              <div className="semis">{semi(0)}{semi(1)}</div>
              <div className="join" />
              {final}
            </div>
            <p className="champ">{L.fin && <><Flag />{TEAMS[winner(L.fin)]} are champions.</>}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [hero] = useState(() => createMatch({ n: 5, seed: 7, score: START_GAMES[0].s }));
  const heroSnap = useMatch(hero);
  const [games, setGames] = useState(START_GAMES);
  const [world, setWorld] = useState({ games: 19, otherPlayers: 151, countries: 6, today: 1284 });
  const [pop, setPop] = useState(null);

  // The first game is the one on the hero pitch, so its headcount and score come from that match.
  const shown = games.map((g, i) => (i ? g : { ...g, c: heroSnap.count, s: heroSnap.score }));

  useInterval(
    () => {
      const i = (lr() * games.length) | 0;
      if (i === 0) hero.toggle();
      else {
        const d = lr() < 0.5 ? -1 : 1;
        setGames((gs) => gs.map((g, k) => (k === i ? { ...g, c: Math.max(g.n * 2 - 2, Math.min(g.n * 2 + 2, g.c + d)) } : g)));
      }
      // Draw the random numbers here, not inside the state updater, so updates stay pure.
      const drift = ((lr() * 5) | 0) - 2;
      const arrived = lr() < 0.5 ? 1 + ((lr() * 3) | 0) : 0;
      const gameChange = lr() < 0.12 ? (lr() < 0.5 ? -1 : 1) : 0;
      setWorld((w) => {
        const games = Math.max(16, Math.min(23, w.games + gameChange));
        const otherPlayers = Math.max(120, Math.min(190, w.otherPlayers + drift)) + (games - w.games) * 10;
        return { ...w, games, otherPlayers, today: w.today + arrived };
      });
      setPop(i);
    },
    still ? null : 2600,
  );
  useInterval(() => setGames((gs) => gs.map((g) => ({ ...g, min: g.min >= 50 ? 1 : g.min + 1 }))), still ? null : 60000);
  useEffect(() => {
    if (pop == null) return undefined;
    const t = setTimeout(() => setPop(null), 60);
    return () => clearTimeout(t);
  }, [pop]);

  return (
    <>
      <div className="proto"><div className="wrap">Design prototype. Sites, teams, fixtures and figures are sample data, and nothing here makes a real booking.</div></div>
      <Nav />
      <main id="top">
        <Hero match={hero} game={shown[0]} />
        <Live games={shown} world={world} pop={pop} />
        <Booking />
        <League />
      </main>
      <footer>
        <div className="wrap">
          <a className="logo" href="#top" aria-label="love.fútbol home"><Logo /></a>
          <nav aria-label="Footer"><a href="#book">Book a pitch</a><a href="#leagues">Leagues</a><a href="#live">Live</a></nav>
          <p>Front page prototype built from the love.fútbol brand kit. All names and numbers are examples.</p>
        </div>
      </footer>
    </>
  );
}
