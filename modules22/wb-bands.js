/* Wubble background bands (look of monopo.london): soft, grainy colour bands on black that flow slowly behind every page.
   One fixed raw-WebGL canvas behind the content (z-index -1), drawn at low resolution (the bands are blurry anyway).
   The colours change per section: the section under the middle of the screen picks a palette, the colours glide to it.
   It replaces the grey .bg-layer effects (grainient, aurora, light rays) and shows wherever a page is plain dark; head.css hides those layers and makes the dark wrappers transparent (.wb-bands-on).
   Phones: not on the homepage (its WebGL scenes cover it and phones drop extra WebGL contexts). Reduced motion: still. */
(() => {
  if (window.__wbBands) return; window.__wbBands = 1;
  const MOB = matchMedia('(pointer: coarse)').matches || innerWidth < 820, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (MOB && document.querySelector('.home_page-wrapper')) return;
  const HOSTS = '.page-wrapper.background-color-darkest, .page-wrapper.background-color-black, .home_page-wrapper, .section_plans, .section_faq';
  const PALS = [['#161618', '#26272a', '#3d3e42'], ['#141414', '#232325', '#38383b'], ['#171615', '#282624', '#3f3c39'], ['#131416', '#222428', '#393c41']] /* black / very dark grey, a slightly different tone per section */
    .map((p) => p.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)));
  const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block';
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;
  const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  const FS = `precision mediump float; uniform vec2 R; uniform float T, S, MV; uniform vec2 M; uniform vec3 C1, C2, C3;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ vec2 uv = gl_FragCoord.xy / R, p = (uv - 0.5) * vec2(R.x / R.y, 1.0); float t = T * 0.06;
  vec2 q = p + 0.35 * vec2(sin(p.y * 1.6 + t * 2.1 + S), cos(p.x * 1.2 - t * 1.7));
  q += 0.2 * vec2(sin(q.y * 2.3 - t * 1.3), cos(q.x * 2.1 + t));
  vec2 d = p - M; float mk = exp(-dot(d, d) * 5.0); q += (d * 0.6 + vec2(-d.y, d.x) * (0.5 + MV)) * mk * (0.35 + MV); /* cursor: pushes and swirls the bands, more when it moves fast */
  float f = q.y * 1.2 + 0.55 * sin(q.x * 1.4 + t * 1.5 + S * 0.7) + 0.25 * sin(q.x * 3.1 - t), g = length(q - vec2(0.6 * sin(t * 0.7), 0.3 * cos(t * 0.5)));
  float b = fract((f * 0.9 + g * 0.8 + S * 0.15) * 0.55);
  vec3 c = mix(C1, C3, smoothstep(0.15, 0.42, b)); c = mix(c, C2, smoothstep(0.42, 0.7, b));
  float env = smoothstep(0.02, 0.32, b) * (1.0 - smoothstep(0.62, 0.95, b)); /* black gaps between the bands */
  vec3 col = c * env * (0.9 + mk * 0.25) + (h(gl_FragCoord.xy + fract(T) * 97.0) - 0.5) * 0.05; /* film grain */
  gl_FragColor = vec4(col, 1.0); }`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return console.warn('[bands] shader', gl.getProgramInfoLog(pr));
  gl.useProgram(pr); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['R', 'T', 'S', 'M', 'MV', 'C1', 'C2', 'C3'].forEach((k) => (U[k] = gl.getUniformLocation(pr, k)));
  const MS = { x: 9, y: 9, tx: 9, ty: 9, v: 0 }; /* cursor in shader space (9 = far away until the mouse moves); phones have none */
  addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; MS.tx = (e.clientX / innerWidth - 0.5) * innerWidth / innerHeight; MS.ty = 0.5 - e.clientY / innerHeight; if (MS.x === 9) { MS.x = MS.tx; MS.y = MS.ty; } }, { passive: true });
  const SCALE = MOB ? 0.5 : 0.6; /* low res on purpose: soft bands, small GPU cost; capped like every effect on phones */
  const size = () => { cv.width = Math.max(1, Math.round(innerWidth * SCALE)); cv.height = Math.max(1, Math.round(innerHeight * SCALE)); gl.viewport(0, 0, cv.width, cv.height); };
  const cur = PALS[0].map((c) => c.slice()); let tgt = PALS[0], show = false, chk = 0, last = performance.now();
  /* every 300 ms: is a plain dark area on screen (else skip drawing), and which section sits in the middle (its palette) */
  const check = () => { const V = innerHeight; show = [...document.querySelectorAll(HOSTS)].some((e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < V && r.height > 0; });
    const secs = [...document.querySelectorAll('section, footer')].filter((e) => e.offsetHeight > V * 0.3); let i = 0;
    secs.forEach((e, k) => { if (e.getBoundingClientRect().top <= V * 0.5) i = k; }); tgt = isAbout() ? EMBER : PALS[i % PALS.length]; };
  const EMBER = ['#2a0d07', '#5e130b', '#d9541e'].map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)); /* About test: one colour, dark red edges, burnt orange core */
  const frame = (now) => { requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (now - chk > 300) { chk = now; check(); }
    if (!show) return; if (!cv.isConnected) mount();
    const k = 1 - Math.exp(-dt * 1.4); cur.forEach((c, j) => c.forEach((v, n) => (c[n] = v + (tgt[j][n] - v) * k)));
    { const km = 1 - Math.exp(-dt * 4), px = MS.x, py = MS.y; MS.x += (MS.tx - MS.x) * km; MS.y += (MS.ty - MS.y) * km;
      MS.v += (Math.min(1.2, Math.hypot(MS.x - px, MS.y - py) / Math.max(dt, 1e-3) * 0.4) - MS.v) * (1 - Math.exp(-dt * 3)); }
    gl.uniform2f(U.M, MS.x, MS.y); gl.uniform1f(U.MV, still ? 0 : MS.v);
    gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, still ? 20 : now / 1000); gl.uniform1f(U.S, scrollY / innerHeight * 0.35);
    gl.uniform3fv(U.C1, cur[0]); gl.uniform3fv(U.C2, cur[1]); gl.uniform3fv(U.C3, cur[2]); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  const isAbout = () => /^\/(nl\/)?about\/?$/.test(location.pathname);
  const mount = () => { document.documentElement.classList.add('wb-bands-on'); document.body.prepend(cv); };
  const go = () => { mount(); size(); addEventListener('resize', size); requestAnimationFrame(frame); };
  document.body ? go() : addEventListener('DOMContentLoaded', go);
})();
