import { useEffect, useId } from 'react';
import { useMatch } from './match.js';

const put = (x, y) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;

/** A hand-drawn pitch seen from above, with the match playing on it. Pass players={false} for the empty pitch and ball. */
export default function Pitch({ match, delay = 1300, players = true, label = 'A game in progress, seen from above' }) {
  const snap = useMatch(match);
  const id = 'wob' + useId().replace(/[^\w-]/g, '');
  useEffect(() => match.start(delay), [match, delay]);
  return (
    <svg className="pitch" viewBox="-8 -14 216 140" role="img" aria-label={label}>
      <defs>
        <filter id={id} x="-5%" y="-8%" width="110%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed={match.seed} />
          <feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect className="turf" width="200" height="120" rx="2" filter={`url(#${id})`} />
      <g className="lines" filter={`url(#${id})`}>
        <path pathLength="1" d="M0 0H200V120H0Z" />
        <path pathLength="1" d="M100 0V120" />
        <circle pathLength="1" cx="100" cy="60" r="17" />
        <path pathLength="1" d="M0 30H28V90H0" />
        <path pathLength="1" d="M200 30H172V90H200" />
        <path pathLength="1" d="M0 47H-5V73H0" />
        <path pathLength="1" d="M200 47H205V73H200" />
      </g>
      <g className="men">
        {players && snap.players.map((p, k) => (
          <circle
            key={k}
            r="3.8"
            className={'pl ' + (p.t ? 'b' : 'a')}
            style={{ opacity: p.vis ? 1 : 0, transform: put(p.x, p.y) }}
          />
        ))}
        <circle r="2.3" className="ball" style={{ transform: put(snap.ball.x, snap.ball.y) }} />
      </g>
    </svg>
  );
}
