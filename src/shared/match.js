import { useSyncExternalStore } from 'react';
import { rng, still } from './util.js';

/**
 * A small simulated game: n-a-side, two teams, a ball that gets passed and shot.
 * It is an external store, so React components read it with useMatch().
 * Sample behaviour only; nothing here comes from a real game.
 */
export function createMatch({ n = 5, seed = 7, score = [0, 0] } = {}) {
  const r = rng(seed);
  const P = [];
  for (let t = 0; t < 2; t++) {
    for (let i = 0; i <= n; i++) {
      const out = n - 1;
      const cols = Math.ceil(out / 2);
      const k = i - 1;
      const col = k >> 1;
      let hx = i ? 36 + col * (56 / Math.max(cols, 1)) : 11;
      let hy = i ? (k % 2 ? 86 : 34) : 60;
      if (i && k === out - 1 && out % 2) hy = 60;
      if (i === n) {
        hx = 60;
        hy = 60;
      }
      if (t) hx = 200 - hx;
      P.push({ t, i, hx, hy, x: hx, y: 132, on: i < n, vis: false });
    }
  }
  // Players stand at their home spots; nothing moves them.
  P.forEach((p) => p.on && Object.assign(p, { x: p.hx, y: p.hy, vis: true }));

  let holder = P[1];
  let bx = 100;
  let by = 60;
  const sc = [...score];
  const listeners = new Set();
  const goalListeners = new Set();
  let snap;

  const publish = () => {
    snap = {
      players: P.map(({ t, x, y, vis }) => ({ t, x, y, vis })),
      ball: { x: bx, y: by },
      score: [...sc],
      count: P.filter((p) => p.on).length,
    };
    listeners.forEach((l) => l());
  };

  function step() {
    const on = P.filter((p) => p.on);
    const mates = on.filter((p) => p.t === holder.t && p !== holder);
    const opp = on.filter((p) => p.t !== holder.t);
    const adv = holder.t ? holder.x < 78 : holder.x > 122;
    let shot = false;
    if (adv && r() < 0.34) {
      shot = true;
      const goal = r() < 0.3;
      bx = holder.t ? (goal ? -2 : 5) : goal ? 202 : 195;
      by = 52 + r() * 16;
      if (goal) {
        sc[holder.t]++;
        goalListeners.forEach((l) => l([...sc]));
      }
      holder = opp.find((p) => !p.i) || opp[0];
    } else if (r() < 0.2 && opp.length) holder = opp[(r() * opp.length) | 0];
    else if (mates.length) {
      const a = mates[(r() * mates.length) | 0];
      const b = mates[(r() * mates.length) | 0];
      holder = (holder.t ? a.x < b.x : a.x > b.x) ? a : b;
    }
    const tx = shot ? bx : holder.hx + (holder.t ? -14 : 14);
    on.forEach((p) => {
      const f = p.i ? 0.3 : 0.05;
      p.x = Math.max(5, Math.min(195, p.hx + (tx - 100) * f + (r() - 0.5) * (p.i ? 16 : 3) + (p === holder && !shot ? (p.t ? -12 : 12) : 0)));
      p.y = Math.max(6, Math.min(114, p.hy + ((shot ? 60 : holder.hy) - p.hy) * (p.i ? 0.2 : 0.1) + (r() - 0.5) * (p.i ? 18 : 8)));
      p.vis = true;
    });
    if (!shot) {
      bx = holder.x + (holder.t ? -4 : 4);
      by = holder.y + 2;
    }
    publish();
  }

  /** One player joins or leaves. Returns the new headcount. */
  function toggle() {
    const t = r() < 0.5 ? 0 : 1;
    const team = P.filter((p) => p.t === t);
    const on = team.filter((p) => p.on);
    const off = team.filter((p) => !p.on);
    if (off.length && (on.length < n || r() < 0.5)) Object.assign(off[0], { on: true, vis: true, x: off[0].hx, y: off[0].hy });
    else {
      const p = on[on.length - 1];
      if (p.i) Object.assign(p, { on: false, vis: false, x: p.hx, y: 132 });
    }
    publish();
    return snap.count;
  }

  /** Kept so callers don't change: players no longer move, so there is nothing to start. */
  const start = () => () => {};

  publish();
  return {
    seed,
    start,
    toggle,
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
    onGoal: (l) => (goalListeners.add(l), () => goalListeners.delete(l)),
    get: () => snap,
  };
}

export function useMatch(match) {
  return useSyncExternalStore(match.subscribe, match.get);
}
