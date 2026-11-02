/* Wubble bounce cards: a fanned stack of cards that bounce in when scrolled into view; hovering one straightens it and
   pushes its neighbours aside (like React Bits <BounceCards />). Needs GSAP.
   Webflow: a container [data-wb-bouncecards] (position:relative, fixed height) with child cards [data-wb-bounce-card]
   (position:absolute, centred, Webflow sizes them). data-spread="85" (px between cards at 1440 wide) · data-push="160"
   · data-delay="0.2" · data-stagger="0.06" */
(() => {
  const ROT = [10, 5, -3, -10, 2, 7, -6];
  const init = (box) => {
    if (box.__wbbc) return; const g = window.gsap; if (!g) return; box.__wbbc = 1;
    const at = (k, d) => +(box.getAttribute('data-' + k) ?? d), cards = [...box.querySelectorAll('[data-wb-bounce-card]')], n = cards.length;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const k = () => Math.min(1, box.clientWidth / 1440 * 1.6); // smaller fan on narrow screens
    const base = (i) => ({ x: (i - (n - 1) / 2) * at('spread', 85) * k(), rotation: ROT[i % ROT.length] });
    cards.forEach((c, i) => g.set(c, { xPercent: -50, yPercent: -50, left: '50%', top: '50%', ...base(i), scale: 0, zIndex: i }));
    const home = (dur = 0.4) => cards.forEach((c, i) => g.to(c, { ...base(i), duration: dur, ease: 'back.out(1.4)', overwrite: 'auto' }));
    new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect();
      g.to(cards, { scale: 1, duration: still ? 0.2 : 1, ease: still ? 'none' : 'elastic.out(1, 0.8)', stagger: at('stagger', 0.06), delay: at('delay', 0.2) }); }, { threshold: 0.3 }).observe(box);
    if (matchMedia('(hover: none)').matches) return;
    cards.forEach((c, h) => {
      c.addEventListener('pointerenter', () => cards.forEach((o, i) => { const b = base(i);
        g.to(o, i === h ? { x: b.x, rotation: 0, duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' }
          : { x: b.x + Math.sign(i - h) * at('push', 160) * k(), rotation: b.rotation, duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' }); }));
      c.addEventListener('pointerleave', () => home());
    });
    addEventListener('resize', () => home(0));
  };
  const scan = () => document.querySelectorAll('[data-wb-bouncecards]').forEach(init);
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
