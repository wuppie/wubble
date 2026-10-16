/* Wubble V22 module: astro — methods mixed into the page component */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  // baked texture set (transferred from the textured Meshy mesh onto the rig's triangles: models/astro-rig-uv.bin)
  astroTexMat(T3) {
    if (!window.__wbAstroTex) window.__wbAstroTex = (async () => {
      const [uv, ...img] = await Promise.all([fetch((window.WB_ASSETS || './') + 'models/astro-rig-uv.bin').then((r) => r.arrayBuffer()), ...['color', 'mr', 'normal'].map((n) => new T3.TextureLoader().loadAsync((window.WB_ASSETS || './') + 'models/astro-tex-' + n + ((matchMedia('(pointer: coarse)').matches || innerWidth < 820 || (navigator.deviceMemory || 8) <= 4) ? '-1k' : '-2k') + '.webp'))]);
      img[0].colorSpace = T3.SRGBColorSpace; img.forEach((t) => { t.anisotropy = 4; });
      return { uv: new Uint16Array(uv), map: img[0], mr: img[1], nm: img[2] };
    })();
    return window.__wbAstroTex;
  },
  async applyAstroTex(T3, mesh, opts) {
    const X = await this.astroTexMat(T3); const geo = mesh.geometry;
    if (!geo.userData.texUV) { const g2 = geo.index ? geo.toNonIndexed() : geo; if (g2.attributes.position.count * 2 !== X.uv.length) { console.warn('astro tex: vertex count mismatch'); return null; } g2.setAttribute('uv', new T3.BufferAttribute(X.uv, 2, true)); g2.userData.texUV = 1; mesh.geometry = g2; }
    return new T3.MeshStandardMaterial(Object.assign({ map: X.map, metalnessMap: X.mr, roughnessMap: X.mr, normalMap: X.nm, metalness: 1, roughness: 1, envMapIntensity: 1 }, opts || {}));
  },
  async initAstroGlobal() {
    const box = this.astroGRef.current; if (!box) return;
    let T3, GL, MO;
    try { [T3, GL, MO] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')]); } catch (e) { return; }
    if (this.dead) return;
    const r = new T3.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', });
    r.outputColorSpace = T3.SRGBColorSpace; r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = 1.05 * (this.props.astroBright ?? 2.2);
    r.setClearColor(0x000000, 0); r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    // if the browser drops this context (too many 3D views), reload the astronaut instead of leaving him frozen
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); console.warn('[astro] context lost'); });
    r.domElement.addEventListener('webglcontextrestored', () => { this._astroRestored = 1; clearTimeout(this._astroLostT); console.warn('[astro] context restored'); });
    box.appendChild(r.domElement);
    const SHD = this.props.astroShadows ?? true;
    if (SHD) { r.shadowMap.enabled = true; r.shadowMap.type = T3.PCFSoftShadowMap; }
    const sc = new T3.Scene();
    const key = new T3.DirectionalLight(0xfff6ee, 2.2); key.position.set(2.8, 1.3, 0.9); sc.add(key);
    if (SHD) { const lp = this.lowPower; key.castShadow = true; key.shadow.mapSize.set(lp ? 512 : 1024, lp ? 512 : 1024);
      const scm = key.shadow.camera; scm.left = -1.6; scm.right = 1.6; scm.top = 1.6; scm.bottom = -1.6; scm.near = 0.1; scm.far = 12; scm.updateProjectionMatrix();
      key.shadow.bias = -0.0004; key.shadow.normalBias = 0.012; key.shadow.intensity = 1; key.shadow.radius = this.props.astroShadowSoft ?? 6; key.shadow.blurSamples = 16; }
    const rim = new T3.DirectionalLight(0xdfe8ff, 2.4); rim.position.set(-2.6, 1.8, -2.0); sc.add(rim);
    const fil = new T3.DirectionalLight(0xc8d4e6, 0.45); fil.position.set(-1.8, -0.6, 1.6); sc.add(fil);
    const hemiA = new T3.HemisphereLight(0xcfd8e8, 0x050506, 0.25); sc.add(hemiA);
    const softA = new T3.DirectionalLight(0xffffff, 0); softA.position.set(0.3, 2.6, 3.4); sc.add(softA);
    const fillA = new T3.DirectionalLight(0xffffff, 0); fillA.position.set(-2.2, 0.4, 2.0); sc.add(fillA);
    try { const RE = await import('https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js'); const pm = new T3.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; } catch (e) {}
    const cam = new T3.PerspectiveCamera(24, 1, 0.1, 50); cam.position.set(0, 0, 4.2);
    const loader = new GL.GLTFLoader(); loader.setMeshoptDecoder(MO.MeshoptDecoder);
    try { const DL = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js'); const dl = new DL.DRACOLoader(); dl.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); loader.setDRACOLoader(dl); } catch (e) {}
    let g; const aUrl = (this.props.astroModel || '').trim() || ((this.props.astroRig ?? true) ? (this.props.astroRigUrl || (window.WB_ASSETS || './') + 'models/astronaut-rig.glb') : 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/Meshy_AI_Character_output-compressed.glb');
    try { g = await this.loadGLB(loader, aUrl); } catch (e) { console.warn('astronaut failed', e); return; }
    if (this.dead) return;
    const m = g.scene;
    { const bn = []; m.traverse((o) => { if (o.isBone) bn.push(o.name); }); console.log('[astro] model', aUrl.split('/').pop(), '| bones', bn.length, bn.join(','), '| clips', (g.animations || []).map((a) => a.name + ' ' + a.duration.toFixed(1) + 's').join(', ') || 'none'); }
    m.traverse((o) => { if (o.isMesh && o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); });
    // native Mixamo clips on a Mixamo rig: play them directly (no retargeting); scroll picks + crossfades the clip
    const NATIVE = !!(g.animations || []).find((a) => a.name === 'floating') && (this.props.astroNative ?? true);
    let MX = null; const ACT = {};
    if (NATIVE) { MX = new T3.AnimationMixer(m);
      const hpT = (c) => c && c.tracks.find((tr) => /Hips\.position$/.test(tr.name)), F0 = hpT(g.animations.find((a) => a.name === 'floating')), fx = F0 ? F0.values[0] : 0, fy = F0 ? F0.values[1] : 0, fz = F0 ? F0.values[2] : 0;
      // every clip keeps the floating clip's hip anchor: no horizontal travel, same height, only its own up/down motion
      const flat = (c) => { const tr = hpT(c); if (!tr || !F0) return; const v = tr.values, dy = fy - v[1]; for (let i = 0; i < v.length; i += 3) { v[i] = fx; v[i + 1] += dy; v[i + 2] = fz; } };
      for (const c of g.animations) { if (c.name !== 'floating') flat(c); const a = MX.clipAction(c); a.play(); a.setEffectiveWeight(c.name === 'floating' ? 1 : 0); ACT[c.name] = a; }
      for (const n of ['wave', 'tumble', 'look', 'sit', 'hang', 'drop', 'walk']) { const J = (window.WB_CLIPS || {})[n]; if (!J || ACT[n]) continue; const c = T3.AnimationClip.parse(J); c.uuid = T3.MathUtils.generateUUID(); c.name = n; flat(c); const a = MX.clipAction(c); a.play(); a.setEffectiveWeight(0); if (n === 'sit' || n === 'drop') { a.setLoop(T3.LoopOnce, 1); a.clampWhenFinished = true; } ACT[n] = a; }
      // idle: the uploaded "Falling" loop replaces the old floating clip (same hip anchor, so heights don't jump)
      { const J = (window.WB_CLIPS || {}).fall; if (J && (this.props.astroIdle || 'Falling') === 'Falling' && ACT.floating && !ACT.floating.__fall) { const c = T3.AnimationClip.parse(J); c.uuid = T3.MathUtils.generateUUID(); c.name = 'floating'; flat(c); const w = ACT.floating.getEffectiveWeight(); ACT.floating.stop(); const a = MX.clipAction(c); a.__fall = 1; a.play(); a.setEffectiveWeight(w); ACT.floating = a; } }
      if (ACT.jump) ACT.jump.paused = true; if (ACT.tumble) ACT.tumble.paused = true;
      console.log('[astro] clips', Object.keys(ACT).join(','), 'wave tracks', ACT.wave ? ACT.wave._propertyBindings.filter((b) => b && b.binding && b.binding.node).length + '/' + ACT.wave.getClip().tracks.length : 'none');
      MX.update(0); }
    this._nat = NATIVE;
    // rigged model has no textures: rebuild the original chrome-suit look procedurally (metal + env reflections + micro-roughness noise)
    const CHM = []; this._chm = CHM;
    const TXL = new T3.TextureLoader(), ldT = (u, srgb) => { const t = TXL.load(u); t.wrapS = t.wrapT = T3.RepeatWrapping; if (srgb) t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; return t; };
    const CER = ldT((window.WB_ASSETS || './') + 'models/ceramic.png', true), MTC = ldT((window.WB_ASSETS || './') + 'models/metal012_color.jpg', true), MTR = ldT((window.WB_ASSETS || './') + 'models/metal012_rough.jpg', false); this._tx = { CER, MTC, MTR };
    if (NATIVE) m.traverse((o) => { if (!o.isMesh) return; const P = this.props; const orig = o.material;
      // zone masks from the rig: head weight + direction/distance from the head centre (bind pose) → face vs visor vs suit
      const geo = o.geometry, sk = o.skeleton, N = geo.attributes.position.count, MK = new Float32Array(N * 4), FU = new Float32Array(N * 2);
      if (sk && geo.attributes.skinIndex) {
        const bi = (re) => sk.bones.findIndex((bb) => re.test(bb.name)), bp = (i) => new T3.Vector3().setFromMatrixPosition(sk.boneInverses[i].clone().invert()).applyMatrix4(o.bindMatrixInverse);
        const hI = bi(/Head$/), tI = bi(/HeadTop_End$/), nI = bi(/Neck$/), hipI = bi(/Hips$/), fI = bi(/LeftFoot$/), toI = bi(/LeftToeBase$/);
        if (hI >= 0 && (tI >= 0 || nI >= 0) && hipI >= 0 && fI >= 0 && toI >= 0) {
          const hp = bp(hI), tp = tI >= 0 ? bp(tI) : hp.clone().multiplyScalar(2).sub(bp(nI)), hc = hp.clone().lerp(tp, 0.45), up = tp.clone().sub(bp(hipI)).normalize();
          const fw = bp(toI).sub(bp(fI)); fw.addScaledVector(up, -fw.dot(up)).normalize();
          const SI = geo.attributes.skinIndex, SW = geo.attributes.skinWeight, PS = geo.attributes.position, v = new T3.Vector3(), D = new Float32Array(N); let mx = 0; const rt = new T3.Vector3().crossVectors(up, fw).normalize();
          for (let i = 0; i < N; i++) { let w = 0; for (let c = 0; c < 4; c++) { const j = SI.getComponent(i, c); if (j === hI || j === tI) w += SW.getComponent(i, c); }
            v.fromBufferAttribute(PS, i).sub(hc); const d = v.length(); D[i] = d; if (w > 0.6 && d > mx) mx = d; v.divideScalar(d || 1);
            MK[i * 4] = w; MK[i * 4 + 1] = v.dot(fw); MK[i * 4 + 3] = v.dot(up); FU[i * 2] = v.dot(rt) * d; FU[i * 2 + 1] = v.dot(up) * d; }
          for (let i = 0; i < N; i++) MK[i * 4 + 2] = D[i] / (mx || 1);
          const fs = 2 * (mx || 1) * (P.astroFaceSize ?? 1.07); for (let i = 0; i < N; i++) { FU[i * 2] = 0.5 + FU[i * 2] / fs + (P.astroFaceX ?? 0); FU[i * 2 + 1] = 0.5 + FU[i * 2 + 1] / fs + (P.astroFaceY ?? 0); }
        }
      }
      geo.setAttribute('aMk', new T3.BufferAttribute(MK, 4)); geo.setAttribute('aFU', new T3.BufferAttribute(FU, 2));
      if (!this._faceTex) { this._faceTex = (P.astroFaceTex ?? false) ? new T3.TextureLoader().load((window.WB_ASSETS || './') + 'models/astro-face.png') : new T3.Texture(); this._faceTex.colorSpace = T3.SRGBColorSpace; this._faceTex.anisotropy = 4; }
      const U = { uVR: { value: 0.8 }, uVC: { value: 0.35 }, uCav: { value: 0.7 }, uFace: { value: new T3.Color('#a88672') }, uVis: { value: new T3.Color('#1c1e24') }, uDbg: { value: 0 }, uTex: { value: MTC }, uTexR: { value: MTR }, uTS: { value: 0.004 }, uCer: { value: 1 }, uTC: { value: 2.5 }, uMet: { value: 1 }, uFL: { value: 0.55 }, uFT: { value: 1 }, uFaceTex: { value: this._faceTex } };
      const mt = new T3.MeshStandardMaterial({ color: new T3.Color(P.astroChromeColor || '#c9c9c7'), metalness: P.astroMetal ?? 0.85, roughness: P.astroRough ?? 0.38, side: T3.DoubleSide, envMapIntensity: 1 });
      mt.userData.U = U;
      mt.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aMk; attribute vec2 aFU; varying vec2 vFU; varying vec3 vCP; varying vec4 vMk; varying vec3 vON;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvFU = aFU;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvCP = position; vMk = aMk; vON = normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec2 vFU; varying vec3 vCP; varying vec4 vMk; varying vec3 vON; uniform float uVR, uVC, uCav, uDbg, uTS, uCer, uTC, uMet, uFL, uFT; uniform vec3 uFace, uVis; uniform sampler2D uTex, uTexR, uFaceTex;
vec3 triS(sampler2D tx){ vec3 w = pow(abs(normalize(vON)), vec3(4.0)); w /= (w.x + w.y + w.z); vec3 p = vCP * uTS; return texture2D(tx, p.yz).rgb * w.x + texture2D(tx, p.xz).rgb * w.y + texture2D(tx, p.xy).rgb * w.z; }
vec3 triTex(){ return triS(uTex); }
float ch(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float cn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(mix(ch(i), ch(i+vec3(1,0,0)), f.x), mix(ch(i+vec3(0,1,0)), ch(i+vec3(1,1,0)), f.x), f.y), mix(mix(ch(i+vec3(0,0,1)), ch(i+vec3(1,0,1)), f.x), mix(ch(i+vec3(0,1,1)), ch(i+vec3(1,1,1)), f.x), f.y), f.z); }
float zFront(){ return smoothstep(0.6, 0.9, vMk.x) * smoothstep(uVC, uVC + 0.18, vMk.y); }
float zVisor(){ return zFront() * smoothstep(uVR - 0.05, uVR + 0.05, vMk.z); }
float zFace(){ return zFront() * (1.0 - smoothstep(uVR - 0.05, uVR + 0.05, vMk.z)); }`)
          .replace('#include <color_fragment>', `#include <color_fragment>
float zv = zVisor(), zf = zFace();
diffuseColor.rgb *= mix(0.85 + 0.3 * cn(vCP * 0.5), 1.0, uCer); vec3 ttx = clamp(1.0 - (1.0 - triTex()) * uTC, 0.0, 1.0); diffuseColor.rgb *= mix(vec3(1.0), ttx, uCer * (1.0 - zv));
diffuseColor.rgb = mix(diffuseColor.rgb, uFace, zf); diffuseColor.rgb = mix(diffuseColor.rgb, uVis, zv * 0.85);
float fin = step(0.0, vFU.x) * step(vFU.x, 1.0) * step(0.0, vFU.y) * step(vFU.y, 1.0); float fr = length(vFU - vec2(0.5, 0.47)); vec3 fcol = texture2D(uFaceTex, vFU).rgb; fcol = mix(vec3(0.62), fcol, 0.85) * 1.12; diffuseColor.rgb = mix(diffuseColor.rgb, fcol, uFT * fin * (1.0 - smoothstep(0.36, 0.42, fr)) * smoothstep(0.12, 0.4, vMk.x) * smoothstep(0.0, 0.25, vMk.y));
`)
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nfloat cnz = cn(vCP * 0.35) * 0.6 + cn(vCP * 1.7) * 0.4; roughnessFactor = clamp(roughnessFactor + (cnz - 0.5) * 0.35, 0.05, 1.0); roughnessFactor = mix(roughnessFactor, mix(mix(0.3, 0.42, cnz), clamp(triS(uTexR).r * 1.6 + 0.12, 0.08, 1.0), uMet), uCer * (1.0 - zv)); roughnessFactor = mix(roughnessFactor, 0.62, zf); roughnessFactor = mix(roughnessFactor, 0.06, zv);')
          .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, uMet, uCer); metalnessFactor = mix(metalnessFactor, 0.0, zf); metalnessFactor = mix(metalnessFactor, 1.0, zv);')
          .replace('#include <aomap_fragment>', `#include <aomap_fragment>
// inner shadows: crease/cavity darkening from normal curvature + darker undersides
float cav = clamp(length(fwidth(normal)) * 6.0, 0.0, 1.0);
float occ = 1.0 - uCav * (0.75 * smoothstep(0.05, 0.6, cav) + 0.25 * smoothstep(0.2, -0.8, normal.y));
occ = mix(occ, 1.0, zf * 0.6);
{ float hf = smoothstep(0.45, 0.8, vMk.x) * smoothstep(-0.3, 0.2, vMk.y); reflectedLight.directSpecular *= 1.0 - 0.85 * hf; reflectedLight.indirectSpecular *= 1.0 - 0.6 * hf; reflectedLight.indirectDiffuse += diffuseColor.rgb * uFL * hf; }
reflectedLight.indirectDiffuse *= occ; reflectedLight.indirectSpecular *= mix(occ, 1.0, zv); reflectedLight.directDiffuse *= mix(1.0, occ, 0.7); reflectedLight.directSpecular *= mix(1.0, occ, 0.5);`);
      };
      CHM.push({ o, mt, orig }); o.material = (P.astroChrome ?? true) ? mt : orig; });
    if (SHD) m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const MATS = []; m.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { MATS.push({ mt, r0: mt.roughness }); mt.envMapIntensity = 0.28; if (mt.roughness != null) mt.roughness = Math.max(mt.roughness, 0.45); }); });
    let studioW = -1;
    m.updateMatrixWorld(true); const bb = new T3.Box3().setFromObject(m, true), sz = bb.getSize(new T3.Vector3()), cn = bb.getCenter(new T3.Vector3());
    const k = 1 / Math.max(sz.x, sz.y, sz.z); m.position.sub(cn.multiplyScalar(k)); m.scale.setScalar(k);
    const piv = new T3.Group(); piv.add(m); sc.add(piv);
    if (SHD) { key.target = piv; key.position.set(1.6, 2.4, 2.2); }
    // invisible floor that only catches the astronaut's shadow (ShadowMaterial: transparent except where shadowed)
    const FLOOR = SHD ? new T3.Mesh(new T3.PlaneGeometry(40, 40), new T3.ShadowMaterial({ opacity: 0.4, depthWrite: false })) : null;
    if (FLOOR) { FLOOR.rotation.x = -Math.PI / 2; FLOOR.receiveShadow = true; FLOOR.renderOrder = -1; sc.add(FLOOR); }
    const rimL0 = sc.children.find((o) => o.isDirectionalLight && o !== key && o.position.x < 0 && o.position.z < 0) || null;
    const MU = { uMorph: { value: 0 } };
    const addDis = (root, inv) => root.traverse((o) => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => {
      if (mt.__dis) return; mt.__dis = true; mt.transparent = false; const prev = mt.onBeforeCompile;
      mt.onBeforeCompile = (sh, r) => { prev && prev.call(mt, sh, r); sh.uniforms.uMorph = MU.uMorph;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMP;').replace('void main() {', 'void main() {\nvMP = position;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uMorph; varying vec3 vMP;\nfloat mh(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }\nfloat mn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(mix(mh(i), mh(i+vec3(1,0,0)), f.x), mix(mh(i+vec3(0,1,0)), mh(i+vec3(1,1,0)), f.x), f.y), mix(mix(mh(i+vec3(0,0,1)), mh(i+vec3(1,0,1)), f.x), mix(mh(i+vec3(0,1,1)), mh(i+vec3(1,1,1)), f.x), f.y), f.z); }')
          .replace('#include <dithering_fragment>', '#include <dithering_fragment>\nfloat nz = mn(vMP * 9.0) * 0.6 + mn(vMP * 23.0) * 0.4; float th = ' + (inv ? '1.0 - uMorph' : 'uMorph') + ' * 1.08 - 0.04; if (' + (inv ? 'nz > 1.0 - th' : 'nz < th') + ') discard; float edge = 1.0 - smoothstep(0.0, 0.05, abs(nz - ' + (inv ? '(1.0 - th)' : 'th') + ')); gl_FragColor.rgb += vec3(0.9, 0.95, 1.0) * edge * step(0.001, uMorph) * step(uMorph, 0.999);');
      }; const pk = mt.customProgramCacheKey.bind(mt); mt.customProgramCacheKey = () => pk() + '|morph' + (inv ? 1 : 0) + '|' + mt.type + '|' + (prev ? prev.toString().length : 0); mt.needsUpdate = true; }); });
    addDis(m, false); this._morph = MU;
    if (!(window.__dbg && (window.__dbg || {}).noRobot) && (this.props.robotMorph ?? false)) (async () => { try {
      const rUrl = (this.props.robotModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/Meshy_AI_Comic_CRT_Monitor_3D_1007092115_image-to-3d-texture-compressed.glb';
      const BUILT = this.props.monitorBuilt ?? true; let gr = null, GL0 = null;
      if (BUILT) { gr = { scene: await this.buildMonitor(T3) }; GL0 = gr.scene.userData.glass; }
      else { try { gr = await loader.loadAsync(rUrl); } catch (e1) { gr = await loader.loadAsync(rUrl.replace('https://raw.githubusercontent.com/wuppie/wubble/main/', 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/')); } }
      const rb = gr.scene; rb.updateMatrixWorld(true); const b2 = new T3.Box3().setFromObject(rb, true), z2 = b2.getSize(new T3.Vector3()), c2 = b2.getCenter(new T3.Vector3());
      const k2 = (this.props.robotScale ?? 1) / Math.max(z2.x, z2.y, z2.z); rb.position.sub(c2.multiplyScalar(k2)); rb.scale.setScalar(k2); this._robotW = Math.max(0.2, z2.x * k2);
      rb.traverse((o) => { if (o.isMesh) { const cv = (mt) => (mt && !mt.isMeshStandardMaterial) ? new T3.MeshStandardMaterial({ map: mt.map || null, color: mt.color ? mt.color.clone() : 0xffffff, roughness: 0.6, metalness: 0.1 }) : mt; o.material = Array.isArray(o.material) ? o.material.map(cv) : cv(o.material); if (o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); } if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { if (mt.color) mt.color.multiplyScalar(this.props.monitorShade ?? 0.42); mt.envMapIntensity = 0.28; if (mt.roughness != null) mt.roughness = Math.max(mt.roughness, 0.45); }); });
      rb.traverse((o) => { if (o.isMesh) { o.castShadow = SHD; o.receiveShadow = SHD; } }); if (!(window.__dbg || {}).noDis) addDis(rb, true); rb.visible = false; if (!(window.__dbg || {}).noAdd) { piv.add(rb); this._robot = rb; } this._astroMesh = m;
      this._builtMon = !!GL0;
      this._scrRect = GL0 ? { cx: rb.position.x + k2 * GL0.x, cy: rb.position.y + k2 * GL0.y, w: k2 * GL0.w, h: k2 * GL0.h, z: rb.position.z + k2 * GL0.z } : { cx: 0, cy: 0.105, w: 0.635, h: 0.55, z: 0.2976 };
      if (!GL0 && (this.props.monitorDetect ?? false)) setTimeout(() => { if (this.dead) return; try { this._scrRect = this.detectScreen(T3, piv, rb); } catch (e) { console.warn('screen detect failed', e); } }, 600);
    } catch (e) { console.warn('robot failed', e); } })();
    const FLAG = (() => {
      const g = new T3.Group(); sc.add(g); g.visible = false;
      const clay = new T3.MeshPhysicalMaterial({ color: 0x8a837a, roughness: 0.55, metalness: 0.35, sheen: 0.4, sheenColor: new T3.Color(0xb7a99a) });
      const pole = new T3.Mesh(new T3.CylinderGeometry(0.008, 0.01, 1, 12), clay); pole.position.y = 0.5; g.add(pole);
      const knob = new T3.Mesh(new T3.SphereGeometry(0.017, 16, 12), clay); knob.position.y = 1.0; g.add(knob);
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 320; const x = cv.getContext('2d');
      x.fillStyle = '#d8653a'; x.fillRect(0, 0, 512, 320); x.fillStyle = '#ece9e2'; x.font = '700 230px Oswald, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('W', 256, 172);
      const tx = new T3.CanvasTexture(cv); tx.colorSpace = T3.SRGBColorSpace;
      const geo = new T3.PlaneGeometry(0.42, 0.26, 24, 10); geo.translate(0.21, 0, 0);
      const base = geo.attributes.position.array.slice();
      const cloth = new T3.Mesh(geo, new T3.MeshStandardMaterial({ map: tx, roughness: 0.9, side: T3.DoubleSide }));
      cloth.position.set(0.008, 0.86, 0); g.add(cloth);
      const st = { p: 0 }, hp = new T3.Vector3();
      return (tt, k, hand, sca) => {
        st.p += (k - st.p) * 0.08; const p = st.p;
        g.visible = p > 0.005; if (!g.visible) return;
        const drop = Math.max(0, Math.min(1, p / 0.55)), dE = 1 - Math.pow(1 - drop, 3), unf = Math.max(0, Math.min(1, (p - 0.45) / 0.55));
        if (!hand) { g.visible = false; return; }
        hand.getWorldPosition(hp);
        const S = sca * 1.25; g.scale.set(S, S * (0.05 + 0.95 * dE), S);
        // grip ~38% up the pole, in his hand; planting = pole pushes down through the grip then settles upright
        const grip = 0.38 + (1 - dE) * 0.25;
        g.rotation.set(0, -0.45, (1 - dE) * 0.35 + Math.sin(Math.max(0, dE - 0.9) * 30) * 0.02 * (1 - unf));
        g.position.set(hp.x, hp.y - grip * S * (0.05 + 0.95 * dE), hp.z + 0.02);
        const a = geo.attributes.position.array;
        for (let i = 0; i < a.length; i += 3) { const u = base[i] / 0.42;
          a[i] = base[i] * (0.15 + 0.85 * unf);
          a[i + 2] = Math.sin(u * 7 - tt * 2.4) * 0.03 * u * unf + Math.sin(u * 3 - tt * 1.3) * 0.015 * u;
          a[i + 1] = base[i + 1] * (0.3 + 0.7 * unf) - u * (1 - unf) * 0.08; }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
      };
    })();
    // rig: procedural zero-g motion per bone (no baked clips) — extremities drift more, each bone on its own slow phase
    m.traverse((o) => { if (o.isSkinnedMesh) o.frustumCulled = false; });
    m.updateMatrixWorld(true);
    const bb2 = new T3.Box3().setFromObject(m), H2 = Math.max(0.001, bb2.max.y - bb2.min.y), cx2 = (bb2.min.x + bb2.max.x) / 2;
    const RIG = []; const wp = new T3.Vector3();
    m.traverse((o) => {
      if (!o.isBone) return;
      let d = 0, p = o.parent; while (p && p.isBone) { d++; p = p.parent; }
      o.getWorldPosition(wp); const ny = (wp.y - bb2.min.y) / H2, nx = (wp.x - cx2) / H2;
      const kind = d === 0 ? 'root' : ny > 0.74 && Math.abs(nx) < 0.16 ? 'head' : ny < 0.45 ? 'leg' : Math.abs(nx) > 0.16 ? 'arm' : 'core';
      const h = (RIG.length * 0.6180339) % 1;
      const amp = kind === 'root' || kind === 'head' || kind === 'core' ? 0 : kind === 'arm' ? 0.13 : kind === 'leg' ? 0.1 : 0;
      const sub = (b) => { let m2 = 0; b.children.forEach((c) => { if (c.isBone) m2 = Math.max(m2, 1 + sub(c)); }); return m2; };
      const tip = sub(o) <= 2 && kind !== 'core';
      RIG.push({ tip, b: o, q0: o.quaternion.clone(), kind, amp: tip ? 0 : amp * Math.min(1.1, 0.7 + d * 0.06), f: 0.22 + h * 0.25, ph: h * 6.283, side: Math.sign(nx) || 1 });
    });
    // retarget the Flying clip by limb direction (works on any rig, independent of rest pose)
    const SEG = [], RTv = { a: new T3.Vector3(), b: new T3.Vector3(), d: new T3.Vector3(), c: new T3.Vector3() }, RTq = { h: new T3.Quaternion(), hr: new T3.Quaternion(), ry: new T3.Quaternion(), r: new T3.Quaternion(), x: new T3.Quaternion(), w: new T3.Quaternion(), p: new T3.Quaternion() };
    let RTh = null;
    if (window.WB_FALL || window.WB_FLY || this.FALL_DIRS) { const FD = ((this.props.astroClipName || 'Falling') === 'Falling' && window.WB_FALL) || ((this.props.astroClipHQ ?? true) && window.WB_FLY) || this.FALL_DIRS, nm = {}; // retarget data only for non-Mixamo rigs m.updateMatrixWorld(true); m.traverse((o) => { if (o.isBone) nm[o.name] = o; });
      const W = (b) => b.getWorldPosition(new T3.Vector3());
      let hips, chest, neck, armsA, armsB, legsA, legsB, toesA, toesB;
      if (nm.mixamorigHips) { const x = (n) => nm['mixamorig' + n]; hips = x('Hips'); chest = [x('Spine1'), x('Spine2')]; neck = [x('Neck'), x('Head')];
        armsA = [x('LeftArm'), x('LeftForeArm'), x('LeftHand')]; armsB = [x('RightArm'), x('RightForeArm'), x('RightHand')];
        legsA = [x('LeftUpLeg'), x('LeftLeg'), x('LeftFoot')]; legsB = [x('RightUpLeg'), x('RightLeg'), x('RightFoot')]; toesA = [x('LeftFoot'), x('LeftToeBase')]; toesB = [x('RightFoot'), x('RightToeBase')]; }
      else if (nm.Bone_000) { const x = (n) => nm['Bone_' + String(n).padStart(3, '0')]; hips = x(0); chest = [x(3), x(2)]; neck = [x(18), x(17)];
        armsA = [x(27), x(26), x(25)]; armsB = [x(22), x(21), x(20)]; legsA = [x(15), x(14), x(13)]; legsB = [x(10), x(9), x(8)]; toesA = [x(12), x(11)]; toesB = [x(7), x(6)]; }
      const ok = (arr) => arr && arr.every(Boolean);
      if (FD && hips && [chest, neck, armsA, armsB, legsA, legsB, toesA, toesB].every(ok)) {
        RTh = hips; hips.getWorldQuaternion(RTq.hr);
        const fwd = W(toesA[1]).sub(W(toesA[0])).add(W(toesB[1]).sub(W(toesB[0]))); fwd.y = 0; fwd.normalize();
        const left = new T3.Vector3(0, 1, 0).cross(fwd);
        if (W(armsA[0]).sub(W(hips)).dot(left) < 0) { const t = armsA; armsA = armsB; armsB = t; }
        if (W(legsA[0]).sub(W(hips)).dot(left) < 0) { const t = legsA; legsA = legsB; legsB = t; }
        const angF = Math.atan2(FD.fwd[0], FD.fwd[1]), angT = Math.atan2(fwd.x, fwd.z); RTq.ry.setFromAxisAngle(new T3.Vector3(0, 1, 0), angT - angF);
        // recorded clips with small motion get their swing amplified around the clip's mean pose (timing stays real)
        const boost = FD === window.WB_FLY ? (this.props.astroClipBoost ?? 3.5) : FD === window.WB_FALL ? (this.props.astroFallBoost ?? 1) : 1;
        const amp = (A) => { if (boost === 1) return A; const n = A.length / 3, m = [0, 0, 0], o = new Array(A.length); for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) m[c] += A[i * 3 + c] / n;
          for (let i = 0; i < n; i++) { let x = m[0] + (A[i * 3] - m[0]) * boost, y = m[1] + (A[i * 3 + 1] - m[1]) * boost, z = m[2] + (A[i * 3 + 2] - m[2]) * boost; const l = Math.hypot(x, y, z) || 1; o[i * 3] = x / l; o[i * 3 + 1] = y / l; o[i * 3 + 2] = z / l; } return o; };
        const add = (k, a, b) => SEG.push({ k, b: a, c: b, src: amp(FD.dirs[k]), land: window.WB_LAND && window.WB_LAND.dirs[k] });
        add('chest', chest[0], chest[1]); if (FD.dirs.neck) add('neck', neck[0], neck[1]);
        add('lArm', armsA[0], armsA[1]); add('lFore', armsA[1], armsA[2]); add('rArm', armsB[0], armsB[1]); add('rFore', armsB[1], armsB[2]);
        add('lUp', legsA[0], legsA[1]); add('lLeg', legsA[1], legsA[2]); add('rUp', legsB[0], legsB[1]); add('rLeg', legsB[1], legsB[2]);
        // elbows/knees: remember the model's own bend direction so retargeted joints never fold backwards
        for (const sg of SEG) { const uk = { lFore: 'lArm', rFore: 'rArm', lLeg: 'lUp', rLeg: 'rUp' }[sg.k]; if (!uk) continue; const up = SEG.find((g) => g.k === uk); if (!up) continue;
          const u0 = W(sg.b).sub(W(up.b)).normalize(), f0 = W(sg.c).sub(W(sg.b)).normalize(), ax = new T3.Vector3().crossVectors(u0, f0);
          if (ax.length() > 0.08) { sg.up = up; sg.ax0 = ax.normalize(); sg.uq0 = up.b.getWorldQuaternion(new T3.Quaternion()); sg.knee = sg.k.endsWith('Leg'); } }
      }
      console.log('[astro] fall retarget segments', SEG.length); }
    const JG = { u: new T3.Vector3(), a: new T3.Vector3(), c: new T3.Vector3(), p: new T3.Vector3(), q: new T3.Quaternion(), q2: new T3.Quaternion() };
    const applyDirs = (tc, w, L) => {
      const FD = L ? window.WB_LAND : (((this.props.astroClipName || 'Falling') === 'Falling' && window.WB_FALL) || ((this.props.astroClipHQ ?? true) && window.WB_FLY) || this.FALL_DIRS); if (w < 0.001 || !SEG.length || !FD) return;
      const fi = (tc / FD.d) * (FD.n - 1), i0 = Math.max(0, Math.min(FD.n - 1, Math.floor(fi))), i1 = Math.min(FD.n - 1, i0 + 1), fr = fi - i0;
      RTh.getWorldQuaternion(RTq.h); RTq.h.multiply(RTq.x.copy(RTq.hr).invert());
      for (const sg of SEG) { const A = L ? sg.land : sg.src, k0 = i0 * 3, k1 = i1 * 3; if (!A) continue;
        RTv.d.set(A[k0] + (A[k1] - A[k0]) * fr, A[k0 + 1] + (A[k1 + 1] - A[k0 + 1]) * fr, A[k0 + 2] + (A[k1 + 2] - A[k0 + 2]) * fr).normalize().applyQuaternion(RTq.ry).applyQuaternion(RTq.h);
        if (sg.ax0 && (this.props.astroJointGuard ?? true)) {
          // u = current upper segment dir; bend axis follows the upper bone; reversed bends straighten smoothly, over-folds are capped
          const u = JG.u.copy(sg.b.getWorldPosition(JG.p)).sub(sg.up.b.getWorldPosition(JG.a)).normalize();
          sg.up.b.getWorldQuaternion(JG.q); JG.q.multiply(JG.q2.copy(sg.uq0).invert()); const ax = JG.a.copy(sg.ax0).applyQuaternion(JG.q);
          const cd = Math.max(-1, Math.min(1, u.dot(RTv.d))), fold = Math.acos(cd), side = JG.c.crossVectors(u, RTv.d).dot(ax);
          const maxF = sg.knee ? 2.4 : 2.5;
          let nf = fold; if (side < 0) nf = fold * Math.max(0, 1 - fold / 0.35) * 0.3; else if (fold > maxF) nf = maxF;
          if (Math.abs(nf - fold) > 1e-3) { const pp = JG.p.copy(RTv.d).addScaledVector(u, -cd); if (pp.lengthSq() < 1e-8) pp.crossVectors(ax, u); pp.normalize(); if (side < 0) pp.negate(); RTv.d.copy(u).multiplyScalar(Math.cos(nf)).addScaledVector(pp, Math.sin(nf)); }
        }
        sg.b.updateMatrixWorld(true); RTv.c.copy(sg.c.getWorldPosition(RTv.b)).sub(sg.b.getWorldPosition(RTv.a)).normalize();
        RTq.r.setFromUnitVectors(RTv.c, RTv.d); RTq.x.identity().slerp(RTq.r, w);
        sg.b.getWorldQuaternion(RTq.w); sg.b.parent.getWorldQuaternion(RTq.p);
        sg.b.quaternion.copy(RTq.p.invert().multiply(RTq.x.multiply(RTq.w))); sg.b.updateMatrixWorld(true); }
    };
    // boot thrusters: random bursts of hot exhaust from both feet, emitted in world space so the trail stays behind him
    const JET = (() => {
      const v = new T3.Vector3(), info = RIG.map((r0) => { r0.b.getWorldPosition(v); return { r0, nx: (v.x - cx2) / H2, ny: (v.y - bb2.min.y) / H2, leaf: !r0.b.children.some((c) => c.isBone) }; });
      const lowLeaves = info.filter((i) => i.leaf && i.ny < 0.3).sort((a2, b2) => a2.ny - b2.ny);
      const pick = []; for (const i of lowLeaves) { if (!pick.length || Math.abs(i.nx - pick[0].nx) > 0.06) pick.push(i); if (pick.length === 2) break; }
      const feet = pick.map((i) => ({ b: i.r0.b, on: false, t: Math.random() * 1.5, amt: 0 }));
      if (!feet.length) return null;
      const N = 700, pos = new Float32Array(N * 3), age = new Float32Array(N), size = new Float32Array(N);
      const vel = new Float32Array(N * 3), life = new Float32Array(N); age.fill(1);
      const geo = new T3.BufferGeometry();
      geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); geo.setAttribute('aAge', new T3.BufferAttribute(age, 1)); geo.setAttribute('aSize', new T3.BufferAttribute(size, 1));
      const mat = new T3.ShaderMaterial({ transparent: true, depthWrite: false, blending: T3.AdditiveBlending, uniforms: { uPR: { value: Math.min(devicePixelRatio || 1, 1.5) } },
        vertexShader: 'attribute float aAge; attribute float aSize; uniform float uPR; varying float vAge; void main(){ vAge = aAge; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * (1.0 - aAge * 0.6) * uPR * 320.0 / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'varying float vAge; void main(){ if (vAge >= 1.0) discard; float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); vec3 hot = mix(vec3(1.0), vec3(0.55), smoothstep(0.0, 0.5, vAge)); hot = mix(hot, vec3(0.18), smoothstep(0.5, 1.0, vAge)); float f = (1.0 - vAge); gl_FragColor = vec4(hot * a * f * 1.4, a * f); }' });
      const pts = new T3.Points(geo, mat); pts.frustumCulled = false; sc.add(pts); this._jetPts = pts;
      const fGeo = new T3.CylinderGeometry(0.012, 0.045, 1, 20, 24, true); fGeo.translate(0, -0.5, 0);
      const fMat = new T3.ShaderMaterial({ transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide, uniforms: { uT: { value: 0 }, uA: { value: 0 } },
        vertexShader: 'varying vec2 vUv; varying float vF; void main(){ vUv = uv; vec3 n = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform float uT; uniform float uA; varying vec2 vUv; varying float vF;' +
          'float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }' +
          'float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }' +
          'void main(){ float y = 1.0 - vUv.y; float a = vUv.x * 6.2832;' +
          ' float turb = n(vec2(a * 0.6, y * 7.0 - uT * 16.0)) * 0.6 + n(vec2(a * 1.7, y * 15.0 - uT * 28.0)) * 0.4;' +
          ' float core = pow(1.0 - y, 1.6) * smoothstep(0.0, 0.05, y);' +
          ' float body = core * smoothstep(0.15 + y * 0.55, 0.9, turb + (1.0 - y) * 0.45);' +
          ' float edge = pow(vF, 1.4);' +
          ' float I = body * edge * uA * 1.8;' +
          ' vec3 c = mix(vec3(1.0), vec3(0.5), smoothstep(0.1, 0.8, y));' +
          ' gl_FragColor = vec4(c * I, I); }' });
      const flames = feet.map(() => { const fm = new T3.Mesh(fGeo, fMat.clone()); fm.frustumCulled = false; sc.add(fm); return fm; });
      const UP = new T3.Vector3(0, -1, 0);
      let head = 0; const fp = new T3.Vector3(), pp = new T3.Vector3(), dir = new T3.Vector3(), toe = new T3.Vector3(), knee = new T3.Vector3();
      return (dt, boost) => { const now = performance.now();
        piv.updateMatrixWorld(true);
        for (const f of feet) {
          f.t -= dt; if (f.t <= 0) { f.on = !f.on; f.t = f.on ? 0.4 + Math.random() * 1.2 : 0.4 + Math.random() * 1.6; }
          f.amt += ((f.on ? 1 : 0) - f.amt) * (1 - Math.exp(-dt * (f.on ? 14 : 5)));
          const rate = f.amt * (60 + boost * 110); let n = rate * dt + Math.random(); n = Math.floor(n);
          // heel: behind the ankle (opposite the toe); thrust follows the shin line out of the heel
          f.b.getWorldPosition(toe); f.b.parent.getWorldPosition(pp); (f.b.parent.parent && f.b.parent.parent.isBone ? f.b.parent.parent : f.b.parent).getWorldPosition(knee);
          const fl = toe.distanceTo(pp); dir.subVectors(pp, knee).normalize(); fp.copy(pp).addScaledVector(dir, fl * 0.75);
          { const fm = flames[feet.indexOf(f)], flick = 0.85 + Math.sin(now * 0.031 + feet.indexOf(f) * 2.0) * 0.08 + Math.random() * 0.12;
            const L = (0.28 + boost * 0.35) * PH.s * f.amt * flick;
            fm.visible = f.amt > 0.02 && (PH.mt || 0) < 0.02 && (this._moonK || 0) < 0.03; fm.position.copy(fp); fm.quaternion.setFromUnitVectors(UP, dir); fm.scale.set(PH.s * (0.5 + f.amt * 0.5), Math.max(0.001, L), PH.s * (0.5 + f.amt * 0.5));
            fm.material.uniforms.uT.value = now / 1000; fm.material.uniforms.uA.value = f.amt; }
          if (n <= 0) continue;
          for (let k = 0; k < n; k++) {
            const i = head; head = (head + 1) % N;
            pos[i * 3] = fp.x; pos[i * 3 + 1] = fp.y; pos[i * 3 + 2] = fp.z;
            const sp = (0.9 + Math.random() * 0.8) * (0.7 + f.amt * 0.6), j = 0.22;
            vel[i * 3] = (dir.x + (Math.random() - 0.5) * j) * sp; vel[i * 3 + 1] = (dir.y + (Math.random() - 0.5) * j) * sp; vel[i * 3 + 2] = (dir.z + (Math.random() - 0.5) * j) * sp;
            age[i] = 0; life[i] = 0.5 + Math.random() * 0.6; size[i] = (0.04 + Math.random() * 0.05) * PH.s;
          }
        }
        for (let i = 0; i < N; i++) {
          if (age[i] >= 1) continue;
          age[i] = Math.min(1, age[i] + dt / life[i]);
          const drag = Math.exp(-dt * 2.2); vel[i * 3] *= drag; vel[i * 3 + 1] *= drag; vel[i * 3 + 2] *= drag;
          pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
        geo.attributes.position.needsUpdate = true; geo.attributes.aAge.needsUpdate = true; geo.attributes.aSize.needsUpdate = true;
      };
    })();
    const wq = new T3.Quaternion(), wq2 = new T3.Quaternion();
    // human wave, solved by direction (not raw bone axes): upper arm out to the side at shoulder height,
    // forearm vertical with the palm side to camera, forearm rocks left-right around the elbow, wrist + fingers stay rigid
    const mqI = new T3.Quaternion(), pq = new T3.Quaternion(), dv = new T3.Vector3(), rd = new T3.Vector3(), dq = new T3.Quaternion(), tq2 = new T3.Quaternion();
    const kid = (r) => r && RIG.find((r0) => r0.b.parent === r.b) || null;
    const aim = (r, child, dirModel, h) => {
      if (!r || !child || h < 0.001) return;
      m.getWorldQuaternion(mqI); mqI.invert();
      r.b.parent.getWorldQuaternion(pq); pq.premultiply(mqI).invert();
      dv.copy(dirModel).normalize().applyQuaternion(pq);
      rd.copy(child.b.position).normalize().applyQuaternion(r.q0);
      dq.setFromUnitVectors(rd, dv); tq2.copy(dq).multiply(r.q0);
      r.b.quaternion.slerp(tq2, h); r.b.updateMatrixWorld(true);
    };
    const DU = new T3.Vector3(), DF = new T3.Vector3();
    const LIMBS = (() => {
      const v = new T3.Vector3(), P = new Map(); RIG.forEach((r0) => { r0.b.getWorldPosition(v); P.set(r0.b, { nx: (v.x - cx2) / H2, ny: (v.y - bb2.min.y) / H2 }); });
      const get = (b) => RIG.find((r0) => r0.b === b);
      const chainUp = (b) => { const c = []; while (b && b.isBone) { c.push(b); b = b.parent; } return c; };
      const out = [];
      [1, -1].forEach((sd) => {
        const hands = RIG.filter((r0) => !r0.b.children.some((c) => c.isBone) && P.get(r0.b).ny > 0.3 && P.get(r0.b).nx * sd > 0.04);
        if (hands.length) {
          const h = hands.reduce((p, q) => P.get(q.b).nx * sd > P.get(p.b).nx * sd ? q : p), ch = chainUp(h.b);
          const armJ = ch.filter((x) => P.get(x) && P.get(x).nx * sd >= 0.07);
          if (armJ.length >= 2) { const sh = armJ.reduce((p, q) => P.get(q).ny > P.get(p).ny ? q : p), i = ch.indexOf(sh);
            if (i >= 3) out.push({ type: 'arm', sd, up: get(ch[i - 1]), lo: get(ch[i - 2]), loC: get(ch[i - 3]) }); }
        }
      });
      const feet = RIG.filter((r0) => !r0.b.children.some((c) => c.isBone) && P.get(r0.b).ny < 0.3).sort((a, b) => P.get(a.b).ny - P.get(b.b).ny);
      const used = []; for (const f of feet) { if (used.length && Math.abs(P.get(f.b).nx - P.get(used[0].b).nx) < 0.06) continue; used.push(f); if (used.length === 2) break; }
      used.forEach((f) => { const ch = chainUp(f.b); if (ch.length >= 4) out.push({ type: 'leg', sd: Math.sign(P.get(f.b).nx) || 1, up: get(ch[3]), lo: get(ch[2]), loC: get(ch[1]) }); });
      return out.filter((l) => l.up && l.lo && l.loC);
    })();
    const FA = new T3.Vector3(), FB = new T3.Vector3();
    // fist: curl every finger bone under the knocking hand (fingers are reset to rest each frame, so this never accumulates)
    const FIST = (() => {
      const cache = new Map(), q = new T3.Quaternion(), AX = { x: new T3.Vector3(1, 0, 0), y: new T3.Vector3(0, 1, 0), z: new T3.Vector3(0, 0, 1) }, wv = new T3.Vector3(), hp = new T3.Vector3();
      const fingers = (hand) => { if (cache.has(hand)) return cache.get(hand); const out = []; hand.getWorldPosition(hp);
        hand.traverse((o) => { if (o === hand || !o.isBone) return; let d = 0, p = o.parent; while (p && p !== hand) { d++; p = p.parent; } out.push({ b: o, d }); });
        // thumb = the first-level branch whose root sits furthest from the others' average
        const roots = out.filter((f) => f.d === 0); if (roots.length > 2) { const c = new T3.Vector3(); roots.forEach((f) => c.add(f.b.position)); c.multiplyScalar(1 / roots.length); let th = null, best = -1; roots.forEach((f) => { const dd = f.b.position.distanceTo(c); if (dd > best) { best = dd; th = f.b; } }); out.forEach((f) => { let p = f.b; while (p && p.parent !== hand) p = p.parent; f.th = p === th; }); }
        cache.set(hand, out); return out; };
      let k = 0;
      return (dt) => {
        const P = this.props, A = PUSH.arm, want = this._inTerm && A ? 1 : 0;
        k += (want - k) * (1 - Math.exp(-dt * 5)); if (k < 0.002 || !A) return;
        const ang = (P.astroFistCurl ?? 1.35) * k, axis = AX[P.astroFistAxis || 'z'] || AX.z;
        for (const f of fingers(A.loC.b)) { q.setFromAxisAngle(axis, ang * (f.th ? 0.5 : f.d === 0 ? 0.85 : 1)); f.b.quaternion.multiply(q); }
      };
    })();
    // physics layer: every bone chases its posed target through an under-damped spring (overshoot, settle, overlapping lag —
    // deeper bones are softer so hands trail arms trail torso); the body itself carries momentum; knocks push him back (zero-g reaction)
    const PHYS = (() => {
      const S = RIG.map((r0) => { let d = 0, p = r0.b.parent; while (p && p.isBone) { d++; p = p.parent; } return { b: r0.b, q: r0.b.quaternion.clone(), t: new T3.Quaternion(), w: new T3.Vector3(), k: Math.max(55, 260 - d * 34), z: 0.5 + Math.min(0.3, d * 0.05) }; });
      const dq = new T3.Quaternion(), ax = new T3.Vector3(), iq = new T3.Quaternion();
      const B = { p: new T3.Vector3(), v: new T3.Vector3(), q: new T3.Quaternion(), w: new T3.Vector3(), init: false, rec: new T3.Vector3(), rv: new T3.Vector3(), rw: 0, lk: -1 };
      const springQ = (cur, tgt, w, k, z, dt) => {
        dq.copy(tgt).multiply(iq.copy(cur).invert()); if (dq.w < 0) { dq.x = -dq.x; dq.y = -dq.y; dq.z = -dq.z; dq.w = -dq.w; }
        const ang = 2 * Math.acos(Math.min(1, dq.w)), sn = Math.sqrt(Math.max(1e-9, 1 - dq.w * dq.w)); ax.set(dq.x / sn, dq.y / sn, dq.z / sn).multiplyScalar(ang);
        w.addScaledVector(ax, k * dt).multiplyScalar(Math.exp(-2 * z * Math.sqrt(k) * dt));
        const a2 = w.length() * dt; if (a2 > 1e-7) { dq.setFromAxisAngle(ax.copy(w).normalize(), a2); cur.premultiply(dq).normalize(); }
      };
      return (dt0, tt) => {
        const dt = Math.min(1 / 30, Math.max(1 / 240, dt0)), P = this.props, soft = P.astroSoftness ?? 1, N = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / N;
        if (!B.init) { B.init = true; B.p.copy(piv.position); B.q.copy(piv.quaternion); S.forEach((x) => x.q.copy(x.b.quaternion)); }
        // jumps (teleports between scenes) snap instead of springing
        if (B.p.distanceTo(piv.position) > 2.5) { B.p.copy(piv.position); B.v.set(0, 0, 0); B.q.copy(piv.quaternion); B.w.set(0, 0, 0); }
        // knock recoil: body is shoved away from the glass, then floats back
        if (this._knockHit && this._knockHit !== B.lk) { B.lk = this._knockHit; const f = 0.7 + Math.random() * 0.5; B.rv.z -= 1.4 * f; B.rv.x += (Math.random() - 0.5) * 0.4; B.rw += (Math.random() < 0.5 ? -1 : 1) * 0.9 * f; }
        B.rv.addScaledVector(B.rec, -40 * dt).multiplyScalar(Math.exp(-4.5 * dt)); B.rec.addScaledVector(B.rv, dt); B.rw *= Math.exp(-2.2 * dt);
        for (let n = 0; n < N; n++) {
          const kB = 70 / soft, zB = 0.62;
          B.v.addScaledVector(ax.copy(piv.position).sub(B.p), kB * h).multiplyScalar(Math.exp(-2 * zB * Math.sqrt(kB) * h)); B.p.addScaledVector(B.v, h);
          springQ(B.q, piv.quaternion, B.w, 90 / soft, 0.55, h);
          for (const x of S) { x.t.copy(x.b.quaternion); springQ(x.q, x.t, x.w, x.k / soft, x.z, h); }
        }
        piv.position.copy(B.p).add(B.rec); piv.quaternion.copy(B.q); if (Math.abs(B.rw) > 1e-4) { dq.setFromAxisAngle(ax.set(0.2, 1, 0.1).normalize(), B.rw * 0.25); piv.quaternion.multiply(dq); }
        // breathing: tiny chest rise on the torso bones
        const br = Math.sin(tt * 1.6) * 0.012 * (P.astroBreath ?? 1);
        for (const x of S) { x.b.quaternion.copy(x.q); }
        const ch = RIG.find((r0) => r0.kind === 'core'); if (ch) { dq.setFromAxisAngle(ax.set(1, 0, 0), br); ch.b.quaternion.multiply(dq); }
      };
    })();
    // services: every N s the list-side arm winds up and shoves; at contact the rows get a damped down-up bounce
    const PUSH = (() => {
      const arms = LIMBS.filter((l) => l.type === 'arm'); if (!arms.length) return () => {};
      const wv = new T3.Vector3(), wv2 = new T3.Vector3(), mq = new T3.Quaternion(), dU = new T3.Vector3(), dF = new T3.Vector3();
      const KU = new T3.Vector3(-0.15, 0.25, 1), KF = new T3.Vector3(-0.1, 0.45, 1), UC = new T3.Vector3(-0.25, 0.15, 0.55), UE = new T3.Vector3(-0.4, -0.9, 0.18), FC = new T3.Vector3(0.0, 0.85, 0.45), FE = new T3.Vector3(-0.3, -0.95, 0.12);
      const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      let w = 0, lastCyc = -1, hitT = -1, rows = null, rowsAt = 0;
      return (tt, dt, rq, r3, hov) => {
        const P = this.props, knock = !!this._inTerm, on = knock || ((P.astroPush ?? true) && rq > 0.985 && r3 < 0.01 && this._svcOn && !this.state.page);
        w += ((on ? 1 : 0) - w) * (1 - Math.exp(-dt * 2));
        const per = knock ? 1.5 : (P.astroPushEvery ?? 5), cyc = Math.floor(tt / per), p = (tt % per) / per, CT = 0.58;
        if (w > 0.01) {
          // pick the arm nearest the list (screen-left) each cycle
          if (cyc !== lastCyc) { lastCyc = cyc; PUSH.var = 0.8 + Math.random() * 0.35; let best = arms[0], bx = Infinity; for (const a of arms) { a.up.b.getWorldPosition(wv); if (wv.x < bx) { bx = wv.x; best = a; } } PUSH.arm = best; }
          const A = PUSH.arm, h = ss(0, 0.16, p) * (1 - ss(0.74, 0.98, p)) * w * (1 - hov);
          const k = ss(0.14, CT, p) * (1 - ss(0.66, 0.94, p)), kk = (k * k * k * (k * (k * 6 - 15) + 10) - 0.22 * ss(0.04, 0.2, p) * (1 - ss(0.2, CT, p))) * (PUSH.var || 1);
          m.getWorldQuaternion(mq); mq.invert();
          dU.lerpVectors(UC, knock ? KU : UE, kk).normalize().applyQuaternion(mq); dF.lerpVectors(FC, knock ? KF : FE, kk).normalize().applyQuaternion(mq);
          aim(A.up, A.lo, dU, h); aim(A.lo, A.loC, dF, h);
          if (on && p >= CT && hitT < cyc + CT) { hitT = cyc + CT; if (knock) { this._knockHit = performance.now(); A.loC.b.getWorldPosition(wv2); wv2.project(cam); this._knockPt = [(wv2.x * 0.5 + 0.5) * innerWidth, (-wv2.y * 0.5 + 0.5) * innerHeight]; } else this._svcHit = performance.now(); }
        }
        const now = performance.now(), since = (now - (this._svcHit || -1e9)) / 1000;
        if (since < 2.2 || (rows && rows.__b)) {
          if (!rows || now - rowsAt > 2000) { rows = Array.from(document.querySelectorAll('[data-svc-row]')); rowsAt = now; }
          const amp = P.astroPushBounce ?? 22, live = since < 2.2;
          rows.forEach((el, i) => { const t = since - i * 0.045; const y = live && t > 0 ? amp * Math.exp(-t * 3.2) * Math.sin(t * 2 * Math.PI * 1.55) * (1 - i * 0.04) : 0; el.style.translate = Math.abs(y) < 0.05 ? '' : '0 ' + y.toFixed(2) + 'px'; });
          rows.__b = live;
        }
      };
    })();
    // free-fall body mechanics, keyed to scroll phase (no clock): startled flail -> skydiver box -> reach/swim -> box,
    // left and right half a cycle apart, limbs trail the torso, knees stay bent
    const FP = {
      arm: [ { u: [0.45, 0.85, 0.25], f: [0.25, 0.9, 0.35] },   // flung up overhead
             { u: [0.95, 0.18, -0.1], f: [0.15, 0.95, 0.15] },  // box: upper arm out, forearm up
             { u: [0.35, 0.3, 0.88], f: [0.1, 0.25, 0.97] },    // reaching forward
             { u: [0.75, -0.35, -0.55], f: [0.4, -0.2, -0.9] } ], // swept back
      leg: [ { u: [0.3, -0.8, 0.5], f: [0.2, -0.95, 0.2] },     // knee pulled up
             { u: [0.38, -0.88, -0.28], f: [0.25, -0.35, -0.9] }, // box: knees bent back
             { u: [0.15, -0.98, 0.1], f: [0.12, -0.9, -0.42] },   // extended
             { u: [0.42, -0.82, -0.4], f: [0.3, -0.25, -0.92] } ]
    };
    const PA = new T3.Vector3(), PB = new T3.Vector3();
    const poseAt = (set, ph, sd, outU, outF) => {
      const n = set.length, x = ((ph % n) + n) % n, i0 = Math.floor(x), i1 = (i0 + 1) % n, t = x - i0, e = t * t * (3 - 2 * t);
      const a = set[i0], b = set[i1];
      outU.set(sd * (a.u[0] + (b.u[0] - a.u[0]) * e), a.u[1] + (b.u[1] - a.u[1]) * e, a.u[2] + (b.u[2] - a.u[2]) * e).normalize();
      outF.set(sd * (a.f[0] + (b.f[0] - a.f[0]) * e), a.f[1] + (b.f[1] - a.f[1]) * e, a.f[2] + (b.f[2] - a.f[2]) * e).normalize();
    };
    const applyFall = (tt, h, drift) => {
      if (drift === 'path') { if (h < 0.001) return;
        if (!LIMBS.__logged) { LIMBS.__logged = true; console.log('[astro] limbs', LIMBS.map((l) => l.type + (l.sd > 0 ? 'R' : 'L')).join(' ')); }
        for (const L of LIMBS) { const sd = L.sd, arm = L.type === 'arm', ph = tt * 0.9 + (sd > 0 ? 0 : Math.PI * 0.85) + (arm ? 0 : 1.2);
          if (arm) {
            const lift = 0.15 + 0.55 * Math.sin(ph), sweep = 0.35 * Math.sin(ph * 0.5 + 0.7);
            PA.set(sd * Math.cos(lift * 0.9), Math.sin(lift * 0.9), sweep).normalize();
            const bend = 0.28 + 0.18 * (0.5 + 0.5 * Math.sin(ph + 1.1));
            PB.copy(PA).multiplyScalar(Math.cos(bend)).add(DF.set(0, 0.55, 0.85).normalize().multiplyScalar(Math.sin(bend))).normalize();
          } else {
            const kick = Math.sin(ph);
            PA.set(sd * 0.3, -0.9, 0.25 * kick - 0.1).normalize();
            PB.set(sd * 0.22, -0.8, -0.35 - 0.25 * (0.5 + 0.5 * Math.sin(ph + 0.9))).normalize();
          }
          aim(L.up, L.lo, PA, h * (arm ? 0.75 : 0.7)); aim(L.lo, L.loC, PB, h * 0.6); }
        return; }
      if (drift === 'up') { for (const L of LIMBS) { const sd = L.sd;
        if (L.type === 'arm') { FA.set(sd * 0.16, -0.97, 0.04); FB.set(sd * 0.1, -0.98, 0.1); }
        else { FA.set(sd * 0.06, -1, 0.02); FB.set(sd * 0.04, -1, -0.04); }
        aim(L.up, L.lo, FA, h * 0.85); aim(L.lo, L.loC, FB, h * 0.7); } return; }
      if (h < 0.001) return;
      if (drift) { for (const L of LIMBS) { const sd = L.sd, ph = sd > 0 ? 0 : 2.3;
        if (L.type === 'arm') { FA.set(sd * 0.96, 0.22 + Math.sin(tt * 0.42 + ph) * 0.07, 0.18 + Math.cos(tt * 0.37 + ph) * 0.06); FB.set(sd * 0.92, 0.32 + Math.sin(tt * 0.42 + ph + 0.9) * 0.06, 0.2); }
        else { FA.set(sd * 0.48, -0.86, 0.12 + Math.sin(tt * 0.33 + ph) * 0.06); FB.set(sd * 0.36, -0.9, -0.05 + Math.sin(tt * 0.33 + ph + 1.1) * 0.05); }
        aim(L.up, L.lo, FA, h * 0.7); aim(L.lo, L.loC, FB, h * 0.55); } return; }
      for (const L of LIMBS) {
        const sd = L.sd, ph = sd > 0 ? 0 : 1.9;
        if (L.type === 'arm') {
          // arms flung up and out, slow paddling circles as he tries to stabilise
          FA.set(sd * 0.95, 0.35 + Math.sin(tt * 0.55 + ph) * 0.1, 0.15 + Math.cos(tt * 0.5 + ph) * 0.1);
          FB.set(sd * 0.85, 0.45 + Math.sin(tt * 0.55 + ph + 0.8) * 0.08, 0.25);
        } else {
          // legs trail and bicycle-kick out of phase, knees bent
          FA.set(sd * 0.42, -0.85, 0.15 + Math.sin(tt * 0.6 + ph) * 0.12);
          FB.set(sd * 0.3, -0.9, -0.25 + Math.sin(tt * 0.6 + ph + 1.2) * 0.1);
        }
        const arm = L.type === 'arm'; aim(L.up, L.lo, FA, h * (arm ? 0.4 : 0.55)); aim(L.lo, L.loC, FB, h * (arm ? 0.12 : 0.45));
      }
    };
    const rq = new T3.Quaternion(), re = new T3.Euler();
    const HEADS = RIG.filter((r0) => r0.kind === 'head' && !r0.tip).slice(0, 2), FREE = RIG.filter((r0) => !r0.amp && HEADS.indexOf(r0) < 0);
    const poseRig = (tt, tumble) => {
      for (const r0 of FREE) r0.b.quaternion.copy(r0.q0);
      for (const h0 of HEADS) { re.set(Math.sin(tt * 0.31) * 0.07, Math.sin(tt * 0.23 + 1.1) * 0.11, Math.sin(tt * 0.19 + 2.3) * 0.05); rq.setFromEuler(re); h0.b.quaternion.copy(h0.q0).multiply(rq); }
      for (const r0 of RIG) {
        if (!r0.amp) continue;
        const k = (r0.kind === 'arm' || r0.kind === 'leg' ? 1 + tumble * 0.5 : 1) * (r0.kind === 'arm' ? 0.45 : 1);
        const a = r0.amp * k, w = tt * 6.283 * r0.f + r0.ph;
        re.set(Math.sin(w) * a, Math.sin(w * 0.73 + 1.3) * a * 0.7, Math.sin(w * 0.57 + 2.1) * a * 0.8 * r0.side);
        rq.setFromEuler(re); r0.b.quaternion.copy(r0.q0).multiply(rq);
      }
    };
    const size = () => { const w = innerWidth, h = window.__svh || innerHeight; r.setPixelRatio(Math.min(devicePixelRatio || 1, this.lowPower ? 1 : 1.5)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const art = new T3.WebGLRenderTarget(4, 4, { type: T3.HalfFloatType });
    const qS = new T3.Scene(), qC = new T3.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const qM = new T3.ShaderMaterial({ transparent: true, uniforms: { tA: { value: art.texture }, uH: { value: 0 }, uPhoto: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: 'uniform sampler2D tA; uniform float uH; uniform float uPhoto; varying vec2 vUv; ' + this.ditherGLSL(2.0) + ' void main(){ vec4 c = texture2D(tA, vUv); vec3 rgb = c.rgb / max(c.a, 0.001); rgb = pow(rgb, vec3(1.0 / 2.2)); rgb = rgb * 1.3 / (1.0 + rgb * 0.55) + 0.02; float a = step(dqB8(gl_FragCoord.xy / 2.0) * 0.85 + 0.08, c.a); float lum = dot(rgb, vec3(0.299, 0.587, 0.114)); float warm = smoothstep(0.02, 0.14, rgb.r - rgb.b); float lv = lum * (1.0 - 0.7 * warm); float lvL = clamp(lv * ' + (this.props.astroHoverLight ?? 1.5).toFixed(2) + ', 0.0, 1.0); vec3 photo = mix(vec3(0.07, 0.075, 0.085), vec3(0.86, 0.88, 0.92), pow(lvL, 1.15)) + vec3(0.9, 0.92, 0.95) * pow(lvL, 5.0) * 0.45 * (1.0 - warm); photo = clamp(photo, 0.0, 1.0); float rv = step(dqB8(gl_FragCoord.xy / 2.0) + 0.001, uH); vec3 lin = c.rgb / max(c.a, 0.001) * 0.62; vec3 aces = clamp((lin * (2.51 * lin + 0.03)) / (lin * (2.43 * lin + 0.59) + 0.14), 0.0, 1.0); vec3 studio = pow(aces, vec3(1.0 / 2.2)); studio = clamp((studio - 0.5) * 1.06 + 0.5, 0.0, 1.0); vec3 dq = mix(DQ(rgb), mix(photo, studio, uPhoto), rv); gl_FragColor = vec4(dq, mix(a, c.a, rv * uPhoto)); }' });
    qS.add(new T3.Mesh(new T3.PlaneGeometry(2, 2), qM));
    const LOOK = () => this.props.astroLook || 'Textured', PLAIN = LOOK() === 'Plain', dOn = !PLAIN && (this.props.ditherStyle ?? true);
    if (NATIVE) for (const c of CHM) { if (!c.o.isSkinnedMesh) continue; this.applyAstroTex(T3, c.o).then((mt) => { if (mt) { c.texM = mt; this._texReady = 1; } }).catch((e) => console.warn('astro tex failed', e)); }
    size(); addEventListener('resize', size);
    // storyline keyframes (screen units: x,y in -1..1, s = scale)
    const K = [{ x: 0, y: -0.04, s: 1.45, ry: -0.5 }, { x: 0.0, y: 0.02, s: (innerWidth < 820 ? 1.6 : 1.3), ry: -0.5 }, { x: -0.46, y: 0.0, s: 0.62, ry: 0.6 }, { x: 0.42, y: 0.08, s: 0.56, ry: -0.4 }];
    const K1s0 = K[1].s;
    const ss = (t) => t * t * (3 - 2 * t), eIn = (t) => t * t * t, eOut = (t) => 1 - Math.pow(1 - t, 3);
    const t0 = performance.now(); let shown = false;
    const ms = { x: 0, y: 0, sx: 0, sy: 0, on: false }; addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; ms.on = true; ms.x = e.clientX / innerWidth * 2 - 1; ms.y = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) ms.on = false; }); addEventListener('blur', () => { ms.on = false; });
    // physical zero-g model: scroll sets a target; the body follows with mass (spring-damper), leans into its motion,
    // carries angular momentum from scroll speed, and a lagging follow-camera adds perspective
    // hover: pixel-dissolve from the dither look back to the full render, and out again
    const hRay = new T3.Raycaster(), hN = new T3.Vector2(); let hOn = false, hFrame = 0, tapOn = false, tapT = null; const hv = { v: 0 };
    // touch: tap the astronaut to toggle the reveal (auto-releases after a few seconds)
    addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || this.state.page) return;
      const tn = new T3.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), tr = new T3.Raycaster();
      tr.setFromCamera(tn, cam); piv.updateMatrixWorld();
      const hit = tr.intersectObject(piv, true).length > 0;
      tapOn = hit ? !tapOn : false; clearTimeout(tapT); if (tapOn) tapT = setTimeout(() => { tapOn = false; }, 4500);
    }, { passive: true });
    const setH = (on) => { if (on === hOn) return; hOn = on; const G = window.gsap; if (G) G.to(hv, { v: on ? 1 : 0, duration: on ? 0.9 : 1.1, ease: on ? 'power2.out' : 'power2.inOut', overwrite: true }); else hv.v = on ? 1 : 0; };
    const PH = { x: K[0].x, y: K[0].y, vx: 0, vy: 0, s: K[0].s, spin: 0, spinV: 0, lastT: 0, lastU: 0, q: new T3.Quaternion(), camX: 0, camY: 0, camZ: 4.2, roll: 0 };
    const tq = new T3.Quaternion(), te = new T3.Euler();
    const healPH = () => {
      const bad = ['x', 'y', 'vx', 'vy', 's', 'spin', 'spinV', 'lastU', 'camX', 'camY', 'camZ', 'roll', 'tq', 'lastRq'].some((k) => PH[k] != null && !Number.isFinite(PH[k]));
      const q0 = piv.quaternion, p0 = piv.position;
      if (bad || ![q0.x, q0.y, q0.z, q0.w, p0.x, p0.y, p0.z, piv.scale.x].every(Number.isFinite) || piv.scale.x < 0.05) {
        Object.assign(PH, { x: K[0].x, y: K[0].y, vx: 0, vy: 0, s: K[0].s, spin: 0, spinV: 0, lastU: 0, camX: 0, camY: 0, camZ: 4.2, roll: 0, tq: 0, lastRq: undefined });
        piv.quaternion.identity(); piv.position.set(0, 0, 0); piv.scale.setScalar(K[0].s);
      }
    };
    this._astroFrame = () => {
      if (this.dead) return;
      healPH();
      try { step(); } catch (e) {
        if (!this._astroErrN || this._astroErrN < 3) { this._astroErrN = (this._astroErrN || 0) + 1; console.warn('astronaut frame error', e); }
        healPH();
        const rq0 = this.rq || 0, r30 = this.r3 || 0, show0 = (!this.state.page || this.closing) && r30 < 0.6;
        box.style.opacity = show0 ? '1' : '0'; box.style.filter = ''; box.style.zIndex = '1';
        try { r.setRenderTarget(null); r.render(sc, cam); } catch (e2) {}
      }
    };
    const loop = () => { if (this.dead) return; this.astroGRaf = requestAnimationFrame(loop); if (!this.mainTickRunning) this._astroFrame(); };
    const step = () => {
      const now = performance.now(), dt = Math.min(0.05, PH.lastT ? (now - PH.lastT) / 1000 : 0.016); PH.lastT = now;
      const rp = this.rp || 0, rq = this.rq || 0, r3 = this.r3 || 0;
      if (NATIVE) { K[1].y = 0.02 + (this.props.astroWorkY ?? 0.3); K[1].s = K1s0 * (this.props.astroWorkScale ?? 0.8); }
      let A, B, t;
      let exitU = 0;
      if (rq > 0.0005 || r3 > 0.0005) { const LP = this.props; A = K[1]; B = { x: LP.astroLandX ?? 0.42, y: LP.astroLandY ?? -0.12, s: (LP.astroLandSize ?? 1) * K[0].s, ry: -0.2 }; /* About: same size as in the hero */ t = Math.min(1, rq / 0.95); { const ctE = this.ctaRef.current, vhE = window.__svh || innerHeight, intoE = ctE && rq > 0.999 ? -(this._ctT ?? ctE.getBoundingClientRect().top) / vhE : 0; if (rq > 0.999) PH.landInto = Math.min(PH.landInto ?? 1e9, intoE); else PH.landInto = null; const rel = rq > 0.999 ? intoE - (PH.landInto ?? intoE) : 0; const e0 = Math.max(0, Math.min(1, Math.max((this.props.robotMorph ?? false) ? (rel - (this.props.astroExitStart ?? 1.0)) / 1.3 : 0, r3 / 0.4))); exitU = (this.props.reachSection ?? false) ? e0 * e0 * (3 - 2 * e0) : 0; } } else { const HS0 = this.props.heroStart ?? 0.04; A = K[0]; B = K[1]; t = Math.min(1, Math.max(0, (rp - HS0) / ((this.props.heroSpan ?? 0.16) * (this.props.astroPathMul ?? 2.5))));  }
      { const rv = Math.abs(rq - (PH.lastRq ?? rq)) / Math.max(dt, 0.001); PH.lastRq = rq; const tg = rq > 0.0005 && rq < 0.999 && r3 < 0.0005 ? Math.min(1, Math.max(rv * 3, Math.sin(Math.PI * Math.min(1, rq)) * 0.85)) : 0; PH.tq = (PH.tq || 0) + (tg - (PH.tq || 0)) * (1 - Math.exp(-dt * (tg > (PH.tq || 0) ? 4 : 1.5))); }
      const tumbleQ = PH.tq;
      PH.spin = Math.atan2(Math.sin(PH.spin), Math.cos(PH.spin)); if (hv.v > 0.001) { PH.spinV *= 1 - Math.min(1, dt * 6 * hv.v); PH.spin *= 1 - Math.min(1, dt * 2.5 * hv.v); }
      if (!isFinite(PH.spinV) || Math.abs(PH.spinV) > 4) PH.spinV = Math.sign(PH.spinV || 0) * 4;
      t = Math.max(0, Math.min(1, t));
      const u = ss(t), dip = Math.sin(Math.PI * t);
      const DRp = (this.props.astroFallStyle || 'Drift') === 'Drift' && rq > 0.0005;
      let tx = A.x + (B.x - A.x) * u + (DRp ? Math.sin(t * Math.PI) * 0.05 : Math.sin(t * 5.2) * dip * 0.08), ty = A.y + (B.y - A.y) * u + (window.__wbAscend ? 1.4 : -1) * dip * (DRp ? 0.12 : 0.3);
      const ts = A.s + (B.s - A.s) * u;
      const lim = 0.62 - ts * 0.12; ty = Math.max(-lim, Math.min(lim, ty)) + exitU * 3.4; tx = Math.max(-0.7, Math.min(0.7, tx));
      // spring-damper (slightly under-damped → soft overshoot, never snappy)
      const k = 5.5, c = 2 * Math.sqrt(k) * 1.0;
      if (exitU > 0.001) { if (PH.exX == null) PH.exX = PH.x; tx = PH.exX; PH.x = PH.exX; PH.vx = 0; } else PH.exX = null;
      PH.vx += ((tx - PH.x) * k - PH.vx * c) * dt; PH.vy += ((ty - PH.y) * k - PH.vy * c) * dt;
      PH.x += PH.vx * dt; PH.y += PH.vy * dt; PH.s += (ts - PH.s) * (1 - Math.exp(-dt * 2.2));
      // angular momentum from scroll speed, slowly bleeding off
      const du = (u - PH.lastU) / Math.max(dt, 0.001); PH.lastU = u;
      const DRs = (this.props.astroFallStyle || 'Drift') === 'Drift';
      if (DRs) { PH.spinV *= Math.exp(-dt * 6); PH.spin *= Math.exp(-dt * 3); } else { PH.spinV += du * 0.55 * dt * 60 * 0.016; PH.spinV *= Math.exp(-dt * 0.9); PH.spin += PH.spinV * dt + dt * 0.9 * tumbleQ; }
      const speed = Math.min(1, Math.hypot(PH.vx, PH.vy) * 1.6), idle = 1 - speed;
      const tt = (now - t0) / 1000;
      { const fp = window.__wbFootP || 0, hand = (this.props.reachSection ?? false) ? 0 : Math.max(0, Math.min(1, (fp - 0.3) / 0.12)); const ov = '1'; void hand; if (r.domElement.style.opacity !== ov) r.domElement.style.opacity = ov; }
      const CLEAN = NATIVE || (this.props.astroMotion || 'Clean clip') === 'Clean clip';
      if (NATIVE) {
        // floating → jump (scrubbed by scroll, plays backwards on scroll up) → flying (loops for the rest of the page)
        // hero: float → (scroll) fly → arriving in Work: float → (scroll on) jump → landed: float
        if (LOOK() === 'Hologram' || (LOOK() === 'Textured' && this._texReady && (this.props.astroHoloRandom ?? true))) { const P = this.props, FULL = LOOK() === 'Hologram';
          // hologram (three.js-journey style, as in thibautlfr's demo): scrolling stripes + fresnel rim + glitch, on the skinned mesh
          if (!this._holoM) { const U = { uTime: { value: 0 }, uColor: { value: new T3.Color('#ffffff') }, uDen: { value: 20 }, uGl: { value: 1 }, uAmt: { value: 1 }, uScan: { value: -1 } }; this._holoU = U;
            const m = new T3.MeshBasicMaterial({ transparent: true, side: T3.DoubleSide, depthWrite: false, blending: T3.AdditiveBlending });
            m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
              sh.vertexShader = 'uniform float uTime, uGl, uAmt; varying vec3 vHP; varying vec3 vHN; varying vec3 vHW;\nfloat hr(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
                vec4 hw = modelMatrix * vec4(transformed, 1.0); vHP = transformed / 177.0;
                float gt = uTime - transformed.y / 177.0 * 4.0, gs = sin(gt) + sin(gt * 3.45) + sin(gt * 8.76); gs /= 3.0; gs = smoothstep(0.3, 1.0, gs) * 0.25 * uGl * max(uAmt, 0.15);
                vec4 vw = vec4((viewMatrix * hw).xyz, 1.0); vw.x += (hr(hw.xz + uTime) - 0.5) * gs * length(vw.xyz) * 0.02; vw.z += (hr(hw.zx + uTime) - 0.5) * gs * length(vw.xyz) * 0.02;
                gl_Position = projectionMatrix * vw; vHW = hw.xyz;`).replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n').replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\nvHN = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);');
              sh.fragmentShader = 'uniform float uTime, uDen, uAmt, uScan; uniform vec3 uColor; varying vec3 vHP; varying vec3 vHN; varying vec3 vHW;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
                vec3 n = normalize(vHN); if (!gl_FrontFacing) n = -n;
                float st = mod((vHP.y - uTime * 0.02) * uDen, 1.0); st = pow(st, 3.0);
                vec3 vd = normalize(vHW - cameraPosition); float fr = dot(vd, n) + 1.0; fr = pow(fr, 2.0);
                float fo = smoothstep(0.8, 0.0, fr), h = (st * fr + fr * 1.25) * fo;
                float band = smoothstep(0.05, 0.0, abs(vHP.y - uScan)) * step(0.001, uAmt) * (1.0 - step(0.999, uAmt));
                gl_FragColor = vec4(uColor + band, (h + band * 1.5) * uAmt);`); };
            m.defines = { USE_HOLO: '' }; this._holoM = m; }
          const U = this._holoU; U.uTime.value = performance.now() / 1000; U.uColor.value.set(P.astroHoloColor || '#ffffff'); U.uDen.value = P.astroHoloStripes ?? 20; U.uGl.value = P.astroHoloGlitch ?? 1;
          this._holoM.blending = (P.astroHoloAdd ?? false) ? T3.AdditiveBlending : T3.NormalBlending;
          if (FULL) { U.uAmt.value = 1; U.uScan.value = -1; for (const c of CHM) { if (c.holo) c.holo.visible = false; if (c.o.isMesh && c.o.material !== this._holoM) c.o.material = this._holoM; } }
          else {
            // random hologram glitch: a scan line sweeps up into the hologram, holds, then sweeps back to the textured suit
            const now = performance.now() / 1000, H = this._holoT || (this._holoT = { next: now + 3 + Math.random() * 4, t0: -1, amt: 0 });
            if (H.t0 < 0 && now > H.next) { H.t0 = now; H.hold = 1.2 + Math.random() * 1.8; }
            let amt = 0, scan = -1; if (H.t0 >= 0) { const t = now - H.t0, ti = P.astroHoloIn ?? 0.7, to = P.astroHoloOut ?? 0.9, sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
              if (t < ti) { amt = sm(t / ti); scan = -0.05 + amt * 1.25; } else if (t < ti + H.hold) amt = 1; else if (t < ti + H.hold + to) { amt = 1 - sm((t - ti - H.hold) / to); scan = 1.2 - (1 - amt) * 1.25; } else { H.t0 = -1; const a = P.astroHoloEvery ?? 9; H.next = now + a * (0.6 + Math.random() * 0.8); } }
            U.uAmt.value = amt; U.uScan.value = scan;
            for (const c of CHM) { if (!c.o.isSkinnedMesh) continue;
              if (!c.holo) { const h = new T3.SkinnedMesh(c.o.geometry, this._holoM); h.bind(c.o.skeleton, c.o.bindMatrix); h.position.copy(c.o.position); h.quaternion.copy(c.o.quaternion); h.scale.copy(c.o.scale); h.frustumCulled = false; h.renderOrder = 3; c.o.parent.add(h); c.holo = h; }
              c.holo.visible = amt > 0.002; if (c.texM) { if (!c.texM.transparent) { c.texM.transparent = true; c.texM.needsUpdate = true; } c.texM.opacity = 1 - amt * (P.astroHoloHide ?? 0.85); c.texM.depthWrite = amt < 0.5; } } }
        }
        if (LOOK() === 'Hologram') {}
        else if (LOOK() === 'Textured' && this._texReady) { const P = this.props; for (const c of CHM) if (c.texM) { if (c.o.material !== c.texM) c.o.material = c.texM; c.texM.envMapIntensity = P.astroTexEnv ?? 1; c.texM.metalness = P.astroTexMetal ?? 1; c.texM.roughness = P.astroTexRough ?? 1; c.texM.normalScale.setScalar(P.astroTexNormal ?? 1); } }
        else if (LOOK() === 'Textured') {}
        else if (PLAIN) { if (!this._plainM) this._plainM = new T3.MeshStandardMaterial({ color: 0xd2d1cd, metalness: 0, roughness: 0.6, side: T3.DoubleSide }); for (const c of CHM) if (c.o.material !== this._plainM) c.o.material = this._plainM; }
        else { const P = this.props, FLK = (P.astroLook || 'Footer') === 'Footer', TXM = FLK ? 'None' : (P.astroTexture || 'Metal012'), on = FLK || (P.astroChrome ?? true) || TXM !== 'None', col = FLK ? '#d2d1cd' : (P.astroChromeColor || '#c9c9c7'), me = FLK ? 0.25 : (P.astroMetal ?? 0.85), ro = FLK ? 0.5 : (P.astroRough ?? 0.38);
          const uz = { uVR: P.astroVisorR ?? 0.8, uVC: P.astroVisorCone ?? 0.35, uCav: P.astroShadows ?? 0.7, uDbg: (P.astroZones ?? false) ? 1 : 0, uTS: P.astroTexScale ?? 0.004, uTC: P.astroTexContrast ?? 2.5, uCer: TXM !== 'None' ? 1 : 0, uMet: TXM === 'Metal012' ? 1 : 0, uFL: P.astroFaceLight ?? 0.55, uFT: (P.astroFaceTex ?? true) ? 1 : 0 }, fc = P.astroFaceColor || '#a88672', vc = P.astroVisorColor || '#1c1e24', ei = FLK ? 0.9 : (P.astroEnv ?? 0.6);
          if (FLK) Object.assign(uz, { uVR: 0, uVC: 0, uCav: 0, uTC: 0, uCer: 0, uMet: 0, uFL: 0, uFT: 0 });
          for (const c of CHM) { const U = c.mt.userData.U; if (U) { U.uTex.value = TXM === 'Ceramic' ? this._tx.CER : this._tx.MTC; for (const k in uz) U[k].value = uz[k]; if (c.fc !== fc) { U.uFace.value.set(fc); c.fc = fc; } if (c.vc !== vc) { U.uVis.value.set(vc); c.vc = vc; } } c.mt.envMapIntensity = ei; const want = on ? c.mt : c.orig; if (c.o.material !== want) c.o.material = want; if (c.col !== col) { c.mt.color.set(col); c.col = col; } c.mt.metalness = me; c.mt.roughness = ro; } }
        const P = this.props, sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
        const inHero = rq <= 0.0005 && r3 <= 0.0005, hp = inHero ? rp : 1;
        const HS = P.heroStart ?? 0.04; const wFy = sm(HS, HS + (P.heroSpan ?? 0.16), hp) * (1 - sm(0.82, 0.98, hp));
        // Work: wave → leaving Work: fly through space → About: tumble in (scroll-scrubbed) → float
        const fA = P.astroFly2Start ?? 0.3, tA = P.astroTumbleStart ?? 0.55, tB = P.astroTumbleEnd ?? 0.95, done = r3 > 0.0005;
        const wWv = ACT.wave ? sm(0.85, 0.98, hp) * (1 - sm(fA, fA + 0.08, rq)) * (done ? 0 : 1) : 0;
        const wF2 = done ? 0 : sm(fA, fA + 0.08, rq) * (1 - sm(tA - 0.02, tA + 0.04, rq));
        // tumble: plays once in real time when you arrive in About (re-arms when you scroll back above it)
        const TD = ACT.tumble ? ACT.tumble.getClip().duration : 2.8;
        // tumble plays when the astronaut arrives in Services (about→services progress = ra)
        { const raT = this.ra || 0, tS = P.astroTumbleAt ?? 0.8; if (raT < tS - 0.15 && !done) PH.tmb = null; if (PH.tmb == null && raT >= tS && !done) PH.tmb = 0; }
        if (PH.tmb != null && PH.tmb < TD) PH.tmb += dt * (P.astroTumbleSpeed ?? 1);
        const tq = PH.tmb == null ? 0 : Math.min(TD * 0.999, PH.tmb), k = tq / TD;
        const wT = PH.tmb == null ? 0 : sm(0, 0.12, k) * (1 - sm(0.62, 0.86, k)), ra = this.ra || 0, wSec = (P.astroFlyAll ?? true) ? Math.max(sm(0.04, 0.25, ra) * (1 - sm(0.7, 0.95, ra)), sm(0.03, 0.2, r3) * (1 - sm(0.55, 0.8, r3))) : 0, wPF = (P.astroFlyAll ?? true) && !inHero ? Math.max(wSec, sm(0.12, 0.45, PH.pathFall || 0)) * (1 - wT) : 0, wFly = Math.max(wFy, wF2, wPF); window.__wbFly = Math.max(wF2, wPF); wFl = Math.max(0, 1 - Math.max(wWv, wFly, wT));
        const tgt = { floating: wFl, jump: ACT.tumble ? 0 : wT, tumble: wT, flying: wFly, wave: wWv * (1 - wPF) }, f = 1 - Math.exp(-dt * 10);
        { const km = this._moonK || 0; if (km > 0 && ACT.look) { for (const n in tgt) tgt[n] *= 1 - km; const ww = ACT.walk ? ((this._wk && this._wk.w) || 0) : 0; tgt.look = km * (1 - ww); tgt.walk = km * ww; if (ACT.walk) ACT.walk.timeScale = this.props.footerWalkAnim ?? 0.8; } else { tgt.look = 0; tgt.walk = 0; } }
        if (ACT.drop) { const ao = window.__wbAboutOp || 0, td = !!window.__wbTypeDone; let ph = this._abPh || 'none';
          // About: fly in → land next to the screen (drop clip, holds its landed pose) → fly on when the screen zooms out
          const leaving = ao < 0.3 || (window.__wbMonZoom || 0) > 0.02;
          if (ph === 'none' && ao > 0.6 && !leaving && (window.__wbMonZoom || 0) < 0.01 && (window.__wbFootP || 0) < 0.01) { ph = 'drop'; ACT.drop.reset(); ACT.drop.play(); }
          else if (ph === 'drop' && leaving) ph = 'none'; // hand back to the normal section flight (no extra fly state that can get stuck)
          else if (ph === 'fly' && ao < 0.05) ph = 'none';
          if ((this._moonK || 0) > 0.001 || (window.__wbFootP || 0) > 0.05) ph = 'none'; // footer/moon owns the pose (stand + look around)
          this._abPh = ph; const e = 1 - Math.exp(-dt * 4), W = this._abW || (this._abW = { hang: 0, drop: 0, fly: 0 });
          W.hang = 0; W.drop += ((ph === 'drop' ? 1 : 0) - W.drop) * (1 - Math.exp(-dt * (ph === 'drop' ? 5 : 4))); W.fly += ((ph === 'fly' ? 1 : 0) - W.fly) * e;
          const tot = Math.min(1, W.hang + W.drop + W.fly) * (1 - Math.min(1, (this._moonK || 0) * 20)); W.fly *= tot > 0 ? 1 : 0; for (const n in tgt) tgt[n] *= 1 - tot; tgt.hang = W.hang; tgt.drop = W.drop; tgt.flying = (tgt.flying || 0) + W.fly; tgt.sit = 0;
          this._abA = (this._abA || 0) + ((ph === 'drop' ? 1 : 0) - (this._abA || 0)) * (1 - Math.exp(-dt * (ph === 'fly' ? 1.6 : 3))); this._sitK = 0; }
        else { const want = (window.__wbAboutOp || 0) > 0.6 && (this.props.astroSit ?? true) ? 1 : 0; if (want && (this._sitK || 0) < 0.02 && ACT.sit && !this._sitOn) { ACT.sit.reset(); ACT.sit.play(); } this._sitOn = want; this._sitK = (this._sitK || 0) + (want - (this._sitK || 0)) * (1 - Math.exp(-dt * 3)); const ks = this._sitK; if (ks > 0.001 && ACT.sit) { for (const n in tgt) tgt[n] *= 1 - ks; tgt.sit = ks; } else tgt.sit = 0; } // About: lands on the monitor edge and sits until the text is typed // landed on the moon: stand + look around
        PH.nw = PH.nw || { floating: 1, jump: 0, flying: 0 };
        for (const n in tgt) if (!isFinite(tgt[n])) tgt[n] = 0;
        for (const n in ACT) { if (!isFinite(PH.nw[n])) PH.nw[n] = 0; PH.nw[n] = (PH.nw[n] ?? 0) + ((tgt[n] ?? 0) - (PH.nw[n] ?? 0)) * f; ACT[n].setEffectiveWeight(PH.nw[n]); }
        if (ACT.tumble) ACT.tumble.time = tq;
        if (ACT.jump) { const d = ACT.jump.getClip().duration; PH.jt = (PH.jt ?? 0) + (k * d * 0.999 - (PH.jt ?? 0)) * (1 - Math.exp(-dt * 8)); ACT.jump.time = PH.jt; }
        MX.update(dt * (P.astroClipSpeed ?? 1));
      } else if (CLEAN) { for (const r0 of RIG) r0.b.quaternion.copy(r0.q0); } else poseRig(tt, (this.props.astroPath ?? true) ? (PH.pathFall || 0) * 0.8 * (1 - hv.v) : speed * 0.8 * (1 - hv.v)); // no arm gesture on hover
      const DR = (this.props.astroFallStyle || 'Drift') === 'Drift';
      const fw = DR && rq > 0.0005 && r3 < 0.0005 ? Math.min(1, rq / 0.12) * (1 - 0.6 * Math.max(0, (rq - 0.9) / 0.1)) : 0;
      PH.fw = (PH.fw || 0) + (fw - (PH.fw || 0)) * (1 - Math.exp(-dt * 3));
      PH.uw = (PH.uw || 0) + (Math.min(1, (PH.exitU || 0) * 6) - (PH.uw || 0)) * (1 - Math.exp(-dt * 6));
      if (!CLEAN && PH.uw > 0.01) applyFall(tt, PH.uw * (1 - hv.v), 'up');
      if (CLEAN) {} else if ((this.props.astroPath ?? true) && PH.pathRot != null) { if ((PH.pathFd || 0) > 0.01) applyFall(PH.pathT, PH.pathFd * (1 - hv.v), 'path'); } else applyFall(tt, (DR ? PH.fw : Math.max(rq > 0.0005 ? 0 : ss(Math.min(1, Math.sin(Math.PI * t) * 1.6)), tumbleQ, PH.fw)) * (1 - hv.v), DR && PH.fw > 0.02);
      if (!NATIVE && SEG.length && (this.props.astroClip ?? true)) { const FD = ((this.props.astroClipName || 'Falling') === 'Falling' && window.WB_FALL) || ((this.props.astroClipHQ ?? true) && window.WB_FLY) || this.FALL_DIRS;
        const wv = Math.min(1, (PH.pathFall || 0) * 1.6), wf = wv * wv * (3 - 2 * wv), base = CLEAN ? 1 : rq > 0.0005 ? (this.props.astroClipIdle ?? 0.85) : 0;
        const w = CLEAN ? 1 : Math.max(wf, base) * (1 - hv.v) * (1 - Math.min(1, PH.uw || 0));
        // real-time playback (recorded motion needs its real tempo); scrolling speeds it up a little
        PH.clipT = ((PH.clipT || 0) + dt * (this.props.astroClipSpeed ?? 1) * (0.85 + Math.min(1.2, (speed || 0) * 1.2))) % FD.d;
        let wl = 0; const LD = window.WB_LAND;
        if (LD && (this.props.astroLand ?? true)) {
          if (wf > 0.45) PH.wasFall = 1;
          const svcLand = rq > 0.97 && (PH.lastRqL ?? 1) <= 0.97; PH.lastRqL = rq;
          if ((PH.wasFall && wf < 0.15) || svcLand) { PH.wasFall = 0; PH.landT = 0; }
          if (PH.landT != null) { PH.landT += dt * (this.props.astroLandSpeed ?? 1); if (PH.landT >= LD.d) PH.landT = null; else wl = ss(Math.min(1, PH.landT / 0.3)) * (1 - ss(Math.max(0, Math.min(1, (PH.landT - (LD.d - 0.8)) / 0.8)))); }
        }
        applyDirs(PH.clipT, CLEAN ? 1 : w * (1 - wl * 0.6) * (this.props.astroClipAmount ?? 1));
        if (wl > 0.001) applyDirs(PH.landT, wl * (CLEAN ? 1 : (this.props.astroLandAmount ?? 0.9) * (1 - hv.v)), true); }
      ms.sx += (ms.x - ms.sx) * 0.035; ms.sy += (ms.y - ms.sy) * 0.035; const mk = (this.props.astroMouse ?? 1) * (1 - Math.min(1, PH.uw || 0));
      if (!NATIVE && (this.props.astroArmAnims ?? false)) PUSH(tt, dt, rq, r3, hv.v);
      const halfH = Math.tan(12 * Math.PI / 180) * 4.2, halfW = halfH * cam.aspect;
      const wx = PH.x * halfW + ms.sx * 0.1 * mk, wy = PH.y * halfH + Math.sin(tt * 0.62) * 0.03 * idle + ms.sy * 0.06 * mk;
      const PATH = this.props.astroPath ?? true;
      let pwx = wx, pwy = wy;
      if (PATH) {
        const LP = this.props, a1 = Math.max(0, Math.min(1, (rp - 0.08) / 0.9)), b1 = Math.max(0, Math.min(1, rq / 0.92));
        const P0 = K[0], P1 = K[1], P2 = { x: LP.astroLandX ?? 0.42, y: LP.astroLandY ?? -0.12, s: (LP.astroLandSize ?? 1) * K[0].s };
        const ea = ss(a1), eb = ss(b1), A2 = b1 > 0 ? P1 : P0, B2 = b1 > 0 ? P2 : P1, e2 = b1 > 0 ? eb : ea;
        const RB = Math.max(0, Math.min(1, ((PH.mt || 0) - 0.5) * 2)); PH.rb = RB;
        const sst2 = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, raM = (this.ra || 0) * RB;
        const rotF = sst2(0.02, 0.28, raM), zoomF = sst2(0.12, 0.55, raM); PH.rotF = rotF; this._monZoom = zoomF; this._raM = raM;
        PH.x = A2.x + (B2.x - A2.x) * e2; PH.y = A2.y + (B2.y - A2.y) * e2 + (PH.exitU || 0) * 3.4 * (1 - RB) + Math.sin(tt * 0.9) * 0.035 * RB * (1 - rotF);
        if (zoomF > 0) { const SR = this._scrRect || { cx: 0, cy: 0, w: this._robotW || 1, h: (this._robotW || 1) * 0.75 }, af = cam.aspect < 0.8 ? 0.75 : 1, fill = this.props.monitorFill ?? 0.86;
          const sLand = (A2.s + (B2.s - A2.s) * e2) * (this.props.monitorStart ?? 1.05), fillU = Math.min(fill, 1.25), sEnd = Math.max(sLand, Math.min(2 * halfW * fillU / SR.w, 2 * halfH * fillU / SR.h) / af);
          const z3 = zoomF * zoomF * zoomF, s1 = sLand * Math.pow(sEnd / sLand, zoomF);
          const tx = -SR.cx * s1 * af / halfW, ty = -SR.cy * s1 * af / halfH;
          PH.x = PH.x + (tx - PH.x) * Math.min(1, zoomF * 1.6); PH.y = PH.y + (ty - PH.y) * Math.min(1, zoomF * 1.6); PH.s = s1;
          this._scrPx = { w: SR.w * s1 * af / (2 * halfW), h: SR.h * s1 * af / (2 * halfH), z: zoomF }; } else { const mtE = Math.min(1, Math.max(0, PH.mt || 0)); PH.s = (A2.s + (B2.s - A2.s) * e2) * (1 - (1 - (this.props.monitorStart ?? 1.05)) * mtE * mtE * (3 - 2 * mtE)); } PH.vx = 0; PH.vy = 0;
        PH.still = (PH.still ?? 1) + ((rp < 0.02 && rq < 0.0005 ? 1 : 0) - (PH.still ?? 1)) * (1 - Math.exp(-dt * 2.5)); const still = PH.still;
        pwx = PH.x * halfW + ms.sx * 0.1 * mk * still; pwy = PH.y * halfH + ms.sy * 0.06 * mk * still;
        PH.pathRot = (K[0].ry ?? -0.5) + Math.PI * 2 * (ea + eb);
        const fe = b1 > 0 ? eb : ea; PH.pathFall = Math.sin(Math.PI * fe) * (1 - (PH.exitU || 0)); PH.pathT = (b1 > 0 ? 1 + b1 : a1) * (this.props.astroLimbCycles ?? 14);
        const fd = Math.min(1, fe / 0.12) * Math.min(1, (1 - fe) / 0.18), fdE = fd * fd * (3 - 2 * fd); PH.pathX = (window.__wbAscend ? -0.1 : 0.1) + (window.__wbAscend ? -0.7 : 1) * (this.props.astroFallPitch ?? 1.35) * fdE * (1 - (PH.exitU || 0)); PH.pathFd = fdE * (1 - (PH.exitU || 0)); PH.pathZ = Math.sin(Math.PI * 2 * fe) * 0.45 * (b1 > 0 ? -1 : 1);
        PH.camX = 0; PH.camY = 0; PH.roll = 0; PH.camLock = null;
      } else PH.pathRot = null;
      { const fpM = (this._fpS = (this._fpS ?? 0) + ((window.__wbFootP || 0) - (this._fpS ?? 0)) * (1 - Math.exp(-dt * 5))), km = Math.max(0, Math.min(1, (fpM - 0.35) / 0.6)), ke = km * km * (3 - 2 * km); if (ke > 0) { if (!this._mS) this._mS = { x: pwx, y: pwy, r: PH.pathRot };
          const my = ((window.__wbMoonTop ?? -0.3) + (this.props.astroMoonLift ?? 0)) * halfH, tx = (this.props.astroMoonX ?? 0) * halfW;
          pwx = this._mS.x + (tx - this._mS.x) * ke; pwy = this._mS.y + (my - this._mS.y) * ke;
          if (PH.pathRot != null) { const r0 = this._mS.r ?? PH.pathRot, base = K[0].ry ?? -0.5, tr = base + Math.PI * 2 * Math.round((r0 - base) / (Math.PI * 2)); PH.pathRot = r0 + (tr - r0) * ke; } }
        else this._mS = null; this._moonK = ke; }
      piv.position.set(pwx, pwy, 0);
      piv.scale.setScalar(PH.s * (1 - (this._moonK || 0) * (1 - (this.props.astroMoonScale ?? 0.45))) * (cam.aspect < 0.8 ? 0.75 : 1) * (1 - 0.25 * (PH.exitU || 0) * (1 - Math.min(1, (PH.mt || 0) * 4))));
      if ((this._abA || 0) > 0.001 && (window.__wbMonLand || window.__wbMonEdge) && ACT.drop) { const hb = this._mL || (this._mL = { l: m.getObjectByName('mixamorigLeftToeBase'), r: m.getObjectByName('mixamorigRightToeBase'), v: new T3.Vector3(), w: new T3.Vector3() });
        if (hb.l && hb.r) { const E = window.__wbMonLand || window.__wbMonEdge; if (this._abPh === 'drop' || !this._hOff) { piv.updateMatrixWorld(true); const a = hb.l.getWorldPosition(hb.v), b = hb.r.getWorldPosition(hb.w); a.add(b).multiplyScalar(0.5).project(cam); this._hOff = { x: (E.x - a.x) * halfW, y: (E.y + (this.props.astroLandLift ?? 0) - a.y) * halfH }; }
          piv.position.x += this._hOff.x * this._abA; piv.position.y += this._hOff.y * this._abA; } }
      { const aoD = Math.min(1, Math.max(0, ((window.__wbAboutOp || 0) - 0.2) / 0.6)); if (aoD > 0) piv.position.y -= (this.props.astroAboutDown ?? 0.3) * halfH * aoD * aoD * (3 - 2 * aoD); } // About: sit lower in the frame
      if (0) {}
      else if ((this._sitK || 0) > 0.001 && window.__wbMonEdge) { const hb = this._mB || (this._mB = { h: m.getObjectByName('mixamorigHips'), l: m.getObjectByName('mixamorigLeftToeBase'), r: m.getObjectByName('mixamorigRightToeBase'), v: new T3.Vector3(), w: new T3.Vector3() });
        if (hb.h) { piv.updateMatrixWorld(true); const nd = hb.h.getWorldPosition(hb.v).project(cam), E = window.__wbMonEdge, ks = this._sitK; piv.position.x += (E.x - nd.x) * halfW * ks; piv.position.y += (E.y + (this.props.astroSitLift ?? 0.02) - nd.y) * halfH * ks; } }
      if ((this._moonK || 0) > 0.001) { // snap to the moon by the real skeleton: hips centred on screen, toes on the crown
        const B = this._mB || (this._mB = { h: m.getObjectByName('mixamorigHips'), l: m.getObjectByName('mixamorigLeftToeBase'), r: m.getObjectByName('mixamorigRightToeBase'), v: new T3.Vector3(), w: new T3.Vector3() });
        if (B.h && B.l && B.r) { piv.updateMatrixWorld(true); const hx = B.h.getWorldPosition(B.v).x, ly = B.l.getWorldPosition(B.v).y, ry = B.r.getWorldPosition(B.w).y, ke2 = this._moonK;
          const tx = (this.props.astroMoonX ?? 0) * halfW, ty = ((window.__wbMoonTop ?? -0.3) + (this.props.astroMoonLift ?? 0)) * halfH;
          const nd = B.h.getWorldPosition(B.v).project(cam); void tx; void hx; const MO = this._mO || (this._mO = { x: 0, y: 0, ok: 0 }), lx = piv.position.x + ((this.props.astroMoonX ?? 0) - nd.x) * halfW, ly2 = piv.position.y + ty - (ly + ry) / 2, kf = MO.ok ? 1 - Math.exp(-dt * 10) : 1; MO.x += (lx - MO.x) * kf; MO.y += (ly2 - MO.y) * kf; MO.ok = 1;
          /* straight line: start point (frozen when the descent began) → landing spot, eased by ke only */ const S0 = this._mS || { x: piv.position.x, y: piv.position.y }; piv.position.x = S0.x + (MO.x - S0.x) * ke2; piv.position.y = S0.y + (MO.y - S0.y) * ke2; } } else if (this._mO) this._mO.ok = 0;
      if (this.props.astroFlag ?? false) FLAG(tt, (rq > 0.0005 || r3 > 0.0005) ? 1 : Math.max(0, Math.min(1, (rp - 0.86) / 0.14)), (() => { const HL = LIMBS.find((l) => l.type === 'arm' && l.sd > 0) || LIMBS.find((l) => l.type === 'arm'); return HL ? HL.loC.b : null; })(), PH.s * (cam.aspect < 0.8 ? 0.75 : 1));
      // orientation: face-down with scroll, lean into velocity, keep spin from momentum; slerp gives the body inertia
      const tumbleP = Math.max(0, Math.min(1, (t - 0.08) / 0.72)), tumbleA = (tumbleP - Math.sin(tumbleP * Math.PI * 2) / (Math.PI * 2)) * Math.PI * 2;
      const fd = tumbleA + (this.props.astroFaceDown ?? 0.85) * dip * (1 - Math.sin(Math.PI * tumbleP));
      const ry = A.ry + (B.ry - A.ry) * u + PH.spin;
      te.set(0.15 + fd - PH.vy * 0.35 + Math.sin(tt * 0.31) * 0.05 * idle - ms.sy * 0.18 * mk,
             ry + Math.sin(tt * 0.19) * 0.18 * idle + ms.sx * 0.35 * mk,
             -PH.vx * 0.45 + Math.sin(tt * 0.37) * 0.06 * idle + dip * Math.sin(t * Math.PI * 1.5) * 0.7);
      if (PH.fw > 0.001) {
        const w = PH.fw * (1 - hv.v), rollA = (rq * (this.props.astroFallRoll ?? 0.18) + Math.sin(tt * 0.16) * 0.03) * Math.PI;
        te.set(te.x + (0.12 + Math.sin(tt * 0.27) * 0.06 - te.x) * w, te.y + (Math.sin(tt * 0.21) * 0.14 + ms.sx * 0.2 * mk - te.y) * w, te.z + (rollA - te.z) * w);
        if (!NATIVE) piv.scale.multiplyScalar(1 - 0.18 * w * Math.sin(Math.PI * Math.min(1, rq)));
      }
      // hover: turn to face the camera
      if (hv.v > 0.001) te.set(te.x * (1 - hv.v), te.y * (1 - hv.v) + ms.sx * 0.15 * hv.v, te.z * (1 - hv.v));
      if (SHD) { const sk = this.props.astroShadowStrength ?? 1; key.intensity = Math.max(key.intensity, 2.2 + 1.6 * sk); rimL0 && (rimL0.intensity = Math.min(rimL0.intensity, 2.4 - 1.2 * sk)); key.position.set(piv.position.x + 1.6, piv.position.y + 2.4, piv.position.z + 2.2); const ss = Math.max(1.2, piv.scale.x * 1.15), scm = key.shadow.camera; if (Math.abs(scm.right - ss) > 0.05) { scm.left = -ss; scm.right = ss; scm.top = ss; scm.bottom = -ss; scm.updateProjectionMatrix(); } }
      if (FLOOR) { const LP = this.props, sF = piv.scale.x, mtF = this._morph ? this._morph.uMorph.value : 0, opF = (LP.astroFloorShadow ?? true) ? (LP.astroFloorOpacity ?? 0.4) * (1 - mtF) : 0;
        FLOOR.visible = opF > 0.005; FLOOR.material.opacity = opF; FLOOR.position.set(piv.position.x, piv.position.y - (0.5 + (LP.astroFloorGap ?? 0.12)) * sF, 0); }
      tq.setFromEuler(te);
      if (PH.uw > 0.001) { PH.spin *= 1 - Math.min(1, dt * 5); PH.spinV = 0; tq.slerp(PH.faceQ || (PH.faceQ = new T3.Quaternion()), Math.min(1, PH.uw * 1.4)); }
      if (PH.pathRot != null) { const rb2 = (PH.rb || 0) * (1 - (PH.rotF || 0)), wrapY = Math.atan2(Math.sin(PH.pathRot), Math.cos(PH.pathRot)); te.set(((PH.pathX ?? 0.1) + Math.sin(tt * 0.6) * 0.06 * rb2) * (1 - (PH.rotF || 0)), PH.pathRot - wrapY * (PH.rotF || 0) + Math.sin(tt * 0.35) * 0.18 * rb2, ((PH.pathZ ?? 0) + (0.16 + Math.sin(tt * 0.5) * 0.08) * rb2) * (1 - (PH.rotF || 0))); tq.setFromEuler(te); if (hv.v > 0.001) { te.set(0.12 - ms.sy * 0.1, ms.sx * 0.25, 0); tq.slerp((PH.hq || (PH.hq = new T3.Quaternion())).setFromEuler(te), hv.v); } piv.quaternion.copy(tq); PH.spin = 0; PH.spinV = 0; } else piv.quaternion.slerp(tq, 1 - Math.exp(-dt * (2.4 + hv.v * 2 + (PH.uw || 0) * 5)));
      if (NATIVE) { // the clips carry all the motion: body keeps one steady facing, only the hover turn is layered on
        const P = this.props, fy = (PH.nw && PH.nw.flying) || 0; // rotate into the flying pose (body tips forward/down while flying)
        const AS = window.__wbAscend; te.set((P.astroFaceX ?? 0.08) + fy * (AS ? -(P.astroAscPitch ?? 1.45) : (P.astroFlyPitch ?? 0.9)), (P.astroFaceY ?? -0.35) + fy * (AS ? 0.15 : (P.astroFlyYaw ?? 0.4)), fy * (AS ? 0 : (P.astroFlyRoll ?? -0.25))); tq.setFromEuler(te);
        if (hv.v > 0.001) { te.set(0.12 - ms.sy * 0.1, ms.sx * 0.25, 0); tq.slerp((PH.hq || (PH.hq = new T3.Quaternion())).setFromEuler(te), hv.v); }
        PH.nq = PH.nq || tq.clone(); PH.nq.slerp(tq, 1 - Math.exp(-dt * 4)); piv.quaternion.copy(PH.nq); PH.spin = 0; PH.spinV = 0; }
      if (!(this.props.robotMorph ?? false)) { PH.mt = 0; if (this._robot) this._robot.visible = false; this._monZoom = 0; this._raM = 0; }
      else if (this._robot) { const mt0 = (this.props.astroPath ?? true) ? ((x) => x * x * x * (x * (x * 6 - 15) + 10))(Math.max(0, Math.min(1, (rq - (1 - (this.props.robotMorphRange ?? 0.7))) / (this.props.robotMorphRange ?? 0.7)))) : (rq > 0.999 ? Math.min(1, Math.max(0, ((PH.mt ?? 0) + dt / (this.props.robotMorphSeconds ?? 3.6)))) : Math.max(0, (PH.mt ?? 0) - dt / 1.2)); PH.mt = mt0;
        const e = mt0 * mt0 * (3 - 2 * mt0); this._morph.uMorph.value = e; this._robot.visible = e > 0.001 && !(window.__dbg || {}).noShow;  if (this._jetPts) this._jetPts.visible = e < 0.02; this._astroMesh.visible = e < 0.999; }
      // follow camera: trails the body, pushes back + widens a touch while falling, rolls with sideways drift
      const fall = Math.min(1, speed * 1.2);
      const camF = 1; PH.exitU = exitU; const exOn = exitU > 0.001;
      if (exOn && !PH.camLock) PH.camLock = { x: PH.camX, y: PH.camY, lx: PH.lkX ?? 0, ly: PH.lkY ?? 0, roll: PH.roll }; if (!exOn) PH.camLock = null;
      if (!exOn) { PH.camX += (wx * 0.28 - PH.camX) * (1 - Math.exp(-dt * 1.6)); PH.camY += (wy * 0.28 - PH.camY) * (1 - Math.exp(-dt * 1.6)); }
      PH.camZ += (4.2 - PH.camZ) * (1 - Math.exp(-dt * 1.4)); if (!exOn) PH.roll += (-PH.vx * 0.08 - PH.roll) * (1 - Math.exp(-dt * 2));
      if (PH.camLock) { const L = PH.camLock; cam.position.set(L.x, L.y, PH.camZ); cam.lookAt(L.lx, L.ly, 0); cam.rotateZ(L.roll); } else { PH.lkX = wx * 0.45; PH.lkY = wy * 0.45; cam.position.set(PH.camX, PH.camY, PH.camZ); cam.lookAt(PH.lkX, PH.lkY, 0); cam.rotateZ(PH.roll); }
      const fov = 24; if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
      if ((++hFrame & 3) === 0) { hN.set(ms.x, ms.y); hRay.setFromCamera(hN, cam); piv.updateMatrixWorld(); setH(!this.state.page && rp < 0.05 && rq < 0.0005 && (tapOn || (ms.on && !this.coarse && hRay.intersectObject(piv, true).length > 0))); }
      qM.uniforms.uH.value = (this.props.astroHoverDither ?? true) ? 1 - hv.v : (this.props.astroHoverReveal ?? true) ? hv.v : 0; // default: clean render, hover dissolves the dither in
      qM.uniforms.uPhoto.value = (this.props.heroStudio ?? true) ? 1 : 0;
      { const w = (this.props.heroStudio ?? true) ? Math.round(hv.v * 50) / 50 : 0;
        { const on = !this._nat && (this.props.hoverMetal ?? true) && w > 0.5; if (on !== this._metalOn) { this._metalOn = on;
            const ML = this._metalTex || (this._metalTex = (() => { const L = new T3.TextureLoader(), base = (window.WB_ASSETS || './') + 'models/Metal029_1K-JPG_', ld = (n, srgb) => { const t = L.load(base + n + '.jpg'); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(2, 2); if (srgb) t.colorSpace = T3.SRGBColorSpace; return t; };
              return { map: ld('Color', true), normalMap: ld('NormalGL'), roughnessMap: ld('Roughness'), metalnessMap: ld('Metalness') }; })());
            piv.traverse((o) => { if (!o.isMesh || !o.material || o.material.isShaderMaterial) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { if (!mt.isMeshStandardMaterial) return;
              if (on) { if (!mt.userData.__o) mt.userData.__o = { map: mt.map, normalMap: mt.normalMap, roughnessMap: mt.roughnessMap, metalnessMap: mt.metalnessMap, metalness: mt.metalness, roughness: mt.roughness, color: mt.color.clone() };
                Object.assign(mt, ML); mt.metalness = 1; mt.roughness = 1; mt.color.setRGB(1, 1, 1); }
              else if (mt.userData.__o) { const O = mt.userData.__o; mt.map = O.map; mt.normalMap = O.normalMap; mt.roughnessMap = O.roughnessMap; mt.metalnessMap = O.metalnessMap; mt.metalness = O.metalness; mt.roughness = O.roughness; mt.color.copy(O.color); }
              mt.needsUpdate = true; }); }); } }
        if (w !== studioW) { studioW = w;
          key.intensity = 2.2 * (1 - w) + 0.6 * w; rim.intensity = 2.4 * (1 - w) + 0.9 * w; fil.intensity = 0.45 * (1 - w);
          softA.intensity = 3.2 * w; fillA.intensity = 0.9 * w; hemiA.intensity = 0.25 + 0.95 * w; hemiA.groundColor.setRGB(0.02 + 0.3 * w, 0.02 + 0.3 * w, 0.02 + 0.3 * w);
          for (const M of MATS) { M.mt.envMapIntensity = 0.28 + 0.9 * w; if (M.r0 != null) M.mt.roughness = Math.max(M.r0, 0.45) * (1 - w) + M.r0 * w; } } }
      { const ch = this.chromeRef && this.chromeRef.current || document.querySelector('[data-w="chrome"],[data-wh="chrome"]');
        if (ch) { const dark = (this.props.heroStudio ?? true) && (this.rp || 0) < 0.5 && !this.state.page, k = dark ? 'd' : 'l';
          if (ch.__ink !== k) { ch.__ink = k; ch.style.mixBlendMode = dark ? 'normal' : ''; ch.style.color = dark ? (this.props.heroLightInk || '#ffffff') : ''; ch.style.setProperty('--chrome-inv', dark ? 'var(--bg-hero,#202ded)' : '#0e0e0d'); } } }
      const onMoon = (this._moonK || 0) > 0.03; if (JET && (this.props.astroJets ?? !NATIVE) && shown && !onMoon) JET(dt, speed); if (this._jetPts && onMoon) this._jetPts.visible = false; else if (this._jetPts && !this._robot) this._jetPts.visible = true; // no jet boots once he's on the moon
      const inWork = rp > 0.97;
      if (!this._hbub) { const el = document.querySelector('[data-hover-bubble]'); if (el) { this._hbub = { el, x: 0, y: 0, op: 0 };
          const G = window.gsap, blobs = el.querySelectorAll('[data-hb-blob]'), main = el.querySelector('[data-hb-main]');
          const wob = (b, i) => { if (!G || this.dead) return; G.to(b, { x: G.utils.random(-26, 26), y: G.utils.random(-18, 18), scale: G.utils.random(0.55, 1.25), duration: G.utils.random(1.1, 2.2), ease: 'sine.inOut', onComplete: () => wob(b, i) }); };
          const wobM = () => { if (!G || this.dead) return; G.to(main, { scaleX: G.utils.random(0.94, 1.08), scaleY: G.utils.random(0.9, 1.1), rotation: G.utils.random(-4, 4), duration: G.utils.random(1.4, 2.4), ease: 'sine.inOut', onComplete: wobM }); };
          setTimeout(() => { blobs.forEach(wob); wobM(); }, 300); } }
      if (this._hbub) { const HB = this._hbub, show = !this.state.page && rp < 0.04 && rq < 0.0005 && hv.v < 0.3 && !this.coarse && (this.gsapReady || false);
        const W = innerWidth, Hh = window.__svh || innerHeight;
        if (HB.ax == null) { HB.ax = (PH.x * 0.5 + 0.5) * W + Math.min(W * 0.1, 140) - 66; HB.ay = (-PH.y * 0.5 + 0.5) * Hh - Hh * 0.12 - 42; HB.x = HB.ax; HB.y = HB.ay; }
        HB.ax += (((PH.x * 0.5 + 0.5) * W + Math.min(W * 0.1, 140) - 66) - HB.ax) * 0.01; HB.ay += (((-PH.y * 0.5 + 0.5) * Hh - Hh * 0.12 - 42) - HB.ay) * 0.01;
        const tx2 = HB.ax + Math.sin(tt * 0.45) * 5 - Math.sin(tt * 0.23) * 3, ty2 = HB.ay + Math.sin(tt * 0.6 + 1.2) * 6;
        HB.x += (tx2 - HB.x) * 0.08; HB.y += (ty2 - HB.y) * 0.08; HB.op += ((show ? 1 : 0) - HB.op) * 0.08;
        HB.el.style.opacity = HB.op.toFixed(3); HB.el.style.transform = 'translate3d(' + HB.x.toFixed(1) + 'px,' + HB.y.toFixed(1) + 'px,0) scale(' + (0.8 + 0.2 * HB.op).toFixed(3) + ')'; }
      { const behind = rq > 0.97 && r3 < 0.6, zi = (PH.rb || 0) > 0.5 ? '2' : behind ? '2' : rq > 0.5 && r3 < 0.6 ? '61' : '1'; { const cS = this.ctaRef.current, cz = behind ? '62' : '3'; if (cS && cS.style.zIndex !== cz) cS.style.zIndex = cz; } /* above the z60 bleed layer */
        const inT = behind && (this.ra || 0) < 0.5 && (this.props.astroInTerminal ?? true) && (this.props.aboutMonitor || 'Model') !== 'Model' && !this.state.page; this._inTerm = inT;
        const zf = inT ? '63' : ((window.__wbFootP || 0) > 0.05 || window.__wbAboutOn ? '60' : zi); if (box.style.zIndex !== zf) box.style.zIndex = zf;
        const now = performance.now();
        if (inT && (!this._glR || now - this._glRt > 400)) { const g = document.querySelector('[data-about-glass]'); if (g) { this._glR = g.getBoundingClientRect(); this._glRt = now; } }
        let OV = this._glOv; if (!OV) { OV = this._glOv = document.createElement('div'); OV.setAttribute('aria-hidden', 'true'); OV.style.cssText = 'position:fixed;z-index:64;pointer-events:none;opacity:0;border-radius:4.5vmin;overflow:hidden;background:linear-gradient(162deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.03) 26%,rgba(255,255,255,0) 40%),repeating-linear-gradient(0deg,rgba(0,0,0,0.22) 0px,rgba(0,0,0,0.22) 1px,rgba(0,0,0,0) 1px,rgba(0,0,0,0) 3px);box-shadow:inset 0 0 9vmin rgba(0,0,0,0.85);'; const F = document.createElement('div'); F.style.cssText = 'position:absolute;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.05) 35%,rgba(0,0,0,0) 70%);opacity:0;'; OV.appendChild(F); OV.__f = F; document.body.appendChild(OV); }
        const op = inT ? '1' : '0'; if (OV.style.opacity !== op) OV.style.opacity = op;
        if (inT && this._glR) { const b = this._glR, since = (now - (this._knockHit || -1e9)) / 1000, sh = since < 0.6 ? Math.exp(-since * 9) * Math.sin(since * 70) * 4 : 0;
          const tf = sh ? 'translate3d(' + sh.toFixed(2) + 'px,' + (sh * 0.4).toFixed(2) + 'px,0)' : ''; const g = document.querySelector('[data-about-glass]'); if (g) g.style.transform = tf;
          OV.style.left = b.left + 'px'; OV.style.top = b.top + 'px'; OV.style.width = b.width + 'px'; OV.style.height = b.height + 'px'; OV.style.transform = tf;
          const cp = 'inset(' + b.top.toFixed(0) + 'px ' + (innerWidth - b.right).toFixed(0) + 'px ' + (innerHeight - b.bottom).toFixed(0) + 'px ' + b.left.toFixed(0) + 'px round 4.5vmin)'; if (box.style.clipPath !== cp) box.style.clipPath = cp;
          box.style.filter = 'saturate(0.55) contrast(1.08) brightness(0.92) drop-shadow(0 0 1.2vmin rgba(255,255,255,0.18))';
          const F = OV.__f; if (since < 0.9 && this._knockPt) { F.style.left = (this._knockPt[0] - b.left) + 'px'; F.style.top = (this._knockPt[1] - b.top) + 'px'; F.style.opacity = Math.max(0, 1 - since / 0.9).toFixed(3); F.style.transform = 'scale(' + (0.6 + since * 1.2).toFixed(3) + ')'; } else if (F.style.opacity !== '0') F.style.opacity = '0'; }
        else { if (box.style.clipPath) box.style.clipPath = ''; const g = this._glR && document.querySelector('[data-about-glass]'); if (g && g.style.transform) g.style.transform = ''; }
      } if (box.style.filter && !this._inTerm) box.style.filter = '';
      // leaving Work: no fade — he flies up and out the top; only hidden once fully past
      const keepR = !(this.props.reachSection ?? false), fade = ((PH.exitU || 0) < 0.999 || (PH.rb || 0) > 0.5) && (keepR || r3 < 0.6) ? 1 : 0, vis = (!this.state.page || this.closing) && (this.props.astroGlobal ?? true) && fade > 0.001 && (keepR || r3 < 0.6); /* Reach off: he stays with you down to the moon */
      if (this._scrRect && this._robot && this._robot.visible && this._scrPx && this._scrPx.z > 0.001) {
        const SR = this._scrRect, kz = Math.min(1, this._scrPx.z * 1.6); piv.updateMatrixWorld(true);
        const gw = piv.localToWorld(new T3.Vector3(SR.cx, SR.cy, 0)), nd = gw.clone().project(cam), dist = Math.abs(cam.position.z - gw.z), hh = Math.tan(cam.fov * Math.PI / 360) * dist;
        piv.position.x -= (nd.x - (this.props.monitorX ?? 0)) * hh * cam.aspect * kz; piv.position.y -= (nd.y - (this.props.monitorY ?? 0)) * hh * kz; piv.updateMatrixWorld(true);
      }
      if (this._scrRect && this._robot && this._robot.visible) {
        const SR0 = this._scrRect, gP = this.props, SR = { cx: SR0.cx + SR0.w * (gP.glassX ?? 0), cy: SR0.cy + SR0.h * (gP.glassY ?? 0), w: SR0.w * (gP.glassW ?? 1), h: SR0.h * (gP.glassH ?? 1) }, ins = gP.termInset ?? 0.08, hw = SR.w * (0.5 - ins), hh2 = SR.h * (0.5 - ins * 1.2), z = (SR0.z ?? 0) + 0.002, rcv = { left: 0, top: 0, width: innerWidth, height: innerHeight };
        piv.updateMatrixWorld(true);
        const pt = (x, y) => { const p = piv.localToWorld(new T3.Vector3(x, y, z)).project(cam); return [rcv.left + (p.x * 0.5 + 0.5) * rcv.width, rcv.top + (0.5 - p.y * 0.5) * rcv.height]; };
        this._scrQuad = { q: [pt(SR.cx - hw, SR.cy + hh2), pt(SR.cx + hw, SR.cy + hh2), pt(SR.cx + hw, SR.cy - hh2), pt(SR.cx - hw, SR.cy - hh2)], ar: hw / hh2 };
      } else this._scrQuad = null;
      if (!NATIVE && (this.props.astroArmAnims ?? false)) FIST(dt);
      if (!NATIVE && vis && (this.props.astroPhysics ?? true) && (this.props.astroMotion || 'Clean clip') !== 'Clean clip') PHYS(dt, tt); // rigged clips play exactly as recorded
      const op = vis ? fade.toFixed(3) : '0'; if (box.style.opacity !== op) box.style.opacity = op; shown = vis;
      // moon walk: once landed, walk clockwise along the moon's rim, off screen on the right, back in from the left
      { const WK = this._wk || (this._wk = { t: 0, phi: 0, w: 0 }), P = this.props, asp0 = halfW / Math.max(0.001, halfH), MC = window.__wbMoonC || { r: (P.footerMoonSize ?? 2.4) * Math.max(1, asp0 * 0.6) }, landed = (this._moonK || 0) > 0.98; // footer moon camera is ortho with half-height 1, so its radius is already in screen units
        if (!landed) { WK.t = 0; WK.phi = 0; WK.w = 0; }
        else { WK.t += dt; const go = (P.footerWalk ?? true) && WK.t > (P.footerWalkDelay ?? 3); WK.w += ((go ? 1 : 0) - WK.w) * (1 - Math.exp(-dt * 2.5));
          const Rw = Math.max(0.1, MC.r * halfH), lim = Math.asin(Math.min(1, (halfW * 1.25) / Rw));
          WK.phi += dt * WK.w * (P.footerWalkSpeed ?? 0.12) * 2.2 / Rw; if (WK.phi > lim) WK.phi = -lim;
          const ph = WK.phi; piv.position.x += Math.sin(ph) * Rw; piv.position.y += (Math.cos(ph) - 1) * Rw;
          const WQ = this._wkQ || (this._wkQ = { a: new T3.Quaternion(), b: new T3.Quaternion(), z: new T3.Vector3(0, 0, 1), y: new T3.Vector3(0, 1, 0) });
          WQ.a.setFromAxisAngle(WQ.z, -ph); WQ.b.setFromAxisAngle(WQ.y, WK.w * Math.PI / 2); piv.quaternion.premultiply(WQ.a).multiply(WQ.b); }
        // floor shadow follows him on the moon: under his feet, tilted to the rim (it was left flat at the landing spot)
        if (FLOOR) { const om = (this._moonK || 0), ph = WK.phi || 0, sF = piv.scale.x, dn = (0.5 + (P.astroFloorGap ?? 0.12)) * sF;
          if (om > 0.02) { FLOOR.position.set(piv.position.x + Math.sin(ph) * dn, piv.position.y - Math.cos(ph) * dn, 0);
            const FQ = this._flQ || (this._flQ = { x: new T3.Quaternion().setFromAxisAngle(new T3.Vector3(1, 0, 0), -Math.PI / 2), z: new T3.Quaternion(), ax: new T3.Vector3(0, 0, 1) });
            FQ.z.setFromAxisAngle(FQ.ax, -ph); FLOOR.quaternion.copy(FQ.z).multiply(FQ.x); FLOOR.material.opacity *= 1 - 0.5 * Math.min(1, Math.abs(ph) * 3); }
          else FLOOR.rotation.set(-Math.PI / 2, 0, 0); } }
      if (vis) { if (dOn && LOOK() !== 'Hologram') { const w = r.domElement.width, h = r.domElement.height; if (art.width !== w || art.height !== h) art.setSize(w, h); r.setRenderTarget(art); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam); r.setRenderTarget(null); r.clear(); r.render(qS, qC); } else r.render(sc, cam); }
      { const TM = this._term, SR = this._scrRect;
        if (!this._tp && TM && TM.__tc && SR && this._robot && (this.props.termOn3D ?? true)) {
          const tx = new T3.CanvasTexture(TM.__tc); tx.colorSpace = T3.SRGBColorSpace; tx.minFilter = T3.LinearFilter; tx.generateMipmaps = false;
          const mt = new T3.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, uniforms: { tx: { value: tx }, t: { value: 0 }, op: { value: 0 } },
            vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: 'precision highp float; varying vec2 v; uniform sampler2D tx; uniform float t, op;\n' +
              'float hs(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }\n' +
              'void main(){ vec2 c = v - 0.5; float d = dot(c, c); vec2 u = v + c * d * 0.18;\n' +
              ' vec2 q = abs(u - 0.5) * 2.0; float rr = 0.14; vec2 k = max(q - (1.0 - rr), 0.0); float edge = length(k) / rr; if (edge > 1.0 || u.x < 0.0 || u.x > 1.0 || u.y < 0.0 || u.y > 1.0) discard;\n' +
              ' float tc = texture2D(tx, u).r; float bl = 0.0; for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) bl += texture2D(tx, u + vec2(float(i), float(j)) * 0.0025).r; bl /= 25.0;\n' +
              ' vec3 col = mix(vec3(0.03, 0.035, 0.04), vec3(0.07, 0.08, 0.09), smoothstep(0.75, 0.0, length(c * vec2(1.0, 1.25)))) + vec3(tc) + vec3(bl) * 0.32;\n' +
              ' col *= 0.82 + 0.18 * sin(u.y * 900.0); col *= 0.97 + 0.03 * sin(t * 50.0); col += (hs(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.03;\n' +
              ' col *= 1.0 - smoothstep(0.35, 1.0, length(c) * 1.45) * 0.7; col += vec3(0.85, 0.9, 1.0) * smoothstep(0.62, 0.0, length((v - vec2(0.24, 0.8)) * vec2(1.0, 1.7))) * 0.08;\n' +
              ' gl_FragColor = vec4(col, op * (1.0 - smoothstep(0.85, 1.0, edge))); }' });
          const me = new T3.Mesh(new T3.PlaneGeometry(1, 1), mt); me.matrixAutoUpdate = false; me.frustumCulled = false; const s2 = new T3.Scene(); s2.add(me);
          this._tp = { s2, me, tx, mt, L: new T3.Matrix4(), P: new T3.Vector3(), Q: new T3.Quaternion(), S: new T3.Vector3() }; }
        const TP = this._tp;
        if (TP && vis && TM && SR) { const on = TM.__on3d ? 1 : (this._termCL ? 0 : 1) * (+TM.style.opacity || 0); TP.mt.uniforms.op.value = on;
          if (on > 0.01) { const tcv = TM.__tc; if (TP.tw !== tcv.width || TP.th !== tcv.height) { TP.tw = tcv.width; TP.th = tcv.height; TP.tx.dispose(); TP.tx = new T3.CanvasTexture(tcv); TP.tx.colorSpace = T3.SRGBColorSpace; TP.tx.minFilter = T3.LinearFilter; TP.tx.generateMipmaps = false; TP.mt.uniforms.tx.value = TP.tx; }
            if (TM.__dirty) { TM.__dirty = 0; TP.tx.needsUpdate = true; } TP.mt.uniforms.t.value = performance.now() / 1000; piv.updateMatrixWorld(true);
            const ins = this.props.termGlassInset ?? 0;
            const gP = this._builtMon ? {} : this.props; TP.L.compose(TP.P.set(SR.cx + SR.w * (gP.glassX ?? 0), SR.cy + SR.h * (gP.glassY ?? 0), (SR.z ?? 0) + 0.004), TP.Q.identity(), TP.S.set(SR.w * (1 - ins * 2) * (gP.glassW ?? 1), SR.h * (1 - ins * 2) * (gP.glassH ?? 1), 1));
            TP.me.matrix.multiplyMatrices(piv.matrixWorld, TP.L);
            { TP.me.matrixWorld.copy(TP.me.matrix); const RC = TP.RC || (TP.RC = new T3.Raycaster()), N2 = TP.N2 || (TP.N2 = new T3.Vector2());
              const hit = (x, y) => { N2.set(x, y); RC.setFromCamera(N2, cam); const h = RC.intersectObject(TP.me, false)[0]; return h && h.uv ? [h.uv.x, 1 - h.uv.y] : null; };
              const full = hit(-1, 1) && hit(1, -1) ? false : true, mxN = 0.1, myN = 0.14, cl = (v) => Math.max(0, Math.min(1, v));
              const tl = hit(-1 + mxN, 1 - myN), br = hit(1 - mxN, -1 + myN), c0 = hit(0, 0);
              if (tl && br) TM.__vis = [cl(tl[0]), cl(tl[1]), cl(br[0]), cl(br[1])];
              else if (c0) { const hw2 = 0.35, hh3 = 0.3; TM.__vis = [cl(c0[0] - hw2), cl(c0[1] - hh3), cl(c0[0] + hw2), cl(c0[1] + hh3)]; }
              else TM.__vis = [0, 0, 1, 1];
              if (!hit(-1, 1) && !hit(1, -1) && !hit(-1, -1) && !hit(1, 1)) TM.__vis = [0, 0, 1, 1];
              if (full) { const p = TM.__vis; if (p[2] - p[0] < 0.2 || p[3] - p[1] < 0.2) TM.__vis = [0, 0, 1, 1]; }
              if (!(tl || br || c0)) TM.__vis = [0, 0, 1, 1];
              TM.__ar = (SR.w * (gP.glassW ?? 1)) / Math.max(0.01, SR.h * (gP.glassH ?? 1)); }
            const ac = r.autoClear; r.autoClear = false; r.setRenderTarget(null); r.render(TP.s2, cam); r.autoClear = ac; } } }
    };
    loop();
  },
  async initLoaderAstro(el) {
    try {
      const [T, GL, MO] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')]);
      if (this.dead) return;
      const loader = new GL.GLTFLoader(); loader.setMeshoptDecoder(MO.MeshoptDecoder);
      try { const DL = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js'); const dl = new DL.DRACOLoader(); dl.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); loader.setDRACOLoader(dl); } catch (e) {}
      const url = (this.props.astroModel || '').trim() || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/Meshy_AI_Character_output-compressed.glb'; this._ldUrl = url;
      let g = await this.loadGLB(loader, url);
      if (this.dead || el.style.display === 'none') return;
      // identical pipeline to the hero astronaut: same renderer, lights, env, materials and dither post pass
      const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
      r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05 * (this.props.astroBright ?? 2.2); r.autoClear = false;
      const cv = r.domElement; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      el.appendChild(cv); this._ldCv = cv;
      const sc = new T.Scene(), cam = new T.PerspectiveCamera(24, 1, 0.1, 50);
      const key = new T.DirectionalLight(0xfff6ee, 2.2); key.position.set(2.8, 1.3, 0.9); sc.add(key);
      const rimL = new T.DirectionalLight(0xdfe8ff, 2.4); rimL.position.set(-2.6, 1.8, -2.0); sc.add(rimL);
      const fil = new T.DirectionalLight(0xc8d4e6, 0.45); fil.position.set(-1.8, -0.6, 1.6); sc.add(fil);
      sc.add(new T.HemisphereLight(0xcfd8e8, 0x050506, 0.25));
      try { const RE = await import('https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js'); const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; } catch (e) {}
      const m = g.scene;
      m.traverse((o) => { if (o.isMesh && o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); });
      const bb = new T.Box3().setFromObject(m, true), sz = bb.getSize(new T.Vector3()), k = 1 / Math.max(sz.x, sz.y, sz.z);
      m.scale.setScalar(k); m.position.sub(bb.getCenter(new T.Vector3()).multiplyScalar(k));
      const piv = new T.Group(); piv.add(m); sc.add(piv); piv.scale.setScalar(1.45); piv.rotation.y = -0.5; piv.position.y = -0.04 * Math.tan(12 * Math.PI / 180) * 4.2; piv.updateMatrixWorld(true);
      const wb = new T.Box3().setFromObject(piv, true), y0 = wb.min.y, y1 = wb.max.y;
      const U = { uFill: { value: y0 } }, P = { value: 0 }; this._ldU = P;
      m.traverse((o) => { if (!o.isMesh) return; o.frustumCulled = false; (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => {
        mt.envMapIntensity = 0.28; if (mt.roughness != null) mt.roughness = Math.max(mt.roughness, 0.45);
        mt.onBeforeCompile = (sh) => { sh.uniforms.uFill = U.uFill;
          sh.vertexShader = 'varying float vFY;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vFY = (modelMatrix * vec4(transformed, 1.0)).y;');
          sh.fragmentShader = 'uniform float uFill; varying float vFY;\n' + sh.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (vFY > uFill) discard;'); };
        mt.customProgramCacheKey = () => 'ldfill'; mt.needsUpdate = true; }); });
      // outline of the not-yet-filled body (drawn straight to screen, under the dithered fill)
      const hsc = new T.Scene(), hull = new T.MeshBasicMaterial({ color: 0xecebe6, side: T.BackSide, transparent: true, opacity: 0.45, depthWrite: false });
      hull.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <skinning_vertex>', '#include <skinning_vertex>\n transformed += normalize(normal) * 0.006 / ' + k.toFixed(6) + ';'); };
      const hpiv = new T.Group(); hsc.add(hpiv); const hm = m.clone(true); hpiv.add(hm);
      const sk = []; m.traverse((o) => { if (o.isSkinnedMesh) sk.push(o); });
      let si = 0; hm.traverse((o) => { if (!o.isMesh) return; const src = o.isSkinnedMesh ? sk[si++] : null; o.material = hull; o.frustumCulled = false; if (src) o.bind(src.skeleton, src.bindMatrix); });
      // hero post pass (exact copy)
      const art = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType });
      const qS = new T.Scene(), qC = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const qM = new T.ShaderMaterial({ transparent: true, uniforms: { tA: { value: art.texture }, uH: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: 'uniform sampler2D tA; uniform float uH; varying vec2 vUv; ' + this.ditherGLSL(2.0) + ' void main(){ vec4 c = texture2D(tA, vUv); vec3 rgb = c.rgb / max(c.a, 0.001); rgb = pow(rgb, vec3(1.0 / 2.2)); rgb = rgb * 1.3 / (1.0 + rgb * 0.55) + 0.02; float a = step(dqB8(gl_FragCoord.xy / 2.0) * 0.85 + 0.08, c.a); gl_FragColor = vec4(DQ(rgb), a); }' });
      qS.add(new T.Mesh(new T.PlaneGeometry(2, 2), qM));
      const fit = () => { const w = cv.clientWidth || 400, h = cv.clientHeight || 600; r.setSize(w, h, false); const pr = r.getPixelRatio(); art.setSize(Math.round(w * pr), Math.round(h * pr)); cam.aspect = w / h; cam.updateProjectionMatrix();
        cam.position.set(0, 0, 4.2); cam.lookAt(0, 0, 0); };
      fit(); addEventListener('resize', fit);
      let raf = 0, shv = 0; const t0 = performance.now();
      const loop = () => { raf = requestAnimationFrame(loop); shv += (P.value - shv) * 0.12; U.uFill.value = y0 + (y1 - y0) * (shv >= 0.999 ? 1.05 : shv);
        piv.rotation.y = -0.5 + Math.sin((performance.now() - t0) / 2200) * 0.12; piv.updateMatrixWorld(true); hpiv.position.copy(piv.position); hpiv.rotation.copy(piv.rotation); hpiv.scale.copy(piv.scale);
        r.setRenderTarget(null); r.clear();
        if (shv < 0.999) r.render(hsc, cam);
        r.setRenderTarget(art); r.clear(); r.render(sc, cam); r.setRenderTarget(null); r.render(qS, qC); };
      loop(); this._ldAstroOK = true;
      this._ldStop = () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); try { r.dispose(); r.forceContextLoss(); } catch (e) {} cv.remove(); };
    } catch (e) { console.warn('loader astronaut failed', e); this._ldAstroOK = true; }
  },
  async buildMonitor(T3) {
    console.log('[monitor] building custom CRT');
    const sh = this.props.monitorShade ?? 0.42, plastic = (c) => new T3.MeshStandardMaterial({ color: new T3.Color(c).multiplyScalar(Math.max(0.35, sh * 2)), roughness: 0.58, metalness: 0.02 });
    const pl = (c, r) => new T3.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.05 });
    const shell = pl(0x34332f, 0.5), dark = pl(0x0e0e0d, 0.45), trim = pl(0x22211f, 0.55);
    const g = new T3.Group(), add = (geo, mt, x, y, z, rx) => { const o = new T3.Mesh(geo, mt); o.position.set(x, y, z); if (rx) o.rotation.x = rx; g.add(o); return o; };
    const W = 1.0, H = 0.82, D = 0.62;
    const rbox = (w, h, d, r) => { const b = Math.min(r, d * 0.3), sh2 = new T3.Shape(), x = -w / 2 + b, y = -h / 2 + b, ww = w - 2 * b, hh = h - 2 * b, rc = Math.min(r, ww / 2, hh / 2);
      sh2.moveTo(x + rc, y); sh2.lineTo(x + ww - rc, y); sh2.quadraticCurveTo(x + ww, y, x + ww, y + rc); sh2.lineTo(x + ww, y + hh - rc); sh2.quadraticCurveTo(x + ww, y + hh, x + ww - rc, y + hh); sh2.lineTo(x + rc, y + hh); sh2.quadraticCurveTo(x, y + hh, x, y + hh - rc); sh2.lineTo(x, y + rc); sh2.quadraticCurveTo(x, y, x + rc, y);
      const gx = new T3.ExtrudeGeometry(sh2, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 8 }); gx.translate(0, 0, -(d - 2 * b) / 2); gx.computeVertexNormals(); return gx; };
    add(rbox(W, H, D, 0.07), shell, 0, 0, 0);
    add(rbox(W * 0.78, H * 0.74, 0.5, 0.09), shell, 0, 0.01, -D * 0.62);
    // recessed bezel: dark rounded frame sunk into the front
    const GW = 0.74, GH = 0.56, GY = 0.06, FZ = D / 2;
    const rr = (w, h, r) => { const s2 = new T3.Shape(), x = -w / 2, y = -h / 2; s2.moveTo(x + r, y); s2.lineTo(x + w - r, y); s2.quadraticCurveTo(x + w, y, x + w, y + r); s2.lineTo(x + w, y + h - r); s2.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s2.lineTo(x + r, y + h); s2.quadraticCurveTo(x, y + h, x, y + h - r); s2.lineTo(x, y + r); s2.quadraticCurveTo(x, y, x + r, y); return s2; };
    const bez = new T3.ExtrudeGeometry(rr(GW + 0.06, GH + 0.06, 0.07), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3 });
    add(bez, trim, 0, GY, FZ - 0.03);
    // glass: slightly bulged rounded rect (the terminal is drawn exactly on top of it)
    const gg = new T3.ShapeGeometry(rr(GW, GH, Math.min(GW, GH) * 0.14 * 0.5), 24), pos = gg.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) / (GW / 2), y = pos.getY(i) / (GH / 2); pos.setZ(i, 0.025 * Math.max(0, 1 - 0.5 * (x * x + y * y))); }
    gg.computeVertexNormals();
    const GZ = FZ + 0.03; add(gg, dark, 0, GY, GZ);
    // control strip: knobs, power light, vents
    const kn = new T3.CylinderGeometry(0.028, 0.028, 0.03, 20); [0.3, 0.38].forEach((x) => add(kn, dark, x, -H / 2 + 0.07, FZ + 0.01, Math.PI / 2));
    add(new T3.SphereGeometry(0.012, 12, 8), new T3.MeshStandardMaterial({ color: 0xc8612c, emissive: 0xc8612c, emissiveIntensity: 1.4 }), -0.38, -H / 2 + 0.07, FZ + 0.005);
    for (let i = 0; i < 6; i++) add(new T3.BoxGeometry(0.16, 0.006, 0.01), dark, -0.12 + 0, -H / 2 + 0.045 + i * 0.012, FZ + 0.002).scale.set(1, 1, 1);
    for (let i = 0; i < 7; i++) add(new T3.BoxGeometry(W * 0.5, 0.012, 0.02), dark, 0, H / 2 + 0.001, -0.05 - i * 0.05);
    // stand
    add(rbox(0.34, 0.08, 0.36, 0.03), trim, 0, -H / 2 - 0.03, -0.05);
    add(rbox(0.62, 0.035, 0.5, 0.012), shell, 0, -H / 2 - 0.085, -0.05);
    g.userData.glass = { x: 0, y: GY, w: GW, h: GH, z: GZ + 0.026 };
    return g;
  },
  async addScreenVideo() {
    const P = this.props, pt = this.portrait; if (!pt) return;
    const T = await import('https://esm.sh/three@0.160.0'); if (this.dead) return;
    { const k = P.computerLight ?? 0.6, sc = pt.scene;
      const hemi = new T.HemisphereLight(0xfff4e8, 0x1a1816, 1.2 * k), key = new T.DirectionalLight(0xfff1e0, 2.2 * k);
      key.position.set(1.6, 2.4, 3.2); sc.add(hemi); sc.add(key); this._cLights = [hemi, key]; }
    if (!(P.screenVideoOn ?? true)) return;
    const src = (P.screenVideo || '').trim() || 'https://threejs.org/examples/textures/sintel.mp4';
    const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.autoplay = true; v.src = src;
    v.play().catch(() => { const go = () => { v.play().catch(() => {}); removeEventListener('pointerdown', go); }; addEventListener('pointerdown', go); });
    const vt = new T.VideoTexture(v); vt.colorSpace = T.SRGBColorSpace;
    // find the screen in the texture: the blue CRT pixels
    let best = null;
    const meshes = []; pt.model.traverse((o) => { if (o.isMesh && o.material && o.material.map && o.material.map.image) meshes.push(o); });
    for (const o of meshes) {
      const img = o.material.map.image, W = 256, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d', { willReadFrequently: true }); try { g.drawImage(img, 0, 0, W, H); } catch (e) { continue; }
      const d = g.getImageData(0, 0, W, H).data, xs = [], ys = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4, r = d[k], gg = d[k + 1], b = d[k + 2]; if (b > 110 && b > r + 45 && gg > r) { xs.push(x); ys.push(y); } }
      if (!best || xs.length > best.n) best = { o, n: xs.length, xs, ys, W, H };
    }
    if (!best || best.n < 40) { console.warn('screen not found in texture'); return; }
    const q = (a, f) => { const b = a.slice().sort((m, n) => m - n); return b[Math.min(b.length - 1, Math.round(f * (b.length - 1)))]; };
    const u0 = q(best.xs, 0.02) / best.W, u1 = (q(best.xs, 0.98) + 1) / best.W, v0 = q(best.ys, 0.02) / best.H, v1 = (q(best.ys, 0.98) + 1) / best.H;
    const flipY = !!best.o.material.map.flipY;
    const mat = new T.ShaderMaterial({ transparent: false, depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, side: T.FrontSide,
      uniforms: { map: { value: best.o.material.map }, vid: { value: vt }, uMin: { value: new T.Vector2(u0, v0) }, uMax: { value: new T.Vector2(u1, v1) }, uFlip: { value: flipY ? 1 : 0 }, uGain: { value: P.screenGain ?? 1.1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map, vid; uniform vec2 uMin, uMax; uniform float uFlip, uGain; varying vec2 vUv;\n' +
        'void main(){ vec2 tu = vec2(vUv.x, uFlip > 0.5 ? 1.0 - vUv.y : vUv.y); vec3 t = texture2D(map, vUv).rgb;\n' +
        ' float m = smoothstep(0.1, 0.22, t.b - t.r) * step(t.r, t.g); if (m < 0.5) discard;\n' +
        ' vec2 s = (tu - uMin) / (uMax - uMin); if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0) discard;\n' +
        ' vec3 c = texture2D(vid, vec2(s.x, 1.0 - s.y)).rgb * uGain; c *= 0.9 + 0.1 * sin(gl_FragCoord.y * 1.6);\n' +
        ' gl_FragColor = vec4(c, 1.0); }' });
    const ov = new T.Mesh(best.o.geometry, mat); ov.name = 'screen-video'; ov.renderOrder = 3; best.o.add(ov);
    this._scr = { ov, v };
  },
  detectScreen(T3, piv, rb) {
    // one pass over vertices: dark, camera-facing texels → 2D histogram → largest blob = CRT glass
    const sv = { p: piv.position.clone(), q: piv.quaternion.clone(), s: piv.scale.clone() };
    piv.position.set(0, 0, 0); piv.quaternion.identity(); piv.scale.setScalar(1); piv.updateMatrixWorld(true);
    const wb = new T3.Box3().setFromObject(rb, true), wz = wb.getSize(new T3.Vector3());
    const N = 40, H = new Float32Array(N * N), ZS = new Float32Array(N * N), cache = new Map(), v = new T3.Vector3(), n = new T3.Vector3(), nm = new T3.Matrix3();
    let total = 0;
    rb.traverse((o) => {
      if (!o.isMesh || !o.geometry) return; const g = o.geometry, P = g.attributes.position, NO = g.attributes.normal, UV = g.attributes.uv; if (!P || !NO || !UV) return;
      const mt = Array.isArray(o.material) ? o.material[0] : o.material, img = mt && mt.map && mt.map.image; if (!img) return;
      let d = cache.get(img); if (!d) { const c = document.createElement('canvas'); c.width = c.height = 128; const cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, 128, 128); d = cx.getImageData(0, 0, 128, 128).data; cache.set(img, d); }
      nm.getNormalMatrix(o.matrixWorld); const flip = !!mt.map.flipY, step = Math.max(1, Math.floor(P.count / 60000));
      for (let i = 0; i < P.count; i += step) {
        n.fromBufferAttribute(NO, i).applyMatrix3(nm).normalize(); if (n.z < 0.75) continue;
        let u = UV.getX(i) % 1, w = UV.getY(i) % 1; if (u < 0) u += 1; if (w < 0) w += 1; if (flip) w = 1 - w;
        const k = ((Math.min(127, (w * 128) | 0)) * 128 + Math.min(127, (u * 128) | 0)) * 4, l = (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) / 255;
        if (l > 0.28) continue;
        v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld);
        const gx = Math.min(N - 1, Math.max(0, ((v.x - wb.min.x) / wz.x * N) | 0)), gy = Math.min(N - 1, Math.max(0, ((v.y - wb.min.y) / wz.y * N) | 0));
        H[gy * N + gx] += 1; ZS[gy * N + gx] += v.z; total++;
      }
    });
    piv.position.copy(sv.p); piv.quaternion.copy(sv.q); piv.scale.copy(sv.s); piv.updateMatrixWorld(true);
    if (total < 30) { console.warn('[monitor] screen not found'); return null; }
    const seen = new Uint8Array(N * N); let best = null;
    for (let k0 = 0; k0 < N * N; k0++) { if (!H[k0] || seen[k0]) continue; const st = [k0], cells = []; seen[k0] = 1;
      while (st.length) { const k = st.pop(); cells.push(k); const i = k % N, j = (k / N) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + dx, jj = j + dy; if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue; const kk = jj * N + ii; if (!seen[kk] && H[kk]) { seen[kk] = 1; st.push(kk); } } }
      if (!best || cells.length > best.length) best = cells; }
    if (!best || best.length < 6) return null;
    let i0 = N, i1 = 0, j0 = N, j1 = 0; best.forEach((k) => { const i = k % N, j = (k / N) | 0; i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); });
    const r = { cx: wb.min.x + wz.x * (i0 + i1 + 1) / 2 / N, cy: wb.min.y + wz.y * (j0 + j1 + 1) / 2 / N, w: wz.x * (i1 - i0 + 1) / N, h: wz.y * (j1 - j0 + 1) / N };
    let zs = 0, zn = 0; best.forEach((k) => { zs += ZS[k]; zn += H[k]; }); r.z = zn ? zs / zn : wb.max.z;
    console.log('[monitor] screen', JSON.stringify(r)); return r;
  },
  crtInit(T) {
    const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    T.insertBefore(cv, T.firstChild); T.style.background = 'none'; T.style.boxShadow = 'none'; T.style.color = 'transparent'; T.style.textShadow = 'none';
    T.querySelectorAll('[data-t-car]').forEach((c) => { c.style.visibility = 'hidden'; });
    const gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true }); if (!gl) return;
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision highp float; varying vec2 v; uniform sampler2D tx; uniform vec2 res; uniform float t;
      float hs(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float txt(vec2 u){ return texture2D(tx, u).r; }
      void main(){
        vec2 c = v - 0.5; float d = dot(c, c); vec2 u = v + c * d * 0.22;
        vec2 q = abs(u - 0.5) * 2.0; float rr = 0.12; vec2 k = max(q - (1.0 - rr), 0.0); float edge = length(k) / rr;
        if (u.x < 0.0 || u.x > 1.0 || u.y < 0.0 || u.y > 1.0 || edge > 1.0) { gl_FragColor = vec4(0.0); return; }
        vec2 uu = vec2(u.x, 1.0 - u.y), px = 1.0 / res;
        float ca = 0.0012 + d * 0.004;
        vec3 tc = vec3(txt(uu + vec2(ca * 0.35, 0.0)), txt(uu), txt(uu - vec2(ca * 0.35, 0.0)));
        float bl = 0.0; for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) bl += txt(uu + vec2(float(i), float(j)) * px * 3.0); bl /= 25.0;
        vec3 base = mix(vec3(0.035, 0.06, 0.075), vec3(0.075, 0.13, 0.15), smoothstep(0.75, 0.0, length(c * vec2(1.0, 1.25))));
        vec3 col = base + vec3(max(max(tc.r, tc.g), tc.b)) * 1.0 + vec3(bl) * 0.32;
        float sl = 0.78 + 0.22 * sin(u.y * res.y * 1.5708); col *= sl;
        float m = mod(gl_FragCoord.x, 3.0); col *= vec3(m < 1.0 ? 1.06 : 0.94, m >= 1.0 && m < 2.0 ? 1.06 : 0.94, m >= 2.0 ? 1.06 : 0.94);
        col *= 1.0 - 0.06 * smoothstep(0.0, 0.08, abs(fract(u.y * 0.8 - t * 0.12) - 0.5) - 0.42);
        col *= 0.97 + 0.03 * sin(t * 50.0);
        col += (hs(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.035;
        col *= 1.0 - smoothstep(0.35, 1.0, length(c) * 1.45) * 0.75;
        float refl = smoothstep(0.62, 0.0, length((v - vec2(0.24, 0.8)) * vec2(1.0, 1.7))) * 0.10 + smoothstep(0.02, 0.0, abs(v.x + v.y * 0.35 - 0.62)) * 0.035;
        col += vec3(0.85, 0.92, 1.0) * refl;
        float a = 1.0 - smoothstep(0.82, 1.0, edge);
        gl_FragColor = vec4(col, a);
      }`));
    gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pl = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    const uR = gl.getUniformLocation(pr, 'res'), uT = gl.getUniformLocation(pr, 't');
    const tc = document.createElement('canvas'), g = tc.getContext('2d'); let key = ''; T.__tc = tc; T.__cv = cv;
    const draw = () => {
      const G3 = !!T.__on3d, W = T.clientWidth, H = T.clientHeight; if (!G3 && (W < 8 || H < 8)) return;
      const dpr = Math.min(2, devicePixelRatio || 1), cw = G3 ? 1280 : Math.round(W * dpr), ch = G3 ? Math.round(1280 / Math.max(0.3, T.__ar || 1.33)) : Math.round(H * dpr);
      const VV = G3 ? (T.__vis || [0, 0, 1, 1]) : [0, 0, 1, 1];
      const head = (T.querySelector('[data-t-head]') || {}).textContent || '', body = (T.querySelector('[data-t-txt]') || {}).textContent || '';
      const blink = Math.floor(performance.now() / 530) % 2;
      const k2 = [cw, ch, head, body, blink, VV.map((v) => v.toFixed(2)).join()].join('|');
      if (k2 !== key) { key = k2;
        if (tc.width !== cw || tc.height !== ch) { tc.width = cw; tc.height = ch; cv.width = cw; cv.height = ch; }
        const cs = getComputedStyle(T), vw2 = (VV[2] - VV[0]) * cw, vh2 = (VV[3] - VV[1]) * ch;
        const fs = G3 ? Math.max(10, Math.min(vh2 * 0.06, vw2 * 0.042)) : parseFloat(cs.fontSize) * dpr, lh = fs * 1.45, px = G3 ? VV[0] * cw + vw2 * 0.08 : parseFloat(cs.paddingLeft) * dpr, py = G3 ? VV[1] * ch + vh2 * 0.1 : parseFloat(cs.paddingTop) * dpr, maxW = G3 ? vw2 * 0.84 : cw - px * 2;
        g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); g.font = cs.fontWeight + ' ' + fs.toFixed(1) + 'px ' + cs.fontFamily; g.textBaseline = 'top';
        g.fillStyle = 'rgba(255,255,255,0.72)'; g.fillText(head, px, py);
        g.fillStyle = '#fff'; let x = px, y = py + lh * 1.8;
        body.split(/(\s+)/).forEach((w) => { if (!w) return; const ww = g.measureText(w).width; if (/^\s+$/.test(w)) { x += ww; return; } if (x + ww > px + maxW && x > px) { x = px; y += lh; } g.fillText(w, x, y); x += ww; });
        if (blink) g.fillRect(x + fs * 0.1, y, fs * 0.6, fs * 1.05);
        T.__dirty = 1; if (G3) return; gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc); }
      if (G3) return;
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, performance.now() / 1000);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = () => { if (this.dead) return; requestAnimationFrame(loop); if (+T.style.opacity > 0.01 || T.__on3d) draw(); };
    requestAnimationFrame(loop);
  },
  async loadGLB(loader, url) {
    const C = window.__glbCache || (window.__glbCache = {}), P = window.__glbProg || (window.__glbProg = {});
    if (!C[url]) C[url] = (async () => {
      const cdn = url.replace('https://raw.githubusercontent.com/wuppie/wubble/main/', 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/');
      for (const u of cdn === url ? [url] : [cdn, url]) {
        try { const r = await fetch(u); if (!r.ok) continue;
          const tot = +r.headers.get('content-length') || 0;
          if (!r.body || !r.body.getReader) { const b = await r.arrayBuffer(); P[url] = 1; return b; }
          const rd = r.body.getReader(), parts = []; let got = 0;
          for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; P[url] = tot ? Math.min(0.99, got / tot) : 1 - Math.exp(-got / 4e6); }
          const out = new Uint8Array(got); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } P[url] = 1; return out.buffer;
        } catch (e) { console.warn('glb fetch failed', u, e); } }
      throw new Error('glb load failed ' + url); })();
    const buf = await C[url];
    return await new Promise((res, rej) => loader.parse(buf.slice(0), '', res, rej));
  }
});
(window.WBL = window.WBL || {}).astro = 1;
