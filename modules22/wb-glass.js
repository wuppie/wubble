/* Wubble glass look (shared by wb-about-astro.js and wb-orbit.js): clear see-through glass, values mirror React Bits FluidGlass.
   Load this before those modules. They call WBGlass(T, scene, renderer, at) and put the returned material on their meshes.
   All modules use the same three.js (0.186.1).
   Attributes (on the effect's element): data-ior="1.5" · data-thickness="1.4" · data-dispersion="0.35" · data-reflection="1"
   · data-roughness · data-clearcoat · data-specular · data-glass-color · data-tint · data-glass-side="front" · data-exposure
   data-glass-word="wubble": a headline only the glass sees (like FluidGlass's text), on a card that fills the view behind the
   glass, drawn only into the transmission pass. data-glass-word-y="0.22" (centre, 0 = top) · data-glass-word-color
   · data-glass-word-bg (one colour, or a comma list = linear gradient) · data-glass-word-angle="55" · data-glass-word-depth="2.5"
   (how far past the scene centre the card sits; push it back when objects move behind the centre) */
window.WBGlass = (T, sc, r, at) => {
  const gm = new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: +at('roughness', 0.04), transmission: 1, ior: +at('ior', 1.5), thickness: +at('thickness', 1.4),
    clearcoat: +at('clearcoat', 1), clearcoatRoughness: 0.03, envMapIntensity: +at('reflection', 1), attenuationColor: new T.Color(at('glass-color', '#ffffff')),
    attenuationDistance: 3 / Math.max(0.01, +at('tint', 0)), specularIntensity: +at('specular', 1),
    side: at('glass-side', 'double') === 'front' ? T.FrontSide : T.DoubleSide }); // front = outer skin only, fewer inner reflections
  gm.dispersion = +at('dispersion', 0.35) * 10; // FluidGlass 0..1 -> three 0..10
  r.toneMappingExposure = +at('exposure', 1.1);
  const WORD = at('glass-word', '');
  if (!WORD) return gm;
  const wc = document.createElement('canvas'), wx = wc.getContext('2d'), wt = new T.CanvasTexture(wc); wt.colorSpace = T.SRGBColorSpace;
  // opaque on purpose: the transmission pass only draws opaque objects; the card is the glass's backdrop
  const wm = new T.MeshBasicMaterial({ map: wt, toneMapped: false, depthTest: false }), wq = new T.Mesh(new T.PlaneGeometry(1, 1), wm);
  let wAsp = 0; const dir = new T.Vector3(), DEPTH = +at('glass-word-depth', 2.5);
  const paint = (asp) => { wAsp = asp; wc.width = 2048; wc.height = Math.round(2048 / asp);
    const bgs = at('glass-word-bg', '#060607').split(','), W = wc.width, H = wc.height;
    if (bgs.length > 1) { const a = T.MathUtils.degToRad(+at('glass-word-angle', 55)), dx = Math.sin(a), dy = -Math.cos(a), half = (Math.abs(dx) * W + Math.abs(dy) * H) / 2;
      const gr = wx.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half); bgs.forEach((c, i) => gr.addColorStop(i / (bgs.length - 1), c.trim())); wx.fillStyle = gr; }
    else wx.fillStyle = bgs[0];
    wx.fillRect(0, 0, W, H);
    wx.font = '800 100px Switzer, Helvetica, sans-serif'; const fs = 100 * W * 0.87 / Math.max(1, wx.measureText(WORD).width);
    wx.font = `800 ${fs}px Switzer, Helvetica, sans-serif`; wx.fillStyle = at('glass-word-color', '#e9eef2'); wx.textAlign = 'center'; wx.textBaseline = 'middle';
    wx.fillText(WORD, W / 2, H * +at('glass-word-y', 0.22)); wt.needsUpdate = true; };
  wq.frustumCulled = false; wq.renderOrder = -1; sc.add(wq);
  // exact check: draw the card only into the buffer this glass samples (three's transmission buffer), never into any other pass
  let GU = null; const pc = gm.onBeforeCompile; gm.onBeforeCompile = (s, r2) => { GU = s.uniforms; if (pc) pc(s, r2); };
  wq.onBeforeRender = (rr, s0, cam) => { const rt = rr.getRenderTarget(), ts = GU && GU.transmissionSamplerMap, inT = !!rt && !!ts && rt.texture === ts.value; wm.colorWrite = inT; wm.depthWrite = inT;
    if (Math.abs(cam.aspect - wAsp) > 0.02) paint(cam.aspect);
    const d = cam.position.length() + DEPTH, h = 2 * Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * d; cam.getWorldDirection(dir);
    wq.position.copy(cam.position).addScaledVector(dir, d); wq.quaternion.copy(cam.quaternion); wq.scale.set(h * cam.aspect, h, 1); wq.updateMatrixWorld(); };
  document.fonts?.ready.then(() => { wAsp = 0; }); // repaint once Switzer has loaded
  return gm;
};
