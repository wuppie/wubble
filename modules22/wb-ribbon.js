/* Wubble V22 module: ribbon — methods mixed into the page component */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  tangentFx(p) {
    const A = (a1, a2) => 1 - 3 * a2 + 3 * a1, B = (a1, a2) => 3 * a2 - 6 * a1, C = (a1) => 3 * a1;
    const bez = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t, slope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
    let t = p; for (let i = 0; i < 4; i++) { const s = slope(t, 0.68, 0.17); if (!s) break; t -= (bez(t, 0.68, 0.17) - p) / s; }
    const e = bez(t, 0.01, 0.98), d = e - 0.5, blur = Math.exp(-20 * d * d), PI = Math.PI;
    return { out: e <= 0.5, r: e <= 0.5 ? PI * e : -PI + PI * e, blur: blur * Math.min(1, p * 40, (1 - p) * 40) };
  },
  async init() {
    const THREE = await import('https://esm.sh/three@0.160.0');
    if (this.dead) return;
    this.initInk(THREE);
    this.initAstroGlobal();
    this.initBg(THREE);
    this.initReveals(THREE);
    const managed = [
      { ref: this.heroRef, init: () => this.initCta(THREE), off: () => { this.cleanupCta && this.cleanupCta(); this.cleanupCta = null; }, on: false },
      { ref: this.reachRef, init: () => this.initReach(THREE), off: () => { this.cleanupReach && this.cleanupReach(); this.cleanupReach = null; }, on: false },
    ];
    const manage = () => {
      if (this.dead) return;
      const vh = window.__svh || innerHeight;
      for (const m of managed) {
        const el = m.ref.current; if (!el) continue;
        const rc = el.getBoundingClientRect();
        const near = rc.top < vh * 1.5 && rc.bottom > -vh * 1.5;
        const far = rc.top > vh * 2.5 || rc.bottom < -vh * 2.5;
        if (near && !m.on) { m.on = true; try { m.init(); } catch (e) { console.warn(e); } }
        /* keep 3D views alive once made: recreating them leaks GPU contexts and evicts the slider/astronaut */
      }
      this.manageT = setTimeout(manage, 200);
    };
    manage();
    // bleed transition (reach → footer) removed on request

    try { await Promise.all([document.fonts.load('700 200px Oswald'), document.fonts.load('500 64px Oswald'), document.fonts.load('400 26px "JetBrains Mono"')]); } catch (e) {}
    if (this.dead) return;
    // stagger GPU start-up: let the astronaut upload + compile first, then build the slider (avoids a GPU reset on load)
    await new Promise((res) => (window.requestIdleCallback ? requestIdleCallback(res, { timeout: 900 }) : setTimeout(res, 400))); if (this.dead) return;
    const host = this.hostRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1 : 1.5));
    renderer.setClearColor(0x0e0e0d, 0);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    host.appendChild(renderer.domElement);
    // slider is the main visual: if the browser evicts its context, ask for it back (three re-inits GL state + re-uploads textures on restore)
    { const ext = renderer.getContext().getExtension('WEBGL_lose_context'); let tries = 0;
      renderer.domElement.addEventListener('webglcontextlost', () => { console.warn('[slider] context lost'); });
      renderer.domElement.addEventListener('webglcontextrestored', () => { console.warn('[slider] context restored'); tries = 0; this.scene && this.scene.traverse && this.scene.traverse((o) => { const m = o.material; if (m) [].concat(m).forEach((mm) => { mm.needsUpdate = true; for (const k in mm) { const t = mm[k]; if (t && t.isTexture) t.needsUpdate = true; } if (mm.uniforms) for (const k in mm.uniforms) { const t = mm.uniforms[k].value; if (t && t.isTexture) t.needsUpdate = true; } }); }); }); }
    const scene = new THREE.Scene();
    const FOV = 38;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

    const W = 3.4, H = 2.1, GAP = 0.16, STEP = W + GAP, N = this.projects.length, LEN = N * STEP;
    // Work stays pinned until every project has been in view: section height follows the project count and the same vh the slider progress uses
    { const sizeWork = () => { const el = this.workRef.current; if (!el) return; const vh = window.__svh || innerHeight, hold = this.props.workHold ?? 0.8;
        const nx = this.ctaRef && this.ctaRef.current, ov = nx ? Math.max(0, -parseFloat(getComputedStyle(nx).marginTop) || 0) : 0; // next section overlaps Work's bottom and starts the exit early
        el.style.height = Math.round(vh * (0.5 + 0.55 * Math.max(1, N - 1) + hold) + vh + ov) + 'px'; };
      sizeWork(); setTimeout(sizeWork, 600); setTimeout(sizeWork, 2000); addEventListener('resize', sizeWork); this._sizeWork = sizeWork; }
    const common = { uWeaveY: { value: 0.55 }, uWeave: { value: 0 }, uWeaveP: { value: new THREE.Vector3(-4, 2.6, 0.9) }, uRing: { value: 0 }, uRingR: { value: 1 }, uRingT: { value: new THREE.Vector2(0.38, 0.26) }, uCurve: { value: 0.11 }, uVel: { value: 0 }, uRadius: { value: 0.14 }, uTime: { value: 0 }, uHoverAmt: { value: 1 }, uRibbon: { value: new THREE.Matrix4() }, uTwist: { value: 0 }, uIntro: { value: 0 }, uCover: { value: new THREE.Vector2(1, 1) } };
    const ribbonEuler = new THREE.Euler();
    let ribbonAmt = -1;
    const setRibbon = (k) => {
      if (this._vA !== camera.aspect) { this._vA = camera.aspect; this._vHr = 2 * camera.position.length() * Math.tan(camera.fov * Math.PI / 360); ribbonAmt = -1; }
      const ry = this.props.ribbonY ?? -0.4, mob = camera.aspect < 0.8;
      if (k !== ribbonAmt) { ribbonAmt = k; ribbonEuler.set(0.07 * k, -0.1 * k, -0.075 * k); common.uRibbon.value.makeRotationFromEuler(ribbonEuler); common.uTwist.value = 0.035 * k; }
      common.uRibbon.value.setPosition(0, (mob ? -0.62 : 0) + ry * (this._vHr || 6) * (mob ? 0.2 : 0.5), 0);
    };

    const vert = `
      uniform float uCurve; uniform float uVel; uniform float uHover; uniform vec2 uMouse; uniform vec2 uSize; uniform float uHoverAmt;
      uniform float uRefl; uniform float uFloor;
      uniform mat4 uRibbon; uniform float uRing; uniform float uRingR; uniform vec2 uRingT; uniform float uWeave; uniform vec3 uWeaveP; uniform float uWeaveY; uniform float uTwist; uniform float uIntro; uniform float uOpen; uniform vec2 uCover; uniform float uOV; uniform vec2 uClick; uniform float uDim; uniform float uPS; uniform float uPV;
      varying vec2 vUv; varying float vX; varying float vIntro; varying vec2 vUnb;
      void main(){
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        float cx0 = modelMatrix[3].x;
        float push = smoothstep(0.0, 1.0, clamp(uDim, 0.0, 1.0));
        wp.x += (cx0 >= 0.0 ? 1.0 : -1.0) * push * 2.6 * (0.6 + 0.4 * uv.x);
        wp.z -= push * 1.6;
        float x = wp.x;
        float e = clamp(uIntro * 1.8 - (x + 7.0) / 14.0 * 0.8, 0.0, 1.0);
        e = 1.0 - pow(1.0 - e, 3.0);
        float ie = 1.0 - e;
        vec2 md = (uv - uMouse) * vec2(uSize.x / uSize.y, 1.0);
        wp.z += smoothstep(0.6, 0.0, length(md)) * uHover * 0.28 * uHoverAmt;
        float c = max(uCurve, 0.0001);
        float R = 1.0 / c;
        float th = x * c;
        float z0 = wp.z;
        wp.x = sin(th) * R;
        wp.z += (1.0 - cos(th)) * R;
        wp.y -= uWeave * uWeaveY;
        if (uWeave > 0.001) wp.z += uWeave * uWeaveP.z * 0.6 * cos(3.14159265 * (wp.x - uWeaveP.x) / uWeaveP.y);
        if (uRing > 0.001) { float rth = x / uRingR; wp.x = mix(wp.x, sin(rth) * uRingR, uRing); wp.z = mix(wp.z, z0 + (cos(rth) - 1.0) * uRingR, uRing); }
        float vk = 1.0 - smoothstep(0.0, 0.25, uOpen);
        wp.z -= sin(uv.x * 3.14159) * abs(uVel) * 0.55 * vk;
        wp.x += (uv.y - 0.5) * -uVel * 0.35 * vk;
        wp.y -= ie * 4.0;
        wp.z -= ie * 6.0;
        float tw = x * uTwist + ie * 1.3;
        wp.yz = mat2(cos(tw), sin(tw), -sin(tw), cos(tw)) * wp.yz;
        if (uRing > 0.001) {
          wp.z += uRingR;
          float ax = uRingT.x * uRing, az = uRingT.y * uRing;
          wp.yz = mat2(cos(ax), sin(ax), -sin(ax), cos(ax)) * wp.yz;
          wp.xy = mat2(cos(az), sin(az), -sin(az), cos(az)) * wp.xy;
          wp.z -= uRingR;
        }
        if (uRefl > 0.5) wp.y = 2.0 * uFloor - wp.y;
        wp = uRibbon * wp;
        vX = x; vIntro = e;
        vec4 clipA = projectionMatrix * viewMatrix * wp;
        vec2 lagv = (uv - uClick) * vec2(uSize.x / uSize.y, 1.0);
        float lag = length(lagv);
        float oe = uOpen - lag * uOV * 0.16;
        float oc = clamp(oe, 0.0, 1.0);
        vec3 ndcA = clipA.xyz / clipA.w;
        vec2 ndcB = (uv - 0.5) * 2.0 * uCover;
        vec2 nxy = mix(ndcA.xy, ndcB, oe);
        vec2 cc = uv - 0.5;
        vec2 bow = vec2(cc.x * (1.0 - 4.0 * cc.y * cc.y), cc.y * (1.0 - 4.0 * cc.x * cc.x));
        nxy += bow * uOV * 0.22 * uCover * (0.35 + oc);
        nxy.y += sin(uv.x * 3.14159) * uOV * 0.05;
        float ocw = clamp(uOpen, 0.0, 1.0);
        nxy.y += uPS * ocw;
        float pa = abs(uPV) * ocw;
        nxy.x *= 1.0 - pa * 0.09 * (1.0 - clamp(nxy.y * nxy.y, 0.0, 1.0));
        nxy.y -= uPV * ocw * 0.14 * (1.0 - nxy.x * nxy.x);
        vUnb = mix(uv, ((nxy - vec2(0.0, uPS)) / uCover) * 0.5 + 0.5, smoothstep(0.98, 1.0, uOpen));
        float nz = mix(ndcA.z, -0.5, smoothstep(0.0, 0.02, abs(uOpen) + abs(uOV)));
        float w = mix(clipA.w, 1.0, oc);
        gl_Position = vec4(nxy * w, nz * w, w);
      }`;
    const frag = `
      uniform sampler2D uTex; uniform vec2 uSize; uniform float uRadius; uniform float uVel;
      uniform float uHover; uniform vec2 uMouse; uniform vec2 uMVel; uniform float uTime; uniform float uHoverAmt;
      uniform float uOpen; uniform float uDim; uniform sampler2D uTex2; uniform float uCurve; uniform float uRefl; uniform float uReflAmt; uniform float uOV; uniform vec2 uClick; uniform float uPV;
      varying vec2 vUv; varying float vX; varying float vIntro; varying vec2 vUnb;
      float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      uniform float uRing;
      void main(){
        vec2 p = (vUv - 0.5) * uSize;
        float d = sdRound(p, uSize * 0.5, uRadius * (1.0 - smoothstep(0.3, 0.95, clamp(uOpen, 0.0, 1.0))) + abs(uOV) * 0.12 + abs(uPV) * 0.22);
        float aa = fwidth(d) * 1.2;
        float a = 1.0 - smoothstep(-aa, aa, d);
        vec2 asp = vec2(uSize.x / uSize.y, 1.0);
        vec2 md = (vUv - uMouse) * asp;
        float dist = length(md);
        vec2 dir = md / max(dist, 1e-4) / asp;
        float fall = smoothstep(0.5, 0.0, dist) * uHover * uHoverAmt;
        vec2 uv = (vUv - 0.5) * (1.0 - 0.05 * uHover * uHoverAmt) + 0.5;
        uv -= dir * sin(dist * 30.0 - uTime * 6.0) * 0.010 * fall;
        uv -= dir * 0.035 * fall * (1.0 - dist * 2.0);
        uv -= uMVel * fall * 0.6;
        float introShift = (1.0 - vIntro) * 0.03;
        vec2 sh = vec2(uVel * 0.006 * (1.0 - uOpen) + introShift, 0.0) + dir * 0.012 * fall + uMVel * fall * 0.4;
        vec3 col = vec3(texture2D(uTex, uv + sh).r, texture2D(uTex, uv).g, texture2D(uTex, uv - sh).b);
        col += fall * 0.06;
        vec2 cuv = (vUnb - 0.5) * (1.0 - min(abs(uOV), 1.2) * 0.1) + 0.5;
        vec2 rgb = (vUv - uClick) * 0.025 * uOV;
        vec3 cl = vec3(texture2D(uTex2, cuv + rgb).r, texture2D(uTex2, cuv).g, texture2D(uTex2, cuv - rgb).b);
        col = mix(col, cl, smoothstep(0.05, 0.5, uOpen));
        {
          float th = vX * max(uCurve, 0.0001);
          float face = cos(clamp(th * 1.35, -1.5, 1.5));
          float k = 1.0 - smoothstep(0.85, 1.0, uOpen);
          vec3 shaded = col * (0.5 + 0.5 * face);
          float side = sign(vX) * (vUv.x - 0.5);
          shaded *= 1.0 - 0.28 * smoothstep(0.0, 0.5, side) * smoothstep(0.5, 4.0, abs(vX));
          float edgeIn = smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x);
          shaded *= mix(0.72, 1.0, edgeIn);
          shaded *= mix(0.86, 1.0, smoothstep(0.0, 0.35, vUv.y));
          float sheenX = 0.5 - vX * 0.04;
          float sheen = exp(-pow((vUv.x - sheenX) * 3.2, 2.0)) * (0.6 + 0.4 * face);
          shaded += vec3(1.0, 0.98, 0.95) * sheen * 0.045 * smoothstep(0.2, 1.0, vUv.y);
          col = mix(col, shaded, k);
        }
        float dim = 1.0 - smoothstep(4.2, 8.5, abs(vX));
        col *= mix(0.2, 1.0, max(dim, uOpen));
        a *= max(1.0 - smoothstep(9.6, 10.6, abs(vX)), uOpen);
        col *= 1.0 - uDim * 0.85;
        a *= 1.0 - uDim * 0.6;
        a *= smoothstep(0.0, 0.35, vIntro);
        if (uRefl > 0.5) {
          float rf = 1.0 - smoothstep(0.0, 0.9, vUv.y);
          a *= uReflAmt * rf;
          col *= 0.95;
        }
        gl_FragColor = vec4(col, a);
        if (uRing > 0.5 && !gl_FrontFacing) gl_FragColor = vec4(vec3(0.018), gl_FragColor.a);
      }`;

    const geo = new THREE.PlaneGeometry(W, H, 64, 24);
    const reflFloor = { value: 0.15 - H / 2 - 0.03 }, reflAmt = { value: 0.1 };
    const cw = 1600, ch = Math.round(1600 * H / W);
    const cards = this.projects.map((p, i) => {
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const ctx = cv.getContext('2d');
      this.drawCover(ctx, cw, ch, p, i, null, true);
      const tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.ShaderMaterial({
        uniforms: { ...common, uTex: { value: tex }, uSize: { value: new THREE.Vector2(W, H) }, uHover: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uMVel: { value: new THREE.Vector2() }, uOpen: { value: 0 }, uDim: { value: 0 }, uTex2: { value: tex }, uOV: { value: 0 }, uClick: { value: new THREE.Vector2(0.5, 0.5) }, uPS: { value: 0 }, uPV: { value: 0 } },
        vertexShader: vert, fragmentShader: frag, transparent: true,
      });
      mat.uniforms.uRefl = { value: 0 }; mat.uniforms.uFloor = reflFloor; mat.uniforms.uReflAmt = reflAmt;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false; mesh.renderOrder = 1; mesh.position.y = 0.15;
      scene.add(mesh);
      const rmat = new THREE.ShaderMaterial({ uniforms: Object.assign({}, mat.uniforms, { uRefl: { value: 1 } }), vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const rmesh = new THREE.Mesh(geo, rmat);
      rmesh.frustumCulled = false; rmesh.renderOrder = 0; rmesh.position.y = 0.15;
      scene.add(rmesh);
      return { mesh, rmesh, tex, ctx, p, i, url: '', img: null, video: null, vidUrl: '', h: 0, m: new THREE.Vector2(0.5, 0.5), mv: new THREE.Vector2() };
    });

    const loadMedia = (card, key, imgUrl, vidUrl) => {
      card.url = key; card.img = null; card.vidUrl = vidUrl;
      if (card.video) { card.video.pause(); card.video.removeAttribute('src'); card.video.load(); card.video = null; }
      this.drawCover(card.ctx, cw, ch, card.p, card.i, null, true); card.tex.needsUpdate = true;
      if (vidUrl) {
        const v = document.createElement('video');
        v.crossOrigin = 'anonymous'; v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = 'auto';
        v.addEventListener('loadeddata', () => { if (card.url === key) card.video = v; });
        v.src = vidUrl; v.play().catch(() => {});
      }
      if (imgUrl) {
        const img = new Image(); img.crossOrigin = 'anonymous';
        img.onload = () => { if (card.url !== key) return; card.img = img; if (!card.video) { this.drawCover(card.ctx, cw, ch, card.p, card.i, img, true); card.tex.needsUpdate = true; } };
        img.src = imgUrl;
      }
    };

    const drawClean = (c) => {
      const media = (c.video && c.video.readyState >= 2) ? c.video : c.img;
      this.drawCover(c.cleanCv.getContext('2d'), cw, ch, c.p, c.i, media, true);
      c.cleanTex.needsUpdate = true;
    };
    this.prepClean = (i) => {
      const c = cards[i];
      if (!c.cleanCv) {
        c.cleanCv = document.createElement('canvas'); c.cleanCv.width = cw; c.cleanCv.height = ch;
        c.cleanTex = new THREE.CanvasTexture(c.cleanCv);
        c.mesh.material.uniforms.uTex2.value = c.cleanTex;
      }
      drawClean(c);
      const src = new Promise((res) => {
        try {
          c.cleanCv.toBlob((b) => {
            if (!b) return res('');
            if (c.blobUrl) URL.revokeObjectURL(c.blobUrl);
            c.blobUrl = URL.createObjectURL(b);
            const im = new Image(); im.onload = () => res(c.blobUrl); im.onerror = () => res(c.blobUrl); im.src = c.blobUrl;
          }, 'image/jpeg', 0.92);
        } catch (e) { res(''); }
      });
      return { src, video: c.vidUrl };
    };

    const grid = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.ShaderMaterial({
      uniforms: { uOffset: { value: 0 } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uOffset; varying vec3 vW;
        void main(){ vec2 c = vec2(vW.x + uOffset, vW.z) / 0.95; vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
          float line = 1.0 - min(min(g.x, g.y), 1.0); float fade = smoothstep(42.0, 5.0, length(vW.xz));
          gl_FragColor = vec4(vec3(0.02 + line * 0.32 * fade), 1.0); }`,
    }));
    grid.rotation.x = -Math.PI / 2; grid.position.y = -1.35;
    scene.add(grid);
    // curved "inside a cylinder" grid backdrop: fine lines + plus markers, wraps around the camera
    const CR = 26, curved = new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, 60, 160, 1, true), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, side: THREE.BackSide,
      uniforms: { uOff: { value: 0 }, uOp: { value: 0.22 }, uCells: { value: 64 }, uInk: { value: new THREE.Color(0xece9e2) } },
      vertexShader: 'varying vec2 vC; varying vec3 vW; void main(){ vC = vec2(uv.x, position.y); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uOff, uOp, uCells; uniform vec3 uInk; varying vec2 vC; varying vec3 vW;
        void main(){
          float cs = 6.2832 * ${CR.toFixed(1)} / uCells;
          vec2 c = vec2(vC.x * uCells + uOff / cs, vC.y / cs);
          vec2 f = abs(fract(c - 0.5) - 0.5), fw = fwidth(c);
          float line = 1.0 - min(min(f.x / (fw.x * 0.9), f.y / (fw.y * 0.9)), 1.0);
          vec2 c2 = c * 0.5, f2 = abs(fract(c2 - 0.5) - 0.5), fw2 = fwidth(c2);
          float arm = 0.07; float plus = max(step(f2.x, fw2.x * 1.4) * step(f2.y, arm), step(f2.y, fw2.y * 1.4) * step(f2.x, arm));
          float fadeY = smoothstep(17.0, 4.0, abs(vW.y - 0.4));
          float a = (line * 0.55 + plus * 1.4) * fadeY * uOp;
          gl_FragColor = vec4(uInk, clamp(a, 0.0, 1.0)); }` }));
    curved.renderOrder = -10; curved.frustumCulled = false; scene.add(curved);

    let camD = 11, visW = 10;
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const t = Math.tan((FOV / 2) * Math.PI / 180);
      const span = camera.aspect >= 1.2 ? STEP * 3 : W * 1.3;
      camD = span / (2 * t * camera.aspect);
      camera.position.set(0, 0.7, camD);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      visW = 2 * camD * t * camera.aspect;
      const A = camera.aspect, ca = W / H;
      if (A > ca) common.uCover.value.set(1, A / ca); else common.uCover.value.set(ca / A, 1);
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();
    // ring mode: the word lives IN the 3D scene at the ring's centre, so front cards pass in front and back cards behind it
    // word lives in the scene; split into two layers so the weave is always clean:
    // "back" letters draw before the cards, "front" letters after them — no geometric intersection ever
    // "WORK" = one mesh per letter (own canvas, own shadow) → no clipping; front/back per letter via renderOrder
    const LET = []; let wordKey = '', wordCenters = null, wordFront = [];
    const letVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    const letFS = 'uniform sampler2D map; uniform float uOp; varying vec2 vUv; void main(){ vec4 c = texture2D(map, vUv); gl_FragColor = vec4(c.rgb, c.a * uOp); }';
    const mkLetter = () => { const cv = document.createElement('canvas'), tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.NoColorSpace; tx.anisotropy = 4;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, uniforms: { map: { value: tx }, uOp: { value: 1 } }, vertexShader: letVS, fragmentShader: letFS }));
      m.frustumCulled = false; m.visible = false; scene.add(m); return { cv, tx, m, sq: { v: 0 }, cx: 0, w: 0, h: 0, base: 0 }; };
    const drawWord = (asp, split) => {
      const txt = (this.props.workWord || 'Work').toUpperCase();
      const fam = (getComputedStyle(document.documentElement).getPropertyValue('--display') || '').trim() || 'Oswald';
      const P2 = this.props, col = P2.workWordColor || '#ece9e2', wgt = P2.workWordWeight || 700, ls = P2.workWordSpacing ?? 0, shA = P2.workWordShadow ?? 0.6;
      const key = [txt, fam, asp.toFixed(2), split, col, wgt, ls, shA].join('|'); if (key === wordKey) return; wordKey = key;
      const Wc = 2048, Hc = Math.round(Wc / asp);
      const mc = document.createElement('canvas').getContext('2d');
      let fs = Hc * 0.9; const font = () => wgt + ' ' + fs + 'px ' + fam + ', Helvetica, sans-serif';
      mc.font = font(); const chars = Array.from(txt);
      const totW = () => chars.reduce((a2, ch) => a2 + mc.measureText(ch).width, 0) + ls * fs * (chars.length - 1);
      const tw0 = totW(); if (tw0 > Wc * 0.985) { fs *= Wc * 0.985 / tw0; mc.font = font(); }
      const tw = totW(), x0 = Wc / 2 - tw / 2;
      const pad = Math.ceil(fs * 0.22);
      wordCenters = []; wordFront = []; let pre = 0, li = 0;
      chars.forEach((ch) => {
        const adv = mc.measureText(ch).width;
        if (ch.trim()) {
          const L = LET[li] || (LET[li] = mkLetter());
          const mm = mc.measureText(ch), inkL = mm.actualBoundingBoxLeft, inkR = mm.actualBoundingBoxRight;
          const cw = Math.ceil(inkL + inkR + pad * 2), ch2 = Math.ceil(mm.actualBoundingBoxAscent + mm.actualBoundingBoxDescent + pad * 2);
          L.cv.width = cw; L.cv.height = ch2; const g = L.cv.getContext('2d');
          g.font = font(); g.fillStyle = col; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
          g.shadowColor = 'rgba(0,0,0,' + (0.75 * shA) + ')'; g.shadowBlur = fs * 0.09 * shA; g.shadowOffsetY = fs * 0.035 * shA;
          g.clearRect(0, 0, cw, ch2); g.fillText(ch, pad + inkL, pad + mm.actualBoundingBoxAscent);
          L.tx.needsUpdate = true;
          // canvas-space placement of this letter's box
          const left = x0 + pre - inkL - pad, capTop = Hc / 2 - (mm.actualBoundingBoxAscent + mm.actualBoundingBoxDescent) / 2;
          L.cx = (left + cw / 2) / Wc; L.w = cw / Wc; L.h = ch2 / Hc; L.cy = (capTop - pad + ch2 / 2) / Hc; L.bot = (capTop + mm.actualBoundingBoxAscent + mm.actualBoundingBoxDescent) / Hc;
          wordCenters.push((x0 + pre + adv / 2) / Wc); wordFront.push(!split || li % 2 === 0); li++;
        }
        pre += adv + ls * fs;
      });
      for (let k = li; k < LET.length; k++) LET[k].m.visible = false;
      LET.length = li;
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { wordKey = ''; });
    const wRay = new THREE.Raycaster(), wNdc = new THREE.Vector2(); let wHover = -1;
    const setHover = (i) => {
      if (i === wHover) return; const G = window.gsap;
      [wHover, i].forEach((k, n) => { const L = LET[k]; if (!L) return; const on = n === 1;
        if (G) G.to(L.sq, { v: on ? 1 : 0, duration: on ? 0.9 : 1.3, ease: on ? 'expo.out' : 'elastic.out(1, 0.55)', overwrite: true });
        else L.sq.v = on ? 1 : 0; });
      wHover = i;
    };
    host.addEventListener('pointermove', (e) => {
      if (!LET.length || !LET[0].m.visible) return setHover(-1);
      const r = host.getBoundingClientRect(); wNdc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      wRay.setFromCamera(wNdc, camera);
      let idx = -1; LET.forEach((L, k) => { const h = wRay.intersectObject(L.m, false)[0]; if (h && h.uv && h.uv.x > 0.12 && h.uv.x < 0.88 && h.uv.y > 0.12 && h.uv.y < 0.88) idx = k; });
      setHover(idx);
    });
    host.addEventListener('pointerleave', () => setHover(-1));
    const WV = new THREE.Vector3();
    const placeWord = (ring, intro, weave) => {
      const rib = ring < 0.5 && weave < 0.5, on = intro > 0.02, split = weave > 0.5 || rib;
      const pgOpen = !!this.state.page && !this.closing;
      if (pgOpen) { this._wordWasHidden = true; LET.forEach((L) => { L.m.visible = false; }); return; }
      if (this._wordWasHidden) { this._wordWasHidden = false; wordKey = ''; LET.forEach((L) => { L.sq.v = 0; L.tx.needsUpdate = true; }); }
      if (!on) { LET.forEach((L) => { L.m.visible = false; }); return; }
      const rr = split ? 0 : common.uRingR.value;
      WV.set(0, 0, -rr).applyMatrix4(common.uRibbon.value);
      const dist = camera.position.distanceTo(WV), vH = 2 * dist * Math.tan((FOV / 2) * Math.PI / 180), vW = vH * camera.aspect;
      const fitK = camera.aspect < 0.8 ? 0.82 : 1.08, wsz = (this.props.workWordSize ?? 1) * fitK, hgt = (split ? Math.min(vH * 0.8, vW * 0.5) : Math.min(vH * 0.62, vW * 0.42)) * wsz, vWs = vW * wsz;
      drawWord(vWs / hgt, split);
      const ox = (this.props.workWordX ?? 0) * vW * 0.5, oy = (1 - intro) * -1.5 + (split ? 0.25 : 0) + (this.props.workWordY ?? 0) * vH * 0.5 + (camera.aspect < 0.8 ? vH * 0.07 + 0.62 : 0), op = this.props.workWordOpacity ?? 1;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      LET.forEach((L, k) => {
        const m = L.m, sv = L.sq.v, kx = 1 - 0.3 * sv, ky = 1 + 0.1 * sv;
        const wx = (L.cx - 0.5) * vWs + ox, wy = (0.5 - L.cy) * hgt + oy, wB = (0.5 - L.bot) * hgt + oy;
        const cyS = wB + (wy - wB) * ky;
        m.visible = true; m.renderOrder = camera.aspect < 0.8 ? 0 : split ? (wordFront[k] ? 0 : 9) : 5; // cards pass OVER W, R… and BEHIND O, K…
        m.quaternion.copy(camera.quaternion);
        m.position.copy(WV).addScaledVector(right, wx).addScaledVector(up, cyS);
        m.scale.set(L.w * vWs * kx, L.h * hgt * ky, 1);
        const mo0 = this.props.titleMorph ?? true ? Math.max(0, Math.min(1, ((this.rp ?? 1) - 0.72) / 0.2)) : 1;
        const mq = Math.max(0, Math.min(1, mo0 * (1 + 0.15 * (LET.length - 1)) - k * 0.15)), me = mq < 0.5 ? 1 - Math.sqrt(1 - 4 * mq * mq) / 2 - 0.5 + 0.5 * 0 : 0.5 + Math.sqrt(Math.max(0, 1 - Math.pow(-2 * mq + 2, 2))) / 2;
        const meC = mq < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * mq, 2))) / 2 : me;
        m.position.addScaledVector(up, -(1 - meC) * L.h * hgt * 1.05);
        m.material.uniforms.uOp.value = op * Math.min(1, meC * 2.5); m.material.needsUpdate = false;
      });
      { const Hh = host.clientHeight || innerHeight, Ww = host.clientWidth || innerWidth, ppu = Hh / vH, pv = new THREE.Vector3();
        this.workLetters = LET.map((L) => { pv.copy(L.m.position).project(camera); return { x: (pv.x + 1) / 2 * Ww, y: (1 - pv.y) / 2 * Hh, h: L.m.scale.y * ppu * 0.62 }; }); }
      if (wordCenters && wordCenters.length) { const c0 = (wordCenters[0] - 0.5) * vWs + ox, c3 = (wordCenters[wordCenters.length - 1] - 0.5) * vWs + ox, n = wordCenters.length; common.uWeaveP.value.x = c0; common.uWeaveP.value.y = n > 1 ? (c3 - c0) / (n - 1) : vWs; }
    };

    const V = new THREE.Vector3();
    const toScreen = (x, y, c, rw, rh) => {
      const cc = Math.max(c, 0.0001);
      const tw = x * common.uTwist.value, rg = common.uRing.value;
      let X = Math.sin(x * cc) / cc, Z = (1 - Math.cos(x * cc)) / cc;
      if (rg > 0.001) { const rr = common.uRingR.value, a = x / rr; X += (Math.sin(a) * rr - X) * rg; Z += ((Math.cos(a) - 1) * rr - Z) * rg; }
      let Y = y * Math.cos(tw) - Z * Math.sin(tw); Z = y * Math.sin(tw) + Z * Math.cos(tw);
      if (rg > 0.001) { const rr = common.uRingR.value, ax = common.uRingT.value.x * rg, az = common.uRingT.value.y * rg; Z += rr;
        const y2 = Y * Math.cos(ax) - Z * Math.sin(ax), z2 = Y * Math.sin(ax) + Z * Math.cos(ax); Y = y2; Z = z2 - rr;
        const x3 = X * Math.cos(az) - Y * Math.sin(az), y3 = X * Math.sin(az) + Y * Math.cos(az); X = x3; Y = y3; }
      V.set(X, Y, Z).applyMatrix4(common.uRibbon.value).project(camera);
      return [(V.x + 1) / 2 * rw, (1 - V.y) / 2 * rh];
    };
    let target = 0, cur = 0, prev = 0, vel = 0, dragging = false, lastX = 0, moved = 0, snapT = null, mouse = null, introS = 0;
    let base = 0, dragOff = 0, lastP2 = -1, scrollSnapT = null;
    const snap = () => { dragOff = Math.round((base + dragOff) / STEP) * STEP - base; };
    this.sliderGo = (d) => go(d);
    const go = (d) => { dragOff = (Math.round((base + dragOff) / STEP) + d) * STEP - base; };
    const pickCard = () => {
      if (!mouse || dragging || introS < 0.9 || this.state.page) return null;
      const rw = host.clientWidth, rh = host.clientHeight, c = common.uCurve.value, S = 40;
      for (const card of cards) {
        const cx = card.mesh.position.x, cy = card.mesh.position.y;
        if (Math.abs(cx) > 9) continue;
        let pt = null;
        for (let k = 0; k <= S; k++) {
          const u = k / S, x = cx + (u - 0.5) * W;
          const t = toScreen(x, cy + H / 2, c, rw, rh), b = toScreen(x, cy - H / 2, c, rw, rh);
          const sx = (t[0] + b[0]) / 2;
          if (pt && mouse.x >= pt.sx && mouse.x <= sx) {
            const f = (mouse.x - pt.sx) / Math.max(sx - pt.sx, 1e-4);
            const uu = pt.u + (u - pt.u) * f;
            const ty = pt.ty + (t[1] - pt.ty) * f, by = pt.by + (b[1] - pt.by) * f;
            const vv = 1 - (mouse.y - ty) / (by - ty);
            if (vv >= 0 && vv <= 1) return { card, u: uu, v: vv };
          }
          pt = { u, sx, ty: t[1], by: b[1] };
        }
      }
      return null;
    };
    const setMouse = (e) => { const r = host.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onLeave = () => { mouse = null; };
    let axis = null, sx0 = 0, sy0 = 0, dvx = 0, lastT = 0;
    const onDown = (e) => { setMouse(e); dragging = true; lastX = e.clientX; sx0 = e.clientX; sy0 = e.clientY; moved = 0; dvx = 0; lastT = performance.now(); axis = e.pointerType === 'mouse' ? 'x' : null; if (axis === 'x') host.setPointerCapture(e.pointerId); };
    const onMove = (e) => {
      setMouse(e);
      if (!dragging) return;
      if (!axis) {
        const ax = Math.abs(e.clientX - sx0), ay = Math.abs(e.clientY - sy0);
        if (ax < 7 && ay < 7) return;
        axis = ax > ay ? 'x' : 'y';
        if (axis === 'y') { dragging = false; return; }
        try { host.setPointerCapture(e.pointerId); } catch (er) {}
        lastX = e.clientX;
      }
      const now = performance.now(), dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      const k = (visW / host.clientWidth) * 1.1;
      dragOff -= dx * k;
      const dt = Math.max(1, now - lastT); lastT = now;
      dvx += ((-dx * k / dt) - dvx) * 0.35;
    };
    const onUp = (e) => {
      if (!dragging) { axis = null; return; }
      dragging = false; axis = null;
      if (moved < 5) {
        const hit = pickCard();
      this.cardHover = !!hit;
        if (hit) { dragOff = cur - base; this.openProject(hit.card.i, [hit.u, hit.v]); }
      } else { dragOff += Math.max(-STEP * 1.5, Math.min(STEP * 1.5, dvx * 260)); snap(); }
    };
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      dragOff += e.deltaX * 0.006;
      clearTimeout(snapT); snapT = setTimeout(() => { if (!dragging) snap(); }, 160);
    };
    const onKey = (e) => {
      if (this.state.page) { if (e.key === 'Escape') this.requestClose(); return; }
      if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1);
    };
    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerup', onUp);
    host.addEventListener('pointercancel', onUp);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);

    const tick = () => {
      if (this.dead) return;
      this.mainTickRunning = true;
      if (window.__lenisStep) window.__lenisStep(performance.now());
      const P = this.props;
      const vh = (window.__svh || window.innerHeight);
      const sec = this.logRect(this.workRef.current, 100, 565, 710);
      const ctaRect0 = this.ctaRef.current ? this.logRect(this.ctaRef.current, 100, 820, 965) : null;
      const reachRect0 = this.reachRef.current ? this.logRect(this.reachRef.current, 100, 300, 300) : null;
      const sY = (window.__scrollY ? window.__scrollY() : window.scrollY);
      // read all section rects once, before any style writes (avoids forced layouts later in the frame)
      const ctT = this.ctaRef.current ? this.ctaRef.current.getBoundingClientRect().top : 0, rtT = this.reachRef.current ? this.reachRef.current.getBoundingClientRect().top : 0; this._ctT = ctT; this._rtT = rtT;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - sec.top) / (vh * 1.15)));
      { const g0 = Math.max(0, Math.min(1, ((this.rp ?? 1) - 0.8) / 0.2)), g = g0 * g0 * (3 - 2 * g0); this._ribG = g; }
      introS += (p * (this._ribG ?? 1) - introS) * 0.05; this._introS = introS;
      const p2 = Math.max(0, Math.min(1, (-sec.top - vh * 0.5) / (vh * 0.55 * (N - 1))));
      base = p2 * (N - 1) * STEP;
      if (p2 !== lastP2) {
        lastP2 = p2; clearTimeout(scrollSnapT);
        scrollSnapT = setTimeout(() => { if (!dragging && !this.state.page) snap(); }, 260);
      }
      if (Math.abs(p * (this._ribG ?? 1) - introS) < 0.0005) introS = p * (this._ribG ?? 1);
      common.uIntro.value = introS > 0.001 ? 1 : 0;
      { const bl = (1 - Math.min(1, introS)) * 16; host.style.filter = bl > 0.05 ? 'blur(' + bl.toFixed(1) + 'px)' : ''; const xo = Math.max(0, Math.min(1, ((this.rq || 0) - 0.36) / 0.18)), xoE = xo * xo * (3 - 2 * xo); host.style.opacity = String(Math.min(1, introS * 1.6) * (1 - xoE)); host.style.visibility = xoE > 0.999 ? 'hidden' : ''; if (xoE > 0.001 && xoE < 0.999) host.style.filter = 'blur(' + (xoE * 14).toFixed(1) + 'px)'; }
      {
        const Z = P.sectionZoom ?? 1;
        const io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const hr = this.heroRef.current, hin = hr && hr.firstElementChild;
        const cover = Math.max(0, Math.min(1, (vh - sec.top) / vh));
        this.zH = cover;
        const ch = this.zH, ce = io(ch) * Z;
        const rot = (P.sectionRotate ?? true);
        const FX = Math.max(0, P.astroFlight ?? 120) / 100; if (this.workRef.current && this._fx !== FX) { this._fx = FX; this.workRef.current.style.marginTop = 'calc(' + (-100 + FX * 100) + 'vh)'; }
        const rp0 = Math.max(0, Math.min(1, sY / (vh * (2.4 + FX))));
        this.rp = this.sceneTween('rp', rp0); window.__wbRP = this.rp; window.__wbRQ = this.rq || 0;
        
        const e = this.rp < 0.5 ? 4 * this.rp * this.rp * this.rp : 1 - Math.pow(-2 * this.rp + 2, 3) / 2;
        const bell = Math.sin(Math.PI * e);
        const active = rot && this.rp > 0.0004 && this.rp < 0.9996;
        const D = vh * 1.3, Pp = vh * 2.2, ANG = 38 * Z;
        const sst = (a0, b0, x) => { const k = Math.max(0, Math.min(1, (x - a0) / (b0 - a0))); return k * k * (3 - 2 * k); };
        const pre = 'perspective(' + Pp + 'px) translateZ(' + (-bell * vh * 0.55 * Z) + 'px) rotateY(' + (bell * 6 * Z) + 'deg) rotateZ(' + (-bell * 2 * Z) + 'deg) translateZ(' + (-D) + 'px) rotateX(';
        const post = 'deg) translateZ(' + D + 'px)';
        if (hr && hin) {
          hr.style.clipPath = '';
          hr.style.backfaceVisibility = 'hidden';
          // full-screen dissolve (no card): grainy noise mask eats the hero away, scroll-scrubbed both ways
          hr.style.transform = 'none';
          const HS = P.heroStart ?? 0.04; const dv = active ? sst(HS, HS + (P.heroSpan ?? 0.16) * 2, this.rp) : (this.rp >= 0.9996 && rot ? 1 : 0);
          hr.style.webkitMaskImage = ''; hr.style.maskImage = '';
          const bleedOn = (P.sectionBleed ?? true) && (P.transitionStyle || 'Stack') === 'Bleed';
          hr.style.filter = bleedOn ? '' : (dv > 0.001 && dv < 0.999 ? 'blur(' + (dv * 14).toFixed(1) + 'px)' : '');
          hr.style.opacity = String(bleedOn ? 1 - sst(HS + 0.38, HS + 0.54, this.rp) : 1 - sst(0.05, 0.85, dv));
          { const fr = this._hf || (this._hf = document.querySelector('[data-hero-front]')); if (fr) { fr.style.opacity = hr.style.opacity; fr.style.filter = hr.style.filter; }
            // ascend: the hero sinks away below you as you rise
            const hk = 1 - (+hr.style.opacity || 0), sk = window.__wbAscend && hk > 0.001 ? '0 ' + (hk * hk * vh * 0.6).toFixed(1) + 'px' : ''; if (hr.__sk !== sk) { hr.__sk = sk; hr.style.translate = sk; if (fr) fr.style.translate = sk; } }

          if (this.portrait) {
            const want = (P.hero3D ?? true) && !!ctaRect0 && ctaRect0.top < vh && ctaRect0.bottom > 0 && !this.state.page;
            if (want !== this.portraitOn) { this.portraitOn = want; this.portrait.renderer.setAnimationLoop(want ? this.portrait.frame : null); }
            this.portrait.renderer.domElement.style.display = (P.hero3D ?? true) ? 'block' : 'none';
          } else if ((P.hero3D ?? true) && !this.portraitLoading && !this.portraitFailed) { this.initPortrait(); }

          hr.style.visibility = rot && this.rp >= 0.9996 ? 'hidden' : (!rot && sec.top <= 0 ? 'hidden' : 'visible');
          hin.style.transform = 'none'; hin.style.opacity = '1'; hin.style.borderRadius = '0';
          const dim = this.heroDim || (this.heroDim = hin.querySelector('[data-hero-dim]'));
          if (dim) dim.style.opacity = '0';
          if (!rot) hin.style.transform = 'translate3d(0,' + (-ce * vh * 0.04) + 'px,0) scale(' + (1 - ce * 0.09) + ')';
        }
        const pnl = this.panelEl || (this.panelEl = this.workRef.current && this.workRef.current.querySelector('[data-panel]'));
        if (pnl) {
          pnl.style.backfaceVisibility = 'hidden';
          this.pnlOp = active ? sst(0.52, 0.94, e) : (rot && this.rp <= 0.0004 ? 0 : 1);

          const rr = rot ? (1 - e) * 28 : Math.max(0, Math.min(1, sec.top / (vh * 0.6))) * 32;
          pnl.style.borderRadius = rot ? rr + 'px' : rr + 'px ' + rr + 'px 0 0';
          pnl.style.boxShadow = 'none'; pnl.style.borderRadius = '0px';
          const pd = this.panelDim || (this.panelDim = pnl.querySelector('[data-panel-dim]'));
          if (pd) pd.style.opacity = String(rot ? (1 - e) * 0.7 : 0);
        }
        const we = Math.max(0, Math.min(1, (vh - sec.top) / vh));
        const wx = Math.max(0, Math.min(1, (vh - sec.bottom) / vh));
        this.zW = we; this.zX = wx;
        const ein = (1 - io(this.zW)) * ((P.sectionRotate ?? true) ? 0.2 : 0.55), eout = io(this.zX);
        if (rot) {
          const e2p = this.e2 || 0, b2p = Math.sin(Math.PI * e2p);
          const pitch = ((1 - e) * ANG - e2p * ANG) * Math.PI / 180;
          const dist = camD * (1 + (bell * 0.55 + b2p * 0.55) * Z);
          camera.position.set(0, 0.7 + Math.sin(pitch) * dist * 0.9, Math.cos(pitch) * dist);
          camera.lookAt(0, 0, 0);
          camera.rotateZ(((-bell * 2) + b2p * 2) * Z * Math.PI / 180);
        } else {
          camera.position.set(0, 0.7 + (ein * 2.2 - eout * 1.2) * Z, camD * (1 + (ein * 0.85 + eout * 0.7) * Z));
          camera.lookAt(0, ein * 0.4 * Z, 0);
        }
        const stk = this.hostRef.current && this.hostRef.current.parentElement;
        const cs = this.ctaRef.current, cpn = this.ctaPanel || (this.ctaPanel = cs && cs.querySelector('[data-cta-panel]'));
        const cct = this.ctaContent || (this.ctaContent = cs && cs.querySelector('[data-cta-content]'));
        let outOp = 1 - eout * 0.8;
        if (cs && cpn) {
          const ct = ctT;
          const q0 = Math.max(0, Math.min(1, (vh - ct) / (vh * 1.6)));
          this.rq = this.sceneTween('rq', q0); if (q0 === 0 && this.rq < 0.02) { this.rq = 0; if (this._tw && this._tw.rq) this._tw.rq.v = 0; }
          
          const e2 = this.rq < 0.5 ? 4 * this.rq * this.rq * this.rq : 1 - Math.pow(-2 * this.rq + 2, 3) / 2;
          const b2 = Math.sin(Math.PI * e2);
          const act2 = rot && this.rq > 0.0004 && this.rq < 0.9996;
          const pre2 = 'perspective(' + Pp + 'px) translateZ(' + (-b2 * vh * 0.55 * Z) + 'px) rotateY(' + (-b2 * 6 * Z) + 'deg) rotateZ(' + (b2 * 2 * Z) + 'deg) translateZ(' + (-D) + 'px) rotateX(';
          if (act2 && !this.state.page) {
            // focus pull: full-screen crossfade, Work drifts past the lens and defocuses, space pulls into focus — no edges, nothing cut off
            const k = e2, blurOK = !this.coarse;
            const inA = sst(0.22, 0.88, k), outA = 1 - sst(0.08, 0.72, k);
            const mp = k;
            if ((this.props.sectionFx || 'Smoke') === 'Globe') {
              // globe orbit: both sections sit on a sphere behind the screen; scrolling orbits from one face to the next
              const gR = this.props.globeRadius ?? 1.4, th = 2 * Math.atan(0.5 / gR) * (this.props.globeGap ?? 1), Rg = vh * gR, lift = Math.sin(Math.PI * k) * vh * (this.props.globePull ?? 0.25), /* faces' edges meet: angle follows the radius */ P0 = Math.max(innerWidth, vh) * 1.6;
              const face = (a) => 'perspective(' + P0.toFixed(0) + 'px) translateZ(' + (-Rg - lift).toFixed(1) + 'px) rotateX(' + a.toFixed(4) + 'rad) translateZ(' + Rg.toFixed(1) + 'px)';
              this._tgP = -1; const host = this.hostRef.current;
              if (stk) { stk.style.transformOrigin = '50% 50%'; stk.style.backfaceVisibility = 'hidden'; stk.style.transform = face(th * k); stk.style.filter = ''; stk.style.opacity = k > 0.98 ? '0' : ''; }
              cpn.style.opacity = k < 0.02 ? '0' : '1'; cpn.style.clipPath = ''; this.smokeMask(cpn, 1); cpn.style.backfaceVisibility = 'hidden'; const offC = Math.max(0, ct), offW = stk ? Math.min(0, (stk.parentElement.getBoundingClientRect().bottom - vh)) : 0; // cancel natural scroll so both faces stay pinned to the viewport
              cpn.style.transform = 'translateY(' + (-offC).toFixed(1) + 'px) ' + face(-th * (1 - k)); cpn.style.filter = '';
              if (stk && offW) stk.style.transform = 'translateY(' + (-offW).toFixed(1) + 'px) ' + face(th * k);
              if (cct) cct.style.transform = 'none'; this._gbDirty = 1;
            } else if ((this.props.sectionFx || 'Smoke') === 'Tangent blur') {
              // gl-transitions "tangentMotionBlur" (chenkai, MIT): outgoing swings away around the bottom-right corner, incoming swings in; blur peaks mid-way
              const tg = this.tangentFx(this.rq), W2 = innerWidth / 2, H2 = vh / 2, rot0 = (a) => 'translate(' + W2 + 'px,' + H2 + 'px) rotate(' + a.toFixed(4) + 'rad) translate(' + (-W2) + 'px,' + (-H2) + 'px)';
              const bl = 'blur(' + (tg.blur * (this.props.sectionFxBlur ?? 14) * (blurOK ? 1 : 0.5)).toFixed(2) + 'px)', host = this.hostRef.current;
              // outgoing half: the real GLSL shader runs on the slider's WebGL frame (see tick); DOM overlays on the panel fade out
              this._tgP = tg.out ? this.rq : -1; this._tgDirty = 1;
              if (stk) { stk.style.transform = ''; stk.style.filter = ''; for (const ch of stk.children) if (ch !== host) ch.style.opacity = tg.out ? Math.max(0, 1 - this.rq * 6).toFixed(3) : '0'; }
              if (tg.out) cpn.style.opacity = '0';
              else { cpn.style.opacity = '1'; cpn.style.clipPath = ''; this.smokeMask(cpn, 1); cpn.style.transform = rot0(tg.r); cpn.style.filter = bl; }
              if (cct) cct.style.transform = 'none';
            } else {
            cpn.style.opacity = '1'; cpn.style.transform = 'none'; cpn.style.clipPath = ''; cpn.style.filter = '';
            this.smokeMask(cpn, mp);
            if (cct) cct.style.transform = 'translate3d(0,' + ((1 - k) * 5).toFixed(3) + 'vh,0) scale(' + (1.06 - 0.06 * k).toFixed(4) + ')';
            if (stk) { stk.style.transform = 'scale(' + (1 + 0.05 * k).toFixed(4) + ')'; stk.style.filter = ''; }
            }
            this.ctaTilt = 0; this.ctaZoom = (1 - k) * 0.55; this.e2 = e2;
            outOp = mp > 0.995 ? 0 : 1;
          } else {
            this.smokeMask(cpn, 0); cpn.style.clipPath = ''; cpn.style.filter = ''; this._tgP = -1; if (stk) { stk.style.transform = ''; stk.style.filter = ''; if (this._gbDirty) { stk.style.opacity = ''; this._gbDirty = 0; } if (this._tgDirty !== 0) { const host = this.hostRef.current; for (const ch of stk.children) if (ch !== host) ch.style.opacity = ''; this._tgDirty = 0; } }
            cpn.style.transform = 'none'; if (cct) cct.style.transform = 'none';
            cpn.style.opacity = (rot && this.rq <= 0.0004) ? '0' : '1';
            this.ctaTilt = 0; this.ctaZoom = 0; this.e2 = this.rq >= 0.9996 ? 1 : 0;
            if (rot && this.rq >= 0.9996) outOp = 0;
          }
        }
        if (cs) { const h3 = this._h3 || (this._h3 = cs.querySelector('[data-hero3]')), ab = this._ab || (this._ab = cs.querySelector('[data-about]'));
          if (h3) { const into = -ctaRect0.top / vh, pc = Math.max(0, Math.min(1, (into - 3.4) / 1.8)), ec = pc * pc * (3 - 2 * pc);
            if (h3.style.transform) h3.style.transform = '';
            // About first, then Services: ra = About→Services handover
            this.ra = this.sceneTween('ra', Math.max(0, Math.min(1, (into - 2.2) / 1.2))); window.__wbRA = this.ra;
            const ka = this.ra; h3.style.opacity = String(sst(0.4, 0.8, ka)); this._svcOn = ka > 0.95;
            if (ab) { ab.style.opacity = String(1 - sst(0.0, 0.5, ka)); ab.style.pointerEvents = ka < 0.5 ? 'auto' : 'none'; const inMon = (this._monZoom || 0) > 0.5; if (ab.__bg0 == null) { ab.__bg0 = ab.style.backgroundColor; ab.__bi0 = ab.style.backgroundImage; ab.__inMon = false; } if (ab.__inMon !== inMon) { ab.__inMon = inMon; ab.style.backgroundColor = inMon ? 'transparent' : ab.__bg0; ab.style.backgroundImage = inMon ? 'none' : ab.__bi0; } } } }
        if (stk) { stk.style.opacity = String((this.pnlOp ?? 1) * (rot ? outOp : (1 - eout * 0.8))); const po = this.pnlOp ?? 1, tr = false && window.__wbAscend && po < 0.999 ? '0 ' + (-(1 - (1 - Math.pow(1 - po, 3))) * vh * 0.5).toFixed(1) + 'px' : ''; if (stk.__atr !== tr) { stk.__atr = tr; stk.style.translate = tr; } }
        const rs = this.reachRef.current, rpn = this.reachPanel || (this.reachPanel = rs && rs.querySelector('[data-reach-panel]'));
        const rct = this.reachContent || (this.reachContent = rs && rs.querySelector('[data-reach-content]'));
        if (rs && rpn && cs && cpn) {
          const rt = rtT;
          const q0 = Math.max(0, Math.min(1, (vh - rt) / (vh * 2.4)));
          this.r3 = this.sceneTween('r3', q0); if (q0 === 0 && this.r3 < 0.02) { this.r3 = 0; if (this._tw && this._tw.r3) this._tw.r3.v = 0; }
          
          const e3 = this.r3 < 0.5 ? 4 * this.r3 * this.r3 * this.r3 : 1 - Math.pow(-2 * this.r3 + 2, 3) / 2;
          const b3 = Math.sin(Math.PI * e3);
          const act3 = this.r3 > 0.0004 && this.r3 < 0.9996;
          const pre3 = 'perspective(' + Pp + 'px) translateZ(' + (-b3 * vh * 0.55 * Z) + 'px) rotateY(' + (b3 * 6 * Z) + 'deg) rotateZ(' + (-b3 * 2 * Z) + 'deg) translateZ(' + (-D) + 'px) rotateX(';
          if (act3 && rot) {
            cpn.style.opacity = String(1 - sst(0.06, 0.48, e3));
            if (cct) cct.style.transform = pre3 + (ANG * e3) + post;
            this.ctaTilt = -e3; this.ctaZoom = b3;
            rpn.style.opacity = '1'; this.smokeMask(rpn, e3);
            if (rct) rct.style.transform = 'none';
            this.rayTilt = 1 - e3; this.rayZoom = b3;
          } else {
            rpn.style.transform = 'none'; if (rct) rct.style.transform = 'none'; this.smokeMask(rpn, 0);
            rpn.style.opacity = (!rot || this.r3 >= 0.9996) ? '1' : '0';
            if (rot && this.r3 >= 0.9996) cpn.style.opacity = '0';
            this.rayTilt = 0; this.rayZoom = 0;
          }
        }
        {
          const op = (el) => { const v = el && el.style.opacity; return v === '' || v == null ? 1 : +v; };
          if (pnl) { const inWork = (this.rp || 0) > 0.6 && (this.rq || 0) < 0.15; pnl.style.pointerEvents = inWork || op(stk) * (this.pnlOp ?? 1) > 0.5 ? '' : 'none'; }
          if (cpn) cpn.style.pointerEvents = op(cpn) > 0.5 ? '' : 'none';
          if (rpn) rpn.style.pointerEvents = op(rpn) > 0.5 ? '' : 'none';
        }
      }
      const sy = Math.max(0, Math.min(sY, vh));
      if (this.headlineRef.current) {
        this.headlineRef.current.style.transform = `translate3d(0, calc(-50% - ${sy * 0.06}px), 0)`;
      }
      if (this.portraitRef.current) this.portraitRef.current.style.transform = `translate3d(0, ${sy * 0.15}px, 0) scale(${1 + sy / vh * 0.08})`;
      if (this.uiRef.current) this.uiRef.current.style.opacity = String(Math.max(0, Math.min(1, (introS - 0.75) / 0.25)) * (1 - Math.max(0, Math.min(1, this.openT * 3))));

      common.uCurve.value = P.curvature ?? 0.18;
      { const lay = P.workLayout || 'Ribbon', weaveOn = lay === 'Weave' ? 1 : 0; common.uWeave.value += (weaveOn - common.uWeave.value) * 0.08; if (Math.abs(weaveOn - common.uWeave.value) < 0.001) common.uWeave.value = weaveOn; common.uWeaveP.value.z = P.weaveDepth ?? 0.9; common.uWeaveY.value = P.weaveDrop ?? 0.55;
        const ringOn = lay === 'Ring' ? 1 : 0; common.uRing.value += (ringOn - common.uRing.value) * 0.08; if (Math.abs(ringOn - common.uRing.value) < 0.001) common.uRing.value = ringOn;
        common.uRingR.value = LEN / (2 * Math.PI); common.uRingT.value.set(P.ringTiltX ?? 0.38, P.ringTiltZ ?? 0.26);
        cards.forEach((c) => { c.rmesh.visible = common.uRing.value < 0.5 && common.uWeave.value < 0.5; }); { const early = introS <= 0.001 && (this.rp || 0) > 0.2 && !(this.rq > 0); placeWord(common.uRing.value, (introS > 0.001 || early) ? 1 : 0, common.uWeave.value); if (early) LET.forEach((L) => { L.m.visible = false; }); } }
      common.uRadius.value = P.cornerRadius ?? 0.11;
      common.uTime.value = performance.now() / 1000;
      common.uHoverAmt.value = P.hoverDistortion ?? 1.7;
      setRibbon((P.ribbonTilt ?? 0.6) * (camera.aspect < 0.8 ? 1.25 : 1));
      const hit = pickCard();
      this.cardHover = !!hit;
      {
        const g = this.gooRef.current;
        if (g) {
          const G = this.goo || (this.goo = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ls: 0, vx: 0, vy: 0, init: false });
          const show = !!hit && !dragging && !this.state.page && (P.viewCursor ?? true);
          if (mouse) {
            if (!G.init) { G.x = G.tx = mouse.x; G.y = G.ty = mouse.y; G.init = true; }
            const nx = G.x + (mouse.x - G.x) * 0.12, ny = G.y + (mouse.y - G.y) * 0.12;
            G.vx += ((nx - G.x) - G.vx) * 0.15; G.vy += ((ny - G.y) - G.vy) * 0.15; G.x = nx; G.y = ny;
            G.tx += (G.x - G.tx) * 0.1; G.ty += (G.y - G.ty) * 0.1;
          }
          G.s += ((show ? 1 : 0) - G.s) * (show ? 0.09 : 0.12);
          G.ls += ((show && G.s > 0.7 ? 1 : 0) - G.ls) * 0.12;
          g.style.transform = 'translate3d(' + G.x + 'px,' + G.y + 'px,0)';
          const sp = Math.min(Math.hypot(G.vx, G.vy) / 40, 0.25), ang = Math.atan2(G.vy, G.vx);
          const a = g.querySelector('[data-goo-a]'), b = g.querySelector('[data-goo-b]'), l = g.querySelector('[data-goo-label]');
          if (a) a.style.transform = 'rotate(' + ang + 'rad) scale(' + (G.s * (1 + sp)) + ',' + (G.s * (1 - sp * 0.5)) + ')';
          if (b) b.style.transform = 'translate3d(' + (G.tx - G.x) + 'px,' + (G.ty - G.y) + 'px,0) scale(' + (G.s * 0.95) + ')';
          if (l) { l.style.opacity = String(G.ls); l.style.transform = 'translate3d(0,' + (1 - G.ls) * 6 + 'px,0)'; }
        }
      }
      host.style.cursor = (P.customCursor ?? true) ? 'none' : (dragging ? 'grabbing' : (hit ? 'pointer' : 'grab'));
      {
        const now = performance.now();
        const dt = Math.min(0.05, (now - (this.lastT || now)) / 1000); this.lastT = now;
        const S = this.anim;
        if (S) {
          const steps = Math.max(1, Math.ceil(dt * 240)), h = dt / steps;
          for (let s = 0; s < steps; s++) {
            const acc = -S.k * (this.openT - S.to) - S.c * this.openV;
            this.openV += acc * h; this.openT += this.openV * h;
          }
          if (Math.abs(this.openT - S.to) < 0.0008 && Math.abs(this.openV) < 0.012) {
            this.openT = S.to; this.openV = 0; this.anim = null; S.done && S.done();
          }
        }
      }
      {
        const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
        const pgEl = this.pageRef.current, o = this.openT, now = performance.now();
        const ready = !!(this.state.page && this.state.page.src);
        const want = ready && !this.closing && o > 0.97 && Math.abs(this.openV) < 0.5 ? 1 : 0;
        this.visK = (this.visK || 0) + (want - (this.visK || 0)) * (want ? 0.16 : 0.32);
        if (want && !this.revealStart) this.revealStart = now;
        if (pgEl) {
          pgEl.style.opacity = String(this.visK);
          pgEl.style.pointerEvents = (want && this.visK > 0.9) ? 'auto' : 'none';
          pgEl.querySelectorAll('[data-rv]').forEach((el, j) => {
            const t = this.revealStart ? Math.max(0, Math.min(1, (now - this.revealStart - 80 - j * 75) / 1100)) : 0;
            const e = 1 - Math.pow(1 - t, 4);
            el.style.transform = `translate3d(0, ${(1 - e) * 110}%, 0) rotate(${(1 - e) * 5}deg)`;
            el.style.opacity = String(Math.min(1, t * 2.5));
          });
          const vd = pgEl.querySelector('video');
          if (vd && vd.dataset.src && vd.getAttribute('src') !== vd.dataset.src && vd.dataset.src.indexOf('{{') < 0) { vd.src = vd.dataset.src; vd.play && vd.play().catch(() => {}); }
          if (vd) { const vk0 = +(vd.dataset.k || 0); const vk = vk0 + (((want && vd.readyState >= 2) ? 1 : 0) - vk0) * 0.06; vd.dataset.k = vk; vd.style.opacity = String(vk); }
        }
        if (this.closeRef.current) this.closeRef.current.style.opacity = String(this.visK);
        this.updateReveals && this.updateReveals(pgEl, now);
        if (this.chromeRef.current) this.chromeRef.current.style.opacity = String(1 - Math.max(0, Math.min(1, (this.openT || 0) * 1.5)));
        this.ss = ss;
      }
      cards.forEach((c) => {
        const u = c.mesh.material.uniforms, sel = c.i === this.openI;
        const oc = Math.max(0, Math.min(1, this.openT));
        u.uOpen.value = sel ? this.openT : 0;
        u.uOV.value = sel ? Math.max(-1.5, Math.min(1.5, this.openV / 3)) : 0;
        u.uPS.value = sel ? (this.pgPS || 0) : 0; u.uPV.value = sel ? (this.pgPV || 0) : 0;
        if (sel) u.uClick.value.set(this.clickUV[0], this.clickUV[1]);
        u.uDim.value = sel ? 0 : oc;
        c.mesh.renderOrder = sel ? 10 : 1;
        c.rmesh.visible = !(sel && this.openT > 0.002) && (P.reflections ?? true);
        reflAmt.value = P.reflectionStrength ?? 0.1;
        if (sel && c.video && c.cleanCv && this.openT > 0) drawClean(c);
      });
      cards.forEach((c) => {
        const on = hit && hit.card === c;
        c.h += ((on ? 1 : 0) - c.h) * 0.07;
        if (on) {
          const px = c.m.x, py = c.m.y;
          c.m.x += (hit.u - c.m.x) * 0.18; c.m.y += (hit.v - c.m.y) * 0.18;
          c.mv.x += ((c.m.x - px) - c.mv.x) * 0.2; c.mv.y += ((c.m.y - py) - c.mv.y) * 0.2;
        } else c.mv.multiplyScalar(0.9);
        const u = c.mesh.material.uniforms;
        u.uHover.value = c.h * (1 - Math.max(0, Math.min(1, this.openT))); u.uMouse.value.copy(c.m); u.uMVel.value.copy(c.mv);
      });
      target = base + dragOff;
      cur += (target - cur) * (this.coarse ? 0.12 : 0.075);
      const v = cur - prev; prev = cur;
      vel += (v * 6 * (P.velocityBend ?? 1.4) - vel) * 0.12;
      common.uVel.value = Math.max(-1.6, Math.min(1.6, vel));
      const onScreen = sec.top < vh && sec.bottom > 0 && introS > 0.001;
      cards.forEach((c, i) => {
        let x = i * STEP - cur;
        x = ((x + LEN / 2) % LEN + LEN) % LEN - LEN / 2;
        c.mesh.position.x = x; c.rmesh.position.x = x;
        if (c.ro0 == null) c.ro0 = c.mesh.renderOrder;
        // ring: far half draws first, then the word, then the near half → cards wrap around the word
        c.mesh.renderOrder = common.uRing.value > 0.5 ? (Math.cos(x / (LEN / (2 * Math.PI))) < 0 ? 2 : 8) : c.ro0;
        const iu = (c.p.cover || P['image' + (i + 1)] || '').trim();
        const vu = (c.p.videoUrl != null ? c.p.videoUrl : (P['video' + (i + 1)] ?? (i === 1 ? 'https://threejs.org/examples/textures/sintel.mp4' : ''))).trim();
        const key = iu + '|' + vu;
        if (key !== c.url) loadMedia(c, key, iu, vu);
        if (onScreen && c.video && c.video.readyState >= 2 && Math.abs(x) < 9) {
          this.drawCover(c.ctx, cw, ch, c.p, c.i, c.video, true); c.tex.needsUpdate = true;
        }
      });
      grid.visible = P.showGrid ?? false;
      curved.visible = P.curvedGrid ?? true; if (curved.visible) { const cu = curved.material.uniforms; cu.uOff.value = cur * (P.curvedGridParallax ?? 0.35); cu.uOp.value = P.curvedGridOpacity ?? 0.22; cu.uCells.value = P.curvedGridCells ?? 64; curved.position.set(camera.position.x, 0, camera.position.z - CR * 0.62); }
      grid.material.uniforms.uOffset.value = cur;
      const a = ((Math.round(cur / STEP) % N) + N) % N;
      if (a !== this.state.active) this.setState({ active: a });
      if (this._astroFrame) this._astroFrame();
      if (this.transitionPass) this.transitionPass();
      if (onScreen && (this._tgP ?? -1) >= 0 && (this.props.sectionFx || 'Tangent blur') === 'Tangent blur') {
        if (!this._tgQ) { const T = THREE, rt = new T.WebGLRenderTarget(4, 4), mat = new T.ShaderMaterial({ uniforms: { tFrom: { value: rt.texture }, progress: { value: 0 }, ratio: { value: 1 } }, transparent: true, depthTest: false, depthWrite: false,
            vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
            fragmentShader: `uniform sampler2D tFrom; uniform float progress, ratio; varying vec2 vUv;
              float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
              vec4 getFromColor(vec2 uv){ if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0); return texture2D(tFrom, uv); }
              vec4 motionBlurFrom(vec2 st, vec2 speed){ vec4 c = vec4(0.0); float total = 0.0, off = rand(st); for (float t = 0.0; t <= 20.0; t++) { float pc = (t + off) / 20.0, w = 4.0 * (pc - pc * pc); c += getFromColor(st + speed * pc) * w; total += w; } return c / total; }
              float A(float a1,float a2){return 1.0-3.0*a2+3.0*a1;} float B(float a1,float a2){return 3.0*a2-6.0*a1;} float C(float a1){return 3.0*a1;}
              float slope(float t,float a1,float a2){return 3.0*A(a1,a2)*t*t+2.0*B(a1,a2)*t+C(a1);} float bez(float t,float a1,float a2){return ((A(a1,a2)*t+B(a1,a2))*t+C(a1))*t;}
              float tForX(float x,float m1,float m2){ float g=x; for(int i=0;i<4;++i){ float s=slope(g,m1,m2); if(s==0.0) return g; g-=(bez(g,m1,m2)-x)/s; } return g; }
              float keySpline(float x,float m1,float n1,float m2,float n2){ return bez(tForX(x,m1,m2),n1,n2); }
              float normpdf(float x){ float d=x-0.5; return exp(-20.0*d*d); }
              vec2 rotateUv(vec2 uv,float a,vec2 an){ uv-=an; float s=sin(a), c=cos(a); uv=mat2(c,-s,s,c)*uv; return uv+an; }
              void main(){ float e = keySpline(progress,0.68,0.01,0.17,0.98), blur = normpdf(e), rot = 3.14159, ti = 0.0334;
                vec2 a = vUv; a.y /= ratio; a = rotateUv(a, rot * e, vec2(1.0, 0.0)); a.y *= ratio;
                vec2 b = vUv; b.y /= ratio; b = rotateUv(b, rot * (e + ti), vec2(1.0, 0.0)); b.y *= ratio;
                gl_FragColor = motionBlurFrom(a, (b - a) / ti * blur * 0.5); }` });
          const qs = new T.Scene(), qc = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); qs.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat)); this._tgQ = { rt, mat, qs, qc }; }
        const Q = this._tgQ, sz = renderer.getDrawingBufferSize(new THREE.Vector2()); sz.multiplyScalar(0.5).floor(); if (Q.rt.width !== sz.x || Q.rt.height !== sz.y) Q.rt.setSize(sz.x, sz.y); // half-res: blurred anyway, quarter the GPU memory
        Q.mat.uniforms.progress.value = this._tgP; Q.mat.uniforms.ratio.value = sz.x / sz.y;
        renderer.setRenderTarget(Q.rt); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null); renderer.clear(); renderer.render(Q.qs, Q.qc);
      } else if (onScreen) renderer.render(scene, camera);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);

    this.cleanup = () => {
      this.mainTickRunning = false;
      ro.disconnect(); clearTimeout(snapT);
      window.removeEventListener('keydown', onKey);
      host.removeEventListener('wheel', onWheel);
      cards.forEach(c => { if (c.video) c.video.pause(); c.tex.dispose(); c.mesh.material.dispose(); });
      geo.dispose(); renderer.dispose(); try { r.forceContextLoss(); } catch (e) {}
      renderer.domElement.remove();
    };
  },
  drawCover(ctx, w, h, p, i, img, noTitle) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, w, h);
    let titleColor = p.ink, btnBg = p.ink, btnFg = p.bg;
    if (img) {
      const mw = img.videoWidth || img.naturalWidth || img.width, mh = img.videoHeight || img.naturalHeight || img.height;
      const s = Math.max(w / mw, h / mh);
      ctx.drawImage(img, (w - mw * s) / 2, (h - mh * s) / 2, mw * s, mh * s);
      if (noTitle) return;
      const g = ctx.createLinearGradient(0, h * 0.55, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      titleColor = '#ffffff'; btnBg = '#111111'; btnFg = '#ffffff';
    } else {
      const words = p.mark.split(' ');
      const L = i % 3;
      ctx.fillStyle = p.ink;
      if (L === 0) {
        ctx.font = '700 250px Oswald';
        words.forEach((wd, k) => ctx.fillText(wd, 64, 330 + k * 225));
        ctx.fillStyle = p.accent; ctx.fillRect(w - 520, 140, 420, 520);
        ctx.fillStyle = p.bg;
        for (let k = 0; k < 9; k++) ctx.fillRect(w - 520, 170 + k * 56, 420, 10);
      } else if (L === 1) {
        ctx.fillStyle = p.accent;
        ctx.beginPath(); ctx.arc(w * 0.66, h * 0.44, 300, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.ink; ctx.font = '700 300px Oswald';
        ctx.fillText(words[0], 64, 360);
        if (words[1]) ctx.fillText(words[1], 64, 640);
      } else {
        ctx.font = '700 220px Oswald';
        ctx.fillText(words.join(''), 64, 300);
        const cols = 4, gw = (w - 128 - 3 * 20) / cols;
        for (let k = 0; k < cols; k++) {
          const x = 64 + k * (gw + 20);
          ctx.fillStyle = k === 1 ? p.accent : 'rgba(255,255,255,0.06)';
          ctx.fillRect(x, 360, gw, 380);
          ctx.strokeStyle = p.ink; ctx.globalAlpha = 0.35; ctx.lineWidth = 2; ctx.strokeRect(x + 1, 361, gw - 2, 378); ctx.globalAlpha = 1;
        }
      }
      if (noTitle) return;
      ctx.fillStyle = p.ink; ctx.globalAlpha = 0.7;
      ctx.font = '400 26px "JetBrains Mono"';
      ctx.fillText(String(i + 1).padStart(2, '0') + ' — ' + p.year, 64, 76);
      ctx.textAlign = 'right'; ctx.fillText(p.type.toUpperCase(), w - 64, 76); ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = titleColor; ctx.font = '500 64px Oswald';
    ctx.fillText(p.title, 64, h - 76);
    const cx = w - 120, cy = h - 98;
    ctx.fillStyle = btnBg; ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = btnFg; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 16, cy); ctx.lineTo(cx + 16, cy); ctx.moveTo(cx + 4, cy - 12); ctx.lineTo(cx + 16, cy); ctx.lineTo(cx + 4, cy + 12); ctx.stroke();
  }
});
(window.WBL = window.WBL || {}).ribbon = 1;
