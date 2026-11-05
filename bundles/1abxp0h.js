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
  const me = document.currentScript, POLICY = (me && me.dataset.policy) || '/privacy', KEY = 'wb-consent', VERSION = 1, MAX_AGE = 365 * 864e5;
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
/* modules22/wb-sound.js */
/* Wubble click sound: the homepage's click sound on every button / link on any page (the homepage has it built in, so
   don't load this there). Optional: data-src="…mp3" and data-volume="0.5" on this script tag. */
(() => {
  if (window.__wbClickSound) return; window.__wbClickSound = 1;
  const me = document.currentScript, SRC = (me && me.dataset.src) || ((window.WB_ASSETS || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/') + 'sound.mp3');
  const VOL = +((me && me.dataset.volume) || 0.5);
  const pool = [0, 1, 2].map(() => { const a = new Audio(SRC); a.preload = 'auto'; a.volume = VOL; return a; }); let i = 0;
  window.__wbPlayClick = () => { const a = pool[i++ % pool.length]; try { a.currentTime = 0; a.play().catch(() => {}); } catch (err) {} }; // also used by wb-swap.js for page-transition links
  document.addEventListener('click', (e) => {
    const t = e.target; if (!t.closest) return; let hit = !!t.closest('a,button,[data-w-click],[role="button"],[data-wb-row],[data-wb-work-item]');
    for (let n = t; !hit && n && n !== document.body; n = n.parentElement) if (n.style && n.style.cursor === 'pointer') hit = true; /* 3D projects: the canvas shows a hand cursor */
    if (!hit) return;
    const a = pool[i++ % pool.length]; try { a.currentTime = 0; a.play().catch(() => {}); } catch (err) {}
  }, true);
})();

;
/* modules22/wb-cursor.js */
/* Wubble ink cursor (same liquid white ink trail as the homepage, difference-blended), for every page that is not the homepage DC.
   Webflow: just load the script. Turn off on a page with <html data-wb-cursor-off>. Linger: window.WB_INK_LINGER (0.6).
   Touch devices: skipped. */
(() => {
  if (window.__wbCursor) return; window.__wbCursor = 1;
  if (matchMedia('(pointer: coarse)').matches) return;
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f), LINGER = window.WB_INK_LINGER ?? 0.6;
  const initInk = (THREE, box) => {
    const r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setTimeout(() => { if (!r.getContext().isContextLost()) return; try { r.domElement.remove(); } catch (er) {} initInk(THREE, box); }, 1500); }, { once: true });
    r.setPixelRatio(1); /* perf: soft ink, 1x is enough */
    r.setClearColor(0x000000, 0);
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    let A = new THREE.WebGLRenderTarget(4, 4, opts), B = new THREE.WebGLRenderTarget(4, 4, opts);
    const noise = `
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }`;
    const vs = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
    const simU = { uPrev: { value: null }, uA: { value: new THREE.Vector2(-9, -9) }, uB: { value: new THREE.Vector2(-9, -9) }, uR: { value: 0.02 }, uAspect: { value: 1 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2() }, uDecay: { value: 0.975 } };
    const sim = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: simU, vertexShader: vs, fragmentShader: `
      uniform sampler2D uPrev; uniform vec2 uA; uniform vec2 uB; uniform float uR; uniform float uAspect; uniform float uT; uniform vec2 uPx; uniform float uDecay;
      varying vec2 vUv; ${noise}
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
      }` }));
    const simScene = new THREE.Scene(); simScene.add(sim);
    const outU = { uTex: { value: null }, uT: { value: 0 }, uAspect: { value: 1 } };
    const out = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: outU, transparent: true, vertexShader: vs, fragmentShader: `
      uniform sampler2D uTex; uniform float uT; uniform float uAspect; varying vec2 vUv; ${noise}
      void main(){
        float f = texture2D(uTex, vUv).r;
        f += (n2(vUv * vec2(uAspect, 1.0) * 18.0 + uT * 0.4) - 0.5) * 0.12;
        float a = smoothstep(0.42, 0.47, f);
        gl_FragColor = vec4(vec3(1.0), a);
      }` }));
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
    let speed = 0, rad = 0, fade = 1;
    const onMove = (e) => { m.x = e.clientX / window.innerWidth; m.y = 1 - e.clientY / window.innerHeight; if (!m.has) { m.px = m.x; m.py = m.y; m.has = true; } };
    const onOut = (e) => { if (!e.relatedTarget) m.has = false; };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerout', onOut);
    const loop = () => {
      RAF(loop);
      const on = !document.documentElement.hasAttribute('data-wb-cursor-off');
      box.style.display = on ? 'block' : 'none';
      document.documentElement.style.cursor = on ? 'none' : '';
      if (!on) return;
      const t = performance.now() / 1000;
      const dx = (m.x - m.px) * simU.uAspect.value, dy = m.y - m.py;
      speed += (Math.min(Math.hypot(dx, dy) * 40, 1) - speed) * 0.15;
      const size0 = 2;
      const hov = !!(window.__wbCardHover || window.__wbCursorHide); fade += ((hov ? 0 : 1) - fade) * (hov ? 0.14 : 0.06);
      box.style.opacity = String(fade);
      rad += ((m.has && !hov ? (0.018 + speed * 0.07) * size0 : 0) - rad) * 0.2;
      simU.uA.value.set(m.has ? m.px : -9, m.has ? m.py : -9);
      simU.uB.value.set(m.has ? m.x : -9, m.has ? m.y : -9);
      simU.uR.value = rad; simU.uT.value = t; outU.uT.value = t;
      simU.uDecay.value = 0.955 + 0.035 * LINGER;
      m.px = m.x; m.py = m.y;
      simU.uPrev.value = A.texture;
      r.setRenderTarget(B); r.render(simScene, cam);
      const tmp = A; A = B; B = tmp;
      outU.uTex.value = A.texture;
      r.setRenderTarget(null); r.render(outScene, cam);
    };
    loop();
  };

  const boot = async () => {
    const T = await import('https://esm.sh/three@0.186.1');
    const box = document.createElement('div'); box.setAttribute('aria-hidden', 'true'); box.setAttribute('data-wb-persist', '');
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;mix-blend-mode:difference;';
    document.body.appendChild(box); initInk(T, box);
    /* hide the system cursor everywhere, except the hand on links and buttons */
    const st = document.createElement('style'); st.textContent = 'html:not([data-wb-cursor-off]), html:not([data-wb-cursor-off]) *{cursor:none!important} html:not([data-wb-cursor-off]) :is(a,button,[role=button],label,summary,select), html:not([data-wb-cursor-off]) :is(a,button,[role=button]) *{cursor:pointer!important}'; document.head.appendChild(st);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

;
/* modules22/wb-blurtitle.js */
/* Wubble blur titles: every <h1> smears into a soft rotational blur around the cursor (same effect as the About wordmark).
   The real text stays in the DOM (SEO, selection); a WebGL canvas over the h1 draws it, the DOM text becomes transparent.
   Only h1s in view get a canvas (contexts are released when they scroll away).
   Webflow: load site-wide. Opt out per element: data-wb-blur="off". Tune: data-wb-blur-amount="0.7" data-wb-blur-radius="0.5" (of screen height).
   Skipped automatically: letter-split hero titles ([data-gt], [data-split]) and anything inside the menu. */
(() => {
  if (window.__wbBlurTitles) return; window.__wbBlurTitles = 1;
  if (matchMedia('(pointer: coarse)').matches) return;
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const st = document.createElement('style'); st.textContent = '[data-wb-bt-on],[data-wb-bt-on] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}'; document.head.appendChild(st);
  const FS = `precision highp float; varying vec2 vUv; uniform sampler2D uT; uniform vec2 uRes, uM; uniform float uAmt, uR, uK;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
vec4 tx(vec2 p){ vec2 q = p / uRes; if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return vec4(0.0); return texture2D(uT, vec2(q.x, 1.0 - q.y)); }
void main(){ vec2 p = vUv * uRes; vec4 c0 = tx(p); float d = distance(p, uM), fall = max(0.0, 1.0 - d / uR); fall *= fall * (3.0 - 2.0 * fall);
  float amt = uAmt * fall * 0.06 * uK; if (amt < 0.0005) { gl_FragColor = c0; return; }
  vec2 to = p - uM; float rad = length(to), ba = atan(to.y, to.x), j = ign(gl_FragCoord.xy) - 0.5; vec4 acc = c0 * 0.35; float tw = 0.35;
  for (int i = 0; i < 10; i++) { float wt = pow(0.7, float(i)), s = (1.0 + (float(i) + 0.5 + j) * 0.9) * amt;
    acc += (tx(uM + rad * vec2(cos(ba + s), sin(ba + s))) + tx(uM + rad * vec2(cos(ba - s), sin(ba - s)))) * wt; tw += 2.0 * wt; }
  gl_FragColor = acc / tw; }`;
  let mx = -1e4, my = -1e4, tk = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; tk = 1; }, { passive: true });
  document.addEventListener('pointerleave', () => { tk = 0; });
  const skip = (h) => h.getAttribute('data-wb-blur') === 'off' || h.closest('[data-wb-menu],[data-wb-blur="off"]') || h.hasAttribute('data-gt') || h.querySelector('[data-gt],[data-sq],[data-split]') || h.hasAttribute('data-split') || !h.textContent.trim() || h.offsetWidth < 2 || (h.getAttribute('data-wb-blur') !== 'on' && parseFloat(getComputedStyle(h).fontSize) < (+window.WB_BLUR_MIN_PX || 90)); /* only big display titles blur; smaller h1s stay sharp (force with data-wb-blur="on") */
  const paint = (S) => { const h = S.h, hr = h.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1), P = S.pad;
    const W = Math.ceil((hr.width + P * 2) * d), H = Math.ceil((hr.height + P * 2) * d); S.tc.width = W; S.tc.height = H; const g = S.tc.getContext('2d'); g.clearRect(0, 0, W, H); g.scale(d, d); g.textBaseline = 'alphabetic';
    const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const el = n.parentElement; if (!el) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const col = el.__wbCol || cs.color; g.fillStyle = col; g.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      const m = g.measureText('Hg'), asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8, des = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;
      const txt = n.nodeValue, re = /\S+/g; let w; const rg = document.createRange();
      while ((w = re.exec(txt))) { rg.setStart(n, w.index); rg.setEnd(n, w.index + w[0].length); const rs = rg.getClientRects(); if (!rs.length) continue; const r = rs[0];
        const base = r.top - hr.top + P + (r.height + asc - des) / 2; g.fillText(w[0], r.left - hr.left + P, base); } }
    const gl = S.gl; gl.bindTexture(gl.TEXTURE_2D, S.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, S.tc);
    S.cv.width = W; S.cv.height = H; S.cv.style.width = (hr.width + P * 2) + 'px'; S.cv.style.height = (hr.height + P * 2) + 'px'; S.w = hr.width; S.ht = hr.height; S.d = d;
    gl.viewport(0, 0, W, H); gl.uniform2f(S.U.uRes, W, H); };
  const make = (h) => { if (h.__bt) return; const S = h.__bt = { h, pad: 0 };
    h.__wbCol = getComputedStyle(h).color; h.querySelectorAll('*').forEach((e) => { e.__wbCol = getComputedStyle(e).color; });
    const fs = parseFloat(getComputedStyle(h).fontSize) || 40; S.pad = Math.max(24, fs * 0.6);
    const cv = S.cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:30;will-change:transform; /* above page content, below the header (40) and menu (150) */';
    document.body.appendChild(cv); const gl = S.gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false }); if (!gl) { cv.remove(); h.__bt = null; return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }')); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    S.U = {}; ['uT', 'uRes', 'uM', 'uAmt', 'uR', 'uK'].forEach((k) => { S.U[k] = gl.getUniformLocation(pr, k); });
    S.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, S.tex); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    S.tc = document.createElement('canvas'); S.k = 0; S.amt = +(h.getAttribute('data-wb-blur-amount') || 0.7); S.rad = +(h.getAttribute('data-wb-blur-radius') || 0.5);
    paint(S); h.setAttribute('data-wb-bt-on', ''); S.sig = '';
    S.ro = new ResizeObserver(() => { S.dirty = 1; }); S.ro.observe(h); live.add(S); };
  const drop = (h) => { const S = h.__bt; if (!S) return; live.delete(S); S.ro.disconnect(); h.removeAttribute('data-wb-bt-on'); try { S.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) {} S.cv.remove(); h.__bt = null; };
  const live = new Set(), io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { if (!skip(e.target)) make(e.target); } else drop(e.target); }), { rootMargin: '120px 0px' });
  const scan = () => document.querySelectorAll('h1').forEach((h) => { if (h.__btw) return; h.__btw = 1; io.observe(h); });
  let last = performance.now();
  const tick = (now) => { RAF(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    for (const S of live) { const h = S.h; if (!h.isConnected) { drop(h); continue; } const r = h.getBoundingClientRect();
      const op = getComputedStyle(h).opacity, sig = r.width.toFixed(0) + 'x' + r.height.toFixed(0);
      if (S.dirty || sig !== S.sig) { S.dirty = 0; S.sig = sig; paint(S); }
      S.cv.style.transform = 'translate3d(' + (r.left - S.pad).toFixed(1) + 'px,' + (r.top - S.pad).toFixed(1) + 'px,0)'; S.cv.style.opacity = op;
      S.k += (tk - S.k) * (1 - Math.exp(-dt * 3)); const d = S.d, gl = S.gl;
      gl.uniform2f(S.U.uM, (mx - r.left + S.pad) * d, (r.bottom + S.pad - my) * d); gl.uniform1f(S.U.uAmt, S.amt); gl.uniform1f(S.U.uR, innerHeight * S.rad * d); gl.uniform1f(S.U.uK, 0.35 + S.k * 0.65);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3); } };
  /* titles that reveal with their own animation are re-captured once it settles */
  const later = () => live.forEach((S) => { S.dirty = 1; });
  const boot = () => { scan(); setTimeout(() => { scan(); later(); }, 1800); setTimeout(later, 3500); (document.fonts ? document.fonts.ready : Promise.resolve()).then(later); RAF(tick); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(() => scan()).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('wb:swap', () => { scan(); setTimeout(later, 1500); });
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
      const A = row(false), B = row(true); s.textContent = ''; s.style.position = 'relative'; s.append(A, B);
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
/* modules22/wb-project.js */
/* Wubble single project page (Webflow CMS template). Behaviour only, via attributes:
   [data-wb-project] root · [data-wb-enter="n"] page-enter stagger · [data-wb-enter-mask] rises out of its overflow:hidden parent
   [data-wb-reveal] fades/slides in when scrolled into view · [data-wb-parallax="0.12"] media drift · Lenis smooth scroll.
   wbProjectInit(openPromise) re-runs the entrance (page swaps call it after the new content is in). */
(() => {
  if (window.__wbProject) return; window.__wbProject = 1;
  const EZ = 'cubic-bezier(.16,1,.3,1)';
  const hide = (el, y) => { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translate3d(0,' + y + ',0)'; el.style.willChange = 'opacity, transform'; };
  const show = (el, ms, delay) => { el.style.transition = 'opacity ' + ms + 'ms ' + EZ + ' ' + delay + 'ms, transform ' + (ms + 200) + 'ms ' + EZ + ' ' + delay + 'ms'; el.style.opacity = '1'; el.style.transform = 'translate3d(0,0,0)'; };
  let lenis = null, io = null, px = [], ticking = false;
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const tick = (t) => { RAF(tick); if (lenis) lenis.raf(t); const vh = innerHeight;
    for (const el of px) { if (!el.isConnected) continue; const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) continue; const k = ((r.top + r.height / 2) - vh / 2) / vh, s = +el.dataset.wbParallax || 0.12; el.style.transform = 'translate3d(0,' + (k * s * -100).toFixed(2) + '%,0) scale(' + (1 + s) + ')'; } };
  /* leaving a project page: drop Lenis entirely so the next page (homepage / work) gets native scroll back */
  window.wbProjectStop = () => { if (lenis) { lenis.destroy(); lenis = null; window.__wbLenis = null; } if (io) io.disconnect(); px = []; };
  document.addEventListener('wb:leave', () => { if (document.querySelector('[data-wb-project]')) window.wbProjectStop(); });
  document.addEventListener('wb:swap', () => { if (document.querySelector('[data-wb-project]')) window.wbProjectInit(window.__wbInkOpen); });
  window.wbProjectInit = async (open) => {
    const root = document.querySelector('[data-wb-project]'); if (!root) return;
    /* [data-wb-video="url"]: plays that mp4 inside the element (CMS-bound); empty value keeps the box as a placeholder */
    root.querySelectorAll('[data-wb-video]').forEach((el) => { const u = (el.getAttribute('data-wb-video') || '').trim(); if (!u || el.querySelector('video')) return;
      const v = document.createElement('video'); v.className = 'project_image'; v.crossOrigin = 'anonymous'; v.src = u; v.muted = v.loop = v.autoplay = v.playsInline = true; v.setAttribute('playsinline', ''); el.appendChild(v); v.play().catch(() => {}); });
    /* media panels without a video or an image (empty CMS field) are hidden instead of showing an empty grey panel */
    root.querySelectorAll('.project_media').forEach((m) => { const i = m.querySelector('img'); if (!m.querySelector('video') && !(i && (i.getAttribute('src') || '').trim())) m.style.display = 'none'; });
    root.querySelectorAll('.project_gallery').forEach((g) => { if (![...g.children].some((c) => c.style.display !== 'none')) g.style.display = 'none'; });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!lenis && window.Lenis && !reduce) { lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9 }); window.__wbLenis = lenis; }
    if (lenis) { lenis.scrollTo(0, { immediate: true }); lenis.stop(); } else scrollTo(0, 0);
    if (!ticking) { ticking = true; RAF(tick); }
    const enter = [...root.querySelectorAll('[data-wb-enter]')].sort((a, b) => (+a.dataset.wbEnter || 0) - (+b.dataset.wbEnter || 0));
    const masks = [...root.querySelectorAll('[data-wb-enter-mask]')], reveals = [...root.querySelectorAll('[data-wb-reveal]')];
    enter.forEach((el) => hide(el, '28px')); masks.forEach((el) => hide(el, '105%')); reveals.forEach((el) => hide(el, '70px'));
    px = [...root.querySelectorAll('[data-wb-parallax]')];
    /* intro starts level with the title (measured on the title's mask wrapper, which doesn't move during the entrance) */
    const align = () => { const sec = root.querySelector('[data-wb-align-intro]'), t = root.querySelector('[data-wb-enter-mask]'); if (!sec || !t) return;
      if (innerWidth <= 820) { sec.style.paddingTop = ''; return; } const top = t.parentElement.getBoundingClientRect().top + (window.scrollY || 0) - (sec.parentElement.getBoundingClientRect().top + (window.scrollY || 0));
      const lh = parseFloat(getComputedStyle(t).fontSize) || 0, cap = lh * 0.06; sec.style.paddingTop = Math.max(0, Math.round(top + cap)) + 'px'; };
    align(); if (!window.__wbAlignOn) { window.__wbAlignOn = 1; addEventListener('resize', () => { const r = document.querySelector('[data-wb-project]'); if (r) { const s = r.querySelector('[data-wb-align-intro]'), t = r.querySelector('[data-wb-enter-mask]'); if (s && t) { if (innerWidth <= 820) s.style.paddingTop = ''; else s.style.paddingTop = Math.round(t.parentElement.getBoundingClientRect().top - s.parentElement.getBoundingClientRect().top + (parseFloat(getComputedStyle(t).fontSize) || 0) * 0.06) + 'px'; } } }); }
    await (open || window.__wbInkOpen || Promise.resolve());
    masks.forEach((el, i) => show(el, 1100, i * 90)); enter.forEach((el, i) => show(el, 900, 160 + i * 80));
    if (io) io.disconnect();
    io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; show(e.target, 1100, (+e.target.dataset.wbReveal || 0) + (e.target.__first ? 320 : 0)); io.unobserve(e.target); }), { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    reveals.forEach((el) => { el.__first = el.getBoundingClientRect().top < innerHeight; io.observe(el); });
    setTimeout(() => lenis && lenis.start(), 500);
  };
  /* standalone page: scripts run before the page markup exists, so wait for it; hide the entrance elements, THEN let the ink open */
  if (!window.WB_SWAP_ROUTE && (!window.WB_INK_READY || window.__wbInkReadyRes)) {
    const outer = window.__wbInkReadyRes; /* page declared WB_INK_READY before wb-ink loaded: resolve that one */
    const mine = new Promise((res0) => { const res = () => { res0(); outer && outer(); }; let n = 0;
      const f = () => { const root = document.querySelector('[data-wb-project]'), h = root && root.querySelector('h1');
        if (!root || (h && /\{\{/.test(h.textContent))) { if (++n < 200) setTimeout(f, 20); else res(); return; }
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { window.wbProjectInit(); RAF(() => RAF(res)); }); };
      f(); });
    if (!outer) window.WB_INK_READY = mine;
  }
})();

