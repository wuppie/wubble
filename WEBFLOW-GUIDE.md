# Wubble × Webflow — attribute guide

Webflow owns layout, content and styling. The script (`wubble-v20.js`) only adds behaviour on the live site.
Rule: **classes are yours** (rename/restyle freely). **`data-wb-*` / `data-w*` attributes are the contract** — keep them when you move or duplicate elements.

## Sections
| Attribute | On | Meaning |
|---|---|---|
| `data-wb-section="hero\|work\|services\|reach"` | each section | Read in Navigator order. Lower sections dissolve in over the one above. |
| `data-wb-length="815"` | section | Scroll length in vh (how long it stays pinned). |
| `data-wb-overlap="100"` | section | How far it starts over the previous section, in vh (generic order only). |
| `data-wb-transition="1.6"` | section | Dissolve length, in screen-heights of scrolling (generic order only). |

Original order (hero → work → services → reach) uses the tuned transitions. Any other order switches to the generic smoke dissolve automatically.

## Modules (effects)
Put `data-wb-module="…"` on an empty div; the effect renders inside it.
`astronaut` · `ribbon` · `thunderstorm` · `hand` · `ray` · `loader` · `space-background` · `smoke` · `cursor` · `popup` · `nav`

## Text
| Attribute | Meaning |
|---|---|
| `data-split="letters"` | Plain text title; the script splits it into animated letters. |
| `data-split-hide="1\|2"` | Hide word 1 or 2 (used for the NEXT / LEVEL layers). |
| `data-split-from="headline"` | Copy text from the main hero headline (front layer). |
| `data-gt` | Title reveal timing; keep as is. |

## Read from your Webflow styles
Fonts: `hero-headline` font-family → all titles incl. 3D WORK word.
Colours: `site-bg`, `site`, `work-heading`, `section-about` / `about-text`, `facts-grid`, `site-footer`.
3D WORK word text: text of `work-heading`.

## Designer vs live
In the Designer sections stack normally and everything is visible. Pinning, overlaps, fixed layers and starting states only switch on in the live browser (`html.wb-live`).

## Updating the script
Upload `wubble-v20.js` to the GitHub root, then open
`https://purge.jsdelivr.net/gh/wuppie/wubble@main/wubble-v20.js` once.

## CMS
A hidden list "CMS · Projects" (inside `site`) feeds the ribbon cards and the popup: title, slug, client, services, year, description, video, cover image. Add/edit projects in the CMS — no Designer work needed.

## /work + project pages (behaviour only — everything visual stays in the Designer)
Scripts: `wb-workhelix.js` (work page), `wb-project.js` + `wb-distort.js` (project template), `wb-ink.js` + `wb-swap.js` (every page).

**Work page (CMS Collection List)**
- `data-wb-work` page root · `data-wb-work-stage` empty div the 3D canvas goes in
- Each Collection Item: `data-wb-work-item` + `data-title` `data-type` `data-mark` `data-bg` `data-ink` `data-accent` (bind to CMS fields) and `href` = project link; optional `<img data-cover>` inside
- Scroll speed: `data-wb-work-speed="1"` on the `data-wb-work` root (0.5 slower, 2 faster)
- Pager: `data-wb-work-prev` / `data-wb-work-next` / `data-wb-work-current`

**Project template page**
- `data-wb-project` root
- `data-wb-enter="0|1|2…"` elements that fade/slide in on arrival (in that order)
- `data-wb-enter-mask` on the title (its parent needs `overflow: hidden`)
- `data-wb-reveal` (value = delay ms) fades/slides in when scrolled into view
- `data-wb-parallax="0.12"` on the inner media element (parent = the clipping wrapper)
- `data-wb-align-intro` on the intro block: starts level with the title (desktop)
- `data-wb-distort` on a media wrapper: WebGL ripple on hover. Tune per element: `data-wb-distort-strength` (0–2), `-ripple` (0–2), `-rgb` (0–3), `-speed`. Uses the img/video inside; its corner radius = the wrapper's radius.
- Mobile layout: `data-wb-proj-aside` / `data-wb-proj-main` / `data-wb-proj-pair` (or just do the breakpoint in the Designer)

