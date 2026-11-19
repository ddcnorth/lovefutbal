import './style.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import logoUrl from '../assets/logo-source-reversed.svg';
import useFlip from '../shared/useFlip.js';
import { still } from '../shared/util.js';

const rnd = (a, b) => a + Math.random() * (b - a);
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];

/** A number that does a little hop whenever it changes. */
function Tick({ value }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }, [value]);
  return <span className="n" ref={ref}>{value}</span>;
}

/* ───── Hero: a five-a-side played in one half ───── */
const W = 560;
const H = 520;
const HOMES = [
  [[70, 260], [190, 140], [190, 380], [320, 200], [330, 330]], // light team, attacking right
  [[500, 262], [400, 150], [400, 372], [270, 120], [260, 400]], // dark team, defending right
];

function HeroGame() {
  const gameRef = useRef(null);
  const nodes = useRef([]);
  const ballRef = useRef(null);
  const [kickedOff, setKickedOff] = useState(false);
  const players = useMemo(
    () => HOMES.flatMap((team, t) => team.map(([hx, hy]) => ({ t, hx, hy, x: hx, y: hy, ph: rnd(0, 6.28), sp: rnd(0.5, 0.9) }))),
    [],
  );

  useEffect(() => {
    const ko = setTimeout(() => setKickedOff(true), still ? 0 : 1500);
    let holder = 3;
    let flight = null;
    let holdFor = 1;
    const ball = { x: 320, y: 200 };
    // Positions change every frame, so they are written straight to the SVG instead of through React state.
    const place = () => {
      players.forEach((p, i) => {
        nodes.current[i]?.setAttribute('cx', p.x.toFixed(1));
        nodes.current[i]?.setAttribute('cy', p.y.toFixed(1));
      });
      ballRef.current?.setAttribute('cx', ball.x.toFixed(1));
      ballRef.current?.setAttribute('cy', ball.y.toFixed(1));
    };
    place();
    if (still) return () => clearTimeout(ko);

    const pass = () => {
      const from = players[holder];
      const steal = Math.random() < 0.22;
      const options = players.map((p, i) => i).filter((i) => i !== holder && (players[i].t === from.t) !== steal);
      const to = pickOne(options);
      const d = Math.hypot(players[to].x - from.x, players[to].y - from.y);
      flight = { from: { x: ball.x, y: ball.y }, to, t: 0, dur: Math.max(0.35, d / 420) };
      holder = -1;
    };
    let last = 0;
    let visible = true;
    let t0 = 0;
    let raf;
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
    io.observe(gameRef.current);
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      if (!visible || document.hidden) return;
      t0 += dt;
      if (t0 < 1.9) return; // wait for the lines to be drawn
      const side = holder >= 0 ? players[holder].t : players[flight.to].t;
      let chaser = -1;
      let best = 1e9;
      players.forEach((p, i) => {
        if (p.t !== side) {
          const d = Math.hypot(p.x - ball.x, p.y - ball.y);
          if (d < best) { best = d; chaser = i; }
        }
      });
      players.forEach((p, i) => {
        const pull = i === chaser ? 0.8 : p.t === side ? 0.3 : 0.2;
        const push = p.t === side ? (p.t === 0 ? 40 : -40) : 0; // team in possession steps forward
        let tx = p.hx + (ball.x - p.hx) * pull + push + Math.sin(t0 * p.sp + p.ph) * 16;
        let ty = p.hy + (ball.y - p.hy) * pull + Math.cos(t0 * p.sp * 1.3 + p.ph) * 16;
        if (i === holder) { tx = p.x + (p.t === 0 ? 30 : -30); ty = p.y + Math.sin(t0 * 2 + p.ph) * 20; }
        tx = Math.max(24, Math.min(W - 24, tx));
        ty = Math.max(30, Math.min(H - 90, ty));
        const k = 1 - Math.exp(-dt * (i === chaser ? 2.2 : 1.5));
        p.x += (tx - p.x) * k;
        p.y += (ty - p.y) * k;
      });
      for (let a = 0; a < players.length; a++) {
        for (let b = a + 1; b < players.length; b++) { // keep players from stacking up
          const A = players[a];
          const B = players[b];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 34) { const s = (34 - d) / 2 / d; A.x -= dx * s; A.y -= dy * s; B.x += dx * s; B.y += dy * s; }
        }
      }
      if (holder >= 0) {
        const p = players[holder];
        ball.x = p.x + (p.t === 0 ? 15 : -15);
        ball.y = p.y + 9;
        holdFor -= dt;
        if (holdFor <= 0) pass();
      } else {
        flight.t += dt / flight.dur;
        const q = players[flight.to];
        const e = Math.min(1, flight.t);
        ball.x = flight.from.x + (q.x - flight.from.x) * e;
        ball.y = flight.from.y + (q.y - flight.from.y) * e;
        if (e >= 1) { holder = flight.to; flight = null; holdFor = rnd(0.5, 1.5); }
      }
      place();
    };
    raf = requestAnimationFrame(frame);
    return () => { clearTimeout(ko); cancelAnimationFrame(raf); io.disconnect(); };
  }, [players]);

  return (
    <div className={'game' + (kickedOff ? ' kicked-off' : '')} ref={gameRef}>
      <svg viewBox="0 0 560 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A five-a-side game in progress, drawn from above">
        <g className="game-lines">
          <path style={{ '--i': 8 }} pathLength="1" d="M2 178 C92 186 104 334 3 342" />
          <path style={{ '--i': 9 }} pathLength="1" d="M556 128 C500 124 462 133 432 129 C427 250 436 330 431 394 C470 398 520 390 556 395" />
        </g>
        <g>
          {players.map((p, i) => (
            <circle
              key={i}
              ref={(el) => (nodes.current[i] = el)}
              r="13"
              className="player"
              fill={p.t ? '#1D1D1B' : '#F5F4EF'}
              stroke={p.t ? '#F5F4EF' : '#1D1D1B'}
              strokeWidth="2.5"
            />
          ))}
        </g>
        <circle ref={ballRef} className="player" r="7" fill="#F5A300" stroke="#1D1D1B" strokeWidth="2.5" />
      </svg>
      <p className="now"><span className="pulse" /><span>Playing now at <b>Hissey Playground, Philadelphia</b></span></p>
    </div>
  );
}

