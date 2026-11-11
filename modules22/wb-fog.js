/* Wubble footer clouds: the hero's cloud look (cloud10.png sprites in perspective, as in wb-clouds.js) as a band over the seam
   between the last section and the footer, on top of the footer's top edge.
   Drawn ONCE into a strip twice the screen width (repeats seamlessly); a CSS animation slides it sideways on the GPU,
   so there is no drawing per frame. Per frame only the band's position follows the seam ([data-footer-spacer] top). */
(() => {
  if (window.__wbFog) return; window.__wbFog = 1;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  const MOB = matchMedia('(pointer: coarse)').matches || innerWidth < 820, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = MOB ? 160 : 300, PR = 0.5, BAND = 0.7, SEAM = 0.5, /* the seam sits low in the band: the billows rise above the edge, the bank fades just below it */ FOG = '#e9e6dd';
  let box = null, cv = null, img = null, fogI = null;
  const paint = () => { if (!img || !img.naturalWidth || !fogI) return;
    const W = Math.max(1, Math.round(innerWidth * PR)), H = Math.max(1, Math.round(innerHeight * BAND * PR)); cv.width = W * 2; cv.height = H;
    const g = cv.getContext('2d'); let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); /* same clouds every time */
    /* billowing cloud bank with an uneven top line (no horizon, so no straight edge); integer frequencies: repeats every W */
    const T = Math.PI * 2, p = [rnd() * T, rnd() * T, rnd() * T], top = (x) => H * (0.3 + 0.09 * Math.sin(T * 2 * x / W + p[0]) + 0.05 * Math.sin(T * 5 * x / W + p[1]) + 0.025 * Math.sin(T * 11 * x / W + p[2]));
    [[N * 0.3, 0.07, 0.55, 0.06], [N * 0.35, 0.1, 0.8, 0.03], [N * 0.35, 0.14, 1, 0]].forEach(([n, sc, al, up], l) => { /* back (small, faint, higher) to front (big, bright) */
      for (let i = 0; i < n; i++) { const x0 = rnd() * W, sz = (MOB ? Math.max(W, H * 2.7) : W) * sc * (0.6 + 0.8 * rnd()) /* size from the band height on tall screens: on a phone the width alone made tiny clouds */, y = top(x0) - up * H + sz * 0.38 + rnd() * rnd() * H * 0.45, r = rnd() * T;
        for (const ox of [-W, 0, W, 2 * W]) { const x = x0 + ox; if (x + sz < 0 || x - sz > 2 * W) continue;
          g.save(); g.translate(x, y); g.rotate(r); g.globalAlpha = al * (l ? 1 : 0.6); g.drawImage(img, -sz / 2, -sz / 2, sz, sz); if (!l) { g.globalAlpha = al * 0.5; g.drawImage(fogI, -sz / 2, -sz / 2, sz, sz); } g.restore(); } } });
    g.globalAlpha = 1; const fl = g.createLinearGradient(0, H * 0.5, 0, H); fl.addColorStop(0, 'rgba(233,230,221,0)'); fl.addColorStop(1, 'rgba(233,230,221,.8)'); g.fillStyle = fl; g.fillRect(0, H * 0.5, W * 2, H * 0.5); /* melts into the footer's cloud floor */
  };
  const init = () => {
    box = document.createElement('div'); box.setAttribute('aria-hidden', 'true');
    const mk = 'linear-gradient(to bottom,transparent 0%,#000 10%,#000 68%,rgba(0,0,0,.6) 84%,transparent 100%)'; /* full clouds well past the edge, so the straight footer edge disappears under them */ /* top: open above the highest cloud tops, so the edge is the clouds themselves; long soft fade into the footer */
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
  const ft = document.querySelector('.footer_wrap'), CUT = !!(ft && document.querySelector('.home-footer_fig')), fcs = ft && getComputedStyle(ft);
  const frame = (now) => { requestAnimationFrame(frame);
    const m = mark(); if (!m) return;
    if (CUT && !box && document.readyState === 'complete') init(); /* homepage: ready before the footer arrives, so the clouds are there on first view */
    const V = innerHeight; let b, vis;
    b = m.getBoundingClientRect().top; /* b = the seam on screen */
    /* follow the footer's DRAWN edge, not the scroll: the reveal (wb-ui) eases the fixed footer and cuts it from the top (clip-path inset),
       so edge = footer top + that cut. On the homepage the reveal lags the scroll; following the marker made the clouds jump when it caught up. */
    if (fcs) { if (fcs.visibility === 'hidden') b = V * 1.6; else { const ci = /inset\(\s*(-?[\d.]+)px/.exec(fcs.clipPath || ''); if (ci) b = ft.getBoundingClientRect().top + parseFloat(ci[1]); } }
    vis = smooth(1.45 * V, 1.0 * V, b) * smooth(-0.35 * V, 0.05 * V, b);
    if (vis > 0 && !box) init(); if (!box) return;
    const key = vis.toFixed(3) + '|' + Math.round(b); if (key === shown) return; shown = key;
    box.style.opacity = vis.toFixed(3); box.style.transform = 'translate3d(0,' + Math.round(b - SEAM * BAND * V) + 'px,0)';
    const o = vis > 0.002; if (o !== on) { on = o; box.style.visibility = o ? '' : 'hidden'; cv.style.animationPlayState = o ? 'running' : 'paused'; }
  };
  requestAnimationFrame(frame);
})();
