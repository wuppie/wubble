/* wubble.js v0.4 — WebGL layer for the native Webflow build.
   Hooks: [data-wubble="..."] elements. Settings: data-* attributes on [data-wubble="root"]. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const BASE = new URL('.', import.meta.url).href;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const W = (k) => $(`[data-wubble="${k}"]`);
const root = W('root') || W('project-page') || document.body;
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
    if (moved < 5) { const hit = pick(); if (hit && hit.cd.p.slug) {
      const rw = host.clientWidth, rh = host.clientHeight, cx = hit.cd.mesh.position.x, cy = hit.cd.mesh.position.y, hr = host.getBoundingClientRect();
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let k = 0; k <= 12; k++) { const x = cx + (k / 12 - 0.5) * Wc; [cy + Hc / 2, cy - Hc / 2].forEach((y) => { const p = toScreen(x, y, rw, rh); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); }
      let src = ''; try { src = hit.cd.ctx.canvas.toDataURL('image/jpeg', 0.85); } catch (e) {}
      window.__wubbleOpen({ left: hr.left + x0, top: hr.top + y0, width: x1 - x0, height: y1 - y0 }, src, hit.cd.p.color, '/work/' + hit.cd.p.slug);
    } }
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
    const hit = pick(); window.__wubbleHover = !!hit; host.style.cursor = dragging ? 'grabbing' : hit ? (bool('customCursor', true) && !coarse ? 'none' : 'pointer') : 'grab';
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


/* ================= v0.3 additions ================= */
const fsQuad = (fs, U, alpha) => { const m = new THREE.ShaderMaterial({ uniforms: U, transparent: !!alpha, depthTest: false, vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: fs }); const sc = new THREE.Scene(); sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m)); return sc; };
const ORTHO = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const mouseN = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', (e) => { mouseN.x = e.clientX / innerWidth * 2 - 1; mouseN.y = -(e.clientY / innerHeight * 2 - 1); });

