# Wubble → Webflow: native build plan

Goal: the whole site as normal Webflow Designer work. Every colour, font size, spacing value, section, form and text is an element with a class you can edit. Scripts only add effects through `data-wb-*` attributes; they never set your styles.

Decisions (2026-10-30): **Client-First** class naming · built **beside** the current pages in "Wubble 2.0" · published to **staging first** (wubble-2-0.webflow.io), wubble.nl only after your review.

## 1. Foundation (variables first, so every class points at a variable)

| Collection | Variables |
|---|---|
| Colors | `color/neutral/black` #0e0e0d · `…/darkest` #060607 · `…/dark` #18181a · `…/light` #f3f2ee · `…/white` #f2f1ee · `…/grey` #5a5c60 · `color/accent/green` #2fd27a · `color/accent/yellow` #f6d44a |
| Typography | `font/primary` Switzer · `font/mono` JetBrains Mono · the 10 sizes from wb-type.css (`size/display`, `size/xl`, `size/h1`, `size/h2`, `size/h3`, `size/lead`, `size/body`, `size/eyebrow`, `size/small`, `size/label`) |
| Spacing | `space/edge` 40px (24px on mobile) · section paddings small / medium / large · gaps |

Global Client-First classes: `page-wrapper`, `main-wrapper`, `padding-global`, `padding-section-small|medium|large`, `container-small|medium|large`, `heading-style-h1…h6`, `heading-style-display`, `text-size-large|medium|small|tiny`, `text-color-*`, `text-style-eyebrow`, `button` + `is-secondary` / `is-icon` / `is-white`.

## 2. Shared components (edit once, changes everywhere)

- **Navbar** (logo, status, sound toggle, menu button) and **Menu overlay** (links, let's talk, socials)
- **Footer** (headline, columns, Ask AI icons, cookie settings, privacy, glass email)
- **Button** with props: text, link, style
- **FAQ item** with props: question, answer
- **Plan card** and **Package card** with props: name, price, tagline, items, button
- **Service row** with props: number, title, link

## 3. Pages (in this order)

1. Services
2. Webflow Development (retainers)
3. Web & UX Design (packages)
4. About
5. Contact
6. Retainer Inquiry
7. Website Inquiry
8. Privacy
9. Work + Projects template (CMS: the 5 projects already in the "Projects" collection)
10. **Home last**: it is the live page; the new one replaces it only after you approve

Each page: sections named `section_[name]` (e.g. `section_services-hero`, `section_plans`, `section_faq`), inner elements `[name]_[part]` (e.g. `plans_card`, `plans_price`).

## 4. Forms

Native Webflow forms (so submissions, notifications and the success/error message are yours to edit in the Designer):

- **Contact**: Name, Email, Company, Service, Budget, Project (all required)
- **Retainer Inquiry**: Full name, Work email, Website URL, Plan, What would you like help with? (all required)
- **Website Inquiry**: Full name, Work email, Current website (optional), Package, What are you building?, Launch timing (required)

## 5. Effects and scripts

All `modules22/*.js` load from GitHub through jsDelivr, pinned to a commit (as now). Each effect is switched on by an attribute on a normal element: `data-wb-glasslogo`, `data-wb-curveloop`, `data-wb-reflect`, `data-wb-bouncecards`, `data-wb-float`, `data-wb-glasstext`, `data-wb-waves`, `data-wb-rowhover`, `data-wb-btn`, and so on. Remove the attribute and the effect is off; the element and its styling stay yours.

**Needed from you first:** upload the current `wubble` folder to GitHub main (as before). I then pin the new commit.

## 6. SEO

Titles, descriptions, Open Graph and JSON-LD go in each page's settings (not in code), so you can edit them in Page settings. `llms.txt` is uploaded via site settings.

## 7. Launch

1. Publish to staging only
2. You review every page
3. Swap the homepage and publish to wubble.nl + www.wubble.nl
