import { rng } from '../shared/util.js';

// Sample league. Names, fixtures and results are examples.
export const TEAMS = ['Várzea Unidos', 'Leões do Capibaribe', 'Estrela do Morro', 'Santo Amaro FC', 'Beira Rio', 'Unidas da Torre'];
const WHEN = ['Thu 18:00, Pitch 1', 'Thu 19:00, Pitch 1', 'Thu 19:00, Pitch 2', 'Sat 16:00, Pitch 1', 'Sat 16:00, Pitch 2', 'Sat 17:00, Pitch 1', 'Sun 16:00, Pitch 1', 'Sun 17:00, Pitch 1', 'Sun 18:00, Pitch 1'];
export const SF_PAIRS = [[0, 3], [1, 2]];

/** Draws a round robin, plays the first three rounds, and queues the rest plus the knockout. */
export function newSeason(k = 1) {
  const r = rng(11 + k * 5);
  const idx = [0, 1, 2, 3, 4, 5];
  const rounds = [];
  for (let j = 0; j < 5; j++) {
    rounds.push([[idx[0], idx[5]], [idx[1], idx[4]], [idx[2], idx[3]]]);
    idx.splice(1, 0, idx.pop());
  }
  const goal = () => {
    const v = r();
    return v < 0.25 ? 0 : v < 0.55 ? 1 : v < 0.8 ? 2 : v < 0.93 ? 3 : 4;
  };
  const played = [];
  const queue = [];
  rounds.forEach((rd, j) =>
    rd.forEach(([a, b]) => {
      if (j < 3) played.push({ a, b, s: [goal(), goal()] });
      else queue.push({ type: 'league', a, b });
    }),
  );
  queue.push({ type: 'sf', k: 0 }, { type: 'sf', k: 1 }, { type: 'final' });
  queue.forEach((q, i) => (q.when = WHEN[i]));
  return { k, goal, played, queue, sf: [null, null], fin: null, log: [] };
}

export function table(L) {
  const T = TEAMS.map((name, i) => ({ i, name, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  L.played.forEach((m) => {
    const A = T[m.a];
    const B = T[m.b];
    A.p++; B.p++;
    A.gf += m.s[0]; A.ga += m.s[1]; B.gf += m.s[1]; B.ga += m.s[0];
    if (m.s[0] > m.s[1]) { A.w++; B.l++; A.pts += 3; }
    else if (m.s[0] < m.s[1]) { B.w++; A.l++; B.pts += 3; }
    else { A.d++; B.d++; A.pts++; B.pts++; }
  });
  return T.sort((x, y) => y.pts - x.pts || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf || x.name.localeCompare(y.name));
}

export const winner = (m) => (m && m.s ? (m.s[0] > m.s[1] ? m.a : m.b) : null);

/** Records the next queued result and returns a new league state. Called from an event handler. */
export function playNext(L) {
  const [q, ...queue] = L.queue;
  if (!q) return newSeason(L.k + 1);
  const T = table(L);
  const g = L.goal;
  const next = { ...L, queue, played: [...L.played], sf: [...L.sf], log: [...L.log] };
  if (q.type === 'league') {
    const m = { a: q.a, b: q.b, s: [g(), g()] };
    next.played.push(m);
    next.log.push(`${TEAMS[m.a]} ${m.s[0]}–${m.s[1]} ${TEAMS[m.b]}`);
  } else {
    let a;
    let b;
    if (q.type === 'sf') {
      const pr = SF_PAIRS[q.k];
      a = T[pr[0]].i;
      b = T[pr[1]].i;
    } else {
      a = winner(L.sf[0]);
      b = winner(L.sf[1]);
    }
    let s;
    do s = [g(), g()];
    while (s[0] === s[1]);
    const m = { a, b, s };
    if (q.type === 'sf') next.sf[q.k] = m;
    else next.fin = m;
    next.log.push(`${q.type === 'sf' ? 'Semi-final' : 'Final'}: ${TEAMS[a]} ${s[0]}–${s[1]} ${TEAMS[b]}`);
  }
  return next;
}
