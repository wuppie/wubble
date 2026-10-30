/* Wubble pages (prototype router): home = hero + infinite work ribbon; about / services / contact are their own "pages".
   In the prototype the pages are windows onto the one scroll timeline (so every existing animation is reused);
   in Webflow they become real pages swapped by wb-swap.js. Navigation uses ?page=about|services|contact (home = no param).
   Menu (Webflow attributes): [data-wb-menu] overlay · [data-wb-menu-open] / [data-wb-menu-close] buttons ·
   [data-wb-menu-item] links (each with one inner element that slides up) · [data-wb-menu-fade] small extras.
   Tune page windows with window.WB_PAGE_RANGES = { about:[start,end], … } in viewport-heights from the about/services section top.
   Menu only (no page windows / scroll takeover): set window.WB_PAGES_MENU_ONLY = true before this script. */
(() => {
  if (window.__wbPagesInit) return; window.__wbPagesInit = 1;
  const MO = !!window.WB_PAGES_MENU_ONLY; /* menu only: no page windows, no wheel/scroll takeover (pages with their own scroll story) */
  const PAGES = ['home', 'about', 'services', 'contact'];
  const RANGE = Object.assign({ about: [0.7, 2.9], services: [4.3, 6.1], contact: [6.6, 99] }, window.WB_PAGE_RANGES || {});
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const q = (s) => document.querySelector(s), app = () => window.__wbApp;
  const vh = () => window.__svh || innerHeight;
  const pageOf = (u) => { const x = new URL(u, location.href); if (/about/i.test(decodeURIComponent(x.pathname.split('/').pop()))) return 'about'; if (x.href === location.href && window.WB_FORCE_PAGE) return window.WB_FORCE_PAGE; const p = x.searchParams.get('page'); return PAGES.includes(p) ? p : 'home'; };
  const isPageUrl = (u) => { const x = new URL(u, location.href); return x.pathname === location.pathname && !x.searchParams.has('p'); };
  const jump = (y) => { scrollTo(0, y); const L = window.__sliderLenis; if (L) L.scrollTo(y, { immediate: true, force: true }); };
  const els = () => ({ cta: q('[data-screen-label="Hero"]'), reach: q('[data-screen-label="Reach out"]'), sp: q('[data-footer-spacer]') });
  let page = 'home';
  const maxY = () => document.documentElement.scrollHeight - innerHeight;
  /* home: the scroll position where Work is fully in and pinned; the page never scrolls past it */
  const pinY = () => { const w = q('[data-screen-label="Work"]'); if (!w) return Infinity; const FX = Math.max(0, ((window.__wbApp && window.__wbApp.props && window.__wbApp.props.astroFlight) ?? 120)) / 100, heroDone = vh() * (2.4 + FX) + 4; /* hero exit + ribbon intro must have fully played */
    return Math.min(maxY(), Math.max(heroDone, w.getBoundingClientRect().top + scrollY + vh() * 0.45)); };
  let ribAcc = 0; /* how far the ribbon was driven past the pin; scrolling back up first unwinds it, then the page scrolls up to the hero */
  const homeInput = (d, e) => { const a = app(); if (page !== 'home' || !a || !a._ribNudge || a.state.page) return false; const L = window.__sliderLenis, py = pinY(), y = Math.max(scrollY, L ? L.targetScroll : 0);
    if (y < py - 2) return false; /* still travelling into the pin: normal (smooth) page scroll, clamped softly below */
    if (d < 0 && ribAcc <= 0) { ribAcc = 0; return false; }
    ribAcc = Math.max(0, ribAcc + d); a._ribNudge(d * (window.WB_RIBBON_WHEEL || 0.0075)); return true; };
  const pinClamp = () => { RAF(pinClamp); if (page !== 'home' || (app() && app().scrollLocked)) return; const py = pinY(), L = window.__sliderLenis;
    if (L) { if (L.targetScroll > py) L.targetScroll = py; /* ease into the pin, never snap */ if (L.animatedScroll > py + 1) jump(py); } else if (scrollY > py + 1) scrollTo(0, py); };
  if (!MO) RAF(pinClamp);
  const atEnd = () => { const L = window.__sliderLenis, m = maxY(); return scrollY >= m - 24 || (L && L.targetScroll >= m - 2); };
  const bounds = () => { if (page === 'home') return null; const c = els().cta; if (!c) return null; const t = c.getBoundingClientRect().top + scrollY, r = RANGE[page], m = maxY();
    return [Math.min(m, t + r[0] * vh()), Math.min(m, t + r[1] * vh())]; };
  /* home: everything after Work leaves the flow (parked off-screen, so its scroll maths reads "not reached yet") */
  const park = (e, on) => { if (!e) return; if (on) { if (!e.__wbPark) e.__wbPark = { p: e.style.position, t: e.style.top, mt: e.style.marginTop, v: e.style.visibility };
      Object.assign(e.style, { position: 'fixed', top: '300vh', left: '0', right: '0', marginTop: '0', visibility: 'hidden' }); }
    else if (e.__wbPark) { const o = e.__wbPark; Object.assign(e.style, { position: o.p, top: o.t, left: '', right: '', marginTop: o.mt, visibility: o.v }); e.__wbPark = null; } };
  const apply = (p) => { page = p; window.__wbPage = p; document.documentElement.setAttribute('data-wb-page', p);
    const { cta, reach, sp } = els(); [cta, reach, sp].forEach((e) => park(e, p === 'home'));
    const a = app(); if (a && a._sizeWork) a._sizeWork();
    document.querySelectorAll('[data-wb-menu-item]').forEach((m) => m.toggleAttribute('data-active', pageOf(m.href) === p)); };
  const snapScenes = (ms) => { window.__wbTwSnap = performance.now() + ms; };
  /* entrance: land a little before the page under the ink, then glide into it while the ink opens, so the page's own scroll animations play in */
  const GLIDE = Object.assign({ home: 0, about: 0.5, services: 0.45, contact: 0.5 }, window.WB_PAGE_GLIDE || {});
  let glide = null;
  const goTo = (p) => { apply(p); snapScenes(400); glide = null;
    if (p === 'home') { jump(0); return; } const b = bounds(); if (!b) return; const from = Math.max(0, b[0] - GLIDE[p] * vh()); jump(from); glide = { from, to: b[0], armed: true }; };
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  window.WB_SWAP_ENTER = () => { const g = glide; if (!g || !g.armed) return; g.armed = false; const t0 = performance.now(), D = window.WB_PAGE_GLIDE_MS || 1300;
    let el = 0, last = 0; const f = (now) => { if (glide !== g) return; el += last ? Math.min(33, now - last) : 0; last = now; const t = Math.min(1, el / D); jump(g.from + (g.to - g.from) * ease(t)); if (t < 1) RAF(f); else glide = null; }; RAF(f); }; /* stalls slow the glide instead of skipping it */
  /* pre-run the glide under the ink so every scroll-triggered init (CRT, services scrub, layouts) happens hidden */
  const tick = (f) => (document.hidden ? setTimeout(f, 16) : RAF(f)); /* hidden tab: timers, so a swap never hangs */
  const frames = (n) => new Promise((r) => { const f = () => (--n <= 0 ? r() : tick(f)); tick(f); });
  /* time parked on the landing spot under the ink, so polled/delayed arrival inits (terminal start, monitor, typing) fire hidden */
  const HOLD = Object.assign({ about: 300, services: 150, contact: 150 }, window.WB_PAGE_HOLD || {});
  const prerun = async () => { const g = glide; if (!g) return; for (let i = 1; i <= 8; i++) { jump(g.from + (g.to - g.from) * i / 8); snapScenes(120); await frames(2); } await frames(6); await new Promise((r) => setTimeout(r, HOLD[page] || 0)); jump(g.from); snapScenes(200); await frames(4); };
  /* keep each page inside its window */
  const clamp = () => { RAF(clamp); const b = bounds(); if (!b || glide || (app() && app().scrollLocked)) return; const y = scrollY; if (y < b[0] - 1) jump(b[0]); else if (y > b[1] + 1) jump(b[1]); };
  if (!MO) RAF(clamp);
  addEventListener('wheel', (e) => { if (MO) return; const b = bounds(), d = e.deltaY;
    if (b && glide) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (b) { if ((d < 0 && scrollY <= b[0] + 2) || (d > 0 && scrollY >= b[1] - 2)) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
    /* home: at the end of the page the ribbon keeps going forever */
    const dd = e.deltaMode === 1 ? d * 33 : d; if (homeInput(dd, e)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, { capture: true, passive: false });
  let ty = null;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { const a = app(); if (MO || ty == null || page !== 'home' || !a || !a._ribNudge) return; const y = e.touches[0].clientY, d = ty - y; ty = y;
    if (homeInput(d * 1.6, e) && e.cancelable) e.preventDefault(); }, { passive: false });
  /* router for wb-swap.js: ink covers → page changes → ink opens */
  const route = async (url) => { /* kept for single-document use; pages now navigate for real (like work → project) */
    if (!isPageUrl(url.href)) { location.href = url.href; await new Promise(() => {}); }
    menu(false, true); goTo(pageOf(url.href));
    await prerun();
  };
  /* full-screen menu */
  let open = false, tl = null;
  const menu = (on, instant) => { const M = q('[data-wb-menu]'); if (!M || (on === open && !instant)) return; open = on;
    const items = M.querySelectorAll('[data-wb-menu-item] > *'), fades = M.querySelectorAll('[data-wb-menu-fade]'), G = window.gsap;
    if (tl) tl.kill(); M.setAttribute('aria-hidden', on ? 'false' : 'true');
    M.style.pointerEvents = on ? '' : 'none'; /* a closing menu stops catching clicks at once, so a quick re-click reaches the open button under it */
    const L = window.__sliderLenis; if (L) on ? L.stop() : (!(app() && app().scrollLocked) && L.start());
    if (G && instant) { G.set(M, { visibility: on ? 'visible' : 'hidden', clipPath: on ? 'inset(0% 0 0% 0)' : 'inset(0% 0 100% 0)' }); G.set(items, { yPercent: on ? 0 : 110, y: 0 }); G.set(fades, { opacity: on ? 1 : 0, y: 0 }); return; }
    if (!G || instant) { M.style.visibility = on ? 'visible' : 'hidden'; M.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)'; items.forEach((i) => { i.style.transform = on ? 'none' : 'translate3d(0,110%,0)'; }); fades.forEach((f) => { f.style.opacity = on ? '1' : '0'; }); return; }
    tl = G.timeline();
    if (on) { M.style.visibility = 'visible';
      tl.fromTo(M, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.75, ease: 'expo.inOut' })
        .fromTo(items, { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.35)
        .fromTo(fades, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' }, 0.55);
    } else {
      const done = () => { if (!open) { M.style.visibility = 'hidden'; M.style.clipPath = 'inset(0 0 100% 0)'; } };
      tl.to(items, { yPercent: -110, duration: 0.4, stagger: 0.03, ease: 'power3.in' }).to(fades, { opacity: 0, duration: 0.3 }, 0)
        .fromTo(M, { clipPath: 'inset(0% 0 0% 0)' }, { clipPath: 'inset(0% 0 100% 0)', duration: 0.65, ease: 'expo.inOut', onComplete: done }, 0.25);
      setTimeout(done, 1300);
    } };
  window.wbMenu = menu;
  menu(false, true); /* closed from the very first frame on every page, not only once the homepage app has booted */
  addEventListener('pageshow', () => { open = true; menu(false, true); }); /* every (re)show of a page starts with the menu shut */
  addEventListener('pagehide', () => { open = true; menu(false, true); }); /* …and it's shut before the browser stores the page for back/forward */
  /* a menu link starts closing the menu at once, the ink covers on top of it */
  addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('[data-wb-menu] a[href]'); if (a && open) setTimeout(() => menu(false), 0); }, true);
  addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-wb-menu-open],[data-wb-menu-close]'); if (!t) return; e.preventDefault(); menu(t.hasAttribute('data-wb-menu-open') ? !open : false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) menu(false); });
  /* first load: deep link (?page=about) waits for the preloader to release scroll */
  const boot = () => { const a = app(); if (!a || !els().cta) { setTimeout(boot, 120); return; }
    const p = pageOf(location.href); apply(p); menu(false, true);
    /* every page is a real navigation now: everything boots under the arriving ink, which only opens once the page is warm */
    const wait = async () => { if (app().scrollLocked) { setTimeout(wait, 120); return; }
      if (p !== 'home') { goTo(p); await prerun(); }
      await frames(8); const V = document.querySelector('[data-wb-veil]'); if (V) { V.style.transition = 'opacity 0.6s ease'; V.style.opacity = '0'; setTimeout(() => V.remove(), 700); } if (window.__wbInkReadyRes) window.__wbInkReadyRes(); if (p !== 'home') window.WB_SWAP_ENTER(); };
    wait(); };
  if (!MO) boot();
})();
