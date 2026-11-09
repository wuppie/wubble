/* modules22/wb-glass.js */
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
  /* glass-live="<canvas selector>": that canvas (e.g. the homepage work helix) is drawn over the backdrop each frame, faded by window[glass-live-var], so the glass refracts it */
  const LIVE = matchMedia('(pointer: coarse)').matches ? '' : at('glass-live', '') /* phones: no live copy of another canvas (GPU memory) */, LVAR = at('glass-live-var', ''); let base = null, plain = null, liveOn = false;
  const paint = (asp) => { wAsp = asp; const CW = matchMedia('(pointer: coarse)').matches ? 512 : LIVE ? 1024 : 2048; /* phones: the blurred backdrop needs no big texture */ wc.width = CW; wc.height = Math.round(CW / asp);
    const bgs = at('glass-word-bg', '#060607').split(','), W = wc.width, H = wc.height;
    if (bgs.length > 1) { const a = T.MathUtils.degToRad(+at('glass-word-angle', 55)), dx = Math.sin(a), dy = -Math.cos(a), half = (Math.abs(dx) * W + Math.abs(dy) * H) / 2;
      const gr = wx.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half); bgs.forEach((c, i) => gr.addColorStop(i / (bgs.length - 1), c.trim())); wx.fillStyle = gr; }
    else wx.fillStyle = bgs[0];
    wx.fillRect(0, 0, W, H);
    if (LIVE) { plain = plain || document.createElement('canvas'); plain.width = W; plain.height = H; const pg = plain.getContext('2d'); pg.drawImage(wc, 0, 0);
      /* the live (helix) backdrop gets the /work page's own word, so the glass looks the same as on /work: data-glass-live-word="work" at data-glass-live-word-y */
      const LW = at('glass-live-word', 'work'); if (LW) { pg.font = '800 100px Switzer, Helvetica, sans-serif'; const fs2 = 100 * W * 0.87 / Math.max(1, pg.measureText(LW).width);
        pg.font = `800 ${fs2}px Switzer, Helvetica, sans-serif`; pg.fillStyle = at('glass-word-color', '#e9eef2'); pg.textAlign = 'center'; pg.textBaseline = 'middle'; pg.fillText(LW, W / 2, H * +at('glass-live-word-y', 0.75)); } }
    wx.font = '800 100px Switzer, Helvetica, sans-serif'; const fs = 100 * W * 0.87 / Math.max(1, wx.measureText(WORD).width);
    wx.font = `800 ${fs}px Switzer, Helvetica, sans-serif`; wx.fillStyle = at('glass-word-color', '#e9eef2'); wx.textAlign = 'center'; wx.textBaseline = 'middle';
    wx.fillText(WORD, W / 2, H * +at('glass-word-y', 0.22)); wt.needsUpdate = true;
    if (LIVE) { base = base || document.createElement('canvas'); base.width = W; base.height = H; base.getContext('2d').drawImage(wc, 0, 0); liveOn = false; } };
  wq.frustumCulled = false; wq.renderOrder = -1; sc.add(wq);
  // exact check: draw the card only into the buffer this glass samples (three's transmission buffer), never into any other pass
  let GU = null; const pc = gm.onBeforeCompile; gm.onBeforeCompile = (s, r2) => { GU = s.uniforms; if (pc) pc(s, r2); };
  wq.onBeforeRender = (rr, s0, cam) => { const rt = rr.getRenderTarget(), ts = GU && GU.transmissionSamplerMap, inT = !!rt && !!ts && rt.texture === ts.value; wm.colorWrite = inT; wm.depthWrite = inT;
    if (Math.abs(cam.aspect - wAsp) > 0.02) paint(cam.aspect);
    if (LIVE && inT && base) { const src = document.querySelector(LIVE), k = LVAR ? Math.max(0, Math.min(1, +window[LVAR] || 0)) : 1;
      if (src && k > 0.01) { wx.globalAlpha = 1; wx.drawImage(plain, 0, 0); wx.globalAlpha = 1 - k; wx.drawImage(base, 0, 0); wx.globalAlpha = k; wx.drawImage(src, 0, 0, wc.width, wc.height); /* the hero word cross-fades to the /work backdrop as the live canvas fades in, so it never shows through the cards */ wx.globalAlpha = 1; wt.needsUpdate = true; liveOn = true; }
      else if (liveOn) { wx.drawImage(base, 0, 0); wt.needsUpdate = true; liveOn = false; } }
    const d = cam.position.length() + DEPTH, h = 2 * Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * d; cam.getWorldDirection(dir);
    wq.position.copy(cam.position).addScaledVector(dir, d); wq.quaternion.copy(cam.quaternion); wq.scale.set(h * cam.aspect, h, 1); wq.updateMatrixWorld(); };
  document.fonts?.ready.then(() => { wAsp = 0; }); // repaint once Switzer has loaded
  return gm;
};

;
/* wubble-v22-r14.js */
/* r14.15: never run inside the Webflow Designer canvas — there the script painted colours/glows that aren't in the Style panel */
if (/(^|\.)(design|canvas|preview)\.webflow\.com$|webflow\.com$/.test(location.hostname) && !/\.webflow\.io$/.test(location.hostname) || document.documentElement.classList.contains('w-editor') || window.__WEBFLOW_DESIGNER__ /* r14.61: an iframe on webflow.com (Made in Webflow showcase) is NOT the Designer — the effects run there too */ || (window.Webflow && Webflow.env && (Webflow.env('design') || Webflow.env('editor')))) { console.info('wubble: Designer detected, effects off'); document.documentElement.classList.add('wb-reveal', 'wb-done'); (function () { var st = document.createElement('style'); st.textContent = '[data-w="loader"],[data-wh="loader"],.wb-loader{display:none!important}'; (document.head || document.documentElement).appendChild(st); })(); } else {
/* r14.16: sandboxed iframes (e.g. the Made in Webflow showcase) block sessionStorage/localStorage — use a safe in-memory fallback */
window.__wbSS = (function () { try { var s = window.sessionStorage; s.setItem('__wbT', '1'); s.removeItem('__wbT'); return s; } catch (e) { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; } }; } })();
try { window.localStorage && window.localStorage.getItem('__wbT'); } catch (e) { try { Object.defineProperty(window, 'localStorage', { value: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} }, configurable: true }); } catch (e2) {} }
/* wubble V20 for Webflow — runs the exact Claude Design V13 logic on native Webflow elements.
   Layout/styling lives in Webflow (w13-* classes). Elements the animation drives carry data-w / data-* hooks. */
