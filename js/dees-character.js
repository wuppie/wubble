/*!
 * Dees — animated 3D character (Mixamo FBX) for hero + bottom section.
 * ES module. Webflow: <script type="module" src=".../dees-character.js"></script> (after GSAP).
 *
 * Hooks (all editable as custom attributes):
 *  [data-character="hero"]  data-anim-preload="…hiphop.fbx" (also the skinned model) data-anim-idle="…idle.fbx"
 *  [data-character="cta"]   data-anim-walk="…walk.fbx" data-anim-kick="…kick.fbx" (model = data-model or hero preload file)
 *  [data-character-poster]  fallback image inside each, hidden once the 3D model is on screen.
 * Talks to the preloader in dees-site.js via window events: dees:char-progress {p:0..1}, dees:preloader-exit.
 */
import * as THREE from 'https://esm.sh/three@0.160.0';
import { FBXLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'https://esm.sh/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
const gltfLoader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();

const loader = new FBXLoader();
const cache = {};
// Asset base: [data-asset-base] on the page wrapper (e.g. jsDelivr on your GitHub repo).
// Relative paths are tried on the base first, then locally — so the design preview keeps working before upload.
const assetBase = () => { const el = document.querySelector('[data-asset-base]'); return el ? el.getAttribute('data-asset-base') || '' : ''; };
const candidates = url => {
  if (!url) return [];
  if (/^(https?:)?\/\//.test(url)) return [url];
  const b = assetBase(); if (!b) return [url];
  const root = b.replace(/\/?$/, '/'), clean = url.replace(/^\.?\//, ''), file = clean.split('/').pop();
  return [...new Set([root + file, root + clean, url])];
};
// .json = AnimationClip (tiny), .glb/.gltf = model, anything else = FBX
const loadOne = (u, onProg) => {
  const pr = e => { if (e && e.total && onProg) onProg(e.loaded / e.total); };
  if (/\.json(\?|#|$)/i.test(u)) return fetch(u).then(r => { if (!r.ok) throw new Error(r.status + ' ' + u); return r.json(); })
    .then(js => { onProg && onProg(1); return { animations: [THREE.AnimationClip.parse(js)] }; });
  if (/\.(glb|gltf)(\?|#|$)/i.test(u)) return new Promise((ok, no) => gltfLoader.load(u, g => { g.scene.animations = g.animations || []; ok(g.scene); }, pr, no));
  return new Promise((ok, no) => loader.load(u, ok, pr, no));
};
const texCache = {};
const loadTex = (url, flip, linear) => {
  if (!url) return Promise.resolve(null);
  if (!texCache[url]) texCache[url] = (async () => {
    let err; for (const u of candidates(url)) { try { const t = await texLoader.loadAsync(u); t.colorSpace = linear ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.flipY = flip; t.anisotropy = 8; t.needsUpdate = true; return t; } catch (e) { err = e; } }
    throw err;
  })();
  return texCache[url];
};
const applyTex = (obj, tex, nrm, ns) => { if (!tex && !nrm) return; obj.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
  if (tex) { m.map = tex; m.color && m.color.set(0xffffff); }
  if (nrm && 'normalMap' in m) { m.normalMap = nrm; m.normalScale && m.normalScale.set(ns, ns); }
  m.needsUpdate = true; }); }); };
const normalOpts = el => ({ url: el && el.getAttribute('data-normal-map'), scale: el && el.hasAttribute('data-normal-scale') ? parseFloat(el.getAttribute('data-normal-scale')) : 1 });
const loadFBX = (url, onProg) => {
  if (!cache[url]) cache[url] = (async () => {
    let err; for (const u of candidates(url)) { try { return await loadOne(u, onProg); } catch (e) { err = e; } }
    throw err || new Error('no url');
  })();
  return cache[url];
};
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const wait = (test, ms = 15000) => new Promise(res => { const t0 = performance.now(); const i = setInterval(() => { const v = test(); if (v || performance.now() - t0 > ms) { clearInterval(i); res(v); } }, 50); });

// keep animations in place: lock Hips X/Z to their first-frame value
// + match Hips height to the target model's bind pose and drop scale tracks (unit mismatch = size jump)
function clipOf(fbx, target) {
  const src = fbx.animations && fbx.animations[0];
  if (!src) return null;
  const c = src.clone();
  let hipsY = null;
  if (target) target.traverse(o => { if (hipsY === null && o.isBone && /Hips$/.test(o.name)) hipsY = o.position.y; });
  c.tracks = c.tracks.filter(t => !/\.scale$/.test(t.name));
  c.tracks.forEach(t => {
    if (/Hips\.position$/.test(t.name)) {
      const v = t.values, x0 = v[0], z0 = v[2], y0 = v[1];
      const k = (hipsY && y0 && Math.abs(hipsY / y0 - 1) > .15) ? hipsY / y0 : 1;
      for (let i = 0; i < v.length; i += 3) { v[i] = x0 * k; v[i + 1] *= k; v[i + 2] = z0 * k; }
    } else if (/\.position$/.test(t.name) && !/Hips/.test(t.name)) t.__drop = true;
  });
  c.tracks = c.tracks.filter(t => !t.__drop);
  return c;
}
// smooth normals welded by position (UV seams no longer show as hard edges)
function smoothNormals(g) {
  const p = g.attributes.position, n = p.count, idx = g.index ? g.index.array : null;
  const key = new Int32Array(n), map = new Map(); let k = 0;
  for (let i = 0; i < n; i++) { const s = Math.round(p.getX(i) * 1e3) + ',' + Math.round(p.getY(i) * 1e3) + ',' + Math.round(p.getZ(i) * 1e3); let v = map.get(s); if (v === undefined) { v = k++; map.set(s, v); } key[i] = v; }
  const acc = new Float32Array(k * 3), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const tri = idx ? idx.length : n;
  for (let t = 0; t < tri; t += 3) {
    const i0 = idx ? idx[t] : t, i1 = idx ? idx[t + 1] : t + 1, i2 = idx ? idx[t + 2] : t + 2;
    a.fromBufferAttribute(p, i0); b.fromBufferAttribute(p, i1); c.fromBufferAttribute(p, i2);
    c.sub(b); a.sub(b); c.cross(a); // area-weighted face normal
    for (const i of [i0, i1, i2]) { const q = key[i] * 3; acc[q] += c.x; acc[q + 1] += c.y; acc[q + 2] += c.z; }
  }
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const q = key[i] * 3, x = acc[q], y = acc[q + 1], z = acc[q + 2], l = Math.hypot(x, y, z) || 1; out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l; }
  g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
}
// measure the SKINNED bounds (bind pose), put feet on y=0 and centre x/z; returns height
function fit(obj) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3();
  obj.traverse(o => { if (o.isSkinnedMesh) { o.computeBoundingBox(); box.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld)); } else if (o.isMesh) box.expandByObject(o); });
  if (box.isEmpty()) return 180;
  const c = box.getCenter(new THREE.Vector3());
  obj.position.x -= c.x; obj.position.z -= c.z; obj.position.y -= box.min.y;
  return box.max.y - box.min.y;
}
function prep(obj) {
  obj.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    o.frustumCulled = false;
    if (!o.geometry.attributes.normal && !o.geometry.userData.smoothed) { smoothNormals(o.geometry); o.geometry.userData.smoothed = true; }
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
      m.side = THREE.DoubleSide; // source asset is double-sided (hair shells are single faces)
      m.transparent = false; m.opacity = 1; m.depthWrite = true; m.depthTest = true; m.alphaTest = 0; // no sorting artefacts in the hair
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      if ('shininess' in m) { m.shininess = 12; m.specular && m.specular.set(0x161616); }
    });
    // inner "backing" shell: same skinned mesh pushed slightly inward, dark hair colour — fills the gaps between hair curls
    if (o.isSkinnedMesh && !o.userData.backed) {
      o.userData.backed = true;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      o.userData.backInset = (o.geometry.boundingBox.max.y - o.geometry.boundingBox.min.y) * 0.0035;
      const back = new THREE.MeshBasicMaterial({ color: 0x0d0b0b, side: THREE.DoubleSide });
      back.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <skinning_vertex>', '#include <skinning_vertex>\n  transformed -= normalize(objectNormal) * ' + o.userData.backInset.toFixed(5) + ';'); };
      back.customProgramCacheKey = () => 'dees-hair-back';
      const sh = new THREE.SkinnedMesh(o.geometry, back);
      sh.bind(o.skeleton, o.bindMatrix); sh.frustumCulled = false; sh.renderOrder = -1; sh.userData.backed = true; sh.castShadow = false;
      sh.position.copy(o.position); sh.quaternion.copy(o.quaternion); sh.scale.copy(o.scale);
      o.parent.add(sh);
    }
  });
}
function stage(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9c4bc, 2.0));
  scene.add(new THREE.AmbientLight(0xffffff, .45));
  const d = new THREE.DirectionalLight(0xffffff, 2.0); d.position.set(-250, 300, 450); scene.add(d);
  const fill = new THREE.DirectionalLight(0xfff4ee, 1.1); fill.position.set(120, -60, 600); scene.add(fill);
  const cam = new THREE.PerspectiveCamera(30, 1, 1, 10000);
  return { r, scene, cam };
}
// frame a character of height h: frac = share of canvas height, feet = feet position from top (0..1)
function frame(st, canvas, h, frac, feet) {
  const w = canvas.clientWidth || 1, hh = canvas.clientHeight || 1;
  if (canvas.width !== Math.round(w * st.r.getPixelRatio()) || canvas.height !== Math.round(hh * st.r.getPixelRatio())) st.r.setSize(w, hh, false);
  st.cam.aspect = w / hh;
  const H = h / frac, dist = (H / 2) / Math.tan(THREE.MathUtils.degToRad(st.cam.fov / 2));
  const cy = feet * H - H / 2;
  st.cam.position.set(0, cy, dist); st.cam.lookAt(0, cy, 0); st.cam.updateProjectionMatrix();
  return { H, halfW: H / 2 * st.cam.aspect };
}
const SHADOW = 'drop-shadow(-3.47vw 3.47vw 1.65vw rgba(0,0,0,0.25))';
// React (Design preview) or Webflow interactions may replace nodes: always resolve the live element
const liveEl = (sel, el) => (el && el.isConnected) ? el : (document.querySelector(sel) || el);
const visible = (el, cb) => { const io = new IntersectionObserver(es => cb(es[0].isIntersecting)); io.observe(el); return io; };