/* [data-wb-stack] (a tall wrapper; its card row is pinned with position:sticky in Webflow) with [data-wb-stack-card] children:
   the cards start stacked in the middle with a slight fan and glide out to their own places while the wrapper scrolls by.
   Phones (< 768px) keep the plain layout. Transforms only, eased every frame, so it stays smooth. */
(() => {
  if (window.__wbStack) return; window.__wbStack = 1;
  /* every [data-wb-stack] on the page is its own group (plans, packages, ...) with its own progress */
  let G = [];
  const find = () => [...document.querySelectorAll('[data-wb-stack]')].map((root) => ({ root, cards: [...root.querySelectorAll('[data-wb-stack-card]')], dx: [], v: 0 })).filter((S) => S.cards.length);
  const measure1 = (S) => { S.cards.forEach((c) => { c.style.transform = ''; c.__st = ''; }); const rs = S.cards.map((c) => c.getBoundingClientRect()), mid = rs.reduce((a, r) => a + r.left + r.width / 2, 0) / rs.length; S.dx = rs.map((r) => mid - (r.left + r.width / 2)); };
  const reset1 = (S) => S.cards.forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; c.__st = ''; });
  const measure = () => G.forEach(measure1);
  const boot = () => { G.forEach(reset1); G = find(); measure(); };
  addEventListener('resize', measure);
  document.addEventListener('wb:swap', boot);
  let last = performance.now();
  const step = (S, dt) => {
    if (innerWidth < 768) { if (S.on) { S.on = false; reset1(S); } return; } if (!S.on) { S.on = true; measure1(S); }
    const r = S.root.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > innerHeight * 2) return; /* far off screen: nothing to animate */
    const row = S.cards[0].parentElement, st = parseFloat(getComputedStyle(row).top) || 0, pv = row.previousElementSibling, oy = pv ? pv.getBoundingClientRect().bottom - r.top + (parseFloat(getComputedStyle(S.root).rowGap) || 0) : 0, /* the row's own offsetTop includes its sticky shift */ travel = Math.max(1, r.height - oy - row.offsetHeight);
    const p = Math.max(0, Math.min(1, (st - oy - r.top + innerHeight * 0.1) / (travel * 0.9))); /* spread runs while the row is pinned and finishes just before the pin releases */
    S.v += (p - S.v) * (1 - Math.exp(-dt * 7)); if (Math.abs(p - S.v) < 0.0005) S.v = p;
    const e = S.v < 0.5 ? 4 * S.v * S.v * S.v : 1 - Math.pow(-2 * S.v + 2, 3) / 2, k = 1 - e, n = S.cards.length, c0 = (n - 1) / 2;
    S.cards.forEach((c, i) => { const o = i - c0, d = Math.abs(o);
      const tf = k < 0.0005 ? '' : 'translate3d(' + (S.dx[i] * k).toFixed(1) + 'px,' + (d * 18 * k).toFixed(1) + 'px,0) rotate(' + (o * 4 * k).toFixed(2) + 'deg) scale(' + (1 - 0.05 * d * k).toFixed(4) + ')';
      if (c.__st !== tf) { c.__st = tf; c.style.transform = tf; c.style.zIndex = tf ? String(10 - Math.round(d)) : ''; } /* only on change: spread cards keep their hover tilt (data-wb-reflect) */ }); };
  const tick = (now) => { requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; G.forEach((S) => { if (S.root.isConnected) step(S, dt); }); };
  const start = () => { boot(); requestAnimationFrame(tick); if (document.fonts) document.fonts.ready.then(measure); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', start) : start();
})();

;
/* modules22/wb-grain.js */
/* Wubble animated film grain: a fixed full-screen noise layer (a few pre-rendered noise tiles cycled ~12 fps).
   Webflow: empty div [data-wb-grain]. Attributes: data-opacity="0.08" · data-fps="12" · data-size="160" (tile px) · data-blend="multiply" */
(() => {
  const init = (host) => {
    if (host.__gr) return; host.__gr = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d, S = +at('size', 160), N = 6;
    const tiles = []; for (let i = 0; i < N; i++) { const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S);
      for (let j = 0; j < im.data.length; j += 4) { const v = Math.random() * 255 | 0; im.data[j] = im.data[j + 1] = im.data[j + 2] = v; im.data[j + 3] = 255; } g.putImageData(im, 0, 0); tiles.push(c.toDataURL()); }
    const el = document.createElement('div'); el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:-50%;width:200%;height:200%;pointer-events:none;background-size:' + S + 'px ' + S + 'px;opacity:' + at('opacity', 0.08) + ';mix-blend-mode:' + at('blend', 'multiply') + ';';
    host.appendChild(el);
    let i = 0, lastT = 0; const step = 1000 / +at('fps', 12);
    const tick = (t) => { if (!host.isConnected) return; requestAnimationFrame(tick); if (t - lastT < step) return; lastT = t; i = (i + 1) % N;
      el.style.backgroundImage = 'url(' + tiles[i] + ')'; el.style.transform = 'translate3d(' + ((Math.random() * 10 - 5) | 0) + '%,' + ((Math.random() * 10 - 5) | 0) + '%,0)'; };
    requestAnimationFrame(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-grain]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  let n = 0; const poll = () => { run(); if (++n < 20) setTimeout(poll, 250); }; poll();
  document.addEventListener('wb:swap', run);
})();

;
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
  const LIVE = matchMedia('(pointer: coarse)').matches ? '' : at('glass-live', '') /* phones: no live copy of another canvas (GPU memory) */, LVAR = at('glass-live-var', ''); let base = null, liveOn = false;
  const paint = (asp) => { wAsp = asp; const CW = matchMedia('(pointer: coarse)').matches ? 512 : LIVE ? 1024 : 2048; /* phones: the blurred backdrop needs no big texture */ wc.width = CW; wc.height = Math.round(CW / asp);
    const bgs = at('glass-word-bg', '#060607').split(','), W = wc.width, H = wc.height;
    if (bgs.length > 1) { const a = T.MathUtils.degToRad(+at('glass-word-angle', 55)), dx = Math.sin(a), dy = -Math.cos(a), half = (Math.abs(dx) * W + Math.abs(dy) * H) / 2;
      const gr = wx.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half); bgs.forEach((c, i) => gr.addColorStop(i / (bgs.length - 1), c.trim())); wx.fillStyle = gr; }
    else wx.fillStyle = bgs[0];
    wx.fillRect(0, 0, W, H);
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
      if (src && k > 0.01) { wx.globalAlpha = 1; wx.drawImage(base, 0, 0); wx.globalAlpha = k; wx.drawImage(src, 0, 0, wc.width, wc.height); wx.globalAlpha = 1; wt.needsUpdate = true; liveOn = true; }
      else if (liveOn) { wx.drawImage(base, 0, 0); wt.needsUpdate = true; liveOn = false; } }
    const d = cam.position.length() + DEPTH, h = 2 * Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * d; cam.getWorldDirection(dir);
    wq.position.copy(cam.position).addScaledVector(dir, d); wq.quaternion.copy(cam.quaternion); wq.scale.set(h * cam.aspect, h, 1); wq.updateMatrixWorld(); };
  document.fonts?.ready.then(() => { wAsp = 0; }); // repaint once Switzer has loaded
  return gm;
};

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
/* modules22/wb-orbit.js */
/* Wubble services hero: the chrome astronaut floats in the centre (behind the title), thin elliptical orbit rings around him,
   and extruded 3D tool logos (glossy black, warm edge light) float along the orbits. Mouse tilts the whole system.
   Webflow: an empty div [data-wb-orbit] filling the hero (position:absolute; inset:0). The title sits above it (higher z-index).
   Attributes: data-logos="greensock,figma,webgl,webflow,shopify" (Simple Icons slugs) · data-speed="1" · data-mouse="1"
   · data-astro="1" · data-astro-size="1" · data-accent="#ff7a2e" (edge light) */
