/* Wubble image tube (after Codrops "Scroll-Driven 3D Image Tube with R3F", github.com/matdn/helmet): the section's photos
   wrap around a slowly turning cylinder; every row turns at its own speed, odd rows are offset half a tile. Scrolling through
   the section moves the tube and spins it faster; hovering a photo slows it down and shows its caption. Transparent canvas
   (no grid background), the space in the middle is kept free for a 3D model later.
   Webflow: data-wb-tube on the section. Each <figure> (or [data-tube-item]) is a tile: its <img> is the photo (no image yet →
   a dark card with the caption), its <figcaption> is the hover label. Options: data-rows="5" · data-cols="12" · data-radius="4".
   Phones keep the normal grid (they already run many WebGL layers). */
(() => {
  if (window.__wbTube || matchMedia('(pointer: coarse)').matches) return; window.__wbTube = 1;
  const B = 'https://esm.sh/three@0.186.1';
  const init = async (sec) => {
    if (sec.__tube) return; sec.__tube = 1;
    const T = await import(B);
    const at = (k, d) => +(sec.getAttribute('data-' + k) ?? d);
    const ROWS = at('rows', 5), COLS = at('cols', 12), R = at('radius', 4), TW = 0.72, TH = 1, YS = 2.7, REP = 3, LOOP = ROWS * YS;
    const items = [...sec.querySelectorAll('[data-tube-item], figure')].filter((f, i, a) => !a.some((o) => o !== f && o.contains(f)));
    if (!items.length) return;
    const label = (f) => { const c = f.querySelector('figcaption'); return c ? (c.firstChild && c.firstChild.nodeType === 3 ? c.firstChild.textContent : c.textContent).trim() : ''; };
    /* the 3D layer covers the whole screen and fades in/out as the section enters/leaves (a sticky layer cut the photos off in a hard line at its top/bottom edge); the grid stays in the page (SEO, layout height) but is hidden */
    const stage = document.createElement('div'); stage.setAttribute('aria-hidden', 'true');
    stage.style.cssText = 'position:fixed;left:0;top:0;height:100vh;width:100%;z-index:2;pointer-events:none;opacity:0;visibility:hidden;';
    sec.prepend(stage); [...sec.children].forEach((c) => { if (c !== stage) c.style.visibility = 'hidden'; });
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setClearColor(0, 0); r.outputColorSpace = T.SRGBColorSpace;
    r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;'; stage.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 100); cam.position.set(0, 0, 6.5); cam.lookAt(0, 0, 0);
    const size = () => { const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(stage);

    /* textures: the tile's photo cropped to the tile (cover), or a dark caption card while there is no photo */
    const TA = TW / TH, loader = new T.TextureLoader(); loader.setCrossOrigin('anonymous');
    const cover = (t, w, h) => { const ia = w / h; if (ia > TA) { t.repeat.set(TA / ia, 1); t.offset.set((1 - TA / ia) / 2, 0); } else { t.repeat.set(1, ia / TA); t.offset.set(0, (1 - ia / TA) / 2); } };
    const card = (txt) => { const c = document.createElement('canvas'); c.width = 432; c.height = 600; const g = c.getContext('2d');
      g.fillStyle = '#1b1b1d'; g.fillRect(0, 0, 432, 600); g.fillStyle = '#5a5c60'; g.font = '500 34px Switzer, Helvetica, sans-serif'; g.fillText(txt || 'Photo', 32, 560);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; };
    const mats = items.map((f) => { const m = new T.MeshBasicMaterial({ map: card(label(f)), side: T.DoubleSide, toneMapped: false }); const img = f.querySelector('img');
      if (img && (img.currentSrc || img.src)) loader.load(img.currentSrc || img.src, (t) => { t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; cover(t, t.image.width, t.image.height); m.map = t; m.needsUpdate = true; });
      return m; });

    const geo = new T.PlaneGeometry(TW, TH), tube = new T.Group(), rowsG = [], meshes = []; sc.add(tube);
    const total = ROWS * REP;
    for (let ri = 0; ri < total; ri++) { const row = new T.Group(), base = ri % ROWS, off = base % 2 ? 0.5 : 0; row.position.y = (ri - (total - 1) / 2) * YS;
      for (let c = 0; c < COLS; c++) { const th = ((c + off) / COLS) * Math.PI * 2, idx = (base * COLS + c) % items.length, m = new T.Mesh(geo, mats[idx]);
        m.position.set(Math.cos(th) * R, 0, Math.sin(th) * R); m.rotation.y = -(th + Math.PI / 2); m.userData.label = label(items[idx]); row.add(m); meshes.push(m); }
      tube.add(row); rowsG.push({ row, speed: 0.65 + (ROWS <= 1 ? 0 : base / (ROWS - 1)) * 0.9 }); }

    /* hover: slow down + caption label that trails the cursor */
    const tip = document.createElement('div'); tip.className = 'about-tube_tooltip';
    tip.style.cssText = 'position:fixed;left:0;top:0;z-index:95;pointer-events:none;opacity:0;transition:opacity .25s ease;font:500 13px/1 Switzer,Helvetica,sans-serif;color:#0e0e0d;background:#f4f4f2;padding:8px 12px;border-radius:999px;white-space:nowrap;';
    document.body.appendChild(tip);
    const ray = new T.Raycaster(), ndc = new T.Vector2(); let hover = null, mx = 0, my = 0, tx = 0, ty = 0, slowT = 1, slow = 1;
    r.domElement.addEventListener('pointermove', (e) => { const b = r.domElement.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); mx = e.clientX; my = e.clientY;
      ray.setFromCamera(ndc, cam); const hit = ray.intersectObjects(meshes, false)[0]; hover = hit ? hit.object : null; slowT = hover ? 0.35 : 1;
      if (hover && hover.userData.label) { tip.textContent = hover.userData.label; tip.style.opacity = '1'; } else tip.style.opacity = '0'; }, { passive: true });
    r.domElement.addEventListener('pointerleave', () => { hover = null; slowT = 1; tip.style.opacity = '0'; });

    /* scroll: the section's progress moves the tube one loop; scroll speed adds spin, scroll direction sets the drift */
    let tgt = 0, cur = 0, vel = 0, dir = 1, angle = 0, lastY = scrollY, last = performance.now(), on = false;
    new IntersectionObserver((es) => { on = es[0].isIntersecting; }, { rootMargin: '200px 0px' }).observe(sec);
    const tick = (now) => { requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const dy = scrollY - lastY; lastY = scrollY; if (!on) return;
      const b = sec.getBoundingClientRect(), p = Math.max(0, Math.min(1, -b.top / Math.max(1, b.height - innerHeight)));
      { const k = Math.max(0, Math.min(1, (innerHeight - b.top) / (innerHeight * 0.6), b.bottom / (innerHeight * 0.6))), e = k * k * (3 - 2 * k), o = e.toFixed(3); /* fade with how far the section is on screen */
        if (stage.__o !== o) { stage.__o = o; stage.style.opacity = o; stage.style.visibility = e > 0 ? '' : 'hidden'; r.domElement.style.pointerEvents = e > 0.6 ? 'auto' : 'none'; } if (e <= 0) return; }
      tgt = p * LOOP; vel += dy * 0.004; if (dy) dir = dy < 0 ? -1 : 1;
      cur += (tgt - cur) * 0.12; vel *= Math.pow(0.92, dt * 60); vel = Math.max(-2, Math.min(2, vel)); slow += (slowT - slow) * 0.12;
      angle += (dir * 0.25 + vel) * dt * slow; tube.position.y = cur - LOOP / 2;
      rowsG.forEach((g) => { g.row.rotation.y = angle * g.speed; });
      tx += (mx - tx) * 0.18; ty += (my - ty) * 0.18; tip.style.transform = 'translate3d(' + (tx + 12).toFixed(1) + 'px,' + (ty - 18).toFixed(1) + 'px,0)';
      r.render(sc, cam); };
    requestAnimationFrame(tick);
  };
  const scan = () => document.querySelectorAll('[data-wb-tube]').forEach((s) => init(s).catch((e) => console.warn('[tube]', e)));
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', scan) : scan();
  document.addEventListener('wb:swap', () => setTimeout(scan, 60));
})();
