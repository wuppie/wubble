/* Wubble glass logo: a 3D model (e.g. models/webflow.glb) in the shared see-through glass (wb-glass.js, load that first).
   It turns slowly, tilts toward the mouse and drifts down a little on scroll.
   Webflow: an empty div [data-wb-glasslogo] filling the hero (position:absolute; inset:0).
   Attributes: data-model="models/webflow.glb" · data-size="1" (share of the view height) · data-spin="0.25" · data-mouse="1" · data-rot="90,0,0" (degrees) · data-bolts="1" (lightning between the facing tips on hover)
   · all wb-glass options (data-ior, data-thickness, data-glass-word, ...) */
(() => {
  const A = () => window.WB_ASSETS || './', B = 'https://esm.sh/three@0.186.1' /* one three.js version site-wide (latest) */, E = B + '/examples/jsm/';
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const init = async (host) => {
    if (host.__wbgl) return; host.__wbgl = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d;
    const [T, GL, RE, MO, DR] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js'), import(E + 'libs/meshopt_decoder.module.js'), import(E + 'loaders/DRACOLoader.js')]);
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.setClearColor(0, 0);
    r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 200); cam.position.set(0, 0, 22);
    { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }
    const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(-6, 9, 14); const rim = new T.DirectionalLight(0xffffff, 1.2); rim.position.set(5, 3, -6); sc.add(key, rim);
    const glass = WBGlass(T, sc, r, at), pivot = new T.Group(); sc.add(pivot);
    const ld = new GL.GLTFLoader(); ld.setMeshoptDecoder(MO.MeshoptDecoder);
    { const dr = new DR.DRACOLoader(); dr.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/'); ld.setDRACOLoader(dr); } // Draco-compressed models (e.g. hands.glb)
    const g = await ld.loadAsync(A() + at('model', 'models/webflow.glb')); const m = g.scene;
    m.traverse((o) => { if (o.isMesh) o.material = glass; });
    { const [rx, ry, rz] = at('rot', '0,0,0').split(',').map((v) => T.MathUtils.degToRad(+v || 0)); m.rotation.set(rx, ry, rz); m.updateMatrixWorld(true); } // data-rot="x,y,z" degrees: turn a model to face the camera
    // centre the model and scale it to a share of the view height
    const box = new T.Box3().setFromObject(m), c = box.getCenter(new T.Vector3()), s = box.getSize(new T.Vector3());
    const viewH = 2 * Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * cam.position.z, k = viewH * 0.42 * +at('size', 1) / Math.max(s.x, s.y, s.z);
    m.position.sub(c).multiplyScalar(k); m.scale.setScalar(k); pivot.add(m);
    /* data-bolts="1": lightning between the tips that face each other across the centre (e.g. two reaching fingers) */
    let BOLTS = null;
    if (at('bolts', '0') === '1') {
      m.updateMatrixWorld(true); const v = new T.Vector3(); let A = null, Bp = null;
      /* the two tips = the edges of the widest empty vertical slice near the middle (the gap between the hands) */
      const pts = []; m.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position;
        for (let i = 0; i < p.count; i += 2) pts.push(v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).clone()); });
      pts.sort((p, q) => p.x - q.x); const W = pts.length ? pts[pts.length - 1].x - pts[0].x : 0; let best = 0;
      for (let i = 1; i < pts.length; i++) { const g = pts[i].x - pts[i - 1].x, mid = (pts[i].x + pts[i - 1].x) / 2;
        if (Math.abs(mid) < W * 0.25 && g > best) { best = g; A = pts[i - 1]; Bp = pts[i]; } }
      if (best < W * 0.004) A = Bp = null; // no gap found: no bolts
      if (A && Bp) {
        const N = 3, SEG = 24, grp = new T.Group(); pivot.add(grp);
        const mk = (w, op) => { const g = new T.BufferGeometry(), pos = new Float32Array((SEG + 1) * 2 * 3), idx = [];
          for (let i = 0; i < SEG; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
          g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setIndex(idx);
          const mt = new T.MeshBasicMaterial({ color: 0xd9ecff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, depthTest: false, side: T.DoubleSide, toneMapped: false });
          const me = new T.Mesh(g, mt); me.renderOrder = 10; me.frustumCulled = false; grp.add(me); return { me, pos, w, op }; };
        const bolts = Array.from({ length: N }, () => ({ core: mk(0.03, 1), glow: mk(0.16, 0.3), off: new Float32Array(SEG + 1), tgt: new Float32Array(SEG + 1), z: new Float32Array(SEG + 1), next: 0 }));
        const U = viewH * 0.012, dir0 = Bp.clone().sub(A).normalize(); A = A.clone().addScaledVector(dir0, -U * 2.2); Bp = Bp.clone().addScaledVector(dir0, U * 2.2);
        const D = Bp.clone().sub(A), L = D.length(), dir = D.clone().normalize(), nrm = new T.Vector3(-dir.y, dir.x, 0).normalize(), AMP = Math.max(L * 0.3, U * 2.4);
        const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const g = gc.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
          gr.addColorStop(0, 'rgba(235,245,255,1)'); gr.addColorStop(0.25, 'rgba(170,210,255,0.55)'); gr.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
        const flare = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(gc), transparent: true, blending: T.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 }));
        flare.position.copy(A).add(Bp).multiplyScalar(0.5); flare.renderOrder = 11; grp.add(flare);
        let k = 0;
        BOLTS = (dt, hot, now) => { k += ((hot ? 1 : 0) - k) * (1 - Math.exp(-dt * (hot ? 4 : 2.5))); grp.visible = k > 0.005; if (!grp.visible) return;
          { const pulse = 0.75 + 0.25 * Math.sin(now * 0.012) + Math.random() * 0.15; flare.material.opacity = k * pulse; flare.scale.setScalar(U * 14 * (0.85 + 0.3 * pulse)); }
          bolts.forEach((b, j) => {
            if (now > b.next) { b.next = now + 70 + Math.random() * 90; // new shape, eased toward smoothly
              for (let i = 0; i <= SEG; i++) { const t = i / SEG, env = Math.sin(Math.PI * t); b.tgt[i] = (Math.random() - 0.5) * AMP * env + (j - 1) * AMP * 0.35 * env; b.z[i] = (Math.random() - 0.5) * AMP * 0.4 * env; } }
            const fl = 0.8 + 0.2 * Math.sin(now * 0.02 + j * 2.1) * Math.random();
            for (let i = 0; i <= SEG; i++) b.off[i] += (b.tgt[i] - b.off[i]) * (1 - Math.exp(-dt * 18));
            for (const part of [b.core, b.glow]) {
              for (let i = 0; i <= SEG; i++) { const t = i / SEG, taper = 0.35 + 0.65 * Math.sin(Math.PI * t), w = part.w * U * 9 * taper * (0.8 + 0.4 * k);
                const px = A.x + D.x * t + nrm.x * b.off[i], py = A.y + D.y * t + nrm.y * b.off[i], pz = A.z + D.z * t + b.z[i];
                part.pos.set([px + nrm.x * w, py + nrm.y * w, pz, px - nrm.x * w, py - nrm.y * w, pz], i * 6); }
              part.me.geometry.attributes.position.needsUpdate = true; part.me.material.opacity = Math.min(1, part.op * 1.6) * k * fl * (j === 0 ? 1 : 0.7); }
          }); };
      }
    }
    const SPIN = +at('spin', 0.25), MOUSE = +at('mouse', 1); let mx = 0, my = 0, tx = 0, ty = 0, vis = true, last = performance.now();
    let pmx = 0, pmy = 0, pIn = false; // pointer, for the hover bolts
    addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; pmx = mx; pmy = my; pIn = true; }, { passive: true });
    document.addEventListener('pointerleave', () => { pIn = false; });
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(host);
    const size = () => { const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = (now) => { RAF(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!vis) return;
      tx += (mx - tx) * Math.min(1, dt * 4); ty += (my - ty) * Math.min(1, dt * 4);
      if (!still) m.rotation.y += SPIN * dt;
      pivot.rotation.set(ty * 0.25 * MOUSE, tx * 0.35 * MOUSE, 0); pivot.position.y = -Math.min(1, scrollY / innerHeight) * viewH * 0.15;
      if (BOLTS) { const hr = host.getBoundingClientRect(), cx = (pmx + 1) / 2 * innerWidth, cy = (pmy + 1) / 2 * innerHeight;
        BOLTS(dt, pIn && cx > hr.left && cx < hr.right && cy > hr.top && cy < hr.bottom, now); }
      r.render(sc, cam); };
    RAF(loop);
  };
  const scan = () => document.querySelectorAll('[data-wb-glasslogo]').forEach(init);
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
