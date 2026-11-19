import { useEffect, useMemo, useRef, useState } from 'react';
import { still } from '../shared/util.js';
import { GAMES } from './data.js';
import { COUNTRIES, PITCHES, fold, whereIs } from './pitches.js';

const LEAGUE = new Map(GAMES.filter((g) => g.league).map((g) => [g.id, g.league]));
const howMany = (n) => `${n} ${n === 1 ? 'pitch' : 'pitches'}`;
/** The small print beside a pitch: its place (and country, unless the list is already one country), plus the league. */
const note = (p, oneCountry) => [oneCountry ? p.place : whereIs(p), LEAGUE.has(p.id) && 'league plays here'].filter(Boolean).join(', ');

const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const hh = (h) => String(h).padStart(2, '0') + ':00';
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);
const NOTE = { open: 'Open', taken: 'Taken', league: 'League match', mine: 'Yours' };

/**
 * Book tab. On the left you find a pitch: a country dropdown narrows the list, and a search box
 * filters it by name, place or country. On the right, that pitch's days and hours.
 *
 * There is no city step on purpose. love.fútbol's own list gives a city for fewer than half
 * of its pitches, so a step everyone must answer would leave most pitches unreachable.
 */
export default function Book() {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  }, []);
  const [country, setCountry] = useState(null);
  const [query, setQuery] = useState('');
  const [pitch, setPitch] = useState(null);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(null);
  const [mine, setMine] = useState(() => new Set());
  const [done, setDone] = useState(null);
  const place = pitch == null ? null : PITCHES[pitch];
  const sheet = useRef(null);

  // On a narrow screen the sheet sits below the list, so bring it into view once a pitch is chosen.
  useEffect(() => {
    if (pitch == null) return;
    if (sheet.current.getBoundingClientRect().top > window.innerHeight - 160) sheet.current.scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
  }, [pitch]);

  // Every word typed has to appear somewhere in the pitch's name, place or country.
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const scoped = country == null ? PITCHES : PITCHES.filter((p) => p.country === country);
  const found = (terms.length ? scoped.filter((p) => terms.every((t) => p.hay.includes(t))) : [...scoped])
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

  const pickPitch = (id) => { setPitch(id); setHour(null); setDone(null); };
  const pickCountry = (name) => {
    setCountry(name);
    setQuery('');
    if (name == null) return;
    const theirs = PITCHES.filter((p) => p.country === name);
    // A country with one pitch leaves nothing more to choose.
    if (theirs.length === 1) pickPitch(theirs[0].id);
    else if (place && place.country !== name) pickPitch(null);
  };
  const allCountries = () => { setCountry(null); setQuery(''); };

  let status = country ? `${howMany(scoped.length)} in ${country}` : `${howMany(scoped.length)} in every country`;
  if (terms.length) {
    if (!found.length) status = `No pitch ${country ? `in ${country} ` : ''}matches “${query.trim()}”.`;
    else status = country ? `${found.length} of ${howMany(scoped.length)} in ${country}` : `${howMany(found.length)} found`;
  }

  const key = (h) => [pitch, day, h].join('-');
  const slotStatus = (h) => {
    if (mine.has(key(h))) return 'mine';
    if (LEAGUE.get(pitch)?.[days[day].getDay()]?.includes(h)) return 'league';
    if (day === 0 && h <= new Date().getHours()) return 'taken';
    return (h * 7 + pitch * 3 + day * 5) % 10 < 3 ? 'taken' : 'open';
  };
  const when = (h) => `${place.name}, ${fmtLong.format(days[day])}, ${hh(h)} to ${hh(h + 1)}`;
  let text = done ?? 'Choose an open hour to reserve it.';
  if (hour != null) text = when(hour) + '.';

  const reserve = () => {
    if (hour == null) return;
    setMine((m) => new Set(m).add(key(hour)));
    setDone(`Reserved: ${when(hour)}. This is a prototype, so nothing was actually booked.`);
    setHour(null);
  };

  return (
    <section className="book panel">
      <div className="wrap">
        <header className="head">
          <h2 className="display h2">Reserve an hour on the pitch</h2>
          <p className="lede">Choose your country, find your pitch, then pick a day. Green hours are open. League matches already have their place on the same calendar, so nobody turns up to a full pitch.</p>
        </header>
        <div className="book-grid">
          <div className="where">
            <label className="field">
              <span>Country <small>{PITCHES.length} pitches in {COUNTRIES.length} countries</small></span>
              <select value={country ?? ''} onChange={(e) => pickCountry(e.target.value || null)}>
                <option value="">All countries</option>
                {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
              </select>
            </label>
            <fieldset className="sites">
              <legend>Pitch</legend>
              <input
                className="filter" type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" spellCheck="false"
                aria-label="Search pitches" placeholder={country ? `Search the pitches in ${country}` : 'Search by pitch, place or country'}
              />
              <p className="status" role="status">{status}</p>
              {found.length > 0 ? (
                <div className="results">
                  {found.map((p) => (
                    <label className="site" key={p.id}>
                      <input type="radio" name="pitch" value={p.id} checked={pitch === p.id} onChange={() => pickPitch(p.id)} />
                      <span>{p.name}<small>{note(p, country != null)}</small></span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="hint">
                  Check the spelling, or{' '}
                  <button type="button" className="textlink" onClick={allCountries}>show every pitch</button>.
                </p>
              )}
            </fieldset>
          </div>
          {place == null ? (
            <div className="sheet empty">
              <h3>No pitch chosen yet</h3>
              <p>Choose a country, then a pitch. Its open hours for the next seven days show up here.</p>
            </div>
          ) : (
            <div className="sheet" ref={sheet}>
              <header className="sheet-head">
                <h3>{place.name}</h3>
                <p>{whereIs(place)}</p>
              </header>
              <div className="days" role="group" aria-label="Day">
                {days.map((d, i) => (
                  <button key={i} className="day" type="button" aria-label={fmtLong.format(d)} aria-pressed={i === day} onClick={() => { setDay(i); setHour(null); setDone(null); }}>
                    <small>{i === 0 ? 'Today' : fmtDay.format(d)}</small>
                    <strong>{d.getDate()}</strong>
                  </button>
                ))}
              </div>
              <div className="slots" role="group" aria-label="Hours">
                {HOURS.map((h) => {
                  const st = slotStatus(h);
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
          )}
        </div>
      </div>
    </section>
  );
}
