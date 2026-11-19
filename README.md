# love.fútbol

A sample love.fútbol website with a front page, pitch booking and leagues. The production build contains this front page and its tabs. The older design options remain available as a separate prototype gallery.

## Build targets

| Command | App | Base path | Output |
|---|---|---|---|
| `npm run dev` | Standalone front page | `/` | Development server |
| `npm run build` | Standalone front page | `/` | `dist/` |
| `npm run build:portal` | Standalone front page for DDC North | `/p/lovefutbal/` | `dist/` |
| `npm run dev:prototypes` | All design options and prototype navigation | `/lovefutbal/` | Development server |
| `npm run build:prototypes` | All design options and prototype navigation | `/lovefutbal/` | `dist-prototypes/` |

Install with `npm ci`. `npm run preview`, `npm run preview:portal`, and `npm run preview:prototypes` serve their respective builds locally.

For another mount path, pass Vite's base option:

```bash
npm run build -- --base=/another/path/
```

Alternatively set `VITE_BASE_PATH` in the environment or a Vite environment file. `--base` takes precedence. Assets and the prototype router use the selected base. The standalone front page uses hash tabs (`#book`, `#leagues`), so tab links remain inside the deployed project path without server route rewrites.

## DDC North portal

1. Run `npm ci` and `npm run build:portal`.
2. Deploy only the contents of `dist/` as the portal project `lovefutbal`.
3. Register that project in the DDC North admin. Its public mount is `/p/lovefutbal/`.

For the repeatable local release process, see [Portal deployment](docs/portal-deployment.md) and `npm run deploy:portal`.

The production bundle does not import React Router, the `lf-switch` navigation, the chooser, pitch prototype, world clock, live board or full-site prototype. Those files are excluded at build time; the deployment does not merely hide their navigation with CSS.

## Modules

- `src/main.jsx`: shared React mounting, local fonts and document scrollbar.
- `src/front-page.jsx`: standalone front-page entry.
- `src/home/`: front page, booking and leagues under one shared header.
- `src/prototypes.jsx`: optional prototype gallery and route catalogue.
- `src/shared/`: reusable logo, simulated match engine, pitch drawing, page styling, rolling numbers, table animation and scrollbar.

Vite selects the app entry through an alias in `vite.config.js`. The default selects the standalone app; `--mode prototypes` selects the gallery. Each prototype page loads as its own chunk. `scope-pages.js` confines each page's stylesheet to its body class or embedded wrapper and gives its keyframes unique names.

The prototype switcher's height is measured only when the switcher is mounted. The front page's header, sticky booking controls and full-height layouts use a zero offset in standalone deployments.

## Overlay scrollbar

The shared document scrollbar uses [OverlayScrollbars](https://github.com/KingSora/OverlayScrollbars). Its thin track overlays the page and does not reserve a gutter. The page retains native document scrolling, including wheel, keyboard, touch, `window.scrollTo`, sticky headings and section navigation. The thumb can be dragged and the track clicked.

Browsers with native overlay scrollbars keep them. Forced-colors mode keeps the system scrollbar, reduced-motion mode disables scrollbar transitions, and a native fallback remains available if the browser cannot preserve document scrolling. No nested scrolling container is introduced.

## Prototype gallery

| Route | Source | Design |
|---|---|---|
| `/lovefutbal/` | `src/home/` | New front page |
| `/lovefutbal/options` | `src/chooser/` | Chooser for all design options |
| `/lovefutbal/pitch` | `src/pitch/` | Hand-drawn pitch, booking timetable and league |
| `/lovefutbal/world-clock` | `src/world/` | A 24-hour band of site local times |
| `/lovefutbal/live-board` | `src/board/` | Public live display |
| `/lovefutbal/site` | `src/site/` | Full one-page site |

`route-pages.js` copies the gallery's HTML to each route, the old `.html` addresses and `404.html` for static hosting. It runs only for the prototype build. The optional GitHub Pages workflow is manual and publishes `dist-prototypes/` to the existing prototype site at https://proto.amrad.ca/lovefutbal/.

All sites, teams, fixtures and figures are sample data. This is not an official love.fútbol site.
