/* Wubble V23: mirror the native scroll motion of every sticky panel. When a panel would slide in from
   the bottom (or leave through the top) it instead comes in from the top / leaves through the bottom. */
(() => {
  const SEL = '[data-panel],[data-cta-panel],[data-reach-panel]';
  const tick = () => {
    requestAnimationFrame(tick);
    const on = !!window.__wbAscend;
    document.querySelectorAll(SEL).forEach((el) => {
      const cur = el.__asc || 0, top = el.getBoundingClientRect().top - cur; // natural (un-mirrored) position
      const want = on && Math.abs(top) > 0.5 && Math.abs(top) < innerHeight * 1.5 ? -2 * top : 0;
      if (Math.abs(want - cur) < 0.25) return;
      el.__asc = want; el.style.translate = want ? '0 ' + want.toFixed(1) + 'px' : '';
    });
  };
  tick();
})();
