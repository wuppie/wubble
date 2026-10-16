# Wubble V22 → Webflow (release r14)

## 1. Upload to GitHub (repo wuppie/wubble, branch main)
Upload the **contents** of this `upload/` folder to the repo root, keeping the folders:
- `wubble-v22-r14.js` (root)
- `modules22/` (19 files)
- `models/` (all files)
- `img/smoke.png`

Then create a release: GitHub → Releases → *Create a new release* → tag `v22-r14` → Publish.

## 2. Webflow — footer custom code (page settings → Before </body>)
Replace the old script line with:
```html
<script src="https://cdn.jsdelivr.net/gh/wuppie/wubble@v22-r14/wubble-v22-r14.js"
        data-base="https://cdn.jsdelivr.net/gh/wuppie/wubble@v22-r14/" defer></script>
```
Test on a duplicate page first. To roll back, point both URLs to the previous tag.

## 3. Webflow — attributes to add (Element settings → Custom attributes)
Content, classes, colours and order stay fully yours. These attributes are the only contract.

| Attribute | Put it on | What it does |
|---|---|---|
| `data-avail` | the "Awake and creative" text | switches to "Zzzzleeping" outside 09:00–18:00 Lombok time. Optional `data-avail-on="…"` / `data-avail-off="…"` for your own words |
| `data-avail-dot` | the small round light before it | green (awake) / grey (sleeping) |
| `data-about-title` | wrapper of the About title (h2 inside, words in `data-gw` spans) | ASCII "ABOUT WUBBLE" effect |
| `data-fl-word` | the footer WUBBLE heading | ASCII effect + sits behind the moon |
| `data-ft-bottom` | footer bottom row (email / ©) | placed in front of the moon |
| `data-footer-spacer` | the empty block before the footer | drives the moon landing + hero exit |
| `data-hero-front` | fixed copy of the hero title (front layer) | title glides up into the footer |
| `data-wb-ascii` | any other heading (optional) | gives it the ASCII effect |
| `data-wb-noscramble` | any text (optional) | no scroll scramble |
| `data-wb-nohover` | any link (optional) | no hover letter-roll |

Clouds layers (`data-clouds-back` / `data-clouds-front`) are created automatically if missing.
Open the live page with the console open: the script lists any attribute still missing (`wubble r14: add these attributes…`).

## 4. Settings
All Tweaks values from the design are built in as defaults. Override any of them on the root element (`data-w="root"`) as an attribute, e.g. `data-work-hold="1.2"`, `data-text-scramble="false"`, `data-footer-walk-speed="0.2"` (camelCase name → kebab-case attribute).

## 5. CMS
Unchanged: the "CMS · Projects" list feeds the slider and popup. The Work section stays pinned until every project has been shown, whatever the number of items.

## Notes
- Astronaut: still the 5.8 MB model. Replace `models/astronaut-rig.glb` with the Blender-compressed version (same name) when ready, no code change needed.
- Mute/unmute alignment is a Webflow layout setting: give the header right group the same right padding as "let's talk", no extra margin.
