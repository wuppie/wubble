/* Dees — loads all libraries + site scripts in order. */
(function () {
  var BASE = 'https://cdn.jsdelivr.net/gh/wuppie/wubble@Dees/dees/';
  var libs = [
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js',
    'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js',
    BASE + 'js/dees-badges3d.js',
    BASE + 'js/dees-clients3d.js',
    BASE + 'js/dees-site.js'
  ];
  function load(i) {
    if (i >= libs.length) {
      var m = document.createElement('script'); m.type = 'module'; m.src = BASE + 'js/dees-character.js'; document.body.appendChild(m);
      var root = document.querySelector('[data-dees-root]');
      if (window.DeesSite && root && !root.__deesInit) { root.__deesInit = true; window.DeesSite.init(root); }
      return;
    }
    var s = document.createElement('script'); s.src = libs[i]; s.async = false;
    s.onload = function () { load(i + 1); }; s.onerror = function () { console.warn('[dees] failed', libs[i]); load(i + 1); };
    document.body.appendChild(s);
  }
  load(0);
})();
