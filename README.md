# MicroMelt Audio — Vite + Tailwind + Three.js

A one-page site: About Us → 3D speaker experience → About the Project →
Contact.

## Run it

```bash
npm install
npm run dev
```

## Page structure

```
About Us (static)
  ↓ scroll
3D speaker experience (pinned/sticky while scrolling through it)
  ↓ scroll
About the Project (static)
  ↓ scroll
Contact (static)
```

The 3D section uses a tall container with a `position: sticky` canvas
inside it — that's what makes it stay pinned while you scroll through its
own range, then release naturally into the next section. Its scroll
progress is calculated relative to its own position on the page (see
`updateProgress` in `src/scene.js`), not the whole document, so it doesn't
care what's above or below it.

## 3D section interactions

- **Move your mouse** — subtle parallax tilt on top of whatever rotation
  state you're scrolled to.
- **Scroll** — rotates: front (0%) → back (50%) → top (100%), via the
  `VIEWS` array in `src/scene.js`.
- **Skip button** next to the progress bar (bottom left) — jumps straight
  past the 3D section to About the Project.
- **View dots** (Front/Back/Top, right edge) — show current state, click
  to jump to one.
- **Hotspot dots** — only on 5 whitelisted parts (`HOTSPOT_NAMES` near the
  top of `scene.js`: Horn, Horn Driver Cover, Alpha 6A Right, Lab12, DSP
  Back plate). Hover for a description tooltip, click to focus.
- **Line of sight**: hotspots use a real raycast from the camera to each
  part every frame — if something else is the nearest hit, the dot hides.
  This is a genuine occlusion check now, not a rough facing-direction
  guess.
- **Click a dot → focus**: renders the full scene blurred, then re-renders
  *only* the focused mesh sharply on top (masking it out from the blur) —
  everything else stays blurred until you close focus.

## Typography & color

- Headings: `font-heading` (Helvetica Neue/Helvetica/Arial, bold).
- Body copy: `font-body` (Jost, loaded from Google Fonts).
- One accent color, `accent` in `tailwind.config.js` (`#FF4B3E`) — used
  deliberately sparingly: hotspot dots, the active view dot, the contact
  button, a couple of background accent blobs. Everything else stays
  neutral so the accent still reads as "poppy" rather than blending in.

## Descriptions

Click a hotspot dot to add/edit a description — stored in the browser via
`localStorage`, listed in the "Descriptions" panel (top right of the 3D
section) with per-item removal and a "Clear all".

## Your model

`public/models/assembly.glb` — compressed with `@gltf-transform/cli`
(texture resize + WebP, mesh simplification, Meshopt geometry
compression) while keeping every part as a separate node. See the
pipeline commands in git history / prior README revisions if you need to
re-run it on a new export — same idea: `dedup → resize → webp → weld →
simplify → meshopt`, and always check node/mesh count afterward with
`npx @gltf-transform/cli inspect` to make sure nothing got merged.

## Notes on recent fixes

- **Mesh shading**: the faceted/bad-triangulation look was flat per-face
  normals surviving from the original export, not a topology problem —
  `weld` alone doesn't fix that (it only merges bitwise-identical
  vertices). Normals are now recomputed properly: averaged per unique
  vertex *position* rather than per index, so shared surface points get
  one consistent smooth normal regardless of how the source file indexed
  them. If a future re-export still looks faceted, re-run that
  normal-averaging step before `weld`/`meshopt` — see git history for the
  script, or ask and I'll hand it over again.
- **Japan map** (bottom of Contact): real simplified coastline data (the
  four main islands — Honshu, Hokkaido, Kyushu, Shikoku — from
  `world-atlas`'s 50m-resolution dataset), not a hand-drawn shape. Kyoto's
  dot is placed from its actual coordinates (35.0116°N, 135.7681°E)
  projected the same way.
- **Tatami scene**: I don't have access to a licensed "person sitting" 3D
  asset, so the figure is a small procedural low-poly form (primitives —
  capsule torso, sphere head, folded-leg capsules) rather than an imported
  model — deliberately stylized/faceless to fit the site's abstract visual
  language instead of attempting fake realism. Swap it for a real rigged
  character in `src/tatami-scene.js` (`buildSeatedFigure()`) if you get
  one — the rest of the scene (floor, lighting, camera) doesn't depend on it.


```
speaker-explode-vite/
├── index.html          # all four sections
├── src/
│   ├── main.js           # DOM wiring: skip button, descriptions panel, inspector
│   ├── scene.js           # Three.js scene, GLB loading, rotation, hotspots, focus-blur
│   └── style.css          # Tailwind directives + hotspot/view-dot styles
├── public/
│   └── models/
│       └── assembly.glb
├── tailwind.config.js    # accent color + heading/body font tokens
├── postcss.config.js
└── vite.config.js
```
