/* Wubble glass text: turns a heading into real 3D glass letters (extruded text in the shared wb-glass.js material; load that first).
   The heading's own text stays in the page (search engines, screen readers) but is made invisible; the 3D letters are drawn over it.
   They tilt a little toward the mouse.
   Webflow: put [data-wb-glasstext] on the heading. Options: data-depth="0.25" (extrusion, share of letter height) · data-mouse="1"
   · data-glass-word-bg="#ffffff,#f7f7f5,#d6d7db" (what the glass refracts) · all wb-glass options (data-ior, data-thickness, ...) */
(() => {
  const B = 'https://esm.sh/three@0.186.1' /* one three.js version site-wide (latest) */, E = B + '/examples/jsm/';
  const FONT = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r176/examples/fonts/helvetiker_bold.typeface.json'; // font file only (not in the npm package)
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const init = async (h) => {
    if (h.__wbgt || !window.WBGlass) return; h.__wbgt = 1;
    const at = (k, d) => h.getAttribute('data-' + k) ?? (k === 'glass-word' ? ' ' : k === 'glass-word-bg' ? '#ffffff,#f7f7f5,#d6d7db' : k === 'reflection' ? 1.4 : k === 'glass-color' ? '#ffffff' : k === 'clearcoat' ? 1 : d) /* white glossy glass: a bright backdrop inside, strong reflections */; // ' ' = refraction card without a word
    const [T, FL, TG, RE] = await Promise.all([import(B), import(E + 'loaders/FontLoader.js'), import(E + 'geometries/TextGeometry.js'), import(E + 'environments/RoomEnvironment.js')]);
    const font = new FL.FontLoader().parse(await (await fetch(FONT)).json());
    // the 3D layer sits next to the heading, not inside it: other scripts may split or rebuild the heading's letters
    const box = h.parentElement; if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.style.cssText = 'position:absolute;z-index:31;pointer-events:none;';
    h.after(host); h.style.webkitTextFillColor = 'transparent';
    const place = () => { const st = host.style, ht = h.offsetHeight; const pad = h.offsetWidth * 0.08; st.left = (h.offsetLeft - pad) + 'px'; st.top = (h.offsetTop - ht * 0.25) + 'px'; st.width = (h.offsetWidth + pad * 2) + 'px'; st.height = ht * 1.5 + 'px'; };
    place();
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.setClearColor(0, 0);
    r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.append(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(20, 1, 0.1, 400); cam.position.set(0, 0, 60);
    { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }
    const glass = WBGlass(T, sc, r, at);
    const geo = new TG.TextGeometry(h.textContent.trim(), { font, size: 1, depth: +at('depth', 0.25), curveSegments: 10, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.025, bevelSegments: 4 });
    geo.computeBoundingBox(); const bb = geo.boundingBox; geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
    const mesh = new T.Mesh(geo, glass), W = bb.max.x - bb.min.x; sc.add(mesh);
    let mx = 0, my = 0, tx = 0, ty = 0, last = performance.now(); const MOUSE = +at('mouse', 1), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
    const size = () => { const w = host.clientWidth, ht = host.clientHeight; if (!w || !ht) return; r.setSize(w, ht, false); cam.aspect = w / ht; cam.updateProjectionMatrix();
      // scale the word to the heading's width (the heading box is 2/3 of the canvas height)
      const viewW = 2 * Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * cam.position.z * cam.aspect; mesh.scale.setScalar(viewW * 0.98 / W * (h.offsetWidth / Math.max(1, host.clientWidth))); };
    size(); new ResizeObserver(size).observe(host); new ResizeObserver(place).observe(h);
    const shown = () => { const f = h.closest('[data-footer]'); return !f || getComputedStyle(f).visibility !== 'hidden'; };
    const loop = (now) => { RAF(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!shown()) return; if (host.offsetTop !== Math.round(h.offsetTop - h.offsetHeight * 0.25)) place();
      if (!still) { tx += (mx - tx) * Math.min(1, dt * 3); ty += (my - ty) * Math.min(1, dt * 3); }
      mesh.rotation.set(ty * 0.18 * MOUSE, tx * 0.22 * MOUSE, 0); r.render(sc, cam); };
    RAF(loop);
  };
  const scan = () => document.querySelectorAll('[data-wb-glasstext]').forEach((h) => init(h).catch((e) => console.warn('[glasstext]', e)));
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
