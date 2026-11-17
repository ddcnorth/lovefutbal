import { StrictMode, Suspense, lazy, useEffect, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Switcher from './shared/Switcher.jsx';

// Each page is its own chunk, loaded when its route is first visited.
const Chooser = lazy(() => import('./chooser/App.jsx'));
const PitchPage = lazy(() => import('./pitch/App.jsx'));
const WorldPage = lazy(() => import('./world/App.jsx'));
const BoardPage = lazy(() => import('./board/App.jsx'));
const SitePage = lazy(() => import('./site/App.jsx'));

/**
 * Sets the body class that switches on this page's styles and the tab title,
 * then jumps to a #section if the address has one (the browser can't, because
 * the section didn't exist yet when the page loaded).
 */
function Page({ name, title, children }) {
  useLayoutEffect(() => {
    document.body.className = `page-${name}`;
    document.title = title;
  }, [name, title]);
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' }); // start each page at the top
  }, [name]);
  return children;
}

const ROUTES = [
  { path: '/', name: 'chooser', title: 'love.fútbol Design Options', Component: Chooser, old: 'index.html' },
  { path: '/pitch', name: 'pitch', title: 'love.fútbol Front Page', Component: PitchPage, old: 'pitch.html' },
  { path: '/world-clock', name: 'world', title: 'love.fútbol World Clock', Component: WorldPage, old: 'world-clock.html' },
  { path: '/live-board', name: 'board', title: 'love.fútbol Live Board', Component: BoardPage, old: 'live-board.html' },
  { path: '/site', name: 'site', title: "love.fútbol | Book a pitch, play a league, see who's playing", Component: SitePage, old: 'site/index.html' },
];

/** Sends an old .html address to its new route, keeping any #section. */
function Moved({ to }) {
  return <Navigate replace to={{ pathname: to, hash: window.location.hash }} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/lovefutbal">
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
  </StrictMode>,
);
