import './style.css';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import Logo from '../shared/Logo.jsx';
import Num from '../shared/Num.jsx';
import { still, useInterval } from '../shared/util.js';

// Real time zones; sites, pitches and player counts are sample data.
const SITES = [
  { city: 'Manila', country: 'Philippines', tz: 'Asia/Manila', pitches: 2, n: 5 },
  { city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata', pitches: 2, n: 5 },
  { city: 'Nairobi', country: 'Kenya', tz: 'Africa/Nairobi', pitches: 2, n: 7 },
  { city: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo', pitches: 1, n: 5 },
  { city: 'Recife', country: 'Brazil', tz: 'America/Recife', pitches: 2, n: 5 },
  { city: 'Rio de Janeiro', country: 'Brazil', tz: 'America/Sao_Paulo', pitches: 1, n: 5 },
  { city: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires', pitches: 2, n: 5 },
  { city: 'Bogotá', country: 'Colombia', tz: 'America/Bogota', pitches: 2, n: 5 },
  { city: 'Houston', country: 'United States', tz: 'America/Chicago', pitches: 2, n: 7 },
  { city: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City', pitches: 3, n: 7 },
  { city: 'Guatemala City', country: 'Guatemala', tz: 'America/Guatemala', pitches: 1, n: 6 },
].map((s, k) => ({ ...s, k, fmt: new Intl.DateTimeFormat('en-GB', { timeZone: s.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) }));

function hash(a, b) {
  let x = ((a * 73856093) ^ (b * 19349663)) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 1274126177) >>> 0;
  return (x % 1000) / 1000;
}
/** How busy a pitch is at a local hour: evenings are full, nights are closed. */
const load = (h) => (h >= 17 && h < 21.5 ? 1 : h >= 15 && h < 17 ? 0.5 : h >= 7 && h < 11 ? 0.3 : h >= 21.5 && h < 22.5 ? 0.4 : 0);

function snapshot(now, shift) {
  const t = new Date(now + shift * 3600e3);
  let P = 0;
  let G = 0;
  let free = 0;
  const C = new Set();
  const lanes = SITES.map((s) => {
    const time = s.fmt.format(t);
    const [hh, mm] = time.split(':').map(Number);
    const h = hh + mm / 60;
    const slot = Math.floor(h * 2);
    const games = Math.min(s.pitches, Math.round(s.pitches * load(h) + hash(s.k + 1, slot) * 0.6 - 0.3));
    let players = 0;
    for (let g = 0; g < games; g++) players += s.n * 2 - 2 + Math.round(hash(s.k * 7 + g + 3, Math.floor(h * 6)) * 4);
    const open = h >= 7 && h < 22.5;
    free += open ? s.pitches - games : 0;
    P += players;
    G += games;
    if (games) C.add(s.country);
    const status = games ? `${games} ${games > 1 ? 'games' : 'game'}, ${players} players` : open ? 'Pitch free' : 'Closed for the night';
    return { s, h, time, on: games > 0, status };
  });
  return { lanes, players: P, games: G, countries: C.size, free };
}

/** One site on the day band. Its tag flips to whichever side of the dot has room. */
function Lane({ lane, bandWidth, scrubbing }) {
  const tagRef = useRef(null);
  const [tagLeft, setTagLeft] = useState(14);
  const pct = (lane.h / 24) * 100;
  useLayoutEffect(() => {
    const W = bandWidth;
    const x = (pct / 100) * W;
    const w = tagRef.current.offsetWidth;
    setTagLeft(x + 14 + w <= W - 6 ? 14 : x - 14 - w >= 6 ? -14 - w : W - 6 - w - x);
  }, [pct, bandWidth, lane.status, lane.time]);
  const style = { left: pct + '%' };
  if (scrubbing) Object.assign(style, { transitionDelay: '0ms', transitionDuration: '.25s' });
  else if (!still) style.transitionDelay = lane.s.k * 60 + 'ms';
  return (
    <div className="lane">
      <div className={'mark' + (lane.on ? ' on' : '')} style={style}>
        <i />
        <span className="tag" ref={tagRef} style={{ left: tagLeft + 'px' }}>
          <b>{lane.s.city}</b>
          <span className="num t">{lane.time}</span>
          <span className="st">{lane.status}</span>
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [shift, setShift] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [ready, setReady] = useState(false);
  const bandRef = useRef(null);
  const [bandWidth, setBandWidth] = useState(0);
  useInterval(() => setNow(Date.now()), 5000);

  useLayoutEffect(() => {
    const el = bandRef.current;
    const ro = new ResizeObserver(() => setBandWidth(el.clientWidth));
    ro.observe(el);
    setBandWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  // Let the marks start at midnight and travel to their real time on first paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const snap = snapshot(now, shift);
  const lanes = ready ? snap.lanes : snap.lanes.map((l) => ({ ...l, h: 0 }));
  const h = Math.floor(shift);
  const m = Math.round((shift - h) * 60);
  const onShift = (v) => {
    setScrubbing(true);
    setShift(v);
  };

  return (
    <>
      <div className="proto"><div className="wrap">Design prototype. Clocks are real. Sites, games and player counts are sample data.</div></div>
      <header className="nav">
        <div className="wrap">
          <a className="logo" href="#top" aria-label="love.fútbol home"><Logo /></a>
          <nav aria-label="Main"><a href="#routes">Book a pitch</a><a href="#routes">Leagues</a><a href="#day">Live</a></nav>
          <a className="btn" href="#routes">Book a pitch</a>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div className="wrap">
            <h1>Somewhere, a game is on.</h1>
            <p className="sentence" aria-live="polite">
              <Num value={snap.players} rise=".3em" duration={300} /> players in <Num value={snap.games * 2} rise=".3em" duration={300} /> teams are on{' '}
              <Num value={snap.games} rise=".3em" duration={300} /> {snap.games === 1 ? 'pitch' : 'pitches'} in{' '}
              <Num value={snap.countries} rise=".3em" duration={300} /> {snap.countries === 1 ? 'country' : 'countries'} right now.
            </p>
            <div className="cta"><a className="btn" href="#routes">Book a pitch</a><a className="btn line" href="#routes">Register a team</a></div>
          </div>
        </section>

        <section className="day" id="day">
          <div className="wrap">
            <div className="scrub">
              <label htmlFor="shift">Move the clock</label>
              <input type="range" id="shift" min="0" max="24" step="0.25" value={shift} onChange={(e) => onShift(+e.target.value)} />
              <output htmlFor="shift">{shift ? `${h} h${m ? ' ' + m + ' min' : ''} from now` : 'Now'}</output>
              <button hidden={!shift} onClick={() => onShift(0)}>Back to now</button>
            </div>
            <div className="band" ref={bandRef}>
              <div className="axis">
                <span style={{ left: 0 }}>00:00</span><span style={{ left: '25%' }}>06:00</span><span style={{ left: '50%' }}>Midday</span>
                <span style={{ left: '75%' }}>18:00</span><span style={{ left: '100%' }}>24:00</span>
              </div>
              {lanes.map((l) => <Lane key={l.s.city} lane={l} bandWidth={bandWidth} scrubbing={scrubbing} />)}
            </div>
            <p className="bandnote">Each site sits at its own local time. Pitches fill up after school and work, so the games follow the evening around the world. A red dot means a game is on.</p>
          </div>
        </section>

        <section className="routes" id="routes">
          <div className="wrap">
            <ul>
              <li><a href="#top"><h2>Book a pitch</h2><p>Reserve an hour at any site. The timetable shows free hours next to league fixtures on the same ground.</p><span className="live">{snap.free} {snap.free === 1 ? 'pitch' : 'pitches'} free now</span></a></li>
              <li><a href="#top"><h2>Join a league</h2><p>Register a team. Fixtures are drawn up and placed on a pitch, and results build the table and the knockout.</p><span className="live">4 leagues open for teams</span></a></li>
              <li><a href="#day"><h2>Watch it live</h2><p>See how many players are in every game, and how many teams and players are out there at this minute.</p><span className="live">{snap.games} {snap.games === 1 ? 'game' : 'games'} on now</span></a></li>
            </ul>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <a className="logo" href="#top" aria-label="love.fútbol home"><Logo /></a>
          <p>Front page prototype built from the love.fútbol brand kit. All names and numbers are examples.</p>
        </div>
      </footer>
    </>
  );
}
