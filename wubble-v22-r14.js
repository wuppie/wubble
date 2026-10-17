/* wubble V20 for Webflow — runs the exact Claude Design V13 logic on native Webflow elements.
   Layout/styling lives in Webflow (w13-* classes). Elements the animation drives carry data-w / data-* hooks. */
(function () {
if (window.__wubbleV20) return; window.__wubbleV20 = true;
// ---------- live-only layout: in the Webflow Designer sections stack normally; on the live site the scroll staging switches on ----------
document.documentElement.classList.add('wb-live');
(function () { var L = document.createElement('style'); L.id = 'wb-live-css'; L.textContent = [
  /* r14: the pasted V22 classes already carry the live layout; only keep Designer-safe helpers */
  'html.wb-live [data-hero-front]{display:block}'
].join('\n'); (document.head || document.documentElement).appendChild(L); })();
// per-section scroll length from Webflow: data-wb-length="815" (in vh)
document.addEventListener('DOMContentLoaded', function () { document.querySelectorAll('[data-wb-length]').forEach(function (el) { var v = parseFloat(el.getAttribute('data-wb-length')); if (v > 0) el.style.setProperty('--wb-len', v + 'vh'); }); });
 console.info('wubble: build V22-webflow r14.1 (2026-10-16)');
var BASE = (document.currentScript && document.currentScript.dataset.base) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/';
var DEFAULTS = {"aboutMonitor":"Model","sectionFx":"Globe","sectionFxBlur":14,"footerScene":"3D Moon","footerGroundY":-0.55,"galaxyBg":true,"astroIdle":"Falling","astroLook":"Textured","astroTexEnv":1,"astroTexMetal":1,"astroTexRough":1,"astroTexNormal":1,"heroTitleFx":"None","cloudTypeOpacity":0.4,"cloudTypeStep":1.2,"heroStart":0.04,"heroSpan":0.16,"cloudFront":0.4,"footerCurve":0.14,"astroFaceTex":false,"astroFaceSize":1.07,"astroFaceX":0,"astroFaceY":0,"astroFaceLight":0,"clouds":true,"cloudAmount":1,"cloudSpeed":1,"astroWorkY":0.3,"astroWorkScale":0.8,"astroFly2Start":0.71,"astroTumbleStart":0.6,"astroFlight":270,"spaceFlight":true,"spaceWarp":1.8,"spaceRest":0.85,"astroTexture":"Metal012","astroTexScale":0.004,"astroTexContrast":5.4,"astroChrome":true,"astroMetal":0.85,"astroRough":0.87,"astroChromeColor":"#e8e6e1","astroShadows":0.45,"astroEnv":1.75,"astroFaceColor":"#d8d4cc","astroVisorColor":"#1c1e24","astroVisorR":0.8,"astroVisorCone":0.35,"astroFlyPitch":0.9,"astroFlyYaw":0.4,"astroFlyRoll":-0.25,"astroClipSpeed":1,"astroRig":true,"displayFont":"Oswald","heroTitleSize":1,"sectionTitleSize":1,"workTitleSize":2.3,"bodySize":1,"labelSize":11,"ctaScene":"Ascent","sectionBleed":true,"hero3D":true,"sectionRotate":true,"sectionZoom":2,"smoothScroll":true,"scrollLerp":0.14,"lightIntensity":1,"relief":1,"grain":1.4,"bgSpeed":1,"viewCursor":true,"customCursor":true,"inkLinger":0.6,"curvature":0.18,"ribbonTilt":1.8,"velocityBend":2,"hoverDistortion":2,"cornerRadius":0.12,"reflections":true,"reflectionStrength":0.1,"showGrid":false,"video2":"https://threejs.org/examples/textures/sintel.mp4","workLayout":"Ribbon","ringTiltX":0.12,"ringTiltZ":0.06,"workWord":"Work","weaveDepth":0.35,"weaveDrop":0.55,"workWordSize":0.62,"workWordY":0.4,"workWordX":0,"workWordSpacing":0.03,"workWordWeight":600,"workWordColor":"#ffffff","workWordOpacity":1,"workWordShadow":0.6,"astroGlobal":true,"galaxySize":1.25,"ditherStyle":true,"ditherSize":1,"ditherGain":1.15,"galaxyBright":0.14,"astroBright":0.7,"astroFaceDown":1.6,"astroMouse":2,"heroLight":true,"heroLightBg":"#ffffff","heroLightInk":"#0a0a0a","astroHoverReveal":true,"astroJets":true,"warpAmount":2,"letterStorm":0,"titleMorph":true,"astroFlag":false,"ribbonY":-0.51,"reachTitle":"Reach Out","pageBg":"#0e0e0d","textColor":"#ece9e2","aboutBg":"#040506","aboutText":"#f2f2f0","footerBg":"#030303","footerText":"#f2f2f0","infoBg":"#f2f1ed","infoText":"#151412","astroHoverLight":1.5,"transitionStyle":"Bleed","velocityFx":false,"directScrub":false,"screenVideoOn":true,"hero3Size":1.2,"computerLight":0.2,"scrubDim":0.41,"screenGain":1.1,"scrubStart":0.1,"grainBg":true,"grainAmount":0.03,"astroLandX":0.42,"astroLandY":0.19,"astroLandSize":1,"astroFallStyle":"Drift","astroFallRoll":0.95,"astroExitStart":1,"servicesModel":false,"heroGrainAmount":0,"heroGrainIn":0.4,"heroGrainSize":0.61,"clickVolume":0.5,"robotMorph":false,"robotScale":1.72,"robotMorphSeconds":3.6,"astroPath":true,"astroLimbCycles":25,"robotMorphRange":0.7,"astroFallPitch":1.35,"footerFigure":false,"footerFigureSize":1.5,"monitorFill":2,"monitorShade":0.42,"monitorStart":0.67,"monitorDetect":false,"astroClip":true,"astroClipLoops":1.5,"astroClipAmount":1,"monitorX":0.07,"monitorY":0,"svcScrubStart":2.9,"svcScrubLen":0.8,"heroStudio":true,"servicesBg":"#0e0e0d","servicesText":"#ece9e2","rockOnW":true,"astroShadowSoft":12.5,"astroShadowStrength":1.3,"termPadX":0.12,"termPadY":0.15,"termManual":false,"termScaleX":0.3,"termScaleY":null,"termOffsetY":-0.4,"termOn3D":true,"termGlassInset":0,"glassX":0.045,"glassY":0,"glassW":1,"glassH":1,"footerHover":"None","footerSpriteColors":"#c8612c","footerSpriteFrames":16,"footerSpriteFps":24,"termTypeStart":0.5,"termTypeEnd":1.11,"curvedGrid":true,"curvedGridOpacity":0.22,"curvedGridCells":64,"curvedGridParallax":0.35,"monitorBuilt":true,"hoverMetal":true,"workBg":"#0e0e0d","heroBg":"#ffffff","astroFloorShadow":true,"astroFloorOpacity":0.4,"astroFloorGap":0.12,"reachBg":"#0e0e0d","reachText":"#ece9e2","reachRay":"#b8b4ae","reachHand":"#8f8b85","astroPush":true,"astroPushEvery":6,"astroPushBounce":22,"astroInTerminal":true,"astroPhysics":true,"astroSoftness":1,"astroBreath":1,"astroFistCurl":1.35,"astroFistAxis":"z","astroClipHQ":true,"astroClipIdle":0.85,"astroClipBoost":3.5,"astroClipName":"Falling","astroFallBoost":1,"astroLand":false,"astroLandAmount":0.9,"astroLandSpeed":1.65,"astroJointGuard":false,"astroArmAnims":false,"astroMotion":"Layered","astroTumbleSpeed":1,"cloudFog":"#ffffff","cloudSplit":200,"handStyle":"Chrome","handGlass":true,"handBloom":0.55,"handTrail":0.9,"galaxyThroughHero":1,"heroBgFadeSpeed":25.7,"loaderAstro":false,"handExposure":0.75,"astroPathMul":2.5,"cursorInk":false,"cloudTypeSize":0.55,"cloudEngine":"WebGL","footerMoon":true,"footerMoonSize":2.4,"footerMoonTop":0,"footerAstroH":0.5,"footerMoonCover":0.45,"footerMoonBright":0.12,"footerBend":0,"footerAstroSink":0.03,"aboutMonitorSize":1.25,"aboutTypeSpeed":38,"aboutScreenGlow":1.6,"aboutGalaxy":true,"astroTumbleAt":0.8,"reachSection":false,"astroMoonLift":0,"astroMoonScale":0.45,"footerOwnAstro":false,"aboutMonitorModel":"Frame","aboutScreenW":0.875,"aboutScreenH":0.58,"aboutScreenFwd":0.065,"aboutFrameTone":0.32,"astroMoonX":0,"astroSit":true,"aboutHoldScroll":true,"astroSitLift":0.185,"aboutSitY":0.64,"aboutMonitorY":0,"footerTerrainCamY":0,"footerTerrainLook":0,"footerTerrainStand":16,"footerTerrainScale":140,"aboutFontSize":23,"aboutLandX":0.62,"aboutLandY":-0.1,"aboutZoomDepth":0.4,"astroHoverDither":true,"aboutZoom":false,"footerMoonLight":"Sun","footerSunAngle":-18,"footerSunHeight":10,"footerSunStrength":4.2,"footerMoonBump":7,"astroAboutDown":0.3,"webglBg":false,"workHold":0.8,"astroHoloColor":"#ffffff","astroHoloStripes":20,"astroHoloGlitch":1,"astroHoloAdd":false,"globeRadius":1.4,"globePull":0.25,"globeGap":1,"astroHoloRandom":true,"astroHoloEvery":9,"astroHoloIn":0.7,"astroHoloOut":0.9,"astroHoloHide":0.85,"footerWalk":true,"footerWalkSpeed":0.12,"footerWalkDelay":3,"textScramble":true,"scrambleBase":0.6,"scrambleMax":1.4,"footerWalkAnim":0.8,"footerMoonSpin":0.012,"footerMoonDetail":0,"footerMoonTile":6,"footerMoonExposure":0.9,"footerMoonDither":false,"footerMoonMetal":0.85,"footerMoonRough":0.42,"footerMoonEnv":0.9,"footerMoonTone":0.28,"aboutScreenPadX":66,"aboutScreenPadY":60,"aboutTitleFx":"ASCII","asciiCell":9,"asciiWave":1,"asciiSpeed":1,"footerTitleFx":"ASCII","linkHover":true,"linkHoverDur":0.5,"linkHoverStagger":0.022};

// ---------- head: fonts, base css, lenis, 3D viewer ----------
var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Syne:wght@500;700;800&family=Space+Grotesk:wght@500;700&family=Unbounded:wght@500;700&family=Inter+Tight:wght@500;700;800&family=Archivo:wght@500;700;900&family=Big+Shoulders+Display:wght@600;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400&display=swap"; document.head.appendChild(lk);
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
var WB_MODS = ["modules22/wb-clip-fall.min.js","modules22/wb-clip-wave.min.js","modules22/wb-clip-tumble.min.js","modules22/wb-astro.js","modules22/wb-ribbon.js","modules22/wb-sections.js","modules22/wb-ui.js","modules22/wb-crt3d.js","modules22/wb-ftmoon.js","modules22/wb-space.js","modules22/wb-clouds-gl.js","modules22/wb-clouds.js","modules22/wb-cloudtype.js","modules22/wb-ascii-title.js","modules22/wb-linkhover.js","modules22/wb-scramble.js","modules22/wb-clip-look.min.js","modules22/wb-clip-walk.min.js","modules22/wb-clip-drop.min.js"], WB_LIBS = ["https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js","https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"];
function wbLoadSeq(list, i, done) { if (i >= list.length) return done(); var s = document.createElement('script'); s.src = list[i]; s.async = false; s.onload = s.onerror = function () { wbLoadSeq(list, i + 1, done); }; (document.head || document.documentElement).appendChild(s); }
var wbModsReady = new Promise(function (res) { var libs = WB_LIBS.filter(function (u) { return !(/gsap/.test(u) && window.gsap) && !(/lenis/.test(u) && window.Lenis); }); wbLoadSeq(libs.concat(WB_MODS.map(function (m) { return BASE + m + VQ; })), 0, res); });
// ---------- r14: create decorative layers the modules need when the Webflow page doesn't have them ----------
function wbEnsure(root) {
  var mk = function (attr, css, parent, before) { if (document.querySelector('[' + attr + ']')) return null; var e = document.createElement('div'); e.setAttribute(attr, ''); e.setAttribute('aria-hidden', 'true'); e.style.cssText = css; (parent || root).insertBefore(e, before || null); return e; };
  var work = document.querySelector('[data-wh="work"],[data-w="work"]');
  mk('data-clouds-back', 'position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;', root, work);
  mk('data-clouds-front', 'position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden;', root, work);
  var missing = ['data-hero-front', 'data-about-title', 'data-avail', 'data-fl-word', 'data-ft-bottom', 'data-footer-spacer', 'data-about', 'data-about-glass'].filter(function (a) { return !document.querySelector('[' + a + ']'); });
  if (missing.length) console.warn('wubble r14: add these attributes in Webflow for the full effect →', missing.join(', '));
}
if (!window.__wubbleViewerPreloaded) loadScript(BASE + 'dither-viewer.js' + VQ, true);
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
      if (wi > 0) { var g = document.createElement('span'); g.className = 'title-gap'; el.appendChild(g); }
      Array.from(w).forEach(function (ch) {
        var m = document.createElement('span'); m.className = hide === wi + 1 ? 'title-letter-mask-hidden' : 'title-letter-mask';
        var gw = document.createElement('span'); gw.className = 'title-word'; gw.setAttribute('data-gw', '');
        var l = document.createElement('span'); l.className = lc; l.setAttribute('data-' + attr, ''); l.setAttribute('aria-hidden', 'true'); l.textContent = ch;
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
    var img = el.querySelector('[data-wubble="cover"] img, img[data-wubble="cover"], img'); var a = function (k) { return (el.getAttribute('data-' + k) || '').trim(); };
    return { title: a('title'), slug: a('slug'), client: a('client'), type: a('services'), year: a('year'), blurb: a('description'), video: a('video'), bg: a('color'), cover: (img && !img.classList.contains('w-dyn-bind-empty') && !/placeholder/i.test(img.getAttribute('src') || '')) ? (img.getAttribute('src') || img.currentSrc || '') : '' };
  }).filter(function (p) { return p.title; });
  console.info('[wubble] CMS projects found: ' + items.length); try { console.table(items.map(function (p) { return { title: p.title, cover: p.cover || '(none)', video: p.video || '(none)' }; })); } catch (e) {}
  var lum = function (h) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return 0.5; var n = parseInt(m[1], 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; };
  window.__wubbleMerge = function (defs) {
    if (!items.length) return defs;
    return items.map(function (p, i) { var d = defs[i % defs.length], o = Object.assign({}, d);
      ['title', 'client', 'type', 'year', 'blurb'].forEach(function (k) { if (p[k]) o[k] = p[k]; });
      if (p.bg) { o.bg = p.bg; o.ink = lum(p.bg) > 0.55 ? '#151412' : '#ece9e2'; }
      if (p.title !== d.title) o.mark = p.title.toUpperCase().split(/\s+/).slice(0, 2).join(' ');
      o.cover = p.cover; o.videoUrl = p.video; return o; });
  };
  // ---------- props: defaults + root data-* overrides ----------
  var props = Object.assign({}, DEFAULTS);
  // ---------- section order comes from the Webflow Navigator ----------
  var WB_SECS = Array.prototype.slice.call(document.querySelectorAll('[data-wb-section]'));
  var WB_ORDER = WB_SECS.map(function (e) { return e.getAttribute('data-wb-section'); }).join(',');
  window.__wbGeneric = WB_ORDER !== 'hero,work,services,reach' || root.getAttribute('data-wb-mode') === 'generic';
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
  projects = [
    { title: 'Tidewater Atlas', mark: 'TIDE/ WATER', type: 'Interactive atlas', year: '2026', client: 'Coastal Trust', bg: '#d8d3c6', ink: '#151412', accent: '#c9542f', blurb: 'A living map of a changing coastline — tides, erosion and stories layered into one explorable surface.' },
    { title: 'Northfield Records', mark: 'NRTH FLD', type: 'Label identity', year: '2025', client: 'Northfield', bg: '#1e3a2c', ink: '#ebe5d3', accent: '#d9c36a', blurb: 'Identity and web presence for an independent label, built around a flexible system of sleeves and motion.' },
    { title: 'Oda Ceramics', mark: 'ODA', type: 'E-commerce', year: '2025', client: 'Oda Studio', bg: '#c4512d', ink: '#f4ede1', accent: '#1b1a17', blurb: 'A quiet storefront for handmade ceramics where every object gets room to breathe.' },
    { title: 'Kinetic Type Lab', mark: 'KINE TIC', type: 'WebGL experiment', year: '2024', client: 'Self-initiated', bg: '#242a66', ink: '#e9e7f1', accent: '#f0a8c0', blurb: 'An ongoing playground of shader-driven typography reacting to sound, cursor and scroll.' },
    { title: 'Halden Observatory', mark: 'HAL DEN', type: 'Museum website', year: '2024', client: 'Halden Foundation', bg: '#e9e4d7', ink: '#141414', accent: '#3a5bd9', blurb: 'Digital home for a historic observatory — exhibitions, night programmes and a sky archive.' },
    { title: 'Sunday Garden', mark: 'SUN DAY', type: 'Restaurant', year: '2023', client: 'Sunday Garden', bg: '#121212', ink: '#ece9e2', accent: '#c7de5b', blurb: 'Brand and booking experience for a seasonal restaurant that changes with its garden.' },
  ];

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
      window.__wbSpace = { hs: this.props.heroStart ?? 0.04, hw: this.props.heroSpan ?? 0.16, on: this.props.spaceFlight ?? true, rest: this.props.spaceRest ?? 0.45, warp: this.props.spaceWarp ?? 1, hs: this.props.heroStart ?? 0.04, gs: this.props.galaxyStart ?? 0, gd: this.props.galaxyFade ?? 0.1, see: this.props.galaxyThroughHero ?? 1, bgSpeed: this.props.heroBgFadeSpeed ?? 14 }; }
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
        document.querySelectorAll('[data-avail-dot]').forEach((el) => { el.style.background = on ? '#2fd27a' : '#7a7a80'; el.style.boxShadow = on ? '0 0 6px 1px rgba(47,210,122,0.75)' : 'none'; }); };
      upd(); this._availT = setInterval(upd, 30000); }
    setTimeout(() => this.initAsciiTitle && this.initAsciiTitle(), 900);
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
        if (dead.length && !sessionStorage.getItem('__wbGLre')) { sessionStorage.setItem('__wbGLre', '1'); sessionStorage.setItem('__wbGLy', String(scrollY)); location.reload(); } }, 1500); };
    { const y = sessionStorage.getItem('__wbGLy'); if (y != null) { sessionStorage.removeItem('__wbGLy'); setTimeout(() => scrollTo(0, +y), 600); } setTimeout(() => sessionStorage.removeItem('__wbGLre'), 60000); }
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
    const url = (this.props.soundtrack || '').trim() || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/music.mp3';
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
    let d = (q - o.v) * a; const mx = dt * 1.6; d = Math.max(-mx, Math.min(mx, d));
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
    history.pushState({ work: i }, '', '#work/' + this.projects[i].title.toLowerCase().replace(/\\s+/g, '-'));
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
    { const G = window.__wbGalaxy; [['[data-panel]', 'background'], ['[data-cta-panel]', 'background'], ['[data-about]', 'backgroundColor'], ['[data-footer]', 'background'], ['[data-reach-panel]', 'background']].forEach(([q, k]) => { const el = document.querySelector(q); if (el) el.style[k] = G ? 'transparent' : ''; });
      document.querySelectorAll('[data-panel] > [aria-hidden="true"]').forEach((el) => { if (/linear-gradient/.test(el.style.background)) el.style.display = G ? 'none' : ''; }); }
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
      titleWords: pp.title.split(' '),
      pageTitle: pp.title, pageClient: pp.client, pageType: pp.type, pageYear: pp.year, pageBlurb: pp.blurb, blurbWords: pp.blurb.split(' '),
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
