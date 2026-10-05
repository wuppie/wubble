/* wubble V20 for Webflow — runs the exact Claude Design V13 logic on native Webflow elements.
   Layout/styling lives in Webflow (w13-* classes). Elements the animation drives carry data-w / data-* hooks. */
(function () {
if (window.__wubbleV20) return; window.__wubbleV20 = true;
// ---------- live-only layout: in the Webflow Designer sections stack normally; on the live site the scroll staging switches on ----------
document.documentElement.classList.add('wb-live');
(function () { var L = document.createElement('style'); L.id = 'wb-live-css'; L.textContent = [
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
 console.info('wubble: build 2026-10-02 / V14 focus-pull');
var BASE = (document.currentScript && document.currentScript.dataset.base) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/';
var DEFAULTS = {"displayFont":"Oswald","heroTitleSize":1,"sectionTitleSize":1,"workTitleSize":1,"bodySize":1,"labelSize":11,"ctaScene":"Ascent","transitionSeconds":2.6,"sectionBleed":true,"soundtrack":"","hero3D":true,"handModel":"","sectionRotate":true,"sectionZoom":1,"smoothScroll":true,"scrollLerp":0.08,"bgMode":"Silk","lightIntensity":1,"relief":1,"grain":1.4,"bgSpeed":1,"viewCursor":true,"customCursor":true,"inkLinger":0.6,"curvature":0.18,"ribbonTilt":0.25,"velocityBend":1.1,"hoverDistortion":1.9,"cornerRadius":0.07,"reflections":true,"reflectionStrength":0.1,"showGrid":false,"image1":"","video1":"","image2":"","video2":"https://threejs.org/examples/textures/sintel.mp4","image3":"","video3":"","image4":"","video4":"","image5":"","video5":"","image6":"","video6":"","workLayout":"Ribbon","ringTiltX":0.12,"ringTiltZ":0.06,"workWord":"Work","weaveDepth":0.35,"weaveDrop":0.55,"workWordSize":0.62,"workWordY":-0.04,"workWordX":0,"workWordSpacing":-0.07,"workWordWeight":600,"workWordColor":"#ecebe6","workWordOpacity":1,"workWordShadow":0.6,"astroGlobal":true,"galaxyBg":true,"galaxySize":1.25,"ditherStyle":true,"ditherSize":1,"ditherGain":1.35,"galaxyBright":0.14,"astroBright":0.7,"astroFaceDown":0.85,"astroMouse":1,"galaxyOpacity":1,"heroLight":true,"heroLightBg":"#ffffff","heroLightInk":"#0a0a0a","astroHoverReveal":true,"astroJets":true,"warpAmount":1,"letterStorm":0,"titleMorph":true,"astroFlag":false,"hero3Model":"","ribbonY":-0.4,"reachTitle":"Reach Out","pageBg":"#050505","textColor":"#ecebe6","aboutBg":"#232221","aboutText":"#f4c9c6","footerBg":"#f4f4f2","footerText":"#1a1a19","infoBg":"#f2f1ed","infoText":"#151412","astroHoverLight":1.5};
// ---------- head: fonts, base css, lenis, 3D viewer ----------
var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Syne:wght@500;700;800&family=Space+Grotesk:wght@500;700&family=Unbounded:wght@500;700&family=Inter+Tight:wght@500;700;800&family=Archivo:wght@500;700;900&family=Big+Shoulders+Display:wght@600;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400&display=swap"; document.head.appendChild(lk);
var st = document.createElement('style'); st.textContent = `
html{overflow-x:clip!important;overflow-y:auto!important;height:auto!important;overscroll-behavior:none;-webkit-text-size-adjust:100%;touch-action:pan-y}
body{margin:0;background:var(--bg-page,#050505);height:auto!important;overflow:visible!important;overflow-x:clip!important;overscroll-behavior:none;max-width:100vw}
section{max-width:100vw;overflow-x:clip}
html{background:var(--bg-page,#050505)}
.dc-root{height:auto!important}
a{color:var(--ink,#ecebe6);text-decoration:none}
a:hover{color:#ffffff}
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
var lenisReady = window.Lenis ? Promise.resolve() : loadScript('https://unpkg.com/lenis@1.1.13/dist/lenis.min.js');
var VQ = (document.currentScript && document.currentScript.dataset.v) ? '?v=' + document.currentScript.dataset.v : '';
if (!window.__wubbleViewerPreloaded) loadScript(BASE + 'dither-viewer.js' + VQ, true);
// ---------- hooks: data-w="name" → data-wh (V13 uses empty data-w for word reveals) ----------
function prepHooks(scope) { scope.querySelectorAll('[data-w]').forEach(function (el) { var v = el.getAttribute('data-w'); if (v) { el.setAttribute('data-wh', v); el.removeAttribute('data-w'); } }); }
function boot() {
  var root = document.querySelector('[data-w="root"],[data-wh="root"]'); if (!root) return console.warn('wubble: no [data-w=root]');
  // loader is hidden in the Designer (w13-hidden) so it never covers content while editing; show it on the live site
  document.querySelectorAll('[data-w="loader"],[data-wh="loader"]').forEach(function (el) { el.classList.remove('w13-hidden', 'is-editor-hidden', 'w20-ed-hide'); el.style.removeProperty('display'); });
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
      if (p.bg) { o.bg = p.bg; o.ink = lum(p.bg) > 0.55 ? '#151412' : '#ecebe6'; }
      if (p.title !== d.title) o.mark = p.title.toUpperCase().split(/\s+/).slice(0, 2).join(' ');
      o.cover = p.cover; o.videoUrl = p.video; return o; });
  };
  // ---------- props: defaults + root data-* overrides ----------
  var props = Object.assign({}, DEFAULTS);
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
  window.React = window.React || {}; if (!window.React.createRef) window.React.createRef = function () { return { current: null }; };
  function DCLogic(p) { this.props = p; }
  DCLogic.prototype.setState = function (u, cb) { var patch = typeof u === 'function' ? u(this.state, this.props) : u; if (patch == null) { cb && cb(); return; } this.state = Object.assign({}, this.state, patch); if (cb) this.__cbs.push(cb); this.__schedule(); };
  DCLogic.prototype.forceUpdate = function (cb) { if (cb) this.__cbs.push(cb); this.__schedule(); };
  window.DCLogic = DCLogic;
  var Component = (new Function('DCLogic', 'React', 'BASE', `
class Component extends DCLogic {
  state = { active: 0, time: '', page: null, soundOn: false };
  rollRef = React.createRef(); bleedRef = React.createRef(); bgRef = React.createRef(); gooRef = React.createRef(); inkRef = React.createRef(); closeRef = React.createRef(); loaderRef = React.createRef(); chromeRef = React.createRef(); curtainRef = React.createRef(); hero3dRef = React.createRef(); ctaRef = React.createRef(); astroGRef = React.createRef();
  ctaGlRef = React.createRef(); reachRef = React.createRef(); rayRef = React.createRef(); handRef = React.createRef(); astroRef = React.createRef(); hostRef = React.createRef(); heroRef = React.createRef(); workRef = React.createRef();
  uiRef = React.createRef(); headlineRef = React.createRef(); portraitRef = React.createRef(); pageRef = React.createRef();
  projects = window.__wubbleMerge([
    { title: 'Tidewater Atlas', mark: 'TIDE/ WATER', type: 'Interactive atlas', year: '2026', client: 'Coastal Trust', bg: '#d8d3c6', ink: '#151412', accent: '#c9542f', blurb: 'A living map of a changing coastline — tides, erosion and stories layered into one explorable surface.' },
    { title: 'Northfield Records', mark: 'NRTH FLD', type: 'Label identity', year: '2025', client: 'Northfield', bg: '#1e3a2c', ink: '#ebe5d3', accent: '#d9c36a', blurb: 'Identity and web presence for an independent label, built around a flexible system of sleeves and motion.' },
    { title: 'Oda Ceramics', mark: 'ODA', type: 'E-commerce', year: '2025', client: 'Oda Studio', bg: '#c4512d', ink: '#f4ede1', accent: '#1b1a17', blurb: 'A quiet storefront for handmade ceramics where every object gets room to breathe.' },
    { title: 'Kinetic Type Lab', mark: 'KINE TIC', type: 'WebGL experiment', year: '2024', client: 'Self-initiated', bg: '#242a66', ink: '#e9e7f1', accent: '#f0a8c0', blurb: 'An ongoing playground of shader-driven typography reacting to sound, cursor and scroll.' },
    { title: 'Halden Observatory', mark: 'HAL DEN', type: 'Museum website', year: '2024', client: 'Halden Foundation', bg: '#e9e4d7', ink: '#141414', accent: '#3a5bd9', blurb: 'Digital home for a historic observatory — exhibitions, night programmes and a sky archive.' },
    { title: 'Sunday Garden', mark: 'SUN DAY', type: 'Restaurant', year: '2023', client: 'Sunday Garden', bg: '#121212', ink: '#ecebe6', accent: '#c7de5b', blurb: 'Brand and booking experience for a seasonal restaurant that changes with its garden.' },
  ]);

  initLetterStorm() {
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:30;opacity:0;';
    document.body.appendChild(cv); const g = cv.getContext('2d');
    const mob = innerWidth < 820, N = mob ? 110 : 220, AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const P = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2.2, z: 0.08 + Math.random() * 0.92, ch: AB[(Math.random() * 26) | 0], r: (Math.random() - 0.5) * 1.2, vr: (Math.random() - 0.5) * 0.8, pz: 0 }));
    let W = 0, H = 0, dpr = 1, last = performance.now(), lastP = 0, spd = 0, live = 0, on = false;
    const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = window.__svh || innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); addEventListener('resize', size);
    const fam = () => ((getComputedStyle(document.documentElement).getPropertyValue('--display') || '').trim() || 'Oswald') + ', Helvetica, sans-serif';
    this.letterStorm = () => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const b = (q) => Math.sin(Math.PI * Math.max(0, Math.min(1, q || 0)));
      const pr = (this.rp || 0) + (this.rq || 0) + (this.r3 || 0);
      const dp = (pr - lastP) / Math.max(0.001, dt); lastP = pr;
      const amt = Math.max(b(this.rp), b(this.rq), b(this.r3)) * (this.props.letterStorm ?? 0) * (this.state.page ? 0 : 1);
      live += (amt - live) * (1 - Math.exp(-dt * 4));
      if (live < 0.004) { if (on) { g.clearRect(0, 0, cv.width, cv.height); cv.style.opacity = '0'; on = false; } return; }
      on = true; cv.style.opacity = '1';
      const tgt = (0.12 + Math.min(2.5, Math.abs(dp) * 2.2)) * (dp < -0.002 ? -1 : 1);
      spd += (tgt - spd) * (1 - Math.exp(-dt * 3));
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const f = Math.min(W, H) * 0.55, cx = W / 2, cy = H / 2, F = fam();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#c9c6bd';
      for (const p of P) {
        p.pz = p.z; p.z -= spd * dt * 0.55; p.r += p.vr * dt;
        if (p.z < 0.05) { p.z += 0.95; p.pz = p.z; p.x = (Math.random() - 0.5) * 3; p.y = (Math.random() - 0.5) * 2.2; }
        if (p.z > 1) { p.z -= 0.95; p.pz = p.z; }
        const sx = cx + p.x / p.z * f * 0.5, sy = cy + p.y / p.z * f * 0.5; if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) continue;
        const fs = Math.max(4, 26 / p.z * (mob ? 0.7 : 1)), fog = Math.min(1, (1 - p.z) * 1.4), a = live * fog * (p.z < 0.15 ? p.z / 0.15 : 1);
        if (a < 0.01) continue;
        g.font = '600 ' + fs.toFixed(1) + 'px ' + F;
        const fd = Math.abs(p.z - 0.42), bl = Math.min(mob ? 6 : 10, fd * fd * 60 + (p.z < 0.2 ? (0.2 - p.z) * 40 : 0));
        g.filter = bl > 0.6 ? 'blur(' + bl.toFixed(1) + 'px)' : 'none';
        const gh = Math.min(4, 1 + Math.abs(spd) * 1.6) | 0;
        for (let i = gh; i >= 0; i--) {
          const zz = p.z + (p.pz - p.z) * i * 3, gx = cx + p.x / zz * f * 0.5, gy = cy + p.y / zz * f * 0.5;
          g.globalAlpha = a * (i === 0 ? 0.85 : 0.22 / i);
          g.save(); g.translate(gx, gy); g.rotate(p.r); g.fillText(p.ch, 0, 0); g.restore();
        }
      }
      g.globalAlpha = 1; g.filter = 'none';
    };
  }
  initGsapTitles() {
    const G = window.gsap; if (!G) { this.gtWait = setTimeout(() => this.initGsapTitles(), 120); return; }
    const titles = Array.from(document.querySelectorAll('[data-gt]')).map((el) => {
      const words = Array.from(el.querySelectorAll('[data-gw]')), hero = el.getAttribute('data-gt') === 'hero';
      G.set(words, { yPercent: hero ? 0 : 100, y: 0, rotation: 0, opacity: 1, transform: hero ? 'none' : undefined });
      if (!hero) G.set(words, { yPercent: 100 });
      const chars = [];
      words.forEach((w) => {
        const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT), nodes = []; let nd; while ((nd = tw.nextNode())) if (nd.nodeValue.trim()) nodes.push(nd);
        nodes.forEach((tn) => { const frag = document.createDocumentFragment();
          Array.from(tn.nodeValue).forEach((ch) => { if (!ch.trim()) { frag.appendChild(document.createTextNode(ch)); return; }
            const c = document.createElement('span'); c.setAttribute('data-gc', ''); c.style.cssText = 'display:inline-block;will-change:transform,opacity,filter;'; c.textContent = ch;
            const ang = Math.random() * Math.PI * 2, rad = 0.35 + Math.random() * 0.9;
            c.__v = { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.7, z: Math.random() < 0.65 ? 500 + Math.random() * 1400 : -(300 + Math.random() * 900), rx: (Math.random() - 0.5) * 220, ry: (Math.random() - 0.5) * 260, rz: (Math.random() - 0.5) * 140, d: Math.random() * 0.35 };
            chars.push(c); frag.appendChild(c); });
          tn.parentNode.replaceChild(frag, tn); });
      });
      const at0 = el.getAttribute('data-gt'), prog = at0 === 'hero' ? 'rp' : at0 === '0.35' ? 'rq' : at0 === '1.0' ? 'r3' : at0 === '-0.6' ? 'in3' : null;
      return { el, words, chars, prog, scat: 0, hero, at: hero ? 0 : parseFloat(el.getAttribute('data-gt')) || 0, sec: el.closest('section'), on: hero, tw: null };
    });
    const play = (t, on) => {
      t.on = on; if (t.tw) t.tw.kill();
      // in: rise from below; out: slide back down (same mask), reversed stagger
      t.tw = G.to(on ? t.words : t.words.slice().reverse(), { yPercent: on ? 0 : 100, duration: on ? 1.15 : 0.8, ease: 'circ.inOut', stagger: on ? 0.15 : 0.06, overwrite: true });
    };
    // top title: a random letter squeezes on its own every 4s (same motion as the WORK hover)
    document.querySelectorAll('[data-sqh]').forEach((el) => {
      el.addEventListener('pointerenter', () => G.to(el, { scaleX: 0.7, scaleY: 1.1, duration: 0.9, ease: 'expo.out', overwrite: true }));
      el.addEventListener('pointerleave', () => G.to(el, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)', overwrite: true }));
    });
    const sqEls = Array.from(document.querySelectorAll('[data-sq]')); let lastSq = -1;
    const squeeze = () => {
      if (this.dead) return;
      if (sqEls.length && !document.hidden) {
        let i = Math.floor(Math.random() * sqEls.length); if (i === lastSq && sqEls.length > 1) i = (i + 1 + Math.floor(Math.random() * (sqEls.length - 1))) % sqEls.length; lastSq = i;
        const el = sqEls[i];
        G.timeline({ overwrite: true }).to(el, { scaleX: 0.7, scaleY: 1.1, duration: 0.9, ease: 'expo.out' }).to(el, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'elastic.out(1, 0.55)' }, '+=0.35');
      }
      this.sqT = setTimeout(squeeze, 4000);
    };
    this.sqT = setTimeout(squeeze, 2500);
    let fitW = 0;
    const fitTitles = (force) => { if (!force && innerWidth === fitW) return; fitW = innerWidth; const pad = 2 * Math.max(36, Math.min(72, innerWidth * 0.044));
      document.querySelectorAll('[data-gt]:not([aria-hidden])').forEach((el) => {
        if (el.dataset.fs0 == null) el.dataset.fs0 = el.style.fontSize || ''; el.style.fontSize = el.dataset.fs0; const cs = getComputedStyle(el), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0;
        const avail = (pl + pr > 0 ? el.clientWidth - pl - pr : innerWidth - pad) - 2;
        for (let it = 0; it < 4; it++) {
          const rows = new Map(); el.querySelectorAll('[data-gw]').forEach((w) => { const r = w.parentElement.getBoundingClientRect(); const k = Math.round(r.top); const o = rows.get(k) || { l: 1e9, r: -1e9 }; o.l = Math.min(o.l, r.left); o.r = Math.max(o.r, r.right); rows.set(k, o); });
          let maxW = 0; rows.forEach((o) => { maxW = Math.max(maxW, o.r - o.l); });
          if (maxW <= avail || !maxW) break;
          el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * avail / maxW * 0.985).toFixed(2) + 'px';
        }
      }); };
    fitTitles(true); addEventListener('resize', () => fitTitles()); if (document.fonts) document.fonts.ready.then(() => fitTitles(true));
    [800, 2000, 4000].forEach((t) => setTimeout(() => fitTitles(true), t));
    const tick = () => {
      if (this.dead) return; this.gtRaf = requestAnimationFrame(tick);
      this.letterStorm && this.letterStorm();
      { const hr = this.heroRef.current, hin = hr && hr.firstElementChild, fr = this._hf || (this._hf = document.querySelector('[data-hero-front]'));
        if (hin && fr) { const fi = fr.firstElementChild; fi.style.transform = hin.style.transform; fi.style.opacity = hin.style.opacity;
          const bh = this._hb || (this._hb = document.querySelector('h1[data-gt="hero"]:not([aria-hidden])')), fh = fi.querySelector('h1');
          if (bh && fh) { const cs = getComputedStyle(bh); ['color', 'fontSize', 'fontFamily', 'fontWeight', 'letterSpacing', 'lineHeight', 'textShadow', 'top', 'transform', 'webkitTextStroke'].forEach((k) => { const v = k === 'transform' ? bh.style.transform : cs[k]; if (v != null && fh.style[k] !== v) fh.style[k] = v; });
            const bs = bh.querySelectorAll('span'), fs2 = fh.querySelectorAll('span');
            if (bs.length === fs2.length) for (let i = 0; i < bs.length; i++) { const x = bs[i].style, y = fs2[i].style;
              if (y.transform !== x.transform) y.transform = x.transform; if (y.opacity !== x.opacity) y.opacity = x.opacity;
              if (y.filter !== x.filter) y.filter = x.filter; if (y.clipPath !== x.clipPath) y.clipPath = x.clipPath; if (y.overflow !== x.overflow) y.overflow = x.overflow; }
            if (fh.style.clipPath !== bh.style.clipPath) fh.style.clipPath = bh.style.clipPath; if (fh.style.opacity !== bh.style.opacity) fh.style.opacity = bh.style.opacity; if (fh.style.filter !== bh.style.filter) fh.style.filter = bh.style.filter; } fr.style.visibility = (hr.style.visibility === 'hidden' || this.state.page) ? 'hidden' : 'visible'; } }
      if (!this.gsapReady) return;
      const vh = window.__svh || innerHeight, vw = innerWidth;
      titles.forEach((t) => {
        if (!t.prog) return;
        const raw = t.prog === 'in3' ? 1 - (this.r3 ?? 0) : (this[t.prog] ?? 0);
        const WL = this.workLetters;
        if (t.prog === 'rp' && (this.props.titleMorph ?? true) && WL && WL.length) {
          const mk = Math.max(0, Math.min(1, (raw - 0.38) / 0.42));
          const pre0 = Math.max(0, Math.min(1, (raw - 0.012) / 0.1)), pre = pre0 < 0.02 ? 0 : pre0; if (t.scat0 === mk && t.pre0 === pre && !t.dirty) return; t.scat0 = mk; t.scat = mk; t.pre0 = pre;
          const open = mk > 0.001;
          if (!open || !t.base || t.baseW !== innerWidth) {
            t.chars.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; c.style.filter = ''; });
            t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'hidden'; });
            t.base = t.chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height * 0.72 }; }); t.baseW = innerWidth;
            if (!open) { if (pre > 0) { t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'visible'; }); t.chars.forEach((c) => { c.style.filter = 'blur(' + (pre * 7).toFixed(1) + 'px)'; }); } return; }
          }
          t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'visible'; });
          const n = t.chars.length, nW = WL.length;
          t.chars.forEach((c, i) => {
            const v = c.__v, b = t.base[i], tg = WL[Math.min(nW - 1, Math.floor(i * nW / n))];
            const st = v.d * 0.45, k0 = Math.max(0, Math.min(1, (mk - st) / (1 - st))), k = k0 * k0 * (3 - 2 * k0);
            const arc = Math.sin(Math.PI * k), arc2 = arc * arc;
            const x = (tg.x - b.x) * k + v.x * vw * 0.95 * arc, y = (tg.y - b.y) * k + v.y * vh * 0.85 * arc;
            const z = v.z * 1.1 * arc2, sc2 = Math.max(1, 1 + (tg.h / Math.max(1, b.h) - 1) * k) * (1 + arc * 0.6);
            c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) perspective(900px) translateZ(' + z.toFixed(1) + 'px) rotateX(' + (v.rx * 1.6 * arc).toFixed(1) + 'deg) rotateY(' + (v.ry * 1.6 * arc).toFixed(1) + 'deg) rotateZ(' + (v.rz * 1.6 * arc).toFixed(1) + 'deg) scale(' + sc2.toFixed(3) + ')';
            // depth of field: sharp at start, out of focus in flight (stronger when close to camera), refocus on landing
            const dof = Math.min(1, Math.abs(z) / 700);
            c.style.filter = 'blur(' + (dof * dof * (z > 0 ? 16 : 6) + (1 - k) * 7 + arc * 6).toFixed(1) + 'px)';
            const land = Math.max(0, Math.min(1, (k - 0.82) / 0.18));
            c.style.opacity = (1 - land).toFixed(3);
          });
          return;
        }
        const sc = Math.max(0, Math.min(1, (raw - 0.04) / 0.62));
        if (t.scat0 === sc) return; t.scat0 = sc; t.scat = sc;
        const open = sc > 0.001;
        t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = open ? 'visible' : 'hidden'; });
        t.chars.forEach((c) => {
          if (!open) { c.style.transform = ''; c.style.opacity = ''; c.style.filter = ''; return; }
          const v = c.__v, k0 = Math.max(0, Math.min(1, (sc - v.d * 0.5) / (1 - v.d * 0.5))), k = k0 * k0 * (3 - 2 * k0), kk = k * k;
          const z = v.z * kk, near = Math.max(0, z) / 1900, dof = Math.min(1, Math.abs(z) / 900);
          c.style.transform = 'perspective(900px) translate3d(' + (v.x * vw * 0.55 * k).toFixed(1) + 'px,' + (v.y * vh * 0.55 * k).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateX(' + (v.rx * k).toFixed(1) + 'deg) rotateY(' + (v.ry * k).toFixed(1) + 'deg) rotateZ(' + (v.rz * k).toFixed(1) + 'deg)';
          c.style.opacity = (1 - Math.max(0, (k - 0.55) / 0.45) * (0.6 + near * 0.4)).toFixed(3);
          c.style.filter = 'blur(' + (dof * dof * (z > 0 ? 18 : 7) + k * 0.6).toFixed(1) + 'px)';
        });
      });
      titles.forEach((t) => {
        if (!t.sec) return; const r = t.sec.getBoundingClientRect(), into = -r.top / vh;
        const want = into >= t.at - (t.hero ? 1 : 0.5) && r.bottom > vh * 0.5 && (t.hero || into >= t.at);
        if (want !== t.on) { if (!want && t.scat > 0.05) t.on = false; else play(t, want); }
      });
    };
    tick();
  }
  async initAstroGlobal() {
    const box = this.astroGRef.current; if (!box) return;
    let T3, GL, MO;
    try { [T3, GL, MO] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')]); } catch (e) { return; }
    if (this.dead) return;
    const r = new T3.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.outputColorSpace = T3.SRGBColorSpace; r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = 1.05 * (this.props.astroBright ?? 2.2);
    r.setClearColor(0x000000, 0); r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const sc = new T3.Scene();
    const key = new T3.DirectionalLight(0xfff6ee, 2.2); key.position.set(2.8, 1.3, 0.9); sc.add(key);
    const rim = new T3.DirectionalLight(0xdfe8ff, 2.4); rim.position.set(-2.6, 1.8, -2.0); sc.add(rim);
    const fil = new T3.DirectionalLight(0xc8d4e6, 0.45); fil.position.set(-1.8, -0.6, 1.6); sc.add(fil);
    sc.add(new T3.HemisphereLight(0xcfd8e8, 0x050506, 0.25));
    try { const RE = await import('https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js'); const pm = new T3.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; } catch (e) {}
    const cam = new T3.PerspectiveCamera(24, 1, 0.1, 50); cam.position.set(0, 0, 4.2);
    const loader = new GL.GLTFLoader(); loader.setMeshoptDecoder(MO.MeshoptDecoder);
    try { const DL = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js'); const dl = new DL.DRACOLoader(); dl.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); loader.setDRACOLoader(dl); } catch (e) {}
    let g; const aUrl = (this.props.astroModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/Meshy_AI_Character_output-compressed.glb';
    try { try { g = await loader.loadAsync(aUrl); } catch (e1) { g = await loader.loadAsync(aUrl.replace('https://raw.githubusercontent.com/wuppie/wubble/main/', 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/')); } } catch (e) { console.warn('astronaut failed', e); return; }
    if (this.dead) return;
    const m = g.scene;
    m.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { mt.envMapIntensity = 0.28; if (mt.roughness != null) mt.roughness = Math.max(mt.roughness, 0.45); }); });
    m.updateMatrixWorld(true); const bb = new T3.Box3().setFromObject(m, true), sz = bb.getSize(new T3.Vector3()), cn = bb.getCenter(new T3.Vector3());
    const k = 1 / Math.max(sz.x, sz.y, sz.z); m.position.sub(cn.multiplyScalar(k)); m.scale.setScalar(k);
    const piv = new T3.Group(); piv.add(m); sc.add(piv);
    const FLAG = (() => {
      const g = new T3.Group(); sc.add(g); g.visible = false;
      const clay = new T3.MeshPhysicalMaterial({ color: 0x8a837a, roughness: 0.55, metalness: 0.35, sheen: 0.4, sheenColor: new T3.Color(0xb7a99a) });
      const pole = new T3.Mesh(new T3.CylinderGeometry(0.008, 0.01, 1, 12), clay); pole.position.y = 0.5; g.add(pole);
      const knob = new T3.Mesh(new T3.SphereGeometry(0.017, 16, 12), clay); knob.position.y = 1.0; g.add(knob);
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 320; const x = cv.getContext('2d');
      x.fillStyle = '#d8653a'; x.fillRect(0, 0, 512, 320); x.fillStyle = '#ecebe6'; x.font = '700 230px Oswald, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('W', 256, 172);
      const tx = new T3.CanvasTexture(cv); tx.colorSpace = T3.SRGBColorSpace;
      const geo = new T3.PlaneGeometry(0.42, 0.26, 24, 10); geo.translate(0.21, 0, 0);
      const base = geo.attributes.position.array.slice();
      const cloth = new T3.Mesh(geo, new T3.MeshStandardMaterial({ map: tx, roughness: 0.9, side: T3.DoubleSide }));
      cloth.position.set(0.008, 0.86, 0); g.add(cloth);
      const st = { p: 0 }, hp = new T3.Vector3();
      return (tt, k, hand, sca) => {
        st.p += (k - st.p) * 0.08; const p = st.p;
        g.visible = p > 0.005; if (!g.visible) return;
        const drop = Math.max(0, Math.min(1, p / 0.55)), dE = 1 - Math.pow(1 - drop, 3), unf = Math.max(0, Math.min(1, (p - 0.45) / 0.55));
        if (!hand) { g.visible = false; return; }
        hand.getWorldPosition(hp);
        const S = sca * 1.25; g.scale.set(S, S * (0.05 + 0.95 * dE), S);
        // grip ~38% up the pole, in his hand; planting = pole pushes down through the grip then settles upright
        const grip = 0.38 + (1 - dE) * 0.25;
        g.rotation.set(0, -0.45, (1 - dE) * 0.35 + Math.sin(Math.max(0, dE - 0.9) * 30) * 0.02 * (1 - unf));
        g.position.set(hp.x, hp.y - grip * S * (0.05 + 0.95 * dE), hp.z + 0.02);
        const a = geo.attributes.position.array;
        for (let i = 0; i < a.length; i += 3) { const u = base[i] / 0.42;
          a[i] = base[i] * (0.15 + 0.85 * unf);
          a[i + 2] = Math.sin(u * 7 - tt * 2.4) * 0.03 * u * unf + Math.sin(u * 3 - tt * 1.3) * 0.015 * u;
          a[i + 1] = base[i + 1] * (0.3 + 0.7 * unf) - u * (1 - unf) * 0.08; }
        geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
      };
    })();
    // rig: procedural zero-g motion per bone (no baked clips) — extremities drift more, each bone on its own slow phase
    m.traverse((o) => { if (o.isSkinnedMesh) o.frustumCulled = false; });
    m.updateMatrixWorld(true);
    const bb2 = new T3.Box3().setFromObject(m), H2 = Math.max(0.001, bb2.max.y - bb2.min.y), cx2 = (bb2.min.x + bb2.max.x) / 2;
    const RIG = []; const wp = new T3.Vector3();
    m.traverse((o) => {
      if (!o.isBone) return;
      let d = 0, p = o.parent; while (p && p.isBone) { d++; p = p.parent; }
      o.getWorldPosition(wp); const ny = (wp.y - bb2.min.y) / H2, nx = (wp.x - cx2) / H2;
      const kind = d === 0 ? 'root' : ny > 0.74 && Math.abs(nx) < 0.16 ? 'head' : ny < 0.45 ? 'leg' : Math.abs(nx) > 0.16 ? 'arm' : 'core';
      const h = (RIG.length * 0.6180339) % 1;
      const amp = kind === 'root' || kind === 'head' || kind === 'core' ? 0 : kind === 'arm' ? 0.13 : kind === 'leg' ? 0.1 : 0;
      const sub = (b) => { let m2 = 0; b.children.forEach((c) => { if (c.isBone) m2 = Math.max(m2, 1 + sub(c)); }); return m2; };
      const tip = sub(o) <= 2 && kind !== 'core';
      RIG.push({ tip, b: o, q0: o.quaternion.clone(), kind, amp: tip ? 0 : amp * Math.min(1.1, 0.7 + d * 0.06), f: 0.22 + h * 0.25, ph: h * 6.283, side: Math.sign(nx) || 1 });
    });
    // wave rig: pick the upper arm + forearm on one side; rotation axes are solved in each bone's parent space
    const WAVE = (() => {
      // find the real arm chain from the skeleton: highest-reaching hand leaf on +x, walk up to the spine,
      // upper arm = shoulder joint (highest joint on that chain away from the spine), forearm = its child
      const pos = new Map(); const v = new T3.Vector3();
      RIG.forEach((r0) => { r0.b.getWorldPosition(v); pos.set(r0.b, { nx: (v.x - cx2) / H2, ny: (v.y - bb2.min.y) / H2 }); });
      const leaves = RIG.filter((r0) => !r0.b.children.some((c) => c.isBone) && pos.get(r0.b).ny > 0.3 && pos.get(r0.b).nx > 0.05);
      if (!leaves.length) return null;
      const leaf = leaves.reduce((p, q) => pos.get(q.b).nx > pos.get(p.b).nx ? q : p);
      const chain = []; let bn = leaf.b; while (bn && bn.isBone) { chain.push(bn); bn = bn.parent; }
      const armJ = chain.filter((x) => pos.get(x) && pos.get(x).nx >= 0.07);
      if (armJ.length < 2) return null;
      const shoulder = armJ.reduce((p, q) => pos.get(q).ny > pos.get(p).ny ? q : p);
      const idx = chain.indexOf(shoulder), elbowB = chain[idx - 1], wristB = chain[idx - 2];
      const upper = RIG.find((r0) => r0.b === shoulder), fore = RIG.find((r0) => r0.b === elbowB) || null;
      if (!upper) return null; upper.side = 1;
      const hand = wristB ? RIG.find((r0) => r0.b === wristB) || null : null;
      // shaka: find finger chains under the wrist; thumb = most separated base, pinky = farthest from thumb, rest curl
      let SH = null;
      if (hand) {
        // walk down single-child bones (wrist → palm) until the bone where the fingers branch
        let palm = hand.b; for (let g = 0; g < 4; g++) { const kids = palm.children.filter((c) => c.isBone); if (kids.length === 1) palm = kids[0]; else break; }
        const bases = palm.children.filter((c) => c.isBone);
        if (bases.length >= 3) {
          const chainOf = (b0) => { const out = []; let x = b0; while (x) { out.push(x); x = x.children.find((c) => c.isBone); } return out; };
          const bp = bases.map((b0) => b0.getWorldPosition(new T3.Vector3()));
          const sepOf = (i) => Math.min(...bp.map((p, j) => j === i ? 1e9 : p.distanceTo(bp[i])));
          let ti = 0; bases.forEach((_, i) => { if (sepOf(i) > sepOf(ti)) ti = i; });
          let pi = -1; bases.forEach((_, i) => { if (i !== ti && (pi < 0 || bp[i].distanceTo(bp[ti]) > bp[pi].distanceTo(bp[ti]))) pi = i; });
          const curlIdx = bases.map((_, i) => i).filter((i) => i !== ti && i !== pi);
          const spreadW = new T3.Vector3().subVectors(bp[pi], bp[curlIdx[0]]).normalize();
          const curls = [];
          curlIdx.forEach((i) => chainOf(bases[i]).forEach((bn, k, arr) => {
            const r0 = RIG.find((x) => x.b === bn); if (!r0) return;
            const pq0 = new T3.Quaternion(); bn.parent.getWorldQuaternion(pq0);
            const ax = spreadW.clone().applyQuaternion(pq0.clone().invert()).normalize();
            // pick the curl direction that moves the fingertip toward the body (palm side in rest pose)
            const tip = arr[arr.length - 1], t0 = tip.getWorldPosition(new T3.Vector3()).x;
            const q1 = new T3.Quaternion().setFromAxisAngle(ax, 0.6).multiply(r0.q0); bn.quaternion.copy(q1); m.updateMatrixWorld(true);
            const t1 = tip.getWorldPosition(new T3.Vector3()).x; bn.quaternion.copy(r0.q0); m.updateMatrixWorld(true);
            const sign = Math.abs(t1 - cx2) < Math.abs(t0 - cx2) ? 1 : -1;
            curls.push({ r0, ax, ang: sign * (k === 0 ? 1.35 : 1.15) });
          }));
          const keep = [ti, pi].flatMap((i) => chainOf(bases[i])).map((bn) => RIG.find((x) => x.b === bn)).filter(Boolean);
          SH = { curls, keep };
        }
      }
      return { upper, fore, hand, SH };
    })();
    // boot thrusters: random bursts of hot exhaust from both feet, emitted in world space so the trail stays behind him
    const JET = (() => {
      const v = new T3.Vector3(), info = RIG.map((r0) => { r0.b.getWorldPosition(v); return { r0, nx: (v.x - cx2) / H2, ny: (v.y - bb2.min.y) / H2, leaf: !r0.b.children.some((c) => c.isBone) }; });
      const lowLeaves = info.filter((i) => i.leaf && i.ny < 0.3).sort((a2, b2) => a2.ny - b2.ny);
      const pick = []; for (const i of lowLeaves) { if (!pick.length || Math.abs(i.nx - pick[0].nx) > 0.06) pick.push(i); if (pick.length === 2) break; }
      const feet = pick.map((i) => ({ b: i.r0.b, on: false, t: Math.random() * 1.5, amt: 0 }));
      if (!feet.length) return null;
      const N = 700, pos = new Float32Array(N * 3), age = new Float32Array(N), size = new Float32Array(N);
      const vel = new Float32Array(N * 3), life = new Float32Array(N); age.fill(1);
      const geo = new T3.BufferGeometry();
      geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); geo.setAttribute('aAge', new T3.BufferAttribute(age, 1)); geo.setAttribute('aSize', new T3.BufferAttribute(size, 1));
      const mat = new T3.ShaderMaterial({ transparent: true, depthWrite: false, blending: T3.AdditiveBlending, uniforms: { uPR: { value: Math.min(devicePixelRatio || 1, 1.5) } },
        vertexShader: 'attribute float aAge; attribute float aSize; uniform float uPR; varying float vAge; void main(){ vAge = aAge; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * (1.0 - aAge * 0.6) * uPR * 320.0 / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'varying float vAge; void main(){ if (vAge >= 1.0) discard; float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); vec3 hot = mix(vec3(1.0), vec3(0.55), smoothstep(0.0, 0.5, vAge)); hot = mix(hot, vec3(0.18), smoothstep(0.5, 1.0, vAge)); float f = (1.0 - vAge); gl_FragColor = vec4(hot * a * f * 1.4, a * f); }' });
      const pts = new T3.Points(geo, mat); pts.frustumCulled = false; sc.add(pts);
      const fGeo = new T3.CylinderGeometry(0.012, 0.045, 1, 20, 24, true); fGeo.translate(0, -0.5, 0);
      const fMat = new T3.ShaderMaterial({ transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide, uniforms: { uT: { value: 0 }, uA: { value: 0 } },
        vertexShader: 'varying vec2 vUv; varying float vF; void main(){ vUv = uv; vec3 n = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform float uT; uniform float uA; varying vec2 vUv; varying float vF;' +
          'float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }' +
          'float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }' +
          'void main(){ float y = 1.0 - vUv.y; float a = vUv.x * 6.2832;' +
          ' float turb = n(vec2(a * 0.6, y * 7.0 - uT * 16.0)) * 0.6 + n(vec2(a * 1.7, y * 15.0 - uT * 28.0)) * 0.4;' +
          ' float core = pow(1.0 - y, 1.6) * smoothstep(0.0, 0.05, y);' +
          ' float body = core * smoothstep(0.15 + y * 0.55, 0.9, turb + (1.0 - y) * 0.45);' +
          ' float edge = pow(vF, 1.4);' +
          ' float I = body * edge * uA * 1.8;' +
          ' vec3 c = mix(vec3(1.0), vec3(0.5), smoothstep(0.1, 0.8, y));' +
          ' gl_FragColor = vec4(c * I, I); }' });
      const flames = feet.map(() => { const fm = new T3.Mesh(fGeo, fMat.clone()); fm.frustumCulled = false; sc.add(fm); return fm; });
      const UP = new T3.Vector3(0, -1, 0);
      let head = 0; const fp = new T3.Vector3(), pp = new T3.Vector3(), dir = new T3.Vector3(), toe = new T3.Vector3(), knee = new T3.Vector3();
      return (dt, boost) => { const now = performance.now();
        piv.updateMatrixWorld(true);
        for (const f of feet) {
          f.t -= dt; if (f.t <= 0) { f.on = !f.on; f.t = f.on ? 0.4 + Math.random() * 1.2 : 0.4 + Math.random() * 1.6; }
          f.amt += ((f.on ? 1 : 0) - f.amt) * (1 - Math.exp(-dt * (f.on ? 14 : 5)));
          const rate = f.amt * (60 + boost * 110); let n = rate * dt + Math.random(); n = Math.floor(n);
          // heel: behind the ankle (opposite the toe); thrust follows the shin line out of the heel
          f.b.getWorldPosition(toe); f.b.parent.getWorldPosition(pp); (f.b.parent.parent && f.b.parent.parent.isBone ? f.b.parent.parent : f.b.parent).getWorldPosition(knee);
          const fl = toe.distanceTo(pp); dir.subVectors(pp, knee).normalize(); fp.copy(pp).addScaledVector(dir, fl * 0.75);
          { const fm = flames[feet.indexOf(f)], flick = 0.85 + Math.sin(now * 0.031 + feet.indexOf(f) * 2.0) * 0.08 + Math.random() * 0.12;
            const L = (0.28 + boost * 0.35) * PH.s * f.amt * flick;
            fm.visible = f.amt > 0.02; fm.position.copy(fp); fm.quaternion.setFromUnitVectors(UP, dir); fm.scale.set(PH.s * (0.5 + f.amt * 0.5), Math.max(0.001, L), PH.s * (0.5 + f.amt * 0.5));
            fm.material.uniforms.uT.value = now / 1000; fm.material.uniforms.uA.value = f.amt; }
          if (n <= 0) continue;
          for (let k = 0; k < n; k++) {
            const i = head; head = (head + 1) % N;
            pos[i * 3] = fp.x; pos[i * 3 + 1] = fp.y; pos[i * 3 + 2] = fp.z;
            const sp = (0.9 + Math.random() * 0.8) * (0.7 + f.amt * 0.6), j = 0.22;
            vel[i * 3] = (dir.x + (Math.random() - 0.5) * j) * sp; vel[i * 3 + 1] = (dir.y + (Math.random() - 0.5) * j) * sp; vel[i * 3 + 2] = (dir.z + (Math.random() - 0.5) * j) * sp;
            age[i] = 0; life[i] = 0.5 + Math.random() * 0.6; size[i] = (0.04 + Math.random() * 0.05) * PH.s;
          }
        }
        for (let i = 0; i < N; i++) {
          if (age[i] >= 1) continue;
          age[i] = Math.min(1, age[i] + dt / life[i]);
          const drag = Math.exp(-dt * 2.2); vel[i * 3] *= drag; vel[i * 3 + 1] *= drag; vel[i * 3 + 2] *= drag;
          pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
        geo.attributes.position.needsUpdate = true; geo.attributes.aAge.needsUpdate = true; geo.attributes.aSize.needsUpdate = true;
      };
    })();
    const wq = new T3.Quaternion(), wq2 = new T3.Quaternion();
    // human wave, solved by direction (not raw bone axes): upper arm out to the side at shoulder height,
    // forearm vertical with the palm side to camera, forearm rocks left-right around the elbow, wrist + fingers stay rigid
    const mqI = new T3.Quaternion(), pq = new T3.Quaternion(), dv = new T3.Vector3(), rd = new T3.Vector3(), dq = new T3.Quaternion(), tq2 = new T3.Quaternion();
    const kid = (r) => r && RIG.find((r0) => r0.b.parent === r.b) || null;
    const aim = (r, child, dirModel, h) => {
      if (!r || !child || h < 0.001) return;
      m.getWorldQuaternion(mqI); mqI.invert();
      r.b.parent.getWorldQuaternion(pq); pq.premultiply(mqI).invert();
      dv.copy(dirModel).normalize().applyQuaternion(pq);
      rd.copy(child.b.position).normalize().applyQuaternion(r.q0);
      dq.setFromUnitVectors(rd, dv); tq2.copy(dq).multiply(r.q0);
      r.b.quaternion.slerp(tq2, h); r.b.updateMatrixWorld(true);
    };
    const DU = new T3.Vector3(), DF = new T3.Vector3();
    const LIMBS = (() => {
      const v = new T3.Vector3(), P = new Map(); RIG.forEach((r0) => { r0.b.getWorldPosition(v); P.set(r0.b, { nx: (v.x - cx2) / H2, ny: (v.y - bb2.min.y) / H2 }); });
      const get = (b) => RIG.find((r0) => r0.b === b);
      const chainUp = (b) => { const c = []; while (b && b.isBone) { c.push(b); b = b.parent; } return c; };
      const out = [];
      [1, -1].forEach((sd) => {
        const hands = RIG.filter((r0) => !r0.b.children.some((c) => c.isBone) && P.get(r0.b).ny > 0.3 && P.get(r0.b).nx * sd > 0.04);
        if (hands.length) {
          const h = hands.reduce((p, q) => P.get(q.b).nx * sd > P.get(p.b).nx * sd ? q : p), ch = chainUp(h.b);
          const armJ = ch.filter((x) => P.get(x) && P.get(x).nx * sd >= 0.07);
          if (armJ.length >= 2) { const sh = armJ.reduce((p, q) => P.get(q).ny > P.get(p).ny ? q : p), i = ch.indexOf(sh);
            if (i >= 3) out.push({ type: 'arm', sd, up: get(ch[i - 1]), lo: get(ch[i - 2]), loC: get(ch[i - 3]) }); }
        }
      });
      const feet = RIG.filter((r0) => !r0.b.children.some((c) => c.isBone) && P.get(r0.b).ny < 0.3).sort((a, b) => P.get(a.b).ny - P.get(b.b).ny);
      const used = []; for (const f of feet) { if (used.length && Math.abs(P.get(f.b).nx - P.get(used[0].b).nx) < 0.06) continue; used.push(f); if (used.length === 2) break; }
      used.forEach((f) => { const ch = chainUp(f.b); if (ch.length >= 4) out.push({ type: 'leg', sd: Math.sign(P.get(f.b).nx) || 1, up: get(ch[3]), lo: get(ch[2]), loC: get(ch[1]) }); });
      return out.filter((l) => l.up && l.lo && l.loC);
    })();
    const FA = new T3.Vector3(), FB = new T3.Vector3();
    const applyFall = (tt, h) => {
      if (h < 0.001) return;
      for (const L of LIMBS) {
        const sd = L.sd, ph = sd > 0 ? 0 : 1.9;
        if (L.type === 'arm') {
          // arms flung up and out, slow paddling circles as he tries to stabilise
          FA.set(sd * 0.95, 0.35 + Math.sin(tt * 0.55 + ph) * 0.1, 0.15 + Math.cos(tt * 0.5 + ph) * 0.1);
          FB.set(sd * 0.85, 0.45 + Math.sin(tt * 0.55 + ph + 0.8) * 0.08, 0.25);
        } else {
          // legs trail and bicycle-kick out of phase, knees bent
          FA.set(sd * 0.42, -0.85, 0.15 + Math.sin(tt * 0.6 + ph) * 0.12);
          FB.set(sd * 0.3, -0.9, -0.25 + Math.sin(tt * 0.6 + ph + 1.2) * 0.1);
        }
        aim(L.up, L.lo, FA, h * 0.55); aim(L.lo, L.loC, FB, h * 0.45);
      }
    };
    const applyWave = (tt, h) => {
      if (!WAVE || h < 0.001) return;
      for (const r0 of RIG) if (r0.tip) r0.b.quaternion.slerp(r0.q0, h);
      // whole arm + hand move as one rigid piece: raised up-and-out, swinging left↔right from the shoulder
      const sd = WAVE.upper.side, sw = 0; // static shaka pose — no waving
      if (WAVE.fore) WAVE.fore.b.quaternion.slerp(WAVE.fore.q0, h);
      for (const r0 of RIG) { let p = r0.b.parent, inArm = false; while (p && p.isBone) { if (p === WAVE.upper.b) { inArm = true; break; } p = p.parent; } if (inArm) r0.b.quaternion.slerp(r0.q0, h); }
      // upper arm: out ~55° from the torso, a bit forward (elbow toward the viewer)
      // keep the upper arm close to its rest pose (the auto-rig's shoulder weights collapse on big rotations):
      // only a small lift out from the body; the elbow does the real work
      { const rest = new T3.Vector3().copy(WAVE.fore.b.position).normalize().applyQuaternion(WAVE.upper.q0);
        WAVE.upper.b.parent.getWorldQuaternion(pq); m.getWorldQuaternion(mqI); pq.premultiply(mqI.invert()); rest.applyQuaternion(pq);
        DU.set(sd * 0.55, -0.8, 0.06).normalize(); DU.lerp(rest.normalize(), 0.35); }
      aim(WAVE.upper, WAVE.fore, DU, h);
      // forearm: bent up beside the head, rocking left↔right from the elbow; hand follows rigidly
      DF.set(sd * 0.04 + sw, 1.0, 0.02); // forearm upright, hand at head height
      if (WAVE.hand) aim(WAVE.fore, WAVE.hand, DF, h);
      if (WAVE.SH) {
        for (const k0 of WAVE.SH.keep) k0.b.quaternion.slerp(k0.q0, h);
        for (const c of WAVE.SH.curls) { dq.setFromAxisAngle(c.ax, c.ang * h); c.r0.b.quaternion.copy(dq).multiply(c.r0.q0); }
      }
    };
    const rq = new T3.Quaternion(), re = new T3.Euler();
    const poseRig = (tt, tumble) => {
      for (const r0 of RIG) {
        if (!r0.amp) continue;
        const k = r0.kind === 'arm' || r0.kind === 'leg' ? 1 + tumble * 0.5 : 1;
        const a = r0.amp * k, w = tt * 6.283 * r0.f + r0.ph;
        re.set(Math.sin(w) * a, Math.sin(w * 0.73 + 1.3) * a * 0.7, Math.sin(w * 0.57 + 2.1) * a * 0.8 * r0.side);
        rq.setFromEuler(re); r0.b.quaternion.copy(r0.q0).multiply(rq);
      }
    };
    const size = () => { const w = innerWidth, h = window.__svh || innerHeight; r.setPixelRatio(Math.min(devicePixelRatio || 1, this.lowPower ? 1 : 1.5)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const art = new T3.WebGLRenderTarget(4, 4, { type: T3.HalfFloatType });
    const qS = new T3.Scene(), qC = new T3.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const qM = new T3.ShaderMaterial({ transparent: true, uniforms: { tA: { value: art.texture }, uH: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: 'uniform sampler2D tA; uniform float uH; varying vec2 vUv; ' + this.ditherGLSL(2.0) + ' void main(){ vec4 c = texture2D(tA, vUv); vec3 rgb = c.rgb / max(c.a, 0.001); rgb = pow(rgb, vec3(1.0 / 2.2)); rgb = rgb * 1.3 / (1.0 + rgb * 0.55) + 0.02; float a = step(dqB8(gl_FragCoord.xy / 2.0) * 0.85 + 0.08, c.a); float lum = dot(rgb, vec3(0.299, 0.587, 0.114)); float warm = smoothstep(0.02, 0.14, rgb.r - rgb.b); float lv = lum * (1.0 - 0.7 * warm); float lvL = clamp(lv * ' + (this.props.astroHoverLight ?? 1.5).toFixed(2) + ', 0.0, 1.0); vec3 photo = mix(vec3(0.07, 0.075, 0.085), vec3(0.86, 0.88, 0.92), pow(lvL, 1.15)) + vec3(0.9, 0.92, 0.95) * pow(lvL, 5.0) * 0.45 * (1.0 - warm); photo = clamp(photo, 0.0, 1.0); float rv = step(dqB8(gl_FragCoord.xy / 2.0) + 0.001, uH); gl_FragColor = vec4(mix(DQ(rgb), photo, rv), a); }' });
    qS.add(new T3.Mesh(new T3.PlaneGeometry(2, 2), qM));
    const dOn = this.props.ditherStyle ?? true;
    size(); addEventListener('resize', size);
    // storyline keyframes (screen units: x,y in -1..1, s = scale)
    const K = [{ x: 0, y: -0.04, s: 1.45, ry: -0.5 }, { x: 0.0, y: 0.02, s: (innerWidth < 820 ? 1.6 : 1.3), ry: -0.5 }, { x: -0.46, y: 0.0, s: 0.62, ry: 0.6 }, { x: 0.42, y: 0.08, s: 0.56, ry: -0.4 }];
    const ss = (t) => t * t * (3 - 2 * t), eIn = (t) => t * t * t, eOut = (t) => 1 - Math.pow(1 - t, 3);
    const t0 = performance.now(); let shown = false;
    const ms = { x: 0, y: 0, sx: 0, sy: 0, on: false }; addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; ms.on = true; ms.x = e.clientX / innerWidth * 2 - 1; ms.y = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) ms.on = false; }); addEventListener('blur', () => { ms.on = false; });
    // physical zero-g model: scroll sets a target; the body follows with mass (spring-damper), leans into its motion,
    // carries angular momentum from scroll speed, and a lagging follow-camera adds perspective
    // hover: pixel-dissolve from the dither look back to the full render, and out again
    const hRay = new T3.Raycaster(), hN = new T3.Vector2(); let hOn = false, hFrame = 0, tapOn = false, tapT = null; const hv = { v: 0 };
    // touch: tap the astronaut to toggle the reveal (auto-releases after a few seconds)
    addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || this.state.page) return;
      const tn = new T3.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), tr = new T3.Raycaster();
      tr.setFromCamera(tn, cam); piv.updateMatrixWorld();
      const hit = tr.intersectObject(piv, true).length > 0;
      tapOn = hit ? !tapOn : false; clearTimeout(tapT); if (tapOn) tapT = setTimeout(() => { tapOn = false; }, 4500);
    }, { passive: true });
    const setH = (on) => { if (on === hOn) return; hOn = on; const G = window.gsap; if (G) G.to(hv, { v: on ? 1 : 0, duration: on ? 0.9 : 1.1, ease: on ? 'power2.out' : 'power2.inOut', overwrite: true }); else hv.v = on ? 1 : 0; };
    const PH = { x: K[0].x, y: K[0].y, vx: 0, vy: 0, s: K[0].s, spin: 0, spinV: 0, lastT: 0, lastU: 0, q: new T3.Quaternion(), camX: 0, camY: 0, camZ: 4.2, roll: 0 };
    const tq = new T3.Quaternion(), te = new T3.Euler();
    const healPH = () => {
      const bad = ['x', 'y', 'vx', 'vy', 's', 'spin', 'spinV', 'lastU', 'camX', 'camY', 'camZ', 'roll', 'tq', 'lastRq'].some((k) => PH[k] != null && !Number.isFinite(PH[k]));
      const q0 = piv.quaternion, p0 = piv.position;
      if (bad || ![q0.x, q0.y, q0.z, q0.w, p0.x, p0.y, p0.z, piv.scale.x].every(Number.isFinite) || piv.scale.x < 0.05) {
        Object.assign(PH, { x: K[0].x, y: K[0].y, vx: 0, vy: 0, s: K[0].s, spin: 0, spinV: 0, lastU: 0, camX: 0, camY: 0, camZ: 4.2, roll: 0, tq: 0, lastRq: undefined });
        piv.quaternion.identity(); piv.position.set(0, 0, 0); piv.scale.setScalar(K[0].s);
      }
    };
    const loop = () => {
      if (this.dead) return; this.astroGRaf = requestAnimationFrame(loop);
      healPH();
      try { step(); } catch (e) {
        if (!this._astroErrN || this._astroErrN < 3) { this._astroErrN = (this._astroErrN || 0) + 1; console.warn('astronaut frame error', e); }
        healPH();
        const rq0 = this.rq || 0, r30 = this.r3 || 0, show0 = (!this.state.page || this.closing) && rq0 < 0.78 && r30 < 0.5;
        box.style.opacity = show0 ? '1' : '0'; box.style.filter = ''; box.style.zIndex = '1';
        try { r.setRenderTarget(null); r.render(sc, cam); } catch (e2) {}
      }
    };
    const step = () => {
      const now = performance.now(), dt = Math.min(0.05, PH.lastT ? (now - PH.lastT) / 1000 : 0.016); PH.lastT = now;
      const rp = this.rp || 0, rq = this.rq || 0, r3 = this.r3 || 0;
      let A, B, t;
      let exitU = 0;
      if (rq > 0.0005 || r3 > 0.0005) { A = K[1]; B = { x: K[0].x, y: 0.3, s: K[0].s, ry: K[1].ry }; t = Math.min(1, rq / 0.7); { const e0 = Math.max(0, Math.min(1, (rq - 0.04) / 0.72)); exitU = e0 * e0 * (3 - 2 * e0); } } else { A = K[0]; B = K[1]; t = (rp - 0.08) / 0.9; }
      { const rv = Math.abs(rq - (PH.lastRq ?? rq)) / Math.max(dt, 0.001); PH.lastRq = rq; const tg = rq > 0.0005 && r3 < 0.0005 ? Math.min(1, rv * 3) : 0; PH.tq = (PH.tq || 0) + (tg - (PH.tq || 0)) * (1 - Math.exp(-dt * (tg > (PH.tq || 0) ? 4 : 1.5))); }
      const tumbleQ = PH.tq;
      t = Math.max(0, Math.min(1, t));
      const u = ss(t), dip = Math.sin(Math.PI * t);
      let tx = A.x + (B.x - A.x) * u + Math.sin(t * 5.2) * dip * 0.08, ty = A.y + (B.y - A.y) * u - dip * 0.3;
      const ts = A.s + (B.s - A.s) * u;
      const lim = 0.62 - ts * 0.12; ty = Math.max(-lim, Math.min(lim, ty)) + exitU * 3.4; tx = Math.max(-0.7, Math.min(0.7, tx));
      // spring-damper (slightly under-damped → soft overshoot, never snappy)
      const k = 7.5, c = 2 * Math.sqrt(k) * 0.82;
      PH.vx += ((tx - PH.x) * k - PH.vx * c) * dt; PH.vy += ((ty - PH.y) * k - PH.vy * c) * dt;
      PH.x += PH.vx * dt; PH.y += PH.vy * dt; PH.s += (ts - PH.s) * (1 - Math.exp(-dt * 2.2));
      // angular momentum from scroll speed, slowly bleeding off
      const du = (u - PH.lastU) / Math.max(dt, 0.001); PH.lastU = u;
      PH.spinV += du * 0.55 * dt * 60 * 0.016; PH.spinV *= Math.exp(-dt * 0.9); PH.spin += PH.spinV * dt + dt * 0.9 * tumbleQ;
      const speed = Math.min(1, Math.hypot(PH.vx, PH.vy) * 1.6), idle = 1 - speed;
      const tt = (now - t0) / 1000;
      poseRig(tt, speed * 0.8 * (1 - hv.v)); // no arm gesture on hover
      applyFall(tt, Math.max(rq > 0.0005 ? 0 : ss(Math.min(1, Math.sin(Math.PI * t) * 1.6)), tumbleQ) * (1 - hv.v));
      ms.sx += (ms.x - ms.sx) * 0.035; ms.sy += (ms.y - ms.sy) * 0.035; const mk = this.props.astroMouse ?? 1;
      const halfH = Math.tan(12 * Math.PI / 180) * 4.2, halfW = halfH * cam.aspect;
      const wx = PH.x * halfW + ms.sx * 0.1 * mk, wy = PH.y * halfH + Math.sin(tt * 0.62) * 0.03 * idle + ms.sy * 0.06 * mk;
      piv.position.set(wx, wy, 0);
      piv.scale.setScalar(PH.s * (cam.aspect < 0.8 ? 0.75 : 1) * (1 - 0.25 * (PH.exitU || 0)));
      if (this.props.astroFlag ?? false) FLAG(tt, (rq > 0.0005 || r3 > 0.0005) ? 1 : Math.max(0, Math.min(1, (rp - 0.86) / 0.14)), (() => { const HL = LIMBS.find((l) => l.type === 'arm' && l.sd > 0) || LIMBS.find((l) => l.type === 'arm'); return HL ? HL.loC.b : null; })(), PH.s * (cam.aspect < 0.8 ? 0.75 : 1));
      // orientation: face-down with scroll, lean into velocity, keep spin from momentum; slerp gives the body inertia
      const tumbleP = Math.max(0, Math.min(1, (t - 0.08) / 0.72)), tumbleA = (tumbleP - Math.sin(tumbleP * Math.PI * 2) / (Math.PI * 2)) * Math.PI * 2;
      const fd = tumbleA + (this.props.astroFaceDown ?? 0.85) * dip * (1 - Math.sin(Math.PI * tumbleP));
      const ry = A.ry + (B.ry - A.ry) * u + PH.spin;
      te.set(0.15 + fd - PH.vy * 0.35 + Math.sin(tt * 0.31) * 0.05 * idle - ms.sy * 0.18 * mk,
             ry + Math.sin(tt * 0.19) * 0.18 * idle + ms.sx * 0.35 * mk,
             -PH.vx * 0.45 + Math.sin(tt * 0.37) * 0.06 * idle + dip * Math.sin(t * Math.PI * 1.5) * 0.7);
      // hover: turn to face the camera
      if (hv.v > 0.001) te.set(te.x * (1 - hv.v), te.y * (1 - hv.v) + ms.sx * 0.15 * hv.v, te.z * (1 - hv.v));
      tq.setFromEuler(te); piv.quaternion.slerp(tq, 1 - Math.exp(-dt * (2.4 + hv.v * 2)));
      // follow camera: trails the body, pushes back + widens a touch while falling, rolls with sideways drift
      const fall = Math.min(1, speed * 1.2);
      const camF = 1 - exitU; PH.exitU = exitU; PH.camX += (wx * 0.28 * camF - PH.camX) * (1 - Math.exp(-dt * 1.6)); PH.camY += (wy * 0.28 * camF - PH.camY) * (1 - Math.exp(-dt * 1.6));
      PH.camZ += (4.2 - PH.camZ) * (1 - Math.exp(-dt * 1.4)); PH.roll += (-PH.vx * 0.08 - PH.roll) * (1 - Math.exp(-dt * 2));
      cam.position.set(PH.camX, PH.camY, PH.camZ); cam.lookAt(wx * 0.45 * camF, wy * 0.45 * camF, 0); cam.rotateZ(PH.roll);
      const fov = 24; if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
      if ((++hFrame & 3) === 0) { hN.set(ms.x, ms.y); hRay.setFromCamera(hN, cam); piv.updateMatrixWorld(); setH(!this.state.page && rp < 0.05 && rq < 0.0005 && (tapOn || (ms.on && !matchMedia('(pointer: coarse)').matches && hRay.intersectObject(piv, true).length > 0))); }
      qM.uniforms.uH.value = (this.props.astroHoverReveal ?? true) ? hv.v : 0;
      if (JET && (this.props.astroJets ?? true)) JET(dt, speed);
      const inWork = rp > 0.97;
      if (!this._hbub) { const el = document.querySelector('[data-hover-bubble]'); if (el) { this._hbub = { el, x: 0, y: 0, op: 0 };
          const G = window.gsap, blobs = el.querySelectorAll('[data-hb-blob]'), main = el.querySelector('[data-hb-main]');
          const wob = (b, i) => { if (!G || this.dead) return; G.to(b, { x: G.utils.random(-26, 26), y: G.utils.random(-18, 18), scale: G.utils.random(0.55, 1.25), duration: G.utils.random(1.1, 2.2), ease: 'sine.inOut', onComplete: () => wob(b, i) }); };
          const wobM = () => { if (!G || this.dead) return; G.to(main, { scaleX: G.utils.random(0.94, 1.08), scaleY: G.utils.random(0.9, 1.1), rotation: G.utils.random(-4, 4), duration: G.utils.random(1.4, 2.4), ease: 'sine.inOut', onComplete: wobM }); };
          setTimeout(() => { blobs.forEach(wob); wobM(); }, 300); } }
      if (this._hbub) { const HB = this._hbub, show = !this.state.page && rp < 0.04 && rq < 0.0005 && hv.v < 0.3 && !matchMedia('(pointer: coarse)').matches && (this.gsapReady || false);
        const W = innerWidth, Hh = window.__svh || innerHeight;
        if (HB.ax == null) { HB.ax = (PH.x * 0.5 + 0.5) * W + Math.min(W * 0.1, 140) - 66; HB.ay = (-PH.y * 0.5 + 0.5) * Hh - Hh * 0.12 - 42; HB.x = HB.ax; HB.y = HB.ay; }
        HB.ax += (((PH.x * 0.5 + 0.5) * W + Math.min(W * 0.1, 140) - 66) - HB.ax) * 0.01; HB.ay += (((-PH.y * 0.5 + 0.5) * Hh - Hh * 0.12 - 42) - HB.ay) * 0.01;
        const tx2 = HB.ax + Math.sin(tt * 0.45) * 5 - Math.sin(tt * 0.23) * 3, ty2 = HB.ay + Math.sin(tt * 0.6 + 1.2) * 6;
        HB.x += (tx2 - HB.x) * 0.08; HB.y += (ty2 - HB.y) * 0.08; HB.op += ((show ? 1 : 0) - HB.op) * 0.08;
        HB.el.style.opacity = HB.op.toFixed(3); HB.el.style.transform = 'translate3d(' + HB.x.toFixed(1) + 'px,' + HB.y.toFixed(1) + 'px,0) scale(' + (0.8 + 0.2 * HB.op).toFixed(3) + ')'; }
      { const zi = rq > 0.0005 && rq < 0.999 && r3 < 0.0005 ? '61' : '1'; /* above the z60 bleed layer */ if (box.style.zIndex !== zi) box.style.zIndex = zi; } if (box.style.filter) box.style.filter = '';
      // leaving Work: no fade — he flies up and out the top; only hidden once fully past
      const fade = rq < 0.995 ? 1 : 0, vis = (!this.state.page || this.closing) && (this.props.astroGlobal ?? true) && fade > 0.001 && r3 < 0.5;
      const op = vis ? fade.toFixed(3) : '0'; if (box.style.opacity !== op) box.style.opacity = op; shown = vis;
      if (vis) { if (dOn) { const w = r.domElement.width, h = r.domElement.height; if (art.width !== w || art.height !== h) art.setSize(w, h); r.setRenderTarget(art); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam); r.setRenderTarget(null); r.clear(); r.render(qS, qC); } else r.render(sc, cam); }
    };
    loop();
  }
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
  fitHeroTitle() {
    // scale the top title so its letters span the full viewport width (capped by height)
    const h1 = this.headlineRef && this.headlineRef.current; if (!h1 || !h1.children.length) return;
    const hcs = getComputedStyle(h1), W = h1.clientWidth - (parseFloat(hcs.paddingLeft) || 0) - (parseFloat(hcs.paddingRight) || 0) - 4, kids = Array.from(h1.children);
    const fs0 = parseFloat(getComputedStyle(h1).fontSize) || 100;
    const w = kids[kids.length - 1].getBoundingClientRect().right - kids[0].getBoundingClientRect().left;
    if (w > 0) { const fs = Math.min(fs0 * W / w, (window.__svh || innerHeight) * 0.62); if (Math.abs(fs - fs0) > 0.5) h1.style.fontSize = fs.toFixed(1) + 'px'; }
    { const fh = document.querySelector('[data-hero-front] h1'); if (fh && fh !== h1) fh.style.fontSize = h1.style.fontSize; }
    // services row sits just below the title's letters
    const ul = h1.parentElement && h1.parentElement.querySelector('ul[data-cg]'), wrap = ul && ul.parentElement;
    if (wrap && wrap !== h1.parentElement) {
      requestAnimationFrame(() => { const pr = h1.parentElement.getBoundingClientRect(), b = h1.getBoundingClientRect().bottom;
        wrap.style.bottom = 'auto'; wrap.style.top = (b - pr.top + Math.max(10, innerHeight * 0.02)).toFixed(0) + 'px'; });
    }
  }
  applyHeroLight() {
    const hr = this.heroRef && this.heroRef.current, inner = hr && hr.firstElementChild; if (!inner) return;
    const on = this.props.heroLight ?? true, bg = this.props.heroLightBg || '#ffffff', ink = this.props.heroLightInk || '#0a0a0a';
    inner.style.background = on ? bg : '';
    const h1 = this.headlineRef && this.headlineRef.current;
    if (h1) { h1.style.color = on ? ink : '#ecebe6'; h1.style.textShadow = on ? 'none' : '0 0.03em 0.09em rgba(0,0,0,0.45)'; }
    inner.querySelectorAll('ul, li').forEach((el) => { el.style.color = on ? ink : ''; });
  }
  initFooter() {
    const sp = document.querySelector('[data-footer-spacer]'), ft = document.querySelector('[data-footer]'); if (!sp || !ft) return;
    const dim = ft.querySelector('[data-footer-dim]'), inner = ft.querySelector('[data-footer-inner]'); let lastH = 0;
    const tick = () => {
      if (this.dead) return; this.ftRaf = requestAnimationFrame(tick);
      const vh = innerHeight, H = ft.offsetHeight; if (H && H !== lastH) { lastH = H; sp.style.height = H + 'px'; }
      const r = sp.getBoundingClientRect();
      if (r.top >= vh || this.state.page) { if (ft.style.visibility !== 'hidden') ft.style.visibility = 'hidden'; return; }
      ft.style.visibility = 'visible';
      const p = Math.max(0, Math.min(1, (vh - r.top) / Math.max(1, H))), e = 1 - Math.pow(1 - p, 3);
      // tall footer: top pinned at 0 while revealing, then it scrolls with the spacer (bottom lines up at max scroll)
      const topW = H > vh ? (r.top > 0 ? 0 : r.top) : vh - H;
      const base = topW - (vh - H);
      ft.style.transform = Math.abs(base) > 0.05 ? 'translate3d(0,' + base.toFixed(1) + 'px,0)' : '';
      ft.style.clipPath = 'inset(' + Math.max(0, r.top - topW).toFixed(1) + 'px 0 0 0)';
      if (dim) dim.style.opacity = ((1 - e) * 0.8).toFixed(3);
      if (inner) inner.style.transform = 'translate3d(0,' + (-(1 - e) * H * 0.28).toFixed(1) + 'px,0) scale(' + (0.96 + 0.04 * e).toFixed(4) + ')';
    };
    tick();
  }
  componentDidMount() {
    (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => { if (!this.dead) this.smokeMaskFrames(); }, { timeout: 4000 });
    this.initFooter();
    this.initLetterStorm();
    this.initGsapTitles();
    this.applyHeroLight();
    this.fitHero = () => this.fitHeroTitle(); addEventListener('resize', this.fitHero); requestAnimationFrame(this.fitHero); if (document.fonts && document.fonts.ready) document.fonts.ready.then(this.fitHero); setTimeout(this.fitHero, 800);
    this.onDeadLink = (e) => { const a = e.target.closest && e.target.closest('a[href="#"]'); if (a) e.preventDefault(); };
    document.addEventListener('click', this.onDeadLink, true);
    this.onCtxLost = (e) => { if (e.target && e.target.tagName === 'CANVAS') { e.preventDefault(); this.gpuLost = (this.gpuLost || 0) + 1; } };
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
  componentDidUpdate() { this.applyHeroLight && this.applyHeroLight();  this.applyFont && this.applyFont(); this.applySizes(); }
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
  runEntrance() {
    setTimeout(() => { this.gsapReady = true; }, 1200);
    const T = this.entranceTargets(), t0 = performance.now();
    const ex = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const items = [];
    T.lines.forEach((el, i) => items.push({ el, d: 80 + i * 110, dur: 1500, kind: 'line' }));
    if (T.model) items.push({ el: T.model, d: 0, dur: 2200, kind: 'model' });
    T.hdr.forEach((el, i) => items.push({ el, d: 520 + i * 90, dur: 1200, kind: 'ui' }));
    T.ftr.forEach((el, i) => items.push({ el, d: 760 + i * 90, dur: 1200, kind: 'ui' }));
    const step = () => {
      if (this.dead) return;
      const now = performance.now(); let busy = false;
      items.forEach(it => {
        const t = Math.max(0, Math.min(1, (now - t0 - it.d) / it.dur)), e = ex(t);
        if (t < 1) busy = true;
        if (it.kind === 'line') { it.el.style.clipPath = t >= 1 ? '' : 'inset(0 0 ' + ((1 - e) * 100).toFixed(2) + '% 0)'; it.el.style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 0.6).toFixed(3) + 'em,0)'; }
        else if (it.kind === 'model') { it.el.style.opacity = String(Math.min(1, t * 1.6)); it.el.style.transform = t >= 1 ? '' : 'scale(' + (1 + (1 - e) * 0.12).toFixed(4) + ')'; }
        else { it.el.style.opacity = String(e); it.el.style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 14).toFixed(2) + 'px,0)'; }
        if (t >= 1) it.el.style.willChange = '';
      });
      if (busy) requestAnimationFrame(step);
    };
    step();
  }
  initLoader() {
    this.prepEntrance();
    const el = this.loaderRef.current; if (!el) return;
    const cnt = el.querySelector('[data-ld-count]'), bar = el.querySelector('[data-ld-bar]'), word = el.querySelector('[data-ld-word]');
    const t0 = performance.now(), MIN = 1900, MAX = 6000;
    let shown = 0, ready = false, outT = 0;
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    fonts.then(() => { this._fontsOK = true; });
    this.lockScroll(true);
    const ease = (t) => 1 - Math.pow(1 - t, 4), io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = () => {
      if (this.dead) return;
      const now = performance.now(), el2 = now - t0;
      const assets = (this._fontsOK ? 0.35 : 0) + (this.portrait || this.portraitFailed || !(this.props.hero3D ?? true) ? 0.65 : 0);
      const target = Math.min(1, Math.min(el2 / MIN, 1) * 0.6 + assets * 0.4 + (el2 > MAX ? 1 : 0));
      shown += (target - shown) * 0.08; if (target >= 1 && shown > 0.995) shown = 1;
      cnt.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      bar.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
      const w = Math.min(1, el2 / 900); word.style.transform = 'translate3d(0,' + ((1 - ease(w)) * 105) + '%,0)';
      if (shown >= 1 && !ready) { ready = true; outT = now + 250; }
      if (ready && now > outT) {
        const k = Math.min(1, (now - outT) / 1100), e = io(k);
        el.style.clipPath = 'inset(0 0 ' + (e * 100).toFixed(2) + '% 0)';
        word.style.transform = 'translate3d(0,' + (-e * 60) + '%,0)';
        cnt.style.transform = 'translate3d(0,' + (-e * 40) + '%,0)';
        if (k > 0.45 && !this._entered) { this._entered = true; this.runEntrance(); }
        if (k >= 1) { el.style.display = 'none'; this.lockScroll(false); return; }
      }
      requestAnimationFrame(step);
    };
    step();
  }
  initSwap() {
    const root = this.chromeRef.current; if (!root) return;
    const A = root.querySelector('[data-swap-a]'), B = root.querySelector('[data-swap-b]');
    const blur = document.querySelector('[data-goo-text]');
    if (!A || !B) return;
    const GL = 'abcdefghijklmnopqrstuvwxyz#%&*+=/<>0123456789';
    const scramble = (el, txt, dur) => {
      const t0 = performance.now();
      const step = () => {
        if (this.dead) return;
        const k = Math.min(1, (performance.now() - t0) / dur);
        el.textContent = txt.split('').map((c, i) => (i + 1) / txt.length <= k ? c : GL[(Math.random() * GL.length) | 0]).join('');
        if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
      };
      step();
    };
    let side = 0, from = 0, to = 0, t0 = 0, moving = false;
    const ease = (t) => t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2;
    const frame = () => {
      if (this.dead) return;
      this.swapRaf = requestAnimationFrame(frame);
      {
        const vv = window.visualViewport, th = (vv ? vv.height : innerHeight) - 32;
        this.chH = this.chH == null ? th : this.chH + (th - this.chH) * 0.18;
        if (Math.abs(th - this.chH) < 0.5) this.chH = th;
        if (this.chH !== this.chHSet) { this.chHSet = this.chH; root.style.height = this.chH.toFixed(1) + 'px'; }
      }
      const W = A.parentElement.clientWidth - 64;
      const da = W - A.offsetWidth, db = W - B.offsetWidth;
      let k = to, v = 0;
      if (moving) {
        const t = Math.min(1, (performance.now() - t0) / 1600);
        k = from + (to - from) * ease(t); v = Math.sin(Math.PI * t);
        if (t >= 1) moving = false;
      }
      if (blur) blur.setAttribute('stdDeviation', (v * 1.3).toFixed(2));
      A.style.filter = B.style.filter = v > 0.02 ? 'url(#gooText)' : '';
      const sq = 1 + v * 0.35, sc = v > 0.001 ? ' scale(' + sq + ',' + (1 / sq) + ')' : '';
      A.style.transform = 'translate3d(' + (k * da) + 'px,0,0)' + sc;
      B.style.transform = 'translate3d(' + (-k * db) + 'px,0,0)' + sc;
    };
    frame();
    this.swapTimer = setInterval(() => {
      side = 1 - side; from = to; to = side; t0 = performance.now(); moving = true;
    }, 9000);
  }
  initSound() {
    const bars = () => this.chromeRef.current ? this.chromeRef.current.querySelectorAll('[data-bar]') : [];
    const lv = [0, 0, 0, 0, 0];
    const loop = () => {
      if (this.dead) return;
      this.sndRaf = requestAnimationFrame(loop);
      const on = this.state.soundOn, an = this.analyser, t = performance.now() / 1000;
      let data = null;
      if (on && an) { data = this.fData || (this.fData = new Uint8Array(an.frequencyBinCount)); an.getByteFrequencyData(data); }
      if (this.audio) this.audio.volume += ((on ? 0.7 : 0) - this.audio.volume) * 0.06;
      if (this.audio && !on && this.audio.volume < 0.01 && !this.audio.paused) this.audio.pause();
      bars().forEach((b, i) => {
        let tgt = 0.14;
        if (on) {
          if (data) { const lo = [2, 5, 10, 20, 40][i], hi = [5, 10, 20, 40, 80][i]; let sum = 0; for (let j = lo; j < hi; j++) sum += data[j]; tgt = 0.15 + (sum / (hi - lo) / 255) * 0.95; }
          else tgt = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * (3 + i * 1.3) + i)) * (0.6 + 0.4 * Math.sin(t * 1.7 + i * 2.1));
        }
        lv[i] += (Math.min(1, tgt) - lv[i]) * 0.18;
        b.style.transform = 'scaleY(' + lv[i].toFixed(3) + ')';
      });
    };
    loop();
  }
  toggleSound() {
    const on = !this.state.soundOn;
    const url = (this.props.soundtrack || '').trim();
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
  async initPortrait() {
    const pw = this.portraitRef.current;
    if (pw && innerWidth < 820) {
      Object.assign(pw.style, { left: '0', right: '0', top: '0', bottom: 'auto', width: '100%', maxWidth: 'none', height: '100vh' });
      pw.style.height = '100svh';
      pw.style.webkitMaskImage = pw.style.maskImage = 'linear-gradient(180deg,#000 0%,#000 78%,transparent 100%)';
    }
    if (!(this.props.hero3D ?? true)) return;
    const el = this.hero3dRef.current; if (!el || this.portrait || this.portraitLoading) return;
    this.portraitLoading = true;
    while (el.firstChild) el.removeChild(el.firstChild);
    try {
      const mod = (window.DitherViewer || await new Promise((res) => { const t = setInterval(() => { if (window.DitherViewer) { clearInterval(t); res(window.DitherViewer); } }, 50); }));
      if (this.dead) return;
      this.portrait = await mod.createPortrait(el, { model: (this.props.hero3Model || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/thunderstorm.glb', eyes: null, neck: 0, fit: innerWidth < 820 ? 0.92 : 0.78, maxPR: this.lowPower ? 0.9 : 2, shadowSize: this.lowPower ? 512 : 2048, textureAmount: 1, keepMaterials: true, post: { dither: 0, grain: 0.02, saturation: 1, contrast: 0.08, bloom: 0.06, vignette: 0.7, stipple: 0, tint: 0, exposure: 1 } });
      if (this.dead) { this.portrait.renderer.setAnimationLoop(null); return; }
      const c = this.portrait.renderer.domElement; c.style.position = 'absolute'; c.style.inset = '0'; c.style.width = '100%'; c.style.height = '100%'; c.style.opacity = '0'; c.style.transition = 'opacity 1.4s ease';
      requestAnimationFrame(() => { c.style.opacity = '1'; });
      this.portraitOn = true;
    } catch (e) { console.warn('portrait failed', e); this.portraitFailed = true; }
  }
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
    cancelAnimationFrame(this.ftRaf);
    this.dead = true; cancelAnimationFrame(this.raf); clearInterval(this.clock); clearTimeout(this.pt);
    window.removeEventListener('popstate', this.onPop);
    clearTimeout(this.lenisWait);
    if (window.__sliderLenis) { cancelAnimationFrame(window.__sliderLenisRaf); try { window.__sliderLenis.destroy(); } catch (e) {} window.__sliderLenis = null; }
    this.lockScroll(false);
    if (this.portrait) { this.portrait.renderer.setAnimationLoop(null); this.portrait.renderer.dispose(); try { this.portrait.renderer.forceContextLoss(); } catch (e) {} try { r.forceContextLoss(); } catch (e) {} this.portrait.renderer.domElement.remove(); this.portrait = null; }
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

  setPhase(phase) { this.setState(s => s.page ? { page: { ...s.page, phase } } : null); }
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
  sceneTarget(k, dir) {
    const vh = window.__svh || innerHeight;
    const w = this.workRef.current, c = this.ctaRef.current, r = this.reachRef.current;
    if (k === 'rp') return dir ? (w ? w.offsetTop : vh) : 0;
    if (k === 'rq') return dir ? (c ? c.offsetTop : 0) : (w ? w.offsetTop + w.offsetHeight - vh : 0);
    if (k === 'r3') return dir ? (r ? r.offsetTop : 0) : (c ? c.offsetTop + c.offsetHeight - vh : 0);
    return 0;
  }
  sceneSnap(y, dur) {
    const L = window.__sliderLenis;
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    if (L && !L.isStopped) { L.scrollTo(y, { duration: dur / 1000, easing: ease, lock: true, force: true }); return; }
    const y0 = (window.__scrollY ? window.__scrollY() : window.scrollY), t0 = performance.now();
    const step = () => { const t = Math.min(1, (performance.now() - t0) / dur); window.scrollTo(0, y0 + (y - y0) * ease(t)); if (t < 1 && !this.dead) requestAnimationFrame(step); };
    step();
  }
  sceneTween(k, q) {
    const T = this._tw || (this._tw = {}), now = performance.now();
    const o = T[k] || (T[k] = { v: q, t: now });
    const dt = Math.min(0.05, Math.max(0.001, (now - o.t) / 1000)); o.t = now;
    const a = 1 - Math.exp(-dt * (this.props.sceneSmooth ?? 7));
    let d = (q - o.v) * a; const mx = dt * 1.6; d = Math.max(-mx, Math.min(mx, d));
    o.v += d; if (Math.abs(q - o.v) < 0.0004) o.v = q; return o.v;
  }
  logRect(el, a, b, tot) { const r = el.getBoundingClientRect(), u = r.height / tot; return { top: r.top + a * u, bottom: r.top + b * u, height: (b - a) * u, left: r.left, width: r.width }; }
  springTo(to, k, c, done, v0) { this.anim = { to, k, c, done }; if (v0 !== undefined) this.openV = v0; }
  openProject(i, uv) {
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

  drawHeroReplica(ctx, W, H, dpr) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const hr = this.heroRef.current; if (!hr) return;
    const frame = hr.firstElementChild;
    const fr = frame.getBoundingClientRect();
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    ctx.save(); rr(fr.left, fr.top, fr.width, fr.height, 18); ctx.clip();
    const bgc = this.bgRef.current && this.bgRef.current.querySelector('canvas');
    if (bgc && this.bgRef.current.style.display !== 'none') ctx.drawImage(bgc, 0, 0, W, H); else { ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H); }
    const slot = frame.querySelector('[data-w-slot]');
    const im = slot && ((slot.shadowRoot && slot.shadowRoot.querySelector('img')) || slot.querySelector('img'));
    if (im && im.complete && im.naturalWidth) {
      const pr = slot.getBoundingClientRect();
      const oc = this.repOff || (this.repOff = document.createElement('canvas'));
      oc.width = Math.ceil(pr.width * dpr); oc.height = Math.ceil(pr.height * dpr);
      const ox = oc.getContext('2d'); ox.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sc = Math.max(pr.width / im.naturalWidth, pr.height / im.naturalHeight);
      ox.drawImage(im, (pr.width - im.naturalWidth * sc) / 2, (pr.height - im.naturalHeight * sc) / 2, im.naturalWidth * sc, im.naturalHeight * sc);
      ox.globalCompositeOperation = 'destination-in';
      const g = ox.createLinearGradient(0, 0, pr.width, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, '#000'); g.addColorStop(0.75, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ox.fillStyle = g; ox.fillRect(0, 0, pr.width, pr.height);
      ctx.drawImage(oc, pr.left, pr.top, pr.width, pr.height);
    }
    const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let n;
    while ((n = walker.nextNode())) {
      const txt0 = n.textContent.replace(/\\s+/g, ' ').trim(); if (!txt0) continue;
      const el = n.parentElement; if (!el || el.closest('image-slot')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      range.selectNodeContents(n);
      const st = parseFloat(cs.fontStretch) || 100;
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      try { ctx.fontStretch = st >= 120 ? 'expanded' : st >= 108 ? 'semi-expanded' : 'normal'; } catch (e) {}
      try { ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing; } catch (e) {}
      ctx.fillStyle = cs.color; ctx.textBaseline = 'alphabetic';
      const raw = n.textContent, up = cs.textTransform === 'uppercase';
      const mM = ctx.measureText('M'); const asc = mM.fontBoundingBoxAscent, des = mM.fontBoundingBoxDescent;
      const re = /\\S+/g; let w;
      while ((w = re.exec(raw))) {
        range.setStart(n, w.index); range.setEnd(n, w.index + w[0].length);
        const b = range.getBoundingClientRect(); if (!b.width) continue;
        ctx.fillText(up ? w[0].toUpperCase() : w[0], b.left, b.top + (b.height - (asc + des)) / 2 + asc);
      }
    }
    ctx.restore();
    ctx.strokeStyle = '#33332f'; ctx.lineWidth = 1; rr(fr.left + 0.5, fr.top + 0.5, fr.width - 1, fr.height - 1, 18); ctx.stroke();
  }

  initRoll(THREE) {
    const box = this.rollRef.current; if (!box) return;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const dpr = Math.min(window.devicePixelRatio, this.lowPower ? 1 : 2);
    r.setPixelRatio(dpr); r.setClearColor(0x000000, 0);
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const FOV = 35, camZ = 1 / Math.tan(FOV / 2 * Math.PI / 180);
    const cam = new THREE.PerspectiveCamera(FOV, 1, 0.05, 50); cam.position.set(0, 0, camZ);
    const cv = document.createElement('canvas'); const ctx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    const U = { uTex: { value: tex }, uP: { value: 0 }, uR: { value: 0.22 }, uW: { value: 2 }, uH: { value: 2 }, uVel: { value: 0 } };
    const geo = new THREE.PlaneGeometry(2, 2, 48, 220);
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, side: THREE.DoubleSide, depthTest: true,
      vertexShader: \`
        uniform float uP; uniform float uR; uniform float uW; uniform float uH; uniform float uVel;
        varying vec2 vUv; varying float vA; varying float vZ;
        const float PI = 3.14159265;
        void main(){
          vUv = uv;
          vec3 p = vec3((uv.x - 0.5) * uW, (uv.y - 0.5) * uH, 0.0);
          float R = uR * (1.0 + 0.35 * uv.x);
          float travel = uH + PI * R * 2.4;
          float yc = -uH * 0.5 - PI * R + uP * travel + (uv.x - 0.5) * uW * 0.22 * uP;
          float d = yc - p.y;
          float a = 0.0;
          if (d > 0.0) {
            a = d / R;
            if (a < PI) { p.y = yc - sin(a) * R; p.z = R - cos(a) * R; }
            else { p.y = yc + (d - PI * R); p.z = 2.0 * R; }
          }
          float tw = uP * 0.5;
          p.x += sin(p.y * 1.6 + uP * 4.0) * 0.05 * uP;
          p.z += sin(uv.x * PI) * uVel * 0.35;
          mat2 rz = mat2(cos(tw * 0.18), sin(tw * 0.18), -sin(tw * 0.18), cos(tw * 0.18));
          p.xy = rz * p.xy;
          p.z += uP * uP * 0.6;
          vA = a; vZ = p.z;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
        }\`,
      fragmentShader: \`
        uniform sampler2D uTex; uniform float uP;
        varying vec2 vUv; varying float vA; varying float vZ;
        void main(){
          vec4 t = texture2D(uTex, vUv);
          float shade = 1.0;
          if (vA > 0.0) shade = 0.55 + 0.45 * cos(min(vA, 3.14159));
          vec3 col = t.rgb;
          float alpha = t.a;
          if (!gl_FrontFacing) { col = vec3(0.045) + t.rgb * 0.08; alpha = max(alpha, 0.0) ; }
          float rim = smoothstep(0.0, 1.2, vA) * (1.0 - smoothstep(1.4, 3.14, vA));
          col += vec3(0.9, 0.88, 0.84) * rim * 0.12;
          col *= shade;
          alpha *= 1.0 - smoothstep(0.82, 1.0, uP);
          gl_FragColor = vec4(col, alpha);
        }\` });
    const scene = new THREE.Scene(); scene.add(new THREE.Mesh(geo, mat));
    let W = 0, H = 0;
    const size = () => {
      W = window.innerWidth; H = window.innerHeight;
      r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
      U.uW.value = 2 * W / H; U.uH.value = 2;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      this.rollDirty = true;
    };
    size(); window.addEventListener('resize', size);
    let sp = 0, vis = false, lastDraw = 0, lastP = 0, vel = 0;
    const loop = () => {
      if (this.dead) return;
      this.rollRaf = requestAnimationFrame(loop);
      const vh = (window.__svh || window.innerHeight), P = this.props;
      const on = (P.sectionRibbon ?? true);
      const target = on ? Math.max(0, Math.min(1, (window.__scrollY ? window.__scrollY() : window.scrollY) / (vh * 1.0))) : 0;
      sp += (target - sp) * 0.14;
      if (Math.abs(target - sp) < 0.0004) sp = target;
      vel += ((sp - lastP) * 30 - vel) * 0.15; lastP = sp;
      const hr = this.heroRef.current;
      const show = sp > 0.0015 && sp < 0.999;
      if (show !== vis) { vis = show; box.style.display = show ? 'block' : 'none'; if (show) this.rollDirty = true; }
      if (hr) {
        hr.style.opacity = sp <= 0.0015 ? '1' : String(Math.max(0, 1 - sp / 0.03));
        hr.style.visibility = sp >= 0.999 ? 'hidden' : 'visible';
      }
      if (!show) return;
      const now = performance.now();
      if (this.rollDirty || now - lastDraw > 500) {
        if (hr) { const o = hr.style.opacity; hr.style.opacity = '1'; this.drawHeroReplica(ctx, W, H, dpr); hr.style.opacity = o; }
        tex.needsUpdate = true; lastDraw = now; this.rollDirty = false;
      }
      U.uP.value = sp; U.uVel.value = Math.max(-1, Math.min(1, vel));
      U.uR.value = 0.18 + 0.1 * (P.ribbonCurl ?? 1);
      r.render(scene, cam);
    };
    loop();
    this.cleanupRoll = () => {
      cancelAnimationFrame(this.rollRaf); window.removeEventListener('resize', size);
      tex.dispose(); geo.dispose(); mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  }

  initReach(THREE) {
    const box = this.rayRef.current, sec = this.reachRef.current; if (!box || !sec) return;
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uTilt: { value: 0 }, uZoom: { value: 0 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: \`
        precision highp float;
        vec3 DQ(vec3 c){ return c; }
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uTilt; uniform float uZoom;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float tc = cos(uTilt * 0.1), ts = sin(uTilt * 0.1);
          p = mat2(tc, ts, -ts, tc) * p; p *= 1.0 + uZoom * 0.3; p.y += uTilt * 0.4;
          float e = uP * uP * (3.0 - 2.0 * uP);
          float asp = uRes.x / uRes.y;
          vec2 S = vec2(0.18 + uM.x * 0.03, 0.62 + uM.y * 0.01);
          vec2 dir = normalize(vec2(-0.22 - (1.0 - e) * 0.08 + sin(uT * 0.23) * 0.05 + sin(uT * 0.11) * 0.03, -1.0));
          vec2 rel = p - S;
          float along = dot(rel, dir), perp = dot(rel, vec2(-dir.y, dir.x));
          float reach = mix(0.1, 1.6, e);
          float width = mix(0.05, 0.32, e) * (0.35 + max(along, 0.0) * 0.8) * (1.0 + 0.1 * sin(uT * 0.4) + 0.05 * sin(uT * 1.1));
          float core = exp(-perp * perp / (width * width));
          float soft = exp(-perp * perp / (width * width * 9.0));
          float len = smoothstep(reach, reach - 0.5, along) * smoothstep(-0.08, 0.12, along);
          float streak = fbm(vec2(along * 1.4 - uT * 0.09, perp * 10.0 + sin(uT * 0.2) * 0.6)) * 0.8 + 0.4;
          float beam = (core * 0.85 + soft * 0.35) * len * streak;
          vec3 warm = vec3(0.78, 0.7, 0.6), hot = vec3(0.92, 0.88, 0.82);
          vec3 col = vec3(0.004, 0.0038, 0.0036);
          col += mix(warm, hot, core * core * core) * beam * mix(0.03, 0.3, e) * (0.55 + 0.45 * core);
          col += warm * 0.045 * exp(-length(rel) * 7.0) * smoothstep(0.0, 0.4, e);
          col += warm * 0.012 * fbm(p * 1.6 + uT * 0.015) * soft * e;
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col = mix(vec3(lg), col, 0.4);
          col += mix(vec3(-0.002, 0.0, 0.004), vec3(0.008, 0.003, -0.004), smoothstep(0.02, 0.2, lg));
          col = max(col - 0.0025, 0.0);
          col = col * 1.05 / (1.0 + col * 1.1);
          float l = dot(col, vec3(0.333));
          col += (h(fc + 0.0) - 0.5) * 0.05 * (0.3 + l * 3.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.35 * dot(vu, vu);
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }\` });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let lastW = 0;
    const size = () => { const w = box.clientWidth, hh = box.clientHeight; if (!w || !hh) return; if (this.coarse && w === lastW) return; lastW = w; const pr = this.lowPower ? 0.4 : Math.min(1, 1300 / w); r.setPixelRatio(pr); r.setSize(w, hh, false); U.uRes.value.set(w * pr, hh * pr); };
    const ro = new ResizeObserver(size); ro.observe(box); size();
    const mm = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => { mm.x = e.clientX / innerWidth * 2 - 1; mm.y = -(e.clientY / innerHeight * 2 - 1); };
    window.addEventListener('pointermove', onMove);
    let sp = 0, handLoading = false, handOn = false; const t0 = performance.now();
    const expo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const loadHand = async () => {
      handLoading = true;
      try {
        const mod = (window.DitherViewer || await new Promise((res) => { const t = setInterval(() => { if (window.DitherViewer) { clearInterval(t); res(window.DitherViewer); } }, 50); }));
        if (this.dead) return;
        const url = (this.props.handModel || '').trim() || 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/right.glb';
        this.hand = await mod.createPortrait(this.handRef.current, { model: url, eyes: null, neck: -10, rotation: [-1.15, 0.5, -0.55], light: 'top', keyAngle: 0.2, maxPR: this.lowPower ? 0.9 : 2, shadowSize: this.lowPower ? 512 : 2048, textureAmount: 0, clay: { color: 0x5e5650, roughness: 0.82, sheen: 0.6, sheenColor: 0xc2b19e }, post: { dither: 0, grain: 0.03, saturation: 0.28, contrast: 0.32, bloom: 0.05, vignette: 1.25, stipple: 0, tint: 0.6 , exposure: 0.1 } });
        this.hand.scene.traverse((o) => { if (o.isLight) o.color.set(0xd8ccbc); });
        const c = this.hand.renderer.domElement; c.style.position = 'absolute'; c.style.inset = '0'; c.style.width = '100%'; c.style.height = '100%';
        handOn = true;
      } catch (e) { console.warn('hand failed', e); }
    };
    const loop = () => {
      if (this.dead) return;
      this.reachRaf = requestAnimationFrame(loop);
      const rc = this.logRect(sec, 100, 300, 300), vh = (window.__svh || innerHeight), now = performance.now();
      if (!handLoading && rc.top < vh * 2.5) loadHand();
      const vis = rc.top < vh && rc.bottom > 0;
      if (this.hand) {
        const want = vis && !this.state.page;
        if (want !== handOn) { handOn = want; this.hand.renderer.setAnimationLoop(want ? this.hand.frame : null); }
      }
      const intoR = (vh * 0.15 - rc.top) / vh;
      sec.querySelectorAll('[data-rw]').forEach((w, j) => {
        const t = Math.max(0, Math.min(1, (intoR - j * 0.1) / 0.5)), e = 1 - Math.pow(1 - t, 3);
        w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 4) + 'deg)';
        w.style.filter = t >= 1 || t <= 0 ? '' : 'blur(' + ((1 - e) * 14).toFixed(2) + 'px)'; w.style.opacity = (0.15 + 0.85 * e).toFixed(3);
      });
      if (!vis) return;
      const tp = Math.max(0, Math.min(1, (vh - rc.top) / (rc.height)));
      if (this.hand) { const hmd = this.hand.model; if (!hmd && this.hand.scene) this.hand.model = this.hand.scene.children.find(c => c.isGroup || c.isObject3D && c.children.length && !c.isLight && !c.isCamera) || null; }
      sp += (tp - sp) * 0.05;
      mm.sx += (mm.x - mm.sx) * 0.04; mm.sy += (mm.y - mm.sy) * 0.04;
      U.uP.value = sp; U.uM.value.set(mm.sx, mm.sy); U.uT.value = (now - t0) / 1000;
      U.uTilt.value = this.rayTilt || 0; U.uZoom.value = this.rayZoom || 0;
      if (this.hand) {
        const e = sp * sp * (3 - 2 * sp), t = (now - t0) / 1000;
        this.hand.post.uExposure.value = (0.06 + e * 0.5) * (1 + 0.06 * Math.sin(t * 0.4));
        const md = this.hand.model; if (md) md.rotation.set(-1.15 + Math.sin(t * 0.55) * 0.05, 0.5 + Math.sin(t * 0.37) * 0.09, -0.55 + Math.sin(t * 0.29 + 1.2) * 0.06);
      }
      r.render(scene, cam);
    };
    loop();
    this.cleanupReach = () => {
      cancelAnimationFrame(this.reachRaf); ro.disconnect(); window.removeEventListener('pointermove', onMove);
      if (this.hand) { this.hand.renderer.setAnimationLoop(null); this.hand.renderer.dispose(); try { this.hand.renderer.forceContextLoss(); } catch (e) {} try { r.forceContextLoss(); } catch (e) {} this.hand.renderer.domElement.remove(); this.hand = null; }
      mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  }

  smokeMask(el, p) {
    if (!el) return;
    if (p <= 0.0005 || p >= 0.9995) { if (el.__smI != null) { el.__smI = null; el.style.webkitMaskImage = ''; el.style.maskImage = ''; } return; }
    const M = this.smokeMaskFrames();
    const i = Math.max(1, Math.min(M.length - 2, Math.round(p * (M.length - 1))));
    if (el.__smI === i) return; el.__smI = i;
    const url = M[i]; el.style.webkitMaskImage = url; el.style.maskImage = url;
    el.style.webkitMaskSize = '100% 100%'; el.style.maskSize = '100% 100%'; el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
  }
  smokeMaskFrames() {
    if (this._smF) return this._smF;
    const W = 96, H = Math.max(40, Math.round(96 * innerHeight / innerWidth)), c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), id = g.createImageData(W, H), d = id.data;
    const hs = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
    const vn = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); const a = hs(ix, iy), b = hs(ix + 1, iy), c2 = hs(ix, iy + 1), dd = hs(ix + 1, iy + 1); return a + (b - a) * ux + (c2 - a) * uy + (a - b - c2 + dd) * ux * uy; };
    const f = new Float32Array(W * H); let mn = 9, mx = -9;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let X = x / W * 4 * (W / H), Y = y / H * 4, sm = 0, am = 0.5; for (let o = 0; o < 5; o++) { sm += am * vn(X, Y); X = X * 2.03 + 7.1; Y = Y * 2.03 + 3.3; am *= 0.5; } const v = sm * 0.72 + (y / H) * 0.38; f[y * W + x] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
    { const ord = Array.from(f.keys()).sort((a, b) => f[a] - f[b]), eq = new Float32Array(f.length); ord.forEach((ix, r) => { eq[ix] = r / (f.length - 1); }); f.set(eq); }
    const N = 32, out = [];
    for (let k = 0; k < N; k++) {
      const p = k / (N - 1), lo = 1 - p * 1.14 - 0.07;
      for (let i = 0; i < f.length; i++) { let t = (f[i] - lo) / 0.14; t = t < 0 ? 0 : t > 1 ? 1 : t; t = t * t * (3 - 2 * t); const j = i * 4; d[j] = d[j + 1] = d[j + 2] = 255; d[j + 3] = (t * 255) | 0; }
      g.putImageData(id, 0, 0); out.push('url(' + c.toDataURL() + ')');
    }
    return (this._smF = out);
  }
  initBleed(THREE) {
    const box = this.bleedRef.current; if (!box) return;
    let r = null, lastOn = 0;
    const mk = () => { r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false }); r.setClearColor(0, 0); r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement); size(); };
    const drop = () => { if (!r) return; r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; };
    const U = { uP: { value: 0 }, uB: { value: 0 }, uT: { value: 0 }, uA: { value: 1 }, uS: { value: 0 }, uTint: { value: 0 }, uFill: { value: 1 }, uGal: { value: 1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: \`
        uniform float uP; uniform float uB; uniform float uT; uniform float uA; uniform float uS; uniform float uTint; uniform float uFill; uniform float uGal; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.02 + 7.3; a *= 0.5; } return s; }
        void main(){
          vec2 p = vUv * vec2(uA, 1.0) * 2.4 + uS;
          vec2 w = vec2(fbm(p + uT * 0.06), fbm(p + 5.1 - uT * 0.05));
          float f = fbm(p + w * 2.2 + vec2(0.0, -uP * 2.0));
          float v = f * 0.75 + (1.0 - vUv.y) * 0.55;
          float k = uP * 1.7 - 0.35;
          float d = v - k;
          float ink = smoothstep(0.38, 0.0, abs(d));
          float core = smoothstep(0.16, 0.0, abs(d));
          // full-section dissolve: noise threshold eats the whole screen as uB rises, front glows at the edge
          float fd = f + (1.0 - vUv.y) * 0.18 + uP * 0.1;
          float th = 1.05 - uB * 1.25 * uFill + (1.0 - uFill) * 2.0;
          float dis = smoothstep(th - 0.1, th + 0.1, fd);
          float edge = smoothstep(0.09, 0.0, abs(fd - th)) * (1.0 - smoothstep(0.92, 1.0, uB));
          float a = clamp((ink * 0.5 + core * 0.15) * uB * 0.55 + dis * 0.0, 0.0, 1.0);
          ink = max(ink, dis); core = max(core, edge);
          vec3 col = mix(vec3(0.028, 0.028, 0.029), vec3(0.06, 0.06, 0.062), core * 0.6);
          col += vec3(0.11, 0.11, 0.115) * smoothstep(0.05, 0.0, abs(d - 0.02)) * 0.25 * uB;
          // galaxy inside the smoke: nebula tint, stars streaking outward (warp), brighter on the front
          vec2 q = (vUv - 0.5) * vec2(uA, 1.0); float rq = length(q) + 1e-4; vec2 dq = q / rq;
          float wp = 0.35 + 0.65 * uB;
          float neb = fbm(p * 0.7 + w * 1.5 - uT * 0.02);
          col += mix(vec3(0.05, 0.035, 0.08), vec3(0.03, 0.06, 0.09), neb) * smoothstep(0.35, 0.8, neb) * 0.9 * ink * uGal;
          float sf = 0.0;
          for (int i = 0; i < 3; i++) {
            float L = float(i), sz = 70.0 + L * 55.0;
            float ang = atan(dq.y, dq.x), rad = log(rq) * 2.0 - uT * (0.35 + L * 0.15) - uP * (3.0 + L);
            vec2 g = vec2(ang * sz / 6.2831, rad * sz * 0.05);
            vec2 id = floor(g), fr = fract(g) - 0.5; float rnd = h(id + L * 13.0);
            float streak = smoothstep(0.08, 0.0, abs(fr.x)) * smoothstep(0.5, 0.5 - 0.45 * wp, abs(fr.y));
            sf += step(0.93 - L * 0.02, rnd) * streak * (0.5 + 0.5 * h(id + 3.1)) * smoothstep(0.02, 0.35, rq);
          }
          col += vec3(0.82, 0.85, 0.95) * sf * 0.55 * ink * uGal;
          col += vec3(0.75, 0.78, 0.9) * core * exp(-rq * 3.0) * 0.06 * uGal;
          col += (h(gl_FragCoord.xy + fract(uT) * 77.0) - 0.5) * 0.03;
          gl_FragColor = vec4(col, a);
        }\` });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const size = () => { U.uA.value = innerWidth / innerHeight; if (!r) return; r.setPixelRatio(this.lowPower ? 0.25 : 0.6); r.setSize(innerWidth, innerHeight, false); };
    size(); addEventListener('resize', size);
    const t0 = performance.now();
    const loop = () => {
      if (this.dead) return;
      this.bleedRaf = requestAnimationFrame(loop);
      {
        const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
        { const vh1 = window.__svh || innerHeight, c = this.ctaRef.current, rr = this.reachRef.current;
          if (c) { const q = Math.max(0, Math.min(1, (vh1 - c.getBoundingClientRect().top) / (vh1 * 1.6))); this.rq = this.sceneTween('rq', q); if (q === 0 && this.rq < 0.02) { this.rq = 0; if (this._tw && this._tw.rq) this._tw.rq.v = 0; } }
          if (rr) { const q = Math.max(0, Math.min(1, (vh1 - rr.getBoundingClientRect().top) / (vh1 * 2.4))); this.r3 = this.sceneTween('r3', q); if (q === 0 && this.r3 < 0.02) { this.r3 = 0; if (this._tw && this._tw.r3) this._tw.r3.v = 0; } } }
        const rp = this.rp || 0, rq = this.rq || 0, r3 = this.r3 || 0;
        { const on = (this.props.ditherStyle ?? true) ? 1 : 0; { const pu = this.portrait && this.portrait.post; if (pu && pu.uDither) pu.uDither.value = 0; } [this.hand].forEach((v) => { const u = v && v.post; if (!u) return; if (u.uDither) u.uDither.value = on; if (u.uGrid) u.uGrid.value = this.props.ditherSize ?? 1; if (u.uDitherGray) u.uDitherGray.value = 0; if (u.uDitherInvert) u.uDitherInvert.value = 0; if (u.uStipple) u.uStipple.value = 0; }); }
        const heroD = Math.max(1 - ss(0.3, 0.9, rq), ss(0.1, 0.7, r3), ss(0.15, 0.55, this.ra || 0)), handD = 1 - ss(0.3, 0.9, r3), astroD = ss(0.1, 0.7, r3);
        this.astroD = astroD;
        if (this.portrait && this.portrait.post && this.portrait.post.uDissolve) this.portrait.post.uDissolve.value = heroD;
        if (this.hand && this.hand.post && this.hand.post.uDissolve) this.hand.post.uDissolve.value = handD;
      }
      const on = (this.props.sectionBleed ?? true) && (this.props.sectionRotate ?? true);
      const ts = [[this.rp, 1.3], [this.rq, 4.7], [this.ra, 6.2], [this.r3, 8.1]];
      let best = null, bb = 0;
      for (const [q, sd] of ts) { if (q == null) continue; const b = Math.sin(Math.PI * Math.max(0, Math.min(1, q))); if (b > bb) { bb = b; best = [q, sd]; } }
      if (!on || bb < 0.01 || this.state.page) { if (box.style.display !== 'none') box.style.display = 'none'; if (r && performance.now() - lastOn > 2500) drop(); return; }
      box.style.display = 'block'; lastOn = performance.now(); if (!r) mk();
      U.uP.value = best[0]; U.uS.value = best[1]; U.uFill.value = best[1] === 1.3 ? 0 : 1; U.uGal.value = best[1] === 1.3 ? 1 : 0; { const tgt = best[1] > 2 ? 1 : 0; U.uTint.value += (tgt - U.uTint.value) * 0.15; } U.uB.value = Math.min(1, bb * 1.4); U.uT.value = (performance.now() - t0) / 1000;
      r.render(scene, cam);
    };
    loop();
    this.cleanupBleed = () => { cancelAnimationFrame(this.bleedRaf); removeEventListener('resize', size); mat.dispose(); drop(); };
  }

  initCta(THREE) {
    const box = this.ctaGlRef.current, sec = this.heroRef.current; if (!box || !sec) return;
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uIn: { value: 0 }, uTilt: { value: 0 }, uZoom: { value: 0 }, uDith: { value: 0 }, uWarp: { value: 0 }, uAstro: { value: null }, uAstroOn: { value: 0 }, uFlare: { value: new THREE.Vector3(0, 0, 0) }, uADis: { value: 0 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: (this.props.ctaScene || 'Summit') === 'Summit' ? \`
        precision highp float;
        \${this.ditherGLSL(1.0)}
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uWarp;
        float hs(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hs(i), hs(i+vec2(1,0)), f.x), mix(hs(i+vec2(0,1)), hs(i+vec2(1,1)), f.x), f.y); }
        float fbm4(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 4; i++){ s += a * vn(p); p = m * p; a *= 0.5; } return s; }
        float terr(vec2 p){
          float r = length(p * vec2(1.0, 0.6));
          float base = 3.4 * exp(-r * r * 0.085);
          float tr = smoothstep(0.12, 1.5, abs(p.x));
          float rid = 1.0 - abs(vn(p * 1.1) * 2.0 - 1.0);
          return base + (fbm4(p * 0.55) - 0.5) * 1.1 * (0.25 + 0.75 * tr) + rid * rid * 0.5 * tr - 0.3 * tr * tr;
        }
        float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
        float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
        vec3 CP; float PH; float WIN;
        float hiker(vec3 q){
          float sw = sin(PH) * 0.5 * (1.0 - WIN);
          q.y -= abs(cos(PH)) * 0.03 * (1.0 - WIN);
          float lean = 0.14 * (1.0 - WIN); float cl = cos(lean), sl = sin(lean);
          q.yz = mat2(cl, sl, -sl, cl) * q.yz;
          float d = length(q - vec3(0.0, 0.9, 0.02)) - 0.085;
          d = min(d, sdCap(q, vec3(0.0, 0.48, 0.0), vec3(0.0, 0.78, 0.03), 0.11));
          d = min(d, sdBox(q - vec3(0.0, 0.66, -0.14), vec3(0.1, 0.16, 0.07)) - 0.025);
          vec3 hL = vec3(0.06, 0.48, 0.0), hR = vec3(-0.06, 0.48, 0.0);
          d = min(d, sdCap(q, hL, hL + vec3(0.0, -0.46 * cos(sw), 0.46 * sin(sw)), 0.05));
          d = min(d, sdCap(q, hR, hR + vec3(0.0, -0.46 * cos(sw), -0.46 * sin(sw)), 0.05));
          vec3 sL = vec3(0.14, 0.76, 0.02), sR = vec3(-0.14, 0.76, 0.02);
          vec3 aL = mix(sL + vec3(0.03, -0.36 * cos(sw * 0.8), -0.36 * sin(sw * 0.8)), sL + vec3(0.14, 0.36, 0.05), WIN);
          vec3 aR = mix(sR + vec3(-0.03, -0.36 * cos(sw * 0.8), 0.36 * sin(sw * 0.8)), sR + vec3(-0.14, 0.36, 0.05), WIN);
          d = min(d, sdCap(q, sL, aL, 0.04));
          d = min(d, sdCap(q, sR, aR, 0.04));
          return d;
        }
        float mapT(vec3 p){ return (p.y - terr(p.xz)) * 0.45; }
        float mapC(vec3 p){ vec3 q = p - CP; float b = length(q - vec3(0.0, 0.08, 0.0)); if (b > 0.45) return b - 0.3; return hiker(q / 0.17) * 0.17; }
        float map(vec3 p){ return min(mapT(p), mapC(p)); }
        vec3 nrm(vec3 p, float e){ vec2 k = vec2(e, 0.0); return normalize(vec3(map(p + k.xyy) - map(p - k.xyy), map(p + k.yxy) - map(p - k.yxy), map(p + k.yyx) - map(p - k.yyx))); }
        float shadow(vec3 ro, vec3 rd){ float res = 1.0, t = 0.04; for (int i = 0; i < 20; i++){ float h = map(ro + rd * t); res = min(res, 9.0 * h / t); t += clamp(h, 0.04, 0.45); if (res < 0.01 || t > 8.0) break; } return clamp(res, 0.0, 1.0); }
        float cden(vec3 p){ float b = smoothstep(1.45, 1.72, p.y) * smoothstep(2.35, 1.98, p.y); float n = fbm4(p.xz * 0.42 + vec2(uT * 0.025, uT * 0.012) + p.y * 0.35); return max(0.0, (n - 0.4) * 2.4) * b; }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float e = uP * uP * (3.0 - 2.0 * uP);
          float walk = clamp(e / 0.86, 0.0, 1.0);
          float zc = mix(-7.2, -0.2, walk);
          CP = vec3(0.0, terr(vec2(0.0, zc)), zc);
          WIN = smoothstep(0.88, 0.98, e);
          PH = walk * 46.0;
          float orb = smoothstep(0.82, 1.0, e);
          float ang = orb * 1.45 + uM.x * 0.07;
          float dist = mix(0.95, 2.7, orb);
          vec3 ro = CP + vec3(sin(ang) * dist + 0.22 * (1.0 - orb), mix(0.34, 0.62, orb) + uM.y * 0.03, -cos(ang) * dist);
          ro.y = max(ro.y, terr(ro.xz) + 0.14);
          vec3 ta = CP + vec3(0.0, 0.17, mix(0.7, 0.0, orb));
          vec3 ww = normalize(ta - ro), uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0))), vv = cross(uu, ww);
          vec3 rd = normalize(p.x * uu + p.y * vv + (1.6 - uWarp * 0.18) * ww);
          vec3 L = normalize(vec3(-0.45, 0.2 + 0.08 * e, 1.0));
          float dawn = 0.3 + 0.7 * e;
          float sd = max(dot(rd, L), 0.0);
          vec3 sky = mix(vec3(0.016, 0.018, 0.024), vec3(0.006, 0.007, 0.011), smoothstep(-0.05, 0.6, rd.y));
          sky += vec3(0.55, 0.3, 0.16) * pow(sd, 6.0) * 0.22 * dawn + vec3(1.0, 0.72, 0.45) * pow(sd, 90.0) * 0.5 * dawn + vec3(1.0, 0.9, 0.75) * smoothstep(0.9985, 0.9995, sd) * dawn;
          sky += vec3(0.12, 0.08, 0.06) * exp(-abs(rd.y) * 9.0) * dawn * 0.5;
          float t = 0.02, hitC = 0.0; bool hit = false;
          for (int i = 0; i < 120; i++){
            vec3 q = ro + rd * t; float dT = mapT(q), dC = mapC(q), d = min(dT, dC);
            if (d < 0.0012 * t) { hit = true; hitC = dC < dT ? 1.0 : 0.0; break; }
            t += d; if (t > 34.0) break;
          }
          vec3 col = sky;
          if (hit) {
            vec3 q = ro + rd * t, n = nrm(q, 0.0015 * t + 0.0008);
            float dif = max(dot(n, L), 0.0) * shadow(q + n * 0.01, L);
            vec3 amb = vec3(0.05, 0.06, 0.08) * (0.55 + 0.45 * n.y);
            vec3 sunC = vec3(1.0, 0.68, 0.42) * (1.3 + 1.2 * e);
            if (hitC > 0.5) {
              vec3 base = vec3(0.03, 0.03, 0.032);
              float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0) * (0.3 + max(dot(n, L) + 0.4, 0.0));
              col = base * (amb * 4.0 + sunC * dif) + vec3(1.0, 0.7, 0.45) * rim * 0.55 * dawn;
            } else {
              float snow = smoothstep(0.55, 0.8, n.y) * smoothstep(1.0, 2.2, q.y);
              vec3 rock = mix(vec3(0.035, 0.034, 0.036), vec3(0.06, 0.055, 0.05), fbm4(q.xz * 6.0));
              vec3 alb = mix(rock, vec3(0.42, 0.44, 0.48), snow);
              col = alb * (amb + sunC * dif * 0.55);
              col += vec3(0.6, 0.4, 0.28) * pow(1.0 - max(dot(n, -rd), 0.0), 4.0) * max(dot(n, L), 0.0) * 0.08;
            }
            float fg = 1.0 - exp(-t * 0.075);
            col = mix(col, sky * 0.8 + vec3(0.02, 0.022, 0.028), fg);
          }
          {
            float tA, tB, lim = hit ? t : 40.0;
            if (abs(rd.y) < 0.0005) { tA = 0.0; tB = (ro.y > 1.45 && ro.y < 2.35) ? lim : -1.0; }
            else { float t0 = (1.45 - ro.y) / rd.y, t1 = (2.35 - ro.y) / rd.y; tA = max(min(t0, t1), 0.0); tB = min(max(t0, t1), lim); }
            tB = min(tB, tA + 18.0);
            if (tB > tA) {
              float dt = (tB - tA) / 22.0, tt = tA + dt * hs(fc + fract(uT) * 31.0), T = 1.0; vec3 acc = vec3(0.0);
              for (int i = 0; i < 22; i++){
                vec3 q = ro + rd * tt; float dn = cden(q);
                if (dn > 0.001) {
                  float a = 1.0 - exp(-dn * dt * 2.2);
                  float top = smoothstep(1.7, 2.35, q.y);
                  vec3 cc = mix(vec3(0.07, 0.075, 0.085), vec3(0.42, 0.3, 0.22) * dawn, top * 0.6) + vec3(0.6, 0.4, 0.25) * pow(sd, 4.0) * 0.25 * dawn;
                  cc = mix(cc, sky, 1.0 - exp(-tt * 0.05));
                  acc += T * a * cc; T *= 1.0 - a; if (T < 0.02) break;
                }
                tt += dt;
              }
              col = col * T + acc;
            }
          }
          col = col * 1.15 / (1.0 + col * 0.85);
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col = mix(vec3(lg), col, 0.82);
          col += (hs(fc + 0.0) - 0.5) * 0.018 * (0.3 + lg * 4.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.1 * dot(vu, vu);
          col *= uIn;
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }\` : (this.props.ctaScene || 'Ascent') === 'Mountains' ? \`
        precision highp float;
        \${this.ditherGLSL(1.0)}
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uTilt; uniform float uZoom; uniform float uDith;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }
        float ridge(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ float v = 1.0 - abs(n(p) * 2.0 - 1.0); s += a * v * v; p = m * p; a *= 0.5; } return s; }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float tca = cos(uTilt * 0.1), tsa = sin(uTilt * 0.1);
          p = mat2(tca, tsa, -tsa, tca) * p;
          p *= 1.0 + uZoom * 0.35;
          p.y += uTilt * 0.45;
          float e = uP * uP * (3.0 - 2.0 * uP);
          vec2 lp = vec2(0.42 + uM.x * 0.03, 0.30 - e * 0.08 + uM.y * 0.02);
          vec3 col = mix(vec3(0.003), vec3(0.022), smoothstep(-0.5, 0.6, p.y));
          float ld = length((p - lp) * vec2(1.0, 1.3));
          col += vec3(1.0, 0.97, 0.92) * (0.14 * exp(-ld * 4.5) + 0.025 * exp(-ld * 1.4));
          for (int i = 3; i >= 0; i--) {
            float d = float(i) / 3.0;
            float par = mix(1.0, 0.25, d);
            float rise = mix(-0.75, 0.0, e) * par;
            float x = p.x * mix(1.1, 2.4, d) + d * 4.3 + uM.x * 0.03 * (1.0 - d) + uT * 0.002 * d;
            float hh = -0.32 + d * 0.22 + ridge(vec2(x * 1.1, d * 3.7)) * mix(0.75, 0.35, d) + rise;
            float dy = p.y - hh;
            float m = smoothstep(0.0025, -0.0025, dy);
            float slope = ridge(vec2(x * 1.1 + 0.01, d * 3.7)) - ridge(vec2(x * 1.1 - 0.01, d * 3.7));
            float lit = clamp(0.5 - slope * 12.0 * sign(lp.x - p.x), 0.0, 1.0);
            float snow = exp(-max(-dy, 0.0) * mix(28.0, 60.0, d)) * lit;
            vec3 mc = vec3(mix(0.006, 0.03, d)) + vec3(0.95, 0.94, 0.9) * snow * mix(0.32, 0.08, d);
            mc += fbm(vec2(x * 9.0, p.y * 9.0)) * 0.025 * (1.0 - d);
            col = mix(col, mc, m);
            float haze = exp(-max(dy, 0.0) * 9.0) * (1.0 - m) * mix(0.008, 0.035, d);
            col += vec3(haze);
            vec2 cp = vec2(p.x * mix(1.2, 2.2, d) + uT * mix(0.012, 0.03, d) + d * 9.0, p.y * mix(3.2, 4.5, d) - e * mix(3.2, 1.2, d));
            float c = fbm(cp + fbm(cp * 0.7 + uT * 0.02) * 1.2);
            float band = smoothstep(0.35, -0.1, abs(p.y - (hh + 0.06 + 0.12 * (1.0 - d))) - 0.05);
            float dens = smoothstep(0.48, 0.82, c) * band;
            vec3 cc = vec3(mix(0.26, 0.09, d)) * (0.45 + 0.55 * exp(-length(p - lp) * 2.0));
            col = mix(col, cc, dens * mix(0.75, 0.45, d));
          }
          vec2 cp = vec2(p.x * 1.0 + uT * 0.04, p.y * 1.6 + 1.5 - e * 3.6);
          float fg = smoothstep(0.5, 0.9, fbm(cp + fbm(cp * 0.6 - uT * 0.03)));
          col = mix(col, vec3(0.2), fg * 0.45 * smoothstep(0.0, 0.25, e) * (1.0 - smoothstep(0.75, 1.0, e)));
          float l = dot(col, vec3(0.299, 0.587, 0.114));
          col = vec3(l) * vec3(1.0, 0.985, 0.96);
          col = col * 1.1 / (1.0 + col * 0.8);
          col += (h(fc + 0.0) - 0.5) * 0.06 * (0.35 + l * 3.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.1 * dot(vu, vu);
          col *= uIn;
          {
            vec2 q = mod(floor(fc / 2.0), 4.0); int ix = int(q.x) + int(q.y) * 4;
            float bm[16]; bm[0]=0.;bm[1]=8.;bm[2]=2.;bm[3]=10.;bm[4]=12.;bm[5]=4.;bm[6]=14.;bm[7]=6.;bm[8]=3.;bm[9]=11.;bm[10]=1.;bm[11]=9.;bm[12]=15.;bm[13]=7.;bm[14]=13.;bm[15]=5.;
            float thr = 0.0; for (int k = 0; k < 16; k++) if (k == ix) thr = bm[k];
            thr = (thr + 0.5) / 16.0;
            float Ld = clamp(pow(dot(col, vec3(0.2126, 0.7152, 0.0722)) * 2.2, 0.85), 0.0, 1.0);
            col = mix(col, vec3(step(thr, Ld)) * 0.82, uDith);
          }
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }\` : \`
        precision highp float;
        \${this.ditherGLSL(1.0)}
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uTilt; uniform float uZoom; uniform float uDith; uniform float uWarp; uniform sampler2D uAstro; uniform float uAstroOn; uniform vec3 uFlare; uniform float uADis;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }
        float stars(vec2 fc, float sz, float th){ vec2 g = fc / sz; vec2 id = floor(g); float r = h(id); vec2 o = vec2(h(id + 3.1), h(id + 7.7)) - 0.5; float d = length(fract(g) - 0.5 - o * 0.6); return step(th, r) * smoothstep(0.18, 0.0, d) * (0.4 + 0.6 * h(id + 1.7)); }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float tc = cos(uTilt * 0.1), ts = sin(uTilt * 0.1);
          p = mat2(tc, ts, -ts, tc) * p; p *= 1.0 + uZoom * 0.3; p.y += uTilt * 0.4;
          p += uM * vec2(0.012, 0.008);
          float alt = uP * uP * (3.0 - 2.0 * uP);
          vec3 L = normalize(vec3(0.75, 0.42, 0.35));
          // deep space
          vec3 col = vec3(0.0035, 0.004, 0.006);
          float band = exp(-pow((p.y * 0.9 - p.x * 0.45 + 0.05) * 3.2, 2.0));
          float mw = fbm(p * 3.5 + 11.0) * fbm(p * 9.0 - 3.0);
          col += vec3(0.05, 0.05, 0.065) * band * smoothstep(0.15, 0.55, mw) * smoothstep(0.3, 0.8, alt);
          vec2 cen = 0.5 * uRes, dv = fc - cen;
          float fly = 1.0 / (1.0 + alt * 0.55 + uZoom * 0.0);
          float sf = 0.0;
          for (int i = 0; i < 7; i++) {
            float k = float(i) / 6.0;
            vec2 f2 = cen + dv * fly * (1.0 - k * uWarp * 0.6);
            float w = 1.0 - k * 0.55;
            sf += (stars(f2, 3.0, 0.992) * 0.55 + stars(f2, 7.0, 0.985) * 0.8 + stars(f2, 17.0, 0.975) * 1.0) * w;
          }
          sf /= 1.0 + 3.2 * (1.0 - min(uWarp, 1.0) * 0.7);
          sf *= 1.0 + uWarp * 0.8;
          sf *= 0.75 + 0.25 * sin(uT * 0.25 + h(floor(fc / 7.0)) * 40.0);
          col += vec3(0.82, 0.86, 1.0) * sf * 0.55 * max(min(uWarp * 1.5, 1.0), smoothstep(0.25, 0.75, alt));
          // sun, small and hot, soft bloom
          vec2 sp = vec2(0.78, 0.36);
          float sd = length(p - sp);
          col += vec3(1.0, 0.94, 0.86) * (0.9 * exp(-sd * 90.0) + 0.06 * exp(-sd * 9.0) + 0.012 * exp(-sd * 2.0)) * smoothstep(0.2, 0.7, alt);
          if (uAstroOn > 0.5) {
            vec4 asx = texture2D(uAstro, uv);
            vec3 ac = asx.rgb * 1.15; ac = clamp((ac * (2.51 * ac + 0.03)) / (ac * (2.43 * ac + 0.59) + 0.14), 0.0, 1.0); ac = pow(ac, vec3(1.0 / 2.2));
            float adn = fbm(uv * vec2(uRes.x / uRes.y, 1.0) * 3.2 + vec2(0.0, uT * 0.04));
            float adk = uADis * 1.15 - 0.05;
            float akeep = smoothstep(adk - 0.04, adk + 0.04, adn);
            float arim = smoothstep(0.07, 0.0, abs(adn - adk)) * step(0.001, uADis) * (1.0 - smoothstep(0.9, 1.0, uADis));
            float aa = clamp(asx.a, 0.0, 1.0);
            col += ac * aa * akeep * \${Math.max(0.08, this.props.galaxyBright ?? 0.14).toFixed(3)};
          }
          if (uFlare.z > 0.0) {
            vec2 fd = (fc - uFlare.xy * uRes) / uRes.y;
            float fl = exp(-length(fd) * 120.0) * 1.4 + exp(-length(fd) * 22.0) * 0.12;
            fl += (exp(-abs(fd.y) * 900.0) * exp(-abs(fd.x) * 28.0) + exp(-abs(fd.x) * 900.0) * exp(-abs(fd.y) * 28.0)) * 0.7;
            col += vec3(1.0, 0.97, 0.92) * fl * uFlare.z * (1.0 - uADis);
          }
          // planet as a real sphere
          float R0 = 2.4;
          vec2 pc = vec2(0.0, -80.0); // globe removed
          vec2 dq = (p - pc) / R0;
          float r2 = dot(dq, dq);
          float pd = (sqrt(r2) - 1.0) * R0;
          if (r2 < 1.0) {
            vec3 nn = vec3(dq, sqrt(1.0 - r2));
            float lon = atan(nn.x, nn.z) * 2.2 + uT * 0.004 + uP * 3.2, lat = asin(nn.y) * 2.2;
            vec2 gp = vec2(lon, lat) * 2.2;
            float landN = fbm(gp + 5.0);
            float land = smoothstep(0.5, 0.56, landN);
            vec3 ocean = mix(vec3(0.004, 0.014, 0.034), vec3(0.008, 0.03, 0.06), fbm(gp * 2.0));
            vec3 ground = mix(vec3(0.032, 0.04, 0.022), vec3(0.075, 0.06, 0.04), fbm(gp * 4.0));
            ground = mix(ground, vec3(0.11, 0.1, 0.09), smoothstep(0.62, 0.8, landN) * 0.5);
            vec3 sc = mix(ocean, ground, land);
            float cl = smoothstep(0.48, 0.78, fbm(gp * 1.6 - vec2(uT * 0.006, 0.0) + fbm(gp * 3.0) * 0.6));
            float dif = dot(nn, L);
            float day = smoothstep(-0.08, 0.25, dif);
            vec3 lit = sc * max(dif, 0.0) * 0.9 + vec3(0.34, 0.35, 0.37) * cl * max(dif, 0.0) * 0.6;
            float spec = pow(max(dot(reflect(-L, nn), vec3(0.0, 0.0, 1.0)), 0.0), 40.0) * (1.0 - land) * (1.0 - cl);
            lit += vec3(0.6, 0.55, 0.45) * spec * 0.22;
            float cityN = step(0.93, h(floor(gp * 60.0))) * land * (1.0 - cl);
            vec3 night = vec3(1.0, 0.62, 0.3) * cityN * 0.4 * (1.0 - day);
            vec3 pcol = mix(night + sc * 0.03, lit, day);
            float limb = pow(1.0 - nn.z, 3.0);
            pcol += vec3(0.12, 0.26, 0.6) * limb * smoothstep(-0.25, 0.4, dif) * 0.75;
            col = mix(col, pcol, smoothstep(0.0, 0.004, -pd));
          }
          vec2 ndir = normalize(dq);
          float dayRim = smoothstep(-0.35, 0.5, dot(vec3(ndir, 0.0), L));
          float atm = exp(-max(pd, 0.0) * 55.0) * step(0.0, pd) + exp(-abs(pd) * 160.0);
          col += vec3(0.16, 0.34, 0.8) * atm * dayRim * 0.6;
          col += vec3(0.08, 0.16, 0.38) * exp(-max(pd, 0.0) * 12.0) * step(0.0, pd) * dayRim * 0.12;
          col += vec3(0.5, 0.35, 0.25) * exp(-abs(pd) * 260.0) * smoothstep(-0.2, 0.15, dot(vec3(ndir, 0.0), L)) * smoothstep(0.25, -0.05, dot(vec3(ndir, 0.0), L)) * 0.25;
          // night cloud deck you climb out of
          for (int i = 0; i < 3; i++) {
            float d = float(i) / 2.0;
            vec2 cp = vec2(p.x * mix(0.9, 1.7, d) + uT * mix(0.012, 0.03, d) + d * 7.0, p.y * mix(1.4, 2.4, d) + alt * mix(4.0, 2.0, d) + d * 3.0);
            float c = fbm(cp + fbm(cp * 0.6 + uT * 0.01) * 1.3);
            float dens = smoothstep(0.44, 0.8, c);
            float top = smoothstep(0.35, 0.9, fbm(cp * 1.8 + 2.0));
            vec3 cc = vec3(0.05, 0.058, 0.07) * (0.6 + 0.8 * top) + vec3(0.12, 0.11, 0.1) * top * exp(-length(p - sp) * 1.4) * 0.4;
            float fadeOut = 1.0 - smoothstep(0.28 - d * 0.08, 0.55 - d * 0.08, alt);
            /* cloud deck removed for galaxy */
          }
          col = col * 1.1 / (1.0 + col * 0.9);
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col += (h(fc + 0.0) - 0.5) * 0.02 * (0.3 + lg * 4.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.0 * dot(vu, vu);
          col *= uIn;
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }\` });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let lastW = 0;
    const size = () => { const w = box.clientWidth, hh = box.clientHeight; if (!w || !hh) return; if (this.coarse && w === lastW) return; lastW = w; const pr = this.lowPower ? 0.4 : Math.min(1, 1300 / w); r.setPixelRatio(pr); r.setSize(w, hh, false); U.uRes.value.set(w * pr, hh * pr); };
    const ro = new ResizeObserver(size); ro.observe(box); size();
    const mm = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => { mm.x = e.clientX / innerWidth * 2 - 1; mm.y = -(e.clientY / innerHeight * 2 - 1); };
    window.addEventListener('pointermove', onMove);
    let sp = 0, inS = 0, warp = 0, lastTop = null, astroLoading = false, astroOn = false; const t0 = performance.now();
    const expo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const AS = { scene: null, cam: null, model: null, rt: null };
    const loadAstro = async () => {
      astroLoading = true;
      try {
        const [T3, GL, MO] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')]);
        if (this.dead) return;
        const loader = new GL.GLTFLoader(); loader.setMeshoptDecoder(MO.MeshoptDecoder);
        const url = (this.props.galaxyModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/galaxy.glb';
        const g = await loader.loadAsync(url); if (this.dead) return;
        const m = g.scene;
        m.traverse((o) => { if (o.isMesh || o.isPoints) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { mt.transparent = true; mt.depthWrite = false; mt.blending = T3.AdditiveBlending; mt.toneMapped = false; if (mt.emissive && mt.map && !mt.emissiveMap) { mt.emissiveMap = mt.map; mt.emissive.set(0xffffff); } }); } });
        const bb = new T3.Box3().setFromObject(m), sz = bb.getSize(new T3.Vector3()), cn = bb.getCenter(new T3.Vector3());
        const k = 1 / Math.max(sz.x, sz.y, sz.z); m.position.sub(cn.multiplyScalar(k)); m.scale.setScalar(k);
        const pivot = new T3.Group(); pivot.add(m);
        const sc = new T3.Scene(); sc.add(pivot);
        const key = new T3.DirectionalLight(0xfff6ee, 2.6); key.position.set(-1.6, 2.4, 2.4); sc.add(key);
        const rim = new T3.DirectionalLight(0xdfe8ff, 2.0); rim.position.set(2.4, 1.4, -2.2); sc.add(rim);
        const fillL = new T3.DirectionalLight(0x8fa6c8, 0.35); fillL.position.set(0, -2, 1.5); sc.add(fillL);
        sc.add(new T3.HemisphereLight(0xcfd8e8, 0x050506, 0.25));
        try { const RE = await import('https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js'); const pm = new T3.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; } catch (e) {}
        const bb2 = new T3.Box3().setFromObject(pivot), s2 = bb2.getSize(new T3.Vector3()); AS.visor = new T3.Vector3(-s2.x * 0.08, bb2.max.y - s2.y * 0.12, bb2.max.z * 0.9); AS.T3 = T3;
        const cam = new T3.PerspectiveCamera(24, 1, 0.1, 50); cam.position.set(0, 0, 4.2);
        AS.scene = sc; AS.cam = cam; AS.model = pivot;
        AS.rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true });
        U.uAstro.value = AS.rt.texture;
      } catch (e) { console.warn('astronaut failed', e); }
    };
    const loop = () => {
      if (this.dead) return;
      this.ctaRaf = requestAnimationFrame(loop);
      {
        const r0 = sec.getBoundingClientRect(), vh0 = (window.__svh || innerHeight);
        if (false && !astroLoading && (this.props.galaxyBg ?? true)) loadAstro(); // galaxy parked
        const v0 = r0.top < vh0 && r0.bottom > 0;
        const dy = lastTop == null ? 0 : Math.abs(r0.top - lastTop); lastTop = r0.top;
        const tw = v0 ? Math.min(1, dy / (vh0 * 0.035)) : 0;
        warp += (tw - warp) * (tw > warp ? 0.12 : 0.045);
      }
      const rc = sec.getBoundingClientRect(), vh = (window.__svh || innerHeight);
      const vis = !this.state.page;
      const now = performance.now();
      {
        const into = 3;
        sec.querySelectorAll('[data-cg]').forEach((g, gi) => {
          g.querySelectorAll('[data-cw]').forEach((w, j) => {
            const t = Math.max(0, Math.min(1, (into - 1.25 - gi * 0.3 - j * 0.07) / 0.55)), e = 1 - Math.pow(1 - t, 3);
            w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110).toFixed(2) + '%,0) rotate(' + ((1 - e) * 4).toFixed(2) + 'deg)';
            w.style.filter = t >= 1 || t <= 0 ? '' : 'blur(' + ((1 - e) * 14).toFixed(2) + 'px)'; w.style.opacity = (0.15 + 0.85 * e).toFixed(3);
          });
        });
      }
      if ((this.rp || 0) > 0.995) { if (box.style.opacity !== '0') box.style.opacity = '0'; if (box.style.visibility !== 'hidden') box.style.visibility = 'hidden'; return; }
      if (!vis) return;
      const tp = Math.max(0, Math.min(1, this.rp || 0));
      sp += (tp - sp) * 0.06;
      inS += (1 - inS) * 0.05;
      mm.sx += (mm.x - mm.sx) * 0.04; mm.sy += (mm.y - mm.sy) * 0.04;
      U.uP.value = sp; U.uIn.value = inS;
      { // warp = scroll speed + the fall itself; eased so streaks stretch and relax smoothly
        const rpN = this.rp || 0, nw = performance.now(), dtw = Math.max(0.001, Math.min(0.05, (nw - (this._wT || nw)) / 1000)); this._wT = nw;
        const vel = Math.abs(rpN - (this._wRp ?? rpN)) / dtw; this._wRp = rpN;
        const fall = Math.sin(Math.PI * Math.min(1, rpN));
        const tgt = Math.min(1, fall * 0.55 + vel * 1.4) * (this.props.warpAmount ?? 1);
        this._warp = (this._warp || 0) + (tgt - (this._warp || 0)) * (1 - Math.exp(-dtw * (tgt > (this._warp || 0) ? 5 : 1.6)));
        U.uWarp.value = this._warp;
      }
      { const rpv = this.rp || 0, k = Math.max(0, Math.min(1, (rpv - 0.82) / 0.16)), out = k * k * (3 - 2 * k); const go = ((this.props.galaxyOpacity ?? 1) * (1 - out)).toFixed(3); if (box.style.opacity !== go) box.style.opacity = go; const vv = out > 0.999 ? 'hidden' : ''; if (box.style.visibility !== vv) box.style.visibility = vv; }
      if (AS.model) {
        // galaxy backdrop: slow spin, tilted disc; scrolling flies the camera into it
        const tt = (now - t0) / 1000, ee = sp * sp * (3 - 2 * sp);
        const W1 = U.uRes.value.x, H1 = U.uRes.value.y, asp = W1 / Math.max(1, H1);
        if (AS.rt.width !== W1 || AS.rt.height !== H1) AS.rt.setSize(W1, H1);
        AS.cam.aspect = asp; AS.cam.fov = 50; AS.cam.position.set(mm.sx * 0.05, mm.sy * 0.03, 1.05); AS.cam.lookAt(0, 0, 0); AS.cam.updateProjectionMatrix();
        AS.model.position.set(0, 0, 0);
        AS.model.rotation.set(0.55, 0, 0.3);
        AS.model.rotateY(tt * 0.02);
        AS.model.scale.setScalar(2.6 * Math.max(1, asp / 1.6) * (this.props.galaxySize ?? 1));
        r.setRenderTarget(AS.rt); r.setClearColor(0x000000, 0); r.clear(true, true, true); r.render(AS.scene, AS.cam); r.setRenderTarget(null);
        U.uAstroOn.value = 1; U.uADis.value = 0; U.uFlare.value.set(0, 0, 0);
      } U.uTilt.value = this.ctaTilt || 0; U.uZoom.value = this.ctaZoom || 0; U.uM.value.set(mm.sx, mm.sy); U.uT.value = (now - t0) / 1000;
      r.render(scene, cam);
    };
    loop();
    this.cleanupCta = () => { cancelAnimationFrame(this.ctaRaf); ro.disconnect(); window.removeEventListener('pointermove', onMove); mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); };
  }

  initReveals(THREE) {
    const MAXM = 6;
    let r = null, scene, cam, meshes = [], mounted = null;
    const vs = \`uniform vec4 uRect; varying vec2 vUv;
      void main(){ vUv = uv; vec2 p = uRect.xy + (position.xy * 0.5 + 0.5) * uRect.zw; gl_Position = vec4(p, 0.0, 1.0); }\`;
    const fs = \`uniform float uP; uniform float uT; uniform vec2 uPx; uniform float uSeed; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.02 + 7.3; a *= 0.5; } return s; }
      void main(){
        vec2 asp = vec2(uPx.x / uPx.y, 1.0);
        vec2 p = vUv * asp * 2.2 + uSeed;
        vec2 w = vec2(fbm(p + uT * 0.06), fbm(p + 5.1 - uT * 0.05));
        float f = fbm(p + w * 2.2 + vec2(0.0, -uP * 1.6));
        float v = f * 0.75 + (1.0 - vUv.y) * 0.45;
        float k = uP * 1.55 - 0.3;
        float d = v - k;
        float cover = smoothstep(-0.02, 0.22, d);
        float rim = smoothstep(0.1, 0.0, abs(d - 0.04)) * (1.0 - smoothstep(0.85, 1.0, uP));
        vec3 col = vec3(0.03, 0.03, 0.031) + vec3(0.12, 0.12, 0.125) * rim * 0.25;
        col += (h(gl_FragCoord.xy + fract(uT) * 77.0) - 0.5) * 0.03;
        gl_FragColor = vec4(col, clamp(cover + rim * 0.25, 0.0, 1.0));
      }\`;
    const build = (box) => {
      if (r) { box.appendChild(r.domElement); mounted = box; size(); return; }
      r = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1 : 2)); r.setClearColor(0, 0); r.autoClear = true;
      r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      box.appendChild(r.domElement); mounted = box;
      scene = new THREE.Scene(); cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geo = new THREE.PlaneGeometry(2, 2);
      meshes = [];
      for (let i = 0; i < MAXM; i++) {
        const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ transparent: true, depthTest: false, vertexShader: vs, fragmentShader: fs,
          uniforms: { uRect: { value: new THREE.Vector4() }, uP: { value: 0 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2(1, 1) }, uSeed: { value: i * 7.31 } } }));
        m.frustumCulled = false; m.visible = false; scene.add(m); meshes.push(m);
      }
      size();
    };
    const size = () => { if (r) r.setSize(window.innerWidth, window.innerHeight, false); };
    window.addEventListener('resize', size);
    const expo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    this.updateReveals = (pgEl, now) => {
      const box = this.curtainRef.current;
      if (!box || !pgEl) return;
      if (mounted !== box) build(box);
      const vh = (window.__svh || window.innerHeight), vw = window.innerWidth;
      const live = (this.visK || 0) > 0.6;
      if (this.rvReset) { pgEl.querySelectorAll('[data-rg],[data-media]').forEach(el => delete el.dataset.st); this.rvReset = false; }
      box.style.opacity = String(this.visK || 0);
      pgEl.querySelectorAll('[data-rg]').forEach((g) => {
        const rc = g.getBoundingClientRect();
        if (!g.dataset.st && live && rc.top < vh * 0.9 && rc.bottom > 0) g.dataset.st = String(now);
        const st = +g.dataset.st || 0;
        g.querySelectorAll('[data-w]').forEach((w, j) => {
          const t = st ? Math.max(0, Math.min(1, (now - st - j * 32) / 1100)) : 0;
          const e = expo(t);
          w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 5) + 'deg)';
        });
      });
      let mi = 0;
      pgEl.querySelectorAll('[data-media]').forEach((m) => {
        const rc = m.getBoundingClientRect();
        if (!m.dataset.st && live && rc.top < vh * 0.72 && rc.bottom > 0) m.dataset.st = String(now + 250);
        const st = +m.dataset.st || 0;
        const t = st ? Math.max(0, Math.min(1, (now - st) / 3200)) : 0;
        const e = 1 - Math.pow(1 - t, 3);
        const inner = m.firstElementChild;
        const par = ((rc.top + rc.height / 2) - vh / 2) / vh;
        if (inner) inner.style.transform = 'translate3d(0,' + (par * -7) + '%,0) scale(' + (1.22 - 0.22 * e) + ')';
        const tt = (now % 60000) / 1000, sd = (mi) * 7.31, pe = t * (2 - t) * 0.5 + e * 0.5;
        m.style.opacity = '';
        m.style.clipPath = t > 0 ? 'none' : 'inset(0 0 100% 0)';
        const mesh = meshes[mi++]; if (!mesh) return;
        const onScr = rc.bottom > 0 && rc.top < vh && t > 0 && t < 1;
        mesh.visible = onScr;
        if (!onScr) return;
        const u = mesh.material.uniforms;
        const pad = 4;
        u.uRect.value.set((rc.left - pad) / vw * 2 - 1, 1 - (rc.bottom + pad) / vh * 2, (rc.width + pad * 2) / vw * 2, (rc.height + pad * 2) / vh * 2);
        u.uP.value = pe; u.uT.value = tt; u.uPx.value.set(rc.width + 8, rc.height + 8);
      });
      for (; mi < meshes.length; mi++) meshes[mi].visible = false;
      r.render(scene, cam);
    };
    this.releaseReveals = () => { if (!r) return; meshes.forEach(m => m.material.dispose()); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; mounted = null; meshes = []; };
    this.cleanupReveals = () => { window.removeEventListener('resize', size); this.updateReveals = null; if (r) { r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); } };
  }

  initBg(THREE) {
    const box = this.bgRef.current; if (!box) return;
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: false });
    r.setPixelRatio(this.lowPower ? 0.35 : Math.min(1, 1400 / Math.max(window.innerWidth, 1)));
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const gc = document.createElement('canvas'); const GN = 16, GS = 48;
    gc.width = GN * GS; gc.height = GS;
    const gx = gc.getContext('2d');
    gx.fillStyle = '#000'; gx.fillRect(0, 0, gc.width, gc.height);
    gx.fillStyle = '#fff'; gx.font = '400 ' + Math.round(GS * 0.78) + 'px "JetBrains Mono", monospace';
    gx.textAlign = 'center'; gx.textBaseline = 'middle';
    ' .\\'-:;~=+*o%#&@$'.split('').slice(0, GN).forEach((ch, k) => gx.fillText(ch, k * GS + GS / 2, GS / 2 + 2));
    const gtex = new THREE.CanvasTexture(gc);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uM: { value: new THREE.Vector2(-999, -999) }, uMI: { value: 0 }, uScroll: { value: 0 }, uSilk: { value: 1 }, uAscii: { value: 1 }, uGrain: { value: 1 }, uGlyph: { value: gtex }, uCell: { value: 11 }, uDark: { value: 0 }, uRelief: { value: 0.35 }, uLight: { value: 0 }, uM2: { value: new THREE.Vector2(-999, -999) } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: \`
      precision highp float;
        \${this.ditherGLSL(1.0)}
      uniform vec2 uRes; uniform float uT; uniform vec2 uM; uniform float uMI; uniform float uScroll;
      uniform float uSilk; uniform float uAscii; uniform float uRelief; uniform float uLight; uniform vec2 uM2; uniform float uGrain; uniform sampler2D uGlyph; uniform float uCell; uniform float uDark;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++){ s += a * vn(p); p = m * p; a *= 0.5; } return s; }
      float field(vec2 p){
        float t = uT;
        vec2 q = vec2(fbm(p + vec2(0.0, t * 0.035)), fbm(p + vec2(5.2, 1.3) - t * 0.028));
        vec2 r = vec2(fbm(p + 2.8 * q + vec2(1.7, 9.2) + t * 0.04), fbm(p + 2.8 * q + vec2(8.3, 2.8) - t * 0.03));
        return fbm(p + 2.2 * r);
      }
      void main(){
        vec2 fc = gl_FragCoord.xy;
        float sc = 1.25 / uRes.y;
        vec2 p = fc * sc; p.y += uScroll;
        vec2 mp = uM * sc; mp.y += uScroll;
        vec2 d = p - mp; float md = length(d);
        p -= d * 0.35 * exp(-md * md * 9.0) * uMI;
        float e = 0.0035;
        float f = field(p);
        float fx = field(p + vec2(e, 0.0));
        float fy = field(p + vec2(0.0, e));
        vec3 n = normalize(vec3(-(fx - f) / e * uRelief, -(fy - f) / e * uRelief, 1.0));
        vec3 P3 = vec3(p, f * 0.08);
        vec3 V = vec3(0.0, 0.0, 1.0);
        float band = smoothstep(0.2, 0.9, f);
        vec3 albedo = mix(vec3(0.010, 0.011, 0.014), vec3(0.12, 0.115, 0.108), band);
        vec3 col = albedo * 0.16;
        vec3 Lk = normalize(vec3(-0.6, 0.7, 0.45));
        col += albedo * max(dot(n, Lk), 0.0) * 0.22;
        vec3 Lp = vec3(mp, 0.16 + 0.06 * (1.0 - uMI));
        vec3 Ld = Lp - P3; float dist2 = dot(Ld.xy, Ld.xy); Ld = normalize(Ld);
        float att = 1.0 / (1.0 + dist2 * 26.0);
        float dif = clamp((dot(n, Ld) + 0.45) / 1.45, 0.0, 1.0); dif *= dif;
        vec3 H = normalize(Ld + V);
        float spe = pow(max(dot(n, H), 0.0), 12.0);
        vec3 warm = vec3(1.0, 0.93, 0.84);
        col += warm * (albedo * dif * 2.4 + spe * 0.035 * band) * att * uLight;
        col += vec3(1.0, 0.86, 0.7) * 0.07 * exp(-dist2 * 5.0) * uLight;
        col += vec3(1.0, 0.9, 0.78) * 0.018 * exp(-abs(P3.y - Lp.y) * 22.0) * exp(-abs(P3.x - Lp.x) * 1.6) * uLight;
        vec2 lp2 = uM2 * sc; lp2.y += uScroll;
        vec3 Lq = vec3(lp2, 0.22) - P3; float dq2 = dot(Lq.xy, Lq.xy); Lq = normalize(Lq);
        float attq = 1.0 / (1.0 + dq2 * 12.0);
        vec3 cool = vec3(0.62, 0.72, 1.0);
        col += cool * albedo * clamp((dot(n, Lq) + 0.3) / 1.3, 0.0, 1.0) * attq * uLight * 0.35;
        float rim = pow(1.0 - max(n.z, 0.0), 2.0);
        col += warm * rim * att * 0.03 * uLight;
        col = mix(vec3(0.02), col, uSilk);
        vec2 cid = floor(fc / uCell); vec2 cc = (cid + 0.5) * uCell;
        float cd = length((cc - uM) / uRes.y);
        float edge = vn(cid * 0.22 + uT * 0.6);
        float mask = smoothstep(0.26 + 0.08 * uMI, 0.02, cd + (edge - 0.5) * 0.12) * uMI * uAscii;
        if (mask > 0.01) {
          vec2 cp = cc * sc; cp.y += uScroll;
          vec2 cdv = cp - mp; cp -= cdv * 0.35 * exp(-dot(cdv, cdv) * 9.0) * uMI;
          float fa = field(cp);
          float lum = clamp((fa - 0.25) * 1.6 + mask * 0.25, 0.0, 0.999);
          float gi = floor(lum * 16.0);
          vec2 guv = fract(fc / uCell);
          float gl = texture2D(uGlyph, vec2((gi + guv.x) / 16.0, guv.y)).r;
          col *= 1.0 - mask * 0.55;
          col += vec3(0.80, 0.79, 0.75) * gl * mask * (0.25 + 0.75 * lum);
        }
        {
          vec2 cuv = fc / uRes;
          vec2 cq = (fc - 0.5 * uRes) / uRes.y;
          vec2 Ls = vec2(-0.45 + 0.1 * sin(uT * 0.045), 0.95);
          vec2 dv = cq - Ls;
          float ang = atan(dv.x, -dv.y), rl = length(dv);
          float shafts = vn(vec2(ang * 9.0, uT * 0.05)) * vn(vec2(ang * 23.0 + 3.0, -uT * 0.035));
          shafts = smoothstep(0.06, 0.55, shafts);
          float smoke = fbm(cq * 1.3 + vec2(uT * 0.015, -uT * 0.022) + fbm(cq * 0.8 - uT * 0.01));
          smoke = smoothstep(0.32, 0.88, smoke);
          float vol = shafts * exp(-rl * 1.05) * (0.35 + smoke);
          col *= 0.5;
          col += vec3(0.86, 0.8, 0.7) * vol * 0.2;
          col += vec3(0.55, 0.58, 0.64) * smoke * 0.03 * (1.1 - cuv.y * 0.6);
          col += vec3(0.9, 0.82, 0.7) * 0.05 * exp(-rl * 2.6);
          vec2 mq = uM / uRes.y - 0.5 * vec2(uRes.x / uRes.y, 1.0);
          float fl = exp(-abs(cq.y - mq.y) * 70.0) * exp(-abs(cq.x - mq.x) * 1.4);
          col += vec3(0.62, 0.72, 0.92) * fl * 0.06 * uLight;
          col += vec3(1.0, 0.9, 0.78) * exp(-length(cq - mq) * 12.0) * 0.035 * uLight * (0.4 + smoke);
          col *= smoothstep(0.0, 0.07, cuv.y) * 0.25 + 0.75;
        }
        float lg = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(lg), 0.35);
        col += mix(vec3(-0.004, 0.002, 0.008), vec3(0.012, 0.004, -0.008), smoothstep(0.02, 0.16, lg));
        col = col * 1.15 / (1.0 + col * 0.6);
        float gA = hash(fc + 0.0) - 0.5;
        float gB = hash(floor(fc * 0.5) + 0.0) - 0.5;
        float lumG = dot(col, vec3(0.333));
        col += (gA * 0.075 + gB * 0.04) * uGrain * (0.7 + lumG * 3.0);
        vec2 vu = fc / uRes - 0.5;
        col *= 1.0 - 0.55 * dot(vu, vu);
        col *= 1.0 - uDark;
        gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
      }\` });
    const scene = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let lastBgW = 0;
    const size = () => { const w = window.innerWidth, h = (window.__svh || window.innerHeight); if (this.coarse && w === lastBgW) return; lastBgW = w; r.setPixelRatio(this.lowPower ? 0.35 : Math.min(1, 1400 / Math.max(w, 1))); r.setSize(w, h, false); const pr = r.getPixelRatio(); U.uRes.value.set(w * pr, h * pr); U.uPR = pr; };
    size(); window.addEventListener('resize', size);
    const m = { x: -999, y: -999, sx: -999, sy: -999, s2x: -999, s2y: -999, lx: 0, ly: 0, act: 0, on: false, lit: 0 };
    const onMove = (e) => { m.x = e.clientX; m.y = window.innerHeight - e.clientY; if (!m.on) { m.sx = m.s2x = m.x; m.sy = m.s2y = m.y; m.on = true; } };
    const onOut = (e) => { if (!e.relatedTarget) m.on = false; };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerout', onOut);
    const t0 = performance.now();
    const loop = () => {
      if (this.dead) return;
      this.bgRaf = requestAnimationFrame(loop);
      const P = this.props, mode = 'Off';
      r.domElement.style.visibility = mode === 'Off' ? 'hidden' : 'visible';
      if (mode === 'Off') return;
      if (this.state.page && (this.visK || 0) > 0.99) return;
      if (this.lowPower) { this.bgSkip = !this.bgSkip; if (this.bgSkip) return; }
      m.sx += (m.x - m.sx) * 0.085; m.sy += (m.y - m.sy) * 0.085;
      const sp = Math.hypot(m.sx - m.lx, m.sy - m.ly); m.lx = m.sx; m.ly = m.sy;
      m.act += ((m.on ? Math.min(1, 0.45 + sp / 14) : 0) - m.act) * 0.05;
      m.s2x += (m.x - m.s2x) * 0.025; m.s2y += (m.y - m.s2y) * 0.025;
      m.lit += ((m.on ? 0.75 + Math.min(0.5, sp / 20) : 0.18) - m.lit) * 0.04;
      const pr = U.uPR || 1; U.uM.value.set(m.sx * pr, m.sy * pr); U.uM2.value.set(m.s2x * pr, m.s2y * pr); U.uMI.value = m.act * 0.4;
      U.uLight.value = m.lit * (P.lightIntensity ?? 1);
      U.uRelief.value = 0.2 * (P.relief ?? 1);
      U.uT.value = (performance.now() - t0) / 1000 * (P.bgSpeed ?? 1);
      U.uScroll.value = (window.__scrollY ? window.__scrollY() : window.scrollY) / window.innerHeight * 0.18;
      U.uSilk.value += ((mode === 'ASCII' ? 0 : 1) - U.uSilk.value) * 0.08;
      U.uAscii.value += ((mode === 'Silk' ? 0 : 1) - U.uAscii.value) * 0.08;
      U.uGrain.value = P.grain ?? 1.4;
      U.uDark.value = Math.max(0, Math.min(1, this.openT || 0)) * 0.6;
      r.render(scene, cam);
      const wr = this.workRef.current;
      const cp = this.silkCopy || (this.silkCopy = wr && wr.querySelector('[data-silk-copy]'));
      if (cp && wr) {
        const rc = wr.getBoundingClientRect(), vh = window.innerHeight;
        if (rc.top < vh && rc.bottom > 0) {
          const src = r.domElement;
          if (cp.width !== src.width || cp.height !== src.height) { cp.width = src.width; cp.height = src.height; }
          const cx = this.silkCtx || (this.silkCtx = cp.getContext('2d'));
          cx.drawImage(src, 0, 0);
          cp.style.transform = (this.props.sectionRotate ?? true) ? 'none' : 'translate3d(0,' + (-Math.max(0, rc.top)) + 'px,0)';
        }
      }
    };
    loop();
    this.cleanupBg = () => {
      cancelAnimationFrame(this.bgRaf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      gtex.dispose(); mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  }

  initInk(THREE) {
    const box = this.inkRef.current; if (!box || this.coarse) return;
    const r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    r.setClearColor(0x000000, 0);
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    let A = new THREE.WebGLRenderTarget(4, 4, opts), B = new THREE.WebGLRenderTarget(4, 4, opts);
    const noise = \`
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }\`;
    const vs = \`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }\`;
    const simU = { uPrev: { value: null }, uA: { value: new THREE.Vector2(-9, -9) }, uB: { value: new THREE.Vector2(-9, -9) }, uR: { value: 0.02 }, uAspect: { value: 1 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2() }, uDecay: { value: 0.975 } };
    const sim = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: simU, vertexShader: vs, fragmentShader: \`
      uniform sampler2D uPrev; uniform vec2 uA; uniform vec2 uB; uniform float uR; uniform float uAspect; uniform float uT; uniform vec2 uPx; uniform float uDecay;
      varying vec2 vUv; \${noise}
      float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * t); }
      void main(){
        vec2 q = vUv * vec2(uAspect, 1.0) * 4.0;
        float e = 0.05;
        float nx = n2(q + vec2(0.0, e) + uT * 0.3) - n2(q - vec2(0.0, e) + uT * 0.3);
        float ny = n2(q + vec2(e, 0.0) + uT * 0.3) - n2(q - vec2(e, 0.0) + uT * 0.3);
        vec2 curl = vec2(nx, -ny) * 0.012;
        vec2 uv = vUv - curl + vec2(0.0, 0.0006);
        float v = texture2D(uPrev, uv).r * 0.6
          + (texture2D(uPrev, uv + vec2(uPx.x, 0.0)).r + texture2D(uPrev, uv - vec2(uPx.x, 0.0)).r
          +  texture2D(uPrev, uv + vec2(0.0, uPx.y)).r + texture2D(uPrev, uv - vec2(0.0, uPx.y)).r) * 0.1;
        v *= uDecay;
        vec2 p = vUv * vec2(uAspect, 1.0);
        float d = seg(p, uA * vec2(uAspect, 1.0), uB * vec2(uAspect, 1.0));
        float rr = uR * (0.75 + 0.5 * n2(p * 14.0 + uT));
        v = max(v, smoothstep(rr, rr * 0.2, d));
        gl_FragColor = vec4(v, 0.0, 0.0, 1.0);
      }\` }));
    const simScene = new THREE.Scene(); simScene.add(sim);
    const outU = { uTex: { value: null }, uT: { value: 0 }, uAspect: { value: 1 } };
    const out = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: outU, transparent: true, vertexShader: vs, fragmentShader: \`
      uniform sampler2D uTex; uniform float uT; uniform float uAspect; varying vec2 vUv; \${noise}
      void main(){
        float f = texture2D(uTex, vUv).r;
        f += (n2(vUv * vec2(uAspect, 1.0) * 18.0 + uT * 0.4) - 0.5) * 0.12;
        float a = smoothstep(0.42, 0.47, f);
        gl_FragColor = vec4(vec3(1.0), a);
      }\` }));
    const outScene = new THREE.Scene(); outScene.add(out);
    const size = () => {
      const w = window.innerWidth, h = window.innerHeight;
      r.setSize(w, h, false);
      const sw = Math.max(4, Math.round(w / 2)), sh = Math.max(4, Math.round(h / 2));
      A.setSize(sw, sh); B.setSize(sw, sh);
      simU.uPx.value.set(1 / sw, 1 / sh);
      simU.uAspect.value = outU.uAspect.value = w / h;
    };
    size(); window.addEventListener('resize', size);
    const m = { x: -1, y: -1, px: -1, py: -1, has: false };
    let speed = 0, rad = 0;
    const onMove = (e) => { m.x = e.clientX / window.innerWidth; m.y = 1 - e.clientY / window.innerHeight; if (!m.has) { m.px = m.x; m.py = m.y; m.has = true; } };
    const onOut = (e) => { if (!e.relatedTarget) m.has = false; };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerout', onOut);
    const loop = () => {
      if (this.dead) return;
      this.inkRaf = requestAnimationFrame(loop);
      const P = this.props, on = P.customCursor ?? true;
      box.style.display = on ? 'block' : 'none';
      document.documentElement.style.cursor = on ? 'none' : '';
      if (!on) return;
      const t = performance.now() / 1000;
      const dx = (m.x - m.px) * simU.uAspect.value, dy = m.y - m.py;
      speed += (Math.min(Math.hypot(dx, dy) * 40, 1) - speed) * 0.15;
      const size0 = 2;
      this.inkFade = (this.inkFade ?? 1) + ((this.cardHover ? 0 : 1) - (this.inkFade ?? 1)) * (this.cardHover ? 0.14 : 0.06);
      box.style.opacity = String(this.inkFade);
      rad += ((m.has && !this.cardHover ? (0.018 + speed * 0.07) * size0 : 0) - rad) * 0.2;
      simU.uA.value.set(m.has ? m.px : -9, m.has ? m.py : -9);
      simU.uB.value.set(m.has ? m.x : -9, m.has ? m.y : -9);
      simU.uR.value = rad; simU.uT.value = t; outU.uT.value = t;
      simU.uDecay.value = 0.955 + 0.035 * (P.inkLinger ?? 0.6);
      m.px = m.x; m.py = m.y;
      simU.uPrev.value = A.texture;
      r.setRenderTarget(B); r.render(simScene, cam);
      const tmp = A; A = B; B = tmp;
      outU.uTex.value = A.texture;
      r.setRenderTarget(null); r.render(outScene, cam);
    };
    loop();
    const prev = this.cleanupInk;
    this.cleanupInk = () => {
      cancelAnimationFrame(this.inkRaf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      document.documentElement.style.cursor = '';
      A.dispose(); B.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  }

  async init() {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
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
        else if (far && m.on) { m.on = false; m.off(); }
      }
      this.manageT = setTimeout(manage, 200);
    };
    manage();
    this.initBleed(THREE);

    try { await Promise.all([document.fonts.load('700 200px Oswald'), document.fonts.load('500 64px Oswald'), document.fonts.load('400 26px "JetBrains Mono"')]); } catch (e) {}
    if (this.dead) return;
    const host = this.hostRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1 : 2));
    renderer.setClearColor(0x050505, 0);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const FOV = 38;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

    const W = 3.4, H = 2.1, GAP = 0.16, STEP = W + GAP, N = this.projects.length, LEN = N * STEP;
    const common = { uWeaveY: { value: 0.55 }, uWeave: { value: 0 }, uWeaveP: { value: new THREE.Vector3(-4, 2.6, 0.9) }, uRing: { value: 0 }, uRingR: { value: 1 }, uRingT: { value: new THREE.Vector2(0.38, 0.26) }, uCurve: { value: 0.11 }, uVel: { value: 0 }, uRadius: { value: 0.14 }, uTime: { value: 0 }, uHoverAmt: { value: 1 }, uRibbon: { value: new THREE.Matrix4() }, uTwist: { value: 0 }, uIntro: { value: 0 }, uCover: { value: new THREE.Vector2(1, 1) } };
    const ribbonEuler = new THREE.Euler();
    let ribbonAmt = -1;
    const setRibbon = (k) => {
      if (this._vA !== camera.aspect) { this._vA = camera.aspect; this._vHr = 2 * camera.position.length() * Math.tan(camera.fov * Math.PI / 360); ribbonAmt = -1; }
      const ry = this.props.ribbonY ?? -0.4, mob = camera.aspect < 0.8;
      if (k !== ribbonAmt) { ribbonAmt = k; ribbonEuler.set(0.07 * k, -0.1 * k, -0.075 * k); common.uRibbon.value.makeRotationFromEuler(ribbonEuler); common.uTwist.value = 0.035 * k; }
      common.uRibbon.value.setPosition(0, (mob ? -0.62 : 0) + ry * (this._vHr || 6) * (mob ? 0.2 : 0.5), 0);
    };

    const vert = \`
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
      }\`;
    const frag = \`
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
      }\`;

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
      vertexShader: \`varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }\`,
      fragmentShader: \`uniform float uOffset; varying vec3 vW;
        void main(){ vec2 c = vec2(vW.x + uOffset, vW.z) / 0.95; vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
          float line = 1.0 - min(min(g.x, g.y), 1.0); float fade = smoothstep(42.0, 5.0, length(vW.xz));
          gl_FragColor = vec4(vec3(0.02 + line * 0.32 * fade), 1.0); }\`,
    }));
    grid.rotation.x = -Math.PI / 2; grid.position.y = -1.35;
    scene.add(grid);

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
      const P2 = this.props, col = P2.workWordColor || '#ecebe6', wgt = P2.workWordWeight || 700, ls = P2.workWordSpacing ?? 0, shA = P2.workWordShadow ?? 0.6;
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
        m.material.uniforms.uOp.value = op * Math.min(1, meC * 2.5);
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
    this.cardRect = (i) => {
      const r = host.getBoundingClientRect(), c = cards[i], cx = c.mesh.position.x, cy = c.mesh.position.y;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let k = 0; k <= 16; k++) {
        const x = cx + (k / 16 - 0.5) * W;
        [cy + H / 2, cy - H / 2].forEach(y => { const s = toScreen(x, y, common.uCurve.value, r.width, r.height); x0 = Math.min(x0, s[0]); x1 = Math.max(x1, s[0]); y0 = Math.min(y0, s[1]); y1 = Math.max(y1, s[1]); });
      }
      return { top: r.top + y0, left: r.left + x0, width: x1 - x0, height: y1 - y0 };
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
      const p = Math.max(0, Math.min(1, (vh * 0.85 - sec.top) / (vh * 1.15)));
      { const g0 = Math.max(0, Math.min(1, ((this.rp ?? 1) - 0.8) / 0.2)), g = g0 * g0 * (3 - 2 * g0); this._ribG = g; }
      introS += (p * (this._ribG ?? 1) - introS) * 0.05;
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
        const rp0 = Math.max(0, Math.min(1, sY / (vh * 2.4)));
        this.rp = this.sceneTween('rp', rp0);
        
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
          const dv = active ? sst(0.02, 0.5, this.rp) : (this.rp >= 0.9996 && rot ? 1 : 0);
          hr.style.webkitMaskImage = ''; hr.style.maskImage = '';
          const bleedOn = (P.sectionBleed ?? true);
          hr.style.filter = bleedOn ? '' : (dv > 0.001 && dv < 0.999 ? 'blur(' + (dv * 14).toFixed(1) + 'px)' : '');
          hr.style.opacity = String(bleedOn ? 1 - sst(0.4, 0.56, this.rp) : 1 - sst(0.05, 0.85, dv));
          { const fr = this._hf || (this._hf = document.querySelector('[data-hero-front]')); if (fr) { fr.style.opacity = hr.style.opacity; fr.style.filter = hr.style.filter; } }

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
          pnl.style.transform = 'none';
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
          const ct = this.ctaRef.current ? this.ctaRef.current.getBoundingClientRect().top : ctaRect0.top;
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
            cpn.style.opacity = '1'; cpn.style.transform = 'none'; cpn.style.clipPath = ''; cpn.style.filter = '';
            this.smokeMask(cpn, mp);
            if (cct) cct.style.transform = 'translate3d(0,' + ((1 - k) * 5).toFixed(3) + 'vh,0) scale(' + (1.06 - 0.06 * k).toFixed(4) + ')';
            if (stk) { stk.style.transform = 'scale(' + (1 + 0.05 * k).toFixed(4) + ')'; stk.style.filter = ''; }
            this.ctaTilt = 0; this.ctaZoom = (1 - k) * 0.55; this.e2 = e2;
            outOp = mp > 0.995 ? 0 : 1;
          } else {
            this.smokeMask(cpn, 0); cpn.style.clipPath = ''; cpn.style.filter = ''; if (stk) { stk.style.transform = ''; stk.style.filter = ''; }
            cpn.style.transform = 'none'; if (cct) cct.style.transform = 'none';
            cpn.style.opacity = (rot && this.rq <= 0.0004) ? '0' : '1';
            this.ctaTilt = 0; this.ctaZoom = 0; this.e2 = this.rq >= 0.9996 ? 1 : 0;
            if (rot && this.rq >= 0.9996) outOp = 0;
          }
        }
        if (cs) { const h3 = this._h3 || (this._h3 = cs.querySelector('[data-hero3]')), ab = this._ab || (this._ab = cs.querySelector('[data-about]'));
          if (h3) { const into = -ctaRect0.top / vh, pc = Math.max(0, Math.min(1, (into - 0.6) / 1.8)), ec = pc * pc * (3 - 2 * pc);
            const over = Math.max(0, h3.offsetHeight - vh); h3.style.transform = 'translate3d(0,' + (-over * ec).toFixed(1) + 'px,0)';
            this.ra = this.sceneTween('ra', Math.max(0, Math.min(1, (into - 2.6) / 1.4)));
            const ka = this.ra; h3.style.opacity = String(1 - sst(0.3, 0.6, ka));
            if (ab) { ab.style.opacity = String(sst(0.4, 0.7, ka)); ab.style.pointerEvents = ka > 0.5 ? 'auto' : 'none'; } } }
        if (stk) stk.style.opacity = String((this.pnlOp ?? 1) * (rot ? outOp : (1 - eout * 0.8)));
        const rs = this.reachRef.current, rpn = this.reachPanel || (this.reachPanel = rs && rs.querySelector('[data-reach-panel]'));
        const rct = this.reachContent || (this.reachContent = rs && rs.querySelector('[data-reach-content]'));
        if (rs && rpn && cs && cpn) {
          const rt = this.reachRef.current ? this.reachRef.current.getBoundingClientRect().top : reachRect0.top, cb = ctaRect0.bottom;
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
            if (rct) rct.style.transform = pre3 + (ANG * e3 - ANG) + post;
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
          if (pnl) pnl.style.pointerEvents = op(stk) * (this.pnlOp ?? 1) > 0.5 ? '' : 'none';
          if (cpn) cpn.style.pointerEvents = op(cpn) > 0.5 ? '' : 'none';
          if (rpn) rpn.style.pointerEvents = op(rpn) > 0.5 ? '' : 'none';
        }
      }
      const sy = Math.max(0, Math.min(sY, vh));
      if (this.headlineRef.current) {
        this.headlineRef.current.style.transform = \`translate3d(0, calc(-50% - \${sy * 0.06}px), 0)\`;
      }
      if (this.portraitRef.current) this.portraitRef.current.style.transform = \`translate3d(0, \${sy * 0.15}px, 0) scale(\${1 + sy / vh * 0.08})\`;
      if (this.uiRef.current) this.uiRef.current.style.opacity = String(Math.max(0, Math.min(1, (introS - 0.75) / 0.25)) * (1 - Math.max(0, Math.min(1, this.openT * 3))));

      common.uCurve.value = P.curvature ?? 0.18;
      { const lay = P.workLayout || 'Ribbon', weaveOn = lay === 'Weave' ? 1 : 0; common.uWeave.value += (weaveOn - common.uWeave.value) * 0.08; if (Math.abs(weaveOn - common.uWeave.value) < 0.001) common.uWeave.value = weaveOn; common.uWeaveP.value.z = P.weaveDepth ?? 0.9; common.uWeaveY.value = P.weaveDrop ?? 0.55;
        const ringOn = lay === 'Ring' ? 1 : 0; common.uRing.value += (ringOn - common.uRing.value) * 0.08; if (Math.abs(ringOn - common.uRing.value) < 0.001) common.uRing.value = ringOn;
        common.uRingR.value = LEN / (2 * Math.PI); common.uRingT.value.set(P.ringTiltX ?? 0.38, P.ringTiltZ ?? 0.26);
        cards.forEach((c) => { c.rmesh.visible = common.uRing.value < 0.5 && common.uWeave.value < 0.5; }); placeWord(common.uRing.value, introS > 0.001 ? 1 : 0, common.uWeave.value); }
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
            el.style.transform = \`translate3d(0, \${(1 - e) * 110}%, 0) rotate(\${(1 - e) * 5}deg)\`;
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
      grid.material.uniforms.uOffset.value = cur;
      const a = ((Math.round(cur / STEP) % N) + N) % N;
      if (a !== this.state.active) this.setState({ active: a });
      if (onScreen) renderer.render(scene, camera);
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
  }

  applyColors() {
    const P = this.props, map = { '--bg-page': P.pageBg, '--ink': P.textColor, '--bg-about': P.aboutBg, '--ink-about': P.aboutText, '--bg-footer': P.footerBg, '--ink-footer': P.footerText, '--bg-info': P.infoBg, '--ink-info': P.infoText };
    const key = JSON.stringify(map); if (key === this._colKey) return; this._colKey = key;
    const st = document.documentElement.style; Object.entries(map).forEach(([k, v]) => { if (v) st.setProperty(k, v); else st.removeProperty(k); });
  }
  renderVals() {
    this.applyColors();
    const n = this.projects.length;
    const p = this.projects[this.state.active];
    const pg = this.state.page;
    const pp = pg ? this.projects[pg.i] : p;

    return { reachLetters: Array.from(String(this.props.reachTitle ?? 'Reach Out').toUpperCase()).map((c) => c === ' ' ? '\\u00a0' : c), astroGRef: this.astroGRef, ringLayout: (this.props.workLayout || 'Ring') === 'Ring',
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
      nextProjectInstant: () => {
        const i = (pg.i + 1) % n, snap = this.prepClean(i);
        this.openI = i; this.revealStart = performance.now(); this.rvReset = true;
        snap.src.then((src) => this.setState(s => s.page && s.page.i === i ? { page: { ...s.page, src } } : null));
        history.replaceState({ work: i }, '', '#work/' + this.projects[i].title.toLowerCase().replace(/\\s+/g, '-'));
        if (this.pageRef.current) this.pageRef.current.scrollTop = 0;
        this.setState({ page: { ...pg, i, video: snap.video } });
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
  lenisReady.then(render);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
