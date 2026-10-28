/* Wubble "Signal contours": animated topographic contour lines (iso-lines of drifting noise), monochrome, fixed behind the page.
   The cursor pushes a slow bulge into the terrain (lines bunch up around it); clicks send a ripple; scrolling shifts the field.
   One fullscreen WebGL pass at reduced resolution.
   Webflow: empty div [data-wb-contours]. Attributes: data-lines="22" (density) · data-speed="1" · data-opacity="0.55"
   · data-mouse="1" · data-scale="0.75" (render resolution) · data-color="#e9ecf2" */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const FS = `precision highp float; varying vec2 vUv; uniform vec2 uRes, uM; uniform float uT, uLines, uOp, uScroll, uPulse, uMouse; uniform vec3 uCol; uniform vec2 uPP;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }
float gn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1, 0)), f - vec2(1, 0)), u.x), mix(dot(h2(i + vec2(0, 1)), f - vec2(0, 1)), dot(h2(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 R = mat2(0.8, -0.6, 0.6, 0.8); for (int i = 0; i < 4; i++) { s += a * gn(p); p = R * p * 2.02; a *= 0.5; } return s; }
void main(){
  vec2 asp = vec2(uRes.x / uRes.y, 1.0), p = (vUv - 0.5) * asp, m = (uM - 0.5) * asp;
  float t = uT * 0.035;
  vec2 q = p * 1.35 + vec2(0.0, uScroll * 0.25);
  vec2 w = vec2(fbm(q + vec2(t, -t * 0.6)), fbm(q + vec2(4.2 - t * 0.7, 1.3 + t)));
  float hgt = fbm(q + w * 0.9 + t * 0.4);
  float d = length(p - m); hgt += uMouse * 0.22 * exp(-d * d * 9.0);
  float pd = length(p - (uPP - 0.5) * asp); hgt += 0.05 * uPulse * sin(pd * 40.0 - (1.0 - uPulse) * 18.0) * exp(-pd * 3.0);
  float v = hgt * uLines, f = fract(v), fw = fwidth(v) * 1.1;
  float line = 1.0 - smoothstep(0.0, fw, min(f, 1.0 - f));
  float idx = floor(v); float major = step(0.5, fract(idx / 5.0 + 0.001)) * 0.0 + (mod(idx, 5.0) < 0.5 ? 1.0 : 0.0);
  float a = line * mix(0.32, 0.85, major);
  a *= smoothstep(1.25, 0.25, length(p * vec2(0.8, 1.0)));                       /* soft vignette */
  a *= 0.75 + 0.25 * smoothstep(0.6, 0.0, d);                                    /* a little brighter near the cursor */
  float gr = fract(sin(dot(gl_FragCoord.xy + uT, vec2(12.9898, 78.233))) * 43758.5453); a += (gr - 0.5) * 0.04;
  gl_FragColor = vec4(uCol * a * uOp, a * uOp); }`;
  const init = (host) => {
    if (host.__ct) return; host.__ct = 1;
    const at = (k, d) => { const v = host.getAttribute('data-' + k); return v == null ? d : v; };
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;display:block;';
    host.appendChild(cv); const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true }); if (!gl) return; gl.getExtension('OES_standard_derivatives');
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[contours]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, '#extension GL_OES_standard_derivatives : enable\n' + FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uM', 'uT', 'uLines', 'uOp', 'uScroll', 'uPulse', 'uMouse', 'uCol', 'uPP'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    const hex = at('color', '#e9ecf2').replace('#', ''), col = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    gl.uniform3fv(U.uCol, col); gl.uniform1f(U.uLines, +at('lines', 22)); gl.uniform1f(U.uOp, +at('opacity', 0.55)); gl.uniform1f(U.uMouse, +at('mouse', 1));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const SC = Math.max(0.3, Math.min(1, +at('scale', 0.75))), SPD = +at('speed', 1);
    const size = () => { const d = Math.min(2, devicePixelRatio || 1) * SC; cv.width = Math.max(2, innerWidth * d | 0); cv.height = Math.max(2, innerHeight * d | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height); };
    size(); addEventListener('resize', size);
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, pulse = 0, ppx = 0.5, ppy = 0.5, sy = 0, tsy = 0;
    addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
    addEventListener('pointerdown', (e) => { pulse = 1; ppx = e.clientX / innerWidth; ppy = 1 - e.clientY / innerHeight; }, { passive: true });
    const t0 = performance.now(); let last = t0;
    const tick = (now) => { RAF(tick); if (!host.isConnected || document.hidden) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
      mx += (tx - mx) * (1 - Math.exp(-dt * 2.2)); my += (ty - my) * (1 - Math.exp(-dt * 2.2)); pulse = Math.max(0, pulse - dt * 0.6);
      tsy = (window.__wbLenis ? window.__wbLenis.scroll : scrollY) / innerHeight; sy += (tsy - sy) * (1 - Math.exp(-dt * 4));
      gl.uniform2f(U.uM, mx, my); gl.uniform1f(U.uT, (now - t0) / 1000 * SPD); gl.uniform1f(U.uScroll, sy); gl.uniform1f(U.uPulse, pulse); gl.uniform2f(U.uPP, ppx, ppy);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-contours]').forEach(init);
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-contours] canvas')) setTimeout(poll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
