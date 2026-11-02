/* Wubble circuit background: an original procedural board — orthogonal traces with 45° chamfered bends, solder vias,
   bus lines and chip outlines — with soft signal pulses running along the traces. White on black, fades out as you scroll.
   Webflow: empty div [data-wb-circuit]. Attributes: data-opacity="0.4" data-density="0.65" data-width="0.28" data-pulse="0.6"
   data-speed="1" data-fade="1" (viewport heights until gone; 0 = never fade) */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const FS = `precision highp float; varying vec2 vUv; uniform vec2 uRes; uniform float uT, uOp, uDen, uW, uPu;
float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float seg(vec2 p, vec2 a, vec2 b, out float t){ vec2 pa = p - a, ba = b - a; t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0); return length(pa - ba * t); }
float eH(vec2 c){ return step(0.42, h21(c * 1.91 + vec2(7.3, 1.1))); }
float eV(vec2 c){ return step(0.42, h21(c * 2.57 + vec2(3.9, 15.2))); }
void main(){
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0); float G = mix(12.0, 36.0, uDen); vec2 g = p * G, id = floor(g), lp0 = fract(g) - 0.5;
  float hw = mix(0.01, 0.05, uW), dT = 1e4, dV = 1e4, pulse = 0.0, t = uT * 0.06;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 o = vec2(float(i), float(j)), c = id + o, lp = lp0 - o;
    float E = eH(c), W = eH(c - vec2(1.0, 0.0)), N = eV(c), S = eV(c - vec2(0.0, 1.0)), n = E + W + N + S, sd = h21(c * 4.1 + 2.7), tt;
    if (n == 2.0 && (E + W) == 1.0) { vec2 a = N > 0.5 ? vec2(0.0, 0.5) : vec2(0.0, -0.5), b = E > 0.5 ? vec2(0.5, 0.0) : vec2(-0.5, 0.0), k = vec2(b.x, a.y) * 0.36;
      dT = min(dT, min(seg(lp, a, k, tt), seg(lp, k, b, tt))); }
    else { vec2 D[4]; D[0] = vec2(0.5, 0.0); D[1] = vec2(-0.5, 0.0); D[2] = vec2(0.0, 0.5); D[3] = vec2(0.0, -0.5); float H[4]; H[0] = E; H[1] = W; H[2] = N; H[3] = S;
      for (int k = 0; k < 4; k++) { if (H[k] < 0.5) continue; float d = seg(lp, D[k], vec2(0.0), tt); dT = min(dT, d);
        float ph = fract(sd * 3.1 + float(k) * 0.37); if (ph > 0.45) { float wv = fract(tt * 1.6 - (sd * 6.28 + t * mix(0.8, 3.5, uPu))); pulse += exp(-30.0 * wv * wv) * smoothstep(hw * 2.5, 0.0, d); } } }
    if (n == 1.0 || n >= 3.0 || (n == 0.0 && sd > 0.8)) dV = min(dV, length(lp)); }
  { vec2 bp = p * G * 0.5, bc = floor(bp), bl = fract(bp) - 0.5; if (h21(bc + 31.0) > 0.7) dT = min(dT, min(min(abs(bl.y - 0.17), abs(bl.y)), abs(bl.y + 0.17)) * 0.5); }
  { vec2 cp = p * G * 0.25, cc = floor(cp), cl = fract(cp) - 0.5; if (h21(cc + 71.3) > 0.84) { vec2 q = abs(cl) - 0.22; dT = min(dT, abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)) * 0.25); } }
  float aa = max(G / min(uRes.x, uRes.y) * 1.5, 0.002), tr = 1.0 - smoothstep(hw - aa, hw + aa, dT), vr = hw * 2.8, via = (1.0 - smoothstep(vr - aa, vr + aa, dV)) * smoothstep(hw * 1.1 - aa, hw * 1.1 + aa, dV);
  float pc = clamp(pulse, 0.0, 1.0), glow = exp(-dT / max(hw * 10.0, 1e-3)) * pc;
  float a = clamp(max(tr, via) * 0.6 + pc + glow * 0.6, 0.0, 1.0) * uOp; gl_FragColor = vec4(vec3(a), 1.0); }`;
  const init = (host) => { if (host.__c) return; host.__c = 1; const at = (k, d) => +(host.getAttribute('data-' + k) ?? d);
    const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(cv);
    const gl = cv.getContext('webgl', { alpha: false }); if (!gl) return;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[circuit]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uT', 'uOp', 'uDen', 'uW', 'uPu'].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    gl.uniform1f(U.uDen, at('density', 0.65)); gl.uniform1f(U.uW, at('width', 0.28)); gl.uniform1f(U.uPu, at('pulse', 0.6));
    const size = () => { const d = Math.min(1.5, devicePixelRatio || 1); cv.width = Math.max(2, host.clientWidth * d | 0); cv.height = Math.max(2, host.clientHeight * d | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height); };
    size(); new ResizeObserver(size).observe(host);
    const OP = at('opacity', 0.4), FD = at('fade', 1), SP = at('speed', 1), t0 = performance.now();
    const tick = (now) => { RAF(tick); if (!host.isConnected || document.hidden) return; const k = FD > 0 ? Math.max(0, 1 - scrollY / (innerHeight * FD)) : 1; host.style.opacity = String(k); if (k <= 0) return;
      gl.uniform1f(U.uOp, OP); gl.uniform1f(U.uT, (now - t0) / 1000 * SP); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(tick); };
  const run = () => document.querySelectorAll('[data-wb-circuit]').forEach(init);
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-circuit] canvas')) setTimeout(poll, 150); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
