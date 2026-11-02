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
