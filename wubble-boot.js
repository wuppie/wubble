/* wubble boot — runs the exact Claude Design build (V13) on Webflow, fed by Webflow CMS */
(() => {
  const cs = document.currentScript;
  const BASE = (cs && cs.dataset.base) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/';
  const VER = cs && cs.dataset.v || '';
  const q = VER ? '?v=' + VER : '';
  // 1. read CMS projects from the hidden Webflow collection list
  const items = Array.from(document.querySelectorAll('[data-wubble="project"]')).map((el) => {
    const img = el.querySelector('img'); const a = (k) => (el.getAttribute('data-' + k) || '').trim();
    return { title: a('title'), slug: a('slug'), client: a('client'), type: a('services'), year: a('year'), blurb: a('description'), video: a('video'), bg: a('color'), cover: img && img.currentSrc || img && img.src || '' };
  }).filter((p) => p.title);
  const lum = (hex) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 0.5; const n = parseInt(m[1], 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; };
  window.__wubbleCMS = items;
  window.__wubbleMerge = (defs) => {
    if (!items.length) return defs;
    return items.map((p, i) => {
      const d = defs[i % defs.length], o = { ...d };
      ['title', 'client', 'type', 'year', 'blurb'].forEach((k) => { if (p[k]) o[k] = p[k]; });
      if (p.bg) { o.bg = p.bg; o.ink = lum(p.bg) > 0.55 ? '#151412' : '#ecebe6'; }
      if (p.title && p.title !== d.title) o.mark = p.title.toUpperCase().split(/\s+/).slice(0, 2).join(' ');
      o.slug = p.slug; o.cover = p.cover; o.videoUrl = p.video;
      return o;
    });
  };
  // 2. settings from the Webflow root wrapper (data-* attributes) override the build defaults
  const root = document.querySelector('[data-wubble="root"]');
  const settings = {};
  if (root) { for (const [k, v] of Object.entries(root.dataset)) { if (k === 'wubble') continue; settings[k] = v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(+v) ? +v : v); } root.style.display = 'none'; }
  window.__wubbleSettings = settings;
  // 3. fill project media from CMS when a project opens
  const fillMedia = () => {
    const m = /#work\/([^/?]+)/.exec(location.hash); if (!m) return;
    const slugify = (t) => t.toLowerCase().replace(/\s+/g, '-');
    const p = items.find((x) => slugify(x.title) === m[1] || x.slug === m[1]); if (!p || !p.cover) return;
    ['project-shot', 'project-shot-2', 'project-shot-3'].forEach((id) => { const s = document.getElementById(id); if (s && s.getAttribute('src') !== p.cover) s.setAttribute('src', p.cover); });
  };
  new MutationObserver(fillMedia).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('hashchange', fillMedia);
  // 4. mount the build
  fetch(BASE + ((cs && cs.dataset.file) || 'wubble-v20.dc.html') + q).then((r) => r.text()).then((src) => {
    const doc = new DOMParser().parseFromString(src, 'text/html');
    const xdc = doc.querySelector('x-dc'), sc = doc.querySelector('script[data-dc-script]');
    if (sc && Object.keys(settings).length) {
      try { const props = JSON.parse(sc.getAttribute('data-props') || '{}'); for (const [k, v] of Object.entries(settings)) { if (props[k] && typeof props[k] === 'object') props[k].default = v; } sc.setAttribute('data-props', JSON.stringify(props)); } catch (e) {}
    }
    const host = document.createElement('x-dc'); host.innerHTML = xdc.innerHTML; document.body.appendChild(host);
    const s2 = document.createElement('script'); s2.type = 'text/x-dc'; s2.setAttribute('data-dc-script', ''); s2.setAttribute('data-props', sc.getAttribute('data-props') || ''); s2.textContent = sc.textContent; document.body.appendChild(s2);
    const rt = document.createElement('script'); rt.src = BASE + 'support.js' + q; document.head.appendChild(rt);
  }).catch((e) => console.error('wubble: failed to load build', e));
})();
