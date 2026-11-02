/* Wubble word field: drifting monospace words at different depths (near = big + sharp, far = small + blurred),
   slow upward drift, mouse parallax, a few words occasionally light up. One 2D canvas, fixed behind the page content.
   Webflow: add an empty div [data-wb-wordfield] anywhere on the page.
   Attributes: data-words="CODE, MOTION, …" · data-density="1" · data-speed="1" · data-color="#9fb6d6" · data-opacity="0.5" */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const DEF = 'WEBFLOW, CODE, MOTION, WEBGL, SHADERS, BRANDING, AI, INTERACTION, TYPOGRAPHY, REALTIME, GEOMETRY, PARTICLES, CREATIVE STUDIO, ENGINEERING, EXPERIMENTS, DESIGN, RENDER, SIGNAL, COMPUTE, DEPTH, LIGHT, PRODUCTS, EXPERIENCES, WUBBLE';
  const init = (host) => {
    if (host.__wf) return; host.__wf = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d;
    const words = String(at('words', DEF)).split(',').map((s) => s.trim()).filter(Boolean), dens = +at('density', 1), spd = +at('speed', 1), col = at('color', '#9fb6d6'), op = +at('opacity', 0.5);
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:0;display:block;';
    host.appendChild(cv); const g = cv.getContext('2d');
    let W = 0, H = 0, D = 1, items = [], mx = 0, my = 0, tx = 0, ty = 0;
    const LAYERS = [{ z: 0.35, fs: 11, blur: 2.2, a: 0.28 }, { z: 0.6, fs: 13, blur: 1.1, a: 0.42 }, { z: 1, fs: 15, blur: 0, a: 0.62 }, { z: 1.5, fs: 19, blur: 2.6, a: 0.5 }];
    const build = () => { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * D; cv.height = H * D; items = [];
      const n = Math.round((W * H) / 9000 * dens);
      for (let i = 0; i < n; i++) { const L = LAYERS[i % LAYERS.length]; items.push({ L, w: words[(Math.random() * words.length) | 0], x: Math.random() * W, y: Math.random() * H, glow: 0, nx: 0 }); } };
    build(); addEventListener('resize', build);
    addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    let last = performance.now();
    const tick = (now) => { RAF(tick); if (!host.isConnected) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      g.setTransform(D, 0, 0, D, 0, 0); g.clearRect(0, 0, W, H); g.textBaseline = 'middle';
      for (const L of LAYERS) { g.filter = L.blur ? 'blur(' + L.blur + 'px)' : 'none'; g.font = '500 ' + L.fs + 'px "JetBrains Mono", ui-monospace, monospace';
        for (const it of items) { if (it.L !== L) continue;
          it.y -= dt * 6 * L.z * spd; if (it.y < -20) { it.y = H + 20; it.x = Math.random() * W; it.w = words[(Math.random() * words.length) | 0]; }
          if (it.glow <= 0 && Math.random() < 0.0004 * spd) it.glow = 1; it.glow = Math.max(0, it.glow - dt * 0.45);
          const x = it.x - mx * 60 * L.z, y = it.y - my * 40 * L.z, a = (L.a + it.glow * 0.5) * op;
          g.globalAlpha = Math.min(1, a); g.fillStyle = it.glow > 0.05 ? '#dfe9f7' : col; g.fillText(it.w, x, y); } }
      g.filter = 'none'; g.globalAlpha = 1; };
    RAF(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-wordfield]').forEach(init);
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-wordfield] canvas')) setTimeout(poll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
