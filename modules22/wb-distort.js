/* Wubble: WebGL hover distortion for project media (same liquid ripple + RGB split as the homepage ribbon cards).
   Webflow keeps full control: media stay normal <img>/<video> elements styled in the Designer; this only adds one shared
   WebGL canvas that sits over the hovered element while the pointer is on it.
   Attributes (on the media wrapper):
     data-wb-distort                     enable (wrapper = what you hover; its radius/size are read from Webflow styles)
     data-wb-distort-strength="1"        overall amount (0–2)      data-wb-distort-ripple="1"   ripple waves (0–2)
     data-wb-distort-rgb="1"             colour split (0–3)        data-wb-distort-speed="1"    wave speed
   The media inside is found as img/video; without one (placeholders) the wrapper's first child's background is used. */
(() => {
  if (window.__wbDistort) return; window.__wbDistort = 1;
  const VS = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float; uniform sampler2D uTex; uniform vec2 uSize; uniform float uRadius, uHover, uTime, uStr, uRip, uRgb, uSpd; uniform vec2 uMouse, uMVel; uniform vec4 uInner; uniform vec2 uTexAsp; varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec2 cover(vec2 uv){ vec2 s = uTexAsp; return (uv - 0.5) * s + 0.5; }
void main(){
  vec2 px = vUv * uSize; px.y = uSize.y - px.y; float d = sdRound(px - uSize * 0.5, uSize * 0.5, uRadius), aa = fwidth(d) * 1.2, a = 1.0 - smoothstep(-aa, aa, d);
  vec2 asp = vec2(uSize.x / uSize.y, 1.0), uv0 = vec2(vUv.x, 1.0 - vUv.y), md = (uv0 - uMouse) * asp; float dist = length(md); vec2 dir = md / max(dist, 1e-4) / asp;
  float fall = smoothstep(0.5, 0.0, dist) * uHover * uStr;
  vec2 uv = (uv0 - 0.5) * (1.0 - 0.05 * uHover * uStr) + 0.5;
  uv -= dir * sin(dist * 30.0 - uTime * 6.0 * uSpd) * 0.010 * fall * uRip; uv -= dir * 0.035 * fall * (1.0 - dist * 2.0); uv -= uMVel * fall * 0.6;
  vec2 sh = (dir * 0.012 * fall + uMVel * fall * 0.4) * uRgb;
  vec2 ti = (uv * uSize - uInner.xy) / uInner.zw; ti = cover(ti); vec2 tr = cover(((uv + sh) * uSize - uInner.xy) / uInner.zw), tb = cover(((uv - sh) * uSize - uInner.xy) / uInner.zw);
  vec3 col = vec3(texture2D(uTex, tr).r, texture2D(uTex, ti).g, texture2D(uTex, tb).b) + fall * 0.06;
  gl_FragColor = vec4(col * a, a); }`;
  let gl, cv, U, tex, cur = null, hov = 0, mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, vx = 0, vy = 0, srcCv = null, lastT = 0;
  const init = () => { if (gl) return true;
    cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-wb-persist', ''); cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:50;opacity:0;';
    document.body.appendChild(cv); gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true }); if (!gl) return false; gl.getExtension('OES_standard_derivatives');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[distort]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    U = {}; ['uTex', 'uSize', 'uRadius', 'uHover', 'uTime', 'uStr', 'uRip', 'uRgb', 'uSpd', 'uMouse', 'uMVel', 'uInner', 'uTexAsp'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); return true; };
  /* the media source: <img>/<video>, or a placeholder painted from the inner element's background + text */
  const media = (w) => w.querySelector('video, img') || null;
  const inner = (w) => media(w) || w.firstElementChild || w;
  const upload = (w) => { const m = media(w); gl.bindTexture(gl.TEXTURE_2D, tex);
    if (m && (m.tagName === 'VIDEO' ? m.readyState >= 2 : m.complete && m.naturalWidth)) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, m); return m.tagName === 'VIDEO' ? [m.videoWidth, m.videoHeight] : [m.naturalWidth, m.naturalHeight]; } catch (e) { /* cross-origin without CORS: leave the DOM media untouched */ return null; } }
    const el = inner(w), r = el.getBoundingClientRect(); srcCv = srcCv || document.createElement('canvas'); const s = Math.min(2, devicePixelRatio || 1); srcCv.width = Math.max(2, r.width * s | 0); srcCv.height = Math.max(2, r.height * s | 0);
    const g = srcCv.getContext('2d'), cs = getComputedStyle(el); g.fillStyle = cs.backgroundColor || '#222'; g.fillRect(0, 0, srcCv.width, srcCv.height);
    const t = el.textContent.trim(); if (t) { const tcs = getComputedStyle(el.querySelector('*') || el); g.fillStyle = tcs.color; g.globalAlpha = +tcs.opacity || 1; g.font = tcs.fontWeight + ' ' + parseFloat(tcs.fontSize) * s + 'px ' + tcs.fontFamily; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, srcCv.width / 2, srcCv.height / 2); g.globalAlpha = 1; }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCv); return [srcCv.width, srcCv.height]; };
  let texWH = null;
  const num = (w, k, d) => { const v = parseFloat(w.getAttribute('data-wb-distort-' + k)); return isFinite(v) ? v : d; };
  const frame = (now) => { (window.__wbRawRAF || requestAnimationFrame)(frame); if (!cur && hov <= 0.001) { if (cv && cv.style.opacity !== '0') cv.style.opacity = '0'; return; }
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now; const w = cur || frame.last; if (!w || !w.isConnected) { cur = null; hov = 0; return; }
    hov += ((cur ? 1 : 0) - hov) * (1 - Math.exp(-dt * 7)); const pmx = mx, pmy = my; mx += (tmx - mx) * (1 - Math.exp(-dt * 10)); my += (tmy - my) * (1 - Math.exp(-dt * 10)); vx += ((mx - pmx) * 6 - vx) * 0.2; vy += ((my - pmy) * 6 - vy) * 0.2;
    const r = w.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), W = Math.max(2, Math.round(r.width * d)), H = Math.max(2, Math.round(r.height * d));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; cv.style.transform = 'translate3d(' + r.left + 'px,' + r.top + 'px,0)'; cv.style.opacity = '1';
    const m = media(w); if (!texWH || (m && m.tagName === 'VIDEO')) texWH = upload(w) || texWH; if (!texWH) return;
    const ir = inner(w).getBoundingClientRect(), fit = m ? getComputedStyle(m).objectFit : 'fill', ea = texWH[0] / texWH[1], ba = ir.width / ir.height;
    const ta = fit === 'cover' ? (ea > ba ? [ba / ea, 1] : [1, ea / ba]) : [1, 1];
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uSize, r.width, r.height); gl.uniform1f(U.uRadius, parseFloat(getComputedStyle(w).borderTopLeftRadius) || 0); gl.uniform1f(U.uHover, hov); gl.uniform1f(U.uTime, now / 1000);
    gl.uniform1f(U.uStr, num(w, 'strength', 1)); gl.uniform1f(U.uRip, num(w, 'ripple', 1)); gl.uniform1f(U.uRgb, num(w, 'rgb', 1)); gl.uniform1f(U.uSpd, num(w, 'speed', 1));
    gl.uniform2f(U.uMouse, mx, my); gl.uniform2f(U.uMVel, vx, vy); gl.uniform4f(U.uInner, ir.left - r.left, ir.top - r.top, ir.width, ir.height); gl.uniform2f(U.uTexAsp, ta[0], ta[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3); };
  addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; const w = e.target.closest && e.target.closest('[data-wb-distort]'); if (!w || w === cur) return; if (!init()) return;
    if (w !== frame.last) { texWH = null; hov = 0; } cur = w; frame.last = w; const r = w.getBoundingClientRect(); tmx = mx = (e.clientX - r.left) / r.width; tmy = my = (e.clientY - r.top) / r.height; }, { passive: true });
  addEventListener('pointermove', (e) => { if (!cur) return; const r = cur.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width; tmy = (e.clientY - r.top) / r.height;
    if (tmx < 0 || tmx > 1 || tmy < 0 || tmy > 1) cur = null; }, { passive: true });
  addEventListener('pointerout', (e) => { if (cur && !cur.contains(e.relatedTarget)) cur = null; }, { passive: true });
  requestAnimationFrame(frame);
})();
