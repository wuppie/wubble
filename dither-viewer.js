// DITHER VIEWER TEMPLATE — reusable for any .glb. Usage:
//   import { createPortrait } from './dither-viewer.js';
//   await createPortrait(el, { model: 'url.glb', eyes: null, neck: -0.5, post: { grid: 2 } });
// Set eyes to {L,R,size,meet} (normalised head space) to enable blinking; null disables it.
// neck: crop height in normalised units (-0.5 = no crop; model is scaled to height 1, centred at 0).
// Portrait scene v8: new textured low-poly Meshy model (GLTFLoader) + same lighting / film post.
import * as THREE from 'https://esm.sh/three@0.184.0';
import { GLTFLoader } from 'https://esm.sh/three@0.184.0/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'https://esm.sh/three@0.184.0/examples/jsm/libs/meshopt_decoder.module.js';
import { KTX2Loader } from 'https://esm.sh/three@0.184.0/examples/jsm/loaders/KTX2Loader.js';
import { RGBELoader } from 'https://esm.sh/three@0.184.0/examples/jsm/loaders/RGBELoader.js';

export const LIGHTS = {
  top:       { angle: -0.45, height: 2.6, key: 2.7, rimL: 0.45, rimR: 0.2, fill: 0.06, amb: 0.05, cone: 0.36 },
  rembrandt: { angle: -0.8,  height: 1.5, key: 3.0, rimL: 0.15, rimR: 0.35, fill: 0.04, amb: 0.03, cone: 0.32 },
  split:     { angle: -1.55, height: 0.5, key: 3.0, rimL: 0.0,  rimR: 0.25, fill: 0.0,  amb: 0.02, cone: 0.4 },
  rim:       { angle: 2.6,   height: 1.2, key: 3.4, rimL: 1.2,  rimR: 0.9,  fill: 0.03, amb: 0.02, cone: 0.45 },
  under:     { angle: 0.15,  height: -1.6, key: 2.6, rimL: 0.2, rimR: 0.2,  fill: 0.0,  amb: 0.03, cone: 0.4 },
  soft:      { angle: -0.3,  height: 1.8, key: 1.6, rimL: 0.3,  rimR: 0.3,  fill: 0.35, amb: 0.15, cone: 0.6 },
};

export const CONFIG = {
  model: 'https://raw.githubusercontent.com/wuppie/wubble/main/Meshy_AI_Low_Poly_Triangle_Por_0930092527_texture.glb',
  height: 1.0, // model is normalised to this height
  post: { exposure: 0.5, bloom: 0.12, grain: 0.0, vignette: 1.4, contrast: 0.3, saturation: 1.0, aperture: 2.0, tint: 0.0, stipple: 0.0, dotSize: 1.0, animate: 0.0, soft: 0.0,
    dither: 1.0, grid: 2.0, pixelRatio: 1.0, ditherInvert: 0.0, ditherGray: 1.0,
    hoverRadius: 0.22, hoverAmt: 0.0 }, // hover scanner disabled (set hoverAmt: 1 to re-enable)
  neck: -0.16,       // head-only crop: geometry below this height (normalised, centre = 0) fades out and is clipped
  neckFade: 0.04,
  light: 'split', keyAngle: 1.62,
  // Eyes in normalised head space (x, y, surface z). null = no blink (other models).
  eyes: { L: [-0.085, 0.127, 0.255], R: [0.055, 0.127, 0.262], size: [0.034, 0.016], meet: 0.2 },
  blink: { close: 0.075, hold: 0.04, open: 0.17, interval: 4.0, doubleChance: 0.18, lag: 0.01 },
  follow: { yaw: 0.5, pitch: 0.24, speed: 0.14 },
  textureAmount: 1.0, // 0 = plain grey sculpt (like the reference), 1 = model's own texture
};

