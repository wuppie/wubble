/* Wubble footer clouds: the hero's cloud technique (wb-clouds.js: cloud10.png sprites flown through in perspective, Canvas 2D)
   as a band over the seam between the last section and the footer, sitting on top of the footer's top edge.
   2D canvas at half resolution: no WebGL context, nothing to compile, so no scroll stall. Only draws while the band is on screen.
   The seam comes from scroll left (not the marker's position), so it also works on the pinned homepage. */
(() => {
  if (window.__wbFog || matchMedia('(prefers-reduced-motion: reduce)').matches) return; window.__wbFog = 1;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  const MOB = matchMedia('(pointer: coarse)').matches || innerWidth < 820, N = MOB ? 320 : 700, DEPTH = 1500, PR = 0.5, BAND = 0.7, SEAM = 0.45, FOG = '#e9e6dd';
  let cv = null, g = null, W = 1, H = 1, img = null, fogI = null; const S = [];
  const init = () => {
    img = new Image(); img.src = (window.WB_ASSETS || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@8f00121e414f/') + 'models/cloud10.png';
    img.onload = () => { const t = document.createElement('canvas'); t.width = img.naturalWidth; t.height = img.naturalHeight; const x = t.getContext('2d'); x.drawImage(img, 0, 0);
      x.globalCompositeOperation = 'source-in'; x.fillStyle = FOG; x.fillRect(0, 0, t.width, t.height); fogI = t; }; /* far clouds melt into the footer's cloud floor colour */
    for (let i = 0; i < N; i++) S.push({ x: Math.random() * 1000 - 500, y: -Math.random() * Math.random() * 200 - 15, z: (i / N) * DEPTH, r: Math.random() * Math.PI, s: Math.random() * Math.random() * 1.5 + 0.5 });
    cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    const mk = 'linear-gradient(to bottom,transparent,#000 28%,#000 66%,transparent)';
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:' + BAND * 100 + 'vh;z-index:62;pointer-events:none;opacity:0;visibility:hidden;will-change:transform,opacity;-webkit-mask-image:' + mk + ';mask-image:' + mk + ';';
    document.body.appendChild(cv); g = cv.getContext('2d'); size(); addEventListener('resize', size);
  };
  const size = () => { W = Math.max(1, Math.round(innerWidth * PR)); H = Math.max(1, Math.round(innerHeight * BAND * PR)); cv.width = W; cv.height = H; };
  let pos = 0, last = performance.now();
  const draw = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; pos = (pos + dt * 30) % DEPTH;
    g.clearRect(0, 0, W, H); if (!img.complete || !img.naturalWidth) return;
    const f = (innerHeight / 2) / Math.tan(15 * Math.PI / 180) * PR, y0 = H * 0.22; /* horizon high in the band: the cloud floor fills the seam below it */
    const L = []; for (const s of S) { let d = s.z - pos; if (d <= 0) d += DEPTH; L.push([d, s]); } L.sort((a, b) => b[0] - a[0]);
    for (const [d, s] of L) { if (d < 8) continue; const k = f / d, sz = 64 * s.s * k; if (sz < 2) continue;
      const px = W / 2 + s.x * k, py = y0 - s.y * k; if (px + sz < 0 || px - sz > W || py + sz < 0 || py - sz > H) continue;
      const a = Math.min(1, (d - 8) / 90), ff = clamp((d + 100) / (DEPTH + 100)); if (a < 0.01) continue;
      g.save(); g.translate(px, py); g.rotate(s.r); g.globalAlpha = a * (1 - ff); g.drawImage(img, -sz / 2, -sz / 2, sz, sz);
      if (fogI) { g.globalAlpha = a * ff; g.drawImage(fogI, -sz / 2, -sz / 2, sz, sz); } g.restore(); }
    g.globalAlpha = 1; };
  const mark = () => document.querySelector('[data-footer-spacer]') || document.querySelector('[data-footer]') || document.querySelector('footer');
  let shown = '';
  const frame = (now) => { requestAnimationFrame(frame);
    const m = mark(); if (!m) return;
    const V = innerHeight, left = document.documentElement.scrollHeight - V - scrollY, fh = Math.min(m.offsetHeight || V, V),
      b = left > fh ? V + (left - fh) : V - (fh - left), vis = smooth(1.45 * V, 1.0 * V, b) * smooth(-0.35 * V, 0.05 * V, b);
    if (vis > 0 && !cv) init(); if (!cv) return;
    const key = vis.toFixed(3) + '|' + Math.round(b); if (key !== shown) { shown = key;
      cv.style.opacity = vis.toFixed(3); cv.style.visibility = vis > 0.002 ? '' : 'hidden';
      cv.style.transform = 'translate3d(0,' + Math.round(b - SEAM * BAND * V) + 'px,0)'; }
    if (vis > 0.002) draw(now); else last = now;
  };
  requestAnimationFrame(frame);
})();
