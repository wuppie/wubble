/* Wubble: "ink" page transition — faithful port of Codrops Interlude (MIT): src/transitions/ink.ts + lib/interlude/webgl.ts shaderCover.
   One full-screen WebGL quad; a frame is drawn only on each tween update (GSAP power2.inOut 1.1s cover, power2.out 1.1s reveal).
   shader: distance = |position-origin| / reach; noise = fractal(vec3(position*2.5, reveal*5), 3 oct, lac 2, gain .5);
           field = clamp(distance + noise*RAGGED, -0.08, 1.15); blot = below(field, mix(-0.1,1.2,p)); hole = below(field, mix(1.2,-0.1,p));
           alpha = mix(blot, 1-hole, reveal); opacity = p>=0.999 ? 1 : clamp(alpha)*step(0.001,p).
   Use: wbInkGo(href, x, y) or <a data-wb-ink>. A page may set window.WB_INK_READY (promise) to hold the cover until it's drawn. */
(() => {
  if (window.wbInkGo) return;
  const KEY = 'wbInk', LEAVE = window.WB_INK_LEAVE || 750, ENTER = window.WB_INK_ENTER || 900, SOFTNESS = 0.02, RAGGED = 0.25;
  const inkColor = () => getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || window.WB_INK_COLOR || '#000000';
  let openRes; window.__wbInkOpen = new Promise((r) => { openRes = r; });
  const p2inOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2), p2out = (x) => 1 - (1 - x) * (1 - x);
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float; uniform vec2 uRes; uniform vec2 uOrigin; uniform float uAspect, uProgress, uReveal; uniform vec3 uColor;
vec3 m289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 m289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 perm(vec4 x){ return m289(((x * 34.0) + 1.0) * x); } vec4 tis(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t){ return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P){ vec3 Pi0 = floor(P), Pi1 = Pi0 + vec3(1.0); Pi0 = m289(Pi0); Pi1 = m289(Pi1); vec3 Pf0 = fract(P), Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x), iy = vec4(Pi0.yy, Pi1.yy), iz0 = Pi0.zzzz, iz1 = Pi1.zzzz;
  vec4 ixy = perm(perm(ix) + iy), ixy0 = perm(ixy + iz0), ixy1 = perm(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5; gx0 = fract(gx0); vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0)); gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5; gx1 = fract(gx1); vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0)); gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x), g100 = vec3(gx0.y, gy0.y, gz0.y), g010 = vec3(gx0.z, gy0.z, gz0.z), g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x), g101 = vec3(gx1.y, gy1.y, gz1.y), g011 = vec3(gx1.z, gy1.z, gz1.z), g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 n0 = tis(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110))); g000 *= n0.x; g010 *= n0.y; g100 *= n0.z; g110 *= n0.w;
  vec4 n1 = tis(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111))); g001 *= n1.x; g011 *= n1.y; g101 *= n1.z; g111 *= n1.w;
  float n000 = dot(g000, Pf0), n100 = dot(g100, vec3(Pf1.x, Pf0.yz)), n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)), n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)), n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z)), n011 = dot(g011, vec3(Pf0.x, Pf1.yz)), n111 = dot(g111, Pf1);
  vec3 f = fade(Pf0); vec4 nz = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), f.z); vec2 nyz = mix(nz.xy, nz.zw, f.y); return 2.2 * mix(nyz.x, nyz.y, f.x); }
