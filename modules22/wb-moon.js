/* Wubble V23: big moon rising on the footer horizon (Canvas 2D, pre-shaded once from an equirect moon map). */
(() => {
  const shade = (img, R) => {
    const t = document.createElement('canvas'); t.width = img.width; t.height = img.height; const tg = t.getContext('2d'); tg.drawImage(img, 0, 0); const src = tg.getImageData(0, 0, t.width, t.height).data;
    const c = document.createElement('canvas'); c.width = c.height = R * 2; const g = c.getContext('2d'), id = g.createImageData(R * 2, R * 2), D = id.data;
    const L = [-0.45, 0.55, 0.7], ln = Math.hypot(...L); L[0] /= ln; L[1] /= ln; L[2] /= ln;
    for (let y = 0; y < R * 2; y++) for (let x = 0; x < R * 2; x++) { const nx = (x - R + 0.5) / R, ny = (R - y - 0.5) / R, q = nx * nx + ny * ny; if (q > 1) continue; const nz = Math.sqrt(1 - q);
      const lon = Math.atan2(nx, nz) + 0.6, lat = Math.asin(ny), u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1, v = 0.5 - lat / Math.PI;
      const si = ((Math.min(t.height - 1, v * t.height | 0)) * t.width + (u * t.width | 0)) * 4, dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), lit = 0.06 + 0.94 * Math.pow(dif, 0.8), rim = Math.min(1, (1 - q) * 40);
      const o = (y * R * 2 + x) * 4, gr = (src[si] * 0.299 + src[si + 1] * 0.587 + src[si + 2] * 0.114) * lit * 1.05;
      D[o] = D[o + 1] = gr; D[o + 2] = gr * 1.03; D[o + 3] = 255 * rim; }
    g.putImageData(id, 0, 0); return c;
  };
  const boot = () => {
    const ft = document.querySelector('[data-footer]'); if (!ft || !window.__wbAscend) return false; if (ft.__moon) return true; ft.__moon = 1;
    const img = new Image(); img.src = './models/moon_1024.jpg';
    img.onload = () => {
      const R = Math.min(900, Math.round(Math.max(innerWidth, innerHeight) * 0.55)), moon = shade(img, R);
      const wrap = document.createElement('div'); wrap.setAttribute('aria-hidden', 'true'); wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;';
      moon.style.cssText = 'position:absolute;left:50%;top:100%;width:min(150vw,170vh);height:auto;aspect-ratio:1;transform:translate(-50%,-38%);filter:drop-shadow(0 0 6vmin rgba(255,255,255,0.12));will-change:transform;';
      wrap.appendChild(moon); ft.insertBefore(wrap, ft.firstChild);
      const tick = () => { requestAnimationFrame(tick); const rc = ft.getBoundingClientRect(), vh = innerHeight; if (rc.bottom < 0 || rc.top > vh) return;
        const k = Math.max(0, Math.min(1, 1 - rc.top / vh)), e = 1 - Math.pow(1 - k, 3); moon.style.transform = 'translate(-50%,' + (-8 - 34 * e).toFixed(2) + '%)'; };
      tick();
    };
    return true;
  };
  const go = () => { try { if (!boot()) setTimeout(go, 800); } catch (e) { console.warn('moon failed', e); } };
  go();
})();
