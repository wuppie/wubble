/* Wubble V22: footer moon — the moon rises in front of the WUBBLE letters as the footer reveals,
   then the astronaut drops in and lands on top of it (floating → touchdown squash → "Looking Around").
   One WebGL canvas for moon + astronaut. Fully scroll-driven, so scrolling back up reverses it. */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  initFooterMoon() {
    const ft = document.querySelector('[data-footer]'), sp = document.querySelector('[data-footer-spacer]'); if (!ft || !sp || ft.__moon || ft.querySelector('[data-ft-moon]')) return; ft.__moon = 1;
    const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.setAttribute('data-ft-moon', ''); host.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;'; ft.appendChild(host);
    { const fi = ft.querySelector('[data-footer-inner]'); if (fi) { const cs = fi.style; if (!cs.zIndex || +cs.zIndex < 3) {} } const fb = ft.querySelector('[data-ft-bottom]'); if (fb && fb.closest('[data-footer-inner]')) { const inner = fb.closest('[data-footer-inner]'); inner.style.zIndex = 'auto'; inner.style.isolation = 'auto'; [...inner.children].forEach((ch) => { if (ch !== fb && !ch.style.zIndex) { ch.style.position = ch.style.position || 'relative'; ch.style.zIndex = '1'; } }); fb.style.zIndex = '30'; } } // bottom row (email / ©) sits in front of the moon; the WUBBLE word stays behind it
    const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    const prog = () => { const t = sp.getBoundingClientRect().top; return Math.max(0, Math.min(1, 1 - t / innerHeight)); };
    let S = null, booting = false;
    const boot = async () => {
      booting = true;
      const B = 'https://esm.sh/three@0.160.0', E = B + '/examples/jsm/';
      const [T, GL, RE] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js')]);
      const r = new T.WebGLRenderer({ antialias: (devicePixelRatio || 1) < 1.5, alpha: true }); r.setPixelRatio(Math.min(1.25, devicePixelRatio || 1)); r.setClearColor(0, 0);
      // GPU resets drop every context at once: keep this one restorable instead of letting the section vanish
      r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }); r.domElement.addEventListener('webglcontextrestored', () => { r.setSize(r.domElement.clientWidth || 1, r.domElement.clientHeight || 1, false); });
      r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      const c = r.domElement; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(c);
      const sc = new T.Scene(), pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose();
      const key = new T.DirectionalLight(0xfff6ea, 3.4); key.position.set(-3, 2.2, 1.6); sc.add(key);
      const rim = new T.DirectionalLight(0xa9c6ff, 0.9); rim.position.set(3, 2.5, -2.5); sc.add(rim); const amb = new T.AmbientLight(0x8fa6c8, 0.04); sc.add(amb);
      // low raking sun: long crater shadows, bright limb, near-black night side (real moon photo look)
      const sun = new T.DirectionalLight(0xfff3e2, 6); sc.add(sun); sc.add(sun.target);
      const LD = new GL.GLTFLoader(); try { const MO = await import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js'); LD.setMeshoptDecoder(MO.MeshoptDecoder); } catch (e) {}
      const [mg, ag] = await Promise.all([LD.loadAsync((window.WB_ASSETS || './') + 'models/moon-2k.glb'), LD.loadAsync((window.WB_ASSETS || './') + 'models/astronaut-rig.glb')]);
      // moon: the file uses the old spec-gloss material, so rebuild it from its own texture
      let mtx = null; try { mtx = await mg.parser.getDependency('texture', 0); mtx.colorSpace = T.SRGBColorSpace; mtx.anisotropy = 8; } catch (e) {}
      const moonM = new T.MeshStandardMaterial({ map: mtx, bumpMap: mtx, bumpScale: 2.5, color: 0xe6e6e6, roughness: 0.95, metalness: 0, envMapIntensity: 0.03 });
      // close-up regolith (Poly Haven "gravelly_sand", CC0): tiled grey dust + pebble normals, so the crown he walks on reads like a real lunar surface
      const TL = new T.TextureLoader(), DET = (this.props.footerMoonDetail ?? 1), REP = this.props.footerMoonTile ?? 6;
      const dC = TL.load((window.WB_ASSETS || './') + 'models/moon-surf-color.jpg'), dN = TL.load((window.WB_ASSETS || './') + 'models/moon-surf-normal.jpg');
      for (const t of [dC, dN]) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(REP * 2, REP); t.anisotropy = 8; }
      moonM.userData.det = { uDet: { value: dC }, uDN: { value: dN }, uRep: { value: new T.Vector2(REP, REP).divideScalar(Math.max(1e-3, (() => { let rr = 1; mg.scene.traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingSphere(); rr = o.geometry.boundingSphere.radius; } }); return rr; })())) }, uDA: { value: 0.85 * DET }, uDB: { value: 0.6 * DET } };
      moonM.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, moonM.userData.det);
        // triplanar from object-space position: no pole pinch at the crown, no dependency on the GLB having UVs/map
        sh.vertexShader = 'varying vec3 vOP; varying vec3 vON;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vOP = position; vON = normal;');
        sh.fragmentShader = 'uniform sampler2D uDet, uDN; uniform vec2 uRep; uniform float uDA, uDB; varying vec3 vOP; varying vec3 vON;\nvec3 triD(sampler2D t){ vec3 w = pow(abs(normalize(vON)), vec3(4.0)); w /= (w.x + w.y + w.z); vec3 p = vOP * uRep.x; return texture2D(t, p.yz).rgb * w.x + texture2D(t, p.xz).rgb * w.y + texture2D(t, p.xy).rgb * w.z; }\n' + sh.fragmentShader;
        sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n { vec3 tn = triD(uDN) * 2.0 - 1.0; normal = normalize(normal + (tn.x * normalize(cross(normal, vec3(0.0, 1.0, 0.001))) + tn.y * normalize(cross(normal, vec3(1.0, 0.0, 0.0)))) * uDB); }'); sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb = pow(diffuseColor.rgb, vec3(1.2)) * 1.1;\n { vec3 dc = triD(uDet); float dl = dot(dc, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb *= mix(1.0, dl * 1.55, uDA); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.333))), 0.85); }').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n { float fr = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 3.0); totalEmissiveRadiance += vec3(0.0); }'); };
      const moonR = mg.scene; moonR.traverse((o) => { if (o.isMesh) { o.material = moonM; o.frustumCulled = false; } }); moonR.updateMatrixWorld(true);
      const mb = new T.Box3().setFromObject(moonR), mr = Math.max(...mb.getSize(new T.Vector3()).toArray()) / 2, mc = mb.getCenter(new T.Vector3()); moonR.scale.setScalar(1 / mr); moonR.position.copy(mc).multiplyScalar(-1 / mr);
      const moon = new T.Group(), tilt = new T.Group(); tilt.rotation.x = 1.25; tilt.add(moonR); moon.add(tilt); sc.add(moon); // pole turned toward the camera (off-screen) so the crown shows clean craters
      // astronaut
      const am = ag.scene; am.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.material = new T.MeshStandardMaterial({ color: 0xd2d1cd, metalness: 0.25, roughness: 0.5 }); if (o.isSkinnedMesh && this.applyAstroTex) this.applyAstroTex(T, o).then((mt) => { if (mt) o.material = mt; }).catch(() => {}); } });
      const MX = new T.AnimationMixer(am), ACT = {};
      const flat = (cl) => { for (const tr of cl.tracks) if (/Hips\.position$/.test(tr.name)) { const v = tr.values, x0 = v[0], z0 = v[2]; for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; } } };
      const fl = ag.animations.find((a) => a.name === 'floating'); if (fl) { flat(fl); ACT.float = MX.clipAction(fl); }
      const fy = ag.animations.find((a) => a.name === 'flying'); if (fy) { flat(fy); ACT.fly = MX.clipAction(fy); }
      { const WJ = (window.WB_CLIPS || {}).walk; if (WJ) { const wc = T.AnimationClip.parse(WJ); wc.uuid = T.MathUtils.generateUUID(); flat(wc); ACT.walk = MX.clipAction(wc); } }
      const J = (window.WB_CLIPS || {}).look; if (J) { const lc = T.AnimationClip.parse(J); lc.uuid = T.MathUtils.generateUUID(); flat(lc); ACT.look = MX.clipAction(lc); }
      for (const k in ACT) { ACT[k].play(); ACT[k].setEffectiveWeight(k === 'look' ? 1 : 0); }
      MX.update(0); am.updateMatrixWorld(true);
      const ab = new T.Box3().setFromObject(am, true), ah = ab.max.y - ab.min.y, ac = ab.getCenter(new T.Vector3());
      const astro = new T.Group(), inner = new T.Group(); inner.add(am); astro.add(inner); sc.add(astro);
      am.scale.setScalar(1 / ah); am.position.set(-ac.x / ah, -ab.min.y / ah, -ac.z / ah); // feet at local y=0, height 1
      const cam = new T.OrthographicCamera(-1, 1, 1, -1, -50, 50); const D = 10; cam.position.set(0, 0, D); cam.lookAt(0, 0, 0); // half-height = 1 at z=0
      const size = () => { const w = host.clientWidth || 1, h = host.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.left = -cam.aspect; cam.right = cam.aspect; cam.top = 1; cam.bottom = -1; cam.updateProjectionMatrix(); };
      size(); addEventListener('resize', size);
      S = { T, r, sc, cam, moon, spin: moonR, moonM, astro, inner, MX, ACT, last: performance.now(), land: 0, wLook: 1, L: { sun, key, rim, amb } };
    };
    const tick = () => {
      requestAnimationFrame(tick);
      if ((this.props.footerMoon ?? true) === false) { host.style.display = 'none'; return; } host.style.display = '';
      const p = prog(); window.__wbFootP = p;
      { // photo scenes: full-bleed lunar landscape behind the letters; astronaut stands on the foreground ground line
        const P = this.props, PS = P.footerScene || '3D Moon';
        if (PS === 'Terrain' && this.ftTerrain) { if (this._ftPh) this._ftPh.style.display = 'none'; host.style.display = 'none'; this.ftTerrain(ft, p); return; }
        if (this._ter) { this._ter.host.style.display = 'none'; this._ter.glow.style.display = 'none'; }
        const IMG = { Galaxy: 'ft-moon-galaxy', Earthrise: 'ft-moon-earthrise', Horizon: 'ft-moon-horizon' }[PS];
        if (IMG) { let ph = this._ftPh; if (!ph) { ph = this._ftPh = document.createElement('div'); ph.setAttribute('aria-hidden', 'true'); ph.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;'; ph.innerHTML = '<div style="position:absolute;inset:-6% 0 -6% 0;background-position:center;background-size:cover;will-change:transform;"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,#000 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 70%,rgba(0,0,0,0.35) 100%);"></div>'; ft.insertBefore(ph, ft.firstChild); }
          const im = ph.firstChild, url = 'url(./models/' + IMG + '.webp)'; if (ph.__u !== url) { ph.__u = url; im.style.backgroundImage = url; }
          const e = 1 - Math.pow(1 - sm(0.0, 0.85, p), 3); ph.style.display = ''; ph.style.opacity = sm(0, 0.35, p).toFixed(3);
          im.style.transform = 'translate3d(0,' + ((1 - e) * 14).toFixed(2) + '%,0) scale(' + (1.12 - 0.08 * e).toFixed(4) + ')';
          window.__wbMoonTop = (P.footerGroundY ?? { Galaxy: -0.55, Earthrise: -0.5, Horizon: -0.45 }[PS]);
          host.style.display = 'none'; return; }
        if (this._ftPh) this._ftPh.style.display = 'none';
      }
      if (!S) { if (!booting && (sp.getBoundingClientRect().top < innerHeight * 14 || (document.readyState === 'complete' && performance.now() > (this._ftPre || (this._ftPre = performance.now() + 600))))) boot().catch((e) => { console.warn('footer moon failed', e); }); return; }
      if (!S.warm) { S.warm = 1; try { S.r.compile(S.sc, S.cam); S.r.render(S.sc, S.cam); S.r.clear(); } catch (e) {} }
      const now = performance.now(), dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
      if (p <= 0.001) { if (!S.idle) { S.r.clear(); S.idle = 1; } return; } S.idle = 0;
      const P = this.props, asp = S.cam.aspect;
      // slow, steady spin around the vertical axis: the crown (where he stands) stays put, the craters drift past
      if (S.spin) { S.spinV = (S.spinV || 0) + ((P.footerMoonSpin ?? 0.025) - (S.spinV || 0)) * (1 - Math.exp(-dt * 1.5)); S.spin.rotation.y += dt * S.spinV; }
      // moon: rises from below the screen edge, ends with its top just over the letters
      // huge horizon moon; its crown cuts through the WUBBLE letters (letters sit behind it)
      S.moonM.color.setScalar((P.footerMoonLight || 'Sun') === 'Sun' ? 0.4 + (P.footerMoonBright ?? 0.16) : (P.footerMoonBright ?? 0.16));
      { const SUN = (P.footerMoonLight || 'Sun') === 'Sun', L = S.L; if (L) { L.sun.visible = SUN; L.key.intensity = SUN ? 0 : 3.4; L.rim.intensity = SUN ? 0.12 : 0.9; L.amb.intensity = SUN ? 0.004 : 0.04;
        const a = (P.footerSunAngle ?? 200) * Math.PI / 180, h = (P.footerSunHeight ?? 12) * Math.PI / 180; L.sun.position.set(Math.cos(a) * Math.cos(h) * 10, Math.sin(h) * 10 + 2, Math.sin(a) * Math.cos(h) * 10); L.sun.target.position.set(0, 0, 0); L.sun.intensity = P.footerSunStrength ?? 3.2; S.r.toneMappingExposure = P.footerMoonExposure ?? 0.8;
        { const MET = (P.footerMoonMetal ?? 0.85); S.moonM.metalness = MET; S.moonM.roughness = P.footerMoonRough ?? 0.42; S.moonM.envMapIntensity = MET > 0.01 ? (P.footerMoonEnv ?? 0.9) : (SUN ? 0 : 0.03); if (MET > 0.01) S.moonM.color.setScalar(P.footerMoonTone ?? 0.28); } /* black-metal look, same family as the astronaut suit */ S.moonM.bumpScale = SUN ? (P.footerMoonBump ?? 5) : 2.5; } }
      const R = (P.footerMoonSize ?? 2.4) * Math.max(1, asp * 0.6);
      const wd = ft.querySelector('[data-fl-word]'), hb = host.getBoundingClientRect(); let topY = -0.35;
      if (wd && hb.height) { const wr = wd.getBoundingClientRect(); const yAt = (py) => 1 - 2 * (py - hb.top) / hb.height; topY = yAt(wr.top + wr.height * (1 - (P.footerMoonCover ?? 0.45))); }
      topY += P.footerMoonTop ?? 0; window.__wbMoonTop = topY;
      const mIn = 1 - Math.pow(1 - sm(0.05, 0.7, p), 3);
      S.moon.scale.setScalar(R); const mY = (topY - R) - (1 - mIn) * (R + 1.2); S.moon.position.set(0, mY, 0);
      { const c0 = S.moon.position.clone().project(S.cam), t0 = S.moon.position.clone(); t0.y += R; t0.project(S.cam); window.__wbMoonC = { cy: c0.y, r: t0.y - c0.y }; } // moon circle in screen space, for the main astronaut's rim walk
      // WUBBLE bends along the moon's curve: letters sit on a circle concentric with the moon
      { const wdE = ft.querySelector('[data-fl-word]'), bend = P.footerBend ?? 0;
        if (wdE && hb.height) { const wr = wdE.getBoundingClientRect(), crownPx = hb.top + (1 - topY) * hb.height / 2, Rpx = R * hb.height / 2, cx = hb.left + hb.width / 2;
          for (const el of wdE.children) { const bx = wr.left + (el.offsetLeft - wdE.offsetLeft) + el.offsetWidth / 2 - cx, by = wr.top + (el.offsetTop - wdE.offsetTop) + el.offsetHeight, r = Math.max(Rpx * 0.3, Rpx + (crownPx - by)), dx = Math.max(-r * 0.98, Math.min(r * 0.98, bx));
            const th = Math.asin(dx / r) * bend, dy = (r - Math.sqrt(r * r - dx * dx)) * bend, tv = '0 ' + dy.toFixed(1) + 'px', rv = th.toFixed(4) + 'rad';
            if (el.style.translate !== tv) el.style.translate = tv; if (el.style.rotate !== rv) el.style.rotate = rv; } } }
      // astronaut: drops in after the moon, lands on its top
      const ah = P.footerAstroH ?? 0.42, surf = topY - R * 0.6 * 0 + 0.005;
      window.__wbFootP = p;
      // flight: from the upper right (where the services astronaut was) along an arc down onto the crown
      const dIn = sm(0.3, 0.95, p), u = 1 - Math.pow(1 - dIn, 2.2), cx = mY + R - (P.footerAstroSink ?? 0.03);
      const sx = asp * 0.62, sy = 0.85, px = sx * (1 - u), py = cx + (sy - cx) * (1 - u) + Math.sin(Math.PI * u) * 0.25;
      // walk: after landing he walks around the moon's rim (clockwise), out of view underneath and back in on the other side
      const rr = R - (P.footerAstroSink ?? 0.03), WK = (P.footerWalk ?? true) && S.landed;
      if (!S.landed) { S.wkT = 0; S.phi = 0; S.wkW = 0; } else S.wkT = (S.wkT || 0) + dt;
      const walking = WK && S.wkT > (P.footerWalkDelay ?? 3); S.wkW = (S.wkW || 0) + ((walking ? 1 : 0) - (S.wkW || 0)) * (1 - Math.exp(-dt * 3));
      if (walking) S.phi = (S.phi || 0) + dt * S.wkW * (P.footerWalkSpeed ?? 0.12) * ah / rr * 2;
      { const p0 = S.phi || 0, wx0 = Math.sin(p0) * rr, wy0 = mY + Math.cos(p0) * rr; if (walking && (P.footerWalkWrap ?? true) && p0 > 0 && (wx0 > asp + 0.35 || wy0 < -1.25)) S.phi = -p0; } /* walked out on the right → re-enter from the left */
      const phi = S.phi || 0, wx = Math.sin(phi) * rr, wy = mY + Math.cos(phi) * rr;
      S.astro.position.set(S.landed ? wx : px, S.landed ? wy : py, 0); S.astro.scale.setScalar(ah * (1.5 - 0.5 * u)); S.astro.visible = (P.footerOwnAstro ?? true) && p > 0.3;
      { const dive = 1 - sm(0.7, 0.97, u); S.astro.rotation.z = S.landed ? -phi : dive * 0.9; S.astro.rotation.x = S.landed ? 0 : dive * 0.5; }
      if (S.ACT.fly) S.ACT.fly.setEffectiveWeight((1 - S.wLook) * (1 - sm(0.75, 0.97, u)));
      // touchdown: short squash + settle, then the clip takes over
      if (dIn >= 0.999 && S.landed !== 1) { S.landed = 1; S.land = 0; } else if (dIn < 0.98) S.landed = 0;
      const flyW = S.ACT.fly ? S.ACT.fly.getEffectiveWeight() : 0;
      if (S.landed) S.land = Math.min(1, S.land + dt / 0.6);
      const sq = S.landed ? Math.sin(Math.min(1, S.land) * Math.PI) * 0.09 * (1 - S.land * 0.4) : 0;
      S.inner.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
      S.inner.rotation.y = (P.footerAstroYaw ?? -0.25) * (1 - (S.wkW || 0)) + (S.wkW || 0) * Math.PI / 2 + Math.sin(now / 2600) * 0.05 * (1 - (S.wkW || 0));
      if (S.ACT.walk) S.ACT.walk.setEffectiveWeight(S.wkW || 0); else if (S.wkW) S.inner.position.y = Math.abs(Math.sin(now / 280)) * 0.04 * S.wkW;
      if (S.ACT.walk) S.ACT.walk.timeScale = (P.footerWalkAnim ?? 0.8);
      const wt = S.landed ? 1 : 0; S.wLook += (wt - S.wLook) * (1 - Math.exp(-dt * 5));
      if (S.ACT.look) S.ACT.look.setEffectiveWeight(S.wLook * (S.ACT.walk ? 1 - (S.wkW || 0) : 1)); if (S.ACT.float) S.ACT.float.setEffectiveWeight(Math.max(0, 1 - S.wLook - flyW));
      if (p > 0.001 || (S.p0 ?? 1) > 0.001) { S.MX.update(dt);
        if ((P.footerMoonDither ?? true) && (this.props.ditherStyle ?? true) && this.ditherGLSL && !S.dqBad) { // same dither post-process as the astronaut
          if (!S.dq) { const T = S.T, art = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType }), qS = new T.Scene(), qC = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const qM = new T.ShaderMaterial({ transparent: true, uniforms: { tA: { value: art.texture }, uH: { value: 0 }, uPhoto: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
              fragmentShader: 'uniform sampler2D tA; uniform float uH; uniform float uPhoto; varying vec2 vUv; ' + this.ditherGLSL(2.0) + ' void main(){ vec4 c = texture2D(tA, vUv); vec3 rgb = c.rgb / max(c.a, 0.001); rgb = pow(rgb, vec3(1.0 / 2.2)); rgb = rgb * 1.3 / (1.0 + rgb * 0.55) + 0.02; float a = step(0.5, c.a); gl_FragColor = vec4(DQ(rgb * 1.6), a); }' });
            qS.add(new T.Mesh(new T.PlaneGeometry(2, 2), qM)); S.dq = { art, qS, qC }; }
          const w = S.r.domElement.width, h = S.r.domElement.height; if (S.dq.art.width !== w || S.dq.art.height !== h) S.dq.art.setSize(w, h);
          S.r.setRenderTarget(S.dq.art); S.r.clear(); S.r.render(S.sc, S.cam); S.r.setRenderTarget(null); S.r.clear(); S.r.render(S.dq.qS, S.dq.qC); if (!S.dqOK) { S.dqOK = 1; const prog = S.r.info.programs && S.r.info.programs.find((p) => p.name === 'ShaderMaterial' && p.diagnostics && !p.diagnostics.runnable); if (prog) { console.warn('[moon] dither shader failed, plain render'); S.dqBad = 1; } }
        } else S.r.render(S.sc, S.cam); } S.p0 = p; /* paused while the footer is off screen */
    };
    tick();
  }
});
