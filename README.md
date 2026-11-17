# love.fútbol front page prototypes

Design prototypes for a love.fútbol web application: pitch booking, leagues and live activity stats. One React app (Vite + React Router).

| Route | Source | What it is |
|---|---|---|
| `/lovefutbal/` | `src/chooser/` | Chooser for the options below |
| `/lovefutbal/pitch` | `src/pitch/` | Front page with a live hand-drawn pitch, booking timetable and league |
| `/lovefutbal/world-clock` | `src/world/` | Front page built on a 24-hour band of site local times |
| `/lovefutbal/live-board` | `src/board/` | Public live display |
| `/lovefutbal/site` | `src/site/` | Full one-page site, with fonts and logo from `src/assets/` |

`src/main.jsx` holds the routes. Each page loads as its own chunk the first time it is visited. The old `.html` addresses (`pitch.html`, `site/index.html` and so on) redirect to the new routes.

Shared pieces live in `src/shared/`: the logo, the simulated match engine and pitch drawing, rolling numbers, and the table-reorder animation.

Each page keeps its own look. `scope-pages.js` is a small PostCSS step that confines `src/<page>/style.css` to `body.page-<page>` and gives its keyframes unique names, and the router sets that body class for the page on screen.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173/lovefutbal/. `npm run build` writes the static site to `dist/`, with a copy of `index.html` as `404.html` so GitHub Pages serves the app for any route.

## Publishing

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/` to GitHub Pages at https://proto.amrad.ca/lovefutbal/. The repository's Pages source must be set to GitHub Actions.

All sites, teams, fixtures and figures are sample data. These pages are prototypes and are not an official love.fútbol site.
