/* Wubble V22: ASCII title — the About title is re-drawn as animated ASCII characters
   (idea: three.js "ASCII effect" + a waving text plane). Canvas 2D only, no extra WebGL context.
   Each frame it reads the live position of every word span, so the existing letter-reveal in/out
   animation still drives it. Webflow: edit the h2 text as usual; add data-wb-ascii to any heading to use it. */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  initAsciiTitle() {
    const hosts = [...document.querySelectorAll('[data-about-title] h2, [data-fl-word], [data-wb-ascii]')]; if (!hosts.length) return;
    for (const h of hosts) if (!h.__ascii) { h.__ascii = 1; this.asciiOn(h); }
  },
  asciiOn(h) {
    const CHARS = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    const isAbout = !!h.closest('[data-about-title]'), isFoot = h.hasAttribute('data-fl-word'), layer = h.closest('[data-about-title]') || h.parentElement;
    const ink = getComputedStyle(h).color, hz = getComputedStyle(h).zIndex;
    const pre = document.createElement('pre'); pre.setAttribute('aria-hidden', 'true');
    pre.style.cssText = 'position:absolute;left:0;top:0;margin:0;padding:0;pointer-events:none;white-space:pre;font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-weight:500;color:' + (isFoot ? 'inherit' : '#fff') + ';' + (hz !== 'auto' ? 'z-index:' + hz + ';' : '');
    if (isAbout) layer.appendChild(pre); else h.insertAdjacentElement('afterend', pre);
    const src = document.createElement('canvas'), sg = src.getContext('2d', { willReadFrequently: true });
    let fs = 10, cw = 6, cols = 1, rows = 1, mx = 0, my = 0, tx = 0, ty = 0, last = '';
    const measure = () => { const P = this.props; fs = Math.max(6, Math.round((P.asciiCell ?? 9) * Math.min(1.3, Math.max(0.7, innerWidth / 1440))));
      sg.font = '500 ' + fs + 'px "JetBrains Mono", ui-monospace, monospace'; cw = sg.measureText('M').width || fs * 0.6;
      cols = Math.ceil(innerWidth / cw); rows = Math.ceil(innerHeight / fs); src.width = cols; src.height = rows;
      pre.style.fontSize = fs + 'px'; pre.style.lineHeight = fs + 'px'; pre.style.letterSpacing = '0px'; };
    measure(); addEventListener('resize', measure);
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    const words = () => { const g = [...h.querySelectorAll('[data-gw]')]; if (g.length) return g; const leaf = [...h.querySelectorAll('span')].filter((s) => !s.querySelector('span') && s.textContent.trim()); return leaf.length ? leaf : [h]; };
    const tick = () => { requestAnimationFrame(tick);
      const P = this.props, on = ((isFoot ? P.footerTitleFx : P.aboutTitleFx) || 'ASCII') === 'ASCII'; if (isFoot) pre.style.color = (getComputedStyle(h).getPropertyValue('--ink-footer') || '').trim() || ink;
      h.style.color = on ? 'transparent' : ''; pre.style.display = on ? '' : 'none'; if (!on) return;
      const lo = +getComputedStyle(layer).opacity, ab = document.querySelector('[data-about]'), ft = isFoot ? h.closest('footer') || layer : null; let vis = lo > 0.01 && getComputedStyle(h).visibility !== 'hidden'; if (ft) vis = vis && +getComputedStyle(ft).opacity > 0.01; if (ab && isAbout) vis = vis && +getComputedStyle(ab).opacity > 0.01;
      const W = words(), hr = h.getBoundingClientRect(); if (!vis || !W.length || hr.bottom < 0 || hr.top > innerHeight) { if (last) { pre.textContent = ''; last = ''; } return; }
      // 1. draw each word at its live (animated) position into a low-res buffer, clipped by its mask
      sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, cols, rows); sg.fillStyle = '#fff'; sg.textBaseline = 'alphabetic';
      for (const w of W) { const r = w.getBoundingClientRect(), mk = (w === h ? h : w.parentElement).getBoundingClientRect(), cs = getComputedStyle(w); if (!r.width) continue;
        const f = parseFloat(cs.fontSize) / fs; sg.save(); sg.beginPath(); sg.rect(mk.left / cw, mk.top / fs, mk.width / cw, mk.height / fs); sg.clip();
        sg.globalAlpha = +cs.opacity; sg.font = cs.fontWeight + ' ' + (parseFloat(cs.fontSize) / fs) + 'px ' + cs.fontFamily;
        const tf = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform); sg.translate(r.left / cw, (r.top + r.height * 0.82) / fs); sg.scale(fs / cw, 1);
        sg.transform(tf.a, tf.b, tf.c, tf.d, 0, 0); sg.fillText((cs.textTransform === 'uppercase' ? w.textContent.toUpperCase() : w.textContent), 0, 0); sg.restore(); void f; }
      // 2. wave + mouse tilt displacement, then luminance → characters
      const t = performance.now() / 1000 * (P.asciiSpeed ?? 1), A = P.asciiWave ?? 1, D = sg.getImageData(0, 0, cols, rows).data;
      const EZ = P.asciiEase ?? 0.06, TL = P.asciiTilt ?? 1; tx += (mx * TL - tx) * EZ; ty += (my * TL - ty) * EZ; if (P.asciiOpacity != null) pre.style.opacity = P.asciiOpacity; const cx = (hr.left + hr.width / 2) / cw, cy = (hr.top + hr.height / 2) / fs;
      let out = ''; const n = CHARS.length - 1;
      for (let y = 0; y < rows; y++) { for (let x = 0; x < cols; x++) {
          const dx = x - cx, dy = y - cy, persp = 1 + (dx * tx * 0.012 + dy * ty * 0.03);
          const sx = Math.round(cx + dx * persp + Math.sin(t * 1.6 + y * 0.35) * 1.6 * A), sy = Math.round(cy + dy * persp + Math.cos(t * 1.3 + x * 0.06) * 0.7 * A);
          let v = 0; if (sx >= 0 && sy >= 0 && sx < cols && sy < rows) { const i = (sy * cols + sx) * 4; v = D[i + 3] / 255 * (0.75 + 0.25 * Math.sin(t * (P.asciiFlicker ?? 3) + x * 0.2 + y * 0.5)); }
          out += v < 0.04 ? ' ' : CHARS[Math.min(n, Math.round(v * n))]; } out += '\n'; }
      { const op = pre.offsetParent, lr = op ? op.getBoundingClientRect() : { left: 0, top: 0 }; pre.style.transform = 'translate(' + (-lr.left).toFixed(1) + 'px,' + (-lr.top).toFixed(1) + 'px)'; }
      if (out !== last) { pre.textContent = out; last = out; } };
    tick();
  }
});