(function () {
if (window.__wubbleV20) return; window.__wubbleV20 = true;
// ---------- live-only layout: in the Webflow Designer sections stack normally; on the live site the scroll staging switches on ----------
document.documentElement.classList.add('wb-live');
(function () { var L = document.createElement('style'); L.id = 'wb-live-css'; L.textContent = [
  'html:not(.wb-done){overflow:hidden!important}html:not(.wb-done) body{overflow:hidden!important;touch-action:none}',
  'html.wb-live [data-wb-cms]{display:none!important}',
  'html.wb-live [data-wb-svc-img]{display:none!important}',
  /* showcase fallbacks: native Webflow videos/images that only show where custom code does not run */
  'html.wb-live [data-wb-fallback]{display:none!important}',
  'html.wb-live [data-w="hero"],html.wb-live [data-wh="hero"]{position:sticky;top:0;height:100vh;height:100lvh}',
  'html.wb-live [data-w="work"],html.wb-live [data-wh="work"]{height:var(--wb-len,815vh);margin-top:-100vh}',
  'html.wb-live [data-panel]{position:sticky;top:0}',
  'html.wb-live [data-w="ui"],html.wb-live [data-wh="ui"]{opacity:0}',
  'html.wb-live [data-w="cta"],html.wb-live [data-wh="cta"]{height:var(--wb-len,965vh);margin-top:-245vh}',
  'html.wb-live [data-cta-panel]{position:sticky;top:0;height:100vh;overflow:hidden}',
  'html.wb-live [data-hero3]{position:absolute;left:clamp(20px,6vw,96px);right:0;top:0}',
  'html.wb-live [data-about]{position:absolute;top:0;right:0;bottom:0;left:0;min-height:0;opacity:0}',
  'html.wb-live [data-w="reach"],html.wb-live [data-wh="reach"]{height:var(--wb-len,420vh);margin-top:-245vh}',
  'html.wb-live [data-reach-panel]{position:sticky;top:0;opacity:0}',
  'html.wb-live [data-footer-spacer]{height:70vh}',
  'html.wb-live [data-footer]{position:fixed;left:0;right:0;bottom:0;z-index:55;visibility:hidden}',
  'html.wb-live [data-footer-dim]{opacity:0.8}',
  'html.wb-live [data-hero-front]{display:block;position:fixed}',
  'html.wb-live [data-site-frame],html.wb-live [data-w="chrome"],html.wb-live [data-wh="chrome"]{position:fixed}'
].join('\n'); (document.head || document.documentElement).appendChild(L); })();
// per-section scroll length from Webflow: data-wb-length="815" (in vh)
document.addEventListener('DOMContentLoaded', function () { document.querySelectorAll('[data-wb-length]').forEach(function (el) { var v = parseFloat(el.getAttribute('data-wb-length')); if (v > 0) el.style.setProperty('--wb-len', v + 'vh'); }); });
 console.info('wubble: build V22-webflow r14.62 (2026-11-03)');
var BASE = (document.currentScript && document.currentScript.dataset.base) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/';
(function () { try { var B = (document.currentScript && document.currentScript.getAttribute('data-base')) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/'; var q = '-1k'; /* the 2K set follows after load (wb-astro.js) */
  [['models/astronaut-rig-v2.glb', 'fetch'], ['models/astro-tex-color' + q + '.webp', 'image'], ['models/astro-tex-mr' + q + '.webp', 'image'], ['models/astro-tex-normal' + q + '.webp', 'image']].forEach(function (f) { var l = document.createElement('link'); l.rel = 'preload'; l.as = f[1]; l.href = B + f[0]; l.crossOrigin = 'anonymous'; if (f[1] === 'fetch') l.setAttribute('fetchpriority', 'high'); document.head.appendChild(l); });
  ['https://esm.sh/three@0.186.1', 'https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js', 'https://esm.sh/three@0.186.1/examples/jsm/libs/meshopt_decoder.module.js'].forEach(function (u) { var l = document.createElement('link'); l.rel = 'modulepreload'; l.href = u; l.crossOrigin = 'anonymous'; document.head.appendChild(l); });
  ['https://esm.sh', 'https://cdn.jsdelivr.net'].forEach(function (u) { var l = document.createElement('link'); l.rel = 'preconnect'; l.href = u; l.crossOrigin = 'anonymous'; document.head.appendChild(l); }); } catch (e) {} })(); /* r14.5/14.8: astronaut files + three.js start downloading immediately */
var DEFAULTS = {"aboutMonitor":"Model","sectionFx":"Smoke","sectionFxBlur":14,"footerScene":"3D Moon","footerGroundY":-0.55,"galaxyBg":true,"astroIdle":"Falling","astroLook":"Textured","astroTexEnv":1,"astroTexMetal":1,"astroTexRough":1,"astroTexNormal":1,"heroTitleFx":"None","cloudTypeOpacity":0.4,"cloudTypeStep":1.2,"heroStart":0.04,"heroSpan":0.16,"cloudFront":0.4,"footerCurve":0.14,"astroFaceTex":false,"astroFaceSize":1.07,"astroFaceX":0,"astroFaceY":0,"astroFaceLight":0,"clouds":true,"cloudAmount":1,"cloudSpeed":1,"astroWorkY":0.3,"astroWorkScale":0.8,"astroFly2Start":0.71,"astroTumbleStart":0.6,"astroFlight":270,"spaceFlight":true,"spaceWarp":1.8,"spaceRest":0.85,"astroTexture":"Metal012","astroTexScale":0.004,"astroTexContrast":5.4,"astroChrome":true,"astroMetal":0.85,"astroRough":0.87,"astroChromeColor":"#e8e6e1","astroShadows":0.45,"astroEnv":1.75,"astroFaceColor":"#d8d4cc","astroVisorColor":"#1c1e24","astroVisorR":0.8,"astroVisorCone":0.35,"astroFlyPitch":0.9,"astroFlyYaw":0.4,"astroFlyRoll":-0.25,"astroClipSpeed":1,"astroRig":true,"displayFont":"Oswald","heroTitleSize":1,"sectionTitleSize":1,"workTitleSize":2.3,"bodySize":1,"labelSize":11,"ctaScene":"Ascent","sectionBleed":true,"hero3D":true,"sectionRotate":true,"sectionZoom":2,"smoothScroll":true,"scrollLerp":0.14,"lightIntensity":1,"relief":1,"grain":1.4,"bgSpeed":1,"viewCursor":true,"customCursor":true,"inkLinger":0.6,"curvature":0.18,"ribbonTilt":1.8,"velocityBend":2,"hoverDistortion":2,"cornerRadius":0.12,"reflections":true,"reflectionStrength":0.1,"showGrid":false,"video2":"https://threejs.org/examples/textures/sintel.mp4","workLayout":"Ribbon","ringTiltX":0.12,"ringTiltZ":0.06,"workWord":"Work","weaveDepth":0.35,"weaveDrop":0.55,"workWordSize":0.62,"workWordY":0.4,"workWordX":0,"workWordSpacing":0.03,"workWordWeight":600,"workWordColor":"#ffffff","workWordOpacity":1,"workWordShadow":0.6,"astroGlobal":true,"galaxySize":1.25,"ditherStyle":true,"ditherSize":1,"ditherGain":1.15,"galaxyBright":0.14,"astroBright":0.7,"astroFaceDown":1.6,"astroMouse":2,"heroLight":true,"heroLightBg":"#ffffff","heroLightInk":"#0a0a0a","astroHoverReveal":true,"astroJets":true,"warpAmount":2,"letterStorm":0,"titleMorph":true,"astroFlag":false,"ribbonY":-0.51,"reachTitle":"Reach Out","pageBg":"#0e0e0d","textColor":"#ece9e2","aboutBg":"#040506","aboutText":"#f2f2f0","footerBg":"#030303","footerText":"#f2f2f0","infoBg":"#f2f1ed","infoText":"#151412","astroHoverLight":1.5,"transitionStyle":"Bleed","velocityFx":false,"directScrub":false,"screenVideoOn":true,"hero3Size":1.2,"computerLight":0.2,"scrubDim":0.41,"screenGain":1.1,"scrubStart":0.1,"grainBg":true,"grainAmount":0.03,"astroLandX":0.42,"astroLandY":0.19,"astroLandSize":1,"astroFallStyle":"Drift","astroFallRoll":0.95,"astroExitStart":1,"servicesModel":false,"heroGrainAmount":0,"heroGrainIn":0.4,"heroGrainSize":0.61,"clickVolume":0.5,"robotMorph":false,"robotScale":1.72,"robotMorphSeconds":3.6,"astroPath":true,"astroLimbCycles":25,"robotMorphRange":0.7,"astroFallPitch":1.35,"footerFigure":false,"footerFigureSize":1.5,"monitorFill":2,"monitorShade":0.42,"monitorStart":0.67,"monitorDetect":false,"astroClip":true,"astroClipLoops":1.5,"astroClipAmount":1,"monitorX":0.07,"monitorY":0,"svcScrubStart":2.9,"svcScrubLen":0.8,"heroStudio":true,"servicesBg":"#0e0e0d","servicesText":"#ece9e2","rockOnW":true,"astroShadowSoft":12.5,"astroShadowStrength":1.3,"termPadX":0.12,"termPadY":0.15,"termManual":false,"termScaleX":0.3,"termScaleY":null,"termOffsetY":-0.4,"termOn3D":true,"termGlassInset":0,"glassX":0.045,"glassY":0,"glassW":1,"glassH":1,"footerHover":"None","footerSpriteColors":"#c8612c","footerSpriteFrames":16,"footerSpriteFps":24,"termTypeStart":0.5,"termTypeEnd":1.11,"curvedGrid":true,"curvedGridOpacity":0.22,"curvedGridCells":64,"curvedGridParallax":0.35,"monitorBuilt":true,"hoverMetal":true,"workBg":"#0e0e0d","heroBg":"#ffffff","astroFloorShadow":true,"astroFloorOpacity":0.4,"astroFloorGap":0.12,"reachBg":"#0e0e0d","reachText":"#ece9e2","reachRay":"#b8b4ae","reachHand":"#8f8b85","astroPush":true,"astroPushEvery":6,"astroPushBounce":22,"astroInTerminal":true,"astroPhysics":true,"astroSoftness":1,"astroBreath":1,"astroFistCurl":1.35,"astroFistAxis":"z","astroClipHQ":true,"astroClipIdle":0.85,"astroClipBoost":3.5,"astroClipName":"Falling","astroFallBoost":1,"astroLand":false,"astroLandAmount":0.9,"astroLandSpeed":1.65,"astroJointGuard":false,"astroArmAnims":false,"astroMotion":"Layered","astroTumbleSpeed":1,"cloudFog":"#ffffff","cloudSplit":200,"handStyle":"Chrome","handGlass":true,"handBloom":0.55,"handTrail":0.9,"galaxyThroughHero":1,"heroBgFadeSpeed":25.7,"loaderAstro":false,"handExposure":0.75,"astroPathMul":2.5,"cursorInk":true,"footerTitleFx":"Plain","cloudTypeSize":0.55,"cloudEngine":"WebGL","footerMoon":true,"footerMoonSize":2.4,"footerMoonTop":0,"footerAstroH":0.5,"footerMoonCover":0.45,"footerMoonBright":0.12,"footerBend":0,"footerAstroSink":0.03,"aboutMonitorSize":1.25,"aboutTypeSpeed":38,"aboutScreenGlow":1.6,"aboutGalaxy":true,"astroTumbleAt":0.8,"reachSection":false,"astroMoonLift":0,"astroMoonScale":0.45,"footerOwnAstro":false,"aboutMonitorModel":"Frame","aboutScreenW":0.875,"aboutScreenH":0.58,"aboutScreenFwd":0.065,"aboutFrameTone":0.32,"astroMoonX":0,"astroSit":true,"aboutHoldScroll":true,"astroSitLift":0.185,"aboutSitY":0.64,"aboutMonitorY":0,"footerTerrainCamY":0,"footerTerrainLook":0,"footerTerrainStand":16,"footerTerrainScale":140,"aboutFontSize":23,"aboutLandX":0.62,"aboutLandY":-0.1,"aboutZoomDepth":0.4,"astroHoverDither":true,"aboutZoom":false,"footerMoonLight":"Sun","footerSunAngle":-18,"footerSunHeight":10,"footerSunStrength":4.2,"footerMoonBump":7,"astroAboutDown":0.3,"webglBg":false,"workHold":0.8,"astroHoloColor":"#ffffff","astroHoloStripes":20,"astroHoloGlitch":1,"astroHoloAdd":false,"globeRadius":1.4,"globePull":0.25,"globeGap":1,"astroHoloRandom":true,"astroHoloEvery":9,"astroHoloIn":0.7,"astroHoloOut":0.9,"astroHoloHide":0.85,"footerWalk":true,"footerWalkSpeed":0.12,"footerWalkDelay":3,"textScramble":true,"scrambleBase":0.6,"scrambleMax":1.4,"footerWalkAnim":0.8,"footerMoonSpin":0.012,"footerMoonDetail":0,"footerMoonTile":6,"footerMoonExposure":0.9,"footerMoonDither":false,"footerMoonMetal":0.85,"footerMoonRough":0.42,"footerMoonEnv":0.9,"footerMoonTone":0.28,"aboutScreenPadX":66,"aboutScreenPadY":60,"aboutTitleFx":"ASCII","asciiCell":9,"asciiWave":1,"asciiSpeed":1,"footerTitleFx":"ASCII","linkHover":true,"linkHoverDur":0.5,"linkHoverStagger":0.022};

// ---------- head: fonts, base css, lenis, 3D viewer ----------
var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Syne:wght@500;700;800&family=Space+Grotesk:wght@500;700&family=Unbounded:wght@500;700&family=Inter+Tight:wght@500;700;800&family=Archivo:wght@500;700;900&family=Big+Shoulders+Display:wght@600;800&family=Instrument+Serif:ital@0;1&display=swap"; document.head.appendChild(lk);
var st = document.createElement('style'); st.textContent = `
html{overflow-x:clip!important;overflow-y:auto!important;height:auto!important;overscroll-behavior:none;-webkit-text-size-adjust:100%;touch-action:pan-y}
body{margin:0;background:var(--bg-page,#0e0e0d);height:auto!important;overflow:visible!important;overflow-x:clip!important;overscroll-behavior:none;max-width:100vw}
section{max-width:100vw;overflow-x:clip}
html{background:var(--bg-page,#0e0e0d)}
.dc-root{height:auto!important}
a{color:var(--ink,#ece9e2);text-decoration:none}
a:hover{color:#ece9e2}
html.lenis,html.lenis body{height:auto}
html.lenis.lenis-smooth{overscroll-behavior:none}
html.lenis.lenis-smooth body{overscroll-behavior:none;touch-action:pan-y}
.lenis.lenis-smooth{scroll-behavior:auto!important}
.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}
@keyframes pgIn{from{opacity:0}to{opacity:1}}
@keyframes pgOut{from{opacity:1}to{opacity:0}}
@keyframes pgUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}

[data-wh="root"]{min-height:100vh}`; document.head.appendChild(st);
function loadScript(src, mod) { return new Promise(function (r) { var e = document.createElement('script'); if (mod) e.type = 'module'; e.src = src; e.onload = r; e.onerror = r; document.head.appendChild(e); }); }
var lenisReady = Promise.all([window.Lenis ? Promise.resolve() : loadScript('https://unpkg.com/lenis@1.1.13/dist/lenis.min.js'), window.gsap ? Promise.resolve() : loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js')]);
var VQ = (document.currentScript && document.currentScript.dataset.v) ? '?v=' + document.currentScript.dataset.v : '';

// ---------- r14: load the V22 modules (same order as the design) before booting ----------
window.WB_ASSETS = window.WB_ASSETS || BASE;
var WB_MODS = ["modules22/wb-clip-fall.min.js","modules22/wb-clip-wave.min.js","modules22/wb-clip-tumble.min.js","modules22/wb-astro.js","modules22/wb-ribbon.js","modules22/wb-sections.js","modules22/wb-ui.js","modules22/wb-crt3d.js","modules22/wb-ftmoon.js","modules22/wb-space.js","modules22/wb-clouds-gl.js","modules22/wb-clouds.js","modules22/wb-cloudtype.js","modules22/wb-linkhover.js","modules22/wb-scramble.js","modules22/wb-clip-look.min.js","modules22/wb-clip-walk.min.js","modules22/wb-clip-drop.min.js"], WB_LIBS = ["https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js","https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"];
/* r14.6: all modules download in PARALLEL; async=false keeps their execution order */
function wbLoadSeq(list, i, done) { if (!list.length) return done(); var left = list.length, fin = function () { if (--left === 0) done(); }; list.forEach(function (u) { var s = document.createElement('script'); s.src = u; s.async = false; s.onload = s.onerror = fin; (document.head || document.documentElement).appendChild(s); }); }
var wbModsReady = new Promise(function (res) { var libs = WB_LIBS.filter(function (u) { return !(/gsap/.test(u) && window.gsap) && !(/lenis/.test(u) && window.Lenis); }); wbLoadSeq(libs.concat(window.WB_BUNDLED ? [BASE + 'bundles/r14-mods' + (window.WB_BUNDLE_EXT || '.js') + VQ] /* one request instead of ~19 */ : WB_MODS.map(function (m) { return BASE + m + VQ; })), 0, res); });
// ---------- r14: create decorative layers the modules need when the Webflow page doesn't have them ----------
function wbEnsure(root) {
  var mk = function (attr, css, parent, before) { if (document.querySelector('[' + attr + ']')) return null; var e = document.createElement('div'); e.setAttribute(attr, ''); e.setAttribute('aria-hidden', 'true'); e.style.cssText = css; (parent || root).insertBefore(e, before || null); return e; };
  var work = document.querySelector('[data-wh="work"],[data-w="work"]');
  mk('data-clouds-back', 'position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;', root, work);
  mk('data-clouds-front', 'position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden;', root, work);
  var missing = ['data-hero-front', 'data-about-title', 'data-avail', 'data-fl-word', 'data-ft-bottom', 'data-footer-spacer', 'data-about', 'data-about-glass'].filter(function (a) { return !document.querySelector('[' + a + ']'); });
  if (missing.length) console.warn('wubble r14: add these attributes in Webflow for the full effect →', missing.join(', '));
}
/* the dither portrait viewer only loads when the hero portrait or the reach hand asks for it (both off on the current site) */
window.__wbLoadDither = function () { if (window.__wubbleViewerPreloaded || window.__wbDitherReq) return; window.__wbDitherReq = 1; loadScript(BASE + 'dither-viewer.js' + VQ, true); };
// ---------- hooks: data-w="name" → data-wh (V13 uses empty data-w for word reveals) ----------
function prepHooks(scope) { scope.querySelectorAll('[data-w]').forEach(function (el) { var v = el.getAttribute('data-w'); if (v) { el.setAttribute('data-wh', v); el.removeAttribute('data-w'); } }); }
function boot() {
  var root = document.querySelector('[data-w="root"],[data-wh="root"]'); if (!root) return console.warn('wubble: no [data-w=root]');
  // loader is hidden in the Designer (w13-hidden) so it never covers content while editing; show it on the live site
  document.querySelectorAll('[data-w="loader"],[data-wh="loader"]').forEach(function (el) { el.classList.remove('w13-hidden', 'is-editor-hidden', 'w20-ed-hide'); el.style.removeProperty('display'); });
  // effects attach to any element via data-wb-module (alias of the internal hook names)
  var WB_MOD = { astronaut: 'astroG', ribbon: 'host', 'ribbon-cursor': 'goo', thunderstorm: 'hero3d', 'thunderstorm-mask': 'portrait', hand: 'hand', ray: 'ray', loader: 'loader', 'space-background': 'ctaGl', smoke: 'bleed', cursor: 'ink', popup: 'overlay', nav: 'chrome' };
  document.querySelectorAll('[data-wb-module]').forEach(function (el) { var k = WB_MOD[el.getAttribute('data-wb-module')]; if (k && !el.getAttribute('data-w')) el.setAttribute('data-w', k); });
  // titles are plain text in Webflow; split them into animated letters here
  var splitEl = function (el) {
    if (el.__split) return; el.__split = 1;
    var from = el.getAttribute('data-split-from'), src = from ? document.querySelector('[data-w="' + from + '"],[data-wh="' + from + '"]') : null;
    var txt = ((src ? (src.__txt || src.textContent) : el.textContent) || '').replace(/\s+/g, ' ').trim(); el.__txt = txt;
    var hide = +(el.getAttribute('data-split-hide') || 0), attr = el.getAttribute('data-split-letter') || 'sq', lc = el.getAttribute('data-split-class') || 'hero-letter';
    el.setAttribute('aria-label', txt); el.textContent = '';
    txt.split(' ').forEach(function (w, wi) {
      if (wi > 0) { var g = document.createElement('span'); g.className = 'title-gap'; g.style.cssText = 'display:inline-block;width:0.2em;'; el.appendChild(g); }
      Array.from(w).forEach(function (ch) {
        var m = document.createElement('span'); m.className = hide === wi + 1 ? 'title-letter-mask-hidden' : 'title-letter-mask'; m.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding:0.04em 0 0.08em;' + (hide === wi + 1 ? 'visibility:hidden;' : ''); /* r14.21: exact V22 inline mask, independent of Webflow classes */
        var gw = document.createElement('span'); gw.className = 'title-word'; gw.setAttribute('data-gw', ''); gw.style.cssText = 'display:inline-block;will-change:transform;';
        var l = document.createElement('span'); l.className = lc; l.setAttribute('data-' + attr, ''); l.setAttribute('aria-hidden', 'true'); l.style.cssText = 'display:inline-block;transform-origin:50% 100%;will-change:transform;'; l.textContent = ch;
        gw.appendChild(l); m.appendChild(gw); el.appendChild(m);
      });
    });
  };
  document.querySelectorAll('[data-split="letters"]:not([data-split-from])').forEach(splitEl);
  document.querySelectorAll('[data-split="letters"][data-split-from]').forEach(splitEl);
  prepHooks(document);
  root.insertAdjacentHTML('afterbegin', "<svg width=\"0\" height=\"0\" style=\"position:absolute;width:0;height:0\"><defs><filter id=\"gooText\" x=\"-20%\" y=\"-60%\" width=\"140%\" height=\"220%\"><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0\" result=\"b\" data-goo-text=\"\"></feGaussianBlur><feColorMatrix in=\"b\" mode=\"matrix\" values=\"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 9 -3\"></feColorMatrix></filter><filter id=\"goo\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"6\" result=\"b\"></feGaussianBlur><feColorMatrix in=\"b\" mode=\"matrix\" values=\"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8\"></feColorMatrix></filter></defs></svg>");
  var off = document.querySelector('[data-w-if="soundOff"]'); if (off && !off.innerHTML.trim()) off.innerHTML = "<svg width=\"14\" height=\"12\" viewBox=\"0 0 14 12\" fill=\"none\" style=\"display:block;\"><path d=\"M1 4h2.5L7 1v10L3.5 8H1z\" fill=\"currentColor\"></path><path d=\"M9.5 4l3 4M12.5 4l-3 4\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"></path></svg>";
  // ---------- CMS projects ----------
  var items = Array.prototype.map.call(document.querySelectorAll('[data-wubble="project"]'), function (el) {
    var img = el.querySelector('[data-wubble="cover"] img, img[data-wubble="cover"], img'); var a = function (k) { var c = el.querySelector('[data-wubble="' + k + '"]'); /* r14.60: a child text element (works with Rich Text) wins over the attribute */ if (c && !c.classList.contains('w-dyn-bind-empty')) { var t = (c.innerText || c.textContent || '').trim(); if (t) return t; } return (el.getAttribute('data-' + k) || '').trim(); };
    return { title: a('title'), slug: a('slug'), client: a('client'), type: a('services'), year: a('year'), blurb: a('description'), video: a('video'), bg: a('color'), cover: (img && !img.classList.contains('w-dyn-bind-empty') && !/placeholder/i.test(img.getAttribute('src') || '')) ? (img.getAttribute('src') || img.currentSrc || '') : '' };
  }).filter(function (p) { return p.title; });
  console.info('[wubble] CMS projects found: ' + items.length); try { console.table(items.map(function (p) { return { title: p.title, cover: p.cover || '(none)', video: p.video || '(none)' }; })); } catch (e) {}
  var lum = function (h) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return 0.5; var n = parseInt(m[1], 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; };
  window.__wubbleMerge = function (defs) {
    if (!items.length) return defs;
    return items.map(function (p, i) { var d = defs[i % defs.length], o = Object.assign({}, d);
      ['title', 'client', 'type', 'year', 'blurb'].forEach(function (k) { o[k] = p[k] || ''; }); /* r14.60: CMS is the only source — no baked-in placeholder text */
      if (p.bg) { o.bg = p.bg; o.ink = lum(p.bg) > 0.55 ? '#151412' : '#ece9e2'; }
      if (p.title !== d.title) o.mark = p.title.toUpperCase().split(/\s+/).slice(0, 2).join(' ');
      o.cover = p.cover; o.videoUrl = p.video; return o; });
  };
  // ---------- props: defaults + root data-* overrides ----------
  var props = Object.assign({}, DEFAULTS);
  // ---------- section order comes from the Webflow Navigator ----------
  var WB_SECS = Array.prototype.slice.call(document.querySelectorAll('[data-wb-section]'));
  var WB_ORDER = WB_SECS.map(function (e) { return e.getAttribute('data-wb-section'); }).join(',');
  window.__wbGeneric = root.getAttribute('data-wb-mode') === 'generic'; /* r14.3: V22 layout is the default; generic stacking only when asked for */
  WB_SECS.forEach(function (sec, i) {
    sec.style.zIndex = String(i + 1);
    // backgrounds never sit on top of the 3D: each section's Webflow background (on the section or its panel)
    // is painted on its own fixed layer under every canvas, and crossfades in with that section's transition
    var pnl = sec.querySelector('[data-panel],[data-cta-panel],[data-reach-panel]') || sec.firstElementChild;
    var src = [sec, pnl].filter(Boolean), col = null, img = 'none', bsz = 'cover', bpos = '50% 50%';
    src.forEach(function (e) { var c = getComputedStyle(e);
      if (!col && c.backgroundColor && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(c.backgroundColor)) col = c.backgroundColor;
      if (img === 'none' && c.backgroundImage && c.backgroundImage !== 'none') { img = c.backgroundImage; bsz = c.backgroundSize; bpos = c.backgroundPosition; } });
    src.forEach(function (e) { e.style.setProperty('background-color', 'transparent', 'important'); e.style.setProperty('background-image', 'none', 'important'); });
    var BL = document.createElement('div'); BL.setAttribute('data-wb-bg', sec.getAttribute('data-wb-section') || String(i));
    BL.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:' + (i ? 0 : 1) + ';background-color:' + (col || 'transparent') + ';background-image:' + img + ';background-size:' + bsz + ';background-position:' + bpos + ';background-repeat:no-repeat;';
    (window.__wbBG || (window.__wbBG = [])).push({ sec: sec, L: BL, has: !!col || img !== 'none' });
    if (window.__wbGeneric) { var ov = parseFloat(sec.getAttribute('data-wb-overlap')); sec.style.marginTop = i === 0 ? '0px' : '-' + (isFinite(ov) ? ov : 100) + 'vh'; }
  });
  (function () { var BGS = window.__wbBG || []; if (!BGS.length) return;
    var anchor = root.querySelector('[data-w="bg"],[data-wh="bg"]');
    BGS.forEach(function (bg) { if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bg.L, anchor.nextSibling), anchor = bg.L; else root.insertBefore(bg.L, root.firstChild); });
    var KEYS = ['rp', 'rq', 'r3'];
    (function tick() { requestAnimationFrame(tick); var I = window.__wubble, vh = window.innerHeight;
      for (var i = 1; i < BGS.length; i++) { var bg = BGS[i], p = null;
        if (!window.__wbGeneric && I && KEYS[i - 1] && isFinite(I[KEYS[i - 1]])) p = I[KEYS[i - 1]];
        if (p == null) { var t = bg.sec.getBoundingClientRect().top; p = Math.max(0, Math.min(1, (vh - t) / vh)); }
        var o = bg.has ? Math.max(0, Math.min(1, p)) : 0; if (bg._o !== o) { bg._o = o; bg.L.style.opacity = o.toFixed(3); } } })(); })();
  // everything visual comes from Webflow: read fonts, colors and texts from the Designer styles
  (function () {
    var cs = function (sel) { var e = document.querySelector(sel); return e ? getComputedStyle(e) : null; };
    var hex = function (c) { var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(c || ''); if (!m || (m[4] !== undefined && +m[4] === 0)) return null; return '#' + [m[1], m[2], m[3]].map(function (v) { return (+v).toString(16).padStart(2, '0'); }).join(''); };
    var fam = function (st) { return st ? st.fontFamily.split(',')[0].replace(/["']/g, '').trim() : null; };
    var set = function (k, v) { if (v) props[k] = v; };
    var h = cs('.hero-headline'), site = cs('.site-bg'), body = cs('.site'), wh = document.querySelector('.work-heading');
    set('displayFont', fam(h));
    if (h && h.fontFamily) document.documentElement.style.setProperty('--display', h.fontFamily);
    set('pageBg', site && hex(site.backgroundColor)); set('textColor', body && hex(body.color));
    if (wh) { set('workWord', (wh.textContent || '').trim()); set('workWordColor', hex(getComputedStyle(wh).color)); }
    var rh = document.querySelector('.reach-headline'); if (rh) set('reachTitle', rh.__txt || rh.textContent.trim());
    var ab = cs('.section-about'), at = cs('.about-text'); set('aboutBg', ab && hex(ab.backgroundColor)); set('aboutText', at && hex(at.color));
    var ft = cs('.site-footer'); set('footerBg', ft && hex(ft.backgroundColor)); set('footerText', ft && hex(ft.color));
    var fg = cs('.facts-grid'); set('infoBg', fg && hex(fg.backgroundColor)); set('infoText', fg && hex(fg.color));
  })();
  Object.keys(root.dataset).forEach(function (k) { if (k === 'w' || k === 'wh') return; var v = root.dataset[k]; props[k] = v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(+v) ? +v : v); });
  // ---------- tiny React-free component host ----------
  if (window.__wbGeneric) { props.sectionRotate = false; props.sectionBleed = false; }
  window.React = window.React || {}; if (!window.React.createRef) window.React.createRef = function () { return { current: null }; };
  function DCLogic(p) { this.props = p; }
  DCLogic.prototype.setState = function (u, cb) { var patch = typeof u === 'function' ? u(this.state, this.props) : u; if (patch == null) { cb && cb(); return; } this.state = Object.assign({}, this.state, patch); if (cb) this.__cbs.push(cb); this.__schedule(); };
  DCLogic.prototype.forceUpdate = function (cb) { if (cb) this.__cbs.push(cb); this.__schedule(); };
  window.DCLogic = DCLogic;
  var Component = (new Function('DCLogic', 'React', 'BASE', `
class Component extends DCLogic {
  state = { active: 0, time: '', page: null, soundOn: false };
  footerFigRef = React.createRef(); rollRef = React.createRef(); bleedRef = React.createRef(); bgRef = React.createRef(); gooRef = React.createRef(); inkRef = React.createRef(); closeRef = React.createRef(); loaderRef = React.createRef(); chromeRef = React.createRef(); curtainRef = React.createRef(); hero3dRef = React.createRef(); ctaRef = React.createRef(); astroGRef = React.createRef();
  ctaGlRef = React.createRef(); reachRef = React.createRef(); rayRef = React.createRef(); handRef = React.createRef(); astroRef = React.createRef(); hostRef = React.createRef(); heroRef = React.createRef(); workRef = React.createRef();
  uiRef = React.createRef(); headlineRef = React.createRef(); portraitRef = React.createRef(); pageRef = React.createRef();
  projects = (window.__wubbleMerge || function (d) { return d; })([ /* r14.24: CMS items replace the baked-in projects again */
    { title: 'Tidewater Atlas', mark: 'TIDE/ WATER', type: 'Interactive atlas', year: '2026', client: 'Coastal Trust', bg: '#d8d3c6', ink: '#151412', accent: '#c9542f', blurb: 'A living map of a changing coastline — tides, erosion and stories layered into one explorable surface.' },
    { title: 'Northfield Records', mark: 'NRTH FLD', type: 'Label identity', year: '2025', client: 'Northfield', bg: '#1e3a2c', ink: '#ebe5d3', accent: '#d9c36a', blurb: 'Identity and web presence for an independent label, built around a flexible system of sleeves and motion.' },
    { title: 'Oda Ceramics', mark: 'ODA', type: 'E-commerce', year: '2025', client: 'Oda Studio', bg: '#c4512d', ink: '#f4ede1', accent: '#1b1a17', blurb: 'A quiet storefront for handmade ceramics where every object gets room to breathe.' },
    { title: 'Kinetic Type Lab', mark: 'KINE TIC', type: 'WebGL experiment', year: '2024', client: 'Self-initiated', bg: '#242a66', ink: '#e9e7f1', accent: '#f0a8c0', blurb: 'An ongoing playground of shader-driven typography reacting to sound, cursor and scroll.' },
    { title: 'Halden Observatory', mark: 'HAL DEN', type: 'Museum website', year: '2024', client: 'Halden Foundation', bg: '#e9e4d7', ink: '#141414', accent: '#3a5bd9', blurb: 'Digital home for a historic observatory — exhibitions, night programmes and a sky archive.' },
    { title: 'Sunday Garden', mark: 'SUN DAY', type: 'Restaurant', year: '2023', client: 'Sunday Garden', bg: '#121212', ink: '#ece9e2', accent: '#c7de5b', blurb: 'Brand and booking experience for a seasonal restaurant that changes with its garden.' },
  ]);

  ditherGLSL(px) {
    // site-wide 1-bit ordered dither (engraving / print look): pure black + paper white
    if (!(this.props.ditherStyle ?? true)) return 'vec3 DQ(vec3 c){ return c; }';
    const P = Math.max(1, (this.props.ditherSize ?? 1) * px / 2), G = (this.props.ditherGain ?? 1.35).toFixed(3);
    return 'float dqB2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }' +
      'float dqB4(vec2 a){ return dqB2(0.5 * a) * 0.25 + dqB2(a); }' +
      'float dqB8(vec2 a){ return dqB4(0.5 * a) * 0.25 + dqB2(a); }' +
      'vec3 DQ(vec3 c){ float l = dot(c, vec3(0.299, 0.587, 0.114)); l = smoothstep(0.0, 0.72, clamp(l * ' + G + ', 0.0, 1.0));' + (px < 1.5 ? ' l = pow(l, 0.7);' : '') +
      ' float t = dqB8(gl_FragCoord.xy / ' + P.toFixed(2) + '); return mix(vec3(0.0), vec3(0.93, 0.925, 0.91), step(t + 0.02, l)); }';
  }
  applyHeroLight() {
    const hr = this.heroRef && this.heroRef.current, inner = hr && hr.firstElementChild; if (!inner) return;
    const on = (this.props.heroLight ?? true) || (this.props.heroStudio ?? true), bg = this.props.heroLightBg || '#ffffff', ink = this.props.heroLightInk || '#0a0a0a';
    const studio = this.props.heroStudio ?? true;
    inner.style.background = studio ? (this.props.heroStudioBg || 'var(--bg-hero,#202ded)') : (on ? bg : '');
    const h1 = this.headlineRef && this.headlineRef.current;
    const fly = (window.__wbRP || 0) > 0.02 && window.__heroInk;
    if (h1 && !fly) { h1.style.color = on ? ink : '#ece9e2'; h1.style.textShadow = on ? 'none' : '0 0.03em 0.09em rgba(0,0,0,0.45)'; }
    { const fh = document.querySelector('[data-hero-front] h1'); if (fh && !fly) { fh.style.color = on ? ink : ''; fh.style.textShadow = on ? 'none' : ''; }
      const hx = /^#([0-9a-f]{6})$/i.exec(ink); window.__heroInk = on && hx ? { rgb: [0, 2, 4].map((i) => parseInt(hx[1].slice(i, i + 2), 16)), els: [h1, fh], last: fly ? window.__heroInk.last : '' } : null;
      window.__wbLink = { on: this.props.linkHover ?? true, dur: this.props.linkHoverDur ?? 0.5, stagger: this.props.linkHoverStagger ?? 0.022 };
      window.__wbScr = { on: (this.props.textScramble ?? true), base: this.props.scrambleBase ?? 0.6, max: this.props.scrambleMax ?? 1.4 };
      window.__wbClouds = { engine: this.props.cloudEngine || 'WebGL', hs: this.props.heroStart ?? 0.04, hw: this.props.heroSpan ?? 0.16, front: this.props.cloudFront ?? 0.4, on: this.props.clouds ?? true, amount: this.props.cloudAmount ?? 1, speed: this.props.cloudSpeed ?? 1, fog: this.props.cloudFog || '#ffffff', split: this.props.cloudSplit ?? 420, hs: this.props.heroStart ?? 0.04 };
      window.__wbSpace = { footer: false, hs: this.props.heroStart ?? 0.04, hw: this.props.heroSpan ?? 0.16, on: this.props.spaceFlight ?? true, rest: this.props.spaceRest ?? 0.45, warp: this.props.spaceWarp ?? 1, hs: this.props.heroStart ?? 0.04, gs: this.props.galaxyStart ?? 0, gd: this.props.galaxyFade ?? 0.1, see: this.props.galaxyThroughHero ?? 1, bgSpeed: this.props.heroBgFadeSpeed ?? 14 }; }
    inner.querySelectorAll('ul, li').forEach((el) => { el.style.color = on ? ink : ''; });
  }
  // radiance-style hover: each letter swaps to a pre-rendered "inflated" sprite strip that pops in and loops.
  // Custom renders: put data-sprite="url" (horizontal strip) + data-frames="N" on the footer word, one URL per letter separated by "|".
  footerSprites(ft, word, spans) {
    const P = this.props, G = window.gsap, F = P.footerSpriteFrames ?? 16;
    const urls = (word.getAttribute('data-sprite') || '').split('|').map((u) => u.trim()), cF = +(word.getAttribute('data-frames') || F);
    const cols = (P.footerSpriteColors || '#c8612c').split(',').map((c) => c.trim()).filter(Boolean);
    word.style.position = 'relative';
    const hexRGB = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h) || [0, 'c8612c']; const n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
    const tick = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 60 }) : setTimeout(r, 0)));
    const render = async (sp, i) => {
      const cs = getComputedStyle(word), rc = sp.getBoundingClientRect(), k = Math.min(1.25, 230 / Math.max(1, rc.height));
      const fs = parseFloat(cs.fontSize) * k, font = cs.fontWeight + ' ' + fs.toFixed(1) + 'px ' + cs.fontFamily;
      const mc = document.createElement('canvas').getContext('2d'); mc.font = font; const mt = mc.measureText(sp.textContent);
      const pad = Math.ceil(fs * 0.14), gw = Math.ceil(mt.actualBoundingBoxLeft + mt.actualBoundingBoxRight) + pad * 2, gh = Math.ceil(mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent) + pad * 2;
      const cv = document.createElement('canvas'); cv.width = gw; cv.height = gh; const g = cv.getContext('2d', { willReadFrequently: true });
      g.font = font; g.fillStyle = '#fff'; g.fillText(sp.textContent, pad + mt.actualBoundingBoxLeft, pad + mt.actualBoundingBoxAscent);
      const blur = (r) => { const c2 = document.createElement('canvas'); c2.width = gw; c2.height = gh; const g2 = c2.getContext('2d', { willReadFrequently: true }); g2.filter = 'blur(' + r.toFixed(1) + 'px)'; g2.drawImage(cv, 0, 0); return g2.getImageData(0, 0, gw, gh).data; };
      const capH = mt.actualBoundingBoxAscent, b1 = blur(capH * 0.045), b2 = blur(capH * 0.12), N = gw * gh;
      const Hm = new Float32Array(N), IN = new Float32Array(N);
      for (let p = 0; p < N; p++) { const a1 = b1[p * 4 + 3] / 255, a2 = b2[p * 4 + 3] / 255; Hm[p] = Math.pow(a1, 0.7) * 0.55 + a2 * 0.45; IN[p] = Math.max(0, Math.min(1, (a1 - 0.38) / 0.14)); }
      const idx = []; for (let p = 0; p < N; p++) if (IN[p] > 0) idx.push(p);
      const M = idx.length, NX = new Float32Array(M), NY = new Float32Array(M), NZ = new Float32Array(M), AO = new Float32Array(M), FR = new Float32Array(M);
      for (let j = 0; j < M; j++) { const p = idx[j], x = p % gw, y = (p / gw) | 0;
        const gx = (Hm[p + (x < gw - 1 ? 1 : 0)] - Hm[p - (x > 0 ? 1 : 0)]) * 14, gy = (Hm[p - (y > 0 ? gw : 0)] - Hm[p + (y < gh - 1 ? gw : 0)]) * 14, nl = Math.hypot(gx, gy, 1);
        NX[j] = -gx / nl; NY[j] = -gy / nl; NZ[j] = 1 / nl; AO[j] = 0.35 + 0.65 * Hm[p]; FR[j] = (1 - NZ[j]) * (1 - NZ[j]) * 0.3; }
      await tick(); if (this.dead) return null;
      const strip = document.createElement('canvas'); strip.width = gw * F; strip.height = gh; const sg = strip.getContext('2d'), fr = sg.createImageData(gw, gh), o = fr.data;
      const base = hexRGB(cols[i % cols.length]);
      for (let j = 0; j < M; j++) o[idx[j] * 4 + 3] = 255 * IN[idx[j]];
      for (let f = 0; f < F; f++) {
        const an = f / F * Math.PI * 2, Lx = -0.45 + Math.cos(an) * 0.24, Ly = 0.6 + Math.sin(an) * 0.16, Lz = 0.75, ll = Math.hypot(Lx, Ly, Lz), lx = Lx / ll, ly = Ly / ll, lz = Lz / ll;
        const hl = Math.hypot(lx, ly, lz + 1), hx = lx / hl, hy = ly / hl, hz = (lz + 1) / hl;
        for (let j = 0; j < M; j++) { const q = idx[j] * 4, nx = NX[j], ny = NY[j], nz = NZ[j];
          const df = Math.max(0, nx * lx + ny * ly + nz * lz) * 0.8 + 0.28; let sp2 = Math.max(0, nx * hx + ny * hy + nz * hz); sp2 *= sp2; sp2 *= sp2; sp2 *= sp2; sp2 *= sp2; sp2 *= sp2; sp2 = sp2 * sp2 * 0.75 * 255;
          const ao = AO[j], frs = FR[j];
          o[q] = base[0] * 255 * (df * ao + frs) + sp2; o[q + 1] = base[1] * 255 * (df * ao + frs) + sp2; o[q + 2] = base[2] * 255 * (df * ao + frs) + sp2; }
        sg.putImageData(fr, f * gw, 0);
        if (f % 4 === 3) { await tick(); if (this.dead) return null; }
      }
      return { url: strip.toDataURL('image/webp', 0.85), fw: gw / k, fh: gh / k, ox: -(pad + mt.actualBoundingBoxLeft) / k, oy: -(pad) / k, n: F };
    };
    const items = spans.map((sp, i) => {
      const box = document.createElement('div'); box.setAttribute('data-fl-sprite', ''); box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;opacity:0;visibility:hidden;background-repeat:no-repeat;transform-origin:50% 70%;filter:drop-shadow(0 0.06em 0.05em rgba(0,0,0,0.22));will-change:transform,opacity;z-index:2;';
      word.appendChild(box); return { sp, box, i, data: null, st: { f: 0 }, tl: null, on: false };
    });
    const place = (it) => { const d = it.data, wr = word.getBoundingClientRect(), r = it.sp.getBoundingClientRect(), cs = getComputedStyle(word);
      const k2 = parseFloat(cs.fontSize) / (it.fs0 || parseFloat(cs.fontSize)); const mc = document.createElement('canvas').getContext('2d'); mc.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; const mt = mc.measureText(it.sp.textContent);
      const rg = document.createRange(); rg.selectNodeContents(it.sp); const ib = rg.getBoundingClientRect(), mH = mc.measureText('H');
      const baseY = ib.top - wr.top + (ib.height + mH.actualBoundingBoxAscent - mH.actualBoundingBoxDescent) / 2, topY = baseY - mt.actualBoundingBoxAscent;
      const sc = parseFloat(cs.fontSize) / d.fs; const w = d.fw * sc, h = d.fh * sc;
      Object.assign(it.box.style, { width: w + 'px', height: h + 'px', left: (r.left - wr.left + d.ox * sc) + 'px', top: (topY + d.oy * sc) + 'px', backgroundSize: (d.n * 100) + '% 100%' }); };
    const ready = (it) => { if (it.data) return Promise.resolve(it.data); if (it.job) return it.job; const u = urls[it.i];
      it.job = (async () => { const d = u ? { url: u, n: cF, custom: true } : await render(it.sp, it.i); if (!d) return null;
        d.fs = parseFloat(getComputedStyle(word).fontSize);
        if (d.custom) { const r = it.sp.getBoundingClientRect(); d.fw = r.width * 1.1; d.fh = r.height; d.ox = -r.width * 0.05; d.oy = 0; }
        it.data = d; it.job = null; it.box.style.backgroundImage = 'url("' + d.url + '")'; place(it); return d; })();
      return it.job; };
    const setF = (it, f) => { const n = it.data.n; it.box.style.backgroundPositionX = (n > 1 ? (Math.floor(f) % n) / (n - 1) * 100 : 0) + '%'; };
    const on = async (it) => { if (it.on) return; it.on = true; if (!it.data) { await ready(it); if (!it.on || !it.data) return; } const fps = P.footerSpriteFps ?? 24;
      if (it.tl) it.tl.kill(); it.st.f = 0; setF(it, 0);
      it.tl = G ? G.to(it.st, { f: it.data.n, duration: it.data.n / fps, ease: 'none', repeat: -1, onUpdate: () => setF(it, it.st.f) }) : null;
      if (G) { G.set(it.box, { visibility: 'visible' }); G.fromTo(it.box, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'expo.out', overwrite: 'auto' }); G.to(it.sp, { opacity: 0, duration: 0.18, delay: 0.06, overwrite: 'auto' }); }
      else { it.box.style.visibility = 'visible'; it.box.style.opacity = '1'; it.sp.style.opacity = '0'; } };
    const off = (it) => { if (!it.on) return; it.on = false;
      if (G) { G.to(it.box, { scale: 1.15, opacity: 0, duration: 0.4, ease: 'power3.in', overwrite: 'auto', onComplete: () => { if (!it.on) { it.box.style.visibility = 'hidden'; if (it.tl) it.tl.kill(); } } }); G.to(it.sp, { opacity: 1, duration: 0.25, delay: 0.2, overwrite: 'auto' }); }
      else { it.box.style.opacity = '0'; it.box.style.visibility = 'hidden'; it.sp.style.opacity = ''; } };
    items.forEach((it) => { it.sp.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') on(it); }); it.sp.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') off(it); });
      it.sp.addEventListener('click', () => { if (it.on) off(it); else { on(it); clearTimeout(it.to); it.to = setTimeout(() => off(it), 2400); } }); });
    const warm = async () => { for (const it of items) { if (this.dead) return; if (!it.data) { try { await ready(it); } catch (e) { console.warn('sprite', e); } await new Promise((r) => setTimeout(r, 150)); } } };
    const vis = () => { if (this.dead) return; if (getComputedStyle(ft).visibility !== 'hidden') warm(); else setTimeout(vis, 400); }; vis();
    let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => items.forEach((it) => { if (it.data) place(it); }), 250); });
  }
  componentDidMount() {
    const need = ['astro', 'ribbon', 'sections', 'ui'];
    const go = () => { if (this.dead) return; const L = window.WBL || {};
      if (need.every((k) => L[k])) { Object.assign(Component.prototype, window.WBM); this._mount(); } else setTimeout(go, 25); };
    go();
  }
  _mount() {
    setTimeout(() => this.initFooterLetters && this.initFooterLetters(), 1500);
    { const on = this.props.heroStudio ?? true, hs = document.querySelector('[data-hero-studio]');
      if (hs && !on) hs.style.background = 'transparent';
      if (on) document.querySelectorAll('[data-screen-label="Wubble"] h1, [data-hero-front] h1, [data-screen-label="Wubble"] [data-cg]').forEach((e) => { e.style.color = this.props.heroLightInk || '#ffffff'; e.style.textShadow = 'none'; }); }
    const QF = new URLSearchParams(location.search); window.__dbg = { noFoot: QF.has('nofoot'), noRobot: QF.has('norobot'), noLd: QF.has('nold'), noDis: QF.has('nodis'), noAdd: QF.has('noadd'), noShow: QF.has('noshow') };
    if (!(window.__dbg || {}).noFoot) setTimeout(() => this.initFooterFig && this.initFooterFig(), 3500);
    setTimeout(() => this.initCloudType && this.initCloudType(), 600);
    { // availability: 09:00–18:00 Lombok time (WITA, UTC+8). Webflow: data-avail (text) + data-avail-dot (light)
      const upd = () => { const h = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', hourCycle: 'h23' }).format(new Date()), on = h >= 9 && h < 18;
        document.querySelectorAll('[data-avail]').forEach((el) => { const t = on ? (el.dataset.availOn || 'Awake and creative') : (el.dataset.availOff || 'Zzzzleeping'); if (el.textContent !== t) el.textContent = t; });
        document.querySelectorAll('[data-avail-dot]').forEach((el) => { el.style.setProperty('background', on ? '#2fd27a' : '#7a7a80', 'important'); el.style.setProperty('box-shadow', on ? '0 0 6px 1px rgba(47,210,122,0.75)' : 'none', 'important'); }); };
      upd(); this._availT = setInterval(upd, 30000); }
    { let n = 0; const ai = () => { if (this.dead) return; Object.assign(Component.prototype, window.WBM); /* r14.3: late modules (ascii, cloudtype) finish loading after mount */ try { this.initCloudType && this.initCloudType(); } catch (e) { console.warn('wubble titles', e); } const fw = document.querySelector('[data-fl-word]'); if (++n < 30 && !(fw && fw.__ascii)) setTimeout(ai, 700); }; setTimeout(ai, 900); }
    { const pre = () => (window.requestIdleCallback ? requestIdleCallback(() => this.initAboutCRT && this.initAboutCRT(), { timeout: 1500 }) : setTimeout(() => this.initAboutCRT && this.initAboutCRT(), 800)); if (document.readyState === 'complete') setTimeout(pre, 1200); else addEventListener('load', () => setTimeout(pre, 1200), { once: true }); this.whenNear && this.whenNear(0.05, 8000, () => this.initAboutCRT && this.initAboutCRT()); } /* preload the About monitor right after page load instead of when you reach it */
    if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => this.initHeroGrain(), 300);
    setTimeout(() => this.initUiFx(), 400);
    this.initGrain();
    (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => { if (!this.dead) this.smokeMaskFrames(); }, { timeout: 4000 });
    this.initFooter();
    this.initLetterStorm();
    this.initGsapTitles();
    this.applyHeroLight();
    this.fitHero = () => this.fitHeroTitle(); addEventListener('resize', this.fitHero); requestAnimationFrame(this.fitHero); if (document.fonts && document.fonts.ready) document.fonts.ready.then(this.fitHero); setTimeout(this.fitHero, 800);
    this.onDeadLink = (e) => { const a = e.target.closest && e.target.closest('a[href="#"]'); if (a) e.preventDefault(); };
    document.addEventListener('click', this.onDeadLink, true);
    this.onCtxLost = (e) => { const cv = e.target; if (!cv || cv.tagName !== 'CANVAS') return; e.preventDefault(); this.gpuLost = (this.gpuLost || 0) + 1;
      // GPU reset (not eviction): the astronaut / Work slider never come back on their own. If a visible main canvas is still lost after 1.5s, reload once per session.
      clearTimeout(this._glRe); this._glRe = setTimeout(() => { if (this.dead) return; const shown = (c) => { let e = c, o = 1; for (let i = 0; e && i < 12; i++, e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return false; o *= +cs.opacity; } return o > 0.2; };
        const main = [...document.querySelectorAll('canvas')].filter((c) => !c.__released && c.width > 400 && c.offsetWidth > 0 && shown(c));
        const dead = main.filter((c) => { try { const g = c.getContext('webgl2') || c.getContext('webgl'); return g && g.isContextLost(); } catch (er) { return false; } });
        if (dead.length && !__wbSS.getItem('__wbGLre')) { __wbSS.setItem('__wbGLre', '1'); __wbSS.setItem('__wbGLy', String(scrollY)); location.reload(); } }, 1500); };
    { const y = __wbSS.getItem('__wbGLy'); if (y != null) { __wbSS.removeItem('__wbGLy'); setTimeout(() => scrollTo(0, +y), 600); } setTimeout(() => __wbSS.removeItem('__wbGLre'), 60000); }
    document.addEventListener('webglcontextlost', this.onCtxLost, true);
    {
      let lw = innerWidth, lh = innerHeight;
      window.__svh = lh;
      this.onSvh = () => { if (innerWidth !== lw || Math.abs(innerHeight - lh) > 180) { lw = innerWidth; lh = innerHeight; window.__svh = lh; } };
      addEventListener('resize', this.onSvh);
    }
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    this.lowPower = coarse || innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    this.coarse = coarse;
    this.openT = 0; this.openV = 0; this.openI = -1; this.anim = null; this.closing = false; this.visK = 0; this.revealStart = 0; this.clickUV = [0.5, 0.5];
    if (this.state.page) this.setState({ page: null });
    this.lockScroll(false);
    const tick = () => this.setState({ time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }) });
    tick(); this.clock = setInterval(tick, 1000);
    this.onPop = () => { if (this.state.page) this.doClose(); };
    window.addEventListener('popstate', this.onPop);
    this.init();
    this.initLenis();
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
    this.portraitLoading = true;
    idle(() => { this.portraitLoading = false; this.initPortrait(); }, { timeout: 1500 });
    this.initSwap();
    this.initSound();
    this.initLoader();
    this.applyFont();
    this.applySizes();
  }
  applyFont() {
    const f = this.props.displayFont || 'Oswald';
    if (this._font === f) return; this._font = f;
    document.documentElement.style.setProperty('--display', "'" + f + "'");
    const refit = () => { this.fitTitle && this.fitTitle(); this.fitMark && this.fitMark(); };
    if (document.fonts) document.fonts.load('700 40px "' + f + '"').then(refit, refit); else refit();
  }
  applySizes() {
    const P = this.props, st = document.documentElement.style;
    st.setProperty('--hs', String(P.heroTitleSize ?? 1));
    st.setProperty('--ds', String(P.sectionTitleSize ?? 1));
    st.setProperty('--ws', String(P.workTitleSize ?? 1));
    st.setProperty('--bs', String(P.bodySize ?? 1));
    st.setProperty('--ms', (P.labelSize ?? 11) + 'px');
  }
  componentDidUpdate() { if (this.refreshCloudType && ['heroTitleFx', 'cloudTypeStep'].some((k) => (arguments[0] || {})[k] !== this.props[k])) this.refreshCloudType();
    if (this.initGrain) this.initGrain(); this.applyHeroLight && this.applyHeroLight();  this.applyFont && this.applyFont(); this.applySizes(); }
  entranceTargets() {
    const ch = this.chromeRef.current, hr = this.heroRef.current;
    const hdr = ch ? Array.from(ch.querySelectorAll('header > *')) : [];
    const ftr = ch ? Array.from(ch.querySelectorAll('footer')) : [];
    const lines = this.headlineRef.current ? Array.from(this.headlineRef.current.children) : [];
    const model = this.hero3dRef && this.hero3dRef.current;
    return { hdr, ftr, lines, model };
  }
  prepEntrance() {
    const T = this.entranceTargets();
    [...T.hdr, ...T.ftr].forEach(el => { el.style.opacity = '0'; el.style.transform = 'translate3d(0,14px,0)'; el.style.willChange = 'transform,opacity'; });
    T.lines.forEach(el => { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transform = 'translate3d(0,0.6em,0)'; el.style.willChange = 'transform,clip-path'; });
    if (T.model) { T.model.style.opacity = '0'; T.model.style.transform = 'scale(1.12)'; T.model.style.willChange = 'transform,opacity'; }
    if (this.headlineRef.current) this.headlineRef.current.style.opacity = '1';
  }
  // one shared download per model (loader + hero reuse it), from the CDN first, with real progress
  toggleSound() {
    const on = !this.state.soundOn;
    const url = (this.props.soundtrack || '').trim() || ((window.WB_ASSETS || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/') + 'music.mp3');
    if (on && url) {
      if (!this.audio || this.audioUrl !== url) {
        if (this.audio) this.audio.pause();
        this.audio = new Audio(url); this.audio.loop = true; this.audio.crossOrigin = 'anonymous'; this.audio.volume = 0; this.audioUrl = url;
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.actx = this.actx || new AC();
          const src = this.actx.createMediaElementSource(this.audio);
          this.analyser = this.actx.createAnalyser(); this.analyser.fftSize = 256; this.analyser.smoothingTimeConstant = 0.8;
          src.connect(this.analyser); this.analyser.connect(this.actx.destination); this.fData = null;
        } catch (e) { this.analyser = null; }
      }
      if (this.actx && this.actx.state === 'suspended') this.actx.resume();
      this.audio.play().catch(() => {});
    }
    this.setState({ soundOn: on });
  }
  FALL_DIRS = {"d":5.267,"n":33,"fwd":[0,21.421],"left":[30.326,0],"up":[0,0.998,-0.055],"dirs":{"chest":[-0.027,0.978,-0.207,-0.043,0.977,-0.206,-0.047,0.978,-0.202,-0.043,0.979,-0.2,-0.038,0.979,-0.203,-0.031,0.978,-0.205,-0.016,0.978,-0.206,-0.008,0.977,-0.213,-0.009,0.977,-0.213,-0.01,0.977,-0.215,-0.009,0.975,-0.221,0,0.976,-0.218,-0.005,0.977,-0.211,-0.006,0.979,-0.206,-0.009,0.979,-0.204,-0.012,0.978,-0.209,-0.026,0.978,-0.207,-0.042,0.977,-0.207,-0.047,0.978,-0.202,-0.043,0.979,-0.2,-0.038,0.979,-0.203,-0.031,0.978,-0.205,-0.017,0.978,-0.206,-0.008,0.977,-0.212,-0.008,0.977,-0.213,-0.009,0.977,-0.214,-0.01,0.975,-0.221,0,0.976,-0.218,-0.005,0.977,-0.212,-0.007,0.978,-0.206,-0.008,0.979,-0.204,-0.012,0.978,-0.209,-0.027,0.978,-0.207],"neck":[0.027,0.997,-0.075,0.086,0.996,-0.025,0.107,0.994,-0.004,0.113,0.994,-0.006,0.115,0.993,-0.02,0.111,0.992,-0.059,0.067,0.987,-0.148,0.024,0.975,-0.22,0.02,0.972,-0.234,0.018,0.971,-0.238,0.003,0.975,-0.222,-0.03,0.985,-0.172,-0.041,0.99,-0.135,-0.042,0.991,-0.125,-0.031,0.992,-0.121,-0.008,0.994,-0.112,0.024,0.997,-0.079,0.083,0.996,-0.028,0.106,0.994,-0.004,0.113,0.994,-0.005,0.115,0.993,-0.019,0.113,0.992,-0.054,0.07,0.988,-0.141,0.025,0.976,-0.217,0.021,0.972,-0.233,0.018,0.971,-0.238,0.004,0.974,-0.225,-0.028,0.984,-0.175,-0.04,0.99,-0.137,-0.042,0.991,-0.125,-0.032,0.992,-0.121,-0.01,0.994,-0.113,0.027,0.997,-0.075],"lArm":[0.776,-0.58,0.249,0.782,-0.577,0.238,0.772,-0.603,0.2,0.762,-0.619,0.19,0.761,-0.625,0.175,0.765,-0.613,0.198,0.755,-0.62,0.215,0.755,-0.609,0.243,0.763,-0.595,0.253,0.768,-0.583,0.265,0.775,-0.571,0.273,0.78,-0.548,0.301,0.775,-0.556,0.302,0.771,-0.566,0.291,0.769,-0.571,0.288,0.764,-0.583,0.277,0.775,-0.581,0.251,0.782,-0.576,0.24,0.773,-0.602,0.201,0.763,-0.618,0.191,0.761,-0.625,0.175,0.765,-0.614,0.196,0.755,-0.619,0.214,0.755,-0.61,0.241,0.762,-0.596,0.253,0.768,-0.584,0.264,0.774,-0.572,0.272,0.78,-0.549,0.299,0.775,-0.554,0.304,0.772,-0.566,0.291,0.769,-0.57,0.289,0.764,-0.583,0.277,0.776,-0.58,0.249],"lFore":[0.76,-0.542,0.359,0.765,-0.533,0.36,0.756,-0.559,0.339,0.746,-0.575,0.337,0.745,-0.575,0.339,0.747,-0.565,0.351,0.736,-0.57,0.366,0.737,-0.543,0.403,0.746,-0.529,0.405,0.753,-0.523,0.399,0.759,-0.514,0.399,0.761,-0.501,0.412,0.757,-0.519,0.396,0.756,-0.533,0.381,0.753,-0.54,0.376,0.747,-0.545,0.382,0.759,-0.543,0.36,0.765,-0.532,0.362,0.757,-0.558,0.339,0.746,-0.574,0.338,0.744,-0.575,0.339,0.747,-0.565,0.35,0.737,-0.57,0.364,0.736,-0.545,0.401,0.745,-0.529,0.406,0.753,-0.524,0.399,0.759,-0.515,0.398,0.762,-0.501,0.411,0.757,-0.518,0.398,0.756,-0.533,0.38,0.754,-0.539,0.377,0.747,-0.545,0.382,0.76,-0.542,0.359],"rArm":[-0.752,-0.597,0.279,-0.742,-0.606,0.286,-0.744,-0.613,0.267,-0.76,-0.595,0.261,-0.773,-0.581,0.256,-0.779,-0.577,0.246,-0.765,-0.574,0.291,-0.752,-0.596,0.281,-0.756,-0.603,0.256,-0.763,-0.593,0.256,-0.769,-0.58,0.268,-0.76,-0.588,0.276,-0.762,-0.587,0.273,-0.76,-0.594,0.263,-0.75,-0.605,0.266,-0.757,-0.597,0.265,-0.753,-0.597,0.277,-0.742,-0.605,0.289,-0.743,-0.614,0.267,-0.759,-0.596,0.263,-0.772,-0.581,0.257,-0.779,-0.577,0.244,-0.767,-0.573,0.29,-0.753,-0.595,0.283,-0.755,-0.603,0.257,-0.763,-0.594,0.255,-0.769,-0.58,0.269,-0.761,-0.587,0.274,-0.761,-0.587,0.276,-0.761,-0.594,0.261,-0.751,-0.604,0.267,-0.756,-0.598,0.264,-0.752,-0.597,0.279],"rFore":[-0.773,-0.543,0.329,-0.761,-0.559,0.331,-0.758,-0.577,0.304,-0.774,-0.558,0.299,-0.785,-0.548,0.29,-0.791,-0.545,0.278,-0.773,-0.553,0.312,-0.767,-0.558,0.317,-0.775,-0.557,0.299,-0.779,-0.555,0.291,-0.774,-0.568,0.28,-0.768,-0.57,0.293,-0.771,-0.566,0.293,-0.772,-0.566,0.289,-0.769,-0.562,0.307,-0.772,-0.561,0.299,-0.773,-0.543,0.327,-0.761,-0.556,0.334,-0.757,-0.578,0.304,-0.773,-0.559,0.301,-0.784,-0.548,0.291,-0.792,-0.545,0.277,-0.774,-0.552,0.311,-0.767,-0.558,0.317,-0.774,-0.557,0.301,-0.779,-0.555,0.291,-0.774,-0.567,0.28,-0.769,-0.57,0.29,-0.77,-0.565,0.296,-0.773,-0.566,0.287,-0.768,-0.563,0.306,-0.772,-0.562,0.299,-0.773,-0.543,0.329],"lUp":[0.142,-0.989,0.036,0.138,-0.99,0.038,0.146,-0.988,0.048,0.146,-0.987,0.065,0.148,-0.986,0.08,0.145,-0.985,0.088,0.128,-0.988,0.082,0.109,-0.992,0.062,0.109,-0.993,0.043,0.117,-0.992,0.038,0.126,-0.991,0.042,0.131,-0.99,0.046,0.143,-0.989,0.046,0.151,-0.987,0.048,0.148,-0.988,0.05,0.151,-0.988,0.043,0.143,-0.989,0.036,0.137,-0.99,0.038,0.146,-0.988,0.047,0.146,-0.987,0.064,0.148,-0.986,0.08,0.146,-0.985,0.088,0.129,-0.988,0.082,0.11,-0.992,0.064,0.108,-0.993,0.044,0.116,-0.993,0.038,0.126,-0.991,0.041,0.13,-0.99,0.046,0.142,-0.989,0.046,0.151,-0.987,0.048,0.148,-0.988,0.05,0.151,-0.988,0.043,0.142,-0.989,0.036],"lLeg":[0.064,-0.951,-0.302,0.058,-0.953,-0.297,0.063,-0.95,-0.307,0.061,-0.952,-0.301,0.064,-0.95,-0.304,0.063,-0.953,-0.298,0.049,-0.957,-0.284,0.032,-0.958,-0.283,0.031,-0.956,-0.292,0.036,-0.948,-0.317,0.046,-0.95,-0.308,0.053,-0.957,-0.285,0.075,-0.962,-0.264,0.086,-0.962,-0.259,0.078,-0.96,-0.268,0.077,-0.955,-0.287,0.065,-0.951,-0.302,0.057,-0.953,-0.297,0.063,-0.95,-0.306,0.061,-0.952,-0.301,0.064,-0.95,-0.305,0.063,-0.952,-0.298,0.05,-0.957,-0.285,0.033,-0.958,-0.284,0.03,-0.957,-0.29,0.035,-0.948,-0.316,0.046,-0.95,-0.31,0.052,-0.957,-0.287,0.073,-0.962,-0.264,0.086,-0.962,-0.259,0.078,-0.961,-0.267,0.077,-0.955,-0.285,0.064,-0.951,-0.302],"rUp":[-0.18,-0.984,0.009,-0.184,-0.983,0.004,-0.186,-0.983,0.003,-0.188,-0.982,0.006,-0.188,-0.982,0.006,-0.193,-0.981,0.019,-0.199,-0.98,0.024,-0.199,-0.98,0.016,-0.198,-0.98,0.015,-0.191,-0.981,0.013,-0.181,-0.983,0.006,-0.179,-0.984,0.008,-0.177,-0.984,0.008,-0.178,-0.984,0.009,-0.179,-0.984,0.009,-0.177,-0.984,0.009,-0.18,-0.984,0.009,-0.184,-0.983,0.004,-0.186,-0.983,0.003,-0.188,-0.982,0.006,-0.188,-0.982,0.006,-0.193,-0.981,0.018,-0.199,-0.98,0.024,-0.199,-0.98,0.016,-0.198,-0.98,0.015,-0.192,-0.981,0.013,-0.181,-0.983,0.006,-0.18,-0.984,0.008,-0.177,-0.984,0.008,-0.178,-0.984,0.009,-0.179,-0.984,0.009,-0.178,-0.984,0.009,-0.18,-0.984,0.009],"rLeg":[-0.075,-0.974,-0.216,-0.076,-0.973,-0.218,-0.079,-0.972,-0.22,-0.084,-0.972,-0.219,-0.087,-0.971,-0.221,-0.091,-0.967,-0.238,-0.086,-0.965,-0.249,-0.085,-0.965,-0.246,-0.08,-0.966,-0.247,-0.075,-0.968,-0.239,-0.077,-0.973,-0.219,-0.076,-0.973,-0.216,-0.076,-0.974,-0.215,-0.079,-0.974,-0.215,-0.079,-0.973,-0.217,-0.075,-0.973,-0.216,-0.075,-0.974,-0.216,-0.077,-0.973,-0.218,-0.078,-0.972,-0.22,-0.084,-0.972,-0.219,-0.087,-0.971,-0.221,-0.091,-0.967,-0.237,-0.087,-0.965,-0.249,-0.085,-0.965,-0.247,-0.081,-0.966,-0.247,-0.075,-0.968,-0.241,-0.077,-0.973,-0.22,-0.077,-0.973,-0.216,-0.076,-0.974,-0.215,-0.079,-0.974,-0.215,-0.079,-0.973,-0.217,-0.076,-0.973,-0.216,-0.075,-0.974,-0.216]}};
  initLenis() {
    const W = window;
    const start = () => {
      if (this.dead) return;
      if (this.coarse) return;
      if (!W.Lenis) { this.lenisWait = setTimeout(start, 100); return; }
      if (W.__sliderLenis) { try { W.__sliderLenis.destroy(); } catch (e) {} cancelAnimationFrame(W.__sliderLenisRaf); W.__sliderLenis = null; }
      const L = new W.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.7, autoRaf: false, syncTouch: false });
      W.__sliderLenis = L;
      const raf = (t) => {
        if (W.__sliderLenis !== L) return;
        const P = this.props, on = P.smoothScroll ?? true;
        L.options.lerp = P.scrollLerp ?? 0.08;
        if (!on && !L.isStopped) L.stop();
        else if (on && L.isStopped && !this.scrollLocked) L.start();
        L.raf(t);
      };
      W.__lenisStep = raf;
      if (!this.mainTickRunning) { const kick = (t) => { if (W.__lenisStep !== raf) return; if (!this.mainTickRunning) { raf(t); W.__sliderLenisRaf = requestAnimationFrame(kick); } }; W.__sliderLenisRaf = requestAnimationFrame(kick); }
      if (this.scrollLocked) L.stop();
    };
    start();
  }
  componentWillUnmount() {
    { const gEl = document.getElementById('site-grain'); if (gEl) gEl.remove(); }
    cancelAnimationFrame(this.ftRaf);
    this.dead = true; cancelAnimationFrame(this.raf); clearInterval(this.clock); clearTimeout(this.pt);
    window.removeEventListener('popstate', this.onPop);
    clearTimeout(this.lenisWait);
    if (window.__sliderLenis) { cancelAnimationFrame(window.__sliderLenisRaf); try { window.__sliderLenis.destroy(); } catch (e) {} window.__sliderLenis = null; }
    this.lockScroll(false);
    if (this.portrait) { this.portrait.renderer.setAnimationLoop(null); this.portrait.renderer.dispose(); try { this.portrait.renderer.forceContextLoss(); } catch (e) {} this.portrait.renderer.domElement.remove(); this.portrait = null; }
    document.removeEventListener('webglcontextlost', this.onCtxLost, true);
    document.removeEventListener('click', this.onDeadLink, true);
    removeEventListener('resize', this.onSvh); clearTimeout(this.manageT);
    clearInterval(this.swapTimer); clearInterval(this.scrTimer); cancelAnimationFrame(this.swapRaf); cancelAnimationFrame(this.sndRaf);
    if (this.audio) { this.audio.pause(); this.audio = null; } if (this.actx) { try { this.actx.close(); } catch (e) {} }
    this.cleanupInk && this.cleanupInk();
    this.cleanupBg && this.cleanupBg();
    this.cleanupReveals && this.cleanupReveals();
    this.cleanupCta && this.cleanupCta();
    this.cleanupBleed && this.cleanupBleed();
    this.cleanupReach && this.cleanupReach();
    this.cleanupRoll && this.cleanupRoll();
    this.cleanup && this.cleanup();
  }

  lockScroll(on) {
    if (!this.blockScroll) {
      this.blockScroll = (e) => {
        if (!this.state.page) return;
        const pgEl = this.pageRef.current;
        if (pgEl && pgEl.contains(e.target) && this.openT > 0.99 && !this.closing) return;
        e.preventDefault();
      };
    }
    if (on && !this.scrollLocked) {
      window.addEventListener('wheel', this.blockScroll, { passive: false });
      window.addEventListener('touchmove', this.blockScroll, { passive: false });
    } else if (!on && this.scrollLocked) {
      window.removeEventListener('wheel', this.blockScroll);
      window.removeEventListener('touchmove', this.blockScroll);
    }
    this.scrollLocked = on;
    const L = window.__sliderLenis; if (L) { if (on) L.stop(); else if (this.props.smoothScroll ?? true) L.start(); }
  }
  ease(t) {
    const x1 = 0.7, y1 = 0, x2 = 0.15, y2 = 1;
    const bx = (s) => 3 * x1 * s * (1 - s) * (1 - s) + 3 * x2 * s * s * (1 - s) + s * s * s;
    const by = (s) => 3 * y1 * s * (1 - s) * (1 - s) + 3 * y2 * s * s * (1 - s) + s * s * s;
    let lo = 0, hi = 1, s = t;
    for (let k = 0; k < 22; k++) { s = (lo + hi) / 2; if (bx(s) < t) lo = s; else hi = s; }
    return by(s);
  }
  sceneTween(k, q) {
    const T = this._tw || (this._tw = {}), now = performance.now();
    if (this.props.directScrub ?? false) { T[k] = { v: q, t: now }; return q; }
    const o = T[k] || (T[k] = { v: q, t: now });
    const dt = Math.min(0.05, Math.max(0.001, (now - o.t) / 1000)); o.t = now;
    const a = 1 - Math.exp(-dt * (this.props.sceneSmooth ?? 7));
    let d = (q - o.v) * a; const mx = dt * (this.props.sceneMaxSpeed ?? 1.6); d = Math.max(-mx, Math.min(mx, d));
    o.v += d; if (Math.abs(q - o.v) < 0.0004) o.v = q; return o.v;
  }
  logRect(el, a, b, tot) { const r = el.getBoundingClientRect(), u = r.height / tot; return { top: r.top + a * u, bottom: r.top + b * u, height: (b - a) * u, left: r.left, width: r.width }; }
  springTo(to, k, c, done, v0) { this.anim = { to, k, c, done }; if (v0 !== undefined) this.openV = v0; }
  openProject(i, uv) {
    if (this.playClick && !this.state.page) this.playClick();
    this.clickUV = uv || [0.5, 0.5];
    if (this.state.page || !this.prepClean) return;
    const snap = this.prepClean(i);
    this.lockScroll(true);
    try { history.pushState({ work: i }, '', '#work/' + this.projects[i].title.toLowerCase().replace(/\\s+/g, '-')); } catch (eH) {}
    this.openI = i; this.closing = false;
    this.setState({ page: { i, src: '', video: snap.video } });
    snap.src.then((src) => this.setState(s => s.page && s.page.i === i ? { page: { ...s.page, src } } : null));
    this.revealStart = 0; this.visK = 0;
    this.springTo(1, 68, 11, null, -0.9);
  }
  doClose() {
    if (!this.state.page || this.closing) return;
    this.closing = true;
    this.springTo(0, 88, 9.6, () => { this.closing = false; this.finishClose(); }, this.openV - 0.4);
  }
  requestClose() {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    this.doClose();
  }
  finishClose() {
    const nx = this.pendingNext; this.pendingNext = null;
    if (nx != null) setTimeout(() => { if (this.dead) return; this.sliderGo && this.sliderGo(1); setTimeout(() => !this.dead && this.openProject(nx, [0.5, 0.5]), 520); }, 30);
    this.releaseReveals && this.releaseReveals(); this.openI = -1; this.visK = 0; this.revealStart = 0; this.lockScroll(false); this.setState({ page: null }); }





  layoutCta() {
    const m = document.querySelector('[data-cta-model]'), t = document.querySelector('[data-hero3]'); if (!m || !t) return;
    const mob = innerWidth < 820, key = mob + '|' + innerWidth; if (this._ctaMob === key) return; this._ctaMob = key;
    if (mob) { m.style.left = '0'; m.style.bottom = '48%'; t.style.right = '0'; t.style.paddingTop = ''; }
    else { t.style.right = '58%'; t.style.paddingTop = ''; m.style.bottom = '0'; const pr = m.parentElement.getBoundingClientRect(), tr = t.getBoundingClientRect(); m.style.left = Math.round(Math.max(pr.width * 0.4, tr.right - pr.left + 24)) + 'px'; }
  }






  applyColors() {
    const P = this.props, map = { '--bg-hero': P.heroBg || '#202ded', '--bg-work': P.workBg || '#0e0e0d', '--bg-page': P.pageBg, '--bg-reach': P.reachBg, '--ink-reach': P.reachText, '--ink': P.textColor, '--bg-about': P.aboutBg, '--ink-about': P.aboutText, '--bg-footer': P.footerBg, '--ink-footer': P.footerText, '--bg-info': P.infoBg, '--ink-info': P.infoText, '--bg-services': P.servicesBg, '--ink-services': P.servicesText };
    window.__wbGalaxy = P.galaxyBg ?? true;
    if (window.__wbGalaxy) Object.assign(map, { '--bg-services': P.servicesBg || '#0b0b0b', '--ink-services': P.servicesText || '#f2f2f0', '--ink-footer': P.footerText || '#f2f2f0', '--ink-about': P.aboutText || '#f2f2f0' });
    // galaxy mode: clear only the actual panel backgrounds; colour tokens stay real (they're also used as inverse text/icon colours)
    { const G = window.__wbGalaxy; [['[data-panel]', 'background'], ['[data-cta-panel]', 'background'], ['[data-about]', 'backgroundColor'], ['[data-reach-panel]', 'background']].forEach(([q, k]) => { const el = document.querySelector(q); if (el) el.style[k] = G ? 'transparent' : ''; });
      document.querySelectorAll('[data-panel] > [aria-hidden="true"]').forEach((el) => { if (/linear-gradient/.test(el.style.background)) el.style.display = G ? 'none' : ''; }); { const rs = document.querySelector('[data-reach-panel]'); if (rs && G) rs.style.background = 'transparent'; } /* r14.14: galaxy keeps z-index 0 (z 1 put it above the About monitor layer) */ }
    const key = JSON.stringify(map); if (key === this._colKey) return; this._colKey = key;
    const st = document.documentElement.style; Object.entries(map).forEach(([k, v]) => { if (v) st.setProperty(k, v); else st.removeProperty(k); });
  }
  renderVals() {
    this.applyColors();
    const n = this.projects.length;
    const wrap = (i) => ((Math.round(+i || 0) % n) + n) % n;
    const p = this.projects[wrap(this.state.active)];
    const pg = this.state.page;
    const pp = (pg && this.projects[wrap(pg.i)]) || p;

    return {
      footerFigRef: this.footerFigRef, reachLetters: Array.from(String(this.props.reachTitle ?? 'Reach Out').toUpperCase()).map((c) => c === ' ' ? '\\u00a0' : c), astroGRef: this.astroGRef, ringLayout: (this.props.workLayout || 'Ring') === 'Ring',
      rollRef: this.rollRef, bleedRef: this.bleedRef, bgRef: this.bgRef, gooRef: this.gooRef, inkRef: this.inkRef, hostRef: this.hostRef, heroRef: this.heroRef, workRef: this.workRef, uiRef: this.uiRef,
      headlineRef: this.headlineRef, portraitRef: this.portraitRef, pageRef: this.pageRef,
      time: this.state.time,
      counter: String(this.state.active + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'),
      activeTitle: p.title,
      activeType: p.type + ' — ' + p.year,
      pageOpen: !!pg,
      overlayPE: pg ? 'auto' : 'none',
      closeRef: this.closeRef, loaderRef: this.loaderRef, soundOn: !!this.state.soundOn, soundOff: !this.state.soundOn, soundLabel: this.state.soundOn ? 'sound on' : 'sound off', toggleSound: () => this.toggleSound(), chromeRef: this.chromeRef, curtainRef: this.curtainRef, hero3dRef: this.hero3dRef, ctaRef: this.ctaRef, ctaGlRef: this.ctaGlRef, reachRef: this.reachRef, rayRef: this.rayRef, astroRef: this.astroRef, handRef: this.handRef, heroImage: !(this.props.hero3D ?? true),
      pageBg: pg && pg.src ? 'url(' + pg.src + ')' : 'none',
      pageVideo: pg ? pg.video : '',
      titleWords: (pp.title || '').split(' '),
      pageTitle: pp.title, pageClient: pp.client, pageType: pp.type, pageYear: pp.year, pageBlurb: pp.blurb || '', blurbWords: (pp.blurb || '').split(' ').filter(Boolean),
      nextTitle: this.projects[((pg ? pg.i : 0) + 1) % n].title,
      nextWords: (this.projects[((pg ? pg.i : 0) + 1) % n].title + ' →').split(' '),
      closePage: () => this.requestClose(),
      nextProject: () => {
        if (this.closing) return;
        this.pendingNext = (pg.i + 1) % n;
        this.requestClose();
      },
    };
  }
}
;return Component;`))(DCLogic, window.React, BASE);
  /* r14.12: build the project popup when the Webflow page has none (or an empty one) */
  (function () { var ov = document.querySelector('[data-wh="overlay"],[data-w="overlay"]'); if (ov && ov.querySelector('[data-wh="page"],[data-w="page"]') && ov.querySelector('[data-wh="close"],[data-w="close"]')) return; if (ov) { ov.removeAttribute('data-w'); ov.removeAttribute('data-wh'); ov.setAttribute('data-wb-old-overlay', ''); if (ov.querySelector('[data-about],[data-cta-panel],section')) { ov.classList.remove('w13-hidden', 'is-hidden', 'w20-hidden', 'state-hidden'); ov.style.setProperty('display', 'contents', 'important'); } } /* r14.13: never touch an existing element (it may hold real sections) — build a fresh popup next to it */ ov = document.createElement('div'); document.body.appendChild(ov); ov.setAttribute('data-wh', 'overlay'); ov.setAttribute('style', 'position:fixed;inset:0;z-index:80;display:none;'); ov.innerHTML = "<div style=\"position:absolute;inset:0;\"><div data-wh=\"page\" data-lenis-prevent=\"\" style=\"position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:#0e0e0d;color:#ece9e2;opacity:0;pointer-events:none;will-change:opacity;\"><div style=\"position:relative;height:100vh;height:100lvh;min-height:520px;\"><div data-wh=\"pageBg\" style=\"position:absolute;inset:0;background:#0e0e0d center/cover no-repeat;\"></div><video data-wh=\"pageVideo\" autoplay muted loop playsinline style=\"opacity:0;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;\"></video><div style=\"position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,0) 55%,rgba(5,5,5,0.75) 100%);\"></div><h1 data-w-words=\"title\" style=\"position:absolute;left:32px;right:32px;bottom:40px;margin:0;color:#ece9e2;font-weight:700;font-size:clamp(36px,5.6vw,92px);line-height:0.9;letter-spacing:-0.03em;text-transform:uppercase;display:flex;flex-wrap:wrap;gap:0 0.22em;\"></h1></div><div style=\"max-width:1200px;margin:0 auto;padding:72px 32px 48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:48px;\"><div data-rg=\"\" style=\"display:grid;grid-template-columns:auto 1fr;gap:12px 24px;align-content:start;font-family:Switzer,monospace;font-size:var(--ms,11px);\"><span style=\"overflow:hidden;\"><span data-w=\"\" style=\"display:block;color:#8a8984;transform:translate3d(0,110%,0);\">Client</span></span><span style=\"overflow:hidden;\"><span data-w=\"\" style=\"display:block;transform:translate3d(0,110%,0);\" data-w-text=\"pageClient\"></span></span><span style=\"overflow:hidden;\"><span data-w=\"\" style=\"display:block;color:#8a8984;transform:translate3d(0,110%,0);\">Services</span></span><span style=\"overflow:hidden;\"><span data-w=\"\" style=\"display:block;transform:translate3d(0,110%,0);\" data-w-text=\"pageType\"></span></span><span style=\"overflow:hidden;\"><span data-w=\"\" style=\"display:block;color:#8a8984;transform:translate3d(0,110%,0);\">Year</span></span><span style=\"overflow:hidden;\"><span data-w=\"\" style=\"display:block;transform:translate3d(0,110%,0);\" data-w-text=\"pageYear\"></span></span></div><p data-rg=\"\" data-w-words=\"blurb\" style=\"margin:0;font-size:clamp(17px,1.5vw,22px);line-height:1.3;grid-column:span 2;display:flex;flex-wrap:wrap;gap:0 0.26em;\"></p></div><div style=\"padding:0 0 96px;display:flex;flex-direction:column;gap:clamp(12px,1.6vw,24px);\"><div data-media=\"\" style=\"position:relative;width:100%;aspect-ratio:16 / 9;overflow:hidden;background:#151513;\"><div data-media-in=\"\" data-w-slot=\"\" style=\"position:absolute;inset:-8% 0;will-change:transform;\"></div></div><div data-media=\"\" style=\"position:relative;width:100%;aspect-ratio:16 / 9;overflow:hidden;background:#151513;\"><div data-media-in=\"\" data-w-slot=\"\" style=\"position:absolute;inset:-8% 0;will-change:transform;\"></div></div><div data-media=\"\" style=\"position:relative;width:100%;aspect-ratio:16 / 9;overflow:hidden;background:#151513;\"><div data-media-in=\"\" data-w-slot=\"\" style=\"position:absolute;inset:-8% 0;will-change:transform;\"></div></div></div><button data-w-click=\"nextProject\" style=\"display:flex;justify-content:space-between;align-items:center;gap:24px;width:100%;padding:48px 32px 64px;border:0;border-top:1px solid #33332f;background:transparent;color:#ece9e2;font-family:inherit;cursor:pointer;text-align:left;\"><span style=\"font-family:Switzer,monospace;font-size:var(--ms,11px);color:#8a8984;\">Next project</span><span data-rg=\"\" data-w-words=\"next\" style=\"font-weight:700;font-size:clamp(24px,3vw,44px);text-transform:uppercase;letter-spacing:-0.03em;display:flex;flex-wrap:wrap;gap:0 0.22em;\"></span></button></div><div data-wh=\"curtain\" style=\"position:absolute;inset:0;z-index:1;pointer-events:none;\"></div><button data-wh=\"close\" data-w-click=\"closePage\" style=\"opacity:0;position:absolute;top:20px;right:24px;z-index:2;display:flex;align-items:center;gap:8px;height:44px;padding:0 18px;border:0;border-radius:999px;background:#ece9e2;color:#050505;font-family:inherit;font-weight:600;font-size:14px;cursor:pointer;\">Close ✕</button></div>"; })();
  var overlay = document.querySelector('[data-wh="overlay"]'); var pristine = overlay ? overlay.cloneNode(true) : null;
  var POPUP_REFS = { page: 1, curtain: 1, close: 1 };
  var WORDS = {
    title: ['display:inline-block;overflow:hidden;padding:0.04em 0 0.08em;', 'data-rv', 'display:inline-block;opacity:0;transform:translate3d(0,110%,0);transform-origin:0 100%;will-change:transform;'],
    blurb: ['display:inline-block;overflow:hidden;padding-bottom:0.08em;', 'data-w', 'display:inline-block;transform:translate3d(0,110%,0) rotate(5deg);transform-origin:0 100%;will-change:transform;'],
    next: ['display:inline-block;overflow:hidden;padding:0.04em 0 0.08em;', 'data-w', 'display:inline-block;transform:translate3d(0,110%,0) rotate(5deg);transform-origin:0 100%;']
  };
  function setWords(box, words, kind) {
    if (!box) return; var spec = WORDS[kind]; var key = words.join('\u0001'); if (box.__w === key) return; var kids = box.children;
    if (box.__w != null && kids.length === words.length) { for (var i = 0; i < words.length; i++) kids[i].firstChild.textContent = words[i]; box.__w = key; return; }
    box.__w = key; box.innerHTML = '';
    words.forEach(function (w) { var o = document.createElement('span'); o.setAttribute('style', spec[0]); var n = document.createElement('span'); n.setAttribute(spec[1], ''); n.setAttribute('style', spec[2]); n.textContent = w; o.appendChild(n); box.appendChild(o); });
  }
  var inst = new Component(props); inst.props = props; inst.__cbs = []; var vals = {}; var wasOpen = false; var mounted = false; var queued = false;
  function q(name) { return document.querySelector('[data-wh="' + name + '"]'); }
  function render() {
    queued = false; vals = inst.renderVals();
    var open = !!vals.pageOpen;
    if (overlay && open && !wasOpen) { var fresh = pristine.cloneNode(true); prepHooks(fresh); overlay.replaceWith(fresh); overlay = fresh; }
    if (overlay) { overlay.classList.remove('w13-hidden', 'is-hidden', 'w20-hidden', 'state-hidden'); overlay.style.display = open ? 'block' : 'none'; overlay.style.pointerEvents = vals.overlayPE || 'none'; }
    Object.keys(vals).forEach(function (k) { if (!/Ref$/.test(k) || !vals[k] || typeof vals[k] !== 'object') return; var n = k.slice(0, -3); vals[k].current = (POPUP_REFS[n] && !open) ? null : (n === 'root' ? root : q(n)); });
    var t = document.querySelector('[data-w-text="time"]'); if (t && vals.time != null) t.textContent = vals.time;
    var on = document.querySelector('[data-w-if="soundOn"]'), offEl = document.querySelector('[data-w-if="soundOff"]');
    if (on) { on.classList.remove('w13-hidden', 'is-hidden', 'w20-hidden', 'state-hidden'); on.style.display = vals.soundOn ? '' : 'none'; } if (offEl) offEl.style.display = vals.soundOff ? '' : 'none';
    if (open && overlay) {
      var bg = overlay.querySelector('[data-wh="pageBg"]'); if (bg) bg.style.backgroundImage = vals.pageBg || 'none';
      var v = overlay.querySelector('[data-wh="pageVideo"]'); if (v) { if (vals.pageVideo) { v.style.display = ''; if (v.getAttribute('data-src') !== vals.pageVideo) v.setAttribute('data-src', vals.pageVideo); } else v.style.display = 'none'; }
      setWords(overlay.querySelector('[data-w-words="title"]'), vals.titleWords || [], 'title');
      setWords(overlay.querySelector('[data-w-words="blurb"]'), vals.blurbWords || [], 'blurb');
      setWords(overlay.querySelector('[data-w-words="next"]'), vals.nextWords || [], 'next');
      ['pageClient', 'pageType', 'pageYear'].forEach(function (k) { var el = overlay.querySelector('[data-w-text="' + k + '"]'); if (el) el.textContent = vals[k] == null ? '' : vals[k]; });
      var cur = inst.projects[inst.state.page.i] || {};
      overlay.querySelectorAll('[data-w-slot]').forEach(function (sl) { var src = cur.cover || ''; var im = sl.querySelector('img');
        if (!src) { if (im) im.remove(); return; }
        if (!im) { im = document.createElement('img'); im.alt = ''; im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block'; sl.appendChild(im); }
        if (im.getAttribute('src') !== src) im.src = src; });
    }
    wasOpen = open;
    var cbs = inst.__cbs; inst.__cbs = [];
    if (!mounted) { mounted = true; inst.componentDidMount && inst.componentDidMount(); } else { inst.componentDidUpdate && inst.componentDidUpdate(props, inst.state); }
    cbs.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }
  inst.__schedule = function () { if (!queued) { queued = true; queueMicrotask(render); } };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-w-click]'); if (!b) return; var f = vals[b.getAttribute('data-w-click')]; if (typeof f === 'function') { e.preventDefault(); f(e); } });
  window.__wubble = inst;
  // live fix: the astronaut only appeared after the first scroll — give every layer one "scroll + resize" tick once the loader is done
  (function () {
    var nudge = function () {
      try { dispatchEvent(new Event('resize')); } catch (e) {}
      var L = window.__sliderLenis || inst.lenis, y = window.scrollY || 0;
      if (L && L.scrollTo) { L.scrollTo(y + 1, { immediate: true, force: true }); L.scrollTo(y, { immediate: true, force: true }); }
      else { scrollTo(0, y + 1); scrollTo(0, y); }
      try { dispatchEvent(new Event('scroll')); } catch (e) {}
      inst.__schedule && inst.__schedule();
    };
    [400, 1200, 2500, 4000, 6000].forEach(function (t) { setTimeout(nudge, t); });
    var ld = document.querySelector('[data-wh="loader"],[data-w="loader"]');
    if (ld && window.MutationObserver) { var mo = new MutationObserver(function () { if (getComputedStyle(ld).display === 'none' || +getComputedStyle(ld).opacity === 0) { mo.disconnect(); setTimeout(nudge, 60); setTimeout(nudge, 600); } }); mo.observe(ld, { attributes: true, attributeFilter: ['style', 'class'] }); }
    addEventListener('load', function () { setTimeout(nudge, 100); });
  })();
  if (window.__wbGeneric) (function () {
    var st = WB_SECS.map(function () { return { q: 0, bgSet: false }; });
    var panelOf = function (sec) { return sec.querySelector('[data-panel],[data-cta-panel],[data-reach-panel]') || sec.firstElementChild || sec; };
    var bgOf = function (el) { for (var e = el; e && e !== document.body; e = e.parentElement) { var c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(c)) return c; } return props.pageBg || '#050505'; };
    var tick = function () {
      requestAnimationFrame(tick);
      if (inst.state && inst.state.page) return;
      var vh = window.__svh || innerHeight;
      for (var i = 1; i < WB_SECS.length; i++) {
        var sec = WB_SECS[i], s0 = st[i], T = parseFloat(sec.getAttribute('data-wb-transition')) || 1.6;
        var top = sec.getBoundingClientRect().top, q = Math.max(0, Math.min(1, (vh - top) / (vh * T)));
        s0.q += (q - s0.q) * 0.18; if (Math.abs(q - s0.q) < 0.0005) s0.q = q;
        var p = panelOf(sec), on = s0.q > 0.0005 && s0.q < 0.9995;
        inst.smokeMask(p, s0.q);
        if (on && !s0.bgSet) { var c = getComputedStyle(p).backgroundColor; if (!c || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(c)) { p.style.backgroundColor = bgOf(sec.parentElement) ; s0.bgSet = true; } }
        if (!on && s0.bgSet) { p.style.backgroundColor = ''; s0.bgSet = false; }
      }
    };
    requestAnimationFrame(tick);
  })();
  wbEnsure(document.querySelector('[data-wh="root"],[data-w="root"]') || document.body);
  Promise.all([lenisReady, wbModsReady]).then(render);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

}

;
/* modules22/wb-btn.js */
/* Wubble buttons (behaviour; look in wb-btn.css). Every [data-wb-btn] gets the same hover:
   a fill that grows from where the cursor enters and shrinks toward where it leaves, the label rolls up (a copy rolls in
   from below), and a light magnetic pull toward the cursor that springs back. Touch: no hover effects. Reduced motion: fill only. */
(() => {
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return 1; const [r, g, b] = m.map(Number); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const wrapLabels = (btn) => {
    const rolls = [];
    const wrap = (node) => { const txt = node.textContent; if (!txt.trim()) return; const w = document.createElement('span'); w.className = 'wb-btn-l';
      const a = document.createElement('span'), b = document.createElement('span'); a.textContent = txt; b.textContent = txt; b.setAttribute('aria-hidden', 'true'); w.append(a, b); node.replaceWith(w); rolls.push(a, b); };
    [...btn.childNodes].forEach((n) => { if (n.nodeType === 3) wrap(n); else if (n.nodeType === 1 && !n.children.length && n.textContent.trim() && n.getAttribute('aria-hidden') !== 'true') wrap(n.firstChild); });
    return rolls;
  };
  const prep = (btn) => {
    if (btn.__wbBtn) return; btn.__wbBtn = 1;
    const fill = document.createElement('span'); fill.className = 'wb-btn-fill'; fill.setAttribute('aria-hidden', 'true'); btn.prepend(fill);
    const rolls = wrapLabels(btn), tops = rolls.filter((_, i) => i % 2 === 0), bots = rolls.filter((_, i) => i % 2 === 1);
    const G = () => window.gsap, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let base = null, ink = null;
    const at = (e) => { const r = btn.getBoundingClientRect(); return { x: (e.clientX ?? r.left + r.width / 2) - r.left, y: (e.clientY ?? r.top + r.height / 2) - r.top, r }; };
    const enter = (e) => { const g = G(); if (!g) return; const p = at(e);
      base = getComputedStyle(btn).color; const solid = btn.getAttribute('data-wb-btn') === 'solid';
      const fc = solid ? (lum(getComputedStyle(btn).backgroundColor) > 0.5 ? 'rgb(14,14,13)' : 'rgb(244,244,242)') /* rgb, not hex: lum() reads rgb */ : base; ink = lum(fc) > 0.5 ? '#0e0e0d' : '#f4f4f2';
      fill.style.background = fc; const R = Math.hypot(Math.max(p.x, p.r.width - p.x), Math.max(p.y, p.r.height - p.y)) * 2;
      g.killTweensOf(fill); g.fromTo(fill, { left: p.x, top: p.y, width: 0, height: 0 }, { width: R, height: R, duration: still ? 0.2 : 0.55, ease: 'power3.out' });
      g.to(btn, { color: ink, borderColor: 'transparent', duration: 0.3, ease: 'power2.out' });
      if (!still && tops.length) { g.to(tops, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }); g.to(bots, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }); } };
    const leave = (e) => { const g = G(); if (!g) return; const p = at(e);
      g.killTweensOf(fill); g.to(fill, { left: p.x, top: p.y, width: 0, height: 0, duration: still ? 0.2 : 0.5, ease: 'power3.inOut' });
      g.to(btn, { color: base || '', clearProps: 'borderColor', duration: 0.35, ease: 'power2.out', onComplete: () => { btn.style.color = ''; } });
      if (!still && tops.length) { g.to([...tops, ...bots], { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }); }
      if (!still) g.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' }); };
    const move = (e) => { const g = G(); if (!g || still) return; const p = at(e), dx = p.x - p.r.width / 2, dy = p.y - p.r.height / 2;
      g.to(btn, { x: Math.max(-10, Math.min(10, dx * 0.22)), y: Math.max(-8, Math.min(8, dy * 0.35)), duration: 0.5, ease: 'power3.out' }); };
    /* specular buttons: glint and highlight follow the cursor */
    const spec = (e) => { if (!btn.hasAttribute('data-wb-specular')) return; const p = at(e); btn.setAttribute('data-wb-spec-on', '');
      btn.style.setProperty('--wb-sx', p.x + 'px'); btn.style.setProperty('--wb-sy', p.y + 'px'); btn.style.setProperty('--wb-sa', (Math.atan2(p.y - p.r.height / 2, p.x - p.r.width / 2) * 180 / Math.PI - 169) + 'deg' /* glint peak (72% of the cone) points at the cursor */); };
    btn.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') enter(e); });
    btn.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') leave(e); btn.removeAttribute('data-wb-spec-on'); });
    btn.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') { move(e); spec(e); } });
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) enter({}); }); btn.addEventListener('blur', () => leave({}));
  };
  /* the ink cursor fades out over buttons, links and other click targets (read by wb-cursor.js and the homepage cursor) */
  const HIDE = 'a,button,[role=button],[data-wb-btn],[data-wb-reflect],[data-wb-row],[data-wb-bounce-card],[data-wb-cursor-hide]';
  addEventListener('pointerover', (e) => { window.__wbCursorHide = !!(e.target.closest && e.target.closest(HIDE)) && !e.target.closest('[data-wb-cursor-keep]'); }, { passive: true });
  const scan = () => document.querySelectorAll('[data-wb-btn]').forEach(prep);
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

;
/* modules22/wb-chat.js */
/* Wubble chat: a gooey "Let's chat" button (bottom right) that opens a small chat box with the site assistant.
   The answers come from the chat Worker (wubble/chat-worker), which keeps the Claude API key off the page.
   Webflow: load this script with data-endpoint="https://wubble-chat.<you>.workers.dev". Without an endpoint the box still
   opens and points visitors to hello@wubble.studio. Optional: data-label="Let's chat" · data-color="#f2f1ee" · data-ink="#0e0e0d" */
(() => {
  if (window.__wbChat) return; window.__wbChat = 1;
  const me = document.currentScript, D = (k, d) => (me && me.getAttribute('data-' + k)) || d;
  const URL_ = D('endpoint', window.WB_CHAT_URL || ''), C = D('color', '#f2f1ee'), INK = D('ink', '#0e0e0d');
  const ASK = ['What does a new website cost?', 'Can AI recommend my business?', 'How does a project start?'];
  const css = `
.wbc{position:fixed;right:var(--wb-edge,40px);bottom:clamp(20px,4vh,40px);z-index:140;font:500 14px/1.4 'Switzer',Helvetica,Arial,sans-serif}
@media(max-width:700px){.wbc{right:16px;bottom:16px}}
.wbc-goo{position:absolute;right:0;bottom:0;width:150px;height:52px;filter:url(#wbc-goo);pointer-events:none}
.wbc-goo i{position:absolute;display:block;background:${C};border-radius:999px;transition:transform .55s cubic-bezier(.5,1.8,.4,1)}
.wbc-goo i:nth-child(1){inset:0}
.wbc-goo i:nth-child(2),.wbc-goo i:nth-child(3){width:30px;height:30px;right:11px;top:11px}
.wbc:hover .wbc-goo i:nth-child(2){transform:translate(-14px,-34px)}
.wbc:hover .wbc-goo i:nth-child(3){transform:translate(-62px,-22px) scale(.7)}
.wbc.open .wbc-goo i:nth-child(2),.wbc.open .wbc-goo i:nth-child(3){transform:none}
.wbc-btn{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:150px;height:52px;border:0;border-radius:999px;background:transparent;color:${INK};font:inherit;cursor:pointer}
.wbc-btn:focus-visible{outline:2px solid ${C};outline-offset:4px}
.wbc-dot{width:8px;height:8px;border-radius:50%;background:#2fd36b;box-shadow:0 0 0 4px rgba(47,211,107,.18)}
.wbc-box{position:absolute;right:0;bottom:68px;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 140px));display:flex;flex-direction:column;
  background:#111113;color:#f2f1ee;border:1px solid rgba(255,255,255,.1);border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45);
  transform-origin:100% 100%;transform:scale(.6) translateY(20px);opacity:0;visibility:hidden;transition:transform .45s cubic-bezier(.2,1.3,.3,1),opacity .25s,visibility 0s .45s}
.wbc.open .wbc-box{transform:none;opacity:1;visibility:visible;transition:transform .45s cubic-bezier(.2,1.3,.3,1),opacity .25s}
.wbc-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.08)}
.wbc-head b{font-weight:700;letter-spacing:-.01em}.wbc-head span{display:block;font-size:12px;color:rgba(242,241,238,.55)}
.wbc-x{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:none;color:inherit;cursor:pointer;font-size:16px}
.wbc-log{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
.wbc-m{max-width:85%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}
.wbc-m.a{align-self:flex-start;background:rgba(255,255,255,.07);border-bottom-left-radius:4px}
.wbc-m.u{align-self:flex-end;background:${C};color:${INK};border-bottom-right-radius:4px}
.wbc-m.t{color:rgba(242,241,238,.5)}
.wbc-sug{display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 12px}
.wbc-sug button{padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:none;color:inherit;font:inherit;font-size:12px;cursor:pointer}
.wbc-sug button:hover{background:rgba(255,255,255,.08)}
.wbc-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08)}
.wbc-form input{flex:1;min-width:0;padding:12px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:inherit;font:inherit;outline:none}
.wbc-form input:focus{border-color:rgba(255,255,255,.4)}
.wbc-form button{width:44px;height:44px;flex:none;border-radius:50%;border:0;background:${C};color:${INK};font-size:18px;cursor:pointer}
.wbc-m a{color:inherit;text-decoration:underline;text-underline-offset:2px}
.wbc-note{padding:0 16px 10px;font-size:11px;color:rgba(242,241,238,.45);text-align:center}
@media(prefers-reduced-motion:reduce){.wbc-goo i,.wbc-box{transition:none!important}}`;
  const build = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    const w = document.createElement('div'); w.className = 'wbc';
    w.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="wbc-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>
<div class="wbc-goo" aria-hidden="true"><i></i><i></i><i></i></div>
<button class="wbc-btn" type="button" aria-expanded="false" aria-controls="wbc-box"><span class="wbc-dot" aria-hidden="true"></span>${D('label', "Let's chat")}</button>
<section class="wbc-box" id="wbc-box" role="dialog" aria-label="Chat with Wubble">
  <div class="wbc-head"><div><b>Wubble AI assistant</b><span>Answers in seconds, day and night</span></div><button class="wbc-x" type="button" aria-label="Close chat">✕</button></div>
  <div class="wbc-log" aria-live="polite"></div>
  <div class="wbc-sug">${ASK.map((q) => `<button type="button">${q}</button>`).join('')}</div>
  <form class="wbc-form"><input name="q" autocomplete="off" placeholder="Ask anything about Wubble…" aria-label="Your message" maxlength="2000"><button type="submit" aria-label="Send">↑</button></form>
  <p class="wbc-note">You're chatting with an AI. Wubble doesn't keep your chat.</p>
</section>`;
    document.body.append(w);
    const btn = w.querySelector('.wbc-btn'), log = w.querySelector('.wbc-log'), form = w.querySelector('form'), input = form.q, sug = w.querySelector('.wbc-sug');
    const history = []; let busy = false;
    /* text with https links made clickable (built from text nodes, never innerHTML: replies are untrusted) */
    const fill = (m, text) => { m.textContent = ''; text.split(/(https:\/\/[^\s)]+)/g).forEach((p, i) => { if (i % 2) { const a = document.createElement('a'); a.href = p.replace(/[.,!?]+$/, ''); a.textContent = p; a.target = '_blank'; a.rel = 'noopener'; m.append(a); } else if (p) m.append(p); }); };
    const add = (role, text) => { const m = document.createElement('div'); m.className = 'wbc-m ' + role; fill(m, text); log.append(m); log.scrollTop = log.scrollHeight; return m; };
    add('a', "Hi, I'm Wubble's AI assistant. Ask me about a new website, Webflow plans or getting found in ChatGPT. Want Leroy to get back to you by email? I can arrange that.");
    const toggle = (on) => { w.classList.toggle('open', on); btn.setAttribute('aria-expanded', on); if (on) setTimeout(() => input.focus(), 250); else btn.focus(); };
    btn.addEventListener('click', () => toggle(!w.classList.contains('open')));
    w.querySelector('.wbc-x').addEventListener('click', () => toggle(false));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && w.classList.contains('open')) toggle(false); });
    const send = async (q) => {
      q = q.trim(); if (!q || busy) return; busy = true; sug.remove(); add('u', q); history.push({ role: 'user', content: q }); input.value = '';
      const t = add('a t', '…');
      let reply = 'The chat is not connected yet. Email me at hello@wubble.studio and I reply within one working day.';
      if (URL_) try { const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, page: location.pathname }) });
        const j = await r.json(); reply = j.reply || reply; } catch (e) { reply = 'Could not reach the assistant. Email me at hello@wubble.studio.'; }
      t.className = 'wbc-m a'; fill(t, reply); history.push({ role: 'assistant', content: reply }); log.scrollTop = log.scrollHeight; busy = false;
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
    /* any [data-wb-chat-ask="question"] on the page opens the chat and asks it (e.g. the free AI Snapshot button).
       Capture phase, so page transitions on the same link never fire; without this script the link's own href still works. */
    document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('[data-wb-chat-ask]'); if (!a) return;
      e.preventDefault(); e.stopPropagation(); toggle(true); setTimeout(() => send(a.getAttribute('data-wb-chat-ask')), 350); }, true);
    /* a click made while the page was still loading was parked by the page's head snippet: answer it now */
    window.__wbChatReady = 1; if (window.__wbChatAsk) { const q = window.__wbChatAsk; window.__wbChatAsk = null; toggle(true); setTimeout(() => send(q), 350); }
    sug.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') send(e.target.textContent); });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', build, { once: true }); else build();
})();

;
/* modules22/wb-consent.js */
/* Wubble cookie consent (Netherlands/EU + USA).
   - EU/NL mode (GDPR + Dutch Telecommunicatiewet): nothing optional runs before a choice. "Accept all" and "Reject all" are
     equally prominent, categories start unticked, the choice is stored for 12 months, then asked again.
   - US mode (CCPA/CPRA and similar state laws): notice at collection, optional cookies on by default, a clear
     "Do not sell or share my personal information" opt-out. A Global Privacy Control signal (navigator.globalPrivacyControl)
     is honoured as that opt-out automatically.
   Mode: US when the visitor's time zone is in the US (America/... US zones, Pacific/Honolulu), otherwise EU (the stricter one).
   Language: Dutch when the browser language is Dutch, otherwise English.
   Webflow:
   - Load this script in the site head, before analytics.
   - Block optional scripts until consent: <script type="text/plain" data-wb-consent="analytics" src="..."></script>
     (or data-wb-consent="marketing"). They are activated once that category is allowed.
   - Google Consent Mode v2 is updated automatically when gtag is on the page.
   - Any element with [data-wb-consent-open] reopens the settings (e.g. a "Cookie settings" link in the footer).
   - Options on this script tag: data-policy="/privacy" (privacy policy link).
   API: WBConsent.get() -> { necessary, analytics, marketing, region } | null · WBConsent.open() · event 'wb:consent' on document. */
(() => {
  if (window.WBConsent) return;
  const me = document.currentScript, POLICY0 = (me && me.dataset.policy) || '/privacy', POLICY = (/^nl/i.test(document.documentElement.lang || '') && POLICY0.charAt(0) === '/' && !/^\/nl(\/|$)/.test(POLICY0)) ? '/nl' + POLICY0 : POLICY0, /* Dutch pages (Webflow Localize /nl): Dutch privacy page */ KEY = 'wb-consent', VERSION = 1, MAX_AGE = 365 * 864e5;
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
  const US_TZ = /^America\/(New_York|Detroit|Chicago|Denver|Phoenix|Los_Angeles|Anchorage|Boise|Indiana|Kentucky|North_Dakota|Menominee|Juneau|Sitka|Nome|Yakutat|Metlakatla|Adak)|^Pacific\/Honolulu$|^US\//;
  const REGION = US_TZ.test(tz) ? 'us' : 'eu', NL = /^nl\b/i.test(navigator.language || ''), GPC = navigator.globalPrivacyControl === true;
  const T = NL ? {
    title: 'Cookies', eu: 'Ik gebruik noodzakelijke cookies om deze site te laten werken. Met jouw toestemming gebruik ik ook analytische en marketingcookies om de site te verbeteren.',
    us: 'Deze site gebruikt cookies voor analyse en marketing. Je kunt je afmelden voor de verkoop of het delen van je gegevens.',
    accept: 'Alles accepteren', reject: 'Alles weigeren', settings: 'Instellingen', save: 'Keuze opslaan', ok: 'Oké', optout: 'Verkoop of deling van mijn gegevens weigeren',
    policy: 'Privacybeleid', nec: 'Noodzakelijk', necD: 'Nodig om de site te laten werken. Altijd aan.', ana: 'Analyse', anaD: 'Anoniem inzicht in hoe bezoekers de site gebruiken.',
    mkt: 'Marketing', mktD: 'Om advertenties en campagnes te meten en te personaliseren.', gpc: 'Je browser stuurt een Global Privacy Control-signaal; dat respecteer ik.' } : {
    title: 'Cookies', eu: 'I use necessary cookies to make this site work. With your consent I also use analytics and marketing cookies to improve it.',
    us: 'This site uses cookies for analytics and marketing. You can opt out of the sale or sharing of your personal information.',
    accept: 'Accept all', reject: 'Reject all', settings: 'Settings', save: 'Save choices', ok: 'OK', optout: 'Do not sell or share my personal information',
    policy: 'Privacy policy', nec: 'Necessary', necD: 'Needed for the site to work. Always on.', ana: 'Analytics', anaD: 'Anonymous insight into how visitors use the site.',
    mkt: 'Marketing', mktD: 'To measure and personalise ads and campaigns.', gpc: 'Your browser sends a Global Privacy Control signal, which I honour.' };
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.v === VERSION && Date.now() - v.ts < MAX_AGE) return v; } catch (e) {} return null; };
  const write = (c) => { const v = { v: VERSION, ts: Date.now(), region: REGION, necessary: true, analytics: !!c.analytics, marketing: !!c.marketing && !(REGION === 'us' && GPC) };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} apply(v); return v; };
  // activate blocked scripts + tell Google Consent Mode + let page code react
  const apply = (v) => {
    document.querySelectorAll('script[type="text/plain"][data-wb-consent]').forEach((s) => { if (!v[s.dataset.wbConsent] || s.__on) return; s.__on = 1;
      const n = document.createElement('script'); [...s.attributes].forEach((a) => { if (a.name !== 'type') n.setAttribute(a.name, a.value); }); n.text = s.text; s.replaceWith(n); });
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: v.analytics ? 'granted' : 'denied',
      ad_storage: v.marketing ? 'granted' : 'denied', ad_user_data: v.marketing ? 'granted' : 'denied', ad_personalization: v.marketing ? 'granted' : 'denied' });
    document.dispatchEvent(new CustomEvent('wb:consent', { detail: v }));
  };
  const css = `.wbcc{position:fixed;left:var(--wb-edge,40px);bottom:clamp(20px,4vh,40px);z-index:145;width:min(420px,calc(100vw - 32px));box-sizing:border-box;padding:22px;border-radius:20px;
  background:#111113;color:#f2f1ee;border:1px solid rgba(255,255,255,.1);box-shadow:0 30px 80px rgba(0,0,0,.45);font:400 var(--wb-t-small,13px)/1.5 'Switzer',Helvetica,Arial,sans-serif;
  transform:translateY(16px);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .4s}
.wbcc.on{transform:none;opacity:1}
@media(max-width:700px){.wbcc{left:16px;bottom:84px}}
.wbcc h2{margin:0 0 8px;font-size:var(--wb-t-body,15px);font-weight:600;letter-spacing:-.01em}
.wbcc p{margin:0;color:rgba(242,241,238,.7)}.wbcc a{color:#f2f1ee}
.wbcc-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.wbcc-row [data-wb-btn]{flex:1 1 auto;min-height:40px;padding:0 16px;font-size:13px}
.wbcc-opts{display:none;flex-direction:column;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.1)}.wbcc.open .wbcc-opts{display:flex}
.wbcc-opt{display:flex;gap:10px;align-items:flex-start;cursor:pointer}.wbcc-opt input{margin:3px 0 0;accent-color:#f2f1ee}
.wbcc-opt b{display:block;font-weight:600;color:#f2f1ee}.wbcc-opt span{color:rgba(242,241,238,.55)}
.wbcc-link{background:none;border:0;padding:0;margin-top:12px;color:rgba(242,241,238,.7);font:inherit;text-decoration:underline;cursor:pointer;text-align:left}
@media(prefers-reduced-motion:reduce){.wbcc{transition:none}}`;
  let box = null;
  const show = (forceSettings) => {
    if (box) box.remove(); const cur = read();
    if (!document.getElementById('wbcc-css')) { const st = document.createElement('style'); st.id = 'wbcc-css'; st.textContent = css; document.head.append(st); }
    box = document.createElement('section'); box.className = 'wbcc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'wbcc-t'); box.setAttribute('aria-live', 'polite');
    const us = REGION === 'us', anaOn = cur ? cur.analytics : us, mktOn = cur ? cur.marketing : us && !GPC;
    const opt = (k, t, d, on, dis) => `<label class="wbcc-opt"><input type="checkbox" data-k="${k}"${on ? ' checked' : ''}${dis ? ' disabled' : ''}><span><b>${t}</b>${d}</span></label>`;
    box.innerHTML = `<h2 id="wbcc-t">${T.title}</h2><p>${us ? T.us : T.eu} <a href="${POLICY}">${T.policy}</a>.</p>${us && GPC ? `<p style="margin-top:8px">${T.gpc}</p>` : ''}
      <div class="wbcc-opts">${opt('necessary', T.nec, T.necD, true, true)}${opt('analytics', T.ana, T.anaD, anaOn)}${opt('marketing', T.mkt, T.mktD, mktOn, us && GPC)}</div>
      <div class="wbcc-row">${us
        ? `<button type="button" data-wb-btn="solid" data-a="ok">${T.ok}</button><button type="button" data-wb-btn="" data-a="settings">${T.settings}</button>`
        : `<button type="button" data-wb-btn="solid" data-a="accept">${T.accept}</button><button type="button" data-wb-btn="solid" data-a="reject">${T.reject}</button><button type="button" data-wb-btn="" data-a="settings">${T.settings}</button>`}</div>
      ${us ? `<button type="button" class="wbcc-link" data-a="optout">${T.optout}</button>` : ''}`;
    document.body.append(box); requestAnimationFrame(() => box.classList.add('on'));
    const val = (k) => box.querySelector(`[data-k="${k}"]`).checked, close = () => { box.classList.remove('on'); const b = box; setTimeout(() => b.remove(), 450); box = null; };
    if (forceSettings) box.classList.add('open');
    box.addEventListener('click', (e) => { const a = e.target.closest('[data-a]'); if (!a) return; const act = a.dataset.a;
      if (act === 'settings') { if (!box.classList.contains('open')) { box.classList.add('open'); a.textContent = T.save; a.dataset.a = 'save'; } return; }
      if (act === 'accept') write({ analytics: true, marketing: true });
      else if (act === 'reject' || act === 'optout') write({ analytics: act === 'optout' ? val('analytics') : false, marketing: false });
      else if (act === 'ok') write({ analytics: val('analytics'), marketing: val('marketing') });
      else if (act === 'save') write({ analytics: val('analytics'), marketing: val('marketing') });
      close(); });
    if (forceSettings) { const s = box.querySelector('[data-a="settings"]'); if (s) { s.textContent = T.save; s.dataset.a = 'save'; } }
    box.querySelector('[data-a]').focus({ preventScroll: true });
  };
  window.WBConsent = { get: read, open: () => show(true), region: REGION };
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-wb-consent-open]')) { e.preventDefault(); show(true); } });
  const start = () => { const v = read(); if (v) apply(v); else if (REGION === 'us') { apply(write({ analytics: true, marketing: !GPC })); show(false); } else show(false); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

;
/* modules22/wb-logohover.js */
/* Wubble logo hover: the "wubble" wordmark rolls its letters up in a quick wave (a copy rolls in from below) and
   rolls back when the pointer leaves. Needs GSAP.
   Webflow: data-wb-logo on the logo link/text (it must contain only the word). Found automatically: [data-logo-w] and the
   header / menu link whose text is "wubble". Reduced motion: no animation. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const prep = (el) => {
    if (el.__wbLogo || el.children.length) return; const txt = el.textContent.trim(); if (!txt) return; el.__wbLogo = 1;
    el.setAttribute('aria-label', txt); el.textContent = '';
    const tops = [], bots = [];
    [...txt].forEach((c) => { const w = document.createElement('span'), a = document.createElement('span'), b = document.createElement('span');
      w.setAttribute('aria-hidden', 'true'); w.style.cssText = 'position:relative;display:inline-block;overflow:hidden;vertical-align:top;line-height:1.1;';
      a.style.display = 'inline-block'; b.style.cssText = 'position:absolute;left:0;top:100%;display:inline-block;'; a.textContent = b.textContent = c;
      w.append(a, b); el.append(w); tops.push(a); bots.push(b); });
    const G = () => window.gsap;
    el.addEventListener('pointerenter', (e) => { const g = G(); if (!g || e.pointerType === 'touch') return;
      g.to([...tops, ...bots], { yPercent: -100, rotate: 0, duration: 0.55, ease: 'power3.inOut', stagger: { each: 0.035, from: 'start' }, overwrite: true });
      g.fromTo(bots, { rotate: 12 }, { rotate: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.035, delay: 0.1 }); });
    el.addEventListener('pointerleave', () => { const g = G(); if (!g) return;
      g.to([...tops, ...bots], { yPercent: 0, rotate: 0, duration: 0.5, ease: 'power3.inOut', stagger: { each: 0.03, from: 'end' }, overwrite: true }); });
  };
  const scan = () => {
    document.querySelectorAll('[data-wb-logo], [data-logo-w]').forEach(prep);
    document.querySelectorAll('[data-wb-site-header] a, [data-wb-menu] a, header a').forEach((a) => { if (a.textContent.trim().toLowerCase() === 'wubble') prep(a); });
  };
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

;
/* modules22/wb-rowhover.js */
/* Wubble row hover (Services list): hovering a row rolls its title letter by letter (a copy rolls in from below,
   staggered, word-wrapped so multi-line titles work), slides the row content right, reveals an arrow, nudges the
   detail lines in one by one and dims the other rows. GSAP, mouse only (touch devices keep the plain link).
   Webflow: the row is a Link Block [data-wb-row] (href = the service page), its title [data-wb-row-title], the
   detail lines are <li> inside it. Opt out with data-wb-nohover. */
(() => {
  const ARROW = '↗';
  const split = (el) => {
    /* a title on one line stays on one line: the split letters are a hair wider and must not push the last word down */
    { const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize); if (el.getBoundingClientRect().height < lh * 1.5) el.style.whiteSpace = 'nowrap'; }
    const txt = el.textContent.trim(); el.setAttribute('aria-label', txt); el.textContent = '';
    const tops = [], bots = [];
    txt.split(/\s+/).forEach((w, i, all) => {
      const word = document.createElement('span'); word.setAttribute('aria-hidden', 'true');
      word.style.cssText = 'display:inline-block;position:relative;overflow:hidden;vertical-align:top;padding-bottom:0.08em;margin-bottom:-0.08em;';
      const top = document.createElement('span'), bot = document.createElement('span');
      top.style.cssText = 'display:block;white-space:pre;'; bot.style.cssText = 'display:block;white-space:pre;position:absolute;left:0;top:100%;';
      [...w].forEach((c) => { for (const [box, list] of [[top, tops], [bot, bots]]) { const s = document.createElement('span'); s.textContent = c; s.style.cssText = 'display:inline-block;will-change:transform;'; box.appendChild(s); list.push(s); } });
      word.append(top, bot); el.appendChild(word); if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return [tops, bots];
  };
  const prep = (row, rows) => {
    if (row.__rh || row.closest('[data-wb-nohover]')) return row.__go; const G = window.gsap, title = row.querySelector('[data-wb-row-title]'); if (!G || !title) return null; row.__rh = 1;
    const [L, B] = split(title), items = [...row.querySelectorAll('li')];
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = ARROW;
    arrow.style.cssText = 'display:inline-block;margin-left:0.25em;font-weight:400;opacity:0;transform:translate(-0.4em,0.4em);'; title.appendChild(arrow);
    G.set(B, { yPercent: 0, rotate: 6, opacity: 0 }); /* hidden copies fade too, so no sliver (descenders, rotated corners) peeks through */
    let tl = null;
    const go = (on) => {
      if (tl) tl.kill(); const ease = 'power3.inOut', d = 0.6;
      tl = G.timeline({ defaults: { ease, overwrite: 'auto' } })
        .to(L, { yPercent: on ? -100 : 0, rotate: on ? -6 : 0, opacity: on ? 0 : 1, duration: d, stagger: 0.014 }, 0)
        .to(B, { yPercent: on ? -100 : 0, rotate: on ? 0 : 6, opacity: on ? 1 : 0, duration: d, stagger: 0.014 }, 0)
        .to(title, { x: on ? 18 : 0, duration: 0.7, ease: 'power3.out' }, 0)
        .to(arrow, { opacity: on ? 1 : 0, x: on ? 0 : '-0.4em', y: on ? 0 : '0.4em', duration: 0.5, ease: 'power3.out' }, on ? 0.15 : 0)
        .to(items, { x: on ? 10 : 0, duration: 0.6, ease: 'power3.out', stagger: on ? 0.05 : 0 }, 0.05)
        .to(rows.filter((r) => r !== row), { opacity: on ? 0.32 : 1, duration: 0.5, ease: 'power2.out' }, 0);
    };
    return go;
  };
  const start = () => {
    if (matchMedia('(hover: none)').matches) return;
    if (!window.gsap) return setTimeout(start, 150);
    const rows = [...document.querySelectorAll('[data-wb-row]')]; if (!rows.length) return setTimeout(start, 300); // page may render after this script
    /* set up on first hover, so a title's own reveal animation (e.g. data-wb-lines) has finished before it is split */
    rows.forEach((r) => { const on = (v) => { const go = r.__go || (r.__go = prep(r, rows)); if (go) go(v); };
      r.addEventListener('mouseenter', () => on(true)); r.addEventListener('mouseleave', () => on(false)); r.addEventListener('focus', () => on(true)); r.addEventListener('blur', () => on(false)); });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

;
/* modules22/wb-ink.js */
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
  /* wait until the new page renders 3 smooth frames in a row (its 3D boot is done), max 900ms, so the reveal never stutters */
  const calm = () => new Promise((res) => { const t0 = performance.now(); let last = t0, ok = 0; const f = (now) => { ok = now - last < 24 ? ok + 1 : 0; last = now; if (ok >= 3 || now - t0 > 900) res(); else raf(f); }; raf(f); });
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
    window.__wbInkBusy = 1; /* arriving under the ink: page reveals wait until it opens */ setTimeout(() => { window.__wbInkBusy = 0; }, 9000); /* never keep text waiting if something fails */
    const go = () => { if (!mount(st.x * innerWidth, st.y * innerHeight, st.c)) { cover.remove(); dropBoot(); window.__wbInkBusy = 0; return openRes(); } draw(1, 1); cover.remove(); raf(() => raf(dropBoot)); /* canvas is showing full ink: hand over */
      const R = window.WB_INK_READY, ld = loader(st.c);
      (R && R.then ? Promise.race([R, new Promise((z) => setTimeout(z, window.WB_INK_MAX || 4000))]) : Promise.resolve()).then(() => ld.done().then(calm).then(() => enter(() => { window.__wbInkBusy = 0; }))); };
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

;
/* modules22/wb-swap.js */
/* Wubble page swapping (Barba-style): the ink covers, the new page's content is swapped in without a reload,
   history is updated, then the ink opens from the same spot. Back/forward work too.
   Two modes:
   1) window.WB_SWAP_ROUTE(url) → promise   (in-page router, e.g. one Design Component that owns several views)
   2) Webflow: every page has one [data-wb-container] (+ data-wb-namespace="home|work|project").
      - The next page is fetched, its container replaces the current one, <title> + data-wf-page update, Webflow IX2 re-inits,
        page scripts the new page needs (and this page didn't load) are loaded once, then 'wb:swap' fires
        ({detail:{namespace,url,fresh}}) so page modules can (re)start. 'wb:leave' fires on the old page first.
      - Keep-alive: a container with data-wb-keep (default for namespace home + work) is NOT thrown away. Its node, scroll
        position and every animation loop it started are frozen; coming back reinserts the same node and resumes the loops,
        so the homepage / work 3D is instantly there (no reload, no black frame).
      - Body-level layers a page created itself (WebGL canvases etc.) are hidden while away. Mark shared layers that must stay
        visible on every page with data-wb-persist (the ink + hover-distort canvases already are).
   Links opt in with data-wb-swap (or data-wb-ink); external / new-tab links are left alone. */
(() => {
  if (window.wbSwapGo) return;
  /* ---- animation-loop ownership: every rAF chain belongs to the page (namespace) that started it ---- */
  const rawRAF = window.requestAnimationFrame.bind(window), rawCAF = window.cancelAnimationFrame.bind(window);
  window.__wbRawRAF = rawRAF; /* shared modules (ink, distort, project) use this so they never get frozen */
  let owner = '', running = null; const parked = new Map(); /* ns → [{cb, id}] */ const frozen = new Set(); let seq = 0; const map = new Map();
  window.requestAnimationFrame = (cb) => { const ns = running ?? owner, id = ++seq;
    if (frozen.has(ns)) { (parked.get(ns) || parked.set(ns, []).get(ns)).push({ cb, id }); return id; }
    map.set(id, rawRAF((t) => { map.delete(id); const prev = running; running = ns; try { cb(t); } finally { running = prev; } })); return id; };
  window.cancelAnimationFrame = (id) => { const r = map.get(id); if (r != null) { rawCAF(r); map.delete(id); return; } for (const l of parked.values()) { const i = l.findIndex((x) => x.id === id); if (i >= 0) l.splice(i, 1); } };
  const freeze = (ns) => { frozen.add(ns); try { window.gsap && gsap.ticker && ns === 'home' && gsap.ticker.sleep && gsap.ticker.sleep(); } catch (e) {} };
  const thaw = (ns) => { frozen.delete(ns); const l = parked.get(ns) || []; parked.delete(ns); const prev = running; running = ns; l.forEach((x) => window.requestAnimationFrame(x.cb)); running = prev;
    try { window.gsap && gsap.ticker && gsap.ticker.wake && gsap.ticker.wake(); } catch (e) {} };

  const cache = new Map(), kept = new Map(); /* path → {node, ns, y, layers, wfPage} */
  const key = (u) => { const x = new URL(u, location.href); return x.pathname + x.search; };
  const fetchPage = (url) => { const k = key(url); if (!cache.has(k)) cache.set(k, fetch(url, { credentials: 'same-origin' }).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }).catch((e) => { cache.delete(k); throw e; })); return cache.get(k); };
  const nsOf = (c) => (c && c.dataset.wbNamespace) || '';
  const keepable = (c) => c.hasAttribute('data-wb-keep') ? c.getAttribute('data-wb-keep') !== 'false' : /^(home|work)$/.test(nsOf(c));
  const isShared = (el) => el.matches('[data-wb-container],[data-wb-persist],script,style,link,noscript,template') || el.id === 'wb-ink';
  const loaded = () => new Set([...document.scripts].map((s) => s.src).filter(Boolean));
  const loadScript = (s) => new Promise((res) => { const n = document.createElement('script'); [...s.attributes].forEach((a) => n.setAttribute(a.name, a.value)); n.async = false; n.onload = n.onerror = () => res(); document.body.appendChild(n); });
  const reinitWebflow = (wfPage) => { if (wfPage) document.documentElement.setAttribute('data-wf-page', wfPage);
    try { const W = window.Webflow; if (W && W.destroy) { W.destroy(); W.ready && W.ready(); const ix = W.require && W.require('ix2'); ix && ix.init && ix.init(); } } catch (e) { console.warn('[swap] webflow re-init', e); } };
  /* a page that is thrown away (not kept alive) must give its WebGL contexts back: their loops only stop drawing once detached,
     so without this every visited page keeps its GPU memory and phones run out after a few pages (the tab crashes).
     getContext returns the canvas's existing context (null for 2D canvases); losing it frees the GPU side now, three.js then skips rendering. */
  const releaseGL = (root) => { root.querySelectorAll('canvas').forEach((c) => { try { const gl = c.getContext('webgl2') || c.getContext('webgl'); const x = gl && gl.getExtension('WEBGL_lose_context'); if (x && !gl.isContextLost()) x.loseContext(); c.width = c.height = 1; } catch (e) {} }); };
  const leave = (cur) => { const ns = nsOf(cur), url = location.href;
    document.dispatchEvent(new CustomEvent('wb:leave', { detail: { namespace: ns, url } }));
    if (!keepable(cur)) return null;
    const layers = [...document.body.children].filter((el) => !isShared(el) && el.style.display !== 'none');
    layers.forEach((el) => { el.__wbDisp = el.style.display; el.style.display = 'none'; });
    freeze(ns); return { node: cur, ns, y: scrollY, layers, wfPage: document.documentElement.getAttribute('data-wf-page'), title: document.title };
  };
  const swapDOM = async (url, fromKey) => {
    const cur = document.querySelector('[data-wb-container]'); if (!cur) throw new Error('no [data-wb-container]');
    const k = key(url), back = kept.get(k);
    if (back) { /* keep-alive return: same node, same scroll, loops resume */
      const st = leave(cur); if (st) kept.set(fromKey, st);
      cur.replaceWith(back.node); kept.delete(k); document.title = back.title; if (!st) releaseGL(cur);
      back.layers.forEach((el) => { el.style.display = el.__wbDisp || ''; }); owner = back.ns;
      reinitWebflow(back.wfPage); scrollTo(0, back.y); thaw(back.ns);
      try { window.ScrollTrigger && ScrollTrigger.update(); } catch (e) {}
      document.dispatchEvent(new CustomEvent('wb:swap', { detail: { namespace: back.ns, url, fresh: false } })); return;
    }
    const html = await fetchPage(url), doc = new DOMParser().parseFromString(html, 'text/html');
    const next = doc.querySelector('[data-wb-container]'); if (!next) throw new Error('no [data-wb-container] on ' + url);
    const st = leave(cur); if (st) kept.set(fromKey, st);
    document.title = doc.title; const imp = document.importNode(next, true); owner = nsOf(imp);
    cur.replaceWith(imp); scrollTo(0, 0); if (!st) releaseGL(cur);
    /* page-level scripts the new page needs that aren't loaded yet (skip Webflow core + jQuery, already present) */
    const have = loaded(), need = [...doc.querySelectorAll('script[src]')].filter((s) => !next.contains(s) && !have.has(s.src) && !/webflow\.|jquery/i.test(s.src));
    for (const s of need) await loadScript(s);
    imp.querySelectorAll('script').forEach((s) => { const n = document.createElement('script'); [...s.attributes].forEach((a) => n.setAttribute(a.name, a.value)); n.textContent = s.textContent; s.replaceWith(n); });
    reinitWebflow(doc.documentElement.getAttribute('data-wf-page'));
    document.dispatchEvent(new CustomEvent('wb:swap', { detail: { namespace: owner, url, fresh: true } }));
  };
  const frames = (n) => new Promise((r) => { const nx = (f) => (document.hidden ? setTimeout(f, 16) : rawRAF(f)); const f = () => (--n <= 0 ? r() : nx(f)); nx(f); });
  /* hold the reveal until the new page renders smoothly (shader compiles, texture uploads and first layouts happen under the ink) */
  /* idle frame time of THIS device, sampled continuously while nothing is transitioning */
  const idle = []; let idleLast = 0; const idleF = (now) => { if (idleLast && !busy) { idle.push(now - idleLast); if (idle.length > 60) idle.shift(); } idleLast = now; rawRAF(idleF); }; rawRAF(idleF);
  const idleDt = () => { if (idle.length < 10) return 20; const a = idle.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
  const settle = (max = window.WB_SWAP_SETTLE ?? 650) => new Promise((r) => { if (document.hidden) return r(); const lim = Math.max(20, idleDt() * 1.35), t0 = performance.now(); let last = t0, good = 0;
    const f = (now) => { const dt = now - last; last = now; good = dt < lim ? good + 1 : 0; if (good >= 4 || now - t0 > max) r(); else rawRAF(f); }; rawRAF(f); });
  let busy = false, busyT = 0;
  window.wbSwapGo = async (href, x, y, opts) => {
    const url = new URL(href, location.href); if (url.origin !== location.origin) { location.href = href; return; }
    /* an in-page router (Work page: list ↔ project) only handles URLs of its own page; any other page is a real navigation under the ink */
    if ((window.WB_SWAP_ROUTE && url.pathname !== location.pathname) || (!window.WB_SWAP_ROUTE && !document.querySelector('[data-wb-container]'))) { if (window.wbMenu) window.wbMenu(false); if (window.wbInkGo) wbInkGo(href, x, y); else location.href = href; return; }
    if (busy && performance.now() - busyT < 4000) return; busy = true; busyT = performance.now(); const fromKey = key(location.href);
    try {
      if (!window.WB_SWAP_ROUTE) fetchPage(url.href).catch(() => {}); /* fetch while the ink covers */
      if (window.wbInkCover) await wbInkCover(x, y);
      if (window.WB_SWAP_ROUTE && WB_SWAP_ROUTE.accepts && !WB_SWAP_ROUTE.accepts(url)) { location.assign(url.href); return; } /* router can't show it: real navigation under the ink */
      if (!(opts && opts.pop)) history.pushState({ wbSwap: 1 }, '', url.href);
      if (window.WB_SWAP_ROUTE) await window.WB_SWAP_ROUTE(url); else await swapDOM(url.href, fromKey);
      if (document.fonts) await document.fonts.ready; await frames(3); await settle();
      try { window.WB_SWAP_ENTER && WB_SWAP_ENTER(); } catch (e) {} /* page entrance starts with the reveal */
      if (window.wbInkReveal) await wbInkReveal();
    } catch (e) { console.warn('[swap] falling back to a normal load', e); location.href = href; }
    busy = false;
  };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const c0 = document.querySelector('[data-wb-container]'); owner = nsOf(c0);
  if (c0 && window.WB_SWAP_SAME_SITE == null) window.WB_SWAP_SAME_SITE = true; /* homepage ribbon cards → swap instead of reload */
  history.replaceState({ wbSwap: 1 }, '', location.href);
  addEventListener('popstate', (e) => { if (e.state && e.state.wbSwap) wbSwapGo(location.href, innerWidth / 2, innerHeight / 2, { pop: true }); else location.reload(); });
  addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[data-wb-swap], a[data-wb-ink]'); if (!a || (e.defaultPrevented && !a.hasAttribute('data-wb-swap')) || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const u = new URL(a.href, location.href); if (u.origin !== location.origin) return; e.preventDefault(); e.stopImmediatePropagation(); if (window.__wbPlayClick) window.__wbPlayClick(); /* the click sound never sees this click */ wbSwapGo(a.href, e.clientX, e.clientY); }, true);
  addEventListener('mouseover', (e) => { const a = e.target.closest && e.target.closest('a[data-wb-swap]'); if (a && !window.WB_SWAP_ROUTE && !kept.has(key(a.href))) fetchPage(a.href).catch(() => {}); }, { passive: true }); /* prefetch on hover */
})();

;
/* modules22/wb-pages.js */
/* Wubble pages (prototype router): home = hero + infinite work ribbon; about / services / contact are their own "pages".
   In the prototype the pages are windows onto the one scroll timeline (so every existing animation is reused);
   in Webflow they become real pages swapped by wb-swap.js. Navigation uses ?page=about|services|contact (home = no param).
   Menu (Webflow attributes): [data-wb-menu] overlay · [data-wb-menu-open] / [data-wb-menu-close] buttons ·
   [data-wb-menu-item] links (each with one inner element that slides up) · [data-wb-menu-fade] small extras.
   Tune page windows with window.WB_PAGE_RANGES = { about:[start,end], … } in viewport-heights from the about/services section top.
   Menu only (no page windows / scroll takeover): set window.WB_PAGES_MENU_ONLY = true before this script. */
(() => {
  if (window.__wbPagesInit) return; window.__wbPagesInit = 1;
  const MO = !!window.WB_PAGES_MENU_ONLY; /* menu only: no page windows, no wheel/scroll takeover (pages with their own scroll story) */
  const PAGES = ['home', 'about', 'services', 'contact'];
  const RANGE = Object.assign({ about: [0.7, 2.9], services: [4.3, 6.1], contact: [6.6, 99] }, window.WB_PAGE_RANGES || {});
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const q = (s) => document.querySelector(s), app = () => window.__wbApp;
  const vh = () => window.__svh || innerHeight;
  const pageOf = (u) => { const x = new URL(u, location.href); if (/about/i.test(decodeURIComponent(x.pathname.split('/').pop()))) return 'about'; if (x.href === location.href && window.WB_FORCE_PAGE) return window.WB_FORCE_PAGE; const p = x.searchParams.get('page'); return PAGES.includes(p) ? p : 'home'; };
  const isPageUrl = (u) => { const x = new URL(u, location.href); return x.pathname === location.pathname && !x.searchParams.has('p'); };
  const jump = (y) => { scrollTo(0, y); const L = window.__sliderLenis; if (L) L.scrollTo(y, { immediate: true, force: true }); };
  const els = () => ({ cta: q('[data-screen-label="Hero"]'), reach: q('[data-screen-label="Reach out"]'), sp: q('[data-footer-spacer]') });
  let page = 'home';
  const maxY = () => document.documentElement.scrollHeight - innerHeight;
  /* home: the scroll position where Work is fully in and pinned; the page never scrolls past it */
  const pinY = () => { const w = q('[data-screen-label="Work"]'); if (!w) return Infinity; const FX = Math.max(0, ((window.__wbApp && window.__wbApp.props && window.__wbApp.props.astroFlight) ?? 120)) / 100, heroDone = vh() * (2.4 + FX) + 4; /* hero exit + ribbon intro must have fully played */
    return Math.min(maxY(), Math.max(heroDone, w.getBoundingClientRect().top + scrollY + vh() * 0.45)); };
  let ribAcc = 0; /* how far the ribbon was driven past the pin; scrolling back up first unwinds it, then the page scrolls up to the hero */
  const homeInput = (d, e) => { const a = app(); if (page !== 'home' || !a || !a._ribNudge || a.state.page) return false; const L = window.__sliderLenis, py = pinY(), y = Math.max(scrollY, L ? L.targetScroll : 0);
    if (y < py - 2) return false; /* still travelling into the pin: normal (smooth) page scroll, clamped softly below */
    if (d < 0 && ribAcc <= 0) { ribAcc = 0; return false; }
    ribAcc = Math.max(0, ribAcc + d); a._ribNudge(d * (window.WB_RIBBON_WHEEL || 0.0075)); return true; };
  const pinClamp = () => { RAF(pinClamp); if (page !== 'home' || (app() && app().scrollLocked)) return; const py = pinY(), L = window.__sliderLenis;
    if (L) { if (L.targetScroll > py) L.targetScroll = py; /* ease into the pin, never snap */ if (L.animatedScroll > py + 1) jump(py); } else if (scrollY > py + 1) scrollTo(0, py); };
  if (!MO) RAF(pinClamp);
  const atEnd = () => { const L = window.__sliderLenis, m = maxY(); return scrollY >= m - 24 || (L && L.targetScroll >= m - 2); };
  const bounds = () => { if (page === 'home') return null; const c = els().cta; if (!c) return null; const t = c.getBoundingClientRect().top + scrollY, r = RANGE[page], m = maxY();
    return [Math.min(m, t + r[0] * vh()), Math.min(m, t + r[1] * vh())]; };
  /* home: everything after Work leaves the flow (parked off-screen, so its scroll maths reads "not reached yet") */
  const park = (e, on) => { if (!e) return; if (on) { if (!e.__wbPark) e.__wbPark = { p: e.style.position, t: e.style.top, mt: e.style.marginTop, v: e.style.visibility };
      Object.assign(e.style, { position: 'fixed', top: '300vh', left: '0', right: '0', marginTop: '0', visibility: 'hidden' }); }
    else if (e.__wbPark) { const o = e.__wbPark; Object.assign(e.style, { position: o.p, top: o.t, left: '', right: '', marginTop: o.mt, visibility: o.v }); e.__wbPark = null; } };
  const apply = (p) => { page = p; window.__wbPage = p; document.documentElement.setAttribute('data-wb-page', p);
    const { cta, reach, sp } = els(); [cta, reach, sp].forEach((e) => park(e, p === 'home'));
    const a = app(); if (a && a._sizeWork) a._sizeWork();
    document.querySelectorAll('[data-wb-menu-item]').forEach((m) => m.toggleAttribute('data-active', pageOf(m.href) === p)); };
  const snapScenes = (ms) => { window.__wbTwSnap = performance.now() + ms; };
  /* entrance: land a little before the page under the ink, then glide into it while the ink opens, so the page's own scroll animations play in */
  const GLIDE = Object.assign({ home: 0, about: 0.5, services: 0.45, contact: 0.5 }, window.WB_PAGE_GLIDE || {});
  let glide = null;
  const goTo = (p) => { apply(p); snapScenes(400); glide = null;
    if (p === 'home') { jump(0); return; } const b = bounds(); if (!b) return; const from = Math.max(0, b[0] - GLIDE[p] * vh()); jump(from); glide = { from, to: b[0], armed: true }; };
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  window.WB_SWAP_ENTER = () => { const g = glide; if (!g || !g.armed) return; g.armed = false; const t0 = performance.now(), D = window.WB_PAGE_GLIDE_MS || 1300;
    let el = 0, last = 0; const f = (now) => { if (glide !== g) return; el += last ? Math.min(33, now - last) : 0; last = now; const t = Math.min(1, el / D); jump(g.from + (g.to - g.from) * ease(t)); if (t < 1) RAF(f); else glide = null; }; RAF(f); }; /* stalls slow the glide instead of skipping it */
  /* pre-run the glide under the ink so every scroll-triggered init (CRT, services scrub, layouts) happens hidden */
  const tick = (f) => (document.hidden ? setTimeout(f, 16) : RAF(f)); /* hidden tab: timers, so a swap never hangs */
  const frames = (n) => new Promise((r) => { const f = () => (--n <= 0 ? r() : tick(f)); tick(f); });
  /* time parked on the landing spot under the ink, so polled/delayed arrival inits (terminal start, monitor, typing) fire hidden */
  const HOLD = Object.assign({ about: 300, services: 150, contact: 150 }, window.WB_PAGE_HOLD || {});
  const prerun = async () => { const g = glide; if (!g) return; for (let i = 1; i <= 8; i++) { jump(g.from + (g.to - g.from) * i / 8); snapScenes(120); await frames(2); } await frames(6); await new Promise((r) => setTimeout(r, HOLD[page] || 0)); jump(g.from); snapScenes(200); await frames(4); };
  /* keep each page inside its window */
  const clamp = () => { RAF(clamp); const b = bounds(); if (!b || glide || (app() && app().scrollLocked)) return; const y = scrollY; if (y < b[0] - 1) jump(b[0]); else if (y > b[1] + 1) jump(b[1]); };
  if (!MO) RAF(clamp);
  addEventListener('wheel', (e) => { if (MO) return; const b = bounds(), d = e.deltaY;
    if (b && glide) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (b) { if ((d < 0 && scrollY <= b[0] + 2) || (d > 0 && scrollY >= b[1] - 2)) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
    /* home: at the end of the page the ribbon keeps going forever */
    const dd = e.deltaMode === 1 ? d * 33 : d; if (homeInput(dd, e)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, { capture: true, passive: false });
  let ty = null;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { const a = app(); if (MO || ty == null || page !== 'home' || !a || !a._ribNudge) return; const y = e.touches[0].clientY, d = ty - y; ty = y;
    if (homeInput(d * 1.6, e) && e.cancelable) e.preventDefault(); }, { passive: false });
  /* router for wb-swap.js: ink covers → page changes → ink opens */
  const route = async (url) => { /* kept for single-document use; pages now navigate for real (like work → project) */
    if (!isPageUrl(url.href)) { location.href = url.href; await new Promise(() => {}); }
    menu(false, true); goTo(pageOf(url.href));
    await prerun();
  };
  /* full-screen menu */
  let open = false, tl = null;
  /* hover: each menu label gets a per-letter roll (the visible letters slide up, an identical copy rises from below) */
  const roll = (M) => { const G = window.gsap; if (!G) return;
    M.querySelectorAll('[data-wb-menu-item]').forEach((a) => { const s = a.firstElementChild; if (!s || s.__roll) return; s.__roll = 1;
      const txt = s.textContent; a.setAttribute('aria-label', txt.trim());
      const row = (hidden) => { const r = document.createElement('span'); r.setAttribute('aria-hidden', 'true'); r.style.display = 'block'; r.style.whiteSpace = 'nowrap';
        if (hidden) { r.style.position = 'absolute'; r.style.left = '0'; r.style.top = '0'; }
        Array.from(txt).forEach((ch) => { const c = document.createElement('span'); c.style.display = 'inline-block'; c.textContent = ch === ' ' ? ' ' : ch; r.appendChild(c); }); return r; };
      const A = row(false), B = row(true); s.textContent = ''; s.style.position = 'relative'; s.style.display = 'block'; /* block: Safari places the copy's top:0 against an inline wrapper one line too low, so it never rolled into view */ s.append(A, B);
      /* the copy waits 125% below (glyphs are taller than the tight line-height, so 100% would peek out of the mask) */
      const la = A.children, lb = B.children; G.set(lb, { yPercent: 125 });
      const go = (up) => { G.to(la, { yPercent: up ? -125 : 0, duration: 0.75, stagger: 0.018, ease: 'expo.out', overwrite: true }); G.to(lb, { yPercent: up ? 0 : 125, duration: 0.75, stagger: 0.018, ease: 'expo.out', overwrite: true }); };
      a.addEventListener('mouseenter', () => go(true)); a.addEventListener('mouseleave', () => go(false)); a.addEventListener('focus', () => go(true)); a.addEventListener('blur', () => go(false)); }); };
  const menu = (on, instant) => { const M = q('[data-wb-menu]'); if (!M || (on === open && !instant)) return; open = on; roll(M);
    const items = M.querySelectorAll('[data-wb-menu-item] > *'), fades = M.querySelectorAll('[data-wb-menu-fade]'), G = window.gsap;
    if (tl) tl.kill(); M.setAttribute('aria-hidden', on ? 'false' : 'true');
    M.style.pointerEvents = on ? '' : 'none'; /* a closing menu stops catching clicks at once, so a quick re-click reaches the open button under it */
    const L = window.__sliderLenis; if (L) on ? L.stop() : (!(app() && app().scrollLocked) && L.start());
    if (G && instant) { G.set(M, { visibility: on ? 'visible' : 'hidden', clipPath: on ? 'inset(0% 0 0% 0)' : 'inset(0% 0 100% 0)' }); G.set(items, { yPercent: on ? 0 : 110, y: 0 }); G.set(fades, { opacity: on ? 1 : 0, y: 0 }); return; }
    if (!G || instant) { M.style.visibility = on ? 'visible' : 'hidden'; M.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)'; items.forEach((i) => { i.style.transform = on ? 'none' : 'translate3d(0,110%,0)'; }); fades.forEach((f) => { f.style.opacity = on ? '1' : '0'; }); return; }
    tl = G.timeline();
    if (on) { M.style.visibility = 'visible';
      /* slow, soft reveal: the panel wipes down, then each label rises out of its mask with a slight tilt that settles */
      tl.fromTo(M, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.0, ease: 'expo.inOut' })
        .add(() => { /* the site-wide pixel reveal (wb-pixeltext) when loaded; otherwise the labels rise out of their masks */
          if (window.wbPixelPlay) { G.set(items, { yPercent: 0, rotate: 0, y: 0 }); M.querySelectorAll('[data-wb-menu-item]').forEach((a, i) => { a.setAttribute('data-pixel-trigger', 'manual'); window.wbPixelPlay(a, i * 0.09); }); }
          else G.fromTo(items, { yPercent: 120, rotate: 5, y: 0, transformOrigin: '0% 100%' }, { yPercent: 0, rotate: 0, y: 0, duration: 1.4, stagger: 0.09, ease: 'expo.out' }); }, 0.45)
        .fromTo(fades, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.0, stagger: 0.06, ease: 'expo.out' }, 0.8);
    } else {
      const done = () => { if (!open) { M.style.visibility = 'hidden'; M.style.clipPath = 'inset(0 0 100% 0)'; } };
      tl.to(items, { yPercent: -120, rotate: -3, duration: 0.6, stagger: 0.04, ease: 'expo.in' }).to(fades, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
        .fromTo(M, { clipPath: 'inset(0% 0 0% 0)' }, { clipPath: 'inset(0% 0 100% 0)', duration: 0.85, ease: 'expo.inOut', onComplete: done }, 0.35);
      setTimeout(done, 1300);
    } };
  window.wbMenu = menu;
  menu(false, true); /* closed from the very first frame on every page, not only once the homepage app has booted */
  addEventListener('pageshow', () => { open = true; menu(false, true); }); /* every (re)show of a page starts with the menu shut */
  addEventListener('pagehide', () => { open = true; menu(false, true); }); /* …and it's shut before the browser stores the page for back/forward */
  /* a menu link starts closing the menu at once, the ink covers on top of it */
  addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('[data-wb-menu] a[href]'); if (a && open) setTimeout(() => menu(false), 0); }, true);
  addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-wb-menu-open],[data-wb-menu-close]'); if (!t) return; e.preventDefault(); menu(t.hasAttribute('data-wb-menu-open') ? !open : false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) menu(false); });
  /* first load: deep link (?page=about) waits for the preloader to release scroll */
  const boot = () => { const a = app(); if (!a || !els().cta) { setTimeout(boot, 120); return; }
    const p = pageOf(location.href); apply(p); menu(false, true);
    /* every page is a real navigation now: everything boots under the arriving ink, which only opens once the page is warm */
    const wait = async () => { if (app().scrollLocked) { setTimeout(wait, 120); return; }
      if (p !== 'home') { goTo(p); await prerun(); }
      await frames(8); const V = document.querySelector('[data-wb-veil]'); if (V) { V.style.transition = 'opacity 0.6s ease'; V.style.opacity = '0'; setTimeout(() => V.remove(), 700); } if (window.__wbInkReadyRes) window.__wbInkReadyRes(); if (p !== 'home') window.WB_SWAP_ENTER(); };
    wait(); };
  if (!MO) boot();
})();

/* Smooth scroll (Lenis) on every page with a mouse. The homepage (r14 base, [data-w="root"]) and project pages (wb-project)
   start their own Lenis; every other page loaded the library but never started it, so it scrolled natively.
   Touch devices keep native scrolling (it already feels right there). */
(() => {
  if (window.__wbPageLenisBoot) return; window.__wbPageLenisBoot = 1;
  let tries = 0;
  const go = () => {
    if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.querySelector('[data-w="root"], [data-wb-project]') || window.__sliderLenis || window.__wbLenis) return;
    if (!window.Lenis) { if (++tries < 40) setTimeout(go, 150); return; }
    const L = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.8 });
    window.__wbPageLenis = L;
    const st = document.createElement('style'); st.textContent = 'html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-stopped{overflow:hidden}';
    document.head.appendChild(st);
    const raf = (t) => { L.raf(t); (window.__wbRawRAF || requestAnimationFrame)(raf); }; (window.__wbRawRAF || requestAnimationFrame)(raf);
  };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', go) : go();
})();

;
/* modules22/wb-grainient.js */
/* Wubble Grainient: React Bits <Grainient /> (JS+CSS variant) run without React.
   Slow grainy colour gradient that you can stir with the cursor; click makes a swirl.
   Webflow: an empty div with [data-wb-grainient], sized/positioned by Webflow. Every prop is a kebab-case data attribute,
   e.g. data-speed="2". Lists use commas: data-colors="#111,#222". Generated from the React Bits source with a tiny
   React shim below (hooks run once at mount), so the component code is unchanged and can be refreshed from upstream. */
(() => {
  let queue = [];
  const useRef = (v) => ({ current: queue.length ? queue.shift() : v }); // first two refs = container, canvas
  const useEffect = (fn) => { fn(); };
  const useState = (v) => [v, () => {}]; // shortcut: no WebGL context-restore remount; reload restores it

const MAX_COLORS = 8;
const MAX_STIRS = 24;
const MAX_TWIRLS = 4;
const STIR_LIFE = 1.3;
const STIR_STEP = 0.06;
const TWIRL_LIFE = 2.6;
const INTRO_SECONDS = 1.6;
const DEFAULT_COLORS = ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'];
const TYPES = { linear: 0, radial: 1 };
const LIFT = 0.2;

const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FIELD = `#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uTime;
uniform vec3 uRamp[8];
uniform int uCount;
uniform int uType;
uniform vec2 uDir;
uniform float uExtent;
uniform float uBands;
uniform float uSoftness;
uniform float uFlow;
uniform float uScale;
uniform float uSilk;
uniform vec4 uStir[24];
uniform float uStirWeight[24];
uniform vec4 uTwirl[4];
uniform vec2 uSeed;
uniform float uContrast;
uniform float uSaturation;
uniform float uSettle;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 drift(vec2 p, float t) {
  vec2 w1 = vec2(
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))
  );
  vec2 w2 = vec2(
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)
  );
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;
}

vec2 warp(vec2 p) {
  vec2 q = p / uScale;
  if (uType == 1) {
    float turn = uTime * 0.35;
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;
  } else {
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;
  }
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;
}

float coord(vec2 p) {
  vec2 w = warp(p);
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;
}

vec3 labToRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  for (int i = 0; i < 24; i++) {
    float w = uStirWeight[i];
    if (w <= 0.0) continue;
    vec2 d = p - uStir[i].xy;
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);
  }
  for (int i = 0; i < 4; i++) {
    float angle = uTwirl[i].z;
    if (angle == 0.0) continue;
    vec2 d = p - uTwirl[i].xy;
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));
    float c = cos(a);
    float s = sin(a);
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;
  }
  float raw = coord(p);
  float s = raw;
  if (uBands > 1.0) {
    s *= uBands;
    float cycle = floor(s);
    s = fract(s);
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;
  }
  s = clamp(s, 0.0, 1.0);
  float scaled = s * float(uCount - 1);
  int index = int(min(floor(scaled), float(uCount - 2)));
  float f = scaled - float(index);
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);
  vec3 from = uRamp[0];
  vec3 to = uRamp[1];
  for (int i = 0; i < 7; i++) {
    if (i == index) {
      from = uRamp[i];
      to = uRamp[i + 1];
    }
  }
  vec3 lab = mix(from, to, shaped);
  if (uSilk > 0.0) {
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;
    vec3 normal = normalize(vec3(-slope, 1.0));
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));
    float diffuse = dot(normal, light) - light.z;
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);
  }
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));
  lab.x = (lab.x - 0.55) * uContrast + 0.55;
  lab.yz *= uSaturation;
  outColor = vec4(encode(labToRgb(lab)), 1.0);
}`;

const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform float uGrain;
uniform float uGrainSize;
uniform float uFrame;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float clump(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec3 color = texture(uField, vUv).rgb;
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toLinear = value => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

const toLab = ([r, g, b]) => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl, fragmentSource) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    const name = info.name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
};

const Grainient = ({
  colors = DEFAULT_COLORS,
  type = 'linear',
  angle = 55,
  bands = 1,
  speed = 1,
  flow = 0.8,
  scale = 1,
  softness = 1,
  silk = 0.35,
  grainAmount = 0.08,
  grainSize = 1.2,
  grainAnimated = true,
  contrast = 1,
  saturation = 1,
  variation = 0,
  interactive = true,
  stir = 1,
  clickSwirl = true,
  intro = true,
  lightMode = false,
  dpr,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const wakeRef = useRef(null);
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);
  const settings = {
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],
    type: TYPES[type] ?? 0,
    angle,
    bands: clamp(bands, 1, 8),
    speed: Math.max(0, speed),
    flow: clamp(flow, 0, 3),
    scale: clamp(scale, 0.25, 3),
    softness: clamp(softness, 0, 1),
    silk: clamp(silk, 0, 1),
    grainAmount: clamp(grainAmount, 0, 0.5),
    grainSize: clamp(grainSize, 0.5, 4),
    grainAnimated,
    contrast: clamp(contrast, 0.2, 2),
    saturation: clamp(saturation, 0, 2),
    variation: Math.max(0, variation),
    interactive,
    stir: clamp(stir, 0, 2),
    clickSwirl,
    intro,
    lightMode,
    dpr
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!container || !canvas || !gl) return undefined;

    const field = link(gl, FIELD);
    const composite = link(gl, COMPOSITE);
    if (!field || !composite) return undefined;
    const fu = field.uniforms;
    const cu = composite.uniforms;
    const vao = gl.createVertexArray();
    const target = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const buffer = gl.createFramebuffer();
    const fieldSize = { width: 0, height: 0 };

    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const colorCache = new Map();
    const parse = value => {
      const key = String(value);
      const cached = colorCache.get(key);
      if (cached) return cached;
      let rgb = [0, 0, 0];
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = '#000000';
        probe.fillStyle = key;
        probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      colorCache.set(key, rgb);
      return rgb;
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const view = { width: 1, height: 1, ratio: 1 };
    const ramp = new Float32Array(MAX_COLORS * 3);
    const stirs = new Float32Array(MAX_STIRS * 4);
    const stirWeights = new Float32Array(MAX_STIRS);
    const twirls = new Float32Array(MAX_TWIRLS * 4);
    const trail = [];
    const spins = [];
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, inside: false, fresh: true };
    let paletteKey = '';
    let time = 0;
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;
    let frameSeed = 0;
    let grainClock = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const syncPalette = () => {
      const s = settingsRef.current;
      const key = `${s.colors.join(',')}|${s.lightMode}`;
      if (key === paletteKey) return;
      paletteKey = key;
      const labs = s.colors.map(color => toLab(parse(color)));
      if (!s.lightMode) {
        labs.forEach((lab, i) => ramp.set(lab, i * 3));
      } else {
        const blank = labs.map(([L]) => Math.abs(L - labs[0][0]) < 0.1);
        const tints = labs.filter((_, i) => !blank[i]).reverse();
        labs.forEach((_, i) => {
          const [L, a, b] = blank[i] ? [1, 0, 0] : tints.shift();
          ramp.set([L + (1 - L) * LIFT, a * (1 - LIFT), b * (1 - LIFT)], i * 3);
        });
      }
    };

    const draw = () => {
      const s = settingsRef.current;
      const aspect = view.width / view.height;
      syncPalette();
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.viewport(0, 0, fieldSize.width, fieldSize.height);
      gl.useProgram(field.program);
      gl.uniform1f(fu.uAspect, aspect);
      gl.uniform1f(fu.uTime, time);
      gl.uniform3fv(fu.uRamp, ramp);
      gl.uniform1i(fu.uCount, s.colors.length);
      const radians = (s.angle * Math.PI) / 180;
      gl.uniform1i(fu.uType, s.type);
      gl.uniform2f(fu.uDir, Math.sin(radians), Math.cos(radians));
      gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians)));
      gl.uniform1f(fu.uBands, s.bands);
      gl.uniform1f(fu.uSoftness, s.softness);
      gl.uniform1f(fu.uFlow, s.flow);
      gl.uniform1f(fu.uScale, s.scale);
      gl.uniform1f(fu.uSilk, s.silk);
      gl.uniform4fv(fu.uStir, stirs);
      gl.uniform1fv(fu.uStirWeight, stirWeights);
      gl.uniform4fv(fu.uTwirl, twirls);
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);
      gl.uniform1f(fu.uContrast, s.contrast);
      gl.uniform1f(fu.uSaturation, s.saturation);
      gl.uniform1f(fu.uSettle, introClock * introClock * (3 - 2 * introClock));
      gl.uniform1f(fu.uReveal, introClock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(composite.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target);
      gl.uniform1i(cu.uField, 0);
      gl.uniform1f(cu.uGrain, s.grainAmount);
      gl.uniform1f(cu.uGrainSize, s.grainSize * view.ratio);
      gl.uniform1f(cu.uFrame, frameSeed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const s = settingsRef.current;
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1 : 2); /* phones: a soft gradient needs no retina buffer */
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));
      const width = Math.max(1, Math.round(canvas.width / 2));
      const height = Math.max(1, Math.round(canvas.height / 2));
      if (width !== fieldSize.width || height !== fieldSize.height) {
        fieldSize.width = width;
        fieldSize.height = height;
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      draw();
      wake();
    };

    const updateTouches = (dt, aspect) => {
      const s = settingsRef.current;
      const follow = 1 - Math.exp(-dt / 0.06);
      const px = pointer.sx;
      const py = pointer.sy;
      pointer.sx += (pointer.x - pointer.sx) * follow;
      pointer.sy += (pointer.y - pointer.sy) * follow;
      const vx = ((pointer.sx - px) / dt) * aspect;
      const vy = (pointer.sy - py) / dt;
      pointer.vx = vx;
      const head = trail[0];
      trail.forEach(sample => {
        if (sample.done) sample.age += dt;
      });
      if (s.interactive && pointer.inside && Math.hypot(vx, vy) > 0.02 && !reduce) {
        if (!head || head.done) {
          trail.unshift({ x: 0, y: 0, vx: 0, vy: 0, age: 0, grow: 0, done: false });
          if (trail.length > MAX_STIRS) trail.pop();
        }
        const live = trail[0];
        live.x = (pointer.sx - 0.5) * aspect;
        live.y = pointer.sy - 0.5;
        live.vx = vx;
        live.vy = vy;
        live.grow = Math.min(1, live.grow + dt / STIR_STEP);
        live.done = live.grow >= 1;
      } else if (head) {
        head.done = true;
      }
      while (trail.length && trail[trail.length - 1].age > STIR_LIFE) trail.pop();
      for (let i = 0; i < MAX_STIRS; i++) {
        const sample = trail[i];
        if (!sample) {
          stirWeights[i] = 0;
          continue;
        }
        const fade = 1 - sample.age / STIR_LIFE;
        const cap = Math.min(1, 2.2 / Math.max(Math.hypot(sample.vx, sample.vy), 0.001));
        stirs.set([sample.x, sample.y, sample.vx * cap, sample.vy * cap], i * 4);
        stirWeights[i] = fade * fade * sample.grow * s.stir * 0.05;
      }
      spins.forEach(spin => {
        spin.age += dt;
      });
      while (spins.length && spins[spins.length - 1].age > TWIRL_LIFE) spins.pop();
      for (let i = 0; i < MAX_TWIRLS; i++) {
        const spin = spins[i];
        if (!spin) {
          twirls[i * 4 + 2] = 0;
          continue;
        }
        const k = spin.age / TWIRL_LIFE;
        const envelope = Math.min(1, spin.age / 0.18) * (1 - k) * (1 - k);
        twirls.set([spin.x, spin.y, spin.direction * 2.4 * envelope, 0.16 + 0.1 * Math.min(1, spin.age / 0.5)], i * 4);
      }
    };

    const frame = now => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;
      last = now;
      if (!reduce) time += dt * s.speed * 0.16;
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);
      grainClock += dt;
      if (s.grainAnimated && !reduce && grainClock > 1 / 24) {
        grainClock = 0;
        frameSeed = (frameSeed + 1) % 97;
      }
      updateTouches(dt, view.width / view.height);
      draw();
      const busy =
        (!reduce && (s.speed > 0 || s.grainAnimated)) || introClock < 1 || trail.length > 0 || spins.length > 0;
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    function wake() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const locate = event => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      pointer.x = x;
      pointer.y = y;
      if (pointer.fresh || !pointer.inside) {
        pointer.sx = x;
        pointer.sy = y;
        pointer.fresh = false;
      }
    };

    const onPointerMove = event => {
      locate(event);
      if (pointer.inside || trail.length) wake();
    };

    const onPointerDown = event => {
      locate(event);
      const s = settingsRef.current;
      if (!pointer.inside || !s.clickSwirl || reduce) return;
      spins.unshift({
        x: (pointer.x - 0.5) * (view.width / view.height),
        y: pointer.y - 0.5,
        age: 0,
        direction: pointer.vx < 0 ? 1 : -1
      });
      if (spins.length > MAX_TWIRLS) spins.pop();
      wake();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    wakeRef.current = wake;

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteTexture(target);
      gl.deleteFramebuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(field.program);
      gl.deleteProgram(composite.program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

};
  const parse = (v) => v === 'true' ? true : v === 'false' ? false : v !== '' && !isNaN(v) ? +v : v.includes(',') ? v.split(',').map((x) => x.trim()) : v;
  const mount = (el) => {
    if (el.__wb) return; el.__wb = 1;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;';
    el.appendChild(canvas);
    const props = {};
    for (const k in el.dataset) if (k !== 'wbGrainient') props[k] = parse(el.dataset[k]);
    if (typeof props.colors === 'string') props.colors = [props.colors];
    queue = [el, canvas];
    Grainient(props);
  };
  const scan = () => document.querySelectorAll('[data-wb-grainient]').forEach((el) => (window.WB_NEAR ? window.WB_NEAR(el, () => mount(el)) : mount(el))); /* starts once near the screen (site head) */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();

;
/* modules22/wb-workhelix.js */
/* Wubble /work — CMS collection page: project cards on an infinite helix around the astronaut.
   Webflow owns the markup; this only adds behaviour via data attributes:
     [data-wb-work]                     page root (full-screen)
     [data-wb-work-stage]               element the WebGL canvas is mounted in
     [data-wb-work-item]                one per CMS item (Collection List item) with
        data-title / data-type / data-cat / data-href / data-bg / data-ink / data-mark, and an <img data-cover> (optional)
     [data-wb-work-filter="All|<cat>"]  filter links;  [data-wb-work-search]  text input
     [data-wb-work-prev] / [data-wb-work-next] / [data-wb-work-current]   pager
   Scroll / swipe / arrow keys spin the helix forever; the astronaut in the centre turns with it. */
(() => {
  if (window.__wbWork) return; window.__wbWork = 1;
  const B = 'https://esm.sh/three@0.186.1', /* 0.170: glass dispersion */ E = B + '/examples/jsm/';
  const wait = () => new Promise((r) => { const f = () => (document.querySelector('[data-wb-work-stage]') ? r() : setTimeout(f, 60)); f(); });
  /* phones, homepage: the helix only shows ~5 screens down, so its 3D setup waits for the first touch/scroll instead of loading with the page (keeps the load light) */
  const firstTouch = () => (matchMedia('(pointer: coarse)').matches && document.querySelector('.home_page-wrapper')) ? new Promise((r) => { const go = () => { ['touchstart', 'scroll', 'pointerdown', 'keydown'].forEach((e) => removeEventListener(e, go, true)); r(); }; ['touchstart', 'scroll', 'pointerdown', 'keydown'].forEach((e) => addEventListener(e, go, { capture: true, passive: true })); if (scrollY > 0) go(); }) : Promise.resolve();
  const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  /* card art: identical to the homepage ribbon covers (wb-ribbon drawCover, noTitle) */
  const cardTex = (T, it, i) => new Promise((res) => {
    const w = 1600, h = Math.round(1600 * 2.1 / 3.4), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d');
    const paint = (img) => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = it.bg || '#1b1a17'; ctx.fillRect(0, 0, w, h);
      if (img) { const mw = img.naturalWidth || img.width, mh = img.naturalHeight || img.height, s = Math.max(w / mw, h / mh); ctx.drawImage(img, (w - mw * s) / 2, (h - mh * s) / 2, mw * s, mh * s); }
      else { const words = (it.mark || it.title || '').split(' '), L = i % 3; ctx.fillStyle = it.ink;
        if (L === 0) { ctx.font = '700 250px Switzer'; words.forEach((wd, k) => ctx.fillText(wd, 64, 330 + k * 225)); ctx.fillStyle = it.accent; ctx.fillRect(w - 520, 140, 420, 520); ctx.fillStyle = it.bg; for (let k = 0; k < 9; k++) ctx.fillRect(w - 520, 170 + k * 56, 420, 10); }
        else if (L === 1) { ctx.fillStyle = it.accent; ctx.beginPath(); ctx.arc(w * 0.66, h * 0.44, 300, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = it.ink; ctx.font = '700 300px Switzer'; ctx.fillText(words[0], 64, 360); if (words[1]) ctx.fillText(words[1], 64, 640); }
        else { ctx.font = '700 220px Switzer'; ctx.fillText(words.join(''), 64, 300); const cols = 4, gw = (w - 128 - 3 * 20) / cols;
          for (let k = 0; k < cols; k++) { const x = 64 + k * (gw + 20); ctx.fillStyle = k === 1 ? it.accent : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, 360, gw, 380); ctx.strokeStyle = it.ink; ctx.globalAlpha = 0.35; ctx.lineWidth = 2; ctx.strokeRect(x + 1, 361, gw - 2, 378); ctx.globalAlpha = 1; } } }
      const t = new T.CanvasTexture(cv); t.anisotropy = 8; res(t); };
    if (it.cover) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => paint(im); im.onerror = () => paint(null); im.src = it.cover; } else paint(null);
  });
  /* card shader: the homepage ribbon look — rounded SDF corners, liquid hover ripple, velocity RGB split, face shading + sheen, distance dim; the plane bends around the helix cylinder */
  const VS = `uniform float uR; uniform float uVel; varying vec2 vUv; varying float vFace;
    void main(){ vUv = uv; vec3 p = position; float th = p.x / uR; p.x = sin(th) * uR; p.z = (cos(th) - 1.0) * uR; 
      vec4 wp = modelMatrix * vec4(p, 1.0); vec3 n = normalize(mat3(modelMatrix) * vec3(sin(th), 0.0, cos(th))); vFace = dot(n, normalize(cameraPosition - wp.xyz));
      gl_Position = projectionMatrix * viewMatrix * wp; }`;
  const FS = `uniform sampler2D uTex; uniform vec2 uSize; uniform float uRadius, uVel, uHover, uTime, uDim, uOp; uniform vec2 uMouse; varying vec2 vUv; varying float vFace;
    float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    void main(){ vec2 p = (vUv - 0.5) * uSize; float d = sdRound(p, uSize * 0.5, uRadius), aa = fwidth(d) * 1.2, a = 1.0 - smoothstep(-aa, aa, d);
      vec2 asp = vec2(uSize.x / uSize.y, 1.0), md = (vUv - uMouse) * asp; float dist = length(md); vec2 dir = md / max(dist, 1e-4) / asp;
      float fall = smoothstep(0.5, 0.0, dist) * uHover; vec2 uv = (vUv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
      uv -= dir * sin(dist * 30.0 - uTime * 6.0) * 0.010 * fall; uv -= dir * 0.035 * fall * (1.0 - dist * 2.0);
      vec2 sh = vec2(uVel * 0.006, 0.0) + dir * 0.012 * fall;
      vec3 col = vec3(texture2D(uTex, uv + sh).r, texture2D(uTex, uv).g, texture2D(uTex, uv - sh).b); col += fall * 0.06;
      float face = gl_FrontFacing ? clamp(vFace, 0.0, 1.0) : 0.0; vec3 s = col * (0.5 + 0.5 * face);
      float edgeIn = smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x); s *= mix(0.72, 1.0, edgeIn); s *= mix(0.86, 1.0, smoothstep(0.0, 0.35, vUv.y));
      float sheen = exp(-pow((vUv.x - 0.5) * 3.2, 2.0)) * (0.6 + 0.4 * face); s += vec3(1.0, 0.98, 0.95) * sheen * 0.045 * smoothstep(0.2, 1.0, vUv.y);
      float ba = 1.0; if (!gl_FrontFacing) { s = col * 0.16 + vec3(0.012); ba = 0.42; } /* back of the ribbon: dim mirrored cover, see-through */
      s *= mix(0.2, 1.0, 1.0 - uDim); float al = a * uOp * ba, hz = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); if (al < 0.98 && al <= hz) discard; gl_FragColor = vec4(s, 1.0); } /* opaque + dithered fade: sorts correctly with the glass astronaut and gets refracted by it */`;
  const boot = async () => {
    await wait(); await firstTouch(); try { for (let k = 0; k < 40 && !document.fonts.check('700 200px Switzer'); k++) { try { await document.fonts.load('700 200px Switzer'); } catch (e) {} if (!document.fonts.check('700 200px Switzer')) await new Promise((r) => setTimeout(r, 100)); } } catch (e) {}
    const root = document.querySelector('[data-wb-work]') || document.body, stage = document.querySelector('[data-wb-work-stage]');
    const itemEls = document.querySelectorAll('[data-wb-work-item]').length ? document.querySelectorAll('[data-wb-work-item]') : document.querySelectorAll('[data-wubble="project"]');
    const all = [...itemEls].map((el) => ({ el, title: el.dataset.title || el.textContent.trim(), type: el.dataset.type || el.dataset.services || '', cat: (el.dataset.cat || '').toLowerCase(), href: el.dataset.href || el.getAttribute('href') || (el.dataset.slug ? (window.WB_PROJECT_BASE || '/work/') + el.dataset.slug : ''), bg: el.dataset.bg, ink: el.dataset.ink, accent: el.dataset.accent || el.dataset.ink, mark: el.dataset.mark, cover: (el.querySelector('img[data-cover], img[data-wubble="cover"]') || {}).src || el.dataset.cover || '' }));
    /* data-wb-work-scrub (homepage): the page scroll through the pinned section turns the helix; no wheel/touch/key capture */
    const SCRUB = root.hasAttribute('data-wb-work-scrub');
    if (!all.length) return console.warn('[work] no [data-wb-work-item] found');
    const [T, GL, MO] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'libs/meshopt_decoder.module.js')]);
    const r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: SCRUB && !matchMedia('(pointer: coarse)').matches /* homepage: the astronaut's glass copies this frame */ }); r.setPixelRatio(Math.min(matchMedia('(pointer: coarse)').matches ? 1 : 1.5, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05 * (window.WB_ASTRO_BRIGHT || 2.2);
    r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:' + (SCRUB ? 'pan-y' : 'none') + ';'; /* homepage (scroll-driven): a finger on the helix must still scroll the page */ stage.appendChild(r.domElement);
    r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); r.setClearColor(0x0e0e0d, 0);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, 0.1, 100);
    { const key = new T.DirectionalLight(0xfff6ee, 2.2); key.position.set(2.8, 1.3, 0.9); const rim = new T.DirectionalLight(0xdfe8ff, 2.4); rim.position.set(-2.6, 1.8, -2.0);
      const fil = new T.DirectionalLight(0xc8d4e6, 0.45); fil.position.set(-1.8, -0.6, 1.6); sc.add(key, rim, fil, new T.HemisphereLight(0xcfd8e8, 0x050506, 0.25)); }
    import(E + 'environments/RoomEnvironment.js').then((RE) => { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }).catch(() => {});
    const R = 3.6, dA = Math.PI * 2 / 6.2, PITCH = 1.3, CW = 3.4 * 0.82, CH = 2.1 * 0.82;
    /* cards: enough slots for a seamless loop, cycling through the (filtered) items */
    const texCache = new Map(), getTex = (it) => { if (!texCache.has(it)) texCache.set(it, cardTex(T, it, all.indexOf(it))); return texCache.get(it); };
    const geo = new T.PlaneGeometry(CW, CH, 24, 1), NS = 14, slots = [];
    for (let i = 0; i < NS; i++) { const m = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: false, side: T.DoubleSide, depthWrite: true,
        uniforms: { uTex: { value: null }, uSize: { value: new T.Vector2(CW, CH) }, uRadius: { value: 0.12 }, uR: { value: R }, uVel: { value: 0 }, uHover: { value: 0 }, uTime: { value: 0 }, uDim: { value: 0 }, uOp: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) } } });
      m.extensions = { derivatives: true }; const mesh = new T.Mesh(geo, m); mesh.frustumCulled = false; const grp = new T.Group(); grp.add(mesh); sc.add(grp); slots.push({ grp, mesh, m, it: null }); }
    let list = all.slice(), q = '', cat = 'all';
    const applyFilter = () => { list = all.filter((it) => (cat === 'all' || it.cat.split(/[,|]/).map((s) => s.trim()).includes(cat)) && (!q || (it.title + ' ' + it.type + ' ' + it.cat).toLowerCase().includes(q))); if (!list.length) list = all.slice();
      document.querySelectorAll('[data-wb-work-filter]').forEach((b) => b.toggleAttribute('data-active', (b.dataset.wbWorkFilter || '').toLowerCase() === cat)); assigned = -1; };
    document.querySelectorAll('[data-wb-work-filter]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); const c = (b.dataset.wbWorkFilter || 'all').toLowerCase(); cat = cat === c ? 'all' : c; applyFilter(); }));
    const sIn = document.querySelector('[data-wb-work-search]'); if (sIn) sIn.addEventListener('input', () => { q = sIn.value.trim().toLowerCase(); applyFilter(); });
    /* homepage galaxy: white/grey stars in depth around the astronaut + soft grey nebula; scrolling flows them past and stretches them (warp) */
    r.setClearColor(0x030303, 0);
    const GN = innerWidth < 820 ? 2200 : 4200, gp = new Float32Array(GN * 3), gs = new Float32Array(GN), gb = new Float32Array(GN);
    for (let i = 0; i < GN; i++) { const a = Math.random() * Math.PI * 2, far = Math.random() < 0.18, rad = far ? 3 + Math.random() * 8 : 0.55 + Math.pow(Math.random(), 1.8) * 2.6, y = far ? (Math.random() - 0.5) * 16 : (Math.random() + Math.random() - 1) * 3.4;
      gp.set([Math.cos(a) * rad, y, Math.sin(a) * rad - (far ? 2 : 0)], i * 3); gs[i] = 0.5 + Math.pow(Math.random(), 4) * 2.6; gb[i] = Math.random() < 0.12 ? 0.82 : 1.0; }
    const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.BufferAttribute(gp, 3)); gg.setAttribute('sz', new T.BufferAttribute(gs, 1)); gg.setAttribute('tone', new T.BufferAttribute(gb, 1));
    const GU = { uT: { value: 0 }, uOff: { value: 0 }, uRot: { value: 0 }, uV: { value: 0 }, uPx: { value: r.getPixelRatio() } };
    const gal = new T.Points(gg, new T.ShaderMaterial({ uniforms: GU, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      vertexShader: 'uniform float uT, uOff, uRot, uV, uPx; attribute float sz; attribute float tone; varying float vA; varying float vT; varying float vS;' +
        ' void main(){ vec3 p = position; float r = length(p.xz); float a = atan(p.z, p.x) + uRot / (0.5 + r * 0.25) + uT * 0.04 / (0.4 + r * 0.3); p.x = cos(a) * r; p.z = sin(a) * r;' +
        ' p.y += sin(uT * 0.5 + r * 3.0) * 0.05; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;' +
        ' float w = min(1.0, abs(uV) * 0.35); vS = w; gl_PointSize = sz * uPx * (34.0 / -mv.z) * (1.0 + w * 0.6); vT = tone; vA = (0.6 + 0.4 * sin(uT * 1.3 + sz * 23.0)) * smoothstep(8.0, 2.0, abs(p.y)) * smoothstep(0.35, 0.8, r); }',
      fragmentShader: 'varying float vA; varying float vT; varying float vS; void main(){ vec2 d = gl_PointCoord - 0.5; d.x *= 1.0 + vS * 1.5; float f = smoothstep(0.5, 0.0, length(d)); f *= f; gl_FragColor = vec4(vec3(vT) * f * vA, f * vA); }' }));
    gal.frustumCulled = false; sc.add(gal); if (root.getAttribute('data-galaxy') === '0') gal.visible = false; /* the homepage has its own galaxy */
    { const n = document.createElement('canvas'); n.width = n.height = 512; const x = n.getContext('2d'), blob = (px, py, rr, col) => { const gr = x.createRadialGradient(px, py, 0, px, py, rr); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512); };
      blob(150, 200, 260, 'rgba(60,60,64,0.35)'); blob(380, 330, 230, 'rgba(38,38,42,0.4)'); blob(300, 120, 160, 'rgba(90,90,96,0.16)'); blob(90, 420, 180, 'rgba(30,30,34,0.35)');
      const nt = new T.CanvasTexture(n); nt.colorSpace = T.SRGBColorSpace; /* without this the grey blobs are decoded as linear and come out ~2x brighter */ const _nt = nt, neb = new T.Mesh(new T.PlaneGeometry(34, 34), new T.MeshBasicMaterial({ map: nt, transparent: true, depthWrite: false, opacity: 0.9, toneMapped: false })); neb.position.z = -9; neb.renderOrder = -10; sc.add(neb); GU.neb = neb; if (window.__wbAbyss) neb.visible = false; /* the site-wide teal abyss replaces the grey nebula */ }
    /* astronaut at the centre */
    const pivot = new T.Group(); pivot.position.z = -0.4; sc.add(pivot); let mixer = null;
    const OWN_ASTRO = root.getAttribute('data-astro') !== '0'; /* data-astro="0": cards only (the homepage keeps its own astronaut) */
    if (OWN_ASTRO) { const ld = new GL.GLTFLoader(); ld.setMeshoptDecoder(MO.MeshoptDecoder); const url = (window.WB_ASSETS || './') + 'models/astronaut-rig-v2.glb';
      ld.load(url, (g) => { const m = g.scene; pivot.add(m);
        { const clip0 = g.animations.find((x) => /float/i.test(x.name)) || g.animations[0]; if (clip0) { const mx0 = new T.AnimationMixer(m); mx0.clipAction(clip0).play(); mx0.update(0); } }
        m.updateMatrixWorld(true); const bx = new T.Box3().setFromObject(m, true) /* skinned: real posed size */, sz = bx.getSize(new T.Vector3()), cn = bx.getCenter(new T.Vector3()), s = (window.WB_WORK_ASTRO_H || +(root.getAttribute('data-astro-h') || 5.4)) / Math.max(1e-6, sz.y); /* data-astro-h: his height in scene units */
        m.scale.setScalar(s); m.position.set(-cn.x * s, -cn.y * s, -cn.z * s);
        const waitM = new T.MeshStandardMaterial({ color: 0xd6d4cf, metalness: 1, roughness: 0.32, envMapIntensity: 1.2, side: T.DoubleSide }); m.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.material = waitM; } }); window.__wbWorkAstro = { m, bx: bx.getSize(new T.Vector3()).toArray(), s };
        /* data-look="glass" on [data-wb-work]: the shared About glass (wb-glass.js, options as data attributes on [data-wb-work]) */
        const WAT = (k, d) => root.getAttribute('data-' + k) ?? d;
        const glassA = WAT('look', '') === 'glass' && window.WBGlass ? WBGlass(T, sc, r, WAT) : new T.MeshPhysicalMaterial({ color: 0x15161a, metalness: 0.05, roughness: 0.0, transmission: 1, thickness: 1.4, ior: 1.5, dispersion: window.WB_WORK_DISPERSION ?? 6, attenuationColor: new T.Color(0x0a0a0d), attenuationDistance: 1.2,
          flatShading: true, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.6, specularIntensity: 1, side: T.FrontSide });
        m.traverse((o) => { if (o.isMesh) o.material = glassA; });

        const clip = g.animations.find((a) => /float/i.test(a.name)) || g.animations[0]; if (clip) { mixer = new T.AnimationMixer(m); mixer.clipAction(clip).play(); } },
        undefined, (e) => console.warn('[work] astronaut failed', e)); }
    /* input → infinite offset with inertia + soft snap */
    const MS = { x: 0, y: 0, tx: 0, ty: 0 }; addEventListener('pointermove', (e) => { MS.tx = e.clientX / innerWidth * 2 - 1; MS.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    let vel = 0, ov = 0, off = 0, tgt = 0, idleT = 0, assigned = -1, hovered = null;
    const SC = window.WB_WORK_SCROLL || +(root.getAttribute('data-wb-work-speed') || 1);
    const nudge = (d) => { tgt += d * SC; idleT = performance.now(); };
    if (!SCRUB) root.addEventListener('wheel', (e) => { e.preventDefault(); nudge(Math.max(-1, Math.min(1, (e.deltaY + e.deltaX) * (e.deltaMode === 1 ? 0.09 : 0.0032)))); }, { passive: false });
    let ty = null; if (!SCRUB) root.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    if (!SCRUB) root.addEventListener('touchmove', (e) => { if (ty == null) return; const y = e.touches[0].clientY; nudge((ty - y) * 0.013); ty = y; e.preventDefault(); }, { passive: false });
    root.addEventListener('touchend', () => { ty = null; });
    if (!SCRUB) addEventListener('keydown', (e) => { if (e.target && e.target.matches && e.target.matches('input,textarea')) return; if (/ArrowDown|ArrowRight|PageDown/.test(e.key)) { tgt = Math.round(tgt) + 1; } if (/ArrowUp|ArrowLeft|PageUp/.test(e.key)) { tgt = Math.round(tgt) - 1; } });
    const pv = document.querySelector('[data-wb-work-prev]'), nx = document.querySelector('[data-wb-work-next]'), cur = document.querySelector('[data-wb-work-current]');
    pv && pv.addEventListener('click', (e) => { e.preventDefault(); tgt = Math.round(tgt) - 1; }); nx && nx.addEventListener('click', (e) => { e.preventDefault(); tgt = Math.round(tgt) + 1; });
    const ray = new T.Raycaster(), nd = new T.Vector2();
    const pick = (e) => { const b = r.domElement.getBoundingClientRect(); nd.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(nd, cam); const h = ray.intersectObjects(slots.map((s) => s.mesh), false)[0]; return h ? slots.find((s) => s.mesh === h.object) : null; };
    let pmE = null; r.domElement.addEventListener('pointermove', (e) => { pmE = e; }); const doHover = (e) => { hovered = pick(e); if (hovered) { const h = ray.intersectObject(hovered.mesh, false)[0]; if (h && h.uv) hovered.m.uniforms.uMouse.value.copy(h.uv); } r.domElement.style.cursor = hovered ? 'pointer' : ''; };
    let down = null; r.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    r.domElement.addEventListener('click', (e) => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const s = pick(e); if (!s || !s.it) return;
      if (Math.abs(s.s) > 0.5) { tgt = Math.round(tgt) + Math.round(s.s); return; } /* side card: bring it to the front */
      if (s.it.href) { if (window.wbSwapGo) wbSwapGo(s.it.href, e.clientX, e.clientY); else if (window.wbInkGo) wbInkGo(s.it.href, e.clientX, e.clientY); else location.href = s.it.href; } });
    const size = () => { const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 0.8 ? 46 : 32; cam.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(stage);
    let last = performance.now(), lastCur = '', EX = 0; /* EX: homepage exit into About (0 → 1) */
    const tick = (now) => { requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (window.__wbWorkPaused || !root.isConnected || root.offsetParent === null && getComputedStyle(root).position !== 'fixed') return; if (root.style.display === 'none' || root.closest('[data-wb-hidden]')) return;
      /* data-auto="0.08" (cards per second): after 2.5 s without input the helix drifts on by itself, easing in; hover pauses it, any input takes over */
      if (SCRUB) { const sec = root.closest('section') || root, rr = sec.getBoundingClientRect(), cta = (window.__wbHxCta && window.__wbHxCta.isConnected) ? window.__wbHxCta : (window.__wbHxCta = (document.querySelector('[data-cta-panel]') || {}).closest?.('section')), endY = cta ? cta.getBoundingClientRect().top - rr.top - innerHeight : rr.height - innerHeight, s0 = (window.__wbRPEnd || 0) * 0.97, run = scrollY - s0, p = Math.max(0, Math.min(1, run / Math.max(1, run + endY + rr.top) / 0.92)); /* counts from where the helix is visible (hero → work done) to where About starts; last project holds a moment */ /* homepage: every project has passed (last one holds a moment) before the About handover starts, which begins when the About section enters the screen */
        /* homepage: fade in with the hero→work handover, on the same curve the ribbon cards used (rp 0.8 → 1), so the helix never peeks out under the leaving hero */
        const rpv = window.__wbRP, g0 = rpv == null ? (root.closest('.home_page-wrapper') ? 0 : 1) /* homepage: hidden until the hero runs (it showed the huge phone WORK text during loading) */ : Math.max(0, Math.min(1, (rpv - 0.8) / 0.2)), gIn = g0 * g0 * (3 - 2 * g0), q0 = Math.max(0, Math.min(1, (window.__wbRQ || 0) / 0.25)); EX = q0 * q0 * (3 - 2 * q0); /* work → About: the ring flies apart past the camera, gone before the About text */
        const gOut = 1 - Math.max(0, Math.min(1, (EX - 0.2) / 0.6)), gs = (gIn * gOut).toFixed(3); window.__wbWorkIn = gIn * (1 - Math.max(0, Math.min(1, EX / 0.45))); { const wv = window.__wbWorkIn.toFixed(2); if (wv !== root.__wv) { root.__wv = wv; document.documentElement.style.setProperty('--wb-work-in', wv); } } /* CSS can follow it too (phones: plain-text WORK title) */ /* the WORK blur word leaves a little ahead of the cards */ if (stage.__op !== gs) { stage.__op = gs; stage.style.opacity = gIn * gOut >= 0.999 ? '' : gs; }
        const pn = root.closest('[data-panel]'), po = pn ? +getComputedStyle(pn).opacity : 1, on = rr.top < innerHeight && rr.bottom > 0 && po > 0.02 && gIn * gOut > 0.001;
        window.__wbHelixOn = OWN_ASTRO && on && po > 0.5; /* one astronaut at a time: wb-astro hides the homepage one while the helix (with its own glass astronaut) is up */
        if (!on) return; tgt = p * Math.max(0, all.length - 1); }
      else { const AUTO = +(root.getAttribute('data-auto') || 0), idl = now - idleT, ramp = Math.max(0, Math.min(1, (idl - 2500) / 2000));
      if (AUTO && !hovered && ramp > 0) tgt += AUTO * dt * ramp * ramp * (3 - 2 * ramp);
      else if (idl > 280) tgt += (Math.round(tgt) - tgt) * (1 - Math.exp(-dt * 3)); /* settle on a card */ }
      if (pmE) { doHover(pmE); pmE = null; }
      const pOff = off; { const k = 70, dmp = 2 * Math.sqrt(k); ov += ((tgt - off) * k - ov * dmp) * dt; off += ov * dt; } vel += (Math.max(-6, Math.min(6, (off - pOff) / Math.max(dt, 1e-3) * 1.6)) - vel) * (1 - Math.exp(-dt * 6));
      const N = list.length, base = Math.floor(off);
      slots.forEach((s, i) => { const k0 = base - NS / 2, k = k0 + ((((i - k0) % NS) + NS) % NS); const sv = k - off; s.s = sv; const idx = ((k % N) + N) % N, it = list[idx];
        if (s.it !== it) { s.it = it; s.m.uniforms.uTex.value = null; s.m.uniforms.uOp.value = 0; getTex(it).then((t) => { if (s.it === it) s.m.uniforms.uTex.value = t; }); }
        const a = sv * dA + EX * EX * 2.4 /* exit spin */, y = -sv * PITCH, front = 1 - ss(Math.abs(sv) / 1.2), fade = 1 - ss((Math.abs(sv) - 3.2) / 1.4), U = s.m.uniforms;
        const ex2 = EX * EX, RX = R * (1 + EX * 0.35); s.grp.position.set(Math.sin(a) * RX, y * (1 + ex2 * 2.6) + (sv * 0.9) * ex2, Math.cos(a) * RX); /* exit: the ring stretches into a tall spiral */ s.grp.rotation.set(0, a, 0);
        const hv = hovered === s ? 1 : 0; U.uHover.value += (hv - U.uHover.value) * (1 - Math.exp(-dt * 8)); U.uTime.value = now / 1000; U.uVel.value = vel + EX * 7;
        s.grp.scale.setScalar(0.86 + 0.14 * front);
        const op = U.uTex.value ? fade : 0; U.uOp.value += (op - U.uOp.value) * (1 - Math.exp(-dt * 8)); U.uDim.value = ss((Math.abs(sv) - 0.6) / 3.2) * 0.85; s.grp.visible = U.uOp.value > 0.01; s.mesh.renderOrder = Math.round(10 - Math.abs(sv)); });
      const fi = list[((Math.round(off) % N) + N) % N]; if (cur && fi && fi.title !== lastCur) { lastCur = fi.title; cur.textContent = (((Math.round(off) % N) + N) % N + 1) + '. ' + fi.title; }
      GU.uT.value = now / 1000; GU.uOff.value = off; GU.uRot.value = -off * dA * 0.25; GU.uV.value = vel; GU.neb.position.x = Math.sin(now / 9000) * 0.6; GU.neb.position.y = Math.sin(off * 0.05) * 0.4;
      { const k = 1 - Math.exp(-dt * 2.2); MS.x += (MS.tx - MS.x) * k; MS.y += (MS.ty - MS.y) * k; }
      gal.rotation.y = MS.x * 0.12; gal.rotation.x = MS.y * 0.06; gal.position.x = MS.x * 0.25; gal.position.y = -MS.y * 0.18; GU.neb.position.x += -MS.x * 0.5;
      pivot.rotation.y = -off * dA + MS.x * 0.28; pivot.rotation.x = MS.y * 0.1; pivot.position.x = MS.x * 0.12; pivot.position.y = Math.sin(now / 2200) * 0.05 - MS.y * 0.08 + +(root.getAttribute('data-astro-y') || 0); /* data-astro-y: move him up (+) or down (-) */ pivot.position.z = -0.4; if (mixer) mixer.update(dt);
      
      cam.position.set(0, 0.35 + EX * 1.2, R + 7.6 + EX * EX * 9); /* pull back, never into a single card */ cam.lookAt(0, 0, 0);
      if (!r.domElement.isConnected) { const s2 = document.querySelector('[data-wb-work-stage]'); if (s2) s2.appendChild(r.domElement); } /* the page re-rendered its stage (DC/Webflow re-mount): re-attach the canvas */
      if (!(window.__wbInkBusy && window.__wbInkCov > 0.45 && !window.__wbWorkWarm) && (!window.WB_READY || window.WB_READY(r, sc, cam))) { r.render(sc, cam); window.__wbWorkFrames = (window.__wbWorkFrames || 0) + 1; } };
    applyFilter(); requestAnimationFrame(tick); window.__wbWorkReady = 1;
  };
  boot().catch((e) => console.warn('[work] failed', e));
})();

;
/* modules22/wb-blurword.js */
/* Wubble hero "blur word": a cool slate gradient backdrop with a giant pale wordmark that smears into a rotational blur
   around the cursor (WebGL), fading out as the hero scrolls away. Fixed behind the page, under the 3D astronaut.
   Webflow: [data-wb-blurword] on the hero section; its text comes from a child [data-wb-blurword-text] (keep it in the
   Designer for SEO, it is hidden visually). Attributes on the section:
   data-bg="0" draws only the word (transparent backdrop) · data-under="[data-wb-orbit]" inserts it just before that element, so it sits behind it.
   data-follow-opacity: the word only shows while the section is visible (its own and its parents' opacity).
   data-c1="#879caa" data-c2="#1a2025" (gradient) data-ink="#a4b5c1" (word) data-blur="0.7" data-x="0.063" data-y="0.1" data-w="0.874" data-y-mobile="0.4" (phones; default: centred) */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const hex = (s) => { s = String(s).trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255); };
  const FS = `precision highp float; varying vec2 vUv; uniform sampler2D uW; uniform vec2 uRes, uM; uniform vec4 uBox; uniform float uT, uBlur, uK; uniform vec3 uC1, uC2, uInk;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float word(vec2 uv){ vec2 q = (uv - uBox.xy) / uBox.zw; if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return 0.0; return texture2D(uW, vec2(q.x, 1.0 - q.y)).a; }
