/* Wubble V22: About — floating 3D CRT monitor (models/crt_monitor.glb) with the about text typed on its screen.
   The screen is a UV rect on the body texture; a shader swaps it for a live canvas (typewriter + scanlines + glow). */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  initAboutCRT() {
    const ab = document.querySelector('[data-about]'), glass = ab && ab.querySelector('[data-about-glass]'); if (!ab || !glass || ab.__crt3d) return; ab.__crt3d = 1;
    const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;'; { const sh = document.querySelector('[data-space-host]'); if (sh) sh.after(host); else ab.appendChild(host); }
    // galaxy backdrop: mirror the site's space canvas (same nebula + stars) behind the floating monitor
    const gal = document.createElement('canvas'), gg = gal.getContext('2d'); gal.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(gal); { const AT = document.querySelector('[data-about-title]'); if (AT) host.appendChild(AT); } /* ABOUT title: between galaxy and monitor */
    const prompt = (glass.querySelector('div') || {}).textContent || 'wubble@studio:~$ cat about.txt';
    const body = (() => { const el = glass.querySelector('[data-scrub-text]'); if (!el) return ''; const cl = el.cloneNode(true); cl.querySelectorAll('br').forEach((b) => b.replaceWith(' \u2029 ')); return cl.textContent.replace(/[ \t\r\n]+/g, ' ').replace(/(\u2029 ?)+/g, '\u2029 ').trim(); })(); // \u2029 = paragraph break
    let S = null, booting = false, S_scr = null, S_glass = null;
    /* r14.28: 'Glass' (default, test) = one liquid-glass slab with the terminal inside; ?about=frame|crt to compare */
    const MODE = (({ frame: 'Frame', crt: 'CRT', glass: 'Glass' })[(new URLSearchParams(location.search).get('about') || '').toLowerCase()]) || 'Glass'; /* test: ignores the old aboutMonitorModel default */
    const DESK = MODE === 'Glass' && (!!window.__wbAboutDesk || /[?&]about=desk/i.test(location.search)); /* r23 test: retro desk scene */ const GLASS = MODE === 'Glass', FRAME = MODE === 'Frame' || GLASS; let TW = 640; const TH = FRAME ? 427 : 600, tc = document.createElement('canvas'); /* r14.32 glass: canvas as wide as the screen; the text column stays 640 wide in the middle and the plane crops it to the glass's current aspect */ const fitTW = () => { if (GLASS) TW = Math.max(640, Math.ceil(TH * Math.max(1.5, innerWidth / Math.max(1, innerHeight)) * 1.04)); }; fitTW(); tc.width = TW; tc.height = TH; const tg = tc.getContext('2d');
    if (GLASS && !document.getElementById('wb-vt323')) { const l = document.createElement('link'); l.id = 'wb-vt323'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap'; document.head.appendChild(l);
      const re = () => { try { if (S) { draw(Math.floor(S.n), true); S.tex.needsUpdate = true; } } catch (e) {} }; (document.fonts ? document.fonts.load('24px "VT323"') : Promise.resolve()).then(re, re); setTimeout(re, 1500); }
    /* r14.51: a real terminal session — commands are typed, output prints, and the history scrolls up as it fills */
    const PS1 = ((prompt.split('$')[0] || 'wubble@studio:~').trim()) + '$ ';
    const SES = (() => { const paras = body.split('\u2029').map((s) => s.trim()).filter(Boolean), svc = [...new Set([...document.querySelectorAll('ul[data-cg] li')].map((li) => li.textContent.trim().toLowerCase()).filter(Boolean))];
      const ev = [{ c: 'whoami' }, { o: ['wubble'] }, { c: 'cat about.txt' }, { o: paras }]; if (svc.length) ev.push({ c: 'ls services/' }, { o: [svc.join('   ')] });
      let total = 0; ev.forEach((e) => { e.cost = e.c != null ? 4 + e.c.length * 2.6 + 9 : 16; total += e.cost; }); return { ev, total }; })();
    const TOT = () => (GLASS ? SES.total : body.length); let scrY = 0, scrT = 0;
    const drawG = (n, cur) => {
      tg.fillStyle = '#030303'; tg.fillRect(0, 0, TW, TH);
      const MONO = '"VT323", ui-monospace, monospace', fs = +(this.props.aboutFontSize ?? 26) || 26, lh = Math.round(fs * 1.22), pad = Math.round(TH * (this.props.aboutTextLeft ?? 0.11)), padY = Math.round(TH * (this.props.aboutTextPadY ?? 0.2)), CWg = Math.min(TW - pad * 2, Math.round(TH * 1.45));
      tg.font = '400 ' + fs + 'px ' + MONO; tg.textBaseline = 'top';
      const wrap = (s) => { const out = []; let ln = ''; for (const w of s.split(' ')) { if (!w) continue; const t2 = ln ? ln + ' ' + w : w; if (tg.measureText(t2).width > CWg && ln) { out.push(ln); ln = w; } else ln = t2; } out.push(ln); return out; };
      const L = []; let u = 0, curAt = -1;
      for (const ev of SES.ev) { if (n < u) break;
        if (ev.c != null) { const k = Math.max(0, Math.min(ev.c.length, Math.floor((n - u - 4) / 2.6))); L.push({ t: PS1 + ev.c.slice(0, k), h: lh }); curAt = L.length - 1; }
        else { ev.o.forEach((p, i) => { if (i) L.push({ t: '', h: lh * 0.45 }); wrap(p).forEach((x) => L.push({ t: x, h: lh })); }); L.push({ t: '', h: lh * 0.45 }); curAt = -1; }
        u += ev.cost; }
      const done = n >= SES.total;
      if (done) { L.push({ t: PS1, h: lh }); curAt = L.length - 1; const bk = S_glass && S_glass.bk, k = bk ? bk.n : 0, mx = bk ? bk.max : 5, tap = matchMedia('(pointer: coarse)').matches ? 'tap' : 'click';
        L.push({ t: bk && bk.freed ? '> he is free.' : '> ' + tap + ' the glass to set him free  [' + '#'.repeat(k) + '.'.repeat(Math.max(0, mx - k)) + ']', h: lh, dim: 1 }); }
      let Hc = 0; L.forEach((l) => { l.y = Hc; Hc += l.h; }); const avail = TH - padY * 2; scrT = Math.max(0, Hc - avail); if (n < 3 || scrY > scrT + 1) scrY = scrT;
      tg.save(); tg.beginPath(); tg.rect(0, padY - lh, TW, avail + lh); tg.clip(); tg.shadowColor = 'rgba(255,255,255,0.65)'; tg.shadowBlur = 6; tg.fillStyle = '#f4f4f4';
      L.forEach((l, i) => { const y = padY + l.y - scrY; if (y < padY - lh * 1.5 || y > TH) return; tg.globalAlpha = l.dim ? 0.72 : 1; if (l.t) tg.fillText(l.t, pad, y);
        if (i === curAt && (cur || !done)) { tg.globalAlpha = 1; tg.fillRect(pad + tg.measureText(l.t).width + 2, y + 1, fs * 0.5, fs * 0.92); } });
      tg.restore(); tg.globalAlpha = 1; tg.shadowBlur = 0;
      const fg = tg.createLinearGradient(0, padY - lh, 0, padY + lh * 0.6); fg.addColorStop(0, 'rgba(3,3,3,1)'); fg.addColorStop(1, 'rgba(3,3,3,0)'); tg.fillStyle = fg; tg.fillRect(0, padY - lh, TW, lh * 1.6);
    };
    const draw = (n, cur) => {
      if (GLASS) return drawG(n, cur);
      const CW = 640, ox = GLASS ? 0 : (TW - CW) / 2; /* r14.40: text starts at the left, like a real terminal */
      tg.fillStyle = '#050505'; tg.fillRect(0, 0, TW, TH);
      const vg = tg.createRadialGradient(TW / 2, TH / 2, TH * 0.1, TW / 2, TH / 2, TH * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); tg.fillStyle = vg; tg.fillRect(0, 0, TW, TH);
      // CRT phosphor: grey glass lit from within, soft-glowing pale text, dark vignette
      { const bg = tg.createRadialGradient(TW / 2, TH * 0.45, TH * 0.05, TW / 2, TH / 2, TW * 0.62); if (GLASS) { bg.addColorStop(0, '#1a1c1b'); bg.addColorStop(0.55, '#0f1110'); bg.addColorStop(1, '#040505'); } else { bg.addColorStop(0, '#3a3e3c'); bg.addColorStop(0.55, '#262928'); bg.addColorStop(1, '#0c0d0d'); } /* r14.50: darker glass terminal */ tg.fillStyle = bg; tg.fillRect(0, 0, TW, TH); }
      const MONO = GLASS ? '"VT323", "JetBrains Mono", ui-monospace, monospace' : '"JetBrains Mono", ui-monospace, Menlo, monospace', pad = GLASS ? Math.round(TH * (this.props.aboutTextLeft ?? 0.11)) : this.props.aboutScreenPadX ?? 66, padY = GLASS ? Math.round(TH * (this.props.aboutTextPadY ?? 0.2)) : this.props.aboutScreenPadY ?? 60; /* r14.41 glass: aligned with the logo on the left; clear of the fixed header/footer items */ tg.textBaseline = 'top';
      // safe area = the part of the screen the bezel doesn't cover; shrink the font until the whole text (prompt + body) fits inside it
      const fitN = (f) => { tg.font = (GLASS ? '400 ' : '500 ') + f + 'px ' + MONO; let n2 = 1, l2 = ''; for (const w of body.split(' ')) { if (w === '\u2029') { n2 += 2; l2 = ''; continue; } const t = l2 ? l2 + ' ' + w : w; if (tg.measureText(t).width > CW - pad * 2 && l2) { n2++; l2 = w; } else l2 = t; } return n2; };
      let fs = +(this.props.aboutFontSize ?? (GLASS ? 24 : 23)) || 23; /* VT323 runs small: 24 ≈ the old 17 */ /* r14.46: smaller terminal type in the glass */ { const avail = TH - padY * 2; for (let g = 0; g < 12 && fs > 12 && Math.round(fs * 1.42) * (1.6 + fitN(fs)) > avail; g++) fs -= 1; } const lh = Math.round(fs * 1.42); tg.font = (GLASS ? '400 ' : '500 ') + fs + 'px ' + MONO;
      tg.shadowColor = 'rgba(225,245,235,0.55)'; tg.shadowBlur = 7;
      let fullN = 1; { let l2 = ''; for (const w of body.split(' ')) { if (w === '\u2029') { fullN += 2; l2 = ''; continue; } const t = l2 ? l2 + ' ' + w : w; if (tg.measureText(t).width > CW - pad * 2 && l2) { fullN++; l2 = w; } else l2 = t; } }
      const sy = Math.max(padY, (TH - (lh * 1.6 + fullN * lh)) / 2); /* block centred on the full text, so it doesn't shift while typing */
      tg.fillStyle = '#e6efe9'; tg.fillText(prompt.slice(0, 44), ox + pad, sy);
      const words = body.slice(0, n).split(' '), lines = []; let ln = '';
      for (const w of words) { if (w === '\u2029') { lines.push(ln, GLASS ? '\u2029' : ''); ln = ''; continue; } if (!w) continue; const t = ln ? ln + ' ' + w : w; if (tg.measureText(t).width > CW - pad * 2 && ln) { lines.push(ln); ln = w; } else ln = t; } lines.push(ln);
      const y0 = sy + lh * (GLASS ? 1.25 : 1.6), maxL = Math.floor((TH - y0 - padY) / lh), vis = lines.slice(Math.max(0, lines.length - maxL));
      const GAP = GLASS ? 0.4 : 1, ys = []; { let yy = y0; vis.forEach((l) => { ys.push(yy); yy += l === '\u2029' ? lh * GAP : lh; }); ys.push(yy); } /* r14.48: tighter paragraph gaps */
      tg.fillStyle = '#dfe8e2'; vis.forEach((l, i) => { if (l !== '\u2029') tg.fillText(l, ox + pad, ys[i]); });
      if (GLASS && (window.__wbTypeDone || n >= TOT())) { const bk = S_glass && S_glass.bk, k = bk ? bk.n : 0, mx = bk ? bk.max : 5, tap = matchMedia('(pointer: coarse)').matches ? 'tap' : 'click';
        tg.fillStyle = '#9fe6b8'; tg.fillText(bk && bk.freed ? '> he is free.' : '> ' + tap + ' the glass to set him free  [' + '#'.repeat(k) + '.'.repeat(Math.max(0, mx - k)) + ']', ox + pad, ys[vis.length] + lh * 0.4); tg.fillStyle = '#dfe8e2'; }
      if (cur) { const last = vis[vis.length - 1] || '', x = ox + pad + tg.measureText(last).width + 3, y = ys[Math.max(0, vis.length - 1)]; tg.fillRect(x, y + 1, fs * 0.58, fs * 1.08); }
      tg.shadowBlur = 0;
      { const sh = tg.createLinearGradient(0, 0, TW * 0.7, TH); sh.addColorStop(0, 'rgba(255,255,255,0.07)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); tg.fillStyle = sh; tg.fillRect(0, 0, TW, TH); }
      tg.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < TH; y += 3) tg.fillRect(0, y, TW, 1);
      if (FRAME && !GLASS) { const ev = tg.createRadialGradient(TW / 2, TH / 2, TH * 0.45, TW / 2, TH / 2, TW * 0.66); ev.addColorStop(0, 'rgba(0,0,0,0)'); ev.addColorStop(1, 'rgba(0,0,0,0.35)'); tg.fillStyle = ev; tg.fillRect(0, 0, TW, TH);
        const rr = 22; tg.globalCompositeOperation = 'destination-in'; tg.fillStyle = '#000'; tg.beginPath(); tg.moveTo(rr, 0); tg.arcTo(TW, 0, TW, TH, rr); tg.arcTo(TW, TH, 0, TH, rr); tg.arcTo(0, TH, 0, 0, rr); tg.arcTo(0, 0, TW, 0, rr); tg.closePath(); tg.fill(); tg.globalCompositeOperation = 'source-over'; }
    };
    const boot = async () => {
      booting = true;
      const B = GLASS ? 'https://esm.sh/three@0.186.1' : 'https://esm.sh/three@0.186.1', E = B + '/examples/jsm/'; /* 0.170: glass dispersion */
      const [T, GL, RE, RB] = await Promise.all([import(B), GLASS ? null : import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js'), GLASS ? import(E + 'geometries/RoundedBoxGeometry.js') : null]);
      const r = new T.WebGLRenderer({ antialias: (devicePixelRatio || 1) < 1.5, alpha: true }); r.setPixelRatio(Math.min(1.25, devicePixelRatio || 1)); r.setClearColor(0, 0);
      // GPU resets drop every context at once: keep this one restorable instead of letting the section vanish
      r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }); r.domElement.addEventListener('webglcontextrestored', () => { r.setSize(r.domElement.clientWidth || 1, r.domElement.clientHeight || 1, false); });
      r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
      const c = r.domElement; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c);
      const sc = new T.Scene(), pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose();
      const key = new T.DirectionalLight(0xffffff, DESK ? 0.05 : 1.6); key.position.set(-2, 3, 4); sc.add(key); sc.add(new T.HemisphereLight(DESK ? 0x8a8f8c : 0xffffff, 0x050505, DESK ? 0.22 : 0.5)); if (DESK) sc.environmentIntensity = 0.25;
      const tex = new T.CanvasTexture(tc); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; draw(0, true); tex.needsUpdate = true;
      if (GLASS) addEventListener('resize', () => { const w0 = TW; fitTW(); if (TW !== w0) { tc.width = TW; tex.dispose(); if (S) { draw(Math.floor(S.n), true); } tex.needsUpdate = true; } });
      const P0 = this.props; let inner, m;
      if (GLASS) {
        const W = 1.5, H = 1.0, D = P0.aboutGlassDepth ?? 0.2, R = Math.min(D * 0.49, 0.09);
        const glassM = new T.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: D * 1.8, ior: P0.aboutGlassIor ?? 1.5, dispersion: P0.aboutGlassDispersion ?? 1.2, roughness: P0.aboutGlassRough ?? 0.0, metalness: 0,
          clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.2, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 420], specularIntensity: 1, envMapIntensity: 1.4,
          attenuationColor: new T.Color(0x9aa6ad), attenuationDistance: 1.2 }); glassM.envMapIntensity = P0.aboutGlassEnv ?? 0.7;
        const slab = new T.Mesh(new RB.RoundedBoxGeometry(W, H, D, 10, R), glassM);
        { const bk = new T.Mesh(new T.PlaneGeometry(W * 0.98, H * 0.98), new T.MeshBasicMaterial({ color: 0x060708, toneMapped: false })); bk.position.z = -D * 0.42; bk.frustumCulled = false; slab.add(bk); } /* r14.31: dark core so the stretched glass reads as dark glass, not milky white */
        const scr = new T.Mesh(new T.PlaneGeometry(W - 0.14, H - 0.093), new T.MeshBasicMaterial({ map: tex, toneMapped: false, alphaTest: 0.5 })); scr.position.z = -D * 0.18; S_scr = scr;
        { const asn = document.createElement('canvas'); asn.width = asn.height = 2; const atx = new T.CanvasTexture(asn); atx.minFilter = T.LinearFilter; atx.generateMipmaps = false;
          const AU = { uMap: { value: atx }, uC: { value: new T.Vector4(0, 0, 1, 1) }, uA: { value: new T.Vector4(0, 0, 1, 1) }, uOn: { value: 0 }, uT: { value: 0 }, uPh: { value: new T.Vector3(1.0, 0.6, 0.2) } };
          const aM = new T.ShaderMaterial({ uniforms: AU, toneMapped: false,
            vertexShader: 'varying vec4 vC; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vC = gl_Position; }',
            fragmentShader: 'uniform sampler2D uMap; uniform vec4 uC; uniform vec4 uA; uniform float uOn; uniform float uT; uniform vec3 uPh; varying vec4 vC; void main(){ vec2 n = vC.xy / vC.w * 0.5 + 0.5; vec2 px = vec2(uC.x + n.x * uC.z, uC.y + (1.0 - n.y) * uC.w); vec2 uv = vec2((px.x - uA.x) / uA.z, 1.0 - (px.y - uA.y) / uA.w); if (uOn < 0.5 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard; vec4 cc = texture2D(uMap, uv); if (cc.a < 0.35) discard; float r2 = texture2D(uMap, uv + vec2(0.002, 0.0)).r, b2 = texture2D(uMap, uv - vec2(0.002, 0.0)).b; float Lm = dot(vec3(r2, cc.g, b2), vec3(0.3, 0.59, 0.11)); float sl = 0.62 + 0.38 * sin(gl_FragCoord.y * 1.0472); float nz = (fract(sin(dot(gl_FragCoord.xy + fract(uT) * 97.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.06; float fl = 0.965 + 0.035 * sin(uT * 41.0) * sin(uT * 7.3); float sy = 1.0 - n.y, gl = exp(-pow((sy - fract(uT * 0.11)) * 22.0, 2.0)) * 0.06; vec3 col = uPh * (Lm * 1.35 + 0.04) * sl * fl + uPh * (nz + gl); col = mix(col, vec3(Lm), 0.15); gl_FragColor = vec4(max(col, 0.0), 1.0); }' });
          const ap = new T.Mesh(new T.PlaneGeometry(W * 0.97, H * 0.97), aM); ap.position.z = D * (P0.aboutAstroZ ?? 0.08); /* r14.37: in front of the terminal (z -0.18D), behind the glass front (+0.5D) */ ap.frustumCulled = false; slab.add(ap); slab.userData.A = { AU, atx, ap }; } /* terminal lives INSIDE the slab: seen through the refracting glass */
        m = new T.Group(); m.scale.setScalar(H / 2 / 0.64); /* sit/land points: local y 0.64 = top edge, same props as the frame */
        /* r14.29 hover: front face bulges + ripples under the cursor (bent normals = live refraction), terminal liquid-ripples, light follows, glass lifts/tilts and dispersion blooms */
        const HU = { uHit: { value: new T.Vector2() }, uHov: { value: 0 }, uTm: { value: 0 } }, SH = H * 0.5, SW = W * 0.5, SD = (D * 0.5).toFixed(4);
        glassM.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, HU); /* r14.39: bulge + ripple computed per pixel -> smooth, no facets */
          sh.vertexShader = 'varying vec3 vLP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vLP = position;');
          sh.fragmentShader = 'uniform vec2 uHit; uniform float uHov; uniform float uTm; varying vec3 vLP;\n' + sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
            { vec2 wq = vLP.xy - uHit; float wl = length(wq), wf = smoothstep(${SD} * 0.6, ${SD}, vLP.z); vec2 wn = wq / max(wl, 1e-4);
              vec2 g = wq * exp(-wl * wl * 9.0) * 0.55 + wn * cos(wl * 24.0 - uTm * 6.0) * exp(-wl * 3.5) * 0.05;
              normal = normalize(normal + vec3(g * uHov * wf, 0.0)); }`); };
        glassM.customProgramCacheKey = () => 'wbglass';
        const PHC = new T.Color(({ amber: '#ff9a2e', green: '#3dff7a', white: '#e9f1ff' })[String(P0.aboutPhosphor || 'green').toLowerCase()] || '#3dff7a'), PHS = PHC.clone().convertLinearToSRGB();
        const SU = { uHitUv: { value: new T.Vector2(0.5, 0.5) }, uHov: HU.uHov, uTm: HU.uTm, uCrop: { value: new T.Vector4(0, 0, 1, 1) }, uPh: { value: new T.Vector3(PHC.r, PHC.g, PHC.b) } }; this._phS = PHS;
        scr.material.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, SU);
          sh.fragmentShader = 'uniform vec2 uHitUv; uniform float uHov; uniform float uTm; uniform vec4 uCrop; uniform vec3 uPh;\nfloat hsh(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }\n' + sh.fragmentShader.replace('#include <map_fragment>', `
            vec2 pu = (vMapUv - uCrop.xy) / uCrop.zw, cq = pu - 0.5; vec2 cu = 0.5 + cq * (1.0 + 0.09 * dot(cq, cq));
            float inb = step(0.0, cu.x) * step(cu.x, 1.0) * step(0.0, cu.y) * step(cu.y, 1.0), row = floor(cu.y * 427.0);
            float hs = step(0.993, hsh(vec2(floor(uTm * 4.0), 3.1))) * sin(cu.y * 30.0 + uTm * 20.0) * 0.004, jit = (hsh(vec2(row, floor(uTm * 30.0))) - 0.5) * 0.0007 + hs;
            vec2 tq = (vMapUv - uHitUv) * vec2(1.5, 1.0); float tl = length(tq); vec2 rip = tq / max(tl, 1e-4) * sin(tl * 55.0 - uTm * 9.0) * 0.005 * uHov * exp(-tl * 4.5);
            vec2 mu = uCrop.xy + (cu + vec2(jit, 0.0)) * uCrop.zw + rip; float sx = 0.0006 * uCrop.z;
            vec3 base = vec3(texture2D(map, mu + vec2(sx, 0.0)).r, texture2D(map, mu).g, texture2D(map, mu - vec2(sx, 0.0)).b);
            vec3 bl = vec3(0.0); for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854; bl += texture2D(map, mu + vec2(cos(a) * 0.002 * uCrop.z, sin(a) * 0.0035)).rgb; } bl /= 8.0;
            float Lm = dot(base, vec3(0.3, 0.59, 0.11)), LB = dot(bl, vec3(0.3, 0.59, 0.11));
            vec3 col = uPh * (Lm * ${DESK ? '1.25' : '1.45'} + LB * ${DESK ? '0.35' : '0.9'}) + ${DESK ? 'vec3(0.012, 0.05, 0.028)' : 'uPh * 0.055'}; col = mix(col, vec3(Lm), 0.1);
            float scan = 0.84 + 0.16 * sin(cu.y * 427.0 * 3.14159), nz = (hsh(cu * 917.0 + fract(uTm) * 31.0) - 0.5) * 0.05, fl = 0.965 + 0.035 * sin(uTm * 41.0) * sin(uTm * 7.3);
            float gp = fract(uTm * 0.11), gl = exp(-pow((1.0 - cu.y - gp) * 22.0, 2.0)) * 0.05, vig = smoothstep(${DESK ? '0.78' : '0.9'}, ${DESK ? '0.12' : '0.3'}, length(cq * vec2(0.9, 1.15)));
            col = (col * scan * fl + uPh * (nz * 0.5 + gl)) * mix(0.45, 1.0, vig) * inb; col += vec3(0.05, 0.055, 0.06) * uHov * exp(-tl * 7.0);
            diffuseColor.rgb *= max(col, 0.0);`); };
        scr.material.customProgramCacheKey = () => 'wbglscr';
        const hl = new T.PointLight(0xeaf4ff, 0, 2.5, 2); inner = new T.Group(); inner.add(hl);
        S_glass = { slab, glassM, HU, SU, hl, SW, SH, D, disp: glassM.dispersion, irid: glassM.iridescence, ray: new T.Raycaster(), nd: new T.Vector2(), hit: new T.Vector2(), h: 0 };
        /* r14.42: break the glass — after the text is typed, every tap cracks the glass at that spot; the last tap shatters it and frees the astronaut */
        { const BK = S_glass.bk = { n: 0, max: Math.max(1, P0.aboutBreakTaps ?? 5), shk: 0, shards: [], freed: 0, st: 0 };
          const cc = document.createElement('canvas'); cc.width = 1536; cc.height = 1024; const cg = cc.getContext('2d'), ctx2 = new T.CanvasTexture(cc); ctx2.colorSpace = T.SRGBColorSpace;
          const cp = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshBasicMaterial({ map: ctx2, transparent: true, depthWrite: false, toneMapped: false })); cp.position.z = D * 0.5 + 0.003; cp.renderOrder = 5; cp.frustumCulled = false; slab.add(cp);
          const rnd = Math.random, seg = (pts, w, al) => { cg.beginPath(); pts.forEach((p, i) => (i ? cg.lineTo(p[0], p[1]) : cg.moveTo(p[0], p[1]))); cg.strokeStyle = 'rgba(0,0,0,' + (al * 0.45) + ')'; cg.lineWidth = w + 2.5; cg.stroke(); cg.strokeStyle = 'rgba(236,246,255,' + al + ')'; cg.lineWidth = w; cg.stroke(); };
          BK.clear = () => { cg.clearRect(0, 0, cc.width, cc.height); ctx2.needsUpdate = true; };
          BK.crack = (u, v, lvl) => { const X = u * cc.width, Y = (1 - v) * cc.height, R = cc.height * (0.16 + 0.1 * lvl), rays = 9 + Math.floor(rnd() * 6), ends = []; cg.lineCap = 'round'; cg.lineJoin = 'round';
            for (let i = 0; i < rays; i++) { let ang = i / rays * Math.PI * 2 + (rnd() - 0.5) * 0.5, x = X, y = Y; const pts = [[x, y]], L = R * (0.45 + rnd() * 0.9), st = 10 + Math.floor(rnd() * 6);
              for (let k = 0; k < st; k++) { ang += (rnd() - 0.5) * 0.35; x += Math.cos(ang) * L / st; y += Math.sin(ang) * L / st; pts.push([x, y]);
                if (k > 2 && rnd() < 0.16) { let a2 = ang + (rnd() < 0.5 ? -1 : 1) * (0.4 + rnd() * 0.5), x2 = x, y2 = y; const p2 = [[x, y]]; for (let j = 0; j < 4; j++) { a2 += (rnd() - 0.5) * 0.4; x2 += Math.cos(a2) * L / st; y2 += Math.sin(a2) * L / st; p2.push([x2, y2]); } seg(p2, 1.1, 0.5); } }
              seg(pts, 2.2, 0.85); ends.push(pts); }
            [0.22, 0.45, 0.72].forEach((f) => { for (let i = 0; i < rays; i++) { if (rnd() > 0.7) continue; const A0 = ends[i], B0 = ends[(i + 1) % rays], p = A0[Math.floor(f * (A0.length - 1))], q = B0[Math.floor(f * (B0.length - 1))]; seg([p, [(p[0] + q[0]) / 2 + (rnd() - 0.5) * 8, (p[1] + q[1]) / 2 + (rnd() - 0.5) * 8], q], 1.3, 0.6); } });
            const gr = cg.createRadialGradient(X, Y, 0, X, Y, 26); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cg.fillStyle = gr; cg.beginPath(); cg.arc(X, Y, 26, 0, Math.PI * 2); cg.fill();
            ctx2.needsUpdate = true; };
          BK.smat = new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.5, clearcoat: 1, envMapIntensity: 1.8, iridescence: 0.5, side: T.DoubleSide, depthWrite: false });
          BK.shatter = (u0, v0) => { const hx = (u0 - 0.5) * W, hy = (v0 - 0.5) * H, N = 24;
            const edge = (an) => { const dx = Math.cos(an), dy = Math.sin(an), tx = dx > 0 ? (W / 2 - hx) / dx : dx < 0 ? (-W / 2 - hx) / dx : 1e9, ty = dy > 0 ? (H / 2 - hy) / dy : dy < 0 ? (-H / 2 - hy) / dy : 1e9, tt = Math.min(tx, ty); return [hx + dx * tt, hy + dy * tt]; };
            const angs = []; for (let i = 0; i < N; i++) angs.push(i / N * Math.PI * 2 + (rnd() - 0.5) * 0.12);
            const tri = (p, q, r2) => { const cx = (p[0] + q[0] + r2[0]) / 3, cy = (p[1] + q[1] + r2[1]) / 3, g = new T.BufferGeometry();
              g.setAttribute('position', new T.Float32BufferAttribute([p[0] - cx, p[1] - cy, 0, q[0] - cx, q[1] - cy, 0, r2[0] - cx, r2[1] - cy, 0], 3)); g.computeVertexNormals();
              const ms = new T.Mesh(g, BK.smat), dx = cx - hx, dy = cy - hy, dl = Math.hypot(dx, dy) || 1, sp = 0.5 + rnd() * 1.1; ms.position.set(cx, cy, D * 0.5); ms.frustumCulled = false; ms.renderOrder = 6;
              ms.userData.v = new T.Vector3(dx / dl * sp, dy / dl * sp + 0.35, 1.0 + rnd() * 1.8); ms.userData.w = new T.Vector3((rnd() - 0.5) * 9, (rnd() - 0.5) * 9, (rnd() - 0.5) * 5); slab.add(ms); BK.shards.push(ms); };
            for (let i = 0; i < N; i++) { const e0 = edge(angs[i]), e1 = edge(angs[(i + 1) % N]), k = 0.25 + rnd() * 0.4, m0 = [hx + (e0[0] - hx) * k, hy + (e0[1] - hy) * k], m1 = [hx + (e1[0] - hx) * k, hy + (e1[1] - hy) * k];
              tri([hx, hy], m0, m1); tri(m0, e0, e1); tri(m0, e1, m1); }
            BK.st = 0; BK.smat.opacity = 0.5; cp.visible = false; BK.clear(); /* r14.45: the glass itself stays, so the monitor keeps its look */ const A = slab.userData.A; if (A && A.ap) A.ap.visible = false; BK.freed = 1; window.__wbGlassFreed = 1; };
          BK.reset = () => { BK.shards.forEach((s2) => { slab.remove(s2); s2.geometry.dispose(); }); BK.shards.length = 0; BK.clear(); BK.n = 0; BK.freed = 0; window.__wbGlassFreed = 0; glassM.visible = true; cp.visible = true; const A = slab.userData.A; if (A && A.ap) A.ap.visible = true; };
          BK.onDown = (e) => { if (!S || BK.freed || !(window.__wbTypeDone || S.n >= TOT()) || (window.__wbAboutOp || 0) < 0.85) return;
            const cr = S.r.domElement.getBoundingClientRect(); S_glass.nd.set((e.clientX - cr.left) / cr.width * 2 - 1, -((e.clientY - cr.top) / cr.height) * 2 + 1); S_glass.ray.setFromCamera(S_glass.nd, S.cam);
            const hi = S_glass.ray.intersectObject(slab, false)[0]; if (!hi) return; const lp = slab.worldToLocal(hi.point.clone()), u = lp.x / W + 0.5, v = lp.y / H + 0.5;
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation && e.stopImmediatePropagation(); BK.eat = performance.now();
            try { BK.n++; BK.shk = 1; if (BK.badge) BK.badge.pop = 1; if (BK.n >= BK.max) BK.shatter(u, v); else BK.crack(u, v, BK.n); console.info('[wubble] glass tap', BK.n + '/' + BK.max); draw(Math.floor(S.n), true); S.tex.needsUpdate = true; } catch (e2) { console.warn('[wubble] glass break failed', e2); } };
          const eat = (e) => { if (BK.eat && performance.now() - BK.eat < 450) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation && e.stopImmediatePropagation(); } };
          { const src = document.querySelector('[data-hover-bubble]'); if (src) { const el = src.cloneNode(true); el.removeAttribute('data-hover-bubble'); el.setAttribute('data-break-badge', ''); el.style.zIndex = '64'; el.style.opacity = '0';
              const lab = [...el.querySelectorAll('div')].find((d) => !d.children.length && d.textContent.trim()); if (lab) { lab.textContent = P0.aboutBreakLabel || 'Tap to break'; lab.style.fontSize = '15px'; } { const inn = el.firstElementChild; if (inn) inn.style.transform = 'scale(' + (P0.aboutBreakBadgeScale ?? 1.15) + ')'; } document.body.appendChild(el); /* r14.53: bigger badge */
              const G2 = window.gsap, blobs = el.querySelectorAll('[data-hb-blob]'), main = el.querySelector('[data-hb-main]');
              const wob = (b) => { if (!G2) return; G2.to(b, { x: G2.utils.random(-26, 26), y: G2.utils.random(-18, 18), scale: G2.utils.random(0.55, 1.25), duration: G2.utils.random(1.1, 2.2), ease: 'sine.inOut', onComplete: () => wob(b) }); };
              const wobM = () => { if (!G2 || !main) return; G2.to(main, { scaleX: G2.utils.random(0.94, 1.08), scaleY: G2.utils.random(0.9, 1.1), rotation: G2.utils.random(-4, 4), duration: G2.utils.random(0.9, 1.6), ease: 'sine.inOut', onComplete: wobM }); };
              blobs.forEach(wob); wobM(); BK.badge = { el, x: innerWidth * 0.5, y: innerHeight * 0.7, op: 0, pop: 0, mx: -1, my: -1 };
              addEventListener('pointermove', (e) => { BK.badge.mx = e.clientX; BK.badge.my = e.clientY; }, { passive: true }); } }
          addEventListener('pointerdown', BK.onDown, { capture: true, passive: false }); ['pointerup', 'mouseup', 'click', 'touchend', 'dblclick'].forEach((ev) => addEventListener(ev, eat, { capture: true, passive: false })); }
        inner.add(scr, slab, m); [scr, slab].forEach((o) => { o.frustumCulled = false; });
        if (DESK) { /* V23: CRT casing + bezel + chin + desk + keyboard + mouse, lit green by the screen in a dark room */
          const rig = new T.Group(), mk = (g, col, rgh) => new T.Mesh(g, new T.MeshStandardMaterial({ color: col, roughness: rgh ?? 0.72, metalness: 0.05 })), BX = (w, h, d) => new T.BoxGeometry(w, h, d);
          const cas = 0x262624, bw = 0.2, fz = D * 0.5 + 0.035, OW = W + bw * 2, OH = H + bw * 2;
          [[0, H / 2 + bw / 2, OW, bw], [0, -H / 2 - bw / 2, OW, bw], [-W / 2 - bw / 2, 0, bw, H], [W / 2 + bw / 2, 0, bw, H]].forEach(([x, y, w, h]) => { const b = mk(new RB.RoundedBoxGeometry(w, h, 0.16, 3, 0.02), cas, 0.6); b.position.set(x, y, fz - 0.08); rig.add(b); });
          { const ib = 0.05; [[0, H / 2 + ib / 2, W + ib * 2, ib], [0, -H / 2 - ib / 2, W + ib * 2, ib], [-W / 2 - ib / 2, 0, ib, H], [W / 2 + ib / 2, 0, ib, H]].forEach(([x, y, w, h]) => { const b = mk(BX(w, h, 0.12), 0x0e100e, 0.9); b.position.set(x, y, fz - 0.02); rig.add(b); }); }
          { const body = mk(new RB.RoundedBoxGeometry(OW * 0.98, OH * 0.96, 1.0, 4, 0.06), 0x1c1c1a); body.position.set(0, 0.02, -D * 0.5 - 0.5); rig.add(body);
            const bk = mk(BX(OW * 0.62, OH * 0.62, 0.5), 0x121512); bk.position.set(0, 0, -D * 0.5 - 1.15); rig.add(bk); }
          const chinY = -H / 2 - bw - 0.13; { const ch = mk(new RB.RoundedBoxGeometry(OW, 0.3, 0.5, 3, 0.03), 0x232321, 0.75); ch.position.set(0, chinY, fz - 0.27); rig.add(ch);
            const led = new T.Mesh(new T.PlaneGeometry(0.17, 0.1), new T.MeshBasicMaterial({ color: 0x9dff7a, toneMapped: false })); led.position.set(OW / 2 - 0.22, chinY, fz - 0.015); rig.add(led);
            for (let i = 0; i < 5; i++) { const g = mk(BX(0.15, 0.006, 0.004), 0x0c1a0c); g.position.set(OW / 2 - 0.22, chinY - 0.04 + i * 0.02, fz - 0.012); rig.add(g); }
            const kn = mk(new T.CylinderGeometry(0.035, 0.035, 0.03, 24), 0x0e110f, 0.4); kn.rotation.x = Math.PI / 2; kn.position.set(-OW / 2 + 0.16, chinY, fz - 0.015); rig.add(kn);
            for (let i = 0; i < 14; i++) { const v = mk(BX(0.035, 0.012, 0.01), 0x0b0d0c); v.position.set(-0.45 + i * 0.07, chinY, fz - 0.017); rig.add(v); } }
          const deskY = chinY - 0.13 - 0.05; { const dk = mk(BX(4.6, 0.1, 2.2), 0x2a2a27, 0.8); dk.position.set(0, deskY - 0.05, fz - 0.35); rig.add(dk);
            const dkF = mk(BX(4.6, 0.32, 0.06), 0x1a1916, 0.9); dkF.position.set(0, deskY - 0.26, fz + 0.75); rig.add(dkF); }
          { const kb = mk(new RB.RoundedBoxGeometry(1.35, 0.06, 0.44, 3, 0.02), 0x1c211d, 0.65); kb.position.set(-0.12, deskY + 0.03, fz + 0.42); kb.rotation.x = 0.06; rig.add(kb);
            const kg = new T.BoxGeometry(0.068, 0.03, 0.068), km = new T.MeshStandardMaterial({ color: 0x252b26, roughness: 0.55 }), keys = new T.InstancedMesh(kg, km, 15 * 5), mt = new T.Matrix4(); let ki = 0;
            for (let r2 = 0; r2 < 5; r2++) for (let k2 = 0; k2 < 15; k2++) { mt.makeTranslation(-0.12 - 0.595 + 0.042 + k2 * 0.082 + (r2 % 2) * 0.02, deskY + 0.078 - r2 * 0.004, fz + 0.42 - 0.165 + r2 * 0.082); keys.setMatrixAt(ki++, mt); }
            rig.add(keys); const sp = mk(BX(0.5, 0.03, 0.07), 0x252b26, 0.55); sp.position.set(-0.12, deskY + 0.07, fz + 0.42 + 0.25); rig.add(sp);
            const pad = mk(BX(0.42, 0.008, 0.34), 0x101211, 0.95); pad.position.set(0.95, deskY + 0.005, fz + 0.45); rig.add(pad);
            const ms = mk(new T.SphereGeometry(0.09, 24, 16), 0x161a17, 0.35); ms.scale.set(0.75, 0.42, 1.15); ms.position.set(0.95, deskY + 0.035, fz + 0.45); rig.add(ms); }
          const glow = new T.PointLight(0x3dff7a, P0.aboutDeskGlow ?? 0.9, 3.2, 2); glow.position.set(0, -0.15, fz + 0.45); rig.add(glow);
          const rim = new T.PointLight(0x9fb8a6, 0.5, 4, 2); rim.position.set(0, deskY + 0.45, fz + 0.9); rig.add(rim);
          rig.traverse((o) => { if (o.isMesh) o.frustumCulled = false; }); inner.add(rig);
          inner.scale.setScalar(P0.aboutDeskScale ?? 0.62); inner.position.y = (P0.aboutDeskY ?? 0.16); }
        r.transmissionResolutionScale = Math.min(1, P0.aboutGlassRes ?? 1); /* full res: text stays sharp */
      } else { const g = await new GL.GLTFLoader().loadAsync(FRAME ? (window.WB_ASSETS || './') + 'models/monitor-frame-2k.glb' : (window.WB_ASSETS || './') + 'models/crt_monitor.glb'); m = g.scene; }
      const U = { tTxt: { value: tex }, uRect: { value: new T.Vector4(0.192, 0.330, 0.505, 0.638) }, uGlow: { value: 1.25 } };
      if (!GLASS) m.traverse((o) => { if (!o.isMesh) return; o.frustumCulled = false; if (o.parent && o.parent.name === 'Body_low') { const mt = o.material = o.material.clone();
        mt.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
          sh.fragmentShader = 'uniform sampler2D tTxt; uniform vec4 uRect; uniform float uGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
            { vec2 sq = (vMapUv - uRect.xy) / (uRect.zw - uRect.xy);
              if (sq.x > 0.0 && sq.x < 1.0 && sq.y > 0.0 && sq.y < 1.0) { vec2 cq = sq - 0.5; vec2 bu = 0.5 + cq * (1.0 + dot(cq, cq) * 0.12);
                vec3 t = texture2D(tTxt, vec2(bu.x, bu.y)).rgb; float e = smoothstep(0.0, 0.03, min(min(sq.x, 1.0 - sq.x), min(sq.y, 1.0 - sq.y)));
                diffuseColor.rgb = mix(diffuseColor.rgb, t * 0.08, e); totalEmissiveRadiance = mix(totalEmissiveRadiance, t * uGlow, e); } }`); };
        mt.customProgramCacheKey = () => 'wbcrt'; } });
      if (GLASS) { /* built above */ }
      else if (FRAME) { // Tripo frame: open bezel tilted back ~40°; our own flat screen sits in the opening (measured), then the whole thing is tilted to face you
        const ang = 0.697, scrG = (() => { const g2 = new T.PlaneGeometry(P0.aboutScreenW ?? 0.875, P0.aboutScreenH ?? 0.58, 24, 16), ps = g2.attributes.position, hw = (P0.aboutScreenW ?? 0.875) / 2, hh = (P0.aboutScreenH ?? 0.58) / 2; for (let k = 0; k < ps.count; k++) { const u = ps.getX(k) / hw, v = ps.getY(k) / hh; ps.setZ(k, (P0.aboutScreenBulge ?? 0.012) * (1 - u * u) * (1 - v * v)); } g2.computeVertexNormals(); return g2; })(), scr = new T.Mesh(scrG, new T.MeshBasicMaterial({ map: tex, toneMapped: false, alphaTest: 0.5 })); scr.rotation.x = -ang; scr.position.set(0, 0.345, -0.035).addScaledVector(new T.Vector3(0, Math.sin(ang), Math.cos(ang)), P0.aboutScreenFwd ?? 0.065); /* in front of the model's rough inner rim, tucked under the bezel */ m.add(scr); S_scr = scr;
        m.traverse((o) => { if (o.isMesh && o !== scr) { o.frustumCulled = false; const mt = o.material = o.material.clone(); mt.color.setScalar(P0.aboutFrameTone ?? 0.32); mt.roughness = 0.55; mt.envMapIntensity = 0.6; } });
        inner = new T.Group(); m.position.set(0, -0.345, 0.03); inner.add(m); inner.rotation.x = ang; inner.scale.setScalar(1 / 0.62);
      } else { m.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(m), cen = bb.getCenter(new T.Vector3()), hgt = bb.max.y - bb.min.y;
        inner = new T.Group(); m.position.copy(cen).multiplyScalar(-1); inner.add(m); inner.rotation.y = -Math.PI / 2; inner.scale.setScalar(1 / hgt); }
      const piv = new T.Group(); piv.add(inner); sc.add(piv);
      const cam = new T.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 0, 1 / Math.tan(15 * Math.PI / 180)); cam.lookAt(0, 0, 0);
      const size = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      size(); new ResizeObserver(size).observe(host);
      const ms = { x: 0, y: 0 }; addEventListener('pointermove', (e) => { ms.x = e.clientX / innerWidth * 2 - 1; ms.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
      S = { mon: m, ev: new T.Vector3(), r, sc, cam, piv, tex, U, ms, last: performance.now(), n: 0, shown: 0, cur: 1 };
    };
    const tick = () => {
      requestAnimationFrame(tick);
      const P = this.props, on = (P.aboutMonitor || 'Model') === 'Model';
      { const op0 = on ? +getComputedStyle(ab).opacity : 0, abR = ab.getBoundingClientRect(), inView = abR.bottom > 0 && abR.top < innerHeight && (window.__wbRP || 0) > 0.98; window.__wbSpaceForce = 0;
        gal.style.display = 'none';
        void 0; }
      if (on !== this._glassOff) { this._glassOff = on; glass.style.visibility = on ? 'hidden' : ''; glass.style.background = on ? 'none' : ''; glass.style.boxShadow = on ? 'none' : ''; ab.style.padding = on ? '0' : ''; } host.style.display = on ? '' : 'none'; if (!on) return;
      const rqA = window.__wbRQ || 0, gate = Math.max(0, Math.min(1, (rqA - 0.8) / 0.2)), op = +getComputedStyle(ab).opacity * gate * gate * (3 - 2 * gate); /* only once Work has handed over to About */ window.__wbAboutOn = 0; host.style.opacity = op.toFixed(3); host.style.visibility = op > 0.003 ? '' : 'hidden';

      if (!S) { if (!booting && on) boot().catch((e) => { console.warn('about CRT failed', e); }); return; }
      if (!S.warm && S.r && S.sc && S.cam) { S.warm = 1; try { S.r.compile(S.sc, S.cam); } catch (e) {} }
      const now = performance.now(), dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; if (op < 0.01) { S.n = 0; if (S_glass && S_glass.bk && S_glass.bk.badge && S_glass.bk.badge.op > 0) { S_glass.bk.badge.op = 0; S_glass.bk.badge.el.style.opacity = '0'; } if (S_glass && S_glass.bk && (S_glass.bk.n || S_glass.bk.freed)) S_glass.bk.reset(); return; }
      // typewriter (restarts each time About is entered)
      const before = Math.floor(S.n), cur = Math.floor(now / 530) % 2 === 0; S.n = Math.min(TOT(), S.n + dt * (P.aboutTypeSpeed ?? 38));
      if (GLASS && Math.abs(scrT - scrY) > 0.3) { scrY += (scrT - scrY) * (1 - Math.exp(-dt * 7)); S.cur = null; }
      if (Math.floor(S.n) !== before || cur !== S.cur) { S.cur = cur; draw(Math.floor(S.n), cur || S.n < TOT()); S.tex.needsUpdate = true; }
      // smooth float: bob, slow sway, gentle mouse tilt
      const t = now / 1000, sc0 = Math.min(P.aboutMonitorSize ?? 1.25, 1.35 * Math.min(1, (S.cam.aspect || 1) / 1.2)); // monitor + seated astronaut always fit the screen
      S.piv.scale.setScalar(sc0); { const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }, inE = ss(op), outE = ss((window.__wbRA || 0) / 0.6); if (inE > 0.98) S.wasIn = 1; if (op < 0.01) S.wasIn = 0; S.ky = (S.ky ?? 0) + (((S.wasIn || outE > 0.001) ? 0 : (1 - inE) * -1.3) - (S.ky ?? 0)) * (1 - Math.exp(-dt * 5)); /* rises in once, then stays in place on the way out */ S.piv.position.set(0, (Math.sin(t * 0.8) * 0.045 + S.ky) * (1 - ((P.aboutZoom ?? false) ? outE : 0)) + (P.aboutMonitorY ?? 0) * Math.min(1, sc0 / 0.95), 0);
        /* scroll out: fly the camera straight through the screen */ { const Z0 = 1 / Math.tan(15 * Math.PI / 180), oz = outE * outE * (3 - 2 * outE); const zm = (P.aboutZoom ?? false) ? oz : 0; S.cam.position.set(0, (P.aboutMonitorY ?? 0) * Math.min(1, sc0 / 0.95) * zm + (P.aboutZoomY ?? 0.3) * sc0 * zm, Z0 - (Z0 + (P.aboutZoomDepth ?? 0.4)) * zm); S.zo = oz; S.zm = zm; /* S.zo = exit progress (title + astronaut use it); camera only moves when aboutZoom is on */ } }
      S.piv.rotation.y += ((Math.sin(t * 0.35) * 0.16 + S.ms.x * (0.22 + 0.28 * (S.hz || 0))) * (1 - (S.zm || 0)) * (1 - (S.fz || 0)) - S.piv.rotation.y) * (1 - Math.exp(-dt * 2.5));
      S.piv.rotation.x += ((Math.sin(t * 0.5) * 0.04 + S.ms.y * (0.12 + 0.18 * (S.hz || 0))) * (1 - (S.zm || 0)) * (1 - (S.fz || 0)) - S.piv.rotation.x) * (1 - Math.exp(-dt * 2.5));
      if (DESK) { /* V23: shader.se-style scroll-linked camera crane — the camera rises and tilts down over the desk as you scroll, so the set drifts up and swings round */
        const ss2 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }, kIn = 1 - ss2(((window.__wbRQ || 0) - 0.55) / 0.45), kOut = ss2((window.__wbRA || 0) / (P.aboutCraneOut ?? 0.95));
        const k = kOut - kIn, Z0 = 1 / Math.tan(15 * Math.PI / 180), R = Z0 * (1 + Math.abs(k) * 0.12);
        const el = ((P.aboutCraneBase ?? 5) + k * (k > 0 ? (P.aboutCraneUp ?? 38) : 26)) * Math.PI / 180, az = -k * (P.aboutCraneSwing ?? 22) * Math.PI / 180;
        const ty = -k * (P.aboutCraneDrift ?? 0.6) * sc0 * 0.5;
        S.cam.position.set(Math.sin(az) * Math.cos(el) * R, ty + Math.sin(el) * R, Math.cos(az) * Math.cos(el) * R); S.cam.lookAt(0, ty, 0);
        S.cam.rotation.z += -k * 0.04; }
      S.piv.rotation.z = Math.sin(t * 0.6) * 0.025 * (1 - (S.fz || 0));
      if (S_glass) { const G = S_glass; G.nd.set(S.ms.x, -S.ms.y); G.ray.setFromCamera(G.nd, S.cam); const hi = G.ray.intersectObject(G.slab, false)[0];
        let tgt = 0; if (hi) { const lp = G.slab.worldToLocal(hi.point.clone()); G.hit.x += (lp.x - G.hit.x) * (1 - Math.exp(-dt * 14)); G.hit.y += (lp.y - G.hit.y) * (1 - Math.exp(-dt * 14)); tgt = 1; }
        G.h += (tgt - G.h) * (1 - Math.exp(-dt * (tgt ? 6 : 3))); const h = G.h * (1 - (S.zm || 0));
        G.HU.uHov.value = h; G.HU.uTm.value = t; G.HU.uHit.value.copy(G.hit); G.SU.uHitUv.value.set(0 + (0.5 + G.hit.x * G.slab.scale.x / (1.36 * (G.sx || 1))) * (G.rp || 1), 0.5 + G.hit.y * G.slab.scale.y / (0.907 * (S_scr.scale.y || 1)));
        G.glassM.dispersion = (G.disp + 3 * h) * (1 - 0.85 * (S.fz || 0)); G.glassM.iridescence = (G.irid + 0.3 * h) * (1 - 0.7 * (S.fz || 0)); G.glassM.thickness = G.D * (1.8 + 0.9 * h);
        G.hl.position.set(G.hit.x, G.hit.y, G.D * 0.5 + 0.22); G.hl.intensity = 0.7 * h;
        { const sx = (1.5 * G.slab.scale.x - 0.14) / 1.36, sy = (1.0 * G.slab.scale.y - 0.093) / 0.907, rp = Math.min(1, (1.36 * sx) / (0.907 * sy) / (TW / TH)); S_scr.scale.set(sx, sy, 1); S.tex.repeat.x = rp; S.tex.offset.x = 0; G.SU.uCrop.value.set(S.tex.offset.x, S.tex.offset.y, S.tex.repeat.x, S.tex.repeat.y); /* left-anchored crop: the text column stays at the screen's left edge */ G.sx = sx; G.rp = rp; }
        S.hz = h; S.piv.position.z = 0.09 * h; S.piv.scale.multiplyScalar(1 + 0.035 * h);
        /* r14.30: 2 s after arriving, zoom until the glass fills the whole viewport (slab stretches to the screen's aspect; the terminal stays undistorted, centred) */
        const arr = op > 0.9 && (P.aboutGlassZoom ?? !DESK); if (arr) G.t0 = G.t0 || now; else if (op < 0.5) G.t0 = 0;
        const bkF = G.bk && G.bk.freed; if (bkF) G.bkT = G.bkT || now; else G.bkT = 0; const out = bkF && now - G.bkT > (P.aboutGlassOutDelay ?? 700); /* r14.43: glass broken -> screen eases back to its small size */
        const want = arr && G.t0 && now - G.t0 > (P.aboutGlassZoomDelay ?? 2000) && !(S.zm > 0.01) && !out ? 1 : 0; G.fz = (G.fz || 0) + (want - (G.fz || 0)) * (1 - Math.exp(-dt * (want ? 1.5 : out ? (P.aboutGlassOutSpeed ?? 1.1) : 3)));
        const f = G.fz * G.fz * (3 - 2 * G.fz); S.fz = f; window.__wbGlassFull = f;
        if (f > 0.0005) { const Z0 = S.cam.position.z, tH = Math.tan(15 * Math.PI / 180), asp = S.cam.aspect, hw0 = Z0 * tH * asp, hh0 = Z0 * tH;
          const sF = (P.aboutGlassZoomText ?? 0.88) * Math.min(hw0 / 0.68, hh0 / 0.4535), s = S.piv.scale.x + (sF - S.piv.scale.x) * f; S.piv.scale.setScalar(s);
          const hhF = (Z0 - G.D * 0.5 * s) * tH, hwF = hhF * asp; const ov = Math.min(G.D * 0.49, 0.09) * 1.8 + 0.02; G.slab.scale.set(1 + ((hwF / s + ov) / G.SW - 1) * f, 1 + ((hhF / s + ov) / G.SH - 1) * f, 1); /* r14.39: rounded edges pushed off-screen */
          S.piv.position.multiplyScalar(1 - f); }
        else if (G.slab.scale.x !== 1) G.slab.scale.set(1, 1, 1);
        /* r14.34: astronaut lands INSIDE the glass — feet on the glass's inner floor, on the terminal plane; plus the glass's screen rect so his canvas can be clipped to it */
        { const A = G.slab.userData.A, sn = window.__wbAstroSnap, on = !!(A && sn && window.__wbAstroSnapOn); if (A) { A.AU.uOn.value = on ? 1 : 0; A.AU.uT.value = t; if (this._phS) A.AU.uPh.value.set(this._phS.r, this._phS.g, this._phS.b);
          if (on) { const k = sn.width + 'x' + sn.height; if (G.ak !== k) { A.atx.dispose(); A.atx.image = sn; G.ak = k; } A.atx.needsUpdate = true;
            if (!G.cr || now - G.crT > 500) { G.cr = S.r.domElement.getBoundingClientRect(); G.crT = now; } A.AU.uC.value.set(G.cr.left, G.cr.top, G.cr.width, G.cr.height); const ar = window.__wbAstroRect; if (ar) A.AU.uA.value.set(ar.left, ar.top, ar.width, ar.height); } } }
        { const BK = G.bk; if (BK) { if (BK.shk > 0.002) { BK.shk *= Math.exp(-dt * 9); S.piv.position.x += (Math.random() - 0.5) * 0.035 * BK.shk; S.piv.position.y += (Math.random() - 0.5) * 0.035 * BK.shk; S.piv.rotation.z += (Math.random() - 0.5) * 0.02 * BK.shk; }
          if (BK.badge) { const B = BK.badge, R = window.__wbGlassRect, show = !BK.freed && (window.__wbTypeDone || S.n >= TOT()) && op > 0.9 && !(S.zm > 0.01);
            const iw = innerWidth, ih = innerHeight, cx = R ? ((R.x0 + R.x1) / 4 + 0.5) * iw : iw / 2, by = R ? Math.min(ih * 0.82, (1 - R.y0) / 2 * ih - 70) : ih * 0.75;
            const over = B.mx >= 0 && R && B.mx > (R.x0 + 1) / 2 * iw && B.mx < (R.x1 + 1) / 2 * iw && B.my > (1 - R.y1) / 2 * ih && B.my < (1 - R.y0) / 2 * ih && !matchMedia('(pointer: coarse)').matches;
            const tx = over ? B.mx + 18 : cx - 66, ty = over ? B.my - 70 : by; B.x += (tx - B.x) * (1 - Math.exp(-dt * 10)); B.y += (ty - B.y) * (1 - Math.exp(-dt * 10));
            B.op += ((show ? 1 : 0) - B.op) * (1 - Math.exp(-dt * 6)); B.pop *= Math.exp(-dt * 7);
            B.el.style.opacity = B.op.toFixed(3); B.el.style.transform = 'translate3d(' + B.x.toFixed(1) + 'px,' + B.y.toFixed(1) + 'px,0) scale(' + (0.8 + 0.2 * B.op + 0.25 * B.pop).toFixed(3) + ')'; }
          G.glassM.roughness = (P.aboutGlassRough ?? 0.03) + (BK.freed ? 0 : 0.04 * Math.min(BK.n, BK.max));
          if (BK.shards.length) { BK.st += dt; const fa = Math.max(0, 1 - BK.st / 1.8); BK.smat.opacity = 0.5 * fa;
            for (const s2 of BK.shards) { const U2 = s2.userData; U2.v.y -= 3.2 * dt; s2.position.addScaledVector(U2.v, dt); s2.rotation.x += U2.w.x * dt; s2.rotation.y += U2.w.y * dt; s2.rotation.z += U2.w.z * dt; }
            if (fa <= 0) { BK.shards.forEach((s2) => { G.slab.remove(s2); s2.geometry.dispose(); }); BK.shards.length = 0; } } } }
        G.slab.updateWorldMatrix(true, false); const gv = S.ev; gv.set((P.aboutGlassLandX ?? 0.6) * G.SW, -G.SH * (P.aboutGlassFloor ?? 0.58), -G.D * 0.18); G.slab.localToWorld(gv).project(S.cam); window.__wbGlassIn = { x: gv.x, y: gv.y };
        let x0 = 1, x1 = -1, y0 = 1, y1 = -1; for (let i = 0; i < 4; i++) { gv.set(i & 1 ? G.SW : -G.SW, i & 2 ? G.SH : -G.SH, G.D * 0.5); G.slab.localToWorld(gv).project(S.cam); x0 = Math.min(x0, gv.x); x1 = Math.max(x1, gv.x); y0 = Math.min(y0, gv.y); y1 = Math.max(y1, gv.y); }
        window.__wbGlassRect = { x0, x1, y0, y1 }; }
      S.U.uGlow.value = (P.aboutScreenGlow ?? 1.25) * (0.97 + 0.03 * Math.sin(t * 50)); if (S_scr) S_scr.material.color.setScalar(0.96 + 0.03 * Math.sin(t * 50));
      // monitor top edge on screen (NDC) for the astronaut to sit on; hold scroll until the text is typed
      if (S.mon) { S.ev.set(0, P.aboutSitY ?? 0.64, P.aboutSitZ ?? -0.07); S.mon.localToWorld(S.ev).project(S.cam); window.__wbMonEdge = { x: S.ev.x, y: S.ev.y }; S.ev.set(P.aboutLandX ?? 0.62, P.aboutLandY ?? 0.04, P.aboutSitZ ?? -0.07); S.mon.localToWorld(S.ev).project(S.cam); window.__wbMonLand = { x: S.ev.x, y: S.ev.y }; window.__wbMonZoom = S.zo || 0; }
      window.__wbAboutOp = op; const done = S.n >= TOT(); window.__wbTypeDone = done;
      if (op > 0.9 && !done && !S.locked && !S.freed && !window.__wbAboutHeld && (P.aboutHoldScroll ?? true)) { S.locked = 1; S.lockT = now; this.lockScroll && this.lockScroll(true); }
      if (S.locked && (done || now - S.lockT > 15000)) { S.locked = 0; S.freed = 1; window.__wbAboutHeld = 1; /* pin only the first time */ this.lockScroll && this.lockScroll(false); }
      if (op < 0.01) S.freed = 0;
      S.r.render(S.sc, S.cam);
    };
    tick();
  }
});