function smoothNormals(geo) {
  const P = geo.attributes.position.array, n = P.length / 3, idx = geo.index ? geo.index.array : null;
  const key = (i) => Math.round(P[i*3] * 1e5) + ',' + Math.round(P[i*3+1] * 1e5) + ',' + Math.round(P[i*3+2] * 1e5);
  const map = new Map(), id = new Uint32Array(n); for (let i = 0; i < n; i++) { const k = key(i); let v = map.get(k); if (v === undefined) map.set(k, v = map.size); id[i] = v; }
  const acc = new Float32Array(map.size * 3), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const tri = idx ? idx.length / 3 : n / 3;
  for (let t = 0; t < tri; t++) { const i0 = idx ? idx[t*3] : t*3, i1 = idx ? idx[t*3+1] : t*3+1, i2 = idx ? idx[t*3+2] : t*3+2;
    a.fromArray(P, i0*3); b.fromArray(P, i1*3); c.fromArray(P, i2*3); c.sub(b); a.sub(b); c.cross(a);
    for (const i of [i0, i1, i2]) { acc[id[i]*3] += c.x; acc[id[i]*3+1] += c.y; acc[id[i]*3+2] += c.z; } }
  const N = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const j = id[i]*3, l = Math.hypot(acc[j], acc[j+1], acc[j+2]) || 1; N[i*3] = acc[j]/l; N[i*3+1] = acc[j+1]/l; N[i*3+2] = acc[j+2]/l; }
  geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
}

// Eyelid blink: squashes the lid region toward the lid line, in head (pivot) space
const BLINK_GLSL = /* glsl */`
uniform vec3 uEyeL; uniform vec3 uEyeR; uniform vec3 uEyeSize; uniform vec2 uBlink; uniform mat4 uM; uniform mat4 uMi;
void lid(inout vec3 p, vec3 c, float b){
  if (b <= 0.001) return;
  float closeY = c.y - uEyeSize.y * uEyeSize.z;
  float up = step(closeY, p.y);
  vec2 d = vec2((p.x - c.x) / uEyeSize.x, (p.y - closeY) / (uEyeSize.y * mix(1.0, 1.8, up)));
  float m = (1.0 - smoothstep(0.5, 1.0, length(d))) * smoothstep(c.z - 0.045, c.z - 0.012, p.z);
  float k = b * m;
  p.y = closeY + (p.y - closeY) * (1.0 - 0.96 * k);
  p.z += k * 0.003 * max(0.0, 1.0 - abs(d.x));
}
vec3 blinkDeform(vec3 t){
  vec3 hp = (uM * vec4(t, 1.0)).xyz;
  lid(hp, uEyeL, uBlink.x); lid(hp, uEyeR, uBlink.y);
  return (uMi * vec4(hp, 1.0)).xyz;
}`;

