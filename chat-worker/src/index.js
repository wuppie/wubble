// Wubble site chat: the "Let's chat" widget (modules22/wb-chat.js) posts { messages: [{role, content}] } here;
// this Worker adds the Wubble briefing and asks Claude. The API key stays here (a Worker secret), never in the page.
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `You are the assistant on wubble.studio, the website of Wubble: an independent web studio and Webflow Certified Partner from the Netherlands, working worldwide.
Services: Webflow Development, Web & UX Design, Shopify Development, AI Integration & Automation, Creative Development (WebGL & 3D).
Clients include Nertia, Orrett's, Luis Brown, Foedsie, LegalPa and Wiwi.
Webflow retainers (USD per month): Care $950, up to 8 hours (text, image and layout changes, bug fixes, CMS updates, minor improvements);
Growth $2,750, most popular, up to 24 hours (everything in Care plus new pages, landing pages and templates, new sections and redesigns, custom animations);
Partner $4,950, up to 40 hours (everything in Growth plus bespoke page designs, larger redesigns, advanced GSAP and Three.js, complex interactions).
Hours are a capacity allowance, not a fixed number of pages; unused hours expire at the end of each month; hosting and paid tools are billed separately. Retainer inquiries: the Retainer Inquiry page.
Website packages (USD, one-time, designed in Figma and built in Webflow): Premium Webflow Website $2,500 (1 custom page), Premium Business Website $4,500 (up to 5 pages, CMS and SEO), Full Premium Experience $10,000 (5 to 8 pages, scroll effects, CMS). All include GSAP animation and 2 revision rounds. Website inquiries: the Website Inquiry page.
AI Integration & Automation (USD, page: AI Integration & Automation): free AI Snapshot (what ChatGPT and Perplexity say about a business and its 3 biggest competitors);
AI Visibility Sprint $1,500 launch price for the first 5 clients, then $1,950, one-time (business info and answers AI can quote, Google profile, directories and reviews, a baseline of 20 questions in 4 AI assistants, a re-test after 90 days; guarantee: no measurable improvement after 90 days means free extra work until there is, or 50% back);
Visibility Care $190 per month after the Sprint; Lead Agent $390 per month plus $1,950 setup, Sprint included (an AI assistant like you, in the client's brand, answering 24/7, qualifying leads, booking appointments for the client's business, every lead in the owner's inbox within a minute, monthly report);
Autopilot Plus $590 per month plus $3,900 setup (adds sector pages, a landing page per ad campaign, monthly competitor watch in AI assistants).
Working with Wubble is fully async: an intake form, email and written reports. Never offer or suggest a call or meeting with Leroy. Monthly plans: minimum 3 months, 2 months free when paying yearly. Never promise that ChatGPT will recommend someone.
Contact: hello@wubble.studio, or the form on the Contact page.
Answer visitors' questions about Wubble, its services, plans and how a project works. Keep answers short (2 to 4 sentences), warm and plain. Do not use em dashes.
Never invent prices, clients, deadlines or promises beyond the facts above; for anything else, invite them to email hello@wubble.studio or use the Contact page.
Wubble is a one-person studio run by Leroy Wubbels: speak for it as "I" and never mention a team. You are an AI assistant; if asked, say so plainly.
Politely decline questions unrelated to Wubble or building websites.
Leads: when a visitor shows real interest (a project, a price question for their situation, wanting to talk), ask in one short question for their name, an email address, and what they need.
Free AI Snapshot requests: ask for their website, their name and email, and (optional) up to 3 competitors, in one short question. Then call save_lead with need starting "AI Snapshot:" plus the website and competitors, and tell them the Snapshot arrives by email within 2 working days.
Once you have a name and an email (or phone number), call save_lead once, then confirm warmly that Leroy will reply by email within one working day. Never invent contact details and never ask for them twice.`;

/* the lead tool: strict, so the input always matches the schema; every field is a string (empty when unknown) */
const TOOLS = [{
  name: 'save_lead', strict: true,
  description: 'Save a visitor who wants to be contacted and notify Leroy. Call once, only after the visitor gave a name and an email address or phone number.',
  input_schema: { type: 'object', additionalProperties: false, required: ['name', 'email', 'phone', 'company', 'need', 'budget', 'timeline'], properties: {
    name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, company: { type: 'string' },
    need: { type: 'string', description: 'What they want, in one or two sentences' }, budget: { type: 'string' }, timeline: { type: 'string' } } },
}];

