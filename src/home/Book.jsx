import { useEffect, useMemo, useRef, useState } from 'react';
import { still } from '../shared/util.js';
import { GAMES } from './data.js';
import { COUNTRIES, PITCHES, fold, whereIs } from './pitches.js';

const LEAGUE = new Map(GAMES.filter((g) => g.league).map((g) => [g.id, g.league]));
const howMany = (n) => `${n} ${n === 1 ? 'pitch' : 'pitches'}`;
/** The small print under a pitch's name: its place, plus the league if one plays there. */
const note = (p) => [p.place, LEAGUE.has(p.id) && 'league plays here'].filter(Boolean).join(' · ');

/** A pitch's photo, or a small drawing of a pitch where there is none or it fails to load. */
function Thumb({ src }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="thumb">
      {src && !broken ? (
        <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2.5" y="5" width="19" height="14" rx="1" /><path d="M12 5v14M2.5 9H6v6H2.5M21.5 9H18v6h3.5" /><circle cx="12" cy="12" r="2.6" />
        </svg>
      )}
    </span>
  );
}

function Arrow() {
  return (
    <svg className="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  );
}

const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const hh = (h) => String(h).padStart(2, '0') + ':00';
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);
const NOTE = { open: 'Open', taken: 'Taken', league: 'League match', mine: 'Yours' };

/**
 * Book tab. On the left you find a pitch: a list of every pitch with its photo and place,
 * and a search box. The list is part of the page and scrolls with it; each country's heading stays
 * in view while its pitches go by, and narrows the list to that country. On the right, that pitch's
 * days and hours, which stay beside the list as you scroll.
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
  const scoped = country == null ? PITCHES : PITCHES.filter((p) => p.code === country);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name;
  const found = terms.length ? scoped.filter((p) => terms.every((t) => p.hay.includes(t))) : scoped;
  // The list is grouped under country headings, biggest country first.
  const groups = COUNTRIES.map((c) => ({ ...c, rows: found.filter((p) => p.code === c.code) })).filter((g) => g.rows.length);

  const pickPitch = (id) => { setPitch(id); setHour(null); setDone(null); };
  const pickCountry = (name) => {
    setCountry(name);
    setQuery('');
    if (name == null) return;
    const theirs = PITCHES.filter((p) => p.code === name);
    // A country with one pitch leaves nothing more to choose.
    if (theirs.length === 1) pickPitch(theirs[0].id);
  };
  const allCountries = () => { setCountry(null); setQuery(''); };

  let status = country ? `${howMany(scoped.length)} in ${countryName}` : `${howMany(scoped.length)} in ${COUNTRIES.length} countries`;
  if (terms.length) {
    if (!found.length) status = `No pitch ${country ? `in ${countryName} ` : ''}matches “${query.trim()}”.`;
    else status = country ? `${found.length} of ${howMany(scoped.length)} in ${countryName}` : `${howMany(found.length)} found`;
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
          <p className="lede">Find your pitch in the list, then pick a day. Green hours are open. League matches already have their place on the same calendar, so nobody turns up to a full pitch.</p>
        </header>
        <div className="book-grid">
          <div className="where">
            <input
              className="filter" type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" spellCheck="false"
              aria-label="Search pitches" placeholder="Search a pitch, city or country"
            />
            <p className="status" role="status">{status}</p>
            {found.length > 0 ? (
              <div className="results">
                {groups.map((g, i) => (
                  <div className={`group tone-${i % 2}`} role="group" aria-label={g.name} key={g.code}>
                    <button type="button" className="group-head" aria-pressed={country === g.code} onClick={() => pickCountry(country === g.code ? null : g.code)}>
                      <span className="display">{g.name}</span>
                      <small>{g.rows.length} {g.rows.length === 1 ? 'space' : 'spaces'} · {country === g.code ? 'show all' : 'show only'} <Arrow /></small>
                    </button>
                    {g.rows.map((p) => (
                      <label className="prow" key={p.id}>
                        <input type="radio" name="pitch" value={p.id} checked={pitch === p.id} onChange={() => pickPitch(p.id)} />
                        <span className="prow-body">
                          <Thumb src={p.img} />
                          <span className="prow-text"><b>{p.name}</b><small>{note(p)}</small></span>
                          {p.num > 0 && <span className="num">#{p.num}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="hint">
                Check the spelling, or{' '}
                <button type="button" className="textlink" onClick={allCountries}>show every pitch</button>.
              </p>
            )}
          </div>
          {place == null ? (
            <div className="sheet empty">
              <h3>No pitch chosen yet</h3>
              <p>Choose a pitch from the list. Its open hours for the next seven days show up here.</p>
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
