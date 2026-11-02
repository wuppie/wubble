/* Wubble float parallax (Locomotive Scroll style): elements drift at their own speed as the page scrolls, eased so they
   lag a little behind the scroll, with a slight turn.
   Webflow: data-wb-float="0.25" on any element (speed: + moves slower than the page, - moves faster). data-wb-float-rotate="12"
   (degrees over a screen of scroll). Reduced motion: no movement. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [];
  const scan = () => document.querySelectorAll('[data-wb-float]').forEach((el) => { if (el.__wf) return; el.__wf = { y: 0, r: 0 }; items.push(el); el.style.willChange = 'transform'; });
  const tick = () => { requestAnimationFrame(tick); const vh = innerHeight;
    for (const el of items) { if (!el.isConnected) continue; const s = el.__wf, b = el.getBoundingClientRect(); if (b.bottom < -vh * 0.5 || b.top > vh * 1.5) continue;
      const d = (b.top + b.height / 2 - s.y - vh / 2) / vh; // distance from screen centre, without our own offset
      const ty = d * vh * +(el.getAttribute('data-wb-float') || 0.2), tr = d * +(el.getAttribute('data-wb-float-rotate') || 0);
      s.y += (ty - s.y) * 0.08; s.r += (tr - s.r) * 0.08; el.style.transform = `translate3d(0,${s.y.toFixed(2)}px,0) rotate(${s.r.toFixed(2)}deg)`; } };
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); requestAnimationFrame(tick); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
