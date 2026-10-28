/* Wubble services hero: the chrome astronaut floats in the centre (behind the title), thin elliptical orbit rings around him,
   and extruded 3D tool logos (glossy black, warm edge light) float along the orbits. Mouse tilts the whole system.
   Webflow: an empty div [data-wb-orbit] filling the hero (position:absolute; inset:0). The title sits above it (higher z-index).
   Attributes: data-logos="greensock,figma,webgl,webflow,shopify" (Simple Icons slugs) · data-speed="1" · data-mouse="1"
   · data-astro="1" · data-astro-size="1" · data-accent="#ff7a2e" (edge light) */
(() => {
  const A = () => window.WB_ASSETS || './', B = 'https://esm.sh/three@0.160.0', E = B + '/examples/jsm/';
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const ICON = (s) => 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/' + s + '.svg';
  const init = async (host) => {
    if (host.__orb) return; host.__orb = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d;
    const [T, GL, RE, MO, SV] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js'), import(E + 'libs/meshopt_decoder.module.js'), import(E + 'loaders/SVGLoader.js')]);
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.setClearColor(0, 0);
    r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 200); cam.position.set(0, 0, 22);
    { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }
    const ACC = new T.Color(at('accent', '#ffffff')); /* neutral by default (was orange) */
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    const key = new T.DirectionalLight(0xffffff, 1.8); key.position.set(-6, 9, 14); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 8; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -22, right: 22, top: 14, bottom: -14, near: 1, far: 60 }); key.shadow.camera.updateProjectionMatrix();
    const warm = new T.PointLight(ACC, 30, 30, 2); warm.position.set(6, -2, 4); const rim = new T.DirectionalLight(0xffffff, 1.4); rim.position.set(5, 3, -6);
    /* shadow catcher: a wall behind everything that only shows the shadows (page stays white) */
    const wall = new T.Mesh(new T.PlaneGeometry(120, 80), new T.ShadowMaterial({ opacity: +at('shadow', 0.16) })); wall.position.z = -9; wall.receiveShadow = true; sc.add(wall);
    sc.add(key, warm, rim, new T.AmbientLight(0xffffff, 0.04));
    const world = new T.Group(); world.rotation.x = 0.32; sc.add(world);
    /* orbit rings: thin ellipses, slightly offset */
    const RX = 12, RZ = 7.2, rings = [];
    for (const [k, y, o] of [[1, 0, 0.16], [0.94, 0.35, 0.1], [1.06, -0.3, 0.08]]) { const pts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * RX * k, y, Math.sin(a) * RZ * k)); }
      if (at('rings', '0') === '0') continue; const ln = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: o })); world.add(ln); rings.push(ln); }
    /* astronaut (same chrome as About/Work) */
    let mixer = null, astro = null;
    if (at('astro', '1') !== '0') { const ld = new GL.GLTFLoader(); ld.setMeshoptDecoder(MO.MeshoptDecoder);
      ld.loadAsync(A() + 'models/astronaut-rig.glb').then((g) => { const m = g.scene; astro = new T.Group(); astro.add(m); sc.add(astro);
        const fl = g.animations.find((x) => /float/i.test(x.name)) || g.animations[0]; mixer = new T.AnimationMixer(m); if (fl) mixer.clipAction(fl).play(); mixer.update(0);
        m.updateMatrixWorld(true); const bx = new T.Box3().setFromObject(m, true), sz = bx.getSize(new T.Vector3()), cn = bx.getCenter(new T.Vector3()), s = 7.2 * +at('astro-size', 1.7) / sz.y;
        m.scale.setScalar(s); m.position.set(-cn.x * s, -cn.y * s, -cn.z * s);
        const mat = new T.MeshPhysicalMaterial({ color: 0xd6d4cf, metalness: 1, roughness: 0.14, flatShading: true, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3 });
        m.traverse((o) => { if (o.isMesh) { o.material = mat; o.frustumCulled = false; o.castShadow = true; } }); }).catch((e) => console.warn('[orbit] astronaut', e)); }
    /* logos: Simple Icons SVG → extruded, glossy black body + warm metallic edge */
    const body = new T.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.6, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4 });
    const edge = new T.MeshPhysicalMaterial({ color: 0x2a2a2c, metalness: 1, roughness: 0.22, envMapIntensity: 1.6 });
    const slugs = at('logos', 'greensock,figma,webgl,webflow,shopify').split(',').map((s) => s.trim()).filter(Boolean), logos = [];
    const loader = new SV.SVGLoader();
    await Promise.all(slugs.map(async (slug, i) => { try { const txt = await (await fetch(ICON(slug))).text(), data = loader.parse(txt), shapes = [];
        for (const p of data.paths) shapes.push(...SV.SVGLoader.createShapes(p));
        const geo = new T.ExtrudeGeometry(shapes, { depth: 3.2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.35, bevelSegments: 3, curveSegments: 10 }); geo.center(); geo.scale(0.085, -0.085, 0.085);
        const mesh = new T.Mesh(geo, [body, edge]); mesh.castShadow = true; const grp = new T.Group(); grp.add(mesh); world.add(grp);
        logos.push({ grp, mesh, a: i / slugs.length * Math.PI * 2 + 0.4, ring: i % 3, spin: new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.5), bob: Math.random() * 6 });
      } catch (e) { console.warn('[orbit] logo', slug, e); } }));
    const size = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = 22 * Math.max(1, 1.55 / cam.aspect); cam.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(host);
    const M = { x: 0, y: 0, tx: 0, ty: 0 }, MI = +at('mouse', 1), SPD = +at('speed', 1);
    addEventListener('pointermove', (e) => { M.tx = e.clientX / innerWidth * 2 - 1; M.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    let vis = true; new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(host);
    let last = performance.now();
    const heroEl = host.closest('section') || host.parentElement, STAY = at('logos-scroll', 'hero'); const wv = new T.Vector3();
    const tick = (now) => { RAF(tick); if (!host.isConnected || !vis) return; const dt = Math.min(0.05, (now - last) / 1000); last = now, t = now / 1000;
      /* logos belong to the hero: they scroll up and out with it (world-space offset = hero scroll distance); the astronaut stays */
      if (STAY === 'hero') { const hr = heroEl.getBoundingClientRect(), HH = Math.tan(cam.fov * Math.PI / 360) * cam.position.z; world.position.y = -hr.top / innerHeight * 2 * HH; world.visible = hr.bottom > -innerHeight * 0.5; }
      const k = 1 - Math.exp(-dt * 2.4); M.x += (M.tx - M.x) * k; M.y += (M.ty - M.y) * k;
      world.rotation.x = 0.32 + M.y * 0.18 * MI; world.rotation.z = -M.x * 0.08 * MI; world.rotation.y = M.x * 0.25 * MI;
      for (const L of logos) { L.a += dt * 0.12 * SPD; const kk = [1, 0.94, 1.06][L.ring], y = [0, 0.35, -0.3][L.ring];
        L.grp.position.set(Math.cos(L.a) * RX * kk, y + Math.sin(t * 0.7 + L.bob) * 0.5, Math.sin(L.a) * RZ * kk);
        L.mesh.rotation.x += L.spin.x * dt; L.mesh.rotation.y += (0.35 + L.spin.y) * dt; L.mesh.rotation.z += L.spin.z * dt * 0.5; }
      if (astro) { astro.rotation.y = -0.4 + M.x * 0.5 * MI + Math.sin(t * 0.3) * 0.15; astro.rotation.x = M.y * 0.15 * MI; astro.position.set(M.x * 0.6 * MI, +at('astro-y', -2.2) + Math.sin(t * 0.8) * 0.25 - M.y * 0.4 * MI, -1); /* lower, so the head clears the top nav */ }
      warm.position.set(6 + M.x * 4, -2 - M.y * 3, 4);
      if (mixer) mixer.update(dt); r.render(sc, cam); };
    RAF(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-orbit]').forEach((h) => init(h).catch((e) => console.warn('[orbit]', e)));
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-orbit] canvas')) setTimeout(poll, 250); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
