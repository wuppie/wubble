/* Wubble V22: hero title "clouds" type effect — port of Codrops 3DTypeEffects / 01_clouds (Ksenia Kondrashova, MIT).
   Text pixels → smoke puffs that grow in, then breathe + slowly rotate. Canvas 2D (no extra WebGL context).
   The canvas lives inside the h1, so the title's existing scroll fly-out (transform/opacity/blur) carries the clouds too. */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  initCloudType() {
    const els = [this.headlineRef && this.headlineRef.current, document.querySelector('[data-hero-front] h1')].filter(Boolean); const fns = [];
    for (const h1 of els) { if (h1.__ct) continue; h1.__ct = 1; fns.push(this.cloudTypeOn(h1)); }
    this.refreshCloudType = () => fns.forEach((f) => f());
  },
  cloudTypeOn(h1) {
    const img = new Image(); img.src = (window.WB_ASSETS || './') + 'img/smoke.png';
    const cv = document.createElement('canvas'), g = cv.getContext('2d'); cv.setAttribute('aria-hidden', 'true');
    const PAD = 0.18; cv.style.cssText = 'position:absolute;left:' + (-PAD * 100) + '%;top:' + (-PAD * 100) + '%;width:' + (100 + PAD * 200) + '%;height:' + (100 + PAD * 200) + '%;pointer-events:none;';
    let P = [], W = 1, H = 1, unit = 1, tint = null, tintCol = '', on = false, built = 0;
    const DPR = Math.min(1.5, devicePixelRatio || 1);
    const mkTint = (col) => { if (!img.complete || !img.naturalWidth) return null; const t = document.createElement('canvas'); t.width = img.naturalWidth; t.height = img.naturalHeight; const x = t.getContext('2d'); x.fillStyle = col; x.fillRect(0, 0, 1, 1); const cc = x.getImageData(0, 0, 1, 1).data; x.clearRect(0, 0, 1, 1); x.drawImage(img, 0, 0); const id = x.getImageData(0, 0, t.width, t.height), D = id.data; for (let i = 0; i < D.length; i += 4) { const a = D[i] * (D[i + 3] / 255); D[i] = cc[0]; D[i + 1] = cc[1]; D[i + 2] = cc[2]; D[i + 3] = a; } x.putImageData(id, 0, 0); return t; };
    const build = () => {
      const fx = (this.props.heroTitleFx || 'Clouds') === 'Clouds'; on = fx;
      h1.style.webkitTextFillColor = fx ? 'transparent' : ''; if (!fx) { if (cv.parentNode) cv.remove(); return; }
      if (getComputedStyle(h1).position === 'static') h1.style.position = 'relative';
      if (cv.parentNode !== h1) h1.appendChild(cv);
      const hr = h1.getBoundingClientRect(), cs = getComputedStyle(h1), sx = h1.offsetWidth ? hr.width / h1.offsetWidth : 1; if (hr.width < 4) return;
      const bw = h1.offsetWidth, bh = h1.offsetHeight; W = Math.round(bw * (1 + PAD * 2) * DPR); H = Math.round(bh * (1 + PAD * 2) * DPR); cv.width = W; cv.height = H;
      // draw each word of the title at its laid-out position into a mask
      const m = document.createElement('canvas'); m.width = W; m.height = H; const mg = m.getContext('2d'); mg.fillStyle = '#fff'; mg.textBaseline = 'alphabetic';
      // measure words at their final resting place: clear intro reveal transforms while sampling
      const GW = [...h1.querySelectorAll('*')].filter((e) => e.style.transform), GT = GW.map((e) => e.style.transform); GW.forEach((e) => { e.style.transform = 'none'; });
      let fs = 0; const tw = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const el = n.parentElement, ec = getComputedStyle(el), f = parseFloat(ec.fontSize); fs = Math.max(fs, f);
        mg.font = ec.fontStyle + ' ' + ec.fontWeight + ' ' + (f * DPR) + 'px ' + ec.fontFamily; if ('letterSpacing' in mg) mg.letterSpacing = (parseFloat(ec.letterSpacing) || 0) * DPR + 'px';
        const txt = n.textContent, re = /\S+/g; let mt;
        while ((mt = re.exec(txt))) { const r = document.createRange(); r.setStart(n, mt.index); r.setEnd(n, mt.index + mt[0].length); const rc = r.getBoundingClientRect(); if (!rc.width) continue;
          const tm = mg.measureText(mt[0]), x = ((rc.left - hr.left) / sx + bw * PAD) * DPR, base = ((rc.top - hr.top) / sx + bh * PAD) * DPR + (rc.height / sx * DPR + tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent) / 2;
          mg.fillText(ec.textTransform === 'uppercase' ? mt[0].toUpperCase() : mt[0], x, base); } }
      GW.forEach((e, i) => { e.style.transform = GT[i]; });
      fs = (fs || parseFloat(cs.fontSize)) * DPR; unit = fs / 60 * 12.5; // pen: 60px texture font, 0.08 scene units per px
      const d = mg.getImageData(0, 0, W, H).data, step = Math.max(1, Math.round(fs / 60 * (this.props.cloudTypeStep ?? 2.2))), old = P; P = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) {
        const o = old[P.length]; const p = { x: x + unit * 0.15 * (Math.random() - 0.5) * 2, y: y + unit * 0.15 * (Math.random() - 0.5) * 2, grow: true, s: o ? o.s : 0, ms: 0.1 + 1.5 * Math.pow(Math.random(), 10), ds: 0.03 + 0.03 * Math.random(), age: Math.PI * Math.random(), da: 0.01 + 0.02 * Math.random(), rz: 0.5 * Math.random() * Math.PI, dr: 0.01 * (Math.random() - 0.5) };
        if (o && !o.grow) p.grow = false; P.push(p); }
      built = 1;
    };
    const tick = () => { requestAnimationFrame(tick); if (!on || !built || !img.complete) return;
      const vis = (window.__wbRP || 0) < 0.6; if (!vis) return;
      const col = this.props.cloudTypeColor || getComputedStyle(h1).color || '#fff'; if (col !== tintCol || !tint) { tint = mkTint(col); tintCol = col; if (!tint) return; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.globalAlpha = this.props.cloudTypeOpacity ?? 0.3;
      for (const p of P) { p.age += p.da; p.rz += p.dr; if (p.grow) { p.s += p.ds; if (p.s >= p.ms) p.grow = false; } else p.s = p.ms + 0.2 * Math.sin(p.age);
        const sz = Math.max(0, p.s) * unit * (this.props.cloudTypeSize ?? 0.75); if (sz < 0.5) continue; const c = Math.cos(p.rz), s = Math.sin(p.rz);
        g.setTransform(c, s, -s, c, p.x, p.y); g.drawImage(tint, -sz / 2, -sz / 2, sz, sz); } };
    const rb = () => { clearTimeout(this._ctT); this._ctT = setTimeout(build, 150); };
    addEventListener('resize', rb); new ResizeObserver(rb).observe(h1);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(build); [2500, 6000].forEach((t) => setTimeout(build, t)); img.onload = () => { tint = null; };
    tick(); return build;
  }
});