const POST_FRAG = /* glsl */`
uniform sampler2D tScene; uniform sampler2D tDepth; uniform vec2 uRes; uniform float uTime;
uniform float uExposure, uBloom, uGrain, uVignette, uContrast, uSaturation, uAperture, uTint, uFocus, uNear, uFar, uStipple, uDotSize, uAnimate, uSoft;
uniform float uDither, uGrid, uPixelRatio, uDitherInvert, uDitherGray;
uniform vec2 uMouse; uniform float uHover, uHoverRadius, uHoverAmt; uniform vec2 uScan;
uniform float uDissolve; uniform float uCutout;
varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float linDepth(vec2 uv){ float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
float coc(vec2 uv){ float d = linDepth(uv); return clamp(abs(d - uFocus) / d * uAperture * 6.0, 0.0, 1.0); }
// 4x4 Bayer ordered dither (threshold in 0..1)
float bayer4(vec2 p){ vec2 q = mod(floor(p), 4.0); int x = int(q.x), y = int(q.y); int i = x + y * 4;
  float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
  float v = 0.0; for (int k = 0; k < 16; k++) if (k == i) v = m[k]; return (v + 0.5) / 16.0; }
void main(){
  // hover: dither cells grow + ripple around the cursor
  float hd = length((gl_FragCoord.xy - uMouse) / uRes.y);
  float onModel = 1.0 - step(0.99999, texture2D(tDepth, gl_FragCoord.xy / uRes).x);
  float hf = uHover * uHoverAmt * onModel;
  float gridH = uGrid;
  // hover scanner: a scan line sweeps down the model; above it = smooth, below = dithered
  float sy = gl_FragCoord.y / uRes.y;
  float lineY = mix(uScan.x + 0.02, uScan.y - 0.02, uHover);
  float behind = smoothstep(lineY - 0.002, lineY + 0.002, sy);
  float reveal = behind * uHoverAmt * onModel * step(0.001, uHover);
  float scanGlow = onModel * step(0.001, uHover) * step(uHover, 0.999) * uHoverAmt;
  float scanCore = exp(-pow((sy - lineY) / 0.0025, 2.0)) * scanGlow;
  float scanTail = exp(-max(sy - lineY, 0.0) / 0.035) * step(lineY, sy) * scanGlow;
  float pxs = mix(max(1.0, gridH * uPixelRatio), 1.0, reveal) * step(0.5, uDither) + (1.0 - step(0.5, uDither));
  vec2 vUvP = (floor(gl_FragCoord.xy / pxs) + 0.5) * pxs / uRes;
  #define vUv vUvP
  vec2 asp = vec2(uRes.y / uRes.x, 1.0);
  float px = 1.0 / uRes.y;
  float c0 = coc(vUv);
  vec3 col = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < 36; i++) {
    float fi = float(i) + 0.5; float r = sqrt(fi / 36.0); float a = fi * 2.39996;
    vec2 uv = vUv + vec2(cos(a), sin(a)) * r * asp * max(c0 * 0.011, 0.7 * px);
    float w = smoothstep(r - 0.15, r + 0.05, max(coc(uv), c0) + 0.12);
    col += texture2D(tScene, uv).rgb * w; wsum += w;
  }
  col /= max(wsum, 1e-4);
  vec3 bl = vec3(0.0);
  for (int i = 0; i < 24; i++) {
    float fi = float(i) + 0.5; float r = sqrt(fi / 24.0) * 0.06; float a = fi * 2.39996 + 1.3;
    bl += max(texture2D(tScene, vUv + vec2(cos(a), sin(a)) * r * asp).rgb - 0.45, 0.0);
  }
  col += bl / 24.0 * uBloom;
  float flick = 1.0 + (hash(vec2(floor(uTime * 24.0), 3.1)) - 0.5) * 0.015;
  col = aces(col * uExposure * flick);
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, uSaturation);
  col = pow(col, vec3(1.0 / 2.2));
  col = mix(col, col * col * (3.0 - 2.0 * col), uContrast);
  vec2 q = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0); q.y *= 0.82;
  col *= 1.0 - smoothstep(0.2, 0.8, length(q)) * uVignette;
  float L = dot(col, vec3(0.333));
  col += uTint * (mix(vec3(-0.012, 0.0, 0.018), vec3(0.02, 0.008, -0.012), smoothstep(0.1, 0.7, L)));
  // stochastic stipple: each screen dot is lit with probability = local brightness
  {
    float Ls = dot(col, vec3(0.2126, 0.7152, 0.0722));
    vec2 cell = floor(vUv * uRes / max(uDotSize, 0.5));
    float fr = floor(uTime * 12.0) * uAnimate;
    float n = hash(cell + fr * vec2(37.1, 91.7));
    float n2 = hash(cell * 1.7 + 11.3 + fr * vec2(13.7, 7.3));
    float p = pow(Ls, 1.5);
    float dotOn = mix(step(n, p * 1.3), smoothstep(n - 0.25, n + 0.25, p * 1.3), uSoft);
    float amp = mix(0.3 + 0.6 * n2, 0.45 + 0.25 * n2, uSoft);
    vec3 st = vec3(Ls * mix(0.3, 0.55, uSoft) + dotOn * amp * mix(1.0, 0.6, uSoft) * smoothstep(0.02, 0.5, Ls));
    col = mix(col, st, uStipple);
  }
  col = max(col, vec3(0.008));
  if (uDither > 0.5) {
    float Ld = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float thr = bayer4(gl_FragCoord.xy / max(gridH, 1.0));
    float on = step(thr, Ld);
    vec3 tone = mix(col / max(Ld, 1e-3), vec3(1.0), uDitherGray);
    vec3 dc = on * clamp(tone, 0.0, 1.0);
    vec3 dcol = mix(dc, 1.0 - dc, uDitherInvert);
    col = mix(dcol, col, reveal);
  }
  {
    float scanBand = step(fract(gl_FragCoord.y / 3.0), 0.5);
    col += vec3(0.9) * scanCore + vec3(0.12) * scanTail * scanBand;
  }
  vec2 gp = vUv * uRes / 1.35 + floor(uTime * 24.0) * vec2(17.3, 41.7);
  col += ((vn2(gp) * 0.65 + vn2(gp * 2.1) * 0.35) - 0.5) * uGrain * 2.0 * (0.35 + 0.65 * (1.0 - abs(L * 2.0 - 1.0)));
  if (uDissolve > 0.0) {
    vec2 dq = vUv * vec2(uRes.x / uRes.y, 1.0) * 3.0;
    float dn = vn2(dq * 1.7 + uTime * 0.15) * 0.55 + vn2(dq * 4.3 - uTime * 0.2) * 0.3 + vn2(dq * 11.0) * 0.15;
    float dk = uDissolve * 1.25 - 0.12;
    float keep = smoothstep(dk - 0.04, dk + 0.04, dn);
    float rim = smoothstep(0.09, 0.0, abs(dn - dk)) * step(0.001, uDissolve) * (1.0 - smoothstep(0.85, 1.0, uDissolve));
    col = col * keep + vec3(0.07, 0.07, 0.072) * rim * 0.6;
  }
  float bgA = 1.0;
  if (uCutout > 0.5) { float dd = texture2D(tDepth, vUv).r; bgA = 1.0 - step(0.99995, dd); }
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * bgA, bgA);
  #undef vUv
}`;

