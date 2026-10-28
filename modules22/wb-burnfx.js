/* Wubble V23 test: shader.se-style burn-through section transition — 2D canvas only (no extra WebGL context).
   Old section dims, a soft white glow blooms in the centre, then burns open with a hot ragged edge that grows
   past the viewport. Scroll-tied. Uses __wbRP (hero→work) and __wbR3 (services→reach); About in/out uses the camera crane. */
(() => {
  if (window.__wbBurnFx) return; window.__wbBurnFx = 1;
  const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:95;pointer-events:none;opacity:0;';
  const add = () => document.body.appendChild(cv); document.body ? add() : addEventListener('DOMContentLoaded', add);
  const g = cv.getContext('2d'); let img = null, W = 0, H = 0, fw = 0, fh = 0;
  const A = 256, rag = new Float32Array(A), seed = Array.from({ length: 6 }, (_, i) => [Math.random() * 6.28, 2 + i * 3 + Math.random() * 2]);
  const fit = () => { const iw = innerWidth || 0, ih = innerHeight || 0; if (iw < 2 || ih < 2) return false; if (iw === fw && ih === fh && img) return true; fw = iw; fh = ih;
    const px = iw < 700 ? 3 : 4; W = Math.ceil(iw / px); H = Math.ceil(ih / px); cv.width = W; cv.height = H; img = g.createImageData(W, H); return true; };
  const ss = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  let shown = false;
  const tick = () => { requestAnimationFrame(tick); if (!fit()) return;
    const ps = (window.WB_BURN_SOURCES || (window.__wbAboutDesk ? ['__wbRP', '__wbR3'] : ['__wbRP', '__wbRQ', '__wbRA', '__wbR3'])).map((k) => +window[k] || 0);
    let p = -1; for (const x of ps) if (x > 0.003 && x < 0.997) { p = x; break; }
    const lo = window.WB_BURNFX_RANGE || [0.06, 0.94]; if (p >= 0) p = (p - lo[0]) / (lo[1] - lo[0]);
    if (p <= 0 || p >= 1) { if (shown) { cv.style.opacity = '0'; shown = false; } return; }
    if (!shown) { cv.style.opacity = '1'; shown = true; }
    const t = performance.now() / 1000;
    for (let i = 0; i < A; i++) { const a = i / A * 6.2832; let s = 0; for (let k = 0; k < seed.length; k++) s += Math.sin(a * seed[k][1] + seed[k][0] + t * (0.3 + k * 0.17)) / (k + 1.5); rag[i] = s * 0.07; }
    const dim = ss(0, 0.28, p), bloom = ss(0.12, 0.42, p), op = ss(0.46, 1, p), solid = 1 - ss(0.46, 0.6, p);
    const asp = W / H, R0 = 0.05 + 0.15 * bloom, R = R0 + (1.25 * Math.max(asp, 1) + 0.4 - R0) * op;
    const d = img.data, cx = W * 0.5, cy = H * 0.48, inv = 1 / H;
    for (let y = 0; y < H; y++) { const qy = (y - cy) * inv; for (let x = 0; x < W; x++) { const qx = (x - cx) * inv, r = Math.hypot(qx, qy);
        const ai = ((Math.atan2(qy, qx) / 6.2832 + 1) * A | 0) % A, rr = r + rag[ai] * (0.5 + r), dd = rr - R, i = (y * W + x) * 4;
        let cr = 11, cg = 11, cb = 10, al = dim;
        if (dd < 0) { if (solid * bloom > 0.01) { al = solid * bloom; cr = 255; cg = 250; cb = 240; } else al = 0;
          const rim = Math.exp(dd * 90) * op; if (rim > 0.02) { al = Math.max(al, rim); cr = 255; cg = 230 + 25 * rim; cb = 180 + 60 * rim; } }
        else { const halo = Math.exp(-dd * 9) * bloom * (1 - op * 0.55), rim = Math.exp(-dd * 140) * op, emb = Math.exp(-dd * 38) * op * 0.35;
          const sp = op > 0 && dd < 0.03 && ((Math.sin(x * 12.99 + y * 78.23 + t * 30) * 43758.5) % 1 + 1) % 1 > 0.86 ? op : 0;
          cr += 255 * (halo * 0.55 + rim * 1.6 + sp) + 140 * emb; cg += 247 * halo * 0.55 + 200 * rim * 1.6 + 240 * sp + 80 * emb; cb += 230 * halo * 0.55 + 120 * rim * 1.6 + 220 * sp + 38 * emb;
          al = Math.max(al, Math.min(1, rim * 1.4 + sp), Math.min(1, halo * 0.9) * dim); }
        d[i] = Math.min(255, cr); d[i + 1] = Math.min(255, cg); d[i + 2] = Math.min(255, cb); d[i + 3] = al * 255; } }
    g.putImageData(img, 0, 0);
  };
  tick();
})();
