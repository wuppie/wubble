/* wubble.js v0.1 — WebGL layer for the native Webflow build.
   Hooks: [data-wubble="..."] elements. Settings: data-* attributes on [data-wubble="root"]. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const BASE = new URL('.', import.meta.url).href;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const W = (k) => $(`[data-wubble="${k}"]`);
const root = W('root');
if (!root) throw new Error('wubble: no [data-wubble="root"]');
const num = (k, d) => { const v = parseFloat(root.dataset[k]); return isNaN(v) ? d : v; };
const bool = (k, d) => root.dataset[k] == null ? d : root.dataset[k] !== 'false';
const S = {
  curvature: num('curvature', 0.11), ribbonTilt: num('ribbonTilt', 1.7), velocityBend: num('velocityBend', 1.4),
  hoverDistortion: num('hoverDistortion', 1.7), cornerRadius: num('cornerRadius', 0.11), reflection: num('reflectionStrength', 0.1),
  sectionZoom: num('sectionZoom', 2), scrub: num('scrub', 1), scrollLerp: num('scrollLerp', 0.18),
  heroModel: root.dataset.heroModel || 'https://raw.githubusercontent.com/wuppie/wubble/main/wubble.glb',
  font: root.dataset.displayFont || 'Oswald',
};
const coarse = matchMedia('(pointer: coarse)').matches;
const lowPower = coarse || innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4;
const svh = () => window.__svh || innerHeight;
{ let lw = innerWidth, lh = innerHeight; window.__svh = lh; addEventListener('resize', () => { if (innerWidth !== lw || Math.abs(innerHeight - lh) > 180) { lw = innerWidth; lh = innerHeight; window.__svh = lh; } }); }

/* ---------- smooth scroll (desktop) ---------- */
let lenis = null;
if (!coarse) {
  const s = document.createElement('script'); s.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
  s.onload = () => { lenis = new window.Lenis({ lerp: Math.min(0.3, Math.max(0.02, S.scrollLerp)), smoothWheel: true, autoRaf: false }); };
  document.head.appendChild(s);
}

/* ---------- clock ---------- */
const clock = W('clock');
const tickClock = () => { if (clock) clock.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }); };
tickClock(); setInterval(tickClock, 1000);

/* ---------- footer swap ---------- */
const A = W('swap-a'), B = W('swap-b');
let swapSide = 0, swapFrom = 0, swapT0 = -1e9;
if (A && B) setInterval(() => { swapFrom = swapSide; swapSide = 1 - swapSide; swapT0 = performance.now(); }, 9000);
const ease5 = (t) => t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
function updateSwap(now) {
  if (!A || !B) return;
  const t = Math.min(1, (now - swapT0) / 1600), k = swapFrom + (swapSide - swapFrom) * ease5(t), v = Math.sin(Math.PI * t) * (t < 1 ? 1 : 0);
  const Wd = A.parentElement.clientWidth - 32, sq = 1 + v * 0.35;
  A.style.transform = `translate3d(${k * (Wd - A.offsetWidth)}px,0,0) scale(${sq},${1 / sq})`;
  B.style.transform = `translate3d(${-k * (Wd - B.offsetWidth)}px,0,0) scale(${sq},${1 / sq})`;
  A.style.filter = B.style.filter = v > 0.02 ? `blur(${(v * 1.2).toFixed(2)}px)` : '';
}

/* ---------- sound toggle (set data-soundtrack on root to an mp3 URL) ---------- */
const snd = W('sound'); let audio = null, soundOn = false;
if (snd) snd.addEventListener('click', (e) => {
  e.preventDefault(); const url = root.dataset.soundtrack; if (!url) return;
  if (!audio) { audio = new Audio(url); audio.loop = true; audio.volume = 0.7; }
  soundOn = !soundOn; soundOn ? audio.play().catch(() => {}) : audio.pause(); snd.classList.toggle('is-on', soundOn);
});