/* ---------- full-screen scene in a section (services ascent / reach ray) ---------- */
function sceneIn(box, sec, fs, getP) {
  if (!box || !sec) return () => {};
  let r = null; const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uIn: { value: 1 }, uTilt: { value: 0 }, uZoom: { value: 0 }, uDith: { value: 0 } };
  const sc = fsQuad(fs, U); let sp = 0;
  const size = () => { if (!r) return; const w = box.clientWidth, h = box.clientHeight; const pr = lowPower ? 0.4 : Math.min(1, 1300 / Math.max(w, 1)); r.setPixelRatio(pr); r.setSize(w, h, false); U.uRes.value.set(w * pr, h * pr); };
  new ResizeObserver(size).observe(box);
  return (now, vh) => {
    const rc = sec.getBoundingClientRect(), near = rc.top < vh * 1.5 && rc.bottom > -vh * 0.5;
    if (!near) { if (r) { r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; } return; }
    if (!r) { r = new THREE.WebGLRenderer({ antialias: false }); r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement); size(); }
    if (rc.top > vh || rc.bottom < 0) return;
    sp += (getP(rc, vh) - sp) * 0.06; U.uP.value = sp; U.uT.value = now / 1000; U.uM.value.set(mouseN.sx, mouseN.sy);
    U.uIn.value = Math.max(0, Math.min(1, (vh - rc.top) / (vh * 0.7)));
    r.render(sc, ORTHO);
  };
}
const svcSec = W('services'), reachSec = W('reach');
const tickServices = sceneIn(W('services-scene'), svcSec, "\n        precision highp float;\n        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uTilt; uniform float uZoom; uniform float uDith;\n        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }\n        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);\n          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }\n        float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }\n        float stars(vec2 fc, float sz, float th){ vec2 g = fc / sz; vec2 id = floor(g); float r = h(id); vec2 o = vec2(h(id + 3.1), h(id + 7.7)) - 0.5; float d = length(fract(g) - 0.5 - o * 0.6); return step(th, r) * smoothstep(0.18, 0.0, d) * (0.4 + 0.6 * h(id + 1.7)); }\n        void main(){\n          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;\n          vec2 p = (fc - 0.5 * uRes) / uRes.y;\n          float tc = cos(uTilt * 0.1), ts = sin(uTilt * 0.1);\n          p = mat2(tc, ts, -ts, tc) * p; p *= 1.0 + uZoom * 0.3; p.y += uTilt * 0.4;\n          p += uM * vec2(0.012, 0.008);\n          float alt = uP * uP * (3.0 - 2.0 * uP);\n          vec3 L = normalize(vec3(0.75, 0.42, 0.35));\n          // deep space\n          vec3 col = vec3(0.0035, 0.004, 0.006);\n          float band = exp(-pow((p.y * 0.9 - p.x * 0.45 + 0.05) * 3.2, 2.0));\n          float mw = fbm(p * 3.5 + 11.0) * fbm(p * 9.0 - 3.0);\n          col += vec3(0.05, 0.05, 0.065) * band * smoothstep(0.15, 0.55, mw) * smoothstep(0.3, 0.8, alt);\n          float sf = stars(fc, 3.0, 0.992) * 0.55 + stars(fc, 7.0, 0.985) * 0.8 + stars(fc, 17.0, 0.975) * 1.0;\n          sf *= 0.75 + 0.25 * sin(uT * 1.3 + h(floor(fc / 7.0)) * 40.0);\n          col += vec3(0.82, 0.86, 1.0) * sf * 0.55 * smoothstep(0.25, 0.75, alt);\n          // sun, small and hot, soft bloom\n          vec2 sp = vec2(0.78, 0.36);\n          float sd = length(p - sp);\n          col += vec3(1.0, 0.94, 0.86) * (0.9 * exp(-sd * 90.0) + 0.06 * exp(-sd * 9.0) + 0.012 * exp(-sd * 2.0)) * smoothstep(0.2, 0.7, alt);\n          // planet as a real sphere\n          float R0 = 2.4;\n          vec2 pc = vec2(-0.15, -R0 - mix(-0.6, 0.38, alt));\n          vec2 dq = (p - pc) / R0;\n          float r2 = dot(dq, dq);\n          float pd = (sqrt(r2) - 1.0) * R0;\n          if (r2 < 1.0) {\n            vec3 nn = vec3(dq, sqrt(1.0 - r2));\n            float lon = atan(nn.x, nn.z) * 2.2 + uT * 0.004, lat = asin(nn.y) * 2.2;\n            vec2 gp = vec2(lon, lat) * 2.2;\n            float landN = fbm(gp + 5.0);\n            float land = smoothstep(0.5, 0.56, landN);\n            vec3 ocean = vec3(0.006, 0.018, 0.04);\n            vec3 ground = mix(vec3(0.03, 0.035, 0.022), vec3(0.06, 0.05, 0.035), fbm(gp * 4.0));\n            vec3 sc = mix(ocean, ground, land);\n            float cl = smoothstep(0.48, 0.78, fbm(gp * 1.6 - vec2(uT * 0.006, 0.0) + fbm(gp * 3.0) * 0.6));\n            float dif = dot(nn, L);\n            float day = smoothstep(-0.08, 0.25, dif);\n            vec3 lit = sc * max(dif, 0.0) * 0.9 + vec3(0.32, 0.33, 0.34) * cl * max(dif, 0.0) * 0.55;\n            float spec = pow(max(dot(reflect(-L, nn), vec3(0.0, 0.0, 1.0)), 0.0), 40.0) * (1.0 - land) * (1.0 - cl);\n            lit += vec3(0.55, 0.5, 0.42) * spec * 0.18;\n            float cityN = step(0.93, h(floor(gp * 60.0))) * land * (1.0 - cl);\n            vec3 night = vec3(1.0, 0.62, 0.3) * cityN * 0.35 * (1.0 - day);\n            vec3 pcol = mix(night + sc * 0.03, lit, day);\n            float limb = pow(1.0 - nn.z, 3.0);\n            pcol += vec3(0.12, 0.24, 0.55) * limb * smoothstep(-0.25, 0.4, dif) * 0.7;\n            col = mix(col, pcol, smoothstep(0.0, 0.004, -pd));\n          }\n          // thin atmosphere above the limb, brightest on the day side\n          vec2 ndir = normalize(dq);\n          float dayRim = smoothstep(-0.35, 0.5, dot(vec3(ndir, 0.0), L));\n          float atm = exp(-max(pd, 0.0) * 55.0) * step(0.0, pd) + exp(-abs(pd) * 160.0);\n          col += vec3(0.16, 0.32, 0.75) * atm * dayRim * 0.55;\n          col += vec3(0.5, 0.35, 0.25) * exp(-abs(pd) * 260.0) * smoothstep(-0.2, 0.15, dot(vec3(ndir, 0.0), L)) * smoothstep(0.25, -0.05, dot(vec3(ndir, 0.0), L)) * 0.25;\n          // night cloud deck you climb out of\n          for (int i = 0; i < 3; i++) {\n            float d = float(i) / 2.0;\n            vec2 cp = vec2(p.x * mix(0.9, 1.7, d) + uT * mix(0.012, 0.03, d) + d * 7.0, p.y * mix(1.4, 2.4, d) + alt * mix(4.0, 2.0, d) + d * 3.0);\n            float c = fbm(cp + fbm(cp * 0.6 + uT * 0.01) * 1.3);\n            float dens = smoothstep(0.44, 0.8, c);\n            float top = smoothstep(0.35, 0.9, fbm(cp * 1.8 + 2.0));\n            vec3 cc = vec3(0.05, 0.058, 0.07) * (0.6 + 0.8 * top) + vec3(0.12, 0.11, 0.1) * top * exp(-length(p - sp) * 1.4) * 0.4;\n            float fadeOut = 1.0 - smoothstep(0.28 - d * 0.08, 0.55 - d * 0.08, alt);\n            col = mix(col, cc, dens * fadeOut * mix(0.95, 0.65, d));\n          }\n          col = col * 1.1 / (1.0 + col * 0.9);\n          float lg = dot(col, vec3(0.299, 0.587, 0.114));\n          col = mix(vec3(lg), col, 0.85);\n          col += (h(fc + fract(uT * 6.1) * 117.0) - 0.5) * 0.02 * (0.3 + lg * 4.0);\n          vec2 vu = uv - 0.5; col *= 1.0 - 1.0 * dot(vu, vu);\n          col *= uIn;\n          gl_FragColor = vec4(max(col, 0.0), 1.0);\n        }", (rc, vh) => Math.max(0, Math.min(1, (vh - rc.top) / (rc.height + vh * 0.2))));
const tickRay = sceneIn(W('reach-ray'), reachSec, "\n        precision highp float;\n        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uTilt; uniform float uZoom;\n        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }\n        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);\n          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }\n        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }\n        void main(){\n          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;\n          vec2 p = (fc - 0.5 * uRes) / uRes.y;\n          float tc = cos(uTilt * 0.1), ts = sin(uTilt * 0.1);\n          p = mat2(tc, ts, -ts, tc) * p; p *= 1.0 + uZoom * 0.3; p.y += uTilt * 0.4;\n          float e = uP * uP * (3.0 - 2.0 * uP);\n          float asp = uRes.x / uRes.y;\n          vec2 S = vec2(0.18 + uM.x * 0.03, 0.62 + uM.y * 0.01);\n          vec2 dir = normalize(vec2(-0.22 - (1.0 - e) * 0.08 + sin(uT * 0.23) * 0.05 + sin(uT * 0.11) * 0.03, -1.0));\n          vec2 rel = p - S;\n          float along = dot(rel, dir), perp = dot(rel, vec2(-dir.y, dir.x));\n          float reach = mix(0.1, 1.6, e);\n          float width = mix(0.05, 0.32, e) * (0.35 + max(along, 0.0) * 0.8) * (1.0 + 0.1 * sin(uT * 0.4) + 0.05 * sin(uT * 1.1));\n          float core = exp(-perp * perp / (width * width));\n          float soft = exp(-perp * perp / (width * width * 9.0));\n          float len = smoothstep(reach, reach - 0.5, along) * smoothstep(-0.08, 0.12, along);\n          float streak = fbm(vec2(along * 1.4 - uT * 0.09, perp * 10.0 + sin(uT * 0.2) * 0.6)) * 0.8 + 0.4;\n          float beam = (core * 0.85 + soft * 0.35) * len * streak;\n          vec3 warm = vec3(0.78, 0.7, 0.6), hot = vec3(0.92, 0.88, 0.82);\n          vec3 col = vec3(0.004, 0.0038, 0.0036);\n          col += mix(warm, hot, core * core * core) * beam * mix(0.03, 0.3, e) * (0.55 + 0.45 * core);\n          col += warm * 0.045 * exp(-length(rel) * 7.0) * smoothstep(0.0, 0.4, e);\n          col += warm * 0.012 * fbm(p * 1.6 + uT * 0.015) * soft * e;\n          float lg = dot(col, vec3(0.299, 0.587, 0.114));\n          col = mix(vec3(lg), col, 0.4);\n          col += mix(vec3(-0.002, 0.0, 0.004), vec3(0.008, 0.003, -0.004), smoothstep(0.02, 0.2, lg));\n          col = max(col - 0.0025, 0.0);\n          col = col * 1.05 / (1.0 + col * 1.1);\n          float l = dot(col, vec3(0.333));\n          col += (h(fc + fract(uT * 5.7) * 101.0) - 0.5) * 0.05 * (0.3 + l * 3.0);\n          vec2 vu = uv - 0.5; col *= 1.0 - 1.35 * dot(vu, vu);\n          gl_FragColor = vec4(max(col, 0.0), 1.0);\n        }", (rc, vh) => Math.max(0, Math.min(1, (vh * 0.05 - rc.top) / (rc.height * 0.7))));

