/*!
 * Dees kun je krijgen — site interactions
 * Requires: GSAP 3.13+ (gsap, ScrollTrigger, SplitText). Optional: Lenis (smooth scroll).
 * Webflow: paste the CDN scripts + this file before </body>. It auto-inits on [data-dees-root].
 * All hooks are data-attributes, so classes/styles can be changed freely in the Designer.
 */
(function () {
  var DeesSite = {};

  DeesSite.init = function (root, opts) {
    if (!root) return null;
    if (root.__dees) return root.__dees;
    var o = Object.assign({ smooth: true, badgeEnergy: 1, particles: 99, navDistance: 400 }, opts || {});
    var gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
    gsap.registerPlugin(ST, Split);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var q = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
    var one = function (s) { return root.querySelector(s); };
    var cleanups = [];

    // ---------- smooth scroll (Lenis = the engine under Locomotive Scroll v5) ----------
    var lenis = null;
    if (o.smooth && window.Lenis && !reduce) {
      lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
      lenis.on('scroll', ST.update);
      var lraf = function (t) { lenis.raf(t * 1000); };
      gsap.ticker.add(lraf);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(function () { gsap.ticker.remove(lraf); lenis.destroy(); });
    }

    // ---------- PRELOADER (counter) ----------
    var readyResolve; var ready = new Promise(function (r) { readyResolve = r; });
    function preloader() {
      var pl = one('[data-preloader]');
      if (!pl || reduce || root.__deesPreloaded) { if (pl) pl.style.display = 'none'; window.__deesPreloaderDone = true; readyResolve(); return; }
      root.__deesPreloaded = true;
      if (lenis) lenis.stop();
      var cnt = pl.querySelector('[data-preloader-counter]');
      var cols = [];
      if (cnt) {
        cnt.textContent = '';
        for (var c = 0; c < 3; c++) {
          var mask = document.createElement('span'); mask.className = 'preloader_digit-mask';
          mask.style.cssText = 'display:block;overflow:hidden;height:1em;line-height:1;';
          var col = document.createElement('span'); col.className = 'preloader_digit-col'; col.style.cssText = 'display:flex;flex-direction:column;';
          for (var d = 0; d <= 10; d++) { var s = document.createElement('span'); s.textContent = d % 10; s.style.cssText = 'display:block;height:1em;'; col.appendChild(s); }
          mask.appendChild(col); cnt.appendChild(mask); cols.push(col);
        }
        cols[0].parentNode.style.display = 'none';
      }
      var lastN = -1;
      var setDigits = function (v) {
        var n = Math.min(100, Math.round(v)); if (n === lastN || !cols.length) return; lastN = n;
        var hd = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10;
        cols[0].parentNode.style.display = n >= 100 ? 'block' : 'none';
        gsap.set(cols[2], { yPercent: -(o / 11) * 100 });
        gsap.to(cols[1], { yPercent: -((n >= 100 ? 10 : t) / 11) * 100, duration: .45, ease: 'power3.out', overwrite: true });
        gsap.to(cols[0], { yPercent: -(hd / 11) * 100, duration: .45, ease: 'power3.out', overwrite: true });
      };
      // counter = min(time-based minimum, real character-loading progress, page load)
      var minDur = parseFloat(pl.getAttribute('data-preloader-duration')) || 2.6;
      var hasChar = !!one('[data-character="hero"]');
      var charP = hasChar ? 0 : 100, pageP = document.readyState === 'complete' ? 100 : 60;
      var onP = function (e) { charP = Math.max(charP, (e.detail && e.detail.p || 0) * 100); };
      var onLoad = function () { pageP = 100; };
      window.addEventListener('dees:char-progress', onP);
      window.addEventListener('load', onLoad, { once: true });
      var timeP = { v: 0 }; gsap.to(timeP, { v: 100, duration: minDur, ease: 'power1.inOut' });
      var shown = 0, done = false, t0 = performance.now();
      var tick = function () {
        if (done) return;
        var target = Math.min(timeP.v, charP, pageP);
        shown += (target - shown) * .1; if (target - shown < .5) shown = target;
        setDigits(shown);
        if (shown >= 99.5 || performance.now() - t0 > 12000) { done = true; gsap.ticker.remove(tick); clearInterval(safety); finish(); }
      };
      gsap.ticker.add(tick);
      // safety net that also runs when animation frames are paused (background tab)
      var safety = setInterval(function () {
        if (done) { clearInterval(safety); return; }
        if (performance.now() - t0 > 12000 || (charP >= 100 && pageP >= 100 && performance.now() - t0 > minDur * 1000 + 600)) { done = true; gsap.ticker.remove(tick); clearInterval(safety); finish(); }
      }, 500);
      function finish() {
        window.removeEventListener('dees:char-progress', onP);
        setDigits(100);
        gsap.timeline({ delay: .35 })
          .add(function () { window.__deesPreloaderDone = true; window.dispatchEvent(new CustomEvent('dees:preloader-exit')); })
          .to(cnt, { yPercent: -110, duration: .9, ease: 'expo.inOut' }, 0)
          .to(pl, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.35, ease: 'expo.inOut' }, .3)
          .add(function () { readyResolve(); }, .75)
          .add(function () { pl.style.display = 'none'; if (lenis) lenis.start(); });
      }
      gsap.set(pl, { clipPath: 'inset(0% 0% 0% 0%)' });
    }
    preloader();

    var ctx = gsap.context(function () {
      nav(); intro(); marquee(); heroIcons(); heroParallax();
      splits(); reveals(); lines(); linkHovers(); serviceIcons(); clients(); cta(); footerCurve();
    }, root);
    var use3d = !!(window.THREE && window.DeesBadges3D);
    cleanups.push(use3d ? window.DeesBadges3D({ root: root, energy: o.badgeEnergy, reduce: reduce, ready: ready }) : badges(), particles(), clock(), cursor());

    // ---------- NAV: 3 spread words glide into one word ----------
    function nav() {
      var bar = one('[data-nav]'); if (!bar) return;
      var words = q('[data-nav-word]', bar); if (words.length < 2) return;
      var dist = parseFloat(bar.getAttribute('data-nav-distance')) || o.navDistance;
      var tl = gsap.timeline({ scrollTrigger: { start: 0, end: dist, scrub: 1.4, invalidateOnRefresh: true } });
      words.forEach(function (w, i) {
        if (!i) return;
        tl.to(w, { x: function () {
          var target = words[0].getBoundingClientRect().left;
          for (var j = 0; j < i; j++) target += words[j].offsetWidth;
          return target - (w.getBoundingClientRect().left - gsap.getProperty(w, 'x'));
        }, ease: 'power3.inOut' }, 0);
      });
      var footer = one('[data-footer]');
      if (footer) ST.create({ trigger: footer, start: 'top 8%',
        onEnter: function () { gsap.to(bar, { color: bar.getAttribute('data-nav-color-alt') || '#ff003d', duration: .4 }); },
        onLeaveBack: function () { gsap.to(bar, { color: bar.getAttribute('data-nav-color') || '#ffffff', duration: .4 }); } });
    }

    // ---------- page-load intro ----------
    function intro() {
      var tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
      var model = one('[data-hero-model-img]');
      if (model && !one('[data-character="hero"]')) tl.from(model, { yPercent: 22, scale: .78, rotation: -4, autoAlpha: 0, filter: 'blur(18px)', duration: 2.4, ease: 'expo.out' }, 0);
      tl.from(q('[data-marquee]'), { autoAlpha: 0, yPercent: 60, duration: 2, ease: 'power4.out' }, .15);
      tl.from(q('[data-nav-word]'), { yPercent: 120, rotation: 6, duration: 1.6, stagger: .09, ease: 'expo.out' }, .35);
      q('[data-hero-text]').forEach(function (el, i) {
        var s = Split.create(el, { type: 'lines', mask: 'lines' });
        (s.masks || []).forEach(function (m) { m.style.paddingBottom = '.1em'; m.style.marginBottom = '-.1em'; });
        tl.from(s.lines, { yPercent: 110, duration: 1.6, stagger: .1 }, .7 + i * .14);
      });
      if (!(window.THREE && window.DeesBadges3D)) tl.from(q('[data-badge]'), { y: 60, scale: .4, rotation: function () { return gsap.utils.random(-20, 20); }, autoAlpha: 0,
        duration: 1.4, ease: 'elastic.out(1,0.6)', stagger: { each: .07, from: 'center' }, clearProps: 'transform' }, .9);
      ready.then(function () { tl.play(); });
    }

    // ---------- hero marquee (speeds up with scroll velocity) ----------
    function marquee() {
      q('[data-marquee]').forEach(function (m) {
        var track = m.querySelector('[data-marquee-track]'); if (!track) return;
        var dur = parseFloat(m.getAttribute('data-marquee-duration')) || 28;
        var loop = gsap.to(track, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 });
        ST.create({ trigger: m, start: 'top bottom', end: 'bottom top', onUpdate: function (s) {
          var v = gsap.utils.clamp(-6, 6, s.getVelocity() / 300);
          gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: .2, overwrite: true });
          gsap.to(loop, { timeScale: 1, duration: 1.2, delay: .2 });
        } });
      });
    }

    // ---------- hero icons: hidden behind the model, float out on hover ----------
    function heroIcons() {
      var wrap = one('[data-hero-model]'); var icons = q('[data-hero-icon]');
      var hit = one('[data-hero-model-img]') || wrap;
      if (!wrap || !icons.length) return;
      gsap.set(icons, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: .3, rotation: 0, autoAlpha: 0 });
      var floats = [];
      var killFloats = function () { floats.forEach(function (f) { f.kill(); }); floats = []; };
      var show = function () {
        killFloats();
        icons.forEach(function (ic, i) {
          var tx = (parseFloat(ic.getAttribute('data-x')) || 0) / 100 * wrap.offsetWidth;
          var ty = (parseFloat(ic.getAttribute('data-y')) || 0) / 100 * wrap.offsetHeight;
          var rot = parseFloat(ic.getAttribute('data-rotate')) || 0;
          gsap.to(ic, { x: tx, y: ty, scale: 1, rotation: rot, autoAlpha: 1, duration: 1.3, ease: 'expo.out', delay: i * .07, overwrite: true,
            onComplete: function () {
              var r = wrap.offsetWidth * .022;
              floats.push(gsap.to(ic, { x: tx + r * (i % 2 ? -1 : 1), duration: 2.4 + i * .35, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
              floats.push(gsap.to(ic, { y: ty - r * 1.3, rotation: rot + (i % 2 ? 7 : -7), duration: 1.8 + i * .25, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
            } });
        });
      };
      var hide = function () {
        killFloats();
        gsap.to(icons, { x: 0, y: 0, scale: .3, rotation: 0, autoAlpha: 0, duration: .9, ease: 'power3.inOut', stagger: .04, overwrite: true });
      };
      hit.addEventListener('mouseenter', show); hit.addEventListener('mouseleave', hide);
      cleanups.push(function () { hit.removeEventListener('mouseenter', show); hit.removeEventListener('mouseleave', hide); killFloats(); });
    }

    function heroParallax() {
      var hero = one('[data-hero]'); var wrap = one('[data-hero-model]'); if (!hero || !wrap) return;
      gsap.to(wrap, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(q('[data-marquee]'), { yPercent: -60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // ---------- HERO BADGES: scatter + bounce physics ----------
    function badges() {
      var hero = one('[data-hero]'); var box = one('[data-badges]'); var els = q('[data-badge]');
      if (!hero || !box || !els.length || reduce) return null;
      var E = o.badgeEnergy, raf = 0, mouse = null, lastKick = 0;
      var st = els.map(function (el) { return { el: el, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 }; });
      function kick() {
        var now = performance.now(); if (now - lastKick < 700) return; lastKick = now;
        st.forEach(function (s) {
          var a = Math.random() * Math.PI * 2, sp = (14 + Math.random() * 20) * E;
          s.vx += Math.cos(a) * sp; s.vy += Math.sin(a) * sp - 10 * E; s.vr += (Math.random() - .5) * 34 * E;
        });
        start();
      }
      function step() {
        var hb = hero.getBoundingClientRect(), energy = 0;
        var c = st.map(function (s) {
          var r = s.el.getBoundingClientRect();
          return { cx: r.left + r.width / 2 - s.x, cy: r.top + r.height / 2 - s.y, hw: s.el.offsetWidth / 2, hh: s.el.offsetHeight / 2 };
        });
        st.forEach(function (s, i) {
          var p = c[i];
          if (mouse) {
            var dx = p.cx + s.x - mouse.x, dy = p.cy + s.y - mouse.y, d = Math.hypot(dx, dy), R = p.hw * 1.6;
            if (d < R && d > 0) { var f = (1 - d / R) * 3.2 * E; s.vx += dx / d * f; s.vy += dy / d * f; s.vr += (Math.random() - .5) * 3 * E; }
          }
          // badge-to-badge bounce (ellipse approx)
          for (var j = i + 1; j < st.length; j++) {
            var t = st[j], q2 = c[j];
            var ddx = (q2.cx + t.x) - (p.cx + s.x), ddy = (q2.cy + t.y) - (p.cy + s.y);
            var ox = p.hw + q2.hw - Math.abs(ddx), oy = p.hh + q2.hh - Math.abs(ddy);
            if (ox > 0 && oy > 0 && (Math.abs(s.x) + Math.abs(t.x) + Math.abs(s.y) + Math.abs(t.y)) > 4) {
              if (ox < oy) { var sx = ox / 2 * Math.sign(ddx || 1); s.x -= sx; t.x += sx; var vx = s.vx; s.vx = t.vx * .85; t.vx = vx * .85; }
              else { var sy = oy / 2 * Math.sign(ddy || 1); s.y -= sy; t.y += sy; var vy = s.vy; s.vy = t.vy * .85; t.vy = vy * .85; }
            }
          }
          s.vx += -s.x * .016; s.vy += -s.y * .016; s.vr += -s.r * .018;
          s.vx *= .94; s.vy *= .94; s.vr *= .93;
          s.x += s.vx; s.y += s.vy; s.r += s.vr;
          var px = p.cx + s.x, py = p.cy + s.y;
          if (px - p.hw < hb.left) { s.x = hb.left + p.hw - p.cx; s.vx = Math.abs(s.vx) * .8; }
          if (px + p.hw > hb.right) { s.x = hb.right - p.hw - p.cx; s.vx = -Math.abs(s.vx) * .8; }
          if (py - p.hh < hb.top) { s.y = hb.top + p.hh - p.cy; s.vy = Math.abs(s.vy) * .8; }
          if (py + p.hh > hb.bottom) { s.y = hb.bottom - p.hh - p.cy; s.vy = -Math.abs(s.vy) * .8; }
          s.el.style.transform = 'translate(' + s.x.toFixed(2) + 'px,' + s.y.toFixed(2) + 'px) rotate(' + s.r.toFixed(2) + 'deg)';
          energy += Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.r);
        });
        if (energy < .6 && !mouse) { st.forEach(function (s) { s.x = s.y = s.r = s.vx = s.vy = s.vr = 0; s.el.style.transform = ''; }); raf = 0; return; }
        raf = requestAnimationFrame(step);
      }
      function start() { if (!raf) raf = requestAnimationFrame(step); }
      var onEnter = function () { kick(); };
      var onMove = function (e) { mouse = { x: e.clientX, y: e.clientY }; start(); };
      var onLeave = function () { mouse = null; };
      box.addEventListener('mouseenter', onEnter);
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
      return function () {
        cancelAnimationFrame(raf);
        box.removeEventListener('mouseenter', onEnter); hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave);
        els.forEach(function (el) { el.style.transform = ''; });
      };
    }

    // ---------- TITLES: a different on-scroll reveal per heading (data-split="…") ----------
    function splits() {
      var pad = function (s) { (s.masks || []).forEach(function (m) { m.style.padding = '0.18em 0.06em 0.22em'; m.style.margin = '-0.18em -0.06em -0.22em'; }); return s; };
      var host = function (el) { return el.closest('[data-split-trigger]') || el; };
      var trig = function (el, start) { return { trigger: el, start: start || 'top 85%', toggleActions: 'play none none reverse' }; };
      var fx = {
        rise: function (el) { var s = pad(Split.create(el, { type: 'chars', mask: 'chars' }));
          gsap.from(s.chars, { yPercent: 115, rotation: 10, transformOrigin: '0% 100%', duration: 1.2, ease: 'expo.out', stagger: .045, scrollTrigger: trig(el) }); },
        scatter: function (el) { var s = Split.create(el, { type: 'chars' });
          gsap.from(s.chars, { x: function () { return gsap.utils.random(-300, 300); }, y: function () { return gsap.utils.random(-200, 200); },
            rotation: function () { return gsap.utils.random(-90, 90); }, scale: .2, autoAlpha: 0, ease: 'power2.out', stagger: { each: .02, from: 'random' },
            scrollTrigger: { trigger: host(el), start: 'top 75%', end: 'top 5%', scrub: 1 } }); },
        flip: function (el) { var s = Split.create(el, { type: 'chars' });
          gsap.set(el, { perspective: 600 });
          gsap.from(s.chars, { rotationY: -100, transformOrigin: '0% 50% -20px', autoAlpha: 0, duration: 1, ease: 'power4.out', stagger: .035, scrollTrigger: trig(el) }); },
        center: function (el) { var s = pad(Split.create(el, { type: 'chars', mask: 'chars' }));
          gsap.from(s.chars, { yPercent: 120, skewY: 12, duration: 1.3, ease: 'expo.out', stagger: { each: .04, from: 'center' }, scrollTrigger: trig(el, 'top 90%') }); },
        blur: function (el) { var s = Split.create(el, { type: 'chars' });
          gsap.from(s.chars, { filter: 'blur(14px)', scaleY: 1.8, yPercent: 30, autoAlpha: 0, transformOrigin: '50% 100%', ease: 'none',
            stagger: { each: .03, from: 'random' }, scrollTrigger: { trigger: host(el), start: 'top 80%', end: 'top 10%', scrub: 1 } }); },
        words: function (el) { Split.create(el, { type: 'words', autoSplit: true, onSplit: function (s) {
          return gsap.fromTo(s.words, { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } }); } }); },
        lines: function (el) { Split.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: function (s) {
          pad(s); return gsap.from(s.lines, { yPercent: 105, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: trig(el, 'top 88%') }); } }); },
        slide: function (el) { Split.create(el, { type: 'lines', autoSplit: true, onSplit: function (s) {
          return gsap.from(s.lines, { xPercent: function (i) { return i % 2 ? 18 : -18; }, autoAlpha: 0, ease: 'none', stagger: .1,
            scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 55%', scrub: 1 } }); } }); },
        // ----- extra variants (client list) -----
        drop: function (el) { var s = pad(Split.create(el, { type: 'chars', mask: 'chars' }));
          gsap.from(s.chars, { yPercent: -120, duration: 1.1, ease: 'back.out(1.6)', stagger: { each: .04, from: 'end' }, scrollTrigger: trig(el, 'top 90%') }); },
        wave: function (el) { var s = Split.create(el, { type: 'chars' });
          gsap.from(s.chars, { y: function (i) { return Math.sin(i * .9) * 60; }, scaleY: 0, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'elastic.out(1,0.55)', stagger: .03, scrollTrigger: trig(el, 'top 90%') }); },
        skew: function (el) { var s = pad(Split.create(el, { type: 'words', mask: 'words' }));
          gsap.from(s.words, { xPercent: -110, skewX: -25, duration: 1.2, ease: 'expo.out', stagger: .12, scrollTrigger: trig(el, 'top 90%') }); },
        scramble: function (el) {
          var txt = el.textContent, pool = el.getAttribute('data-scramble-chars') || '0123456789#%&*';
          var st = { p: 0 };
          gsap.to(st, { p: 1, duration: 1.1, ease: 'power2.out', scrollTrigger: trig(el, 'top 92%'), onStart: function () { el.style.opacity = 1; },
            onUpdate: function () { var n = Math.floor(st.p * txt.length), out = txt.slice(0, n);
              for (var i = n; i < txt.length; i++) out += txt[i] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)]; el.textContent = out; },
            onComplete: function () { el.textContent = txt; } }); },
        count: function (el) {
          var to = parseInt(el.textContent, 10); if (isNaN(to)) return; var from = parseInt(el.getAttribute('data-count-from'), 10) || to - 30, st = { v: from };
          el.textContent = from;
          gsap.to(st, { v: to, duration: 1.6, ease: 'expo.out', scrollTrigger: trig(el, 'top 92%'), onUpdate: function () { el.textContent = Math.round(st.v); } }); },
        wipe: function (el) {
          gsap.fromTo(el, { clipPath: 'inset(-10% 100% -10% 0%)' }, { clipPath: 'inset(-10% 0% -10% 0%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: trig(el, 'top 92%') }); },
        focus: function (el) {
          gsap.from(el, { filter: 'blur(12px)', autoAlpha: 0, letterSpacing: '0.35em', duration: 1.4, ease: 'expo.out', scrollTrigger: trig(el, 'top 92%') }); },
        arrow: function (el) {
          gsap.from(el, { xPercent: -160, autoAlpha: 0, duration: 1.1, ease: 'steps(6)', scrollTrigger: trig(el, 'top 92%') }); }
      };
      if (reduce) return;
      q('[data-split]').forEach(function (el) { var f = fx[el.getAttribute('data-split')]; if (f) f(el); });
      // ultra-smooth row reveal: each row's texts slide up out of a mask, one soft stagger per row
      q('[data-clientlist-item]').forEach(function (row) {
        var els = row.querySelectorAll('[data-reveal]'); if (!els.length) return;
        els.forEach(function (el) {
          var m = document.createElement('span'); m.style.cssText = 'display:block;overflow:hidden;padding:0.12em 0 0.18em;margin:-0.12em 0 -0.18em;';
          var as = el.style.alignSelf; if (as) { m.style.alignSelf = as; el.style.alignSelf = ''; }
          el.parentNode.insertBefore(m, el); m.appendChild(el);
          if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
        });
        gsap.fromTo(els, { yPercent: 110 }, { yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: .07,
          scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: 'play none none reverse' } });
        // arrow hover nudge on the inner svg (anchor transform stays GSAP-only)
        // row hover: title chars roll through, arrow exits right and slides back in from the left
        var ar = row.querySelector('.clientlist_arrow'), svg = ar && ar.querySelector('svg');
        var title = row.querySelector('.clientlist_name'), chars = null;
        if (title && window.SplitText) { var sp = Split.create(title, { type: 'chars', mask: 'chars' }); pad(sp); chars = sp.chars; }
        if (ar) ar.style.overflow = 'hidden';
        var htl = null;
        row.addEventListener('mouseenter', function () {
          if (htl) htl.progress(1).kill();
          htl = gsap.timeline();
          if (chars) htl.to(chars, { yPercent: -110, duration: .35, ease: 'power2.in', stagger: .018 }, 0)
            .set(chars, { yPercent: 110 }, '>')
            .to(chars, { yPercent: 0, duration: .6, ease: 'expo.out', stagger: .018 });
          if (svg) htl.to(svg, { xPercent: 140, duration: .35, ease: 'power2.in' }, 0)
            .set(svg, { xPercent: -140 }, .35)
            .to(svg, { xPercent: 0, duration: .7, ease: 'expo.out' }, .35);
        });
      });
    }

    // ---------- LINK HOVERS: rolling chars (+ optional underline wipe) on [data-link-hover] ----------
    function linkHovers() {
      q('a[data-link-hover]').forEach(function (a) {
        if (a.__dlh) return; a.__dlh = true;
        var text = a.textContent.trim(), mode = a.getAttribute('data-link-hover');
        var orig = a.innerHTML;
        a.setAttribute('aria-label', a.getAttribute('aria-label') || text);
        a.innerHTML = '';
        var wrap = document.createElement('span'); wrap.className = 'link_roll';
        wrap.style.cssText = 'position:relative;display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em;';
        var l1 = document.createElement('span'); l1.className = 'link_roll-top'; l1.textContent = text; l1.style.display = 'block';
        var l2 = document.createElement('span'); l2.className = 'link_roll-bottom'; l2.textContent = text; l2.setAttribute('aria-hidden', 'true');
        l2.style.cssText = 'position:absolute;left:0;top:100%;display:block;';
        wrap.appendChild(l1); wrap.appendChild(l2); a.appendChild(wrap);
        var line = null;
        if (mode === 'underline') {
          line = document.createElement('span'); line.className = 'link_line';
          line.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:2px;background:currentColor;transform-origin:0% 50%;';
          wrap.appendChild(line);
        }
        var s1 = Split.create(l1, { type: 'chars' }), s2 = Split.create(l2, { type: 'chars' });
        gsap.set(s2.chars, { yPercent: 0, rotationX: -90, transformOrigin: '50% 0%' });
        var enter = function () {
          gsap.to(s1.chars, { yPercent: -100, rotationX: 90, transformOrigin: '50% 100%', duration: .55, ease: 'power3.inOut', stagger: { each: .022 }, overwrite: true });
          gsap.to(s2.chars, { yPercent: -100, rotationX: 0, duration: .55, ease: 'power3.inOut', stagger: { each: .022 }, overwrite: true });
          if (line) gsap.timeline({ overwrite: true }).to(line, { scaleX: 0, transformOrigin: '100% 50%', duration: .35, ease: 'power3.in' }).to(line, { scaleX: 1, transformOrigin: '0% 50%', duration: .45, ease: 'power3.out' });
        };
        var leave = function () {
          gsap.to(s1.chars, { yPercent: 0, rotationX: 0, duration: .5, ease: 'power3.out', stagger: { each: .018, from: 'end' }, overwrite: true });
          gsap.to(s2.chars, { yPercent: 0, rotationX: -90, duration: .5, ease: 'power3.out', stagger: { each: .018, from: 'end' }, overwrite: true });
        };
        a.addEventListener('mouseenter', enter); a.addEventListener('mouseleave', leave);
        a.addEventListener('focus', enter); a.addEventListener('blur', leave);
        cleanups.push(function () {
          a.removeEventListener('mouseenter', enter); a.removeEventListener('mouseleave', leave);
          a.removeEventListener('focus', enter); a.removeEventListener('blur', leave);
          a.innerHTML = orig; a.__dlh = false;
        });
      });
    }

    // ---------- generic section reveals (data-reveal) ----------
    function reveals() {
      if (reduce) return;
      q('[data-reveal="up"]').forEach(function (el) {
        gsap.from(el, { y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
      });
      q('[data-reveal="scale"]').forEach(function (el) {
        gsap.fromTo(el, { scale: .72, yPercent: 10 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1 } });
      });
    }
    function lines() {
      q('[data-line]').forEach(function (el) {
        gsap.from(el, { scaleX: 0, transformOrigin: el.getAttribute('data-line') === 'right' ? '100% 50%' : '0% 50%', duration: 1.4, ease: 'expo.inOut',
          scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' } });
      });
    }

    // ---------- SERVICES icon rows: 3 locomotive-style behaviours ----------
    function serviceIcons() {
      q('[data-parallax="inview"]').forEach(function (row) {
        gsap.from(q('[data-parallax-item]', row), { yPercent: 70, scale: .3, rotation: function (i) { return i % 2 ? -35 : 35; }, autoAlpha: 0,
          duration: 1.1, ease: 'back.out(1.8)', stagger: .09, scrollTrigger: { trigger: row, start: 'top 82%', end: 'bottom 10%', toggleActions: 'play reverse play reverse' } });
      });
      q('[data-parallax="progress"]').forEach(function (row) {
        var items = q('[data-parallax-item]', row);
        var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true,
          onUpdate: function (s) { row.style.setProperty('--progress', s.progress.toFixed(3)); } } });
        tl.fromTo(items, { rotation: function (i) { return i % 2 ? -120 : 120; }, y: function (i) { return i % 2 ? 90 : -90; }, x: function (i) { return (i - (items.length - 1) / 2) * 50; } },
          { rotation: function (i) { return i % 2 ? 120 : -120; }, y: function (i) { return i % 2 ? -90 : 90; }, x: function (i) { return (i - (items.length - 1) / 2) * -50; }, ease: 'none' }, 0);
      });
      q('[data-parallax="speed"]').forEach(function (row) {
        q('[data-parallax-item]', row).forEach(function (it) {
          var sp = parseFloat(it.getAttribute('data-speed')) || 0;
          gsap.fromTo(it, { y: function () { return -sp * 220; } }, { y: function () { return sp * 220; }, ease: 'none',
            scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        });
      });
    }

    // ---------- CLIENTS: pinned (CSS sticky) stack → curved carousel ----------
    function clients() {
      if (window.THREE && window.DeesClients3D && !reduce) { var c3 = window.DeesClients3D({ root: root }); if (c3) { cleanups.push(c3); return; } }
      var sec = one('[data-clients]'); var cards = q('[data-client-card]'); if (!sec || !cards.length) return;
      var n = cards.length, mid = (n - 1) / 2;
      var stackRot = cards.map(function () { return 0; });
      var spreadEase = gsap.parseEase('power3.inOut');
      var lastP = 0, lastSpread = 0, drag = { v: 0 }, base = mid;
      var render = function (p) {
        lastP = p;
        var spread = spreadEase(gsap.utils.clamp(0, 1, p / .38));
        lastSpread = spread;
        var t = gsap.utils.clamp(0, 1, (p - .38) / .62);
        base = mid - mid * .45 * spread + t * mid * .9;
        var active = gsap.utils.clamp(-.4, n - .6, base + drag.v * spread);
        cards.forEach(function (c, i) {
          var w = c.offsetWidth, k = i - active, ak = Math.abs(k);
          gsap.set(c, { xPercent: -50, yPercent: -50,
            x: k * w * 1.02 * spread, y: Math.min(k * w * .1, window.innerHeight * .92 - c.parentNode.offsetHeight * .54 - c.offsetHeight * .62) * spread,
            rotation: k * 11 * spread + (1 - spread) * stackRot[i],
            scale: 1 - Math.min(ak, 3) * .035 * spread, zIndex: 100 - Math.round(ak * 10)
          });
          var shade = c.querySelector('[data-client-shade]');
          if (shade) shade.style.opacity = (Math.min(ak * .28, .6) * spread).toFixed(3);
        });
      };
      render(0);
      ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: function (s) { render(s.progress); }, onRefresh: function (s) { render(s.progress); } });
      gsap.from(one('[data-client-list]') || cards, { yPercent: 25, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 20%', scrub: 1 } });

      // drag (mouse / touch) with inertia + snap to nearest card
      var area = one('[data-client-drag]');
      if (area) {
        var down = false, sx = 0, sv = 0, lx = 0, lt = 0, vel = 0;
        var cw = function () { return (cards[0].offsetWidth || 300) * 1.02; };
        var onDown = function (e) { if (lastSpread < .5) return; down = true; sx = lx = e.clientX; lt = performance.now(); sv = drag.v; vel = 0; gsap.killTweensOf(drag); area.style.cursor = 'grabbing'; };
        var onMove = function (e) {
          if (!down) return;
          var now = performance.now(), dt = Math.max(1, now - lt);
          vel = (e.clientX - lx) / dt; lx = e.clientX; lt = now;
          drag.v = sv - (e.clientX - sx) / cw(); render(lastP);
        };
        var onUp = function () {
          if (!down) return; down = false; area.style.cursor = 'grab';
          var projected = drag.v - vel * 280 / cw();
          var target = Math.round(base + projected) - base;
          target = gsap.utils.clamp(-base, n - 1 - base, target);
          gsap.to(drag, { v: target, duration: 1.1, ease: 'expo.out', onUpdate: function () { render(lastP); } });
        };
        area.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        cleanups.push(function () { area.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); });
      }
    }

    function cta() {
      var sec = one('[data-cta]'); if (!sec) return;
      var m = sec.querySelector('[data-cta-model]');
      if (m) gsap.fromTo(m, { yPercent: 18, scale: .82 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: 1 } });
    }

    // ---------- CTA particles (GSAP canvas spiral) ----------
    function particles() {
      var cv = one('[data-particles]'); var srcs = q('[data-particle-src]');
      if (!cv || !srcs.length) return null;
      var c2 = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), cw, ch, radius, base;
      var N = Math.max(10, o.particles | 0);
      var parts = []; for (var i = 0; i < N; i++) parts.push({ x: 0, y: 0, scale: 0, rotate: 0, img: srcs[i % srcs.length] });
      function size() { var r = cv.getBoundingClientRect(); cw = r.width; ch = r.height; cv.width = cw * dpr; cv.height = ch * dpr; radius = Math.max(cw, ch); base = Math.max(60, cw * .085); }
      size();
      function draw() {
        var list = parts.slice().sort(function (a, b) { return a.scale - b.scale; });
        c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, cv.width, cv.height);
        list.forEach(function (p) {
          var im = p.img; if (!im.complete || !im.naturalWidth) return;
          var w = base * p.scale, h = w * im.naturalHeight / im.naturalWidth;
          c2.setTransform(dpr, 0, 0, dpr, cw / 2 * dpr, ch / 2 * dpr); c2.rotate(p.rotate);
          c2.drawImage(im, p.x, p.y, w, h);
        });
      }
      var ang = function (i) { return (i / N * Math.PI * 2) - Math.PI / 2; };
      var tl = gsap.timeline({ onUpdate: draw, paused: true })
        .fromTo(parts, { x: function (i) { return Math.cos(ang(i) * 10) * radius; }, y: function (i) { return Math.sin(ang(i) * 10) * radius; }, scale: 1.1, rotate: 0 },
          { duration: 5, ease: 'sine', x: 0, y: 0, scale: 0, rotate: -3, stagger: { each: -.05, repeat: -1 } }, 0).seek(99);
      tl.timeScale(parseFloat(cv.getAttribute('data-particle-speed')) || .6); // 1 = original speed
      var stt = ST.create({ trigger: cv, start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? tl.play() : tl.pause(); } });
      var onR = function () { size(); tl.invalidate(); draw(); };
      window.addEventListener('resize', onR);
      draw();
      return function () { window.removeEventListener('resize', onR); tl.kill(); stt.kill(); };
    }

    // ---------- CTA → footer: curve morph on scroll ----------
    function footerCurve() {
      var path = one('[data-curve-path]'); var footer = one('[data-footer]'); if (!path || !footer) return;
      // edge of the footer bends with scroll velocity, then springs back flat (elastic)
      var st = { h: 0 };
      var setD = function () {
        var h = gsap.utils.clamp(0, 190, st.h), y = (150 - h) / .75;
        path.setAttribute('d', 'M0,200 C250,' + y.toFixed(1) + ' 750,' + y.toFixed(1) + ' 1000,200 Z');
      };
      setD();
      var settle = gsap.delayedCall(.12, function () { gsap.to(st, { h: 0, duration: 1.6, ease: 'elastic.out(1,0.28)', onUpdate: setD, overwrite: true }); }).pause();
      ST.create({ trigger: footer, start: 'top bottom', end: 'top top', onUpdate: function (s) {
        var target = Math.min(190, Math.abs(s.getVelocity()) / 14);
        if (target > st.h) gsap.to(st, { h: target, duration: .35, ease: 'power2.out', onUpdate: setD, overwrite: true });
        settle.restart(true);
      } });
    }

    // ---------- CUSTOM CURSOR: dot + lagging ring, velocity stretch, contextual states ----------
    // [data-cursor="grow"] enlarges the ring, [data-cursor-text="Drag"] shows a label, [data-cursor-color] recolors it.
    function cursor() {
      var c = one('.cursor_component') || (one('[data-cursor-ring]') || {}).parentNode;
      if (!c || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) { if (c) c.style.display = 'none'; return null; }
      var dot = c.querySelector('[data-cursor-dot]'), ring = c.querySelector('[data-cursor-ring]'), label = c.querySelector('[data-cursor-label]');
      document.documentElement.classList.add('has-cursor');
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      var dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
      var rx = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });
      var pos = { x: -100, y: -100 }, last = { x: -100, y: -100 }, shown = false, state = '', color = '';
      var baseColor = c.getAttribute('data-cursor-color') || '#ffffff';
      var onMove = function (e) {
        pos.x = e.clientX; pos.y = e.clientY;
        if (!shown) { shown = true; gsap.set([dot, ring], { x: pos.x, y: pos.y }); gsap.to(c, { autoAlpha: 1, duration: .3 }); }
        dx(pos.x); dy(pos.y); rx(pos.x); ry(pos.y);
        var t = e.target && e.target.closest ? e.target : null; if (!t) return;
        var txtEl = t.closest('[data-cursor-text]'), growEl = t.closest('a, button, [data-cursor="grow"], input, label');
        var colEl = t.closest('[data-cursor-color]:not([data-cursor])');
        var next = txtEl ? 'text:' + txtEl.getAttribute('data-cursor-text') : growEl ? 'grow' : '';
        var nc = colEl ? colEl.getAttribute('data-cursor-color') : baseColor;
        if (nc !== color) { color = nc; gsap.to(dot, { backgroundColor: nc, duration: .3 }); gsap.to(ring, { borderColor: nc, color: nc, duration: .3 }); gsap.to(label, { color: nc === '#ffffff' ? '#ff003d' : '#ffffff', duration: .3 }); }
        if (next === state) return; state = next;
        if (next.indexOf('text:') === 0) {
          label.textContent = next.slice(5);
          gsap.to(ring, { width: 96, height: 96, backgroundColor: color, duration: .5, ease: 'expo.out' });
          gsap.to(label, { autoAlpha: 1, scale: 1, duration: .4, ease: 'expo.out', delay: .05 });
          gsap.to(dot, { scale: 0, duration: .3 });
        } else if (next === 'grow') {
          gsap.to(ring, { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0)', duration: .5, ease: 'expo.out' });
          gsap.to(label, { autoAlpha: 0, scale: .6, duration: .2 });
          gsap.to(dot, { scale: 1.6, duration: .3 });
        } else {
          gsap.to(ring, { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0)', duration: .5, ease: 'expo.out' });
          gsap.to(label, { autoAlpha: 0, scale: .6, duration: .2 });
          gsap.to(dot, { scale: 1, duration: .3 });
        }
      };
      // stretch the ring along the movement direction
      var stretch = function () {
        var vx = pos.x - last.x, vy = pos.y - last.y; last.x = pos.x; last.y = pos.y;
        var sp = Math.min(Math.hypot(vx, vy), 60), ang = Math.atan2(vy, vx) * 180 / Math.PI;
        if (state.indexOf('text:') === 0) sp = 0;
        gsap.to(ring, { rotation: sp > 1 ? ang : '+=0', scaleX: 1 + sp / 120, scaleY: 1 - sp / 260, duration: .25, overwrite: 'auto' });
      };
      gsap.ticker.add(stretch);
      var onDown = function () { gsap.to(ring, { scale: .8, duration: .2 }); gsap.to(dot, { scale: .6, duration: .2 }); };
      var onUp = function () { gsap.to(ring, { scale: 1, duration: .5, ease: 'elastic.out(1,0.4)' }); gsap.to(dot, { scale: state === 'grow' ? 1.6 : state ? 0 : 1, duration: .3 }); };
      var onLeaveDoc = function () { shown = false; gsap.to(c, { autoAlpha: 0, duration: .3 }); };
      window.addEventListener('pointermove', onMove); window.addEventListener('pointerdown', onDown); window.addEventListener('pointerup', onUp);
      document.addEventListener('mouseleave', onLeaveDoc);
      return function () {
        gsap.ticker.remove(stretch); document.documentElement.classList.remove('has-cursor');
        window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp);
        document.removeEventListener('mouseleave', onLeaveDoc);
      };
    }

    // ---------- footer live clock ----------
    function clock() {
      var els = q('[data-clock]'); if (!els.length) return null;
      var tick = function () {
        els.forEach(function (el) {
          try { el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: el.getAttribute('data-timezone') || 'Europe/Amsterdam' }); } catch (e) {}
        });
      };
      tick(); var t = setInterval(tick, 10000);
      return function () { clearInterval(t); };
    }

    var refresh = function () { ST.refresh(); };
    window.addEventListener('load', refresh);
    var rt = setTimeout(refresh, 700);
    cleanups.push(function () { window.removeEventListener('load', refresh); clearTimeout(rt); });

    var api = { lenis: lenis, destroy: function () { ctx.revert(); cleanups.forEach(function (f) { f && f(); }); root.__dees = null; } };
    root.__dees = api;
    return api;
  };

  window.DeesSite = DeesSite;

  // Webflow / plain-HTML auto init
  function auto() {
    var root = document.querySelector('[data-dees-root]');
    if (root && root.getAttribute('data-dees-autoinit') !== 'false' && window.gsap && window.ScrollTrigger && window.SplitText) DeesSite.init(root);
  }
  if (document.readyState === 'complete') auto(); else window.addEventListener('load', auto);
})();
