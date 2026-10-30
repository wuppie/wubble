/* Wubble page swapping (Barba-style): the ink covers, the new page's content is swapped in without a reload,
   history is updated, then the ink opens from the same spot. Back/forward work too.
   Two modes:
   1) window.WB_SWAP_ROUTE(url) → promise   (in-page router, e.g. one Design Component that owns several views)
   2) Webflow: every page has one [data-wb-container] (+ data-wb-namespace="home|work|project").
      - The next page is fetched, its container replaces the current one, <title> + data-wf-page update, Webflow IX2 re-inits,
        page scripts the new page needs (and this page didn't load) are loaded once, then 'wb:swap' fires
        ({detail:{namespace,url,fresh}}) so page modules can (re)start. 'wb:leave' fires on the old page first.
      - Keep-alive: a container with data-wb-keep (default for namespace home + work) is NOT thrown away. Its node, scroll
        position and every animation loop it started are frozen; coming back reinserts the same node and resumes the loops,
        so the homepage / work 3D is instantly there (no reload, no black frame).
      - Body-level layers a page created itself (WebGL canvases etc.) are hidden while away. Mark shared layers that must stay
        visible on every page with data-wb-persist (the ink + hover-distort canvases already are).
   Links opt in with data-wb-swap (or data-wb-ink); external / new-tab links are left alone. */
