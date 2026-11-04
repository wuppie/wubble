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
    /* [data-wb-video="url"]: plays that mp4 inside the element (CMS-bound); empty value keeps the box as a placeholder */
    root.querySelectorAll('[data-wb-video]').forEach((el) => { const u = (el.getAttribute('data-wb-video') || '').trim(); if (!u || el.querySelector('video')) return;
      const v = document.createElement('video'); v.className = 'project_image'; v.crossOrigin = 'anonymous'; v.src = u; v.muted = v.loop = v.autoplay = v.playsInline = true; v.setAttribute('playsinline', ''); el.appendChild(v); v.play().catch(() => {}); });
    /* media panels without a video or an image (empty CMS field) are hidden instead of showing an empty grey panel */
    root.querySelectorAll('.project_media').forEach((m) => { const i = m.querySelector('img'); if (!m.querySelector('video') && !(i && (i.getAttribute('src') || '').trim())) m.style.display = 'none'; });
    root.querySelectorAll('.project_gallery').forEach((g) => { if (![...g.children].some((c) => c.style.display !== 'none')) g.style.display = 'none'; });
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

/* [data-wb-stack] (a tall wrapper; its card row is pinned with position:sticky in Webflow) with [data-wb-stack-card] children:
   the cards start stacked in the middle with a slight fan and glide out to their own places while the wrapper scrolls by.
   Phones (< 768px) keep the plain layout. Transforms only, eased every frame, so it stays smooth. */
(() => {
  if (window.__wbStack) return; window.__wbStack = 1;
  /* every [data-wb-stack] on the page is its own group (plans, packages, ...) with its own progress */
  let G = [];
  const find = () => [...document.querySelectorAll('[data-wb-stack]')].map((root) => ({ root, cards: [...root.querySelectorAll('[data-wb-stack-card]')], dx: [], v: 0 })).filter((S) => S.cards.length);
  const measure1 = (S) => { S.cards.forEach((c) => { c.style.transform = ''; c.__st = ''; }); const rs = S.cards.map((c) => c.getBoundingClientRect()), mid = rs.reduce((a, r) => a + r.left + r.width / 2, 0) / rs.length; S.dx = rs.map((r) => mid - (r.left + r.width / 2)); };
  const reset1 = (S) => S.cards.forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; c.__st = ''; });
  const measure = () => G.forEach(measure1);
  const boot = () => { G.forEach(reset1); G = find(); measure(); };
  addEventListener('resize', measure);
  document.addEventListener('wb:swap', boot);
  let last = performance.now();
  const step = (S, dt) => {
    if (innerWidth < 768) { if (S.on) { S.on = false; reset1(S); } return; } if (!S.on) { S.on = true; measure1(S); }
    const r = S.root.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > innerHeight * 2) return; /* far off screen: nothing to animate */
    const row = S.cards[0].parentElement, st = parseFloat(getComputedStyle(row).top) || 0, pv = row.previousElementSibling, oy = pv ? pv.getBoundingClientRect().bottom - r.top + (parseFloat(getComputedStyle(S.root).rowGap) || 0) : 0, /* the row's own offsetTop includes its sticky shift */ travel = Math.max(1, r.height - oy - row.offsetHeight);
    const p = Math.max(0, Math.min(1, (st - oy - r.top + innerHeight * 0.1) / (travel * 0.9))); /* spread runs while the row is pinned and finishes just before the pin releases */
    S.v += (p - S.v) * (1 - Math.exp(-dt * 7)); if (Math.abs(p - S.v) < 0.0005) S.v = p;
    const e = S.v < 0.5 ? 4 * S.v * S.v * S.v : 1 - Math.pow(-2 * S.v + 2, 3) / 2, k = 1 - e, n = S.cards.length, c0 = (n - 1) / 2;
    S.cards.forEach((c, i) => { const o = i - c0, d = Math.abs(o);
      const tf = k < 0.0005 ? '' : 'translate3d(' + (S.dx[i] * k).toFixed(1) + 'px,' + (d * 18 * k).toFixed(1) + 'px,0) rotate(' + (o * 4 * k).toFixed(2) + 'deg) scale(' + (1 - 0.05 * d * k).toFixed(4) + ')';
      if (c.__st !== tf) { c.__st = tf; c.style.transform = tf; c.style.zIndex = tf ? String(10 - Math.round(d)) : ''; } /* only on change: spread cards keep their hover tilt (data-wb-reflect) */ }); };
  const tick = (now) => { requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; G.forEach((S) => { if (S.root.isConnected) step(S, dt); }); };
  const start = () => { boot(); requestAnimationFrame(tick); if (document.fonts) document.fonts.ready.then(measure); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start();
})();
