# Metorom v3

The October 28, 2026 revision of the sculptural site. The previous version and every earlier study remain in source. The production build includes only this site, its Contact, Event and Philosophy pages, the root redirect, and compatibility redirects from the old sculptural URLs.

The visual direction uses deep blue (`#101d8f`), white, pale blue instrument surfaces and flat editorial transitions. The original floating capsule navbar and rounded gallery cards are preserved; other editorial sections use flat transitions. The original supplied product imagery remains intact.

Leveled listening has three permanently open driver explanations and comparable schematic sine waves. These illustrate pitch; they are not measurements or recordings. The illustrative audio charts remain; the separate REW image plots have been removed from the page and published assets.

The original coverflow gallery sits at the bottom of the page with a wider layout and larger cards. It advances every six seconds while visible, supports wheel flicks, swipes, keyboard navigation, pagination and image enlargement, and respects focus/hover pauses and reduced motion. The section index stays in its side rail. Existing render assets provide three slides until the owner supplies gallery photographs; uploaded gallery images still take precedence.

The speaker section follows the natural video height instead of a viewport-height minimum. A stable square frame matches the supplied poster and exploded clips; wide preview clips compensate only for their encoded letterboxing. This removes the abrupt CSS scale change and keeps all exploded parts visible. Subwoofer and Left midrange each open their supplied exploded-view film and hold the final frame; X or Escape plays the matching return film.

The loading screen uses the supplied Newton component. A shared queue prepares images, fonts and all twelve animation clips, then reuses Blob URLs for playback. Progress counts completed resource tasks. A Continue control appears after five seconds, and a twenty-second deadline releases a stalled connection. Hero and poster WebP copies together are about 110 KB; their original PNGs are preserved.

React, TypeScript, Tailwind, Motion, the `@/` alias and shadcn's `components/ui` structure were already configured. The supplied loader is in `components/ui/loader.tsx` with its easing helper and `lib/utils.ts`.

Use `npm run dev` for development, `npm run typecheck`, `npm run build`, and `node tools/check-v3-build.mjs` for validation. Preview the production output with `npm run preview`. The base URL remains `/Metorom/`.

Published copy is isolated in `public/content/sculptural-v3-*.json`. Preview editors use separate v3 browser storage. The owner can open `?edit=1` directly; visitors no longer see an editor or study chooser link in the footer.
