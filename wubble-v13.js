/* wubble V13 for Webflow — runs the exact Claude Design V13 logic on native Webflow elements.
   Layout/styling lives in Webflow (w13-* classes). Elements the animation drives carry data-w / data-* hooks. */
(function () {
if (window.__wubbleV13) return; window.__wubbleV13 = true;
var BASE = (document.currentScript && document.currentScript.dataset.base) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/site/';
var DEFAULTS = {"displayFont":"Oswald","heroTitleSize":1,"sectionTitleSize":1,"workTitleSize":1,"bodySize":1,"labelSize":11,"ctaScene":"Ascent","transitionSeconds":2.6,"sectionBleed":true,"soundtrack":"","hero3D":true,"handModel":"","sectionRotate":true,"sectionZoom":1,"smoothScroll":true,"scrollLerp":0.08,"bgMode":"Silk","lightIntensity":1,"relief":1,"grain":1.4,"bgSpeed":1,"viewCursor":true,"customCursor":true,"inkLinger":0.6,"curvature":0.11,"ribbonTilt":1.7,"velocityBend":1.4,"hoverDistortion":1.7,"cornerRadius":0.11,"reflections":true,"reflectionStrength":0.1,"showGrid":false,"image1":"","video1":"","image2":"","video2":"https://threejs.org/examples/textures/sintel.mp4","image3":"","video3":"","image4":"","video4":"","image5":"","video5":"","image6":"","video6":""};
// ---------- head: fonts, base css, lenis, 3D viewer ----------
var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Syne:wght@500;700;800&family=Space+Grotesk:wght@500;700&family=Unbounded:wght@500;700&family=Inter+Tight:wght@500;700;800&family=Archivo:wght@500;700;900&family=Big+Shoulders+Display:wght@600;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400&display=swap"; document.head.appendChild(lk);
var st = document.createElement('style'); st.textContent = `
html{overflow-x:clip!important;overflow-y:auto!important;height:auto!important;overscroll-behavior:none;-webkit-text-size-adjust:100%;touch-action:pan-y}
body{margin:0;background:#050505;height:auto!important;overflow:visible!important;overflow-x:clip!important;overscroll-behavior:none;max-width:100vw}
section{max-width:100vw;overflow-x:clip}
html{background:#050505}
.dc-root{height:auto!important}
a{color:#ecebe6;text-decoration:none}
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
loadScript(BASE + 'dither-viewer.js', true);
// ---------- hooks: data-w="name" → data-wh (V13 uses empty data-w for word reveals) ----------
function prepHooks(scope) { scope.querySelectorAll('[data-w]').forEach(function (el) { var v = el.getAttribute('data-w'); if (v) { el.setAttribute('data-wh', v); el.removeAttribute('data-w'); } }); }
function boot() {
  var root = document.querySelector('[data-w="root"],[data-wh="root"]'); if (!root) return console.warn('wubble: no [data-w=root]');
  prepHooks(document);
  root.insertAdjacentHTML('afterbegin', "<svg width=\"0\" height=\"0\" style=\"position:absolute;\"><defs><filter id=\"gooText\" x=\"-20%\" y=\"-60%\" width=\"140%\" height=\"220%\"><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"0\" result=\"b\" data-goo-text=\"\"></feGaussianBlur><feColorMatrix in=\"b\" mode=\"matrix\" values=\"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 9 -3\"></feColorMatrix></filter><filter id=\"goo\" x=\"-50%\" y=\"-50%\" width=\"200%\" height=\"200%\"><feGaussianBlur in=\"SourceGraphic\" stdDeviation=\"6\" result=\"b\"></feGaussianBlur><feColorMatrix in=\"b\" mode=\"matrix\" values=\"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8\"></feColorMatrix></filter></defs></svg>");
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
  Object.keys(root.dataset).forEach(function (k) { if (k === 'w' || k === 'wh') return; var v = root.dataset[k]; props[k] = v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(+v) ? +v : v); });
  // ---------- tiny React-free component host ----------
  window.React = window.React || {}; if (!window.React.createRef) window.React.createRef = function () { return { current: null }; };
  function DCLogic(p) { this.props = p; }
  DCLogic.prototype.setState = function (u, cb) { var patch = typeof u === 'function' ? u(this.state, this.props) : u; if (patch == null) { cb && cb(); return; } this.state = Object.assign({}, this.state, patch); if (cb) this.__cbs.push(cb); this.__schedule(); };
  DCLogic.prototype.forceUpdate = function (cb) { if (cb) this.__cbs.push(cb); this.__schedule(); };
  window.DCLogic = DCLogic;
  var Component = (new Function('DCLogic', 'React', `
class Component extends DCLogic {
  state = { active: 0, time: '', page: null, soundOn: false };
  rollRef = React.createRef(); bleedRef = React.createRef(); bgRef = React.createRef(); gooRef = React.createRef(); inkRef = React.createRef(); closeRef = React.createRef(); loaderRef = React.createRef(); chromeRef = React.createRef(); curtainRef = React.createRef(); hero3dRef = React.createRef(); ctaRef = React.createRef(); ctaGlRef = React.createRef(); reachRef = React.createRef(); rayRef = React.createRef(); handRef = React.createRef(); astroRef = React.createRef(); hostRef = React.createRef(); heroRef = React.createRef(); workRef = React.createRef();
  uiRef = React.createRef(); headlineRef = React.createRef(); portraitRef = React.createRef(); pageRef = React.createRef();
  projects = window.__wubbleMerge([
    { title: 'Tidewater Atlas', mark: 'TIDE/ WATER', type: 'Interactive atlas', year: '2026', client: 'Coastal Trust', bg: '#d8d3c6', ink: '#151412', accent: '#c9542f', blurb: 'A living map of a changing coastline — tides, erosion and stories layered into one explorable surface.' },
    { title: 'Northfield Records', mark: 'NRTH FLD', type: 'Label identity', year: '2025', client: 'Northfield', bg: '#1e3a2c', ink: '#ebe5d3', accent: '#d9c36a', blurb: 'Identity and web presence for an independent label, built around a flexible system of sleeves and motion.' },
    { title: 'Oda Ceramics', mark: 'ODA', type: 'E-commerce', year: '2025', client: 'Oda Studio', bg: '#c4512d', ink: '#f4ede1', accent: '#1b1a17', blurb: 'A quiet storefront for handmade ceramics where every object gets room to breathe.' },
    { title: 'Kinetic Type Lab', mark: 'KINE TIC', type: 'WebGL experiment', year: '2024', client: 'Self-initiated', bg: '#242a66', ink: '#e9e7f1', accent: '#f0a8c0', blurb: 'An ongoing playground of shader-driven typography reacting to sound, cursor and scroll.' },
    { title: 'Halden Observatory', mark: 'HAL DEN', type: 'Museum website', year: '2024', client: 'Halden Foundation', bg: '#e9e4d7', ink: '#141414', accent: '#3a5bd9', blurb: 'Digital home for a historic observatory — exhibitions, night programmes and a sky archive.' },
    { title: 'Sunday Garden', mark: 'SUN DAY', type: 'Restaurant', year: '2023', client: 'Sunday Garden', bg: '#121212', ink: '#ecebe6', accent: '#c7de5b', blurb: 'Brand and booking experience for a seasonal restaurant that changes with its garden.' },
  ]);

  componentDidMount() {
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
  componentDidUpdate() { this.applyFont && this.applyFont(); this.applySizes(); }
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
      this.portrait = await mod.createPortrait(el, { model: 'https://raw.githubusercontent.com/wuppie/wubble/main/wubble.glb', eyes: null, neck: -0.6, fit: innerWidth < 820 ? 0.92 : 0.78, maxPR: this.lowPower ? 0.9 : 2, shadowSize: this.lowPower ? 512 : 2048, textureAmount: 0, clay: { color: 0x57504a, roughness: 0.8, sheen: 0.55, sheenColor: 0xb7a99a }, post: { dither: 0, grain: 0.03, saturation: 0.28, contrast: 0.32, bloom: 0.05, vignette: 1.25, stipple: 0, tint: 0.6 , exposure: 0.62 } });
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
      const L = new W.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9, autoRaf: false, syncTouch: false });
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
  sceneTween(k, q) { return q; }
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
          col += (h(fc + fract(uT * 5.7) * 101.0) - 0.5) * 0.05 * (0.3 + l * 3.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.35 * dot(vu, vu);
          gl_FragColor = vec4(max(col, 0.0), 1.0);
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
      if (!sec.dataset.st && rc.top < vh * 0.3) sec.dataset.st = String(now);
      if (sec.dataset.st && rc.top > vh) delete sec.dataset.st;
      const st = +sec.dataset.st || 0;
      sec.querySelectorAll('[data-rw]').forEach((w, j) => {
        const t = st ? Math.max(0, Math.min(1, (now - st - 250 - j * 90) / 1400)) : 0, e = expo(t);
        w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 4) + 'deg)';
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

  initBleed(THREE) {
    const box = this.bleedRef.current; if (!box) return;
    let r = null, lastOn = 0;
    const mk = () => { r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false }); r.setClearColor(0, 0); r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement); size(); };
    const drop = () => { if (!r) return; r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; };
    const U = { uP: { value: 0 }, uB: { value: 0 }, uT: { value: 0 }, uA: { value: 1 }, uS: { value: 0 }, uTint: { value: 0 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: \`
        uniform float uP; uniform float uB; uniform float uT; uniform float uA; uniform float uS; uniform float uTint; varying vec2 vUv;
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
          float a = clamp(ink * 0.85 + core * 0.15, 0.0, 1.0) * uB;
          vec3 col = mix(vec3(0.028, 0.028, 0.029), vec3(0.06, 0.06, 0.062), core * 0.6);
          col += vec3(0.11, 0.11, 0.115) * smoothstep(0.05, 0.0, abs(d - 0.02)) * 0.25 * uB;
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
        const rp = this.rp || 0, rq = this.rq || 0, r3 = this.r3 || 0;
        const heroD = ss(0.1, 0.7, rp), handD = 1 - ss(0.3, 0.9, r3), astroD = Math.max(1 - ss(0.35, 0.95, rq), ss(0.1, 0.7, r3));
        this.astroD = astroD;
        if (this.portrait && this.portrait.post && this.portrait.post.uDissolve) this.portrait.post.uDissolve.value = heroD;
        if (this.hand && this.hand.post && this.hand.post.uDissolve) this.hand.post.uDissolve.value = handD;
      }
      const on = (this.props.sectionBleed ?? true) && (this.props.sectionRotate ?? true);
      const ts = [[this.rp, 1.3], [this.rq, 4.7], [this.r3, 8.1]];
      let best = null, bb = 0;
      for (const [q, sd] of ts) { if (q == null) continue; const b = Math.sin(Math.PI * Math.max(0, Math.min(1, q))); if (b > bb) { bb = b; best = [q, sd]; } }
      if (!on || bb < 0.01 || this.state.page) { if (box.style.display !== 'none') box.style.display = 'none'; if (r && performance.now() - lastOn > 2500) drop(); return; }
      box.style.display = 'block'; lastOn = performance.now(); if (!r) mk();
      U.uP.value = best[0]; U.uS.value = best[1]; { const tgt = best[1] > 2 ? 1 : 0; U.uTint.value += (tgt - U.uTint.value) * 0.15; } U.uB.value = Math.min(1, bb * 1.4); U.uT.value = (performance.now() - t0) / 1000;
      r.render(scene, cam);
    };
    loop();
    this.cleanupBleed = () => { cancelAnimationFrame(this.bleedRaf); removeEventListener('resize', size); mat.dispose(); drop(); };
  }

  initCta(THREE) {
    const box = this.ctaGlRef.current, sec = this.ctaRef.current; if (!box || !sec) return;
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uIn: { value: 0 }, uTilt: { value: 0 }, uZoom: { value: 0 }, uDith: { value: 0 }, uWarp: { value: 0 }, uAstro: { value: null }, uAstroOn: { value: 0 }, uFlare: { value: new THREE.Vector3(0, 0, 0) }, uADis: { value: 0 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: (this.props.ctaScene || 'Ascent') === 'Mountains' ? \`
        precision highp float;
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
          col += (h(fc + fract(uT * 6.1) * 117.0) - 0.5) * 0.06 * (0.35 + l * 3.0);
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
          gl_FragColor = vec4(max(col, 0.0), 1.0);
        }\` : \`
        precision highp float;
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
          float fly = 1.0 / (1.0 + alt * 0.55);
          float sf = 0.0;
          for (int i = 0; i < 7; i++) {
            float k = float(i) / 6.0;
            vec2 f2 = cen + dv * fly * (1.0 - k * uWarp * 0.16);
            float w = 1.0 - k * 0.55;
            sf += (stars(f2, 3.0, 0.992) * 0.55 + stars(f2, 7.0, 0.985) * 0.8 + stars(f2, 17.0, 0.975) * 1.0) * w;
          }
          sf /= 1.0 + 3.2 * (1.0 - uWarp * 0.55);
          sf *= 1.0 + uWarp * 0.8;
          sf *= 0.75 + 0.25 * sin(uT * 1.3 + h(floor(fc / 7.0)) * 40.0);
          col += vec3(0.82, 0.86, 1.0) * sf * 0.55 * smoothstep(0.25, 0.75, alt);
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
            col = mix(col, ac, aa * akeep);
            col = mix(col, vec3(0.07, 0.07, 0.073), arim * aa * 0.8);
          }
          if (uFlare.z > 0.0) {
            vec2 fd = (fc - uFlare.xy * uRes) / uRes.y;
            float fl = exp(-length(fd) * 120.0) * 1.4 + exp(-length(fd) * 22.0) * 0.12;
            fl += (exp(-abs(fd.y) * 900.0) * exp(-abs(fd.x) * 28.0) + exp(-abs(fd.x) * 900.0) * exp(-abs(fd.y) * 28.0)) * 0.7;
            col += vec3(1.0, 0.97, 0.92) * fl * uFlare.z * (1.0 - uADis);
          }
          // planet as a real sphere
          float R0 = 2.4;
          vec2 pc = vec2(-0.15, -R0 - mix(-0.6, 0.38, alt));
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
            col = mix(col, cc, dens * fadeOut * mix(0.95, 0.65, d));
          }
          col = col * 1.1 / (1.0 + col * 0.9);
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col += (h(fc + fract(uT * 6.1) * 117.0) - 0.5) * 0.02 * (0.3 + lg * 4.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.0 * dot(vu, vu);
          col *= uIn;
          gl_FragColor = vec4(max(col, 0.0), 1.0);
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
        const url = (this.props.astroModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/astro.glb';
        const g = await loader.loadAsync(url); if (this.dead) return;
        const m = g.scene;
        m.traverse((o) => { if (o.isMesh) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { mt.envMapIntensity = 0.55; }); } });
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
        if (!astroLoading && r0.top < vh0 * 2.5) loadAstro();
        const v0 = r0.top < vh0 && r0.bottom > 0;
        const dy = lastTop == null ? 0 : Math.abs(r0.top - lastTop); lastTop = r0.top;
        const tw = v0 ? Math.min(1, dy / (vh0 * 0.035)) : 0;
        warp += (tw - warp) * (tw > warp ? 0.12 : 0.045);
      }
      const rc = this.logRect(sec, 100, 320, 465), vh = (window.__svh || innerHeight);
      const vis = rc.top < vh && rc.bottom > 0;
      const now = performance.now();
      sec.querySelectorAll('[data-cg]').forEach((g) => {
        const gr = g.getBoundingClientRect();
        if (!g.dataset.st && gr.top < vh * 0.85 && rc.top < vh * 0.35) g.dataset.st = String(now);
        if (g.dataset.st && rc.top > vh) delete g.dataset.st;
        const st = +g.dataset.st || 0;
        g.querySelectorAll('[data-cw]').forEach((w, j) => {
          const t = st ? Math.max(0, Math.min(1, (now - st - j * 45) / 1300)) : 0, e = expo(t);
          w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 4) + 'deg)';
        });
      });
      if (!vis) return;
      const tp = Math.max(0, Math.min(1, -rc.top / Math.max(1, rc.height - vh) * 0.7 + 0.3 * Math.max(0, Math.min(1, (vh - rc.top) / vh))));
      sp += (tp - sp) * 0.06;
      inS += (Math.max(0, Math.min(1, (vh - rc.top) / (vh * 0.7))) - inS) * 0.08;
      mm.sx += (mm.x - mm.sx) * 0.04; mm.sy += (mm.y - mm.sy) * 0.04;
      U.uP.value = sp; U.uIn.value = inS; U.uWarp.value = warp;
      if (AS.model) {
        const tt = (now - t0) / 1000, ee = sp * sp * (3 - 2 * sp);
        const rise = Math.max(0, Math.min(1, (sp - 0.08) / 0.6)), re = 1 - Math.pow(1 - rise, 3);
        const W1 = U.uRes.value.x, H1 = U.uRes.value.y, asp = W1 / Math.max(1, H1);
        if (AS.rt.width !== W1 || AS.rt.height !== H1) AS.rt.setSize(W1, H1);
        AS.cam.aspect = asp; AS.cam.updateProjectionMatrix();
        const halfH = Math.tan(12 * Math.PI / 180) * 4.2;
        AS.model.position.set(halfH * asp * 0.42 - (1 - ee) * 0.15, -halfH * 1.6 + re * halfH * 1.62 + Math.sin(tt * 0.6) * 0.03, 0);
        AS.model.rotation.set(0.25 + Math.sin(tt * 0.3) * 0.08 - ee * 0.2, -0.6 + Math.sin(tt * 0.18) * 0.25 + ee * 0.5, Math.sin(tt * 0.35) * 0.1 - ee * 0.25);
        AS.model.scale.setScalar(0.62 + ee * 0.14);
        r.setRenderTarget(AS.rt); r.setClearColor(0x000000, 0); r.clear(true, true, true); r.render(AS.scene, AS.cam); r.setRenderTarget(null);
        U.uAstroOn.value = 1; U.uADis.value = this.astroD || 0;
        { const vp = AS.visor.clone(); AS.model.updateMatrixWorld(); AS.model.localToWorld(vp); vp.project(AS.cam);
          U.uFlare.value.set(vp.x * 0.5 + 0.5, vp.y * 0.5 + 0.5, re * (0.55 + 0.45 * Math.max(0, Math.sin(tt * 0.7 + 1.0)))); }
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
        float gA = hash(fc + fract(uT * 7.13) * 97.0) - 0.5;
        float gB = hash(floor(fc * 0.5) + fract(uT * 3.71) * 61.0) - 0.5;
        float lumG = dot(col, vec3(0.333));
        col += (gA * 0.075 + gB * 0.04) * uGrain * (0.7 + lumG * 3.0);
        vec2 vu = fc / uRes - 0.5;
        col *= 1.0 - 0.55 * dot(vu, vu);
        col *= 1.0 - uDark;
        gl_FragColor = vec4(max(col, 0.0), 1.0);
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
    this.initBg(THREE);
    this.initReveals(THREE);
    const managed = [
      { ref: this.ctaRef, init: () => this.initCta(THREE), off: () => { this.cleanupCta && this.cleanupCta(); this.cleanupCta = null; }, on: false },
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
    const common = { uCurve: { value: 0.11 }, uVel: { value: 0 }, uRadius: { value: 0.14 }, uTime: { value: 0 }, uHoverAmt: { value: 1 }, uRibbon: { value: new THREE.Matrix4() }, uTwist: { value: 0 }, uIntro: { value: 0 }, uCover: { value: new THREE.Vector2(1, 1) } };
    const ribbonEuler = new THREE.Euler();
    let ribbonAmt = -1;
    const setRibbon = (k) => {
      if (k === ribbonAmt) return; ribbonAmt = k;
      ribbonEuler.set(0.07 * k, -0.1 * k, -0.075 * k);
      common.uRibbon.value.makeRotationFromEuler(ribbonEuler);
      common.uTwist.value = 0.035 * k;
    };

    const vert = \`
      uniform float uCurve; uniform float uVel; uniform float uHover; uniform vec2 uMouse; uniform vec2 uSize; uniform float uHoverAmt;
      uniform float uRefl; uniform float uFloor;
      uniform mat4 uRibbon; uniform float uTwist; uniform float uIntro; uniform float uOpen; uniform vec2 uCover; uniform float uOV; uniform vec2 uClick; uniform float uDim; uniform float uPS; uniform float uPV;
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
        wp.x = sin(th) * R;
        wp.z += (1.0 - cos(th)) * R;
        float vk = 1.0 - smoothstep(0.0, 0.25, uOpen);
        wp.z -= sin(uv.x * 3.14159) * abs(uVel) * 0.55 * vk;
        wp.x += (uv.y - 0.5) * -uVel * 0.35 * vk;
        wp.y -= ie * 4.0;
        wp.z -= ie * 6.0;
        float tw = x * uTwist + ie * 1.3;
        wp.yz = mat2(cos(tw), sin(tw), -sin(tw), cos(tw)) * wp.yz;
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

    const V = new THREE.Vector3();
    const toScreen = (x, y, c, rw, rh) => {
      const cc = Math.max(c, 0.0001);
      const tw = x * common.uTwist.value, Z = (1 - Math.cos(x * cc)) / cc;
      V.set(Math.sin(x * cc) / cc, y * Math.cos(tw) - Z * Math.sin(tw), y * Math.sin(tw) + Z * Math.cos(tw))
        .applyMatrix4(common.uRibbon.value).project(camera);
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
      const ctaRect0 = this.ctaRef.current ? this.logRect(this.ctaRef.current, 100, 320, 465) : null;
      const reachRect0 = this.reachRef.current ? this.logRect(this.reachRef.current, 100, 300, 300) : null;
      const sY = (window.__scrollY ? window.__scrollY() : window.scrollY);
      const p = Math.max(0, Math.min(1, (vh * 0.85 - sec.top) / (vh * 1.15)));
      introS += (p - introS) * 0.18;
      const p2 = Math.max(0, Math.min(1, (-sec.top - vh * 0.5) / (vh * 0.55 * (N - 1))));
      base = p2 * (N - 1) * STEP;
      if (p2 !== lastP2) {
        lastP2 = p2; clearTimeout(scrollSnapT);
        scrollSnapT = setTimeout(() => { if (!dragging && !this.state.page) snap(); }, 260);
      }
      if (Math.abs(p - introS) < 0.0005) introS = p;
      common.uIntro.value = introS;
      {
        const Z = P.sectionZoom ?? 1;
        const io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const hr = this.heroRef.current, hin = hr && hr.firstElementChild;
        const cover = Math.max(0, Math.min(1, (vh - sec.top) / vh));
        this.zH = cover;
        const ch = this.zH, ce = io(ch) * Z;
        const rot = (P.sectionRotate ?? true);
        const rp0 = Math.max(0, Math.min(1, sY / (vh * 1.35)));
        this.rp = this.sceneTween('rp', rp0);
        if (Math.abs(rp0 - this.rp) < 0.0004) this.rp = rp0;
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
          hr.style.transform = active ? pre + (ANG * e) + post : 'none';
          hr.style.opacity = active ? String(1 - sst(0.06, 0.48, e)) : (this.rp >= 0.9996 && rot ? '0' : '1');
          if (this.portrait) {
            const want = (P.hero3D ?? true) && this.rp < 0.9996 && !this.state.page;
            if (want !== this.portraitOn) { this.portraitOn = want; this.portrait.renderer.setAnimationLoop(want ? this.portrait.frame : null); }
            this.portrait.renderer.domElement.style.display = (P.hero3D ?? true) ? 'block' : 'none';
          } else if ((P.hero3D ?? true) && !this.portraitLoading && !this.portraitFailed) { this.initPortrait(); }

          hr.style.visibility = rot && this.rp >= 0.9996 ? 'hidden' : (!rot && sec.top <= 0 ? 'hidden' : 'visible');
          hin.style.transform = 'none'; hin.style.opacity = '1'; hin.style.borderRadius = '18px';
          const dim = this.heroDim || (this.heroDim = hin.querySelector('[data-hero-dim]'));
          if (dim) dim.style.opacity = String(rot ? e * 0.75 : io(ch) * 0.82);
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
          const ct = ctaRect0.top;
          const q0 = Math.max(0, Math.min(1, (vh - ct) / (vh * 1.35)));
          this.rq = this.sceneTween('rq', q0);
          if (Math.abs(q0 - this.rq) < 0.0004) this.rq = q0;
          const e2 = this.rq < 0.5 ? 4 * this.rq * this.rq * this.rq : 1 - Math.pow(-2 * this.rq + 2, 3) / 2;
          const b2 = Math.sin(Math.PI * e2);
          const act2 = rot && this.rq > 0.0004 && this.rq < 0.9996;
          const pre2 = 'perspective(' + Pp + 'px) translateZ(' + (-b2 * vh * 0.55 * Z) + 'px) rotateY(' + (-b2 * 6 * Z) + 'deg) rotateZ(' + (b2 * 2 * Z) + 'deg) translateZ(' + (-D) + 'px) rotateX(';
          if (act2) {
            if (cct) cct.style.transform = pre2 + (ANG * e2 - ANG) + post;
            this.ctaTilt = 1 - e2; this.ctaZoom = b2; this.e2 = e2;
            cpn.style.opacity = String(sst(0.52, 0.94, e2));
            outOp = 1 - sst(0.06, 0.48, e2);
          } else {
            cpn.style.transform = 'none'; if (cct) cct.style.transform = 'none';
            cpn.style.opacity = (rot && this.rq <= 0.0004) ? '0' : '1';
            this.ctaTilt = 0; this.ctaZoom = 0; this.e2 = this.rq >= 0.9996 ? 1 : 0;
            if (rot && this.rq >= 0.9996) outOp = 0;
          }
        }
        if (stk) stk.style.opacity = String((this.pnlOp ?? 1) * (rot ? outOp : (1 - eout * 0.8)));
        const rs = this.reachRef.current, rpn = this.reachPanel || (this.reachPanel = rs && rs.querySelector('[data-reach-panel]'));
        const rct = this.reachContent || (this.reachContent = rs && rs.querySelector('[data-reach-content]'));
        if (rs && rpn && cs && cpn) {
          const rt = reachRect0.top, cb = ctaRect0.bottom;
          const q0 = Math.max(0, Math.min(1, (vh - rt) / (vh * 1.35)));
          this.r3 = this.sceneTween('r3', q0);
          if (Math.abs(q0 - this.r3) < 0.0004) this.r3 = q0;
          const e3 = this.r3 < 0.5 ? 4 * this.r3 * this.r3 * this.r3 : 1 - Math.pow(-2 * this.r3 + 2, 3) / 2;
          const b3 = Math.sin(Math.PI * e3);
          const act3 = this.r3 > 0.0004 && this.r3 < 0.9996;
          const pre3 = 'perspective(' + Pp + 'px) translateZ(' + (-b3 * vh * 0.55 * Z) + 'px) rotateY(' + (b3 * 6 * Z) + 'deg) rotateZ(' + (-b3 * 2 * Z) + 'deg) translateZ(' + (-D) + 'px) rotateX(';
          if (act3 && rot) {
            cpn.style.opacity = String(1 - sst(0.06, 0.48, e3));
            if (cct) cct.style.transform = pre3 + (ANG * e3) + post;
            this.ctaTilt = -e3; this.ctaZoom = b3;
            rpn.style.opacity = String(sst(0.52, 0.94, e3));
            if (rct) rct.style.transform = pre3 + (ANG * e3 - ANG) + post;
            this.rayTilt = 1 - e3; this.rayZoom = b3;
          } else {
            rpn.style.transform = 'none'; if (rct) rct.style.transform = 'none';
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

      common.uCurve.value = P.curvature ?? 0.11;
      common.uRadius.value = P.cornerRadius ?? 0.11;
      common.uTime.value = performance.now() / 1000;
      common.uHoverAmt.value = P.hoverDistortion ?? 1.7;
      setRibbon(P.ribbonTilt ?? 1.7);
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

  renderVals() {
    const n = this.projects.length;
    const p = this.projects[this.state.active];
    const pg = this.state.page;
    const pp = pg ? this.projects[pg.i] : p;

    return {
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

;return Component;`))(DCLogic, window.React);
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
    if (overlay) { overlay.classList.remove('w13-hidden', 'is-hidden'); overlay.style.display = open ? 'block' : 'none'; overlay.style.pointerEvents = vals.overlayPE || 'none'; }
    Object.keys(vals).forEach(function (k) { if (!/Ref$/.test(k) || !vals[k] || typeof vals[k] !== 'object') return; var n = k.slice(0, -3); vals[k].current = (POPUP_REFS[n] && !open) ? null : (n === 'root' ? root : q(n)); });
    var t = document.querySelector('[data-w-text="time"]'); if (t && vals.time != null) t.textContent = vals.time;
    var on = document.querySelector('[data-w-if="soundOn"]'), offEl = document.querySelector('[data-w-if="soundOff"]');
    if (on) { on.classList.remove('w13-hidden', 'is-hidden'); on.style.display = vals.soundOn ? '' : 'none'; } if (offEl) offEl.style.display = vals.soundOff ? '' : 'none';
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
