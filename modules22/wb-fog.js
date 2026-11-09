/* Wubble footer clouds: a soft cloud bank on top of the seam between the last section and the footer.
   Plain 2D canvas (no WebGL, no shader compile, so no scroll stall): a few cloud sprites are painted once at start,
   then drifting copies are drawn into a small canvas (max 900px wide, 480 on phones) that the browser scales up.
   The band follows the seam (from scroll left, works on the pinned homepage too) and only draws while it is on screen. */
(() => {
  if (window.__wbFog || matchMedia('(prefers-reduced-motion: reduce)').matches) return; window.__wbFog = 1;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  const coarse = matchMedia('(pointer: coarse)').matches, N = coarse ? 20 : 34, SEAM = 0.62;
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // one cauliflower-shaped cloud: overlapping soft blobs, lit from above, grey underneath
  const sprite = () => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    for (let i = 0; i < 16; i++) { const a = rnd() * Math.PI, d = rnd() * 70, x = 128 + Math.cos(a) * d * 1.3, y = 165 - Math.sin(a) * d * 0.8, r = 34 + rnd() * 46;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(0, 70, 0, 230);
    sh.addColorStop(0, 'rgba(255,253,248,0)'); sh.addColorStop(1, 'rgba(150,146,136,.55)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 256); return c; };
  let cv = null, g = null, W = 0, H = 0, S = [], P = [];
  const init = () => {
    S = [sprite(), sprite(), sprite(), sprite()];
    P = Array.from({ length: N }, (_, i) => { const l = i / (N - 1); return { l, x: rnd(), s: (0.16 + 0.2 * l) * (0.75 + 0.5 * rnd()), y: (rnd() - 0.5) * 0.2 + l * 0.08, v: 0.004 + 0.01 * l * rnd() + 0.003, k: i % 4 }; });
    cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:58vh;z-index:62;pointer-events:none;opacity:0;visibility:hidden;will-change:transform,opacity;' +
      '-webkit-mask-image:linear-gradient(to bottom,transparent,#000 30%,#000 80%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 30%,#000 80%,transparent);';
    document.body.appendChild(cv); g = cv.getContext('2d'); size(); addEventListener('resize', size);
  };
  const size = () => { W = Math.round(Math.min(innerWidth, coarse ? 480 : 900)); H = Math.round(W * 0.58 * innerHeight / innerWidth); cv.width = W; cv.height = H; };
  const draw = (t) => { g.clearRect(0, 0, W, H); const yb = H * SEAM;
    const half = (from, to) => { for (let i = from; i < to; i++) { const p = P[i], s = p.s * W, span = W + s * 2, x = ((p.x * span + t * p.v * W) % span) - s, y = yb - s * 0.42 + p.y * H;
      g.globalAlpha = 0.5 + 0.5 * p.l; g.drawImage(S[p.k], x - s / 2, y - s / 2, s, s); } };
    half(0, N >> 1); g.globalAlpha = 1;
    const hz = g.createLinearGradient(0, yb - H * 0.18, 0, H); hz.addColorStop(0, 'rgba(233,230,221,0)'); hz.addColorStop(0.32, 'rgba(233,230,221,.9)'); hz.addColorStop(1, 'rgba(233,230,221,0)');
    g.fillStyle = hz; g.fillRect(0, yb - H * 0.18, W, H); half(N >> 1, N); g.globalAlpha = 1; };
  const mark = () => document.querySelector('[data-footer-spacer]') || document.querySelector('[data-footer]') || document.querySelector('footer');
  let shown = '';
  const frame = (now) => { requestAnimationFrame(frame);
    const m = mark(); if (!m) return;
    /* seam from scroll left, not the marker's position: on the homepage the sections are pinned, so the marker sits near the top */
    const V = innerHeight, left = document.documentElement.scrollHeight - V - scrollY, fh = Math.min(m.offsetHeight || V, V),
      b = left > fh ? V + (left - fh) : V - (fh - left), vis = smooth(1.45 * V, 1.0 * V, b) * smooth(-0.35 * V, 0.05 * V, b);
    if (vis > 0 && !cv) init(); if (!cv) return;
    const key = vis.toFixed(3) + '|' + Math.round(b); if (key !== shown) { shown = key;
      cv.style.opacity = vis.toFixed(3); cv.style.visibility = vis > 0.002 ? '' : 'hidden';
      cv.style.transform = 'translate3d(0,' + Math.round(b - SEAM * 0.58 * V) + 'px,0)'; }
    if (vis > 0.002) draw(now / 1000);
  };
  requestAnimationFrame(frame);
})();
