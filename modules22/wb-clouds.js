/* Wubble V22: hero clouds — "Live clouds" flythrough (mrdoob technique) drawn with Canvas 2D
   (no WebGL context, so it can't evict the slider/astronaut). Far sprites → [data-clouds-back], near → [data-clouds-front]. */
(() => {
  const boot = () => {
    const back = document.querySelector('[data-clouds-back]'), front = document.querySelector('[data-clouds-front]');
    if (!back || !front || !window.__wbClouds || window.__wbClouds.on === false) return false; if (back.__c) return true; back.__c = 1;
    const MOB = matchMedia('(pointer: coarse)').matches || innerWidth < 820; /* r14.23: phones use the 2D cloud engine (no extra WebGL context, which mobile browsers drop) */
    if (!MOB && (window.__wbClouds.engine || 'WebGL') === 'WebGL' && window.__wbCloudsGL) { window.__wbCloudsGL(back, front).catch((e) => console.warn('clouds gl failed', e)); return true; }
    const img = new Image(); img.src = (window.WB_ASSETS || './') + 'models/cloud10.png';
    const mk = (host) => { const c = document.createElement('canvas'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c); return { c, g: c.getContext('2d') }; };
    const B = mk(back), F = mk(front), DEPTH = 1500, N = MOB ? 650 : 1400, S = []; /* fewer sprites on phones keeps it smooth */
    let fogC = '', fogI = null; const tintFog = (col) => { const t = document.createElement('canvas'); t.width = img.naturalWidth; t.height = img.naturalHeight; const x = t.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, t.width, t.height); return t; };
    for (let i = 0; i < N; i++) S.push({ x: Math.random() * 1000 - 500, y: -Math.random() * Math.random() * 200 - 15, z: (i / N) * DEPTH, r: Math.random() * Math.PI, s: Math.random() * Math.random() * 1.5 + 0.5 });
    const PR = 0.5; let W = 1, H = 1;
    const size = () => { W = Math.max(1, Math.round(innerWidth * PR)); H = Math.max(1, Math.round(innerHeight * PR)); for (const L of [B, F]) { L.c.width = W; L.c.height = H; } };
    size(); addEventListener('resize', size);
    let mx = 0, my = 0, cx = 0, cy = 0; addEventListener('pointermove', (e) => { mx = (e.clientX - innerWidth / 2) * 0.25; my = (e.clientY - innerHeight / 2) * 0.15; }, { passive: true });
    let pos = 0, last = performance.now(), lastRP = 0, wasOn = true;
    const tick = () => { requestAnimationFrame(tick); const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const P = window.__wbClouds || {}, rp = window.__wbRP || 0, sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
      const LG = P.linger ?? 1.8, op = P.on === false ? 0 : (P.amount ?? 1) * (1 - sm((P.hs ?? 0.04) + (P.hw ?? 0.16) * 0.35 * LG, (P.hs ?? 0.04) + (P.hw ?? 0.16) * (1 + 0.6 * LG), rp)); /* r14.24: same fade timing as the desktop WebGL clouds */
      back.style.opacity = front.style.opacity = op.toFixed(3);
      if (op < 0.003 || !img.complete) { lastRP = rp; if (wasOn) { B.g.clearRect(0, 0, W, H); F.g.clearRect(0, 0, W, H); wasOn = false; } return; } wasOn = true;
      pos = (pos + dt * 30 * (P.speed ?? 1) + Math.max(0, rp - lastRP) * 1400) % DEPTH; lastRP = rp;
      cx += (mx - cx) * 0.01; cy += (-my - cy) * 0.01;
      const f = (H / PR) / 2 / Math.tan(15 * Math.PI / 180) * PR, split = P.split ?? 200, fo = P.front ?? 0.4;
      B.g.clearRect(0, 0, W, H); F.g.clearRect(0, 0, W, H);
      const fc = P.fog || '#ffffff'; if (fc !== fogC && img.naturalWidth) { fogI = tintFog(fc); fogC = fc; }
      const L = []; for (const s of S) { let d = s.z - pos; if (d <= 0) d += DEPTH; L.push([d, s]); } L.sort((a, b) => b[0] - a[0]);
      for (const [d, s] of L) { if (d < 8) continue; const k = f / d, sz = 64 * s.s * k; if (sz < 2) continue;
        const px = W / 2 + (s.x - cx) * k, py = H / 2 - (s.y - cy) * k; if (px + sz < 0 || px - sz > W || py + sz < 0 || py - sz > H) continue;
        let a = Math.min(1, (d - 8) / 90); const ff = Math.min(1, Math.max(0, (d + 100) / (DEPTH + 100))); const near = d < split, G = near ? F.g : B.g; if (near) a *= fo; if (a < 0.01) continue;
        G.save(); G.translate(px, py); G.rotate(s.r); G.globalAlpha = a * (1 - ff); G.drawImage(img, -sz / 2, -sz / 2, sz, sz); if (fogI) { G.globalAlpha = a * ff; G.drawImage(fogI, -sz / 2, -sz / 2, sz, sz); } G.restore(); }
      B.g.globalAlpha = F.g.globalAlpha = 1; };
    tick(); return true;
  };
  const go = () => { try { if (!boot()) setTimeout(go, 1000); } catch (e) { console.warn('clouds failed', e); } };
  go();
})();
