/* Wubble V22 footer: real 3D lunar landscape (refs: crater plain, Earthrise, blue horizon).
   Procedural crater terrain (bowls + raised rims, rolling hills, far ridges), low raking sunlight,
   blue horizon fog, Earth rising behind the ridge. Sky is transparent → the site's star field shows through. */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  ftTerrain(ft, p) {
    const S = this._ter;
    if (!S) { if (!this._terBoot) { this._terBoot = 1; this.bootTerrain(ft).catch((e) => console.warn('terrain failed', e)); } return; }
    S.host.style.display = ''; S.glow.style.display = '';
    const P = this.props, sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    const e = 1 - Math.pow(1 - sm(0, 0.9, p), 3);
    S.host.style.opacity = sm(0, 0.25, p).toFixed(3); S.glow.style.opacity = (sm(0.1, 0.6, p) * 0.9).toFixed(3);
    if (p < 0.005) return;
    const now = performance.now(), dt = Math.min(0.05, (now - (S.last || now)) / 1000); S.last = now; S.t += dt;
    // descend onto the surface while the footer comes in, then drift very slowly
    const cz = 26 - 8 * e + Math.sin(S.t * 0.05) * 0.6, cy = 16 - 10 * e + (P.footerTerrainCamY ?? 0);
    S.mx += ((S.ms.x * 1.2) - S.mx) * (1 - Math.exp(-dt * 2));
    S.cam.position.set(S.mx, cy + S.H(S.mx, cz), cz); S.cam.lookAt(S.mx * 0.5, S.H(0, cz - 40) + 2 + (P.footerTerrainLook ?? 0), cz - 60);
    S.earth.rotation.y += dt * 0.02;
    // ground point the astronaut stands on (screen centre, a few metres ahead)
    const D = P.footerTerrainStand ?? 16, gz = cz - D; S.v.set(0, S.H(0, gz), gz).project(S.cam); S.v.y = Math.max(-0.85, Math.min(0.2, S.v.y)); window.__wbMoonTop = S.v.y;
    S.r.render(S.sc, S.cam);
  },
  async bootTerrain(ft) {
    const T = await import('https://esm.sh/three@0.186.1');
    const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;';
    const glow = document.createElement('div'); glow.setAttribute('aria-hidden', 'true'); glow.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:70%;z-index:0;pointer-events:none;background:radial-gradient(120% 55% at 50% 72%,rgba(40,110,220,0.55) 0%,rgba(20,60,140,0.25) 35%,rgba(0,0,0,0) 70%);';
    ft.insertBefore(glow, ft.firstChild); ft.appendChild(host);
    const r = new T.WebGLRenderer({ antialias: (devicePixelRatio || 1) < 1.5, alpha: true }); r.setPixelRatio(Math.min(1.25, devicePixelRatio || 1)); r.setClearColor(0, 0);
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    r.domElement.addEventListener('webglcontextlost', (ev) => ev.preventDefault());
    const c = r.domElement; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c);
    // ---- height field ----
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const hs = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hs(xi, yi), b = hs(xi + 1, yi), c2 = hs(xi, yi + 1), d = hs(xi + 1, yi + 1); return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v; };
    const fbm = (x, y) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vn(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };
    const CELL = 8, grid = new Map(), key = (i, j) => i * 10007 + j;
    for (let n = 0; n < 1400; n++) { const z = -rnd() * 240 + 20, x = (rnd() * 2 - 1) * (30 + Math.abs(z) * 1.1), rr = 0.25 + 9 * Math.pow(rnd(), 5);
      const C = { x, z, r: rr, d: rr * (0.18 + rnd() * 0.1) };
      for (let i = Math.floor((x - rr * 1.6) / CELL); i <= Math.floor((x + rr * 1.6) / CELL); i++) for (let j = Math.floor((z - rr * 1.6) / CELL); j <= Math.floor((z + rr * 1.6) / CELL); j++) { const k = key(i, j); (grid.get(k) || grid.set(k, []).get(k)).push(C); } }
    const H = (x, z) => {
      let h = (fbm(x * 0.035, z * 0.035) - 0.5) * 2.2 + (fbm(x * 0.2, z * 0.2) - 0.5) * 0.25;
      const far = Math.max(0, Math.min(1, (-z - 70) / 120)); h += far * far * (fbm(x * 0.012 + 3, z * 0.02) * 26 - 6);
      const L = grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
      if (L) for (const C of L) { const dx = x - C.x, dz = z - C.z, d = Math.sqrt(dx * dx + dz * dz) / C.r; if (d > 1.6) continue;
        if (d < 1) h += -C.d * (1 - d * d) + C.d * 0.35 * d * d * d * d; else h += C.d * 0.35 * Math.exp(-Math.pow((d - 1) / 0.22, 2)); }
      return h; };
    // ---- mesh: rows denser near the camera, widening with distance ----
    const NX = 260, NZ = 220, pos = new Float32Array(NX * NZ * 3), col = new Float32Array(NX * NZ * 3);
    for (let j = 0; j < NZ; j++) { const t = j / (NZ - 1), z = 18 - Math.pow(t, 1.9) * 250, half = 16 + Math.abs(z - 18) * 1.25;
      for (let i = 0; i < NX; i++) { const x = (i / (NX - 1) * 2 - 1) * half, h = H(x, z), k = (j * NX + i) * 3; pos[k] = x; pos[k + 1] = h; pos[k + 2] = z;
        const g = 0.36 + (fbm(x * 0.08 + 9, z * 0.08) - 0.5) * 0.22 + (hs(Math.floor(x * 6), Math.floor(z * 6)) - 0.5) * 0.05; col[k] = g * 0.98; col[k + 1] = g; col[k + 2] = g * 1.04; } }
    const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6); let q = 0;
    for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c3 = a + NX, d = c3 + 1; idx[q++] = a; idx[q++] = c3; idx[q++] = b; idx[q++] = b; idx[q++] = c3; idx[q++] = d; }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.setIndex(new T.BufferAttribute(idx, 1)); geo.computeVertexNormals();
    const ground = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 })); ground.frustumCulled = false;
    const sc = new T.Scene(); sc.add(ground); sc.fog = new T.FogExp2(0x10223f, 0.0075);
    const sun = new T.DirectionalLight(0xfff1e0, 5.2); sun.position.set(-80, 22, -10); sc.add(sun);
    const sky = new T.HemisphereLight(0x7f9bd6, 0x08080a, 0.42); sc.add(sky);
    // Earth: ocean + clouds, lit by the same sun, rising behind the far ridge
    const earth = new T.Mesh(new T.SphereGeometry(16, 64, 48), new T.ShaderMaterial({ fog: false, uniforms: { L: { value: new T.Vector3(-1, 0.25, 0.3).normalize() } },
      vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix) * normal); vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 L; varying vec3 vN; varying vec3 vP; float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); } float n(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); } float fb(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*n(p); p*=2.1; a*=0.5; } return s; } void main(){ vec3 p = normalize(vP) * 3.0; float land = smoothstep(0.52,0.56,fb(p*0.9)); float cl = smoothstep(0.5,0.75,fb(p*1.6+vec3(4.0))); vec3 c = mix(vec3(0.04,0.14,0.34), vec3(0.22,0.26,0.2), land); c = mix(c, vec3(0.95), cl); float d = max(0.0, dot(normalize(vN), L)); float rim = pow(1.0 - abs(normalize(vN).z), 3.0); gl_FragColor = vec4(c * (0.03 + 1.25 * d) + vec3(0.25,0.5,1.0) * rim * 0.35 * smoothstep(-0.2,0.4,dot(normalize(vN),L)), 1.0); }' }));
    earth.position.set(22, 40, -300); sc.add(earth);
    const cam = new T.PerspectiveCamera(38, 1, 0.1, 1000);
    const size = () => { const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(host);
    const ms = { x: 0 }; addEventListener('pointermove', (ev) => { ms.x = ev.clientX / innerWidth * 2 - 1; }, { passive: true });
    // user's lunar landscape model replaces the procedural ground (mountains on the far side, crater plain in front)
    let HH = H;
    try { const { GLTFLoader } = await import('https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js'); const lg = await new GLTFLoader().loadAsync('./models/lunar-landscape.glb');
      const SC = this.props.footerTerrainScale ?? 140, land = lg.scene; land.scale.setScalar(SC); land.position.set(0, -SC * 0.035, 30 - SC * 0.4612);
      const lm = new T.MeshStandardMaterial({ color: 0x77777b, roughness: 1, metalness: 0 });
      lm.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); } float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hh(i), hh(i+vec2(1,0)), f.x), mix(hh(i+vec2(0,1)), hh(i+vec2(1,1)), f.x), f.y); }')
          .replace('#include <map_fragment>', '#include <map_fragment>\n{ vec2 q = vWp.xz; float n = vn(q*0.08)*0.5 + vn(q*0.35)*0.3 + vn(q*2.1)*0.2; diffuseColor.rgb *= 0.55 + 0.7 * n; }'); };
      land.traverse((o) => { if (o.isMesh) { o.geometry.computeVertexNormals(); o.material = lm; o.frustumCulled = false; } }); sc.remove(ground); geo.dispose(); sc.add(land); land.updateMatrixWorld(true);
      const rc = new T.Raycaster(), dn = new T.Vector3(0, -1, 0), o3 = new T.Vector3(), cache = new Map();
      HH = (x, z) => { const k = Math.round(x * 4) + ':' + Math.round(z * 4); if (cache.has(k)) return cache.get(k); o3.set(x, 500, z); rc.set(o3, dn); const hit = rc.intersectObject(land, true)[0]; const h = hit ? hit.point.y : 0; if (cache.size > 4000) cache.clear(); cache.set(k, h); return h; };
    } catch (e) { console.warn('lunar model failed, using procedural ground', e); }
    this._ter = { r, sc, cam, earth, host, glow, H: HH, v: new T.Vector3(), ms, mx: 0, t: 0 };
  }
});
