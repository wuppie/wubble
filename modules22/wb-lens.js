/* Wubble "camera look" for the homepage (after ysuriadesign.co): one light overlay over the whole page instead of
   post-processing inside each WebGL scene. Film grain (a noise tile shifted by CSS, no per-frame JS), a vignette,
   a per-chapter colour grade (soft-light tint, eased between chapters), and a chapter counter "02 / 05 Work".
   Phones: grain + vignette + counter only (no blend layer: GPU budget). Remove the loader line to undo. */
(() => {
  if (window.__wbLens || !document.querySelector('.section_home-hero')) return; window.__wbLens = 1;
  const coarse = matchMedia('(pointer: coarse)').matches, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* chapters: [name, tint] in page order; tint = colour grade (soft-light) */
  const CH = [['Wubble', '#8fa6c9'], ['Work', '#6f86b3'], ['About', '#c9a27c'], ['Services', '#c4564a'], ['Landing', '#d9c7a2']]; /* no Reach out: that section is switched off on the homepage */
  const GRADE = 0.32; /* strength of the colour grade */
  const q = (s) => document.querySelector(s), hero = q('.section_home-hero'), work = q('.section_home-work'), cta = q('.section_home-services'), reach = q('.section_home-reach');
  const chapter = () => { const V = innerHeight, left = document.documentElement.scrollHeight - V - scrollY;
    if (left < V * 0.6) return 4; /* footer (Landing) */
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
${coarse ? '.wb-lens-grade{mix-blend-mode:normal;opacity:.1}' : ''} /* phones: a plain see-through tint, no full-screen blend (GPU budget) */
/* chapter counter in the bottom-left corner of the top bar (where "digital motion" was), white; the number rolls on each change */
.home-nav_block-4{display:none!important}
.wb-lens-count{position:fixed;left:28px;bottom:32px;z-index:64;pointer-events:none;display:flex;gap:.5em;align-items:baseline;font:500 13px/1 Switzer,Helvetica,Arial,sans-serif;letter-spacing:.02em;color:#fff;transition:color .6s ease,opacity .4s ease}
.wb-lens-count.ink{color:#0e0e0d} /* over the light footer */ .wb-lens-count.end{opacity:0} /* page bottom: clear of the footer badge */
.wb-lens-count b{position:relative;display:inline-block;overflow:hidden;height:1em;font-weight:600}.wb-lens-count b span{display:block}
.wb-lens-count i{font-style:normal;opacity:.5}
.wb-lens-count em{font-style:normal;opacity:.7;margin-left:.6em;display:inline-block}
@media (max-width:767px){.wb-lens-count{left:20px;bottom:22px}}`;
  document.head.appendChild(st);
  const mk = (c) => { const e = document.createElement('div'); e.className = c; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; };
  mk('wb-lens-grain'); mk('wb-lens wb-lens-vig'); const grade = mk('wb-lens wb-lens-grade');
  const cnt = mk('wb-lens-count'); cnt.innerHTML = '<b><span>01</span></b><i>/</i><i>' + String(CH.length).padStart(2, '0') + '</i><em>' + CH[0][0] + '</em>';
  const num = cnt.querySelector('b'), name = cnt.querySelector('em');
  /* roll the number: the old one slides out (up when going forward, down when going back), the new one slides in; the name crossfades */
  const E = 'cubic-bezier(.7,0,.2,1)';
  const roll = (n, nm, fwd) => { const old = num.firstElementChild; if (old && old.textContent === n) return; const nw = document.createElement('span'); nw.textContent = n;
    if (!old || still) { num.replaceChildren(nw); name.textContent = nm; return; } nw.style.cssText = 'position:absolute;left:0;top:0'; num.appendChild(nw); const d = fwd ? 1 : -1;
    old.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-110 * d) + '%)' }], { duration: 650, easing: E, fill: 'forwards' }).onfinish = () => { old.remove(); nw.style.position = ''; };
    nw.animate([{ transform: 'translateY(' + (110 * d) + '%)' }, { transform: 'translateY(0)' }], { duration: 650, easing: E });
    name.animate([{ opacity: .7 }, { opacity: 0 }], { duration: 250, easing: 'ease-in' }).onfinish = () => { name.textContent = nm; name.animate([{ opacity: 0, transform: 'translateY(.4em)' }, { opacity: .7, transform: 'none' }], { duration: 450, easing: E }); }; };
  let cur = -1;
  const frame = () => { requestAnimationFrame(frame); if (document.hidden) return;
    const c = chapter(); if (c !== cur) { const cur0 = cur; cur = c; roll(String(c + 1).padStart(2, '0'), CH[c][0], c > cur0); if (grade) grade.style.backgroundColor = CH[c][1]; cnt.classList.toggle('ink', c === 4); }
    const end = scrollY > document.documentElement.scrollHeight - innerHeight - 140; if (end !== cnt.__end) { cnt.__end = end; cnt.classList.toggle('end', end); } };
  requestAnimationFrame(frame);
})();
