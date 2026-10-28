/* Wubble animated film grain: a fixed full-screen noise layer (a few pre-rendered noise tiles cycled ~12 fps).
   Webflow: empty div [data-wb-grain]. Attributes: data-opacity="0.08" · data-fps="12" · data-size="160" (tile px) · data-blend="multiply" */
(() => {
  const init = (host) => {
    if (host.__gr) return; host.__gr = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d, S = +at('size', 160), N = 6;
    const tiles = []; for (let i = 0; i < N; i++) { const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S);
      for (let j = 0; j < im.data.length; j += 4) { const v = Math.random() * 255 | 0; im.data[j] = im.data[j + 1] = im.data[j + 2] = v; im.data[j + 3] = 255; } g.putImageData(im, 0, 0); tiles.push(c.toDataURL()); }
    const el = document.createElement('div'); el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:-50%;width:200%;height:200%;pointer-events:none;background-size:' + S + 'px ' + S + 'px;opacity:' + at('opacity', 0.08) + ';mix-blend-mode:' + at('blend', 'multiply') + ';';
    host.appendChild(el);
    let i = 0, lastT = 0; const step = 1000 / +at('fps', 12);
    const tick = (t) => { if (!host.isConnected) return; requestAnimationFrame(tick); if (t - lastT < step) return; lastT = t; i = (i + 1) % N;
      el.style.backgroundImage = 'url(' + tiles[i] + ')'; el.style.transform = 'translate3d(' + ((Math.random() * 10 - 5) | 0) + '%,' + ((Math.random() * 10 - 5) | 0) + '%,0)'; };
    requestAnimationFrame(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-grain]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  let n = 0; const poll = () => { run(); if (++n < 20) setTimeout(poll, 250); }; poll();
  document.addEventListener('wb:swap', run);
})();
