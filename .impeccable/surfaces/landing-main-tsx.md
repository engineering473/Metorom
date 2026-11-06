---
version: 1
slug: "landing-main-tsx"
primary_target: "landing/main.tsx"
related_targets: ["index.html","components/ui/inversion-circle-scroll-animation.tsx","landing/landing.css"]
---

# Metorom landing

Mode: Persuade. A first visit introduces the acoustic-space design business and its philosophy; the persistent navbar provides immediate access to the existing speaker product. Japanese defaults, with English available through the shared language control. User supplied all underlying concepts and the inversion-circle interaction. Existing product assets provide physical context without adding claims.

## Direction contract

THESIS: Sound changes the relationship between people and space. A rising circle becomes the page's field of resonance, followed by the supplied mission, values, vision and Japan narrative.

OWN-WORLD: Extend the current product's white, pale blue, navy and Metorom blue surfaces, light Manrope type, original logo, floating capsule navbar, square blue actions and interactive wordmark. Existing blue-theme.css is current visual authority; DESIGN.md describes an earlier study and is preserved.

STORY: Introduce acoustic-space design, explain the stimulation society and human listening, show human-centered and modular values, then Play/Replay/Perform and Japan's cultural role. End with the real speaker and conversation routes.

FIRST VIEWPORT: The existing floating navbar sits above a spacious centered two-line statement and concise business description. A blue circle rises from the lower viewport on scroll and inverts the lettering to white before expanding across the screen. A visible product link remains available immediately.

FORM: User-pinned code-led inversion-circle sequence, followed by open editorial sections and supplied product photography. Seed: not run; the user specified the interaction, visual system and content. Use document scrolling for existing navigation compatibility; reduced motion presents the content without the long pinned sequence.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation and documentation

Implemented in `landing/main.tsx`, `landing/landing.css`, `landing/copy.ts` and `components/ui/inversion-circle-scroll-animation.{tsx,css}`. The supplied rising/expanding circle uses document scrolling and a sticky hero so the incumbent navbar, page progress and anchors continue to work. Its blue field, Manrope typography and shared navbar/footer extend the current `blue-theme.css` world. Reduced motion removes the long pinned sequence; the duplicate inversion lettering is decorative, and both hero links have a two-color keyboard focus indicator.

The new `/` introduces the full supplied Japanese/English story, with Japanese as the first-visit default and the shared persistent language control. The existing product remains at `/product/`, reached directly from the navbar and hero/closing actions. Existing contact, event and philosophy pages remain available; legacy sculptural URLs and root product hashes preserve access to the product and its sections.

Raster provenance: `public/images/gallery-speakers/dscf3008-edited.webp` is the existing user-supplied lakeside loudspeaker photograph; `public/images/concepts/speaker-render-front-v3.webp` is the existing supplied product render. Both are reused unchanged, alongside the existing shared logo. No new/generated raster or stock imagery was added. Installation, copy, routes, accessibility behavior and local check commands are documented in `landing/README.md`; no additional dependencies were introduced.

Final verification passed typecheck, production build and `tools/check-v3-build.mjs`. `tools/check-landing.mjs` passed desktop, phone and reduced-motion/blocked-storage cases, including both hero links' focus before/during/after inversion and old root product-anchor compatibility; `/product/` regression checks passed all nine cases. Evidence is in `.impeccable/review/landing/` and `.impeccable/review/site-polish/`, with final outcomes in their `results.json` files. Independent finish verdict: **Ship**; the sole keyboard-focus finding was resolved, with no listed material findings remaining.

Global documentation was preserved: `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` already had edits before this pass. The latter two describe the earlier green sculptural study, whereas current source is blue/white/navy; this pre-existing drift was recorded without rewriting the global world. This section documents the finished extension while retaining the direction contract above.
