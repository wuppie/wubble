/* Wubble footer clouds: the hero's cloud look (cloud10.png sprites in perspective, as in wb-clouds.js) as a band over the seam
   between the last section and the footer, on top of the footer's top edge.
   Drawn ONCE into a strip twice the screen width (repeats seamlessly); a CSS animation slides it sideways on the GPU,
   so there is no drawing per frame. Per frame only the band's position follows the seam ([data-footer-spacer] top). */
(() => {
  if (window.__wbFog) return; window.__wbFog = 1;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  const MOB = matchMedia('(pointer: coarse)').matches || innerWidth < 820, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = MOB ? 170 : 320, DEPTH = 1500, PR = 0.5, BAND = 0.7, SEAM = 0.45, FOG = '#e9e6dd';
  let box = null, cv = null, img = null, fogI = null;
  const paint = () => { if (!img || !img.naturalWidth || !fogI) return;
    const W = Math.max(1, Math.round(innerWidth * PR)), H = Math.max(1, Math.round(innerHeight * BAND * PR)); cv.width = W * 2; cv.height = H;
    const g = cv.getContext('2d'), f = (innerHeight / 2) / Math.tan(15 * Math.PI / 180) * PR, y0 = H * 0.3; /* horizon high in the band: the cloud floor covers the seam below it */
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); /* same clouds every time */
    const S = []; for (let i = 0; i < N; i++) S.push({ x: rnd(), y: -rnd() * rnd() * 200 - 15, d: 40 + (i / N) * 480, j: (rnd() - 0.5) * 0.14, r: rnd() * Math.PI, s: rnd() * rnd() * 1.5 + 0.5 });
    S.sort((a, b) => b.d - a.d); /* far first */
    for (const s of S) { const k = f / s.d, sz = 64 * s.s * k; if (sz < 2) continue; const py = y0 - s.y * k + s.j * H; /* no far clouds piling up on one flat horizon line */ if (py - sz > H || py + sz < 0) continue;
      const ff = clamp((s.d + 60) / 900), a = Math.min(1, (s.d - 8) / 90), px = s.x * W;
      for (const ox of [-W, 0, W, 2 * W]) { const x = px + ox; if (x + sz < 0 || x - sz > 2 * W) continue; /* period W: the strip repeats seamlessly */
        g.save(); g.translate(x, py); g.rotate(s.r); g.globalAlpha = a * (1 - ff); g.drawImage(img, -sz / 2, -sz / 2, sz, sz); g.globalAlpha = a * ff; g.drawImage(fogI, -sz / 2, -sz / 2, sz, sz); g.restore(); } }
  };
  const init = () => {
    box = document.createElement('div'); box.setAttribute('aria-hidden', 'true');
    const mk = 'linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.3) 16%,#000 36%,#000 54%,rgba(0,0,0,.45) 76%,transparent 100%)'; /* long soft fades: no visible top or bottom edge */
    box.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:' + BAND * 100 + 'vh;z-index:62;pointer-events:none;overflow:hidden;opacity:0;visibility:hidden;will-change:transform,opacity;-webkit-mask-image:' + mk + ';mask-image:' + mk + ';';
    cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;left:0;top:0;width:200%;height:100%;will-change:transform;' + (still ? '' : 'animation:wbFogDrift 140s linear infinite;');
    const st = document.createElement('style'); st.textContent = '@keyframes wbFogDrift{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}'; document.head.appendChild(st);
    box.appendChild(cv); document.body.appendChild(box);
    img = new Image(); img.src = (window.WB_ASSETS || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@dd1185752719/') + 'models/cloud10.png';
    img.onload = () => { const t = document.createElement('canvas'); t.width = img.naturalWidth; t.height = img.naturalHeight; const x = t.getContext('2d'); x.drawImage(img, 0, 0);
      x.globalCompositeOperation = 'source-in'; x.fillStyle = FOG; x.fillRect(0, 0, t.width, t.height); fogI = t; paint(); }; /* far clouds melt into the footer's cloud floor colour */
    let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paint, 250); });
  };
  const mark = () => document.querySelector('[data-footer-spacer]') || document.querySelector('[data-footer]') || document.querySelector('footer');
  let shown = '', on = null;
  const frame = () => { requestAnimationFrame(frame);
    const m = mark(); if (!m) return;
    const V = innerHeight, b = m.getBoundingClientRect().top, vis = smooth(1.45 * V, 1.0 * V, b) * smooth(-0.35 * V, 0.05 * V, b); /* b = the seam on screen */
    if (vis > 0 && !box) init(); if (!box) return;
    const key = vis.toFixed(3) + '|' + Math.round(b); if (key === shown) return; shown = key;
    box.style.opacity = vis.toFixed(3); box.style.transform = 'translate3d(0,' + Math.round(b - SEAM * BAND * V) + 'px,0)';
    const o = vis > 0.002; if (o !== on) { on = o; box.style.visibility = o ? '' : 'hidden'; cv.style.animationPlayState = o ? 'running' : 'paused'; }
  };
  requestAnimationFrame(frame);
})();
