/* Wubble "Dust" background: near-black space with soft grey bokeh dust — sharp tiny specks + large blurred out-of-focus
   flecks in depth, concentrated along a faint diagonal band, slowly drifting; deeper layers move less with the mouse.
   2D canvas, fixed behind the page. Webflow: empty div [data-wb-dust].
   Attributes: data-density="1" · data-speed="1" · data-mouse="1" · data-bg="#0e0e0f" · data-band="1" (diagonal dust band strength) */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const sprite = (blur) => { const s = 64, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'), gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    const hard = 1 - blur; gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(Math.max(0.05, hard * 0.55), 'rgba(255,255,255,' + (0.55 + hard * 0.4) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); return c; };
  const init = (host) => {
    if (host.__du) return; host.__du = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d, DEN = +at('density', 1), SPD = +at('speed', 1), MI = +at('mouse', 1), BAND = +at('band', 1);
    host.style.background = at('bg', '#0e0e0f');
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;display:block;'; host.appendChild(cv);
    const g = cv.getContext('2d'), SP = [sprite(0.1), sprite(0.55), sprite(0.95)];
    let W = 0, H = 0, D = 1, P = [], haze = null;
    const bandY = (x) => H * 0.42 - (x - W * 0.3) * 0.35; /* diagonal: rises to the right */
    const build = () => { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * D; cv.height = H * D; P = [];
      const n = Math.round(W * H / 2600 * DEN);
      for (let i = 0; i < n; i++) { const z = Math.random(), x = Math.random() * W; const inBand = Math.random() < 0.55 * BAND; const y = inBand ? bandY(x) + (Math.random() + Math.random() + Math.random() - 1.5) * H * 0.22 : Math.random() * H;
        const far = z < 0.6, big = z > 0.92; P.push({ x, y, z, r: big ? 6 + Math.random() * 16 : far ? 0.6 + Math.random() * 1.4 : 1.5 + Math.random() * 3.5, s: big ? 2 : far ? 0 : 1, a: big ? 0.05 + Math.random() * 0.07 : far ? 0.12 + Math.random() * 0.35 : 0.08 + Math.random() * 0.16, tw: Math.random() * 6.28, vx: (Math.random() - 0.5) * 2, vy: -1 - Math.random() * 2 }); }
      /* soft haze along the band */
      haze = document.createElement('canvas'); haze.width = W; haze.height = H; const hg = haze.getContext('2d'); /* full resolution: the old 1/4-size haze upscaled into a visible grid */
      for (let i = 0; i < 46; i++) { const x = Math.random() * W, y = bandY(x) + (Math.random() - 0.5) * H * 0.3, rr = 60 + Math.random() * 200, gr = hg.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(150,150,155,' + (0.05 + Math.random() * 0.06) * BAND + ')'); gr.addColorStop(1, 'rgba(150,150,155,0)'); hg.fillStyle = gr; hg.fillRect(0, 0, haze.width, haze.height); }
      /* dither: breaks the 8-bit banding of the faint gradients */
      if (W > 0 && H > 0) { const im = hg.getImageData(0, 0, W, H), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 3; d[i] += n; d[i + 1] += n; d[i + 2] += n; } hg.putImageData(im, 0, 0); } };
    build(); addEventListener('resize', build);
    let mx = 0, my = 0, tx = 0, ty = 0; addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    let last = performance.now();
    const tick = (now) => { RAF(tick); if (!host.isConnected || document.hidden) return; const dt = Math.min(0.05, (now - last) / 1000); last = now, t = now / 1000;
      mx += (tx - mx) * (1 - Math.exp(-dt * 2)); my += (ty - my) * (1 - Math.exp(-dt * 2));
      g.setTransform(D, 0, 0, D, 0, 0); g.clearRect(0, 0, W, H);
      g.globalAlpha = 1; if (haze && haze.width > 0 && haze.height > 0) g.drawImage(haze, -mx * 20 * MI, -my * 14 * MI, W, H);
      for (const p of P) { p.x += p.vx * dt * SPD * (0.4 + p.z); p.y += p.vy * dt * SPD * (0.4 + p.z);
        if (p.y < -30) p.y = H + 30; if (p.x < -30) p.x = W + 30; else if (p.x > W + 30) p.x = -30;
        const k = (0.2 + p.z * 1.6) * MI, x = p.x - mx * 70 * k, y = p.y - my * 50 * k, r = p.r;
        g.globalAlpha = p.a * (0.75 + 0.25 * Math.sin(t * 1.2 + p.tw)); g.drawImage(SP[p.s], x - r, y - r, r * 2, r * 2); }
      g.globalAlpha = 1; };
    RAF(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-dust]').forEach(init);
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-dust] canvas')) setTimeout(poll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
