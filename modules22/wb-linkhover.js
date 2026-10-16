/* Wubble V22: link hover — GSAP letter roll. Each link's text is split into letters; on hover the letters
   roll up and a copy rolls in from below, staggered. Works on any <a> (Webflow: edit link text as usual).
   Opt out: data-wb-nohover on the link or a parent. */
(() => {
  const SKIP = '[data-wb-nohover],[data-rw],[data-gt],[data-gw],[aria-hidden="true"]';
  const prep = (a) => {
    if (a.__lh || a.closest(SKIP) || a.querySelector('img,svg,canvas,video,[data-rw]')) return;
    const txt = a.textContent; if (!txt || !txt.trim() || txt.length > 60 || a.children.length) return;
    a.__lh = 1; a.setAttribute('aria-label', txt.trim());
    const cs = getComputedStyle(a); if (cs.display === 'inline') a.style.display = 'inline-block';
    a.style.overflow = 'hidden'; a.style.verticalAlign = 'top';
    const mk = (cls) => { const w = document.createElement('span'); w.setAttribute('aria-hidden', 'true'); w.style.cssText = 'display:block;white-space:pre;' + (cls ? 'position:absolute;left:0;top:100%;' : 'position:relative;');
      [...txt].forEach((c) => { const s = document.createElement('span'); s.textContent = c; s.style.display = 'inline-block'; s.style.willChange = 'transform'; w.appendChild(s); }); return w; };
    a.textContent = ''; a.style.position = a.style.position || 'relative';
    const inner = document.createElement('span'); inner.setAttribute('aria-hidden', 'true'); inner.style.cssText = 'display:block;position:relative;';
    const top = mk(false), bot = mk(true); inner.append(top, bot); a.appendChild(inner);
    const L = [...top.children], B = [...bot.children];
    let tl = null;
    const go = (on) => { const G = window.gsap; if (!G) return; const P = window.__wbLink || {}; if (P.on === false) return;
      if (tl) tl.kill(); const d = P.dur ?? 0.5, st = P.stagger ?? 0.022, ease = P.ease || 'power3.inOut';
      tl = G.timeline();
      tl.to(L, { yPercent: on ? -100 : 0, rotate: on ? -6 : 0, duration: d, ease, stagger: st }, 0)
        .to(B, { yPercent: on ? -100 : 0, rotate: 0, duration: d, ease, stagger: st }, 0);
      if (!on) tl.set(B, { rotate: 0 }); };
    G0(() => { window.gsap.set(B, { rotate: 6 }); });
    a.addEventListener('mouseenter', () => go(true)); a.addEventListener('mouseleave', () => go(false));
    a.addEventListener('focus', () => go(true)); a.addEventListener('blur', () => go(false));
  };
  const G0 = (f) => { if (window.gsap) f(); else setTimeout(() => G0(f), 150); };
  const scan = () => document.querySelectorAll('a').forEach(prep);
  const start = () => { if (matchMedia('(hover: none)').matches) return; scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 300); }).observe(document.body, { childList: true, subtree: true }); };
  // don't wait for window 'load' (3D models keep the page loading for a long time)
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', () => setTimeout(start, 800), { once: true }); else setTimeout(start, 800);
})();
