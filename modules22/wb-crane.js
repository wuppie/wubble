/* Wubble: shader.se-style "camera crane" on every section handover — the scene tilts back in perspective, drifts
   up and leans while one section hands over to the next, then settles flat. UI chrome (site frame, footer, grain)
   stays put. Prepends perspective()+rotateX to each scene layer's own transform (no perspective on an ancestor,
   which would break position:fixed) and keeps whatever transform the other modules write.
   Progress sources: __wbRP hero→work, __wbRQ work→about, __wbRA about→services, __wbR3 services→reach. */
(() => {
  if (window.__wbCrane) return; window.__wbCrane = 1;
  const SKIP = '[data-site-frame],[data-footer],#site-grain,[data-wb-preloader],[data-preloader],.preloader,[data-hover-bubble],[data-break-badge],[data-wb-nofx],header,nav';
  let layers = [], scanAt = 0, was = false;
  const scan = () => { const iw = innerWidth, ih = innerHeight;
    const L = [...document.querySelectorAll('body *')].filter((el) => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.closest(SKIP) || el.style.zIndex === '95') return false;
      const cs = getComputedStyle(el); if (cs.position !== 'fixed' || cs.display === 'none') return false;
      const r = el.getBoundingClientRect(); return r.width >= iw * 0.8 && r.height >= ih * 0.8; });
    const keep = L.filter((el) => !L.some((o) => o !== el && o.contains(el)));
    layers.filter((el) => !keep.includes(el)).forEach(restore); layers = keep; };
  const restore = (el) => { if (el.__wbBase == null) return; if (el.style.transform === el.__wbLast) el.style.transform = el.__wbBase; el.style.transformOrigin = el.__wbTO; el.__wbBase = el.__wbLast = null; };
  const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const tick = () => { requestAnimationFrame(tick);
    const src = window.WB_CRANE_SOURCES || ['__wbRP', '__wbRQ', '__wbRA', '__wbR3'];
    let p = -1; for (const k of src) { const x = +window[k] || 0; if (x > 0.002 && x < 0.998) { p = x; break; } }
    if (p < 0) { if (was) { layers.forEach(restore); was = false; } return; }
    const now = performance.now(); if (!was || now - scanAt > 1500) { scan(); scanAt = now; }
    const A = window.WB_CRANE_AMOUNT ?? 1, e = ss(p), k = Math.sin(Math.PI * e);
    const tilt = k * 14 * A, rise = -k * 6 * A, lean = (e - 0.5) * k * 3 * A, zoom = 1 + k * 0.08 * A;
    const crane = 'perspective(1100px) translateY(' + rise.toFixed(3) + 'vh) rotateX(' + tilt.toFixed(3) + 'deg) rotateZ(' + lean.toFixed(3) + 'deg) scale(' + zoom.toFixed(4) + ')';
    layers.forEach((el) => {
      if (el.__wbBase == null) { el.__wbBase = el.style.transform; el.__wbTO = el.style.transformOrigin; }
      else if (el.style.transform !== el.__wbLast) el.__wbBase = el.style.transform; /* another module wrote a new transform */
      const base = el.__wbBase && el.__wbBase !== 'none' ? ' ' + el.__wbBase : '';
      el.style.transformOrigin = '50% 30%'; el.style.transform = crane + base; el.__wbLast = el.style.transform; });
    was = true;
  };
  setTimeout(() => requestAnimationFrame(tick), 2500); /* register after the other modules so we run last each frame */
})();
