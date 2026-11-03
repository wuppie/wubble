/* Wubble pixel text reveal (after pixel-text-reveal.vercel.app, "flow"): text emerges from coarse pixel blocks that
   resolve, front by front, into clean type. The real DOM text stays in the page (selectable, SEO); while a reveal runs
   a 2D canvas draws the same words on top and the DOM glyphs are hidden, then the canvas is dropped (zero idle cost).
   2D canvas, not WebGL: phones only keep ~8 WebGL contexts alive.

   Attributes (Webflow owns the styling):
     data-wb-pixel                 enable on any text element
     data-pixel-trigger="inview"   inview (default, plays once on entering) | scrub (scroll position = progress)
                                   | pin (reads window.__wbAboutProg, the pinned About scrub) | manual (window.wbPixelPlay(el))
     data-pixel-once="false"       inview: replay every time it re-enters
     data-pixel-duration="1.4"     seconds (inview / manual)
     data-pixel-delay="0"          seconds
     data-pixel-size="24"          largest block in px
     data-pixel-loco               also glide in from below / out above with the scroll, smoothed (locomotive-style)
   window.WB_PIXEL_LINES = true    also treat every [data-wb-lines] element as data-wb-pixel (site-wide consistency)
   window.WB_PIXEL_ROWS = true     service list titles [data-wb-row-title] get the reveal + loco glide (no glide inside pinned [data-panel]) */
