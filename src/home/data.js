import { findPitch } from './pitches.js';

// The game on at six of the pitches. The pitches are real; the teams, scores and league hours are examples.
// `n` is players a side. `league` maps a weekday (0 = Sunday) to the hours a league match holds the pitch.
export const GAMES = [
  { at: ['Várzea Fria', 'Brazil'], a: 'Várzea Unidos', b: 'Leões do Capibaribe', n: 5, s: [2, 1], league: { 4: [18, 19], 6: [16, 17], 0: [16, 17, 18] } },
  { at: ['El Coyolito', 'Mexico'], a: 'Barrio Norte', b: 'Las Águilas', n: 7, s: [0, 0], league: { 3: [19, 20], 6: [17, 18] } },
  { at: ['Santa Inés', 'Colombia'], a: 'Santa Inés FC', b: 'Los Vecinos', n: 5, s: [3, 3], league: { 2: [18, 19], 6: [16, 17] } },
  { at: ['Villa Nueva', 'Guatemala'], a: 'Villa Nueva', b: 'Santa Fe', n: 6, s: [1, 0] },
  { at: ['Boulogne', 'Argentina'], a: 'Los Pibes', b: 'Club Unión', n: 5, s: [4, 2], league: { 3: [18, 19], 0: [17, 18] } },
  { at: ['Hissey Playground', 'United States'], a: 'Kensington Rovers', b: 'Norris Square United', n: 7, s: [1, 1] },
].map(({ at, ...g }) => {
  const p = findPitch(...at);
  return { ...g, id: p.id, site: p.name, place: p.place, country: p.country };
});
