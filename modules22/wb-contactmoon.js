/* Wubble contact page = the homepage footer, running the homepage's OWN footer code (wb-ui initFooterLetters,
   wb-ftmoon initFooterMoon, wb-ascii-title) with the homepage's footer settings — nothing re-implemented.
   The homepage drove the footer by scrolling (a spacer scrolling into view); here a hidden spacer is animated
   from "below the fold" to "fully in" right after the ink opens, so the moon + astronaut play exactly the same.
   Webflow: same footer markup as the homepage ([data-footer] with [data-ft-time], [data-fl-word], [data-ft-bottom],
   [data-fl-gl]) + scripts wb-ui.js, wb-astro.js, wb-ftmoon.js, wb-ascii-title.js, then this one.
   Settings: window.WB_FOOTER_PROPS = { footerMoonSize: 2.4, … } (same names as the homepage Tweaks). Duration: data-duration on [data-footer] (s). */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const PROPS = { footerScene: '3D Moon', footerMoon: true, footerMoonSize: 2.4, footerMoonTop: 0, footerAstroH: 0.5, footerMoonCover: 0.45, footerMoonBright: 0.12, footerBend: 0, footerAstroSink: 0.03,
    footerOwnAstro: true, footerMoonLight: 'Sun', footerSunAngle: -18, footerSunHeight: 10, footerSunStrength: 4.2, footerMoonBump: 7, footerWalk: true, footerWalkSpeed: 0.12, footerWalkDelay: 3, footerWalkAnim: 0.8,
    footerMoonSpin: 0.012, footerMoonDetail: 0, footerMoonTile: 6, footerMoonExposure: 0.9, footerMoonDither: false, footerMoonMetal: 0.85, footerMoonRough: 0.42, footerMoonEnv: 0.9, footerMoonTone: 0.28,
    footerTitleFx: 'ASCII', asciiOpacity: 0.5, asciiSpeed: 0.3, asciiWave: 0.6, asciiFlicker: 1.2, asciiEase: 0.025, asciiTilt: 0.5, footerTitleScale: 1.6, footerHover: 'None', footerAstro: false, astroLook: 'Textured', ditherStyle: false, asciiCell: 9 };
  const clip = (n) => window.WB_CLIPS && window.WB_CLIPS[n] ? Promise.resolve() : new Promise((res) => { const s = document.createElement('script'); s.src = (window.WB_ASSETS || './') + 'modules22/wb-clip-' + n + '.min.js'; s.onload = s.onerror = () => res(); document.head.appendChild(s); });
  const start = async () => {
    const ft = document.querySelector('[data-footer]'); if (!ft || ft.__wbContact) return; const W = window.WBM;
    if (!W || !W.initFooterLetters || !W.initFooterMoon) return; ft.__wbContact = 1;
    await Promise.all([clip('look'), clip('walk')]);
    /* scroll stand-in: the homepage footer reveal = this spacer's top going from innerHeight → 0 */
    let sp = document.querySelector('[data-footer-spacer]');
    if (!sp) { sp = document.createElement('div'); sp.setAttribute('data-footer-spacer', ''); sp.setAttribute('aria-hidden', 'true'); sp.style.cssText = 'position:fixed;left:0;width:1px;height:1px;top:100vh;pointer-events:none;visibility:hidden;'; document.body.appendChild(sp); }
    const C = Object.assign({}, W, { props: Object.assign({}, PROPS, window.WB_FOOTER_PROPS || {}), dead: false, whenNear: (a, b, fn) => fn() });
    C.initFooterLetters(); if (C.initAsciiTitle) C.initAsciiTitle();
    /* bigger title without cutting letters off: the word keeps its full-width fit, the letters are stretched taller
       (scaleY from the baseline) and the word grows upward to make room, so nothing is clipped */
    { const w = ft.querySelector('[data-fl-word]'), S = +(ft.getAttribute('data-title-scale') || C.props.footerTitleScale || 1);
      const big = () => { if (S === 1) return; const fs = parseFloat(w.style.fontSize) || parseFloat(getComputedStyle(w).fontSize), lh = fs * 0.82, maxS = Math.max(1, (innerHeight * 0.8) / lh), s = Math.min(S, maxS);
        w.style.paddingTop = ((s - 1) * lh).toFixed(1) + 'px';
        w.querySelectorAll('[data-fl]').forEach((sp) => { sp.style.transformOrigin = '0% 100%'; sp.style.transform = 'scaleY(' + s.toFixed(3) + ')'; }); };
      new MutationObserver(big).observe(w, { attributes: true, attributeFilter: ['style'] }); addEventListener('resize', big); big(); setTimeout(big, 700); }
    const dur = (parseFloat(ft.getAttribute('data-duration')) || 2.8) * 1000; let t0 = null;
    const io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const tick = (now) => { if (!ft.isConnected) return; RAF(tick);
      if (t0 == null) { if (window.__wbInkBusy && (window.__wbInkCov || 0) > 0.6) return; t0 = now + 150; }
      const p = io(Math.max(0, Math.min(1, (now - t0) / dur))); sp.style.top = ((1 - p) * innerHeight).toFixed(1) + 'px'; };
    RAF(tick);
  };
  let n = 0; const poll = () => { start().catch((e) => console.warn('[contact]', e)); if (++n < 60 && !(document.querySelector('[data-footer]') || {}).__wbContact) setTimeout(poll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
