/* Wubble curved loop: text that runs endlessly along a wavy ribbon (like React Bits <CurvedLoop />). Drag to scrub it.
   Webflow: a div [data-wb-curveloop] with the text in data-text="Client A ✦ Client B ✦ ".
   Attributes: data-speed="1" · data-curve="80" (wave height) · data-waves="1.5" · data-direction="left|right"
   · data-band="#f4f4f2" (ribbon colour, "none" for text only) · data-ink="#0e0e0d" · data-size="64" (font px at 1440 wide) */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const init = (host) => {
    if (host.__wbcl) return; host.__wbcl = 1;
    const at = (k, d) => host.getAttribute('data-' + k) ?? d, id = 'wbcl' + Math.random().toString(36).slice(2, 8);
    const W = 1440, CURVE = +at('curve', 80), WAVES = +at('waves', 1.5), FS = +at('size', 64), H = CURVE * 2 + FS * 2.2, mid = H / 2;
    let d = `M-200,${mid}`; for (let x = -200; x <= W + 200; x += 20) d += ` L${x},${(mid + Math.sin((x / W) * Math.PI * 2 * WAVES) * CURVE).toFixed(1)}`;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'display:block;width:100%;height:auto;overflow:visible;user-select:none;cursor:grab;';
    const path = document.createElementNS(NS, 'path'); path.id = id; path.setAttribute('d', d); path.setAttribute('fill', 'none'); svg.append(path);
    if (at('band', '#f4f4f2') !== 'none') { const b = document.createElementNS(NS, 'use'); b.setAttribute('href', '#' + id); b.setAttribute('stroke', at('band', '#f4f4f2')); b.setAttribute('stroke-width', FS * 1.5); b.setAttribute('fill', 'none'); svg.append(b); }
    const txt = document.createElementNS(NS, 'text'); txt.setAttribute('dominant-baseline', 'central');
    txt.style.cssText = `font:700 ${FS}px Switzer,Helvetica,sans-serif;letter-spacing:-0.02em;text-transform:uppercase;fill:${at('ink', '#0e0e0d')};`;
    const tp = document.createElementNS(NS, 'textPath'); tp.setAttribute('href', '#' + id); txt.append(tp); svg.append(txt); host.append(svg);
    // screen readers get the plain text once
    const sr = document.createElement('span'); sr.textContent = at('text', ''); sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);'; host.append(sr);
    // measure one copy, then repeat it enough to cover the path twice
    let one = 1; const fill = () => { tp.textContent = at('text', ''); one = txt.getComputedTextLength() || 1;
      tp.textContent = at('text', '').repeat(Math.ceil((path.getTotalLength() * 2) / one) + 1); };
    let off = 0, vel = 0, drag = null; const DIR = at('direction', 'left') === 'right' ? 1 : -1, SPEED = +at('speed', 1);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches; let vis = true, last = performance.now();
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(host);
    svg.addEventListener('pointerdown', (e) => { drag = e.clientX; svg.setPointerCapture(e.pointerId); svg.style.cursor = 'grabbing'; });
    svg.addEventListener('pointermove', (e) => { if (drag === null) return; const dx = (e.clientX - drag) * (W / svg.clientWidth); drag = e.clientX; off += dx; vel = dx; });
    const up = () => { drag = null; svg.style.cursor = 'grab'; }; svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    const loop = (now) => { requestAnimationFrame(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!vis) return;
      if (drag === null) { off += vel; vel *= 0.92; if (!still) off += DIR * SPEED * 60 * dt; }
      off = ((off % one) - one) % one; // keep between -one and 0 so the loop never shows a gap
      tp.setAttribute('startOffset', off.toFixed(1)); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fill(); requestAnimationFrame(loop); });
  };
  const scan = () => document.querySelectorAll('[data-wb-curveloop]').forEach(init);
  const start = () => { scan(); new MutationObserver(() => { clearTimeout(start.t); start.t = setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