/* ---------- hero 3D model ---------- */
const heroBox = W('hero-model');
let portrait = null;
if (heroBox && bool('hero3d', true)) {
  const go = async () => {
    try {
      const mod = await import(BASE + 'dither-viewer.js');
      portrait = await mod.createPortrait(heroBox, { model: S.heroModel, eyes: null, neck: -0.6, fit: innerWidth < 820 ? 0.92 : 0.78, maxPR: lowPower ? 0.9 : 2, shadowSize: lowPower ? 512 : 2048, textureAmount: 0,
        clay: { color: 0x57504a, roughness: 0.8, sheen: 0.55, sheenColor: 0xb7a99a }, post: { dither: 0, grain: 0.03, saturation: 0.28, contrast: 0.32, bloom: 0.05, vignette: 1.25, stipple: 0, tint: 0.6, exposure: 0.62 } });
      const c = portrait.renderer.domElement; Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
    } catch (e) { console.warn('wubble: hero model failed', e); }
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(go);
}

/* ---------- ribbon ---------- */
const host = W('ribbon'), workSec = W('work');
const projects = $$('[data-wubble="project"]').map((el, i) => {
  const img = $('img[data-wubble="cover"]', el);
  const src = img && (img.currentSrc || img.src);
  return {
    i, el, title: el.dataset.title || 'Project ' + (i + 1), slug: el.dataset.slug || '', year: el.dataset.year || '', services: el.dataset.services || '',
    color: el.dataset.color || ['#d8d3c6', '#1e3a2c', '#c4512d', '#242a66', '#e9e4d7', '#121212'][i % 6],
    video: el.dataset.video || '', image: src && !/placeholder/.test(src) ? src : '',
  };
});

function drawCover(ctx, w, h, p, media) {
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = p.color; ctx.fillRect(0, 0, w, h);
  if (media) {
    const mw = media.videoWidth || media.naturalWidth, mh = media.videoHeight || media.naturalHeight;
    if (mw && mh) { const s = Math.max(w / mw, h / mh); ctx.drawImage(media, (w - mw * s) / 2, (h - mh * s) / 2, mw * s, mh * s); }
    return;
  }
  const c = new THREE.Color(p.color), ink = (c.r * 0.3 + c.g * 0.59 + c.b * 0.11) > 0.55 ? '#141414' : '#ecebe6';
  ctx.fillStyle = ink; ctx.font = `700 ${Math.round(h * 0.24)}px "${S.font}", Oswald, sans-serif`; ctx.textBaseline = 'alphabetic';
  p.title.toUpperCase().split(' ').slice(0, 2).forEach((wd, k) => ctx.fillText(wd, w * 0.04, h * (0.34 + k * 0.26)));
}

if (host && workSec && projects.length) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1 : 2)); renderer.setClearColor(0, 0);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), FOV = 38, camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  const Wc = 3.4, Hc = 2.1, GAP = 0.16, STEP = Wc + GAP, N = projects.length, LEN = N * STEP;
  const U = { uCurve: { value: S.curvature }, uVel: { value: 0 }, uRadius: { value: S.cornerRadius }, uTime: { value: 0 }, uHoverAmt: { value: S.hoverDistortion },
    uRibbon: { value: new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.07 * S.ribbonTilt, -0.1 * S.ribbonTilt, -0.075 * S.ribbonTilt)) }, uTwist: { value: 0.035 * S.ribbonTilt },
    uIntro: { value: 0 }, uFloor: { value: 0.15 - Hc / 2 - 0.03 }, uReflAmt: { value: S.reflection } };
  const vert = `
    uniform float uCurve, uVel, uHover, uHoverAmt, uTwist, uIntro, uRefl, uFloor; uniform vec2 uMouse, uSize; uniform mat4 uRibbon;
    varying vec2 vUv; varying float vX, vIntro;
    void main(){
      vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); float x = wp.x;
      float e = clamp(uIntro * 1.8 - (x + 7.0) / 14.0 * 0.8, 0.0, 1.0); e = 1.0 - pow(1.0 - e, 3.0); float ie = 1.0 - e;
      vec2 md = (uv - uMouse) * vec2(uSize.x / uSize.y, 1.0);
      wp.z += smoothstep(0.6, 0.0, length(md)) * uHover * 0.28 * uHoverAmt;
      float c = max(uCurve, 0.0001), R = 1.0 / c, th = x * c;
      wp.x = sin(th) * R; wp.z += (1.0 - cos(th)) * R;
      wp.z -= sin(uv.x * 3.14159) * abs(uVel) * 0.55; wp.x += (uv.y - 0.5) * -uVel * 0.35;
      wp.y -= ie * 4.0; wp.z -= ie * 6.0;
      float tw = x * uTwist + ie * 1.3; wp.yz = mat2(cos(tw), sin(tw), -sin(tw), cos(tw)) * wp.yz;
      if (uRefl > 0.5) wp.y = 2.0 * uFloor - wp.y;
      wp = uRibbon * wp; vX = x; vIntro = e;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const frag = `
    uniform sampler2D uTex; uniform vec2 uSize, uMouse, uMVel; uniform float uRadius, uVel, uHover, uTime, uHoverAmt, uCurve, uRefl, uReflAmt;
    varying vec2 vUv; varying float vX, vIntro;
    float sdR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    void main(){
      vec2 p = (vUv - 0.5) * uSize; float d = sdR(p, uSize * 0.5, uRadius); float aa = fwidth(d) * 1.2; float a = 1.0 - smoothstep(-aa, aa, d);
      vec2 asp = vec2(uSize.x / uSize.y, 1.0), md = (vUv - uMouse) * asp; float dist = length(md); vec2 dir = md / max(dist, 1e-4) / asp;
      float fall = smoothstep(0.5, 0.0, dist) * uHover * uHoverAmt;
      vec2 uv = (vUv - 0.5) * (1.0 - 0.05 * uHover * uHoverAmt) + 0.5;
      uv -= dir * sin(dist * 30.0 - uTime * 6.0) * 0.010 * fall; uv -= dir * 0.035 * fall * (1.0 - dist * 2.0); uv -= uMVel * fall * 0.6;
      vec2 sh = vec2(uVel * 0.006 + (1.0 - vIntro) * 0.03, 0.0) + dir * 0.012 * fall + uMVel * fall * 0.4;
      vec3 col = vec3(texture2D(uTex, uv + sh).r, texture2D(uTex, uv).g, texture2D(uTex, uv - sh).b) + fall * 0.06;
      float th = vX * max(uCurve, 0.0001), face = cos(clamp(th * 1.35, -1.5, 1.5));
      col *= 0.5 + 0.5 * face;
      col *= mix(0.72, 1.0, smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x));
      col *= mix(0.86, 1.0, smoothstep(0.0, 0.35, vUv.y));
      col += vec3(1.0, 0.98, 0.95) * exp(-pow((vUv.x - (0.5 - vX * 0.04)) * 3.2, 2.0)) * (0.6 + 0.4 * face) * 0.045 * smoothstep(0.2, 1.0, vUv.y);
      float dim = 1.0 - smoothstep(4.2, 8.5, abs(vX)); col *= mix(0.2, 1.0, dim);
      a *= 1.0 - smoothstep(9.6, 10.6, abs(vX)); a *= smoothstep(0.0, 0.35, vIntro);
      if (uRefl > 0.5) { a *= uReflAmt * (1.0 - smoothstep(0.0, 0.9, vUv.y)); col *= 0.95; }
      gl_FragColor = vec4(col, a);
    }`;
  const geo = new THREE.PlaneGeometry(Wc, Hc, 64, 24), cw = 1600, ch = Math.round(1600 * Hc / Wc);
  const cards = projects.map((p) => {
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const ctx = cv.getContext('2d');
    drawCover(ctx, cw, ch, p, null);
    const tex = new THREE.CanvasTexture(cv); tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const uni = { ...U, uTex: { value: tex }, uSize: { value: new THREE.Vector2(Wc, Hc) }, uHover: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uMVel: { value: new THREE.Vector2() }, uRefl: { value: 0 } };
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: uni, vertexShader: vert, fragmentShader: frag, transparent: true }));
    const rmesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: { ...uni, uRefl: { value: 1 } }, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    [mesh, rmesh].forEach((m) => { m.frustumCulled = false; m.position.y = 0.15; scene.add(m); }); rmesh.renderOrder = 0; mesh.renderOrder = 1;
    const card = { p, mesh, rmesh, ctx, tex, uni, h: 0, m: new THREE.Vector2(0.5, 0.5), mv: new THREE.Vector2(), video: null };
    if (p.video) { const v = document.createElement('video'); Object.assign(v, { crossOrigin: 'anonymous', muted: true, loop: true, playsInline: true, autoplay: true, src: p.video }); v.addEventListener('loadeddata', () => { card.video = v; }); v.play().catch(() => {}); }
    else if (p.image) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { drawCover(ctx, cw, ch, p, im); tex.needsUpdate = true; }; im.src = p.image; }
    return card;
  });
  if (document.fonts) document.fonts.ready.then(() => cards.forEach((c) => { if (!c.video && !c.p.image) { drawCover(c.ctx, cw, ch, c.p, null); c.tex.needsUpdate = true; } }));

  let camD = 11, visW = 10;
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; const t = Math.tan(FOV / 2 * Math.PI / 180);
    camD = (camera.aspect >= 1.2 ? STEP * 3 : Wc * 1.3) / (2 * t * camera.aspect);
    camera.position.set(0, 0.7, camD); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); visW = 2 * camD * t * camera.aspect;
  };
  new ResizeObserver(resize).observe(host); resize();

  const V = new THREE.Vector3(), toScreen = (x, y, rw, rh) => {
    const c = Math.max(U.uCurve.value, 0.0001), tw = x * U.uTwist.value, Z = (1 - Math.cos(x * c)) / c;
    V.set(Math.sin(x * c) / c, y * Math.cos(tw) - Z * Math.sin(tw), y * Math.sin(tw) + Z * Math.cos(tw)).applyMatrix4(U.uRibbon.value).project(camera);
    return [(V.x + 1) / 2 * rw, (1 - V.y) / 2 * rh];
  };
  let mouse = null, dragging = false, lastX = 0, sx0 = 0, sy0 = 0, axis = null, moved = 0, dvx = 0, lastT = 0, introS = 0;
  let base = 0, dragOff = 0, target = 0, cur = 0, prev = 0, vel = 0;
  const pick = () => {
    if (!mouse || dragging || introS < 0.9) return null;
    const rw = host.clientWidth, rh = host.clientHeight;
    for (const cd of cards) {
      const cx = cd.mesh.position.x, cy = cd.mesh.position.y; if (Math.abs(cx) > 9) continue; let pt = null;
      for (let k = 0; k <= 40; k++) {
        const u = k / 40, x = cx + (u - 0.5) * Wc, t = toScreen(x, cy + Hc / 2, rw, rh), b = toScreen(x, cy - Hc / 2, rw, rh), sx = (t[0] + b[0]) / 2;
        if (pt && mouse.x >= pt.sx && mouse.x <= sx) { const f = (mouse.x - pt.sx) / Math.max(sx - pt.sx, 1e-4), ty = pt.ty + (t[1] - pt.ty) * f, by = pt.by + (b[1] - pt.by) * f, vv = 1 - (mouse.y - ty) / (by - ty); if (vv >= 0 && vv <= 1) return { cd, u: pt.u + (u - pt.u) * f, v: vv }; }
        pt = { u, sx, ty: t[1], by: b[1] };
      }
    }
    return null;
  };
  const setMouse = (e) => { const r = host.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const snap = () => { dragOff = Math.round((base + dragOff) / STEP) * STEP - base; };
  host.style.touchAction = 'pan-y'; host.style.cursor = 'grab';
  host.addEventListener('pointerleave', () => { mouse = null; });
  host.addEventListener('pointerdown', (e) => { setMouse(e); dragging = true; lastX = sx0 = e.clientX; sy0 = e.clientY; moved = 0; dvx = 0; lastT = performance.now(); axis = e.pointerType === 'mouse' ? 'x' : null; if (axis) host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', (e) => {
    setMouse(e); if (!dragging) return;
    if (!axis) { const ax = Math.abs(e.clientX - sx0), ay = Math.abs(e.clientY - sy0); if (ax < 7 && ay < 7) return; axis = ax > ay ? 'x' : 'y'; if (axis === 'y') { dragging = false; return; } try { host.setPointerCapture(e.pointerId); } catch (er) {} lastX = e.clientX; }
    const now = performance.now(), dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    const k = visW / host.clientWidth * 1.1; dragOff -= dx * k; dvx += ((-dx * k / Math.max(1, now - lastT)) - dvx) * 0.35; lastT = now;
  });
  const up = () => {
    if (!dragging) { axis = null; return; } dragging = false; axis = null;
    if (moved < 5) { const hit = pick(); if (hit && hit.cd.p.slug) location.href = '/work/' + hit.cd.p.slug; }
    else { dragOff += Math.max(-STEP * 1.5, Math.min(STEP * 1.5, dvx * 260)); snap(); }
  };
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
  let snapT = null;

  window.__wubbleRibbon = (now, vh) => {
    const sec = workSec.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (vh * 0.5 - sec.top) / vh));
    introS += (p - introS) * 0.06;
    const p2 = Math.max(0, Math.min(1, (-sec.top - vh * 0.5) / (vh * 0.55 * (N - 1))));
    const nb = p2 * (N - 1) * STEP; if (nb !== base) { base = nb; clearTimeout(snapT); snapT = setTimeout(() => { if (!dragging) snap(); }, 260); }
    U.uIntro.value = introS; U.uTime.value = now / 1000;
    const hit = pick(); host.style.cursor = dragging ? 'grabbing' : hit ? 'pointer' : 'grab';
    target = base + dragOff; cur += (target - cur) * (coarse ? 0.12 : 0.075);
    const v = cur - prev; prev = cur; vel += (v * 6 * S.velocityBend - vel) * 0.12; U.uVel.value = Math.max(-1.6, Math.min(1.6, vel));
    const vis = sec.top < vh && sec.bottom > 0 && introS > 0.001;
    cards.forEach((c, i) => {
      const on = hit && hit.cd === c; c.h += ((on ? 1 : 0) - c.h) * 0.07;
      if (on) { const px = c.m.x, py = c.m.y; c.m.x += (hit.u - c.m.x) * 0.18; c.m.y += (hit.v - c.m.y) * 0.18; c.mv.x += ((c.m.x - px) - c.mv.x) * 0.2; c.mv.y += ((c.m.y - py) - c.mv.y) * 0.2; } else c.mv.multiplyScalar(0.9);
      c.uni.uHover.value = c.h; c.uni.uMouse.value.copy(c.m); c.uni.uMVel.value.copy(c.mv);
      let x = i * STEP - cur; x = ((x + LEN / 2) % LEN + LEN) % LEN - LEN / 2; c.mesh.position.x = c.rmesh.position.x = x;
      if (vis && c.video && c.video.readyState >= 2 && Math.abs(x) < 9) { drawCover(c.ctx, cw, ch, c.p, c.video); c.tex.needsUpdate = true; }
    });
    if (vis) renderer.render(scene, camera);
  };
}

/* ---------- section hand-off: gentle lift + crossfade ---------- */
const sections = ['hero', 'work', 'services', 'reach'].map(W).filter(Boolean);
const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function updateSections(vh) {
  const heroInner = W('hero') && W('hero').firstElementChild, title = W('hero-title');
  const y = scrollY, e = Math.max(0, Math.min(1, y / (vh * 1.2)));
  if (heroInner) { heroInner.style.opacity = String(1 - sst(0.0, 0.62, e)); heroInner.style.transform = `translate3d(0,${-8 * S.sectionZoom * e}vh,0)`; }
  if (title) $$('.wb-line, span', title).forEach((ln, j) => { const l = sst(j * 0.08, 0.6 + j * 0.08, e); ln.style.transform = `translate3d(0,${-l * 40}%,0)`; ln.style.opacity = String(1 - l); });
  if (portrait) { portrait.state.zoom = sst(0, 0.62, e); portrait.state.zoomY = 0.03; if (portrait.post.uDissolve) portrait.post.uDissolve.value = sst(0.32, 0.78, e); }
}

/* ---------- smoky transition between sections ---------- */
const bleedBox = document.createElement('div');
bleedBox.style.cssText = 'position:fixed;inset:0;z-index:30;pointer-events:none;display:none;';
document.body.appendChild(bleedBox);
let bleedR = null, bleedLast = 0;
const BU = { uP: { value: 0 }, uB: { value: 0 }, uT: { value: 0 }, uA: { value: 1 }, uS: { value: 0 } };
const bleedMat = new THREE.ShaderMaterial({ uniforms: BU, transparent: true,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    uniform float uP, uB, uT, uA, uS; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.02 + 7.3; a *= 0.5; } return s; }
    void main(){
      vec2 p = vUv * vec2(uA, 1.0) * 2.4 + uS;
      vec2 w = vec2(fbm(p + uT * 0.06), fbm(p + 5.1 - uT * 0.05));
      float f = fbm(p + w * 2.2 + vec2(0.0, -uP * 2.0));
      float d = f * 0.75 + (1.0 - vUv.y) * 0.55 - (uP * 1.7 - 0.35);
      float a = clamp(smoothstep(0.38, 0.0, abs(d)) * 0.85 + smoothstep(0.16, 0.0, abs(d)) * 0.15, 0.0, 1.0) * uB;
      vec3 col = vec3(0.012, 0.011, 0.011) + vec3(0.42, 0.38, 0.34) * smoothstep(0.05, 0.0, abs(d - 0.02)) * 0.12 * uB;
      col += (h(gl_FragCoord.xy + fract(uT) * 77.0) - 0.5) * 0.03;
      gl_FragColor = vec4(col, a);
    }` });