(() => {
  const A = () => window.WB_ASSETS || './', B = 'https://esm.sh/three@0.186.1' /* one three.js version site-wide (latest) */, E = B + '/examples/jsm/';
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const ICON = (s) => 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/' + s + '.svg';
  const init = async (host) => {
    if (host.__orb) return; host.__orb = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d;
    const [T, GL, RE, MO, SV] = await Promise.all([import(B), import(E + 'loaders/GLTFLoader.js'), import(E + 'environments/RoomEnvironment.js'), import(E + 'libs/meshopt_decoder.module.js'), import(E + 'loaders/SVGLoader.js')]);
    const COARSE = matchMedia('(pointer: coarse)').matches; /* phones: lighter render (pixel ratio, shadow map), steady size while the address bar moves */
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(COARSE ? 1.5 : 1.75, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.setClearColor(0, 0);
    r.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault()); r.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; host.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 200); cam.position.set(0, 0, 22);
    { const pm = new T.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; pm.dispose(); }
    const ACC = new T.Color(at('accent', '#ffffff')); /* neutral by default (was orange) */
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    const key = new T.DirectionalLight(0xffffff, 1.8); key.position.set(-6, 9, 14); key.castShadow = true; key.shadow.mapSize.setScalar(COARSE ? 1024 : 2048); key.shadow.radius = 8; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -22, right: 22, top: 14, bottom: -14, near: 1, far: 60 }); key.shadow.camera.updateProjectionMatrix();
    const warm = new T.PointLight(ACC, 30, 30, 2); warm.position.set(6, -2, 4); const rim = new T.DirectionalLight(0xffffff, 1.4); rim.position.set(5, 3, -6);
    /* shadow catcher: a wall behind everything that only shows the shadows (page stays white) */
    const wall = new T.Mesh(new T.PlaneGeometry(120, 80), new T.ShadowMaterial({ opacity: +at('shadow', 0.16) })); wall.position.z = -9; wall.receiveShadow = true; sc.add(wall);
    sc.add(key, warm, rim, new T.AmbientLight(0xffffff, 0.04));
    const world = new T.Group(); world.rotation.x = 0.32; sc.add(world);
    /* data-look="glass": astronaut + logos in the shared see-through glass (wb-glass.js; its options are data attributes here) */
    const GLASS = at('look', '') === 'glass' && window.WBGlass ? WBGlass(T, sc, r, at) : null;
    /* data-look="chrome": the About crystal look (faceted mirror chrome, bright exposure) for astronaut + logos. data-roughness="0" · data-env="1" · data-exposure="2.3" */
    const CHROME = at('look', '') === 'chrome' ? new T.MeshPhysicalMaterial({ color: 0xd6d4cf, metalness: 1, roughness: +at('roughness', 0.14), flatShading: true, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: +at('env', 1.3) }) : null;
    if (CHROME) r.toneMappingExposure = +at('exposure', 2.3);
    const LOOK = GLASS || CHROME;
    /* orbit rings: thin ellipses, slightly offset */
    const RX = 12, RZ = 7.2, rings = [];
    for (const [k, y, o] of [[1, 0, 0.16], [0.94, 0.35, 0.1], [1.06, -0.3, 0.08]]) { const pts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * RX * k, y, Math.sin(a) * RZ * k)); }
      if (at('rings', '0') === '0') continue; const ln = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: o })); world.add(ln); rings.push(ln); }
    /* astronaut (same chrome as About/Work) */
    let mixer = null, astro = null;
    if (at('astro', '1') !== '0') { const ld = new GL.GLTFLoader(); ld.setMeshoptDecoder(MO.MeshoptDecoder);
      ld.loadAsync(A() + 'models/astronaut-rig-v2.glb').then((g) => { const m = g.scene; astro = new T.Group(); astro.add(m); sc.add(astro);
        const fl = g.animations.find((x) => /float/i.test(x.name)) || g.animations[0]; mixer = new T.AnimationMixer(m); if (fl) mixer.clipAction(fl).play(); mixer.update(0);
        m.updateMatrixWorld(true); const bx = new T.Box3().setFromObject(m, true), sz = bx.getSize(new T.Vector3()), cn = bx.getCenter(new T.Vector3()), s = 7.2 * +at('astro-size', 1.7) / sz.y;
        m.scale.setScalar(s); m.position.set(-cn.x * s, -cn.y * s, -cn.z * s);
        const mat = LOOK || new T.MeshPhysicalMaterial({ color: 0xd6d4cf, metalness: 1, roughness: 0.14, flatShading: true, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3 });
        m.traverse((o) => { if (o.isMesh) { o.material = mat; o.frustumCulled = false; o.castShadow = true; } }); }).catch((e) => console.warn('[orbit] astronaut', e)); }
    /* logos: Simple Icons SVG → extruded, glossy black body + warm metallic edge */
    const body = LOOK || new T.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.6, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4 });
    const edge = LOOK || new T.MeshPhysicalMaterial({ color: 0x2a2a2c, metalness: 1, roughness: 0.22, envMapIntensity: 1.6 });
    const slugs = at('logos', 'greensock,figma,webgl,webflow,shopify').split(',').map((s) => s.trim()).filter(Boolean), logos = [];
    const loader = new SV.SVGLoader();
    await Promise.all(slugs.map(async (slug, i) => { try { const txt = await (await fetch(ICON(slug))).text(), data = loader.parse(txt), shapes = [];
        for (const p of data.paths) shapes.push(...SV.SVGLoader.createShapes(p));
        const geo = new T.ExtrudeGeometry(shapes, { depth: 3.2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.35, bevelSegments: 3, curveSegments: 10 }); geo.center(); geo.scale(0.085, -0.085, 0.085);
        const mesh = new T.Mesh(geo, [body, edge]); mesh.castShadow = true; const grp = new T.Group(); grp.add(mesh); world.add(grp);
        logos.push({ grp, mesh, a: i / slugs.length * Math.PI * 2 + 0.4, ring: i % 3, spin: new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.5), bob: Math.random() * 6 });
      } catch (e) { console.warn('[orbit] logo', slug, e); } }));
    /* on phones the fixed host grows and shrinks with the address bar while scrolling: keep the tallest height for the same width
       (canvas pinned to the top, the extra part sits below the screen) so the scene never rescales mid-scroll */
    let lw = 0, lh = 0;
    const size = () => { const w = host.clientWidth || 1; let h = host.clientHeight || 1;
      if (COARSE) { if (w === lw) { if (h <= lh) return; } lw = w; lh = h; r.domElement.style.height = h + 'px'; }
      r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = 22 * Math.max(1, 1.55 / cam.aspect); cam.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(host);
    const M = { x: 0, y: 0, tx: 0, ty: 0 }, MI = +at('mouse', 1), SPD = +at('speed', 1);
    addEventListener('pointermove', (e) => { M.tx = e.clientX / innerWidth * 2 - 1; M.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    let vis = true; new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(host);
    let last = performance.now();
    const heroEl = host.closest('section') || host.parentElement, STAY = at('logos-scroll', 'hero'); const wv = new T.Vector3();
    const tick = (now) => { RAF(tick); if (!host.isConnected || !vis) return; const dt = Math.min(0.05, (now - last) / 1000); last = now, t = now / 1000;
      /* logos belong to the hero: they scroll up and out with it (world-space offset = hero scroll distance); the astronaut stays */
      if (STAY === 'hero') { const hr = heroEl.getBoundingClientRect(), HH = Math.tan(cam.fov * Math.PI / 360) * cam.position.z; world.position.y = -hr.top / (COARSE ? lh : innerHeight) * 2 * HH; /* canvas height, not the address-bar-dependent viewport */ world.visible = hr.bottom > -innerHeight * 0.5; }
      const k = 1 - Math.exp(-dt * 2.4); M.x += (M.tx - M.x) * k; M.y += (M.ty - M.y) * k;
      world.rotation.x = 0.32 + M.y * 0.18 * MI; world.rotation.z = -M.x * 0.08 * MI; world.rotation.y = M.x * 0.25 * MI;
      for (const L of logos) { L.a += dt * 0.12 * SPD; const kk = [1, 0.94, 1.06][L.ring], y = [0, 0.35, -0.3][L.ring];
        L.grp.position.set(Math.cos(L.a) * RX * kk, y + Math.sin(t * 0.7 + L.bob) * 0.5, Math.sin(L.a) * RZ * kk);
        L.mesh.rotation.x += L.spin.x * dt; L.mesh.rotation.y += (0.35 + L.spin.y) * dt; L.mesh.rotation.z += L.spin.z * dt * 0.5; }
      if (astro) { astro.rotation.y = -0.4 + M.x * 0.5 * MI + Math.sin(t * 0.3) * 0.15; astro.rotation.x = M.y * 0.15 * MI; astro.position.set(M.x * 0.6 * MI, +at('astro-y', -2.2) + Math.sin(t * 0.8) * 0.25 - M.y * 0.4 * MI, -1); /* lower, so the head clears the top nav */ }
      warm.position.set(6 + M.x * 4, -2 - M.y * 3, 4);
      if (mixer) mixer.update(dt); r.render(sc, cam); };
    RAF(tick);
  };
  const run = () => document.querySelectorAll('[data-wb-orbit]').forEach((h) => init(h).catch((e) => console.warn('[orbit]', e)));
  let n = 0; const poll = () => { run(); if (++n < 30 && !document.querySelector('[data-wb-orbit] canvas')) setTimeout(poll, 250); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
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
/* modules22/wb-glasstext.js */
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
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(matchMedia('(pointer: coarse)').matches ? 1.25 : 1.75, devicePixelRatio || 1)); r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.setClearColor(0, 0);
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
    /* compile the glass shader now, not on the first visible frame (that froze the footer reveal on phones) */
    try { (r.compileAsync ? r.compileAsync(sc, cam) : Promise.resolve(r.compile(sc, cam))).catch(() => {}); } catch (e) {}
    const shown = () => { const f = h.closest('[data-footer]'); return !f || getComputedStyle(f).visibility !== 'hidden'; };
    const loop = (now) => { RAF(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!shown()) return; if (host.offsetTop !== Math.round(h.offsetTop - h.offsetHeight * 0.25)) place();
      if (!still) { tx += (mx - tx) * Math.min(1, dt * 3); ty += (my - ty) * Math.min(1, dt * 3); }
      mesh.rotation.set(ty * 0.18 * MOUSE, tx * 0.22 * MOUSE, 0); r.render(sc, cam); };
    RAF(loop);
  };
  const scan = () => document.querySelectorAll('[data-wb-glasstext]').forEach((h) => { const go = () => init(h).catch((e) => console.warn('[glasstext]', e)); window.WB_NEAR ? window.WB_NEAR(h, go) : go(); });
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
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

;
/* modules22/wb-ui.js */
/* Wubble V22 module: ui — methods mixed into the page component */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  // lazy-start heavy 3D: run fn once the page is scrolled past frac (0–1), or after idleMs when the browser is idle
  whenNear(frac, idleMs, fn) {
    let done = false; const go = () => { if (done || this.dead) return; done = true; clearInterval(t); fn(); };
    const t = setInterval(() => { const H = document.documentElement.scrollHeight - innerHeight; if (H > 0 && scrollY / H >= frac) go(); }, 250);
    // no idle fallback: a new WebGL context while the hero is on screen evicts the hero/slider contexts
  },
  initGsapTitles() {
    const G = window.gsap; if (!G) { this.gtWait = setTimeout(() => this.initGsapTitles(), 120); return; }
    const titles = Array.from(document.querySelectorAll('[data-gt]')).map((el) => {
      const words = Array.from(el.querySelectorAll('[data-gw]')), hero = el.getAttribute('data-gt') === 'hero';
      G.set(words, { yPercent: 0, y: 0, rotation: 0, skewY: 0, opacity: 1 });
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
      const at0 = el.getAttribute('data-gt'), prog = at0 === 'hero' ? 'rp' : at0 === '0.35' ? 'rq' : at0 === '1.0' ? 'r3' : at0 === '-0.6' ? 'in3' : at0 === 'about' ? 'ab' : null;
      return { el, words, chars, prog, scat: 0, hero, at: hero ? 0 : parseFloat(el.getAttribute('data-gt')) || 0, sec: el.closest('section'), on: hero, tw: null };
    });
    // locomotive-style: each word rises out of its mask with a soft rotate/skew that settles; exits leave in the scroll direction
    const play = (t, on, dir) => {
      t.on = on; if (t.tw) t.tw.kill();
      const up = dir < 0;
      if (on && t.lastOut != null) G.set(t.words, { yPercent: t.lastOut > 0 ? 120 : -120, rotation: (t.lastOut > 0 ? 7 : -7) * (this.props.titleSkew ?? 1), skewY: (t.lastOut > 0 ? 4 : -4) * (this.props.titleSkew ?? 1) });
      t.lastOut = on ? null : (up ? -1 : 1);
      t.tw = on ? G.to(t.words, { yPercent: 0, rotation: 0, skewY: 0, duration: 1.7, ease: 'expo.out', stagger: 0.07, overwrite: true, force3D: true })
        : G.to(up ? t.words : t.words.slice().reverse(), { yPercent: up ? -120 : 120, rotation: (up ? -5 : 5) * (this.props.titleSkew ?? 1), skewY: (up ? -3 : 3) * (this.props.titleSkew ?? 1), duration: 1.0, ease: 'power3.inOut', stagger: 0.04, overwrite: true, force3D: true });
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
        if (hin && fr) { const fi = fr.firstElementChild; fi.style.transform = hin.style.transform;
          // entering the footer: the fixed hero layer glides up and fades out smoothly (eased, scrubbed by scroll)
          const sp = this._ftSp || (this._ftSp = document.querySelector('[data-footer-spacer]')), vh0 = innerHeight;
          const fq = sp ? Math.max(0, Math.min(1, (vh0 * 1.6 - sp.getBoundingClientRect().top) / (vh0 * 1.1))) : 0;
          this._fqS = (this._fqS ?? fq) + (fq - (this._fqS ?? fq)) * 0.12; const fe = this._fqS * this._fqS * (3 - 2 * this._fqS);
          const tr = fe > 0.0005 ? '0 ' + (-fe * vh0 * 0.7).toFixed(1) + 'px' : ''; if (fr.__tr !== tr) { fr.__tr = tr; fr.style.translate = tr; }
          fi.style.opacity = String((hin.style.opacity === '' ? 1 : +hin.style.opacity) * (1 - fe));
          { const cf = this._cfr || (this._cfr = document.querySelector('[data-clouds-front]')); if (cf) { if (cf.__tr !== tr) { cf.__tr = tr; cf.style.translate = tr; } } }
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
        const raw = t.prog === 'in3' ? 1 - (this.r3 ?? 0) : t.prog === 'ab' ? (window.__wbAboutOp || 0) : (this[t.prog] ?? 0);
        const WL = this.workLetters;
        if (t.prog === 'rp' && (this.props.titleMorph ?? true) && WL && WL.length) {
          const HS1 = this.props.heroStart ?? 0.04, mk = Math.max(0, Math.min(1, (raw - HS1 - 0.02) / 0.6));
          const pre0 = Math.max(0, Math.min(1, (raw - HS1) / 0.1)), pre = pre0 < 0.02 ? 0 : pre0; if (t.scat0 === mk && t.pre0 === pre && !t.dirty) return; t.scat0 = mk; t.scat = mk; t.pre0 = pre;
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
        // locomotive-style: scrubbed to scroll, smoothed; letters rise out of the mask with a settling rotate/skew and leave upward
        const cl = (x) => Math.max(0, Math.min(1, x)), rp1 = this.rp || 0, rq1 = this.rq || 0, r31 = this.r3 || 0;
        let tin = 1, tout = 0;
        if (t.prog === 'rp') { tout = cl((rp1 - (this.props.heroStart ?? 0.04)) / 0.4); }
        else if (t.prog === 'rq') { tin = cl(((this._introS || 0) - 0.72) / 0.28); tout = cl((rq1 - 0.02) / 0.4); }
        else if (t.prog === 'r3') { tin = cl((rq1 - 0.6) / 0.4); tout = cl((r31 - 0.02) / 0.4); }
        else if (t.prog === 'in3') { tin = cl((r31 - 0.55) / 0.4); }
        else if (t.prog === 'ab') { tin = cl(((window.__wbAboutOp || 0) - 0.45) / 0.4); tout = cl((window.__wbMonZoom || 0) / 0.35); }
        const tn = performance.now(), tdt = Math.min(0.05, (tn - (t.lt || tn)) / 1000); t.lt = tn; const f = 1 - Math.exp(-tdt * 6);
        t.ki = t.ki == null ? tin : t.ki + (tin - t.ki) * f; t.ko = t.ko == null ? tout : t.ko + (tout - t.ko) * f;
        if (Math.abs(t.ki - tin) < 0.0004) t.ki = tin; if (Math.abs(t.ko - tout) < 0.0004) t.ko = tout;
        const lk = t.ki.toFixed(4) + '|' + t.ko.toFixed(4); if (t.lk === lk) return; t.lk = lk;
        if (!t.mk) { t.mk = true; t.words.forEach((w) => { const m = w.parentElement; if (m) m.style.overflow = 'hidden'; }); t.chars.forEach((c) => { c.style.filter = ''; c.style.opacity = ''; c.style.transformOrigin = '0% 100%'; c.style.willChange = 'transform'; }); }
        const n = t.chars.length, st = Math.min(0.09, 0.55 / Math.max(1, n)), span = 1 - st * (n - 1);
        t.chars.forEach((c, i) => {
          const li = cl((t.ki - i * st) / span), lo = cl((t.ko - i * st) / span), ea = 1 - Math.pow(1 - li, 3), eb = lo * lo * (3 - 2 * lo);
          const TK = this.props.titleSkew ?? 1; /* data-title-skew on the root: 0 = letters rise/leave straight, no rotate/skew */
          const y = (window.__wbAscend ? -1 : 1) * ((1 - ea) * 115 - eb * 115), rot = ((1 - ea) * 10 - eb * 6) * TK, sk = ((1 - ea) * 7 - eb * 4) * TK;
          c.style.transform = 'translate3d(0,' + y.toFixed(2) + '%,0) rotate(' + rot.toFixed(2) + 'deg) skewY(' + sk.toFixed(2) + 'deg)';
        });
      });
      { // services rows: each line rises in as the panel arrives, then lifts out as About takes over
        const rows = this._lsRows || (this._lsRows = Array.from(document.querySelectorAll('[data-svc-row] [data-gw]'))), vhR = window.__svh || innerHeight, intoR = this._ctT == null ? 1 : -this._ctT / vhR, raR = this.ra || 0;
        const tn = performance.now(), tdt = Math.min(0.05, (tn - (this._lsT || tn)) / 1000); this._lsT = tn; const f = 1 - Math.exp(-tdt * 6), cl = (x) => Math.max(0, Math.min(1, x));
        rows.forEach((el, i) => { const si = cl((raR - 0.4 - i * 0.06) / 0.45), so = cl(((this.r3 || 0) - 0.02 - i * 0.04) / 0.36);
          el.__ki = el.__ki == null ? si : el.__ki + (si - el.__ki) * f; el.__ko = el.__ko == null ? so : el.__ko + (so - el.__ko) * f;
          if (Math.abs(el.__ki - si) < 0.0004) el.__ki = si; if (Math.abs(el.__ko - so) < 0.0004) el.__ko = so;
          const ea = 1 - Math.pow(1 - el.__ki, 3), eb = el.__ko * el.__ko * (3 - 2 * el.__ko), k = ea.toFixed(4) + eb.toFixed(4); if (el.__lk === k) return; el.__lk = k;
          el.style.transformOrigin = '0% 100%'; el.style.transform = 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * ((1 - ea) * 115 - eb * 115)).toFixed(2) + '%,0) rotate(' + ((1 - ea) * 10 - eb * 6).toFixed(2) + 'deg) skewY(' + ((1 - ea) * 7 - eb * 4).toFixed(2) + 'deg)'; });
      }
      titles.forEach((t) => {
        if (!t.sec || (t.prog && !t.hero)) return; const r = t.sec.getBoundingClientRect(), into = -r.top / vh;
        const want = into >= t.at - (t.hero ? 1 : 0.5) && r.bottom > vh * 0.5 && (t.hero || into >= t.at);
        if (want !== t.on) { if (!want && t.scat > 0.05) t.on = false; else play(t, want, want ? 0 : (r.bottom <= vh * 0.5 ? -1 : 1)); }
      });
    };
    tick();
  },
  initUiFx() {
    const G = window.gsap;
    // click sound on every button / link / project
    const SRC = (this.props.clickSound || '').trim() || ((window.WB_ASSETS || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/') + 'sound.mp3');
    const pool = [0, 1, 2].map(() => { const a = new Audio(SRC); a.preload = 'auto'; a.volume = this.props.clickVolume ?? 0.5; return a; }); let pi = 0;
    this.playClick = window.__wbPlayClick = () => { const a = pool[pi++ % pool.length]; try { a.volume = this.props.clickVolume ?? 0.5; a.currentTime = 0; a.play().catch(() => {}); } catch (e) {} };
    document.addEventListener('click', (e) => { const t = e.target; if (!t.closest) return; if (t.closest('a,button,[data-w-click],[role="button"],[data-wb-row],[data-wb-work-item]')) return this.playClick(); for (let n = t; n && n !== document.body; n = n.parentElement) if (n.style && n.style.cursor === 'pointer') return this.playClick(); }, true); /* also clicks on 3D projects (canvas shows a hand cursor) */
    // W logo: random gooey squeeze
    const w = document.querySelector('[data-logo-w]');
    if (w && G && false) { const go = () => { if (this.dead) return; G.timeline().to(w, { scaleX: 0.62, scaleY: 1.18, duration: 0.5, ease: 'expo.out' }).to(w, { scaleX: 1, scaleY: 1, duration: 1.3, ease: 'elastic.out(1, 0.45)' }); this._wT = setTimeout(go, 2600 + Math.random() * 3200); }; this._wT = setTimeout(go, 2200); }
    // services: letters roll up on hover
    if (!window.gsap) { setTimeout(() => this.initUiFx2 && this.initUiFx2(), 300); }
    this.initUiFx2 = () => { const G = window.gsap; if (!G) { setTimeout(this.initUiFx2, 300); return; }
    document.querySelectorAll('[data-svc-list] [data-gw]').forEach((el) => { if (el.__roll) return; el.__roll = true;
      const txt = el.textContent; el.textContent = ''; el.style.display = 'inline-flex';
      const chars = [];
      Array.from(txt).forEach((ch, i) => {
        const m = document.createElement('span'); m.style.cssText = 'position:relative;display:inline-block;overflow:hidden;vertical-align:top;line-height:1;';
        const a = document.createElement('span'), b = document.createElement('span'), c = ch === ' ' ? '\u00a0' : ch;
        a.textContent = c; b.textContent = c; a.style.cssText = 'display:block;'; b.style.cssText = 'display:block;position:absolute;left:0;top:100%;color:var(--svc-hover-ink,#0b0b0b);';
        m.appendChild(a); m.appendChild(b); el.appendChild(m); chars.push([a, b]);
      });
      const li = el.closest('li'); if (!li || !G) return;
      const all = chars.flat();
      li.style.cursor = 'default';
      const fill = li.querySelector('[data-svc-fill]'), arr = li.querySelector('[data-svc-arrow]');
      el.__chars = all;
    }); };
    if (window.gsap) this.initUiFx2();
    if (!window.__svcHoverDel) { window.__svcHoverDel = true;
      const go = (row, on) => { const G = window.gsap; if (!G || !row) return;
        let el = row.querySelector('[data-gw]'); if (el && !el.__chars) { this.initUiFx2(); el = row.querySelector('[data-gw]'); }
        const all = (el && el.__chars) || [], fill = row.querySelector('[data-svc-fill]'), arr = row.querySelector('[data-svc-arrow]');
        if (all.length) G.to(all, { yPercent: on ? -100 : 0, duration: on ? 0.32 : 0.3, ease: 'power3.out', stagger: { each: on ? 0.008 : 0.006, from: on ? 'start' : 'end' }, overwrite: true });
        if (fill) G.to(fill, { scaleY: on ? 1 : 0, duration: on ? 0.45 : 0.4, ease: 'expo.out', overwrite: true });
        // r14.15: the fill must sit UNDER the text (Webflow can reorder layers), and the text turns dark on the light bar
        if (fill && !row.__zf) { row.__zf = 1; fill.style.zIndex = '0'; Array.from(row.children).forEach((ch) => { if (ch === fill || ch.contains(fill)) return; const cs = getComputedStyle(ch); if (cs.position === 'static') ch.style.position = 'relative'; ch.style.zIndex = '1'; }); }
        if (!all.length) { row.style.transition = 'color 0.3s'; row.style.color = on ? 'var(--svc-hover-ink,#0b0b0b)' : ''; row.querySelectorAll('h1,h2,h3,h4,p,span').forEach((t) => { t.style.transition = 'color 0.3s'; t.style.color = on ? 'var(--svc-hover-ink,#0b0b0b)' : ''; }); }
        if (arr) G.to(arr, { rotate: on ? -90 : 0, duration: on ? 0.45 : 0.4, ease: 'expo.out', overwrite: true }); };
      let cur = null;
      let px = -1, py = -1; const set = (row) => { if (row === cur) return; if (cur) go(cur, false); cur = row; if (row) go(row, true); };
      document.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; px = e.clientX; py = e.clientY; set(e.target.closest && e.target.closest('[data-svc-row]')); }, { passive: true });
      // rows scroll out from under a still cursor without any pointer event — re-check on scroll
      addEventListener('scroll', () => { if (!cur || px < 0) return; const el = document.elementFromPoint(px, py); set(el && el.closest ? el.closest('[data-svc-row]') : null); }, { passive: true });
      document.addEventListener('pointerleave', () => { if (cur) { go(cur, false); cur = null; } });
    }
    this.initSvcCard = () => { const G = window.gsap, L = document.querySelector('[data-svc-list]'); if (!G || !L || L.__card) { if (!G || !L) setTimeout(this.initSvcCard, 400); return; } L.__card = true;
      const card = document.createElement('div'); card.setAttribute('data-svc-card', ''); card.setAttribute('aria-hidden', 'true');
      card.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483000;pointer-events:none;width:clamp(170px,17vw,290px);aspect-ratio:1/1;box-sizing:border-box;padding:7px;border-radius:16px;background:#ece9e2;box-shadow:0 18px 50px rgba(0,0,0,0.45);opacity:0;transform:translate(-50%,-50%) scale(0.6);will-change:transform,opacity;';
      card.innerHTML = '<div data-c-in style="position:relative;width:100%;height:100%;border-radius:11px;overflow:hidden;background:#1a1a19;"><div data-c-img style="position:absolute;inset:0;background-size:cover;background-position:50% 50%;"></div><div data-c-mark style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--display,Oswald),Helvetica,sans-serif;font-weight:700;font-size:clamp(28px,3vw,52px);letter-spacing:-0.03em;text-align:center;line-height:0.85;padding:12%;"></div><div data-c-num style="position:absolute;right:10px;bottom:6px;font-family:var(--display,Oswald),Helvetica,sans-serif;font-weight:700;font-size:clamp(22px,2vw,34px);color:#ece9e2;text-shadow:0 2px 10px rgba(0,0,0,0.5);"></div></div>';
      document.body.appendChild(card);
      const img = card.querySelector('[data-c-img]'), mark = card.querySelector('[data-c-mark]'), num = card.querySelector('[data-c-num]'), inr = card.querySelector('[data-c-in]');
      const S = { x: 0, y: 0, tx: 0, ty: 0, r: 0, on: false, raf: 0 };
      const loop = () => { S.raf = requestAnimationFrame(loop); const vx = S.tx - S.x; S.x += vx * 0.14; S.y += (S.ty - S.y) * 0.14; S.r += ((Math.max(-14, Math.min(14, vx * 0.25)) - 3) - S.r) * 0.1;
        card.style.left = S.x + 'px'; card.style.top = S.y + 'px'; card.style.rotate = S.r.toFixed(2) + 'deg'; if (!S.on && +card.style.opacity < 0.01) { cancelAnimationFrame(S.raf); S.raf = 0; } };
      const rows = Array.from(L.querySelectorAll('[data-svc-row]'));
      rows.forEach((row, i) => row.addEventListener('pointerenter', (e) => {
        if (matchMedia('(pointer: coarse)').matches) return;
        const p = this.projects[i % this.projects.length] || {}, im = row.querySelector('img[data-wb-svc-img], [data-wb-svc-img] img'), src = ((im && !im.classList.contains('w-dyn-bind-empty') && !/placeholder/i.test(im.getAttribute('src') || '') && (im.currentSrc || im.getAttribute('src'))) || row.getAttribute('data-img') || '').trim(); /* Webflow: swap the Image inside each row */
        num.textContent = String(i + 1).padStart(2, '0');
        img.style.backgroundImage = src ? 'url("' + src + '")' : 'none'; inr.style.background = src ? '#1a1a19' : (p.bg || '#1a1a19');
        mark.textContent = src ? '' : (p.mark || ''); mark.style.color = p.ink || '#ece9e2';
        if (!S.on) { S.x = S.tx = e.clientX; S.y = S.ty = e.clientY; }
        S.on = true; if (!S.raf) loop();
        G.fromTo(inr, { scale: 1.15 }, { scale: 1, duration: 0.6, ease: 'expo.out', overwrite: true });
        G.to(card, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', overwrite: 'auto' }); }));
      L.addEventListener('pointermove', (e) => { S.tx = e.clientX; S.ty = e.clientY; });
      L.addEventListener('pointerleave', () => { S.on = false; G.to(card, { opacity: 0, scale: 0.6, duration: 0.35, ease: 'power3.in', overwrite: 'auto' }); });
      addEventListener('scroll', () => { if (S.on && !L.matches(':hover')) { S.on = false; G.to(card, { opacity: 0, scale: 0.6, duration: 0.3, overwrite: 'auto' }); } }, { passive: true });
    };
    this.initSvcCard();
  },
  initInk(THREE) {
    const box = this.inkRef.current; if (!box || this.coarse || !(this.props.cursorInk ?? true)) return;
    const r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setTimeout(() => { if (this.dead || !r.getContext().isContextLost()) return; try { r.domElement.remove(); } catch (er) {} this.initInk(THREE); }, 1500); }, { once: true });
    r.setPixelRatio(1); /* perf: the ink is soft and blurry, 1x looks the same and halves the per-frame fill */
    r.setClearColor(0x000000, 0);
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    let A = new THREE.WebGLRenderTarget(4, 4, opts), B = new THREE.WebGLRenderTarget(4, 4, opts);
    const noise = `
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }`;
    const vs = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
    const simU = { uPrev: { value: null }, uA: { value: new THREE.Vector2(-9, -9) }, uB: { value: new THREE.Vector2(-9, -9) }, uR: { value: 0.02 }, uAspect: { value: 1 }, uT: { value: 0 }, uPx: { value: new THREE.Vector2() }, uDecay: { value: 0.975 } };
    const sim = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: simU, vertexShader: vs, fragmentShader: `
      uniform sampler2D uPrev; uniform vec2 uA; uniform vec2 uB; uniform float uR; uniform float uAspect; uniform float uT; uniform vec2 uPx; uniform float uDecay;
      varying vec2 vUv; ${noise}
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
      }` }));
    const simScene = new THREE.Scene(); simScene.add(sim);
    const outU = { uTex: { value: null }, uT: { value: 0 }, uAspect: { value: 1 } };
    const out = new THREE.Mesh(quad, new THREE.ShaderMaterial({ uniforms: outU, transparent: true, vertexShader: vs, fragmentShader: `
      uniform sampler2D uTex; uniform float uT; uniform float uAspect; varying vec2 vUv; ${noise}
      void main(){
        float f = texture2D(uTex, vUv).r;
        f += (n2(vUv * vec2(uAspect, 1.0) * 18.0 + uT * 0.4) - 0.5) * 0.12;
        float a = smoothstep(0.42, 0.47, f);
        gl_FragColor = vec4(vec3(1.0), a);
      }` }));
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
      const hideInk = this.cardHover || window.__wbCursorHide; this.inkFade = (this.inkFade ?? 1) + ((hideInk ? 0 : 1) - (this.inkFade ?? 1)) * (hideInk ? 0.14 : 0.06);
      box.style.opacity = String(this.inkFade);
      rad += ((m.has && !hideInk ? (0.018 + speed * 0.07) * size0 : 0) - rad) * 0.2;
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
  },
  initReveals(THREE) {
    const MAXM = 6;
    let r = null, scene, cam, meshes = [], mounted = null;
    const vs = `uniform vec4 uRect; varying vec2 vUv;
      void main(){ vUv = uv; vec2 p = uRect.xy + (position.xy * 0.5 + 0.5) * uRect.zw; gl_Position = vec4(p, 0.0, 1.0); }`;
    const fs = `uniform float uP; uniform float uT; uniform vec2 uPx; uniform float uSeed; varying vec2 vUv;
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
      }`;
    const build = (box) => {
      if (r) { box.appendChild(r.domElement); mounted = box; size(); return; }
      r = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1 : 1.5)); r.setClearColor(0, 0); r.autoClear = true;
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
          w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * (1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 5) + 'deg)';
        });
      });
      let mi = 0;
      pgEl.querySelectorAll('[data-media]').forEach((m) => {
        const rc = m.getBoundingClientRect();
        if (!m.dataset.st && live && rc.top < vh * 0.72 && rc.bottom > 0) m.dataset.st = String(now + 250);
        const st = +m.dataset.st || 0;
        const t = st ? Math.max(0, Math.min(1, (now - st) / 1500)) : 0;
        const e = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const inner = m.firstElementChild;
        const par = ((rc.top + rc.height / 2) - vh / 2) / vh;
        if (inner) inner.style.transform = 'translate3d(0,' + (par * -7 + (1 - e) * 12) + '%,0) scale(' + (1.25 - 0.25 * e) + ')';
        const tt = (now % 60000) / 1000, sd = (mi) * 7.31, pe = t * (2 - t) * 0.5 + e * 0.5;
        m.style.opacity = '';
        m.style.clipPath = e >= 0.999 ? 'none' : 'inset(' + ((1 - e) * 100).toFixed(2) + '% 0 0 0)';
        if (meshes[mi]) meshes[mi].visible = false; mi++; return;
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
    this.releaseReveals = () => { return; if (!r) return; meshes.forEach(m => m.material.dispose()); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; mounted = null; meshes = []; };
    this.cleanupReveals = () => { window.removeEventListener('resize', size); this.updateReveals = null; if (r) { r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); } };
  },
  async initFooterFig() {
    const box = this.footerFigRef.current; if (!box || !(this.props.footerFigure ?? false)) return;
    const [T, GL] = await Promise.all([import('https://esm.sh/three@0.186.1'), import('https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js')]);
    const loader = new GL.GLTFLoader();
    try { const MO = await import('https://esm.sh/three@0.186.1/examples/jsm/libs/meshopt_decoder.module.js'); loader.setMeshoptDecoder(MO.MeshoptDecoder); } catch (e) {}
    try { const DL = await import('https://esm.sh/three@0.186.1/examples/jsm/loaders/DRACOLoader.js'); const dl = new DL.DRACOLoader(); dl.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); loader.setDRACOLoader(dl); } catch (e) {}
    const url = (this.props.footerModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/chibi-figure-compressed.glb';
    let g; try { g = await loader.loadAsync(url); } catch (e1) { try { g = await loader.loadAsync(url.replace('https://raw.githubusercontent.com/wuppie/wubble/main/', 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/')); } catch (e2) { console.warn('footer figure failed', e2); return; } }
    if (this.dead) return;
    const r = new T.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(24, 1, 0.1, 50); cam.position.set(0, 0, 4.2);
    sc.add(new T.HemisphereLight(0xffffff, 0xd8d4cc, 1.1)); const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(1.5, 3, 2.5); sc.add(key); const rim = new T.DirectionalLight(0xffffff, 1.0); rim.position.set(-2.5, 1.2, -2); sc.add(rim);
    const m = g.scene; m.traverse((o) => { if (o.isMesh && o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); });
    const bb = new T.Box3().setFromObject(m, true), sz = bb.getSize(new T.Vector3()), k = 1 / Math.max(sz.x, sz.y, sz.z);
    m.scale.setScalar(k); m.position.sub(bb.getCenter(new T.Vector3()).multiplyScalar(k));
    const piv = new T.Group(); piv.add(m); sc.add(piv); piv.scale.setScalar(this.props.footerFigureSize ?? 1.5);
    const mix = g.animations && g.animations.length ? new T.AnimationMixer(m) : null; if (mix) mix.clipAction(g.animations[0]).play();
    const fit = () => { const w = box.clientWidth || 400, h = box.clientHeight || 500; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    fit(); addEventListener('resize', fit);
    const ms = { x: 0, y: 0, over: false }, ray = new T.Raycaster(), nd = new T.Vector2();
    addEventListener('pointermove', (e) => { ms.x = e.clientX / innerWidth * 2 - 1; ms.y = e.clientY / innerHeight * 2 - 1; const b = box.getBoundingClientRect();
      if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) { ms.over = false; return; }
      nd.set((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(nd, cam); ms.over = ray.intersectObject(piv, true).length > 0; }, { passive: true });
    let hvF = 0;
    const ft = box.closest('[data-footer]'); const t0 = performance.now(); let last = t0;
    r.autoClear = false; const art = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType });
    const qS = new T.Scene(), qC = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const qM = new T.ShaderMaterial({ transparent: true, uniforms: { tA: { value: art.texture } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: 'uniform sampler2D tA; varying vec2 vUv; ' + this.ditherGLSL(2.0) + ' void main(){ vec4 c = texture2D(tA, vUv); vec3 rgb = c.rgb / max(c.a, 0.001); rgb = pow(rgb, vec3(1.0 / 2.2)); rgb = rgb * 1.3 / (1.0 + rgb * 0.55) + 0.02; float a = step(dqB8(gl_FragCoord.xy / 2.0) * 0.85 + 0.08, c.a); gl_FragColor = vec4(DQ(rgb), a); }' });
    qS.add(new T.Mesh(new T.PlaneGeometry(2, 2), qM));
    const fit2 = () => { const pr = r.getPixelRatio(); art.setSize(Math.round((box.clientWidth || 400) * pr), Math.round((box.clientHeight || 500) * pr)); }; fit2(); addEventListener('resize', fit2);
    const loop = (now) => { if (this.dead) return; requestAnimationFrame(loop);
      if (ft && getComputedStyle(ft).visibility === 'hidden') { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const tt = (now - t0) / 1000;
      if (mix) mix.update(dt);
      hvF += ((ms.over ? 1 : 0) - hvF) * (1 - Math.exp(-dt * 6));
      piv.rotation.y += ((0.35 + ms.x * 0.45) * (1 - hvF) - piv.rotation.y) * (1 - Math.exp(-dt * 3));
      piv.rotation.x += ((ms.y * 0.12) * (1 - hvF) - piv.rotation.x) * (1 - Math.exp(-dt * 3));
      piv.rotation.z = Math.sin(tt * 9) * 0.09 * hvF;
      piv.position.y = Math.sin(tt * 0.9) * 0.04 + Math.abs(Math.sin(tt * 4.5)) * 0.06 * hvF;
      box.style.cursor = ms.over ? 'pointer' : ''; r.setRenderTarget(art); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam); r.setRenderTarget(null); r.clear(); r.render(qS, qC); };
    requestAnimationFrame(loop);
  },
  async initFooterLetters() {
    const ft = document.querySelector('[data-footer]'), word = ft && ft.querySelector('[data-fl-word]'), host = ft && ft.querySelector('[data-fl-gl]'); if (!word || !host || word.__fl) return; word.__fl = true;
    const tEl = ft.querySelector('[data-ft-time]'); if (tEl) { const up = () => { const d = new Date(); tEl.textContent = d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('en-GB'); }; up(); this._ftT = setInterval(up, 1000); }
    const txt = word.textContent.trim(); word.textContent = '';
    const spans = Array.from(txt).map((ch) => { const sp = document.createElement('span'); sp.textContent = ch; sp.setAttribute('data-fl', ''); sp.style.display = 'inline-block'; word.appendChild(sp); return sp; });
    const AS = document.createElement('span'); AS.setAttribute('data-fl-astro', ''); AS.setAttribute('aria-hidden', 'true');
    AS.style.cssText = 'display:inline-block;position:relative;width:0.5em;height:1.08em;vertical-align:-0.03em;margin:0 -0.02em;pointer-events:none;';
    if (spans.length > 3 && (this.props.footerAstro ?? true) && !(this.props.footerMoon ?? true)) spans[2].after(AS);
    if ((this.props.footerMoon ?? true) && this.initFooterMoon) this.whenNear(0.45, 15000, () => this.initFooterMoon());
    const fit = () => { const base = 200; word.style.fontSize = base + 'px'; word.style.whiteSpace = 'nowrap'; word.style.letterSpacing = '0'; const kids = Array.from(word.children); if (!kids.length) return; kids.forEach((k) => { k.style.translate = ''; k.style.rotate = ''; }); const L = kids[0].getBoundingClientRect().left, Rr = kids[kids.length - 1].getBoundingClientRect().right, w = Rr - L, cs = getComputedStyle(word), avail = word.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); if (w > 0 && avail > 0) word.style.fontSize = (base * avail / w * 0.995).toFixed(2) + 'px'; };
    try { await document.fonts.ready; } catch (e) {}
    fit(); addEventListener('resize', fit); setTimeout(fit, 600);
    this._flEls = Array.from(word.children); this._flEls.forEach((el) => { el.style.willChange = 'transform,opacity'; el.style.transformOrigin = '0% 100%'; });
    if (AS.isConnected && this.footerAstro) this.footerAstro(ft, AS);
    if ((this.props.footerHover || 'None') === 'None') return;
    if ((this.props.footerHover || 'None') === 'Sprite') { this.footerSprites(ft, word, spans); return; }
    const T = await import('https://esm.sh/three@0.186.1'); if (this.dead) return;
    await new Promise((res) => { const w = () => { if (this.dead) return; if (getComputedStyle(ft).visibility !== 'hidden') res(); else setTimeout(w, 250); }; w(); });
    if (this.dead) return;
    const r = new T.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false }); r.setClearColor(0x000000, 0);
    let glOK = true;
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); glOK = false; console.warn('[footer] WebGL context lost, plain letters'); spans.forEach((sp) => { if (window.gsap) window.gsap.killTweensOf(sp); sp.style.opacity = ''; }); });
    r.domElement.addEventListener('webglcontextrestored', () => { glOK = true; build(); });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; host.appendChild(r.domElement);
    const cvs = [0, 1, 2].map(() => document.createElement('canvas')), tex = cvs.map((c) => { const t = new T.CanvasTexture(c); t.minFilter = T.LinearFilter; t.generateMipmaps = false; return t; });
    const N = 8, rects = Array.from({ length: N }, () => new T.Vector4(-1, -1, -1, -1)), amt = new Array(N).fill(0), mat = new Array(N).fill(0);
    const TL = new T.TextureLoader(), rockBase = (this.props.rockTexBase || '').trim() || './textures/Rock063_';
    const rk = (n, srgb) => { const t = TL.load(rockBase + n + '.jpg'); t.wrapS = t.wrapT = T.RepeatWrapping; if (srgb) t.colorSpace = T.SRGBColorSpace; return t; };
    const U = { tRC: { value: rk('Color', false) }, tRN: { value: rk('NormalGL') }, tRR: { value: rk('Roughness') }, tRD: { value: rk('Displacement') }, tM: { value: tex[0] }, tB1: { value: tex[1] }, tB2: { value: tex[2] }, uR: { value: rects }, uA: { value: amt }, uK: { value: mat }, uT: { value: 0 }, uRes: { value: new T.Vector2(1, 1) }, uInk: { value: new T.Color(0x0e0e0d) } };
    const m = new T.ShaderMaterial({ uniforms: U, transparent: true, depthTest: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `precision highp float; uniform sampler2D tM, tB1, tB2, tRC, tRN, tRR, tRD; uniform vec4 uR[8]; uniform float uA[8], uK[8], uT; uniform vec2 uRes; uniform vec3 uInk; varying vec2 vUv;
        float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float ns(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hs(i), hs(i + vec2(1, 0)), f.x), mix(hs(i + vec2(0, 1)), hs(i + vec2(1, 1)), f.x), f.y); }
        float bay(vec2 p){ vec2 q = mod(floor(p), 4.0); float i = q.x + q.y * 4.0; return mod(i * 9.0 + floor(i / 4.0) * 7.0, 16.0) / 16.0; }
        void main(){
          vec4 col = vec4(0.0);
          for (int i = 0; i < 8; i++) {
            float a = uA[i]; if (a < 0.002) continue; vec4 rc = uR[i];
            vec2 c = (rc.xy + rc.zw) * 0.5, hsz = (rc.zw - rc.xy) * 0.5;
            vec2 d = (vUv - c) / hsz; if (abs(d.x) > 1.6 || abs(d.y) > 1.5) continue;
            float k = uK[i];
            vec2 uv = vUv;
            if (vUv.x < rc.x - hsz.x * 0.015 || vUv.x > rc.z + hsz.x * 0.015) continue;
            float b1 = texture2D(tB1, uv).r, b2 = texture2D(tB2, uv).r;
            float inside = smoothstep(0.38, 0.52, b1);
            vec2 sh = vec2(0.004, -0.012) * hsz.y * 4.0; float shd = smoothstep(0.2, 0.6, texture2D(tB2, uv - sh).r) * (1.0 - inside) * 0.22 * a;
            col.rgb = mix(col.rgb, vec3(0.05), shd * (1.0 - col.a)); col.a = max(col.a, shd);
            if (inside < 0.01) continue;
            vec2 e = 1.5 / uRes; float h = pow(b1, 0.7) * 0.55 + b2 * 0.45;
            float hx = (pow(texture2D(tB1, uv + vec2(e.x, 0)).r, 0.7) * 0.55 + texture2D(tB2, uv + vec2(e.x, 0)).r * 0.45) - (pow(texture2D(tB1, uv - vec2(e.x, 0)).r, 0.7) * 0.55 + texture2D(tB2, uv - vec2(e.x, 0)).r * 0.45);
            float hy = (pow(texture2D(tB1, uv + vec2(0, e.y)).r, 0.7) * 0.55 + texture2D(tB2, uv + vec2(0, e.y)).r * 0.45) - (pow(texture2D(tB1, uv - vec2(0, e.y)).r, 0.7) * 0.55 + texture2D(tB2, uv - vec2(0, e.y)).r * 0.45);
            vec3 n = normalize(vec3(-hx * 14.0, -hy * 14.0, 1.0)), V = vec3(0, 0, 1), L = normalize(vec3(-0.45, 0.6, 0.75)), H = normalize(L + V);
            float df = max(dot(n, L), 0.0), fr = pow(1.0 - n.z, 2.0), sp = pow(max(dot(n, H), 0.0), 60.0);
            vec3 c3;
            if (k > 3.5) { vec2 tu = vUv * uRes / uRes.y * 1.6; float dsp = texture2D(tRD, tu).r;
              vec3 tn = texture2D(tRN, tu + (dsp - 0.5) * 0.02).xyz * 2.0 - 1.0; vec3 nn = normalize(vec3(n.xy * 1.3 + tn.xy * 1.1, n.z));
              vec3 alb = pow(texture2D(tRC, tu).rgb, vec3(2.2)); float rgh = texture2D(tRR, tu).r;
              float d2 = max(dot(nn, L), 0.0), s2 = pow(max(dot(nn, H), 0.0), mix(80.0, 8.0, rgh)) * (1.0 - rgh) * 0.6;
              float ao = mix(0.55, 1.0, dsp) * (0.7 + 0.3 * smoothstep(0.0, 0.6, h));
              c3 = alb * (0.22 + 1.05 * d2) * ao + s2 + alb * fr * 0.2; c3 = pow(c3, vec3(1.0 / 2.2)); }
            else if (k < 0.5) { vec3 base = vec3(0.86, 0.45, 0.22); c3 = base * (0.35 + 0.75 * df) + vec3(1.0, 0.85, 0.7) * sp * 0.55 + base * fr * 0.35 + vec3(0.3, 0.08, 0.02) * (1.0 - h) * 0.4; }
            else if (k < 1.5) { vec3 rf = reflect(-V, n); float sky = smoothstep(-0.2, 0.6, rf.y); vec3 env = mix(vec3(0.06), vec3(0.95), sky) + 0.5 * smoothstep(0.9, 1.0, sin(rf.x * 6.0 + rf.y * 3.0 + uT * 0.6)); c3 = env * 0.85 + sp * 1.2 + fr * 0.3; }
            else if (k < 2.5) { float lum = 0.12 + 0.9 * df + sp * 0.8 + fr * 0.25; c3 = step(bay(gl_FragCoord.xy / 2.0) + 0.02, lum) > 0.5 ? vec3(0.925, 0.914, 0.886) : uInk; if (lum < 0.2) c3 = uInk; c3 = mix(uInk, c3, 0.9); }
            else { float hu = fr * 2.5 + h * 1.5 + uT * 0.2; vec3 ir = 0.5 + 0.5 * cos(6.2832 * (hu + vec3(0.0, 0.33, 0.67))); c3 = mix(vec3(0.08), ir, 0.35 + 0.6 * fr) * (0.4 + 0.7 * df) + sp * 1.4; }
            float nz = ns(vUv * uRes / 34.0) * 0.6 + ns(vUv * uRes / 11.0) * 0.4;
            float g = clamp((d.y * 0.5 + 0.5) * 0.6 + nz * 0.4, 0.0, 1.0), th = a * 1.3 - 0.15;
            float rv = smoothstep(g - 0.05, g + 0.05, th), edge = smoothstep(-0.03, 0.0, th - g) * (1.0 - smoothstep(0.0, 0.06, th - g));
            c3 = mix(c3, vec3(0.93, 0.91, 0.87), edge * 0.6);
            float al = inside * max(rv, edge * 0.9);
            col.rgb = mix(col.rgb, c3, al); col.a = max(col.a, al);
          }
          gl_FragColor = col;
        }` });
    const sc = new T.Scene(), cam = new T.Camera(); sc.add(new T.Mesh(new T.PlaneGeometry(2, 2), m));
    const build = () => {
      const fw = ft.clientWidth, fh = ft.clientHeight; if (!fw || !fh) return;
      word.style.fontSize = '22vw'; const target = word.parentElement.clientWidth - parseFloat(getComputedStyle(word.parentElement).paddingLeft) - parseFloat(getComputedStyle(word.parentElement).paddingRight);
      for (let it = 0; it < 3; it++) { const w = word.scrollWidth; if (!w) break; word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * target / w).toFixed(2) + 'px'; }
      const pr = Math.min(1.5, devicePixelRatio || 1), W = Math.min(2048, Math.round(fw * pr)), Hh = Math.round(fh * W / fw), k = W / fw;
      r.setPixelRatio(1); r.setSize(fw, fh, false); r.setSize(W, Hh, false); r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; U.uRes.value.set(W, Hh);
      const fr = ft.getBoundingClientRect(), cs = getComputedStyle(word);
      cvs.forEach((c) => { c.width = W; c.height = Hh; });
      const g0 = cvs[0].getContext('2d'); g0.fillStyle = '#000'; g0.fillRect(0, 0, W, Hh); g0.fillStyle = '#fff'; g0.textBaseline = 'alphabetic';
      g0.font = cs.fontWeight + ' ' + (parseFloat(cs.fontSize) * k).toFixed(1) + 'px ' + cs.fontFamily;
      const rg = document.createRange();
      spans.forEach((sp, i) => { const b = sp.getBoundingClientRect(); rg.selectNodeContents(sp); const ib = rg.getBoundingClientRect();
        const ascent = g0.measureText(sp.textContent).actualBoundingBoxAscent, mH = g0.measureText('H');
        const base = (ib.top - fr.top) * k + (ib.height * k + mH.actualBoundingBoxAscent - mH.actualBoundingBoxDescent) / 2;
        g0.fillText(sp.textContent, (b.left - fr.left) * k, base);
        if (i < N) { const top = base - ascent, bot = base; rects[i].set((b.left - fr.left) * k / W, 1 - bot / Hh, (b.right - fr.left) * k / W, 1 - top / Hh); } });
      const capH = g0.measureText('H').actualBoundingBoxAscent;
      [[1, 0.035], [2, 0.1]].forEach(([j, f2]) => { const g = cvs[j].getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); g.filter = 'blur(' + Math.max(1, capH * f2).toFixed(1) + 'px)'; g.drawImage(cvs[0], 0, 0); g.filter = 'none'; });
      tex.forEach((t) => { t.needsUpdate = true; });
    };
    build(); setTimeout(build, 400); let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); });
    const G = window.gsap, st = spans.map(() => ({ v: 0 })); let lastK = -1;
    const on = (i) => { if (i >= N) return; let kk; do { kk = Math.floor(Math.random() * 4); } while (kk === lastK); lastK = kk; if (st[i].v < 0.05) mat[i] = i === 0 && (this.props.rockOnW ?? true) ? 4 : kk;
      if (!glOK) return; if (G) { G.to(st[i], { v: 1, duration: 1.0, ease: 'power2.inOut', overwrite: true, onUpdate: () => { amt[i] = st[i].v; } }); G.to(spans[i], { opacity: 0, duration: 0.5, delay: 0.35, ease: 'power1.out', overwrite: true }); } else { amt[i] = 1; spans[i].style.opacity = '0'; } };
    const off = (i) => { if (i >= N) return; if (G) { G.to(st[i], { v: 0, duration: 0.85, ease: 'power2.inOut', overwrite: true, onUpdate: () => { amt[i] = st[i].v; } }); G.to(spans[i], { opacity: 1, duration: 0.4, ease: 'power1.out', overwrite: true }); } else { amt[i] = 0; spans[i].style.opacity = ''; } };
    spans.forEach((sp, i) => { sp.addEventListener('pointerenter', (ev) => { if (ev.pointerType !== 'touch') on(i); }); sp.addEventListener('pointerleave', (ev) => { if (ev.pointerType !== 'touch') off(i); });
      sp.addEventListener('click', () => { if (st[i].v > 0.5) off(i); else { on(i); setTimeout(() => off(i), 2200); } }); });
    const t0 = performance.now();
    const loop = (now) => { if (this.dead) return; requestAnimationFrame(loop); if (getComputedStyle(ft).visibility === 'hidden') return; U.uT.value = (now - t0) / 1000; r.render(sc, cam); };
    requestAnimationFrame(loop);
  },
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
  },
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
      const grp = A.parentElement === B.parentElement && A.parentElement.hasAttribute('data-swap-group');
      let da, db; if (grp) { const gap = parseFloat(getComputedStyle(A.parentElement).columnGap) || 10; da = B.offsetWidth + gap; db = A.offsetWidth + gap; } else { const W = A.parentElement.clientWidth - 64; da = W - A.offsetWidth; db = W - B.offsetWidth; }
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
  },
  initLoader() {
    this.prepEntrance();
    const el = this.loaderRef.current; if (!el) return;
    const cnt = el.querySelector('[data-ld-count]'), bar = el.querySelector('[data-ld-bar]'), word = el.querySelector('[data-ld-word]');
    const seen = false; /* the full preloader on every normal visit: it hides the heavy 3D start-up (skipping it on repeat visits showed a glitchy flash, then a laggy page) */
    /* the full preloader only on the first visit of the session; afterwards the page boots straight in (hidden under the ink when arriving from another page) */
    if (seen || window.__wbInkArrive) { window.WB_LOADER_FAST = 1; el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    const t0 = performance.now(), MIN = (seen || window.__wbInkArrive) ? 0 : 2600, MAX = 30000; /* arriving under the ink: no need to show off the loader */
    let shown = 0, ready = false, outT = 0;
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    fonts.then(() => { this._fontsOK = true; }); setTimeout(() => { this._fontsOK = true; }, 2500);
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    const toTop = () => { scrollTo(0, 0); window.__sliderLenis && window.__sliderLenis.scrollTo(0, { immediate: true, force: true }); };
    toTop(); this._toTop = toTop; document.documentElement.classList.add('wb-ready');
    this.lockScroll(true);
    this._ldAstroOK = false; // r14.11: the loader waits for the astronaut (model + textures on screen)
    setTimeout(() => { if (this.dead || el.style.display === 'none') return; console.warn('[loader] safety release'); this._ldForce = true; /* finish with the normal count-to-100 + wipe, never a hard cut */ }, 36000);
    const ease = (t) => 1 - Math.pow(1 - t, 4), io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = () => {
      if (this.dead) return;
      const now = performance.now(), el2 = now - t0;
      if (window.__wbAstroReady) this._ldAstroOK = true;
      // real progress: model download 0→80%, textures + first frame 80→99%, 100 only once the astronaut is on screen
      const gp = (window.__glbProg && window.__wbAstroUrl && window.__glbProg[window.__wbAstroUrl]) || 0, creep = Math.min(0.08, el2 / 12000);
      const warm = this._ldAstroOK && this._fontsOK && (window.__wbWorkReady || !document.querySelector('[data-wb-work-scrub]') || el2 > 9000); if (warm && !this._ldWarmT) this._ldWarmT = now; /* wait for the work helix too, then let the GPU settle 0.6 s: the reveal starts on a quiet main thread instead of mid shader-compile */
      const target = this._ldForce || (warm && now - this._ldWarmT > 600 && el2 > MIN) || (window.WB_LOADER_FAST && this._fontsOK && (this._ldAstroOK || el2 > 2500)) || el2 > MAX ? 1 : /* WB_LOADER_FAST: a page that opens under the ink (About) skips the loader */ Math.min(this._ldAstroOK ? 0.99 : 0.97, Math.max(creep, gp * 0.8 + (gp >= 1 ? 0.12 : 0) + (this._ldAstroOK ? 0.07 : 0)));
      shown += (target - shown) * (target >= 1 ? 0.12 : 0.06); if (target >= 1 && shown > 0.995) shown = 1; if (target < 1) shown = Math.min(shown, 0.99);
      cnt.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      bar.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
      if (this._ldU) this._ldU.value = shown;
      if (window.WB_LOADER_FAST && target >= 1) shown = 1;
      if (shown >= 1 && !ready) { ready = true; outT = now + (window.WB_LOADER_FAST ? 0 : 250); document.documentElement.classList.add('wb-reveal'); }
      if (ready && now > outT) {
        const k = Math.min(1, (now - outT) / 1100), e = io(k);
        el.style.clipPath = 'inset(0 0 ' + (e * 100).toFixed(2) + '% 0)';
        if (this._ldCv) this._ldCv.style.opacity = String(1 - e);
        cnt.style.transform = 'translate3d(0,' + (-e * 40) + '%,0)';
        if (k > 0.45 && !this._entered) { this._entered = true; this.runEntrance(); }
        if (k >= 1) { el.style.display = 'none'; this._toTop && this._toTop(); this.lockScroll(false); document.documentElement.classList.add('wb-done'); if (this._ldStop) this._ldStop(); return; }
      }
      requestAnimationFrame(step);
    };
    step();
  },
  runEntrance() {
    try { this.fitHeroTitle && this.fitHeroTitle(); } catch (e) {} /* r14.26: settle the title size BEFORE anything moves */
    setTimeout(() => { this.gsapReady = true; }, 1200);
    const T = this.entranceTargets(), t0 = performance.now();
    const ex = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const items = [];
    T.lines.forEach((el, i) => items.push({ el, d: 80 + i * 110, dur: 1500, kind: 'line' }));
    if (T.model) items.push({ el: T.model, d: 0, dur: 2200, kind: 'model' });
    T.hdr.forEach((el, i) => items.push({ el, d: 520 + i * 90, dur: 1200, kind: 'ui' }));
    T.ftr.forEach((el, i) => items.push({ el, d: 760 + i * 90, dur: 1200, kind: 'ui' }));
    // r14.22: hero services reveal with the entrance (no longer waits for the hero 3D loop / a mouse move)
    document.querySelectorAll('[data-svc] [data-cw]').forEach((el, i) => items.push({ el, d: 700 + i * 70, dur: 900, kind: 'cw' }));
    const step = () => {
      if (this.dead) return;
      const now = performance.now(); let busy = false;
      items.forEach(it => {
        const t = Math.max(0, Math.min(1, (now - t0 - it.d) / it.dur)), e = ex(t);
        if (t < 1) busy = true;
        if (it.kind === 'line') { it.el.style.clipPath = t >= 1 ? '' : 'inset(0 0 ' + ((1 - e) * 100).toFixed(2) + '% 0)'; it.el.style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 0.6).toFixed(3) + 'em,0)'; }
        else if (it.kind === 'model') { it.el.style.opacity = String(Math.min(1, t * 1.6)); it.el.style.transform = t >= 1 ? '' : 'scale(' + (1 + (1 - e) * 0.12).toFixed(4) + ')'; }
        else if (it.kind === 'cw') { it.el.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((1 - e) * 110).toFixed(2) + '%,0) rotate(' + ((1 - e) * 4).toFixed(2) + 'deg)'; it.el.style.opacity = t >= 1 ? '' : (0.15 + 0.85 * e).toFixed(3); }
        else { it.el.style.opacity = String(e); it.el.style.transform = t >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 14).toFixed(2) + 'px,0)'; }
        if (t >= 1) it.el.style.willChange = '';
      });
      if (busy) requestAnimationFrame(step);
    };
    step();
  },
  initGrain() {
    const P = this.props; let el = document.getElementById('site-grain');
    if (!(P.grainBg ?? true)) { if (el) el.style.display = 'none'; return; }
    if (!el) {
      const N = 160, c = document.createElement('canvas'); c.width = N; c.height = N; const g = c.getContext('2d'), d = g.createImageData(N, N);
      for (let i = 0; i < N * N; i++) { const v = Math.random() * 255 | 0; d.data[i * 4] = v; d.data[i * 4 + 1] = v; d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
      g.putImageData(d, 0, 0);
      el = document.createElement('div'); el.id = 'site-grain'; el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:-50%;top:-50%;width:200%;height:200%;z-index:58;pointer-events:none;mix-blend-mode:screen;background-repeat:repeat;background-size:' + (P.grainSize ?? 160) + 'px;will-change:transform;';
      el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
      document.body.appendChild(el);
      const steps = []; for (let i = 0; i < 10; i++) steps.push({ transform: 'translate3d(' + ((Math.random() * 20 - 10) | 0) + '%,' + ((Math.random() * 20 - 10) | 0) + '%,0)' });
      this._grainAnim = el.animate(steps, { duration: 1000, iterations: Infinity, easing: 'steps(10)' });
    }
    el.style.display = ''; el.style.opacity = String(P.grainAmount ?? 0.07);
  },
  initFooter() {
    const sp = document.querySelector('[data-footer-spacer]'), ft = document.querySelector('[data-footer]'); if (!sp || !ft) return;
    const dim = ft.querySelector('[data-footer-dim]'), inner = ft.querySelector('[data-footer-inner]'); let lastH = 0;
    /* the footer background (colour + waves) is its own layer underneath, so the homepage astronaut (z 60) walks between it and the footer content (z 61) */
    let back = document.querySelector('[data-footer-back]');
    if (!back) { back = document.createElement('div'); back.setAttribute('data-footer-back', ''); back.setAttribute('aria-hidden', 'true');
      back.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:100vh;height:100lvh;z-index:54;pointer-events:none;visibility:hidden;overflow:hidden;background:' + (ft.style.background || 'var(--bg-footer,#ece9e2)') + ';';
      const wv = ft.querySelector('[data-wb-waves]'); if (wv) back.appendChild(wv); ft.parentNode.insertBefore(back, ft);
      ft.style.background = 'transparent'; ft.style.zIndex = '61'; }
    const tick = () => {
      if (this.dead) return; this.ftRaf = requestAnimationFrame(tick);
      /* phones: the address bar changes innerHeight while scrolling; use the tallest height seen at this width so the reveal doesn't jump */
      if (innerWidth !== this._ftW) { this._ftW = innerWidth; this._ftVH = innerHeight; } else if (innerHeight > this._ftVH) this._ftVH = innerHeight;
      if (this._ftCoarse == null) this._ftCoarse = matchMedia('(pointer: coarse)').matches;
      const vh = this._ftCoarse ? (window.__wbFtVH = this._ftVH) : innerHeight, H = ft.offsetHeight;
      /* phones: the fixed + clipped reveal is redrawn every frame and lags the native scroll (bumpy). There the footer is simply part of the page,
         with its background layer as a normal block behind it (the astronaut still walks between them): it scrolls natively, nothing to sync. */
      if (this._ftCoarse) {
        if (!this._ftFlow) { this._ftFlow = 1; sp.style.height = '0px'; Object.assign(ft.style, { position: 'relative', transform: '', clipPath: '', visibility: 'visible', top: 'auto', bottom: 'auto' });
          Object.assign(back.style, { position: 'absolute', bottom: 'auto', transform: '', clipPath: '', visibility: 'visible' }); }
        const bt = ft.offsetTop + 'px'; if (back.style.top !== bt) back.style.top = bt; if (back.style.height !== H + 'px') back.style.height = H + 'px';
        if (dim) dim.style.opacity = '0'; if (inner && inner.style.transform) inner.style.transform = '';
        const p = Math.max(0, Math.min(1, (vh - ft.getBoundingClientRect().top) / Math.max(1, Math.min(H, vh)))); this._ftLetters(p); return; }
      if (H && H !== lastH) { lastH = H; sp.style.height = H + 'px'; }
      const r = sp.getBoundingClientRect();
      if (r.top >= vh || this.state.page) { if (ft.style.visibility !== 'hidden') ft.style.visibility = 'hidden'; back.style.visibility = 'hidden'; return; }
      ft.style.visibility = 'visible'; back.style.visibility = 'visible';
      const p = Math.max(0, Math.min(1, (vh - r.top) / Math.max(1, H))), e = 1 - Math.pow(1 - p, 3);
      // tall footer: top pinned at 0 while revealing, then it scrolls with the spacer (bottom lines up at max scroll)
      const topW = H > vh ? (r.top > 0 ? 0 : r.top) : vh - H;
      const base = topW - (vh - H);
      if (window.__wbAscend) { const dy = -(1 - e) * vh; ft.style.transform = Math.abs(dy) > 0.05 ? 'translate3d(0,' + dy.toFixed(1) + 'px,0)' : ''; ft.style.clipPath = ''; }
      else ft.style.transform = Math.abs(base) > 0.05 ? 'translate3d(0,' + base.toFixed(1) + 'px,0)' : '';
      const ct = Math.max(0, r.top - topW), W = ft.offsetWidth || innerWidth, cv = (this.props.footerCurve ?? 0.14) * vh * Math.min(1, (1 - e) * 1.4);
      // bleed: the footer seeps up into Reach out with an organic, ink-like edge (fingers reach ahead), flattening as it settles
      if (false && cv > 1) { const t = performance.now() / 1000, N = 140, pts = [], DR = this._drips || (this._drips = Array.from({ length: 14 }, (_, k) => ({ x: (k + 0.5) / 14 + (Math.sin(k * 12.9898) * 0.5) * 0.05, w: 0.006 + ((k * 7) % 5) * 0.003, h: 0.35 + ((k * 13) % 7) / 10, s: 0.4 + ((k * 5) % 4) * 0.2 })));
        for (let i = 0; i <= N; i++) { const x = i / N; let d = 0; for (const q of DR) { const dx = (x - q.x) / q.w; d = Math.max(d, q.h * (0.85 + 0.15 * Math.sin(t * q.s + q.x * 20)) * Math.exp(-dx * dx)); }
          const wob = 0.06 * Math.sin(x * 14 + t * 0.6) + 0.04 * Math.sin(x * 31 - t * 0.9);
          pts.push((x * 100).toFixed(2) + '% ' + Math.max(0, ct + cv * (1 - d + wob)).toFixed(1) + 'px'); }
        ft.style.clipPath = 'polygon(0% 100%,' + pts.join(',') + ',100% 100%)'; }
      else if (!window.__wbAscend) ft.style.clipPath = 'inset(' + ct.toFixed(1) + 'px 0 0 0)';
      this._ftLetters(p);
      if (dim) dim.style.opacity = '0';
      if (back.style.transform !== ft.style.transform) back.style.transform = ft.style.transform; if (back.style.clipPath !== ft.style.clipPath) back.style.clipPath = ft.style.clipPath; if (back.style.height !== H + 'px') back.style.height = H + 'px';
      if (inner && inner.style.transform) inner.style.transform = '';
    };
    this._ftLetters = (p) => { const FL = this._flEls; if (FL) { const n = FL.length; for (let i = 0; i < n; i++) { const a = Math.max(0, Math.min(1, (p - 0.35 - i * 0.045) / 0.4)), q = 1 - Math.pow(1 - a, 3), st = FL[i].style, tf = q > 0.999 ? '' : 'translate3d(0,' + ((1 - q) * 115).toFixed(2) + '%,0) rotate(' + ((1 - q) * 10).toFixed(2) + 'deg) skewY(' + ((1 - q) * 7).toFixed(2) + 'deg)'; if (st.transform !== tf) st.transform = tf; st.opacity = q > 0.999 ? '' : q.toFixed(3); } } };
    tick();
  },
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
          if (data) { const lo = [2, 5, 10, 20, 40][i], hi = [5, 10, 20, 40, 80][i]; let sum = 0; for (let j = lo; j < hi; j++) sum += data[j]; tgt = 0.15 + (sum / (hi - lo) / 255) * 0.95; if (sum < 2) data = null; }
          if (!data) tgt = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * (3 + i * 1.3) + i)) * (0.6 + 0.4 * Math.sin(t * 1.7 + i * 2.1));
        }
        lv[i] += (Math.min(1, tgt) - lv[i]) * 0.18;
        b.style.transform = 'scaleY(' + lv[i].toFixed(3) + ')';
      });
    };
    loop();
  },
  fitHeroTitle() {
    // scale the top title so its letters span the full viewport width (capped by height)
    const h1 = this.headlineRef && this.headlineRef.current; if (!h1 || !h1.children.length) return;
    /* r14.26: measure LAYOUT boxes (offset*), never transformed rects — the entrance animates the letters/lines with
       translate, so getBoundingClientRect mid-animation changed the font size and moved the services row (the jumping).
       Also skip refits when nothing relevant changed (mobile fires resize for the address bar during the entrance). */
    const fk = innerWidth + '|' + (document.fonts ? document.fonts.status : '') + '|' + h1.children.length;
    if (this._fitK === fk) return; this._fitK = fk;
    const hcs = getComputedStyle(h1), W = h1.clientWidth - (parseFloat(hcs.paddingLeft) || 0) - (parseFloat(hcs.paddingRight) || 0) - 4, kids = Array.from(h1.children);
    const fs0 = parseFloat(hcs.fontSize) || 100;
    const w = kids[kids.length - 1].getBoundingClientRect().right - kids[0].getBoundingClientRect().left;
    if (w > 0) { const fs = Math.min(fs0 * W / w, (window.__svh || innerHeight) * 0.62); if (Math.abs(fs - fs0) > 0.5) h1.style.fontSize = fs.toFixed(1) + 'px'; }
    // services row sits just below the title's letters
    const par = h1.parentElement, ul = par && par.querySelector('ul[data-cg]'), wrap = ul && ul.parentElement;
    if (wrap && wrap !== par) {
      const pr = par.getBoundingClientRect(), b = h1.getBoundingClientRect().bottom, top = Math.round(b - pr.top + Math.max(10, (window.__svh || innerHeight) * 0.02));
      if (wrap.style.bottom !== 'auto') wrap.style.bottom = 'auto';
      if (Math.abs((parseFloat(wrap.style.top) || -1e4) - top) > 1) wrap.style.top = top + 'px';
    }
  }
});
(window.WBL = window.WBL || {}).ui = 1;

