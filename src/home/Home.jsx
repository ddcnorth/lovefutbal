import Pitch from '../shared/Pitch.jsx';
import Figs, { Totals } from './Figs.jsx';

/** Front tab: the headline is the way in to each tab, next to a game that is on now. */
export default function Home({ match, game, world, go }) {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>
            <a href="#book" onClick={go('book')}>Book a pitch.</a>
            <a href="#leagues" onClick={go('leagues')}>Join a league.</a>
            {/* The Live tab is hidden for now, so this line no longer links to it. */}
            <span>See who's playing.</span>
          </h1>
          <p className="lede">
            Community pitches in several countries, open to reserve by the hour. Leagues play on the same ground, and every
            game shows up here while it is being played.
          </p>
          <div className="cta">
            <a className="btn" href="#book" onClick={go('book')}>Book a pitch</a>
            <a className="btn btn-line" href="#leagues" onClick={go('leagues')}>Register a team</a>
          </div>
        </div>
        <div className="stage">
          <figure className="onnow">
            <Pitch match={match} players={false} label={`The pitch at ${game.site}, seen from above`} />
          </figure>
        </div>
      </section>
      <section className="now" aria-label="Playing right now">
        <div className="wrap">
          <Figs world={world} />
          <div className="now-foot">
            <Totals world={world} />
          </div>
        </div>
      </section>
    </div>
  );
}
