/*!
 * Dees — clients: cinematic 3D cylinder (port of Codrops "Cinematic 3D Scroll", demo 1, to three.js)
 * One open cylinder wrapped with an image atlas built from the HTML cards ([data-client-card] img/number/name),
 * a scroll-scrubbed camera path that ends INSIDE the cylinder, and arc "particles" that appear with rotation speed.
 * Optional overlay copy: any [data-perspective] element inside the section fades in/out per scroll segment.
 */
(function () {
  window.DeesClients3D = function (env) {
    var T = window.THREE, gsap = window.gsap, ST = window.ScrollTrigger;
    var sec = env.root.querySelector('[data-clients]');
    if (!T || !sec) return null;
    var sticky = sec.querySelector('.clients_sticky') || sec;
    var list = sec.querySelector('[data-client-list]');
    var cards = Array.prototype.slice.call(sec.querySelectorAll('[data-client-card]'));
    if (!cards.length) return null;
    var N = cards.length;
    var cust = function (p) { return 'cubic-bezier(' + p + ')'; };
    // CustomEase-equivalents from the demo (cubic beziers), via gsap.parseEase fallback
    var bez = function (x1, y1, x2, y2) {
      return function (t) {
        var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
        var x = t; for (var i = 0; i < 6; i++) { var fx = ((ax * x + bx) * x + cx) * x - t, d = (3 * ax * x + 2 * bx) * x + cx; if (Math.abs(d) < 1e-6) break; x -= fx / d; }
        return ((ay * x + by) * x + cy) * x;
      };
    };
    var E = { silk: bez(.45, .05, .55, .95), smooth: bez(.25, .1, .25, 1), flow: bez(.33, 0, .2, 1), linear: bez(.4, 0, .6, 1) };

    var canvas = document.createElement('canvas');
    canvas.className = 'clients_canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1;cursor:grab;touch-action:pan-y;';
    sticky.insertBefore(canvas, sticky.firstChild);
    if (list) list.style.visibility = 'hidden';

    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding;
    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(45, 1, .01, 100);

    function dims() {
      var w = window.innerWidth, m = w < 768, tab = w >= 768 && w < 1024;
      return { radius: m ? 1.8 : tab ? 2.2 : 2.5, height: m ? 1.2 : 2, camZ: m ? 6 : tab ? 7 : 8, fov: m ? 50 : 45 };
    }
    var D = dims();

    // ---- cylinder geometry (same construction as the demo) ----
    function cylGeo(radius, height, seg) {
      var pos = [], uv = [], idx = [];
      for (var y = 0; y <= 1; y++) for (var x = 0; x <= seg; x++) {
        var u = x / seg, th = u * Math.PI * 2;
        pos.push(Math.cos(th) * radius, (y - .5) * height, Math.sin(th) * radius); uv.push(u, y);
      }
      for (var x2 = 0; x2 < seg; x2++) { var a = x2, b = a + seg + 1, c = a + 1, d = b + 1; idx.push(a, b, c, b, d, c); }
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); return g;
    }

    // ---- image atlas from the HTML cards ----
    var atlas = document.createElement('canvas'), SEG = 1024;
    var maxW = Math.min(renderer.capabilities.maxTextureSize, window.innerWidth < 768 ? 2048 : 8192);
    var sc = Math.min(1, maxW / (SEG * N));
    atlas.width = Math.floor(SEG * N * sc); atlas.height = Math.floor(SEG * sc);
    var actx = atlas.getContext('2d', { alpha: false });
    var tex = new T.CanvasTexture(atlas); tex.encoding = T.sRGBEncoding; tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping; tex.generateMipmaps = false; tex.minFilter = T.LinearFilter;
    function drawAtlas() {
      var Wt = atlas.width, Ht = atlas.height, ff = getComputedStyle(sec).fontFamily;
      actx.fillStyle = '#111'; actx.fillRect(0, 0, Wt, Ht);
      cards.forEach(function (card, i) {
        var x0 = Math.floor(i / N * Wt), x1 = Math.floor((i + 1) / N * Wt), w = x1 - x0;
        var img = card.querySelector('img');
        if (img && img.complete && img.naturalWidth) {
          var ir = img.naturalWidth / img.naturalHeight, cr = w / Ht, sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
          if (ir > cr) { sw = img.naturalHeight * cr; sx = (img.naturalWidth - sw) / 2; } else { sh = img.naturalWidth / cr; sy = (img.naturalHeight - sh) / 2; }
          actx.drawImage(img, sx, sy, sw, sh, x0, 0, w, Ht);
        }
        var num = card.querySelector('.clients_card-number'), name = card.querySelector('.clients_card-name'), s = Ht / 1024;
        actx.fillStyle = '#ffffff'; actx.textBaseline = 'top';
        if (num) { actx.font = '700 ' + Math.round(110 * s) + 'px ' + ff; actx.fillText(num.textContent.trim(), x0 + 48 * s, 44 * s); }
        if (name) { actx.textBaseline = 'alphabetic'; actx.font = '700 ' + Math.round(56 * s) + 'px ' + ff; actx.fillText(name.textContent.trim(), x0 + 50 * s, Ht - 54 * s); }
      });
      tex.needsUpdate = true;
    }
    drawAtlas();
    cards.forEach(function (c) { var im = c.querySelector('img'); if (im && !im.complete) im.addEventListener('load', drawAtlas, { once: true }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAtlas);

    var mat = new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide, color: new T.Color(.7, .7, .7) }); // uDarkness 0.3
    var cylinder = new T.Mesh(cylGeo(2.5, 2, 64), mat);
    cylinder.rotation.y = .5;
    scene.add(cylinder);

    // ---- soft drop shadow under/behind the cylinder (matches the site's -x / +y shadow direction) ----
    var shC = document.createElement('canvas'); shC.width = shC.height = 256;
    var shG = shC.getContext('2d'), shR = shG.createRadialGradient(128, 128, 0, 128, 128, 128);
    shR.addColorStop(0, 'rgba(0,0,0,0.55)'); shR.addColorStop(.45, 'rgba(0,0,0,0.32)'); shR.addColorStop(1, 'rgba(0,0,0,0)');
    shG.fillStyle = shR; shG.fillRect(0, 0, 256, 256);
    var shTex = new T.CanvasTexture(shC);
    var shMat = new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: parseFloat(sec.getAttribute('data-shadow-opacity')) || .6 });
    var shadow = new T.Mesh(new T.PlaneGeometry(1, 1), shMat);
    shadow.rotation.x = -Math.PI / 2; shadow.scale.set(8.2, 8.2, 1); shadow.position.set(-.45, -1.32, .35);
    shadow.renderOrder = -1;
    scene.add(shadow);

    // ---- arc particles (12 line strips above/below, visible only while rotating) ----
    var PN = 12, PR = 3.3, PS = 20, SPAN = .3, parts = [];
    for (var i = 0; i < PN; i++) {
      var startA = i / PN * Math.PI * 2, top = i < PN / 2;
      var y = top ? 2 * .7 + Math.random() * 2 * .3 : -2 + Math.random() * 2 * .3;
      var arr = new Float32Array((PS + 1) * 3);
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(arr, 3));
      var lm = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: true });
      var line = new T.Line(g, lm); scene.add(line);
      parts.push({ line: line, arr: arr, base: startA, y: y, speed: .5 + Math.random() });
    }
    function layoutParticle(p) {
      for (var j = 0; j <= PS; j++) { var a = p.base + SPAN * j / PS; p.arr[j * 3] = Math.cos(a) * PR; p.arr[j * 3 + 1] = p.y; p.arr[j * 3 + 2] = Math.sin(a) * PR; }
      p.line.geometry.attributes.position.needsUpdate = true;
    }
    parts.forEach(layoutParticle);

    function applyDims() {
      D = dims();
      var w = sticky.clientWidth, h = sticky.clientHeight;
      renderer.setSize(w, h, false);
      cam.fov = D.fov; cam.aspect = w / h; cam.updateProjectionMatrix();
      var s = D.radius / 2.5;
      var sy = window.innerWidth < 768 ? s * (D.height / 2) : s;
      cylinder.scale.set(s, sy, s);
      if (typeof shadow !== 'undefined') { shadow.scale.set(8.2 * s, 8.2 * s, 1); shadow.position.y = -1.32 * sy; }
    }
    applyDims();

    // ---- scroll timeline (exact camera path from the demo) ----
    var camA = { x: 0, y: 0, z: D.camZ };
    var rot = { y: .5 };
    var tl = gsap.timeline({ paused: true });
    tl.to(camA, { x: 0, y: 0, z: D.camZ, duration: 1, ease: E.silk })
      .to(camA, { x: 0, y: 5, z: 5, duration: 1, ease: E.flow })
      .to(camA, { x: 1.5, y: 2, z: 2, duration: 2, ease: E.linear })
      .to(camA, { x: .5, y: 0, z: .8, duration: 3.5, ease: 'power1.inOut' })
      .to(camA, { x: -6, y: -1, z: D.camZ, duration: 1, ease: E.smooth });
    tl.to(rot, { y: '+=28.27', duration: 8.5, ease: 'none' }, 0);
    var st = ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', animation: tl, scrub: 1 });

    // ---- overlay copy per segment ----
    var persp = Array.prototype.slice.call(sec.querySelectorAll('[data-perspective]'));
    var ptl = persp.map(function (el, k) {
      var seg = 100 / persp.length, first = k === 0;
      var t = gsap.timeline({ scrollTrigger: { trigger: sec, start: (k * seg) + '% top', end: ((k + 1) * seg) + '% top', scrub: .8 } });
      if (!first) t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .2, ease: E.smooth });
      t.to(el, { opacity: 1, duration: first ? .8 : .6, ease: 'none' }).to(el, { opacity: 0, duration: .2, ease: E.smooth });
      return t;
    });

    // ---- drag adds rotation (with inertia) ----
    var drag = { v: 0 }, down = false, sx = 0, sv = 0, lx = 0, lt = 0, vel = 0;
    var toAng = function (px) { return px / (canvas.clientWidth || 1) * Math.PI * 1.5; };
    var onDown = function (e) { down = true; sx = lx = e.clientX; lt = performance.now(); sv = drag.v; vel = 0; gsap.killTweensOf(drag); canvas.style.cursor = 'grabbing'; };
    var onMove = function (e) { if (!down) return; var now = performance.now(); vel = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now; drag.v = sv + toAng(e.clientX - sx); };
    var onUp = function () { if (!down) return; down = false; canvas.style.cursor = 'grab'; gsap.to(drag, { v: drag.v + toAng(vel * 300), duration: 1.6, ease: 'expo.out' }); };
    canvas.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);

    var lastW = window.innerWidth, onResize = function () {
      if (window.innerWidth < 768 && window.innerWidth === lastW) return; lastW = window.innerWidth; applyDims();
    };
    window.addEventListener('resize', onResize);

    var active = false, raf = 0, lastRot = cylinder.rotation.y;
    var vis = ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (s) { active = s.isActive; } });
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!active) return;
      cam.position.set(camA.x, camA.y, camA.z); cam.lookAt(0, 0, 0);
      cylinder.rotation.y = rot.y + drag.v;
      var v = cylinder.rotation.y - lastRot; lastRot = cylinder.rotation.y;
      var speed = Math.abs(v) * 100, rotating = Math.abs(v) > .0001;
      parts.forEach(function (p) {
        var target = rotating ? Math.min(speed * 3, .95) : 0;
        p.line.material.opacity += (target - p.line.material.opacity) * .15;
        if (rotating) { p.base += v * p.speed * 1.5; layoutParticle(p); }
      });
      renderer.render(scene, cam);
    }
    tick();

    return function () {
      cancelAnimationFrame(raf); st.kill(); vis.kill(); tl.kill(); ptl.forEach(function (t) { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
      persp.forEach(function (el) { el.style.opacity = ''; });
      canvas.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      parts.forEach(function (p) { p.line.geometry.dispose(); p.line.material.dispose(); });
      cylinder.geometry.dispose(); mat.dispose(); shadow.geometry.dispose(); shMat.dispose(); shTex.dispose(); tex.dispose(); renderer.dispose(); canvas.remove();
      if (list) list.style.visibility = '';
    };
  };
})();
