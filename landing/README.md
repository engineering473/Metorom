# Metorom landing

The root landing introduces Metorom's acoustic-space design work through the supplied mission, values, vision and Japan story. It extends the current product site's blue, white and navy visual system.

## Routes and source

| Route | Purpose |
| --- | --- |
| `/` | New landing; entry point `index.html`, implementation `landing/main.tsx` |
| `/product/` | Existing Ground Sound I product experience |
| `/contact/` | Existing conversation/contact page |
| `/event/` | Existing event page |
| `/philosophy/` | Existing philosophy page |

`vite.config.js` builds these five clean public pages. The original product implementation remains in `concepts/monochrome/sculptural-v3/`; the landing uses its shared `Navbar1`, language control and footer. The landing navbar's Product link and hero/product-section actions go directly to `/product/`; conversation actions go to `/contact/`.

Published legacy `sculptural-v2` and `sculptural-v3` page URLs redirect to their corresponding clean routes, preserving query parameters and deep links. Their former index pages lead to `/product/`; the old design and specifications URLs lead to its architecture and measurements sections. Root product anchors (`architecture`, `object`, `measurements`, `listening`, `listening-design`, `philosophy`, `conversation`) also redirect to `/product/` with the original query and hash.

## Circle adaptation and visual continuity

`components/ui/inversion-circle-scroll-animation.tsx` adapts the supplied two-phase React animation to normal document scrolling. A sticky hero occupies a `300svh` track: the circle first rises, then grows to fill the viewport. A clipped white lettering layer provides the inversion. The duplicate lettering is hidden from assistive technology and contains no duplicate interactive links. The following concept section changes from blue to white as it enters view.

Normal document scrolling keeps the existing navbar's page progress, section links and mobile navigation compatible with the long landing. It replaces the prompt component's nested scroll container. The hero keeps a direct product link available without requiring completion of the animation.

The circle uses the incumbent Metorom blue (`--sc-accent`); the page reuses `blue-theme.css`, light Manrope typography, the supplied logo, the floating capsule navbar, navy sections and square blue actions. Japanese uses the existing system font fallbacks. Keyboard focus on both hero links uses a white outline with a blue outer ring so it remains visible before, during and after inversion.

With `prefers-reduced-motion: reduce`, the circle and duplicate layer are hidden, the long pinned track becomes a regular hero, and the concept content appears on white without a color transition. Desktop grids stack on small screens.

## Bilingual copy

All landing narrative and metadata live in `landing/copy.ts` as typed Japanese and English dictionaries. Japanese is the first-visit default. The shared control in `concepts/monochrome/sculptural-v3/language.ts` updates the document language and stores the choice under `metorom-sculptural-language`; `?lang=ja` or `?lang=en` takes precedence. Language remains usable in the current tab if browser storage is blocked. The landing title and description update with the selected language.

## Assets and dependencies

The landing is deliberately image-free: it presents Metorom's philosophy through type alone. The only raster it loads is the existing shared navbar logo (`public/images/taste-v2/metorom-logo.webp`). The product photography and renders live on `/product/`.

No new raster imagery, generated imagery or stock photography was added. Decorative circle, module and wave studies use CSS. Existing product assets and media remain in place.

No additional dependencies are required. React, TypeScript, Tailwind, Lucide and the existing shared navigation dependencies were already present. `components.json` already defines the shadcn-compatible aliases, and Vite/TypeScript resolve `@/` to the project root. The circle component lives in the existing `components/ui/` directory.

## Local verification

Run from the project root:

```sh
npm run dev -- --host 127.0.0.1
npm run typecheck
npm run build
node tools/check-v3-build.mjs
```

For the built-site browser checks, keep a preview server running in another terminal, then supply its origin:

```sh
npm run preview -- --host 127.0.0.1 --port 5184
node tools/check-landing.mjs http://127.0.0.1:5184/
node tools/check-site-polish.mjs http://127.0.0.1:5184/product/
```

The browser scripts use Microsoft Edge and the bundled Playwright runtime by default. Set `PLAYWRIGHT_MODULE` to another available Playwright module path when needed; the site itself gains no dependency.

Final verification passed typecheck, production build and `check-v3-build` integrity checks. The landing browser checks passed desktop, phone, and reduced-motion/blocked-storage cases, including bilingual copy, overflow, navigation, language persistence, circle geometry, both hero links' focus before/during/after inversion, and old root product-anchor compatibility. Product regression checks passed all nine cases. Browser evidence and current results are in `.impeccable/review/landing/` and `.impeccable/review/site-polish/`; `results.json` records the final outcome, while earlier failure screenshots may remain alongside the final captures. The independent finish verdict was **Ship** after the focus indicator finding was resolved.

## Documentation boundary

Current source authority for this extension is `concepts/monochrome/sculptural-v3/blue-theme.css` and the shared product components. The existing root `DESIGN.md` and `.impeccable/design.json` describe an earlier green sculptural study; that drift predates this landing. Existing edits to those files and `PRODUCT.md` were preserved. Landing-specific direction and implementation notes are in `.impeccable/surfaces/landing-main-tsx.md`.
