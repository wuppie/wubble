/* Wubble V22 module: rigged astronaut ("Looking Around") centred between WUB|BLE in the footer word */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  footerAstro(ft, AS) {
    let started = false, on = false, run = null;
    const io = new IntersectionObserver(async (en) => {
      const vis = en[0].isIntersecting;
      if (vis && !started) {
        await new Promise((res) => { const w = () => { if (this.dead) return; const rc = ft.getBoundingClientRect(); if (getComputedStyle(ft).visibility !== 'hidden' && rc.top < innerHeight && rc.bottom > 0) res(); else setTimeout(w, 300); }; w(); });
        if (started) return; started = true;
        try {
          const [T, GL, RE] = await Promise.all([import('https://esm.sh/three@0.186.1'), import('https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.186.1/examples/jsm/environments/RoomEnvironment.js')]);
          if (this.dead) return;
          const g = await new GL.GLTFLoader().loadAsync((this.props.footerAstroModel || '').trim() || './models/astronaut-rig.glb');
          let r = null; const sc = new T.Scene();
          const mkR = () => { r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setClearColor(0, 0);
            r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
            const c = r.domElement; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; AS.appendChild(c); c.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setTimeout(() => { if (this.dead || !on) return; dropR(); mkR(); dispatchEvent(new Event('resize')); }, 1200); });
            const pm = new T.PMREMGenerator(r); if (sc.environment) sc.environment.dispose(); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); };
          const dropR = () => { if (!r) return; r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; };
          this._ftR = { mkR, dropR, alive: 1 }; mkR();
          const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(1.5, 2.5, 3); sc.add(key); sc.add(new T.HemisphereLight(0xffffff, 0x444444, 0.8));
          const m = g.scene; m.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.material = new T.MeshStandardMaterial({ color: 0xd2d1cd, metalness: 0.25, roughness: 0.5, envMapIntensity: 0.9 }); } });
          if ((this.props.astroLook || 'Textured') === 'Textured' && this.applyAstroTex) m.traverse((o) => { if (o.isSkinnedMesh) this.applyAstroTex(T, o).then((mt) => { if (mt) o.material = mt; }).catch(() => {}); });
          const piv = new T.Group(); piv.add(m); sc.add(piv);
          const MX = new T.AnimationMixer(m); const J = (window.WB_CLIPS || {}).look;
          const clip = J ? T.AnimationClip.parse(J) : g.animations.find((a) => a.name === 'floating'); if (J) clip.uuid = T.MathUtils.generateUUID();
          for (const tr of clip.tracks) if (/Hips\.position$/.test(tr.name)) { const v = tr.values, x0 = v[0], z0 = v[2]; for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; } }
          MX.clipAction(clip).play(); MX.update(0); m.updateMatrixWorld(true);
          // fit: whole body height fills the slot, centred on the slot
          const bb = new T.Box3().setFromObject(m, true), sz = bb.getSize(new T.Vector3()), ce = bb.getCenter(new T.Vector3()), k = 1 / sz.y;
          m.scale.setScalar(k); m.position.copy(ce).multiplyScalar(-k); piv.rotation.y = this.props.footerAstroYaw ?? -0.25;
          const cam = new T.PerspectiveCamera(24, 1, 0.1, 50);
          const hips = m.getObjectByName('mixamorigHips'), hp = new T.Vector3(), hp0 = new T.Vector3(); hips.getWorldPosition(hp0);
          const size = () => { const w = AS.clientWidth || 1, h = AS.clientHeight || 1; if (r) r.setSize(w, h, false); cam.aspect = w / h; const fill = this.props.footerAstroFill ?? 1.02; cam.position.set(0, 0, (0.5 / fill) / Math.tan(cam.fov * Math.PI / 360)); cam.updateProjectionMatrix(); };
          size(); addEventListener('resize', size); new ResizeObserver(size).observe(AS);
          let last = performance.now();
          run = () => { if (this.dead) return; requestAnimationFrame(run); if (!on || !r) { last = performance.now(); return; } const now = performance.now(); MX.update(Math.min(0.05, (now - last) / 1000)); last = now;
            // keep him centred horizontally even if the clip sways the hips
            hips.getWorldPosition(hp); piv.position.x -= (hp.x - hp0.x) * 0.15; r.render(sc, cam); };
          on = vis; run();
        } catch (e) { console.warn('footer astro failed', e && (e.message || e.type || e), e && e.target && e.target.src); }
        return;
      }
      on = vis; const F = this._ftR; if (F) { clearTimeout(this._ftDT); if (vis) { if (!F.alive) { F.mkR(); F.alive = 1; addEventListener('resize', () => {}, { once: true }); dispatchEvent(new Event('resize')); } } else this._ftDT = setTimeout(() => { if (0) F.dropR(); F.alive = 0; }, 1500); }
    }, { rootMargin: '200px' });
    io.observe(ft);
  }
});