/* ---------- reach hand (clay) ---------- */
let hand = null, handLoading = false;
async function loadHand() {
  handLoading = true; const box = W('reach-hand'); if (!box) return;
  try {
    const mod = await import(BASE + 'dither-viewer.js');
    hand = await mod.createPortrait(box, { model: root.dataset.handModel || 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/right.glb', eyes: null, neck: -10, rotation: [-1.15, 0.5, -0.55], light: 'top', keyAngle: 0.2, maxPR: lowPower ? 0.9 : 2, shadowSize: lowPower ? 512 : 2048, textureAmount: 0,
      clay: { color: 0x5e5650, roughness: 0.82, sheen: 0.6, sheenColor: 0xc2b19e }, post: { dither: 0, grain: 0.03, saturation: 0.28, contrast: 0.32, bloom: 0.05, vignette: 1.25, stipple: 0, tint: 0.6, exposure: 0.1 } });
    hand.scene.traverse((o) => { if (o.isLight) o.color.set(0xd8ccbc); });
    const c = hand.renderer.domElement; Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
  } catch (e) { console.warn('wubble: hand failed', e); }
}
function tickHand(now, vh) {
  if (!reachSec) return; const rc = reachSec.getBoundingClientRect();
  if (!handLoading && rc.top < vh * 2.2) loadHand();
  if (!hand) return; const vis = rc.top < vh && rc.bottom > 0;
  if (vis !== hand._on) { hand._on = vis; hand.renderer.setAnimationLoop(vis ? hand.frame : null); }
  const p = Math.max(0, Math.min(1, (vh * 0.05 - rc.top) / (rc.height * 0.7))), e = p * p * (3 - 2 * p), t = now / 1000;
  hand.post.uExposure.value = (0.06 + e * 0.5) * (1 + 0.06 * Math.sin(t * 0.4));
}

