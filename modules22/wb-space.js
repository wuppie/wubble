/* Wubble V22: deep-space starfield + nebula behind the hero→work flight. Reads window.__wbRP (hero progress). */
(() => {
  const boot = () => {
    const host = document.querySelector('[data-space-host]'); if (!host || host.__sp) return !!host; host.__sp = 1;
    const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'; host.appendChild(cv);
    const g = cv.getContext('2d'); let W = 0, H = 0, dpr = 1;
    const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); addEventListener('resize', size);
    const N = 900, S = []; for (let i = 0; i < N; i++) S.push({ x: (Math.random() * 2 - 1), y: (Math.random() * 2 - 1), z: Math.random(), b: 0.4 + Math.random() * 0.6, c: Math.random() < 0.12 ? 1 : 0 });
    const neb = document.createElement('canvas'); neb.width = neb.height = 512; { const n = neb.getContext('2d');
      const blob = (x, y, r, c) => { const gr = n.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); n.fillStyle = gr; n.fillRect(0, 0, 512, 512); };
      blob(150, 200, 260, 'rgba(60,60,64,0.35)'); blob(380, 330, 230, 'rgba(38,38,42,0.4)'); blob(300, 120, 160, 'rgba(90,90,96,0.16)'); blob(90, 420, 180, 'rgba(30,30,34,0.35)'); }
    let lastRP = 0, vel = 0, op = 0, t0 = performance.now(), drift = 0;
    const frame = () => { requestAnimationFrame(frame);
      const now = performance.now(), dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      const rp = window.__wbRP || 0, rq = window.__wbRQ || 0, P = window.__wbSpace || {};
      const pp = rp + rq + (window.__wbRA || 0) + (window.__wbFootP || 0); /* warp only while moving between sections */ vel += ((pp - lastRP) / Math.max(0.001, dt) - vel) * (1 - Math.exp(-dt * 2.2)); lastRP = pp; /* slower response = softer ramp in/out */
      const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
      const tgt = P.on === false ? 0 : Math.max(sm(P.hs ?? 0.04, (P.hs ?? 0.04) + (P.hw ?? 0.16), rp) * (1 - (1 - (P.rest ?? 0.45)) * sm(0.85, 1, rp)), 0) * (1 - sm(0.3, 0.6, rq)); const f2 = (P.on === false ? 0 : 1) * sm(P.f2a ?? 0.28, (P.f2a ?? 0.28) + 0.1, rq) * (1 - sm(P.f2b ?? 0.6, (P.f2b ?? 0.6) + 0.12, rq)); const tg2 = Math.max(tgt, f2, P.on === false ? 0 : Math.min(1, (window.__wbFly || 0) * 1.3), window.__wbSpaceForce || 0);
      // galaxy mode: after the hero the space layer is the only background; hide panels that would sit on top of it (state-change only)
      if (window.__wbGalaxy) { const rpG = window.__wbRP || 0, rqG = window.__wbRQ || 0, spc = document.querySelector('[data-footer-spacer]'), fpG = spc ? Math.max(0, Math.min(1, 1 - spc.getBoundingClientRect().top / innerHeight)) : 0;
        window.__wbSpaceForce = rpG > 0.98 ? 1 : 0;
        const hideW = rqG > 0.995, hideC = fpG > 0.5;
        if (hideW !== window.__gW) { window.__gW = hideW; const w = document.querySelector('[data-panel]'); if (w) w.style.visibility = hideW ? 'hidden' : ''; }
        if (hideC !== window.__gC) { window.__gC = hideC; const c = document.querySelector('[data-cta-panel]'); if (c) c.style.visibility = hideC ? 'hidden' : ''; } }
      else if (window.__wbSpaceForce) window.__wbSpaceForce = 0;
      { const tg3 = Math.max(tg2, window.__wbSpaceForce || 0); op += (tg3 - op) * (1 - Math.exp(-dt * 16)); } host.style.opacity = op.toFixed(3);
      // hero white bg = its own layer, faded with opacity only (GPU, no repaint) and eased in/out
      { const st = window.__wbStudio || (window.__wbStudio = document.querySelector('[data-hero-studio]'));
        const L = st && st.querySelector('[data-hero-bg]'); if (L) { if (st.__bgO == null) st.__bgO = 1;
          const k = Math.min(1, Math.max(op, tg2) / Math.max(0.05, P.rest ?? 0.45)), tgtO = 1 - (k * k * (3 - 2 * k)) * (P.see ?? 1);
          st.__bgO += (tgtO - st.__bgO) * (1 - Math.exp(-dt * (P.bgSpeed ?? 14))); const ov = st.__bgO.toFixed(3); if (L.__o !== ov) { L.__o = ov; L.style.opacity = ov; } } }
      // footer: same galaxy, mirrored into a canvas behind the footer content while the footer is on screen
      const FT = window.__wbFt || (window.__wbFt = document.querySelector('[data-footer]')); let fc = null;
      if (FT && (P.footer ?? true) && FT.style.visibility !== 'hidden') { fc = FT.__gx; if (!fc) { fc = FT.__gx = document.createElement('canvas'); fc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;'; FT.insertBefore(fc, FT.firstChild); fc.__g = fc.getContext('2d'); } }
      else if (FT && FT.__gx && FT.__gx.style.display !== 'none') FT.__gx.style.display = 'none';
      if (fc) fc.style.display = '';
      if (!fc && op < 0.003 && (!window.__wbStudio || Math.abs((window.__wbStudio.__bgO ?? 1) - 1) < 0.002)) return;
      const wr = Math.min(1, Math.abs(vel) * 1.1), warp = wr * wr * (3 - 2 * wr) * (P.warp ?? 0.5), spd = 0.025 + warp * 0.45; drift += dt * 0.01;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#030303'; g.fillRect(0, 0, W, H);
      g.globalAlpha = 0.9; const ns = Math.max(W, H) * 1.5; g.drawImage(neb, W / 2 - ns / 2 + Math.sin(drift) * 40, H / 2 - ns / 2 + (window.__wbAscend ? 1 : -1) * rp * H * 0.3, ns, ns); g.globalAlpha = 1;
      const cx = W / 2, cy = window.__wbAscend ? -H * 0.6 : H * 0.45, f = Math.max(W, H) * 0.5;
      for (const s of S) { const z0 = s.z; s.z -= dt * spd * (vel >= 0 ? 1 : -1); if (s.z <= 0.02) { s.z += 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; } else if (s.z > 1) s.z -= 1;
        const px = cx + s.x / s.z * f * 0.5, py = cy + s.y / s.z * f * 0.5; if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;
        const a = Math.min(1, (1 - s.z) * 1.4) * s.b, rad = Math.max(0.4, (1 - s.z) * 1.8);
        g.strokeStyle = g.fillStyle = s.c ? 'rgba(210,210,215,' + a + ')' : 'rgba(255,255,255,' + a + ')';
        if (warp > 0.05) { const zt = Math.min(1, z0 + dt * spd * 6 * warp), qx = cx + s.x / zt * f * 0.5, qy = cy + s.y / zt * f * 0.5; g.lineWidth = rad; g.beginPath(); g.moveTo(qx, qy); g.lineTo(px, py); g.stroke(); }
        else { g.beginPath(); g.arc(px, py, rad, 0, 6.283); g.fill(); } }
      if (fc) { if (fc.width !== cv.width || fc.height !== cv.height) { fc.width = cv.width; fc.height = cv.height; } fc.__g.drawImage(cv, 0, 0); }
      { const SV = window.__wbSvc || (window.__wbSvc = document.querySelector('[data-svc]')); if (SV) { const hs = P.hs ?? 0.04, k = sm(hs, hs + (P.hw ?? 0.16) * 0.8, rp), ie = k * k;
          const v = ie < 0.001 ? '' : 'translate3d(0,' + (-ie * 14).toFixed(2) + 'vh,0)'; if (SV.style.transform !== v) { SV.style.transform = v; SV.style.opacity = ie < 0.001 ? '' : (1 - k).toFixed(3); SV.style.filter = ie < 0.001 ? '' : 'blur(' + (k * 10).toFixed(1) + 'px)'; SV.style.pointerEvents = k > 0.5 ? 'none' : ''; } } }
      // hero ink: black on white hero, fades to light as space takes over so the flying letters stay visible
      const ink = window.__heroInk; if (ink && !window.__wbSpaceForce) { const L = Math.min(1, op * 1.6); const a = ink.rgb, b = [236, 233, 226], c = a.map((v, i) => Math.round(v + (b[i] - v) * L)); const col = 'rgb(' + c.join(',') + ')'; if (col !== ink.last) { ink.last = col; ink.els.forEach((e) => { if (e) e.style.color = col; }); } }
    };
    frame(); return true;
  };
  if (!boot()) { const iv = setInterval(() => { if (boot()) clearInterval(iv); }, 300); }
})();