(() => {
  if (window.wbSwapGo) return;
  /* ---- animation-loop ownership: every rAF chain belongs to the page (namespace) that started it ---- */
  const rawRAF = window.requestAnimationFrame.bind(window), rawCAF = window.cancelAnimationFrame.bind(window);
  window.__wbRawRAF = rawRAF; /* shared modules (ink, distort, project) use this so they never get frozen */
  let owner = '', running = null; const parked = new Map(); /* ns → [{cb, id}] */ const frozen = new Set(); let seq = 0; const map = new Map();
  window.requestAnimationFrame = (cb) => { const ns = running ?? owner, id = ++seq;
    if (frozen.has(ns)) { (parked.get(ns) || parked.set(ns, []).get(ns)).push({ cb, id }); return id; }
    map.set(id, rawRAF((t) => { map.delete(id); const prev = running; running = ns; try { cb(t); } finally { running = prev; } })); return id; };
  window.cancelAnimationFrame = (id) => { const r = map.get(id); if (r != null) { rawCAF(r); map.delete(id); return; } for (const l of parked.values()) { const i = l.findIndex((x) => x.id === id); if (i >= 0) l.splice(i, 1); } };
  const freeze = (ns) => { frozen.add(ns); try { window.gsap && gsap.ticker && ns === 'home' && gsap.ticker.sleep && gsap.ticker.sleep(); } catch (e) {} };
  const thaw = (ns) => { frozen.delete(ns); const l = parked.get(ns) || []; parked.delete(ns); const prev = running; running = ns; l.forEach((x) => window.requestAnimationFrame(x.cb)); running = prev;
    try { window.gsap && gsap.ticker && gsap.ticker.wake && gsap.ticker.wake(); } catch (e) {} };

  const cache = new Map(), kept = new Map(); /* path → {node, ns, y, layers, wfPage} */
  const key = (u) => { const x = new URL(u, location.href); return x.pathname + x.search; };
  const fetchPage = (url) => { const k = key(url); if (!cache.has(k)) cache.set(k, fetch(url, { credentials: 'same-origin' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }).catch((e) => { cache.delete(k); throw e; })); return cache.get(k); };
  const nsOf = (c) => (c && c.dataset.wbNamespace) || '';
  const keepable = (c) => c.hasAttribute('data-wb-keep') ? c.getAttribute('data-wb-keep') !== 'false' : /^(home|work)$/.test(nsOf(c));
  const isShared = (el) => el.matches('[data-wb-container],[data-wb-persist],script,style,link,noscript,template') || el.id === 'wb-ink';
  const loaded = () => new Set([...document.scripts].map((s) => s.src).filter(Boolean));
  const loadScript = (s) => new Promise((res) => { const n = document.createElement('script'); [...s.attributes].forEach((a) => n.setAttribute(a.name, a.value)); n.async = false; n.onload = n.onerror = () => res(); document.body.appendChild(n); });
  const reinitWebflow = (wfPage) => { if (wfPage) document.documentElement.setAttribute('data-wf-page', wfPage);
    try { const W = window.Webflow; if (W && W.destroy) { W.destroy(); W.ready && W.ready(); const ix = W.require && W.require('ix2'); ix && ix.init && ix.init(); } } catch (e) { console.warn('[swap] webflow re-init', e); } };
  const leave = (cur) => { const ns = nsOf(cur), url = location.href;
    document.dispatchEvent(new CustomEvent('wb:leave', { detail: { namespace: ns, url } }));
    if (!keepable(cur)) return null;
    const layers = [...document.body.children].filter((el) => !isShared(el) && el.style.display !== 'none');
    layers.forEach((el) => { el.__wbDisp = el.style.display; el.style.display = 'none'; });
    freeze(ns); return { node: cur, ns, y: scrollY, layers, wfPage: document.documentElement.getAttribute('data-wf-page'), title: document.title };
  };
  const swapDOM = async (url, fromKey) => {
    const cur = document.querySelector('[data-wb-container]'); if (!cur) throw new Error('no [data-wb-container]');
    const k = key(url), back = kept.get(k);
    if (back) { /* keep-alive return: same node, same scroll, loops resume */
      const st = leave(cur); if (st) kept.set(fromKey, st);
      cur.replaceWith(back.node); kept.delete(k); document.title = back.title;
      back.layers.forEach((el) => { el.style.display = el.__wbDisp || ''; }); owner = back.ns;
      reinitWebflow(back.wfPage); scrollTo(0, back.y); thaw(back.ns);
      try { window.ScrollTrigger && ScrollTrigger.update(); } catch (e) {}
      document.dispatchEvent(new CustomEvent('wb:swap', { detail: { namespace: back.ns, url, fresh: false } })); return;
    }
    const html = await fetchPage(url), doc = new DOMParser().parseFromString(html, 'text/html');
    const next = doc.querySelector('[data-wb-container]'); if (!next) throw new Error('no [data-wb-container] on ' + url);
    const st = leave(cur); if (st) kept.set(fromKey, st);
    document.title = doc.title; const imp = document.importNode(next, true); owner = nsOf(imp);
    cur.replaceWith(imp); scrollTo(0, 0);
    /* page-level scripts the new page needs that aren't loaded yet (skip Webflow core + jQuery, already present) */
    const have = loaded(), need = [...doc.querySelectorAll('script[src]')].filter((s) => !next.contains(s) && !have.has(s.src) && !/webflow\.|jquery/i.test(s.src));
    for (const s of need) await loadScript(s);
    imp.querySelectorAll('script').forEach((s) => { const n = document.createElement('script'); [...s.attributes].forEach((a) => n.setAttribute(a.name, a.value)); n.textContent = s.textContent; s.replaceWith(n); });
    reinitWebflow(doc.documentElement.getAttribute('data-wf-page'));
    document.dispatchEvent(new CustomEvent('wb:swap', { detail: { namespace: owner, url, fresh: true } }));
  };
  const frames = (n) => new Promise((r) => { const nx = (f) => (document.hidden ? setTimeout(f, 16) : rawRAF(f)); const f = () => (--n <= 0 ? r() : nx(f)); nx(f); });
  /* hold the reveal until the new page renders smoothly (shader compiles, texture uploads and first layouts happen under the ink) */
  /* idle frame time of THIS device, sampled continuously while nothing is transitioning */
  const idle = []; let idleLast = 0; const idleF = (now) => { if (idleLast && !busy) { idle.push(now - idleLast); if (idle.length > 60) idle.shift(); } idleLast = now; rawRAF(idleF); }; rawRAF(idleF);
  const idleDt = () => { if (idle.length < 10) return 20; const a = idle.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
  const settle = (max = window.WB_SWAP_SETTLE ?? 650) => new Promise((r) => { if (document.hidden) return r(); const lim = Math.max(20, idleDt() * 1.35), t0 = performance.now(); let last = t0, good = 0;
    const f = (now) => { const dt = now - last; last = now; good = dt < lim ? good + 1 : 0; if (good >= 4 || now - t0 > max) r(); else rawRAF(f); }; rawRAF(f); });
  let busy = false, busyT = 0;
  window.wbSwapGo = async (href, x, y, opts) => {
    const url = new URL(href, location.href); if (url.origin !== location.origin) { location.href = href; return; }
    /* an in-page router (Work page: list ↔ project) only handles URLs of its own page; any other page is a real navigation under the ink */
    if ((window.WB_SWAP_ROUTE && url.pathname !== location.pathname) || (!window.WB_SWAP_ROUTE && !document.querySelector('[data-wb-container]'))) { if (window.wbMenu) window.wbMenu(false); if (window.wbInkGo) wbInkGo(href, x, y); else location.href = href; return; }
    if (busy && performance.now() - busyT < 4000) return; busy = true; busyT = performance.now(); const fromKey = key(location.href);
    try {
      if (!window.WB_SWAP_ROUTE) fetchPage(url.href).catch(() => {}); /* fetch while the ink covers */
      if (window.wbInkCover) await wbInkCover(x, y);
      if (window.WB_SWAP_ROUTE && WB_SWAP_ROUTE.accepts && !WB_SWAP_ROUTE.accepts(url)) { location.assign(url.href); return; } /* router can't show it: real navigation under the ink */
      if (!(opts && opts.pop)) history.pushState({ wbSwap: 1 }, '', url.href);
      if (window.WB_SWAP_ROUTE) await window.WB_SWAP_ROUTE(url); else await swapDOM(url.href, fromKey);
      if (document.fonts) await document.fonts.ready; await frames(3); await settle();
      try { window.WB_SWAP_ENTER && WB_SWAP_ENTER(); } catch (e) {} /* page entrance starts with the reveal */
      if (window.wbInkReveal) await wbInkReveal();
    } catch (e) { console.warn('[swap] falling back to a normal load', e); location.href = href; }
    busy = false;
  };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const c0 = document.querySelector('[data-wb-container]'); owner = nsOf(c0);
  if (c0 && window.WB_SWAP_SAME_SITE == null) window.WB_SWAP_SAME_SITE = true; /* homepage ribbon cards → swap instead of reload */
  history.replaceState({ wbSwap: 1 }, '', location.href);
  addEventListener('popstate', (e) => { if (e.state && e.state.wbSwap) wbSwapGo(location.href, innerWidth / 2, innerHeight / 2, { pop: true }); else location.reload(); });
  addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[data-wb-swap], a[data-wb-ink]'); if (!a || (e.defaultPrevented && !a.hasAttribute('data-wb-swap')) || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const u = new URL(a.href, location.href); if (u.origin !== location.origin) return; e.preventDefault(); e.stopImmediatePropagation(); if (window.__wbPlayClick) window.__wbPlayClick(); /* the click sound never sees this click */ wbSwapGo(a.href, e.clientX, e.clientY); }, true);
  addEventListener('mouseover', (e) => { const a = e.target.closest && e.target.closest('a[data-wb-swap]'); if (a && !window.WB_SWAP_ROUTE && !kept.has(key(a.href))) fetchPage(a.href).catch(() => {}); }, { passive: true }); /* prefetch on hover */
})();
