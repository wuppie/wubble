/* Wubble scroll text reveal: words rise out of a soft blur, one after another, when the text scrolls into view.
   Light replacement for the pixel reveal: the motion is a CSS transition (GPU), JS only splits words once and flips a class.
   Targets the same elements: [data-wb-lines], [data-wb-row-title], [data-wb-pixel] (menu items keep their own animation).
   Waits until the text is really visible (its section may still be faded out on the pinned homepage). Plays once. */
(() => {
  if (window.__wbTextReveal || matchMedia('(prefers-reduced-motion: reduce)').matches) return; window.__wbTextReveal = 1;
  const st = document.createElement('style');
  st.textContent = '.wb-tr-w{display:inline-block;opacity:0;transform:translate3d(0,.45em,0);filter:blur(8px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1),filter .9s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i) * 45ms)}'
    + '.wb-tr-on .wb-tr-w,.wb-tr-w.wb-tr-in{opacity:1;transform:none;filter:none}';
  document.head.appendChild(st);
  const effOp = (e) => { let o = 1; for (; e && e !== document.documentElement; e = e.parentElement) { o *= +getComputedStyle(e).opacity; if (o < 0.01) return 0; } return o; };
  const split = (el) => { let i = 0; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []; let n; while ((n = tw.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
    nodes.forEach((t) => { const f = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
        const s = document.createElement('span'); s.className = 'wb-tr-w'; s.style.setProperty('--i', Math.min(i++, 30)); s.textContent = p; f.appendChild(s); });
      t.parentNode.replaceChild(f, t); }); };
  const play = (el) => { const go = () => { if (!el.isConnected) return; if (effOp(el) < 0.6) return setTimeout(go, 150); el.classList.add('wb-tr-on'); }; go(); };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target); play(e.target); }), { rootMargin: '0px 0px -12% 0px' });
  const ok = (el) => !el.closest('[data-wb-menu]') && !el.hasAttribute('data-wb-menu-item') && ![...el.querySelectorAll('*')].some((d) => getComputedStyle(d).position === 'absolute'); /* hover roll copies are absolutely positioned: leave those alone */
  /* data-pixel-trigger="pin" (homepage About text): words appear one by one with the pinned scroll progress (window.__wbAboutProg, set by wb-sections) */
  const pins = []; let pinLoop = false;
  const pinTick = () => { requestAnimationFrame(pinTick); const p = Math.max(0, Math.min(1, window.__wbAboutProg || 0));
    pins.forEach((P) => { const k = Math.round(p * (P.w.length + 3)); if (k === P.k) return; P.k = k; P.w.forEach((w, i) => w.classList.toggle('wb-tr-in', i < k)); }); }; /* class flips only when the count changes */
  const scan = () => document.querySelectorAll('[data-wb-lines],[data-wb-row-title],[data-wb-pixel]').forEach((el) => { if (el.hasAttribute('data-wb-tr') || el.closest('[data-wb-tr]') || !ok(el)) return; el.setAttribute('data-wb-tr', ''); /* nested targets: the outer one already split its words */ split(el);
    if (el.getAttribute('data-pixel-trigger') === 'pin') { const w = [...el.querySelectorAll('.wb-tr-w')]; w.forEach((s) => s.style.setProperty('--i', 0)); pins.push({ w, k: -1 }); if (!pinLoop) { pinLoop = true; requestAnimationFrame(pinTick); } }
    else io.observe(el); });
  /* menu labels (wb-pages calls this when the menu opens): the same blur-rise on the whole label, which keeps its hover roll copies intact */
  window.wbPixelPlay = (el, delay) => el.animate([{ opacity: 0, filter: 'blur(8px)', transform: 'translate3d(0,.45em,0)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
    { duration: 900, delay: (delay || 0) * 1000, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  document.addEventListener('wb:swap', () => setTimeout(scan, 60)); /* in-page transitions bring in new text */
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', scan, { once: true }) : scan();
})();