export async function createPortrait(container, { onProgress, ...overrides } = {}) {
  if (!('rotation' in overrides)) CONFIG.rotation = null;
  if (!('clay' in overrides)) CONFIG.clay = null;
  if (!('glass' in overrides)) CONFIG.glass = null;
  if (!('hdri' in overrides)) CONFIG.hdri = null;
  if (!('toon' in overrides)) CONFIG.toon = false;
  if (!('fit' in overrides)) CONFIG.fit = 1;
  if (!('cutout' in overrides)) CONFIG.cutout = false;
  for (const [k, v] of Object.entries(overrides)) CONFIG[k] = (v && typeof v === 'object' && !Array.isArray(v) && CONFIG[k]) ? { ...CONFIG[k], ...v } : v;
  if (overrides.post) CONFIG.post = { ...CONFIG.post, ...overrides.post };
  const lowGPU = (overrides.maxPR || 2) < 1.5;
  const renderer = new THREE.WebGLRenderer({ alpha: !!CONFIG.cutout, premultipliedAlpha: true, antialias: false, powerPreference: lowGPU ? 'default' : 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, overrides.maxPR || 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010101);
  if (CONFIG.hdri) {
    new RGBELoader().load(CONFIG.hdri, (hdr) => { hdr.mapping = THREE.EquirectangularReflectionMapping; const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(hdr).texture; scene.environmentIntensity = CONFIG.glass ? 1.4 : 0.6; if (scene.environmentRotation) scene.environmentRotation.set(0, 2.2, 0); hdr.dispose(); pm.dispose(); });
  }
  if (CONFIG.glass && !CONFIG.hdri) {
    // studio softbox environment for glass reflections (built locally, no extra downloads)
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x060606, side: THREE.BackSide })));
    const box = (w, h, x, y, z, v) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
    box(4, 1.2, 0, 4.6, 0.5, 6); box(1.2, 4, -4.6, 0.8, 1.2, 2.2); box(1.0, 3.2, 4.6, 0.4, -1.4, 3.4); box(3, 0.6, 0, -4.6, 2, 0.4);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.035).texture; pm.dispose();
  }
  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 20);

  const key = new THREE.SpotLight(0xffffff, 2.7, 0, 0.36, 0.9, 0);
  key.castShadow = true; key.shadow.mapSize.set(overrides.shadowSize || 2048, overrides.shadowSize || 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
  key.shadow.camera.near = 1; key.shadow.camera.far = 6;
  scene.add(key, key.target);
  const rimL = new THREE.DirectionalLight(0xffffff, 0.45); rimL.position.set(-2.6, 1.0, -1.6);
  const rimR = new THREE.DirectionalLight(0xffffff, 0.2); rimR.position.set(2.6, 0.7, -1.3);
  const fill = new THREE.DirectionalLight(0xffffff, 0.06); fill.position.set(-2, -0.2, 1.6);
  const amb = new THREE.HemisphereLight(0xffffff, 0x000000, 0.05);
  scene.add(rimL, rimR, fill, amb);

  const E = CONFIG.eyes;
  const eyeU = { uEyeL: { value: new THREE.Vector3(...(E ? E.L : [0, -9, 0])) }, uEyeR: { value: new THREE.Vector3(...(E ? E.R : [0, -9, 0])) },
    uEyeSize: { value: new THREE.Vector3(...(E ? E.size : [0.001, 0.001]), E ? E.meet : 0) }, uBlink: { value: new THREE.Vector2() },
    uM: { value: new THREE.Matrix4() }, uMi: { value: new THREE.Matrix4() } };
  const texU = { value: CONFIG.textureAmount }, neckU = { value: new THREE.Vector2(CONFIG.neck, CONFIG.neckFade) };
  const ktx2 = new KTX2Loader().setTranscoderPath('https://unpkg.com/three@0.184.0/examples/jsm/libs/basis/').detectSupport(renderer);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx2).loadAsync(CONFIG.model, (e) => onProgress?.(e.total ? e.loaded / e.total : 0));
  const model = gltf.scene;
  const mats = [];
  model.traverse((o) => { if (o.isMesh) {
    o.castShadow = o.receiveShadow = true;
    const src = o.material; smoothNormals(o.geometry);
    const clay = CONFIG.clay, glass = CONFIG.glass;
    const toonGM = CONFIG.toon ? (() => { const g = new THREE.DataTexture(new Uint8Array([18, 90, 170, 255]), 4, 1, THREE.RedFormat); g.minFilter = g.magFilter = THREE.NearestFilter; g.needsUpdate = true; return g; })() : null;
    const m = toonGM
      ? new THREE.MeshToonMaterial({ color: 0xcfcbc5, map: src.map, gradientMap: toonGM })
      : glass
      ? new THREE.MeshPhysicalMaterial({ color: glass.color ?? 0x8c8c8c, metalness: 0, roughness: glass.roughness ?? 0.1, transmission: glass.transmission ?? 0.62, thickness: glass.thickness ?? 1.4, ior: 1.45,
          clearcoat: 1, clearcoatRoughness: 0.06, specularIntensity: 1, envMapIntensity: glass.env ?? 1.5, attenuationColor: new THREE.Color(0x1c1c1c), attenuationDistance: 0.55, side: THREE.FrontSide })
      : clay
      ? new THREE.MeshPhysicalMaterial({ color: clay.color ?? 0x5c5550, roughness: clay.roughness ?? 0.82, metalness: 0, map: src.map, side: THREE.FrontSide,
          sheen: clay.sheen ?? 0.6, sheenRoughness: 0.75, sheenColor: new THREE.Color(clay.sheenColor ?? 0xb8a898), clearcoat: clay.clearcoat ?? 0.06, clearcoatRoughness: 0.6 })
      : new THREE.MeshStandardMaterial({ color: 0x9a9894, roughness: 0.62, metalness: 0, map: src.map, side: THREE.FrontSide });
    m.onBeforeCompile = (sh) => { sh.uniforms.uTex = texU; sh.uniforms.uNeck = neckU;
      Object.assign(sh.uniforms, eyeU);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWY;' + BLINK_GLSL).replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = blinkDeform(transformed);').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', 'if (vWY < uNeck.x) discard;\noutgoingLight *= smoothstep(uNeck.x, uNeck.x + uNeck.y, vWY);\n#include <opaque_fragment>');
      sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 tc = texture2D(map, vMapUv); float tl = dot(tc.rgb, vec3(0.299, 0.587, 0.114));
        diffuseColor.rgb *= mix(vec3(1.0), tc.rgb / max(0.35, 0.5), uTex);
        #endif`).replace('#include <common>', '#include <common>\nuniform float uTex; uniform vec2 uNeck; varying float vWY;'); };
    o.material = m; mats.push(m);
  } });
  if (CONFIG.rotation) { model.rotation.set(...CONFIG.rotation); model.updateMatrixWorld(true); }
  const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const s = CONFIG.height / size.y;
  model.scale.setScalar(s); model.position.set(-ctr.x * s, -ctr.y * s, -ctr.z * s);
  const pivot = new THREE.Group(); pivot.add(model); scene.add(pivot);
  model.updateMatrix(); eyeU.uM.value.copy(model.matrix); eyeU.uMi.value.copy(model.matrix).invert();
  model.updateMatrixWorld(true);
  const head = new THREE.Box3(), v = new THREE.Vector3();
  model.traverse((o) => { if (!o.isMesh) return; const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y > CONFIG.neck) head.expandByPoint(v); } });
  const hs = head.getSize(new THREE.Vector3()), hc = head.getCenter(new THREE.Vector3());
  const faceZ = head.max.z, eyeY = hc.y + hs.y * 0.08;
  key.target.position.set(hc.x, eyeY, hc.z);

  const rt = new THREE.WebGLRenderTarget(1, 1, { type: lowGPU ? THREE.UnsignedByteType : THREE.HalfFloatType, samples: lowGPU ? 0 : 4 });
  rt.depthTexture = new THREE.DepthTexture(1, 1);
  const post = new THREE.ShaderMaterial({
    uniforms: { tScene: { value: rt.texture }, tDepth: { value: rt.depthTexture }, uRes: { value: new THREE.Vector2() }, uTime: { value: 0 },
      uDissolve: { value: 0 }, uCutout: { value: CONFIG.cutout ? 1 : 0 }, uFocus: { value: 3 }, uMouse: { value: new THREE.Vector2(-1e4, -1e4) }, uHover: { value: 0 }, uScan: { value: new THREE.Vector2(1, 0) }, uNear: { value: camera.near }, uFar: { value: camera.far },
      ...Object.fromEntries(Object.entries(CONFIG.post).map(([k, v]) => ['u' + k[0].toUpperCase() + k.slice(1), { value: v }])) },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: POST_FRAG, depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); quad.frustumCulled = false;
  const postScene = new THREE.Scene(); postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const state = { follow: true, keyAngle: -0.45, keyHeight: 2.6, light: 'top' };
  const setLight = (name) => { const L = LIGHTS[name] || LIGHTS.top; state.light = name;
    state.keyAngle = L.angle; state.keyHeight = L.height; key.intensity = L.key; key.angle = L.cone;
    rimL.intensity = L.rimL; rimR.intensity = L.rimR; fill.intensity = L.fill; amb.intensity = L.amb; };
  setLight(CONFIG.light); state.keyAngle = CONFIG.keyAngle;
  const pointer = new THREE.Vector2(), look = new THREE.Vector2(), zero = new THREE.Vector2();
  const hoverRC = new THREE.Raycaster(), ndc = new THREE.Vector2(); let hoverTarget = 0;
  addEventListener('pointermove', (e) => {
    pointer.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
    const r = renderer.domElement.getBoundingClientRect(), pr = renderer.getPixelRatio();
    post.uniforms.uMouse.value.set((e.clientX - r.left) * pr, (r.bottom - e.clientY) * pr);
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    hoverRC.setFromCamera(ndc, camera);
    const h = hoverRC.intersectObject(model, true)[0];
    hoverTarget = h && h.point.y > CONFIG.neck ? 1 : 0;
  });
  addEventListener('pointerleave', () => hoverTarget = 0);
  document.addEventListener('mouseleave', () => hoverTarget = 0);

  // intro: start zoomed in on the face, ease out to the full framing
  let camDist = 1, intro = 0; const INTRO = { start: 1, dur: 0.001 };
  const placeCam = () => { const e = 1 - Math.pow(1 - Math.min(1, intro), 3); const d = camDist * (INTRO.start + (1 - INTRO.start) * e);
    const z = state.zoom || 0, ze = z * z * (3 - 2 * z);
    const dz = d * (1 - ze * 0.9);
    camera.position.set(hc.x + ze * (state.zoomX || 0), hc.y + 0.02 + ze * (state.zoomY || 0), faceZ + dz); camera.lookAt(hc.x, hc.y + 0.01 + ze * (state.zoomY || 0) * 0.6, hc.z); };
  const fit = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h); const pr = renderer.getPixelRatio();
    rt.setSize(w * pr, h * pr); post.uniforms.uRes.value.set(w * pr, h * pr);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camDist = Math.max(hs.y * 1.18 / 2 / t, hs.x * 1.4 / 2 / (t * camera.aspect)) * (CONFIG.fit || 1);
    placeCam(); camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(container); fit();

  const blinks = []; let nextBlink = 1.5; state.autoBlink = true;
  const easeIn = (x) => x * x * x, easeOut = (x) => 1 - Math.pow(1 - x, 2.4);
  const blinkValue = (t) => { const b = CONFIG.blink; let v = 0;
    for (const t0 of blinks) { const p = t - t0; if (p < 0) continue;
      v = Math.max(v, p < b.close ? easeIn(p / b.close) : p < b.close + b.hold ? 1 : p < b.close + b.hold + b.open ? 1 - easeOut((p - b.close - b.hold) / b.open) : 0); }
    return v; };
  const clock = new THREE.Timer(), focusP = new THREE.Vector3();
  const frame = () => {
    clock.update(); const t = clock.getElapsed();
    if (E && state.autoBlink && t > nextBlink) { blinks.push(t); if (Math.random() < CONFIG.blink.doubleChance) blinks.push(t + 0.32);
      nextBlink = t + CONFIG.blink.interval * (0.45 + Math.random() * 1.1); }
    while (blinks.length && t - blinks[0] > 3) blinks.shift();
    eyeU.uBlink.value.set(blinkValue(t), blinkValue(t - CONFIG.blink.lag));
    if (intro < 1) intro = Math.min(1, t / INTRO.dur);
    if (state.zoom !== state._zl || intro < 1) { state._zl = state.zoom; placeCam(); }
    const r = 3.2; key.position.set(Math.sin(state.keyAngle) * r * 0.6, state.keyHeight, Math.cos(state.keyAngle) * r * 0.6);
    look.lerp(state.follow ? pointer : zero, CONFIG.follow.speed);
    pivot.rotation.set(look.y * CONFIG.follow.pitch + Math.sin(t * 0.4) * 0.006, look.x * CONFIG.follow.yaw + Math.sin(t * 0.23) * 0.012, 0);
    focusP.set(0, eyeY, faceZ); pivot.localToWorld(focusP);
    post.uniforms.uFocus.value = camera.position.distanceTo(focusP);
    { const u = post.uniforms.uHover; const sp = 1.6 * Math.min(0.05, clock.getDelta() || 0.016); u.value = hoverTarget > u.value ? Math.min(1, u.value + sp) : Math.max(0, u.value - sp * 1.4); }
    { const tp = new THREE.Vector3(hc.x, head.max.y, hc.z), bt = new THREE.Vector3(hc.x, CONFIG.neck, hc.z); pivot.localToWorld(tp).project(camera); pivot.localToWorld(bt).project(camera);
      post.uniforms.uScan.value.set(tp.y * 0.5 + 0.5, bt.y * 0.5 + 0.5); }
    post.uniforms.uTime.value = t;
    renderer.setRenderTarget(rt); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  };
  renderer.setAnimationLoop(frame);
  return { renderer, scene, camera, model, post: post.uniforms, texU, state, frame, setLight, placeCam, blink: () => blinks.push(clock.getElapsed()) };
}

window.DitherViewer = { createPortrait, CONFIG, LIGHTS };
window.dispatchEvent(new Event('ditherviewer-ready'));