/* ---------- section content reveals (services / reach) ---------- */
function tickContent(vh) {
  [[svcSec, 'services-title'], [reachSec, 'reach-title']].forEach(([sec, key]) => {
    if (!sec) return; const rc = sec.getBoundingClientRect(), k = Math.max(0, Math.min(1, (vh - rc.top) / (vh * 0.9)));
    const e = 1 - Math.pow(1 - sst(0.35, 1, k), 3);
    const t = W(key); if (t) { t.style.transform = 'translate3d(0,' + ((1 - e) * 40) + 'px,0)'; t.style.opacity = String(e); }
    const list = sec === svcSec ? W('services-list') : null;
    if (list) $$('li', list).forEach((li, j) => { const ej = 1 - Math.pow(1 - sst(0.45 + j * 0.06, 1, k), 3); li.style.transform = 'translate3d(0,' + ((1 - ej) * 16) + 'px,0)'; li.style.opacity = String(ej); });
  });
}

/* ---------- ink cursor ---------- */
let tickInk = () => {};
if (!coarse && bool('customCursor', true)) {
  const box = document.createElement('div'); box.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;mix-blend-mode:difference;'; document.body.appendChild(box);
  const r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false }); r.setPixelRatio(Math.min(devicePixelRatio, 1.5)); r.setClearColor(0, 0);
  r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement);
  const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  let RA = new THREE.WebGLRenderTarget(4, 4, opts), RB = new THREE.WebGLRenderTarget(4, 4, opts);
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const SU = { uPrev: { value: null }, uA: { value: new THREE.Vector2(-9, -9) }, uB: { value: new THREE.Vector2(-9, -9) }, uR: { value: 0.02 }, uAspect: { value: 1 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2() }, uDecay: { value: 0.976 } };
  const OU = { uTex: { value: null }, uT: { value: 0 }, uAspect: { value: 1 } };
  const simS = new THREE.Scene(); simS.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: SU, vertexShader: vs, fragmentShader: "\n      uniform sampler2D uPrev; uniform vec2 uA; uniform vec2 uB; uniform float uR; uniform float uAspect; uniform float uT; uniform vec2 uPx; uniform float uDecay;\n      varying vec2 vUv; \n      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);\n        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }\n      float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * t); }\n      void main(){\n        vec2 q = vUv * vec2(uAspect, 1.0) * 4.0;\n        float e = 0.05;\n        float nx = n2(q + vec2(0.0, e) + uT * 0.3) - n2(q - vec2(0.0, e) + uT * 0.3);\n        float ny = n2(q + vec2(e, 0.0) + uT * 0.3) - n2(q - vec2(e, 0.0) + uT * 0.3);\n        vec2 curl = vec2(nx, -ny) * 0.012;\n        vec2 uv = vUv - curl + vec2(0.0, 0.0006);\n        float v = texture2D(uPrev, uv).r * 0.6\n          + (texture2D(uPrev, uv + vec2(uPx.x, 0.0)).r + texture2D(uPrev, uv - vec2(uPx.x, 0.0)).r\n          +  texture2D(uPrev, uv + vec2(0.0, uPx.y)).r + texture2D(uPrev, uv - vec2(0.0, uPx.y)).r) * 0.1;\n        v *= uDecay;\n        vec2 p = vUv * vec2(uAspect, 1.0);\n        float d = seg(p, uA * vec2(uAspect, 1.0), uB * vec2(uAspect, 1.0));\n        float rr = uR * (0.75 + 0.5 * n2(p * 14.0 + uT));\n        v = max(v, smoothstep(rr, rr * 0.2, d));\n        gl_FragColor = vec4(v, 0.0, 0.0, 1.0);\n      }" })));
  const outS = new THREE.Scene(); outS.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: OU, transparent: true, vertexShader: vs, fragmentShader: "\n      uniform sampler2D uTex; uniform float uT; uniform float uAspect; varying vec2 vUv; \n      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);\n        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }\n      void main(){\n        float f = texture2D(uTex, vUv).r;\n        f += (n2(vUv * vec2(uAspect, 1.0) * 18.0 + uT * 0.4) - 0.5) * 0.12;\n        float a = smoothstep(0.42, 0.47, f);\n        gl_FragColor = vec4(vec3(1.0), a);\n      }" })));
  const size = () => { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); const sw = Math.max(4, w >> 1), sh = Math.max(4, h >> 1); RA.setSize(sw, sh); RB.setSize(sw, sh); SU.uPx.value.set(1 / sw, 1 / sh); SU.uAspect.value = OU.uAspect.value = w / h; };
  size(); addEventListener('resize', size);
  const m = { x: -1, y: -1, px: -1, py: -1, has: false }; let speed = 0, rad = 0, fade = 1;
  addEventListener('pointermove', (e) => { m.x = e.clientX / innerWidth; m.y = 1 - e.clientY / innerHeight; if (!m.has) { m.px = m.x; m.py = m.y; m.has = true; } });
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) m.has = false; });
  tickInk = (now) => {
    const hov = window.__wubbleHover; fade += ((hov ? 0 : 1) - fade) * (hov ? 0.14 : 0.06); box.style.opacity = String(fade);
    const dx = (m.x - m.px) * SU.uAspect.value, dy = m.y - m.py; speed += (Math.min(Math.hypot(dx, dy) * 40, 1) - speed) * 0.15;
    rad += ((m.has && !hov ? (0.018 + speed * 0.07) * 2 : 0) - rad) * 0.2;
    SU.uA.value.set(m.has ? m.px : -9, m.has ? m.py : -9); SU.uB.value.set(m.has ? m.x : -9, m.has ? m.y : -9);
    SU.uR.value = rad; SU.uT.value = OU.uT.value = now / 1000; m.px = m.x; m.py = m.y;
    SU.uPrev.value = RA.texture; r.setRenderTarget(RB); r.render(simS, ORTHO); const t = RA; RA = RB; RB = t;
    OU.uTex.value = RA.texture; r.setRenderTarget(null); r.render(outS, ORTHO);
  };
}