// ---------------- HERO ----------------
async function hero(el) {
  const heroSel = '[data-character="hero"]';
  const gsap = await wait(() => window.gsap);
  const preloadUrl = el.getAttribute('data-anim-preload'), idleUrl = el.getAttribute('data-anim-idle');
  let poster = el.querySelector('[data-character-poster]');
  const pl = document.querySelector('[data-preloader]');
  const inPreloader = pl && !window.__deesPreloaderDone && getComputedStyle(pl).display !== 'none';
  const canvas = document.createElement('canvas');
  canvas.className = 'hero_character-canvas'; canvas.setAttribute('aria-hidden', 'true');
  const innerCss = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:2;filter:' + SHADOW + ';';
  if (inPreloader) {
    // same size as the hero slot from the first frame, so landing only moves it (no scale jump)
    const sizeToHero = () => {
      const r = liveEl(heroSel, el).getBoundingClientRect();
      const w = r.width > 10 ? r.width : Math.min(innerHeight, innerWidth) * .78, hh = r.height > 10 ? r.height : w;
      canvas.style.width = w + 'px'; canvas.style.height = hh + 'px';
    };
    canvas.style.cssText = 'position:fixed;left:50%;top:50%;display:block;pointer-events:none;z-index:1000;opacity:0;filter:' + SHADOW + ';';
    sizeToHero();
    gsap.set(canvas, { xPercent: -50, yPercent: -50 });
    document.body.appendChild(canvas);
    const onRs = () => { if (!window.__deesPreloaderDone) sizeToHero(); else removeEventListener('resize', onRs); };
    addEventListener('resize', onRs);
  } else { canvas.style.cssText = innerCss + 'opacity:0;'; el.appendChild(canvas); }

  const st = stage(canvas);
  const modelUrl = el.getAttribute('data-model') || preloadUrl;
  const texUrl = el.getAttribute('data-texture'), flip = el.getAttribute('data-texture-flip') !== 'false';
  let pm = 0, pc = 0, pt = texUrl ? 0 : 1, p2 = 0;
  const prog = () => emit('dees:char-progress', { p: Math.min(1, pm * .55 + pc * .15 + pt * .12 + p2 * .18) });
  let base, danceSrc, tex;
  try {
    [base, danceSrc, tex] = await Promise.all([
      loadFBX(modelUrl, p => { pm = p; prog(); }).then(v => { pm = 1; prog(); return v; }),
      modelUrl === preloadUrl ? null : loadFBX(preloadUrl, p => { pc = p; prog(); }).then(v => { pc = 1; prog(); return v; }),
      loadTex(texUrl, flip).then(v => { pt = 1; prog(); return v; }).catch(() => { pt = 1; prog(); return null; })
    ]);
  } catch (e) { console.warn('[dees-character] hero model failed', e); emit('dees:char-progress', { p: 1 }); canvas.remove(); return; }
  pc = 1; prog();
  el = liveEl(heroSel, el); poster = el.querySelector('[data-character-poster]');
  if (!inPreloader && canvas.parentNode !== el) el.appendChild(canvas);
  prep(base); applyTex(base, tex); st.scene.add(base);
  const no = normalOpts(el); loadTex(no.url, flip, true).then(n => applyTex(base, null, n, no.scale)).catch(() => {});
  el.__deesBase = base; el.__deesTex = tex;
  const h = fit(base) || 180;
  const mixer = new THREE.AnimationMixer(base);
  const dance = mixer.clipAction(clipOf(danceSrc || base, base)); dance.play();
  let idle = null, landed = !inPreloader, switched = false;
  const toIdle = () => { if (!idle || switched) return; switched = true; idle.reset().play(); dance.crossFadeTo(idle, .9, false); };
  loadFBX(idleUrl, p => { p2 = p; prog(); }).then(f => { idle = mixer.clipAction(clipOf(f, base)); p2 = 1; prog(); if (landed || window.__deesPreloaderDone) toIdle(); })
    .catch(() => { p2 = 1; prog(); });

  mixer.update(0); base.updateMatrixWorld(true);
  gsap.to(canvas, { opacity: 1, duration: .8, delay: .05, ease: 'power2.out' });
  if (!inPreloader && poster) gsap.to(poster, { autoAlpha: 0, duration: .8 });

  const land = () => {
    el = liveEl('[data-character="hero"]', el); poster = el.querySelector('[data-character-poster]');
    const r = el.getBoundingClientRect();
    if (poster) poster.style.visibility = 'hidden';
    toIdle();
    const cr = canvas.getBoundingClientRect();
    gsap.set(canvas, { left: cr.left, top: cr.top, width: r.width, height: r.height, xPercent: 0, yPercent: 0 });
    gsap.to(canvas, { left: r.left, top: r.top, duration: 1.4, ease: 'power3.inOut',
      onComplete: () => { el = liveEl('[data-character="hero"]', el); poster = el.querySelector('[data-character-poster]'); el.appendChild(canvas); canvas.style.cssText = innerCss; gsap.set(canvas, { clearProps: 'transform' }); landed = true; if (poster) poster.style.visibility = 'hidden'; } });
  };
  if (inPreloader) {
    if (window.__deesPreloaderDone) land(); else window.addEventListener('dees:preloader-exit', land, { once: true });
  }

  let on = true; visible(el, v => { on = v || !landed; });
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, clock.getDelta());
    if (landed && !el.isConnected) {
      el = liveEl(heroSel, el); poster = el.querySelector('[data-character-poster]');
      if (el.isConnected) { el.appendChild(canvas); canvas.style.cssText = innerCss; if (poster) poster.style.visibility = 'hidden'; visible(el, v => { on = v; }); }
    }
    if (!on) return;
    mixer.update(dt);
    frame(st, canvas, h, .8, .94);
    st.r.render(st.scene, st.cam);
  })();
  return base;
}

