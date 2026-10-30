/* Wubble V22: Reach hand — chrome look from miroleon "Fractal Glass Distortion" pen:
   metal 1 / rough 0.2 + surface-imperfection roughness map, gradient HDR env, FogExp2,
   AfterimagePass + UnrealBloomPass + fractal-glass displacement pass. */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  async createChromeHand(host, url, P) {
    const B = 'https://esm.sh/three@0.186.1', E = B + '/examples/jsm/';
    const [T, GL, RG, EC, RP, SP, AP, UB, OP] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'loaders/RGBELoader.js'), import(E + 'postprocessing/EffectComposer.js'), import(E + 'postprocessing/RenderPass.js'), import(E + 'postprocessing/ShaderPass.js'), import(E + 'postprocessing/AfterimagePass.js'), import(E + 'postprocessing/UnrealBloomPass.js'), import(E + 'postprocessing/OutputPass.js')]);
    const r = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(P.maxPR || 2, devicePixelRatio || 1)); r.setClearColor(0x000000, 1); r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.75; r.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(45, 1, 0.1, 1000);
    const hdr = await new RG.RGBELoader().loadAsync('./models/hand-grad.hdr'); hdr.mapping = T.EquirectangularReflectionMapping; scene.environment = hdr;
    scene.fog = new T.FogExp2(0x000000, P.fog ?? 0.28);
    const surf = new T.TextureLoader().load('./models/hand-surf.jpg'); surf.wrapS = surf.wrapT = T.RepeatWrapping;
    const mat = new T.MeshPhysicalMaterial({ color: 0x606060, roughness: 0.2, metalness: 1, roughnessMap: surf, envMap: hdr, envMapIntensity: 1.1 });
    // key light for the existing "ray lands on the hand" logic (it swings + brightens _handLights[0])
    const key = new T.DirectionalLight(0xffffff, 0.35); key.position.set(-1.2, 2, 2); scene.add(key);
    const g = await new GL.GLTFLoader().loadAsync(url); const raw = g.scene;
    raw.traverse((o) => { if (o.isMesh) { o.material = mat; o.frustumCulled = false; } });
    const bb = new T.Box3().setFromObject(raw), sph = bb.getBoundingSphere(new T.Sphere()), k = 1.15 / (sph.radius || 1);
    raw.scale.setScalar(k); raw.position.copy(sph.center).multiplyScalar(-k);
    const model = new T.Group(); model.add(raw); scene.add(model);
    cam.position.set(0, 0, 3); cam.lookAt(0, 0, 0);
    const comp = new EC.EffectComposer(r); comp.addPass(new RP.RenderPass(scene, cam));
    const after = new AP.AfterimagePass(); after.uniforms.damp.value = 0.9; comp.addPass(after);
    const bloom = new UB.UnrealBloomPass(new T.Vector2(256, 256), 0.55, 0.5, 0.55); comp.addPass(bloom);
    const glassTex = new T.TextureLoader().load('./models/hand-glass.jpg', (t) => { t.minFilter = T.NearestFilter; });
    const glass = new SP.ShaderPass({ uniforms: { tDiffuse: { value: null }, displacement: { value: glassTex }, scale: { value: 0.012 }, tileFactor: { value: 6 }, uOn: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse, displacement; uniform float scale, tileFactor, uOn; varying vec2 vUv; void main(){ vec2 uv = vUv; if (uOn > 0.5) { vec2 tUv = mod(vUv * tileFactor, 1.0); uv = vUv + texture2D(displacement, tUv).rg * scale; } gl_FragColor = texture2D(tDiffuse, uv); }' });
    comp.addPass(glass); comp.addPass(new OP.OutputPass());
    const c = r.domElement; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c);
    const size = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; r.setSize(w, h, false); comp.setSize(w, h); bloom.resolution.set(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(size); ro.observe(host);
    const post = { uExposure: { value: 1 }, uDissolve: { value: 0 } };
    const self = { scene, renderer: r, model, post, ro, glass, bloom, after,
      frame: () => { const Q = self.opts || {}; glass.uniforms.uOn.value = Q.glass === false ? 0 : 1; bloom.strength = Math.min(1, Q.bloom ?? 0.55); after.uniforms.damp.value = Q.trail ?? 0.9; r.toneMappingExposure = Q.exposure ?? 0.75; comp.render(); } };
    self.opts = P; r.setAnimationLoop(self.frame); return self;
  }
});