/* ---------- "View work" gooey blob ---------- */
const goo = document.createElement('div');
goo.innerHTML = '<div style="position:absolute;left:-34px;top:-34px;width:68px;height:68px;border-radius:50%;background:#ecebe6;transform:scale(0);will-change:transform;"></div><div style="position:absolute;left:-50px;top:-6px;width:100px;text-align:center;font:11px/12px JetBrains Mono,monospace;letter-spacing:.08em;text-transform:uppercase;color:#050505;opacity:0;white-space:nowrap;">View work</div>';
goo.style.cssText = 'position:fixed;left:0;top:0;z-index:55;pointer-events:none;will-change:transform;';
document.body.appendChild(goo);
const G = { x: 0, y: 0, s: 0, l: 0 }; let gm = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { gm = { x: e.clientX, y: e.clientY }; });
function tickGoo() {
  const show = !!window.__wubbleHover && !popup; G.x += (gm.x - G.x) * 0.14; G.y += (gm.y - G.y) * 0.14;
  G.s += ((show ? 1 : 0) - G.s) * (show ? 0.1 : 0.14); G.l += ((show && G.s > 0.7 ? 1 : 0) - G.l) * 0.12;
  goo.style.transform = 'translate3d(' + G.x + 'px,' + G.y + 'px,0)'; goo.firstChild.style.transform = 'scale(' + G.s.toFixed(3) + ')'; goo.lastChild.style.opacity = G.l.toFixed(3);
}