(() => {
  if (window.__wbPixel) return; window.__wbPixel = 1;
  const items = new Map(); /* el -> state */
  const DPR = Math.min(2, devicePixelRatio || 1);
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const effOp = (e, stop) => { let o = 1; for (; e && e !== stop; e = e.parentElement) { o *= +getComputedStyle(e).opacity; if (o < 0.01) return 0; } return o; }; /* opacity incl. parents (fades, row hover dim) */
  const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* rasterise the element's own words (positions from the live layout) into a canvas the size of its box */
  const raster = (el) => {
    const box = el.getBoundingClientRect(); if (box.width < 2 || box.height < 2) return null;
    const W = Math.ceil(box.width * DPR), H = Math.ceil(box.height * DPR), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.scale(DPR, DPR); g.textBaseline = 'alphabetic';
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const host = n.parentElement; if (!host) continue; const cs = getComputedStyle(host); if (cs.visibility === 'hidden' || cs.display === 'none' || effOp(host, el) < 0.05) continue; /* hidden hover copies */
      g.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; g.fillStyle = cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color && !/0\)$/.test(cs.webkitTextFillColor) ? cs.webkitTextFillColor : cs.color;
      if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      const m = g.measureText('Hg'), asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8, dsc = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;
      const txt = n.nodeValue, re = /\S+/g; let w;
      while ((w = re.exec(txt))) { const r = document.createRange(); r.setStart(n, w.index); r.setEnd(n, w.index + w[0].length);
        const word = cs.textTransform === 'uppercase' ? w[0].toUpperCase() : cs.textTransform === 'lowercase' ? w[0].toLowerCase() : w[0];
        [...r.getClientRects()].forEach((rc, i, all) => { if (rc.width < 1) return; if (rc.bottom < box.top - 2 || rc.top > box.bottom + 2) return; /* hidden copies outside the box (menu roll) */
          const txt2 = all.length > 1 ? (i === 0 ? word : '') : word; if (!txt2) return; /* a word split over lines: draw it once */
          const y = rc.top - box.top + (rc.height - (asc + dsc)) / 2 + asc; g.fillText(txt2, rc.left - box.left, y); }); }
    }
    return { cv, W, H, w: box.width, h: box.height };
  };
  /* the same text at a coarser pixel size (nearest-neighbour) */
  const coarse = (src, px) => { const sw = Math.max(1, Math.round(src.W / (px * DPR))), sh = Math.max(1, Math.round(src.H / (px * DPR)));
    const s = document.createElement('canvas'); s.width = sw; s.height = sh; const sg = s.getContext('2d'); sg.drawImage(src.cv, 0, 0, sw, sh);
    const o = document.createElement('canvas'); o.width = src.W; o.height = src.H; const og = o.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(s, 0, 0, src.W, src.H); return o; };

  const hide = (S, on) => { if (S.hid === on) return; S.hid = on; S.el.style.setProperty('--wb-pixel-hide', on ? '1' : '0'); S.el.toggleAttribute('data-wb-pixel-on', on); };
  const build = (S) => { const was = S.el.hasAttribute('data-wb-pixel-on'); S.el.removeAttribute('data-wb-pixel-on'); const R = raster(S.el); if (was) S.el.setAttribute('data-wb-pixel-on', ''); if (!R) return false; /* read the real colours, not the hidden state */ const big = +(S.el.getAttribute('data-pixel-size') || 24);
    S.R = R; S.L = [coarse(R, big), coarse(R, big / 2), coarse(R, Math.max(2, big / 5))];
    const c = document.createElement('canvas'); c.width = R.W; c.height = R.H; c.setAttribute('aria-hidden', 'true'); c.setAttribute('data-wb-pixel-canvas', '');
    c.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:' + (S.el.closest('[data-wb-menu]') ? 160 : 90) + ';width:' + R.w + 'px;height:' + R.h + 'px;'; document.body.appendChild(c); S.c = c; S.g = c.getContext('2d'); S.cell = big; return true; };
  const drop = (S) => { if (S.c) { S.c.remove(); S.c = null; } S.R = null; S.L = null; };

  /* draw progress t (0 = nothing, 1 = clean): a diagonal flow front with noise; behind it each cell steps coarse → fine → clean */
  const draw = (S, t) => {
    if (t >= 0.999) { hide(S, false); drop(S); S.done = true; return; }
    if (t <= 0.001) { hide(S, true); if (S.c) S.g.clearRect(0, 0, S.c.width, S.c.height); return; }
    if (!S.c && !build(S)) return; hide(S, true); S.done = false;
    const b = S.el.getBoundingClientRect(); S.c.style.transform = 'translate3d(' + b.left.toFixed(1) + 'px,' + b.top.toFixed(1) + 'px,0)'; S.c.style.opacity = effOp(S.el, null).toFixed(3);
    const g = S.g, R = S.R, cs = S.cell * DPR, nx = Math.ceil(R.W / cs), ny = Math.ceil(R.H / cs), SP = 0.55; g.clearRect(0, 0, R.W, R.H);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const front = (i / Math.max(1, nx - 1)) * 0.7 + (j / Math.max(1, ny - 1)) * 0.3, nz = hash(i + S.seed, j);
      const lp = (t * (1 + SP) - (front * 0.75 + nz * 0.25) * SP) / (1 - SP * 0.4); if (lp <= 0) continue;
      const src = lp < 0.3 ? S.L[0] : lp < 0.62 ? S.L[1] : lp < 0.9 ? S.L[2] : R.cv, x = i * cs, y = j * cs, w = Math.min(cs, R.W - x), h = Math.min(cs, R.H - y);
      g.globalAlpha = Math.min(1, lp * 3); g.drawImage(src, x, y, w, h, x, y, w, h); }
    g.globalAlpha = 1; };

  const add = (el) => { if (items.has(el)) return; const trig = el.getAttribute('data-pixel-trigger') || (el.hasAttribute('data-wb-lines') ? 'inview' : 'inview');
    const S = { el, trig, t: 0, v: 0, play: null, done: false, seen: false, seed: Math.random() * 100, once: el.getAttribute('data-pixel-once') !== 'false', loco: el.hasAttribute('data-pixel-loco'), ly: 0, lo: 0 };
    items.set(el, S); if (trig !== 'manual') hide(S, true); };
  const scan = () => { if (window.WB_PIXEL_ROWS) document.querySelectorAll('[data-wb-row-title]:not([data-wb-pixel])').forEach((t) => { t.setAttribute('data-wb-pixel', ''); if (!t.closest('[data-panel]')) t.setAttribute('data-pixel-loco', ''); }); /* service lists: pixel + glide (not inside the Home pinned panels) */
    document.querySelectorAll('[data-wb-pixel]' + (window.WB_PIXEL_LINES ? ',[data-wb-lines]' : '')).forEach(add); };
  window.wbPixelPlay = (el, delay) => { add(el); const S = items.get(el); S.play = { t0: performance.now() + (delay || 0) * 1000, dur: +(el.getAttribute('data-pixel-duration') || 1.2) * 1000 }; S.t = 0; hide(S, true); };
  window.wbPixelHide = (el) => { const S = items.get(el); if (!S) return; S.play = null; S.t = 0; drop(S); hide(S, true); };

  let last = performance.now();
  const tick = (now) => { requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; const vh = innerHeight;
    items.forEach((S, el) => { if (!el.isConnected) { drop(S); items.delete(el); return; }
      const r = el.getBoundingClientRect(), vis = r.bottom > -40 && r.top < vh + 40;
      /* locomotive in/out: glide up into place on the way in, keep gliding up and fade on the way out */
      if (S.loco) { const c = (r.top + r.height / 2) / vh, inK = ss(1.05, 0.7, c), outK = ss(0.22, -0.1, c), ty = (1 - inK) * 60 - outK * 60, op = Math.min(inK, 1 - outK);
        S.ly += (ty - S.ly) * (1 - Math.exp(-dt * 6)); S.lo += (op - S.lo) * (1 - Math.exp(-dt * 6));
        const tf = Math.abs(S.ly) < 0.05 ? '' : '0px ' + S.ly.toFixed(2) + 'px'; if (el.style.translate !== tf) el.style.translate = tf;
        const o = S.lo > 0.995 ? '' : S.lo.toFixed(3); if (el.style.opacity !== o) el.style.opacity = o; }
      let target = S.t;
      if (S.play) { const k = (now - S.play.t0) / S.play.dur; target = Math.max(0, Math.min(1, k)); if (k >= 1) S.play = null; S.t = target; }
      else if (S.trig === 'scrub') target = ss(0.95, 0.45, (r.top + r.height * 0.5) / vh);
      else if (S.trig === 'pin') target = Math.max(0, Math.min(1, window.__wbAboutProg || 0));
      else if (S.trig === 'inview') { if (vis && r.top < vh * 0.88 && !S.seen && !window.__wbInkBusy && effOp(el, null) > 0.3) { S.seen = true; window.wbPixelPlay(el, +(el.getAttribute('data-pixel-delay') || 0)); return; }
        if (!S.once && S.seen && (r.top > vh || r.bottom < 0)) { S.seen = false; S.t = 0; drop(S); hide(S, true); } }
      if (S.trig === 'scrub' || S.trig === 'pin') { S.v += (target - S.v) * (1 - Math.exp(-dt * 8)); if (Math.abs(target - S.v) < 0.001) S.v = target; target = S.v; }
      if (!vis && S.trig !== 'manual') { if (S.c) { drop(S); } return; }
      if (S.done && target >= 0.999) return; if (S.trig === 'manual' && !S.play && target <= 0.001 && !S.hid) return;
      draw(S, target); });
  };
  const css = document.createElement('style'); css.textContent = '[data-wb-pixel-on]{color:transparent!important;-webkit-text-fill-color:transparent!important}[data-wb-pixel-on] *{color:transparent!important;-webkit-text-fill-color:transparent!important}';
  document.head.appendChild(css);
  const start = () => { scan(); requestAnimationFrame(tick); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => (document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start()));
  document.addEventListener('wb:swap', () => setTimeout(scan, 60));
  addEventListener('resize', () => items.forEach((S) => { drop(S); }));
})();
