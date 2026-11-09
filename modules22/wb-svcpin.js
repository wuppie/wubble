/* Wubble homepage services, TEST layout 1:1 after mobius.framer.website (dark theme):
   left block pinned ("Our Services" top; a short line + big "Get in touch ->" bottom), right column with per service
   a grey index ("A /"), a big statement and pill tags with what it covers. The right column scrolls up through the pinned
   services stretch, so the left block stays put until every service has been in view. Desktop only; remove the loader line to undo.
   The services panel is already sticky (wb-sections), so the left block needs no pinning of its own; only the right column moves. */
(() => {
  if (window.__wbSvcPin || matchMedia('(pointer: coarse)').matches) return;
  const sec = document.querySelector('.section_home-services'), hero = document.querySelector('[data-hero3]'), box = hero && hero.querySelector('.home-services_block-2');
  if (!sec || !box) return; window.__wbSvcPin = 1;
  const NL = /^nl/i.test(document.documentElement.lang || '');
  /* copy: draft, edit freely (statement + pills per service) */
  const S = [
    { href: '/webflow-development', t: 'We build fast, scalable Webflow sites your team can edit with ease — clean structure, smooth motion and SEO built in from day one.',
      p: ['Webflow Builds', 'CMS Architecture', 'Interactions & Motion', 'Technical SEO', 'Migrations to Webflow'] },
    { href: '/web-ux-design', t: 'We design clear, expressive websites shaped by strong visual direction — every screen made to guide visitors and turn them into clients.',
      p: ['UX Strategy', 'Wireframes & Prototypes', 'UI Design', 'Design Systems', 'Responsive Layouts'] },
    { href: '/services', t: 'We build Shopify stores that look as good as they sell — custom themes, smooth checkouts and a shop that is easy to run.',
      p: ['Custom Themes', 'Store Setup', 'Product Pages', 'App Integrations', 'Conversion Optimisation'] },
    { href: '/services', t: 'We put AI to work behind your website — chat assistants, smart workflows and automations that save time and capture more leads.',
      p: ['AI Chat Assistants', 'Workflow Automation', 'Lead Capture', 'AI Visibility', 'Integrations & APIs'] },
    { href: '/services', t: 'We bring brands to life in 3D — immersive WebGL scenes, interactive motion and digital experiences people remember.',
      p: ['WebGL & Three.js', '3D Scenes', 'Creative Coding', 'Scroll Animation', 'Interactive Experiences'] } ];
  const st = document.createElement('style');
  st.textContent = `
html.wb-svcpin [data-hero3]{left:0!important;right:0!important;top:0!important;height:100vh!important}
html.wb-svcpin .home-services_block-2{position:absolute!important;inset:0;display:grid!important;grid-template-columns:minmax(0,40%) minmax(0,1fr);align-items:start!important;align-content:start!important;padding:0 40px;box-sizing:border-box;overflow:hidden}
html.wb-svcpin .home-services_block-2>.home-services_title,html.wb-svcpin .home-services_block-2>.home-services_rows{display:none!important}
.wb-svc-left{align-self:start!important;display:flex;flex-direction:column;justify-content:space-between;height:100vh;padding:17vh 0 5vh;box-sizing:border-box}
.wb-svc-left h2{margin:0;font:700 26px/1.4 Switzer,Helvetica,Arial,sans-serif;letter-spacing:-.01em;color:#f2f1ee}
.wb-svc-left p{margin:0 0 6vh;max-width:280px;font:400 14px/1.6 Switzer,Helvetica,Arial,sans-serif;color:rgba(242,241,238,.5)}
.wb-svc-left a{display:inline-flex;align-items:center;gap:.6em;font:400 32px/1 Switzer,Helvetica,Arial,sans-serif;letter-spacing:-.01em;color:#f2f1ee;text-decoration:none}
.wb-svc-left a span{transition:transform .4s cubic-bezier(.2,.7,.2,1)}.wb-svc-left a:hover span{transform:translateX(.3em)}
.wb-svc-right{position:relative;padding:17vh 0 30vh 130px;will-change:transform}
.wb-svc-g{position:relative;display:block;margin:0 0 26vh;color:inherit;text-decoration:none}
.wb-svc-g:last-child{margin-bottom:0}
.wb-svc-i{position:absolute;right:100%;margin-right:40px;top:0;white-space:nowrap;font:700 56px/1.2 Switzer,Helvetica,Arial,sans-serif;letter-spacing:-.03em;color:rgba(242,241,238,.12)}
.wb-svc-t{margin:0 0 56px;max-width:660px;font:700 56px/1.2 Switzer,Helvetica,Arial,sans-serif;letter-spacing:-1.68px;color:#f2f1ee}
.wb-svc-p{display:flex;flex-wrap:wrap;gap:10px;max-width:660px}
.wb-svc-p span{display:inline-flex;align-items:center;height:44px;padding:10px 20px;box-sizing:border-box;border-radius:99px;background:rgba(242,241,238,.08);font:700 14px/1 Switzer,Helvetica,Arial,sans-serif;color:#f2f1ee;transition:background .3s ease}
.wb-svc-g:hover .wb-svc-p span{background:rgba(242,241,238,.14)}
@media (max-width:1200px){.wb-svc-t,.wb-svc-i{font-size:44px}}`;
  document.head.appendChild(st);
  const pre = NL ? '/nl' : '', esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const left = document.createElement('div'); left.className = 'wb-svc-left';
  left.innerHTML = '<h2>Our Services</h2><div><p>If you’re looking for a website that works as hard as you do, let’s build it together.</p><a href="' + pre + '/contact">Get in touch <span aria-hidden="true">→</span></a></div>';
  const right = document.createElement('div'); right.className = 'wb-svc-right';
  right.innerHTML = S.map((s, i) => '<a class="wb-svc-g" href="' + pre + s.href + '"><div class="wb-svc-i" aria-hidden="true">' + String.fromCharCode(65 + i) + ' /</div><h3 class="wb-svc-t">' + esc(s.t) + '</h3><div class="wb-svc-p">' + s.p.map((x) => '<span>' + esc(x) + '</span>').join('') + '</div></a>').join('');
  box.append(left, right);
  document.documentElement.classList.add('wb-svcpin');
  /* the right column scrolls through the pinned services stretch: from when the services fade in until the section unpins */
  const START = 4.6, LEN = 3.9; /* screen heights into the section (services phase ~4.5 -> ~8.7) */
  let last = '';
  const tick = () => { requestAnimationFrame(tick);
    const V = innerHeight, into = -sec.getBoundingClientRect().top / V, p = Math.max(0, Math.min(1, (into - START) / LEN));
    const travel = Math.max(0, right.offsetHeight - V), y = -Math.round(p * travel) + 'px';
    if (y !== last) { last = y; right.style.transform = 'translate3d(0,' + y + ',0)'; } };
  requestAnimationFrame(tick);
})();