;
/* modules22/wb-ftmoon.js */
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
    const prog = () => { const t = sp.getBoundingClientRect().top; return Math.max(0, Math.min(1, 1 - t / (window.__wbFtVH || innerHeight))); }; /* stable height on phones (set by wb-ui) */
    let S = null, booting = false;
    const boot = async () => {
      booting = true;
      const B = 'https://esm.sh/three@0.186.1', E = B + '/examples/jsm/';
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
      const LD = new GL.GLTFLoader(); try { const MO = await import('https://esm.sh/three@0.186.1/examples/jsm/libs/meshopt_decoder.module.js'); LD.setMeshoptDecoder(MO.MeshoptDecoder); } catch (e) {}
      const [mg, ag] = await Promise.all([LD.loadAsync((window.WB_ASSETS || './') + 'models/moon-2k.glb'), LD.loadAsync((window.WB_ASSETS || './') + 'models/astronaut-rig-v2.glb')]);
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
      /* test switch: window.WB_MOON_GLASS = { ...wb-glass options } makes the moon the same see-through glass as the astronaut (remove it to revert) */
      const MG = window.WB_MOON_GLASS && window.WBGlass ? WBGlass(T, sc, r, (k, d) => window.WB_MOON_GLASS[k] ?? (k === 'exposure' ? r.toneMappingExposure : d)) : null;
      const moonR = mg.scene; moonR.traverse((o) => { if (o.isMesh) { o.material = MG || moonM; o.frustumCulled = false; } }); moonR.updateMatrixWorld(true);
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
      if (!S) { if (!booting && (sp.getBoundingClientRect().top < innerHeight * 2.5 /* load the moon + astronaut (~3.9 MB) only when the footer is near */)) boot().catch((e) => { console.warn('footer moon failed', e); }); return; }
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
      S.moon.visible = ft.getAttribute('data-moon') !== '0'; // data-moon="0": no moon (the astronaut still lands and walks at its crown height)
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
      /* data-moon="0": no moon to walk around, so he walks in a straight line at the crown height (right, then back in from the left) */
      const NOM = ft.getAttribute('data-moon') === '0'; if (NOM) { S.phi = 0; if (!S.landed) S.wx = 0; else if (walking) { S.wx = (S.wx || 0) + dt * S.wkW * (P.footerWalkSpeed ?? 0.12) * ah * 2; if (S.wx > asp + 0.35) S.wx = -(asp + 0.35); } }
      const phi = S.phi || 0, wx = NOM ? (S.wx || 0) : Math.sin(phi) * rr, wy = mY + Math.cos(phi) * rr;
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

;
/* modules22/wb-ascii-title.js */
/* Wubble V22: ASCII title — the About title is re-drawn as animated ASCII characters
   (idea: three.js "ASCII effect" + a waving text plane). Canvas 2D only, no extra WebGL context.
   Each frame it reads the live position of every word span, so the existing letter-reveal in/out
   animation still drives it. Webflow: edit the h2 text as usual; add data-wb-ascii to any heading to use it. */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  initAsciiTitle() {
    const hosts = [...document.querySelectorAll('[data-about-title] h2, [data-fl-word], [data-wb-ascii]')]; if (!hosts.length) return;
    for (const h of hosts) if (!h.__ascii && !h.closest('[data-no-ascii]')) { h.__ascii = 1; this.asciiOn(h); } /* data-no-ascii: keep this heading plain */
  },
  asciiOn(h) {
    const CHARS = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    const isAbout = !!h.closest('[data-about-title]'), isFoot = h.hasAttribute('data-fl-word'), layer = h.closest('[data-about-title]') || h.parentElement;
    const ink = getComputedStyle(h).color, hz = getComputedStyle(h).zIndex;
    const pre = document.createElement('pre'); pre.setAttribute('aria-hidden', 'true');
    pre.style.cssText = 'position:absolute;left:0;top:0;margin:0;padding:0;pointer-events:none;white-space:pre;font-family:ui-monospace,Menlo,monospace;font-weight:500;color:' + (isFoot ? 'inherit' : '#fff') + ';' + (hz !== 'auto' ? 'z-index:' + hz + ';' : '');
    if (isAbout) layer.appendChild(pre); else h.insertAdjacentElement('afterend', pre);
    const src = document.createElement('canvas'), sg = src.getContext('2d', { willReadFrequently: true });
    let fs = 10, cw = 6, cols = 1, rows = 1, mx = 0, my = 0, tx = 0, ty = 0, last = '', lastT = 0;
    const measure = () => { const P = this.props; fs = Math.max(6, Math.round((P.asciiCell ?? 9) * Math.min(1.3, Math.max(0.7, innerWidth / 1440))));
      sg.font = '500 ' + fs + 'px ui-monospace, monospace'; cw = sg.measureText('M').width || fs * 0.6;
      cols = Math.ceil(innerWidth / cw); rows = Math.ceil(innerHeight / fs); src.width = cols; src.height = rows;
      pre.style.fontSize = fs + 'px'; pre.style.lineHeight = fs + 'px'; pre.style.letterSpacing = '0px'; };
    measure(); addEventListener('resize', measure);
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    const words = () => { const g = [...h.querySelectorAll('[data-gw]')]; if (g.length) return g; const leaf = [...h.querySelectorAll('span')].filter((s) => !s.querySelector('span') && s.textContent.trim()); return leaf.length ? leaf : [h]; };
    const tick = (now) => { requestAnimationFrame(tick); if (now - lastT < 32) return; lastT = now; /* 30 fps is plenty for the flicker and halves the cost */
      const P = this.props, on = ((isFoot ? P.footerTitleFx : P.aboutTitleFx) || 'ASCII') === 'ASCII'; if (isFoot) pre.style.color = (getComputedStyle(h).getPropertyValue('--ink-footer') || '').trim() || ink;
      h.style.color = on ? 'transparent' : ''; pre.style.display = on ? '' : 'none'; if (!on) return;
      const lo = +getComputedStyle(layer).opacity, ab = document.querySelector('[data-about]'), ft = isFoot ? h.closest('footer') || layer : null; let vis = lo > 0.01 && getComputedStyle(h).visibility !== 'hidden'; if (ft) vis = vis && +getComputedStyle(ft).opacity > 0.01; if (ab && isAbout) vis = vis && +getComputedStyle(ab).opacity > 0.01;
      const W = words(), hr = h.getBoundingClientRect(); if (!vis || !W.length || hr.bottom < 0 || hr.top > innerHeight) { if (last) { pre.textContent = ''; last = ''; } return; }
      // 1. draw each word at its live (animated) position into a low-res buffer, clipped by its mask
      sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, cols, rows); sg.fillStyle = '#fff'; sg.textBaseline = 'alphabetic';
      for (const w of W) { const r = w.getBoundingClientRect(), mk = (w === h ? h : w.parentElement).getBoundingClientRect(), cs = getComputedStyle(w); if (!r.width) continue;
        const f = parseFloat(cs.fontSize) / fs; sg.save(); sg.beginPath(); sg.rect(mk.left / cw, mk.top / fs, mk.width / cw, mk.height / fs); sg.clip();
        sg.globalAlpha = +cs.opacity; sg.font = cs.fontWeight + ' ' + (parseFloat(cs.fontSize) / fs) + 'px ' + cs.fontFamily;
        const tf = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform); sg.translate(r.left / cw, (r.top + r.height * 0.82) / fs); sg.scale(fs / cw, 1);
        sg.transform(tf.a, tf.b, tf.c, tf.d, 0, 0); sg.fillText((cs.textTransform === 'uppercase' ? w.textContent.toUpperCase() : w.textContent), 0, 0); sg.restore(); void f; }
      // 2. wave + mouse tilt displacement, then luminance → characters
      const t = performance.now() / 1000 * (P.asciiSpeed ?? 1), A = P.asciiWave ?? 1, D = sg.getImageData(0, 0, cols, rows).data;
      const EZ = P.asciiEase ?? 0.06, TL = P.asciiTilt ?? 1; tx += (mx * TL - tx) * EZ; ty += (my * TL - ty) * EZ; if (P.asciiOpacity != null) pre.style.opacity = P.asciiOpacity; const cx = (hr.left + hr.width / 2) / cw, cy = (hr.top + hr.height / 2) / fs;
      let out = ''; const n = CHARS.length - 1;
      const y0 = Math.max(0, Math.floor(hr.top / fs) - 4), y1 = Math.min(rows, Math.ceil(hr.bottom / fs) + 4), x0 = Math.max(0, Math.floor(hr.left / cw) - 8), x1 = Math.min(cols, Math.ceil(hr.right / cw) + 8); /* only around the title */
      for (let y = 0; y < rows; y++) { if (y < y0 || y >= y1) { out += '\n'; continue; } out += ' '.repeat(x0); for (let x = x0; x < x1; x++) {
          const dx = x - cx, dy = y - cy, persp = 1 + (dx * tx * 0.012 + dy * ty * 0.03);
          const sx = Math.round(cx + dx * persp + Math.sin(t * 1.6 + y * 0.35) * 1.6 * A), sy = Math.round(cy + dy * persp + Math.cos(t * 1.3 + x * 0.06) * 0.7 * A);
          let v = 0; if (sx >= 0 && sy >= 0 && sx < cols && sy < rows) { const i = (sy * cols + sx) * 4; v = D[i + 3] / 255 * (0.75 + 0.25 * Math.sin(t * (P.asciiFlicker ?? 3) + x * 0.2 + y * 0.5)); }
          out += v < 0.04 ? ' ' : CHARS[Math.min(n, Math.round(v * n))]; } out += '\n'; }
      { const op = pre.offsetParent, lr = op ? op.getBoundingClientRect() : { left: 0, top: 0 }; pre.style.transform = 'translate(' + (-lr.left).toFixed(1) + 'px,' + (-lr.top).toFixed(1) + 'px)'; }
      if (out !== last) { pre.textContent = out; last = out; } };
    tick();
  }
});

