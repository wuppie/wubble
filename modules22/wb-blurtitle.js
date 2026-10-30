/* Wubble blur titles: every <h1> smears into a soft rotational blur around the cursor (same effect as the About wordmark).
   The real text stays in the DOM (SEO, selection); a WebGL canvas over the h1 draws it, the DOM text becomes transparent.
   Only h1s in view get a canvas (contexts are released when they scroll away).
   Webflow: load site-wide. Opt out per element: data-wb-blur="off". Tune: data-wb-blur-amount="0.7" data-wb-blur-radius="0.5" (of screen height).
   Skipped automatically: letter-split hero titles ([data-gt], [data-split]) and anything inside the menu. */
(() => {
  if (window.__wbBlurTitles) return; window.__wbBlurTitles = 1;
  if (matchMedia('(pointer: coarse)').matches) return;
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const st = document.createElement('style'); st.textContent = '[data-wb-bt-on],[data-wb-bt-on] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}'; document.head.appendChild(st);
  const FS = `precision highp float; varying vec2 vUv; uniform sampler2D uT; uniform vec2 uRes, uM; uniform float uAmt, uR, uK;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
vec4 tx(vec2 p){ vec2 q = p / uRes; if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return vec4(0.0); return texture2D(uT, vec2(q.x, 1.0 - q.y)); }
void main(){ vec2 p = vUv * uRes; vec4 c0 = tx(p); float d = distance(p, uM), fall = max(0.0, 1.0 - d / uR); fall *= fall * (3.0 - 2.0 * fall);
  float amt = uAmt * fall * 0.06 * uK; if (amt < 0.0005) { gl_FragColor = c0; return; }
  vec2 to = p - uM; float rad = length(to), ba = atan(to.y, to.x), j = ign(gl_FragCoord.xy) - 0.5; vec4 acc = c0 * 0.35; float tw = 0.35;
  for (int i = 0; i < 10; i++) { float wt = pow(0.7, float(i)), s = (1.0 + (float(i) + 0.5 + j) * 0.9) * amt;
    acc += (tx(uM + rad * vec2(cos(ba + s), sin(ba + s))) + tx(uM + rad * vec2(cos(ba - s), sin(ba - s)))) * wt; tw += 2.0 * wt; }
  gl_FragColor = acc / tw; }`;
  let mx = -1e4, my = -1e4, tk = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; tk = 1; }, { passive: true });
  document.addEventListener('pointerleave', () => { tk = 0; });
  const skip = (h) => h.getAttribute('data-wb-blur') === 'off' || h.closest('[data-wb-menu],[data-wb-blur="off"]') || h.hasAttribute('data-gt') || h.querySelector('[data-gt],[data-sq],[data-split]') || h.hasAttribute('data-split') || !h.textContent.trim() || h.offsetWidth < 2 || (h.getAttribute('data-wb-blur') !== 'on' && parseFloat(getComputedStyle(h).fontSize) < (+window.WB_BLUR_MIN_PX || 90)); /* only big display titles blur; smaller h1s stay sharp (force with data-wb-blur="on") */
  const paint = (S) => { const h = S.h, hr = h.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1), P = S.pad;
    const W = Math.ceil((hr.width + P * 2) * d), H = Math.ceil((hr.height + P * 2) * d); S.tc.width = W; S.tc.height = H; const g = S.tc.getContext('2d'); g.clearRect(0, 0, W, H); g.scale(d, d); g.textBaseline = 'alphabetic';
    const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const el = n.parentElement; if (!el) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const col = el.__wbCol || cs.color; g.fillStyle = col; g.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      const m = g.measureText('Hg'), asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8, des = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;
      const txt = n.nodeValue, re = /\S+/g; let w; const rg = document.createRange();
      while ((w = re.exec(txt))) { rg.setStart(n, w.index); rg.setEnd(n, w.index + w[0].length); const rs = rg.getClientRects(); if (!rs.length) continue; const r = rs[0];
        const base = r.top - hr.top + P + (r.height + asc - des) / 2; g.fillText(w[0], r.left - hr.left + P, base); } }
    const gl = S.gl; gl.bindTexture(gl.TEXTURE_2D, S.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, S.tc);
    S.cv.width = W; S.cv.height = H; S.cv.style.width = (hr.width + P * 2) + 'px'; S.cv.style.height = (hr.height + P * 2) + 'px'; S.w = hr.width; S.ht = hr.height; S.d = d;
    gl.viewport(0, 0, W, H); gl.uniform2f(S.U.uRes, W, H); };
  const make = (h) => { if (h.__bt) return; const S = h.__bt = { h, pad: 0 };
    h.__wbCol = getComputedStyle(h).color; h.querySelectorAll('*').forEach((e) => { e.__wbCol = getComputedStyle(e).color; });
    const fs = parseFloat(getComputedStyle(h).fontSize) || 40; S.pad = Math.max(24, fs * 0.6);
    const cv = S.cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:30;will-change:transform; /* above page content, below the header (40) and menu (150) */';
    document.body.appendChild(cv); const gl = S.gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false }); if (!gl) { cv.remove(); h.__bt = null; return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    S.U = {}; ['uT', 'uRes', 'uM', 'uAmt', 'uR', 'uK'].forEach((k) => { S.U[k] = gl.getUniformLocation(pr, k); });
    S.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, S.tex); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    S.tc = document.createElement('canvas'); S.k = 0; S.amt = +(h.getAttribute('data-wb-blur-amount') || 0.7); S.rad = +(h.getAttribute('data-wb-blur-radius') || 0.5);
    paint(S); h.setAttribute('data-wb-bt-on', ''); S.sig = '';
    S.ro = new ResizeObserver(() => { S.dirty = 1; }); S.ro.observe(h); live.add(S); };
  const drop = (h) => { const S = h.__bt; if (!S) return; live.delete(S); S.ro.disconnect(); h.removeAttribute('data-wb-bt-on'); try { S.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) {} S.cv.remove(); h.__bt = null; };
  const live = new Set(), io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { if (!skip(e.target)) make(e.target); } else drop(e.target); }), { rootMargin: '120px 0px' });
  const scan = () => document.querySelectorAll('h1').forEach((h) => { if (h.__btw) return; h.__btw = 1; io.observe(h); });
  let last = performance.now();
  const tick = (now) => { RAF(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    for (const S of live) { const h = S.h; if (!h.isConnected) { drop(h); continue; } const r = h.getBoundingClientRect();
      const op = getComputedStyle(h).opacity, sig = r.width.toFixed(0) + 'x' + r.height.toFixed(0);
      if (S.dirty || sig !== S.sig) { S.dirty = 0; S.sig = sig; paint(S); }
      S.cv.style.transform = 'translate3d(' + (r.left - S.pad).toFixed(1) + 'px,' + (r.top - S.pad).toFixed(1) + 'px,0)'; S.cv.style.opacity = op;
      S.k += (tk - S.k) * (1 - Math.exp(-dt * 3)); const d = S.d, gl = S.gl;
      gl.uniform2f(S.U.uM, (mx - r.left + S.pad) * d, (r.bottom + S.pad - my) * d); gl.uniform1f(S.U.uAmt, S.amt); gl.uniform1f(S.U.uR, innerHeight * S.rad * d); gl.uniform1f(S.U.uK, 0.35 + S.k * 0.65);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); } };
  /* titles that reveal with their own animation are re-captured once it settles */
  const later = () => live.forEach((S) => { S.dirty = 1; });
  const boot = () => { scan(); setTimeout(() => { scan(); later(); }, 1800); setTimeout(later, 3500); (document.fonts ? document.fonts.ready : Promise.resolve()).then(later); RAF(tick); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(() => scan()).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('wb:swap', () => { scan(); setTimeout(later, 1500); });
})();
