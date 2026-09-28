# Metorom website directions

The [ten-study gallery](concepts/index.html) compares five website families, each with two structurally distinct variants. Hero images are intentionally deferred. Every new study uses a flat CSS media placeholder sized and positioned for future imagery; no image is generated or sourced for these ten pages.

| Family | Impeccable | Taste |
| --- | --- | --- |
| Monochrome product minimal | [The Object](concepts/monochrome/impeccable/index.html) | [Open by Design](concepts/monochrome/taste/index.html) |
| Warm architectural editorial | [A Room to Listen In](concepts/warm/impeccable/index.html) | [Sound Belongs Somewhere](concepts/warm/taste/index.html) |
| Colour-led tile catalogue | [Object Catalogue](concepts/colour/impeccable/index.html) | [Sound in Place](concepts/colour/taste/index.html) |
| Soft gradient haze | [Atmosphere](concepts/haze/impeccable/index.html) | [Listening Report](concepts/haze/taste/index.html) |
| Dark cinematic HUD | [Instrument](concepts/dark/impeccable/index.html) | [Field Notes](concepts/dark/taste/index.html) |

The source references and design rationale are recorded in [site-families.md](design/inspiration/pinterest/site-families.md), [PRODUCT.md](PRODUCT.md), and [DESIGN.md](DESIGN.md). Shared concept behaviour lives in `src/concept-runtime.js`; each family owns its own CSS and page structure. Local `@fontsource` packages provide the typography without a live font service. The 21st bookmarked components informed hierarchy and navigation details; the free account currently has no component retrieval or AI generation credit, so the implementation is native HTML/CSS.

Three complete versions of the Metorom website live in separate folders:

| Version | Home | Event | Direction |
| --- | --- | --- | --- |
| Atelier | versions/atelier/index.html | versions/atelier/event.html | Warm editorial typography and paper tones |
| Signal | versions/signal/index.html | versions/signal/event.html | Dark instrument interface and electric color |
| Journey | versions/journey/index.html | versions/journey/event.html | Expressive blue and coral visual storytelling |

The repository root links to both the ten new studies and the three previous interactive versions. All pages are built together by Vite. The interactive versions have their own page structures and theme stylesheets; they share the responsive viewer, sound, Silk Road path behavior, language controls, full-page scroll progress, and model loading progress.

## Run locally

Requires a current Node.js version supported by Vite 8.

    npm ci
    npm run dev

Open the URL shown by Vite. The root gallery links to the concept gallery and the three interactive versions. To build all 18 pages:

    npm run build
    npm run preview

The Vite base path is /Metorom/ for this repository's GitHub Pages URL. If the repository name changes, update base in vite.config.js.

## Structure

- index.html: design chooser
- concepts/index.html: gallery comparing all ten image-free studies
- concepts/{monochrome,warm,colour,haze,dark}/{impeccable,taste}/: ten website studies
- concepts/*/family.css: self-contained type, colour, and layout for each family
- src/concept-runtime.js: lightweight full-page scroll progress for the studies
- versions/{atelier,signal,journey}/: separate home and event pages
- src/home.html, src/event.html: Atelier page structure and English/Japanese copy
- src/home-signal.html, src/event-signal.html, src/signal.css: Signal
- src/home-journey.html, src/event-journey.html, src/journey.css: Journey
- src/atelier.css: additional Atelier visual treatment
- src/main.js: language, navigation, asset paths, model progress, and page wiring
- src/site.css: responsive layout and three visual themes
- src/scene.js: scroll-controlled Three.js speaker model; sleeps while offscreen
- src/silk-road.js: path-derived markers and scroll narrative
- src/sound.js: optional Web Audio cues and oscilloscope canvas
- public/models/assembly.glb: speaker model
- public/images/: product render and measurement plots

Sound starts only after the visitor enables it. Reduced-motion settings are respected. Expandable information uses native details elements. The speaker component descriptions are in a separate rail so they cannot cover the canvas. The full-page progress line follows document scroll, while the speaker viewer has a separate load bar that reaches 100% only after the model is prepared.

## Content that still needs real details

The event page is a concept. Date, venue, price, and booking are explicitly marked “to be announced.” The contact section also awaits a real contact address. Update this content when it is confirmed; do not publish made-up details.

The Null Society reference uses licensed Maxeville Mono. This repository uses system typefaces instead of including that font without a license. If a license becomes available, the type stack can be updated in src/site.css.
