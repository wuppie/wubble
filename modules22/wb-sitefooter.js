/* Wubble site footer: the homepage footer on any page. Load before wb-contactmoon.js (with wb-ui.js, wb-ftmoon.js,
   wb-ascii-title.js, wb-glass.js, wb-glasstext.js, wb-waves.js).
   Webflow: the homepage footer markup with data-reveal="scroll" on [data-footer], and an empty
   [data-footer-spacer] (100vh tall) at the end of the page; scrolling into it reveals the footer.
   Adds the homepage's footer styles: content rises in staggered as the footer opens, html.wb-ft-on while it is open. */
(() => {
  window.WB_FOOTER_PROPS = Object.assign({ footerTitleScale: 1, footerTitleFx: 'None', footerMoonSpin: 0, footerOwnAstro: false } /* the walking astronaut is a homepage-only moment */, window.WB_FOOTER_PROPS || {});
  const st = document.createElement('style');
  st.textContent = '[data-ft-top] > *, [data-ft-bottom] > * { opacity:0; transform:translateY(28px); transition:opacity .9s cubic-bezier(.2,.7,0,1), transform 1.1s cubic-bezier(.2,.7,0,1); }'
    + ' html.wb-ft-on [data-ft-top] > *, html.wb-ft-on [data-ft-bottom] > * { opacity:1; transform:none; }'
    + ' html.wb-ft-on [data-ft-top] > :nth-child(2) { transition-delay:.12s; }'
    + [1, 2, 3, 4, 5].map((n) => ` html.wb-ft-on [data-ft-bottom] > :nth-child(${n}) { transition-delay:${(0.12 + n * 0.06).toFixed(2)}s; }`).join('');
  document.head.append(st);
  (function t() { requestAnimationFrame(t); document.documentElement.classList.toggle('wb-ft-on', (window.__wbFootP || 0) > 0.5); })();
  /* the header blends with "difference", so its green status dot turns pink over light backgrounds: give it the inverse
     colour there (difference turns that back into green), plain green over dark ones */
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m || (m[3] !== undefined && +m[3] < 0.5)) return -1; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
  setInterval(() => {
    const hd = document.querySelector('[data-wb-site-header]'), dot = hd && [...hd.querySelectorAll('span')].find((s) => s.style.borderRadius === '50%'); if (!dot) return;
    const r = dot.getBoundingClientRect(); let L = -1;
    for (const el of document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)) { if (hd.contains(el)) continue;
      for (let n = el; n && L < 0; n = n.parentElement) L = lum(getComputedStyle(n).backgroundColor); if (L >= 0) break; }
    if (L < 0) L = lum(getComputedStyle(document.body).backgroundColor);
    const light = L > 0.5, bg = light ? '#c42074' : '#2fd27a', sh = light ? 'rgba(196,32,116,0.75)' : 'rgba(47,210,122,0.75)';
    if (dot.style.background !== bg) { dot.style.background = bg; dot.style.boxShadow = '0 0 6px 1px ' + sh; }
  }, 300);
})();
