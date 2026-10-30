/* Wubble click sound: the homepage's click sound on every button / link on any page (the homepage has it built in, so
   don't load this there). Optional: data-src="…mp3" and data-volume="0.5" on this script tag. */
(() => {
  if (window.__wbClickSound) return; window.__wbClickSound = 1;
  const me = document.currentScript, SRC = (me && me.dataset.src) || 'https://cdn.jsdelivr.net/gh/wuppie/wubble@main/sound.mp3';
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
