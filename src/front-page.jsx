import Home from './home/App.jsx';
import Page from './shared/Page.jsx';

/** Standalone entry: Home, Book a pitch and Leagues, with no prototype navigation. */
export default function FrontPage() {
  return (
    <Page name="home" title="love.fútbol | Book a pitch, join a league, see who's playing">
      <Home />
    </Page>
  );
}
