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
  /* the header no longer blends, so the dot is plain: green while awake (09:00-18:00 Lombok time, same rule as the homepage), grey otherwise */
  const upd = () => { const hd = document.querySelector('[data-wb-site-header]'), dot = hd && (hd.querySelector('[data-wb-status-dot]') || [...hd.querySelectorAll('span')].find((s) => s.style.borderRadius === '50%')); if (!dot) return;
    const h = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', hourCycle: 'h23' }).format(new Date()), on = h >= 9 && h < 18;
    const bg = on ? '#2fd27a' : '#7a7a80', sh = on ? '0 0 6px 1px rgba(47,210,122,0.75)' : 'none'; if (dot.style.background !== bg) { dot.style.background = bg; dot.style.boxShadow = sh; } };
  upd(); setInterval(upd, 30000);
})();