;
/* modules22/wb-sitefooter.js */
/* Wubble site footer: the homepage footer on any page. Load before wb-contactmoon.js (with wb-ui.js, wb-ftmoon.js,
   wb-ascii-title.js, wb-glass.js, wb-glasstext.js, wb-waves.js).
   Webflow: the homepage footer markup with data-reveal="scroll" on [data-footer], and an empty
   [data-footer-spacer] (100vh tall) at the end of the page; scrolling into it reveals the footer.
   Adds the homepage's footer styles: content rises in staggered as the footer opens, html.wb-ft-on while it is open. */
(() => {
  window.WB_FOOTER_PROPS = Object.assign({ footerTitleScale: 1, footerTitleFx: 'None', footerMoonSpin: 0, footerOwnAstro: false } /* the walking astronaut is a homepage-only moment */, window.WB_FOOTER_PROPS || {});
  const st = document.createElement('style');
  st.textContent = '[data-ft-top] > *, [data-ft-bottom] > * { opacity:0; transform:translateY(28px); transition:opacity .9s cubic-bezier(.2,.7,0,1), transform 1.1s cubic-bezier(.2,.7,0,1); }'
    + ' html.wb-ft-on [data-ft-top] > *, html.wb-ft-on [data-ft-bottom] > * { opacity:1; transform:none; }'
    + ' html.wb-ft-on [data-ft-top] > :nth-child(2) { transition-delay:.12s; }'
    + [1, 2, 3, 4, 5].map((n) => ` html.wb-ft-on [data-ft-bottom] > :nth-child(${n}) { transition-delay:${(0.12 + n * 0.06).toFixed(2)}s; }`).join('');
  document.head.append(st);
  (function t() { requestAnimationFrame(t); document.documentElement.classList.toggle('wb-ft-on', (window.__wbFootP || 0) > 0.5); })();
  /* the header no longer blends, so the dot is plain: green while awake (09:00-18:00 Lombok time, same rule as the homepage), grey otherwise */
  const upd = () => { const hd = document.querySelector('[data-wb-site-header]'), dot = hd && (hd.querySelector('[data-wb-status-dot]') || [...hd.querySelectorAll('span')].find((s) => s.style.borderRadius === '50%')); if (!dot) return;
    const h = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', hourCycle: 'h23' }).format(new Date()), on = h >= 9 && h < 18;
    const bg = on ? '#2fd27a' : '#7a7a80', sh = on ? '0 0 6px 1px rgba(47,210,122,0.75)' : 'none'; if (dot.style.background !== bg) { dot.style.background = bg; dot.style.boxShadow = sh; } };
  upd(); setInterval(upd, 30000);
})();