void main(){
  float asp = uRes.x / uRes.y; vec2 uv = vUv;
  vec2 g = (uv - 0.5) * vec2(asp, 1.0); float a = -0.95; vec2 r = vec2(g.x * cos(a) - g.y * sin(a), g.x * sin(a) + g.y * cos(a));
  float pos = clamp(r.x / 1.22 + 0.5 + sin(uT * 0.05) * 0.06, 0.0, 1.0); vec3 bg = mix(uC1, uC2, smoothstep(0.0, 1.0, pos));
  bg += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  vec2 m = uM; float d = distance(uv * vec2(asp, 1.0), m * vec2(asp, 1.0)), fall = max(0.0, 1.0 - d * 4.0 * (1.0 - 0.77));
  float amt = (uBlur + 0.2) * fall * 0.04 * uK, w0 = word(uv), acc = w0 * 0.35, tw = 0.35;
  if (amt > 0.0001) { vec2 to = (uv - m) * vec2(asp, 1.0); float rad = length(to), ba = atan(to.y, to.x), j = ign(gl_FragCoord.xy) - 0.5;
    for (int i = 0; i < 10; i++) { float wt = pow(0.68, float(i)), st = (1.0 + (float(i) + 0.5 + j) * 0.9) * amt;
      vec2 p1 = rad * vec2(cos(ba + st), sin(ba + st)), p2 = rad * vec2(cos(ba - st), sin(ba - st));
      acc += (word(vec2(p1.x / asp, p1.y) + m) + word(vec2(p2.x / asp, p2.y) + m)) * wt; tw += 2.0 * wt; }
    w0 = acc / tw; }
  gl_FragColor = vec4(mix(bg, uInk, w0), 1.0); }`;
  const init = (sec) => {
    if (sec.__bw) return; sec.__bw = 1; const at = (k, d) => sec.getAttribute('data-' + k) ?? d;
    const src = sec.querySelector('[data-wb-blurword-text]'); const text = (src ? src.textContent : 'wubble').trim().toLowerCase(); /* the grey blur titles are always lowercase site-wide (about, work, …) */
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:block;';
    const first = document.querySelector(at('under', '') || '[data-wb-about-astro-canvas]'); first ? first.parentNode.insertBefore(cv, first) : document.body.appendChild(cv);
    const clear = at('bg', '1') === '0'; // data-bg="0": word only, transparent backdrop (another background shows through)
    const gl = cv.getContext('webgl', { alpha: clear, antialias: false }); if (!gl) return;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[blurword]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, clear ? FS.replace('vec4(mix(bg, uInk, w0), 1.0)', 'vec4(uInk * w0, w0)') : FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uW', 'uRes', 'uM', 'uBox', 'uT', 'uBlur', 'uK', 'uC1', 'uC2', 'uInk'].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    gl.uniform3fv(U.uC1, hex(at('c1', '#879caa'))); gl.uniform3fv(U.uC2, hex(at('c2', '#1a2025'))); gl.uniform3fv(U.uInk, hex(at('ink', '#a4b5c1'))); gl.uniform1f(U.uBlur, +at('blur', 0.7));
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.uniform1i(U.uW, 0);
    const wc = document.createElement('canvas'), wg = wc.getContext('2d');
    const draw = () => { const W = innerWidth, H = innerHeight, d = Math.min(matchMedia('(pointer: coarse)').matches ? 1 : 1.5, devicePixelRatio || 1); cv.width = W * d | 0; cv.height = H * d | 0; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height);
      const s2 = sec.querySelector('[data-wb-blurword-text]') || src, fam = s2 ? getComputedStyle(s2).fontFamily || 'Switzer, sans-serif' : 'Switzer, sans-serif', wgt = s2 ? getComputedStyle(s2).fontWeight || '700' : '700', bw = W * +at('w', 0.874) * d;
      wg.font = wgt + ' 400px ' + fam; const mw = wg.measureText(text), ink = mw.actualBoundingBoxAscent + mw.actualBoundingBoxDescent, fs = 400 * bw / Math.max(1, mw.width), th = Math.ceil(ink * fs / 400 + fs * 0.06);
      wc.width = Math.ceil(bw); wc.height = Math.max(2, th); wg.font = wgt + ' ' + fs + 'px ' + fam; wg.fillStyle = '#fff'; wg.textBaseline = 'alphabetic'; wg.clearRect(0, 0, wc.width, wc.height);
      wg.fillText(text, -wg.measureText(text).actualBoundingBoxLeft, wc.height - mw.actualBoundingBoxDescent * fs / 400 - fs * 0.03);
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wc);
      const bwN = +at('w', 0.874), bhN = wc.height / (H * d); const yM = at('y-mobile', null), y = W < 768 && H > W ? (yM != null ? +yM : 0.5 - bhN / 2) : +at('y', 0.1); /* phones: centred in the view unless data-y-mobile is set */
      gl.uniform4f(U.uBox, +at('x', 0.063), 1 - y - bhN, bwN, bhN); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw); draw(); addEventListener('resize', draw);
    setTimeout(draw, 600); setTimeout(draw, 1800); /* the page can re-render or swap fonts after the first draw (blank word) */
    let mx = 0.6, my = 0.65, tx = 0.6, ty = 0.65, k = 0, tk = 0; addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; tk = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => { tk = 0.35; });
    const t0 = performance.now(); let last = t0;
    const tick = (now) => { RAF(tick); if (!sec.isConnected) { cv.remove(); return; } const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const r = sec.getBoundingClientRect(); let vis = Math.max(0, Math.min(1, r.bottom / (innerHeight * 0.6)));
      /* data-follow-opacity: show only while the section itself is shown (e.g. the homepage About panel that fades in and out) */
      if (sec.hasAttribute('data-follow-opacity')) { let o = 1; for (let n = sec; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); o *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') { o = 0; break; } } if (typeof window.__wbAboutOp === 'number' && sec.hasAttribute('data-about')) o *= window.__wbAboutOp; /* homepage: only while the About panel is the one on screen */ vis = Math.min(vis, o); }
      { const fv = sec.getAttribute('data-follow-var'); if (fv) vis = Math.min(vis, Math.max(0, Math.min(1, +window[fv] || 0))); } /* data-follow-var="__wbWorkIn": show with another effect (Home WORK word with the work helix) */
      cv.style.opacity = String(vis); if (vis <= 0) return;
      const e = 1 - Math.exp(-dt * 4.5); mx += (tx - mx) * e; my += (ty - my) * e; k += (tk - k) * (1 - Math.exp(-dt * 2));
      gl.uniform2f(U.uM, mx, my); gl.uniform1f(U.uK, 0.4 + k * 0.6); gl.uniform1f(U.uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(tick);
  };
  let n = 0; const poll = () => { document.querySelectorAll('[data-wb-blurword]').forEach((el) => (window.WB_NEAR ? window.WB_NEAR(el, () => init(el)) : init(el))); if (++n < 40 && !document.querySelector('[data-wb-blurword]')) setTimeout(poll, 120); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();

;
/* modules22/wb-waves.js */
/* Wubble GradientWaves: React Bits <GradientWaves /> (JS+CSS variant) run without React.
   Soft rolling gradient waves seen toward a horizon; they follow the cursor a little and a click makes a swell.
   Webflow: an empty div with [data-wb-waves], sized/positioned by Webflow. Every prop is a kebab-case data attribute,
   e.g. data-speed="2". Lists use commas: data-colors="#111,#222". Generated from the React Bits source with a tiny
   React shim below (hooks run once at mount), so the component code is unchanged and can be refreshed from upstream. */
(() => {
  let queue = [];
  const useRef = (v) => ({ current: queue.length ? queue.shift() : v }); // first refs = container (and canvas)
  const useEffect = (fn) => { fn(); };
  const useMemo = (fn) => fn();
  const useState = (v) => [v, () => {}]; // shortcut: no WebGL context-restore remount; reload restores it


const ROOT = 'gradient-waves-container';
const CANVAS = 'gradient-waves-canvas';

const MAX_SWELLS = 4;
const SWELL_SECONDS = 3.2;
const SWELL_GAIN = 2.8;
const SWELL_WIDTH = 8;
const INTRO_SECONDS = 2.6;
const CAMERA_HEIGHT = 30;
const QUALITY = { low: 56, medium: 84, high: 120 };

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uHeight;
uniform float uTilt;
uniform float uZoom;
uniform vec2 uLook;
uniform float uFogDepth;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform vec3 uHorizon;
uniform vec3 uWave;
uniform vec3 uCrest;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec3 uSun;
uniform float uRelief;
uniform float uSheen;
uniform float uSteps;
uniform float uStride;
uniform vec3 uIntro;
uniform vec3 uSwells[${MAX_SWELLS}];
uniform float uSwellWidth;
out vec4 outColor;

const float FAR = 4000.0;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 surface(vec2 xy) {
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);
  float a = xy.x + tc.x;
  float swellPhase = (xy.y + a) / 20.0 + tc.y;
  float bend = uSwell * cos(swellPhase) / 20.0;
  float mx = a + uSwell * sin(swellPhase);
  float crossPhase = xy.x / 23.0 + tc.w;
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);
  float twist = -uTurbulence * sin(crossPhase) / 23.0;
  float cx = cos(mx * freq.x);
  float cy = cos(my * freq.y);
  float rise = 1.0;
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);
  float amp = uAmplitude * rise;
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);
  float dy = amp * (freq.x * cx * bend + freq.y * cy);
  for (int k = 0; k < ${MAX_SWELLS}; k++) {
    vec3 sw = uSwells[k];
    if (sw.z <= 0.0) continue;
    float u = (xy.x - sw.x) / uSwellWidth;
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);
    float bump = sw.z * exp(-u * u - v * v);
    h += bump;
    dx += bump * (-2.0 * u / uSwellWidth);
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));
  }
  return vec3(h, dx, dy);
}

float march(vec3 origin, vec3 dir) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;
    if (abs(gap) < 0.002 * dist + 0.01) break;
    dist += uStride * gap;
    if (!(abs(dist) < FAR)) return FAR;
  }
  return dist;
}

void main() {
  float c;
  float s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, ${CAMERA_HEIGHT.toFixed(1)});
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;
  uv.x *= uResolution.x / uResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot);
  s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt + uLook.y);
  s = sin(uTilt + uLook.y);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
  c = cos(uLook.x);
  s = sin(uLook.x);
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;

  float dist = march(cam, dir);
  vec3 pos = cam + dist * dir;
  vec3 field = surface(pos.xy);
  vec3 view = -dir;

  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);

  vec3 col;
  float alpha;
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);
  if (uLight < 0.5) {
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;
    alpha = fade;
  } else {
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);
    float density = mix(0.16, 0.9, 1.0 - lightness);
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);
    col = hue;
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);
  }

  float reveal = uIntro.x;
  col = clamp(col, 0.0, 1.0);
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;
  if (uOpaque > 0.5) {
    outColor = vec4(mix(uBackground, col, alpha), 1.0);
  } else {
    outColor = vec4(col * alpha, alpha);
  }
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

let probe = null;

const parseColor = (value, fallback) => {
  if (value === 'transparent') return null;
  if (typeof document === 'undefined') return fallback;
  if (!probe) probe = document.createElement('canvas').getContext('2d');
  if (!probe) return fallback;
  probe.fillStyle = '#000000';
  probe.fillStyle = value;
  const text = probe.fillStyle;
  if (text.startsWith('#')) {
    const hex = parseInt(text.slice(1), 16);
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
  }
  const match = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(text);
  if (!match) return fallback;
  if (match[4] !== undefined && Number(match[4]) === 0) return null;
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const rayAt = (point, aspect, s, look) => {
  const uvx = (point[0] - 0.5) * aspect;
  const uvy = point[1] - 0.5;
  const vfov = Math.PI / 2.3 / Math.max(s.zoom, 0.05);
  const length = Math.hypot(uvx, uvy);
  const turn = vfov * length;
  let dir = [0, -Math.sin(turn), -Math.cos(turn)];
  const nx = length > 1e-5 ? uvx / length : 1;
  const ny = length > 1e-5 ? uvy / length : 0;
  dir = [nx * dir[0] + ny * dir[1], -ny * dir[0] + nx * dir[1], dir[2]];
  const pitch = s.tilt + look[1];
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  dir = [cp * dir[0] - sp * dir[2], dir[1], sp * dir[0] + cp * dir[2]];
  const cy = Math.cos(look[0]);
  const sy = Math.sin(look[0]);
  dir = [cy * dir[0] - sy * dir[1], sy * dir[0] + cy * dir[1], dir[2]];
  return dir;
};

const groundAt = (point, aspect, s, look) => {
  const dir = rayAt(point, aspect, s, look);
  if (dir[2] > -0.02) return null;
  const travel = (CAMERA_HEIGHT - s.height) / -dir[2];
  return [dir[0] * travel, dir[1] * travel];
};

const prefersReduced = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

function GradientWaves({
  horizonColor = '#5227FF',
  waveColor = '#FF9FFC',
  crestColor = '#FFFFFF',
  backgroundColor = 'transparent',
  lightMode = false,
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 64,
  zoom = 1,
  height = 5.5,
  fogDepth = 15,
  relief = 1,
  lightAngle = 120,
  sheen = 0,
  brightness = 1,
  opacity = 1,
  grain = 0.2,
  quality = 'medium',
  intro = true,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  mouseStrength = 0.6,
  swellOnClick = true,
  paused = false,
  dpr = 2,
  className = '',
  style
}) {
  const containerRef = useRef(null);
  const horizon = useMemo(() => parseColor(horizonColor, [0.32, 0.15, 1]) ?? [0.32, 0.15, 1], [horizonColor]);
  const wave = useMemo(() => parseColor(waveColor, [1, 0.62, 0.99]) ?? [1, 0.62, 0.99], [waveColor]);
  const crest = useMemo(() => parseColor(crestColor, [1, 1, 1]) ?? [1, 1, 1], [crestColor]);
  const paper = useMemo(() => parseColor(backgroundColor, null), [backgroundColor]);

  const settings = {
    horizon,
    wave,
    crest,
    paper,
    lightMode,
    speed,
    amplitude: Math.max(0, amplitude),
    waveScale: Math.max(0.01, waveScale),
    waveRatio: Math.max(0.01, waveRatio),
    swell,
    turbulence,
    tilt: (clamp(tilt, 10, 85) * Math.PI) / 180,
    zoom: Math.max(0.05, zoom),
    height,
    fogDepth: Math.max(0.5, fogDepth),
    relief: clamp(relief, 0, 1),
    lightAngle: (lightAngle * Math.PI) / 180,
    sheen: Math.max(0, sheen),
    brightness: Math.max(0, brightness),
    opacity: clamp(opacity, 0, 1),
    grain: typeof grain === 'number' ? Math.max(0, grain) : grain ? 0.05 : 0,
    steps: QUALITY[quality] ?? QUALITY.medium,
    intro,
    mouseInteraction,
    parallaxStrength: Math.max(0, parallaxStrength),
    mouseStrength: clamp(mouseStrength, 0, 1),
    swellOnClick,
    paused,
    dpr: Math.max(0.5, dpr)
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const wakeRef = useRef(null);

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const canvas = document.createElement('canvas');
    canvas.className = CANVAS;
    container.appendChild(canvas);
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance'
    });
    if (!gl) {
      canvas.remove();
      return undefined;
    }
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      canvas.remove();
      return undefined;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      canvas.remove();
      return undefined;
    }
    const names = [
      'uResolution',
      'uTime',
      'uClock',
      'uAmplitude',
      'uWaveScale',
      'uWaveRatio',
      'uSwell',
      'uTurbulence',
      'uHeight',
      'uTilt',
      'uZoom',
      'uLook',
      'uFogDepth',
      'uBrightness',
      'uOpacity',
      'uGrain',
      'uHorizon',
      'uWave',
      'uCrest',
      'uBackground',
      'uOpaque',
      'uLight',
      'uSun',
      'uRelief',
      'uSheen',
      'uSteps',
      'uStride',
      'uIntro',
      'uSwells',
      'uSwellWidth'
    ];
    const u = {};
    names.forEach(name => {
      u[name] = gl.getUniformLocation(program, name);
    });
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const swellData = new Float32Array(MAX_SWELLS * 3);
    const state = {
      width: 1,
      height: 1,
      cssWidth: 0,
      cssHeight: 0,
      time: 0,
      clock: 0,
      last: 0,
      raf: 0,
      visible: false,
      introAt: -1,
      pointer: [0.5, 0.5],
      inside: false,
      look: [0, 0],
      steer: [0, 0],
      swells: [],
      quiet: 0,
      seen: null
    };

    const fit = () => {
      const s = settingsRef.current;
      const ratio = Math.min(window.devicePixelRatio || 1, s.dpr, matchMedia('(pointer: coarse)').matches ? 1 : 9); /* phones: 1x is plenty for soft waves (GPU memory) */
      const width = Math.max(1, Math.round(state.cssWidth * ratio));
      const height = Math.max(1, Math.round(state.cssHeight * ratio));
      if (width === state.width && height === state.height) return;
      state.quiet = 0;
      state.width = width;
      state.height = height;
      canvas.width = width;
      canvas.height = height;
    };

    const measure = () => {
      state.cssWidth = container.clientWidth;
      state.cssHeight = container.clientHeight;
      fit();
      wake();
    };

    const introProgress = (s, reduced) => {
      if (!s.intro || reduced || state.introAt < 0) return 1;
      return clamp((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);
    };

    const render = reduced => {
      const s = settingsRef.current;
      gl.viewport(0, 0, state.width, state.height);
      gl.uniform2f(u.uResolution, state.width, state.height);
      gl.uniform1f(u.uTime, state.time);
      gl.uniform1f(u.uClock, state.clock);
      gl.uniform1f(u.uAmplitude, s.amplitude);
      gl.uniform1f(u.uWaveScale, s.waveScale);
      gl.uniform1f(u.uWaveRatio, s.waveRatio);
      gl.uniform1f(u.uSwell, s.swell);
      gl.uniform1f(u.uTurbulence, s.turbulence);
      gl.uniform1f(u.uHeight, s.height);
      gl.uniform1f(u.uTilt, s.tilt);
      gl.uniform1f(u.uZoom, s.zoom);
      gl.uniform2f(u.uLook, state.look[0], state.look[1]);
      gl.uniform1f(u.uFogDepth, s.fogDepth);
      gl.uniform1f(u.uBrightness, s.brightness);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.uniform1f(u.uGrain, s.grain);
      gl.uniform3fv(u.uHorizon, s.horizon);
      gl.uniform3fv(u.uWave, s.wave);
      gl.uniform3fv(u.uCrest, s.crest);
      const paperColor = s.paper ?? [0, 0, 0];
      gl.uniform3f(u.uBackground, paperColor[0], paperColor[1], paperColor[2]);
      gl.uniform1f(u.uOpaque, s.paper ? 1 : 0);
      gl.uniform1f(u.uLight, s.lightMode ? 1 : 0);
      const elevation = 0.52;
      const angle = s.lightAngle + state.steer[0] * s.mouseStrength * 2;
      const altitude = elevation - state.steer[1] * s.mouseStrength * 0.7;
      gl.uniform3f(
        u.uSun,
        Math.cos(altitude) * Math.cos(angle),
        Math.cos(altitude) * Math.sin(angle),
        Math.sin(altitude)
      );
      gl.uniform1f(u.uRelief, s.relief);
      gl.uniform1f(u.uSheen, s.sheen);
      gl.uniform1f(u.uSteps, s.steps);
      const slope =
        s.amplitude *
        ((s.waveScale / 7) * (1 + Math.abs(s.swell) / 20) +
          ((s.waveScale * s.waveRatio) / 3) * (1 + Math.abs(s.turbulence) / 23));
      const progress = introProgress(s, reduced);
      const shown = Math.min(1, progress / 0.22);
      const crest = 160 * Math.pow(3 / 160, easeInOut(Math.max(0, (progress - 0.1) / 0.9)));
      const settle = clamp((progress - 0.75) / 0.25, 0, 1);
      gl.uniform3f(u.uIntro, shown * shown * (3 - 2 * shown), crest, 1 - settle * settle * (3 - 2 * settle));
      swellData.fill(0);
      let swellPeak = 0;
      state.swells.forEach((swell, index) => {
        const age = state.clock - swell.at;
        const life = age / SWELL_SECONDS;
        const envelope = (1 - Math.exp(-age / 0.25)) * Math.pow(1 - life, 1.6);
        const lift = s.amplitude * SWELL_GAIN * envelope;
        swellData.set([swell.x - age * 12, swell.y, lift], index * 3);
        swellPeak = Math.max(swellPeak, lift);
      });
      gl.uniform3fv(u.uSwells, swellData);
      gl.uniform1f(u.uSwellWidth, SWELL_WIDTH);
      gl.uniform1f(u.uStride, 0.9 / Math.max(1, (slope + (swellPeak * 0.86) / SWELL_WIDTH) / 1.5));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = now => {
      state.raf = 0;
      if (!state.visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;
      state.last = now;
      const reduced = prefersReduced();
      state.clock += dt;
      if (state.introAt < 0) state.introAt = state.clock;
      if (!s.paused && !reduced) state.time += dt * s.speed;

      const steering = s.mouseInteraction && state.inside && !reduced;
      const target = steering ? state.pointer : [0.5, 0.5];
      const ease = 1 - Math.exp(-dt / 0.45);
      const goalX = (target[0] - 0.5) * s.parallaxStrength * 0.35;
      const goalY = (target[1] - 0.5) * s.parallaxStrength * 0.18;
      state.look[0] += (goalX - state.look[0]) * ease;
      state.look[1] += (goalY - state.look[1]) * ease;
      const moving = Math.abs(goalX - state.look[0]) + Math.abs(goalY - state.look[1]) > 0.0002;

      const steerEase = 1 - Math.exp(-dt / 0.6);
      const steerX = steering ? state.pointer[0] - 0.5 : 0;
      const steerY = steering ? 0.5 - state.pointer[1] : 0;
      state.steer[0] += (steerX - state.steer[0]) * steerEase;
      state.steer[1] += (steerY - state.steer[1]) * steerEase;
      const turning = Math.abs(steerX - state.steer[0]) + Math.abs(steerY - state.steer[1]) > 0.0005;
      state.swells = state.swells.filter(swell => state.clock - swell.at < SWELL_SECONDS);

      const still = s.paused || reduced;
      const transient = moving || turning || state.swells.length > 0 || introProgress(s, reduced) < 1;
      if (state.seen !== s || transient || !still) state.quiet = 0;
      else state.quiet += 1;
      state.seen = s;
      if (state.quiet > 3) return;

      state.raf = requestAnimationFrame(tick);
      fit();
      render(reduced);
    };

    const wake = () => {
      if (state.raf || !state.visible || document.hidden) return;
      state.last = 0;
      state.raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const local = event => {
      const rect = container.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),
        inside:
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
      };
    };

    const onMove = event => {
      const point = local(event);
      const was = state.inside;
      state.inside = point.inside;
      if (point.inside) state.pointer = [point.x, point.y];
      if ((point.inside || was) && settingsRef.current.mouseInteraction) wake();
    };

    const onLeave = () => {
      state.inside = false;
      wake();
    };

    const onDown = event => {
      const s = settingsRef.current;
      if (!s.swellOnClick || event.button !== 0 || prefersReduced()) return;
      if (
        event.target instanceof Element &&
        event.target.closest('a, button, input, textarea, select, label, [role="button"]')
      )
        return;
      const point = local(event);
      if (!point.inside) return;
      const ground = groundAt([point.x, point.y], state.width / Math.max(state.height, 1), s, state.look);
      if (!ground) return;
      state.swells.push({ x: ground[0], y: ground[1], at: state.clock });
      if (state.swells.length > MAX_SWELLS) state.swells.shift();
      wake();
    };

    const visibility = new IntersectionObserver(entries => {
      state.visible = entries.some(entry => entry.isIntersecting);
      wake();
    });
    visibility.observe(container);
    const sizes = new ResizeObserver(measure);
    sizes.observe(container);
    measure();
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    document.documentElement.addEventListener('pointerleave', onLeave);
    state.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(state.raf);
      wakeRef.current = null;
      document.removeEventListener('visibilitychange', wake);
      visibility.disconnect();
      sizes.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

}
  const parse = (v) => v === 'true' ? true : v === 'false' ? false : v !== '' && !isNaN(v) ? +v : v.includes(',') ? v.split(',').map((x) => x.trim()) : v;
  const mount = (el) => {
    if (el.__wb) return; el.__wb = 1;
    queue = [el];
    const props = {};
    for (const k in el.dataset) if (k !== 'wbWaves') props[k] = parse(el.dataset[k]);
    if (typeof props.colors === 'string') props.colors = [props.colors];
    GradientWaves(props);
    const cv = el.querySelector('canvas'); // the component's CSS file is not loaded, so style its canvas here
    if (cv) { cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;'; }
  };
  const scan = () => document.querySelectorAll('[data-wb-waves]').forEach((el) => (window.WB_NEAR ? window.WB_NEAR(el, () => mount(el)) : mount(el))); /* starts once near the screen (site head) */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
