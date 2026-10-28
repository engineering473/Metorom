# Metorom v3

The October 28, 2026 revision of the sculptural site. The previous version and every earlier study remain in source. The production build includes only this site, its Contact, Event and Philosophy pages, the root redirect, and compatibility redirects from the old sculptural URLs.

The visual direction uses deep blue (`#101d8f`), white, pale blue instrument surfaces and flat editorial transitions. Rounded panels are limited to the audio charts. The original supplied product imagery remains intact.

Leveled listening has three permanently open driver explanations and comparable schematic sine waves. These illustrate pitch; they are not measurements or recordings. Original REW plot assets are now available within this site so visitors do not need an older study.

The gallery fills the viewport, advances every six seconds while visible, and supports native scrolling, swipes, keyboard navigation and manual controls. It pauses on focus/hover and respects reduced motion. The section index becomes a horizontal strip in the gallery. Existing render assets provide three slides until the owner supplies gallery photographs; uploaded gallery images still take precedence.

The loading screen uses the supplied Newton component. A shared queue prepares images, fonts and all ten animation clips, then reuses Blob URLs for playback. Progress counts completed resource tasks. A Continue control appears after five seconds, and a twenty-second deadline releases a stalled connection. Hero and poster WebP copies together are about 110 KB; their original PNGs are preserved.

React, TypeScript, Tailwind, Motion, the `@/` alias and shadcn's `components/ui` structure were already configured. The supplied loader is in `components/ui/loader.tsx` with its easing helper and `lib/utils.ts`.

Use `npm run dev` for development, `npm run typecheck`, `npm run build`, and `node tools/check-v3-build.mjs` for validation. Preview the production output with `npm run preview`. The base URL remains `/Metorom/`.

Published copy is isolated in `public/content/sculptural-v3-*.json`. Preview editors use separate v3 browser storage. The owner can open `?edit=1` directly; visitors no longer see an editor or study chooser link in the footer.
