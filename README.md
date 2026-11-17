# love.fútbol front page prototypes

Design prototypes for a love.fútbol web application: pitch booking, leagues and live activity stats. Built with Vite and React.

| Page | Source | What it is |
|---|---|---|
| `index.html` | `src/chooser/` | Chooser for the options below |
| `pitch.html` | `src/pitch/` | Front page with a live hand-drawn pitch, booking timetable and league |
| `world-clock.html` | `src/world/` | Front page built on a 24-hour band of site local times |
| `live-board.html` | `src/board/` | Public live display |
| `site/index.html` | `src/site/` | Full one-page site, with fonts and logo from `src/assets/` |

Shared pieces live in `src/shared/`: the logo, the simulated match engine and pitch drawing, rolling numbers, and the table-reorder animation.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173/lovefutbal/. `npm run build` writes the static site to `dist/`.

## Publishing

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/` to GitHub Pages at https://proto.amrad.ca/lovefutbal/. The repository's Pages source must be set to GitHub Actions.

All sites, teams, fixtures and figures are sample data. These pages are prototypes and are not an official love.fútbol site.
