/* Wubble /work — CMS collection page: project cards on an infinite helix around the astronaut.
   Webflow owns the markup; this only adds behaviour via data attributes:
     [data-wb-work]                     page root (full-screen)
     [data-wb-work-stage]               element the WebGL canvas is mounted in
     [data-wb-work-item]                one per CMS item (Collection List item) with
        data-title / data-type / data-cat / data-href / data-bg / data-ink / data-mark, and an <img data-cover> (optional)
     [data-wb-work-filter="All|<cat>"]  filter links;  [data-wb-work-search]  text input
     [data-wb-work-prev] / [data-wb-work-next] / [data-wb-work-current]   pager
   Scroll / swipe / arrow keys spin the helix forever; the astronaut in the centre turns with it. */
(() => {
  if (window.__wbWork) return; window.__wbWork = 1;
  const B = 'https://esm.sh/three@0.186.1', /* 0.170: glass dispersion */ E = B + '/examples/jsm/';
  const wait = () => new Promise((r) => { const f = () => (document.querySelector('[data-wb-work-stage]') ? r() : setTimeout(f, 60)); f(); });
  const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  /* card art: identical to the homepage ribbon covers (wb-ribbon drawCover, noTitle) */
  const cardTex = (T, it, i) => new Promise((res) => {
    const w = 1600, h = Math.round(1600 * 2.1 / 3.4), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d');
    const paint = (img) => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = it.bg || '#1b1a17'; ctx.fillRect(0, 0, w, h);
      if (img) { const mw = img.naturalWidth || img.width, mh = img.naturalHeight || img.height, s = Math.max(w / mw, h / mh); ctx.drawImage(img, (w - mw * s) / 2, (h - mh * s) / 2, mw * s, mh * s); }
      else { const words = (it.mark || it.title || '').split(' '), L = i % 3; ctx.fillStyle = it.ink;
        if (L === 0) { ctx.font = '700 250px Switzer'; words.forEach((wd, k) => ctx.fillText(wd, 64, 330 + k * 225)); ctx.fillStyle = it.accent; ctx.fillRect(w - 520, 140, 420, 520); ctx.fillStyle = it.bg; for (let k = 0; k < 9; k++) ctx.fillRect(w - 520, 170 + k * 56, 420, 10); }
        else if (L === 1) { ctx.fillStyle = it.accent; ctx.beginPath(); ctx.arc(w * 0.66, h * 0.44, 300, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = it.ink; ctx.font = '700 300px Switzer'; ctx.fillText(words[0], 64, 360); if (words[1]) ctx.fillText(words[1], 64, 640); }
        else { ctx.font = '700 220px Switzer'; ctx.fillText(words.join(''), 64, 300); const cols = 4, gw = (w - 128 - 3 * 20) / cols;
          for (let k = 0; k < cols; k++) { const x = 64 + k * (gw + 20); ctx.fillStyle = k === 1 ? it.accent : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, 360, gw, 380); ctx.strokeStyle = it.ink; ctx.globalAlpha = 0.35; ctx.lineWidth = 2; ctx.strokeRect(x + 1, 361, gw - 2, 378); ctx.globalAlpha = 1; } } }
      const t = new T.CanvasTexture(cv); t.anisotropy = 8; res(t); };
    if (it.cover) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => paint(im); im.onerror = () => paint(null); im.src = it.cover; } else paint(null);
  });
  /* card shader: the homepage ribbon look — rounded SDF corners, liquid hover ripple, velocity RGB split, face shading + sheen, distance dim; the plane bends around the helix cylinder */
  const VS = `uniform float uR; uniform float uVel; varying vec2 vUv; varying float vFace;
    void main(){ vUv = uv; vec3 p = position; float th = p.x / uR; p.x = sin(th) * uR; p.z = (cos(th) - 1.0) * uR; 
      vec4 wp = modelMatrix * vec4(p, 1.0); vec3 n = normalize(mat3(modelMatrix) * vec3(sin(th), 0.0, cos(th))); vFace = dot(n, normalize(cameraPosition - wp.xyz));
      gl_Position = projectionMatrix * viewMatrix * wp; }`;
  const FS = `uniform sampler2D uTex; uniform vec2 uSize; uniform float uRadius, uVel, uHover, uTime, uDim, uOp; uniform vec2 uMouse; varying vec2 vUv; varying float vFace;
    float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    void main(){ vec2 p = (vUv - 0.5) * uSize; float d = sdRound(p, uSize * 0.5, uRadius), aa = fwidth(d) * 1.2, a = 1.0 - smoothstep(-aa, aa, d);
      vec2 asp = vec2(uSize.x / uSize.y, 1.0), md = (vUv - uMouse) * asp; float dist = length(md); vec2 dir = md / max(dist, 1e-4) / asp;
      float fall = smoothstep(0.5, 0.0, dist) * uHover; vec2 uv = (vUv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
      uv -= dir * sin(dist * 30.0 - uTime * 6.0) * 0.010 * fall; uv -= dir * 0.035 * fall * (1.0 - dist * 2.0);
      vec2 sh = vec2(uVel * 0.006, 0.0) + dir * 0.012 * fall;
      vec3 col = vec3(texture2D(uTex, uv + sh).r, texture2D(uTex, uv).g, texture2D(uTex, uv - sh).b); col += fall * 0.06;
      float face = gl_FrontFacing ? clamp(vFace, 0.0, 1.0) : 0.0; vec3 s = col * (0.5 + 0.5 * face);
      float edgeIn = smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x); s *= mix(0.72, 1.0, edgeIn); s *= mix(0.86, 1.0, smoothstep(0.0, 0.35, vUv.y));
      float sheen = exp(-pow((vUv.x - 0.5) * 3.2, 2.0)) * (0.6 + 0.4 * face); s += vec3(1.0, 0.98, 0.95) * sheen * 0.045 * smoothstep(0.2, 1.0, vUv.y);
      float ba = 1.0; if (!gl_FrontFacing) { s = col * 0.16 + vec3(0.012); ba = 0.42; } /* back of the ribbon: dim mirrored cover, see-through */
      s *= mix(0.2, 1.0, 1.0 - uDim); float al = a * uOp * ba, hz = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); if (al < 0.98 && al <= hz) discard; gl_FragColor = vec4(s, 1.0); } /* opaque + dithered fade: sorts correctly with the glass astronaut and gets refracted by it */`;
  const boot = async () => {
    await wait(); try { for (let k = 0; k < 40 && !document.fonts.check('700 200px Switzer'); k++) { try { await document.fonts.load('700 200px Switzer'); } catch (e) {} if (!document.fonts.check('700 200px Switzer')) await new Promise((r) => setTimeout(r, 100)); } } catch (e) {}
    const root = document.querySelector('[data-wb-work]') || document.body, stage = document.querySelector('[data-wb-work-stage]');
    const all = [...document.querySelectorAll('[data-wb-work-item]')].map((el) => ({ el, title: el.dataset.title || el.textContent.trim(), type: el.dataset.type || '', cat: (el.dataset.cat || '').toLowerCase(), href: el.dataset.href || el.getAttribute('href') || '', bg: el.dataset.bg, ink: el.dataset.ink, accent: el.dataset.accent || el.dataset.ink, mark: el.dataset.mark, cover: (el.querySelector('img[data-cover]') || {}).src || el.dataset.cover || '' }));
    if (!all.length) return console.warn('[work] no [data-wb-work-item] found');
    const [T, GL, MO] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'libs/meshopt_decoder.module.js')]);
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05 * (window.WB_ASTRO_BRIGHT || 2.2);
    r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;'; stage.appendChild(r.domElement);
    r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); r.setClearColor(0x0e0e0d, 0);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, 0.1, 100);
    { const key = new T.DirectionalLight(0xfff6ee, 2.2); key.position.set(2.8, 1.3, 0.9); const rim = new T.DirectionalLight(0xdfe8ff, 2.4); rim.position.set(-2.6, 1.8, -2.0);
      const fil = new T.DirectionalLight(0xc8d4e6, 0.45); fil.position.set(-1.8, -0.6, 1.6); sc.add(key, rim, fil, new T.HemisphereLight(0xcfd8e8, 0x050506, 0.25)); }
    import(E + 'environments/RoomEnvironment.js').then((RE) => { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }).catch(() => {});
    const R = 3.6, dA = Math.PI * 2 / 6.2, PITCH = 1.3, CW = 3.4 * 0.82, CH = 2.1 * 0.82;
    /* cards: enough slots for a seamless loop, cycling through the (filtered) items */
    const texCache = new Map(), getTex = (it) => { if (!texCache.has(it)) texCache.set(it, cardTex(T, it, all.indexOf(it))); return texCache.get(it); };
    const geo = new T.PlaneGeometry(CW, CH, 24, 1), NS = 14, slots = [];
    for (let i = 0; i < NS; i++) { const m = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: false, side: T.DoubleSide, depthWrite: true,
        uniforms: { uTex: { value: null }, uSize: { value: new T.Vector2(CW, CH) }, uRadius: { value: 0.12 }, uR: { value: R }, uVel: { value: 0 }, uHover: { value: 0 }, uTime: { value: 0 }, uDim: { value: 0 }, uOp: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) } } });
      m.extensions = { derivatives: true }; const mesh = new T.Mesh(geo, m); mesh.frustumCulled = false; const grp = new T.Group(); grp.add(mesh); sc.add(grp); slots.push({ grp, mesh, m, it: null }); }
    let list = all.slice(), q = '', cat = 'all';
    const applyFilter = () => { list = all.filter((it) => (cat === 'all' || it.cat.split(/[,|]/).map((s) => s.trim()).includes(cat)) && (!q || (it.title + ' ' + it.type + ' ' + it.cat).toLowerCase().includes(q))); if (!list.length) list = all.slice();
      document.querySelectorAll('[data-wb-work-filter]').forEach((b) => b.toggleAttribute('data-active', (b.dataset.wbWorkFilter || '').toLowerCase() === cat)); assigned = -1; };
    document.querySelectorAll('[data-wb-work-filter]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); const c = (b.dataset.wbWorkFilter || 'all').toLowerCase(); cat = cat === c ? 'all' : c; applyFilter(); }));
    const sIn = document.querySelector('[data-wb-work-search]'); if (sIn) sIn.addEventListener('input', () => { q = sIn.value.trim().toLowerCase(); applyFilter(); });
    /* homepage galaxy: white/grey stars in depth around the astronaut + soft grey nebula; scrolling flows them past and stretches them (warp) */
    r.setClearColor(0x030303, 0);
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
    gal.frustumCulled = false; sc.add(gal);
    { const n = document.createElement('canvas'); n.width = n.height = 512; const x = n.getContext('2d'), blob = (px, py, rr, col) => { const gr = x.createRadialGradient(px, py, 0, px, py, rr); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512); };
      blob(150, 200, 260, 'rgba(60,60,64,0.35)'); blob(380, 330, 230, 'rgba(38,38,42,0.4)'); blob(300, 120, 160, 'rgba(90,90,96,0.16)'); blob(90, 420, 180, 'rgba(30,30,34,0.35)');
      const nt = new T.CanvasTexture(n); nt.colorSpace = T.SRGBColorSpace; /* without this the grey blobs are decoded as linear and come out ~2x brighter */ const _nt = nt, neb = new T.Mesh(new T.PlaneGeometry(34, 34), new T.MeshBasicMaterial({ map: nt, transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false })); neb.position.z = -9; neb.renderOrder = -10; sc.add(neb); GU.neb = neb; if (window.__wbAbyss) neb.visible = false; /* the site-wide teal abyss replaces the grey nebula */ }
    /* astronaut at the centre */
    const pivot = new T.Group(); pivot.position.z = -0.4; sc.add(pivot); let mixer = null;
    { const ld = new GL.GLTFLoader(); ld.setMeshoptDecoder(MO.MeshoptDecoder); const url = (window.WB_ASSETS || './') + 'models/astronaut-rig.glb';
      ld.load(url, (g) => { const m = g.scene; pivot.add(m);
        { const clip0 = g.animations.find((x) => /float/i.test(x.name)) || g.animations[0]; if (clip0) { const mx0 = new T.AnimationMixer(m); mx0.clipAction(clip0).play(); mx0.update(0); } }
        m.updateMatrixWorld(true); const bx = new T.Box3().setFromObject(m, true) /* skinned: real posed size */, sz = bx.getSize(new T.Vector3()), cn = bx.getCenter(new T.Vector3()), s = (window.WB_WORK_ASTRO_H || +(root.getAttribute('data-astro-h') || 5.4)) / Math.max(1e-6, sz.y); /* data-astro-h: his height in scene units */
        m.scale.setScalar(s); m.position.set(-cn.x * s, -cn.y * s, -cn.z * s);
        const waitM = new T.MeshStandardMaterial({ color: 0xd6d4cf, metalness: 1, roughness: 0.32, envMapIntensity: 1.2, side: T.DoubleSide }); m.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.material = waitM; } }); window.__wbWorkAstro = { m, bx: bx.getSize(new T.Vector3()).toArray(), s };
        /* data-look="glass" on [data-wb-work]: the shared About glass (wb-glass.js, options as data attributes on [data-wb-work]) */
        const WAT = (k, d) => root.getAttribute('data-' + k) ?? d;
        const glassA = WAT('look', '') === 'glass' && window.WBGlass ? WBGlass(T, sc, r, WAT) : new T.MeshPhysicalMaterial({ color: 0x15161a, metalness: 0.05, roughness: 0.0, transmission: 1, thickness: 1.4, ior: 1.5, dispersion: window.WB_WORK_DISPERSION ?? 6, attenuationColor: new T.Color(0x0a0a0d), attenuationDistance: 1.2,
          flatShading: true, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.6, specularIntensity: 1, side: T.FrontSide });
        m.traverse((o) => { if (o.isMesh) o.material = glassA; });

        const clip = g.animations.find((a) => /float/i.test(a.name)) || g.animations[0]; if (clip) { mixer = new T.AnimationMixer(m); mixer.clipAction(clip).play(); } },
        undefined, (e) => console.warn('[work] astronaut failed', e)); }
    /* input → infinite offset with inertia + soft snap */
    const MS = { x: 0, y: 0, tx: 0, ty: 0 }; addEventListener('pointermove', (e) => { MS.tx = e.clientX / innerWidth * 2 - 1; MS.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    let vel = 0, ov = 0, off = 0, tgt = 0, idleT = 0, assigned = -1, hovered = null;
    const SC = window.WB_WORK_SCROLL || +(root.getAttribute('data-wb-work-speed') || 1);
    const nudge = (d) => { tgt += d * SC; idleT = performance.now(); };
    root.addEventListener('wheel', (e) => { e.preventDefault(); nudge(Math.max(-1, Math.min(1, (e.deltaY + e.deltaX) * (e.deltaMode === 1 ? 0.09 : 0.0032)))); }, { passive: false });
    let ty = null; root.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchmove', (e) => { if (ty == null) return; const y = e.touches[0].clientY; nudge((ty - y) * 0.013); ty = y; e.preventDefault(); }, { passive: false });
    root.addEventListener('touchend', () => { ty = null; });
    addEventListener('keydown', (e) => { if (e.target && e.target.matches && e.target.matches('input,textarea')) return; if (/ArrowDown|ArrowRight|PageDown/.test(e.key)) { tgt = Math.round(tgt) + 1; } if (/ArrowUp|ArrowLeft|PageUp/.test(e.key)) { tgt = Math.round(tgt) - 1; } });
    const pv = document.querySelector('[data-wb-work-prev]'), nx = document.querySelector('[data-wb-work-next]'), cur = document.querySelector('[data-wb-work-current]');
    pv && pv.addEventListener('click', (e) => { e.preventDefault(); tgt = Math.round(tgt) - 1; }); nx && nx.addEventListener('click', (e) => { e.preventDefault(); tgt = Math.round(tgt) + 1; });
    const ray = new T.Raycaster(), nd = new T.Vector2();
    const pick = (e) => { const b = r.domElement.getBoundingClientRect(); nd.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(nd, cam); const h = ray.intersectObjects(slots.map((s) => s.mesh), false)[0]; return h ? slots.find((s) => s.mesh === h.object) : null; };
    let pmE = null; r.domElement.addEventListener('pointermove', (e) => { pmE = e; }); const doHover = (e) => { hovered = pick(e); if (hovered) { const h = ray.intersectObject(hovered.mesh, false)[0]; if (h && h.uv) hovered.m.uniforms.uMouse.value.copy(h.uv); } r.domElement.style.cursor = hovered ? 'pointer' : ''; };
    let down = null; r.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    r.domElement.addEventListener('click', (e) => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const s = pick(e); if (!s || !s.it) return;
      if (Math.abs(s.s) > 0.5) { tgt = Math.round(tgt) + Math.round(s.s); return; } /* side card: bring it to the front */
      if (s.it.href) { if (window.wbSwapGo) wbSwapGo(s.it.href, e.clientX, e.clientY); else if (window.wbInkGo) wbInkGo(s.it.href, e.clientX, e.clientY); else location.href = s.it.href; } });
    const size = () => { const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 0.8 ? 46 : 32; cam.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(stage);
    let last = performance.now(), lastCur = '';
    const tick = (now) => { requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (window.__wbWorkPaused || !root.isConnected || root.offsetParent === null && getComputedStyle(root).position !== 'fixed') return; if (root.style.display === 'none' || root.closest('[data-wb-hidden]')) return;
      /* data-auto="0.08" (cards per second): after 2.5 s without input the helix drifts on by itself, easing in; hover pauses it, any input takes over */
      const AUTO = +(root.getAttribute('data-auto') || 0), idl = now - idleT, ramp = Math.max(0, Math.min(1, (idl - 2500) / 2000));
      if (AUTO && !hovered && ramp > 0) tgt += AUTO * dt * ramp * ramp * (3 - 2 * ramp);
      else if (idl > 280) tgt += (Math.round(tgt) - tgt) * (1 - Math.exp(-dt * 3)); /* settle on a card */
      if (pmE) { doHover(pmE); pmE = null; }
      const pOff = off; { const k = 70, dmp = 2 * Math.sqrt(k); ov += ((tgt - off) * k - ov * dmp) * dt; off += ov * dt; } vel += (Math.max(-6, Math.min(6, (off - pOff) / Math.max(dt, 1e-3) * 1.6)) - vel) * (1 - Math.exp(-dt * 6));
      const N = list.length, base = Math.floor(off);
      slots.forEach((s, i) => { const k0 = base - NS / 2, k = k0 + ((((i - k0) % NS) + NS) % NS); const sv = k - off; s.s = sv; const idx = ((k % N) + N) % N, it = list[idx];
        if (s.it !== it) { s.it = it; s.m.uniforms.uTex.value = null; s.m.uniforms.uOp.value = 0; getTex(it).then((t) => { if (s.it === it) s.m.uniforms.uTex.value = t; }); }
        const a = sv * dA, y = -sv * PITCH, front = 1 - ss(Math.abs(sv) / 1.2), fade = 1 - ss((Math.abs(sv) - 3.2) / 1.4), U = s.m.uniforms;
        s.grp.position.set(Math.sin(a) * R, y, Math.cos(a) * R); s.grp.rotation.set(0, a, 0);
        const hv = hovered === s ? 1 : 0; U.uHover.value += (hv - U.uHover.value) * (1 - Math.exp(-dt * 8)); U.uTime.value = now / 1000; U.uVel.value = vel;
        s.grp.scale.setScalar(0.86 + 0.14 * front);
        const op = U.uTex.value ? fade : 0; U.uOp.value += (op - U.uOp.value) * (1 - Math.exp(-dt * 8)); U.uDim.value = ss((Math.abs(sv) - 0.6) / 3.2) * 0.85; s.grp.visible = U.uOp.value > 0.01; s.mesh.renderOrder = Math.round(10 - Math.abs(sv)); });
      const fi = list[((Math.round(off) % N) + N) % N]; if (cur && fi && fi.title !== lastCur) { lastCur = fi.title; cur.textContent = (((Math.round(off) % N) + N) % N + 1) + '. ' + fi.title; }
      GU.uT.value = now / 1000; GU.uOff.value = off; GU.uRot.value = -off * dA * 0.25; GU.uV.value = vel; GU.neb.position.x = Math.sin(now / 9000) * 0.6; GU.neb.position.y = Math.sin(off * 0.05) * 0.4;
      { const k = 1 - Math.exp(-dt * 2.2); MS.x += (MS.tx - MS.x) * k; MS.y += (MS.ty - MS.y) * k; }
      gal.rotation.y = MS.x * 0.12; gal.rotation.x = MS.y * 0.06; gal.position.x = MS.x * 0.25; gal.position.y = -MS.y * 0.18; GU.neb.position.x += -MS.x * 0.5;
      pivot.rotation.y = -off * dA + MS.x * 0.28; pivot.rotation.x = MS.y * 0.1; pivot.position.x = MS.x * 0.12; pivot.position.y = Math.sin(now / 2200) * 0.05 - MS.y * 0.08 + +(root.getAttribute('data-astro-y') || 0); /* data-astro-y: move him up (+) or down (-) */ pivot.position.z = -0.4; if (mixer) mixer.update(dt);
      
      cam.position.set(0, 0.35, R + 7.6); cam.lookAt(0, 0, 0);
      if (!r.domElement.isConnected) { const s2 = document.querySelector('[data-wb-work-stage]'); if (s2) s2.appendChild(r.domElement); } /* the page re-rendered its stage (DC/Webflow re-mount): re-attach the canvas */
      if (!(window.__wbInkBusy && window.__wbInkCov > 0.45 && !window.__wbWorkWarm)) { r.render(sc, cam); window.__wbWorkFrames = (window.__wbWorkFrames || 0) + 1; } };
    applyFilter(); requestAnimationFrame(tick); window.__wbWorkReady = 1;
  };
  boot().catch((e) => console.warn('[work] failed', e));
})();
