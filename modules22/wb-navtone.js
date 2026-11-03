/* Wubble header tone: the top bar turns dark on light backgrounds and light on dark ones, animated (site-wide).
   It looks at what is under the bar's middle line (page elements only: fixed effect canvases ignore the mouse and are skipped)
   and reads the first real background colour. Footer areas count as light. Sets html.wb-nav-ink; the CSS for it lives in the site head.
   Force a section with data-nav-tone="light" | "dark" in Webflow if the guess is wrong. */
(() => {
  if (window.__wbNavTone) return; window.__wbNavTone = 1;
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m || (m[3] != null && +m[3] < 0.5)) return null; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
  const hdrs = () => document.querySelectorAll('[data-wb-site-header],.home-nav_component');
  const toneAt = (x, y) => {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el.closest('[data-wb-site-header],.home-nav_component')) continue;
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
        const f = e.getAttribute && e.getAttribute('data-nav-tone'); if (f) return f === 'light';
        if (e.matches && e.matches('[data-footer]')) return true; /* the footer is the light scene */
        const l = lum(getComputedStyle(e).backgroundColor); if (l != null) return l > 0.6;
      }
    }
    return false;
  };
  let last = null, t = 0;
  const check = () => { const h = [...hdrs()].find((e) => e.offsetParent !== null || getComputedStyle(e).position === 'fixed'); if (!h) return;
    const r = h.getBoundingClientRect(), y = Math.min(innerHeight - 1, Math.max(1, r.top + r.height / 2));
    const light = toneAt(innerWidth * 0.5, y) && toneAt(innerWidth * 0.12, y); /* two points: one stray light element doesn't flip it */
    if (light !== last) { last = light; document.documentElement.classList.toggle('wb-nav-ink', light); } };
  const loop = (now) => { (window.__wbRawRAF || requestAnimationFrame)(loop); if (now - t < 120) return; t = now; check(); };
  (window.__wbRawRAF || requestAnimationFrame)(loop);
})();
