/*! Dees — single bundle for Webflow. Loads GSAP/Lenis/three from CDN, then runs site code. */
(function () {
  var s = document.currentScript;
  var BASE = (s && s.src) ? s.src.replace(/[^\/?#]*([?#].*)?$/, '').replace(/js\/$/, '') : '';
  var libs = [
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js',
    'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js'
  ];
  function run() {
    
    /* ===== dees-badges3d.js ===== */
    /*!
     * Dees — hero badges in three.js (soft 3D pills: push + tilt on hover, collide, spring home)
     * Requires three.js (global THREE, e.g. three@0.149.0/build/three.min.js) + GSAP. Called from dees-site.js.
     * The HTML badges ([data-badge]) stay the source of truth: text, font, colors and positions are read from them.
     */
    (function () {
      window.DeesBadges3D = function (env) {
        var T = window.THREE, gsap = window.gsap, ST = window.ScrollTrigger;
        var hero = env.root.querySelector('[data-hero]');
        var els = Array.prototype.slice.call(env.root.querySelectorAll('[data-badge]'));
        if (!T || !hero || !els.length || env.reduce) return null;
        var E = env.energy || 1;
        var canvas = document.createElement('canvas');
        canvas.className = 'hero_badges-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;';
        hero.appendChild(canvas);
        var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.outputEncoding = T.sRGBEncoding;
        var scene = new T.Scene();
        var cam = new T.OrthographicCamera(-1, 1, 1, -1, -2000, 2000); cam.position.z = 1000;
        scene.add(new T.AmbientLight(0xffffff, .7));
        var dl = new T.DirectionalLight(0xffffff, .9); dl.position.set(-300, 500, 600); scene.add(dl);
        var sideMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: .35, metalness: 0 });
        var W = 1, H = 1, pills = [];

        function pillShape(w, h) {
          var r = h / 2, s = new T.Shape(), x = -w / 2, y = -h / 2;
          s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
          s.lineTo(x + r, y + h); s.absarc(x + r, 0, r, Math.PI / 2, Math.PI * 1.5, false); return s;
        }
        function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
        function faceTexture(el, w, h) {
          var cs = getComputedStyle(el), dpr = 3, c = document.createElement('canvas');
          c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
          var g = c.getContext('2d'); g.scale(dpr, dpr);
          var bw = parseFloat(cs.borderTopWidth) || 2, bg = el.getAttribute('data-badge-bg');
          if (!bg) { var node = el; while (node && node !== document.documentElement) { var c2 = getComputedStyle(node).backgroundColor; if (c2 && c2 !== 'rgba(0, 0, 0, 0)' && c2 !== 'transparent') { bg = c2; break; } node = node.parentElement; } }
          g.fillStyle = (!bg || bg === 'rgba(0, 0, 0, 0)') ? '#ff003d' : bg;
          rr(g, 0, 0, w, h, h / 2); g.fill();
          g.strokeStyle = cs.borderTopColor || '#ffffff'; g.lineWidth = bw;
          rr(g, bw / 2, bw / 2, w - bw, h - bw, (h - bw) / 2); g.stroke();
          g.fillStyle = cs.color; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
          g.fillText(el.textContent.trim(), w / 2, h / 2 + 1);
          var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
        }
        function build() {
          pills.forEach(function (p) { scene.remove(p.mesh); p.mesh.geometry.dispose(); p.face.map.dispose(); p.face.dispose(); });
          var hb = hero.getBoundingClientRect(); W = hb.width; H = hb.height;
          renderer.setSize(W, H, false);
          cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2; cam.updateProjectionMatrix();
          var old = pills; pills = [];
          els.forEach(function (el, i) {
            el.style.visibility = '';
            var r = el.getBoundingClientRect(), w = r.width, h = r.height, depth = h * .32;
            var geo = new T.ExtrudeGeometry(pillShape(w, h), { depth: depth, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.5, bevelSegments: 4, curveSegments: 24 });
            geo.translate(0, 0, -depth / 2);
            var uv = geo.attributes.uv, pos = geo.attributes.position;
            for (var k = 0; k < uv.count; k++) uv.setXY(k, pos.getX(k) / w + .5, pos.getY(k) / h + .5);
            var face = new T.MeshBasicMaterial({ map: faceTexture(el, w, h) });
            var mesh = new T.Mesh(geo, [face, sideMat]);
            scene.add(mesh);
            var hx = r.left - hb.left + w / 2 - W / 2, hy = H / 2 - (r.top - hb.top + h / 2);
            var p = old[i] ? Object.assign(old[i], { mesh: mesh, face: face, hx: hx, hy: hy, w: w, h: h }) :
              { mesh: mesh, face: face, hx: hx, hy: hy, w: w, h: h, x: hx, y: hy - 180, z: 0, vx: 0, vy: 0, vz: 0,
                rx: 0, ry: 0, rz: gsap.utils.random(-.5, .5), vrx: 0, vry: 0, vrz: 0, hold: true };
            pills.push(p);
          });
          els.forEach(function (el) { el.style.visibility = 'hidden'; });
        }
        build();
        (env.ready || Promise.resolve()).then(function () {
          var order = pills.map(function (p, i) { return i; }).sort(function (a, b) { return Math.abs(a - (pills.length - 1) / 2) - Math.abs(b - (pills.length - 1) / 2); });
          order.forEach(function (idx, k) { gsap.delayedCall(1.0 + k * .09, function () { var p = pills[idx]; p.hold = false; p.vy += 4; }); });
        });

        var ray = new T.Raycaster(), ndc = new T.Vector2(), last = null, t0 = performance.now();
        var onMove = function (e) {
          var hb = hero.getBoundingClientRect(), mx = e.clientX - hb.left, my = e.clientY - hb.top;
          var dvx = last ? mx - last.x : 0, dvy = last ? my - last.y : 0; last = { x: mx, y: my };
          ndc.set(mx / W * 2 - 1, -(my / H) * 2 + 1); ray.setFromCamera(ndc, cam);
          var hits = ray.intersectObjects(pills.map(function (p) { return p.mesh; }));
          if (!hits.length) return;
          var p = pills.find(function (pp) { return pp.mesh === hits[0].object; }); if (!p || p.hold) return;
          var lx = hits[0].point.x - p.x, ly = hits[0].point.y - p.y;
          var sp = Math.min(30, Math.hypot(dvx, dvy)), f = (.5 + sp * .08) * E;
          var dx = dvx || -lx, dy = -dvy || -ly, d = Math.hypot(dx, dy) || 1;
          p.vx += dx / d * f; p.vy += dy / d * f; p.vz -= f * 1.4;
          p.vry += (lx / p.w) * .045 * E; p.vrx -= (ly / p.h) * .035 * E; p.vrz += (-dx / d) * .005 * E * (1 + sp * .05);
        };
        var onLeave = function () { last = null; };
        hero.addEventListener('pointermove', onMove); hero.addEventListener('pointerleave', onLeave);

        var active = true, raf = 0;
        function tick() {
          raf = requestAnimationFrame(tick);
          if (!active) return;
          var t = (performance.now() - t0) * .0016;
          pills.forEach(function (p, i) {
            p.mesh.visible = !p.hold; if (p.hold) return;
            var by = Math.sin(t + i * .9) * 2.2;
            p.vx += (p.hx - p.x) * .022; p.vy += (p.hy + by - p.y) * .022; p.vz += -p.z * .03;
            p.vrx += (Math.sin(t * .7 + i) * .05 - p.rx) * .03; p.vry += (Math.cos(t * .8 + i) * .04 - p.ry) * .03; p.vrz += -p.rz * .028;
            p.vx *= .88; p.vy *= .88; p.vz *= .88; p.vrx *= .9; p.vry *= .9; p.vrz *= .9;
            p.x += p.vx; p.y += p.vy; p.z += p.vz; p.rx += p.vrx; p.ry += p.vry; p.rz += p.vrz;
          });
          for (var a = 0; a < pills.length; a++) for (var b = a + 1; b < pills.length; b++) {
            var A = pills[a], B = pills[b]; if (A.hold || B.hold) continue;
            var dx = B.x - A.x, dy = B.y - A.y, ox = (A.w + B.w) / 2 + 4 - Math.abs(dx), oy = (A.h + B.h) / 2 + 4 - Math.abs(dy);
            if (ox > 0 && oy > 0) {
              if (ox < oy) { var sx = ox * .25 * Math.sign(dx || 1); A.x -= sx; B.x += sx; A.vx -= sx * .2; B.vx += sx * .2; A.vrz += sx * .0015; B.vrz -= sx * .0015; }
              else { var sy = oy * .25 * Math.sign(dy || 1); A.y -= sy; B.y += sy; A.vy -= sy * .2; B.vy += sy * .2; }
            }
          }
          pills.forEach(function (p) { p.mesh.position.set(p.x, p.y, p.z); p.mesh.rotation.set(p.rx, p.ry, p.rz); });
          renderer.render(scene, cam);
        }
        tick();
        var vis = ST.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: function (s) { active = s.isActive; } });
        var rz = null, onResize = function () { clearTimeout(rz); rz = setTimeout(build, 150); };
        window.addEventListener('resize', onResize);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (canvas.isConnected) build(); });
        return function () {
          cancelAnimationFrame(raf); vis.kill(); clearTimeout(rz); window.removeEventListener('resize', onResize);
          hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave);
          pills.forEach(function (p) { p.mesh.geometry.dispose(); p.face.map.dispose(); p.face.dispose(); });
          sideMat.dispose(); renderer.dispose(); canvas.remove();
          els.forEach(function (el) { el.style.visibility = ''; });
        };
      };
    })();


    /* ===== dees-clients3d.js ===== */
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
        // Webflow serves images from its CDN (cross-origin): draw a CORS-enabled copy so the WebGL texture isn't tainted.
        var corsCache = new Map();
        function corsImg(im) {
          if (!im) return null;
          var src = im.currentSrc || im.src; if (!src) return null;
          if (im.crossOrigin || new URL(src, location.href).origin === location.origin) return im;
          var c = corsCache.get(src);
          if (!c) { c = new Image(); c.crossOrigin = 'anonymous'; c.decoding = 'async'; c.onload = function () { drawAtlas(); }; c.src = src; corsCache.set(src, c); }
          return c;
        }
        function drawAtlas() {
          var Wt = atlas.width, Ht = atlas.height, ff = getComputedStyle(sec).fontFamily;
          actx.fillStyle = '#111'; actx.fillRect(0, 0, Wt, Ht);
          var solid = function (v) { return v && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent' ? v : null; };
          cards.forEach(function (card, i) {
            var x0 = Math.floor(i / N * Wt), x1 = Math.floor((i + 1) / N * Wt), w = x1 - x0;
            var bg = solid(getComputedStyle(card).backgroundColor); if (bg) { actx.fillStyle = bg; actx.fillRect(x0, 0, w, Ht); }
            var img = corsImg(card.querySelector('img'));
            if (img && img.complete && img.naturalWidth) {
              var ir = img.naturalWidth / img.naturalHeight, cr = w / Ht, sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
              if (ir > cr) { sw = img.naturalHeight * cr; sx = (img.naturalWidth - sw) / 2; } else { sh = img.naturalWidth / cr; sy = (img.naturalHeight - sh) / 2; }
              actx.drawImage(img, sx, sy, sw, sh, x0, 0, w, Ht);
            }
            var num = card.querySelector('.clients_card-number'), name = card.querySelector('.clients_card-name'), s = Ht / 1024;
            actx.textBaseline = 'top';
            if (num) { var ns = getComputedStyle(num); actx.fillStyle = ns.color || '#ffffff'; actx.font = (ns.fontWeight || 700) + ' ' + Math.round(110 * s) + 'px ' + (ns.fontFamily || ff); actx.fillText(num.textContent.trim(), x0 + 48 * s, 44 * s); }
            if (name) { var nm = getComputedStyle(name); actx.fillStyle = nm.color || '#ffffff'; actx.textBaseline = 'alphabetic'; actx.font = (nm.fontWeight || 700) + ' ' + Math.round(56 * s) + 'px ' + (nm.fontFamily || ff); actx.fillText(name.textContent.trim(), x0 + 50 * s, Ht - 54 * s); }
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


    /* ===== dees-site.js ===== */
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
          splits(); reveals(); lines(); linkHovers(); serviceIcons(); clients(); cta(); footerCurve(); stack();
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
          var cv = one('[data-particles]'); var srcs = q('[data-particle-src]'); if (!srcs.length) srcs = q('[data-particle-list] img'); srcs.forEach(function (im) { if (im.loading === 'lazy') im.loading = 'eager'; }); // lazy imgs inside display:none never load
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

        // ---------- STACKED SECTIONS ----------
        // Add data-stack to a section: it pins and the next section slides over it.
        // Sections taller than the screen pin when their bottom reaches the screen bottom.
        // Optional: data-stack-dim="0.2" (darken while covered) · data-stack-scale="0.96" (shrink while covered)
        // Every section needs a background color in Webflow.
        function stack() {
          if (reduce) return;
          var secs = q('[data-stack]'); if (!secs.length) return;
          var parent = secs[0].parentElement, kids = Array.prototype.slice.call(parent.children), z = 1;
          kids.forEach(function (el) { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; if (!el.style.zIndex) el.style.zIndex = String(z++); });
          secs.forEach(function (sec) {
            var next = sec.nextElementSibling; if (!next) return;
            ST.create({ trigger: sec, start: function () { return sec.offsetHeight <= window.innerHeight ? 'top top' : 'bottom bottom'; },
              endTrigger: next, end: 'top top', pin: true, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true });
            var sc = parseFloat(sec.getAttribute('data-stack-scale')); if (isNaN(sc)) sc = 1;
            var dim = parseFloat(sec.getAttribute('data-stack-dim')); if (isNaN(dim)) dim = 0;
            if (sc >= 1 && dim <= 0) return;
            var veil = null;
            if (dim > 0) { veil = document.createElement('div'); veil.setAttribute('aria-hidden', 'true');
              veil.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:9999;'; sec.appendChild(veil); }
            var tl = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } });
            if (sc < 1) tl.fromTo(sec, { scale: 1 }, { scale: sc, transformOrigin: '50% 0%', ease: 'none' }, 0);
            if (veil) tl.fromTo(veil, { opacity: 0 }, { opacity: dim, ease: 'none' }, 0);
          });
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
            if (nc !== color) { color = nc; gsap.to(dot, { backgroundColor: nc, duration: .3 }); gsap.to(ring, { borderColor: nc, color: nc, duration: .3 }); gsap.to(label, { color: c.getAttribute('data-cursor-label-color') || getComputedStyle(document.body).backgroundColor || '#ff003d', duration: .3 }); }
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


    var root = document.querySelector('[data-dees-root]');
    if (window.DeesSite && root && !root.__deesInit) { root.__deesInit = true; window.DeesSite.init(root); }
    var m = document.createElement('script'); m.type = 'module'; m.src = BASE + 'js/dees-character.js'; document.body.appendChild(m);
  }
  function load(i) {
    if (i >= libs.length) return run();
    var el = document.createElement('script'); el.src = libs[i]; el.async = false;
    el.onload = function () { load(i + 1); };
    el.onerror = function () { console.warn('[dees] failed to load', libs[i]); load(i + 1); };
    document.head.appendChild(el);
  }
  load(0);
})();
