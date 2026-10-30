# Wubble chat backend

A small Cloudflare Worker behind the "Let's chat" button (`modules22/wb-chat.js`). The page sends the conversation here and the Worker asks Claude. Your API key stays on Cloudflare and never appears in the page.

## Setup (once, about 10 minutes)

1. Make a free Cloudflare account at dash.cloudflare.com.
2. Get an API key at platform.claude.com → API keys, and add some credit there.
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
<script src=".../modules22/wb-chat.js" data-endpoint="https://wubble-chat.<your-name>.workers.dev"></script>
```

## Change things

- **What the assistant knows and how it answers:** edit `SYSTEM` in `src/index.js`, then run `npx wrangler deploy` again.
- **Which sites may use it:** `ALLOWED_ORIGINS` in `wrangler.toml` (add any new domain).
- **Model:** `claude-opus-5-5` at low effort. To make it cheaper, switch `model` to `claude-haiku-5-5`.
- **Abuse protection:** each request is capped at 12 turns and 2,000 characters per message, and only the allowed sites can call it. For a hard limit per visitor, add a Cloudflare rate-limiting rule on the Worker's route.
