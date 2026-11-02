/* Wubble chat: a gooey "Let's chat" button (bottom right) that opens a small chat box with the site assistant.
   The answers come from the chat Worker (wubble/chat-worker), which keeps the Claude API key off the page.
   Webflow: load this script with data-endpoint="https://wubble-chat.<you>.workers.dev". Without an endpoint the box still
   opens and points visitors to hello@wubble.nl. Optional: data-label="Let's chat" · data-color="#f2f1ee" · data-ink="#0e0e0d" */
(() => {
  if (window.__wbChat) return; window.__wbChat = 1;
  const me = document.currentScript, D = (k, d) => (me && me.getAttribute('data-' + k)) || d;
  const URL_ = D('endpoint', window.WB_CHAT_URL || ''), C = D('color', '#f2f1ee'), INK = D('ink', '#0e0e0d');
  const ASK = ['Which Webflow plan fits us?', 'What does a new website cost?', 'How does a project start?'];
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
@media(prefers-reduced-motion:reduce){.wbc-goo i,.wbc-box{transition:none!important}}`;
  const build = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    const w = document.createElement('div'); w.className = 'wbc';
    w.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="wbc-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>
<div class="wbc-goo" aria-hidden="true"><i></i><i></i><i></i></div>
<button class="wbc-btn" type="button" aria-expanded="false" aria-controls="wbc-box"><span class="wbc-dot" aria-hidden="true"></span>${D('label', "Let's chat")}</button>
<section class="wbc-box" id="wbc-box" role="dialog" aria-label="Chat with Wubble">
  <div class="wbc-head"><div><b>Wubble assistant</b><span>Usually answers in seconds</span></div><button class="wbc-x" type="button" aria-label="Close chat">✕</button></div>
  <div class="wbc-log" aria-live="polite"></div>
  <div class="wbc-sug">${ASK.map((q) => `<button type="button">${q}</button>`).join('')}</div>
  <form class="wbc-form"><input name="q" autocomplete="off" placeholder="Ask anything about Wubble…" aria-label="Your message" maxlength="2000"><button type="submit" aria-label="Send">↑</button></form>
</section>`;
    document.body.append(w);
    const btn = w.querySelector('.wbc-btn'), log = w.querySelector('.wbc-log'), form = w.querySelector('form'), input = form.q, sug = w.querySelector('.wbc-sug');
    const history = []; let busy = false;
    const add = (role, text) => { const m = document.createElement('div'); m.className = 'wbc-m ' + role; m.textContent = text; log.append(m); log.scrollTop = log.scrollHeight; return m; };
    add('a', "Hi, I'm Wubble's assistant. Ask me about Webflow plans, a new website or how I work. I answer in seconds.");
    const toggle = (on) => { w.classList.toggle('open', on); btn.setAttribute('aria-expanded', on); if (on) setTimeout(() => input.focus(), 250); else btn.focus(); };
    btn.addEventListener('click', () => toggle(!w.classList.contains('open')));
    w.querySelector('.wbc-x').addEventListener('click', () => toggle(false));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && w.classList.contains('open')) toggle(false); });
    const send = async (q) => {
      q = q.trim(); if (!q || busy) return; busy = true; sug.remove(); add('u', q); history.push({ role: 'user', content: q }); input.value = '';
      const t = add('a t', '…');
      let reply = 'The chat is not connected yet. Email me at hello@wubble.nl and I reply within one working day.';
      if (URL_) try { const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
        const j = await r.json(); reply = j.reply || reply; } catch (e) { reply = 'Could not reach the assistant. Email me at hello@wubble.nl.'; }
      t.className = 'wbc-m a'; t.textContent = reply; history.push({ role: 'assistant', content: reply }); log.scrollTop = log.scrollHeight; busy = false;
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
    sug.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') send(e.target.textContent); });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', build, { once: true }); else build();
})();
