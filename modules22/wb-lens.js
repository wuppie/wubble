/* Wubble "camera look" for the homepage (after ysuriadesign.co): one light overlay over the whole page instead of
   post-processing inside each WebGL scene. Film grain (a noise tile shifted by CSS, no per-frame JS), a vignette,
   a per-chapter colour grade (soft-light tint, eased between chapters), out-of-focus bokeh dots drifting in depth
   (a small 2D canvas, a few dozen pre-drawn sprites, parallax on scroll) and a chapter counter "02 / 06 Work".
   Phones: grain + vignette + counter only (no blend layer, no bokeh: GPU budget). Remove the loader line to undo. */
(() => {
  if (window.__wbLens || !document.querySelector('.section_home-hero')) return; window.__wbLens = 1;
  const coarse = matchMedia('(pointer: coarse)').matches, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* chapters: [name, tint] in page order; tint = colour grade (soft-light) */
  const CH = [['Wubble', '#8fa6c9'], ['Work', '#6f86b3'], ['About', '#c9a27c'], ['Services', '#c4564a'], ['Reach out', '#8a78c2'], ['Landing', '#d9c7a2']];
  const GRADE = 0.32; /* strength of the colour grade */
  const q = (s) => document.querySelector(s), hero = q('.section_home-hero'), work = q('.section_home-work'), cta = q('.section_home-services'), reach = q('.section_home-reach');
  const chapter = () => { const V = innerHeight, left = document.documentElement.scrollHeight - V - scrollY;
    if (left < V * 0.6) return 5;
    if (reach && reach.getBoundingClientRect().top < V * 0.5) return 4;
    if (cta) { const t = cta.getBoundingClientRect().top; if (t < V * 0.5) return -t / V >= 4.4 ? 3 : 2; } /* the pinned panel: About first, Services from ~4.4 screens in */
    if (work && work.getBoundingClientRect().top < V * 0.5) return 1;
    return 0; };
  /* noise tile for the grain */
  const nz = document.createElement('canvas'); nz.width = nz.height = 160; { const g = nz.getContext('2d'), d = g.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  const st = document.createElement('style');
  st.textContent = `
.wb-lens{position:fixed;inset:0;pointer-events:none;z-index:60}
.wb-lens-grain{position:fixed;inset:-160px;pointer-events:none;z-index:60;opacity:.075;background:url(${nz.toDataURL()}) repeat;${still ? '' : 'animation:wbGrain .7s steps(7) infinite;'}}
@keyframes wbGrain{0%{transform:translate(0,0)}15%{transform:translate(-37px,23px)}30%{transform:translate(19px,-53px)}45%{transform:translate(-61px,-11px)}60%{transform:translate(41px,67px)}75%{transform:translate(-13px,47px)}90%{transform:translate(59px,-29px)}100%{transform:translate(0,0)}}
.wb-lens-vig{background:radial-gradient(120% 95% at 50% 50%,transparent 52%,rgba(0,0,0,.5) 100%)}
.wb-lens-grade{mix-blend-mode:soft-light;opacity:${GRADE};transition:background-color 1.6s ease}
.wb-lens-count{position:fixed;top:34px;right:132px;z-index:64;pointer-events:none;display:flex;gap:.55em;align-items:baseline;font:500 13px/1 Switzer,Helvetica,Arial,sans-serif;letter-spacing:.02em;color:#f2f1ee;mix-blend-mode:difference}
.wb-lens-count b{font-weight:600}.wb-lens-count i{font-style:normal;opacity:.45}
.wb-lens-count em{font-style:normal;opacity:.6;margin-left:.6em;display:inline-block;transition:opacity .4s ease,transform .4s ease}
@media (max-width:767px){.wb-lens-count{top:auto;bottom:22px;right:auto;left:20px}}`;
  document.head.appendChild(st);
  const mk = (c) => { const e = document.createElement('div'); e.className = c; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; };
  mk('wb-lens-grain'); mk('wb-lens wb-lens-vig'); const grade = coarse ? null : mk('wb-lens wb-lens-grade');
  const cnt = mk('wb-lens-count'); cnt.innerHTML = '<b>01</b><i>/</i><i>06</i><em>' + CH[0][0] + '</em>';
  const num = cnt.querySelector('b'), name = cnt.querySelector('em');
  /* bokeh: soft discs with a brighter rim, a few sizes, pre-drawn once and tinted by the chapter colour */
  let bk = null, bg = null, BW = 0, BH = 0; const dots = [];
  if (!coarse && !still) {
    bk = document.createElement('canvas'); bk.className = 'wb-lens'; bk.setAttribute('aria-hidden', 'true'); document.body.appendChild(bk); bg = bk.getContext('2d');
    const size = () => { BW = bk.width = Math.round(innerWidth * 0.75); BH = bk.height = Math.round(innerHeight * 0.75); bk.style.width = '100%'; bk.style.height = '100%'; };
    size(); addEventListener('resize', size);
    for (let i = 0; i < 34; i++) { const z = Math.random(); dots.push({ x: Math.random(), y: Math.random(), z, r: 6 + z * z * 46, a: 0.05 + 0.13 * (1 - z * 0.5), vx: (Math.random() - 0.5) * 0.004, vy: -0.002 - Math.random() * 0.004, ph: Math.random() * 6.28 }); }
  }
  const disc = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.72, 'rgba(255,255,255,.7)'); gr.addColorStop(0.86, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 64, 0, 7); g.fill(); return c; })();
  const tint = document.createElement('canvas'); tint.width = tint.height = 128; const tg = tint.getContext('2d'); let tintC = '';
  const setTint = (c) => { if (c === tintC) return; tintC = c; tg.clearRect(0, 0, 128, 128); tg.globalCompositeOperation = 'source-over'; tg.drawImage(disc, 0, 0); tg.globalCompositeOperation = 'source-atop'; tg.fillStyle = c; tg.globalAlpha = 0.55; tg.fillRect(0, 0, 128, 128); tg.globalAlpha = 1; };
  let cur = -1, lastY = scrollY, vel = 0, last = performance.now();
  const frame = (now) => { requestAnimationFrame(frame); if (document.hidden) return;
    const c = chapter(); if (c !== cur) { cur = c; num.textContent = String(c + 1).padStart(2, '0'); name.textContent = CH[c][0]; if (grade) grade.style.backgroundColor = CH[c][1]; setTint(CH[c][1]); }
    if (!bg) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const dy = scrollY - lastY; lastY = scrollY; vel += (dy - vel) * 0.15;
    bg.clearRect(0, 0, BW, BH);
    for (const d of dots) { d.x += d.vx * dt * 10; d.y += d.vy * dt * 10 - vel * (0.2 + d.z * 1.6) / BH; d.ph += dt * 0.6;
      if (d.y < -0.15) d.y += 1.3; if (d.y > 1.15) d.y -= 1.3; if (d.x < -0.1) d.x += 1.2; if (d.x > 1.1) d.x -= 1.2;
      const r = d.r * (BW / 1080), al = d.a * (0.75 + 0.25 * Math.sin(d.ph)); bg.globalAlpha = al; bg.drawImage(tint, d.x * BW - r, d.y * BH - r, r * 2, r * 2); }
    bg.globalAlpha = 1; };
  requestAnimationFrame(frame);
})();
