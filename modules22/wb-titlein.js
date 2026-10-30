/* Wubble title intro: hero titles animate in on page load (after the ink opens). Needs GSAP.
   Webflow: data-wb-title-in on an element.
   - On a [data-wb-blurword] section: its blurred title canvas comes in from a heavy blur, slightly larger and lower.
   - On a text element: its letters rise in one by one from below a clip line.
   data-delay="0.3" (s) */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = (el) => {
    const g = window.gsap; if (!g || el.__wbti) return; el.__wbti = 1; const D = +(el.getAttribute('data-delay') || 0.3);
    if (el.hasAttribute('data-wb-blurword')) { // the canvas appears once wb-blurword has drawn it
      let n = 0; const wait = () => { const c = el.querySelector(':scope > canvas'); if (!c) { if (++n < 60) setTimeout(wait, 100); return; }
        if (still) return; g.fromTo(c, { opacity: 0, filter: 'blur(28px)', scale: 1.12, yPercent: 5 }, { opacity: 1, filter: 'blur(0px)', scale: 1, yPercent: 0, duration: 2, delay: D, ease: 'expo.out', clearProps: 'filter,transform' }); };
      wait(); return; }
    const txt = el.textContent; el.setAttribute('aria-label', txt.trim()); el.textContent = '';
    const chars = [...txt].map((c) => { const w = document.createElement('span'), s = document.createElement('span'); w.setAttribute('aria-hidden', 'true');
      w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em;margin-bottom:-0.08em;'; s.style.display = 'inline-block'; s.textContent = c === ' ' ? ' ' : c; w.append(s); el.append(w); return s; });
    if (!still) g.fromTo(chars, { yPercent: 120, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 1.2, delay: D, ease: 'expo.out', stagger: 0.025 });
  };
  const start = () => { const run = () => document.querySelectorAll('[data-wb-title-in]').forEach(go);
    // wait for the ink cover to open, so the intro is seen
    let n = 0; const ready = () => { if ((window.__wbInkBusy && (window.__wbInkCov || 0) > 0.6) && ++n < 40) setTimeout(ready, 100); else run(); }; ready(); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
  document.addEventListener('wb:swap', start);
})();
