/* Wubble V22 module: ui — methods mixed into the page component */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  // lazy-start heavy 3D: run fn once the page is scrolled past frac (0–1), or after idleMs when the browser is idle
  whenNear(frac, idleMs, fn) {
    let done = false; const go = () => { if (done || this.dead) return; done = true; clearInterval(t); fn(); };
    const t = setInterval(() => { const H = document.documentElement.scrollHeight - innerHeight; if (H > 0 && scrollY / H >= frac) go(); }, 250);
    // no idle fallback: a new WebGL context while the hero is on screen evicts the hero/slider contexts
  },
  initGsapTitles() {
    const G = window.gsap; if (!G) { this.gtWait = setTimeout(() => this.initGsapTitles(), 120); return; }
    const titles = Array.from(document.querySelectorAll('[data-gt]')).map((el) => {
      const words = Array.from(el.querySelectorAll('[data-gw]')), hero = el.getAttribute('data-gt') === 'hero';
      G.set(words, { yPercent: 0, y: 0, rotation: 0, skewY: 0, opacity: 1 });
      const chars = [];
      words.forEach((w) => {
        const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT), nodes = []; let nd; while ((nd = tw.nextNode())) if (nd.nodeValue.trim()) nodes.push(nd);
        nodes.forEach((tn) => { const frag = document.createDocumentFragment();
          Array.from(tn.nodeValue).forEach((ch) => { if (!ch.trim()) { frag.appendChild(document.createTextNode(ch)); return; }
            const c = document.createElement('span'); c.setAttribute('data-gc', ''); c.style.cssText = 'display:inline-block;will-change:transform,opacity,filter;'; c.textContent = ch;
            const ang = Math.random() * Math.PI * 2, rad = 0.35 + Math.random() * 0.9;
            c.__v = { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.7, z: Math.random() < 0.65 ? 500 + Math.random() * 1400 : -(300 + Math.random() * 900), rx: (Math.random() - 0.5) * 220, ry: (Math.random() - 0.5) * 260, rz: (Math.random() - 0.5) * 140, d: Math.random() * 0.35 };
            chars.push(c); frag.appendChild(c); });
          tn.parentNode.replaceChild(frag, tn); });
      });
      const at0 = el.getAttribute('data-gt'), prog = at0 === 'hero' ? 'rp' : at0 === '0.35' ? 'rq' : at0 === '1.0' ? 'r3' : at0 === '-0.6' ? 'in3' : at0 === 'about' ? 'ab' : null;
      return { el, words, chars, prog, scat: 0, hero, at: hero ? 0 : parseFloat(el.getAttribute('data-gt')) || 0, sec: el.closest('section'), on: hero, tw: null };
    });
    // locomotive-style: each word rises out of its mask with a soft rotate/skew that settles; exits leave in the scroll direction
    const play = (t, on, dir) => {
      t.on = on; if (t.tw) t.tw.kill();
      const up = dir < 0;
      if (on && t.lastOut != null) G.set(t.words, { yPercent: t.lastOut > 0 ? 120 : -120, rotation: t.lastOut > 0 ? 7 : -7, skewY: t.lastOut > 0 ? 4 : -4 });
      t.lastOut = on ? null : (up ? -1 : 1);
      t.tw = on ? G.to(t.words, { yPercent: 0, rotation: 0, skewY: 0, duration: 1.7, ease: 'expo.out', stagger: 0.07, overwrite: true, force3D: true })
        : G.to(up ? t.words : t.words.slice().reverse(), { yPercent: up ? -120 : 120, rotation: up ? -5 : 5, skewY: up ? -3 : 3, duration: 1.0, ease: 'power3.inOut', stagger: 0.04, overwrite: true, force3D: true });
    };
    // top title: a random letter squeezes on its own every 4s (same motion as the WORK hover)
    document.querySelectorAll('[data-sqh]').forEach((el) => {
      el.addEventListener('pointerenter', () => G.to(el, { scaleX: 0.7, scaleY: 1.1, duration: 0.9, ease: 'expo.out', overwrite: true }));
      el.addEventListener('pointerleave', () => G.to(el, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)', overwrite: true }));
    });
    const sqEls = Array.from(document.querySelectorAll('[data-sq]')); let lastSq = -1;
    const squeeze = () => {
      if (this.dead) return;
      if (sqEls.length && !document.hidden) {
        let i = Math.floor(Math.random() * sqEls.length); if (i === lastSq && sqEls.length > 1) i = (i + 1 + Math.floor(Math.random() * (sqEls.length - 1))) % sqEls.length; lastSq = i;
        const el = sqEls[i];
        G.timeline({ overwrite: true }).to(el, { scaleX: 0.7, scaleY: 1.1, duration: 0.9, ease: 'expo.out' }).to(el, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)' }, '+=0.35');
      }
      this.sqT = setTimeout(squeeze, 4000);
    };
    this.sqT = setTimeout(squeeze, 2500);
    let fitW = 0;
    const fitTitles = (force) => { if (!force && innerWidth === fitW) return; fitW = innerWidth; const pad = 2 * Math.max(36, Math.min(72, innerWidth * 0.044));
      document.querySelectorAll('[data-gt]:not([aria-hidden])').forEach((el) => {
        if (el.dataset.fs0 == null) el.dataset.fs0 = el.style.fontSize || ''; el.style.fontSize = el.dataset.fs0; const cs = getComputedStyle(el), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0;
        const avail = (pl + pr > 0 ? el.clientWidth - pl - pr : innerWidth - pad) - 2;
        for (let it = 0; it < 4; it++) {
          const rows = new Map(); el.querySelectorAll('[data-gw]').forEach((w) => { const r = w.parentElement.getBoundingClientRect(); const k = Math.round(r.top); const o = rows.get(k) || { l: 1e9, r: -1e9 }; o.l = Math.min(o.l, r.left); o.r = Math.max(o.r, r.right); rows.set(k, o); });
          let maxW = 0; rows.forEach((o) => { maxW = Math.max(maxW, o.r - o.l); });
          if (maxW <= avail || !maxW) break;
          el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * avail / maxW * 0.985).toFixed(2) + 'px';
        }
      }); };
    fitTitles(true); addEventListener('resize', () => fitTitles()); if (document.fonts) document.fonts.ready.then(() => fitTitles(true));
    [800, 2000, 4000].forEach((t) => setTimeout(() => fitTitles(true), t));
    const tick = () => {
      if (this.dead) return; this.gtRaf = requestAnimationFrame(tick);
      this.letterStorm && this.letterStorm();
      { const hr = this.heroRef.current, hin = hr && hr.firstElementChild, fr = this._hf || (this._hf = document.querySelector('[data-hero-front]'));
        if (hin && fr) { const fi = fr.firstElementChild; fi.style.transform = hin.style.transform;
          // entering the footer: the fixed hero layer glides up and fades out smoothly (eased, scrubbed by scroll)
          const sp = this._ftSp || (this._ftSp = document.querySelector('[data-footer-spacer]')), vh0 = innerHeight;
          const fq = sp ? Math.max(0, Math.min(1, (vh0 * 1.6 - sp.getBoundingClientRect().top) / (vh0 * 1.1))) : 0;
          this._fqS = (this._fqS ?? fq) + (fq - (this._fqS ?? fq)) * 0.12; const fe = this._fqS * this._fqS * (3 - 2 * this._fqS);
          const tr = fe > 0.0005 ? '0 ' + (-fe * vh0 * 0.7).toFixed(1) + 'px' : ''; if (fr.__tr !== tr) { fr.__tr = tr; fr.style.translate = tr; }
          fi.style.opacity = String((hin.style.opacity === '' ? 1 : +hin.style.opacity) * (1 - fe));
          { const cf = this._cfr || (this._cfr = document.querySelector('[data-clouds-front]')); if (cf) { if (cf.__tr !== tr) { cf.__tr = tr; cf.style.translate = tr; } } }
          const bh = this._hb || (this._hb = document.querySelector('h1[data-gt="hero"]:not([aria-hidden])')), fh = fi.querySelector('h1');
          if (bh && fh) { const cs = getComputedStyle(bh); ['color', 'fontSize', 'fontFamily', 'fontWeight', 'letterSpacing', 'lineHeight', 'textShadow', 'top', 'transform', 'webkitTextStroke'].forEach((k) => { const v = k === 'transform' ? bh.style.transform : cs[k]; if (v != null && fh.style[k] !== v) fh.style[k] = v; });
            const bs = bh.querySelectorAll('span'), fs2 = fh.querySelectorAll('span');
            if (bs.length === fs2.length) for (let i = 0; i < bs.length; i++) { const x = bs[i].style, y = fs2[i].style;
              if (y.transform !== x.transform) y.transform = x.transform; if (y.opacity !== x.opacity) y.opacity = x.opacity;
              if (y.filter !== x.filter) y.filter = x.filter; if (y.clipPath !== x.clipPath) y.clipPath = x.clipPath; if (y.overflow !== x.overflow) y.overflow = x.overflow; }
            if (fh.style.clipPath !== bh.style.clipPath) fh.style.clipPath = bh.style.clipPath; if (fh.style.opacity !== bh.style.opacity) fh.style.opacity = bh.style.opacity; if (fh.style.filter !== bh.style.filter) fh.style.filter = bh.style.filter; } fr.style.visibility = (hr.style.visibility === 'hidden' || this.state.page) ? 'hidden' : 'visible'; } }
      if (!this.gsapReady) return;
      const vh = window.__svh || innerHeight, vw = innerWidth;
      titles.forEach((t) => {
        if (!t.prog) return;
        const raw = t.prog === 'in3' ? 1 - (this.r3 ?? 0) : t.prog === 'ab' ? (window.__wbAboutOp || 0) : (this[t.prog] ?? 0);
        const WL = this.workLetters;
        if (t.prog === 'rp' && (this.props.titleMorph ?? true) && WL && WL.length) {
          const HS1 = this.props.heroStart ?? 0.04, mk = Math.max(0, Math.min(1, (raw - HS1 - 0.02) / 0.6));
          const pre0 = Math.max(0, Math.min(1, (raw - HS1) / 0.1)), pre = pre0 < 0.02 ? 0 : pre0; if (t.scat0 === mk && t.pre0 === pre && !t.dirty) return; t.scat0 = mk; t.scat = mk; t.pre0 = pre;
          const open = mk > 0.001;
          if (!open || !t.base || t.baseW !== innerWidth) {
            t.chars.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; c.style.filter = ''; });
            t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'hidden'; });
            t.base = t.chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height * 0.72 }; }); t.baseW = innerWidth;
            if (!open) { if (pre > 0) { t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'visible'; }); t.chars.forEach((c) => { c.style.filter = 'blur(' + (pre * 7).toFixed(1) + 'px)'; }); } return; }
          }
          t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'visible'; });
          const n = t.chars.length, nW = WL.length;
          t.chars.forEach((c, i) => {
            const v = c.__v, b = t.base[i], tg = WL[Math.min(nW - 1, Math.floor(i * nW / n))];
            const st = v.d * 0.45, k0 = Math.max(0, Math.min(1, (mk - st) / (1 - st))), k = k0 * k0 * (3 - 2 * k0);
            const arc = Math.sin(Math.PI * k), arc2 = arc * arc;
            const x = (tg.x - b.x) * k + v.x * vw * 0.95 * arc, y = (tg.y - b.y) * k + v.y * vh * 0.85 * arc;
            const z = v.z * 1.1 * arc2, sc2 = Math.max(1, 1 + (tg.h / Math.max(1, b.h) - 1) * k) * (1 + arc * 0.6);
            c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) perspective(900px) translateZ(' + z.toFixed(1) + 'px) rotateX(' + (v.rx * 1.6 * arc).toFixed(1) + 'deg) rotateY(' + (v.ry * 1.6 * arc).toFixed(1) + 'deg) rotateZ(' + (v.rz * 1.6 * arc).toFixed(1) + 'deg) scale(' + sc2.toFixed(3) + ')';
            // depth of field: sharp at start, out of focus in flight (stronger when close to camera), refocus on landing
            const dof = Math.min(1, Math.abs(z) / 700);
            c.style.filter = 'blur(' + (dof * dof * (z > 0 ? 16 : 6) + (1 - k) * 7 + arc * 6).toFixed(1) + 'px)';
            const land = Math.max(0, Math.min(1, (k - 0.82) / 0.18));
            c.style.opacity = (1 - land).toFixed(3);
          });
          return;
        }
        // locomotive-style: scrubbed to scroll, smoothed; letters rise out of the mask with a settling rotate/skew and leave upward
        const cl = (x) => Math.max(0, Math.min(1, x)), rp1 = this.rp || 0, rq1 = this.rq || 0, r31 = this.r3 || 0;
        let tin = 1, tout = 0;
        if (t.prog === 'rp') { tout = cl((rp1 - (this.props.heroStart ?? 0.04)) / 0.4); }
        else if (t.prog === 'rq') { tin = cl(((this._introS || 0) - 0.72) / 0.28); tout = cl((rq1 - 0.02) / 0.4); }
        else if (t.prog === 'r3') { tin = cl((rq1 - 0.6) / 0.4); tout = cl((r31 - 0.02) / 0.4); }
        else if (t.prog === 'in3') { tin = cl((r31 - 0.55) / 0.4); }
        else if (t.prog === 'ab') { tin = cl(((window.__wbAboutOp || 0) - 0.45) / 0.4); tout = cl((window.__wbMonZoom || 0) / 0.35); }
        const tn = performance.now(), tdt = Math.min(0.05, (tn - (t.lt || tn)) / 1000); t.lt = tn; const f = 1 - Math.exp(-tdt * 6);
        t.ki = t.ki == null ? tin : t.ki + (tin - t.ki) * f; t.ko = t.ko == null ? tout : t.ko + (tout - t.ko) * f;
        if (Math.abs(t.ki - tin) < 0.0004) t.ki = tin; if (Math.abs(t.ko - tout) < 0.0004) t.ko = tout;
        const lk = t.ki.toFixed(4) + '|' + t.ko.toFixed(4); if (t.lk === lk) return; t.lk = lk;
        if (!t.mk) { t.mk = true; t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'hidden'; }); t.chars.forEach((c) => { c.style.filter = ''; c.style.opacity = ''; c.style.transformOrigin = '0% 100%'; c.style.willChange = 'transform'; }); }
        const n = t.chars.length, st = Math.min(0.09, 0.55 / Math.max(1, n)), span = 1 - st * (n - 1);
        t.chars.forEach((c, i) => {
          const li = cl((t.ki - i * st) / span), lo = cl((t.ko - i * st) / span), ea = 1 - Math.pow(1 - li, 3), eb = lo * lo * (3 - 2 * lo);
          const y = (window.__wbAscend ? -1 : 1) * ((1 - ea) * 115 - eb * 115), rot = (1 - ea) * 10 - eb * 6, sk = (1 - ea) * 7 - eb * 4;
          c.style.transform = 'translate3d(0,' + y.toFixed(2) + '%,0) rotate(' + rot.toFixed(2) + 'deg) skewY(' + sk.toFixed(2) + 'deg)';
        });
      });
      { // services rows: each line rises in as the panel arrives, then lifts out as About takes over
        const rows = this._lsRows || (this._lsRows = Array.from(document.querySelectorAll('[data-svc-row] [data-gw]'))), vhR = window.__svh || innerHeight, intoR = this._ctT == null ? 1 : -this._ctT / vhR, raR = this.ra || 0;
        const tn = performance.now(), tdt = Math.min(0.05, (tn - (this._lsT || tn)) / 1000); this._lsT = tn; const f = 1 - Math.exp(-tdt * 6), cl = (x) => Math.max(0, Math.min(1, x));
        rows.forEach((el, i) => { const si = cl((raR - 0.4 - i * 0.06) / 0.45), so = cl(((this.r3 || 0) - 0.02 - i * 0.04) / 0.36);
          el.__ki = el.__ki == null ? si : el.__ki + (si - el.__ki) * f; el.__ko = el.__ko == null ? so : el.__ko + (so - el.__ko) * f;
          if (Math.abs(el.__ki - si) < 0.0004) el.__ki = si; if (Math.abs(el.__ko - so) < 0.0004) el.__ko = so;
          const ea = 1 - Math.pow(1 - el.__ki, 3), eb = el.__ko * el.__ko * (3 - 2 * el.__ko), k = ea.toFixed(4) + eb.toFixed(4); if (el.__lk === k) return; el.__lk = k;
          el.style.transformOrigin = '0% 100%'; el.style.transform = 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * ((1 - ea) * 115 - eb * 115)).toFixed(2) + '%,0) rotate(' + ((1 - ea) * 10 - eb * 6).toFixed(2) + 'deg) skewY(' + ((1 - ea) * 7 - eb * 4).toFixed(2) + 'deg)'; });
      }
      titles.forEach((t) => {
        if (!t.sec || (t.prog && !t.hero)) return; const r = t.sec.getBoundingClientRect(), into = -r.top / vh;
        const want = into >= t.at - (t.hero ? 1 : 0.5) && r.bottom > vh * 0.5 && (t.hero || into >= t.at);
        if (want !== t.on) { if (!want && t.scat > 0.05) t.on = false; else play(t, want, want ? 0 : (r.bottom <= vh * 0.5 ? -1 : 1)); }
      });
    };
    tick();
  },
  initUiFx() {
    const G = window.gsap;
    // click sound on every button / link / project
    const SRC = (this.props.clickSound || '').trim() || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/sound.mp3';
    const pool = [0, 1, 2].map(() => { const a = new Audio(SRC); a.preload = 'auto'; a.volume = this.props.clickVolume ?? 0.5; return a; }); let pi = 0;
    this.playClick = () => { const a = pool[pi++ % pool.length]; try { a.volume = this.props.clickVolume ?? 0.5; a.currentTime = 0; a.play().catch(() => {}); } catch (e) {} };
    document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a,button,[data-w-click],[role="button"]')) this.playClick(); }, true);
    // W logo: random gooey squeeze
    const w = document.querySelector('[data-logo-w]');
    if (w && G && false) { const go = () => { if (this.dead) return; G.timeline().to(w, { scaleX: 0.62, scaleY: 1.18, duration: 0.5, ease: 'expo.out' }).to(w, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'elastic.out(1, 0.45)' }); this._wT = setTimeout(go, 2600 + Math.random() * 3200); }; this._wT = setTimeout(go, 2200); }
    // services: letters roll up on hover
    if (!window.gsap) { setTimeout(() => this.initUiFx2 && this.initUiFx2(), 300); }
    this.initUiFx2 = () => { const G = window.gsap; if (!G) { setTimeout(this.initUiFx2, 300); return; }
    document.querySelectorAll('[data-svc-list] [data-gw]').forEach((el) => { if (el.__roll) return; el.__roll = true;
      const txt = el.textContent; el.textContent = ''; el.style.display = 'inline-flex';
      const chars = [];
      Array.from(txt).forEach((ch, i) => {
        const m = document.createElement('span'); m.style.cssText = 'position:relative;display:inline-block;overflow:hidden;vertical-align:top;line-height:1;';
        const a = document.createElement('span'), b = document.createElement('span'), c = ch === ' ' ? '\u00a0' : ch;
        a.textContent = c; b.textContent = c; a.style.cssText = 'display:block;'; b.style.cssText = 'display:block;position:absolute;left:0;top:100%;color:var(--svc-hover-ink,#0b0b0b);';
        m.appendChild(a); m.appendChild(b); el.appendChild(m); chars.push([a, b]);
      });
      const li = el.closest('li'); if (!li || !G) return;
      const all = chars.flat();
      li.style.cursor = 'default';
      const fill = li.querySelector('[data-svc-fill]'), arr = li.querySelector('[data-svc-arrow]');
      el.__chars = all;
    }); };
    if (window.gsap) this.initUiFx2();
    if (!window.__svcHoverDel) { window.__svcHoverDel = true;
      const go = (row, on) => { const G = window.gsap; if (!G || !row) return;
        let el = row.querySelector('[data-gw]'); if (el && !el.__chars) { this.initUiFx2(); el = row.querySelector('[data-gw]'); }
        const all = (el && el.__chars) || [], fill = row.querySelector('[data-svc-fill]'), arr = row.querySelector('[data-svc-arrow]');
        if (all.length) G.to(all, { yPercent: on ? -100 : 0, duration: on ? 0.32 : 0.3, ease: 'power3.out', stagger: { each: on ? 0.008 : 0.006, from: on ? 'start' : 'end' }, overwrite: true });
        if (fill) G.to(fill, { scaleY: on ? 1 : 0, duration: on ? 0.45 : 0.4, ease: 'expo.out', overwrite: true });
        // r14.15: the fill must sit UNDER the text (Webflow can reorder layers), and the text turns dark on the light bar
        if (fill && !row.__zf) { row.__zf = 1; fill.style.zIndex = '0'; Array.from(row.children).forEach((ch) => { if (ch === fill || ch.contains(fill)) return; const cs = getComputedStyle(ch); if (cs.position === 'static') ch.style.position = 'relative'; ch.style.zIndex = '1'; }); }
        if (!all.length) { row.style.transition = 'color 0.3s'; row.style.color = on ? 'var(--svc-hover-ink,#0b0b0b)' : ''; row.querySelectorAll('h1,h2,h3,h4,p,span').forEach((t) => { t.style.transition = 'color 0.3s'; t.style.color = on ? 'var(--svc-hover-ink,#0b0b0b)' : ''; }); }
        if (arr) G.to(arr, { rotate: on ? -90 : 0, duration: on ? 0.45 : 0.4, ease: 'expo.out', overwrite: true }); };
      let cur = null;
      let px = -1, py = -1; const set = (row) => { if (row === cur) return; if (cur) go(cur, false); cur = row; if (row) go(row, true); };
      document.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; px = e.clientX; py = e.clientY; set(e.target.closest && e.target.closest('[data-svc-row]')); }, { passive: true });
      // rows scroll out from under a still cursor without any pointer event — re-check on scroll
      addEventListener('scroll', () => { if (!cur || px < 0) return; const el = document.elementFromPoint(px, py); set(el && el.closest ? el.closest('[data-svc-row]') : null); }, { passive: true });
      document.addEventListener('pointerleave', () => { if (cur) { go(cur, false); cur = null; } });
    }
    this.initSvcCard = () => { const G = window.gsap, L = document.querySelector('[data-svc-list]'); if (!G || !L || L.__card) { if (!G || !L) setTimeout(this.initSvcCard, 400); return; } L.__card = true;
      const card = document.createElement('div'); card.setAttribute('data-svc-card', ''); card.setAttribute('aria-hidden', 'true');
      card.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483000;pointer-events:none;width:clamp(170px,17vw,290px);aspect-ratio:1/1;box-sizing:border-box;padding:7px;border-radius:16px;background:#ece9e2;box-shadow:0 18px 50px rgba(0,0,0,0.45);opacity:0;transform:translate(-50%,-50%) scale(0.6);will-change:transform,opacity;';
      card.innerHTML = '<div data-c-in style="position:relative;width:100%;height:100%;border-radius:11px;overflow:hidden;background:#1a1a19;"><div data-c-img style="position:absolute;inset:0;background-size:cover;background-position:50% 50%;"></div><div data-c-mark style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--display,Oswald),Helvetica,sans-serif;font-weight:700;font-size:clamp(28px,3vw,52px);letter-spacing:-0.03em;text-align:center;line-height:0.85;padding:12%;"></div><div data-c-num style="position:absolute;right:10px;bottom:6px;font-family:var(--display,Oswald),Helvetica,sans-serif;font-weight:700;font-size:clamp(22px,2vw,34px);color:#ece9e2;text-shadow:0 2px 10px rgba(0,0,0,0.5);"></div></div>';
      document.body.appendChild(card);
      const img = card.querySelector('[data-c-img]'), mark = card.querySelector('[data-c-mark]'), num = card.querySelector('[data-c-num]'), inr = card.querySelector('[data-c-in]');
      const S = { x: 0, y: 0, tx: 0, ty: 0, r: 0, on: false, raf: 0 };
      const loop = () => { S.raf = requestAnimationFrame(loop); const vx = S.tx - S.x; S.x += vx * 0.14; S.y += (S.ty - S.y) * 0.14; S.r += ((Math.max(-14, Math.min(14, vx * 0.25)) - 3) - S.r) * 0.1;
        card.style.left = S.x + 'px'; card.style.top = S.y + 'px'; card.style.rotate = S.r.toFixed(2) + 'deg'; if (!S.on && +card.style.opacity < 0.01) { cancelAnimationFrame(S.raf); S.raf = 0; } };
      const rows = Array.from(L.querySelectorAll('[data-svc-row]'));
      rows.forEach((row, i) => row.addEventListener('pointerenter', (e) => {
        if (matchMedia('(pointer: coarse)').matches) return;
        const p = this.projects[i % this.projects.length] || {}, im = row.querySelector('img[data-wb-svc-img], [data-wb-svc-img] img'), src = ((im && !im.classList.contains('w-dyn-bind-empty') && !/placeholder/i.test(im.getAttribute('src') || '') && (im.currentSrc || im.getAttribute('src'))) || row.getAttribute('data-img') || '').trim(); /* Webflow: swap the Image inside each row */
        num.textContent = String(i + 1).padStart(2, '0');
        img.style.backgroundImage = src ? 'url("' + src + '")' : 'none'; inr.style.background = src ? '#1a1a19' : (p.bg || '#1a1a19');
        mark.textContent = src ? '' : (p.mark || ''); mark.style.color = p.ink || '#ece9e2';
        if (!S.on) { S.x = S.tx = e.clientX; S.y = S.ty = e.clientY; }
        S.on = true; if (!S.raf) loop();
        G.fromTo(inr, { scale: 1.15 }, { scale: 1, duration: 0.6, ease: 'expo.out', overwrite: true });
        G.to(card, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', overwrite: 'auto' }); }));
      L.addEventListener('pointermove', (e) => { S.tx = e.clientX; S.ty = e.clientY; });
      L.addEventListener('pointerleave', () => { S.on = false; G.to(card, { opacity: 0, scale: 0.6, duration: 0.35, ease: 'power3.in', overwrite: 'auto' }); });
      addEventListener('scroll', () => { if (S.on && !L.matches(':hover')) { S.on = false; G.to(card, { opacity: 0, scale: 0.6, duration: 0.3, overwrite: 'auto' }); } }, { passive: true });
    };
    this.initSvcCard();
  },
  initInk(THREE) {
    const box = this.inkRef.current; if (!box || this.coarse || !(this.props.cursorInk ?? true)) return;
    const r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setTimeout(() => { if (this.dead || !r.getContext().isContextLost()) return; try { r.domElement.remove(); } catch (er) {} this.initInk(THREE); }, 1500); }, { once: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    r.setClearColor(0x000000, 0);
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    let A = new THREE.WebGLRenderTarget(4, 4, opts), B = new THREE.WebGLRenderTarget(4, 4, opts);
    const noise = `
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }`;
    const vs = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
    const simU = { uPrev: { value: null }, uA: { value: new THREE.Vector2(-9, -9) }, uB: { value: new THREE.Vector2(-9, -9) }, uR: { value: 0.02 }, uAspect: { value: 1 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2() }, uDecay: { value: 0.975 } };
    const sim = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: simU, vertexShader: vs, fragmentShader: `
      uniform sampler2D uPrev; uniform vec2 uA; uniform vec2 uB; uniform float uR; uniform float uAspect; uniform float uT; uniform vec2 uPx; uniform float uDecay;
      varying vec2 vUv; ${noise}
      float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * t); }
      void main(){
        vec2 q = vUv * vec2(uAspect, 1.0) * 4.0;
        float e = 0.05;
        float nx = n2(q + vec2(0.0, e) + uT * 0.3) - n2(q - vec2(0.0, e) + uT * 0.3);
        float ny = n2(q + vec2(e, 0.0) + uT * 0.3) - n2(q - vec2(e, 0.0) + uT * 0.3);
        vec2 curl = vec2(nx, -ny) * 0.012;
        vec2 uv = vUv - curl + vec2(0.0, 0.0006);
        float v = texture2D(uPrev, uv).r * 0.6
          + (texture2D(uPrev, uv + vec2(uPx.x, 0.0)).r + texture2D(uPrev, uv - vec2(uPx.x, 0.0)).r
          +  texture2D(uPrev, uv + vec2(0.0, uPx.y)).r + texture2D(uPrev, uv - vec2(0.0, uPx.y)).r) * 0.1;
        v *= uDecay;
        vec2 p = vUv * vec2(uAspect, 1.0);
        float d = seg(p, uA * vec2(uAspect, 1.0), uB * vec2(uAspect, 1.0));
        float rr = uR * (0.75 + 0.5 * n2(p * 14.0 + uT));
        v = max(v, smoothstep(rr, rr * 0.2, d));
        gl_FragColor = vec4(v, 0.0, 0.0, 1.0);
      }` }));
    const simScene = new THREE.Scene(); simScene.add(sim);
    const outU = { uTex: { value: null }, uT: { value: 0 }, uAspect: { value: 1 } };
    const out = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: outU, transparent: true, vertexShader: vs, fragmentShader: `
      uniform sampler2D uTex; uniform float uT; uniform float uAspect; varying vec2 vUv; ${noise}
      void main(){
        float f = texture2D(uTex, vUv).r;
        f += (n2(vUv * vec2(uAspect, 1.0) * 18.0 + uT * 0.4) - 0.5) * 0.12;
        float a = smoothstep(0.42, 0.47, f);
        gl_FragColor = vec4(vec3(1.0), a);
      }` }));
    const outScene = new THREE.Scene(); outScene.add(out);
    const size = () => {
      const w = window.innerWidth, h = window.innerHeight;
      r.setSize(w, h, false);
      const sw = Math.max(4, Math.round(w / 2)), sh = Math.max(4, Math.round(h / 2));
      A.setSize(sw, sh); B.setSize(sw, sh);
      simU.uPx.value.set(1 / sw, 1 / sh);
      simU.uAspect.value = outU.uAspect.value = w / h;
    };
    size(); window.addEventListener('resize', size);
    const m = { x: -1, y: -1, px: -1, py: -1, has: false };
    let speed = 0, rad = 0;
    const onMove = (e) => { m.x = e.clientX / window.innerWidth; m.y = 1 - e.clientY / window.innerHeight; if (!m.has) { m.px = m.x; m.py = m.y; m.has = true; } };
    const onOut = (e) => { if (!e.relatedTarget) m.has = false; };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerout', onOut);
    const loop = () => {
      if (this.dead) return;
      this.inkRaf = requestAnimationFrame(loop);
      const P = this.props, on = P.customCursor ?? true;
      box.style.display = on ? 'block' : 'none';
      document.documentElement.style.cursor = on ? 'none' : '';
      if (!on) return;
      const t = performance.now() / 1000;
      const dx = (m.x - m.px) * simU.uAspect.value, dy = m.y - m.py;
      speed += (Math.min(Math.hypot(dx, dy) * 40, 1) - speed) * 0.15;
      const size0 = 2;
      this.inkFade = (this.inkFade ?? 1) + ((this.cardHover ? 0 : 1) - (this.inkFade ?? 1)) * (this.cardHover ? 0.14 : 0.06);
      box.style.opacity = String(this.inkFade);
      rad += ((m.has && !this.cardHover ? (0.018 + speed * 0.07) * size0 : 0) - rad) * 0.2;
      simU.uA.value.set(m.has ? m.px : -9, m.has ? m.py : -9);
      simU.uB.value.set(m.has ? m.x : -9, m.has ? m.y : -9);
      simU.uR.value = rad; simU.uT.value = t; outU.uT.value = t;
      simU.uDecay.value = 0.955 + 0.035 * (P.inkLinger ?? 0.6);
      m.px = m.x; m.py = m.y;
      simU.uPrev.value = A.texture;
      r.setRenderTarget(B); r.render(simScene, cam);
      const tmp = A; A = B; B = tmp;
      outU.uTex.value = A.texture;
      r.setRenderTarget(null); r.render(outScene, cam);
    };
    loop();
    const prev = this.cleanupInk;
    this.cleanupInk = () => {
      cancelAnimationFrame(this.inkRaf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      document.documentElement.style.cursor = '';
      A.dispose(); B.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  },
  initReveals(THREE) {
    const MAXM = 6;
    let r = null, scene, cam, meshes = [], mounted = null;
    const vs = `uniform vec4 uRect; varying vec2 vUv;
      void main(){ vUv = uv; vec2 p = uRect.xy + (position.xy * 0.5 + 0.5) * uRect.zw; gl_Position = vec4(p, 0.0, 1.0); }`;
    const fs = `uniform float uP; uniform float uT; uniform vec2 uPx; uniform float uSeed; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.02 + 7.3; a *= 0.5; } return s; }
      void main(){
        vec2 asp = vec2(uPx.x / uPx.y, 1.0);
        vec2 p = vUv * asp * 2.2 + uSeed;
        vec2 w = vec2(fbm(p + uT * 0.06), fbm(p + 5.1 - uT * 0.05));
        float f = fbm(p + w * 2.2 + vec2(0.0, -uP * 1.6));
        float v = f * 0.75 + (1.0 - vUv.y) * 0.45;
        float k = uP * 1.55 - 0.3;
        float d = v - k;
        float cover = smoothstep(-0.02, 0.22, d);
        float rim = smoothstep(0.1, 0.0, abs(d - 0.04)) * (1.0 - smoothstep(0.85, 1.0, uP));
        vec3 col = vec3(0.03, 0.03, 0.031) + vec3(0.12, 0.12, 0.125) * rim * 0.25;
        col += (h(gl_FragCoord.xy + fract(uT) * 77.0) - 0.5) * 0.03;
        gl_FragColor = vec4(col, clamp(cover + rim * 0.25, 0.0, 1.0));
      }`;
    const build = (box) => {
      if (r) { box.appendChild(r.domElement); mounted = box; size(); return; }
      r = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1 : 1.5)); r.setClearColor(0, 0); r.autoClear = true;
      r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      box.appendChild(r.domElement); mounted = box;
      scene = new THREE.Scene(); cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geo = new THREE.PlaneGeometry(2, 2);
      meshes = [];
      for (let i = 0; i < MAXM; i++) {
        const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ transparent: true, depthTest: false, vertexShader: vs, fragmentShader: fs,
          uniforms: { uRect: { value: new THREE.Vector4() }, uP: { value: 0 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2(1, 1) }, uSeed: { value: i * 7.31 } } }));
        m.frustumCulled = false; m.visible = false; scene.add(m); meshes.push(m);
      }
      size();
    };
    const size = () => { if (r) r.setSize(window.innerWidth, window.innerHeight, false); };
    window.addEventListener('resize', size);
    const expo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    this.updateReveals = (pgEl, now) => {
      const box = this.curtainRef.current;
      if (!box || !pgEl) return;
      if (mounted !== box) build(box);
      const vh = (window.__svh || window.innerHeight), vw = window.innerWidth;
      const live = (this.visK || 0) > 0.6;
      if (this.rvReset) { pgEl.querySelectorAll('[data-rg],[data-media]').forEach(el => delete el.dataset.st); this.rvReset = false; }
      box.style.opacity = String(this.visK || 0);
      pgEl.querySelectorAll('[data-rg]').forEach((g) => {
        const rc = g.getBoundingClientRect();
        if (!g.dataset.st && live && rc.top < vh * 0.9 && rc.bottom > 0) g.dataset.st = String(now);
        const st = +g.dataset.st || 0;
        g.querySelectorAll('[data-w]').forEach((w, j) => {
          const t = st ? Math.max(0, Math.min(1, (now - st - j * 32) / 1100)) : 0;
          const e = expo(t);
          w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * (1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 5) + 'deg)';
        });
      });
      let mi = 0;
      pgEl.querySelectorAll('[data-media]').forEach((m) => {
        const rc = m.getBoundingClientRect();
        if (!m.dataset.st && live && rc.top < vh * 0.72 && rc.bottom > 0) m.dataset.st = String(now + 250);
        const st = +m.dataset.st || 0;
        const t = st ? Math.max(0, Math.min(1, (now - st) / 1500)) : 0;
        const e = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const inner = m.firstElementChild;
        const par = ((rc.top + rc.height / 2) - vh / 2) / vh;
        if (inner) inner.style.transform = 'translate3d(0,' + (par * -7 + (1 - e) * 12) + '%,0) scale(' + (1.25 - 0.25 * e) + ')';
        const tt = (now % 60000) / 1000, sd = (mi) * 7.31, pe = t * (2 - t) * 0.5 + e * 0.5;
        m.style.opacity = '';
        m.style.clipPath = e >= 0.999 ? 'none' : 'inset(' + ((1 - e) * 100).toFixed(2) + '% 0 0 0)';
        if (meshes[mi]) meshes[mi].visible = false; mi++; return;
        const onScr = rc.bottom > 0 && rc.top < vh && t > 0 && t < 1;
        mesh.visible = onScr;
        if (!onScr) return;
        const u = mesh.material.uniforms;
        const pad = 4;
        u.uRect.value.set((rc.left - pad) / vw * 2 - 1, 1 - (rc.bottom + pad) / vh * 2, (rc.width + pad * 2) / vw * 2, (rc.height + pad * 2) / vh * 2);
        u.uP.value = pe; u.uT.value = tt; u.uPx.value.set(rc.width + 8, rc.height + 8);
      });
      for (; mi < meshes.length; mi++) meshes[mi].visible = false;
      r.render(scene, cam);
    };
    this.releaseReveals = () => { return; if (!r) return; meshes.forEach(m => m.material.dispose()); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; mounted = null; meshes = []; };
    this.cleanupReveals = () => { window.removeEventListener('resize', size); this.updateReveals = null; if (r) { r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); } };
  },
  async initFooterFig() {
    const box = this.footerFigRef.current; if (!box || !(this.props.footerFigure ?? false)) return;
    const [T, GL] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js')]);
    const loader = new GL.GLTFLoader();
    try { const MO = await import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js'); loader.setMeshoptDecoder(MO.MeshoptDecoder); } catch (e) {}
    try { const DL = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js'); const dl = new DL.DRACOLoader(); dl.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); loader.setDRACOLoader(dl); } catch (e) {}
    const url = (this.props.footerModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/chibi-figure-compressed.glb';
    let g; try { g = await loader.loadAsync(url); } catch (e1) { try { g = await loader.loadAsync(url.replace('https://raw.githubusercontent.com/wuppie/wubble/main/', 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/')); } catch (e2) { console.warn('footer figure failed', e2); return; } }
    if (this.dead) return;
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(24, 1, 0.1, 50); cam.position.set(0, 0, 4.2);
    sc.add(new T.HemisphereLight(0xffffff, 0xd8d4cc, 1.1)); const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(1.5, 3, 2.5); sc.add(key); const rim = new T.DirectionalLight(0xffffff, 1.0); rim.position.set(-2.5, 1.2, -2); sc.add(rim);
    const m = g.scene; m.traverse((o) => { if (o.isMesh && o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); });
    const bb = new T.Box3().setFromObject(m, true), sz = bb.getSize(new T.Vector3()), k = 1 / Math.max(sz.x, sz.y, sz.z);
    m.scale.setScalar(k); m.position.sub(bb.getCenter(new T.Vector3()).multiplyScalar(k));
    const piv = new T.Group(); piv.add(m); sc.add(piv); piv.scale.setScalar(this.props.footerFigureSize ?? 1.5);
    const mix = g.animations && g.animations.length ? new T.AnimationMixer(m) : null; if (mix) mix.clipAction(g.animations[0]).play();
    const fit = () => { const w = box.clientWidth || 400, h = box.clientHeight || 500; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    fit(); addEventListener('resize', fit);
    const ms = { x: 0, y: 0, over: false }, ray = new T.Raycaster(), nd = new T.Vector2();
    addEventListener('pointermove', (e) => { ms.x = e.clientX / innerWidth * 2 - 1; ms.y = e.clientY / innerHeight * 2 - 1; const b = box.getBoundingClientRect();
      if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) { ms.over = false; return; }
      nd.set((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(nd, cam); ms.over = ray.intersectObject(piv, true).length > 0; }, { passive: true });
    let hvF = 0;
    const ft = box.closest('[data-footer]'); const t0 = performance.now(); let last = t0;
    r.autoClear = false; const art = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType });
    const qS = new T.Scene(), qC = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const qM = new T.ShaderMaterial({ transparent: true, uniforms: { tA: { value: art.texture } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: 'uniform sampler2D tA; varying vec2 vUv; ' + this.ditherGLSL(2.0) + ' void main(){ vec4 c = texture2D(tA, vUv); vec3 rgb = c.rgb / max(c.a, 0.001); rgb = pow(rgb, vec3(1.0 / 2.2)); rgb = rgb * 1.3 / (1.0 + rgb * 0.55) + 0.02; float a = step(dqB8(gl_FragCoord.xy / 2.0) * 0.85 + 0.08, c.a); gl_FragColor = vec4(DQ(rgb), a); }' });
    qS.add(new T.Mesh(new T.PlaneGeometry(2, 2), qM));
    const fit2 = () => { const pr = r.getPixelRatio(); art.setSize(Math.round((box.clientWidth || 400) * pr), Math.round((box.clientHeight || 500) * pr)); }; fit2(); addEventListener('resize', fit2);
    const loop = (now) => { if (this.dead) return; requestAnimationFrame(loop);
      if (ft && getComputedStyle(ft).visibility === 'hidden') { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const tt = (now - t0) / 1000;
      if (mix) mix.update(dt);
      hvF += ((ms.over ? 1 : 0) - hvF) * (1 - Math.exp(-dt * 6));
      piv.rotation.y += ((0.35 + ms.x * 0.45) * (1 - hvF) - piv.rotation.y) * (1 - Math.exp(-dt * 3));
      piv.rotation.x += ((ms.y * 0.12) * (1 - hvF) - piv.rotation.x) * (1 - Math.exp(-dt * 3));
      piv.rotation.z = Math.sin(tt * 9) * 0.09 * hvF;
      piv.position.y = Math.sin(tt * 0.9) * 0.04 + Math.abs(Math.sin(tt * 4.5)) * 0.06 * hvF;
      box.style.cursor = ms.over ? 'pointer' : ''; r.setRenderTarget(art); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam); r.setRenderTarget(null); r.clear(); r.render(qS, qC); };
    requestAnimationFrame(loop);
  },
  async initFooterLetters() {
    const ft = document.querySelector('[data-footer]'), word = ft && ft.querySelector('[data-fl-word]'), host = ft && ft.querySelector('[data-fl-gl]'); if (!word || !host || word.__fl) return; word.__fl = true;
    const tEl = ft.querySelector('[data-ft-time]'); if (tEl) { const up = () => { const d = new Date(); tEl.textContent = d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('en-GB'); }; up(); this._ftT = setInterval(up, 1000); }
    const txt = word.textContent.trim(); word.textContent = '';
    const spans = Array.from(txt).map((ch) => { const sp = document.createElement('span'); sp.textContent = ch; sp.setAttribute('data-fl', ''); sp.style.display = 'inline-block'; word.appendChild(sp); return sp; });
    const AS = document.createElement('span'); AS.setAttribute('data-fl-astro', ''); AS.setAttribute('aria-hidden', 'true');
    AS.style.cssText = 'display:inline-block;position:relative;width:0.5em;height:1.08em;vertical-align:-0.03em;margin:0 -0.02em;pointer-events:none;';
    if (spans.length > 3 && (this.props.footerAstro ?? true) && !(this.props.footerMoon ?? true)) spans[2].after(AS);
    if ((this.props.footerMoon ?? true) && this.initFooterMoon) this.whenNear(0.45, 15000, () => this.initFooterMoon());
    const fit = () => { const base = 200; word.style.fontSize = base + 'px'; word.style.whiteSpace = 'nowrap'; word.style.letterSpacing = '0'; const kids = Array.from(word.children); if (!kids.length) return; kids.forEach((k) => { k.style.translate = ''; k.style.rotate = ''; }); const L = kids[0].getBoundingClientRect().left, Rr = kids[kids.length - 1].getBoundingClientRect().right, w = Rr - L, cs = getComputedStyle(word), avail = word.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); if (w > 0 && avail > 0) word.style.fontSize = (base * avail / w * 0.995).toFixed(2) + 'px'; };
    try { await document.fonts.ready; } catch (e) {}
    fit(); addEventListener('resize', fit); setTimeout(fit, 600);
    this._flEls = Array.from(word.children); this._flEls.forEach((el) => { el.style.willChange = 'transform,opacity'; el.style.transformOrigin = '0% 100%'; });
    if (AS.isConnected && this.footerAstro) this.footerAstro(ft, AS);
    if ((this.props.footerHover || 'None') === 'None') return;
    if ((this.props.footerHover || 'None') === 'Sprite') { this.footerSprites(ft, word, spans); return; }
    const T = await import('https://esm.sh/three@0.160.0'); if (this.dead) return;
    await new Promise((res) => { const w = () => { if (this.dead) return; if (getComputedStyle(ft).visibility !== 'hidden') res(); else setTimeout(w, 250); }; w(); });
    if (this.dead) return;
    const r = new T.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false }); r.setClearColor(0x000000, 0);
    let glOK = true;
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); glOK = false; console.warn('[footer] WebGL context lost, plain letters'); spans.forEach((sp) => { if (window.gsap) window.gsap.killTweensOf(sp); sp.style.opacity = ''; }); });
    r.domElement.addEventListener('webglcontextrestored', () => { glOK = true; build(); });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; host.appendChild(r.domElement);
    const cvs = [0, 1, 2].map(() => document.createElement('canvas')), tex = cvs.map((c) => { const t = new T.CanvasTexture(c); t.minFilter = T.LinearFilter; t.generateMipmaps = false; return t; });
    const N = 8, rects = Array.from({ length: N }, () => new T.Vector4(-1, -1, -1, -1)), amt = new Array(N).fill(0), mat = new Array(N).fill(0);
    const TL = new T.TextureLoader(), rockBase = (this.props.rockTexBase || '').trim() || './textures/Rock063_';
    const rk = (n, srgb) => { const t = TL.load(rockBase + n + '.jpg'); t.wrapS = t.wrapT = T.RepeatWrapping; if (srgb) t.colorSpace = T.SRGBColorSpace; return t; };
    const U = { tRC: { value: rk('Color', false) }, tRN: { value: rk('NormalGL') }, tRR: { value: rk('Roughness') }, tRD: { value: rk('Displacement') }, tM: { value: tex[0] }, tB1: { value: tex[1] }, tB2: { value: tex[2] }, uR: { value: rects }, uA: { value: amt }, uK: { value: mat }, uT: { value: 0 }, uRes: { value: new T.Vector2(1, 1) }, uInk: { value: new T.Color(0x0e0e0d) } };
    const m = new T.ShaderMaterial({ uniforms: U, transparent: true, depthTest: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `precision highp float; uniform sampler2D tM, tB1, tB2, tRC, tRN, tRR, tRD; uniform vec4 uR[8]; uniform float uA[8], uK[8], uT; uniform vec2 uRes; uniform vec3 uInk; varying vec2 vUv;
        float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float ns(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hs(i), hs(i + vec2(1, 0)), f.x), mix(hs(i + vec2(0, 1)), hs(i + vec2(1, 1)), f.x), f.y); }
        float bay(vec2 p){ vec2 q = mod(floor(p), 4.0); float i = q.x + q.y * 4.0; return mod(i * 9.0 + floor(i / 4.0) * 7.0, 16.0) / 16.0; }
        void main(){
          vec4 col = vec4(0.0);
          for (int i = 0; i < 8; i++) {
            float a = uA[i]; if (a < 0.002) continue; vec4 rc = uR[i];
            vec2 c = (rc.xy + rc.zw) * 0.5, hsz = (rc.zw - rc.xy) * 0.5;
            vec2 d = (vUv - c) / hsz; if (abs(d.x) > 1.6 || abs(d.y) > 1.5) continue;
            float k = uK[i];
            vec2 uv = vUv;
            if (vUv.x < rc.x - hsz.x * 0.015 || vUv.x > rc.z + hsz.x * 0.015) continue;
            float b1 = texture2D(tB1, uv).r, b2 = texture2D(tB2, uv).r;
            float inside = smoothstep(0.38, 0.52, b1);
            vec2 sh = vec2(0.004, -0.012) * hsz.y * 4.0; float shd = smoothstep(0.2, 0.6, texture2D(tB2, uv - sh).r) * (1.0 - inside) * 0.22 * a;
            col.rgb = mix(col.rgb, vec3(0.05), shd * (1.0 - col.a)); col.a = max(col.a, shd);
            if (inside < 0.01) continue;
            vec2 e = 1.5 / uRes; float h = pow(b1, 0.7) * 0.55 + b2 * 0.45;
            float hx = (pow(texture2D(tB1, uv + vec2(e.x, 0)).r, 0.7) * 0.55 + texture2D(tB2, uv + vec2(e.x, 0)).r * 0.45) - (pow(texture2D(tB1, uv - vec2(e.x, 0)).r, 0.7) * 0.55 + texture2D(tB2, uv - vec2(e.x, 0)).r * 0.45);
            float hy = (pow(texture2D(tB1, uv + vec2(0, e.y)).r, 0.7) * 0.55 + texture2D(tB2, uv + vec2(0, e.y)).r * 0.45) - (pow(texture2D(tB1, uv - vec2(0, e.y)).r, 0.7) * 0.55 + texture2D(tB2, uv - vec2(0, e.y)).r * 0.45);
            vec3 n = normalize(vec3(-hx * 14.0, -hy * 14.0, 1.0)), V = vec3(0, 0, 1), L = normalize(vec3(-0.45, 0.6, 0.75)), H = normalize(L + V);
            float df = max(dot(n, L), 0.0), fr = pow(1.0 - n.z, 2.0), sp = pow(max(dot(n, H), 0.0), 60.0);
            vec3 c3;
            if (k > 3.5) { vec2 tu = vUv * uRes / uRes.y * 1.6; float dsp = texture2D(tRD, tu).r;
              vec3 tn = texture2D(tRN, tu + (dsp - 0.5) * 0.02).xyz * 2.0 - 1.0; vec3 nn = normalize(vec3(n.xy * 1.3 + tn.xy * 1.1, n.z));
              vec3 alb = pow(texture2D(tRC, tu).rgb, vec3(2.2)); float rgh = texture2D(tRR, tu).r;
              float d2 = max(dot(nn, L), 0.0), s2 = pow(max(dot(nn, H), 0.0), mix(80.0, 8.0, rgh)) * (1.0 - rgh) * 0.6;
              float ao = mix(0.55, 1.0, dsp) * (0.7 + 0.3 * smoothstep(0.0, 0.6, h));
              c3 = alb * (0.22 + 1.05 * d2) * ao + s2 + alb * fr * 0.2; c3 = pow(c3, vec3(1.0 / 2.2)); }
            else if (k < 0.5) { vec3 base = vec3(0.86, 0.45, 0.22); c3 = base * (0.35 + 0.75 * df) + vec3(1.0, 0.85, 0.7) * sp * 0.55 + base * fr * 0.35 + vec3(0.3, 0.08, 0.02) * (1.0 - h) * 0.4; }
            else if (k < 1.5) { vec3 rf = reflect(-V, n); float sky = smoothstep(-0.2, 0.6, rf.y); vec3 env = mix(vec3(0.06), vec3(0.95), sky) + 0.5 * smoothstep(0.9, 1.0, sin(rf.x * 6.0 + rf.y * 3.0 + uT * 0.6)); c3 = env * 0.85 + sp * 1.2 + fr * 0.3; }
            else if (k < 2.5) { float lum = 0.12 + 0.9 * df + sp * 0.8 + fr * 0.25; c3 = step(bay(gl_FragCoord.xy / 2.0) + 0.02, lum) > 0.5 ? vec3(0.925, 0.914, 0.886) : uInk; if (lum < 0.2) c3 = uInk; c3 = mix(uInk, c3, 0.9); }
            else { float hu = fr * 2.5 + h * 1.5 + uT * 0.2; vec3 ir = 0.5 + 0.5 * cos(6.2832 * (hu + vec3(0.0, 0.33, 0.67))); c3 = mix(vec3(0.08), ir, 0.35 + 0.6 * fr) * (0.4 + 0.7 * df) + sp * 1.4; }
            float nz = ns(vUv * uRes / 34.0) * 0.6 + ns(vUv * uRes / 11.0) * 0.4;
            float g = clamp((d.y * 0.5 + 0.5) * 0.6 + nz * 0.4, 0.0, 1.0), th = a * 1.3 - 0.15;
            float rv = smoothstep(g - 0.05, g + 0.05, th), edge = smoothstep(-0.03, 0.0, th - g) * (1.0 - smoothstep(0.0, 0.06, th - g));
            c3 = mix(c3, vec3(0.93, 0.91, 0.87), edge * 0.6);
            float al = inside * max(rv, edge * 0.9);
            col.rgb = mix(col.rgb, c3, al); col.a = max(col.a, al);
          }
          gl_FragColor = col;
        }` });
    const sc = new T.Scene(), cam = new T.Camera(); sc.add(new T.Mesh(new T.PlaneGeometry(2, 2), m));
    const build = () => {
      const fw = ft.clientWidth, fh = ft.clientHeight; if (!fw || !fh) return;
      word.style.fontSize = '22vw'; const target = word.parentElement.clientWidth - parseFloat(getComputedStyle(word.parentElement).paddingLeft) - parseFloat(getComputedStyle(word.parentElement).paddingRight);
      for (let it = 0; it < 3; it++) { const w = word.scrollWidth; if (!w) break; word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * target / w).toFixed(2) + 'px'; }
      const pr = Math.min(1.5, devicePixelRatio || 1), W = Math.min(2048, Math.round(fw * pr)), Hh = Math.round(fh * W / fw), k = W / fw;
      r.setPixelRatio(1); r.setSize(fw, fh, false); r.setSize(W, Hh, false); r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; U.uRes.value.set(W, Hh);
      const fr = ft.getBoundingClientRect(), cs = getComputedStyle(word);
      cvs.forEach((c) => { c.width = W; c.height = Hh; });
      const g0 = cvs[0].getContext('2d'); g0.fillStyle = '#000'; g0.fillRect(0, 0, W, Hh); g0.fillStyle = '#fff'; g0.textBaseline = 'alphabetic';
      g0.font = cs.fontWeight + ' ' + (parseFloat(cs.fontSize) * k).toFixed(1) + 'px ' + cs.fontFamily;
      const rg = document.createRange();
      spans.forEach((sp, i) => { const b = sp.getBoundingClientRect(); rg.selectNodeContents(sp); const ib = rg.getBoundingClientRect();
        const ascent = g0.measureText(sp.textContent).actualBoundingBoxAscent, mH = g0.measureText('H');
        const base = (ib.top - fr.top) * k + (ib.height * k + mH.actualBoundingBoxAscent - mH.actualBoundingBoxDescent) / 2;
        g0.fillText(sp.textContent, (b.left - fr.left) * k, base);
        if (i < N) { const top = base - ascent, bot = base; rects[i].set((b.left - fr.left) * k / W, 1 - bot / Hh, (b.right - fr.left) * k / W, 1 - top / Hh); } });
      const capH = g0.measureText('H').actualBoundingBoxAscent;
      [[1, 0.035], [2, 0.1]].forEach(([j, f2]) => { const g = cvs[j].getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); g.filter = 'blur(' + Math.max(1, capH * f2).toFixed(1) + 'px)'; g.drawImage(cvs[0], 0, 0); g.filter = 'none'; });
      tex.forEach((t) => { t.needsUpdate = true; });
    };
    build(); setTimeout(build, 400); let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); });
    const G = window.gsap, st = spans.map(() => ({ v: 0 })); let lastK = -1;
    const on = (i) => { if (i >= N) return; let kk; do { kk = Math.floor(Math.random() * 4); } while (kk === lastK); lastK = kk; if (st[i].v < 0.05) mat[i] = i === 0 && (this.props.rockOnW ?? true) ? 4 : kk;
      if (!glOK) return; if (G) { G.to(st[i], { v: 1, duration: 1.0, ease: 'power2.inOut', overwrite: true, onUpdate: () => { amt[i] = st[i].v; } }); G.to(spans[i], { opacity: 0, duration: 0.5, delay: 0.35, ease: 'power1.out', overwrite: true }); } else { amt[i] = 1; spans[i].style.opacity = '0'; } };
    const off = (i) => { if (i >= N) return; if (G) { G.to(st[i], { v: 0, duration: 0.85, ease: 'power2.inOut', overwrite: true, onUpdate: () => { amt[i] = st[i].v; } }); G.to(spans[i], { opacity: 1, duration: 0.4, ease: 'power1.out', overwrite: true }); } else { amt[i] = 0; spans[i].style.opacity = ''; } };
    spans.forEach((sp, i) => { sp.addEventListener('pointerenter', (ev) => { if (ev.pointerType !== 'touch') on(i); }); sp.addEventListener('pointerleave', (ev) => { if (ev.pointerType !== 'touch') off(i); });
      sp.addEventListener('click', () => { if (st[i].v > 0.5) off(i); else { on(i); setTimeout(() => off(i), 2200); } }); });
    const t0 = performance.now();
    const loop = (now) => { if (this.dead) return; requestAnimationFrame(loop); if (getComputedStyle(ft).visibility === 'hidden') return; U.uT.value = (now - t0) / 1000; r.render(sc, cam); };
    requestAnimationFrame(loop);
  },
  initLetterStorm() {
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:30;opacity:0;';
    document.body.appendChild(cv); const g = cv.getContext('2d');
    const mob = innerWidth < 820, N = mob ? 110 : 220, AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const P = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2.2, z: 0.08 + Math.random() * 0.92, ch: AB[(Math.random() * 26) | 0], r: (Math.random() - 0.5) * 1.2, vr: (Math.random() - 0.5) * 0.8, pz: 0 }));
    let W = 0, H = 0, dpr = 1, last = performance.now(), lastP = 0, spd = 0, live = 0, on = false;
    const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = window.__svh || innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); addEventListener('resize', size);
    const fam = () => ((getComputedStyle(document.documentElement).getPropertyValue('--display') || '').trim() || 'Oswald') + ', Helvetica, sans-serif';
    this.letterStorm = () => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const b = (q) => Math.sin(Math.PI * Math.max(0, Math.min(1, q || 0)));
      const pr = (this.rp || 0) + (this.rq || 0) + (this.r3 || 0);
      const dp = (pr - lastP) / Math.max(0.001, dt); lastP = pr;
      const amt = Math.max(b(this.rp), b(this.rq), b(this.r3)) * (this.props.letterStorm ?? 0) * (this.state.page ? 0 : 1);
      live += (amt - live) * (1 - Math.exp(-dt * 4));
      if (live < 0.004) { if (on) { g.clearRect(0, 0, cv.width, cv.height); cv.style.opacity = '0'; on = false; } return; }
      on = true; cv.style.opacity = '1';
      const tgt = (0.12 + Math.min(2.5, Math.abs(dp) * 2.2)) * (dp < -0.002 ? -1 : 1);
      spd += (tgt - spd) * (1 - Math.exp(-dt * 3));
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const f = Math.min(W, H) * 0.55, cx = W / 2, cy = H / 2, F = fam();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#c9c6bd';
      for (const p of P) {
        p.pz = p.z; p.z -= spd * dt * 0.55; p.r += p.vr * dt;
        if (p.z < 0.05) { p.z += 0.95; p.pz = p.z; p.x = (Math.random() - 0.5) * 3; p.y = (Math.random() - 0.5) * 2.2; }
        if (p.z > 1) { p.z -= 0.95; p.pz = p.z; }
        const sx = cx + p.x / p.z * f * 0.5, sy = cy + p.y / p.z * f * 0.5; if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) continue;
        const fs = Math.max(4, 26 / p.z * (mob ? 0.7 : 1)), fog = Math.min(1, (1 - p.z) * 1.4), a = live * fog * (p.z < 0.15 ? p.z / 0.15 : 1);
        if (a < 0.01) continue;
        g.font = '600 ' + fs.toFixed(1) + 'px ' + F;
        const fd = Math.abs(p.z - 0.42), bl = Math.min(mob ? 6 : 10, fd * fd * 60 + (p.z < 0.2 ? (0.2 - p.z) * 40 : 0));
        g.filter = bl > 0.6 ? 'blur(' + bl.toFixed(1) + 'px)' : 'none';
        const gh = Math.min(4, 1 + Math.abs(spd) * 1.6) | 0;
        for (let i = gh; i >= 0; i--) {
          const zz = p.z + (p.pz - p.z) * i * 3, gx = cx + p.x / zz * f * 0.5, gy = cy + p.y / zz * f * 0.5;
          g.globalAlpha = a * (i === 0 ? 0.85 : 0.22 / i);
          g.save(); g.translate(gx, gy); g.rotate(p.r); g.fillText(p.ch, 0, 0); g.restore();
        }
      }
      g.globalAlpha = 1; g.filter = 'none';
    };
  },
  initSwap() {
    const root = this.chromeRef.current; if (!root) return;
    const A = root.querySelector('[data-swap-a]'), B = root.querySelector('[data-swap-b]');
    const blur = document.querySelector('[data-goo-text]');
    if (!A || !B) return;
    const GL = 'abcdefghijklmnopqrstuvwxyz#%&*+=/<>0123456789';
    const scramble = (el, txt, dur) => {
      const t0 = performance.now();
      const step = () => {
        if (this.dead) return;
        const k = Math.min(1, (performance.now() - t0) / dur);
        el.textContent = txt.split('').map((c, i) => (i + 1) / txt.length <= k ? c : GL[(Math.random() * GL.length) | 0]).join('');
        if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
      };
      step();
    };
    let side = 0, from = 0, to = 0, t0 = 0, moving = false;
    const ease = (t) => t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2;
    const frame = () => {
      if (this.dead) return;
      this.swapRaf = requestAnimationFrame(frame);
      {
        const vv = window.visualViewport, th = (vv ? vv.height : innerHeight) - 32;
        this.chH = this.chH == null ? th : this.chH + (th - this.chH) * 0.18;
        if (Math.abs(th - this.chH) < 0.5) this.chH = th;
        if (this.chH !== this.chHSet) { this.chHSet = this.chH; root.style.height = this.chH.toFixed(1) + 'px'; }
      }
      const grp = A.parentElement === B.parentElement && A.parentElement.hasAttribute('data-swap-group');
      let da, db; if (grp) { const gap = parseFloat(getComputedStyle(A.parentElement).columnGap) || 10; da = B.offsetWidth + gap; db = A.offsetWidth + gap; } else { const W = A.parentElement.clientWidth - 64; da = W - A.offsetWidth; db = W - B.offsetWidth; }
      let k = to, v = 0;
      if (moving) {
        const t = Math.min(1, (performance.now() - t0) / 1600);
        k = from + (to - from) * ease(t); v = Math.sin(Math.PI * t);
        if (t >= 1) moving = false;
      }
      if (blur) blur.setAttribute('stdDeviation', (v * 1.3).toFixed(2));
      A.style.filter = B.style.filter = v > 0.02 ? 'url(#gooText)' : '';
      const sq = 1 + v * 0.35, sc = v > 0.001 ? ' scale(' + sq + ',' + (1 / sq) + ')' : '';
      A.style.transform = 'translate3d(' + (k * da) + 'px,0,0)' + sc;
      B.style.transform = 'translate3d(' + (-k * db) + 'px,0,0)' + sc;
    };
    frame();
    this.swapTimer = setInterval(() => {
      side = 1 - side; from = to; to = side; t0 = performance.now(); moving = true;
    }, 9000);
  },
  initLoader() {
    this.prepEntrance();
    const el = this.loaderRef.current; if (!el) return;
    const cnt = el.querySelector('[data-ld-count]'), bar = el.querySelector('[data-ld-bar]'), word = el.querySelector('[data-ld-word]');
    const t0 = performance.now(), MIN = 2600, MAX = 30000;
    let shown = 0, ready = false, outT = 0;
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    fonts.then(() => { this._fontsOK = true; }); setTimeout(() => { this._fontsOK = true; }, 2500);
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    const toTop = () => { scrollTo(0, 0); window.__sliderLenis && window.__sliderLenis.scrollTo(0, { immediate: true, force: true }); };
    toTop(); this._toTop = toTop; document.documentElement.classList.add('wb-ready');
    this.lockScroll(true);
    this._ldAstroOK = false; // r14.11: the loader waits for the astronaut (model + textures on screen)
    setTimeout(() => { if (this.dead || el.style.display === 'none') return; console.warn('[loader] safety release'); el.style.display = 'none'; document.documentElement.classList.add('wb-reveal', 'wb-done'); if (this._ldStop) this._ldStop(); this.lockScroll(false); if (!this._entered) { this._entered = true; try { this.runEntrance(); } catch (e) {} } }, 36000);
    const ease = (t) => 1 - Math.pow(1 - t, 4), io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = () => {
      if (this.dead) return;
      const now = performance.now(), el2 = now - t0;
      if (window.__wbAstroReady) this._ldAstroOK = true;
      // real progress: model download 0→80%, textures + first frame 80→99%, 100 only once the astronaut is on screen
      const gp = (window.__glbProg && window.__wbAstroUrl && window.__glbProg[window.__wbAstroUrl]) || 0, creep = Math.min(0.08, el2 / 12000);
      const target = (this._ldAstroOK && this._fontsOK && el2 > MIN) || el2 > MAX ? 1 : Math.min(this._ldAstroOK ? 0.99 : 0.97, Math.max(creep, gp * 0.8 + (gp >= 1 ? 0.12 : 0) + (this._ldAstroOK ? 0.07 : 0)));
      shown += (target - shown) * (target >= 1 ? 0.12 : 0.06); if (target >= 1 && shown > 0.995) shown = 1; if (target < 1) shown = Math.min(shown, 0.99);
      cnt.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      bar.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
      if (this._ldU) this._ldU.value = shown;
      if (shown >= 1 && !ready) { ready = true; outT = now + 250; document.documentElement.classList.add('wb-reveal'); }
      if (ready && now > outT) {
        const k = Math.min(1, (now - outT) / 1100), e = io(k);
        el.style.clipPath = 'inset(0 0 ' + (e * 100).toFixed(2) + '% 0)';
        if (this._ldCv) this._ldCv.style.opacity = String(1 - e);
        cnt.style.transform = 'translate3d(0,' + (-e * 40) + '%,0)';
        if (k > 0.45 && !this._entered) { this._entered = true; this.runEntrance(); }
        if (k >= 1) { el.style.display = 'none'; this._toTop && this._toTop(); this.lockScroll(false); document.documentElement.classList.add('wb-done'); if (this._ldStop) this._ldStop(); return; }
      }
      requestAnimationFrame(step);
    };
    step();
  },
  runEntrance() {
    try { this.fitHeroTitle && this.fitHeroTitle(); } catch (e) {} /* r14.26: settle the title size BEFORE anything moves */
    setTimeout(() => { this.gsapReady = true; }, 1200);
    const T = this.entranceTargets(), t0 = performance.now();
    const ex = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const items = [];
    T.lines.forEach((el, i) => items.push({ el, d: 80 + i * 110, dur: 1500, kind: 'line' }));
    if (T.model) items.push({ el: T.model, d: 0, dur: 2200, kind: 'model' });
    T.hdr.forEach((el, i) => items.push({ el, d: 520 + i * 90, dur: 1200, kind: 'ui' }));
    T.ftr.forEach((el, i) => items.push({ el, d: 760 + i * 90, dur: 1200, kind: 'ui' }));
    // r14.22: hero services reveal with the entrance (no longer waits for the hero 3D loop / a mouse move)
    document.querySelectorAll('[data-svc] [data-cw]').forEach((el, i) => items.push({ el, d: 700 + i * 70, dur: 900, kind: 'cw' }));
    const step = () => {
      if (this.dead) return;
      const now = performance.now(); let busy = false;
      items.forEach(it => {
        const t = Math.max(0, Math.min(1, (now - t0 - it.d) / it.dur)), e = ex(t);
        if (t < 1) busy = true;
        if (it.kind === 'line') { it.el.style.clipPath = t >= 1 ? '' : 'inset(0 0 ' + ((1 - e) * 100).toFixed(2) + '% 0)'; it.el.style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 0.6).toFixed(3) + 'em,0)'; }
        else if (it.kind === 'model') { it.el.style.opacity = String(Math.min(1, t * 1.6)); it.el.style.transform = t >= 1 ? '' : 'scale(' + (1 + (1 - e) * 0.12).toFixed(4) + ')'; }
        else if (it.kind === 'cw') { it.el.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110).toFixed(2) + '%,0) rotate(' + ((1 - e) * 4).toFixed(2) + 'deg)'; it.el.style.opacity = t >= 1 ? '' : (0.15 + 0.85 * e).toFixed(3); }
        else { it.el.style.opacity = String(e); it.el.style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 14).toFixed(2) + 'px,0)'; }
        if (t >= 1) it.el.style.willChange = '';
      });
      if (busy) requestAnimationFrame(step);
    };
    step();
  },
  initGrain() {
    const P = this.props; let el = document.getElementById('site-grain');
    if (!(P.grainBg ?? true)) { if (el) el.style.display = 'none'; return; }
    if (!el) {
      const N = 160, c = document.createElement('canvas'); c.width = N; c.height = N; const g = c.getContext('2d'), d = g.createImageData(N, N);
      for (let i = 0; i < N * N; i++) { const v = Math.random() * 255 | 0; d.data[i * 4] = v; d.data[i * 4 + 1] = v; d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
      g.putImageData(d, 0, 0);
      el = document.createElement('div'); el.id = 'site-grain'; el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:-50%;top:-50%;width:200%;height:200%;z-index:58;pointer-events:none;mix-blend-mode:screen;background-repeat:repeat;background-size:' + (P.grainSize ?? 160) + 'px;will-change:transform;';
      el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
      document.body.appendChild(el);
      const steps = []; for (let i = 0; i < 10; i++) steps.push({ transform: 'translate3d(' + ((Math.random() * 20 - 10) | 0) + '%,' + ((Math.random() * 20 - 10) | 0) + '%,0)' });
      this._grainAnim = el.animate(steps, { duration: 1000, iterations: Infinity, easing: 'steps(10)' });
    }
    el.style.display = ''; el.style.opacity = String(P.grainAmount ?? 0.07);
  },
  initFooter() {
    const sp = document.querySelector('[data-footer-spacer]'), ft = document.querySelector('[data-footer]'); if (!sp || !ft) return;
    const dim = ft.querySelector('[data-footer-dim]'), inner = ft.querySelector('[data-footer-inner]'); let lastH = 0;
    const tick = () => {
      if (this.dead) return; this.ftRaf = requestAnimationFrame(tick);
      const vh = innerHeight, H = ft.offsetHeight; if (H && H !== lastH) { lastH = H; sp.style.height = H + 'px'; }
      const r = sp.getBoundingClientRect();
      if (r.top >= vh || this.state.page) { if (ft.style.visibility !== 'hidden') ft.style.visibility = 'hidden'; return; }
      ft.style.visibility = 'visible';
      const p = Math.max(0, Math.min(1, (vh - r.top) / Math.max(1, H))), e = 1 - Math.pow(1 - p, 3);
      // tall footer: top pinned at 0 while revealing, then it scrolls with the spacer (bottom lines up at max scroll)
      const topW = H > vh ? (r.top > 0 ? 0 : r.top) : vh - H;
      const base = topW - (vh - H);
      if (window.__wbAscend) { const dy = -(1 - e) * vh; ft.style.transform = Math.abs(dy) > 0.05 ? 'translate3d(0,' + dy.toFixed(1) + 'px,0)' : ''; ft.style.clipPath = ''; }
      else ft.style.transform = Math.abs(base) > 0.05 ? 'translate3d(0,' + base.toFixed(1) + 'px,0)' : '';
      const ct = Math.max(0, r.top - topW), W = ft.offsetWidth || innerWidth, cv = (this.props.footerCurve ?? 0.14) * vh * Math.min(1, (1 - e) * 1.4);
      // bleed: the footer seeps up into Reach out with an organic, ink-like edge (fingers reach ahead), flattening as it settles
      if (false && cv > 1) { const t = performance.now() / 1000, N = 140, pts = [], DR = this._drips || (this._drips = Array.from({ length: 14 }, (_, k) => ({ x: (k + 0.5) / 14 + (Math.sin(k * 12.9898) * 0.5) * 0.05, w: 0.006 + ((k * 7) % 5) * 0.003, h: 0.35 + ((k * 13) % 7) / 10, s: 0.4 + ((k * 5) % 4) * 0.2 })));
        for (let i = 0; i <= N; i++) { const x = i / N; let d = 0; for (const q of DR) { const dx = (x - q.x) / q.w; d = Math.max(d, q.h * (0.85 + 0.15 * Math.sin(t * q.s + q.x * 20)) * Math.exp(-dx * dx)); }
          const wob = 0.06 * Math.sin(x * 14 + t * 0.6) + 0.04 * Math.sin(x * 31 - t * 0.9);
          pts.push((x * 100).toFixed(2) + '% ' + Math.max(0, ct + cv * (1 - d + wob)).toFixed(1) + 'px'); }
        ft.style.clipPath = 'polygon(0% 100%,' + pts.join(',') + ',100% 100%)'; }
      else if (!window.__wbAscend) ft.style.clipPath = 'inset(' + ct.toFixed(1) + 'px 0 0 0)';
      const FL = this._flEls; if (FL) { const n = FL.length; for (let i = 0; i < n; i++) { const a = Math.max(0, Math.min(1, (p - 0.35 - i * 0.045) / 0.4)), q = 1 - Math.pow(1 - a, 3), st = FL[i].style, tf = q > 0.999 ? '' : 'translate3d(0,' + ((1 - q) * 115).toFixed(2) + '%,0) rotate(' + ((1 - q) * 10).toFixed(2) + 'deg) skewY(' + ((1 - q) * 7).toFixed(2) + 'deg)'; if (st.transform !== tf) st.transform = tf; st.opacity = q > 0.999 ? '' : q.toFixed(3); } }
      if (dim) dim.style.opacity = '0';
      if (inner && inner.style.transform) inner.style.transform = '';
    };
    tick();
  },
  initSound() {
    const bars = () => this.chromeRef.current ? this.chromeRef.current.querySelectorAll('[data-bar]') : [];
    const lv = [0, 0, 0, 0, 0];
    const loop = () => {
      if (this.dead) return;
      this.sndRaf = requestAnimationFrame(loop);
      const on = this.state.soundOn, an = this.analyser, t = performance.now() / 1000;
      let data = null;
      if (on && an) { data = this.fData || (this.fData = new Uint8Array(an.frequencyBinCount)); an.getByteFrequencyData(data); }
      if (this.audio) this.audio.volume += ((on ? 0.7 : 0) - this.audio.volume) * 0.06;
      if (this.audio && !on && this.audio.volume < 0.01 && !this.audio.paused) this.audio.pause();
      bars().forEach((b, i) => {
        let tgt = 0.14;
        if (on) {
          if (data) { const lo = [2, 5, 10, 20, 40][i], hi = [5, 10, 20, 40, 80][i]; let sum = 0; for (let j = lo; j < hi; j++) sum += data[j]; tgt = 0.15 + (sum / (hi - lo) / 255) * 0.95; if (sum < 2) data = null; }
          if (!data) tgt = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * (3 + i * 1.3) + i)) * (0.6 + 0.4 * Math.sin(t * 1.7 + i * 2.1));
        }
        lv[i] += (Math.min(1, tgt) - lv[i]) * 0.18;
        b.style.transform = 'scaleY(' + lv[i].toFixed(3) + ')';
      });
    };
    loop();
  },
  fitHeroTitle() {
    // scale the top title so its letters span the full viewport width (capped by height)
    const h1 = this.headlineRef && this.headlineRef.current; if (!h1 || !h1.children.length) return;
    /* r14.26: measure LAYOUT boxes (offset*), never transformed rects — the entrance animates the letters/lines with
       translate, so getBoundingClientRect mid-animation changed the font size and moved the services row (the jumping).
       Also skip refits when nothing relevant changed (mobile fires resize for the address bar during the entrance). */
    const fk = innerWidth + '|' + (document.fonts ? document.fonts.status : '') + '|' + h1.children.length;
    if (this._fitK === fk) return; this._fitK = fk;
    const hcs = getComputedStyle(h1), W = h1.clientWidth - (parseFloat(hcs.paddingLeft) || 0) - (parseFloat(hcs.paddingRight) || 0) - 4, kids = Array.from(h1.children);
    const fs0 = parseFloat(hcs.fontSize) || 100;
    const a = kids[0], z = kids[kids.length - 1], w = (z.offsetLeft + z.offsetWidth) - a.offsetLeft;
    if (w > 0) { const fs = Math.min(fs0 * W / w, (window.__svh || innerHeight) * 0.62); if (Math.abs(fs - fs0) > 0.5) h1.style.fontSize = fs.toFixed(1) + 'px'; }
    // services row sits just below the title's letters
    const par = h1.parentElement, ul = par && par.querySelector('ul[data-cg]'), wrap = ul && ul.parentElement;
    if (wrap && wrap !== par) {
      const relTop = h1.offsetParent === par ? h1.offsetTop : h1.offsetTop - (h1.offsetParent === par.offsetParent ? par.offsetTop : 0);
      const top = Math.round(relTop + h1.offsetHeight + Math.max(10, (window.__svh || innerHeight) * 0.02));
      if (wrap.style.bottom !== 'auto') wrap.style.bottom = 'auto';
      if (Math.abs((parseFloat(wrap.style.top) || -1e4) - top) > 1) wrap.style.top = top + 'px';
    }
  }
});
(window.WBL = window.WBL || {}).ui = 1;
