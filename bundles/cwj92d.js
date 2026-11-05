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
/* modules22/wb-distort.js */
/* Wubble: WebGL hover distortion for project media (same liquid ripple + RGB split as the homepage ribbon cards).
   Webflow keeps full control: media stay normal <img>/<video> elements styled in the Designer; this only adds one shared
   WebGL canvas that sits over the hovered element while the pointer is on it.
   Attributes (on the media wrapper):
     data-wb-distort                     enable (wrapper = what you hover; its radius/size are read from Webflow styles)
     data-wb-distort-strength="1"        overall amount (0–2)      data-wb-distort-ripple="1"   ripple waves (0–2)
     data-wb-distort-rgb="1"             colour split (0–3)        data-wb-distort-speed="1"    wave speed
   The media inside is found as img/video; without one (placeholders) the wrapper's first child's background is used. */
(() => {
  if (window.__wbDistort) return; window.__wbDistort = 1;
  const VS = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float; uniform sampler2D uTex; uniform vec2 uSize; uniform float uRadius, uHover, uTime, uStr, uRip, uRgb, uSpd; uniform vec2 uMouse, uMVel; uniform vec4 uInner; uniform vec2 uTexAsp; varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
vec2 cover(vec2 uv){ vec2 s = uTexAsp; return (uv - 0.5) * s + 0.5; }
void main(){
  vec2 px = vUv * uSize; px.y = uSize.y - px.y; float d = sdRound(px - uSize * 0.5, uSize * 0.5, uRadius), aa = fwidth(d) * 1.2, a = 1.0 - smoothstep(-aa, aa, d);
  vec2 asp = vec2(uSize.x / uSize.y, 1.0), uv0 = vec2(vUv.x, 1.0 - vUv.y), md = (uv0 - uMouse) * asp; float dist = length(md); vec2 dir = md / max(dist, 1e-4) / asp;
  float fall = smoothstep(0.5, 0.0, dist) * uHover * uStr;
  vec2 uv = (uv0 - 0.5) * (1.0 - 0.05 * uHover * uStr) + 0.5;
  uv -= dir * sin(dist * 30.0 - uTime * 6.0 * uSpd) * 0.010 * fall * uRip; uv -= dir * 0.035 * fall * (1.0 - dist * 2.0); uv -= uMVel * fall * 0.6;
  vec2 sh = (dir * 0.012 * fall + uMVel * fall * 0.4) * uRgb;
  vec2 ti = (uv * uSize - uInner.xy) / uInner.zw; ti = cover(ti); vec2 tr = cover(((uv + sh) * uSize - uInner.xy) / uInner.zw), tb = cover(((uv - sh) * uSize - uInner.xy) / uInner.zw);
  vec3 col = vec3(texture2D(uTex, tr).r, texture2D(uTex, ti).g, texture2D(uTex, tb).b) + fall * 0.06;
  gl_FragColor = vec4(col * a, a); }`;
  let gl, cv, U, tex, cur = null, hov = 0, mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, vx = 0, vy = 0, srcCv = null, lastT = 0;
  const init = () => { if (gl) return true;
    cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-wb-persist', ''); cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:50;opacity:0;';
    document.body.appendChild(cv); gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true }); if (!gl) return false; gl.getExtension('OES_standard_derivatives');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[distort]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    U = {}; ['uTex', 'uSize', 'uRadius', 'uHover', 'uTime', 'uStr', 'uRip', 'uRgb', 'uSpd', 'uMouse', 'uMVel', 'uInner', 'uTexAsp'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); return true; };
  /* the media source: <img>/<video>, or a placeholder painted from the inner element's background + text */
  const media = (w) => w.querySelector('video, img') || null;
  const inner = (w) => media(w) || w.firstElementChild || w;
  const upload = (w) => { const m = media(w); gl.bindTexture(gl.TEXTURE_2D, tex);
    if (m && (m.tagName === 'VIDEO' ? m.readyState >= 2 : m.complete && m.naturalWidth)) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, m); return m.tagName === 'VIDEO' ? [m.videoWidth, m.videoHeight] : [m.naturalWidth, m.naturalHeight]; } catch (e) { /* cross-origin without CORS: use a CORS copy of the same image (Webflow CDN allows it), the DOM media stays untouched */
        if (m.tagName === 'IMG') { const c = m.__cors || (m.__cors = Object.assign(new Image(), { crossOrigin: 'anonymous', src: m.currentSrc || m.src }));
          if (c.complete && c.naturalWidth) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); return [c.naturalWidth, c.naturalHeight]; } catch (e2) {} } }
        return null; } }
    const el = inner(w), r = el.getBoundingClientRect(); srcCv = srcCv || document.createElement('canvas'); const s = Math.min(2, devicePixelRatio || 1); srcCv.width = Math.max(2, r.width * s | 0); srcCv.height = Math.max(2, r.height * s | 0);
    const g = srcCv.getContext('2d'), cs = getComputedStyle(el); g.fillStyle = cs.backgroundColor || '#222'; g.fillRect(0, 0, srcCv.width, srcCv.height);
    const t = el.textContent.trim(); if (t) { const tcs = getComputedStyle(el.querySelector('*') || el); g.fillStyle = tcs.color; g.globalAlpha = +tcs.opacity || 1; g.font = tcs.fontWeight + ' ' + parseFloat(tcs.fontSize) * s + 'px ' + tcs.fontFamily; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, srcCv.width / 2, srcCv.height / 2); g.globalAlpha = 1; }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCv); return [srcCv.width, srcCv.height]; };
  let texWH = null;
  const num = (w, k, d) => { const v = parseFloat(w.getAttribute('data-wb-distort-' + k)); return isFinite(v) ? v : d; };
  const frame = (now) => { (window.__wbRawRAF || requestAnimationFrame)(frame); if (!cur && hov <= 0.001) { if (cv && cv.style.opacity !== '0') cv.style.opacity = '0'; return; }
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now; const w = cur || frame.last; if (!w || !w.isConnected) { cur = null; hov = 0; return; }
    hov += ((cur ? 1 : 0) - hov) * (1 - Math.exp(-dt * 7)); const pmx = mx, pmy = my; mx += (tmx - mx) * (1 - Math.exp(-dt * 10)); my += (tmy - my) * (1 - Math.exp(-dt * 10)); vx += ((mx - pmx) * 6 - vx) * 0.2; vy += ((my - pmy) * 6 - vy) * 0.2;
    const r = w.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), W = Math.max(2, Math.round(r.width * d)), H = Math.max(2, Math.round(r.height * d));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; cv.style.transform = 'translate3d(' + r.left + 'px,' + r.top + 'px,0)'; cv.style.opacity = '1';
    const m = media(w); if (!texWH || (m && m.tagName === 'VIDEO')) texWH = upload(w) || texWH; if (!texWH) return;
    const ir = inner(w).getBoundingClientRect(), fit = m ? getComputedStyle(m).objectFit : 'fill', ea = texWH[0] / texWH[1], ba = ir.width / ir.height;
    const ta = fit === 'cover' ? (ea > ba ? [ba / ea, 1] : [1, ea / ba]) : [1, 1];
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uSize, r.width, r.height); gl.uniform1f(U.uRadius, parseFloat(getComputedStyle(w).borderTopLeftRadius) || 0); gl.uniform1f(U.uHover, hov); gl.uniform1f(U.uTime, now / 1000);
    gl.uniform1f(U.uStr, num(w, 'strength', 1)); gl.uniform1f(U.uRip, num(w, 'ripple', 1)); gl.uniform1f(U.uRgb, num(w, 'rgb', 1)); gl.uniform1f(U.uSpd, num(w, 'speed', 1));
    gl.uniform2f(U.uMouse, mx, my); gl.uniform2f(U.uMVel, vx, vy); gl.uniform4f(U.uInner, ir.left - r.left, ir.top - r.top, ir.width, ir.height); gl.uniform2f(U.uTexAsp, ta[0], ta[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3); };
  addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; const w = e.target.closest && e.target.closest('[data-wb-distort]'); if (!w || w === cur) return; if (!init()) return;
    if (w !== frame.last) { texWH = null; hov = 0; } cur = w; frame.last = w; const r = w.getBoundingClientRect(); tmx = mx = (e.clientX - r.left) / r.width; tmy = my = (e.clientY - r.top) / r.height; }, { passive: true });
  addEventListener('pointermove', (e) => { if (!cur) return; const r = cur.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width; tmy = (e.clientY - r.top) / r.height;
    if (tmx < 0 || tmx > 1 || tmy < 0 || tmy > 1) cur = null; }, { passive: true });
  addEventListener('pointerout', (e) => { if (cur && !cur.contains(e.relatedTarget)) cur = null; }, { passive: true });
  requestAnimationFrame(frame);
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
/* modules22/wb-abyss.js */
/* Wubble "Teal Abyss" background — one fixed WebGL canvas behind every page.
   Layered domain-warped fog, cyan light bloom, dark overhangs, drifting specks, grain + edge RGB split, pointer parallax, click pulse.
   Single fullscreen pass (no three.js), rendered at reduced resolution (fog is soft) so it costs almost nothing next to the 3D scenes.
   Webflow control (attributes on <html> or <body>, or window.WB_ABYSS = {...}):
     data-wb-abyss="off"              disable on this page
     data-wb-abyss-scale="0.6"        render resolution (0.3–1)
     data-wb-abyss-opacity="0.55"     overall brightness (1 = original)
     data-wb-abyss-x / -y             light source position (-0.5..0.5, default -0.24 / 0.105)
     data-wb-abyss-color="0"          0 = black & white, 1 = original teal (anything between mixes)
     data-wb-abyss-mouse="1"          mouse parallax amount        data-wb-abyss-speed="2.2"   drift speed
   Content must have a transparent background to show it (the canvas sits at z-index:-1). */
(() => {
  if (window.__wbAbyss) return; window.__wbAbyss = 1;
  const attr = (k, d) => { const el = document.body && document.body.hasAttribute('data-wb-abyss-' + k) ? document.body : document.documentElement; const v = el.getAttribute('data-wb-abyss-' + k); const o = (window.WB_ABYSS || {})[k]; return o != null ? o : v != null ? +v : d; };
  const off = () => /off|false/.test(String(document.documentElement.getAttribute('data-wb-abyss') || (document.body && document.body.getAttribute('data-wb-abyss')) || ''));
  const FS = `precision highp float; varying vec2 vUv; uniform float uTime, uPulse, uOp, uSat, uMove, uSpeed; uniform vec2 uRes, uPointer, uSrc;
float hash(vec2 p){ p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 34.5); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.55; mat2 m = mat2(1.62, -1.18, 1.18, 1.62); for(int i=0;i<5;i++){ v += a * noise(p); p = m*p + vec2(0.13, -0.08); a *= 0.49; } return v; }
vec3 scene(vec2 uv){
  vec2 p = uv - 0.5; p.x *= uRes.x / uRes.y; p -= uPointer * 0.09 * uMove;
  float t = uTime * 0.035 * uSpeed; vec2 drift = vec2(t * 0.65, -t * 0.24) + uPointer * 0.06 * uMove;
  float warpA = fbm(p*2.0 + drift), warpB = fbm(p*3.2 - drift + vec2(3.7, 1.9));
  vec2 warped = p + (vec2(warpA, warpB)-0.5)*0.48;
  float cloudLarge = fbm(warped*2.45 + drift), cloudFine = fbm(warped*5.4 - drift*1.7), cloudDetail = fbm(warped*10.0 + vec2(t*1.5,-t));
  vec2 q = p - (uSrc + uPointer*0.16*uMove + vec2(sin(uTime*0.21*uSpeed), cos(uTime*0.17*uSpeed))*0.035); float dist = length(vec2(q.x*0.83, q.y*1.03));
  float bloom = exp(-dist*2.75), hotCore = exp(-dist*dist*13.5), innerCore = exp(-dist*dist*31.0);
  float beam = exp(-abs(q.x + q.y*0.20 + (cloudLarge-.5)*0.25)*4.2), lowerBeam = exp(-abs(q.x*0.72 - q.y*0.48 + (cloudFine-.5)*0.17)*5.0);
  float mist = smoothstep(0.24, 0.76, cloudLarge*0.62 + cloudFine*0.38), fil = smoothstep(0.43, 0.77, cloudFine*0.58 + cloudDetail*0.42), fineFog = smoothstep(0.35, 0.78, cloudDetail);
  vec3 col = vec3(0.003, 0.008, 0.009);
  col += vec3(0.012, 0.065, 0.071) * mist; col += vec3(0.018, 0.13, 0.145) * fil * 0.72; col += vec3(0.025, 0.20, 0.22) * fineFog * 0.20;
  col += vec3(0.08, 0.40, 0.44) * bloom * (0.25 + mist*0.55); col += vec3(0.32, 0.78, 0.81) * hotCore * (0.40 + cloudFine*0.24); col += vec3(0.62, 0.91, 0.92) * innerCore * 0.72;
  col += vec3(0.055, 0.30, 0.34) * beam * mist * 0.26; col += vec3(0.035, 0.21, 0.24) * lowerBeam * fil * 0.15;
  vec2 up = vec2(p.x*0.78 + 0.12, p.y*1.04 - 0.20) + uPointer * 0.05 * uMove; float en = fbm(up*3.6 + vec2(t*0.4,t*0.25) - uPointer*0.08*uMove);
  float um = smoothstep(-0.06, 0.10, up.x*0.58 + up.y*0.90 + (en-0.5)*0.40 + sin(up.x*5.0 + en*3.0)*0.045); um *= smoothstep(-0.58, -0.25, p.x + (en-.5)*.1); col *= 1.0 - um*0.96;
  vec2 lo = vec2(p.x + 0.18, p.y + 0.34) - uPointer * 0.06 * uMove; float ln = fbm(lo*3.0 - drift);
  float lm = 1.0 - smoothstep(-0.11, 0.12, lo.y + lo.x*0.40 + (ln-0.5)*0.30); lm *= 1.0 - smoothstep(0.32, 0.72, p.x); col *= 1.0 - lm*0.90;
  float vig = smoothstep(1.12, 0.24, length(p*vec2(0.78,0.92))); col *= 0.30 + vig*0.80; col += vec3(0.005,0.025,0.029) * (1.0-vig);
  float ring = exp(-abs(dist-(0.10+uPulse*0.38))*35.0); col += vec3(0.08,0.56,0.62)*ring*uPulse*0.25;
  /* suspended specks (teal + a few red), drifting with parallax */
  for (int l = 0; l < 2; l++) { float fl = float(l); vec2 sp = (p + uPointer * (0.06 + fl * 0.07) * uMove) * (34.0 + fl * 22.0) + vec2(uTime * (0.05 + fl * 0.03), -uTime * 0.02) * uSpeed;
    vec2 cell = floor(sp), f = fract(sp) - 0.5; float h = hash(cell + fl * 17.0); if (h > 0.93) { vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5; float d = length(f - o * 0.6);
      float tw = 0.45 + 0.55 * sin(uTime * 0.55 + h * 40.0); vec3 sc = hash(cell + 11.0) < 0.24 ? vec3(0.95, 0.12, 0.22) : vec3(0.25, 0.85, 0.9); col += sc * smoothstep(0.09, 0.0, d) * tw * 0.35 * (0.4 + mist); } }
  return col; }
void main(){ vec2 uv = vUv, c = uv - 0.5; float edge = dot(c, c), ca = (0.00065 + edge * 0.0038) * (1.0 + uPulse * 0.7); vec2 dir = normalize(c + 0.0001);
  /* edge RGB split approximated by shifting the light-source lookup per channel (one scene eval, cheap) */
  vec3 col = scene(uv); col.r = mix(col.r, scene(uv + dir * ca * 6.0).r, smoothstep(0.05, 0.35, edge));
  col *= 0.62 + 0.48 * (1.0 - smoothstep(0.18, 0.82, length(c * vec2(0.95, 1.05))));
  col += (fract(sin(dot(uv * uRes + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722)) * 1.05; lum = lum / (1.0 + lum * 0.9); /* soft roll-off: the core glows, never clips to white */ col = mix(vec3(lum), col, uSat);
  gl_FragColor = vec4(max(col, vec3(0.0)) * uOp, 1.0); }`;
  const VS = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const boot = () => {
    if (off()) return;
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-wb-persist', ''); cv.setAttribute('data-wb-abyss-canvas', '');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block;';
    /* host: by default behind the whole page; WB_ABYSS.host = selector puts it inside a backdrop layer instead (homepage: [data-space-host], under the stars) */
    const hostSel = (window.WB_ABYSS || {}).host || document.documentElement.getAttribute('data-wb-abyss-host');
    const mountIn = (h) => { cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;'; h.prepend(cv); };
    if (hostSel) { const tryHost = (n) => { const h = document.querySelector(hostSel); if (h) return mountIn(h); if (n < 300) setTimeout(() => tryHost(n + 1), 50); }; tryHost(0); }
    else { document.body.prepend(cv); document.documentElement.style.background = '#050505'; document.body.style.setProperty('background', 'transparent', 'important'); /* body is painted above z-index:-1 layers, so it must not be opaque */ }
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' }); if (!gl) { cv.remove(); return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[abyss]', gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uTime', 'uPulse', 'uOp', 'uRes', 'uPointer', 'uSrc', 'uSat', 'uMove', 'uSpeed'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    const size = () => { const s = Math.max(0.3, Math.min(1, attr('scale', 0.55))), w = Math.max(2, Math.round(innerWidth * s)), h = Math.max(2, Math.round(innerHeight * s)); /* viewport-sized either way */ if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } };
    size(); addEventListener('resize', size);
    const ptr = { x: 0, y: 0, sx: 0, sy: 0 }; let pulse = 0, pt = 0;
    addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });
    addEventListener('pointerdown', () => { pt = 1; }, { passive: true }); addEventListener('pointerup', () => { pt = 0; }, { passive: true });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), RAF = window.__wbRawRAF || requestAnimationFrame.bind(window);
    let last = 0;
    const frame = (now) => { RAF(frame); if (document.hidden || now - last < 31) return; last = now; /* ~30fps is plenty for slow fog */
      ptr.sx += (ptr.x - ptr.sx) * 0.08; ptr.sy += (ptr.y - ptr.sy) * 0.08; pulse += (pt - pulse) * 0.1;
      gl.uniform1f(U.uTime, reduced ? 0 : (now - t0) / 1000); gl.uniform1f(U.uPulse, pulse); gl.uniform1f(U.uOp, attr('opacity', 0.55)); gl.uniform1f(U.uSat, attr('color', 0)); gl.uniform1f(U.uMove, attr('mouse', 1)); gl.uniform1f(U.uSpeed, attr('speed', 2.2));
      gl.uniform2f(U.uRes, innerWidth, innerHeight); gl.uniform2f(U.uPointer, ptr.sx, ptr.sy); gl.uniform2f(U.uSrc, attr('x', -0.24), attr('y', 0.105));
      gl.drawArrays(gl.TRIANGLES, 0, 3); };
    RAF(frame);
  };
  document.body ? boot() : addEventListener('DOMContentLoaded', boot);
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
    await wait(); try { for (let k = 0; k < 40 && !document.fonts.check('700 200px Switzer'); k++) { try { await document.fonts.load('700 200px Switzer'); } catch (e) {} if (!document.fonts.check('700 200px Switzer')) await new Promise((r) => setTimeout(r, 100)); } } catch (e) {}
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
