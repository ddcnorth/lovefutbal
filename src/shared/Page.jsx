import { useEffect, useLayoutEffect } from 'react';

/** Apply a page's scoped styles and restore its initial scroll position. */
export default function Page({ name, title, children }) {
  useLayoutEffect(() => {
    const className = `page-${name}`;
    document.body.classList.add(className);
    document.title = title;
    return () => document.body.classList.remove(className);
  }, [name, title]);

  useEffect(() => {
    // Home uses hashes for tabs, while the prototype pages use section anchors.
    if (name === 'home' || !window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      let id = window.location.hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* Ignore a malformed URL escape. */ }
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    }
  }, [name]);

  return children;
}
