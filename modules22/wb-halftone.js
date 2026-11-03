/* Wubble halftone reveal: plain-JS port of React Bits <HalftoneReveal /> (MIT, reactbits.dev). Each image is printed as a
   halftone screen; around the cursor the dots swell into the real photo, with a trail that shrinks back into print.
   Webflow: put data-wb-halftone-grid on a section → every <img> inside gets the effect (add or swap images in the Designer).
   Or data-wb-halftone on a single image. Options (on the grid or the image): data-ht-mode="mono|duotone|color" · data-ht-shape="dot|ellipse|square|diamond|line|cross"
   · data-ht-cell="6" · data-ht-angle="45" · data-ht-ink="#f4f1ea" · data-ht-accent="#ff4f2a" · data-ht-paper="#0e0e0d" · data-ht-radius="160"
   · data-ht-softness="0.6" · data-ht-linger="1.2" · data-ht-contrast="1.1" · data-ht-roughness="0" · data-ht-intro="true" · data-ht-burst="true".
   Phones/browsers keep only a few WebGL contexts: each image holds one only while it is near the screen, and gives it back when scrolled away. */
(() => {
  if (window.__wbHalftone) return; window.__wbHalftone = 1;
  const VERTEX = `#version 300 es
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
  const MASK = `#version 300 es
precision highp float;
uniform sampler2D uPrevious; uniform vec2 uTexture; uniform vec2 uView; uniform vec2 uFrom; uniform vec2 uTo;
uniform float uRadius; uniform float uSoftness; uniform float uStrength; uniform float uFade;
out vec4 outColor;
float segment(vec2 p, vec2 a, vec2 b) { vec2 ab = b - a; float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0); return length(p - a - ab * h); }
void main() {
  vec2 uv = gl_FragCoord.xy / uTexture; vec2 p = vec2(uv.x, 1.0 - uv.y) * uView;
  float trail = max(texture(uPrevious, uv).r - uFade, 0.0);
  float band = max(uRadius * uSoftness, 1.0);
  float brush = clamp((uRadius - segment(p, uFrom, uTo)) / band, 0.0, 1.0);
  brush = brush * brush * (3.0 - 2.0 * brush);
  outColor = vec4(max(trail, brush * uStrength), 0.0, 0.0, 1.0);
}`;
  const VIEW = `#version 300 es
precision highp float;
uniform sampler2D uImage; uniform sampler2D uMask; uniform vec2 uResolution; uniform vec2 uView; uniform float uDpr; uniform vec4 uFrame;
uniform float uTexels; uniform float uMode; uniform float uShape; uniform float uCell; uniform float uAngle; uniform float uScale;
uniform vec3 uInk; uniform vec3 uAccent; uniform vec3 uPaper; uniform float uContrast; uniform float uBrightness; uniform float uInvert;
uniform float uRough; uniform float uShift; uniform vec3 uMatte; uniform float uKey; uniform float uReverse; uniform float uIntro;
uniform vec4 uBursts[4]; uniform float uBurstWidth;
out vec4 outColor;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 CYAN = vec3(0.0, 0.64, 0.93); const vec3 MAGENTA = vec3(0.92, 0.07, 0.56); const vec3 YELLOW = vec3(1.0, 0.91, 0.0);
const vec3 KEY = vec3(0.11, 0.1, 0.12); const vec3 RED = vec3(1.0, 0.16, 0.12); const vec3 GREEN = vec3(0.12, 1.0, 0.3); const vec3 BLUE = vec3(0.16, 0.32, 1.0);
mat2 rotate(float a) { float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
vec4 photo(vec2 p, float lod, float margin) {
  vec2 uv = (p - uFrame.xy) / uFrame.zw; vec4 c = textureLod(uImage, clamp(uv, 0.0, 1.0), lod);
  vec2 slack = margin * uCell / uFrame.zw; vec2 inside = step(-slack, uv) * step(uv, 1.0 + slack);
  float keep = inside.x * inside.y * c.a; keep *= mix(1.0, smoothstep(0.05, 0.2, distance(c.rgb, uMatte)), uKey);
  return vec4(c.rgb, keep); }
float grade(float v) { v = clamp((v - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0); return mix(v, 1.0 - v, uInvert); }
vec3 gradeColor(vec3 c) { return vec3(grade(c.r), grade(c.g), grade(c.b)); }
vec3 tone(vec3 c) { return pow(max(c, 0.0), vec3(1.5)); }
float press(float t, float alpha) { return (0.05 + clamp(t, 0.0, 1.0) * 0.89) * alpha; }
float plate(float t, float alpha) { return (0.02 + clamp(t, 0.0, 1.0) * 0.92) * alpha; }
vec3 decode(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
vec4 separate(vec3 color) {
  vec3 target = clamp(tone(gradeColor(color)) / max(tone(uPaper), vec3(0.02)), 0.0, 1.0);
  vec3 absorbC = 1.0 - decode(CYAN); vec3 absorbM = 1.0 - decode(MAGENTA); vec3 absorbY = 1.0 - decode(YELLOW);
  float bright = pow(max(max(target.r, target.g), target.b), 0.4545);
  float key = pow(clamp(1.0 - bright / 0.62, 0.0, 1.0), 1.4) * 0.95;
  vec3 rest = clamp(target / max(1.0 - key * (1.0 - decode(KEY)), vec3(0.03)), 0.0, 1.0);
  vec3 a = 1.0 - rest;
  for (int i = 0; i < 3; i++) {
    vec3 tc = 1.0 - a.x * absorbC; vec3 tm = 1.0 - a.y * absorbM; vec3 ty = 1.0 - a.z * absorbY;
    mat3 slope = mat3(-absorbC * tm * ty, -absorbM * tc * ty, -absorbY * tc * tm);
    if (abs(determinant(slope)) < 1e-6) break;
    a = clamp(a - inverse(slope) * (tc * tm * ty - rest), 0.0, 1.0); }
  return vec4(a, key); }
vec3 emit(vec3 color) { vec3 target = max(tone(gradeColor(color)) - tone(uPaper), 0.0); mat3 lights = mat3(decode(RED), decode(GREEN), decode(BLUE)); return clamp(inverse(lights) * target, 0.0, 1.0); }
float metric(vec2 f) {
  if (uShape < 0.5) return length(f); if (uShape < 1.5) return length(f * vec2(0.8, 1.15)); if (uShape < 2.5) return max(abs(f.x), abs(f.y));
  if (uShape < 3.5) return abs(f.x) + abs(f.y); if (uShape < 4.5) return abs(f.y); return min(abs(f.x), abs(f.y)); }
float reach(float t) {
  t = clamp(t, 0.0, 1.0);
  if (uShape < 0.5) return t < 0.785 ? sqrt(t / 3.14159) : mix(0.5, 0.72, (t - 0.785) / 0.215);
  if (uShape < 1.5) return t < 0.7 ? sqrt(t * 0.92 / 3.14159) : mix(0.4497, 0.72, (t - 0.7) / 0.3);
  if (uShape < 2.5) return 0.5 * sqrt(t) + 0.02 * t;
  if (uShape < 3.5) return t < 0.5 ? sqrt(t * 0.5) : 1.0 - sqrt((1.0 - t) * 0.5);
  if (uShape < 4.5) return 0.52 * t;
  return (1.0 - sqrt(1.0 - t)) * 0.5 + 0.02 * t; }
vec2 center(vec2 p, float angle) { vec2 q = rotate(angle) * p / uCell; vec2 c = floor(q) + 0.5; if (uShape > 3.5 && uShape < 4.5) c.x = q.x; return rotate(-angle) * c * uCell; }
float dots(vec2 p, float angle, float t, float seed, float grow) {
  vec2 q = rotate(angle) * p / uCell; float d = metric(fract(q) - 0.5);
  d += (noise(p * 0.42 + seed * 17.0) - 0.5) * uRough * 0.18;
  float r = reach(t) * uScale * grow; float w = max(fwidth(d), 0.0001) * 0.75;
  return smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0); }
float coverage(vec4 image) {
  float shade = dot(tone(gradeColor(image.rgb)), LUMA); float paper = dot(tone(uPaper), LUMA); float span = dot(tone(uInk), LUMA) - paper;
  float t = abs(span) < 0.02 ? 1.0 - shade : (shade - paper) / span; return press(t, image.a); }
float burst(vec2 p) {
  float value = 0.0;
  for (int i = 0; i < 4; i++) { vec4 b = uBursts[i]; if (b.w <= 0.0) continue;
    float offset = distance(p, b.xy) - b.z; float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * b.w); }
  return value; }
void main() {
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;
  float lod = log2(max(uCell * uTexels, 1.0)); float base = uAngle; vec2 drift = vec2(uShift, uShift * -0.6);
  vec2 field = p / max(uView.x, uView.y) - uView / max(uView.x, uView.y) * 0.5;
  float delay = length(field) * 1.15 + hash(floor(p / uCell)) * 0.06;
  float grow = smoothstep(0.0, 1.0, clamp((uIntro * 1.7 - delay) / 0.45, 0.0, 1.0));
  vec3 print = uPaper;
  if (uMode < 0.5) {
    float k = dots(p, base, coverage(photo(center(p, base), lod, 0.5)), 0.0, grow); print = mix(uPaper, uInk, k);
  } else if (uMode < 1.5) {
    float second = base + 0.5236;
    float tA = coverage(photo(center(p, base), lod, 0.5)); float tB = coverage(photo(center(p + drift, second) - drift, lod, 0.5));
    float kA = dots(p, base, pow(tA, 1.9), 0.0, grow); float kB = dots(p + drift, second, clamp(tB * 1.3, 0.0, 1.0) * 0.8, 1.0, grow);
    if (dot(uPaper, LUMA) > 0.5) print = uPaper * mix(vec3(1.0), uAccent, kB) * mix(vec3(1.0), uInk, kA);
    else print = min(uPaper + uAccent * kB + uInk * kA, vec3(1.0));
  } else if (dot(uPaper, LUMA) > 0.5) {
    float ac = base - 0.5236; float am = base + 0.5236; float ay = base - 0.7854;
    vec4 sc = photo(center(p + drift, ac) - drift, lod, 0.5); vec4 sm = photo(center(p - drift, am) + drift, lod, 0.5);
    vec4 sy = photo(center(p + drift.yx, ay) - drift.yx, lod, 0.5); vec4 sk = photo(center(p, base), lod, 0.5);
    float kc = sc.a > 0.0 ? dots(p + drift, ac, plate(separate(sc.rgb).x, sc.a), 1.0, grow) : 0.0;
    float km = sm.a > 0.0 ? dots(p - drift, am, plate(separate(sm.rgb).y, sm.a), 2.0, grow) : 0.0;
    float ky = sy.a > 0.0 ? dots(p + drift.yx, ay, plate(separate(sy.rgb).z, sy.a), 3.0, grow) : 0.0;
    float kk = sk.a > 0.0 ? dots(p, base, plate(separate(sk.rgb).w, sk.a), 4.0, grow) : 0.0;
    print = uPaper; print *= mix(vec3(1.0), CYAN, kc); print *= mix(vec3(1.0), MAGENTA, km); print *= mix(vec3(1.0), YELLOW, ky); print *= mix(vec3(1.0), KEY, kk);
  } else {
    float ar = base - 0.5236; float ag = base + 0.5236;
    vec4 sr = photo(center(p + drift, ar) - drift, lod, 0.5); vec4 sg = photo(center(p - drift, ag) + drift, lod, 0.5); vec4 sb = photo(center(p, base), lod, 0.5);
    float kr = dots(p + drift, ar, plate(emit(sr.rgb).x, sr.a), 1.0, grow); float kg = dots(p - drift, ag, plate(emit(sg.rgb).y, sg.a), 2.0, grow);
    float kb = dots(p, base, plate(emit(sb.rgb).z, sb.a), 3.0, grow);
    print = min(uPaper + RED * kr + GREEN * kg + BLUE * kb, vec3(1.0));
  }
  vec2 maskUv = vec2(p.x / uView.x, 1.0 - p.y / uView.y);
  float shown = max(texture(uMask, maskUv).r, burst(p));
  shown = mix(shown, 1.0 - shown, uReverse); shown = shown * shown * (3.0 - 2.0 * shown);
  vec2 q = rotate(base) * p / uCell; float d = metric(fract(q) - 0.5);
  float r = reach(1.0) * 1.08 * shown; float w = max(fwidth(d), 0.0001) * 0.75;
  float k = smoothstep(r + w, r - w, d) * clamp(r / (w * 2.0), 0.0, 1.0);
  vec4 sharp = photo(p, 0.0, 0.0); vec3 real = mix(uPaper, sharp.rgb, sharp.a);
  outColor = vec4(mix(print, real, k), 1.0);
}`;
  const MODES = { mono: 0, duotone: 1, color: 2 }, SHAPES = { dot: 0, ellipse: 1, square: 2, diamond: 3, line: 4, cross: 5 };
  const MAX_BURSTS = 4, BURST_SECONDS = 1.3, INTRO_SECONDS = 1.4, MASK_SCALE = 0.5;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const compile = (gl, type, src) => { const s = gl.createShader(type); if (!s) return null; gl.shaderSource(s, src); gl.compileShader(s); if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s; console.warn('[halftone]', gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; };
  const link = (gl, frag) => { const v = compile(gl, gl.VERTEX_SHADER, VERTEX), f = compile(gl, gl.FRAGMENT_SHADER, frag), p = gl.createProgram(); if (!v || !f || !p) return null;
    gl.attachShader(p, v); gl.attachShader(p, f); gl.bindAttribLocation(p, 0, 'aPosition'); gl.linkProgram(p); gl.deleteShader(v); gl.deleteShader(f); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null; };
  const locate = (gl, p, names) => { const o = {}; for (const n of names) o[n] = gl.getUniformLocation(p, n); return o; };
  const measureEdge = (ctx, image) => { const size = 32; ctx.canvas.width = size; ctx.canvas.height = size; ctx.clearRect(0, 0, size, size); ctx.drawImage(image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data, sum = [0, 0, 0], sq = [0, 0, 0]; let count = 0, clear = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { if (x > 0 && y > 0 && x < size - 1 && y < size - 1) continue; const i = (y * size + x) * 4; if (data[i + 3] < 250) clear++;
      for (let c = 0; c < 3; c++) { const v = data[i + c] / 255; sum[c] += v; sq[c] += v * v; } count++; }
    const matte = sum.map((s) => s / count), spread = matte.reduce((t, m, c) => t + Math.sqrt(Math.max(0, sq[c] / count - m * m)), 0) / 3;
    return { matte, plain: clear < count * 0.5 && spread < 0.06 }; };
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const toRgb = (v) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = '#000'; probe.fillStyle = v; probe.fillRect(0, 0, 1, 1); const [r, g, b] = probe.getImageData(0, 0, 1, 1).data; return [r / 255, g / 255, b / 255]; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* one image: the WebGL part (start/stop) is separate from the element, so the context can be released off screen */
  const attach = (img, grid) => {
    if (img.__ht) return; img.__ht = 1;
    const opt = (k, d) => img.getAttribute('data-ht-' + k) ?? (grid && grid.getAttribute('data-ht-' + k)) ?? d;
    const S = { mode: MODES[opt('mode', 'mono')] ?? 0, shape: SHAPES[opt('shape', 'dot')] ?? 0, cell: clamp(+opt('cell', 6), 2, 80), angle: +opt('angle', 45), scale: clamp(+opt('scale', 1), 0.2, 2),
      ink: toRgb(opt('ink', '#f4f1ea')), accent: toRgb(opt('accent', '#ff4f2a')), paper: toRgb(opt('paper', '#0e0e0d')), contrast: +opt('contrast', 1.1), brightness: +opt('brightness', 0),
      invert: opt('invert', 'false') === 'true', rough: clamp(+opt('roughness', 0), 0, 1), mis: clamp(+opt('misregistration', 0), 0, 1), radius: Math.max(0, +opt('radius', 160)),
      soft: clamp(+opt('softness', 0.6), 0, 1), linger: Math.max(0, +opt('linger', 1.2)), reverse: opt('reverse', 'false') === 'true', burst: opt('burst', 'true') !== 'false', intro: opt('intro', 'true') !== 'false',
      fit: getComputedStyle(img).objectFit === 'contain' ? 'contain' : 'cover' };
    const box = img.parentElement; if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    let cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:absolute;display:block;pointer-events:none;opacity:0;transition:opacity .4s ease;'; img.after(cv);
    const place = () => { cv.style.left = img.offsetLeft + 'px'; cv.style.top = img.offsetTop + 'px'; cv.style.width = img.offsetWidth + 'px'; cv.style.height = img.offsetHeight + 'px'; };
    const pointer = { x: 0, y: 0, inside: false, fresh: true }, brush = { x: 0, y: 0, px: 0, py: 0 }, bursts = [], burstData = new Float32Array(MAX_BURSTS * 4);
    let G = null, raf = 0, last = 0, presence = 0, trailUntil = 0, introStart = 0, matte = [0, 0, 0], key = 0, W = 1, H = 1;
    const local = (e) => { const r = img.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
    const start = () => { if (G) return; const gl = cv.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false }); if (!gl) return;
      const maskP = link(gl, MASK), viewP = link(gl, VIEW); if (!maskP || !viewP) return;
      const mU = locate(gl, maskP, ['uPrevious', 'uTexture', 'uView', 'uFrom', 'uTo', 'uRadius', 'uSoftness', 'uStrength', 'uFade']);
      const vU = locate(gl, viewP, ['uImage', 'uMask', 'uResolution', 'uView', 'uDpr', 'uFrame', 'uTexels', 'uMode', 'uShape', 'uCell', 'uAngle', 'uScale', 'uInk', 'uAccent', 'uPaper', 'uContrast', 'uBrightness', 'uInvert', 'uRough', 'uShift', 'uMatte', 'uKey', 'uReverse', 'uIntro', 'uBursts', 'uBurstWidth']);
      const vao = gl.createVertexArray(), buf = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
      const floatMask = !!gl.getExtension('EXT_color_buffer_float'), tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const mkMask = (w, h) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        if (floatMask) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
        const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { t, fb, w, h }; };
      G = { gl, maskP, viewP, mU, vU, vao, tex, floatMask, mkMask, masks: [mkMask(2, 2), mkMask(2, 2)], image: null };
      const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async';
      im.onload = () => { if (!G || G.gl !== gl) return; gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); } catch (e) { console.warn('[halftone] image needs CORS', im.src); return; }
        gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        try { const sm = document.createElement('canvas').getContext('2d', { willReadFrequently: true }), e2 = measureEdge(sm, im); matte = e2.matte; key = e2.plain ? 1 : 0; } catch (e) { key = 0; }
        G.image = im; introStart = performance.now(); resize(); img.style.opacity = '0'; cv.style.opacity = '1'; wake(); };
      im.src = img.currentSrc || img.src; resize(); };
    const stop = () => { if (!G) return; cancelAnimationFrame(raf); raf = 0; const ext = G.gl.getExtension('WEBGL_lose_context'); G = null; if (ext) ext.loseContext();
      img.style.opacity = ''; cv.style.opacity = '0'; /* a fresh canvas for the next start (a lost context can't be reused) */ const n = cv.cloneNode(); cv.replaceWith(n); cv = n; };
    const resize = () => { place(); W = Math.max(1, img.offsetWidth); H = Math.max(1, img.offsetHeight); if (!G) return; const dpr = Math.min(devicePixelRatio || 1, 2), c = G.gl.canvas;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); const mw = Math.max(2, Math.round(W * MASK_SCALE)), mh = Math.max(2, Math.round(H * MASK_SCALE));
      if (mw !== G.masks[0].w || mh !== G.masks[0].h) { G.masks.forEach((m) => { G.gl.deleteFramebuffer(m.fb); G.gl.deleteTexture(m.t); }); G.masks = [G.mkMask(mw, mh), G.mkMask(mw, mh)]; } wake(); };
    const frame = (now) => { raf = 0; if (!G || document.hidden) return; const { gl } = G, dt = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 1 / 60; last = now;
      presence += ((pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16));
      if (pointer.fresh) { brush.x = brush.px = pointer.x; brush.y = brush.py = pointer.y; pointer.fresh = false; } else { const f = 1 - Math.exp(-dt / 0.035); brush.x += (pointer.x - brush.x) * f; brush.y += (pointer.y - brush.y) * f; }
      burstData.fill(0); for (let i = bursts.length - 1; i >= 0; i--) if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1);
      bursts.forEach((b, i) => { const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS), rch = Math.hypot(Math.max(b.x, W - b.x), Math.max(b.y, H - b.y)) + 80;
        burstData[i * 4] = b.x; burstData[i * 4 + 1] = b.y; burstData[i * 4 + 2] = rch * Math.sin((k * Math.PI) / 2); burstData[i * 4 + 3] = 1 - k * k * k; });
      if (presence > 0.002) trailUntil = now + S.linger * 1000 + 200;
      const M = G.masks; gl.bindFramebuffer(gl.FRAMEBUFFER, M[1].fb); gl.viewport(0, 0, M[1].w, M[1].h); gl.useProgram(G.maskP); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, M[0].t);
      const mu = G.mU; gl.uniform1i(mu.uPrevious, 0); gl.uniform2f(mu.uTexture, M[1].w, M[1].h); gl.uniform2f(mu.uView, W, H); gl.uniform2f(mu.uFrom, brush.px, brush.py); gl.uniform2f(mu.uTo, brush.x, brush.y);
      gl.uniform1f(mu.uRadius, S.radius * (0.45 + 0.55 * presence)); gl.uniform1f(mu.uSoftness, S.soft); gl.uniform1f(mu.uStrength, presence);
      gl.uniform1f(mu.uFade, Math.max(S.linger > 0 ? dt / S.linger : 1, G.floatMask ? 0 : 1.5 / 255)); gl.bindVertexArray(G.vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.bindFramebuffer(gl.FRAMEBUFFER, null); M.reverse();
      brush.px = brush.x; brush.py = brush.y;
      const im = G.image, sc = im ? (S.fit === 'cover' ? Math.max : Math.min)(W / im.naturalWidth, H / im.naturalHeight) : 1, fw = im ? im.naturalWidth * sc : W, fh = im ? im.naturalHeight * sc : H;
      const intro = !im ? 0 : !S.intro || reduce ? 1 : Math.min(1, (now - introStart) / 1000 / INTRO_SECONDS), c = gl.canvas, v = G.vU;
      gl.viewport(0, 0, c.width, c.height); gl.useProgram(G.viewP); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.tex); gl.uniform1i(v.uImage, 0); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, M[0].t); gl.uniform1i(v.uMask, 1);
      gl.uniform2f(v.uResolution, c.width, c.height); gl.uniform2f(v.uView, W, H); gl.uniform1f(v.uDpr, c.width / W); gl.uniform4f(v.uFrame, (W - fw) / 2, (H - fh) / 2, fw, fh); gl.uniform1f(v.uTexels, im ? im.naturalWidth / fw : 1);
      gl.uniform1f(v.uMode, S.mode); gl.uniform1f(v.uShape, S.shape); gl.uniform1f(v.uCell, S.cell); gl.uniform1f(v.uAngle, (S.angle * Math.PI) / 180); gl.uniform1f(v.uScale, S.scale);
      gl.uniform3fv(v.uInk, S.ink); gl.uniform3fv(v.uAccent, S.accent); gl.uniform3fv(v.uPaper, S.paper); gl.uniform1f(v.uContrast, S.contrast); gl.uniform1f(v.uBrightness, S.brightness); gl.uniform1f(v.uInvert, S.invert ? 1 : 0);
      gl.uniform1f(v.uRough, S.rough); gl.uniform1f(v.uShift, S.mis * S.cell * 0.35); gl.uniform3fv(v.uMatte, matte); gl.uniform1f(v.uKey, key); gl.uniform1f(v.uReverse, S.reverse ? 1 : 0);
      gl.uniform1f(v.uIntro, 1 - (1 - intro) * (1 - intro)); gl.uniform4fv(v.uBursts, burstData); gl.uniform1f(v.uBurstWidth, Math.max(60, S.radius * 0.9)); gl.bindVertexArray(G.vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.bindVertexArray(null);
      if (pointer.inside || presence > 0.002 || bursts.length || now < trailUntil || (im && intro < 1)) raf = requestAnimationFrame(frame); else last = 0; };
    const wake = () => { if (!raf && G) raf = requestAnimationFrame(frame); };
    /* the canvas ignores the mouse (the page's own hover effects keep working): listen on the window and test the image box */
    addEventListener('pointermove', (e) => { if (!G) return; const inside = local(e); if (inside && !pointer.inside) pointer.fresh = true; pointer.inside = inside; if (inside || presence > 0.002) wake(); }, { passive: true });
    addEventListener('pointerdown', (e) => { if (!G || !S.burst || !local(e)) return; bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() }); if (bursts.length > MAX_BURSTS) bursts.shift(); wake(); }, { passive: true });
    new ResizeObserver(resize).observe(img);
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop())), { rootMargin: '200px 0px' }).observe(img);
  };
  const scan = () => { document.querySelectorAll('[data-wb-halftone-grid]').forEach((g) => g.querySelectorAll('img').forEach((i) => attach(i, g))); document.querySelectorAll('img[data-wb-halftone]').forEach((i) => attach(i, null)); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', scan) : scan();
  document.addEventListener('wb:swap', () => setTimeout(scan, 60));
})();