function Hero() {
  const lines = [
    'M10 13 C300 8 700 17 990 10', 'M990 10 C993 80 987 150 991 212', 'M991 388 C994 450 988 530 990 589',
    'M990 589 C700 594 300 584 11 591', 'M11 591 C7 520 13 450 9 388', 'M9 212 C13 150 7 80 10 13',
  ];
  return (
    <section className="hero">
      <div className="wrap">
        <div className="pitch">
          <svg className="pitch-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            {lines.map((d, i) => <path key={i} style={{ '--i': i }} pathLength="1" d={d} />)}
            <path className="centre" style={{ '--i': 6 }} pathLength="1" d="M499 11 C504 200 495 400 500 590" />
          </svg>
          <span className="spot" aria-hidden="true" />
          <svg className="flag" viewBox="0 0 38 30" aria-hidden="true">
            <path d="M3 29 L4 3" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <path d="M5 3 C14 0 24 3 35 6 C26 10 16 12 5 15 Z" fill="#ED1C24" />
          </svg>
          <div className="hero-copy">
            <h1 className="display"><span>Book the pitch.</span><span>Play the league.</span><span>See who's on.</span></h1>
            <p className="lede">Reserve an hour on a community pitch, enter your team in a league, and watch games happening right now at love.fútbol sites around the world.</p>
            <div className="cta-row">
              <a className="btn" href="#book">Book a pitch</a>
              <a className="btn btn-line" href="#live">See live games</a>
            </div>
          </div>
          <HeroGame />
        </div>
      </div>
    </section>
  );
}

/* ───── Booking ───── */
const SITES = [
  { name: 'Hissey Playground', where: 'Philadelphia, USA' },
  { name: 'Cancha Villa Nueva', where: 'Villa Nueva, Guatemala' },
  { name: 'Campo do Ibura', where: 'Recife, Brazil' },
  { name: 'Cancha La Unión', where: 'Mexico City, Mexico' },
];
const fmtDay = new Intl.DateTimeFormat('en', { weekday: 'short' });
const fmtLong = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' });
const hh = (h) => String(h).padStart(2, '0') + ':00';
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);
const NOTE = { open: 'Open', taken: 'Taken', league: 'League match', mine: 'Yours' };

