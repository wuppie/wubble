/* Wubble hero "blur word": a cool slate gradient backdrop with a giant pale wordmark that smears into a rotational blur
   around the cursor (WebGL), fading out as the hero scrolls away. Fixed behind the page, under the 3D astronaut.
   Webflow: [data-wb-blurword] on the hero section; its text comes from a child [data-wb-blurword-text] (keep it in the
   Designer for SEO, it is hidden visually). Attributes on the section:
   data-bg="0" draws only the word (transparent backdrop) · data-under="[data-wb-orbit]" inserts it just before that element, so it sits behind it.
   data-follow-opacity: the word only shows while the section is visible (its own and its parents' opacity).
   data-c1="#879caa" data-c2="#1a2025" (gradient) data-ink="#a4b5c1" (word) data-blur="0.7" data-x="0.063" data-y="0.1" data-w="0.874" */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const hex = (s) => { s = String(s).trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255); };
  const FS = `precision highp float; varying vec2 vUv; uniform sampler2D uW; uniform vec2 uRes, uM; uniform vec4 uBox; uniform float uT, uBlur, uK; uniform vec3 uC1, uC2, uInk;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float word(vec2 uv){ vec2 q = (uv - uBox.xy) / uBox.zw; if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return 0.0; return texture2D(uW, vec2(q.x, 1.0 - q.y)).a; }
void main(){
  float asp = uRes.x / uRes.y; vec2 uv = vUv;
  vec2 g = (uv - 0.5) * vec2(asp, 1.0); float a = -0.95; vec2 r = vec2(g.x * cos(a) - g.y * sin(a), g.x * sin(a) + g.y * cos(a));
  float pos = clamp(r.x / 1.22 + 0.5 + sin(uT * 0.05) * 0.06, 0.0, 1.0); vec3 bg = mix(uC1, uC2, smoothstep(0.0, 1.0, pos));
  bg += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  vec2 m = uM; float d = distance(uv * vec2(asp, 1.0), m * vec2(asp, 1.0)), fall = max(0.0, 1.0 - d * 4.0 * (1.0 - 0.77));
  float amt = (uBlur + 0.2) * fall * 0.04 * uK, w0 = word(uv), acc = w0 * 0.35, tw = 0.35;
  if (amt > 0.0001) { vec2 to = (uv - m) * vec2(asp, 1.0); float rad = length(to), ba = atan(to.y, to.x), j = ign(gl_FragCoord.xy) - 0.5;
    for (int i = 0; i < 10; i++) { float wt = pow(0.68, float(i)), st = (1.0 + (float(i) + 0.5 + j) * 0.9) * amt;
      vec2 p1 = rad * vec2(cos(ba + st), sin(ba + st)), p2 = rad * vec2(cos(ba - st), sin(ba - st));
      acc += (word(vec2(p1.x / asp, p1.y) + m) + word(vec2(p2.x / asp, p2.y) + m)) * wt; tw += 2.0 * wt; }
    w0 = acc / tw; }
  gl_FragColor = vec4(mix(bg, uInk, w0), 1.0); }`;
  const init = (sec) => {
    if (sec.__bw) return; sec.__bw = 1; const at = (k, d) => sec.getAttribute('data-' + k) ?? d;
    const src = sec.querySelector('[data-wb-blurword-text]'); const text = (src ? src.textContent : 'wubble').trim();
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:block;';
    const first = document.querySelector(at('under', '') || '[data-wb-about-astro-canvas]'); first ? first.parentNode.insertBefore(cv, first) : document.body.appendChild(cv);
    const clear = at('bg', '1') === '0'; // data-bg="0": word only, transparent backdrop (another background shows through)
    const gl = cv.getContext('webgl', { alpha: clear, antialias: false }); if (!gl) return;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[blurword]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, clear ? FS.replace('vec4(mix(bg, uInk, w0), 1.0)', 'vec4(uInk * w0, w0)') : FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uW', 'uRes', 'uM', 'uBox', 'uT', 'uBlur', 'uK', 'uC1', 'uC2', 'uInk'].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    gl.uniform3fv(U.uC1, hex(at('c1', '#879caa'))); gl.uniform3fv(U.uC2, hex(at('c2', '#1a2025'))); gl.uniform3fv(U.uInk, hex(at('ink', '#a4b5c1'))); gl.uniform1f(U.uBlur, +at('blur', 0.7));
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.uniform1i(U.uW, 0);
    const wc = document.createElement('canvas'), wg = wc.getContext('2d');
    const draw = () => { const W = innerWidth, H = innerHeight, d = Math.min(1.5, devicePixelRatio || 1); cv.width = W * d | 0; cv.height = H * d | 0; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height);
      const s2 = sec.querySelector('[data-wb-blurword-text]') || src, fam = s2 ? getComputedStyle(s2).fontFamily || 'Switzer, sans-serif' : 'Switzer, sans-serif', wgt = s2 ? getComputedStyle(s2).fontWeight || '700' : '700', bw = W * +at('w', 0.874) * d;
      wg.font = wgt + ' 400px ' + fam; const mw = wg.measureText(text), ink = mw.actualBoundingBoxAscent + mw.actualBoundingBoxDescent, fs = 400 * bw / Math.max(1, mw.width), th = Math.ceil(ink * fs / 400 + fs * 0.06);
      wc.width = Math.ceil(bw); wc.height = Math.max(2, th); wg.font = wgt + ' ' + fs + 'px ' + fam; wg.fillStyle = '#fff'; wg.textBaseline = 'alphabetic'; wg.clearRect(0, 0, wc.width, wc.height);
      wg.fillText(text, -wg.measureText(text).actualBoundingBoxLeft, wc.height - mw.actualBoundingBoxDescent * fs / 400 - fs * 0.03);
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wc);
      const bwN = +at('w', 0.874), bhN = wc.height / (H * d); gl.uniform4f(U.uBox, +at('x', 0.063), 1 - +at('y', 0.1) - bhN, bwN, bhN); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw); draw(); addEventListener('resize', draw);
    setTimeout(draw, 600); setTimeout(draw, 1800); /* the page can re-render or swap fonts after the first draw (blank word) */
    let mx = 0.6, my = 0.65, tx = 0.6, ty = 0.65, k = 0, tk = 0; addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; tk = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => { tk = 0.35; });
    const t0 = performance.now(); let last = t0;
    const tick = (now) => { RAF(tick); if (!sec.isConnected) { cv.remove(); return; } const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const r = sec.getBoundingClientRect(); let vis = Math.max(0, Math.min(1, r.bottom / (innerHeight * 0.6)));
      /* data-follow-opacity: show only while the section itself is shown (e.g. the homepage About panel that fades in and out) */
      if (sec.hasAttribute('data-follow-opacity')) { let o = 1; for (let n = sec; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); o *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') { o = 0; break; } } if (typeof window.__wbAboutOp === 'number' && sec.hasAttribute('data-about')) o *= window.__wbAboutOp; /* homepage: only while the About panel is the one on screen */ vis = Math.min(vis, o); }
      cv.style.opacity = String(vis); if (vis <= 0) return;
      const e = 1 - Math.exp(-dt * 4.5); mx += (tx - mx) * e; my += (ty - my) * e; k += (tk - k) * (1 - Math.exp(-dt * 2));
      gl.uniform2f(U.uM, mx, my); gl.uniform1f(U.uK, 0.4 + k * 0.6); gl.uniform1f(U.uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(tick);
  };
  let n = 0; const poll = () => { document.querySelectorAll('[data-wb-blurword]').forEach(init); if (++n < 40 && !document.querySelector('[data-wb-blurword]')) setTimeout(poll, 120); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
