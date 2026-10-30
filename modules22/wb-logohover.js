/* Wubble logo hover: the "wubble" wordmark rolls its letters up in a quick wave (a copy rolls in from below) and
   rolls back when the pointer leaves. Needs GSAP.
   Webflow: data-wb-logo on the logo link/text (it must contain only the word). Found automatically: [data-logo-w] and the
   header / menu link whose text is "wubble". Reduced motion: no animation. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const prep = (el) => {
    if (el.__wbLogo || el.children.length) return; const txt = el.textContent.trim(); if (!txt) return; el.__wbLogo = 1;
    el.setAttribute('aria-label', txt); el.textContent = '';
    const tops = [], bots = [];
    [...txt].forEach((c) => { const w = document.createElement('span'), a = document.createElement('span'), b = document.createElement('span');
      w.setAttribute('aria-hidden', 'true'); w.style.cssText = 'position:relative;display:inline-block;overflow:hidden;vertical-align:top;line-height:1.1;';
      a.style.display = 'inline-block'; b.style.cssText = 'position:absolute;left:0;top:100%;display:inline-block;'; a.textContent = b.textContent = c;
      w.append(a, b); el.append(w); tops.push(a); bots.push(b); });
    const G = () => window.gsap;
    el.addEventListener('pointerenter', (e) => { const g = G(); if (!g || e.pointerType === 'touch') return;
      g.to([...tops, ...bots], { yPercent: -100, rotate: 0, duration: 0.55, ease: 'power3.inOut', stagger: { each: 0.035, from: 'start' }, overwrite: true });
      g.fromTo(bots, { rotate: 12 }, { rotate: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.035, delay: 0.1 }); });
    el.addEventListener('pointerleave', () => { const g = G(); if (!g) return;
      g.to([...tops, ...bots], { yPercent: 0, rotate: 0, duration: 0.5, ease: 'power3.inOut', stagger: { each: 0.03, from: 'end' }, overwrite: true }); });
  };
  const scan = () => {
    document.querySelectorAll('[data-wb-logo], [data-logo-w]').forEach(prep);
    document.querySelectorAll('[data-wb-site-header] a, [data-wb-menu] a, header a').forEach((a) => { if (a.textContent.trim().toLowerCase() === 'wubble') prep(a); });
  };
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
