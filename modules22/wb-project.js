/* Wubble single project page (Webflow CMS template). Behaviour only, via attributes:
   [data-wb-project] root · [data-wb-enter="n"] page-enter stagger · [data-wb-enter-mask] rises out of its overflow:hidden parent
   [data-wb-reveal] fades/slides in when scrolled into view · [data-wb-parallax="0.12"] media drift · Lenis smooth scroll.
   wbProjectInit(openPromise) re-runs the entrance (page swaps call it after the new content is in). */
(() => {
  if (window.__wbProject) return; window.__wbProject = 1;
  const EZ = 'cubic-bezier(.16,1,.3,1)';
  const hide = (el, y) => { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translate3d(0,' + y + ',0)'; el.style.willChange = 'opacity, transform'; };
  const show = (el, ms, delay) => { el.style.transition = 'opacity ' + ms + 'ms ' + EZ + ' ' + delay + 'ms, transform ' + (ms + 200) + 'ms ' + EZ + ' ' + delay + 'ms'; el.style.opacity = '1'; el.style.transform = 'translate3d(0,0,0)'; };
  let lenis = null, io = null, px = [], ticking = false;
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const tick = (t) => { RAF(tick); if (lenis) lenis.raf(t); const vh = innerHeight;
    for (const el of px) { if (!el.isConnected) continue; const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) continue; const k = ((r.top + r.height / 2) - vh / 2) / vh, s = +el.dataset.wbParallax || 0.12; el.style.transform = 'translate3d(0,' + (k * s * -100).toFixed(2) + '%,0) scale(' + (1 + s) + ')'; } };
  /* leaving a project page: drop Lenis entirely so the next page (homepage / work) gets native scroll back */
  window.wbProjectStop = () => { if (lenis) { lenis.destroy(); lenis = null; window.__wbLenis = null; } if (io) io.disconnect(); px = []; };
  document.addEventListener('wb:leave', () => { if (document.querySelector('[data-wb-project]')) window.wbProjectStop(); });
  document.addEventListener('wb:swap', () => { if (document.querySelector('[data-wb-project]')) window.wbProjectInit(window.__wbInkOpen); });
  window.wbProjectInit = async (open) => {
    const root = document.querySelector('[data-wb-project]'); if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!lenis && window.Lenis && !reduce) { lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9 }); window.__wbLenis = lenis; }
    if (lenis) { lenis.scrollTo(0, { immediate: true }); lenis.stop(); } else scrollTo(0, 0);
    if (!ticking) { ticking = true; RAF(tick); }
    const enter = [...root.querySelectorAll('[data-wb-enter]')].sort((a, b) => (+a.dataset.wbEnter || 0) - (+b.dataset.wbEnter || 0));
    const masks = [...root.querySelectorAll('[data-wb-enter-mask]')], reveals = [...root.querySelectorAll('[data-wb-reveal]')];
    enter.forEach((el) => hide(el, '28px')); masks.forEach((el) => hide(el, '105%')); reveals.forEach((el) => hide(el, '70px'));
    px = [...root.querySelectorAll('[data-wb-parallax]')];
    /* intro starts level with the title (measured on the title's mask wrapper, which doesn't move during the entrance) */
    const align = () => { const sec = root.querySelector('[data-wb-align-intro]'), t = root.querySelector('[data-wb-enter-mask]'); if (!sec || !t) return;
      if (innerWidth <= 820) { sec.style.paddingTop = ''; return; } const top = t.parentElement.getBoundingClientRect().top + (window.scrollY || 0) - (sec.parentElement.getBoundingClientRect().top + (window.scrollY || 0));
      const lh = parseFloat(getComputedStyle(t).fontSize) || 0, cap = lh * 0.06; sec.style.paddingTop = Math.max(0, Math.round(top + cap)) + 'px'; };
    align(); if (!window.__wbAlignOn) { window.__wbAlignOn = 1; addEventListener('resize', () => { const r = document.querySelector('[data-wb-project]'); if (r) { const s = r.querySelector('[data-wb-align-intro]'), t = r.querySelector('[data-wb-enter-mask]'); if (s && t) { if (innerWidth <= 820) s.style.paddingTop = ''; else s.style.paddingTop = Math.round(t.parentElement.getBoundingClientRect().top - s.parentElement.getBoundingClientRect().top + (parseFloat(getComputedStyle(t).fontSize) || 0) * 0.06) + 'px'; } } }); }
    await (open || window.__wbInkOpen || Promise.resolve());
    masks.forEach((el, i) => show(el, 1100, i * 90)); enter.forEach((el, i) => show(el, 900, 160 + i * 80));
    if (io) io.disconnect();
    io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; show(e.target, 1100, (+e.target.dataset.wbReveal || 0) + (e.target.__first ? 320 : 0)); io.unobserve(e.target); }), { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    reveals.forEach((el) => { el.__first = el.getBoundingClientRect().top < innerHeight; io.observe(el); });
    setTimeout(() => lenis && lenis.start(), 500);
  };
  /* standalone page: scripts run before the page markup exists, so wait for it; hide the entrance elements, THEN let the ink open */
  if (!window.WB_SWAP_ROUTE && (!window.WB_INK_READY || window.__wbInkReadyRes)) {
    const outer = window.__wbInkReadyRes; /* page declared WB_INK_READY before wb-ink loaded: resolve that one */
    const mine = new Promise((res0) => { const res = () => { res0(); outer && outer(); }; let n = 0;
      const f = () => { const root = document.querySelector('[data-wb-project]'), h = root && root.querySelector('h1');
        if (!root || (h && /\{\{/.test(h.textContent))) { if (++n < 200) setTimeout(f, 20); else res(); return; }
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { window.wbProjectInit(); RAF(() => RAF(res)); }); };
      f(); });
    if (!outer) window.WB_INK_READY = mine;
  }
})();
