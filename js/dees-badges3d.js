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
