# Wubble chat backend

A small Cloudflare Worker behind the "Let's chat" button (`modules22/wb-chat.js`). The page sends the conversation here and the Worker asks Claude. Your API key stays on Cloudflare and never appears in the page.

## Setup (once, about 10 minutes)

1. Make a free Cloudflare account at dash.cloudflare.com.
2. Get an API key at platform.claude.com → API keys, and add some credit there (€10 lasts a long time). Leave auto-reload **off**, and set a monthly spend limit (Settings → Limits), e.g. €20. That's the hard cap: the bot pauses, you never get a surprise bill.
3. In a terminal, in this folder:

```bash
npm install
```

```bash
npx wrangler login
```

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

(paste the key when it asks)

```bash
npx wrangler deploy
```

4. Wrangler prints a URL like `https://wubble-chat.<your-name>.workers.dev`. Put it on the chat script tag:

```html
window.WB_CHAT_URL='https://wubble-chat.<your-name>.workers.dev';  (in Webflow: Site settings → Custom code → Head, inside the existing <script>)
```

## Change things

- **What the assistant knows and how it answers:** edit `SYSTEM` in `src/index.js`, then run `npx wrangler deploy` again.
- **Which sites may use it:** `ALLOWED_ORIGINS` in `wrangler.toml` (add any new domain).
- **Model:** `claude-haiku-5-5` at low effort (about 0.05 cent per answer). For sharper answers, switch `model` to `claude-sonnet-5-5`.
- **Abuse protection:** 6 messages per minute per visitor (`[[ratelimits]]` in `wrangler.toml`), 12 turns and 2,000 characters per message, 2,000 tokens per answer, and only the allowed sites can call it. The money cap is the spend limit in the Anthropic Console.
