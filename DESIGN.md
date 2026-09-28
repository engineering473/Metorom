---
name: Metorom website studies
description: Five separate visual systems for one evolving listening instrument
colors:
  monochrome-ground: "#f6f6f3"
  monochrome-ink: "#171a18"
  monochrome-accent: "#365d94"
  warm-ground: "#eee8dd"
  warm-ink: "#32271f"
  colour-ground: "#f8f8f5"
  colour-rust: "#b55338"
  haze-ground: "#edf4f4"
  haze-ink: "#143744"
  dark-ground: "#090b09"
  dark-ink: "#f0f3e9"
  dark-accent: "#c7fc69"
typography:
  monochrome-display:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 300
    letterSpacing: "-0.06em"
  warm-display:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 400
    letterSpacing: "-0.07em"
  colour-display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontWeight: 500
  haze-display:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 300
  haze-italic:
    fontFamily: "Newsreader, serif"
    fontWeight: 400
  dark-data:
    fontFamily: "IBM Plex Mono, monospace"
    fontWeight: 400
---

# Design System: Metorom Website Studies

## Overview

These are ten competing design systems, not one theme with ten skins. Every family has an Impeccable and a Taste variant that changes composition, reading order, and content emphasis. The common product truth comes from [PRODUCT.md](PRODUCT.md); the local visual reference notes are in [site-families.md](design/inspiration/pinterest/site-families.md). The ten concept pages intentionally contain no images. Flat CSS media slots hold the exact space for future hero and supporting imagery.

The design read is a product and brand exploration for listeners and design-conscious collaborators. Layouts must make the engineering concrete while staying engaging enough to invite a future listening event.

## Colors

Each family owns its palette in `concepts/<family>/family.css`. Monochrome uses off-white, ink, and a single restrained blue accent. Warm uses cream, beige, and brown. Colour uses neutral ground and one repeated rust hue. Haze uses blue and apricot washes on a pale ground, with no purple. Dark uses near-black and one acid-green signal accent. The comparison gallery uses neutral paper to avoid favoring a candidate.

## Typography

Fonts are self-hosted with `@fontsource` Latin subsets. Manrope carries the restrained product and dark system; DM Sans carries the warm, catalogue, and haze copy; Barlow Condensed scales into the catalogue wordmark and dark poster type; IBM Plex Mono marks technical data; Newsreader italic is reserved for the haze family's stated serif contrast. Labels are at least 12 px in the final concept pages; large display type provides the primary graphic when imagery is absent.

## Layout

| Family | Impeccable structure | Taste structure | Reserved hero position |
| --- | --- | --- | --- |
| Monochrome | Sculpture-like lone object beside sparse copy; rules and specs | Type-led engineering index and broad product plate | Right-side portrait / wide product plate |
| Warm | Framed full-bleed room with an editorial information panel | Edge-to-edge room stage with overlaid narrative | Full-bleed architectural room in both |
| Colour | Oversized wordmark and modular product tiles | Lifestyle-led entry followed by catalogue | Product cut-out tiles / full-width lifestyle stage |
| Haze | Centered light headline, wide media stage, ruled stats | Split portrait media and persistent chapter rail | Wide central stage / right portrait stage |
| Dark | Annotated instrument console and specification ledger | Indexed field-note poster with broad object stage | Front-elevation frame / broad technical image stage |

At phone widths the major grids collapse into one column; no page may scroll sideways. The current build has been checked at 320 and 390 px. Product statistics and accordions keep their reading order when they stack.

## Elevation & Depth

Monochrome, warm, and colour use flat planes, rules, and negative space. Haze uses restrained translucent panels over soft static blue/apricot washes; media placeholders remain flat. Dark uses a small amount of acid-green glow as instrument light around rules and readouts, never a filled neon card. No family uses drop shadows as generic card decoration.

## Shapes

Monochrome, warm, colour, and dark lean on square corners or fine radii appropriate to their reference family. Haze uses rounder glass containers and pill badges/buttons, with the large media slot remaining a calm flat field. The gallery's preview diagrams are CSS shapes rather than images or intended final content.

## Components

The shared `src/concept-runtime.js` drives a thin full-page progress line with a passive scroll listener and a single animation-frame update. Expandable notes use native `<details>` and `<summary>`. Event facts show unconfirmed venue, date, and tickets plainly, and event links lead to the previously built full event pages. Every page links back to the ten-study gallery and remains keyboard navigable.

The owner's 21st bookmarks informed structure rather than copied code: [Stats Bento](https://21st.dev/@uilayout.contact/components/stats-bento) guided mixed-size evidence and ruled metric blocks; [Bento Grid 01](https://21st.dev/@avanishverma4/components/bento-grid-01) informed the catalogue's modular rhythm; [Sonar Grid](https://21st.dev/@n1m4mz/components/sonar-grid) informed restrained signal detailing in the dark system. Header and navbar bookmarks informed small navigation patterns. The 21st account has no current AI generation or component-retrieval credits, so these pages are native HTML/CSS implementations.

## Do's and Don'ts

- Preserve each family's pinned visual rules and keep the two variants structurally different.
- Keep hero placeholders flat and exactly sized for future image replacement; do not generate or source imagery for the ten studies.
- Keep the palette limited within each site and avoid a purple gradient, generic rounded feature cards, icon grids, and default Inter/system-only typography.
- Preserve Metorom's confirmed technical facts and label event details as pending until confirmed.
