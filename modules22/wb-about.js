/* Wubble About page behaviour (Webflow owns layout/text; this only animates). Attributes:
   [data-wb-year] hero number: children [data-wb-year-l] / [data-wb-year-r] rise in, then drift apart on scroll (data-drift="12" vw)
   [data-wb-lines] text splits into lines that rise out of masks when scrolled into view (data-delay ms)
   [data-wb-gallery] tall wrapper → [data-wb-gallery-stage] sticky 100vh → [data-wb-gallery-item] tiles (any content, e.g. <img>).
     Tiles sit on the inside of a curved wall (cylinder + row tilt), scroll + drag spin it endlessly. Tiles are cloned to fill.
     data-cols="14" data-rows="3" data-tile="0.24" (tile width / stage width) data-spin="2.4" (radians over the scroll) data-blur="7"
   [data-wb-faq-item] > [data-wb-faq-q] button + [data-wb-faq-a] answer (accordion, one open at a time; data-wb-faq-icon rotates)
   [data-wb-fit] single line text scaled to fill its parent's width */
(() => {
  if (window.__wbAbout) return; window.__wbAbout = 1;
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f), EZ = 'cubic-bezier(.16,1,.3,1)', clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let loops = [];
  /* ---- line reveals ---- */
  const split = (el) => { if (el.__split) return; el.__split = 1; const words = el.textContent.trim().split(/\s+/); el.textContent = '';
    const sp = words.map((w) => { const s = document.createElement('span'); s.textContent = w + ' '; s.style.display = 'inline-block'; s.style.whiteSpace = 'pre'; el.appendChild(s); return s; });
    const lines = []; let y = null; sp.forEach((s) => { if (s.offsetTop !== y) { lines.push([]); y = s.offsetTop; } lines[lines.length - 1].push(s.textContent); });
    el.textContent = ''; el.__lines = lines.map((l) => { const o = document.createElement('span'), i = document.createElement('span'); o.style.cssText = 'display:block;overflow:hidden;padding-bottom:0.06em;margin-bottom:-0.06em;';
      i.style.cssText = 'display:block;transform:translate3d(0,108%,0);will-change:transform;'; i.textContent = l.join('').trimEnd(); o.appendChild(i); el.appendChild(o); return i; }); };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, d = +(el.dataset.delay || 0);
    (el.__lines || []).forEach((i, k) => { i.style.transition = 'transform 1.25s ' + EZ + ' ' + (d + k * 85) + 'ms'; i.style.transform = 'translate3d(0,0,0)'; }); }), { rootMargin: '0px 0px -12% 0px' });
  const initLines = () => document.querySelectorAll('[data-wb-lines]').forEach((el) => { if (el.__split) return; split(el); io.observe(el); });
  /* ---- hero year ---- */
  const initYear = () => document.querySelectorAll('[data-wb-year]').forEach((Y) => { if (Y.__y) return; Y.__y = 1;
    const L = Y.querySelector('[data-wb-year-l]'), R = Y.querySelector('[data-wb-year-r]'), D = +(Y.dataset.drift || 12);
    [L, R].forEach((el, k) => { if (!el) return; el.style.transform = 'translate3d(0,105%,0)'; setTimeout(() => { el.style.transition = 'transform 1.6s ' + EZ; el.style.transform = 'translate3d(0,0,0)'; setTimeout(() => { el.style.transition = 'none'; el.__in = 1; }, 1700); }, 450 + k * 140); });
    loops.push(() => { const r = Y.getBoundingClientRect(), p = clamp(-r.top / innerHeight, 0, 1.5), e = p * p;
      if (L && L.__in) L.style.transform = 'translate3d(' + (-e * D) + 'vw,0,0)'; if (R && R.__in) R.style.transform = 'translate3d(' + (e * D) + 'vw,0,0)'; Y.style.opacity = String(1 - clamp(p - 0.5, 0, 1)); }); });
  /* ---- curved gallery ---- */
  const initGallery = () => document.querySelectorAll('[data-wb-gallery]').forEach((G) => { if (G.__g) return; G.__g = 1;
    const st = G.querySelector('[data-wb-gallery-stage]'), wrap = G.querySelector('[data-wb-gallery-track]') || st, src = [...G.querySelectorAll('[data-wb-gallery-item]')];
    if (!st || !src.length) return; const A = (k, d) => +(G.dataset[k] ?? d), COLS = A('cols', 14), ROWS = A('rows', 3), N = COLS * ROWS;
    const tiles = []; for (let i = 0; i < N; i++) { let t = src[i % src.length]; if (i >= src.length) { t = t.cloneNode(true); t.setAttribute('aria-hidden', 'true'); wrap.appendChild(t); }
      Object.assign(t.style, { position: 'absolute', left: '50%', top: '50%', margin: '0', backfaceVisibility: 'hidden', willChange: 'transform, filter, opacity' }); tiles.push(t); }
    wrap.style.transformStyle = 'preserve-3d'; let cur = 0, drag = 0, vel = 0, down = null;
    st.addEventListener('pointerdown', (e) => { down = e.clientX; st.setPointerCapture(e.pointerId); st.style.cursor = 'grabbing'; });
    st.addEventListener('pointermove', (e) => { if (down == null) return; const dx = e.clientX - down; down = e.clientX; drag -= dx / (st.clientWidth * 0.7); vel = -dx / (st.clientWidth * 0.7); });
    const up = () => { down = null; st.style.cursor = 'grab'; }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up); st.style.cursor = 'grab'; st.style.touchAction = 'pan-y';
    let last = performance.now();
    loops.push((now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; const r = G.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) return;
      const prog = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); if (down == null) { drag += vel; vel *= Math.exp(-dt * 3); }
      const tgt = prog * A('spin', 2.4) + drag + now / 1000 * 0.02; cur += (tgt - cur) * (1 - Math.exp(-dt * 6));
      const W = st.clientWidth, H = st.clientHeight, P = Math.max(W, H * 1.2) * 0.72, Rr = P, tw = W * A('tile', 0.24), th = tw * 0.64, gap = tw * 0.07;
      st.style.perspective = P + 'px'; const cs = (tw + gap) / Rr, rs = (th + gap) / Rr, T = COLS * cs, BL = A('blur', 7);
      for (let i = 0; i < N; i++) { const t = tiles[i], col = i % COLS, row = (i / COLS) | 0; let th0 = col * cs - cur; th0 = ((th0 % T) + T * 1.5) % T - T / 2;
        const ph = (row - (ROWS - 1) / 2) * rs, a = Math.abs(th0), vis = a < 1.45; t.style.visibility = vis ? 'visible' : 'hidden'; if (!vis) continue;
        t.style.width = tw + 'px'; t.style.height = th + 'px';
        t.style.transform = 'translate3d(-50%,-50%,0) translateZ(' + P.toFixed(1) + 'px) rotateY(' + (-th0).toFixed(4) + 'rad) rotateX(' + ph.toFixed(4) + 'rad) translateZ(' + (-Rr).toFixed(1) + 'px)';
        const b = Math.max(0, a - 0.42) * BL; t.style.filter = b > 0.05 ? 'blur(' + b.toFixed(2) + 'px)' : 'none'; t.style.opacity = String(clamp(1.5 - a, 0, 1)); } }); });
  /* ---- image reveals: mask wipes up, image settles from 1.25 scale (locomotive style); [data-wb-parallax] child drifts ---- */
  const iio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; iio.unobserve(e.target); const f = e.target, m = f.firstElementChild, im = m && m.firstElementChild;
    m.style.transition = 'clip-path 1.6s ' + EZ + ', transform 1.6s ' + EZ; m.style.clipPath = 'inset(0% 0% 0% 0%)'; m.style.transform = 'translate3d(0,0,0)';
    if (im) { im.style.transition = 'scale 2s ' + EZ; im.style.scale = '1'; } }), { rootMargin: '0px 0px -15% 0px' });
  const initImgs = () => document.querySelectorAll('[data-wb-img-reveal]').forEach((f) => { if (f.__r) return; f.__r = 1; const m = f.firstElementChild, im = m && m.firstElementChild; if (!m) return;
    m.style.clipPath = 'inset(100% 0% 0% 0%)'; m.style.transform = 'translate3d(0,60px,0)'; if (im) im.style.scale = '1.25'; iio.observe(f); });
  const pxl = []; const initPx = () => document.querySelectorAll('[data-wb-img-reveal] [data-wb-parallax]').forEach((el) => { if (el.__p) return; el.__p = 1; pxl.push(el); });
  loops.push(() => { const vh = innerHeight; for (const el of pxl) { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) continue; const k = ((r.top + r.height / 2) - vh / 2) / vh; el.style.transform = 'translate3d(0,' + (k * -(+el.dataset.wbParallax || 0.12) * 100).toFixed(2) + '%,0)'; } });
  /* ---- column grid: each [data-wb-col-speed] column drifts at its own speed while scrolling (staggered masonry) ---- */
  const colsL = []; const initCols = () => document.querySelectorAll('[data-wb-col-speed]').forEach((c) => { if (c.__c) return; c.__c = 1; colsL.push(c); });
  loops.push(() => { const vh = innerHeight; for (const c of colsL) { if (innerWidth < 700) { c.style.transform = ''; continue; } const g = c.parentElement.getBoundingClientRect(); if (g.bottom < -200 || g.top > vh + 200) continue; const k = vh / 2 - (g.top + g.height / 2); c.style.transform = 'translate3d(0,' + (k * +c.dataset.wbColSpeed).toFixed(1) + 'px,0)'; } });
  /* ---- FAQ accordion ---- */
  const initFaq = () => document.querySelectorAll('[data-wb-faq-item]').forEach((it) => { if (it.__f) return; it.__f = 1;
    const q = it.querySelector('[data-wb-faq-q]'), a = it.querySelector('[data-wb-faq-a]'), ic = it.querySelector('[data-wb-faq-icon]'); if (!q || !a) return;
    Object.assign(a.style, { height: '0px', overflow: 'hidden', transition: 'height .7s ' + EZ + ', opacity .5s ease', opacity: '0' });
    const set = (on) => { it.toggleAttribute('data-open', on); q.setAttribute('aria-expanded', on ? 'true' : 'false'); a.style.height = on ? a.scrollHeight + 'px' : '0px'; a.style.opacity = on ? '1' : '0'; if (ic) { ic.style.transition = 'transform .6s ' + EZ; ic.style.transform = on ? 'rotate(45deg)' : 'none'; } };
    it.__set = set; q.addEventListener('click', () => { const on = !it.hasAttribute('data-open'); document.querySelectorAll('[data-wb-faq-item][data-open]').forEach((o) => o !== it && o.__set && o.__set(false)); set(on); }); });
  /* ---- fit text ---- */
  const fit = () => document.querySelectorAll('[data-wb-fit]').forEach((el) => { el.style.whiteSpace = 'nowrap'; el.style.display = 'inline-block'; el.style.fontSize = '100px'; const w = el.parentElement.clientWidth, n = el.scrollWidth; if (n) el.style.fontSize = (100 * w / n * 0.995).toFixed(2) + 'px'; });
  const tick = (now) => { RAF(tick); for (const f of loops) f(now); };
  const init = () => { initYear(); initGallery(); initImgs(); initPx(); initCols(); initFaq(); fit(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fit(); initLines(); }); };
  /* the page content may render after this script (Design Component / page swap): retry until it exists */
  let n = 0; const poll = () => { init(); if (++n < 40 && !document.querySelector('[data-wb-img-reveal]')?.__r) setTimeout(poll, 150); else setTimeout(fit, 300); };
  addEventListener('resize', fit);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
  RAF(tick);
})();
