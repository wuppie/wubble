/* Wubble V22: hero clouds, WebGL version (mrdoob "Live clouds" pen look). One context; back/front layers copied into 2D canvases. */
(() => {
  const VS = 'varying vec2 vUv; varying float vD; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }';
  const FS = `uniform sampler2D map; uniform vec3 fogColor; uniform float fogNear, fogFar, uSplit, uFront, uOp; varying vec2 vUv; varying float vD;
    void main(){ float depth = gl_FragCoord.z / gl_FragCoord.w; float fogFactor = smoothstep(fogNear, fogFar, depth);
      vec4 c = texture2D(map, vUv); c.w *= exp(-20.0 / max(vD, 0.5)); /* = pow(depth,20) of the pen, but precise on mobile GPUs */ c = mix(c, vec4(fogColor, c.w), fogFactor);
      float near = 1.0 - smoothstep(uSplit * 0.85, uSplit * 1.15, vD); c.w *= uOp * mix(1.0 - near, near, uFront);
      if (c.w < 0.002) discard; gl_FragColor = c; }`;
  window.__wbCloudsGL = async (back, front) => {
    const [T, BU] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js')]);
    const tex = await new T.TextureLoader().loadAsync((window.WB_ASSETS || './') + 'models/cloud10.png'); tex.colorSpace = T.SRGBColorSpace; tex.magFilter = T.LinearFilter; tex.minFilter = T.LinearMipMapLinearFilter;
    const N = (matchMedia('(pointer: coarse)').matches || innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4) ? 3200 : 8000, pg = new T.PlaneGeometry(64, 64), o = new T.Object3D(), gs = [];
    for (let i = 0; i < N; i++) { o.position.set(Math.random() * 1000 - 500, -Math.random() * Math.random() * 200 - 15, i * 8000 / N); /* r14.25: spread over the full 8000 depth — with N=3200 (phones) the clouds sat 4800+ away, past the 3000 far plane, and only drifted into view after ~10 s */ o.rotation.z = Math.random() * Math.PI; o.scale.x = o.scale.y = Math.random() * Math.random() * 1.5 + 0.5; o.updateMatrix(); const g = pg.clone(); g.applyMatrix4(o.matrix); gs.push(g); }
    const geo = BU.mergeGeometries(gs); gs.length = 0;
    const cam = new T.PerspectiveCamera(30, innerWidth / innerHeight, 1, 3000);
    let r = null, offT = 0; const PRV = ((matchMedia('(pointer: coarse)').matches || innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4) ? 0.5 : 0.75);
    // the clouds' WebGL context only exists while the hero is visible: released after 1.5 s off screen so it never evicts the slider/astronaut
    const mkR = () => { r = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' }); r.setClearColor(0, 0); r.setPixelRatio(PRV); r.setSize(innerWidth, innerHeight, false); r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); for (const l of L) { l.c.width = r.domElement.width; l.c.height = r.domElement.height; } };
    const dropR = () => { if (!r) return; try { r.dispose(); r.forceContextLoss(); } catch (e) {} r = null; };
    const layer = (host, isFront) => { const c = document.createElement('canvas'), g2 = c.getContext('2d'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c);
      const U = { map: { value: tex }, fogColor: { value: new T.Color(0xffffff) }, fogNear: { value: -100 }, fogFar: { value: 3000 }, uSplit: { value: 200 }, uFront: { value: isFront ? 1 : 0 }, uOp: { value: 1 } };
      const mat = new T.ShaderMaterial({ precision: 'highp',  uniforms: U, vertexShader: VS, fragmentShader: FS, depthWrite: false, depthTest: false, transparent: true });
      const sc = new T.Scene(), a = new T.Mesh(geo, mat), b = new T.Mesh(geo, mat); a.renderOrder = 2; b.position.z = -8000; b.renderOrder = 1; a.frustumCulled = b.frustumCulled = false; sc.add(a, b);
      return { c, g2, U, sc }; };
    const L = [layer(back, false), layer(front, true)];
    const size = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); if (r) { r.setSize(innerWidth, innerHeight, false); for (const l of L) { l.c.width = r.domElement.width; l.c.height = r.domElement.height; } } };
    size(); addEventListener('resize', size);
    let mx = 0, my = 0; addEventListener('pointermove', (e) => { mx = (e.clientX - innerWidth / 2) * 0.25; my = (e.clientY - innerHeight / 2) * 0.15; }, { passive: true });
    let pos = 0, last = performance.now(), lastRP = 0, wasOn = true;
    const tick = () => { requestAnimationFrame(tick); const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const P = window.__wbClouds || {}, rp = window.__wbRP || 0, sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
      const LG = P.linger ?? 1.8, op = P.on === false ? 0 : (P.amount ?? 1) * (1 - sm((P.hs ?? 0.04) + (P.hw ?? 0.16) * 0.35 * LG, (P.hs ?? 0.04) + (P.hw ?? 0.16) * (1 + 0.6 * LG), rp)); /* r14.12: clouds stay longer */
      back.style.opacity = front.style.opacity = op.toFixed(3);
      if (op < 0.003) { offT += dt; } else { offT = 0; if (!r) mkR(); }
      if (op < 0.003 || !r || r.getContext().isContextLost() || !r.domElement.width || !r.domElement.height) { lastRP = rp; if (wasOn) { for (const l of L) l.g2.clearRect(0, 0, l.c.width, l.c.height); wasOn = false; } return; } wasOn = true;
      pos = (pos + dt * 30 * (P.speed ?? 1) + (window.__wbAscend ? 0 : Math.max(0, rp - lastRP) * 1400)) % 8000; lastRP = rp;
      cam.position.x += (mx - cam.position.x) * 0.01; const ty = window.__wbAscend ? -300 + sm(0, (P.hs ?? 0.04) + (P.hw ?? 0.16), rp) * 520 - my * 0.3 : -my; cam.position.y += (ty - cam.position.y) * (window.__wbAscend ? 0.12 : 0.01); cam.position.z = -pos + 8000;
      for (const l of L) { l.U.fogColor.value.set(P.fog || '#ffffff'); l.U.uSplit.value = P.split ?? 200; l.U.uOp.value = l === L[1] ? (P.front ?? 0.4) : 1; r.render(l.sc, cam); l.g2.clearRect(0, 0, l.c.width, l.c.height); l.g2.drawImage(r.domElement, 0, 0); } };
    tick();
  };
})();
