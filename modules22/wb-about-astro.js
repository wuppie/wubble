/* Wubble About: the Work-page astronaut, 1:1 — same renderer settings, lights, environment, black-glass material
   (transmission + dispersion + clearcoat) and the same galaxy around him. On Work the glass reads white because it
   refracts the bright project cards behind him; here a few soft light panels orbit behind him on the same ring so the
   glass refracts the same kind of light. He plays the wave clip instead of floating.
   Webflow: empty div [data-wb-about-astro] (size it in the Designer).
   Attributes: data-scale="1" · data-clip="wave" (wave | look | floating) · data-panels="5" · data-dispersion="6" */
(() => {
  const A = () => window.WB_ASSETS || './', B = 'https://esm.sh/three@0.186.1' /* one three.js version site-wide (latest) */, E = B + '/examples/jsm/';
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const clip = (n) => window.WB_CLIPS && window.WB_CLIPS[n] ? Promise.resolve() : new Promise((res) => { const s = document.createElement('script'); s.src = A() + 'modules22/wb-clip-' + n + '.min.js'; s.onload = s.onerror = () => res(); document.head.appendChild(s); });
  const init = async (host) => {
    if (host.__astro) return; host.__astro = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d, CL = at('clip', 'wave');
    const [T, GL, RE, MO, SV, MS3] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js'), import(E + 'libs/meshopt_decoder.module.js'), import(E + 'loaders/SVGLoader.js'), import(E + 'math/MeshSurfaceSampler.js'), CL === 'floating' ? 0 : clip(CL)]);
    /* ---- identical to wb-workhelix.js ---- */
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05 * (window.WB_ASTRO_BRIGHT || 2.2);
    /* full-screen layer behind the page text: galaxy fills the whole background, the astronaut is placed over [data-wb-about-astro] (never clipped) */
    r.domElement.setAttribute('aria-hidden', 'true'); r.domElement.style.filter = 'drop-shadow(0 30px 40px rgba(0,0,0,0.75)) drop-shadow(0 8px 14px rgba(0,0,0,0.6))'; r.domElement.setAttribute('data-wb-about-astro-canvas', ''); r.domElement.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;display:block;pointer-events:none;z-index:0;'; document.body.appendChild(r.domElement); host.__cv = r.domElement;
    r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); r.setClearColor(0x030303, 0);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, 0.1, 100);
    { const key = new T.DirectionalLight(0xfff6ee, 2.2); key.position.set(2.8, 1.3, 0.9); const rim = new T.DirectionalLight(0xdfe8ff, 2.4); rim.position.set(-2.6, 1.8, -2.0);
      const fil = new T.DirectionalLight(0xc8d4e6, 0.45); fil.position.set(-1.8, -0.6, 1.6); sc.add(key, rim, fil, new T.HemisphereLight(0xcfd8e8, 0x050506, 0.25)); const LC = at('light', ''); if (LC) { key.color.set(LC); rim.color.set(LC).lerp(new T.Color(0xffffff), 0.35); } }
    { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }
    const R = 3.6;
    const GN = innerWidth < 820 ? 2200 : 4200, gp = new Float32Array(GN * 3), gs = new Float32Array(GN), gb = new Float32Array(GN);
    for (let i = 0; i < GN; i++) { const a = Math.random() * Math.PI * 2, far = Math.random() < 0.18, rad = far ? 3 + Math.random() * 8 : 0.55 + Math.pow(Math.random(), 1.8) * 2.6, y = far ? (Math.random() - 0.5) * 16 : (Math.random() + Math.random() - 1) * 3.4;
      gp.set([Math.cos(a) * rad, y, Math.sin(a) * rad - (far ? 2 : 0)], i * 3); gs[i] = 0.5 + Math.pow(Math.random(), 4) * 2.6; gb[i] = Math.random() < 0.12 ? 0.82 : 1.0; }
    const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.BufferAttribute(gp, 3)); gg.setAttribute('sz', new T.BufferAttribute(gs, 1)); gg.setAttribute('tone', new T.BufferAttribute(gb, 1));
    const GU = { uT: { value: 0 }, uOff: { value: 0 }, uRot: { value: 0 }, uV: { value: 0 }, uPx: { value: r.getPixelRatio() } };
    const gal = new T.Points(gg, new T.ShaderMaterial({ uniforms: GU, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: 'uniform float uT, uOff, uRot, uV, uPx; attribute float sz; attribute float tone; varying float vA; varying float vT; varying float vS;' +
        ' void main(){ vec3 p = position; float r = length(p.xz); float a = atan(p.z, p.x) + uRot / (0.5 + r * 0.25) + uT * 0.04 / (0.4 + r * 0.3); p.x = cos(a) * r; p.z = sin(a) * r;' +
        ' p.y += sin(uT * 0.5 + r * 3.0) * 0.05; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;' +
        ' float w = min(1.0, abs(uV) * 0.35); vS = w; gl_PointSize = sz * uPx * (34.0 / -mv.z) * (1.0 + w * 0.6); vT = tone; vA = (0.6 + 0.4 * sin(uT * 1.3 + sz * 23.0)) * smoothstep(8.0, 2.0, abs(p.y)) * smoothstep(0.35, 0.8, r); }',
      fragmentShader: 'varying float vA; varying float vT; varying float vS; void main(){ vec2 d = gl_PointCoord - 0.5; d.x *= 1.0 + vS * 1.5; float f = smoothstep(0.5, 0.0, length(d)); f *= f; gl_FragColor = vec4(vec3(vT) * f * vA, f * vA); }' }));
    gal.frustumCulled = false; if (at('galaxy', '1') !== '0') sc.add(gal);
    /* on Work the glass reads white because its transmission buffer contains the bright project cards around him.
       Here light panels play that role, but ONLY inside the transmission pass (hidden in the visible render),
       so he refracts the same light while the page itself just shows him + the galaxy. */
    const NP = +at('panels', 0), CW = 3.4 * 0.82, CH = 2.1 * 0.82, panels = [];
    { const n = document.createElement('canvas'); n.width = 340; n.height = 210; const x = n.getContext('2d'); const gr = x.createLinearGradient(0, 0, 340, 210); gr.addColorStop(0, '#ecebe6'); gr.addColorStop(0.55, '#c9c8c2'); gr.addColorStop(1, '#8f9096'); x.fillStyle = gr; x.fillRect(0, 0, 340, 210);
      const tx = new T.CanvasTexture(n); tx.colorSpace = T.SRGBColorSpace;
      for (let i = 0; i < NP; i++) { const mt = new T.MeshBasicMaterial({ map: tx, side: T.DoubleSide, toneMapped: false }), m = new T.Mesh(new T.PlaneGeometry(CW * 1.25, CH * 1.25), mt);
        m.frustumCulled = false; m.onBeforeRender = (rr) => { const inT = rr.getRenderTarget() !== null; mt.colorWrite = inT; mt.depthWrite = inT; };
        m.position.set((i - (NP - 1) / 2) * 1.6, ((i % 2) - 0.5) * 1.4, -1.6 - (i % 2) * 0.5); sc.add(m); panels.push({ m, x0: m.position.x, y0: m.position.y, ph: i * 1.7 }); } }
    let WB_H = 5.4; const pivot = new T.Group(); pivot.position.z = -0.4; sc.add(pivot); let mixer = null;
    const ld = new GL.GLTFLoader(); ld.setMeshoptDecoder(MO.MeshoptDecoder);
    const MURL = at('model', ''), CUSTOM = !!MURL; /* custom model (e.g. shaka hand) replaces the astronaut, sized like his head */
    const g = await ld.loadAsync(CUSTOM ? (/^https?:/.test(MURL) ? MURL : A() + MURL) : A() + 'models/astronaut-rig.glb'), m = g.scene; pivot.add(m);
    if (CUSTOM) { const rr = at('model-rot', '0,0,0').split(',').map(Number); m.rotation.set(rr[0] || 0, rr[1] || 0, rr[2] || 0); m.traverse((o) => { if (o.isMesh && o.geometry) { const g0 = o.geometry; if (!g0.attributes.normal || at('model-normals', '') === 'recompute') g0.computeVertexNormals(); } }); }
    { const clip0 = g.animations.find((x) => /float/i.test(x.name)) || g.animations[0]; if (clip0) { const mx0 = new T.AnimationMixer(m); mx0.clipAction(clip0).play(); mx0.update(0); } }
    m.updateMatrixWorld(true); const bx = new T.Box3().setFromObject(m, true), sz = bx.getSize(new T.Vector3()), cn = bx.getCenter(new T.Vector3()), s = (CUSTOM ? WB_H * 0.2 : WB_H) / Math.max(1e-6, sz.y);
    m.scale.setScalar(s); m.userData.s0 = s; m.position.set(-cn.x * s, -cn.y * s, -cn.z * s);
    /* the look the Work page actually shows: faceted silver chrome (bright environment reflections, dark mirrored creases) */
    const glassA = new T.MeshPhysicalMaterial({ color: 0xd6d4cf, metalness: 1, roughness: +at('roughness', 0.14), flatShading: true, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: +at('env', 1.3) }); /* = Services orbit astronaut */
    if (at('look', 'chrome') === 'orbit') r.toneMappingExposure = +at('exposure', 1.1);
    /* 'mono' look (About hero): matte grey head in a single soft key light, everything else falls off into black;
       below the neck the body fades out so only the head floats in the dark */
    const FU = { uCut: { value: -1e4 }, uSoft: { value: 1 } }, MONO = at('look', 'chrome') === 'mono';
    if (MONO) { Object.assign(glassA, { metalness: 0, roughness: +at('roughness', 0.62), clearcoat: 0.15, clearcoatRoughness: 0.5, flatShading: false, envMapIntensity: +at('env', 0.12) }); glassA.color.set(at('tone', '#8e8b88'));
      glassA.onBeforeCompile = (s) => { s.uniforms.uCut = FU.uCut; s.uniforms.uSoft = FU.uSoft;
        s.vertexShader = 'varying float vWy;\n' + s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vWy = (modelMatrix * vec4(transformed, 1.0)).y;');
        s.fragmentShader = 'uniform float uCut, uSoft; varying float vWy;\n' + s.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n  float wbF = smoothstep(uCut - uSoft, uCut + uSoft * 0.25, vWy); gl_FragColor.rgb *= wbF; gl_FragColor.a *= wbF;'); };
      glassA.customProgramCacheKey = () => 'wb-mono-cut'; glassA.transparent = true; glassA.depthWrite = true; glassA.needsUpdate = true; r.toneMappingExposure = +at('exposure', 1); window.__wbMonoFU = FU; window.__wbMonoMat = glassA;
      const DL = sc.children.filter((o) => o.isDirectionalLight); if (DL[0]) { DL[0].color.set(0xffffff); DL[0].intensity = +at('key', 3.4); DL[0].position.set(3.2, 1.1, 1.6); }
      if (DL[1]) { DL[1].intensity = 0.35; DL[1].position.set(-2.4, 1.2, -2); } if (DL[2]) DL[2].intensity = 0.06; sc.children.filter((o) => o.isHemisphereLight).forEach((o) => { o.intensity = 0.05; }); }
    let headBone = null; if (!CUSTOM) m.traverse((o) => { if (o.isBone && !headBone && /head$/i.test(o.name)) headBone = o; }); else { headBone = new T.Object3D(); pivot.add(headBone); } const HEAD = at('mode', '') === 'head', hv = new T.Vector3();
    m.traverse((o) => { if (o.isMesh) { o.material = glassA; o.frustumCulled = false; } }); if (CUSTOM) glassA.side = T.DoubleSide;
    /* homepage-hero look: the baked black-metal suit textures (same files + UV transfer as wb-astro.js) */
    if (at('look', 'chrome') === 'textured') { r.toneMappingExposure = 1.05 * +at('bright', 0.9); try {
        const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 820, sfx = coarse ? '-1k' : '-2k';
        const [uvb, ...tx] = await Promise.all([fetch(A() + 'models/astro-rig-uv.bin').then((x) => x.arrayBuffer()), ...['color', 'mr', 'normal'].map((n) => new T.TextureLoader().loadAsync(A() + 'models/astro-tex-' + n + sfx + '.webp'))]);
        tx[0].colorSpace = T.SRGBColorSpace; tx.forEach((t) => { t.anisotropy = 4; }); const uv = new Uint16Array(uvb);
        /* all black metal, face included: keep only the normal map (suit detail), drop the colour + metal/rough maps */
        const texM = new T.MeshPhysicalMaterial({ color: new T.Color(at('metal-color', '#141416')), normalMap: tx[2], metalness: 1, roughness: +at('roughness', 0.22), clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: +at('env', 1.6) });
        m.traverse((o) => { if (!o.isSkinnedMesh) return; const g0 = o.geometry, g2 = g0.index ? g0.toNonIndexed() : g0; if (g2.attributes.position.count * 2 !== uv.length) return; g2.setAttribute('uv', new T.BufferAttribute(uv, 2, true)); o.geometry = g2; o.material = texM; });
      } catch (e) { console.warn('[about astro] textures', e); } }
    /* 'glass' look: shared see-through glass (wb-glass.js, options as data attributes there) */
    let GLASS = null; // the hover logos reuse it
    if (at('look', 'chrome') === 'glass' && window.WBGlass) { GLASS = WBGlass(T, sc, r, at); m.traverse((o) => { if (o.isMesh) o.material = GLASS; }); }
    mixer = new T.AnimationMixer(m); let act = null;
    if (!CUSTOM && CL !== 'floating' && window.WB_CLIPS && WB_CLIPS[CL]) { const c = T.AnimationClip.parse(WB_CLIPS[CL]); c.uuid = T.MathUtils.generateUUID();
      for (const tr of c.tracks) if (/Hips\.position$/.test(tr.name)) { const v = tr.values, x0 = v[0], z0 = v[2]; for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; } } act = mixer.clipAction(c); }
    if (!act) { const fl = g.animations.find((a) => /float/i.test(a.name)) || g.animations[0]; if (fl) act = mixer.clipAction(fl); } if (act) act.play();
    /* calmer clip: data-clip-speed="0.5" (slower) · data-clip-pingpong="1" (plays back and forth, no jump at the loop seam)
       · data-clip-rest="4" (seconds he holds still at each end before moving again) */
    if (act) { act.timeScale = +at('clip-speed', 1); if (at('clip-pingpong', '') === '1') act.setLoop(T.LoopPingPong, Infinity);
      const REST = +at('clip-rest', 0); if (REST > 0) mixer.addEventListener('loop', (e) => { if (e.action !== act) return; act.paused = true; setTimeout(() => { act.paused = false; }, REST * 1000); }); }
    /* hover morph: the astronaut shatters into the Services 3D tool logos, floating where he stood (reverse on leave) */
    const HV = {}, MORPH = at('morph', '1') !== '0', mlogos = []; let hov = 0, hovT = 0;
    if (MORPH) { let body = new T.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.6, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4, transparent: true }), edge = new T.MeshPhysicalMaterial({ color: 0x2a2a2c, metalness: 1, roughness: 0.22, envMapIntensity: 1.6, transparent: true });
      { const LM = GLASS || (at('look', 'chrome') === 'chrome' ? glassA : null); if (LM) { body = LM.clone(); body.transparent = true; edge = body; } } /* logos in the astronaut's own look (glass or crystal chrome) */
      const ldr = new SV.SVGLoader(), slugs = at('logos', 'glb:models/icon-surfboard.glb,ph:beer-stein,fluent-emoji-high-contrast:dog-face,ph:film-slate,ph:music-notes').split(',').map((s) => s.trim()).filter(Boolean);
      /* icon source: 'surfboard' = built 3D board · 'ph:name' = Phosphor fill icon · 'set:name' = any Iconify icon · plain slug = Simple Icons brand logo · full URL = any SVG */
      const iconURL = (s) => /^https?:/.test(s) ? s : s.startsWith('ph:') ? 'https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2/assets/fill/' + s.slice(3) + '-fill.svg' : s.includes(':') ? 'https://api.iconify.design/' + s.replace(':', '/') + '.svg' : 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/' + s + '.svg';
      const norm = (geo) => { geo.computeBoundingBox(); const b = geo.boundingBox, s = 2.3 / Math.max(b.max.x - b.min.x, b.max.y - b.min.y, 1e-6); geo.center(); geo.scale(s, s, s); return geo; };
      const board = () => { const g = new T.SphereGeometry(1, 48, 24); g.scale(1.25, 0.07, 0.34); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) * (1 - Math.max(0, x / 1.25) * 0.45)); } g.computeVertexNormals();
        const fin = new T.BoxGeometry(0.22, 0.2, 0.03); fin.translate(-0.95, -0.12, 0); const m2 = new T.Mesh(g), f2 = new T.Mesh(fin); const gg = new T.BufferGeometry(); const parts = [g.toNonIndexed(), fin.toNonIndexed()]; const pos = []; const nor = []; parts.forEach((q) => { pos.push(...q.attributes.position.array); nor.push(...q.attributes.normal.array); }); gg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); gg.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); gg.rotateZ(Math.PI / 2.6); void m2; void f2; return norm(gg); };
      Promise.all(slugs.map(async (slug, i) => { let geo, mats;
        if (slug === 'surfboard') { geo = board(); mats = body; }
        else if (slug.startsWith('glb:')) { /* real model: merge all its meshes into one geometry (black metal look applied on top) */
          const gl2 = await new GL.GLTFLoader().setMeshoptDecoder(MO.MeshoptDecoder).loadAsync(/^https?:/.test(slug.slice(4)) ? slug.slice(4) : A() + slug.slice(4)); gl2.scene.updateMatrixWorld(true); const pos = [], nor = [];
          gl2.scene.traverse((o) => { if (!o.isMesh) return; const g0 = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g0.applyMatrix4(o.matrixWorld); if (!g0.attributes.normal) g0.computeVertexNormals(); pos.push(...g0.attributes.position.array); nor.push(...g0.attributes.normal.array); });
          geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); norm(geo); mats = body; }
        else { const txt = await (await fetch(iconURL(slug))).text(), d = ldr.parse(txt), shapes = []; for (const p of d.paths) shapes.push(...SV.SVGLoader.createShapes(p));
          shapes.forEach(() => {}); geo = new T.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1, bevelSegments: 3, curveSegments: 12 }); geo.computeBoundingBox(); const b = geo.boundingBox, w = Math.max(b.max.x - b.min.x, b.max.y - b.min.y);
          geo.dispose(); geo = new T.ExtrudeGeometry(shapes, { depth: w * 0.14, bevelEnabled: true, bevelThickness: w * 0.02, bevelSize: w * 0.014, bevelSegments: 3, curveSegments: 12 }); geo.scale(1, -1, 1); norm(geo); mats = [body, edge]; }
        const mesh = new T.Mesh(geo, mats); mesh.visible = false; sc.add(mesh); const a = i / slugs.length * Math.PI * 2; const smp = new MS3.MeshSurfaceSampler(new T.Mesh(geo)).build();
        mlogos.push({ mesh, smp, idx: i, a, r: 1.4 + (i % 2) * 0.6, y: Math.sin(a * 2) * 0.9, sp: new T.Vector3(Math.random() - 0.5, 0.6 + Math.random() * 0.4, Math.random() - 0.5), ph: Math.random() * 6 }); })).catch((e) => console.warn('[about astro] logos', e));
      const ray = new T.Raycaster(), pt = new T.Vector2(); let px = -1, py = -1;
      let uiOver = false; /* pointer over the header, a link or a button: no hover morph, no badge (keeps the menu clickable) */
      addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; uiOver = !!(e.target.closest && e.target.closest('header,a,button,[role=button],[data-wb-menu],[data-wb-menu-open]')); }, { passive: true }); addEventListener('pointerdown', (e) => { px = e.clientX; py = e.clientY; }, { passive: true, capture: true }); addEventListener('pointerleave', () => { px = -1; }, { passive: true });
      HV.rect = null; HV.ctr = new T.Vector3(); window.__wbAboutHV = { HV, mlogos, get px() { return px; } };
      HV.measure = () => { const b = new T.Box3().setFromObject(pivot); b.getCenter(HV.ctr); const pts = [[b.min.x, b.min.y, b.min.z], [b.max.x, b.max.y, b.max.z], [b.min.x, b.max.y, b.max.z], [b.max.x, b.min.y, b.min.z]].map((q) => new T.Vector3(...q).project(cam));
        const xs = pts.map((q) => (q.x + 1) / 2 * innerWidth), ys = pts.map((q) => (1 - q.y) / 2 * innerHeight); HV.rect = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
      HV.touch = matchMedia('(hover: none)').matches; HV.tap = false; addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || !e.pointerType) HV.touch = false; }, { passive: true }); addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') HV.touch = true; }, { passive: true }); /* touch: tap the hero to morph, tap again (or elsewhere) to reverse */
      addEventListener('pointerup', (e) => { if (!HV.touch) return; const hr = host.closest('section') ? host.closest('section').getBoundingClientRect() : host.getBoundingClientRect(); const inside = e.clientY > hr.top && e.clientY < hr.bottom; if (e.target.closest && e.target.closest('a,button,[data-wb-menu]')) return; HV.tap = inside ? !HV.tap : false; }, { passive: true });
      addEventListener('scroll', () => { if (HV.tap) { const hr = host.getBoundingClientRect(); if (hr.bottom < innerHeight * 0.3) HV.tap = false; } }, { passive: true });
      HV.hit = () => { if (HV.touch) return HV.tap; if (px < 0 || !HV.rect || uiOver) return false; let [x0, y0, x1, y1] = HV.rect; const MINW = Math.max(260, innerWidth * 0.22), MINH = Math.max(260, innerHeight * 0.38); if (x1 - x0 < MINW) { const c = (x0 + x1) / 2; x0 = c - MINW / 2; x1 = c + MINW / 2; } if (y1 - y0 < MINH) { const c = (y0 + y1) / 2; y0 = c - MINH / 2; y1 = c + MINH / 2; } const pad = HV.on ? 60 : 0; /* hysteresis: once on, a wider zone keeps it on */
        return px > x0 + (x1 - x0) * 0.18 - pad && px < x1 - (x1 - x0) * 0.18 + pad && py > y0 + (y1 - y0) * 0.05 - pad && py < y1 - (y1 - y0) * 0.05 + pad; };
    }
    /* click/tap toggles the morph; gooey badge (homepage style) follows the cursor over him */
    const BADGE = at('badge', 'click me') === 'off' ? { tick() {} } /* data-badge="off": no gooey badge */ : (() => { const lbl = at('badge', 'click me'), lbl2 = at('badge-back', 'click to return');
      if (!document.getElementById('wbGooAbout')) document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute"><defs><filter id="wbGooAbout" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"></feGaussianBlur><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"></feColorMatrix></filter></defs></svg>');
      const el = document.createElement('div'); el.setAttribute('aria-hidden', 'true'); el.setAttribute('data-wb-persist', ''); el.style.cssText = 'position:fixed;left:0;top:0;z-index:60;pointer-events:none;opacity:0;will-change:transform,opacity;';
      el.innerHTML = '<div style="position:relative;width:150px;height:84px;transform-origin:50% 50%;"><div style="position:absolute;inset:0;filter:url(#wbGooAbout);"><div data-m style="position:absolute;left:10px;top:16px;width:130px;height:46px;border-radius:999px;background:#ece9e2;"></div><div data-b style="position:absolute;left:18px;top:50px;width:26px;height:26px;border-radius:50%;background:#ece9e2;"></div><div data-b style="position:absolute;left:100px;top:12px;width:30px;height:30px;border-radius:50%;background:#ece9e2;"></div><div data-b style="position:absolute;left:62px;top:44px;width:22px;height:22px;border-radius:50%;background:#ece9e2;"></div></div><div data-t style="position:absolute;left:10px;top:16px;width:130px;height:46px;display:flex;align-items:center;justify-content:center;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:12px;font-weight:500;letter-spacing:0.02em;color:#050505;white-space:nowrap;"></div></div>';
      document.body.appendChild(el); const inner = el.firstChild, T = el.querySelector('[data-t]'), B = [...el.querySelectorAll('[data-b]')];
      let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, o = 0, sc = 0.6, t = 0, lastTxt = '';
      addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      return { el, tick(dt, show, on) { t += dt; const k = 1 - Math.exp(-dt * 9); x += (tx - x) * k; y += (ty - y) * k; o += ((show ? 1 : 0) - o) * (1 - Math.exp(-dt * 8)); sc += ((show ? 1 : 0.6) - sc) * (1 - Math.exp(-dt * 7));
        const txt = on ? lbl2 : lbl; if (txt !== lastTxt) { lastTxt = txt; T.textContent = txt; }
        el.style.opacity = o.toFixed(3); el.style.transform = 'translate3d(' + (x - 75).toFixed(1) + 'px,' + (y - 92).toFixed(1) + 'px,0)'; inner.style.transform = 'scale(' + sc.toFixed(3) + ')';
        B.forEach((b, i) => { b.style.transform = 'translate3d(' + (Math.sin(t * 2.1 + i * 2) * 6).toFixed(1) + 'px,' + (Math.cos(t * 1.7 + i) * 5).toFixed(1) + 'px,0) scale(' + (0.85 + 0.2 * Math.sin(t * 2.6 + i * 1.3)).toFixed(3) + ')'; });
        if (!HV.touch) document.documentElement.style.cursor = HV.over ? 'pointer' : ''; } }; })();
    addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') HV.touch = true; }, { passive: true });
    addEventListener('click', (e) => { if (!MORPH || !mlogos.length) return; if (e.target.closest && e.target.closest('a,button,input,textarea,[data-wb-menu]')) return; const inside = HV.hit && HV.hit();
      if (inside || HV.on) { HV.on = !HV.on; } });
    const PM = { N: +at('particles', 9000), ready: false };
    { PM.geo = new T.BufferGeometry(); PM.pos = new Float32Array(PM.N * 3); PM.src = new Float32Array(PM.N * 3); PM.geo.setAttribute('position', new T.BufferAttribute(PM.pos, 3));
      PM.del = new Float32Array(PM.N); PM.ph = new Float32Array(PM.N); PM.lg = new Uint8Array(PM.N); PM.loc = []; const rnd = new Float32Array(PM.N);
      for (let i = 0; i < PM.N; i++) { PM.ph[i] = Math.random() * 6.28; rnd[i] = Math.random(); PM.loc.push(new T.Vector3()); } PM.geo.setAttribute('rnd', new T.BufferAttribute(rnd, 1));
      PM.mat = new T.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uSize: { value: 2 }, uA: { value: 0 } },
        vertexShader: 'uniform float uSize; attribute float rnd; varying float vR; void main(){ vR = rnd; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * (0.6 + rnd * 0.9) * (14.0 / -mv.z); }',
        fragmentShader: 'uniform float uA; varying float vR; void main(){ vec2 d = gl_PointCoord - 0.5; float f = smoothstep(0.5, 0.15, length(d)); vec3 c = mix(vec3(0.42, 0.42, 0.44), vec3(0.95, 0.94, 0.92), vR * vR); gl_FragColor = vec4(c, f * uA); }' });
      PM.pts = new T.Points(PM.geo, PM.mat); PM.pts.frustumCulled = false; PM.pts.visible = false; sc.add(PM.pts);
      PM.cur = 0; PM.skins = null; PM.capture = (count) => { if (!PM.skins) { PM.skins = []; m.traverse((o) => { if (o.isSkinnedMesh || o.isMesh) PM.skins.push(o); }); } const skins = PM.skins; if (!skins.length) return; m.updateMatrixWorld(true); const v = new T.Vector3();
        for (let j = 0; j < count; j++) { const i = PM.cur; PM.cur = (PM.cur + 1) % PM.N; if (PM.cur === 0) PM.ready = true; const o = skins[(Math.random() * skins.length) | 0], cnt = o.geometry.attributes.position.count, vi = (Math.random() * cnt) | 0;
          if (o.isSkinnedMesh && o.getVertexPosition) o.getVertexPosition(vi, v); else v.fromBufferAttribute(o.geometry.attributes.position, vi); v.applyMatrix4(o.matrixWorld);
          PM.src[i * 3] = v.x; PM.src[i * 3 + 1] = v.y; PM.src[i * 3 + 2] = v.z; PM.pos[i * 3] = v.x; PM.pos[i * 3 + 1] = v.y; PM.pos[i * 3 + 2] = v.z;
          const li = i % mlogos.length; PM.lg[i] = li; mlogos[li].smp.sample(PM.loc[i]);
          PM.del[i] = Math.min(0.22, Math.max(0, (1 - (v.y - HV.ctr.y + 3) / 6)) * 0.14 + Math.random() * 0.08); }
        PM.geo.attributes.position.needsUpdate = true; }; }
    /* volume echo (data-volume="1"): the frame is rendered once, then stacked 14x outward from the head, each slice a little
       bigger, fainter and shifted toward the cursor, so he reads as a deep holographic volume instead of a flat cut-out */
    const VOL = at('volume', '0') !== '0', VU = { uTex: { value: null }, uC: { value: new T.Vector2(0.5, 0.5) }, uTilt: { value: new T.Vector2() }, uSpread: { value: 0 }, uFall: { value: +at('volume-falloff', 0.88) }, uRes: { value: new T.Vector2(1, 1) }, uAsp: { value: 1 } };
    let vRT = null, vScene = null, vCam = null; const VT0 = performance.now();
    if (VOL) { vRT = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, samples: 2 }); vRT.texture.colorSpace = T.SRGBColorSpace; VU.uTex.value = vRT.texture;
      vCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); vScene = new T.Scene();
      vScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: VU, transparent: true, depthTest: false, depthWrite: false,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: 'uniform sampler2D uTex; uniform vec2 uC, uTilt, uRes; uniform float uSpread, uFall, uAsp; varying vec2 vUv;' +
          ' float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }' +
          ' void main(){ vec2 a = vec2(uAsp, 1.0), p = (vUv - uC) * a; float nz = ign(gl_FragCoord.xy); vec4 acc = vec4(0.0); float w = 0.5; vec4 base = texture2D(uTex, vUv);' +
          ' for (int i = 1; i < 14; i++) { float s = (float(i) + nz) / 14.0; vec2 q = p / (1.0 + s * uSpread) - uTilt * s; vec2 uv = q / a + uC;' +
          '   if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) { vec4 t = texture2D(uTex, uv); float l = dot(t.rgb, vec3(0.299, 0.587, 0.114)); float dn = t.a * (l * 0.75 + 0.25); acc += vec4(t.rgb * dn, dn) * w; } w *= uFall; }' +
          ' vec3 v = acc.rgb / (1.0 + acc.rgb); /* deep glowing volume (stacked slices) */ float ea = clamp(acc.a * 0.6, 0.0, 1.0); vec3 col = max(base.rgb, v * 1.25); float al = max(base.a, ea); col = clamp(1.05 * (col - 0.5) + 0.5, 0.0, 1.0); gl_FragColor = vec4(col * step(0.002, al), al); }' }))); }
    const size = () => { const w = innerWidth || 1, h = innerHeight || 1; r.setSize(w, h, false); if (vRT) { const pr = r.getPixelRatio(); vRT.setSize(w * pr | 0, h * pr | 0); VU.uAsp.value = w / h; } cam.aspect = w / h; cam.fov = 32; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    const BIG = +at('scale', 1.35), halfH = () => Math.tan(cam.fov * Math.PI / 360) * (R + 7.6 + 0.4);
    const MS = { x: 0, y: 0, tx: 0, ty: 0 }; addEventListener('pointermove', (e) => { MS.tx = e.clientX / innerWidth * 2 - 1; MS.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    let last = performance.now(), vis = true;
    const tick = (now) => { RAF(tick); if (!host.isConnected) { r.domElement.remove(); return; } const dt = Math.min(0.05, (now - last) / 1000); last = now; const off = now / 1000 * 0.05, t = now / 1000;
      GU.uT.value = now / 1000; GU.uRot.value = -off * 0.25;
      { const k = 1 - Math.exp(-dt * 2.2); MS.x += (MS.tx - MS.x) * k; MS.y += (MS.ty - MS.y) * k; }
      gal.rotation.y = MS.x * 0.12; gal.rotation.x = MS.y * 0.06; gal.position.x = MS.x * 0.25; gal.position.y = -MS.y * 0.18;
      for (const p of panels) { p.m.position.x = p.x0 + Math.sin(now / 4000 + p.ph) * 0.9 - MS.x * 0.4; p.m.position.y = p.y0 + Math.cos(now / 5200 + p.ph) * 0.5 + MS.y * 0.3; p.m.rotation.y = Math.sin(now / 6000 + p.ph) * 0.4; }
      if (HEAD && headBone) { /* hero close-up: the helmet in profile fills the screen height, placed on [data-wb-about-astro]'s centre */
        const hr = host.getBoundingClientRect(), HH = halfH(), PX = +at('parallax', 0.35), top = hr.top * PX, tx = ((hr.left + hr.width * +at('head-x', 0.5)) / innerWidth * 2 - 1) * HH * cam.aspect, ty = (1 - (top + hr.height * +at('head-y', 0.42)) / innerHeight * 2) * HH;
        const k = Math.min(2 * HH * +at('head-size', 0.95), hr.width / innerHeight * 2 * HH * 0.55, hr.height / innerHeight * 2 * HH * 0.7) / (WB_H * 0.2); /* never wider than its column */ pivot.scale.setScalar(k); pivot.visible = true;
        const MM = CUSTOM ? +at('mouse', 3) : 1; pivot.rotation.set(MS.y * 0.12 * MM, +at('head-yaw', -1.45) + MS.x * 0.35 * MM, -MS.x * 0.04 * MM * 2);
        pivot.updateMatrixWorld(true); headBone.getWorldPosition(hv); if (VOL) { const pj = hv.clone().project(cam); VU.uC.value.set(pj.x * 0.5 + 0.5, pj.y * 0.5 + 0.5); }
        pivot.position.x += (tx + MS.x * 0.25 * MM - hv.x); pivot.position.y += (ty + Math.sin(now / 2600) * 0.06 * MM - MS.y * 0.15 * MM - hv.y); pivot.position.z = -0.4;
        if (MONO && !CUSTOM) { const hs = k * WB_H * 0.2; FU.uCut.value = ty - hs * +at('cut', 0.06); FU.uSoft.value = hs * +at('cut-soft', 0.2); /* head bone sits at the neck: fade ends just below it */ }
      } else { const hr = host.getBoundingClientRect(), HH = halfH(), nx = (hr.left + hr.width / 2) / innerWidth * 2 - 1, ny = 1 - (hr.top + hr.height / 2) / innerHeight * 2;
        const ax = nx * HH * cam.aspect, ay = ny * HH, k = Math.max(0.2, hr.height / innerHeight * 2 * HH / (WB_H) * BIG);
        pivot.scale.setScalar(k); pivot.visible = hr.bottom > -innerHeight * 0.3 && hr.top < innerHeight * 1.3;
        pivot.rotation.y = -0.2 + MS.x * 0.6; pivot.rotation.x = MS.y * 0.22; pivot.rotation.z = -MS.x * 0.06;
        pivot.position.x = ax + MS.x * 0.45; pivot.position.y = ay + Math.sin(now / 2200) * 0.08 - MS.y * 0.3; }
      cam.position.set(0, 0.35, R + 7.6); cam.lookAt(0, 0, 0);
      if (MORPH) { hovT += dt; if (hov < 0.001 && hovT > 0.25 && HV.measure) { hovT = 0; HV.measure(); } HV.over = !!(HV.hit && HV.hit()); HV.v = HV.v || 0; if (!mlogos.length) HV.on = false; BADGE.tick(dt, HV.over || HV.on, HV.on);
        { const tgt = HV.on ? 1 : 0, w = HV.on ? 4.6 : 4, acc = w * w * (tgt - hov) - 2 * w * HV.v; HV.v += acc * dt; hov = Math.max(0, Math.min(1, hov + HV.v * dt)); }
        /* particle morph: astronaut surface points flow into the logo surfaces */
        if (mlogos.length && hov < 0.001) PM.capture(PM.ready ? 600 : 1800); /* refresh in the background while idle → ready the instant you hover */
        const ctr = HV.ctr, ps = pivot.scale.x, sz = ps * (WB_H * 0.2) * 0.34;
        const HH2 = halfH(), RXo = HH2 * cam.aspect * +at('orbit-w', 0.8), RZo = RXo * 0.55, LS = HH2 * +at('logo-size', 0.2); /* Services layout: full-width tilted orbit, centred on screen */
        for (const L of mlogos) { const a = L.a + t * 0.12, kk = [1, 0.94, 1.06][L.idx % 3];
          L.mesh.position.set(Math.cos(a) * RXo * kk + MS.x * 0.3, Math.sin(a) * RZo * kk * 0.32 + Math.sin(t * 0.7 + L.ph) * LS * 0.25 - MS.y * 0.2, -0.4 + Math.sin(a) * RZo * kk);
          L.mesh.scale.setScalar(LS * 0.9); L.mesh.rotation.x += L.sp.x * dt * 0.6; L.mesh.rotation.y += L.sp.y * dt; L.mesh.updateMatrixWorld(true);
          const solid = Math.max(0, Math.min(1, (hov - 0.86) / 0.12)); L.mesh.visible = solid > 0.01; (Array.isArray(L.mesh.material) ? L.mesh.material : [L.mesh.material]).forEach((mm) => { mm.opacity = solid; }); }
        if (!glassA.transparent) { glassA.transparent = true; glassA.needsUpdate = true; } glassA.opacity = 1 - Math.min(1, hov / 0.1); m.visible = hov < 0.1; PM.pts.visible = PM.ready && hov > 0.001 && hov < 0.995;
        if (PM.ready && PM.pts.visible) { const P = PM.pos, N = PM.N, tv = new T.Vector3();
          for (let i = 0; i < N; i++) { const d = PM.del[i], k0 = Math.max(0, Math.min(1, (hov - d) / 0.7)), k = k0 * k0 * (3 - 2 * k0), L = mlogos[PM.lg[i]];
            tv.copy(PM.loc[i]).applyMatrix4(L.mesh.matrixWorld); const sw = Math.sin(k * Math.PI) * sz * 0.35, ph = PM.ph[i] + t * 1.5;
            P[i * 3] = PM.src[i * 3] + (tv.x - PM.src[i * 3]) * k + Math.cos(ph) * sw; P[i * 3 + 1] = PM.src[i * 3 + 1] + (tv.y - PM.src[i * 3 + 1]) * k + Math.sin(ph * 1.3) * sw; P[i * 3 + 2] = PM.src[i * 3 + 2] + (tv.z - PM.src[i * 3 + 2]) * k + Math.sin(ph) * sw; }
          PM.geo.attributes.position.needsUpdate = true; PM.mat.uniforms.uSize.value = r.getPixelRatio() * Math.max(1.5, innerHeight / 420); PM.mat.uniforms.uA.value = Math.min(1, hov / 0.05) * (1 - Math.max(0, (hov - 0.9) / 0.1)); }
        }
      if (mixer && !(MORPH && hov > 0.0005)) mixer.update(dt); /* pose frozen during the morph so the particles land back exactly on him */
      if (VOL) { { const e0 = Math.max(0, Math.min(1, (now - VT0 - 500) / 1525)), ee = e0 < 0.5 ? 16 * Math.pow(e0, 5) : 1 - Math.pow(-2 * e0 + 2, 5) / 2; VU.uSpread.value = ee * +at('volume-spread', 2.2); } /* perspective opens up on arrival */ VU.uTilt.value.set(0.02 - MS.x * 0.12, -0.11 + MS.y * 0.1); r.setRenderTarget(vRT); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam); r.setRenderTarget(null); r.clear(); r.render(vScene, vCam); }
      else r.render(sc, cam); };
    RAF(tick);
  };
  /* hero extras: live clock [data-wb-clock] and page scroll % [data-wb-progress] */
  const extras = () => { document.querySelectorAll('[data-wb-clock]').forEach((el) => { if (el.__clk) return; el.__clk = 1; const up = () => { const d = new Date(); el.textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) + ', ' + d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2).toUpperCase(); }; up(); setInterval(up, 1000); });
    document.querySelectorAll('[data-wb-progress]').forEach((el) => { if (el.__pg) return; el.__pg = 1; let lastP = -1; const up = () => { if (!el.isConnected) return; RAF(up); const y = window.__wbLenis ? window.__wbLenis.scroll : scrollY, m = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = Math.round(Math.min(1, y / m) * 100); if (p !== lastP) { lastP = p; el.textContent = p + ' %'; } }; RAF(up); }); };
  const run = () => { extras(); document.querySelectorAll('[data-wb-about-astro]').forEach((h) => init(h).catch((e) => console.warn('[about astro]', e))); };
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-about-astro] canvas')) setTimeout(poll, 250); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
