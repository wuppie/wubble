// Wubble site chat: the "Let's chat" widget (modules22/wb-chat.js) posts { messages: [{role, content}] } here;
// this Worker adds the Wubble briefing and asks Claude. The API key stays here (a Worker secret), never in the page.
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `You are the assistant on wubble.nl, the website of Wubble: an independent web studio and Webflow Certified Partner from the Netherlands, working worldwide.
Services: Webflow Development, Web & UX Design, Shopify Development, AI Integration & Automation, Creative Development (WebGL & 3D).
Clients include Nertia, Orrett's, Luis Brown, Foedsie, LegalPa and Wiwi.
Webflow retainers (USD per month): Care $950, up to 8 hours (text, image and layout changes, bug fixes, CMS updates, minor improvements);
Growth $2,750, most popular, up to 24 hours (everything in Care plus new pages, landing pages and templates, new sections and redesigns, custom animations);
Partner $4,950, up to 40 hours (everything in Growth plus bespoke page designs, larger redesigns, advanced GSAP and Three.js, complex interactions).
Hours are a capacity allowance, not a fixed number of pages; unused hours expire at the end of each month; hosting and paid tools are billed separately. Retainer inquiries: the Retainer Inquiry page.
Website packages (USD, one-time, designed in Figma and built in Webflow): Premium Webflow Website $2,500 (1 custom page), Premium Business Website $4,500 (up to 5 pages, CMS and SEO), Full Premium Experience $7,500 (5 to 8 pages, scroll effects, CMS). All include GSAP animation and 2 revision rounds. Website inquiries: the Website Inquiry page.
Contact: hello@wubble.nl, or the form on the Contact page.
Answer visitors' questions about Wubble, its services, plans and how a project works. Keep answers short (2 to 4 sentences), warm and plain. Do not use em dashes.
Never invent prices, clients, deadlines or promises beyond the facts above; for anything else, invite them to email hello@wubble.nl or use the Contact page.
Wubble is a one-person studio: speak for it as "I" and never mention a team.
Politely decline questions unrelated to Wubble or building websites.`;

const MAX_TURNS = 12, MAX_CHARS = 2000; // limits per request (this endpoint is public)

const cors = (origin, env) => {
  const ok = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).includes(origin);
  return ok ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } : null;
};
const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export default {
  async fetch(req, env) {
    const h = cors(req.headers.get('Origin') || '', env);
    if (!h) return new Response('Forbidden', { status: 403 });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, h);

    // validate what the page sent: alternating user/assistant text, ending with the user
    let body; try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400, h); }
    const msgs = Array.isArray(body?.messages) ? body.messages.slice(-MAX_TURNS) : [];
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    const clean = msgs.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    if (!clean.length || clean.at(-1).role !== 'user') return json({ error: 'no question' }, 400, h);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const res = await client.beta.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 16000,
        output_config: { effort: 'low' }, // short site answers; raise if replies feel thin
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default', // if a safety check declines, the API retries on its recommended model
        system: SYSTEM,
        messages: clean,
      });
      if (res.stop_reason === 'refusal') return json({ reply: "Sorry, I can't help with that one. For anything about a project, email hello@wubble.nl." }, 200, h);
      const reply = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
      return json({ reply: reply || 'Sorry, something went wrong. Email me at hello@wubble.nl.' }, 200, h);
    } catch (e) {
      const status = e instanceof Anthropic.RateLimitError ? 429 : 502;
      return json({ error: 'busy', reply: 'The assistant is busy right now. Email me at hello@wubble.nl.' }, status, h);
    }
  },
};