function Booking() {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  }, []);
  const [site, setSite] = useState(0);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(null);
  const [mine, setMine] = useState(() => new Set());
  const [done, setDone] = useState(null);
  const key = (h) => [site, day, h].join('-');
  const status = (h) => {
    if (mine.has(key(h))) return 'mine';
    const dow = days[day].getDay();
    if ((dow === 6 || dow === 3) && (h === 18 || h === 19)) return 'league';
    const n = (h * 7 + site * 3 + day * 5) % 10;
    if (day === 0 && h <= new Date().getHours()) return 'taken';
    return n < 3 ? 'taken' : 'open';
  };
  const s = SITES[site];
  let text = done ?? 'Choose an open hour to reserve it.';
  if (hour != null) text = `${s.name}, ${fmtLong.format(days[day])}, ${hh(hour)} to ${hh(hour + 1)}.`;

  const reserve = () => {
    if (hour == null) return;
    setMine((m) => new Set(m).add(key(hour)));
    setDone(`Reserved: ${s.name}, ${fmtLong.format(days[day])}, ${hh(hour)} to ${hh(hour + 1)}. This is a preview, so nothing was actually booked.`);
    setHour(null);
  };
  const choose = (fn) => { fn(); setHour(null); };

  return (
    <section className="book" id="book">
      <div className="wrap book-grid">
        <div className="book-intro">
          <h2 className="display h2">Reserve an hour on the pitch</h2>
          <p className="lede">Pick a site and a day. Green hours are open. League matches already have their place on the same calendar, so nobody turns up to a full pitch.</p>
          <fieldset className="sites">
            <legend>Choose a site</legend>
            {SITES.map((x, i) => (
              <label className="site" key={x.name}>
                <input type="radio" name="site" value={i} checked={site === i} onChange={() => choose(() => setSite(i))} />
                <span>{x.name}<small>{x.where}</small></span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="sheet">
          <div className="days" role="group" aria-label="Day">
            {days.map((d, i) => (
              <button key={i} className="day" type="button" aria-label={fmtLong.format(d)} aria-pressed={i === day} onClick={() => choose(() => setDay(i))}>
                <small>{i === 0 ? 'Today' : fmtDay.format(d)}</small>
                <strong>{d.getDate()}</strong>
              </button>
            ))}
          </div>
          <div className="slots" role="group" aria-label="Hours">
            {HOURS.map((h) => {
              const st = status(h);
              const open = st === 'open';
              return (
                <button
                  key={h}
                  type="button"
                  className={'slot ' + (open ? '' : st)}
                  disabled={!open}
                  aria-pressed={open ? hour === h : undefined}
                  onClick={open ? () => { setHour(hour === h ? null : h); setDone(null); } : undefined}
                >
                  {hh(h)}<small>{NOTE[st]}</small>
                </button>
              );
            })}
          </div>
          <ul className="key">
            <li><i />Open</li>
            <li><i className="k-taken" />Taken</li>
            <li><i className="k-league" />League match</li>
          </ul>
          <div className="pick">
            <p aria-live="polite">{text}</p>
            <button className="btn" disabled={hour == null} onClick={reserve}>{hour == null ? 'Reserve' : `Reserve ${hh(hour)}`}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── League: fixtures, standings, knockout ───── */
const NAMES = ['Kensington Rovers', 'Norris Square United', 'Las Estrellas', 'Front Street Athletic', 'Lehigh Avenue FC', 'Fishtown Old Boys'];
const SLOTS = ['Sat 17:00, pitch 1', 'Sat 18:00, pitch 1', 'Sat 19:00, pitch 1'];
const goals = (r) => { const x = r(); return x < 0.22 ? 0 : x < 0.52 ? 1 : x < 0.78 ? 2 : x < 0.92 ? 3 : 4; };
// round robin by the circle method
const ROUNDS = (() => {
  const ids = NAMES.map((_, i) => i);
  const out = [];
  for (let r = 0; r < 5; r++) {
    out.push([0, 1, 2].map((i) => (r % 2 ? [ids[5 - i], ids[i]] : [ids[i], ids[5 - i]])));
    ids.splice(1, 0, ids.pop());
  }
  return out;
})();
const blank = () => NAMES.map((name, id) => ({ id, name, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
function apply(teams, a, b, ga, gb) {
  const A = teams[a];
  const B = teams[b];
  A.p++; B.p++; A.gf += ga; A.ga += gb; B.gf += gb; B.ga += ga;
  if (ga > gb) { A.w++; B.l++; A.pts += 3; } else if (gb > ga) { B.w++; A.l++; B.pts += 3; } else { A.d++; B.d++; A.pts++; B.pts++; }
}
const sorted = (teams) => [...teams].sort((x, y) => y.pts - x.pts || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf || x.id - y.id);
const knock = (a, b) => {
  let x = goals(Math.random);
  let y = goals(Math.random);
  if (x === y) Math.random() < 0.5 ? x++ : y++;
  return { score: [x, y], winner: x > y ? a : b };
};
const win = (s) => (s[0] > s[1] ? 0 : s[1] > s[0] ? 1 : -1);
const upcoming = (md) => ROUNDS[md].map(([a, b], i) => ({ home: NAMES[a], away: NAMES[b], score: 'v', when: 'Hissey Playground, ' + SLOTS[i], winner: -1 }));

function newSeason() {
  let seed = 7;
  const srand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const teams = blank();
  for (let md = 0; md < 2; md++) ROUNDS[md].forEach(([a, b]) => apply(teams, a, b, goals(srand), goals(srand)));
  return { teams, md: 2, stage: 'league', ko: { sf: [null, null], final: null }, title: 'Matchday 3', fixtures: upcoming(2), champ: '' };
}

/** Plays the next step of the season. Runs in the click handler, so Math.random is fine here. */
function advance(L) {
  if (L.stage === 'league') {
    const teams = L.teams.map((t) => ({ ...t }));
    const res = ROUNDS[L.md].map(([a, b]) => { const s = [goals(Math.random), goals(Math.random)]; apply(teams, a, b, s[0], s[1]); return s; });
    const md = L.md + 1;
    const fixtures = ROUNDS[L.md].map(([a, b], i) => ({ home: NAMES[a], away: NAMES[b], score: `${res[i][0]}–${res[i][1]}`, when: 'Hissey Playground, ' + SLOTS[i], winner: win(res[i]) }));
    return { ...L, teams, md, stage: md >= 5 ? 'semis' : 'league', title: `Matchday ${md} results`, fixtures };
  }
  if (L.stage === 'semis') {
    const s = sorted(L.teams);
    const sf = [knock(s[0], s[3]), knock(s[1], s[2])];
    const fixtures = [[s[0], s[3]], [s[1], s[2]]].map(([a, b], i) => ({ home: a.name, away: b.name, score: sf[i].score.join('–'), when: 'Hissey Playground, ' + SLOTS[i], winner: sf[i].winner === a ? 0 : 1 }));
    return { ...L, ko: { sf, final: null }, stage: 'final', title: 'Semi-finals', fixtures };
  }
  if (L.stage === 'final') {
    const a = L.ko.sf[0].winner;
    const b = L.ko.sf[1].winner;
    const final = knock(a, b);
    const fixtures = [{ home: a.name, away: b.name, score: final.score.join('–'), when: 'Hissey Playground, Sun 16:00, pitch 1', winner: final.winner === a ? 0 : 1 }];
    return { ...L, ko: { ...L.ko, final }, stage: 'over', title: 'Final', fixtures, champ: `${final.winner.name} are champions.` };
  }
  return newSeason();
}

function Tie({ a, b, res }) {
  return (
    <div className="tie">
      {[a, b].map((t, i) => (
        <div key={i} className={t.tbd ? 'tbd' : res && res[i] > res[1 - i] ? 'w' : ''}>
          <span>{t.name}</span>
          <span>{res ? res[i] : ''}</span>
        </div>
      ))}
    </div>
  );
}

export function League() {
  const [L, setL] = useState(newSeason);
  const table = sorted(L.teams);
  const flip = useFlip([L.teams], { duration: 650, easing: 'cubic-bezier(.3,1.3,.5,1)', movingClass: 'moved' });
  const done = L.md >= 5;
  const seedName = (i) => (done ? table[i] : { name: `${['1st', '2nd', '3rd', '4th'][i]}: ${table[i].name}`, tbd: true });
  const f = (i) => (L.ko.sf[i] ? L.ko.sf[i].winner : { name: `Winner of semi-final ${i + 1}`, tbd: true });
  const play = { league: `Play matchday ${L.md + 1}`, semis: 'Play the semi-finals', final: 'Play the final', over: 'Start a new season' }[L.stage];
  const note = {
    league: 'Results here are made up on the spot.',
    semis: 'The league is finished. The top four are through.',
    final: 'Sunday 16:00, Hissey Playground, pitch 1.',
    over: '',
  }[L.stage];

  return (
    <section className="leagues" id="leagues">
      <div className="wrap">
        <div className="leagues-head">
          <h2 className="display h2">Leagues that run themselves</h2>
          <p className="lede">Register your team. Fixtures are drawn up and placed on the pitches you already book. Enter a result and the table and the knockout bracket update on their own. Try it with the league below.</p>
        </div>
        <div className="league-grid">
          <div>
            <div className="panel">
              <h3>Hissey Playground Winter League</h3>
              <table className="standings">
                <thead>
                  <tr>
                    <th><span className="sr">Position</span></th><th>Team</th>
                    <th><abbr title="Played">P</abbr></th><th><abbr title="Won">W</abbr></th><th><abbr title="Drawn">D</abbr></th>
                    <th><abbr title="Lost">L</abbr></th><th><abbr title="Goal difference">GD</abbr></th><th><abbr title="Points">Pts</abbr></th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((t, i) => {
                    const gd = t.gf - t.ga;
                    return (
                      <tr key={t.id} ref={flip(t.id)} className={i === 3 ? 'cut' : undefined}>
                        <td>{i + 1}</td><td>{t.name}</td><td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
                        <td>{(gd > 0 ? '+' : '') + gd}</td><td>{t.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="cut-note">Top four go to the semi-finals</p>
            </div>
          </div>
          <div>
            <div className="panel">
              <h3>{L.title}</h3>
              <ul className="fixtures">
                {L.fixtures.map((x, i) => (
                  <li key={L.title + i}>
                    <span className={'home' + (x.winner === 0 ? ' win' : '')}>{x.home}</span>
                    <span className="score">{x.score}</span>
                    <span className={'away' + (x.winner === 1 ? ' win' : '')}>{x.away}</span>
                    <span className="when">{x.when}</span>
                  </li>
                ))}
              </ul>
              <div className="play-row">
                <button className="btn" onClick={() => setL(advance(L))}>{play}</button>
                <p>{note}</p>
              </div>
            </div>
            <div className="panel">
              <h3>Knockout</h3>
              <div className="bracket">
                <div className="b-col">
                  <Tie a={seedName(0)} b={seedName(3)} res={L.ko.sf[0]?.score} />
                  <Tie a={seedName(1)} b={seedName(2)} res={L.ko.sf[1]?.score} />
                </div>
                <div className="join" aria-hidden="true" />
                <div className="b-col"><Tie a={f(0)} b={f(1)} res={L.ko.final?.score} /></div>
              </div>
              <p className="champ" aria-live="polite">{L.champ}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── Live: every dot is a player ───── */
const START_GAMES = [
  { place: 'Philadelphia', country: 'USA', kind: 'League match', max: 10, n: 10 },
  { place: 'Villa Nueva', country: 'Guatemala', kind: 'Booked game', max: 14, n: 11 },
  { place: 'Recife', country: 'Brazil', kind: 'League match', max: 10, n: 10 },
  { place: 'São Paulo', country: 'Brazil', kind: 'Booked game', max: 14, n: 9 },
  { place: 'Mexico City', country: 'Mexico', kind: 'Booked game', max: 10, n: 7 },
  { place: 'Oaxaca', country: 'Mexico', kind: 'League match', max: 10, n: 10 },
  { place: 'Buenos Aires', country: 'Argentina', kind: 'Booked game', max: 14, n: 12 },
  { place: 'Cartagena', country: 'Colombia', kind: 'Booked game', max: 10, n: 6 },
  { place: 'Houston', country: 'USA', kind: 'League match', max: 14, n: 14 },
].map((g) => ({ ...g, side: [Math.ceil(g.n / 2), Math.floor(g.n / 2)], leaving: null }));
// formation spots for one side, in a 100 x 120 half; mirrored for the other team
const SPOTS = [[12, 60], [38, 28], [38, 92], [66, 60], [80, 22], [80, 98], [54, 44]];
const xy = (team, i) => { const [x, y] = SPOTS[i]; return team ? [208 - x * 0.98, 126 - y] : [12 + x * 0.98, y + 6]; };

function MiniPitch({ g, idx }) {
  const dots = (t) => {
    const count = g.side[t] + (g.leaving?.t === t ? 1 : 0);
    return Array.from({ length: count }, (_, i) => {
      const [cx, cy] = xy(t, i);
      const leaving = g.leaving?.t === t && i === count - 1;
      return <circle key={i} cx={cx} cy={cy} r="6.5" className={(t ? 'b' : 'a') + (leaving ? ' leaving' : '')} style={{ '--d': `${-((idx * 7 + i * 3 + t) % 10) / 2}s` }} />;
    });
  };
  return (
    <svg className="mini" viewBox="0 0 220 132" aria-hidden="true">
      <path className="ln" d="M4 5 C70 3 150 7 216 4 C218 45 214 90 217 128 C150 130 70 126 5 129 C3 90 7 45 4 5Z" />
      <path className="ln" d="M110 5 C112 45 108 90 110 128" />
      <path className="ln" d="M110 52 C122 53 123 79 110 80 C98 79 97 53 110 52Z" />
      <g>{dots(0)}</g>
      <g>{dots(1)}</g>
    </svg>
  );
}

function Live() {
  const [games, setGames] = useState(START_GAMES);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((e) => setInView(e[0].isIntersecting), { threshold: 0.1 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!inView) return undefined;
    const id = setInterval(() => {
      const gi = Math.floor(Math.random() * START_GAMES.length);
      const roll = Math.random();
      setGames((gs) =>
        gs.map((g, k) => {
          if (k !== gi) return g;
          const join = g.n < g.max && (g.n <= 6 || roll < 0.55);
          if (!join && g.n <= 6) return g;
          const t = join ? (g.side[0] <= g.side[1] ? 0 : 1) : g.side[0] >= g.side[1] ? 0 : 1;
          const side = [...g.side];
          side[t] += join ? 1 : -1;
          return { ...g, side, n: g.n + (join ? 1 : -1), leaving: join ? null : { t, at: Date.now() } };
        }),
      );
    }, 1700);
    return () => clearInterval(id);
  }, [inView]);
  // Drop a leaving dot once its exit animation has played.
  useEffect(() => {
    if (!games.some((g) => g.leaving)) return undefined;
    const t = setTimeout(() => setGames((gs) => gs.map((g) => (g.leaving && Date.now() - g.leaving.at >= 350 ? { ...g, leaving: null } : g))), 360);
    return () => clearTimeout(t);
  }, [games]);

  const players = games.reduce((s, g) => s + g.n, 0);
  const countries = new Set(games.map((g) => g.country)).size;
  return (
    <section className="live" id="live" ref={sectionRef}>
      <div className="wrap">
        <h2 className="display live-line" aria-live="off">
          Right now <Tick value={players} /> people on <Tick value={games.length * 2} /> teams are playing on <Tick value={games.length} /> pitches in{' '}
          <Tick value={countries} /> countries.
        </h2>
        <p className="live-sub"><span className="pulse" />Each dot is a player on the pitch. Counts change as people join and leave.</p>
        <ul className="games">
          {games.map((g, idx) => (
            <li key={g.place}>
              <div className="g-head">
                <div><b>{g.place}, {g.country}</b><small>{g.kind}, {g.max / 2}-a-side</small></div>
                <span className="g-count" aria-label={`${g.n} players`}>{g.n}</span>
              </div>
              <MiniPitch g={g} idx={idx} />
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>games played today</dt><dd>41</dd></div>
          <div><dt>hours booked this week</dt><dd>312</dd></div>
          <div><dt>teams in a league this season</dt><dd>86</dd></div>
          <div><dt>sites open for booking</dt><dd>14</dd></div>
        </dl>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <header className="top">
        <div className="wrap">
          <a className="logo" href="#" aria-label="love.fútbol home"><img src={logoUrl} alt="love.fútbol" width="350" height="199" /></a>
          <nav aria-label="Main">
            <a className="sec" href="#book">Book a pitch</a>
            <a className="sec" href="#leagues">Leagues</a>
            <a className="sec" href="#live">Live</a>
            <a className="signin" href="#">Sign in</a>
          </nav>
        </div>
      </header>
      <main>
        <Hero />
        <Booking />
        <League />
        <Live />
        <section className="close">
          <div className="wrap">
            <h2 className="display h2">Your pitch is open tonight.</h2>
            <div className="cta-row">
              <a className="btn" href="#book">Book a pitch</a>
              <a className="btn btn-line" href="#leagues">Register a team</a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <img src={logoUrl} alt="love.fútbol" width="350" height="199" />
          <p>Design preview with sample data. Site names, teams, scores and live counts on this page are placeholders until the booking and stats services are connected.</p>
          <ul><li><a href="#book">Book</a></li><li><a href="#leagues">Leagues</a></li><li><a href="#live">Live</a></li></ul>
        </div>
      </footer>
    </>
  );
}
