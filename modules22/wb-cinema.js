/* Wubble cinematic layer (test page /home-cinematic). Photographic plates, fog and a light grade around the homepage story:
   - galaxy (Milky Way) behind the starfield, the whole way down
   - moon horizon under the hero astronaut: at first only the top of the moon shows; it sinks away as he floats up into the galaxy
   - just before the footer: a cloud bank (space -> atmosphere) rises from below and soft fog rolls in over it
   - warm sunlight from the left (matches the moon photo), vignette
   Reads the homepage's own hero progress (window.__wbRP, 0..1) and the footer spacer position; touches nothing else.
   Images: media/cine-{galaxy,moon,clouds}[-s].webp (-s on phones). One small WebGL context for the fog (phones: low resolution). */
(() => {
  if (window.__wbCinema) return; window.__wbCinema = 1;
  const coarse = matchMedia('(pointer: coarse)').matches, small = coarse || innerWidth < 820;
  const src = (n) => (window.WB_ASSETS || './') + 'media/cine-' + n + (small ? '-s' : '') + '.webp';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

  const start = () => {
    const root = document.querySelector('.home_page-wrapper') || document.body, host = root.querySelector('[data-space-host]');
    const layer = (css, before) => { const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;' + css;
      if (before && before.parentNode) before.parentNode.insertBefore(d, before); else root.appendChild(d); return d; };

    /* 1. galaxy: under the starfield canvas, above the flat grey background */
    const galaxy = layer('z-index:0;background:#020204 url(' + src('galaxy') + ') 50% 42%/cover no-repeat;transform:scale(1.12);will-change:transform;', host);
    const dim = layer('z-index:0;background:radial-gradient(120% 90% at 50% 40%, rgba(2,2,6,0) 40%, rgba(2,2,6,.55) 100%);', host);

    /* 2. moon horizon: above the stars, under the hero + astronaut (both z-index 1, later in the page) */
    const moon = layer('z-index:0;height:auto;background:url(' + src('moon') + ') 50% 0/cover no-repeat;transform-origin:50% 0;will-change:transform,opacity;', host ? host.nextSibling : null);
    const HZ = 0.345; /* horizon height in the moon photo, as a share of its height */
    let moonTop = 0, moonH = 0, imgH = 0;
    const placeMoon = () => { const W = innerWidth, V = innerHeight; moonH = Math.round(V * 0.9); imgH = Math.max(W * 1116 / 2000, moonH);
      moonTop = Math.round(V * (coarse ? 0.8 : 0.78) - imgH * HZ); /* only the top of the moon shows at first */
      moon.style.top = moonTop + 'px'; moon.style.height = moonH + 'px';
      const h = Math.round(imgH * HZ); moon.style.webkitMaskImage = moon.style.maskImage = 'linear-gradient(to bottom, transparent ' + (h - 6) + 'px, #000 ' + (h + 10) + 'px)'; /* cut the photo's black sky, keep the stars behind */ };
    placeMoon(); addEventListener('resize', placeMoon);

    /* 3. cloud bank + fog before the footer (under the footer, over the page) */
    const bank = layer('z-index:50;background:url(' + src('clouds') + ') 50% 100%/cover no-repeat;transform:translate3d(0,100%,0);visibility:hidden;will-change:transform;');
    const fogC = document.createElement('canvas'); fogC.setAttribute('aria-hidden', 'true'); fogC.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:51;pointer-events:none;opacity:0;visibility:hidden;'; root.appendChild(fogC);

    /* 4. grade: warm sun from the left + vignette, over everything but the header */
    const grade = layer('z-index:38;mix-blend-mode:screen;background:radial-gradient(60% 55% at -6% 18%, rgba(255,190,120,.20), rgba(255,170,90,.06) 45%, rgba(0,0,0,0) 70%), linear-gradient(100deg, rgba(255,200,140,.05), rgba(0,0,0,0) 40%);');
    const vign = layer('z-index:38;background:radial-gradient(130% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.42) 100%);');

    /* fog shader: soft drifting fbm, denser at the bottom, warm white with cool shadows */
    let gl = null, prog = null, uT, uR, uK;
    const initFog = () => { gl = fogC.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false }); if (!gl) return;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform float t,k;uniform vec2 r;' +
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
        'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(17.,9.);a*=.5;}return v;}' +
        'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=vec2(uv.x*r.x/r.y,uv.y);' +
        'float a=fbm(q*2.2+vec2(t*.035,-t*.012)),b=fbm(q*4.1+vec2(-t*.05,t*.02)+a*1.4);' +
        'float bottom=1.-smoothstep(-.1,.75+k*.6,uv.y);' +
        'float d=clamp((b*.9+a*.5-.42)*1.8,0.,1.)*mix(bottom,1.,k*k);' +
        'float fog=clamp(d*(.35+k*.9),0.,1.);' +
        'vec3 col=mix(vec3(.62,.66,.74),vec3(1.,.95,.9),smoothstep(.2,.9,b));' +
        'gl_FragColor=vec4(col*fog,fog);}'));
      gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uT = gl.getUniformLocation(prog, 't'); uR = gl.getUniformLocation(prog, 'r'); uK = gl.getUniformLocation(prog, 'k'); };
    const fogScale = coarse ? 0.3 : 0.5; /* soft fog: low resolution is invisible and cheap (phone GPU budget) */
    const sizeFog = () => { fogC.width = Math.max(2, Math.round(innerWidth * fogScale)); fogC.height = Math.max(2, Math.round(innerHeight * fogScale)); };
    addEventListener('resize', () => { if (gl) sizeFog(); });

    const spacer = () => document.querySelector('[data-footer-spacer]');
    let last = '', t0 = performance.now(), gx = 0;
    const tick = (now) => { requestAnimationFrame(tick);
      const V = innerHeight, rp = clamp(window.__wbRP || 0);
      /* moon sinks and grows a little as he floats up; gone by the end of the hero */
      const mY = rp * V * 0.95, mS = 1 + rp * 0.18, mO = 1 - sm(0.7, 0.95, rp);
      const mt = 'translate3d(0,' + mY.toFixed(1) + 'px,0) scale(' + mS.toFixed(4) + ')';
      if (moon.__t !== mt) { moon.__t = mt; moon.style.transform = mt; moon.style.opacity = mO.toFixed(3); moon.style.visibility = mO > 0.002 ? '' : 'hidden'; }
      /* galaxy drifts slowly with time and a touch with scroll */
      gx = (now - t0) / 1000; const gt = 'translate3d(' + (Math.sin(gx * 0.03) * 12).toFixed(1) + 'px,' + (-rp * 30 + Math.cos(gx * 0.025) * 8).toFixed(1) + 'px,0) scale(1.12)';
      if (galaxy.__t !== gt) { galaxy.__t = gt; galaxy.style.transform = gt; }
      /* cloud bank + fog over the last two screens before the footer */
      const sp = spacer(), top = sp ? sp.getBoundingClientRect().top : 1e9, q = clamp((2.2 * V - top) / (2.2 * V));
      const bt = 'translate3d(0,' + ((1 - sm(0, 0.75, q)) * 100).toFixed(2) + '%,0)';
      if (bank.__t !== bt) { bank.__t = bt; bank.style.transform = bt; bank.style.visibility = q > 0.002 ? '' : 'hidden'; }
      const k = sm(0.35, 1, q), key = k.toFixed(3);
      if (key !== last) { last = key; fogC.style.opacity = Math.min(1, k * 1.4).toFixed(3); fogC.style.visibility = k > 0.002 ? '' : 'hidden'; }
      if (k > 0.002) { if (!gl) { sizeFog(); initFog(); } if (gl && (!window.WB_GL_OK || window.WB_GL_OK(gl))) { gl.viewport(0, 0, fogC.width, fogC.height); gl.uniform1f(uT, gx); gl.uniform2f(uR, fogC.width, fogC.height); gl.uniform1f(uK, k); gl.drawArrays(gl.TRIANGLES, 0, 3); } }
    };
    requestAnimationFrame(tick);
    void dim; void grade; void vign;
  };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start, { once: true }) : start();
})();