;
/* modules22/wb-contactmoon.js */
/* Wubble contact page = the homepage footer, running the homepage's OWN footer code (wb-ui initFooterLetters,
   wb-ftmoon initFooterMoon, wb-ascii-title) with the homepage's footer settings — nothing re-implemented.
   The homepage drove the footer by scrolling (a spacer scrolling into view); here a hidden spacer is animated
   from "below the fold" to "fully in" right after the ink opens, so the moon + astronaut play exactly the same.
   Webflow: same footer markup as the homepage ([data-footer] with [data-ft-time], [data-fl-word], [data-ft-bottom],
   [data-fl-gl]) + scripts wb-ui.js, wb-astro.js, wb-ftmoon.js, wb-ascii-title.js, then this one.
   Settings: window.WB_FOOTER_PROPS = { footerMoonSize: 2.4, … } (same names as the homepage Tweaks). Duration: data-duration on [data-footer] (s). */
(() => {
  const RAF = (f) => (window.__wbRawRAF || requestAnimationFrame)(f);
  const PROPS = { footerScene: '3D Moon', footerMoon: true, footerMoonSize: 2.4, footerMoonTop: 0, footerAstroH: 0.5, footerMoonCover: 0.45, footerMoonBright: 0.12, footerBend: 0, footerAstroSink: 0.03,
    footerOwnAstro: true, footerMoonLight: 'Sun', footerSunAngle: -18, footerSunHeight: 10, footerSunStrength: 4.2, footerMoonBump: 7, footerWalk: true, footerWalkSpeed: 0.12, footerWalkDelay: 3, footerWalkAnim: 0.8,
    footerMoonSpin: 0.012, footerMoonDetail: 0, footerMoonTile: 6, footerMoonExposure: 0.9, footerMoonDither: false, footerMoonMetal: 0.85, footerMoonRough: 0.42, footerMoonEnv: 0.9, footerMoonTone: 0.28,
    footerTitleFx: 'ASCII', asciiOpacity: 0.5, asciiSpeed: 0.3, asciiWave: 0.6, asciiFlicker: 1.2, asciiEase: 0.025, asciiTilt: 0.5, footerTitleScale: 1.6, footerHover: 'None', footerAstro: false, astroLook: 'Textured', ditherStyle: false, asciiCell: 9 };
  const clip = (n) => window.WB_CLIPS && window.WB_CLIPS[n] ? Promise.resolve() : new Promise((res) => { const s = document.createElement('script'); s.src = (window.WB_ASSETS || './') + 'modules22/wb-clip-' + n + '.min.js'; s.onload = s.onerror = () => res(); document.head.appendChild(s); });
  const start = async () => {
    const ft = document.querySelector('[data-footer]'); if (!ft || ft.__wbContact) return; const W = window.WBM;
    if (!W || !W.initFooterLetters || !W.initFooterMoon) return; ft.__wbContact = 1;
    await Promise.all([clip('look'), clip('walk')]);
    /* scroll stand-in: the homepage footer reveal = this spacer's top going from innerHeight → 0 */
    let sp = document.querySelector('[data-footer-spacer]');
    if (!sp) { sp = document.createElement('div'); sp.setAttribute('data-footer-spacer', ''); sp.setAttribute('aria-hidden', 'true'); sp.style.cssText = 'position:fixed;left:0;width:1px;height:1px;top:100vh;pointer-events:none;visibility:hidden;'; document.body.appendChild(sp); }
    const C = Object.assign({}, W, { props: Object.assign({}, PROPS, window.WB_FOOTER_PROPS || {}), dead: false, whenNear: (a, b, fn) => fn() });
    C.initFooterLetters(); if (C.initAsciiTitle) C.initAsciiTitle();
    /* bigger title without cutting letters off: the word keeps its full-width fit, the letters are stretched taller
       (scaleY from the baseline) and the word grows upward to make room, so nothing is clipped */
    { const w = ft.querySelector('[data-fl-word]'), S = +(ft.getAttribute('data-title-scale') || C.props.footerTitleScale || 1);
      const big = () => { if (S === 1) return; const fs = parseFloat(w.style.fontSize) || parseFloat(getComputedStyle(w).fontSize), lh = fs * 0.82, maxS = Math.max(1, (innerHeight * 0.8) / lh), s = Math.min(S, maxS);
        w.style.paddingTop = ((s - 1) * lh).toFixed(1) + 'px';
        w.querySelectorAll('[data-fl]').forEach((sp) => { sp.style.transformOrigin = '0% 100%'; sp.style.transform = 'scaleY(' + s.toFixed(3) + ')'; }); };
      new MutationObserver(big).observe(w, { attributes: true, attributeFilter: ['style'] }); addEventListener('resize', big); big(); setTimeout(big, 700); }
    /* data-reveal="scroll" on [data-footer]: a normal page; the footer reveals when its in-flow [data-footer-spacer] scrolls in (like the homepage) */
    if (ft.getAttribute('data-reveal') === 'scroll') { C.state = { page: false }; if (C.initFooter) C.initFooter(); return; } // the homepage's own reveal loop
    const dur = (parseFloat(ft.getAttribute('data-duration')) || 2.8) * 1000; let t0 = null;
    const io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const tick = (now) => { if (!ft.isConnected) return; RAF(tick);
      if (t0 == null) { if (window.__wbInkBusy && (window.__wbInkCov || 0) > 0.6) return; t0 = now + 150; }
      const p = io(Math.max(0, Math.min(1, (now - t0) / dur))); sp.style.top = ((1 - p) * innerHeight).toFixed(1) + 'px'; };
    RAF(tick);
  };
  let n = 0; const poll = () => { start().catch((e) => console.warn('[contact]', e)); if (++n < 60 && !(document.querySelector('[data-footer]') || {}).__wbContact) setTimeout(poll, 200); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poll); else poll();
  document.addEventListener('wb:swap', () => { n = 0; poll(); });
})();