**Page transition (ink + swap, no reload)**
- Every page (home, work, project template): one div with `data-wb-container` + `data-wb-namespace="home"` / `"work"` / `"project"` wrapping all page content. Only its inside is swapped.
- Site-wide custom code (Project settings → Footer), BEFORE the homepage script: `wb-swap.js`, `wb-ink.js`, `wb-distort.js`, `wb-project.js` (+ Lenis). Page-only scripts (homepage script, `wb-workhelix.js`) may stay on their page — they load once when first swapped in.
- Links that transition: `data-wb-swap` (prefetched on hover). Homepage ribbon cards swap automatically once the container exists.
- Home + work stay alive: leaving freezes their 3D + scroll; coming back resumes instantly. Opt out: `data-wb-keep="false"`; opt another page in: `data-wb-keep`.
- Webflow interactions (IX2) re-init after each swap.
- Ink colour: `window.WB_INK_COLOR` (default black).
- Own scripts: listen for `wb:leave` / `wb:swap` on document (`detail.namespace`, `detail.fresh`).

**Contact page (= the homepage footer, same code)**
- Copy the homepage footer element onto the contact page (`data-footer`, `data-ft-time`, `data-fl-word`, `data-ft-bottom`, `data-fl-gl`); make it position:relative, 100vh, visible.
- Scripts on the contact page, in order: `wb-astro.js`, `wb-ui.js`, `wb-ftmoon.js`, `wb-ascii-title.js`, `wb-contactmoon.js`.
- It plays the homepage footer reveal (moon rise + astronaut landing + rim walk) on arrival. Length: `data-duration` (s) on the footer. Title height: `data-title-scale` (1.6 = letters 1.6× taller, width always fits). ASCII look via `WB_FOOTER_PROPS`: `asciiOpacity` (0.5), `asciiSpeed` (0.3), `asciiWave` (0.6), `asciiFlicker` (1.2), `asciiEase` (0.025), `asciiTilt` (0.5). Same settings as the homepage Tweaks via `window.WB_FOOTER_PROPS`.

**About page**
- Layout is plain Webflow (intro grid, two numbered lists, services rows) — style it in the Designer.
- Entrance: `data-wb-enter` / `data-wb-enter-mask` (same as project pages); rows reveal on scroll with `data-wb-reveal`. Scripts: `wb-project.js`, `wb-wordfield.js`, `wb-distort.js`.
- Background: empty div `data-wb-contours` — animated topographic lines, cursor bulge, click ripple (`data-lines`, `data-speed`, `data-opacity`, `data-mouse`, `data-color`).
- Astronaut: empty div `data-wb-about-astro` (size it in the Designer) — the exact Work-page astronaut (same glass, lights, galaxy), waving; `data-clip` (wave|look|floating), `data-scale`, Hover morph into the tool logos (full-width orbit, screen-centred): `data-morph` (0 = off), `data-logos` (default `glb:models/icon-surfboard.glb,ph:beer-stein,fluent-emoji-high-contrast:dog-face,ph:film-slate,ph:music-notes`; `glb:models/icon-x.glb` = your own 3D model (any GLB, merged + black metal), `surfboard` = built 3D board, `ph:name` = Phosphor icon, `set:name` = any Iconify icon, plain slug = brand logo), `data-orbit-w` (0.8 of screen half-width), `data-logo-size` (0.2). `data-look` = `orbit` (same faceted dark chrome as the Services astronaut, `data-exposure` 1.1) | `textured` (all black metal, `data-metal-color`) | `chrome`, `data-bright` (0.9), `data-roughness` (0.14), `data-env` (reflection strength 1.5). Script `wb-about-astro.js`.

**About hero (astronaut head)**
- `data-wb-about-astro` with `data-mode="head"` on an absolute div filling the hero: the helmet in profile fills the screen height. Tune `data-head-x` / `data-head-y` (0–1 of the hero), `data-head-size` (0.72), `data-head-yaw` (-1.45 = profile facing left).
- Head stays visible while scrolling (slow parallax): `data-parallax` (0.35). `data-galaxy="0"` hides the stars, `data-light="#ff9a5a"` tints the reflections.
- Background: empty div `data-wb-dust` — near-black with grey bokeh dust along a diagonal band, drifting + mouse depth (`data-density`, `data-speed`, `data-mouse`, `data-bg`, `data-band`). Abyss is off on this page.
- `data-wb-clock` = live time, `data-wb-progress` = page scroll %.

