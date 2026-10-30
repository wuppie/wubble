/* Wubble row hover (Services list): hovering a row rolls its title letter by letter (a copy rolls in from below,
   staggered, word-wrapped so multi-line titles work), slides the row content right, reveals an arrow, nudges the
   detail lines in one by one and dims the other rows. GSAP, mouse only (touch devices keep the plain link).
   Webflow: the row is a Link Block [data-wb-row] (href = the service page), its title [data-wb-row-title], the
   detail lines are <li> inside it. Opt out with data-wb-nohover. */
(() => {
  const ARROW = '↗';
  const split = (el) => {
    /* a title on one line stays on one line: the split letters are a hair wider and must not push the last word down */
    { const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize); if (el.getBoundingClientRect().height < lh * 1.5) el.style.whiteSpace = 'nowrap'; }
    const txt = el.textContent.trim(); el.setAttribute('aria-label', txt); el.textContent = '';
    const tops = [], bots = [];
    txt.split(/\s+/).forEach((w, i, all) => {
      const word = document.createElement('span'); word.setAttribute('aria-hidden', 'true');
      word.style.cssText = 'display:inline-block;position:relative;overflow:hidden;vertical-align:top;padding-bottom:0.08em;margin-bottom:-0.08em;';
      const top = document.createElement('span'), bot = document.createElement('span');
      top.style.cssText = 'display:block;white-space:pre;'; bot.style.cssText = 'display:block;white-space:pre;position:absolute;left:0;top:100%;';
      [...w].forEach((c) => { for (const [box, list] of [[top, tops], [bot, bots]]) { const s = document.createElement('span'); s.textContent = c; s.style.cssText = 'display:inline-block;will-change:transform;'; box.appendChild(s); list.push(s); } });
      word.append(top, bot); el.appendChild(word); if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return [tops, bots];
  };
  const prep = (row, rows) => {
    if (row.__rh || row.closest('[data-wb-nohover]')) return row.__go; const G = window.gsap, title = row.querySelector('[data-wb-row-title]'); if (!G || !title) return null; row.__rh = 1;
    const [L, B] = split(title), items = [...row.querySelectorAll('li')];
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = ARROW;
    arrow.style.cssText = 'display:inline-block;margin-left:0.25em;font-weight:400;opacity:0;transform:translate(-0.4em,0.4em);'; title.appendChild(arrow);
    G.set(B, { yPercent: 0, rotate: 6, opacity: 0 }); /* hidden copies fade too, so no sliver (descenders, rotated corners) peeks through */
    let tl = null;
    const go = (on) => {
      if (tl) tl.kill(); const ease = 'power3.inOut', d = 0.6;
      tl = G.timeline({ defaults: { ease, overwrite: 'auto' } })
        .to(L, { yPercent: on ? -100 : 0, rotate: on ? -6 : 0, opacity: on ? 0 : 1, duration: d, stagger: 0.014 }, 0)
        .to(B, { yPercent: on ? -100 : 0, rotate: on ? 0 : 6, opacity: on ? 1 : 0, duration: d, stagger: 0.014 }, 0)
        .to(title, { x: on ? 18 : 0, duration: 0.7, ease: 'power3.out' }, 0)
        .to(arrow, { opacity: on ? 1 : 0, x: on ? 0 : '-0.4em', y: on ? 0 : '0.4em', duration: 0.5, ease: 'power3.out' }, on ? 0.15 : 0)
        .to(items, { x: on ? 10 : 0, duration: 0.6, ease: 'power3.out', stagger: on ? 0.05 : 0 }, 0.05)
        .to(rows.filter((r) => r !== row), { opacity: on ? 0.32 : 1, duration: 0.5, ease: 'power2.out' }, 0);
    };
    return go;
  };
  const start = () => {
    if (matchMedia('(hover: none)').matches) return;
    if (!window.gsap) return setTimeout(start, 150);
    const rows = [...document.querySelectorAll('[data-wb-row]')]; if (!rows.length) return setTimeout(start, 300); // page may render after this script
    /* set up on first hover, so a title's own reveal animation (e.g. data-wb-lines) has finished before it is split */
    rows.forEach((r) => { const on = (v) => { const go = r.__go || (r.__go = prep(r, rows)); if (go) go(v); };
      r.addEventListener('mouseenter', () => on(true)); r.addEventListener('mouseleave', () => on(false)); r.addEventListener('focus', () => on(true)); r.addEventListener('blur', () => on(false)); });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
