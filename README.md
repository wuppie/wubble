# Wubble — handoff to Claude Code

This folder moves the **Wubble 2.0** website project (wubble.nl) from Claude Design to Claude Code.
Unlike a usual design handoff, most of this is **real, live code**: the `modules22/*.js` files are plain browser scripts that already run on the Webflow site via jsDelivr.

## Architecture (read first)
- **Webflow owns layout, classes, text and colours.** The scripts only add behaviour via `data-w` / `data-wb-*` attributes. Never rebuild Webflow elements in code. → see `WEBFLOW-GUIDE.md` (all attributes).
- **Homepage script**: `wubble-v22-r14.js` (in GitHub repo `wuppie/wubble`, root). It loads the V22 modules from `modules22/` via `data-base`.
- **Delivery**: jsDelivr, **pinned to a commit**: `https://cdn.jsdelivr.net/gh/wuppie/wubble@<sha>/wubble-v22-r14.js` with `data-base="https://cdn.jsdelivr.net/gh/wuppie/wubble@<sha>/"`. `@main` does NOT work (jsDelivr caches branches ~12h).
- **Live now**: main script @7b471d3c35f3 (r14.61) + modules @66dbb095500a.

## Webflow
- Site "Wubble 2.0" — site id `6a0523e440e778b54e5aad08`.
- Homepage page id `6ad1df52e9a2ce4e6c9d49c4` — head custom code = `<link rel="preload" … wubble-v22-r14.js>`, footer = `<script src=… data-base=… defer>`.
- Always publish to custom domains wubble.nl (`6ad32ac2e9a454d47c922742`) + www.wubble.nl (`6ad32ac2e9a454d47c92273c`) + webflow.io.

## Ship a change (process)
1. Edit the script / module, commit + push to `main`.
2. Take the new commit sha; update homepage head + footer custom code to `@<sha>` (main script and, if modules changed, `data-base`).
3. Publish (domains above). Test in incognito.

## What exists (and its state)
| Area | Files | State |
|---|---|---|
| Homepage (hero, ribbon, sections, astronaut, clouds, CRT about, moon footer) | `wubble-v22-r14.js` + `modules22/wb-astro, wb-ribbon, wb-sections, wb-ui, wb-crt3d, wb-ftmoon, wb-space, wb-clouds*, wb-cloudtype, wb-ascii-title, wb-linkhover, wb-scramble, wb-clip-*` | **Live** |
| New multi-page setup (prototype, not yet in Webflow) | `prototypes/Site V24 Pages.dc.html`, `Work Page`, `Project Page`, `About Page`, `Services Page`, `Contact Page` | Prototype |
| Page transition (ink + no-reload swap) | `wb-ink.js`, `wb-swap.js`, `wb-pages.js` | Prototype; needs `data-wb-container` in Webflow |
| Work page (helix ribbon + glass astronaut + galaxy) | `wb-workhelix.js` | Prototype |
| Project template (Lenis, reveals, parallax, hover distortion) | `wb-project.js`, `wb-distort.js` | Prototype |
| About page (1985 hero / blur wordmark / astronaut head + click morph into 3D icons / column grid / FAQ) | `wb-about.js`, `wb-about-astro.js`, `wb-blurword.js` | Prototype |
| Services / Contact | `wb-orbit.js`, `wb-grain.js`, `wb-contactmoon.js`, `wb-ftmoon.js` | Prototype |
| Site-wide | `wb-cursor.js` (ink cursor), `wb-blurtitle.js` (h1 cursor blur, ≥90px) | Prototype |

`prototypes/*.dc.html` are design-tool files (they need the design tool's runtime to open). Use them as **references** for markup, attributes and inline styles; the real target is Webflow + the scripts.

## Open to-dos
1. Wire the new pages in Webflow: one `data-wb-container` + `data-wb-namespace` per page; load `wb-swap/wb-ink/wb-distort/wb-project/wb-cursor/wb-blurtitle` site-wide (order in WEBFLOW-GUIDE).
2. Work page: Collection List with `data-wb-work-item` + CMS-bound `data-title/type/mark/bg/ink/accent`, links to the CMS template.
3. Project CMS template: `data-wb-project`, `data-wb-enter`, `data-wb-reveal`, `data-wb-parallax`, `data-wb-distort`.
4. Homepage CMS list: add a child `[data-wubble="description"]` bound to the description field (r14.60 reads it).
5. About: replace placeholder tiles with real images; replace placeholder FAQ copy; About astronaut colours/background tuning (Unicorn Studio project `RugEEY28kv5kuCqQGB8P` is the page background).
6. Decide: apply "Work Page Blend Test" background (blur wordmark + Unicorn light + grey tint) to the real Work page.

## Third-party
- three.js 0.186.1 (esm.sh, one version for every module), GSAP 3.11, Lenis 1.1.13, Unicorn Studio embed (v2.4.3) — Unicorn Studio scene code is under their commercial licence; only embed, don't copy shaders.
- 3D models in `models/` (astronaut rig + baked textures, moon, CRT, surfboard icon).

## Files in this folder
- `README.md` — this file
- `CLAUDE.md` — project notes / rules (put it in the repo root so Claude Code reads it every session)
- `WEBFLOW-GUIDE.md` — every Webflow attribute the scripts understand
- `github.md` — last sync + screen map
- `modules22/` — all behaviour modules
- `prototypes/` — the page prototypes (reference)
