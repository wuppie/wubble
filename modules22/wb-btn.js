/* Wubble buttons (behaviour; look in wb-btn.css). Every [data-wb-btn] gets the same hover:
   a fill that grows from where the cursor enters and shrinks toward where it leaves, the label rolls up (a copy rolls in
   from below), and a light magnetic pull toward the cursor that springs back. Touch: no hover effects. Reduced motion: fill only. */
(() => {
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return 1; const [r, g, b] = m.map(Number); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const wrapLabels = (btn) => {
    const rolls = [];
    const wrap = (node) => { const txt = node.textContent; if (!txt.trim()) return; const w = document.createElement('span'); w.className = 'wb-btn-l';
      const a = document.createElement('span'), b = document.createElement('span'); a.textContent = txt; b.textContent = txt; b.setAttribute('aria-hidden', 'true'); w.append(a, b); node.replaceWith(w); rolls.push(a, b); };
    [...btn.childNodes].forEach((n) => { if (n.nodeType === 3) wrap(n); else if (n.nodeType === 1 && !n.children.length && n.textContent.trim() && n.getAttribute('aria-hidden') !== 'true') wrap(n.firstChild); });
    return rolls;
  };
  const prep = (btn) => {
    if (btn.__wbBtn) return; btn.__wbBtn = 1;
    const fill = document.createElement('span'); fill.className = 'wb-btn-fill'; fill.setAttribute('aria-hidden', 'true'); btn.prepend(fill);
    const rolls = wrapLabels(btn), tops = rolls.filter((_, i) => i % 2 === 0), bots = rolls.filter((_, i) => i % 2 === 1);
    const G = () => window.gsap, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let base = null, ink = null;
    const at = (e) => { const r = btn.getBoundingClientRect(); return { x: (e.clientX ?? r.left + r.width / 2) - r.left, y: (e.clientY ?? r.top + r.height / 2) - r.top, r }; };
    const enter = (e) => { const g = G(); if (!g) return; const p = at(e);
      base = getComputedStyle(btn).color; const solid = btn.getAttribute('data-wb-btn') === 'solid';
      const fc = solid ? (lum(getComputedStyle(btn).backgroundColor) > 0.5 ? 'rgb(14,14,13)' : 'rgb(244,244,242)') /* rgb, not hex: lum() reads rgb */ : base; ink = lum(fc) > 0.5 ? '#0e0e0d' : '#f4f4f2';
      fill.style.background = fc; const R = Math.hypot(Math.max(p.x, p.r.width - p.x), Math.max(p.y, p.r.height - p.y)) * 2;
      g.killTweensOf(fill); g.fromTo(fill, { left: p.x, top: p.y, width: 0, height: 0 }, { width: R, height: R, duration: still ? 0.2 : 0.55, ease: 'power3.out' });
      g.to(btn, { color: ink, borderColor: 'transparent', duration: 0.3, ease: 'power2.out' });
      if (!still && tops.length) { g.to(tops, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }); g.to(bots, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }); } };
    const leave = (e) => { const g = G(); if (!g) return; const p = at(e);
      g.killTweensOf(fill); g.to(fill, { left: p.x, top: p.y, width: 0, height: 0, duration: still ? 0.2 : 0.5, ease: 'power3.inOut' });
      g.to(btn, { color: base || '', clearProps: 'borderColor', duration: 0.35, ease: 'power2.out', onComplete: () => { btn.style.color = ''; } });
      if (!still && tops.length) { g.to([...tops, ...bots], { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }); }
      if (!still) g.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' }); };
    const move = (e) => { const g = G(); if (!g || still) return; const p = at(e), dx = p.x - p.r.width / 2, dy = p.y - p.r.height / 2;
      g.to(btn, { x: Math.max(-10, Math.min(10, dx * 0.22)), y: Math.max(-8, Math.min(8, dy * 0.35)), duration: 0.5, ease: 'power3.out' }); };
    /* specular buttons: glint and highlight follow the cursor */
    const spec = (e) => { if (!btn.hasAttribute('data-wb-specular')) return; const p = at(e); btn.setAttribute('data-wb-spec-on', '');
      btn.style.setProperty('--wb-sx', p.x + 'px'); btn.style.setProperty('--wb-sy', p.y + 'px'); btn.style.setProperty('--wb-sa', (Math.atan2(p.y - p.r.height / 2, p.x - p.r.width / 2) * 180 / Math.PI - 169) + 'deg' /* glint peak (72% of the cone) points at the cursor */); };
    btn.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') enter(e); });
    btn.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') leave(e); btn.removeAttribute('data-wb-spec-on'); });
    btn.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') { move(e); spec(e); } });
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) enter({}); }); btn.addEventListener('blur', () => leave({}));
  };
  /* the ink cursor fades out over buttons, links and other click targets (read by wb-cursor.js and the homepage cursor) */
  const HIDE = 'a,button,[role=button],[data-wb-btn],[data-wb-reflect],[data-wb-row],[data-wb-bounce-card],[data-wb-cursor-hide]';
  addEventListener('pointerover', (e) => { window.__wbCursorHide = !!(e.target.closest && e.target.closest(HIDE)) && !e.target.closest('[data-wb-cursor-keep]'); }, { passive: true });
  const scan = () => document.querySelectorAll('[data-wb-btn]').forEach(prep);
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