**Services hero (orbit)**
- Empty div `data-wb-orbit` — position:fixed, inset 0, z-index 0; give the page sections position:relative + z-index 1 so they scroll over it. The astronaut stays in view; the logos scroll away with the hero section (`data-logos-scroll="fixed"` keeps them too). Script `wb-orbit.js`.
- `data-logos` = Simple Icons slugs (default `greensock,figma,webgl,webflow,shopify`), `data-speed`, `data-mouse`, `data-astro` (0 = no astronaut), `data-astro-size` (1.7), `data-astro-y` (-2.2 = how far down), `data-rings="1"` (orbit lines, off by default), `data-accent` (fill light colour, white), `data-shadow` (0.16 = shadow strength).
- Grain: empty div `data-wb-grain` (`data-opacity`, `data-fps`, `data-blend`). Page background is set in the Designer (#f3f2ee).

## Versions (safe updates)
1. On GitHub: repo → Releases → "Create a new release" → tag e.g. `v21` → Publish.
2. Test page: point its footer script to `https://cdn.jsdelivr.net/gh/wuppie/wubble@v21/wubble-v20.js`.
3. Happy? Change the live page's script to `@v21`. Problem? Change it back to the previous tag.
Tagged versions never change, so no cache purge is needed.


**About page (wb-about.js + wb-about-astro.js)**
- Hero: `h1[data-wb-year]` with two masked spans `[data-wb-year-l]` / `[data-wb-year-r]` (rise in, drift apart on scroll, `data-drift` vw). Head: `data-wb-about-astro` with `data-look="mono"` (matte grey head fading to black; `data-tone`, `data-key` light, `data-cut` (0.06) / `data-cut-soft` (0.2) neck fade).
- Text: `data-wb-lines` on any paragraph/title = line-by-line mask reveal (`data-delay` ms).
- Gallery: section `data-wb-gallery` (tall, e.g. 280vh) → sticky `data-wb-gallery-stage` → `data-wb-gallery-track` → `data-wb-gallery-item` tiles (put a CMS image inside). Options: `data-cols`, `data-rows`, `data-tile`, `data-spin`, `data-blur`. Drag to spin.
- FAQ: `data-wb-faq-item` > `data-wb-faq-q` (button) + `data-wb-faq-a` (answer), optional `data-wb-faq-icon`.
- `data-wb-fit` = text fills its parent's width (email line).

**Ink cursor (all pages except the homepage, which has its own)**
- Load `wb-cursor.js` site-wide. Off on a page: `data-wb-cursor-off` on html. Linger: `window.WB_INK_LINGER` (0.6).

- About hero circuit: empty div `data-wb-circuit` (fixed, behind) — `data-opacity` 0.4, `data-density`, `data-width`, `data-pulse`, `data-speed`, `data-fade` (vh). Astronaut volume echo: `data-volume="1"`, `data-volume-spread` 1.6, `data-volume-falloff` 0.86.

- About images: each `figure[data-wb-img-reveal]` > clipping div (overflow hidden) > image with `data-wb-parallax="0.12"`. Mask wipes up + image settles from 1.25 on scroll-in, then drifts.


**Blur titles (every h1)**
- Load `wb-blurtitle.js` site-wide: each h1 smears into a rotational blur around the cursor (DOM text stays for SEO). Opt out: `data-wb-blur="off"`. Tune: `data-wb-blur-amount` (0.7), `data-wb-blur-radius` (0.5 of screen height). Only h1s with a font size of 90px+ blur (window.WB_BLUR_MIN_PX); force a smaller one with `data-wb-blur="on"`. Letter-split hero titles are skipped.

- About work grid: 4 columns, each with `data-wb-col-speed` (e.g. 0.06 / -0.04) drifting at its own speed; tiles are `figure[data-wb-img-reveal]` with caption (title + duration).
