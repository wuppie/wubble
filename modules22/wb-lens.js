/* Wubble "camera look" for the homepage (after ysuriadesign.co): one light overlay over the whole page instead of
   post-processing inside each WebGL scene. Film grain (a noise tile shifted by CSS, no per-frame JS), a vignette,
   a per-chapter colour grade (soft-light tint, eased between chapters), a focus pull on the astronaut (soft while scrolling, sharp when still)
   and a chapter counter "02 / 06 Work".
   Phones: grain + vignette + counter only (no blend layer, no focus pull: GPU budget). Remove the loader line to undo. */
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
  /* focus pull on the astronaut: he goes soft while you scroll (more blur the faster), a short rack-focus at each chapter
     change, and he settles back into sharp focus when you stop. CSS blur on his canvas only while it is > 0 (no cost when sharp). Desktop only. */
  const MAXB = 9; let cur = -1, lastY = scrollY, vel = 0, last = performance.now(), blur = 0, pulse = 0, shown = -1, astro = null;
  const frame = (now) => { requestAnimationFrame(frame); if (document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const c = chapter(); if (c !== cur) { if (cur >= 0) pulse = 1; cur = c; num.textContent = String(c + 1).padStart(2, '0'); name.textContent = CH[c][0]; if (grade) grade.style.backgroundColor = CH[c][1]; }
    if (coarse || still) return;
    const dy = scrollY - lastY; lastY = scrollY; vel += (Math.abs(dy) / Math.max(dt, 0.001) - vel) * (1 - Math.exp(-dt * 6)); /* px per second, smoothed */
    pulse = Math.max(0, pulse - dt * 1.4);
    const want = Math.min(MAXB, vel / 260 + Math.sin(Math.min(1, pulse) * Math.PI) * 6);
    blur += (want - blur) * (1 - Math.exp(-dt * (want > blur ? 7 : 3.5))); /* defocus quickly, refocus slowly like a lens */
    const b = blur < 0.15 ? 0 : Math.round(blur * 10) / 10; if (b === shown) return; shown = b;
    astro = astro && astro.isConnected ? astro : document.querySelector('.home_astronaut-layer canvas');
    if (astro) astro.style.filter = b ? 'blur(' + b + 'px)' : ''; };
  requestAnimationFrame(frame);
})();