const bleedScene = new THREE.Scene(), bleedCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
bleedScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bleedMat));
const bleedSize = () => { BU.uA.value = innerWidth / innerHeight; if (bleedR) { bleedR.setPixelRatio(lowPower ? 0.3 : 0.6); bleedR.setSize(innerWidth, innerHeight, false); } };
addEventListener('resize', bleedSize);
const bleedOn = bool('sectionBleed', true);
function updateBleed(now, vh) {
  if (!bleedOn) return;
  let best = null, bb = 0;
  ['work', 'services', 'reach'].forEach((k, i) => {
    const el = W(k); if (!el) return;
    const q = Math.max(0, Math.min(1, (vh - el.getBoundingClientRect().top) / (vh * 1.1)));
    const b = Math.sin(Math.PI * q); if (b > bb) { bb = b; best = [q, 1.3 + i * 3.4]; }
  });
  if (bb < 0.01) { bleedBox.style.display = 'none'; if (bleedR && now - bleedLast > 2500) { bleedR.dispose(); try { bleedR.forceContextLoss(); } catch (e) {} bleedR.domElement.remove(); bleedR = null; } return; }
  bleedBox.style.display = 'block'; bleedLast = now;
  if (!bleedR) { bleedR = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false }); bleedR.setClearColor(0, 0); bleedR.domElement.style.cssText = 'display:block;width:100%;height:100%;'; bleedBox.appendChild(bleedR.domElement); bleedSize(); }
  BU.uP.value = best[0]; BU.uS.value = best[1]; BU.uB.value = Math.min(1, bb * 1.4); BU.uT.value = now / 1000;
  bleedR.render(bleedScene, bleedCam);
}

/* ---------- main loop ---------- */
function frame(t) {
  requestAnimationFrame(frame);
  if (lenis) lenis.raf(t);
  const now = performance.now(), vh = svh();
  updateSwap(now); updateSections(vh); updateBleed(now, vh);
  if (window.__wubbleRibbon) window.__wubbleRibbon(now, vh);
}
requestAnimationFrame(frame);