/* deliver a lead to the owner: email (Resend) and/or WhatsApp (CallMeBot), whichever secrets are set. Returns the channels that worked. */
const notify = async (env, lead, page) => {
  const lines = [`New lead from the Wubble chat${page ? ' (' + page + ')' : ''}`, `Name: ${lead.name}`, lead.email && `Email: ${lead.email}`, lead.phone && `Phone: ${lead.phone}`,
    lead.company && `Company: ${lead.company}`, `Need: ${lead.need}`, lead.budget && `Budget: ${lead.budget}`, lead.timeline && `Timeline: ${lead.timeline}`].filter(Boolean);
  const text = lines.join('\n'), ok = [], t = (p) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 8000))]);
  if (env.RESEND_API_KEY && env.LEAD_EMAIL) try {
    const r = await t(fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.LEAD_FROM || 'Wubble chat <onboarding@resend.dev>', to: [env.LEAD_EMAIL], reply_to: lead.email || undefined, subject: `New lead: ${lead.name}`, text }) }));
    if (r.ok) ok.push('email'); else console.error('lead email', r.status, await r.text());
  } catch (e) { console.error('lead email', e.message); }
  if (env.CALLMEBOT_KEY && env.LEAD_PHONE) try {
    const r = await t(fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.LEAD_PHONE)}&apikey=${encodeURIComponent(env.CALLMEBOT_KEY)}&text=${encodeURIComponent(text)}`));
    if (r.ok) ok.push('whatsapp'); else console.error('lead whatsapp', r.status);
  } catch (e) { console.error('lead whatsapp', e.message); }
  if (!ok.length) console.error('lead not delivered (no channel set up or all failed):', text);
  return ok;
};
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

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

    // spam guard: a few messages per minute per visitor (Cloudflare rate-limit binding, see wrangler.toml)
    if (env.PER_VISITOR) {
      const { success } = await env.PER_VISITOR.limit({ key: req.headers.get('CF-Connecting-IP') || 'anon' });
      if (!success) return json({ error: 'slow down', reply: 'That was a lot of messages at once. Give it a minute, or email me at hello@wubble.studio.' }, 429, h);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const system = SYSTEM + (env.BOOKING_URL ? `\nWhen a visitor wants a call, share this booking link so they can pick a time: ${env.BOOKING_URL}` : '\nIf a visitor asks for a call, explain kindly that Leroy works by email so everything is clear and in writing, and take their details for an email reply.');
    const page = clip(body.page, 200);
    try {
      const ask = (messages) => client.messages.create({
        model: 'claude-haiku-5-5', // cheapest current model, plenty for short site answers
        max_tokens: 2000, // cost cap per answer on a public endpoint
        output_config: { effort: 'low' }, // short site answers; raise if replies feel thin
        system, tools: TOOLS, messages,
      });
      let res = await ask(clean);
      /* one tool round at most: the bot saved a lead → deliver it, then let it answer the visitor */
      const call = res.stop_reason === 'tool_use' && res.content.find((b) => b.type === 'tool_use' && b.name === 'save_lead');
      if (call) {
        const L = call.input || {}, lead = { name: clip(L.name, 120), email: clip(L.email, 160), phone: clip(L.phone, 40), company: clip(L.company, 120), need: clip(L.need, 600), budget: clip(L.budget, 80), timeline: clip(L.timeline, 80) };
        const valid = lead.name && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || /\d{6,}/.test(lead.phone.replace(/\D/g, '')));
        const sent = valid ? await notify(env, lead, page) : [];
        const result = !valid ? 'Not saved: a name and a valid email address or phone number are needed. Ask the visitor for the missing detail.'
          : sent.length ? 'Saved and sent to Leroy.' : 'Saved, but the notification failed. Tell the visitor to also email hello@wubble.studio to be sure.';
        res = await ask([...clean, { role: 'assistant', content: res.content }, { role: 'user', content: [{ type: 'tool_result', tool_use_id: call.id, content: result }] }]);
      }
      if (res.stop_reason === 'refusal') return json({ reply: "Sorry, I can't help with that one. For anything about a project, email hello@wubble.studio." }, 200, h);
      const reply = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
      return json({ reply: reply || 'Sorry, something went wrong. Email me at hello@wubble.studio.' }, 200, h);
    } catch (e) {
      console.error('claude error', e.status, e.message); // visible with `npx wrangler tail`
      const status = e instanceof Anthropic.RateLimitError ? 429 : 502;
      return json({ error: 'busy', reply: 'The assistant is busy right now. Email me at hello@wubble.studio.' }, status, h);
    }
  },
};
