/* Wubble V22: on-scroll text scramble (Codrops "On-Scroll Text Motion" / ScrambleText style).
   IntersectionObserver-driven (no polling); edits only the existing text node, so React/Webflow-owned nodes are never replaced.
   Webflow: opt out with data-wb-noscramble on the element or a parent; opt in explicitly with data-wb-scramble. */
(() => {
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const SKIP = '[data-wb-noscramble],a,[data-gt],[data-gw],[data-term],[data-hero-front],[data-panel],[data-astro-global],h1,script,style,svg,canvas,[aria-hidden="true"],input,textarea,select,button';
  const SEL = 'p,li,a,span,h2,h3,h4,h5,h6,label,small,strong,em,dt,dd,figcaption,[data-wb-scramble]';
  const run = (el) => {
    const P = window.__wbScr || {}; if (P.on === false || el.__busy) return;
    const tn = el.firstChild; if (!tn || tn.nodeType !== 3 || tn.nextSibling) return;
    const txt = el.__orig || tn.data; if (!txt || txt.trim().length < 2 || txt.length > 420) return; el.__orig = txt;
    const d = Math.min(P.max ?? 1.4, (P.base ?? 0.6) + txt.length * 0.006) * 1000, t0 = performance.now(); el.__busy = 1;
    const step = () => {
      if (tn.parentNode !== el) { el.__busy = 0; el.__orig = null; return; }
      const k = (performance.now() - t0) / d; if (k >= 1 || document.hidden) { tn.data = txt; el.__busy = 0; return; }
      const rev = Math.floor(txt.length * k), shw = Math.min(txt.length, Math.ceil(txt.length * Math.min(1, k * 2.2 + 0.05)));
      let s = txt.slice(0, rev); for (let i = rev; i < shw; i++) { const c = txt[i]; s += c === ' ' || c === '\n' ? c : CH[(Math.random() * CH.length) | 0]; }
      tn.data = s; requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) run(e.target); }, { threshold: 0.01 });
  const seen = new WeakSet();
  const scan = () => document.querySelectorAll(SEL).forEach((el) => {
    if (seen.has(el)) return; const c = el.childNodes; if (c.length !== 1 || c[0].nodeType !== 3 || el.closest(SKIP)) return;
    seen.add(el); io.observe(el);
  });
  const start = () => { scan(); setInterval(scan, 4000); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(start, 1200), { once: true }); else setTimeout(start, 1200);
})();
