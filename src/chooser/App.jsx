import { useEffect, useRef, useState } from 'react';
import Logo from '../shared/Logo.jsx';
import Flag from '../shared/Flag.jsx';
import { BoardSketch, PitchSketch, SiteSketch, WorldSketch } from './Sketches.jsx';

const KEY = 'lf-design-pick';
const OPTIONS = [
  {
    id: 'pitch', title: 'The pitch', kind: 'Front page, light', href: 'pitch.html', open: 'Open the pitch front page', Sketch: PitchSketch,
    points: ['A hand-drawn pitch with a game playing on it', 'Live figures, booking timetable and league on one page', 'Record results to move the table and fill the knockout'],
  },
  {
    id: 'world', title: 'The world clock', kind: 'Front page, green', href: 'world-clock.html', open: 'Open the world clock front page', Sketch: WorldSketch,
    points: ['Every site sits on a 24-hour band at its real local time', 'Drag the clock to watch games follow the evening', 'The headline counts players, teams, pitches and countries'],
  },
  {
    id: 'board', title: 'The live board', kind: 'Public display, dark', href: 'live-board.html', open: 'Open the live board', Sketch: BoardSketch,
    points: ['World totals for games, teams and players', 'Each game is its own small pitch with a headcount', 'Made for a screen at a site or an event'],
  },
  {
    id: 'local', title: 'The full site', kind: 'Full one-page site, dark', href: 'site/#live', open: 'Open the full one-page site', Sketch: SiteSketch,
    points: ['"Right now 89 people on 18 teams" as one live sentence', 'Nine games drawn as dark pitches with white and blue dots', 'Booking calendar and a league you play by matchday'],
  },
];

function load() {
  try {
    return { pick: '', notes: '', ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { pick: '', notes: '' };
  }
}

export default function App() {
  const [st, setSt] = useState(load);
  const [copied, setCopied] = useState('');
  const outRef = useRef(null);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* storage may be blocked */ }
  }, [st]);
  const text = 'My pick: ' + st.pick + (st.notes.trim() ? '\nNotes: ' + st.notes.trim() : '');

  const copy = () => {
    const fallback = () => {
      const s = getSelection();
      const r = document.createRange();
      r.selectNodeContents(outRef.current);
      s.removeAllRanges();
      s.addRange(r);
      setCopied('Selected. Press copy on your keyboard.');
    };
    try { navigator.clipboard.writeText(text).then(() => setCopied('Copied'), fallback); } catch { fallback(); }
  };

  return (
    <div className="wrap">
      <div className="logo"><Logo /></div>
      <h1>Pick a direction</h1>
      <p className="lead">Four takes on the love.fútbol front page and live display. Open each one, choose your favourite and add any notes. All of them are prototypes with sample data.</p>

      <form className="opts" onSubmit={(e) => e.preventDefault()}>
        {OPTIONS.map(({ id, title, kind, href, open, Sketch, points }) => (
          <article className="opt" key={id}>
            <a className="thumb" href={href} target="_blank" rel="noopener" aria-label={open}><Sketch /></a>
            <div className="body">
              <h2>{title}</h2>
              <p className="kind">{kind}</p>
              <ul>{points.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
            <div className="acts">
              <a className="btn" href={href} target="_blank" rel="noopener">Open</a>
              <label className="pick">
                <input type="radio" name="pick" value={title} checked={st.pick === title} onChange={() => setSt({ ...st, pick: title })} />
                Choose this one
              </label>
            </div>
            <Flag className="flagm" pole="#1D1D1B" />
          </article>
        ))}
      </form>

      <section className="choice">
        <div>
          <h2>{st.pick ? 'You chose ' + st.pick.toLowerCase() : 'Nothing chosen yet'}</h2>
          <p className="said">
            {st.pick
              ? 'Copy your choice and paste it into the chat to carry on from this direction.'
              : 'Choose an option above. Your choice is remembered in this browser.'}
          </p>
        </div>
        <div>
          <label htmlFor="notes">Notes, or parts to borrow from the others</label>
          <textarea
            id="notes"
            value={st.notes}
            onChange={(e) => setSt({ ...st, notes: e.target.value })}
            placeholder="For example: keep the pitch hero, but use the dark live section from the full site."
          />
          <div className="out" ref={outRef} hidden={!st.pick}>{st.pick ? text : ''}</div>
          <div className="row">
            <button className="btn solid" type="button" disabled={!st.pick} onClick={copy}>Copy my choice</button>
            <span className="said" aria-live="polite">{copied}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