// ---------------- BOTTOM SECTION: walk in from the left, then kick ----------------
async function cta(el, heroEl) {
  const gsap = await wait(() => window.gsap);
  const ctaSel = '[data-character="cta"]';
  let poster = el.querySelector('[data-character-poster]');
  const modelUrl = el.getAttribute('data-model') || (heroEl && (heroEl.getAttribute('data-model') || heroEl.getAttribute('data-anim-preload')));
  const texUrl = el.getAttribute('data-texture') || (heroEl && heroEl.getAttribute('data-texture'));
  const flip = (el.getAttribute('data-texture-flip') || (heroEl && heroEl.getAttribute('data-texture-flip'))) !== 'false';
  const walkUrl = el.getAttribute('data-anim-walk'), kickUrl = el.getAttribute('data-anim-kick');
  let sec = el.closest('[data-cta]') || el;
  const canvas = document.createElement('canvas');
  canvas.className = 'cta_character-canvas'; canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:2;filter:' + SHADOW + ';';
  el.appendChild(canvas);
  const st = stage(canvas);
  let on = true, started0 = false;
  function reattach() {
    if (el.isConnected) return;
    const n = liveEl(ctaSel, el); if (!n.isConnected) return;
    el = n; poster = el.querySelector('[data-character-poster]'); sec = el.closest('[data-cta]') || el;
    el.appendChild(canvas); if (started0 && poster) poster.style.visibility = 'hidden';
    visible(sec, v => { on = v; });
  }

  // lazy-load when the section gets close
  const liveSec = () => { reattach(); return sec; };
  const inView = (margin, share) => new Promise(res => { const t = setInterval(() => { const r = liveSec().getBoundingClientRect(), vh = window.innerHeight;
    if (r.height && r.top < vh - share * Math.min(vh, r.height) + margin && r.bottom > -margin) { clearInterval(t); res(); } }, 120); });
  await inView(1400, 0);
  let base; try { base = await loadFBX(modelUrl); } catch (e) { console.warn('[dees-character] cta model failed', e); canvas.remove(); return; }
  const model = SkeletonUtils.clone(base); prep(model);
  model.position.set(0, 0, 0);
  const pivot = new THREE.Group(); pivot.add(model); st.scene.add(pivot);
  loadTex(texUrl, flip).then(t => applyTex(model, t)).catch(() => {});
  const no = normalOpts(el.hasAttribute('data-normal-map') ? el : heroEl); loadTex(no.url, flip, true).then(n => applyTex(model, null, n, no.scale)).catch(() => {});
  const h = fit(model) || 180;
  const mixer = new THREE.AnimationMixer(model);
  const useFly = el.hasAttribute('data-anim-fly');
  const [walkF, kickF] = useFly ? [null, null] : await Promise.all([walkUrl ? loadFBX(walkUrl).catch(() => null) : null, kickUrl ? loadFBX(kickUrl).catch(() => null) : null]);
  const walk = walkF ? mixer.clipAction(clipOf(walkF, model)) : null;
  const kick = kickF ? mixer.clipAction(clipOf(kickF, model)) : null;
  pivot.visible = false;
  let started = false, fr = frame(st, canvas, h, .66, .86);
  const reattach2 = () => {
    if (el.isConnected) return;
    el = liveEl(ctaSel, el); if (!el.isConnected) return;
    poster = el.querySelector('[data-character-poster]'); sec = el.closest('[data-cta]') || el;
    el.appendChild(canvas); if (started && poster) poster.style.visibility = 'hidden';
    visible(sec, v => { on = v; });
  };

  // flying: hovering in place, seen from above (camera tilted down at the figure)
  const flyUrl = el.getAttribute('data-anim-fly');
  let flyF = flyUrl ? await loadFBX(flyUrl).catch(() => null) : null;
  // hosted file missing → try the local copy, then fall back to the idle clip (never a T-pose)
  if (!flyF && flyUrl) flyF = await fetch(flyUrl.replace(/^.*\//, 'models/')).then(r => r.ok ? r.json() : null).then(js => js ? { animations: [THREE.AnimationClip.parse(js)] } : null).catch(() => null);
  const idleUrl = heroEl && heroEl.getAttribute('data-anim-idle');
  const idleF = (!flyF && useFly && idleUrl) ? await loadFBX(idleUrl).catch(() => null) : null;
  const fly = flyF ? mixer.clipAction(clipOf(flyF, model)) : null;
  const idleFallback = idleF ? mixer.clipAction(clipOf(idleF, model)) : null;
  const tilt = THREE.MathUtils.degToRad(parseFloat(el.getAttribute('data-camera-tilt') || '38'));
  const aimFly = () => {
    const w = canvas.clientWidth || 1, hh = canvas.clientHeight || 1;
    if (canvas.width !== Math.round(w * st.r.getPixelRatio()) || canvas.height !== Math.round(hh * st.r.getPixelRatio())) st.r.setSize(w, hh, false);
    st.cam.aspect = w / hh;
    const H = h / .62, dist = (H / 2) / Math.tan(THREE.MathUtils.degToRad(st.cam.fov / 2));
    const ty = h * .5;
    st.cam.position.set(0, ty + Math.sin(tilt) * dist, Math.cos(tilt) * dist);
    st.cam.lookAt(0, ty, 0); st.cam.updateProjectionMatrix();
  };
  const startShow = () => {
    if (started) return; started = true; started0 = true;
    reattach(); poster = el.querySelector('[data-character-poster]');
    pivot.visible = true;
    if (poster) gsap.to(poster, { autoAlpha: 0, duration: .4 });
    if (fly) {
      fly.play();
      if (!pivot.userData.flyRig) {
        const rig = new THREE.Group(); pivot.add(rig); rig.add(model);
        model.position.y = -h * .55; rig.position.y = h * .5;
        rig.rotation.x = -Math.PI / 2 + THREE.MathUtils.degToRad(parseFloat(el.getAttribute('data-fly-lean') || '22'));
        pivot.userData.flyRig = rig;
      }
      pivot.position.y = -h * .25; pivot.scale.setScalar(.85);
      gsap.to(pivot.position, { y: 0, duration: 1.4, ease: 'power3.out' });
      gsap.to(pivot.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'power3.out' });
      gsap.to(pivot.position, { y: h * .03, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      return;
    }
    if (idleFallback) { idleFallback.play(); return; }
    const arrive = () => {
      gsap.to(pivot.rotation, { y: 0, duration: .7, ease: 'power2.inOut' });
      if (kick) { kick.reset().play(); if (walk) walk.crossFadeTo(kick, .6, false); }
    };
    if (walk) {
      pivot.position.x = -(fr.halfW + h * .45); pivot.rotation.y = Math.PI / 2;
      walk.play();
      const dist = -pivot.position.x, dur = dist / (h * .78);
      let fired = false;
      gsap.to(pivot.position, { x: 0, duration: dur, ease: 'none',
        onUpdate() { if (!fired && this.progress() > .93) { fired = true; arrive(); } } });
    } else { pivot.position.x = 0; arrive(); }
  };
  inView(0, .35).then(startShow);

  visible(sec, v => { on = v; });
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, clock.getDelta());
    reattach();
    if (!on) return;
    mixer.update(dt);
    if (fly) aimFly(); else fr = frame(st, canvas, h, .66, .86);
    st.r.render(st.scene, st.cam);
  })();
}

(async function boot() {
  if (window.__deesCharacterBooted) return; window.__deesCharacterBooted = true;
  const heroEl = await wait(() => document.querySelector('[data-character="hero"]'), 15000);
  const ctaEl = document.querySelector('[data-character="cta"]');
  if (!heroEl) emit('dees:char-progress', { p: 1 });
  try { if (heroEl) hero(heroEl); } catch (e) { console.warn(e); emit('dees:char-progress', { p: 1 }); }
  const ctaFound = ctaEl || await wait(() => document.querySelector('[data-character="cta"]'), 15000);
  if (ctaFound) cta(ctaFound, heroEl);
})();
