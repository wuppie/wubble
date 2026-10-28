/* Wubble V23 test: CRT section transitions — the screen switches off (collapses to a bright line, then a dot),
   then the next section dissolves in through an ordered-dither pattern. Driven by the scroll progress globals
   the sections already publish (__wbRP hero→work, __wbRQ work→about, __wbRA about→services, __wbR3 services→reach). */
(() => {
  if (window.__wbCrtFx) return; window.__wbCrtFx = 1;
  const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:95;pointer-events:none;image-rendering:pixelated;opacity:0;';
  const add = () => document.body.appendChild(cv); document.body ? add() : addEventListener('DOMContentLoaded', add);
  const g = cv.getContext('2d'); let img = null, W = 0, H = 0;
  const B8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map((v) => (v + 0.5) / 64);
  const PH = [61, 255, 122]; // green phosphor
  let fw = 0, fh = 0; const fit = () => { const iw = innerWidth || 0, ih = innerHeight || 0; if (iw < 2 || ih < 2) { img = null; return; } fw = iw; fh = ih; const px = Math.max(4, Math.round(Math.min(iw, ih) / 150)); W = Math.max(1, Math.ceil(iw / px)); H = Math.max(1, Math.ceil(ih / px)); cv.width = W; cv.height = H; img = g.createImageData(W, H); };
  fit(); addEventListener('resize', fit); addEventListener('load', fit);
  const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  let shown = false;
  const tick = () => { requestAnimationFrame(tick); if (!img || fw !== innerWidth || fh !== innerHeight) fit(); if (!img) return;
    const ps = [window.__wbRP, window.__wbRQ, window.__wbRA, window.__wbR3].map((v) => +v || 0);
    let p = -1; for (const v of ps) if (v > 0.003 && v < 0.997) { p = v; break; } /* the transition currently running */
    const lo = (window.WB_CRTFX_RANGE || [0.08, 0.92]); /* compress the effect into the middle of each handover */
    if (p >= 0) p = (p - lo[0]) / (lo[1] - lo[0]);
    if (p <= 0 || p >= 1) { if (shown) { cv.style.opacity = '0'; shown = false; } return; }
    if (!shown) { cv.style.opacity = '1'; shown = true; }
    const d = img.data, t = performance.now() / 1000, cy = (H - 1) / 2, cx = (W - 1) / 2;
    if (p < 0.5) { // switch-off: slit closes vertically, then the line shrinks to a dot
      const a = ss(p / 0.5), sh = Math.max(0.6, (1 - Math.min(1, a / 0.78)) * H / 2), lw = a < 0.78 ? W / 2 + 1 : Math.max(0.5, (1 - (a - 0.78) / 0.22) * W / 2), bright = Math.min(1, a * 1.3);
      for (let y = 0; y < H; y++) { const dy = Math.abs(y - cy); for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, dx = Math.abs(x - cx);
          const inside = dy <= sh && dx <= lw;
          if (!inside) { const edge = Math.max(0, 1 - Math.max(dy - sh, (dx - lw) * 0.25) / 2.2) * bright; d[i] = PH[0] * edge; d[i + 1] = PH[1] * edge; d[i + 2] = PH[2] * edge; d[i + 3] = 255; }
          else { const k = bright * (0.25 + 0.75 * (1 - dy / Math.max(1, sh))) * (a > 0.6 ? 1 : 0.6); d[i] = 200 + 55 * k; d[i + 1] = 255; d[i + 2] = 210 + 45 * k; d[i + 3] = Math.round(255 * Math.min(1, k * (0.35 + 0.65 * a))); } } }
    } else { // dithered dissolve in: black cells drop out by an 8×8 Bayer threshold, with a faint phosphor fringe + scanlines
      const b = ss((p - 0.5) / 0.5), dark = 1 - b;
      for (let y = 0; y < H; y++) { const scan = (y & 1) ? 0.82 : 1; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, th = B8[(y & 7) * 8 + (x & 7)], n = (Math.sin(x * 12.9898 + y * 78.233 + t * 40) * 43758.5453) % 1;
          const v = dark - th + (n - 0.5) * 0.08;
          if (v > 0.06) { d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = Math.round(255 * scan); }
          else if (v > -0.03) { d[i] = PH[0]; d[i + 1] = PH[1]; d[i + 2] = PH[2]; d[i + 3] = Math.round(200 * dark); }
          else d[i + 3] = 0; } }
    }
    g.putImageData(img, 0, 0);
  };
  tick();
})();