float fractal(vec3 p){ float s = 0.0, a = 1.0; for (int i = 0; i < 3; i++) { s += cnoise(p) * a; p *= 2.0; a *= 0.5; } return s; }
float below(float field, float thr, float soft){ float hw = max(fwidth(field), soft) * 0.5; return 1.0 - smoothstep(thr - hw, thr + hw, field); }
void main(){ vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1.0 - uv.y; vec2 pos = uv * vec2(uAspect, 1.0);
  float reach = length(max(uOrigin, vec2(uAspect, 1.0) - uOrigin)), dist = distance(pos, uOrigin) / reach;
  float noise = fractal(vec3(pos * 2.5, uReveal * 5.0)), field = clamp(dist + noise * ${RAGGED.toFixed(2)}, -0.08, 1.15);
  float blot = below(field, mix(-0.1, 1.2, uProgress), ${SOFTNESS.toFixed(3)}), hole = below(field, mix(1.2, -0.1, uProgress), ${SOFTNESS.toFixed(3)});
  float alpha = mix(blot, 1.0 - hole, uReveal); float op = uProgress >= 0.999 ? 1.0 : clamp(alpha, 0.0, 1.0) * step(0.001, uProgress);
  gl_FragColor = vec4(uColor * op, op); }`;
  let G = null;
  const setup = () => { if (G) return G;
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-wb-persist', ''); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;pointer-events:none;';
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); if (!gl) return null; gl.getExtension('OES_standard_derivatives');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[ink]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uOrigin', 'uAspect', 'uProgress', 'uReveal', 'uColor'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    return (G = { cv, gl, U }); };
  const hex = (c) => { const t = document.createElement('canvas').getContext('2d'); t.fillStyle = c; const h = t.fillStyle; if (h[0] !== '#') return [1, 0.3, 0.11]; const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  /* mount: size to the screen; origin in screen heights (x / height, y / height) */
  const mount = (ox, oy, col) => { const g = setup(); if (!g) return null; const W = innerWidth, H = innerHeight, d = Math.min(devicePixelRatio || 1, window.WB_INK_DPR || 1);
    g.cv.width = Math.round(W * d); g.cv.height = Math.round(H * d); g.gl.viewport(0, 0, g.cv.width, g.cv.height); if (!g.cv.isConnected) (document.body || document.documentElement).appendChild(g.cv);
    const { gl, U } = g; gl.uniform2f(U.uRes, g.cv.width, g.cv.height); gl.uniform1f(U.uAspect, W / H); gl.uniform2f(U.uOrigin, ox / H, oy / H); gl.uniform3fv(U.uColor, hex(col)); return g; };
  const draw = (p, reveal) => { const { gl, U } = G; gl.uniform1f(U.uProgress, p); gl.uniform1f(U.uReveal, reveal); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  const raf = (f) => (document.hidden ? setTimeout(() => f(performance.now()), 16) : (window.__wbRawRAF || requestAnimationFrame)(f));
  const tween = (ms, ease, fn) => new Promise((res) => { let el = 0, last = 0; const f = (now) => { el += last ? Math.min(33, now - last) : 0; last = now; const t = Math.min(1, el / ms); fn(ease(t)); t < 1 ? raf(f) : res(); }; raf(f); }); /* a stalled frame slows the ink instead of making it jump */ /* hidden tabs don't fire rAF: fall back to timers so a swap never hangs */
  const enter = async (done) => { openRes(); draw(1, 1); await tween(ENTER, p2out, (e) => draw(1 - e, 1)); G.cv.remove(); done && done(); };
  /* swap API: cover in place (resolves when fully covered) and reveal from the same spot */
  /* warm up once at idle: context + shader compiled + one invisible draw, so the first click doesn't freeze */
  const warm = () => { if (G || matchMedia('(pointer: coarse)').matches || window.WB_INK_CSS) return; const g = setup(); if (!g) return; const W = 64, H = 64; g.cv.width = W; g.cv.height = H; g.gl.viewport(0, 0, W, H);
    g.gl.uniform2f(g.U.uRes, W, H); g.gl.uniform1f(g.U.uAspect, 1); g.gl.uniform2f(g.U.uOrigin, 0.5, 0.5); g.gl.uniform3fv(g.U.uColor, [0, 0, 0]); draw(0.5, 0); g.gl.finish(); };
  (window.requestIdleCallback || ((f) => setTimeout(f, 2500)))(warm, { timeout: 4000 });
  /* fallback when no WebGL context can be spared (mobile GPUs cap contexts; a new one would kill the 3D scene): a CSS circle wipe */
  const css = { el: null };
  const cssCover = (x, y, col) => new Promise((res) => { const d = css.el || (css.el = document.createElement('div')); d.setAttribute('data-wb-persist', '');
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40; d.__x = x; d.__y = y; d.__R = R;
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:' + col + ';clip-path:circle(0px at ' + x + 'px ' + y + 'px);will-change:clip-path;';
    if (!d.isConnected) document.body.appendChild(d); tween(LEAVE * 0.85, p2inOut, (e) => { window.__wbInkCov = e; d.style.clipPath = 'circle(' + (e * R).toFixed(1) + 'px at ' + x + 'px ' + y + 'px)'; }).then(res); });
  const cssReveal = () => new Promise((res) => { const d = css.el; if (!d || !d.isConnected) return res(); const x = d.__x, y = d.__y, R = d.__R; openRes(); d.style.clipPath = 'none';
    tween(ENTER * 0.85, p2out, (e) => { d.style.webkitMaskImage = d.style.maskImage = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, transparent ' + (e * R).toFixed(1) + 'px, #000 ' + (e * R + 1).toFixed(1) + 'px)'; })
      .then(() => { d.remove(); d.style.maskImage = d.style.webkitMaskImage = ''; res(); }); });
  const useCss = () => matchMedia('(pointer: coarse)').matches || window.WB_INK_CSS;
  let swapCol = null;
  window.wbInkCover = async (x, y, color) => { x = x ?? innerWidth / 2; y = y ?? innerHeight / 2; swapCol = color || inkColor(); window.__wbInkBusy = 1;
    if (useCss() || !mount(x, y, swapCol)) { css.on = 1; window.__wbInkOpen = new Promise((r) => { openRes = r; }); return cssCover(x, y, swapCol); } css.on = 0;
    window.__wbInkOpen = new Promise((r) => { openRes = r; }); draw(0, 0); await tween(LEAVE, p2inOut, (e) => { window.__wbInkCov = e; draw(e, 0); }); };
  window.wbInkReveal = () => new Promise((res) => { if (css.on) { css.on = 0; return cssReveal().then(() => { window.__wbInkBusy = 0; window.__wbInkCov = 0; res(); }); } if (!G || !G.cv.isConnected) { openRes(); window.__wbInkBusy = 0; return res(); } const W = innerWidth, H = innerHeight, d = Math.min(devicePixelRatio || 1, window.WB_INK_DPR || 1);
    if (G.cv.width !== Math.round(W * d)) { G.cv.width = Math.round(W * d); G.cv.height = Math.round(H * d); G.gl.viewport(0, 0, G.cv.width, G.cv.height); G.gl.uniform2f(G.U.uRes, G.cv.width, G.cv.height); }
    enter(() => { window.__wbInkBusy = 0; window.__wbInkCov = 0; res(); }); });
  window.wbInkGo = async (href, x, y, color) => {
    /* a stuck busy flag (arrival that never finished, earlier aborted cover) must never swallow a click */
    if (window.__wbInkBusy && performance.now() - (window.__wbInkBusyT || 0) < 1800) return; window.__wbInkBusy = 1; window.__wbInkBusyT = performance.now();
    x = x ?? innerWidth / 2; y = y ?? innerHeight / 2; const c = color || inkColor();
    if (!mount(x, y, c)) { location.href = href; return; }
    try { sessionStorage.setItem(KEY, JSON.stringify({ x: x / innerWidth, y: y / innerHeight, c, t: Date.now() })); } catch (e) {}
    draw(0, 0); await tween(LEAVE, p2inOut, (e) => { window.__wbInkCov = e; draw(e, 0); });
    const u = new URL(href, location.href);
    if (window.wbMenu) window.wbMenu(false, true); /* the menu is closed under the ink, so it can never come back open (back button / bfcache) */
    if (u.pathname === location.pathname && u.search === location.search) { /* same page (e.g. "wubble" on the homepage): back to the top under the ink */
      sessionStorage.removeItem(KEY); const L = window.__sliderLenis || window.__wbLenis; if (L && L.scrollTo) L.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0);
      if (u.hash) location.hash = u.hash; setTimeout(() => enter(() => { window.__wbInkBusy = 0; window.__wbInkCov = 0; }), 120); }
    else location.href = href;
  };
  /* arrival: the page paints in the ink colour, the canvas takes over fully covering, then the hole opens from the same spot */
  /* the page's own black boot cover (first element in the markup, so the very first paint is black, never a flash) */
  const dropBoot = () => document.documentElement.classList.add('wb-boot-done'); /* CSS hides the cover; React never touches <html> classes */
  let st = null; try { st = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch (e) {}
  if (!(st && Date.now() - st.t < 8000)) { openRes(); dropBoot(); }
  else {
    const cover = document.createElement('style'); cover.textContent = 'html{background:' + st.c + '!important}body{opacity:0!important}'; document.head.appendChild(cover);
    const go = () => { if (!mount(st.x * innerWidth, st.y * innerHeight, st.c)) { cover.remove(); dropBoot(); return openRes(); } draw(1, 1); cover.remove(); raf(() => raf(dropBoot)); /* canvas is showing full ink: hand over */
      const R = window.WB_INK_READY, ld = loader(st.c);
      (R && R.then ? Promise.race([R, new Promise((z) => setTimeout(z, window.WB_INK_MAX || 4000))]) : Promise.resolve()).then(() => ld.done().then(() => enter())); };
    /* slow page: a small preloader on the ink (only appears after WB_INK_LOADER_DELAY ms, so fast pages never show it) */
    const loader = (col) => { const DELAY = window.WB_INK_LOADER_DELAY ?? 650; let el = null, t0 = performance.now(), shown = 0, alive = true, vis = false;
      const ink = /^#?(0{3}|0{6})$/i.test(String(col).replace('#', '')) || /rgb\(0, ?0, ?0\)/.test(col), fg = window.WB_INK_LOADER_COLOR || (ink ? '#ece9e2' : '#0e0e0d');
      const mk = () => { el = document.createElement('div'); el.setAttribute('data-wb-persist', ''); el.setAttribute('aria-hidden', 'true');
        el.style.cssText = 'position:fixed;inset:0;z-index:2147483001;pointer-events:none;display:flex;flex-direction:column;justify-content:flex-end;gap:14px;padding:32px 40px;box-sizing:border-box;font-family:Switzer,Helvetica,sans-serif;color:' + fg + ';opacity:0;transition:opacity .35s ease;';
        el.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;"><span style="font-weight:700;font-size:18px;letter-spacing:-0.01em;">wubble</span><span data-n style="font-weight:700;font-size:clamp(40px,7vw,96px);line-height:0.8;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;">000</span></div><div style="height:1px;background:currentColor;opacity:.18;position:relative;overflow:hidden;"><div data-b style="position:absolute;inset:0;background:' + fg + ';opacity:1;transform-origin:0 50%;transform:scaleX(0);"></div></div>';
        document.body.appendChild(el); requestAnimationFrame(() => { el.style.opacity = '1'; }); vis = true; };
      const n = () => el && el.querySelector('[data-n]'), b = () => el && el.querySelector('[data-b]');
      const tick = () => { if (!alive) return; const t = performance.now() - t0; if (!el && t > DELAY) mk();
        if (el) { const target = Math.min(0.92, 1 - Math.exp(-(t - DELAY) / 2600)); shown += (target - shown) * 0.08; n().textContent = String(Math.round(shown * 100)).padStart(3, '0'); b().style.transform = 'scaleX(' + shown.toFixed(4) + ')'; }
        setTimeout(tick, 33); };
      tick();
      return { done: () => new Promise((res) => { alive = false; if (!el) return res();
        const s0 = shown, t1 = performance.now(); const fin = () => { const k2 = Math.min(1, (performance.now() - t1) / 300), v = s0 + (1 - s0) * k2; n().textContent = String(Math.round(v * 100)).padStart(3, '0'); b().style.transform = 'scaleX(' + v.toFixed(4) + ')';
          if (k2 < 1) return setTimeout(fin, 16); el.style.opacity = '0'; setTimeout(() => { el.remove(); res(); }, 320); }; fin(); }) }; };
    document.body ? go() : addEventListener('DOMContentLoaded', go);
  }
  /* back/forward cache: the old page comes back exactly as it was left (fully inked) — clear it at once */
  addEventListener('pageshow', (e) => { if (!e.persisted) return; window.__wbInkBusy = 0; window.__wbInkCov = 0; try { sessionStorage.removeItem(KEY); } catch (er) {}
    if (G && G.cv && G.cv.isConnected) G.cv.remove(); if (css.el && css.el.isConnected) css.el.remove(); dropBoot(); openRes(); if (window.wbMenu) window.wbMenu(false, true); });
  /* prefetch on hover / touch, so the next page is already downloaded when the ink has covered */
  const pf = new Set(); const prefetch = (e) => { const a = e.target.closest && e.target.closest('a[data-wb-swap],a[data-wb-ink],a[data-wb-menu-item]'); if (!a || !a.href) return; const u = new URL(a.href, location.href); if (u.origin !== location.origin || pf.has(u.href) || u.pathname === location.pathname) return; pf.add(u.href);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.href; document.head.appendChild(l); };
  addEventListener('pointerover', prefetch, { passive: true }); addEventListener('touchstart', prefetch, { passive: true });
  addEventListener('click', (e) => { if (window.wbSwapGo) return; const a = e.target.closest && e.target.closest('a[data-wb-ink]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return; e.preventDefault(); wbInkGo(a.href, e.clientX, e.clientY, a.dataset.wbInk || null); }, true);
})();
