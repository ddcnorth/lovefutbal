import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Page from './shared/Page.jsx';
import Switcher from './shared/Switcher.jsx';

// This entire route catalogue is excluded from the standalone front-page build.
const HomePage = lazy(() => import('./home/App.jsx'));
const Chooser = lazy(() => import('./chooser/App.jsx'));
const PitchPage = lazy(() => import('./pitch/App.jsx'));
const WorldPage = lazy(() => import('./world/App.jsx'));
const BoardPage = lazy(() => import('./board/App.jsx'));
const SitePage = lazy(() => import('./site/App.jsx'));

const ROUTES = [
  { path: '/', name: 'home', title: 'love.fútbol | Book a pitch, join a league, see who\'s playing', Component: HomePage, old: 'home.html' },
  { path: '/options', name: 'chooser', title: 'love.fútbol Design Options', Component: Chooser, old: 'options.html' },
  { path: '/pitch', name: 'pitch', title: 'love.fútbol Front Page', Component: PitchPage, old: 'pitch.html' },
  { path: '/world-clock', name: 'world', title: 'love.fútbol World Clock', Component: WorldPage, old: 'world-clock.html' },
  { path: '/live-board', name: 'board', title: 'love.fútbol Live Board', Component: BoardPage, old: 'live-board.html' },
  { path: '/site', name: 'site', title: "love.fútbol | Book a pitch, play a league, see who's playing", Component: SitePage, old: 'site/index.html' },
];

/** Sends an old .html address to its new route, keeping any #section. */
function Moved({ to }) {
  return <Navigate replace to={{ pathname: to, hash: window.location.hash }} />;
}

export default function Prototypes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Switcher />
      <Suspense fallback={null}>
        <Routes>
          {ROUTES.map(({ path, name, title, Component, old }) => [
            <Route key={path} path={path} element={<Page name={name} title={title}><Component /></Page>} />,
            <Route key={old} path={'/' + old} element={<Moved to={path} />} />,
          ])}
          <Route path="*" element={<Moved to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