/* ---------- popup page transition (card grows to fullscreen, then navigates) ---------- */
let popup = null;
window.__wubbleOpen = (rect, src, color, href) => {
  if (popup) return;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;z-index:80;overflow:hidden;background:' + color + ' center/cover no-repeat;will-change:left,top,width,height,border-radius;';
  if (src) el.style.backgroundImage = 'url(' + src + ')';
  document.body.appendChild(el); popup = { el, rect, t0: performance.now(), href };
  sessionStorage.setItem('wubbleReveal', '1');
};
function tickPopup(now) {
  if (!popup) return; const { el, rect } = popup, t = Math.min(1, (now - popup.t0) / 1100);
  const k = 1 - Math.pow(1 - t, 4), ov = Math.sin(Math.PI * t) * 0.03;
  const L = rect.left * (1 - k), T = rect.top * (1 - k), Wd = rect.width + (innerWidth - rect.width) * k, Hd = rect.height + (innerHeight - rect.height) * k;
  Object.assign(el.style, { left: (L - Wd * ov / 2) + 'px', top: (T - Hd * ov / 2) + 'px', width: (Wd * (1 + ov)) + 'px', height: (Hd * (1 + ov)) + 'px', borderRadius: ((1 - k) * 22) + 'px' });
  if (t >= 1 && !popup.went) { popup.went = true; location.href = popup.href; }
}
// on project pages: reveal from the full-bleed cover colour
if (sessionStorage.getItem('wubbleReveal')) {
  sessionStorage.removeItem('wubbleReveal');
  const cv = document.createElement('div'); cv.style.cssText = 'position:fixed;inset:0;z-index:80;background:#050505;pointer-events:none;transition:clip-path 1.1s cubic-bezier(.76,0,.24,1);clip-path:inset(0 0 0 0);';
  document.body.appendChild(cv); requestAnimationFrame(() => requestAnimationFrame(() => { cv.style.clipPath = 'inset(0 0 100% 0)'; setTimeout(() => cv.remove(), 1200); }));
}

