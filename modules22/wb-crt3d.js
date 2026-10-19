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
    let S = null, booting = false, S_scr = null;
    const FRAME = (this.props.aboutMonitorModel || 'Frame') === 'Frame', TW = 640, TH = FRAME ? 427 : 600, tc = document.createElement('canvas'); tc.width = TW; tc.height = TH; const tg = tc.getContext('2d');
    const draw = (n, cur) => {
      tg.fillStyle = '#050505'; tg.fillRect(0, 0, TW, TH);
      const vg = tg.createRadialGradient(TW / 2, TH / 2, TH * 0.1, TW / 2, TH / 2, TH * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); tg.fillStyle = vg; tg.fillRect(0, 0, TW, TH);
      // CRT phosphor: grey glass lit from within, soft-glowing pale text, dark vignette
      { const bg = tg.createRadialGradient(TW / 2, TH * 0.45, TH * 0.05, TW / 2, TH / 2, TW * 0.62); bg.addColorStop(0, '#3a3e3c'); bg.addColorStop(0.55, '#262928'); bg.addColorStop(1, '#0c0d0d'); tg.fillStyle = bg; tg.fillRect(0, 0, TW, TH); }
      const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace', pad = this.props.aboutScreenPadX ?? 66, padY = this.props.aboutScreenPadY ?? 60; tg.textBaseline = 'top';
      // safe area = the part of the screen the bezel doesn't cover; shrink the font until the whole text (prompt + body) fits inside it
      const fitN = (f) => { tg.font = '500 ' + f + 'px ' + MONO; let n2 = 1, l2 = ''; for (const w of body.split(' ')) { if (w === '\u2029') { n2 += 2; l2 = ''; continue; } const t = l2 ? l2 + ' ' + w : w; if (tg.measureText(t).width > TW - pad * 2 && l2) { n2++; l2 = w; } else l2 = t; } return n2; };
      let fs = +(this.props.aboutFontSize ?? 23) || 23; { const avail = TH - padY * 2; for (let g = 0; g < 12 && fs > 12 && Math.round(fs * 1.42) * (1.6 + fitN(fs)) > avail; g++) fs -= 1; } const lh = Math.round(fs * 1.42); tg.font = '500 ' + fs + 'px ' + MONO;
      tg.shadowColor = 'rgba(225,245,235,0.55)'; tg.shadowBlur = 7;
      let fullN = 1; { let l2 = ''; for (const w of body.split(' ')) { if (w === '\u2029') { fullN += 2; l2 = ''; continue; } const t = l2 ? l2 + ' ' + w : w; if (tg.measureText(t).width > TW - pad * 2 && l2) { fullN++; l2 = w; } else l2 = t; } }
      const sy = Math.max(padY, (TH - (lh * 1.6 + fullN * lh)) / 2); /* block centred on the full text, so it doesn't shift while typing */
      tg.fillStyle = '#e6efe9'; tg.fillText(prompt.slice(0, 44), pad, sy);
      const words = body.slice(0, n).split(' '), lines = []; let ln = '';
      for (const w of words) { if (w === '\u2029') { lines.push(ln, ''); ln = ''; continue; } if (!w) continue; const t = ln ? ln + ' ' + w : w; if (tg.measureText(t).width > TW - pad * 2 && ln) { lines.push(ln); ln = w; } else ln = t; } lines.push(ln);
      const y0 = sy + lh * 1.6, maxL = Math.floor((TH - y0 - padY) / lh), vis = lines.slice(Math.max(0, lines.length - maxL));
      tg.fillStyle = '#dfe8e2'; vis.forEach((l, i) => tg.fillText(l, pad, y0 + i * lh));
      if (cur) { const last = vis[vis.length - 1] || '', x = pad + tg.measureText(last).width + 3, y = y0 + (vis.length - 1) * lh; tg.fillRect(x, y + 1, fs * 0.58, fs * 1.08); }
      tg.shadowBlur = 0;
      { const sh = tg.createLinearGradient(0, 0, TW * 0.7, TH); sh.addColorStop(0, 'rgba(255,255,255,0.07)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); tg.fillStyle = sh; tg.fillRect(0, 0, TW, TH); }
      tg.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < TH; y += 3) tg.fillRect(0, y, TW, 1);
      if (FRAME) { const ev = tg.createRadialGradient(TW / 2, TH / 2, TH * 0.45, TW / 2, TH / 2, TW * 0.66); ev.addColorStop(0, 'rgba(0,0,0,0)'); ev.addColorStop(1, 'rgba(0,0,0,0.35)'); tg.fillStyle = ev; tg.fillRect(0, 0, TW, TH);
        const rr = 22; tg.globalCompositeOperation = 'destination-in'; tg.fillStyle = '#000'; tg.beginPath(); tg.moveTo(rr, 0); tg.arcTo(TW, 0, TW, TH, rr); tg.arcTo(TW, TH, 0, TH, rr); tg.arcTo(0, TH, 0, 0, rr); tg.arcTo(0, 0, TW, 0, rr); tg.closePath(); tg.fill(); tg.globalCompositeOperation = 'source-over'; }
    };
    const boot = async () => {
      booting = true;
      const B = 'https://esm.sh/three@0.160.0', E = B + '/examples/jsm/';
      const [T, GL, RE] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js')]);
      const r = new T.WebGLRenderer({ antialias: (devicePixelRatio || 1) < 1.5, alpha: true }); r.setPixelRatio(Math.min(1.25, devicePixelRatio || 1)); r.setClearColor(0, 0);
      // GPU resets drop every context at once: keep this one restorable instead of letting the section vanish
      r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }); r.domElement.addEventListener('webglcontextrestored', () => { r.setSize(r.domElement.clientWidth || 1, r.domElement.clientHeight || 1, false); });
      r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
      const c = r.domElement; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c);
      const sc = new T.Scene(), pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose();
      const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(-2, 3, 4); sc.add(key); sc.add(new T.HemisphereLight(0xffffff, 0x222222, 0.5));
      const g = await new GL.GLTFLoader().loadAsync(FRAME ? (window.WB_ASSETS || './') + 'models/monitor-frame-2k.glb' : (window.WB_ASSETS || './') + 'models/crt_monitor.glb'); const m = g.scene;
      const tex = new T.CanvasTexture(tc); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; draw(0, true); tex.needsUpdate = true;
      const U = { tTxt: { value: tex }, uRect: { value: new T.Vector4(0.192, 0.330, 0.505, 0.638) }, uGlow: { value: 1.25 } };
      m.traverse((o) => { if (!o.isMesh) return; o.frustumCulled = false; if (o.parent && o.parent.name === 'Body_low') { const mt = o.material = o.material.clone();
        mt.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
          sh.fragmentShader = 'uniform sampler2D tTxt; uniform vec4 uRect; uniform float uGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
            { vec2 sq = (vMapUv - uRect.xy) / (uRect.zw - uRect.xy);
              if (sq.x > 0.0 && sq.x < 1.0 && sq.y > 0.0 && sq.y < 1.0) { vec2 cq = sq - 0.5; vec2 bu = 0.5 + cq * (1.0 + dot(cq, cq) * 0.12);
                vec3 t = texture2D(tTxt, vec2(bu.x, bu.y)).rgb; float e = smoothstep(0.0, 0.03, min(min(sq.x, 1.0 - sq.x), min(sq.y, 1.0 - sq.y)));
                diffuseColor.rgb = mix(diffuseColor.rgb, t * 0.08, e); totalEmissiveRadiance = mix(totalEmissiveRadiance, t * uGlow, e); } }`); };
        mt.customProgramCacheKey = () => 'wbcrt'; } });
      let inner;
      const P0 = this.props;
      if (FRAME) { // Tripo frame: open bezel tilted back ~40°; our own flat screen sits in the opening (measured), then the whole thing is tilted to face you
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
      const now = performance.now(), dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; if (op < 0.01) { S.n = 0; return; }
      // typewriter (restarts each time About is entered)
      const before = Math.floor(S.n), cur = Math.floor(now / 530) % 2 === 0; S.n = Math.min(body.length, S.n + dt * (P.aboutTypeSpeed ?? 38));
      if (Math.floor(S.n) !== before || cur !== S.cur) { S.cur = cur; draw(Math.floor(S.n), cur || S.n < body.length); S.tex.needsUpdate = true; }
      // smooth float: bob, slow sway, gentle mouse tilt
      const t = now / 1000, sc0 = Math.min(P.aboutMonitorSize ?? 1.25, 1.35 * Math.min(1, (S.cam.aspect || 1) / 1.2)); // monitor + seated astronaut always fit the screen
      S.piv.scale.setScalar(sc0); { const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }, inE = ss(op), outE = ss((window.__wbRA || 0) / 0.6); if (inE > 0.98) S.wasIn = 1; if (op < 0.01) S.wasIn = 0; S.ky = (S.ky ?? 0) + (((S.wasIn || outE > 0.001) ? 0 : (1 - inE) * -1.3) - (S.ky ?? 0)) * (1 - Math.exp(-dt * 5)); /* rises in once, then stays in place on the way out */ S.piv.position.set(0, (Math.sin(t * 0.8) * 0.045 + S.ky) * (1 - ((P.aboutZoom ?? false) ? outE : 0)) + (P.aboutMonitorY ?? 0) * Math.min(1, sc0 / 0.95), 0);
        /* scroll out: fly the camera straight through the screen */ { const Z0 = 1 / Math.tan(15 * Math.PI / 180), oz = outE * outE * (3 - 2 * outE); const zm = (P.aboutZoom ?? false) ? oz : 0; S.cam.position.set(0, (P.aboutMonitorY ?? 0) * Math.min(1, sc0 / 0.95) * zm + (P.aboutZoomY ?? 0.3) * sc0 * zm, Z0 - (Z0 + (P.aboutZoomDepth ?? 0.4)) * zm); S.zo = oz; S.zm = zm; /* S.zo = exit progress (title + astronaut use it); camera only moves when aboutZoom is on */ } }
      S.piv.rotation.y += ((Math.sin(t * 0.35) * 0.16 + S.ms.x * 0.22) * (1 - (S.zm || 0)) - S.piv.rotation.y) * (1 - Math.exp(-dt * 2.5));
      S.piv.rotation.x += ((Math.sin(t * 0.5) * 0.04 + S.ms.y * 0.12) * (1 - (S.zm || 0)) - S.piv.rotation.x) * (1 - Math.exp(-dt * 2.5));
      S.piv.rotation.z = Math.sin(t * 0.6) * 0.025;
      S.U.uGlow.value = (P.aboutScreenGlow ?? 1.25) * (0.97 + 0.03 * Math.sin(t * 50)); if (S_scr) S_scr.material.color.setScalar(0.96 + 0.03 * Math.sin(t * 50));
      // monitor top edge on screen (NDC) for the astronaut to sit on; hold scroll until the text is typed
      if (S.mon) { S.ev.set(0, P.aboutSitY ?? 0.64, P.aboutSitZ ?? -0.07); S.mon.localToWorld(S.ev).project(S.cam); window.__wbMonEdge = { x: S.ev.x, y: S.ev.y }; S.ev.set(P.aboutLandX ?? 0.62, P.aboutLandY ?? 0.04, P.aboutSitZ ?? -0.07); S.mon.localToWorld(S.ev).project(S.cam); window.__wbMonLand = { x: S.ev.x, y: S.ev.y }; window.__wbMonZoom = S.zo || 0; }
      window.__wbAboutOp = op; const done = S.n >= body.length; window.__wbTypeDone = done;
      if (op > 0.9 && !done && !S.locked && !S.freed && !window.__wbAboutHeld && (P.aboutHoldScroll ?? true)) { S.locked = 1; S.lockT = now; this.lockScroll && this.lockScroll(true); }
      if (S.locked && (done || now - S.lockT > 15000)) { S.locked = 0; S.freed = 1; window.__wbAboutHeld = 1; /* pin only the first time */ this.lockScroll && this.lockScroll(false); }
      if (op < 0.01) S.freed = 0;
      S.r.render(S.sc, S.cam);
    };
    tick();
  }
});
