# Metorom v3

The October 28–29, 2026 revision of the sculptural site. The previous version and every earlier study remain in source. The production build includes this site's Home, Philosophy, Contact and Event pages, the root redirect, and compatibility redirects. Design details and specifications are integrated into Home; their previous standalone URLs redirect to the matching sections.

The visual direction uses deep blue (`#101d8f`), white, pale blue instrument surfaces and flat editorial transitions. The original floating capsule navbar and rounded gallery cards are preserved; other editorial sections use flat transitions. The original supplied product imagery remains intact.

Leveled listening has three permanently open driver explanations and comparable schematic sine waves. These illustrate pitch; they are not measurements or recordings. Divider lines, wave baselines and pause controls have been removed. Wave motion runs once for under five seconds and reduced-motion remains static. The illustrative audio charts use their full card width without count badges; the separate REW image plots have been removed from the page and published assets.

The original coverflow gallery sits at the bottom of the page with a wider layout and larger cards. It advances every six seconds while visible, supports wheel flicks, swipes, keyboard navigation, pagination and image enlargement, and respects focus/hover pauses and reduced motion. The section index stays in its side rail. The slideshow pause control is removed; automatic advance still respects focus, hover and reduced motion. Existing render assets provide three slides until the owner supplies gallery photographs; uploaded gallery images still take precedence.

The speaker section follows the natural video height instead of a viewport-height minimum. A stable square frame matches the supplied poster and exploded clips; wide preview clips compensate only for their encoded letterboxing. This removes the abrupt CSS scale change and keeps all exploded parts visible. The on-video Subwoofer and Left midrange hotspots open their supplied exploded-view films and hold the final frame; X or Escape plays the matching return film. The separate left-column control list and instructions are removed.

One six-row specification sheet covers the three-way system, 1 × LAB 12, 2 × Alpha 6A in parallel, 1 × BMS 4540ND with horn, 96 kHz FIR/parametric EQ and 798 × 600 × 340 mm dimensions (W × H × D). The long electronics tables, construction, spacing, latency and development details are removed. Square actions are solid blue on light surfaces and white on blue surfaces. Decorative divider lines are removed while the index rule and functional loading progress remain.

The loading screen uses the supplied Newton component. A shared queue prepares images, fonts and all twelve animation clips, then reuses Blob URLs for playback. Progress counts completed resource tasks. A Continue control appears after five seconds, and a twenty-second deadline releases a stalled connection. Hero and poster WebP copies together are about 110 KB; their original PNGs are preserved.

React, TypeScript, Tailwind, Motion, the `@/` alias and shadcn's `components/ui` structure were already configured. The supplied loader is in `components/ui/loader.tsx` with its easing helper and `lib/utils.ts`.

Use `npm run dev` for development, `npm run typecheck`, `npm run build`, and `node tools/check-v3-build.mjs` for validation. Preview the production output with `npm run preview`. The base URL remains `/Metorom/`.

Published copy is isolated in `public/content/sculptural-v3-*.json`. Preview editors use separate v3 browser storage. The owner can open `?edit=1` directly; visitors no longer see an editor or study chooser link in the footer.

The home introduction explains leveled listening, independent driver enclosures, and room tuning in three brief paragraphs without navigation buttons. One supplied glass folder sits inside the speaker section beside the existing video. Its Horn, Midrange and Bass files open inline function, design and material notes below that row, alongside renders and the actual assembly drawings. The original horn PDF is available to view. Measurements contains one compact eight-row sheet including materials and finish, beside the existing illustrative response charts. Philosophy retains its dedicated page and footer link without an extra home-page button. English/Japanese and the existing preview editors remain available; the inline design editor uses `?edit=1&editor=design`.

Confirmed materials are MDF for the main and midrange structures and locally sourced Japanese wood for the horn; both are sealed, primed, painted and clear-coated. No wood species or unverified performance rating is inferred. Page-copy loading shares only navigation and brand fields from home so each page keeps its own heading and introduction.

The mobile hero pattern uses a 4.5 CSS-pixel dot pitch and a wider view of the wave field to keep the stippling distinct. Desktop rendering remains unchanged. WebGL and the canvas fallback both account for rendering pixel ratio.