/* ---------- intro loader ---------- */
let loaderDone = !bool('loader', true) || !!document.querySelector('[data-wubble="project-page"]');
if (!loaderDone) {
  const L = document.createElement('div');
  L.style.cssText = 'position:fixed;inset:0;z-index:200;background:#050505;color:#ecebe6;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(20px,4vw,40px);box-sizing:border-box;clip-path:inset(0 0 0 0);';
  L.innerHTML = '<div style="display:flex;justify-content:space-between;font:11px JetBrains Mono,monospace;letter-spacing:.06em;text-transform:uppercase;color:#8f8e89"><span>wubble.agency</span><span>loading experience</span></div><div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px"><div style="overflow:hidden"><div data-w="word" style="font-weight:700;font-size:clamp(40px,9vw,140px);line-height:.86;letter-spacing:-.02em;text-transform:uppercase;transform:translate3d(0,105%,0);font-family:Oswald,sans-serif">Motion \u00b7 Digital</div></div><div data-w="count" style="font-weight:700;font-size:clamp(56px,14vw,220px);line-height:.8;font-variant-numeric:tabular-nums;font-family:Oswald,sans-serif">000</div></div><div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(236,235,230,.12)"><div data-w="bar" style="height:100%;background:#ecebe6;transform-origin:0 50%;transform:scaleX(0)"></div></div>';
  document.body.appendChild(L); document.documentElement.style.overflow = 'hidden';
  const cnt = L.querySelector('[data-w=count]'), bar = L.querySelector('[data-w=bar]'), word = L.querySelector('[data-w=word]');
  const lines = W('hero-title') ? Array.from(W('hero-title').children) : [];
  lines.forEach((ln) => { ln.style.clipPath = 'inset(0 0 100% 0)'; });
  let shown = 0, outT = 0, fontsOK = false; const t0 = performance.now(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsOK = true; });
  const step = () => {
    const now = performance.now(), el = now - t0;
    const tgt = Math.min(1, Math.min(el / 1900, 1) * 0.6 + ((fontsOK ? 0.35 : 0) + (portrait || el > 6000 ? 0.65 : 0)) * 0.4 + (el > 6000 ? 1 : 0));
    shown += (tgt - shown) * 0.08; if (tgt >= 1 && shown > 0.995) shown = 1;
    cnt.textContent = String(Math.round(shown * 100)).padStart(3, '0'); bar.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
    word.style.transform = 'translate3d(0,' + ((1 - (1 - Math.pow(1 - Math.min(1, el / 900), 4))) * 105) + '%,0)';
    if (shown >= 1 && !outT) outT = now + 250;
    if (outT && now > outT) {
      const k = Math.min(1, (now - outT) / 1100), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      L.style.clipPath = 'inset(0 0 ' + (e * 100).toFixed(2) + '% 0)';
      lines.forEach((ln, j) => { const lj = Math.max(0, Math.min(1, (k - 0.3 - j * 0.1) / 0.6)); ln.style.clipPath = lj >= 1 ? '' : 'inset(0 0 ' + ((1 - lj) * 100).toFixed(2) + '% 0)'; });
      if (k >= 1) { L.remove(); document.documentElement.style.overflow = ''; loaderDone = true; return; }
    }
    requestAnimationFrame(step);
  };
  step();
}

/* ---------- main loop ---------- */
function frame(t) {
  requestAnimationFrame(frame);
  if (lenis) lenis.raf(t);
  const now = performance.now(), vh = svh();
  updateSwap(now); updateSections(vh); updateBleed(now, vh);
  mouseN.sx += (mouseN.x - mouseN.sx) * 0.04; mouseN.sy += (mouseN.y - mouseN.sy) * 0.04;
  tickServices(now, vh); tickRay(now, vh); tickHand(now, vh); tickContent(vh); tickInk(now); tickGoo(); tickPopup(now);
  if (window.__wubbleRibbon) window.__wubbleRibbon(now, vh);
}
requestAnimationFrame(frame);
