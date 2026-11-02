/* Wubble reflective card: a brushed-metal card whose light reflection and tilt follow the cursor (look of React Bits
   <ReflectiveCard />, without its webcam reflection, so visitors never get a camera prompt).
   Webflow: any element with [data-wb-reflect]; its content stays as Webflow styles it. data-tilt="8" (degrees). */
(() => {
  const css = `[data-wb-reflect]{position:relative;isolation:isolate;overflow:hidden;transform-style:preserve-3d;
  background:linear-gradient(115deg,rgba(255,255,255,0) 28%,rgba(255,255,255,.14) 42%,rgba(255,255,255,0) 58%),linear-gradient(160deg,#3a3a3d 0%,#1b1b1d 48%,#2c2c2f 100%);border:1px solid rgba(255,255,255,.14);
  transition:transform .6s cubic-bezier(.2,.8,.2,1);--mx:50%;--my:30%;--o:.15}
[data-wb-reflect]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:var(--o);transition:opacity .4s;
  background:radial-gradient(60% 50% at var(--mx) var(--my),rgba(255,255,255,.16),rgba(255,255,255,0) 70%),
  repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px)}
[data-wb-reflect]::after{content:"";position:absolute;inset:-40%;z-index:-1;pointer-events:none;mix-blend-mode:overlay;opacity:calc(var(--o)*.35);
  background:conic-gradient(from calc(var(--a,0)*1deg) at 50% 50%,#7a7d85,#e9ecf2,#55585f,#c9ccd3,#7a7d85)}`;
  /* card call-to-action ([data-wb-cta] inside a card): a fill wipes in from the left, the label flips colour, the arrow nudges */
  const cta = `[data-wb-cta]{position:relative;overflow:hidden;isolation:isolate;transition:color .45s cubic-bezier(.2,.8,.2,1),border-color .45s}
[data-wb-cta]::before{content:"";position:absolute;inset:0;z-index:-1;background:#f2f1ee;transform:scaleX(0);transform-origin:0 50%;transition:transform .6s cubic-bezier(.7,0,.2,1)}
[data-wb-cta="solid"]::before{background:#0e0e0d}
[data-wb-cta]>span{display:inline-block;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
a:hover>[data-wb-cta]::before,a:hover [data-wb-cta]::before,a:focus-visible [data-wb-cta]::before{transform:scaleX(1)}
a:hover [data-wb-cta],a:focus-visible [data-wb-cta]{color:#0e0e0d !important;border-color:transparent}
a:hover [data-wb-cta="solid"],a:focus-visible [data-wb-cta="solid"]{color:#f2f1ee !important}
a:hover [data-wb-cta]>span,a:focus-visible [data-wb-cta]>span{transform:translate(4px,-4px)}
@media(prefers-reduced-motion:reduce){[data-wb-cta]::before,[data-wb-cta]>span{transition:none}}`;
  const st = document.createElement('style'); st.textContent = css + cta; document.head.append(st);
  const touch = matchMedia('(hover: none)').matches, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prep = (el) => {
    if (el.__wbr || touch) return; el.__wbr = 1; const T = +(el.getAttribute('data-tilt') || 8);
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%'); el.style.setProperty('--a', Math.round((x + y) * 180)); el.style.setProperty('--o', .6);
      if (!still) el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * T}deg) rotateY(${(x - 0.5) * T}deg)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; el.style.setProperty('--o', 0.15); });
  };
  const scan = () => document.querySelectorAll('[data-wb-reflect]').forEach(prep);
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
