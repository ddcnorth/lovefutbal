/**
 * PostCSS plugin: keeps each page's stylesheet to its own page.
 *
 * Every page ships its own design (light, green, dark), and they reuse class names
 * such as .wrap, .btn and .live. In one app they would clash, so for
 * src/<page>/style.css this plugin:
 *   - prefixes every selector with body.page-<page> (body and :root become that selector),
 *   - renames @keyframes to <name>-<page> so animations with the same name don't collide.
 * The app sets <body class="page-<page>"> for whichever route is showing.
 */
const PAGE_FILE = /[\\/]src[\\/](chooser|pitch|world|board|site|home)[\\/]style\.css$/;

// Split a selector list on commas that are not inside brackets or parentheses.
function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of list) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// A page's rules apply under its body class (own route) or under a .scope-<page> wrapper (embedded in another page).
function scopeSelector(sel, [bodyScope, boxScope]) {
  if (sel === ':root' || sel === 'body') return `${bodyScope},${boxScope}`;
  if (sel === 'html') return `html:has(${bodyScope})`;
  if (sel.startsWith('body')) return `${bodyScope}${sel.slice(4)},${boxScope}${sel.slice(4)}`;
  return `${bodyScope} ${sel},${boxScope} ${sel}`;
}

const scopePages = () => ({
  postcssPlugin: 'scope-pages',
  Once(root) {
    const file = root.source?.input?.file || '';
    const m = file.match(PAGE_FILE);
    if (!m) return;
    const page = m[1];
    const scope = [`body.page-${page}`, `.scope-${page}`];
    const names = new Set();
    root.walkAtRules('keyframes', (at) => {
      names.add(at.params);
      at.params = `${at.params}-${page}`;
    });
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
      rule.selector = splitSelectors(rule.selector).map((s) => scopeSelector(s, scope)).join(',');
    });
    if (!names.size) return;
    // Whole names only: hyphens count as part of a name, so "pop" never matches inside "pop-flag".
    const longestFirst = [...names].sort((a, b) => b.length - a.length);
    const re = new RegExp(`(?<![\\w-])(${longestFirst.join('|')})(?![\\w-])`, 'g');
    root.walkDecls(/^animation(-name)?$/, (decl) => {
      decl.value = decl.value.replace(re, `$1-${page}`);
    });
  },
});
scopePages.postcss = true;

export default scopePages;
