import { useEffect, useMemo, useRef, useState } from 'react';
import { still } from '../shared/util.js';
import { GAMES } from './data.js';
import { CONTINENTS, COUNTRIES, PITCHES, fold, whereIs } from './pitches.js';

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

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
  );
}

// Every word typed has to appear somewhere in the pitch's name, place, country or continent.
const termsOf = (q) => fold(q).split(/\s+/).filter(Boolean);
const inContinent = (c) => (c == null ? PITCHES : PITCHES.filter((p) => p.continent === c));
const matching = (list, terms) => (terms.length ? list.filter((p) => terms.every((t) => p.hay.includes(t))) : list);

const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const hh = (h) => String(h).padStart(2, '0') + ':00';
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);
const NOTE = { open: 'Open', taken: 'Taken', league: 'League match', mine: 'Yours' };

/**
 * Book tab. On the left you find a pitch: a search box, a row of continents, and under them a card
 * for each country that opens to show its pitches with photo and place. Picking a continent leaves
 * only its countries. The list is part of the page and scrolls with it; an open country's heading
 * stays in view while its pitches go by. On the right, the chosen pitch's days and hours, which stay
 * beside the list as you scroll.
 */
export default function Book() {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  }, []);
  const [continent, setContinent] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [pitch, setPitch] = useState(null);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(null);
  const [mine, setMine] = useState(() => new Set());
  const [done, setDone] = useState(null);
  const place = pitch == null ? null : PITCHES[pitch];
  const sheet = useRef(null);
  const where = useRef(null);
  const finder = useRef(null);

  // The search box and continents stay pinned under the header, and an open country's band pins
  // just below them, so the bands need to know how tall that pinned block is (it wraps on a phone).
  useEffect(() => {
    const el = finder.current;
    const ro = new ResizeObserver(() => where.current.style.setProperty('--find-h', `${el.getBoundingClientRect().height}px`));
    ro.observe(el, { box: 'border-box' });
    return () => ro.disconnect();
  }, []);

  // Searching or picking a continent while scrolled down the list brings the list's start back
  // up under the pinned search box, so the new results are in view rather than scrolled past.
  useEffect(() => {
    if (where.current.getBoundingClientRect().top < finder.current.getBoundingClientRect().top - 1) {
      where.current.scrollIntoView({ block: 'start' });
    }
  }, [continent, query]);

  // On a narrow screen the sheet sits below the list, so bring it into view once a pitch is chosen.
  useEffect(() => {
    if (pitch == null) return;
    if (sheet.current.getBoundingClientRect().top > window.innerHeight - 160) sheet.current.scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
  }, [pitch]);

  const terms = termsOf(query);
  const scoped = inContinent(continent);
  const found = matching(scoped, terms);
  // The list is grouped into country cards, biggest country first.
  const groups = COUNTRIES.map((c) => ({ ...c, rows: found.filter((p) => p.code === c.code) })).filter((g) => g.rows.length);

  const pickPitch = (id) => { setPitch(id); setHour(null); setDone(null); };
  // While searching, every country with a match opens so the matches are in view. Clearing the
  // search leaves only the chosen pitch's country open.
  const opened = (c, q) => {
    const t = termsOf(q);
    if (t.length) return new Set(matching(inContinent(c), t).map((p) => p.code));
    return new Set(place ? [place.code] : []);
  };
  const search = (q) => { setQuery(q); setOpen(opened(continent, q)); };
  // Switching continent keeps the cards as you left them. A continent with one country opens it.
  const pickContinent = (c) => {
    setContinent(c);
    const next = termsOf(query).length ? opened(c, query) : new Set(open);
    const theirs = COUNTRIES.filter((x) => x.continent === c);
    if (theirs.length === 1) next.add(theirs[0].code);
    setOpen(next);
  };
  const allPitches = () => { setContinent(null); setQuery(''); setOpen(opened(null, '')); };
  const toggle = (code) => {
    const next = new Set(open);
    if (next.has(code)) next.delete(code);
    else {
      next.add(code);
      // A country with one pitch leaves nothing more to choose.
      const theirs = PITCHES.filter((p) => p.code === code);
      if (theirs.length === 1) pickPitch(theirs[0].id);
    }
    setOpen(next);
  };

  const spread = continent ? COUNTRIES.filter((c) => c.continent === continent).length : COUNTRIES.length;
  let status = continent
    ? `${howMany(scoped.length)} in ${continent}${spread > 1 ? `, across ${spread} countries` : ''}`
    : `${howMany(scoped.length)} in ${spread} countries`;
  if (terms.length) {
    if (!found.length) status = `No pitch ${continent ? `in ${continent} ` : ''}matches “${query.trim()}”.`;
    else status = continent ? `${found.length} of ${howMany(scoped.length)} in ${continent}` : `${howMany(found.length)} found`;
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
          <div className="where" ref={where}>
            <div className="finder" ref={finder}>
              <input
                className="filter" type="search" value={query} onChange={(e) => search(e.target.value)} autoComplete="off" spellCheck="false"
                aria-label="Search pitches" placeholder="Search a pitch, city or country"
              />
              <div className="continents" role="group" aria-label="Continent">
                <button type="button" aria-pressed={continent == null} onClick={() => pickContinent(null)}>
                  <span>All</span><small>{PITCHES.length}</small>
                </button>
                {CONTINENTS.map((c) => (
                  <button key={c.name} type="button" aria-pressed={continent === c.name} onClick={() => pickContinent(continent === c.name ? null : c.name)}>
                    <span>{c.name}</span><small>{c.count}</small>
                  </button>
                ))}
              </div>
            </div>
            <p className="status" role="status">{status}</p>
            {found.length > 0 ? (
              <div className="results">
                {groups.map((g, i) => {
                  const isOpen = open.has(g.code);
                  const chosenHere = place?.code === g.code;
                  return (
                    <div className={`group tone-${i % 2}`} key={g.code}>
                      <button type="button" className="group-head" id={`c-${g.code}`} aria-expanded={isOpen} aria-controls={`r-${g.code}`} onClick={() => toggle(g.code)}>
                        <span className="display">{g.name}</span>
                        <small>{chosenHere && !isOpen ? `${place.name} chosen` : howMany(g.rows.length)}</small>
                        <Chevron />
                      </button>
                      <div className="group-rows" id={`r-${g.code}`} role="group" aria-labelledby={`c-${g.code}`} hidden={!isOpen}>
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="hint">
                Check the spelling, or{' '}
                <button type="button" className="textlink" onClick={allPitches}>show every pitch</button>.
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
