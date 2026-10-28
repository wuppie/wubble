/* Wubble "Teal Abyss" background — one fixed WebGL canvas behind every page.
   Layered domain-warped fog, cyan light bloom, dark overhangs, drifting specks, grain + edge RGB split, pointer parallax, click pulse.
   Single fullscreen pass (no three.js), rendered at reduced resolution (fog is soft) so it costs almost nothing next to the 3D scenes.
   Webflow control (attributes on <html> or <body>, or window.WB_ABYSS = {...}):
     data-wb-abyss="off"              disable on this page
     data-wb-abyss-scale="0.6"        render resolution (0.3–1)
     data-wb-abyss-opacity="0.55"     overall brightness (1 = original)
     data-wb-abyss-x / -y             light source position (-0.5..0.5, default -0.24 / 0.105)
     data-wb-abyss-color="0"          0 = black & white, 1 = original teal (anything between mixes)
     data-wb-abyss-mouse="1"          mouse parallax amount        data-wb-abyss-speed="2.2"   drift speed
   Content must have a transparent background to show it (the canvas sits at z-index:-1). */
(() => {
  if (window.__wbAbyss) return; window.__wbAbyss = 1;
  const attr = (k, d) => { const el = document.body && document.body.hasAttribute('data-wb-abyss-' + k) ? document.body : document.documentElement; const v = el.getAttribute('data-wb-abyss-' + k); const o = (window.WB_ABYSS || {})[k]; return o != null ? o : v != null ? +v : d; };
  const off = () => /off|false/.test(String(document.documentElement.getAttribute('data-wb-abyss') || (document.body && document.body.getAttribute('data-wb-abyss')) || ''));
  const FS = `precision highp float; varying vec2 vUv; uniform float uTime, uPulse, uOp, uSat, uMove, uSpeed; uniform vec2 uRes, uPointer, uSrc;
float hash(vec2 p){ p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 34.5); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.55; mat2 m = mat2(1.62, -1.18, 1.18, 1.62); for(int i=0;i<5;i++){ v += a * noise(p); p = m*p + vec2(0.13, -0.08); a *= 0.49; } return v; }
vec3 scene(vec2 uv){
  vec2 p = uv - 0.5; p.x *= uRes.x / uRes.y; p -= uPointer * 0.09 * uMove;
  float t = uTime * 0.035 * uSpeed; vec2 drift = vec2(t * 0.65, -t * 0.24) + uPointer * 0.06 * uMove;
  float warpA = fbm(p*2.0 + drift), warpB = fbm(p*3.2 - drift + vec2(3.7, 1.9));
  vec2 warped = p + (vec2(warpA, warpB)-0.5)*0.48;
  float cloudLarge = fbm(warped*2.45 + drift), cloudFine = fbm(warped*5.4 - drift*1.7), cloudDetail = fbm(warped*10.0 + vec2(t*1.5,-t));
  vec2 q = p - (uSrc + uPointer*0.16*uMove + vec2(sin(uTime*0.21*uSpeed), cos(uTime*0.17*uSpeed))*0.035); float dist = length(vec2(q.x*0.83, q.y*1.03));
  float bloom = exp(-dist*2.75), hotCore = exp(-dist*dist*13.5), innerCore = exp(-dist*dist*31.0);
  float beam = exp(-abs(q.x + q.y*0.20 + (cloudLarge-.5)*0.25)*4.2), lowerBeam = exp(-abs(q.x*0.72 - q.y*0.48 + (cloudFine-.5)*0.17)*5.0);
  float mist = smoothstep(0.24, 0.76, cloudLarge*0.62 + cloudFine*0.38), fil = smoothstep(0.43, 0.77, cloudFine*0.58 + cloudDetail*0.42), fineFog = smoothstep(0.35, 0.78, cloudDetail);
  vec3 col = vec3(0.003, 0.008, 0.009);
  col += vec3(0.012, 0.065, 0.071) * mist; col += vec3(0.018, 0.13, 0.145) * fil * 0.72; col += vec3(0.025, 0.20, 0.22) * fineFog * 0.20;
  col += vec3(0.08, 0.40, 0.44) * bloom * (0.25 + mist*0.55); col += vec3(0.32, 0.78, 0.81) * hotCore * (0.40 + cloudFine*0.24); col += vec3(0.62, 0.91, 0.92) * innerCore * 0.72;
  col += vec3(0.055, 0.30, 0.34) * beam * mist * 0.26; col += vec3(0.035, 0.21, 0.24) * lowerBeam * fil * 0.15;
  vec2 up = vec2(p.x*0.78 + 0.12, p.y*1.04 - 0.20) + uPointer * 0.05 * uMove; float en = fbm(up*3.6 + vec2(t*0.4,t*0.25) - uPointer*0.08*uMove);
  float um = smoothstep(-0.06, 0.10, up.x*0.58 + up.y*0.90 + (en-0.5)*0.40 + sin(up.x*5.0 + en*3.0)*0.045); um *= smoothstep(-0.58, -0.25, p.x + (en-.5)*.1); col *= 1.0 - um*0.96;
  vec2 lo = vec2(p.x + 0.18, p.y + 0.34) - uPointer * 0.06 * uMove; float ln = fbm(lo*3.0 - drift);
  float lm = 1.0 - smoothstep(-0.11, 0.12, lo.y + lo.x*0.40 + (ln-0.5)*0.30); lm *= 1.0 - smoothstep(0.32, 0.72, p.x); col *= 1.0 - lm*0.90;
  float vig = smoothstep(1.12, 0.24, length(p*vec2(0.78,0.92))); col *= 0.30 + vig*0.80; col += vec3(0.005,0.025,0.029) * (1.0-vig);
  float ring = exp(-abs(dist-(0.10+uPulse*0.38))*35.0); col += vec3(0.08,0.56,0.62)*ring*uPulse*0.25;
  /* suspended specks (teal + a few red), drifting with parallax */
  for (int l = 0; l < 2; l++) { float fl = float(l); vec2 sp = (p + uPointer * (0.06 + fl * 0.07) * uMove) * (34.0 + fl * 22.0) + vec2(uTime * (0.05 + fl * 0.03), -uTime * 0.02) * uSpeed;
    vec2 cell = floor(sp), f = fract(sp) - 0.5; float h = hash(cell + fl * 17.0); if (h > 0.93) { vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5; float d = length(f - o * 0.6);
      float tw = 0.45 + 0.55 * sin(uTime * 0.55 + h * 40.0); vec3 sc = hash(cell + 11.0) < 0.24 ? vec3(0.95, 0.12, 0.22) : vec3(0.25, 0.85, 0.9); col += sc * smoothstep(0.09, 0.0, d) * tw * 0.35 * (0.4 + mist); } }
  return col; }
void main(){ vec2 uv = vUv, c = uv - 0.5; float edge = dot(c, c), ca = (0.00065 + edge * 0.0038) * (1.0 + uPulse * 0.7); vec2 dir = normalize(c + 0.0001);
  /* edge RGB split approximated by shifting the light-source lookup per channel (one scene eval, cheap) */
  vec3 col = scene(uv); col.r = mix(col.r, scene(uv + dir * ca * 6.0).r, smoothstep(0.05, 0.35, edge));
  col *= 0.62 + 0.48 * (1.0 - smoothstep(0.18, 0.82, length(c * vec2(0.95, 1.05))));
  col += (fract(sin(dot(uv * uRes + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722)) * 1.05; lum = lum / (1.0 + lum * 0.9); /* soft roll-off: the core glows, never clips to white */ col = mix(vec3(lum), col, uSat);
  gl_FragColor = vec4(max(col, vec3(0.0)) * uOp, 1.0); }`;
  const VS = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const boot = () => {
    if (off()) return;
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-wb-persist', ''); cv.setAttribute('data-wb-abyss-canvas', '');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block;';
    /* host: by default behind the whole page; WB_ABYSS.host = selector puts it inside a backdrop layer instead (homepage: [data-space-host], under the stars) */
    const hostSel = (window.WB_ABYSS || {}).host || document.documentElement.getAttribute('data-wb-abyss-host');
    const mountIn = (h) => { cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;'; h.prepend(cv); };
    if (hostSel) { const tryHost = (n) => { const h = document.querySelector(hostSel); if (h) return mountIn(h); if (n < 300) setTimeout(() => tryHost(n + 1), 50); }; tryHost(0); }
    else { document.body.prepend(cv); document.documentElement.style.background = '#050505'; document.body.style.setProperty('background', 'transparent', 'important'); /* body is painted above z-index:-1 layers, so it must not be opaque */ }
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' }); if (!gl) { cv.remove(); return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[abyss]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uTime', 'uPulse', 'uOp', 'uRes', 'uPointer', 'uSrc', 'uSat', 'uMove', 'uSpeed'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    const size = () => { const s = Math.max(0.3, Math.min(1, attr('scale', 0.55))), w = Math.max(2, Math.round(innerWidth * s)), h = Math.max(2, Math.round(innerHeight * s)); /* viewport-sized either way */ if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } };
    size(); addEventListener('resize', size);
    const ptr = { x: 0, y: 0, sx: 0, sy: 0 }; let pulse = 0, pt = 0;
    addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });
    addEventListener('pointerdown', () => { pt = 1; }, { passive: true }); addEventListener('pointerup', () => { pt = 0; }, { passive: true });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), RAF = window.__wbRawRAF || requestAnimationFrame.bind(window);
    let last = 0;
    const frame = (now) => { RAF(frame); if (document.hidden || now - last < 31) return; last = now; /* ~30fps is plenty for slow fog */
      ptr.sx += (ptr.x - ptr.sx) * 0.08; ptr.sy += (ptr.y - ptr.sy) * 0.08; pulse += (pt - pulse) * 0.1;
      gl.uniform1f(U.uTime, reduced ? 0 : (now - t0) / 1000); gl.uniform1f(U.uPulse, pulse); gl.uniform1f(U.uOp, attr('opacity', 0.55)); gl.uniform1f(U.uSat, attr('color', 0)); gl.uniform1f(U.uMove, attr('mouse', 1)); gl.uniform1f(U.uSpeed, attr('speed', 2.2));
      gl.uniform2f(U.uRes, innerWidth, innerHeight); gl.uniform2f(U.uPointer, ptr.sx, ptr.sy); gl.uniform2f(U.uSrc, attr('x', -0.24), attr('y', 0.105));
      gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(frame);
  };
  document.body ? boot() : addEventListener('DOMContentLoaded', boot);
})();
