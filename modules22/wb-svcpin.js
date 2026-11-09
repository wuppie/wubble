/* Wubble homepage services, TEST layout after mobius.framer.website: a pinned left block ("Our Services" + a short line and a
   Get in touch link) and a right column (the statement + the service rows) that scrolls up through the pinned services stretch,
   so the left block stays put until every service has been in view. Desktop only; remove the loader line to undo.
   The services panel is already sticky (wb-sections), so the left block needs no pinning of its own; only the right column moves. */
(() => {
  if (window.__wbSvcPin || matchMedia('(pointer: coarse)').matches) return;
  const sec = document.querySelector('.section_home-services'), hero = document.querySelector('[data-hero3]'), box = hero && hero.querySelector('.home-services_block-2');
  if (!sec || !box) return; window.__wbSvcPin = 1;
  const st = document.createElement('style');
  st.textContent = `
html.wb-svcpin [data-hero3]{left:0!important;right:0!important;top:0!important;height:100vh!important}
html.wb-svcpin .home-services_block-2{position:absolute!important;inset:0;display:grid!important;grid-template-columns:minmax(260px,36%) 1fr;column-gap:4vw;padding:15vh 4vw 8vh;box-sizing:border-box;overflow:hidden}
.wb-svc-left{display:flex;flex-direction:column;justify-content:space-between;height:100%;min-height:0}
.wb-svc-left h2{margin:0;font:600 clamp(18px,1.6vw,24px)/1.2 Switzer,Helvetica,Arial,sans-serif;letter-spacing:-.01em;color:#f2f1ee}
.wb-svc-left p{margin:0 0 3vh;max-width:22em;font:400 clamp(13px,.95vw,15px)/1.6 Switzer,Helvetica,Arial,sans-serif;color:rgba(242,241,238,.55)}
.wb-svc-left a{display:inline-flex;align-items:center;gap:.6em;font:400 clamp(24px,2.2vw,34px)/1 Switzer,Helvetica,Arial,sans-serif;color:#f2f1ee;text-decoration:none}
.wb-svc-left a span{transition:transform .4s cubic-bezier(.2,.7,.2,1)}.wb-svc-left a:hover span{transform:translateX(.3em)}
.wb-svc-right{min-height:0;will-change:transform}
html.wb-svcpin .home-services_title{position:relative!important;inset:auto!important;transform:none!important;margin:0 0 9vh!important;font:700 clamp(36px,4.2vw,72px)/1.08 Switzer,Helvetica,Arial,sans-serif!important;letter-spacing:-.035em!important;text-align:left!important;color:#f2f1ee}
html.wb-svcpin .home-services_title::before{content:'A/';position:absolute;right:100%;margin-right:.45em;color:rgba(242,241,238,.16);font-weight:500}
html.wb-svcpin .home-services_title .home-services_text{display:inline!important}
html.wb-svcpin .home-services_title .home-hero_word{transform:none!important;opacity:1!important}
html.wb-svcpin .home-services_rows{position:relative!important;inset:auto!important;transform:none!important;margin:0!important;display:block!important}
html.wb-svcpin .about-services_row{display:grid!important;grid-template-columns:5em 1fr;align-items:baseline;padding:4.2vh 0!important;border-top:1px solid rgba(242,241,238,.14);position:relative!important;transform:none!important}
html.wb-svcpin .about-services_row:last-child{border-bottom:1px solid rgba(242,241,238,.14)}
html.wb-svcpin .about-services_number{color:rgba(242,241,238,.4);font:400 clamp(13px,.95vw,15px)/1 Switzer,Helvetica,Arial,sans-serif}
html.wb-svcpin .about-services_title.is-home{margin:0!important;font:600 clamp(26px,2.6vw,44px)/1.1 Switzer,Helvetica,Arial,sans-serif!important;letter-spacing:-.025em}`;
  document.head.appendChild(st);
  const left = document.createElement('div'); left.className = 'wb-svc-left';
  left.innerHTML = '<h2>Our Services</h2><div><p>Not sure where to start? Let’s find the right build for your brand, together.</p><a href="' + (/^nl/i.test(document.documentElement.lang) ? '/nl' : '') + '/contact">Get in touch <span aria-hidden="true">→</span></a></div>';
  const right = document.createElement('div'); right.className = 'wb-svc-right';
  [...box.children].forEach((c) => right.appendChild(c)); box.append(left, right);
  document.documentElement.classList.add('wb-svcpin');
  /* the right column scrolls through the pinned services stretch: from when the panel pins until the rows have all passed */
  const START = 0.15, LEN = 2.2; /* in screen heights after the panel pins; tune if the services phase is longer/shorter */
  let last = '';
  const tick = () => { requestAnimationFrame(tick);
    const V = innerHeight, into = -sec.getBoundingClientRect().top / V, p = Math.max(0, Math.min(1, (into - START) / LEN));
    const travel = Math.max(0, right.scrollHeight - (box.clientHeight - V * 0.23)), y = -Math.round(p * travel) + 'px';
    if (y !== last) { last = y; right.style.transform = 'translate3d(0,' + y + ',0)'; } };
  requestAnimationFrame(tick);
})();
