/* Wubble "Ember" background: animated orange atmosphere — domain-warped flowing haze (burnt orange → amber → near-black),
   a warm light source that follows the cursor, slow light rays, scroll darkens + shifts it, fine film grain.
   One fullscreen WebGL pass, fixed behind the page. Webflow: empty div [data-wb-ember].
   Attributes: data-speed="1" · data-mouse="1" · data-scale="0.6" (render resolution) · data-intensity="1"
   · data-colors="#140502,#7a2408,#d4561a,#ff9a4a" (dark → light) */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const FS = `precision highp float; varying vec2 vUv; uniform vec2 uRes, uM; uniform float uT, uScroll, uInt, uMouse; uniform vec3 c0, c1, c2, c3;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 R = mat2(0.8, -0.6, 0.6, 0.8); for (int i = 0; i < 5; i++) { s += a * n(p); p = R * p * 2.03 + 0.7; a *= 0.5; } return s; }
void main(){
  vec2 asp = vec2(uRes.x / uRes.y, 1.0), p = (vUv - 0.5) * asp, m = (uM - 0.5) * asp;
  float t = uT * 0.06;
  vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, t)), fbm(p * 1.4 + vec2(5.2, -t * 0.8)));
  vec2 r = vec2(fbm(p * 1.8 + q * 1.6 + vec2(1.7, 9.2) + t * 0.6), fbm(p * 1.8 + q * 1.6 + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p * 1.2 + r * 1.8 + vec2(0.0, -uScroll * 0.35));
  /* warm light: top-right sun + cursor glow */
  vec2 L = mix(vec2(0.55 * asp.x, 0.42), m, 0.55 * uMouse);
  float d = length(p - L), glow = exp(-d * d * 2.2), core = exp(-d * d * 14.0);
  float ang = atan(p.y - L.y, p.x - L.x), rays = pow(0.5 + 0.5 * sin(ang * 9.0 + fbm(vec2(ang * 3.0, t * 2.0)) * 4.0), 6.0) * smoothstep(1.6, 0.1, d) * 0.22;
  float v = clamp(f * 1.15 + glow * 0.75 + core * 0.35 + rays - 0.18, 0.0, 1.0);
  v *= uInt * (1.0 - clamp(uScroll * 0.18, 0.0, 0.55));                          /* deeper = darker */
  vec3 col = v < 0.35 ? mix(c0, c1, v / 0.35) : v < 0.7 ? mix(c1, c2, (v - 0.35) / 0.35) : mix(c2, c3, (v - 0.7) / 0.3);
  col *= smoothstep(1.35, 0.2, length(p * vec2(0.75, 1.0)));                     /* vignette */
  col += (h(gl_FragCoord.xy + fract(uT) * 91.0) - 0.5) * 0.045;                  /* grain */
  gl_FragColor = vec4(col, 1.0); }`;
  const hex = (s) => { s = s.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255); };
  const init = (host) => {
    if (host.__em) return; host.__em = 1;
    const at = (k, d) => { const v = host.getAttribute('data-' + k); return v == null ? d : v; };
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;display:block;';
    host.appendChild(cv); const gl = cv.getContext('webgl', { alpha: false }); if (!gl) return;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[ember]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uM', 'uT', 'uScroll', 'uInt', 'uMouse', 'c0', 'c1', 'c2', 'c3'].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    const C = at('colors', '#140502,#7a2408,#d4561a,#ff9a4a').split(',');
    ['c0', 'c1', 'c2', 'c3'].forEach((k, i) => gl.uniform3fv(U[k], hex(C[i] || C[C.length - 1])));
    gl.uniform1f(U.uInt, +at('intensity', 1)); gl.uniform1f(U.uMouse, +at('mouse', 1));
    const SC = Math.max(0.3, Math.min(1, +at('scale', 0.6))), SPD = +at('speed', 1);
    const size = () => { const d = Math.min(2, devicePixelRatio || 1) * SC; cv.width = Math.max(2, innerWidth * d | 0); cv.height = Math.max(2, innerHeight * d | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height); };
    size(); addEventListener('resize', size);
    let mx = 0.7, my = 0.65, tx = 0.7, ty = 0.65, sy = 0;
    addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
    const t0 = performance.now(); let last = t0;
    const tick = (now) => { RAF(tick); if (!host.isConnected || document.hidden) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
      mx += (tx - mx) * (1 - Math.exp(-dt * 1.6)); my += (ty - my) * (1 - Math.exp(-dt * 1.6));
      const ts = (window.__wbLenis ? window.__wbLenis.scroll : scrollY) / innerHeight; sy += (ts - sy) * (1 - Math.exp(-dt * 3));
      gl.uniform2f(U.uM, mx, my); gl.uniform1f(U.uT, (now - t0) / 1000 * SPD); gl.uniform1f(U.uScroll, sy); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-ember]').forEach(init);
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-ember] canvas')) setTimeout(poll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
